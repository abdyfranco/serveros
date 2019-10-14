#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
module SettingsHelper
#-------------------------------------------------------------------------

  def self.gethostname(request = nil);  return Settings.gethostname;                                                        end
  def self.get_settings;                return { :settings => { :retrieved => [ Settings.get_settings.get_attributes ] } }; end

  #-------------------------------------------------------------------------

  def self.update(settings_id, incoming_request)
    # This only updates the per-admin preferences, everything on the actual settings row is immutable to the admin at this time
    if incoming_request.key?('admin_prefs')
      user = User.logged_in_user
      user.admin_prefs = incoming_request['admin_prefs']
      user.save
    end

    # Update global settings for edu classes
    if incoming_request.key?('edu_class_config_settings')
      cur_settings = Settings.get_settings
      cur_settings.edu_class_config_settings = incoming_request['edu_class_config_settings']
      cur_settings.save
    end

    return { :settings => { :updated => [ Settings.get_settings.get_attributes ] } }
  end # self.update

  #-------------------------------------------------------------------------

  def self.verify_od_apns
    cur_settings = Settings.get_settings
    return (cur_settings.od_active && cur_settings.apns_active)
  end # self.verify_od_apns

  #-------------------------------------------------------------------------

  def self.verify_od_apns_ssl
    cur_settings = Settings.get_settings
    return (cur_settings.od_active && cur_settings.apns_active && cur_settings.ssl_active)
  end # self.verify_od_apns_ssl

#-------------------------------------------------------------------------
end # module SettingsHelper
#-------------------------------------------------------------------------
