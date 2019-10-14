#!/usr/bin/env /Applications/Server.app/Contents/ServerRoot/usr/bin/ruby

##
# Copyright (c) 2009-2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
# IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
# of the Apple Software and is subject to the terms and conditions of the Apple
# Software License Agreement accompanying the package this file is part of.
##

ENV['BUNDLE_GEMFILE'] = '/Applications/Server.app/Contents/ServerRoot/usr/share/collabd/gems/Gemfile'

require 'rubygems'
require 'bundler/setup'
require 'fileutils'
require 'cfpropertylist'
require 'collaboration/type_registry'
require 'collaboration/entity_types'
require 'collaboration/msgpack_encoder'
require 'collaboration/msgpack_decoder'
require 'collaboration/service_client'
require 'collaboration/mime_utils'

module Collaboration
  VERSION = '1.0.0'
  
  @@filedata_path = nil
  
  def self.filedata_path_from_config
    unless @@filedata_path
      config = self.dictionaryWithContentsOfFile('/Library/Server/Wiki/Config/collabd.plist')
      if config
        @@filedata_path = config['FileDataPath'] || '/Library/Server/Wiki/FileData'
      end
    end
    return @@filedata_path
  end
  
  def self.dictionaryWithContentsOfStringsFile(path)
    if !File.exists?(path)
      return nil
    end
    result = {}
    quoted = /\"((\\\"|[^\"])+)\"/
    File.open(path).each do |line|
      puts line
      if matches = line.match(/#{quoted}\s*=\s*#{quoted}/)
        result[matches[1]] = matches[3]
      end
    end
    return result
  end
  
  def self.dictionaryWithContentsOfFile(path)
    if !File.exists?(path)
      return nil
    end
    plist = CFPropertyList::List.new(:file => path)
    return CFPropertyList.native_types(plist.value)
  end
  
  def self.writePlistRepresentationOfDictionaryToPath(dict, path)
    plist = CFPropertyList::List.new
    plist.value = CFPropertyList.guess(dict, :convert_unknown_to_string => true)
    plist.save(path, CFPropertyList::List::FORMAT_XML)
  end
  
  def self.sharedSecret
	begin
	    shared_secret = File.read('/Library/Server/Wiki/Config/shared/shared_secret')
	    return shared_secret.lstrip.rstrip
	rescue
		return nil
	end
  end

end
