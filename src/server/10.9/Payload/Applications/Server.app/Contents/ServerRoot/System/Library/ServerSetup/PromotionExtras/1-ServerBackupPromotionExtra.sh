#!/bin/bash

# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
# Will run as the first PromotionExtra
#

ServerBackupFolderExists=0;
BackupSignatureFileExists=0;
DiskInfoPlistExists=0;
UUIDsAreNonNil=0;
UUID_of_bootdisk="";
UUID_of_snapshot="";
RET=1;

if [ -d "/.ServerBackups" ]; then
	ServerBackupFolderExists=1;
fi

if [ -e "/.ServerBackups/.serverBackupSignature" ]; then
	BackupSignatureFileExists=1;
fi

if [ -e "/.ServerBackups/ServerSourceDiskInfo.plist" ]; then
	DiskInfoPlistExists=1;
	UUID_of_snapshot=`/usr/libexec/PlistBuddy -c "print :VolumeUUID" /.ServerBackups/ServerSourceDiskInfo.plist`

	diskutil info -plist / > /tmp/curVol.plist
	UUID_of_bootdisk=`/usr/libexec/PlistBuddy -c "print :VolumeUUID" /tmp/curVol.plist`
	if [[ ${UUID_of_snapshot} != "" ]] && [[ ${UUID_of_bootdisk} != "" ]]; then
		UUIDsAreNonNil=1;
	fi
fi

if [[ ${ServerBackupFolderExists} == 1 ]]; then
	if [[ ${BackupSignatureFileExists} == 1 ]]; then
		if [[ ${DiskInfoPlistExists} == 1 ]]; then
			if [[ ${UUIDsAreNonNil} == 1 ]]; then
				if [[ ${UUID_of_bootdisk} == ${UUID_of_snapshot} ]]; then
					echo "UUIDs match so we will skip restoring."
					# Since there is nothing we can really do about this error, ignore it.
					RET=0;
				else
					# Call ServerBackup to restore a valid set of server data.
					/Applications/Server.app/Contents/ServerRoot/usr/sbin/ServerBackup -cmd restore -path / -target /
					RET=$?;
				fi
			else
				echo "One or both UUIDs are nil, can not validate snapshot to proceed."
			fi
		else
			echo "Missing ServerSourceDiskInfo.plist file."
		fi
	else
		echo "Missing ServerBackup signature file."
	fi
else
	RET=0;
	echo "Missing ServerBackup folder."
fi

#Remove server backups folder because were done.
if [[ ${ServerBackupFolderExists} == 1 ]]; then
	rm -rf "/.ServerBackups"
	echo "Removing .ServerBackup folder."
fi

exit ${RET}
