#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

require 'cfpropertylist'
require 'base64'
require 'timeout'

ServerCapabilities = ["com.apple.mdm.per-user-connections"];

class ProfileManager
  
  # Payload types that can have multiple payloads within a profile. All other payloads should have only one payload hash.
  # This is a list that has to be updated as we add new payload type domains.
  REPEATABLE_PAYLOAD_TYPES = [
      'com.apple.MCX.FileVault2',
      'com.apple.mobiledevice.passwordpolicy',
      'com.apple.ADCertificate.managed',
      'com.apple.DirectoryService.managed',
      'com.apple.ldap.account',
      'com.apple.wifi.managed',
      'com.apple.builtinwireless.managed',
      'com.apple.firstactiveethernet.managed',
      'com.apple.secondactiveethernet.managed',
      'com.apple.firstethernet.managed',
      'com.apple.secondethernet.managed',
      'com.apple.vpn.managed',
      'com.apple.jabber.account',
      'com.apple.AIM.account',
      'com.apple.subnet.account',
      'com.apple.gmail.account',
      'com.apple.caldav.account',
      'com.apple.mail.managed',
      'com.apple.webClip.managed',
      'com.apple.carddav.account',
      'com.apple.configurationprofile.identification',
      'com.apple.ews.account',
      'com.apple.eas.account',
      'com.apple.security.pkcs12',
      'com.apple.security.pkcs1',
      'com.apple.security.root',
      'com.apple.security.pem',
      'com.apple.security.scep',
      'com.apple.mdm',
      'com.apple.ManagedClient.preferences',
      'com.apple.subscribedcalendar.account',
      'com.apple.font'
  ]
  
  @@ignore_keys = ["knobset_attributes", "id", "created_at", "updated_at", "is_from_servermgr", "admin_temp_id", "temporary_id", "admin_session", "security_relationship_ids", "interface_relationship_ids", "profile_id", "class_name"]
  attr_reader :target, :device, :user

  #-------------------------------------------------------------------------

  def self.add?(value, attribute, payload_hash = nil)
    return false if value.nil? || ((value.class == Hash || value.class == Array) && value.empty?)
    attr_str = attribute.to_s
    return false if attr_str.start_with?("internal_use_flag") || @@ignore_keys.include?(attr_str)
    return false if payload_hash && (payload_hash.include?(attribute) || payload_hash.include?(attr_str))
    return true
  end

  #-------------------------------------------------------------------------

  def self.ignore_keys
    return @@ignore_keys
  end

  #-------------------------------------------------------------------------

  def self.encoded_identity_cert
    return Base64.encode64(File.read("#{File.dirname(__FILE__)}/profile_manager/client.p12"))
  end
  
  #-------------------------------------------------------------------------

  def self.sign_data(data)
    cur_settings = Settings.get_settings
    unless cur_settings.use_code_signing && cur_settings.signing_cert_path && cur_settings.signing_cert_path.length > 0 && cur_settings.signing_key_path && cur_settings.signing_key_path.length > 0
      Rails.logger.warn("ProfileManager::sign_data: No signing certificate specified, unable to sign.")
      return data
    end

    if MDMLogger.debugOutput?
      signed_data = ""  # So the assignment to signed_data in the block below escapes the closure
      ms = [Benchmark.ms { signed_data = ScepHelper::get_cms_signed_data(cur_settings.signing_cert_path, cur_settings.signing_key_path, data) }, 0.01].max
      Rails.logger.info("ProfileManager.sign_data completed in #{ms} ms")
    else
      signed_data = ScepHelper::get_cms_signed_data(cur_settings.signing_cert_path, cur_settings.signing_key_path, data)
    end

    unless signed_data && signed_data.length > 0
      Rails.logger.warn("Signing failed, exporting a raw profile file instead.")
      return data
    end

    return signed_data
  end

  #-------------------------------------------------------------------------

  def self.generate_auto_join_ota_bootstrap_profile(name, challenge)
    uuid = UUID.new

    cur_settings = Settings.get_settings
    ota_bootstrap_url = URI.join("#{cur_settings.url_base}","devicemanagement/api/device/auto_join_ota_service").to_s

    profile_hash = {"PayloadDisplayName"       => name,
                    "PayloadIdentifier"        => "com.apple.ota.#{cur_settings.gethostname}.bootstrap",
                    "PayloadRemovalDisallowed" => false,
                    "PayloadType"              => "Configuration",
                    "PayloadUUID"              => uuid.generate,
                    "PayloadVersion"           => 1,
                    "PayloadOrganization"      => cur_settings.server_organization,
                    "PayloadDescription"       => I18n.t("auto_join_description"),
                    "PayloadType"              => "Profile Service",
                    "PayloadContent"           => {"URL"              => ota_bootstrap_url,
                                                   "DeviceAttributes" => ["DEVICE_NAME", "UDID", "IMEI", "MEID", "DeviceID", "SERIAL", "VERSION", "PRODUCT", "COMPROMISED"],
                                                   "Challenge"        => challenge
                                                  },
                    "ConfirmInstallation"      => true,
                   }

    profile = profile_hash.to_plist
    Rails.logger.info("auto_join_ota_bootstrap_profile = #{profile}") if MDMLogger.debugOutput?
    return self.sign_data(profile);
  end

  #-------------------------------------------------------------------------

  def self.generate_trust_profile
    cur_settings = Settings.get_settings
    fetch = []
    fetch.push(cur_settings.signing_cert_path) if cur_settings.signing_cert_path && !cur_settings.signing_cert_is_trusted
    fetch.push(cur_settings.ssl_cert_path)     if cur_settings.ssl_cert_path     && !cur_settings.ssl_cert_is_trusted
    return nil unless fetch.count > 0

    # certificates = ScepHelper::get_untrusted_root_certificates(fetch).uniq
    organization = cur_settings.server_organization
    payloads     = cur_settings.trust_payloads
    return nil unless payloads && payloads.length > 0

    content = []
    payloads.each_value { |pl|
      pl['PayloadOrganization'] = organization
      pl['PayloadDescription']  = sprintf(I18n.t("trust_payload_description"),  organization)
      pl['PayloadDisplayName']  = sprintf(I18n.t("trust_payload_display_name"), organization)
      pl['PayloadContent']      = BinaryData.new(pl['PayloadContent'])
      content.push(pl)
    }

    # certificates.each { |cert|
    #   cert.gsub!(/^-.*-$/, "") # Strip off the "-----BEGIN/END CERTIFICATE-----" stuff
    #   content.push({"PayloadVersion"     => 1,
    #                "PayloadOrganization" => organization,
    #                "PayloadIdentifier"   => "com.apple.ssl.certificate",
    #                "PayloadDescription"  => sprintf(I18n.t("trust_payload_description"), organization),
    #                "PayloadType"         => "com.apple.security.root",
    #                "PayloadUUID"         => UUID.new.generate,
    #                "PayloadDisplayName"  => sprintf(I18n.t("trust_payload_display_name"), organization),
    #                "PayloadContent"      => BinaryData.new(cert),
    #               })
    # }

    return nil if content.length == 0

    profile_hash = {"PayloadVersion"     => 1,
                    "PayloadContent"     => content,
                    "PayloadIdentifier"  => "com.apple.config.#{cur_settings.gethostname}.ssl",
                    "PayloadDescription" => sprintf(I18n.t("trust_profile_description"), organization),
                    "PayloadScope"       => "System",
                    "PayloadType"        => "Configuration",
                    "PayloadUUID"        => UUID.new.generate,
                    "PayloadDisplayName" => sprintf(I18n.t("trust_profile_display_name"), organization)
                   }
    
    profile = profile_hash.to_plist
    Rails.logger.info("trust_profile = #{profile}") if MDMLogger.debugOutput?
    return self.sign_data(profile);
  end

  #-------------------------------------------------------------------------

  def self.generate_scep_profile(device)
    uuid = UUID.new

    cur_settings = Settings.get_settings
    od_master = cur_settings.od_master
    scep_host = (od_master == "127.0.0.1" ? cur_settings.gethostname : od_master)

    root_cert = scep_challenge = nil
    raw_root_cert  = ScepHelper::get_scep_root_certificate(od_master)
    scep_url       = ScepHelper::get_scep_url(scep_host)
    if MDMLogger.debugOutput?
      ms = [Benchmark.ms { scep_challenge = ScepHelper::get_challenge_for_udid(device.udid, od_master) }, 0.01].max
      Rails.logger.info("generate_scep_profile: get_challenge_for_udid completed in #{ms} ms")
    else
      scep_challenge = ScepHelper::get_challenge_for_udid(device.udid, od_master)
    end

    unless raw_root_cert && raw_root_cert != ""
      Rails.logger.error("Could not retrieve root certificate from open directory server.")
      return nil
    end

    root_cert      = OpenSSL::X509::Certificate.new(raw_root_cert)
    fingerprint    = Base64.encode64(SHA1.hexdigest(root_cert.to_der).to_a.pack("H*"))
    scep_uuid      = uuid.generate
    organization   = cur_settings.server_organization
    profile_hash   = {"PayloadVersion"      => 1,
                      "PayloadOrganization" => organization,
                      "PayloadContent"      => [{"PayloadVersion"      => 1,
                                                 "PayloadOrganization" => organization,
                                                 "PayloadContent"      => {"Subject"      => [[["CN", "Device Management Identity Certificate"]]],
                                                                          "Name"          => "Device Management Identity Certificate",
                                                                          "Keysize"       => 1024,
                                                                          "Challenge"     => scep_challenge,
                                                                          "CAFingerprint" => BinaryData.new(fingerprint),
                                                                          "URL"           => scep_url,
                                                                          "Key Usage"     => 0,
                                                                          "Key Type"      => "RSA"
                                                                         },
                                                 "PayloadIdentifier"  => "com.apple.mdmconfig.SCEP",
                                                 "PayloadDescription" => I18n.t("scep_payload_description"),
                                                 "PayloadType"        => "com.apple.security.scep",
                                                 "PayloadUUID"        => scep_uuid,
                                                 "PayloadDisplayName" => I18n.t("scep_payload_display_name")
                                                }],
                      "PayloadIdentifier"        => "com.apple.#{cur_settings.gethostname}.scepconfig",
                      "PayloadDescription"       => I18n.t("scep_profile_description"),
                      "PayloadRemovalDisallowed" => false,
                      "PayloadType"              => "Configuration",
                      "PayloadUUID"              => uuid.generate,
                      "PayloadDisplayName"       => I18n.t("scep_profile_display_name")
                     }

    profile = profile_hash.to_plist
    Rails.logger.info("scep_profile = #{profile}") if MDMLogger.debugOutput?
    return self.sign_data(profile);
  end
 
  #-------------------------------------------------------------------------

  def self.generate_profile(target, device=nil, manual_download = false)
    pm = ProfileManager.new(target, device, nil, manual_download)
    return pm.generate_profile
  end

  #-------------------------------------------------------------------------

  def self.generate_raw_profile(target, device=nil, manual_download = false)
    profile_hash = self.generate_profile(target, device, manual_download)
    return nil unless profile_hash
    
    profile_plist = profile_hash.to_plist
    Rails.logger.info("RawProfile: \n#{profile_plist}") if MDMLogger.debugOutput?
    return profile_plist
  end
  
  #-------------------------------------------------------------------------

  def self.generate_signed_profile2(target, device=nil, user=nil, manual_download = false)
    pm = ProfileManager.new(target, device, user, manual_download)
    profile_hash = pm.generate_profile
    return nil, false unless profile_hash

    profile_plist = profile_hash.to_plist
    return self.sign_data(profile_plist), (pm.device_substitution_keys | pm.user_substitution_keys)
  end

  #-------------------------------------------------------------------------

  def self.generate_signed_profile(target, device=nil, user=nil, manual_download = false)
    return self.generate_signed_profile2(target, device, user, manual_download)[0]
  end
  
  #-------------------------------------------------------------------------

  def initialize(target, device=nil, user=nil, manual_download = false)
    @target          = target
    @device          = device
    @user            = user
    @manual_download = manual_download
    @device_substitution_keys = 0
    @user_substitution_keys   = 0
  end

  #-------------------------------------------------------------------------

  def add_profile_section_specific_hash(profile_section, knob_set)
    return unless profile_section && knob_set.is_from_servermgr

    case knob_set.class.to_s
    when "EmailKnobSet"
      profile_section["IncomingMailServerUsername"] = "%short_name%"
      profile_section["OutgoingMailServerUsername"] = "%short_name%"
      profile_section["EmailAccountName"]           = "%full_name%"
      profile_section["EmailAddress"]               = "%email%"
    when "CalDavKnobSet"
      profile_section["CalDAVUsername"]             = "%short_name%"
      profile_section["CalDAVPrincipalURL"]         = "/principals/__uids__/%guid%"
    when "CardDavKnobSet"
      profile_section["CardDAVUsername"]            = "%short_name%"
    when "IchatKnobSet"
      profile_section["JabberUserName"]             = "%short_name%@#{knob_set.JabberHostName}"
    when "VpnKnobSet"
      profile_section["PPP"]["AuthName"]            = "%short_name%" if profile_section.has_key?("PPP")
      profile_section["IPSec"]["XAuthName"]         = "%short_name%" if profile_section.has_key?("IPSec")
    when "IdentificationKnobSet"
      profile_section["PayloadIdentification"] ||= {}
      profile_section["PayloadIdentification"]["UserName"]     = "%short_name%"
      profile_section["PayloadIdentification"]["FullName"]     = "%full_name%"
      profile_section["PayloadIdentification"]["EmailAddress"] = "%email%"
      profile_section["PayloadIdentification"]["AuthMethod"]   = "UserEnteredPassword"
    end
  end

  #-------------------------------------------------------------------------

  def generate_profile
    knob_set_array = @target.knob_sets
    return nil unless knob_set_array && (knob_set_array.count > 1 || @target.is_from_servermgr)  # Must have more than a General Knob Set to have a valid profile, unless this is the system prefs profile

    payload_content = []
    root_payload_identifier = @target.identifier
    root_payload_identifier = root_payload_identifier[0...-7] + ".alacarte" if @manual_download && root_payload_identifier[-7..-1] == ".pushed"

    # Figure out what scope this should target
    # Note that this code assumes iOS devices will ignore the "PayloadScope" key and we therefore assume any profile that targets a device or device group
    # should be specified in the "System" scope. Only Mac OS X devices currently honor this key, so it's OK to set "System" scope even if we don't know
    # for sure that the target device is OS X.
    owner = @target.owner
    payload_scope = (owner.kind_of?(Device) || owner.kind_of?(DeviceGroup) ? "System" : "User") # Can only be "System" scope for profiles that target a device or device group

    general_knob_sets = knob_set_array.select { |ks| ks.class == GeneralKnobSet }
    if general_knob_sets && general_knob_sets.length > 0
      settings = Settings.get_settings
      general_knob_set = general_knob_sets[0]
      organization = (settings.use_code_signing ? settings.signing_org : nil) || (general_knob_set.organization || settings.server_organization)
      profile_hash = { "PayloadIdentifier"        => root_payload_identifier,
                       "PayloadRemovalDisallowed" => (general_knob_set.security ? true : false),
                       "PayloadScope"             => payload_scope,
                       "PayloadType"              => "Configuration",
                       "PayloadUUID"              => @target.uuid,
                       "PayloadOrganization"      => organization,
                       "PayloadVersion"           => 1,
                       "PayloadDisplayName"       => @target.name
                     }
      text = general_knob_set.description
      profile_hash["PayloadDescription"] = text if text && text.length > 0
      text = general_knob_set.consentText
      profile_hash["ConsentText"] = { "default" => text } if text && text.length > 0
      val = general_knob_set.removalDate
      if val
        profile_hash["RemovalDate"] = Time.iso8601(val)
      else
        val = general_knob_set.durationUntilRemoval
        profile_hash["DurationUntilRemoval"] = val if val && val > 0.0
      end

      if general_knob_set.password && general_knob_set.password.length > 0
        security_hash = { "PayloadDescription" => I18n.t("general_payload_description"),
                          "PayloadDisplayName" => I18n.t("general_payload_display_name"),
                          "PayloadIdentifier"  => "#{root_payload_identifier}.ProfileSecurity",
                          "PayloadType"        => "com.apple.profileRemovalPassword",
                          "PayloadUUID"        => UUID.new.generate,  # TODO: Is this right?!? The UUID should be the same each time, shouldn't it?
                          "RemovalPassword"    => general_knob_set.password,
                          "PayloadVersion"     => 1
                        }
        payload_content.push(security_hash)
      end
    else        
      profile_hash = { "PayloadDisplayName"       => @target.name,
                       "PayloadIdentifier"        => root_payload_identifier,
                       "PayloadRemovalDisallowed" => false,
                       "PayloadScope"             => payload_scope,
                       "PayloadType"              => "Configuration",
                       "PayloadUUID"              => @target.uuid,
                       "PayloadVersion"           => 1
                     }
    end

    settings = nil
    identification_knob_set = nil
    knob_set_array.each { |knob_set|
      next if knob_set.class == GeneralKnobSet  # We already handled this above

      identification_knob_set = knob_set if identification_knob_set.nil? && knob_set.class == IdentificationKnobSet  # save it for later

      if knob_set.class.payload_type && knob_set.PayloadEnabled && (knob_set.is_for_ios || @device == nil || @device.mac?)
        payload_hash = self.generate_profile_section_hash(knob_set, root_payload_identifier)
        next unless payload_hash

        if payload_hash.class == Array  # Some knob set types generate multiple payloads (interface/security)
          payload_hash.each { |sub_section|
            self.add_profile_section_specific_hash(sub_section, knob_set)
            payload_content.push(sub_section) if sub_section
          }
        else
          self.add_profile_section_specific_hash(payload_hash, knob_set)
          payload_content.push(payload_hash)
        end
      end
    }

    if identification_knob_set
      theIdentificationUUID = identification_knob_set.PayloadUUID
      idUsername = identification_knob_set["PayloadIdentification"]["UserName"]
      idPassword = identification_knob_set["PayloadIdentification"]["Password"]
      payload_content.each { |payload|
        next unless IDENTIFICATION_ENABLED_KNOB_SETS.index(payload["PayloadType"])

        # For both auto-push and manual-download profiles given to devices that support Identification payloads, they will use this instead
        payload["IdentificationUUID"] = theIdentificationUUID

        # For clients that don't support Identification payloads, dynamically insert the values from the identification paylod into the hashes for the other ones
        # This is important especially for auto-push as there is no other way to specify these
        if payload["PayloadType"] == 'com.apple.ews.account' then
          payload["UserName"] = idUsername # TODO: Ensure client management converts this to the right user@domain format
          payload["Password"] = idPassword
        end
        if payload["PayloadType"] == 'com.apple.caldav.account' then
          payload["CalDAVUsername"] = idUsername
          payload["CalDAVPassword"] = idPassword
        end
        if payload["PayloadType"] == 'com.apple.carddav.account' then
          payload["CardDAVUsername"] = idUsername
          payload["CardDAVPassword"] = idPassword
        end
        if payload["PayloadType"] == 'com.apple.jabber.account' then
          payload["JabberUserName"] = "#{idUsername}@#{payload["JabberHostName"]}"
          payload["JabberPassword"] = idPassword
        end
        if payload["PayloadType"] == 'com.apple.mail.managed' then
          payload["IncomingMailServerUsername"] = idUsername
          payload["IncomingPassword"]           = idPassword
          payload["OutgoingMailServerUsername"] = idUsername
          payload["OutgoingPassword"]           = idPassword
          payload["EmailAccountName"]           = identification_knob_set["PayloadIdentification"]["FullName"]     if identification_knob_set["PayloadIdentification"]["FullName"] 
          payload["EmailAddress"]               = identification_knob_set["PayloadIdentification"]["EmailAddress"] if identification_knob_set["PayloadIdentification"]["EmailAddress"] 
        end
        if payload["PayloadType"] == 'com.apple.vpn.managed' then
          payload["IPSec"]["XAuthName"]  = idUsername if payload["IPSec"] && payload["IPSec"]["XAuthName"]
          payload["PPP"]["AuthName"]     = idUsername if payload["PPP"] && payload["PPP"]["AuthName"]
          payload["VPN"]["AuthName"]     = idUsername if payload["VPN"] && payload["VPN"]["AuthName"]
          payload["VPN"]["AuthPassword"] = idPassword if payload["VPN"] && payload["VPN"]["AuthPassword"]
        end
        if payload["PayloadType"] == 'com.apple.ldap.account' then
          payload["LDAPAccountUserName"] = idUsername
          payload["LDAPAccountPassword"] = idPassword
        end
      }
    end
    
    merge_payload_type_duplicates(payload_content)
    profile_hash["PayloadContent"] = payload_content
    profile_hash = self.substituteDeviceAndUserValues(profile_hash)
    return profile_hash
  end
  
  #-------------------------------------------------------------------------
  
  def merge_payload_type_duplicates(payload_content)
      payload_type_index = {}
      payloads_to_delete = []
      payload_content.each_with_index {|val, index|
          next if REPEATABLE_PAYLOAD_TYPES.include?(val['PayloadType'])
          payload_type = val['PayloadType']
          first_index = payload_type_index[payload_type]
          if first_index
              existing_payload = payload_content[first_index]
              val.each {|key, value|
                  existing_payload[key] = value
              }
              payloads_to_delete.push(val)
          else
              payload_type_index[payload_type] = index
          end
      }
      
      payload_content.delete_if {|val| true if payloads_to_delete.include?(val) }
      return payload_content
  end
  
  #-------------------------------------------------------------------------

  def generate_profile_section_hash(knob_set, root_payload_identifier)
    # If the knob set has its own logic for generating payloads, use that
    return knob_set.generate_payload_hash(root_payload_identifier, self) if knob_set.respond_to?(:generate_payload_hash)

    # Otherwise, create a standard payload and copy all the attributes of the knob set that aren't internal to the server
    payload_type = (knob_set.respond_to?(:payload_type) ? knob_set.payload_type : knob_set.class.payload_type)
    payload_hash = { "PayloadType"        => payload_type,
                     "PayloadVersion"     => 1,  #knob_set.PayloadVersion,
                     "PayloadIdentifier"  => "#{root_payload_identifier}.#{knob_set.payload_subidentifier}",
                     "PayloadUUID"        => knob_set.PayloadUUID,
                     "PayloadEnabled"     => knob_set.PayloadEnabled,
                     "PayloadDisplayName" => knob_set.localized_payload_display_name
                   }

    knob_set.attributes.each { |attribute, value| payload_hash[attribute] = value if ProfileManager.add?(value, attribute, payload_hash) }

    # DO NOT ADD SPECIAL PER-KNOB SET LOGIC HERE!
    # Create a modify_payload_hash method in the knob set model file and make minor changes needed in there
    payload_hash = knob_set.modify_payload_hash(payload_hash) if knob_set.respond_to?(:modify_payload_hash)

    return payload_hash
  end

  #-------------------------------------------------------------------------

  def device_substitution_keys
    return @device_substitution_keys
  end
  
  #-------------------------------------------------------------------------

  def user_substitution_keys
    return @user_substitution_keys
  end
  
  #-------------------------------------------------------------------------

  def substituteDeviceAndUserValues(value)
    if value.class == Hash
      new_value = {}
      value.each { |key, val| new_value[key] = self.substituteDeviceAndUserValues(val) }
    elsif value.class == Array
      new_value = value.collect { |val| self.substituteDeviceAndUserValues(val) }
    elsif value.class == String
      new_value = value.gsub(/%(\w+)%/) { |match| key = $1
        rep = nil
        bit = User.bit_for_substitution_key(key)
        if bit
          @user_substitution_keys |= bit
          rep = @user.get_substitution_value_and_mask_for_key(key) if @user
        else
          bit = Device.bit_for_substitution_key(key)
          if bit
            @device_substitution_keys |= bit
            rep = @device.get_substitution_value_and_mask_for_key(key) if @device
          end
        end

        Rails.logger.info("replace '#{match}' ==> #{rep.nil? ? "nil" : "'#{rep}'"}") if MDMLogger.debugOutput?
        rep || match
      } # value.gsub
    else
      new_value = value
    end
    return new_value
  end

  #-------------------------------------------------------------------------

end
