#!/bin/sh
volumePath=$1
resourcePath=$2
cp -R "$resourcePath/AmbientLightSensorHID.plugin" "$volumePath/System/Library/Extensions/AppleSMCLMU.kext/Contents/PlugIns/"
chown -R 0:0 "$volumePath/System/Library/Extensions/AppleSMCLMU.kext"
chmod -R 0755 "$volumePath/System/Library/Extensions/AppleSMCLMU.kext"
xattr -c "$volumePath/System/Library/Extensions/AppleSMCLMU.kext"