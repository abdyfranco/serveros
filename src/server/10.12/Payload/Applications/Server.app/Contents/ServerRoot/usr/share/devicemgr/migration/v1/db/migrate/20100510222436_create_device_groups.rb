#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateDeviceGroups < ActiveRecord::Migration

  include MDMRecordBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :device_groups do |t|
      MDMRecordBase.add_base_table_properties(t)

      t.string :name
    end

    create_table :group_mappings, :force => true, :id => false do |t|
      t.integer :parent_id, :null => false
      t.integer :child_id, :null => false
    end

    create_table :device_groups_devices, :force => true, :id => false do |t|
      t.integer :device_group_id, :null => false
      t.integer :device_id, :null => false
    end
  end

  #-------------------------------------------------------------------------

end
