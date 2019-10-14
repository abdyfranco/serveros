#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class AirplayKnobSet < KnobSet

  @@payload_type          = 'com.apple.airplay'
  @@payload_subidentifier = "airplay"
  @@is_unique             = true
  @@payload_name          = "AirPlay"
  
  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    return I18n.t("airplay_display_name")
  end

  #-------------------------------------------------------------------------

  def generate_payload_hash(root_payload_identifier, profile_manager_ctx)
    
    payload_hash = { "PayloadType"        => @@payload_type,
                     "PayloadVersion"     => 1,
                     "PayloadIdentifier"  => "#{root_payload_identifier}.#{self.payload_subidentifier}",
                     "PayloadEnabled"     => self.PayloadEnabled,
                     "PayloadUUID"        => self.PayloadUUID,
                     "PayloadDisplayName" => self.localized_payload_display_name
                   }
    
    if (self.attributes["internal_use_restrict_airplay"]) 
      payload_hash["Whitelist"] = self.devices.collect{ | item | 
        { "DeviceID" => item.DeviceID }
      }
    end

    payload_hash["Passwords"] = self.attributes["internal_use_password_device_ids"].collect { | item | 
      device = Device.find(item)
      { "DeviceName" => device.DeviceName, "Password" => device.airplay_password }
    }
    
    return payload_hash
  end
  
  #-------------------------------------------------------------------------

  def also_modifies
    return [:devices]
  end

end
