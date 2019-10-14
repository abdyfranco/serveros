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
# "promotion" script for ServerDocs


PATH=/bin:/usr/bin:/usr/sbin

export SERVER_ROOT="/Applications/Server.app/Contents/ServerRoot"
export SERVER_LIBRARY="/Library/Server"
export SERVERCTL="$SERVER_ROOT/usr/sbin/serverctl"
export SERVERADMIN="$SERVER_ROOT/usr/sbin/serveradmin"
export PERSONAL_FOLDERS_NAME="Personal Folders.localized"
export SERVERDOCSSERVERCOMMON="$SERVER_ROOT/System/Library/PrivateFrameworks/ServerDocsServerCommon.framework"
export PERSONAL_FOLDERS_SRC="$SERVERDOCSSERVERCOMMON/Resources/$PERSONAL_FOLDERS_NAME"

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

log "Starting..."

log "Ensuring ServerDocs services are unloaded and terminated..."
# TODO: wouldn't it be better just to have servermgr stop serverdocs?  (and then later below, start serverdocs?)
$SERVERCTL disable service=com.apple.serverdocs.sdd
$SERVERCTL disable service=com.apple.serverdocs.sdhd
$SERVERCTL disable service=com.apple.serverdocs.authserver
$SERVERCTL disable service=com.apple.serverdocs.sdmd
$SERVERCTL disable service=com.apple.serverdocs.quicklook
killall -9 ServerDocsServer > /dev/null 2>&1
killall -9 sdhd > /dev/null 2>&1
killall -9 authserver > /dev/null 2>&1
killall -9 sdmd > /dev/null 2>&1

log "Get Service Data Location"

export SERVER_SERVICE_DATA_LOCATION=`"$SERVER_ROOT"/usr/libexec/serverdocsServiceDataLocation.pl`

count=0
if [ ! -d "$SERVER_SERVICE_DATA_LOCATION/$SERVER_LIBRARY" ]
then
    while [ ! -d "$SERVER_SERVICE_DATA_LOCATION/$SERVER_LIBRARY" ]
    do
        sleep 1
        if [ $count -eq 0 ]
        then
            log -n "Waiting for $SERVER_SERVICE_DATA_LOCATION/$SERVER_LIBRARY to appear..."
        elif [ $count -ge 60 ]
        then
            echo ""
            log -n "Giving up waiting for $SERVER_SERVICE_DATA_LOCATION/$SERVER_LIBRARY to appear"
            break;
        else
            echo -n "."     # Don't use log()
        fi

        count=$(( count + 1 ))
    done
    echo ""
fi

if [ -d "$SERVER_SERVICE_DATA_LOCATION/$SERVER_LIBRARY" ]
then
    log "Setting service data location to $SERVER_SERVICE_DATA_LOCATION"

    defaults write /Library/Preferences/com.apple.ServerDocs/ServerDocs.plist ServiceDataLocation "$SERVER_SERVICE_DATA_LOCATION"
else
    log "Service data directory "$SERVER_SERVICE_DATA_LOCATION/$SERVER_LIBRARY" unavailable, attempting to use default location..."

    SERVER_SERVICE_DATA_LOCATION=""

    if [ -d "$SERVER_LIBRARY" ]
    then
        log "Setting service data location to default location"

        defaults delete /Library/Preferences/com.apple.ServerDocs/ServerDocs.plist ServiceDataLocation
    else
        log "Default service data directory "$SERVER_LIBRARY" unavailable, services "
    fi
fi

if [ -d "$SERVER_SERVICE_DATA_LOCATION/$SERVER_LIBRARY" ]
then
    if [ ! -d "$SERVER_SERVICE_DATA_LOCATION/$SERVER_LIBRARY/ServerDocs" ]
    then
        log "Creating essential service data directories"

        mkdir -p "$SERVER_SERVICE_DATA_LOCATION/$SERVER_LIBRARY/ServerDocs/Data"
        mkdir -p "$SERVER_SERVICE_DATA_LOCATION/$SERVER_LIBRARY/ServerDocs/Database.xpg"
        mkdir -p "$SERVER_SERVICE_DATA_LOCATION/$SERVER_LIBRARY/ServerDocs/Database.xpg/sockets"

        chown -R _xserverdocs:_xserverdocs "$SERVER_SERVICE_DATA_LOCATION/$SERVER_LIBRARY/ServerDocs"
        chmod -R 0775 "$SERVER_SERVICE_DATA_LOCATION/$SERVER_LIBRARY/ServerDocs"
    fi
fi

if [ -d "$SERVER_SERVICE_DATA_LOCATION/$SERVER_LIBRARY" ]
then
    if [ ! -d "$SERVER_SERVICE_DATA_LOCATION/$SERVER_LIBRARY/ServerDocs/$PERSONAL_FOLDERS_NAME" ]
    then
        log "Creating Personal Folders directory"

        cp -R "$PERSONAL_FOLDERS_SRC" "$SERVER_SERVICE_DATA_LOCATION/$SERVER_LIBRARY/ServerDocs/$PERSONAL_FOLDERS_NAME"

        chown -R _xserverdocs:_xserverdocs "$SERVER_SERVICE_DATA_LOCATION/$SERVER_LIBRARY/ServerDocs/$PERSONAL_FOLDERS_NAME"
        chmod -R 0775 "$SERVER_SERVICE_DATA_LOCATION/$SERVER_LIBRARY/ServerDocs/$PERSONAL_FOLDERS_NAME"
    fi
fi

log "Create a new database if needed"

"$SERVER_ROOT"/usr/libexec/serverdocsPostgresSetup.sh
status=$?
if [ $status -ne 0 ]
then
    log "Error in setup; service will not be usable. Database creation failed: $status"
    exit 2
fi
