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

from twisted.trial import unittest

from ...idirectory import QueryNotSupportedError
from ...expression import (
    CompoundExpression, ExistsExpression, MatchExpression, BooleanExpression,
    Operand, MatchType, MatchFlags
)
from ...test.test_xml import UnknownConstant
from .._constants import LDAPOperand
from .._service import (
    DirectoryService, RecordTypeSchema, DEFAULT_FIELDNAME_ATTRIBUTE_MAP
)
from .._util import (
    ldapQueryStringFromQueryStrings,
    ldapQueryStringFromBooleanExpression,
    ldapQueryStringFromCompoundExpression,
    ldapQueryStringFromExistsExpression,
    ldapQueryStringFromMatchExpression,
    ldapQueryStringFromExpression,
)
from ...idirectory import FieldName as BaseFieldName
from twisted.python.constants import Names, NamedConstant

TEST_FIELDNAME_MAP = dict(DEFAULT_FIELDNAME_ATTRIBUTE_MAP)
TEST_FIELDNAME_MAP[BaseFieldName.uid] = (u"__who_uid__",)


class TestFieldName(Names):
    isAwesome = NamedConstant()
    isAwesome.description = u"is awesome"
    isAwesome.valueType = bool

    isCool = NamedConstant()
    isCool.description = u"is cool"
    isCool.valueType = bool


class LDAPQueryTestCase(unittest.TestCase):
    """
    Tests for LDAP query generation.
    """

    def service(self):
        # Use intentionally funky connection info, since we don't expect
        # to connect.
        return DirectoryService(
            u"ldap://cretin/", u"o=plugh",
            fieldNameToAttributesMap=TEST_FIELDNAME_MAP
        )

    def fieldNameMap(self, service):
        """
        Create a mapping from field names to LDAP attribute names.
        The attribute names returned here are not real LDAP attribute names,
        but we don't care for these tests, since we're not actually connecting
        to LDAP.
        """
        return dict([
            (c, (c.name,))
            for c in service.fieldName.iterconstants()
        ])

    def recordTypeSchemas(self, service):
        """
        Create a mapping from record types to LDAP object class names.
        The object class names returned here are not real LDAP object class
        names, but we don't care for these tests, since we're not actually
        connecting to LDAP.
        """
        return dict([
            (
                c,
                RecordTypeSchema(
                    relativeDN=NotImplemented,  # Don't expect this to be used
                    attributes=((u"recordTypeAttribute", c.name),)
                )
            )
            for c in service.recordType.iterconstants()
        ])

    def _test_ldapQueryStringFromQueryStrings(self, queryStrings, expected):
        for operand in (LDAPOperand.AND.value, LDAPOperand.OR.value):
            compound = ldapQueryStringFromQueryStrings(operand, queryStrings)
            self.assertEquals(compound, expected.format(operand=operand))

    def test_ldapQueryStringFromQueryStrings_empty(self):
        """
        A single expression should just be returned as-is.
        """
        return self._test_ldapQueryStringFromQueryStrings((), u"")

    def test_ldapQueryStringFromQueryStrings_single(self):
        """
        A single expression should just be returned as-is.
        """
        queryStrings = (u"(x=yzzy)",)
        return self._test_ldapQueryStringFromQueryStrings(
            queryStrings, queryStrings[0]
        )

    def test_ldapQueryStringFromQueryStrings_multiple(self):
        """
        Multiple expressions should just be combined with an operator.
        """
        return self._test_ldapQueryStringFromQueryStrings(
            (u"(x=yzzy)", u"(xy=zzy)"), u"({operand}(x=yzzy)(xy=zzy))"
        )

    def test_queryStringFromExistsExpression(self):
        """
        Exists expressions produce the correct (attribute=*) string.
        """
        service = self.service()

        expression = ExistsExpression(service.fieldName.shortNames)
        queryString = ldapQueryStringFromExistsExpression(
            expression,
            self.fieldNameMap(service),
            self.recordTypeSchemas(service),
        )
        expected = u"(shortNames=*)"
        self.assertEquals(queryString, expected)

    def test_queryStringFromBooleanExpression(self):
        """
        If a field is a boolean type and the fieldNameToAttributesMap
        value for the field has an equals sign, the portion to the right
        of the equals sign is the value that represents True.  Make sure
        the query string we generate includes that value.
        """
        service = self.service()

        testFieldNameMap = {
            TestFieldName.isAwesome: ("awesome:totally",),
            TestFieldName.isCool: ("cool",),
        }

        expression = BooleanExpression(TestFieldName.isAwesome)
        queryString = ldapQueryStringFromBooleanExpression(
            expression,
            testFieldNameMap,
            self.recordTypeSchemas(service),
        )
        expected = u"(awesome=totally)"
        self.assertEquals(queryString, expected)

        expression = BooleanExpression(TestFieldName.isCool)
        queryString = ldapQueryStringFromBooleanExpression(
            expression,
            testFieldNameMap,
            self.recordTypeSchemas(service),
        )
        expected = u"(cool=true)"
        self.assertEquals(queryString, expected)

    def test_queryStringFromMatchExpression_matchTypes(self):
        """
        Match expressions with each match type produces the correct
        operator=value string.
        """
        service = self.service()

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
                service.fieldName.shortNames, u"xyzzy",
                matchType=matchType
            )
            queryString = ldapQueryStringFromMatchExpression(
                expression,
                self.fieldNameMap(service), self.recordTypeSchemas(service),
            )
            expected = u"({attribute}{expected})".format(
                attribute=u"shortNames", expected=expected
            )
            self.assertEquals(queryString, expected)

    def test_queryStringFromMatchExpression_match_not(self):
        """
        Match expression with the C{NOT} flag adds the C{!} operator.
        """
        service = self.service()

        expression = MatchExpression(
            service.fieldName.shortNames, u"xyzzy",
            flags=MatchFlags.NOT
        )
        queryString = ldapQueryStringFromMatchExpression(
            expression,
            self.fieldNameMap(service), self.recordTypeSchemas(service),
        )
        expected = u"(!{attribute}=xyzzy)".format(
            attribute=u"shortNames",
        )
        self.assertEquals(queryString, expected)

    def test_queryStringFromMatchExpression_match_caseInsensitive(self):
        """
        Match expression with the C{caseInsensitive} flag adds the C{??????}
        operator.
        """
        service = self.service()

        expression = MatchExpression(
            service.fieldName.shortNames, u"xyzzy",
            flags=MatchFlags.caseInsensitive
        )
        queryString = ldapQueryStringFromMatchExpression(
            expression,
            self.fieldNameMap(service), self.recordTypeSchemas(service),
        )
        expected = u"???????({attribute}=xyzzy)".format(
            attribute=u"shortNames",
        )
        self.assertEquals(queryString, expected)

    test_queryStringFromMatchExpression_match_caseInsensitive.todo = (
        "unimplemented"
    )

    def test_queryStringFromMatchExpression_match_quoting(self):
        """
        Special characters are quoted properly.
        """
        service = self.service()

        expression = MatchExpression(
            service.fieldName.fullNames,
            u"\\xyzzy: a/b/(c)* ~~ >=< ~~ &| \0!!"
        )
        queryString = ldapQueryStringFromMatchExpression(
            expression,
            self.fieldNameMap(service), self.recordTypeSchemas(service),
        )
        expected = u"({attribute}={expected})".format(
            attribute=u"fullNames",
            expected=(
                u"\\5Cxyzzy: a\\2Fb\\2F\\28c\\29\\2A "
                "\\7E\\7E \\3E\\3D\\3C \\7E\\7E \\26\\7C \\00!!"
            )
        )
        self.assertEquals(queryString, expected)

    def test_queryStringFromMatchExpression_unknownFieldName(self):
        """
        Unknown expression.
        """
        service = self.service()

        expression = MatchExpression(
            UnknownConstant.unknown, u"xyzzy",
        )

        self.assertRaises(
            QueryNotSupportedError,
            ldapQueryStringFromMatchExpression,
            expression,
            self.fieldNameMap(service), self.recordTypeSchemas(service),
        )

    def test_queryStringFromMatchExpression_unknownMatchType(self):
        """
        Unknown expression.
        """
        service = self.service()

        expression = MatchExpression(
            service.fieldName.shortNames, u"xyzzy",
            matchType=object()
        )

        self.assertRaises(
            QueryNotSupportedError,
            ldapQueryStringFromMatchExpression,
            expression,
            self.fieldNameMap(service), self.recordTypeSchemas(service),
        )

    def _test_queryStringFromMatchExpression_multiAttribute(
        self, flags, expected
    ):
        service = self.service()

        expression = MatchExpression(
            service.fieldName.emailAddresses, u"xyzzy",
            flags=flags,
        )

        fieldNameToAttributeMap = {
            service.fieldName.emailAddresses: (u"mail", u"alternateMail"),
        }

        queryString = ldapQueryStringFromMatchExpression(
            expression,
            fieldNameToAttributeMap, self.recordTypeSchemas(service)
        )

        self.assertEquals(queryString, expected)

    def test_queryStringFromMatchExpression_multipleAttribute(self):
        """
        Match expression when the queried field name maps to multiple
        attributes.
        """

        # We want a match for either attribute.
        expected = u"(|(mail=xyzzy)(alternateMail=xyzzy))"

        return self._test_queryStringFromMatchExpression_multiAttribute(
            MatchFlags.none, expected
        )

    def test_queryStringFromMatchExpression_multipleAttribute_not(self):
        """
        Match expression when the queried field name maps to multiple
        attributes and the NOT flag is set.
        """

        # We want a NOT match for both attributes.
        expected = u"(&(!mail=xyzzy)(!alternateMail=xyzzy))"

        return self._test_queryStringFromMatchExpression_multiAttribute(
            MatchFlags.NOT, expected
        )

    def _test_queryStringFromMatchExpression_multiRecordType(
        self, flags, expected
    ):
        service = self.service()

        recordTypeField = service.fieldName.recordType

        expression = MatchExpression(
            recordTypeField, service.recordType.user,
            flags=flags,
        )

        fieldNameToAttributeMap = self.fieldNameMap(service)

        recordTypeAttr = fieldNameToAttributeMap[recordTypeField][0]
        type1 = u"person"
        type2 = u"coolPerson"

        statusAttr = u"accountStatus"
        status1 = u"active"

        recordTypeSchemas = {
            service.recordType.user: RecordTypeSchema(
                relativeDN=NotImplemented,  # Don't expect this to be used.
                attributes=(
                    (recordTypeAttr, type1),
                    (recordTypeAttr, type2),
                    (statusAttr, status1),
                )
            )
        }

        queryString = ldapQueryStringFromMatchExpression(
            expression, fieldNameToAttributeMap, recordTypeSchemas
        )

        self.assertEquals(
            queryString,
            expected.format(
                recordType=recordTypeAttr,
                type1=type1,
                type2=type2,
                accountStatus=statusAttr,
                status1=status1,
            )
        )

    def test_queryStringFromMatchExpression_multipleRecordType(self):
        """
        Match expression when the queried field name is the record type field,
        which maps to multiple attributes.
        """

        # We want a match for both values.
        expected = (
            u"(&({recordType}={type1})"
            u"({recordType}={type2})"
            u"({accountStatus}={status1}))"
        )

        return self._test_queryStringFromMatchExpression_multiRecordType(
            MatchFlags.none, expected
        )

    def test_queryStringFromMatchExpression_multipleRecordType_not(self):
        """
        Match expression when the queried field name is the record type field,
        which maps to multiple attributes and the NOT flag is set.
        """

        # We want a NOT match for either value.
        expected = (
            u"(|(!{recordType}={type1})"
            u"(!{recordType}={type2})"
            u"(!{accountStatus}={status1}))"
        )

        return self._test_queryStringFromMatchExpression_multiRecordType(
            MatchFlags.NOT, expected
        )

    def test_queryStringFromCompoundExpression_single(
        self, queryFunction=ldapQueryStringFromCompoundExpression
    ):
        """
        Compound expression with a single sub-expression.

        Should result in the same query string as just the sub-expression
        would.

        The Operand shouldn't make any difference here, so we test AND and OR,
        expecting the same result.
        """
        service = self.service()

        for operand in (Operand.AND, Operand.OR):
            matchExpression = MatchExpression(
                service.fieldName.shortNames, u"xyzzy"
            )
            compoundExpression = CompoundExpression(
                [matchExpression],
                operand
            )
            queryString = queryFunction(
                compoundExpression,
                self.fieldNameMap(service), self.recordTypeSchemas(service),
            )
            expected = u"{match}".format(
                match=ldapQueryStringFromMatchExpression(
                    matchExpression,
                    self.fieldNameMap(service),
                    self.recordTypeSchemas(service),
                )
            )
            self.assertEquals(queryString, expected)

    def test_queryStringFromCompoundExpression_multiple(
        self, queryFunction=ldapQueryStringFromCompoundExpression
    ):
        """
        Compound expression with multiple sub-expressions.

        The sub-expressions should be grouped with the given operand.
        """
        service = self.service()

        for (operand, token) in ((Operand.AND, u"&"), (Operand.OR, u"|")):
            matchExpression1 = MatchExpression(
                service.fieldName.shortNames, u"xyzzy"
            )
            matchExpression2 = MatchExpression(
                service.fieldName.shortNames, u"plugh"
            )
            compoundExpression = CompoundExpression(
                [matchExpression1, matchExpression2],
                operand
            )
            queryString = queryFunction(
                compoundExpression,
                self.fieldNameMap(service), self.recordTypeSchemas(service),
            )
            expected = u"({op}{match1}{match2})".format(
                op=token,
                match1=ldapQueryStringFromMatchExpression(
                    matchExpression1,
                    self.fieldNameMap(service),
                    self.recordTypeSchemas(service),
                ),
                match2=ldapQueryStringFromMatchExpression(
                    matchExpression2,
                    self.fieldNameMap(service),
                    self.recordTypeSchemas(service),
                ),
            )
            self.assertEquals(queryString, expected)

    def test_queryStringFromExpression_match(self):
        """
        Match expression.
        """
        service = self.service()

        matchExpression = MatchExpression(
            service.fieldName.shortNames, u"xyzzy"
        )
        queryString = ldapQueryStringFromExpression(
            matchExpression,
            self.fieldNameMap(service), self.recordTypeSchemas(service),
        )
        expected = ldapQueryStringFromMatchExpression(
            matchExpression,
            self.fieldNameMap(service), self.recordTypeSchemas(service),
        )
        self.assertEquals(queryString, expected)

    def test_queryStringFromExpression_compound(self):
        """
        Compound expression.
        """
        self.test_queryStringFromCompoundExpression_single(
            queryFunction=ldapQueryStringFromExpression
        )
        self.test_queryStringFromCompoundExpression_multiple(
            queryFunction=ldapQueryStringFromExpression
        )

    def test_queryStringFromExpression_unknown(self):
        """
        Unknown expression.
        """
        service = self.service()

        self.assertRaises(
            QueryNotSupportedError,
            ldapQueryStringFromExpression,
            object(),
            self.fieldNameMap(service), self.recordTypeSchemas(service)
        )
