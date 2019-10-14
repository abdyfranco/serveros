#!/usr/bin/perl -w

#  disableBootpd.pl
#  servermgr_dhcp, servermgr_netboot
#
#

# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#

#
# Script disables the Bootpd job if neither dhcp or netboot are enabled on the previous system. assumes that the
# /private/etc/bootpd.plist has already been copied. It also assumes that the service should be off if there are no
# other valid reasons to be running in the config file. If evidence of Core OS usage of bootpd is present, do not
# unload the job.
#

use strict;
use Getopt::Long;
use Foundation;

sub serviceIsEnabled;

my $scriptName="disableBootpd.pl";

my $usage = "Usage: $scriptName\n";

system("/usr/bin/syslog -s -l 4 running $scriptName");
#
# On demotion:
#   rename the netboot_enabled array to netboot_disabled
#   if present, copy the ignore_allow_deny array to the dhcp_enabled array
#       else delete the dhcp_enabled array
#
#   if no services are enabled unload the bootpd job
#       else hup the bootpd process to reread the config
#
my $bootpPlist = "/etc/bootpd.plist";
my $launchdPlist = "/System/Library/LaunchDaemons/bootps.plist";
my $bootpDict  = NSMutableDictionary->dictionaryWithContentsOfFile_("$bootpPlist");
my $changedPlist = 0;

if (!$bootpDict || !$$bootpDict) {
    warn "$scriptName: Couldn't create dictionary from $bootpPlist\n";
} else {
    my $netboot = $bootpDict->objectForKey_("netboot_enabled");
    if (!$netboot || !$$netboot) {
        print "$scriptName: netboot was not enabled in bootpd.plist\n";
    } else {
        $bootpDict->setObject_forKey_($netboot, "netboot_disabled");
        $bootpDict->removeObjectForKey_("netboot_enabled");
        $changedPlist = 1;
    }
    
    my $reserved = $bootpDict->objectForKey_("ignore_allow_deny");
    if (!$reserved || !$$reserved) {
        $bootpDict->removeObjectForKey_("dhcp_enabled");
        $changedPlist = 1;
    } else {
        $bootpDict->setObject_forKey_($reserved, "dhcp_enabled");
        $changedPlist = 1;
    }
        
    if($changedPlist)
    {
        print "$scriptName: updating the $bootpPlist file\n";
        $bootpDict->writeToFile_atomically_($bootpPlist, 1);
        
    }
        
    my $dhcpEnabled = serviceIsEnabled $bootpDict, "DHCP", "dhcp_enabled";
    my $netbootEnabled = serviceIsEnabled $bootpDict, "NetBoot", "netboot_enabled";
    my $otherEnabled = serviceIsEnabled $bootpDict, "DHCPx", "ignore_allow_deny";
    if ($dhcpEnabled || $netbootEnabled || $otherEnabled) {
        print "$scriptName: DHCP and/or NetBoot are enabled in "
        . "$bootpPlist: making no change to  $launchdPlist\n";
        print "$scriptName: signaling bootpd to reread the config\n";
        system("/usr/bin/killall -HUP bootpd");

    } else {
        print "$scriptName: No enabled services in "
        . "$bootpPlist: unloading $launchdPlist\n";
        
        system("/bin/launchctl unload -w \"$launchdPlist\"") == 0
        or warn "$scriptName: launchctl unload failed: $!\n";
    }
    exit 0;
}
exit 1;

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
    } else {
        # dhcp_enabled and netboot_enable can be either a boolean or an array of
        # interfaces on which the serivce is enabled.
        # ignore_allow_deny is an array of interfaces that ignore MAC address filtering
        if ($value->isKindOfClass_(NSArray->class())) {
            if ($value->count() > 0) {
                $isEnabled = 1;
                my $count = $value->count();
                print "$scriptName: $serviceName is enabled on $count interface" . ($count == 1 ? "" : "s") . "\n";
            } else {
                print "$scriptName: $serviceName interface array is empty - not enabled\n";
            }
        } else {
            # It's a boolean.
            $isEnabled = $value->boolValue();
            print "$scriptName: $serviceName is " . ($isEnabled ? "enabled" : "disabled") . " for all interfaces\n";
        }
    }

    return $isEnabled;
}





