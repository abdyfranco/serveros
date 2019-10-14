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
A set of Python classes that wrap miscellaneous CoreFoundation classes.
"""

from ._corefoundation import ffi, lib as cf
from .corefoundation import CFObjectRef, CFStringRef, CFArrayRef, CFDictionaryRef, CFErrorRef, CFError


class CFTimeZoneRef(CFObjectRef):
    """
    A wrapper for CFTimeZoneRef CoreFoundation objects.
    """

    @staticmethod
    def typeId():
        return cf.CFTimeZoneGetTypeID()


    @classmethod
    def defaultTimeZone(cls):
        cftzref = cf.CFTimeZoneCopyDefault()
        if cftzref == ffi.NULL:
            raise CFError("Unable to create a CFTimeZoneRef")
        return CFTimeZoneRef(cftzref)


    @classmethod
    def defaultTimeZoneName(cls):
        tz = cls.defaultTimeZone()
        return tz.name()


    def name(self):
        cfstr = CFStringRef(cf.CFTimeZoneGetName(self.ref()), owned=False)
        return cfstr.toString()



class CFLocaleRef(CFObjectRef):
    """
    A wrapper for CFLocaleRef CoreFoundation objects.
    """

    @staticmethod
    def typeId():
        return cf.CFLocaleGetTypeID()


    @classmethod
    def currentLocale(cls):
        localeref = cf.CFLocaleCopyCurrent()
        if localeref == ffi.NULL:
            raise CFError("Unable to create a CFLocaleRef")
        return CFLocaleRef(localeref)


    @classmethod
    def preferredLanguages(cls):
        items = cf.CFLocaleCopyPreferredLanguages()
        if items == ffi.NULL:
            raise CFError("Unable to get CFLocale preferred languages")
        items = CFArrayRef(items)
        return items.toList()



class CFPropertyListRef(CFObjectRef):
    """
    A wrapper for CFPropertyListRef CoreFoundation objects.
    """

    @staticmethod
    def typeId():
        # CFPropertyListRef is actually one of CFStringRef, CFArrayRef or CFDictionaryRef
        return None


    @classmethod
    def createFromData(cls, data):
        error = ffi.new("CFErrorRef *")
        plist = cf.CFPropertyListCreateWithData(ffi.NULL, data.ref(), cf.kCFPropertyListImmutable, ffi.NULL, error)
        if plist == ffi.NULL:
            error = CFErrorRef(error[0])
            raise CFError("Unable to create a CFPropertyListRef: {}".format(error.error()))

        # Map to actual data type
        plist = CFObjectRef(plist)
        typeid = plist.instanceTypeId()
        if typeid == CFStringRef.typeId():
            plist = CFStringRef(plist.ref(), owned=False)
        elif typeid == CFArrayRef.typeId():
            plist = CFArrayRef(plist.ref(), owned=False)
        elif typeid == CFDictionaryRef.typeId():
            plist = CFDictionaryRef(plist.ref(), owned=False)
        else:
            raise CFError("Unknown CFPropertyListRef type id: {}".format(typeid))

        return plist
