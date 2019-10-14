#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class LoginWindowKnobSet < KnobSet

  @@payload_type_attributes = {
    'com.apple.loginwindow' => [:AdminHostInfo, :LoginwindowText, :SHOWFULLNAME, :HideLocalUsers, :HideMobileAccounts, :IncludeNetworkUser, 
                                :HideAdminUsers, :SHOWOTHERUSERS_MANAGED, :RestartDisabled, :ShutDownDisabled, :RetriesUntilHint, :DisableAutoLoginClient,
                                :DisableConsoleAccess, :AdminMayDisableMCX, :UseComputerNameForComputerRecordName, :EnableExternalAccounts, 
                                :AlwaysShowWorkgroupDialog, :CombineUserWorkgroups, :FlattenUserWorkgroups, :LocalUserLoginEnabled, :LocalUsersHaveWorkgroups,
                                :AllowUsers, :AllowUserGroups, :DenyUsers, :DenyUserGroups],
    'com.apple.screensaver' => [:loginWindowIdleTime, :loginWindowModulePath, :idleTime, :moduleName],
    'com.apple.MCX'         => [:DisableGuestAccount, :ShutDownDisabled],
    '.GlobalPreferences'    => [:MultipleSessionEnabled, :AutoLogOutDelay],
    'com.apple.mcxloginscripts' => [:loginscripts_filename, :loginscripts_filedata, :logoutscripts_filename, :logoutscripts_filedata, :skipLoginHook, :skipLogoutHook]
  }
  @@valid_payload_types = ['.GlobalPreferences', 'com.apple.loginwindow', 'com.apple.screensaver', 'com.apple.MCX', 'com.apple.mcxloginscripts']
  @@payload_type          = "com.apple.loginwindow"
  @@payload_subidentifier = "loginwindow"
  @@is_unique             = false
  @@payload_name          = "LoginWindow"

  #-------------------------------------------------------------------------

  def self.old_table_name
    return "login_window_knob_sets"
  end

  #-------------------------------------------------------------------------

  def generate_payload_hash(root_payload_identifier, profile_manager_ctx)
    payload_array = [];    
    @@payload_type_attributes.each_pair { |payload_type, keys|
      newUUID = Digest::MD5.hexdigest(self.PayloadUUID.to_s + payload_type.to_s)
      [8,13,18,23].each{ |x| newUUID.insert(x,'-') }
      last_element = payload_type.split('.').last
      
      payload_hash = { "PayloadType"        => payload_type,
                       "PayloadVersion"     => 1,
                       "PayloadIdentifier"  => "#{root_payload_identifier}.#{self.payload_subidentifier}.#{last_element}",
                       "PayloadEnabled"     => self.PayloadEnabled,
                       "PayloadUUID"        => newUUID,
                       "PayloadDisplayName" => self.localized_payload_display_name_for_content(payload_type)
                     }
      keys.each{ |attribute| 
        value = self[attribute]
        if attribute == :AutoLogOutDelay
          payload_hash["com.apple.autologout.AutoLogOutDelay"] = self[attribute]
        elsif attribute == :ShutDownDisabled
          if payload_type == 'com.apple.loginwindow'
            payload_hash['ShutDownDisabled'] = value
            payload_hash['RestartDisabled'] = value
            payload_hash['SleepDisabled'] = value
          elsif payload_type == 'com.apple.MCX'
            payload_hash['SleepDisabled'] = value
          end
        elsif attribute == :DisableGuestAccount
          payload_hash["DisableGuestAccount"] = self[attribute]
          payload_hash["EnableGuestAccount"] = !self[attribute]
        elsif attribute == :DisableAutoLoginClient
          # set this only if the value is true
          payload_hash["com.apple.login.mcx.DisableAutoLoginClient"] = value if value
        elsif attribute == :UseComputerNameForComputerRecordName
          # set this only if the value is true
          payload_hash["UseComputerNameForComputerRecordName"] = value if value
        elsif [:loginscripts_filename, :loginscripts_filedata, :logoutscripts_filename, :logoutscripts_filedata].include?(attribute)
          if attribute == :loginscripts_filedata && self[:loginscripts_filedata] && self[:loginscripts_filedata].length > 0
            data = BinaryData.new(self[:loginscripts_filedata])
            payload_hash["loginscripts"] = [{ "filedata" => data, "filename" => self[:loginscripts_filename]}]
          elsif attribute == :logoutscripts_filedata && self[:logoutscripts_filedata] && self[:logoutscripts_filedata].length > 0
            data = BinaryData.new(self[:logoutscripts_filedata])
            payload_hash["logoutscripts"] = [{ "filedata" => data, "filename" => self[:logoutscripts_filename]}]
          end
        elsif attribute == :AllowUsers
          payload_hash["AllowList"] ||= []
          if self[attribute.to_s]
            users = User.get_attributes_for_multiple_by_id(self[attribute.to_s], true)            
            users.each{ |x| payload_hash["AllowList"].push(x["guid"].upcase) }
          end 
        elsif attribute == :AllowUserGroups
          payload_hash["AllowList"] ||= []
          if self[attribute.to_s]
            groups = UserGroup.get_attributes_for_multiple_by_id(self[attribute.to_s], true)  
            groups.each{ |x| payload_hash["AllowList"].push(x["guid"].upcase) }
          end
        elsif attribute == :DenyUsers
          payload_hash["DenyList"] ||= []
          if self[attribute.to_s]
            users = User.get_attributes_for_multiple_by_id(self[attribute.to_s], true)  
            users.each{ |x| payload_hash["DenyList"].push(x["guid"].upcase) }
          end
        elsif attribute == :DenyUserGroups
          payload_hash["DenyList"] ||= []
          if self[attribute.to_s]
            groups = UserGroup.get_attributes_for_multiple_by_id(self[attribute.to_s], true)  
            groups.each{ |x| payload_hash["DenyList"].push(x["guid"].upcase) }
          end          
        elsif ProfileManager.add?(value, attribute)
          payload_hash[attribute.to_s] = value
        end
      }
      
      payload_array.push(payload_hash)
    }
    return payload_array
  end

  #-------------------------------------------------------------------------
  
  def localized_payload_display_name_for_content(type)
    case type
    when 'com.apple.screensaver'
      return I18n.t("login_window_screen_saver_display_name")
    when 'com.apple.MCX'
      return I18n.t("login_window_mcx_display_name")
    when '.GlobalPreferences'
      return I18n.t("login_window_global_display_name")
    when 'com.apple.mcxloginscripts'
      return I18n.t("login_window_scripts_display_name")
    else
      return self.localized_payload_display_name
    end
  end

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    return I18n.t("login_window_display_name")
  end

  #-------------------------------------------------------------------------

end
