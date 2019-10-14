#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateProvisioningProfiles < ActiveRecord::Migration

  include MDMRecordBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :provisioning_profiles do |t|
      MDMRecordBase.add_base_table_properties(t)

      t.string   :UUID
      t.string   :name
      t.datetime :ExpirationDate
      t.datetime :CreationDate
      t.integer  :TimeToLive
      t.integer  :Version
      t.text     :ProvisionedDevices
      t.text     :ApplicationIdentifierPrefix
      t.text     :Entitlements
      t.text     :DeveloperCertificates
    end
  
    create_table :devices_provisioning_profiles, :force => true, :id => false do |t|
      t.integer :provisioning_profile_id, :null => false
      t.integer :device_id, :null => false
    end
  end

  #-------------------------------------------------------------------------

end
