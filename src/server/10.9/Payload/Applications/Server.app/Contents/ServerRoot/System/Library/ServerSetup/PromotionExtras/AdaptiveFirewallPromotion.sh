#!/bin/sh

#  AdaptiveFirewallPromotion.sh
#  PromotionExtra
#
#  Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
#  You may not port this file to another platform without Apple's written consent.
#

#
# Constants
#
SERVER_INSTALL_PATH_PREFIX="/Applications/Server.app/Contents/ServerRoot"

#
# Make sure the default config file is present
#
cp ${SERVER_INSTALL_PATH_PREFIX}/private/etc/af.plist /etc/af.plist

#
# Clean up any old whitelist/blacklist files
#

if [[ -e "/var/db/af/whitelist" ]]; then
    rm "/var/db/af/whitelist"
fi

if [[ -e "/var/db/af/blacklist" ]]; then
    rm "/var/db/af/blacklist"
fi

#
# tell afctl to self configure (which will recreate the whitelist & blacklist files) 
#

${SERVER_INSTALL_PATH_PREFIX}/usr/libexec/afctl -c 
