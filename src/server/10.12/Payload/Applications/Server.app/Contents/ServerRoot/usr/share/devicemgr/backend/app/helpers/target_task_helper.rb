#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

module TargetTaskHelper

  #-------------------------------------------------------------------------

  def self.get_complete_details(incoming_request)
    task_data = TargetTask::get_attributes_for_multiple_by_id(incoming_request['ids'], true)
    return { :target_task => { :retrieved => task_data } }
  end

  #-------------------------------------------------------------------------

  def self.find_all(incoming_request, remote_guid)
    search = incoming_request['search_string'] || incoming_request    # This one's a bit different from the others
    target_tasks = TargetTask.find_all_ids_for_library_item_task_id(search['library_item_task_id'], search['sort'])
    target_tasks.unshift(:target_task)
    return { :remote => { remote_guid.to_sym => [ target_tasks ] } }
  end

  #-------------------------------------------------------------------------

  def self.get_details(incoming_request)
    return self.get_details_for_multiple(incoming_request)
  end

  #-------------------------------------------------------------------------

  def self.get_details_for_multiple(incoming_request)
    task_data = TargetTask::get_attributes_for_multiple_by_id(incoming_request['ids'])
    return { :target_task => { :retrieved => task_data } }
  end

  #-------------------------------------------------------------------------

  # def self.cancel_task(task_id)
  #   return nil unless SettingsHelper.verify_od_apns
  #
  #   task = TargetTask.find_by_id(task_id)
  #   return nil unless task
  #
  #   task.cancel
  #   MDMAuditor::task_canceled(nil, task)
  #   return { :task => { :retrieved => [ task.get_attributes ] } }
  # end

  #-------------------------------------------------------------------------

end
