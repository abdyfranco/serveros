# encoding: utf-8
#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

module MDMAuditor

  AuditCreateProfile   = "Created Profile"
  AuditDeleteProfile   = "Deleted Profile"
  AuditUpdateProfile   = "Update Profile"
  AuditAddRecipient    = "Added Recipient"
  AuditRemoveRecipient = "Removed Recipient"

  AuditStartedTask      = "Started Task"
  AuditCompletedTask    = "Completed Task"
  AuditCompletedSubTask = "---Completed Sub-Task"
  AuditCanceledTask     = "Canceled Task"

  EditsLog = 0x15   # Notice level
  TasksLog = 0x25   # Notice level

  #-------------------------------------------------------------------------

  def self.profile_added_recipients(session, profile, recipients)
    return if recipients.nil? || recipients.empty?
    info = self.collect_recipients(recipients)
    self.profile_log(session, profile, AuditAddRecipient, info)
  end

  #-------------------------------------------------------------------------

  def self.profile_created(session, profile)
    self.profile_log(session, profile, AuditCreateProfile)
  end

  #-------------------------------------------------------------------------

  def self.profile_deleted(session, profile)
    self.profile_log(session, profile, AuditDeleteProfile)
  end

  #-------------------------------------------------------------------------

  def self.profile_removed_recipients(session, profile, recipients)
    return if recipients.nil? || recipients.empty?
    info = self.collect_recipients(recipients)
    self.profile_log(session, profile, AuditRemoveRecipient, info)
  end

  #-------------------------------------------------------------------------

  def self.profile_updated(session, profile, info = nil)
    self.profile_log(session, profile, AuditUpdateProfile, info)
  end

  #-------------------------------------------------------------------------

  def self.task_canceled(session, task)
    self.task_log(session, task, AuditCanceledTask)
  end

  #-------------------------------------------------------------------------

  def self.task_completed(session, task, success = nil)
    return if task.parent_task && !MDMLogger.debugOutput? # Don't record the sub-tasks unless we're in debugOutput
    success = task.succeeded? if success.nil?
    msg = self.task_log(session, task, (task.parent_task ? AuditCompletedSubTask : AuditCompletedTask), (success ? "SUCCEEDED" : "FAILED"))
    self.log_audit(TasksLog, msg)
  end

  #-------------------------------------------------------------------------

  def self.task_started(session, task)
    msg = self.task_log(session, task, AuditStartedTask, nil)
    self.log_audit(TasksLog, msg)
  end

  #-------------------------------------------------------------------------
  protected
  #-------------------------------------------------------------------------

  def self.collect_recipients(recipients)
    info = recipients.collect { |r| MDMLogger.object_info(r) }
    return info
  end

  #-------------------------------------------------------------------------

  def self.profile_log(session, profile, action, info = nil)
    msg = "#{action} '#{profile.name}' (#{profile.id})"
    msg += " by #{session[:user]['shortname']} (#{session[:user]['generated_uid']})" if session && session[:user]
    if info && info.length > 0
      if info.class == Array
        msg  = "#{msg} Info:\n\t#{info.join("\n\t")}"
      else
        msg  = "#{msg} Info: #{info}"
      end
    end
    self.log_audit(EditsLog, msg)
  end

  #-------------------------------------------------------------------------

  def self.sub_task_log(task, indent = "")
    msg = ""
    task.sub_tasks.each { |st|
      msg += "\n" + self.task_log(nil, st, "#{indent}Sub-task", nil)
      msg += self.sub_task_log(st, "#{indent}..") if st.container_task # Recursively log the sub tasks
    }
    return msg
  end

  #-------------------------------------------------------------------------

  def self.task_log(session, task, action, info = nil)
    msg  = "#{action} #{task.log_to_s(MDMLogger.debugOutput?)}"
    msg += " by #{session[:user]['shortname']} (#{session[:user]['generated_uid']})" if session && session[:user]
    if info && info.length > 0
      if info.class == Array
        msg  = "#{msg}:\n\t#{info.join("\n\t")}"
      else
        msg  = "#{msg}: #{info}"
      end
    end
    return msg
  end

  #-------------------------------------------------------------------------

  def self.log_audit(log, msg)
    msg = msg.gsub(/\000/, "<nul>")
    AslUtility::log_string(log, msg)
    Rails.logger.info("AUDIT: #{msg}") if MDMLogger.debugOutput?
  end

  #-------------------------------------------------------------------------

end
