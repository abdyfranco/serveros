##
# Copyright (c) 2005-2017 Apple Inc. All rights reserved.
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

from cStringIO import StringIO
from twext.python.log import Logger
from twisted.logger import LogLevel, LogPublisher, textFileLogObserver
from twisted.trial import unittest


class LogPublisherTests(unittest.TestCase):
    """
    Tests for L{Logger}.
    """

    def test_old_style(self):
        """
        L{Logger} handles old style log strings.
        """
        observer = LogPublisher()

        observed = []
        observer.addObserver(observed.append)

        sio = StringIO()
        observer.addObserver(textFileLogObserver(sio))

        logger = Logger(observer=observer)

        index = 0
        logger.info("test")
        self.assertEqual(observed[index]["log_level"], LogLevel.info)
        self.assertEqual(observed[index]["log_format"], u"{msg}")
        self.assertEqual(observed[index]["msg"], u"test")
        self.assertEqual(sio.getvalue().splitlines()[index].split("#info] ")[1], "test")

        index += 1
        logger.info("test {}")
        self.assertEqual(observed[index]["log_level"], LogLevel.info)
        self.assertEqual(observed[index]["log_format"], u"{msg}")
        self.assertEqual(observed[index]["msg"], u"test {}")
        self.assertEqual(sio.getvalue().splitlines()[index].split("#info] ")[1], "test {}")

        index += 1
        logger.info("test {foo}")
        self.assertEqual(observed[index]["log_level"], LogLevel.info)
        self.assertEqual(observed[index]["log_format"], u"{msg}")
        self.assertEqual(observed[index]["msg"], u"test {foo}")
        self.assertEqual(sio.getvalue().splitlines()[index].split("#info] ")[1], "test {foo}")

    def test_utf8(self):
        """
        L{Logger} handles utf8 log strings and format args.
        """
        observer = LogPublisher()

        observed = []
        observer.addObserver(observed.append)

        sio = StringIO()
        observer.addObserver(textFileLogObserver(sio))

        logger = Logger(observer=observer)

        index = 0
        logger.info("t\xc3\xa9st")
        self.assertEqual(observed[index]["log_level"], LogLevel.info)
        self.assertEqual(observed[index]["log_format"], u"{msg}")
        self.assertEqual(observed[index]["msg"], u"t\xe9st")
        self.assertEqual(sio.getvalue().splitlines()[index].split("#info] ")[1], "t\xc3\xa9st")

        index += 1
        logger.info("{str}", str="t\xc3\xa9st")
        self.assertEqual(observed[index]["log_level"], LogLevel.info)
        self.assertEqual(observed[index]["log_format"], u"{str}")
        self.assertEqual(observed[index]["str"], u"t\xe9st")
        self.assertEqual(sio.getvalue().splitlines()[index].split("#info] ")[1], "t\xc3\xa9st")

        index += 1
        logger.info("T\xc3\xa9st {str}", str="t\xc3\xa9st")
        self.assertEqual(observed[index]["log_level"], LogLevel.info)
        self.assertEqual(observed[index]["log_format"], u"T\xe9st {str}")
        self.assertEqual(observed[index]["str"], u"t\xe9st")
        self.assertEqual(sio.getvalue().splitlines()[index].split("#info] ")[1], "T\xc3\xa9st t\xc3\xa9st")
