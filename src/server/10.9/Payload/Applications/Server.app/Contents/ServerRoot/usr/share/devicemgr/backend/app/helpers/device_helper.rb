#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

module DeviceHelper

  #-------------------------------------------------------------------------
  
  def self.create(incoming_request)
    Rails.logger.info("DeviceHelper.create: #{incoming_request}")
    # Only create a new record if one doesn't already exist; otherwise reuse the existing one
    device = (Device.find_by_SerialNumber(incoming_request['SerialNumber']) ||
              Device.find_by_IMEI(incoming_request['IMEI'])                 ||
              Device.find_by_MEID(incoming_request['MEID'])                 ||
              Device.find_by_udid(incoming_request['udid'])                 ||
              Device.find_by_deviceID(incoming_request['DeviceID']))
    device ||= Device.new

    # If the device exists then just return the device without updating it
    if device.token
      Rails.logger.warn("Device already enrolled");
      return { :device => { :updated => [ device.get_attributes ] } }
    end 

    device.update_from_hash(incoming_request)
    device.mdm_target_type = 'ios'
    device.save
    return { :device => { :created => [ device.get_attributes ] } }
  end

  #-------------------------------------------------------------------------

  def self.update(device_id, incoming_request)
    device = Device.find_by_id(device_id)

    # This method wasn't being used until we switched to using the 'apps' array
    # So to be safe, we will only honor the contents of the 'apps' key and airplay_password
    # device.update_from_hash(incoming_request)
    # device.save
    # device.update_model_to_many_relationships(incoming_request)
    app_assignments = incoming_request.delete('apps')
    device.update_app_assignments(app_assignments) if app_assignments

    device.airplay_password = incoming_request.delete('airplay_password') if incoming_request.include?('airplay_password')
    device.dep_profile      = incoming_request.delete('dep_profile')      if incoming_request.include?('dep_profile')
    
    device.save
    
    return { :device => { :updated => [ { :id => device.id } ] } }
  end

  #-------------------------------------------------------------------------

  def self.find_all_apple_tvs(remote_guid)
    tv_array = Device.get_all_apple_tv_ids
    tv_array.unshift(:device)
    return { :remote => { remote_guid.to_sym => [ tv_array ] } }
  end  

  #-------------------------------------------------------------------------

  def self.destroy(device_id)
    device = Device.find_by_id(device_id)
    return { :device => { :deleted => [ { :id => device_id } ] } } unless device

    hash = { :device => { :deleted => [device.get_attributes] } } # Grab before we delete

    # There's no need to disconnect all the various relationships--the database will do that when the device row is deleted.
    # It will also create the RemoveMDM task. It's so cool!

    device.delete
    return hash
  end

  #-------------------------------------------------------------------------

  def self.get_complete_details(incoming_request)
    data = Device::get_attributes_for_multiple_by_id(incoming_request["ids"], true)
    return { :device => { :retrieved => data } }
  end
  
  #-------------------------------------------------------------------------

  def self.get_details(incoming_request)
    return self.get_details_for_multiple(incoming_request)
  end
 
  #-------------------------------------------------------------------------

  def self.get_details_for_multiple(incoming_request)
    data = Device::get_attributes_for_multiple_by_id(incoming_request["ids"])
    return { :device => { :retrieved => data } }
  end
  
  #-------------------------------------------------------------------------

  def self.get_details_by_udids(incoming_request, remote_guid)
    device_array = Device.find( :all, :conditions => [ "udid in (?)", incoming_request["udids"] ] ).collect { |device| device.id }
    return { :remote => { remote_guid.to_sym => [ [ :device] | device_array ] } }
  end
  
  #-------------------------------------------------------------------------

  def self.get_all_profiles(device_id)
    device = Device.find_by_id(device_id)
    
    profile_array = device.get_all_profiles.collect { |profile| profile.get_attributes }
    return { :profile => { :retrieved => profile_array } }
  end
  
  #-------------------------------------------------------------------------

  def self.get_library_item_tasks(item_id)
    task_array = LibraryItemTask.get_all_tasks_details("Device", item_id)
    return { :library_item_task => { :retrieved => task_array } }
  end
  
  #-------------------------------------------------------------------------

  def self.find_all(remote_guid)
    device_array = Device.get_all_ids_for_admin
    device_array.unshift(:device)
    return { :remote => { remote_guid.to_sym => [ device_array ] } }
  end

  #-------------------------------------------------------------------------

  def self.find_matching(incoming_request, remote_guid)
    device_array = Device.get_all_ids_for_admin(incoming_request["search_string"])
    device_array.unshift(:device)
    return { :remote => { remote_guid.to_sym => [ device_array ] } }
  end
  
  #-------------------------------------------------------------------------

  def self.find_matching_detailed(incoming_request, remote_guid)
    device_array = Device.get_all_ids_matching_detailed_for_admin(incoming_request["search_string"])
    device_array.unshift(:device)
    return { :remote => { remote_guid.to_sym => [ device_array ] } }
  end
  
  #-------------------------------------------------------------------------

  def self.get_user(device_id)
    device = Device.find_by_id(device_id)
    attrs = []
    if device
      user = device.user
      attrs = [user.get_attributes] if user
    end
    return { :user => { :retrieved => attrs } }
  end

  #-------------------------------------------------------------------------

  def self.get_device_groups(device_id)
    device = Device.find_by_id(device_id)
    attrs = (device ? device.device_groups.collect { |device_group| device_group.get_attributes } : [])
    return { :device_group => { :retrieved => attrs } }
  end

  #-------------------------------------------------------------------------

  def self.get_profiles(device_id)
    device = Device.find_by_id(device_id)
    profiles = []
    if device
      profile = device.profile
      profiles = [profile.get_attributes] if profile
    end
    return { :profile => { :retrieved => profiles } }
  end

  #-------------------------------------------------------------------------

  def self.set_user(device_id, incoming_request)
    device = Device.find_by_id(device_id)
    id     = incoming_request["id"]
    user   = User.find_one(id)
  
    unless device
      Rails.logger.error "no device with id #{id}"
      return_hash = { :device => { :deleted => [ { :id => device_id } ] } }
      return_hash[:user] = { :deleted => [ { :id => id } ] } unless user
      return return_hash
    end

    unless user
      Rails.logger.error "no user with id #{id}"
      return { :user => { :deleted => [ { :id => id } ] } }
    end
    
    device.user = user
    device.save
    
    device_array = user.devices.map { |d| { :id => d.id } }
    
    return { :device => { :updated => [ { :id => device.id, :user    => { :id => user.id } } ] },
             :user   => { :updated => [ { :id => user.id,   :devices => device_array } ] }
           }
  end
  
  #-------------------------------------------------------------------------

  def self.unenroll(device_id)
    device = Device.find_by_id(device_id)
    return { :device => { :deleted => [ { :id => device_id } ] } } unless device

    task = LibraryItemTask.create(device, 'RemoveMDM')
    return (task ? { :library_item_task => { :created => [task.get_attributes] } } : { })
  end

  #-------------------------------------------------------------------------

  def self.revert_to_placeholder(device_id)
    device = Device.find_by_id(device_id)
    return { :device => { :deleted => [ { :id => device_id } ] } } unless device

    # just setting the token to nil will trigger appropriate functions in the database to make this device a placeholder
    device.token = nil
    device.save

    return { :device => { :updated => [ device.get_attributes ] } }
  end

  #-------------------------------------------------------------------------

  def self.begin_refresh
    # Trigger an incremental DEP sync
    MDMUtilities.send_devicemgrd_request({ :command => "depStartSync", :forceFull => false }, true) # true = async
  end

  #-------------------------------------------------------------------------

end
