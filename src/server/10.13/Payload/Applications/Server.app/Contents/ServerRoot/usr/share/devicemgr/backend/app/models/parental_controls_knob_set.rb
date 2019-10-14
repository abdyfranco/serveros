#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class ParentalControlsKnobSet < KnobSet
#-------------------------------------------------------------------------

  @@payload_type          = 'com.apple.familycontrols.contentfilter'
  @@payload_subidentifier = 'parentalcontrols'
  @@is_unique             = true
  @@payload_name          = 'Parental Controls'

  #-------------------------------------------------------------------------

  def self.dynamic_attributes_defaults
    return { self.to_s => { :cerfewWeekdayFromAMPM => 'pm',
                            :cerfewWeekdayToAMPM   => 'pm',
                            :cerfewWeekendFromAMPM => 'pm',
                            :cerfewWeekendToAMPM   => 'pm'} }
  end # self.dynamic_attributes_defaults

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false);  return I18n.t('parental_controls_display_name');  end

#-------------------------------------------------------------------------
end # class ParentalControlsKnobSet
#-------------------------------------------------------------------------

