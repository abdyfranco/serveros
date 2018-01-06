#!/bin/sh
volumePath=$1
resourcePath=$2
cp -R "$resourcePath/AppleBacklight.kext" "$volumePath/System/Library/Extensions/"
cp -R "$resourcePath/AppleBacklightExpert.kext" "$volumePath/System/Library/Extensions/"
cp -R "$resourcePath/DisplayServices.framework" "$volumePath/System/Library/PrivateFrameworks/"
chown -R 0:0 "$volumePath/System/Library/Extensions/AppleBacklight.kext"
chmod -R 0755 "$volumePath/System/Library/Extensions/AppleBacklight.kext"
chown -R 0:0 "$volumePath/System/Library/Extensions/AppleBacklightExpert.kext"
chmod -R 0755 "$volumePath/System/Library/Extensions/AppleBacklightExpert.kext"
chown -R 0:0 "$volumePath/System/Library/PrivateFrameworks/DisplayServices.framework"
chmod -R 0755 "$volumePath/System/Library/PrivateFrameworks/DisplayServices.framework"
