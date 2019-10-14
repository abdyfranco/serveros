#!/bin/bash

# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
# 30-opendirectorymaster_backup.sh
# Setup the backup process for the Open Directory Master.
# This will always be loaded, if the service is called it will do nothing if there is no Open Directory Master.

odmBackupPlist="/Applications/Server.app/Contents/ServerRoot/System/Library/LaunchDaemons/com.apple.opendirectorybackup.plist";
serverCTL="/Applications/Server.app/Contents/ServerRoot/usr/sbin/serverctl";
odmService="com.apple.opendirectorybackup";

if [ -e "${odmBackupPlist}" ]; then
	if [ -e "${serverCTL}" ]; then
		${serverCTL} enable service=${odmService}
	fi 
fi
