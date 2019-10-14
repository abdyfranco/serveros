#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

module ProvisioningProfileHelper

  #-------------------------------------------------------------------------

  def self.create_from_file(file_data)
    provisioning_profile_file = DataFile.save(file_data)
    provisioning_profile = ProvisioningProfile.new
    provisioning_profile.data_file = provisioning_profile_file
    
    signed_file = OpenSSL::PKCS7.new(provisioning_profile_file.read)
    store = OpenSSL::X509::Store.new
    signed_file.verify(nil, store, nil, OpenSSL::PKCS7::NOVERIFY)
    # profile_hash = Plist::parse_xml(signed_file.data)
    plist = CFPropertyList::List.new(:data => signed_file.data)
    profile_hash = CFPropertyList.native_types(plist.value)
    
    old_provisioning_profile = ProvisioningProfile.find_by_UUID(profile_hash["UUID"])
    old_provisioning_profile.destroy if old_provisioning_profile
    
    profile_hash["name"] = profile_hash["Name"]
    profile_hash.delete("Name")
    provisioning_profile.update_from_hash(profile_hash)
    profile_hash["ProvisionedDevices"].each do |udid|
      device = Device.find_by_udid(udid)
      provisioning_profile.devices.push(device) if device
    end
    provisioning_profile.save
    
    return { :file                 => { :created => [provisioning_profile_file.get_attributes] },
             :provisioning_profile => { :created => [provisioning_profile.get_attributes] } }
  end

  #-------------------------------------------------------------------------

  def self.destroy(provisioning_profile_id)
    provisioning_profile = ProvisioningProfile.find_by_id(provisioning_profile_id)
    pp_attr = provisioning_profile.get_attributes # Grab before delete
    
    provisioning_profile.delete
    return { :provisioning_profile => { :deleted => [pp_attr] } }
  end  

  #-------------------------------------------------------------------------

  def self.get_details(incoming_request)
    provisioning_profiles = ProvisioningProfile.find( :all, :conditions => [ "id in (?)", incoming_request["ids"] ] ).collect { |provisioning_profile| provisioning_profile.get_attributes }
    return_hash = { :provisioning_profile => { :retrieved => provisioning_profiles } }
    return return_hash
  end
  
  #-------------------------------------------------------------------------
  def self.find_all(remote_guid)
    provisioning_profile_hash = { :remote => { remote_guid.to_sym => [ [:provisioning_profile] ] } }
    provisioning_profiles = ProvisioningProfile.find(:all, :order => :name)
    provisioning_profiles.each { |provisioning_profile| provisioning_profile_hash[:remote][remote_guid.to_sym][0].push(provisioning_profile.id) }
    return provisioning_profile_hash
  end

  #-------------------------------------------------------------------------

end
