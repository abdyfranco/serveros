#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class AddIos6Features < ActiveRecord::Migration

  include KnobSetBase

  #-------------------------------------------------------------------------

  def self.up

    # Automatic Profile Removal
    add_column :general_knob_sets, :durationUntilRemoval, :float
    add_column :general_knob_sets, :removalDate,          :datetime

    # New Restrictions settings
    add_column :restrictions_knob_sets, :allowBookstore,                          :boolean, :default => true
    add_column :restrictions_knob_sets, :allowBookstoreErotica,                   :boolean, :default => true
    add_column :restrictions_knob_sets, :allowSharedStream,                       :boolean, :default => true
    add_column :restrictions_knob_sets, :allowPassbookWhileLocked,                :boolean, :default => true
    add_column :restrictions_knob_sets, :allowGameCenter,                         :boolean, :default => true
    add_column :restrictions_knob_sets, :allowUIConfigurationProfileInstallation, :boolean, :default => true
    add_column :restrictions_knob_sets, :allowChat,                               :boolean, :default => true

    # New Email and EAS settings
    add_column :email_knob_sets,    :disableMailRecentsSyncing, :boolean, :default => false
    add_column :exchange_knob_sets, :disableMailRecentsSyncing, :boolean, :default => false

    # Consent Text
    add_column :general_knob_sets, :consentText, :text  # Text, server will wrap it in necessary goo
    
    # Global HTTP proxy
    create_table :global_http_proxy_knob_sets do |t|
      KnobSetBase.add_base_table_properties(t)
      t.string  :ProxyType
      t.string  :ProxyServer
      t.integer :ProxyServerPort
      t.string  :ProxyUsername
      t.string  :ProxyPassword
      t.string  :ProxyPACURL
    end

    # App Lock
    create_table :app_lock_knob_sets do |t|
      KnobSetBase.add_base_table_properties(t)
      t.string  :bundle_identifier
    end

  end

  #-------------------------------------------------------------------------

end
