#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreatePrintingKnobSets < ActiveRecord::Migration

  include KnobSetBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :printing_knob_sets do |t|
      KnobSetBase.add_base_table_properties(t)
      
      t.text    :lockedPrinterIds
      t.integer :DefaultPrinter
      t.boolean :RequireAdminToAddPrinters
      t.boolean :AllowLocalPrinters
      t.boolean :RequireAdminToPrintLocally
      t.boolean :ShowOnlyManagedPrinters
      t.boolean :PrintFooter
      t.boolean :PrintMACAddress
      t.string  :FooterFontSize
      t.string  :FooterFontName
      
    end
    
  end

  #-------------------------------------------------------------------------

end
