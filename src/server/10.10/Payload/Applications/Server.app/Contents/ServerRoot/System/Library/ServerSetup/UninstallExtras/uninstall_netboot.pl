#!/usr/bin/perl -w

#  uninstall_netboot.pl
#  servermgr_netboot
#

# Copyright (c) 2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#

use strict;
use Getopt::Long;
use Foundation;

sub serviceIsEnabled;

my $scriptName = "uninstall_netboot.pl";
my $bootpPlist = "/etc/bootpd.plist";
my $bootpdLaunchdPlist = "/System/Library/LaunchDaemons/bootps.plist";
my $tftpLaunchdPlist = "/System/Library/LaunchDaemons/tftp.plist";

# data paths
my $httpNetBootPath = "/Library/Server/Web/Data/Sites/Default/NetBoot";
my $tftpNetBootPath = "/private/tftpboot/NetBoot";
my $serviceDataPath = "/Library/Server/NetInstall";
my $savedClientsPath = "$serviceDataPath/ClientData";
my $savedImagesPath = "$serviceDataPath/ImageData";

print "httpNetBootPath = $httpNetBootPath\n";
print "tftpNetBootPath = $tftpNetBootPath\n";
print "serviceDataPath = $serviceDataPath\n";
print "savedClientsPath = $savedClientsPath\n";
print "savedImagesPath = $savedImagesPath\n";


#
# unload the tftp job
#
system("/bin/launchctl unload -w \"$tftpLaunchdPlist\"") == 0
or warn "$scriptName: launchctl TFTP unload failed: $!\n";

# Create our service directory

system("/bin/mkdir \"$serviceDataPath\" > /dev/null 2>&1");
print "/bin/mkdir \"$serviceDataPath\" > /dev/null 2>&1\n";

# Clean up the data stores for re-promotion

system("/bin/rm \"$savedClientsPath\" > /dev/null 2>&1");
print "/bin/rm \"$savedClientsPath\" > /dev/null 2>&1\n";
system("/bin/rm \"$savedImagesPath\" > /dev/null 2>&1");
print "/bin/rm \"$savedImagesPath\" > /dev/null 2>&1\n";

# Remove the TFTP NetBoot folder and any links
if ( -d $tftpNetBootPath ){
    system("/bin/rm -r \"$tftpNetBootPath\"");
    print "/bin/rm -r \"$tftpNetBootPath\"\n";
}

# Remove the HTTP NetBoot folder and any links
if ( -d $httpNetBootPath){
    system("/bin/rm -r \"$httpNetBootPath\"");
    print "/bin/rm -r \"$httpNetBootPath\"\n";
}


# Look for any /Library/NetBoot folders and remove the share links, first saving the share data

my $sharepoint = "";
my $linkdata = "";
open(my $savedClients, ">>$savedClientsPath");
open(my $savedSharepoints, ">>$savedImagesPath");

while (defined($sharepoint = </Volumes/*/Library/NetBoot>)){
    if (-e "$sharepoint/.clients") {
        $linkdata = readlink "$sharepoint/.clients";
        print $savedClients "$sharepoint/$linkdata" . "\n";
        system("/bin/rm \"$sharepoint/.clients\"");
    }
    if (-e "$sharepoint/.sharepoint") {
        $linkdata = readlink "$sharepoint/.sharepoint";
        print $savedSharepoints "$sharepoint/$linkdata\n";
        system("/bin/rm \"$sharepoint/.sharepoint\"");
    }
}
close($savedClients);
close($savedSharepoints);

#
# Take care of the bootpd sharing issues.
#

my $bootpDict  = NSMutableDictionary->dictionaryWithContentsOfFile_("$bootpPlist");

if (!$bootpDict || !$$bootpDict) {
    warn "$scriptName: Couldn't create dictionary from $bootpPlist\n";
    exit 1;
}
#
# If the netboot_enabled key is present, copy it into the netboot_disabled key
# delete the netboot_enabled key
#

my $portArray = $bootpDict->objectForKey_("netboot_enabled");
#print "the plist" . $bootpDict->description()->UTF8String() . "\n";
if (!$portArray || !$$portArray) {
    print "$scriptName: netboot not enabled in bootpd.plist\n";
} else {
    if ($portArray->isKindOfClass_(NSArray->class())) {
        if ($portArray->count() > 0) {  # netboot was enabled, save off the interface list
            $bootpDict->removeObjectForKey_("netboot_disabled");
            $bootpDict->setObject_forKey_($portArray,"netboot_disabled");
        }
        $bootpDict->removeObjectForKey_("netboot_enabled");
        #print "the plist" . $bootpDict->description()->UTF8String() . "\n";
        $bootpDict->writeToFile_atomically_("/tmp/bootpd.plist.out", 1);
        
        # we made changes, it would be useful to hup bootpd
        print "$scriptName: made changes to $bootpPlist, resetting the service\n";
        system("/usr/bin/killall -HUP bootpd");
        # don't worry if its not running, bootpd is launch on demand
    }
}


#
# Unload the bootpd job if needed
#

my $dhcpEnabled = serviceIsEnabled $bootpDict, "DHCP", "dhcp_enabled";
if ($dhcpEnabled) {
    print "$scriptName: DHCP is enabled in "
    . "$bootpPlist: making no change to  $bootpdLaunchdPlist\n";
    
} else {
    print "$scriptName: No enabled services in "
    . "$bootpPlist: unloading $bootpdLaunchdPlist\n";
    
    system("/bin/launchctl unload -w \"$bootpdLaunchdPlist\"") == 0
    or warn "$scriptName: launchctl bootpd unload failed: $!\n";
}



# all done

exit 0;



#
# utilities
#

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

