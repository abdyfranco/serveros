#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class DockKnobSet < KnobSet

  @@payload_type          = "com.apple.dock"
  @@payload_subidentifier = "dock"
  @@is_unique             = true
  @@payload_name          = "Dock"

  #-------------------------------------------------------------------------

  def self.old_table_name
    return "dock_knob_sets"
  end

  #-------------------------------------------------------------------------

  def also_modifies
    return [:system_applications]
  end

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    return I18n.t("dock_display_name")
  end

  #-------------------------------------------------------------------------

  def generate_payload_hash(root_payload_identifier, profile_manager_ctx)
    payload_hash = { "PayloadType"        => @@payload_type,
                     "PayloadVersion"     => 1,
                     "PayloadIdentifier"  => "#{root_payload_identifier}.#{self.payload_subidentifier}",
                     "PayloadEnabled"     => self.PayloadEnabled,
                     "PayloadUUID"        => self.settings_identifier,
                     "PayloadDisplayName" => self.localized_payload_display_name
                   }

    self.attributes.each { |attribute, value|
      attr_str = attribute.to_s
      if ProfileManager.add?(value, attribute, payload_hash) && attr_str != "system_applications" && attr_str != "dockItems"
        # Alter keys to correct string representation
        payload_hash[attribute.gsub(/_/,'-')] = value
      end
    }

    payload_hash["static-apps"] = self.system_applications.collect { |application|
      tile_data = { "file-label" => Base64.decode64(application[:display_name]).force_encoding("UTF-8"),
                    "file-data"  => { "_CFURLString"     => application[:path],
                                      "_CFURLStringType" => 0 }
                  }
      { "mcx_typehint" => 1,
        "tile-type"    => "file-tile",
        "tile-data"    => tile_data
      }
    }

    payload_hash["static-others"] = self.dockItems.collect { |item|
      tile_data = { "file-label" => item["path"].chomp("/").split("/").last,
                    "file-data"  => { "_CFURLString"     => item["path"],
                                      "_CFURLStringType" => 0
                                    }
                  }
      tile_data["file-type"] = 2 if item["isDirectory"]
      { "mcx_typehint" => item["isDirectory"] ? 2 : 3,
        "tile-type"    => item["isDirectory"] ? "directory-tile" : "file-tile",
        "tile-data"    => tile_data
      }
    }

    return payload_hash
  end

  #-------------------------------------------------------------------------

end
