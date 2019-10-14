# -*- test-case-name: twext.who.test.test_util -*-
##
# Copyright (c) 2013-2017 Apple Inc. All rights reserved.
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
Directory service module utilities.
"""

__all__ = [
    "ConstantsContainer",
    "uniqueResult",
    "describe",
]

from inspect import getmembers, isclass, isfunction

from twisted.python.constants import (
    Names, Values, Flags, NamedConstant, ValueConstant, FlagConstant,
)

from .idirectory import DirectoryServiceError


class ConstantsContainer(object):
    """
    A container for constants.
    """

    def __init__(self, sources):
        self._constants = {}
        self._methods = {}

        for source in sources:
            if isclass(source):
                if issubclass(source, CONTAINER_CLASSES):
                    self._addConstants(source.iterconstants())
                    self._addMethods(getmembers(source, isfunction))
                else:
                    raise TypeError(
                        "Unknown constants type: {0}".format(source)
                    )

            elif isinstance(source, ConstantsContainer):
                self._addConstants(source.iterconstants())
                self._addMethods(source._methods.iteritems())

            elif isinstance(source, CONSTANT_CLASSES):
                self._addConstants((source,))

            else:
                self._addConstants(source)

    def _addConstants(self, constants):
        for constant in constants:
            if hasattr(self, "_constantsClass"):
                if constant.__class__ != self._constantsClass:
                    raise TypeError(
                        "Can't mix constants classes in the "
                        "same constants container: {0} != {1}"
                        .format(constant.__class__, self._constantsClass)
                    )
            else:
                self._constantsClass = constant.__class__

                if issubclass(self._constantsClass, ValueConstant):
                    self.lookupByValue = self._lookupByValue

            if (
                constant.name in self._constants and
                self._constants[constant.name] is not constant
            ):
                raise ValueError("Name conflict: {0}".format(constant.name))

            self._constants[constant.name] = constant

    def _addMethods(self, methods):
        for name, method in methods:
            if name[0] == "_":
                continue

            if (
                name in self._constants or
                (name in self._methods and self._methods[name] is not method)
            ):
                raise ValueError("Name conflict: {0}".format(name))

            self._methods[name] = method

    def __getattr__(self, name):
        attr = self._constants.get(name, None)
        if attr is not None:
            return attr

        attr = self._methods.get(name, None)
        if attr is not None:
            return attr

        raise AttributeError(name)

    def iterconstants(self):
        return self._constants.itervalues()

    def lookupByName(self, name):
        try:
            return self._constants[name]
        except KeyError:
            raise ValueError(name)

    def _lookupByValue(self, value):
        for constant in self.iterconstants():
            if constant.value == value:
                return constant
        raise ValueError(value)


def uniqueResult(values):
    result = None
    for value in values:
        if result is None:
            result = value
        else:
            raise DirectoryServiceError(
                "Multiple values found where one expected."
            )
    return result


def firstResult(values):
    for value in values:
        return value
    return None


def describe(constant):
    if isinstance(constant, FlagConstant):
        return "|".join(
            sorted(getattr(flag, "description", flag.name) for flag in constant)
        )

    if isinstance(constant, (NamedConstant, ValueConstant)):
        for attr in ("description", "name"):
            description = getattr(constant, attr, None)
            if description is not None:
                return description

    return unicode(constant)


CONTAINER_CLASSES = (Names, Values, Flags)
CONSTANT_CLASSES = (NamedConstant, ValueConstant, FlagConstant)
