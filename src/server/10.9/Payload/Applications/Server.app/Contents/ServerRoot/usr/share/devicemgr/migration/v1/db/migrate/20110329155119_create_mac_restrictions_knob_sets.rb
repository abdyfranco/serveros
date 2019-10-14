#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateMacRestrictionsKnobSets < ActiveRecord::Migration

  include KnobSetBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :mac_restrictions_knob_sets do |t|
      KnobSetBase.add_base_table_properties(t)
      
      # Media Access
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
      
      t.boolean :DisableAirDrop
      
      # Apps and Widgets
      t.text    :pathWhiteList
      t.text    :pathBlackList
      t.boolean :familyControlsEnabled
      t.boolean :whiteListEnabled
      
      # System Preferences
      t.text    :EnabledPreferencePanes
      t.boolean :RestrictPrefPanes

    end

    create_table :mac_restrictions_knob_sets_system_applications, :force => true, :id => false do |t|
      t.integer :mac_restrictions_knob_set_id, :null => false
      t.integer :system_application_id, :null => false
    end

    create_table :mac_restrictions_knob_sets_widgets, :force => true, :id => false do |t|
      t.integer :mac_restrictions_knob_set_id, :null => false
      t.integer :widget_id, :null => false
    end
  end

  #-------------------------------------------------------------------------

end
