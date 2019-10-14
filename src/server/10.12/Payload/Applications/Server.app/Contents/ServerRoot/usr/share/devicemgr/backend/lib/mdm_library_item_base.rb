#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
module MDMLibraryItemBase
#-------------------------------------------------------------------------

  PasswordSlug = "\u2022"*10  # 10 bullet characters

  #-------------------------------------------------------------------------

  def self.library_item_by_id(id)
    type = ActiveRecord::Base.connection.select_string_values_by_index("SELECT library_item_type FROM library_items WHERE id = #{Integer(id)} LIMIT 1")
    type = (type && type[0])
    return nil unless type
    type = type[8..-1] if type.start_with?('Inactive')
    Kernel.const_get(type).find_by_id(id)
  end # self.library_item_by_id

  #-------------------------------------------------------------------------

  def self.included(base)
    @@base_class = base

    # The following ugliness is to insert the class methods into the extended class
    # rather than leaving them in this module. That way, they can access the extended
    # class's class variables.
    class << base
      #-------------------------------------------------------------------------

        # if !self.method_defined?(:find_by_id)
        #   def find_by_id(id)
        #     return nil unless id && Integer(id) > 0
        #     result = self.find_by_sql("SELECT * FROM \"#{self.table_name}\" WHERE id = #{Integer(id)} LIMIT 1")
        #     return (result ? result[0] : nil)
        #   end
        # end

      #-------------------------------------------------------------------------
    end # class << base

    # And this ugliness is to chain the additional functionality we need to existing methods
    base.class_eval do

      #-------------------------------------------------------------------------

      unless self.method_defined?(:get_all_auto_admin_short_names)  # Don't override any existing implementation
        def get_all_auto_admin_short_names
          sql = <<-SQL
            WITH names AS (
              SELECT (m.dynamic_attributes\#>>'{AutoSetupAdminAccounts,0,shortName}') AS name
              FROM   view_devices_by_parent AS d
              JOIN   library_item_metadata  AS m USING (id)
              WHERE  d.parent_library_item_id = #{self.id}
                AND  d.is_dep_device
                AND  d.mdm_target_type = 'mac'
            )
            SELECT DISTINCT name FROM names WHERE names IS NOT NULL ORDER BY name ASC
          SQL
          return self.connection.select_string_values_by_index(sql)
        end # get_all_auto_admin_short_names
      end # unless self.method_defined?

      #-------------------------------------------------------------------------

      unless self.method_defined?(:get_all_device_ids)  # Don't override any existing implementation
        def get_all_device_ids(where = nil, join = nil)
          # This function returns all the devices owned by the users in the group
          join  = (join.empty?  ? '' : "JOIN   #{join}")
          where = (where.empty? ? '' : "  AND  (#{where})")
          sql = <<-SQL
            SELECT DISTINCT d.id
            FROM   view_devices_by_parent AS d
            #{join}
            WHERE  d.parent_library_item_id = #{self.id}
            #{where}
          SQL
          return self.connection.select_integer_values_by_index(sql)
        end # get_all_device_ids
      end # unless self.method_defined?

      #-------------------------------------------------------------------------

      unless self.method_defined?(:get_all_device_ids_for_task)  # Don't override any existing implementation
        def get_all_device_ids_for_task(task_type)
          where = join = nil
          case task_type
          when 'ClearPasscode'
            join  = 'library_item_metadata AS m USING (id)'   # JOIN to library_item_metadata to access dynamic_attributes
            where = "d.mdm_target_type = 'ios' AND (m.dynamic_attributes->>'unlock_token') IS NOT NULL"

          # ios only - 8.0 and later
          when 'ClearRestrictionsPassword'
            where = "d.mdm_target_type = 'ios' AND d.\"IsSupervised\" AND d.\"OSVersion\" ~* '^([8-9]\\..*|[1-9]\\d+)'"

          # os x 10.10 and greater, ios 8.0 and greater, supervised only
          when 'SetDeviceName'
            ios_where = "d.mdm_target_type = 'ios' AND d.\"IsSupervised\" AND d.\"OSVersion\" ~* '^([8-9]\\..*|[1-9]\\d+)'"
            osx_where = "d.mdm_target_type = 'mac' AND d.\"OSVersion\" ~* '[1-9][0-9]\\.[1-9][0-9].*'"
            tvos_where = "d.mdm_target_type = 'tv' AND d.\"OSVersion\" ~* '^(10\\.[2-9]|10\\.1\\d+|[1-9][1-9])'"
            where = "(#{ios_where}) OR (#{osx_where}) OR (#{tvos_where})"

          when 'PushOSXEnterpriseApplications'
            where = "d.mdm_target_type = 'mac' AND d.\"OSVersion\" ~* '10\\.[1-9][0-9].*'"

          when 'AllowActivationLock'
            where = "d.mdm_target_type = 'ios' AND d.\"IsSupervised\""
          when 'RemoveActivationLock'
            where = "d.mdm_target_type = 'ios' AND d.\"IsSupervised\" AND d.activation_lock_bypass_code IS NOT NULL"

          when 'SetAutoAdminPassword'
            join  = 'library_item_metadata AS m USING (id)'   # JOIN to library_item_metadata to access dynamic_attributes
            where = "d.is_dep_device AND d.mdm_target_type = 'mac' AND (m.dynamic_attributes#>>'{AutoSetupAdminAccounts,0,shortName}') IS NOT NULL"

          when 'EnableLostMode'
            join  = 'library_item_metadata AS m USING (id)'   # JOIN to library_item_metadata to access dynamic_attributes
            where = "d.mdm_target_type = 'ios' AND d.\"IsSupervised\" AND d.\"OSVersion\" ~* '^(9\\.[3-9]|[1-9]\\d+)' AND (m.dynamic_attributes->>'IsMDMLostModeEnabled') IS DISTINCT FROM 'true'"

          when 'LogOutUser'
            where = "d.is_multi_user"

          when 'DeviceLocation', 'DisableLostMode'
            join  = 'library_item_metadata AS m USING (id)'   # JOIN to library_item_metadata to access dynamic_attributes
            where = "d.mdm_target_type = 'ios' AND d.\"IsSupervised\" AND d.\"OSVersion\" ~* '^(9\\.[3-9]|[1-9]\\d+)' AND (m.dynamic_attributes->>'IsMDMLostModeEnabled') = 'true'"

          when 'PlayLostModeSound'
            join  = 'library_item_metadata AS m USING (id)'   # JOIN to library_item_metadata to access dynamic_attributes
            where = "d.mdm_target_type = 'ios' AND d.\"IsSupervised\" AND  d.\"OSVersion\" ~* '^(10\\.[3-9]|10\\.1\\d+|[1-9][1-9])' AND (m.dynamic_attributes->>'IsMDMLostModeEnabled') = 'true'"  # iOS 10.3+

          when 'EnableDiagnosticSubmission'
            join  = 'library_item_metadata AS m USING (id)'   # JOIN to library_item_metadata to access dynamic_attributes
            where = "d.is_multi_user AND (m.dynamic_attributes->>'DiagnosticSubmissionEnabled') IS DISTINCT FROM 'true'"

          when 'DisableDiagnosticSubmission'
            join  = 'library_item_metadata AS m USING (id)'   # JOIN to library_item_metadata to access dynamic_attributes
            where = "d.is_multi_user AND (m.dynamic_attributes->>'DiagnosticSubmissionEnabled') = 'true'"

          when 'EnableAppAnalytics'
            join  = 'library_item_metadata AS m USING (id)'   # JOIN to library_item_metadata to access dynamic_attributes
            where = "d.is_multi_user AND d.\"OSVersion\" ~* '^(9\\.[3-9]\\.[2-9]|9\\.[4-9].*|[1-9]\\d+)' AND (m.dynamic_attributes->>'DiagnosticSubmissionEnabled') = 'true' AND (m.dynamic_attributes->>'AppAnalyticsEnabled') IS DISTINCT FROM 'true'"

          when 'DisableAppAnalytics'
            join  = 'library_item_metadata AS m USING (id)'   # JOIN to library_item_metadata to access dynamic_attributes
            where = "d.is_multi_user AND d.\"OSVersion\" ~* '^(9\\.[3-9]\\.[2-9]|9\\.[4-9].*|[1-9]\\d+)' AND (m.dynamic_attributes->>'DiagnosticSubmissionEnabled') = 'true' AND (m.dynamic_attributes->>'AppAnalyticsEnabled') = 'true'"

          when 'PasscodeLockGracePeriod'
            where = "d.is_multi_user AND d.\"OSVersion\" ~* '^(9\\.[3-9]\\.[2-9]|9\\.[4-9].*|[1-9]\\d+)'" # iOS 9.3.2+

          when 'EraseDevice'
            where = "d.mdm_target_type <> 'tv' OR d.\"OSVersion\" ~* '^(10\\.[2-9]|10\\.1\\d+|[1-9][1-9])'" # tvOS 10.2+

          when 'RestartDevice'
            ios_where = "d.mdm_target_type = 'ios' AND d.\"IsSupervised\" AND d.\"OSVersion\" ~* '^(10\\.[3-9]|10\\.1\\d+|[1-9][1-9])'" # iOS 10.3+
            tvos_where = "d.mdm_target_type = 'tv' AND d.\"IsSupervised\" AND d.\"OSVersion\" ~* '^(10\\.[2-9]|10\\.1\\d+|[1-9][1-9])'" # tvOS 10.2+
            where = "(#{ios_where}) OR (#{tvos_where})"

          when 'ShutDownDevice'
            where = "d.mdm_target_type = 'ios' AND d.\"IsSupervised\" AND d.\"OSVersion\" ~* '^(10\\.[3-9]|10\\.1\\d+|[1-9][1-9])'" # iOS 10.3+
          end # case task_type

          return self.get_all_device_ids(where, join)
        end
      end # unless self.method_defined?

      #-------------------------------------------------------------------------

      unless self.method_defined?(:get_all_ios_device_ids)  # Don't override any existing implementation
        def get_all_ios_device_ids; return self.get_all_device_ids("d.mdm_target_type <> 'mac'"); end
      end # unless self.method_defined?

      #-------------------------------------------------------------------------

      unless self.method_defined?(:get_all_mac_device_ids)  # Don't override any existing implementation
        def get_all_mac_device_ids; return self.get_all_device_ids("d.mdm_target_type = 'mac'");  end
      end # unless self.method_defined?

      #-------------------------------------------------------------------------

      unless self.method_defined?(:get_edu_devices_user_info)  # Don't override any existing implementation
        def get_edu_devices_user_info; return (self.connection.select_json_value_by_index("SELECT dm_get_edu_devices_users_info(#{self.id})") || []); end
      end # unless self.method_defined?

      #-------------------------------------------------------------------------

      unless self.method_defined?(:get_related_app_ids)  # Don't override any existing implementation
        def get_related_app_ids;  return self.connection.select_integer_values_by_index("SELECT app_id FROM view_library_items_unified_applications WHERE library_item_id = #{self.id}"); end
      end # unless self.method_defined?

      #-------------------------------------------------------------------------

      unless self.method_defined?(:get_related_app_info)  # Don't override any existing implementation
        def get_related_app_info; return self.connection.select_json_array_by_index("SELECT app_json FROM view_library_items_unified_applications WHERE library_item_id = #{self.id}"); end
      end # unless self.method_defined?

      #-------------------------------------------------------------------------

      unless self.method_defined?(:get_related_profile_ids)  # Don't override any existing implementation
        def get_related_profile_ids
          p = Profile.find_by_library_item_id(self.id)
          return [p && p.id]
        end # get_related_profile_ids
      end # unless self.method_defined?

      #-------------------------------------------------------------------------

      unless self.method_defined?(:get_related_book_info)  # Don't override any existing implementation
        def get_related_book_info; return self.connection.select_json_array_by_index("SELECT app_json FROM view_library_items_unified_books WHERE library_item_id = #{self.id}"); end
      end # unless self.method_defined?

      #-------------------------------------------------------------------------

      unless self.method_defined?(:get_related_unified_book_ids)  # Don't override any existing implementation
        def get_related_unified_book_ids; return self.connection.select_integer_values_by_index("SELECT book_id FROM view_library_items_unified_books WHERE library_item_id = #{self.id}"); end
      end # unless self.method_defined?

      #-------------------------------------------------------------------------

      unless self.method_defined?(:get_related_managed_app_ids)  # Don't override any existing implementation
        def get_related_managed_app_ids;  return self.connection.select_integer_values_by_index("SELECT id FROM view_library_items_managed_applications WHERE parent_library_item_id = #{self.id}"); end
      end # unless self.method_defined?

      #-------------------------------------------------------------------------

      unless self.method_defined?(:get_related_managed_book_ids)  # Don't override any existing implementation
        def get_related_managed_book_ids; return self.connection.select_integer_values_by_index("SELECT id FROM view_library_items_managed_books WHERE parent_library_item_id = #{self.id}"); end
      end # unless self.method_defined?

      #-------------------------------------------------------------------------

      unless self.method_defined?(:get_os_updates_info)  # Don't override any existing implementation
        def get_os_updates_info
          info = (self.connection.select_json_value_by_index("SELECT dm_get_os_updates_info(#{self.id})") || [])
          locale = I18n.locale
          info.each { |i|
            names = i.delete('UpdateNames')
            i['Title'] = (names[locale] || names['en'] || names['DEFAULT'] || names.values[0]) if names
            i['Title'] ||= 'Missing Update Name'
          } # info.each
          return info
        end
      end # unless self.method_defined?

      #-------------------------------------------------------------------------

      unless self.method_defined?(:library_item_metadata)  # Don't override any existing implementation
        def library_item_metadata
          unless @library_item_metadata
            @library_item_metadata = LibraryItemMetadata.find_by_id(self.id)
            MDMUtilities.on_commit   { @library_item_metadata = nil }
            MDMUtilities.on_rollback { @library_item_metadata = nil }
          end
          return @library_item_metadata
        end
      end # unless self.method_defined?

      #-------------------------------------------------------------------------


      unless self.method_defined?(:profile)  # Don't override any existing implementation
        def profile
          unless @profile
            @profile = Profile.find_by_library_item_id(self.id)
            MDMUtilities.on_commit   { @profile = nil }
            MDMUtilities.on_rollback { @profile = nil }
          end
          return @profile
        end # profile
      end # unless self.method_defined?

    	#-------------------------------------------------------------------------

      def osx_setup_assistant_config=(c)
        lim = self.library_item_metadata
        if c && c['AdminAccount']
          pwd = c['AdminAccount'].delete('password')
          if pwd != PasswordSlug  # Don't set all bullets as the password--that is the value we sent to the admin
            if pwd.empty?
              c['AdminAccount'].delete('passwordHash')    # No password, no passwordHash
            else
              c['AdminAccount']['passwordHash'] = pwd.pbkdf2_password_hash
              c['AdminAccount']['password'] = PasswordSlug
              c['AdminAccount']['password_verify']  = PasswordSlug
            end
          else
            c['AdminAccount']['password'] = PasswordSlug
            c['AdminAccount']['password_verify'] = PasswordSlug
            c['AdminAccount']['passwordHash'] = lim.osx_setup_assistant_config['AdminAccount']['passwordHash']  # Make sure passwordHash hasn't changed, since the password isn't changed
          end
        end # if c['AdminAccount']
        lim.osx_setup_assistant_config = c
        lim.save
      end # osx_setup_assistant_config=

      #-------------------------------------------------------------------------

      def educationModeUserCount=(c)
        lim = self.library_item_metadata
        lim.educationModeUserCount = c
        lim.save
      end # educationModeUserCount=

      #-------------------------------------------------------------------------

    end # base.class_eval
  end # self.included

#-------------------------------------------------------------------------
end # module MDMLibraryItemBase
#-------------------------------------------------------------------------
