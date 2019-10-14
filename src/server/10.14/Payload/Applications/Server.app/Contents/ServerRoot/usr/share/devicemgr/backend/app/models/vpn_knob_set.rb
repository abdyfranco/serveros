#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class VpnKnobSet < KnobSet
#-------------------------------------------------------------------------

  before_save :before_save_vpn_knob_set

  @@payload_type          = 'com.apple.vpn.managed'
  @@payload_subidentifier = 'vpn'
  @@is_unique             = false
  @@payload_name          = 'VPN'

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    name = I18n.t('vpn_display_name')
    name = sprintf(I18n.t('profile_long_display_format'), name, self.UserDefinedName) unless short
    return name
  end # localized_payload_display_name

  #-------------------------------------------------------------------------

  def IPSec
    ipSec = self['IPSec']
    ipSec['SharedSecret'] = Base64.decode64(ipSec['SharedSecret']).force_encoding(Encoding::UTF_8) if ipSec && ipSec['SharedSecret'].class == BinaryData
    return ipSec
  end # IPSec

  #-------------------------------------------------------------------------

  def before_save_vpn_knob_set
    self.PPP.delete_if     { |key, value| value == nil } if self.PPP
    self.IPSec.delete_if   { |key, value| value == nil } if self.IPSec
    self.VPN.delete_if     { |key, value| value == nil } if self.VPN
    self.Proxies.delete_if { |key, value| value == nil } if self.Proxies
    ipSec = self.IPSec
    ipSec['SharedSecret'] = BinaryData.new(Base64.encode64(ipSec['SharedSecret'])) if ipSec && ipSec.has_key?('SharedSecret')
    return true
  end # before_save_vpn_knob_set

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    # attr_hash['IPSec']['SharedSecret'] = Base64.decode64(self.IPSec['SharedSecret']) if self.IPSec && self.IPSec.has_key?('SharedSecret')
    self.IPSec  # Don't need return value, just need to call it for the side effect of decoding "SharedSecret"
    return attr_hash
  end # modify_attributes

#-------------------------------------------------------------------------
end # class VpnKnobSet
#-------------------------------------------------------------------------
