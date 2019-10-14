#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class CalDavKnobSet < KnobSet

  @@payload_type          = "com.apple.caldav.account"
  @@payload_subidentifier = "caldav"
  @@is_unique             = false
  @@payload_name          = "CalDAV"

  #-------------------------------------------------------------------------

  def self.old_table_name
    return "cal_dav_knob_sets"
  end

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    name = I18n.t("cal_dav_display_name")
    name = sprintf(I18n.t("profile_long_display_format"), name, self.CalDAVAccountDescription) unless short
    return name
  end

  #-------------------------------------------------------------------------

end
