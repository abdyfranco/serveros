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

my $_data_dir = $_mail_dir . "/Data";
mk_dir( $_data_dir );

my $_sa_config_dir = $_config_dir . "/spamassassin";
mk_dir( $_sa_config_dir );

# install config
my $_src_config_dir = $_server_root . "/private/etc/mail/spamassassin";
copy_dir( $_src_config_dir, $_sa_config_dir );

my $_local_cf = $_config_dir . "/spamassassin/local.cf";
my $_local_cf_default = $_config_dir . "/spamassassin/local.cf.default";
if ( !(-e $_local_cf) && (-e $_default_config) ) {
	copy( $_default_config, $_local_cf );
}
chown( 0, 0, $_local_cf );
chmod( 0644, $_local_cf );

# create data dirs
my $_scanner_dir = $_data_dir . "/scanner";
mk_dir( $_scanner_dir );

my $_sa_dir = $_scanner_dir . "/spamassassin";
mk_dir( $_sa_dir );

my $_src_rules = $_sa_config_dir . "/3.003002";
my $_dst_rules = $_sa_dir . "/3.003002";
if ( !(-d $_dst_rules) && (-d $_src_rules) ) {
	move( $_src_rules, $_dst_rules );
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

###############################
# copy directories
sub copy_dir {
	my ($_src_dir, $_dst_dir) = @_;
	opendir( DIR, $_src_dir);
	for my $_dir_entry (readdir DIR) {
		# skip "." & ".."
		if ( ($_dir_entry ne ".") && ($_dir_entry ne "..") ) {
			my $_src_entry = "$_src_dir/$_dir_entry";
			my $_dst_entry = "$_dst_dir/$_dir_entry";
			if ( -d $_src_entry ) {
				mk_dir( $_dst_entry );
				copy_dir( $_src_entry, $_dst_entry );
			} else {
				copy($_src_entry, $_dst_entry);
			}
		}
	}
	closedir( DIR );
}
