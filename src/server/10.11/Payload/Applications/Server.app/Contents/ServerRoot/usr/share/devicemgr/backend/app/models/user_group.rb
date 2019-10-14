#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class UserGroup < ActiveRecord::Base
#-------------------------------------------------------------------------

  has_many :users

  @@admin_required_attributes = [ 'jpeg_data', 'full_name', 'short_name', 'group_members', 'sub_groups', 'profile', 'total_users', 'total_groups', 'passcode_policy' ]

  @@refreshed_guids    = Set.new([OpenDirectory::TooManyResultsGUID])  # This will prevent us from ever querying this invalid GUID
  @@refreshed_names    = Set.new

  #-------------------------------------------------------------------------

  def self.table_name;  return 'user_groups';    end

  #-------------------------------------------------------------------------

  def self.admin_required_attributes; return @@admin_required_attributes;                             end
  def self.access_group;              return self.find_one(OpenDirectory::DeviceMgrAccessGroupName);  end

  #-------------------------------------------------------------------------

  def self.column_and_value_for_group(group)
    raise ArgumentError, "Invalid (nil) group specification" unless group

    if group.kind_of?(UserGroup)
      val  = group.id
      col  = 'id'
      guid = group.guid
    elsif group.kind_of?(String)
      val = User::NormalizeGUID(group)
      col = 'guid'
      if val == ''
        val = group
        col = 'short_name'
      else
        guid = val
      end

      raise ArgumentError, "Invalid group specification '#{group}'" if val.empty?

      val = "'#{val}'"    # Quote the value so it's ready to insert into SQL
    elsif group.kind_of?(Numeric)
      col  = 'id'
      val  = group.to_i
    else
      raise ArgumentError, "Invalid group specification '#{group}'"
    end
    return col, val, guid
  end # self.column_and_value_for_group

  #-------------------------------------------------------------------------

  def self.everyone_group_id
    result = self.select_integer_values_by_index("SELECT id FROM #{self.table_name} WHERE short_name = 'everyone' LIMIT 1")
    return (result ? result[0] : nil)
  end # self.everyone_group_id

  #-------------------------------------------------------------------------

  def self.exists?(group);  return self.find_one(group);    end # Just fetch the group

  #-------------------------------------------------------------------------

  def self.find_immediately_by_guid(guid, create = true)
    return nil if guid.empty?
    guid = User::NormalizeGUID(guid)

    count = 0
    begin
      count += 1
      begin # this could theoretically raise an exception
        user_group = UserGroup.find(:first, :conditions => ['guid=?', guid])    # No rails magic, thanks
      rescue Exception => e
        msg = e.message
        raise if msg.include?('current transaction is aborted') || msg.include?('could not serialize')   # We can't recover from these
        Rails.logger.info("No UserGroup record found for guid #{guid}") if MDMLogger.debugOutput?
        user_group = nil
      end
      if user_group.nil? && create
        found = OpenDirectory.immediate_query(OpenDirectory::ODQSearchTypeGroupsByODQuery, OpenDirectory::DS1AttrGeneratedUID, OpenDirectory::ODMatchEqualTo, guid)
        raise MDMUtilities::MDMRetryTransaction if found     # The user's record is now cached in the DB, restart the transaction so we can see it
      end
    rescue ActiveRecord::StatementInvalid => e
      msg = e.message
      Rails.logger.warn("Failed to find or create UserGroup for guid #{guid} (#{msg})") if MDMLogger.debugOutput?
      raise if msg.include?('current transaction is aborted') || msg.include?('could not serialize')  # We can't recover from these
      raise MDMUtilities::MDMRetryTransaction if msg.include?('duplicate key value')                       # Need to restart transaction to see the newly-added User record (but this should never happen now)
      user_group = nil
      retry if count == 1
    rescue MDMUtilities::MDMRetryTransaction
      raise # Just send it up the chain for perform_in_transaction can catch it and restart the transaction
    rescue Exception => e
      Rails.logger.warn("Failed to find or create UserGroup for guid #{guid}")
      user_group = nil
    end

    return user_group
  end # self.find_immediately_by_guid

  #-------------------------------------------------------------------------

  def self.find_one(spec, refresh = true)
    return nil unless spec
    return super if refresh.kind_of?(Hash) # This is a call from ActiveRecord::Base, send it on to super

    if spec.kind_of?(UserGroup)
      group = spec
    else
      col, val, guid = self.column_and_value_for_group(spec)
      results = self.find_by_sql("SELECT * FROM #{self.table_name} WHERE #{col} = #{val} LIMIT 1")
      group = (results.length == 1 ? results[0] : nil)
    end

    refresh = false if group && group.last_synced && Time.now.getgm - group.last_synced < 60    # Don't sync more frequently than once per minute
    if refresh
      guid ||= group.guid if group
      self.refresh_cache_by_col_val_guid(col, val, guid)
    end

    return group
  end # self.find_one

  #-------------------------------------------------------------------------

  def self.get_attributes_for_multiple_by_id(ids, extended = false)
    groups_in = MDMUtilities::join_unsafe_collection_of_integers(ids, ',') { |id| id > 0 }
    return [] if groups_in.empty?

    groups = self.find_by_sql("SELECT * FROM #{self.table_name} WHERE id IN (#{groups_in})")
    guids = []
    group_data = groups.collect { |g|
      guids.push(g.guid)
      g.get_attributes(extended)
    }
    self.refresh_cache_by_guids(guids)
    return group_data
  end # self.get_attributes_for_multiple_by_id

  #-------------------------------------------------------------------------

  def self.parent_user_group_ids_for_user(user)
    user = User.find_one(user)  # Better to fetch user record than join on the users table
    return (user ? self.connection.select_integer_values_by_index("SELECT id FROM view_active_user_parents WHERE user_id = #{user.id}") : [])
  end # self.parent_user_group_ids_for_user

  #-------------------------------------------------------------------------

  def self.refresh_cache_by_col_val_guid(col, val, guid, query_type = OpenDirectory::ODQSearchTypeGroupsByODQuery)
    # 'col' can only be one of 'guid', 'id', or 'short_name'. However we should never have col == 'id' without also having a valid guid
    guid ||= val if col == 'guid'
    if guid
      return if @@refreshed_guids.include?(guid) || MDMUtilities.read_only_transaction?  # Already requested a refresh of this record, or we can't because we're in a read-only transaction

      OpenDirectory.queue_query(query_type, OpenDirectory::DS1AttrGeneratedUID, OpenDirectory::ODMatchEqualTo, guid)
      @@refreshed_guids.add(guid)
    elsif col == 'short_name'
      return if @@refreshed_names.include?(val) || MDMUtilities.read_only_transaction?

      OpenDirectory.queue_query(query_type, OpenDirectory::DSNAttrRecordName, OpenDirectory::ODMatchEqualTo, val)
      @@refreshed_names.add(val)
    else
      Rails.logger.error("Unable to refresh group cache for col '#{col}' = #{val}")
    end
  end # self.refresh_cache_by_col_val_guid

  #-------------------------------------------------------------------------

  # 'guids' is an enumerable object
  def self.refresh_cache_by_guids(guids)
    guids = Set.new(guids) unless guids.kind_of?(Set)
    guids.subtract(@@refreshed_guids)   # Remove any objects we've already refreshed
    return if guids.empty?

    OpenDirectory.queue_query(OpenDirectory::ODQSearchTypeGroupsByODQuery, OpenDirectory::DS1AttrGeneratedUID, OpenDirectory::ODMatchEqualTo, guids.to_a)
    @@refreshed_guids.merge(guids)
  end # self.refresh_cache_by_guids

  # --------------------------------------------------------------------------------------------

  def self.search_for_user_groups_matching(search_string, max_results = nil, refresh_cache = nil)
    max_results ||= MDMUtilities.max_library_items_for_display

    search = self.connection.quote_string(search_string.gsub(/([_%\|\\])/, '|\1'))    # Escape the special characters in the search string
    Rails.logger.info("Escaped '#{search_string}' to '#{search}'") if MDMLogger.debugOutput?(2)

    # do prefix match for full_name and short_name
    sql = <<-SQL
      FROM   view_all_valid_user_groups
      WHERE  short_name ILIKE '%#{search}%' ESCAPE '|'
         OR  full_name  ILIKE '%#{search}%' ESCAPE '|'
    SQL

    found = self.connection.select_integer_values_by_index("SELECT id #{sql} ORDER BY LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC LIMIT #{max_results + 1}")
    count = found.length
    if refresh_cache && count <= max_results
      OpenDirectory.queue_query(OpenDirectory::ODQSearchTypeFilterGroups, nil, 0, search_string)
      found = self.connection.select_integer_values_by_index("SELECT id #{sql} ORDER BY LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC LIMIT #{max_results + 1}")
      count = found.length
    end
    count_str = (count <= max_results ? count.to_s : "more than #{max_results}")
    Rails.logger.info("UserGroup.search_for_user_groups_matching('#{search_string}') found #{count_str} matches")
    return found
  end # self.search_for_user_groups_matching

  # --------------------------------------------------------------------------------------------

  def self.search_for_vpp_enabled_user_groups_matching(search_string)
    search = self.connection.quote_string(search_string.gsub(/([_%\|\\])/, '|\1'))    # Escape the special characters in the search string
    Rails.logger.info("Escaped '#{search_string}' to '#{search}'") if MDMLogger.debugOutput?(2)

    # do prefix match for full_name and short_name
    sql = <<-SQL
      FROM   view_all_valid_user_groups
      WHERE  vpp_service_enabled
        AND (   short_name ILIKE '%#{search}%' ESCAPE '|'
             OR full_name  ILIKE '%#{search}%' ESCAPE '|')
    SQL
    return self.connection.select_integer_values_by_index("SELECT id #{sql} ORDER BY LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC")
  end # self.search_for_vpp_enabled_user_groups_matching

  #-------------------------------------------------------------------------

  def self.user_group_ids_for_admin_app
    max_results = MDMUtilities.max_library_items_for_display

    # Sort first by library_item_type to get active groups first, then sort the whole thing again by name to make the UI look right
    sql = <<-SQL
      WITH sub AS (
        SELECT   LOWER(order_name) AS lon, order_name, id
        FROM     view_all_valid_user_groups
        ORDER BY library_item_type ASC, LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC
        LIMIT    #{max_results + 1}
      )
      SELECT id FROM sub ORDER BY lon ASC, order_name DESC, id ASC
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end # self.user_group_ids_for_admin_app

  #-------------------------------------------------------------------------

  def self.vpp_enabled_user_group_ids_for_admin_app
    sql = <<-SQL
      SELECT   id
      FROM     view_all_valid_user_groups
      WHERE    vpp_service_enabled
      ORDER BY LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end # self.vpp_enabled_user_group_ids_for_admin_app

  #-------------------------------------------------------------------------

  def self.user_is_member_of_group(user, group, deep = true, where = nil)
    # It's better to fetch the user/group records than join on the additional tables
    user  = User.find_one(user)
    group = UserGroup.find_one(group) unless where
    return false unless user && (group || where)

    table = (deep ? 'view_all_user_groups_users_flat' : 'view_all_user_groups_users_complete')

    # If deep is false, we only seach the immediate membership, so we only need to refresh the group's record (including children).
    # For deep = true, we can either do a recursive parent search on the *user*, or a recursive descendant search on the *group*. We choose,
    # mostly arbitrarily, the latter here.
    user.refresh_cache
    UserGroup.refresh_cache_by_col_val_guid(nil, nil, group.guid, deep ? OpenDirectory::ODQSearchTypeChildMembership : OpenDirectory::ODQSearchTypeGroupsByODQuery) if group

    if where
      sql = <<-SQL    # We already have a user id, but we need to find a matching group's id before we consult the join table
        SELECT 1
        FROM   #{table}                AS j
        JOIN   #{UserGroup.table_name} AS g ON (j.user_group_id = g.id)
        WHERE  j.user_id = #{user.id}
          AND  (#{where})
        LIMIT  1
      SQL
    else
      sql = <<-SQL    # We already have ids for both user and group, so we can directly consult the join table
        SELECT 1
        FROM   #{table} AS j
        WHERE  j.user_id       = #{user.id}
          AND  j.user_group_id = #{group.id}
        LIMIT  1
      SQL
    end
    return self.connection.select_exists?(sql)
  end # self.user_is_member_of_group

  #-------------------------------------------------------------------------

  def also_modifies;  return [ :devices ];                            end
  def debug_name;     return "<#{self.class.to_s}:\"#{self.name}\">"; end

  #-------------------------------------------------------------------------

  def add_extended_attributes(attr_hash)
    attr_hash['apps']                 = self.get_related_app_info
    attr_hash['managed_apps']         = self.get_related_managed_app_ids
    attr_hash['managed_books']        = self.get_related_managed_book_ids
    attr_hash['enrollment_settings']  = DeviceEnrollmentSettings.get_device_enrollment_settings(self)
    attr_hash['inherited_privileges'] = self.inherited_privileges
    attr_hash['osx_eapp_eligible_devices'] = self.get_all_device_ids_for_task('PushOSXEnterpriseApplications')
    attr_hash['enrolled_devices'] = self.get_all_device_ids('d.token IS NOT NULL')

    if Settings.get_settings.vpp_service_state == 3   # 0 = disabled, 1 = sToken expired, 2 = orphaned by another server, 3 = enabled
      json = self.connection.select_json_value_by_index("SELECT dm_vpp_get_enrollment_data_for_user_group(#{self.id})")
      Rails.logger.info("dm_vpp_get_enrollment_data_for_user_group: #{json}") if MDMLogger.debugOutput?(3)

      # Clean up the data a bit
      if json['members_enrolled'] == 0
        json.delete('enrolled_at_min')
        json.delete('enrolled_at_max')
      else
        # Convert the time strings in the JSON into proper Time objects so they get converted back to the format the admin expects
        json['enrolled_at_min'] = Time.time_at_utc_from_sql_string(json['enrolled_at_min'])
        json['enrolled_at_max'] = Time.time_at_utc_from_sql_string(json['enrolled_at_max'])
      end
      if json['members_device_invited'] == 0
        json.delete('device_invited_at_min')
        json.delete('device_invited_at_max')
      else
        # Convert the time strings in the JSON into proper Time objects so they get converted back to the format the admin expects
        json['device_invited_at_min'] = Time.time_at_utc_from_sql_string(json['device_invited_at_min'])
        json['device_invited_at_max'] = Time.time_at_utc_from_sql_string(json['device_invited_at_max'])
      end
      if json['members_email_invited'] == 0
        json.delete('email_invited_at_min')
        json.delete('email_invited_at_max')
      else
        # Convert the time strings in the JSON into proper Time objects so they get converted back to the format the admin expects
        json['email_invited_at_min'] = Time.time_at_utc_from_sql_string(json['email_invited_at_min'])
        json['email_invited_at_max'] = Time.time_at_utc_from_sql_string(json['email_invited_at_max'])
      end

      attr_hash.merge!(json)

      attr_hash['app_data']  = self.get_app_data
      attr_hash['books']     = self.get_related_unified_book_ids
      attr_hash['book_data'] = self.get_book_data
    else
      attr_hash['books']     = Ebook.get_all_book_ids_for_library_item(self)
      attr_hash['book_data'] = self.get_book_data
    end

    attr_hash['parent_user_groups'] = self.parent_user_group_ids
    return attr_hash
  end # add_extended_attributes

  #-------------------------------------------------------------------------

  # NOTE: ancestor user groups means all parent user groups and all of their recursive parent user groups
  def all_ancestor_user_groups
    sql = <<-SQL
      SELECT g.*
      FROM   view_all_valid_user_groups AS g
      JOIN   view_all_user_groups_flat  AS j ON (j.parent_id = g.id)
      WHERE  j.child_id = #{self.id}
    SQL
    return UserGroup.find_by_sql(sql)
  end # all_ancestor_user_groups

  #-------------------------------------------------------------------------

  def get_all_profiles
    # The profiles for this group are any attached directly to it, or any of it's parent groups
    sql = <<-SQL
        SELECT *                                  -- Profile on this user_group
        FROM   #{Profile.table_name}
        WHERE  library_item_id = #{self.id}
      UNION
        SELECT p.*                                -- Profiles on all ancestor user_groups of this user_group
        FROM   #{Profile.table_name}     AS p
        JOIN   view_all_user_groups_flat AS j ON (p.library_item_id = j.parent_id)
        WHERE  j.child_id = #{self.id}
    SQL
    return Profile.find_by_sql(sql)
  end # get_all_profiles

  #-------------------------------------------------------------------------

  def get_app_data;   return (self.connection.select_json_value_by_index("SELECT dm_app_info_for_user_group(#{self.id})")   || []); end
  def get_book_data;  return (self.connection.select_json_value_by_index("SELECT dm_media_info_for_user_group(#{self.id})") || []); end
  def make_active;    self.connection.execute("SELECT dm_make_user_group_active(#{self.id})"); self.reload                          end

  def member?(user, deep = true); return UserGroup::user_is_member_of_group(user, self, deep);  end

  #-------------------------------------------------------------------------

  def member_group_ids
    self.refresh_cache
    sql = <<-SQL
      SELECT id
      FROM   view_all_valid_user_groups
      WHERE  id IN (SELECT child_id FROM user_group_memberships WHERE parent_id = #{self.id})
      ORDER BY LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end # member_group_ids

  #-------------------------------------------------------------------------

  def member_user_ids
    self.refresh_cache
    sql = <<-SQL
      SELECT   id
      FROM     view_all_valid_users
      WHERE    id IN (SELECT user_id FROM view_user_groups_users_complete WHERE user_group_id = #{self.id})
      ORDER BY LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end # member_user_ids

  #-------------------------------------------------------------------------

  def inherited_privileges
    sql = <<-SQL
      SELECT bit_or(privileges) AS privileges
      FROM   view_all_valid_user_groups
      WHERE  id IN (SELECT parent_id FROM user_group_memberships WHERE child_id  = #{self.id})
    SQL
    result = self.connection.select_integer_values_by_index(sql)
    return (result[0] || 0)
  end # inherited_privileges

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    attr_hash.delete('od_node_id')
    attr_hash['profile'] = self.get_related_profile_ids[0]

    result = self.connection.select_integer_values_by_index("SELECT id FROM view_active_user_groups WHERE id = #{self.id}")
    is_active = (result.length > 0)
    attr_hash['is_active'] = is_active

    # fill this value only if we are in mirror mode or this is an active user group
    if is_active || Settings.get_settings.od_sync_mode == 3
      attr_hash['group_members'] = self.member_user_ids
      attr_hash['sub_groups']    = self.member_group_ids
    end

    # Pull in the photo only for non-extended, and all data for extended
    ext = self.library_item_metadata
    ext_attr = ext.get_attributes(true)
    attr_hash['jpeg_data'] = Base64.encode64(ext_attr['jpeg_data']) if ext_attr.has_key?('jpeg_data')
    if extended
      ext_attr.delete('id')           # Don't include these keys
      ext_attr.delete('jpeg_data')
      attr_hash.merge!(ext_attr)
      attr_hash['os_updates']               = self.get_os_updates_info
      attr_hash['admin_accounts']           = self.get_all_auto_admin_short_names
      attr_hash['edu_mode_cached_accounts'] = self.get_edu_devices_user_info
      attr_hash                             = self.add_extended_attributes(attr_hash)
    end # if extended

    attr_hash['has_complete_data'] = extended
    return attr_hash
  end # modify_attributes

  #-------------------------------------------------------------------------

  def name;                   return (self.full_name || self.short_name);                                                                                         end
  def parent_user_group_ids;  return self.connection.select_integer_values_by_index("SELECT id FROM view_active_user_group_parents WHERE child_id = #{self.id}"); end
  def refresh_cache;          UserGroup::refresh_cache_by_col_val_guid(nil, nil, self.guid) unless Time.now.getgm - self.last_synced < 60;                        end
  def revoke_vpp_invitations; self.connection.execute("SELECT dm_vpp_revoke_invitations_for_user_group(#{self.id})");                                             end

  #-------------------------------------------------------------------------

  def send_vpp_invitation_to_devices(members)
    all = (members == 'unenrolled' ? 'TRUE' : 'FALSE')
    self.connection.execute("SELECT dm_vpp_create_device_invite_tasks_for_user_group(#{self.id}, #{all})")
  end # send_vpp_invitation_to_devices

  #-------------------------------------------------------------------------

  def send_vpp_invitation_by_email(members)
    all = (members == 'unenrolled' ? 'TRUE' : 'FALSE')
    loc = self.connection.quote_string(I18n.locale.to_s)
    self.connection.execute("SELECT dm_vpp_create_email_invite_tasks_for_user_group(#{self.id}, '#{loc}', #{all})")
  end # send_vpp_invitation_by_email

  #-------------------------------------------------------------------------

  def update_app_assignments(new_app_ids);    UnifiedApplication.update_app_assignments(self, new_app_ids);               end
  def update_book_assignments(new_book_ids);  UnifiedBook.update_book_assignments(self, new_book_ids);                    end
  def update_enrollment_settings(settings);   DeviceEnrollmentSettings.update_device_enrollment_settings(self, settings); end

  #-------------------------------------------------------------------------

  include MDMRecordBase
  include MDMLibraryItemBase

#-------------------------------------------------------------------------
end # class UserGroup
#-------------------------------------------------------------------------
