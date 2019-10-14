#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateIchatKnobSets < ActiveRecord::Migration

  include KnobSetBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :ichat_knob_sets do |t|
      KnobSetBase.add_base_table_properties(t)

      # t.text   :ManagedAccounts      
      t.string  :PayloadType
     
      t.string  :JabberAccountDescription
      t.string  :JabberHostName
      t.integer :JabberPort
      t.boolean :JabberUseSSL
      t.string  :JabberUserName
      t.string  :JabberPassword
      t.string  :JabberAuthentication
      
      t.string  :AIMAccountDescription
      t.string  :AIMHostName
      t.integer :AIMPort
      t.boolean :AIMUseSSL
      t.string  :AIMUserName
      t.string  :AIMPassword
      t.string  :AIMAuthentication
      
      t.string  :SubNetAccountDescription
      
    end
  end

  #-------------------------------------------------------------------------

end
