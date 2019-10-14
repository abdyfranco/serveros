#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

require 'time'

#-------------------------------------------------------------------------
class AutoJoinProfileController < ApplicationController
#-------------------------------------------------------------------------

  skip_before_filter :verify_post, :only => [:get_auto_join_profile]
  skip_before_filter :verify_auth_token, :verify_admin_logged_in, :except => [:get_auto_join_profile]
  skip_before_filter :verify_not_timed_out, :except => [:get_auto_join_profile]
  before_filter :verify_apns, :only => [:get_auto_join_profile]
  before_filter :verify_admin_logged_in, :only => [:get_auto_join_profile]

  #-------------------------------------------------------------------------

  def get_auto_join_profile
    auto_join_profile = AutoJoinProfile.find_by_id(params[:id])
    if User.logged_in_user_guid && auto_join_profile && session[:user]['isAdmin']
      # Okay, it looks like we're safe to vend out the Auto-Join Profile that is OTA Bootstrap
      unless auto_join_profile.reg_challenge
        # Only make one of these per AutoJoinProfile
        auto_join_profile.reg_challenge = UUID.new.generate
        Rails.logger.info("reg_challenge is now #{auto_join_profile.reg_challenge}")
        auto_join_profile.save
      end
      bootstrap_profile = ProfileManager.generate_auto_join_ota_bootstrap_profile(auto_join_profile.name, auto_join_profile.reg_challenge)
      filename = auto_join_profile.name.gsub(/\s+/, '_')+".mobileconfig"
      response.headers['Content-Type'] = 'application/x-apple-aspen-config'
      response.headers['Content-Disposition'] = "attachment; filename=\"#{filename}\""
      render :xml => bootstrap_profile
    else
      render :text => "401 Unauthorized", :status => 401
    end
  end # get_auto_join_profile

#-------------------------------------------------------------------------
end # class AutoJoinProfileController
#-------------------------------------------------------------------------
