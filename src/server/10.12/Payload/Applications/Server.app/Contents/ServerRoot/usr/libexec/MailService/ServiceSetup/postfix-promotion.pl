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

use File::Copy;
use File::Path;
use Foundation;

# Server Root Path
my $_server_root = "/Applications/Server.app/Contents/ServerRoot";

# setup submit.cred
my $_submit_cred = "/Library/Server/Mail/Config/postfix/submit.cred";
if (! -f $_submit_cred) {
	# call set_credentials.sh if it exists and return
	my $_set_cred = $_server_root . "/usr/libexec/postfix/set_credentials.sh";
	if (-e $_set_cred) {
		system("$_set_cred &");
		exit(0);
	}

	my $_hostname = `/Applications/Server.app/Contents/ServerRoot/usr/sbin/postconf -c /Library/Server/Mail/Config/postfix -h myhostname`;
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
