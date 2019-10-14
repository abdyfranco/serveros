#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

module ProfileHelper

  IncomingKeysToRemove = ['devices', 'device_id', 'device_groups', 'device_group_id', 'library_item_id', 'library_item_type', 'users', 'user_id', 'user_groups', 'user_group_id' ]

  #-------------------------------------------------------------------------

  def self.create(incoming_request)
    profile = Profile.new
    profile.update_from_hash(incoming_request)
    profile.save

    # Go ahead and create the required general knob set now, too
    settings = Settings.get_settings
    general  = GeneralKnobSet.new
    general.organization  = settings.server_organization
    general.security      = false
    general.admin_temp_id = profile.admin_temp_id
    general.profile       = profile
    general.save

    MDMAuditor.profile_created(profile.session, profile)

    profile.reload
    return { :profile           => { :created => [ profile.get_attributes ] },
             general.class.to_s => { :created => [ general.get_attributes ] }
           }
  end

  #-------------------------------------------------------------------------

  def self.update(profile_id, incoming_request)
    profile = Profile.find_by_id(profile_id)
    unless profile
      Rails.logger.error("no profile with id #{profile_id}")
      return { :profile => { :deleted => [ { :id => profile_id } ] } }
    end

    # Since we no longer support changing the "owner" (Library item) of a profile, we only need to worry about updating the
    # owner's relationship when none is currently set on the profile
    unless profile.library_item_id
      profile.set_owner_from_incoming_request(incoming_request)
      MDMAuditor.profile_added_recipients(profile.session, profile, [profile.owner])
    end
    # Remove the membership arrays so that update_model_to_many_relationships doesn't try to change the owner of the profile
    incoming_request = incoming_request.delete_if { |k,v| IncomingKeysToRemove.include?(k) }
    profile.update_from_hash(incoming_request)
    profile.save
    profile.update_model_to_many_relationships(incoming_request)

    profile.generate_profile_cache  # Will save the updated cache to the profile
    profile.reload

    MDMAuditor.profile_updated(profile.session, profile)

    return { :profile => { :updated => [ profile.get_attributes ] } }
  end

  #-------------------------------------------------------------------------

  def self.destroy(profile_id)
    profile     = Profile.find_by_id(profile_id)
    return_hash = {}

    MDMAuditor.profile_deleted(profile.session, profile)

    profile_attr = profile.get_attributes # Grab before we delete
    profile.delete    

    return_hash[:profile] = { :deleted => [profile_attr] }
    return return_hash
  end  

  #-------------------------------------------------------------------------

  def self.get_details(incoming_request)
    ids = incoming_request["ids"].collect { |id| Integer(id) }
    return { :profile => { :retrieved => Profile.find( :all, :conditions => [ "id in (?)", ids ] ).collect { |detail| detail.get_attributes } } }
  end
  
  #-------------------------------------------------------------------------

  def self.find_all(remote_guid)
    profile_hash = { :remote => { remote_guid.to_sym => [ [ :profile ] ] } }
    profiles     = Profile.find(:all, :order => :name)
    profiles.each { |profile| profile_hash[:remote][remote_guid.to_sym][0].push(profile.id) }
    return profile_hash
  end
  
  #-------------------------------------------------------------------------

  def self.get_knob_sets(profile_id)
    profile = Profile.find_by_id(profile_id)
    unless profile
      Rails.logger.error("no profile with id #{profile_id}")
      return { :profile => { :deleted => [ { :id => profile_id } ] } }
    end

    return profile.generate_knob_set_hash
  end
  
  #-------------------------------------------------------------------------

  def self.remove_knob_set(profile_id, incoming_request)
    klass = KnobSetHelper.get_knob_set_class(incoming_request["knob_set_type"])
    return nil unless klass

    profile = Profile.find_by_id(profile_id)
    unless profile
      Rails.logger.error("no profile with id #{profile_id}")
      return { :profile => { :deleted => [ { :id => profile_id } ] } }
    end

    in_id    = incoming_request["id"]
    knob_set = klass.find_by_id(in_id)
    unless knob_set
      Rails.logger.error("no knob set with id #{in_id}")
      return { klass.table_name[0...-1] => { :deleted => [ { :id => in_id } ] } }
    end
    unless knob_set.profile_id == profile_id
      Rails.logger.error("ProfileHelper.remove_knob_set: KnobSet #{knob_set} not owned by Profile with ID #{profile_id}")
      return { klass.table_name[0...-1] => { :deleted => [ { :id => in_id } ] } }
    end

    MDMAuditor.profile_updated(profile.session, profile, "removed knob set #{knob_set.class}")

    knob_set_name = knob_set.class.to_s
    knob_set_attr = knob_set.get_attributes # Grab before we delete
    knob_set.delete
    return_hash = { knob_set_name => { :deleted => [knob_set_attr] } }

    profile.generate_profile_caches_action  # Will save the updated cache to the profile

    return return_hash
  end
  
  #-------------------------------------------------------------------------

  def self.add_knob_set(profile_id, incoming_request)
    klass = KnobSetHelper.get_knob_set_class(incoming_request["knob_set_type"])
    return nil unless klass

    profile = Profile.find_by_id(profile_id)
    unless profile
      Rails.logger.error("no profile with id #{profile_id}")
      return { :profile => { :deleted => [ { :id => profile_id } ] } }
    end

    new_knob_set = klass.new
    new_knob_set.update_from_hash(incoming_request["attributes"])
    new_knob_set.save

    # For a unique knob set (only one allowed per profile), delete any existing knob set of the same kind for this profile
    if klass.is_unique
      old_knob_set = klass.find_by_profile_id(profile.id)
      old_knob_set.delete if old_knob_set
    end

    new_knob_set.profile = profile
    new_knob_set.save
    return_hash = { new_knob_set.class.to_s => { :created => [ new_knob_set.get_attributes ] } }

    profile.generate_profile_cache  # Will save the updated cache to the profile

    MDMAuditor.profile_updated(profile.session, profile, "added knob set #{new_knob_set.class}")

    return return_hash
  end
  
  #-------------------------------------------------------------------------

  def self.get_raw_profile(profile_id)
    profile = Profile.find_by_id(profile_id)
    return (profile ? ProfileManager::generate_raw_profile(profile) : nil)
  end

  #-------------------------------------------------------------------------

  def self.get_signed_profile(profile_id, hostname)
    profile = Profile.find_by_id(profile_id)
    return (profile ? ProfileManager::generate_signed_profile(profile) : nil)
  end
  
  #-------------------------------------------------------------------------

end
