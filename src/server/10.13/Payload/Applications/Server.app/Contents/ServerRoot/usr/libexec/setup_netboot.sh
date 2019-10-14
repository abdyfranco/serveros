#!/bin/sh

# setup_netboot.sh
# servermgr_netboot
#
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.


serviceDataPath="/Library/Server/NetInstall"
savedClientsPath="${serviceDataPath}/ClientData"
savedImagesPath="${serviceDataPath}/ImageData"

# If we're being re-promoted, this might exist
if [ -e "${serviceDataPath}" ]; then
	# If we've got client share data, attempt to restore it
	if [ -f "${savedClientsPath}" ]; then
		while read shareFolder
		do
			if [ -d "${shareFolder}" ]; then
				leafName=`/usr/bin/basename "${shareFolder}"`
				dirName=`/usr/bin/dirname "${shareFolder}"`

				#remove any existing link
				if [ -e "${dirName}/.clients" ]; then
					rm "${dirName}/.clients"
				fi
				ln -s "${leafName}" "${dirName}/.clients"
			fi
		done < "${savedClientsPath}"
	fi

	# If we've got image share data, attempt to restore it
	if [ -f "${savedImagesPath}" ]; then
		echo "Doing some stuff with client shares"
		while read shareFolder
		do
			if [ -d "${shareFolder}" ]; then
				leafName=`/usr/bin/basename "${shareFolder}"`
				dirName=`/usr/bin/dirname "${shareFolder}"`

				#remove any existing link
				if [ -e "${dirName}/.sharepoint" ]; then
					rm "${dirName}/.sharepoint"
				fi
				ln -s "${leafName}" "${dirName}/.sharepoint"
			fi
		done < "${savedImagesPath}"
	fi
fi
