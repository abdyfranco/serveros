#!/usr/bin/perl -w

#  enableBootpd.pl
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
# Script enables the Bootpd job if either dhcp or netboot were enabled on the previous system. assumes that the
# /private/etc/bootpd.plist has already been copied. It also assumes that the service should be on if the config is valid
# with no regard to wether or not the launchd job was enabled on the old system.
#

use strict;
use Getopt::Long;
use Foundation;

sub serviceIsEnabled;

my $scriptName="enableBootpd.pl";


#
# If either netboot or dhcp are enabled in bootpd.plist, then start the service.
# Otherwise don't have to do anything because servermgrd will handle it when
# the services get enabled.
#
my $bootpPlist = "/etc/bootpd.plist";
my $launchdPlist = "/System/Library/LaunchDaemons/bootps.plist";

#
# Only run if bootpd.plist extsis
#

if (-e $bootpPlist) {
    my $bootpDict  = NSDictionary->dictionaryWithContentsOfFile_("$bootpPlist");

    if (!$bootpDict || !$$bootpDict) {
        warn "$scriptName: Couldn't create dictionary from $bootpPlist\n";
    } else {
        my $dhcpEnabled = serviceIsEnabled $bootpDict, "DHCP", "dhcp_enabled";
        my $netbootEnabled = serviceIsEnabled $bootpDict, "NetBoot", "netboot_enabled";
        my $otherEnabled = serviceIsEnabled $bootpDict, "DHCPx", "ignore_allow_deny";
        if ($dhcpEnabled || $netbootEnabled || $otherEnabled) {
            print "$scriptName: DHCP and/or NetBoot are enabled in "
            . "$bootpPlist: loading $launchdPlist\n";

            # just to make sure (if bootpd is already running) that the migrated settings take effect
            system("/usr/bin/killall -HUP bootpd 2> /dev/null");

            system("/bin/launchctl load -w \"$launchdPlist\"") == 0
                or warn "$scriptName: launchctl load failed: $!\n";
        } else {
            print "$scriptName: DHCP and NetBoot are both disabled in "
            . "$bootpPlist: not loading $launchdPlist\n";
        }
        exit 0;
    }
    exit 1;
}
print "$scriptName: $bootpPlist is not present, nothing to do\n";
exit 0;

##########################################

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





