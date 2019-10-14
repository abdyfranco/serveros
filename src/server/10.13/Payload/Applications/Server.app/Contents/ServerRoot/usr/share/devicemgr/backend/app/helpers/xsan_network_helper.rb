#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

module XsanNetworkHelper

  #-------------------------------------------------------------------------

  def self.find_all
    xsan_network_array = XsanNetwork.find(:all).collect { |xsan_network| xsan_network.get_attributes }
    return { :xsan_network => { :retrieved => xsan_network_array } }
  end

  #-------------------------------------------------------------------------

  def self.get_details(incoming_request)
    xsan_network_array = xsan_network.find(:all, :conditions => [ "id in (?)", incoming_request["ids"] ]).collect { |xsan_network| xsan_network.get_attributes }
    return { :xsan_network => { :retrieved => xsan_network_array } }
  end

  #-------------------------------------------------------------------------

  def self.create(incoming_request)
    raise "Can't create Xsan Networks"
  end

  #-------------------------------------------------------------------------

  def self.destroy(id)
    raise "Can't destroy Xsan Networks"
  end

  #-------------------------------------------------------------------------

  def self.update(app_id, incoming_request)
    raise "Can't modify Xsan Networks"
  end

  #-------------------------------------------------------------------------

end
