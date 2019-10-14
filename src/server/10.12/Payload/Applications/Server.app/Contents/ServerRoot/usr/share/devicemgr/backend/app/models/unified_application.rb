#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class UnifiedApplication < ActiveRecord::Base
#-------------------------------------------------------------------------

  VPPAppAppleIDBit   = (1 << 0)
  VPPAppDeviceSNBit  = (1 << 1)
  EnterpriseAppBit   = (1 << 2)
  VPPAppMAIDBit      = (1 << 6)

  #-------------------------------------------------------------------------

  def self.table_name;  return 'view_unified_applications'; end

  #-------------------------------------------------------------------------

  def self.find_all_for_admin
    return self.find(:all)                                        # return all apps
  end # self.find_all_for_admin

  #-------------------------------------------------------------------------

  def self.find_by_id(id, opt={})
    result = self.find_by_sql("SELECT * FROM #{self.table_name} WHERE id = #{Integer(id)}")
    return (result && result[0])
  end # self.find_by_id

  #-------------------------------------------------------------------------

  def self.get_all_for_library_item(item)
    # TODO
  end # self.get_all_for_library_item

  #-------------------------------------------------------------------------

  def self.get_all_with_application_ids(ids)
    ids = ids.uniq.map { |i| Integer(i) }.join(',')
    return [] if ids.empty?

    return self.find_by_sql("SELECT * FROM #{self.table_name} WHERE id IN (#{ids})")
  end # self.get_all_with_application_ids

  #-------------------------------------------------------------------------

  def self.push_applications_to_library_item(apps, target_class, target_id)
    # Sanitize input
    target_class = ActiveRecord::Base.connection.quote_string(target_class)
    target_id    = Integer(target_id)
    apps.map! { |i| Integer(i) }
    app_ids = "ARRAY[#{apps.join(',')}]"
    self.connection.execute("SELECT dm_push_media_to_library_item(#{target_id}, #{app_ids})")
  end # self.push_applications_to_library_item

  #-------------------------------------------------------------------------

  def self.push_remove_application_to_library_item(apps, target_class, target_id)
    # Sanitize input
    target_id = Integer(target_id)
    apps.map! { |i| Integer(i) }
    app_ids = "ARRAY[#{apps.join(',')}]"
    self.connection.execute("SELECT dm_remove_media_from_library_item(#{target_id}, #{app_ids})")
  end # self.remove_applications_from_library_item

  #-------------------------------------------------------------------------

  def self.update_app_assignments(library_item, new_app_infos)
    # We need to parse the ids, break them into the various supported app types
    cur_info_by_id = {}
    new_info_by_id = {}
    new_app_infos.each { |i|
      id = Integer(i['id'])     # new_app_infos is from the Internet and must be sanitized
      new_info_by_id[id] = i
    }
    library_item.get_related_app_info.each { |i| cur_info_by_id[i['id']] = i }   # This is internal data which doesn't need to be sanitized

    new_app_ids = new_info_by_id.keys
    cur_app_ids = cur_info_by_id.keys

    remove_app_ids   = cur_app_ids - new_app_ids    # The apps to be unassigned
    assign_app_ids   = new_app_ids - cur_app_ids    # The apps to be assigned
    existing_app_ids = cur_app_ids - remove_app_ids # Apps that were assigned and remain assigned (but might have had attributes change)
    li_id = library_item.id

    self.connection.execute("DELETE FROM library_items_assets WHERE library_item_id = #{li_id} AND asset_id IN (#{remove_app_ids.join(',')})") unless remove_app_ids.empty?

    app_ids = assign_app_ids.map { |id|
      info = new_info_by_id[id]
      a_mode = info['assignment_mode']
      a_mode = (a_mode == 'device' ? VPPAppDeviceSNBit : (a_mode == 'maid' ? VPPAppMAIDBit : VPPAppAppleIDBit))
      i_mode = (info['installation_mode'] == 'automatic' ? 'TRUE' : 'FALSE')
      "(#{id},#{li_id},#{a_mode},#{i_mode})"
    }
    self.connection.execute("INSERT INTO library_items_assets (asset_id, library_item_id, association_type, auto_push) VALUES #{app_ids.join(',')}") unless app_ids.empty?

    # Update any changed assignments
    changed = false
    existing_app_ids.each { |id|
      ni = new_info_by_id[id]
      ci = cur_info_by_id[id]
      a_mode = ni['assignment_mode']
      i_mode = ni['installation_mode']
      next if a_mode == ci['assignment_mode'] && i_mode == ci['installation_mode']

      a_mode = (a_mode == 'device' ? VPPAppDeviceSNBit : (a_mode == 'maid' ? VPPAppMAIDBit : VPPAppAppleIDBit))
      i_mode = (i_mode == 'automatic' ? 'TRUE' : 'FALSE')
      self.connection.execute("UPDATE library_items_assets SET association_type = #{a_mode}, auto_push = #{i_mode} WHERE asset_id = #{id} AND library_item_id = #{li_id}")
      changed = true
    } # existing_app_ids.each

    # Tell devicemgrd to sync licenses now, but only if we made changes
    unless !changed && remove_app_ids.empty? && assign_app_ids.empty?
      MDMUtilities.on_commit { MDMUtilities.sync_vpp_data } # Will not raise any exceptions
    end
  end # self.update_app_assignments

  #-------------------------------------------------------------------------

  def before_save
    # To allow the admin to set information on B2B VPP apps, we intercept this and redirect to the proper table
    setable_columns = ['name', 'unique_identifier', 'category', 'version', 'supported_devices', 'size_in_kb']
    set = []
    setable_columns.each { |col|
      val = self[col]
      next unless val && val != '' && val != 0
      val = (col == 'supported_devices' || col == 'size_in_kb') ? Integer(val) : "'#{self.connection.quote_string(val)}'"
      set.push("#{col} = #{val}")
    } # setable_columns.each

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
      } # MDMUtilities.on_rollback
    end
    return false
  end # before_save

  #-------------------------------------------------------------------------

  def delete;   raise "UnifiedApplication#delete: read only!";  end
  def destroy;  raise "UnifiedApplication#destroy: read only!"; end

  #-------------------------------------------------------------------------

  def get_related_device_ids
    return self.connection.select_integer_values_by_index("SELECT library_item_id FROM view_library_items_unified_applications WHERE app_id = #{self.id} AND library_item_type = 'Device'")
  end

  #-------------------------------------------------------------------------

  def get_related_device_info
    return self.connection.select_json_array_by_index("SELECT li_json FROM view_library_items_unified_applications WHERE app_id = #{self.id} AND library_item_type = 'Device'")
  end

  #-------------------------------------------------------------------------

  def get_related_device_group_ids
    return self.connection.select_integer_values_by_index("SELECT library_item_id FROM view_library_items_unified_applications WHERE app_id = #{self.id} AND library_item_type = 'DeviceGroup'")
  end

  #-------------------------------------------------------------------------

  def get_related_device_group_info
    return self.connection.select_json_array_by_index("SELECT li_json FROM view_library_items_unified_applications WHERE app_id = #{self.id} AND library_item_type = 'DeviceGroup'")
  end

  #-------------------------------------------------------------------------

  def get_related_library_item_ids
    return self.connection.select_integer_values_by_index("SELECT library_item_id FROM view_library_items_unified_applications WHERE app_id = #{self.id}")
  end

  #-------------------------------------------------------------------------

  def get_related_library_item_info
    return self.connection.select_json_array_by_index("SELECT li_json FROM view_library_items_unified_applications WHERE app_id = #{self.id}")
  end

  #-------------------------------------------------------------------------

  def get_related_user_ids
    return self.connection.select_integer_values_by_index("SELECT library_item_id FROM view_library_items_unified_applications WHERE app_id = #{self.id} AND library_item_type = 'User'")
  end

  #-------------------------------------------------------------------------

  def get_related_user_info
    return self.connection.select_json_array_by_index("SELECT li_json FROM view_library_items_unified_applications WHERE app_id = #{self.id} AND library_item_type = 'User'")
  end

  #-------------------------------------------------------------------------

  def get_related_user_group_ids
    return self.connection.select_integer_values_by_index("SELECT library_item_id FROM view_library_items_unified_applications WHERE app_id = #{self.id} AND library_item_type = 'UserGroup'")
  end

  #-------------------------------------------------------------------------

  def get_related_user_group_info
    return self.connection.select_json_array_by_index("SELECT li_json FROM view_library_items_unified_applications WHERE app_id = #{self.id} AND library_item_type = 'UserGroup'")
  end

  #-------------------------------------------------------------------------

  def is_enterprise?;   return (self.asset_type == 'EApp');         end
  def is_vpp?;          return self.asset_type.start_with?('VPP');  end

  #-------------------------------------------------------------------------

  def localized_data
    locales = ["'*'"]
    locales.push("'#{self.connection.quote_string(I18n.locale.to_s.downcase[0...2])}'") if I18n.locale
    sql = <<-SQL
      SELECT   dynamic_attributes
      FROM     assets_localized_data
      WHERE    asset_id = #{self.id}
        AND    locale IN (#{locales.join(',')})
      ORDER BY locale DESC
      LIMIT    1
    SQL
    return self.connection.select_json_value_by_index(sql)
  end # localized_data

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    # Add an array of library items this app is directly assigned to
    attr_hash['devices']       = self.get_related_device_info
    attr_hash['device_groups'] = self.get_related_device_group_info
    attr_hash['users']         = self.get_related_user_info
    attr_hash['user_groups']   = self.get_related_user_group_info

    attr_hash['device_assignable'] = ((attr_hash['supported_association_types'] & (VPPAppDeviceSNBit | EnterpriseAppBit)) != 0)
    attr_hash['maid_assignable']   = ((attr_hash['supported_association_types'] & (VPPAppMAIDBit | EnterpriseAppBit)) != 0)

    data = self.localized_data
    url  = nil
    if data
      data = data['metadata']
      if data
        attr_hash = data.merge(attr_hash) if extended
        attr_hash['name'] = data['name'] unless data['name'].empty?
        url = data['artwork'] && data['artwork']['url']         # EXAMPLE: http://is5.mzstatic.com/image/thumb/Purple3/v4/55/a1/5b/55a15b04-b974-390d-9ba3-e9a3a727d40b/source/{w}x{h}bb.{f}
        url = url.sub('{f}', 'png').gsub(/\{(w|h)\}/, '60') if url  # Make a URL for a 60x60 icon
      end
    end
    # We need to fix up the URL to the app icon for Enterprise apps (they're stored on our server)
    url ||= (attr_hash['icon_url'] || ((attr_hash['supported_devices'] & 16) ? 'generic_app_tv.png' : 'generic_app.png'))
    attr_hash['icon_url'] = "#{Settings.url_base}#{PM_IPA_URI_ROOT}/#{url}" unless url.start_with?('http')

    return attr_hash
  end # modify_attributes

  #-------------------------------------------------------------------------

  # We don't have to keep separate arrays of ids for the various library items. All four tables are children of library_items,
  # which all use a common id sequence and therefore there can be no overlap of ids between any of the types.
  def update_app_assignments(new_li_infos)
    cur_info_by_id = {}
    new_info_by_id = {}
    new_li_infos.each { |i| new_info_by_id[Integer(i['id'])] = i }                # new_li_infos is from the Internet and must be sanitized
    self.get_related_library_item_info.each { |i| cur_info_by_id[i['id']] = i }   # This is internal data which doesn't need to be sanitized

    new_li_ids = new_info_by_id.keys
    cur_li_ids = cur_info_by_id.keys

    remove_li_ids   = cur_li_ids - new_li_ids     # The apps to be unassigned
    assign_li_ids   = new_li_ids - cur_li_ids     # The apps to be assigned
    existing_li_ids = cur_li_ids - remove_li_ids  # Apps that were assigned and remain assigned (but might have had attributes change)
    app_id = self.id

    self.connection.execute("DELETE FROM library_items_assets WHERE asset_id = #{app_id} AND library_item_id IN (#{remove_li_ids.join(',')})") unless remove_li_ids.empty?

    li_ids = assign_li_ids.map { |id|
      info = new_info_by_id[id]
      a_mode = info['assignment_mode']
      a_mode = (a_mode == 'device' ? VPPAppDeviceSNBit : (a_mode == 'maid' ? VPPAppMAIDBit : VPPAppAppleIDBit))
      i_mode = (info['installation_mode'] == 'automatic' ? 'TRUE' : 'FALSE')
      "(#{app_id},#{id},#{a_mode},#{i_mode})"
    }
    self.connection.execute("INSERT INTO library_items_assets (asset_id, library_item_id, association_type, auto_push) VALUES #{li_ids.join(',')}") unless li_ids.empty?

    # Update any changed assignments
    changed = false
    existing_li_ids.each { |id|
      ni = new_info_by_id[id]
      ci = cur_info_by_id[id]
      a_mode = ni['assignment_mode']
      i_mode = ni['installation_mode']
      next if a_mode == ci['assignment_mode'] && i_mode == ci['installation_mode']

      a_mode = (a_mode == 'device' ? VPPAppDeviceSNBit : (a_mode == 'maid' ? VPPAppMAIDBit : VPPAppAppleIDBit))
      i_mode = (i_mode == 'automatic' ? 'TRUE' : 'FALSE')
      self.connection.execute("UPDATE library_items_assets SET association_type = #{a_mode}, auto_push = #{i_mode} WHERE asset_id = #{app_id} AND library_item_id = #{id}")
      changed = true
    } # existing_li_ids.each

    # Tell devicemgrd to sync licenses now, but only if we changed something
    unless !changed && remove_li_ids.empty? && assign_li_ids.empty?
      MDMUtilities.on_commit { MDMUtilities.sync_vpp_data } # Will not raise any exceptions
    end
  end # update_app_assignments

  #-------------------------------------------------------------------------

  def update_name(name)
    return if name.empty?
    self.connection.execute("UPDATE vpp_products SET name = '#{self.connection.quote_string(name)}' WHERE id = #{self.id}")
  end # update_name

  #-------------------------------------------------------------------------

  def update_supported_devices(supported_devices)
    self.connection.execute("UPDATE vpp_products SET supported_devices = #{supported_devices} WHERE id = #{self.id}")
  end # update_name

  #-------------------------------------------------------------------------

  include MDMRecordBase

#-------------------------------------------------------------------------
end # class UnifiedApplication
#-------------------------------------------------------------------------
