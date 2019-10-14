# -*- test-case-name: twext.who.test.test_directory -*-
##
# Copyright (c) 2006-2017 Apple Inc. All rights reserved.
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
Generic directory service base implementation
"""

__all__ = [
    "DirectoryService",
    "DirectoryRecord",
]

from zope.interface import implementer, directlyProvides

from twisted.python.constants import (
    Names, NamedConstant,
    Values, ValueConstant,
    Flags, FlagConstant,
)
from twisted.internet.defer import inlineCallbacks, returnValue
from twisted.internet.defer import succeed, fail
from twisted.cred.credentials import DigestedCredentials

from .idirectory import (
    InvalidDirectoryRecordError,
    QueryNotSupportedError, NotAllowedError,
    FieldName, RecordType,
    IDirectoryService, IDirectoryRecord,
    IPlaintextPasswordVerifier, IHTTPDigestVerifier,
)
from .expression import CompoundExpression, Operand, MatchExpression
from .util import uniqueResult, describe, ConstantsContainer


@implementer(IDirectoryService)
class DirectoryService(object):
    """
    Generic (and abstract) implementation of L{IDirectoryService}.

    Most of the C{recordsWith*} methods call L{recordsWithFieldValue}, which in
    turn calls L{recordsFromExpression} with a corresponding
    L{MatchExpression}.

    L{recordsFromExpression} relies on L{recordsFromNonCompoundExpression} for
    all expression types other than L{CompoundExpression}, which it handles
    directly.

    L{recordsFromNonCompoundExpression} (and therefore most uses of the other
    methods) will always fail with a L{QueryNotSupportedError}.

    A subclass should therefore override L{recordsFromNonCompoundExpression}
    with an implementation that handles any queries that it can support (which
    should include L{MatchExpression}) and calls its superclass' implementation
    with any query it cannot support.

    A subclass may override L{recordsFromExpression} if it is to support
    L{CompoundExpression}s with operands other than L{Operand.AND} and
    L{Operand.OR}.

    A subclass may override L{recordsFromExpression} if it is built on top
    of a directory service that supports compound expressions, as that may be
    more effient than relying on L{DirectoryService}'s implementation.

    L{updateRecords} and L{removeRecords} will fail with L{NotAllowedError}
    when asked to modify data.
    A subclass should override these methods if is to allow editing of
    directory information.

    @cvar recordType: a L{Names} class or compatible object (eg.
        L{ConstantsContainer}) which contains the L{NamedConstant}s denoting
        the record types that are supported by this directory service.

    @cvar fieldName: a L{Names} class or compatible object (eg.
        L{ConstantsContainer}) which contains the L{NamedConstant}s denoting
        the record field names that are supported by this directory service.

    @cvar normalizedFields: a L{dict} mapping of (ie. L{NamedConstant}s
        contained in the C{fieldName} class variable) to callables that take
        a field value (a L{unicode}) and return a normalized field value (also
        a L{unicode}).
    """

    recordType = ConstantsContainer(())
    fieldName = FieldName

    normalizedFields = {
        FieldName.emailAddresses: lambda e: e.lower(),
    }

    def __init__(self, realmName):
        """
        @param realmName: a realm name
        @type realmName: L{unicode}
        """
        self.realmName = realmName

    def __repr__(self):
        return (
            "<{self.__class__.__name__} {self.realmName!r}>"
            .format(self=self)
        )

    def recordTypes(self):
        return self.recordType.iterconstants()

    def recordsFromNonCompoundExpression(
        self, expression, recordTypes=None, records=None,
        limitResults=None, timeoutSeconds=None
    ):
        """
        Finds records matching a non-compound expression.

        @note: This method is called by L{recordsFromExpression} to handle
            all expressions other than L{CompoundExpression}.
            This implementation always fails with L{QueryNotSupportedError}.
            Subclasses should override this in order to handle additional
            expression types, and call on the superclass' implementation
            for other expression types.

        @note: This interface is the same as L{recordsFromExpression}, except
            for the additional C{records} argument.

        @param expression: an expression to apply
        @type expression: L{object}

        @param recordTypes: the record types to match
        @type recordTypes: an iterable of L{NamedConstant}, or None for no
            filtering

        @param records: a set of records to limit the search to. C{None} if
            the whole directory should be searched.
            This is provided by L{recordsFromExpression} when it has already
            narrowed down results to a set of records.
            That is, it's a performance optimization; ignoring this and
            searching the entire directory will also work.
        @type records: L{set} or L{frozenset}

        @return: The matching records.
        @rtype: deferred iterable of L{IDirectoryRecord}s

        @raises: L{QueryNotSupportedError} if the expression is not
            supported by this directory service.
        """
        if records is not None:
            for _ignore_record in records:
                break
            else:
                return succeed(())

        return fail(QueryNotSupportedError(
            "Unknown expression: {0}".format(expression)
        ))

    @inlineCallbacks
    def recordsFromCompoundExpression(
        self, expression, recordTypes=None, records=None,
        limitResults=None, timeoutSeconds=None
    ):
        """
        Finds records matching a compound expression.

        @note: This method is called by L{recordsFromExpression} to handle
            all L{CompoundExpression}s.

        @note: This interface is the same as L{recordsFromExpression}, except
            for the additional C{records} argument.

        @param expression: an expression to apply
        @type expression: L{CompoundExpression}

        @param recordTypes: the record types to match
        @type recordTypes: an iterable of L{NamedConstant}, or None for no
            filtering

        @param records: a set of records to limit the search to. C{None} if
            the whole directory should be searched.
            This is provided by L{recordsFromExpression} when it has already
            narrowed down results to a set of records.
            That is, it's a performance optimization; ignoring this and
            searching the entire directory will also work.
        @type records: L{set} or L{frozenset}

        @return: The matching records.
        @rtype: deferred iterable of L{IDirectoryRecord}s

        @raises: L{QueryNotSupportedError} if the expression is not
            supported by this directory service.
        """
        operand = expression.operand
        subExpressions = iter(expression.expressions)

        try:
            subExpression = subExpressions.next()
        except StopIteration:
            returnValue(())

        results = set((
            yield self.recordsFromExpression(
                subExpression, recordTypes=recordTypes, records=records
            )
        ))

        for subExpression in subExpressions:
            if operand == Operand.AND:
                if not results:
                    # No need to bother continuing here
                    returnValue(())

                records = results
            else:
                records = None

            recordsMatchingExpression = frozenset((
                yield self.recordsFromExpression(
                    subExpression, recordTypes=recordTypes, records=records
                )
            ))

            if operand == Operand.AND:
                results &= recordsMatchingExpression
            elif operand == Operand.OR:
                results |= recordsMatchingExpression
            else:
                raise QueryNotSupportedError(
                    "Unknown operand: {0}".format(operand)
                )

        returnValue(results)

    def recordsFromExpression(
        self, expression, recordTypes=None, records=None,
        limitResults=None, timeoutSeconds=None
    ):
        """
        @note: This interface is the same as
            L{IDirectoryService.recordsFromExpression}, except for the
            additional C{records} argument.
        """
        if isinstance(expression, CompoundExpression):
            return self.recordsFromCompoundExpression(
                expression, recordTypes=recordTypes,
                limitResults=limitResults, timeoutSeconds=timeoutSeconds
            )
        else:
            return self.recordsFromNonCompoundExpression(
                expression, recordTypes=recordTypes,
                limitResults=limitResults, timeoutSeconds=timeoutSeconds
            )

    def recordsWithFieldValue(
        self, fieldName, value, recordTypes=None,
        limitResults=None, timeoutSeconds=None
    ):
        return self.recordsFromExpression(
            MatchExpression(fieldName, value),
            recordTypes=recordTypes,
            limitResults=limitResults,
            timeoutSeconds=timeoutSeconds
        )

    @inlineCallbacks
    def recordWithUID(self, uid, timeoutSeconds=None):
        returnValue(uniqueResult(
            (yield self.recordsWithFieldValue(
                FieldName.uid, uid, limitResults=1, timeoutSeconds=timeoutSeconds
            ))
        ))

    @inlineCallbacks
    def recordWithGUID(self, guid, timeoutSeconds=None):
        returnValue(uniqueResult(
            (yield self.recordsWithFieldValue(
                FieldName.guid, guid, limitResults=1, timeoutSeconds=timeoutSeconds
            ))
        ))

    def recordsWithRecordType(
        self, recordType, limitResults=None, timeoutSeconds=None
    ):
        return self.recordsWithFieldValue(
            FieldName.recordType, recordType,
            limitResults=limitResults, timeoutSeconds=timeoutSeconds
        )

    @inlineCallbacks
    def recordWithShortName(self, recordType, shortName, timeoutSeconds=None):
        returnValue(
            uniqueResult(
                (
                    yield self.recordsFromExpression(
                        MatchExpression(
                            FieldName.shortNames, shortName
                        ),
                        recordTypes=[recordType],
                        timeoutSeconds=timeoutSeconds
                    )
                )
            )
        )

    def recordsWithEmailAddress(
        self, emailAddress, limitResults=None, timeoutSeconds=None
    ):
        return self.recordsWithFieldValue(
            FieldName.emailAddresses,
            emailAddress,
            limitResults=limitResults,
            timeoutSeconds=timeoutSeconds
        )

    def updateRecords(self, records, create=False):
        for _ignore_record in records:
            return fail(NotAllowedError("Record updates not allowed."))
        return succeed(None)

    def removeRecords(self, uids):
        for _ignore_uid in uids:
            return fail(NotAllowedError("Record removal not allowed."))
        return succeed(None)

    def flush(self):
        return succeed(None)


@implementer(IDirectoryRecord)
class DirectoryRecord(object):
    """
    Generic implementation of L{IDirectoryService}.

    This is an incomplete implementation of L{IDirectoryRecord}.

    L{groups} will always fail with L{NotImplementedError} and L{members} will
    do so if this is a group record.
    A subclass should override these methods to support group membership and
    complete this implementation.

    @cvar requiredFields: an iterable of field names that must be present in
        all directory records.
    """

    requiredFields = (
        FieldName.uid,
        FieldName.recordType,
    )

    def __init__(self, service, fields):
        for fieldName in self.requiredFields:
            if fieldName not in fields or not fields[fieldName]:
                raise InvalidDirectoryRecordError(
                    "{0} field is required.".format(fieldName),
                    fields
                )

            if service.fieldName.isMultiValue(fieldName):
                values = fields[fieldName]
                for value in values:
                    if not value:
                        raise InvalidDirectoryRecordError(
                            "{0} field must not be empty.".format(fieldName),
                            fields
                        )

        if (
            fields[FieldName.recordType] not in
            service.recordType.iterconstants()
        ):
            raise InvalidDirectoryRecordError(
                "Unknown record type: {0!r} is not in {1!r}.".format(
                    fields[FieldName.recordType],
                    tuple(service.recordType.iterconstants()),
                ),
                fields
            )

        def checkType(name, value):
            expectedType = service.fieldName.valueType(name)

            if issubclass(expectedType, Flags):
                expectedType = FlagConstant
            elif issubclass(expectedType, Values):
                expectedType = ValueConstant
            elif issubclass(expectedType, Names):
                expectedType = NamedConstant

            if value is not None and not isinstance(value, expectedType):
                raise InvalidDirectoryRecordError(
                    "Value {0!r} for field {1} is not of type {2}".format(
                        value, name, expectedType
                    ),
                    fields
                )

        # Normalize fields
        normalizedFields = {}
        for name, value in fields.items():
            if not isinstance(name, NamedConstant):
                raise InvalidDirectoryRecordError(
                    "Field name {} is not a named constant".format(name),
                    fields
                )

            normalize = service.normalizedFields.get(name, None)

            if normalize is None:
                normalizedValue = value
            else:
                if service.fieldName.isMultiValue(name):
                    normalizedValue = tuple((normalize(v) for v in value))
                else:
                    normalizedValue = normalize(value)

            if service.fieldName.isMultiValue(name):
                for v in normalizedValue:
                    checkType(name, v)
            else:
                checkType(name, normalizedValue)

            normalizedFields[name] = normalizedValue

        self.service = service
        self.fields = normalizedFields

        if self.service.fieldName.password in self.fields:
            directlyProvides(
                self, IPlaintextPasswordVerifier, IHTTPDigestVerifier
            )

    def __repr__(self):
        try:
            return (
                "<{self.__class__.__name__} ({recordType}){shortName}>".format(
                    self=self,
                    recordType=describe(self.recordType),
                    shortName=self.shortNames[0],
                )
            )
        except (AttributeError, IndexError):
            return (
                "<{self.__class__.__name__} {uid}>".format(
                    self=self,
                    uid=self.uid,
                )
            )

    def __hash__(self):
        return hash(self.uid)

    def __eq__(self, other):
        if IDirectoryRecord.implementedBy(other.__class__):
            return (
                self.service == other.service and
                self.fields == other.fields
            )
        return NotImplemented

    def __ne__(self, other):
        eq = self.__eq__(other)
        if eq is NotImplemented:
            return NotImplemented
        return not eq

    def __getattr__(self, name):
        try:
            fieldName = self.service.fieldName.lookupByName(name)
        except ValueError:
            raise AttributeError(name)

        try:
            return self.fields[fieldName]
        except KeyError:
            raise AttributeError(name)

    def description(self):
        """
        Generate a string description of this directory record.

        @return: A description.
        @rtype: L{unicode}
        """
        def describeValue(value):
            if hasattr(value, "description"):
                value = value.description
            else:
                value = unicode(value)

            return value

        values = {}

        for fieldName in self.service.fieldName.iterconstants():
            if fieldName not in self.fields:
                continue

            value = self.fields[fieldName]

            if hasattr(fieldName, "description"):
                name = fieldName.description
            else:
                name = unicode(fieldName.name)

            if self.service.fieldName.isMultiValue(fieldName):
                values[name] = ", ".join(describeValue(v) for v in value)
            else:
                values[name] = describeValue(value)

        description = [self.__class__.__name__, u":"]

        for name in sorted(values.iterkeys()):
            description.append(u"\n  {0} = {1}".format(name, values[name]))

        description.append(u"\n")

        return u"".join(description)

    def members(self):
        if self.recordType == RecordType.group:
            return fail(
                NotImplementedError("Subclasses must implement members()")
            )
        return succeed(())

    def groups(self):
        return fail(NotImplementedError("Subclasses must implement groups()"))

    def addMembers(self, members):
        return fail(NotAllowedError("Membership updates not allowed."))

    def removeMembers(self, members):
        return fail(NotAllowedError("Membership updates not allowed."))

    def setMembers(self, members):
        return fail(NotAllowedError("Membership updates not allowed."))

    #
    # Verifiers for twext.who.checker stuff.
    #

    def verifyPlaintextPassword(self, password):
        if isinstance(password, str):
            password = password.decode("utf-8")
        if self.password == password:
            return succeed(True)
        else:
            return succeed(False)

    def verifyHTTPDigest(
        self, username, realm, uri, nonce, cnonce,
        algorithm, nc, qop, response, method,
    ):
        helperCreds = DigestedCredentials(
            username, method, realm,
            dict(
                realm=realm,
                uri=uri,
                nonce=nonce,
                cnonce=cnonce,
                algorithm=algorithm,
                nc=nc,
                qop=qop,
                response=response
            )
        )

        return succeed(helperCreds.checkPassword(self.password))
