#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class MacRestrictionsKnobSet < KnobSet

  @@valid_payload_types = [ 'com.apple.NetworkBrowser', 'com.apple.systemuiserver', 'com.apple.DiscRecording', 'com.apple.finder', 'com.apple.applicationaccess.new', 'com.apple.dashboard', 'com.apple.systempreferences',
                            'com.apple.appstore', 'com.apple.ShareKitHelper', 'com.apple.gamed', 'com.apple.desktop']

  @@payload_type_attributes = {
    'com.apple.applicationaccess.new' => [:familyControlsEnabled, :pathBlackList, :pathWhiteList],
    'com.apple.dashboard'             => [:whiteListEnabled],
    'com.apple.systemuiserver'        => [],
    'com.apple.DiscRecording'         => [],
    'com.apple.finder'                => [],
    'com.apple.systempreferences'     => [],
    'com.apple.NetworkBrowser'        => [:DisableAirDrop],
    'com.apple.appstore'              => [],
    'com.apple.ShareKitHelper'        => [:SHKAllowedShareServices, :SHKDeniedShareServices],
    'com.apple.gamed'                 => [:GKFeatureGameCenterAllowed, :GKFeatureAccountModificationAllowed, :GKFeatureAddingGameCenterFriendsAllowed, :GKFeatureMultiplayerGamingAllowed],
    'com.apple.desktop'               => []
  }

  @@payload_type          = 'com.apple.systemuiserver'
  @@payload_subidentifier = "macosxrestrictions"
  @@is_unique             = true
  @@payload_name          = "Mac OS X Restrictions"

  #-------------------------------------------------------------------------

  def self.old_table_name
    return "mac_restrictions_knob_sets"
  end

  #-------------------------------------------------------------------------

  def self.dynamic_attributes_defaults
    return { self.to_s => { :restrict_store_softwareupdate_only => false } }
  end

  #-------------------------------------------------------------------------

  def also_modifies
    return [:system_applications, :widgets]
  end

  #-------------------------------------------------------------------------

  def localized_payload_display_name(short = false)
    return I18n.t("restrictions_display_name")
  end

  #-------------------------------------------------------------------------

  def self.valid_payload_types
    return @@valid_payload_types
  end

  #-------------------------------------------------------------------------

  def localized_payload_display_name_for_content(type)
    case type
    when 'com.apple.DiscRecording'
      return I18n.t("media_access_recording_display_name")
    when 'com.apple.finder'
      return I18n.t("media_access_finder_display_name")
    when 'com.apple.applicationaccess.new'
      return I18n.t("applications_access_display_name")
    when 'com.apple.dashboard'
      return I18n.t("applications_dashboard_display_name")
    when 'com.apple.systempreferences'
      return I18n.t("system_preferences_display_name")
    when 'com.apple.NetworkBrowser'
      return I18n.t("airdrop_display_name")
    when 'com.apple.appstore'
      return I18n.t("appstore_display_name")
    when 'com.apple.gamed'
      return I18n.t("game_center_display_name")
    when 'com.apple.desktop'
      return I18n.t("desktop_display_name")
    else
      return self.localized_payload_display_name
    end
  end

  #-------------------------------------------------------------------------

  def generate_payload_hash(root_payload_identifier, profile_manager_ctx)
    payload_array = []
    @@payload_type_attributes.each_pair { |payload_type, keys|
      newUUID = Digest::MD5.hexdigest(self.PayloadUUID.to_s + payload_type.to_s)
      [8,13,18,23].each{ |x| newUUID.insert(x,'-') }
      last_element = payload_type.split('.').last

      payload_hash = { "PayloadType"        => payload_type,
                       "PayloadVersion"     => 1,
                       "PayloadIdentifier"  => "#{root_payload_identifier}.#{self.payload_subidentifier}.#{last_element}",
                       "PayloadEnabled"     => self.PayloadEnabled,
                       "PayloadUUID"        => newUUID,
                       "PayloadDisplayName" => self.localized_payload_display_name_for_content(payload_type)
                     }
      keys.each{ |attribute|
        value = self[attribute]
        payload_hash[attribute.to_s] = value if ProfileManager.add?(value, attribute)
      }

      # *** Apps and Widgets ***
      case payload_type
      when 'com.apple.applicationaccess.new'
         # Find all instances of each app bundleID we're interested in
         system_applications = []
         self.system_applications.each { |app|
            all_app_versions = SystemApplication.find(:all, :conditions => {:identifier => app[:identifier]})
            system_applications.concat(all_app_versions)
         }

         # Look up each record for each instance of each bundleID we care about
         payload_hash["whiteList"] = system_applications.collect { |app|
           des_req = app[:signature] || ""
           newApp = { "appID" => BinaryData.new(des_req),
                      "appStore" => false,
                      "bundleID" => app[:identifier],
                      "displayName" => Base64.decode64(app[:display_name]).force_encoding("UTF-8")
                    }
           newApp["subApps"] = app[:subApps] if app[:subApps]
           newApp
       }
       
      when 'com.apple.dashboard'
        payload_hash["WhiteList"] = self.widgets.collect { |wid|
          { "ID" => wid[:identifier],
            "mcx_DisplayName" => Base64.decode64(wid[:display_name]),
            "Type" => "bundleID"
          }
        }

      # *** Media Access ***
      when'com.apple.DiscRecording'
         payload_hash["BurnSupport"] = self[:recordable_allow] ? ( self[:recordable_auth] ? "authenticated" : "on" ) : "off"

      when 'com.apple.finder'
        payload_hash["ProhibitBurn"] = !self[:recordable_allow]

      # *** System Preferences ***
      when 'com.apple.systempreferences'
        if (self[:RestrictPrefPanes])
          if self[:internal_use_flag_BlacklistPrefPanes]
            payload_hash["DisabledPreferencePanes"] = self[:EnabledPreferencePanes]
          else
            payload_hash["EnabledPreferencePanes"] = self[:EnabledPreferencePanes]
          end
        end

      when 'com.apple.systemuiserver'
        no_array   = ["eject", "alert"]
        auth_array = ["eject", "authenticate"]
        ro_array   = ["read-only"]

        payload_hash["logout-eject"] = self[:eject_at_logout] ? {"all-media" => ""} : {}

        payload_hash["mount-controls"] = {}
        mount_controls = payload_hash["mount-controls"]

        mount_controls["blankcd"]           = (self[:recordable_allow]        ? (self[:recordable_auth]        ? auth_array : []) : no_array)
        mount_controls["blankdvd"]          = (self[:recordable_allow]        ? (self[:recordable_auth]        ? auth_array : []) : no_array)
        mount_controls["cd"]                = (self[:cd_allow]                ? (self[:cd_auth]                ? auth_array : []) : no_array)
        mount_controls["dvd"]               = (self[:dvd_allow]               ? (self[:dvd_auth]               ? auth_array : []) : no_array)
        mount_controls["dvdram"]            = (self[:dvd_ram_allow]           ? (self[:dvd_ram_auth]           ? auth_array : []) : no_array)
        mount_controls["disk-image"]        = (self[:disk_image_allow]        ? (self[:disk_image_auth]        ? auth_array : []) : no_array)
        mount_controls["harddisk-external"] = (self[:harddisk_external_allow] ? (self[:harddisk_external_auth] ? auth_array : []) : no_array)
        mount_controls["harddisk-internal"] = (self[:harddisk_internal_allow] ? (self[:harddisk_internal_auth] ? auth_array : []) : ["deny"])

        mount_controls["dvdram"]            += ro_array if self[:dvd_ram_read_only]           && self[:dvd_ram_allow]
        mount_controls["disk-image"]        += ro_array if self[:disk_image_read_only]        && self[:disk_image_allow]
        mount_controls["harddisk-external"] += ro_array if self[:harddisk_external_read_only] && self[:harddisk_external_allow]
        mount_controls["harddisk-internal"] += ro_array if self[:harddisk_internal_read_only] && self[:harddisk_internal_allow]

      when 'com.apple.appstore'
        payload_hash['restrict-store-softwareupdate-only'] = self[:restrict_store_softwareupdate_only]
        payload_hash['restrict-store-disable-app-adoption'] = self[:restrict_store_disable_app_adoption]
        payload_hash['restrict-store-require-admin-to-install'] = self[:restrict_store_require_admin_to_install]

      when 'com.apple.ShareKitHelper'
        # add payload even if the value is empty array - ProfileManager.add? doesn't do this.
        payload_hash[:SHKAllowedShareServices.to_s] = self[:SHKAllowedShareServices] if !self[:SHKAllowedShareServices].nil? && self[:SHKAllowedShareServices].empty?
        payload_hash[:SHKDeniedShareServices.to_s] = self[:SHKDeniedShareServices] if !self[:SHKDeniedShareServices].nil? && self[:SHKDeniedShareServices].empty?

      when 'com.apple.desktop'
        payload_hash["locked"] = self[:lock_desktop_picture] if self[:lock_desktop_picture]
        payload_hash["override-picture-path"] = self[:override_picture_path] if self[:override_picture_path]

      end # case

      payload_array.push(payload_hash)
    }
    return payload_array
  end

  #-------------------------------------------------------------------------

end

