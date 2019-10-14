# -*- test-case-name: twext.who.test.test_aggregate -*-
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
Directory service which aggregates multiple directory services.
"""

__all__ = [
    "DirectoryService",
]

import collections
from itertools import chain

from twisted.python.components import proxyForInterface
from twisted.internet.defer import (
    gatherResults, FirstError, succeed, inlineCallbacks, returnValue
)

from .idirectory import DirectoryConfigurationError, IDirectoryService
from .directory import (
    DirectoryService as BaseDirectoryService
)
from .util import ConstantsContainer


class DirectoryService(BaseDirectoryService):
    """
    Aggregate directory service.
    """

    def __init__(self, realmName, services):
        recordTypes = set()

        for service in services:
            if not IDirectoryService.implementedBy(service.__class__):
                raise ValueError(
                    "Not a directory service: {0}".format(service)
                )

            service = proxyForInterface(
                IDirectoryService, originalAttribute="_service"
            )(service)

            for recordType in service.recordTypes():
                if recordType in recordTypes:
                    raise DirectoryConfigurationError(
                        "Aggregated services may not vend "
                        "the same record type: {0}"
                        .format(recordType)
                    )
                recordTypes.add(recordType)

        BaseDirectoryService.__init__(self, realmName)

        self._services = tuple(services)

    @property
    def services(self):
        return self._services

    @property
    def recordType(self):
        if not hasattr(self, "_recordType"):
            self._recordType = ConstantsContainer(tuple(
                s.recordTypes()
                for s in self.services
            ))
        return self._recordType

    @inlineCallbacks
    def _oneFromSubServices(self, methodName, *args, **kwargs):
        for service in self.services:
            m = getattr(service, methodName)
            record = yield m(*args, **kwargs)

            if record is not None:
                returnValue(record)

        returnValue(None)

    def _gatherFromSubServices(self, methodName, *args, **kwargs):
        ds = []
        for service in self.services:
            m = getattr(service, methodName)
            d = m(*args, **kwargs)
            ds.append(d)

        def unwrapFirstError(f):
            f.trap(FirstError)
            return f.value.subFailure

        d = gatherResults(ds, consumeErrors=True)
        d.addCallback(lambda results: chain(*results))
        d.addErrback(unwrapFirstError)
        return d

    def recordsFromExpression(
        self, expression, recordTypes=None, records=None,
        limitResults=None, timeoutSeconds=None
    ):
        return self._gatherFromSubServices(
            "recordsFromExpression", expression, recordTypes=recordTypes,
            records=None,
            limitResults=limitResults, timeoutSeconds=timeoutSeconds
        )

    # Implementation of recordWith*() methods may seem unnecessary here, since
    # they eventually end up at recordsFromExpression() anyway (in our
    # superclass).
    # However, the wrapped services may have optimzed versions of these, so we
    # want to call their implementations, not bypass them.

    def recordsWithFieldValue(
        self, fieldName, value, limitResults=None, timeoutSeconds=None
    ):
        return self._gatherFromSubServices(
            "recordsWithFieldValue", fieldName, value,
            limitResults=limitResults, timeoutSeconds=timeoutSeconds
        )

    def recordWithUID(self, uid, timeoutSeconds=None):
        return self._oneFromSubServices(
            "recordWithUID", uid, timeoutSeconds=timeoutSeconds
        )

    def recordWithGUID(self, guid, timeoutSeconds=None):
        return self._oneFromSubServices(
            "recordWithGUID", guid, timeoutSeconds=timeoutSeconds
        )

    def recordsWithRecordType(
        self, recordType, limitResults=None, timeoutSeconds=None
    ):
        # Since we know the recordType, we can go directly to the appropriate
        # service.
        for service in self.services:
            if recordType in service.recordTypes():
                return service.recordsWithRecordType(
                    recordType,
                    limitResults=limitResults, timeoutSeconds=timeoutSeconds
                )
        return succeed(())

    def recordWithShortName(self, recordType, shortName, timeoutSeconds=None):
        # Since we know the recordType, we can go directly to the appropriate
        # service.
        for service in self.services:
            if recordType in service.recordTypes():
                return service.recordWithShortName(
                    recordType, shortName, timeoutSeconds=timeoutSeconds
                )
        return succeed(None)

    def recordsWithEmailAddress(
        self, emailAddress, limitResults=None, timeoutSeconds=None
    ):
        return self._gatherFromSubServices(
            "recordsWithEmailAddress", emailAddress,
            limitResults=limitResults, timeoutSeconds=timeoutSeconds
        )

    @inlineCallbacks
    def updateRecords(self, records, create=False):
        # When migrating there may be lots of new records so batch this by each
        # service record type.
        recordsByType = collections.defaultdict(list)
        for record in records:
            recordsByType[record.recordType].append(record)

        for recordType, recordList in recordsByType.items():
            for service in self.services:
                if recordType in service.recordTypes():
                    yield service.updateRecords(recordList, create=create)

    @inlineCallbacks
    def removeRecords(self, uids):
        # FIXME: since we don't know which sub-service owns each uid, we
        # currently try removing the uids in each sub-service, ignoring
        # errors.
        for service in self.services:
            try:
                yield service.removeRecords(uids)
            except:
                pass

    @inlineCallbacks
    def flush(self):
        for service in self.services:
            try:
                yield service.flush()
            except:
                pass
