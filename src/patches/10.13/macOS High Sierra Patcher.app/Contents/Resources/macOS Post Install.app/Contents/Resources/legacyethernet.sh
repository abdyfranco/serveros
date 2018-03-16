#!/bin/sh
volumePath=$1
resourcePath=$2
cp -R "$resourcePath/LegacyUSBEthernet.kext" "$volumePath/Library/Extensions/"
chown -R 0:0 "$volumePath/Library/Extensions/LegacyUSBEthernet.kext"
chmod -R 0755 "$volumePath/Library/Extensions/LegacyUSBEthernet.kext"
xattr -c "$volumePath/Library/Extensions/LegacyUSBEthernet.kext"