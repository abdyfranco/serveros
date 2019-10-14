#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class InterfaceKnobSet < KnobSet
#-------------------------------------------------------------------------

  before_save :before_save_interface_knob_set

  @@payload_type          = 'com.apple.interfaces.managed'
  @@payload_subidentifier = 'interfaces'
  @@is_unique             = false
  @@payload_name          = 'Network'

  ETHERNET_INTERFACE_TYPES  = {
    'FirstActiveEthernet'   => 'com.apple.firstactiveethernet.managed',
    'SecondActiveEthernet'  => 'com.apple.secondactiveethernet.managed',
    'ThirdActiveEthernet'   => 'com.apple.thirdactiveethernet.managed',
    'FirstEthernet'         => 'com.apple.firstethernet.managed',
    'SecondEthernet'        => 'com.apple.secondethernet.managed',
    'ThirdEthernet'         => 'com.apple.thirdethernet.managed',
    'AnyEthernet'           => 'com.apple.globalethernet.managed',
  }

  #-------------------------------------------------------------------------

  def payload_type; return (ETHERNET_INTERFACE_TYPES[self.Interface] || 'com.apple.wifi.managed');  end

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    if ETHERNET_INTERFACE_TYPES[self.Interface]
      name = '802_1x_display_name'
      desc = nil
    else
      name = 'wifi_display_name'
      desc = self.SSID_STR
    end
    name = I18n.t(name)
    name = sprintf(I18n.t('profile_long_display_format'), name, desc) if desc && !short
    return name
  end # localized_payload_display_name

  #-------------------------------------------------------------------------

  def before_save_interface_knob_set
    # remove placeholder entries
    qos = self.QoSMarkingPolicy
    qos_whitelisted_apps = (qos && qos['QoSMarkingWhitelistedAppIdentifiers'])
    qos['QoSMarkingWhitelistedAppIdentifiers'] = qos_whitelisted_apps.reject { |app| app['bundleId'] == 'placeholder_bundle_id'} if qos_whitelisted_apps
    return true
  end # before_save_apn_knob_set

#-------------------------------------------------------------------------
end # class InterfaceKnobSet
#-------------------------------------------------------------------------
