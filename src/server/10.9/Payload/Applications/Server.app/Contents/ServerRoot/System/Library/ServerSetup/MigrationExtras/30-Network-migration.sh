#!/bin/sh

#  30-Network-migration.sh
#  servermgr_network
#
#  Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.

#
# Script to copy the autoportmaplist.plist file from an earlier system
#


##################   Input Parameters  #######################
# --purge <0 | 1>   "1" means remove any files from the old system after you've migrated them, "0" means leave them alone.
# --sourceRoot <path> The path to the root of the system to migrate
# --sourceType <System | TimeMachine> Gives the type of the migration source, whether it's a runnable system or a
#                  Time Machine backup.
# --sourceVersion <ver> The version number of the old system (like 10.6 or 10.7). Since we support migration from 10.6, 10.7,
#                   and other 10.8 installs.
# --targetRoot <path> The path to the root of the new system.
# --language <lang> A language identifier, such as \"en.\" Long running scripts should return a description of what they're doing
#                   (\"Migrating Open Directory users\"), and possibly provide status update messages along the way. These messages
#                   need to be localized (which is not necessarily the server running the migration script).
#                   This argument will identify the Server Assistant language. As an alternative to doing localization yourselves
#                   send them in English, but in case the script will do this it will need this identifier.
#
# Example: 30-Network-migration.sh --purge 0 --language en --sourceType System --sourceVersion 10.6 --sourceRoot "/Previous System" --targetRoot "/"
#
#


PLISTBUDDY="/usr/libexec/PlistBuddy";


#
# Process the args (ingore all except  sourceRoot and targetRoot)
#

c=$1
while true 
do
    case $c in
        --sourceRoot)   shift; SourceRoot=$1; shift; c=$1;;
        --targetRoot)   shift; TargetRoot=$1; shift; c=$1;;
        --purge)	shift; shift; c=$1;;
        --language)	shift; shift; c=$1;;
        --sourceType)     shift; shift; c=$1;;
        --sourceVersion)     shift; shift; c=$1;;
        *)		shift; c="done";;
    esac
    if [ "$c" = "done" ]; then
        break;
    fi
done

if [ "$SourceRoot" = "" ]; then
    echo "--sourceRoot is required"
    exit
fi

if [ "$TargetRoot" = "" ]; then
    echo "--targetRoot is required"
    exit
fi

#
# Basic path constants
#

NetworkConfigDir="/Library/Server/Network/Config/"
OldConfigLocationBase="/private/etc/nat/autoportmap.plist"

SourceConfigPath="${SourceRoot}${OldConfigLocationBase}"
TargetConfigLocation="${TargetRoot}${NetworkConfigDir}"

echo "NetworkMigration: SourceRoot = \"${SourceRoot}\""
echo "NetworkMigration: TargetRoot = \"${TargetRoot}\""
echo "NetworkMigration: SourceConfigPath = \"${SourceConfigPath}\""
echo "NetworkMigration: TargetConfigLocation = \"${TargetConfigLocation}\""

#
# Make sure the directory exists
#

mkdir -p "${TargetConfigLocation}"

#
# actually copy the file
#

if [ -e "${SourceConfigPath}" ]; then
    echo "NetworkMigration: copying \"${SourceConfigPath}\" to \"${TargetConfigLocation}\""
    cp "${SourceConfigPath}" "${TargetConfigLocation}"
fi

# clear the password in the system keychain

# if the autoportmap.plist file has a managedIGD key containing a dictionary
# grab the MAC-WAN string

airportMACString=`/usr/libexec/PlistBuddy -c "print :lastIGD:MAC-WAN"  "${TargetConfigLocation}"`
if (( $? == "0" )); then
    # replace the '-' with ':'
    airportMACAddress=`echo $airportMACString |  tr '-' ':'`
    echo "deleting the APBS entry for $airportMACAddress in the System Keychain"
    security delete-generic-password -a \"${airportMACAddress}\" /Library/Keychains/System.keychain
else
    echo "We are not managing an Airport Base Station"
fi 

