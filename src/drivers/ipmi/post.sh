#!/bin/bash

sudo xattr -r -d com.apple.quarantine /Applications/Server/Xserve\ LOM\ Configurator.app
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/AppleBMC.kext
sudo xattr -r -d com.apple.quarantine /System/Library/LaunchDaemons/com.apple.hwmond.plist
sudo xattr -r -d com.apple.quarantine /System/Library/PrivateFrameworks/PlatformHardwareManagement.framework
sudo xattr -r -d com.apple.quarantine /usr/bin/ipmitool
sudo xattr -r -d com.apple.quarantine /usr/sbin/hwmond
sudo spctl --master-enable