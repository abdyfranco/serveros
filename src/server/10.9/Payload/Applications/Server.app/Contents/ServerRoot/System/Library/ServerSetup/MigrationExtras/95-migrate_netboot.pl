#!/usr/bin/perl -w
#
# Post-install migration script for DHCP/NetBoot
#                                                                                                                                                         
# component: servermgr_netboot
#
# Copyright © 2012-2013 Apple Inc. All rights reserved.

use strict;
use Getopt::Long;
use File::Copy;
use Foundation;


sub migrateLeopardConfigData;
sub migrateCommonData;
sub migrateLaunchdPlistAndLoad;
sub serviceIsEnabled;


my $scriptName="95-migrate_netboot.pl";

my $usage = "Usage: $scriptName --sourceRoot <path> --targetRoot <path> [--purge <0|1>] [--sourceVersion <vers>] "
. "[--sourceType <System | TimeMachine>] [--language <lang>]\n"
. "\t --purge <0 | 1>       '1' means remove any files from the old system after you've migrated them.\n"
. "\t                       '0' means leave them alone.\n"
. "\t --sourceRoot <path>    The path to the root of the system to migrate.\n"
. "\t --sourceType <System | TimeMachine>   Gives the type of the migration source, whether it's a runnable\n"
. "\t                                       system or a Time Machine backup.\n"
. "\t --sourceVersion <ver> The version number of the old system (like 10.6.8 or 10.7).\n"
. "\t --targetRoot <path>   The path to the root of the new system. Pretty much always \"/\".\n"
. "\t --language <lang>     A language identifier, such as \"en\".\n";

my $sourceRoot = "";
my $targetRoot = "";
my $purge = 0;
my $sourceVersion = "";
my $sourceType = "";
my $language = "en";

my $result = GetOptions("sourceRoot=s"    => \$sourceRoot,
                        "targetRoot=s"    => \$targetRoot,
                        "purge=i"         => \$purge,
                        "sourceVersion=s" => \$sourceVersion,
                        "sourceType=s"    => \$sourceType,
                        "language=s"      => \$language);

die $usage if !$result;
die "--sourceRoot is a required option\n" . $usage if ($sourceRoot eq "");
die "--targetRoot is a required option\n" . $usage if ($targetRoot eq "");
die "--sourceVersion is a required option\n" . $usage if ($sourceVersion eq "");


print "$scriptName: Migrating DHCP and NetBoot configuration...\n";

my $bootpPlist = "etc/bootpd.plist";
my $bootpTab   = "etc/bootptab";
my $tftpDir    = "private/tftpboot";

if ($sourceVersion =~ /10\.[6789]/) {
    migrateLeopardConfigData;
    migrateCommonData;
}
else {
    print "$scriptName: Migrating DHCP and NetBoot data from $sourceVersion to 10.9 is not supported\n";
}

print "$scriptName: DHCP and NetBoot migration complete\n";

exit 0;

#
# End of main
#




#
# Function to migrate DHCP/NetBoot config data from 10.6.x to 10.9
#
sub migrateLeopardConfigData
{
    #
    # For Leopard migration, need to copy bootpd.plist & bootptab.  If the static
    # IP addresses were kept in OpenDirectory, those will get migrated by the
    # OD migrator.
    #
    
    if (-e "$sourceRoot/private/$bootpPlist") {
        print "$scriptName: migrating $bootpPlist\n";
        copy("$sourceRoot/private/$bootpPlist", "$targetRoot/$bootpPlist")
            or warn "$scriptName: copying $bootpPlist failed: $!\n";
    }
    
    if (-e "$sourceRoot/private/$bootpTab") {
        print "$scriptName: migrating $bootpTab\n";
        copy("$sourceRoot/private/$bootpTab", "$targetRoot/$bootpTab")
            or warn "$scriptName: copying $bootpTab failed: $!\n";
    }
}


#
# Function to migrate data that is common to all previous systems
#
sub migrateCommonData
{
    if (-e "$sourceRoot/$tftpDir") {
        print "$scriptName: migrating $tftpDir\n";

        # Use ditto because the contents of the the tftpboot dir contains symlinks.
        # We want to preserve the symlink and not copy the file the file it points to.
        system("/usr/bin/ditto \"$sourceRoot/$tftpDir\" \"$targetRoot/$tftpDir\"") == 0
            or warn "$scriptName: copying $tftpDir failed: $!\n";
    }

    migrateLaunchdPlistAndLoad;
}


#
# Function to migrate launchd data and start the service if either DHCP or
# NetBoot is enabled.
#
sub migrateLaunchdPlistAndLoad
{
    #
    # Preserve the existing launchd plist.
    #
    my $launchdPlist = "System/Library/LaunchDaemons/bootps.plist";
    if (-e "$sourceRoot/$launchdPlist") {
        print "$scriptName: migrating $launchdPlist\n";
        copy("$sourceRoot/$launchdPlist", "$targetRoot/$launchdPlist")
            or warn "$scriptName: copying $launchdPlist failed: $!\n";
    }    
    
    
    #
    # If either netboot or dhcp are enabled in bootpd.plist, then start the service.
    # Otherwise don't have to do anything because servermgrd will handle it when
    # the services get enabled.
    #
    my $bootpDict  = NSDictionary->dictionaryWithContentsOfFile_("$targetRoot/$bootpPlist");
    if (!$bootpDict || !$$bootpDict) {
        warn "$scriptName: Couldn't create dictionary from $targetRoot/$bootpPlist\n";
    }
    else {
        my $dhcpEnabled = serviceIsEnabled $bootpDict, "DHCP", "dhcp_enabled";
        my $netbootEnabled = serviceIsEnabled $bootpDict, "NetBoot", "netboot_enabled";
        if ($dhcpEnabled || $netbootEnabled) {
            print "$scriptName: DHCP and/or NetBoot are enabled in "
            . "$targetRoot/$bootpPlist: loading $targetRoot/$launchdPlist\n";
            
            system("/bin/launchctl load -w \"$targetRoot/$launchdPlist\"") == 0
                or warn "$scriptName: launchctl load failed: $!\n";

			my $tftpServicePath = "System/Library/LaunchDaemons/tftp.plist";
            system("/bin/launchctl load -w \"$targetRoot/$tftpServicePath\"") == 0
				or warn "$scriptName: tftp load failed: $!\n";
        }
        else {
            print "$scriptName: DHCP and NetBoot are both disabled in "
            . "$targetRoot/$bootpPlist: not loading $targetRoot/$launchdPlist\n";
        }
    }
}


#
# Function to determine if a service is enabled in bootpd.plist.
# @param bootpDict Dictionary representation of bootpd.plist.
# @param serviceName Name of the service; used in error messages.
# @param key Key used to retrieve the service settings from the dictionary.
# @returns 1 if the service is enabled, 0 if not.
#
sub serviceIsEnabled
{
    my $bootpDict = shift;
    my $serviceName = shift;
    my $key = shift;

    my $isEnabled = 0;

    my $value = $bootpDict->objectForKey_($key);
    
    if (!$value || !$$value) {
        print "$scriptName: $key not found in bootpd.plist\n";
    }
    else {
        # dhcp_enabled and netboot_enable can be either a boolean or an array of
        # interfaces on which the serivce is enabled.
        if ($value->isKindOfClass_(NSArray->class())) {
            if ($value->count() > 0) {
                $isEnabled = 1;
                my $count = $value->count();
                print "$scriptName: $serviceName is enabled on $count interface" . ($count == 1 ? "" : "s") . "\n";
            }
            else {
                print "$scriptName: $serviceName interface array is empty - not enabled\n";
            }
        }
        else {
            # It's a boolean.
            $isEnabled = $value->boolValue();
            print "$scriptName: $serviceName is " 
                . ($isEnabled ? "enabled" : "disabled")
                . " for all interfaces\n";
        }
    }

    return $isEnabled;
}

    
