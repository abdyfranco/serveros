#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateMobilityKnobSets < ActiveRecord::Migration

  include KnobSetBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :mobility_knob_sets do |t|
      KnobSetBase.add_base_table_properties(t)
      
      # com.apple.MCX
      t.boolean :cachedaccounts_WarnOnCreate_allowNever
      t.boolean :com_apple_cachedaccounts_CreateAtLogin
      t.boolean :com_apple_cachedaccounts_CreatePHDAtLogin
      t.boolean :com_apple_cachedaccounts_WarnOnCreate
      t.boolean :cachedaccounts_create_encrypt
      t.boolean :cachedaccounts_create_encrypt_requireMasterPassword
      
      t.string  :cachedaccounts_create_location
      t.string  :cachedaccounts_create_location_path
      t.string  :cachedaccounts_create_maxSize
      t.string  :cachedaccounts_create_maxSize_fixedSize

      t.integer :cachedaccounts_create_maxSize_percentOfNetworkHome
      t.integer :cachedaccounts_expiry_delete_disusedSeconds
      
      t.boolean :cachedaccounts_expiry_cond_successfulSync
      
      # Just for UI support
      t.integer :cachedAccountsDeleteAfterMultiplier
      
      # com.apple.homeSync
      t.string  :syncPreferencesAtLogin
      t.string  :syncPreferencesAtLogout
      t.string  :syncPreferencesAtSyncNow
      t.string  :syncPreferencesInBackground
      t.boolean :replaceUserPrefSyncList
      t.text    :excludedPrefItems
      t.text    :excludedItems
      
      t.string  :syncBackgroundSetAtLogin
      t.string  :syncBackgroundSetAtLogout
      t.string  :syncBackgroundSetAtSyncNow
      t.string  :syncBackgroundSetInBackground
      t.boolean :replaceUserSyncList
      t.text    :syncedPrefFolders
      t.text    :syncedFolders
      
      t.boolean :periodSyncOn
      t.boolean :syncPeriodSeconds
      
      
      # com.apple.mcxMenuExtras
      t.boolean :HomeSync_menu
      
    end
  end

  #-------------------------------------------------------------------------

end
