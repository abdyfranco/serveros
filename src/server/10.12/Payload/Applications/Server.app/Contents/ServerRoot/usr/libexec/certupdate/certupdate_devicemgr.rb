#!/usr/bin/env /Applications/Server.app/Contents/ServerRoot/usr/bin/ruby
#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

BACKEND = '/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend'

# certupdate_devicemgr.rb - serves as an interface between the rails app and certupdate
# This file is run by script/runner
#
# certHandler passed up to 5 args
# 	$1 - command  { "remove" | "replace" }
# 	$2 - cert_path
# 	$3 - cert_ref_base64 or "0x00" if not available
# 	$4 - new_cert_path
# 	$5 - new_cert_ref_base64 or "0x00" if not available
#
#  is this a cert I'm interested in?
#  no - return 0 (don't care)
#  yes -
# 	if command == remove
# 		complain to the HI
# 		return 1 (don't remove)
# 	if command == replace
# 		replace the old cert with the new one in the config
# 		restart the service if needed
# 		return 0 (all good)
# 	if there is an error return 2

require "#{BACKEND}/lib/DeviceManagerExtension"
require "#{BACKEND}/lib/devicemgrd_utility"
require 'cfpropertylist'

class CertUpdateHandler

  #-------------------------------------------------------------------------

  def self.run
    argc = ARGV.count
    raise "Insufficient number of arguments" if argc < 2

    req = { :command => 'certificateUpdated', :action => ARGV[0], :oldPath => ARGV[1] }
    req[:oldRef] = ARGV[2] if ARGV[2] && ARGV[2] != '0x00'
    if ARGV[0] == 'replace'
      req[:newPath] = ARGV[3]
      req[:newRef]  = ARGV[4] if ARGV[4] && ARGV[4] != '0x00'
    end
    self.send_devicemgrd_request(req)
  end

  #-------------------------------------------------------------------------

  def self.send_devicemgrd_request(request, async = false)
    return nil if request.nil? || request.empty?

    request['pid'] = Process.pid
    plist = request.to_plist(:plist_format => CFPropertyList::List::FORMAT_XML)

    result = DevicemgrdUtility.send_devicemgrd_request_string(plist, async)
    return nil if async || result.nil? || result == ''

    plist = CFPropertyList::List.new(:data => result)
    result = CFPropertyList.native_types(plist.value)

    yield result if block_given?
    return result
  end

  #-------------------------------------------------------------------------

end

#-------------------------------------------------------------------------

begin
  CertUpdateHandler::run
rescue => details
  puts "CertUpdateHandler: Exception caught #{details}:\n" + details.backtrace.join("\n")
  exit(2)
end

exit(0)
