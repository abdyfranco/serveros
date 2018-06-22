#!/bin/bash

sudo rm -rf /Applications/Server/Xserve\ LOM\ Configurator.app
sudo rm -rf /System/Library/Extensions/AppleBMC.kext
sudo rm -rf /System/Library/LaunchDaemons/com.apple.hwmond.plist
sudo rm -rf /System/Library/PrivateFrameworks/PlatformHardwareManagement.framework
sudo rm -rf /usr/bin/ipmitool
sudo rm -rf /usr/sbin/hwmond
sudo spctl --master-disable