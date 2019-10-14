#!/bin/sh

# Copyright (c) 2014-2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#

SERVER_INSTALL_PATH_PREFIX="/Applications/Server.app/Contents/ServerRoot"
SERVER_LIBRARY_PATH="/Library/Server"

SOURCE_PATH="${SERVER_INSTALL_PATH_PREFIX}/System/Library/ServerSetup/UninstallExtras"
TARGET_PATH="${SERVER_LIBRARY_PATH}/.UninstallExtras"

if [[ -d "${SERVER_LIBRARY_PATH}/.UninstallExtras" ]]; then
    rm -rf "${SERVER_LIBRARY_PATH}/.UninstallExtras"
fi
ditto "${SOURCE_PATH}" "${TARGET_PATH}"
