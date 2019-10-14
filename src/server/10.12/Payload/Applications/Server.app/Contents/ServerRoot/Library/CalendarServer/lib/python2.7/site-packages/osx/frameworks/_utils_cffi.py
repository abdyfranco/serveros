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
#include <CoreFoundation/CoreFoundation.h>
"""

EXTRA_LINKS = []

TYPES = """
typedef const struct __CFTimeZone *CFTimeZoneRef;

typedef const struct __CFLocale *CFLocaleRef;

typedef CFTypeRef CFPropertyListRef;

typedef CFOptionFlags CFPropertyListMutabilityOptions;
enum {
    kCFPropertyListImmutable = 0,
    kCFPropertyListMutableContainers,
    kCFPropertyListMutableContainersAndLeaves
};

typedef CFIndex CFPropertyListFormat;
enum {
    kCFPropertyListOpenStepFormat = 1,
    kCFPropertyListXMLFormat_v1_0 = 100,
    kCFPropertyListBinaryFormat_v1_0 = 200
};
"""

CONSTANTS = """
"""

FUNCTIONS = """
// CFTimeZone
CFTypeID CFTimeZoneGetTypeID ( void );
CFTimeZoneRef CFTimeZoneCopyDefault ( void );
CFStringRef CFTimeZoneGetName ( CFTimeZoneRef tz );

// CFLocale
CFTypeID CFLocaleGetTypeID ( void );
CFLocaleRef CFLocaleCopyCurrent ( void );
CFArrayRef CFLocaleCopyPreferredLanguages ( void );

// CFPropertyList
CFPropertyListRef CFPropertyListCreateWithData ( CFAllocatorRef allocator, CFDataRef data, CFOptionFlags options, CFPropertyListFormat *format, CFErrorRef *error );
"""
