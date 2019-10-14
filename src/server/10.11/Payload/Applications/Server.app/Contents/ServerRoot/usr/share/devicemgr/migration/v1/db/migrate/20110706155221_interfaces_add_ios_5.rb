#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class InterfacesAddIos5 < ActiveRecord::Migration

  include MDMRecordBase

  #-------------------------------------------------------------------------

  def self.up
    add_column :interface_knob_sets, :AutoJoin, :boolean
    add_column :interface_knob_sets, :ProxyType, :string
    add_column :interface_knob_sets, :ProxyServer, :string
    add_column :interface_knob_sets, :ProxyServerPort, :integer
    add_column :interface_knob_sets, :ProxyUsername, :string
    add_column :interface_knob_sets, :ProxyPassword, :string
    add_column :interface_knob_sets, :ProxyPACURL, :string
  end

  #-------------------------------------------------------------------------

end
