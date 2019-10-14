#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

IDENTIFICATION_ENABLED_KNOB_SETS = ['com.apple.ews.account',
                                    'com.apple.caldav.account',
                                    'com.apple.mail.managed',
                                    'com.apple.vpn.managed',
                                    'com.apple.carddav.account',
                                    'com.apple.ldap.account',
                                    'com.apple.jabber.account']

class IdentificationKnobSet < KnobSet

  @@payload_type          = "com.apple.configurationprofile.identification"
  @@payload_subidentifier = "identification"
  @@is_unique             = true
  @@payload_name          = "Identification"

  #-------------------------------------------------------------------------

  def self.default_identification_knob_set
    knob_set = self.new
    knob_set[:is_from_servermgr]      = false
    knob_set[:PayloadType]            = @@payload_type
    knob_set[:PayloadUUID]            = UUID.new.generate
    knob_set["PayloadIdentification"] = {}
    return knob_set
  end

  #-------------------------------------------------------------------------

  def self.old_table_name
    return "identification_knob_sets"
  end

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    return I18n.t("identification_display_name")
  end

  #-------------------------------------------------------------------------
  
end
