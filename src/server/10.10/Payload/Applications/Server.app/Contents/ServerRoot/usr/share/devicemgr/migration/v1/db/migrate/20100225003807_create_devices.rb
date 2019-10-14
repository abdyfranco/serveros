#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateDevices < ActiveRecord::Migration

  include MDMRecordBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :devices do |t|
      MDMRecordBase.add_base_table_properties(t)

      t.string   :name
      t.string   :udid              # unique
      t.string   :identifier        # unique
      t.string   :device_type
      t.string   :guid              # unique
      t.string   :scep_uuid
      t.text     :scep_challenge
      t.boolean  :compromised
      t.text     :reg_cert
      t.string   :reg_cert_uuid
      t.string   :reg_challenge
      t.text     :mdm_cert
      t.string   :mdm_cert_uuid
      t.text     :mdm_challenge
      t.integer  :user_id           # The id (pk) of the network user who "owns" this device
      t.integer  :pending_user_id   # The id (pk) of the network user who will own this device after successful join
      t.string   :token
      t.text     :unlock_token
      t.string   :push_magic
      t.datetime :last_checkin_time
      t.string   :Version
      t.string   :Serial            # unique
      t.string   :Product
      t.string   :ProductName
      t.string   :PhoneNumber
      t.string   :DeviceName
      t.string   :OSVersion
      t.string   :BuildVersion
      t.string   :ModelName
      t.string   :Model
      t.string   :SerialNumber      # unique
      t.string   :DeviceCapacity
      t.string   :AvailableDeviceCapacity
      t.string   :IMEI              # unique
      t.string   :MEID              # unique
      t.string   :JailbreakDetected
      t.string   :ModemFirmwareVersion
      t.string   :Query
      t.string   :ICCID             # unique
      t.string   :BluetoothMAC
      t.string   :WiFiMAC
      t.string   :CurrentCarrierNetwork
      t.string   :SIMCarrierNetwork
      t.string   :CarrierSettingsVersion
      t.text     :ProfileList
      t.text     :ProvisioningProfileList
      t.text     :CertificateList
      t.text     :InstalledApplicationList
      t.text     :GlobalRestrictions
      t.text     :ProfileRestrictions
      t.text     :SecurityInfo
    end
    execute "ALTER TABLE devices ADD UNIQUE (udid);"
    execute "ALTER TABLE devices ADD UNIQUE (identifier);"
    execute "ALTER TABLE devices ADD UNIQUE (guid);"
    execute "ALTER TABLE devices ADD UNIQUE (\"Serial\");"
    execute "ALTER TABLE devices ADD UNIQUE (\"SerialNumber\");"
    execute "ALTER TABLE devices ADD UNIQUE (\"IMEI\");"
    execute "ALTER TABLE devices ADD UNIQUE (\"MEID\");"
    execute "ALTER TABLE devices ADD UNIQUE (\"ICCID\");"
  end

  #-------------------------------------------------------------------------

end
