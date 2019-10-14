#!/bin/bash
#-------------------------------------------------------------------------
# Copyright (c) 2017 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------
#
# "Preflight" script for Profile Manager

PATH=/bin:/usr/bin:/usr/sbin

SERVER_ROOT="/Applications/Server.app/Contents/ServerRoot"
DEVICEMGR_PATH="$SERVER_ROOT/usr/share/devicemgr"

source $DEVICEMGR_PATH/config/common.sh       # Loads all our path definitions and some other common variables

log "Starting..."

#
# We have to have a CA cert exported to make Apache happy. If there isn't one there now, create a self-signed CA until we can get one from OD.
#
if [ ! -s $PM_CONFIG_DIR/SSLCACertificateFile.pem ]; then
  # Create the config directory if it doesn't exists
  if [ ! -d $PM_CONFIG_DIR ]; then
  	mkdir -p $PM_CONFIG_DIR
  fi
  OPENSSL=/usr/bin/openssl
  $OPENSSL genrsa -passout pass:whocares -des3 -out $PM_CONFIG_DIR/root-ca.key 1024
  $OPENSSL req -new -x509 -days 3650 -key $PM_CONFIG_DIR/root-ca.key -out $PM_CONFIG_DIR/SSLCACertificateFile.pem -config $DEVICEMGR_CONFIG_PATH/placeholderCA.cnf
  chown $PM_USERNAME:$PM_GROUPNAME $PM_CONFIG_DIR/SSLCACertificateFile.pem
  rm -f $PM_CONFIG_DIR/root-ca.key
fi

log "Done!"
