#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------
  
class AuthenticationController < ApplicationController
  before_filter :verify_device_auth_token, :only => [:device_callback, :user_logout]
  skip_before_filter :verify_auth_token, :verify_admin_logged_in, :only => [:logout, :not_authorized, :device_callback]
  skip_before_filter :verify_post, :only => [:callback, :device_callback, :not_authorized]
  skip_before_filter :verify_not_timed_out, :only => [:callback, :device_callback]

  #-------------------------------------------------------------------------

  def callback
    settings = Settings.get_settings

    host                  = settings.gethostname(request)    # Will save away the host name for future use when we don't have convenient access
    admin_application_url = "#{settings.request_scheme}://#{host}/profilemanager/"
    
    #Set up the session auth token now so it is ready for the initial requests
    form_authenticity_token
    cookies[:csrf_token] = form_authenticity_token # NOTE: It is pretty important to ignore this cookie in API calls server-side for purposes of CSRF detection; use a custom header instead
    redirect_to_full_url(admin_application_url, 302)
  end

  #-------------------------------------------------------------------------

  def device_callback
    cur_settings           = Settings.get_settings
    host                   = cur_settings.gethostname(request)    # Will save away the host name for future use when we don't have convenient access
    device_application_url = "#{cur_settings.request_scheme}://#{host}/mydevices/"
    redirect_to_full_url(device_application_url, 302)
  end

  #-------------------------------------------------------------------------

  def not_authorized
    logout_user
  end

  #-------------------------------------------------------------------------

  def logout
    logout_admin
  end

  #-------------------------------------------------------------------------
  
  def user_logout
    logout_user
  end

  #-------------------------------------------------------------------------

end
