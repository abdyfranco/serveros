#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class VpnKnobSet < KnobSet

  before_save :before_save_vpn_knob_set

  @@payload_type          = "com.apple.vpn.managed"
  @@payload_subidentifier = "vpn"
  @@is_unique             = false
  @@payload_name          = "VPN"

  #-------------------------------------------------------------------------

  def self.old_table_name
    return "vpn_knob_sets"
  end

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    name = I18n.t("vpn_display_name")
    name = sprintf(I18n.t("profile_long_display_format"), name, self.UserDefinedName) unless short
    return name
  end

  #-------------------------------------------------------------------------

  def IPSec
    ipSec = self['IPSec']
    ipSec["SharedSecret"] = Base64.decode64(ipSec["SharedSecret"]).force_encoding(Encoding::UTF_8) if ipSec && ipSec["SharedSecret"].class == BinaryData
    return ipSec
  end

  #-------------------------------------------------------------------------

  def before_save_vpn_knob_set
    self.PPP.delete_if     { |key, value| value == nil } if self.PPP
    self.IPSec.delete_if   { |key, value| value == nil } if self.IPSec
    self.VPN.delete_if     { |key, value| value == nil } if self.VPN
    self.Proxies.delete_if { |key, value| value == nil } if self.Proxies
    ipSec = self.IPSec
    ipSec["SharedSecret"] = BinaryData.new(Base64.encode64(ipSec["SharedSecret"])) if ipSec && ipSec.has_key?("SharedSecret")
    return true
  end

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    # attr_hash["IPSec"]["SharedSecret"] = Base64.decode64(self.IPSec["SharedSecret"]) if self.IPSec && self.IPSec.has_key?("SharedSecret")
    self.IPSec  # Don't need return value, just need to call it for the side effect of decoding "SharedSecret"
    return attr_hash
  end

  #-------------------------------------------------------------------------

  def modify_payload_hash(payload_hash)
    type = payload_hash['VPNType']

    # 1. If Shared Secret is not present or blank and AuthenticationMethod is SharedSecred, remove IPSec > AuthenticationMethod, unless the VPNType is IPSec
    ipsec = payload_hash["IPSec"]
    payload_hash["IPSec"].delete("AuthenticationMethod") if type != 'IPSec' && ipsec && ipsec["AuthenticationMethod"] == "SharedSecret" && (ipsec["SharedSecret"].nil? || ipsec["SharedSecret"] == '')

    if payload_hash["VPN"]
      ppp = payload_hash["PPP"]
      # 2. If User Auth is Certificate, set VPN/AuthenticationMethod to Certificate.
      #    Certificate appears to be distinguishable via PPP.AuthProtocol containing EAP
      ppp["AuthenticationMethod"] = "Certificate" if ppp && ppp["AuthProtocol"] && ppp["AuthProtocol"].include?("EAP")

      # 3. If User Auth is not Password, remove VPN/Password key.
      #    User Auth appears to be distinguishable via PPP.AuthProtocol null and PPP.TokenCard null
      payload_hash["VPN"].delete("AuthPassword") if ppp.nil? || ppp["AuthProtocol"] || ppp["TokenCard"]

      # 4. Some random crap because the VPN spec doesn't reflect reality
      if type == 'L2TP' || type == 'PPTP' || type == 'IPSec'
        if ppp && type != 'IPSec' && payload_hash['VPN']['AuthenticationMethod'] == 'Password' && payload_hash['VPN'].include?('AuthPassword')
          payload_hash['PPP']['AuthenticationMethod'] = 'Password'
          payload_hash['PPP']['AuthPassword']         = payload_hash['VPN']['AuthPassword']
        end

        # Move the cert spec into the IPSec payload for IPSec type
        if payload_hash['VPN'].has_key?('PayloadCertificateUUID')
          if type == 'IPSec'
            payload_hash['IPSec']['PayloadCertificateUUID'] = payload_hash['VPN'].delete('PayloadCertificateUUID') # .delete returns the deleted bits
          elsif type == 'L2TP' && payload_hash['VPN'].has_key?('PayloadCertificateUUID')
            payload_hash['PPP']['PayloadCertificateUUID'] = payload_hash['VPN'].delete('PayloadCertificateUUID') # .delete returns the deleted bits
          end
        end

        payload_hash.delete('VPN')  # The "main three" VPN types should not have any 'VPN' section
      end
    end

    # 5. OverridePrimary belongs in its own dictionary under the 'IPv4' key
    # (If only this were actually documented somewhere!)
    if payload_hash.include?('OverridePrimary')
      payload_hash['IPv4'] = { 'OverridePrimary' => (payload_hash['OverridePrimary'] ? 1 : 0) }
      payload_hash.delete('OverridePrimary')
    end

    # 6. 'PPP' section is only for L2TP and PPTP
    payload_hash.delete('PPP') if type != 'L2TP' && type != 'PPTP'

    # 7. Remove HTTPEnable, HTTPSEnable, ProxyAutoConfigEnable, and ProxyAutoDiscoveryEnable keys if their value is not 1
    proxy = payload_hash["Proxies"]
    if proxy
      proxy.delete("HTTPEnable")               if proxy["HTTPEnable"]               != 1
      proxy.delete("HTTPSEnable")              if proxy["HTTPSEnable"]              != 1
      proxy.delete("ProxyAutoConfigEnable")    if proxy["ProxyAutoConfigEnable"]    != 1
      proxy.delete("ProxyAutoDiscoveryEnable") if proxy["ProxyAutoDiscoveryEnable"] != 1

      #8. Remove ProxyAutoConfigEnable and ProxyAutoConfigURLString keys if ProxyAutoDiscoveryEnable value is 1
      if proxy["ProxyAutoDiscoveryEnable"] == 1
        proxy.delete("ProxyAutoConfigEnable")
        proxy.delete("ProxyAutoConfigURLString")
      end
    end

    #9. Add 'LocalIdentifierType' if 'LocalIdentifier' key is present
    payload_hash['IPSec']['LocalIdentifierType'] = 'KeyID' if type == 'IPSec' && payload_hash["IPSec"].include?('LocalIdentifier')

    return payload_hash
  end

  #-------------------------------------------------------------------------

end
