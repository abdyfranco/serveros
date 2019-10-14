#!/usr/bin/perl -w
#
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.

#
# CommonExtras script for RADIUS config files.
#
# This script runs on every Server.app install and needs to handle the various
# types of installs it may encounter.
#


use strict;
use File::Copy;
use File::Temp qw/ :mktemp /;
use Foundation;

sub installDefaultConfig;
sub migrateCertData;
sub migrateNASData;
sub migrateDaemonState;
sub createLogDirIfNeeded;

my $self = "radius_common.pl";
my $serverRoot = "/Applications/Server.app/Contents/ServerRoot";

my $radiusconfig = "$serverRoot/usr/sbin/radiusconfig";
my $serveradmin = "$serverRoot/usr/sbin/serveradmin";

my $radiusDir = "/Library/Server/radius";
my $prevDir = "/Library/Server/Previous";

# Server.app re-install case (either after uninstall or upgrade, no migration).
if (-f "$radiusDir/raddb/radiusd.conf")
{
    print "$self: RADIUS configuration files already present in $radiusDir:  no need to update\n";
}

# Clean install or migration cases.
else
{
    installDefaultConfig;

    # Migration case.
    if (-d "$prevDir/private/etc/raddb")
    {
        print "$self: Migrating RADIUS configuration\n";
        migrateCertData;
        migrateNASData;
        migrateDaemonState;
        print "$self: RADIUS migration complete\n";
    }
    # Clean install case
    else
    {
        # Nothing to do since the base config was already installed.
    }
}

createLogDirIfNeeded;

# Save the version information.
system("$serverRoot/usr/sbin/radiusd -v | /usr/bin/awk '/radiusd: FreeRADIUS Version/ { vers=\$4; sub(\",\",\"\",vers); print vers; }' > $radiusDir/.version");

exit 0;

#
# End of main
#


#
# Populates the radius directory with the default config files.
#
sub installDefaultConfig
{
    if (! -d $radiusDir)
    {
        print "$self: Creating $radiusDir\n";
        system("/bin/mkdir -p -m 0755 \"$radiusDir\"") == 0 or warn "$self: Unable to create directory \"$radiusDir\"\n";
    }

    print "$self: Installing default RADIUS configuration files\n";
    print "$self: Copying $serverRoot$radiusDir to $radiusDir\n";
    system("/usr/bin/ditto $serverRoot/$radiusDir \"$radiusDir\"") == 0 or warn "$self: Unable to copy default config files to \"$radiusDir\"\n";
}


#
# Migrates the certificate data from the old eap.conf to the
# new eap.conf.  Preserves the structure of the new eap.conf (which is
# different from the old - otherwise we'd just copy the file).
#
sub migrateCertData
{
    print "$self: Migrating eap.conf certificate parameters\n";

    # 0) my $tmpFileName = mktemp();
    # 1) run radiusconfig -gtconfigxml $prevDir/private/etc/raddb > $tmpFileName
    # 2) read tmpFileName into dict
    # 3) extract eap.conf dict from main dict.
    # 4) extract private_key_file, certificate_file, CA_file from eap.conf dict.
    # 5) radiusconfig -installcerts $privateKeyFile $certFile $caFile

    # Convert the old config into xml file.  Since the prevDir likely contains
    # a space, quote the raddb path when calling radiusconfig -getconfigxml.
    my $tmpFileName = mktemp("/var/tmp/radxml.XXXXXX");
    my $cmd = "$radiusconfig -getconfigxml \"$prevDir/private/etc/raddb\" 1> $tmpFileName";
    if (system($cmd) != 0)
    {
        warn "$self: Command failed: $cmd\n";
        return;
    }

    # Read the xml file into a dictionary and extract the needed keys.
    my $radDict = NSDictionary->dictionaryWithContentsOfFile_($tmpFileName);

    unlink $tmpFileName;

    if (!$radDict || !$$radDict)
    {
        warn "$self: Unable to create a dictionary from the radius config xml file\n";
        return;
    }

    # Extract eap.conf dictionary from main dictionary.
    print "$self: Extracting eap.conf from previous radius config\n";
    my $eapDict =$radDict->objectForKey_("eap.conf");
    if (!$eapDict || !$$eapDict)
    {
        warn "$self: Unable to extract eap.conf from radius config\n";
        return;
    }

    #
    # Extract the certificate parameters from the old config and stuff them into the new config.
    #

    print "$self: Extracting certificate parameters from previous eap.conf\n";

    # Extract the certificate file.
    my $certFile = $eapDict->objectForKey_("certificate_file");
    if (!$certFile || !$$certFile)
    {
        warn "$self: Couldn't find certificate_file in eap.conf\n";
        return;
    }
    elsif ($certFile->length() == 0)
    {
        print "$self: certficate_file is set to an empty string; no need to migrate certificate parameters\n";
        return;
    }

    my $certFileName = $certFile->UTF8String();

    # Extract the private key file.
    my $keyFile = $eapDict->objectForKey_("private_key_file");
    if (!$keyFile || !$$keyFile)
    {
        warn "$self: Couldn't find private_key_file in eap.conf\n";
        return;
    }
    elsif ($keyFile->length() == 0)
    {
        print "$self: private_key_file is set to an empty string; no need to migrate certificate parameters\n";
        return;
    }

    my $keyFileName = $keyFile->UTF8String();

    # The CA_file is optional.  Migrate it if present.
    my $caFileName = "";
    my $caFile = $eapDict->objectForKey_("CA_file");
    if ($caFile && $$caFile && $caFile->length() != 0)
    {
        $caFileName = $caFile->UTF8String();
    }

    # Set $RANDFILE so 'radiusconfig -installcerts' has somewhere to put
    # the random data.
    $ENV{'RANDFILE'} = '$radiusDir/certs/.rnd';

    # Add the certificate file parameters to the new eap.conf.
    print "$self: Adding certificate and key file names to eap.conf: $keyFileName $certFileName $caFileName\n";
    $cmd = "$radiusconfig -installcerts $keyFileName $certFileName $caFileName";
    system($cmd) == 0 or warn "$self: Command failed: $cmd\n";

    # Migrate the private key password.
    my $keyPasswd = $eapDict->objectForKey_("private_key_password");
    if (!$keyPasswd || !$$keyPasswd)
    {
        warn "$self: Couldn't find private_key_password in eap.conf\n";
    }
    elsif ($keyPasswd->length() == 0)
    {
        print "$self: private_key_password is set to an empty string; no need to migrate it\n";
    }
    else
    {
        # Set the private key password in the new eap.conf.
        print "$self: Setting the private key password in eap.conf\n";
        my $keyPasswdStr = $keyPasswd->UTF8String();
        $cmd = "/bin/echo $keyPasswdStr | $radiusconfig -setcertpassword -q";
        system($cmd) == 0 or warn "$self: Command failed: $radiusconfig -setcertpassword\n";
    }

    print "$self: Finished migrating eap.conf certificate parameters\n";
}
    

#
# Migates the NAS table & the ssid table from old system
# to new system.
#
sub migrateNASData
{
    my $nasTable     = "sqlite_radius_client_database";
    my $prevNASTable = "$prevDir/private/etc/raddb/$nasTable";
    my $newNASTable  = "$radiusDir/raddb/$nasTable";
    if (-e $prevNASTable)
    {
        print "$self: Migrating $nasTable from $prevNASTable to $newNASTable\n";
        copy("$prevNASTable", "$newNASTable") or warn "$self: copying $nasTable failed: $!\n";
    }

    my $ssidTable     = "ssid_table.plist";
    my $prevSSIDTable = "$prevDir/private/etc/raddb/$ssidTable";
    my $newSSIDTable  = "$radiusDir/raddb/$ssidTable";
    if (-e $prevSSIDTable)
    {
        print "$self: Migrating $ssidTable from $prevSSIDTable to $newSSIDTable\n";
        copy("$prevSSIDTable", "$newSSIDTable") or warn "$self: copying $ssidTable failed: $!\n";
    }
}

#
# Migrates the daemon state from the old launchd file.
#
sub migrateDaemonState
{
    my $dboverridesName = "$prevDir/private/var/db/launchd.db/com.apple.launchd/overrides.plist";
    if (!-e $dboverridesName)
    {
        print "$self: No need to set radiusd's state: no launchd overrides file\n";
        return;
    }

    my $dboverridesDict = NSDictionary->dictionaryWithContentsOfFile_($dboverridesName);
    if (!$dboverridesDict || !$$dboverridesDict)
    {
        print "$self: Not setting radiusd's state: unable to read launchd overrides file\n";
        return;
    }

    my $freeradiusEntry = $dboverridesDict->objectForKey_("org.freeradius.radiusd");
    if (!$freeradiusEntry || !$$freeradiusEntry)
    {
        print "$self: Not setting radiusd's state: no entry for radiusd in the launchd overrides file\n";
        return;
    }

    my $disabled = $freeradiusEntry->objectForKey_("Disabled"); 
    if (!$disabled || !$$disabled)
    {
        print "$self: Not setting radiusd's state: no disabled key for readiusd in the launchd overrides file\n";
        return;
    }

    my $response = $disabled->boolValue() ? system("$serveradmin stop radius") : system("$serveradmin start radius");
    if (!$response || !$$response)
    {
        printf "$self: %s radiusd\n", $disabled->boolValue() ? "Stopped" : "Started";
    }
    else
    {
        printf "$self: Unable to %s radiusds\n", $disabled->boolValue() ? "stop" : "start";
    }
}


sub createLogDirIfNeeded
{
    print "$self: Ensuring radius log directory exists\n";

    my $tmpFileName = mktemp("/var/tmp/radxml.XXXXXX");
    my $cmd = "$radiusconfig -getconfigxml 1> $tmpFileName";
    if (system($cmd) != 0)
    {
        warn "$self: Command failed: $cmd\n";
        return;
    }

    # Read the xml file into a dictionary and extract the needed keys.
    my $confDict = NSDictionary->dictionaryWithContentsOfFile_($tmpFileName);

    unlink($tmpFileName);

    if (!$confDict || !$$confDict)
    {
        warn "$self: Unable to create a dictionary from the radius config xml file\n";
        return;
    }

    # Extract radiusd.conf dictionary from main dictionary.
    my $radDict = $confDict->objectForKey_("radiusd.conf");
    if (!$radDict || !$$radDict)
    {
        warn "$self: Unable to extract radiusd.conf from radius config\n";
        return;
    }

    # Find the log directory path.
    my $logDir = $radDict->objectForKey_("logdir");
    if (!$logDir || !$$logDir)
    {
        warn "$self: Unable to extract log directory from radius config\n";
        return;
    }

    if ($logDir->length() == 0)
    {
        warn "$self: No log directory found in the radius config\n";
        return;
    }

    my $path = $logDir->UTF8String();
    $cmd = "/usr/bin/install -d -m 0700 $path";
    system($cmd) == 0 or warn "$self: Command failed: $cmd\n";
}
