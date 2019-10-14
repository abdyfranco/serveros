#!/usr/bin/env python
#
# PromotionExtra script for calendar server.
#
# Copyright (c) 2012-2013 Apple Inc.  All Rights Reserved.
#
# IMPORTANT NOTE:  This file is licensed only for use on Apple-labeled
# computers and is subject to the terms and conditions of the Apple
# Software License Agreement accompanying the package this file is a
# part of.  You may not port this file to another platform without
# Apple's written consent.
from __future__ import print_function

import datetime
import os

LOG = "/var/log/caldavd/migration.log"


def log(msg):
    try:
        timestamp = datetime.datetime.now().strftime("%b %d %H:%M:%S")
        msg = "calendarpromotionextra: %s %s" % (timestamp, msg)
        print(msg) # so it appears in /Library/Logs/ServerSetup.log
        with open(LOG, 'a') as output:
            output.write("%s\n" % (msg,)) # so it appears in our log
    except IOError:
        # Could not write to log
        pass



def main():

    obsoletes = [
        "/Library/Server/Web/Config/apache2/webapps/org.calendarserver.plist",
        "/Library/Server/Web/Config/apache2/webapps/com.apple.webapp.contacts.plist",
        "/Library/Server/Web/Config/apache2/webapps/com.apple.webapp.contacts.plist.default",
        "/Library/Server/Web/Config/apache2/webapps/com.apple.webapp.contactsssl.plist",
        "/Library/Server/Web/Config/apache2/webapps/com.apple.webapp.contactsssl.plist.default",
        "/Library/Server/Web/Config/apache2/webapps/com.apple.webapp.webcal.plist",
        "/Library/Server/Web/Config/apache2/webapps/com.apple.webapp.webcalssl.plist",
        "/Library/Server/Web/Config/apache2/webapps/com.apple.webapp.webcal.webssl.plist",
    ]
    for plistPath in obsoletes:
        if os.path.exists(plistPath):
            log("Obsolete plist exists: %s" % (plistPath,))
            try:
                os.remove(plistPath)
                log("Removed %s" % (plistPath,))
            except Exception, e:
                log("Failed to remove %s: %s" % (plistPath, e))



if __name__ == "__main__":
    main()
