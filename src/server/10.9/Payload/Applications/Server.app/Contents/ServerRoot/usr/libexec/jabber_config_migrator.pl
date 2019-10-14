#!/usr/bin/perl -w
# Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.

# Migrate a 10.6,10.7,10.8 configuration to 10.8

use Getopt::Std;
use File::Copy;
use File::Basename;
use XML::Simple;
use strict;

my $DEBUG = 0;
my $SERVERADMIN = "/Applications/Server.app/Contents/ServerRoot/usr/sbin/serveradmin";
my $MKTEMP_PATH = "/usr/bin/mktemp";
my $logPath = "/Library/Logs/Migration/jabbermigrator.log";
my $MKDIR_PATH = "/bin/mkdir";
my $PLISTBUDDY = "/usr/libexec/PlistBuddy";
my $CERT_PATH = "/etc/certificates";

sub usage {
	print "This script handles configuration migration to 10.8 server.\n";
	print "It uses servermgr_jabber to perform the necessary changes to jabberd2 config files.\n\n";
	print "Usage:  $0 [-d] [-c path] [-s version]\n";
	print "Flags:\n";
	print " -d: Debug mode.\n";
	print " -c <path>: Source jabberd config file to use. Should be a \"com.apple.ichatserver.plist\" or\n";
	print "            \"com.apple.messageserver.plist\" for 10.6, 10.7, 10.8 (REQUIRED)\n";
	print " -s <source version>: Source OS version. \"10.6\", \"10.7\", \"10.8\" supported. (REQUIRED)\n";
	print " -?, -h: Show usage info.\n";
}

sub log_message
{
	open(LOGFILE, ">>$logPath") || die "$0: cannot open $logPath: $!";
	my $time = localtime();
	print LOGFILE "$time: ". basename($0). ": @_\n";
	print "@_\n" if $DEBUG;
	close(LOGFILE);
}

sub bail
{
	&log_message(@_);
	&log_message("Aborting!");
	exit 1;
}


############ MAIN
if (! -d dirname($logPath) ) {
	my $logDir = dirname($logPath);
	qx{ $MKDIR_PATH -p $logDir };
	if ($? != 0) {
		&log_message("\"$MKDIR_PATH -p $logDir\" returned failure status $?");
	}
}

my %opts;
getopts('ds:c:?h', \%opts);

if (defined $opts{'?'} || defined $opts{'h'}) {
	&usage;
	exit 0;
}

if (defined $opts{'d'}) {
	$DEBUG = 1;
}

my $src_ver;
if (defined $opts{'s'}) {
	my $tmp_src_ver = $opts{'s'};
	if ($opts{'s'} =~ /^10\.6/) {
		&log_message("Treating source OS as 10.6.x");
		$src_ver = "10.6";
	} elsif ($opts{'s'} =~ /^10\.7/) {
		&log_message("Treating source OS as 10.7.x");
		$src_ver = "10.7";
	} elsif ($opts{'s'} =~ /^10\.8/) {
		&log_message("Treating source OS as 10.8.x");
		$src_ver = "10.8";
	} else {
		&bail("Unrecognized source OS version specified, don't know how to parse the source config file. Aborting.\n");
	}
} else {
	&bail("Source OS version was not specified, aborting.\n");
}

my $source_config = "";
if (defined $opts{'c'} && $opts{'c'} ne "") {
	$source_config = $opts{'c'};
} else {
	&bail("You must specify the source configuration file to use, aborting");
}

my $res;
&log_message("Importing settings from file: $source_config");
my $xs1 = XML::Simple->new (KeepRoot => 1);
my $doc = $xs1->XMLin($source_config);
my @keys;
for (my $i = 0; (defined $doc->{plist}->{dict}->{key}->[$i]); $i++) {
	push(@keys, $doc->{plist}->{dict}->{key}->[$i]);
	if ($DEBUG) { print "found key: ".$doc->{plist}->{dict}->{key}->[$i]."\n"; }
}

my $tmpname;
for (my $i = 0; $i < 5; $i++) {
	$tmpname = qx{ $MKTEMP_PATH /tmp/jabber_migration.XXXXXXXXXXXXXXXXXXXXXXXX };
	chomp($tmpname);
	if (-e $tmpname) {
		last;
	}
	if ($i == 4) {
		&bail("ERROR: Cannot create temporary file: $tmpname");
	}
}

open(OUT, ">$tmpname") || &bail("ERROR: Could not open file $tmpname: $!");

my $ret;
NEXTKEY: foreach my $key (@keys) {
	if ($key eq "") { next; };
	$ret = qx { $PLISTBUDDY -c "Print :$key:" "$source_config" };
	if ($DEBUG) { print "DEBUG: $PLISTBUDDY output: $ret\n"; }
	chomp($ret);
	my @lines = split("\n", $ret);
	if ($ret eq "" || $lines[0] =~ /Does Not Exist/) {
		&log_message("ERROR: PlistBuddy problem getting value for key \"$key\" from file \"$source_config\", it returned:\n$ret\n");
		next;
	}

	# We do not want to carry over the paths for data - they should already be defined for the target system
	# and may be changed manually post-migration if desired
	if ($key eq "dataLocation" ||
				$key eq "jabberdDatabasePath" ||
				$key eq "savedChatsLocation") {
		next;
	}

	# The plugin should ensure that the migrated "hosts" values are duplicated into hostsCommaDelimitedString.
	if ($key eq "hostsCommaDelimitedString" && ($src_ver eq "10.7" || $src_ver eq "10.8")) {
		next;
	}

	if ($#lines == 0) {
		$lines[0] =~ s/\s//g;
		if ($lines[0] !~ /^\d+$/) {
			# quote strings, don't quote numbers, to prevent plugin writeSettings failure
			$lines[0] = "\"".$lines[0]."\"";
		}
		print OUT "jabber:$key = $lines[0]\n";
	} else {
		# We assume this output from PlistBuddy in the case of arrays:
		#Array {
		#	jabber.org
		#	apple.com
		#}
		if ($lines[0] =~ /^Array \{$/) {
			for (my $i = 1; $i < $#lines; $i++) {
				$lines[$i] =~ s/\s//g;
				if ($lines[$i] !~ /^\d+$/) {
					# quote strings, don't quote numbers, to prevent plugin writeSettings failure
					$lines[$i] = "\"".$lines[$i]."\"";
				}
				print OUT "jabber:$key:_array_index:".($i-1)." = $lines[$i]\n";
			}
		} else {
			&log_message("Warning: unexpected output/data type in source configuration:\n@lines");
			next;
		}
	}
} ## NEXTKEY

$ret = qx { $SERVERADMIN settings < "$tmpname" };
unlink($tmpname);

&log_message("Importing settings from file: $source_config");

&log_message("New servermgr_jabber settings:\n$ret");
&log_message("Upgrade completed successfully.");
