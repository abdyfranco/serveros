#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class DeviceGroup < ActiveRecord::Base
#-------------------------------------------------------------------------

  has_and_belongs_to_many :devices                                      # get_related_devices_ids
  has_and_belongs_to_many(:parent_device_groups,                        # get_related_parent_device_groups_ids
                          :class_name              => 'DeviceGroup',
                          :join_table              => 'device_group_memberships',
                          :foreign_key             => 'child_id',
                          :association_foreign_key => 'parent_id')
  has_and_belongs_to_many(:child_device_groups,                         # get_related_child_device_groups_ids
                          :class_name              => 'DeviceGroup',
                          :join_table              => 'device_group_memberships',
                          :foreign_key             => 'parent_id',
                          :association_foreign_key => 'child_id')

  serialize :dep_profile, Hash

  @@admin_required_attributes = [ 'name', 'devices', 'child_device_groups', 'profile' ]

  #-------------------------------------------------------------------------

  def self.table_name;                  return 'device_groups';               end
  def self.admin_required_attributes;   return @@admin_required_attributes;   end

  #-------------------------------------------------------------------------

   def self.find_by_dep_profile_uuid(dep_profile_uuid, opt={})
     return nil if dep_profile_uuid.nil? || dep_profile_uuid.empty?
     DeviceGroup.find(:first, :conditions => {:dep_profile_uuid => dep_profile_uuid})
   end # self.find_by_dep_profile_uuid

  #-------------------------------------------------------------------------

  def self.get_all_ids_for_admin(search_string = nil)
    where = ''
    unless search_string.empty?
      search = self.connection.quote_string(search_string.gsub(/([_%\|\\])/, '|\1'))   # Escape the special characters in the search string
      Rails.logger.info("Escaped '#{search_string}' to '#{search}'") if MDMLogger.debugOutput?(2)
      where = "WHERE name ILIKE '%#{search}%' ESCAPE '|'"
    end

    sql = <<-SQL
      SELECT  id
      FROM    #{self.table_name}                        -- Filters out devices that would return false for valid_device?
      #{where}
      ORDER BY LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end # self.get_all_ids_for_admin

  #-------------------------------------------------------------------------

  def self.get_app_license_details_for_multiple_by_id(ids)
    return ids.collect { |id|
      id = Integer(id)
      { :id => id, :app_data => (self.connection.select_json_value_by_index("SELECT dm_app_info_for_device_group(#{id}, TRUE)") || []) }
    }
  end # self.get_app_license_details_for_multiple_by_id

  #-------------------------------------------------------------------------

  def self.get_book_license_details_for_multiple_by_id(ids)
    return ids.collect { |id|
      id = Integer(id)
      { :id => id, :book_data => (self.connection.select_json_value_by_index("SELECT dm_media_info_for_device_group(#{id})") || []) }
    }
  end # self.get_book_license_details_for_multiple_by_id

  #-------------------------------------------------------------------------

  def debug_name;     return "<#{self.class.to_s}:\"#{self.name}\">";                 end
  def also_modifies;  return [:devices, :parent_device_groups, :child_device_groups]; end

  #-------------------------------------------------------------------------

  # NOTE: ancestor device groups means all parent device groups and all of their recursive parent device groups
  def all_ancestor_device_groups
    sql = <<-SQL
      SELECT g.*
      FROM   #{self.table_name}      AS g
      JOIN   mva_device_groups_flat AS j ON (j.parent_id = g.id)
      WHERE  j.child_id = #{self.id}
    SQL
    return self.connection.find_by_sql(sql)
  end # all_ancestor_device_groups

  #-------------------------------------------------------------------------

  # NOTE: child device groups means all child device groups and all of their recursive child device groups
  def all_child_device_groups
    sql = <<-SQL
      SELECT g.*
      FROM   #{self.table_name}      AS g
      JOIN   mva_device_groups_flat AS j ON (j.child_id = g.id)
      WHERE  j.parent_id = #{self.id}
    SQL
    return self.connection.find_by_sql(sql)
  end # all_child_device_groups

  #-------------------------------------------------------------------------

  def before_save
    self.library_item_type = 'DeviceGroup' # Rails will attempt to write NULL for things we don't explicitly set on new objects, which causes this column to fail the INSERT
    return true
  end # before_save

  #-------------------------------------------------------------------------

  def child_device_group_ids;   return self.get_related_child_device_groups_ids;  end

  #-------------------------------------------------------------------------

  def child_of?(parent, deep = true)
    return false if parent.nil? || parent == self || !parent.kind_of?(DeviceGroup)  # Can't be the child of anything but another device group

    join  = (deep ? 'mva_device_groups_flat' : 'device_group_memberships')
    sql = <<-SQL
      SELECT 1
      FROM   #{join}
      WHERE  child_id  = #{self.id}
        AND  parent_id = #{parent.id}
      LIMIT  1
    SQL
    return self.connection.select_exists?(sql)
  end # child_of?

  #-------------------------------------------------------------------------

  def get_installed_apps_info(app_type)
    case app_type
    when :ios
      view_name = 'installed_ios_applications'
    when :tvos
      view_name = 'installed_atv_applications'
    when :macos
      view_name = 'installed_osx_applications'
    else
      raise "Invalid app type '#{app_type}'"
    end

    sql = <<-SQL
      SELECT DISTINCT
             ia.unique_identifier, ia.name
      FROM   #{view_name}                    AS ia
      JOIN   view_device_groups_devices_flat AS j ON (ia.device_id = j.device_id)
      WHERE  j.device_group_id = #{self.id}
        AND  ia.status IN ('managed', 'unmanaged')
    SQL

    res  = self.connection.execute(sql)
    apps = []
    for row in 0...res.ntuples do
      apps.push({:Identifier => res.getvalue(row, 0), :Name => res.getvalue(row, 1)})
    end
    return apps
  end # get_installed_apps_info

  #-------------------------------------------------------------------------

  def get_all_ios_apps_info
    return self.get_installed_apps_info(:ios)
  end # get_all_ios_apps_info

  #-------------------------------------------------------------------------

  def get_all_tvos_apps_info
    return self.get_installed_apps_info(:tvos)
  end # get_all_tvos_apps_info

  #-------------------------------------------------------------------------

  def get_all_profiles
    sql = <<-SQL
        SELECT p.*                            -- The profile on this device_group
        FROM   #{Profile.table_name} AS p
        WHERE  p.library_item_id = #{self.id}
      UNION
        SELECT p.*                            -- The profiles on ancestor device_groups of this device_group
        FROM   #{Profile.table_name}   AS p
        JOIN   mva_device_groups_flat AS j ON (p.library_item_id = j.parent_id)
        WHERE  j.child_id = #{self.id}
    SQL
    return Profile.find_by_sql(sql)
  end # get_all_profiles

  #-------------------------------------------------------------------------

  def get_app_data;                         return (self.connection.select_json_value_by_index("SELECT dm_app_info_for_device_group(#{self.id}, FALSE)") || []);                                 end
  def get_book_data;                        return (self.connection.select_json_value_by_index("SELECT dm_media_info_for_device_group(#{self.id})") || []);                                      end
  def get_related_child_device_groups_ids;  return DeviceGroup.connection.select_integer_values_by_index("SELECT DISTINCT child_id FROM device_group_memberships WHERE parent_id = #{self.id}"); end
  def get_related_devices_ids;              return self.connection.select_integer_values_by_index("SELECT DISTINCT device_id FROM device_groups_devices WHERE device_group_id = #{self.id}");    end
  def get_related_parent_device_groups_ids; return DeviceGroup.connection.select_integer_values_by_index("SELECT DISTINCT parent_id FROM device_group_memberships WHERE child_id = #{self.id}"); end

  #-------------------------------------------------------------------------

  def has_device_group_as_relationship(device_group)
    return false if device_group.nil? || !device_group.kind_of?(DeviceGroup)
    return true  if device_group == self

    my_id = self.id
    dg_id = device_group.id

    sql = <<-SQL
      SELECT 1
      FROM   mva_device_groups_flat
      WHERE  (child_id = #{my_id} AND parent_id = #{dg_id})
         OR  (child_id = #{dg_id} AND parent_id = #{my_id})
      LIMIT  1
    SQL
    return self.connection.select_exists?(sql)
  end # has_device_group_as_relationship

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    # Don't materialize all the related objects just to get their IDs. Use SQL queries.
    attr_hash['profile']              = self.get_related_profile_ids[0]
    attr_hash['devices']              = self.get_related_devices_ids
    attr_hash['child_device_groups']  = self.get_related_child_device_groups_ids
    attr_hash['has_complete_data']    = extended
    if extended
      ext = self.library_item_metadata
      ext_attr = ext.get_attributes(true)
      ext_attr.delete('id')           # Don't include these keys
      ext_attr.delete('device_group_id')
      attr_hash.merge!(ext_attr)

      attr_hash['apps']                      = self.get_related_app_info
      attr_hash['app_data']                  = self.get_app_data
      attr_hash['books']                     = self.get_related_book_info
      attr_hash['book_data']                 = self.get_book_data
      attr_hash['parent_device_groups']      = self.get_related_parent_device_groups_ids
      attr_hash['installed_ios_apps_info']   = self.get_all_ios_apps_info
      attr_hash['installed_tvos_apps_info']  = self.get_all_tvos_apps_info
      attr_hash['osx_eapp_eligible_devices'] = self.get_all_device_ids_for_task('PushOSXEnterpriseApplications')
      attr_hash['enrolled_devices']          = self.get_all_device_ids('d.token IS NOT NULL')
      attr_hash['os_updates']                = self.get_os_updates_info
      attr_hash['admin_accounts']            = self.get_all_auto_admin_short_names
      attr_hash['managed_apps']              = self.get_related_managed_app_ids
      attr_hash['managed_books']             = self.get_related_managed_book_ids
      attr_hash['edu_mode_cached_accounts']  = self.get_edu_devices_user_info
      attr_hash['enrollment_settings']       = DeviceEnrollmentSettings.get_device_enrollment_settings(self)
    end
    return attr_hash
  end # modify_attributes

  #-------------------------------------------------------------------------

  def parent_device_group_ids;    return self.get_related_parent_device_groups_ids;   end

  #-------------------------------------------------------------------------

  def parent_of?(child, deep = true)
    return false if child.nil? || child == self

    if child.kind_of?(DeviceGroup)
      join = (deep ? 'mva_device_groups_flat' : 'device_group_memberships')
      sql = <<-SQL
        SELECT 1
        FROM   #{join}
        WHERE  child_id  = #{child.id}
          AND  parent_id = #{self.id}
        LIMIT  1
      SQL
    elsif child.kind_of?(Device)
      join = (deep ? 'view_device_groups_devices_flat' : 'device_groups_devices')
      sql = <<-SQL
        SELECT 1
        FROM   #{join}
        WHERE  device_group_id = #{self.id}
          AND  device_id       = #{child.id}
        LIMIT  1
      SQL
    else
      return false    # Device groups can only be the parents of devices and other device groups
    end

    return self.connection.select_exists?(sql)
  end # parent_of?

  #-------------------------------------------------------------------------

  def update_app_assignments(new_app_infos);    UnifiedApplication.update_app_assignments(self, new_app_infos);             end
  def update_book_assignments(new_book_infos);  UnifiedBook.update_book_assignments(self, new_book_infos);                  end
  def update_enrollment_settings(settings);     DeviceEnrollmentSettings.update_device_enrollment_settings(self, settings); end

  #-------------------------------------------------------------------------

  include MDMRecordBase
  include MDMLibraryItemBase

#-------------------------------------------------------------------------
end # class DeviceGroup
#-------------------------------------------------------------------------
