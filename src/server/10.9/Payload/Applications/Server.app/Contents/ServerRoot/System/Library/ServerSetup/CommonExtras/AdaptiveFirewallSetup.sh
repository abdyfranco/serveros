#!/bin/sh
#
#   AdaptiveFirewallSetup.sh
#	CommonExtras
#
#  Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#

#
# Constants
#
SERVER_INSTALL_PATH_PREFIX="/Applications/Server.app/Contents/ServerRoot"


#
# update the lines in the pf.conf if needed
#

grep "400.AdaptiveFirewall" /etc/pf.anchors/com.apple > /dev/null
PRESENT=$?

if [[ $PRESENT == 1 ]];
then
echo "" >> /etc/pf.anchors/com.apple;
echo "#" >> /etc/pf.anchors/com.apple
echo "# Adaptive Firewall anchor point." >> /etc/pf.anchors/com.apple
echo "#" >> /etc/pf.anchors/com.apple
echo "anchor \"400.AdaptiveFirewall/*\"" >> /etc/pf.anchors/com.apple
echo "load anchor \"400.AdaptiveFirewall\" from \"${SERVER_INSTALL_PATH_PREFIX}/private/etc/pf.anchors/400.AdaptiveFirewall\"" >> /etc/pf.anchors/com.apple 
echo "" >> /etc/pf.anchors/com.apple
fi

#
# make sure the backing file exists
#

mkdir -p /var/db/af
chmod 700 /var/db/af
touch /var/db/af/blockedHosts
