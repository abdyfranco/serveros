#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateSecurityKnobSets < ActiveRecord::Migration

  include KnobSetBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :security_knob_sets do |t|
      KnobSetBase.add_base_table_properties(t)

      t.string  :UserDefinedName
      t.string  :PayloadCertificateUUID
      t.text    :EAPClientConfiguration
      
      t.string  :AuthenticationMethod #System mode auth methods (don't know real keys for below)
      t.string  :DirectoryDomain
      
      t.integer :relationship_id
      t.text    :interface_relationship_ids
    end

    create_table :interface_knob_sets_security_knob_sets, :force => true, :id => false do |t|
      t.integer :interface_knob_set_id, :null => false
      t.integer :security_knob_set_id, :null => false
    end
  end

  #-------------------------------------------------------------------------

end
