#!/bin/sh
volumePath=$1
resourcePath=$2
csrutil disable
cp -R "$resourcePath/LegacyUSBInjector.kext" "$volumePath/Library/Extensions/"
chown -R 0:0 "$volumePath/Library/Extensions/LegacyUSBInjector.kext"
chmod -R 0755 "$volumePath/Library/Extensions/LegacyUSBInjector.kext"
xattr -c "$volumePath/Library/Extensions/LegacyUSBInjector.kext"
if [ ! -d "$volumePath/usr/local/sbin" ]; then
mkdir "$volumePath/usr/local/sbin"
fi
cp "$resourcePath/SIPLD" "$volumePath/usr/local/sbin/"
cp "$resourcePath/com.dd1.SIPLD.plist" "$volumePath/Library/LaunchAgents/"