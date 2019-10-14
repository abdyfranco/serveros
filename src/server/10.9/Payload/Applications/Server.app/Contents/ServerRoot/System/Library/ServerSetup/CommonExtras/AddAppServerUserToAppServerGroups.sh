#!/bin/sh

# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.

# <rdar://problem/5159565> _appserver user needs to to be added to the App Server Admins and Application Server Groups

DSCL="/usr/bin/dscl"

"$DSCL" . -merge /Groups/_appserveradm dsAttrTypeNative:users _appserver
"$DSCL" . -merge /Groups/_appserverusr dsAttrTypeNative:users _appserver
