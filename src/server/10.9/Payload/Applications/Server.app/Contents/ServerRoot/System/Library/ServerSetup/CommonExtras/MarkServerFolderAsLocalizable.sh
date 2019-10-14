#!/bin/bash

# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.

MANAGEDIR="/Applications/Server"
LOCALIZEDTOKEN="$MANAGEDIR/.localized"

if [ -d "$MANAGEDIR" ]; then
	if [ ! -x "$LOCALIZEDTOKEN" ]; then
		touch "$LOCALIZEDTOKEN"
		chmod 644 "$LOCALIZEDTOKEN"
	fi
fi
