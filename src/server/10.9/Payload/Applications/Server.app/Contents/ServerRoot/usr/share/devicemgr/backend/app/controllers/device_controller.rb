#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class DeviceController < ApplicationController
  before_filter :verify_device_auth_token, :only => [:start_ota]
  before_filter :verify_device_not_timed_out, :only => [:start_ota, :get_icon_for]
  skip_before_filter :verify_auth_token, :verify_admin_logged_in, :except => [:initialize, :find_all, :find_matching, :set_user]
  skip_before_filter :verify_post, :only => [:start_ota, :get_icon_for]
  skip_before_filter :verify_not_timed_out, :except => [:initialize, :find_all, :find_matching, :set_user]
  before_filter :verify_od_apns
  before_filter :verify_user_portal_access, :only => [:start_ota, :get_icon_for]
  before_filter :verify_admin_logged_in, :only => [:find_all, :find_matching, :set_user]

  #-------------------------------------------------------------------------

  # CK: I think this is unused. I couldn't find anything that pointed to it. The Admin uses the implementation in the cooresponding helper.
  def find_all
    result = DeviceHelper.find_all
    render :json => { :result => result }
  end

  #-------------------------------------------------------------------------

  # CK: I think this is unused. I couldn't find anything that pointed to it. The Admin uses the implementation in the cooresponding helper.
  def find_matching
    post_data = request.body.read
    incoming_request = JSON.parse(post_data)
    result = DeviceHelper.find_matching(incoming_request)
    render :json => { :result => result }
  end

  #-------------------------------------------------------------------------

  # CK: I think this is unused. I couldn't find anything that pointed to it. The Admin sets/unsets users via UserHelper.update.
  def set_user
    post_data = request.body.read
    incoming_request = JSON.parse(post_data)
    result = DeviceHelper.set_user(params[:id], incoming_request)
    render :json => { :result => result }
  end

  #-------------------------------------------------------------------------

  # This is used by the End-user Portal to remove a device that belongs to the logged in User.
  def remove_users_device
    device = Device.find_by_id(params[:id])
    user_guid = session[:user]['generated_uid']
    user = User.find_one(user_guid)
    if user && device && ( (device.user_id == user.id && device.is_mdm_removable? && user.can_enroll_unenroll_devices_via_portal?) || session[:user]['isAdmin'] )
      DeviceHelper.unenroll(device.id)
      # Note, we wont return json, we'll just redirect back to the portal here
      return redirect_to_full_url("/mydevices/", 302)
    else 
      render :text => "401 Unauthorized", :status => 401
    end
  end

  #-------------------------------------------------------------------------

  # This is used by the End-user Portal to retrieve icons for various device types.
  def get_icon_for
    device_type = params[:id]
    encoded_icon = IconManager.get_icon_for(device_type)
    bin_icon = Base64.decode64(encoded_icon)
    response.headers['Content-Type'] = 'image/png'
    render :text => bin_icon
  end

  #-------------------------------------------------------------------------

  # This is used to render the HTML for the End-user Portal
  def start_ota
    # log User-Agent string to MessageTracer
    AslUtility::log_user_agent_to_message_tracer('portal', request.headers['HTTP_USER_AGENT'])

    settings = Settings.get_settings
    if settings.apns_active && !request.ssl?
      redirect_to_full_url("https://#{settings.gethostname}/mydevices", 302)
      return
    end 

    @cur_settings  = settings.get_attributes
    user_session   = session[:user]
    user_guid      = user_session['generated_uid']
    user           = User.find_immediately_by_guid(user_guid)
    @user_is_admin = (user && user.admin?)
    @devices       = []
    @profile_data  = []
    
    @enrollment_profiles = AutoJoinProfile.find(:all, :order=>:name) if @user_is_admin
    @show_trust          = (!Settings.get_settings.ssl_cert_is_trusted || !Settings.get_settings.signing_cert_is_trusted) && user.can_enroll_unenroll_devices_via_portal?
    @server_organization = Settings.get_settings.server_organization

    if user
      @last_txid_snapshot = MagicController.get_next_get_updated_info()
      @task_privileges    = user.task_privileges

      @profile_data_json = []
      if user.can_download_adhoc_profiles?
        @profile_data      = self.collect_profile_attributes_for_portal(user.get_adhoc_profiles)
        @profile_data_json = self.escape_json_for_html(JSON.generate(@profile_data))
      end

      @allow_enrollment_via_portal = user.can_enroll_unenroll_devices_via_portal?
      devices = (user.devices || []).sort { |a,b| -(a.created_at <=> b.created_at) }
      devices = devices.select { |device| device.bound_device? && device.enrollment_state != 'unenrollment_pending'}
      devices = devices.collect { |d| 
        rv = d.get_attributes
        task = LibraryItemTask.first(:conditions => {:target_id => d.id, :target_class => 'Device', :task_type => ['DeviceLock','ClearPasscode','EraseDevice']}, :order => 'completed_at DESC NULLS LAST, updated_at DESC')
        rv['last_task'] = task.get_attributes if task
        rv
      }
      @devices_json = self.escape_json_for_html(JSON.generate(devices))
      
    end    
  end

  #-------------------------------------------------------------------------

end
