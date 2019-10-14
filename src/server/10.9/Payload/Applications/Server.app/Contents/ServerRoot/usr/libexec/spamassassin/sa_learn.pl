#!/usr/bin/perl
#
# Copyright (c) 2010-2013 Apple Inc. All rights reserved.
# 
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
# 
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions
# are met:
# 
# 1.  Redistributions of source code must retain the above copyright
# notice, this list of conditions and the following disclaimer.
# 2.  Redistributions in binary form must reproduce the above
# copyright notice, this list of conditions and the following
# disclaimer in the documentation and/or other materials provided
# with the distribution.
# 3.  Neither the name of Apple Inc. ("Apple") nor the names of its
# contributors may be used to endorse or promote products derived
# from this software without specific prior written permission.
# 
# THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
# THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
# PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS
# CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
# SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
# LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF
# USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
# ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
# OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
# OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
# SUCH DAMAGE.

my $_server_root	= "/Applications/Server.app/Contents/ServerRoot";

my $g_version		= "2.1.5";
my $g_jm_user		= "junkmail";
my $g_not_jm_user	= "notjunkmail";

my $g_log_dir		= "/Library/Logs/Mail";
my $g_log_path		= $g_log_dir."/junkmail.log";

my $DATA_DIR		= "/Library/Server/Mail/Data";
my $PLIST_BUDDY		= "/usr/libexec/PlistBuddy";
my $MAIL_DATA_TOOL	= "$_server_root/usr/bin/mail_data_tool";
my $SERVER_ADMIN	= "$_server_root/usr/sbin/serveradmin";
my $SA_LEARN_PATH	= "$_server_root/usr/bin/sa-learn";
my $AMAVIS_PATH		= $DATA_DIR."/scanner/amavis";
my $PREFS_PATH		= $DATA_DIR."/scanner/amavis/user_prefs";
my $SA_DB_PATH		= $DATA_DIR."/scanner/amavis/.spamassassin";

use Foundation;
use File::Copy;
use File::Basename;
use File::Slurp;

# must be run as root
check_uid();

parse_options();

do_sa_learn( @ARGV );

exit(0);

################################################################################
# usage

sub usage()
{
	print( "Usage Options:\n" );
	print( "  --junk     userid    user account to learn junk mail from (default $g_jm_user)\n" );
	print( "  --not-junk userid    user account to learn ham, or no-junk mail from (default $g_not_jm_user)\n" );
}

################################################################################
# print script argument keys and values

sub print_script_args ()
{
	my %script_args = @_;
	while(my ($theKey, $theVal) = each (%script_args)) {
		print "$theKey: $theVal\n";
	}
} # print_script_args

################################################################################
# parse options

sub parse_options
{
    my (@optval) = @_;
    my ($opt, @opts, %valFollows, @newargs);

    while (@optval) {
		$opt = shift(@optval);
		push(@opts,$opt);
		$valFollows{$opt} = shift(@optval);
    }

    my @optArgs = ();
    my %opt = ();

	my $arg;
    arg: while (defined($arg = shift(@ARGV))) {
		foreach my $opt (@opts) {
			if ($arg eq $opt) {
				push(@optArgs, $arg);
				if ($valFollows{$opt}) {
					$opt{$opt} = shift(@ARGV);
					push(@optArgs, $opt{$opt});
				} else {
					$opt{$opt} = 1;
				}
				next arg;
			}
		}
		push(@newargs,$arg);
    }
    @ARGV = @newargs;
} # parse_options

################################################################################
# log messages

sub log_message()
{
	my $my_chomd = 0;

	if (! -e $g_log_dir) {
		my $ret = mkdir("$g_log_dir", 0755);
		unless ($ret) {
			print "Cannot create log directory: $g_log_dir\n";
			return;
		}
	}
	if ( !path_exists( $g_log_path ) ) {
		$my_chmod = 1;
	}

	if ( !open( LOG_FILE, ">>$g_log_path" ) ) {
		print "$0: cannot open log file: $g_log_path: $!";
		return;
	}

	# only do this if we create the file
	#	otherwise leave it alone
	if ( $my_chmod == 1 ) {
		qx( chmod 640 $g_log_path );
		qx( chown -R _amavisd:admin $g_log_path );
	}

	my $time = localtime();
	print LOG_FILE "$time: ".basename($0).": @_\n";
	close( LOG_FILE );
}

################################################################################
# log response string(s)

sub log_response()
{
	my ($in_strs) = @_;

	my @in_str_values = split( '\n',  $in_strs );
	foreach my $str ( @in_str_values ) {
		&log_message( $str );
	}
} 

################################################################################
# log string w/o CR

sub log_str()
{
	if (! -e $g_log_dir) {
		my $ret = mkdir("$g_log_dir", 0755);
		unless ($ret) {
			print "Cannot create log directory: $g_log_dir\n";
			return;
		}
	}
	if ( !open(LOG_FILE, ">>$g_log_path") ) {
		print "$0: cannot open log file: $g_log_path: $!";
		return;
	}

	my $time = localtime();
	print LOG_FILE "$time: ".basename($0).": @_";
	close( LOG_FILE );
}

################################################################################
# exit if not run as root

sub check_uid () {
	my $login = (getpwuid $>);
	if( $login ne "root" ) {
		print( "Error: You must be root to run this\n" );

		exit(EXIT_FAILURE);
	}
}

################################################################################
# check if a path exists

sub path_exists ($)
{
	my $exists = 0;
	my ($in_path) = @_;

	if ( -e "$in_path" ) {
		$exists = 1;
	}

	return( $exists );
}

################################################################################
# main sub

sub do_sa_learn
{
	my %in_args = @_;

	&log_message( "Version: $g_version starting up..." );

	# load command line provided junk mail user id or read from 
	#	mail services configuration
	if ( $in_args{"--junk"} ne "" ) {
		$g_jm_user = $in_args{"--junk"};
		&log_message( "using command line provided junk mail user id: $g_jm_user" );
	} else {
		my $tmp_value = qx( ${PLIST_BUDDY} -c 'Print :junk_mail:junk_mail_userid' /Library/Server/Mail/Config/MailServicesOther.plist 2>&1 );
		chomp( $tmp_value );
		if ($tmp_value eq "" || $tmp_value =~ /Does Not Exist/) {
			&log_message( "using default junk mail user id: $g_jm_user" );
		} else {
			$g_jm_user = $tmp_value;
			&log_message( "using service configured junk mail user id: $g_jm_user" );
		}
	}

	# load command line provided not-junk mail user id or read from 
	#	mail services configuration
	if ( $in_args{"--not-junk"} ne "" ) {
		$g_not_jm_user = $in_args{"--not-junk"};
		&log_message( "using command line provided not-junk mail user id: $g_not_jm_user" );
	} else {
		my $tmp_value = qx( ${PLIST_BUDDY} -c 'Print :junk_mail:not_junk_mail_userid' /Library/Server/Mail/Config/MailServicesOther.plist 2>&1 );
		chomp( $tmp_value );
		if ( $tmp_value eq "" || $tmp_value =~ /Does Not Exist/ ) {
			&log_message( "using default junk mail user id: $g_not_jm_user" );
		} else {
			$g_not_jm_user = $tmp_value;
			&log_message( "using service configured not-junk mail user id: $g_not_jm_user" );
		}
	}

	# convert user-id to guid
	$jm_guid = qx( ${MAIL_DATA_TOOL} -g $g_jm_user );
	chomp( $jm_guid );
	if ( $jm_guid eq "" || $jm_guid =~ /No GUID found/ ) {
		$jm_guid = "";
		&log_message( "warning: no GUID found for: $g_jm_user.  user id \"$g_jm_user\" must be a valid user.  no mail account to learn spam from" );
	} else {
		&log_message( "junk mail user id: $g_jm_user = GUID: $jm_guid" );
	}

	$not_jm_guid = qx( ${MAIL_DATA_TOOL} -g $g_not_jm_user );
	chomp( $not_jm_guid );
	if ( $not_jm_guid eq "" || $not_jm_guid =~ /No GUID found/ ) {
		$not_jm_guid = "";
		&log_message( "warning: no GUID found for: $g_not_jm_user.  user id \"$g_not_jm_user\" must be a valid user.  no mail account to learn spam from" );
	} else {
		&log_message( "not junk mail user id: $g_not_jm_user = GUID: $not_jm_guid" );
	}

	if ( ($jm_guid eq "") || ($not_jm_guid eq "") ) {
		&log_message( "warning: no GUIDs found for: $g_jm_user or $g_not_jm_user.  exiting" );
		exit(0);
	}

	my $mail_loc = qx( ${SERVER_ADMIN} settings mail:imap:partition-default );
	chomp($mail_loc);
	$mail_loc =~ s/mail:imap:partition-default = //;
	$mail_loc =~ s/\"//g;
	&log_message( "using default mailbox location: $mail_loc" );	

	# make sure db path exists
	if ( !path_exists( ${AMAVIS_PATH} ) ) {
		my $ret = mkdir( "${AMAVIS_PATH}", 0750 );
		unless ($ret) {
			print "Cannot create preferences directory: ${AMAVIS_PATH}\n";
		}
	}

	if ( !path_exists( ${PREFS_PATH} ) ) {
		my $ret = mkdir( "${PREFS_PATH}", 0750 );
		unless ($ret) {
			print "Cannot create preferences directory: ${PREFS_PATH}\n";
		}
	}
	qx( chown -R _amavisd:_amavisd ${AMAVIS_PATH} );
	qx( chmod 0750 ${AMAVIS_PATH} );

	# run sa-learn on junk-mail mailboxes
	my $jm_mailbox = "$mail_loc" . "/$jm_guid";
	if ( ($jm_guid ne "") && path_exists( "$jm_mailbox" ) ) {
		&log_message( "-- learning junk mail" );
		&log_message( "junk mail mailbox: $jm_mailbox" );

		# set ownership to _amavisd for sa-learn tool
		qx( chown -R _amavisd:_amavisd "$jm_mailbox" );

		# /cur mailbox
		my $cur_mailbox = "$jm_mailbox" . "/cur";
		if ( path_exists("$cur_mailbox") ) {
			&log_message( "executing sa-learn junk-mail from mailbox paht: $cur_mailbox" );
			@files = read_dir $cur_mailbox;
			foreach $file (@files) {
				&log_message( "processing message: $file" );
				#&log_str( "- " );
				my $resp_str = qx( "${SA_LEARN_PATH}" --dbpath ${SA_DB_PATH} --username=_amavisd --prefspath="${PREFS_PATH}" --spam --no-sync --file "$cur_mailbox/$file" );
				&log_response( $resp_str );
				&log_message( "removing: $file" );
				unlink( "$cur_mailbox/$file" );
			}
		}

		# /new mailbox
		my $new_mailbox = "$jm_mailbox" . "/new";
		if ( path_exists("$new_mailbox") ) {
			&log_message( "executing sa-learn junk-mail from mailbox paht: $new_mailbox" );
			@files = read_dir $new_mailbox;
			foreach $file (@files) {
				&log_message( "processing message: $file" );
				#&log_str( "- " );
				my $resp_str = qx( "${SA_LEARN_PATH}" --dbpath ${SA_DB_PATH} --username=_amavisd --prefspath="${PREFS_PATH}" --spam --no-sync --file "$new_mailbox/$file" );
				&log_response( $resp_str );
				&log_message( "removing: $file" );
				unlink( "$new_mailbox/$file" );
			}
		}
		qx( chown -R _dovecot:mail "$jm_mailbox" );
	}

	# run sa-learn on not-junk-mail mailboxes
	my $not_jm_mailbox = "$mail_loc" . "/$not_jm_guid";
	if ( ($not_jm_guid ne "") && path_exists( "$not_jm_mailbox" ) ) {
		&log_message( "-- learning not junk mail" );
		&log_message( "not-junk mail mailbox: $not_jm_mailbox" );

		# set ownership to _amavisd for sa-learn tool
		qx( chown -R _amavisd:_amavisd "$not_jm_mailbox" );

		# /cur mailbox
		my $cur_mailbox = "$not_jm_mailbox" . "/cur";
		if ( path_exists("$cur_mailbox") ) {
			&log_message( "executing sa-learn not-junk-mail from mailbox paht: $cur_mailbox" );
			@files = read_dir $cur_mailbox;
			foreach $file (@files) {
				&log_message( "processing message: $file" );
				#&log_str( "- " );
				my $resp_str = qx( "${SA_LEARN_PATH}" --dbpath ${SA_DB_PATH} --username=_amavisd --prefspath="${PREFS_PATH}" --ham --no-sync --file "$cur_mailbox/$file" );
				&log_response( $resp_str );
				&log_message( "removing: $file" );
				unlink( "$cur_mailbox/$file" );
			}
		}

		# /new mailbox
		my $new_mailbox = "$not_jm_mailbox" . "/new";
		if ( path_exists("$new_mailbox") ) {
			&log_message( "executing sa-learn not-junk-mail from mailbox paht: $new_mailbox" );
			@files = read_dir $new_mailbox;
			foreach $file (@files) {
				&log_message( "processing message: $file" );
				#&log_str( "- " );
				my $resp_str = qx( "${SA_LEARN_PATH}" --dbpath ${SA_DB_PATH} --username=_amavisd --prefspath="${PREFS_PATH}" --ham --no-sync --file "$new_mailbox/$file" );
				&log_response( $resp_str );
				&log_message( "removing: $file" );
				unlink( "$new_mailbox/$file" );
			}
		}
		qx( chown -R _dovecot:mail "$not_jm_mailbox" );
	}

	# Force a database sync
	&log_message( "-- synchronizing databases" );
	&log_message( "-    db path: ${SA_DB_PATH}" );
	&log_message( "-   username: _amavisd" );
	&log_message( "- prefs path: ${PREFS_PATH}" );
	my $resp_str = qx( "${SA_LEARN_PATH}" --dbpath ${SA_DB_PATH} --username=_amavisd --prefspath="${PREFS_PATH}" --sync );
	&log_response( $resp_str );
	&log_message( "-- database synchronization complete" );
	&log_message( "--------------------------------------" );
}
