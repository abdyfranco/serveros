#!/bin/bash

# Copyright (c) 2013-2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
# 30-serverTuning_disable.sh
# This reverses the subset of settings that were in rc.server in prior releases.
#

rm /etc/rc.server

# If we are booted in hi perf mode then just exit
SERVER_INFO="/System/Library/PrivateFrameworks/ServerInformation.framework/Versions/A/Resources/serverinfo";
if [ -e $SERVER_INFO ]; then
    if $SERVER_INFO -q --perfmode; then
        exit
	else
		sysctl -w kern.maxfiles=12288
    fi
fi

