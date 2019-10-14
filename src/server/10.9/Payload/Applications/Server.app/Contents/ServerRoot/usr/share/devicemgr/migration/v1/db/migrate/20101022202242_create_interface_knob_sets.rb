#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateInterfaceKnobSets < ActiveRecord::Migration

  include KnobSetBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :interface_knob_sets do |t|
      KnobSetBase.add_base_table_properties(t)

      #Interface type
      t.string  :Interface
      
      #WiFi settings
      t.string  :SSID_STR
      t.boolean :HIDDEN_NETWORK
      t.string  :EncryptionType
      t.string  :Password
      
      #802.1x settings
      t.text    :SetupModes #Array of Loginwindow and/or System string(s)
      
      # t.string :AuthenticationMethod #System mode auth methods (don't know real keys for below)
      # t.string :PayloadCertificateUUID 
      # t.string :SystemUserName
      # t.string :SystemPassword
      # t.string :DirectoryDomain

      t.integer  :relationship_id
      t.text     :security_relationship_ids
    end
  end

  #-------------------------------------------------------------------------

end
