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
Directory service utility tests.
"""

from itertools import chain

from twisted.trial import unittest
from twisted.python.constants import (
    Names, NamedConstant, Values, ValueConstant, Flags, FlagConstant
)

from ..idirectory import DirectoryServiceError
from ..util import ConstantsContainer, uniqueResult, describe


class Tools(Names):
    hammer = NamedConstant()
    hammer.description = u"nail pounder"

    screwdriver = NamedConstant()
    screwdriver.description = u"screw twister"

    @staticmethod
    def isPounder(tool):
        if getattr(tool, "description", "").endswith("pounder"):
            return True
        return False


class MoreTools(Names):
    saw = NamedConstant()
    saw.description = u"z maker"

    mallet = NamedConstant()
    mallet.description = u"soft pounder"


class Instruments(Names):
    hammer = NamedConstant()
    chisel = NamedConstant()


class Statuses(Values):
    OK = ValueConstant(200)
    NOT_OK = ValueConstant(500)

    @staticmethod
    def isError(status):
        return status.value < 500


class MoreStatuses(Values):
    MOOLAH = ValueConstant(402)

    @staticmethod
    def isError(status):
        return status.value < 400


class Switches(Flags):
    r = FlagConstant()
    g = FlagConstant()
    b = FlagConstant()

    r.description = u"red"
    g.description = u"green"
    b.description = u"blue"

    black = FlagConstant()


class ConstantsContainerTest(unittest.TestCase):
    """
    Tests for L{ConstantsContainer}.
    """

    def test_constants_from_constants(self):
        """
        Initialize a container from some constants.
        """
        constants = set((Tools.hammer, Tools.screwdriver, Instruments.chisel))
        self.assertEquals(
            set(ConstantsContainer(constants).iterconstants()),
            constants,
        )

    def test_constants_from_containers(self):
        """
        Initialize a container from other containers.
        """
        self.assertEquals(
            set(ConstantsContainer((Tools, MoreTools)).iterconstants()),
            set(chain(Tools.iterconstants(), MoreTools.iterconstants())),
        )

    def test_constants_from_constantsContainers(self):
        """
        Initialize a container from other L{ConstantsContainer}s.
        """
        self.assertEquals(
            set(
                ConstantsContainer((
                    ConstantsContainer((Tools,)),
                    ConstantsContainer((MoreTools,)),
                )).iterconstants()
            ),
            set(chain(Tools.iterconstants(), MoreTools.iterconstants())),
        )

    def test_constants_from_iterables(self):
        """
        Initialize a container from iterables of constants.
        """
        self.assertEquals(
            set(
                ConstantsContainer((
                    Tools.iterconstants(), MoreTools.iterconstants()
                )).iterconstants()
            ),
            set(chain(Tools.iterconstants(), MoreTools.iterconstants())),
        )

    def test_conflictingClasses(self):
        """
        A container can't contain two constants with different types.
        """
        self.assertRaises(TypeError, ConstantsContainer, (Tools, Switches))

    def test_conflictingNames_different(self):
        """
        A container can't contain two different constants with the same name.
        """
        self.assertRaises(ValueError, ConstantsContainer, (Tools, Instruments))

    def test_conflictingNames_same(self):
        """
        A container can combine containers which contain the same constants.
        """
        ConstantsContainer((Tools, Tools))

    def test_notConstantClass(self):
        """
        A container can't contain random classes.
        """
        self.assertRaises(TypeError, ConstantsContainer, (self.__class__,))

    def test_attrs(self):
        """
        Constants are assessible via attributes.
        """
        container = ConstantsContainer((
            Tools.hammer, Tools.screwdriver, Instruments.chisel
        ))

        self.assertEquals(container.hammer, Tools.hammer)
        self.assertEquals(container.screwdriver, Tools.screwdriver)
        self.assertEquals(container.chisel, Instruments.chisel)
        self.assertRaises(AttributeError, lambda: container.plugh)

    def test_iterconstants(self):
        """
        L{ConstantsContainer.iterconstants}C{()} produces the contained
        constants.
        """
        constants = set((Tools.hammer, Tools.screwdriver, Instruments.chisel))
        container = ConstantsContainer(constants)

        self.assertEquals(
            set(container.iterconstants()),
            constants,
        )

    def test_staticmethod(self):
        """
        Static methods from source containers are accessible via attributes.
        """
        container = ConstantsContainer((Tools, MoreTools))

        self.assertTrue(container.isPounder(container.hammer))
        self.assertTrue(container.isPounder(container.mallet))
        self.assertFalse(container.isPounder(container.screwdriver))
        self.assertFalse(container.isPounder(container.saw))

    def test_conflictingMethods(self):
        """
        A container can't contain two static methods with the same name.
        """
        self.assertRaises(
            ValueError, ConstantsContainer, (Statuses, MoreStatuses)
        )

    def test_lookupByName(self):
        """
        Constants are assessible via L{ConstantsContainer.lookupByName}.
        """
        constants = set((
            Instruments.hammer,
            Tools.screwdriver,
            Instruments.chisel,
        ))
        container = ConstantsContainer(constants)

        self.assertEquals(
            container.lookupByName("hammer"),
            Instruments.hammer,
        )
        self.assertEquals(
            container.lookupByName("screwdriver"),
            Tools.screwdriver,
        )
        self.assertEquals(
            container.lookupByName("chisel"),
            Instruments.chisel,
        )

        self.assertRaises(
            ValueError,
            container.lookupByName, "plugh",
        )

    def test_lookupByValue(self):
        """
        Containers with L{ValueConstant}s are assessible via
        L{ConstantsContainer.lookupByValue}.
        """
        container = ConstantsContainer((Statuses,))

        self.assertEquals(container.lookupByValue(200), Statuses.OK)
        self.assertEquals(container.lookupByValue(500), Statuses.NOT_OK)

        self.assertRaises(ValueError, container.lookupByValue, 999)


class UtilTest(unittest.TestCase):
    """
    Miscellaneous tests.
    """

    def test_uniqueResult(self):
        """
        L{uniqueResult} returns the single value it is given, raises
        L{DirectoryServiceError} is given more than one, or returns L{None}
        if given on values.
        """
        self.assertEquals(None, uniqueResult(()))
        self.assertEquals(1, uniqueResult((1,)))
        self.assertRaises(DirectoryServiceError, uniqueResult, (1, 2, 3))

    def test_describeConstant(self):
        """
        L{describe} will look up the C{description} attribute on constants and
        fall back to the C{name} attribute.
        """
        self.assertEquals(u"nail pounder", describe(Tools.hammer))
        self.assertEquals(u"hammer", describe(Instruments.hammer))

    def test_describeFlags(self):
        """
        L{describe} on flags will describe the contained flags by joining their
        descriptions with C{"|"}.
        """
        self.assertEquals(u"blue", describe(Switches.b))
        self.assertEquals(u"green|red", describe(Switches.r | Switches.g))
        self.assertEquals(u"black|blue", describe(Switches.b | Switches.black))

    def test_describeObject(self):
        """
        L{describe} will cast non-cosntant objects to L{unicode}.
        """
        for obj in (object(), u"string", b"data"):
            self.assertEquals(describe(obj), unicode(obj))
