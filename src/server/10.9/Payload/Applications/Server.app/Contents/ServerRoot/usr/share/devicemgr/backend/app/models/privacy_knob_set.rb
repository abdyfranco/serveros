#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class PrivacyKnobSet < KnobSet

  @@payload_type_attributes = {
    'com.apple.SubmitDiagInfo'       => [:AutoSubmit],
    'com.apple.applicationaccess'    => [:allowDiagnosticSubmission],
    'com.apple.systempolicy.control' => [:EnableAssessment, :AllowIdentifiedDevelopers],
    'com.apple.systempolicy.managed' => [:DisableOverride],
    'com.apple.MCX.FileVault2'       => [:Enable, :Defer, :UseRecoveryKey, :OutputPath, :UserEntersMissingInfo, :Username, :Password, :UseKeychain, :PayloadCertificateUUID],
    'com.apple.MCX'                  => [:DestroyFVKeyOnStandby, :dontAllowFDEDisable],
    'com.apple.preference.security'  => [:dontAllowPasswordResetUI, :dontAllowLockMessageUI],
    'com.apple.loginwindow'          => [:ChangePasswordDisabled],
    'com.apple.screensaver'          => [:askForPassword]
  }
  
  @@valid_payload_types   = ["com.apple.SubmitDiagInfo", 'com.apple.applicationaccess', 'com.apple.systempolicy.control', 'com.apple.systempolicy.managed']
  @@payload_type          = "com.apple.SubmitDiagInfo"
  @@payload_subidentifier = "privacy"
  @@is_unique             = true
  @@payload_name          = "Security & Privacy"
  @@exclude_if_false      = [:dontAllowPasswordResetUI, :dontAllowLockMessageUI, :askForPassword, :ChangePasswordDisabled, :DisableOverride]

  #-------------------------------------------------------------------------

  def self.old_table_name
    return "privacy_knob_sets"
  end

  #-------------------------------------------------------------------------

  def generate_payload_hash(root_payload_identifier, profile_manager_ctx)
    profile = profile_manager_ctx.target
    library_item_type = profile.library_item_type
    is_user_profile = (library_item_type == 'UserGroup') || (library_item_type == 'User')
    payload_array = [];    
    @@payload_type_attributes.each_pair { |payload_type, keys|
      # We don't know if this is a user or device profile in this scope, the admin sets these to nil if it is a user profile
      # Alex warned it would do bad things if this was included in a user profile, so make sure its not around
      next if payload_type == 'com.apple.systempolicy.control' && (self[:EnableAssessment].nil? || self[:AllowIdentifiedDevelopers].nil?)

      # don't include FileVault payload for user profiles
      next if is_user_profile && payload_type == 'com.apple.MCX.FileVault2'

      # don't include FileVault payload if its not required. We only require FileVault, never try to disable FileVault
      next if payload_type == 'com.apple.MCX.FileVault2' && self[:Enable] == "Off"

      # don't include system policy if no keys are set
      next if payload_type == 'com.apple.systempolicy.managed' && self[:DisableOverride].nil?

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
      keys.each { |attribute| 
        value = (attribute == :allowDiagnosticSubmission ? self[:AutoSubmit] : self[attribute])
        next if @@exclude_if_false.include?(attribute) && !value        
        payload_hash[attribute.to_s] = value if ProfileManager.add?(value, attribute)
      }

      payload_array.push(payload_hash)
    }
    return payload_array
  end

  #-------------------------------------------------------------------------

  def localized_payload_display_name_for_content(type)
    return self.localized_payload_display_name
  end

  #-------------------------------------------------------------------------
  
  def localized_payload_display_name(short = false)
    return I18n.t("privacy_display_name")
  end

  #-------------------------------------------------------------------------
  
end
