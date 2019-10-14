#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateEmailKnobSets < ActiveRecord::Migration

  include KnobSetBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :email_knob_sets do |t|
      KnobSetBase.add_base_table_properties(t)

      t.string  :EmailAccountDescription
      t.string  :EmailAccountName
      t.string  :EmailAccountType
      t.string  :EmailAddress
      t.string  :EmailDomain
      t.string  :IncomingMailServerAuthentication
      t.string  :IncomingMailServerHostName
      t.integer :IncomingMailServerPortNumber
      t.boolean :IncomingMailServerUseSSL
      t.string  :IncomingMailServerUsername
      t.string  :IncomingPassword
      t.string  :OutgoingMailServerAuthentication
      t.string  :OutgoingMailServerHostName
      t.integer :OutgoingMailServerPortNumber
      t.boolean :OutgoingMailServerUseSSL
      t.string  :OutgoingMailServerUsername
      t.string  :OutgoingPassword
      t.boolean :OutgoingPasswordSameAsIncomingPassword
      t.string  :IncomingMailServerIMAPPathPrefix
    end
  end

  #-------------------------------------------------------------------------

end
