#!/bin/bash

# Copyright (c) 2013-2015 Apple Inc. All Rights Reserved.
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
ShouldHaveDiskInfoPlist=1;
VersionsWithoutDiskInfoPlist=(10.6.8 10.7 10.7.1 10.7.2)

if [ -d "/.ServerBackups" ]; then
	ServerBackupFolderExists=1;
fi

if [ -e "/.ServerBackups/.serverBackupSignature" ]; then
	BackupSignatureFileExists=1;
fi

#if SourceVersion is >= 10.6.8 and < 10.7.3 then it won't have `ServerSourceDiskInfo.plist` so we need to not flag as error
if [ -e "/.ServerBackups/serverSettings/info.status" ]; then
    tVer=`cat /.ServerBackups/serverSettings/info.status | grep "info:systemVersion"`
    SourceVersion=`echo ${tVer} | cut -d'=' -f 2 | cut -d '"' -f 2 | cut -d'(' -f 1 | cut -d'X' -f 2 | cut -d' ' -f 2`
    for version in "${VersionsWithoutDiskInfoPlist[@]}"
    do
        if [[ "${version}" == "${SourceVersion}" ]]; then
            ShouldHaveDiskInfoPlist=0;
        fi
    done
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
		if [[ ${DiskInfoPlistExists} == 1 || ${ShouldHaveDiskInfoPlist} == 0 ]]; then
			if [[ ${UUIDsAreNonNil} == 1 || ${ShouldHaveDiskInfoPlist} == 0 ]]; then
				if [[ ${UUID_of_bootdisk} == ${UUID_of_snapshot} ]]; then
					echo "ERROR: UUIDs match so we will skip restoring." 1>&2
					# Since there is nothing we can really do about this error, ignore it.
					RET=0;
				else
					# Call ServerBackup to restore a valid set of server data.
					/Applications/Server.app/Contents/ServerRoot/usr/sbin/ServerBackup -cmd restore -path / -target /
					RET=$?;
				fi
			else
				RET=1;
				echo "ERROR: One or both UUIDs are nil, can not validate snapshot to proceed." 1>&2
			fi
		else
			RET=2;
			echo "ERROR: Missing ServerSourceDiskInfo.plist file." 1>&2
		fi
	else
		RET=3;
		echo "ERROR: Missing ServerBackup signature file." 1>&2
	fi
else
	RET=0;
	echo "ERROR: Missing ServerBackup folder." 1>&2
fi

exit ${RET}
