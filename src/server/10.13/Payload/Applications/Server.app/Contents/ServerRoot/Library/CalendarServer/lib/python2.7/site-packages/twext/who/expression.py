# -*- test-case-name: twext.who.test.test_expression -*-
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
Directory query expressions.
"""

__all__ = [
    "Operand",
    "BooleanExpression",
    "CompoundExpression",
    "ExistsExpression",
    "MatchType",
    "MatchFlags",
    "MatchExpression",
]

from twisted.python.constants import (
    Names, NamedConstant, Flags, FlagConstant,
)

from .idirectory import FieldName
from .util import describe


#
# Compound expression
#

class Operand(Names):
    """
    Contants for common operands.
    """
    OR = NamedConstant()
    AND = NamedConstant()

    OR.description = u"or"
    AND.description = u"and"


class CompoundExpression(object):
    """
    An expression that groups multiple expressions with an operand.

    @ivar expressions: An iterable of expressions.

    @ivar operand: A L{NamedConstant} specifying an operand.
    """

    def __init__(self, expressions, operand):
        self.expressions = tuple(expressions)
        self.operand = operand

    def __repr__(self):
        return (
            "<{self.__class__.__name__}: "
            "{self.expressions!r} {self.operand!r}>"
            .format(self=self)
        )

    def __eq__(self, other):
        if isinstance(other, CompoundExpression):
            return (
                (self.operand is other.operand) and
                (self.expressions == other.expressions)
            )
        else:
            return NotImplemented


#
# Match expression
#

class MatchType(Names):
    """
    Query match types.
    """
    equals = NamedConstant()
    equals.description = u"equals"

    startsWith = NamedConstant()
    startsWith.description = u"starts with"

    endsWith = NamedConstant()
    endsWith.description = u"ends with"

    contains = NamedConstant()
    contains.description = u"contains"

    lessThan = NamedConstant()
    lessThan.description = u"less than"

    greaterThan = NamedConstant()
    greaterThan.description = u"greater than"

    lessThanOrEqualTo = NamedConstant()
    lessThanOrEqualTo.description = u"less than or equal to"

    greaterThanOrEqualTo = NamedConstant()
    greaterThanOrEqualTo.description = u"greater than or equal to"


class MatchFlags(Flags):
    """
    Match expression flags.
    """
    NOT = FlagConstant()
    NOT.description = u"not"

    caseInsensitive = FlagConstant()
    caseInsensitive.description = u"case insensitive"

    none = None

    @staticmethod
    def _setMatchFunctions(flags):
        """
        Compute a predicate and normalize functions for the given match
        expression flags.

        @param flags: Match expression flags.
        @type flags: L{MatchFlags}

        @return: Predicate and normalize functions.
        @rtype: L{tuple} of callables.
        """
        predicate = lambda x: x
        normalize = lambda x: x

        def caseInsensitivify(x):
            # Case insensitive only makes sense conceptually for text
            # Note we are intentionally not treating bytes as text
            if isinstance(x, unicode):
                return x.lower()
            else:
                return x

        if flags is None:
            flags = FlagConstant()
        else:
            for flag in flags:
                if flag == MatchFlags.NOT:
                    predicate = lambda x: not x
                elif flag == MatchFlags.caseInsensitive:
                    normalize = caseInsensitivify
                else:
                    raise NotImplementedError(
                        "Unknown query flag: {0}".format(describe(flag))
                    )

        flags._predicate = predicate
        flags._normalize = normalize

        return flags

    @staticmethod
    def predicator(flags):
        """
        Determine a predicate function for the given flags.

        @param flags: Match expression flags.
        @type flags: L{MatchFlags}

        @return: a L{callable} that accepts an L{object} argument and returns a
        L{object} that has the opposite or same truth value as the argument,
        depending on whether L{MatchFlags.NOT} is or is not in C{flags}.
        @rtype: callable
        """
        if not hasattr(flags, "_predicate"):
            flags = MatchFlags._setMatchFunctions(flags)
        return flags._predicate

    @staticmethod
    def normalizer(flags):
        """
        Determine a normalize function for the given flags.

        @param flags: Match expression flags.
        @type flags: L{MatchFlags}

        @return: a L{callable} that accepts a L{unicode} and returns the same
        L{unicode} or a normalized L{unicode} that can be compared with other
        normalized L{unicode}s in a case-insensitive fashion, depending on
        whether L{MatchFlags.caseInsensitive} is not or is in C{flags}.
        @rtype: callable
        """
        if not hasattr(flags, "_normalize"):
            flags = MatchFlags._setMatchFunctions(flags)
        return flags._normalize


# Lame way to create a FlagsConstant with no flags in it:
MatchFlags.none = MatchFlags.NOT & MatchFlags.caseInsensitive


class MatchExpression(object):
    """
    Query for a matching value in a given field.

    @ivar fieldName: A L{NamedConstant} specifying the field.

    @ivar fieldValue: A value to match.

    @ivar matchType: A L{NamedConstant} specifying the match algorithm.

    @ivar flags: A L{NamedConstant} specifying additional options.
    """

    def __init__(
        self,
        fieldName, fieldValue,
        matchType=MatchType.equals, flags=MatchFlags.none
    ):
        if not isinstance(fieldName, NamedConstant):
            raise TypeError(
                "Field name {name} in match expression is not a NamedConstant."
                .format(name=fieldName)
            )

        valueType = FieldName.valueType(fieldName)
        if not isinstance(fieldValue, valueType):
            raise TypeError(
                "Field value {value!r} for field {field} in match expression "
                "is not of expected type {type}."
                .format(value=fieldValue, field=fieldName, type=valueType)
            )

        self.fieldName = fieldName
        self.fieldValue = fieldValue
        self.matchType = matchType
        self.flags = flags

    def __repr__(self):
        if self.flags.value == 0:
            flags = ""
        else:
            flags = " ({0})".format(describe(self.flags))

        return (
            "<{self.__class__.__name__}: {fieldName!r} "
            "{matchType} {fieldValue!r}{flags}>"
            .format(
                self=self,
                fieldName=describe(self.fieldName),
                matchType=describe(self.matchType),
                fieldValue=describe(self.fieldValue),
                flags=flags,
            )
        )

    def __eq__(self, other):
        if isinstance(other, MatchExpression):
            return (
                (self.fieldName is other.fieldName) and
                (self.matchType is other.matchType) and
                (set(self.flags) == set(other.flags)) and
                (self.fieldValue == other.fieldValue)
            )
        else:
            return NotImplemented

    def match(self, value):
        """
        Test whether this expression's field value matches against a given
        value according to this expression's match type and match flags.

        @param value: The value to match against.
        @type value: L{object}

        @return: C{True} if this expression matches C{value}; L{False}
            otherwise.
        @rtype: L{bool}
        """
        predicate = MatchFlags.predicator(self.flags)
        normalize = MatchFlags.normalizer(self.flags)

        def match(a, b):
            matchType = self.matchType

            if matchType == MatchType.equals:
                return a == b

            if matchType == MatchType.startsWith:
                return a.startswith(b)

            if matchType == MatchType.endsWith:
                return a.endswith(b)

            if matchType == MatchType.contains:
                return b in a

            if matchType == MatchType.lessThan:
                return a < b

            if matchType == MatchType.greaterThan:
                return a > b

            if matchType == MatchType.lessThanOrEqualTo:
                return a <= b

            if matchType == MatchType.greaterThanOrEqualTo:
                return a >= b

            raise NotImplementedError(
                "Unknown match type: {0!r}".format(matchType)
            )

        return predicate(match(
            normalize(value), normalize(self.fieldValue)
        ))


class ExistsExpression(object):
    """
    Query for the existence a given field.

    @ivar fieldName: A L{NamedConstant} specifying the field.
    """

    def __init__(self, fieldName):
        if not isinstance(fieldName, NamedConstant):
            raise TypeError(
                "Field name {name} in exists expression is not a NamedConstant."
                .format(name=fieldName)
            )

        self.fieldName = fieldName

    def __repr__(self):
        return (
            "<{self.__class__.__name__}: {fieldName!r} "
            .format(
                self=self,
                fieldName=describe(self.fieldName),
            )
        )

    def __eq__(self, other):
        if isinstance(other, ExistsExpression):
            return (self.fieldName is other.fieldName)
        else:
            return NotImplemented


class BooleanExpression(object):
    """
    Query for the "True" value of a given field.

    @ivar fieldName: A L{NamedConstant} specifying the field.
    """

    def __init__(self, fieldName):
        if not isinstance(fieldName, NamedConstant):
            raise TypeError(
                "Field name {name} in boolean expression is not a NamedConstant."
                .format(name=fieldName)
            )

        self.fieldName = fieldName

    def __repr__(self):
        return (
            "<{self.__class__.__name__}: {fieldName!r} "
            .format(
                self=self,
                fieldName=describe(self.fieldName),
            )
        )

    def __eq__(self, other):
        if isinstance(other, BooleanExpression):
            return (self.fieldName is other.fieldName)
        else:
            return NotImplemented
