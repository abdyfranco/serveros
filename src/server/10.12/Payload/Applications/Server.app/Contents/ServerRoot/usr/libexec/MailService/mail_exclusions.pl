#!/usr/bin/perl
#
# Copyright (c) 2010-2015 Apple Inc. All rights reserved.
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

use strict;

# Mail Time Machine exclusion utility

############################# System  Constants #############################

########################### Fixed Exclusion Paths ###########################
my $greylist_db = "/Library/Server/Mail/Data/gldb/greylist.db";
my $whitelist_db = "/Library/Server/Mail/Data/gldb/greylist.db";
my $clamav_db = "/Library/Server/Mail/Data/scanner/clamav/db";

################################# Binaries ##################################
my $TMUTIL			= "/usr/bin/tmutil";
my $MAIL_TOOL		= "/Applications/Server.app/Contents/ServerRoot/usr/bin/mail_data_tool";

################################## Config ###################################
my $CONFIG_ROOT		= "/Library/Server/Mail/Config";

################################### Flags ###################################
my $DEBUG		= 0;

#############################################################################
# main
#############################################################################

use Foundation;
use File::Copy;
use File::Basename;

if ($ENV{DEBUG} eq 1) {
	$DEBUG = '1'; }

do_add_exclusion();

exit();

################################# Functions #################################

#############################################################################
#	scan mail account for sub mailboxes and exclude indexes

sub scan_mail_acct
{
	my $in_dir = $_[0];

	if (!opendir(MAIL_ACCT_DIR, $in_dir)) {
		print( "cannot open mailbox: $in_dir\n" );
		return;
	}

	my @mailboxes = readdir(MAIL_ACCT_DIR);
	closedir(MAIL_ACCT_DIR);

	$in_dir .= "/";

	# exclude skindex for INBOX
	my $skindex_path = "$in_dir" . "dovecot.skindex";
	if (-e $skindex_path) {
		system( ${TMUTIL}, "addexclusion", $skindex_path ); }

	# exclude indexs for any sub-mailbox
	my $file = "";
	foreach $file (@mailboxes) {
		my $a_path = $in_dir.$file;
		if (-d $a_path) {
			if (($file ne ".") && ($file ne "..")) { 

				$skindex_path = "$a_path" . "/dovecot.skindex";
				if (-e $skindex_path) {
					system( ${TMUTIL}, "addexclusion", $skindex_path ); }
			}
		}
	}
} # scan_mail_acct

################################################################################
# exclude mail index files from each mail account

sub exclude_mail_indexes ()
{
	# create indexes for accounts on all partitions
	open( PARTITIONS, "<${CONFIG_ROOT}" . "/dovecot/partition_map.conf" );
	while( <PARTITIONS> ) {
		my( $a_line ) = $_;
		chomp( $a_line );

		# get partition path
		my $offset = index( $a_line, ":" );
		if ( $offset != -1 ) {
			# strip the quotes
			my $a_path = substr($a_line, $offset + 1);

			# get list of user mail account
			if ( !opendir(MAIL_DIRS, $a_path) ) {
				print( "cannot open: $a_path\n" );
				next;
			}
			my @acct_dirs= readdir(MAIL_DIRS);
			closedir(MAIL_DIRS);

			# make the fts indexes for valid user accounts
			my $file;
			foreach $file (@acct_dirs) {
				next unless $file =~ /^[A-F0-9-]+$/;
				if(($file ne ".") && ($file ne "..")) { 
					# convert GUID to valid user ID
					my $user_id = system(${MAIL_TOOL}, "-u", $file);
					if ( substr($user_id, 0, 16) ne "No user id found" ) {
						chomp( $user_id );
						scan_mail_acct( $a_path . "/" . $file, $user_id );
					}
				}
			}
		}
	}
	close( PARTITIONS );
} # exclude_mail_indexes

################################################################################
# do_add_exclusion()

sub do_add_exclusion()
{
	# mail greylist db exclusions
	if (-e "$greylist_db") {
		system( ${TMUTIL}, "addexclusion", $greylist_db ); }

	if (-e "$whitelist_db") {
		system( ${TMUTIL}, "addexclusion". $whitelist_db ); }

	# Clam AV virus databases
	if (-e "$clamav_db") {
		system( ${TMUTIL}, "addexclusion", $clamav_db ); }

	exclude_mail_indexes();
} # do_add_exclusion
