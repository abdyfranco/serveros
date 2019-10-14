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

my $_g_debug = 0;
my $_hostname = "";
my $_mail_gid = getgrnam( "mail" );
my $_dovecot_uid = getpwnam( "_dovecot" );
my $_server_root = "/Applications/Server.app/Contents/ServerRoot";
my $_config_dir = "/Library/Server/Mail/Config";

# install default dovecot config
my $_dovecot_src_cofig = $_server_root . "/private/etc/dovecot";
my $_dovecot_config_dir = $_config_dir . "/dovecot";
my $_dovecot_conf = $_dovecot_config_dir . "/dovecot.conf";
if ( !(-d $_dovecot_config_dir) || !(-e $_dovecot_conf) ) {
	mk_dir( $_dovecot_config_dir );
	copy_dir( $_dovecot_src_cofig, $_dovecot_config_dir );
} else {
	# upgrade from 2.2.1 or re-premotion
	if ( ! `grep "Version 2.2.x (AR14759611)" /Library/Server/Mail/Config/dovecot/conf.d/10-auth.conf` ) {
		# save previous dovecot config
		move($_dovecot_config_dir, $_dovecot_config_dir . "-prev-2.2.1");
		mk_dir( $_dovecot_config_dir );
		move($_dovecot_config_dir . "-prev-2.2.1", $_dovecot_config_dir . "/dovecot-prev-2.2.1" );

		# install new conf giles
		copy_dir( $_dovecot_src_cofig, $_dovecot_config_dir );
		copy_dir( $_dovecot_config_dir . "/default", $_dovecot_config_dir );

		# migrate previous settings
		migrate_dovecot_config();
	}

  # set global acl directory
  my $_global_acl_dir = $_dovecot_config_dir . "/global-acls";
  mk_dir( $_global_acl_dir );
  chmod( 0750, $_global_acl_dir );
  chown( $_dovecot_uid, $_mail_gid, $_global_acl_dir );

  # validate config
  verify_submit_pass();

  # everything else should already be configured
  exit( 0 );
}

copy_dir( $_dovecot_config_dir . "/default", $_dovecot_config_dir );

# set global acl directory
my $_global_acl_dir = $_dovecot_config_dir . "/global-acls";
mk_dir( $_global_acl_dir );
chmod( 0750, $_global_acl_dir );
chown( $_dovecot_uid, $_mail_gid, $_global_acl_dir );

# set postmaster_address
$_hostname = get_hostname();
my $_lda_conf = $_dovecot_config_dir . "/conf.d/15-lda.conf";
my $_lda_conf_new = $_dovecot_config_dir . "/conf.d/15-lda.conf-new";
if ( -e $_lda_conf ) {
	open( SRC_FILE, "<$_lda_conf");
	open( DST_FILE, ">$_lda_conf_new");
	while( <SRC_FILE> ) {
		my( $line ) = $_;
		if ( (substr($line, 0, 18) eq "postmaster_address") || (substr($line, 0, 19) eq "#postmaster_address")) {
			my $_pm_addr = "postmaster_address = postmaster@" . $_hostname . "\n";
			print DST_FILE $_pm_addr;
		} else {
			print DST_FILE $_;
		}
	}
	close(SRC_FILE);
	close(DST_FILE);
	move($_lda_conf_new, $_lda_conf);
}

# verify config
verify_submit_pass();

# exit normally
exit( 0 );

###############################
# verify submit.passdb
sub verify_submit_pass ()
{
	my $_passwd = "";
	my $_submit_pass = $_dovecot_config_dir . "/submit.passdb";
	if ( -e $_submit_pass ) {
		open( SUBMIT_PASSDB, $_submit_pass );
		if ( !grep{/::\/var\/empty::/} <SUBMIT_PASSDB> ) {
			$_passwd = `grep "^submit:{PLAIN}" $_submit_pass | sed 's,.*},,'`;
			move($_submit_pass, $_submit_pass . "-prev-2.2.1");
		}
		close( SUBMIT_PASSDB );
	}

	if ( ! -e $_submit_pass ) {
		my $_submit_cred = $_config_dir . "/postfix/submit.cred";

		# get password from postfix's submit.cred if it exists
		if ( ($_passwd eq "") && (-e $_submit_cred) ) {
			if ( $_hostname eq "" ) {
				$_hostname = get_hostname();
			}
			open( SUBMIT_CRED, $_submit_cred );
			if ( grep{/^$_hostname/} <SUBMIT_CRED> ) {
				$_passwd = `grep "^$_hostname|submit|" $_submit_cred | sed 's,.*|,,'`;
			}
			close( SUBMIT_CRED );
		}

		# if no preconfigured pw, create an unguessable random password
		if ( $_passwd eq "" ) {
			$_passwd = `dd if=/dev/urandom bs=256 count=1 2>&1 | env LANG=C tr -dc a-zA-Z0-9 2>&1 | cut -b 1-22 2>&1`;
		}

		# set submit.passdb password
		if ( $_passwd ne "" ) {
			chomp( $_passwd );
			open(SUBMIT_PASS,">$_submit_pass");
			print SUBMIT_PASS "submit:{PLAIN}$_passwd:$_dovecot_uid:$_mail_gid" . "::/var/empty::\n";
			close(SUBMIT_PASS);
		}
	}
}

###############################
# get host name
sub get_hostname
{
	my $_out_hostname = `$_server_root/usr/sbin/postconf -c /Library/Server/Mail/Config/postfix -h myhostname`;
	chomp( $_out_hostname );
	if ( $_out_hostname eq "" ) {
		$_out_hostname = `hostname`;
		chomp( $_out_hostname );
	}
	return $_out_hostname;
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
sub copy_dir
{
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

###############################
# check if a path exists
sub path_exists ($)
{
	my ($in_path) = @_;
	if (-e "${in_path}") {
		return 1;
	}
	return 0;
} # path_exists

###############################
# print if DEBUG
sub print_debug ($)
{
	my( $in_string ) = @_;
	if ( $_g_debug == 1 ) {
		print( "$in_string\n" );
	}
}

###############################
# modify config value
sub sed_conf
{
	die unless @_ == 6;
	my $conf = shift or die;
	my $cmt = shift;
	my $key = shift or die;
	my $action = shift or die;
	my $value = shift;
	my $secpat = shift;

	my $srcpath = "/Library/Server/Mail/Config/dovecot/$conf";
	if (!open(SRC, "<", $srcpath)) {
		print_debug( "can't read config file $srcpath: $!" );
		return;
	}

	my $dstpath = "/Library/Server/Mail/Config/dovecot/$conf.new";
	if (!open(DST, ">", $dstpath)) {
		print_debug( "can't create config file $dstpath: $!" );
		close SRC;
		return;
	}

	my $cmtpat = "";
	$cmtpat = qr{(?:#\s*)?} if $cmt;

	my $done = 0;
	my $unneeded = 0;
	my @section;
	while (my $line = <SRC>) {
		chomp $line;
		$line =~ s/^(\s*)//;
		my $indent = $1;

		if ($line =~ /^([^#]+){/) {
			# begin conf section
			push @section, $1;
		} elsif ($line =~ /^}/) {
			# end conf section
			pop @section;
		} elsif ($done) {
			# skip
		} elsif (!defined($secpat) || (@section == 1 && $section[0] =~ $secpat)) {
			if ($action eq "=") {
				# replace value
				print_debug( "(replace)    line: $line" );
				if ($line =~ s/^$cmtpat($key\s*=\s*).*$/$1$value/) {
					$done = 1;
				}
			} elsif ($action eq "+") {
				# append to list value if not already there
				print_debug( " (append)    line: $line" );
				if ($line =~ /$key\s*=.*(\s|=)$value(\s|$)/) {
					$unneeded = 1;
				} elsif ($line =~ s/^$cmtpat($key\s*=\s*.*)/$1 $value/) {
					$done = 1;
				}
			} elsif ($action eq "-") {
				# remove from list value
				print_debug( " (remove)    line: $line" );
				if ($line =~ s/^$cmtpat($key\s*=\s*)$value(\s.*|$)/$1$2/ ||
				    $line =~ s/^$cmtpat($key\s*=.*)\s$value(\s.*|$)/$1$2/) {
					$done = 1;
				} elsif ($line =~ /^$cmtpat$key\s*=/) {
					$unneeded = 1;
				}
			} elsif ($action eq "X") {
				# delete line
				print_debug( " (delete)    line: $line" );
				if ($line =~ m/^$cmtpat.*$key/) {
					$done = 1;
					next;
				}
			} else {
				die;
			}
		}
		print DST "$indent$line\n";
	}

	close DST;
	close SRC;

	if (!$done) {
		if (!$unneeded) {
			print_debug( "key \"$key\" not found in $srcpath, can't change value ($action $value)" );
		}
		unlink($dstpath);
		return;
	}

	my $savedir = "/Library/Server/Mail/Config/dovecot/pre-migrate";
	mkdir($savedir, 0755);
	mkdir("$savedir/conf.d", 0755);
	my $savepath = "$savedir/$conf";
	if (!rename($srcpath, $savepath)) {
		print_debug( "can't rename $srcpath -> $savepath: $!" );
		return;
	}
	if (!rename($dstpath, $srcpath)) {
		print_debug( "can't rename $dstpath -> $srcpath: $!" );
		return;
	}
} # sed_conf

###############################
# modify config value
sub sed_section
{
	die unless @_ == 5;
	my $conf = shift or die;
	my $enable = shift;
	my $level = shift;
	my $namepat = shift or die;
	my $value = shift;

	my $srcpath = "/Library/Server/Mail/Config/dovecot/$conf";
	if (!open(SRC, "<", $srcpath)) {
		print_debug( "can't read config file $srcpath: $!" );
		return;
	}

	my $dstpath = "/Library/Server/Mail/Config/dovecot/$conf.new";
	if (!open(DST, ">", $dstpath)) {
		print_debug( "can't create config file $dstpath: $!" );
		close SRC;
		return;
	}

	my $found = 0;
	my $done = 0;
	my @section;
	while (my $line = <SRC>) {
		chomp $line;
		$line =~ s/^(\s*)//;
		my $indent = $1;

		if ($done) {
			# skip
		} elsif (!$found && $line =~ /^#?\s*(.+){/) {
			# begin conf section
			my $name = $1;
			if (@section == $level && $name =~ /^$namepat\s*$/) {
				$line = "$value {";
				$line = "#$line" unless $enable;
				$found = 1;
			}
			push @section, $name;
		} elsif ($line =~ /^#?\s*}/) {
			# end conf section
			pop @section;
			if (@section == $level && $found) {
				$line = "}";
				$line = "#$line" unless $enable;
				$done = 1;
			}
		}
		print DST "$indent$line\n";
	}

	close DST;
	close SRC;

	if (!$done) {
		print_debug( "section \"$namepat\" not found in $srcpath, can't change value ($enable $value)" );
		unlink($dstpath);
		return;
	}

	my $savedir = "/Library/Server/Mail/Config/dovecot/pre-migrate";
	mkdir($savedir, 0755);
	mkdir("$savedir/conf.d", 0755);
	my $savepath = "$savedir/$conf";
	if (!rename($srcpath, $savepath)) {
		print_debug( "can't rename $srcpath -> $savepath: $!" );
		return;
	}
	if (!rename($dstpath, $srcpath)) {
		print_debug( "can't rename $dstpath -> $srcpath: $!" );
		return;
	}
} # sed_section

###############################
# apend config data
sub append_conf
{
	my $conf = shift or die;
	my $text = shift or die;

	my $dstpath = "/Library/Server/Mail/Config/dovecot/$conf";
	if ( !open(DST, ">>", $dstpath) ) {
		return;
	}

	print DST $text;
	close DST;
} # append_conf

###############################
# migrate dovecot config data
sub migrate_dovecot_config ()
{
	# All the config files that may change.  Others not listed won't.
	my $imap_conf =			"dovecot.conf";
	my $imap_conf_auth =	"conf.d/10-auth.conf";
	my $imap_conf_logging =	"conf.d/10-logging.conf";
	my $imap_conf_mail =	"conf.d/10-mail.conf";
	my $imap_conf_master =	"conf.d/10-master.conf";
	my $imap_conf_ssl =		"conf.d/10-ssl.conf";
	my $imap_conf_lda =		"conf.d/15-lda.conf";
	my $imap_conf_imap =	"conf.d/20-imap.conf";
	my $imap_conf_plugin =	"conf.d/90-plugin.conf";
	my $imap_conf_quota =	"conf.d/90-quota.conf";
	my $imap_conf_submit =	"conf.d/auth-submit.conf.ext";
	my $imap_conf_od =		"conf.d/auth-od.conf.ext";
	my @conf_files = ($imap_conf,
					  $imap_conf_auth,
					  $imap_conf_logging,
					  $imap_conf_mail,
					  $imap_conf_master,
					  $imap_conf_ssl,
					  $imap_conf_lda,
					  $imap_conf_imap,
					  $imap_conf_plugin,
					  $imap_conf_quota,
					  $imap_conf_submit,
					  $imap_conf_od);

	# All the config parameters that Server Admin or one of the mail
	# setup scripts could have changed.  "Hot" means uncommented.
	my %val = ("protocols"				=> undef,
			   "disable_plaintext_auth"	=> undef,
			   "ssl"					=> undef,
			   "ssl_cert"				=> undef,
			   "ssl_key"				=> undef,
			   "ssl_ca"					=> undef,
			   "mail_location"			=> undef,
			   "mail_debug"				=> undef,
			   "mail_attribute_dict"	=> undef,
			   "mmap_disable"			=> undef,
			   "dotlock_use_excl"		=> undef,
			   "max_mail_processes"		=> undef,
			   "aps_topic"				=> undef,
			   "postmaster_address"		=> undef,
			   "hostname"				=> undef,
			   "imap_urlauth_submit_user" => undef,
			   "lda_plugins"			=> undef,
			   "auth_realms"			=> undef,
			   "auth_debug"				=> undef,
			   "auth_debug_passwords"	=> undef,
			   "auth_mechanisms"		=> undef,
			   "userdb_od_args"			=> undef,
			   "quota_warning"			=> undef,
			   "quota_warning2"			=> undef);
	my %hot;

	# determine all options set in old config file(s)
	#my $from_dovecot2 = path_exists( "$g_target_root$_DOVECOT_CONFIG/$oldtag/conf.d" );
	my $from_dovecot2 = path_exists( "/Library/Server/Mail/Config/dovecot/dovecot-prev-2.2.1/conf.d" );
	for my $file (@conf_files) {
		my $dcold = "/Library/Server/Mail/Config/dovecot/dovecot-prev-2.2.1/$file";
		if (open(DCOLD, "<", $dcold)) {
			my @section;
			while (my $line = <DCOLD>) {
				chomp $line;
				$line =~ s/^\s+//;
				my $hot = !($line =~ s/^#\s*//);

				if ($hot && $line =~ /^([^#]+){/) {
					# begin conf section
					my $name = $1;
					push @section, $name;

					# any namespaces defined?
					$hot{namespace} = 1 if $name =~ /^namespace\s/;

					# service stats defined?
					$hot{service_stats} = 1 if $name =~ /^service\s+stats\s/;

					# service indexer-worker defined?
					$hot{service_indexer_worker} = 1 if $name =~ /^service\s+indexer-worker\s/;
				} elsif ($hot && $line =~ /^}/) {
					# end conf section
					pop @section;
				} elsif ($line =~ /^(protocols)\s*=\s*(.*)/ && ($hot || !defined($hot{protocols}))) {
					$val{$1} = $2;
					$hot{$1} = $hot;
				} elsif ($line =~ /^(auth_mechanisms)\s*=\s*(.*)/ && ($hot || !defined($hot{auth_mechanisms}))) {
					$val{$1} = $2;
					$hot{$1} = $hot;
				} elsif ($line =~ /^(aps_topic)\s*=\s*(.*)/ && ($hot || !defined($hot{aps_topic}))) {
					$val{$1} = $2;
					$hot{$1} = $hot;
				} elsif (@section == 0 &&
					 $line =~ /^(disable_plaintext_auth |
								 ssl |
								 mail_location |
								 mail_debug |
								 mail_attribute_dict |
								 imap_urlauth_submit_user |
								 mmap_disable |
								 dotlock_use_excl |
								 max_mail_processes |
								 auth_realms |
								 auth_debug |
								 auth_debug_passwords)\s*=\s*(.*)/x &&
						 ($hot || !defined($hot{$1}))) {
					die unless exists $val{$1};	# check for typos
					$val{$1} = $2;
					$hot{$1} = $hot;
				} elsif ($line =~ /^ssl_disable\s*=\s*(.*)/ && ($hot || !defined($hot{ssl}))) {
					if ($1 eq "yes") {
						$val{ssl} = "no";
					} elsif ($hot{protocols} && grep { $_ eq "imap" || $_ eq "pop3" } @{$val{protocols}}) {
						$val{ssl} = "yes";
					} else {
						$val{ssl} = "required";
					}
					$hot{ssl} = $hot;
				} elsif ($line =~ /^(ssl_(?:cert|key|ca))(?:_file)?\s*=\s*(.*)/ && ($hot || !defined($hot{$1}))) {
					die unless exists $val{$1};	# check for typos
					$val{$1} = $2;
					$hot{$1} = $hot;
				} elsif (@section == 1 && $section[0] =~ /^protocol\s+lda\s+/ &&
						 $line =~ /^(postmaster_address |
									 hostname)\s*=\s*(.*)/x &&
						 ($hot || !defined($hot{$1}))) {
					die unless exists $val{$1};	# check for typosx
					$val{$1} = $2;
					$hot{$1} = $hot;
				} elsif (@section == 1 && $section[0] =~ /^protocol\s+lda\s+/ &&
						 $line =~ /^mail_plugins\s*=\s*(.*)/ &&
						 ($hot || !defined($hot{lda_plugins}))) {
					@{$val{lda_plugins}} = split(/\s+/, $1);
					$hot{lda_plugins} = $hot;
				} elsif (@section == 1 && $section[0] =~ /^userdb\s+/ &&
						 $line =~ /^args\s*=\s*(.*)/ &&
						 ($hot || !defined($hot{userdb_od_args}))) {
					@{$val{userdb_od_args}} = split(/\s+/, $1);
					$hot{userdb_od_args} = $hot;
				} elsif (@section == 1 && $section[0] =~ /^plugin\s+$/ &&
						 $line =~ /^(quota_warning2?)\s*=\s*(.*)/ &&
						 ($hot || !defined($hot{$1}))) {
					die unless exists $val{$1};	# check for typos
					$val{$1} = $2;
					$hot{$1} = $hot;
				} elsif (@section == 1 && $section[0] =~ /^userdb/ &&
						 $line =~ /^args\s*=\s*.*submit\.passdb/ &&
						 $hot) {
					$hot{userdb_submit_passdb} = 1;
				}
			}
			close(DCOLD);
		} elsif ($file !~ /conf\.d/ || $from_dovecot2) {
			print_debug( "can't read $dcold: $!" );
		}
	}

	# convert options
	if ($hot{ssl_cert} && $val{ssl_cert} !~ /^</) {
		$val{ssl_cert} = "<$val{ssl_cert}";
	}
	if ($hot{ssl_key} && $val{ssl_key} !~ /^</) {
		$val{ssl_key} = "<$val{ssl_key}";
	}
	if ($hot{ssl_ca} && $val{ssl_ca} !~ /^</) {
		$val{ssl_ca} = "<$val{ssl_ca}";
	}
	if ($hot{quota_warning} && $val{quota_warning} =~ /storage=(\d+)%/) {
		$val{quota_warning} = "storage=$1%% quota-exceeded \%u";
	}
	if ($hot{quota_warning2} && $val{quota_warning2} =~ /storage=(\d+)%/) {
		$val{quota_warning2} = "storage=$1%% quota-warning \%u";
	}

	# set appropriate options in new config files
	sed_conf($imap_conf,			1, "protocols",				"=", $val{protocols},						undef)						if $hot{protocols};
	sed_conf($imap_conf_auth,		1, "disable_plaintext_auth","=", $val{disable_plaintext_auth},			undef)						if $hot{disable_plaintext_auth};
	sed_conf($imap_conf_ssl,		1, "ssl",					"=", $val{ssl},								undef)						if $hot{ssl};
	sed_conf($imap_conf_ssl,		1, "ssl_cert",				"=", $val{ssl_cert},						undef)						if $hot{ssl_cert};
	sed_conf($imap_conf_ssl,		1, "ssl_key",				"=", $val{ssl_key},							undef)						if $hot{ssl_key};
	sed_conf($imap_conf_ssl,		1, "ssl_ca",				"=", $val{ssl_ca},							undef)						if $hot{ssl_ca};
	sed_conf($imap_conf_mail,		0, "mail_location",			"=", $val{mail_location},					undef)						if $hot{mail_location};
	sed_conf($imap_conf_logging,	1, "mail_debug",			"=", $val{mail_debug},						undef)						if $hot{mail_debug};
	sed_conf($imap_conf_mail,		1, "mmap_disable",			"=", $val{mmap_disable},					undef)						if $hot{mmap_disable};
	sed_conf($imap_conf_mail,		1, "dotlock_use_excl",		"=", $val{dotlock_use_excl},				undef)						if $hot{dotlock_use_excl};
	sed_conf($imap_conf_master,		1, "process_limit",			"=", $val{max_mail_processes},			qr{^service\s+(imap|pop3)\s+})	if $hot{max_mail_processes};
	sed_conf($imap_conf,			1, "aps_topic",				"=", $val{aps_topic},						undef)						if $hot{aps_topic};
	sed_conf($imap_conf_lda,		1, "postmaster_address",	"=", $val{postmaster_address},				undef)						if $hot{postmaster_address} and $val{postmaster_address} !~ /example\.com/;
	sed_conf($imap_conf_lda,		1, "hostname",				"=", $val{hostname},						undef)						if $hot{hostname};
	# in dovecot < 2.2 urlauth was a plugin.  in dovecot >= 2.2 it's built in
	sed_conf($imap_conf_imap,		1, "mail_plugins",			"-", "urlauth",								qr{^protocol\s+imap\s+});
	sed_conf($imap_conf_imap,		1, "mail_plugins",			"-", "imap_fts",							qr{^protocol\s+imap\s+});
	sed_conf($imap_conf_lda,		1, "mail_plugins",			"+", "sieve",								qr{^protocol\s+lda\s+})		if $hot{lda_plugins} and grep { $_ eq "sieve" } @{$val{lda_plugins}};
	sed_conf($imap_conf_lda,		1, "mail_plugins",			"+", "push_notify",							qr{^protocol\s+lda\s+})		if $hot{lda_plugins} and grep { $_ eq "push_notify" } @{$val{lda_plugins}};
	sed_conf($imap_conf_logging,	1, "auth_debug",			"=", $val{auth_debug},						undef)						if $hot{auth_debug};
	sed_conf($imap_conf_logging,	1, "auth_debug_passwords",	"=", $val{auth_debug_passwords},			undef)						if $hot{auth_debug_passwords};
	sed_conf($imap_conf_auth,		1, "auth_realms",			"=", $val{auth_realms},						undef)						if $hot{auth_realms};
	sed_conf($imap_conf_auth,		1, "auth_mechanisms",		"=", $val{auth_mechanisms},					undef)						if $hot{auth_mechanisms};
	sed_conf($imap_conf_auth,		1, "auth_mechanisms",		"-", "x-plain-submit",						undef);
	sed_conf($imap_conf_od,			1, "args",					"=", join(" ", @{$val{userdb_od_args}}),	qr{^userdb\s+})				if $hot{userdb_od_args};
	sed_conf($imap_conf_quota,		1, "quota_warning",			"=", $val{quota_warning},					qr{^plugin\s+})				if $hot{quota_warning};
	sed_conf($imap_conf_quota,		1, "quota_warning2",		"=", $val{quota_warning2},					qr{^plugin\s+})				if $hot{quota_warning2};
	if (!$hot{namespace}) {
		sed_section($imap_conf_mail, 1, 0, qr/namespace/, "namespace inbox");
		sed_conf($imap_conf_mail,	1, "inbox",					"=", "yes",									qr{^namespace\s+inbox});
	}
	if (!$hot{service_stats}) {
		append_conf($imap_conf_master, <<'EOT');

# for stats plugin, if enabled
service stats {
  fifo_listener stats-mail {
    user = _dovecot
    mode = 0600
  }
}
EOT
	}
	if (!$hot{service_indexer_worker}) {
		append_conf($imap_conf_master, <<'EOT');

# To reduce indexer-workers' CPU and disk I/O load, change process_limit.
service indexer-worker {
  user = _dovecot
  #process_limit = 10
}
EOT
	}
	if (!$hot{mail_attribute_dict}) {
		# dovecot >= 2.2 needs mail_attribute_dict
		append_conf($imap_conf_mail, <<'EOT');

mail_attribute_dict = file:/Library/Server/Mail/Data/attributes/attributes.dict
EOT
	}
	if (!$hot{imap_urlauth_submit_user}) {
		# dovecot >= 2.2 needs imap_urlauth_submit_user
		append_conf($imap_conf_imap, <<'EOT');

# User with submission privileges.
imap_urlauth_submit_user = submit
EOT
	}
	if (!$hot{userdb_submit_passdb}) {
		# dovecot >= 2.2 needs userdb for submit.passdb
		append_conf($imap_conf_submit, <<'EOT');

userdb {
  driver = passwd-file
  args = /Library/Server/Mail/Config/dovecot/submit.passdb
}
EOT
	}

	# partition map
	copy("/Library/Server/Mail/Config/dovecot/dovecot-prev-2.2.1/partition_map.conf", "/Library/Server/Mail/Config/dovecot/partition_map.conf");

	# dovecot notify
	if ( path_exists( "/Library/Server/Mail/Config/dovecot/notify" ) ) {
		chown( $_dovecot_uid, $_mail_gid, "/Library/Server/Mail/Config/dovecot/notify" );
	}

	# mailusers.plist
	unlink("/private/var/db/.mailusers.plist");
} # migrate_dovecot_config
