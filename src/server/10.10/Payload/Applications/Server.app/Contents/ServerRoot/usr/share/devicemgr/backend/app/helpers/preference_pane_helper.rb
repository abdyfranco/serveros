#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

module PreferencePaneHelper

  # local query
  def self.find_all(incoming_request)
    locale = incoming_request["locale"]
    panes = PreferencePane.find(:all).collect { |pane| 
      pane_attributes = pane.get_attributes
      display_name_hash = JSON.parse(pane_attributes["display_name"])
      pane_attributes["display_name"] = display_name_hash[locale]
      pane_attributes
    }
    
    return { :preference_panes => { :retrieved =>  panes } }
  end

  #-------------------------------------------------------------------------

  def self.get_details(incoming_request)
    return_hash = { :preference_pane => { :retrieved => PreferencePane.find( :all, :conditions => [ "id in (?)", incoming_request["ids"] ] ).collect { |detail| detail.get_attributes } } }
    return return_hash
  end
  
  #-------------------------------------------------------------------------

end