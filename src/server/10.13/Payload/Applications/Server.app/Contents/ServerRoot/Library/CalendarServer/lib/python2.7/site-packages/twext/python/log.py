# -*- test-case-name: twext.python.test.test_log-*-
##
# Copyright (c) 2006-2017 Apple Inc. All rights reserved.
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

from twisted.logger import Logger as _Logger, LogLevel, LogPublisher, \
    FileLogObserver, FilteringLogObserver, LogLevelFilterPredicate, \
    formatEventAsClassicLogText, formatTime
from twisted.python import log
from twisted import logger


class Logger(_Logger):
    """
    Logging object.
    """

    filterPublisher = None
    filterObserver = None
    filterPredicate = LogLevelFilterPredicate(defaultLogLevel=LogLevel.info)

    logBeginner = None

    @classmethod
    def makeFilteredFileLogObserver(cls, stream, withTime=True):
        """
        For a child process that has its stdout captured by the master process to be logged by the master,
        we strip out the time from the log entry since the master process will always add one. Setting
        C{withTime} to L{False} will ensure no time is generated.
        """
        assert (
            cls.filterPublisher is None and
            cls.filterObserver is None
        ), "Only call this once"

        timeFormat = formatTime if withTime else lambda _: u""
        cls.filterObserver = FileLogObserver(stream, lambda event: formatEventAsClassicLogText(event, formatTime=timeFormat))
        cls.filterPublisher = LogPublisher(cls.filterObserver)
        return cls.filterPublisher

    @classmethod
    def addFilteredObserver(cls, observer):
        log.addObserver(FilteringLogObserver(
            observer,
            [cls.filterPredicate]
        ))

    @classmethod
    def beginLoggingTo(cls, observers, redirectStandardIO=True):
        if cls.logBeginner:
            cls.logBeginner.beginLoggingTo(observers, redirectStandardIO=redirectStandardIO)

    def emit(self, level, format=None, **kwargs):
        """
        Fix {Logger.emit} to work with our legacy use and handle utf-8 properly.
        """

        # For old style logging kwargs will be empty but the format string could contain "{}", so
        # We turn the format string into a kwarg
        if len(kwargs) == 0:
            kwargs["msg"] = format
            format = "{msg}"

        # Assume that any L{bytes} in the format or kwargs are utf-8 encoded strings
        if format is not None and isinstance(format, bytes):
            format = format.decode("utf-8")
        for k, v in kwargs.items():
            if isinstance(v, bytes):
                kwargs[k] = v.decode("utf-8")

        super(Logger, self).emit(level, format=format, **kwargs)

    def levels(self):
        """
        Get the L{LogLevelFilterPredicate} associated with this logger.
        """
        return self.filterPredicate


# Always replace Twisted's legacy log beginner with one that does LogLevel filtering
class FilteringLogBeginnerWrapper(object):

    def __init__(self, beginner):
        self.beginner = beginner

    def beginLoggingTo(
        self, observers, discardBuffer=False, redirectStandardIO=True
    ):
        new_observers = []
        for observer in observers:
            new_observers.append(FilteringLogObserver(observer, [Logger.filterPredicate]))
        self.beginner.beginLoggingTo(new_observers, discardBuffer, redirectStandardIO)


Logger.logBeginner = FilteringLogBeginnerWrapper(log.theLogPublisher._logBeginner)
logger.globalLogBeginner = Logger.logBeginner
