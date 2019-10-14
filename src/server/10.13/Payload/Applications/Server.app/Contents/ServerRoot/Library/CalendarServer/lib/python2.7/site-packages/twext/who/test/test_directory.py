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

from __future__ import print_function

"""
Generic directory service base implementation tests.
"""

from uuid import UUID
from textwrap import dedent

from zope.interface.verify import verifyObject, BrokenMethodImplementation

from twisted.python.constants import (
    Names, NamedConstant, Values, ValueConstant, Flags, FlagConstant
)
from twisted.trial import unittest
from twisted.internet.defer import inlineCallbacks
from twisted.internet.defer import succeed

from ..idirectory import (
    InvalidDirectoryRecordError,
    QueryNotSupportedError, NotAllowedError,
    RecordType, FieldName,
    IDirectoryService, IDirectoryRecord,
)
from ..expression import CompoundExpression, Operand
from ..directory import DirectoryService, DirectoryRecord
from ..util import ConstantsContainer


class TestDirectoryService(DirectoryService):
    recordType = ConstantsContainer((RecordType,))


class StubDirectoryService(TestDirectoryService):
    """
    Stub directory service with some built-in records and an implementation
    of C{recordsFromNonCompoundExpression}.
    """

    def __init__(self, realmName):
        super(StubDirectoryService, self).__init__(realmName)

        self.records = RecordStorage(self, DirectoryRecord)
        self.seenExpressions = []

    def recordsFromExpression(self, expression, recordTypes=None, records=None):
        self.seenExpressions.append(expression)
        return (
            super(StubDirectoryService, self)
            .recordsFromExpression(expression, recordTypes=recordTypes)
        )

    def recordsFromNonCompoundExpression(
        self, expression, recordTypes=None, records=None,
        limitResults=None, timeoutSeconds=None
    ):
        """
        This implementation handles three expressions:

        The expression C{u"None"} will match no records.

        The expressions C{u"twistedmatrix.com"} and C{u"calendarserver.org"}
        will match records that have an email address ending with the
        given expression.
        """
        if expression == u"None":
            return succeed([])

        if expression in (u"twistedmatrix.com", u"calendarserver.org"):
            result = []
            for record in self.records:
                for email in record.emailAddresses:
                    if email.endswith(expression):
                        result.append(record)
                        break
            return succeed(result)

        return (
            super(StubDirectoryService, self)
            .recordsFromNonCompoundExpression(
                expression, recordTypes=recordTypes, records=records
            )
        )


class ServiceMixIn(object):
    """
    MixIn that sets up a service appropriate for testing.
    """

    realmName = u"xyzzy"

    def service(self, subClass=None):
        if subClass is None:
            subClass = self.serviceClass
        return subClass(self.realmName)


class BaseDirectoryServiceTest(ServiceMixIn):
    """
    Tests for L{DirectoryService} and subclasses.
    """

    def test_interface(self):
        """
        Service instance conforms to L{IDirectoryService}.
        """
        service = self.service()
        try:
            verifyObject(IDirectoryService, service)
        except BrokenMethodImplementation as e:
            self.fail(e)

    def test_init(self):
        """
        Test initialization.
        """
        service = self.service()
        self.assertEquals(service.realmName, self.realmName)

    def test_repr(self):
        """
        L{DirectoryService.repr} returns the expected string.
        """
        service = self.service()
        self.assertEquals(
            repr(service),
            "<{0} {1!r}>".format(
                self.serviceClass.__name__, self.realmName
            )
        )

    def test_recordTypes(self):
        """
        L{DirectoryService.recordTypes} returns the supported set of record
        types. For L{DirectoryService}, that's the set of constants in the
        L{DirectoryService.recordType} attribute.
        """
        service = self.service()
        self.assertEquals(
            set(service.recordTypes()),
            set(service.recordType.iterconstants())
        )

    def test_recordsFromNonCompoundExpression_unknownExpression(self):
        """
        L{DirectoryService.recordsFromNonCompoundExpression} with an unknown
        expression type fails with L{QueryNotSupportedError}.
        """
        service = self.service()
        return self.assertFailure(
            service.recordsFromNonCompoundExpression(object()),
            QueryNotSupportedError
        )

    @inlineCallbacks
    def test_recordsFromNonCompoundExpression_emptyRecords(self):
        """
        L{DirectoryService.recordsFromNonCompoundExpression} with an unknown
        expression type and an empty C{records} set returns an empty result.
        """
        service = self.service()
        result = (
            yield service.recordsFromNonCompoundExpression(
                object(), records=()
            )
        )
        self.assertEquals(set(result), set(()))

    def test_recordsFromNonCompoundExpression_nonEmptyRecords(self):
        """
        L{DirectoryService.recordsFromNonCompoundExpression} with an unknown
        expression type and a non-empty C{records} fails with
        L{QueryNotSupportedError}.
        """
        service = self.service()

        wsanchez = self.directoryRecordClass(
            service,
            {
                service.fieldName.recordType: service.recordType.user,
                service.fieldName.uid: u"__wsanchez__",
                service.fieldName.shortNames: [u"wsanchez"],
            }
        )

        return self.assertFailure(
            service.recordsFromNonCompoundExpression(
                object(), records=((wsanchez,))
            ),
            QueryNotSupportedError
        )

    def test_recordsFromExpression_unknownExpression(self):
        """
        L{DirectoryService.recordsFromExpression} with an unknown expression
        type fails with L{QueryNotSupportedError}.
        """
        service = self.service()
        return self.assertFailure(
            service.recordsFromExpression(object()),
            QueryNotSupportedError
        )

    @inlineCallbacks
    def test_recordsFromExpression_emptyExpression(self):
        """
        L{DirectoryService.recordsFromExpression} with an empty
        L{CompoundExpression} returns an empty result.
        """
        service = self.service()

        for operand in Operand.iterconstants():
            result = yield service.recordsFromExpression(
                CompoundExpression((), operand)
            )
            self.assertEquals(set(result), set(()))

    def _unimplemented(self):
        """
        Unimplemented test.
        """
        raise NotImplementedError("Subclasses should implement this test.")

    test_recordWithUID = _unimplemented
    test_recordWithGUID = _unimplemented
    test_recordsWithRecordType = _unimplemented
    test_recordWithShortName = _unimplemented
    test_recordsWithEmailAddress = _unimplemented

    def test_updateRecordsEmpty(self):
        """
        Updating no records is not an error.
        """
        service = self.service()
        for create in (True, False):
            service.updateRecords((), create=create),

    def test_removeRecordsEmpty(self):
        """
        Removing no records is allowed.
        """
        service = self.service()

        service.removeRecords(())


class DirectoryServiceRecordsFromExpressionTest(
    unittest.TestCase, ServiceMixIn
):
    """
    Tests for L{DirectoryService.recordsFromExpression}.
    """

    serviceClass = StubDirectoryService
    directoryRecordClass = DirectoryRecord

    @inlineCallbacks
    def test_recordsFromExpression_single(self):
        """
        L{DirectoryService.recordsFromExpression} handles a single expression.
        """
        service = self.service()

        result = yield service.recordsFromExpression("twistedmatrix.com")

        self.assertEquals(
            set(
                (
                    u"__wsanchez__",
                    u"__glyph__",
                    u"__exarkun__",
                    u"__dreid__",
                )
            ),
            set((record.uid for record in result))
        )

    @inlineCallbacks
    def test_recordsFromExpression_OR(self):
        """
        L{DirectoryService.recordsFromExpression} handles a
        L{CompoundExpression} with L{Operand.OR}.
        """
        service = self.service()

        result = yield service.recordsFromExpression(
            CompoundExpression(
                (
                    u"twistedmatrix.com",
                    u"calendarserver.org",
                ),
                Operand.OR
            )
        )

        self.assertEquals(
            set(
                (
                    u"__wsanchez__",
                    u"__glyph__",
                    u"__sagen__",
                    u"__cdaboo__",
                    u"__dre__",
                    u"__exarkun__",
                    u"__dreid__",
                )
            ),
            set((record.uid for record in result))
        )

    @inlineCallbacks
    def test_recordsFromExpression_AND(self):
        """
        L{DirectoryService.recordsFromExpression} handles a
        L{CompoundExpression} with L{Operand.AND}.
        """
        service = self.service()

        result = yield service.recordsFromExpression(
            CompoundExpression(
                (
                    u"twistedmatrix.com",
                    u"calendarserver.org",
                ),
                Operand.AND
            )
        )

        self.assertEquals(
            set(
                (
                    u"__wsanchez__",
                    u"__glyph__",
                )
            ),
            set((record.uid for record in result))
        )

    @inlineCallbacks
    def test_recordsFromExpression_AND_optimized(self):
        """
        L{DirectoryService.recordsFromExpression} handles a
        L{CompoundExpression} with L{Operand.AND}, and when one of the
        expression matches no records, the subsequent expressions are skipped.
        """
        service = self.service()

        compoundExpression = CompoundExpression(
            (
                u"twistedmatrix.com",
                u"None",
                u"calendarserver.org",
            ),
            Operand.AND
        )

        result = yield service.recordsFromExpression(compoundExpression)

        self.assertEquals(
            set(()),
            set((record.uid for record in result))
        )

        self.assertEquals(
            [compoundExpression, u"twistedmatrix.com", u"None"],
            service.seenExpressions
        )

    def test_recordsFromExpression_unknownOperand(self):
        """
        L{DirectoryService.recordsFromExpression} fails with
        L{QueryNotSupportedError} when given a L{CompoundExpression} with an
        unknown operand.
        """
        service = self.service()

        results = service.recordsFromExpression(
            CompoundExpression(
                (
                    u"twistedmatrix.com",
                    u"calendarserver.org",
                ),
                WackyOperand.WHUH
            )
        )

        return self.assertFailure(results, QueryNotSupportedError)


class DirectoryServiceConvenienceTest(
    unittest.TestCase, BaseDirectoryServiceTest
):
    """
    Tests for L{DirectoryService} convenience methods.
    """

    serviceClass = TestDirectoryService
    directoryRecordClass = DirectoryRecord

    def test_recordWithUID(self):
        """
        L{DirectoryService.recordWithUID} fails with L{QueryNotSupportedError}.
        """
        service = self.service()

        return self.assertFailure(
            service.recordWithUID(u""),
            QueryNotSupportedError
        )

    def test_recordWithGUID(self):
        """
        L{DirectoryService.recordWithGUID} fails with
        L{QueryNotSupportedError}.
        """
        service = self.service()

        return self.assertFailure(
            service.recordWithGUID(UUID(int=0)),
            QueryNotSupportedError
        )

    @inlineCallbacks
    def test_recordsWithRecordType(self):
        """
        L{DirectoryService.recordsWithRecordType} fails with
        L{QueryNotSupportedError}.
        """
        service = self.service()

        for recordType in RecordType.iterconstants():
            yield self.assertFailure(
                service.recordsWithRecordType(recordType),
                QueryNotSupportedError
            )

    @inlineCallbacks
    def test_recordWithShortName(self):
        """
        L{DirectoryService.recordWithShortName} fails with
        L{QueryNotSupportedError}.
        """
        service = self.service()

        for recordType in RecordType.iterconstants():
            yield self.assertFailure(
                service.recordWithShortName(recordType, u""),
                QueryNotSupportedError
            )

    def test_recordsWithEmailAddress(self):
        """
        L{DirectoryService.recordsWithEmailAddress} fails with
        L{QueryNotSupportedError}.
        """
        service = self.service()

        return self.assertFailure(
            service.recordsWithEmailAddress(u"a@b"),
            QueryNotSupportedError
        )


class BaseDirectoryServiceImmutableTest(ServiceMixIn):
    """
    Tests for immutable directory services.
    """

    @inlineCallbacks
    def test_updateRecordsNotAllowed(self):
        """
        Updating records is not allowed.
        """
        service = self.service()

        newRecord = self.directoryRecordClass(
            service,
            fields={
                service.fieldName.uid: u"__plugh__",
                service.fieldName.recordType: service.recordType.user,
                service.fieldName.shortNames: (u"plugh",),
            }
        )

        for create in (True, False):
            yield self.assertFailure(
                service.updateRecords((newRecord,), create=create),
                NotAllowedError,
            )

    def test_removeRecordsNotAllowed(self):
        """
        Removing records is not allowed.
        """
        service = self.service()

        return self.assertFailure(
            service.removeRecords((u"foo",)),
            NotAllowedError,
        )


class DirectoryServiceImmutableTest(
    unittest.TestCase, BaseDirectoryServiceImmutableTest,
):
    """
    Tests for immutable L{DirectoryService}.
    """

    serviceClass = TestDirectoryService
    directoryRecordClass = DirectoryRecord


class BaseDirectoryRecordTest(ServiceMixIn):
    """
    Tests for directory records.
    """

    fields_wsanchez = {
        FieldName.uid: u"UID:wsanchez",
        FieldName.recordType: RecordType.user,
        FieldName.shortNames: (u"wsanchez", u"wilfredo_sanchez"),
        FieldName.fullNames: (
            u"Wilfredo Sanchez",
            u"Wilfredo Sanchez Vega",
        ),
        FieldName.emailAddresses: (
            u"wsanchez@calendarserver.org",
            u"wsanchez@example.com",
        )
    }

    fields_glyph = {
        FieldName.uid: u"UID:glyph",
        FieldName.recordType: RecordType.user,
        FieldName.shortNames: (u"glyph",),
        FieldName.fullNames: (u"Glyph Lefkowitz",),
        FieldName.emailAddresses: (u"glyph@calendarserver.org",)
    }

    fields_sagen = {
        FieldName.uid: u"UID:sagen",
        FieldName.recordType: RecordType.user,
        FieldName.shortNames: (u"sagen",),
        FieldName.fullNames: (u"Morgen Sagen",),
        FieldName.emailAddresses: (u"sagen@CalendarServer.org",)
    }

    fields_nobody = {
        FieldName.uid: u"UID:nobody",
        FieldName.recordType: RecordType.user,
        FieldName.shortNames: (u"nobody",),
    }

    fields_no_shortnames = {
        FieldName.uid: u"UID:no_shortnames",
        FieldName.recordType: RecordType.user,
    }

    fields_empty_shortnames = {
        FieldName.uid: u"UID:empty_shortnames",
        FieldName.recordType: RecordType.user,
        FieldName.shortNames: (),
    }

    fields_none_password = {
        FieldName.uid: u"UID:nobody",
        FieldName.recordType: RecordType.user,
        FieldName.shortNames: (u"nobody",),
        FieldName.password: None,
    }

    fields_staff = {
        FieldName.uid: u"UID:staff",
        FieldName.recordType: RecordType.group,
        FieldName.shortNames: (u"staff",),
        FieldName.fullNames: (u"Staff",),
        FieldName.emailAddresses: (u"staff@CalendarServer.org",)
    }

    def makeRecord(self, fields=None, service=None):
        """
        Create a directory record from fields and a service.

        @param fields: Record fields.
        @type fields: L{dict} with L{FieldName} keys

        @param service: Directory service.
        @type service: L{DirectoryService}

        @return: A directory record.
        @rtype: L{DirectoryRecord}
        """
        if fields is None:
            fields = self.fields_wsanchez
        if service is None:
            service = self.service()
        return self.directoryRecordClass(service, fields)

    def test_interface(self):
        """
        L{DirectoryRecord} complies with L{IDirectoryRecord}.
        """
        record = self.makeRecord()
        try:
            verifyObject(IDirectoryRecord, record)
        except BrokenMethodImplementation as e:
            self.fail(e)

    def test_init(self):
        """
        L{DirectoryRecord} initialization sets service and fields.
        """
        service = self.service()
        wsanchez = self.makeRecord(self.fields_wsanchez, service=service)

        self.assertEquals(wsanchez.service, service)
        self.assertEquals(wsanchez.fields, self.fields_wsanchez)

    def test_initWithNonConstantFieldName(self):
        """
        Directory record field names must be L{NamedConstant}s.
        """
        service = self.service()

        fields = self.fields_wsanchez.copy()
        fields["name"] = u"value"  # Key is not a NamedConstant.

        self.assertRaises(
            InvalidDirectoryRecordError,
            self.makeRecord, fields, service=service
        )

    def test_initWithNoUID(self):
        """
        Directory records must have a UID.
        """
        fields = self.fields_wsanchez.copy()
        del fields[FieldName.uid]
        self.assertRaises(InvalidDirectoryRecordError, self.makeRecord, fields)

        fields = self.fields_wsanchez.copy()
        fields[FieldName.uid] = u""
        self.assertRaises(InvalidDirectoryRecordError, self.makeRecord, fields)

    def test_initWithNoRecordType(self):
        """
        Directory records must have a record type.
        """
        fields = self.fields_wsanchez.copy()
        del fields[FieldName.recordType]
        self.assertRaises(InvalidDirectoryRecordError, self.makeRecord, fields)

        fields = self.fields_wsanchez.copy()
        fields[FieldName.recordType] = None
        self.assertRaises(InvalidDirectoryRecordError, self.makeRecord, fields)

    def test_initWithBogusRecordType(self):
        """
        Directory records must have a known record type.
        """
        fields = self.fields_wsanchez.copy()
        fields[FieldName.recordType] = object()
        self.assertRaises(InvalidDirectoryRecordError, self.makeRecord, fields)

    def test_initNormalizeEmailLowercase(self):
        """
        Email addresses are normalized to lowercase.
        """
        sagen = self.makeRecord(self.fields_sagen)

        self.assertEquals(
            sagen.fields[FieldName.emailAddresses],
            (u"sagen@calendarserver.org",)
        )

    def test_initWithIncorrectFieldTypes(self):
        """
        Raise L{TypeError} if fields are of the wrong type.
        """
        self.assertRaises(
            InvalidDirectoryRecordError,
            self.makeRecord,
            {
                FieldName.uid: "UID:wsanchez",  # Not unicode.
                FieldName.recordType: RecordType.user,
                FieldName.shortNames: (u"wsanchez",),
            }
        )

        self.assertRaises(
            InvalidDirectoryRecordError,
            self.makeRecord,
            {
                FieldName.uid: u"UID:wsanchez",
                FieldName.recordType: RecordType.user,
                FieldName.shortNames: ("wsanchez",),  # Not unicode.
            }
        )

    def test_noneIsAllowed(self):
        """
        Verify a value of None is allowed
        """
        service = self.service()
        record = self.makeRecord(self.fields_none_password, service=service)

        self.assertEquals(record.password, None)

    def _test_containerClassFieldType(self, callback):
        """
        Scaffold for test_initWithContainerClassFieldType_*.
        """

        class ConstantHavingDirectoryService(self.serviceClass):
            fieldName = ConstantsContainer((
                self.serviceClass.fieldName, ConstantHavingFieldName
            ))

        service = self.service(subClass=ConstantHavingDirectoryService)
        fieldName = service.fieldName

        baseFields = {
            FieldName.uid: u"UID:sam",
            FieldName.recordType: RecordType.user,
            FieldName.shortNames: (u"sam",),
        }

        for fieldName, validValue, almostValidValue in (
            (fieldName.eyeColor, Color.blue, OtherColor.mauve),
            (fieldName.language, Language.English, OtherLanguage.French),
            (fieldName.access, Access.read, OtherAccess.delete),
        ):
            fields = baseFields.copy()
            callback(service, fields, fieldName, validValue, almostValidValue)

    def test_initWithContainerClassFieldType_valid(self):
        """
        If C{valueType} is L{Names}, L{Values} or L{Flags}, the expected type
        is L{NamedConstant}, L{ValueConstant} or L{FlagConstant}, respectively.
        Check that these can be used as fields.
        """
        def callback(service, fields, fieldName, validValue, almostValidValue):
            fields.update({fieldName: validValue})
            record = self.makeRecord(fields=fields, service=service)
            self.assertEquals(record.fields[fieldName], validValue)

        self._test_containerClassFieldType(callback)

    def test_initWithContainerClassFieldType_invalid(self):
        """
        If C{valueType} is L{Names}, L{Values} or L{Flags}, the expected type
        is L{NamedConstant}, L{ValueConstant} or L{FlagConstant}, respectively.
        Check that other types raise.
        """
        def callback(service, fields, fieldName, validValue, almostValidValue):
            for invalidValue in (u"string", object()):
                fields.update({fieldName: invalidValue})
                self.assertRaises(
                    InvalidDirectoryRecordError,
                    self.makeRecord, fields=fields, service=service
                )

        self._test_containerClassFieldType(callback)

    def test_initWithContainerClassFieldType_almostValid(self):
        """
        If C{valueType} is L{Names}, L{Values} or L{Flags}, the expected type
        is L{NamedConstant}, L{ValueConstant} or L{FlagConstant}, respectively.
        Check that other container types raise.
        """
        def callback(service, fields, fieldName, validValue, almostValidValue):
            fields.update({fieldName: almostValidValue})
            self.assertRaises(
                InvalidDirectoryRecordError,
                self.makeRecord, fields=fields, service=service
            )

        self._test_containerClassFieldType(callback)

    test_initWithContainerClassFieldType_almostValid.todo = (
        "It would be nice if this raised... presently does not"
    )

    def test_reprWithShortName(self):
        """
        L{DirectoryRecord.repr} returns a string using short name.
        """
        wsanchez = self.makeRecord(self.fields_wsanchez)

        self.assertEquals(
            "<DirectoryRecord (user)wsanchez>",
            repr(wsanchez)
        )

    def test_reprWithoutShortName(self):
        """
        L{DirectoryRecord.repr} returns a string using UID.
        """
        wsanchez = self.makeRecord(self.fields_no_shortnames)

        self.assertEquals(
            "<DirectoryRecord UID:no_shortnames>",
            repr(wsanchez)
        )

    def test_reprEmptyShortName(self):
        """
        L{DirectoryRecord.repr} returns a string using UID.
        """
        wsanchez = self.makeRecord(self.fields_empty_shortnames)

        self.assertEquals(
            "<DirectoryRecord UID:empty_shortnames>",
            repr(wsanchez)
        )

    def test_compare(self):
        """
        Comparison of records.
        """
        fields_glyphmod = self.fields_glyph.copy()
        del fields_glyphmod[FieldName.emailAddresses]

        plugh = self.serviceClass(u"plugh")

        wsanchez = self.makeRecord(self.fields_wsanchez)
        wsanchezmod = self.makeRecord(self.fields_wsanchez, service=plugh)
        glyph = self.makeRecord(self.fields_glyph)
        glyphmod = self.makeRecord(fields_glyphmod)

        self.assertEquals(wsanchez, wsanchez)
        self.assertNotEqual(wsanchez, glyph)
        self.assertNotEqual(glyph, glyphmod)  # UID matches, other fields don't
        self.assertNotEqual(glyphmod, wsanchez)
        self.assertNotEqual(wsanchez, wsanchezmod)  # Different service

    def test_compareOtherType(self):
        """
        Comparison of records with other object types.
        """
        wsanchez = self.makeRecord(self.fields_wsanchez)

        self.assertIdentical(wsanchez.__eq__(object()), NotImplemented)
        self.assertIdentical(wsanchez.__ne__(object()), NotImplemented)

    def test_attributeAccess(self):
        """
        Fields can be accessed as attributes.
        """
        wsanchez = self.makeRecord(self.fields_wsanchez)

        self.assertEquals(
            wsanchez.recordType,
            wsanchez.fields[FieldName.recordType]
        )
        self.assertEquals(
            wsanchez.uid,
            wsanchez.fields[FieldName.uid]
        )
        self.assertEquals(
            wsanchez.shortNames,
            wsanchez.fields[FieldName.shortNames]
        )
        self.assertEquals(
            wsanchez.emailAddresses,
            wsanchez.fields[FieldName.emailAddresses]
        )

        self.assertRaises(AttributeError, lambda: wsanchez.fooBarBaz)

        nobody = self.makeRecord(self.fields_nobody)

        self.assertRaises(AttributeError, lambda: nobody.emailAddresses)

    def test_description(self):
        """
        L{DirectoryRecord.description} returns the expected string.
        """
        sagen = self.makeRecord(self.fields_wsanchez)

        self.assertEquals(
            dedent(
                u"""
                DirectoryRecord:
                  UID = UID:wsanchez
                  email addresses = wsanchez@calendarserver.org, wsanchez@example.com
                  full names = Wilfredo Sanchez, Wilfredo Sanchez Vega
                  record type = user
                  short names = wsanchez, wilfredo_sanchez
                """[1:]
            ),
            sagen.description()
        )

    def test_members_group(self):
        """
        Group members for group records.
        """
        raise NotImplementedError("Subclasses should implement this test.")

    @inlineCallbacks
    def test_members_nonGroup(self):
        """
        Group members for non-group records.  Non-groups have no members.
        """
        wsanchez = self.makeRecord(self.fields_wsanchez)

        self.assertEquals(
            set((yield wsanchez.members())),
            set()
        )

    def test_memberships(self):
        """
        Group memberships.
        """
        raise NotImplementedError("Subclasses should implement this test.")

    @inlineCallbacks
    def test_verifyPlaintextPassword(self):
        """
        Plain text authentication.
        """
        password = u"secret"

        fields = self.fields_wsanchez.copy()
        fields[FieldName.password] = password

        wsanchez = self.makeRecord(fields)

        self.assertTrue((yield wsanchez.verifyPlaintextPassword(password)))
        self.assertFalse((yield wsanchez.verifyPlaintextPassword(u"bleargh")))
        self.assertFalse((yield wsanchez.verifyPlaintextPassword("bleargh\xc3\xa5")))

    @inlineCallbacks
    def test_verifyHTTPDigest(self):
        """
        HTTP digest authentication.
        """
        password = u"secret"

        fields = self.fields_wsanchez.copy()
        fields[FieldName.password] = password

        wsanchez = self.makeRecord(fields)

        result = yield wsanchez.verifyHTTPDigest(
            username=u"wsanchez",
            realm=None,
            nonce=None,
            cnonce=None,
            algorithm=None,
            nc=None,
            qop=None,
            response=None,
        )

        self.assertTrue(result)
        raise NotImplementedError()

    test_verifyHTTPDigest.todo = "unimplemented"


class DirectoryRecordTest(unittest.TestCase, BaseDirectoryRecordTest):
    """
    Tests for L{DirectoryRecord}.
    """

    serviceClass = TestDirectoryService
    directoryRecordClass = DirectoryRecord

    def test_members_group(self):
        staff = self.makeRecord(self.fields_staff)

        return self.assertFailure(staff.members(), NotImplementedError)

    def test_memberships(self):
        wsanchez = self.makeRecord(self.fields_wsanchez)

        return self.assertFailure(wsanchez.groups(), NotImplementedError)


class RecordStorage(object):
    """
    Container for directory records.
    """

    def __init__(self, service, recordClass):
        self.service = service
        self.recordClass = recordClass
        self.records = []

        self.addDefaultRecords()

    def addDefaultRecords(self):
        """
        Add a known set of records to this service.
        """
        self.addUser(
            shortNames=[u"wsanchez", u"wilfredo_sanchez"],
            fullNames=[
                u"Wilfredo S\xe1nchez Vega",
                u"Wilfredo Sanchez Vega",
                u"Wilfredo Sanchez",
            ],
            emailAddresses=[
                u"wsanchez@bitbucket.calendarserver.org",
                u"wsanchez@devnull.twistedmatrix.com",
            ],
        )

        self.addUser(
            shortNames=[u"glyph"],
            fullNames=[u"Glyph Lefkowitz"],
            emailAddresses=[
                u"glyph@bitbucket.calendarserver.org",
                u"glyph@devnull.twistedmatrix.com",
            ],
        )

        self.addUser(
            shortNames=[u"sagen"],
            fullNames=[u"Morgen Sagen"],
            emailAddresses=[
                u"sagen@bitbucket.calendarserver.org",
                u"shared@example.com",
            ],
        )

        self.addUser(
            shortNames=[u"cdaboo"],
            fullNames=[u"Cyrus Daboo"],
            emailAddresses=[
                u"cdaboo@bitbucket.calendarserver.org",
            ],
        )

        self.addUser(
            shortNames=[u"dre"],
            fullNames=[u"Andre LaBranche"],
            emailAddresses=[
                u"dre@bitbucket.calendarserver.org",
                u"shared@example.com",
            ],
        )

        self.addUser(
            shortNames=[u"exarkun"],
            fullNames=[u"Jean-Paul Calderone"],
            emailAddresses=[
                u"exarkun@devnull.twistedmatrix.com",
            ],
        )

        self.addUser(
            shortNames=[u"dreid"],
            fullNames=[u"David Reid"],
            emailAddresses=[
                u"dreid@devnull.twistedmatrix.com",
            ],
        )

        self.addUser(
            shortNames=[u"joe"],
            fullNames=[u"Joe Schmoe"],
            emailAddresses=[
                u"joe@example.com",
            ],
        )

        self.addUser(
            shortNames=[u"alyssa"],
            fullNames=[u"Alyssa P. Hacker"],
            emailAddresses=[
                u"alyssa@example.com",
            ],
        )

        self.addGroup(
            shortNames=[u"calendar-dev"],
            fullNames=[u"Calendar Developers"],
            emailAddresses=[
                u"calendar-dev@example.com",
            ],
        )

        self.addGroup(
            shortNames=[u"developers"],
            fullNames=[u"Developers"],
            emailAddresses=[
                u"developers@example.com",
            ],
        )

    def addUser(self, shortNames, fullNames, emailAddresses=[]):
        """
        Add a user record with the given field information.

        @param shortNames: Record short names.
        @type shortNames: L{list} of L{unicode}s

        @param fullNames: Record full names.
        @type fullNames: L{list} of L{unicode}s

        @param emailAddresses: Record email addresses.
        @type emailAddresses: L{list} of L{unicode}s
        """
        service = self.service
        fieldName = service.fieldName
        recordType = service.recordType

        self.records.append(self.recordClass(self.service, {
            fieldName.recordType: recordType.user,
            fieldName.uid: u"__{0}__".format(shortNames[0]),
            fieldName.shortNames: shortNames,
            fieldName.fullNames: fullNames,
            fieldName.password: u"".join(reversed(shortNames[0])),
            fieldName.emailAddresses: emailAddresses,
        }))

    def addGroup(self, shortNames, fullNames, emailAddresses=[]):
        """
        Add a group record with the given field information.

        @param shortNames: Record short names.
        @type shortNames: L{list} of L{unicode}s

        @param fullNames: Record full names.
        @type fullNames: L{list} of L{unicode}s

        @param emailAddresses: Record email addresses.
        @type emailAddresses: L{list} of L{unicode}s
        """
        service = self.service
        fieldName = service.fieldName
        recordType = service.recordType

        self.records.append(self.recordClass(self.service, {
            fieldName.recordType: recordType.group,
            fieldName.uid: u"__{0}__".format(shortNames[0]),
            fieldName.shortNames: shortNames,
            fieldName.fullNames: fullNames,
            fieldName.emailAddresses: emailAddresses,
        }))

    def __iter__(self):
        return iter(self.records)


class WackyOperand(Names):
    """
    Wacky operands.
    """
    WHUH = NamedConstant()


class Color(Names):
    """
    Some colors.
    """
    red = NamedConstant()
    green = NamedConstant()
    blue = NamedConstant()
    black = NamedConstant()


class OtherColor(Names):
    """
    More colors.
    """
    mauve = NamedConstant()


class Language(Values):
    """
    Some languages.
    """
    English = ValueConstant(u"en")
    Spanish = ValueConstant(u"sp")


class OtherLanguage(Values):
    """
    More languages.
    """
    French = ValueConstant(u"fr")


class Access(Flags):
    """
    Some access types.
    """
    read = FlagConstant()
    write = FlagConstant()


class OtherAccess(Flags):
    """
    More access types.
    """
    delete = FlagConstant()


class ConstantHavingFieldName(Names):
    """
    Field names with constants values.
    """
    eyeColor = NamedConstant()
    eyeColor.valueType = Color

    language = NamedConstant()
    language.valueType = Language

    access = NamedConstant()
    access.valueType = Access
