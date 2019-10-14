#!/bin/sh
#
#  ServerFirewallDemotion.sh
#  UninstallExtras
#
#  Copyright (c) 2014-2015 Apple Inc. All rights reserved.
#

# Remove Server Firewall anchor file
rm -f /etc/pf.anchors/com.apple.server-firewall

# Remove Server Firewall anchor point from main rule set
perl -ne 'print if $_ ne "anchor \"com.apple.server-firewall/\*\"\n"' -i /etc/pf.conf
perl -ne 'print if $_ ne "load anchor \"com.apple.server-firewall\" from \"/etc/pf.anchors/com.apple.server-firewall\"\n"' -i /etc/pf.conf

# Flush PF rules
pfctl -a com.apple.server-firewall/base -F all
pfctl -a com.apple.server-firewall/custom-firewall -F all
pfctl -a com.apple.server-firewall -F all
