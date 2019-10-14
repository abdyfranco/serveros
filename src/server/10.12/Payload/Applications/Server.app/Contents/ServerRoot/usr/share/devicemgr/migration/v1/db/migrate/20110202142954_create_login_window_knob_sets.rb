#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateLoginWindowKnobSets < ActiveRecord::Migration

  include KnobSetBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :login_window_knob_sets do |t|
      KnobSetBase.add_base_table_properties(t)
            
      #com.apple.loginwindow
      t.string  :AdminHostInfo
      t.string  :LoginwindowText
      t.boolean :SHOWFULLNAME
      t.boolean :HideLocalUsers
      t.boolean :HideMobileAccounts
      t.boolean :IncludeNetworkUser
      t.boolean :HideAdminUsers
      t.boolean :SHOWOTHERUSERS_MANAGED
      t.boolean :RestartDisabled
      t.boolean :ShutDownDisabled
      t.integer :RetriesUntilHint
      t.boolean :DisableAutoLoginClient
      t.boolean :DisableConsoleAccess
      t.boolean :AdminMayDisableMCX
      t.boolean :UseComputerNameForComputerRecordName
      t.boolean :EnableExternalAccounts
      
    	t.boolean :alwaysShowWorkgroupDialog
    	t.boolean :combineUserWorkgroups
    	t.boolean :flattenUserWorkgroups
    	t.boolean :localUserLoginEnabled
    	t.boolean :localUsersHaveWorkgroups
    	
    	t.text    :AllowUsers
    	t.text    :AllowUserGroups
    	t.text    :DenyUsers
    	t.text    :DenyUserGroups
      
      #.GlobalPreferences
      t.boolean :MultipleSessionEnabled
      t.integer :AutoLogOutDelay
      #com.apple.MCX
      t.boolean :DisableGuestAccount
      #com.apple.screensaver
      t.integer :loginWindowIdleTime
      t.string  :loginWindowModulePath
      #com.apple.mcxloginscripts
      t.string  :loginscripts_filename
      t.text    :loginscripts_filedata
      t.string  :logoutscripts_filename
      t.text    :logoutscripts_filedata
      t.boolean :skipLoginHook
      t.boolean :skipLogoutHook
      
    end
  end

  #-------------------------------------------------------------------------

end
