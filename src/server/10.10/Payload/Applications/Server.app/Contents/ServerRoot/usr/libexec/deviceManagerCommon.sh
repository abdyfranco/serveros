#!/bin/bash
#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------
#
# "Promotion" script for Profile Manager

PATH=/bin:/usr/bin:/usr/sbin

SERVER_ROOT="/Applications/Server.app/Contents/ServerRoot"
DEVICEMGR_PATH="$SERVER_ROOT/usr/share/devicemgr"

source $DEVICEMGR_PATH/config/common.sh       # Loads all our path definitions and some other common variables

log "Starting..."

if [ -z "$PM_LIBRARY_DIR" -o -z "$SERVICE_DATA_LINK" -o -z "$PM_LOG_DIR" ]; then    # Sanity check that these are not empty, as that would cause problems
  echo "Required variables are not set correctly!"
  exit 98
fi

log "Ensuring Profile Manager services are unloaded and terminated..."
$SERVERCTL disable service=com.apple.DeviceManagement.SCEPHelper
$SERVERCTL disable service=com.apple.DeviceManagement.devicemgrd
killall -9 scep_helper
killall -9 devicemgrd
$SERVERCTL disable service=com.apple.DeviceManagement.postgres

NEWSYSLOG_D="/private/etc/newsyslog.d"

#
# Create support folders outside of the server bundle
#
mkdir -p $PM_LOG_DIR
chown -R $PM_USERNAME:admin $PM_LOG_DIR           # Give admin group read access to the log directory
chmod -R u=rwX,go=rX $PM_LOG_DIR

# Create the old /var/log/devicemgr symlink
rm -rf $PM_VAR_LOG_LINK
ln -s  $PM_LOG_DIR $PM_VAR_LOG_LINK
chown -h $PM_USERNAME:$PM_GROUPNAME $PM_VAR_LOG_LINK

mkdir -p $PM_LIBRARY_DIR
  mkdir -p $PM_CONFIG_DIR
    mkdir -p $PM_VAR_DIR
      mkdir -p $PM_PG_SOCKET_DIR
      mkdir -p $PM_FCGI_BIN_DIR

# Make sure we have a symlink to php-fpm and backend/php
rm -rf $PM_FCGI_BIN_DIR/php-fpm
ln -s /usr/sbin/php-fpm $PM_FCGI_BIN_DIR
rm -rf $PM_CONFIG_DIR/php
ln -s $BACKEND_PHP_PATH $PM_CONFIG_DIR/php

# Do we already have a (valid!) ServiceData symlink
NEED_SD_SYMLINK="Y"
if [ -e $SERVICE_DATA_LINK ]; then
  # We have something there, is it a link?
  if [ -L $SERVICE_DATA_LINK ]; then
    # Yes, does it appear to be valid? (Valid means it refers to a directory.)
    if [ -d $SERVICE_DATA_LINK/ ]; then
      NEED_SD_SYMLINK="N"      # Yes, it seems valid, so don't create the default Data dir or ServiceData symlink
    else
      log "$SERVICE_DATA_LINK is a symlink, but it appears to be broken. Will restore to default."
    fi
  else
    log "$SERVICE_DATA_LINK exists but is not a symlink. Deleting so the symlink can be created."
  fi
fi # else: No ServiceData link, assume a default setup

if [ "$NEED_SD_SYMLINK" != "N" ]; then
  # Continue with the default setup
  rm -rf $SERVICE_DATA_LINK                               # Unconditionally delete anything that's already there

  # See if we have an old ServiceData symlink in /var/devicemgr. If we do, we should use that.
  if [ -L /var/devicemgr/ServiceData ]; then
    log "/var/devicemgr/ServiceData exists and is a symlink, moving it to $SERVICE_DATA_LINK"
    mv /var/devicemgr/ServiceData $SERVICE_DATA_LINK        # Keep the old symlink
  else
    ln -s $PM_LIBRARY_DIR $SERVICE_DATA_LINK                # Setup the ServiceData symlink to the default
  fi
  
  chown -h $PM_USERNAME:$PM_GROUPNAME $SERVICE_DATA_LINK
fi

# One final sanity check that our ServiceData symlink is really a symlink and refers to something valid
if [ ! -L $SERVICE_DATA_LINK -o ! -d $SERVICE_DATA_LINK ]; then
  log "$SERVICE_DATA_LINK is somehow still broken. Forcing to default value."
  rm -rf $SERVICE_DATA_LINK                               # Unconditionally delete anything that's already there
  ln -s $PM_LIBRARY_DIR $SERVICE_DATA_LINK                # Setup the ServiceData symlink to the default
  chown -h $PM_USERNAME:$PM_GROUPNAME $SERVICE_DATA_LINK
fi

# These are accessed through SERVICE_DATA_LINK, so don't try to create these until after we've created the link.
# Don't use the -p option so these will fail instead of creating a directory where the symlink should be.
mkdir $PM_DATA_DIR            # Will create at /Library/Server/ProfileManager/Data by default, but will follow the service data symlink to another volume if so set
  mkdir $PM_FILE_STORE_DIR
  mkdir $PM_TMP_DIR
    mkdir $PM_PHP_SESSION_DIR

#
# Clean up old crud in /var that we no longer use but that might have been left behind by an earlier server
#
rm -f $PM_DATA_DIR/migration
rm -f $PM_DATA_DIR/structure.sql
rm -f $PM_DATA_DIR/schema.rb
if [ -d /var/devicemgr ]; then
  rm -rf /var/devicemgr
  log "Deleted old /var/devicemgr directory."
fi
if [ -d /var/run/devicemgr ]; then
  rm -rf /var/run/devicemgr
  log "Deleted old /var/run/devicemgr directory."
fi
if [ -d /var/spool/devicemgr ]; then
  rm -rf /var/spool/devicemgr
  log "Deleted old /var/spool/devicemgr directory."
fi

# Setup (some) final permissions
# Note: Some processes may have started placing special files (e.g., sockets) in
# our directory already. Make sure to leave their permissions and ownership alone.
# chown -R $PM_USERNAME:$PM_GROUPNAME $SERVICE_DATA_LINK/ -- but only for files and directories
/usr/bin/find $PM_LIBRARY_DIR/    \( -type f -o -type d \) -exec chown $PM_USERNAME:$PM_GROUPNAME "{}" \;
/usr/bin/find $SERVICE_DATA_LINK/ \( -type f -o -type d \) -exec chown $PM_USERNAME:$PM_GROUPNAME "{}" \;
# chmod -R u=rwX,go=rX $SERVICE_DATA_LINK/ -- but only for files and directories
/usr/bin/find $PM_LIBRARY_DIR/    \( -type f -o -type d \) -exec chmod u=rwX,go=rX "{}" \;
/usr/bin/find $SERVICE_DATA_LINK/ \( -type f -o -type d \) -exec chmod u=rwX,go=rX "{}" \;
chmod 770 $PM_PHP_SESSION_DIR

#
# We have to have a CA cert exported to make Apache happy. If there isn't one there now, create a self-signed CA until we can get one from OD.
#
if [ ! -s $PM_CONFIG_DIR/SSLCACertificateFile.pem ]; then
  OPENSSL=/usr/bin/openssl
  $OPENSSL genrsa -passout pass:whocares -des3 -out $PM_TMP_DIR/root-ca.key 1024
  $OPENSSL req -new -x509 -days 3650 -key $PM_TMP_DIR/root-ca.key -out $PM_CONFIG_DIR/SSLCACertificateFile.pem -config $DEVICEMGR_CONFIG_PATH/placeholderCA.cnf 
  chown $PM_USERNAME:$PM_GROUPNAME $PM_CONFIG_DIR/SSLCACertificateFile.pem
  rm -f $PM_TMP_DIR/root-ca.key
fi


#
# Copy newsyslog.d config file and PostgreSQL config plist
#
cp -f $SERVER_ROOT$NEWSYSLOG_D/com.apple.devicemgr.conf $NEWSYSLOG_D/com.apple.devicemgr.conf
cp -f $DEVICEMGR_CONFIG_PATH/com.apple.DeviceManagement.postgres.plist $PM_PG_CONFIG_FILE

# Create a new database or move the pre-created PostgreSQL cluster to where we want it
if [ ! -d $PG_DATA_DIR ]; then
  if [ ! -d $PG_BACKUP_DIR ]; then
    if [ -d $SERVER_LIBRARY_PATH/postgres_service_clusters/profile_manager ]; then
      # We've got migrated data, so move it to where our code looks for our DB
      log "Relocating postgres cluster with data from a prior install..."
      $SERVER_ROOT/usr/libexec/relocate_postgres_service_cluster -s profile_manager -d $PG_DATA_DIR
      status=$?
      if [ $status -ne 0 ]; then
        log "relocate_postgres_service_cluster failed: $status"
        exit 1
      fi
    else
      # No database, so we have to create it ourselves
      log "Creating new postgres cluster..."
      sudo -u $PM_USERNAME $SERVER_ROOT/usr/bin/initdb --encoding UTF8 --locale=C -D $PG_DATA_DIR
      status=$?
      if [ $status -ne 0 ]; then
        log "initdb failed: $status"
        exit 2
      fi
    fi
    # (migration_tool will take care of the rest)
  else
    log "No postgres cluster exists, but a postgres backup appers to exist at $PG_BACKUP_DIR."
  fi
else
  # PG_DATA_DIR (PostgreSQL) needs more restrictive permissions
  chmod -R u=rwX,go-rwx $PG_DATA_DIR                # Only _devicemgr has access in this directory
  log "A postgres cluster appers to already exist at $PG_DATA_DIR"
fi

###############################################################################################
# Pre-flight starting the postgres server to detect unrecoverable failures to start postgres
log "Pre-flight starting postgres..."
sudo -u $PM_USERNAME $SERVER_ROOT/usr/bin/xpostgres -a $PM_CONFIG_DIR/PostgreSQL_config.plist &
pg_pid=$!
log "Started xpostgres with PID $pg_pid"

function child_died()
{
  pids=`jobs -rp | grep $pg_pid | wc -l`
  if [ "$pids" -eq 0 ]; then
    log "The postgres server with PID $pg_pid died before responding to connections. We die here, too."
    exit 99
  fi
} # child_died

# Setup a trap to catch xpostgres dying
set -o monitor
trap 'child_died' CHLD
wait_for_postgres            # This will wait forever for postgres to start, but if xpostgres dies we'll catch it in the trap above and abort this script
trap - CHLD

log "Stopping postgres pre-flight instance..."
sudo -u $PM_USERNAME $SERVER_ROOT/usr/bin/xpg_ctl stop -w -t 60 -D $PG_DATA_DIR
###############################################################################################

# Start the postgres server
log "Starting postgres under launchd..."
$SERVERCTL enable service=com.apple.DeviceManagement.postgres

# Load scep_helper before migration because we might need it
$SERVERCTL enable service=com.apple.DeviceManagement.SCEPHelper

log "Migrating PM SACL in OD..."
$DEVICEMGR_PATH/config/pmsaclupdate

log "Preparing/migrating database..."
rm -f $PM_DATA_DIR/models                                    # This will need to be rebuilt, so delete it
sudo -u $PM_USERNAME $MIGRATION_PATH/migration_tool 2> /dev/null  # Pipe stderr to /dev/null to suppress all the postgres notices while creating the initial DB
status=$?
if [ $status -ne 0 ]; then
  log "migration_tool failed: $status"
  exit 5
fi

# The above might cause PM_RAILS_LOG_FILE to be owned by root, so fix that
if [ -f $PM_RAILS_LOG_FILE ]; then
  chown $PM_USERNAME:admin $PM_RAILS_LOG_FILE
fi

# Enable devicemgrd to always be ready to run
$SERVERCTL enable service=com.apple.DeviceManagement.devicemgrd

log "Done!"
