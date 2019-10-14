#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class AutoJoinProfile < ActiveRecord::Base

  has_and_belongs_to_many :device_groups              # get_related_device_groups_ids

  #-------------------------------------------------------------------------

  def self.table_name
    return 'auto_join_profiles'
  end

  #-------------------------------------------------------------------------

  def get_related_device_groups_ids
    sql = <<-SQL
      SELECT device_group_id FROM auto_join_profiles_device_groups WHERE auto_join_profile_id = #{self.id}
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    usage = AutoJoinProfileUsage.find(:all, :conditions => ['auto_join_profile_id = ?', self.id], :order => 'created_at DESC')
    attr_hash['usage_log']     = usage.collect { |u| u.get_attributes }
    attr_hash['device_groups'] = self.get_related_device_groups_ids
    return attr_hash
  end

  #-------------------------------------------------------------------------

  include MDMRecordBase
end
