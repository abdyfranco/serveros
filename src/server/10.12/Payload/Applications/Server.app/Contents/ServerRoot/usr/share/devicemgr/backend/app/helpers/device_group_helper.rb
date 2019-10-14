#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
module DeviceGroupHelper
#-------------------------------------------------------------------------

  def self.add_child_device_group(device_group_id, incoming_request)
    in_dgid      = incoming_request['device_group_id']
    device_group = DeviceGroup.find_by_id(device_group_id)
    unless device_group
      Rails.logger.error "no device_group with id #{device_group_id}"
      return_hash = { :device_group => { :deleted => [ { :id => device_group_id } ] } }
      return_hash[:device_group][:deleted].push( { :id => in_dgid } ) unless DeviceGroup.find_by_id(in_dgid)
      return return_hash
    end

    sub_group = DeviceGroup.find_by_id(in_dgid)
    unless sub_group
      Rails.logger.error "no device_group with id #{in_dgid}"
      return { :device_group => { :deleted => [ { :id => in_dgid } ] } }
    end

    unless device_group.has_device_group_as_relationship(sub_group)
      device_group.child_device_groups.push(sub_group)
      device_group.save
    end

    child_device_group_array  = device_group.child_device_group_ids
    parent_device_group_array = sub_group.parent_device_group_ids

    return { :device_group => { :updated => [ { :id => device_group.id, :child_device_groups  => child_device_group_array },
                                              { :id => sub_group.id,    :parent_device_groups => parent_device_group_array } ] } }
  end # self.add_child_device_group

  #-------------------------------------------------------------------------

  def self.add_device(device_group_id, incoming_request)
    in_id        = incoming_request['id']
    device_group = DeviceGroup.find_by_id(device_group_id)
    unless device_group
      Rails.logger.error "no device_group with id #{device_group_id}"
      return_hash = { :device_group => { :deleted => [ { :id => device_group_id } ] } }
      return_hash[:device] = { :deleted => [ { :id => in_id } ] } unless Device.find_by_id(in_id)
      return return_hash
    end

    device = Device.find_by_id(in_id)
    unless device
      Rails.logger.error "no device with id #{in_id}"
      return { :device => { :deleted => [ { :id => in_id } ] } }
    end

    unless device_group.devices.include?(device)
      device_group.devices.push(device)
      device_group.save
    end

    device_array       = device_group.devices.collect { |d| d.id }
    device_group_array = device.device_group_ids

    return { :device_group => { :updated => [ { :id => device_group.id, :devices => device_array } ] },
             :device       => { :updated => [ { :id => device.id, :device_groups => device_group_array } ] } }
  end # self.add_device

  #-------------------------------------------------------------------------

  def self.add_parent_device_group(device_group_id, incoming_request)
    in_dgid      = incoming_request['device_group_id']
    device_group = DeviceGroup.find_by_id(device_group_id)
    unless device_group
      Rails.logger.error "no device_group with id #{device_group_id}"
      return_hash = { :device_group => { :deleted => [ { :id => device_group_id } ] } }
      return_hash[:device_group][:deleted].push( { :id => in_dgid } ) unless DeviceGroup.find_by_id(in_dgid)
      return return_hash
    end

    super_group = DeviceGroup.find_by_id(in_dgid)
    unless super_group
      Rails.logger.error "no device_group with id #{in_dgid}"
      return { :device_group => { :deleted => [ { :id => in_dgid } ] } }
    end

    unless device_group.has_device_group_as_relationship(super_group)
      device_group.parent_device_groups.push(super_group)
      device_group.save
    end

    parent_device_group_array = device_group.parent_device_group_ids
    child_device_group_array  = super_group.child_device_group_ids

    return { :device_group => { :updated => [ { :id => device_group.id, :parent_device_groups => parent_device_group_array },
                                              { :id => super_group.id,  :child_device_groups  => child_device_group_array } ] } }
  end # self.add_parent_device_group

  #-------------------------------------------------------------------------

  def self.create(incoming_request)
    device_group = DeviceGroup.new
    device_group.update_from_hash(incoming_request)
    device_group.save
    device_group.update_model_to_many_relationships(incoming_request)
    return { :device_group => { :created => [ device_group.get_attributes(true) ] } }
  end # self.create

  #-------------------------------------------------------------------------

  def self.destroy(device_group_id)
    device_group = DeviceGroup.find_by_id(device_group_id)
    device_group.delete if device_group
    return { :device_group => { :deleted => [ { :id => device_group_id } ] } }
  end # self.destroy

  #-------------------------------------------------------------------------

  def self.find_all(remote_guid, selected_item_id = nil)
    dg_array = DeviceGroup.get_all_ids_for_admin
    dg_array.unshift(:device_group)
    return { :remote => { remote_guid.to_sym => [ dg_array ] } }
  end # self.find_all

  #-------------------------------------------------------------------------

  def self.find_matching(incoming_request, remote_guid, selected_item_id = nil)
    dg_array = DeviceGroup.get_all_ids_for_admin(incoming_request['search_string'])
    dg_array.unshift(:device_group)
    return { :remote => { remote_guid.to_sym => [ dg_array ] } }
  end # self.find_matching

  #-------------------------------------------------------------------------

  def self.find_matching_detailed(incoming_request, remote_guid, selected_item_id = nil); return self.find_matching(incoming_request, remote_guid, selected_item_id);                                                      end
  def self.get_app_license_details(incoming_request);                                     return { :device_group => { :retrieved => DeviceGroup::get_app_license_details_for_multiple_by_id(incoming_request['ids']) } };  end
  def self.get_book_license_details(incoming_request);                                    return { :device_group => { :retrieved => DeviceGroup::get_book_license_details_for_multiple_by_id(incoming_request['ids']) } }; end
  def self.get_complete_details(incoming_request);                                        return { :device_group => { :retrieved => DeviceGroup::get_attributes_for_multiple_by_id(incoming_request['ids'], true) } };     end
  def self.get_details(incoming_request);                                                 return self.get_details_for_multiple(incoming_request);                                                                          end
  def self.get_details_for_multiple(incoming_request);                                    return { :device_group => { :retrieved => DeviceGroup::get_attributes_for_multiple_by_id(incoming_request['ids']) } };           end

  #-------------------------------------------------------------------------

  def self.get_parent_device_groups(device_group_id)
    device_group = DeviceGroup.find_by_id(device_group_id)
    return { :device_group => { :deleted => [ { :id => device_group_id } ] } } unless device_group
    attrs = device_group.parent_device_groups.map{ |dg| dg.get_attributes }
    return { :device_group => { :retrieved => attrs } }
  end # self.get_parent_device_groups

  #-------------------------------------------------------------------------

  def self.get_profiles(device_group_id)
    device_group = DeviceGroup.find_by_id(device_group_id)
    profiles = []
    if device_group
      profile = device_group.profile
      profiles = [profile.get_attributes] if profile
    end
    return { :profile => { :retrieved => profiles } }
  end # self.get_profiles

  #-------------------------------------------------------------------------

  # def self.get_all_enterprise_apps(device_group_id, remote_guid)
  #   device_group = DeviceGroup.find_by_id(device_group_id)
  #   return { :device_group => { :deleted => [{ :id => device_group_id }] } } unless device_group
  #
  #   apps = device_group.get_all_eapps_info
  #   return { :remote => {remote_guid.to_sym => { :apps => apps } } }
  # end

  #-------------------------------------------------------------------------

  def self.get_all_ios_devices(device_group_id, remote_guid)
    device_group = DeviceGroup.find_by_id(device_group_id)
    return { :device_group => { :deleted => [{ :id => device_group_id }] } } unless device_group

    device_ids = device_group.get_all_ios_device_ids
    return {:remote => {remote_guid.to_sym => [ device_ids.unshift(:device) ] } }
  end # self.get_all_ios_devices

  #-------------------------------------------------------------------------

  def self.get_all_mac_devices(device_group_id, remote_guid)
    device_group = DeviceGroup.find_by_id(device_group_id)
    return { :device_group => { :deleted => [{ :id => device_group_id }] } } unless device_group

    device_ids = device_group.get_all_mac_device_ids
    return {:remote => {remote_guid.to_sym => [ device_ids.unshift(:device) ] } }
  end # self.get_all_mac_devices

  #-------------------------------------------------------------------------

  def self.get_all_devices_for_task(incoming_request, remote_guid)
    device_group_id = incoming_request['device_group_id']
    device_group = DeviceGroup.find_by_id(device_group_id)
    return { :device_group => { :deleted => [{ :id => device_group_id }] } } unless device_group

    device_ids = device_group.get_all_device_ids_for_task(incoming_request['task_type'])
    return {:remote => {remote_guid.to_sym => [ device_ids.unshift(:device) ] } }
  end # self.get_all_devices_for_task

  #-------------------------------------------------------------------------

  def self.get_library_item_tasks(item_id)
    active_task_data, completed_task_data = LibraryItemTask.get_all_tasks_details('DeviceGroup', item_id)
    result = {}
    result[:library_item_task]           = { :retrieved => active_task_data }    unless active_task_data.empty?
    result[:completed_library_item_task] = { :retrieved => completed_task_data } unless completed_task_data.empty?
    return result
  end # self.get_library_item_tasks

  #-------------------------------------------------------------------------

  def self.list_child_device_groups(device_group_id)
    device_group = DeviceGroup.find_by_id(device_group_id)
    unless device_group
      Rails.logger.error "no device_group with id #{device_group_id}"
      return { :device_group => { :deleted => [ { :id => device_group_id } ] } }
    end

    child_device_group_array = device_group.child_device_group_ids
    return { :device_group => { :retrieved => [ { :id => device_group.id, :child_device_groups => child_device_group_array } ] } }
  end # self.list_child_device_groups

  #-------------------------------------------------------------------------

  def self.list_devices(device_group_id)
    device_group = DeviceGroup.find_by_id(device_group_id)
    unless device_group
      Rails.logger.error "no device_group with id #{device_group_id}"
      return { :device_group => { :deleted => [ { :id => device_group_id } ] } }
    end

    device_array = device_group.devices.collect { |device| device.id }
    return { :device_group => { :retrieved => [ { :id => device_group.id, :devices => device_array } ] } }
  end # self.list_devices

  #-------------------------------------------------------------------------

  def self.list_parent_device_groups(device_group_id)
    device_group = DeviceGroup.find_by_id(device_group_id)
    unless device_group
      Rails.logger.error "no device_group with id #{device_group_id}"
      return { :device_group => { :deleted => [ { :id => device_group_id } ] } }
    end

    parent_device_group_array = device_group.parent_device_group_ids
    return { :device_group => { :retrieved => [ { :id => device_group.id, :parent_device_groups => parent_device_group_array } ] } }
  end # self.list_parent_device_groups

  #-------------------------------------------------------------------------

  def self.remove_child_device_group(device_group_id, incoming_request)
    in_dgid      = incoming_request['device_group_id']
    device_group = DeviceGroup.find_by_id(device_group_id)
    unless device_group
      Rails.logger.error "no device_group with id #{device_group_id}"
      return_hash = { :device_group => { :deleted => [ { :id => device_group_id } ] } }
      return_hash[:device_group][:deleted].push( { :id => in_dgid } ) unless DeviceGroup.find_by_id(in_dgid)
      return return_hash
    end

    sub_group = DeviceGroup.find_by_id(in_dgid)
    unless sub_group
      Rails.logger.error "no device_group with id #{in_dgid}"
      return { :device_group => { :deleted => [ { :id => in_dgid } ] } }
    end

    device_group.child_device_groups.delete(sub_group)
    device_group.save

    child_device_group_array  = device_group.child_device_group_ids
    parent_device_group_array = sub_group.parent_device_group_ids

    return { :device_group => { :updated => [ { :id => device_group.id, :child_device_groups  => child_device_group_array },
                                              { :id => sub_group.id,    :parent_device_groups => parent_device_group_array } ] } }
  end # self.remove_child_device_group

  #-------------------------------------------------------------------------

  def self.remove_device(device_group_id, incoming_request)
    in_id = incoming_request['id']
    device_group = DeviceGroup.find_by_id(device_group_id)
    unless device_group
      Rails.logger.error "no device_group with id #{device_group_id}"
      return_hash = { :device_group => { :deleted => [ { :id => device_group_id } ] } }
      return_hash[ :device ] = { :deleted => [ { :id => in_id } ] } unless Device.find_by_id(in_id)
      return return_hash
    end

    device = Device.find_by_id(in_id)
    unless device
      Rails.logger.error "no device with id #{in_id}"
      return { :device => { :deleted => [ { :id => in_id } ] } }
    end

    device_group.devices.delete(device)
    device_group.save

    device_array       = device_group.devices.collect { |d| d.id }
    device_group_array = device.device_group_ids

    return { :device_group => { :updated => [ { :id => device_group.id, :devices => device_array } ] },
             :device       => { :updated => [ { :id => device.id, :device_groups => device_group_array } ] } }
  end # self.remove_device

  #-------------------------------------------------------------------------

  def self.remove_parent_device_group(device_group_id, incoming_request)
    in_dgid      = incoming_request['device_group_id']
    device_group = DeviceGroup.find_by_id(device_group_id)
    unless device_group
      Rails.logger.error "no device_group with id #{device_group_id}"
      return_hash = { :device_group => { :deleted => [ { :id => device_group_id } ] } }
      return_hash[:device_group][:deleted].push( { :id => in_dgid } ) unless DeviceGroup.find_by_id(in_dgid)
      return return_hash
    end

    super_group = DeviceGroup.find_by_id(in_dgid)
    unless super_group
      Rails.logger.error "no device_group with id #{in_dgid}"
      return { :device_group => { :deleted => [ { :id => in_dgid } ] } }
    end

    device_group.parent_device_groups.delete(super_group)
    device_group.save

    parent_device_group_array = device_group.parent_device_group_ids
    child_device_group_array  = super_group.child_device_group_ids

    return { :device_group => { :updated => [ { :id => device_group.id, :parent_device_groups => parent_device_group_array },
                                              { :id => super_group.id,  :child_device_groups  => child_device_group_array } ] } }
  end # self.add_child_device_group

  #-------------------------------------------------------------------------

  def self.update(device_group_id, incoming_request)
    device_group = DeviceGroup.find_by_id(device_group_id)
    return { :device_group => { :deleted => [ { :id => device_group_id } ] } } unless device_group

    incoming_request.delete('profile')
    app_assignments  = incoming_request.delete('apps')
    book_assignments = incoming_request.delete('books')

    device_group.update_from_hash(incoming_request)

    device_group.save
    device_group.update_model_to_many_relationships(incoming_request)

    device_group.update_app_assignments(app_assignments)   if app_assignments
    device_group.update_book_assignments(book_assignments) if book_assignments

    device_group.reload

    enrollment_settings = incoming_request.delete('enrollment_settings')
    device_group.update_enrollment_settings(enrollment_settings) if enrollment_settings

    return { :device_group => { :updated => [ device_group.get_attributes(true) ] } }
  end # self.update

#-------------------------------------------------------------------------
end # module DeviceGroupHelper
#-------------------------------------------------------------------------
