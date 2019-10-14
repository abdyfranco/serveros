#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateSystemApplications < ActiveRecord::Migration

  include MDMRecordBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :system_applications do |t|
      MDMRecordBase.add_base_table_properties(t)

      t.string  :identifier
      t.string  :path
      t.text    :icon
      t.string  :version
      t.string  :display_name
      t.text    :signature
      t.text    :subApps
      
    end
  end

  #-------------------------------------------------------------------------

end
