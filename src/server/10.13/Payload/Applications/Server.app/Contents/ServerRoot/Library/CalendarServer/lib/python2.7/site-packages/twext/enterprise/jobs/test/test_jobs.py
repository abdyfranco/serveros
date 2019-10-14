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

"""
Tests for L{twext.enterprise.job.queue}.
"""

import datetime

from zope.interface.verify import verifyObject

from twisted.internet import reactor
from twisted.trial.unittest import TestCase, SkipTest
from twisted.test.proto_helpers import StringTransport, MemoryReactor
from twisted.internet.defer import \
    Deferred, inlineCallbacks, gatherResults, passthru, returnValue, succeed, \
    CancelledError
from twisted.internet.task import Clock as _Clock
from twisted.protocols.amp import Command, AMP, Integer
from twisted.application.service import Service, MultiService

from twext.enterprise.dal.syntax import SchemaSyntax, Delete
from twext.enterprise.dal.parseschema import splitSQLString
from twext.enterprise.dal.record import fromTable
from twext.enterprise.dal.test.test_parseschema import SchemaTestHelper
from twext.enterprise.fixtures import buildConnectionPool
from twext.enterprise.fixtures import SteppablePoolHelper
from twext.enterprise.jobs.utils import inTransaction, astimestamp
from twext.enterprise.jobs.workitem import \
    WorkItem, SingletonWorkItem, \
    WORK_PRIORITY_LOW, WORK_PRIORITY_HIGH, WORK_PRIORITY_MEDIUM, WORK_WEIGHT_5, \
    WORK_WEIGHT_1, WORK_WEIGHT_10, WORK_WEIGHT_0
from twext.enterprise.jobs.jobitem import \
    JobItem, JobDescriptor, JobFailedError, JobTemporaryError
from twext.enterprise.jobs.queue import \
    WorkerConnectionPool, ControllerQueue, \
    LocalPerformer, _IJobPerformer, \
    NonPerformingQueuer

# TODO: There should be a store-building utility within twext.enterprise.
try:
    from txdav.common.datastore.test.util import buildStore
except ImportError:
    def buildStore(*args, **kwargs):
        raise SkipTest(
            "buildStore is not available, because it's in txdav; duh."
        )


class Clock(_Clock):
    """
    More careful L{IReactorTime} fake which mimics the exception behavior of
    the real reactor.
    """

    def callLater(self, _seconds, _f, *args, **kw):
        if _seconds < 0:
            raise ValueError("%s<0: " % (_seconds,))
        return super(Clock, self).callLater(_seconds, _f, *args, **kw)

    @inlineCallbacks
    def advanceCompletely(self, amount):
        """
        Move time on this clock forward by the given amount and run whatever
        pending calls should be run. Always complete the deferred calls before
        returning.

        @type amount: C{float}
        @param amount: The number of seconds which to advance this clock's
        time.
        """
        self.rightNow += amount
        self._sortCalls()
        while self.calls and self.calls[0].getTime() <= self.seconds():
            call = self.calls.pop(0)
            call.called = 1
            yield call.func(*call.args, **call.kw)
            self._sortCalls()


class MemoryReactorWithClock(MemoryReactor, Clock):
    """
    Simulate a real reactor.
    """

    def __init__(self):
        MemoryReactor.__init__(self)
        Clock.__init__(self)
        self._sortCalls()


def transactionally(transactionCreator):
    """
    Perform the decorated function immediately in a transaction, replacing its
    name with a L{Deferred}.

    Use like so::

        @transactionally(connectionPool.connection)
        @inlineCallbacks
        def it(txn):
            yield txn.doSomething()
        it.addCallback(firedWhenDone)

    @param transactionCreator: A 0-arg callable that returns an
        L{IAsyncTransaction}.
    """
    def thunk(operation):
        return inTransaction(transactionCreator, operation)
    return thunk


class UtilityTests(TestCase):
    """
    Tests for supporting utilities.
    """

    def test_inTransactionSuccess(self):
        """
        L{inTransaction} invokes its C{transactionCreator} argument, and then
        returns a L{Deferred} which fires with the result of its C{operation}
        argument when it succeeds.
        """
        class faketxn(object):

            def __init__(self):
                self.commits = []
                self.aborts = []

            def commit(self):
                self.commits.append(Deferred())
                return self.commits[-1]

            def abort(self):
                self.aborts.append(Deferred())
                return self.aborts[-1]

        createdTxns = []

        def createTxn(label):
            createdTxns.append(faketxn())
            return createdTxns[-1]

        dfrs = []

        def operation(t):
            self.assertIdentical(t, createdTxns[-1])
            dfrs.append(Deferred())
            return dfrs[-1]

        d = inTransaction(createTxn, operation)
        x = []
        d.addCallback(x.append)
        self.assertEquals(x, [])
        self.assertEquals(len(dfrs), 1)
        dfrs[0].callback(35)

        # Commit in progress, so still no result...
        self.assertEquals(x, [])
        createdTxns[0].commits[0].callback(42)

        # Committed, everything's done.
        self.assertEquals(x, [35])


class SimpleSchemaHelper(SchemaTestHelper):

    def id(self):
        return "worker"


SQL = passthru

jobSchema = SQL(
    """
    create table JOB (
      JOB_ID      integer primary key default 1,
      WORK_TYPE   varchar(255) not null,
      PRIORITY    integer default 0 not null,
      WEIGHT      integer default 0 not null,
      NOT_BEFORE  timestamp not null,
      IS_ASSIGNED integer default 0 not null,
      ASSIGNED    timestamp default null,
      OVERDUE     timestamp default null,
      FAILED      integer default 0 not null,
      PAUSE       integer default 0 not null
    );
    """
)

schemaText = SQL(
    """
    create table DUMMY_WORK_ITEM (
      WORK_ID integer primary key,
      JOB_ID integer references JOB,
      A integer, B integer,
      DELETE_ON_LOAD integer default 0
    );
    create table DUMMY_WORK_SINGLETON_ITEM (
      WORK_ID integer primary key,
      JOB_ID integer references JOB,
      A integer, B integer,
      DELETE_ON_LOAD integer default 0
    );
    create table DUMMY_WORK_PAUSE_ITEM (
      WORK_ID integer primary key,
      JOB_ID integer references JOB,
      A integer, B integer,
      DELETE_ON_LOAD integer default 0
    );
    create table AGGREGATOR_WORK_ITEM (
      WORK_ID integer primary key,
      JOB_ID integer references JOB,
      A integer, B integer,
      DELETE_ON_LOAD integer default 0
    );
    create table UPDATE_WORK_ITEM (
      WORK_ID integer primary key,
      JOB_ID integer references JOB,
      A integer, B integer,
      DELETE_ON_LOAD integer default 0
    );
    """
)

try:
    schema = SchemaSyntax(SimpleSchemaHelper().schemaFromString(jobSchema + schemaText))

    dropSQL = [
        "drop table {name} cascade".format(name=table)
        for table in (
            "DUMMY_WORK_ITEM",
            "DUMMY_WORK_SINGLETON_ITEM",
            "DUMMY_WORK_PAUSE_ITEM",
            "AGGREGATOR_WORK_ITEM",
            "UPDATE_WORK_ITEM",
        )
    ] + ["delete from job"]
except SkipTest as e:
    DummyWorkItemTable = object
    DummyWorkSingletonItemTable = object
    DummyWorkPauseItemTable = object
    AggregatorWorkItemTable = object
    UpdateWorkItemTable = object
    skip = e
else:
    DummyWorkItemTable = fromTable(schema.DUMMY_WORK_ITEM)
    DummyWorkSingletonItemTable = fromTable(schema.DUMMY_WORK_SINGLETON_ITEM)
    DummyWorkPauseItemTable = fromTable(schema.DUMMY_WORK_PAUSE_ITEM)
    AggregatorWorkItemTable = fromTable(schema.AGGREGATOR_WORK_ITEM)
    UpdateWorkItemTable = fromTable(schema.UPDATE_WORK_ITEM)
    skip = False


class DummyWorkItem(WorkItem, DummyWorkItemTable):
    """
    Sample L{WorkItem} subclass that adds two integers together and stores them
    in another table.
    """

    results = {}

    def doWork(self):
        if self.a == -1:
            raise ValueError("Ooops")
        elif self.a == -2:
            raise JobTemporaryError(120)
        self.results[self.jobID] = self.a + self.b
        return succeed(None)

    @classmethod
    @inlineCallbacks
    def loadForJob(cls, txn, *a):
        """
        Load L{DummyWorkItem} as normal...  unless the loaded item has
        C{DELETE_ON_LOAD} set, in which case, do a deletion of this same row in
        a concurrent transaction, then commit it.
        """
        workItems = yield super(DummyWorkItem, cls).loadForJob(txn, *a)
        if len(workItems) and workItems[0].deleteOnLoad:
            otherTransaction = txn.store().newTransaction()
            otherSelf = yield super(DummyWorkItem, cls).loadForJob(txn, *a)
            yield otherSelf[0].delete()
            yield otherTransaction.commit()
        returnValue(workItems)


class DummyWorkSingletonItem(SingletonWorkItem, DummyWorkSingletonItemTable):
    """
    Sample L{SingletonWorkItem} subclass that adds two integers together and stores them
    in another table.
    """

    results = {}

    def doWork(self):
        if self.a == -1:
            raise ValueError("Ooops")
        self.results[self.jobID] = self.a + self.b
        return succeed(None)


class DummyWorkPauseItem(WorkItem, DummyWorkPauseItemTable):
    """
    Sample L{WorkItem} subclass that pauses until a Deferred is fired.
    """

    workStarted = None
    unpauseWork = None

    def doWork(self):
        self.workStarted.callback(None)
        return self.unpauseWork


class AggregatorWorkItem(WorkItem, AggregatorWorkItemTable):
    """
    Sample L{WorkItem} subclass that deletes others with the same
    value and than pauses for a bit.
    """

    group = property(lambda self: (self.table.B == self.b))

    @inlineCallbacks
    def doWork(self):
        # Delete the work items we match
        yield Delete(
            From=self.table,
            Where=(self.table.A == self.a)
        ).on(self.transaction)

        d = Deferred()
        reactor.callLater(2.0, lambda: d.callback(None))
        yield d


class UpdateWorkItem(WorkItem, UpdateWorkItemTable):
    """
    Sample L{WorkItem} subclass that will have its weight and
    priority changed.
    """

    default_priority = WORK_PRIORITY_MEDIUM
    default_weight = WORK_WEIGHT_5


class AMPTests(TestCase):
    """
    Tests for L{AMP} faithfully relaying ids across the wire.
    """

    def test_sendTableWithName(self):
        """
        You can send a reference to a table through a L{SchemaAMP} via
        L{TableSyntaxByName}.
        """
        client = AMP()

        class SampleCommand(Command):
            arguments = [("id", Integer())]

        class Receiver(AMP):

            @SampleCommand.responder
            def gotIt(self, id):
                self.it = id
                return {}

        server = Receiver()
        clientT = StringTransport()
        serverT = StringTransport()
        client.makeConnection(clientT)
        server.makeConnection(serverT)
        client.callRemote(SampleCommand, id=123)
        server.dataReceived(clientT.io.getvalue())
        self.assertEqual(server.it, 123)


class WorkItemTests(TestCase):
    """
    A L{WorkItem} is an item of work that can be executed.
    """

    def test_forTableName(self):
        """
        L{WorkItem.forTable} returns L{WorkItem} subclasses mapped to the given
        table.
        """
        self.assertIdentical(
            JobItem.workItemForType(schema.DUMMY_WORK_ITEM.model.name), DummyWorkItem
        )

    @inlineCallbacks
    def _enqueue(self, dbpool, a, b, notBefore=None, priority=None, weight=None, cl=DummyWorkItem):
        fakeNow = datetime.datetime(2012, 12, 12, 12, 12, 12)
        if notBefore is None:
            notBefore = datetime.datetime(2012, 12, 13, 12, 12, 0)
        sinceEpoch = astimestamp(fakeNow)
        clock = Clock()
        clock.advance(sinceEpoch)
        qpool = ControllerQueue(clock, dbpool.connection, useWorkerPool=False)
        realChoosePerformer = qpool.choosePerformer
        performerChosen = []

        def catchPerformerChoice():
            result = realChoosePerformer()
            performerChosen.append(True)
            return result

        qpool.choosePerformer = catchPerformerChoice

        @transactionally(dbpool.connection)
        def check(txn):
            return qpool.enqueueWork(
                txn, cl,
                a=a, b=b, priority=priority, weight=weight,
                notBefore=notBefore
            )

        yield check

        returnValue(qpool)

    @inlineCallbacks
    def test_enqueue(self):
        """
        L{ControllerQueue.enqueueWork} will insert a job and a work item.
        """
        dbpool = buildConnectionPool(self, jobSchema + schemaText)
        yield self._enqueue(dbpool, 1, 2)

        # Make sure we have one JOB and one DUMMY_WORK_ITEM
        @transactionally(dbpool.connection)
        def checkJob(txn):
            return JobItem.all(txn)

        jobs = yield checkJob
        self.assertTrue(len(jobs) == 1)
        self.assertTrue(jobs[0].workType == "DUMMY_WORK_ITEM")
        self.assertTrue(jobs[0].assigned is None)
        self.assertEqual(jobs[0].isAssigned, 0)

        @transactionally(dbpool.connection)
        def checkWork(txn):
            return DummyWorkItem.all(txn)

        work = yield checkWork
        self.assertTrue(len(work) == 1)
        self.assertTrue(work[0].jobID == jobs[0].jobID)

    @inlineCallbacks
    def test_assign(self):
        """
        L{JobItem.assign} will mark a job as assigned.
        """
        dbpool = buildConnectionPool(self, jobSchema + schemaText)
        yield self._enqueue(dbpool, 1, 2)

        # Make sure we have one JOB and one DUMMY_WORK_ITEM
        def checkJob(txn):
            return JobItem.all(txn)

        jobs = yield inTransaction(dbpool.connection, checkJob)
        self.assertTrue(len(jobs) == 1)
        self.assertTrue(jobs[0].assigned is None)
        self.assertEqual(jobs[0].isAssigned, 0)

        @inlineCallbacks
        def assignJob(txn):
            job = yield JobItem.load(txn, jobs[0].jobID)
            yield job.assign(datetime.datetime.utcnow(), ControllerQueue.queueOverdueTimeout)
        yield inTransaction(dbpool.connection, assignJob)

        jobs = yield inTransaction(dbpool.connection, checkJob)
        self.assertTrue(len(jobs) == 1)
        self.assertTrue(jobs[0].assigned is not None)
        self.assertEqual(jobs[0].isAssigned, 1)

    @inlineCallbacks
    def test_nextjob(self):
        """
        L{JobItem.nextjob} returns the correct job based on priority.
        """

        dbpool = buildConnectionPool(self, jobSchema + schemaText)
        now = datetime.datetime.utcnow()

        # Empty job queue
        @inlineCallbacks
        def _next(txn, priority=WORK_PRIORITY_LOW):
            job = yield JobItem.nextjob(txn, now, priority, 1)
            if job is not None:
                work = yield job.workItem()
            else:
                work = None
            returnValue((job, work))
        job, work = yield inTransaction(dbpool.connection, _next)
        self.assertTrue(job is None)
        self.assertTrue(work is None)

        # Unassigned job with future notBefore not returned
        yield self._enqueue(dbpool, 1, 1, now + datetime.timedelta(days=1))
        job, work = yield inTransaction(dbpool.connection, _next)
        self.assertTrue(job is None)
        self.assertTrue(work is None)

        # Unassigned job with past notBefore returned
        yield self._enqueue(dbpool, 2, 1, now + datetime.timedelta(days=-1), priority=WORK_PRIORITY_HIGH)
        job, work = yield inTransaction(dbpool.connection, _next)
        self.assertTrue(job is not None)
        self.assertTrue(work.a == 2)
        assignID = job.jobID

        # Assigned job with past notBefore not returned
        @inlineCallbacks
        def assignJob(txn, when=None):
            assignee = yield JobItem.load(txn, assignID)
            yield assignee.assign(now if when is None else when, ControllerQueue.queueOverdueTimeout)
        yield inTransaction(dbpool.connection, assignJob)
        job, work = yield inTransaction(dbpool.connection, _next)
        self.assertTrue(job is None)
        self.assertTrue(work is None)

        # Unassigned, paused job with past notBefore not returned
        yield self._enqueue(dbpool, 3, 1, now + datetime.timedelta(days=-1), priority=WORK_PRIORITY_HIGH)

        @inlineCallbacks
        def pauseJob(txn, pause=True):
            works = yield DummyWorkItem.all(txn)
            for work in works:
                if work.a == 3:
                    job = yield JobItem.load(txn, work.jobID)
                    yield job.pauseIt(pause)
        yield inTransaction(dbpool.connection, pauseJob)
        job, work = yield inTransaction(dbpool.connection, _next)
        self.assertTrue(job is None)
        self.assertTrue(work is None)

        # Unassigned, paused then unpaused job with past notBefore is returned
        yield inTransaction(dbpool.connection, pauseJob, pause=False)
        job, work = yield inTransaction(dbpool.connection, _next)
        self.assertTrue(job is not None)
        self.assertTrue(work.a == 3)

        @inlineCallbacks
        def deleteJob(txn, jobID):
            job = yield JobItem.load(txn, jobID)
            yield job.delete()
        yield inTransaction(dbpool.connection, deleteJob, jobID=job.jobID)

        # Unassigned low priority job with past notBefore not returned if high priority required
        yield self._enqueue(dbpool, 4, 1, now + datetime.timedelta(days=-1))
        job, work = yield inTransaction(dbpool.connection, _next, priority=WORK_PRIORITY_HIGH)
        self.assertTrue(job is None)
        self.assertTrue(work is None)

        # Unassigned low priority job with past notBefore not returned if medium priority required
        yield self._enqueue(dbpool, 5, 1, now + datetime.timedelta(days=-1))
        job, work = yield inTransaction(dbpool.connection, _next, priority=WORK_PRIORITY_MEDIUM)
        self.assertTrue(job is None)
        self.assertTrue(work is None)

        # Assigned job with past notBefore, but overdue is not returned
        yield inTransaction(dbpool.connection, assignJob, when=now + datetime.timedelta(days=-1))
        job, work = yield inTransaction(dbpool.connection, _next, priority=WORK_PRIORITY_HIGH)
        self.assertTrue(job is None)
        self.assertTrue(work is None)

    @inlineCallbacks
    def test_notsingleton(self):
        """
        L{ControllerQueue.enqueueWork} will insert a job and a work item.
        """
        dbpool = buildConnectionPool(self, jobSchema + schemaText)

        yield self._enqueue(dbpool, 1, 2, cl=DummyWorkItem)

        def allJobs(txn):
            return DummyWorkItem.all(txn)

        jobs = yield inTransaction(dbpool.connection, allJobs)
        self.assertTrue(len(jobs) == 1)

        yield self._enqueue(dbpool, 2, 3)

        jobs = yield inTransaction(dbpool.connection, allJobs)
        self.assertTrue(len(jobs) == 2)

    @inlineCallbacks
    def test_singleton(self):
        """
        L{ControllerQueue.enqueueWork} will insert a job and a work item.
        """
        dbpool = buildConnectionPool(self, jobSchema + schemaText)

        yield self._enqueue(dbpool, 1, 2, cl=DummyWorkSingletonItem)

        def allJobs(txn):
            return DummyWorkSingletonItem.all(txn)

        jobs = yield inTransaction(dbpool.connection, allJobs)
        self.assertTrue(len(jobs) == 1)

        yield self._enqueue(dbpool, 2, 3, cl=DummyWorkSingletonItem)

        jobs = yield inTransaction(dbpool.connection, allJobs)
        self.assertTrue(len(jobs) == 1)

    @inlineCallbacks
    def test_singleton_reschedule(self):
        """
        L{ControllerQueue.enqueueWork} will insert a job and a work item.
        """
        dbpool = buildConnectionPool(self, jobSchema + schemaText)

        qpool = yield self._enqueue(dbpool, 1, 2, cl=DummyWorkSingletonItem, notBefore=datetime.datetime(2014, 5, 17, 12, 0, 0))

        @inlineCallbacks
        def allWork(txn):
            jobs = yield JobItem.all(txn)
            work = [((yield job.workItem()), job) for job in jobs]
            returnValue(filter(lambda x: x[0], work))

        work = yield inTransaction(dbpool.connection, allWork)
        self.assertTrue(len(work) == 1)
        self.assertTrue(work[0][1].notBefore == datetime.datetime(2014, 5, 17, 12, 0, 0))

        def _reschedule_force(txn, force):
            txn._queuer = qpool
            return DummyWorkSingletonItem.reschedule(txn, 60, force=force)
        yield inTransaction(dbpool.connection, _reschedule_force, force=False)

        work = yield inTransaction(dbpool.connection, allWork)
        self.assertTrue(len(work) == 1)
        self.assertTrue(work[0][1].notBefore == datetime.datetime(2014, 5, 17, 12, 0, 0))

        yield inTransaction(dbpool.connection, _reschedule_force, force=True)

        work = yield inTransaction(dbpool.connection, allWork)
        self.assertTrue(len(work) == 1)
        self.assertTrue(work[0][1].notBefore != datetime.datetime(2014, 5, 17, 12, 0, 0))

    def test_updateWorkTypes(self):
        """
        L{workItem.updateWorkTypes} updates weight and priority correctly.
        """
        buildConnectionPool(self, jobSchema + schemaText)

        def _validate(priority, weight):
            self.assertEqual(AggregatorWorkItem.default_priority, WORK_PRIORITY_LOW)
            self.assertEqual(AggregatorWorkItem.default_weight, WORK_WEIGHT_5)
            self.assertEqual(UpdateWorkItem.default_priority, priority)
            self.assertEqual(UpdateWorkItem.default_weight, weight)

        # Check current values
        _validate(WORK_PRIORITY_MEDIUM, WORK_WEIGHT_5)

        # Change priority and weight
        WorkItem.updateWorkTypes({
            "UPDATE_WORK_ITEM": {
                "priority": WORK_PRIORITY_HIGH,
                "weight": WORK_WEIGHT_1,
            },
        })
        _validate(WORK_PRIORITY_HIGH, WORK_WEIGHT_1)

        # Change priority only
        WorkItem.updateWorkTypes({
            "UPDATE_WORK_ITEM": {
                "priority": WORK_PRIORITY_LOW,
            },
        })
        _validate(WORK_PRIORITY_LOW, WORK_WEIGHT_1)

        # Change weight only
        WorkItem.updateWorkTypes({
            "UPDATE_WORK_ITEM": {
                "weight": WORK_WEIGHT_10,
            },
        })
        _validate(WORK_PRIORITY_LOW, WORK_WEIGHT_10)

        # No change
        WorkItem.updateWorkTypes({
            "UPDATE_WORK_ITEM": {
            },
        })
        _validate(WORK_PRIORITY_LOW, WORK_WEIGHT_10)
        WorkItem.updateWorkTypes({
        })
        _validate(WORK_PRIORITY_LOW, WORK_WEIGHT_10)

        # Change priority and weight, with invalid work
        WorkItem.updateWorkTypes({
            "UPDATE_WORK_ITEM": {
                "priority": WORK_PRIORITY_HIGH,
                "weight": WORK_WEIGHT_1,
            },
            "FOO_WORK_ITEM": {
                "priority": WORK_PRIORITY_HIGH,
                "weight": WORK_WEIGHT_1,
            },
        })
        _validate(WORK_PRIORITY_HIGH, WORK_WEIGHT_1)

        # Invalid priority and weight
        WorkItem.updateWorkTypes({
            "UPDATE_WORK_ITEM": {
                "priority": WORK_PRIORITY_HIGH + 1,
                "weight": WORK_WEIGHT_10 + 11,
            },
        })
        _validate(WORK_PRIORITY_HIGH, WORK_WEIGHT_1)

        # Invalid priority and valid weight
        WorkItem.updateWorkTypes({
            "UPDATE_WORK_ITEM": {
                "priority": WORK_PRIORITY_HIGH + 1,
                "weight": WORK_WEIGHT_0,
            },
        })
        _validate(WORK_PRIORITY_HIGH, WORK_WEIGHT_0)

        # Valid priority and invalid weight
        WorkItem.updateWorkTypes({
            "UPDATE_WORK_ITEM": {
                "priority": WORK_PRIORITY_LOW,
                "weight": WORK_WEIGHT_0 - 1,
            },
        })
        _validate(WORK_PRIORITY_LOW, WORK_WEIGHT_0)

        # Back to default priority and weight again
        WorkItem.updateWorkTypes({
            "UPDATE_WORK_ITEM": {
                "priority": WORK_PRIORITY_MEDIUM,
                "weight": WORK_WEIGHT_5,
            },
        })
        results = WorkItem.dumpWorkTypes()
        self.assertEqual(
            results["UPDATE_WORK_ITEM"],
            {"priority": WORK_PRIORITY_MEDIUM, "weight": WORK_WEIGHT_5},
        )

    def test_dumpWorkTypes(self):
        """
        L{workItem.dumpWorkTypes} dumps weight and priority correctly.
        """
        buildConnectionPool(self, jobSchema + schemaText)

        results = WorkItem.dumpWorkTypes()
        self.assertTrue("DUMMY_WORK_SINGLETON_ITEM" in results)
        self.assertEqual(
            results["DUMMY_WORK_SINGLETON_ITEM"],
            {"priority": WORK_PRIORITY_LOW, "weight": WORK_WEIGHT_5},
        )

        # Change priority and weight
        WorkItem.updateWorkTypes({
            "UPDATE_WORK_ITEM": {
                "priority": WORK_PRIORITY_HIGH,
                "weight": WORK_WEIGHT_1,
            },
        })
        results = WorkItem.dumpWorkTypes()
        self.assertEqual(
            results["UPDATE_WORK_ITEM"],
            {"priority": WORK_PRIORITY_HIGH, "weight": WORK_WEIGHT_1},
        )

        # Change priority and weight again
        WorkItem.updateWorkTypes({
            "UPDATE_WORK_ITEM": {
                "priority": WORK_PRIORITY_MEDIUM,
                "weight": WORK_WEIGHT_10,
            },
        })
        results = WorkItem.dumpWorkTypes()
        self.assertEqual(
            results["UPDATE_WORK_ITEM"],
            {"priority": WORK_PRIORITY_MEDIUM, "weight": WORK_WEIGHT_10},
        )

        # Back to default priority and weight again
        WorkItem.updateWorkTypes({
            "UPDATE_WORK_ITEM": {
                "priority": WORK_PRIORITY_MEDIUM,
                "weight": WORK_WEIGHT_5,
            },
        })
        results = WorkItem.dumpWorkTypes()
        self.assertEqual(
            results["UPDATE_WORK_ITEM"],
            {"priority": WORK_PRIORITY_MEDIUM, "weight": WORK_WEIGHT_5},
        )


class WorkerConnectionPoolTests(TestCase):
    """
    A L{WorkerConnectionPool} is responsible for managing, in a node's
    controller (master) process, the collection of worker (slave) processes
    that are capable of executing queue work.
    """


class ControllerQueueUnitTests(TestCase):
    """
    L{ControllerQueue} has many internal components.
    """

    def setUp(self):
        """
        Create a L{ControllerQueue} that is just initialized enough.
        """
        self.pcp = ControllerQueue(None, None)
        DummyWorkItem.results = {}

    def checkPerformer(self, cls):
        """
        Verify that the performer returned by
        L{ControllerQueue.choosePerformer}.
        """
        performer = self.pcp.choosePerformer()
        self.failUnlessIsInstance(performer, cls)
        verifyObject(_IJobPerformer, performer)

    def _setupPools(self):
        """
        Setup pool and reactor clock for time stepped tests.
        """
        reactor = MemoryReactorWithClock()
        cph = SteppablePoolHelper(jobSchema + schemaText)
        then = datetime.datetime(2012, 12, 12, 12, 12, 12)
        reactor.advance(astimestamp(then))
        cph.setUp(self)
        qpool = ControllerQueue(reactor, cph.pool.connection, useWorkerPool=False)

        realChoosePerformer = qpool.choosePerformer
        performerChosen = []

        def catchPerformerChoice(onlyLocally=False):
            result = realChoosePerformer(onlyLocally=onlyLocally)
            performerChosen.append(True)
            return result

        qpool.choosePerformer = catchPerformerChoice
        reactor.callLater(0, qpool._workCheck)

        qpool.startService()
        cph.flushHolders()

        return cph, qpool, reactor, performerChosen

    def test_choosingPerformerWhenNoPeersAndNoWorkers(self):
        """
        If L{ControllerQueue.choosePerformer} is invoked when no workers
        have spawned and no peers have established connections (either incoming
        or outgoing), then it chooses an implementation of C{performJob} that
        simply executes the work locally.
        """

        # If we're using worker pool, this should raise
        try:
            self.pcp.choosePerformer()
        except JobFailedError:
            pass
        else:
            self.fail("Didn't raise JobFailedError")

        # If we're not using worker pool, we should get back LocalPerformer
        self.pcp = ControllerQueue(None, None, useWorkerPool=False)
        self.checkPerformer(LocalPerformer)

    def test_choosingPerformerWithLocalCapacity(self):
        """
        If L{ControllerQueue.choosePerformer} is invoked when some workers
        have spawned, then it should choose the worker pool as the local
        performer.
        """
        # Give it some local capacity.

        # In this case we want pcp to have a workerPool, so create a new pcp
        # for this test
        self.pcp = ControllerQueue(None, None)
        wlf = self.pcp.workerListenerFactory()
        proto = wlf.buildProtocol(None)
        proto.makeConnection(StringTransport())
        # Sanity check.
        self.assertEqual(len(self.pcp.workerPool.workers), 1)
        self.assertEqual(self.pcp.workerPool.hasAvailableCapacity(), True)
        # Now it has some capacity.
        self.checkPerformer(WorkerConnectionPool)

    @inlineCallbacks
    def test_notBeforeWhenCheckingForWork(self):
        """
        L{ControllerQueue._workCheck} should execute any
        outstanding work items, but only those that are expired.
        """
        dbpool, _ignore_qpool, clock, _ignore_performerChosen = self._setupPools()
        fakeNow = datetime.datetime(2012, 12, 12, 12, 12, 12)

        # Let's create a couple of work items directly, not via the enqueue
        # method, so that they exist but nobody will try to immediately execute
        # them.

        @transactionally(dbpool.pool.connection)
        @inlineCallbacks
        def setup(txn):
            # First, one that's right now.
            yield DummyWorkItem.makeJob(txn, a=1, b=2, notBefore=fakeNow)

            # Next, create one that's actually far enough into the past to run.
            yield DummyWorkItem.makeJob(
                txn, a=3, b=4, notBefore=(
                    # Schedule it in the past so that it should have already
                    # run.
                    fakeNow - datetime.timedelta(seconds=20)
                )
            )

            # Finally, one that's actually scheduled for the future.
            yield DummyWorkItem.makeJob(
                txn, a=10, b=20, notBefore=fakeNow + datetime.timedelta(1000)
            )
        yield setup

        # Wait for job
        while len(DummyWorkItem.results) != 2:
            clock.advance(1)

        # Work item complete
        self.assertTrue(DummyWorkItem.results == {1: 3, 2: 7})

    @inlineCallbacks
    def test_notBeforeWhenEnqueueing(self):
        """
        L{ControllerQueue.enqueueWork} enqueues some work immediately, but
        only executes it when enough time has elapsed to allow the C{notBefore}
        attribute of the given work item to have passed.
        """

        dbpool, qpool, clock, performerChosen = self._setupPools()

        @transactionally(dbpool.pool.connection)
        def check(txn):
            return qpool.enqueueWork(
                txn, DummyWorkItem, a=3, b=9,
                notBefore=datetime.datetime(2012, 12, 12, 12, 12, 20)
            )

        yield check

        # This is going to schedule the work to happen with some asynchronous
        # I/O in the middle; this is a problem because how do we know when it's
        # time to check to see if the work has started?  We need to intercept
        # the thing that kicks off the work; we can then wait for the work
        # itself.

        self.assertEquals(performerChosen, [])

        # Advance to exactly the appointed second.
        clock.advance(20 - 12)
        self.assertEquals(performerChosen, [True])

        # Wait for job
        while (yield inTransaction(dbpool.pool.connection, lambda txn: JobItem.all(txn))):
            clock.advance(1)

        # Work item complete
        self.assertTrue(DummyWorkItem.results == {1: 12})

    @inlineCallbacks
    def test_notBeforeBefore(self):
        """
        L{ControllerQueue.enqueueWork} will execute its work immediately if
        the C{notBefore} attribute of the work item in question is in the past.
        """
        dbpool, qpool, clock, performerChosen = self._setupPools()

        @transactionally(dbpool.pool.connection)
        def check(txn):
            return qpool.enqueueWork(
                txn, DummyWorkItem, a=3, b=9,
                notBefore=datetime.datetime(2012, 12, 12, 12, 12, 0)
            )

        yield check

        clock.advance(1000)
        # Advance far beyond the given timestamp.
        self.assertEquals(performerChosen, [True])

        # Wait for job
        while (yield inTransaction(dbpool.pool.connection, lambda txn: JobItem.all(txn))):
            clock.advance(1)

        # Work item complete
        self.assertTrue(DummyWorkItem.results == {1: 12})

    def test_workerConnectionPoolPerformJob(self):
        """
        L{WorkerConnectionPool.performJob} performs work by selecting a
        L{ConnectionFromWorker} and sending it a L{PerformJOB} command.
        """
        clock = Clock()
        peerPool = ControllerQueue(clock, None)
        factory = peerPool.workerListenerFactory()

        def peer():
            p = factory.buildProtocol(None)
            t = StringTransport()
            p.makeConnection(t)
            return p, t

        worker1, _ignore_trans1 = peer()
        worker2, _ignore_trans2 = peer()

        # Ask the worker to do something.
        worker1.performJob(JobDescriptor(1, 1, "ABC"))
        self.assertEquals(worker1.currentLoad, 1)
        self.assertEquals(worker2.currentLoad, 0)

        # Now ask the pool to do something
        peerPool.workerPool.performJob(JobDescriptor(2, 1, "ABC"))
        self.assertEquals(worker1.currentLoad, 1)
        self.assertEquals(worker2.currentLoad, 1)

    def test_workerPerformJobNoZeroWeight(self):
        """
        L{WorkerConnectionPool.performJob} always uses a weight greater than zero.
        """
        clock = Clock()
        peerPool = ControllerQueue(clock, None)
        factory = peerPool.workerListenerFactory()

        def peer():
            p = factory.buildProtocol(None)
            t = StringTransport()
            p.makeConnection(t)
            return p, t

        worker1, _ignore_trans1 = peer()
        worker2, _ignore_trans2 = peer()

        # Ask the worker to do something.
        worker1.performJob(JobDescriptor(1, 0, "ABC"))
        self.assertEquals(worker1.currentLoad, 1)
        self.assertEquals(worker2.currentLoad, 0)

        # Now ask the pool to do something
        peerPool.workerPool.performJob(JobDescriptor(2, 0, "ABC"))
        self.assertEquals(worker1.currentLoad, 1)
        self.assertEquals(worker2.currentLoad, 1)

        # Ask the worker to do something more.
        worker1.performJob(JobDescriptor(3, 5, "ABC"))
        self.assertEquals(worker1.currentLoad, 6)
        self.assertEquals(worker2.currentLoad, 1)

    def test_poolStartServiceChecksForWork(self):
        """
        L{ControllerQueue.startService} kicks off the idle work-check loop.
        """
        reactor = MemoryReactorWithClock()
        cph = SteppablePoolHelper(jobSchema + schemaText)
        then = datetime.datetime(2012, 12, 12, 12, 12, 0)
        reactor.advance(astimestamp(then))
        cph.setUp(self)
        pcp = ControllerQueue(reactor, cph.pool.connection, useWorkerPool=False)
        now = then + datetime.timedelta(seconds=20)

        @transactionally(cph.pool.connection)
        def createOldWork(txn):
            one = DummyWorkItem.makeJob(txn, jobID=1, workID=1, a=3, b=4, notBefore=then)
            two = DummyWorkItem.makeJob(txn, jobID=2, workID=2, a=7, b=9, notBefore=now)
            return gatherResults([one, two])

        pcp.startService()
        cph.flushHolders()
        reactor.advance(19)
        self.assertEquals(
            DummyWorkItem.results,
            {1: 7}
        )
        reactor.advance(20)
        self.assertEquals(
            DummyWorkItem.results,
            {1: 7, 2: 16}
        )

    @inlineCallbacks
    def test_exceptionWhenWorking(self):
        """
        L{ControllerQueue._workCheck} should execute any
        outstanding work items, and keep going if some raise an exception.
        """
        dbpool, _ignore_qpool, clock, _ignore_performerChosen = self._setupPools()
        fakeNow = datetime.datetime(2012, 12, 12, 12, 12, 12)

        # Let's create a couple of work items directly, not via the enqueue
        # method, so that they exist but nobody will try to immediately execute
        # them.

        @transactionally(dbpool.pool.connection)
        @inlineCallbacks
        def setup(txn):
            # OK
            yield DummyWorkItem.makeJob(
                txn, a=1, b=0, notBefore=fakeNow - datetime.timedelta(20 * 60)
            )

            # Error
            yield DummyWorkItem.makeJob(
                txn, a=-1, b=1, notBefore=fakeNow - datetime.timedelta(20 * 60)
            )

            # OK
            yield DummyWorkItem.makeJob(
                txn, a=2, b=0, notBefore=fakeNow - datetime.timedelta(20 * 60)
            )
        yield setup
        clock.advance(20 - 12)

        # Work item complete
        self.assertTrue(DummyWorkItem.results == {1: 1, 3: 2})

    @inlineCallbacks
    def test_exceptionUnassign(self):
        """
        When a work item fails it should appear as unassigned in the JOB
        table and have the failure count bumped, and a notBefore one minute ahead.
        """
        dbpool, _ignore_qpool, clock, _ignore_performerChosen = self._setupPools()
        fakeNow = datetime.datetime(2012, 12, 12, 12, 12, 12)

        # Let's create a couple of work items directly, not via the enqueue
        # method, so that they exist but nobody will try to immediately execute
        # them.

        @transactionally(dbpool.pool.connection)
        @inlineCallbacks
        def setup(txn):
            # Next, create failing work that's actually far enough into the past to run.
            yield DummyWorkItem.makeJob(
                txn, a=-1, b=1, notBefore=fakeNow - datetime.timedelta(20 * 60)
            )
        yield setup
        clock.advance(20 - 12)

        @transactionally(dbpool.pool.connection)
        def check(txn):
            return JobItem.all(txn)

        jobs = yield check
        self.assertTrue(len(jobs) == 1)
        self.assertTrue(jobs[0].assigned is None)
        self.assertEqual(jobs[0].isAssigned, 0)
        self.assertTrue(jobs[0].failed == 1)
        self.assertTrue(jobs[0].notBefore > datetime.datetime.utcnow())

    @inlineCallbacks
    def test_temporaryFailure(self):
        """
        When a work item temporarily fails it should appear as unassigned in the JOB
        table and have the failure count bumped, and a notBefore set to the temporary delay.
        """
        dbpool, _ignore_qpool, clock, _ignore_performerChosen = self._setupPools()
        fakeNow = datetime.datetime(2012, 12, 12, 12, 12, 12)

        # Let's create a couple of work items directly, not via the enqueue
        # method, so that they exist but nobody will try to immediately execute
        # them.

        @transactionally(dbpool.pool.connection)
        @inlineCallbacks
        def setup(txn):
            # Next, create failing work that's actually far enough into the past to run.
            yield DummyWorkItem.makeJob(
                txn, a=-2, b=1, notBefore=fakeNow - datetime.timedelta(20 * 60)
            )
        yield setup
        clock.advance(20 - 12)

        @transactionally(dbpool.pool.connection)
        def check(txn):
            return JobItem.all(txn)

        jobs = yield check
        self.assertTrue(len(jobs) == 1)
        self.assertTrue(jobs[0].assigned is None)
        self.assertEqual(jobs[0].isAssigned, 0)
        self.assertTrue(jobs[0].failed == 1)
        self.assertTrue(jobs[0].notBefore > datetime.datetime.utcnow() + datetime.timedelta(seconds=90))

    @inlineCallbacks
    def test_loopFailure_noRecovery(self):
        """
        When L{_workCheck} fails in its loop we need the problem job marked as failed.
        """
        dbpool, _ignore_qpool, clock, _ignore_performerChosen = self._setupPools()
        fakeNow = datetime.datetime(2012, 12, 12, 12, 12, 12)

        oldNextJob = JobItem.nextjob

        @inlineCallbacks
        def _nextJob(cls, txn, now, minPriority, rowLimit):
            job = yield oldNextJob(txn, now, minPriority, rowLimit)
            work = yield job.workItem()
            if work.a == -2:
                raise ValueError("oops")

        self.patch(JobItem, "nextjob", classmethod(_nextJob))

        # Let's create a couple of work items directly, not via the enqueue
        # method, so that they exist but nobody will try to immediately execute
        # them.

        @transactionally(dbpool.pool.connection)
        @inlineCallbacks
        def setup(txn):
            # Failing
            yield DummyWorkItem.makeJob(
                txn, a=-2, b=1, notBefore=fakeNow - datetime.timedelta(20 * 60)
            )
            # OK
            yield DummyWorkItem.makeJob(
                txn, a=1, b=0, notBefore=fakeNow - datetime.timedelta(20 * 60, 5)
            )
        yield setup
        clock.advance(20 - 12)

        @transactionally(dbpool.pool.connection)
        def check(txn):
            return JobItem.all(txn)

        jobs = yield check
        self.assertEqual(len(jobs), 2)
        self.assertEqual(jobs[0].assigned, None)
        self.assertEqual(jobs[0].isAssigned, 0)
        self.assertEqual(jobs[0].failed, 0)
        self.assertEqual(jobs[0].notBefore, fakeNow - datetime.timedelta(20 * 60))
        self.assertEqual(jobs[1].assigned, None)
        self.assertEqual(jobs[1].isAssigned, 0)
        self.assertEqual(jobs[1].failed, 0)
        self.assertEqual(jobs[1].notBefore, fakeNow - datetime.timedelta(20 * 60, 5))

    @inlineCallbacks
    def test_loopFailure_recovery(self):
        """
        When L{_workCheck} fails in its loop we need the problem job marked as failed.
        """
        dbpool, _ignore_qpool, clock, _ignore_performerChosen = self._setupPools()
        fakeNow = datetime.datetime(2012, 12, 12, 12, 12, 12)

        oldAssign = JobItem.assign

        @inlineCallbacks
        def _assign(self, when, overdue):
            work = yield self.workItem()
            if work.a == -2:
                raise ValueError("oops")
            yield oldAssign(self, when, overdue)

        self.patch(JobItem, "assign", _assign)

        # Let's create a couple of work items directly, not via the enqueue
        # method, so that they exist but nobody will try to immediately execute
        # them.

        @transactionally(dbpool.pool.connection)
        @inlineCallbacks
        def setup(txn):
            # Failing
            yield DummyWorkItem.makeJob(
                txn, a=-2, b=1, notBefore=fakeNow - datetime.timedelta(20 * 60)
            )
            # OK
            yield DummyWorkItem.makeJob(
                txn, a=1, b=0, notBefore=fakeNow - datetime.timedelta(20 * 60, 5)
            )
        yield setup
        clock.advance(20 - 12)

        @transactionally(dbpool.pool.connection)
        def check(txn):
            return JobItem.all(txn)

        jobs = yield check
        self.assertEqual(len(jobs), 1)
        self.assertEqual(jobs[0].assigned, None)
        self.assertEqual(jobs[0].isAssigned, 0)
        self.assertEqual(jobs[0].failed, 1)
        self.assertGreater(jobs[0].notBefore, datetime.datetime.utcnow() + datetime.timedelta(seconds=30))

    @inlineCallbacks
    def test_loopFailure_failedRecovery(self):
        """
        When L{_workCheck} fails in its loop we need the problem job marked as failed.
        """
        dbpool, _ignore_qpool, clock, _ignore_performerChosen = self._setupPools()
        fakeNow = datetime.datetime(2012, 12, 12, 12, 12, 12)

        oldAssign = JobItem.assign

        @inlineCallbacks
        def _assign(self, when, overdue):
            work = yield self.workItem()
            if work.a == -2:
                raise ValueError("oops")
            yield oldAssign(self, when, overdue)

        self.patch(JobItem, "assign", _assign)

        @inlineCallbacks
        def _failedToRun(self, locked=False, delay=None):
            raise ValueError("oops")

        self.patch(JobItem, "failedToRun", _failedToRun)

        # Let's create a couple of work items directly, not via the enqueue
        # method, so that they exist but nobody will try to immediately execute
        # them.

        @transactionally(dbpool.pool.connection)
        @inlineCallbacks
        def setup(txn):
            # Failing
            yield DummyWorkItem.makeJob(
                txn, a=-2, b=1, notBefore=fakeNow - datetime.timedelta(20 * 60)
            )
            # OK
            yield DummyWorkItem.makeJob(
                txn, a=1, b=0, notBefore=fakeNow - datetime.timedelta(20 * 60, 5)
            )
        yield setup
        clock.advance(20 - 12)

        @transactionally(dbpool.pool.connection)
        def check(txn):
            return JobItem.all(txn)

        jobs = yield check
        self.assertEqual(len(jobs), 2)
        self.assertEqual(jobs[0].assigned, None)
        self.assertEqual(jobs[0].isAssigned, 0)
        self.assertEqual(jobs[0].failed, 0)
        self.assertEqual(jobs[0].notBefore, fakeNow - datetime.timedelta(20 * 60))
        self.assertEqual(jobs[1].assigned, None)
        self.assertEqual(jobs[1].isAssigned, 0)
        self.assertEqual(jobs[1].failed, 0)
        self.assertEqual(jobs[1].notBefore, fakeNow - datetime.timedelta(20 * 60, 5))

    @inlineCallbacks
    def test_enableDisable(self):
        """
        L{ControllerQueue.enable} and L{ControllerQueue.disable} control queue processing.
        """
        dbpool, qpool, clock, performerChosen = self._setupPools()

        # Disable processing
        qpool.disable()

        @transactionally(dbpool.pool.connection)
        def check(txn):
            return qpool.enqueueWork(
                txn, DummyWorkItem, a=3, b=9,
                notBefore=datetime.datetime(2012, 12, 12, 12, 12, 0)
            )

        yield check

        # Advance far beyond the given timestamp.
        clock.advance(1000)
        self.assertEquals(performerChosen, [])

        # Enable processing
        qpool.enable()

        clock.advance(1000)
        self.assertEquals(performerChosen, [True])

        # Wait for job
        while (yield inTransaction(dbpool.pool.connection, lambda txn: JobItem.all(txn))):
            clock.advance(1)

        # Work item complete
        self.assertTrue(DummyWorkItem.results == {1: 12})


class HalfConnection(object):

    def __init__(self, protocol):
        self.protocol = protocol
        self.transport = StringTransport()

    def start(self):
        """
        Hook up the protocol and the transport.
        """
        self.protocol.makeConnection(self.transport)

    def extract(self):
        """
        Extract the data currently present in this protocol's output buffer.
        """
        io = self.transport.io
        value = io.getvalue()
        io.seek(0)
        io.truncate()
        return value

    def deliver(self, data):
        """
        Deliver the given data to this L{HalfConnection}'s protocol's
        C{dataReceived} method.

        @return: a boolean indicating whether any data was delivered.
        @rtype: L{bool}
        """
        if data:
            self.protocol.dataReceived(data)
            return True
        return False


class Connection(object):

    def __init__(self, local, remote):
        """
        Connect two protocol instances to each other via string transports.
        """
        self.receiver = HalfConnection(local)
        self.sender = HalfConnection(remote)

    def start(self):
        """
        Start up the connection.
        """
        self.sender.start()
        self.receiver.start()

    def pump(self):
        """
        Relay data in one direction between the two connections.
        """
        result = self.receiver.deliver(self.sender.extract())
        self.receiver, self.sender = self.sender, self.receiver
        return result

    def flush(self, turns=10):
        """
        Keep relaying data until there's no more.
        """
        for _ignore_x in range(turns):
            if not (self.pump() or self.pump()):
                return


class ControllerQueueIntegrationTests(TestCase):
    """
    L{ControllerQueue} is the service responsible for coordinating
    eventually-consistent task queuing within a cluster.
    """

    @inlineCallbacks
    def setUp(self):
        """
        L{ControllerQueue} requires access to a database and the reactor.
        """
        self.store = yield buildStore(self, None)

        @inlineCallbacks
        def doit(txn):
            for statement in splitSQLString(schemaText):
                yield txn.execSQL(statement)

        yield inTransaction(
            self.store.newTransaction,
            doit,
            label="bonus schema"
        )

        def indirectedTransactionFactory(*a, **b):
            """
            Allow tests to replace "self.store.newTransaction" to provide
            fixtures with extra methods on a test-by-test basis.
            """
            return self.store.newTransaction(*a, **b)

        def deschema():
            @inlineCallbacks
            def deletestuff(txn):
                for stmt in dropSQL:
                    yield txn.execSQL(stmt)
            return inTransaction(
                lambda *a, **b: self.store.newTransaction(*a, **b), deletestuff
            )
        self.addCleanup(deschema)

        self.node1 = ControllerQueue(
            reactor, indirectedTransactionFactory, useWorkerPool=False)
        self.node2 = ControllerQueue(
            reactor, indirectedTransactionFactory, useWorkerPool=False)

        class FireMeService(Service, object):

            def __init__(self, d):
                super(FireMeService, self).__init__()
                self.d = d

            def startService(self):
                self.d.callback(None)

        d1 = Deferred()
        d2 = Deferred()
        FireMeService(d1).setServiceParent(self.node1)
        FireMeService(d2).setServiceParent(self.node2)
        ms = MultiService()
        self.node1.setServiceParent(ms)
        self.node2.setServiceParent(ms)
        ms.startService()

        @inlineCallbacks
        def _clean():
            yield ms.stopService()
            self.flushLoggedErrors(CancelledError)

        self.addCleanup(_clean)
        yield gatherResults([d1, d2])
        self.store.queuer = self.node1

        DummyWorkItem.results = {}

    @inlineCallbacks
    def test_enqueueWorkDone(self):
        """
        When a L{WorkItem} is scheduled for execution via
        L{ControllerQueue.enqueueWork} its C{doWork} method will be
        run.
        """
        # TODO: this exact test should run against LocalQueuer as well.
        def operation(txn):
            # TODO: how does "enqueue" get associated with the transaction?
            # This is not the fact with a raw t.w.enterprise transaction.
            # Should probably do something with components.
            return txn.enqueue(DummyWorkItem, a=3, b=4, jobID=100, workID=1,
                               notBefore=datetime.datetime.utcnow())
        yield inTransaction(self.store.newTransaction, operation)

        # Wait for it to be executed.  Hopefully this does not time out :-\.
        yield JobItem.waitEmpty(self.store.newTransaction, reactor, 60)

        self.assertEquals(DummyWorkItem.results, {100: 7})

    @inlineCallbacks
    def test_noWorkDoneWhenConcurrentlyDeleted(self):
        """
        When a L{WorkItem} is concurrently deleted by another transaction, it
        should I{not} perform its work.
        """
        def operation(txn):
            return txn.enqueue(
                DummyWorkItem, a=30, b=40, workID=5678,
                deleteOnLoad=1,
                notBefore=datetime.datetime.utcnow()
            )

        yield inTransaction(self.store.newTransaction, operation)

        # Wait for it to be executed.  Hopefully this does not time out :-\.
        yield JobItem.waitEmpty(self.store.newTransaction, reactor, 60)

        self.assertEquals(DummyWorkItem.results, {})

    @inlineCallbacks
    def test_locked(self):
        """
        L{JobItem.run} locks the work item.
        """

        DummyWorkPauseItem.workStarted = Deferred()
        DummyWorkPauseItem.unpauseWork = Deferred()

        @transactionally(self.store.newTransaction)
        def _enqueue(txn):
            return txn.enqueue(
                DummyWorkPauseItem, a=30, b=40, workID=1
            )
        yield _enqueue

        # Make sure we have one JOB and one DUMMY_WORK_ITEM
        def checkJob(txn):
            return JobItem.all(txn)

        jobs = yield inTransaction(self.store.newTransaction, checkJob)
        self.assertTrue(len(jobs) == 1)

        yield DummyWorkPauseItem.workStarted

        @transactionally(self.store.newTransaction)
        def _trylock(txn):
            job = yield JobItem.load(txn, jobs[0].jobID)
            work = yield job.workItem()
            locked = yield work.trylock()
            self.assertFalse(locked)
        yield _trylock

        DummyWorkPauseItem.unpauseWork.callback(None)
        yield JobItem.waitEmpty(self.store.newTransaction, reactor, 60)

        jobs = yield inTransaction(self.store.newTransaction, checkJob)
        self.assertTrue(len(jobs) == 0)

    @inlineCallbacks
    def test_overdueStillRunning(self):
        """
        Make sure an overdue work item that is still running gets its overdue value bumped.
        """

        # Patch JobItem.assign and JobItem.bumpOverdue to track how many times
        # they are called. Also, change the overdue to be one second ahead of assigned.
        assigned = [0]
        _oldAssign = JobItem.assign

        def _newAssign(self, when, overdue):
            assigned[0] += 1
            return _oldAssign(self, when, 1)
        self.patch(JobItem, "assign", _newAssign)

        bumped = [0]
        _oldBumped = JobItem.bumpOverdue

        def _newBump(self, bump):
            bumped[0] += 1
            return _oldBumped(self, 100)
        self.patch(JobItem, "bumpOverdue", _newBump)

        self.patch(ControllerQueue, "queueOverduePollInterval", 0.5)

        DummyWorkPauseItem.workStarted = Deferred()
        DummyWorkPauseItem.unpauseWork = Deferred()

        @transactionally(self.store.newTransaction)
        def _enqueue(txn):
            return txn.enqueue(
                DummyWorkPauseItem, a=30, b=40, workID=1,
                notBefore=datetime.datetime.utcnow() + datetime.timedelta(seconds=1)
            )
        yield _enqueue

        # Make sure we have one JOB and one DUMMY_WORK_ITEM
        def checkJob(txn):
            return JobItem.all(txn)

        jobs = yield inTransaction(self.store.newTransaction, checkJob)
        self.assertTrue(len(jobs) == 1)
        self.assertTrue(assigned[0] == 0)
        self.assertTrue(bumped[0] == 0)

        yield DummyWorkPauseItem.workStarted

        jobs = yield inTransaction(self.store.newTransaction, checkJob)
        self.assertTrue(len(jobs) == 1)
        self.assertTrue(assigned[0] == 1)
        self.assertTrue(bumped[0] == 0)

        # Pause long enough that the overdue time is passed, which should result
        # in the overdue value being bumped
        d = Deferred()
        reactor.callLater(2, lambda: d.callback(None))
        yield d

        jobs = yield inTransaction(self.store.newTransaction, checkJob)
        self.assertTrue(len(jobs) == 1)
        self.assertTrue(assigned[0] == 1)
        self.assertTrue(bumped[0] == 1)

        DummyWorkPauseItem.unpauseWork.callback(None)
        yield JobItem.waitEmpty(self.store.newTransaction, reactor, 60)

        jobs = yield inTransaction(self.store.newTransaction, checkJob)
        self.assertTrue(len(jobs) == 0)
        self.assertTrue(assigned[0] == 1)
        self.assertTrue(bumped[0] == 1)

    @inlineCallbacks
    def test_overdueWorkGotLost(self):
        """
        Make sure an overdue work item that is not still running gets its overdue value bumped, and
        eventually executed.
        """

        # Patch JobItem.assign and JobItem.bumpOverdue to track how many times
        # they are called. Also, change the overdue to be one second ahead of assigned.
        assigned = [0]
        _oldAssign = JobItem.assign

        def _newAssign(self, when, overdue):
            assigned[0] += 1
            return _oldAssign(self, when, 1)
        self.patch(JobItem, "assign", _newAssign)

        bumped = [0]
        _oldBumped = JobItem.bumpOverdue

        def _newBump(self, bump):
            bumped[0] += 1
            return _oldBumped(self, 5)
        self.patch(JobItem, "bumpOverdue", _newBump)

        failed = [0]
        waitFail = Deferred()

        def _newFailedToRun(self, locked=False, delay=None):
            failed[0] += 1
            waitFail.callback(None)
            return succeed(None)
        self.patch(JobItem, "failedToRun", _newFailedToRun)

        def _newDoWorkRaise(self):
            self.workStarted.callback(None)
            raise ValueError()

        def _newDoWorkSuccess(self):
            return succeed(None)

        DummyWorkPauseItem.workStarted = Deferred()
        self.patch(DummyWorkPauseItem, "doWork", _newDoWorkRaise)

        self.patch(ControllerQueue, "queueOverduePollInterval", 0.5)

        @transactionally(self.store.newTransaction)
        def _enqueue(txn):
            return txn.enqueue(
                DummyWorkPauseItem, a=30, b=40, workID=1,
                notBefore=datetime.datetime.utcnow() + datetime.timedelta(seconds=1)
            )
        yield _enqueue

        # Make sure we have one JOB and one DUMMY_WORK_ITEM
        def checkJob(txn):
            return JobItem.all(txn)

        jobs = yield inTransaction(self.store.newTransaction, checkJob)
        self.assertTrue(len(jobs) == 1)
        self.assertTrue(assigned[0] == 0)
        self.assertTrue(bumped[0] == 0)
        self.assertTrue(failed[0] == 0)

        # Wait for work to fail once and reset it to succeed next time
        yield DummyWorkPauseItem.workStarted
        self.patch(DummyWorkPauseItem, "doWork", _newDoWorkSuccess)
        yield waitFail

        jobs = yield inTransaction(self.store.newTransaction, checkJob)
        self.assertTrue(len(jobs) == 1)
        self.assertTrue(assigned[0] == 1)
        self.assertTrue(bumped[0] == 0)
        self.assertTrue(failed[0] == 1)

        # Wait for the overdue to be detected and the work restarted
        yield JobItem.waitEmpty(self.store.newTransaction, reactor, 60)

        jobs = yield inTransaction(self.store.newTransaction, checkJob)
        self.assertTrue(len(jobs) == 0)
        self.assertTrue(assigned[0] == 2)
        self.assertTrue(bumped[0] == 0)
        self.assertTrue(failed[0] == 1)

    @inlineCallbacks
    def test_lowPriorityOverdueWorkNotAssigned(self):
        """
        Make sure an overdue work item that is not still running gets its overdue value bumped, and
        eventually executed.
        """

        # Patch the work item to fail once and appear as overdue
        _oldAssign = JobItem.assign

        def _newAssign(self, when, overdue):
            return _oldAssign(self, when, 1)
        self.patch(JobItem, "assign", _newAssign)

        failed = [0]
        waitFail = Deferred()

        def _newFailedToRun(self, locked=False, delay=None):
            failed[0] += 1
            waitFail.callback(None)
            return succeed(None)
        self.patch(JobItem, "failedToRun", _newFailedToRun)

        def _newDoWorkRaise(self):
            self.workStarted.callback(None)
            raise ValueError()

        def _newDoWorkSuccess(self):
            return succeed(None)

        DummyWorkPauseItem.workStarted = Deferred()
        self.patch(DummyWorkPauseItem, "doWork", _newDoWorkRaise)

        self.patch(ControllerQueue, "queueOverduePollInterval", 0.5)

        @transactionally(self.store.newTransaction)
        def _enqueue(txn):
            return txn.enqueue(
                DummyWorkPauseItem, a=30, b=40, workID=1,
                notBefore=datetime.datetime.utcnow() + datetime.timedelta(seconds=1)
            )
        yield _enqueue

        # Make sure we have one JOB and one DUMMY_WORK_ITEM
        def checkJob(txn):
            return JobItem.all(txn)

        jobs = yield inTransaction(self.store.newTransaction, checkJob)
        self.assertTrue(len(jobs) == 1)
        self.assertTrue(failed[0] == 0)

        # Wait for work to fail once and reset it to succeed next time
        yield DummyWorkPauseItem.workStarted
        self.patch(DummyWorkPauseItem, "doWork", _newDoWorkSuccess)
        yield waitFail

        jobs = yield inTransaction(self.store.newTransaction, checkJob)
        self.assertTrue(len(jobs) == 1)
        self.assertTrue(failed[0] == 1)

        # Try to get the next high priority only job
        @transactionally(self.store.newTransaction)
        @inlineCallbacks
        def _testNone(txn):
            nowTime = datetime.datetime.utcfromtimestamp(reactor.seconds() + 10)
            job = yield JobItem.nextjob(txn, nowTime, WORK_PRIORITY_HIGH, 1)
            self.assertTrue(job is None)

        yield _testNone

        # Wait for the overdue to be detected and the work restarted
        yield JobItem.waitEmpty(self.store.newTransaction, reactor, 60)

        jobs = yield inTransaction(self.store.newTransaction, checkJob)
        self.assertTrue(len(jobs) == 0)
        self.assertTrue(failed[0] == 1)

    @inlineCallbacks
    def test_aggregator_lock(self):
        """
        L{JobItem.run} fails an aggregated work item and then ignores it.
        """

        # Patch JobItem.failedToRun to track how many times it is called.
        failed = [0]
        _oldFailed = JobItem.failedToRun

        def _newFailed(self, locked=False, delay=None):
            failed[0] += 1
            return _oldFailed(self, locked, 5)
        self.patch(JobItem, "failedToRun", _newFailed)

        @transactionally(self.store.newTransaction)
        def _enqueue1(txn):
            return txn.enqueue(
                AggregatorWorkItem, a=1, b=1, workID=1
            )

        @transactionally(self.store.newTransaction)
        def _enqueue2(txn):
            return txn.enqueue(
                AggregatorWorkItem, a=1, b=2, workID=2
            )

        yield _enqueue1
        yield _enqueue2

        # Make sure we have one JOB and one DUMMY_WORK_ITEM
        def checkJob(txn):
            return JobItem.all(txn)

        jobs = yield inTransaction(self.store.newTransaction, checkJob)
        self.assertTrue(len(jobs) == 2)

        yield JobItem.waitEmpty(self.store.newTransaction, reactor, 60)

        jobs = yield inTransaction(self.store.newTransaction, checkJob)
        self.assertEqual(len(jobs), 0)
        self.assertEqual(failed[0], 1)

    @inlineCallbacks
    def test_aggregator_no_deadlock(self):
        """
        L{JobItem.run} fails an aggregated work item and then ignores it.
        """

        # Patch JobItem.assign and JobItem.bumpOverdue to track how many times
        # they are called.
        failed = [0]
        _oldFailed = JobItem.failedToRun

        def _newFailed(self, locked=False, delay=None):
            failed[0] += 1
            return _oldFailed(self, locked, 5)
        self.patch(JobItem, "failedToRun", _newFailed)

        @transactionally(self.store.newTransaction)
        def _enqueue1(txn):
            return txn.enqueue(
                AggregatorWorkItem, a=1, b=1, workID=1
            )

        @transactionally(self.store.newTransaction)
        def _enqueue2(txn):
            return txn.enqueue(
                AggregatorWorkItem, a=1, b=1, workID=2
            )

        yield _enqueue1
        yield _enqueue2

        # Make sure we have one JOB and one DUMMY_WORK_ITEM
        def checkJob(txn):
            return JobItem.all(txn)

        jobs = yield inTransaction(self.store.newTransaction, checkJob)
        self.assertTrue(len(jobs) == 2)

        yield JobItem.waitEmpty(self.store.newTransaction, reactor, 60)

        jobs = yield inTransaction(self.store.newTransaction, checkJob)
        self.assertTrue(len(jobs) == 0)
        self.assertEqual(failed[0], 1)

    @inlineCallbacks
    def test_pollingBackoff(self):
        """
        Check that an idle queue backs off its polling and goes back to rapid polling
        when a worker enqueues a job.
        """

        # Speed up the backoff process
        self.patch(ControllerQueue, "queuePollingBackoff", ((1.0, 60.0),))

        # Wait for backoff
        while self.node1._actualPollInterval == self.node1.queuePollInterval:
            d = Deferred()
            reactor.callLater(1.0, lambda: d.callback(None))
            yield d

        self.assertEqual(self.node1._actualPollInterval, 60.0)

        # TODO: this exact test should run against LocalQueuer as well.
        def operation(txn):
            # TODO: how does "enqueue" get associated with the transaction?
            # This is not the fact with a raw t.w.enterprise transaction.
            # Should probably do something with components.
            return txn.enqueue(DummyWorkItem, a=3, b=4, jobID=100, workID=1,
                               notBefore=datetime.datetime.utcnow())
        yield inTransaction(self.store.newTransaction, operation)

        # Backoff terminated
        while self.node1._actualPollInterval != self.node1.queuePollInterval:
            d = Deferred()
            reactor.callLater(0.1, lambda: d.callback(None))
            yield d
        self.assertEqual(self.node1._actualPollInterval, self.node1.queuePollInterval)

        # Wait for it to be executed.  Hopefully this does not time out :-\.
        yield JobItem.waitEmpty(self.store.newTransaction, reactor, 60)

        # Wait for backoff
        while self.node1._actualPollInterval == self.node1.queuePollInterval:
            d = Deferred()
            reactor.callLater(1.0, lambda: d.callback(None))
            yield d

        self.assertEqual(self.node1._actualPollInterval, 60.0)


class NonPerformingQueuerTests(TestCase):

    @inlineCallbacks
    def test_choosePerformer(self):
        queuer = NonPerformingQueuer()
        performer = queuer.choosePerformer()
        result = (yield performer.performJob(None))
        self.assertEquals(result, None)
