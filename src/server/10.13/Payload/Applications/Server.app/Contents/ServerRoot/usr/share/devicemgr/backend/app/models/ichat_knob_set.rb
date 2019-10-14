#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class IchatKnobSet < KnobSet
#-------------------------------------------------------------------------

  @@payload_type          = 'com.apple.jabber.account'
  @@payload_subidentifier = 'iChat'
  @@is_unique             = false
  @@payload_name          = 'iChat'

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    return I18n.t('ichat_display_name') if short

    case self.PayloadType
    when 'com.apple.jabber.account'
      name = 'jabber_display_name'
      desc = self.JabberAccountDescription
    when 'com.apple.AIM.account'
      name = 'aim_display_name'
      desc = self.AIMAccountDescription
    when 'com.apple.subnet.account'
      name = 'subnet_display_name'
      desc = self.SubNetAccountDescription
    else
      name = 'ichat_display_name'
      desc = nil
    end

    name = I18n.t(name)
    name = sprintf(I18n.t('profile_long_display_format'), name, desc) if desc
    return name
  end # localized_payload_display_name

  #-------------------------------------------------------------------------

  def payload_type; return (self.PayloadType || 'com.apple.jabber.account');  end

#-------------------------------------------------------------------------
end # class IchatKnobSet
#-------------------------------------------------------------------------
