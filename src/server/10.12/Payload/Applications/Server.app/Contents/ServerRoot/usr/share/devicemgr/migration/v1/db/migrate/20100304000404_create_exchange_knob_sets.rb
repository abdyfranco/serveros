#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateExchangeKnobSets < ActiveRecord::Migration

  include KnobSetBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :exchange_knob_sets do |t|
      KnobSetBase.add_base_table_properties(t)

      t.string  :payload_type, :default => "com.apple.eas.account"
      
      t.string  :EmailAddress
      t.string  :Host
      t.boolean :SSL
      t.string  :UserName
      t.string  :Password
      t.text    :Certificate
      t.string  :CertificateName
      t.string  :CertificatePassword
      t.integer :MailNumberOfPastDaysToSync

      t.string  :Path
      t.integer :Port
      t.string  :ExternalHost
      t.boolean :ExternalSSL
      t.string  :ExternalPath
      t.integer :ExternalPort
    end
  end

  #-------------------------------------------------------------------------

end
