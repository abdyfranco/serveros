#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class ObscureIpas < ActiveRecord::Migration

  include MDMRecordBase

  #-------------------------------------------------------------------------

  def self.up
    add_column  :ios_applications, :uuid, :string

    remove_column :data_files,       :path
    remove_column :ios_applications, :manifest_id

    IosApplication.reset_column_information
    DataFile.reset_column_information
    
    # Loop through all the existing iOS Application rows and assign them uuids
    gen = UUID.new
    IosApplication.all.each { |a|
      a.uuid = gen.generate
      a.save
    }
    execute "ALTER TABLE ios_applications ALTER COLUMN uuid SET NOT NULL"
    execute "ALTER TABLE ios_applications ADD UNIQUE (uuid)"
  end

  #-------------------------------------------------------------------------

end
