#!/bin/sh
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

_server_root=/Applications/Server.app/Contents/ServerRoot

###################################
# mail access promotion

# update auth-submit
_imap_defaults_src="$_server_root/etc/dovecot/default/conf.d"
_imap_defaults_dst="/Library/Server/Mail/Config/dovecot/conf.d"
cp "$_imap_defaults_src/auth-submit.conf.ext" "$_imap_defaults_dst/"

# update auth mechanisms
_auth_conf_file="/Library/Server/Mail/Config/dovecot/conf.d/10-auth.conf"
_auth_conf_file_tmp="/Library/Server/Mail/Config/dovecot/conf.d/10-auth.conf.tmp"
if /usr/bin/grep " x-plain-submit" "$_auth_conf_file" > /dev/null ; then
  sed -e "s/ x-plain-submit//" "$_auth_conf_file" > "$_auth_conf_file_tmp"
  if [ -e "$_auth_conf_file_tmp" ] ; then
    /bin/rm "$_auth_conf_file"
    /bin/mv "$_auth_conf_file_tmp" "$_auth_conf_file"
  fi
fi

# remove urlauth
_imap_conf_file="/Library/Server/Mail/Config/dovecot/conf.d/20-imap.conf"
_imap_conf_file_tmp="/Library/Server/Mail/Config/dovecot/conf.d/20-imap.conf.tmp"
if /usr/bin/grep "  # (APPLE) added urlauth, ; stats is also available" "$_imap_conf_file" > /dev/null ; then
  sed -e "s/  # (APPLE) added urlauth, ; stats is also available//" "$_imap_conf_file" > "$_imap_conf_file_tmp"
  if [ -e "$_imap_conf_file_tmp" ] ; then
    /bin/rm "$_imap_conf_file"
    /bin/mv "$_imap_conf_file_tmp" "$_imap_conf_file"
  fi
fi

if /usr/bin/grep " urlauth" "$_imap_conf_file" > /dev/null ; then
  sed -e "s/ urlauth//" "$_imap_conf_file" > "$_imap_conf_file_tmp"
  if [ -e "$_imap_conf_file_tmp" ] ; then
    /bin/rm "$_imap_conf_file"
    /bin/mv "$_imap_conf_file_tmp" "$_imap_conf_file"
  fi
fi

# remove deprecated imap_fts plug-in
if /usr/bin/grep " imap_fts" "$_imap_conf_file" > /dev/null ; then
  sed -e "s/ imap_fts//" "$_imap_conf_file" > "$_imap_conf_file_tmp"
  if [ -e "$_imap_conf_file_tmp" ] ; then
    /bin/rm "$_imap_conf_file"
    /bin/mv "$_imap_conf_file_tmp" "$_imap_conf_file"
  fi
fi

# verify working directories post migration
if [ ! -d /Library/Server/Mail/Data/attributes ]; then
  mkdir -m 755 /Library/Server/Mail/Data/attributes
  chown _dovecot:mail /Library/Server/Mail/Data/attributes
fi

###################################
# update logging setting

_log_conf_file="/Library/Server/Mail/Config/dovecot/conf.d/10-logging.conf"
_log_conf_file_tmp="/Library/Server/Mail/Config/dovecot/conf.d/10-logging.conf.tmp"
if /usr/bin/grep "^#log_path = syslog" "$_log_conf_file" > /dev/null ; then
  sed -e "s/#log_path = syslog/log_path = \/Library\/Logs\/Mail\/mail-err.log/" "$_log_conf_file" > "$_log_conf_file_tmp"
  if [ -e "$_log_conf_file_tmp" ] ; then
    /bin/rm "$_log_conf_file"
    /bin/mv "$_log_conf_file_tmp" "$_log_conf_file"
  fi
  sed -e "s/info_log_path =/info_log_path = \/Library\/Logs\/Mail\/mail-info.log/" "$_log_conf_file" > "$_log_conf_file_tmp"
  if [ -e "$_log_conf_file_tmp" ] ; then
    /bin/rm "$_log_conf_file"
    /bin/mv "$_log_conf_file_tmp" "$_log_conf_file"
  fi

  sed -e "s/debug_log_path =/debug_log_path = \/Library\/Logs\/Mail\/mail-debug.log/" "$_log_conf_file" > "$_log_conf_file_tmp"
  if [ -e "$_log_conf_file_tmp" ] ; then
    /bin/rm "$_log_conf_file"
    /bin/mv "$_log_conf_file_tmp" "$_log_conf_file"
  fi

  sed -e "s/^syslog_facility/#syslog_facility/" "$_log_conf_file" > "$_log_conf_file_tmp"
  if [ -e "$_log_conf_file_tmp" ] ; then
    /bin/rm "$_log_conf_file"
    /bin/mv "$_log_conf_file_tmp" "$_log_conf_file"
  fi
fi

###################################
# update virus config files

_clamd_conf_file="/Library/Server/Mail/Config/clamav/clamd.conf"
_clamd_def_conf_file="$_server_root/etc/clamd.conf.default"

if [ -e $_clamd_conf_file ] ; then
  if ! /usr/bin/grep "# Specify non-syslog logging level." "$_clamd_conf_file" > /dev/null ; then
    if [ -e $_clamd_def_conf_file ] ; then
      /bin/mv "$_clamd_conf_file" "$_clamd_conf_file-prev-2.2.1"
      /bin/cp "$_clamd_def_conf_file" "$_clamd_conf_file"
    fi
  fi
fi

# set default log level
$_server_root/usr/sbin/serveradmin settings mail:postfix:virus_log_level = info > /dev/null

_freshclam_conf_file="/Library/Server/Mail/Config/clamav/freshclam.conf"
_freshclam_def_conf_file="$_server_root/etc/freshclam.conf.default"

if [ -e $_freshclam_conf_file ] ; then
  if ! /usr/bin/grep "# Specify non-syslog logging level." "$_freshclam_conf_file" > /dev/null ; then
    if [ -e $_freshclam_def_conf_file ] ; then
      /bin/mv "$_freshclam_conf_file" "$_freshclam_conf_file-prev-2.2.1"
      /bin/cp "$_freshclam_def_conf_file" "$_freshclam_conf_file"
    fi
  fi
fi

# set default log level
$_server_root/usr/sbin/serveradmin settings mail:postfix:virus_db_log_level = info > /dev/null

###################################
# reset required hists

_required_hits=`/usr/bin/grep '^$sa_tag2_level_deflt' /Library/Server/Mail/Config/amavisd/amavisd.conf | sed 's/^.*= //' | sed 's/;.*//'`
if [ "$_required_hits" = "" ] ; then
  _required_hits=`$_server_root/usr/sbin/serveradmin settings mail:postfix:required_hits | sed 's/^.*= //'`
  if [[ "$_required_hits" = "" ]] || [[ "$_required_hits" = "0" ]] ; then
    _required_hits="6.0"
  fi
fi
`$_server_root/usr/sbin/serveradmin settings mail:postfix:required_hits = $_required_hits > /dev/null &`

###################################
# list server promotion

# list prefs dir path
_list_prefs_dir="/Library/Server/Mail/Config/listserver/prefs"
if [ ! -d $_list_prefs_dir ]; then
  mkdir -p $_list_prefs_dir
  chown _postfix:mail $_list_prefs_dir
fi

# migrate mail enabled groups to list server
_mail_config="/Library/Server/Mail/Config/MailServicesOther.plist"
if [ -e $_mail_config ]; then
  _groups=`/usr/libexec/PlistBuddy -c "print :postfix:mail_enabled_groups" $_mail_config`
  if [[ $? -eq 0 ]] && [[ $_groups != "" ]] ; then
    /usr/libexec/PlistBuddy -c "add :list_server dict" $_mail_config
    /usr/libexec/PlistBuddy -c "add :list_server:mail_enabled_groups array $_groups" $_mail_config
    _index=0
    _group=`/usr/libexec/PlistBuddy -c "print:postfix:mail_enabled_groups:$_index" $_mail_config`
    while [[ $? -eq 0 ]] && [[ ${_group} != "" ]]
    do
      # add group to list server
      /usr/libexec/PlistBuddy -c "add :list_server:mail_enabled_groups:$_index string $_group" $_mail_config

      # set group non member post setting
      _group_guid=`/usr/bin/dsmemberutil getuuid -G $_group`
      _group_prefs="/Library/Server/Mail/Config/listserver/prefs/${_group_guid}.plist"
      if [ ! -e $_group_prefs ]; then
        echo "" > $_group_prefs
        /usr/sbin/chown _postfix:mail $_group_prefs
        /bin/chmod 640 $_group_prefs
      fi
      _member_post=`/usr/libexec/PlistBuddy -c "print :allow_non_member_posts" $_group_prefs 2>/dev/null`
      if [[ $? -eq 0 ]] && [[ $_member_post == "" ]] ; then
        `/usr/libexec/PlistBuddy -c "add :allow_non_member_posts bool TRUE" $_group_prefs`
      fi

      # get next group
      _index=`expr $_index + 1`
      _group=`/usr/libexec/PlistBuddy -c "print:postfix:mail_enabled_groups:$_index" $_mail_config 2>/dev/null`
    done

    # remove deprecated mail enabled groups
    /usr/libexec/PlistBuddy -c "delete :postfix:mail_enabled_groups" $_mail_config

    # enable list server
    $_server_root/usr/sbin/serveradmin settings mail:postfix:enable_list_server = yes > /dev/null
  fi
fi

###################################
# general cleanup

# set default log level
$_server_root/usr/sbin/serveradmin settings mail:postfix:list_server_log_level = info > /dev/null

###################################
# remove deprecated keys

_src_config_path="/Library/Server/Mail/Config/postfix/main.cf"
_dst_config_path="/Library/Server/Mail/Config/postfix/main.cf.new"
_deprecated_keys=(virus_db_update_enabled virus_db_last_update smtpd_tls_common_name spam_domain_name list_server_log_level)
for _key in ${_deprecated_keys[@]}; do
  if /usr/bin/grep ^$_key $_src_config_path > /dev/null; then
    /usr/bin/sed -e "/$_key/d" "$_src_config_path" > "$_dst_config_path"
	mv $_dst_config_path $_src_config_path
  fi
done

###################################
# service running state validation

# verify service state
if [ -e $_mail_config ]; then
  _service_state=`/usr/libexec/PlistBuddy -c "print :service_state" $_mail_config`
  if [[ $? -eq 0 ]] && [[ $_service_state != "" ]]; then
    if [ $_service_state == "STARTING" ] || [ $_service_state == "RUNNING" ]; then
      # issue start mail comamand
        $_server_root/usr/sbin/serveradmin start mail > /dev/null
    fi
  fi
fi
