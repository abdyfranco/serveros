#!/bin/sh
volumePath=$1
resourcePath=$2
cp -R "$resourcePath/Patch Updater.app" "$volumePath/Applications/Utilities/"
cp "$resourcePath/com.dosdude1.PatchUpdater.plist" "$volumePath/Library/LaunchAgents/"