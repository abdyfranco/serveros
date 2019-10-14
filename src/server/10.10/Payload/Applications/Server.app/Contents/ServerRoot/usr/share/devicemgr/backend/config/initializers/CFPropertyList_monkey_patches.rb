#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class BinaryData < String
  def to_plist_node
    return "<data>#{self.to_s}</data>\n"
  end
end

#-------------------------------------------------------------------------

# Profile Manager (almost?) never uses binary-formatted plists.
# So rather than change all calls to to_plist, let's change the default

require 'cfpropertylist'

module CFPropertyList
  class << self
    
    # This is so we can use pre-encoded base64 strings as <data> blobs
    def guess_with_dm(object, options = {})
      case object
      when BinaryData
        CFData.new(object, CFData::DATA_BASE64)
      when Hash
        hsh = Hash.new
        object.each_pair { |k,v|
          unless v.nil?
            k = k.to_s if k.is_a?(Symbol)
            hsh[k] = CFPropertyList.guess(v, options)
          else
            Rails.logger.error("CFPropertyList.guess: got nil value for key #{k}, will not be included in final plist") if MDMLogger.debugOutput?
          end
        }
        CFDictionary.new(hsh)
      else
        Rails.logger.error("CFPropertyList.guess: Got nil object!") if object.nil? && MDMLogger.debugOutput?
        guess_without_dm(object, options)
      end
    end

    alias_method_chain :guess, :dm
  end # class << self

  class CFData
    alias old_initialize initialize
    # This to set the type of the <data></data> correctly
    def initialize(value=nil,format=DATA_BASE64)      
      if(format == DATA_RAW)
        value = Blob.new(value)      
      end
      old_initialize(value, format)
    end
  end
end

#-------------------------------------------------------------------------
# Array
#-------------------------------------------------------------------------

Array.class_eval do

  #-------------------------------------------------------------------------

  if self.method_defined?(:to_plist)
    def to_plist_with_dm(options=nil)
      options = { :plist_format => CFPropertyList::List::FORMAT_XML } unless options
      return to_plist_without_dm(options)
    end
    
    alias_method_chain :to_plist, :dm
  end

  #-------------------------------------------------------------------------

  # Also add convenience methods to import straight from a plist string and file
  def self.from_plist(data)
    plist = CFPropertyList::List.new(:data => data)
    result = CFPropertyList.native_types(plist.value)
    unless result.instance_of?(Array)
      Rails.logger.error("Plist is not an array")
      result = nil
    end
    return result
  end

  #-------------------------------------------------------------------------

  def self.from_plist_file(path)
    plist = CFPropertyList::List.new(:file => path)
    result = CFPropertyList.native_types(plist.value)
    unless result.instance_of?(Array)
      Rails.logger.error("Plist is not an array")
      result = nil
    end
    return result
  end

  #-------------------------------------------------------------------------

end

#-------------------------------------------------------------------------
# Enumerator
#-------------------------------------------------------------------------

Enumerator.class_eval do

  #-------------------------------------------------------------------------

  if self.method_defined?(:to_plist)
    def to_plist_with_dm(options=nil)
      options = { :plist_format => CFPropertyList::List::FORMAT_XML, } unless options
      return to_plist_without_dm(options)
    end
    
    alias_method_chain :to_plist, :dm
  end

  #-------------------------------------------------------------------------

end

#-------------------------------------------------------------------------
# Hash
#-------------------------------------------------------------------------

Hash.class_eval do

  #-------------------------------------------------------------------------

  if self.method_defined?(:to_plist)
    def to_plist_with_dm(options=nil)
      options = { :plist_format => CFPropertyList::List::FORMAT_XML } unless options
      return to_plist_without_dm(options)
    end
    
    alias_method_chain :to_plist, :dm
  end

  #-------------------------------------------------------------------------

  # Also add convenience methods to import straight from a plist string and file
  def self.from_plist(data)
    plist = CFPropertyList::List.new(:data => data)
    result = CFPropertyList.native_types(plist.value)
    unless result.instance_of?(Hash)
      Rails.logger.error("Plist is not a hash")
      result = nil
    end
    return result
  end

  #-------------------------------------------------------------------------

  def self.from_plist_file(path)
    plist = CFPropertyList::List.new(:file => path)
    result = CFPropertyList.native_types(plist.value)
    unless result.instance_of?(Hash)
      Rails.logger.error("Plist is not a hash")
      result = nil
    end
    return result
  end

  #-------------------------------------------------------------------------

end

#-------------------------------------------------------------------------
# String
#-------------------------------------------------------------------------

class String
  
  #-------------------------------------------------------------------------

  def parse_plist
    plist = CFPropertyList::List.new(:data => self)
    return CFPropertyList.native_types(plist.value)
  end

  #-------------------------------------------------------------------------

  def parse_plist_path
    plist = CFPropertyList::List.new(:file => self)
    return CFPropertyList.native_types(plist.value)
  end

  #-------------------------------------------------------------------------

end
