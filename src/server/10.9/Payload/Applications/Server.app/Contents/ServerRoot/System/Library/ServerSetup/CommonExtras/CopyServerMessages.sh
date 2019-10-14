#!/bin/sh

# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#

SERVER_MESSAGES_PATH="/Applications/Server.app/Contents/Resources/ServerMessages.bundle"
SERVER_LIBRARY_PATH="/Library/Server"
SERVER_SETUP_PATH="${SERVER_LIBRARY_PATH}/Setup"

if [ ! -d "${SERVER_SETUP_PATH}" ]; then
    mkdir "${SERVER_SETUP_PATH}"
fi

if [ -d "${SERVER_MESSAGES_PATH}" ]; then
	cp -rp "${SERVER_MESSAGES_PATH}" "${SERVER_SETUP_PATH}"
fi