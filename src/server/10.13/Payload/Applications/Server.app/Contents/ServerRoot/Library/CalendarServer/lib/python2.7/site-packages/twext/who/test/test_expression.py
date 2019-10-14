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
Directory service expression tests.
"""

from twisted.trial import unittest
from uuid import UUID

from ..idirectory import FieldName
from ..expression import MatchExpression, MatchType, MatchFlags


class MatchFlagsTest(unittest.TestCase):
    """
    Tests for L{MatchFlags}.
    """

    def test_predicator_none(self):
        """
        Predicator for flags without L{MatchFlags.NOT} does not invert.
        """
        predicator = MatchFlags.predicator(MatchFlags.none)

        for boolean in (True, False):
            self.assertEquals(bool(predicator(boolean)), boolean)

    def test_predicator_NOT(self):
        """
        Predicator for flags with L{MatchFlags.NOT} does not invert.
        """
        predicator = MatchFlags.predicator(MatchFlags.NOT)

        for boolean in (True, False):
            self.assertNotEquals(bool(predicator(boolean)), boolean)

    def test_normalizer_none(self):
        """
        Normalizer for flags without L{MatchFlags.caseInsensitive} does not
        lowercase.
        """
        normalizer = MatchFlags.normalizer(MatchFlags.none)

        self.assertEquals(normalizer(u"ThInGo"), u"ThInGo")

    def test_normalizer_insensitive(self):
        """
        Normalizer for flags with L{MatchFlags.caseInsensitive} lowercases.
        """
        normalizer = MatchFlags.normalizer(MatchFlags.caseInsensitive)

        self.assertEquals(normalizer(u"ThInGo"), u"thingo")


class MatchExpressionTest(unittest.TestCase):
    """
    Tests for L{MatchExpression}.
    """

    def test_initBadType_name(self):
        """
        L{MatchExpression.__init__} raises if the field name is not a
        L{NamedConstant}.
        """
        self.assertRaises(
            TypeError,
            MatchExpression, u"uid", u"some value"
        )

    def test_initBadType_value(self):
        """
        L{MatchExpression.__init__} raises if the field value doesn't match the
        expected type for the field.
        """
        # guid field expects a UUID, not a string.
        self.assertRaises(
            TypeError,
            MatchExpression,
            FieldName.guid, u"00000000-0000-0000-0000-000000000000"
        )

    def test_repr_name(self):
        """
        L{MatchExpression.__repr__} emits field name and value.
        """
        self.assertEquals(
            "<MatchExpression: u'full names' equals u'Wilfredo Sanchez'>",
            repr(MatchExpression(
                FieldName.fullNames,
                u"Wilfredo Sanchez",
            )),
        )

    def test_repr_type(self):
        """
        L{MatchExpression.__repr__} emits match type.
        """
        self.assertEquals(
            "<MatchExpression: u'full names' contains u'Sanchez'>",
            repr(MatchExpression(
                FieldName.fullNames,
                u"Sanchez",
                matchType=MatchType.contains,
            )),
        )

    def test_repr_flags(self):
        """
        L{MatchExpression.__repr__} emits flags.
        """
        self.assertEquals(
            "<MatchExpression: u'full names' starts with u'Wilfredo' (not)>",
            repr(MatchExpression(
                FieldName.fullNames,
                u"Wilfredo",
                matchType=MatchType.startsWith,
                flags=MatchFlags.NOT,
            )),
        )
        self.assertEquals(
            "<MatchExpression: u'full names' starts with u'Wilfredo' "
            "(case insensitive|not)>",
            repr(MatchExpression(
                FieldName.fullNames,
                u"Wilfredo",
                matchType=MatchType.startsWith,
                flags=(MatchFlags.NOT | MatchFlags.caseInsensitive),
            )),
        )

    def test_match_equals(self):
        """
        L{MatchExpression.match} with L{MatchType.equals}.
        """
        expression = MatchExpression(
            FieldName.fullNames, u"Morgen",
            matchType=MatchType.equals,
        )
        self.assertTrue(expression.match(u"Morgen"))
        self.assertFalse(expression.match(u"Wilfredo"))

    def test_match_equals_not(self):
        """
        L{MatchExpression.match} with L{MatchType.equals} and
        L{MatchFlags.NOT}.
        """
        expression = MatchExpression(
            FieldName.fullNames, u"Morgen",
            matchType=MatchType.equals,
            flags=MatchFlags.NOT,
        )
        self.assertFalse(expression.match(u"Morgen"))
        self.assertTrue(expression.match(u"Wilfredo"))

    def test_match_startsWith(self):
        """
        L{MatchExpression.match} with L{MatchType.startsWith}.
        """
        expression = MatchExpression(
            FieldName.fullNames, u"Mor",
            matchType=MatchType.startsWith,
        )
        self.assertTrue(expression.match(u"Morgen"))
        self.assertFalse(expression.match(u"Wilfredo"))

    def test_match_startsWith_not(self):
        """
        L{MatchExpression.match} with L{MatchType.startsWith} and
        L{MatchFlags.NOT}.
        """
        expression = MatchExpression(
            FieldName.fullNames, u"Mor",
            matchType=MatchType.startsWith,
            flags=MatchFlags.NOT,
        )
        self.assertFalse(expression.match(u"Morgen"))
        self.assertTrue(expression.match(u"Wilfredo"))

    def test_match_endsWith(self):
        """
        L{MatchExpression.match} with L{MatchType.endsWith}.
        """
        expression = MatchExpression(
            FieldName.fullNames, u"gen",
            matchType=MatchType.endsWith,
        )
        self.assertTrue(expression.match(u"Morgen"))
        self.assertFalse(expression.match(u"Wilfredo"))

    def test_match_endsWith_not(self):
        """
        L{MatchExpression.match} with L{MatchType.endsWith} and
        L{MatchFlags.NOT}.
        """
        expression = MatchExpression(
            FieldName.fullNames, u"gen",
            matchType=MatchType.endsWith,
            flags=MatchFlags.NOT,
        )
        self.assertFalse(expression.match(u"Morgen"))
        self.assertTrue(expression.match(u"Wilfredo"))

    def test_match_contains(self):
        """
        L{MatchExpression.match} with L{MatchType.contains}.
        """
        expression = MatchExpression(
            FieldName.fullNames, u"org",
            matchType=MatchType.contains,
        )
        self.assertTrue(expression.match(u"Morgen"))
        self.assertFalse(expression.match(u"Wilfredo"))

    def test_match_contains_not(self):
        """
        L{MatchExpression.match} with L{MatchType.contains} and
        L{MatchFlags.NOT}.
        """
        expression = MatchExpression(
            FieldName.fullNames, u"org",
            matchType=MatchType.contains,
            flags=MatchFlags.NOT,
        )
        self.assertFalse(expression.match(u"Morgen"))
        self.assertTrue(expression.match(u"Wilfredo"))

    def test_match_lessThan(self):
        """
        L{MatchExpression.match} with L{MatchType.lessThan}.
        """
        expression = MatchExpression(
            FieldName.fullNames, u"Morgen",
            matchType=MatchType.lessThan,
        )
        self.assertTrue(expression.match(u"Glyph"))  # Sorry, Glyph
        self.assertFalse(expression.match(u"Wilfredo"))

    def test_match_lessThan_not(self):
        """
        L{MatchExpression.match} with L{MatchType.lessThan} and
        L{MatchFlags.NOT}.
        """
        expression = MatchExpression(
            FieldName.fullNames, u"Morgen",
            matchType=MatchType.lessThan,
            flags=MatchFlags.NOT,
        )
        self.assertFalse(expression.match(u"Glyph"))
        self.assertTrue(expression.match(u"Wilfredo"))

    def test_match_greaterThan(self):
        """
        L{MatchExpression.match} with L{MatchType.greaterThan}.
        """
        expression = MatchExpression(
            FieldName.fullNames, u"Morgen",
            matchType=MatchType.greaterThan,
        )
        self.assertTrue(expression.match(u"Wilfredo"))  # Woot!
        self.assertFalse(expression.match(u"Glyph"))

    def test_match_greaterThan_not(self):
        """
        L{MatchExpression.match} with L{MatchType.greaterThan} and
        L{MatchFlags.NOT}.
        """
        expression = MatchExpression(
            FieldName.fullNames, u"Morgen",
            matchType=MatchType.greaterThan,
            flags=MatchFlags.NOT,
        )
        self.assertFalse(expression.match(u"Wilfredo"))
        self.assertTrue(expression.match(u"Glyph"))

    def test_match_lessThanOrEqualTo(self):
        """
        L{MatchExpression.match} with L{MatchType.lessThanOrEqualTo}.
        """
        expression = MatchExpression(
            FieldName.fullNames, u"Morgen",
            matchType=MatchType.lessThanOrEqualTo,
        )
        self.assertTrue(expression.match(u"Glyph"))
        self.assertTrue(expression.match(u"Morgen"))
        self.assertFalse(expression.match(u"Wilfredo"))

    def test_match_lessThanOrEqualTo_not(self):
        """
        L{MatchExpression.match} with L{MatchType.lessThanOrEqualTo} and
        L{MatchFlags.NOT}.
        """
        expression = MatchExpression(
            FieldName.fullNames, u"Morgen",
            matchType=MatchType.lessThanOrEqualTo,
            flags=MatchFlags.NOT,
        )
        self.assertFalse(expression.match(u"Glyph"))
        self.assertFalse(expression.match(u"Morgen"))
        self.assertTrue(expression.match(u"Wilfredo"))

    def test_match_greaterThanOrEqualTo(self):
        """
        L{MatchExpression.match} with L{MatchType.greaterThanOrEqualTo}.
        """
        expression = MatchExpression(
            FieldName.fullNames, u"Morgen",
            matchType=MatchType.greaterThanOrEqualTo,
        )
        self.assertTrue(expression.match(u"Wilfredo"))
        self.assertTrue(expression.match(u"Morgen"))
        self.assertFalse(expression.match(u"Glyph"))

    def test_match_greaterThanOrEqualTo_not(self):
        """
        L{MatchExpression.match} with L{MatchType.greaterThanOrEqualTo} and
        L{MatchFlags.NOT}.
        """
        expression = MatchExpression(
            FieldName.fullNames, u"Morgen",
            matchType=MatchType.greaterThanOrEqualTo,
            flags=MatchFlags.NOT,
        )
        self.assertFalse(expression.match(u"Wilfredo"))
        self.assertFalse(expression.match(u"Morgen"))
        self.assertTrue(expression.match(u"Glyph"))

    def test_non_unicode_value(self):
        """
        L{MatchExpression.match} with L{MatchType.equals},
        L{MatchFlags.caseInsensitive} and a UUID value (which cannot be
        lower()'d)
        """
        uuidValue = UUID("95F868E5-EFBD-4BFE-8DFB-25C3BC5CCDDA")
        expression = MatchExpression(
            FieldName.guid, uuidValue,
            matchType=MatchType.equals,
            flags=MatchFlags.caseInsensitive,

        )
        self.assertFalse(expression.match(u"Bogus"))
        self.assertTrue(expression.match(uuidValue))
