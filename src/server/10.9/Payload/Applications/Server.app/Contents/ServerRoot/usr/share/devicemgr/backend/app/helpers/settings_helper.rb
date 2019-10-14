#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

module SettingsHelper

  #-------------------------------------------------------------------------

  def self.set_user_timeout(incoming_request)
    cur_settings = Settings.get_settings
    cur_settings.user_timeout = incoming_request["user_timeout"]
    cur_settings.save
    return { :settings => { :retrieved => [ cur_settings.attributes ] } }
  end
  
  #-------------------------------------------------------------------------

  def self.gethostname(request = nil)
    return Settings.gethostname
  end

  #-------------------------------------------------------------------------

  def self.get_settings
    cur_settings = Settings.get_settings
    attrs = cur_settings.get_attributes
    attrs[:request_language] = I18n.locale    # This is set by ApplicationController.give_session_to_models
    return { :settings => { :retrieved => [ attrs ] } }
  end

  #-------------------------------------------------------------------------

  def self.verify_od_apns
    cur_settings = Settings.get_settings
    return (cur_settings.od_active == true && cur_settings.apns_active == true)
  end
  
  #-------------------------------------------------------------------------

  def self.verify_od_apns_ssl
    cur_settings = Settings.get_settings
    return (cur_settings.od_active == true && cur_settings.apns_active == true && cur_settings.ssl_active == true)
  end

  #-------------------------------------------------------------------------

end
