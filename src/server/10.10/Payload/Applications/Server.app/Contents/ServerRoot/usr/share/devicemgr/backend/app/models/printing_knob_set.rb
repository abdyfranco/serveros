#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class PrintingKnobSet < KnobSet

  @@payload_type          = "com.apple.mcxprinting"
  @@payload_subidentifier = "printing"
  @@is_unique             = true
  @@payload_name          = "Printing"

  #-------------------------------------------------------------------------

  def self.old_table_name
    return "printing_knob_sets"
  end

  #-------------------------------------------------------------------------

  def also_modifies
    return [:printers]
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
    
    self.attributes.each { |attribute, value| payload_hash[attribute] = value if ProfileManager.add?(value, attribute, payload_hash) && attribute.to_s != "lockedPrinterIds" }

    payload_hash["DefaultPrinter"] = ""

    # Include printer objects
    printer_hash = {}
    locked_printers = self.lockedPrinterIds || []
    self.printers.each { |p|
      next unless p.identifier

      inner_hash = { "DeviceURI"      => p[:DeviceURI]   || '',
                     "DisplayName"    => p[:DisplayName] || '',
                     "Location"       => p[:Location]    || '',
                     "Model"          => p[:Model]       || '',
                     "PrinterLocked"  => locked_printers.include?(p[:id]),
                     "PPDURL"         => "file://localhost/System/Library/Frameworks/ApplicationServices.framework/Versions/A/Frameworks/PrintCore.framework/Resources/Generic.ppd"  # TODO: where does this come from?
                    }

      payload_hash["DefaultPrinter"] = { "DeviceURI" => p[:DeviceURI], "DisplayName" => p[:DisplayName] } if p[:id] == self.DefaultPrinter
      printer_hash[p.identifier.to_s] = inner_hash
    }
    payload_hash["UserPrinterList"] = printer_hash

    return payload_hash
  end
  
  #-------------------------------------------------------------------------
  
  def localized_payload_display_name(short = false)
    return I18n.t("printing_display_name")
  end

  #-------------------------------------------------------------------------

end

