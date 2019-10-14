#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class ScepKnobSet < KnobSet

  before_save :before_save_scep_knob_set
  
  @@payload_type          = "com.apple.security.scep"
  @@payload_subidentifier = "scep"
  @@is_unique             = true
  @@payload_name          = "SCEP"

  #-------------------------------------------------------------------------

  def self.old_table_name
    return "scep_knob_sets"
  end

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    name = I18n.t("scep_display_name")
    name = sprintf(I18n.t("profile_long_display_format"), name, self.Name) unless short
    return name
  end

  #-------------------------------------------------------------------------

  def before_save_scep_knob_set
    self.CAFingerprint = BinaryData.new(self.CAFingerprint) if self.CAFingerprint && self.CAFingerprint.class == String
    return true
  end

  #-------------------------------------------------------------------------

  # This should happen for exports, so I won't have to change the data structure
  def generate_payload_hash(root_payload_identifier, profile_manager_ctx)
    payload_type = self.class.payload_type

    payload_hash = { "PayloadType"        => payload_type,
                     "PayloadVersion"     => 1,
                     "PayloadIdentifier"  => "#{root_payload_identifier}.#{self.payload_subidentifier}",
                     "PayloadEnabled"     => self.PayloadEnabled,
                     "PayloadDescription" => "Configures SCEP",
                     "PayloadUUID"        => self.PayloadUUID,
                     "PayloadDisplayName" => self.localized_payload_display_name,
                     "PayloadContent"     => { "Subject"        => self.Subject,
                                               "SubjectAltName" => self.SubjectAltName,
                                               "Name"           => self.Name,
                                               "Keysize"        => self.Keysize,
                                               "Challenge"      => self.Challenge,
                                               "URL"            => self.URL,
                                               "Key Usage"      => self.Key_Usage,
                                               "Key Type"       => self.Key_Type,
                                               "Retries"        => self.Retries,
                                               "RetryDelay"     => self.RetryDelay
                                              }
                   }
                                      
    if self.CAFingerprint   # This one is special, export as a string representing hex values into base64 data
      dataLen = (self.CAFingerprint.length / 2.0).ceil
      splitData = self.CAFingerprint.unpack((1..dataLen).map{'a2'}.join)
      valueString = splitData.pack((1..dataLen).map{'H2'}.join)
      payload_hash["PayloadContent"]["CAFingerprint"] = BinaryData.new(Base64.encode64(valueString))
    end
                         
    return payload_hash
  end

  #-------------------------------------------------------------------------

end
