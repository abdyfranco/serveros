#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class LabSessionAddPendingOdUserGuid < ActiveRecord::Migration

	include MDMRecordBase

  #-------------------------------------------------------------------------

  def self.up
  	add_column :lab_sessions, :pending_od_user_guid, :string
  end

  #-------------------------------------------------------------------------

end
