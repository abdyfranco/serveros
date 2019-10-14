##
# Copyright (c) 2016 Apple Inc. All rights reserved.
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

// CMSDecoder.h
typedef struct _CMSDecoder *CMSDecoderRef;

typedef enum
{
    kCMSSignerUnsigned = 0,                /* message was not signed */
    kCMSSignerValid,                       /* message was signed and signature verify OK */
    kCMSSignerNeedsDetachedContent,        /* message was signed but needs detached content
                                            *   to verify */
    kCMSSignerInvalidSignature,            /* message was signed but had a signature error */
    kCMSSignerInvalidCert,                 /* message was signed but an error occurred in verifying
                                            *   the signer's certificate */
    kCMSSignerInvalidIndex                 /* specified signer index out of range */
} CMSSignerStatus;

// CMSEncoder.h
typedef struct _CMSEncoder *CMSEncoderRef;

typedef enum {
    kCMSAttrNone                        = 0x0000,
    /*
     * S/MIME Capabilities - identifies supported signature, encryption, and
     * digest algorithms.
     */
    kCMSAttrSmimeCapabilities            = 0x0001,
    /*
     * Indicates that a cert is the preferred cert for S/MIME encryption.
     */
    kCMSAttrSmimeEncryptionKeyPrefs        = 0x0002,
    /*
     * Same as kCMSSmimeEncryptionKeyPrefs, using an attribute OID preferred
     * by Microsoft.
     */
    kCMSAttrSmimeMSEncryptionKeyPrefs    = 0x0004,
    /*
     * Include the signing time.
     */
    kCMSAttrSigningTime                    = 0x0008
} CMSSignedAttributes;

typedef enum {
    kCMSCertificateNone = 0,        /* don't include any certificates */
    kCMSCertificateSignerOnly,        /* only include signer certificate(s) */
    kCMSCertificateChain,            /* signer certificate chain up to but not
                                     *   including root certiticate */
    kCMSCertificateChainWithRoot    /* signer certificate chain including root */
} CMSCertificateChainMode;
"""

CONSTANTS = """
// CMSEncoder.h
extern const CFStringRef kCMSEncoderDigestAlgorithmSHA1;
extern const CFStringRef kCMSEncoderDigestAlgorithmSHA256;
"""

FUNCTIONS = """

// CMSDecoder.h
CFTypeID CMSDecoderGetTypeID(void);

OSStatus CMSDecoderCreate(CMSDecoderRef *cmsDecoderOut);
OSStatus CMSDecoderUpdateMessage(
    CMSDecoderRef        cmsDecoder,
    const void            *msgBytes,
    size_t                msgBytesLen);
OSStatus CMSDecoderFinalizeMessage(
    CMSDecoderRef        cmsDecoder);

OSStatus CMSDecoderGetNumSigners(
    CMSDecoderRef        cmsDecoder,
    size_t                *numSignersOut);
OSStatus CMSDecoderCopySignerStatus(
    CMSDecoderRef               cmsDecoder,
    size_t                      signerIndex,
    CFTypeRef                   policyOrArray,
    Boolean                     evaluateSecTrust,
    CMSSignerStatus *signerStatusOut,
    SecTrustRef *secTrustOut,
    OSStatus *certVerifyResultCodeOut);
OSStatus CMSDecoderCopySignerCert(
    CMSDecoderRef        cmsDecoder,
    size_t                signerIndex,
    SecCertificateRef *signerCertOut);

OSStatus CMSDecoderIsContentEncrypted(
    CMSDecoderRef        cmsDecoder,
    Boolean                *isEncryptedOut);
OSStatus CMSDecoderCopyEncapsulatedContentType(
    CMSDecoderRef        cmsDecoder,
    CFDataRef *eContentTypeOut);
OSStatus CMSDecoderCopyContent(
    CMSDecoderRef        cmsDecoder,
    CFDataRef *contentOut);

// CMSEncoder.h
CFTypeID CMSEncoderGetTypeID(void);

OSStatus CMSEncoderCreate(CMSEncoderRef * cmsEncoderOut);
OSStatus CMSEncoderSetSignerAlgorithm(
    CMSEncoderRef        cmsEncoder,
    CFStringRef        digestAlgorithm);
OSStatus CMSEncoderAddSigners(
    CMSEncoderRef        cmsEncoder,
    CFTypeRef            signerOrArray);
OSStatus CMSEncoderAddRecipients(
    CMSEncoderRef        cmsEncoder,
    CFTypeRef            recipientOrArray);
OSStatus CMSEncoderSetEncapsulatedContentTypeOID(
    CMSEncoderRef        cmsEncoder,
    CFTypeRef            eContentTypeOID);

OSStatus CMSEncoderAddSignedAttributes(
    CMSEncoderRef        cmsEncoder,
    CMSSignedAttributes    signedAttributes);
OSStatus CMSEncoderSetCertificateChainMode(
    CMSEncoderRef            cmsEncoder,
    CMSCertificateChainMode    chainMode);

OSStatus CMSEncoderUpdateContent(
    CMSEncoderRef        cmsEncoder,
    const void            *content,
    size_t                contentLen);

OSStatus CMSEncoderCopyEncodedContent(
    CMSEncoderRef        cmsEncoder,
    CFDataRef *encodedContentOut);

OSStatus CMSEncodeContent(
    CFTypeRef    signers,
    CFTypeRef    recipients,
    CFTypeRef    eContentTypeOID,
    Boolean                 detachedContent,
    CMSSignedAttributes     signedAttributes,
    const void              *content,
    size_t                  contentLen,
    CFDataRef *encodedContentOut);

"""
