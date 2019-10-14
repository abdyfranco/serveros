#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class ProfileController < ApplicationController

  skip_before_filter :verify_admin_logged_in, :only => [:get_a_la_carte_profile]
  skip_before_filter :verify_post, :only => [:get_signed_profile, :get_raw_profile, :get_a_la_carte_profile]
  before_filter :verify_apns, :only => [:get_signed_profile]
  before_filter :verify_od_apns, :only => [:run_task]
  
  #-------------------------------------------------------------------------
  
  def find_all
    result = ProfileHelper.find_all
    render :json => { :result => result }
  end

  #-------------------------------------------------------------------------
  
  def find_matching
    post_data = request.body.read
    incoming_request = JSON.parse(post_data)
    result = ProfileHelper.find_matching(incoming_request)
    render :json => { :result => result }
  end

  #-------------------------------------------------------------------------

  def add_knob_set
    post_data = request.body.read
    incoming_request = JSON.parse(post_data)
    result = ProfileHelper.add_knob_set(params[:id], incoming_request)
    render :json => { :result => result }
  end
  
  #-------------------------------------------------------------------------

  def get_knob_sets
    result = ProfileHelper.get_knob_sets(params[:id])
    render :json => { :result => result }
  end
  
  #-------------------------------------------------------------------------

  def remove_knob_set
    post_data = request.body.read
    incoming_request = JSON.parse(post_data)
    result = ProfileHelper.remove_knob_set(params[:id], incoming_request)
    render :json => { :result => result }
  end
      
  #-------------------------------------------------------------------------

  def get_a_la_carte_profile
    profile = Profile.find_by_id(params[:id])
    user_guid = session[:user]['generated_uid']
    user = User.find_one(user_guid)
    if user != nil && profile != nil && (user.can_download_adhoc_profiles? && (user.get_adhoc_profiles.include?(profile) || profile.is_from_servermgr))
      profile_plist = ProfileManager.generate_signed_profile(profile, nil, user)
      filename = profile.name.gsub(/\s+/, '_')+".mobileconfig"
      response.headers['Content-Type'] = 'application/x-apple-aspen-config'
      response.headers['Content-Disposition'] = "attachment; filename=\"#{filename}\""
      render :xml => profile_plist
    else 
      render :text => "401 Unauthorized", :status => 401
    end
  end

  #-------------------------------------------------------------------------
  
  def get_raw_profile
    profile = Profile.find_by_id(params[:id])
    user_guid = session[:user]['generated_uid']
    user = User.find_one(user_guid)
    if user != nil && profile != nil && session[:user]['isAdmin']
      profile_plist = ProfileHelper.get_raw_profile(profile.id)
      filename = profile.name.gsub(/\s+/, '_')+".mobileconfig"
      response.headers['Content-Type'] = 'application/x-apple-aspen-config'
      response.headers['Content-Disposition'] = "attachment; filename=\"#{filename}\""
      render :xml => profile_plist
    else 
      render :text => "401 Unauthorized", :status => 401
    end
  end
  
  #-------------------------------------------------------------------------

  def get_signed_profile
    profile = Profile.find_by_id(params[:id])
    user_guid = session[:user]['generated_uid']
    user = User.find_one(user_guid)
    unless user && profile && session[:user]['isAdmin']
      render :text => "401 Unauthorized", :status => 401
      return
    end

    profile_plist = ProfileManager.generate_signed_profile(profile, nil, user, true) # true = manual download
    unless profile_plist
      render :text => "500 Internal Server Error", :status => 500
      return
    end

    filename = profile.name.gsub(/\s+/, '_')+".mobileconfig"
    response.headers['Content-Type'] = 'application/x-apple-aspen-config'
    response.headers['Content-Disposition'] = "attachment; filename=\"#{filename}\""
    render :xml => profile_plist
  end
  
  #-------------------------------------------------------------------------

end
