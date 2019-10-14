#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
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

  def self.update_device_enrollment_settings(library_item, settings)
    allow_activation_lock                   = settings['allow_activation_lock']
    dep_unsupervised_activation_lock        = settings['dep_unsupervised_activation_lock']
    dep_supervised_activation_lock          = settings['dep_supervised_activation_lock']
    allow_activation_lock                   = 'Never' if allow_activation_lock.empty?
    dep_unsupervised_activation_lock        = 'Never' if dep_unsupervised_activation_lock.empty?
    dep_supervised_activation_lock          = 'Never' if dep_supervised_activation_lock.empty?

    conn = self.connection
    conn.execute("SELECT dm_update_device_enrollment_settings (#{library_item.id}, '#{conn.quote_string(allow_activation_lock)}', '#{conn.quote_string(dep_unsupervised_activation_lock)}', '#{conn.quote_string(dep_supervised_activation_lock)}')")
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

    rv = {}
    settings = DeviceEnrollmentSettings.find(:first, :conditions => {:id => results[0]})
    rv['allow_activation_lock']            = settings[:allow_activation_lock]
    rv['dep_unsupervised_activation_lock'] = settings[:dep_unsupervised_activation_lock]
    rv['dep_supervised_activation_lock']   = settings[:dep_supervised_activation_lock]
    rv['owned_by'] = settings[:library_item_id]
    return rv
  end # self.get_device_enrollment_settings

  #-------------------------------------------------------------------------

  def before_save;  raise 'DeviceEnrollmentSettings#before_save: read only!'; end
  def delete;       raise 'DeviceEnrollmentSettings#delete: read only!';      end
  def destroy;      raise 'DeviceEnrollmentSettings#destroy: read only!';     end

  #-------------------------------------------------------------------------

  include MDMRecordBase

#-------------------------------------------------------------------------
end # class DeviceEnrollmentSettings
#-------------------------------------------------------------------------
