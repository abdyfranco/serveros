#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
module ProfileHelper
#-------------------------------------------------------------------------

  IncomingKeysToRemove = ['devices', 'device_id', 'device_groups', 'device_group_id', 'library_item_type', 'users', 'user_id', 'user_groups', 'user_group_id', 'edu_classes', 'edu_class_id' ]

  AttrMap = {     # Converts admin attribute names to the backend attribute names
    'is_a_la_carte'      => 'is_manual',
    'is_from_servermgr'  => 'from_servermgr',
    'is_system_level'    => 'system_level' }

  #-------------------------------------------------------------------------

  def self.add_knob_set(library_item_id, incoming_request)
    type = incoming_request['knob_set_type']
    return nil if type == 'GeneralKnobSet'
    klass = KnobSetHelper.get_knob_set_class(type)
    return nil unless klass

    profile = Profile.find_by_library_item_id(library_item_id)
    unless profile
      Rails.logger.error("no profile with id #{library_item_id}")
      return { :profile => { :deleted => [ { :id => library_item_id } ] } }
    end

    new_knob_set = klass.new
    new_knob_set.update_from_hash(incoming_request['attributes'])
    new_knob_set.save

    # For a unique knob set (only one allowed per profile), delete any existing knob set of the same kind for this profile
    if klass.is_unique
      old_knob_set = klass.find_by_library_item_id(library_item_id)
      old_knob_set.delete if old_knob_set
    end

    new_knob_set.library_item_id = library_item_id
    new_knob_set.save
    return_hash = { new_knob_set.class.to_s => { :created => [ new_knob_set.get_attributes ] } }

    profile.update_profile_cache  # Will save the updated cache to the profile

    MDMAuditor.profile_updated(profile.session, profile, "added knob set #{new_knob_set.class}")

    return return_hash
  end # self.add_knob_set

  #-------------------------------------------------------------------------

  def self.create(incoming_request)
    lid = Integer(incoming_request['library_item_id'])
    incoming_request = self.rename_old_attrs(incoming_request)
    profile = Profile.create_by_library_item_id(lid, incoming_request)
    unless profile
      # No profile record means no library item
      Rails.logger.error("no profile (library item) with id #{lid}")
      return { :profile => { :deleted => [ { :id => lid } ] } }
    end

    profile_attrs = profile.get_attributes
    profile_attrs.delete('library_item_id')
    profile_attrs.delete('library_item_type')

    MDMAuditor.profile_created(profile.session, profile)

    return { :profile            => { :created => [ profile_attrs ] },
             GeneralKnobSet.to_s => { :created => [ profile.general_knob_set.get_attributes ] }
           }
  end # self.create

  #-------------------------------------------------------------------------

  def self.destroy(id)
    profile     = Profile.find_by_id(id)
    return_hash = {}

    if profile
      MDMAuditor.profile_deleted(profile.session, profile)
      owner        = profile.owner
      profile_attr = profile.get_attributes # Grab before we delete
      profile.delete
    else
      profile_attr = { :id => id }
    end

    return_hash[:profile]                              = { :deleted => [profile_attr] }
    return_hash[owner.library_item_type.to_s] = { :updated => [owner.get_attributes] } if owner
    return return_hash
  end # self.destroy

  #-------------------------------------------------------------------------

  def self.find_all(remote_guid)
    ids = Profile.all_profile_ids
    return { :remote => { remote_guid.to_sym => [ ids.unshift(:profile) ] } }
  end # self.find_all

  #-------------------------------------------------------------------------

  def self.get_details(incoming_request)
    ids = incoming_request['ids'].collect { |id| Integer(id) }
    attrs = Profile.find(:all, :conditions => ['id in (?)', ids]).collect { |p| p.get_attributes }
    return { :profile => { :retrieved => attrs } }
  end # self.get_details

  #-------------------------------------------------------------------------

  def self.get_knob_sets(id)
    profile = Profile.find_by_id(id)
    unless profile
      Rails.logger.error("no profile with id #{id}")
      return { :profile => { :deleted => [ { :id => id } ] } }
    end

    return profile.generate_knob_set_hash
  end # self.get_knob_sets

  #-------------------------------------------------------------------------

  def self.remove_knob_set(library_item_id, incoming_request)
    type = incoming_request['knob_set_type']
    return nil if type == 'GeneralKnobSet'
    klass = KnobSetHelper.get_knob_set_class(type)
    return nil unless klass

    profile = Profile.find_by_library_item_id(library_item_id)
    unless profile
      Rails.logger.error("no profile with id #{library_item_id}")
      return { :profile => { :deleted => [ { :id => library_item_id } ] } }
    end

    in_id    = Integer(incoming_request['id'])
    knob_set = klass.find_by_id(in_id)
    unless knob_set
      Rails.logger.error("no knob set with id #{in_id}")
      return { klass.table_name[0...-1] => { :deleted => [ { :id => in_id } ] } }
    end
    unless knob_set.library_item_id == library_item_id
      Rails.logger.error("ProfileHelper.remove_knob_set: KnobSet #{knob_set} not owned by library item with ID #{library_item_id}")
      return { klass.table_name[0...-1] => { :deleted => [ { :id => in_id } ] } }
    end

    MDMAuditor.profile_updated(profile.session, profile, "removed knob set #{knob_set.class}")

    knob_set_name = knob_set.class.to_s
    knob_set_attr = knob_set.get_attributes # Grab before we delete
    knob_set.delete
    return_hash = { knob_set_name => { :deleted => [knob_set_attr] } }

    profile.update_profile_cache  # Will save the updated cache to the profile

    return return_hash
  end # self.remove_knob_set

  #-------------------------------------------------------------------------

  def self.rename_old_attrs(incoming_request)
    AttrMap.each { |o, n| incoming_request[n] = incoming_request.delete(o) if incoming_request.include?(o) }
    return incoming_request
  end # self.rename_old_attrs

  #-------------------------------------------------------------------------

  def self.update(id, incoming_request)
    profile = Profile.find_by_id(id)
    unless profile
      Rails.logger.error("no profile with id #{id}")
      return { :profile => { :deleted => [ { :id => id } ] } }
    end

    # Remove the membership arrays so that update_model_to_many_relationships doesn't try to change the owner of the profile
    incoming_request = incoming_request.delete_if { |k,v| IncomingKeysToRemove.include?(k) }
    profile.update_from_hash(self.rename_old_attrs(incoming_request))
    profile.admin_session_id = nil                                      # This makes the profile "valid" or "real" (not a temporary placeholder for the admin)
    profile.save
    # profile.update_model_to_many_relationships(incoming_request)

    profile.update_profile_cache  # Will save the updated cache to the profile
    profile.reload

    MDMAuditor.profile_updated(profile.session, profile)

    return { :profile => { :updated => [ profile.get_attributes ] } }
  end # self.update

#-------------------------------------------------------------------------
end # module ProfileHelper
#-------------------------------------------------------------------------
