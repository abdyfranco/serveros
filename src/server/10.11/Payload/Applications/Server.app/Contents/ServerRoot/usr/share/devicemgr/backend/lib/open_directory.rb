#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class OpenDirectory

  @@requests = nil

  ODQSearchTypeUsersByODQuery   = 1                       # Update/query for users by specified attribute
  ODQSearchTypeGroupsByODQuery  = 2                       # Update/query for groups by specified attribute
  # ODQSearchTypeParentMembership = 3                     # Update/query for groups by specified attribute (recurses on PARENTS)
  ODQSearchTypeChildMembership  = 4                       # Update/query for groups by specified attribute (recurses on CHILDREN)
  ODQSearchTypeFilterUsers      = 5                       # Update/query for users by search term applied to predefined fields
  ODQSearchTypeFilterGroups     = 6                       # Update/query for groups by search term applied to predefined fields

  # MDS: I would like to kill ODQSearchTypeParentMembership because it's no longer used and not optimal. If we need this capability,
  # we should consider instead hooking into the OD membership APIs.

  # --------------------------------------------------------------------------------------------
  # Constants from the various DirectoryService/OpenDirectory Obj-C header files are listed here
  #
  # TODO: We should enable 'BridgeSupport' for the frameworks we require constants from,
  # but we've not been able to do that yet.
  # --------------------------------------------------------------------------------------------
  ODNodeTypeLocalNodes            = 0x2200
  ODTypeAuthenticationSearchNode  = 0x2201                # node type for the OD authentication search node (from CFOpenDirectoryConsts.h)
  ODTypeContactSearchNode         = 0x2204                # node type for the OD contacts search node (from CFOpenDirectoryConsts.h)

  ODMatchAny                      = 0x0001
  ODMatchEqualTo                  = 0x2001			          #eDSExact (all of these from CFOpenDirectoryConsts.h)
  ODMatchBeginsWith               = 0x2002			          #eDSStartsWith
  ODMatchEndsWith                 = 0x2003			          #eDSEndsWith
  ODMatchContains                 = 0x2004			          #eDSContains
  ODMatchInsensitiveEqualTo       = 0x2101			          #eDSiExact
  ODMatchInsensitiveBeginsWith    = 0x2102			          #eDSiStartsWith
  ODMatchInsensitiveEndsWith      = 0x2103			          #eDSiEndsWith
  ODMatchInsensitiveContains      = 0x2104			          #eDSiContains
  ODMatchGreaterThan              = 0x2006			          #eDSGreaterThan
  ODMatchLessThan                 = 0x2007			          #eDSLessThan
  ODMatchCompoundExpression       = 0x200B                #eDSCompoundExpression

  # Record type constants from DirectoryServices framework: DirServicesConst.h
  DSStdRecordTypeUsers					  = 'dsRecTypeStandard:Users'
  DSStdRecordTypeGroups					  = 'dsRecTypeStandard:Groups'
  DSStdRecordTypeComputers        = 'dsRecTypeStandard:Computers'
  DSStdRecordTypeComputerGroups   = 'dsRecTypeStandard:ComputerGroups'


  # User Record attribute constants from DirectoryServices framework: DirServicesConst.h
  DS1AttrGeneratedUID             = 'dsAttrTypeStandard:GeneratedUID'
  DSNAttrRecordName						    = 'dsAttrTypeStandard:RecordName'
  DS1AttrRealName	                = 'dsAttrTypeStandard:RealName'
  DS1AttrFirstName						    = 'dsAttrTypeStandard:FirstName'
  DS1AttrLastName						      = 'dsAttrTypeStandard:LastName'
  DSNAttrEMailAddress					    = 'dsAttrTypeStandard:EMailAddress'
  DSNAttrJPEGPhoto  					    = 'dsAttrTypeStandard:JPEGPhoto'
  DSNAttrJobTitle  					      = 'dsAttrTypeStandard:JobTitle'
  DSNAttrMobileNumber  				    = 'dsAttrTypeStandard:MobileNumber'
  DS1AttrUniqueID                 = 'dsAttrTypeStandard:UniqueID'
  DSNAttrDistinguishedName        = 'dsAttrTypeNative:distinguishedName'

  # User Group Record specific attribute constants
  DSNAttrGroupMembership          = "dsAttrTypeStandard:GroupMembership"
  DSNAttrGroupMembers             = "dsAttrTypeStandard:GroupMembers"
  DS1AttrPrimaryGroupID           = "dsAttrTypeStandard:PrimaryGroupID"
  DSNAttrNestedGroups             = "dsAttrTypeStandard:NestedGroups"

  # Identifies the kind of record, needed for GroupMembership parsing
  DSNAttrTypeMember               = "dsAttrTypeNative:member"
  DSNodeLocation                  = "dsAttrTypeStandard:AppleMetaNodeLocation"

  # Computer Record specific attribute constants
  DSNAttrENetAddress              = "dsAttrTypeStandard:ENetAddress"

  # MCX specific attribute constants
  DSNAttrMCXSettings              = "dsAttrTypeStandard:MCXSettings"

  AdminGroupGUID                  = 'ABCDEFAB-CDEF-ABCD-EFAB-CDEF00000050'
  DeviceMgrAccessGroupName        = 'com.apple.access_devicemanagement'
  TooManyResultsGUID              = '98765432-1010-ABCD-0123-456789010101'      # Special GUID we return that means there were more results found than could/should be displayed

  AttributeToShortName = {"dsAttrTypeStandard:GeneratedUID"    => "guid",
                          "dsAttrTypeStandard:RecordName"      => "short_name",
                          "dsAttrTypeStandard:RealName"        => "full_name",
                          "dsAttrTypeStandard:FirstName"       => "first_name",
                          "dsAttrTypeStandard:LastName"        => "last_name",
                          "dsAttrTypeStandard:EMailAddress"    => "email",
                          "dsAttrTypeStandard:JPEGPhoto"       => "jpeg_data",
                          "dsAttrTypeStandard:JobTitle"        => "job_title",
                          "dsAttrTypeStandard:MobileNumber"    => "mobile_phone",
                          "dsAttrTypeStandard:GroupMembership" => "group_membership",
                          "dsAttrTypeStandard:GroupMembers"    => "group_members",
                          "dsAttrTypeStandard:PrimaryGroupID"  => "primary_group_id",
                          "dsAttrTypeStandard:UniqueID"        => "uid",
                          "dsAttrTypeStandard:NestedGroups"    => "sub_groups",
                          "dsAttrTypeStandard:MCXSettings"     => "mcx_settings",
                          "dsAttrTypeStandard:ENetAddress"     => "enet_address"}

  ShortNameToAttribute = {"guid"             => "dsAttrTypeStandard:GeneratedUID",
                          "short_name"       => "dsAttrTypeStandard:RecordName",
                          "full_name"        => "dsAttrTypeStandard:RealName",
                          "first_name"       => "dsAttrTypeStandard:FirstName",
                          "last_name"        => "dsAttrTypeStandard:LastName",
                          "email"            => "dsAttrTypeStandard:EMailAddress",
                          "jpeg_data"        => "dsAttrTypeStandard:JPEGPhoto",
                          "job_title"        => "dsAttrTypeStandard:JobTitle",
                          "mobile_phone"     => "dsAttrTypeStandard:MobileNumber",
                          "group_membership" => "dsAttrTypeStandard:GroupMembership",
                          "group_members"    => "dsAttrTypeStandard:GroupMembers",
                          "primary_group_id" => "dsAttrTypeStandard:PrimaryGroupID",
                          "uid"              => "dsAttrTypeStandard:UniqueID",
                          "sub_groups"       => "dsAttrTypeStandard:NestedGroups",
                          "mcx_settings"     => "dsAttrTypeStandard:MCXSettings",
                          "enet_address"     => "dsAttrTypeStandard:ENetAddress"}

  #-------------------------------------------------------------------------

  def self.immediate_query(search_type, attribute, match_type, query_value)
    return nil unless search_type && match_type && query_value && !query_value.empty?

    query = { :search_type => search_type, :match_type => match_type, :query_values => query_value }
    query[:attribute] = attribute if attribute  # This doesn't have to be set
    result = MDMUtilities.send_devicemgrd_request({ :command => 'od_query_immediate', :query => query })

    return (result && result['result'] == 'ok' && result['found'])
  end

  #-------------------------------------------------------------------------

  def self.membership_check(guid)
    return nil unless guid

    query = { :uuid => guid }
    result = MDMUtilities.send_devicemgrd_request({ :command => 'od_member_check', :query => query })

    return (result && result['result'] == 'ok' && result['isMember'])
  end

  #-------------------------------------------------------------------------

  def self.queue_query(search_type, attribute, match_type, query_value)
    return unless search_type && match_type && query_value && !query_value.empty?
    conn = ActiveRecord::Base.connection

    if attribute.nil?
      attribute = "NULL"
    else
      attribute = "'#{conn.quote_string(attribute)}'"
    end

    if query_value.is_a?(Array)
      values = query_value.collect { |q| "(#{Integer(search_type)},#{Integer(match_type)},#{attribute},'#{conn.quote_string(q)}')" }
      values = values.join(',')
    elsif query_value.is_a?(String)
      values = "(#{Integer(search_type)},#{Integer(match_type)},#{attribute},'#{conn.quote_string(query_value)}')"
    else
      return
    end

    conn.execute("INSERT INTO od_searches (search_type,match_type,attribute,query_value) VALUES #{values}")
  end

  # # --------------------------------------------------------------------------------------------
  #
  # def self.integer_value_for_multi_attribute(value)
  #   return Integer(require_value_for_multi_attribute(value))
  # end
  #
  # # --------------------------------------------------------------------------------------------
  #
  # def self.require_value_for_multi_attribute(value)
  #   raise "Invalid multi-attribute value: nil" unless value
  #   val = self.value_for_multi_attribute(value)
  #   raise "Invalid value #{(val ? '""' : 'nil')} for multi-attribute '#{value}'" unless val && val != ''
  #   return val
  # end
  #
  # # --------------------------------------------------------------------------------------------
  #
  # def self.value_for_multi_attribute(value)
  #   return value.to_s unless value.class == OSX::NSArray
  #   return nil unless value.count > 0
  #   if value[0].instance_of? OSX::NSMutableData
  #     # THIS WORKS; don't break it -- it converts the hex representation from NSMutableData into base64
  #     return ActiveSupport::Base64.encode64s(value[0].to_s[1..-2].tr(' ','').scan(/../).map{|pair| pair.hex.chr}.join())
  #     # return ActiveSupport::Base64.encode64s(OSX::NSString.alloc.initWithData_encoding(value[0], OSX::NSUnicodeStringEncoding))
  #   else
  #     return value[0].to_s
  #   end
  # end
  #
  # # --------------------------------------------------------------------------------------------
  #
  # def self.collect_unique_filtered_users(raw_results, collected_users, filter_guids, max_results)
  #   collected_users ||= {}
  #   return collected_users unless raw_results
  #
  #   raw_results.each { |user_record|
  #     begin
  #       next if self.hide_user_record?(user_record)
  #
  #       guid = require_value_for_multi_attribute(user_record.valueForKey(DS1AttrGeneratedUID))
  #       next if collected_users.include?(guid) || (filter_guids && !filter_guids.include?(guid))
  #
  #       name = user_record.valueForKey(DS1AttrRealName)
  #       name = user_record.valueForKey(DSNAttrRecordName) unless name && name.length > 0
  #       collected_users[guid] = require_value_for_multi_attribute(name)
  #     rescue Exception => e
  #       Rails.logger.error("collect_unique_filtered_users: ignoring invalid record #{user_record} (#{e.message})")
  #     end
  #
  #     break if collected_users.length >= max_results
  #   }
  #   return collected_users
  # end
  #
  # # --------------------------------------------------------------------------------------------
  #
  # def self.get_searchable_directory_user_details_for_guid(guid)
  #     # only include attributes that are searchable. DS1AttrFirstName and DS1AttrLastName are ignored assuming most of the directory systems use FullName only.
  #     # (TODO) - assumption to be confirmed.
  #     return_attrs = [DS1AttrRealName, DSNAttrRecordName, DSNAttrEMailAddress,  DSNAttrJobTitle, DSNAttrMobileNumber]
  #     return self.get_directory_user_attrs_for_guid(guid, return_attrs)
  # end
  #
  # --------------------------------------------------------------------------------------------
  #
  # def self.get_directory_user_attrs_for_guid(guid, attrs)
  #   session = OSX::ODSession.defaultSession
  #   contact_search_node = OSX::ODNode.nodeWithSession_type_error(session, ODTypeAuthenticationSearchNode, nil)
  #   query = OSX::ODQuery.queryWithNode_forRecordTypes_attribute_matchType_queryValues_returnAttributes_maximumResults_error(contact_search_node,
  #                           DSStdRecordTypeUsers, DS1AttrGeneratedUID, ODMatchEqualTo, guid, attrs, 1, nil)
  #   raw_results = query.resultsAllowingPartial_error(false, nil)
  #
  #   results_hash = {}
  #   if raw_results.count == 1
  #     attrs.each { |attribute| results_hash[AttributeToShortName[attribute]] = value_for_multi_attribute(raw_results[0].valueForKey(attribute)) }
  #   end
  #   return results_hash
  # end
  #
  # # --------------------------------------------------------------------------------------------
  #
  # # We need this to look up the GUID for the everyone group in a couple of places
  # def self.get_directory_user_group_details_for_record_name(user_group_record_name, node=ODTypeAuthenticationSearchNode)
  #   return_attrs = [DS1AttrGeneratedUID, DSNAttrRecordName, DSNAttrGroupMembership, DSNAttrGroupMembers, DS1AttrPrimaryGroupID, DS1AttrRealName]
  #   session = OSX::ODSession.defaultSession
  #   contact_search_node = OSX::ODNode.nodeWithSession_type_error(session, node, nil)
  #   query = OSX::ODQuery.queryWithNode_forRecordTypes_attribute_matchType_queryValues_returnAttributes_maximumResults_error(contact_search_node,
  #                           DSStdRecordTypeGroups, DSNAttrRecordName, ODMatchEqualTo, user_group_record_name, return_attrs, 1, nil)
  #   raw_results = query.resultsAllowingPartial_error(false, nil)
  #
  #   return nil unless raw_results.count == 1
  #
  #   results_hash = {}
  #   return_attrs.each { |attribute| results_hash[AttributeToShortName[attribute]] = value_for_multi_attribute(raw_results[0].valueForKey(attribute)) }
  #   return results_hash
  # end
  #
  # # --------------------------------------------------------------------------------------------
  # protected
  # # --------------------------------------------------------------------------------------------
  #
  # def self.get_user_and_group_member_guids_from_ad_group(group, search_node, max_results = 1000)
  #   # We need to lookup all these members as they could be either a user or a group
  #   # Put the member record's GUID into either user_guids or group_guids based on the type of record we found
  #   user_guids  = []
  #   group_guids = []
  #   entry_array = group.valueForKey(DSNAttrTypeMember)    # entry_array is class OSX::NSArray, not a ruby Array!!!
  #   use_dist_name = (entry_array && entry_array.length > 0)
  #   entry_array = group.valueForKey(DSNAttrGroupMembership) unless use_dist_name
  #
  #   if entry_array
  #     # Map the member names found into proper record names we can search for
  #     member_names = entry_array.map { |mbr|
  #       mbr = mbr.to_s
  #       idx = mbr.index('\\')
  #       (idx ? mbr[idx+1..-1] : mbr)  # idx != nil --> AD member, just take the part after the backslash
  #     }
  #
  #     search_attr = (use_dist_name ? DSNAttrDistinguishedName : DSNAttrRecordName)
  #
  #     # Now query users and groups for all these member names to get their GUIDs
  #     user_and_group_type = [DSStdRecordTypeUsers, DSStdRecordTypeGroups]
  #     query = OSX::ODQuery.queryWithNode_forRecordTypes_attribute_matchType_queryValues_returnAttributes_maximumResults_error(search_node,
  #                     user_and_group_type, search_attr, ODMatchEqualTo, member_names, [DS1AttrUniqueID, DS1AttrGeneratedUID, DSNAttrRecordName, DS1AttrRealName], max_results, nil)
  #     mbr_raw_results = query.resultsAllowingPartial_error(false, nil)
  #     if mbr_raw_results
  #       # Sort the results into users and groups
  #       raw_users = []
  #       mbr_raw_results.each { |mbr|    # mbr is an ODRecord object
  #         mbr_type = mbr.recordType
  #         if mbr_type == DSStdRecordTypeUsers
  #           raw_users.push(mbr)
  #         else
  #           begin
  #             group_guids.push(require_value_for_multi_attribute(mbr.valueForKey(DS1AttrGeneratedUID)))
  #           rescue Exception => e
  #             Rails.logger.error("get_user_and_group_member_guids_from_ad_group: ignoring invalid record #{mbr} (#{e.message})")
  #           end
  #         end
  #       }
  #
  #       # Filter the users
  #       filtered_users = self.collect_unique_filtered_users(raw_users, {}, nil, max_results)   # Returns a hash of guids => distinguished name
  #       user_guids = filtered_users.keys  # We just need the guids
  #     end
  #   end
  #
  #   return user_guids, group_guids
  # end
  #
  # # --------------------------------------------------------------------------------------------
  #
  # def self.hide_user_record?(record)
  #   begin
  #     uid  = integer_value_for_multi_attribute(record.valueForKey(DS1AttrUniqueID))
  #     return true if uid < 500
  #
  #     short_name = require_value_for_multi_attribute(record.valueForKey(DSNAttrRecordName))
  #     return true if short_name == "diradmin" || short_name.start_with?("_")
  #   rescue Exception => e
  #     Rails.logger.error("hide_user_record?: ignoring invalid record #{record} (#{e.message})")
  #   end
  #
  #   return false
  # end
  #
  # # --------------------------------------------------------------------------------------------
  #
  # def self.record_from_ad?(record)
  #   loc = self.value_for_multi_attribute(record.valueForKey(DSNodeLocation))
  #   return loc.start_with?('/Active Directory')
  # end
  #
  # # --------------------------------------------------------------------------------------------

end
