#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

module WidgetHelper
  
  #-------------------------------------------------------------------------

  # local query
  def self.find_all
    
    cached_w_identifiers = Widget.find(:all, :select => 'identifier').collect{|x| x.identifier}
    
    current_widgets = SystemApplicationUtility::get_all_widgets
    
    current_w_identifiers = current_widgets.collect{|x| x['identifier']}

    new_w_identifiers = current_w_identifiers - cached_w_identifiers
    # removed_w_identifiers = cached_w_identifiers - current_w_identifiers

    # Add new apps to database
    new_w_identifiers.each{|identifier|
      a_hash = current_widgets.select{|x| x['identifier'] == identifier}.first
      if (a_hash)
        a = Widget.new
        a_hash.each { |key, value| 
          if (key.to_s == 'icon')
            a[key] = "data:image/png;base64,".concat(value)         
          else
            a[key] = value             
          end
        }
        a.save
      end
    }
    
    # Remove non-existant printersfrom database
    # removed_w_identifiers.each{|identifier|
    #   a = Widget.find_by_identifier(identifier);
    #   if a
    #     a.deleted = true
    #     a.save
    #   end
    # }
    
    # I think this just wants the IDs
    return { :widget => { :retrieved => Widget.all.collect { |detail| detail.get_attributes } }}
  end
  
  #-------------------------------------------------------------------------

  def self.get_details(incoming_request)
    return_hash = { :widget => { :retrieved => Widget.find( :all, :conditions => [ "id in (?)", incoming_request["ids"] ] ).collect { |detail| detail.get_attributes } } }
    return return_hash
  end

  #-------------------------------------------------------------------------
  
end
