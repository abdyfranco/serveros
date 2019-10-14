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

from __future__ import print_function

"""
LDAP directory service tests.
"""

from itertools import chain

import ldap


try:
    from mockldap import MockLdap
    from mockldap.filter import (
        Test as MockLDAPFilterTest,
        UnsupportedOp as MockLDAPUnsupportedOp,
    )
    from mockldap.ldapobject import LDAPObject

    # Allow ldap.async to work with mockldap:

    def search_ext(
        self, base, scope, filterstr='(objectClass=*)',
        attrlist=None, attrsonly=0, serverctrls=None, clientctrls=None,
        timeout=-1, sizelimit=0
    ):
        value = self._search_s(base, scope, filterstr, attrlist, attrsonly)
        if sizelimit:
            value = value[:sizelimit]
        return self._add_async_result(value)


    def result3(self, msgid, all=1, timeout=None):
        return ldap.RES_SEARCH_RESULT, self._pop_async_result(msgid), None, None

    LDAPObject.search_ext = search_ext
    LDAPObject.result3 = result3

except ImportError:
    MockLdap = None

from twext.python.types import MappingProxyType
from twext.who.idirectory import RecordType
from twext.who.ldap import (
    LDAPAttribute, RecordTypeSchema, LDAPObjectClass, LDAPQueryError
)
from twext.who.util import ConstantsContainer

from twisted.python.constants import Names, NamedConstant, ValueConstant
from twisted.python.filepath import FilePath
from twisted.internet.defer import inlineCallbacks
from twisted.cred.credentials import UsernamePassword
from twisted.trial import unittest
from twisted.trial.unittest import SkipTest

from ...idirectory import FieldName as BaseFieldName
from .._service import (
    DEFAULT_FIELDNAME_ATTRIBUTE_MAP, DEFAULT_RECORDTYPE_SCHEMAS,
    LDAPBindAuthError,
    DirectoryService, DirectoryRecord,
)

from ...test import test_directory
from ...test.test_xml import (
    xmlService,
    BaseTest as XMLBaseTest, QueryMixIn,
    DirectoryServiceConvenienceTestMixIn,
    DirectoryServiceRealmTestMixIn,
    DirectoryServiceQueryTestMixIn as BaseDirectoryServiceQueryTestMixIn,
    DirectoryServiceMutableTestMixIn as BaseDirectoryServiceMutableTestMixIn
)


class TestFieldWithChoices(Names):

    none = NamedConstant()
    none.description = u"none"

    one = NamedConstant()
    one.description = u"one"

    two = NamedConstant()
    two.description = u"two"

    three = NamedConstant()
    three.description = u"three"



class TestFieldName(Names):
    multiChoice = NamedConstant()
    multiChoice.description = u"Multiple Choice Test Field"
    multiChoice.valueType = TestFieldWithChoices

    boolean1 = NamedConstant()
    boolean1.description = u"Boolean Test Field"
    boolean1.valueType = bool

    boolean2 = NamedConstant()
    boolean2.description = u"Boolean Test Field 2"
    boolean2.valueType = bool

    boolean3 = NamedConstant()
    boolean3.description = u"Boolean Test Field 3"
    boolean3.valueType = bool


TEST_FIELDNAME_MAP = dict(DEFAULT_FIELDNAME_ATTRIBUTE_MAP)
TEST_FIELDNAME_MAP[BaseFieldName.uid] = (u"__who_uid__", u"altuid")

TEST_FIELDNAME_MAP[BaseFieldName.fullNames] = (u"altname", u"cn")

TEST_FIELDNAME_MAP[TestFieldName.multiChoice] = (
    u"testField:One:one",
    u"testField:Two:two",
    u"testField:Three:three",
)

# Set up two Fields which will map to the same LDAP attribute ("foo")
# to make sure both Fields get set.  Their field values *will* be different,
# based on whether there is a colon in the attribute rule.  If the LDAP
# value matches the string following the colon, the Field value will be True.
# If there is no colon, then the string to match is literally the string "true".
TEST_FIELDNAME_MAP[TestFieldName.boolean1] = (
    u"foo:active",
)
TEST_FIELDNAME_MAP[TestFieldName.boolean2] = (
    u"foo",
)

# This Field will map to LDAP attribute "bar" and will be used for matching
# the string "true"
TEST_FIELDNAME_MAP[TestFieldName.boolean3] = (
    u"bar",
)



class TestService(DirectoryService, QueryMixIn):
    pass



class BaseTestCase(XMLBaseTest):
    """
    Tests for L{DirectoryService}.
    """

    url = "ldap://localhost/"
    baseDN = u"dc=calendarserver,dc=org"
    realmName = unicode(url)


    def setUp(self):
        if MockLdap is None:
            raise SkipTest("No MockLdap available")

        def matches(self, dn, attrs, upcall=MockLDAPFilterTest.matches):
            if upcall(self, dn, attrs):
                return True
            else:
                return mockldap_matches(self, dn, attrs)


        self.patch(MockLDAPFilterTest, "_parse_expression", mockldap_parse)
        self.patch(MockLDAPFilterTest, "matches", mockldap_matches)

        self.xmlSeedService = xmlService(self.mktemp())
        self.mockData = mockDirectoryDataFromXMLService(self.xmlSeedService)

        if False:
            from pprint import pprint
            print("")
            print("-" * 80)
            pprint(self.mockData)
            print("-" * 80)

        self.mockLDAP = MockLdap(self.mockData)
        self.mockLDAP.start()


    def tearDown(self):
        self.mockLDAP.stop()


    def service(self, **kwargs):
        svc = TestService(
            url=self.url,
            baseDN=self.baseDN,
            fieldNameToAttributesMap=TEST_FIELDNAME_MAP,
            recordTypeSchemas=MappingProxyType({
                RecordType.user: RecordTypeSchema(
                    relativeDN=u"cn=user",

                    # (objectClass=inetOrgPerson)
                    attributes=(
                        (
                            LDAPAttribute.objectClass.value,
                            LDAPObjectClass.inetOrgPerson.value,
                        ),
                    ),
                ),

                RecordType.group: RecordTypeSchema(
                    relativeDN=u"cn=group",

                    # (objectClass=groupOfNames)
                    attributes=(
                        (
                            LDAPAttribute.objectClass.value,
                            LDAPObjectClass.groupOfUniqueNames.value,
                        ),
                    ),
                ),
            }),
            **kwargs
        )
        svc.fieldName = ConstantsContainer(
            (svc.fieldName, TestFieldName)
        )
        return svc



class DirectoryServiceQueryTestMixIn(BaseDirectoryServiceQueryTestMixIn):
    def test_queryNot(self):
        return BaseDirectoryServiceQueryTestMixIn.test_queryNot(self)
    test_queryNot.todo = "?"


    def test_queryNotNoIndex(self):
        return BaseDirectoryServiceQueryTestMixIn.test_queryNotNoIndex(self)
    test_queryNotNoIndex.todo = "?"


    def test_queryStartsWithNot(self):
        return BaseDirectoryServiceQueryTestMixIn.test_queryStartsWithNot(self)
    test_queryStartsWithNot.todo = "?"


    def test_queryStartsWithNotAny(self):
        return (
            BaseDirectoryServiceQueryTestMixIn
            .test_queryStartsWithNotAny(self)
        )
    test_queryStartsWithNotAny.todo = "?"


    def test_queryStartsWithNotNoIndex(self):
        return (
            BaseDirectoryServiceQueryTestMixIn
            .test_queryStartsWithNotNoIndex(self)
        )
    test_queryStartsWithNotNoIndex.todo = "?"


    def test_queryContainsNot(self):
        return BaseDirectoryServiceQueryTestMixIn.test_queryContainsNot(self)
    test_queryContainsNot.todo = "?"


    def test_queryContainsNotNoIndex(self):
        return (
            BaseDirectoryServiceQueryTestMixIn
            .test_queryContainsNotNoIndex(self)
        )
    test_queryContainsNotNoIndex.todo = "?"



class DirectoryServiceMutableTestMixIn(BaseDirectoryServiceMutableTestMixIn):
    def test_removeRecord(self):
        return BaseDirectoryServiceMutableTestMixIn.test_removeRecord(self)
    test_removeRecord.todo = "?"


    def test_removeRecordNoExist(self):
        return (
            BaseDirectoryServiceMutableTestMixIn.test_removeRecordNoExist(self)
        )
    test_removeRecordNoExist.todo = "?"


    def test_addRecord(self):
        return BaseDirectoryServiceMutableTestMixIn.test_addRecord(self)
    test_addRecord.todo = "?"


    def test_updateRecord(self):
        return BaseDirectoryServiceMutableTestMixIn.test_updateRecord(self)
    test_updateRecord.todo = "?"


    def test_addRecordNoCreate(self):
        raise NotImplementedError()
        return (
            BaseDirectoryServiceMutableTestMixIn.test_addRecordNoCreate(self)
        )
    test_addRecordNoCreate.todo = "?"



class DirectoryServiceConnectionTestMixIn(object):
    @inlineCallbacks
    def test_connect_defaults(self):
        """
        Connect with default arguments.
        """
        service = self.service()
        connection = yield service._connect()

        self.assertEquals(connection.methods_called(), ["initialize"])

        for option in (
            ldap.OPT_TIMEOUT,
            ldap.OPT_X_TLS_CACERTFILE,
            ldap.OPT_X_TLS_CACERTDIR,
            ldap.OPT_DEBUG_LEVEL,
        ):
            self.assertRaises(KeyError, connection.get_option, option)

        self.assertFalse(connection.tls_enabled)


    @inlineCallbacks
    def test_connect_withUsernamePassword_invalid(self):
        """
        Connect with UsernamePassword credentials.
        """
        credentials = UsernamePassword(
            u"uid=wsanchez,cn=user,{0}".format(self.baseDN),
            u"__password__"
        )
        service = self.service(credentials=credentials)
        try:
            yield service._connect()
        except LDAPBindAuthError:
            pass
        else:
            self.fail("Should have raised LDAPBindAuthError")


    @inlineCallbacks
    def test_connect_withUsernamePassword_valid(self):
        """
        Connect with UsernamePassword credentials.
        """
        credentials = UsernamePassword(
            u"uid=wsanchez,cn=user,{0}".format(self.baseDN),
            u"zehcnasw"
        )
        service = self.service(credentials=credentials)
        connection = yield service._connect()

        self.assertEquals(
            connection.methods_called(),
            ["initialize", "simple_bind_s"]
        )


    @inlineCallbacks
    def test_connect_withOptions(self):
        """
        Connect with default arguments.
        """
        service = self.service(
            timeout=18,
            tlsCACertificateFile=FilePath("/path/to/cert"),
            tlsCACertificateDirectory=FilePath("/path/to/certdir"),
            _debug=True,
        )
        connection = yield service._connect()

        self.assertEquals(
            connection.methods_called(),
            [
                "initialize",
                "set_option", "set_option", "set_option", "set_option",
            ]
        )

        opt = lambda k: connection.get_option(k)

        self.assertEquals(opt(ldap.OPT_TIMEOUT), 18)
        self.assertEquals(opt(ldap.OPT_X_TLS_CACERTFILE), "/path/to/cert")
        self.assertEquals(opt(ldap.OPT_X_TLS_CACERTDIR), "/path/to/certdir")
        self.assertEquals(opt(ldap.OPT_DEBUG_LEVEL), 255)

        # Tested in test_connect_defaults, but test again here since we're
        # setting SSL options and we want to be sure they don't somehow enable
        # SSL implicitly.
        self.assertFalse(connection.tls_enabled)


    @inlineCallbacks
    def test_connect_withTLS(self):
        """
        Connect with TLS enabled.
        """
        service = self.service(useTLS=True)
        connection = yield service._connect()

        self.assertEquals(
            connection.methods_called(),
            ["initialize", "start_tls_s"]
        )

        self.assertTrue(connection.tls_enabled)



class DirectoryServiceTest(
    BaseTestCase,
    DirectoryServiceConvenienceTestMixIn,
    DirectoryServiceRealmTestMixIn,
    DirectoryServiceQueryTestMixIn,
    DirectoryServiceMutableTestMixIn,
    DirectoryServiceConnectionTestMixIn,
    test_directory.BaseDirectoryServiceTest,
    unittest.TestCase,
):
    serviceClass = DirectoryService
    directoryRecordClass = DirectoryRecord


    def test_repr(self):
        service = self.service()

        self.assertEquals(repr(service), u"<TestService u'ldap://localhost/'>")


    def test_server_down(self):
        """
        Verify an ldap.SERVER_DOWN error will retry 2 more times and that
        the connection is closed if all attempts fail.
        """

        service = self.service()

        # Verify that without a SERVER_DOWN we don't need to retry, and we
        # still have a connection in the pool
        service._recordsFromQueryString_inThread("(this=that)")
        self.assertEquals(service._retryNumber, 0)
        self.assertEquals(len(service.connections), 1)

        service._recordWithDN_inThread("cn=test")
        self.assertEquals(service._retryNumber, 0)
        self.assertEquals(len(service.connections), 1)

        # Force a search to raise SERVER_DOWN
        def raiseServerDown(*args, **kwds):
            raise ldap.SERVER_DOWN
        self.patch(LDAPObject, "search_ext", raiseServerDown)
        self.patch(LDAPObject, "search_s", raiseServerDown)

        # Now try recordsFromQueryString
        try:
            service._recordsFromQueryString_inThread("(this=that)")
        except LDAPQueryError:
            # Verify the number of times we retried
            self.assertEquals(service._retryNumber, 2)
        except:
            self.fail("Should have raised LDAPQueryError")

        # Verify the connections are all closed
        self.assertEquals(len(service.connections), 0)

        # Now try recordWithDN
        try:
            service._recordWithDN_inThread("cn=test")
        except LDAPQueryError:
            # Verify the number of times we retried
            self.assertEquals(service._retryNumber, 2)
        except:
            self.fail("Should have raised LDAPQueryError")

        # Verify the connections are all closed
        self.assertEquals(len(service.connections), 0)



class ExtraFiltersTest(BaseTestCase, unittest.TestCase):

    def test_extraFilters(self):
        extraFilters = {
            RecordType.user: "(foo=1)",
        }
        service = self.service(extraFilters=extraFilters)
        self.assertEquals(
            "(&(foo=1)(bar=2))",
            service._addExtraFilter(RecordType.user, "(bar=2)")
        )
        self.assertEquals(
            "(bar=2)",
            service._addExtraFilter(RecordType.group, "(bar=2)")
        )

        service = self.service(extraFilters=None)
        self.assertEquals(
            "(bar=2)",
            service._addExtraFilter(RecordType.group, "(bar=2)")
        )



class RecordsFromReplyTest(BaseTestCase, unittest.TestCase):

    def test_boolean(self):
        service = self.service()
        reply = (
            (
                "dn",
                {
                    "__who_uid__": u"active",
                    "foo": u"active",
                    "bar": u"true",
                    "unknown": u"unknown",  # will ignore unknown LDAP attrs
                }
            ),
            (
                "dn",
                {
                    "__who_uid__": u"inactive",
                    "foo": u"inactive",
                    "bar": u"false",
                }
            ),
        )
        records = service._recordsFromReply(reply, recordType=RecordType.user)

        self.assertTrue(records[0].boolean1)   # foo == active so True
        self.assertFalse(records[0].boolean2)  # foo != true so False
        self.assertTrue(records[0].boolean3)  # bar == true so True

        self.assertFalse(records[1].boolean1)  # foo != active so False
        self.assertFalse(records[1].boolean2)  # foo != true so False
        self.assertFalse(records[1].boolean3)  # bar != true so False


    def test_multipleChoice(self):
        service = self.service()
        reply = (
            (
                "dn",
                {
                    "__who_uid__": u"two",
                    "testField": u"Two",
                }
            ),
            (
                "dn",
                {
                    "__who_uid__": u"four",
                    "testField": u"Four",
                }
            ),
        )
        records = service._recordsFromReply(reply, recordType=RecordType.user)
        self.assertEquals(records[0].multiChoice, TestFieldWithChoices.two)

        # "Four" is not a valid value, so it won't get set
        self.assertFalse(service.fieldName.multiChoice in records[1].fields)


    def test_multipleAttributes(self):
        """
        Multiple LDAP attributes can be the source for a single record field.
        If it's a single-value field, the *first* attribute in the map that
        is in the results will be used for the field value.  If it's a multi
        value field, then the value will be a list extended from the values
        in each associated LDAP attribute, in the order of the map entry.

        For example, in the test map above, the uid field is mapped to __who_uid__
        and altuid in that order.  When the LDAP results are parsed, the __who_uid__
        attribute is checked first, and if it has a value it is used; otherwise
        the value from altuid would be used.

        In the case of "fullNames" which is multi-value, because the order in the test
        map is "altname" then "cn", when the LDAP results are parsed, fullNames
        will end up being set to a list comprising of first the altname values
        then the cn values.
        """
        service = self.service()
        reply = (
            (
                "dn",
                {
                    "__who_uid__": u"zero",
                    "altuid": u"altzero",
                    "cn": [u"cn-name", "another-cn"],
                    "altname": [u"alt-name", "another-alt"],
                }
            ),
            (
                "dn",
                {
                    "altuid": u"one",
                    "altname": [u"alt-name"],
                    "cn": [u"cn-name"],
                }
            ),
            (
                "dn",
                {
                    "__who_uid__": u"two",
                    "cn": [u"cn-name"],
                }
            ),
        )
        records = service._recordsFromReply(reply, recordType=RecordType.user)

        self.assertEquals(records[0].uid, "zero")
        self.assertEquals(records[0].fullNames, ["alt-name", "another-alt", "cn-name", "another-cn"])
        self.assertEquals(records[1].uid, "one")
        self.assertEquals(records[1].fullNames, ["alt-name", "cn-name"])
        self.assertEquals(records[2].uid, "two")
        self.assertEquals(records[2].fullNames, ["cn-name"])



def mockDirectoryDataFromXMLService(service):
    dc0 = u"org"
    dc1 = u"calendarserver"

    data = {
        u"dc={dc0}".format(dc0=dc0): dict(dc=dc0),
        u"dc={dc1},dc={dc0}".format(dc1=dc1, dc0=dc0): dict(dc=[dc1, dc0]),
        u"cn=user,dc={dc1},dc={dc0}".format(dc1=dc1, dc0=dc0): dict(dc=[dc1, dc0]),
        u"cn=group,dc={dc1},dc={dc0}".format(dc1=dc1, dc0=dc0): dict(dc=[dc1, dc0]),
    }

    def toUnicode(obj):
        if isinstance(obj, (NamedConstant, ValueConstant)):
            return obj.name

        if isinstance(obj, (tuple, list)):
            return [unicode(x) for x in obj]

        return unicode(obj)


    def tuplify(record, fieldName):
        fieldValue = record.fields[fieldName]

        if fieldName is BaseFieldName.recordType:
            schema = DEFAULT_RECORDTYPE_SCHEMAS[fieldValue]

            return schema.attributes

        else:

            # mockldap requires data in this structure: {dn: {attr: [values]}}
            if not isinstance(fieldValue, (tuple, list)):
                fieldValue = [fieldValue]

            # Question: why convert to unicode?  We get utf-8 encoded strings
            # back from a real LDAP server, don't we?
            value = toUnicode(fieldValue)

            return (
                (name, value)
                for name in TEST_FIELDNAME_MAP.get(
                    fieldName, (u"__" + fieldName.name,)
                )
            )

    for records in service.index[service.fieldName.uid].itervalues():
        for record in records:
            dn = u"uid={uid},cn={cn},dc={dc1},dc={dc0}".format(
                uid=record.shortNames[0],
                cn=record.recordType.name,
                dc1=dc1, dc0=dc0
            )

            recordData = dict(chain(*(
                list(tuplify(record, fieldName))
                for fieldName in service.fieldName.iterconstants()
                if fieldName in record.fields
            )))

            data[dn] = recordData

    return data



#
# mockldap patches
# See https://bitbucket.org/psagers/mockldap/issue/4/
#

class WildcardExpression(object):
    first = None
    middle = []
    last = None



def mockldap_parse(self):
    match = self.TEST_RE.match(self.content)

    if match is None:
        raise ldap.FILTER_ERROR(
            u"Failed to parse filter item %r at pos %d"
            % (self.content, self.start)
        )

    self.attr, self.op, valueExpression = match.groups()

    if self.op != "=":
        raise MockLDAPUnsupportedOp(
            u"Operation %r is not supported" % (self.op,)
        )


    def unescape(value):
        return self.UNESCAPE_RE.sub(lambda m: chr(int(m.group(1), 16)), value)

    if (u"*" in valueExpression):
        # Wild card expression

        values = [unescape(value) for value in valueExpression.split(u"*")]

        exp = WildcardExpression()

        if not valueExpression.startswith(u"*"):
            exp.first = values.pop(0)

        if not valueExpression.endswith(u"*"):
            exp.last = values.pop(-1)

        exp.middle = values

        self.value = exp

    else:
        self.value = unescape(valueExpression)



def mockldap_matches(self, dn, attrs):
    values = attrs.get(self.attr)

    if values is None:
        return False

    if type(values) is unicode:
        values = [values]

    # Case insensitive?  Always true in LDAP, it seems.
    if True:
        normalize = lambda s: s.lower()
    else:
        normalize = lambda s: s

    if isinstance(self.value, WildcardExpression):
        def match_substrings_in_order(substrings, value, start, end):
            for substring in substrings:
                if not substring:
                    continue

                i = value.find(substring, start, end)
                if i == -1:
                    # Match fails for this substring
                    return False

                # Move start up past this substring substring before testing
                # the next substring
                start = i + len(substring)

            # No mismatches
            return True

        for value in values:
            value = normalize(value)

            start = 0
            end = len(value)

            if self.value.first is not None:
                if not value.startswith(normalize(self.value.first)):
                    continue
                start = len(self.value.first)

            if self.value.last is not None:
                if not value[start:].endswith(normalize(self.value.last)):
                    continue
                end -= len(self.value.last)

            if self.value.middle:
                if not match_substrings_in_order(
                    (normalize(s) for s in self.value.middle),
                    value, start, end
                ):
                    continue

            return True

        return False

    return normalize(self.value) in (normalize(s) for s in values)
