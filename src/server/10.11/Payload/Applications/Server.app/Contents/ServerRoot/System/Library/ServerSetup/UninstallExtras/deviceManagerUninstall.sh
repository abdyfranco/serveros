#!/bin/bash
#-------------------------------------------------------------------------
# Copyright (c) 2016 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------
#
# "Demotion" script for Profile Manager

PATH=/bin:/usr/bin:/usr/sbin


# I'm somewhere in the Trash right now, most likely, so the normal SERVER_ROOT path is no good and common.sh might not even exist anymore

MY_SHELL_FILE=`basename $0`

function log()
{
  echo -n `/bin/date -j +"%F %T"`
  if [ "$1" = "-n" ]; then
    echo -n " $MY_SHELL_FILE: $2"
  else
    echo " $MY_SHELL_FILE: $1"
  fi
}

log "Starting..."

if [ -d /Library/Server/ProfileManager ]; then
  log "Noting that we have been demoted..."
  touch /Library/Server/ProfileManager/.demoted
fi

# Make sure all processes owned by us are terminated
count=0
while :
do
  PROCS=`ps aux | grep _devicemgr | grep -E "(postgres:|Server\.app)"`  # Only the processes that are really ours
  NUM_PROCS=$(( `echo $PROCS | wc -l` - 1 ))                            # There will be one line at the end
  if [ $NUM_PROCS -gt 1 ]; then
    log "Found $NUM_PROCS stray processes owned by _devicemgr:\n$PROCS"
    log "Terminating stray processes...."
    killall -u _devicemgr
    count=$(( count + 1 ))
    sleep 1
    if [ $count -gt 15 ]; then
      log "Failed to terminate all stray _devicemgr processes! Giving up."
      break;
    fi
  else
    break;
  fi
done

NEWSYSLOG_D="/private/etc/newsyslog.d"

# Remove the newsyslog.d config file
if [ -f $NEWSYSLOG_D/com.apple.devicemgr.conf ]; then
  rm -f $NEWSYSLOG_D/com.apple.devicemgr.conf
fi

# Remove the link at /var/log/devicemgr
if [ -L /var/log/devicemgr ]; then
  rm -f /var/log/devicemgr
fi

# Delete the VPP data
OLD_PWD=`pwd`
DMTOOL_PWD="../../../../usr/share/devicemgr/backend/lib"
cd $DMTOOL_PWD
./dm_tool unconfigureVPP 2> /dev/null
if [[ $? != 0 ]]; then
  log "Failed to delete VPP data"
fi
cd $OLD_PWD

log "Done!"
