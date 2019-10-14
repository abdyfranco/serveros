#!/bin/sh

##
# Copyright (c) 2009-2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
# IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
# of the Apple Software and is subject to the terms and conditions of the Apple
# Software License Agreement accompanying the package this file is part of.
##

# Run the preflight script to initialize the database BEFORE collabd is actually started so we can
# migrate Snow Leopard data to the Lion schema before automatic schema migrations take place on
# startup.

/Applications/Server.app/Contents/ServerRoot/usr/sbin/collabd_preflight
