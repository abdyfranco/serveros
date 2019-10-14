#!/bin/sh

# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
RETVAL=0

SERVER_INSTALL_PATH_PREFIX="/Applications/Server.app/Contents/ServerRoot"
SERVER_LIBRARY_PATH="/Library/Server"

echo "Running xcscredd_preflight"
$SERVER_INSTALL_PATH_PREFIX"/usr/sbin/xcscredd_preflight"

echo "Creating /Library/Server/Xcode/Credentials directory (if necessary)"
mkdir -p $SERVER_LIBRARY_PATH"/Xcode/Credentials/"
mkdir -p $SERVER_LIBRARY_PATH"/Xcode/Credentials/Data"
mkdir -p $SERVER_LIBRARY_PATH"/Xcode/Credentials/Config"

if [ -e $SERVER_LIBRARY_PATH"/Xcode/Credentials/Data/xcs.keychain" ]
then
    echo "Keychain already exists, will NOT config clean or config"
else
    echo "Calling xcscredd config clean followed by config"
    $SERVER_INSTALL_PATH_PREFIX"/System/Library/CoreServices/XCSCredentialServer.bundle/Contents/MacOS/xcscredd" config clean
    # just to make sure the old identity is gone...
    # This does not delete the private key associated with the cert unfortunately
    /usr/bin/security delete-certificate -c com.apple.xcs.credential /Library/Keychains/System.keychain 2> /dev/null
    $SERVER_INSTALL_PATH_PREFIX"/System/Library/CoreServices/XCSCredentialServer.bundle/Contents/MacOS/xcscredd" config
    RETVAL=$?
fi

# Fix permissions up.

echo "Fixing permissions and ownership for _xcscredserver user"
chown -R  _xcscredserver:_xcscredserver $SERVER_LIBRARY_PATH"/Xcode/Credentials"
chmod 750 $SERVER_LIBRARY_PATH"/Xcode/Credentials"
chown _xcscredserver:_xcscredserver $SERVER_LIBRARY_PATH"/Xcode/Credentials/Config/credserver.plist"
chmod 640 $SERVER_LIBRARY_PATH"/Xcode/Credentials/Config/credserver.plist"
chown _xcscredserver:_teamsserver $SERVER_LIBRARY_PATH"/Xcode/Logs/credserver.log"

# Always enable xcscredhandler and xcscredd (in that order) using serverd.  Server demotion/promotion will NOT
# automatically re-enable these services.

echo "Enabling xcscredhandler and xcscredd via serverctl"
$SERVER_INSTALL_PATH_PREFIX"/usr/sbin/serverctl" enable service=com.apple.xcscredhandler
$SERVER_INSTALL_PATH_PREFIX"/usr/sbin/serverctl" enable service=com.apple.xcscredd

# return the value of the xcscredd config call (if we made it)
exit $RETVAL
