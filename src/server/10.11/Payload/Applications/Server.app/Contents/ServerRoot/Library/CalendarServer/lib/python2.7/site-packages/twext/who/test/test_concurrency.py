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
from twext.python.types import MappingProxyType
from twext.who.directory import DirectoryRecord
from twext.who.idirectory import RecordType, FieldName
from twext.who.ldap._constants import LDAPAttribute, LDAPObjectClass
from twext.who.ldap._service import DirectoryService as LDAPDirectoryService, \
    DEFAULT_FIELDNAME_ATTRIBUTE_MAP, RecordTypeSchema
from twext.who.opendirectory._service import DirectoryService as ODDirectoryService
from twisted.internet.defer import inlineCallbacks, DeferredList, returnValue
from twisted.trial import unittest
import time

"""
Test the concurrency of DS implementations against real servers.
"""

TEST_FIELDNAME_MAP = dict(DEFAULT_FIELDNAME_ATTRIBUTE_MAP)
TEST_FIELDNAME_MAP[FieldName.uid] = (u"uid",)

TEST_RECORDTYPE_SCHEMAS_OSX = MappingProxyType({

    RecordType.user: RecordTypeSchema(
        # cn=users
        relativeDN=u"cn={0}".format("users"),

        # (objectClass=inetOrgPerson)
        attributes=(
            (
                LDAPAttribute.objectClass.value,
                LDAPObjectClass.inetOrgPerson.value,
            ),
        ),
    ),

    RecordType.group: RecordTypeSchema(
        # cn=groups
        relativeDN=u"cn={0}".format("groups"),

        # (objectClass=groupOfNames)
        attributes=(
            (
                LDAPAttribute.objectClass.value,
                LDAPObjectClass.groupOfNames.value,
            ),
        ),
    ),

})

TEST_RECORDTYPE_SCHEMAS_OTHER = MappingProxyType({

    RecordType.user: RecordTypeSchema(
        # ou=person
        relativeDN=u"ou={0}".format("people"),

        # (objectClass=inetOrgPerson)
        attributes=(
            (
                LDAPAttribute.objectClass.value,
                LDAPObjectClass.inetOrgPerson.value,
            ),
        ),
    ),

    RecordType.group: RecordTypeSchema(
        # ou=groupOfNames
        relativeDN=u"ou={0}".format(LDAPObjectClass.groupOfNames.value),

        # (objectClass=groupOfNames)
        attributes=(
            (
                LDAPAttribute.objectClass.value,
                LDAPObjectClass.groupOfNames.value,
            ),
        ),
    ),

})

class DirectoryServiceConcurrencyTest(unittest.TestCase):
    """
    Tests for directory records.
    """

    @inlineCallbacks
    def _runTest(self, num_threads, multiple_services, service_maker, details, num_requests, do_auth):

        if multiple_services:
            services = [service_maker() for _ in range(num_threads)]
        else:
            services = [service_maker()] * num_threads

        # Warm up each service before starting timer
        for n, svc in enumerate(services):
            record = yield svc.recordWithShortName(RecordType.user, details["user"].format(n + 1))
            self.assertTrue(isinstance(record, DirectoryRecord))

        start = time.time()
        ctr = [0]

        @inlineCallbacks
        def _records(n):
            for _ in range(num_requests):
                record = yield services[n].recordWithShortName(RecordType.user, details["user"].format(n + 1))
                self.assertTrue(isinstance(record, DirectoryRecord))
                ctr[0] += 1

        @inlineCallbacks
        def _auth(n):
            record = yield services[n].recordWithShortName(RecordType.user, details["user"].format(n + 1))
            for _ in range(num_requests):
                result = yield record.verifyPlaintextPassword(details["pswd"].format(n + 1))
                self.assertTrue(result)
                ctr[0] += 1

        dl = []
        for i in range(num_threads):
            dl.append((_auth if do_auth else _records)(i))

        dl = DeferredList(dl)
        yield dl

        returnValue((time.time() - start, ctr[0],))


    @inlineCallbacks
    def test_ldap_multi_service(self):
        """
        See if {ldap._service.DirectoryService is concurrent.
        """

        num_threads = 20
        multiple_services = False
        num_requests = 100
        do_auth = False
        use_od = False
        configChoice = "local"

        configs = {
            "local": {
                "url": "ldap://localhost",
                "baseDN": "dc=example,dc=com",
                "rschema": TEST_RECORDTYPE_SCHEMAS_OSX,
                "user": u"user{:02d}",
                "pswd": u"user{:02d}",
            },
            "example": {
                "url": "ldap://example.com",
                "baseDN": "o=example.com,o=email",
                "rschema": TEST_RECORDTYPE_SCHEMAS_OTHER,
                "user": u"TestAccount{}",
                "pswd": u"pswd",
            },
        }

        details = configs[configChoice]

        def _serviceMaker():
            if use_od:
                return ODDirectoryService(
                    nodeName="/LDAPv3/127.0.0.1",
                )
            else:
                return LDAPDirectoryService(
                    url=details["url"],
                    baseDN=details["baseDN"],
                    fieldNameToAttributesMap=TEST_FIELDNAME_MAP,
                    recordTypeSchemas=details["rschema"],
                    threadPoolMax=20,
                )


        duration, count = yield self._runTest(num_threads, multiple_services, _serviceMaker, details, num_requests, do_auth)

        print(
            "\n\nType: {} {} {}\nNumber of Services/Requests: {}/{}\nTime: {}\nCount: {}\n".format(
                "OD" if use_od else "LDAP",
                "Multiple" if multiple_services else "Single",
                "Auth" if do_auth else "query",
                num_threads,
                num_requests,
                duration,
                count,
            )
        )

    test_ldap_multi_service.skip = "Not really a unit test - requires actually server to work"
