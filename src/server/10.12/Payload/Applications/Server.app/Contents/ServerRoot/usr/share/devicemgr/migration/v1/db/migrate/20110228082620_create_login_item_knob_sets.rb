#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateLoginItemKnobSets < ActiveRecord::Migration

  include KnobSetBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :login_item_knob_sets do |t|
      KnobSetBase.add_base_table_properties(t)
            
      #com.apple.loginwindow
      t.boolean :LoginUserMayAddItems
      t.boolean :DisableLoginItemsSuppression
      
      t.text    :mounts
      t.text    :files
      t.text    :hiddenApplicationIds
      
    end
    
    create_table :login_item_knob_sets_system_applications, :force => true, :id => false do |t|
      t.integer :login_item_knob_set_id, :null => false
      t.integer :system_application_id, :null => false
    end
    
  end

  #-------------------------------------------------------------------------

end
