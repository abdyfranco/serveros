#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateProfiles < ActiveRecord::Migration

  include MDMRecordBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :profiles do |t|
      MDMRecordBase.add_base_table_properties(t)

      t.string  :name
      t.text    :description
      t.string  :uuid
      t.string  :identifier
      t.integer :version
      t.boolean :is_a_la_carte
      t.boolean :is_from_servermgr
    end
  end

  #-------------------------------------------------------------------------

end
