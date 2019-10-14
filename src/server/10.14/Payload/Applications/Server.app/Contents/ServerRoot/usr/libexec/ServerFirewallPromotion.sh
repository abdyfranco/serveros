#!/bin/sh

#  ServerFirewallPromotion.sh
#  servermgr_firewall
#
#  Created by Apple on 7/14/14.
#  Copyright (c) 2014-2015 Apple Inc. All rights reserved.

# Flush previous com.apple.server-firewall anchors
pfctl -a com.apple.server-firewall/base -F all
pfctl -a com.apple.server-firewall/custom-firewall -F all
pfctl -a com.apple.server-firewall/default-firewall -F all # Remove deprecated anchor in case it stuck around ('base' replaced 'default-firewall' in Venus)
pfctl -a com.apple.server-firewall -F all

# Setup persistent storage
mkdir -p /Library/Server/Firewall/Anchors/
chmod 700 /Library/Server/Firewall/
touch /Library/Server/Firewall/Anchors/default_anchor.txt
touch /Library/Server/Firewall/Anchors/custom_anchor.txt
touch /Library/Server/Firewall/Anchors/combined_anchor.txt

# Setup pf.anchors
touch /etc/pf.anchors/com.apple.server-firewall
echo "#\n# Server Firewall anchor point.\n#\n" > /etc/pf.anchors/com.apple.server-firewall
echo "anchor \"base\"\nload anchor \"base\" from \"/Library/Server/Firewall/Anchors/default_anchor.txt\"" >> /etc/pf.anchors/com.apple.server-firewall
echo "anchor \"custom-firewall\"\nload anchor \"custom-firewall\" from \"/Library/Server/Firewall/Anchors/custom_anchor.txt\"" >> /etc/pf.anchors/com.apple.server-firewall

# Setup pf.conf
grep "com.apple.server-firewall" /etc/pf.conf > /dev/null
PRESENT=$?

if [[ $PRESENT == 1 ]];
then
echo "anchor \"com.apple.server-firewall/*\"\nload anchor \"com.apple.server-firewall\" from \"/etc/pf.anchors/com.apple.server-firewall\"" >> /etc/pf.conf
fi

# Ensure correct migration
if [[ -s /Library/Server/Firewall/Anchors/custom_anchor.txt ]];
then

STATIC_BLOCK_DROP_IN_ALL="block drop in all"
STATIC_PASS_DHCP_KEEP_STATE="pass in quick proto udp from any port = 67 to any port = 68 keep state"
STATIC_PASS_OUT_ALL_KEEP_STATE="pass out all flags any keep state"

# If custom_anchor.txt is not empty (has rules) then default_anchor.txt must also not be empty (have rules).
# default_anchor.txt contains only static pf rules,
# therefore whenever custom_anchor.txt has rules we can overwrite default_anchor.txt with these static rules.
echo $STATIC_BLOCK_DROP_IN_ALL > /Library/Server/Firewall/Anchors/default_anchor.txt
echo $STATIC_PASS_DHCP_KEEP_STATE >> /Library/Server/Firewall/Anchors/default_anchor.txt
echo $STATIC_PASS_OUT_ALL_KEEP_STATE >> /Library/Server/Firewall/Anchors/default_anchor.txt

# We must also update combined_anchor.txt to include the missing static default rules.
# combined_anchor.txt is only used for reboot and is loaded by pfctl before the network stack is brought up.
# pfctl loads combined_anchor.txt in the rc.server script during boot.
# This is needed because /etc/pf.conf isn't loaded by the OS until after the network stack is brought up.
# Loading combine_anchors.txt during boot closes the attack window that exists after the network stack is brought up and before /etc/pf.conf is loaded
# When /etc/pf.conf is finally loaded by the OS it replaces the anchors created by loading combined_anchor.txt with the anchors in /etc/pf.anchors/com.apple.server-firewall

# Create scrub anchors
echo "scrub-anchor \"base\" all fragment reassemble" > /Library/Server/Firewall/Anchors/temp.txt
echo "scrub-anchor \"custom-firewall\" all fragment reassemble" >> /Library/Server/Firewall/Anchors/temp.txt

# Create base anchor from default_anchor.txt
echo "anchor \"base\" all {" >> /Library/Server/Firewall/Anchors/temp.txt
cat /Library/Server/Firewall/Anchors/default_anchor.txt | perl -pe 'print "  "' >> /Library/Server/Firewall/Anchors/temp.txt
echo "}" >> /Library/Server/Firewall/Anchors/temp.txt

# Create custom-anchor from custom_anchor.txt
echo "anchor \"custom-firewall\" all {" >> /Library/Server/Firewall/Anchors/temp.txt
cat /Library/Server/Firewall/Anchors/custom_anchor.txt | perl -pe 'print "  "' >> /Library/Server/Firewall/Anchors/temp.txt
echo "}" >> /Library/Server/Firewall/Anchors/temp.txt

mv /Library/Server/Firewall/Anchors/temp.txt /Library/Server/Firewall/Anchors/combined_anchor.txt

fi

# Load pf.conf
pfctl -e
pfctl -f /etc/pf.conf
