##
# Copyright (c) 2015-2017 Apple Inc. All rights reserved.
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
A set of Python classes that wrap common CFOpenDirectory classes.
"""

from ._corefoundation import ffi, lib as od
from .corefoundation import CFObjectRef, CFErrorRef, \
    CFArrayRef, CFStringRef, CFDictionaryRef


class ODError(Exception):
    """
    OpenDirectory error occurred.
    """


class ODSession(CFObjectRef):
    """
    Wraps a cffi/ODSession object.
    """

    def __init__(self, session=None):
        """
        Create an ODSession.
        """

        if session is None:
            error = ffi.new("CFErrorRef *")
            session = od.ODSessionCreate(ffi.NULL, ffi.NULL, error)
            if session == ffi.NULL:
                error = CFErrorRef(error[0])
                raise ODError("Unable to create ODSession: {}".format(error.error()))
        super(ODSession, self).__init__(session)

    @classmethod
    def defaultSession(cls):
        """
        Return the default session.

        @return: the default session
        @rtype: L{ODSession}
        """
        return cls(session=od.kODSessionDefault)

    def nodeNames(self):
        """
        Return a list of all the nodes available to the current ODSession.

        @return: list of node names
        @rtype: L{list} of L{str}
        """

        error = ffi.new("CFErrorRef *")
        nodes = od.ODSessionCopyNodeNames(ffi.NULL, self.ref(), error)
        if nodes == ffi.NULL:
            error = CFErrorRef(error[0])
            raise ODError("Unable to get node names from session: {}".format(error.error()))

        nodes = CFArrayRef(nodes)
        return nodes.toList()


class ODNode(CFObjectRef):
    """
    Wraps a cffi/ODNode object.
    """

    def __init__(self, session, nodename):
        """
        Create an ODNode with the specified name using an ODSession.

        @param session: session to use
        @type session: L{ODSession}
        @param nodename: name
        @type nodename: L{str}
        """
        name = CFStringRef.fromString(nodename)
        error = ffi.new("CFErrorRef *")
        node = od.ODNodeCreateWithName(ffi.NULL, session.ref(), name.ref(), error)
        if node == ffi.NULL:
            error = CFErrorRef(error[0])
            raise ODError("Unable to create ODNode: {} {}".format(nodename, error.error()))
        super(ODNode, self).__init__(node)

    def setCredentials(self, recordType, user, pswd):
        """
        Authentication to this ODNode.

        @param recordType: OD record type to use
        @type recordType: L{str}
        @param user: user record name to auth as
        @type user: L{str}
        @param pswd: password to use
        @type pswd: L{str}

        @return: whether or not the authentication worked
        @rtype: L{bool}
        """

        recordType = CFStringRef.fromString(recordType)
        user = CFStringRef.fromString(user)
        pswd = CFStringRef.fromString(pswd)

        return od.ODNodeSetCredentials(self.ref(), recordType.ref(), user, pswd, ffi.NULL)

    def details(self, keys):
        """
        Return the node attributes as an L{dict}.

        @param keys: specific attributes to retrieve
        @type keys: L{list} of L{str}

        @return: result
        @rtype: L{dict}
        """

        keys = CFArrayRef.fromList([CFStringRef.fromString(key) for key in keys])
        error = ffi.new("CFErrorRef *")
        details = od.ODNodeCopyDetails(self.ref(), keys.ref(), error)
        if details == ffi.NULL:
            error = CFErrorRef(error[0])
            raise ODError("Unable to get node details: {}".format(error.error()))
        details = CFDictionaryRef(details)
        return details.toDict()

    def record(self, recordType, recordName):
        """
        Get a record of the specified type with the specified record name.

        @param recordType: OD record type
        @type recordType: L{str}
        @param recordName: record name
        @type recordName: L{str}

        @return: record
        @rtype: L{ODRecord} or L{None}
        """

        recordType = CFStringRef.fromString(recordType)
        recordName = CFStringRef.fromString(recordName)
        record = od.ODNodeCopyRecord(self.ref(), recordType.ref(), recordName.ref(), ffi.NULL, ffi.NULL)
        return ODRecord(record) if record != ffi.NULL else None


class ODRecord(CFObjectRef):
    """
    Wraps a cffi/ODRecord object.
    """

    def details(self, attributes=None):
        """
        Return the record attributes as an L{dict}.

        @param attributes: specific attributes to retrieve
        @type attributes: L{list} of L{ffi.ODAttributeType}

        @return: result
        @rtype: L{dict}
        """

        attributes = CFArrayRef.fromList([CFStringRef.fromString(attribute) for attribute in attributes]) if attributes else CFObjectRef(None)
        error = ffi.new("CFErrorRef *")
        details = od.ODRecordCopyDetails(self.ref(), attributes.ref(), error)
        if details == ffi.NULL:
            error = CFErrorRef(error[0])
            raise ODError("Unable to get record details: {}".format(error.error()))
        details = CFDictionaryRef(details)
        return details.toDict()

    def verifyPassword(self, password):
        """
        Verify the password associated with this record.

        @param password: password to check
        @type password: L{str}

        @return: whether or not the verification worked
        @rtype: L{bool}
        """

        password = CFStringRef.fromString(password)
        return od.ODRecordVerifyPassword(self.ref(), password.ref(), ffi.NULL)

    def verifyPasswordExtended(self, authType, authItems):
        """
        Verify the authentication details associated with this record, using an extended
        authentication type.

        @param authType: password to check
        @type authType: L{str}
        @param authItems: items needed by the auth type
        @type authItems: L{list} of L{str}

        @return: whether or not the verification worked
        @rtype: L{bool}
        """
        authType = CFStringRef.fromString(authType)
        authItems = CFArrayRef.fromList([CFStringRef.fromString(item) for item in authItems])
        return od.ODRecordVerifyPasswordExtended(self.ref(), authType.ref(), authItems.ref(), ffi.NULL, ffi.NULL, ffi.NULL)


class ODQuery(CFObjectRef):
    """
    Wraps a cffi/ODQuery object.
    """

    @classmethod
    def newQuery(cls, node, recordTypes, queryAttribute, matchType, queryValue, fetchAttributes, maxResults):
        """
        Create a new query.

        @param node: the node to query
        @type node: L{ODNode}
        @param recordTypes: list of record types
        @type recordTypes: L{list} of L{str}
        @param queryAttribute: attribute to query or L{None} for complex query
        @type queryAttribute: L{str} or L{None}
        @param matchType: type of match
        @type matchType: L{lib.ODMatchType}
        @param queryValue: value to query for, or complex query string
        @type queryValue: L{str}
        @param fetchAttributes: list of attributes to return in matched records
        @type fetchAttributes: L{list} of L{lib.ODAttributeType}
        @param maxResults: maximum number of results to return
        @type maxResults: L{int}

        @return; the query
        @rtype: L{ODQuery}
        """
        recordTypes = CFArrayRef.fromList([CFStringRef.fromString(recordType) for recordType in recordTypes])
        queryAttribute = CFStringRef.fromString(queryAttribute) if queryAttribute is not None else CFObjectRef(None)
        queryValue = CFStringRef.fromString(queryValue) if queryValue is not None else CFObjectRef(None)
        fetchAttributes = CFArrayRef.fromList([CFStringRef.fromString(fetchAttribute) for fetchAttribute in fetchAttributes])
        error = ffi.new("CFErrorRef *")
        query = od.ODQueryCreateWithNode(
            ffi.NULL, node.ref(), recordTypes.ref(),
            queryAttribute.ref(), matchType, queryValue.ref(),
            fetchAttributes.ref(), maxResults, error
        )
        if query == ffi.NULL:
            error = CFErrorRef(error[0])
            raise ODError("Unable to create query: {}".format(error.error()))
        return ODQuery(query)

    def results(self, allowPartial=False):
        """
        Return a list of L{ODRecords} matching the query.
        """
        error = ffi.new("CFErrorRef *")
        results = od.ODQueryCopyResults(self.ref(), allowPartial, error)
        if results == ffi.NULL:
            error = CFErrorRef(error[0])
            raise ODError("Unable to create query: {}".format(error.error()))
        results = CFArrayRef(results)
        return [ODRecord(result.ref(), owned=False) for result in results.toList()]
