#!/bin/bash

# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
# 51-ServerPerfLogAndEmond.sh
# ServerPerfLog and Emond
#
# Script to start the Server Performance Log.
#

echo "start ServerPerfLog"
# create reservation to start ServerPerfLog
if [ ! -e "/private/var/db/ServerPerfLogClients/com.apple.server" ]; then
    touch "/private/var/db/ServerPerfLogClients/com.apple.server"
fi

echo "start Emond"
# create reservation to start Emond
if [ ! -e "/private/var/db/emondClients/com.apple.server" ]; then
    touch "/private/var/db/emondClients/com.apple.server"
fi
