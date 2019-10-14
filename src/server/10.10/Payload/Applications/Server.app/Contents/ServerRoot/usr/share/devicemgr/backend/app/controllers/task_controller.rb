#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class TaskController < ApplicationController

  skip_before_filter :verify_admin_logged_in, :only => [:start_task_from_portal]
  before_filter :verify_user_portal_access, :only => [:start_task_from_portal]

  #-------------------------------------------------------------------------

  def start_task_from_portal
    u_session = session[:user]
    unless u_session
      render :status => 403, :text => ''
      return
    end

    user = User.find_one(u_session['generated_uid'])
    target_device = Device.find(params[:target_id])
    if user != nil && (u_session['isAdmin'] || user == target_device.user)
      task_type = params[:task_type]
      task_privileges = user.task_privileges
      can_perform_task = (task_type == 'DeviceLock'    && task_privileges['lock_device']) ||
                         (task_type == 'EraseDevice'   && task_privileges['wipe_device']) ||
                         (task_type == 'ClearPasscode' && task_privileges['clear_passcode'])

      Rails.logger.warn("task type #{task_type}, can_perform_task: #{can_perform_task}, task_privileges: #{task_privileges}")
      if can_perform_task
        LibraryItemTaskHelper.start_task({
         "target_class" => "Device",
         "target_id"    => params[:target_id].to_i,
         "params"       => { "PIN" => params[:pin] },
         "task_type"    => task_type
        }, 'ignored_string')

        render :status => 200, :text => ''
      else
        Rails.logger.error("The logged in user is not allowed to perform this task (#{u_session})")
        render :template => '403'
      end
    else
      Rails.logger.warn("User with guid #{u_session['generated_uid']} attempted an illegal #{params[:task_type]} task against device #{params[:target_id]}.")
      render :text => "405 Method Not Supported", :status => 405
    end
  end

  #-------------------------------------------------------------------------

end
