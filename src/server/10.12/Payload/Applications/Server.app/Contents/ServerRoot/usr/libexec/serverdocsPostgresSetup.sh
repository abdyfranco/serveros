#!/bin/bash
#
#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------
#
# configure PostgreSQL

PATH=/bin:/usr/bin:/usr/sbin
SERVER_ROOT="/Applications/Server.app/Contents/ServerRoot"
SERVICE_DATA_LOCATION="/"
if defaults read /Library/Preferences/com.apple.ServerDocs/ServerDocs.plist ServiceDataLocation
then
  SERVICE_DATA_LOCATION=`/usr/libexec/PlistBuddy -c "Print ServiceDataLocation" /Library/Preferences/com.apple.ServerDocs/ServerDocs.plist`
fi
SERVER_LIBRARY="$SERVICE_DATA_LOCATION/Library/Server"
SERVERDOCS_LIBRARY_DIR="$SERVER_LIBRARY/ServerDocs"
SERVERDOCS_CONFIG_DIR="$SERVER_ROOT/System/Library/PrivateFrameworks/ServerDocsServerCommon.framework/Resources"
SERVERDOCS_DEFAULTS="$SERVER_ROOT/usr/share/serverdocs"
SERVERDOCS_CONFIG_FILE="$SERVERDOCS_CONFIG_DIR/ServerDocsConfig.plist"
PG_LOG_FILE="ServerDocsPostgres.log"

INITDB="$SERVER_ROOT/usr/bin/initdb"
CREATEDB="$SERVER_ROOT/usr/bin/createdb"
XPG_CTL="$SERVER_ROOT/usr/bin/xpg_ctl"
PG_SANITY_CMD="$SERVER_ROOT/usr/bin/pg_controldata"
PG_DONOTBACKUP_FILE="$SERVERDOCS_LIBRARY_DIR/Database.xpg/cluster.pg/.DoNotBackup"

if [ -n "$0" ]
then
    if [[ $0 != -* ]]
    then
        BASENAME=`basename $0`
    else
        BASENAME="$0"
    fi
else
    BASENAME="UNKNOWN_SCRIPT"
fi

function log()
{
    echo -n `/bin/date -j +"%F %T"`
    if [ "$1" = "-n" ]
    then
        echo -n " $BASENAME: $2"
    else
        echo " $BASENAME: $1"
    fi
}
function wait_for_file_or_exit()
{
    TRIES=5
    while [[ TRIES -gt 0 ]]; do
        if [ -f $1 ]; then
            return
        else
            log "Waiting for $SERVERDOCS_CONFIG_FILE"
            sleep 1
            let TRIES-=1
        fi
    done
    log "Timed out waiting for $SERVERDOCS_CONFIG_FILE"
    exit 1
}
wait_for_file_or_exit "$SERVERDOCS_CONFIG_FILE"

# To do: Rewrite in an ObjC-bridged scripting language to avoid using semi-deprecated PlistBuddy
# Note that defaults read cannot access nested keys.
PG_SOCKET_DIR=$(/usr/libexec/PlistBuddy -c "Print DatabaseConnectionInfo:host" "$SERVERDOCS_CONFIG_FILE")
PG_DATABASE_NAME=$(/usr/libexec/PlistBuddy -c "Print DatabaseConnectionInfo:dbname" "$SERVERDOCS_CONFIG_FILE")
PG_USER_NAME=$(/usr/libexec/PlistBuddy -c "Print DatabaseConnectionInfo:user" "$SERVERDOCS_CONFIG_FILE")
PG_DATA_DIR="$SERVICE_DATA_LOCATION/"$(/usr/libexec/PlistBuddy -c "Print DatabaseClusterDirectory" "$SERVERDOCS_CONFIG_FILE")
PG_LOG_DIR=$(/usr/libexec/PlistBuddy -c "Print DatabaseOptions:log_directory" "$SERVERDOCS_CONFIG_FILE")

if [ -z "$PG_USER_NAME" -o -z "$PG_DATA_DIR" -o -z "$PG_SOCKET_DIR" -o -z "$PG_LOG_DIR" ]
then
    log "Required variables are not configured"
    exit 98
fi
if [ -z "$PG_DATABASE_NAME" ]
then
    PG_DATABASE_NAME="serverdocs"
fi

PG_BACKUP_COMPLETE_FILE="$(dirname $PG_DATA_DIR)/backup/base_backup/base_complete.tar.gz"

if [ ! -d "$PG_LOG_DIR" ]
then
    mkdir -m 0775 -p "$PG_LOG_DIR"
    chown $PG_USER_NAME "$PG_LOG_DIR"
    ls -la "$PG_LOG_DIR"
fi
log "Starting" >> "$PG_LOG_DIR/$PG_LOG_FILE"
chown $PG_USER_NAME "$PG_LOG_DIR/$PG_LOG_FILE"
chmod u=rwX,go-rwx "$PG_LOG_DIR/$PG_LOG_FILE"

#
if [ ! -d "$PG_DATA_DIR" ]
then
    if [ ! -f "$PG_BACKUP_COMPLETE_FILE" ]
    then
        # No database, so we have to create it ourselves
        log "Creating new postgres cluster..."

        sudo -u $PG_USER_NAME "$INITDB" --encoding UTF8 --locale=C -D "$PG_DATA_DIR" > "$PG_LOG_DIR/$PG_LOG_FILE" 2>&1
        status=$?
        if [ $status -ne 0 ]
        then
            log "initdb failed: $status; continuing"
        fi

        # PG_DATA_DIR (PostgreSQL) needs more restrictive permissions
        chown -R $PG_USER_NAME "$PG_DATA_DIR"
        chmod -R u=rwX,go-rwx "$PG_DATA_DIR"

        if [ ! -e "$PG_SOCKET_DIR" ]
        then
            ( umask 022 ; mkdir -p "$PG_SOCKET_DIR" )
            chown -R $PG_USER_NAME "$PG_SOCKET_DIR"
            chmod -R u=rwX,go-rwx "$PG_SOCKET_DIR"
        fi
    else
        log "No postgres cluster exists, but a postgres backup appears to exist at $PG_BACKUP_COMPLETE_FILE."
    fi
else
    log "A postgres cluster appears to already exist at $PG_DATA_DIR"
fi

sudo -u $PG_USER_NAME $PG_SANITY_CMD "$PG_DATA_DIR" > /dev/null 2>&1
if [ $? -eq 0 ]
then
    log "$PG_DATA_DIR looks like a valid DB cluster"
else
    if [ -f "$PG_BACKUP_COMPLETE_FILE" ]
    then
        log "$PG_BACKUP_COMPLETE_FILE is a backup which should get automatically restored by Postgres at start."
    else
        log "Error: $PG_DATA_DIR does not look like a valid DB cluster, and there is no $PG_BACKUP_COMPLETE_FILE file."
        exit 4
    fi
fi
/usr/bin/touch "$PG_DONOTBACKUP_FILE" 2>/dev/null

sudo -u $PG_USER_NAME "$XPG_CTL" -w -t 86400 -D "$PG_DATA_DIR" -l "$PG_LOG_DIR/$PG_LOG_FILE" -o "-k \"$PG_SOCKET_DIR\" -c listen_addresses= -c log_directory=$PG_LOG_DIR" start > "$PG_LOG_DIR/$PG_LOG_FILE" 2>&1
status=$?
if [ ! $status -eq 0 ]
then
    /bin/rm "$PG_DONOTBACKUP_FILE" 2>/dev/null
    log "Failed to start postgres with xpg_ctl; status=$status"
    exit 5
fi
log "Started postgres."

log "Creating database $PG_DATABASE_NAME..."
sudo -u $PG_USER_NAME "$CREATEDB" -U "$PG_USER_NAME" -h "$PG_SOCKET_DIR" "$PG_DATABASE_NAME" "$PG_DATA_DIR" > "$PG_LOG_DIR/$PG_LOG_FILE" 2>&1
status=$?
if [ ! $status -eq 0 ]
then
    log "Failed to create database $PG_DATABASE_NAME (it might already exist) creatdb returned status=$status; continuing"
fi

log "Stopping postgres"
sudo -u $PG_USER_NAME "$XPG_CTL" -w -t 60 -D "$PG_DATA_DIR" stop > "$PG_LOG_DIR/$PG_LOG_FILE" 2>&1
status=$?
if [ ! $status -eq 0 ]
then
    log "Failed to stop postgres with xpg_ctl; status=$status. Continuing."
fi

/bin/rm "$PG_DONOTBACKUP_FILE" 2>/dev/null
log "Succeeded"
exit 0

