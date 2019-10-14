#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class LdapKnobSet < KnobSet

  @@payload_type = "com.apple.ldap.account"
  @@payload_subidentifier = "ldap"
  @@is_unique = false
  @@payload_name = "LDAP"

  #-------------------------------------------------------------------------

  def self.old_table_name
    return "ldap_knob_sets"
  end

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    name = I18n.t("ldap_display_name")
    name = sprintf(I18n.t("profile_long_display_format"), name, self.LDAPAccountDescription) unless short
    return name
  end

  #-------------------------------------------------------------------------

  def generate_payload_hash(root_payload_identifier, profile_manager_ctx)
    payload_type = self.class.payload_type
    payload_hash = { "PayloadType"        => payload_type,
                     "PayloadVersion"     => 1,
                     "PayloadIdentifier"  => "#{root_payload_identifier}.#{self.payload_subidentifier}",
                     "PayloadEnabled"     => self.PayloadEnabled,
                     "PayloadUUID"        => self.settings_identifier,
                     "PayloadDisplayName" => self.localized_payload_display_name
                   }

    # Don't strip out the empty array here, we need it.
    self.attributes.each { |attribute, value| payload_hash[attribute] = value if !value.nil? && !payload_hash.include?(attribute) && !ProfileManager.ignore_keys.include?(attribute.to_s) }

    # don't include communication service rules for this payload
    payload_hash.delete('AudioCall')
    return payload_hash
  end

  #-------------------------------------------------------------------------

end
