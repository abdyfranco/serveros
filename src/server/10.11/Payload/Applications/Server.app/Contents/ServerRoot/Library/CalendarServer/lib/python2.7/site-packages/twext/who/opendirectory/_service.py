# -*- test-case-name: twext.who.opendirectory.test.test_service -*-
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
OpenDirectory directory service implementation.
"""

from time import time
from uuid import UUID
from zope.interface import implementer

from twisted.internet.defer import succeed, fail, inlineCallbacks, returnValue
from twisted.internet.threads import deferToThread
from twisted.web.guard import DigestCredentialFactory

from twext.python.log import Logger

from ..idirectory import (
    DirectoryServiceError, DirectoryAvailabilityError,
    InvalidDirectoryRecordError, QueryNotSupportedError,
    FieldName as BaseFieldName, RecordType as BaseRecordType,
    IPlaintextPasswordVerifier, IHTTPDigestVerifier,
)
from ..directory import (
    DirectoryService as BaseDirectoryService,
    DirectoryRecord as BaseDirectoryRecord,
)
from ..expression import (
    CompoundExpression, Operand,
    MatchExpression, MatchFlags,
)
from ..util import ConstantsContainer, firstResult, uniqueResult

from Foundation import NSAutoreleasePool
from ._odframework import ODSession, ODNode, ODQuery
from ._constants import (
    FieldName,
    ODSearchPath, ODRecordType, ODAttribute, ODMatchType, ODAuthMethod,
)

# Note: the combination of threads, PyObjC, and OD.Framework is causing trouble
# where OD requests are not completing and we're filling our thread pool.  Not
# using deferToThread() works around the problem, but we should try to measure
# performance impact (although in older versions of the code we were not using
# deferToThread, so it won't be any worse than before).
DEFER_TO_THREAD = False


QUOTING_TABLE = {
    ord(u"\\"): u"\\5C",
    ord(u"/"): u"\\2F",

    ord(u"("): u"\\28",
    ord(u")"): u"\\29",
    ord(u"*"): u"\\2A",

    ord(u"<"): u"\\3C",
    ord(u"="): u"\\3D",
    ord(u">"): u"\\3E",
    ord(u"~"): u"\\7E",

    ord(u"&"): u"\\26",
    ord(u"|"): u"\\7C",

    ord(u"\0"): u"\\00",
}


def wrapWithAutoreleasePool(f):
    """
    A decorator which creates an autorelease pool and deletes it, causing it
    to drain
    """
    def wrapped(*args, **kwds):
        pool = NSAutoreleasePool.alloc().init()
        try:
            return f(*args, **kwds)
        finally:
            del pool
    return wrapped



def deferToThreadWithAutoReleasePool(f, *args, **kwargs):
    return deferToThread(wrapWithAutoreleasePool(f), *args, **kwargs)



#
# Exceptions
#

class OpenDirectoryError(DirectoryServiceError):
    """
    OpenDirectory error.
    """

    def __init__(self, message, odError=None):
        super(OpenDirectoryError, self).__init__(message)
        self.odError = odError



class OpenDirectoryConnectionError(DirectoryAvailabilityError):
    """
    OpenDirectory connection error.
    """

    def __init__(self, message, odError=None):
        super(OpenDirectoryConnectionError, self).__init__(message)
        self.odError = odError



class OpenDirectoryQueryError(OpenDirectoryError):
    """
    OpenDirectory query error.
    """



class OpenDirectoryDataError(OpenDirectoryError):
    """
    OpenDirectory data error.
    """



class UnsupportedRecordTypeError(OpenDirectoryError):
    """
    Record type not supported by service.
    """



#
# Directory Service
#

class DirectoryService(BaseDirectoryService):
    """
    OpenDirectory directory service.
    """
    log = Logger()

    recordType = ConstantsContainer((
        BaseRecordType.user, BaseRecordType.group,
    ))

    fieldName = ConstantsContainer((BaseDirectoryService.fieldName, FieldName))

    # The auto release pool is a class attribute; if _poolDeletionRegistered
    # is True, that means someone has already added a SystemEventTrigger
    _poolDeletionRegistered = False

    def __init__(
        self,
        nodeName=ODSearchPath.search.value,
        suppressSystemRecords=False
    ):
        """
        @param nodeName: the OpenDirectory node to query against.
        @type nodeName: bytes

        @parm suppressSystemRecords: If True, any results returned from this
            service will not contain Mac OS X "system" records.
        @type suppressSystemRecords: C{Boolean}
        """
        self._nodeName = nodeName
        self._suppressSystemRecords = suppressSystemRecords


        # Create an autorelease pool which will get deleted when someone
        # calls _maybeResetPool( ), but no more often than 60 seconds, hence
        # the "maybe"
        DirectoryService._resetAutoreleasePool()

        # Register a pool delete to happen at shutdown
        if not DirectoryService._poolDeletionRegistered:
            from twisted.internet import reactor
            DirectoryService._poolDeletionRegistered = True
            reactor.addSystemEventTrigger("after", "shutdown", DirectoryService._deletePool)


    @classmethod
    def _deletePool(cls):
        """
        Delete the autorelease pool if we have one
        """
        if hasattr(cls, "_autoReleasePool"):
            del cls._autoReleasePool


    @classmethod
    def _resetAutoreleasePool(cls):
        """
        Create an autorelease pool, deleting the old one if we had one.
        """
        cls._deletePool()

        cls._autoReleasePool = NSAutoreleasePool.alloc().init()
        cls._poolCreationTime = time()


    @classmethod
    def _maybeResetPool(cls):
        """
        If it's been at least 60 seconds since the last time we created the
        pool, delete the pool (which drains it) and create a new one.
        """
        poolCreationTime = getattr(cls, "_poolCreationTime", 0)
        now = time()
        if (now - poolCreationTime) > 60:
            cls._resetAutoreleasePool()


    @property
    def nodeName(self):
        return self._nodeName


    @property
    def realmName(self):
        return u"OpenDirectory Node {self.nodeName!r}".format(self=self)


    @property
    def node(self):
        """
        Get the underlying (network) directory node.
        """
        if not hasattr(self, "_node"):
            self._node = self._connect(self._nodeName)
        return self._node


    @property
    def localNode(self):
        """
        Get the local node from the search path (if any), so that we can
        handle it specially.
        """
        if not hasattr(self, "_localNode"):

            if self.nodeName == ODSearchPath.search.value:
                details, error = self.node.nodeDetailsForKeys_error_(
                    (ODAttribute.searchPath.value,), None
                )
                if error:
                    self.log.error(
                        "Error while examining Search path",
                        error=error
                    )
                    raise OpenDirectoryConnectionError(
                        "Unable to connect to OpenDirectory node",
                        error
                    )

                if (
                    ODSearchPath.local.value in
                    details[ODAttribute.searchPath.value]
                ):
                    self._localNode = self._connect(ODSearchPath.local.value)
                else:
                    self._localNode = None

            elif self.nodeName == ODSearchPath.local.value:
                self._localNode = self.node

            else:
                self._localNode = None

        return self._localNode


    @property
    def session(self):
        """
        Get the underlying directory session.
        """
        if not hasattr(self, "_session"):
            session = ODSession.defaultSession()
            self._session = session
        return self._session


    def _connect(self, nodeName):
        """
        Connect to the directory server.

        @param nodeName: The OD node name to connect to
        @type nodeName: C{str}

        @return: the OD node

        @raises: L{OpenDirectoryConnectionError} if unable to connect.
        """

        node, error = ODNode.nodeWithSession_name_error_(
            self.session, nodeName, None
        )

        if error:
            self.log.error(
                "Error while trying to connect to OpenDirectory node "
                "{source.nodeName!r}: {error}",
                error=error
            )
            raise OpenDirectoryConnectionError(
                "Unable to connect to OpenDirectory node",
                error
            )

        return node


    def _queryStringAndRecordTypeFromMatchExpression(self, expression):
        """
        Generates an OD query string from a match expression.

        @param expression: A match expression.
        @type expression: L{MatchExpression}

        @return: tuple(OD query string, query's OD record type string)
        @rtype: tuple(C{unicode}, C{unicode})
        """
        matchType = ODMatchType.fromMatchType(expression.matchType)
        if matchType is None:
            raise QueryNotSupportedError(
                "Unknown match type: {0}".format(matchType)
            )

        flags = tuple(expression.flags)

        if MatchFlags.NOT in flags:
            notOp = u"!"
        else:
            notOp = u""

        # if MatchFlags.caseInsensitive not in flags:
        #     raise NotImplementedError("Need to handle case sensitive")

        if expression.fieldName is self.fieldName.recordType:
            return (
                notOp,
                ODRecordType.fromRecordType(expression.fieldValue).value
            )

        if expression.fieldName is self.fieldName.uid:
            odAttr = ODAttribute.guid
            value = expression.fieldValue

        else:
            odAttr = ODAttribute.fromFieldName(expression.fieldName)
            if odAttr is None:
                raise OpenDirectoryQueryError(
                    "Unknown field name: {0}"
                    .format(expression.fieldName)
                )
            value = expression.fieldValue

        value = unicode(value)  # We want unicode
        value = value.translate(QUOTING_TABLE)  # Escape special chars

        return (
            matchType.queryString.format(
                notOp=notOp, attribute=odAttr.value, value=value
            ),
            None,
        )


    def _queryStringAndRecordTypesFromCompoundExpression(
        self, expression, recordTypes
    ):
        """
        Generates an OD query string from a compound expression.

        @param expression: A compound expression.
        @type expression: L{MatchExpression}

        @param recordTypes: allowed OD record type strings
        @type recordTypes: set(C{unicode})

        @return: tuple(OD query string, set(query's OD record type strings))
        @rtype: (C{unicode}, set(C{unicode}))
        """
        if recordTypes is None:
            recordTypes = set([t.value for t in ODRecordType.iterconstants()])

        queryTokens = []
        for subExpression in expression.expressions:
            queryToken, subExpRecordTypes = (
                self._queryStringAndRecordTypesFromExpression(
                    subExpression, recordTypes
                )
            )
            if subExpRecordTypes:
                if isinstance(subExpRecordTypes, unicode):
                    if (
                        # AND or NOR
                        (expression.operand is Operand.AND) != bool(queryToken)
                    ):
                        if expression.operand is Operand.AND:
                            recordTypes = (
                                recordTypes & set([subExpRecordTypes])
                            )
                        else:
                            recordTypes = (
                                recordTypes - set([subExpRecordTypes])
                            )
                        queryToken = None
                    else:
                        raise QueryNotSupportedError(
                            "Record type matches must AND or NOR"
                        )
                else:
                    recordTypes = subExpRecordTypes

            if queryToken:
                queryTokens.append(queryToken)

        if queryTokens:
            if len(queryTokens) > 1:
                if expression.operand is Operand.AND:
                    queryTokens[:0] = (u"&")
                else:
                    queryTokens[:0] = (u"|")

            if len(queryTokens) > 2:
                queryTokens[:0] = (u"(")
                queryTokens.append(u")")

        return (u"".join(queryTokens), recordTypes)


    def _queryStringAndRecordTypesFromExpression(
        self,
        expression,
        recordTypes=set([t.value for t in ODRecordType.iterconstants()])
    ):
        """
        Converts either a MatchExpression or a CompoundExpression into an LDAP
        query string.

        @param expression: An expression.
        @type expression: L{MatchExpression} or L{CompoundExpression}

        @param recordTypes: allowed OD record type strings
        @type recordTypes: set(C{unicode})

        @return: tuple(OD query string, set(query's OD record type strings))
        @rtype: (C{unicode}, set(C{unicode}))
        """

        if isinstance(expression, MatchExpression):
            queryString, recordType = (
                self._queryStringAndRecordTypeFromMatchExpression(expression)
            )
            return (queryString, recordType if recordType else recordTypes)

        if isinstance(expression, CompoundExpression):
            return self._queryStringAndRecordTypesFromCompoundExpression(
                expression, recordTypes
            )

        raise QueryNotSupportedError(
            "Unknown expression type: {0!r}".format(expression)
        )


    def _queryFromCompoundExpression(
        self, expression, recordTypes=None, local=False, limitResults=None
    ):
        """
        Form an OpenDirectory query from a compound expression.

        @param expression: A compound expression.
        @type expression: L{CompoundExpression}

        @param local: Whether to restrict the query to the local node
        @type local: C{Boolean}

        @return: A native OpenDirectory query or C{None} if the query will
            return no records
        @rtype: L{ODQuery}
        """

        if local:
            node = self.localNode
        else:
            node = self.node

        queryString, _ignore_expressionRecordTypes = (
            self._queryStringAndRecordTypesFromExpression(expression)
        )

        # Scrub unsupported recordTypes
        supportedODRecordTypes = []
        for recordType in self.recordTypes():
            odRecordType = ODRecordType.fromRecordType(recordType)
            if odRecordType is not None:
                supportedODRecordTypes.append(odRecordType.value)
        if recordTypes is not None:
            scrubbedRecordTypes = []
            for recordType in recordTypes:
                recordType = ODRecordType.fromRecordType(recordType).value
                if recordType in supportedODRecordTypes:
                    scrubbedRecordTypes.append(recordType)
        else:
            scrubbedRecordTypes = supportedODRecordTypes

        if not scrubbedRecordTypes:
            # None of the requested recordTypes are supported.
            return None


        if queryString:
            matchType = ODMatchType.compound.value
        else:
            matchType = ODMatchType.any.value

        if limitResults is None:
            maxResults = 0
        else:
            maxResults = limitResults

        query, error = ODQuery.queryWithNode_forRecordTypes_attribute_matchType_queryValues_returnAttributes_maximumResults_error_(
            node,
            scrubbedRecordTypes,
            None,
            matchType,
            queryString,
            self._getFetchAttributes(),
            maxResults,
            None
        )

        if error:
            self.log.error(
                "Error while forming OpenDirectory compound query: {error}",
                error=error
            )
            raise OpenDirectoryQueryError(
                "Unable to form OpenDirectory compound query", error
            )

        return query


    def _getFetchAttributes(self):
        if not hasattr(self, "_fetchAttributes"):
            self._fetchAttributes = [a.value for a in ODAttribute.iterconstants()]
        return self._fetchAttributes


    def _getSupportedODRecordTypes(self):
        if not hasattr(self, "_supportedODRecordTypes"):
            supportedODRecordTypes = []
            for rt in self.recordTypes():
                odRecordType = ODRecordType.fromRecordType(rt)
                if odRecordType is not None:
                    supportedODRecordTypes.append(odRecordType.value)
            self._supportedODRecordTypes = supportedODRecordTypes
        return self._supportedODRecordTypes


    def _queryFromMatchExpression(
        self, expression, recordTypes=None, local=False, limitResults=None
    ):
        """
        Form an OpenDirectory query from a match expression.

        @param expression: A match expression.
        @type expression: L{MatchExpression}

        @param recordTypes: Record types to insert into the query; None for no
            filtering.
        @type recordTypes: iterable of L{NamedConstant}, or None

        @param local: Whether to restrict the query to the local node
        @type local: C{Boolean}

        @return: A native OpenDirectory query.
        @rtype: L{ODQuery}
        """
        if not isinstance(expression, MatchExpression):
            raise TypeError(expression)

        matchType = ODMatchType.fromMatchType(expression.matchType)
        if matchType is None:
            raise QueryNotSupportedError(
                "Unknown match type: {0}".format(matchType)
            )
        matchType = matchType.value

        flags = tuple(expression.flags)

        if MatchFlags.caseInsensitive in flags:
            caseInsensitive = 0x100
        else:
            caseInsensitive = 0x0

        if limitResults is None:
            maxResults = 0
        else:
            maxResults = limitResults

        # For OpenDirectory, use guid for uid:
        if expression.fieldName is self.fieldName.uid:
            expression.fieldName = self.fieldName.guid

        if expression.fieldName is self.fieldName.recordType:

            queryAttribute = None
            queryValue = None
            matchType = ODMatchType.any.value
            caseInsensitive = 0x0

            odRecordTypes = [
                ODRecordType.fromRecordType(expression.fieldValue).value,
            ]
        else:
            if MatchFlags.NOT in flags:
                raise NotImplementedError()

            if recordTypes is None:
                odRecordTypes = [t.value for t in ODRecordType.iterconstants()]
            else:
                odRecordTypes = [
                    ODRecordType.fromRecordType(r).value for r in recordTypes
                ]

            queryAttribute = ODAttribute.fromFieldName(
                expression.fieldName
            ).value

            # TODO: Add support other value types:
            valueType = self.fieldName.valueType(expression.fieldName)
            if valueType == UUID:
                queryValue = unicode(expression.fieldValue).upper()
            else:
                queryValue = unicode(expression.fieldValue)

        if local:
            node = self.localNode
        else:
            node = self.node

        # Scrub unsupported recordTypes
        scrubbedRecordTypes = []
        for odRecordType in odRecordTypes:
            if odRecordType in self._getSupportedODRecordTypes():
                scrubbedRecordTypes.append(odRecordType)

        if not scrubbedRecordTypes:
            # None of the requested recordTypes are supported.
            raise UnsupportedRecordTypeError(
                u",".join(r.name for r in recordTypes)
            )

        query, error = ODQuery.queryWithNode_forRecordTypes_attribute_matchType_queryValues_returnAttributes_maximumResults_error_(
            node,
            scrubbedRecordTypes,
            queryAttribute,
            matchType | caseInsensitive,
            queryValue,
            self._getFetchAttributes(),
            maxResults,
            None
        )

        if error:
            self.log.error(
                "Error while forming OpenDirectory match query: {error}",
                error=error
            )
            raise OpenDirectoryQueryError(
                "Unable to form OpenDirectory match query", error
            )

        return query


    def _isSystemRecord(self, odRecord):
        """
        Examines the OD record to see if it's a Mac OS X system account record.

        @param odRecord: an OD record object

        @return: True if system account record, False otherwise
        @rtype: C{Boolean}
        """
        details, error = odRecord.recordDetailsForAttributes_error_(None, None)

        if error:
            self.log.error(
                "Error while reading OpenDirectory record: {error}",
                error=error
            )
            raise OpenDirectoryDataError(
                "Unable to read OpenDirectory record", error
            )

        # GeneratedUID matches a special pattern
        guid = details.get(ODAttribute.guid.value, (u"",))[0]
        if guid.lower().startswith("ffffeeee-dddd-cccc-bbbb-aaaa"):
            return True

        # ISHidden is True
        isHidden = details.get(ODAttribute.isHidden.value, False)
        if isHidden:
            return True

        # Record-type specific indicators...
        recType = details.get(ODAttribute.recordType.value, (u"",))[0]

        # ...users with UniqueID <= 500 (and is not 99)
        if recType == ODRecordType.user.value:
            uniqueId = int(
                details.get(ODAttribute.uniqueId.value, (u"0",))[0]
            )
            if uniqueId <= 500 and uniqueId != 99:
                return True

        # ...groups with PrimaryGroupID <= 500 (and is not 99)
        elif recType == ODRecordType.group.value:
            primaryGroupId = int(
                details.get(ODAttribute.primaryGroupId.value, (u"0",))[0]
            )
            if primaryGroupId <= 500 and primaryGroupId != 99:
                return True

        # RecordName matches specific prefixes; if *all* RecordName values for
        # a record start with either of these prefixes, it's a system record.
        shortNames = details.get(ODAttribute.shortName.value, (u"",))
        for shortName in shortNames:
            if not (
                shortName.startswith("_") or shortName.startswith("com.apple.")
            ):
                break
        else:
            return True

        return False


    @inlineCallbacks
    def _recordsFromQuery(self, query, timeoutSeconds=None):
        """
        Executes a query and generates directory records from it.

        @param query: A query.
        @type query: L{ODQuery}

        @param timeoutSeconds: number of seconds after which the request
            should timeout (currently unused)
        @type timeoutSeconds: C{integer}

        @return: The records produced by executing the query.
        @rtype: list of L{DirectoryRecord}
        """

        # We can call scheduleInRunLoop:forMode:, which will call back to
        # its delegate...

        if query is None:
            returnValue(())

        if DEFER_TO_THREAD:
            odRecords, error = (
                yield deferToThreadWithAutoReleasePool(
                    query.resultsAllowingPartial_error_,
                    False,
                    None
                )
            )
        else:
            odRecords, error = query.resultsAllowingPartial_error_(False, None)

        if error:
            self.log.error(
                "Error while executing OpenDirectory query: {error}",
                error=error
            )
            returnValue(
                fail(
                    OpenDirectoryQueryError(
                        "Unable to execute OpenDirectory query", error
                    )
                )
            )

        result = []
        for odRecord in odRecords:

            # Conditionally suppress system records
            if self._suppressSystemRecords and self._isSystemRecord(odRecord):
                continue

            try:
                record = DirectoryRecord(self, odRecord)
            except InvalidDirectoryRecordError as e:
                self.log.warn(
                    "Invalid OpenDirectory record ({error}).  "
                    "Fields: {error.fields}",
                    error=e
                )
                continue

            result.append(record)

        returnValue(result)


    def recordsFromNonCompoundExpression(
        self, expression, recordTypes=None, records=None,
        limitResults=None, timeoutSeconds=None
    ):
        DirectoryService._maybeResetPool()


        if isinstance(expression, MatchExpression):
            self.log.debug("OD call: {}".format(expression))
            try:
                query = self._queryFromMatchExpression(
                    expression,
                    recordTypes=recordTypes,
                    limitResults=limitResults,
                )
                return self._recordsFromQuery(
                    query, timeoutSeconds=timeoutSeconds
                )

            except QueryNotSupportedError:
                pass  # Let the superclass try

            except UnsupportedRecordTypeError:
                return succeed([])

        return BaseDirectoryService.recordsFromNonCompoundExpression(
            self, expression,
            limitResults=limitResults, timeoutSeconds=timeoutSeconds
        )


    @inlineCallbacks
    def recordsFromCompoundExpression(
        self, expression, recordTypes=None, records=None,
        limitResults=None, timeoutSeconds=None
    ):
        """
        Returns records matching the CompoundExpression.  Because the
        local node doesn't perform Compound queries in a case insensitive
        fashion (but will do case insensitive for a simple MatchExpression)
        also call localRecordsFromCompoundExpression() which breaks the
        CompoundExpression up into MatchExpressions for sending to the local
        node.
        """
        DirectoryService._maybeResetPool()

        try:
            self.log.debug("OD call: {}".format(expression))
            query = self._queryFromCompoundExpression(
                expression, recordTypes=recordTypes, limitResults=limitResults
            )

        except QueryNotSupportedError:
            returnValue(
                (
                    yield BaseDirectoryService.recordsFromCompoundExpression(
                        self,
                        expression,
                        recordTypes=recordTypes,
                        limitResults=limitResults,
                        timeoutSeconds=timeoutSeconds,
                    )
                )
            )

        results = yield self._recordsFromQuery(query)

        if self.localNode is not None:

            localRecords = yield self.localRecordsFromCompoundExpression(
                expression, recordTypes=recordTypes,
                limitResults=limitResults, timeoutSeconds=timeoutSeconds
            )
            for localRecord in localRecords:
                if localRecord not in results:
                    results.append(localRecord)

        returnValue(results)


    @inlineCallbacks
    def localRecordsFromCompoundExpression(
        self, expression, recordTypes=None,
        limitResults=None, timeoutSeconds=None
    ):
        """
        Takes a CompoundExpression, and recursively goes through each
        MatchExpression, passing those specifically to the local node, and
        ADDing or ORing the results as needed.
        """

        # We keep a set of resulting uids for each sub expression so it's
        # easy to either union (OR) or intersection (AND) the sets
        sets = []

        # Mapping of uid to record
        byUID = {}

        for subExpression in expression.expressions:

            if isinstance(subExpression, CompoundExpression):
                subRecords = yield self.localRecordsFromCompoundExpression(
                    subExpression, recordTypes=recordTypes,
                    limitResults=limitResults, timeoutSeconds=timeoutSeconds
                )

            elif isinstance(subExpression, MatchExpression):
                try:
                    subQuery = self._queryFromMatchExpression(
                        subExpression, recordTypes=recordTypes, local=True,
                        limitResults=limitResults
                    )
                except UnsupportedRecordTypeError:
                    continue
                subRecords = yield self._recordsFromQuery(
                    subQuery,
                    timeoutSeconds=timeoutSeconds
                )

            else:
                raise QueryNotSupportedError(
                    "Unsupported expression type: {}".format(
                        type(subExpression)
                    )
                )

            newSet = set()
            for record in subRecords:
                byUID[record.uid] = record
                newSet.add(record.uid)
            sets.append(newSet)

        results = []
        if byUID:  # If there are any records
            if expression.operand == Operand.AND:
                uids = set.intersection(*sets)
            elif expression.operand == Operand.OR:
                uids = set.union(*sets)
            else:
                raise QueryNotSupportedError(
                    "Unsupported operand: {}".format(expression.operand)
                )
            for uid in uids:
                results.append(byUID[uid])

        returnValue(results)


    def _getUserRecord(self, username):
        """
        Fetch the OD record for a given user.

        @return: ODRecord, or None
        """
        record, error = self.node.recordWithRecordType_name_attributes_error_(
            ODRecordType.user.value, username, None, None
        )
        if error:
            self.log.error(
                "Error while looking up user: {error}",
                error=error
            )
            raise OpenDirectoryQueryError("Unable to look up user", error)

        return record


    @inlineCallbacks
    def recordWithUID(self, uid, timeoutSeconds=None):
        returnValue(firstResult(
            (yield self.recordsWithFieldValue(
                BaseFieldName.uid, uid, timeoutSeconds=timeoutSeconds
            ))
        ))


    @inlineCallbacks
    def recordWithGUID(self, guid, timeoutSeconds=None):
        returnValue(firstResult(
            (yield self.recordsWithFieldValue(
                BaseFieldName.guid, guid, timeoutSeconds=timeoutSeconds
            ))
        ))


    @inlineCallbacks
    def recordWithShortName(self, recordType, shortName, timeoutSeconds=None):

        records = yield self.recordsFromNonCompoundExpression(
            MatchExpression(self.fieldName.shortNames, shortName),
            recordTypes=(recordType,),
            limitResults=1
        )

        try:
            record = uniqueResult(records)
        except DirectoryServiceError:
            self.log.error(
                "Duplicate records for name: {name} ({recordType})"
                .format(name=shortName, recordType=recordType.name)
            )
            raise

        returnValue(record)




@implementer(IPlaintextPasswordVerifier, IHTTPDigestVerifier)
class DirectoryRecord(BaseDirectoryRecord):
    """
    OpenDirectory directory record.
    """

    log = Logger()

    # GUID is a required attribute for OD records.
    requiredFields = BaseDirectoryRecord.requiredFields + (BaseFieldName.guid,)


    def __init__(self, service, odRecord):
        details, error = odRecord.recordDetailsForAttributes_error_(None, None)

        if error:
            self.log.error(
                "Error while reading OpenDirectory record: {error}",
                error=error
            )
            raise OpenDirectoryDataError(
                "Unable to read OpenDirectory record", error
            )

        def coerceType(fieldName, value):
            # Record type field value needs to be looked up
            if fieldName is service.fieldName.recordType:
                return ODRecordType.lookupByValue(value).recordType

            # Otherwise, cast to the valueType specified by the field name
            valueType = service.fieldName.valueType(fieldName)
            try:
                return valueType(value)
            except BaseException as e:
                raise OpenDirectoryDataError(
                    "Unable to coerce OD value {0!r} to type {1}: {2}"
                    .format(value, valueType, e)
                )

        fields = {}
        for name, values in details.iteritems():
            # Ignore attributes that we don't map to fields
            if name in (
                # We get this attribute even though we did not ask for it
                ODAttribute.metaRecordName.value,
                # We fetch these attributes only to look for system accounts
                ODAttribute.uniqueId.value,
                ODAttribute.primaryGroupId.value,
                ODAttribute.isHidden.value,
            ):
                continue

            try:
                attribute = ODAttribute.lookupByValue(name)
            except ValueError:
                self.log.debug(
                    "Unexpected OpenDirectory record attribute: {attribute}",
                    attribute=name
                )
                continue

            fieldName = attribute.fieldName

            if type(values) is bytes:
                values = (coerceType(fieldName, values),)
            else:
                values = tuple(coerceType(fieldName, v) for v in values)

            if service.fieldName.isMultiValue(fieldName):
                fields[fieldName] = values
            else:
                assert len(values) == 1
                fields[fieldName] = values[0]

        # Set uid from guid
        try:
            guid = fields[service.fieldName.guid]
        except KeyError:
            raise InvalidDirectoryRecordError(
                "GUID field is required.", fields
            )

        fields[service.fieldName.uid] = unicode(guid).upper()

        super(DirectoryRecord, self).__init__(service, fields)
        self._odRecord = odRecord


    def __hash__(self):
        return hash(self.guid)


    def __eq__(self, other):
        if isinstance(other, self.__class__):
            return (
                self.service == other.service and
                self.guid == other.guid
            )
        return NotImplemented


    #
    # Verifiers for twext.who.checker stuff.
    #

    @inlineCallbacks
    def verifyPlaintextPassword(self, password):

        if DEFER_TO_THREAD:
            result, error = (
                yield deferToThreadWithAutoReleasePool(
                    self._odRecord.verifyPassword_error_,
                    password,
                    None
                )
            )
        else:
            result, error = self._odRecord.verifyPassword_error_(
                password, None
            )

        if error:
            returnValue(False)

        returnValue(result)


    @inlineCallbacks
    def verifyHTTPDigest(
        self, username, realm, uri, nonce, cnonce,
        algorithm, nc, qop, response, method,
    ):
        challenge = (
            'Digest realm="{realm}", nonce="{nonce}", algorithm={algorithm}'
            .format(
                realm=realm, nonce=nonce, algorithm=algorithm
            )
        )

        if qop:
            responseTemplate = (
                'username="{username}",realm="{realm}",algorithm={algorithm},'
                'nonce="{nonce}",cnonce="{cnonce}",nc={nc},qop={qop},'
                'digest-uri="{uri}",response={response}'
            )
        else:
            responseTemplate = (
                'Digest username="{username}", '
                'realm="{realm}", '
                'nonce="{nonce}", '
                'uri="{uri}", '
                'response="{response}",'
                'algorithm={algorithm}'
            )

        responseArg = responseTemplate.format(
            username=username, realm=realm, algorithm=algorithm,
            nonce=nonce, cnonce=cnonce, nc=nc, qop=qop, uri=uri,
            response=response
        )

        if DEFER_TO_THREAD:
            result, _ignore_m1, _ignore_m2, error = (
                yield deferToThreadWithAutoReleasePool(
                    self._odRecord.verifyExtendedWithAuthenticationType_authenticationItems_continueItems_context_error_,
                    ODAuthMethod.digestMD5.value,
                    [username, challenge, responseArg, method],
                    None, None, None
                )
            )
        else:
            result, _ignore_m1, _ignore_m2, error = self._odRecord.verifyExtendedWithAuthenticationType_authenticationItems_continueItems_context_error_(
                ODAuthMethod.digestMD5.value,
                [username, challenge, responseArg, method],
                None, None, None
            )

        if error:
            returnValue(False)

        returnValue(result)


    @inlineCallbacks
    def members(self):
        members = set()
        for uid in getattr(self, "memberUIDs", ()):
            members.add((yield self.service.recordWithUID(uid)))
        for uid in getattr(self, "nestedGroupsUIDs", ()):
            members.add((yield self.service.recordWithUID(uid)))
        returnValue(members)


    # @inlineCallbacks
    # FIXME: need to implement
    def groups(self):
        groups = set()
        return succeed(groups)



class NoQOPDigestCredentialFactory(DigestCredentialFactory):
    """
    DigestCredentialFactory without qop, to interop with OD.
    """

    def getChallenge(self, address):
        result = DigestCredentialFactory.getChallenge(self, address)
        del result["qop"]
        return result
