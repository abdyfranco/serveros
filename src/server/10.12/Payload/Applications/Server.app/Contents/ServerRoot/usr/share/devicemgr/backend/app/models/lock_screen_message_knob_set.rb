#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class LockScreenMessageKnobSet < KnobSet
#-------------------------------------------------------------------------

  @@payload_type          = 'com.apple.shareddeviceconfiguration'
  @@payload_subidentifier = 'lock-screen-message'
  @@is_unique             = true
  @@payload_name          = 'Lock Screen Message Settings'

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false);  return I18n.t('lock_screen_message_display_name');  end

#-------------------------------------------------------------------------
end # LockScreenMessageKnobSet
#-------------------------------------------------------------------------
