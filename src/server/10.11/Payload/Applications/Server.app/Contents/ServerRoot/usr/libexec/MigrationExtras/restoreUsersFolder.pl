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

## Migration Script for /Users

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
# Example: /Applications/Server.app/Contents/ServerRoot/System/Library/ServerSetup/MigrationExtras/45-restoreUsersFolder.pl --purge 0 --language en --sourceType System --sourceVersion 10.6 --sourceRoot "/Library/Server/Previous" --targetRoot "/"

#################################   Constants  #################################
$CP = "/bin/cp";
$DSCL = "/usr/bin/dscl";
$ECHO = "/bin/echo";
$MV = "/bin/mv";

#################################   PATHS  #################################
$SYSTEM_PLIST = "/System/Library/CoreServices/SystemVersion.plist";
$SERVER_PLIST = "/System/Library/CoreServices/ServerVersion.plist";
$SLASH_USERS = "/Users";
$MIGRATION_LOG = "/Library/Logs/ServerSetup.log";

#################################  GLOBALS #################################
$gPurge="0";		# Default is don't purge
$gSourceRoot="";
$gSourceType="";
$gSourceVersion="";
$gTargetRoot="";
$gLanguage="en";	# Should be Tier-0 only in iso format [en, fr, de, ja], we default this to English, en.

$DEBUG = 0;
$FUNC_LOG = 0;

$SRV_MAJOR="0";  #10
$SRV_MINOR="0";  # 6
$SRV_UPDATE="-"; #00

$MINVER="10.6"; # => 10.6
$MAXVER="10.12"; # <  10.12

$LANGUAGE = "en"; 
$PURGE = 0;       # So we will be default copy the items if there's no option specified.
$PREV_EXT = ".previous";

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

##################   Functions   #######################

################################################################################
#
################################################################################
sub restoreUsersFolder() {
	if (${FUNC_LOG}) { print("restoreUsersFolder : S\n"); }

	push(@excludedPaths, "/var/empty", "99");
    
	if (${DEBUG}) {printf("gPurge := %d\n", $gPurge);}

	#Get the list of users out of the local node.
	@Records=qx($DSCL /LDAPv3/127.0.0.1 -list $SLASH_USERS 2>&1);

	#If there is no local node then bail.
	$resultCode=$?;
	if($resultCode) {
		if (${DEBUG}) {
			printf("Not an ldapmaster so there is no local node users to copy.\n");
		}
        printf("Not an ldapmaster so there is no local node users to copy.\n");
		exit(0);
	}
    @LocalRecords=qx($DSCL . -list $SLASH_USERS 2>&1);
    if (${DEBUG}) { print (@Records); }

	#Walk the list and see if the have existing source folder and are not excluded from our list of path and users.
	foreach $record (@Records) {
		chomp($record);
		@attrs=qx($DSCL /LDAPv3/127.0.0.1 -read /Users/$record 2>&1);
		foreach $attr (@attrs) {
			if ( ($attr =~ "NFSHomeDirectory") ) {
				$hd = substr(${attr}, 18);
				chomp($hd);
				$shouldSkip=0;

				#Make sure we handle the case where the user folder is empty and skip it so we don't do a bogus copy.
				if (length($hd) < 2) { # so /a would be valid but / itself would not be and neither would NULL.
					$shouldSkip=2;
				}
				#See if it is one our excluded paths.
				foreach $excludedPath (@excludedPaths) {
					if(${hd} eq ${excludedPath}) {
						$shouldSkip=1;
					}
				}

				$srcDir= "${gSourceRoot}" . "${hd}";
				$dstDir= "${gTargetRoot}" . "${hd}";

				if($mu->pathExists("${srcDir}")) {
					if ($shouldSkip eq 0) {
#						printf("!!!Here is where we would actually copy from source vol to destination vol.\n");

						#Copy operation
						if (${DEBUG}) {
							if($mu->pathExists("${dstDir}")) {
								print(qq(${MV} "${dstDir}" "${dstDir}${PREV_EXT}") . "\n");
							}
							if(${gPurge}) {
								print(qq(${MV} "${srcDir}" "${dstDir}") . "\n");
							} else {
								print(qq(${CP} -Rpv "${srcDir}" "${dstDir}") . "\n");
							}
						} else {
							if($mu->pathExists("${dstDir}")) {
								qx(${MV} "${dstDir}" "${dstDir}${PREV_EXT}");
							}
							if(${gPurge}) {
                                printf("moving user account for %s with: %s\n", "${srcDir}", "${dstDir}");
								qx($MV "${srcDir}" "${dstDir}");
							} else {
                                printf("copying user account for %s with: %s -Rpv\n", "${srcDir}", "${dstDir}");
								qx($CP -Rpv "${srcDir}" "${dstDir}");
							}
						}
					}
				} else {
					printf("srcDir := %s, does not exist.\n", ${srcDir});
				}
			}
		}
	}

	#Walk the local list and see if the have existing source folder and are not excluded from our list of path and users.
	foreach $record (@LocalRecords) {
		chomp($record);
		@attrs=qx($DSCL . -read /Users/$record 2>&1);
		foreach $attr (@attrs) {
			if ( ($attr =~ "NFSHomeDirectory") ) {
				$hd = substr(${attr}, 18);
				chomp($hd);
				$shouldSkip=0;

				#Make sure we handle the case where the user folder is empty and skip it so we don't do a bogus copy.
				if ((length($hd) < 2) || ($record =~ /^_/) || ($record =~ "daemon")) { # so /a would be valid but / itself would not be and neither would NULL.
#				    print("SKIP ${record}" . "\n");
					$shouldSkip=2;
				}
				#See if it is one our excluded paths.
				foreach $excludedPath (@excludedPaths) {
					if(${hd} eq ${excludedPath}) {
						$shouldSkip=1;
					}
				}

				$srcDir= "${gSourceRoot}" . "${hd}";
				$dstDir= "${gTargetRoot}" . "${hd}";

				if($mu->pathExists("${srcDir}")) {
					if ($shouldSkip eq 0) {
#						printf("!!!Here is where we would actually copy from source vol to destination vol.\n");

						#Copy operation
						if (${DEBUG}) {
							if($mu->pathExists("${dstDir}")) {
								print(qq(${MV} "${dstDir}" "${dstDir}${PREV_EXT}") . "\n");
							}
							if(${gPurge}) {
								print(qq(${MV} "${srcDir}" "${dstDir}") . "\n");
							} else {
								print(qq(${CP} -Rpv "${srcDir}" "${dstDir}") . "\n");
							}
						} else {
							if($mu->pathExists("${dstDir}")) {
								qx(${MV} "${dstDir}" "${dstDir}${PREV_EXT}");
							}
							if(${gPurge}) {
                                printf("moving user account for LocalRecord, %s with: %s\n", "${srcDir}", "${dstDir}");
								qx($MV "${srcDir}" "${dstDir}");
							} else {
                                printf("copying user account for LocalRecord, %s with: %s -Rpv \n", "${srcDir}", "${dstDir}");
								qx($CP -Rpv "${srcDir}" "${dstDir}");
							}
						}
					}
				} else {
					printf("srcDir := %s, does not exist.\n", ${srcDir});
				}
			}
		}
	}

	if (${FUNC_LOG}) { print("restoreUsersFolder : E\n"); }
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
	$OLD_SYSTEM_PLIST =  "$gSourceRoot" . "${SYSTEM_PLIST}";
	$OLD_SERVER_PLIST =  "$gSourceRoot" . "${SERVER_PLIST}";

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
#	serverVersionParts($gSourceVersion);
	($SRV_MAJOR, $SRV_MINOR, $SRV_UPDATE)=$mu->serverVersionParts(${gSourceVersion});

	#If our sourceRoot is not from "/Library/Server/Previous" then we will not purge the source no matter what!
	if (! ("${gSourceRoot}" =~ "/Library/Server/Previous") ) {
        printf("Overriding purge option: %s\n", ${gPurge});
		$gPurge = 0;
	}
	
    ## Need to fix up the paths we care about with the --sourceRoot we received
	$SRC_SLASH_USERS = "${gSourceRoot}" . "${SLASH_USERS}";
	$DST_SLASH_USERS = "${gTargetRoot}" . "${SLASH_USERS}";
    if (${DEBUG}) { 
		print("${OLD_SYSTEM_PLIST}\n");
		print("${OLD_SERVER_PLIST}\n");
		print("${SRC_SLASH_USERS}\n");
		print("${DST_SLASH_USERS}\n");
	}

	SWITCH: {
		if( ($mu->pathExists("${gSourceRoot}")) && ($mu->pathExists("${gTargetRoot}")) ) {
			if ($mu->isValidLanguage($gLanguage)) {
				if ($mu->isValidVersion($gSourceVersion)) {
					$valid = 1;
					restoreUsersFolder();
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
