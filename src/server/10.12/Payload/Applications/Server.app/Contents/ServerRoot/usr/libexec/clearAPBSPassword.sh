#!/bin/sh

#  clearAPBSPassword.sh
#  servermgr_network
#
#  Copyright (c) 2015 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.

#
# Basic path constants
#

NetworkConfigDir="/Library/Server/Network/Config"

TargetConfigLocation="${NetworkConfigDir}/autoportmap.plist"

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
