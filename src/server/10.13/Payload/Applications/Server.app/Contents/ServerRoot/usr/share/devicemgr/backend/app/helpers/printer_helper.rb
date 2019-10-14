#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
module PrinterHelper
#-------------------------------------------------------------------------

  def self.find_all
    return { :printer => { :retrieved => Printer.find(:all).collect { |detail| detail.get_attributes } } }
  end # self.find_all

  #-------------------------------------------------------------------------

  def self.get_details(incoming_request)
    return { :printer => { :retrieved => Printer.find( :all, :conditions => [ "id in (?)", incoming_request["ids"] ] ).collect { |detail| detail.get_attributes } } }
  end # self.get_details

#-------------------------------------------------------------------------
end # module PrinterHelper
#-------------------------------------------------------------------------
