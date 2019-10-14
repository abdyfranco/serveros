#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class GoogleAccountKnobSet < KnobSet
#-------------------------------------------------------------------------

  @@payload_type          = 'com.apple.google-oauth'
  @@payload_subidentifier = 'google-account'
  @@is_unique             = false
  @@payload_name          = 'Google Account'

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false);  return I18n.t('google_account_display_name'); end

#-------------------------------------------------------------------------
end # class GoogleAccountKnobSet
#-------------------------------------------------------------------------
