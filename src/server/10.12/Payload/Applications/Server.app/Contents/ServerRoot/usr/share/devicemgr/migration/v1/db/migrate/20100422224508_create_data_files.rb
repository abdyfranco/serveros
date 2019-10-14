#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateDataFiles < ActiveRecord::Migration

  include MDMRecordBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :data_files do |t|
      MDMRecordBase.add_base_table_properties(t)

      t.string  :name
      t.string  :original_name
      t.string  :path
      t.integer :owner_id
      t.string  :owner_class
      t.text    :metadata
    end
  end

  #-------------------------------------------------------------------------

end
