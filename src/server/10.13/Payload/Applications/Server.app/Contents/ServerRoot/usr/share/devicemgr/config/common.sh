#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

# This file contains common paths and other variables that many Profile Manager shell scripts need

if [ -z "$SERVER_ROOT" ]; then
  SERVER_ROOT="/Applications/Server.app/Contents/ServerRoot"
fi

if [ -n "$0" ]; then
  if [[ $0 != -* ]]; then
    MY_SHELL_FILE=`basename $0`
  else
    MY_SHELL_FILE="$0"
  fi
else
  MY_SHELL_FILE="UNKNOWN_SCRIPT"
fi

function log()
{
  echo -n `/bin/date -j +"%F %T"`
  if [ "$1" = "-n" ]; then
    echo -n " $MY_SHELL_FILE: $2"
  else
    echo " $MY_SHELL_FILE: $1"
  fi
}

# Tools we often use
SUDO=/usr/bin/sudo
SERVERADMIN="$SUDO $SERVER_ROOT/usr/sbin/serveradmin"
SERVERCTL="$SUDO $SERVER_ROOT/usr/sbin/serverctl"

##########################################################################
# KEEP THE FOLLOWING IN SYNC WITH DeviceManager-main.h AND mdm_paths.rb! #
##########################################################################

PM_GID=220
PM_GROUPNAME="_devicemgr"
PM_UID=220
PM_USERNAME="_devicemgr"

# Useful in-bundle paths
DEVICEMGR_PATH="$SERVER_ROOT/usr/share/devicemgr"
  BACKEND_PATH="$DEVICEMGR_PATH/backend"
    BACKEND_LIB_PATH="$BACKEND_PATH/lib"
  DEVICEMGR_CONFIG_PATH="$DEVICEMGR_PATH/config"
    SD_RELOCATOR_PATH="$DEVICEMGR_CONFIG_PATH/sd_relocator"
  DEVICEMGRD_PATH="$DEVICEMGR_PATH/devicemgrd"
  DMRUNNERD_PATH="$DEVICEMGR_PATH/dmrunnerd"
  FRONTEND_PATH="$DEVICEMGR_PATH/frontend"
  INFO_PLIST_PATH="$DEVICEMGR_PATH/Info.plist"
  MIGRATION_PATH="$DEVICEMGR_PATH/migration"
  DMHELPER_PATH="$DEVICEMGR_PATH/dm_helper"
SERVERMGR_DEVICEMGR_PATH="$SERVER_ROOT/usr/share/servermgrd/bundles/servermgr_devicemgr.bundle"

# Our out-of-bundle directory structure looks like this:
# /
#   Library/
#     Logs/
#       ProfileManager/
#         devicemgrd.log
#         dmrunnerd.log
#         email.log
#         migration_tool.log
#         profilemanager.log
#         dm_helper.log
#         servermgr_devicemgr.log
#     Preferences/
#       com.apple.ProfileManager.plist      (defaults for all of Profile Manager, initially empty)
#     Server/
#       ProfileManager/
#         Config/
#           PostgreSQL_config.plist
#           ServiceData                     (symlink to find the "Data" directory, defaults to /Library/Server/ProfileManager)
#           var/
#             devicemgrd.sock               (socket for communicating with devicemgrd)
#             PostgreSQL/                   (directory that will hold the PostgreSQL server socket)
#         Data/                             (default service data location)
#           backup/                         (backups of PostgreSQL database)
#           FileStore/                      (directory that holds admin-uploaded files)
#             <Trust Profile>.mobileconfig
#           PostgreSQL/                     (our PostgreSQL database)
#           Images/                         (directory that hold are user images)
#           tmp/
#   private/
#     etc/
#       newsyslog.d/
#         com.apple.devicemgr.conf
#     var/
#       log/
#         devicemgr                         (symlink to /Library/Logs/ProfileManager)

PM_LOG_DIR="/Library/Logs/ProfileManager"
  PM_DEVICEMGRD_LOG_FILE="$PM_LOG_DIR/devicemgrd.log"
  PM_DMRUNNDERD_LOG_FILE="$PM_LOG_DIR/dmrunnerd.log"
  PM_EMAIL_LOG_FILE="$PM_LOG_DIR/email.log"
  PM_MIGRATION_LOG_FILE="$PM_LOG_DIR/migration_tool.log"
  PM_RAILS_LOG_FILE="$PM_LOG_DIR/profilemanager.log"
  PM_DM_HELPER_LOG_FILE="$PM_LOG_DIR/dm_helper.log"
  PM_SERVERMGR_LOG_FILE="$PM_LOG_DIR/servermgr_devicemgr.log"
PM_VAR_LOG_LINK="/var/log/devicemgr"

PM_PREFS_FILE="/Library/Preferences/com.apple.ProfileManager"

SERVER_LIBRARY_PATH="/Library/Server"
PM_LIBRARY_DIR="$SERVER_LIBRARY_PATH/ProfileManager"
  PM_CONFIG_DIR="$PM_LIBRARY_DIR/Config"
    PM_PG_CONFIG_FILE="$PM_CONFIG_DIR/PostgreSQL_config.plist"
    SERVICE_DATA_LINK="$PM_CONFIG_DIR/ServiceData"    # Defaults to a symlink to PM_LIBRARY_DIR (/Library/Server/ProfileManager/Config/ServiceData)
    PM_VAR_DIR="$PM_CONFIG_DIR/var"                   # Our replacement for /private/var (/Library/Server/ProfileManager/Config/var)
      PM_PG_SOCKET_DIR="$PM_VAR_DIR/PostgreSQL"

PM_DATA_DIR="$SERVICE_DATA_LINK/Data"                 # Only the "Data" directory is accessed through the symlink, everything else is always in PM_LIBRARY_DIR
  PG_BACKUP_DIR="$PM_DATA_DIR/backup"
  PM_FILE_STORE_DIR="$PM_DATA_DIR/FileStore"
  PM_IMAGES_DIR="$PM_DATA_DIR/Images"
  PG_DATA_DIR="$PM_DATA_DIR/PostgreSQL"
  PM_TMP_DIR="$PM_DATA_DIR/tmp"

DMDB="$SUDO $SERVER_ROOT/usr/bin/psql -U _devicemgr -d devicemgr_v2m0 -h $PM_PG_SOCKET_DIR -c"


function wait_for_postgres()
{
  xpg_died=0
  xpg_pid="$1"

  if [ -n "$xpg_pid" ]; then
    set -o monitor
    trap "xpg_died=1" CHLD
  fi
  
  count=0
  while :
  do
    sleep 1
    sudo -u $PM_USERNAME $SERVER_ROOT/usr/bin/psql -c "select version();" -d template1 -U $PM_USERNAME -h $PM_PG_SOCKET_DIR > /dev/null 2>&1
    if [ $? -eq 0 ]; then
      if [ $count -ne 0 ]; then
        log "Running!"
      fi
      break;
    elif [ $xpg_died -ne 0 ]; then
      pids=`jobs -rp | grep -E "\b$xpg_pid\b" | wc -l`
      if [ $pids -eq 0 ]; then
        log "The postgres server with PID $xpg_pid died before responding to connections. We die here, too."
        exit 99
      else
        xpg_died=0        # Wasn't xpostgres that died, so clear the flag and keep going
      fi
    else
      count=$(( count + 1 ))
      if [ $count -eq 1 ]; then
        log -n "Waiting for postgres to fully start..."
      else
        echo -n "."     # Don't use log()
      fi
      ############################################################################################################################
      # Don't ever timeout, as it can take a very long time for postgres to start if it is rebuilding the database from a backup #
      ############################################################################################################################
    fi
  done

  if [ -n "$xpg_pid" ]; then
    trap - CHLD
  fi
} # wait_for_postgres

function disable_devicemgr()
{
  stop_devicemgr
  $SERVERCTL disable service=com.apple.DeviceManagement.devicemgrd
  $SERVERCTL disable service=com.apple.DeviceManagement.dmpgHelper
  $SERVERCTL disable service=com.apple.DeviceManagement.postgres
} # disable_devicemgr

function enable_devicemgr()
{
  $SERVERCTL enable service=com.apple.DeviceManagement.postgres
  $SERVERCTL enable service=com.apple.DeviceManagement.dmpgHelper
  $SERVERCTL enable service=com.apple.DeviceManagement.devicemgrd
  start_devicemgr_if_stopped
} # enable_devicemgr

function start_devicemgr_if_stopped()
{
  if [ -z "$STOPPED" ]; then
    $SERVERADMIN start devicemgr
    local save_cwd=`pwd`
    cd $BACKEND_LIB_PATH
    $SUDO ./dm_tool -a noOp    # Get devicemgrd running
    cd "$save_cwd"
  fi
} # start_devicemgr_if_stopped

function stop_devicemgr()
{
  STOPPED=`$SERVERADMIN status devicemgr | grep "STOPPED"`

  if [ -z "$STOPPED" ]; then
    $SERVERADMIN stop devicemgr
  fi
} # stop_devicemgr
