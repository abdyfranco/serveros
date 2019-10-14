#!/bin/sh

# uninstall_netboot.sh
# servermgr_netboot
#
# Copyright © 2012-2013 Apple Inc. All rights reserved.

httpNetBootPath="/Library/Server/Web/Data/Sites/Default/NetBoot"
tftpNetBootPath="/private/tftpboot/NetBoot"
bootpServicePath="/System/Library/LaunchDaemons/bootps.plist"
tftpServicePath="/System/Library/LaunchDaemons/tftp.plist"
serviceDataPath="/Library/Server/NetInstall"
savedClientsPath="${serviceDataPath}/ClientData"
savedImagesPath="${serviceDataPath}/ImageData"

# Create our service directory
/bin/mkdir "${serviceDataPath}" > /dev/null 2>&1

# Clean up the data stores for re-promotion
/bin/rm "${savedClientsPath}" > /dev/null 2>&1
/bin/rm "${savedImagesPath}" > /dev/null 2>&1

# Stop bootp
/bin/launchctl unload -w "${bootpServicePath}"

# Stop TFTP
/bin/launchctl unload -w "${tftpServicePath}"

# Remove the TFTP NetBoot folder and any links
if [ -d "${tftpNetBootPath}" ]; then
	/bin/rm -r "${tftpNetBootPath}"
fi

# Remove the HTTP NetBoot folder and any links
if [ -d "${httpNetBootPath}" ]; then
	/bin/rm -r "${httpNetBootPath}"
fi

# Look for any /Library/NetBoot folders and remove the share links, first saving the share data
for aSharepoint in "/Volumes/"*"/Library/NetBoot"; do
	if [ -e "${aSharepoint}/.clients" ]; then
		linkData=`readlink "${aSharepoint}/.clients"`
		echo "${aSharepoint}/${linkData}" >> "${savedClientsPath}"
		/bin/rm "${aSharepoint}/.clients"
	fi
	if [ -e "${aSharepoint}/.sharepoint" ]; then
		linkData=`readlink "${aSharepoint}/.sharepoint"`
		echo "${aSharepoint}/${linkData}" >> "${savedImagesPath}"
		/bin/rm "${aSharepoint}/.sharepoint"
	fi
done
