#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class DeviceAddIos5 < ActiveRecord::Migration

  include MDMRecordBase

  #-------------------------------------------------------------------------

  def self.up
    add_column :devices, :BatteryLevel, :string
    add_column :devices, :mdm_acl,      :integer, :default => 2047 # Up until now all devices have been bound using this mdm_acl. Going forward this may no longer be true
    add_column :devices, :OSBuildVersion, :string
  end

  #-------------------------------------------------------------------------

end