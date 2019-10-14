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
use File::Copy;
use Foundation;

# config dirs
my $_mail_dir = "/Library/Server/Mail";
my $_config_dir = $_mail_dir . "/Config";
my $_dst_config_dir = $_config_dir . "/amavisd";
my $_config_file = $_dst_config_dir . "/amavisd.conf";

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
my $_dst_lang_dir = "/Library/Server/Mail/Data/amavisd/languages";
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

# whitelist_sender
my $_amavis_dir = "/Library/Server/Mail/Data/scanner/amavis";
my $_wl_sender = $_amavis_dir . "/whitelist_sender";
if ( ! -e $_wl_sender ) {
	open(WL_FILE,">$_wl_sender");
	print WL_FILE "\n";
	close(WL_FILE);
	chown( 83, 83, $_wl_sender );
	chmod( 0644, $_wl_sender );
}
