#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class OpenDirectory
#-------------------------------------------------------------------------

  @@requests = nil

  ODQSearchTypeUsers            = 1                       # Update/query for users by specified attribute
  ODQSearchTypeGroups           = 2                       # Update/query for groups by specified attribute
  # ODQSearchTypeParentMembership = 3                       # Update/query for groups by specified attribute (recurses on PARENTS)
  # ODQSearchTypeChildMembership  = 4                       # Update/query for groups by specified attribute (recurses on CHILDREN)
  ODQSearchTypeFilterUsers      = 5                       # Update/query for users by search term applied to predefined fields
  ODQSearchTypeFilterGroups     = 6                       # Update/query for groups by search term applied to predefined fields

  # MDS: I would like to kill ODQSearchTypeParentMembership because it's no longer used and not optimal. If we need this capability,
  # we should consider instead hooking into the OD membership APIs.

  # --------------------------------------------------------------------------------------------
  # Constants from the various DirectoryService/OpenDirectory Obj-C header files are listed here
  # --------------------------------------------------------------------------------------------
  ODMatchAny                      = 0x0001
  ODMatchEqualTo                  = 0x2001                #eDSExact (all of these from CFOpenDirectoryConsts.h)
  ODMatchBeginsWith               = 0x2002                #eDSStartsWith
  ODMatchEndsWith                 = 0x2003                #eDSEndsWith
  ODMatchContains                 = 0x2004                #eDSContains
  ODMatchInsensitiveEqualTo       = 0x2101                #eDSiExact
  ODMatchInsensitiveBeginsWith    = 0x2102                #eDSiStartsWith
  ODMatchInsensitiveEndsWith      = 0x2103                #eDSiEndsWith
  ODMatchInsensitiveContains      = 0x2104                #eDSiContains
  ODMatchGreaterThan              = 0x2006                #eDSGreaterThan
  ODMatchLessThan                 = 0x2007                #eDSLessThan
  ODMatchCompoundExpression       = 0x200B                #eDSCompoundExpression

  # User Record attribute constants from DirectoryServices framework: DirServicesConst.h
  DS1AttrGeneratedUID             = 'dsAttrTypeStandard:GeneratedUID'
  DSNAttrRecordName               = 'dsAttrTypeStandard:RecordName'

  AdminGroupGUID                  = 'ABCDEFAB-CDEF-ABCD-EFAB-CDEF00000050'
  DeviceMgrAccessGroupName        = 'com.apple.access_devicemanagement'
  TooManyResultsGUID              = '98765432-1010-ABCD-0123-456789010101'      # Special GUID we return that means there were more results found than could/should be displayed

  #-------------------------------------------------------------------------

  def self.immediate_query(search_type, attribute, match_type, query_value)
    return nil unless search_type && match_type && query_value && !query_value.empty?

    query = { :search_type => search_type, :match_type => match_type, :query_values => query_value }
    query[:attribute] = attribute if attribute  # This doesn't have to be set
    result = MDMUtilities.send_devicemgrd_request({ :command => 'od_query_immediate', :query => query })

    return (result && result['result'] == 'ok' && result['found'])
  end # self.immediate_query

  #-------------------------------------------------------------------------

  def self.queue_query(search_type, attribute, match_type, query_value)
    return unless search_type && match_type && !query_value.empty?
    conn = ActiveRecord::Base.connection

    attribute = (attribute.empty? ? 'NULL' : "'#{conn.quote_string(attribute)}'")

    if query_value.is_a?(Array)
      values = []
      query_value.each { |q| values.push("(#{Integer(search_type)},#{Integer(match_type)},#{attribute},'#{conn.quote_string(q)}')") unless q.empty? }
      values = values.join(',')
    elsif query_value.is_a?(String)
      values = "(#{Integer(search_type)},#{Integer(match_type)},#{attribute},'#{conn.quote_string(query_value)}')"
    else
      values = nil
    end

    conn.execute("INSERT INTO od_searches (search_type, match_type, attribute, query_value) VALUES #{values}") unless values.empty?
  end # self.queue_query

#-------------------------------------------------------------------------
end # class OpenDirectory
#-------------------------------------------------------------------------
