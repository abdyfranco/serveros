##
# Copyright (c) 2013-2016 Apple Inc. All rights reserved.
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
Extensions to L{twisted.application.service}.
"""

__all__ = [
    "ReExecService",
]

import sys
import os
import signal

from twisted.application.service import MultiService

from twext.python.log import Logger



class ReExecService(MultiService):
    """
    A MultiService which catches SIGHUP and re-exec's the process.
    """
    log = Logger()

    def __init__(self, pidfilePath, reactor=None):
        """
        @param pidFilePath: Absolute path to the pidfile which will need to be
            removed
        @type pidFilePath: C{str}
        """
        self.pidfilePath = pidfilePath
        if reactor is None:
            from twisted.internet import reactor
        self.reactor = reactor
        MultiService.__init__(self)


    def reExec(self):
        """
        Removes pidfile, registers an exec to happen after shutdown, then
        stops the reactor.
        """
        self.log.warn("SIGHUP received - restarting")
        try:
            self.log.info("Removing pidfile: {log_source.pidfilePath}")
            os.remove(self.pidfilePath)
        except OSError:
            pass
        self.reactor.addSystemEventTrigger(
            "after", "shutdown", os.execv,
            sys.executable, [sys.executable] + sys.argv
        )
        self.reactor.stop()


    def sighupHandler(self, num, frame):
        self.reactor.callFromThread(self.reExec)


    def startService(self):
        self.previousHandler = signal.signal(signal.SIGHUP, self.sighupHandler)
        MultiService.startService(self)


    def stopService(self):
        signal.signal(signal.SIGHUP, self.previousHandler)
        MultiService.stopService(self)
