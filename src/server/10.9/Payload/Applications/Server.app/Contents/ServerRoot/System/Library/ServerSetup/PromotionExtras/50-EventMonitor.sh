#!/bin/sh

# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#

# 50-EventMonitor.sh
# EventMonitor
#
# Script to start the event monitor and other things it depends on.
#

#
# Add the path to the rules used by Server Services to the emond.plist
#
ServerRoot="/Applications/Server.app/Contents/ServerRoot"
EmondConfFile="/private/etc/emond.d/emond.plist"
ServerRulesPath=${ServerRoot}"/private/etc/emond.d/rules/"

echo "EventMonitorPromotion: Adding the new rules path to emond.plist"
/usr/libexec/PlistBuddy -c "add :config:additionalRulesPaths: string \"${ServerRulesPath}\"" ${EmondConfFile}
/usr/libexec/PlistBuddy -c "delete :config:filterByUID" ${EmondConfFile}
/usr/libexec/PlistBuddy -c "add :config:filterByUID string \"0,27,83,84,214,235\"" ${EmondConfFile}

#
# update the /etc/syslog.conf file to send messages to the log scraper
#

grep "adaptive firewall" /etc/syslog.conf > /dev/null
PRESENT=$?

if [[ $PRESENT == 1 ]];
then
echo "EventMonitorPromotion: updating /etc/syslog.conf"
echo "" >> /etc/syslog.conf
echo "# used for the adaptive firewall: man emlog.pl" >> /etc/syslog.conf
echo "auth.*                                @127.0.0.1:60762" >> /etc/syslog.conf
echo "" >> /etc/syslog.conf
echo "EventMonitorPromotion: HUP syslogd"
killall -HUP syslogd 2> /dev/null
fi

#
# Start/cycle emond (it defaults to off on the client, but may be on because of Xsan)
#

echo "EventMonitorPromotion: Cycle emond"
killall emond 2> /dev/null

if [ -e "/System/Library/LaunchDaemons/com.apple.emond.plist" ]; then
    /bin/launchctl load -w /System/Library/LaunchDaemons/com.apple.emond.plist
else
    echo "cannot find /System/Library/LaunchDaemons/com.apple.emond.plist"
fi