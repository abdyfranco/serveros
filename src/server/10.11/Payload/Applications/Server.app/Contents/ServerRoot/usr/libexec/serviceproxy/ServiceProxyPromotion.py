#!/usr/bin/env python
#
# PromotionExtra script for service proxy.
#
# Copyright (c) 2015 Apple Inc.  All Rights Reserved.
#
# IMPORTANT NOTE:  This file is licensed only for use on Apple-labeled
# computers and is subject to the terms and conditions of the Apple
# Software License Agreement accompanying the package this file is a
# part of.  You may not port this file to another platform without
# Apple's written consent.
from __future__ import print_function

import datetime
import os
from plistlib import readPlist
import subprocess
import sys
CONFIG_TOOLS_PATH = "/Applications/Server.app/Contents/ServerRoot/usr/libexec/serviceproxy"
sys.path.insert(0, CONFIG_TOOLS_PATH)
from config import ConfigurationError
from config import Config
from serviceProxyPaths import ProxyPaths


def log(msg):
    try:
        timestamp = datetime.datetime.now().strftime("%b %d %H:%M:%S")
        if isinstance(msg, unicode):
            msg = msg.encode("utf-8")
        msg = "servermgr_serviceproxy: %s %s" % (timestamp, msg)
        print(msg)  # so it appears in /Library/Logs/ServerSetup.log
        with open(ProxyPaths.LOG_FILE, 'a') as output:
            output.write("%s\n" % (msg,))  # so it appears in our ServiceProxySetup log
    except:
        # Could not write to log
        pass



def main(options):
	
    if not os.path.exists(ProxyPaths.PROXY_PREFS_PLIST):
        source = ProxyPaths.PROXY_PREFS_PLIST+ProxyPaths.DEFAULT
        destination = ProxyPaths.PROXY_PREFS_PLIST
        subprocess.call([ProxyPaths.DITTO, source, destination])
        log ("Config file not found. File recreated from ProxyPaths.DEFAULT. source:" + source + " dest: " + destination)
        
    preferencePlist = readPlist(ProxyPaths.PROXY_PREFS_PLIST)
    preferenceConfig = Config(preferencePlist)
    logLevel = preferenceConfig.Get("ProxyConfig:LogLevel")
    if logLevel == "debug":
        debug = True

    if options.previousServer == "" and options.currentServer == "":
        log("migration")
    else:
        log("promotion")
    log ("options.sourceRoot:" + options.sourceRoot)
    log ("options.sourceSystem:" + options.sourceSystem)
    log ("options.destinationSystem:" + options.destinationSystem)
    log ("options.previousServer:" + options.previousServer)
    log ("options.currentServer:" + options.currentServer)
    log ("options.sourceServer:" + options.sourceServer)


    if not os.path.exists(ProxyPaths.APACHE_CONFIG_ROOT_PLIST):
        source = ProxyPaths.APACHE_CONFIG_ROOT_PLIST+ProxyPaths.DEFAULT
        destination = ProxyPaths.APACHE_CONFIG_ROOT_PLIST
        subprocess.call([ProxyPaths.DITTO, source, destination])
        log ("Config file not found. File recreated from ProxyPaths.DEFAULT. source:" + source + " dest: " + destination)

    if not os.path.exists(ProxyPaths.WEBAPP_STATE_ROOT_PLIST):
        source = ProxyPaths.WEBAPP_STATE_ROOT_PLIST+ProxyPaths.DEFAULT
        destination = ProxyPaths.WEBAPP_STATE_ROOT_PLIST
        subprocess.call([ProxyPaths.DITTO, source, destination])
        log ("Config file not found. File recreated from ProxyPaths.DEFAULT. source:" + source + " dest: " + destination)

	# The proxy cert and proxy config are written during web's promotion.
	# It is there to allow the certificates used by the default web site to be set for the proxy to use.
	    
def installOptions(parser):
    "add command line options"
    parser.add_option("-r", "--sourceRoot", dest="sourceRoot", default="",  help="sourceRoot")
    parser.add_option("-s", "--sourceSystem", dest="sourceSystem", default="",  help="sourceSystem")
    parser.add_option("-d", "--destinationSystem", dest="destinationSystem",default="",  help="destinationSystem")
    parser.add_option("-c", "--currentServer", dest="currentServer", default="",  help="currentServer")
    parser.add_option("-p", "--previousServer", dest="previousServer", default="",  help="previousServer")
    parser.add_option("-e", "--sourceServer", dest="sourceServer", default="", help="sourceServer")
def parseOptions(parser):
    try:
            (options, args) = parser.parse_args()
    except: 
            return False
    
    return options
    
    
if __name__ == "__main__":
    from optparse import OptionParser

    
    parser = OptionParser()
    installOptions(parser)
    options = parseOptions(parser)
    if not options:
       log ("options failure quitting")
    else:
        main(options)
