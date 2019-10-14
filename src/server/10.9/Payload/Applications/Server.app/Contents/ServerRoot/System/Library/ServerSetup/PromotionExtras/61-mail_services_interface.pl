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
use Foundation;

my $_server_root = "/Applications/Server.app/Contents/ServerRoot";

# create config dirs
my $_mail_dir = "/Library/Server/Mail";
mk_dir( $_mail_dir );

my $_config_dir = $_mail_dir . "/Config";
mk_dir( $_config_dir );

my $_data_dir = $_mail_dir . "/Data";
mk_dir( $_data_dir );

my $_dst_config_dir = $_config_dir . "/amavisd";
mk_dir( $_dst_config_dir );

# install default config files
my $_config_file = $_dst_config_dir . "/amavisd.conf";
my $_src_config_file = $_server_root . "/private/etc/amavisd.conf.default";
if ( !(-e $_config_file) && (-e $_src_config_file) ) {
	copy( $_src_config_file, $_config_file );
}

# install languages directory
my $_data_dir = "/Library/Server/Mail/Data/amavisd";
mk_dir( $_data_dir );

# copy languages
my $_dst_lang_dir = "/Library/Server/Mail/Data/amavisd/languages";
if ( ! -d $_dst_lang_dir ) {
	mk_dir( $_dst_lang_dir );

	my $_src_lang_dir = $_server_root . "/private/etc/mail/amavisd/languages";
	copy_dir( $_src_lang_dir, $_dst_lang_dir );
}

my $_language_dir = "en.lproj";
my $_global_prefs_plist = "/Library/Preferences/.GlobalPreferences.plist";
my $_global_prefs_dict = NSDictionary->dictionaryWithContentsOfFile_( $_global_prefs_plist );
if ( $_global_prefs_dict && $$_global_prefs_dict ) {
	my $_languages = $_global_prefs_dict->objectForKey_( "ProgramArguments" );
	if ( $_languages && $$_languages) {
		if ( $_languages->isKindOfClass_( NSArray->class ) ) {
			my $_def_lang = $_languages->objectAtIndex_(0);
			if ( $_def_lang && $$_def_lang) {
				if ( $_def_lang ne "" ) {
					$_language_dir = $_def_lang . ".lproj";
				}
			}
		}
	}
}

# validate language directory, default to en
if ( ! -e "$_dst_lang_dir" . "/" . "$_language_dir" . "/charset" ) {
  $_language_dir = "en.lproj";
}

# set language
open( CONFIG, $_config_file );
if ( grep{/^read_l10n_templates/} <CONFIG> ) {
	my $_config_file_new = "$_config_dir" . "/amavisd.conf.new";
	open( SRC_FILE, "<$_config_file");
	open( DST_FILE, ">$_config_file_new");
	while( <SRC_FILE> ) {
		my( $line ) = $_;
		if ( substr( $line, 0, 19) eq "read_l10n_templates" ) {
			my $_key_template = "read_l10n_templates('/Library/Server/Mail/Data/amavisd/languages/" . "$_language_dir" . "');\n";
			print DST_FILE $_key_template;
		} else {
			print DST_FILE $_;
		}
	}
	close(SRC_FILE);
	close(DST_FILE);
	move($_config_file_new, $_config_file);
}
close(CONFIG);

# set ownership & permissions on config file	
if ( -e $_config_file ) {
	chown( 0, 0, $_config_file );
	chmod( 0644, $_config_file );
}

# create log files
my $_mail_log_dir = "/Library/Logs/Mail";
if ( ! -d $_amavis_log_dir ) {
	mk_dir( $_mail_log_dir );
	chown( 0, 80, $_mail_log_dir );
}

my $_amavis_log = $_mail_log_dir . "/amavis.log";
if ( ! -e $_amavis_log ) {
	open(LOG_FILE,">$_amavis_log");
	close(LOG_FILE);
	chmod( 0640, $_amavis_log );
	chown( 83, 80, $_amavis_log );
}

# setup data dirs
my $_scanner_dir = "/Library/Server/Mail/Data/scanner";
if ( ! -d $_scanner_dir ) {
	mk_dir( $_scanner_dir );
	chown( 0, 0, $_scanner_dir );
}

my $_amavis_dir = "/Library/Server/Mail/Data/scanner/amavis";
if ( ! -d $_amavis_dir ) {
	mk_dir( $_amavis_dir );
	chown( 83, 83, $_amavis_dir );
}

my $_amavis_dir_db = $_amavis_dir . "/db";
if ( ! -d $_amavis_dir_db ) {
	mk_dir( $_amavis_dir_db );
	chown( 83, 83, $_amavis_dir_db );
}

my $_amavis_dir_tmp = $_amavis_dir . "/tmp";
if ( ! -d $_amavis_dir_tmp ) {
	mk_dir( $_amavis_dir_tmp );
	chown( 83, 83, $_amavis_dir_tmp );
}

# virus email dir
my $_virusmails_dir = "/Library/Server/Mail/Data/scanner/virusmails";
if ( ! -d $_virusmails_dir ) {
	mk_dir( $_virusmails_dir );
	chown( 83, 83, $_virusmails_dir );
	chmod( 0750, $_virusmails_dir );
}

# copy spamassassin config
my $_amavis_sa_dir = "/Library/Server/Mail/Data/scanner/amavis/.spamassassin";
my $_clamav_sa_dir = "/Library/Server/Mail/Data/scanner/clamav/.spamassassin";
if ( ! -d $_amavis_sa_dir ) {
	if ( -d $_clamav_sa_dir ) {
		copy_dir( $_clamav_sa_dir, $_amavis_sa_dir );
	} else {
		mkdir $_amavis_sa_dir
	}
	chown( 83, 83, $_amavis_sa_dir );
}

# whitelist_sender
my $_wl_sender = $_amavis_dir . "/whitelist_sender";
if ( ! -e $_wl_sender ) {
	open(WL_FILE,">$_wl_sender");
	print WL_FILE "\n";
	close(WL_FILE);
	chown( 83, 83, $_wl_sender );
	chmod( 0644, $_wl_sender );
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
