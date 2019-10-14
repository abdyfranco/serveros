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

## Migration Script for VPN

##################   Input Parameters  #######################
# --purge <0 | 1>   "1" means remove any files from the old system after you've migrated them, "0" means leave them alone.
# --sourceRoot <path> The path to the root of the system to migrate
# --sourceType <System | TimeMachine> Gives the type of the migration source, whether it's a runnable system or a
#                  Time Machine backup.
# --sourceVersion <ver> The version number of the old system (like 10.6 - 10.11). Since we support migration from 10.6
#                   through 10.11 installs.
# --targetRoot <path> The path to the root of the new system.
# --language <lang> A language identifier, such as \"en.\" Long running scripts should return a description of what they're doing
#                   (\"Migrating Open Directory users\"), and possibly provide status update messages along the way. These messages
#                   need to be localized (which is not necessarily the server running the migration script).
#                   This argument will identify the Server Assistant language. As an alternative to doing localization yourselves
#                   send them in English, but in case the script will do this it will need this identifier.
#
# Example: /Applications/Server.app/Contents/ServerRoot/System/Library/ServerSetup/MigrationExtras/30-vpnconfigmigrator.pl --purge 0 --language en --sourceType System --sourceVersion 10.6 --sourceRoot "/Library/Server/Previous" --targetRoot "/"

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
$SERVERADMIN="/Applications/Server.app/Contents/ServerRoot/usr/sbin/serveradmin";
$VPNADDKEYAGENTUSER="/Applications/Server.app/Contents/ServerRoot/usr/sbin/vpnaddkeyagentuser";

#################################   PATHS  #################################
$l2tpPrefFile = "/System/Library/LaunchDaemons/com.apple.ppp.l2tp.plist";
$pptpPrefFile = "/System/Library/LaunchDaemons/com.apple.ppp.pptp.plist";
$rasPrefFile = "/Library/Preferences/SystemConfiguration/com.apple.RemoteAccessServers.plist";

$SYSTEM_PLIST = "/System/Library/CoreServices/SystemVersion.plist";
$SERVER_PLIST = "/System/Library/CoreServices/ServerVersion.plist";
$HOSTCONFIG = "/private/etc/hostconfig";
$MIGRATION_LOG = "/Library/Logs/ServerSetup.log";

#10.6 stores the state of the service under launchd in the following file.
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
$MAXVER="10.12"; # <  10.12

$START_VPN=0; #To begin with...
$VPN_L2TP_DISABLED="true"; #To begin with...
$VPN_PPTP_DISABLED="true"; #To begin with...
$ServiceName="vpn";

$LANGUAGE = "en"; # Should be Tier-0 only in iso format [en, fr, de, ja], we default this to English, en.
$PURGE = 0;       # So we will be default copy the items if there's no option specified.
$VERSION = "";    # This is the version number of the old system passed into us by Server Assistant. [10.6.x, 10.7.x, and potentially 10.8.x]
$PREV_EXT = ".previous";

if($ENV{DEBUG} eq 1) {$DEBUG = '1';}
if($ENV{FUNC_LOG} eq 1) {$FUNC_LOG = '1';}

###################################################
##################   MAIN   #######################
###################################################

@Items=$mu->ParseOptions(@ARGV);

if (${DEBUG}) 
	{ $mu->dumpAssociativeArray(@Items); }

validateOptionsAndDispatch(@Items);

##################   Functions   #######################
################################################################################
sub migrateUpgrade() {
    if (${FUNC_LOG}) { print("migrateUpgrade : S\n"); }
    
    ## Need to fix up the paths we care about with the --sourceRoot we received
	$OLD_SYSTEM_PLIST = "${gSourceRoot}" . "${OLD_SYSTEM_PLIST}";
	$OLD_SERVER_PLIST = "${gSourceRoot}" . "${OLD_SERVER_PLIST}";
	$OLD_HOSTCONFIG = "${gSourceRoot}" . "${OLD_HOSTCONFIG}";

	if (${DEBUG}) {
		print("${OLD_SYSTEM_PLIST}" . "\n");
		print("${OLD_SERVER_PLIST}" . "\n");
		print("${OLD_HOSTCONFIG}" . "\n");
	}

	restoreAndSetState();
	
    if (${FUNC_LOG}) { print("migrateUpgrade : E\n"); }
}

################################################################################
##
sub restoreAndSetState()
{
	if (${FUNC_LOG}) {printf("restoreAndSetState := S\n");}
    
    # default to off
    $VPN_L2TP_DISABLED = "true";
    $VPN_PPTP_DISABLED = "true";
	
	$OLD_LAUNCHD_OVERRIDES="${gSourceRoot}${LAUNCHD_OVERRIDES}";
	if(${DEBUG}) {print("OLD_LAUNCHD_OVERRIDES = " . "${OLD_LAUNCHD_OVERRIDES}" . "\n");}
	if( (${SRV_MINOR} eq "6") || (${SRV_MINOR} eq "7") || (${SRV_MINOR} eq "8") || (${SRV_MINOR} eq "9") ) {

		#RAS
		if (-e ${OLD_rasPrefFile}) {
			if (${DEBUG}) {
				print("mv " . qq(${MV} "${gTargetRoot}${rasPrefFile}" "${gTargetRoot}${rasPrefFile}${PREV_EXT}") . "\n");
				if($gPurge) {
					print("mv " . qq(${MV} "${OLD_rasPrefFile}" "${gTargetRoot}${rasPrefFile}") . "\n");
				} else {
					print("cp " . qq(${CP} "${OLD_rasPrefFile}" "${gTargetRoot}${rasPrefFile}") . "\n");
				}
			} else {
				if (-e "${gTargetRoot}${rasPrefFile}") {
					qx(${MV} "${gTargetRoot}${rasPrefFile}" "${gTargetRoot}${rasPrefFile}${PREV_EXT}");
				}
				if($gPurge) {
					qx($MV "${OLD_rasPrefFile}" "${gTargetRoot}${rasPrefFile}");
				} else {
					qx($CP "${OLD_rasPrefFile}" "${gTargetRoot}${rasPrefFile}");
				}
			}

			$TARGET_RAS_PREFS="${gTargetRoot}${rasPrefFile}";
	
			# look in the plist file, if the ActiveServers array is empty nothing is running
			if (${DEBUG}) {
				print("cmd := " . qq(${PLISTBUDDY} -c \"Print :ActiveServers:0\" \"${TARGET_RAS_PREFS}\" 2>/dev/null) . "\n");
				$prefsActive = qx(${PLISTBUDDY} -c \"Print :ActiveServers:0\" \"${TARGET_RAS_PREFS}\" 2>/dev/null);
				print("activeServer:0 = ". ${prefsActive} . "\n"); 
				if ( $? eq "0" ) {
					print("There are servers active in " . "${OLD_rasPrefFile}" . ", VPN service may be started \n");
				} else {
					print("No servers active in " . "${OLD_rasPrefFile}" . ", VPN service should NOT be started \n");
    				$VPN_L2TP_DISABLED = "true";
    				$VPN_PPTP_DISABLED = "true";
					if (${FUNC_LOG}) {printf("restoreAndSetState := E\n");}					
					return;
				}
			} else {
				$prefsActive = qx(${PLISTBUDDY} -c \"Print :ActiveServers:0\" \"${TARGET_RAS_PREFS}\" 2>/dev/null);
				if ( $? eq "0" ) {
					print("There are servers active in " . "${TARGET_RAS_PREFS}" . ", VPN service may be started \n");
				} else {
					print("No servers active in " . "${TARGET_RAS_PREFS}" . ", VPN service should NOT be started \n");
    				$VPN_L2TP_DISABLED = "true";
    				$VPN_PPTP_DISABLED = "true";
					if (${FUNC_LOG}) {printf("restoreAndSetState := E\n");}					
					return;
				}
			}
            
		} else {
			print("We are missing file := " . "${OLD_rasPrefFile}" . ", VPN service should NOT be started\n");
    		$VPN_L2TP_DISABLED = "true";
    		$VPN_PPTP_DISABLED = "true";
    		if (${FUNC_LOG}) {printf("restoreAndSetState := E\n");}					
			return;			
		}

		if (-e ${OLD_LAUNCHD_OVERRIDES}) {
			if (${DEBUG}) {
				print("cmd := " . qq(${PLISTBUDDY} -c \"Print :com.apple.ppp.l2tp:Disabled\" \"${OLD_LAUNCHD_OVERRIDES}\" 2>/dev/null) . "\n");
				print("cmd := " . qq(${PLISTBUDDY} -c \"Print :com.apple.ppp.pptp:Disabled\" \"${OLD_LAUNCHD_OVERRIDES}\" 2>/dev/null) . "\n");
			} else {
				$VPN_L2TP_STATE=qx(${PLISTBUDDY} -c \"Print :com.apple.ppp.l2tp:Disabled\" \"${OLD_LAUNCHD_OVERRIDES}\" 2>/dev/null);
				if ( $? eq "1" ) {
					$VPN_L2TP_STATE="true";
					print("com.apple.ppp.l2tp entry is missing\n");
				}
				chomp(${VPN_L2TP_STATE});
				$VPN_PPTP_STATE=qx(${PLISTBUDDY} -c \"Print :com.apple.ppp.pptp:Disabled\" \"${OLD_LAUNCHD_OVERRIDES}\" 2>/dev/null);
				if ( $? eq "1" ) {
					$VPN_PPTP_STATE="true";
					print("com.apple.ppp.pptp entry is missing\n");
				}
				chomp(${VPN_PPTP_STATE});
			}
		} else {
			print("old launchd overrides file is missing\n");
            $VPN_L2TP_STATE="true";
            $VPN_PPTP_STATE="true";
        }

		#print("L2TP disabled state in overrides is " . "${VPN_L2TP_STATE}" . "\n");
		#print("PPTP disabled state in overrides is " . "${VPN_PPTP_STATE}" . "\n");
		#The entry could be present+enabled, or present+disabled, or just plan missing!
		# missing must equal true (e.g. if VPN_L2TP_STATE = true or missing the service is disabled)
		if( (${VPN_L2TP_STATE} eq "false") ) {
			$VPN_L2TP_DISABLED = "false";
			if (${DEBUG}) { print("L2TP enabled in overrides.plist\n"); }
		} else {
			$VPN_L2TP_DISABLED = "true";
			if (${DEBUG}) { print("L2TP disabled in overrides.plist\n"); }
		}

		#The entry could be present+enabled, or present+disabled, or just plan missing!
		if( (${VPN_PPTP_STATE} eq "false") ) {
			$VPN_PPTP_DISABLED = "false";
			if (${DEBUG}) { print("PPTP enabled in overrides.plist\n"); }
		} else {
			$VPN_PPTP_DISABLED = "true";
			if (${DEBUG}) { print("PPTP disabled in overrides.plist\n"); }
		}
	}	
	if (${FUNC_LOG}) {printf("restoreAndSetState := E\n");}
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
		if( ($mu->pathExists($gSourceRoot)) && ($mu->pathExists($gTargetRoot)) ) {
			$OLD_l2tpPrefFile = "${gSourceRoot}" . "${l2tpPrefFile}";
			$OLD_pptpPrefFile = "${gSourceRoot}" . "${pptpPrefFile}";
			$OLD_rasPrefFile = "${gSourceRoot}" . "${rasPrefFile}";

			$OLD_SYSTEM_PLIST = "${gSourceRoot}" . "${SYSTEM_PLIST}";
			$OLD_SERVER_PLIST = "${gSourceRoot}" . "${SERVER_PLIST}";
			$OLD_HOSTCONFIG = "${gSourceRoot}" . "${SERVER_PLIST}";

			if(${DEBUG}) {
				printf("${OLD_l2tpPrefFile} \n");
				printf("${OLD_pptpPrefFile} \n");
				printf("${OLD_rasPrefFile} \n");
				printf("${OLD_SYSTEM_PLIST} \n");
				printf("${OLD_SERVER_PLIST} \n");
				printf("${OLD_HOSTCONFIG} \n");
			}

			if ($mu->isValidLanguage($gLanguage)) {
				if ($mu->isValidVersion($gSourceVersion)) {
					$valid = 1;
					migrateUpgrade();
					startStopVPN();
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
# Start or stop the service
sub startStopVPN()
{
	if (${FUNC_LOG}) {printf("startStopVPN := S\n");}

	
	if("${gTargetRoot}" ne "/")
	{
		printf("target is not the active system, no services will be started\n");
		if (${FUNC_LOG}) {printf("startStopVPN := E\n");}
		return;
	}
	$START_VPN = 0;

	#l2tp
	if(${VPN_L2TP_DISABLED} eq "false") {
		$START_VPN=1;
		printf("L2TP is enabled\n");
	} else {
		printf("L2TP is disabled\n");	
    }
    
	if($START_VPN == 1) {
		
		if (${DEBUG}) { printf("%s\n", qq(${SERVERADMIN} start ${ServiceName})); }
		else { qx(${SERVERADMIN} start ${ServiceName}); }
	} else {
		
		if (${DEBUG}) { printf("%s\n", qq(${SERVERADMIN} stop ${ServiceName}));  }
		else {qx(${SERVERADMIN} stop ${ServiceName});}
	}

	if (${FUNC_LOG}) {printf("startStopVPN := E\n");}
}

################################################################################
# Show proper usage
sub Usage()
{
	print("--purge <0 | 1>   \"1\" means remove any files from the old system after you've migrated them, \"0\" means leave them alone." . "\n");
	print("--sourceRoot <path> The path to the root of the system to migrate" . "\n");
	print("--sourceType <System | TimeMachine> Gives the type of the migration source, whether it's a runnable system or a " . "\n");
	print("                  Time Machine backup." . "\n");
	print("--sourceVersion <ver> The version number of the old system (like 10.6 - 10.11). Since we support migration from 10.6" . "\n");
	print("                  through 10.11 installs." . "\n");
	print("--targetRoot <path> The path to the root of the new system." . "\n");
	print("--language <lang> A language identifier, such as \"en.\" Long running scripts should return a description of what they're doing " . "\n");
	print("                  (\"Migrating Open Directory users\"), and possibly provide status update messages along the way. These messages " . "\n");
	print("                  need to be localized (which is not necessarily the server running the migration script). " . "\n");
	print("                  This argument will identify the Server Assistant language. As an alternative to doing localization yourselves " . "\n");
	print("                  send them in English, but in case the script will do this it will need this identifier." . "\n");
	print(" " . "\n");
}
