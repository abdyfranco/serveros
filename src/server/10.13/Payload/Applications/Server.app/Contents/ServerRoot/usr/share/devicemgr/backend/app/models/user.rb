#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class User < ActiveRecord::Base
#-------------------------------------------------------------------------

  has_many :devices                                   # get_related_devices_ids

  @@admin_required_attributes = [ 'jpeg_data', 'full_name', 'asm_full_name_ext', 'first_name', 'last_name', 'asm_first_name_ext', 'asm_last_name_ext', 'short_name', 'email', 'mobile_phone', 'profile', 'managed_apple_id', 'passcode_policy', 'asm_unique_id_ext', 'guid' ]

  @@refreshed_guids    = Set.new([OpenDirectory::TooManyResultsGUID])  # This will prevent us from ever querying this invalid GUID
  @@refreshed_names    = Set.new
  @@refreshed_searches = Set.new

  # Do not change these associations unless you intend to rebuild all profile caches
  VALID_SUBSTITUTION_KEYS = { 'email'         => (1 << 11),  # These must match the Obj-C and SQL code
                              'email_address' => (1 << 11),  # Alias
                              'EMailAddress'  => (1 << 11),  # Alias
                              'first_name'    => (1 << 12),
                              'FirstName'     => (1 << 12),  # Alias
                              'full_name'     => (1 << 13),
                              'RealName'      => (1 << 13),  # Alias
                              'guid'          => (1 << 14),
                              'GeneratedID'   => (1 << 14),  # Alias
                              'last_name'     => (1 << 15),
                              'LastName'      => (1 << 15),  # Alias
                              'job_title'     => (1 << 16),
                              'JobTitle'      => (1 << 16),  # Alias
                              'mobile_phone'  => (1 << 17),
                              'MobileNumber'  => (1 << 17),  # Alias
                              'short_name'    => (1 << 18),
                              'RecordName'    => (1 << 18)   # Alias
                            }

  # We need to provide method aliases for the aliased substitution keys
  def email_address;  return self.email;                                    end
  def EMailAddress;   return self.email;                                    end
  def FirstName;      return (self.asm_first_name_ext || self.first_name);  end
  def RealName;       return (self.asm_full_name_ext  || self.full_name);   end
  def GeneratedID;    return self.guid;                                     end
  def LastName;       return (self.asm_last_name_ext || self.last_name);    end
  def JobTitle;       return self.job_title;                                end
  def MobileNumber;   return self.mobile_phone;                             end
  def RecordName;     return self.short_name;                               end

  #-------------------------------------------------------------------------

  def self.table_name;  return 'users'; end

  #-------------------------------------------------------------------------

  def self.admin_required_attributes;     return @@admin_required_attributes;   end
  def self.bit_for_substitution_key(key); return VALID_SUBSTITUTION_KEYS[key];  end
  def self.exists?(user);                 return User.find_one(user);           end  # Just load the user

  #-------------------------------------------------------------------------

  def self.user_guid_is_admin?(guid)
    is_admin = self.user_guid_is_db_admin?(guid)
    is_admin ||= DevicemgrdUtility.user_guid_is_admin(guid)       # Ask OD
    return is_admin
  end # self.user_guid_is_admin?

  #-------------------------------------------------------------------------

  def self.user_guid_is_db_admin?(guid)
    guid = self.NormalizeGUID(guid)
    return false unless guid

    # First check the DB
    sql = <<-SQL
      SELECT 1
      FROM   view_all_user_groups_users_flat
      WHERE  user_id       = (SELECT id FROM users       WHERE guid = '#{guid}'::uuid LIMIT 1)
        AND  user_group_id = (SELECT id FROM user_groups WHERE guid = '#{OpenDirectory::AdminGroupGUID}'::uuid LIMIT 1)
      LIMIT  1
    SQL

    return self.connection.select_exists?(sql)
  end # self.user_guid_is_db_admin?

  #-------------------------------------------------------------------------

  def self.NormalizeEmail(value)
    return nil if value.empty?
    value = value.sub(/^.*?([^\s<>,!@#$%^&*(){}\[\]|:"\\=]++@[^\s<>,!@#$%^&*(){}\[\]|:'"\\=]++).*?$/, '\1').downcase
    return (value.empty? ? nil : value)
  end # self.NormalizeEmail

  #-------------------------------------------------------------------------

  def self.NormalizeGUID(value)
    return nil if value.empty?
    value = value.upcase.tr('^-0-9A-F', '')
    return (value.length == 36 ? value : nil)
  end # self.NormalizeGUID

  #-------------------------------------------------------------------------

  def self.column_and_value_for_user(user)
    raise ArgumentError, 'Invalid (nil) user specification' unless user

    if user.kind_of?(User)
      val  = user.id
      col  = 'id'
      guid = user.guid
    elsif user.kind_of?(String)
      val = User::NormalizeGUID(user)
      col = 'guid'
      if val.empty?
        val = user
        col = 'short_name'
      else
        guid = val
      end

      raise ArgumentError, "Invalid user specification '#{user}'" if val.empty?
      val = "'#{self.connection.quote_string(val)}'"
    elsif user.kind_of?(Numeric)
      col  = 'id'
      val  = user.to_i
    else
      raise ArgumentError, "Invalid user specification '#{user}'"
    end
    return col, val, guid
  end # self.column_and_value_for_user

  #-------------------------------------------------------------------------

  # This method must go look into OD directly as it needs to return an authoritative answer immediately
  def self.find_immediately_by_guid(guid, create = true)
    guid = User::NormalizeGUID(guid)
    return nil if guid.nil?

    count = 0
    begin
      count += 1
      begin # this could theoretically raise an exception
        user = User.find(:first, :conditions => ['guid=?', guid])        # No rails magic, thanks
      rescue Exception => e
        raise if e.serialization_failure? || e.message.include?('current transaction is aborted')   # We can't recover from these
        Rails.logger.info("No User record found for guid #{guid}") if MDMLogger.debugOutput?
        user = nil
      end
      if user.nil? && create
        found = OpenDirectory.immediate_query(OpenDirectory::ODQSearchTypeUsers, OpenDirectory::DS1AttrGeneratedUID, OpenDirectory::ODMatchEqualTo, guid)
        raise MDMUtilities::MDMRetryTransaction if found     # The user's record is now cached in the DB, restart the transaction so we can see it
      end
    rescue ActiveRecord::StatementInvalid => e
      msg = e.message
      Rails.logger.warn("Failed to find or create User for guid #{guid} (#{msg})\n#{e.backtrace.join("\n")}") if MDMLogger.debugOutput?
      if MDMUtilities.in_transaction?         # If we're not in a transaction, we just need to retry (we're highly unlikely to get these errors)
        raise if e.serialization_failure? || msg.include?('current transaction is aborted')             # We can't recover from these
        raise MDMUtilities::MDMRetryTransaction if msg.include?('duplicate key value')                  # Need to restart transaction to see the newly-added User record (but this should never happen now)
      end
      user = nil
      retry if count == 1
    rescue MDMUtilities::MDMRetryTransaction
      raise if MDMUtilities.in_transaction?   # Just send it up the chain where process_in_transaction can catch it and restart the transaction
      retry                                   # If we're not in a transaction, just retry the lookup now
    rescue Exception => e
      Rails.logger.warn("Failed to find or create User for guid #{guid} (#{e.message})\n#{e.backtrace.join("\n")}")
      user = nil
    end

    return user
  end # self.find_immediately_by_guid

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
      Rails.logger.info("User.find_one for guid = #{guid || guid.class} found no matching user in database") unless user
    end

    refresh = false if user && user.last_synced && Time.now.getgm - user.last_synced < 300    # Don't sync more frequently than once per 5 minutes
    if refresh
      guid = user.guid if guid.empty? && user
      self.refresh_cache_by_col_val_guid(col, val, guid)
    end

    return user
  end # self.find_one

  #-------------------------------------------------------------------------

  def self.get_attributes_for_multiple_by_id(ids, extended = false)
    users_in = MDMUtilities::join_unsafe_collection_of_integers(ids, ',') { |id| id > 0 }
    return [] if users_in.empty?

    users = self.find_by_sql("SELECT * FROM #{self.table_name} WHERE id IN (#{users_in})")

    guids = []
    user_data = users.map { |u|
      guid = u.guid
      guids.push(guid) unless guid.empty?
      u.get_attributes(extended)
    }
    self.refresh_cache_by_guids(guids)
    return user_data
  end # self.get_attributes_for_multiple_by_id

  #-------------------------------------------------------------------------

  def self.get_app_license_details_for_multiple_by_id(ids)
    return ids.collect { |id|
      id = Integer(id)
      { :id => id, :app_data => (self.connection.select_json_value_by_index("SELECT dm_app_info_for_user(#{id}, TRUE)") || []) }
    }
  end # self.get_app_license_details_for_multiple_by_id

  #-------------------------------------------------------------------------

  def self.get_book_license_details_for_multiple_by_id(ids)
    return ids.collect { |id|
      id = Integer(id)
      { :id => id, :book_data => (self.connection.select_json_value_by_index("SELECT dm_media_info_for_user(#{id}, TRUE)") || []) }
    }
  end # self.get_book_license_details_for_multiple_by_id

  #-------------------------------------------------------------------------

  def self.logged_in_user(opts = {})
    guid = self.logged_in_user_guid
    Rails.logger.info("User.logged_in_user: guid = #{guid || guid.class}") if MDMLogger.debugOutput?(1)
    return nil unless guid

    user = (opts[:check_od] ? User.find_immediately_by_guid(guid, true)     # We always want to create the logged in user
                            : User.find_one(guid, (opts.key?(:refresh) ? opts[:refresh] : true)))
    Rails.logger.error("User.logged_in_user: no user found for guid #{guid}") unless user
    return user
  end # self.logged_in_user

  #-------------------------------------------------------------------------

  def self.logged_in_user_guid
    guid    = nil
    session = self.session
    if session
      u = session[:user]
      if u
        guid = u['generated_uid']
        Rails.logger.error("User.logged_in_user_guid: user has no guid, user = #{u}") if guid.empty?
      else
        Rails.logger.error("User.logged_in_user_guid: no session user, session = #{session}")
      end
    else
      Rails.logger.error("User.logged_in_user_guid: no session")
    end
    return guid
  end # self.logged_in_user_guid

  #-------------------------------------------------------------------------

  def self.refresh_cache_by_col_val_guid(col, val, guid)
    # 'col' can only be one of 'guid', 'id', or 'short_name'. However we should never have col == 'id' without also having a valid guid
    guid ||= val if col == 'guid'
    if guid
      return if @@refreshed_guids.include?(guid) || MDMUtilities.read_only_transaction?  # Already requested a refresh of this record, or we can't because we're in a read-only transaction

      OpenDirectory.queue_query(OpenDirectory::ODQSearchTypeUsers, OpenDirectory::DS1AttrGeneratedUID, OpenDirectory::ODMatchEqualTo, guid)
      @@refreshed_guids.add(guid)
    elsif col == 'short_name'
      return if @@refreshed_names.include?(val) || MDMUtilities.read_only_transaction?

      OpenDirectory.queue_query(OpenDirectory::ODQSearchTypeUsers, OpenDirectory::DSNAttrRecordName, OpenDirectory::ODMatchEqualTo, val)
      @@refreshed_names.add(val)
    else
      Rails.logger.error("Unable to refresh user cache for col '#{col}' = #{val}") if MDMLogger.debugOutput?(2)
    end
  end # self.refresh_cache_by_col_val_guid

  #-------------------------------------------------------------------------

  # 'guids' is an enumerable object
  def self.refresh_cache_by_guids(guids)
    guids = Set.new(guids) unless guids.kind_of?(Set)

    # Remove any objects we've already refreshed
    guids.subtract(@@refreshed_guids)
    return if guids.empty?

    OpenDirectory.queue_query(OpenDirectory::ODQSearchTypeUsers, OpenDirectory::DS1AttrGeneratedUID, OpenDirectory::ODMatchEqualTo, guids.to_a)
    @@refreshed_guids.merge(guids)
  end # self.refresh_cache_by_guids

  #-------------------------------------------------------------------------

  def self.search_for_od_users_matching(search_string, max_results = nil, refresh_cache = nil, selection_id = nil)
    max_results ||= MDMUtilities.max_library_items_for_display

    search = self.connection.quote_string(search_string.gsub(/([_%\|\\])/, '|\1'))    # Escape the special characters in the search string
    Rails.logger.info("Escaped '#{search_string}' to '#{search}'") if MDMLogger.debugOutput?(2)

    sql = <<-SQL
      FROM   view_all_od_users AS u
      WHERE  (   u.short_name ILIKE '%#{search}%' ESCAPE '|'
              OR u.full_name  ILIKE '%#{search}%' ESCAPE '|'
              OR u.first_name ILIKE '%#{search}%' ESCAPE '|'
              OR u.last_name  ILIKE '%#{search}%' ESCAPE '|')
    SQL

    found = self.connection.select_integer_values_by_index("SELECT u.id #{sql} ORDER BY LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC LIMIT #{max_results + 1}")
    count = found.length
    if refresh_cache && count <= max_results
      OpenDirectory.queue_query(OpenDirectory::ODQSearchTypeFilterUsers, nil, 0, search_string)
      found = self.connection.select_integer_values_by_index("SELECT u.id #{sql} ORDER BY LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC LIMIT #{max_results + 1}")
      count = found.length
    end
    count_str = (count <= max_results ? count.to_s : "more than #{max_results}")
    Rails.logger.info("User.search_for_od_users_matching('#{search_string}') found #{count_str} matches")
    return found
  end # self.search_for_od_users_matching

  #-------------------------------------------------------------------------

  def self.search_for_unmerged_asm_users_matching(search_string, max_results = nil, refresh_cache = nil, selection_id = nil)
    max_results ||= MDMUtilities.max_library_items_for_display

    search = self.connection.quote_string(search_string.gsub(/([_%\|\\])/, '|\1'))    # Escape the special characters in the search string
    Rails.logger.info("Escaped '#{search_string}' to '#{search}'") if MDMLogger.debugOutput?(2)

    sql = <<-SQL
      FROM   view_all_unmerged_asm_users AS u
      WHERE  (   u.asm_full_name_ext  ILIKE '%#{search}%' ESCAPE '|'
              OR u.asm_first_name_ext ILIKE '%#{search}%' ESCAPE '|'
              OR u.asm_last_name_ext  ILIKE '%#{search}%' ESCAPE '|')
    SQL

    found = self.connection.select_integer_values_by_index("SELECT u.id #{sql} ORDER BY LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC LIMIT #{max_results + 1}")
    count = found.length
    if refresh_cache && count <= max_results
      OpenDirectory.queue_query(OpenDirectory::ODQSearchTypeFilterUsers, nil, 0, search_string)
      found = self.connection.select_integer_values_by_index("SELECT u.id #{sql} ORDER BY LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC LIMIT #{max_results + 1}")
      count = found.length
    end
    count_str = (count <= max_results ? count.to_s : "more than #{max_results}")
    Rails.logger.info("User.search_for_unmerged_asm_users_matching('#{search_string}') found #{count_str} matches")
    return found
  end # self.search_for_unmerged_asm_users_matching

  #-------------------------------------------------------------------------

  def self.search_for_unmerged_od_users_matching(search_string, max_results = nil, refresh_cache = nil, selection_id = nil)
    max_results ||= MDMUtilities.max_library_items_for_display

    search = self.connection.quote_string(search_string.gsub(/([_%\|\\])/, '|\1'))    # Escape the special characters in the search string
    Rails.logger.info("Escaped '#{search_string}' to '#{search}'") if MDMLogger.debugOutput?(2)

    sql = <<-SQL
      FROM   view_all_unmerged_od_users AS u
      WHERE  (   u.short_name         ILIKE '%#{search}%' ESCAPE '|'
              OR u.full_name          ILIKE '%#{search}%' ESCAPE '|'
              OR u.first_name         ILIKE '%#{search}%' ESCAPE '|'
              OR u.last_name          ILIKE '%#{search}%' ESCAPE '|')
    SQL

    found = self.connection.select_integer_values_by_index("SELECT u.id #{sql} ORDER BY LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC LIMIT #{max_results + 1}")
    count = found.length
    if refresh_cache && count <= max_results
      OpenDirectory.queue_query(OpenDirectory::ODQSearchTypeFilterUsers, nil, 0, search_string)
      found = self.connection.select_integer_values_by_index("SELECT u.id #{sql} ORDER BY LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC LIMIT #{max_results + 1}")
      count = found.length
    end
    count_str = (count <= max_results ? count.to_s : "more than #{max_results}")
    Rails.logger.info("User.search_for_unmerged_od_users_matching('#{search_string}') found #{count_str} matches")
    return found
  end # self.search_for_unmerged_od_users_matching

  # --------------------------------------------------------------------------------------------

  def self.search_for_users_matching(search_string, max_results = nil, refresh_cache = nil)
    max_results ||= MDMUtilities.max_library_items_for_display

    search = self.connection.quote_string(search_string.gsub(/([_%\|\\])/, '|\1'))    # Escape the special characters in the search string
    Rails.logger.info("Escaped '#{search_string}' to '#{search}'") if MDMLogger.debugOutput?(2)

    sql = <<-SQL
      FROM   view_all_valid_users AS u
      WHERE  (   u.short_name         ILIKE '%#{search}%' ESCAPE '|'
              OR u.email              ILIKE '%#{search}%' ESCAPE '|'
              OR u.full_name          ILIKE '%#{search}%' ESCAPE '|'
              OR u.job_title          ILIKE '%#{search}%' ESCAPE '|'
              OR u.mobile_phone       ILIKE '%#{search}%' ESCAPE '|'
              OR u.asm_full_name_ext  ILIKE '%#{search}%' ESCAPE '|'
              OR u.asm_first_name_ext ILIKE '%#{search}%' ESCAPE '|'
              OR u.asm_last_name_ext  ILIKE '%#{search}%' ESCAPE '|'
              OR u.managed_apple_id   ILIKE '%#{search}%' ESCAPE '|')
    SQL

    found = self.connection.select_integer_values_by_index("SELECT u.id #{sql} ORDER BY LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC LIMIT #{max_results + 1}")
    count = found.length
    if refresh_cache && count <= max_results
      OpenDirectory.queue_query(OpenDirectory::ODQSearchTypeFilterUsers, nil, 0, search_string)
      found = self.connection.select_integer_values_by_index("SELECT u.id #{sql} ORDER BY LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC LIMIT #{max_results + 1}")
      count = found.length
    end
    count_str = (count <= max_results ? count.to_s : "more than #{max_results}")
    Rails.logger.info("User.search_for_users_matching('#{search_string}') found #{count_str} matches")
    return found
  end # self.search_for_users_matching

  #-------------------------------------------------------------------------

  def self.user_ids_for_admin_app_with_view(search_view = nil)
    return nil unless search_view
    max_results = MDMUtilities.max_library_items_for_display

    # Sort by library_item_type to return active users first
    sql = <<-SQL
      WITH sub AS (
        SELECT   LOWER(order_name) AS lon, order_name, id
        FROM     #{search_view}
        ORDER BY library_item_type ASC, LOWER(order_name) ASC NULLS LAST, order_name DESC NULLS LAST, id ASC
        LIMIT    #{max_results + 1}
      )
      SELECT id FROM sub ORDER BY lon ASC, order_name DESC, id ASC
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end

  #-------------------------------------------------------------------------

  def self.od_user_ids_for_admin_app;             return self.user_ids_for_admin_app_with_view('view_all_od_users');           end
  def self.user_ids_for_admin_app;                return self.user_ids_for_admin_app_with_view('view_all_valid_users');        end
  def self.unmerged_asm_user_ids_for_admin_app;   return self.user_ids_for_admin_app_with_view('view_all_unmerged_asm_users'); end
  def self.unmerged_od_user_ids_for_admin_app;    return self.user_ids_for_admin_app_with_view('view_all_unmerged_od_users');  end

  #-------------------------------------------------------------------------

  def add_extended_attributes(attr_hash)
    attr_hash['apps']                      = self.get_related_app_info
    attr_hash['app_data']                  = self.get_app_data
    attr_hash['books']                     = self.get_related_book_info
    attr_hash['book_data']                 = self.get_book_data
    attr_hash['managed_apps']              = self.get_related_managed_app_ids
    attr_hash['managed_books']             = self.get_related_managed_book_ids
    attr_hash['devices']                   = self.get_related_devices_ids(true)
    attr_hash['enrolled_devices']          = self.get_enrolled_devices_ids()
    attr_hash['enrollment_settings']       = DeviceEnrollmentSettings.get_device_enrollment_settings(self)
    attr_hash['inherited_privileges']      = self.inherited_privileges
    attr_hash['osx_eapp_eligible_devices'] = self.get_all_device_ids_for_task('PushOSXEnterpriseApplications')
    if Settings.get_settings.vpp_service_state == 3             # 0 = disabled, 1 = sToken expired, 2 = orphaned by another server, 3 = enabled
      attr_hash = self.add_vpp_user_enrollment_info(attr_hash)  # Call last because it uses some of the info added above
    end

    attr_hash['parent_user_groups'] = UserGroup.parent_user_group_ids_for_user(self.id)
    return attr_hash
  end # add_extended_attributes

  #-------------------------------------------------------------------------

  def add_vpp_user_enrollment_info(attr_hash)
    # Get the ids of vpp-enabled devices (and lab_sessions) and the time (if any) that we last sent them an invitation
    sql = <<-SQL
      SELECT   d.device_id, d.vpp_last_invite_requested, d.is_multi_user
      FROM     view_vpp_enabled_mdm_targets AS d
      WHERE    d.user_id = #{self.id}
      ORDER BY d.device_id
    SQL
    res = self.connection.execute(sql)
    devices = []
    books_enabled_devices = []
    num_invitations = (self.od_vpp_status && self.od_vpp_status.start_with?('Invit') ? 1 : 0)  # Match 'Inviting', 'Invited', and 'InviteFailed'
    if res.nfields == 3
      for row in 0...res.ntuples do   # row[0] = d.device_id, row[1] = d.vpp_last_invite_requested, row[2] = d.is_multi_user
        id     = res.getvalue(row, 0)
        shared = res.getvalue(row, 2)
        begin
          devices.push(Integer(id))
          books_enabled_devices.push(Integer(id)) if shared == 'f'
        rescue
        end
        num_invitations += 1 if res.getvalue(row, 1)    # If it's either been sent an invitation or has one pending
      end
    end

    has_content = (!attr_hash['apps'].empty? || !attr_hash['books'].empty?)
    unless has_content || attr_hash['app_data'].empty?
      attr_hash['app_data'].each { |d|
        next if d['assigned'].empty?
        has_content = true
        break
      }
    end
    unless has_content || attr_hash['book_data'].empty?
      attr_hash['book_data'].each { |d|
        next if d['assigned'].empty?
        has_content = true
        break
      }
    end

    attr_hash['vpp_enabled_devices']        = devices
    attr_hash['vpp_books_enabled_devices']  = books_enabled_devices
    attr_hash['vpp_invitations_count']      = num_invitations
    attr_hash['has_vpp_content_assigned']   = has_content
    return attr_hash
  end # add_vpp_user_enrollment_info

  #-------------------------------------------------------------------------

  def admin?;   return User.user_guid_is_admin?(self.guid);  end

  #-------------------------------------------------------------------------

  def admin_prefs;    return self.library_item_metadata.admin_prefs;                                end
  def admin_prefs=(p) self.library_item_metadata.admin_prefs = p; self.library_item_metadata.save;  end
  def also_modifies;  return [:devices];                                                            end

  #-------------------------------------------------------------------------

  # NOTE: ancestor user groups means all parent user groups and all of their recursive parent user groups
  def all_ancestor_user_groups
    sql = <<-SQL
      SELECT g.*
      FROM   view_all_valid_user_groups      AS g
      JOIN   view_all_user_groups_users_flat AS j ON (j.user_group_id = g.id)
      WHERE  j.user_id = #{self.id}
    SQL
    return UserGroup.find_by_sql(sql)
  end # all_ancestor_user_groups

  #-------------------------------------------------------------------------

  def allow_portal_access?
    result = self.connection.execute("SELECT dm_allow_portal_access_for_user_id(#{self.id})")
    return (result.getvalue(0,0) == 't')
  end # allow_portal_access?

  #-------------------------------------------------------------------------

  def can_download_adhoc_profiles?
    result = self.connection.execute("SELECT dm_allow_adhoc_profiles_access_for_user_id(#{self.id})")
    return (result.getvalue(0,0) == 't')
  end # can_download_adhoc_profiles?

  #-------------------------------------------------------------------------

  def can_enroll_unenroll_devices_via_portal?
    result = self.connection.execute("SELECT dm_allow_portal_enroll_unenrollment_for_user_id(#{self.id})")
    return (result.getvalue(0,0) == 't')
  end # can_enroll_unenroll_devices_via_portal?

  #-------------------------------------------------------------------------

  def task_privileges
    return self.connection.select_json_value_by_index("SELECT dm_task_privileges_for_user_id(#{self.id})")
    # result will be json strigified - {"wipe_device"=>false, "lock_device"=>false, "clear_passcode"=>false}
  end # task_privileges

  #-------------------------------------------------------------------------

  def inherited_privileges
    result = self.connection.select_integer_values_by_index("SELECT dm_inherited_privileges_for_user_id(#{self.id})")
    return (result[0] || 0)
  end # inherited_privileges

  #-------------------------------------------------------------------------

  def effective_privileges
    result = self.connection.select_integer_values_by_index("SELECT dm_effective_privileges_for_user_id(#{self.id})")
    return (result[0] || 0)
  end # effective_privileges

  #-------------------------------------------------------------------------

  def debug_name; return "<#{self.class.to_s}:\"#{self.name}\">";  end

  #-------------------------------------------------------------------------

  def email
    props = self.email_properties
    return (props.key?(:email_address) ? props[:email_address] : '')
  end

  #-------------------------------------------------------------------------

  def email_properties
    properties = { :shortname => self.short_name, :fullname => self.full_name, :email_address => self[:email] } # don't use self.email!!!
    if properties[:email_address].empty?
      # Need to construct an email address (hope it's correct!)
      cur_settings = Settings.get_settings
      email_domain = (cur_settings ? cur_settings.email_domain : nil)
      properties[:email_address] = (email_domain.empty? ? '' : "#{properties[:shortname]}@#{email_domain}")
      Rails.logger.info("Constructed email address '#{properties[:email_address]}'") if MDMLogger.debugOutput?
    end
    return properties
  end # email_properties

  #-------------------------------------------------------------------------

  def get_adhoc_profiles; return self.get_all_profiles('is_manual');  end

  #-------------------------------------------------------------------------

  def get_adhoc_profile_ids
    sql = <<-SQL
        SELECT p.id                                -- Profile on this user
        FROM   view_portal_profiles AS p
        WHERE  p.library_item_id = #{self.id}
          AND  is_manual
      UNION
        SELECT p.id                                   -- Profiles on any user_groups that this user is a member of, including ancestor user_groups
        FROM   view_portal_profiles            AS p
        JOIN   view_all_user_groups_users_flat AS j ON (p.library_item_id = j.user_group_id)
        WHERE  j.user_id = #{self.id}
          AND  is_manual
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end # get_adhoc_profile_ids

  #-------------------------------------------------------------------------

  def get_adhoc_profiles_updated_at(xid_where); return self.get_all_profiles("is_manual AND (#{xid_where})"); end

  #-------------------------------------------------------------------------

  def get_all_profiles(where = nil)
    # Get all ancestor user groups' profiles
    where = (where ? "AND  (#{where})" : '')
    sql = <<-SQL
        SELECT p.*                                    -- Profile on this user
        FROM   view_admin_profiles AS p
        WHERE  p.library_item_id = #{self.id}
          #{where}
      UNION
        SELECT p.*                                    -- Profiles on any user_groups that this user is a member of, including ancestor user_groups
        FROM   view_admin_profiles             AS p,  -- Can't use JOIN because some callers query with xmin in 'where'
               view_all_user_groups_users_flat AS j   -- and that system column doesn't survive the JOIN
        WHERE  p.library_item_id = j.user_group_id
          AND  j.user_id         = #{self.id}
          #{where}
    SQL
    return Profile.find_by_sql(sql)
  end # get_all_profiles

  #-------------------------------------------------------------------------

  def get_app_data;   return (self.connection.select_json_value_by_index("SELECT dm_app_info_for_user(  #{self.id}, FALSE)") || []);  end
  def get_book_data;  return (self.connection.select_json_value_by_index("SELECT dm_media_info_for_user(#{self.id}, FALSE)") || []);  end

  #-------------------------------------------------------------------------

  def get_related_devices_ids(valid_only = false)
    sql = "SELECT id FROM #{Device.table_name} WHERE user_id = #{self.id}"
    sql += ' AND COALESCE(udid, "DeviceName", "SerialNumber", "IMEI", "MEID","DeviceID") IS NOT NULL' if valid_only
    return self.connection.select_integer_values_by_index(sql)
  end # get_related_devices_ids

  #-------------------------------------------------------------------------

  def get_enrolled_devices_ids()
    sql = <<-SQL
      SELECT id
      FROM   #{Device.table_name}
      WHERE  user_id = #{self.id}
      AND    COALESCE(udid, "DeviceName", "SerialNumber", "IMEI", "MEID", "DeviceID") IS NOT NULL
      AND    token IS NOT NULL
    SQL
    return self.connection.select_integer_values_by_index(sql)
  end # get_related_devices_ids

  #-------------------------------------------------------------------------

  def get_substitution_value_and_mask_for_key(key)
    return (VALID_SUBSTITUTION_KEYS[key] && self.respond_to?(key) ? self.send(key) : nil)
  end # get_substitution_value_and_mask_for_key

  #-------------------------------------------------------------------------

  def is_mergeable?; return self.od_node_id.nil? || self.connection.select_exists?("SELECT 1 FROM od_nodes WHERE od_node_id = #{self.od_node_id} AND asm_merge") end

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    attr_hash.delete('od_node_id')
    attr_hash.delete('admin_prefs')
    attr_hash['profile']  = self.get_related_profile_ids[0]

    # Pull in the photo only for non-extended, and all data for extended
    ext = self.library_item_metadata
    ext_attr = ext.get_attributes(true)
    jpeg = ext_attr['jpeg_data']
    jpeg = Base64.encode64(jpeg) if jpeg.is_a?(BinaryData)
    attr_hash['jpeg_data'] = jpeg
    if extended
      ext_attr.delete('id')           # Don't include these keys
      ext_attr.delete('jpeg_data')
      attr_hash.merge!(ext_attr)
      attr_hash['os_updates']             = self.get_os_updates_info
      attr_hash['admin_accounts']         = self.get_all_auto_admin_short_names
      attr_hash['device_cached_accounts'] = self.get_devices_local_users_info
      attr_hash['od_node_name']           = self.od_node_name
      attr_hash['can_be_unmerged']        = (self.asm_attr_match_str != self.od_attr_match_str)
      attr_hash['can_be_merged']          = self.is_mergeable?
      attr_hash['is_admin']               = self.admin?
      attr_hash                           = self.add_extended_attributes(attr_hash)
    end

    attr_hash['has_complete_data'] = extended
    return attr_hash
  end # modify_attributes

  #-------------------------------------------------------------------------

  def merge_user(merge_user_id)
    self.connection.execute("SELECT dm_merge_users(#{self.id}, #{Integer(merge_user_id)})")
  end # self.merge_user

  #-------------------------------------------------------------------------

  def name; return (self.asm_full_name_ext || self.full_name || self.short_name); end

  #-------------------------------------------------------------------------

  def od_node_name
    return '' unless self.od_node_id

    result = self.connection.select_string_values_by_index("SELECT od_node_name FROM od_nodes WHERE od_node_id = #{self.od_node_id} LIMIT 1")[0]
    name   = result.split('/')[-1] if result
    name   = I18n.t('local_server') if name == '127.0.0.1' || (name && name.downcase == 'default')
    return (name || 'ERROR')
  end # od_node_name

  #-------------------------------------------------------------------------

  def refresh_cache
    User::refresh_cache_by_col_val_guid(nil, nil, self.guid) if self.guid && self.last_synced && Time.now.getgm - self.last_synced >= 60  # Don't sync more frequently than once per minute
  end # refresh_cache

  #-------------------------------------------------------------------------

  def revoke_vpp_invitation
    self.od_vpp_status = 'Revoking'
    self.save
    self.reload   # The database will have made other changes for us, so reload to see them
    MDMUtilities.on_commit { MDMUtilities.sync_vpp_data } # Will not raise any exceptions
  end # revoke_vpp_invitation

  #-------------------------------------------------------------------------

  def send_vpp_invitation_by_email(address)
    return if self.od_vpp_status_ext == 'Associated'                   # Never invite users who have already successfully enrolled
    address = (address ? "'#{self.connection.quote_string(address)}'" : 'NULL') # Escape the special characters in the address string, or pass NULL if none was given
    metadata = self.library_item_metadata
    metadata.locale = I18n.locale.to_s
    metadata.save
    self.connection.execute("SELECT dm_vpp_create_email_invite_tasks_for_user(dm_make_user_active(#{self.id}), #{address})")
  end # send_vpp_invitation_by_email

  #-------------------------------------------------------------------------

  def send_vpp_invitation_to_device(device)
    return if self.od_vpp_status_ext == 'Associated'   # Never invite users who have already successfully enrolled
    # return unless device.user_id == self.id         # Must be the owner of the device
    return unless Settings.get_settings.apns_active

    # If the user is not registered, force a sync to register them, otherwise we can create the invite task
    self.connection.execute("SELECT * FROM dm_vpp_create_device_invite_tasks_for_user(#{self.id}, #{device.id})")  # Won't actually send invitation unless user is registered, but will still queue it
    if self.od_vpp_invite_code.nil? && self.od_vpp_status != 'Inviting'
      self.od_vpp_status = 'Registering'
      self.save
      MDMUtilities.on_commit { MDMUtilities.sync_vpp_data }
    end
  end # send_vpp_invitation_to_device

  #-------------------------------------------------------------------------

  def unmerge_user(keep_od)
    self.connection.execute("SELECT dm_unmerge_user(#{self.id}, #{keep_od ? 'TRUE' : 'FALSE'})")
  end # self.unmerge_user

  #-------------------------------------------------------------------------

  def update_app_assignments(new_app_infos);    UnifiedApplication.update_app_assignments(self, new_app_infos);             end
  def update_book_assignments(new_book_infos);  UnifiedBook.update_book_assignments(self, new_book_infos);                  end
  def update_enrollment_settings(settings);     DeviceEnrollmentSettings.update_device_enrollment_settings(self, settings); end

  #-------------------------------------------------------------------------

  include MDMRecordBase
  include MDMLibraryItemBase

#-------------------------------------------------------------------------
end # class User
#-------------------------------------------------------------------------
