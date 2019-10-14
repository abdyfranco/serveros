#!/bin/bash

# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#

##
# This script's purpose is to remove the
#    .ServerBackups folders since all the RestoreExtras will have run.
##

##################   Paths  #######################
SERVER_META_DATA_BACKUP_FOLDER="/.ServerBackups";
LIBRARY_SERVER_PREVIOUS="/Library/Server/Previous/.ServerBackups";
LOG_PATH="/Library/Logs/ServerSetup.log";

if [ -d "${SERVER_META_DATA_BACKUP_FOLDER}" ]; then
    echo "Commencing deletion of ${SERVER_META_DATA_BACKUP_FOLDER} ..."
    rm -rf "${SERVER_META_DATA_BACKUP_FOLDER}"
    echo "Done deleting ${SERVER_META_DATA_BACKUP_FOLDER}"
fi

if [ -d "${LIBRARY_SERVER_PREVIOUS}" ]; then
    echo "Commencing deletion of ${LIBRARY_SERVER_PREVIOUS} ..."
    rm -rf "${LIBRARY_SERVER_PREVIOUS}"
    echo "Done deleting ${LIBRARY_SERVER_PREVIOUS}"
fi

