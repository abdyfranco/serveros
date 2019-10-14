#!/bin/sh
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

# halt postfix process
/bin/launchctl unload -w /System/Library/LaunchDaemons/org.postfix.master.plist > /dev/null 2>&1

# reset aliases
_aliases=/etc/postfix/aliases
_aliases_server=/etc/postfix/aliases.server
_aliases_desktop=/etc/postfix/aliases.desktop

# save current server aliases
cp -pf $_aliases $_aliases_server

# reset desktop aliases
if [ -e $_aliases_desktop ]; then
  cp -pf $_aliases_desktop $_aliases
  rm $_aliases_desktop
fi

/usr/bin/newaliases > /dev/null 2>&1

# reset data & config paths and server defaults
postconf -e queue_directory=/private/var/spool/postfix
postconf -e data_directory=/var/lib/postfix
postconf -e config_directory=/etc/postfix
postconf -e imap_submit_cred_file=
postconf -e mydestination='$myhostname, localhost.$mydomain, localhost'
postconf -e mailbox_transport=

# setup postfix launchd plist
/usr/libexec/PlistBuddy -c 'Delete :OnDemand' /System/Library/LaunchDaemons/org.postfix.master.plist
/usr/libexec/PlistBuddy -c 'Delete :ProgramArguments' /System/Library/LaunchDaemons/org.postfix.master.plist
/usr/libexec/PlistBuddy -c 'Add :ProgramArguments array' /System/Library/LaunchDaemons/org.postfix.master.plist
/usr/libexec/PlistBuddy -c 'Add :ProgramArguments:0 string master' /System/Library/LaunchDaemons/org.postfix.master.plist
/usr/libexec/PlistBuddy -c 'Add :ProgramArguments:1 string -e' /System/Library/LaunchDaemons/org.postfix.master.plist
/usr/libexec/PlistBuddy -c 'Add :ProgramArguments:2 string 60' /System/Library/LaunchDaemons/org.postfix.master.plist
/usr/libexec/PlistBuddy -c 'Set :QueueDirectories:0 /var/spool/postfix/maildrop' /System/Library/LaunchDaemons/org.postfix.master.plist

# set postfix file & directory permissions
/usr/sbin/postfix set-permissions
/bin/chmod 700 /var/lib/postfix

# stop postfix
/bin/launchctl load -w /System/Library/LaunchDaemons/org.postfix.master.plist > /dev/null 2>&1

# disable mail services
/usr/libexec/PlistBuddy -c 'Set :state SERVICE_DISABLE' /Library/Server/Mail/Config/MailServicesOther.plist
/usr/libexec/PlistBuddy -c 'Set :service_state STOPPED' /Library/Server/Mail/Config/MailServicesOther.plist
/usr/libexec/PlistBuddy -c 'Set :service_state_stamp 0' /Library/Server/Mail/Config/MailServicesOther.plist

# cleanup newsyslog.d
_mail_services_conf=/etc/newsyslog.d/com.apple.mailservices.conf
if [ -e $_mail_services_conf ]; then
  rm $_mail_services_conf
fi