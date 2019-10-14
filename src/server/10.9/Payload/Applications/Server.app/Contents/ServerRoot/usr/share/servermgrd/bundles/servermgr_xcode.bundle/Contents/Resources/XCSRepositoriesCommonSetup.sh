#!/bin/bash

if [ ! -d "/Library/Server/Xcode/Config" ]; then
    mkdir -p "/Library/Server/Xcode/Config"
fi

if [ ! -f "/Library/Server/Xcode/Config/xcode.plist" ]; then
    cp "/Applications/Server.app/Contents/ServerRoot/etc/xcs/xcode.plist.default" "/Library/Server/Xcode/Config/xcode.plist"
fi
