#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
module KnobSetHelper
#-------------------------------------------------------------------------

  def self.add_file(knob_set_class, knob_set_id, incoming_request)
    klass = self.get_knob_set_class(knob_set_class)
    knob_set = klass.find_by_id(knob_set_id)
    file = DataFile.find_by_id(incoming_request['file'])
    file.knob_set = knob_set
    file.save
    return_hash = { :file => { :updated => [ file.get_attributes ] }, knob_set_class => { :updated => [ knob_set.get_attributes ] } }

    # profile = knob_set.profile
    profile = Profile.find_by_library_item_id(knob_set.library_item_id)
    if profile
      profile.update_profile_cache  # Will save the updated cache to the profile
      MDMAuditor.profile_updated(profile.session, profile, "added file to knob set #{knob_set_class}")
      return_hash[:profile] = { :updated => [ profile.get_attributes ] }
    end
    return return_hash
  end # self.add_file

  #-------------------------------------------------------------------------

  def self.create(knob_set_class, incoming_request)
    # Make sure we have the requested profile
    profile_id    = incoming_request.delete('profile')
    data_file_ids = incoming_request.delete('data_files')

    profile = Profile.find_by_id(profile_id)
    unless profile
      Rails.logger.error("no profile with id #{profile_id}")
      return {:profile => { :deleted => [ { :id => profile_id } ] } }
    end

    klass = self.get_knob_set_class(knob_set_class)

    if knob_set_class == 'GeneralKnobSet'
      knob_set = profile.general_knob_set   # Just load the existing GKS data, we won't update it, as it's created with defaults.
    elsif knob_set_class == AppConfiguration.knob_set_class_name
      # Make sure there aren't two AppConfigurations for the same bundle_id
      lit       = profile.library_item_id
      bundle_id = incoming_request['settings_identifier'] = incoming_request.delete('Identifier')
      knob_set  = AppConfiguration.find(:first, :conditions => ['settings_identifier = ? AND library_item_id = ?', bundle_id, lit]) if bundle_id
      Rails.logger.error("Ignoring attempt to create 2nd AppConfiguration knob set for app '#{bundle_id}' on profile #{profile_id}. Using existing knob set.") if knob_set
      data_file_ids = nil

      knob_set ||= AppConfiguration.new
      knob_set.update_from_hash(incoming_request)
      knob_set.library_item_id  = lit
      knob_set.settings_version = (knob_set.settings_version || 0) + 1
    else
      if klass.unique?
        # Make sure we're not trying to create more than one of the unique knob sets
        knob_set = klass.first(:conditions => ['library_item_id = ?', profile.library_item_id])
        Rails.logger.error("Ignoring attempt to create 2nd unique knob set of class #{klass} on profile #{profile.library_item_id}. Using existing knob set.") if knob_set
      end
      knob_set ||= klass.new
      knob_set.update_from_hash(incoming_request)
      knob_set.profile = profile
    end
    knob_set.save
    knob_set.update_model_to_many_relationships(incoming_request) if knob_set.respond_to?(:also_modifies)

    # Set a DataFile to be owned by this KnobSet if specified (but make sure the KnobSet can own a DataFile!)
    if data_file_ids
      if knob_set.respond_to?(:data_file)
        data_file = DataFile.find_by_id(data_file_ids[0])
        if data_file
          data_file.owner = knob_set  # Calls .save on the data_file object
          knob_set.save     # Save again to give the knob set a chance to parse the data file we just associated with it
        else
          Rails.logger.error("Ignoring attempt to set a non-existent DataFile (#{data_file_ids[0]}) on KnobSet of class #{knob_set.class}")
        end
      else
        Rails.logger.error("Ignoring attempt to add a DataFile to a KnobSet (#{knob_set.class}) that doesn't support DataFiles")
      end
    end

    profile.admin_session_id = nil        # It's a valid profile now. (We may not get a Profile.update request, so we also have to trigger on KnobSet.create)
    profile.update_profile_cache unless knob_set_class == AppConfiguration.knob_set_class_name || knob_set_class == 'GeneralKnobSet'  # Will save the updated cache to the profile

    return_hash = { knob_set_class => { :updated => [ knob_set.get_attributes ] } }
    MDMAuditor.profile_updated(profile.session, profile, "added payload #{knob_set_class}")

    return_hash[:profile]  = { :updated => [ profile.get_attributes ] }
    return return_hash
  end # self.create

  #-------------------------------------------------------------------------

  def self.destroy(knob_set_class, knob_set_id)
    klass = self.get_knob_set_class(knob_set_class)
    knob_set = klass.find_by_id(knob_set_id)
    profile = Profile.find_by_library_item_id(knob_set.library_item_id)
    # profile = knob_set.profile
    knob_set_attr = knob_set.get_attributes # Grab before we delete
    knob_set.delete
    return_hash = { knob_set_class => { :deleted => [knob_set_attr] } }
    if profile
      MDMAuditor.profile_updated(profile.session, profile, "removed knob set #{knob_set_class}")
      profile.update_profile_cache unless knob_set_class == AppConfiguration.knob_set_class_name  # Will save the updated cache to the profile
      return_hash[:profile] = { :updated => [profile.get_attributes] }
    end
    return return_hash
  end # self.destroy

  #-------------------------------------------------------------------------

  def self.get_details(knob_set_class, knob_set_id, incoming_request)
    klass = self.get_knob_set_class(knob_set_class)
    return { knob_set_class => { :retrieved => klass.find( :all, :conditions => [ 'id in (?)', incoming_request['ids'] ] ).collect { |detail| detail.get_attributes } } }
  end # self.get_details

  #-------------------------------------------------------------------------

  def self.get_files(knob_set_class, knob_set_id)
    klass = self.get_knob_set_class(knob_set_class)
    knob_set = klass.find_by_id(knob_set_id)
    return { :file          => { :updated => [ file.get_attributes ] },
             knob_set_class => { :updated => [ knob_set.get_attributes ] } }
  end # self.get_files

  #-------------------------------------------------------------------------

  def self.get_knob_set_class(string)
    return GeneralKnobSet   if string == 'GeneralKnobSet'
    return AppConfiguration if string == AppConfiguration.knob_set_class_name
    raise "KnobSetHelper: Attempted to operate on an invalid knob set type '#{string}'" unless MDMUtilities.knob_set_class_names.include?(string)
    return Kernel.const_get(string)
  end # self.get_knob_set_class

  #-------------------------------------------------------------------------

  def self.update(knob_set_class, knob_set_id, incoming_request)
    klass = self.get_knob_set_class(knob_set_class)
    knob_set = klass.find_by_id(knob_set_id)

    knob_set.update_model_to_many_relationships(incoming_request) if knob_set.respond_to?(:also_modifies)
    profile_id = incoming_request.delete('profile_id')
    incoming_request.delete('profile')    # Remove the relationship so update_from_hash doesn't try to update it
    incoming_request.delete('library_item_id')
    incoming_request['settings_identifier'] = incoming_request.delete('Identifier') if knob_set_class == AppConfiguration.knob_set_class_name   # Re-map key
    knob_set.update_from_hash(incoming_request)
    knob_set.settings_version = (knob_set.settings_version || 0) + 1
    knob_set.save
    return_hash = { knob_set_class => { :updated => [ knob_set.get_attributes ] } }

    profile = Profile.find_by_id(profile_id)
    if profile
      profile.admin_session_id = nil        # It's a valid profile now. (We may not get a Profile.update request, so we also have to trigger on KnobSet.create)
      profile.update_profile_cache unless knob_set_class == AppConfiguration.knob_set_class_name  # Will save the updated cache to the profile
      return_hash[:profile] = { :updated => [ profile.get_attributes ] }
      MDMAuditor.profile_updated(profile.session, profile, "updated knob set #{knob_set_class}")
    else
      Rails.logger.error("Did not find profile with id #{profile_id}!")
    end
    return return_hash
  end # self.update

#-------------------------------------------------------------------------
end # module KnobSetHelper
#-------------------------------------------------------------------------
