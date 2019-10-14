# -*- test-case-name: twext.enterprise.test.test_queue -*-
##
# Copyright (c) 2012-2017 Apple Inc. All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
##

from twext.enterprise.dal.model import Sequence
from twext.enterprise.dal.model import Table, Schema, SQLType
from twext.enterprise.dal.record import Record, fromTable, NoSuchRecord
from twext.enterprise.dal.syntax import SchemaSyntax, Call, Count, Case, Constant, Sum
from twext.enterprise.ienterprise import ORACLE_DIALECT
from twext.enterprise.jobs.utils import inTransaction, astimestamp
from twext.python.log import Logger

from twisted.internet.defer import inlineCallbacks, returnValue, Deferred
from twisted.protocols.amp import Argument
from twisted.python.failure import Failure

from datetime import datetime, timedelta
from collections import namedtuple
import time

log = Logger()

"""
A job is split into two pieces: an L{JobItem} (defined in this module) and an
L{WorkItem} (defined in twext.enterprise.jobs.workitem). Each type of work has
its own L{WorkItem} subclass. The overall work queue is a single table of
L{JobItem}s which reference all the various L{WorkItem} tables. The
L{ControllerQueue} then processes the items in the L{JobItem} table, which
result in the appropriate L{WotkItem} being run. This split allows a single
processing queue to handle many different types of work, each of which may have
its own set of parameters.
"""


def makeJobSchema(inSchema):
    """
    Create a self-contained schema for L{JobInfo} to use, in C{inSchema}.

    @param inSchema: a L{Schema} to add the job table to.
    @type inSchema: L{Schema}

    @return: a schema with just the one table.
    """
    # Initializing this duplicate schema avoids a circular dependency, but this
    # should really be accomplished with independent schema objects that the
    # transaction is made aware of somehow.
    JobTable = Table(inSchema, "JOB")

    JobTable.addColumn("JOB_ID", SQLType("integer", None), default=Sequence(inSchema, "JOB_SEQ"), notNull=True, primaryKey=True)
    JobTable.addColumn("WORK_TYPE", SQLType("varchar", 255), notNull=True)
    JobTable.addColumn("PRIORITY", SQLType("integer", 0), default=0, notNull=True)
    JobTable.addColumn("WEIGHT", SQLType("integer", 0), default=0, notNull=True)
    JobTable.addColumn("NOT_BEFORE", SQLType("timestamp", None), notNull=True)
    JobTable.addColumn("IS_ASSIGNED", SQLType("integer", 0), default=0, notNull=True)
    JobTable.addColumn("ASSIGNED", SQLType("timestamp", None), default=None)
    JobTable.addColumn("OVERDUE", SQLType("timestamp", None), default=None)
    JobTable.addColumn("FAILED", SQLType("integer", 0), default=0, notNull=True)
    JobTable.addColumn("PAUSE", SQLType("integer", 0), default=0, notNull=True)

    return inSchema

JobInfoSchema = SchemaSyntax(makeJobSchema(Schema(__file__)))


class JobFailedError(Exception):
    """
    A job failed to run - we need to be smart about clean up.
    """

    def __init__(self, ex):
        self._ex = ex


class JobTemporaryError(Exception):
    """
    A job failed to run due to a temporary failure. We will get the job to run again after the specified
    interval (with a built-in back-off based on the number of failures also applied).
    """

    def __init__(self, delay):
        """
        @param delay: amount of time in seconds before it should run again
        @type delay: L{int}
        """
        self.delay = delay


class JobRunningError(Exception):
    """
    A job is already running.
    """
    pass


# Priority for work - used to order work items in the job queue
JOB_PRIORITY_LOW = 0
JOB_PRIORITY_MEDIUM = 1
JOB_PRIORITY_HIGH = 2


class JobItem(Record, fromTable(JobInfoSchema.JOB)):
    """
    @DynamicAttrs
    An item in the job table. This is typically not directly used by code
    creating work items, but rather is used for internal book keeping of jobs
    associated with work items.

    The JOB table has some important columns that determine how a job is being scheduled:

    NOT_BEFORE - this is a timestamp indicating when the job is expected to run. It will not
    run before this time, but may run quite some time after (if the service is busy).

    ASSIGNED - this is a timestamp that is initially NULL but set when the job processing loop
    assigns the job to a child process to be executed. Thus, if the value is not NULL, then the
    job is (probably) being executed. The child process is supposed to delete the L{JobItem}
    when it is done, however if the child dies without executing the job, then the job
    processing loop needs to detect it.

    OVERDUE - this is a timestamp initially set when an L{JobItem} is assigned. It represents
    a point in the future when the job is expected to be finished. The job processing loop skips
    jobs that have a non-NULL ASSIGNED value and whose OVERDUE value has not been passed. If
    OVERDUE is in the past, then the job processing loop checks to see if the job is still
    running - which is determined by whether a row lock exists on the work item (see
    L{isRunning}. If the job is still running then OVERDUE is bumped up to a new point in the
    future, if it is not still running the job is marked as failed - which will reschedule it.

    FAILED - a count of the number of times a job has failed or had its overdue count bumped.

    The above behavior depends on some important locking behavior: when an L{JobItem} is run,
    it locks the L{WorkItem} row corresponding to the job (it may lock other associated
    rows - e.g., other L{WorkItem}'s in the same group). It does not lock the L{JobItem}
    row corresponding to the job because the job processing loop may need to update the
    OVERDUE value of that row if the work takes a long time to complete.
    """

    _workTypes = None
    _workTypeMap = None

    lockRescheduleInterval = 60     # When a job can't run because of a lock, reschedule it this number of seconds in the future
    failureRescheduleInterval = 60  # When a job fails, reschedule it this number of seconds in the future

    def descriptor(self):
        return JobDescriptor(self.jobID, self.weight, self.workType)

    def assign(self, when, overdue):
        """
        Mark this job as assigned to a worker by setting the assigned column to the current,
        or provided, timestamp. Also set the overdue value to help determine if a job is orphaned.

        @param when: current timestamp
        @type when: L{datetime.datetime}
        @param overdue: number of seconds after assignment that the job will be considered overdue
        @type overdue: L{int}
        """
        return self.update(isAssigned=1, assigned=when, overdue=when + timedelta(seconds=overdue))

    def unassign(self):
        """
        Mark this job as unassigned by setting the assigned and overdue columns to L{None}.
        """
        return self.update(isAssigned=0, assigned=None, overdue=None)

    def bumpOverdue(self, bump):
        """
        Increment the overdue value by the specified number of seconds. Used when an overdue job
        is still running in a child process but the job processing loop has detected it as overdue.

        @param bump: number of seconds to increment overdue by
        @type bump: L{int}
        """
        return self.update(overdue=self.overdue + timedelta(seconds=bump))

    def failedToRun(self, locked=False, delay=None):
        """
        The attempt to run the job failed. Leave it in the queue, but mark it
        as unassigned, bump the failure count and set to run at some point in
        the future.

        @param lock: indicates if the failure was due to a lock timeout.
        @type lock: L{bool}
        @param delay: how long before the job is run again, or C{None} for a default
            staggered delay behavior.
        @type delay: L{int}
        """

        # notBefore is set to the chosen interval multiplied by the failure count, which
        # results in an incremental backoff for failures
        if delay is None:
            delay = self.lockRescheduleInterval if locked else self.failureRescheduleInterval
            delay *= (self.failed + 1)
        return self.update(
            isAssigned=0,
            assigned=None,
            overdue=None,
            failed=self.failed + (0 if locked else 1),
            notBefore=datetime.utcnow() + timedelta(seconds=delay)
        )

    def pauseIt(self, pause=False):
        """
        Pause the L{JobItem} leaving all other attributes the same. The job processing loop
        will skip paused items.

        @param pause: indicates whether the job should be paused.
        @type pause: L{bool}
        @param delay: how long before the job is run again, or C{None} for a default
            staggered delay behavior.
        @type delay: L{int}
        """

        return self.update(pause=pause)

    @classmethod
    @inlineCallbacks
    def ultimatelyPerform(cls, txnFactory, jobDescriptor):
        """
        Eventually, after routing the job to the appropriate place, somebody
        actually has to I{do} it. This method basically calls L{JobItem.run}
        but it does a bunch of "booking" to track the transaction and log failures
        and timing information.

        @param txnFactory: a 0- or 1-argument callable that creates an
            L{IAsyncTransaction}
        @type txnFactory: L{callable}
        @param jobDescriptor: the job descriptor
        @type jobID: L{JobDescriptor}
        @return: a L{Deferred} which fires with C{None} when the job has been
            performed, or fails if the job can't be performed.
        """

        t = time.time()

        def _tm():
            return "{:.3f}".format(1000 * (time.time() - t))

        def _overtm(nb):
            return "{:.0f}".format(1000 * (t - astimestamp(nb)))

        # Failed job clean-up
        def _failureCleanUp(delay=None):
            @inlineCallbacks
            def _cleanUp2(txn2):
                try:
                    job = yield cls.load(txn2, jobDescriptor.jobID)
                except NoSuchRecord:
                    log.debug(
                        "JobItem: {workType} {jobid} disappeared t={tm}",
                        workType=jobDescriptor.workType,
                        jobid=jobDescriptor.jobID,
                        tm=_tm(),
                    )
                else:
                    log.debug(
                        "JobItem: {workType} {jobid} marking as failed {count} t={tm}",
                        workType=jobDescriptor.workType,
                        jobid=jobDescriptor.jobID,
                        count=job.failed + 1,
                        tm=_tm(),
                    )
                    yield job.failedToRun(locked=isinstance(e, JobRunningError), delay=delay)
            return inTransaction(txnFactory, _cleanUp2, "ultimatelyPerform._failureCleanUp")

        log.debug("JobItem: {workType} {jobid} starting to run", workType=jobDescriptor.workType, jobid=jobDescriptor.jobID)
        txn = txnFactory(label="ultimatelyPerform: {workType} {jobid}".format(workType=jobDescriptor.workType, jobid=jobDescriptor.jobID))
        try:
            job = yield cls.load(txn, jobDescriptor.jobID)
            if hasattr(txn, "_label"):
                txn._label = "{} <{}>".format(txn._label, job.workType)
            log.debug(
                "JobItem: {workType} {jobid} loaded {work} t={tm}",
                workType=jobDescriptor.workType,
                jobid=jobDescriptor.jobID,
                work=job.workType,
                tm=_tm(),
            )
            yield job.run()

        except NoSuchRecord:
            # The record has already been removed
            yield txn.commit()
            log.debug(
                "JobItem: {workType} {jobid} already removed t={tm}",
                workType=jobDescriptor.workType,
                jobid=jobDescriptor.jobID,
                tm=_tm(),
            )

        except JobTemporaryError as e:

            # Temporary failure delay with back-off
            def _temporaryFailure():
                return _failureCleanUp(delay=e.delay * (job.failed + 1))
            log.debug(
                "JobItem: {workType} {jobid} {desc} t={tm}",
                workType=jobDescriptor.workType,
                jobid=jobDescriptor.jobID,
                desc="temporary failure #{}".format(job.failed + 1),
                tm=_tm(),
            )
            txn.postAbort(_temporaryFailure)
            yield txn.abort()

        except (JobFailedError, JobRunningError) as e:

            # Permanent failure
            log.debug(
                "JobItem: {workType} {jobid} {desc} t={tm}",
                workType=jobDescriptor.workType,
                jobid=jobDescriptor.jobID,
                desc="failed" if isinstance(e, JobFailedError) else "locked",
                tm=_tm(),
            )
            txn.postAbort(_failureCleanUp)
            yield txn.abort()

        except:
            f = Failure()
            log.error(
                "JobItem: {workType} {jobid} exception t={tm} {exc}",
                workType=jobDescriptor.workType,
                jobid=jobDescriptor.jobID,
                tm=_tm(),
                exc=f,
            )
            yield txn.abort()
            returnValue(f)

        else:
            yield txn.commit()
            log.debug(
                "JobItem: {workType} {jobid} completed t={tm} over={over}",
                workType=jobDescriptor.workType,
                jobid=jobDescriptor.jobID,
                tm=_tm(),
                over=_overtm(job.notBefore),
            )

        returnValue(None)

    @classmethod
    @inlineCallbacks
    def nextjob(cls, txn, now, minPriority, rowLimit):
        """
        Find the next available job based on priority, also return any that are overdue. This
        method uses an SQL query to find the matching jobs, and sorts based on the NOT_BEFORE
        value and priority.

        The C{rowLimit} value is used to help with concurrency problems when the underlying DB does
        not support a proper "LIMIT" term with the query (Oracle). It should be set to no more than
        1 plus the number of app-servers in use).

        @param txn: the transaction to use
        @type txn: L{IAsyncTransaction}
        @param now: current timestamp - needed for unit tests that might use their
            own clock.
        @type now: L{datetime.datetime}
        @param minPriority: lowest priority level to query for
        @type minPriority: L{int}
        @param rowLimit: query at most this number of rows at a time
        @type rowLimit: L{int}

        @return: the job record
        @rtype: L{JobItem}
        """

        if txn.dbtype.dialect == ORACLE_DIALECT:

            # For Oracle we need a multi-app server solution that only locks the
            # (one) row being returned by the query, and allows other app servers
            # to run the query in parallel and get the next unlocked row.
            #
            # To do that we use a stored procedure that uses a CURSOR with a
            # SELECT ... FOR UPDATE SKIP LOCKED query that ensures only the row
            # being fetched is locked and existing locked rows are skipped.

            job = None
            jobID = yield Call("next_job", now, minPriority, rowLimit, returnType=int).on(txn)
            if jobID:
                job = yield cls.load(txn, jobID)
        else:
            # Only add the PRIORITY term if minimum is greater than zero
            queryExpr = (cls.isAssigned == 0).And(cls.pause == 0).And(cls.notBefore <= now)

            # PRIORITY can only be 0, 1, or 2. So we can convert an inequality into
            # an equality test as follows:
            #
            # PRIORITY >= 0 - no test needed all values match all the time
            # PRIORITY >= 1 === PRIORITY != 0
            # PRIORITY >= 2 === PRIORITY == 2
            #
            # Doing this allows use of the PRIORITY column in an index since we already
            # have one inequality in the index (NOT_BEFORE)

            if minPriority == JOB_PRIORITY_MEDIUM:
                queryExpr = (cls.priority != JOB_PRIORITY_LOW).And(queryExpr)
            elif minPriority == JOB_PRIORITY_HIGH:
                queryExpr = (cls.priority == JOB_PRIORITY_HIGH).And(queryExpr)

            extra_kwargs = {}
            if "skip-locked" in txn.dbtype.options:
                extra_kwargs["skipLocked"] = True
            jobs = yield cls.query(
                txn,
                queryExpr,
                order=cls.priority,
                ascending=False,
                forUpdate=True,
                noWait=False,
                limit=rowLimit,
                **extra_kwargs
            )
            job = jobs[0] if jobs else None

        returnValue(job)

    @classmethod
    @inlineCallbacks
    def overduejob(cls, txn, now, rowLimit):
        """
        Find the next overdue job.

        The C{rowLimit} value is used to help with concurrency problems when the underlying DB does
        not support a proper "LIMIT" term with the query (Oracle). It should be set to no more than
        1 plus the number of app-servers in use).

        @param txn: the transaction to use
        @type txn: L{IAsyncTransaction}
        @param now: current timestamp
        @type now: L{datetime.datetime}
        @param rowLimit: query at most this number of rows at a time
        @type rowLimit: L{int}

        @return: the job record
        @rtype: L{JobItem}
        """

        if txn.dbtype.dialect == ORACLE_DIALECT:
            # See L{nextjob} for why Oracle is different
            job = None
            jobID = yield Call("overdue_job", now, rowLimit, returnType=int).on(txn)
            if jobID:
                job = yield cls.load(txn, jobID)
        else:
            extra_kwargs = {}
            if "skip-locked" in txn.dbtype.options:
                extra_kwargs["skipLocked"] = True
            jobs = yield cls.query(
                txn,
                (cls.isAssigned == 1).And(cls.overdue < now),
                forUpdate=True,
                noWait=False,
                limit=rowLimit,
                **extra_kwargs
            )
            job = jobs[0] if jobs else None

        returnValue(job)

    @inlineCallbacks
    def run(self):
        """
        Run this job item by finding the appropriate work item class and
        running that, with appropriate locking.
        """

        workItem = yield self.workItem()
        if workItem is not None:

            # First we lock the L{WorkItem}
            locked = yield workItem.runlock()
            if not locked:
                raise JobRunningError()

            try:
                # Run in three steps, allowing for before/after hooks that sub-classes
                # may override
                okToGo = yield workItem.beforeWork()
                if okToGo:
                    yield workItem.doWork()
                    yield workItem.afterWork()
            except Exception as e:
                f = Failure()
                log.error(
                    "JobItem: {jobid}, WorkItem: {workid} failed: {exc}",
                    jobid=self.jobID,
                    workid=workItem.workID,
                    exc=f,
                )
                if isinstance(e, JobTemporaryError):
                    raise
                else:
                    raise JobFailedError(e)

        try:
            # Once the work is done we delete ourselves - NB this must be the last thing done
            # to ensure the L{JobItem} row is not locked for very long.
            yield self.delete()
        except NoSuchRecord:
            # The record has already been removed
            pass

    @inlineCallbacks
    def isRunning(self):
        """
        Return L{True} if the job is currently running (its L{WorkItem} is locked).
        """
        workItem = yield self.workItem()
        if workItem is not None:
            locked = yield workItem.trylock()
            returnValue(not locked)
        else:
            returnValue(False)

    @inlineCallbacks
    def workItem(self):
        """
        Return the L{WorkItem} corresponding to this L{JobItem}.
        """
        workItemClass = self.workItemForType(self.workType)
        workItems = yield workItemClass.loadForJob(
            self.transaction, self.jobID
        )
        returnValue(workItems[0] if len(workItems) == 1 else None)

    @classmethod
    def workItemForType(cls, workType):
        """
        Return the class of the L{WorkItem} associated with this L{JobItem}.

        @param workType: the name of the L{WorkItem}'s table
        @type workType: L{str}
        """
        if cls._workTypeMap is None:
            cls.workTypes()
        return cls._workTypeMap[workType]

    @classmethod
    def workTypes(cls):
        """
        Map all L{WorkItem} sub-classes table names to the class type.

        @return: All of the work item types.
        @rtype: iterable of L{WorkItem} subclasses
        """
        if cls._workTypes is None:
            cls._workTypes = []

            def getWorkType(subcls, appendTo):
                if hasattr(subcls, "table"):
                    appendTo.append(subcls)
                else:
                    for subsubcls in subcls.__subclasses__():
                        getWorkType(subsubcls, appendTo)
            from twext.enterprise.jobs.workitem import WorkItem
            getWorkType(WorkItem, cls._workTypes)

            cls._workTypeMap = {}
            for subcls in cls._workTypes:
                cls._workTypeMap[subcls.workType()] = subcls

        return cls._workTypes

    @classmethod
    def allWorkTypes(cls):
        """
        Map all L{WorkItem} sub-classes table names to the class type.

        @return: All of the work item types.
        @rtype: L{dict}
        """
        if cls._workTypeMap is None:
            cls.workTypes()
        return cls._workTypeMap

    @classmethod
    def numberOfWorkTypes(cls):
        return len(cls.workTypes())

    @classmethod
    @inlineCallbacks
    def waitEmpty(cls, txnCreator, reactor, timeout):
        """
        Wait for the job queue to drain. Only use this in tests
        that need to wait for results from jobs.
        """
        t = time.time()
        while True:
            work = yield inTransaction(txnCreator, cls.all)
            if not work:
                break
            if time.time() - t > timeout:
                returnValue(False)
            d = Deferred()
            reactor.callLater(0.1, lambda: d.callback(None))
            yield d

        returnValue(True)

    @classmethod
    @inlineCallbacks
    def waitJobDone(cls, txnCreator, reactor, timeout, jobID):
        """
        Wait for the specified job to complete. Only use this in tests
        that need to wait for results from jobs.
        """
        t = time.time()
        while True:
            work = yield inTransaction(txnCreator, cls.query, expr=(cls.jobID == jobID))
            if not work:
                break
            if time.time() - t > timeout:
                returnValue(False)
            d = Deferred()
            reactor.callLater(0.1, lambda: d.callback(None))
            yield d

        returnValue(True)

    @classmethod
    @inlineCallbacks
    def waitWorkDone(cls, txnCreator, reactor, timeout, workTypes):
        """
        Wait for the specified job to complete. Only use this in tests
        that need to wait for results from jobs.
        """
        t = time.time()
        while True:
            count = [0]

            @inlineCallbacks
            def _countTypes(txn):
                for t in workTypes:
                    work = yield t.all(txn)
                    count[0] += len(work)

            yield inTransaction(txnCreator, _countTypes)
            if count[0] == 0:
                break
            if time.time() - t > timeout:
                returnValue(False)
            d = Deferred()
            reactor.callLater(0.1, lambda: d.callback(None))
            yield d

        returnValue(True)

    @classmethod
    @inlineCallbacks
    def histogram(cls, txn):
        """
        Generate a histogram of work items currently in the queue.
        """
        from twext.enterprise.jobs.queue import WorkerConnectionPool

        # Fill out an empty set of results for all the known work types. The SQL
        # query will only return work types that are currently queued, but we want
        # results for all possible work.
        results = {}
        now = datetime.utcnow()
        for workItemType in cls.workTypes():
            workType = workItemType.workType()
            results.setdefault(workType, {
                "queued": 0,
                "assigned": 0,
                "late": 0,
                "failed": 0,
                "completed": WorkerConnectionPool.completed.get(workType, 0),
                "time": WorkerConnectionPool.timing.get(workType, 0.0)
            })

        # Use an aggregate query to get the results for each currently queued
        # work type.
        jobs = yield cls.queryExpr(
            expr=None,
            attributes=(
                cls.workType,
                Count(cls.workType),
                Count(cls.assigned),
                Count(Case((cls.assigned == None).And(cls.notBefore < now), Constant(1), None)),
                Sum(cls.failed),
            ),
            group=cls.workType
        ).on(txn)

        for workType, queued, assigned, late, failed in jobs:
            results[workType].update({
                "queued": queued,
                "assigned": assigned,
                "late": late,
                "failed": failed,
            })

        returnValue(results)


JobDescriptor = namedtuple("JobDescriptor", ["jobID", "weight", "workType"])


class JobDescriptorArg(Argument):
    """
    Comma-separated representation of an L{JobDescriptor} for AMP-serialization.
    """

    def toString(self, inObject):
        return ",".join(map(str, inObject))

    def fromString(self, inString):
        return JobDescriptor(*[f(s) for f, s in zip((int, int, str,), inString.split(","))])
