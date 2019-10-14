#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

module KnobSetHelper

  #-------------------------------------------------------------------------

  def self.get_knob_set_class(string)
    raise "KnobSetHelper: Attempted to operate on a type that is not a knob set: #{string}" unless MDMUtilities.knob_set_class_names.include?(string)
    return Kernel.const_get(string) 
  end

  #-------------------------------------------------------------------------

  def self.create(knob_set_class, incoming_request)
    klass = self.get_knob_set_class(knob_set_class)
    return nil unless klass

    # Make sure we have the requested profile
    profile_id = incoming_request.delete('profile')
    profile = Profile.find_by_id(profile_id)
    unless profile
      Rails.logger.error("no profile with id #{incoming_request["profile"]}")
      return {:profile => { :deleted => [ { :id => incoming_request["profile"] } ] } }
    end

    # Make sure we're not trying to create more than one of the unique knob sets
    if klass.unique?
      knob_set = klass.first(:conditions => ['profile_id = ?', profile_id])
      Rails.logger.error("Ignoring attempt to create 2nd unique knob set of class #{klass} on profile #{profile_id}. Using existing knob set.") if knob_set
    end
    knob_set ||= klass.new
    knob_set.update_from_hash(incoming_request)
    knob_set.profile = profile
    knob_set.save
    knob_set.update_model_to_many_relationships(incoming_request) if knob_set.respond_to?(:also_modifies)
    
    # Set a DataFile to be owned by this KnobSet if specified (but make sure the KnobSet can own a DataFile!)
    if incoming_request && incoming_request['data_files']
      if knob_set.respond_to?("data_file")
        data_file = DataFile.find_by_id(incoming_request['data_files'][0])
        if data_file
          data_file.owner = knob_set  # Calls .save on the data_file object
          knob_set.save     # Save again to give the knob set a chance to parse the data file we just associated with it
        else
          Rails.logger.error("Ignoring attempt to set a non-existent DataFile (#{incoming_request['data_files'][0]}) on KnobSet of class #{knob_set.class}")
        end
      else
        Rails.logger.error("Ignoring attempt to add a DataFile to a KnobSet (#{knob_set.class}) that doesn't support DataFiles")
      end
    end

    return_hash = { knob_set_class => { :updated => [ knob_set.get_attributes ] } }
    
    MDMAuditor.profile_updated(profile.session, profile, "added payload #{knob_set_class}")

    profile.generate_profile_cache  # Will save the updated cache to the profile
    return_hash[:profile]  = { :updated => [ profile.get_attributes ] }
    return return_hash
  end

  #-------------------------------------------------------------------------

  def self.update(knob_set_class, knob_set_id, incoming_request)
    klass = self.get_knob_set_class(knob_set_class)
    return nil unless klass

    knob_set = klass.find_by_id(knob_set_id)

    knob_set.update_model_to_many_relationships(incoming_request) if knob_set.respond_to?(:also_modifies)
    incoming_request.delete('profile')  # Remove the relationship so update_from_hash doesn't try to update it
    incoming_request.delete('profile_id')
    knob_set.update_from_hash(incoming_request)
    
    knob_set.save
    return_hash = { knob_set_class => { :updated => [ knob_set.get_attributes ] } }

    profile = knob_set.profile
    if profile
      profile.generate_profile_cache  # Will save the updated cache to the profile
      return_hash[:profile] = { :updated => [ profile.get_attributes ] } if profile
      MDMAuditor.profile_updated(profile.session, profile, "updated knob set #{knob_set_class}")
    end
    return return_hash
  end

  #-------------------------------------------------------------------------

  def self.destroy(knob_set_class, knob_set_id)
    klass = self.get_knob_set_class(knob_set_class)
    return nil unless klass

    knob_set = klass.find_by_id(knob_set_id)
    profile = knob_set.profile

    knob_set_attr = knob_set.get_attributes # Grab before we delete
    knob_set.delete
    return_hash = { knob_set_class => { :deleted => [knob_set_attr] } }

    if profile
      MDMAuditor.profile_updated(profile.session, profile, "removed knob set #{knob_set_class}")
      profile.generate_profile_cache  # Will save the updated cache to the profile
      return_hash[:profile] = { :updated => [profile.get_attributes] }
    end

    return return_hash
  end  

  #-------------------------------------------------------------------------

  def self.get_details(knob_set_class, knob_set_id, incoming_request)
    klass = self.get_knob_set_class(knob_set_class)
    return nil unless klass

    return { knob_set_class => { :retrieved => klass.find( :all, :conditions => [ "id in (?)", incoming_request["ids"] ] ).collect { |detail| detail.get_attributes } } }
  end
  
  #-------------------------------------------------------------------------

  def self.add_file(knob_set_class, knob_set_id, incoming_request)
    klass = self.get_knob_set_class(knob_set_class)
    return nil unless klass
      
    knob_set = klass.find_by_id(knob_set_id)
    file = DataFile.find_by_id(incoming_request["file"])
    file.knob_set = knob_set
    file.save
    return_hash = { :file => { :updated => [ file.get_attributes ] }, knob_set_class => { :updated => [ knob_set.get_attributes ] } }

    profile = knob_set.profile
    if profile
      profile.generate_profile_cache  # Will save the updated cache to the profile
      MDMAuditor.profile_updated(profile.session, profile, "added file to knob set #{knob_set_class}")
      return_hash[:profile] = { :updated => [ profile.get_attributes ] }
    end
    return return_hash
  end

  #-------------------------------------------------------------------------

  def self.get_files(knob_set_class, knob_set_id)
    klass = self.get_knob_set_class(knob_set_class)
    return nil unless klass

    knob_set = klass.find_by_id(knob_set_id)
    return { :file          => { :updated => [ file.get_attributes ] },
             knob_set_class => { :updated => [ knob_set.get_attributes ] } }
  end

  #-------------------------------------------------------------------------

end
