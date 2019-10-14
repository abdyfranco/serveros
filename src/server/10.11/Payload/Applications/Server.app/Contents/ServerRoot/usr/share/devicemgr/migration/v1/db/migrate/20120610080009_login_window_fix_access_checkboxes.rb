#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class LoginWindowFixAccessCheckboxes < ActiveRecord::Migration

  include MDMRecordBase

  #-------------------------------------------------------------------------

  def self.up
    rename_column :login_window_knob_sets, :alwaysShowWorkgroupDialog, :AlwaysShowWorkgroupDialog
    rename_column :login_window_knob_sets, :combineUserWorkgroups,     :CombineUserWorkgroups
    rename_column :login_window_knob_sets, :flattenUserWorkgroups,     :FlattenUserWorkgroups
    rename_column :login_window_knob_sets, :localUserLoginEnabled,     :LocalUserLoginEnabled
    rename_column :login_window_knob_sets, :localUsersHaveWorkgroups,  :LocalUsersHaveWorkgroups
  end

  #-------------------------------------------------------------------------

end
