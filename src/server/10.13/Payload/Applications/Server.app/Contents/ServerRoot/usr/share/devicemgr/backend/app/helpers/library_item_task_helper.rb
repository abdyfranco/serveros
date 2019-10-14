#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
module LibraryItemTaskHelper
#-------------------------------------------------------------------------

  def self.cancel_task(task_id)
    return nil unless SettingsHelper.verify_apns

    task = LibraryItemTask.find_by_id(task_id)
    return nil unless task

    task.cancel
    MDMAuditor::task_canceled(nil, task)
    return { :library_item_task => { :retrieved => [ task.get_attributes ] } }
  end # self.cancel_task

  #-------------------------------------------------------------------------

  # Remote Query
  def self.find_all_active(remote_guid)
    return { :remote => {remote_guid.to_sym => []} } unless SettingsHelper.verify_apns

    task_array = LibraryItemTask.all_task_ids_for_admin(false) # completed = false
    task_array.unshift(:library_item_task)
    return (task_array == nil ? { :remote => {remote_guid.to_sym => []} } : { :remote => { remote_guid.to_sym => [ task_array ] } })
  end # self.find_all_active

  #-------------------------------------------------------------------------

  # Remote Query
  def self.find_all_completed(remote_guid)
    return { :remote => {remote_guid.to_sym => []} } unless SettingsHelper.verify_apns

    task_array = LibraryItemTask.all_task_ids_for_admin(true) # completed = true
    task_array.unshift(:completed_library_item_task)
    return (task_array == nil ? { :remote => {remote_guid.to_sym => []} } : { :remote => { remote_guid.to_sym => [ task_array ] } })
  end # self.find_all_completed

  #-------------------------------------------------------------------------

  # Remote Query
  def self.find_matching(incoming_request, remote_guid, selected_item_id = nil)
    return nil unless SettingsHelper.verify_apns

    completed  = (incoming_request.key?('completed') && incoming_request['completed'] ? true : false);
    task_array = LibraryItemTask.find_task_ids_for_admin(incoming_request['search_string'], completed)
    task_array.unshift(completed ? :completed_library_item_task : :library_item_task)
    return (task_array == nil ? nil : { :remote => { remote_guid.to_sym => [ task_array ] } })
  end # self.find_matching

  #-------------------------------------------------------------------------

  def self.find_matching_detailed(incoming_request, remote_guid, selected_item_id = nil)
    return self.find_matching(incoming_request, remote_guid, selected_item_id)
  end

  #-------------------------------------------------------------------------

  def self.get_complete_details(incoming_request)
    active_task_data, completed_task_data = LibraryItemTask::get_active_and_completed_attributes_for_multiple_by_id(incoming_request['ids'], true)
    result = {}
    result[:library_item_task]           = { :retrieved => active_task_data }    if active_task_data    && active_task_data.length    > 0
    result[:completed_library_item_task] = { :retrieved => completed_task_data } if completed_task_data && completed_task_data.length > 0
    return result
  end # self.get_complete_details

  #-------------------------------------------------------------------------

  def self.get_details(incoming_request)
    return self.get_details_for_multiple(incoming_request)
  end

  #-------------------------------------------------------------------------

  def self.get_details_for_multiple(incoming_request)
    active_task_data, completed_task_data = LibraryItemTask::get_active_and_completed_attributes_for_multiple_by_id(incoming_request['ids'])
    result = {}
    result[:library_item_task]           = { :retrieved => active_task_data }    if active_task_data    && active_task_data.length    > 0
    result[:completed_library_item_task] = { :retrieved => completed_task_data } if completed_task_data && completed_task_data.length > 0
    return result
  end # self.get_details_for_multiple

  #-------------------------------------------------------------------------

  def self.start_task(incoming_request, remote_guid)
    return nil unless SettingsHelper.verify_apns

    valid_target_types = ['User', 'UserGroup', 'Profile', 'Device', 'DeviceGroup', 'EduClass'] | MDMUtilities.knob_set_class_names
    target_class = incoming_request['target_class']
    if valid_target_types.include?(target_class)
      target = Kernel.const_get(target_class).find_by_id(incoming_request['target_id'])
      unless target
        Rails.logger.error "no target with class: #{target_class} and id: #{incoming_request['target_id']}"
        return { target_class => { :deleted => [ { :id => incoming_request['target_id'] } ] }, :remote => { remote_guid.to_sym => [] } }
      end

      # Filter targets based on the task type and the library item
      task_type  = incoming_request['task_type']
      admin_guid = User.logged_in_user_guid
      tethered   = (incoming_request['tethered'] === true)
      Rails.logger.error("start_task: admin_guid = #{admin_guid}, tethered = #{tethered}")

      task = LibraryItemTask.create(target, task_type, incoming_request['params'], admin_guid, tethered)
      return (task ? { :library_item_task => { :created => [task.get_attributes] },
                       :remote            => { remote_guid.to_sym => [ [:library_item_task, task.id] ] }  }
                   : { :remote => {remote_guid.to_sym => []} })
    else
      Rails.logger.error("Attempting to start a task for an invalid type: #{incoming_request}")
      return nil
    end
  end # self.start_task

  #-------------------------------------------------------------------------

  def self.regenerate_edu_class_certificates()
    LibraryItemTask.regenerate_edu_class_certificate();
    return nil
  end # self.regenerate_edu_class_certificates

#-------------------------------------------------------------------------
end # module LibraryItemTaskHelper
#-------------------------------------------------------------------------
