#!/usr/bin/python

# 99-ftp_promote.py
#
# Copyright (c) 2012 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.

import subprocess

print "start 99-ftp_promote.py"

print "Unloading /System/Library/LaunchDaemons/ftp.plist"
subprocess.call(["launchctl", "unload", "-w", "/System/Library/LaunchDaemons/ftp.plist"])

print "end 99-ftp_promote.py"
