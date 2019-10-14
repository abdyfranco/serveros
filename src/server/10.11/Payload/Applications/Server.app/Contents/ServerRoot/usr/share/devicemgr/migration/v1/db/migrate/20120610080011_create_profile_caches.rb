#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateProfileCaches < ActiveRecord::Migration

  include MDMRecordBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :profile_caches do |t|
      MDMRecordBase.add_base_table_properties(t)

      t.integer  :profile_id
      t.integer  :device_id
      t.boolean  :is_lab_session   # If true, device_id is really a lab_session
      t.datetime :profile_version  # Set to the "updated_at" value of the profile record
      t.text     :cached_data
    end
    execute 'ALTER TABLE profile_caches ADD CONSTRAINT profile_unique UNIQUE (profile_id, device_id, is_lab_session);'
  end

  #-------------------------------------------------------------------------

end
