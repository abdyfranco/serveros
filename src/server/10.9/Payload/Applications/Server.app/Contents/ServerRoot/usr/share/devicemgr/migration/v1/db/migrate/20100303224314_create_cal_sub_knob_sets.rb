#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateCalSubKnobSets < ActiveRecord::Migration

  include KnobSetBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :cal_sub_knob_sets do |t|
      KnobSetBase.add_base_table_properties(t)

      t.string  :SubCalAccountDescription
      t.string  :SubCalAccountHostName
      t.string  :SubCalAccountUsername
      t.string  :SubCalAccountPassword
      t.boolean :SubCalAccountUseSSL
    end
  end

  #-------------------------------------------------------------------------

end
