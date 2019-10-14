#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class LdapKnobSet < KnobSet
#-------------------------------------------------------------------------

  @@payload_type          = 'com.apple.ldap.account'
  @@payload_subidentifier = 'ldap'
  @@is_unique             = false
  @@payload_name          = 'LDAP'

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    name = I18n.t('ldap_display_name')
    name = sprintf(I18n.t('profile_long_display_format'), name, self.LDAPAccountDescription) unless short
    return name
  end # localized_payload_display_name

#-------------------------------------------------------------------------
end # class LdapKnobSet
#-------------------------------------------------------------------------
