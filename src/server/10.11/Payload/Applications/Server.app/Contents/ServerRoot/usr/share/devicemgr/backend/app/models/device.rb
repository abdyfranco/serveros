#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class Device < ActiveRecord::Base
#-------------------------------------------------------------------------

#  has_one :library_item_metadata
  belongs_to :user                                    # ITFK - user_id          get_related_user_ids
  belongs_to :pending_user, :class_name => 'User'     # ITFK - pending_user_id
  has_and_belongs_to_many :device_groups              #                         get_related_device_groups_ids

  serialize :dep_profile,   Hash

  @@admin_required_attributes = [ 'DeviceName', 'user_id', 'SerialNumber', 'udid', 'IMEI', 'MEID', 'DeviceID', 'last_checkin_time', 'ProductName',
                                  'profile', 'identifier', 'is_mac', 'vpp_last_invite_requested', 'vpp_last_invite_delivered', 'airplay_password', 'enrollment_state', 'is_dep_device' ]

  # These are attributes we strip out in modify_attributes
  BAD_ATTRIBUTES = ['active_checkin_token', 'pending_checkin_token', 'checkin_token_valid_at', 'token', 'unlock_token', 'push_magic']

  # Do not change these associations unless you intend to rebuild all profile caches
  VALID_SUBSTITUTION_KEYS = { 'DeviceName'    => (1 << 0),   # These must match the Obj-C and SQL code
                              'device_name'   => (1 << 0),  # Alias
                              'ProductName'   => (1 << 1),
                              'product_name'  => (1 << 1),  # Alias
                              'OSVersion'     => (1 << 2),
                              'os_version'    => (1 << 2),  # Alias
                              'version'       => (1 << 2),  # Alias
                              'SerialNumber'  => (1 << 3),
                              'serial_number' => (1 << 3),  # Alias
                              'sn'            => (1 << 3),  # Alias
                              'udid'          => (1 << 4),
                              'UDID'          => (1 << 4),  # Alias
                              'IMEI'          => (1 << 5),
                              'imei'          => (1 << 5),  # Alias
                              'MEID'          => (1 << 6),
                              'meid'          => (1 << 6),  # Alias
                              'BluetoothMAC'  => (1 << 7),
                              'bluetooth_mac' => (1 << 7),  # Alias
                              'EthernetMAC'   => (1 << 8),
                              'ethernet_mac'  => (1 << 8),  # Alias
                              'WiFiMAC'       => (1 << 9),
                              'wifi_mac'      => (1 << 9),  # Alias
                              'DeviceID'      => (1 << 10)
                            }

  # We need to provide aliases for the aliased substitution keys
  def device_name;   return self.DeviceName;    end
  def product_name;  return self.ProductName;   end
  def os_version;    return self.OSVersion;     end
  def version;       return self.OSVersion;     end
  def serial_number; return self.SerialNumber;  end
  def sn;            return self.SerialNumber;  end
  def UDID;          return self.udid;          end
  def imei;          return self.IMEI;          end
  def meid;          return self.MEID;          end
  def bluetooth_mac; return self.BluetoothMAC;  end
  def ethernet_mac;  return self.EthernetMAC;   end
  def wifi_mac;      return self.WiFiMAC;       end

  #-------------------------------------------------------------------------

  def self.table_name;                    return 'devices';                     end
  def self.admin_required_attributes;     return @@admin_required_attributes;   end
  def self.bit_for_substitution_key(key); return VALID_SUBSTITUTION_KEYS[key];  end

  #-------------------------------------------------------------------------

  def self.find_by_SerialNumber(number, opt={})
    number = Device.NormalizeSerialNumber(number)
    return (number.empty? ? nil : Device.find(:first, :conditions => {:SerialNumber => number}))
  end # self.find_by_SerialNumber

  #-------------------------------------------------------------------------

  def self.find_by_udid(number, opt={})
    number = Device.NormalizeUDID(number)
    return (number.empty? ? nil : Device.find(:first, :conditions => {:udid => number}))
  end # self.find_by_udid

  #-------------------------------------------------------------------------

  def self.find_by_IMEI(number, opt={})
    number = Device.NormalizeIMEI(number)
    return (number.empty? ? nil : Device.find(:first, :conditions => {:IMEI => number}))
  end # self.find_by_IMEI

  #-------------------------------------------------------------------------

  def self.find_by_MEID(number, opt={})
    number = Device.NormalizeMEID(number)
    return (number.empty? ? nil : Device.find(:first, :conditions => {:MEID => number}))
  end # self.find_by_MEID

  #-------------------------------------------------------------------------

  def self.find_by_deviceID(number, opt={})
    number = Device.NormalizeMAC(number)
    return (number.empty? ? nil : Device.find(:first, :conditions => {:DeviceID => number}))
  end # self.find_by_deviceID

  #-------------------------------------------------------------------------

  def self.get_all_apple_tv_ids
    sql = <<-SQL
      SELECT   id
      FROM     view_valid_devices                        -- Filters out devices that would return false for valid_device?
      WHERE    "ProductName" ILIKE '%AppleTV%'
      ORDER BY LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end # self.get_all_apple_tv_ids

  #-------------------------------------------------------------------------

  def self.get_all_owner_assignable_device_ids(search_string = nil)
    search = ''
    if search_string
      search = self.connection.quote_string(search_string.gsub(/([_%\|\\])/, '|\1'))    # Escape the special characters in the search string
      Rails.logger.info("Escaped '#{search_string}' to '#{search}'") if MDMLogger.debugOutput?(2)
    end

    sql = <<-SQL
      SELECT  id
      FROM    view_valid_devices  -- Filters out devices that would return false for valid_device?
      WHERE   (   mdm_target_type = 'ios'
               OR id IN (SELECT device_id FROM owner_lab_sessions))
        AND   (   "DeviceName"   ILIKE '%#{search}%' ESCAPE '|'
               OR "SerialNumber" ILIKE '%#{search}%' ESCAPE '|')
      ORDER BY LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end # self.get_all_owner_assignable_device_ids

  #-------------------------------------------------------------------------

  def self.get_all_ids_for_admin(search_string = nil)
    search = ''
    if search_string
      search = self.connection.quote_string(search_string.gsub(/([_%\|\\])/, '|\1'))    # Escape the special characters in the search string
      Rails.logger.info("Escaped '#{search_string}' to '#{search}'") if MDMLogger.debugOutput?(2)
    end

    sql = <<-SQL
      SELECT  id
      FROM    view_valid_devices_with_users                        -- Filters out devices that would return false for valid_device?
      WHERE    "DeviceName"   ILIKE '%#{search}%' ESCAPE '|'
         OR    "SerialNumber" ILIKE '%#{search}%' ESCAPE '|'
         OR    short_name     ILIKE '%#{search}%' ESCAPE '|'
      ORDER BY LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end # self.get_all_ids_for_admin

  #-------------------------------------------------------------------------

  def self.get_all_ids_matching_detailed_for_admin(search_string)
    search = self.connection.quote_string(search_string.gsub(/([_%\|\\])/, '|\1'))    # Escape the special characters in the search string
    Rails.logger.info("Escaped '#{search_string}' to '#{search}'") if MDMLogger.debugOutput?(2)

    sql = <<-SQL
      WITH cte AS (
        SELECT  id, "DeviceName", order_name
        FROM    view_valid_devices                                -- Filters out devices that would return false for valid_device?
        WHERE   "DeviceName"   ILIKE '%#{search}%' ESCAPE '|'
           OR   "SerialNumber" ILIKE '%#{search}%' ESCAPE '|'
           OR   "IMEI"         ILIKE '%#{search}%' ESCAPE '|'
           OR   "MEID"         ILIKE '%#{search}%' ESCAPE '|'
           OR   udid           ILIKE '%#{search}%' ESCAPE '|'
      UNION
        SELECT  d.id, d."DeviceName", d.order_name                -- Union in all the devices owned by users who match the search criteria
        FROM    view_valid_devices AS d
        JOIN    #{User.table_name} AS u ON (d.user_id = u.id)
        WHERE   u.short_name       ILIKE '%#{search}%' ESCAPE '|'
           OR   u.email            ILIKE '%#{search}%' ESCAPE '|'
           OR   u.full_name        ILIKE '%#{search}%' ESCAPE '|'
           OR   u.job_title        ILIKE '%#{search}%' ESCAPE '|'
           OR   u.mobile_phone     ILIKE '%#{search}%' ESCAPE '|'
           OR   u.managed_apple_id ILIKE '%#{search}%' ESCAPE '|'
      )
      SELECT   *
      FROM     cte
      ORDER BY LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end # self.get_all_ids_matching_detailed_for_admin

  #-------------------------------------------------------------------------

  def self.NormalizeIMEI(v);         return (v.empty? ? nil : v.tr('^0-9', '').sub(/([0-9]{2})([0-9]{6})([0-9]{6})([0-9]*)/, '\1 \2 \3 \4'));                                                           end
  def self.NormalizeMAC(v);          return (v.empty? ? nil : v.downcase.tr('^0-9a-f', '').sub(/([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/, '\1:\2:\3:\4:\5:\6')); end
  def self.NormalizeMEID(v);         return (v.empty? ? nil : v.upcase.tr('^0-9A-F', ''));                                                                                                              end
  def self.NormalizeSerialNumber(v); return (v.empty? ? nil : v.upcase.tr('^0-9A-Z', ''));                                                                                                              end
  def self.NormalizeUDID(v);         return (v.empty? ? nil : v.downcase.tr('^0-9a-f', ''));                                                                                                            end

  #-------------------------------------------------------------------------

  def before_save
    self.library_item_type = 'Device' # Rails will attempt to write NULL for things we don't explicitly set on new objects, which causes this column to fail the INSERT
    self.mdm_target_type ||= 'ios'    # This can never be nil, so if it's not otherwise set, use 'ios'
    return true
  end # before_save

  #-------------------------------------------------------------------------

  def bound_device?;    return self.udid && self.token && self.ProductName;   end
  def debug_name;       return "<#{self.class.to_s}:\"#{self.DeviceName}\">"; end
  def device_group_ids; return self.get_related_device_groups_ids;            end

  #-------------------------------------------------------------------------

  def enrollment_state
    singletons = (self.hp_singleton_tasks | self.singleton_task_type)
    return 'wipe_pending'         if (singletons & (1 << 30)) != 0
    return 'unenrollment_pending' if (singletons & (1 << 29)) != 0
    return 'placeholder'          if self.placeholder_device?
    return 'enrolled'
  end # enrollment_state

  #-------------------------------------------------------------------------

  # This function is not used because the decision to show a task in the gear menu is made on the admin side
  # def get_all_device_ids_for_task(task_type)
  #   valid = true
  #   case task_type
  #   when 'ClearPasscode'
  #     metadata = self.library_item_metadata
  #     unlock_token = metadata && metadata['unlock_token']
  #     valid = self.ios? && unlock_token
  #   when 'AllowActivationLock'
  #     valid = (self.ios? && self.IsSupervised)
  #   when 'RemoveActivationLock'
  #     valid = (self.ios? && self.IsSupervised && self.activation_lock_bypass_code)
  #   when 'LogOutUser'
  #     valid = (self.ios? && self.IsSupervised && self.is_multi_user)
  #   end
  #   return (valid ? [ self.id ] : [])
  # end # get_all_device_ids_for_task

  #-------------------------------------------------------------------------

  # These are just for compatibility with the other Library objects
  def get_all_device_ids(where = nil, join = nil);  return [self.id];                     end
  def get_all_ios_device_ids;                       return (self.ios? ? [self.id] : []);  end
  def get_all_mac_device_ids;                       return (self.mac? ? [self.id] : []);  end

  #-------------------------------------------------------------------------

  def get_all_profiles
    # Create a subquery of all the
    sql = <<-SQL
        SELECT p.*                                -- The profile on this device
        FROM   #{Profile.table_name} AS p
        WHERE  p.library_item_id = #{self.id}
      UNION
        SELECT p.*                                -- The profiles on any device_groups that include this device, including ancestor device groups
        FROM   #{Profile.table_name}      AS p
        JOIN   view_device_groups_devices AS j
          ON   p.library_item_id = j.device_group_id
        WHERE  j.device_id = #{self.id}
    SQL
    profiles = Profile.find_by_sql(sql)

    if !self.mac? # Only include the owner's profiles for non-OSX devices
      user = self.user
      profiles |= user.get_all_profiles if user
    end
    return profiles
  end # get_all_profiles

  #-------------------------------------------------------------------------

  def get_app_data;                   return (self.connection.select_json_value_by_index("SELECT dm_app_info_for_device(#{self.id})")   || []);                                 end
  def get_book_data;                  return (self.connection.select_json_value_by_index("SELECT dm_media_info_for_device(#{self.id})") || []);                                 end
  def get_related_device_groups_ids;  return self.connection.select_integer_values_by_index("SELECT device_group_id FROM device_groups_devices WHERE device_id = #{self.id}");  end

  #-------------------------------------------------------------------------

  def get_related_user_ids
    uid = self.user_id
    return (uid ? self.connection.select_string_values_by_index("SELECT guid FROM #{User.table_name} WHERE id = #{user_id} LIMIT 1") : [])
  end # get_related_user_ids

  #-------------------------------------------------------------------------

  def get_vpp_user_id
    vpp_user_id = nil
    if self.mac?
      sql = <<-SQL
        SELECT   (dynamic_attributes::json)->>'iTunesStoreAccountHash'
        FROM     library_item_metadata
        WHERE    id IN (SELECT   id
                        FROM     lab_sessions
                        WHERE    device_id = #{self.id}
                          AND    NOT last_not_on_console
                        ORDER BY last_checkin_time DESC
                        LIMIT    1)
      SQL
      its_hash = self.connection.select_string_values_by_index(sql)[0]
    else
      metadata = self.library_item_metadata
      its_hash = (metadata && metadata['iTunesStoreAccountHash']) || nil
    end
    if its_hash
      its_hash = self.connection.quote_string(its_hash)
      sql = <<-SQL
        SELECT   id
        FROM     users
        WHERE    vpp_its_id_hash = '#{its_hash}'
        ORDER BY LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC LIMIT 1
      SQL
      vpp_user_id = self.connection.select_integer_values_by_index(sql)[0]
    end
    return vpp_user_id
  end # get_vpp_user_id

  #-------------------------------------------------------------------------

  def get_substitution_value_and_mask_for_key(key)
    return nil unless VALID_SUBSTITUTION_KEYS[key]

    sub = (self.respond_to?(key) ? self.send(key) : nil)
    unless sub
      attributes = self.get_attributes
      sub = attributes[key]
    end
    return sub
  end # get_substitution_value_and_mask_for_key

  #-------------------------------------------------------------------------

  def ios?;     return (self.mdm_target_type != 'mac'); end
  def is_ios?;  return (self.mdm_target_type != 'mac'); end
  def is_mac?;  return (self.mdm_target_type == 'mac'); end
  def mac?;     return (self.mdm_target_type == 'mac'); end

  #-------------------------------------------------------------------------

  def is_owner_assignable?
    return self.is_ios? || self.connection.select_exists?("SELECT 1 FROM owner_lab_sessions WHERE device_id = #{self.id}")
  end # is_owner_assignable?

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    attr_hash['profile']           = self.get_related_profile_ids[0]    # Don't materialize all the related objects just to get their IDs. Use SQL queries.
    attr_hash['is_mac']            = (attr_hash['mdm_target_type'] == 'mac')
    attr_hash['enrollment_state']  = self.enrollment_state
    attr_hash['has_complete_data'] = extended

    if extended
      ext = self.library_item_metadata
      ext_attr = ext.get_attributes(true)
      ext_attr.delete('id')           # Don't include these keys
      ext_attr.delete('device_id')
      attr_hash.merge!(ext_attr)

      attr_hash['os_updates']       = self.get_os_updates_info
      attr_hash['device_groups']    = self.get_related_device_groups_ids
      attr_hash['owner_assignable'] = self.is_owner_assignable?
      attr_hash['admin_accounts']   = self.get_all_auto_admin_short_names
      attr_hash['edu_mode_cached_accounts']  = self.get_edu_devices_user_info
      attr_hash['enrollment_settings'] = DeviceEnrollmentSettings.get_device_enrollment_settings(self)

      # Munge the VPP stuff for the admin
      attr_hash['vpp_user_id']      = self.get_vpp_user_id
      attr_hash['apps']             = self.get_related_app_info
      attr_hash['app_data']         = self.get_app_data
      attr_hash['books']            = self.get_related_unified_book_ids
      attr_hash['book_data']        = self.get_book_data
      attr_hash['managed_apps']     = self.get_related_managed_app_ids
      attr_hash['managed_books']    = self.get_related_managed_book_ids
      attr_hash['has_unlock_token'] = !ext_attr['unlock_token'].nil?
    end

    # Remove attributes the admin shouldn't get
    BAD_ATTRIBUTES.each { |bad| attr_hash.delete(bad) }

  return attr_hash
  end # modify_attributes

  #-------------------------------------------------------------------------

  def name;                                   return self.DeviceName;                                                                               end
  def placeholder_device?;                    return !self.token && (self.udid || self.DeviceName || self.SerialNumber || self.IMEI || self.MEID);  end
  def supports_enterprise_apps?;              return (self.mdm_acl && (self.mdm_acl & 4096) != 0);                        end
  def update_app_assignments(new_app_ids);    UnifiedApplication.update_app_assignments(self, new_app_ids);               end
  def update_book_assignments(new_book_ids);  UnifiedBook.update_book_assignments(self, new_book_ids);                    end
  def update_enrollment_settings(settings);   DeviceEnrollmentSettings.update_device_enrollment_settings(self, settings); end
  def valid_device?;                          return (self.placeholder_device? || self.bound_device?);                    end

  #-------------------------------------------------------------------------

  def is_mdm_removable?
    dep_profile = nil
    assigned_dep_profile_uuid = self.assigned_dep_profile_uuid

    if assigned_dep_profile_uuid
      # The dep profile is inhertited from a device group if we don't find it on the device
      if assigned_dep_profile_uuid == self.dep_profile_uuid
        dep_profile = self.dep_profile
      else
        dg = DeviceGroup.find_by_dep_profile_uuid(assigned_dep_profile_uuid)
        dep_profile = dg.dep_profile if dg
      end
    end
    return !(dep_profile && dep_profile['is_mdm_removable'] === false)
  end # is_mdm_removable?

  #-------------------------------------------------------------------------

  include MDMRecordBase
  include MDMLibraryItemBase

#-------------------------------------------------------------------------
end # class Device
#-------------------------------------------------------------------------
