#!/bin/bash

CI=1 /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

brew install ipmiutil

sudo rm -rf /usr/bin/ipmitool
sudo rm -rf /usr/sbin/hwmond

ln -s /usr/local/bin/ipmiutil /bin/ipmiutil
ln -s /usr/local/bin/ipmiutil /usr/bin/ipmiutil

sudo rm -rf /Applications/Server/Xserve\ LOM\ Configurator.app
sudo rm -rf /System/Library/Extensions/AppleBMC.kext
sudo rm -rf /System/Library/LaunchDaemons/com.apple.hwmond.plist
sudo rm -rf /System/Library/PrivateFrameworks/PlatformHardwareManagement.framework

sudo spctl --master-disable