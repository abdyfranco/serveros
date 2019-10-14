#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class AutoJoinProfile < ActiveRecord::Base

  #-------------------------------------------------------------------------

  def self.table_name
    return 'auto_join_profiles'
  end

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    usage = AutoJoinProfileUsage.find(:all, :conditions => ['auto_join_profile_id = ?', self.id], :order => 'created_at DESC')
    attr_hash['usage_log'] = usage.collect { |u| u.get_attributes }
    return attr_hash
  end

  #-------------------------------------------------------------------------

  include MDMRecordBase
end
