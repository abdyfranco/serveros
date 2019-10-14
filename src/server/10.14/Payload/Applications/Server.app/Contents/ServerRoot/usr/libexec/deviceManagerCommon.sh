#!/bin/bash
#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
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

COUNT=`launchctl list | grep 'com\.apple\.DeviceManagement' | wc -l`
if [ $COUNT -gt 0 ]; then
  log "Ensuring Profile Manager launchd jobs are unloaded and terminated..."
  $SERVERCTL disable service=com.apple.DeviceManagement.DMHelper
  $SERVERCTL disable service=com.apple.DeviceManagement.devicemgrd
  killall -9 dm_helper
  killall -9 devicemgrd
  $SERVERCTL disable service=com.apple.DeviceManagement.dmpgHelper
  $SERVERCTL disable service=com.apple.DeviceManagement.postgres
else
  log "No Profile Manager launchd jobs are loaded, it is safe to continue"
fi

NEWSYSLOG_D="/private/etc/newsyslog.d"

#
# Create support folders outside of the server bundle
#
mkdir -p $PM_LOG_DIR
chown -R $PM_USERNAME:admin $PM_LOG_DIR           # Give admin group read access to the log directory
chmod -R u=rwX,g=rX,o-rwx $PM_LOG_DIR
chmod g+t $PM_LOG_DIR

# Create the old /var/log/devicemgr symlink
rm -rf $PM_VAR_LOG_LINK
ln -s  $PM_LOG_DIR $PM_VAR_LOG_LINK
chown -h $PM_USERNAME:$PM_GROUPNAME $PM_VAR_LOG_LINK

mkdir -p $PM_LIBRARY_DIR
  mkdir -p $PM_CONFIG_DIR
    mkdir -p $PM_VAR_DIR
      mkdir -p $PM_PG_SOCKET_DIR

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
  mkdir $PM_IMAGES_DIR
  mkdir $PM_TMP_DIR

# Remove any now-unused PHP stuff
rm -rf $PM_VAR_DIR/fcgi-bin
rm -rf $PM_CONFIG_DIR/php
rm -rf $PM_TMP_DIR/php_sessions

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
log "Fixing ownership & permissions of files in $PM_LIBRARY_DIR."
/usr/bin/find $PM_LIBRARY_DIR/    \( -type f -o -type d \) -exec chown $PM_USERNAME:$PM_GROUPNAME "{}" \;
/usr/bin/find $PM_LIBRARY_DIR/    \( -type f -o -type d \) -exec chmod u=rwX,go=rX "{}" \;

SDL=`readlink $SERVICE_DATA_LINK`
if [ $SDL != $PM_LIBRARY_DIR ]; then
  log "Fixing ownership & permissions of files in $SDL. (Service Data)"
  /usr/bin/find $SERVICE_DATA_LINK/ \( -type f -o -type d \) -exec chown $PM_USERNAME:$PM_GROUPNAME "{}" \;
  /usr/bin/find $SERVICE_DATA_LINK/ \( -type f -o -type d \) -exec chmod u=rwX,go=rX "{}" \;
fi
chmod 700 $PM_IMAGES_DIR

#
# We have to have a CA cert exported to make Apache happy. If there isn't one there now, create a self-signed CA until we can get one from OD.
#
if [ ! -s $PM_CONFIG_DIR/SSLCACertificateFile.pem ]; then
  log "Creatng dummy SSL CA certificate to make apache happy"
  OPENSSL=/usr/bin/openssl
  $OPENSSL genrsa -passout pass:whocares -des3 -out $PM_TMP_DIR/root-ca.key 1024
  $OPENSSL req -new -x509 -days 3650 -key $PM_TMP_DIR/root-ca.key -out $PM_CONFIG_DIR/SSLCACertificateFile.pem -config $DEVICEMGR_CONFIG_PATH/placeholderCA.cnf
  chown $PM_USERNAME:$PM_GROUPNAME $PM_CONFIG_DIR/SSLCACertificateFile.pem
  rm -f $PM_TMP_DIR/root-ca.key
fi

# Generate a random "VersionUUID" that we use to force browsers to reload static resources that might have changed in a new version of Server
rm -f $PM_VERSION_UUID
echo -n `/usr/bin/uuidgen` > $PM_VERSION_UUID

#
# Copy newsyslog.d config file and PostgreSQL config plist
#
cp -f $SERVER_ROOT$NEWSYSLOG_D/com.apple.devicemgr.conf $NEWSYSLOG_D/com.apple.devicemgr.conf

# Create a new database or move the pre-created PostgreSQL cluster to where we want it
if [ -d $PG_DATA_DIR ]; then
  # PG_DATA_DIR (PostgreSQL) needs more restrictive permissions
  chmod -R u=rwX,go-rwx $PG_DATA_DIR                # Only _devicemgr has access in this directory
  log "A postgres cluster appers to already exist at $PG_DATA_DIR"
fi

log "Migrating PM SACL in OD..."
$DEVICEMGR_PATH/config/pmsaclupdate

# Run migration_tool to create or restore the DB cluster
log "Creating/restoring PostgreSQL cluster..."
sudo -u $PM_USERNAME $MIGRATION_PATH/migration_tool --prepCluster
status=$?
if [ $status -ne 0 ]; then
  log "migration_tool failed for prepare PostgreSQL cluster: $status"
  exit 4
fi

# Now start the special "migration" instance of postgres so we can migrate/create the main database
mkdir -p $PM_PG_SOCKET_MIGRATE_DIR
chown $PM_USERNAME:$PM_GROUPNAME $PM_PG_SOCKET_MIGRATE_DIR
$SERVERCTL enable service=com.apple.DeviceManagement.postgres.migration
# Load dm_helper and dmpgHelper before migration because migration_tool might need them
$SERVERCTL enable service=com.apple.DeviceManagement.DMHelper
$SERVERCTL enable service=com.apple.DeviceManagement.dmpgHelper

log "Preparing/migrating database..."
rm -f $PM_DATA_DIR/models                                         # This will need to be rebuilt, so delete it
sudo -u $PM_USERNAME $MIGRATION_PATH/migration_tool
status=$?
$SERVERCTL disable service=com.apple.DeviceManagement.dmpgHelper          # This might have a connection to postgres, so shut it down
$SERVERCTL disable service=com.apple.DeviceManagement.postgres.migration  # Always shutdown the "migration" postgres instance
rm -df $PM_PG_SOCKET_MIGRATE_DIR                                  # Directory should be empty, so use -d instead of -r to prevent potential disaster
if [ $status -ne 0 ]; then
  log "migration_tool failed: $status"
  exit 5
fi

# Make sure the PG backup directory exists and has appropriate permissions
mkdir -p $PG_BACKUP_DIR
chmod 700 $PG_BACKUP_DIR
chown $PM_USERNAME:$PM_GROUPNAME $PG_BACKUP_DIR

# Start the "regular" postgres instance
$SERVERCTL enable service=com.apple.DeviceManagement.postgres
$SERVERCTL enable service=com.apple.DeviceManagement.dmpgHelper

# Create a base backup right now
sudo -u $PM_USERNAME $MIGRATION_PATH/migration_tool --backup

# The above might cause PM_RAILS_LOG_FILE to be owned by root, so fix that
if [ -f $PM_RAILS_LOG_FILE ]; then
  chown $PM_USERNAME:admin $PM_RAILS_LOG_FILE
fi

# Enable devicemgrd to always be ready to run
$SERVERCTL enable service=com.apple.DeviceManagement.devicemgrd

log "Done!"
