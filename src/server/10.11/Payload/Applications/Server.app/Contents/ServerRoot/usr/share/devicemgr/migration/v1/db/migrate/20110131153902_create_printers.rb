#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreatePrinters < ActiveRecord::Migration

  include MDMRecordBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :printers do |t|
      MDMRecordBase.add_base_table_properties(t)
      
      t.string  :identifier
      t.string  :DeviceURI
      t.string  :DisplayName
      t.string  :Location
      t.string  :Model
      t.string  :PPDURL
      t.boolean :PrinterLocked
      
    end
    
    create_table :printers_printing_knob_sets, :force => true, :id => false do |t|
      t.integer :printer_id, :null => false
      t.integer :printing_knob_set_id, :null => false
    end
    
  end

  #-------------------------------------------------------------------------

end
