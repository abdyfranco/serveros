#!/bin/bash

sudo xattr -r -d com.apple.quarantine /Applications/Server/Xgrid\ Admin.app
sudo spctl --master-enable

# Set up Xgrid Controller
set -e

chown -R root:wheel /usr/libexec/xgrid 
chown root:wheel /usr/sbin/xgridctl

chown root:wheel /usr/share/sandbox/xgrid*

chown -R root:wheel /etc/xgrid
sudo chmod 600 /etc/xgrid/controller/agent-password

chown -R root:wheel /var/xgrid
chown -R xgridcontroller:_xgridcontroller /var/xgrid/controller

chown -R root:wheel /System/Library/LaunchDaemons/com.apple.xgridcontrollerd.plist

chown -R root:wheel /System/Library/Frameworks/XgridFoundation.framework 
chown -R root:wheel /System/Library/PrivateFrameworks/BEEP.framework

mkdir -p /Library/Logs/Xgrid
chown -R root:wheel /Library/Logs/Xgrid

xgridctl controller start

# Set up Xgrid Agent
chown -R root:wheel /usr/libexec/xgrid 
chown root:wheel /usr/sbin/xgridctl

chown root:wheel /usr/share/sandbox/xgrid*

chown -R root:wheel /etc/xgrid
chmod 600 /etc/xgrid/agent/controller-password

chown -R root:wheel /var/xgrid
chown -R xgridagent:_xgridagent /var/xgrid/agent

chown -R root:wheel /System/Library/LaunchDaemons/com.apple.xgridagentd.plist
chmod 644 /System/Library/LaunchDaemons/com.apple.xgridagentd.plist
chmod 644 /Library/Preferences/com.apple.xgrid.agent.plist

chown -R root:wheel /System/Library/Frameworks/XgridFoundation.framework 
chown -R root:wheel /System/Library/PrivateFrameworks/BEEP.framework

mkdir -p /Library/Logs/Xgrid
chown -R root:wheel /Library/Logs/Xgrid

xgridctl agent start
