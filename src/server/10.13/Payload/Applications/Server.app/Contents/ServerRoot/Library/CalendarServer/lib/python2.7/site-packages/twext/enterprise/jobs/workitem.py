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

from datetime import datetime, timedelta
from twext.enterprise.dal.record import SerializableRecord, NoSuchRecord
from twext.enterprise.jobs.jobitem import JobItem
from twext.python.log import Logger
from twisted.internet.defer import inlineCallbacks, returnValue, succeed

log = Logger()


# Priority for work - used to order work items in the job queue
WORK_PRIORITY_LOW = 0
WORK_PRIORITY_MEDIUM = 1
WORK_PRIORITY_HIGH = 2

# Weight for work - used to schedule workers based on capacity
WORK_WEIGHT_0 = 0
WORK_WEIGHT_1 = 1
WORK_WEIGHT_2 = 2
WORK_WEIGHT_3 = 3
WORK_WEIGHT_4 = 4
WORK_WEIGHT_5 = 5
WORK_WEIGHT_6 = 6
WORK_WEIGHT_7 = 7
WORK_WEIGHT_8 = 8
WORK_WEIGHT_9 = 9
WORK_WEIGHT_10 = 10
WORK_WEIGHT_CAPACITY = 10   # Total amount of work any one worker can manage


class WorkItem(SerializableRecord):
    """
    A L{WorkItem} is an item of work which may be stored in a database, then
    executed later.

    L{WorkItem} is an abstract class, since it is a L{Record} with no table
    associated via L{fromTable}.  Concrete subclasses must associate a specific
    table by inheriting like so::

        class MyWorkItem(WorkItem, fromTable(schema.MY_TABLE)):

    Concrete L{WorkItem}s should generally not be created directly; they are
    both created and thereby implicitly scheduled to be executed by calling
    L{enqueueWork <twext.enterprise.ienterprise.IQueuer.enqueueWork>} with the
    appropriate L{WorkItem} concrete subclass.  There are different queue
    implementations (L{ControllerQueue} and L{LocalQueuer}, for example), so
    the exact timing and location of the work execution may differ.

    L{WorkItem}s may be constrained in the ordering and timing of their
    execution, to control concurrency and for performance reasons respectively.

    Although all the usual database mutual-exclusion rules apply to work
    executed in L{WorkItem.doWork}, implicit database row locking is not always
    the best way to manage concurrency.  They have some problems, including:

        - implicit locks are easy to accidentally acquire out of order, which
          can lead to deadlocks

        - implicit locks are easy to forget to acquire correctly - for example,
          any read operation which subsequently turns into a write operation
          must have been acquired with C{Select(..., ForUpdate=True)}, but it
          is difficult to consistently indicate that methods which abstract out
          read operations must pass this flag in certain cases and not others.

        - implicit locks are held until the transaction ends, which means that
          if expensive (long-running) queue operations share the same lock with
          cheap (short-running) queue operations or user interactions, the
          cheap operations all have to wait for the expensive ones to complete,
          but continue to consume whatever database resources they were using.

    In order to ameliorate these problems with potentially concurrent work
    that uses the same resources, L{WorkItem} provides a database-wide mutex
    that is automatically acquired at the beginning of the transaction and
    released at the end.  To use it, simply L{align
    <twext.enterprise.dal.record.Record.namingConvention>} the C{group}
    attribute on your L{WorkItem} subclass with a column holding a string
    (varchar).  L{WorkItem} subclasses with the same value for C{group} will
    not execute their C{doWork} methods concurrently.  Furthermore, if the lock
    cannot be quickly acquired, database resources associated with the
    transaction attempting it will be released, and the transaction rolled back
    until a future transaction I{can} can acquire it quickly.  If you do not
    want any limits to concurrency, simply leave it set to C{None}.

    In some applications it's possible to coalesce work together; to grab
    multiple L{WorkItem}s in one C{doWork} transaction.  All you need to do is
    to delete the rows which back other L{WorkItem}s from the database, and
    they won't be processed.  Using the C{group} attribute, you can easily
    prevent concurrency so that you can easily group these items together and
    remove them as a set (otherwise, other workers might be attempting to
    concurrently work on them and you'll get deletion errors).

    However, if doing more work at once is less expensive, and you want to
    avoid processing lots of individual rows in tiny transactions, you may also
    delay the execution of a L{WorkItem} by setting its C{notBefore} attribute.
    This must be backed by a database timestamp, so that processes which happen
    to be restarting and examining the work to be done in the database don't
    jump the gun and do it too early.

    @cvar workID: the unique identifier (primary key) for items of this type.
        On an instance of a concrete L{WorkItem} subclass, this attribute must
        be an integer; on the concrete L{WorkItem} subclass itself, this
        attribute must be a L{twext.enterprise.dal.syntax.ColumnSyntax}.  Note
        that this is automatically taken care of if you simply have a
        corresponding C{work_id} column in the associated L{fromTable} on your
        L{WorkItem} subclass.  This column must be unique, and it must be an
        integer.  In almost all cases, this column really ought to be filled
        out by a database-defined sequence; if not, you need some other
        mechanism for establishing a cluster-wide sequence.
    @type workID: L{int} on instance,
        L{twext.enterprise.dal.syntax.ColumnSyntax} on class.

    @cvar notBefore: the timestamp before which this item should I{not} be
        processed.  If unspecified, this should be the date and time of the
        creation of the L{WorkItem}.
    @type notBefore: L{datetime.datetime} on instance,
        L{twext.enterprise.dal.syntax.ColumnSyntax} on class.

    @ivar group: If not C{None}, a unique-to-the-database identifier for which
        only one L{WorkItem} will execute at a time.
    @type group: L{unicode} or L{NoneType}
    """

    group = None
    default_priority = WORK_PRIORITY_LOW    # Default - subclasses should override
    default_weight = WORK_WEIGHT_5          # Default - subclasses should override
    _tableNameMap = {}

    @classmethod
    def workType(cls):
        return cls.table.model.name

    @classmethod
    @inlineCallbacks
    def makeJob(cls, transaction, **kwargs):
        """
        A new work item needs to be created. First we create a Job record, then
        we create the actual work item related to the job.

        @param transaction: the transaction to use
        @type transaction: L{IAsyncTransaction}
        """

        jobargs = {
            "workType": cls.workType()
        }

        def _transferArg(name):
            arg = kwargs.pop(name, None)
            if arg is not None:
                jobargs[name] = arg
            elif hasattr(cls, "default_{}".format(name)):
                jobargs[name] = getattr(cls, "default_{}".format(name))

        _transferArg("jobID")
        _transferArg("priority")
        _transferArg("weight")
        _transferArg("notBefore")
        _transferArg("pause")

        # Always need a notBefore
        if "notBefore" not in jobargs:
            jobargs["notBefore"] = datetime.utcnow()

        job = yield JobItem.create(transaction, **jobargs)

        kwargs["jobID"] = job.jobID
        work = yield cls.create(transaction, **kwargs)
        work.__dict__["job"] = job
        returnValue(work)

    @classmethod
    @inlineCallbacks
    def loadForJob(cls, txn, jobID):
        workItems = yield cls.query(txn, (cls.jobID == jobID))
        returnValue(workItems)

    @classmethod
    def updateWorkTypes(cls, updates):
        """
        Update the priority and weight values of each specified work type.

        @param updates: a dict whose workType is the work class name, and whose
            settings is a dict containing one or both of "weight" and "priority"
            keys and numeric values to change to.
        @type updates: L{dict}
        """

        for workType, settings in updates.items():
            try:
                workItem = JobItem.workItemForType(workType)
            except KeyError:
                log.error(
                    "updateWorkTypes: '{workType}' is not a valid work type",
                    workType=workType,
                )
                continue
            if "priority" in settings:
                priority = settings["priority"]
                try:
                    priority = int(priority)
                    if not (WORK_PRIORITY_LOW <= priority <= WORK_PRIORITY_HIGH):
                        raise ValueError
                except ValueError:
                    log.error(
                        "updateWorkTypes: '{workType}' priority '{priority}' is not value",
                        workType=workType, priority=priority,
                    )
                else:
                    workItem.default_priority = priority
            else:
                priority = "unchanged"
            if "weight" in settings:
                weight = settings["weight"]
                try:
                    weight = int(weight)
                    if not (WORK_WEIGHT_0 <= weight <= WORK_WEIGHT_10):
                        raise ValueError
                except ValueError:
                    log.error(
                        "updateWorkTypes: '{workType}' weight '{weight}' is not value",
                        workType=workType, weight=weight,
                    )
                else:
                    workItem.default_weight = weight
            else:
                weight = "unchanged"
            log.info(
                "updateWorkTypes: '{workType}' priority: '{priority}' weight: '{weight}' ",
                workType=workType, priority=priority, weight=weight,
            )

    @classmethod
    def dumpWorkTypes(cls):
        """
        Dump the priority and weight values of each known work type.

        @return: a dict whose workType is the work class name, and whose
            settings is a dict containing one or both of "weight" and "priority"
            keys and numeric values to change to.
        @rtype: L{dict}
        """

        results = {}
        for workType, workClass in JobItem.allWorkTypes().items():
            results[workType] = {
                "priority": workClass.default_priority,
                "weight": workClass.default_weight,
            }

        return results

    @inlineCallbacks
    def runlock(self):
        """
        Used to lock an L{WorkItem} before it is run. The L{WorkItem}'s row MUST be
        locked via SELECT FOR UPDATE to ensure the job queue knows it is being worked
        on so that it can detect when an overdue job needs to be restarted or not.

        Note that the locking used here may cause deadlocks if not done in the correct
        order. In particular anything that might cause locks across multiple LWorkItem}s,
        such as group locks, multi-row locks, etc, MUST be done first.

        @return: an L{Deferred} that fires with L{True} if the L{WorkItem} was locked,
            L{False} if not.
        @rtype: L{Deferred}
        """

        # Do the group lock first since this can impact multiple rows and thus could
        # cause deadlocks if done in the wrong order

        # Row level lock on this item
        locked = yield self.trylock(self.group)
        returnValue(locked)

    @inlineCallbacks
    def beforeWork(self):
        """
        A hook that gets called before the L{WorkItem} does its real work. This can be used
        for common behaviors need by work items. The base implementation handles the group
        locking behavior.

        @return: an L{Deferred} that fires with L{True} if processing of the L{WorkItem}
            should continue, L{False} if it should be skipped without error.
        @rtype: L{Deferred}
        """
        try:
            # Work item is deleted before doing work - but someone else may have
            # done it whilst we waited on the lock so handle that by simply
            # ignoring the work
            yield self.delete()
        except NoSuchRecord:
            # The record has already been removed
            returnValue(False)
        else:
            returnValue(True)

    def doWork(self):
        """
        Subclasses must implement this to actually perform the queued work.

        This method will be invoked in a worker process.

        This method does I{not} need to delete the row referencing it; that
        will be taken care of by the job queuing machinery.
        """
        raise NotImplementedError

    def afterWork(self):
        """
        A hook that gets called after the L{WorkItem} does its real work. This can be used
        for common clean-up behaviors. The base implementation does nothing.
        """
        return succeed(None)

    @inlineCallbacks
    def remove(self):
        """
        Remove this L{WorkItem} and the associated L{JobItem}. Typically work is not removed directly, but goes away
        when processed, but in some cases (e.g., pod-2-pod migration) old work needs to be removed along with the
        job (which is in a pause state and would otherwise never run).
        """

        # Delete the job, then self
        yield JobItem.deletesome(self.transaction, JobItem.jobID == self.jobID)
        yield self.delete()

    @classmethod
    @inlineCallbacks
    def reschedule(cls, transaction, seconds, **kwargs):
        """
        Reschedule this work.

        @param seconds: optional seconds delay - if not present use the class value.
        @type seconds: L{int} or L{None}
        """
        if seconds is not None and seconds >= 0:
            notBefore = (
                datetime.utcnow() +
                timedelta(seconds=seconds)
            )
            log.debug(
                "Scheduling next {cls}: {when}",
                cls=cls.__name__,
                when=notBefore,
            )
            work = yield transaction._queuer.enqueueWork(
                transaction,
                cls,
                notBefore=notBefore,
                **kwargs
            )
            returnValue(work)
        else:
            returnValue(None)


class SingletonWorkItem(WorkItem):
    """
    An L{WorkItem} that can only appear once no matter how many times an attempt is
    made to create one. The L{allowOverride} class property determines whether the attempt
    to create a new job is simply ignored, or whether the new job overrides any existing
    one.
    """

    @classmethod
    @inlineCallbacks
    def makeJob(cls, transaction, **kwargs):
        """
        A new work item needs to be created. First we create a Job record, then
        we create the actual work item related to the job.

        @param transaction: the transaction to use
        @type transaction: L{IAsyncTransaction}
        """

        all = yield cls.all(transaction)
        if len(all):
            # Silently ignore the creation of this work
            returnValue(None)

        result = yield super(SingletonWorkItem, cls).makeJob(transaction, **kwargs)
        returnValue(result)

    @inlineCallbacks
    def beforeWork(self):
        """
        For safety just delete any others.
        """

        # Delete all other work items
        yield self.deleteall(self.transaction)
        returnValue(True)

    @classmethod
    @inlineCallbacks
    def reschedule(cls, transaction, seconds, force=False, **kwargs):
        """
        Reschedule a singleton. If L{force} is set then delete any existing item before
        creating the new one. This allows the caller to explicitly override an existing
        singleton.
        """
        if force:
            yield cls.deleteall(transaction)
            yield cls.all(transaction)
        result = yield super(SingletonWorkItem, cls).reschedule(transaction, seconds, **kwargs)
        returnValue(result)


class AggregatedWorkItem(WorkItem):
    """
    An L{WorkItem} that deletes all the others in the same group prior to running.
    """

    @inlineCallbacks
    def beforeWork(self):
        """
        For safety just delete any others.
        """

        # Delete all other work items
        yield self.deletesome(self.transaction, self.group)
        returnValue(True)


class RegeneratingWorkItem(SingletonWorkItem):
    """
    An L{SingletonWorkItem} that regenerates itself when work is done.
    """

    def regenerateInterval(self):
        """
        Return the interval in seconds between regenerating instances.
        """
        return None

    @inlineCallbacks
    def afterWork(self):
        """
        A hook that gets called after the L{WorkItem} does its real work. This can be used
        for common clean-up behaviors. The base implementation does nothing.
        """
        yield super(RegeneratingWorkItem, self).afterWork()
        yield self.reschedule(self.transaction, self.regenerateInterval())
