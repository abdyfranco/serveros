##
# Copyright (c) 2015-2017 Apple Inc. All rights reserved.
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
#include <CoreFoundation/CoreFoundation.h>
"""

EXTRA_LINKS = []

TYPES = """
typedef bool Boolean;
typedef signed long OSStatus;
typedef unsigned char UInt8;
typedef uint32_t UInt32;

typedef signed long CFIndex;
typedef UInt32 CFOptionFlags;
struct CFRange { CFIndex location; CFIndex length; };
typedef struct CFRange CFRange;
typedef UInt32 CFStringEncoding;
typedef enum {
    kCFStringEncodingUTF8 = 0x08000100, /* kTextEncodingUnicodeDefault + kUnicodeUTF8Format */
};

typedef unsigned long CFTypeID;
typedef const void * CFTypeRef;
typedef const struct __CFAllocator *CFAllocatorRef;
typedef const struct __CFBoolean *CFBooleanRef;
typedef const struct __CFString *CFStringRef;
typedef const struct __CFData *CFDataRef;
typedef const struct __CFArray *CFArrayRef;
typedef const struct __CFDictionary *CFDictionaryRef;
typedef struct __CFError * CFErrorRef;

typedef struct {
    ...;
} CFArrayCallBacks;

typedef struct {
    ...;
} CFDictionaryKeyCallBacks;
typedef struct {
    ...;
} CFDictionaryValueCallBacks;
"""

CONSTANTS = """
const CFBooleanRef kCFBooleanTrue;
const CFBooleanRef kCFBooleanFalse;

const CFArrayCallBacks kCFTypeArrayCallBacks;

const CFDictionaryKeyCallBacks kCFTypeDictionaryKeyCallBacks;
const CFDictionaryValueCallBacks kCFTypeDictionaryValueCallBacks;
"""

FUNCTIONS = """
CFTypeRef CFRetain ( CFTypeRef cf );
void CFRelease ( CFTypeRef cf );
CFIndex CFGetRetainCount ( CFTypeRef cf );
CFTypeID CFGetTypeID ( CFTypeRef cf );

CFStringRef CFCopyDescription ( CFTypeRef cf );

CFTypeID CFErrorGetTypeID ( void );
CFIndex CFErrorGetCode ( CFErrorRef err );
CFStringRef CFErrorCopyDescription ( CFErrorRef err );

CFTypeID CFBooleanGetTypeID ( void );
Boolean CFBooleanGetValue( CFBooleanRef );

CFTypeID CFStringGetTypeID ( void );
CFStringRef CFStringCreateCopy ( CFAllocatorRef alloc, CFStringRef theString );
CFStringRef CFStringCreateWithCString ( CFAllocatorRef alloc, const char *cStr, CFStringEncoding encoding );
CFIndex CFStringGetBytes ( CFStringRef theString, CFRange range, CFStringEncoding encoding, UInt8 lossByte, Boolean isExternalRepresentation, UInt8 *buffer, CFIndex maxBufLen, CFIndex *usedBufLen );
Boolean CFStringGetCString ( CFStringRef theString, char *buffer, CFIndex bufferSize, CFStringEncoding encoding );
const char * CFStringGetCStringPtr ( CFStringRef theString, CFStringEncoding encoding );
CFIndex CFStringGetLength ( CFStringRef theString );

CFTypeID CFDataGetTypeID ( void );
CFDataRef CFDataCreate ( CFAllocatorRef allocator, const UInt8 *bytes, CFIndex length );
void CFDataGetBytes ( CFDataRef theData, CFRange range, UInt8 *buffer );
CFIndex CFDataGetLength ( CFDataRef theData );

CFTypeID CFArrayGetTypeID ( void );
CFArrayRef CFArrayCreate ( CFAllocatorRef allocator, const void **values, CFIndex numValues, const CFArrayCallBacks *callBacks );
CFIndex CFArrayGetCount ( CFArrayRef theArray );
const void * CFArrayGetValueAtIndex ( CFArrayRef theArray, CFIndex idx );
void CFArrayGetValues ( CFArrayRef theArray, CFRange range, const void **values );

CFTypeID CFDictionaryGetTypeID ( void );
CFDictionaryRef CFDictionaryCreate ( CFAllocatorRef allocator, const void **keys, const void **values, CFIndex numValues, const CFDictionaryKeyCallBacks *keyCallBacks, const CFDictionaryValueCallBacks *valueCallBacks );
CFIndex CFDictionaryGetCount ( CFDictionaryRef theDict );
void CFDictionaryGetKeysAndValues ( CFDictionaryRef theDict, const void **keys, const void **values );
"""
