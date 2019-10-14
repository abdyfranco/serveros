#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateEnergySaverKnobSets < ActiveRecord::Migration

  include KnobSetBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :energy_saver_knob_sets do |t|
      KnobSetBase.add_base_table_properties(t)
      
      # output note:  _ -> .  __ -> -

      t.integer  :com_apple_EnergySaver_desktop_ACPower__ProfileNumber
      t.integer  :com_apple_EnergySaver_portable_ACPower__ProfileNumber
      t.integer  :com_apple_EnergySaver_portable_BatteryPower__ProfileNumber
      
      t.text    :com_apple_EnergySaver_desktop_ACPower        
      t.text    :com_apple_EnergySaver_portable_ACPower
      t.text    :com_apple_EnergySaver_portable_BatteryPower
      t.boolean :com_apple_EnergySaver__ShowMenuBarBattery
      t.text    :com_apple_EnergySaver_desktop_Schedule
      
    end
  end

  #-------------------------------------------------------------------------

end
