#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class FinderKnobSet < KnobSet

  @@payload_type          = 'com.apple.finder'
  @@payload_subidentifier = "finder"
  @@is_unique             = true
  @@payload_name          = "Finder Preferences"
  @@payload_type_attributes = {
    'com.apple.finder'      => [:InterfaceLevel, :ShowHardDrivesOnDesktop, :ShowExternalHardDrivesOnDesktop, :ShowRemovableMediaOnDesktop, :ShowMountedServersOnDesktop, :WarnOnEmptyTrash, :ProhibitConnectTo, :ProhibitEject, :ProhibitBurn, :ProhibitGoToFolder],
    'com.apple.loginwindow' => [:RestartDisabledWhileLoggedIn, :ShutDownDisabledWhileLoggedIn],
  }

  #-------------------------------------------------------------------------

  def self.old_table_name
    return "finder_knob_sets"
  end

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    return I18n.t("finder_display_name")
  end

  #-------------------------------------------------------------------------

  def generate_payload_hash(root_payload_identifier, profile_manager_ctx)
    payload_array = [];
    @@payload_type_attributes.each_pair { |payload_type, keys|

      newUUID = Digest::MD5.hexdigest(self.settings_identifier.to_s + payload_type.to_s)
      [8,13,18,23].each { |x| newUUID.insert(x,'-') }
      last_element = payload_type.split('.').last

      payload_hash = { "PayloadType"        => payload_type,
                       "PayloadVersion"     => 1,
                       "PayloadIdentifier"  => "#{root_payload_identifier}.#{self.payload_subidentifier}.#{last_element}",
                       "PayloadEnabled"     => self.PayloadEnabled,
                       "PayloadUUID"        => newUUID,
                       "PayloadDisplayName" => self.localized_payload_display_name
                     }
      keys.each { |attribute|
        value = self[attribute]
        payload_hash[attribute.to_s] = value if ProfileManager.add?(value, attribute)
      }

      payload_array.push(payload_hash)
    }

    return payload_array
  end

  #-------------------------------------------------------------------------

end
