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


from twext.enterprise.ienterprise import IQueuer
from twext.enterprise.jobs.jobitem import JobDescriptorArg, JobItem, \
    JobFailedError
from twext.enterprise.jobs.workitem import WORK_WEIGHT_CAPACITY, \
    WORK_PRIORITY_LOW, WORK_PRIORITY_MEDIUM, WORK_PRIORITY_HIGH
from twext.python.log import Logger

from twisted.application.service import MultiService
from twisted.internet.defer import inlineCallbacks, returnValue, Deferred, succeed
from twisted.internet.error import AlreadyCalled, AlreadyCancelled
from twisted.internet.protocol import Factory
from twisted.protocols.amp import AMP, Command

from zope.interface import implements
from zope.interface.interface import Interface

from datetime import datetime
import collections
import time

log = Logger()

"""
This module imports the core of a distributed work queue. A "controller" process
will poll the job queue for work and dispatch it to a suitable "worker" process
based on the load of each worker. Controller and worker communicate with each
other via AMP. Work is submitted to the job queue by the workers or the
controller by storing an L{JobItem}/L{WorkItem} in the database.

The key classes in this module are:

In the master process:
    L{ControllerQueue} - the L{Service} that the controller process has to run to process jobs.
    L{ConnectionFromWorker} - an AMP protocol handler for connections from a worker process.
    L{WorkerConnectionPool} - the list of all worker connections the controller knows about.

In the worker process:
    L{ConnectionFromController} - an AMP protocol handler for connections from a controller process.
    L{WorkerFactory} - factory for the worker process to use to initiate connections to the controller.

"""


class _IJobPerformer(Interface):
    """
    An object that can perform work.

    Internal interface; implemented by several classes here since work has to
    (in the worst case) pass from worker->controller->controller->worker.
    """

    def performJob(job):  # @NoSelf
        """
        @param job: Details about the job to perform.
        @type job: L{JobDescriptor}

        @return: a L{Deferred} firing with an empty dictionary when the work is
            complete.
        @rtype: L{Deferred} firing L{dict}
        """


class PerformJob(Command):
    """
    Notify a worker that it must do a job that has been persisted to
    the database, by informing it of the job ID.
    """

    arguments = [
        ("job", JobDescriptorArg()),
    ]
    response = []


class EnqueuedJob(Command):
    """
    Notify the controller process that a worker enqueued some work. This is used to "wake up"
    the controller if it has slowed its polling loop due to it being idle.
    """

    arguments = []
    response = []


class WorkerConnectionPool(object):
    """
    A pool of L{ConnectionFromWorker}s. This represents the set of worker processes
    that the controller process can dispatch work to. It tracks each L{ConnectionFromWorker},
    reporting on the overall load, and allows for dispatching of work to the lowest load
    worker.
    """
    implements(_IJobPerformer)

    completed = collections.defaultdict(int)
    timing = collections.defaultdict(float)

    def __init__(self, maximumLoadPerWorker=WORK_WEIGHT_CAPACITY):
        self.workers = []
        self.maximumLoadPerWorker = maximumLoadPerWorker

    def addWorker(self, worker):
        """
        Add a L{ConnectionFromWorker} to this L{WorkerConnectionPool} so that
        it can be selected.
        """
        self.workers.append(worker)

    def removeWorker(self, worker):
        """
        Remove a L{ConnectionFromWorker} from this L{WorkerConnectionPool} that
        was previously added.
        """
        self.workers.remove(worker)

    def hasAvailableCapacity(self):
        """
        Does this worker connection pool have any local workers who have spare
        hasAvailableCapacity to process another queue item?
        """
        for worker in self.workers:
            if worker.currentLoad < self.maximumLoadPerWorker:
                return True
        return False

    def loadLevel(self):
        """
        Return the overall load of this worker connection pool have as a percentage of
        total capacity.

        @return: current load percentage.
        @rtype: L{int}
        """
        current = sum(worker.currentLoad for worker in self.workers)
        total = len(self.workers) * self.maximumLoadPerWorker
        return ((current * 100) / total) if total else 100

    def eachWorkerLoad(self):
        """
        The load of all currently connected workers.
        """
        return [(worker.currentAssigned, worker.currentLoad, worker.totalCompleted) for worker in self.workers]

    def allWorkerLoad(self):
        """
        The total load of all currently connected workers.
        """
        return sum(worker.currentLoad for worker in self.workers)

    def _selectLowestLoadWorker(self):
        """
        Select the local connection with the lowest current load, or C{None} if
        all workers are too busy.

        @return: a worker connection with the lowest current load.
        @rtype: L{ConnectionFromWorker}
        """

        # Stable sort based on worker load
        self.workers.sort(key=lambda w: w.currentLoad)
        return self.workers[0]

    @inlineCallbacks
    def performJob(self, job):
        """
        Select a local worker that is idle enough to perform the given job,
        then ask them to perform it.

        @param job: The details of the given job.
        @type job: L{JobDescriptor}

        @return: a L{Deferred} firing with an empty dictionary when the work is
            complete.
        @rtype: L{Deferred} firing L{dict}
        """

        t = time.time()
        preferredWorker = self._selectLowestLoadWorker()
        try:
            result = yield preferredWorker.performJob(job)
        finally:
            self.completed[job.workType] += 1
            self.timing[job.workType] += time.time() - t
        returnValue(result)


class ConnectionFromWorker(AMP):
    """
    An individual connection from a worker, as seen from the controller's
    perspective.  L{ConnectionFromWorker}s go into a L{WorkerConnectionPool}.
    """

    def __init__(self, controllerQueue, boxReceiver=None, locator=None):
        super(ConnectionFromWorker, self).__init__(boxReceiver, locator)
        self.controllerQueue = controllerQueue
        self._assigned = 0
        self._load = 0
        self._completed = 0

    @property
    def currentAssigned(self):
        """
        How many jobs currently assigned to this worker?
        """
        return self._assigned

    @property
    def currentLoad(self):
        """
        What is the current load of this worker?
        """
        return self._load

    @property
    def totalCompleted(self):
        """
        What is the current load of this worker?
        """
        return self._completed

    def startReceivingBoxes(self, sender):
        """
        Start receiving AMP boxes.  Initialize all necessary state.
        """
        result = super(ConnectionFromWorker, self).startReceivingBoxes(sender)
        self.controllerQueue.workerPool.addWorker(self)
        return result

    def stopReceivingBoxes(self, reason):
        """
        AMP boxes will no longer be received.
        """
        result = super(ConnectionFromWorker, self).stopReceivingBoxes(reason)
        self.controllerQueue.workerPool.removeWorker(self)
        return result

    def performJob(self, job):
        """
        Dispatch a job to this worker.

        @see: The responder for this should always be
            L{ConnectionFromController.executeJobHere}.
        """
        d = self.callRemote(PerformJob, job=job)
        self._assigned += 1
        self._load += max(job.weight, 1)

        @d.addBoth
        def f(result):
            self._assigned -= 1
            self._load -= max(job.weight, 1)
            self._completed += 1
            return result

        return d

    @EnqueuedJob.responder
    def enqueuedJob(self):
        """
        A worker enqueued a job and is letting us know. We need to "ping" the
        L{ControllerQueue} to ensure it is polling the job queue at its
        normal "fast" rate, as opposed to slower idle rates.
        """

        self.controllerQueue.enqueuedJob()
        return {}


class ConnectionFromController(AMP):
    """
    A L{ConnectionFromController} is the connection to a controller
    process, in a worker process.  It processes requests from its own
    controller to do work.  It is the opposite end of the connection from
    L{ConnectionFromWorker}.
    """
    implements(IQueuer)

    def __init__(self, transactionFactory, whenConnected,
                 boxReceiver=None, locator=None):
        super(ConnectionFromController, self).__init__(boxReceiver, locator)
        self._txnFactory = transactionFactory
        self.whenConnected = whenConnected
        from twisted.internet import reactor
        self.reactor = reactor

    def transactionFactory(self, *args, **kwargs):
        txn = self._txnFactory(*args, **kwargs)
        txn._queuer = self
        return txn

    def startReceivingBoxes(self, sender):
        super(ConnectionFromController, self).startReceivingBoxes(sender)
        self.whenConnected(self)

    @inlineCallbacks
    def enqueueWork(self, txn, workItemType, **kw):
        """
        There is some work to do.  Do it, ideally someplace else, ideally in
        parallel.

        @param workItemType: The type of work item to be enqueued.
        @type workItemType: A subtype of L{WorkItem}

        @param kw: The parameters to construct a work item.
        @type kw: keyword parameters to C{workItemType.makeJob}
        """
        work = yield workItemType.makeJob(txn, **kw)
        self.callRemote(EnqueuedJob)
        returnValue(work)

    @PerformJob.responder
    def executeJobHere(self, job):
        """
        This is where it's time to actually do the job.  The controller
        process has instructed this worker to do it; so, look up the data in
        the row, and do it.
        """
        d = JobItem.ultimatelyPerform(self.transactionFactory, job)
        d.addCallback(lambda ignored: {})
        return d


class WorkerFactory(Factory, object):
    """
    Factory, to be used as the client to connect from the worker to the
    controller.
    """

    def __init__(self, transactionFactory, whenConnected):
        """
        Create a L{WorkerFactory} with a transaction factory and a schema.
        """
        self.transactionFactory = transactionFactory
        self.whenConnected = whenConnected

    def buildProtocol(self, addr):
        """
        Create a L{ConnectionFromController} connected to the
        transactionFactory and store.
        """
        return ConnectionFromController(
            self.transactionFactory, self.whenConnected
        )


class _BaseQueuer(object):
    implements(IQueuer)

    def __init__(self):
        super(_BaseQueuer, self).__init__()
        self.proposalCallbacks = set()

    @inlineCallbacks
    def enqueueWork(self, txn, workItemType, **kw):
        """
        There is some work to do.  Do it, someplace else, ideally in parallel.

        @param workItemType: The type of work item to be enqueued.
        @type workItemType: A subtype of L{WorkItem}

        @param kw: The parameters to construct a work item.
        @type kw: keyword parameters to C{workItemType.makeJob}
        """
        work = yield workItemType.makeJob(txn, **kw)
        self.enqueuedJob()
        returnValue(work)

    def enqueuedJob(self):
        """
        Work has been enqueued
        """
        pass


class ControllerQueue(_BaseQueuer, MultiService, object):
    """
    Each controller has a L{ControllerQueue} that polls the database
    for work and dispatches to a worker.

    @ivar queuePollInterval: The amount of time between database
        pings, i.e. checks for over-due queue items that might have been
        orphaned by a controller process that died mid-transaction.
    @type queuePollInterval: L{float} (in seconds)

    @ivar queueOverdueTimeout: The amount of time after a L{WorkItem} is
        scheduled to be processed (its C{notBefore} attribute) that it is
        considered to be "orphaned" and will be run by a lost-work check rather
        than waiting for it to be requested.  By default, 10 minutes.
    @type queueOverdueTimeout: L{float} (in seconds)

    @ivar queuePollingBackoff: Defines the thresholds for queue polling
        back-off.
    @type queuePollingBackoff: L{tuple}

    @ivar overloadLevel: The load level above which job dispatch will stop.
    @type overloadLevel: L{int}

    @ivar highPriorityLevel: The load level above which only high priority
        jobs will be dispatched.
    @type highPriorityLevel: L{int}

    @ivar mediumPriorityLevel: The load level above which low priority
        jobs will not be dispatched.
    @type mediumPriorityLevel: L{int}

    @ivar reactor: The reactor used for scheduling timed events.
    @type reactor: L{IReactorTime} provider.
    """
    implements(IQueuer)

    queuePollInterval = 0.1             # How often to poll for new work
    queueOverduePollInterval = 60.0     # How often to poll for overdue work
    queueOverdueTimeout = 5.0 * 60.0    # How long before assigned work is possibly overdue
    queuePollingBackoff = ((60.0, 60.0), (5.0, 1.0),)   # Polling backoffs

    overloadLevel = 95          # Percentage load level above which job queue processing stops
    highPriorityLevel = 80      # Percentage load level above which only high priority jobs are processed
    mediumPriorityLevel = 50    # Percentage load level above which high and medium priority jobs are processed

    # Used to help with concurrency problems when the underlying DB does not
    # support a proper "LIMIT" term with the query (Oracle). It should be set to
    # no more than 1 plus the number of app-servers in use). For a single app
    # server always use 1.
    rowLimit = 1

    def __init__(self, reactor, transactionFactory, useWorkerPool=True, disableWorkProcessing=False):
        """
        Initialize a L{ControllerQueue}.

        @param transactionFactory: a 0- or 1-argument callable that produces an
            L{IAsyncTransaction}

        @param useWorkerPool:  Whether to use a worker pool to manage load
            or instead take on all work ourselves (e.g. in single process mode)
        """
        super(ControllerQueue, self).__init__()
        self.reactor = reactor
        self.transactionFactory = transactionFactory
        self.workerPool = WorkerConnectionPool() if useWorkerPool else None
        self.disableWorkProcessing = disableWorkProcessing
        self._lastMinPriority = WORK_PRIORITY_LOW
        self._timeOfLastWork = time.time()
        self._actualPollInterval = self.queuePollInterval
        self._inWorkCheck = False
        self._inOverdueCheck = False

    def enable(self):
        """
        Turn on work queue processing.
        """
        self.disableWorkProcessing = False

    def disable(self):
        """
        Turn off work queue processing.
        """
        self.disableWorkProcessing = True

    def totalLoad(self):
        return self.workerPool.allWorkerLoad() if self.workerPool else 0

    def workerListenerFactory(self):
        """
        Factory that listens for connections from workers.
        """
        f = Factory()
        f.buildProtocol = lambda addr: ConnectionFromWorker(self)
        return f

    def choosePerformer(self, onlyLocally=False):
        """
        Choose a worker to distribute work to based on the current known load
        of each worker.  Also, if no workers are available, work will be
        submitted locally.

        @return: the chosen performer.
        @rtype: L{_IJobPerformer} or L{WorkerConnectionPool}
        """
        if self.workerPool:

            if self.workerPool.hasAvailableCapacity():
                return self.workerPool
            raise JobFailedError("No capacity for work")

        return LocalPerformer(self.transactionFactory)

    @inlineCallbacks
    def _workCheck(self):
        """
        Every controller will periodically check for any new work to do, and dispatch
        as much as possible given the current load.
        """

        loopCounter = 0
        while True:
            if not self.running or self.disableWorkProcessing:
                returnValue(None)

            # Check the overall service load - if overloaded skip this poll cycle.
            # If no workerPool, set level to 0, taking on all work.
            level = 0 if self.workerPool is None else self.workerPool.loadLevel()

            # Check overload level first
            if level > self.overloadLevel:
                if self._lastMinPriority != WORK_PRIORITY_HIGH + 1:
                    log.error("workCheck: jobqueue is overloaded")
                self._lastMinPriority = WORK_PRIORITY_HIGH + 1
                self._timeOfLastWork = time.time()
                break
            elif level > self.highPriorityLevel:
                minPriority = WORK_PRIORITY_HIGH
            elif level > self.mediumPriorityLevel:
                minPriority = WORK_PRIORITY_MEDIUM
            else:
                minPriority = WORK_PRIORITY_LOW
            if self._lastMinPriority != minPriority:
                log.debug(
                    "workCheck: jobqueue priority limit change: {limit}",
                    limit=minPriority,
                )
                if self._lastMinPriority == WORK_PRIORITY_HIGH + 1:
                    log.error("workCheck: jobqueue is no longer overloaded")
            self._lastMinPriority = minPriority

            # Determine what the timestamp cutoff
            # TODO: here is where we should iterate over the unlocked items
            # that are due, ordered by priority, notBefore etc
            nowTime = datetime.utcfromtimestamp(self.reactor.seconds())

            self._inWorkCheck = True
            txn = nextJob = None
            try:
                txn = self.transactionFactory(label="jobqueue.workCheck")
                nextJob = yield JobItem.nextjob(txn, nowTime, minPriority, self.rowLimit)
                if nextJob is None:
                    break

                # Always assign as a new job even when it is an orphan
                log.debug("workCheck: assigned job: {jobID}".format(jobID=nextJob.jobID))
                yield nextJob.assign(nowTime, self.queueOverdueTimeout)
                self._timeOfLastWork = time.time()
                loopCounter += 1

            except Exception as e:
                log.error(
                    "workCheck: Failed to pick a new job: {jobID}, {exc}",
                    jobID=nextJob.jobID if nextJob else "?",
                    exc=e,
                )
                if txn is not None:
                    yield txn.abort()
                    txn = None

                # If we can identify the problem job, try and set it to failed so that it
                # won't block other jobs behind it (it will be picked again when the failure
                # interval is exceeded - but that has a back off so a permanently stuck item
                # should fade away. We probably want to have some additional logic to simply
                # remove something that is permanently failing.
                if nextJob is not None:
                    txn = self.transactionFactory(label="jobqueue.workCheck.failed")
                    try:
                        failedJob = yield JobItem.load(txn, nextJob.jobID)
                        yield failedJob.failedToRun()
                    except Exception as e:
                        # Could not mark as failed - break out of the next job loop
                        log.error(
                            "workCheck: Failed to mark failed new job:{jobID}, {exc}",
                            jobID=nextJob.jobID,
                            exc=e,
                        )
                        yield txn.abort()
                        txn = None
                        nextJob = None
                        break
                    else:
                        # Marked the problem one as failed, so keep going and get the next job
                        log.error("workCheck: Marked failed new job: {jobID}", jobID=nextJob.jobID)
                        yield txn.commit()
                        txn = None
                        nextJob = None
                else:
                    # Cannot mark anything as failed - break out of next job loop
                    log.error("workCheck: Cannot mark failed new job")
                    break
            finally:
                if txn is not None:
                    yield txn.commit()
                    txn = None
                self._inWorkCheck = False

            if nextJob is not None:
                try:
                    worker = self.choosePerformer(onlyLocally=True)
                    # Send the job over but DO NOT block on the response - that will ensure
                    # we can do stuff in parallel
                    worker.performJob(nextJob.descriptor())
                except Exception as e:
                    log.error("workCheck: Failed to perform job for jobid={jobid}, {exc}", jobid=nextJob.jobID, exc=e)

        if loopCounter:
            log.debug("workCheck: processed {ctr} jobs in one loop", ctr=loopCounter)

    _workCheckCall = None

    @inlineCallbacks
    def _workCheckLoop(self):
        """
        While the service is running, keep check for work items and execute
        them. Use a back-off strategy for polling to avoid using too much CPU
        when there is not a lot to do.
        """
        self._workCheckCall = None

        if not self.running:
            returnValue(None)

        try:
            yield self._workCheck()
        except Exception as e:
            log.error("_workCheckLoop: {exc}", exc=e)

        if not self.running:
            returnValue(None)

        # Check for adjustment to poll interval - if the workCheck is idle for certain
        # periods of time we will gradually increase the poll interval to avoid consuming
        # excessive power when there is nothing to do
        interval = self.queuePollInterval
        idle = time.time() - self._timeOfLastWork
        for threshold, poll in self.queuePollingBackoff:
            if idle > threshold:
                interval = poll
                break
        if self._actualPollInterval != interval:
            log.debug("_workCheckLoop: interval set to {interval}s", interval=interval)
        self._actualPollInterval = interval
        self._workCheckCall = self.reactor.callLater(
            self._actualPollInterval, self._workCheckLoop
        )

    @inlineCallbacks
    def _overdueCheck(self):
        """
        Every controller will periodically check for any overdue work and unassign that
        work so that it gets execute during the next regular work check.
        """

        loopCounter = 0
        while True:
            if not self.running or self.disableWorkProcessing:
                returnValue(None)

            # Determine what the timestamp cutoff
            # TODO: here is where we should iterate over the unlocked items
            # that are due, ordered by priority, notBefore etc
            nowTime = datetime.utcfromtimestamp(self.reactor.seconds())

            self._inOverdueCheck = True
            txn = overdueJob = None
            try:
                txn = self.transactionFactory(label="jobqueue.overdueCheck")
                overdueJob = yield JobItem.overduejob(txn, nowTime, self.rowLimit)
                if overdueJob is None:
                    break

                # It is overdue - check to see whether the work item is currently locked - if so no
                # need to re-assign
                running = yield overdueJob.isRunning()
                if running:
                    # Change the overdue to further in the future whilst we wait for
                    # the running job to complete
                    yield overdueJob.bumpOverdue(self.queueOverdueTimeout)
                    log.debug(
                        "overdueCheck: bumped overdue timeout on jobid={jobid}",
                        jobid=overdueJob.jobID,
                    )
                else:
                    # Unassign the job so it is picked up by the next L{_workCheck}
                    yield overdueJob.unassign()
                    log.debug(
                        "overdueCheck: overdue unassigned for jobid={jobid}",
                        jobid=overdueJob.jobID,
                    )
                loopCounter += 1

            except Exception as e:
                log.error(
                    "overdueCheck: Failed to process overdue job: {jobID}, {exc}",
                    jobID=overdueJob.jobID if overdueJob else "?",
                    exc=e,
                )
                if txn is not None:
                    yield txn.abort()
                    txn = None

                # If we can identify the problem job, try and set it to failed so that it
                # won't block other jobs behind it (it will be picked again when the failure
                # interval is exceeded - but that has a back off so a permanently stuck item
                # should fade away. We probably want to have some additional logic to simply
                # remove something that is permanently failing.
                if overdueJob is not None:
                    txn = self.transactionFactory(label="jobqueue.overdueCheck.failed")
                    try:
                        failedJob = yield JobItem.load(txn, overdueJob.jobID)
                        yield failedJob.failedToRun()
                    except Exception as e:
                        # Could not mark as failed - break out of the overdue job loop
                        log.error(
                            "overdueCheck: Failed to mark failed overdue job:{}, {exc}",
                            jobID=overdueJob.jobID,
                            exc=e,
                        )
                        yield txn.abort()
                        txn = None
                        overdueJob = None
                        break
                    else:
                        # Marked the problem one as failed, so keep going and get the next overdue job
                        log.error("overdueCheck: Marked failed overdue job: {jobID}", jobID=overdueJob.jobID)
                        yield txn.commit()
                        txn = None
                        overdueJob = None
                else:
                    # Cannot mark anything as failed - break out of overdue job loop
                    log.error("overdueCheck: Cannot mark failed overdue job")
                    break
            finally:
                if txn is not None:
                    yield txn.commit()
                    txn = None
                self._inOverdueCheck = False

        if loopCounter:
            # Make sure the regular work check loop runs immediately if we processed any overdue items
            yield self.enqueuedJob()
            log.debug("overdueCheck: processed {ctr} jobs in one loop", ctr=loopCounter)

    _overdueCheckCall = None

    @inlineCallbacks
    def _overdueCheckLoop(self):
        """
        While the service is running, keep checking for any overdue items.
        """
        self._overdueCheckCall = None

        if not self.running:
            returnValue(None)

        try:
            yield self._overdueCheck()
        except Exception as e:
            log.error("_overdueCheckLoop: {exc}", exc=e)

        if not self.running:
            returnValue(None)

        self._overdueCheckCall = self.reactor.callLater(
            self.queueOverduePollInterval, self._overdueCheckLoop
        )

    def enqueuedJob(self):
        """
        Reschedule the work check loop to run right now. This should be called in response to "external" activity that
        might want to "speed up" the job queue polling because new work may have been added.
        """

        # Only need to do this if the actual poll interval is greater than the default rapid value
        if self._actualPollInterval == self.queuePollInterval:
            return

        # Bump time of last work so that we go back to the rapid (default) polling interval
        self._timeOfLastWork = time.time()

        # Reschedule the outstanding delayed call (handle exceptions by ignoring if its already running or
        # just finished)
        try:
            if self._workCheckCall is not None:
                self._workCheckCall.reset(0)
        except (AlreadyCalled, AlreadyCancelled):
            pass

    def startService(self):
        """
        Register ourselves with the database and establish all outgoing
        connections to other servers in the cluster.
        """
        super(ControllerQueue, self).startService()
        self._workCheckLoop()
        self._overdueCheckLoop()

    @inlineCallbacks
    def stopService(self):
        """
        Stop this service, terminating any incoming or outgoing connections.
        """

        yield super(ControllerQueue, self).stopService()

        if self._workCheckCall is not None:
            self._workCheckCall.cancel()
            self._workCheckCall = None

        if self._overdueCheckCall is not None:
            self._overdueCheckCall.cancel()
            self._overdueCheckCall = None

        # Wait for any active work check to finish (but no more than 1 minute)
        start = time.time()
        while self._inWorkCheck and self._inOverdueCheck:
            d = Deferred()
            self.reactor.callLater(0.5, lambda: d.callback(None))
            yield d
            if time.time() - start >= 60:
                break


class LocalPerformer(object):
    """
    Implementor of C{performJob} that does its work in the local process,
    regardless of other conditions.
    """
    implements(_IJobPerformer)

    def __init__(self, txnFactory):
        """
        Create this L{LocalPerformer} with a transaction factory.
        """
        self.txnFactory = txnFactory

    def performJob(self, job):
        """
        Perform the given job right now.
        """
        return JobItem.ultimatelyPerform(self.txnFactory, job)


class LocalQueuer(_BaseQueuer):
    """
    When work is enqueued with this queuer, it is just executed locally.
    """
    implements(IQueuer)

    def __init__(self, txnFactory, reactor=None):
        super(LocalQueuer, self).__init__()
        self.txnFactory = txnFactory
        if reactor is None:
            from twisted.internet import reactor
        self.reactor = reactor

    def choosePerformer(self):
        """
        Choose to perform the work locally.
        """
        return LocalPerformer(self.txnFactory)


class NonPerformer(object):
    """
    Implementor of C{performJob} that doesn't actual perform any work.  This
    is used in the case where you want to be able to enqueue work for someone
    else to do, but not take on any work yourself (such as a command line
    tool).
    """
    implements(_IJobPerformer)

    def performJob(self, job):
        """
        Don't perform job.
        """
        return succeed(None)


class NonPerformingQueuer(_BaseQueuer):
    """
    When work is enqueued with this queuer, it is never executed locally.
    It's expected that the polling machinery will find the work and perform it.
    """
    implements(IQueuer)

    def __init__(self, reactor=None):
        super(NonPerformingQueuer, self).__init__()
        if reactor is None:
            from twisted.internet import reactor
        self.reactor = reactor

    def choosePerformer(self):
        """
        Choose to perform the work locally.
        """
        return NonPerformer()
