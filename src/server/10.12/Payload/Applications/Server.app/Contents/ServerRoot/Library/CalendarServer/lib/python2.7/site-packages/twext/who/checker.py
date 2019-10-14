# -*- test-case-name: twext.who.test.test_checker -*-
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

"""
L{twisted.cred}-style credential checker.
"""

from zope.interface import implementer, classImplements, Attribute

from twisted.internet.defer import inlineCallbacks, returnValue
from twisted.cred.error import UnauthorizedLogin
from twisted.cred.checkers import ICredentialsChecker
from twisted.cred.credentials import (
    ICredentials, IUsernamePassword, IUsernameHashedPassword,
    DigestedCredentials,
)

from .idirectory import (
    IDirectoryService, RecordType,
    IPlaintextPasswordVerifier, IHTTPDigestVerifier,
)


@implementer(ICredentialsChecker)
class BaseCredentialChecker(object):
    # credentialInterfaces = (IUsernamePassword, IUsernameHashedPassword)

    def __init__(self, service):
        """
        @param service: The directory service to use to obtain directory
            records and validate credentials against.
        @type service: L{IDirectoryService}
        """
        if not IDirectoryService.providedBy(service):
            raise TypeError("Not an IDirectoryService: {0!r}".format(service))

        self.service = service


class UsernamePasswordCredentialChecker(BaseCredentialChecker):
    credentialInterfaces = (IUsernamePassword, IUsernameHashedPassword)

    @inlineCallbacks
    def requestAvatarId(self, credentials):
        if not IUsernamePassword.providedBy(credentials):
            raise TypeError(
                "Not an IUsernamePassword: {0!r}".format(credentials)
            )

        record = yield self.service.recordWithShortName(
            RecordType.user, credentials.username.decode("utf-8")
        )

        if record is None:
            raise UnauthorizedLogin("No such user")

        if not IPlaintextPasswordVerifier.providedBy(record):
            raise UnauthorizedLogin(
                "Not an IPlaintextPasswordVerifier: {0!r}".format(record)
            )

        auth = yield record.verifyPlaintextPassword(credentials.password)
        if auth:
            returnValue(record)

        raise UnauthorizedLogin("Incorrect password")


class IHTTPDigest(ICredentials):
    """
    HTTP digest credentials.
    """
    username = Attribute("User (short) name")
    method = Attribute("...")
    fields = Attribute("...")  # Attributes would be better.


classImplements(DigestedCredentials, (IHTTPDigest,))


class HTTPDigestCredentialChecker(BaseCredentialChecker):
    credentialInterfaces = (IHTTPDigest,)

    @inlineCallbacks
    def requestAvatarId(self, credentials):
        if not IHTTPDigest.providedBy(credentials):
            raise TypeError(
                "Not an IHTTPDigest: {0!r}".format(credentials)
            )

        record = yield self.service.recordWithShortName(
            RecordType.user, credentials.username.decode("utf-8")
        )

        if record is None:
            raise UnauthorizedLogin("No such user")

        if not IHTTPDigestVerifier.providedBy(record):
            raise UnauthorizedLogin(
                "Not an IHTTPDigestVerifier: {0!r}".format(record)
            )

        result = yield record.verifyHTTPDigest(
            credentials.username,
            credentials.fields.get("realm"),
            credentials.fields.get("uri"),
            credentials.fields.get("nonce"),
            credentials.fields.get("cnonce"),
            credentials.fields.get("algorithm", "md5"),
            credentials.fields.get("nc"),
            credentials.fields.get("qop"),
            credentials.fields.get("response"),
            credentials.method,
        )
        if result:
            returnValue(record)

        raise UnauthorizedLogin("Incorrect password")
