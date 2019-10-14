# -*- test-case-name: twext.who.test.test_xml -*-
##
# Copyright (c) 2006-2017 Apple Inc. All rights reserved.
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

from __future__ import print_function
from __future__ import absolute_import

"""
XML directory service implementation.
"""

__all__ = [
    "ParseError",
    "DirectoryService",
]

from time import time
from uuid import UUID

from xml.etree.ElementTree import (
    parse as parseXML, ParseError as XMLParseError,
    tostring as etreeToString, Element as XMLElement,
)

from twisted.python.constants import Names, Values, ValueConstant, Flags
from twisted.internet.defer import fail

from .idirectory import (
    DirectoryServiceError, DirectoryAvailabilityError,
    NoSuchRecordError, UnknownRecordTypeError,
    RecordType as BaseRecordType, FieldName as BaseFieldName,
)
from .index import (
    DirectoryService as BaseDirectoryService,
    DirectoryRecord,
    FieldName as IndexFieldName,
)
from .util import ConstantsContainer

import itertools


##
# Exceptions
##

class ParseError(DirectoryServiceError):
    """
    Parse error.
    """


##
# XML constants
##

class Element(Values):
    """
    XML element names.
    """

    # Booleans

    true = ValueConstant(u"true")
    false = ValueConstant(u"false")

    # Schema hierarchy

    directory = ValueConstant(u"directory")
    record = ValueConstant(u"record")

    # Field names

    uid = ValueConstant(u"uid")
    uid.fieldName = BaseFieldName.uid

    guid = ValueConstant(u"guid")
    guid.fieldName = BaseFieldName.guid

    shortName = ValueConstant(u"short-name")
    shortName.fieldName = BaseFieldName.shortNames

    fullName = ValueConstant(u"full-name")
    fullName.fieldName = BaseFieldName.fullNames

    emailAddress = ValueConstant(u"email")
    emailAddress.fieldName = BaseFieldName.emailAddresses

    password = ValueConstant(u"password")
    password.fieldName = BaseFieldName.password

    memberUID = ValueConstant(u"member-uid")
    memberUID.fieldName = IndexFieldName.memberUIDs


class Attribute(Values):
    """
    XML attribute names.
    """

    realm = ValueConstant(u"realm")
    recordType = ValueConstant(u"type")


class RecordTypeValue(Values):
    """
    XML attribute values for record types.
    """

    user = ValueConstant(u"user")
    user.recordType = BaseRecordType.user

    group = ValueConstant(u"group")
    group.recordType = BaseRecordType.group


##
# Directory Service
##

class DirectoryService(BaseDirectoryService):
    """
    XML directory service.
    """

    recordType = ConstantsContainer(
        (BaseRecordType.user, BaseRecordType.group)
    )

    # XML schema constants
    element = Element
    attribute = Attribute
    recordTypeValue = RecordTypeValue

    xmlFieldOrder = (
        BaseFieldName.recordType,
        BaseFieldName.uid,
        BaseFieldName.guid,
        BaseFieldName.shortNames,
        BaseFieldName.fullNames,
        BaseFieldName.emailAddresses,
        BaseFieldName.password,
        IndexFieldName.memberUIDs,
    )

    def __init__(self, filePath, refreshInterval=4):
        """
        @param filePath: A file path for the XML data to load into the
            directory.
        @type filePath: L{FilePath}

        @param refreshInterval: An interval (in seconds) during which time
            C{filePath} will not be checked for new data, reducing I/O.
        @type refreshInterval: L{int}
        """
        BaseDirectoryService.__init__(self, realmName=noRealmName)

        self.filePath = filePath
        self.filePreamble = ""
        self.refreshInterval = refreshInterval

    def __repr__(self):
        realmName = self._realmName
        if realmName is None:
            realmName = "(not loaded)"
        else:
            realmName = repr(realmName)

        return (
            "<{self.__class__.__name__} {realmName}>".format(
                self=self,
                realmName=realmName,
            )
        )

    @property
    def realmName(self):
        self.loadRecords()
        return self._realmName

    @realmName.setter
    def realmName(self, value):
        if value is not noRealmName:
            raise AttributeError("realmName may not be set directly")

    @property
    def unknownRecordTypes(self):
        self.loadRecords()
        return self._unknownRecordTypes

    @property
    def unknownFieldElements(self):
        self.loadRecords()
        return self._unknownFieldElements

    def loadRecords(self, loadNow=False, stat=True):
        """
        Load records from L{self.filePath}.

        Does nothing if a successful refresh has happened within the
        last L{self.refreshInterval} seconds.

        @param loadNow: If true, load now (ignoring L{self.refreshInterval})
        @type loadNow: L{type}

        @param stat: If true, check file metadata and don't reload if
            unchanged.
        @type loadNow: L{type}
        """
        #
        # Punt if we've read the file recently
        #
        now = time()
        if not loadNow and now - self._lastRefresh <= self.refreshInterval:
            return

        #
        # Punt if we've read the file and it's still the same.
        #
        if stat:
            try:
                self.filePath.restat()
            except (OSError, IOError):
                # Can't read the file
                self.flush()
                raise DirectoryAvailabilityError(
                    "Can't open {}".format(self.filePath)
                )

            cacheTag = (
                self.filePath.getModificationTime(),
                self.filePath.getsize()
            )
            if cacheTag == self._cacheTag:
                return
        else:
            cacheTag = None

        #
        # Open and parse the file
        #
        try:
            with self.filePath.open() as fh:
                lines = fh.read().splitlines()
                self.filePreamble = "\n".join(itertools.takewhile(lambda x: not x.startswith("<directory"), lines))

            with self.filePath.open() as fh:
                try:
                    etree = parseXML(fh)
                except XMLParseError as e:
                    raise ParseError(e)
        except (OSError, IOError):
            # Can't read the file
            self.flush()
            raise DirectoryAvailabilityError(
                "Can't open {}".format(self.filePath)
            )

        #
        # Pull data from DOM
        #
        directoryNode = etree.getroot()
        if directoryNode.tag != self.element.directory.value:
            raise ParseError(
                "Incorrect root element: {0}".format(directoryNode.tag)
            )

        realmName = unicode(directoryNode.get(
            self.attribute.realm.value, u""
        ))

        if not realmName:
            raise ParseError("No realm name.")

        unknownRecordTypes = set()
        unknownFieldElements = set()

        records = set()

        for recordNode in directoryNode:
            try:
                records.add(
                    self.parseRecordNode(recordNode, unknownFieldElements)
                )
            except UnknownRecordTypeError as e:
                unknownRecordTypes.add(e.token)

        #
        # Store results
        #

        self.flush()
        self.indexRecords(records)

        self._realmName = realmName

        self._unknownRecordTypes = unknownRecordTypes
        self._unknownFieldElements = unknownFieldElements

        self._cacheTag = cacheTag
        self._lastRefresh = now

        return etree

    def parseRecordNode(self, recordNode, unknownFieldElements=None):
        recordTypeAttribute = recordNode.get(
            self.attribute.recordType.value, u""
        )
        if recordTypeAttribute:
            try:
                recordType = (
                    self.recordTypeValue
                    .lookupByValue(recordTypeAttribute)
                    .recordType
                )
            except (ValueError, AttributeError):
                raise UnknownRecordTypeError(recordTypeAttribute)
        else:
            recordType = self.recordType.user

        fields = {}
        fields[self.fieldName.recordType] = recordType

        for fieldNode in recordNode:
            try:
                fieldElement = self.element.lookupByValue(fieldNode.tag)
            except ValueError:
                if unknownFieldElements is not None:
                    unknownFieldElements.add(fieldNode.tag)
                continue

            try:
                fieldName = fieldElement.fieldName
            except AttributeError:
                if unknownFieldElements is not None:
                    unknownFieldElements.add(fieldNode.tag)
                continue

            valueType = self.fieldName.valueType(fieldName)

            if valueType in (unicode, UUID):
                if fieldNode.text is None and valueType is unicode:
                    value = u""
                else:
                    value = valueType(fieldNode.text)

            elif valueType is bool:
                boolElement = self._constantElement(fieldNode)

                if boolElement is Element.true:
                    value = True

                elif boolElement is Element.false:
                    value = False

                else:
                    raise ParseError(
                        "Child element {0} of element {0} is not a boolean."
                        .format(boolElement.value, fieldNode.tag)
                    )

            elif issubclass(valueType, (Names, Values, Flags)):
                constantElement = self._constantElement(fieldNode)

                value = constantElement.constantValue

            else:
                raise AssertionError(
                    "Unknown value type {0} for field {1}".format(
                        valueType, fieldName
                    )
                )

            assert value is not None

            if self.fieldName.isMultiValue(fieldName):
                values = fields.setdefault(fieldName, [])
                values.append(value)
            else:
                fields[fieldName] = value

        return DirectoryRecord(self, fields)

    def _uidForRecordNode(self, recordNode):
        uidNode = recordNode.find(self.element.uid.value)
        if uidNode is None:
            raise NotImplementedError("No UID node")

        return uidNode.text

    def _constantElement(self, node):
        """
        Find the element name of the single empty node (eg. C{<foo />}) in a
        given node.

        @param node: a node
        @type node: L{XMLElement}

        @return: The element name for the found node.
        @rtype: L{Element}
        """
        child = None

        for c in node:
            if child is not None:
                raise ParseError(
                    "Element {0} may only have a single child element, "
                    "not: {1}"
                    .format(node.tag, [c.tag for c in node])
                )
            child = c

        if child is None:
            raise ParseError(
                "Element {0} must contain a single empty child element."
            )

        if child.text:
            raise ParseError(
                "Child element {0} of element {1} may not have text: {2!r}"
                .format(child.tag, node.tag, child.text)
            )

        try:
            return self.element.lookupByValue(child.tag)
        except ValueError:
            raise ParseError(
                "Unknown child element {0} of element {1}."
                .format(child.tag, node.tag)
            )

    def flush(self):
        BaseDirectoryService.flush(self)

        self._realmName = None
        self._unknownRecordTypes = None
        self._unknownFieldElements = None
        self._cacheTag = None
        self._lastRefresh = 0

    def updateRecords(self, records, create=False):
        # Index the records to update by UID
        recordsByUID = dict(((record.uid, record) for record in records))

        # Index the record type -> attribute mappings.
        recordTypes = {}
        for valueName in self.recordTypeValue.iterconstants():
            recordTypes[valueName.recordType] = valueName.value
        del valueName

        # Index the field name -> element mappings.
        fieldNames = {}
        for elementName in self.element.iterconstants():
            fieldName = getattr(elementName, "fieldName", None)
            if fieldName is not None:
                fieldNames[fieldName] = elementName.value
        del elementName

        directoryNode = self._directoryNodeForEditing()

        def fillRecordNode(recordNode, record):
            subNode = None
            fields = list(self.xmlFieldOrder)
            fields.extend(filter(lambda k: k not in self.xmlFieldOrder, record.fields))
            for name in fields:
                if name not in record.fields:
                    continue
                value = record.fields[name]
                if name == self.fieldName.recordType:
                    if value in recordTypes:
                        recordNode.set(
                            self.attribute.recordType.value,
                            recordTypes[value]
                        )
                    else:
                        raise AssertionError(
                            "Unknown record type: {0}".format(value)
                        )

                else:
                    if name in fieldNames:
                        tag = fieldNames[name]

                        if self.fieldName.isMultiValue(name):
                            values = value
                        else:
                            values = (value,)

                        for value in values:
                            subNode = XMLElement(tag)
                            if isinstance(value, UUID):
                                value = str(value)
                            subNode.text = value
                            subNode.tail = "\n    "
                            recordNode.append(subNode)

                    else:
                        raise AssertionError(
                            "Unknown field name: {0!r}".format(name)
                        )

            if subNode is not None:
                subNode.tail = "\n"
            recordNode.text = "\n    "
            recordNode.tail = "\n"

        # Walk through the record nodes in the XML tree and apply
        # updates.
        for recordNode in directoryNode:
            uid = self._uidForRecordNode(recordNode)

            record = recordsByUID.get(uid, None)

            if record:
                recordNode.clear()
                fillRecordNode(recordNode, record)
                del recordsByUID[uid]

        if recordsByUID:
            if not create:
                return fail(NoSuchRecordError(recordsByUID.keys()))

            for uid, record in recordsByUID.items():
                recordNode = XMLElement(self.element.record.value)
                fillRecordNode(recordNode, record)
                directoryNode.append(recordNode)

        self._writeDirectoryNode(directoryNode)

    def removeRecords(self, uids):
        directoryNode = self._directoryNodeForEditing()

        #
        # Walk through the record nodes in the XML tree and start
        # zapping.
        #
        for recordNode in directoryNode:
            uid = self._uidForRecordNode(recordNode)

            if uid in uids:
                directoryNode.remove(recordNode)

        self._writeDirectoryNode(directoryNode)

    def _directoryNodeForEditing(self):
        """
        Drop cached data and load the XML DOM.
        """
        self.flush()
        etree = self.loadRecords(loadNow=True, stat=False)
        return etree.getroot()

    def _writeDirectoryNode(self, directoryNode):
        self.filePath.setContent("{preamble}\n{xml}\n".format(preamble=self.filePreamble, xml=etreeToString(directoryNode, "utf-8")))
        self.flush()


noRealmName = object()
