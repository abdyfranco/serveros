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


use File::Copy;

my $_server_root = "/Applications/Server.app/Contents/ServerRoot";

# create config dirs
my $_mail_dir = "/Library/Server/Mail";
mk_dir( $_mail_dir );

my $_config_dir = $_mail_dir . "/Config";
mk_dir( $_config_dir );

my $_clamav_config_dir = $_config_dir . "/clamav";
mk_dir( $_clamav_config_dir );

# create data dirs
my $_data_dir = $_mail_dir . "/Data";
mk_dir( $_data_dir );

my $_scanner_dir = $_data_dir . "/scanner";
mk_dir( $_scanner_dir );

my $_clamav_data_dir = $_scanner_dir . "/clamav";
mk_dir( $_clamav_data_dir );

chown( 82, 82, $_clamav_data_dir );
chmod( 0755, $_clamav_data_dir );

# db dir
my $_clamav_db_dir = $_clamav_data_dir. "/db";
mk_dir( $_clamav_db_dir );

chown( 82, 82, $_clamav_db_dir );
chmod( 0755, $_clamav_dir );

# install clamd config
my $_clamd_conf = $_clamav_config_dir . "/clamd.conf";
my $_clamd_conf_default = $_server_root . "/private/etc/clamd.conf.default";
if ( !(-e $_clamd_conf) && (-e $_clamd_conf_default) ) {
	copy($_clamd_conf_default, $_clamd_conf );
}
chown( 0, 0, $_clamd_conf );
chmod( 0644, $_clamd_conf );

# install clamd config
my $_freshclam_conf = $_clamav_config_dir . "/freshclam.conf";
my $_freshclam_conf_default = $_server_root . "/private/etc/freshclam.conf.default";
if ( !(-e $_freshclam_conf) && (-e $_freshclam_conf_default) ) {
	copy( $_freshclam_conf_default, $_freshclam_conf );
}
chown( 0, 0, $_freshclam_conf );
chmod( 0644, $_freshclam_conf );

# create log files
my $_mail_log_dir = "/Library/Logs/Mail";
if ( ! -d $_amavis_log_dir ) {
	mk_dir( $_mail_log_dir );
	chown( 0, 80, $_mail_log_dir );
}

my $_clamav_log = $_mail_log_dir . "/clamav.log";
if ( ! -e $_clamav_log ) {
	open(LOG_FILE,">$_clamav_log");
	close(LOG_FILE);
	chmod( 0640, $_clamav_log );
	chown( 83, 80, $_clamav_log );
}

my $_freshclam_log = $_mail_log_dir . "/freshclam.log";
if ( ! -e $_freshclam_log ) {
	open(LOG_FILE,">$_freshclam_log");
	close(LOG_FILE);
	chmod( 0640, $_freshclam_log );
	chown( 82, 80, $_freshclam_log );
}

###############################
# make directories
sub mk_dir ($)
{
	my ($_in_path) = @_;
	if (! -d "$_in_path") {
		mkdir("$_in_path", 0755); 
	}
}

