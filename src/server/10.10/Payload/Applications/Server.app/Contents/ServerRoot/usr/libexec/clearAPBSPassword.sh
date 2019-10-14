#!/bin/sh

#  clearAPBSPassword.sh
#  servermgr_network
#

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
