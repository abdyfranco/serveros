#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateIosApplications < ActiveRecord::Migration

  include MDMRecordBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :ios_applications do |t|
      MDMRecordBase.add_base_table_properties(t)
            
      t.string    :name
      t.string    :version
      t.string    :bundle_identifier
      t.text      :image
      t.integer   :manifest_id
      t.integer   :ipa_id
    end
    execute "ALTER TABLE ios_applications ADD UNIQUE (bundle_identifier);"
  end

  #-------------------------------------------------------------------------

end
