#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class XsanKnobSet < KnobSet

  @@payload_type          = 'com.apple.xsan'
  @@payload_subidentifier = "xsan"
  @@is_unique             = true
  @@payload_name          = "Xsan"
  
  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    return I18n.t("xsan_display_name")
  end

  #-------------------------------------------------------------------------

  def modify_payload_hash(payload_hash)          
    asset_ids = self.get_related_asset_ids    
    payload_hash.delete('xsan_network')
    if asset_ids && asset_ids.length > 0
      xsan_asset = XsanNetwork.find_by_id(asset_ids[0])
      payload_hash['sanName'] = xsan_asset.name
      payload_hash['sanUUID'] = xsan_asset.uuid
      payload_hash['sanConfigURLs'] = xsan_asset.san_config_urls
      payload_hash['sanAuthMethod'] = xsan_asset.san_auth_method
      payload_hash['sharedSecret'] = xsan_asset.san_auth_secret      
    end
    return payload_hash
  end
  
  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    ids = self.get_related_asset_ids
    attr_hash[:xsan_network] = ids[0] if ids && ids.length > 0 # The admin only supports one xsan_network per knob_set    
    return attr_hash
  end

  #-------------------------------------------------------------------------

  def also_modifies
    return {:assets => [:xsan_network]}
  end

  #-------------------------------------------------------------------------

end
