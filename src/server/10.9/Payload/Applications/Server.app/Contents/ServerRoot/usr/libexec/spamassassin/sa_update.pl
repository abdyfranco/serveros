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

my $g_log_dir		= "/Library/Logs/Mail";
my $g_log_path		= $g_log_dir."/junkmail.log";

my $SA_UPDATE_PATH	= "$_server_root/usr/bin/sa-update";

use Foundation;
use File::Copy;
use File::Basename;
use File::Slurp;

# must be run as root
check_uid();

do_update_sa();

exit(0);

################################################################################
# log messages

sub log_message()
{
	if (! -e $g_log_dir) {
		my $ret = mkdir("$g_log_dir", 0755);
		unless ($ret) {
			print "Cannot create log directory: $g_log_dir\n";
			return;
		}
	}

	my $my_chmod = 0;
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

sub do_update_sa
{
	&log_message( "Version: $g_version: updating SpamAssassin rules" );

	my $resp_str = qx( "$_server_root/usr/bin/sa-update" --nogpg --verbose );

	&log_response( $resp_str );
	&log_message( "--------------------------------------" );
}