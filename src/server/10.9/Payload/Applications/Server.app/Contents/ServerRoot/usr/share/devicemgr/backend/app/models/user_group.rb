#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class UserGroup < ActiveRecord::Base

  has_one :profile, :foreign_key => 'library_item_id' # get_related_profile_ids
  has_many :users

  @@admin_required_attributes = [ 'jpeg_data', 'full_name', 'short_name', 'group_members', 'sub_groups', 'profile', 'total_users', 'total_groups' ]

  @@refreshed_guids    = Set.new([OpenDirectory::TooManyResultsGUID])  # This will prevent us from ever querying this invalid GUID
  @@refreshed_names    = Set.new

  #-------------------------------------------------------------------------

  def self.table_name
    return "abstract_user_groups"
  end

  #-------------------------------------------------------------------------

  def self.admin_required_attributes
    return @@admin_required_attributes
  end
  
  #-------------------------------------------------------------------------

  def before_save
    # We no longer create groups from Ruby code, so this should no longer be necessary:
    # self.library_item_type = 'UserGroup' # Rails will attempt to write NULL for things we don't explicitly set on new objects, which causes this column to fail the INSERT
    return true
  end

  #-------------------------------------------------------------------------

  def debug_name
    return "<#{self.class.to_s}:\"#{self.name}\">"
  end

  #-------------------------------------------------------------------------

  def also_modifies
    return [:devices]
  end

  #-------------------------------------------------------------------------

  def self.access_group
    return self.find_one(OpenDirectory::DeviceMgrAccessGroupName)
  end
  
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
  end

  #-------------------------------------------------------------------------

  def self.everyone_group
    result = self.find_by_sql("SELECT * FROM \"#{self.table_name}\" WHERE short_name = 'everyone' LIMIT 1")
    return (result ? result[0] : nil)
  end

  #-------------------------------------------------------------------------

  def self.exists?(group)
    return self.find_one(group) # Just fetch the group
  end

  #-------------------------------------------------------------------------

  def self.find_immediately_by_guid(guid, create = true)
    return nil if guid.nil?
    guid = User::NormalizeGUID(guid)

    count = 0
    begin
      count += 1
      begin # this could theoretically raise an exception
        user_group = UserGroup.find(:first, :conditions => ["guid=?", guid])    # No rails magic, thanks
      rescue Exception => e
        msg = e.message
        raise if msg.include?("current transaction is aborted") || msg.include?("could not serialize")   # We can't recover from these
        Rails.logger.info("No UserGroup record found for guid #{guid}") if MDMLogger.debugOutput?
        user_group = nil
      end
      if user_group.nil? && create
        found = OpenDirectory.immediate_query(OpenDirectory::ODQSearchTypeGroupsByODQuery, OpenDirectory::DS1AttrGeneratedUID, OpenDirectory::ODMatchEqualTo, guid)
        raise MDMUtilities::MDMRetryTransactionException if found     # The user's record is now cached in the DB, restart the transaction so we can see it
      end
    rescue ActiveRecord::StatementInvalid => e
      msg = e.message
      Rails.logger.warn("Failed to find or create UserGroup for guid #{guid} (#{msg})") if MDMLogger.debugOutput?
      raise if msg.include?("current transaction is aborted") || msg.include?("could not serialize")  # We can't recover from these
      raise MDMUtilities::MDMRetryTransactionException if msg.include?("duplicate key value")                       # Need to restart transaction to see the newly-added User record (but this should never happen now)
      user_group = nil
      retry if count == 1
    rescue MDMUtilities::MDMRetryTransactionException
      raise # Just send it up the chain for perform_in_transaction can catch it and restart the transaction
    rescue Exception => e
      Rails.logger.warn("Failed to find or create UserGroup for guid #{guid}")
      user_group = nil
    end

    return user_group
  end
  
  #-------------------------------------------------------------------------

  def self.find_one(spec, refresh = true)
    return nil unless spec
    return super if refresh.kind_of?(Hash) # This is a call from ActiveRecord::Base, send it on to super

    if spec.kind_of?(UserGroup)
      group = spec
    else
      col, val, guid = self.column_and_value_for_group(spec)
      sql = "SELECT * FROM #{self.table_name} WHERE #{col} = #{val} LIMIT 1"
      results = self.find_by_sql(sql)
      group = (results.length == 1 ? results[0] : nil)
    end

    refresh = false if group && group.last_synced && Time.now.getgm - group.last_synced < 60    # Don't sync more frequently than once per minute
    if refresh
      guid = group.guid if !guid && group
      self.refresh_cache_by_col_val_guid(col, val, guid)
    end

    return group
  end

  #-------------------------------------------------------------------------

  def self.get_attributes_for_multiple_by_id(ids, extended = false)
    groups_in = MDMUtilities::join_unsafe_collection_of_integers(ids, ',') { |id| id > 0 }
    return [] unless groups_in && groups_in != ''

    sql = <<-SQL
      SELECT *
      FROM   "#{self.table_name}"
      WHERE  id IN (#{groups_in})
    SQL
    groups = self.find_by_sql(sql)

    guids = []
    group_data = groups.collect { |g|
      guids.push(g.guid)
      g.get_attributes(extended)
    }
    self.refresh_cache_by_guids(guids)

    return group_data
  end

  #-------------------------------------------------------------------------

  def self.get_extended_attributed_if_updated(selected_item_id, xmin, xip_ints, xip_sql)
    # This method checks to see if the item specified should return updated data because
    # some of the other items needed to generate that extended data were updated
    # For UserGroup, we always just get the extended data hash and don't return it if
    # it wasn't updated. This is because the xmin is encoded into the extended data.
    ug = self.find_by_id(selected_item_id)
    return nil unless ug

    attrs = ug.get_attributes(true)
    attr_xmin = attrs['xmin']   # If there's no xmin value, it also means we don't have any extended data to update
    attrs = nil unless attr_xmin && (attr_xmin >= xmin || xip_ints.include?(attr_xmin))
    return attrs
  end

  #-------------------------------------------------------------------------

  def self.get_updated(xmin, xip_ints, xip_sql)
    sql = <<-SQL
      SELECT *
      FROM   view_all_valid_user_groups
      WHERE  updated_at_xid >= #{xmin}
    SQL
    sql += " OR updated_at_xid IN (#{xip_sql})" unless xip_sql == ''
    return self.find_by_sql(sql)
  end

  #-------------------------------------------------------------------------

  def self.parent_user_groups_for_user(user)
    user = User.find_one(user)  # Better to fetch user record than join on the users table
    return [] unless user

    sql = <<-SQL
      SELECT g.*
      FROM   view_all_valid_user_groups      AS g
      JOIN   view_all_user_groups_users_flat AS j
        ON   j.user_group_id = g.id
      WHERE  j.user_id       = #{user.id}
    SQL
    return self.find_by_sql(sql)
  end

  #-------------------------------------------------------------------------

  def self.refresh_cache_by_col_val_guid(col, val, guid, query_type = OpenDirectory::ODQSearchTypeGroupsByODQuery)
    # 'col' can only be one of 'guid', 'id', or 'short_name'. However we should never have col == 'id' without also having a valid guid
    guid ||= val if col == 'guid'
    if guid
      return if @@refreshed_guids.include?(guid)   # Already requested a refresh of this record

      OpenDirectory.queue_query(query_type, OpenDirectory::DS1AttrGeneratedUID, OpenDirectory::ODMatchEqualTo, guid)
      @@refreshed_guids.add(guid)
    elsif col == 'short_name'
      return if @@refreshed_names.include?(val)

      OpenDirectory.queue_query(query_type, OpenDirectory::DSNAttrRecordName, OpenDirectory::ODMatchEqualTo, val)
      @@refreshed_names.add(val)
    else
      Rails.logger.error("Unable to refresh group cache for col '#{col}' = #{val}")
    end
  end

  #-------------------------------------------------------------------------

  # 'guids' is an enumerable object
  def self.refresh_cache_by_guids(guids)
    guids = Set.new(guids) unless guids.kind_of?(Set)

    # Remove any objects we've already refreshed
    guids.subtract(@@refreshed_guids)
    return if guids.empty?

    OpenDirectory.queue_query(OpenDirectory::ODQSearchTypeGroupsByODQuery, OpenDirectory::DS1AttrGeneratedUID, OpenDirectory::ODMatchEqualTo, guids.to_a)
    @@refreshed_guids.merge(guids)
  end

  # --------------------------------------------------------------------------------------------

  def self.search_for_user_groups_matching(search_string, max_results = nil, refresh_cache = nil)
    max_results ||= MDMUtilities.max_library_items_for_display

    search = search_string.gsub(/([_%\|\\])/, '|\1').gsub(/'/, '\'\'')    # Escape the special characters in the search string
    Rails.logger.info("Escaped '#{search_string}' to '#{search}'") if MDMLogger.debugOutput?(2)

    # do prefix match for full_name and short_name
    sql = <<-SQL
      FROM   view_all_valid_user_groups
      WHERE  short_name ILIKE '%#{search}%' ESCAPE '|'
         OR  full_name  ILIKE '%#{search}%' ESCAPE '|'
    SQL
  
    count = self.count_by_sql("SELECT COUNT(*) #{sql} LIMIT #{max_results + 1}")
    count_str = (count <= max_results ? count.to_s : "more than #{max_results}")
    Rails.logger.info("UserGroup.search_for_users_matching('#{search_string}') found #{count_str} matches")

    if refresh_cache && count <= max_results
      OpenDirectory.queue_query(OpenDirectory::ODQSearchTypeFilterGroups, nil, 0, search_string)
    end
    return self.connection.select_integer_values_by_index("SELECT id #{sql} ORDER BY full_name ASC LIMIT #{max_results + 1}")
  end

  # --------------------------------------------------------------------------------------------

  def self.search_for_vpp_enabled_user_groups_matching(search_string)

    search = search_string.gsub(/([_%\|\\])/, '|\1').gsub(/'/, '\'\'')    # Escape the special characters in the search string
    Rails.logger.info("Escaped '#{search_string}' to '#{search}'") if MDMLogger.debugOutput?(2)

    # do prefix match for full_name and short_name
    sql = <<-SQL
      FROM   view_all_valid_user_groups
      WHERE  vpp_service_enabled IS TRUE
        AND (   short_name ILIKE '%#{search}%' ESCAPE '|'
             OR full_name  ILIKE '%#{search}%' ESCAPE '|')
    SQL
  
    return self.connection.select_integer_values_by_index("SELECT id #{sql} ORDER BY full_name ASC")
  end
  
  #-------------------------------------------------------------------------

  def self.user_group_ids_for_admin_app
    max_results = MDMUtilities.max_library_items_for_display

    sql = <<-SQL
      SELECT id, UPPER(COALESCE(full_name, short_name)) AS sort
      FROM   view_all_valid_user_groups
      ORDER BY sort ASC
      LIMIT #{max_results + 1}
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def self.vpp_enabled_user_group_ids_for_admin_app
    sql = <<-SQL
      SELECT id, UPPER(COALESCE(full_name, short_name)) AS sort
      FROM   view_all_valid_user_groups
      WHERE  vpp_service_enabled IS TRUE
      ORDER BY sort ASC
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def self.user_is_member_of_group(user, group, deep = true, where = nil)
    # It's better to fetch the user/group records than join on the additional tables
    user  = User.find_one(user)
    group = UserGroup.find_one(group) unless where
    return false unless user && (group || where)

    table = (deep ? 'view_all_user_groups_users_flat' : 'view_all_user_groups_users_complete')

    user.refresh_cache
    UserGroup.refresh_cache_by_col_val_guid(nil, nil, group.guid, deep ? OpenDirectory::ODQSearchTypeParentMembership : OpenDirectory::ODQSearchTypeGroupsByODQuery) if group

    if where
      sql = <<-SQL    # We already have a user id, but we need to find a matching group's id before we consult the join table
        SELECT COUNT(j.*)
        FROM   "#{table}"                AS j
        JOIN   "#{UserGroup.table_name}" AS g
          ON   j.user_group_id = g.id
        WHERE  j.user_id = #{user.id}
          AND  (#{where})
        LIMIT  1
      SQL
    else
      sql = <<-SQL    # We already have ids for both user and group, so we can directly consult the join table
        SELECT COUNT(j.*)
        FROM   #{table} AS j
        WHERE  j.user_id       = #{user.id}
          AND  j.user_group_id = #{group.id}
        LIMIT  1
      SQL
    end
    return (self.count_by_sql(sql) > 0)
  end

  #-------------------------------------------------------------------------

  def add_extended_attributes(attr_hash)
    attr_hash['apps']                 = self.get_related_app_ids
    attr_hash['enrollment_settings']  = DeviceEnrollmentSettings.get_device_enrollment_settings(self)
    attr_hash['inherited_privileges'] = self.inherited_privileges

    if Settings.get_settings.vpp_service_state == 3   # 0 = disabled, 1 = sToken expired, 2 = orphaned by another server, 3 = enabled
      sql = "SELECT dm_vpp_get_enrollment_data_for_user_group(#{self.id})"
      json = self.connection.select_string_values_by_index(sql)   # This returns a JSON-formatted string because it's a complex structure that SQL can't represent easily
      json = JSON.parse(json[0])
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
      attr_hash['books']     = self.get_related_book_ids
      attr_hash['book_data'] = self.get_book_data
    end
    return attr_hash
  end

  #-------------------------------------------------------------------------

  # NOTE: ancestor user groups means all parent user groups and all of their recursive parent user groups
  def all_ancestor_user_groups
    sql = <<-SQL
      SELECT g.*
      FROM   view_all_valid_user_groups AS g
      JOIN   view_all_user_groups_flat  AS j
        ON   j.parent_id = g.id
      WHERE  j.child_id  = #{self.id}
    SQL
    return UserGroup.find_by_sql(sql)
  end

  #-------------------------------------------------------------------------

  def get_all_profiles
    # The profiles for this group are any attached directly to it, or any of it's parent groups
    sql = <<-SQL
        SELECT p.*                                -- Profile on this user_group
        FROM   "#{Profile.table_name}" AS p
        WHERE  p.library_item_id = #{self.id}
      UNION
        SELECT p.*                                -- Profiles on all ancestor user_groups of this user_group
        FROM   "#{Profile.table_name}" AS p
        JOIN   view_all_user_groups_flat   AS j
          ON   p.library_item_id = j.parent_id
        WHERE  j.child_id = #{self.id}
    SQL
    return Profile.find_by_sql(sql)
  end
  
  #-------------------------------------------------------------------------

  def get_all_users
    return User::get_all_users_for_group(self)
  end
  
  #-------------------------------------------------------------------------

  def get_app_data
    sql = "SELECT dm_app_info_for_user_group(#{self.id})"
    json = self.connection.select_string_values_by_index(sql)   # This returns a JSON-formatted string because it's a complex structure that SQL can't represent easily
    return JSON.parse(json[0])
  end

  #-------------------------------------------------------------------------

  def get_book_data
    sql = "SELECT dm_vpp_book_license_info_for_user_group(#{self.id})"
    json = self.connection.select_string_values_by_index(sql)   # This returns a JSON-formatted string because it's a complex structure that SQL can't represent easily
    return JSON.parse(json[0])
  end

  #-------------------------------------------------------------------------

  def get_related_book_ids
    sql = <<-SQL
      SELECT book_id
      FROM   view_vpp_books_user_groups
      WHERE  user_group_id = #{self.id}
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def get_related_profile_ids
    return self.connection.select_integer_values_by_index("SELECT id FROM \"#{Profile.table_name}\" WHERE library_item_id = #{self.id} LIMIT 1")
  end

  #-------------------------------------------------------------------------

  def get_all_device_ids(where = nil)
    # This function returns all the devices owned by the users in the group
    where = (where ? "AND  (#{where})" : '')
    sql = <<-SQL
      SELECT DISTINCT d.id
      FROM   devices AS d
      JOIN   view_all_user_groups_users_flat AS j
        ON   d.user_id = j.user_id
      WHERE  j.user_group_id = #{self.id}
        #{where}
    SQL
    return UserGroup.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def member?(user, deep = true)
    return UserGroup::user_is_member_of_group(user, self, deep)
  end

  #-------------------------------------------------------------------------

  def member_group_ids
    self.refresh_cache
    sql = <<-SQL
      SELECT   g.id, UPPER(COALESCE(g.full_name, g.short_name)) AS sort
      FROM     view_all_valid_user_groups      AS g
      JOIN     abstract_user_group_memberships AS j
        ON     j.child_id  = g.id
      WHERE    j.parent_id = #{self.id}
      ORDER BY sort ASC
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def member_user_ids
    self.refresh_cache
    sql = <<-SQL
      SELECT   u.id, UPPER(COALESCE(u.full_name, u.short_name)) AS sort
      FROM     view_all_valid_users                AS u
      JOIN     view_all_user_groups_users_complete AS j
        ON     j.user_id = u.id
      WHERE    j.user_group_id = #{self.id}
      ORDER BY sort ASC
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def inherited_privileges
    sql = <<-SQL
      SELECT bit_or(g.privileges)            AS privileges
      FROM   view_all_valid_user_groups      AS g
      JOIN   abstract_user_group_memberships AS j
        ON   j.parent_id = g.id
      WHERE  j.child_id  = #{self.id}
    SQL
    result = self.connection.select_integer_values_by_index(sql)
    return (result[0] || 0)
  end

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    attr_hash.delete('od_node_id')
    attr_hash['profile']       = self.get_related_profile_ids[0]
    attr_hash['group_members'] = self.member_user_ids
    attr_hash['sub_groups']    = self.member_group_ids

    # Pull in the photo only for non-extended, and all data for extended
    ext = self.library_item_metadata
    if ext
      ext_attr = ext.get_attributes(true)
      attr_hash['jpeg_data'] = Base64.encode64(ext_attr['jpeg_data']) if ext_attr.has_key?('jpeg_data')
      if extended 
        ext_attr.delete('id')           # Don't include these keys
        ext_attr.delete('jpeg_data')
        attr_hash.merge!(ext_attr)
      end
    end

    attr_hash = self.add_extended_attributes(attr_hash) if extended
    attr_hash['has_complete_data'] = extended

    return attr_hash
  end
  
  #-------------------------------------------------------------------------

  def name
    return self.full_name || self.short_name
  end

  #-------------------------------------------------------------------------

  def parent_user_groups
    sql = <<-SQL
      SELECT g.*
      FROM   view_all_valid_user_groups AS g
      JOIN   abstract_user_group_memberships AS j
        ON   j.parent_id = g.id
      WHERE  j.child_id  = #{self.id}
    SQL
    return UserGroup.find_by_sql(sql)
  end

  #-------------------------------------------------------------------------

  def profile=(p)
    my_id = self.id
    return unless my_id

    if p
      p = p.id if p.is_a?(Profile)
      sql = <<-SQL
        UPDATE "#{Profile.table_name}"
        SET    user_group_id = #{my_id}
        WHERE  id = #{Integer(p)}
      SQL
    else
      sql = <<-SQL
      DELETE FROM "#{Profile.table_name}"
      WHERE       user_group_id = #{my_id}
      SQL
    end
    self.connection.execute(sql)
  end

  #-------------------------------------------------------------------------

  def refresh_cache
    UserGroup::refresh_cache_by_col_val_guid(nil, nil, self.guid) unless Time.now.getgm - self.last_synced < 60  # Don't sync more frequently than once per minute
  end

  #-------------------------------------------------------------------------

  def revoke_vpp_invitations
    self.connection.execute("SELECT dm_vpp_revoke_invitations_for_user_group(#{self.id})")
  end
  
  #-------------------------------------------------------------------------

  def send_vpp_invitation_to_devices(members)
    all = (members == 'unenrolled' ? 'TRUE' : 'FALSE')
    self.connection.execute("SELECT dm_vpp_create_device_invite_tasks_for_user_group(#{self.id}, #{all})")
  end

  #-------------------------------------------------------------------------

  def send_vpp_invitation_by_email(members)
    all = (members == 'unenrolled' ? 'TRUE' : 'FALSE')
    self.get_all_users.each { |user|
      metadata = user.library_item_metadata
      metadata.locale = I18n.locale.to_s
      metadata.save
    }
    self.connection.execute("SELECT dm_vpp_create_email_invite_tasks_for_user_group(#{self.id}, #{all})")
  end

  #-------------------------------------------------------------------------

  def update_app_assignments(new_app_ids)
    UnifiedApplication.update_app_assignments(self, new_app_ids)
  end
  
  #-------------------------------------------------------------------------

  def update_book_assignments(new_book_ids)
    Book.update_book_assignments(self, self.get_related_book_ids, new_book_ids)
  end
  
  #-------------------------------------------------------------------------

  def update_enrollment_settings(settings)
    DeviceEnrollmentSettings.update_device_enrollment_settings(self, settings)
  end

  #-------------------------------------------------------------------------
  
  include MDMRecordBase
  include MDMLibraryItemBase

end
