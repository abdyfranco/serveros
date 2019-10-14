#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
module UnifiedApplicationHelper
#-------------------------------------------------------------------------

  def self.create(incoming_request)
    # TODO if needed
  end

  #-------------------------------------------------------------------------

  def self.destroy(id)
    app = EnterpriseApp.find_by_id(id)
    app.delete if app
    return { :unified_application => { :deleted => [ { :id => id } ] } }
  end # self.destroy

  #-------------------------------------------------------------------------

  def self.find_all
    return { :unified_application => { :retrieved => UnifiedApplication.find_all_for_admin.collect { |app| app.get_attributes } } }
  end

  #-------------------------------------------------------------------------

  def self.get_details(incoming_request)
    return { :unified_application => { :retrieved => UnifiedApplication.find(:all, :conditions => [ 'id in (?)', incoming_request['ids'] ]).collect { |app| app.get_attributes } } }
  end

  #-------------------------------------------------------------------------

  def self.get_complete_details(incoming_request)
    return { :unified_application => { :retrieved => UnifiedApplication.find(:all, :conditions => [ 'id in (?)', incoming_request['ids'] ]).collect { |app| app.get_attributes(true) } } }
  end

  #-------------------------------------------------------------------------

  def self.push_applications_for_library_item(incoming_request)
    target_class = incoming_request['target_class']
    target_id    = incoming_request['target_id']
    apps         = incoming_request['apps']
    UnifiedApplication.push_applications_to_library_item(apps, target_class, target_id) unless apps.empty? || target_class.empty? || target_id.nil?
    return { }
  end # self.push_applications_for_library_item

  #-------------------------------------------------------------------------

  def self.remove_applications_from_library_item(incoming_request)
    target_class = incoming_request['target_class']
    target_id    = incoming_request['target_id']
    apps         = incoming_request['apps']
    UnifiedApplication.push_remove_application_to_library_item(apps, target_class, target_id) unless apps.empty? || target_class.empty? || target_id.nil?
    return { }
  end # self.remove_applications_from_library_item

  #-------------------------------------------------------------------------

  def self.update(app_id, incoming_request)
    app = UnifiedApplication.find_by_id(app_id)
    return { :unified_application => { :deleted => [ { :id => app_id } ] } } unless app

    # We don't have to keep separate arrays of ids for the various library items. All four tables are children of library_items,
    # which all use a common id sequence and therefore there can be no overlap of ids between any of the types.
    infos  = (incoming_request.delete('devices')       || [])
    infos += (incoming_request.delete('device_groups') || [])
    infos += (incoming_request.delete('users')         || [])
    infos += (incoming_request.delete('user_groups')   || [])
    app.update_app_assignments(infos)

    app_name = incoming_request['name']
    unless app_name.empty?
      app.update_name(app_name)
      app.name = app_name
    end

    supported_devices = incoming_request['supported_devices']
    unless supported_devices.nil?
      supported_devices = Integer(supported_devices)
      app.update_supported_devices(supported_devices)
      app.supported_devices = supported_devices
    end

    is_deleted = incoming_request['is_deleted']
    unless is_deleted.nil?
      if is_deleted == true
        eapp = EnterpriseApp.find_by_id(app_id)
        eapp.delete if eapp
      end
      app.is_deleted = is_deleted
    end

    return { :unified_application => { :updated => [app.get_attributes] } }
  end # self.update

#-------------------------------------------------------------------------
end # module UnifiedApplicationHelper
#-------------------------------------------------------------------------
