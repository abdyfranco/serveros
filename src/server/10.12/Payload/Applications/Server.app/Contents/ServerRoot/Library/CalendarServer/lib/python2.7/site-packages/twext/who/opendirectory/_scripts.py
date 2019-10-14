##
# Copyright (c) 2010-2016 Apple Inc. All rights reserved.
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

import sys
import md5
import sha
from getpass import getpass

from twisted.internet.defer import inlineCallbacks
from twisted.cred.credentials import UsernamePassword, DigestedCredentials
from twisted.cred.error import UnauthorizedLogin

from twext.who.expression import (
    MatchExpression, MatchType, CompoundExpression, Operand,
)
from twext.who.opendirectory import DirectoryService


algorithms = {
    "md5": md5.new,
    "md5-sess": md5.new,
    "sha": sha.new,
}


# DigestCalcHA1
def calcHA1(
    pszAlg,
    pszUserName,
    pszRealm,
    pszPassword,
    pszNonce,
    pszCNonce,
    preHA1=None
):
    """
    @param pszAlg: The name of the algorithm to use to calculate the digest.
        Currently supported are md5 md5-sess and sha.

    @param pszUserName: The username
    @param pszRealm: The realm
    @param pszPassword: The password
    @param pszNonce: The nonce
    @param pszCNonce: The cnonce

    @param preHA1: If available this is a str containing a previously
        calculated HA1 as a hex string. If this is given then the values for
        pszUserName, pszRealm, and pszPassword are ignored.
    """

    if (preHA1 and (pszUserName or pszRealm or pszPassword)):
        raise TypeError(("preHA1 is incompatible with the pszUserName, "
                         "pszRealm, and pszPassword arguments"))

    if preHA1 is None:
        # We need to calculate the HA1 from the username:realm:password
        m = algorithms[pszAlg]()
        m.update(pszUserName)
        m.update(":")
        m.update(pszRealm)
        m.update(":")
        m.update(pszPassword)
        HA1 = m.digest()
    else:
        # We were given a username:realm:password
        HA1 = preHA1.decode("hex")

    if pszAlg == "md5-sess":
        m = algorithms[pszAlg]()
        m.update(HA1)
        m.update(":")
        m.update(pszNonce)
        m.update(":")
        m.update(pszCNonce)
        HA1 = m.digest()

    return HA1.encode("hex")


# DigestCalcResponse
def calcResponse(
    HA1,
    algo,
    pszNonce,
    pszNonceCount,
    pszCNonce,
    pszQop,
    pszMethod,
    pszDigestUri,
    pszHEntity,
):
    m = algorithms[algo]()
    m.update(pszMethod)
    m.update(":")
    m.update(pszDigestUri)
    if pszQop == "auth-int" or pszQop == "auth-conf":
        m.update(":")
        m.update(pszHEntity)
    HA2 = m.digest().encode("hex")

    m = algorithms[algo]()
    m.update(HA1)
    m.update(":")
    m.update(pszNonce)
    m.update(":")
    if pszNonceCount and pszCNonce and pszQop:
        m.update(pszNonceCount)
        m.update(":")
        m.update(pszCNonce)
        m.update(":")
        m.update(pszQop)
        m.update(":")
    m.update(HA2)
    respHash = m.digest().encode("hex")
    return respHash


@inlineCallbacks
def authUsernamePassword(username, password):
    # Authenticate using simple password

    service = DirectoryService()

    creds = UsernamePassword(username, password)
    try:
        id = yield service.requestAvatarId(creds)
        print("OK via UsernamePassword, avatarID: {id}".format(id=id))
        print("   {name}".format(name=id.fullNames))
    except UnauthorizedLogin:
        print("Via UsernamePassword, could not authenticate")

    print("")

    # Authenticate using Digest

    algorithm = "md5"  # "md5-sess"
    cnonce = "/rrD6TqPA3lHRmg+fw/vyU6oWoQgzK7h9yWrsCmv/lE="
    entity = "00000000000000000000000000000000"
    method = "GET"
    nc = "00000001"
    nonce = "128446648710842461101646794502"
    qop = None
    realm = "host.example.com"
    uri = "http://host.example.com"

    responseHash = calcResponse(
        calcHA1(
            algorithm.lower(), username, realm, password, nonce, cnonce
        ),
        algorithm.lower(), nonce, nc, cnonce, qop, method, uri, entity
    )

    response = (
        'Digest username="{username}", uri="{uri}", response={hash}'.format(
            username=username, uri=uri, hash=responseHash
        )
    )

    fields = {
        "realm": realm,
        "nonce": nonce,
        "response": response,
        "algorithm": algorithm,
    }

    creds = DigestedCredentials(username, method, realm, fields)

    try:
        id = yield service.requestAvatarId(creds)
        print("OK via DigestedCredentials, avatarID: {id}".format(id=id))
        print("   {name}".format(name=id.fullNames))
    except UnauthorizedLogin:
        print("Via DigestedCredentials, could not authenticate")


@inlineCallbacks
def lookup(shortNames):
    service = DirectoryService()
    print(
        "Service = {service}\n"
        "Session = {service.session}\n"
        "Node = {service.node}\n"
        # "Local node = {service.localNode}\n"
        .format(service=service)
    )
    print("-" * 80)

    for shortName in shortNames:
        print("Looking up short name: {0}".format(shortName))

        record = yield service.recordWithShortName(service.recordType.user, shortName)
        if record:
            print(record.description())

        continue

        matchExpression = MatchExpression(
            service.fieldName.shortNames, shortName,
            matchType=MatchType.equals,
        )

        records = yield service.recordsFromExpression(matchExpression)
        for record in records:
            print(record.description())

        compoundExpression = CompoundExpression(
            [
                MatchExpression(
                    service.fieldName.shortNames, shortName,
                    matchType=MatchType.contains
                ),
                MatchExpression(
                    service.fieldName.emailAddresses, shortName,
                    matchType=MatchType.contains
                ),
            ],
            Operand.OR
        )

        records = yield service.recordsFromExpression(compoundExpression)
        for record in records:
            print(record.description())


def run_auth():
    username = raw_input("Username: ")
    if username:
        password = getpass()
        if password:
            authUsernamePassword(username, password)


def run_lookup():
    lookup(sys.argv[1:])
