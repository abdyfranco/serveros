#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class SettingsAddIsOdCaRooted < ActiveRecord::Migration

  include MDMRecordBase

  #-------------------------------------------------------------------------

  def self.up
    remove_column :settings, :code_signing_cert_ref
    remove_column :settings, :code_signing_org
    add_column :settings, :signing_cert_path, :text
    add_column :settings, :signing_key_path, :text
    add_column :settings, :signing_chain_path, :text
    add_column :settings, :ssl_cert_path, :text
    add_column :settings, :ssl_key_path, :text
    add_column :settings, :ssl_chain_path, :text
    add_column :settings, :signing_org, :string
    add_column :settings, :ssl_cert_od_ca_rooted, :boolean      # Now means cert isn't trusted by clients by default (should be ssl_cert_is_trusted)
    add_column :settings, :signing_cert_od_ca_rooted, :boolean  # Now means cert isn't trusted by clients by default (should be signing_cert_is_trusted)
  end

  #-------------------------------------------------------------------------

end
