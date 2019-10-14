#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

#-------------------------------------------------------------------------
module PrinterHelper
#-------------------------------------------------------------------------

  # local query
  def self.find_all
    current_printers = PrinterUtility::get_all_printers

    cached_printer_identifiers  = Printer.find(:all, :select => 'identifier').collect{ |x| x.identifier }
    current_printer_identifiers = current_printers.collect{ |x| x['identifier'] }
    new_printer_identifiers     = current_printer_identifiers - cached_printer_identifiers
    # removed_printer_identifiers = cached_printer_identifiers  - current_printer_identifiers

    # Add new printers to database
    new_printer_identifiers.each{ |identifier|
      p_hash = current_printers.select{ |x| x['identifier'] == identifier }.first
      next unless (p_hash)

      p = Printer.new
      p_hash.each { |key, value| p[key] = value if p.respond_to?(key) }
      p.save
    } # new_printer_identifiers.each

    # Remove non-existent printers from database
    # removed_printer_identifiers.each{ |identifier|
    #   p = Printer.find_by_identifier(identifier)
    #   d.destroy if p
    # }

    # I think this just wants the IDs
    return { :printer => { :retrieved => Printer.find(:all).collect { |detail| detail.get_attributes } } }
  end # self.find_all

  #-------------------------------------------------------------------------

  def self.get_details(incoming_request)
    return { :printer => { :retrieved => Printer.find( :all, :conditions => [ "id in (?)", incoming_request["ids"] ] ).collect { |detail| detail.get_attributes } } }
  end

#-------------------------------------------------------------------------
end # module PrinterHelper
#-------------------------------------------------------------------------
