#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
module UserGroupHelper
#-------------------------------------------------------------------------

  def self.begin_refresh; MDMUtilities.send_devicemgrd_request({ :command => 'periodicSyncs', :userTriggered => true }, true); end # true = async

  #-------------------------------------------------------------------------

  def self.find_all(remote_guid, selected_item_id = nil)
    record_array = UserGroup.user_group_ids_for_admin_app()
    record_array.push(selected_item_id) if !record_array.include?(selected_item_id) && UserGroup.find_by_id(selected_item_id)
    record_array.unshift(:user_group)       # Shove the class type at the front of the array
    return { :remote => { remote_guid.to_sym => [ record_array ] } }
  end # self.find_all

  #-------------------------------------------------------------------------

  def self.find_all_od_user_groups(remote_guid, selected_item_id = nil)
    record_array = UserGroup.od_user_group_ids_for_admin_app()
    record_array.push(selected_item_id) if !record_array.include?(selected_item_id) && UserGroup.find_by_id(selected_item_id)
    record_array.unshift(:user_group)       # Shove the class type at the front of the array
    return { :remote => { remote_guid.to_sym => [ record_array ] } }
  end # self.find_all_od_user_groups

  #-------------------------------------------------------------------------

  def self.find_all_vpp_enabled(remote_guid)
    record_array = UserGroup.vpp_enabled_user_group_ids_for_admin_app()
    record_array.unshift(:user_group)       # Shove the class type at the front of the array
    return { :remote => { remote_guid.to_sym => [ record_array ] } }
  end # self.find_all_vpp_enabled

  #-------------------------------------------------------------------------

  def self.find_matching(incoming_request, remote_guid, selected_item_id = nil)
    user_group_records = UserGroup.search_for_user_groups_matching(incoming_request['search_string'], incoming_request['max_results'], incoming_request['refresh_cache'])
    user_group_records.push(selected_item_id) if !user_group_records.include?(selected_item_id) && UserGroup.find_by_id(selected_item_id)
    user_group_records.unshift(:user_group)       # Shove the class type at the front of the array
    return { :remote => { remote_guid.to_sym => [ user_group_records ] } }
  end # self.find_matching

  #-------------------------------------------------------------------------

  def self.find_matching_od_user_groups(incoming_request, remote_guid, selected_item_id = nil)
    user_group_records = UserGroup.search_for_od_user_groups_matching(incoming_request['search_string'], incoming_request['max_results'], incoming_request['refresh_cache'])
    user_group_records.push(selected_item_id) if !user_group_records.include?(selected_item_id) && UserGroup.find_by_id(selected_item_id)
    user_group_records.unshift(:user_group)       # Shove the class type at the front of the array
    return { :remote => { remote_guid.to_sym => [ user_group_records ] } }
  end # self.find_matching_od_user_groups

  #-------------------------------------------------------------------------

  def self.find_matching_vpp_enabled(incoming_request, remote_guid)
    user_group_records = UserGroup.search_for_vpp_enabled_user_groups_matching(incoming_request['search_string'])
    user_group_records.unshift(:user_group)       # Shove the class type at the front of the array
    return { :remote => { remote_guid.to_sym => [ user_group_records ] } }
  end # self.find_matching_vpp_enabled

  #-------------------------------------------------------------------------

  def self.find_matching_detailed(incoming_request, remote_guid, selected_item_id = nil); return self.find_matching(incoming_request, remote_guid, selected_item_id);                                                   end
  def self.get_app_license_details(incoming_request);                                     return { :user_group => { :retrieved => UserGroup::get_app_license_details_for_multiple_by_id(incoming_request['ids']) } };   end
  def self.get_book_license_details(incoming_request);                                    return { :user_group => { :retrieved => UserGroup::get_book_license_details_for_multiple_by_id(incoming_request['ids']) } };  end
  def self.get_complete_details(incoming_request);                                        return { :user_group => { :retrieved => UserGroup.get_attributes_for_multiple_by_id(incoming_request['ids'], true) } };       end
  def self.get_details(incoming_request);                                                 return self.get_details_for_multiple(incoming_request);                                                                       end
  def self.get_details_for_multiple(incoming_request);                                    return { :user_group => { :retrieved => UserGroup.get_attributes_for_multiple_by_id(incoming_request['ids']) } };             end

  #-------------------------------------------------------------------------

  def self.get_profiles(user_group_id)
    user_group = UserGroup.find_by_id(user_group_id)
    return { :user_group => { :deleted => [{ :id => user_group_id }] } } unless user_group

    profiles = []
    if user_group
      profile = user_group.profile
      profiles = [profile.get_attributes] if profile
    end
    return { :profile=> { :retrieved => profiles } }
  end # self.get_profiles

  #-------------------------------------------------------------------------

  def self.get_library_item_tasks(item_id)
    user_group = UserGroup.find_by_id(item_id)
    return { :user_group => { :deleted => [{ :id => item_id }] } } unless user_group

    active_task_data, completed_task_data = LibraryItemTask.get_all_tasks_details('UserGroup', user_group.id)
    result = {}
    result[:library_item_task]           = { :retrieved => active_task_data }    if active_task_data    && active_task_data.length    > 0
    result[:completed_library_item_task] = { :retrieved => completed_task_data } if completed_task_data && completed_task_data.length > 0
    return result
  end # self.get_library_item_tasks

  #-------------------------------------------------------------------------

  def self.get_all_mac_devices(user_group_id, remote_guid)
    user_group = UserGroup.find_by_id(user_group_id)
    return { :user_group => { :deleted => [{ :id => user_group_id }] } } unless user_group

    device_ids = user_group.get_all_mac_device_ids
    return {:remote => {remote_guid.to_sym => [ device_ids.unshift(:device) ] } }
  end # self.get_all_mac_devices

  #-------------------------------------------------------------------------

  def self.get_all_ios_devices(user_group_id, remote_guid)
    user_group = UserGroup.find_by_id(user_group_id)
    return { :user_group => { :deleted => [{ :id => user_group_id }] } } unless user_group

    device_ids = user_group.get_all_ios_device_ids
    return {:remote => {remote_guid.to_sym => [ device_ids.unshift(:device) ] } }
  end # self.get_all_ios_devices

  #-------------------------------------------------------------------------

  def self.get_all_devices_for_task(incoming_request, remote_guid)
    user_group_id = incoming_request['user_group_id']
    user_group = UserGroup.find_by_id(user_group_id)
    return { :user_group => { :deleted => [{ :id => user_group_id }] } } unless user_group

    device_ids = user_group.get_all_device_ids_for_task(incoming_request['task_type'])
    return {:remote => {remote_guid.to_sym => [ device_ids.unshift(:device) ] } }
  end # self.get_all_devices_for_task

  #-------------------------------------------------------------------------

  def self.perform_vpp_action(incoming_request)
    action  = incoming_request['action']
    ug_id   = incoming_request['user_group_id']
    which   = incoming_request['user_type']       # 'uninvited' | 'unenrolled'
    ug      = UserGroup.find_by_id(ug_id)
    return { :user_group => { :deleted => [{ :id => ug_id }] } } unless ug

    case action
    when 'sendEmailInvitations'
      ug.send_vpp_invitation_by_email(which)
    when 'sendDeviceInvitations'
      ug.send_vpp_invitation_to_devices(which)
    when 'revoke'
      ug.revoke_vpp_invitations
    end

    return { :user_group => { :updated => [ ug.get_attributes(true) ] } }   # Return extended attributes
  end # self.perform_vpp_action

  #-------------------------------------------------------------------------

  def self.update(user_group_id, incoming_request)
    user_group = UserGroup.find_by_id(user_group_id)
    return { :user_group => { :deleted => [{ :id => user_group_id }] } } unless user_group

    # Save away the app & book assignments (don't let update_from_hash see it)
    app_assignments  = incoming_request.delete('apps')
    book_assignments = incoming_request.delete('books')
    incoming_request.delete('app_data')   # Don't pass this through, either, in case the admin sent it back to us.
    incoming_request.delete('book_data')

    incoming_request.delete('profile')    # A user's profile is not set via this method, and this is often => nil, which causes us to try to disassociate the profile
    incoming_request.delete('library_item_type')

    user_group.make_active if user_group.library_item_type == 'InactiveUserGroup' && (user_group.privileges != 0 || user_group.vpp_service_enabled)  # Force it active

    user_group.update_from_hash(incoming_request)
    user_group.save
    user_group.reload

    user_group.update_app_assignments(app_assignments)   if app_assignments
    user_group.update_book_assignments(book_assignments) if book_assignments

    enrollment_settings = incoming_request.delete('enrollment_settings')
    user_group.update_enrollment_settings(enrollment_settings) if enrollment_settings

    return { :user_group => { :updated => [ user_group.get_attributes(true) ] } }
  end # self.update

#-------------------------------------------------------------------------
end # module UserGroupHelper
#-------------------------------------------------------------------------
