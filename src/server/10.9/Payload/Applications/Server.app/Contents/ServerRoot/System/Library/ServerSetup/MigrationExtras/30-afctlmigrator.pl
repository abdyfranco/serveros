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

## Migration Script for the Adaptive Firewall

##################   Input Parameters  #######################
# --purge <0 | 1>	"1" means remove any files from the old system after you've migrated them, "0" means leave them alone.
# --sourceRoot <path>	The path to the root of the system to migrate
# --sourceType <System | TimeMachine>	Gives the type of the migration source, whether it's a runnable system or a 
#                                       Time Machine backup.
# --sourceVersion <ver>	The version number of the old system (like 10.6  or 10.7).
# --targetRoot <path>	The path to the root of the new system. Pretty much always "/"
# --language <lang>	A language identifier, such as "en." Long running scripts should return a description of what they're doing 
#                   ("Migrating Open Directory users"), and possibly provide status update messages along the way. 

##################   Paths  #######################
$SYSTEM_PLIST = "/System/Library/CoreServices/SystemVersion.plist";
$SERVER_PLIST = "/System/Library/CoreServices/ServerVersion.plist";
$SERVER_INSTALL_PATH = "/Applications/Server.app/Contents/ServerRoot";

$AFCTL_LAUNCHD_PREFERENCES = "/System/Library/LaunchDaemons/com.apple.afctl.plist";
$AFCTL_PREFERENCES = "/private/etc/af.plist";
$DEFAULT_AFCTL_PREFERENCES = ${SERVER_INSTALL_PATH} . ${AFCTL_PREFERENCES};
$AFCTL_WHITELIST = "/private/var/db/af/whitelist";
$AFCTL_BLACKLIST = "/private/var/db/af/blacklist";

$SERVERD_PREFERENCES = "/Library/Preferences/com.apple.serverd.plist";

$PREV_EXT = ".previous";

#################################  GLOBALS #################################
$gPurge="0";		# Default is don't purge
$gSourceRoot="";
$gSourceType="";
$gSourceVersion="";
$gTargetRoot="";
${gLanguage}="en";	# Default is english

$DEBUG = 0;
${FUNC_LOG} = 0;

$SYS_VERS="0";   
$SYS_MAJOR="0";  
$SYS_MINOR="0";  
$SYS_UPDATE="-"; 
$SRV_VERS="0";   
$SRV_MAJOR="0";  
$SRV_MINOR="0";  
$SRV_UPDATE="-"; 

$AFCTL_DISABLED="true"; #To begin with...

##################   Utilities   #######################
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
$AFCTL = ${SERVER_INSTALL_PATH} . "/usr/libexec/afctl";
$SERVERCTL = ${SERVER_INSTALL_PATH} . "/usr/sbin/serverctl";

#10.6 stores the state of the service under launchd in the following file.
$LAUNCHD_OVERRIDES = "/private/var/db/launchd.db/com.apple.launchd/overrides.plist";

###################################################
##################   MAIN   #######################
###################################################

@Items=$mu->ParseOptions(@ARGV);

if (${DEBUG}) 
	{ $mu->dumpAssociativeArray(@Items); }

validateOptionsAndDispatch(@Items);
exit();


################################################################################
##############################   Functions   ###################################
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
	${gLanguage}=$BigList{"--language"};
	
	qx(/bin/echo purge: "${gPurge}" >> /Library/Logs/ServerSetup.log);
	qx(/bin/echo sourceRoot: "${gSourceRoot}" >> /Library/Logs/ServerSetup.log);
	qx(/bin/echo sourceType: "${gSourceType}" >> /Library/Logs/ServerSetup.log);
	qx(/bin/echo sourceVersion: "${gSourceVersion}" >> /Library/Logs/ServerSetup.log);
	qx(/bin/echo targetRoot: "${gTargetRoot}" >> /Library/Logs/ServerSetup.log);
	qx(/bin/echo language: ${gLanguage} >> /Library/Logs/ServerSetup.log);

SWITCH: {
	if( ($mu->pathExists("${gSourceRoot}")) && ($mu->pathExists("${gTargetRoot}")) ) {
		if ($mu->isValidLanguage($gLanguage)) {
			if ($mu->isValidVersion($gSourceVersion)) {
				$valid = 1;
				
				## Need to fix up the paths we care about 
				$OLD_SYSTEM_PLIST = "${gSourceRoot}" . "${SYSTEM_PLIST}";
				$OLD_SERVER_PLIST = "${gSourceRoot}" . "${SERVER_PLIST}";
				
				$OLD_AFCTL_PREFERENCES = "${gSourceRoot}" . "${AFCTL_PREFERENCES}";
				$OLD_AFCTL_WHITELIST = "${gSourceRoot}" . "${AFCTL_WHITELIST}";
				$OLD_AFCTL_BLACKLIST = "${gSourceRoot}" . "${AFCTL_BLACKLIST}";

				$TARGET_AFCTL_PREFERENCES = "${gTargetRoot}" . "${AFCTL_PREFERENCES}";
				$TARGET_AFCTL_WHITELIST = "${gTargetRoot}" . "${AFCTL_WHITELIST}";
				$TARGET_AFCTL_BLACKLIST = "${gTargetRoot}" . "${AFCTL_BLACKLIST}";
				
				if (${DEBUG}) {
					print("${OLD_SYSTEM_PLIST}" . "\n");
					print("${OLD_SERVER_PLIST}" . "\n");
					print("${OLD_AFCTL_PREFERENCES}" . "\n");
					print("${OLD_AFCTL_WHITELIST}" . "\n");
					print("${OLD_AFCTL_BLACKLIST}" . "\n");
					print("${TARGET_AFCTL_PREFERENCES}" . "\n");
					print("${TARGET_AFCTL_WHITELIST}" . "\n");
					print("${TARGET_AFCTL_BLACKLIST}" . "\n");
				}


				# Get old server version parts
   				if (${DEBUG}) {printf("sourceVersion := %s\n", "${gSourceVersion}");}
				($SRV_MAJOR, $SRV_MINOR, $SRV_UPDATE)=$mu->serverVersionParts(${gSourceVersion});

				# Locate the previous settings for the service and enable it as needed.
				restoreAndSetState();
				
			} else {
				print("Did not supply a valid version for the --sourceVersion parameter, needs to be >= 10.5.0 and < 10.8.0\n");
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
# returns "true" if afctl were active & enabled on the previous system
#         "false" otherwise

sub wasActive() {
	if (${FUNC_LOG}) { print("wasActive : S\n"); }
	my $STATE = "false";
	my $AFCTL_STATE = "false";
	
	
	$OLD_LAUNCHD_OVERRIDES="${gSourceRoot}${LAUNCHD_OVERRIDES}";
	
	#print("SRV_MINOR = ${SRV_MINOR}\n");
	#print("OLD_LAUNCHD_OVERRIDES = ${OLD_LAUNCHD_OVERRIDES}\n");
	
	
	if((${SRV_MINOR} eq "6") || (${SRV_MINOR} eq "7")) {
		my $AFCTL_DISABLED = "true";

		if (-e ${OLD_LAUNCHD_OVERRIDES}) {
			if (${DEBUG}) {
				print("cmd := " . qq(${PLISTBUDDY} -c \"Print :com.apple.afctl:Disabled\" \"${OLD_LAUNCHD_OVERRIDES}\") . "\n");
			} else {
				$AFCTL_DISABLED= qx(${PLISTBUDDY} -c \"Print :com.apple.afctl:Disabled\" \"${OLD_LAUNCHD_OVERRIDES}\" 2>&1);
				chomp(${AFCTL_DISABLED});
			}
		}
		
		if (${DEBUG}) {
			print("cmd := " . qq(${PLISTBUDDY} -c \"Print :start_behavior\" \"${OLD_AFCTL_PREFERENCES}\") . "\n");
		} 
		${AFCTL_ENABLED}=qx(${PLISTBUDDY} -c \"Print :start_behavior\" \"${OLD_AFCTL_PREFERENCES}\" 2>&1);
		chomp(${AFCTL_ENABLED});
		
		if (${DEBUG}) { print("AFCTL_DISABLED = ${AFCTL_DISABLED}  AFCTL_ENABLED = ${AFCTL_ENABLED}" . "\n"); }
		
		if((${AFCTL_DISABLED} eq "false") and (${AFCTL_ENABLED} eq "enabled"))
		{
			$STATE = "true";
		}
	}
	
    # look inside serverd prefs at the enabledServices array
   	if(${SRV_MINOR} eq "8") {
        $ENABLED_SERVICES = qx(${PLISTBUDDY} -c \"Print :enabledServices\" \"${SERVERD_PREFERENCES}\" 2>&1);
        if($ENABLED_SERVICES =~ m/com.apple.afctl/) # should return true iff com.apple.afctl is present
        {
            $STATE = "true";
        } else {
            $STATE = "false";
        }
    }
    
	#print("AFCTL_DISABLED = ${AFCTL_DISABLED}  AFCTL_ENABLED = ${AFCTL_ENABLED} AFCTL_STATE = ${AFCTL_STATE}" . "\n");
	#print ("state = ${STATE} \n");
	
	if (${FUNC_LOG}) { print("wasActive : E\n"); }
	return $STATE;
}



sub restoreAndSetState()
{
	if (${FUNC_LOG}) {printf("restoreAndSetState := S\n");}
		
	${AFCTL_STATE} = wasActive();
		
	if(${SRV_MINOR} > "4") {
		if (${DEBUG}) { print("Migrating from 10.5.x or later \n"); }
	
		# copy the af.plist
		if (-e "${OLD_AFCTL_PREFERENCES}") {
			if (${DEBUG}) {
                if (-e "${TARGET_AFCTL_PREFERENCES}") {
                    print("cmd := " . qq(${MV} "${TARGET_AFCTL_PREFERENCES}" "${TARGET_AFCTL_PREFERENCES}${PREV_EXT}") . "\n");
                }
				if($gPurge) {
					print("cmd := " . qq(${MV} "${OLD_AFCTL_PREFERENCES}" "${TARGET_AFCTL_PREFERENCES}") . "\n");
				} else {
					print("cmd := " . qq(${CP} "${OLD_AFCTL_PREFERENCES}" "${TARGET_AFCTL_PREFERENCES}") . "\n");
				}
			} else {
                if (-e "${TARGET_AFCTL_PREFERENCES}") {
                    qx(${MV} "${TARGET_AFCTL_PREFERENCES}" "${TARGET_AFCTL_PREFERENCES}${PREV_EXT}");
                }
				if($gPurge) {
					qx(${MV} "${OLD_AFCTL_PREFERENCES}" "${TARGET_AFCTL_PREFERENCES}");
				} else {
					qx(${CP} "${OLD_AFCTL_PREFERENCES}" "${TARGET_AFCTL_PREFERENCES}");
				}
			}
		} else {
            if (${DEBUG}) {
                print("cmd := " . qq(${CP} "${DEFAULT_AFCTL_PREFERENCES}" "${TARGET_AFCTL_PREFERENCES}") . "\n");
            } else {
                qx(${CP}  "${DEFAULT_AFCTL_PREFERENCES}" "${TARGET_AFCTL_PREFERENCES}");
            }
        }
					
		# copy the contents of the database dir if present
		if (-e "${OLD_AFCTL_WHITELIST}" || -e "${OLD_AFCTL_BLACKLIST}") {
			if (${DEBUG}) {
                if(-e "${TARGET_AFCTL_WHITELIST}") {
                    print("cmd := " . qq(${MV} "${TARGET_AFCTL_WHITELIST}" "${TARGET_AFCTL_WHITELIST}${PREV_EXT}") . "\n");
                }
                if(-e "${TARGET_AFCTL_BLACKLIST}") {
                    print("cmd := " . qq(${MV} "${TARGET_AFCTL_BLACKLIST}" "${TARGET_AFCTL_BLACKLIST}${PREV_EXT}") . "\n");
                }
				if($gPurge) {
                    if(-e "${OLD_AFCTL_WHITELIST}") {
                        print("cmd := " . qq(${MV} "${OLD_AFCTL_WHITELIST}" "${TARGET_AFCTL_WHITELIST}") . "\n");
                    }
                    if(-e "${OLD_AFCTL_BLACKLIST}") {
                        print("cmd := " . qq(${MV} "${OLD_AFCTL_BLACKLIST}" "${TARGET_AFCTL_BLACKLIST}") . "\n");
                    }
				} else {
                    if(-e "${OLD_AFCTL_WHITELIST}") {
                        print("cmd := " . qq(${CP} "${OLD_AFCTL_WHITELIST}" "${TARGET_AFCTL_WHITELIST}") . "\n");
                    }
                    if(-e "${OLD_AFCTL_BLACKLIST}") {
                        print("cmd := " . qq(${CP} "${OLD_AFCTL_BLACKLIST}" "${TARGET_AFCTL_BLACKLIST}") . "\n");
                    }
				}
			} else {
				if(-e "${TARGET_AFCTL_WHITELIST}") {
					qx(${MV} "${TARGET_AFCTL_WHITELIST}" "${TARGET_AFCTL_WHITELIST}${PREV_EXT}");
                }
                if (-e "${TARGET_AFCTL_BLACKLIST}") {
					qx(${MV} "${TARGET_AFCTL_BLACKLIST}" "${TARGET_AFCTL_BLACKLIST}${PREV_EXT}");
				} 				
				if($gPurge) {
                    if(-e "${OLD_AFCTL_WHITELIST}") {
                        qx(${MV} "${OLD_AFCTL_WHITELIST}" "${TARGET_AFCTL_WHITELIST}");
                    }
                    if(-e "${OLD_AFCTL_BLACKLIST}") {
                        qx(${MV} "${OLD_AFCTL_BLACKLIST}" "${TARGET_AFCTL_BLACKLIST}");
                    }
				} else {
                    if(-e "${OLD_AFCTL_WHITELIST}") {
                        qx(${CP} "${OLD_AFCTL_WHITELIST}" "${TARGET_AFCTL_WHITELIST}");
                    }
                    if(-e "${OLD_AFCTL_BLACKLIST}") {
                        qx(${CP} "${OLD_AFCTL_BLACKLIST}" "${TARGET_AFCTL_BLACKLIST}");
                    }
				}
			}		
		}
			
	}			
	# need to update the whitelist (or arrange to have changeip run)
	# this is where we need the fix for 6460590
	# something like
	if(${gTargetRoot} eq "/"){	# migrating onto a live system needs to be fixed
        # rerun the self configure to create the whitelist
        if(${DEBUG}){
            print("cmd := " . qq(${AFCTL} -c ) . "\n");
        } else {
            qx(${AFCTL} -c );
        }
        
		if(${AFCTL_STATE} ne "false") {
            printf("Adaptive Firewall will be enabled");
            if(${DEBUG}){
                print("cmd := " . qq(${AFCTL} -f ) . "\n");
                print("cmd := " . qq(${SERVERCTL} enable service=com.apple.afctl) . "\n");
            } else {
                qx(${AFCTL} -f );
                qx(${SERVERCTL} enable service=com.apple.afctl);
            }

            #qx(${LAUNCHCTL} load -w ${TARGET_AFCTL_LAUNCHD_PREFERENCES});
            #if (${DEBUG}) { printf("%s\n", qq($LAUNCHCTL load -w ${TARGET_AFCTL_LAUNCHD_PREFERENCES}));	}
		} else {
            printf("Adaptive Firewall will be disabled");
            qx(${SERVERCTL} disable service=com.apple.afctl);

		}
	} else {
		print("must migrate onto a live system\n");
	}
			
	if (${FUNC_LOG}) {printf("restoreAndSetState := E\n");}
}
			
			
################################################################################
# Show proper usage
sub Usage()
{
	print("--purge <0 | 1>   \"1\" means remove any files from the old system after you've migrated them, \"0\" means leave them alone." . "\n");
	print("--sourceRoot <path> The path to the root of the system to migrate" . "\n");
	print("--sourceType <System | TimeMachine> Gives the type of the migration source, whether it's a runnable system or a " . "\n");
	print("                  Time Machine backup." . "\n");
	print("--sourceVersion <ver> The version number of the old system (like 10.6  or 10.7)" . "\n"); 
	print("--targetRoot <path> The path to the root of the new system. Pretty much always \"\/\"" . "\n");
	print("--language <lang> A language identifier, such as \"en.\" Long running scripts should return a description of what they're doing " . "\n");
	print("                  (\"Migrating Open Directory users\"), and possibly provide status update messages along the way. " . "\n");
	print(" " . "\n");
}
