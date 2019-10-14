#!/usr/bin/perl

# Copyright (c) 2013-2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#

BEGIN {
    if ( -e "/Applications/Server.app/Contents/ServerRoot/usr/libexec/MigrationExtras/" ) {
        push @INC,"/Applications/Server.app/Contents/ServerRoot/usr/libexec/MigrationExtras/";
    }
    else {
        printf("Server Migration perl lib can not be found.\n");
    }
}
use MigrationUtilities;

my $mu = new MigrationUtilities;

## Migration Script for Application Level Firewall
## This will disable the Application Level Firewall kernel extension during upgrade if the firewall was disabled in the previous install.

##################   Input Parameters  #######################
# --purge <0 | 1>   "1" means remove any files from the old system after you've migrated them, "0" means leave them alone.
# --sourceRoot <path> The path to the root of the system to migrate
# --sourceType <System | TimeMachine> Gives the type of the migration source, whether it's a runnable system or a
#                  Time Machine backup.
# --sourceVersion <ver> The version number of the old system (like 10.6 or 10.7). Since we support migration from 10.6, 10.7,
#                   and other 10.8 installs.
# --targetRoot <path> The path to the root of the new system.
# --language <lang> A language identifier, such as \"en.\" Long running scripts should return a description of what they're doing
#                   (\"Migrating Open Directory users\"), and possibly provide status update messages along the way. These messages
#                   need to be localized (which is not necessarily the server running the migration script).
#                   This argument will identify the Server Assistant language. As an alternative to doing localization yourselves
#                   send them in English, but in case the script will do this it will need this identifier.
#
#
# Example: /Applications/Server.app/Contents/ServerRoot/System/Library/ServerSetup/MigrationExtras/111-alfconfigmigrator.pl --purge 0 --language en --sourceType System --sourceVersion 10.6 --sourceRoot "/Library/Server/Previous" --targetRoot "/"

#################################   Constants  #################################
$ECHO = "/bin/echo";
$PLISTBUDDY = "/usr/libexec/PlistBuddy";

#################################   PATHS  #################################
$SYSTEM_PLIST = "/System/Library/CoreServices/SystemVersion.plist";
$SERVER_PLIST = "/System/Library/CoreServices/ServerVersion.plist";

$ALF_PREFERENCES = "/Library/Preferences/com.apple.alf.plist";
$MIGRATION_LOG = "/Library/Logs/ServerSetup.log";

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
$isMigration = "0";	#To begin with

$LANGUAGE = "en"; # Should be Tier-0 only in iso format [en, fr, de, ja], we default this to English, en.
$PURGE = 0;       # So we will be default copy the items if there's no option specified.
$VERSION = "";    # This is the version number of the old system passed into us by Server Assistant. [10.6.x, 10.7.x, and potentially 10.8.x]
$PREV_EXT = ".previous";

if($ENV{DEBUG} eq 1) {$DEBUG = '1';}
if($ENV{FUNC_LOG} eq 1) {$FUNC_LOG = '1';}

if (${DEBUG}) { print("args count := " . $#ARGV . "\n"); }  #needs to be 11!

if($#ARGV != 11) {
	Usage();
	exit(1);
}

@Items=$mu->ParseOptions(@ARGV);

validateOptionsAndDispatch(@Items);
exit();


##################   Functions   #######################

################################################################################
#  This is the main routine to get the old state and disable the kext if alf was disabled.
# for 10.8 we need to remove our disabling of the kext iff we added it in last time we migrated.
################################################################################
sub SetupALF() {
    if (${FUNC_LOG}) { print("SetupALF : S\n"); }
    
	#Get the alf state != 0 means it's enabled.
	$ALF_STATE=qx(${PLISTBUDDY} -c \"Print :globalstate\" \"${OLD_ALF_PREFERENCES}\");
	chomp(${ALF_STATE});

	if (${DEBUG}) {
		printf("cmd := %s\n", qq(${PLISTBUDDY} -c \"Print :globalstate\" \"${OLD_ALF_PREFERENCES}\"));
		printf("ALF_STATE := %s\n", ${ALF_STATE});
	}

	#if the state of the app firewall was disabled then we want to disable the kext.
	if("${ALF_STATE}" eq "0") {
		# need to get the user/group of ${ALF_PREFERENCES} ref pg 801 Programming perl 3rd ed.
		my $prefUID = (stat(${ALF_PREFERENCES}))[4];	# we expect this to be 0
		my $prefGID = (stat(${ALF_PREFERENCES}))[5];	# we expect this to be 80
		
		
		qx(${PLISTBUDDY} -c \"Delete :firewallunload\" \"${ALF_PREFERENCES}\");
        qx(${PLISTBUDDY} -c \"Add :firewallunload integer 0\" \"${ALF_PREFERENCES}\");
		if(${DEBUG}) {
            printf("cmd := %s\n", qq(${PLISTBUDDY} -c "Delete :firewallunload" ${ALF_PREFERENCES}));
            printf("cmd := %s\n", qq(${PLISTBUDDY} -c "Add :firewallunload integer 0" ${ALF_PREFERENCES}));
		}
		# need to restore the user/group of ${ALF_PREFERENCES}
		chown($prefUID, $prefGID, ${ALF_PREFERENCES});
	} else {
        printf("ALF was enabled, no action taken");
    }

    if (${FUNC_LOG}) { print("SetupALF : E\n"); }
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

	# looking to see if dest is "local" vol or remote
	$volume_tag = substr( "${gSourceRoot}", 0, 8 );
	if ( ($volume_tag eq "/Volumes") ) {
		$isMigration = "1";

		#If our sourceRoot is from "/Volumes" then we will not purge the source no matter what!
        printf("Overriding purge option: %s\n", ${gPurge});
		$gPurge = 0;
	}

	if( $isMigration eq "1" ) {
		$OLD_ALF_PREFERENCES = "${gSourceRoot}${ALF_PREFERENCES}";  #/Volumes/xxx/Library/Preferences/com.apple.alf.plist
	} else {
		$OLD_ALF_PREFERENCES = "${ALF_PREFERENCES}";				#/Library/Preferences/com.apple.alf.plist
	}
	if (${DEBUG}) { printf("OLD_ALF_PREFERENCES := %s\n", "${OLD_ALF_PREFERENCES}"); }

	SWITCH: {
		if( ($mu->pathExists("${gSourceRoot}")) && ($mu->pathExists("${gTargetRoot}")) ) {
			if ($mu->isValidLanguage($gLanguage)) {
				if ($mu->isValidVersion($gSourceVersion)) {
					$valid = 1;
					SetupALF();
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
# Show proper usage
sub Usage()
{
	print("--purge <0 | 1>   \"1\" means remove any files from the old system after you've migrated them, \"0\" means leave them alone." . "\n");
	print("--sourceRoot <path> The path to the root of the system to migrate" . "\n");
	print("--sourceType <System | TimeMachine> Gives the type of the migration source, whether it's a runnable system or a " . "\n");
	print("                  Time Machine backup." . "\n");
	print("--sourceVersion <ver> The version number of the old system (like 10.6 or 10.7). Since we support migration from 10.6, 10.7," . "\n");
	print("                  and other 10.8 installs." . "\n");
	print("--targetRoot <path> The path to the root of the new system." . "\n");
	print("--language <lang> A language identifier, such as \"en.\" Long running scripts should return a description of what they're doing " . "\n");
	print("                  (\"Migrating Open Directory users\"), and possibly provide status update messages along the way. These messages " . "\n");
	print("                  need to be localized (which is not necessarily the server running the migration script). " . "\n");
	print("                  This argument will identify the Server Assistant language. As an alternative to doing localization yourselves " . "\n");
	print("                  send them in English, but in case the script will do this it will need this identifier." . "\n");
	print(" " . "\n");
}
