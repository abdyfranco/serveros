#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class ProvisioningProfile < ActiveRecord::Base

  has_one :data_file
  
  has_and_belongs_to_many :devices
  
  serialize :ProvisionedDevices, Array
  serialize :ApplicationIdentifierPrefix, Array
  serialize :Entitlements, Hash
  serialize :DeveloperCertificates, Array

  #-------------------------------------------------------------------------

  def self.table_name
    return "provisioning_profiles"
  end

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    attr_hash.delete("DeveloperCertificates")
    df = self.data_file
    attr_hash[:data_file] = df.id if df
    return attr_hash
  end

  #-------------------------------------------------------------------------

  include MDMRecordBase
  
end
