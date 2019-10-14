#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class LibraryItemMetadata < ActiveRecord::Base
#-------------------------------------------------------------------------

  has_one  :profile, :foreign_key => :library_item_id
  has_many :knob_sets, :foreign_key => :library_item_id

  #-------------------------------------------------------------------------

  def self.table_name;  return 'library_item_metadata'; end

  #-------------------------------------------------------------------------

  def get_attributes(extended = false);    return self.attributes;  end # get_attributes

  #-------------------------------------------------------------------------

  include MDMDynamicAttributes  # Must include before MDMRecordBase

#-------------------------------------------------------------------------
end # class LibraryItemMetadata
#-------------------------------------------------------------------------
