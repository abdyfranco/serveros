#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class ScepKnobSet < KnobSet
#-------------------------------------------------------------------------

  before_save :before_save_scep_knob_set

  @@payload_type          = 'com.apple.security.scep'
  @@payload_subidentifier = 'scep'
  @@is_unique             = false
  @@payload_name          = 'SCEP'

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    name = I18n.t('scep_display_name')
    name = sprintf(I18n.t('profile_long_display_format'), name, self.Name) unless short
    return name
  end # localized_payload_display_name

  #-------------------------------------------------------------------------

  def before_save_scep_knob_set
    self.CAFingerprint = BinaryData.new(self.CAFingerprint) if self.CAFingerprint && self.CAFingerprint.class == String
    return true
  end # before_save_scep_knob_set

#-------------------------------------------------------------------------
end # class ScepKnobSet
#-------------------------------------------------------------------------
