#!/bin/bash

# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
# 30-serverTuning.sh
# This provides a subset of settings that were in rc.server in prior releases.
#

#
# Set ipfw to configured state
#
if [ -f /etc/ipfilter/ipfw.conf ]; then
	ipfw /etc/ipfilter/ipfw.conf
fi
if [ -f /etc/ipfilter/ipfwstate-on ]; then
	sysctl -w net.inet.ip.fw.enable=1
else
	sysctl -w net.inet.ip.fw.enable=0
fi

#
# Set ip6fw to configured state
#
if [ -f /etc/ipfilter/ip6fw.conf ]; then
	ip6fw /etc/ipfilter/ip6fw.conf
fi
if [ -f /etc/ipfilter/ip6fwstate-on ]; then
	sysctl -w net.inet6.ip6.fw.enable=1
else
	sysctl -w net.inet6.ip6.fw.enable=0
fi

#
# The above takes care of the current boot session, we need to copy 
# an pair of rc scripts to take care of subsequent boots
#

if [ -e /etc/rc.server ]; then
    rm -f /etc/rc.server
fi
cp /Applications/Server.app/Contents/ServerRoot/private/etc/rc.server /etc/rc.server

if [ -e /etc/rc.server.firewall ]; then
    rm -f /etc/rc.server.firewall
fi
cp /Applications/Server.app/Contents/ServerRoot/private/etc/rc.server.firewall /etc/rc.server.firewall

/etc/rc.server

