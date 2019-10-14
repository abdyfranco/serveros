#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateApplicationsKnobSets < ActiveRecord::Migration

  include KnobSetBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :applications_knob_sets do |t|
      KnobSetBase.add_base_table_properties(t)
      
      t.text    :pathWhiteList
      t.text    :pathBlackList
      t.boolean :familyControlsEnabled
      t.boolean :whiteListEnabled
      
    end
    
    create_table :applications_knob_sets_system_applications, :force => true, :id => false do |t|
      t.integer :applications_knob_set_id, :null => false
      t.integer :system_application_id, :null => false
    end
    
    create_table :applications_knob_sets_widgets, :force => true, :id => false do |t|
      t.integer :applications_knob_set_id, :null => false
      t.integer :widget_id, :null => false
    end
  end

  #-------------------------------------------------------------------------

end
