#!/bin/bash
#-------------------------------------------------------------------------
# Copyright (c) 2018 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

echo -n `basename "$0"`; echo " $1 $2 $3"
if [ "$1" == "restore" ]; then
  shift
  if [ -e "../backup/$2" ]; then
    if [ -n "$2" ]; then
      EXT=`echo $2 | /usr/bin/sed -E 's/^.*\.([^.]+)$/\1/'`
      if [ "$EXT" != 'gz' ]; then
        # If the file isn't compressed, just copy it over
        /bin/cp ../backup/$2 $1
        ERR=$?
        if [ $ERR -ne 0 ]; then
          echo "Failed to restore file $1 ($ERR)"
        fi
        exit $ERR
      else
        # Compress the WAL file we're archiving to save a lot of space
        /usr/bin/gunzip < ../backup/$2.gz > $1
        ERR=$?
        if [ $ERR -ne 0 ]; then
          echo "Failed to restore WAL file $1 ($ERR)"
        fi
        exit $ERR
      fi
    else
      echo "WAL file name is empty!"
      exit 2
    fi
  else
    echo "Archive file '$1' not found"
    exit 1
  fi
else
  if [ -e "$1" ]; then
    if [ -n "$2" ]; then
      EXT=`echo $2 | /usr/bin/sed -E 's/^.*\.([^.]+)$/\1/'`
      if [ "$EXT" = 'backup' ]; then
        # We don't want to compress the ".backup" file. It's plaintext and small and convenient to be able to read directly.
        /bin/cp $1 ../backup/$2
        ERR=$?
        if [ $ERR -ne 0 ]; then
          echo "Failed to archive file $1 ($ERR)"
        fi
        exit $ERR
      else
        # Compress the WAL file we're archiving to save a lot of space
        /usr/bin/gzip < $1 > ../backup/$2.gz
        ERR=$?
        if [ $ERR -eq 0 ]; then
          # On success, remove the corresponding partial WAL archive file
          /bin/rm -f ../backup/$2.partial
        else
          echo "Failed to archive WAL file $1 ($ERR)"
        fi
        exit $ERR
      fi
    else
      echo "WAL file name is empty!"
      exit 2
    fi
  else
    echo "WAL source file '$1' is missing!"
    exit 1
  fi
fi