#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class TvosConferenceRoomDisplayKnobSet < KnobSet
#-------------------------------------------------------------------------

  @@payload_type          = 'com.apple.conferenceroomdisplay'
  @@payload_subidentifier = 'conferenceroomdisplay'
  @@is_unique             = true
  @@payload_name          = 'Conference Room Display'

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false);  return I18n.t('conference_room_display_display_name'); end

  #-------------------------------------------------------------------------

  def modify_payload_hash(payload_hash)
    return { 'tv' => payload_hash }
  end # modify_payload_hash

  #-------------------------------------------------------------------------

#-------------------------------------------------------------------------
end
#-------------------------------------------------------------------------