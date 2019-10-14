#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

require 'cfpropertylist'
require 'base64'
require 'timeout'

ServerCapabilities = ['com.apple.mdm.per-user-connections']
DeviceTypeAny      = 'any'
ValidDeviceTypes   = [ DeviceTypeAny, 'ios', 'mac', 'tv' ]    # DeviceTypeAny must be first!

#-------------------------------------------------------------------------
class ProfileManager
#-------------------------------------------------------------------------

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
    'com.apple.font',
    'com.apple.google-oauth'
  ]
  COMMON_PAYLOAD_KEYS = ['PayloadType', 'PayloadVersion', 'PayloadIdentifier', 'PayloadEnabled', 'PayloadUUID', 'PayloadDisplayName']

  @@ignore_keys = [ 'knobset_attributes', 'id', 'created_at', 'updated_at', 'is_from_servermgr', 'admin_temp_id', 'temporary_id',
                    'admin_session', 'security_relationship_ids', 'interface_relationship_ids', 'profile_id', 'class_name',
                    'profile_from_servermgr', 'profile_admin_temp_id', 'profile_created_at', 'library_item_id', 'settings_type',
                    'settings_name', 'settings_identifier', 'settings_version', 'updated_at_xid' ]

  attr_reader :target, :device, :user

  #-------------------------------------------------------------------------

  def self.add?(value, attribute, payload_hash = nil)
    return false if value.nil? || ((value.class == Hash || value.class == Array) && value.empty?)
    attr_str = attribute.to_s
    return false if attr_str.start_with?('internal_use_flag') || @@ignore_keys.include?(attr_str)
    return false if payload_hash && (payload_hash.include?(attribute) || payload_hash.include?(attr_str))
    return true
  end # self.add?

  #-------------------------------------------------------------------------

  def self.encoded_identity_cert; return Base64.encode64(File.read("#{File.dirname(__FILE__)}/profile_manager/client.p12"));  end
  def self.ignore_keys;           return @@ignore_keys;                                                                       end

  #-------------------------------------------------------------------------

  def self.sign_data(data)
    cur_settings = Settings.get_settings
    identity = cur_settings.get_signing_identity
    unless identity
      Rails.logger.warn('ProfileManager::sign_data: No signing certificate specified, unable to sign.') if MDMLogger.debugOutput?(2)
      return data
    end

    identity = Base64.decode64(identity)

    if MDMLogger.debugOutput?(2)
      signed_data = ''  # So the assignment to signed_data in the block below escapes the closure
      ms = [Benchmark.ms { signed_data = DMHelper::get_cms_signed_data(identity, cur_settings.server_org_magic, data) }, 0.01].max
      Rails.logger.info("ProfileManager.sign_data completed in #{ms} ms")
    else
      signed_data = DMHelper::get_cms_signed_data(identity, cur_settings.server_org_magic, data)
    end

    return signed_data if signed_data && signed_data.length > 0

    Rails.logger.warn('Signing failed, exporting an unsigned profile file instead.')
    return data
  end # self.sign_data

  #-------------------------------------------------------------------------

  def self.generate_auto_join_ota_bootstrap_profile(name, challenge)
    uuid = UUID.new

    cur_settings = Settings.get_settings
    ota_bootstrap_url = URI.join("#{cur_settings.url_base}","#{PM_PHP_OLD_URI_ROOT}/auto_join_ota_service").to_s

    profile_hash = {'PayloadDisplayName'       => name,
                    'PayloadIdentifier'        => "com.apple.ota.#{cur_settings.gethostname}.bootstrap",
                    'PayloadRemovalDisallowed' => false,
                    'PayloadType'              => 'Configuration',
                    'PayloadUUID'              => uuid.generate,
                    'PayloadVersion'           => 1,
                    'PayloadOrganization'      => cur_settings.server_organization,
                    'PayloadDescription'       => I18n.t('auto_join_description'),
                    'PayloadType'              => 'Profile Service',
                    'PayloadContent'           => {'URL'              => ota_bootstrap_url,
                                                   'DeviceAttributes' => ['DEVICE_NAME', 'UDID', 'IMEI', 'MEID', 'DeviceID', 'SERIAL', 'VERSION', 'PRODUCT', 'COMPROMISED'],
                                                   'Challenge'        => challenge
                                                  },
                    'ConfirmInstallation'      => true,
                   }

    profile = profile_hash.to_plist
    Rails.logger.info("auto_join_ota_bootstrap_profile = #{profile}") if MDMLogger.debugOutput?
    return self.sign_data(profile);
  end # self.generate_auto_join_ota_bootstrap_profile

  #-------------------------------------------------------------------------

  def self.generate_profile(target, device = nil, manual_download = false)
    pm = ProfileManager.new(target, device, nil, manual_download)
    variants = pm.generate_profile_variants
    return nil if variants.empty?

    # Pick the most appropriate variant
    profile_hash = nil
    if device
      type         = device.mdm_target_type
      profile_hash = variants[type]
    end
    return (profile_hash || variants[DeviceTypeAny])
  end # self.generate_profile

  #-------------------------------------------------------------------------

  def self.generate_raw_profile(target, device = nil, manual_download = false)
    profile_hash = self.generate_profile(target, device, manual_download)
    return nil unless profile_hash

    profile_plist = profile_hash.to_plist
    Rails.logger.info("RawProfile:\n#{profile_plist}") if MDMLogger.debugOutput?
    return profile_plist
  end # self.generate_raw_profile

  #-------------------------------------------------------------------------

  def self.generate_signed_profile2(target, device = nil, user = nil, manual_download = false)
    pm = ProfileManager.new(target, device, user, manual_download)
    variants = pm.generate_profile_variants
    return nil, 0 if variants.empty?

    # Pick the most appropriate variant
    profile_hash = nil
    if device
      type         = device.mdm_target_type
      profile_hash = variants[type]
      profile_hash = variants['ios'] if profile_hash.empty? && type == 'tv'
    end
    profile_hash ||= variants[DeviceTypeAny]
    return nil, 0 if profile_hash.empty?

    return self.sign_data(profile_hash), pm.substitution_keys
  end # self.generate_signed_profile2

  #-------------------------------------------------------------------------

  def self.generate_signed_profile(target, device = nil, user = nil, manual_download = false)
    return self.generate_signed_profile2(target, device, user, manual_download)[0]
  end

  #-------------------------------------------------------------------------

  def self.generate_downloadable_profile(target, user, mdm_target_type)
    pm = ProfileManager.new(target, nil, user, true)
    variants = pm.generate_profile_variants
    Rails.logger.info("Profile variants for profile #{target.id} is #{variants}") if MDMLogger.debugOutput?(3)
    return nil if variants.empty?

    # Pick the most appropriate variant
    profile_hash = variants[mdm_target_type] || variants[DeviceTypeAny]
    return nil if profile_hash.empty?

    Rails.logger.info("Profile content for mdm_target_type #{mdm_target_type} is #{profile_hash}") if MDMLogger.debugOutput?(3)
    return self.sign_data(profile_hash)
  end # self.generate_downloadable_profile

  #-------------------------------------------------------------------------

  def initialize(target, device=nil, user=nil, manual_download = false)
    @target            = target
    @device            = device
    @user              = user
    @manual_download   = manual_download
    @substitution_keys = 0
  end # initialize

  #-------------------------------------------------------------------------

  def add_profile_section_specific_hash(profile_section, knob_set)
    return unless profile_section
    @@ignore_keys.each { |k| profile_section.delete(k) }    # Remove keys that shouldn't be in the payload
    return unless knob_set.is_from_servermgr

    case knob_set.class.to_s
    when 'EmailKnobSet'
      profile_section['IncomingMailServerUsername'] = '%short_name%'
      profile_section['OutgoingMailServerUsername'] = '%short_name%'
      profile_section['EmailAccountName']           = '%full_name%'
      profile_section['EmailAddress']               = '%email%'
    when 'CalDavKnobSet'
      profile_section['CalDAVUsername']             = '%short_name%'
      profile_section['CalDAVPrincipalURL']         = '/principals/__uids__/%guid%'
    when 'CardDavKnobSet'
      profile_section['CardDAVUsername']            = '%short_name%'
    when 'IchatKnobSet'
      profile_section['JabberUserName']             = "%short_name%@#{knob_set.JabberHostName}"
    when 'VpnKnobSet'
      profile_section['PPP']['AuthName']            = '%short_name%' if profile_section.has_key?('PPP')
      profile_section['IPSec']['XAuthName']         = '%short_name%' if profile_section.has_key?('IPSec')
    when 'IdentificationKnobSet'
      profile_section['PayloadIdentification'] ||= {}
      profile_section['PayloadIdentification']['UserName']     = '%short_name%'
      profile_section['PayloadIdentification']['FullName']     = '%full_name%'
      profile_section['PayloadIdentification']['EmailAddress'] = '%email%'
      profile_section['PayloadIdentification']['AuthMethod']   = 'UserEnteredPassword'
    end
  end # add_profile_section_specific_hash

  #-------------------------------------------------------------------------

  def generate_profile_variants
    knob_set_array = @target.knob_sets
    return nil if knob_set_array.empty? && !@target.from_servermgr  # Must have more a Knob Set to have a valid profile, unless this is the system prefs profile

    payload_contents = { }
    ValidDeviceTypes.each { |type| payload_contents[type] = [] }

    root_payload_identifier = @target.identifier
    root_payload_identifier = root_payload_identifier[0...-7] + '.alacarte' if @manual_download && root_payload_identifier.end_with?('.pushed')

    # Figure out what scope this should target
    # Note that this code assumes iOS devices will ignore the 'PayloadScope' key and we therefore assume any profile that targets a device or device group
    # should be specified in the 'System' scope. Only Mac OS X devices currently honor this key, so it's OK to set 'System' scope even if we don't know
    # for sure that the target device is OS X.
    payload_scope = (@target.library_item_type.start_with?('Device') ? 'System' : 'User')  # Can only be 'System' scope for profiles that target a device or device group

    general_knob_set = @target.GeneralKnobSet
    if general_knob_set.empty?
      profile_hash = { 'PayloadDisplayName'       => @target.name,
                       'PayloadIdentifier'        => root_payload_identifier,
                       'PayloadRemovalDisallowed' => false,
                       'PayloadScope'             => payload_scope,
                       'PayloadType'              => 'Configuration',
                       'PayloadUUID'              => @target.uuid,
                       'PayloadVersion'           => 1
                     }
    else
      settings = Settings.get_settings
      organization = (settings.use_code_signing ? settings.signing_org : nil) || (general_knob_set['organization'] || settings.server_organization)
      profile_hash = { 'PayloadIdentifier'        => root_payload_identifier,
                       'PayloadRemovalDisallowed' => (general_knob_set['security'] ? true : false),
                       'PayloadScope'             => payload_scope,
                       'PayloadType'              => 'Configuration',
                       'PayloadUUID'              => @target.uuid,
                       'PayloadOrganization'      => organization,
                       'PayloadVersion'           => 1,
                       'PayloadDisplayName'       => @target.name
                     }
      text = general_knob_set['description']
      profile_hash['PayloadDescription'] = text unless text.empty?
      text = general_knob_set['consentText']
      profile_hash['ConsentText'] = { 'default' => text } unless text.empty?
      val = general_knob_set['removalDate']
      if val
        profile_hash['RemovalDate'] = Time.iso8601(val)
      else
        val = general_knob_set['durationUntilRemoval']
        profile_hash['DurationUntilRemoval'] = val if val && val > 0.0
      end

      unless general_knob_set['password'].empty?
        security_hash = { 'PayloadDescription' => I18n.t('general_payload_description'),
                          'PayloadDisplayName' => I18n.t('general_payload_display_name'),
                          'PayloadIdentifier'  => "#{root_payload_identifier}.ProfileSecurity",
                          'PayloadType'        => 'com.apple.profileRemovalPassword',
                          'PayloadUUID'        => UUID.new.generate,  # TODO: Is this right?!? The UUID should be the same each time, shouldn't it?
                          'RemovalPassword'    => general_knob_set['password'],
                          'PayloadVersion'     => 1
                        }
        payload_contents[DeviceTypeAny].push(security_hash)
      end
    end # if/else general_knob_set.empty?

    identification_knob_set = nil
    knob_set_array.each { |knob_set|
      identification_knob_set ||= knob_set if knob_set.class == IdentificationKnobSet  # save it for later

      if knob_set.class.payload_type && knob_set.PayloadEnabled && (knob_set.is_for_ios || @device == nil || @device.mac?)
        payload_hash = self.generate_profile_section_hash(knob_set, root_payload_identifier)
        next unless payload_hash

        # If the knob set returned a hash without device type keys, it's valid for any device type
        payload_hash = { DeviceTypeAny => payload_hash } if payload_hash.class != Hash || (payload_hash.keys & ValidDeviceTypes).empty?

        ValidDeviceTypes.each { |type|
          hash = payload_hash[type]
          next if hash.empty?

          if hash.class == Array  # Some knob set types generate multiple payloads (interface/security)
            hash.each { |sub_section|
              self.add_profile_section_specific_hash(sub_section, knob_set)
              payload_contents[type].push(sub_section) unless sub_section.empty?
            }
          else
            self.add_profile_section_specific_hash(hash, knob_set)
            payload_contents[type].push(hash) unless hash.empty?
          end
        } # ValidDeviceTypes.each
      end
    } # knob_set_array.each

    if identification_knob_set
      theIdentificationUUID = identification_knob_set.settings_identifier
      idUsername = identification_knob_set['PayloadIdentification']['UserName']
      idPassword = identification_knob_set['PayloadIdentification']['Password']
      ValidDeviceTypes.each { |type|
        content = payload_contents[type]
        next if content.empty?

        content.each { |payload|
          next unless IDENTIFICATION_ENABLED_KNOB_SETS.include?(payload['PayloadType'])

          # For both auto-push and manual-download profiles given to devices that support Identification payloads, they will use this instead
          payload['IdentificationUUID'] = theIdentificationUUID

          # For clients that don't support Identification payloads, dynamically insert the values from the identification paylod into the hashes for the other ones
          # This is important especially for auto-push as there is no other way to specify these
          case payload['PayloadType']
          when 'com.apple.ews.account'
            payload['UserName'] = idUsername    # TODO: Ensure client management converts this to the right user@domain format
            payload['Password'] = idPassword

          when 'com.apple.caldav.account'
            payload['CalDAVUsername'] = idUsername
            payload['CalDAVPassword'] = idPassword

          when 'com.apple.carddav.account'
            payload['CardDAVUsername'] = idUsername
            payload['CardDAVPassword'] = idPassword

          when 'com.apple.jabber.account'
            payload['JabberUserName'] = "#{idUsername}@#{payload['JabberHostName']}"
            payload['JabberPassword'] = idPassword

          when 'com.apple.mail.managed'
            payload['IncomingMailServerUsername'] = idUsername
            payload['IncomingPassword']           = idPassword
            payload['OutgoingMailServerUsername'] = idUsername
            payload['OutgoingPassword']           = idPassword
            payload['EmailAccountName']           = identification_knob_set['PayloadIdentification']['FullName']     if identification_knob_set['PayloadIdentification']['FullName']
            payload['EmailAddress']               = identification_knob_set['PayloadIdentification']['EmailAddress'] if identification_knob_set['PayloadIdentification']['EmailAddress']

          when 'com.apple.vpn.managed'
            payload['IPSec']['XAuthName']  = idUsername if payload['IPSec'] && payload['IPSec']['XAuthName']
            payload['PPP']['AuthName']     = idUsername if payload['PPP']   && payload['PPP']['AuthName']
            payload['VPN']['AuthName']     = idUsername if payload['VPN']   && payload['VPN']['AuthName']
            payload['VPN']['AuthPassword'] = idPassword if payload['VPN']   && payload['VPN']['AuthPassword']

          when 'com.apple.ldap.account'
            payload['LDAPAccountUserName'] = idUsername
            payload['LDAPAccountPassword'] = idPassword
          end
        } # content.each
      } # ValidDeviceTypes.each
    end # if identification_knob_set

    profile_by_type = {}
    any_payloads    = []
    ValidDeviceTypes.each { |type|
      payloads = payload_contents[type]
      next if payloads.empty?           # If there are no type-specific payloads for this type, omit the type from the final result

      profile = profile_hash.clone_deep                                                         # Start with a copy of the common profile wrapper (it will be the same for all types)
      profile['PayloadContent'] = self.merge_payload_type_duplicates(payloads + any_payloads)   # any_payloads will be empty the first time through
      any_payloads = profile['PayloadContent'].clone_deep if type == DeviceTypeAny              # Save the payloads for any device type so we can merge it with the type-specific payloads (if any)
      profile = self.substituteDeviceAndUserValues(profile)
    	Rails.logger.error("profile hash (#{type}) = #{profile}") if MDMLogger.debugOutput?(3)

      profile = profile.to_plist
      Rails.logger.info("profile (#{type}) = #{profile.to_s.remove_illegal_utf8}") if MDMLogger.debugOutput?(2)
      profile_by_type[type] = profile
    } # ValidDeviceTypes.each
    return profile_by_type
  end # generate_profile_variants

  #-------------------------------------------------------------------------

  def merge_payload_type_duplicates(payload_content)
    new_content      = []
    payloads_by_type = {}
    payload_content.each { |pay|
      type = pay['PayloadType']
      if REPEATABLE_PAYLOAD_TYPES.include?(type)
        new_content.push(pay)
      else
        first = payloads_by_type[type]
        if first
          pay.each_pair { |k, v|
            next if COMMON_PAYLOAD_KEYS.include?(k)
            Rails.logger.error("Found duplicate values for key #{k} under payload type #{type}") if pay[k]
            first[k] = v
          }
        else
          new_content.push(pay)
          payloads_by_type[type] = pay
        end
      end
    } # payload_content.each

    return new_content
  end # merge_payload_type_duplicates

  #-------------------------------------------------------------------------

  def generate_profile_section_hash(knob_set, root_payload_identifier)
    # If the knob set has its own logic for generating payloads, use that
    return knob_set.generate_payload_hash(root_payload_identifier, self) if knob_set.respond_to?(:generate_payload_hash)

    # Otherwise, create a standard payload and copy all the attributes of the knob set that aren't internal to the server
    payload_type = (knob_set.respond_to?(:payload_type) ? knob_set.payload_type : knob_set.class.payload_type)
    payload_hash = { 'PayloadType'        => payload_type,
                     'PayloadVersion'     => 1,  # knob_set.settings_version,
                     'PayloadIdentifier'  => "#{root_payload_identifier}.#{knob_set.payload_subidentifier}",
                     'PayloadUUID'        => knob_set.settings_identifier,
                     'PayloadEnabled'     => knob_set.PayloadEnabled,
                     'PayloadDisplayName' => knob_set.localized_payload_display_name
                   }

    knob_set.attributes.each { |attribute, value| payload_hash[attribute] = value if ProfileManager.add?(value, attribute, payload_hash) }

    # DO NOT ADD SPECIAL PER-KNOB SET LOGIC HERE!
    # Create a modify_payload_hash method in the knob set model file and make minor changes needed in there
    payload_hash = knob_set.modify_payload_hash(payload_hash) if knob_set.respond_to?(:modify_payload_hash)
    return payload_hash
  end # generate_profile_section_hash

  #-------------------------------------------------------------------------

  def substitution_keys;  return @substitution_keys;  end

  #-------------------------------------------------------------------------

  def substituteDeviceAndUserValues(value)
    if value.class == Hash
      new_value = {}
      value.each { |key, val| new_value[key] = self.substituteDeviceAndUserValues(val) }
    elsif value.class == Array
      new_value = value.collect { |val| self.substituteDeviceAndUserValues(val) }
    elsif value.class == String
      new_value = value.gsub(/%(\w+)%/) { |match|
        key = $1
        rep = nil
        bit = User.bit_for_substitution_key(key)
        if bit
          @substitution_keys |= bit
          rep = @user.get_substitution_value_and_mask_for_key(key) if @user
        else
          bit = Device.bit_for_substitution_key(key)
          if bit
            @substitution_keys |= bit
            rep = @device.get_substitution_value_and_mask_for_key(key) if @device
          end
        end

        Rails.logger.info("replace '#{match}' ==> #{rep.nil? ? "nil" : "'#{rep}'"}") if MDMLogger.debugOutput?
        rep || match
      } # value.gsub
    else
      new_value = value
    end
    Rails.logger.info("@substitution_keys = #{@substitution_keys}") if MDMLogger.debugOutput?(2)
    return new_value
  end # substituteDeviceAndUserValues

#-------------------------------------------------------------------------
end # class ProfileManager
#-------------------------------------------------------------------------
