##
# Copyright (c) 2011-2016 Apple Inc. All rights reserved.
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
Utilities related to types.
"""

__all__ = [
    "MappingProxyType",
]



class MappingProxyType(object):
    """
    Read-only proxy of a mapping. It provides a dynamic view on the mapping's
    entries, which means that when the mapping changes, the view reflects these
    changes.

    Note that for an ummutable mapping, one would have to prevent modifications
    to the underlying mapping.  Note also that mutable values remain mutable
    when accessed via a proxy.

    Backport of Python 3's L{types.MappingProxyType
    <http://docs.python.org/dev/library/types.html#types.MappingProxyType>}.
    """

    def __init__(self, mapping):
        """
        @param mapping: A mapping to wrap.
        @type mapping: mapping
        """
        self._mapping = mapping


    def __len__(self):
        return len(self._mapping)


    def __getitem__(self, key):
        return self._mapping[key]


    def __iter__(self):
        return iter(self._mapping)


    def __reversed__(self):
        return reversed(self._mapping)


    def __contains__(self, key):
        return key in self._mapping


    def copy(self):
        return self._mapping.copy()


    def get(self, key, default=None):
        return self._mapping.get(key, default)


    def has_key(self, key):
        return key in self._mapping


    def items(self):
        return self._mapping.items()


    def iteritems(self):
        return self._mapping.iteritems()


    def iterkeys(self):
        return self._mapping.iterkeys()


    def itervalues(self):
        return self._mapping.itervalues()


    def keys(self):
        return self._mapping.keys()


    def values(self):
        return self._mapping.values()


    def viewitems(self):
        return self._mapping.viewitems()


    def viewkeys(self):
        return self._mapping.viewkeys()


    def viewvalues(self):
        return self._mapping.viewvalues()
