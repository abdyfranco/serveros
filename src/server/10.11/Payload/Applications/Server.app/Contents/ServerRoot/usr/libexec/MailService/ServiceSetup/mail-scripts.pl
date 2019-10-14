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

# Server Root Path
my $_server_root = "/Applications/Server.app/Contents/ServerRoot";

my $_num_args = $#ARGV + 1;
if ( $_num_args != 1 ) {
	exit;
}

my $_arg = $ARGV[0];
if ( $_arg eq "launchctl-unload" ) {
	system( "launchctl unload -w /System/Library/LaunchDaemons/org.postfix.master.plist &" );
} elsif ( $_arg eq "amavisd-promotion" ) {
	system( "$_server_root/usr/libexec/MailService/ServiceSetup/amavisd-promotion.pl &" );
} elsif ( $_arg eq "dovecot-promotion" ) {
	system ( "$_server_root/usr/libexec/MailService/ServiceSetup/dovecot-promotion.pl &" );
} elsif ( $_arg eq "serveradmin-migrate-members" ) {
	system ( "$_server_root/usr/sbin/serveradmin command mail:command = doMigrateMembers &" );
} elsif ( $_arg eq "postfix-postsetup" ) {
	system( "$_server_root/usr/libexec/MailService/ServiceSetup/postfix-postsetup.pl &" );
} elsif ( $_arg eq "postfix-set-permissions" ) {
	system( "$_server_root/usr/sbin/postfix -c /Library/Server/Mail/Config/postfix set-permissions &" );
} elsif ( $_arg eq "newaliases" ) {
	system( "$_server_root/usr/bin/newaliases &" );
} elsif ( $_arg eq "serveradmin-enable_virtual_domains" ) {
	system( "$_server_root/usr/sbin/serveradmin settings mail:postfix:enable_virtual_domains = yes &" );
} elsif ( $_arg eq "mail-postsetup" ) {
	system( "$_server_root/usr/libexec/MailService/ServiceSetup/mail-postsetup.sh &" );
}
