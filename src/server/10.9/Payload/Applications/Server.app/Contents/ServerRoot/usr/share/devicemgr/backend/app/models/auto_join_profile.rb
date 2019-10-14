#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class AutoJoinProfile < ActiveRecord::Base

  serialize :usage_log, Array

  #-------------------------------------------------------------------------

  def self.table_name
    return "auto_join_profiles"
  end

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    usage_log = attr_hash.delete("usage_log")
    
    if usage_log
      usage_instances = []
      usage_log.each { |instance| 
       sql = <<-SQL 
        SELECT  "DeviceName"
        FROM    devices 
        WHERE   "SerialNumber" ILIKE '#{instance["SERIAL"]}'
       SQL
       name = self.connection.select_value(sql)

       hash = {}
       hash["DEVICE_NAME"] = name
       hash["SERIAL"] = instance["SERIAL"]
       hash["PRODUCT"] = instance["PRODUCT"]
       hash["OUR_OWN_TIMESTAMP"] = instance["OUR_OWN_TIMESTAMP"]
       usage_instances.push(hash)
      }

      attr_hash["usage_log"] = usage_instances
    end

    return attr_hash
  end

  #-------------------------------------------------------------------------

  include MDMRecordBase
end
