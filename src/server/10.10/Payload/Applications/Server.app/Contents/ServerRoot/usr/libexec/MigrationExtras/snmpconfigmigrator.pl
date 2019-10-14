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

## Migration Script for SNMP

##################   Input Parameters  #######################
# --purge <0 | 1>   "1" means remove any files from the old system after you've migrated them, "0" means leave them alone.
# --sourceRoot <path> The path to the root of the system to migrate
# --sourceType <System | TimeMachine> Gives the type of the migration source, whether it's a runnable system or a
#                  Time Machine backup.
# --sourceVersion <ver> The version number of the old system (like 10.6, 10.7, 10.8). Since we support migration from 10.6, 10.7,
#                   and other 10.8 installs.
# --targetRoot <path> The path to the root of the new system.
# --language <lang> A language identifier, such as \"en.\" Long running scripts should return a description of what they're doing
#                   (\"Migrating Open Directory users\"), and possibly provide status update messages along the way. These messages
#                   need to be localized (which is not necessarily the server running the migration script).
#                   This argument will identify the Server Assistant language. As an alternative to doing localization yourselves
#                   send them in English, but in case the script will do this it will need this identifier.
#
#
#	Theory of operation
#
#  Migration from earlier builds of 10.6 is just a copy operation with the exception of
#  not copying ($gSourceRoot)($NET_SNMP_54)snmpd.conf if it is identical to ($gSourceRoot)($NET_SNMP_54)snmpd.conf.default
#  e.g. the admin did not edit the snmp.conf file in any way & just enabled snmp  (this allow us to pick up the fix for 
#  6209744).
#
#  
#
# Example: /Applications/Server.app/Contents/ServerRoot/System/Library/ServerSetup/MigrationExtras/30-snmpconfigmigrator.pl --purge 0 --language en --sourceType System --sourceVersion 10.6 --sourceRoot "/Library/Server/Previous" --targetRoot "/"

use File::Compare;

##################   Paths  #######################
$SYSTEM_PLIST = "/System/Library/CoreServices/SystemVersion.plist";
$SERVER_PLIST = "/System/Library/CoreServices/ServerVersion.plist";
$HOSTCONFIG = "/private/etc/hostconfig";

$SNMP_LAUNCHD_PREFERENCES = "/System/Library/LaunchDaemons/org.net-snmp.snmpd.plist";

$PREV_EXT = ".previous";

# common config file paths
$NET_SNMP_PERSISTANT = "/private/var/db/net-snmp";
$NET_SNMP_SHARE = "/usr/share/snmp";
$NET_SNMP_LIB = "/usr/lib/snmp";

$NET_SNMP_54 = "/private/etc/snmp";
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
$MAXVER="10.10.0"; # <  10.10.0

$SNMP_KEY="SNMPSERVER";

$SNMP_DISABLED="true"; #To begin with...

##################   Utilities   #######################
$CAT = "/bin/cat";
$CP = "/bin/cp";
$DIFF = "/usr/bin/diff";
$DSCL = "/usr/bin/dscl";
$DU = "/usr/bin/du";
$ECHO = "/bin/echo";
$GREP = "/usr/bin/grep";
$LAUNCHCTL = "/bin/launchctl";
$MKDIR = "/bin/mkdir";
$MV = "/bin/mv";
$PLISTBUDDY = "/usr/libexec/PlistBuddy";
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
				$OLD_SNMP_LAUNCHD_PREFERENCES = "${gSourceRoot}" . "${SNMP_LAUNCHD_PREFERENCES}";
				$TARGET_SNMP_LAUNCHD_PREFERENCES = "${gTargetRoot}" . "${SNMP_LAUNCHD_PREFERENCES}";
				
				if (${DEBUG}) {
					print("${OLD_SYSTEM_PLIST}" . "\n");
					print("${OLD_SERVER_PLIST}" . "\n");
					print("${OLD_HOSTCONFIG}" . "\n");
					print("${OLD_SNMP_LAUNCHD_PREFERENCES}" . "\n");
				}
				
				# Locate the 10.6, 10.7 or 10.8 settings for the service and enable it as needed.
				restoreAndSetState();
				
				# Start/Stop and Load/Unload.
				startStopSNMP();
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

sub restoreAndSetState()
{
	if (${FUNC_LOG}) {printf("restoreAndSetState := S\n");}
	
	$OLD_LAUNCHD_OVERRIDES="${gSourceRoot}${LAUNCHD_OVERRIDES}";
	if( (${SRV_MINOR} eq "6") || (${SRV_MINOR} eq "7") || (${SRV_MINOR} eq "8") ){
		if (-e ${OLD_LAUNCHD_OVERRIDES}) {
			if (${DEBUG}) {
				print("cmd := " . qq(${PLISTBUDDY} -c \"Print :org.net-snmp.snmpd:Disabled\" \"${OLD_LAUNCHD_OVERRIDES}\") . "\n");
			} else {
				$SNMP_STATE=qx(${PLISTBUDDY} -c \"Print :org.net-snmp.snmpd:Disabled\" \"${OLD_LAUNCHD_OVERRIDES}\");
				chomp(${SNMP_STATE});
			}
		}
		if((${SNMP_STATE} ne "true") && (${SNMP_STATE} ne "")) {
			$SNMP_DISABLED = "false";
			if (${DEBUG}) { print("host disable false\n"); }
		}
	}	
	
	migrateSNMPDaemonConfig();
	migrateSNMPClientConfig();
	migratePersistantState();

	if (${FUNC_LOG}) {printf("restoreAndSetState := E\n");}
}


# migrate the snmpd.conf & snmpd.local.conf files in its many possible locations
sub migrateSNMPDaemonConfig()
{
	if (${FUNC_LOG}) {printf("migrateSNMPDaemonConfig := S\n");}
	my $current_file = "";
	my $target_file = "";
	my $default_file = "";
	
	if (${FUNC_LOG}) {printf("migrateSNMPDaemonConfig := E\n");}
}


# migrate the snmp.conf & snmp.local.conf files in its many possible locations
sub migrateSNMPClientConfig()
{
	if (${FUNC_LOG}) {printf("migrateSNMPClientConfig := S\n");}
	my $current_file = "";
	my $target_file = "";
	
	if((${SRV_MINOR} eq "6") || (${SRV_MINOR} eq "7") || (${SRV_MINOR} eq "8")) {
		$current_file = "${gSourceRoot}" . "${NET_SNMP_54}" . "/snmp.conf";		# {src}/private/etc/snmp/snmp.conf
		$target_file = "${gTargetRoot}" . "${NET_SNMP_54}" . "/snmp.conf";		# {targ}/private/etc/snmp/snmp.conf
		if (-e "${current_file}") {
			if (${DEBUG}) {
				if(${gPurge}) {
					print("mv " . qq(${MV} "${current_file}" "${target_file}") . "\n");
				} else {
					print("cp " . qq(${CP} "${current_file}" "${target_file}") . "\n");
				}
			} else {
				if(${gPurge}) {
					qx($MV "${current_file}" "${target_file}");
				} else {
					qx($CP "${current_file}" "${target_file}");
				}
			}
		}
		
		$current_file = "${gSourceRoot}" . "${NET_SNMP_54}" . "/snmp.local.conf";		# {src}/private/etc/snmp/snmp.local.conf
		$target_file = "${gTargetRoot}" . "${NET_SNMP_54}" . "/snmp.local.conf";		# {targ}/private/etc/snmp/snmp.local.conf

		if (-e "${current_file}") {
			if (${DEBUG}) {
				if(${gPurge}) {
					print("mv " . qq(${MV} "${current_file}" "${target_file}") . "\n");
				} else {
					print("cp " . qq(${CP} "${current_file}" "${target_file}") . "\n");
				}
			} else {
				if(${gPurge}) {
					qx($MV "${current_file}" "${target_file}");
				} else {
					qx($CP "${current_file}" "${target_file}");
				}
			}
		}
		
		$current_file = "${gSourceRoot}" . "${NET_SNMP_SHARE}" . "/snmp.conf";		# {src}/usr/share/snmp/snmp.conf
		$target_file = "${gTargetRoot}" . "${NET_SNMP_SHARE}" . "/snmp.conf";		# {targ}/usr/share/snmp/snmp.conf
		if (-e "${current_file}") {
			if (${DEBUG}) {
				if(${gPurge}) {
					print("mv " . qq(${MV} "${current_file}" "${target_file}") . "\n");
				} else {
					print("cp " . qq(${CP} "${current_file}" "${target_file}") . "\n");
				}
			} else {
				if(${gPurge}) {
					qx($MV "${current_file}" "${target_file}");
				} else {
					qx($CP "${current_file}" "${target_file}");
				}
			}
		}
		
		$current_file = "${gSourceRoot}" . "${NET_SNMP_SHARE}" . "/snmp.local.conf";	# {src}/usr/share/snmp/snmp.local.conf
		$target_file = "${gTargetRoot}" . "${NET_SNMP_SHARE}" . "/snmp.local.conf";		# {targ}/usr/share/snmp/snmp.local.conf

		if (-e "${current_file}") {
			if (${DEBUG}) {
				if(${gPurge}) {
					print("mv " . qq(${MV} "${current_file}" "${target_file}") . "\n");
				} else {
					print("cp " . qq(${CP} "${current_file}" "${target_file}") . "\n");
				}
			} else {
				if(${gPurge}) {
					qx($MV "${current_file}" "${target_file}");
				} else {
					qx($CP "${current_file}" "${target_file}");
				}
			}
		}
		
		$current_file = "${gSourceRoot}" . "${NET_SNMP_LIB}" . "/snmp.conf";	# {src}/usr/lib/snmp/snmp.conf
		$target_file = "${gTargetRoot}" . "${NET_SNMP_LIB}" . "/snmp.conf";		# {targ}/usr/lib/snmp/snmp.conf
		if (-e "${current_file}") {
			if (${DEBUG}) {
				if(${gPurge}) {
					print("mv " . qq(${MV} "${current_file}" "${target_file}") . "\n");
				} else {
					print("cp " . qq(${CP} "${current_file}" "${target_file}") . "\n");
				}
			} else {
				if(${gPurge}) {
					qx($MV "${current_file}" "${target_file}");
				} else {
					qx($CP "${current_file}" "${target_file}");
				}
			}
		}
		
		$current_file = "${gSourceRoot}" . "${NET_SNMP_LIB}" . "/snmp.local.conf";		# {src}/usr/lib/snmp/snmp.local.conf
		$target_file = "${gTargetRoot}" . "${NET_SNMP_LIB}" . "/snmp.local.conf";		# {targ}/usr/lib/snmp/snmp.local.conf

		if (-e "${current_file}") {
			if (${DEBUG}) {
				if(${gPurge}) {
					print("mv " . qq(${MV} "${current_file}" "${target_file}") . "\n");
				} else {
					print("cp " . qq(${CP} "${current_file}" "${target_file}") . "\n");
				}
			} else {
				if(${gPurge}) {
					qx($MV "${current_file}" "${target_file}");
				} else {
					qx($CP "${current_file}" "${target_file}");
				}
			}
		}

	}

	if (${FUNC_LOG}) {printf("migrateSNMPClientConfig := E\n");}
}

#
#	Copy the persistant state directory over if it exists. NOTE we do not expect the target_dir to exist
#
sub migratePersistantState()
{
	if (${FUNC_LOG}) {printf("migratePersistantState := S\n");}
	my $target_dir = "";
	
	my $current_dir = "${gSourceRoot}" . "${NET_SNMP_PERSISTANT}";			# {src}/private/var/db/net-snmp
	
	if( (${SRV_MINOR} eq "6") || (${SRV_MINOR} eq "7") || (${SRV_MINOR} eq "8") ) {
		
		$target_dir = "${gTargetRoot}" . "${NET_SNMP_PERSISTANT}";			# {targ}/private/var/db/net-snmp
	}
	
	if (-e ${current_dir}) {
		if (${DEBUG}) {
			if(${gPurge}) {
				print("mv " . qq(${MV} "${current_dir}" "${target_dir}") . "\n");
			} else {
				print("cp " . qq(${CP} -r "${current_dir}" "${target_dir}") . "\n");
			}
		} else {
			if(${gPurge}) {
				qx($MV "${current_dir}" "${target_dir}");
			} else {
				qx($CP -r "${current_dir}" "${target_dir}");
			}
		}
	}
	
	if (${FUNC_LOG}) {printf("migratePersistantState := E\n");}
}
			
sub startStopSNMP()
{
	if (${FUNC_LOG}) {printf("startSNMP := S\n");}
	
	if(${gTargetRoot} eq "/"){	# are we the currently running system?
		if(${SNMP_DISABLED} eq "false") {
			qx(${LAUNCHCTL} load -w "${SNMP_LAUNCHD_PREFERENCES}");
			if (${DEBUG}) { printf("%s\n", qq($LAUNCHCTL load -w "${SNMP_LAUNCHD_PREFERENCES}"));	}
		} else {
			qx(${LAUNCHCTL} unload -w ${SNMP_LAUNCHD_PREFERENCES});
			if (${DEBUG}) { printf("%s\n", qq($LAUNCHCTL unload -w "${SNMP_LAUNCHD_PREFERENCES}"));	}
		}
	} else {
		if (${DEBUG}) { printf("Target %s is not the active system\n", "${gTargetRoot}"); 	}
	}
	if (${FUNC_LOG}) {printf("startSNMP := E\n");}
}

################################################################################
# If we cannot find the hostconfig file in the source, check to see if we are
# doing an in place upgrade and try to get it from the live system. returns 
# the path of the proper hostconfig file to use
#
sub findSourceHostconfig()
{
	if (${FUNC_LOG}) { print("findSourceHostconfig : S\n"); }
	
	if (-e "${OLD_HOSTCONFIG}") {
		if (${FUNC_LOG}) { print("findSourceHostconfig : E\n"); }
		return "${OLD_HOSTCONFIG}";
	} else {
		if("${gSourceRoot}" eq "/Library/Server/Previous")	# we are doing an in place upgrade
		{
			if (-e "${HOSTCONFIG}") {

				if (${FUNC_LOG}) { print("findSourceHostconfig : E\n"); }
				return "${HOSTCONFIG}";
			} else {
				if (${FUNC_LOG}) { print("findSourceHostconfig : E\n"); }
				return "not found";	
			}
		} else {
			if (${FUNC_LOG}) { print("findSourceHostconfig : E\n"); }
			return "not found";	
		}
	}
	if (${FUNC_LOG}) { print("findSourceHostconfig : E\n"); }
}

################################################################################
# Show proper usage
sub Usage()
{
	print("--purge <0 | 1>   \"1\" means remove any files from the old system after you've migrated them, \"0\" means leave them alone." . "\n");
	print("--sourceRoot <path> The path to the root of the system to migrate" . "\n");
	print("--sourceType <System | TimeMachine> Gives the type of the migration source, whether it's a runnable system or a " . "\n");
	print("                  Time Machine backup." . "\n");
	print("--sourceVersion <ver> The version number of the old system (like 10.6, 10.7 or 10.8). Since we support migration from 10.6, 10.7," . "\n");
	print("                  and other 10.8 installs." . "\n");
	print("--targetRoot <path> The path to the root of the new system." . "\n");
	print("--language <lang> A language identifier, such as \"en.\" Long running scripts should return a description of what they're doing " . "\n");
	print("                  (\"Migrating Open Directory users\"), and possibly provide status update messages along the way. These messages " . "\n");
	print("                  need to be localized (which is not necessarily the server running the migration script). " . "\n");
	print("                  This argument will identify the Server Assistant language. As an alternative to doing localization yourselves " . "\n");
	print("                  send them in English, but in case the script will do this it will need this identifier." . "\n");
	print(" " . "\n");
}
