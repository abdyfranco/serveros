#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

module PrinterHelper
  
  #-------------------------------------------------------------------------

  # local query
  def self.find_all
    current_printers = PrinterUtility::get_all_printers
    
    cached_printer_identifiers  = Printer.find(:all, :select => 'identifier').collect{|x| x.identifier}
    current_printer_identifiers = current_printers.collect{|x| x['identifier']}
    
    new_printer_identifiers     = current_printer_identifiers - cached_printer_identifiers
    # removed_printer_identifiers = cached_printer_identifiers  - current_printer_identifiers
    
    # Add new printers to database
    new_printer_identifiers.each{|identifier|
      p_hash = current_printers.select{|x| x['identifier'] == identifier}.first
      if (p_hash)
        p = Printer.new
        p_hash.each { |key, value| p[key] = value if p.respond_to?(key) }
        p.save
      end
    }
    
    # Remove non-existant printersfrom database
    # removed_printer_identifiers.each{|identifier|
    #   p = Printer.find_by_identifier(identifier);
    #   if p
    #     p.deleted = true
    #     p.save
    #   end
    # }
    
    # I think this just wants the IDs
    return { :printer => { :retrieved => Printer.find(:all).collect { |detail| detail.get_attributes } } }
  end
  
  #-------------------------------------------------------------------------

  def self.get_details(incoming_request)
    return_hash = { :printer => { :retrieved => Printer.find( :all, :conditions => [ "id in (?)", incoming_request["ids"] ] ).collect { |detail| detail.get_attributes } } }
    return return_hash
  end
  
  #-------------------------------------------------------------------------

end