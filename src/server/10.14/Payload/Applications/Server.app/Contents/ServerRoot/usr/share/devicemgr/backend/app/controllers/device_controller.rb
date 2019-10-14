#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
class DeviceController < ApplicationController
#-------------------------------------------------------------------------

  before_filter :verify_device_auth_token, :only => [:start_ota]
  before_filter :verify_device_not_timed_out, :only => [:start_ota, :get_icon_for]
  skip_before_filter :verify_auth_token, :verify_admin_logged_in, :except => [:initialize, :find_all, :find_matching, :set_user]
  skip_before_filter :verify_post, :only => [:start_ota, :get_icon_for, :get_encryped_prk]
  skip_before_filter :verify_not_timed_out, :except => [:initialize, :find_all, :find_matching, :set_user]
  before_filter :verify_apns
  before_filter :verify_user_portal_access, :only => [:start_ota, :get_icon_for]
  before_filter :verify_admin_logged_in, :only => [:find_all, :find_matching, :set_user]

  #-------------------------------------------------------------------------

  # This is used by the End-user Portal to retrieve icons for various device types.
  def get_icon_for
    response.headers['Content-Type'] = 'image/png'
    render :text => Base64.decode64(IconManager.get_icon_for(params[:id]))
  end # get_icon_for

  #-------------------------------------------------------------------------

  # This is used by the End-user Portal to remove a device that belongs to the logged in User.
  def remove_users_device
    device = Device.find_by_id(Integer(params[:id]))
    user = User.logged_in_user(:refresh => false)     # Don't refresh from OD each time this is called
    if user && device && ( (device.user_id == user.id && device.is_mdm_removable? && user.can_enroll_unenroll_devices_via_portal?) || session[:user][:isAdmin] )
      DeviceHelper.unenroll(device.id)
      # Note, we won't return json, we'll just redirect back to the portal here
      return redirect_to_full_url('/mydevices/', 302)
    else
      render :text => '401 Unauthorized', :status => 401
    end
  end # remove_users_device

  #-------------------------------------------------------------------------

  # This is used to render the HTML for the End-user Portal
  def start_ota
    # log User-Agent string to MessageTracer
    AslUtility::log_user_agent_to_message_tracer('portal', request.headers['HTTP_USER_AGENT'])

    settings = Settings.get_settings
    if settings.apns_active && !request.ssl? && request.headers['HTTP_X_FORWARDED_PROTO'] != 'https'
      redirect_to_full_url("https://#{settings.gethostname}/mydevices", 302)
      return
    end

    @app_uri_root      = PM_WEBAPP_URI_ROOT
    @mdm_uri_root      = PM_MDM_URI_ROOT
    @static_uri_root   = PM_STATIC_URI_ROOT
    @cur_settings      = settings.get_attributes
    user               = User.logged_in_user(:check_od => true)     # We might need sync this user from OD into the database
    @user_is_admin     = (user && user.admin?)
    @devices           = []
    @profile_data      = []
    @trust_profile_url = settings.trust_profile_url

    @enrollment_profiles = AutoJoinProfile.find(:all, :order=>:name) if @user_is_admin
    @server_organization = settings.server_organization

    # UI conditions
    if user
      @last_txid_snapshot = MagicController.get_next_get_updated_info()
      @task_privileges    = user.task_privileges

      @profile_data_json = '[]'
      if user.can_download_adhoc_profiles?
        @profile_data      = self.collect_profile_attributes_for_portal(user.get_adhoc_profiles)
        @profile_data_json = JSON.generate(@profile_data).escape_json_for_html
      end

      @allow_enrollment_via_portal = user.can_enroll_unenroll_devices_via_portal?
      @can_download_adhoc_profiles = user.can_download_adhoc_profiles?
      devices = (user.devices || []).sort { |a,b| -(a.created_at <=> b.created_at) }
      devices = devices.select { |device| device.bound_device? && device.enrollment_state != 'unenrollment_pending'}
      devices = devices.collect { |d|
        rv = d.get_attributes
        rv['is_mdm_removable'] = d.is_mdm_removable?
        task = LibraryItemTask.first(:conditions => { :target_id    => d.id,
                                                      :target_class => 'Device',
                                                      :task_type    => ['DeviceLock','ClearPasscode','EraseDevice']},
                                     :order      => 'completed_at DESC NULLS LAST, updated_at DESC')
        rv['last_task'] = task.get_attributes if task
        rv
      } # devices.collect
      @devices_json = JSON.generate(devices).escape_json_for_html

      # show tabs if the user can see both the profiles and devices section, else hide the tabs.
      # we show the assigned devices (hence the devices tab) even if the user doesn't have enroll permissions.
      @show_tabs = @cur_settings['apns_active'] && user.can_download_adhoc_profiles?
    end
  end # start_ota

#-------------------------------------------------------------------------

  def get_encryped_prk
    device = Device.find_by_id(Integer(params[:id]))
    if device
      metadata = device.library_item_metadata
      if metadata['SecurityInfo']
        response.headers['Content-Type'] = 'application/x-apple-encrypted-prk'
        response.headers['Content-Disposition'] = 'attachment; filename="personal_recovery_key.dat"'
        render :text => metadata['SecurityInfo']['FDE_PersonalRecoveryKeyCMS']
      else
        render :text => "404 Personal recovery key not found", :status => 404  
      end
    else
      render :text => "404 Device not found", :status => 404
    end
  end # get_encryped_prk

#-------------------------------------------------------------------------
end # class DeviceController
#-------------------------------------------------------------------------
