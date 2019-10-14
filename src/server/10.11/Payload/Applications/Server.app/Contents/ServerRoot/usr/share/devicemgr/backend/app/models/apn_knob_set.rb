#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class ApnKnobSet < KnobSet
#-------------------------------------------------------------------------

  before_save :before_save_apn_knob_set

  @@payload_type          = "com.apple.cellular"
  @@payload_subidentifier = "cellular"
  @@is_unique             = true
  @@payload_name          = "cellular"

  #-------------------------------------------------------------------------

  def self.old_table_name;  return 'apn_knob_sets'; end

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    return I18n.t("cellular_display_name")
  end

  #-------------------------------------------------------------------------

  def convert_apn_to_cellular(data_hash)
    if data_hash['PayloadContent']
      payload_content = data_hash.delete('PayloadContent')
      default_apn = payload_content[0]['DefaultsData']['apns'][0]
      data_hash['APNs'] = [{
          'Name' => default_apn['apn'],
          'AuthenticationType' => 'PAP',
          'Username' => default_apn['username'],
          'Password' => default_apn['password'],
          'ProxyServer' => default_apn['proxy'],
          'ProxyPort' => default_apn['proxyPort'],
        }]
    end
  end

  #-------------------------------------------------------------------------

  def modify_payload_hash(payload_hash)
    self.convert_apn_to_cellular(payload_hash)
    return payload_hash
  end # modify_payload_hash

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    if attr_hash['PayloadContent']
      attr_hash['internal_use_flag_configured_apn_types'] = 'data'
    end
    self.convert_apn_to_cellular(attr_hash)
    return attr_hash
  end # modify_attributes

  #-------------------------------------------------------------------------

  def before_save_apn_knob_set
    # get rid of the content in the old payload format, we already copied old data into the new format in modify_attributes
    self.PayloadContent = nil
    return true
  end # before_save_apn_knob_set

  #-------------------------------------------------------------------------


#-------------------------------------------------------------------------
end # ApnKnobSet
#-------------------------------------------------------------------------
