#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
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
  end  

  #-------------------------------------------------------------------------

  def self.find_all
    app_array = UnifiedApplication.find_all_for_admin.collect { |app| app.get_attributes }
    return { :unified_application => { :retrieved => app_array } }
  end

  #-------------------------------------------------------------------------

  def self.get_details(incoming_request)
    app_array = UnifiedApplication.find(:all, :conditions => [ "id in (?)", incoming_request["ids"] ]).collect { |app| app.get_attributes }
    return { :unified_application => { :retrieved => app_array } }
  end

  #-------------------------------------------------------------------------

  def self.push_applications_for_library_item(incoming_request)
    target_class = incoming_request['target_class']
    target_id    = incoming_request['target_id']
    apps         = incoming_request['apps']
    UnifiedApplication.push_applications_to_library_item(apps, target_class, target_id) if apps && !apps.empty? && target_class && target_id
    return { }
  end  

  #-------------------------------------------------------------------------

  def self.update(app_id, incoming_request)
    app = UnifiedApplication.find_by_id(app_id)
    return { :unified_application => { :deleted => [ { :id => app_id } ] } } unless app
    
    user_ids  = incoming_request.delete('users')
    group_ids = incoming_request.delete('user_groups')
    app.update_app_assignments(user_ids, group_ids) if user_ids && group_ids

    app_name = incoming_request['name']
    if app_name
      app.update_name(app_name)
      app.name = app_name
    end
    return { :unified_application => { :updated => [app.get_attributes] } }
  end

  #-------------------------------------------------------------------------

end
