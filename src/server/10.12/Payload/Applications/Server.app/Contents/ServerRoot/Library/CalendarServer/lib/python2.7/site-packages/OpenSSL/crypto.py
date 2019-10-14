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
An API compatible replace for pyOpenSSL's OpenSSL.crypto module that uses Security.frameowork.
"""

from osx._corefoundation import ffi, lib as security
from osx.corefoundation import CFDictionaryRef, CFStringRef, CFArrayRef, \
    CFBooleanRef, CFObjectRef, CFErrorRef, CFDataRef

userIDOID = "0.9.2342.19200300.100.1.1"

OID2STR = {
    str(CFStringRef.fromRef(security.kSecOIDCommonName)): "CN",
    str(CFStringRef.fromRef(security.kSecOIDCountryName)): "C",
    str(CFStringRef.fromRef(security.kSecOIDEmailAddress)): "emailAddress",
    str(CFStringRef.fromRef(security.kSecOIDLocalityName)): "L",
    str(CFStringRef.fromRef(security.kSecOIDOrganizationName)): "O",
    str(CFStringRef.fromRef(security.kSecOIDOrganizationalUnitName)): "OU",
    str(CFStringRef.fromRef(security.kSecOIDStateProvinceName)): "ST",
    userIDOID: "UID",
}

FILETYPE_PEM = 1
FILETYPE_ASN1 = 2
FILETYPE_DEFAULT = 3

TYPE_RSA = 6
TYPE_DSA = 116


class Error(Exception):
    """
    An error occurred in an `OpenSSL.crypto` API.
    """
    pass


class PKey(object):
    """
    Equivalent of an pyOpenSSL OpenSSL.crypto.PKey object, with many methods unimplemented.
    """

    def __init__(self, pkey=None):
        self._pkey = pkey


class X509Name(object):
    """
    Equivalent of an pyOpenSSL OpenSSL.crypto.X509Name object.
    """

    def __init__(self, name, components=None):
        self.name = name
        self.components = components

    def get_components(self):
        return self.components.items()


class X509(object):
    """
    Equivalent of an pyOpenSSL OpenSSL.crypto.X509Name object, with many methods unimplemented.
    """

    def __init__(self, certificate=None):
        self._x509 = certificate

    def set_version(self, version):
        raise NotImplementedError

    def get_version(self):
        raise NotImplementedError

    def get_pubkey(self):
        raise NotImplementedError

    def set_pubkey(self, pkey):
        raise NotImplementedError

    def sign(self, pkey, digest):
        raise NotImplementedError

    def get_signature_algorithm(self):
        raise NotImplementedError

    def digest(self, digest_name):
        raise NotImplementedError

    def subject_name_hash(self):
        raise NotImplementedError

    def set_serial_number(self, serial):
        raise NotImplementedError

    def get_serial_number(self):
        raise NotImplementedError

    def gmtime_adj_notAfter(self, amount):
        raise NotImplementedError

    def gmtime_adj_notBefore(self, amount):
        raise NotImplementedError

    def has_expired(self):
        raise NotImplementedError

    def get_notBefore(self):
        raise NotImplementedError

    def set_notBefore(self, when):
        raise NotImplementedError

    def get_notAfter(self):
        raise NotImplementedError

    def set_notAfter(self, when):
        raise NotImplementedError

    def _get_name(self, which):
        raise NotImplementedError

    def _set_name(self, which, name):
        raise NotImplementedError

    def get_issuer(self):
        raise NotImplementedError

    def set_issuer(self, issuer):
        raise NotImplementedError

    def get_subject(self):
        """
        Use Security.framework to extract the componentized SubjectName field and map OID
        values to strings and store in an L{X509Name} object.
        """
        keys = CFArrayRef.fromList([CFStringRef.fromRef(security.kSecOIDX509V1SubjectName)])
        error = ffi.new("CFErrorRef *")
        values = security.SecCertificateCopyValues(self._x509.ref(), keys.ref(), error)
        if values == ffi.NULL:
            error = CFErrorRef(error[0])
            raise Error("Unable to get certificate subject")
        values = CFDictionaryRef(values).toDict()
        value = values[str(CFStringRef.fromRef(security.kSecOIDX509V1SubjectName))]

        components = {}
        if value[str(CFStringRef.fromRef(security.kSecPropertyKeyType))] == str(CFStringRef.fromRef(security.kSecPropertyTypeSection)):
            for item in value[str(CFStringRef.fromRef(security.kSecPropertyKeyValue))]:
                if item[str(CFStringRef.fromRef(security.kSecPropertyKeyType))] == str(CFStringRef.fromRef(security.kSecPropertyTypeString)):
                    v = item[str(CFStringRef.fromRef(security.kSecPropertyKeyValue))]
                    k = OID2STR.get(item[str(CFStringRef.fromRef(security.kSecPropertyKeyLabel))], "Unknown")
                    components[k] = v

        return X509Name("Subject Name", components)

    def set_subject(self, subject):
        raise NotImplementedError

    def get_extension_count(self):
        raise NotImplementedError

    def add_extensions(self, extensions):
        raise NotImplementedError

    def get_extension(self, index):
        raise NotImplementedError


def load_certificate(certtype, buffer):
    """
    Load a certificate with the supplied type and data. If the type is
    L{None} then assume the data is the name of a Keychain identity,
    otherwise assume it is data of the specified type.

    @param certtype: certificate data type or L{None} to read from Keychain
    @type certtype: L{int}
    @param buffer: certificate data or name of the KeyChain item to lookup
    @type buffer: L{str}

    @return: the certificate
    @rtype: L{X509}
    """

    if certtype is None:
        return _load_keychain_item(buffer)
    else:
        return X509(_load_certificate_data(certtype, buffer, security.SecCertificateGetTypeID()))


def load_privatekey(certtype, buffer, passphrase=None):
    """
    Load a private key with the supplied type and data. If the type is
    L{None} then assume the data is the name of a Keychain identity,
    otherwise assume it is data of the specified type.

    @param certtype: certificate data type or L{None} to read from Keychain
    @type certtype: L{int}
    @param buffer: certificate data or name of the KeyChain item to lookup
    @type buffer: L{str}

    @return: the certificate
    @rtype: L{X509}
    """

    if certtype is None:
        return _load_keychain_item(buffer)
    else:
        return PKey(_load_certificate_data(certtype, buffer, security.SecKeyGetTypeID()))


def _load_certificate_data(certtype, buffer, result_typeid):
    """
    Load a certificate with the supplied type and data.

    @param certtype: ignored
    @type certtype: -
    @param buffer: name of the KeyChain item to lookup
    @type buffer: L{str}
    @param result_typeid: The type to return (certificate or key)
    @type result_typeid: L{ffi.CFTypeID}

    @return: the certificate
    @rtype: L{X509}
    """

    # First try to get the identity from the KeyChain
    data = CFDataRef.fromString(buffer)
    results = ffi.new("CFArrayRef *")
    err = security.SecItemImport(data.ref(), ffi.NULL, ffi.NULL, ffi.NULL, 0, ffi.NULL, ffi.NULL, results)
    if err != 0:
        raise Error("Could not load certificate data")

    results = CFArrayRef(results[0]).toList()

    # Try to find a SecCertificateRef
    for result in results:
        if result.instanceTypeId() == result_typeid:
            return result
    else:
        raise Error("No certificate in data")


def _load_keychain_item(identifier):
    """
    Load a certificate with the supplied identity string.

    @param identifier: name of the KeyChain item to lookup
    @type identifier: L{str}

    @return: the certificate
    @rtype: L{X509}
    """

    # First try to get the identity from the KeyChain
    name = CFStringRef.fromString(identifier)
    certificate = security.SecCertificateCopyPreferred(name.ref(), ffi.NULL)
    if certificate == ffi.NULL:
        try:
            identity = load_keychain_identity(identifier)
        except Error:
            raise Error("Identity for preferred name '{}' was not found".format(identifier))
        certificate = ffi.new("SecCertificateRef *")
        err = security.SecIdentityCopyCertificate(identity.ref(), certificate)
        if err != 0:
            raise Error("Identity for preferred name '{}' was not found".format(identifier))
        certificate = certificate[0]
    certificate = CFObjectRef(certificate)

    return X509(certificate)


def check_keychain_identity(identity, allowInteraction=False):
    """
    Verify that the Keychain identity exists and that the private key is accessible.

    @param identity: identity value to match
    @type identity: L{str}

    @return: empty L{str} if OK, error message if not
    @rtype: L{str}
    """

    # Always turn off user interaction
    security.SecKeychainSetUserInteractionAllowed(allowInteraction)

    try:
        secidentity = load_keychain_identity(identity)
    except Error:
        return "Unable to load Keychain identity: {}".format(identity)
    pkey = ffi.new("SecKeyRef *")
    err = security.SecIdentityCopyPrivateKey(secidentity.ref(), pkey)
    if err != 0:
        return "Unable to load private key for Keychain identity: {}".format(identity)
    pkey = CFObjectRef(pkey[0])

    # Try to sign some data with the pkey to check we have access
    error = ffi.new("CFErrorRef *")
    signer = security.SecSignTransformCreate(pkey.ref(), error)
    if error[0] != ffi.NULL:
        cferror = CFErrorRef(error[0])
        return "Unable to use private key for Keychain identity: {} - {}".format(identity, cferror.description())
    signer = CFObjectRef(signer)

    signMe = CFDataRef.fromString("sign me")
    security.SecTransformSetAttribute(
        signer.ref(),
        security.kSecTransformInputAttributeName,
        signMe.ref(),
        error
    )
    if error[0] != ffi.NULL:
        cferror = CFErrorRef(error[0])
        return "Unable to use private key for Keychain identity: {} - {}".format(identity, cferror.description())

    signature = security.SecTransformExecute(signer.ref(), error)
    if error[0] != ffi.NULL or signature == ffi.NULL:
        cferror = CFErrorRef(error[0])
        return "Unable to use private key for Keychain identity: {} - {}".format(identity, cferror.description())
    signature = CFObjectRef(signature)

    return ""


def load_keychain_identity(identity):
    """
    Retrieve a SecIdentityRef from the KeyChain with a identity that exactly matches the passed in value.

    @param identity: identity value to match
    @type identity: L{str}

    @return: matched SecIdentityRef item or L{None}
    @rtype: L{CFObjectRef}
    """

    # First try to load this from an identity preference
    cfsubject = CFStringRef.fromString(identity)
    secidentity = security.SecIdentityCopyPreferred(cfsubject.ref(), ffi.NULL, ffi.NULL)
    if secidentity != ffi.NULL:
        return CFObjectRef(secidentity)

    # Now iterate items to find a match
    match = CFDictionaryRef.fromDict({
        CFStringRef.fromRef(security.kSecClass): CFStringRef.fromRef(security.kSecClassIdentity),
        CFStringRef.fromRef(security.kSecReturnRef): CFBooleanRef.fromBool(True),
        CFStringRef.fromRef(security.kSecReturnAttributes): CFBooleanRef.fromBool(True),
        CFStringRef.fromRef(security.kSecMatchLimit): CFStringRef.fromRef(security.kSecMatchLimitAll),
    })
    result = ffi.new("CFTypeRef *")
    err = security.SecItemCopyMatching(
        match.ref(),
        result
    )
    if err != 0:
        return None

    result = CFArrayRef(result[0])
    for item in result.toList():
        if item[str(CFStringRef.fromRef(security.kSecAttrLabel))] == identity:
            secidentity = item[str(CFStringRef.fromRef(security.kSecValueRef))]
            break
    else:
        raise Error("Could not find Keychain identity: {}".format(identity))

    return secidentity
