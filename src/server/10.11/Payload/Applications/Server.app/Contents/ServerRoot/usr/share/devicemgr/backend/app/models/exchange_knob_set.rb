#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class ExchangeKnobSet < KnobSet
#-------------------------------------------------------------------------

  class << self
    alias_method :base_payload_type, :payload_type   # We need to hide the base class's implementation so the dynamic attribute stuff kicks in for payload_type
  end

  #-------------------------------------------------------------------------

  before_save :before_save_exchange

  @@payload_types = {'ios'  => 'com.apple.eas.account',
                     'osx'  => 'com.apple.ews.account',
  }

  @@type_map = {'com.apple.eas.account'  => 'ios',
                'com.apple.ews.account'  => 'osx',
  }

  @@payload_subidentifier = 'exchange'
  @@is_unique             = false
  @@payload_name          = 'Exchange'

  #-------------------------------------------------------------------------

  def self.dynamic_attributes_defaults; return { self.to_s => { :disableMailRecentsSyncing => false } };  end
  def self.old_table_name;              return 'exchange_knob_sets';                                      end
  def self.payload_type;                return @@payload_types['ios'];                                    end

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false);  return self.PayloadDisplayName;                                           end
  def payload_type;                                   return @@payload_types[(self.internal_use_flag_exchange_type || 'ios')];  end
  def payload_type=(type);                            self.internal_use_flag_exchange_type = @@type_map[type];                  end

  #-------------------------------------------------------------------------

  def before_save_exchange
    df = self.data_file
    if df
      meta = df.metadata
      # The file metadata is a hash with keys as string
      DataFileHelper.parse_cert(df.id) unless meta && meta['cert_data'] && meta['cert_data']['certificate']
      self.Certificate = BinaryData.new(df.read_as_base64)
    end
    return true
  end # before_save_exchange

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    df = self.data_file
    attr_hash['data_files'] = [df.id] if df
    return attr_hash
  end # modify_attributes

  #-------------------------------------------------------------------------

  def modify_payload_hash(payload_hash)
    # If this has a Certificate field, convert it from <string> to <data>
    payload_hash['Certificate'] = BinaryData.new(payload_hash['Certificate']) if payload_hash['Certificate']
    return payload_hash
  end # modify_payload_hash

#-------------------------------------------------------------------------
end # ExchangeKnobSet
#-------------------------------------------------------------------------
