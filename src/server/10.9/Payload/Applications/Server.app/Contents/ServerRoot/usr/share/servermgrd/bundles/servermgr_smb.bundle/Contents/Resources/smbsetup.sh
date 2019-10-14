#!/bin/sh
#  Copyright (c) 2012 Apple Inc. All Rights Reserved.
#
#  IMPORTANT NOTE: This file is licensed only for use on Apple-branded
#  computers and is subject to the terms and conditions of the Apple Software
#  License Agreement accompanying the package this file is a part of.
#  You may not port this file to another platform without Apple's written consent.

#
# servermgr_smb
#

defaults write /Library/Preferences/SystemConfiguration/com.apple.smb.server AllowGuestAccess -bool no

