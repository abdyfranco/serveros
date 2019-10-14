#!/usr/bin/perl
# Author:: Apple Inc.
# Documentation:: Apple Inc.
# Copyright (c) 2013 Apple Inc. All Rights Reserved.
#
# ChatServer
# 70-message_server_common_extra.pl
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.

#
# Copies the default jabberd and Rooms config files into /Library/Server during promotion
#

use strict;
use warnings;

my $PLISTBUDDY = '/usr/libexec/PlistBuddy';
my $SQLITE3 = '/usr/bin/sqlite3';
my $bundle_config_path = '/Library/Server/Messages/Config/com.apple.messageserver.plist';
my $bundle_config_path_obsolete = '/Library/Preferences/com.apple.messageserver.plist';
my $default_database_location = '/Library/Server/Messages/Data/sqlite/jabberd2.db';

# If this is a migration, the MigrationExtra will have done everything necessary.
if ( -d "/Library/Server/Previous/Library/Server/iChat" || -d "/Library/Server/Previous/private/var/jabberd" ) {
	print "Appears to be a migration; nothing to do.\n";
	exit 0;
}

# Install template config files
system '/Applications/Server.app/Contents/ServerRoot/usr/libexec/copy_message_server_config_files.sh';

# Update any existing database 
my $database_location = $default_database_location;

my $bundle_config;
if (-e $bundle_config_path) {
    $bundle_config = $bundle_config_path;
}
elsif (-e $bundle_config_path_obsolete) {
    # Updating from an older build
    $bundle_config = $bundle_config_path_obsolete;
}

if (defined $bundle_config) {
	my $database_location = qx(${PLISTBUDDY} -c "Print :jabberdDatabasePath" "${bundle_config}");
	chomp $database_location;
	if (! -e $database_location) {
		print "Error: found bundle config file, but could not find database";
		$database_location = $default_database_location;
	}
}

if (! -e $database_location) {
	# Most likely a fresh install
	exit 0;
}

# Create the autobuddy-guids table, new for 
my $ret = qx { $SQLITE3 $database_location "SELECT name FROM sqlite_master WHERE type='table' AND name='autobuddy-guids';" };
chomp $ret;
if ($ret ne 'autobuddy-guids') {
	my $SQLITE;
	$ret = open $SQLITE, "|$SQLITE3 \"$database_location\"";
	unless ($ret) {
		print "Error, could not open database file \"$database_location\" using $SQLITE3 : $!";
		exit 1;
	}

	print $SQLITE <<"EOF";
CREATE TABLE "autobuddy-guids" (
    "guid" TEXT NOT NULL,
    "object-sequence" INTEGER PRIMARY KEY );
EOF
	close $SQLITE || print "Error, $SQLITE3 returned an error.  Adding new tables to jabberd database possibly failed.";
}

system '/Applications/Server.app/Contents/ServerRoot/usr/sbin/serveradmin', 'settings', 'jabber';
exit 0;