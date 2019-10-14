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

## Migration Script for FTP

##################   Input Parameters  #######################
# --purge <0 | 1>   "1" means remove any files from the old system after you've migrated them, "0" means leave them alone.
# --sourceRoot <path> The path to the root of the system to migrate
# --sourceType <System | TimeMachine> Gives the type of the migration source, whether it's a runnable system or a
#                  Time Machine backup.
# --sourceVersion <ver> The version number of the old system (like 10.6 or 10.9). Since we support migration from 10.6, 10.7,
#                   10.8 and other 10.9 installs.
# --targetRoot <path> The path to the root of the new system.
# --language <lang> A language identifier, such as \"en.\" Long running scripts should return a description of what they're doing
#                   (\"Migrating Open Directory users\"), and possibly provide status update messages along the way. These messages
#                   need to be localized (which is not necessarily the server running the migration script).
#                   This argument will identify the Server Assistant language. As an alternative to doing localization yourselves
#                   send them in English, but in case the script will do this it will need this identifier.
#
# Example: /Applications/Server.app/Contents/ServerRoot/System/Library/ServerSetup/MigrationExtras/30-ftpconfigmigrator.pl --purge 0 --language en --sourceType System --sourceVersion 10.6 --sourceRoot "/Library/Server/Previous" --targetRoot "/"

#################################   Constants  #################################
$CAT = "/bin/cat";
$CP = "/bin/cp";
$DSCL = "/usr/bin/dscl";
$DU = "/usr/bin/du";
$ECHO = "/bin/echo";
$GREP = "/usr/bin/grep";
$SERVERCTL = "/Applications/Server.app/Contents/ServerRoot/usr/sbin/serverctl";
$MKDIR = "/bin/mkdir";
$MV = "/bin/mv";
$PLISTBUDDY = "/usr/libexec/PlistBuddy";
$TAR = "/usr/bin/tar";

#################################   PATHS  #################################
$SYSTEM_PLIST = "/System/Library/CoreServices/SystemVersion.plist";
$SERVER_PLIST = "/System/Library/CoreServices/ServerVersion.plist";
$HOSTCONFIG = "/private/etc/hostconfig";
$FTP_LAUNCHD_PREFERENCES = "/System/Library/LaunchDaemons/xftpd.plist";
$FTP_LAUNCHD_PREFERENCES_TIGER = "/System/Library/LaunchDaemons/ftp.plist";
$MIGRATION_LOG = "/Library/Logs/ServerSetup.log";

#10.6 and 10.7 stores the state of the service under launchd in the following file.
$LAUNCHD_OVERRIDES = "/private/var/db/launchd.db/com.apple.launchd/overrides.plist";

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
$MAXVER="10.10.0"; # <  10.9.0

$FTP_DISABLED="true"; #To begin with...

$LANGUAGE = "en"; # Should be Tier-0 only in iso format [en, fr, de, ja], we default this to English, en.
$PURGE = 0;       # So we will be default copy the items if there's no option specified.
$VERSION = "";    # This is the version number of the old system passed into us by Server Assistant. [10.6.x, 10.7.x, and potentially 10.8.x]
$PREV_EXT = ".previous";

if($ENV{DEBUG} eq 1) {$DEBUG = '1';}
if($ENV{FUNC_LOG} eq 1) {$FUNC_LOG = '1';}

@Items=$mu->ParseOptions(@ARGV);

if (${DEBUG}) 
	{ $mu->dumpAssociativeArray(@Items); }

validateOptionsAndDispatch(@Items);
exit();


##################   Functions   #######################
sub restoreAndSetState()
{
	if (${FUNC_LOG}) {printf("restoreAndSetState := S\n");}
	if((${SRV_MINOR} eq "6") || (${SRV_MINOR} eq "7") || (${SRV_MINOR} eq "8") || (${SRV_MINOR} eq "9")) {
		if (-e ${OLD_LAUNCHD_OVERRIDES}) {
			if (${DEBUG}) {
				print("cmd := " . qq(${PLISTBUDDY} -c \"Print :com.apple.xftpd:Disabled\" \"${OLD_LAUNCHD_OVERRIDES}\") . "\n");
			}
			$FTP_STATE=qx(${PLISTBUDDY} -c \"Print :com.apple.xftpd:Disabled\" \"${OLD_LAUNCHD_OVERRIDES}\" 2>&1);
			if ( $? eq "1" ) {
				$FTP_STATE="true"
			}
			chomp(${FTP_STATE});
		}
		#The entry could be present+enabled, or present+disabled, or just plan missing!
		if( (${FTP_STATE} eq "true") ) {
			$FTP_DISABLED = "true";
			if (${DEBUG}) { print("host disable true\n"); }
		} else {
			$FTP_DISABLED = "false";
			if (${DEBUG}) { print("host disable false\n"); }
		}
	}
	if (${FUNC_LOG}) {printf("restoreAndSetState := E\n");}
}

################################################################################
##
sub copyOldConfigFiles()
{
	if (${FUNC_LOG}) {printf("copyOldConfigFiles := S\n");}

	${CF1}="/Library/FTPServer/Configuration/FTPServer.plist";
	${CF2}="/Library/FTPServer/Configuration/ftp.xinetd";
	${CF3}="/Library/FTPServer/Configuration/ftpaccess";
	${CF4}="/Library/FTPServer/Configuration/ftpconversions";
	${CF5}="/Library/FTPServer/Configuration/ftpgroups";
	${CF6}="/Library/FTPServer/Configuration/ftphosts";
	${CF7}="/Library/FTPServer/Configuration/ftpusers";
	
	$MSG1="/Library/FTPServer/Messages/banner.txt";
	$MSG2="/Library/FTPServer/Messages/limit.txt";
	$MSG3="/Library/FTPServer/Messages/welcome.txt";
	
	$FTPRoot="/Library/FTPServer/FTPRoot";
	
	$S_CF1="${gSourceRoot}" . "${CF1}";
	$S_CF2="${gSourceRoot}" . "${CF2}";
	$S_CF3="${gSourceRoot}" . "${CF3}";
	$S_CF4="${gSourceRoot}" . "${CF4}";
	$S_CF5="${gSourceRoot}" . "${CF5}";
	$S_CF6="${gSourceRoot}" . "${CF6}";
	$S_CF7="${gSourceRoot}" . "${CF7}";
	
	$S_MSG1="${gSourceRoot}" . "${MSG1}";
	$S_MSG2="${gSourceRoot}" . "${MSG2}";
	$S_MSG3="${gSourceRoot}" . "${MSG3}";
	
	$S_FTPRoot="${gSourceRoot}" . "${FTPRoot}";
	
	$D_CF1="${gTargetRoot}" . "${CF1}";
	$D_CF2="${gTargetRoot}" . "${CF2}";
	$D_CF3="${gTargetRoot}" . "${CF3}";
	$D_CF4="${gTargetRoot}" . "${CF4}";
	$D_CF5="${gTargetRoot}" . "${CF5}";
	$D_CF6="${gTargetRoot}" . "${CF6}";
	$D_CF7="${gTargetRoot}" . "${CF7}";
	
	$D_MSG1="${gTargetRoot}" . "${MSG1}";
	$D_MSG2="${gTargetRoot}" . "${MSG2}";
	$D_MSG3="${gTargetRoot}" . "${MSG3}";
	
	$D_FTPRoot="${gTargetRoot}" . "${FTPRoot}";

	if(${DEBUG}) {
	    printf("CF1 %s\n", "${CF1}");
	    printf("CF2 %s\n", "${CF2}");
	    printf("CF3 %s\n", "${CF3}");
	    printf("CF4 %s\n", "${CF4}");
	    printf("CF5 %s\n", "${CF5}");
	    printf("CF6 %s\n", "${CF6}");
	    printf("CF7 %s\n", "${CF7}");
	    
	    printf("MSG1 %s\n", "${MSG1}");
	    printf("MSG2 %s\n", "${MSG2}");
	    printf("MSG3 %s\n", "${MSG3}");
	    
	    printf("FTPRoot %s\n", "${FTPRoot}");
    
	    printf("S_CF1 %s\n", "${S_CF1}");
	    printf("S_CF2 %s\n", "${S_CF2}");
	    printf("S_CF3 %s\n", "${S_CF3}");
	    printf("S_CF4 %s\n", "${S_CF4}");
	    printf("S_CF5 %s\n", "${S_CF5}");
	    printf("S_CF6 %s\n", "${S_CF6}");
	    printf("S_CF7 %s\n", "${S_CF7}");
	    
	    printf("S_MSG1 %s\n", "${S_MSG1}");
	    printf("S_MSG2 %s\n", "${S_MSG2}");
	    printf("S_MSG3 %s\n", "${S_MSG3}");
	    
	    printf("S_FTPRoot %s\n", "${S_FTPRoot}");	
    
	    printf("D_CF1 %s\n", "${D_CF1}");
	    printf("D_CF2 %s\n", "${D_CF2}");
	    printf("D_CF3 %s\n", "${D_CF3}");
	    printf("D_CF4 %s\n", "${D_CF4}");
	    printf("D_CF5 %s\n", "${D_CF5}");
	    printf("D_CF6 %s\n", "${D_CF6}");
	    printf("D_CF7 %s\n", "${D_CF7}");
	    
	    printf("D_MSG1 %s\n", "${D_MSG1}");
	    printf("D_MSG2 %s\n", "${D_MSG2}");
	    printf("D_MSG3 %s\n", "${D_MSG3}");
	    
	    printf("D_FTPRoot %s\n", "${D_FTPRoot}");	
	}

	if($mu->pathExists("${S_CF1}")) { if (! $mu->itemParentExists("${D_CF1}")) { $mu->createParentDirForItem("${D_CF1}"); } qx($CP "${S_CF1}" "${D_CF1}"); }
	if($mu->pathExists("${S_CF2}")) { if (! $mu->itemParentExists("${D_CF2}")) { $mu->createParentDirForItem("${D_CF2}"); } qx($CP "${S_CF2}" "${D_CF2}"); }
	if($mu->pathExists("${S_CF3}")) { if (! $mu->itemParentExists("${D_CF3}")) { $mu->createParentDirForItem("${D_CF3}"); } qx($CP "${S_CF3}" "${D_CF3}"); }
	if($mu->pathExists("${S_CF4}")) { if (! $mu->itemParentExists("${D_CF4}")) { $mu->createParentDirForItem("${D_CF4}"); } qx($CP "${S_CF4}" "${D_CF4}"); }
	if($mu->pathExists("${S_CF5}")) { if (! $mu->itemParentExists("${D_CF5}")) { $mu->createParentDirForItem("${D_CF5}"); } qx($CP "${S_CF5}" "${D_CF5}"); }
	if($mu->pathExists("${S_CF6}")) { if (! $mu->itemParentExists("${D_CF6}")) { $mu->createParentDirForItem("${D_CF6}"); } qx($CP "${S_CF6}" "${D_CF6}"); }
	if($mu->pathExists("${S_CF7}")) { if (! $mu->itemParentExists("${D_CF7}")) { $mu->createParentDirForItem("${D_CF7}"); } qx($CP "${S_CF7}" "${D_CF7}"); }

	if($mu->pathExists("${S_MSG1}")) { if (! $mu->itemParentExists("${D_MSG1}")) { $mu->createParentDirForItem("${D_MSG1}"); } qx($CP "${S_MSG1}" "${D_MSG1}"); }
	if($mu->pathExists("${S_MSG2}")) { if (! $mu->itemParentExists("${D_MSG2}")) { $mu->createParentDirForItem("${D_MSG2}"); } qx($CP "${S_MSG2}" "${D_MSG2}"); }
	if($mu->pathExists("${S_MSG3}")) { if (! $mu->itemParentExists("${D_MSG3}")) { $mu->createParentDirForItem("${D_MSG3}"); } qx($CP "${S_MSG3}" "${D_MSG3}"); }

	$tSrcDir=qx(dirname "${S_FTPRoot}"); chomp(${tSrcDir});
	$tDstDir=qx(dirname "${D_FTPRoot}"); chomp($tDstDir);
	if(${DEBUG}) { printf("%s \n", qq(${CP} -RpH ${tSrcDir}/FTPRoot ${tDstDir})); }
	qx(${CP} -RpH ${tSrcDir}/FTPRoot ${tDstDir});
	
	if (${FUNC_LOG}) {printf("copyOldConfigFiles := E\n");}
}

################################################################################
##
sub startStopFTP()
{
	if (${FUNC_LOG}) {printf("startStopFTP := S\n");}
        if (${DEBUG}) { printf("%s\n", ${FTP_LAUNCHD_PREFERENCES}); }
	
	if(${FTP_DISABLED} eq "true") {
		qx(${$SERVERCTL} disable service=com.apple.ftpd} 2>&1);
		if (${DEBUG}) { printf("%s\n", qq($SERVERCTL disable service=com.apple.ftpd)); }
	} else {
		qx(${$SERVERCTL} enable service=com.apple.ftpd} 2>&1);
		if (${DEBUG}) { printf("%s\n", qq($SERVERCTL enable service=com.apple.ftpd)); }
	}

	if (${FUNC_LOG}) {printf("startStopFTP := E\n");}
}

			
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

	#If our sourceRoot is not from "/Library/Server/Previous" then we will not purge the source no matter what!
	if (! ("${gSourceRoot}" =~ "/Library/Server/Previous") ) {
        printf("Overriding purge option: %s\n", ${gPurge});
		$gPurge = 0;
	}

	SWITCH: {
		if( ($mu->pathExists("${gSourceRoot}")) && ($mu->pathExists("${gTargetRoot}")) ) {
			if ($mu->isValidLanguage($gLanguage)) {
				if ($mu->isValidVersion($gSourceVersion)) {
					$valid = 1;
					
					## Need to fix up the paths we care about with the --sourceRoot we received
					$OLD_SYSTEM_PLIST =  "${gSourceRoot}" . "${SYSTEM_PLIST}";
					$OLD_SERVER_PLIST =  "${gSourceRoot}" . "${SERVER_PLIST}";
					$OLD_HOSTCONFIG =  "${gSourceRoot}" . "${HOSTCONFIG}";
					$OLD_FTP_LAUNCHD_PREFERENCES = "${gSourceRoot}" . "${FTP_LAUNCHD_PREFERENCES}";
					$OLD_FTP_LAUNCHD_PREFERENCES_TIGER = "${gSourceRoot}" . "${FTP_LAUNCHD_PREFERENCES_TIGER}";
					$OLD_LAUNCHD_OVERRIDES = "${gSourceRoot}" . "${LAUNCHD_OVERRIDES}";
					if (${DEBUG}) {
						print("${OLD_SYSTEM_PLIST}" . "\n");
						print("${OLD_SERVER_PLIST}" . "\n");
						print("${OLD_HOSTCONFIG}" . "\n");
						print("${OLD_FTP_LAUNCHD_PREFERENCES}" . "\n");
						print("${OLD_FTP_LAUNCHD_PREFERENCES_TIGER}" . "\n");
						print("${OLD_LAUNCHD_OVERRIDES}" . "\n");
					}
					
					restoreAndSetState();
					copyOldConfigFiles();
					startStopFTP();
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
