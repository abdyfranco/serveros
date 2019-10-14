#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateCalDavKnobSets < ActiveRecord::Migration

  include KnobSetBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :cal_dav_knob_sets do |t|
      KnobSetBase.add_base_table_properties(t)

      t.string  :CalDAVAccountDescription
      t.string  :CalDAVHostName
      t.string  :CalDAVUsername
      t.string  :CalDAVPassword
      t.boolean :CalDAVUseSSL
      t.integer :CalDAVPort
      t.string  :CalDAVPrincipalURL
    end
  end

  #-------------------------------------------------------------------------

end
