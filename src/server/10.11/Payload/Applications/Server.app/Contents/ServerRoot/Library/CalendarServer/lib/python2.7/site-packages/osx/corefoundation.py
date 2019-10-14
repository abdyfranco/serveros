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
A set of Python classes that wrap common CoreFoundation classes.
"""

from ._corefoundation import ffi, lib as cf


class CFError(Exception):
    """
    Generic CoreFoundation error occurred
    """



class CFObjectRef(object):
    """
    This is a wrapper for any CF objects returned from CFFI calls. For CF
    objects whose ownership is implicitly retained (CoreFoundation Create Rule),
    this class by default will CFRelease them. For an unowned object
    (CoreFoundation Get Rule), the L{owned} parameter must be set to False,
    which will cause the CF object to be explicitly CFRetain'd (and then
    automatically released).
    """

    def __init__(self, cfobj, owned=True):
        """
        Create a wrapper around the supplied cffi object that mirrors a CoreFoundation object.

        NB we have to cache the L{lib} and L{ffi} objects here to prevent them from being
        garbage collected before this object's __del__ is called.

        @param cfobj: the cffi object to wrap
        @type cfobj: L{ffi.CData}
        @param owned: whether the object is already retained
        @type owned: L{bool}
        """
        self.cf = cf
        self.ffi = ffi
        self.cfobj = cfobj if cfobj is not None else ffi.NULL
        if not owned and cfobj is not None:
            cf.CFRetain(self.cfobj)


    @classmethod
    def fromRef(cls, cfobj):
        return cls(cfobj, False)


    def __del__(self):
        """
        When this object is garbage collected, also release the CoreFoundation object, which we
        know is retained by us.
        """
        if self.cfobj != self.ffi.NULL:
            self.cf.CFRelease(self.cfobj)
        self.cfobj = None
        self.cf = None


    def ref(self):
        return self.cfobj


    def retainCount(self):
        return cf.CFGetRetainCount(self.ref())


    def instanceTypeId(self):
        return cf.CFGetTypeID(self.ref())


    def description(self):
        description = CFStringRef(cf.CFCopyDescription(self.ref()))
        return description.toString()


    def native(self):
        """
        Convert this object, if possible, into a native Python type. If it cannot be
        converted, just return it as is.
        """
        if self.instanceTypeId() == CFStringRef.typeId():
            item = CFStringRef(self.ref(), owned=False)
            result = item.native()
        elif self.instanceTypeId() == CFArrayRef.typeId():
            item = CFArrayRef(self.ref(), owned=False)
            result = item.native()
        elif self.instanceTypeId() == CFDictionaryRef.typeId():
            item = CFDictionaryRef(self.ref(), owned=False)
            result = item.native()
        else:
            result = self

        return result



class CFErrorRef(CFObjectRef):
    """
    A wrapper for CFErrorRef CoreFoundation objects.
    """

    @staticmethod
    def typeId():
        return cf.CFErrorGetTypeID()


    def code(self):
        """
        Return the error description.

        @return: error description
        @rtype: L{str}
        """
        code = cf.CFErrorGetCode(self.ref())
        return code


    def description(self):
        """
        Return the error description.

        @return: error description
        @rtype: L{str}
        """
        desc = CFStringRef(cf.CFErrorCopyDescription(self.ref()))
        return desc.toString()



class CFBooleanRef(CFObjectRef):
    """
    A wrapper for CFBooleanRef CoreFoundation objects.
    """

    @staticmethod
    def typeId():
        return cf.CFBooleanGetTypeID()


    @classmethod
    def fromBool(cls, value):
        return cls.fromRef(cf.kCFBooleanTrue if value else cf.kCFBooleanFalse)



class CFStringRef(CFObjectRef):
    """
    A wrapper for CFStringRef CoreFoundation objects.
    """

    @staticmethod
    def typeId():
        return cf.CFStringGetTypeID()


    @classmethod
    def fromString(cls, text):
        """
        Create a cffi/CFStringRef from a Python L{str} - assume UTF-8 encoding.

        @param text: utf-8 encoded string
        @type text: L{str}

        @return: the cffi data
        @rtype: L{ffi.CData}
        """
        if isinstance(text, unicode):
            text = text.encode("utf-8")
        cfstringref = cf.CFStringCreateWithCString(ffi.NULL, text, cf.kCFStringEncodingUTF8)
        if cfstringref == ffi.NULL:
            raise CFError("Unable to create a CFStringRef")
        return CFStringRef(cfstringref)


    def toString(self):
        return self.native()


    def __str__(self):
        return self.native()


    def native(self):
        """
        Convert the cffi/CFStringRef value to a utf-8 encoded Python string.

        @return: the string value
        @rtype: L{str}
        """
        # Try quick conversion first, then try longer one
        str = cf.CFStringGetCStringPtr(self.ref(), cf.kCFStringEncodingUTF8)
        if str == ffi.NULL:
            range = cf.CFStringGetLength(self.ref())
            actualSize = ffi.new("CFIndex *")
            cf.CFStringGetBytes(self.ref(), [0, range], cf.kCFStringEncodingUTF8, ord("?"), False, ffi.NULL, 0, actualSize)
            actualSize = actualSize[0]
            str = ffi.new("char []", actualSize + 1)
            cf.CFStringGetCString(self.ref(), str, actualSize + 1, cf.kCFStringEncodingUTF8)
        return ffi.string(str) if str else ""


    def copy(self):
        return CFStringRef(cf.CFStringCreateCopy(ffi.NULL, self.ref()))



class CFDataRef(CFObjectRef):
    """
    A wrapper for CFDataRef CoreFoundation objects.
    """

    @staticmethod
    def typeId():
        return cf.CFDataGetTypeID()


    @classmethod
    def fromString(cls, text):
        """
        Convert a L{str} to a cffi/CFDataRef.

        @param text: string to convert
        @type text: L{str}

        @return: the  value
        @rtype: L{CFDataRef}
        """
        cfdataref = cf.CFDataCreate(ffi.NULL, text, len(text))
        if cfdataref == ffi.NULL:
            raise CFError("Unable to create a CFDataRef")
        return CFDataRef(cfdataref)


    def toString(self):
        return self.native()


    def count(self):
        """
        The number of items in the wrapped CFArrayRef.

        @return: the count
        @rtype: L{int}
        """
        return cf.CFDataGetLength(self.ref())


    def native(self):
        """
        Convert the cffi/CFDataRef value to a Python string.

        @return: the string value
        @rtype: L{str}
        """
        count = self.count()
        value = ffi.new("UInt8 []", count)
        cf.CFDataGetBytes(self.ref(), [0, count], value)
        return bytes(ffi.buffer(value, count))



class CFArrayRef(CFObjectRef):
    """
    A wrapper for CFArrayRef CoreFoundation objects.
    """

    @staticmethod
    def typeId():
        return cf.CFArrayGetTypeID()


    @classmethod
    def fromList(cls, l):
        """
        Create a cffi/CFArrayRef from a Python L{list} of L{CFObjectRef}.

        @param l: list to convert
        @type l: L{list}

        @return: the cffi data
        @rtype: L{CFArrayRef}
        """
        lr = [item.ref() for item in l]
        cfarrayref = cf.CFArrayCreate(ffi.NULL, lr, len(l), ffi.addressof(cf.kCFTypeArrayCallBacks))
        if cfarrayref == ffi.NULL:
            raise CFError("Unable to create a CFArrayRef")
        return CFArrayRef(cfarrayref)


    def toList(self):
        return self.native()


    def count(self):
        """
        The number of items in the wrapped CFArrayRef.

        @return: the count
        @rtype: L{int}
        """
        return cf.CFArrayGetCount(self.ref())


    def valueAtIndex(self, index):
        """
        Return an item from the CFArrayRef, converted to native type.

        @param index: index of item to return
        @type index: L{int}

        @return: the cffi data
        @rtype: L{CFObjectRef}, L{str}, L{list} or L{dict}
        """
        result = cf.CFArrayGetValueAtIndex(self.ref(), index)
        if result != ffi.NULL:
            result = CFObjectRef(result, owned=False)
            return result.native()
        else:
            return None


    def native(self):
        """
        Convert a CFArrayRef into an L{list} of native items.

        @return: list of native items
        @rtype: L{list}
        """
        count = self.count()
        values = ffi.new("const void * []", count)
        cf.CFArrayGetValues(self.ref(), [0, count], values)
        items = [CFObjectRef(item, owned=False) for item in values]
        return [item.native() for item in items]



class CFDictionaryRef(CFObjectRef):
    """
    A wrapper for CFDictionaryRef CoreFoundation objects.
    """

    @staticmethod
    def typeId():
        return cf.CFDictionaryGetTypeID()


    @classmethod
    def fromDict(cls, d):
        """
        Create a cffi/CFDictionaryRef from a Python L{dict} of L{CFObjectRef}.

        @param d: dict to convert
        @type d: L{dict}

        @return: the cffi data
        @rtype: L{CFDictionaryRef}
        """
        keys = []
        values = []
        for k, v in d.items():
            keys.append(k.ref())
            values.append(v.ref())
        cfdictref = cf.CFDictionaryCreate(
            ffi.NULL, keys, values, len(keys),
            ffi.addressof(cf.kCFTypeDictionaryKeyCallBacks),
            ffi.addressof(cf.kCFTypeDictionaryValueCallBacks),
        )
        if cfdictref == ffi.NULL:
            raise CFError("Unable to create a CFDictionaryRef")
        return CFDictionaryRef(cfdictref)


    def toDict(self):
        return self.native()


    def count(self):
        """
        The number of items in the wrapped CFDictionaryRef.

        @return: the count
        @rtype: L{int}
        """
        return cf.CFDictionaryGetCount(self.ref())


    def native(self):
        """
        Convert the cffi/CFDictionaryRef value to a Python L{dict}. The keys and values
        are all converted to their native values.

        @return: the result
        @rtype: L{dict}
        """
        count = self.count()
        keys = ffi.new("const void * []", count)
        values = ffi.new("const void * []", count)
        cf.CFDictionaryGetKeysAndValues(self.ref(), keys, values)

        result = {}
        for key, value in zip(keys, values):
            k = CFStringRef(key, owned=False)
            v = CFObjectRef(value, owned=False)
            result[k.native()] = v.native()
        return result
