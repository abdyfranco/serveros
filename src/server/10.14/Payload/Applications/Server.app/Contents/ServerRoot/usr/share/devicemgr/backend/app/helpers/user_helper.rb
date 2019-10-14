#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
module UserHelper
#-------------------------------------------------------------------------

  def self.begin_refresh; MDMUtilities.send_devicemgrd_request({ :command => 'periodicSyncs', :userTriggered => true }, true); end # true = async

  #-------------------------------------------------------------------------

  def self.find_all(remote_guid, selected_item_id = nil)
    user_ids = User.user_ids_for_admin_app()
    user_ids.push(selected_item_id) if !user_ids.include?(selected_item_id) && User.find_by_id(selected_item_id)
    return { :remote => { remote_guid.to_sym => [ user_ids.unshift(:user) ] } }   # Shove the class type at the front of the array
  end # self.find_all

  #-------------------------------------------------------------------------

  def self.find_all_od_users(remote_guid, selected_item_id = nil)
    user_ids = User.od_user_ids_for_admin_app()
    user_ids.push(selected_item_id) if !user_ids.include?(selected_item_id) && User.find_by_id(selected_item_id)
    return { :remote => { remote_guid.to_sym => [ user_ids.unshift(:user) ] } }   # Shove the class type at the front of the array
  end # self.find_all_od_users

  #-------------------------------------------------------------------------

  def self.find_all_unmerged_users(incoming_request, remote_guid, selected_item_id = nil)
    user_id  = incoming_request.delete('item_selection_id')
    user     = User.find_by_id(user_id)
    return {:remote => { remote_guid.to_sym => [] }} unless user

    user_ids = []
    if !user.asm_unique_id_ext.empty? && user.guid.empty?     # find od users
      user_ids = User.unmerged_od_user_ids_for_admin_app()
    elsif user.asm_unique_id_ext.empty? && !user.guid.empty?  # find asm users
      user_ids = User.unmerged_asm_user_ids_for_admin_app()
    end
    user_ids.delete(user_id) if user_ids.include?(user_id)
    return { :remote => { remote_guid.to_sym => [ user_ids.unshift(:user) ] } }   # Shove the class type at the front of the array
  end # self.find_all_unmerged_users

  #-------------------------------------------------------------------------

  def self.find_by_maid(incoming_request)
    maid = User.NormalizeEmail(incoming_request['maid'])
    user = User.find(:first, :conditions => ['managed_apple_id = ?', maid]) if maid
    return { :user => { :retrieved => (user ? [user.get_attributes] : []) } };
  end # self.find_by_maid

  #-------------------------------------------------------------------------

  def self.find_matching(incoming_request, remote_guid, selected_item_id = nil)
    user_ids = User.search_for_users_matching(incoming_request['search_string'], incoming_request['max_results'], incoming_request['refresh_cache'])
    user_ids.push(selected_item_id) if !user_ids.include?(selected_item_id) && User.find_by_id(selected_item_id)
    return { :remote => { remote_guid.to_sym => [ user_ids.unshift(:user) ] } }   # Shove the class type at the front of the array
  end # self.find_matching

  #-------------------------------------------------------------------------

  def self.find_matching_od_users(incoming_request, remote_guid, selected_item_id = nil)
    user_ids = User.search_for_od_users_matching(incoming_request['search_string'], incoming_request['max_results'], incoming_request['refresh_cache'])
    user_ids.push(selected_item_id) if !user_ids.include?(selected_item_id) && User.find_by_id(selected_item_id)
    return { :remote => { remote_guid.to_sym => [ user_ids.unshift(:user) ] } }   # Shove the class type at the front of the array
  end # self.find_matching_od_users

  #-------------------------------------------------------------------------

  def self.find_matching_unmerged_users_detailed(incoming_request, remote_guid, selected_item_id = nil)
    user_id = incoming_request.delete('item_selection_id')
    user = User.find_by_id(user_id)
    return {:remote => { remote_guid.to_sym => [] }} unless user

    user_ids = []
    if !user.asm_unique_id_ext.empty? && user.guid.empty?      # find od users
      user_ids = User.search_for_unmerged_od_users_matching(incoming_request['search_string'], incoming_request['max_results'], incoming_request['refresh_cache'])
    elsif user.asm_unique_id_ext.empty? && !user.guid.empty?   # find asm users
      user_ids = User.search_for_unmerged_asm_users_matching(incoming_request['search_string'], incoming_request['max_results'], incoming_request['refresh_cache'])
    end
    user_ids.delete(user_id) if user_ids.include?(user_id)
    return { :remote => { remote_guid.to_sym => [ user_ids.unshift(:user) ] } }   # Shove the class type at the front of the array
  end # self.find_matching_unmerged_users_detailed

  #-------------------------------------------------------------------------

  def self.find_matching_detailed(incoming_request, remote_guid, selected_item_id = nil)
    return self.find_matching(incoming_request, remote_guid, selected_item_id)
  end

  #-------------------------------------------------------------------------

  # This is used by the admin
  def self.find_me(remote_guid)
    user = User.logged_in_user(:check_od => true)
    return {:remote => {remote_guid.to_sym => (user ? [[:user, user.id]] : []) }}
  end # self.find_me

  #-------------------------------------------------------------------------

  def self.get_all_mac_devices(user_id, remote_guid)
    user = User.find_by_id(user_id)
    return { :user => { :deleted => [{ :id => user_id }] } } unless user

    device_ids = user.get_all_mac_device_ids
    return {:remote => {remote_guid.to_sym => [ device_ids.unshift(:device) ] } }
  end # self.get_all_mac_devices

  #-------------------------------------------------------------------------

  def self.get_all_ios_devices(user_id, remote_guid)
    user = User.find_by_id(user_id)
    return { :user => { :deleted => [{ :id => user_id }] } } unless user

    device_ids = user.get_all_ios_device_ids
    return {:remote => {remote_guid.to_sym => [ device_ids.unshift(:device) ] } }
  end # self.get_all_ios_devices

  #-------------------------------------------------------------------------

  def self.get_all_devices_for_task(incoming_request, remote_guid)
    user_id = incoming_request["user_id"]
    user = User.find_by_id(user_id)
    return { :user => { :deleted => [{ :id => user_id }] } } unless user

    device_ids = user.get_all_device_ids_for_task(incoming_request["task_type"])
    return {:remote => {remote_guid.to_sym => [ device_ids.unshift(:device) ] } }
  end # self.get_all_devices_for_task

  #-------------------------------------------------------------------------

  def self.get_app_license_details(incoming_request);   return { :user => { :retrieved => User::get_app_license_details_for_multiple_by_id(incoming_request['ids']) } };  end
  def self.get_book_license_details(incoming_request);  return { :user => { :retrieved => User::get_book_license_details_for_multiple_by_id(incoming_request['ids']) } }; end
  def self.get_complete_details(incoming_request);      return { :user => { :retrieved => User.get_attributes_for_multiple_by_id(incoming_request['ids'], true) } };      end
  def self.get_details(incoming_request);               return self.get_details_for_multiple(incoming_request);                                                           end
  def self.get_details_for_multiple(incoming_request);  return { :user => { :retrieved => User.get_attributes_for_multiple_by_id(incoming_request['ids']) } };            end

  #-------------------------------------------------------------------------

  def self.get_library_item_tasks(item_id)
    user = User.find_by_id(item_id)
    return { :user => { :deleted => [{ :id => item_id }] } } unless user

    active_task_data, completed_task_data = LibraryItemTask.get_all_tasks_details("User", user.id)
    result = {}
    result[:library_item_task]           = { :retrieved => active_task_data }    if active_task_data    && active_task_data.length    > 0
    result[:completed_library_item_task] = { :retrieved => completed_task_data } if completed_task_data && completed_task_data.length > 0
    return result
  end # self.get_library_item_tasks

  #-------------------------------------------------------------------------

  def self.get_profiles(user_id)
    user = User.find_by_id(user_id)
    return { :user => { :deleted => [{ :id => user_id }] } } unless user

    profiles = []
    if user
      profile = user.profile
      profiles = [profile.get_attributes] if profile
    end
    return { :profile => { :retrieved => profiles } }
  end # self.get_profiles

  #-------------------------------------------------------------------------

  def self.merge_user(incoming_request)
    merge_user_id = incoming_request.delete('merge_user_id')
    merge_user = User.find_by_id(merge_user_id)
    return { :user => { :deleted => [{ :id => merge_user_id }] } } unless merge_user

    user_id = incoming_request.delete('selected_user_id')
    user = User.find_by_id(user_id)
    return { :user => { :deleted => [{ :id => user_id }] } } unless user

    # Merge the two records
    user.merge_user(merge_user_id)
    return { :user => { :updated => [ user.get_attributes(true) ] } }   # Return extended attributes
  end # self.get_profiles

  #-------------------------------------------------------------------------

  def self.perform_vpp_action(incoming_request)
    action  = incoming_request['action']
    user_id = incoming_request['user_id']
    user    = User.find_by_id(user_id)
    return { :user => { :deleted => [{ :id => user_id }] } } unless user

    case action
    when 'sendInvitation'
      if (device_id = incoming_request['device_id']) != nil
        device = Device.find_by_id(device_id)
        return { :device => { :deleted => [{ :id => device_id }] } } unless device
        user.send_vpp_invitation_to_device(device)
      else
        user.send_vpp_invitation_by_email(incoming_request['vpp_email_address'])
      end
    when 'revoke'
      user.revoke_vpp_invitation
    end

    return { :user => { :updated => [ user.get_attributes(true) ] } }   # Return extended attributes
  end # self.perform_vpp_action

  #-------------------------------------------------------------------------

  def self.unmerge_user(incoming_request)
    user_id = incoming_request['selected_user_id']
    keep_od = incoming_request['keep_od']
    user = User.find_by_id(user_id)
    return { :user => { :deleted => [{ :id => user_id }] } } unless user

    # Un-merge the record
    user.unmerge_user(keep_od)
    return { :user => { :updated => [ user.get_attributes(true) ] } }   # Return extended attributes
  end # self.unmerge_user

  #-------------------------------------------------------------------------

  def self.update(user_id, incoming_request)
    user = User.find_by_id(user_id)
    return { :user => { :deleted => [{ :id => user_id }] } } unless user

    # This works inversely of everything else, don't use MDMUtilites here
    return_hash       = {:devices => {}}
    prior_users       = Set.new
    current_id_array  = user.get_related_devices_ids
    incoming_id_array = incoming_request.delete('devices') || []
    remove_id_array   = current_id_array  - incoming_id_array
    new_id_array      = incoming_id_array - current_id_array

    remove_id_array.each { |device_id|
      device = Device.find_by_id(device_id)
      if device
        device.user = nil
        device.save
        device.reload
        return_hash[:devices][:updated] ||= []
        return_hash[:devices][:updated].push(device.get_attributes)
      else
        return_hash[:devices][:deleted] ||= []
        return_hash[:devices][:deleted].push({:id => device_id})
      end
    } # remove_id_array.each

    new_id_array.each { |device_id|
      device = Device.find_by_id(device_id)
      if device
        prior_uid = device.user_id
        prior_users.add(prior_uid) if prior_uid  # Before adding the device to this user, capture the device's previous user
        device.user = user
        device.save
        device.reload
        return_hash[:devices][:updated] ||= []
        return_hash[:devices][:updated].push(device.get_attributes)
      else
        return_hash[:devices][:deleted] ||= []
        return_hash[:devices][:deleted].push({:id => device_id})
      end
    } # new_id_array.each

    # Save away the app and book assignments (don't let update_from_hash see it)
    app_assignments  = incoming_request.delete('apps')
    book_assignments = incoming_request.delete('books')
    incoming_request.delete('app_data')
    incoming_request.delete('book_data')
    incoming_request.delete('is_admin')
    incoming_request.delete('vpp_enabled_devices')
    incoming_request.delete('has_vpp_content_assigned')
    incoming_request.delete('vpp_invitations_count')

    incoming_request.delete('profile')    # A user's profile is not set via this method, and this is often => nil, which causes us to try to disassociate the profile
    incoming_request.delete('library_item_type')
    user.update_from_hash(incoming_request)
    user.save

    user.update_app_assignments(app_assignments)   if app_assignments
    user.update_book_assignments(book_assignments) if book_assignments
    user.reload

    enrollment_settings = incoming_request.delete('enrollment_settings')
    user.update_enrollment_settings(enrollment_settings) if enrollment_settings

    # Update the prior users' records and start push tasks for their lost devices
    prior_users_attr = []
    prior_users.each { |prior_user_id|
      prior_user = User.find_by_id(prior_user_id)
      prior_users_attr.push(prior_user.get_attributes)
    } # prior_users.each

    return return_hash.merge({ :user => { :updated => [ user.get_attributes(true) ] + prior_users_attr } })
  end # self.update

#-------------------------------------------------------------------------
end # module UserHelper
#-------------------------------------------------------------------------
