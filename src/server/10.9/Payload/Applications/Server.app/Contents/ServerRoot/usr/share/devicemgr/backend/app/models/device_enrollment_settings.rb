#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class DeviceEnrollmentSettings < ActiveRecord::Base
  
  #-------------------------------------------------------------------------

  def self.table_name
    return 'device_enrollment_settings'
  end

  #-------------------------------------------------------------------------

  def self.update_device_enrollment_settings(library_item, settings)
    
    li_id = library_item.id

    # The only setting we support is allow activation lock
    allow_activation_lock = settings['allow_activation_lock']

    if allow_activation_lock
      sql = <<-SQL
        SELECT dm_update_device_enrollment_settings (#{li_id}, '#{allow_activation_lock}')
      SQL
      self.connection.execute(sql)
    end
    
  end

  #-------------------------------------------------------------------------

  def self.get_device_enrollment_settings(library_item)    
    fn = library_item.is_a?(User) ? 'dm_device_enrollment_settings_for_user' : 'dm_device_enrollment_settings_for_user_group'
    sql = "SELECT #{fn}(#{library_item.id}) AS id"
    results = self.connection.select_integer_values_by_index(sql)
    if results && results.length == 1
      rv = {}
      settings = DeviceEnrollmentSettings.find(:first, :conditions => {:id => results[0]})
      rv['allow_activation_lock'] = settings[:allow_activation_lock]
      rv['owned_by'] = settings[:library_item_id]
      return rv
    end    
  end

  #-------------------------------------------------------------------------

  def before_save
    raise "DeviceEnrollmentSettings#before_save: read only!"
  end

  #-------------------------------------------------------------------------

  def delete
    raise "DeviceEnrollmentSettings#delete: read only!"
  end

  #-------------------------------------------------------------------------

  def destroy
    raise "DeviceEnrollmentSettings#destroy: read only!"
  end

  #-------------------------------------------------------------------------

  include MDMRecordBase
  
end # DeviceEnrollmentSettings
