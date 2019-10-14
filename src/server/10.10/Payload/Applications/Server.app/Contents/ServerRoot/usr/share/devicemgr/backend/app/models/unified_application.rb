#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class UnifiedApplication < ActiveRecord::Base
  
  #-------------------------------------------------------------------------

  def self.table_name
    return 'view_unified_applications'
  end

  #-------------------------------------------------------------------------

  def self.find_all_for_admin
    if Settings.get_settings.vpp_service_state == 3   # 0 = disabled, 1 = sToken expired, 2 = orphaned by another server, 3 = enabled
      return self.find(:all)                                        # VPP is enabled, return all apps
    else
      return self.find_by_sql("SELECT * FROM \"#{self.table_name}\" WHERE asset_type = 'EApp'") # VPP is disabled, so only return enterprise apps
    end
  end

  #-------------------------------------------------------------------------
  
  def self.find_by_id(id)
    sql = <<-SQL
      SELECT *
      FROM   "#{self.table_name}"
      WHERE  id = #{Integer(id)}
    SQL
    result = self.find_by_sql(sql)
    return result[0]
  end
  
  #-------------------------------------------------------------------------
  
  def self.get_all_for_library_item(item)
    # TODO
  end

  #-------------------------------------------------------------------------
  
  def self.get_all_with_application_ids(ids)
    ids = ids.uniq.map { |i| Integer(i) }.join(',')
    return [] if ids.empty?

    sql = <<-SQL
      SELECT *
      FROM   #{self.table_name}
      WHERE  id IN (#{ids})
    SQL
    return self.find_by_sql(sql)
  end

  #-------------------------------------------------------------------------

  def self.push_applications_to_library_item(apps, target_class, target_id)
    # Sanitize input
    target_class = ActiveRecord::Base.connection.quote_string(target_class)
    target_id    = Integer(target_id)
    apps.map! { |i| Integer(i) }
    app_ids = "ARRAY[#{apps.join(',')}]"
    self.connection.execute("SELECT dm_push_apps_to_library_item(#{app_ids}, '#{target_class}', #{target_id})")
  end

  #-------------------------------------------------------------------------

  def self.update_app_assignments(library_item, new_app_ids)
    # We need to parse the ids, break them into the various supported app types
    li_id        = library_item.id
    current_apps = library_item.get_related_app_ids
    remove_apps  = current_apps - new_app_ids
    assign_apps  = new_app_ids  - current_apps

    # Figure out what we're going to unassign   
    app_ids = remove_apps
    
    unless app_ids.empty?
      app_ids = app_ids.map { |i| Integer(i) }.join(',')
      sql = <<-SQL
        DELETE FROM library_items_assets
        WHERE       library_item_id = #{li_id}
          AND       asset_id IN (#{app_ids})
      SQL
      self.connection.execute(sql)
    end

    # Now figure out what we're going to assign
    app_ids = []
    assign_apps.each { |id|      
      app_ids.push("(#{Integer(id)},#{li_id})")
    }

    unless app_ids.empty?
      app_ids = app_ids.join(',')
      sql = <<-SQL
        INSERT INTO library_items_assets
                    (asset_id, library_item_id)
        VALUES      #{app_ids}
      SQL
      self.connection.execute(sql)
    end
    
    # Tell devicemgrd to sync licenses now, but only if we made changes
    unless remove_apps.empty? && assign_apps.empty?
      MDMUtilities.on_commit {
        MDMUtilities.sync_vpp_data  # Will not raise any exceptions
      }
    end
  end

  #-------------------------------------------------------------------------

  def before_save
    # To allow the admin to set information on B2B VPP apps, we intercept this and redirect to the proper table
    setable_columns = ['name', 'unique_identifier', 'category', 'version', 'supported_devices', 'size_in_kb']
    set = []
    setable_columns.each { |col|
      val = self[col]
      next unless val && val != '' && val != 0
      val = (col == 'supported_devices' || col == 'size_in_kb') ? Integer(val) : "'#{self.connection.quote_string(val)}'"
      set.push "#{col} = #{val}"
    }
    unless set.empty?
      # We have to delay the actual update because returning false from this method will cause a transaction rollback.
      # Once that happens, we can start a new transaction and make the actual update
      MDMUtilities.on_rollback { |will_retry|
        unless will_retry
          MDMUtilities.process_in_transaction {
            set.push("updated_at = (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')")
            self.connection.execute("UPDATE vpp_products SET #{set.join(', ')} WHERE id = #{self.id} AND asset_type = 'VPPApp' AND metadata_last_updated = 'epoch'") # Make sure we only update VPPApp rows
          }
        end
      }
    end
    return false
  end

  #-------------------------------------------------------------------------

  def delete
    raise "UnifiedApplication#delete: read only!"
  end

  #-------------------------------------------------------------------------

  def destroy
    raise "UnifiedApplication#destroy: read only!"
  end

  #-------------------------------------------------------------------------

  def get_related_device_ids
    sql = <<-SQL
      SELECT library_item_id
      FROM   view_library_items_unified_applications
      WHERE  app_id            = #{self.id}
        AND  library_item_type = 'Device'
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def get_related_device_group_ids
    sql = <<-SQL
      SELECT library_item_id
      FROM   view_library_items_unified_applications
      WHERE  app_id            = #{self.id}
        AND  library_item_type = 'DeviceGroup'
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def get_related_user_ids
    sql = <<-SQL
      SELECT library_item_id
      FROM   view_library_items_unified_applications
      WHERE  app_id            = #{self.id}
        AND  library_item_type = 'User'
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def get_related_user_group_ids
    sql = <<-SQL
      SELECT library_item_id
      FROM   view_library_items_unified_applications
      WHERE  app_id            = #{self.id}
        AND  library_item_type = 'UserGroup'
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def is_enterprise?
    return (self.asset_type == 'EApp')
  end

  #-------------------------------------------------------------------------

  def is_vpp?
    return self.asset_type.start_with?('VPP')
  end

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    # We need to fix up the URL to the app icon for Enterprise apps (they're stored on our server)
    url = attr_hash['icon_url'] || "generic_app.png"
    attr_hash['icon_url'] = "#{Settings.url_base}#{PM_IPA_URI_ROOT}/#{url}" if url && !url.start_with?('http')

    # Add an array of library items this app is directly assigned to
    attr_hash['devices']       = self.get_related_device_ids
    attr_hash['device_groups'] = self.get_related_device_group_ids
    attr_hash['users']         = self.get_related_user_ids
    attr_hash['user_groups']   = self.get_related_user_group_ids
    return attr_hash
  end
  
  #-------------------------------------------------------------------------

  def update_app_assignments(new_user_ids, new_group_ids)
    current_user_ids  = self.get_related_user_ids
    current_group_ids = self.get_related_user_group_ids

    # We don't have to keep separate arrays of ids for users and groups. Both tables are children of library_items,
    # which all use a common id sequence and therefore there can be no overlap of ids between users and user_groups
    remove_ids  = (current_user_ids - new_user_ids)     + (current_group_ids - new_group_ids)
    add_ids     = (new_user_ids     - current_user_ids) + (new_group_ids     - current_group_ids)
    id = self.id

    unless remove_ids.empty?
      remove_ids = remove_ids.map { |i| Integer(i) }.join(',')
      sql = <<-SQL
        DELETE FROM library_items_assets
        WHERE       asset_id = #{id}
          AND       library_item_id IN (#{remove_ids})
      SQL
      self.connection.execute(sql)
    end

    unless add_ids.empty?
      values = add_ids.collect { |lid| "(#{id},#{Integer(lid)})" }
      values = values.join(',')
      sql = <<-SQL
        INSERT INTO library_items_assets
                    (asset_id, library_item_id)
        VALUES      #{values}
      SQL
      self.connection.execute(sql)
    end

    # Tell devicemgrd to sync licenses now, but only if we changed something
    unless remove_ids.empty? && add_ids.empty?
      MDMUtilities.on_commit {
        MDMUtilities.sync_vpp_data  # Will not raise any exceptions
      }
    end
  end

  #-------------------------------------------------------------------------

  def update_name(name)
    return unless name && name.length > 0
    name = self.connection.quote_string(name)
    sql = <<-SQL
      UPDATE vpp_products
      SET    name = '#{name}'
      WHERE  id   = #{self.id}
    SQL
    self.connection.execute(sql)
  end

  #-------------------------------------------------------------------------

  include MDMRecordBase
  
end # UnifiedApplication
