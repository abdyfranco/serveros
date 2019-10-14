#!/bin/sh

##
# Copyright (c) 2012-2014 Apple Inc. All Rights Reserved.
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

# assume there is a file called "bots" that lists the bot guid of each bot we
# want to run when this is called, you will need to change this path
BOTS_PATH = "/tmp/bots"

KICKER_PATH = "/Applications/Server.app/Contents/ServerRoot/usr/share/collabd/server/ruby/kick_build_bot.rb"

echo "Running hook to kick bot runs"
/Applications/Server.app/Contents/ServerRoot/usr/bin/ruby "$KICKER_PATH" < "$BOTS_PATH"
