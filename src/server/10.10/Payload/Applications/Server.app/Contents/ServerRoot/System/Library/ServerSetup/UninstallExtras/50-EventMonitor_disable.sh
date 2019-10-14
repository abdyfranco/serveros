#!/bin/sh

# Copyright (c) 2013-2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#

#   50-EventMonitor_disable.sh
#   ServerMigrationExtras
#
#   Script to undo the modifications to the emond config during promotion
#

ServerRoot="/Applications/Server.app/Contents/ServerRoot"
EmondConfFile="/private/etc/emond.d/emond.plist"
ServerRulesPath=${ServerRoot}"/private/etc/emond.d/rules/"

echo "EventMonitorDemotion: Removing Server rules path in emond.plist"
firstItem=`/usr/libexec/PlistBuddy -c "print :config:additionalRulesPaths:0" ${EmondConfFile} 2> /dev/null`

# test to see if the item we are about to delete is the one we want (really should do this in a loop)
if [ "${firstItem}" = "${ServerRulesPath}" ]; then
    echo "  found the path, removing..."
    /usr/libexec/PlistBuddy -c "delete :config:additionalRulesPaths:0" ${EmondConfFile}
else
    echo "  path not found in the first position"
fi

echo "EventMonitorDemotion: trimming the UID filter"
/usr/libexec/PlistBuddy -c "delete :config:filterByUID" ${EmondConfFile}
/usr/libexec/PlistBuddy -c "add :config:filterByUID string \"0\"" ${EmondConfFile}

echo "EventMonitorDemotion: Removing the special recipients"
/usr/libexec/PlistBuddy -c "delete :initialGlobals:pushRecipients" ${EmondConfFile}
/usr/libexec/PlistBuddy -c "delete :initialGlobals:mailRecipients" ${EmondConfFile}
/usr/libexec/PlistBuddy -c "delete :initialGlobals:supportedAlerts" ${EmondConfFile}

grep "adaptive firewall" /etc/syslog.conf > /dev/null
PRESENT=$?

if [[ $PRESENT == 0 ]];
then
echo "EventMonitorDemotion: cleaning up /etc/syslog.conf"
echo "BEGIN { found = 0; targetLine = 0 }" > ./edit.awk
echo "/\# used for the adaptive firewall: man emlog.pl/ {" >> ./edit.awk
echo " if (found == 0) {" >> ./edit.awk
echo "	targetLine = NR - 1;" >> ./edit.awk
echo "	found = 1;" >> ./edit.awk
echo "	}" >> ./edit.awk
echo "}" >> ./edit.awk
echo "END {" >> ./edit.awk
echo "	if(found == 1) {" >> ./edit.awk
echo "		command = sprintf(\"sed -e '%d,%dd' -i .~bak %s\", targetLine, targetLine+3, FILENAME); " >> edit.awk
echo "		system(command); " >> ./edit.awk
echo "	}" >> ./edit.awk
echo "}" >> ./edit.awk

awk -f ./edit.awk /etc/syslog.conf
rm ./edit.awk

echo "EventMonitorDemotion: HUP syslogd"
killall -HUP syslogd
fi


#
# Since we cannot be sure if emond was running before promotion, we will leave it running
# but we need to cycle to reload the rule paths
#

echo "EventMonitorDemotion: Cycle emond"
killall emond 2> /dev/null

