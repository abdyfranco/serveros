#!/usr/bin/env bash

# Copyright (c) 2014-2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#

#
# Set TCP to ack every other packet. (RFC-compliant "compatibility" mode.)
# This should increase server performance, especially when connected
# to Windows clients.
#
sysctl net.inet.tcp.delayed_ack=2

# Don't do anything else if server performance mode is enabled.
SERVER_INFO="/System/Library/PrivateFrameworks/ServerInformation.framework/Versions/A/Resources/serverinfo";
if [[ -x "${SERVER_INFO}" ]] && "${SERVER_INFO}" --quiet --perfmode; then
    exit
fi

(( memsize=$(sysctl -n hw.memsize) ))
(( memsize/=1073741824 ))

if (( ${memsize} >= 16 )); then
	sysctl kern.maxfiles=300000
elif  ((${memsize} >= 8)); then
	sysctl kern.maxfiles=150000
elif  (( ${memsize} >= 4 )); then
	sysctl kern.maxfiles=120000
else
	sysctl kern.maxfiles=90000
fi

if [[ -e "/Library/Server/Configuration/.ProfileManagerPerformanceMode" ]]; then
    sysctl kern.maxproc=2500
    sysctl kern.maxprocperuid=1500
fi
