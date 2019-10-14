#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
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

    current_widgets = SystemApplicationUtility::get_all_widgets

    current_widgets.each{ |w_hash|
      w = Widget.find(:first, :conditions => {:identifier => w_hash['identifier']})
      if w
        # Update the name of the existing widget as well as the icon.
        w['display_name'] = w_hash['display_name']
        if w_hash.has_key?('icon')
          w['icon'] = "data:image/png;base64,".concat(w_hash['icon'])
        end
      else
        w = Widget.new
        w_hash.each { |key, value|
          if (key.to_s == 'icon')
            w[key] = "data:image/png;base64,".concat(value)
          else
            w[key] = value
          end
        }
      end
      w.save
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
