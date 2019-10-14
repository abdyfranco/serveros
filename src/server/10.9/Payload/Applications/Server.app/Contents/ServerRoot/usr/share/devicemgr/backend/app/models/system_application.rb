#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class SystemApplication < ActiveRecord::Base
  
  has_and_belongs_to_many :dock_knob_sets
  has_and_belongs_to_many :login_item_knob_sets
  has_and_belongs_to_many :mac_restrictions_knob_sets
  
  serialize :subApps, Array
  
  #-------------------------------------------------------------------------

  def self.table_name
    return "system_applications"
  end

  #-------------------------------------------------------------------------

  def attributes
    attr_dict = super
    # devicemgrd encodes the string in UTF-8, and then base64 encodes the result, so we should expect UTF-8 out of the 
    # base64 decode. Ruby seems to default to ASCII-8bit, which is not correct.
    attr_dict["display_name"] = Base64.decode64(attr_dict["display_name"]).force_encoding("UTF-8") if attr_dict["display_name"]
    return attr_dict
  end

  #-------------------------------------------------------------------------

  include MDMRecordBase
  
end
