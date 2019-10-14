#!/bin/bash

sudo xattr -r -d com.apple.quarantine /Applications/Server/Xserve\ LOM\ Configurator.app
sudo xattr -r -d com.apple.quarantine /System/Library/Extensions/AppleBMC.kext
sudo xattr -r -d com.apple.quarantine /System/Library/LaunchDaemons/com.apple.hwmond.plist
sudo xattr -r -d com.apple.quarantine /System/Library/PrivateFrameworks/PlatformHardwareManagement.framework
sudo xattr -r -d com.apple.quarantine /usr/bin/ipmitool
sudo xattr -r -d com.apple.quarantine /usr/sbin/hwmond

sudo xattr -rc /System/Library/Extensions/AppleBMC.kext
sudo xattr -rc /System/Library/PrivateFrameworks/PlatformHardwareManagement.framework

sudo chmod -R 755 /System/Library/PrivateFrameworks/PlatformHardwareManagement.framework

sudo chmod 644 /System/Library/LaunchDaemons/com.apple.hwmond.plist
sudo launchctl load -w /System/Library/LaunchDaemons/com.apple.hwmond.plist

sudo chmod -R 755 /System/Library/Extensions/AppleBMC.kext
sudo chown -R root:wheel /System/Library/Extensions/AppleBMC.kext
sudo kextload /System/Library/Extensions/AppleBMC.kext

sudo cp -r /System/Library/Extensions/AppleBMC.kext /Library/Extensions/

sudo spctl --master-enable