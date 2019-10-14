#!/bin/sh

#
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.

ROLE=`/usr/libexec/PlistBuddy /Library/Preferences/Xsan/config.plist -c Print\ role`
echo "Xsan role: $ROLE"
if [ "$ROLE" == "CONTROLLER" ]
then
    /bin/launchctl unload -w /System/Library/LaunchDaemons/com.apple.xsan.plist
fi
