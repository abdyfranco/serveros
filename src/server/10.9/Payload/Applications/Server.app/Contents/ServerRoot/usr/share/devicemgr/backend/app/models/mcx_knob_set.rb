#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class McxKnobSet < KnobSet

  @@payload_type = "com.apple.mcx"
  @@payload_subidentifier = "mcx"
  @@is_unique = false
  @@payload_name = "MCX"

  #-------------------------------------------------------------------------

  def self.old_table_name
    return "mcx_knob_sets"
  end

  #-------------------------------------------------------------------------
    
  def generate_mcx_settings
    mcx_settings = ""
    self.mcx_payload.each { |mcx_name, mcx_dict|
      mcx_dict.each { |when_applied, config_dict|
        if when_applied == "Set-Once"
          timestamp_dict = "<key>mcx_data_timestamp</key>\n                      <date>#{Time.now}</date>"
        else
          timestamp_dict = ""
          when_applied = "Set-Once" if when_applied == "Often"
        end
        mcx_plist = <<-PLIST
          <?xml version="1.0" encoding="UTF-8"?>
          <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
          <plist version="1.0">
          <dict>
            <key>mcx_application_data</key>
            <dict>
              <key>#{mcx_name}</key>
              <dict>
                <key>#{when_applied}</key>
                <array>
                  <dict>
                    #{timestamp_dict}
                    <key>mcx_preference_settings</key>
                    <dict>
                      #{config_dict}
                    </dict>
                  </dict>
                </array>
              </dict>
            </dict>
          </dict>
          </plist>
        PLIST
        mcx_settings += mcx_plist
      } # mcx_dict.each
    } # self.mcx_payload
    
    return mcx_settings
  end

  #-------------------------------------------------------------------------

  def modify_payload_hash(payload_hash)
    payload_hash["MCXSettings"] = BinaryData.new(Base64.encode64(self.generate_mcx_settings))
    return payload_hash
  end

  #-------------------------------------------------------------------------
  
end
