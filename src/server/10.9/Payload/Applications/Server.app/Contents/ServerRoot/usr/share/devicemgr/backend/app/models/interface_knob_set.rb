#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class InterfaceKnobSet < KnobSet

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
    if self.Interface == "BuiltInWireless"
      name = "wifi_display_name"
      desc = self.SSID_STR
    else
      name = "802_1x_display_name"
      desc = nil
    end
    name = I18n.t(name)
    name = sprintf(I18n.t("profile_long_display_format"), name, desc) if desc && !short
    return name
  end

  #-------------------------------------------------------------------------

  def payload_type
    return (self.Interface == "BuiltInWireless" ? "com.apple.wifi.managed" : "com.apple.firstactiveethernet.managed")
  end

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

    if !payload_hash['EAPClientConfiguration'].nil?
      if payload_hash['PayloadCertificateUUID']
        payload_hash['EAPClientConfiguration']['TLSCertificateIsRequired'] = true
      elsif payload_hash['EAPClientConfiguration']['AcceptEAPTypes'].kind_of?(Array) && payload_hash['EAPClientConfiguration']['AcceptEAPTypes'].include?(13)
        payload_hash['EAPClientConfiguration']['TLSCertificateIsRequired'] = false
      end
    end

    # Remove EAPClientConfiguration if Security/EncryptionType is set to None
    payload_hash.delete('EAPClientConfiguration') if payload_hash['EncryptionType'] == 'None'

    return payload_hash
  end
  
  #-------------------------------------------------------------------------

end
