# -*- test-case-name: twext.who.test -*-
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
Directory service interfaces.
"""

__all__ = [
    "DirectoryServiceError",
    "DirectoryConfigurationError",
    "DirectoryAvailabilityError",
    "InvalidDirectoryRecordError",
    "UnknownRecordTypeError",
    "QueryNotSupportedError",
    "NoSuchRecordError",
    "NotAllowedError",

    "RecordType",
    "FieldName",

    "IDirectoryService",
    "IDirectoryRecord",
]

from uuid import UUID

from zope.interface import Attribute, Interface

from twisted.python.constants import Names, NamedConstant


#
# Exceptions
#

class DirectoryServiceError(Exception):
    """
    Directory service generic error.
    """


class DirectoryConfigurationError(DirectoryServiceError):
    """
    Directory configuration error.
    """


class DirectoryAvailabilityError(DirectoryServiceError):
    """
    Directory not available.
    """


class InvalidDirectoryRecordError(DirectoryServiceError):
    """
    Invalid directory record.
    """

    def __init__(self, message, fields):
        """
        @param message: An error message.
        @type message: string

        @param fields: The fields that were used to attempt to build a record.
        @type fields: L{dict}
        """
        super(InvalidDirectoryRecordError, self).__init__(message)
        self.fields = fields


class UnknownRecordTypeError(DirectoryServiceError):
    """
    Unknown record type.
    """

    def __init__(self, token):
        DirectoryServiceError.__init__(self, token)
        self.token = token


class QueryNotSupportedError(DirectoryServiceError):
    """
    Query not supported.
    """


class NoSuchRecordError(DirectoryServiceError):
    """
    Record does not exist.
    """


class NotAllowedError(DirectoryServiceError):
    """
    It seems you aren't permitted to do that.
    """


#
# Data types
#

class RecordType(Names):
    """
    Constants for common directory record types.

    @cvar user: User record.
        Represents a person.

    @cvar group: Group record.
        Represents a record that contains (references) other records (members).
    """

    user = NamedConstant()
    user.description = u"user"

    group = NamedConstant()
    group.description = u"group"


class FieldName(Names):
    """
    Constants for common directory record field names.

    Fields as associated with either a single value (the default) or an
    iterable of values (if it has a true C{multiValue} attribute).

    Field values must be an instance of an expected type.  The default expected
    type for a field is L{unicode}, and may be overridden by a C{valueType}
    attribute on the field name.

    In the case where the expected type is a constant (e.g. L{NamedConstant}),
    C{valueType} should be the container that contains the constant (e.g. a
    subclass of L{Names}).

    @cvar uid: The primary unique identifier for a directory record.
        The associated value must be a L{unicode}.

    @cvar guid: The globally unique identifier for a directory record.
        The associated value must be a L{UUID} or C{None}.

    @cvar recordType: The type of a directory record.
        The associated value must be a L{NamedConstant}.

    @cvar shortNames: The short names for a directory record.
        The associated values must L{unicode}s and there must be at least
        one associated value.

    @cvar fullNames: The full names for a directory record.
        The associated values must be L{unicode}s.

    @cvar emailAddresses: The email addresses for a directory record.
        The associated values must be L{unicode}s.

    @cvar password: The clear text password (oh no!) for a directory record.
        The associated value must be a L{unicode} or C{None}.
        The correct value is C{None}.
    """

    uid = NamedConstant()
    uid.description = u"UID"

    guid = NamedConstant()
    guid.description = u"GUID"
    guid.valueType = UUID

    recordType = NamedConstant()
    recordType.description = u"record type"
    recordType.valueType = NamedConstant

    shortNames = NamedConstant()
    shortNames.description = u"short names"
    shortNames.multiValue = True

    fullNames = NamedConstant()
    fullNames.description = u"full names"
    fullNames.multiValue = True

    emailAddresses = NamedConstant()
    emailAddresses.description = u"email addresses"
    emailAddresses.multiValue = True

    password = NamedConstant()
    password.description = u"password"

    @staticmethod
    def isMultiValue(name):
        """
        Check for whether a field is multi-value (as opposed to single-value).

        @param name: The name of the field.
        @type name: L{NamedConstant}

        @return: C{True} if the field is multi-value, C{False} otherwise.
        @rtype: L{BOOL}
        """
        return getattr(name, "multiValue", False)

    @staticmethod
    def valueType(name):
        """
        Look up the expected type for values of a field.

        @param name: The name of the field.
        @type name: L{NamedConstant}

        @return: The expected type.
        @rtype: L{type}
        """
        return getattr(name, "valueType", unicode)


#
# Interfaces
#

class IDirectoryService(Interface):
    """
    Directory service.

    A directory service is a service that vends information about
    principals such as users, locations, printers, and other
    resources.  This information is provided in the form of directory
    records.

    A directory service can be queried for the types of records it
    supports, and for specific records matching certain criteria.

    A directory service may allow support the editing, removal and
    addition of records.
    Services are read-only should fail with L{NotAllowedError} in editing
    methods.

    The L{FieldName.uid} field, the L{FieldName.guid} field (if not C{None}),
    and the combination of the L{FieldName.recordType} and
    L{FieldName.shortName} fields must be unique to each directory record
    vended by a directory service.
    """

    realmName = Attribute(
        "The name of the authentication realm this service represents."
    )

    def recordTypes():
        """
        Get the record types supported by this directory service.

        @return: The record types that are supported by this directory service.
        @rtype: iterable of L{NamedConstant}s
        """

    def recordsFromExpression(
        expression, recordTypes=None, limitResults=None, timeoutSeconds=None
    ):
        """
        Find records matching an expression.

        @param expression: an expression to apply
        @type expression: L{object}

        @param recordTypes: the record types to match
        @type recordTypes: an iterable of L{NamedConstant}, or None for no
            filtering

        @param limitResults: how many records to limit the results to
        @type limitResults: an C{integer} or None if no limit desired

        @param timeoutSeconds: how long (in seconds) to let a directory service
            request to run before giving up
        @type timeoutSeconds: an C{integer} or None if no limit desired

        @return: The matching records.
        @rtype: deferred iterable of L{IDirectoryRecord}s

        @raises: L{QueryNotSupportedError} if the expression is not
            supported by this directory service.
        """

    def recordsWithFieldValue(
        fieldName, value, limitResults=None, timeoutSeconds=None
    ):
        """
        Find records that have the given field name with the given
        value.

        @param fieldName: a field name
        @type fieldName: L{NamedConstant}

        @param value: a value to match
        @type value: L{object}

        @param limitResults: how many records to limit the results to
        @type limitResults: an C{integer} or None if no limit desired

        @param timeoutSeconds: how long (in seconds) to let a directory service
            request to run before giving up
        @type timeoutSeconds: an C{integer} or None if no limit desired

        @return: The matching records.
        @rtype: deferred iterable of L{IDirectoryRecord}s
        """

    def recordWithUID(uid, timeoutSeconds=None):
        """
        Find the record that has the given UID.

        @param uid: a UID
        @type uid: L{unicode}

        @param timeoutSeconds: how long (in seconds) to let a directory service
            request to run before giving up
        @type timeoutSeconds: an C{integer} or None if no limit desired

        @return: The matching record or C{None} if there is no match.
        @rtype: deferred L{IDirectoryRecord}s or C{None}
        """

    def recordWithGUID(guid, timeoutSeconds=None):
        """
        Find the record that has the given GUID.

        @param guid: a GUID
        @type guid: L{UUID}

        @param timeoutSeconds: how long (in seconds) to let a directory service
            request to run before giving up
        @type timeoutSeconds: an C{integer} or None if no limit desired

        @return: The matching record or C{None} if there is no match.
        @rtype: deferred L{IDirectoryRecord}s or C{None}
        """

    def recordsWithRecordType(
        recordType, limitResults=None, timeoutSeconds=None
    ):
        """
        Find the records that have the given record type.

        @param recordType: a record type
        @type recordType: L{NamedConstant}

        @param limitResults: how many records to limit the results to
        @type limitResults: an C{integer} or None if no limit desired

        @param timeoutSeconds: how long (in seconds) to let a directory service
            request to run before giving up
        @type timeoutSeconds: an C{integer} or None if no limit desired

        @return: The matching records.
        @rtype: deferred iterable of L{IDirectoryRecord}s
        """

    def recordWithShortName(recordType, shortName, timeoutSeconds=None):
        """
        Find the record that has the given record type and short name.

        @param recordType: a record type
        @type recordType: L{NamedConstant}

        @param shortName: a short name
        @type shortName: L{unicode}

        @param timeoutSeconds: how long (in seconds) to let a directory service
            request to run before giving up
        @type timeoutSeconds: an C{integer} or None if no limit desired

        @return: The matching record or C{None} if there is no match.
        @rtype: deferred L{IDirectoryRecord}s or C{None}
        """

    def recordsWithEmailAddress(
        emailAddress, limitResults=None, timeoutSeconds=None
    ):
        """
        Find the records that have the given email address.

        @param emailAddress: an email address
        @type emailAddress: L{unicode}

        @param timeoutSeconds: how long (in seconds) to let a directory service
            request to run before giving up
        @type timeoutSeconds: an C{integer} or None if no limit desired

        @return: The matching records.
        @rtype: deferred iterable of L{IDirectoryRecord}s
        """

    def updateRecords(records, create=False):
        """
        Updates existing directory records.

        @param records: the records to update
        @type records: iterable of L{IDirectoryRecord}s

        @param create: if true, create records if necessary
        @type create: boolean

        @return: unspecified
        @rtype: deferred object

        @raises L{NotAllowedError}: if the update is not allowed by the
            directory service.
        """

    def removeRecords(uids):
        """
        Removes the records with the given UIDs.

        @param uids: the UIDs of the records to remove
        @type uids: iterable of L{unicode}

        @return: unspecified
        @rtype: deferred object

        @raises L{NotAllowedError}: if the removal is not allowed by the
            directory service.
        """

    def flush():
        """
        Clear out any record information that the directory service has cached
        from the underlying directory store. This is useful in testing scenarios
        where we want a change to the underlying store to quickly propagate to
        all directory services that use it.

        Each service that uses some form of record caching should implement this method
        and make sure its caches are cleared.

        @return: unspecified
        @rtype: deferred object
        """


class IDirectoryRecord(Interface):
    """
    Directory record.

    A directory record corresponds to a principal, and contains
    information about the principal such as identifiers, names and
    passwords.

    This information is stored in a set of fields (a mapping of field
    names and values).

    Some fields allow for multiple values while others allow only one
    value.  This is discoverable by calling L{FieldName.isMultiValue}
    on the field name.

    The field L{FieldName.recordType} will be present in all directory
    records, as all records must have a type.  Which other fields are
    required is implementation-specific.

    Principals (called group principals) may have references to other
    principals as members.  Records representing group principals will
    typically be records with the record type L{RecordType.group}, but
    it is not prohibited for other record types to have members.

    Fields may also be accessed as attributes.  For example:
    C{record.recordType} is equivalent to
    C{record.fields[FieldName.recordType]}.
    """

    service = Attribute("The L{IDirectoryService} this record exists in.")
    fields = Attribute("A mapping with L{NamedConstant} keys.")

    def members():
        """
        Find the records that are members of this group.  Only direct
        members are included; members of members are not expanded.

        @return: a deferred iterable of L{IDirectoryRecord}s which are
            direct members of this group.
        """

    def groups():
        """
        Find the group records that this record is a member of.  Only
        groups for which this record is a direct member is are
        included; membership is not expanded.

        @return: a deferred iterable of L{IDirectoryRecord}s which are
            groups that this record is a member of.
        """

    def addMembers(members):
        """
        Adds the members to this record.

        @param members: The members to add to this record.
        @type members: An iterable of L{IDirectoryRecord}s.
        """

    def removeMembers(members):
        """
        Removes the members from this record.

        @param members: The members to remove from this record.
        @type members: An iterable of L{IDirectoryRecord}s.
        """

    def setMembers(members):
        """
        Replaces the current members of this record.

        @param members: The new members.
        @type members: An iterable of L{IDirectoryRecord}s.
        """


class IPlaintextPasswordVerifier(Interface):
    """
    Provides a way to verify a plain text password as provided by a client.
    """

    def verifyPlaintextPassword(password):
        """
        Verifies that a given plain text password authenticates the record.

        @param password: A plain text password.
        @type password: L{unicode}

        @return: L{True} if the password matches, L{False} otherwise.
        @rtype: deferred L{BOOL}
        """


class IHTTPDigestVerifier(Interface):
    """
    Provides a way to verify HTTP digest credentials as provided by a client.
    """

    def verifyHTTPDigest(username, realm, nonce, algorithm, response, method):
        """
        Verifies that a given plain text password authenticates the record.

        @param password: A plain text password.
        @type password: L{unicode}

        @return: L{True} if the password matches, L{False} otherwise.
        @rtype: deferred L{BOOL}
        """
