#!/Applications/Server.app/Contents/ServerRoot/usr/bin/ruby

# Copyright (c) 2006-2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#

# This is the web service plugin for the changeip(8) tool
#
# Revise the Apache 2 configuration to reflect new IP and hostname
# - For appropriate Apache directives, change the IP and hostname
# - Rename virtual host config files
# - Update the servermgr plist file

require 'fileutils'
require 'cfpropertylist'

$SERVER_LIBRARY_PATH = "/Library/Server"
$ApacheConfigDir = $SERVER_LIBRARY_PATH + "/Web/Config/apache2"

if ARGV[0] == "-v"
	$verbose = true
	ARGV.delete(ARGV[0])
else
	$verbose = false
end
if ARGV.size != 2 && ARGV.size != 4
	print "usage: #{$0} [-v] old-ip new-ip [old-hostname new-hostname]\n"
	exit
end
$oldIP = ARGV[0]
$newIP = ARGV[1] 
if ARGV.size == 4
	$oldHost = ARGV[2]
	$newHost = ARGV[3]
else
	$oldHost = ""
	$newHost = ""
end
def fix_line(line, newFile)
	parts = line.strip.split(/\s+/)
	if !parts[0] || parts[0] =~ /^#+$/
		newFile.puts(line)
	else
		cmd = parts[0]
		if parts[1]
			arg1 = parts[1]
		else
			arg1 = ""
		end
		if parts[2]
			arg2 = parts[2]
		else
			arg2 = ""
		end
		case cmd
			when "<VirtualHost"
				arg1parts = arg1.chomp(">").split(":")
				addr = nil
				if arg1parts.length > 1
					addr = arg1parts[0]
					port = arg1parts[1]
					if addr == $oldIP
						revisedarg1 = $newIP + ":" + port
					else
						revisedarg1 = addr + ":" + port
					end
				else
					revisedarg1 = arg1parts[0]
				end
				newFile.puts("<VirtualHost " + revisedarg1 + ">")
			when "NameVirtualHost"
			#remove NameVirtualHost, deprecated in Apache 2.4
			when "Listen"
				arg1parts = arg1.chomp(">").split(":")
				addr = nil
				if arg1parts.length > 1
					addr = arg1parts[0]
					port = arg1parts[1]
					if addr == $oldIP
						revisedarg1 = $newIP + ":" + port
					else
						revisedarg1 = addr + ":" + port
					end
				else
					revisedarg1 = arg1parts[0]
				end
				newFile.puts(cmd + " " + revisedarg1)
			when "ServerName"
				if $oldHost == arg1
					newFile.puts("ServerName " + $newHost)
				else
					newFile.puts(line)
				end
			else 
				newFile.puts(line)
		end
	end
end
print "oldIP=" + $oldIP + " newIP=" + $newIP + " oldHost=" + $oldHost + " newHost=" + $newHost + "\n" if $verbose
Dir.open("#{$ApacheConfigDir}/sites").each { |oldVHostFileName|
	next if (oldVHostFileName == '.' || oldVHostFileName == '..')
	next unless (oldVHostFileName =~ /.conf$/)
	if oldVHostFileName == "virtual_host_global.conf"
		print "Processing directives in virtual host global file" + "\n" if $verbose
		oldFile = File.open("#{$ApacheConfigDir}/sites/virtual_host_global.conf")
		newFile = File.new("#{$ApacheConfigDir}/sites/virtual_host_global.conf-new", "a")
		oldFile.each_line { |line|
			fix_line(line, newFile)
		}
		newFile.close
		oldFile.close
		File.delete("#{$ApacheConfigDir}/sites/virtual_host_global.conf")
		File.rename("#{$ApacheConfigDir}/sites/virtual_host_global.conf-new", "#{$ApacheConfigDir}/sites/virtual_host_global.conf")
	else
		if oldVHostFileName =~ /_shadow.conf$/
			(number,ip,port,host) = oldVHostFileName.strip.sub(/_shadow/, '').split(/_/)
			next if (number == nil || ip ==nil || port==nil || host==nil)
			host.sub!(/.conf/, "")
			newVHostFileName = number + "_" + (ip == $oldIP ? $newIP : ip) + "_" + port + "_" + (host == $oldHost ? $newHost : host) + "_shadow.conf"
		else
			(number,ip,port,host) = oldVHostFileName.strip.split(/_/)
			next if (number == nil || ip ==nil || port==nil || host==nil)
			host.sub!(/.conf/, "")
			newVHostFileName = number + "_" + (ip == $oldIP ? $newIP : ip) + "_" + port + "_" + (host == $oldHost ? $newHost : host) + ".conf"
		end
		if (oldVHostFileName != newVHostFileName)
			print "Revising directives from " + oldVHostFileName + " into new file " + newVHostFileName + "\n" if $verbose
			oldFile = File.open("#{$ApacheConfigDir}/sites/" + oldVHostFileName)
			newFile = File.new("#{$ApacheConfigDir}/sites/" + newVHostFileName, "a")
			oldFile.each_line { |line|
				fix_line(line, newFile)
			}
			oldFile.close
			newFile.close
			File.delete("#{$ApacheConfigDir}/sites/" + oldVHostFileName)
		else
			print "Ignoring " + oldVHostFileName + "\n" if $verbose
		end
	end
}
plist = CFPropertyList::List.new(:file => "#{$ApacheConfigDir}/servermgr_web_apache2_config.plist")
webDict = CFPropertyList.native_types(plist.value)
print "Processing #{$ApacheConfigDir}/servermgr_web_apache2_config.plist" + "\n" if $verbose
changed = 0
if (sitesArray = webDict["Sites"]) != nil
	sitesArray.each do |siteDict|
		key = siteDict["_id_"]
		next if key == "default_default"
		parts = key.strip.split(":")
		ip = parts[0]
		next if ip == "*"
		if parts.length > 1
			host_port_parts = parts[1].split("_")
			if host_port_parts.length > 1
				port = host_port_parts[0]
				host = host_port_parts[1]
			else
				port = ""
				host = ""
			end
		else
			port = ""
			host = ""
		end
		newKey = (ip == $oldIP ? $newIP : ip) + ":" + port + "_" + (host == $oldHost ? $newHost : host)
		if key.to_s != newKey 
			changed = changed + 1
			print "Changing key " + key.to_s + " to " + newKey + "\n" if $verbose
			siteDict["_id_"] = newKey
		end
	end
end
if changed > 0
	print "Rewriting #{$ApacheConfigDir}/servermgr_web_apache2_config.plist with " + changed.to_s + " changed key(s)\n" if $verbose
	plist = CFPropertyList::List.new
	plist.value = CFPropertyList.guess(webDict)
	plist.save("#{$ApacheConfigDir}/servermgr_web_apache2_config.plist", CFPropertyList::List::FORMAT_XML)
end

print "Finished" + "\n" if $verbose
