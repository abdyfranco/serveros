#!/bin/sh
#
#  ServerWebDemotion.sh
#  UninstallExtras
#
#  Copyright (c) 2015, 2017 Apple Inc. All rights reserved.
#

# Remove newsyslog apache configuration
rm -f /etc/newsyslog.d/com.apple.server-apache.conf
serverName=`hostname`
defaults write /etc/wfs/wfs.plist ServerAddr '*'
defaults write /etc/wfs/wfs.plist ServerName $serverName
defaults write /etc/wfs/wfs.plist ServerSSL -bool TRUE
defaults write /etc/wfs/wfs.plist ServerPort -int 443
plutil -convert xml1 /etc/wfs/wfs.plist

