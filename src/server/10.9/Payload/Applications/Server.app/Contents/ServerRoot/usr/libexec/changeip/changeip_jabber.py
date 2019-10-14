#!/usr/bin/python -u
# Copyright (c) 2012-2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.

import os
import sys
import string
import getopt
from subprocess import *

try:
    opts, args = getopt.getopt(sys.argv[1:], "v")
except getopt.GetoptError:
    # print help information and exit:
    print "Invalid Parameters"
    sys.exit(1)

verbose = False
argIndex = 0
for o, a in opts:
    if o == "-v":
        verbose = True

print "Changing IP Addresses and host names for Message Server"
oldIP = args[argIndex]
argIndex += 1
newIP = args[argIndex]
argIndex += 1
if len(args) > 3:
    oldHost = args[argIndex]
    argIndex += 1
    newHost = args[argIndex]
    argIndex += 1
else:
    oldHost=0
    newHost=0

if verbose:
    print "1: %s" % (oldIP)
    print "2: %s" % (newIP)
if verbose & (oldHost != 0):
    print "3: %s" % (oldHost)
    print "4: %s" % (newHost)

settingsPaths =["jabber:hosts:_array_index:0"]
bufsize = 0

## Get the all current settings that contain hostnames or IPs
p = Popen(["/Applications/Server.app/Contents/ServerRoot/usr/sbin/serveradmin", "settings", settingsPaths[0]], shell=False, bufsize=bufsize,
          stdin=PIPE, stdout=PIPE, stderr=PIPE, close_fds=True)
(stdIn, stdOut, stdErr) = (p.stdin, p.stdout, p.stderr)
stdIn.flush()
stdIn.close()
oldSettings = stdOut.readlines()
if verbose:
    print "OLD CHAT SETTINGS"
    print "\t%s" % "\t".join(oldSettings)

## Perform appropriate replacements.
# IMPORTANT: Be sure to search for quoted hostnames just in
#            case someone has an oldHost of something like "mail or postfix"
newSettings = 'jabber:changeip = \"%s %s' % (oldIP, newIP)
if oldHost:
    newSettings += ' %s %s' % (oldHost,newHost)
newSettings += '\"'
p = Popen(["/Applications/Server.app/Contents/ServerRoot/usr/sbin/serveradmin", "settings", newSettings], shell=False, bufsize=bufsize,
          stdin=PIPE, stdout=PIPE, stderr=PIPE, close_fds=True)
(stdIn, stdOut, stdErr) = (p.stdin, p.stdout, p.stderr)

## Write the new settings back out
if verbose:
    print "COMMAND TO UPDATE CHAT SETTINGS"
    print "\t%s" % (newSettings)
stdIn.flush()
stdIn.close()
