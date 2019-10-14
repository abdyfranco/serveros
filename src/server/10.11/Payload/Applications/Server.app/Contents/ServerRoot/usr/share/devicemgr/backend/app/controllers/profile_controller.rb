#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class ProfileController < ApplicationController
#-------------------------------------------------------------------------

  skip_before_filter :verify_admin_logged_in, :only => [:get_a_la_carte_profile]
  skip_before_filter :verify_post, :only => [:get_signed_profile, :get_raw_profile, :get_a_la_carte_profile]
  before_filter :verify_apns, :only => [:get_signed_profile]
  before_filter :verify_od_apns, :only => [:run_task]

  #-------------------------------------------------------------------------

  def add_knob_set;     render :json => { :result => ProfileHelper.add_knob_set(params[:id], JSON.parse(request.body.read)) };    end
  def find_all;         render :json => { :result => ProfileHelper.find_all };                                                    end
  def find_matching;    render :json => { :result => ProfileHelper.find_matching(JSON.parse(request.body.read)) };                end
  def get_knob_sets;    render :json => { :result => ProfileHelper.get_knob_sets(params[:id]) };                                  end
  def remove_knob_set;  render :json => { :result => ProfileHelper.remove_knob_set(params[:id], JSON.parse(request.body.read)) }; end

  #-------------------------------------------------------------------------

  def get_a_la_carte_profile
    profile = Profile.find_by_id(params[:id])
    user = User.logged_in_user
    if user && profile && (user.can_download_adhoc_profiles? && (user.get_adhoc_profiles.include?(profile) || profile.profile_from_servermgr))
      profile_plist = ProfileManager.generate_signed_profile(profile, nil, user, true)
      response.headers['Content-Type'] = 'application/x-apple-aspen-config'
      response.headers['Content-Disposition'] = "attachment; filename=\"#{profile.download_name}\""
      render :xml => profile_plist
    else
      render :text => "401 Unauthorized", :status => 401
    end
  end # get_a_la_carte_profile

  #-------------------------------------------------------------------------

  def get_raw_profile
    profile = Profile.find_by_id(params[:id])
    user = User.logged_in_user
    if user && profile && session[:user]['isAdmin']
      profile_plist = ProfileHelper.get_raw_profile(profile.id)
      response.headers['Content-Type'] = 'application/x-apple-aspen-config'
      response.headers['Content-Disposition'] = "attachment; filename=\"#{profile.download_name}\""
      render :xml => profile_plist
    else
      render :text => "401 Unauthorized", :status => 401
    end
  end # get_raw_profile

  #-------------------------------------------------------------------------

  def get_signed_profile
    profile = Profile.find_by_id(params[:id])
    user = User.logged_in_user
    unless user && profile && session[:user]['isAdmin']
      render :text => "401 Unauthorized", :status => 401
      return
    end

    profile_plist = ProfileManager.generate_signed_profile(profile, nil, user, true) # true = manual download
    unless profile_plist
      render :text => "500 Internal Server Error", :status => 500
      return
    end

    response.headers['Content-Type'] = 'application/x-apple-aspen-config'
    response.headers['Content-Disposition'] = "attachment; filename=\"#{profile.download_name}\""
    render :xml => profile_plist
  end # get_signed_profile

#-------------------------------------------------------------------------
end # class ProfileController
#-------------------------------------------------------------------------
