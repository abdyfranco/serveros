#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class PasscodeKnobSet < KnobSet
  
  @@payload_type          = "com.apple.mobiledevice.passwordpolicy"
  @@payload_subidentifier = "passcodepolicy"
  @@is_unique             = true
  @@payload_name          = "Passcode"

  #-------------------------------------------------------------------------

  def self.old_table_name
    return "passcode_knob_sets"
  end

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    return I18n.t("passcode_display_name")
  end

  #-------------------------------------------------------------------------

end
