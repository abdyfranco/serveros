#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

module UserHelper

  #-------------------------------------------------------------------------

  def self.begin_refresh
    MDMUtilities.send_devicemgrd_request({ :command => "periodicSyncs" }, true) # true = async
  end
  
  #-------------------------------------------------------------------------

  def self.find_all(remote_guid)
    user_ids = User.user_ids_for_admin_app()
    return { :remote => { remote_guid.to_sym => [ user_ids.unshift(:user) ] } }   # Shove the class type at the front of the array
  end
  
  #-------------------------------------------------------------------------

  def self.find_matching(incoming_request, remote_guid)
    user_ids = User.search_for_users_matching(incoming_request["search_string"], incoming_request["max_results"], incoming_request['refresh_cache'])
    return { :remote => { remote_guid.to_sym => [ user_ids.unshift(:user) ] } }   # Shove the class type at the front of the array
  end

  #-------------------------------------------------------------------------

  def self.find_matching_detailed(incoming_request, remote_guid)
    return self.find_matching(incoming_request, remote_guid)
  end

  #-------------------------------------------------------------------------

  def self.find_me(remote_guid)
    session = User.session
    user = session && session[:user] && session[:user]['generated_uid'] && User.find_one(session[:user]['generated_uid'])
    return {:remote => {remote_guid.to_sym => (user ? [[:user, user.id]] : []) }}
  end

  #-------------------------------------------------------------------------

  def self.get_all_mac_devices(user_id, remote_guid)
    user = User.find_by_id(user_id)
    return { :user => { :deleted => [{ :id => user_id }] } } unless user

    device_ids = user.get_all_mac_device_ids
    return {:remote => {remote_guid.to_sym => [ device_ids.unshift(:device) ] } }
  end

  #-------------------------------------------------------------------------

  def self.get_all_ios_devices(user_id, remote_guid)
    user = User.find_by_id(user_id)
    return { :user => { :deleted => [{ :id => user_id }] } } unless user

    device_ids = user.get_all_ios_device_ids
    return {:remote => {remote_guid.to_sym => [ device_ids.unshift(:device) ] } }
  end

  #-------------------------------------------------------------------------

  def self.get_all_devices_for_task(incoming_request, remote_guid)
    user_id = incoming_request["user_id"]
    user = User.find_by_id(user_id)
    return { :user => { :deleted => [{ :id => user_id }] } } unless user

    device_ids = user.get_all_device_ids_for_task(incoming_request["task_type"])
    return {:remote => {remote_guid.to_sym => [ device_ids.unshift(:device) ] } }
  end

  #-------------------------------------------------------------------------

  def self.get_complete_details(incoming_request)
    user_data = User.get_attributes_for_multiple_by_id(incoming_request["ids"], true)
    return { :user => { :retrieved => user_data } }
  end
  
  #-------------------------------------------------------------------------

  def self.get_details(incoming_request)
    return self.get_details_for_multiple(incoming_request)
  end
 
  #-------------------------------------------------------------------------

  def self.get_details_for_multiple(incoming_request)
    user_data = User.get_attributes_for_multiple_by_id(incoming_request["ids"])
    return { :user => { :retrieved => user_data } }
  end
  
  #-------------------------------------------------------------------------

  def self.get_library_item_tasks(item_id)
    user = User.find_by_id(item_id)
    return { :user => { :deleted => [{ :id => item_id }] } } unless user

    task_array = LibraryItemTask.get_all_tasks_details("User", user.id)
    return { :library_item_task => { :retrieved => task_array } }
  end
  
  #-------------------------------------------------------------------------

  def self.get_parent_user_groups(user_id)
    ugs = UserGroup.parent_user_groups_for_user(user_id)  # This will include the 'everyone' group, too, so no need to special case it
    user_groups = ugs.collect { |ug| ug.get_attributes }
    return { :user_group => { :retrieved => user_groups } }
  end

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
  end

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
  end

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
        if prior_uid  # Before adding the device to this user, capture the device's previous user
          prior_users.add(prior_uid)
        end
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
    
    return return_hash.merge({ :user => { :updated => [ user.get_attributes ] + prior_users_attr } })
  end

  #-------------------------------------------------------------------------

end
