#!/bin/sh

# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#

SEND_ALERT=0

echo "checking for ipfw/ip6fw firewall state"
if [ -f /etc/ipfilter/ipfwstate-on ]; then
    echo "ipfw firewall was active, alerting the user"
    SEND_ALERT=1
fi
if [ -f /etc/ipfilter/ip6fwstate-on ]; then
    echo "ip6fw firewall was active, alerting the user"
    SEND_ALERT=1
fi
if [ $SEND_ALERT == 1 ]; then
    echo "sending the alert"
    /Applications/Server.app/Contents/ServerRoot/usr/sbin/server postAlert ObsoleteFirewallAlert Firewall <<< ""
fi
exit 0
