#!/usr/bin/python -u
#
#  changeip_ds.py
#  servermgr_ds
#
#  Created by Bryan Duncan on 6/12/08.
#  Copyright (c) 2012 Apple Inc. All Rights Reserved.
#
#  IMPORTANT NOTE: This file is licensed only for use on Apple-branded
#  computers and is subject to the terms and conditions of the Apple Software
#  License Agreement accompanying the package this file is a part of.
#  You may not port this file to another platform without Apple's written consent.
#

#
# Script to change IP and host name in DNS records.
#
# This script is usually called by changeip.  This script
# does some checking and bundles the parameters up for
# servermgrd, which in turn passes the data to servermgr_dns.
#


import os
import sys
import string
import getopt
import re
import socket
import subprocess

def printUsage():
    print "Usage: changeip_ds [-hv] currIP newIP [currHost newHost]"
    print "  Options:"
    print "    -h       - print this message and exit"
    print "    -v       - print additional information when running"
    print "  Arguments:"
    print "    currIP   - current IPv4 address of the server"
    print "    newIP    - new IPv4 address of the server"
    print "    currHost - current FQDN for the server"
    print "    newHost  - new FQDN for the server"

try:
    opts, args = getopt.getopt(sys.argv[1:], "hv")
except getopt.GetoptError:
    print "Invalid Parameters"
    printUsage()
    sys.exit(1)
    
# Since the serveradmin command must be run as root, so must this script
if os.getuid() != 0:
    print "changeip_dns must be run as root"
    sys.exit(1)

verbose = False
for option, argument in opts:
    if option == "-h":
        printUsage()
        sys.exit(1)
    
    if option == "-v":
        verbose = True

# Silently ignore the OpenDirectory node if it's passed in.  Older versions
# of changeip pass the OD node as the first argument.  If it's present, just
# drop it.  Either the full node name or "-" can be passed.
if re.match("(/|-)", args[0]):
    args = args[1:]

# Check for the correct number of arguments
if len(args) != 2 and len(args) != 4:
    print "Invalid number of arguments"
    printUsage()
    sys.exit(1)

print "Changing IP address and host name for DirectoryServices Server"

#
# Send the info to servermgrd to actually perform the update
#
# The servermgr_dirserv expects the input to be in one array:
#   OldIP       -- the old IP address.
#   NewIP       -- the new IP address.
#   OldHostName -- the old host name.
#   NewHostName -- the new host name.

oldIP = args[0]
newIP = args[1]
if len(args) == 4:
    oldHost = args[2]
    newHost = args[3]
else:
    # Host name didn't change.  Use the exising hostname
    oldHost = socket.gethostname()
    newHost = socket.gethostname()

command = ["/Applications/Server.app/Contents/ServerRoot/usr/sbin/serveradmin", "command"]

changes = []
changes.append("dirserv:command = changeip\n")
changes.append("dirserv:changeipParams:OldIP = " + oldIP + "\n")
changes.append("dirserv:changeipParams:NewIP = " + newIP + "\n")
changes.append("dirserv:changeipParams:OldHostName = " + oldHost + "\n")
changes.append("dirserv:changeipParams:NewHostName = " + newHost + "\n")

if verbose:
    print "Command:"
    print command
    for line in changes:
        print line[:len(line)-1]

child = subprocess.Popen(command, shell=False, stdin=subprocess.PIPE, stdout=subprocess.PIPE, close_fds=True)
stdIn = child.stdin
stdOut = child.stdout
stdIn.writelines(changes)
stdIn.flush()
stdIn.close()

if verbose:
    print "\nCommand output:"
    cmdOut = stdOut.readlines()
    for line in cmdOut:
        print line[:len(line)-1]

stdOut.close()
