#!/bin/sh

# SetAFPClientCount.sh
# servermgr_afp
#
# Created by wrstuden on 9/2/10.
# Copyright 2010, 2012 Apple Inc. All rights reserved.

defaults write /Library/Preferences/com.apple.AppleFileServer fullServerMode -bool yes
defaults write /Library/Preferences/com.apple.AppleFileServer maxConnections -int -1
defaults write /Library/Preferences/com.apple.AppleFileServer maxGuests -int -1
defaults write /Library/Preferences/com.apple.AppleFileServer activityLog -bool yes
defaults write /Library/Preferences/com.apple.AppleFileServer allowSendMessage -bool yes
