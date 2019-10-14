#!/bin/bash
#-------------------------------------------------------------------------
# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------
#
# "Migration" script for Profile Manager

PATH=/bin:/sbin:/usr/bin:/usr/sbin

SERVER_ROOT="/Applications/Server.app/Contents/ServerRoot"
DEVICEMGR_PATH="$SERVER_ROOT/usr/share/devicemgr"

source $DEVICEMGR_PATH/config/common.sh       # Loads all our path definitions and some other common variables

LAUNCHD_OVERRIDES=/private/var/db/launchd.db/com.apple.launchd/overrides.plist

log "starting..."

while [ $# -ge 1 ]; do
    case $1 in
        --sourceRoot) shift; SRCROOT=$1 ;;
        --targetRoot) shift; TARGETROOT=$1 ;;
        --purge) shift; PURGE=$1 ;;
        --sourceVersion) shift; SRCVERSION=$1 ;;
        --sourceType) shift; SRCTYPE=$1 ;;
        --language) shift; LANGUAGE=$1 ;;
    esac
    shift
done

# Ensure the minimum set of parameters are passed.
no_src="missing required option: --sourceRoot"
x=${SRCROOT:?$no_src}

no_tgt="missing required option: --targetRoot"
x=${TARGETROOT:?$no_tgt}

#
# Now look at OS version. Exit if it's not 10.7
#
case $SRCVERSION in
10.7*) ;;
*)
    exit 0
;;
esac

src="${SRCROOT}/Library/Server/ProfileManager"   # Not PM_LIBRARY_DIR, because PM_LIBRARY_DIR could change but this can't
dst="${TARGETROOT}${PM_LIBRARY_DIR}"

if [ -d "$src/Data" ]; then
  # All we need is the FileStore directory from the old install
  mkdir -p "$dst"
  cp -fR "$src/Data" "$dst"
  if [ $? -ne 0 ]; then
    log "Failed to copy '$src/Data' to '$dst'"
    exit 2
  fi

  if [ -n "$PURGE" ]; then
    if [ $PURGE -eq 1 ]; then
      log "Deleting old data at '$src'"
      rm -rf "$src"
      if [ $? -ne 0 ]; then
        log "Failed to delete old data at '$src'"
      fi
    fi
  fi
else
  log "No data found to migrate at '$src'. Nothing to do."
fi

# if [ -f "${SRCROOT}${LAUNCHD_OVERRIDES}" ]; then
#   launchdOverridesDisabled=`/usr/libexec/PlistBuddy -c "print :com.apple.devicemanager:Disabled" "${SRCROOT}${LAUNCHD_OVERRIDES}"`
#   if [ "$launchdOverridesDisabled" == "false" ]; then
#     log "devicemanager enabled in ${SRCROOT}${LAUNCHD_OVERRIDES}; explicitly starting"
#       $SERVER_ROOT/System/Library/ServerSetup/CommonExtras/80-devicemgrcommon.sh
#       if [ $? -eq 0 ]; then
#         $SERVERADMIN start devicemgr
#       else
#         log "80-devicemgrcommon.sh failed ($?)"
#       fi
#   fi
# fi

exit 0
