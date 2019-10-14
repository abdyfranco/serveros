#!/bin/bash

echo "This script will gather logs and your entire Profile Manager database to help diagnose upgrade issues with Profile Manager."
echo ""
echo "***************************************************************************"
echo "*** THIS INFORMATION MAY CONTAIN PERSONALLY IDENTIFIABLE INFORMATION    ***"
echo "*** ABOUT THE USERS IN YOUR DIRECTORY SERVER AND RECOVERABLE PASSWORDS. ***"
echo "***************************************************************************"
echo ""
echo "Do not send the output of this script to Apple unless you agree to disclose this information to Apple."

save_cwd=`pwd`

SERVER_ROOT="/Applications/Server.app/Contents/ServerRoot"
DEVICEMGR_PATH="$SERVER_ROOT/usr/share/devicemgr"

source $DEVICEMGR_PATH/config/common.sh               # Get all our paths from one file so we don't have to update every script for each change

BUNDLE_PATH="$HOME/Desktop/ProfileManager-Migration-Bundle.tgz"
REAL_USER=`id -p | grep -E "^login\W+\w+$" | sed -E "s/^login.(.*)$/\\1/1"`

$SERVERADMIN stop devicemgr

# Stop our "always on" services so we can tar up the DB
$SERVERCTL disable service=com.apple.DeviceManagement.SCEPHelper
$SERVERCTL disable service=com.apple.DeviceManagement.devicemgrd
$SERVERCTL disable service=com.apple.DeviceManagement.postgres

sudo tar cvzf "$BUNDLE_PATH" $PM_LOG_DIR $PG_DATA_DIR
sudo chown $REAL_USER "$BUNDLE_PATH"
sudo chmod 0600 "$BUNDLE_PATH"

# Have to manually start PostgreSQL on our cluster
$SERVERCTL enable service=com.apple.DeviceManagement.postgres

# We have to wait for the server to come alive
wait_for_postgres

$SERVERCTL enable service=com.apple.DeviceManagement.devicemgrd
$SERVERCTL enable service=com.apple.DeviceManagement.SCEPHelper

cd "$save_cwd"
