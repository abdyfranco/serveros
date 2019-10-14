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

use strict;
use File::Copy;

my $_server_root = "/Applications/Server.app/Contents/ServerRoot";

my $_mail_dir		= "/Library/Server/Mail";
my $_data_dir		= "/Library/Server/Mail/Data";
my $_config_dir		= "/Library/Server/Mail/Config";
my $_resources_dir	= "/Library/Server/Mail/Config/resources";

# make defautl directories
mk_dir( $_mail_dir );
mk_dir( $_config_dir );
mk_dir( $_data_dir );
mk_dir( $_resources_dir );

# check postfix-files
check_postfix_files();

# copy config
copy_config();

# copy resources
copy_resources( "servermgr_mail_imap.strings" );
copy_resources( "servermgr_mail_postfix.strings" );
copy_resources( "servermgr_mail_imap_defaults.plist" );

# copy syslog
copy_syslog();

###############################
# copy new syslog config mail service log file settings
sub copy_syslog
{
	my $_new_syslog_conf = "/private/etc/newsyslog.d/com.apple.mailservices.conf";
	if ( ! -e $_new_syslog_conf ) {
		if ( -e $_server_root . "/$_new_syslog_conf" ) {
			copy( $_server_root . "$_new_syslog_conf", $_new_syslog_conf );
		}
	}
}

###############################
# copy defautl default bundle resouce strings
sub copy_resources
{
	my ($in_resource) = @_;
	my $_src_dir = "$_server_root" . "/usr/share/servermgrd/bundles/servermgr_mail.bundle/Contents/Resources";
	copy( $_src_dir . "/$in_resource", $_resources_dir . "/$in_resource" );
}

###############################
# copy defautl mail config
sub copy_config
{
	if ( ! -e $_config_dir . "/MailServicesOther.plist" ) {
		if ( -e $_server_root . "/private/etc/MailServicesOther.plist.default" ) {
			copy( $_server_root . "/private/etc/MailServicesOther.plist.default", $_config_dir . "/MailServicesOther.plist" );
		}
	}
}

###############################
# check for older copy of postfix-files
sub check_postfix_files
{
	my $_postfix_files = "/private/etc/postfix/postfix-files";
	open( PO_FILES, $_postfix_files );
	if ( grep{/.gz/} <PO_FILES> ) {
		move( $_postfix_files, $_postfix_files . ".prev" );
		copy( $_server_root . "/" . $_postfix_files, $_postfix_files );
	}
	close(PO_FILES);
}

###############################
# make dirs
sub mk_dir ($)
{
	my ($in_path) = @_;
	if (! -e "$in_path") {
		mkdir("$in_path", 0755); 
	}
}

