#!/bin/sh

#  30-Network.sh
#  servermgr_network
#
#  Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.



#
# Script to set up the network config directories & put the default file in place
#

ServerRoot="/Applications/Server.app/Contents/ServerRoot"
DefaultAutoPortmapConfig="${ServerRoot}/usr/share/servermgrd/bundles/servermgr_network.bundle/Contents/Resources/autoportmap.plist"
NetworkConfigDir="/Library/Server/Network/Config"
TargetConfigFile="${NetworkConfigDir}/autoportmap.plist"

#
# setting up the /Library/Servers directory
#

mkdir -p ${NetworkConfigDir}

#
# Copy the defult file
#

if [ -e "${TargetConfigFile}" ]; then
    echo "${TargetConfigFile} already present"
else
    cp ${DefaultAutoPortmapConfig} ${NetworkConfigDir}
fi
