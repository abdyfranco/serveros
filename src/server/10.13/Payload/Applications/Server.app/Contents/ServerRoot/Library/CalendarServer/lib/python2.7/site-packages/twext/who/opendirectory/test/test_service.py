##
# Copyright (c) 2010-2017 Apple Inc. All rights reserved.
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
OpenDirectory service tests.
"""

from uuid import UUID

from twisted.trial import unittest

from ...expression import (
    CompoundExpression, Operand, MatchExpression, MatchType, MatchFlags
)
from .._constants import ODAttribute
from .._service import DirectoryService
from ...idirectory import QueryNotSupportedError


class OpenDirectoryServiceTestCase(unittest.TestCase):
    """
    Tests for L{DirectoryService}.
    """

    def setUp(self):
        self.service = DirectoryService()

    def tearDown(self):
        self.service._deletePool()

    def test_queryFromMatchExpression_recordType(self):
        """
        Make sure queryFromMatchExpression handles recordType correctly
        """
        query = self.service._queryFromMatchExpression(
            MatchExpression(
                self.service.fieldName.shortNames, u"xyzzy"
            ),
            recordType=self.service.recordType.group
        )
        # FIXME:
        # Actually, how do we inspect the query object to peek at the
        # recordType that got set?
        query

    test_queryFromMatchExpression_recordType.todo = ""

    def test_queryStringFromMatchExpression_matchTypes(self):
        """
        Match expressions with each match type produces the correct
        operator=value string.
        """
        for matchType, expected in (
            (MatchType.equals, u"=xyzzy"),
            (MatchType.startsWith, u"=xyzzy*"),
            (MatchType.endsWith, u"=*xyzzy"),
            (MatchType.contains, u"=*xyzzy*"),
            (MatchType.lessThan, u"<xyzzy"),
            (MatchType.greaterThan, u">xyzzy"),
            (MatchType.lessThanOrEqualTo, u"<=xyzzy"),
            (MatchType.greaterThanOrEqualTo, u">=xyzzy"),
        ):
            expression = MatchExpression(
                self.service.fieldName.shortNames, u"xyzzy",
                matchType=matchType
            )
            queryString, recordTypes = self.service._queryStringAndRecordTypesFromExpression(expression)
            self.assertEquals(
                recordTypes,
                set(
                    [
                        u"dsRecTypeStandard:Users",
                        u"dsRecTypeStandard:Groups",
                        u"dsRecTypeStandard:Places",
                        u"dsRecTypeStandard:Resources",
                    ]
                )
            )
            self.assertEquals(
                queryString,
                u"({attribute}{expected})".format(
                    attribute=ODAttribute.shortName.value, expected=expected
                )
            )

    def test_queryStringFromMatchExpression_match_not(self):
        """
        Match expression with the C{NOT} flag adds the C{!} operator.
        """
        expression = MatchExpression(
            self.service.fieldName.shortNames, u"xyzzy",
            flags=MatchFlags.NOT
        )
        queryString, recordTypes = self.service._queryStringAndRecordTypesFromExpression(expression)
        self.assertEquals(
            recordTypes,
            set(
                [
                    u"dsRecTypeStandard:Users",
                    u"dsRecTypeStandard:Groups",
                    u"dsRecTypeStandard:Places",
                    u"dsRecTypeStandard:Resources",
                ]
            )
        )
        self.assertEquals(
            queryString,
            u"(!{attribute}=xyzzy)".format(
                attribute=ODAttribute.shortName.value,
            )
        )

    def test_queryStringFromMatchExpression_match_caseInsensitive(self):
        """
        Match expression with the C{caseInsensitive} flag adds the C{??????}
        operator.
        """
        expression = MatchExpression(
            self.service.fieldName.shortNames, u"xyzzy",
            flags=MatchFlags.caseInsensitive
        )
        queryString, recordTypes = self.service._queryStringAndRecordTypesFromExpression(expression)
        self.assertEquals(
            recordTypes,
            set(
                [
                    u"dsRecTypeStandard:Users",
                    u"dsRecTypeStandard:Groups",
                    u"dsRecTypeStandard:Places",
                    u"dsRecTypeStandard:Resources",
                ]
            )
        )
        self.assertEquals(
            queryString,
            u"???????({attribute}=xyzzy)".format(
                attribute=ODAttribute.shortName.value,
            )
        )

    test_queryStringFromMatchExpression_match_caseInsensitive.todo = (
        "unimplemented"
    )

    def test_queryStringFromMatchExpression_match_quoting(self):
        """
        Special characters are quoted properly.
        """
        expression = MatchExpression(
            self.service.fieldName.fullNames,
            u"\\xyzzy: a/b/(c)* ~~ >=< ~~ &| \0!!"
        )
        queryString, recordTypes = self.service._queryStringAndRecordTypesFromExpression(expression)
        self.assertEquals(
            recordTypes,
            set(
                [
                    u"dsRecTypeStandard:Groups", u"dsRecTypeStandard:Users",
                    u"dsRecTypeStandard:Places", u"dsRecTypeStandard:Resources",
                ]
            )
        )
        self.assertEquals(
            queryString,
            u"({attribute}={expected})".format(
                attribute=ODAttribute.fullName.value,
                expected=(
                    u"\\5Cxyzzy: a\\2Fb\\2F\\28c\\29\\2A "
                    "\\7E\\7E \\3E\\3D\\3C \\7E\\7E \\26\\7C \\00!!"
                )
            )
        )

    def test_queryStringFromExpression(self):
        # CompoundExpressions

        expression = CompoundExpression(
            [
                MatchExpression(
                    self.service.fieldName.uid, u"a",
                    matchType=MatchType.contains
                ),
                MatchExpression(
                    self.service.fieldName.guid, UUID(int=0),
                    matchType=MatchType.contains
                ),
                MatchExpression(
                    self.service.fieldName.shortNames, u"c",
                    matchType=MatchType.contains
                ),
                MatchExpression(
                    self.service.fieldName.emailAddresses, u"d",
                    matchType=MatchType.startsWith
                ),
                MatchExpression(
                    self.service.fieldName.fullNames, u"e",
                    matchType=MatchType.equals
                ),
            ],
            Operand.AND
        )
        queryString, recordTypes = self.service._queryStringAndRecordTypesFromExpression(expression)
        self.assertEquals(
            recordTypes,
            set(
                [
                    u"dsRecTypeStandard:Users",
                    u"dsRecTypeStandard:Groups",
                    u"dsRecTypeStandard:Places",
                    u"dsRecTypeStandard:Resources",
                ]
            )
        )
        self.assertEquals(
            queryString,
            (
                u"(&(dsAttrTypeStandard:GeneratedUID=*a*)"
                u"(dsAttrTypeStandard:GeneratedUID="
                u"*00000000-0000-0000-0000-000000000000*)"
                u"(dsAttrTypeStandard:RecordName=*c*)"
                u"(dsAttrTypeStandard:EMailAddress=d*)"
                u"(dsAttrTypeStandard:RealName=e))"
            )
        )

        expression = CompoundExpression(
            [
                MatchExpression(
                    self.service.fieldName.shortNames, u"a",
                    matchType=MatchType.contains
                ),
                MatchExpression(
                    self.service.fieldName.emailAddresses, u"b",
                    matchType=MatchType.startsWith
                ),
                MatchExpression(
                    self.service.fieldName.fullNames, u"c",
                    matchType=MatchType.equals
                ),
            ],
            Operand.OR
        )
        queryString, recordTypes = self.service._queryStringAndRecordTypesFromExpression(expression)
        self.assertEquals(
            recordTypes,
            set(
                [
                    u"dsRecTypeStandard:Users",
                    u"dsRecTypeStandard:Groups",
                    u"dsRecTypeStandard:Places",
                    u"dsRecTypeStandard:Resources",
                ]
            )
        )
        self.assertEquals(
            queryString,
            (
                u"(|(dsAttrTypeStandard:RecordName=*a*)"
                u"(dsAttrTypeStandard:EMailAddress=b*)"
                u"(dsAttrTypeStandard:RealName=c))"
            )
        )

    def test_queryStringFromExpression_recordType(self):
        """
        Record type in expression
        """
        # AND expression
        expression = CompoundExpression(
            [
                MatchExpression(
                    self.service.fieldName.shortNames,
                    u"xyzzy",
                    matchType=MatchType.equals
                ),
                MatchExpression(
                    self.service.fieldName.recordType,
                    self.service.recordType.group,
                    matchType=MatchType.equals
                ),
                MatchExpression(
                    self.service.fieldName.recordType,
                    self.service.recordType.user,
                    matchType=MatchType.equals
                ),
            ],
            Operand.AND
        )
        queryString, recordTypes = self.service._queryStringAndRecordTypesFromExpression(expression)
        self.assertEquals(recordTypes, set())
        self.assertEquals(
            queryString,
            u"(dsAttrTypeStandard:RecordName=xyzzy)"
        )

        # AND subexpression
        expression = CompoundExpression(
            [
                MatchExpression(
                    self.service.fieldName.shortNames,
                    u"xxxxx",
                    matchType=MatchType.equals
                ),
                CompoundExpression(
                    [

                        MatchExpression(
                            self.service.fieldName.recordType,
                            self.service.recordType.group,
                            matchType=MatchType.equals
                        ),
                        MatchExpression(
                            self.service.fieldName.shortNames,
                            u"yyyyy",
                            matchType=MatchType.equals
                        ),
                    ],
                    Operand.AND
                ),
            ],
            Operand.OR
        )
        queryString, recordTypes = self.service._queryStringAndRecordTypesFromExpression(expression)
        self.assertEquals(set(recordTypes), set([u"dsRecTypeStandard:Groups", ]))
        self.assertEquals(
            queryString,
            u"("
            u"|(dsAttrTypeStandard:RecordName=xxxxx)"
            u"(dsAttrTypeStandard:RecordName=yyyyy)"
            u")"
        )
        # NOR expression
        expression = CompoundExpression(
            [
                MatchExpression(
                    self.service.fieldName.shortNames,
                    u"xxxxx",
                    matchType=MatchType.equals
                ),
                MatchExpression(
                    self.service.fieldName.shortNames,
                    u"yyyyy",
                    matchType=MatchType.equals
                ),
                MatchExpression(
                    self.service.fieldName.recordType,
                    self.service.recordType.user,
                    matchType=MatchType.equals,
                    flags=MatchFlags.NOT
                ),
            ],
            Operand.OR
        )
        queryString, recordTypes = self.service._queryStringAndRecordTypesFromExpression(expression)
        self.assertEquals(
            set(recordTypes),
            set(
                [
                    u"dsRecTypeStandard:Groups",
                    u"dsRecTypeStandard:Places",
                    u"dsRecTypeStandard:Resources",
                ]
            )
        )
        self.assertEquals(
            queryString,
            u"("
            u"|(dsAttrTypeStandard:RecordName=xxxxx)"
            u"(dsAttrTypeStandard:RecordName=yyyyy)"
            u")"
        )

        # Simple AND expression -> empty query string
        expression = CompoundExpression(
            [
                MatchExpression(
                    self.service.fieldName.recordType,
                    self.service.recordType.user,
                    matchType=MatchType.equals
                ),
            ],
            Operand.AND
        )
        queryString, recordTypes = self.service._queryStringAndRecordTypesFromExpression(expression)
        self.assertEquals(set(recordTypes), set([u"dsRecTypeStandard:Users"]))
        self.assertEquals(
            queryString,
            u""
        )

        # recordType OR expression raises QueryNotSupportedError
        expression = CompoundExpression(
            [
                MatchExpression(
                    self.service.fieldName.recordType,
                    self.service.recordType.user,
                    matchType=MatchType.equals
                ),
            ],
            Operand.OR
        )
        self.assertRaises(
            QueryNotSupportedError,
            self.service._queryStringAndRecordTypesFromExpression,
            expression,
        )
