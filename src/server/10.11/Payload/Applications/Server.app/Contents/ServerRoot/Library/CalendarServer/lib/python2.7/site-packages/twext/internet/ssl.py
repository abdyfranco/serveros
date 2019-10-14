##
# Copyright (c) 2005-2016 Apple Inc. All rights reserved.
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
Extensions to twisted.internet.ssl.
"""

__all__ = [
    "ChainingOpenSSLContextFactory",
]

import OpenSSL
from OpenSSL.SSL import Context as SSLContext, SSLv23_METHOD, OP_NO_SSLv2, \
    OP_CIPHER_SERVER_PREFERENCE, OP_NO_SSLv3, VERIFY_NONE, VERIFY_PEER, \
    VERIFY_FAIL_IF_NO_PEER_CERT, VERIFY_CLIENT_ONCE

from twisted.internet.ssl import DefaultOpenSSLContextFactory
from twisted.internet._sslverify import Certificate

import uuid

_OP_NO_COMPRESSION = getattr(OpenSSL.SSL, 'OP_NO_COMPRESSION', 0x00020000)

class ChainingOpenSSLContextFactory (DefaultOpenSSLContextFactory):
    def __init__(
        self, privateKeyFileName, certificateFileName,
        sslmethod=SSLv23_METHOD,
        certificateChainFile=None, keychainIdentity=None,
        passwdCallback=None, ciphers=None,
        verifyClient=False, requireClientCertificate=False,
        verifyClientOnce=True, verifyClientDepth=9,
        clientCACertFileNames=[], sendCAsToClient=True
    ):
        self.certificateChainFile = certificateChainFile
        self.keychainIdentity = keychainIdentity
        self.passwdCallback = passwdCallback
        self.ciphers = ciphers

        self.verifyClient = verifyClient
        self.requireClientCertificate = requireClientCertificate
        self.verifyClientOnce = verifyClientOnce
        self.verifyClientDepth = verifyClientDepth
        self.clientCACertFileNames = clientCACertFileNames
        self.sendCAsToClient = sendCAsToClient

        DefaultOpenSSLContextFactory.__init__(
            self,
            privateKeyFileName,
            certificateFileName,
            sslmethod=sslmethod
        )


    def cacheContext(self):
        # Unfortunate code duplication.
        ctx = SSLContext(self.sslmethod)

        # Always disable SSLv2/SSLv3/Compression
        ctx.set_options(OP_NO_SSLv2)
        ctx.set_options(OP_NO_SSLv3)
        ctx.set_options(_OP_NO_COMPRESSION)

        if self.ciphers is not None:
            ctx.set_cipher_list(self.ciphers)
            ctx.set_options(OP_CIPHER_SERVER_PREFERENCE)

        if self.passwdCallback is not None:
            ctx.set_passwd_cb(self.passwdCallback)

        if self.keychainIdentity and hasattr(ctx, "use_keychain_identity"):
            ctx.use_keychain_identity(self.keychainIdentity)
        else:
            if self.certificateFileName:
                ctx.use_certificate_file(self.certificateFileName)
            if self.privateKeyFileName:
                ctx.use_privatekey_file(self.privateKeyFileName)
            if self.certificateChainFile:
                ctx.use_certificate_chain_file(self.certificateChainFile)

        verifyFlags = VERIFY_NONE
        if self.verifyClient:
            verifyFlags = VERIFY_PEER
            if self.requireClientCertificate:
                verifyFlags |= VERIFY_FAIL_IF_NO_PEER_CERT
            if self.verifyClientOnce:
                verifyFlags |= VERIFY_CLIENT_ONCE
            if self.clientCACertFileNames:
                store = ctx.get_cert_store()
                for cert in self.clientCACertFileNames:
                    with open(cert) as f:
                        certpem = f.read()
                    cert = Certificate.loadPEM(certpem)
                    store.add_cert(cert.original)
                    if self.sendCAsToClient:
                        ctx.add_client_ca(cert.original)

            # When a client certificate is used we also need to set a session context id
            # to avoid openssl SSL_F_SSL_GET_PREV_SESSION,SSL_R_SESSION_ID_CONTEXT_UNINITIALIZED
            # errors
            ctx.set_session_id(str(uuid.uuid4()).replace("-", ""))

        # It'd be nice if pyOpenSSL let us pass None here for this behavior (as
        # the underlying OpenSSL API call allows NULL to be passed).  It
        # doesn't, so we'll supply a function which does the same thing.
        def _verifyCallback(conn, cert, errno, depth, preverify_ok):
            return preverify_ok
        ctx.set_verify(verifyFlags, _verifyCallback)

        if self.verifyClientDepth is not None:
            ctx.set_verify_depth(self.verifyClientDepth)

        self._context = ctx
