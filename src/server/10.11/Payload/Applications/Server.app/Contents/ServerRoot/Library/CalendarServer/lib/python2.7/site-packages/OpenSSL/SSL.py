##
# Copyright (c) 2015-2016 Apple Inc. All rights reserved.
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
An API compatible replace for pyOpenSSL's OpenSSL.SSL module that uses SecureTransport as the
underlying SSL library. This is designed to work with Twisted's twisted.protocols.tls.TLSMemoryBIOProtocol
object, and provide a way to use SecureTransport with Twisted with the minimum amount of changes.
"""

from osx._corefoundation import ffi, lib as security
from osx.corefoundation import CFArrayRef

from OpenSSL.crypto import load_certificate, load_privatekey, load_keychain_identity, FILETYPE_PEM


class Error(Exception):
    """
    An error occurred in an `OpenSSL.SSL` API.
    """
    pass



class WantReadError(Error):
    pass



class WantWriteError(Error):
    pass



class WantX509LookupError(Error):
    pass



class ZeroReturnError(Error):
    pass


# Constants grabbed from pyOpenSSL and openssl/include/ssl.h

SSLv2_METHOD = 1
SSLv3_METHOD = 2
SSLv23_METHOD = 3
TLSv1_METHOD = 4
TLSv1_1_METHOD = 5
TLSv1_2_METHOD = 6

OP_NO_SSLv2 = 0x01000000
OP_NO_SSLv3 = 0x02000000
OP_NO_TLSv1 = 0x04000000
OP_NO_TLSv1_1 = 0x08000000
OP_NO_TLSv1_2 = 0x10000000

OP_NO_COMPRESSION = 0x00020000
OP_CIPHER_SERVER_PREFERENCE = 0x00400000

VERIFY_NONE = 0x00
VERIFY_PEER = 0x01
VERIFY_FAIL_IF_NO_PEER_CERT = 0x02
VERIFY_CLIENT_ONCE = 0x04



class Context(object):
    """
    Equivalent of an pyOpenSSL OpenSSL.SSL.Context object, with many of the methods stubbed out.
    """

    def __init__(self, method):
        """
        The L{method} value is actually ignored for SecureTransport.

        @param method: one of the *_METHOD values
        @type method: L{int}
        """
        self.method = method
        self.certificate = None
        self.pkey = None
        self.identity = None
        self.options = set()


    def set_options(self, option):
        """
        Add an option to this context.

        @param option: the OP_* value to add
        @type option: L{int}
        """
        self.options.add(option)


    def use_certificate_file(self, certificateFileName):
        """
        Certificate file to use - for SecureTransport we actually treat the file name as the certificate name
        to lookup in the KeyChain. Set it only if an identity has not already been set.

        @param certificateFileName: name of the certificate file to use
        @type certificateFileName: L{str}
        """
        if self.identity is None and certificateFileName:
            with open(certificateFileName) as f:
                data = f.read()
            self.certificate = load_certificate(FILETYPE_PEM, data)
            raise NotImplementedError("SecureTransport cannot use cert files directly. Put them in the keychain.")


    def use_privatekey_file(self, privateKeyFileName):
        """
        Private key file to use - for SecureTransport we actually treat the file name as the certificate name
        to lookup in the KeyChain. Set it only if an identity has not already been set.

        @param privateKeyFileName: name of the private key file to use
        @type privateKeyFileName: L{str}
        """
        if self.identity is None and privateKeyFileName:
            with open(privateKeyFileName) as f:
                data = f.read()
            self.pkey = load_privatekey(FILETYPE_PEM, data)
            raise NotImplementedError("SecureTransport cannot use of pkey files directly. Put them in the keychain.")


    def use_certificate_chain_file(self, certfile):
        pass


    def use_keychain_identity(self, identity):
        if self.identity is None and identity:
            self.identity = load_keychain_identity(identity)


    def set_passwd_cb(self, callback, userdata=None):
        pass


    def set_cipher_list(self, cipher_list):
        pass


    def set_session_id(self, buf):
        pass


    def set_verify(self, mode, callback):
        """
        We are going to rely on SecureTransport's own KeyChain based verification rather than overriding with
        our own.
        """
        pass


    def set_verify_depth(self, depth):
        """
        We are going to rely on SecureTransport's own KeyChain based verification rather than overriding with
        our own.
        """
        pass


    def add_client_ca(self, certificate_authority):
        pass



class Connection(object):
    """
    Equivalent of an pyOpenSSL OpenSSL.SSL.Connection object.

    Due to the way SecureTransport's read/write callbacks work, we need a way to track all instances of this class
    via a simple reference value (an L{int}) so that we can gain access to the L{Connection} object during the
    callbacks. This is done using the C{engines} class variable and a counter.
    """

    engines = {}
    next_engine_id = 1

    def __init__(self, context, socket=None):
        """
        @param context: the context to use for the connection settings
        @type context: L{Context}
        @param socket: ignored
        @type socket: L{None}
        """
        self.context = context
        self.protocol = None
        self.is_client = None

        self.ctx = None
        self.connref = None
        self.bytes = []
        self._in_handshake = None

        # Register for callbacks
        self.engine_id = self.next_engine_id
        self.__class__.next_engine_id += 1
        self.engines[self.engine_id] = self


    def set_app_data(self, protocol):
        """
        We need access to the Twisted L{Protocol} object so we can get to the associated L{Transport} object
        which allows us to read/write to the underlying socket.

        @param protocol: Twisted protocol to use
        @type protocol: L{TLSMemoryBIOProtocol}
        """
        self.protocol = protocol


    def set_connect_state(self):
        """
        Called when a client connection needs to be initiated.
        """
        self.is_client = True
        self.connect()


    def set_accept_state(self):
        """
        Called when a server connection needs to be initiated.
        """
        self.is_client = False
        self.connect()


    @staticmethod
    @ffi.callback("OSStatus (*) ( SSLConnectionRef connection, void *data, size_t *dataLength )")
    def _read(fdptr, data, dataLength):
        """
        The SecureTransport SSL read callback.

        @param fdptr: reference value added via SSLSetConnection
        @type fdptr: ffi(int *)
        @param data: buffer to read data into
        @type data: ffi(void *)
        @param dataLength: length of the buffer to read into, and on return
            the actual length of data read
        @type dataLength: ffi(size_t *)
        """

        # Get the associated L{Connection} object
        engine_id = ffi.cast("int *", fdptr)[0]
        engine = Connection.engines[engine_id]

        # If there are bytes pending in the L{Connection}s buffer, read as much
        # of those as possible, or return errSSLWouldBlock
        dlen = dataLength[0]
        rdata = ffi.buffer(data, dlen)
        if engine.getBytes(rdata, dlen) is None:
            dataLength[0] = 0
            return security.errSSLWouldBlock

        return 0


    @staticmethod
    @ffi.callback("OSStatus (*) ( SSLConnectionRef connection, const void *data, size_t *dataLength )")
    def _write(fdptr, data, dataLength):
        """
        The SecureTransport SSL write callback.

        @param fdptr: reference value added via SSLSetConnection
        @type fdptr: ffi(int *)
        @param data: buffer to write
        @type data: ffi(const void *)
        @param dataLength: length of the data to write, and on return
            the actual length of data written
        @type dataLength: ffi(size_t *)
        """

        # Get the associated L{Connection} object
        engine_id = ffi.cast("int *", fdptr)[0]
        engine = Connection.engines[engine_id]

        # We always write everything in one go
        dlen = dataLength[0]
        wdata = ffi.buffer(data, dlen)
        engine.protocol.transport.write(wdata[:])

        return 0


    def _sslread(self, bytes):
        """
        Wrapper for SecureTransport SSLRead method.

        @param bytes: maximum length of data to read
        @type bytes: L{int}

        @return: the data read
        @rtype: L{ffi.buffer}
        """

        read = ffi.new("char[]", bytes)
        processed = ffi.new("size_t *")
        err = security.SSLRead(self.ctx, read, bytes, processed)
        if err == 0:
            response = ffi.buffer(read, processed[0])
            return response
        elif err == security.errSSLWouldBlock:
            raise WantReadError
        elif err == security.errSSLClosedGraceful:
            raise ZeroReturnError
        else:
            self.shutdown()
            raise Error(err)


    def _sslwrite(self, data):
        """
        Wrapper for SecureTransport SSLWrite method.

        @param data: data to write
        @type data: L{str}
        """

        processed = ffi.new("size_t *")
        err = security.SSLWrite(self.ctx, data, len(data), processed)
        if err == 0:
            return processed[0]
        elif err == security.errSSLWouldBlock:
            return processed[0]
        else:
            self.shutdown()
            raise Error(err)


    def connect(self):
        """
        Create the SecureTransport SSLContextRef object and initialize it.
        """

        self.ctx = security.SSLCreateContext(ffi.NULL, security.kSSLClientSide if self.is_client else security.kSSLServerSide, security.kSSLStreamType)

        minVersion = None
        for option, minValue in (
            (OP_NO_SSLv2, security.kSSLProtocol3),
            (OP_NO_SSLv3, security.kTLSProtocol1),
            (OP_NO_TLSv1, security.kTLSProtocol11),
            (OP_NO_TLSv1_1, security.kTLSProtocol12),
            (OP_NO_TLSv1_2, security.kTLSProtocol12),   # TLS1.2 is the highest supported right now
        ):
            if option in self.context.options:
                minVersion = minValue
        if minVersion is not None:
            security.SSLSetProtocolVersionMin(self.ctx, minVersion)

        # Make sure we have a reference back to this L{Connection} in the SecureTransport callbacks
        self.connref = ffi.new("int *", self.engine_id)
        err = security.SSLSetConnection(self.ctx, ffi.cast("SSLConnectionRef", self.connref))
        if err:
            self.shutdown()
            raise Error(err)

        # Setup the actual SecureTransport callbacks
        err = security.SSLSetIOFuncs(self.ctx, self._read, self._write)
        if err:
            self.shutdown()
            raise Error(err)

        # Must have a certificate identity if we are a server
        if not self.is_client and self.context.identity is None:
            self.shutdown()
            raise Error("No certificate")

        # Add the certificate
        if self.context.identity is not None:
            certs = CFArrayRef.fromList([self.context.identity])
            err = security.SSLSetCertificate(self.ctx, certs.ref())
            if err:
                self.shutdown()
                raise Error(err)


    def do_handshake(self):
        """
        Carry out the SecureTransport SSLHandshake. Note that this can be called multiple times during the SSL connection
        setup as data needs to be read/written via the underlying Twisted L{Transport} object in order for the actual
        handshake data exchange to take place. So this will likely get errSSLWouldBlock several times.
        """
        if self.ctx is None:
            # Just treat this as a failure to read data as it is possible the connection
            # got closed right before, or during, the handshake.
            raise WantReadError
        self._in_handshake = True
        err = security.SSLHandshake(self.ctx)
        if err == 0:
            self._in_handshake = False
        elif err == security.errSSLWouldBlock:
            raise WantReadError
        else:
            self.shutdown()
            raise Error(err)


    def get_peer_certificate(self):
        return None


    def get_cipher_list(self):
        return ("null",)


    def shutdown(self):
        """
        Wrapper for SecureTransport SSLCLose method
        """
        if self.ctx is not None:
            err = security.SSLClose(self.ctx)

            # Always clear out the callbacks reference
            self.ctx = None
            self.connref = None
            del self.engines[self.engine_id]
            if err:
                raise Error(err)
        return True


    def bio_read(self, bytes):
        """
        We always send immediately so there is nothing to do here.
        """
        raise WantReadError


    def bio_write(self, bytes):
        """
        Just append to our internal buffer so that the next SSLRead will can retrieve the "raw" SSL bytes
        from the buffer and decode them into actual "application" data.

        @param bytes: data to write
        @type bytes: L{str}
        """
        self.bytes.append(bytes)


    def bio_shutdown(self):
        self.shutdown()


    def recv(self, bytes):
        """
        Retrieve application level data from SSL.
        """
        if self.ctx is None:
            raise ZeroReturnError
        elif self._in_handshake is None:
            raise WantReadError
        elif self._in_handshake:
            self.do_handshake()

        data = self._sslread(bytes)
        return data[:]


    def send(self, bytes):
        """
        Send application level data to SSL.
        """
        if self.ctx is None:
            raise ZeroReturnError
        elif self._in_handshake is None:
            raise WantReadError
        elif self._in_handshake:
            self.do_handshake()

        return self._sslwrite(bytes)


    def getBytes(self, buf, blen):
        """
        Get the next set of pending data for SSLRead from the internal buffer.

        @param buf: buffer to read into
        @type buf: L{ffi.buffer}
        @param blen: maximum length to read
        @type blen: L{int}

        @return: the length actually read
        @rtype: L{int}
        """
        self.bytes = ["".join(self.bytes)]
        if len(self.bytes[0]) >= blen:
            buf[:] = self.bytes[0][:blen]
            self.bytes[0] = self.bytes[0][blen:]
            return blen
        else:
            return None
