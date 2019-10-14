#!/usr/bin/env python
# Note, this has to use the system python because the one shipped in Server
# might be gone.

#
# UninstallExtra script for calendar server.
#
# Copyright (c) 2011-2015 Apple Inc.  All Rights Reserved.
#
# IMPORTANT NOTE:  This file is licensed only for use on Apple-labeled
# computers and is subject to the terms and conditions of the Apple
# Software License Agreement accompanying the package this file is a
# part of.  You may not port this file to another platform without
# Apple's written consent.
from __future__ import print_function

import os
import subprocess
from plistlib import readPlist, writePlist


def serverRootLocation():
    """
    Return the ServerRoot value from the servermgr_calendar.plist.  If not
    present, return the default.

    @rtype: C{unicode}
    """
    plist = "/Library/Server/Preferences/Calendar.plist"
    serverRoot = u"/Library/Server/Calendar and Contacts"
    if os.path.exists(plist):
        serverRoot = readPlist(plist).get("ServerRoot", serverRoot)
    if isinstance(serverRoot, str):
        serverRoot = serverRoot.decode("utf-8")
    return serverRoot


DEST_CONFIG_DIR = os.path.join(serverRootLocation(), "Config")
CALDAVD_PLIST = "caldavd-system.plist"
KILLALL = "/usr/bin/killall"


def main():

    plistPath = os.path.join(DEST_CONFIG_DIR, CALDAVD_PLIST)

    if os.path.exists(plistPath):
        try:
            # Turn off services
            plistData = readPlist(plistPath)
            plistData["EnableCalDAV"] = False
            plistData["EnableCardDAV"] = False
            writePlist(plistData, plistPath)

        except Exception, e:
            print("Unable to disable services in {}: {}".format(plistPath, e))

    args = [KILLALL, "-u", "_calendar"]

    subprocess.Popen(
        args=args,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    ).communicate()


if __name__ == '__main__':
    main()
