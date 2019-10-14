#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateSettings < ActiveRecord::Migration

  include MDMRecordBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :settings do |t|
      MDMRecordBase.add_base_table_properties(t)

      t.integer :mdm_acl, :nil => false, :default => 2047
      t.boolean :ssl_active, :nil => false, :default => false
      
      t.boolean :od_active, :nil => false, :default => false
      t.string  :od_master, :default => "127.0.0.1"
      
      t.boolean :apns_active, :nil => false, :default => false
      t.string  :apns_topic
      
      t.integer :user_timeout, :nil => false, :default => 43200

      t.string  :server_organization
      
      t.string  :email_delivery_method
      t.string  :email_address
      t.string  :email_server_address
      t.integer :email_port, :default => 25
      t.string  :email_domain
      t.string  :email_authentication
      t.string  :email_username
      t.string  :email_password

      t.boolean :default_profile_created_at_least_once, :default => false
      t.boolean :default_profile_enabled, :nil => false, :default => true
      t.string  :knob_sets_enabled
    end
  end

  #-------------------------------------------------------------------------

end
