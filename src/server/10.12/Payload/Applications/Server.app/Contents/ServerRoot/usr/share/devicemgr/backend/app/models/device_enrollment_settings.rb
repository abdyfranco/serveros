#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class DeviceEnrollmentSettings < ActiveRecord::Base
#-------------------------------------------------------------------------

  def self.table_name;  return 'device_enrollment_settings';  end

  #-------------------------------------------------------------------------

  def self.sanitize_al_setting(setting)
    return setting.empty? ? 'Never' : setting
  end

  #-------------------------------------------------------------------------

  def self.update_device_enrollment_settings(library_item, settings)
    des = DeviceEnrollmentSettings.find_by_library_item_id(library_item.id)
    if not des
      des = DeviceEnrollmentSettings.new
      des.library_item_id = library_item.id
    end

    des.allow_activation_lock = self.sanitize_al_setting(settings['allow_activation_lock'])
    des.dep_unsupervised_activation_lock = self.sanitize_al_setting(settings['dep_unsupervised_activation_lock'])
    des.dep_supervised_activation_lock = self.sanitize_al_setting(settings['dep_supervised_activation_lock'])

    des.set_device_name = settings['set_device_name']
    des.device_name_value = settings['device_name_value']

    des.save
  end # self.update_device_enrollment_settings

  #-------------------------------------------------------------------------

  def self.get_device_enrollment_settings(library_item)
    if library_item.is_a?(User)
      fn = 'dm_device_enrollment_settings_for_user'
    elsif library_item.is_a?(UserGroup)
      fn = 'dm_device_enrollment_settings_for_user_group'
    elsif library_item.is_a?(DeviceGroup)
      fn = 'dm_device_enrollment_settings_for_device_group'
    elsif library_item.is_a?(Device)
      fn = 'dm_device_enrollment_settings_for_device'
    end

    results = self.connection.select_integer_values_by_index("SELECT #{fn}(#{library_item.id}) AS id")
    return nil if results.empty?

    return DeviceEnrollmentSettings::get_attributes_for_multiple_by_id(results[0])[0]
  end # self.get_device_enrollment_settings

  #-------------------------------------------------------------------------

  def before_save
      # make the related library item active, just the first time
      self.connection.execute("SELECT dm_make_library_item_active (#{self.library_item_id})") if self.id.nil?
      return true
  end

  #-------------------------------------------------------------------------

  include MDMDynamicAttributes  # Must include before MDMRecordBase
  include MDMRecordBase

#-------------------------------------------------------------------------
end # class DeviceEnrollmentSettings
#-------------------------------------------------------------------------
