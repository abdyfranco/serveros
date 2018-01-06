#!/bin/sh
volumePath=$1
resourcePath=$2
cp "$resourcePath/PlatformSupport.plist" "$volumePath/System/Library/CoreServices/"