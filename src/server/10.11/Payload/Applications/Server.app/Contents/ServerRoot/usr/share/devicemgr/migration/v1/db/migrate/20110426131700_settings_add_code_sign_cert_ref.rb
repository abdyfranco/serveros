#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class SettingsAddCodeSignCertRef < ActiveRecord::Migration

  include MDMRecordBase

  #-------------------------------------------------------------------------

  def self.up
    add_column :settings, :use_code_signing, :boolean
  	add_column :settings, :code_signing_cert_ref, :text
  	add_column :settings, :code_signing_org, :string
  end

  #-------------------------------------------------------------------------

end
