#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateDockKnobSets < ActiveRecord::Migration

  include KnobSetBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :dock_knob_sets do |t|
      
      KnobSetBase.add_base_table_properties(t)

      # t.text    :applications #array
      
      t.boolean :autohide 
      t.boolean :autohide_immutable #NOTE: underscore->dash
      t.boolean :contents_immutable 
      
      t.text    :dockItems #array
      
      t.integer :largesize 
      t.boolean :launchanim 
      t.boolean :launchanim_immutable 
      t.boolean :magnification 
      t.boolean :magnify_immutable 
      t.boolean :magsize_immutable 
      
      t.text    :MCXDockSpecialFolders #array
      
      t.boolean :show_process_indicators
      t.boolean :show_process_indicators_immutable
      t.boolean :minimize_to_application
      t.boolean :minimize_to_application_immutable
      
      t.string  :mineffect 
      t.boolean :mineffect_immutable 
      t.string  :orientation 
      t.boolean :position_immutable 
      t.integer :tilesize
      t.boolean :size_immutable
      t.boolean :static_only
    end
    
    create_table :dock_knob_sets_system_applications, :force => true, :id => false do |t|
      t.integer :dock_knob_set_id, :null => false
      t.integer :system_application_id, :null => false
    end
    
  end

  #-------------------------------------------------------------------------

end
