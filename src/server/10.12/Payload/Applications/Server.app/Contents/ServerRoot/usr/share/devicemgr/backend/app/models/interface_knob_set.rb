#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class InterfaceKnobSet < KnobSet

  before_save :before_save_interface_knob_set

  @@payload_type          = "com.apple.interfaces.managed"
  @@payload_subidentifier = "interfaces"
  @@is_unique             = false
  @@payload_name          = "Network"

  EAP_TYPE_TLS            = 13

  #-------------------------------------------------------------------------

  def self.old_table_name
    return "interface_knob_sets"
  end

  #-------------------------------------------------------------------------

  def is_for_ios
    return (self.Interface == "BuiltInWireless")
  end

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    if self.Interface == "FirstActiveEthernet"
      name = "802_1x_display_name"
      desc = nil
    else
      name = "wifi_display_name"
      desc = self.SSID_STR
    end
    name = I18n.t(name)
    name = sprintf(I18n.t("profile_long_display_format"), name, desc) if desc && !short
    return name
  end

  #-------------------------------------------------------------------------

  def payload_type
    return (self.Interface == "FirstActiveEthernet" ? "com.apple.firstactiveethernet.managed" : "com.apple.wifi.managed")
  end

  #-------------------------------------------------------------------------

  def before_save_interface_knob_set
    # remove placeholder entries
    qos_whitelisted_apps = self.QoSMarkingPolicy['QoSMarkingWhitelistedAppIdentifiers'] if self.QoSMarkingPolicy
    if qos_whitelisted_apps
      pruned_qos_whitelisted_apps = qos_whitelisted_apps.map{|app| app if app['bundleId'] != 'placeholder_bundle_id'}.compact
      self.QoSMarkingPolicy['QoSMarkingWhitelistedAppIdentifiers'] = pruned_qos_whitelisted_apps
    end
    return true
  end # before_save_apn_knob_set

  #-------------------------------------------------------------------------

  def modify_payload_hash(payload_hash)
    # Remove System Level Mode if no Credentials were provided
    if payload_hash['AuthenticationMethod'] != 'directory' &&
         (!payload_hash['EAPClientConfiguration'] || !payload_hash['EAPClientConfiguration']['UserName'] || payload_hash['EAPClientConfiguration']['UserName'] == '') &&
         (!payload_hash['PayloadCertificateUUID'] || payload_hash['PayloadCertificateUUID'] == '') # Covers both Certs and SCEP
       # Remove System Mode
       modes = payload_hash['SetupModes']
       modes.delete('System') if modes
    end

    # Remove EAPClientConfiguration if Security/EncryptionType is set to None
    payload_hash.delete('EAPClientConfiguration') if payload_hash['EncryptionType'] == 'None'

    qos_whitelisted_apps = payload_hash['QoSMarkingPolicy']['QoSMarkingWhitelistedAppIdentifiers'] if payload_hash['QoSMarkingPolicy']
    if qos_whitelisted_apps
      pruned_qos_whitelisted_apps = qos_whitelisted_apps.map{|app| app['bundleId']}
      payload_hash['QoSMarkingPolicy']['QoSMarkingWhitelistedAppIdentifiers'] = pruned_qos_whitelisted_apps
    end

    return payload_hash
  end

  #-------------------------------------------------------------------------

end
