#!/usr/bin/perl -w
# Author:: Apple Inc.
# Documentation:: Apple Inc.
# Copyright (c) 2012-2013 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
# License:: All rights reserved.
#
# 75_MessageServerRestoreExtra.pl
# RestoreExtra script for Message Server
# Unpack any possible backup data from previous OS backups for consumption by Message Server MigrationExtra

use strict;
use warnings;
use File::Basename 'basename';
use File::Basename 'dirname';
use File::Path 'rmtree';
use XML::Simple;

my $TAR = "/usr/bin/tar";
my $MKDIR = "/bin/mkdir";
my $MKTEMP_PATH = "/usr/bin/mktemp";
my $SQLITE = "/usr/bin/sqlite3";
my $g_log_dir = "/Library/Logs/Migration";
my $g_log_path = $g_log_dir."/message_server_restoreExtra.log";
my $g_src_path = "/Library/Server/Previous/.ServerBackups";
my $g_target_path = "/Library/Server/Previous";


&restore_for_migration_extra;

exit(0);

################################################################################
sub restore_for_migration_extra() {
	# potential files to untar if found:
	my @files_to_unpack = (
		"iChatServer/iChatServer_Rooms.data.tar.gz",
		"iChatServer/iChatServer.conf.tar.gz",
		"MessageServer/MessageServer_Rooms.data.tar.gz",
		"MessageServer/MessageServer.conf.tar.gz"
	);

	foreach my $file (@files_to_unpack) {
		my $file_path = $g_src_path."/".$file;
		if (-e $file_path) {
			if (&run("$TAR -C ${g_target_path} -xvf ${file_path}")) {
				&bail("Error: necessary command failed.  See log for details.");
			}
		}
	}

	# build the jabberd database from SQL
	my $src_data_tarball = "";
	if (-e $g_src_path."/MessageServer/MessageServer.data.tar.gz") {
		$src_data_tarball = $g_src_path."/MessageServer/MessageServer.data.tar.gz";
	} elsif (-e $g_src_path."/iChatServer/iChatServer.data.tar.gz") {
		$src_data_tarball = $g_src_path."/iChatServer/iChatServer.data.tar.gz";
	} else {
		&bail("Error: did not find a source database .tar.gz file for database restoration");
	}
	my $mask = umask;
	umask(077);
	my $dataTmpDir = "";
	for (my $i = 0; $i < 5; $i++) {
		$dataTmpDir = `$MKTEMP_PATH -d /tmp/postgres_restoreExtra_data.XXXXXXXXXXXXXXXXXXXXXXXX`;
		if ($dataTmpDir =~ /failed/) {
			next;
		}
		chomp($dataTmpDir);
		if (-e $dataTmpDir) {
			last;
		}
		if ($i == 4) {
			&bail("Error: Cannot create temporary file:\n${dataTmpDir}");
		}
	}
	umask($mask);
	if (&run("$TAR -C ${dataTmpDir} -xvf ${src_data_tarball}")) {
		rmtree($dataTmpDir);
		&bail("Error: necessary command failed.  See log for details.");
	}
	my $sql_file = "";
	if (-e "${dataTmpDir}/iChatServer_data_backup.sql") {
		$sql_file = "${dataTmpDir}/iChatServer_data_backup.sql";
	} elsif (-e  "${dataTmpDir}/MessageServer_data_backup.sql") {
		$sql_file = "${dataTmpDir}/MessageServer_data_backup.sql";
	} else {
		rmtree($dataTmpDir);
		&bail("Error: could not find SQL file in temp directory for database creation");
	}

	# TODO: we should receive a --sourceVersion arg, and use it to determine database location
	my $sm_config_path = "";
	if (-e "${g_target_path}/private/etc/jabberd/sm.xml") {
		$sm_config_path = "${g_target_path}/private/etc/jabberd/sm.xml";
	} elsif (-e "${g_target_path}/Library/Server/Messages/Config/jabberd/sm.xml") {
		$sm_config_path = "${g_target_path}/Library/Server/Messages/Config/jabberd/sm.xml";
	} else {
		rmtree($dataTmpDir);
		&bail("Error: could not find an sm.xml in temp directory after restoring backup of jabberd configuration");
	}

	my $xs1 = XML::Simple->new (KeepRoot => 1);
	my $doc = $xs1->XMLin($sm_config_path);
	my $target_database_file = "";
	if ($doc->{sm}->{storage}->{sqlite}->{dbname}) {
		$target_database_file = $doc->{sm}->{storage}->{sqlite}->{dbname};
		&log_message("Notice: found database name in sm.xml: ${target_database_file}");
	} else {
		&bail("Error: unable to determine target database path.");
	}

	if ($target_database_file eq "") {
		rmtree($dataTmpDir);
		&bail("Error: could not find database file location in restored sm.xml, cannot create database");
	}
	if ($target_database_file =~ /^\/Volumes/) {
		&log_message("Notice: Target database file is on another partition.  Skipping attempt to recreate it.");
	} else {
		my $parent_directory = dirname($target_database_file);
		my $mask = umask;
		umask(077);
		if (&run("$MKDIR -p ${g_target_path}${parent_directory}")) {
			rmtree($dataTmpDir);
			&bail("Error: necessary command failed.  See log for details.");
		}
		# Currently a Migration file copy is creating a database in the target path.  Delete it.
		if (-e "${g_target_path}${target_database_file}") {
			unlink("${g_target_path}${target_database_file}");
		}
		if (&run("$SQLITE \"${g_target_path}${target_database_file}\" < ${sql_file}")) {
			rmtree($dataTmpDir);
			&bail("Error: necessary command failed.  See log for details.");
		}
		umask($mask);
	}

	rmtree($dataTmpDir);
}

################################################################################
sub run() {
	my $command = shift;
	&log_message("Executing command: ${command}");
	my $mask = umask;
	umask(077);
	my $dataTmpDir = "";
	for (my $i = 0; $i < 5; $i++) {
		$dataTmpDir = `$MKTEMP_PATH -d /tmp/postgres_restoreExtra.XXXXXXXXXXXXXXXXXXXXXXXX`;
		chomp($dataTmpDir);
		if ($dataTmpDir =~ /failed/) {
			next;
		}
		if (-e $dataTmpDir) {
			last;
		}
		if ($i == 4) {
			&bail("Error: Cannot create temporary file:\n${dataTmpDir}");
		}
	}
	umask($mask);
	
	my $ret = system("${command} 1> ${dataTmpDir}/cmd.output 2>&1");
	if ($ret != 0) {
		my $msg = "Error executing command. Return code: ${ret}";
		if (-e "${dataTmpDir}/cmd.output}") {
			$msg .= "\nOutput was:";
			open(OUTPUT, "<${dataTmpDir}/cmd.output");
			my @lines = <OUTPUT>;
			close(OUTPUT);
			foreach my $line (@lines) {
				chomp($line);
				$msg .= "\n${line}";
			}
		}
		rmtree($dataTmpDir);
		&log_message($msg);
		return 1;
	}
	rmtree($dataTmpDir);
	return 0;
}
################################################################################
sub timestamp()
{
	my ( $sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst ) =
	localtime(time);
	$year += 1900;
	$mon  += 1;
	if ( $hour =~ /^\d$/ ) { $hour = "0" . $hour; }
	if ( $min  =~ /^\d$/ ) { $min  = "0" . $min; }
	if ( $sec  =~ /^\d$/ ) { $sec  = "0" . $sec; }
	
	my $ret = $year."-".$mon."-".$mday."-${hour}:${min}:${sec}";
	return $ret;
}

################################################################################
# Handle the various output modes, log to our file
sub log_message {
	if (! -e $g_log_dir) {
		my $ret = mkdir("${g_log_dir}", 0755);
		unless ($ret) {
			print "Cannot create directory for log\n";
			return;
		}
	}
	if (! open(LOGFILE, ">>${g_log_path}")) {
		print "$0: cannot open ${g_log_path}: $!";
		return;
	}
	print LOGFILE &timestamp.": ".basename($0).": @_\n";
	close(LOGFILE);
}

################################################################################
sub bail
{
    &log_message(@_);
    &log_message("Aborting!");
    print "@_\n";
    exit 1;
}
