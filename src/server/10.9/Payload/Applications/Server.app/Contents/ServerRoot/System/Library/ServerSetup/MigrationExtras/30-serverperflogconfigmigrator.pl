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

## Migration Script for ServerPerfLog

##################   Input Parameters  #######################
# --purge <0 | 1>   "1" means remove any files from the old system after you've migrated them, "0" means leave them alone.
# --sourceRoot <path> The path to the root of the system to migrate
# --sourceType <System | TimeMachine> Gives the type of the migration source, whether it's a runnable system or a
#                  Time Machine backup.
# --sourceVersion <ver> The version number of the old system (like 10.7 or 10.9). Since we support migration from 10.7,
#                   10.8 and other 10.9 installs.
# --targetRoot <path> The path to the root of the new system.
# --language <lang> A language identifier, such as \"en.\" Long running scripts should return a description of what they're doing
#                   (\"Migrating Open Directory users\"), and possibly provide status update messages along the way. These messages
#                   need to be localized (which is not necessarily the server running the migration script).
#                   This argument will identify the Server Assistant language. As an alternative to doing localization yourselves
#                   send them in English, but in case the script will do this it will need this identifier.
#
# Example: /Applications/Server.app/Contents/ServerRoot/System/Library/ServerSetup/MigrationExtras/30-serverperflogconfigmigrator.pl --purge 0 --language en --sourceType System --sourceVersion 10.6 --sourceRoot "/Library/Server/Previous" --targetRoot "/"

#################################   Constants  #################################
$CAT = "/bin/cat";
$CP = "/bin/cp";
$DSCL = "/usr/bin/dscl";
$DU = "/usr/bin/du";
$ECHO = "/bin/echo";
$GREP = "/usr/bin/grep";
$LAUNCHCTL = "/bin/launchctl";
$MKDIR = "/bin/mkdir";
$MV = "/bin/mv";
$PLISTBUDDY = "/usr/libexec/PlistBuddy";

#################################   PATHS  #################################
$SYSTEM_PLIST = "/System/Library/CoreServices/SystemVersion.plist";
$SERVER_PLIST = "/System/Library/CoreServices/ServerVersion.plist";
$SPL_LAUNCHD_PREFERENCES = "/System/Library/LaunchDaemons/com.apple.ServerPerfLog.plist";
$MIGRATION_LOG = "/Library/Logs/ServerSetup.log";

#10.6 stores the state of the service under launchd in the following file.
$LAUNCHD_OVERRIDES = "/private/var/db/launchd.db/com.apple.launchd/overrides.plist";

$SPL_PROMOTION_SCRIPT = "/Applications/Server.app/Contents/ServerRoot/System/Library/ServerSetup/PromotionExtras/51-ServerPerfLogAndEmond.sh";

#################################  GLOBALS #################################
$gPurge="0";		# Default is don't purge
$gSourceRoot="";
$gSourceType="";
$gSourceVersion="";
$gTargetRoot="";
$gLanguage="en";	# Default is english

$is107=0;

$DEBUG = 0;
$FUNC_LOG = 0;

$SRV_MAJOR="0";  #10
$SRV_MINOR="0";  # 7
$SRV_UPDATE="-"; #00

$MINVER="10.7"; # => 10.7
$MAXVER="10.10.0"; # <  10.10.0

$LANGUAGE = "en"; # Should be Tier-0 only in iso format [en, fr, de, ja], we default this to English, en.
$PURGE = 0;       # So we will be default copy the items if there's no option specified.
$VERSION = "";    # This is the version number of the old system passed into us by Server Assistant. [10.6.x, 10.7.x, and potentially 10.8.x]
$PREV_EXT = ".previous";

$SPL_KEY="SERVERPERFLOG";
$SPL_DISABLED="true"; #To begin with...

if($ENV{DEBUG} eq 1) {$DEBUG = '1';}
if($ENV{FUNC_LOG} eq 1) {$FUNC_LOG = '1';}

if (${DEBUG}) { print("args count := " . $#ARGV . "\n"); }  #needs to be 11!

if($#ARGV != 11) {
	Usage();
	exit(1);
}

@Items=$mu->ParseOptions(@ARGV);

if (${DEBUG}) 
	{ $mu->dumpAssociativeArray(@Items); }

validateOptionsAndDispatch(@Items);
exit();


################################################################################
##############################   Functions   ###################################
################################################################################

################################################################################
#
sub migrateUpgrade() {
    if (${FUNC_LOG}) { print("migrateUpgrade : S\n"); }
    
    ## Need to fix up the paths we care about with the --sourceRoot we received
	$OLD_SYSTEM_PLIST = "${gSourceRoot}" . "${OLD_SYSTEM_PLIST}";
	$OLD_SERVER_PLIST = "${gSourceRoot}" . "${OLD_SERVER_PLIST}";

	if (${DEBUG}) {
		print("${OLD_SYSTEM_PLIST}" . "\n");
		print("${OLD_SERVER_PLIST}" . "\n");
	}

	restoreAndSetState();
	startStopSPL();

    if (${FUNC_LOG}) { print("migrateUpgrade : E\n"); }
}

################################################################################
sub validateOptionsAndDispatch()
{
    if (${FUNC_LOG}) { print("validateOptionsAndDispatch : S\n"); }
	%BigList = @_;

	#Set the globals with the options passed in.
	$gPurge=$BigList{"--purge"};
	$gSourceVersion=$BigList{"--sourceVersion"};
	$gLanguage=$BigList{"--language"};
	$gSourceType=$BigList{"--sourceType"};
	$gSourceRoot=$BigList{"--sourceRoot"};
	$gTargetRoot=$BigList{"--targetRoot"};

	## Need to fix up the paths we care about with the --sourceRoot we received
	$OLD_SYSTEM_PLIST = "${gSourceRoot}" . "${OLD_SYSTEM_PLIST}";
	$OLD_SERVER_PLIST = "${gSourceRoot}" . "${OLD_SERVER_PLIST}";
	$OLD_SPL_LAUNCHD_PREFERENCES = "$gSourceRoot" . "${SPL_LAUNCHD_PREFERENCES}";

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

	#If our sourceRoot is not from "/Library/Server/Previous" then we will not purge the source no matter what!
	if (! ("${gSourceRoot}" =~ "/Library/Server/Previous") ) {
        printf("Overriding purge option: %s\n", ${gPurge});
		$gPurge = 0;
	}
	
    if (${DEBUG}) { 
		print("${OLD_SYSTEM_PLIST}\n");
		print("${OLD_SERVER_PLIST}\n");
		print("${OLD_SPL_LAUNCHD_PREFERENCES}\n");
	}

	SWITCH: {
		if( ($mu->pathExists("${gSourceRoot}")) && ($mu->pathExists("${gTargetRoot}")) ) {
			if ($mu->isValidLanguage($gLanguage)) {
				if ($mu->isValidVersion($gSourceVersion)) {
					$valid = 1;
					migrateUpgrade();
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
    if (${FUNC_LOG}) { print("validateOptionsAndDispatch : E\n"); }
}

################################################################################
sub restoreAndSetState()
{
	if (${FUNC_LOG}) {printf("restoreAndSetState := S\n");}
	$SPL_STATE="true"; # Is SPL disabled? true by default.
	$OLD_LAUNCHD_OVERRIDES="${gSourceRoot}${LAUNCHD_OVERRIDES}";
	if( (${SRV_MINOR} eq "7") || (${SRV_MINOR} eq "8") || (${SRV_MINOR} eq "9") ) {
		if (-e ${OLD_LAUNCHD_OVERRIDES}) {
			if (${DEBUG}) {
				print("cmd := " . qq(${PLISTBUDDY} -c \"Print :com.apple.ServerPerfLog:Disabled\" \"${OLD_LAUNCHD_OVERRIDES}\") . "\n");
			} else {
				$SPL_STATE=qx(${PLISTBUDDY} -c \"Print :com.apple.ServerPerfLog:Disabled\" \"${OLD_LAUNCHD_OVERRIDES}\"); chomp(${SPL_STATE});
				if ( ($? eq "1") || ($? eq "256") ) {
					$SPL_STATE="true"
				}
			}
		}

		#The entry could be present+enabled, or present+disabled, or just plan missing!
		if( (${SPL_STATE} eq "true") ) {
			$SPL_DISABLED = "true";
			if (${DEBUG}) { print("host disable true\n"); }
		} else {
			$SPL_DISABLED = "false";
			if (${DEBUG}) { print("host disable false\n"); }
		}
	}	

	if (${FUNC_LOG}) {printf("restoreAndSetState := E\n");}
}
			
################################################################################
sub startStopSPL()
{
	if (${FUNC_LOG}) {printf("startStopSPL := S\n");}
	
	if( (${SRV_MINOR} eq "6") || (${SRV_MINOR} eq "7") || (${SRV_MINOR} eq "8") || (${SRV_MINOR} eq "9") ) {
		# No need to start if we aren't booted from the source drive.
		if(${gTargetRoot} eq "/") {
			qx(${SPL_PROMOTION_SCRIPT});
			if (${DEBUG}) { printf("%s\n", qq($SPL_PROMOTION_SCRIPT)); }
			qx(${LAUNCHCTL} load -w "${SPL_LAUNCHD_PREFERENCES}");
			if (${DEBUG}) { printf("%s\n", qq(${LAUNCHCTL} load -w ${SPL_LAUNCHD_PREFERENCES})); }
        }
	}

	if (${FUNC_LOG}) {printf("startStopSPL := E\n");}
}
			
################################################################################
# Show proper usage
sub Usage()
{
	print("--purge <0 | 1>   \"1\" means remove any files from the old system after you've migrated them, \"0\" means leave them alone." . "\n");
	print("--sourceRoot <path> The path to the root of the system to migrate" . "\n");
	print("--sourceType <System | TimeMachine> Gives the type of the migration source, whether it's a runnable system or a " . "\n");
	print("                  Time Machine backup." . "\n");
	print("--sourceVersion <ver> The version number of the old system, 10.8." . "\n");
	print("--targetRoot <path> The path to the root of the new system." . "\n");
	print("--language <lang> A language identifier, such as \"en.\" Long running scripts should return a description of what they're doing " . "\n");
	print("                  (\"Migrating Open Directory users\"), and possibly provide status update messages along the way. These messages " . "\n");
	print("                  need to be localized (which is not necessarily the server running the migration script). " . "\n");
	print("                  This argument will identify the Server Assistant language. As an alternative to doing localization yourselves " . "\n");
	print("                  send them in English, but in case the script will do this it will need this identifier." . "\n");
	print(" " . "\n");
}
