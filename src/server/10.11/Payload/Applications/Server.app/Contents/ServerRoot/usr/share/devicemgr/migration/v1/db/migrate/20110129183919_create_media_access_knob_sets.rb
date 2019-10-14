#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateMediaAccessKnobSets < ActiveRecord::Migration

  include KnobSetBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :media_access_knob_sets do |t|
      KnobSetBase.add_base_table_properties(t)
      
      t.boolean :cd_allow
      t.boolean :cd_auth
      
      t.boolean :dvd_allow
      t.boolean :dvd_auth
      
      t.boolean :recordable_allow
      t.boolean :recordable_auth
      
      t.boolean :harddisk_internal_allow
      t.boolean :harddisk_internal_auth
      t.boolean :harddisk_internal_read_only
      
      t.boolean :harddisk_external_allow
      t.boolean :harddisk_external_auth
      t.boolean :harddisk_external_read_only
      
      t.boolean :disk_image_allow
      t.boolean :disk_image_auth
      t.boolean :disk_image_read_only
      
      t.boolean :dvd_ram_allow
      t.boolean :dvd_ram_auth
      t.boolean :dvd_ram_read_only
      
      t.boolean :eject_at_logout
      
    end
  end

  #-------------------------------------------------------------------------

end
