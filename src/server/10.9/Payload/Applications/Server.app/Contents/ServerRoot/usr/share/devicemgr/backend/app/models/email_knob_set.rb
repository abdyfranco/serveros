#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class EmailKnobSet < KnobSet

  @@payload_type          = "com.apple.mail.managed"
  @@payload_subidentifier = "email"
  @@is_unique             = false
  @@payload_name          = "Email"

  #-------------------------------------------------------------------------

  def self.old_table_name
    return "email_knob_sets"
  end

  #-------------------------------------------------------------------------

  def self.dynamic_attributes_defaults
    return { self.to_s => { :disableMailRecentsSyncing => false } }
  end

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    name = I18n.t(self.EmailAccountType == 'EmailTypePOP' ? "email_pop_display_name" : "email_imap_display_name")
    name = sprintf(I18n.t("profile_long_display_format"), name, self.EmailAccountDescription) unless short
    return name
  end

  #-------------------------------------------------------------------------

  def modify_payload_hash(payload_hash)
    # The only thing different is the display name
    payload_hash["PayloadDisplayName"] = self.EmailAccountDescription
    # Remove OutgoingPassword if its same as incoming password
    payload_hash.delete('OutgoingPassword') if payload_hash["OutgoingPasswordSameAsIncomingPassword"]    
    return payload_hash
  end

  #-------------------------------------------------------------------------
  
end
