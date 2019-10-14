#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class InterfacesAddSecurity < ActiveRecord::Migration

  include MDMRecordBase

  #-------------------------------------------------------------------------

  def self.up
    
    add_column    :interface_knob_sets, :PayloadCertificateUUID, :string
    add_column    :interface_knob_sets, :EAPClientConfiguration, :text
    add_column    :interface_knob_sets, :AuthenticationMethod, :string
    add_column    :interface_knob_sets, :DirectoryDomain, :string
    
    remove_column :interface_knob_sets, :relationship_id
    remove_column :interface_knob_sets, :security_relationship_ids
    
    drop_table    :security_knob_sets
    drop_table    :interface_knob_sets_security_knob_sets
    
  end

  #-------------------------------------------------------------------------

end
