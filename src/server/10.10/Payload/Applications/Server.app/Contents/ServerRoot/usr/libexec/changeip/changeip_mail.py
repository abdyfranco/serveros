#!/usr/bin/python -u
#
# Copyright (c) 2010-2014 Apple Inc. All rights reserved.
# 
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
# 
# Redistribution and use in source and binary forms, with or without  
# modification, are permitted provided that the following conditions  
# are met:
# 
# 1.  Redistributions of source code must retain the above copyright  
# notice, this list of conditions and the following disclaimer.
# 2.  Redistributions in binary form must reproduce the above  
# copyright notice, this list of conditions and the following  
# disclaimer in the documentation and/or other materials provided  
# with the distribution.
# 3.  Neither the name of Apple Inc. ("Apple") nor the names of its  
# contributors may be used to endorse or promote products derived  
# from this software without specific prior written permission.
# 
# THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND  
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,  
# THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A  
# PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS  
# CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,  
# SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT  
# LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF  
# USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND  
# ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,  
# OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT  
# OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF  
# SUCH DAMAGE.

import subprocess
import sys
import syslog
import string
import getopt
import re
import os

def usage():
    name = os.path.basename(sys.argv[0])
    print "Usage: %s [-hv] old-ip new-ip [old-hostname new-hostname]" % (name,)
    print "  Options:"
    print "    -h           - print this message and exit"
    print "    -v           - print additional information when running"
    print "  Arguments:"
    print "    old-ip       - current IPv4 address of the server"
    print "    new-ip       - new IPv4 address of the server"
    print "    old-hostname - current FQDN for the server"
    print "    new-hostname - new FQDN for the server"

if len(sys.argv) < 2:
	usage()
	sys.exit(1)

try:
	opts, args = getopt.getopt(sys.argv[1:], "mnv")
except getopt.GetoptError:
	# print help information and exit:
	print "Invalid Parameters"
	usage()
	sys.exit(1)
	
dryrun = False
verbose = False
for o, a in opts:
	if o == "-n":
		dryrun = True
	elif o == "-v":
		verbose = True

if len(args) != 2 and len(args) != 4:
	print "Missing or extra arguments."
	usage()
	sys.exit(1)

print "Changing IP Addresses and host names for Mail Server"

oldIP = args[0]
newIP = args[1]
oldHost = False
newHost = False
oldNick = False
newNick = False
oldDomain = False
newDomain = False
if verbose: print "IP: " + oldIP + " -> " + newIP
if len(args) == 4:
	oldHost = args[2]
	newHost = args[3]
	if verbose: print "host: \"" + oldHost + "\" -> \"" + newHost + "\""
	oldParts = re.split(r'\.', oldHost)
	newParts = re.split(r'\.', newHost)
	if len(oldParts) > 1 and len(newParts) > 1:
		oldNick = oldParts[0]
		newNick = newParts[0]
		if verbose: print "nick: \"" + oldNick + "\" -> \"" + newNick + "\""
		oldDomain = ".".join(oldParts[1:])
		newDomain = ".".join(newParts[1:])
		if verbose: print "domain: \"" + oldDomain + "\" -> \"" + newDomain + "\""

## Get the all current settings that contain hostnames or IPs
p = subprocess.Popen(["/Applications/Server.app/Contents/ServerRoot/usr/sbin/serveradmin","settings"], close_fds=True,
					 stdin=subprocess.PIPE, stdout=subprocess.PIPE,
					 stderr=subprocess.PIPE)
p.stdin.writelines(["mail:imap:notification_server_address\n",
					"mail:imap:servername\n",
					"mail:imap:urlauth_hostport\n",
					"mail:imap:postmaster_address\n",
					"mail:postfix:myhostname\n",
					"mail:postfix:mydomain\n",
					"mail:postfix:submit_cred\n",
					""])
p.stdin.flush()
p.stdin.close()
oldSettings = p.stdout.readlines()
if verbose:
	print "OLD MAIL SETTINGS"
	print "\n\t%s" % "\t".join(oldSettings)

syslog.openlog(logoption=syslog.LOG_PID, facility=syslog.LOG_SYSLOG)
syslog.syslog(syslog.LOG_NOTICE, "%s" % string.join(["Mail Service change IP: old hostname: \"",oldHost," (",oldIP,")\""," to: new hostname: \"",newHost," (",newIP,")\""],""))

## Perform appropriate replacements.  
# IMPORTANT: Be sure to search for quoted hostnames just in 
#            case someone has an oldHost of something like "mail or postfix"
newSettings = []
okToChangeDomain = False
for s in oldSettings:
	if s.find("\""+oldIP+"\"") != -1:
		newSettings.append(s.replace(string.join(["\"",oldIP,"\""],""), string.join(["\"",newIP,"\""],"")))
	elif s.find(":"+oldIP+":") != -1:
		newSettings.append(s.replace(string.join([":",oldIP,":"],""), string,join([":",newIP,":"],"")))
	elif s.find(":"+oldIP+"\\:") != -1:
		newSettings.append(s.replace(string.join([":",oldIP,"\\:"],""), string,join([":",newIP,"\\:"],"")))
	elif oldHost and s.find("\""+oldHost+"\"") != -1:
		newSettings.append(s.replace(string.join(["\"",oldHost,"\""],""), string.join(["\"",newHost,"\""],"")))
		okToChangeDomain = True
	elif oldHost and s.find(":"+oldHost+":") != -1:
		newSettings.append(s.replace(string.join([":",oldHost,":"],""), string.join([":",newHost,":"],"")))
		okToChangeDomain = True
	elif oldHost and s.find(":"+oldHost+"\\:") != -1:
		newSettings.append(s.replace(string.join([":",oldHost,"\\:"],""), string.join([":",newHost,"\\:"],"")))
		okToChangeDomain = True
	elif oldHost and s.find("@"+oldHost+"\"") != -1:
		newSettings.append(s.replace(string.join(["@",oldHost,"\""],""), string.join(["@",newHost,"\""],"")))
		okToChangeDomain = True
	elif oldNick and s.find("\""+oldNick+"\"") != -1:
		newSettings.append(s.replace(string.join(["\"",oldNick,"\""],""), string.join(["\"",newNick,"\""],"")))
	elif oldNick and s.find(":"+oldNick+":") != -1:
		newSettings.append(s.replace(string.join([":",oldNick,":"],""), string.join([":",newNick,":"],"")))
	elif oldNick and s.find(":"+oldNick+"\\:") != -1:
		newSettings.append(s.replace(string.join([":",oldNick,"\\:"],""), string.join([":",newNick,"\\:"],"")))
	elif newHost and s.find("\""+newHost+"\"") != -1:
		okToChangeDomain = True
if okToChangeDomain:
	for s in oldSettings:
		if oldDomain and s.find("\""+oldDomain+"\"") != -1:
			newSettings.append(s.replace(string.join(["\"",oldDomain,"\""],""), string.join(["\"",newDomain,"\""],"")))
		elif oldDomain and s.find(":"+oldDomain+":") != -1:
			newSettings.append(s.replace(string.join([":",oldDomain,":"],""), string.join([":",newDomain,":"],"")))
		elif oldDomain and s.find(":"+oldDomain+"\\:") != -1:
			newSettings.append(s.replace(string.join([":",oldDomain,"\\:"],""), string.join([":",newDomain,"\\:"],"")))
		elif oldDomain and s.find("@"+oldDomain+"\"") != -1:
			newSettings.append(s.replace(string.join(["@",oldDomain,"\""],""), string.join(["@",newDomain,"\""],"")))

# Update host & domain whitelists
	if newHost:
		newSettings.append(string.join(["mail:postfix:add_whitelist_host = \"",newHost,"\"\n"],""))
	if newDomain:
		newSettings.append(string.join(["mail:postfix:add_whitelist_domain = \"",newDomain,"\"\n"],""))

## Write the new settings back out
if verbose:
	print "NEW MAIL SETTINGS"
	print "\t%s" % "\t".join(newSettings)

if not dryrun:
	syslog.syslog(syslog.LOG_NOTICE, "Mail Service new host/domain/IP settings:\n\t%s" % "\t".join(newSettings))
	syslog.closelog()
	p = subprocess.Popen(["/Applications/Server.app/Contents/ServerRoot/usr/sbin/serveradmin","settings"], close_fds=True, 
						 stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
	p.stdin.writelines(newSettings)
	p.stdin.flush()
	p.stdin.close()
	p.wait()
