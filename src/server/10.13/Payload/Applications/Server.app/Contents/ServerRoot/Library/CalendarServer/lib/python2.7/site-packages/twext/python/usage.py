##
# Copyright (c) 2016-2017 Apple Inc. All rights reserved.
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
Command line usage.
"""

__all__ = [
    "Executable",
    "Options",
    "UsageError",
    "exit",
    "ExitStatus",
]

import sys
import signal
from os import getpid, kill

from twisted.python.constants import Values, ValueConstant
from twisted.python.usage import Options as TwistedOptions, UsageError
from twisted.python.filepath import FilePath
from twisted.logger import (
    globalLogBeginner, textFileLogObserver, jsonFileLogObserver,
    FilteringLogObserver, LogLevelFilterPredicate,
    LogLevel, InvalidLogLevelError,
    Logger,
)


class Executable(object):
    """
    Executable.
    """

    log = Logger()

    @classmethod
    def main(cls, argv=sys.argv):
        if hasattr(cls, "Options"):
            options = cls.Options()

            try:
                options.parseOptions(argv[1:])
            except UsageError as e:
                exit(ExitStatus.EX_USAGE, "Error: {}\n\n{}".format(e, options))

        else:
            options = None

        instance = cls(options)
        try:
            instance.run()
        except Exception as e:
            exit(ExitStatus.EX_SOFTWARE, "Error: {}\n".format(e))

    def __init__(self, options):
        self.options = options

    def run(self):
        self.postOptions()
        self.optionallyKill()
        self.writePIDFile()
        self.startLogging()
        self.runReactor()
        self.shutDown()

    def postOptions(self):
        pass

    def optionallyKill(self):
        pidFile = self.options.get("pidFile")

        if self.options.get("kill"):
            if pidFile is None:
                exit(ExitStatus.EX_USAGE, "--pid-file required to use --kill")
            else:
                pid = ""
                try:
                    for pid in pidFile.open():
                        break
                except (IOError, OSError):
                    exit(ExitStatus.EX_DATAERR, "Unable to read pid file.")
                try:
                    pid = int(pid)
                except ValueError:
                    exit(ExitStatus.EX_DATAERR, "Invalid pid file.")

            self.startLogging()
            self.log.info("Terminating process: {pid}", pid=pid)

            kill(pid, signal.SIGTERM)

            exit(ExitStatus.EX_OK)

    def writePIDFile(self):
        pidFile = self.options.get("pidFile")
        if pidFile is not None:
            pid = getpid()
            pidFile.setContent(u"{}\n".format(pid).encode("utf-8"))

    def startLogging(self):
        logFile = self.options.get("logFile", sys.stderr)

        fileLogObserverFactory = self.options.get(
            "fileLogObserverFactory", textFileLogObserver
        )

        fileObserver = fileLogObserverFactory(logFile)

        logLevelPredicate = LogLevelFilterPredicate(
            defaultLogLevel=self.options.get("logLevel", LogLevel.info)
        )

        filteringObserver = FilteringLogObserver(
            fileObserver, [logLevelPredicate]
        )

        globalLogBeginner.beginLoggingTo([filteringObserver])

    def runReactor(self):
        from twisted.internet import reactor
        reactor.callWhenRunning(self.whenRunning)
        self.log.info("Starting reactor...")
        reactor.run()

    def whenRunning(self):
        pass

    def shutDown(self):
        pidFile = self.options.get("pidFile")
        if pidFile is not None:
            pidFile.remove()


class Options(TwistedOptions):
    """
    Options.
    """

    def opt_version(self):
        """
        Print version and exit.
        """
        from deps import __version__ as version
        exit(ExitStatus.EX_OK, "{}".format(version))

    def opt_pid_file(self, name):
        """
        File to store process ID in.
        """
        self["pidFile"] = FilePath(name)

    def opt_kill(self):
        """
        Exit running application.  (Requires --pid-file.)
        """
        self["kill"] = True

    def opt_log_file(self, fileName):
        """
        Log to file.

        ("-" for stdout, "+" for stderr. default: "+")
        """
        if fileName == "-":
            self["logFile"] = sys.stdout
            return

        if fileName == "+":
            self["logFile"] = sys.stderr
            return

        try:
            self["logFile"] = open(fileName, "a")
            self.setdefault("fileLogObserverFactory", jsonFileLogObserver)
        except EnvironmentError as e:
            exit(
                ExitStatus.EX_CANTCREAT,
                "Unable to open log file {!r}: {}".format(fileName, e)
            )

    def opt_log_format(self, format):
        """
        Set log file format to one of: (text, json).

        (default: text for stdout/stderr, otherwise json)
        """
        format = format.lower()

        if format == "text":
            self["fileLogObserverFactory"] = textFileLogObserver
        elif format == "json":
            self["fileLogObserverFactory"] = jsonFileLogObserver
        else:
            exit(
                ExitStatus.EX_USAGE,
                "Invalid log format: {}".format(format)
            )
        self["logFormat"] = format

    def opt_log_level(self, levelName):
        """
        Set default log level to one of: {levelNames}.

        (default: info)
        """
        try:
            self["logLevel"] = LogLevel.levelWithName(levelName)
        except InvalidLogLevelError:
            exit(
                ExitStatus.EX_USAGE,
                "Invalid log level: {}".format(levelName)
            )

    # Format the docstring for opt_log_level.
    opt_log_level.__doc__ = opt_log_level.__doc__.format(
        levelNames=", ".join([l.name for l in LogLevel.iterconstants()])
    )


def exit(status, message=None):
    """
    Exit the python interpreter.
    """
    if message:
        if status == ExitStatus.EX_OK:
            out = sys.stdout
        else:
            out = sys.stderr
        out.write(message)
        out.write("\n")

    sys.exit(status.value)


class ExitStatus(Values):
    """
    Exit status codes for system programs.
    """

    EX__BASE = 64

    EX_OK = ValueConstant(0)              # No error
    EX_USAGE = ValueConstant(EX__BASE)       # Command line usage error
    EX_DATAERR = ValueConstant(EX__BASE + 1)   # Invalid user data
    EX_NOINPUT = ValueConstant(EX__BASE + 2)   # Can't open input file
    EX_NOUSER = ValueConstant(EX__BASE + 3)   # Can't look up user
    EX_NOHOST = ValueConstant(EX__BASE + 4)   # Can't look up host
    EX_UNAVAILABLE = ValueConstant(EX__BASE + 5)   # Service unavailable
    EX_SOFTWARE = ValueConstant(EX__BASE + 6)   # Internal software error
    EX_OSERR = ValueConstant(EX__BASE + 7)   # System error
    EX_OSFILE = ValueConstant(EX__BASE + 8)   # System file missing
    EX_CANTCREAT = ValueConstant(EX__BASE + 9)   # Can't create output file
    EX_IOERR = ValueConstant(EX__BASE + 10)  # I/O error
    EX_TEMPFAIL = ValueConstant(EX__BASE + 11)  # Temporary failure
    EX_PROTOCOL = ValueConstant(EX__BASE + 12)  # Remote protocol error
    EX_NOPERM = ValueConstant(EX__BASE + 13)  # Permission denied
    EX_CONFIG = ValueConstant(EX__BASE + 14)  # Configuration error

    EX__MAX = EX_CONFIG.value
