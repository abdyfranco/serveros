#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateIosApplicationLibraryItemRelations < ActiveRecord::Migration

  include MDMRecordBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :ios_application_library_item_relations do |t|
      MDMRecordBase.add_base_table_properties(t)
            
      t.integer   :ios_application_id
      t.integer   :library_item_id
      t.string    :library_item_class
      t.boolean   :is_enforced
      t.boolean   :is_active
    end
    execute 'ALTER TABLE ios_application_library_item_relations ADD CONSTRAINT ios_application_library_item_relation_unique UNIQUE (ios_application_id, library_item_id, library_item_class);'
  end

  #-------------------------------------------------------------------------

end
