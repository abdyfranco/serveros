#!/bin/sh
#
# Copyright (c) 2016 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
# This script runs when macOS Server is promoted (first set up).

# Give the built-in caching server a chance to move its cached content to the Server caching server.
/usr/bin/AssetCacheActivatorUtil status
# ignore failures
exit 0
