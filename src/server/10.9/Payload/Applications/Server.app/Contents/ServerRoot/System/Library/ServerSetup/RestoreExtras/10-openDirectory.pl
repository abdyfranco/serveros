#!/usr/bin/perl

# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#

BEGIN {
    if ( -e "/Applications/Server.app/Contents/ServerRoot/System/Library/ServerSetup/MigrationExtras/" ) {
        push @INC,"/Applications/Server.app/Contents/ServerRoot/System/Library/ServerSetup/MigrationExtras/";
    }    
    elsif ( -e "/System/Library/ServerSetup/MigrationExtras/" ) {
        push @INC,"/System/Library/ServerSetup/MigrationExtras/";
    }
    else {
        printf("Server Migration perl lib can not be found.\n");
    }
}
use MigrationUtilities;

my $mu = new MigrationUtilities;

##################   Input Parameters  #######################
# --purge <0 | 1>   "1" means remove any files from the old system after you've migrated them, "0" means leave them alone.
# --sourceRoot <path> The path to the root of the system to migrate
# --sourceType <System | TimeMachine> Gives the type of the migration source, whether it's a runnable system or a
#                  Time Machine backup.
# --sourceVersion <ver> The version number of the old system (like 10.6, 10.7, 10.8, 10.9). Since we support migration from 10.6, 10.7,
#                   10.8 and other 10.9 installs.
# --targetRoot <path> The path to the root of the new system.
# --language <lang> A language identifier, such as \"en.\" Long running scripts should return a description of what they're doing
#                   (\"Migrating Open Directory users\"), and possibly provide status update messages along the way. These messages
#                   need to be localized (which is not necessarily the server running the migration script).
#                   This argument will identify the Server Assistant language. As an alternative to doing localization yourselves
#                   send them in English, but in case the script will do this it will need this identifier.
#
# Example: /Applications/Server.app/Contents/ServerRoot/System/Library/ServerSetup/RestoreExtras/10-openDirectory.pl --purge 0 --language en --sourceType System --sourceVersion 10.6 --sourceRoot "/Library/Server/Previous" --targetRoot "/"

use File::Compare;

##################   Paths  #######################
$SERVICE_RESTORE_BINARY="/Applications/Server.app/Contents/ServerRoot/usr/libexec/server_backup/openDirectory_restore";
$SERVICE_RESTORE_LOG="/private/var/log/server_backup/openDirectory_restore.log";

$SERVER_META_DATA_BACKUP_FOLDER="/.ServerBackups";
$SERVER_META_DATA_RESTORE_FOLDER="/ServerBackups";

$LIBRARY_SERVER_PREVIOUS="/Library/Server/Previous";
$SERVER_BACKUP_ROOT="${LIBRARY_SERVER_PREVIOUS}" . "${SERVER_META_DATA_BACKUP_FOLDER}";
$SERVER_RESTORE_ROOT="${LIBRARY_SERVER_PREVIOUS}" . "${SERVER_META_DATA_RESTORE_FOLDER}";

$SERVICE_NAME="openDirectory";
$SERVICE_DATA_BACKUP_PATH="${SERVER_BACKUP_ROOT}" . "/" . "${SERVICE_NAME}";
$SERVICE_DATA_RESTORE_PATH="${SERVER_RESTORE_ROOT}" . "/" . "${SERVICE_NAME}";

$OD_ARCHIVE="/var/backups/ServerBackup_OpenDirectoryMaster.sparseimage";

# common config file paths
$MIGRATION_LOG="/Library/Logs/ServerSetup.log";
$CP="/bin/cp";
$ECHO = "/bin/echo";

#################################  GLOBALS #################################
$gPurge="0";		# Default is don't purge
$gSourceRoot="";
$gSourceType="";
$gSourceVersion="";
$gTargetRoot="";
$gLanguage="en";	# Default is english

$DEBUG = 0;
$FUNC_LOG = 0;

$SRV_MAJOR="0";  #10
$SRV_MINOR="0";  # 6
$SRV_UPDATE="-"; #00

$MINVER="10.6"; # => 10.6
$MAXVER="10.10.0"; # <  10.10.0

###################################################
##################   MAIN   #######################
###################################################

@Items=$mu->ParseOptions(@ARGV);

if (${DEBUG}) 
{ $mu->dumpAssociativeArray(@Items); }

validateOptionsAndDispatch(@Items);

###################################################
###################################################


##################   Functions   #######################
################################################################################
################################################################################
sub validateOptionsAndDispatch()
{
	%BigList = @_;
	
	#Set the globals with the options passed in.
	$gPurge=$BigList{"--purge"};
	$gSourceRoot=$BigList{"--sourceRoot"};
	$gSourceType=$BigList{"--sourceType"};
	$gSourceVersion=$BigList{"--sourceVersion"};
	$gTargetRoot=$BigList{"--targetRoot"};
	$gLanguage=$BigList{"--language"};
	
    if (${DEBUG}) {
        qx(${ECHO} purge: "${gPurge}" >> "${MIGRATION_LOG}");
        qx(${ECHO} sourceRoot: "${gSourceRoot}" >> "${MIGRATION_LOG}");
        qx(${ECHO} sourceType: "${gSourceType}" >> "${MIGRATION_LOG}");
        qx(${ECHO} sourceVersion: "${gSourceVersion}" >> "${MIGRATION_LOG}");
        qx(${ECHO} targetRoot: "${gTargetRoot}" >> "${MIGRATION_LOG}");
        qx(${ECHO} language: "${gLanguage}" >> "${MIGRATION_LOG}");
    }
    
	# Get source system version parts
	if (${DEBUG}) {printf("sourceVersion := %s\n", $gSourceVersion);}
	($SRV_MAJOR, $SRV_MINOR, $SRV_UPDATE)=$mu->serverVersionParts(${gSourceVersion});
    
SWITCH: {
	if( ($mu->pathExists("${gSourceRoot}")) && ($mu->pathExists("${gTargetRoot}")) ) {
		if ($mu->isValidLanguage($gLanguage)) {
			if ($mu->isValidVersion($gSourceVersion)) {
				$valid = 1;
				
				setAside();
			} else {
				printf("Did not supply a valid version for the --sourceVersion parameter, needs to be >= %s and < %s\n", $MINVER, $MAXVER);
				Usage(); exit(1);
			}
		} else {
			print("Did not supply a valid language for the --language parameter, needs to be one of [en|fr|de|ja]\n");
			Usage(); exit(1);
		}
	} else {
		print("Source and|or destination for upgrade/migration does not exist.\n");
		Usage(); exit(1);
	} last SWITCH;
	$nothing = 1;
}
    if($nothing eq 1)
    { print("Legal options were not supplied!\n"); Usage(); exit(1); }
}

sub setAside()
{
	if (${FUNC_LOG}) {printf("setAside := S\n");}
    
    #Check to see if the source service folder exists
    if ( -d $SERVICE_DATA_BACKUP_PATH ) {
	    if ( ! -d $SERVER_RESTORE_ROOT ) {
		    if (${DEBUG}) {
	            print("cmd 1 := " . qq(mkdir "${SERVER_RESTORE_ROOT}") . "\n");
	        	mkdir ${SERVER_RESTORE_ROOT};
	    	} else {
	        	mkdir ${SERVER_RESTORE_ROOT};
			}
		}
        
	    if (${DEBUG}) {
            print("cmd 2 := " . qq(mkdir "${SERVICE_DATA_RESTORE_PATH}") . "\n");
        	mkdir ${SERVICE_DATA_RESTORE_PATH};
    	} else {
        	mkdir ${SERVICE_DATA_RESTORE_PATH};
		}
        #Copy the backup source service folder to one that we can use later
        if (${DEBUG}) {
            print("cmd 3 := " . qq(${CP} -rpv ${SERVICE_DATA_BACKUP_PATH}/* ${SERVICE_DATA_RESTORE_PATH}) . "\n");
            qx(${CP} -rpv \"${SERVICE_DATA_BACKUP_PATH}\"/* \"${SERVICE_DATA_RESTORE_PATH}\");
        } else {
            qx(${CP} -rpv ${SERVICE_DATA_BACKUP_PATH}/* ${SERVICE_DATA_RESTORE_PATH});
        }
		#For OD we need to copy the sparse image that was restored, up into our heirarchy to use later. For 10.6.x it's part of the backup payload. For 10.7 and better it's part of the restored file system.
        if ($SRV_MINOR eq 6) {
            $OD_ARCHIVE_PATH="${SERVICE_DATA_BACKUP_PATH}/ServerBackup_OpenDirectoryMaster.sparseimage";
        }
        if ($SRV_MINOR ge 7) {
            $OD_ARCHIVE_PATH="${OD_ARCHIVE}";
        }
        
        if (${DEBUG}) {
            print("cmd 4 := " . qq(cp -rpv "${OD_ARCHIVE_PATH}" ${SERVICE_DATA_RESTORE_PATH}) . "\n");
            qx(cp -rpv "${OD_ARCHIVE_PATH}" ${SERVICE_DATA_RESTORE_PATH});
        } else {
            qx(cp -rpv "${OD_ARCHIVE_PATH}" ${SERVICE_DATA_RESTORE_PATH});
        }
		
    } else {
        print("Backup data folder for restoration does not exist.\n");
		Usage(); exit(1);
    }
	if (${FUNC_LOG}) {printf("setAside := E\n");}
}

################################################################################
# Show proper usage
sub Usage()
{
	print("--purge <0 | 1>   \"1\" means remove any files from the old system after you've migrated them, \"0\" means leave them alone." . "\n");
	print("--sourceRoot <path> The path to the root of the system to migrate" . "\n");
	print("--sourceType <System | TimeMachine> Gives the type of the migration source, whether it's a runnable system or a " . "\n");
	print("                  Time Machine backup." . "\n");
	print("--sourceVersion <ver> The version number of the old system (like 10.6, 10.7, 10.8 or 10.9). Since we support migration from 10.6, 10.7," . "\n");
	print("                  10.8 and other 10.9 installs." . "\n");
	print("--targetRoot <path> The path to the root of the new system." . "\n");
	print("--language <lang> A language identifier, such as \"en.\" Long running scripts should return a description of what they're doing " . "\n");
	print("                  (\"Migrating Open Directory users\"), and possibly provide status update messages along the way. These messages " . "\n");
	print("                  need to be localized (which is not necessarily the server running the migration script). " . "\n");
	print("                  This argument will identify the Server Assistant language. As an alternative to doing localization yourselves " . "\n");
	print("                  send them in English, but in case the script will do this it will need this identifier." . "\n");
	print(" " . "\n");
}
