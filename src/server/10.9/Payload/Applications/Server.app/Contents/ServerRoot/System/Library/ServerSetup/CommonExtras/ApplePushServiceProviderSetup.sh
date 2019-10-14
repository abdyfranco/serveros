#!/bin/sh

#  ApplePushServiceProviderSetup.sh
#  ApplePushServiceProvider
#
#  Created by briank on 3/5/13.
#  Copyright (c) 2013 Apple, Inc. All rights reserved.

SERVERCTL=/Applications/Server.app/Contents/ServerRoot/usr/sbin/serverctl

${SERVERCTL} enable service=com.apple.apspd

