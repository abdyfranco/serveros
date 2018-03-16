#!/bin/sh
volumePath=$1
resourcePath=$2
csrutil disable
cp -R "$resourcePath/AppleHDA.kext" "$volumePath/System/Library/Extensions/"
chown -R 0:0 "$volumePath/System/Library/Extensions/AppleHDA.kext"
chmod -R 0755 "$volumePath/System/Library/Extensions/AppleHDA.kext"
xattr -c "$volumePath/System/Library/Extensions/AppleHDA.kext"
cp -R "$resourcePath/IOAudioFamily.kext" "$volumePath/System/Library/Extensions/"
chown -R 0:0 "$volumePath/System/Library/Extensions/IOAudioFamily.kext"
chmod -R 0755 "$volumePath/System/Library/Extensions/IOAudioFamily.kext"
xattr -c "$volumePath/System/Library/Extensions/IOAudioFamily.kext"