#!/bin/sh

# Get all of the major disks in /dev
DISKS=`ls /dev/disk* | grep disk.$`

for disk in $DISKS
do
	STATUS=`diskutil info $disk | awk '/SMART/ {print $3,$4}' | sed -e 's/[ \t]*$//'`

# SMART status is OK
	if [ "$STATUS" = "Verified" ] 
	then
		continue
	fi

# SMART is not supported
	if [ "$STATUS" = "Not Supported" ]
	then
		continue
	fi
	
# No SMART status capture
	if [ "$STATUS" = "" ]
	then
		continue
	fi

# Find the first mounted volume of the disk
	VOLUME=`mount | grep $disk | sed -e "s/ (.*$//" -e "s/\/Volumes\///" -e "s/.*on //" | head -n 1`
	if [ "$VOLUME" = "" ]
	then
		VOLUME=$disk
	fi

# Send the alert to the Alerts subsystem
	/Applications/Server.app/Contents/ServerRoot/usr/sbin/server postAlert SMARTStatusAlert DiskMonitor diskName $VOLUME diskStatus $STATUS <<< ""

done
