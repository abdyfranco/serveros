#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class User < ActiveRecord::Base

  has_one :profile, :foreign_key => 'library_item_id' # get_related_profile_ids
  has_many :devices                                   # get_related_devices_ids

  @@admin_required_attributes = [ 'jpeg_data', 'full_name', 'first_name', 'last_name', 'short_name', 'email', 'mobile_phone', 'profile' ]

  @@refreshed_guids    = Set.new([OpenDirectory::TooManyResultsGUID])  # This will prevent us from ever querying this invalid GUID
  @@refreshed_names    = Set.new
  @@refreshed_searches = Set.new

  # Do not change these associations unless you intend to rebuild all profile caches
  VALID_SUBSTITUTION_KEYS = { "email"         => (1 << 0),   # These must match the Obj-C and SQL code
                              "email_address" => (1 << 0),  # Alias
                              "EMailAddress"  => (1 << 0),  # Alias
                              "first_name"    => (1 << 1),
                              "FirstName"     => (1 << 1),  # Alias
                              "full_name"     => (1 << 2),
                              "RealName"      => (1 << 2),  # Alias
                              "guid"          => (1 << 3),
                              "GeneratedID"   => (1 << 3),  # Alias
                              "last_name"     => (1 << 4),
                              "LastName"      => (1 << 4),  # Alias
                              "job_title"     => (1 << 5),
                              "JobTitle"      => (1 << 5),  # Alias
                              "mobile_phone"  => (1 << 6),
                              "MobileNumber"  => (1 << 6),  # Alias
                              "short_name"    => (1 << 7),
                              "RecordName"    => (1 << 7)   # Alias
                            }

  # We need to provide method aliases for the aliased substitution keys
  def email_address ; return self.email ; end
  def EMailAddress ;  return self.email ; end
  def FirstName ;     return self.first_name ; end
  def RealName ;      return self.full_name ; end
  def GeneratedID ;   return self.guid ; end
  def LastName ;      return self.last_name ; end
  def JobTitle ;      return self.job_title ; end
  def MobileNumber ;  return self.mobile_phone ; end
  def RecordName ;    return self.short_name ; end

  #-------------------------------------------------------------------------

  def self.table_name
    # We use the abstract table so we see all users. We never need to do inserts, and row updates will automatically
    # target the correct table.
    return "abstract_users"
  end

  #-------------------------------------------------------------------------

  def self.admin_required_attributes
    return @@admin_required_attributes
  end
  
  #-------------------------------------------------------------------------

  def self.NormalizeGUID(value)
    return nil if value.nil?
    value = value.upcase.tr('^-0-9A-F', '')
    return (value.length == 36 ? value : "")
  end

  #-------------------------------------------------------------------------

  def self.bit_for_substitution_key(key)
    return VALID_SUBSTITUTION_KEYS[key]
  end

  #-------------------------------------------------------------------------

  def self.column_and_value_for_user(user)
    raise ArgumentError, "Invalid (nil) user specification" unless user

    if user.kind_of?(User)
      val  = user.id
      col  = 'id'
      guid = user.guid
    elsif user.kind_of?(String)
      val = User::NormalizeGUID(user)
      col = 'guid'
      if val == ''
        val = user
        col = 'short_name'
      else
        guid = val
      end

      raise ArgumentError, "Invalid user specification '#{user}'" if val.empty?
      val = "'#{val}'"
    elsif user.kind_of?(Numeric)
      col  = 'id'
      val  = user.to_i
    else
      raise ArgumentError, "Invalid user specification '#{user}'"
    end
    return col, val, guid
  end

  #-------------------------------------------------------------------------

  def self.exists?(user)
    return User.find_one(user)  # Just load the user
  end

  #-------------------------------------------------------------------------

  # This method must go look into OD directly as it needs to return an authoritative answer immediately
  def self.find_immediately_by_guid(guid, create = true)
    return nil if guid.nil?
    guid = User::NormalizeGUID(guid)

    count = 0
    begin
      count += 1
      begin # this could theoretically raise an exception
        user = User.find(:first, :conditions => ["guid=?", guid])        # No rails magic, thanks
      rescue Exception => e
        msg = e.message
        raise if msg.include?("current transaction is aborted") || msg.include?("could not serialize")   # We can't recover from these
        Rails.logger.info("No User record found for guid #{guid}") if MDMLogger.debugOutput?
        user = nil
      end
      if user.nil? && create
        found = OpenDirectory.immediate_query(OpenDirectory::ODQSearchTypeUsersByODQuery, OpenDirectory::DS1AttrGeneratedUID, OpenDirectory::ODMatchEqualTo, guid)
        raise MDMUtilities::MDMRetryTransactionException if found     # The user's record is now cached in the DB, restart the transaction so we can see it
      end
    rescue ActiveRecord::StatementInvalid => e
      msg = e.message
      Rails.logger.warn("Failed to find or create User for guid #{guid} (#{msg})\n#{e.backtrace.join("\n")}") if MDMLogger.debugOutput?
      raise if msg.include?("current transaction is aborted") || msg.include?("could not serialize")  # We can't recover from these
      raise MDMUtilities::MDMRetryTransactionException if msg.include?("duplicate key value")                       # Need to restart transaction to see the newly-added User record (but this should never happen now)
      user = nil
      retry if count == 1
    rescue MDMUtilities::MDMRetryTransactionException
      raise # Just send it up the chain for perform_in_transaction can catch it and restart the transaction
    rescue Exception => e
      Rails.logger.warn("Failed to find or create User for guid #{guid} (#{e.message})\n#{e.backtrace.join("\n")}")
      user = nil
    end

    return user
  end
  
  #-------------------------------------------------------------------------

  def self.find_one(spec, refresh = true)
    return nil unless spec
    return super if refresh.kind_of?(Hash) # This is a call from ActiveRecord::Base, send it on to super

    if spec.kind_of?(User)
      user = spec
    else
      col, val, guid = self.column_and_value_for_user(spec)
      sql = "SELECT * FROM #{self.table_name} WHERE #{col} = #{val} LIMIT 1"
      results = self.find_by_sql(sql)
      user = (results.length == 1 ? results[0] : nil)
    end

    refresh = false if user && user.last_synced && Time.now.getgm - user.last_synced < 60    # Don't sync more frequently than once per minute
    if refresh
      guid = user.guid if !guid && user
      self.refresh_cache_by_col_val_guid(col, val, guid)
    end

    return user
  end

  #-------------------------------------------------------------------------

  def self.get_all_users_for_group(group, deep = true)
    group = UserGroup.find_one(group)   # Better to fetch the group record than join on the user_groups table
    return [] unless group

    join_table = (deep ? "view_all_user_groups_users_flat" : "view_all_user_groups_users_complete")
    sql = <<-SQL
      SELECT u.*
      FROM   view_all_valid_users AS u
      JOIN   "#{join_table}"  AS j
        ON   j.user_id = u.id
      WHERE  j.user_group_id = #{group.id}
    SQL

    return self.find_by_sql(sql)
  end
  
  #-------------------------------------------------------------------------

  def self.get_attributes_for_multiple_by_id(ids, extended = false)
    users_in = MDMUtilities::join_unsafe_collection_of_integers(ids, ',') { |id| id > 0 }
    return [] unless users_in && users_in != ''

    sql = <<-SQL
      SELECT *
      FROM   "#{self.table_name}"
      WHERE  id IN (#{users_in})
    SQL
    users = self.find_by_sql(sql)

    guids = []
    user_data = users.map { |u|
      guids.push(u.guid)
      u.get_attributes(extended)
    }
    self.refresh_cache_by_guids(guids)
    return user_data
  end

  #-------------------------------------------------------------------------

  def self.get_updated(xmin, xip_ints, xip_sql)
    sql = <<-SQL
      SELECT *
      FROM   view_all_valid_users
      WHERE  updated_at_xid >= #{xmin}
    SQL
    sql += " OR updated_at_xid IN (#{xip_sql})" unless xip_sql == ''
    return self.find_by_sql(sql)
  end

  #-------------------------------------------------------------------------

  def self.refresh_cache_by_col_val_guid(col, val, guid)
    # 'col' can only be one of 'guid', 'id', or 'short_name'. However we should never have col == 'id' without also having a valid guid
    guid ||= val if col == 'guid'
    if guid
      return if @@refreshed_guids.include?(guid)   # Already requested a refresh of this record

      OpenDirectory.queue_query(OpenDirectory::ODQSearchTypeUsersByODQuery, OpenDirectory::DS1AttrGeneratedUID, OpenDirectory::ODMatchEqualTo, guid)
      @@refreshed_guids.add(guid)
    elsif col == 'short_name'
      return if @@refreshed_names.include?(val)

      OpenDirectory.queue_query(OpenDirectory::ODQSearchTypeUsersByODQuery, OpenDirectory::DSNAttrRecordName, OpenDirectory::ODMatchEqualTo, val)
      @@refreshed_names.add(val)
    else
      Rails.logger.error("Unable to refresh user cache for col '#{col}' = #{val}")
    end
  end

  #-------------------------------------------------------------------------

  # 'guids' is an enumerable object
  def self.refresh_cache_by_guids(guids)
    guids = Set.new(guids) unless guids.kind_of?(Set)

    # Remove any objects we've already refreshed
    guids.subtract(@@refreshed_guids)
    return if guids.empty?

    OpenDirectory.queue_query(OpenDirectory::ODQSearchTypeUsersByODQuery, OpenDirectory::DS1AttrGeneratedUID, OpenDirectory::ODMatchEqualTo, guids.to_a)
    @@refreshed_guids.merge(guids)
  end

  # --------------------------------------------------------------------------------------------

  def self.search_for_users_matching(search_string, max_results = nil, refresh_cache = nil)
    max_results ||= MDMUtilities.max_library_items_for_display

    search = search_string.gsub(/([_%\|\\])/, '|\1').gsub(/'/, '\'\'')    # Escape the special characters in the search string
    Rails.logger.info("Escaped '#{search_string}' to '#{search}'") if MDMLogger.debugOutput?(2)

    sql = <<-SQL
      FROM   view_all_valid_users AS u
      WHERE  (   u.short_name   ILIKE '%#{search}%' ESCAPE '|'
              OR u.email        ILIKE '%#{search}%' ESCAPE '|'
              OR u.full_name    ILIKE '%#{search}%' ESCAPE '|'
              OR u.job_title    ILIKE '%#{search}%' ESCAPE '|'
              OR u.mobile_phone ILIKE '%#{search}%' ESCAPE '|')
    SQL

    count = self.count_by_sql("SELECT COUNT(u.*) #{sql} LIMIT #{max_results + 1}")
    count_str = (count <= max_results ? count.to_s : "more than #{max_results}")
    Rails.logger.info("User.search_for_users_matching('#{search_string}') found #{count_str} matches")
    if  refresh_cache && count <= max_results
      OpenDirectory.queue_query(OpenDirectory::ODQSearchTypeFilterUsers, nil, 0, search_string)
    end
    return self.connection.select_integer_values_by_index("SELECT u.id #{sql} ORDER BY full_name ASC LIMIT #{max_results + 1}")
  end
  
  #-------------------------------------------------------------------------

  def self.user_is_admin?(user)
    return UserGroup.user_is_member_of_group(user, OpenDirectory::AdminGroupGUID)
  end

  #-------------------------------------------------------------------------

  def self.user_ids_for_admin_app
    max_results = MDMUtilities.max_library_items_for_display

    sql = <<-SQL
      SELECT   id, UPPER(COALESCE(full_name, last_name, first_name, short_name)) AS sort
      FROM     view_all_valid_users
      ORDER BY sort ASC
      LIMIT    #{max_results + 1}
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def add_extended_attributes(attr_hash)
    attr_hash['apps']      = self.get_related_app_ids
    attr_hash['app_data']  = self.get_app_data
    attr_hash['devices']   = self.get_related_devices_ids(true)
    attr_hash['enrollment_settings']  = DeviceEnrollmentSettings.get_device_enrollment_settings(self)
    attr_hash['inherited_privileges'] = self.inherited_privileges

    if Settings.get_settings.vpp_service_state == 3     # 0 = disabled, 1 = sToken expired, 2 = orphaned by another server, 3 = enabled
      attr_hash['books']     = self.get_related_book_ids
      attr_hash['book_data'] = self.get_book_data
      attr_hash = self.add_vpp_user_enrollment_info(attr_hash)   # Call last because it uses some of the info added above
    end
    return attr_hash
  end

  #-------------------------------------------------------------------------

  def add_vpp_user_enrollment_info(attr_hash)
    # Get the ids of vpp-enabled devices and the time (if any) that we last sent them an invitation
    # We only care able the actual devices here, not how we communicate with them (i.e., lab_sessions)
    # so we use the simpler view_vpp_enabled_devices instead of view_vpp_enabled_mdm_targets
    sql = <<-SQL
      SELECT   d.id, d.vpp_last_invite_requested
      FROM     view_vpp_enabled_devices AS d
      WHERE    d.user_id = #{self.id}
      ORDER BY d.id
    SQL
    res = self.connection.execute(sql)
    devices = []
    num_invitations = (self.vpp_status && self.vpp_status.start_with?('Invit') ? 1 : 0)  # Match 'Inviting', 'Invited', and 'InviteFailed'
    if res.nfields == 2
      for row in 0...res.ntuples do   # row[0] = d.id, row[1] = d.vpp_last_invite_requested
        id = res.getvalue(row, 0)
        begin
          devices.push(Integer(id))
        rescue
        end
        num_invitations += 1 if res.getvalue(row, 1)    # If it's either been sent an invitation or has one pending
      end
    end

    has_content = attr_hash['apps'].length > 0 || attr_hash['books'].length > 0
    if !has_content
      attr_hash['app_data'].each { |d|
        if d['assigned'].length > 0
          has_content = true
          break
        end
      }
    end
    if !has_content
      attr_hash['book_data'].each { |d|
        if d['assigned'].length > 0
          has_content = true
          break
        end
      }
    end

    attr_hash['vpp_enabled_devices']      = devices
    attr_hash['vpp_invitations_count']    = num_invitations
    attr_hash['has_vpp_content_assigned'] = has_content
    return attr_hash
  end

  #-------------------------------------------------------------------------

  def admin?
    return User.user_is_admin?(self)
  end

  #-------------------------------------------------------------------------

  # NOTE: ancestor user groups means all parent user groups and all of their recursive parent user groups
  def all_ancestor_user_groups
    sql = <<-SQL
      SELECT g.*
      FROM   view_all_valid_user_groups      AS g
      JOIN   view_all_user_groups_users_flat AS j
        ON   j.user_group_id = g.id
      WHERE  j.user_id = #{self.id}
    SQL
    return UserGroup.find_by_sql(sql)
  end

  #-------------------------------------------------------------------------
  
  def allow_portal_access?
    result = self.connection.execute("SELECT dm_allow_portal_access_for_user_id(#{self.id})")    
    return (result.getvalue(0,0) == 't')
  end

  #-------------------------------------------------------------------------
  
  def can_download_adhoc_profiles?
    result = self.connection.execute("SELECT dm_allow_adhoc_profiles_access_for_user_id(#{self.id})")    
    return (result.getvalue(0,0) == 't')
  end

  #-------------------------------------------------------------------------
  
  def can_enroll_unenroll_devices_via_portal?
    result = self.connection.execute("SELECT dm_allow_portal_enroll_unenrollment_for_user_id(#{self.id})")    
    return (result.getvalue(0,0) == 't')
  end

  #-------------------------------------------------------------------------

  def task_privileges
    result = self.connection.execute("SELECT dm_task_privileges_for_user_id(#{self.id})")
    # result will be json strigified - {"wipe_device"=>false, "lock_device"=>false, "clear_passcode"=>false}  
    return JSON.parse(result.getvalue(0,0))
  end

  #-------------------------------------------------------------------------

  def inherited_privileges
    result = self.connection.select_integer_values_by_index("SELECT dm_inherited_privileges_for_user_id(#{self.id})")
    return (result[0] || 0)
  end

  #-------------------------------------------------------------------------

  def effective_privileges
    result = self.connection.select_integer_values_by_index("SELECT dm_effective_privileges_for_user_id(#{self.id})")
    return (result[0] || 0)
  end

  #-------------------------------------------------------------------------

  def also_modifies
    return [:devices]
  end

  #-------------------------------------------------------------------------

  def before_save
    # We don't create users via Rails anymore, so this should not be necessary anymore:
    # self.library_item_type = 'User' # Rails will attempt to write NULL for things we don't explicitly set on new objects, which causes this column to fail the INSERT
    return true
  end

  #-------------------------------------------------------------------------

  def debug_name
    return "<#{self.class.to_s}:\"#{self.name}\">"
  end

  #-------------------------------------------------------------------------

  def email
    props = self.email_properties
    return (props.key?(:email_address) ? props[:email_address] : "")
  end

  #-------------------------------------------------------------------------
  
  def email_properties
    properties = { :shortname => self.short_name, :fullname => self.full_name, :email_address => (self[:email] || '') } # don't use self.email!!!
    if properties[:email_address] == ''
      # Need to construct an email address (hope it's correct!)
      cur_settings = Settings.get_settings
      email_domain = (cur_settings ? cur_settings.email_domain : nil)
      properties[:email_address] = (email_domain && email_domain.length > 0 ? "#{properties[:shortname]}@#{email_domain}" : "")
      Rails.logger.info("Constructed email address '#{properties[:email_address]}'") if MDMLogger.debugOutput?
    end
    return properties
  end

  #-------------------------------------------------------------------------

  def get_adhoc_profiles
    return self.get_all_profiles("is_a_la_carte IS TRUE")
  end

  #-------------------------------------------------------------------------

  def get_adhoc_profile_ids
    where = "AND  (is_a_la_carte IS TRUE)"
    sql = <<-SQL
        SELECT p.id                                -- Profile on this user
        FROM   "#{Profile.table_name}" AS p
        WHERE  p.library_item_id = #{self.id}
          #{where}
      UNION
        SELECT p.id                                   -- Profiles on any user_groups that this user is a member of, including ancestor user_groups
        FROM   "#{Profile.table_name}"          AS p, -- Can't use JOIN because some callers query with xmin in 'where'
               view_all_user_groups_users_flat  AS j  -- and that system column doesn't survive the JOIN
        WHERE  p.library_item_id = j.user_group_id
          AND  j.user_id         = #{self.id}
          #{where}
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end
  
  #-------------------------------------------------------------------------

  def get_adhoc_profiles_updated_at(xid_where)
    return self.get_all_profiles("is_a_la_carte IS TRUE AND (#{xid_where})")
  end
  
  #-------------------------------------------------------------------------

  def get_all_device_ids(where = nil)
    # We simply need all the devices owned by the user
    where = (where ? "AND  (#{where})" : '')
    sql = <<-SQL
      SELECT d.id
      FROM   "#{Device.table_name}" AS d
      WHERE  d.user_id = #{self.id}
        #{where}
    SQL
    return User.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def get_all_profiles(where = nil)
    # Get all ancestor user groups' profiles
    where = (where ? "AND  (#{where})" : '')
    sql = <<-SQL
        SELECT p.*                                -- Profile on this user
        FROM   "#{Profile.table_name}" AS p
        WHERE  p.library_item_id = #{self.id}
          #{where}
      UNION
        SELECT p.*                                    -- Profiles on any user_groups that this user is a member of, including ancestor user_groups
        FROM   "#{Profile.table_name}"          AS p, -- Can't use JOIN because some callers query with xmin in 'where'
               view_all_user_groups_users_flat  AS j  -- and that system column doesn't survive the JOIN
        WHERE  p.library_item_id = j.user_group_id
          AND  j.user_id         = #{self.id}
          #{where}
    SQL
    return Profile.find_by_sql(sql)
  end

  #-------------------------------------------------------------------------

  def get_app_data
    sql = "SELECT dm_app_info_for_user(#{self.id})"
    json = self.connection.select_string_values_by_index(sql)   # This returns a JSON-formatted string because it's a complex structure that SQL can't represent easily
    return JSON.parse(json[0])
  end

  #-------------------------------------------------------------------------

  def get_book_data
    sql = "SELECT dm_vpp_book_license_info_for_user(#{self.id})"
    json = self.connection.select_string_values_by_index(sql)   # This returns a JSON-formatted string because it's a complex structure that SQL can't represent easily
    return JSON.parse(json[0])
  end

  #-------------------------------------------------------------------------

  def get_related_book_ids
    sql = <<-SQL
      SELECT book_id
      FROM   view_vpp_books_users
      WHERE  user_id = #{self.id}
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def get_related_devices_ids(valid_only = false)
    sql = <<-SQL
      SELECT id
      FROM   "#{Device.table_name}"
      WHERE  user_id = #{self.id}
    SQL
    if valid_only
      sql += <<-SQL
        AND  (   udid           IS NOT NULL
              OR "DeviceName"   IS NOT NULL
              OR "SerialNumber" IS NOT NULL
              OR "IMEI"         IS NOT NULL
              OR "MEID"         IS NOT NULL
              OR "DeviceID"     IS NOT NULL)
      SQL
    end
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def get_related_profile_ids
    return self.connection.select_integer_values_by_index("SELECT id FROM \"#{Profile.table_name}\" WHERE library_item_id = #{self.id} LIMIT 1")
  end

  #-------------------------------------------------------------------------

  def get_substitution_value_and_mask_for_key(key)
    return (VALID_SUBSTITUTION_KEYS[key] && self.respond_to?(key) ? self.send(key) : nil)
  end

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    attr_hash.delete('od_node_id')
    attr_hash['is_admin'] = self.admin?
    attr_hash['profile']  = self.get_related_profile_ids[0]

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

  def member_of?(group, deep = true)
    return UserGroup::user_is_member_of_group(self, group, deep)
  end

  #-------------------------------------------------------------------------

  def name
    return self.full_name || self.short_name
  end

  #-------------------------------------------------------------------------

  def profile=(p)
    my_id = self.id
    return unless my_id

    if p
      p = p.id if p.is_a?(Profile)
      sql = <<-SQL
        UPDATE "#{Profile.table_name}"
        SET    user_id = #{my_id}
        WHERE  id = #{Integer(p)}
      SQL
    else
      sql = <<-SQL
      DELETE FROM "#{Profile.table_name}"
      WHERE       user_id = #{my_id}
      SQL
    end
    self.connection.execute(sql)
  end

  #-------------------------------------------------------------------------

  def refresh_cache
    User::refresh_cache_by_col_val_guid(nil, nil, self.guid) unless Time.now.getgm - self.last_synced < 60  # Don't sync more frequently than once per minute
  end

  #-------------------------------------------------------------------------

  def revoke_vpp_invitation
    self.vpp_status = 'Revoking'
    self.save
    self.reload   # The database will have made other changes for us, so reload to see them

    MDMUtilities.on_commit {
      MDMUtilities.sync_vpp_data  # Will not raise any exceptions
    }
  end

  #-------------------------------------------------------------------------

  def send_vpp_invitation_by_email(address)
    return if self.vpp_status_ext == 'Associated'                   # Never invite users who have already successfully enrolled
    address = (address ? "'#{address.gsub(/'/, '\'\'')}'" : 'NULL') # Escape the special characters in the address string, or pass NULL if none was given
    metadata = self.library_item_metadata
    metadata.locale = I18n.locale.to_s
    metadata.save
    self.connection.execute("SELECT dm_vpp_create_email_invite_tasks_for_user(dm_make_user_active(#{self.id}), #{address})")
  end

  #-------------------------------------------------------------------------

  def send_vpp_invitation_to_device(device)
    return if self.vpp_status_ext == 'Associated'   # Never invite users who have already successfully enrolled
    return unless device.user_id == self.id         # Must be the owner of the device
    return unless Settings.get_settings.apns_active

    # If the user is not registered, force a sync to register them, otherwise we can create the invite task
    self.connection.execute("SELECT * FROM dm_vpp_create_device_invite_tasks_for_user(#{self.id}, #{device.id})")  # Won't actually send the invitation unless the user is registered, but will still queue it
    if self.vpp_invite_code.nil? && self.vpp_status != 'Inviting'
      self.vpp_status = 'Registering'
      self.save
      MDMUtilities.on_commit {
        MDMUtilities.sync_vpp_data
      }
    end
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
