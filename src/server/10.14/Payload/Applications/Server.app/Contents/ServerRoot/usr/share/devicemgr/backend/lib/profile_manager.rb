#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

require 'cfpropertylist'
require 'base64'
require 'timeout'

#-------------------------------------------------------------------------
class ProfileManager
#-------------------------------------------------------------------------

  DeviceTypeAny    = 'any'
  ValidDeviceTypes = [ DeviceTypeAny, 'ios', 'mac', 'tv' ]    # DeviceTypeAny must be first!

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
    ota_bootstrap_url = URI.join("#{cur_settings.url_base}","#{PM_MDM_URI_ROOT}/auto_join_ota_service").to_s

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

  # This is used by both the admin and the portal

  def self.generate_downloadable_profile(profile, user, mdm_target_type = DeviceTypeAny)
    variants = profile.profile_caches
    Rails.logger.info("Profile variants for profile #{profile.id} is #{variants}") if MDMLogger.debugOutput?(3)
    return 409 if variants.empty?       # 409 CONFLICT --> profile caches haven't been rebuilt yet for this profile
    variants = JSON.parse(variants)
    return nil if variants.empty?

    # Pick the most appropriate variant
    profile_plist = (variants[mdm_target_type] || variants[DeviceTypeAny])
    return 404 if profile_plist.empty?  # 404 NOT FOUND --> there is no profile for the specified target type

    # Fill user substitution values if we have a user record to fill them from
    profile_plist = self.substitute_device_and_user_values(profile_plist, user) if user

    # Make sure the PayloadIdentifier uses .alacarte instead of .pushed
    profile_plist = self.make_alacarte_profile(profile_plist)

    Rails.logger.info("Profile content for mdm_target_type #{mdm_target_type} is #{profile_plist}") if MDMLogger.debugOutput?(3)
    return self.sign_data(profile_plist)
  end # self.generate_downloadable_profile

  #-------------------------------------------------------------------------

  def self.make_alacarte_profile(profile_plist)
    profile_hash = profile_plist.parse_plist
    if profile_plist
      root_payload_identifier = profile_hash['PayloadIdentifier']
      
      if root_payload_identifier && root_payload_identifier.end_with?('.pushed') # Nothing to do if this isn't a pushed profile
        new_payload_identifier = root_payload_identifier[0...-7] + '.alacarte'
        profile_plist.gsub!(root_payload_identifier, new_payload_identifier)
      end
    end

    Rails.logger.error("#{profile_plist}") if MDMLogger.debugOutput?(3)
    return profile_plist
  end # self.make_alacarte_profile

  #-------------------------------------------------------------------------

  def self.substitute_device_and_user_values(value, user, device = nil)
    if value.class == Hash
      new_value = {}
      value.each { |key, val| new_value[key] = self.substitute_device_and_user_values(val, user, device) }
    elsif value.class == Array
      new_value = value.collect { |val| self.substitute_device_and_user_values(val, user, device) }
    elsif value.class == String
      new_value = value.gsub(/%(\w+)%/) { |match|
        key = $1
        rep = (user && user.get_substitution_value_and_mask_for_key(key)) || (device && device.get_substitution_value_and_mask_for_key(key))

        Rails.logger.info("replace '#{match}' ==> #{rep.nil? ? "nil" : "'#{rep}'"}") if MDMLogger.debugOutput?
        rep || match
      } # value.gsub
    else
      new_value = value
    end
    return new_value
  end # self.substitute_device_and_user_values

#-------------------------------------------------------------------------
end # class ProfileManager
#-------------------------------------------------------------------------
