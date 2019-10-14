#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateMembersProfiles < ActiveRecord::Migration

  include MDMRecordBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :members_profiles do |t|
      MDMRecordBase.add_base_table_properties(t)

      t.references :member, :polymorphic => true
      t.references :profile
    end
    execute 'ALTER TABLE members_profiles ADD CONSTRAINT profile_member_unique UNIQUE (profile_id, member_type, member_id);'
    # add_index(:members_profiles, [:profile_id, :member_type, :member_id], :unique => true) # TODO: Figure out why we can't use a rails helper like this instead
  end

  #-------------------------------------------------------------------------

end
