#!/usr/bin/python

# Copyright (c) 2014-2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#

import os, sys, shutil, distutils.core
from optparse import OptionParser

DEBUG=0;

def usage():
    print '--purge <0 | 1>   \"1\" means remove any files from the old system after you\'ve migrated them, \"0\" means leave them alone.'
    print '--sourceRoot <path> The path to the root of the system to migrate'
    print '--sourceType <System | TimeMachine> Gives the type of the migration source, whether it\'s a runnable system or a '
    print '                  Time Machine backup.'
    print '--sourceVersion <ver> The version number of the old system (like 10.6.8 - 10.10). Since we support migration from 10.6.8,'
    print '                  through 10.10 installs.'
    print '--targetRoot <path> The path to the root of the new system.'
    print '--language <lang> A language identifier, such as \"en.\" Long running scripts should return a description of what they\'re doing '
    print '                  (\"Migrating Open Directory users\"), and possibly provide status update messages along the way. These messages '
    print '                  need to be localized (which is not necessarily the server running the migration script). '
    print '                  This argument will identify the current server language. As an alternative to doing localization yourselves '
    print '                  send them in English, but in case the script will do this it will need this identifier.'
    print ''

def main(argv):
    if DEBUG:
        print 'ARGV      :', sys.argv[1:]
        print 'argv count := %s' % len(argv)
    description = "OpenDirectory Restore Extra"
    version = "%prog v10.10"
    parser = OptionParser(description=description, version=version)

    SERVICE_NAME="openDirectory";
    MINVER="10.6"
    MAXVER="10.10.0"

    SERVICE_RESTORE_BINARY="/Applications/Server.app/Contents/ServerRoot/usr/libexec/server_backup/openDirectory_restore"
    SERVICE_RESTORE_LOG="/private/var/log/server_backup/openDirectory_restore.log"
    SERVER_META_DATA_BACKUP_FOLDER="/.ServerBackups"
    SERVER_META_DATA_RESTORE_FOLDER="/ServerBackups"
    LIBRARY_SERVER_PREVIOUS="/Library/Server/Previous"
    SERVER_BACKUP_ROOT=LIBRARY_SERVER_PREVIOUS + SERVER_META_DATA_BACKUP_FOLDER
    SERVER_RESTORE_ROOT=LIBRARY_SERVER_PREVIOUS + SERVER_META_DATA_RESTORE_FOLDER
    SERVICE_DATA_BACKUP_PATH=SERVER_BACKUP_ROOT + "/" + SERVICE_NAME
    SERVICE_DATA_RESTORE_PATH=SERVER_RESTORE_ROOT + "/" + SERVICE_NAME
    OD_ARCHIVE="/var/backups/ServerBackup_OpenDirectoryMaster.sparseimage"

    purge = ''
    sourceRoot = ''
    sourceVersion = ''
    targetRoot = ''
    language = ''

    parser.add_option('--purge',         help="To purge or not.",                  dest="purge",         action="store", type="string", default="0")
    parser.add_option('--sourceRoot',    help="Path to the source volume.",        dest="sourceRoot",    action="store", type="string")
    parser.add_option('--sourceType',    help="Option are: System or TimeMachine", dest="sourceType",    action="store", type="string")
    parser.add_option('--sourceVersion', help="OS Version of source disk.",        dest="sourceVersion", action="store", type="string")
    parser.add_option('--targetRoot',    help="Where we are migrating to.",        dest="targetRoot",    action="store", type="string")
    parser.add_option('--language',      help="Language to use.",                  dest="language",      action="store", type="string", default="en")

    (options, args) = parser.parse_args()
    if len(argv) != 12:
        usage()
        parser.error("incorrect number of arguments")

    if os.path.exists(SERVICE_DATA_BACKUP_PATH):
        if not os.path.exists(SERVER_RESTORE_ROOT):
            os.makedirs(SERVER_RESTORE_ROOT)
        if not os.path.exists(SERVICE_DATA_RESTORE_PATH):
            os.makedirs(SERVICE_DATA_RESTORE_PATH)
        distutils.dir_util.copy_tree(SERVICE_DATA_BACKUP_PATH, SERVICE_DATA_RESTORE_PATH)

    SRV_PARTS=options.sourceVersion.split('.')
    SRV_MAJOR=SRV_PARTS[0]
    SRV_MINOR=SRV_PARTS[1]
    if len(SRV_PARTS) > 2:
        SRV_UPDATE=SRV_PARTS[2]

    if ((SRV_MINOR == 6) or (SRV_MINOR == 7)):
        if (SRV_MINOR == 6):
            OD_ARCHIVE_PATH=SERVICE_DATA_BACKUP_PATH + "/ServerBackup_OpenDirectoryMaster.sparseimage"
        if (SRV_MINOR == 7):
            OD_ARCHIVE_PATH=OD_ARCHIVE
        distutils.dir_util.copy_tree(OD_ARCHIVE_PATH, SERVICE_DATA_RESTORE_PATH)

    if DEBUG:
        print 'purge file is := %s' % options.purge
        print 'sourceRoot file is := %s' % options.sourceRoot
        print 'sourceType file is := %s' % options.sourceType
        print 'sourceVersion file is := %s' % options.sourceVersion
        print 'targetRoot file is := %s' % options.targetRoot
        print 'language file is := %s' % options.language

if __name__ == "__main__":
    main(sys.argv[1:])