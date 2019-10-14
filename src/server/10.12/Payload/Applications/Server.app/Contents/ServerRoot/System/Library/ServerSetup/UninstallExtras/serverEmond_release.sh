#!/bin/bash

# Copyright (c) 2013-2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
# serverEmond_release.sh
#
# Script to remove reservation for Server Emond.
#

echo "stop ServerPerfLog"
# remove reservation for ServerPerfLog
if [ -e "/private/var/db/ServerPerfLogClients/com.apple.server" ]; then
    rm "/private/var/db/ServerPerfLogClients/com.apple.server"
fi

echo "stop Emond"
# remove reservation for Emond
if [ -e "/private/var/db/emondClients/com.apple.server" ]; then
    rm "/private/var/db/emondClients/com.apple.server"
fi

# if our queue directory is empty then we will kill Emond
if [ -e "/private/var/db/emondClients" ]; then
    numItems=`/bin/ls -1 /private/var/db/emondClients | /usr/bin/wc -l`
    if [ ${numItems} -eq 0 ]; then
        /usr/bin/killall emond 
    fi
fi
