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
OpenDirectory constants.
"""

from twisted.python.constants import (
    Names, NamedConstant, Values, ValueConstant
)

from ..idirectory import (
    FieldName as BaseFieldName, RecordType as BaseRecordType
)
from ..expression import MatchType


#
# idirectory constants
#

class FieldName(Names):
    searchPath = NamedConstant()
    searchPath.description = u"search path"
    searchPath.multiValue = False

    metaNodeLocation = NamedConstant()
    metaNodeLocation.description = u"source OD node"
    metaNodeLocation.multiValue = False

    metaRecordName = NamedConstant()
    metaRecordName.description = u"meta record name"
    metaRecordName.multiValue = False

    memberUIDs = NamedConstant()
    memberUIDs.description = u"member UIDs (excluding groups)"
    memberUIDs.multiValue = True

    nestedGroupsUIDs = NamedConstant()
    nestedGroupsUIDs.description = u"nested group member UIDs"
    nestedGroupsUIDs.multiValue = True


#
# OD constants
#

class ODSearchPath(Values):
    local = ValueConstant(u"/Local/Default")
    search = ValueConstant(u"/Search")


class ODRecordType(Values):
    user = ValueConstant(u"dsRecTypeStandard:Users")
    user.recordType = BaseRecordType.user

    group = ValueConstant(u"dsRecTypeStandard:Groups")
    group.recordType = BaseRecordType.group

    # location = ValueConstant(u"dsRecTypeStandard:Locations")
    place = ValueConstant(u"dsRecTypeStandard:Places")

    resource = ValueConstant(u"dsRecTypeStandard:Resources")

    # accessControl = ValueConstant(u"dsRecTypeStandard:AccessControls")
    # afpServer = ValueConstant(u"dsRecTypeStandard:AFPServer")
    # userAlias = ValueConstant(u"dsRecTypeStandard:AFPUserAliases")
    # alias = ValueConstant(u"dsRecTypeStandard:Aliases")
    # augment = ValueConstant(u"dsRecTypeStandard:Augments")
    # autoMount = ValueConstant(u"dsRecTypeStandard:Automount")
    # autoMountMap = ValueConstant(u"dsRecTypeStandard:AutomountMap")
    # autoServerSetup = ValueConstant(u"dsRecTypeStandard:AutoServerSetup")
    # bootp = ValueConstant(u"dsRecTypeStandard:Bootp")
    # certificateAuthority = ValueConstant(u"dsRecTypeStandard:CertificateAuthorities")
    # computerList = ValueConstant(u"dsRecTypeStandard:ComputerLists")
    # computerGroup = ValueConstant(u"dsRecTypeStandard:ComputerGroups")
    # computer = ValueConstant(u"dsRecTypeStandard:Computers")
    # config = ValueConstant(u"dsRecTypeStandard:Config")
    # ethernet = ValueConstant(u"dsRecTypeStandard:Ethernets")
    # fileMakerServer = ValueConstant(u"dsRecTypeStandard:FileMakerServers")
    # ftpServer = ValueConstant(u"dsRecTypeStandard:FTPServer")
    # groupAlias = ValueConstant(u"dsRecTypeStandard:GroupAliases")
    # hostServices = ValueConstant(u"dsRecTypeStandard:HostServices")
    # host = ValueConstant(u"dsRecTypeStandard:Hosts")
    # ldapServer = ValueConstant(u"dsRecTypeStandard:LDAPServer")
    # machine = ValueConstant(u"dsRecTypeStandard:Machines")
    # map = ValueConstant(u"dsRecTypeStandard:Maps")
    # meta = ValueConstant(u"dsRecTypeStandard:AppleMetaRecord")
    # mount = ValueConstant(u"dsRecTypeStandard:Mounts")
    # neighborhood = ValueConstant(u"dsRecTypeStandard:Neighborhoods")
    # nfs = ValueConstant(u"dsRecTypeStandard:NFS")
    # netDomain = ValueConstant(u"dsRecTypeStandard:NetDomains")
    # netGroup = ValueConstant(u"dsRecTypeStandard:NetGroups")
    # network = ValueConstant(u"dsRecTypeStandard:Networks")
    # passwordServer = ValueConstant(u"dsRecTypeStandard:PasswordServer")
    # person = ValueConstant(u"dsRecTypeStandard:People")
    # presetComputer = ValueConstant(u"dsRecTypeStandard:PresetComputers")
    # presetComputerGroup = ValueConstant(u"dsRecTypeStandard:PresetComputerGroups")
    # presetComputerList = ValueConstant(u"dsRecTypeStandard:PresetComputerLists")
    # presetGroup = ValueConstant(u"dsRecTypeStandard:PresetGroups")
    # presetUser = ValueConstant(u"dsRecTypeStandard:PresetUsers")
    # printService = ValueConstant(u"dsRecTypeStandard:PrintService")
    # printServerUser = ValueConstant(u"dsRecTypeStandard:PrintServiceUser")
    # printer = ValueConstant(u"dsRecTypeStandard:Printers")
    # protocol = ValueConstant(u"dsRecTypeStandard:Protocols")
    # qtsServer = ValueConstant(u"dsRecTypeStandard:QTSServer")
    # rpc = ValueConstant(u"dsRecTypeStandard:RPC")
    # smbServer = ValueConstant(u"dsRecTypeStandard:SMBServer")
    # server = ValueConstant(u"dsRecTypeStandard:Server")
    # service = ValueConstant(u"dsRecTypeStandard:Services")
    # sharePoint = ValueConstant(u"dsRecTypeStandard:SharePoints")
    # userAlias = ValueConstant(u"dsRecTypeStandard:UserAliases")
    # webServer = ValueConstant(u"dsRecTypeStandard:WebServer")

    @classmethod
    def fromRecordType(cls, recordType):
        if not hasattr(cls, "_recordTypeByRecordType"):
            cls._recordTypeByRecordType = dict((
                (recordType.recordType, recordType)
                for recordType in cls.iterconstants()
                if hasattr(recordType, "recordType")
            ))

        return cls._recordTypeByRecordType.get(recordType, None)


class ODAttribute(Values):
    searchPath = ValueConstant(u"dsAttrTypeStandard:SearchPath")
    searchPath.fieldName = FieldName.searchPath

    recordType = ValueConstant(u"dsAttrTypeStandard:RecordType")
    recordType.fieldName = BaseFieldName.recordType

    guid = ValueConstant(u"dsAttrTypeStandard:GeneratedUID")
    guid.fieldName = BaseFieldName.guid

    shortName = ValueConstant(u"dsAttrTypeStandard:RecordName")
    shortName.fieldName = BaseFieldName.shortNames

    fullName = ValueConstant(u"dsAttrTypeStandard:RealName")
    fullName.fieldName = BaseFieldName.fullNames

    emailAddress = ValueConstant(u"dsAttrTypeStandard:EMailAddress")
    emailAddress.fieldName = BaseFieldName.emailAddresses

    metaNodeLocation = ValueConstant(u"dsAttrTypeStandard:AppleMetaNodeLocation")
    metaNodeLocation.fieldName = FieldName.metaNodeLocation

    metaRecordName = ValueConstant(u"dsAttrTypeStandard:AppleMetaRecordName")
    metaRecordName.fieldName = FieldName.metaRecordName

    groupMembers = ValueConstant(u"dsAttrTypeStandard:GroupMembers")
    groupMembers.fieldName = FieldName.memberUIDs

    nestedGroups = ValueConstant(u"dsAttrTypeStandard:NestedGroups")
    nestedGroups.fieldName = FieldName.nestedGroupsUIDs

    # For determining whether it's a system record
    uniqueId = ValueConstant(u"dsAttrTypeStandard:UniqueID")
    primaryGroupId = ValueConstant(u"dsAttrTypeStandard:PrimaryGroupID")
    isHidden = ValueConstant(u"dsAttrTypeNative:IsHidden")

    streetAddress = ValueConstant(u"dsAttrTypeStandard:Street")

    # # Single value fields
    # AdminLimits = ValueConstant(u"dsAttrTypeStandard:AdminLimits")
    # AppleAliasData = ValueConstant(u"dsAttrTypeStandard:AppleAliasData")
    # AlternateDatastoreLocation = ValueConstant(u"dsAttrTypeStandard:AlternateDatastoreLocation")
    # AuthenticationHint = ValueConstant(u"dsAttrTypeStandard:AuthenticationHint")
    # AttributeTypes = ValueConstant(u"dsAttrTypeStandard:AttributeTypes")
    # AuthorityRevocationList = ValueConstant(u"dsAttrTypeStandard:AuthorityRevocationList")
    # Birthday = ValueConstant(u"dsAttrTypeStandard:Birthday")
    # BootFile = ValueConstant(u"dsAttrTypeStandard:BootFile")
    # CACertificate = ValueConstant(u"dsAttrTypeStandard:CACertificate")
    # Capabilities = ValueConstant(u"dsAttrTypeStandard:Capabilities")
    # Capacity = ValueConstant(u"dsAttrTypeStandard:Capacity")
    # Category = ValueConstant(u"dsAttrTypeStandard:Category")
    # CertificateRevocationList = ValueConstant(u"dsAttrTypeStandard:CertificateRevocationList")
    # Change = ValueConstant(u"dsAttrTypeStandard:Change")
    # Comment = ValueConstant(u"dsAttrTypeStandard:Comment")
    # ContactGUID = ValueConstant(u"dsAttrTypeStandard:ContactGUID")
    # ContactPerson = ValueConstant(u"dsAttrTypeStandard:ContactPerson")
    # CreationTimestamp = ValueConstant(u"dsAttrTypeStandard:CreationTimestamp")
    # CrossCertificatePair = ValueConstant(u"dsAttrTypeStandard:CrossCertificatePair")
    # DataStamp = ValueConstant(u"dsAttrTypeStandard:DataStamp")
    # DNSDomain = ValueConstant(u"dsAttrTypeStandard:DNSDomain")
    # DNSNameServer = ValueConstant(u"dsAttrTypeStandard:DNSNameServer")
    # ENetAddress = ValueConstant(u"dsAttrTypeStandard:ENetAddress")
    # Expire = ValueConstant(u"dsAttrTypeStandard:Expire")
    # FirstName = ValueConstant(u"dsAttrTypeStandard:FirstName")
    # HomeDirectoryQuota = ValueConstant(u"dsAttrTypeStandard:HomeDirectoryQuota")
    # HomeDirectorySoftQuota = ValueConstant(u"dsAttrTypeStandard:HomeDirectorySoftQuota")
    # HomeLocOwner = ValueConstant(u"dsAttrTypeStandard:HomeLocOwner")
    # InetAlias = ValueConstant(u"dsAttrTypeStandard:InetAlias")
    # KDCConfigData = ValueConstant(u"dsAttrTypeStandard:KDCConfigData")
    # LastName = ValueConstant(u"dsAttrTypeStandard:LastName")
    # LDAPSearchBaseSuffix = ValueConstant(u"dsAttrTypeStandard:LDAPSearchBaseSuffix")
    # Location = ValueConstant(u"dsAttrTypeStandard:Location")
    # MapGUID = ValueConstant(u"dsAttrTypeStandard:MapGUID")
    # MCXFlags = ValueConstant(u"dsAttrTypeStandard:MCXFlags")
    # MCXSettings = ValueConstant(u"dsAttrTypeStandard:MCXSettings")
    # MailAttribute = ValueConstant(u"dsAttrTypeStandard:MailAttribute")
    # MetaAutomountMap = ValueConstant(u"dsAttrTypeStandard:MetaAutomountMap")
    # MiddleName = ValueConstant(u"dsAttrTypeStandard:MiddleName")
    # ModificationTimestamp = ValueConstant(u"dsAttrTypeStandard:ModificationTimestamp")
    # NeighborhoodAlias = ValueConstant(u"dsAttrTypeStandard:NeighborhoodAlias")
    # NeighborhoodType = ValueConstant(u"dsAttrTypeStandard:NeighborhoodType")
    # NetworkView = ValueConstant(u"dsAttrTypeStandard:NetworkView")
    # NFSHomeDirectory = ValueConstant(u"dsAttrTypeStandard:NFSHomeDirectory")
    # Note = ValueConstant(u"dsAttrTypeStandard:Note")
    # Owner = ValueConstant(u"dsAttrTypeStandard:Owner")
    # OwnerGUID = ValueConstant(u"dsAttrTypeStandard:OwnerGUID")
    # Password = ValueConstant(u"dsAttrTypeStandard:Password")
    # PasswordPlus = ValueConstant(u"dsAttrTypeStandard:PasswordPlus")
    # PasswordPolicyOptions = ValueConstant(u"dsAttrTypeStandard:PasswordPolicyOptions")
    # PasswordServerList = ValueConstant(u"dsAttrTypeStandard:PasswordServerList")
    # PasswordServerLocation = ValueConstant(u"dsAttrTypeStandard:PasswordServerLocation")
    # Picture = ValueConstant(u"dsAttrTypeStandard:Picture")
    # Port = ValueConstant(u"dsAttrTypeStandard:Port")
    # PresetUserIsAdmin = ValueConstant(u"dsAttrTypeStandard:PresetUserIsAdmin")
    # PrimaryComputerGUID = ValueConstant(u"dsAttrTypeStandard:PrimaryComputerGUID")
    # PrimaryComputerList = ValueConstant(u"dsAttrTypeStandard:PrimaryComputerList")
    # Printer1284DeviceID = ValueConstant(u"dsAttrTypeStandard:Printer1284DeviceID")
    # PrinterLPRHost = ValueConstant(u"dsAttrTypeStandard:PrinterLPRHost")
    # PrinterLPRQueue = ValueConstant(u"dsAttrTypeStandard:PrinterLPRQueue")
    # PrinterMakeAndModel = ValueConstant(u"dsAttrTypeStandard:PrinterMakeAndModel")
    # PrinterType = ValueConstant(u"dsAttrTypeStandard:PrinterType")
    # PrinterURI = ValueConstant(u"dsAttrTypeStandard:PrinterURI")
    # PrinterXRISupported = ValueConstant(u"dsAttrTypeStandard:PrinterXRISupported")
    # PrintServiceInfoText = ValueConstant(u"dsAttrTypeStandard:PrintServiceInfoText")
    # PrintServiceInfoXML = ValueConstant(u"dsAttrTypeStandard:PrintServiceInfoXML")
    # PrintServiceUserData = ValueConstant(u"dsAttrTypeStandard:PrintServiceUserData")
    # RealUserID = ValueConstant(u"dsAttrTypeStandard:RealUserID")
    # RelativeDNPrefix = ValueConstant(u"dsAttrTypeStandard:RelativeDNPrefix")
    # SMBAccountFlags = ValueConstant(u"dsAttrTypeStandard:SMBAccountFlags")
    # SMBGroupRID = ValueConstant(u"dsAttrTypeStandard:SMBGroupRID")
    # SMBHome = ValueConstant(u"dsAttrTypeStandard:SMBHome")
    # SMBHomeDrive = ValueConstant(u"dsAttrTypeStandard:SMBHomeDrive")
    # SMBKickoffTime = ValueConstant(u"dsAttrTypeStandard:SMBKickoffTime")
    # SMBLogoffTime = ValueConstant(u"dsAttrTypeStandard:SMBLogoffTime")
    # SMBLogonTime = ValueConstant(u"dsAttrTypeStandard:SMBLogonTime")
    # SMBPrimaryGroupSID = ValueConstant(u"dsAttrTypeStandard:SMBPrimaryGroupSID")
    # SMBPasswordLastSet = ValueConstant(u"dsAttrTypeStandard:SMBPasswordLastSet")
    # SMBProfilePath = ValueConstant(u"dsAttrTypeStandard:SMBProfilePath")
    # SMBRID = ValueConstant(u"dsAttrTypeStandard:SMBRID")
    # SMBScriptPath = ValueConstant(u"dsAttrTypeStandard:SMBScriptPath")
    # SMBSID = ValueConstant(u"dsAttrTypeStandard:SMBSID")
    # SMBUserWorkstations = ValueConstant(u"dsAttrTypeStandard:SMBUserWorkstations")
    # ServiceType = ValueConstant(u"dsAttrTypeStandard:ServiceType")
    # SetupAssistantAdvertising = ValueConstant(u"dsAttrTypeStandard:SetupAssistantAdvertising")
    # SetupAssistantAutoRegister = ValueConstant(u"dsAttrTypeStandard:SetupAssistantAutoRegister")
    # SetupAssistantLocation = ValueConstant(u"dsAttrTypeStandard:SetupAssistantLocation")
    # Occupation = ValueConstant(u"dsAttrTypeStandard:Occupation")
    # TimeToLive = ValueConstant(u"dsAttrTypeStandard:TimeToLive")
    # UserCertificate = ValueConstant(u"dsAttrTypeStandard:UserCertificate")
    # UserPKCS12Data = ValueConstant(u"dsAttrTypeStandard:UserPKCS12Data")
    # UserShell = ValueConstant(u"dsAttrTypeStandard:UserShell")
    # UserSMIMECertificate = ValueConstant(u"dsAttrTypeStandard:UserSMIMECertificate")
    # VFSDumpFreq = ValueConstant(u"dsAttrTypeStandard:VFSDumpFreq")
    # VFSLinkDir = ValueConstant(u"dsAttrTypeStandard:VFSLinkDir")
    # VFSPassNo = ValueConstant(u"dsAttrTypeStandard:VFSPassNo")
    # VFSType = ValueConstant(u"dsAttrTypeStandard:VFSType")
    # WeblogURI = ValueConstant(u"dsAttrTypeStandard:WeblogURI")
    # XMLPlist = ValueConstant(u"dsAttrTypeStandard:XMLPlist")
    # ProtocolNumber = ValueConstant(u"dsAttrTypeStandard:ProtocolNumber")
    # RPCNumber = ValueConstant(u"dsAttrTypeStandard:RPCNumber")
    # NetworkNumber = ValueConstant(u"dsAttrTypeStandard:NetworkNumber")

    # # Multi-value fields
    # AccessControlEntry = ValueConstant(u"dsAttrTypeStandard:AccessControlEntry")
    # AddressLine1 = ValueConstant(u"dsAttrTypeStandard:AddressLine1")
    # AddressLine2 = ValueConstant(u"dsAttrTypeStandard:AddressLine2")
    # AddressLine3 = ValueConstant(u"dsAttrTypeStandard:AddressLine3")
    # AltSecurityIdentities = ValueConstant(u"dsAttrTypeStandard:AltSecurityIdentities")
    # AreaCode = ValueConstant(u"dsAttrTypeStandard:AreaCode")
    # AuthenticationAuthority = ValueConstant(u"dsAttrTypeStandard:AuthenticationAuthority")
    # AutomountInformation = ValueConstant(u"dsAttrTypeStandard:AutomountInformation")
    # BootParams = ValueConstant(u"dsAttrTypeStandard:BootParams")
    # Building = ValueConstant(u"dsAttrTypeStandard:Building")
    # CalendarPrincipalURI = ValueConstant(u"dsAttrTypeStandard:CalendarPrincipalURI")
    # City = ValueConstant(u"dsAttrTypeStandard:City")
    # Company = ValueConstant(u"dsAttrTypeStandard:Company")
    # ComputerAlias = ValueConstant(u"dsAttrTypeStandard:ComputerAlias")
    # Computers = ValueConstant(u"dsAttrTypeStandard:Computers")
    # Country = ValueConstant(u"dsAttrTypeStandard:Country")
    # Department = ValueConstant(u"dsAttrTypeStandard:Department")
    # DNSName = ValueConstant(u"dsAttrTypeStandard:DNSName")
    # EMailContacts = ValueConstant(u"dsAttrTypeStandard:EMailContacts")
    # FAXNumber = ValueConstant(u"dsAttrTypeStandard:FAXNumber")
    # Group = ValueConstant(u"dsAttrTypeStandard:Group")
    # GroupMembers = ValueConstant(u"dsAttrTypeStandard:GroupMembers")
    # GroupMembership = ValueConstant(u"dsAttrTypeStandard:GroupMembership")
    # GroupServices = ValueConstant(u"dsAttrTypeStandard:GroupServices")
    # HomePhoneNumber = ValueConstant(u"dsAttrTypeStandard:HomePhoneNumber")
    # HTML = ValueConstant(u"dsAttrTypeStandard:HTML")
    # HomeDirectory = ValueConstant(u"dsAttrTypeStandard:HomeDirectory")
    # IMHandle = ValueConstant(u"dsAttrTypeStandard:IMHandle")
    # IPAddress = ValueConstant(u"dsAttrTypeStandard:IPAddress")
    # IPAddressAndENetAddress = ValueConstant(u"dsAttrTypeStandard:IPAddressAndENetAddress")
    # IPv6Address = ValueConstant(u"dsAttrTypeStandard:IPv6Address")
    # JPEGPhoto = ValueConstant(u"dsAttrTypeStandard:JPEGPhoto")
    # JobTitle = ValueConstant(u"dsAttrTypeStandard:JobTitle")
    # KDCAuthKey = ValueConstant(u"dsAttrTypeStandard:KDCAuthKey")
    # Keywords = ValueConstant(u"dsAttrTypeStandard:Keywords")
    # LDAPReadReplicas = ValueConstant(u"dsAttrTypeStandard:LDAPReadReplicas")
    # LDAPWriteReplicas = ValueConstant(u"dsAttrTypeStandard:LDAPWriteReplicas")
    # MachineServes = ValueConstant(u"dsAttrTypeStandard:MachineServes")
    # MapCoordinates = ValueConstant(u"dsAttrTypeStandard:MapCoordinates")
    # MapURI = ValueConstant(u"dsAttrTypeStandard:MapURI")
    # MCXSettings = ValueConstant(u"dsAttrTypeStandard:MCXSettings")
    # MIME = ValueConstant(u"dsAttrTypeStandard:MIME")
    # Member = ValueConstant(u"dsAttrTypeStandard:Member")
    # MobileNumber = ValueConstant(u"dsAttrTypeStandard:MobileNumber")
    # NBPEntry = ValueConstant(u"dsAttrTypeStandard:NBPEntry")
    # NestedGroups = ValueConstant(u"dsAttrTypeStandard:NestedGroups")
    # NetGroups = ValueConstant(u"dsAttrTypeStandard:NetGroups")
    # NickName = ValueConstant(u"dsAttrTypeStandard:NickName")
    # NodePathXMLPlist = ValueConstant(u"dsAttrTypeStandard:NodePathXMLPlist")
    # OrganizationInfo = ValueConstant(u"dsAttrTypeStandard:OrganizationInfo")
    # OrganizationName = ValueConstant(u"dsAttrTypeStandard:OrganizationName")
    # PagerNumber = ValueConstant(u"dsAttrTypeStandard:PagerNumber")
    # PhoneContacts = ValueConstant(u"dsAttrTypeStandard:PhoneContacts")
    # PhoneNumber = ValueConstant(u"dsAttrTypeStandard:PhoneNumber")
    # PGPPublicKey = ValueConstant(u"dsAttrTypeStandard:PGPPublicKey")
    # PostalAddress = ValueConstant(u"dsAttrTypeStandard:PostalAddress")
    # PostalAddressContacts = ValueConstant(u"dsAttrTypeStandard:PostalAddressContacts")
    # PostalCode = ValueConstant(u"dsAttrTypeStandard:PostalCode")
    # NamePrefix = ValueConstant(u"dsAttrTypeStandard:NamePrefix")
    # Protocols = ValueConstant(u"dsAttrTypeStandard:Protocols")
    # Relationships = ValueConstant(u"dsAttrTypeStandard:Relationships")
    # ResourceInfo = ValueConstant(u"dsAttrTypeStandard:ResourceInfo")
    # ResourceType = ValueConstant(u"dsAttrTypeStandard:ResourceType")
    # ServicesLocator = ValueConstant(u"dsAttrTypeStandard:ServicesLocator")
    # State = ValueConstant(u"dsAttrTypeStandard:State")
    # Street = ValueConstant(u"dsAttrTypeStandard:Street")
    # NameSuffix = ValueConstant(u"dsAttrTypeStandard:NameSuffix")
    # URL = ValueConstant(u"dsAttrTypeStandard:URL")
    # URLForNSL = ValueConstant(u"dsAttrTypeStandard:URLForNSL")
    # VFSOpts = ValueConstant(u"dsAttrTypeStandard:VFSOpts")

    # # Other fields
    # AdminStatus = ValueConstant(u"dsAttrTypeStandard:AdminStatus")
    # Alias = ValueConstant(u"dsAttrTypeStandard:Alias")
    # AuthCredential = ValueConstant(u"dsAttrTypeStandard:AuthCredential")
    # CopyTimestamp = ValueConstant(u"dsAttrTypeStandard:CopyTimestamp")
    # DateRecordCreated = ValueConstant(u"dsAttrTypeStandard:DateRecordCreated")
    # KerberosRealm = ValueConstant(u"dsAttrTypeStandard:KerberosRealm")
    # NTDomainComputerAccount = ValueConstant(u"dsAttrTypeStandard:NTDomainComputerAccount")
    # OriginalHomeDirectory = ValueConstant(u"dsAttrTypeStandard:OriginalHomeDirectory")
    # OriginalNFSHomeDirectory = ValueConstant(u"dsAttrTypeStandard:OriginalNFSHomeDirectory")
    # OriginalNodeName = ValueConstant(u"dsAttrTypeStandard:OriginalNodeName")
    # PrimaryNTDomain = ValueConstant(u"dsAttrTypeStandard:PrimaryNTDomain")
    # PwdAgingPolicy = ValueConstant(u"dsAttrTypeStandard:PwdAgingPolicy")
    # RARA = ValueConstant(u"dsAttrTypeStandard:RARA")
    # ReadOnlyNode = ValueConstant(u"dsAttrTypeStandard:ReadOnlyNode")
    # RecordImage = ValueConstant(u"dsAttrTypeStandard:RecordImage")
    # SMBGroupRID = ValueConstant(u"dsAttrTypeStandard:SMBGroupRID")
    # TimePackage = ValueConstant(u"dsAttrTypeStandard:TimePackage")
    # TotalSize = ValueConstant(u"dsAttrTypeStandard:TotalSize")
    # AllNames = ValueConstant(u"dsAttrTypeStandard:AllNames")
    # AuthMethod = ValueConstant(u"dsAttrTypeStandard:AuthMethod")
    # NodePath = ValueConstant(u"dsAttrTypeStandard:NodePath")
    # PlugInInfo = ValueConstant(u"dsAttrTypeStandard:PlugInInfo")
    # RecordAlias = ValueConstant(u"dsAttrTypeStandard:RecordAlias")
    # Scheama = ValueConstant(u"dsAttrTypeStandard:Scheama")
    # SetPasswdMethod = ValueConstant(u"dsAttrTypeStandard:SetPasswdMethod")
    # SubNodes = ValueConstant(u"dsAttrTypeStandard:SubNodes")
    # AppleMetaAliasSource = ValueConstant(u"dsAttrTypeStandard:AppleMetaAliasSource")
    # AppleMetaAliasTarget = ValueConstant(u"dsAttrTypeStandard:AppleMetaAliasTarget")
    # NetGroupTriplet = ValueConstant(u"dsAttrTypeStandard:NetGroupTriplet")
    # SearchPolicy = ValueConstant(u"dsAttrTypeStandard:SearchPolicy")
    # NSPSearchPath = ValueConstant(u"dsAttrTypeStandard:NSPSearchPath")
    # LSPSearchPath = ValueConstant(u"dsAttrTypeStandard:LSPSearchPath")
    # CSPSearchPath = ValueConstant(u"dsAttrTypeStandard:CSPSearchPath")

    @classmethod
    def fromFieldName(cls, fieldName):
        if not hasattr(cls, "_attributesByFieldName"):
            cls._attributesByFieldName = dict((
                (attribute.fieldName, attribute)
                for attribute in cls.iterconstants()
                if hasattr(attribute, "fieldName")
            ))

        return cls._attributesByFieldName.get(fieldName, None)


class ODMatchType(Values):
    any = ValueConstant(0x0001)
    any.queryString = u"({notOp}{attribute}=*)"

    equals = ValueConstant(0x2001)
    equals.matchType = MatchType.equals
    equals.queryString = u"({notOp}{attribute}={value})"

    startsWith = ValueConstant(0x2002)
    startsWith.matchType = MatchType.startsWith
    startsWith.queryString = u"({notOp}{attribute}={value}*)"

    endsWith = ValueConstant(0x2003)
    endsWith.matchType = MatchType.endsWith
    endsWith.queryString = u"({notOp}{attribute}=*{value})"

    contains = ValueConstant(0x2004)
    contains.matchType = MatchType.contains
    contains.queryString = u"({notOp}{attribute}=*{value}*)"

    lessThan = ValueConstant(0x2005)
    lessThan.matchType = MatchType.lessThan
    lessThan.queryString = u"({notOp}{attribute}<{value})"

    greaterThan = ValueConstant(0x2006)
    greaterThan.matchType = MatchType.greaterThan
    greaterThan.queryString = u"({notOp}{attribute}>{value})"

    lessThanOrEqualTo = ValueConstant(0x2007)
    lessThanOrEqualTo.matchType = MatchType.lessThanOrEqualTo
    lessThanOrEqualTo.queryString = u"({notOp}{attribute}<={value})"

    greaterThanOrEqualTo = ValueConstant(0x2008)
    greaterThanOrEqualTo.matchType = MatchType.greaterThanOrEqualTo
    greaterThanOrEqualTo.queryString = u"({notOp}{attribute}>={value})"

    compound = ValueConstant(0x210B)

    @classmethod
    def fromMatchType(cls, matchType):
        if not hasattr(cls, "_matchTypeByMatchType"):
            cls._matchTypeByMatchType = dict((
                (matchType.matchType, matchType)
                for matchType in cls.iterconstants()
                if hasattr(matchType, "matchType")
            ))

        return cls._matchTypeByMatchType.get(matchType, None)


class ODAuthMethod(Values):
    digestMD5 = ValueConstant(u"dsAuthMethodStandard:dsAuthNodeDIGEST-MD5")
