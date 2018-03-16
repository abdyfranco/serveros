#!/bin/sh
volumePath=$1
resourcePath=$2
if [ ! -d "$volumePath/usr/local/lib" ]; then
mkdir "$volumePath/usr/local/lib"
fi
cp "$resourcePath/SUVMMFaker.dylib" "$volumePath/usr/local/lib/"
chmod 755 "$volumePath/usr/local/lib/SUVMMFaker.dylib"
cp "$resourcePath/com.apple.softwareupdated.plist" "$volumePath/System/Library/LaunchDaemons"
chmod 755 "$volumePath/System/Library/LaunchDaemons/com.apple.softwareupdated.plist"