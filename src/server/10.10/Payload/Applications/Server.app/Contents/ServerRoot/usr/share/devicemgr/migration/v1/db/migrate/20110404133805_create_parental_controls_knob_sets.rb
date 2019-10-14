#-------------------------------------------------------------------------
# Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CreateParentalControlsKnobSets < ActiveRecord::Migration

  include KnobSetBase

  #-------------------------------------------------------------------------

  def self.up
    create_table :parental_controls_knob_sets do |t|
      KnobSetBase.add_base_table_properties(t)
      
      t.text    :filterWhitelist        
      t.text    :filterBlacklist
      t.text    :siteWhitelist
      
      t.boolean :useContentFilter
      t.boolean :parentalControl
      t.boolean :restrictWeb
      t.boolean :whiteListEnabled
      t.boolean :familyControlsEnabled
      
      #Intermediaries
      t.boolean :enforceWeekdayTimeLimit
      t.integer :weekdayTimeLimit
      t.boolean :enforceWeekendTimeLimit
      t.integer :weekendTimeLimit
      
      t.boolean :cerfewWeekdayEnabled
      t.integer :cerfewWeekdayFromHour
      t.integer :cerfewWeekdayFromMinute
      t.number  :cerfewWeekdayFromAMPM
      
      t.integer :cerfewWeekdayToHour
      t.integer :cerfewWeekdayToMinute
      t.number  :cerfewWeekdayToAMPM
      
      t.boolean :cerfewWeekendEnabled
      t.integer :cerfewWeekendFromHour
      t.integer :cerfewWeekendFromMinute
      t.number  :cerfewWeekendFromAMPM
      
      t.integer :cerfewWeekendToHour
      t.integer :cerfewWeekendToMinute
      t.number  :cerfewWeekendToAMPM
      
    end
  end

  #-------------------------------------------------------------------------

end
