##
# Copyright (c) 2013-2017 Apple Inc. All rights reserved.
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
Tests for L{twext.python.launchd}.
"""

from subprocess import Popen, PIPE
import json
import os
import plistlib
import socket
import sys

if __name__ == '__main__':
    # This module is loaded as a launchd job by test-cases below; the following
    # code looks up an appropriate function to run.
    testID = sys.argv[1]
    a, b = testID.rsplit(".", 1)
    from twisted.python.reflect import namedAny
    try:
        namedAny(".".join([a, b.replace("test_", "job_")]))()
    finally:
        sys.stdout.flush()
        sys.stderr.flush()
        skt = socket.socket()
        skt.connect(("127.0.0.1", int(os.environ["TESTING_PORT"])))
    sys.exit(0)


try:
    from twext.python.launchd import launchActivateSocket
except ImportError:
    skip = "LaunchD not available."
else:
    skip = False

from twisted.trial.unittest import TestCase, SkipTest
from twisted.python.filepath import FilePath


class CheckInTests(TestCase):
    """
    Integration tests making sure that actual checkin with launchd results in
    the expected values.
    """

    def setUp(self):
        fp = FilePath(self.mktemp())
        fp.makedirs()
        from twisted.internet.protocol import Protocol, Factory
        from twisted.internet import reactor, defer
        d = defer.Deferred()

        class JustLetMeMoveOn(Protocol):

            def connectionMade(self):
                d.callback(None)
                self.transport.abortConnection()
        f = Factory()
        f.protocol = JustLetMeMoveOn
        port = reactor.listenTCP(0, f, interface="127.0.0.1")

        @self.addCleanup
        def goodbyePort():
            return port.stopListening()
        env = dict(os.environ)
        env["TESTING_PORT"] = repr(port.getHost().port)
        self.stdout = fp.child("stdout.txt")
        self.stderr = fp.child("stderr.txt")
        self.launchLabel = ("org.calendarserver.UNIT-TESTS." +
                            str(os.getpid()) + "." + self.id())
        plist = {
            "Label": self.launchLabel,
            "ProgramArguments": [sys.executable, "-m", __name__, self.id()],
            "EnvironmentVariables": env,
            "KeepAlive": False,
            "StandardOutPath": self.stdout.path,
            "StandardErrorPath": self.stderr.path,
            "Sockets": {
                "Awesome": [{"SecureSocketWithKey": "GeneratedSocket"}]
            },
            "RunAtLoad": True,
            "Debug": True,
        }
        self.job = fp.child("job.plist")
        self.job.setContent(plistlib.writePlistToString(plist))

        child = Popen(
            args=[
                "launchctl",
                "load",
                self.job.path,
            ],
            stdout=PIPE, stderr=PIPE,
        )
        _ignore_output, error = child.communicate()

        if child.returncode != 0 or error:
            raise SkipTest("launchctl cannot run on this system")

        return d

    @staticmethod
    def job_test():
        """
        Do something observable in a subprocess.
        """
        sys.stdout.write("Sample Value.")
        sys.stdout.flush()

    def test_test(self):
        """
        Since this test framework is somewhat finicky, let's just make sure
        that a test can complete.
        """
        self.assertEquals("Sample Value.", self.stdout.getContent())

    @staticmethod
    def job_getFDs():
        """
        Check-in via the high-level C{getLaunchDSocketFDs} API, that just gives
        us listening FDs.
        """
        sys.stdout.write(json.dumps(launchActivateSocket("Awesome")))

    def test_getFDs(self):
        """
        L{getLaunchDSocketFDs} returns a Python dictionary mapping the names of
        sockets specified in the property list to lists of integers
        representing FDs.
        """
        sockets = json.loads(self.stdout.getContent())
        self.assertEquals(len(sockets), 1)
        self.assertIsInstance(sockets[0], int)

    def tearDown(self):
        """
        Un-load the launchd job and report any errors it encountered.
        """
        os.spawnlp(os.P_WAIT, "launchctl",
                   "launchctl", "unload", self.job.path)
        err = self.stderr.getContent()
        if 'Traceback' in err:
            self.fail(err)
