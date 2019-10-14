#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

module AutoJoinProfileHelper

  def self.create(incoming_request)
    auto_join_profile = AutoJoinProfile.new
    temporary_id = incoming_request["temporary_id"]
    auto_join_profile.update_from_hash(incoming_request)
    auto_join_profile.save
    auto_join_profile.update_model_to_many_relationships(incoming_request)

    return_hash = { :auto_join_profile => { :created => [ auto_join_profile.get_attributes.merge({ :temporary_id => temporary_id }) ] } }
    return return_hash
  end

  #-------------------------------------------------------------------------

  def self.update(auto_join_profile_id, incoming_request)
    auto_join_profile = AutoJoinProfile.find_by_id(auto_join_profile_id)
    auto_join_profile.attributes.each do |key, value|
      if incoming_request.has_key?(key) && !incoming_request[key].nil? # Make sure we're not setting something like reg_challenge to nil
        auto_join_profile[key] = incoming_request[key]
      end
    end

    auto_join_profile.save
    auto_join_profile.update_model_to_many_relationships(incoming_request)
    auto_join_profile.reload

    return_hash = { :auto_join_profile => { :updated => [ auto_join_profile.get_attributes ] } }
    return return_hash
  end

  #-------------------------------------------------------------------------

  def self.destroy(auto_join_profile_id)
    auto_join_profile = AutoJoinProfile.find_by_id(auto_join_profile_id)
    return_hash = { :auto_join_profile => { :deleted => [auto_join_profile.get_attributes] } }
    auto_join_profile.delete
    return return_hash
  end

  #-------------------------------------------------------------------------

  def self.get_details(incoming_request)
    return_hash = { :auto_join_profile => { :retrieved => AutoJoinProfile.find( :all, :conditions => [ "id in (?)", incoming_request["ids"] ] ).collect { |detail| detail.get_attributes } } }
    return return_hash
  end

  #-------------------------------------------------------------------------

  def self.find_all(remote_guid)
    auto_join_profile_hash = { :remote => { remote_guid.to_sym => [ [ :auto_join_profile ] ] } }
    auto_join_profiles = AutoJoinProfile.find(:all, :order => :name)

    auto_join_profiles.each { |auto_join_profile| auto_join_profile_hash[:remote][remote_guid.to_sym][0].push(auto_join_profile.id) }

    return auto_join_profile_hash
  end

  #-------------------------------------------------------------------------

end
