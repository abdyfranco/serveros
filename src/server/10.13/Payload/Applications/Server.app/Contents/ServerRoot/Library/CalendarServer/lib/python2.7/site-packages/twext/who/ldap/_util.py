# -*- test-case-name: twext.who.ldap.test.test_util -*-
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

from ..idirectory import QueryNotSupportedError, FieldName
from ..expression import (
    CompoundExpression, ExistsExpression, MatchExpression,
    MatchFlags, Operand, BooleanExpression
)
from ._constants import LDAPOperand, LDAPMatchType, LDAPMatchFlags


def ldapQueryStringFromQueryStrings(operand, queryStrings):
    """
    Combines LDAP query strings into a single query string.

    @param operand: An LDAP operand (C{u"&"} or C{u"|"}).
    @type operand: L{unicode}

    @param queryStrings: LDAP query strings.
    @type queryStrings: sequence of L{unicode}
    """
    if len(queryStrings) == 1:
        return queryStrings[0]

    elif len(queryStrings) > 1:
        queryTokens = []
        queryTokens.append(u"(")
        queryTokens.append(operand)
        queryTokens.extend(queryStrings)
        queryTokens.append(u")")
        return u"".join(queryTokens)

    else:
        return u""


def ldapQueryStringFromMatchExpression(
    expression, fieldNameToAttributesMap, recordTypeSchemas
):
    """
    Generates an LDAP query string from a match expression.

    @param expression: A match expression.
    @type expression: L{MatchExpression}

    @param fieldNameToAttributesMap: A mapping from field names to native LDAP
        attribute names.
    @type fieldNameToAttributesMap: L{dict} with L{FieldName} keys and sequence
        of L{unicode} values.

    @param recordTypeSchemas: Schema information for record types.
    @type recordTypeSchemas: mapping from L{NamedConstant} to
        L{RecordTypeSchema}

    @return: An LDAP query string.
    @rtype: L{unicode}

    @raises QueryNotSupportedError: If the expression's match type is unknown,
        or if the expresion references an unknown field name (meaning a field
        name not in C{fieldNameToAttributeMap}).
    """

    matchType = LDAPMatchType.fromMatchType(expression.matchType)
    if matchType is None:
        raise QueryNotSupportedError(
            "Unknown match type: {0}".format(matchType)
        )

    flags = tuple(expression.flags)

    if MatchFlags.NOT in flags:
        notOp = LDAPMatchFlags.NOT.value
        operand = LDAPOperand.AND.value
    else:
        notOp = LDAPMatchFlags.none.value
        operand = LDAPOperand.OR.value

    # FIXME: It doesn't look like LDAP queries can be case sensitive.
    # This would mean that it's up to the callers to filter out the false
    # positives...
    #
    # if MatchFlags.caseInsensitive not in flags:
    #     raise NotImplementedError("Need to handle case sensitive")

    fieldName = expression.fieldName

    if fieldName is FieldName.recordType:
        if matchType is not LDAPMatchType.equals:
            raise QueryNotSupportedError(
                "Match type for record type must be equals, not {0!r}"
                .format(expression.matchType)
            )

        try:
            schema = recordTypeSchemas[expression.fieldValue]
        except KeyError:
            raise QueryNotSupportedError(
                "Unmapped record type: {0}".format(expression.fieldValue)
            )

        if notOp:
            valueOperand = LDAPOperand.OR.value
        else:
            valueOperand = LDAPOperand.AND.value

        queryStrings = [
            matchType.queryString.format(
                notOp=notOp, attribute=attribute, value=value,
            )
            for attribute, value in schema.attributes
        ]

        return ldapQueryStringFromQueryStrings(valueOperand, queryStrings)

    else:
        try:
            attributes = fieldNameToAttributesMap[fieldName]
        except KeyError:
            raise QueryNotSupportedError(
                "Unmapped field name: {0}".format(expression.fieldName)
            )

        # Covert to unicode and escape special LDAP query characters
        value = unicode(expression.fieldValue).translate(LDAP_QUOTING_TABLE)

        # Compose an query using each of the LDAP attributes cooresponding to
        # the target field name.

        queryStrings = [
            matchType.queryString.format(
                notOp=notOp, attribute=attribute, value=value
            )
            for attribute in attributes
        ]

        return ldapQueryStringFromQueryStrings(operand, queryStrings)

    raise AssertionError("We shouldn't be here.")


def ldapQueryStringFromExistsExpression(
    expression, fieldNameToAttributesMap, recordTypeSchemas
):
    """
    Generates an LDAP query string from an exists expression.

    @param expression: An exists expression.
    @type expression: L{ExistsExpression}

    @param fieldNameToAttributesMap: A mapping from field names to native LDAP
        attribute names.
    @type fieldNameToAttributesMap: L{dict} with L{FieldName} keys and sequence
        of L{unicode} values.

    @param recordTypeSchemas: Schema information for record types.
    @type recordTypeSchemas: mapping from L{NamedConstant} to
        L{RecordTypeSchema}

    @return: An LDAP query string.
    @rtype: L{unicode}

    @raises QueryNotSupportedError: if the expresion references an unknown
        field name (meaning a field name not in C{fieldNameToAttributeMap}).
    """

    fieldName = expression.fieldName

    try:
        attributes = fieldNameToAttributesMap[fieldName]
    except KeyError:
        raise QueryNotSupportedError(
            "Unmapped field name: {0}".format(expression.fieldName)
        )

    queryStrings = [
        u"({attribute}=*)".format(attribute=attribute)
        for attribute in attributes
    ]

    operand = LDAPOperand.OR.value
    return ldapQueryStringFromQueryStrings(operand, queryStrings)


def ldapQueryStringFromBooleanExpression(
    expression, fieldNameToAttributesMap, recordTypeSchemas
):
    """
    Generates an LDAP query string from a boolean expression.

    @param expression: An boolean expression.
    @type expression: L{BooleanExpression}

    @param fieldNameToAttributesMap: A mapping from field names to native LDAP
        attribute names.
    @type fieldNameToAttributesMap: L{dict} with L{FieldName} keys and sequence
        of L{unicode} values.

    @param recordTypeSchemas: Schema information for record types.
    @type recordTypeSchemas: mapping from L{NamedConstant} to
        L{RecordTypeSchema}

    @return: An LDAP query string.
    @rtype: L{unicode}

    @raises QueryNotSupportedError: if the expresion references an unknown
        field name (meaning a field name not in C{fieldNameToAttributeMap}).
    """

    fieldName = expression.fieldName

    try:
        attributes = fieldNameToAttributesMap[fieldName]
    except KeyError:
        raise QueryNotSupportedError(
            "Unmapped field name: {0}".format(expression.fieldName)
        )

    queryStrings = []
    for attribute in attributes:
        if ":" in attribute:
            attribute, trueValue = attribute.split(":")
        else:
            trueValue = "true"

        queryStrings.append(
            u"({attribute}={trueValue})".format(
                attribute=attribute,
                trueValue=trueValue
            )
        )

    operand = LDAPOperand.OR.value
    return ldapQueryStringFromQueryStrings(operand, queryStrings)


def ldapQueryStringFromCompoundExpression(
    expression, fieldNameToAttributesMap, recordTypeSchemas
):
    """
    Generates an LDAP query string from a compound expression.

    @param expression: A compound expression.
    @type expression: L{MatchExpression}

    @param fieldNameToAttributesMap: A mapping from field names to native LDAP
        attribute names.
    @type fieldNameToAttributesMap: L{dict} with L{FieldName} keys and sequence
        of L{unicode} values.

    @param recordTypeSchemas: Schema information for record types.
    @type recordTypeSchemas: mapping from L{NamedConstant} to
        L{RecordTypeSchema}

    @return: An LDAP query string.
    @rtype: L{unicode}

    @raises QueryNotSupportedError: If any sub-expression cannot be converted
        to an LDAP query.
    """
    if expression.operand is Operand.AND:
        operand = LDAPOperand.AND.value

    elif expression.operand is Operand.OR:
        operand = LDAPOperand.OR.value

    queryStrings = [
        ldapQueryStringFromExpression(
            subExpression,
            fieldNameToAttributesMap, recordTypeSchemas
        )
        for subExpression in expression.expressions
    ]

    return ldapQueryStringFromQueryStrings(operand, queryStrings)


def ldapQueryStringFromExpression(
    expression, fieldNameToAttributesMap, recordTypeSchemas
):
    """
    Converts an expression into an LDAP query string.

    @param expression: An expression.
    @type expression: L{MatchExpression} or L{CompoundExpression}

    @param fieldNameToAttributesMap: A mapping from field names to native LDAP
        attribute names.
    @type fieldNameToAttributesMap: L{dict} with L{FieldName} keys and sequence
        of L{unicode} values.

    @param recordTypeSchemas: Schema information for record types.
    @type recordTypeSchemas: mapping from L{NamedConstant} to
        L{RecordTypeSchema}

    @return: An LDAP query string.
    @rtype: L{unicode}

    @raises QueryNotSupportedError: If the expression cannot be converted to an
        LDAP query.
    """

    if isinstance(expression, MatchExpression):
        return ldapQueryStringFromMatchExpression(
            expression, fieldNameToAttributesMap, recordTypeSchemas
        )

    if isinstance(expression, BooleanExpression):
        return ldapQueryStringFromBooleanExpression(
            expression, fieldNameToAttributesMap, recordTypeSchemas
        )

    if isinstance(expression, ExistsExpression):
        return ldapQueryStringFromExistsExpression(
            expression, fieldNameToAttributesMap, recordTypeSchemas
        )

    if isinstance(expression, CompoundExpression):
        return ldapQueryStringFromCompoundExpression(
            expression, fieldNameToAttributesMap, recordTypeSchemas
        )

    raise QueryNotSupportedError(
        "Unknown expression type: {0!r}".format(expression)
    )


LDAP_QUOTING_TABLE = {
    ord(u"\\"): u"\\5C",
    ord(u"/"): u"\\2F",

    ord(u"("): u"\\28",
    ord(u")"): u"\\29",
    ord(u"*"): u"\\2A",

    ord(u"<"): u"\\3C",
    ord(u"="): u"\\3D",
    ord(u">"): u"\\3E",
    ord(u"~"): u"\\7E",

    ord(u"&"): u"\\26",
    ord(u"|"): u"\\7C",

    ord(u"\0"): u"\\00",
}
