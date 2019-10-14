#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateUserGroups < ActiveRecord::Migration

  include MDMRecordBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :user_groups do |t|
      MDMRecordBase.add_base_table_properties(t)

      t.string  :guid
      t.boolean :deny_portal, :default => false
      t.boolean :deny_join,   :default => true
    end
    execute "ALTER TABLE user_groups ADD UNIQUE (guid);"
  end

  #-------------------------------------------------------------------------

end
