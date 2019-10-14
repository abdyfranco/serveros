#!/usr/bin/perl -w
#
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.

#
# This script is run by the certupdate tool.  It will be called thusly:
#    radius_cert_update.pl remove cert_path cert_ref
#    radius_cert_update.pl replace old_cert_path old_cert_ref new_cert_path new_cert_ref
#
# The refs may be 0x00 to indicate they're not set, and this script current ignores the refs.
#
# Exit codes mean something to to caller:
#    0 == don't care or success.
#    1 == don't delete the old cert.
#    2 == an error occurred
#


use strict;
use Sys::Syslog qw(:standard :macros);
use Foundation;

my $self = "radius_cert_update.pl";
my $serverRoot = "/Applications/Server.app/Contents/ServerRoot";
my $radiusconfig = "$serverRoot/usr/sbin/radiusconfig";
my $certadmin = "$serverRoot/usr/sbin/certadmin";
my $serveradmin = "$serverRoot/usr/sbin/serveradmin";


sub usage;
sub logmsg;
sub replace;
sub remove;


my $rc = 0;
my $argc = @ARGV;

openlog($self, 'pid', 'user') if (! -t STDOUT);

if ($< != 0)
{
    logmsg("err", "Must be root to run $self\n");
    $rc = 2;
}
elsif ($argc == 0)
{
    logmsg("err", "No command supplied.\n");
    usage();
    $rc = 2;
}
elsif ($ARGV[0] =~ "replace")
{
    if ($argc != 5)
    {
        logmsg("err", "Invalid number of arguments: expected 5 for a replace command, got $argc\n");
        usage();
        $rc = 2;
    }
    else
    {
        $rc = replace($ARGV[1], $ARGV[3]);
    }
}
elsif ($ARGV[0] =~ "remove")
{
    if ($argc != 3)
    {
        logmsg("err", "Invalid number of arguments: expected 3 a remove command, got $argc\n");
        usage();
        $rc = 2;
    }
    else
    {
        $rc = remove($ARGV[1]);
    }
}
else
{
    logmsg("err", "Invalid command: $ARGV[0]\n");
    usage();
    $rc = 2;
}

closelog() if (! -t STDOUT);

exit $rc;

#
# End of main
#


# Log messages to the terminal if running in a terminal, or to syslog
# if not in a terminal.
sub logmsg
{
    my $level = $_[0];
    my $msg = $_[1];

    if (-t STDOUT)
    {
        if ( $msg !~ /.*\n/ )
        {
            $msg = "$msg\n";
        }

        if ($level =~ "err" || $level =~ "warning")
        {
            warn $msg;
        }
        else
        {
            print $msg;
        }
    }
    else
    {
        syslog($level, $msg);
    }
}


sub usage
{
    if (-t STDOUT)
    {
        print "Usage: $self replace <old certificate path> <old certificate keychain reference> <new certificate path> <new certificate keychain reference>\n";
        print "       $self remove <certificate path> <certificate keychain reference>\n";
        print "Specify 0x00 for certificate keychain reference if the reference isn't known or available.\n";
    }
}


# Returns the certificate name in the radius configuration.  If there is
# no certificate in the configuration, or if an error occurs undef is returned.
sub getRadiusConfigCertFileName
{
    my $radConfigString = NSString->stringWithUTF8String_(join('', qx($radiusconfig -getconfigxml)));
    if (!$radConfigString || !$$radConfigString)
    {
        logmsg("err", "Unable to read radius config into a string.\n");
        return;
    }

    my $radConfigData = $radConfigString->dataUsingEncoding_(4);
    if (!$radConfigData || !$$radConfigData)
    {
        logmsg("err", "Unable to convert radius config string into data.\n");
        return;
    }

    my $radDict = NSPropertyListSerialization->propertyListWithData_options_format_error_($radConfigData, 0, 0, 0);
    if (!$radDict || !$$radDict)
    {
        logmsg("err", "Unable to create a dictionary from the radius config data.\n");
        return;
    }

    my $eapDict =$radDict->objectForKey_("eap.conf");
    if (!$eapDict || !$$eapDict)
    {
        logmsg("err", "Unable to extract eap parameters from radius config.\n");
        return;
    }

    my $certFile = $eapDict->objectForKey_("certificate_file");
    if (!$certFile || !$$certFile)
    {
        logmsg("err", "Couldn't find certificate_file in eap.conf\n");
        return;
    }

    return $certFile->UTF8String();
}


# Updates the radius config with the new certificate files and restarts
# radiusd if needed.
sub configureWithNewCert
{
    my $newCertFileName = $_[0];
    $_ = $newCertFileName;
    my $newKeyFileName = s/\.cert\.pem/\.key\.pem/r;
    my $newCAFileName = s/\.cert\.pem/\.chain\.pem/r;

    # Update the config file with the new cert files.
    my $cmd = "$radiusconfig -installcerts \"$newKeyFileName\" \"$newCertFileName\" \"$newCAFileName\"";
    if (system($cmd) != 0)
    {
        logmsg("err", "Unable to update the radius configuration with the new certificate: Command failed: $cmd\n");
        return 2;
    }

    logmsg("notice", "Successfully updated radius to use $newCertFileName.\n");

    # If radiusd is currently running, restart it.
    my $status = qx($serveradmin status radius);
    chomp $status;
    if ($status =~ /RUNNING/)
    {
        logmsg("notice", "Restarting radiusd to pick up the certificate changes.\n");
        $cmd = "$radiusconfig -stop && $radiusconfig -start";
        if (system($cmd) != 0)
        {
            logmsg("err", "Unable to restart radiusd: Command failed: $cmd\n");
            return 2;
        }
    }

    return 0;
}


# Replace the certificate, if need be.  If radius was configured to use the old cert, it should
# switch to using the new cert.
sub replace
{
    my $oldCertFileName = $_[0];
    my $newCertFileName = $_[1];

    logmsg("notice", "Received \"replace $oldCertFileName $newCertFileName\" command.\n");

    my $configCertFileName = getRadiusConfigCertFileName();
    if ($configCertFileName !~ $oldCertFileName)
    {
        logmsg("notice", "RADIUS is not configured with $oldCertFileName, nothing to replace.\n");
        return 0;
    }

    logmsg("notice", "RADIUS is configured with $oldCertFileName, replacing with $newCertFileName.\n");

    my $rc = configureWithNewCert($newCertFileName);
    return $rc;
}


# Remove the cert if need be.  The specified cert has been deleted.  If radius was using that
# cert, don't remove it; tell the caller to keep the cert.
sub remove
{
    my $removedCertFileName = $_[0];

    logmsg("notice", "Received \"remove $removedCertFileName\" command.\n");

    my $configCertFileName = getRadiusConfigCertFileName();
    if ($configCertFileName !~ $removedCertFileName)
    {
        logmsg("notice", "RADIUS is not configured with $removedCertFileName, nothing to remove.\n");
        return 0;
    }

    # radiusd requires a certificate.  Use the default certificate if available.
    my $defaultCertFileName = qx($certadmin --default-certificate-path);
    chomp($defaultCertFileName);
    if (! -e "${defaultCertFileName}")
    {
        logmsg("warning", "Not removing $removedCertFileName from the radius configuration: there is no default certificate to use in its place.\n");
        return 1;
    }

    logmsg("notice", "RADIUS is configured with $removedCertFileName, replacing with $defaultCertFileName.\n");

    my $rc = configureWithNewCert($defaultCertFileName);
    return $rc;
}
