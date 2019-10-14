#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
module EduClassHelper
#-------------------------------------------------------------------------

  def self.begin_refresh
    MDMUtilities.send_devicemgrd_request({ :command => 'depStartSync', :forceFull => false, :userTriggered => true }, true) # Trigger an incremental DEP sync, true = async
  end # self.begin_refresh

  #-------------------------------------------------------------------------

  def self.create(incoming_request)
    edu_class = EduClass.new
    edu_class.update_from_hash(incoming_request)
    edu_class.save
    return { :edu_class => { :created => [ edu_class.get_attributes(true) ] } }
  end # self.create

  #-------------------------------------------------------------------------

  def self.destroy(edu_class_id)
    edu_class = EduClass.find_by_id(edu_class_id)
    edu_class.delete if edu_class
    return { :edu_class => { :deleted => [ { :id => edu_class_id } ] } }
  end # self.destroy

  #-------------------------------------------------------------------------

  def self.get_library_item_tasks(item_id)
    active_task_data, completed_task_data = LibraryItemTask.get_all_tasks_details('EduClass', item_id)
    result = {}
    result[:library_item_task]           = { :retrieved => active_task_data }     unless active_task_data.empty?
    result[:completed_library_item_task] = { :retrieved => completed_task_data }  unless completed_task_data.empty?
    return result
  end # self.get_library_item_tasks

  #-------------------------------------------------------------------------

  def self.get_complete_details(incoming_request)
    data = EduClass::get_attributes_for_multiple_by_id(incoming_request['ids'], true)
    return { :edu_class => { :retrieved => data } }
  end # self.get_complete_details

  #-------------------------------------------------------------------------

  def self.get_details(incoming_request); return self.get_details_for_multiple(incoming_request); end

  #-------------------------------------------------------------------------

  def self.get_details_for_multiple(incoming_request)
    data = EduClass.get_attributes_for_multiple_by_id(incoming_request['ids'])
    return { :edu_class => { :retrieved => data } }
  end # self.get_details_for_multiple

  #-------------------------------------------------------------------------

  def self.find_all(remote_guid, selected_item_id = nil)
    edu_class_array = EduClass.get_all_ids_for_admin
    edu_class_array.unshift(:edu_class)
    return { :remote => { remote_guid.to_sym => [ edu_class_array ] } }
  end # self.find_all

  #-------------------------------------------------------------------------

  def self.find_matching(incoming_request, remote_guid, selected_item_id = nil)
    edu_class_array = EduClass.get_all_ids_for_admin(incoming_request['search_string'])
    edu_class_array.unshift(:edu_class)
    return { :remote => { remote_guid.to_sym => [ edu_class_array ] } }
  end # self.find_matching

  #-------------------------------------------------------------------------

  def self.find_matching_detailed(incoming_request, remote_guid, selected_item_id = nil)
    return self.find_matching(incoming_request, remote_guid, selected_item_id)
  end # self.find_matching_detailed

  #-------------------------------------------------------------------------

  # find_matching_*_ids are used to search device groups, students and
  # instructors (user and user groups) assigned to a class
  def self.find_matching_device_group_ids(incoming_request, remote_guid)
    id = incoming_request.delete('target_id')
    edu_class = EduClass.find_by_id(id);
    return { :edu_class => { :deleted => [ { :id => id } ] } } unless edu_class

    search_string = incoming_request.delete('search_string')
    edu_class_array = edu_class.find_device_group_ids_for_admin(search_string)
    edu_class_array.unshift(:device_group)
    return { :remote => { remote_guid.to_sym => [ edu_class_array ] } }
  end # self.find_matching_device_group_ids

  #-------------------------------------------------------------------------

  def self.find_matching_instructor_ids(incoming_request, remote_guid)
    id = incoming_request.delete('target_id')
    edu_class = EduClass.find_by_id(id);
    return { :edu_class => { :deleted => [ { :id => id } ] } } unless edu_class

    instructor_array       = []
    instructor_group_array = []
    search_string          = incoming_request.delete('search_string')
    instructor_array       = edu_class.find_instructor_ids_for_admin(User.table_name, search_string)
    instructor_group_array = edu_class.find_instructor_ids_for_admin(UserGroup.table_name, search_string)
    return { :remote => { remote_guid.to_sym => [ instructor_array.unshift(:user),  instructor_group_array.unshift(:user_group)] } }
  end # self.find_matching_instructor_ids

  #-------------------------------------------------------------------------

  def self.find_matching_student_ids(incoming_request, remote_guid)
    id = incoming_request.delete('target_id')
    edu_class = EduClass.find_by_id(id);
    return { :edu_class => { :deleted => [ { :id => id } ] } } unless edu_class

    student_array       = []
    student_group_array = []
    search_string       = incoming_request.delete('search_string')
    student_array       = edu_class.find_student_ids_for_admin(User.table_name, search_string)
    student_group_array = edu_class.find_student_ids_for_admin(UserGroup.table_name, search_string)
    return { :remote => { remote_guid.to_sym => [ student_array.unshift(:user),  student_group_array.unshift(:user_group)] } }
  end # self.find_matching_student_ids

  #-------------------------------------------------------------------------

  def self.update(edu_class_id, incoming_request)
    edu_class = EduClass.find_by_id(edu_class_id)
    return { :edu_class => { :deleted => [ { :id => edu_class_id } ] } } unless edu_class

    # If admin omits any of the instructor, students or devices keys in the request all the association would be removed
    students          = incoming_request.delete('students')          || []
    student_groups    = incoming_request.delete('student_groups')    || []
    instructors       = incoming_request.delete('instructors')       || []
    instructor_groups = incoming_request.delete('instructor_groups') || []
    device_groups     = incoming_request.delete('device_groups')     || []

    edu_class.update_from_hash(incoming_request)
    edu_class.save
    edu_class.reload

    edu_class.update_edu_class_students_and_instructors(students, instructors)
    edu_class.update_edu_class_student_and_instructor_groups(student_groups, instructor_groups)
    edu_class.update_edu_class_devices(device_groups)

    return { :edu_class => { :updated => [ edu_class.get_attributes(true) ] } }
  end # self.update

#-------------------------------------------------------------------------
end # EduClassHelper
#-------------------------------------------------------------------------
