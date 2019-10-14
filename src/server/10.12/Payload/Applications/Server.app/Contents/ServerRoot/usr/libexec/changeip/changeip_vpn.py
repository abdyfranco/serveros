#!/usr/bin/python -u

#
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#

import os
import sys
import string
import getopt
from subprocess import *

def usage():
	print "Usage: changeip_vpn [-mnv] oldIP newIP [oldHost newHost]"
	print "Options:"
	print "	-n		Don't actually change anything."
	print "	-v		Verbose."

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

print "Changing IP Addresses and host names for VPN Server"
argIndex = 0
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

# we only really care about the IPv4 address
newSettings = 'vpn:changeip = \"%s %s\"' % (oldIP, newIP)
bufsize = 0

if verbose:
    print "COMMAND TO UPDATE VPN SETTINGS"
    print "\t%s" % (newSettings)

if dryrun:
    print "no changes made"
else:
    p = Popen(["/Applications/Server.app/Contents/ServerRoot/usr/sbin/serveradmin", "settings", newSettings], shell=False, bufsize=bufsize,
              stdin=PIPE, stdout=PIPE, stderr=PIPE, close_fds=True)
    (stdIn, stdOut, stdErr) = (p.stdin, p.stdout, p.stderr)
    stdIn.flush()
    stdIn.close()



