#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateLabSessions < ActiveRecord::Migration

	include MDMRecordBase

	#-------------------------------------------------------------------------

  def self.up
    create_table :lab_sessions do |t|
      MDMRecordBase.add_base_table_properties(t)

      t.string   :user_guid       # The user who is logged in at the device
      t.string   :device_udid     # The device the user is logged in at
      t.string   :od_user_guid    # The UUID of the user in OD (when the user_uuid represents a local UUID)
      t.string   :auth_token      # The authenticity token for the client
      t.string   :uuid            # A UUID for this record (needed for auth tracking)
      t.string   :token           # The push token
      t.string   :push_magic
      t.datetime :last_checkin_time
      t.datetime :last_profile_send_time
      t.boolean  :might_be_logged_in
      t.text     :ProfileList
    end
  end

end
