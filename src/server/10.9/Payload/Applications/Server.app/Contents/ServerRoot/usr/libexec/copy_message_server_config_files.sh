#!/bin/sh
# Author:: Apple Inc.
# Documentation:: Apple Inc.
# Copyright (c) 2012-2013 Apple Inc. All Rights Reserved.
#
# ChatServer
# initialize_message_server.sh
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
# Copies the default jabberd and Rooms config files into /Library/Server during promotion or migration
#

ServerRoot="/Applications/Server.app/Contents/ServerRoot"
ConfigDir="/Library/Server/Messages/Config"

# If this is a re-promotion, in case the customer has made modifications manually
# that are not preserved in the servermgr_jabber plugin config, make a copy of the
# previous configurations
if [ -e $ConfigDir/jabberd ]; then
    echo "Copying previous Message Server configuration files into $ConfigDir..."
    /usr/bin/ditto $ConfigDir/jabberd $ConfigDir/jabberd.previous.`date "+%m-%d-%Y_%H:%M:%S"`
    /usr/bin/ditto $ConfigDir/Rooms.plist $ConfigDir/Rooms.previous.`date "+%m-%d-%Y_%H:%M:%S"`
elif [ ! -e $ConfigDir ]; then
	echo "Creating directory $ConfigDir..."
	/bin/mkdir -p "$ConfigDir"
	if [ $? != 0 ]; then
		echo "Error creating directory, exiting"
		exit 1
	fi
	/usr/sbin/chown root:wheel "$ConfigDir"
	/bin/chmod 0755 "$ConfigDir"
	if [ ! -e $ConfigDir/jabberd ]; then
    	echo "Creating directory $ConfigDir/jabberd..."
    	/bin/mkdir -p "$ConfigDir/jabberd"
    	if [ $? != 0 ]; then
        	echo "Error creating directory, exiting"
        	exit 1
    	fi
    	/usr/sbin/chown root:wheel "$ConfigDir/jabberd"
    	/bin/chmod 0755 "$ConfigDir/jabberd"
	fi
fi

echo "Copying Message Server configuration files into $ConfigDir..."
/usr/bin/ditto $ServerRoot/private/etc/jabberd/*.xml "$ConfigDir/jabberd"
/usr/bin/ditto $ServerRoot/private/etc/jabberd/*.cfg "$ConfigDir/jabberd"
/usr/bin/ditto $ServerRoot/private/etc/jabberd/*.dist "$ConfigDir/jabberd"
/usr/sbin/chown _jabber:wheel "$ConfigDir/jabberd/"*.xml "$ConfigDir/jabberd/"*.cfg
/bin/chmod 600 "$ConfigDir/jabberd/"*.xml "$ConfigDir/jabberd/"*.cfg
/usr/bin/ditto $ServerRoot/private/etc/jabberd/Rooms.plist "$ConfigDir"
/usr/sbin/chown _jabber:_jabber "$ConfigDir/Rooms.plist"
/bin/chmod 660 "$ConfigDir/Rooms.plist"
/bin/rm -f /Library/Preferences/com.apple.Proxy65.plist
/bin/rm -f /Library/Server/Messages/Config/com.apple.Proxy65.plist
echo "Finished."
