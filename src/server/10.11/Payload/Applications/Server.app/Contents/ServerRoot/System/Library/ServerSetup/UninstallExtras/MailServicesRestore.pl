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

# get current OS version
chomp( $_vers = `sw_vers -productVersion` );

# set sendmail server version
if ( $_vers =~ /10\.10/ ) {
	# symlink to ServerRoot sendmail if 10.10.x
	if ( -e "/usr/sbin/sendmail.dtv" ) {
		if ( -e "/usr/sbin/sendmail" ) {
			unlink( "/usr/sbin/sendmail" );
		}
		rename( "/usr/sbin/sendmail.dtv", "/usr/sbin/sendmail" );
	}
} elsif ( $_vers =~ /10\.11/ ) {
    # reset sendmail to use desktop config
    system( "/usr/sbin/postconf -c /etc/postfix -e server_config_directory=disabled" );
}

# disable mail services
system( "/usr/libexec/PlistBuddy -c 'Set :state SERVICE_DISABLE' /Library/Server/Mail/Config/MailServicesOther.plist" );
system( "/usr/libexec/PlistBuddy -c 'Set :service_state STOPPED' /Library/Server/Mail/Config/MailServicesOther.plist" );
system( "/usr/libexec/PlistBuddy -c 'Set :service_state_stamp 0' /Library/Server/Mail/Config/MailServicesOther.plist" );

# cleanup newsyslog.d
my $_mail_services_conf = "/etc/newsyslog.d/com.apple.mailservices.conf";
if ( -e $_mail_services_conf ) {
	unlink( $_mail_services_conf );
}

# load postfix
system( "/bin/launchctl load -w /System/Library/LaunchDaemons/org.postfix.master.plist > /dev/null 2>&1" );
