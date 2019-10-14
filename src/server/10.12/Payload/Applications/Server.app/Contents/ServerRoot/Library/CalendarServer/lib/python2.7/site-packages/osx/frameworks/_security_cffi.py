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


INCLUDES = """
#include <Security/Security.h>
"""

EXTRA_LINKS = []

TYPES = """

// SecBase.h
typedef struct OpaqueSecKeyRef *SecKeyRef;
typedef struct OpaqueSecCertificateRef *SecCertificateRef;
typedef struct OpaqueSecIdentityRef *SecIdentityRef;
typedef struct OpaqueSecKeychainRef *SecKeychainRef;
typedef struct OpaqueSecPolicyRef *SecPolicyRef;

// SecImportExport.h
typedef enum
{
    kSecFormatUnknown = 0,
    kSecFormatOpenSSL,
    kSecFormatSSH,
    kSecFormatBSAFE,
    kSecFormatRawKey,
    kSecFormatWrappedPKCS8,
    kSecFormatWrappedOpenSSL,
    kSecFormatWrappedSSH,
    kSecFormatWrappedLSH,
    kSecFormatX509Cert,
    kSecFormatPEMSequence,
    kSecFormatPKCS7,
    kSecFormatPKCS12,
    kSecFormatNetscapeCertSequence,
    kSecFormatSSHv2
} SecExternalFormat;

typedef enum {
    kSecItemTypeUnknown,
    kSecItemTypePrivateKey,
    kSecItemTypePublicKey,
    kSecItemTypeSessionKey,
    kSecItemTypeCertificate,
    kSecItemTypeAggregate
} SecExternalItemType;

typedef enum SecItemImportExportFlags
{
    kSecItemPemArmour            = 0x00000001,
} SecItemImportExportFlags;

struct _SecItemImportExportKeyParameters;
typedef struct _SecItemImportExportKeyParameters SecItemImportExportKeyParameters;

// SecTransform.h
typedef CFTypeRef SecTransformRef;

// SecureTransport.h
typedef enum
{
    kSSLServerSide,
    kSSLClientSide
} SSLProtocolSide;

typedef enum
{
    kSSLStreamType,
    kSSLDatagramType
} SSLConnectionType;

typedef enum {
    kSSLProtocolUnknown = 0,
    kSSLProtocol3       = 2,
    kTLSProtocol1       = 4,
    kTLSProtocol11      = 7,
    kTLSProtocol12      = 8,
    kDTLSProtocol1      = 9,
    kSSLProtocol2       = 1,
    kSSLProtocol3Only   = 3,
    kTLSProtocol1Only   = 5,
    kSSLProtocolAll     = 6,

} SSLProtocol;

struct SSLContext;
typedef struct SSLContext *SSLContextRef;
typedef const void *SSLConnectionRef;

typedef OSStatus (*SSLReadFunc) ( SSLConnectionRef connection, void *data, size_t *dataLength );
typedef OSStatus (*SSLWriteFunc) ( SSLConnectionRef connection, const void *data, size_t *dataLength );

// SecTrust.h
typedef struct __SecTrust *SecTrustRef;
"""

CONSTANTS = """

// SecCertificateOIDs.h
const CFStringRef kSecOIDAuthorityInfoAccess;
const CFStringRef kSecOIDAuthorityKeyIdentifier;
const CFStringRef kSecOIDBasicConstraints;
const CFStringRef kSecOIDBiometricInfo;
const CFStringRef kSecOIDCSSMKeyStruct;
const CFStringRef kSecOIDCertIssuer;
const CFStringRef kSecOIDCertificatePolicies;
const CFStringRef kSecOIDClientAuth;
const CFStringRef kSecOIDCollectiveStateProvinceName;
const CFStringRef kSecOIDCollectiveStreetAddress;
const CFStringRef kSecOIDCommonName;
const CFStringRef kSecOIDCountryName;
const CFStringRef kSecOIDCrlDistributionPoints;
const CFStringRef kSecOIDCrlNumber;
const CFStringRef kSecOIDCrlReason;
const CFStringRef kSecOIDDeltaCrlIndicator;
const CFStringRef kSecOIDDescription;
const CFStringRef kSecOIDEmailAddress;
const CFStringRef kSecOIDEmailProtection;
const CFStringRef kSecOIDExtendedKeyUsage;
const CFStringRef kSecOIDExtendedKeyUsageAny;
const CFStringRef kSecOIDExtendedUseCodeSigning;
const CFStringRef kSecOIDGivenName;
const CFStringRef kSecOIDHoldInstructionCode;
const CFStringRef kSecOIDInvalidityDate;
const CFStringRef kSecOIDIssuerAltName;
const CFStringRef kSecOIDIssuingDistributionPoint;
const CFStringRef kSecOIDIssuingDistributionPoints;
const CFStringRef kSecOIDKeyUsage;
const CFStringRef kSecOIDLocalityName;
const CFStringRef kSecOIDMS_NTPrincipalName;
const CFStringRef kSecOIDMicrosoftSGC;
const CFStringRef kSecOIDNameConstraints;
const CFStringRef kSecOIDNetscapeCertSequence;
const CFStringRef kSecOIDNetscapeCertType;
const CFStringRef kSecOIDNetscapeSGC;
const CFStringRef kSecOIDOCSPSigning;
const CFStringRef kSecOIDOrganizationName;
const CFStringRef kSecOIDOrganizationalUnitName;
const CFStringRef kSecOIDPolicyConstraints;
const CFStringRef kSecOIDPolicyMappings;
const CFStringRef kSecOIDPrivateKeyUsagePeriod;
const CFStringRef kSecOIDQC_Statements;
const CFStringRef kSecOIDSerialNumber;
const CFStringRef kSecOIDServerAuth;
const CFStringRef kSecOIDStateProvinceName;
const CFStringRef kSecOIDStreetAddress;
const CFStringRef kSecOIDSubjectAltName;
const CFStringRef kSecOIDSubjectDirectoryAttributes;
const CFStringRef kSecOIDSubjectEmailAddress;
const CFStringRef kSecOIDSubjectInfoAccess;
const CFStringRef kSecOIDSubjectKeyIdentifier;
const CFStringRef kSecOIDSubjectPicture;
const CFStringRef kSecOIDSubjectSignatureBitmap;
const CFStringRef kSecOIDSurname;
const CFStringRef kSecOIDTimeStamping;
const CFStringRef kSecOIDTitle;
const CFStringRef kSecOIDUseExemptions;
const CFStringRef kSecOIDX509V1CertificateIssuerUniqueId;
const CFStringRef kSecOIDX509V1CertificateSubjectUniqueId;
const CFStringRef kSecOIDX509V1IssuerName;
const CFStringRef kSecOIDX509V1IssuerNameCStruct;
const CFStringRef kSecOIDX509V1IssuerNameLDAP;
const CFStringRef kSecOIDX509V1IssuerNameStd;
const CFStringRef kSecOIDX509V1SerialNumber;
const CFStringRef kSecOIDX509V1Signature;
const CFStringRef kSecOIDX509V1SignatureAlgorithm;
const CFStringRef kSecOIDX509V1SignatureAlgorithmParameters;
const CFStringRef kSecOIDX509V1SignatureAlgorithmTBS;
const CFStringRef kSecOIDX509V1SignatureCStruct;
const CFStringRef kSecOIDX509V1SignatureStruct;
const CFStringRef kSecOIDX509V1SubjectName;
const CFStringRef kSecOIDX509V1SubjectNameCStruct;
const CFStringRef kSecOIDX509V1SubjectNameLDAP;
const CFStringRef kSecOIDX509V1SubjectNameStd;
const CFStringRef kSecOIDX509V1SubjectPublicKey;
const CFStringRef kSecOIDX509V1SubjectPublicKeyAlgorithm;
const CFStringRef kSecOIDX509V1SubjectPublicKeyAlgorithmParameters;
const CFStringRef kSecOIDX509V1SubjectPublicKeyCStruct;
const CFStringRef kSecOIDX509V1ValidityNotAfter;
const CFStringRef kSecOIDX509V1ValidityNotBefore;
const CFStringRef kSecOIDX509V1Version;
const CFStringRef kSecOIDX509V3Certificate;
const CFStringRef kSecOIDX509V3CertificateCStruct;
const CFStringRef kSecOIDX509V3CertificateExtensionCStruct;
const CFStringRef kSecOIDX509V3CertificateExtensionCritical;
const CFStringRef kSecOIDX509V3CertificateExtensionId;
const CFStringRef kSecOIDX509V3CertificateExtensionStruct;
const CFStringRef kSecOIDX509V3CertificateExtensionType;
const CFStringRef kSecOIDX509V3CertificateExtensionValue;
const CFStringRef kSecOIDX509V3CertificateExtensionsCStruct;
const CFStringRef kSecOIDX509V3CertificateExtensionsStruct;
const CFStringRef kSecOIDX509V3CertificateNumberOfExtensions;
const CFStringRef kSecOIDX509V3SignedCertificate;
const CFStringRef kSecOIDX509V3SignedCertificateCStruct;
const CFStringRef kSecOIDSRVName;

// SecCertificate.h
const CFStringRef kSecPropertyKeyType;
const CFStringRef kSecPropertyKeyLabel;
const CFStringRef kSecPropertyKeyLocalizedLabel;
const CFStringRef kSecPropertyKeyValue;

CFStringRef kSecPropertyTypeWarning;
CFStringRef kSecPropertyTypeSuccess;
CFStringRef kSecPropertyTypeSection;
CFStringRef kSecPropertyTypeData;
CFStringRef kSecPropertyTypeString;
CFStringRef kSecPropertyTypeURL;
CFStringRef kSecPropertyTypeDate;
CFTypeRef kSecPropertyTypeTitle;
CFTypeRef kSecPropertyTypeError;

const CFStringRef kSecClass;

const CFStringRef kSecClassInternetPassword;
const CFStringRef kSecClassGenericPassword;
const CFStringRef kSecClassCertificate;
const CFStringRef kSecClassKey;
const CFStringRef kSecClassIdentity;

const CFStringRef kSecMatchPolicy;
const CFStringRef kSecMatchItemList;
const CFStringRef kSecMatchSearchList;
const CFStringRef kSecMatchIssuers;
const CFStringRef kSecMatchEmailAddressIfPresent;
const CFStringRef kSecMatchSubjectContains;
const CFStringRef kSecMatchSubjectStartsWith;
const CFStringRef kSecMatchSubjectEndsWith;
const CFStringRef kSecMatchSubjectWholeString;
const CFStringRef kSecMatchCaseInsensitive;
const CFStringRef kSecMatchDiacriticInsensitive;
const CFStringRef kSecMatchWidthInsensitive;
const CFStringRef kSecMatchTrustedOnly;
const CFStringRef kSecMatchValidOnDate;
const CFStringRef kSecMatchLimit;
const CFStringRef kSecMatchLimitOne;
const CFStringRef kSecMatchLimitAll;

const CFStringRef kSecReturnData;
const CFStringRef kSecReturnAttributes;
const CFStringRef kSecReturnRef;
const CFStringRef kSecReturnPersistentRef;

const CFStringRef kSecAttrAccessible;
const CFStringRef kSecAttrAccess;
const CFStringRef kSecAttrAccessControl;
const CFStringRef kSecAttrAccessGroup;
const CFStringRef kSecAttrSynchronizable;
const CFStringRef kSecAttrSynchronizableAny;
const CFStringRef kSecAttrCreationDate;
const CFStringRef kSecAttrModificationDate;
const CFStringRef kSecAttrDescription;
const CFStringRef kSecAttrComment;
const CFStringRef kSecAttrCreator;
const CFStringRef kSecAttrType;
const CFStringRef kSecAttrLabel;
const CFStringRef kSecAttrIsInvisible;
const CFStringRef kSecAttrIsNegative;
const CFStringRef kSecAttrAccount;
const CFStringRef kSecAttrService;
const CFStringRef kSecAttrGeneric;
const CFStringRef kSecAttrSecurityDomain;
const CFStringRef kSecAttrServer;
const CFStringRef kSecAttrProtocol;
const CFStringRef kSecAttrAuthenticationType;
const CFStringRef kSecAttrPort;
const CFStringRef kSecAttrPath;
const CFStringRef kSecAttrSubject;
const CFStringRef kSecAttrIssuer;
const CFStringRef kSecAttrSerialNumber;
const CFStringRef kSecAttrSubjectKeyID;
const CFStringRef kSecAttrPublicKeyHash;
const CFStringRef kSecAttrCertificateType;
const CFStringRef kSecAttrCertificateEncoding;
const CFStringRef kSecAttrKeyClass;
const CFStringRef kSecAttrApplicationLabel;
const CFStringRef kSecAttrIsPermanent;
const CFStringRef kSecAttrIsSensitive;
const CFStringRef kSecAttrIsExtractable;
const CFStringRef kSecAttrApplicationTag;
const CFStringRef kSecAttrKeyType;
const CFStringRef kSecAttrPRF;
const CFStringRef kSecAttrSalt;
const CFStringRef kSecAttrRounds;
const CFStringRef kSecAttrKeySizeInBits;
const CFStringRef kSecAttrEffectiveKeySize;
const CFStringRef kSecAttrCanEncrypt;
const CFStringRef kSecAttrCanDecrypt;
const CFStringRef kSecAttrCanDerive;
const CFStringRef kSecAttrCanSign;
const CFStringRef kSecAttrCanVerify;
const CFStringRef kSecAttrCanWrap;
const CFStringRef kSecAttrCanUnwrap;

const CFStringRef kSecValueData;
const CFStringRef kSecValueRef;
const CFStringRef kSecValuePersistentRef;

// SecTransform.h
const CFStringRef kSecTransformInputAttributeName;
const CFStringRef kSecTransformOutputAttributeName;
const CFStringRef kSecTransformDebugAttributeName;
const CFStringRef kSecTransformTransformName;
const CFStringRef kSecTransformAbortAttributeName;

// SecureTransport.h
enum {
    errSSLProtocol                = -9800,
    errSSLNegotiation            = -9801,
    errSSLFatalAlert            = -9802,
    errSSLWouldBlock            = -9803,
    errSSLSessionNotFound         = -9804,
    errSSLClosedGraceful         = -9805,
    errSSLClosedAbort             = -9806,
    errSSLXCertChainInvalid     = -9807,
    errSSLBadCert                = -9808,
    errSSLCrypto                = -9809,
    errSSLInternal                = -9810,
    errSSLModuleAttach            = -9811,
    errSSLUnknownRootCert        = -9812,
    errSSLNoRootCert            = -9813,
    errSSLCertExpired            = -9814,
    errSSLCertNotYetValid        = -9815,
    errSSLClosedNoNotify        = -9816,
    errSSLBufferOverflow        = -9817,
    errSSLBadCipherSuite        = -9818,

    errSSLPeerUnexpectedMsg        = -9819,
    errSSLPeerBadRecordMac        = -9820,
    errSSLPeerDecryptionFail    = -9821,
    errSSLPeerRecordOverflow    = -9822,
    errSSLPeerDecompressFail    = -9823,
    errSSLPeerHandshakeFail        = -9824,
    errSSLPeerBadCert            = -9825,
    errSSLPeerUnsupportedCert    = -9826,
    errSSLPeerCertRevoked        = -9827,
    errSSLPeerCertExpired        = -9828,
    errSSLPeerCertUnknown        = -9829,
    errSSLIllegalParam            = -9830,
    errSSLPeerUnknownCA         = -9831,
    errSSLPeerAccessDenied        = -9832,
    errSSLPeerDecodeError        = -9833,
    errSSLPeerDecryptError        = -9834,
    errSSLPeerExportRestriction    = -9835,
    errSSLPeerProtocolVersion    = -9836,
    errSSLPeerInsufficientSecurity = -9837,
    errSSLPeerInternalError        = -9838,
    errSSLPeerUserCancelled        = -9839,
    errSSLPeerNoRenegotiation    = -9840,

    errSSLPeerAuthCompleted     = -9841,
    errSSLClientCertRequested    = -9842,

    errSSLHostNameMismatch        = -9843,
    errSSLConnectionRefused        = -9844,
    errSSLDecryptionFail        = -9845,
    errSSLBadRecordMac            = -9846,
    errSSLRecordOverflow        = -9847,
    errSSLBadConfiguration        = -9848,
    errSSLUnexpectedRecord      = -9849,
    // errSSLWeakPeerEphemeralDHKey = -9850, - not in 10.10.sdk

    // errSSLClientHelloReceived   = -9851, - not in 10.10.sdk
};
"""

FUNCTIONS = """

// SecCertificate.h
CFTypeID SecCertificateGetTypeID(void);
SecCertificateRef SecCertificateCopyPreferred(CFStringRef name, CFArrayRef keyUsage);
CFDictionaryRef SecCertificateCopyValues(SecCertificateRef certificate, CFArrayRef keys, CFErrorRef *error);

// SecIdentity.h
OSStatus SecIdentityCopyCertificate ( SecIdentityRef identityRef, SecCertificateRef *certificateRef );
OSStatus SecIdentityCopyPrivateKey ( SecIdentityRef identityRef, SecKeyRef *privateKeyRef );
SecIdentityRef SecIdentityCopyPreferred ( CFStringRef name, CFArrayRef keyUsage, CFArrayRef validIssuers );

// SecImportExport.h
OSStatus SecItemImport(
    CFDataRef                            importedData,
    CFStringRef                fileNameOrExtension,
    SecExternalFormat *      inputFormat,
    SecExternalItemType    *    itemType,
    SecItemImportExportFlags            flags,
    const SecItemImportExportKeyParameters * keyParams,
    SecKeychainRef            importKeychain,
    CFArrayRef * outItems);

// SecItem.h
OSStatus SecItemCopyMatching ( CFDictionaryRef query, CFTypeRef *result );

// SecKey.h
CFTypeID SecKeyGetTypeID(void);

// SecKeychain.h
OSStatus SecKeychainCopyDefault ( SecKeychainRef *keychain );
OSStatus SecKeychainSetUserInteractionAllowed ( Boolean state );

// SecPolicy.h
SecPolicyRef SecPolicyCreateBasicX509(void);
SecPolicyRef SecPolicyCreateSSL(Boolean server, CFStringRef hostname);


// SecTransform.h
SecTransformRef SecSignTransformCreate( SecKeyRef key, CFErrorRef *error ) ;
Boolean SecTransformSetAttribute(SecTransformRef transformRef,
                                CFStringRef key,
                                CFTypeRef value,
                                CFErrorRef *error);
CFTypeRef SecTransformExecute(SecTransformRef transformRef, CFErrorRef* errorRef);


// SecureTransport.h
SSLContextRef
SSLCreateContext(CFAllocatorRef alloc, SSLProtocolSide protocolSide, SSLConnectionType connectionType);

OSStatus
SSLSetProtocolVersionMin  (SSLContextRef      context,
                           SSLProtocol        minVersion);
OSStatus
SSLSetProtocolVersionMax  (SSLContextRef      context,
                           SSLProtocol        maxVersion);

OSStatus SSLSetConnection (SSLContextRef context, SSLConnectionRef connection);
OSStatus SSLGetConnection (SSLContextRef context, SSLConnectionRef *connection);

OSStatus
SSLSetPeerDomainName        (SSLContextRef        context,
                             const char            *peerName,
                             size_t                peerNameLen);

OSStatus SSLSetCertificate ( SSLContextRef context, CFArrayRef certRefs );

OSStatus SSLSetIOFuncs ( SSLContextRef context, SSLReadFunc readFunc, SSLWriteFunc writeFunc );

OSStatus SSLHandshake ( SSLContextRef context );

OSStatus SSLWrite ( SSLContextRef context, const void *data, size_t dataLength, size_t *processed );
OSStatus SSLRead ( SSLContextRef context, void *data, size_t dataLength, size_t *processed );

OSStatus SSLClose ( SSLContextRef context );
"""
