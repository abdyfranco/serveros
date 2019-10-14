#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class DeviceGroup < ActiveRecord::Base

  has_one :profile, :foreign_key => 'library_item_id'                   # get_related_profile_ids
  has_and_belongs_to_many :devices                                      # get_related_devices_ids
  has_and_belongs_to_many(:parent_device_groups,                        # get_related_parent_device_groups_ids
                          :class_name              => "DeviceGroup",
                          :join_table              => "device_group_memberships",
                          :foreign_key             => "child_id",
                          :association_foreign_key => "parent_id")
  has_and_belongs_to_many(:child_device_groups,                         # get_related_child_device_groups_ids
                          :class_name              => "DeviceGroup",
                          :join_table              => "device_group_memberships",
                          :foreign_key             => "parent_id",
                          :association_foreign_key => "child_id")

  serialize :dep_profile, Hash

  @@admin_required_attributes = [ 'name', 'devices', 'child_device_groups', 'profile' ]

  #-------------------------------------------------------------------------

  def self.table_name
    return "device_groups"
  end

  #-------------------------------------------------------------------------

  def self.admin_required_attributes
    return @@admin_required_attributes
  end
  
  #-------------------------------------------------------------------------

  def self.get_all_ids_for_admin(search_string = nil)
    where = ''
    if search_string
      search = search_string.gsub(/([_%\|\\])/, '|\1').gsub(/'/, '\'\'')   # Escape the special characters in the search string
      Rails.logger.info("Escaped '#{search_string}' to '#{search}'") if MDMLogger.debugOutput?(2)
      where = "WHERE name ILIKE '%#{search}%' ESCAPE '|'"
    end

    sql = <<-SQL
      SELECT  id
      FROM    "#{self.table_name}"                        -- Filters out devices that would return false for valid_device?
      #{where}
      ORDER BY name ASC NULLS LAST
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def debug_name
    return "<#{self.class.to_s}:\"#{self.name}\">"
  end

  #-------------------------------------------------------------------------

  def also_modifies
    return [:devices, :parent_device_groups, :child_device_groups]
  end

  #-------------------------------------------------------------------------

  # NOTE: ancestor device groups means all parent device groups and all of their recursive parent device groups
  def all_ancestor_device_groups
    sql = <<-SQL
      SELECT g.*
      FROM   "#{self.table_name}"    AS g
      JOIN   view_device_groups_flat AS j
        ON   j.parent_id = g.id
      WHERE  j.child_id  = #{self.id}
    SQL
    return self.connection.find_by_sql(sql)
  end

  #-------------------------------------------------------------------------

  # NOTE: child device groups means all child device groups and all of their recursive child device groups
  def all_child_device_groups
    sql = <<-SQL
      SELECT g.*
      FROM   "#{self.table_name}"    AS g
      JOIN   view_device_groups_flat AS j
        ON   j.child_id  = g.id
      WHERE  j.parent_id = #{self.id}
    SQL
    return self.connection.find_by_sql(sql)
  end

  #-------------------------------------------------------------------------

  def before_save
    self.library_item_type = 'DeviceGroup' # Rails will attempt to write NULL for things we don't explicitly set on new objects, which causes this column to fail the INSERT
    return true
  end

  #-------------------------------------------------------------------------

  def child_device_group_ids
    return self.get_related_child_device_groups_ids
  end

  #-------------------------------------------------------------------------

  def child_of?(parent, deep = true)
    return false if parent.nil? || parent == self || !parent.kind_of?(DeviceGroup)  # Can't be the child of anything but another device group

    join  = (deep ? "view_device_groups_flat" : "device_group_memberships")

    sql = <<-SQL
      SELECT COUNT(*)
      FROM   "#{join}"
      WHERE  child_id  = #{self.id}
        AND  parent_id = #{parent.id}
      LIMIT  1
    SQL
    return (self.count_by_sql(sql) > 0)
  end

  #-------------------------------------------------------------------------

  def get_all_device_ids(where = nil)
    # This function returns all the devices in the target device group and all it's descendant children
    where = (where ? "AND  (#{where})" : '')
    sql = <<-SQL
      SELECT DISTINCT d.id
      FROM   "#{Device.table_name}"          AS d
      JOIN   view_device_groups_devices_flat AS j
        ON   j.device_id       = d.id
      WHERE  j.device_group_id = #{self.id}
        #{where}
    SQL
    return DeviceGroup.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def get_all_eapps_info
    sql = <<-SQL
      SELECT DISTINCT
             ia.bundle_identifier, ia.name
      FROM   installed_applications          AS ia
      JOIN   view_device_groups_devices_flat AS j
        ON   ia.device_id = j.device_id
      WHERE  j.device_group_id = #{self.id}
    SQL

    res  = self.connection.execute(sql)
    apps = []
    for row in 0...res.ntuples do
      apps.push({:Identifier => res.getvalue(row, 0), :Name => res.getvalue(row, 1)})
    end
    return apps
  end

  #-------------------------------------------------------------------------

  def get_all_profiles
    sql = <<-SQL
        SELECT p.*                            -- The profile on this device_group
        FROM   "#{Profile.table_name}" AS p
        WHERE  p.library_item_id = #{self.id}
      UNION
        SELECT p.*                            -- The profiles on ancestor device_groups of this device_group
        FROM   "#{Profile.table_name}" AS p
        JOIN   view_device_groups_flat AS j
          ON   p.library_item_id = j.parent_id
        WHERE  j.child_id = #{self.id}
    SQL
    return Profile.find_by_sql(sql)
  end
  
  #-------------------------------------------------------------------------

  def get_app_data
    sql = "SELECT dm_app_info_for_device_group(#{self.id})"
    json = self.connection.select_string_values_by_index(sql)   # This returns a JSON-formatted string because it's a complex structure that SQL can't represent easily
    return JSON.parse(json[0])
  end

  #-------------------------------------------------------------------------

  def get_related_child_device_groups_ids
    sql = <<-SQL
      SELECT g.id
      FROM   "#{DeviceGroup.table_name}" AS g,
             device_group_memberships    AS j
      WHERE  j.child_id  = g.id
        AND  j.parent_id = #{id}
    SQL
    return DeviceGroup.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def get_related_devices_ids
    sql = <<-SQL
    SELECT device_id
    FROM   device_groups_devices
    WHERE  device_group_id = #{self.id}
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def get_related_parent_device_groups_ids
    sql = <<-SQL
      SELECT g.id
      FROM   "#{DeviceGroup.table_name}" AS g,
             device_group_memberships    AS j
      WHERE  j.parent_id = g.id
        AND  j.child_id  = #{id}
    SQL
    return DeviceGroup.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def get_related_profile_ids
    return self.connection.select_integer_values_by_index("SELECT id FROM \"#{Profile.table_name}\" WHERE library_item_id = #{self.id} LIMIT 1")
  end

  #-------------------------------------------------------------------------

  def has_device_group_as_relationship(device_group)
    return false if device_group.nil? || !device_group.kind_of?(DeviceGroup)
    return true  if device_group == self

    my_id = self.id
    dg_id = device_group.id

    sql = <<-SQL
      SELECT COUNT(*)
      FROM   view_device_groups_flat
      WHERE  (child_id  = #{my_id} AND parent_id = #{dg_id})
         OR  (parent_id = #{dg_id} AND child_id  = #{my_id})
      LIMIT  1
    SQL
    return self.count_by_sql(sql) > 0
  end

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    # Don't materialize all the related objects just to get their IDs. Use SQL queries.
    attr_hash['profile']              = self.get_related_profile_ids[0]
    attr_hash['devices']              = self.get_related_devices_ids
    attr_hash['child_device_groups']  = self.get_related_child_device_groups_ids
    attr_hash['has_complete_data']    = extended
    if extended
      attr_hash['apps']                 = self.get_related_app_ids
      attr_hash['app_data']             = self.get_app_data
      attr_hash['parent_device_groups'] = self.get_related_parent_device_groups_ids
      attr_hash['_installedApplicationList'] = self.get_all_eapps_info
    end
    return attr_hash
  end

  #-------------------------------------------------------------------------

  def parent_device_group_ids
    return self.get_related_parent_device_groups_ids
  end

  #-------------------------------------------------------------------------

  def parent_of?(child, deep = true)
    return false if child.nil? || child == self

    if child.kind_of?(DeviceGroup)
      join = (deep ? "view_device_groups_flat" : "device_group_memberships")
      sql = <<-SQL
        SELECT COUNT(*)
        FROM   "#{join}"
        WHERE  child_id  = #{child.id}
          AND  parent_id = #{self.id}
        LIMIT  1
      SQL
    elsif child.kind_of?(Device)
      join = (deep ? "view_device_groups_devices_flat" : "device_groups_devices")
      sql = <<-SQL
        SELECT COUNT(*)
        FROM   "#{join}"
        WHERE  device_group_id = #{self.id}
          AND  device_id       = #{child.id}
        LIMIT  1
      SQL
    else
      return false    # Device groups can only be the parents of devices and other device groups
    end

    return (self.count_by_sql(sql) > 0)
  end

  #-------------------------------------------------------------------------

  def profile=(p)
    my_id = self.id
    return unless my_id

    if p
      p = p.id if p.is_a?(Profile)
      sql = <<-SQL
        UPDATE "#{Profile.table_name}"
        SET    device_group_id = #{my_id}
        WHERE  id = #{Integer(p)}
      SQL
    else
      sql = <<-SQL
      DELETE FROM "#{Profile.table_name}"
      WHERE       device_group_id = #{my_id}
      SQL
    end
    self.connection.execute(sql)
  end

  #-------------------------------------------------------------------------

  def update_app_assignments(new_app_ids)
    UnifiedApplication.update_app_assignments(self, new_app_ids)
  end

  #-------------------------------------------------------------------------

  def update_enrollment_settings(settings)
    DeviceEnrollmentSettings.update_device_enrollment_settings(self, settings)
  end

  #-------------------------------------------------------------------------

  include MDMRecordBase
  include MDMLibraryItemBase

end
