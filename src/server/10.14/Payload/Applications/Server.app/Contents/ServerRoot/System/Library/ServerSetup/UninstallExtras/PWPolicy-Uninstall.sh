#!/bin/bash

# Copyright (c) 2013-2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
#

/usr/bin/pwpolicy -setglobalhashtypes CRAM-MD5 off RECOVERABLE off SMB-NT off SMB-LAN-MANAGER off SALTED-SHA1 off SALTED-SHA512-PBKDF2 on SRP-RFC5054-4096-SHA512-PBKDF2 on
