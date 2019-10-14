#!/bin/sh

#  Copyright (c) 2013 Apple Inc. All rights reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.

#
# CommonExtras script for DNS config files.
#
# This script runs on every Server.app install and needs to handle the various
# types of installs it may encounter.
#

serverRoot=/Applications/Server.app/Contents/ServerRoot

serverAdmin=$serverRoot/usr/sbin/serveradmin

dnsDir=/Library/Server/named
prevDir=/Library/Server/Previous

self=`basename $0`

# Server.app re-install case (either after uninstall or upgrade, no migration).
if [ -f $dnsDir/named.conf ] ; then
    echo "$self: DNS configuration files already present in $dnsDir:  no need to update"

# Clean install or migration cases.
else
    if [ ! -d $dnsDir ]; then
        echo "$self: Creating $dnsDir"
        /bin/mkdir -p -m 0755 $dnsDir
    fi

    # Migration case.
    if [ -e $prevDir/private/etc/named.conf ] ; then
        echo "$self: Migrating DNS configuration files from $prevDir"
        $serverAdmin command dns:command = migrate

    # Clean install case.
    else
        echo "$self: Installing default DNS configuration files"
        echo "$self: Copying Server.app's default named.conf to $dnsDir"
        /usr/bin/ditto $serverRoot/private/etc/named.conf $dnsDir

        echo "$self: Copying Server.app's default zone files to $dnsDir"
        /usr/bin/ditto $serverRoot/var/named $dnsDir

        echo "$self: Creating rndc key"
        $serverAdmin command dns:command = createRndcKeys
    fi
fi

# Ensure the entry was removed from the overrrides.plist.
/usr/libexec/PlistBuddy -c "Delete org.isc.named dict" /var/db/launchd.db/com.apple.launchd/overrides.plist >& /dev/null
if [ $? == 0 ] ; then
    echo "$self: Removed org.isc.named entry from launchd's overrides plist"
fi

# Save the version information.
$serverRoot/usr/sbin/named -v > $dnsDir/.version

exit 0
