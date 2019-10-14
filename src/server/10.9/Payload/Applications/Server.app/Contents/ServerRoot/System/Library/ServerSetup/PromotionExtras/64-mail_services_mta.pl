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
use File::Path;
use Foundation;

# set new data & config paths and server defaults
system("/usr/sbin/postconf", "-e", "queue_directory=/Library/Server/Mail/Data/spool");
system("/usr/sbin/postconf", "-e", "data_directory=/Library/Server/Mail/Data/mta");
system("/usr/sbin/postconf", "-e", "config_directory=/Library/Server/Mail/Config/postfix");
system("/usr/sbin/postconf", "-e", "imap_submit_cred_file=/Library/Server/Mail/Config/postfix/submit.cred");

# preserve aliases
preserve_aliases();

# create SMTP data directories
make_data_dirs();

# copy SMTP config
copy_config();

# unload postfix launchd plist
system("/bin/launchctl", "unload", "-w", "/System/Library/LaunchDaemons/org.postfix.master.plist");

# set new master plist
set_master_plist();

# reload postfix launchd plist with new server settings
system("/bin/launchctl", "load", "-w", "/System/Library/LaunchDaemons/org.postfix.master.plist");

# setup submit.cred
set_credentials();

# set postfix permissions
system("/usr/sbin/postfix set-permissions &");

# create new aliases
system("/usr/bin/newaliases &");

# exit all is well
exit(0);

###############################
# set master plist to server mode
sub set_master_plist
{
	my $_master_plist = "/System/Library/LaunchDaemons/org.postfix.master.plist";

	my $_master_dict = NSDictionary->dictionaryWithContentsOfFile_($_master_plist);
	if ($_master_dict && $$_master_dict) {
		my $_prog_args = $_master_dict->objectForKey_("ProgramArguments");
		if ($_prog_args && $$_prog_args) {
			if ($_prog_args->isKindOfClass_(NSArray->class)) {
				my($_prog_args) = NSMutableArray->arrayWithCapacity_(int(@$perlRef));
				$_prog_args->addObject_("master");
				$_prog_args->addObject_("-c");
				$_prog_args->addObject_("/Library/Server/Mail/Config/postfix");
				$_prog_args->addObject_("-e");
				$_prog_args->addObject_("60");
				$_master_dict->setObject_forKey_($_prog_args, 'ProgramArguments');
				my($_queue_dir) = NSMutableArray->arrayWithCapacity_(int(@$perlRef));
				$_queue_dir->addObject_("/Library/Server/Mail/Data/spool/maildrop");
				$_master_dict->setObject_forKey_($_queue_dir, 'QueueDirectories');
				$_master_dict->writeToFile_atomically_($_master_plist, 1);
			}
		}
	}
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
	opendir(DIR, $_src_dir);
	for my $_dir_entry (readdir DIR) {
		# skip "." & ".."
		if (($_dir_entry ne ".") && ($_dir_entry ne "..")) {
			my $_src_entry = "$_src_dir/$_dir_entry";
			my $_dst_entry = "$_dst_dir/$_dir_entry";
			if (-d $_src_entry) {
				mk_dir($_dst_entry);
				copy_dir($_src_entry, $_dst_entry);
			} else {
				copy($_src_entry, $_dst_entry);
			}
		}
	}
	closedir(DIR);
}

###############################
# set credentials
sub set_credentials
{
	my $_submit_cred = "/Library/Server/Mail/Config/postfix/submit.cred";
	if (! -f $_submit_cred) {
		# call set_credentials.sh if it exists and return
		my $_set_cred = "/usr/libexec/postfix/set_credentials.sh";
		if (-e $_set_cred) {
			system("$_set_cred &");
			return;
		}

		my $_hostname = `/usr/sbin/postconf -c /Library/Server/Mail/Config/postfix -h myhostname`;
		chomp($_hostname);
		if ($_hostname eq "") {
			$_hostname = `hostname`;
			chomp($_hostname);
		}

		my $_passwd = "";
		my $_submit_pass = "/Library/Server/Mail/Config/dovecot/submit.passdb";
        if (-f $_submit_pass) {
			open(SUBMIT_PASS, $_submit_pass);
			if (grep{/^submit:/} <SUBMIT_PASS>) {
                $_passwd = `grep "^submit:" $_submit_pass | sed -e 's,.*},,' -e 's,:.*,,'`;
			}
			close(SUBMIT_PASS);
        }

		if ($_passwd eq "") {
			$_passwd = `dd if=/dev/urandom bs=256 count=1 2>&1 | env LANG=C tr -dc a-zA-Z0-9 2>&1 | cut -b 1-22 2>&1`;
		}

		if ($_passwd ne "") {
			chomp($_passwd);
			open(SUBMIT_PASS,">$_submit_cred");
			print SUBMIT_PASS "submitcred version 1\n";
			print SUBMIT_PASS "$_hostname|submit|$_passwd";
			close(SUBMIT_PASS);
		}
		chmod(0600, $_submit_cred);
	}
}

###############################
# copy config files
sub copy_config
{
	my $_src_config = "/etc/postfix";
	my $_dst_config = "/Library/Server/Mail/Config/postfix";

	if (! -d $_dst_config) {
		mk_dir($_dst_config);
		copy_dir($_src_config, $_dst_config);
	}
}

###############################
# create data directories
sub make_data_dirs
{
	# SMTP spool directory
	my $_spool_dir = "/Library/Server/Mail/Data/spool";
	mk_dir($_spool_dir);

	# SMTP data directory
	my $_data_dir = "/Library/Server/Mail/Data/mta";
	mk_dir($_data_dir);
	chown("_postfix", "mail", $_data_dir);

	# SMTP database directory
	my $_db_dir	= "/Library/Server/Mail/Data/db";
	mk_dir($_db_dir);
	chmod(0770, $_db_dir);
	chown("root", "mail", $_db_dir);

	# greylist database directory
	my $_gldb_dir = "/Library/Server/Mail/Data/gldb";
	mk_dir($_gldb_dir);
	chmod(0750, $_gldb_dir);
	chown("nobody", "mail". "$_gldb_dir");
}

###############################
# preserve aliases
sub preserve_aliases
{
	my $_aliases = "/etc/postfix/aliases";
	my $_aliases_desktop = "/etc/postfix/aliases.desktop";
	if (! -e $_aliases_desktop) {
	  copy($_aliases, $_aliases_desktop);
	}

	# reuse previous server aliases if any
	my $_aliases_server = "/etc/postfix/aliases.server";
	if (-e $_aliases_server) {
	  copy($_aliases_server, $_aliases);
	  unlink($_aliases_server);
	}
}

