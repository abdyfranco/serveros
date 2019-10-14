#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class MobilityKnobSet < KnobSet

  @@payload_type_attributes = {
   'com.apple.MCX'         => [ :cachedaccounts_WarnOnCreate_allowNever, :com_apple_cachedaccounts_CreateAtLogin, 
                                :com_apple_cachedaccounts_CreatePHDAtLogin, :com_apple_cachedaccounts_WarnOnCreate, :cachedaccounts_create_encrypt, 
                                :cachedaccounts_create_encrypt_requireMasterPassword, :cachedaccounts_create_location, :cachedaccounts_create_location_path, 
                                :cachedaccounts_create_maxSize, :cachedaccounts_create_maxSize_fixedSize, :cachedaccounts_create_maxSize_percentOfNetworkHome, 
                                :cachedaccounts_expiry_delete_disusedSeconds, :cachedaccounts_expiry_cond_successfulSync],                      
   'com.apple.homeSync'    => [ :syncPreferencesAtLogin, :syncPreferencesAtLogout, :syncPreferencesAtSyncNow, :syncPreferencesInBackground,
                                :replaceUserPrefSyncList, :excludedPrefItems, :excludedItems, :syncBackgroundSetAtLogin, :syncBackgroundSetAtLogout,
                                :syncBackgroundSetAtSyncNow, :syncBackgroundSetInBackground, :replaceUserSyncList, :syncedPrefFolders, :syncedFolders,
                                :periodicSyncOn, :syncPeriodSeconds],
   'com.apple.mcxMenuExtras' => [:HomeSync_menu]
  }
  @@valid_payload_types = ['com.apple.MCX', 'com.apple.homeSync', 'com.apple.mcxMenuExtras']
  
  @@payload_type          = "com.apple.mobility"
  @@payload_subidentifier = "mobility"
  @@is_unique             = true
  @@payload_name          = "Mobility"

  #-------------------------------------------------------------------------

  def self.old_table_name
    return "mobility_knob_sets"
  end

  #-------------------------------------------------------------------------

  def self.dynamic_attributes_defaults
    return { self.to_s => { :syncPeriodSeconds => 300 } }
  end

  #-------------------------------------------------------------------------
    
  def localized_payload_display_name_for_content(type)
    case type
    when 'com.apple.MCX'
      return I18n.t("mobility_display_name")
    when 'com.apple.homeSync'
      return I18n.t("mobility_sync_display_name")
    when 'com.apple.mcxMenuExtras'
      return I18n.t("mobility_menu_display_name")
    else
      return self.localized_payload_display_name
    end
  end
  
  #-------------------------------------------------------------------------
  
  def localized_payload_display_name(short = false)
    return I18n.t("mobility_display_name")
  end

  #-------------------------------------------------------------------------
  
  def generate_payload_hash(root_payload_identifier, profile_manager_ctx)
    payload_array = [];    
    @@payload_type_attributes.each_pair { |payload_type, keys|
      newUUID = Digest::MD5.hexdigest(self.PayloadUUID.to_s + payload_type.to_s)
      [8,13,18,23].each { |x| newUUID.insert(x,'-') }
      last_element = payload_type.split('.').last
      
      payload_hash = { "PayloadType"        => payload_type,
                       "PayloadVersion"     => 1,
                       "PayloadIdentifier"  => "#{root_payload_identifier}.#{self.payload_subidentifier}.#{last_element}",
                       "PayloadEnabled"     => self.PayloadEnabled,
                       "PayloadUUID"        => newUUID,
                       "PayloadDisplayName" => self.localized_payload_display_name_for_content(payload_type)
                     }
      keys.each { |attribute| payload_hash[attribute.to_s.gsub(/_/,'.')] = self[attribute] }

      # Rename some keys
      if payload_type == 'com.apple.homeSync'
        payload_hash['syncedFolders-managed']     = payload_hash.delete('syncedFolders')
        payload_hash['syncedPrefFolders-managed'] = payload_hash.delete('syncedPrefFolders')
      end

      payload_array.push(payload_hash)
    }
    return payload_array
  end
  
  #-------------------------------------------------------------------------
  
end

