#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class AppLockKnobSet < KnobSet
  
  @@payload_type          = "com.apple.app.lock"
  @@payload_subidentifier = "app_lock"
  @@is_unique             = true
  @@payload_name          = "Accessibility"

  #-------------------------------------------------------------------------

  def self.old_table_name
    return "app_lock_knob_sets"
  end

  #-------------------------------------------------------------------------  

  def localized_payload_display_name(short = false)
    return I18n.t("app_lock_display_name")
  end

  #-------------------------------------------------------------------------

end
