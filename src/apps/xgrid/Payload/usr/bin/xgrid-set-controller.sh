#!/bin/bash

CONTROLLER="$1"

if [ "$CONTROLLER" = "" ]
then
	echo "Usage: $0 <controller_address>"
	exit
fi

defaults write $(pwd)/root/Library/Preferences/com.apple.xgrid.agent ControllerName "$CONTROLLER"
plutil -convert xml1 $(pwd)/root/Library/Preferences/com.apple.xgrid.agent.plist
