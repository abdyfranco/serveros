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

## Migration Script for Mail Services
# srvrmgr
##################   Input Parameters  #######################
# --purge <0 | 1>   "1" means remove any files from the old system after you've migrated them, "0" means leave them alone.
# --sourceRoot <path> The path to the root of the system to migrate
# --sourceType <System | TimeMachine> Gives the type of the migration source, whether it's a runnable system or a
#                  Time Machine backup.
# --sourceVersion <ver> The version number of the old system (like 10.6.5 or 10.7). Since we support migration from 10.6, 10.7,
#                   and other 10.8 installs.
# --targetRoot <path> The path to the root of the new system.
# --language <lang> A language identifier, such as \"en.\" Long running scripts should return a description of what they're doing
#                   (\"Migrating Open Directory users\"), and possibly provide status update messages along the way. These messages
#                   need to be localized (which is not necessarily the server running the migration script).
#                   This argument will identify the Server Assistant language. As an alternative to doing localization yourselves
#                   send them in English, but in case the script will do this it will need this identifier.
#
# Example: /System/Library/ServerSetup/MigrationExtras/65_mail_migrator.pl --purge 0 --language en --sourceType System --sourceVersion 10.6 --sourceRoot "/Previous System" --targetRoot "/"

############################# System  Constants #############################
my $CAT = "/bin/cat";
my $CP = "/bin/cp";
my $MV = "/bin/mv";
my $RM = "/bin/rm";
my $DSCL = "/usr/bin/dscl";
my $DU = "/usr/bin/du";
my $ECHO = "/bin/echo";
my $GREP = "/usr/bin/grep";
my $CHOWN = "/usr/sbin/chown";
my $LAUNCHCTL = "/bin/launchctl";
my $POSTMAP = "/usr/sbin/postmap";
my $POSTCONF = "/usr/sbin/postconf";
my $POSTFIX = "/usr/sbin/postfix";
my $MKDIR = "/bin/mkdir";
my $PLIST_BUDDY = "/usr/libexec/PlistBuddy";
my $TAR = "/usr/bin/tar";

# ServerRoot paths
my $_server_root	= "/Applications/Server.app/Contents/ServerRoot";
my $_cert_admin		= $_server_root . "/usr/sbin/certadmin";
my $_server_ctl		= $_server_root . "/usr/sbin/serverctl";
my $_server_admin	= $_server_root . "/usr/sbin/serveradmin";
my $_mail_data_tool	= $_server_root . "/usr/bin/mail_data_tool";
my $_promo_extras	= $_server_root . "/System/Library/ServerSetup/PromotionExtras";

# Config & Data Roots
my $_MAIL_ROOT		= "/Library/Server/Mail";
my $_DATA_ROOT		= "/Library/Server/Mail/Data";
my $_CONFIG_ROOT	= "/Library/Server/Mail/Config";
my $_POSTFIX_CONFIG	= "/Library/Server/Mail/Config/postfix";
my $_DOVECOT_CONFIG	= "/Library/Server/Mail/Config/dovecot";

# Migration logs
my $_migration_log_dir	= "/Library/Logs/Migration";
my $_migration_log_file	= "/Library/Logs/Migration/mailmigrator.log";

# Launchd
my $POSTFIX_LAUNCHD_PLIST	= "/System/Library/LaunchDaemons/org.postfix.master.plist";

# System user & group IDs
my $_dovecot_uid	= getpwnam( "_dovecot" );
my $_mail_gid		= getgrnam ( "mail" );

############################## Version Consts  ##############################
my $SYS_VERS	= "0";	#10.7.5
my $SYS_MAJOR	= "0";	#10
my $SYS_MINOR	= "0";	# 7
my $SYS_UPDATE	= "-";	# 5
my $SRV_VERS	= "0";	#10.7.5
my $SRV_MAJOR	= "0";	#10
my $SRV_MINOR	= "0";	# 7
my $SRV_UPDATE	= "-";	# 5
my $MIN_VER		= "10.6"; # => 10.6.0
my $MAX_VER		= "10.9"; # <  10.9

my $TARGET_VER = "10.9";

################################## Globals ##################################
my $g_purge				= 0;	# So we will be default copy the items if
								# there's no option specified.
my $g_source_root		= "";
my $g_source_type		= "";
my $g_source_version	= "";	# This is the version number of the old system
								# passed into us by Server Assistant.
								# [10.6.x, 10.7.x, and potentially 10.8.x]
my $g_source_uuid		= "";
my $g_target_root		= "";
my $g_target_root_orig	= "";
my $g_language			= "en";	# Should be Tier-0 only in iso format
								# [en, fr, de, ja], we default this to English, en.

my $g_xsan_volume		= "null";
my $g_dovecot_ssl_key	= "";
my $g_dovecot_ssl_cert	= "";
my $g_dovecot_ssl_ca	= "";

my @g_partitions		= ();
my @g_clean_partitions	= ();
my $g_default_partition	= "/Library/Server/Mail/Data/mail";

my $g_enable_spam		= 0;
my $g_enable_virus		= 0;
my $g_required_hits		= 6.9;
my $g_spam_subj_tag		= "*** JUNK MAIL ***";

my $g_os_ver_10_6_x		= 0;	# Set to 1 if source is 10.6.x
my $g_os_ver_10_7_x		= 0;	# Set to 1 if source is 10.7.x
my $g_os_ver_10_8_x		= 0;	# Set to 1 if source is 10.8.x
my $g_os_ver_10_9_x		= 0;	# Set to 1 if source is 10.9.x

################################## Strings ##################################
my $g_header_string		= "### DO NOT MANUALLY EDIT THIS FILE ###\n# This file is automatically generated\n# any manual additions to this file will be lost\n\n";

################################### Flags ###################################
my $DEBUG		= 0;
my $FUNC_LOG	= 0;

#############################################################################
# main
#############################################################################

use Foundation;
use File::Copy;
use File::Basename;

if ($ENV{DEBUG} eq 1) {
	$DEBUG = '1'; }

if ( $ENV{FUNC_LOG} eq 1 ) {
	$FUNC_LOG = '1'; }

parse_options();

if ( ${DEBUG} ) {
	print_script_args( @ARGV ); }

if ( !path_exists( $_migration_log_dir ) ) {
	mkdir($_migration_log_dir, 0755);
}

open (LOG_FILE, ">> $_migration_log_file") or die("$_migration_log_file: $!\n");

do_migration( @ARGV );

exit( 0 );


################################# Functions #################################

#############################################################################
# log_msg ()

sub log_msg()
{
	print LOG_FILE "@_";
}

#############################################################################
# log_message ()

sub log_message()
{
	my $time = localtime();
	print LOG_FILE "$time: @_\n";
}

#############################################################################
# log_exit_error ()

sub log_exit_error()
{
	my $log_err_str = "Error: @_";
	&log_message( $log_err_str );
	&log_message( "---- Exiting due to error ----" );
	print( "$log_err_str\n\n" );
	Usage();
}

#############################################################################
# print_message ()

sub print_message ()
{
	my ( $line_0 ) = $_[0];
	my ( $line_1 ) = $_[1];
	my ( $line_2 ) = $_[2];
	my ( $line_3 ) = $_[3];

	log_funct( "print_message" );

	&log_message( "*************************************************************" );
	if ( ! ("${line_0}" eq "") ) {
		&log_message( "** ${line_0}" ); }
	if ( ! ("${line_1}" eq "") ) {
		&log_message( "** ${line_1}" ); }
	if ( ! ("${line_2}" eq "") ) {
		&log_message( "** ${line_2}" ); }
	if ( ! ("${line_3}" eq "") ) {
		&log_message( "** ${line_3}" ); }
	&log_message( "** Please refer to the Migration and Upgrade Guide for" );
	&log_message( "** instructions on how to manually migrate configuration data." );
	&log_message( "*************************************************************" );
} # print_message

################################################################################
# function log

sub log_funct ($)
{
	my( $in_function ) = @_;

	if ( ${FUNC_LOG} ) {
		&log_message( "----------------------" );
		&log_message( ":: $in_function () ::" );
	}
}

################################################################################
# log if DEBUG

sub log_debug ($)
{
	my( $in_string ) = @_;

	if ( ${DEBUG} ) {
		&log_message( "$in_string" );
	}
}

################################################################################
# plist methods

sub obj_value
{
  my ( $object ) = @_;
  return( $object->description()->UTF8String() );
} # obj_value


#############################################################################
# get_cert_name ()
#
#	normalize certificate names for comparison

sub get_cert_name ($)
{
	my( $in_cert ) = @_;

	# get base name from full cert path
	my $full_name = basename( $in_cert );

	# split up cert name
	my @tokens = split('\.', $full_name);
	my $token_count = $#tokens;

	# remove GUID tag
	splice @tokens, $token_count - 2, 1;

	# return cert name
	return( join('.', @tokens) );

#	return( $out_cert );
}

#############################################################################
# map_ssl_cert ()
#
#	: map default certificate from 10.5 to 10.6/7 certificates

sub map_ssl_cert ($)
{
	my( $in_cert ) = @_;

	log_funct( "map_ssl_cert" );
	log_debug( "Mapping certificate: ${in_cert}" );

	# map from current certificates directory
	my $cert_dir = `$_cert_admin --export-directory`;
	chomp(  $cert_dir );
	if ( ! -d "$cert_dir" ) {
		&log_message( "Error: Unable to map: $in_cert certificate export directory: $cert_dir does not exist" );
		return( "" );
	}

	# change to certificate export directory
	chdir( "$cert_dir" );

	my @mail_certs = <*>;
	foreach my $a_cert ( @mail_certs ) {
		chomp( $a_cert );
		my $cert_name = get_cert_name( $a_cert );

		# looking for key
		if ( $cert_name eq $in_cert ) {
			&log_message( "  Mapping certificate name: $in_cert to: $a_cert" );
			return( $cert_dir . "/" . $a_cert );
		}
	}

	# Not good, no certificate found in "certadmin --export-directory" that matches
	#	configuration settings from previous server
	&log_message( "Warning: No certificate map found for: " . $in_cert ."" );

	return( "" );
} # map_ssl_cert

#############################################################################
# set_ssl_certs ()

sub set_ssl_certs ()
{
	log_funct( "set_ssl_certs" );

	&log_message( "Migrating SSL certificates" );

	#################################
	# Default Certificate validataion
	#################################

	## certificate sanity check
	# first get default certificates (we may need these later)
	my $default_cert = `$_cert_admin --default-certificate-path`;
	chomp($default_cert);
	&log_message( "  default-cert: $default_cert" );

	my $default_key = `$_cert_admin --default-private-key-path`;
	chomp($default_key);
	&log_message( "   default-key: $default_key" );

	my $default_ca = `$_cert_admin --default-certificate-authority-chain-path`;
	chomp($default_ca);
	&log_message( "    default-ca: $default_ca" );

	##################################
	# POP/IMAP Certificate validataion
	##################################

	&log_message( "Getting current POP/IMAP server certificate settings" );

	my $valid_imap_key = 0;
	my $imap_key = `grep "^ssl_key " "$g_target_root$_DOVECOT_CONFIG/conf.d/10-ssl.conf" | sed 's/ssl_key//' | sed 's/=//' | sed 's/ //g' | sed 's/<//'`;
	chomp($imap_key);
	if ( $imap_key eq "" ) {
		$imap_key = `grep "^#ssl_key " "$g_target_root$_DOVECOT_CONFIG/conf.d/10-ssl.conf" | sed 's/#ssl_key//' | sed 's/=//' | sed 's/ //g' | sed 's/<//'`;
		chomp($imap_key);
	}

	my $valid_imap_cert = 0;
	my $imap_cert = `grep "^ssl_cert " "$g_target_root$_DOVECOT_CONFIG/conf.d/10-ssl.conf" | sed 's/ssl_cert//' | sed 's/=//' | sed 's/ //g' | sed 's/<//'`;
	chomp($imap_cert);
	if ( $imap_cert eq "" ) {
		$imap_cert = `grep "^#ssl_cert " "$g_target_root$_DOVECOT_CONFIG/conf.d/10-ssl.conf" | sed 's/#ssl_cert//' | sed 's/=//' | sed 's/ //g' | sed 's/<//'`;
		chomp($imap_cert);
	}

	my $valid_imap_ca = 0;
	my $imap_ca = `grep "^ssl_ca " "$g_target_root$_DOVECOT_CONFIG/conf.d/10-ssl.conf" | sed 's/ssl_ca//' | sed 's/=//' | sed 's/ //g' | sed 's/<//'`;
	chomp($imap_ca);
	if ( $imap_ca eq "" ) {
		$imap_ca = `grep "^#ssl_ca " "$g_target_root$_DOVECOT_CONFIG/conf.d/10-ssl.conf" | sed 's/#ssl_ca//' | sed 's/=//' | sed 's/ //g' | sed 's/<//'`;
		chomp($imap_ca);
	}

	# validate current IMAP certificates
	if ( !($imap_key eq "") && path_exists($imap_key) ) {
		&log_message( "  ssl_key: $imap_key" );
		$valid_imap_key = 1;
	}

	if ( !($imap_cert eq "") && path_exists($imap_cert) ) {
		&log_message( "  ssl_cert: $imap_cert" );
		$valid_imap_cert = 1;
	}

	if ( !($imap_ca eq "") && path_exists($imap_ca) ) {
		&log_message( "  ssl_ca: $imap_ca" );
		$valid_imap_ca = 1;
	}

	# log success if all certificates map
	if ( ($valid_imap_key == 1) && ($valid_imap_cert == 1) && ($valid_imap_ca == 1) ) {
		&log_message( "Using existing POP/IMAP SSL certificates:" );
		&log_message( "  ssl_key: $imap_key" );
		&log_message( "  ssl_cert: $imap_cert" );
		&log_message( "  ssl_ca: $imap_ca" );
		system( "$_server_admin settings mail:imap:tls_key_file = $imap_key" );
		system( "$_server_admin settings mail:imap:tls_cert_file = $imap_cert" );
		system( "$_server_admin settings mail:imap:tls_ca_file = $imap_ca" );
	} else {
		# first see if we care and that SSL is enabled
		my $use_ssl = `grep "^ssl =" "$g_target_root$_DOVECOT_CONFIG/conf.d/10-ssl.conf" | sed 's/ssl//' | sed 's/=//' | sed 's/ //g'`;
		chomp($use_ssl);

		# map certificates when using SSL and the oritinal certificates cannot be found
		if ( ($use_ssl eq "yes") || ($use_ssl eq "required") ) {
			# list missing certificates
			&log_message( "Missing existing POP/IMAP SSL certificates:" );
			if ( $valid_imap_key != 1) {
				&log_message( "  ssl_key: $imap_key" );
			}
			if ( $valid_imap_cert != 1) {
				&log_message( "  ssl_cert: $imap_cert" );
			}
			if ( $valid_imap_ca != 1 ) {
				&log_message( "  ssl_ca: $imap_ca" );
			}

			# get current settings
			my $imap_server_opts = `$_server_admin settings mail:imap:tls_server_options`;
			chomp($imap_server_opts);

			# try to map names to existing certificate
			&log_message( "Attempting to map missing certificates:" );

			my $ssl_key = map_ssl_cert( get_cert_name( $imap_key ) );
			my $ssl_cert = map_ssl_cert( get_cert_name( $imap_cert ) );
			my $ssl_ca = map_ssl_cert( get_cert_name( $imap_ca ) );
			# use mapped certificates if they all exist
			if ( path_exists($ssl_key) && path_exists($ssl_cert) && path_exists($ssl_ca) ) {
				&log_msg( "Using mapped POP/IMAP services certificate settings\n  " );
				system( "$_server_admin settings mail:imap:tls_key_file = $ssl_key >> $_migration_log_file" );
				&log_msg( "  " );
				system( "$_server_admin settings mail:imap:tls_cert_file = $ssl_cert >> $_migration_log_file" );
				&log_msg( "  " );
				system( "$_server_admin settings mail:imap:tls_ca_file = $ssl_ca >> $_migration_log_file" );
				&log_msg( "  " );
				system( "$_server_admin settings $imap_server_opts >> $_migration_log_file" );
			} elsif ( path_exists($default_cert) && path_exists($default_key) && path_exists($default_ca) ) {
				# some mappings failed so setting to default
				&log_msg( "Setting default certificates for POP/IMAP services\n  " );
				system( "$_server_admin settings mail:imap:tls_key_file = $default_key >> $_migration_log_file" );
				&log_msg( "  " );
				system( "$_server_admin settings mail:imap:tls_cert_file = $default_cert >> $_migration_log_file" );
				&log_msg( "  " );
				system( "$_server_admin settings mail:imap:tls_ca_file = $default_ca >> $_migration_log_file" );
				&log_msg( "  " );
				system( "$_server_admin settings $imap_server_opts >> $_migration_log_file" );
			} else {
				# Worst case: no certificate mappings and no default certificates found
				&log_msg( "ERROR: No default certificats found.  Disabling SSL for POP/IMAP services\n  " );
				system( "$_server_admin settings mail:imap:tls_key_file = \"\" >> $_migration_log_file" );
				&log_msg( "  " );
				system( "$_server_admin settings mail:imap:tls_cert_file = \"\" >> $_migration_log_file" );
				&log_msg( "  " );
				system( "$_server_admin settings mail:imap:tls_ca_file = \"\" >> $_migration_log_file" );
				&log_msg( "  " );
				system( "$_server_admin settings mail:imap:tls_server_options = none >> $_migration_log_file" );
			}
		} else {
			&log_msg( "  " );
			system( "$_server_admin settings mail:imap:tls_server_options = none >> $_migration_log_file" );
			&log_message( "POP/IMAP SSL settings not set: ssl = $use_ssl" );
		}
	}

	###############################
	# SMTP Certificate validataion
	###############################

	&log_message( "Getting current SMTP service certificate settings" );

	# get current SMTP certificates
	my $valid_smtp_key = 0;
	my $smtp_key = `${POSTCONF} -h -c "$g_target_root$_POSTFIX_CONFIG" smtpd_tls_key_file`;
	chomp($smtp_key);

	my $valid_smtp_cert = 0;
	my $smtp_cert = `${POSTCONF} -h -c "$g_target_root$_POSTFIX_CONFIG" smtpd_tls_cert_file`;
	chomp($smtp_cert);

	my $valid_smtp_ca = 0;
	my $smtp_ca = ` ${POSTCONF} -h -c "$g_target_root$_POSTFIX_CONFIG" smtpd_tls_CAfile`;
	chomp($smtp_ca);

	# validate current SMTP certificates
	if ( !($smtp_key eq "") && path_exists($smtp_key) ) {
		&log_message( "  smtpd_tls_key_file: $smtp_key" );
		$valid_smtp_key = 1;
	}

	if ( !($smtp_cert eq "") && path_exists($smtp_cert) ) {
		&log_message( "  smtpd_tls_cert_file: $smtp_cert" );
		$valid_smtp_cert = 1;
	}

	if ( !($smtp_ca eq "") && path_exists($smtp_ca) ) {
		&log_message( "  smtpd_tls_CAfile: $smtp_ca" );
		$valid_smtp_ca = 1;
	}

	# log success if all certificates map
	if ( ($valid_smtp_key == 1) && ($valid_smtp_cert == 1) && ($valid_smtp_ca == 1) ) {
		&log_message( "Using existing SMTP SSL certificates:" );
		&log_message( "  smtpd_tls_key_file: $smtp_key" );
		&log_message( "  smtpd_tls_cert_file: $smtp_cert" );
		&log_message( "  smtpd_tls_CAfile: $smtp_ca" );
	} else {
		# first see if we care 
		my $use_tls = ` grep "^smtpd_use_tls =" "$g_target_root$_POSTFIX_CONFIG/main.cf" | sed 's/smtpd_use_tls//' | sed 's/=//' | sed 's/ //g'`;
		chomp($use_tls);

		# map certificates when using SSL but oritinals cannot be found
		if ( $use_tls eq "yes" ) {
			# list missing certificates
			&log_message( "Missing existing SMTP SSL certificates:" );
			if ( $valid_smtp_key != 1 ) {
				&log_message( "  smtpd_tls_key_file: $smtp_key" );
			}
			if ( $valid_smtp_cert != 1 ) {
				&log_message( "  smtpd_tls_cert_file: $smtp_cert" );
			}
			if ( $valid_smtp_ca != 1 ) {
				&log_message( "  smtpd_tls_CAfile: $smtp_ca" );
			}

			# get current settings
			my $smtp_server_opts = `$_server_admin settings mail:postfix:tls_server_options`;
			chomp($smtp_server_opts);

			# try to map names to existing certificate
			&log_message( "Attempting to map missing certificates:" );
			my $ssl_key = map_ssl_cert( get_cert_name( $smtp_key ) );
			my $ssl_cert = map_ssl_cert( get_cert_name( $smtp_cert ) );
			my $ssl_ca = map_ssl_cert( get_cert_name( $smtp_ca ) );

			# use mapped certificates if they all exist
			if ( path_exists($ssl_key) && path_exists($ssl_cert) && path_exists($ssl_ca) ) {
				&log_msg( "Mapping SMTP service certificate settings\n  " );
				system( "$_server_admin settings mail:postfix:smtpd_tls_key_file = $ssl_key >> $_migration_log_file" );
				&log_msg( "  " );
				system( "$_server_admin settings mail:postfix:smtpd_tls_cert_file = $ssl_cert >> $_migration_log_file" );
				&log_msg( "  " );
				system( "$_server_admin settings mail:postfix:smtpd_tls_key_file = $ssl_ca >> $_migration_log_file" );
				&log_msg( "  " );
				system( "$_server_admin settings $smtp_server_opts >> $_migration_log_file" );
			} elsif ( path_exists($default_cert) && path_exists($default_key) && path_exists($default_ca) ) {
				# some mappings failed so setting to default
				&log_msg( "Setting default certificates for SMTP services\n  " );
				system( "$_server_admin settings mail:postfix:smtpd_tls_key_file = $default_key >> $_migration_log_file" );
				&log_msg( "  " );
				system( "$_server_admin settings mail:postfix:smtpd_tls_cert_file = $default_cert >> $_migration_log_file" );
				&log_msg( "  " );
				system( "$_server_admin settings mail:postfix:smtpd_tls_key_file = $default_ca >> $_migration_log_file" );
				&log_msg( "  " );
				system( "$_server_admin settings $smtp_server_opts >> $_migration_log_file" );
			} else {
				# Worst case: no certificate mappings and no default certificates found
				&log_msg( "ERROR: No default certificats found.  Disabling SSL for SMTP services\n  " );
				system( "$_server_admin settings mail:postfix:smtpd_tls_key_file = \"\" >> $_migration_log_file" );
				&log_msg( "  " );
				system( "$_server_admin settings mail:postfix:smtpd_tls_cert_file = \"\" >> $_migration_log_file" );
				&log_msg( "  " );
				system( "$_server_admin settings mail:postfix:smtpd_tls_key_file = \"\" >> $_migration_log_file" );
				&log_msg( "  " );
				system( "$_server_admin settings mail:postfix:tls_server_options = none >> $_migration_log_file" );
			}
		} else {
			&log_msg( "  " );
			system( "$_server_admin settings mail:postfix:tls_server_options = none >> $_migration_log_file" );
			&log_message( "SMTP SSL settings not set: smtpd_use_tls = $use_tls" );
		}
	}
	&log_message( "Migrating of SSL certificates complete" );
} # set_ssl_certs

#############################################################################
# migrate_db_update_times ()

sub migrate_db_update_times ()
{
	log_funct( "migrate_db_update_times" );

	&log_message( "Migrating virus database upgrade interval" );

	open(CLAMAV_PLIST, "<${g_source_root}" . "/System/Library/LaunchDaemons/org.clamav.freshclam.plist");
	while( <CLAMAV_PLIST> ) {
		# store $_ value because subsequent operations may change it
		my( $line ) = $_;

		# strip the trailing newline from the line
		chomp( $line );

		my $key = index($line, "-c ");
		if ( ${key} != -1 ) {
			my $value;
			if ( substr( ${line}, ${key}+4, 1 ) eq "<" ) {
				$value = substr( ${line}, ${key}+3, 1 );
			} else {
				$value = substr( ${line}, ${key}+3, 2 );
			}
			system( "$_server_admin settings mail:postfix:virus_db_update_days = ${value} >> $_migration_log_file" );
		}
	}
	close( CLAMAV_PLIST );
} # migrate_db_update_times


#############################################################################
# migrate_log_settings ()

sub migrate_log_settings ()
{
	log_funct( "migrate_log_settings" );

	# look for syslog.conf in source-root or in target-root with ~previous extension
	my $syslog_conf_path = $g_target_root . "/private/etc/syslog.conf~previous";
	if ( !path_exists( $syslog_conf_path ) ) {
		&log_message( "Note: previous syslog.conf: " . $syslog_conf_path . ", not found" );

		$syslog_conf_path = $g_source_root . "/private/etc/syslog.conf";
		if ( !path_exists( $syslog_conf_path ) ) {
			&log_message( "Note: previous syslog.conf: " . $syslog_conf_path . ", not found" );
			&log_message( "Log level settings not migrated" );
			return;
		}
	}

	&log_message( "Migrating log level settings from: $syslog_conf_path" );

	# get mail. & local6. log settings
	open(SYS_LOG, "<${syslog_conf_path}");
	while( <SYS_LOG> ) {
		# store $_ value because subsequent operations may change it
		my( $line ) = $_;

		# strip the trailing newline from the line
		chomp( $line );

		my $key = "";
		my $value = "";
		my $offset = 0;
		if ( substr( ${line}, 0, 5) eq "mail." ) {
			${offset} = 5;
			${key} = "mail:postfix:log_level";
		}
		elsif (substr( ${line}, 0, 7) eq "local2." ) {
			${offset} = 7;
			${key} = "mail:postfix:virus_log_level";
		}
		elsif (substr( ${line}, 0, 7) eq "local6." ) {
			${offset} = 7;
			${key} = "mail:imap:log_level";
		}

		if ( ${offset} != 0 ) {
			SWITCH: {
				if ( substr( ${line}, ${offset}, 3) eq "err" ) {
					${value} = "err";
					last SWITCH;
				}
				if ( substr( ${line}, ${offset}, 4) eq "crit" ) {
					${value} = "crit";
					last SWITCH;
				}
				if ( substr( ${line}, ${offset}, 4) eq "warn" ) {
					${value} = "warn";
					last SWITCH;
				}
				if ( substr( ${line}, ${offset}, 6) eq "notice" ) {
					${value} = "notice";
					last SWITCH;
				}
				if ( substr( ${line}, ${offset}, 4) eq "info" ) {
					${value} = "info";
					last SWITCH;
				}
				if ( substr( ${line}, ${offset}, 1) eq "*" ) {
					${value} = "debug";
					last SWITCH;
				}
				last SWITCH;
			}
			if ( !(${value} eq "") && !(${key} eq "") ) {
				system( "$_server_admin settings ${key} = ${value} >> $_migration_log_file" );
			}
		}
	}

	# close it, close it up again
	close( SYS_LOG );

} # migrate_log_settings


#############################################################################
# set_log_defaults ()

sub set_log_defaults ()
{
	system( "$_server_admin settings mail:imap:log_level = info >> $_migration_log_file" );
	system( "$_server_admin settings mail:postfix:log_level = info >> $_migration_log_file" );
	system( "$_server_admin settings mail:postfix:spam_log_level = info >> $_migration_log_file" );
	system( "$_server_admin settings mail:postfix:virus_log_level = info >> $_migration_log_file" );
	system( "$_server_admin settings mail:postfix:virus_db_log_level = info >> $_migration_log_file" );
} # set_log_defaults


#############################################################################
# load_postfix ()

sub load_postfix ()
{
	log_funct( "load_postfix" );
	&log_message( "Reloading current SMPT instance" );

	# stop postfix
	if ( path_exists( "${POSTFIX_LAUNCHD_PLIST}" ) ) {
		log_debug( "- Stopping postfix" );
		system( "${LAUNCHCTL} load -w ${POSTFIX_LAUNCHD_PLIST} >> $_migration_log_file 2>> $_migration_log_file" );
	}
} # load_postfix


#############################################################################
# unload_postfix ()

sub unload_postfix ()
{
	log_funct( "unload_postfix" );
	&log_message( "Unloading current SMPT instance" );

	# stop postfix
	if ( path_exists( "${POSTFIX_LAUNCHD_PLIST}" ) ) {
		log_debug( "- Stopping postfix" );
		system( "${LAUNCHCTL} unload -w ${POSTFIX_LAUNCHD_PLIST} >> $_migration_log_file 2>> $_migration_log_file" );
	}
} # unload_postfix


################################################################################
# get old server version parts

sub parse_source_version ($)
{
	my ($VERS) = @_;
	log_funct( "parse_source_version" );

	my @SRV_VER_PARTS = split(/\./, $VERS); 

	log_debug( sprintf("sourceVersion: %s", "${VERS}") );
	log_debug( sprintf("  major : %s", ${SRV_VER_PARTS}[0]) );
	log_debug( sprintf("  minor : %s", ${SRV_VER_PARTS}[1]) );
	log_debug( sprintf("  update: %s", ${SRV_VER_PARTS}[2]) );

	$SRV_MAJOR = ${SRV_VER_PARTS}[0];
	$SRV_MINOR = ${SRV_VER_PARTS}[1];
	$SRV_UPDATE = ${SRV_VER_PARTS}[2];
} # parse_source_version


#############################################################################
# sedconf ()

sub sedconf
{
	die unless @_ == 6;
	my $conf = shift or die;
	my $cmt = shift;
	my $key = shift or die;
	my $action = shift or die;
	my $value = shift;
	my $secpat = shift;

	log_funct( "sedconf" );

	my $srcpath = "$g_target_root$_DOVECOT_CONFIG/$conf";
	if (!open(SRC, "<", $srcpath)) {
		&log_message( "can't read config file $srcpath: $!" );
		return;
	}

	my $dstpath = "$g_target_root$_DOVECOT_CONFIG/$conf.new";
	if (!open(DST, ">", $dstpath)) {
		&log_message( "can't create config file $dstpath: $!" );
		close SRC;
		return;
	}

	log_debug( "src path: $srcpath" );
	log_debug( "dst path: $dstpath" );
	log_debug( "    conf: $conf" );
	log_debug( "     cmt: $cmt" );
	log_debug( "     key: $key" );
	log_debug( "  action: $action" );
	log_debug( "    conf: $conf" );
	log_debug( "   value: $value" );
	log_debug( "  secpat: $secpat" );

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
				log_debug( "    line: $line" );
				if ($line =~ s/^$cmtpat($key\s*=\s*).*$/$1$value/) {
					$done = 1;
				}
			} elsif ($action eq "+") {
				# append to list value if not already there
				log_debug( "    line: $line" );
				if ($line =~ /$key\s*=.*(\s|=)$value(\s|$)/) {
					$unneeded = 1;
				} elsif ($line =~ s/^$cmtpat($key\s*=\s*.*)/$1 $value/) {
					$done = 1;
				}
			} elsif ($action eq "-") {
				# remove from list value
				log_debug( "    line: $line" );
				if ($line =~ s/^$cmtpat($key\s*=\s*)$value(\s.*|$)/$1$2/ ||
				    $line =~ s/^$cmtpat($key\s*=.*)\s$value(\s.*|$)/$1$2/) {
					$done = 1;
				} elsif ($line =~ /^$cmtpat$key\s*=/) {
					$unneeded = 1;
				}
			} elsif ($action eq "X") {
				# delete line
				log_debug( "    line: $line" );
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
			&log_message( "key \"$key\" not found in $srcpath, can't change value ($action $value)" );
		}
		unlink($dstpath);
		return;
	}

	my $savedir = "$g_target_root$_DOVECOT_CONFIG/pre-migrate";
	mkdir($savedir, 0755);
	mkdir("$savedir/conf.d", 0755);
	my $savepath = "$savedir/$conf";
	if (!rename($srcpath, $savepath)) {
		&log_message( "can't rename $srcpath -> $savepath: $!" );
		return;
	}
	if (!rename($dstpath, $srcpath)) {
		&log_message( "can't rename $dstpath -> $srcpath: $!" );
		return;
	}
}

#############################################################################
# sedsection ()

sub sedsection
{
	die unless @_ == 5;
	my $conf = shift or die;
	my $enable = shift;
	my $level = shift;
	my $namepat = shift or die;
	my $value = shift;

	log_funct( "sedsection" );

	my $srcpath = "$g_target_root$_DOVECOT_CONFIG/$conf";
	if (!open(SRC, "<", $srcpath)) {
		&log_message( "can't read config file $srcpath: $!" );
		return;
	}

	my $dstpath = "$g_target_root$_DOVECOT_CONFIG/$conf.new";
	if (!open(DST, ">", $dstpath)) {
		&log_message( "can't create config file $dstpath: $!" );
		close SRC;
		return;
	}

	log_debug( "src path: $srcpath" );
	log_debug( "dst path: $dstpath" );
	log_debug( "    conf: $conf" );
	log_debug( "  enable: $enable" );
	log_debug( "   level: $level" );
	log_debug( " namepat: $namepat" );
	log_debug( "   value: $value" );

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
		&log_message( "section \"$namepat\" not found in $srcpath, can't change value ($enable $value)" );
		unlink($dstpath);
		return;
	}

	my $savedir = "$g_target_root$_DOVECOT_CONFIG/pre-migrate";
	mkdir($savedir, 0755);
	mkdir("$savedir/conf.d", 0755);
	my $savepath = "$savedir/$conf";
	if (!rename($srcpath, $savepath)) {
		&log_message( "can't rename $srcpath -> $savepath: $!" );
		return;
	}
	if (!rename($dstpath, $srcpath)) {
		&log_message( "can't rename $dstpath -> $srcpath: $!" );
		return;
	}
}

#############################################################################
# appendconf ()

sub appendconf
{
	my $conf = shift or die;
	my $text = shift or die;

	my $dstpath = "$g_target_root$_DOVECOT_CONFIG/$conf";
	if ( !open(DST, ">>", $dstpath) ) {
		&log_message( "can't append config file $dstpath: $!" );
		return;
	}

	print DST $text;
	close DST;
}

#############################################################################
# update_dovecot_config_paths ()

sub update_dovecot_config_paths ()
{
	log_funct( "update_dovecot_config_paths" );
	&log_message( "Updating POP/IMAP configuation paths" );

	# modify paths to point to new conig location
	my $src = "$g_target_root$_CONFIG_ROOT/dovecot/conf.d/auth-od.conf.ext";
	my $dst = "$g_target_root$_CONFIG_ROOT/dovecot/conf.d/auth-od.conf.ext.new";
	my $value = `${GREP} "partition=/etc/dovecot/partition_map.conf" $src`;
	if ( !($value eq "") ) {
		qx( /usr/bin/sed -e "s/\\/etc\\/dovecot\\/partition_map.conf/\\/Library\\/Server\\/Mail\\/Config\\/dovecot\\/partition_map.conf/" "$src" > "$dst" );
		move( "$src",  "$src" . ".$g_source_version" . ".orig" );
		move( "$dst", "$src" );
	}

	# modify paths to point to new conig location
	$src = "$g_target_root$_CONFIG_ROOT/dovecot/conf.d/auth-submit.conf.ext";
	$dst = "$g_target_root$_CONFIG_ROOT/dovecot/conf.d/auth-submit.conf.ext.new";
	my $value = `${GREP} "/etc/dovecot/submit.passdb" $src`;
	if ( !($value eq "") ) {
		`/usr/bin/sed -e "s/\\/etc\\/dovecot\\/submit.passdb/\\/Library\\/Server\\/Mail\\/Config\\/dovecot\\/submit.passdb/" "$src" > "$dst"`;
		move( "$src",  "$src" . ".$g_source_version" . ".orig" );
		move( "$dst", "$src" );
	}

	# if data vol was set to /var/spool/imap/dovecot, then make target /Library/Server/Mail/Data/mail
	my $mail_loc = `$_server_admin settings mail:imap:partition-default`;
	chomp($mail_loc);
	my $offset = index($mail_loc, "/var/spool/imap/dovecot/mail");
	if ( index($mail_loc, "/var/spool/imap/dovecot/mail") > 0 ) {
		system( "$_server_admin settings mail:imap:partition-default = /Library/Server/Mail/Data/mail" );
	}

	$src = "$g_target_root$_CONFIG_ROOT/dovecot/conf.d/10-master.conf";
	$dst = "$g_target_root$_CONFIG_ROOT/dovecot/conf.d/10-master.conf.new";
	qx( /usr/bin/sed -e "1,/    #user =/s/    #user =/    user = _dovecot/" "$src" > "$dst" );
	move( "$src",  "$src" . ".$g_source_version" . ".orig" );
	move( "$dst", "$src" );
} 

#############################################################################
# migrate_dovecot_config ()

sub migrate_dovecot_config ()
{
	log_funct( "migrate_dovecot_config" );

	&log_message( "Migrating previous POP/IMAP configuation settings" );

	my ($hostname) = `$GREP "^myhostname *=" "$g_target_root$_POSTFIX_CONFIG/main.cf" 2>>$_migration_log_file | sed 's,.*= *,,'`;
	chomp $hostname;
	if (!defined($hostname) || $hostname eq "") {
		$hostname = `/bin/hostname`;
		chomp $hostname;
	}

	my $oldtag;
	if ($g_source_version =~ /^10(\.\d+)+$/) {
		$oldtag = $g_source_version;
	} else {
		$oldtag = "old";
	}
	if (path_exists("${g_source_root}/private/etc/dovecot")) {
		system( "${RM} -rf \"$g_target_root$_DOVECOT_CONFIG/$oldtag\" >> $_migration_log_file 2>> $_migration_log_file" );
		system( "${CP} -rpf \"${g_source_root}/private/etc/dovecot\" \"$g_target_root$_DOVECOT_CONFIG/$oldtag\" >> $_migration_log_file 2>> $_migration_log_file" );
	} elsif (path_exists("${g_source_root}$_DOVECOT_CONFIG")) {
		system( "${RM} -rf \"$g_target_root$_DOVECOT_CONFIG/$oldtag\" >> $_migration_log_file 2>> $_migration_log_file" );
		system( "${CP} -rpf \"${g_source_root}$_DOVECOT_CONFIG\" \"$g_target_root$_DOVECOT_CONFIG/$oldtag\" >> $_migration_log_file 2>> $_migration_log_file" );
	}

	# All the config files that may change.  Others not listed won't.
	my $imap_conf =			"dovecot.conf";
	my $imap_conf_auth =	"conf.d/10-auth.conf";
	my $imap_conf_logging =	"conf.d/10-logging.conf";
	my $imap_conf_mail =	"conf.d/10-mail.conf";
	my $imap_conf_master =	"conf.d/10-master.conf";
	my $imap_conf_ssl =		"conf.d/10-ssl.conf";
	my $imap_conf_lda =		"conf.d/15-lda.conf";
	my $imap_conf_imap =	"conf.d/20-imap.conf";
	my $imap_conf_lmtp =	"conf.d/20-lmtp.conf";
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
					  $imap_conf_lmtp,
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
			   "auth_debug"				=> undef,
			   "auth_debug_passwords"	=> undef,
			   "auth_mechanisms"		=> undef,
			   "userdb_od_args"			=> undef,
			   "quota_warning"			=> undef,
			   "quota_warning2"			=> undef);
	my %hot;

	# determine all options set in old config file(s)
	my $from_dovecot2 = path_exists("$g_target_root$_DOVECOT_CONFIG/$oldtag/conf.d");
	for my $file (@conf_files) {
		my $dcold = "$g_target_root$_DOVECOT_CONFIG/$oldtag/$file";
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
				} elsif ($line =~ /^(protocols)\s*=\s*(.*)/ && ($hot || !defined($hot{$1}))) {
					die unless exists $val{$1};	# check for typos
					@{$val{$1}} = split(/\s+/, $2);
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
				} elsif (@section == 1 && $section[0] =~ /^protocol\s+imap\s+/ &&
						 $line =~ /^(aps_topic)\s*=\s*(.*)/x &&
						 ($hot || !defined($hot{$1}))) {
					die unless exists $val{$1};	# check for typos
					$val{$1} = $2;
					$hot{$1} = $hot;
				} elsif (@section == 1 && $section[0] =~ /^protocol\s+lda\s+/ &&
						 $line =~ /^(postmaster_address |
									 hostname)\s*=\s*(.*)/x &&
						 ($hot || !defined($hot{$1}))) {
					die unless exists $val{$1};	# check for typos
					$val{$1} = $2;
					$hot{$1} = $hot;
				} elsif (@section == 1 && $section[0] =~ /^protocol\s+lda\s+/ &&
						 $line =~ /^mail_plugins\s*=\s*(.*)/ &&
						 ($hot || !defined($hot{lda_plugins}))) {
					@{$val{lda_plugins}} = split(/\s+/, $1);
					$hot{lda_plugins} = $hot;
				} elsif (@section == 1 && $section[0] =~ /^auth\s+default\s+/ &&
						 $line =~ /^mechanisms\s*=\s*(.*)/ &&
						 ($hot || !defined($hot{auth_mechanisms}))) {
					@{$val{auth_mechanisms}} = split(/\s+/, $1);
					$hot{auth_mechanisms} = $hot;
				} elsif (@section == 2 && $section[0] =~ /^auth\s+default\s+/ && $section[1] =~ /^userdb\s+od\s+/ &&
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
			&log_message( "can't read $dcold: $!" );
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
	sedconf($imap_conf,				1, "protocols",				"-", "imap",								undef)						if $hot{protocols}
		and !grep { $_ eq "imap" || $_ eq "imaps" } @{$val{protocols}};
	sedconf($imap_conf,				1, "protocols",				"-", "pop3",								undef)						if $hot{protocols}
		and !grep { $_ eq "pop3" || $_ eq "pop3s" } @{$val{protocols}};
	sedconf($imap_conf,				1, "protocols",				"+", "sieve",								undef)						if $hot{protocols}
		and grep { $_ eq "managesieve" } @{$val{protocols}};
	sedconf($imap_conf_auth,		1, "disable_plaintext_auth","=", $val{disable_plaintext_auth},			undef)						if $hot{disable_plaintext_auth};
	sedconf($imap_conf_auth,		1, "APPLE.*x-plain-submit",	"X", undef,									undef);		# remove comment obsoleted by dovecot >= 2.2
	sedconf($imap_conf_ssl,			1, "ssl",					"=", $val{ssl},								undef)						if $hot{ssl};
	sedconf($imap_conf_ssl,			1, "ssl_cert",				"=", $val{ssl_cert},						undef)						if $hot{ssl_cert};
	sedconf($imap_conf_ssl,			1, "ssl_key",				"=", $val{ssl_key},							undef)						if $hot{ssl_key};
	sedconf($imap_conf_ssl,			1, "ssl_ca",				"=", $val{ssl_ca},							undef)						if $hot{ssl_ca};
	sedconf($imap_conf_mail,		0, "mail_location",			"=", $val{mail_location},					undef)						if $hot{mail_location};
	sedconf($imap_conf_logging,		1, "mail_debug",			"=", $val{mail_debug},						undef)						if $hot{mail_debug};
	sedconf($imap_conf_logging,		1, "APPLE.*URLFETCH",		"X", undef,									undef);		# remove comment obsoleted by dovecot >= 2.2
	sedconf($imap_conf_mail,		1, "mmap_disable",			"=", $val{mmap_disable},					undef)						if $hot{mmap_disable};
	sedconf($imap_conf_mail,		1, "dotlock_use_excl",		"=", $val{dotlock_use_excl},				undef)						if $hot{dotlock_use_excl};
	#sedconf($imap_conf_master,		1, "user",					"=", "_dovecot_xxx",						qr{^service\s+auth\s+});
	sedconf($imap_conf_master,		1, "process_limit",			"=", $val{max_mail_processes},				qr{^service\s+(imap|pop3)\s+})	if $hot{max_mail_processes};
	sedconf($imap_conf,				1, "aps_topic",				"=", $val{aps_topic},						undef)						if $hot{aps_topic};
	sedconf($imap_conf_lda,			1, "postmaster_address",	"=", $val{postmaster_address},				undef)						if $hot{postmaster_address}
		and $val{postmaster_address} !~ /example\.com/;
	sedconf($imap_conf_lda,			1, "hostname",				"=", $val{hostname},						undef)						if $hot{hostname};
	# in dovecot < 2.2 urlauth was a plugin.  in dovecot >= 2.2 it's built in
	sedconf($imap_conf_imap,		1, "mail_plugins",			"-", "urlauth",								qr{^protocol\s+imap\s+});
	sedconf($imap_conf_imap,		1, "mail_plugins",			"-", "imap_fts",							qr{^protocol\s+imap\s+});
	sedconf($imap_conf_imap,		1, "APPLE.*added urlauth",	"X", undef,									undef);		# remove comment obsoleted by dovecot >= 2.2
	sedconf($imap_conf_lda,			1, "mail_plugins",			"+", "sieve",								qr{^protocol\s+lda\s+})		if $hot{lda_plugins}
		and grep { $_ eq "cmusieve" } @{$val{lda_plugins}};
	sedconf($imap_conf_lda,			1, "mail_plugins",			"+", "push_notify",							qr{^protocol\s+lda\s+})		if $hot{lda_plugins}
		and grep { $_ eq "push_notify" } @{$val{lda_plugins}};
	sedconf($imap_conf_logging,		1, "auth_debug",			"=", $val{auth_debug},						undef)						if $hot{auth_debug};
	sedconf($imap_conf_logging,		1, "auth_debug_passwords",	"=", $val{auth_debug_passwords},			undef)						if $hot{auth_debug_passwords};
	if ($hot{auth_mechanisms}) {
		sedconf($imap_conf_auth,	1, "auth_mechanisms",		"-", "cram-md5",							undef)
			if !grep { $_ eq "cram-md5" } @{$val{auth_mechanisms}};
		sedconf($imap_conf_auth,	1, "auth_mechanisms",		"+", $_,									undef)
			for @{$val{auth_mechanisms}};

		# x-plain-submit from dovecot < 2.2 not needed/supported in dovecot >= 2.2
		sedconf($imap_conf_auth,	1, "auth_mechanisms",		"-", "x-plain-submit",						undef);
	}
	sedconf($imap_conf_plugin,		1, "(APPLE.*URLFETCH|just a FQHN)",	"X", undef,							undef);		# remove comment obsoleted by dovecot >= 2.2
	sedconf($imap_conf_plugin,		1, "urlauth_hostport",		"X", undef,									undef);		# remove setting obsoleted by dovecot >= 2.2
	sedconf($imap_conf_submit,		1, "pass = yes",			"X", undef,									undef);		# remove setting obsoleted by dovecot >= 2.2
	sedconf($imap_conf_submit,		1, "submit = yes",			"X", undef,									undef);		# remove setting obsoleted by dovecot >= 2.2
	sedconf($imap_conf_od,			1, "args",					"=", join(" ", @{$val{userdb_od_args}}),	qr{^userdb\s+})				if $hot{userdb_od_args};
	sedconf($imap_conf_quota,		1, "quota_warning",			"=", $val{quota_warning},					qr{^plugin\s+})				if $hot{quota_warning};
	sedconf($imap_conf_quota,		1, "quota_warning2",		"=", $val{quota_warning2},					qr{^plugin\s+})				if $hot{quota_warning2};
	if (!$hot{namespace}) {
		sedsection($imap_conf_mail, 1, 0, qr/namespace/, "namespace inbox");
		sedconf($imap_conf_mail,	1, "inbox",					"=", "yes",									qr{^namespace\s+inbox});
	}
	if (!$hot{service_stats}) {
		appendconf($imap_conf_master, <<'EOT');

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
		appendconf($imap_conf_master, <<'EOT');

# To reduce indexer-workers' CPU and disk I/O load, change process_limit.
service indexer-worker {
  user = _dovecot
  #process_limit = 10
}
EOT
	}
	if (!$hot{mail_attribute_dict}) {
		# dovecot >= 2.2 needs mail_attribute_dict
		appendconf($imap_conf_mail, <<'EOT');

mail_attribute_dict = file:/Library/Server/Mail/Data/attributes/attributes.dict
EOT
	}
	if (!$hot{imap_urlauth_submit_user}) {
		# dovecot >= 2.2 needs imap_urlauth_submit_user
		appendconf($imap_conf_imap, <<'EOT');

# User with submission privileges.
imap_urlauth_submit_user = submit
EOT
	}
	if (!$hot{userdb_submit_passdb}) {
		# dovecot >= 2.2 needs userdb for submit.passdb
		appendconf($imap_conf_submit, <<'EOT');

userdb {
  driver = passwd-file
  args = /Library/Server/Mail/Config/dovecot/submit.passdb
}
EOT
	}
	qx($CP -f "$g_target_root$_DOVECOT_CONFIG/$oldtag/partition_map.conf" "$g_target_root$_DOVECOT_CONFIG/partition_map.conf");

	if (path_exists("$g_target_root$_DOVECOT_CONFIG/submit.passdb")) {
		# Update submit.passdb from dovecot < 2.2 to add userdb fields for submit users for dovecot >= 2.2
		my $spsrc = "$g_target_root$_DOVECOT_CONFIG/submit.passdb";
		if (open(SPSRC, "<", $spsrc)) {
			my $spdst = "$g_target_root$_DOVECOT_CONFIG/submit.passdb.new";
			if (open(SPDST, ">", $spdst)) {
				my $spchanged = 0;
				while (my $spline = <SPSRC>) {
					chomp $spline;
					if (($spline =~ tr/:/:/) == 1) {
						print SPDST "$spline:214:6::/var/empty::\n";
						$spchanged = 1;
					} else {
						print SPDST "$spline\n";
					}
				}
				close(SPDST);
				close(SPSRC);

				if ($spchanged) {
					my $savedir = "$g_target_root$_DOVECOT_CONFIG/pre-migrate";
					mkdir($savedir, 0755);
					my $spsave = "$savedir/submit.passdb";
					if (rename($spsrc, $spsave)) {
						if (!rename($spdst, $spsrc)) {
							&log_message( "can't rename $spdst -> $spsrc: $!" );
							rename($spsave, $spsrc);
						}
					} else {
						&log_message( "can't rename $spsrc -> $spsave: $!" );
					}

					qx( ${CHOWN} :mail "$spsrc" >> $_migration_log_file 2>> $_migration_log_file );
					chmod(0640, $spsrc);
				} else {
					unlink($spdst);
				}
			} else {
				&log_message("can't write $spdst: $!");
				close(SPSRC);
			}
		} else {
			&log_message("can't read $spsrc: $!");
		}
	} else {
		# Create submit.passdb with either the same password postfix is
		# configured for, or an unguessable random password.
		my $pw;
		if (defined($hostname) && $hostname ne "" && path_exists("$g_target_root$_POSTFIX_CONFIG/submit.cred")) {
			($pw) = qx($GREP "^$hostname|submit|" "$g_target_root$_POSTFIX_CONFIG/submit.cred" 2>>$_migration_log_file | sed 's,.*|,,');
			chomp $pw;
		}
		if (!defined($pw) || $pw eq "") {
			($pw) = qx(dd if=/dev/urandom bs=256 count=1 2>>$_migration_log_file | env LANG=C tr -dc a-zA-Z0-9 | cut -b 1-22);
			chomp $pw;
		}
		if (defined($pw) && $pw ne "") {
			my $spnew = "$g_target_root$_DOVECOT_CONFIG/submit.passdb";
			if (open(SPNEW, ">", $spnew)) {
				print SPNEW "submit:{PLAIN}$pw:214:6::/var/empty::\n";
				close(SPNEW);
			} else {
				&log_message( "can't write $spnew: $!" );
			}
			qx( ${CHOWN} :mail "$g_target_root$_DOVECOT_CONFIG/submit.passdb" >> $_migration_log_file 2>> $_migration_log_file );
			chmod(0640, "$g_target_root$_DOVECOT_CONFIG/submit.passdb");
		}
	}

	# dovecot notify
	if ( path_exists( "$g_target_root$_DOVECOT_CONFIG/notify" ) ) {
		chown( $_dovecot_uid, $_mail_gid, "$g_target_root$_DOVECOT_CONFIG/notify" );
	}

	# mailusers.plist
	unlink("$g_target_root/private/var/db/.mailusers.plist");

	# dovecot.fts.update
	mkdir( "$g_target_root/private/var/db/dovecot.fts.update" );
	chown( $_dovecot_uid, $_mail_gid, "$g_target_root/private/var/db/dovecot.fts.update" );
	chmod( 0770, "$g_target_root/private/var/db/dovecot.fts.update" );
} # migrate_dovecot_config

#############################################################################
# migrate_postfix_spool ()

sub migrate_postfix_spool ()
{
	log_funct( "migrate_postfix_spool" );

	&log_message( "Begin SMTP spool data migraiont" );

	my $src_spool_var = "${g_source_root}/private/var/spool/postfix";
	my $src_spool_lib = "${g_source_root}/Library/Server/Mail/Data/spool";
	my $dst_spool	  = "$g_target_root/Library/Server/Mail/Data/spool";

	# create dest dir if it doesn't exist
	if ( !path_exists($dst_spool) ) {
		system( "$MKDIR -p -m 755 \"$g_target_root/Library/Server/Mail/Data/spool\" ");
	}

	# copy from 10.7 or 10.6 src spools
	if ( path_exists(${src_spool_lib}) ) {
		&log_message( "migrating postfix spool data from: $src_spool_lib to: $dst_spool" );
		system( "rsync -av ${src_spool_lib} ${dst_spool} >> $_migration_log_file" );
	} elsif ( path_exists(${src_spool_var}) ) {
		&log_message( "migrating postfix spool data from: $src_spool_lib to: $dst_spool" );
		system( "rsync -av ${src_spool_var} ${dst_spool} >> $_migration_log_file" );
	} else {
		&log_message( "Warning: no source mail spool found" );
	}

	&log_message( "Finished SMTP spool data migraiont" );

} # migrate_postfix_spool


#############################################################################
# migrate_postfix_config ()

sub migrate_postfix_config ()
{
	log_funct( "migrate_postfix_config" );
	&log_message( "Migrating SMTP configuration" );

	# keep a src default copy
	if ( path_exists( "$g_target_root$_POSTFIX_CONFIG/main.cf.default" ) ) {
		copy( "$g_target_root$_POSTFIX_CONFIG/main.cf.default", "$g_target_root$_POSTFIX_CONFIG/main.cf.default.$TARGET_VER" );
	}

	if ( path_exists( "$g_target_root$_POSTFIX_CONFIG/master.cf.default" ) ) {
		copy( "$g_target_root$_POSTFIX_CONFIG/master.cf.default", "$g_target_root$_POSTFIX_CONFIG/master.cf.default.$TARGET_VER" );
	}

	# copy config files from previous system
	&log_message( "Restoring SMTP service configuration from:" );
	if ( path_exists("${g_source_root}$_POSTFIX_CONFIG") ) {
		&log_message( "       source: ${g_source_root}$_POSTFIX_CONFIG" );
		&log_message( "  destination: $g_target_root$_POSTFIX_CONFIG" );
		&log_message( "           by: ${CP} -rpfv ${g_source_root}$_POSTFIX_CONFIG $g_target_root/Library/Server/Mail/Config/" );

		qx( ${CP} -rpfv "${g_source_root}$_POSTFIX_CONFIG" "$g_target_root/Library/Server/Mail/Config/" >> $_migration_log_file 2>> $_migration_log_file );
	} elsif ( path_exists("${g_source_root}/private/etc/postfix") ) {
		&log_message( "       source: ${g_source_root}/private/etc/postfix" );
		&log_message( "  destination: $g_target_root$_POSTFIX_CONFIG" );
		&log_message( "           by: ${CP} -rpfv ${g_source_root}/private/etc/postfix $g_target_root/Library/Server/Mail/Config/" );

		&log_message( "Copying postfix configuration: ${g_source_root}/private/etc/postfix to: $g_target_root$_POSTFIX_CONFIG" );
		qx( ${CP} -rpfv "${g_source_root}/private/etc/postfix" "$g_target_root/Library/Server/Mail/Config/" >> $_migration_log_file 2>> $_migration_log_file );
	} 

	# now copy main & master cf files from ~orig
	&log_message( "Restoring SMTP configuration files" );
	if ( path_exists("${g_source_root}/private/etc/postfix~orig/main.cf") ) {
		# move previous copy out of the way
		if ( path_exists("$g_target_root$_POSTFIX_CONFIG/main.cf") ) {
			move( "$g_target_root$_POSTFIX_CONFIG/main.cf", "$g_target_root$_POSTFIX_CONFIG/main.cf.$g_source_version" );
		}
		copy( "${g_source_root}/private/etc/postfix~orig/main.cf", "$g_target_root$_POSTFIX_CONFIG/main.cf" );
	} elsif ( path_exists("${g_source_root}/private/etc/postfix/main.cf") ) {
		# move previous copy out of the way
		if ( path_exists("$g_target_root$_POSTFIX_CONFIG/main.cf") ) {
			move( "$g_target_root$_POSTFIX_CONFIG/main.cf", "$g_target_root$_POSTFIX_CONFIG/main.cf.$g_source_version" );
		}
		copy( "${g_source_root}/private/etc/postfix/main.cf", "$g_target_root$_POSTFIX_CONFIG/main.cf" );
	}

	if ( path_exists("${g_source_root}/private/etc/postfix~orig/master.cf") ) {
		# move previous copy out of the way
		if ( path_exists("$g_target_root$_POSTFIX_CONFIG/master.cf") ) {
			move( "$g_target_root$_POSTFIX_CONFIG/master.cf", "$g_target_root$_POSTFIX_CONFIG/master.cf.$g_source_version" );
		}
		copy( "${g_source_root}/private/etc/postfix~orig/master.cf", "$g_target_root$_POSTFIX_CONFIG/master.cf" );
	} elsif ( path_exists("${g_source_root}/private/etc/postfix/master.cf") ) {
		# move previous copy out of the way
		if ( path_exists("$g_target_root$_POSTFIX_CONFIG/master.cf") ) {
			move( "$g_target_root$_POSTFIX_CONFIG/master.cf", "$g_target_root$_POSTFIX_CONFIG/master.cf.$g_source_version" );
		}
		copy( "${g_source_root}/private/etc/postfix/master.cf", "$g_target_root$_POSTFIX_CONFIG/master.cf" );
	}

	# clean up deprecated keys
	&log_message( "Removing deprecated SMTP configuration keys" );

	my $cnt = 0;
	my $src = "$g_target_root$_POSTFIX_CONFIG/main.cf";
	my @deprecated_keys = ("^virus_db_update_enabled", "^virus_db_last_update", "^smtpd_tls_common_name", "^spam_domain_name");

	# make a copy of original
	copy( "$src",  "$src.$g_source_version.orig" );

	for ( $cnt = 0; $cnt < 3; $cnt++) {
		my $value = `${GREP} $deprecated_keys[$cnt] $src`;
		if ( !($value eq "") ) {
			my $dst = "$g_target_root$_POSTFIX_CONFIG/main.cf.um.tmp";
			qx( /usr/bin/sed -e "/$deprecated_keys[$cnt]/d" "$src" > "$dst" );
			move( "$dst", "$src" );
		}
	}

	# fix virtual maps
	my $dst = "$g_target_root$_POSTFIX_CONFIG/main.cf.um.tmp";
	my $grep_value = `${GREP} "hash:/etc/postfix/virtual_users" $src`;
	if ( !($grep_value eq "") ) {
		qx( /usr/bin/sed -e "s/hash:\\/etc\\/postfix\\/virtual_users/hash:\\/Library\\/Server\\/Mail\\/Config\\/postfix\\/virtual_users/" "$src" > "$dst" );
		move( "$dst", "$src" );
	}

	# fix virtual maps
	my $grep_value = `${GREP} "hash:/etc/postfix/virtual_domains" $src`;
	if ( !($grep_value eq "") ) {
		qx( /usr/bin/sed -e "s/hash:\\/etc\\/postfix\\/virtual_domains/hash:\\/Library\\/Server\\/Mail\\/Config\\/postfix\\/virtual_domains/" "$src" > "$dst" );
		move( "$dst", "$src" );
	}

	# fix smtpdreject
	my $grep_value = `${GREP} "hash:/etc/postfix/smtpdreject" $src`;
	if ( !($grep_value eq "") ) {
		qx( /usr/bin/sed -e "s/hash:\\/etc\\/postfix\\/smtpdreject/hash:\\/Library\\/Server\\/Mail\\/Config\\/postfix\\/smtpdreject/" "$src" > "$dst" );
		move( "$dst", "$src" );
	}

	# fix smtpdreject
	my $grep_value = `${GREP} "cidr:/etc/postfix/smtpdreject.cidr" $src`;
	if ( !($grep_value eq "") ) {
		qx( /usr/bin/sed -e "s/cidr:\\/etc\\/postfix\\/smtpdreject.cidr/cidr:\\/Library\\/Server\\/Mail\\/Config\\/postfix\\/smtpdreject.cidr/" "$src" > "$dst" );
		move( "$dst", "$src" );
	}

	# clean legacy smtp_fallback
	$src = "$g_target_root$_POSTFIX_CONFIG/master.cf";
	my $value = `${GREP} "o fallback_relay=" $src`;
	if ( !($value eq "") ) {
		# fix existing master.cf
		my $dst = "$g_target_root$_POSTFIX_CONFIG/master.cf.um.tmp";
		qx( /usr/bin/sed -e "s/o fallback_relay=/o smtp_fallback_relay=/" "$src" > "$dst" );
		move( "$src",  "$src" . ".$g_source_version" . ".orig" );
		move( "$dst", "$src" );
	}

	&log_message( "Updating SMTP configuration" );
	system( "${POSTCONF} -c \"$g_target_root$_POSTFIX_CONFIG\" -e data_directory=/Library/Server/Mail/Data/mta" );
	system( "${POSTCONF} -c \"$g_target_root$_POSTFIX_CONFIG\" -e config_directory=/Library/Server/Mail/Config/postfix" );
	system( "${POSTCONF} -c \"$g_target_root$_POSTFIX_CONFIG\" -e queue_directory=/Library/Server/Mail/Data/spool" );

	# setup default relay host sasl directory
	if (!path_exists("$g_target_root$_POSTFIX_CONFIG/sasl")) {
		mkdir "$g_target_root$_POSTFIX_CONFIG/sasl";
	}

	# set new smtp_sasl_password_maps if enabled
	my $smtp_sasl_password_maps = qx( ${POSTCONF} -h -c "$g_target_root$_POSTFIX_CONFIG" smtp_sasl_password_maps );
	chomp $smtp_sasl_password_maps;
	if ( $smtp_sasl_password_maps eq "hash:/etc/postfix/sasl/passwd" ) {
		qx( ${POSTCONF} -c "$g_target_root$_POSTFIX_CONFIG" -e smtp_sasl_password_maps=hash:/Library/Server/Mail/Config/postfix/sasl/passwd );
	}

	# aliases is in /etc/postfix but aliases.db is in /etc and needs updating
	system( "/usr/sbin/postalias \"$g_target_root/private/etc/aliases\" >> $_migration_log_file 2>> $_migration_log_file" );

	# reset $recipient_canonical_maps
	my $recipient_canonical_maps = 	`${POSTCONF} -h -c "$g_target_root$_POSTFIX_CONFIG" recipient_canonical_maps`;
	chomp $recipient_canonical_maps;
	if ( $recipient_canonical_maps eq "hash:/etc/postfix/system_user_maps" ) {
		&log_message( "resetting SMTP recipient canonical maps: recipient_canonical_maps=hash:/Library/Server/Mail/Config/postfix/system_user_maps" );
		system( "${POSTCONF} -c \"$g_target_root$_POSTFIX_CONFIG\" -e recipient_canonical_maps=hash:/Library/Server/Mail/Config/postfix/system_user_maps" );
	}

	# update main.cf
	if (!qx($GREP "imap_submit_cred_file *=" "$g_target_root$_POSTFIX_CONFIG/main.cf" 2>>$_migration_log_file)) {
		my $mcapp = "$g_target_root$_POSTFIX_CONFIG/main.cf";
		if (open(MCAPP, ">>", $mcapp)) {
			print MCAPP <<'EOT';
# (APPLE) Credentials for using URLAUTH with IMAP servers.
imap_submit_cred_file = /Library/Server/Mail/Config/postfix/submit.cred

EOT
			close(MCAPP);
		} else {
			&log_message( "can't append to $mcapp: $!" );
		}
	} else {
		system( "${POSTCONF} -c \"$g_target_root$_POSTFIX_CONFIG\" -e imap_submit_cred_file=/Library/Server/Mail/Config/postfix/submit.cred" );
	}

	if (!qx($GREP sacl-cache "$g_target_root$_POSTFIX_CONFIG/main.cf" 2>>$_migration_log_file)) {
		my $mcapp = "$g_target_root$_POSTFIX_CONFIG/main.cf";
		if (open(MCAPP, ">>", $mcapp)) {
			print MCAPP <<'EOT';
# (APPLE) The SACL cache caches the results of Mail Service ACL lookups.
# Tune these to make the cache more responsive to changes in the SACL.
# The cache is only in memory, so bouncing the sacl-cache service clears it.
use_sacl_cache = yes
# sacl_cache_positive_expire_time = 7d
# sacl_cache_negative_expire_time = 1d
# sacl_cache_disabled_expire_time = 1m

EOT
			close(MCAPP);
		} else {
			&log_message( "can't append to $mcapp: $!" );
		}
	}

	# Create submit.cred with either the same password dovecot is
	# configured for, or an unguessable random password.
	if (!path_exists("$g_target_root$_POSTFIX_CONFIG/submit.cred")) {
		my ($hostname) = qx($GREP "^myhostname *=" "$g_target_root$_POSTFIX_CONFIG/main.cf" 2>>$_migration_log_file | sed 's,.*= *,,');
		chomp $hostname;
		if (!defined($hostname) || $hostname eq "") {
			($hostname) = qx(hostname);
			chomp $hostname;
		}
		my $pw;
		if (path_exists("$g_target_root$_DOVECOT_CONFIG/submit.passdb")) {
			($pw) = qx($GREP "^submit:" "$g_target_root$_DOVECOT_CONFIG/submit.passdb" 2>>$_migration_log_file | sed -e 's,.*},,' -e 's,:.*,,');
			chomp $pw;
		}
		if (!defined($pw) || $pw eq "") {
			($pw) = qx(dd if=/dev/urandom bs=256 count=1 2>>$_migration_log_file | env LANG=C tr -dc a-zA-Z0-9 | cut -b 1-22);
			chomp $pw;
		}
		if (defined($pw) && $pw ne "" && defined($hostname) && $hostname ne "") {
			my $scnew = "$g_target_root$_POSTFIX_CONFIG/submit.cred";
			if (open(SCNEW, ">", $scnew)) {
				print SCNEW "submitcred version 1\n";
				print SCNEW "$hostname|submit|$pw\n";
				close(SCNEW);
			} else {
				&log_message( "can't write $scnew: $!" );
			}
			chmod(0600, "$g_target_root$_POSTFIX_CONFIG/submit.cred");
		}
	}

	# remove mailman from alias_maps
	my $alias_maps = `${POSTCONF} -h -c "$g_target_root$_POSTFIX_CONFIG" alias_maps`;
	chomp($alias_maps);
	my $line = $alias_maps;
	$line =~ s/,hash:\/var\/mailman\/data\/aliases//;
	system( "${POSTCONF} -c \"$g_target_root$_POSTFIX_CONFIG\" -e alias_maps='$line'" );

} # migrate_postfix_config


#############################################################################
# update_master_cf (med)

sub update_master_cf ()
{
	my $has_dovecot = 0;
	my $has_greylist = 0;

	# validating master.cf
	&log_message( "Updating $_POSTFIX_CONFIG/master.cf" );
	system( "$_server_admin command mail:command = validateMasterCf >> $_migration_log_file" );

	# disable virus scanning to allow for config file update
	&log_message( "Disabling junk mail & virus scanning" );
	system( "$_server_admin settings mail:postfix:virus_scan_enabled = no >> $_migration_log_file" );
	system( "$_server_admin settings mail:postfix:spam_scan_enabled = no >> $_migration_log_file" );

	# check to see if dovecot is already defined
	open( MASTER_CF, "<$g_target_root" . $_CONFIG_ROOT . "/postfix/master.cf" ) or die "can't open $g_target_root" . $_CONFIG_ROOT . "/postfix/master.cf: $!";
	while( <MASTER_CF> )
	{
		# store $_ value because subsequent operations may change it
		my($a_line) = $_;

		# strip the trailing newline from the line
		chomp($a_line);

		if ( substr( ${a_line}, 0, 7) eq "dovecot" ) {
			$has_dovecot = 1;
		}
		if ( substr( ${a_line}, 0, 6) eq "policy" ) {
			$has_greylist = 1;
		}
	}
	close(MASTER_CF);

	if ( path_exists( "$g_target_root" . $_CONFIG_ROOT . "/postfix/master.cf.out" ) ) {
		unlink( "$g_target_root" . $_CONFIG_ROOT . "/postfix/master.cf.out" );
	}

	# add dovecot 
	if ( $has_dovecot == 0 )
	{
		print MASTER_CF_OUT "#" . "\n";
		print MASTER_CF_OUT "# Dovecot" . "\n";
		print MASTER_CF_OUT "#" . "\n";
		print MASTER_CF_OUT "dovecot   unix  -       n       n       -       25      pipe" . "\n";
		print MASTER_CF_OUT "  flags=DRhu user=_dovecot:mail argv=/usr/libexec/dovecot/dovecot-lda -d \${user}" . "\n";
	}

	# add greylist policy
	if ( $has_dovecot == 0 )
	{
		print MASTER_CF_OUT "#" . "\n";
		print MASTER_CF_OUT "# Greylist policy server" . "\n";
		print MASTER_CF_OUT "#" . "\n";
		print MASTER_CF_OUT "policy    unix  -       n       n       -       -       spawn" . "\n";
		print MASTER_CF_OUT "  user=nobody:mail argv=/usr/bin/perl /usr/libexec/postfix/greylist.pl" . "\n";
	}

	close( MASTER_CF );
	close( MASTER_CF_OUT );

	unlink("$g_target_root" . $_CONFIG_ROOT . "/postfix/master.cf");
	move( "$g_target_root" . $_CONFIG_ROOT . "/postfix/master.cf.out", "$g_target_root" . $_CONFIG_ROOT . "/postfix/master.cf");

} # update_master_cf


#############################################################################
# migrate_dovecot_data ()

sub migrate_dovecot_data ()
{
	log_funct( "migrate_dovecot_data" );
	&log_message( "Migrating POP/IMAP mail data" );

	# migrate sieve scripts
	if ( ! path_exists( "$g_target_root$_DATA_ROOT/rules" ) ) {
		qx( mkdir -p "$g_target_root$_DATA_ROOT/rules" >> $_migration_log_file );
	}

	if ( path_exists( "${g_source_root}/private/var/spool/imap/dovecot/sieve-scripts" ) ) {
		&log_message( "Migrating custom mail rules from: ${g_source_root}/private/var/spool/imap/dovecot/sieve-scripts" );
		qx( rsync -av "${g_source_root}/private/var/spool/imap/dovecot/sieve-scripts/" "$g_target_root$_DATA_ROOT/rules/" >> $_migration_log_file );
	} elsif ( path_exists( "${g_source_root}$_DATA_ROOT/rules" ) ) {
		&log_message( "Migrating custom mail rules from: ${g_source_root}$_DATA_ROOT/rules" );
		qx( rsync -av "${g_source_root}$_DATA_ROOT/rules/" "$g_target_root$_DATA_ROOT/rules/" >> $_migration_log_file );
	}

	&log_message( "Begin mail message data migration" );

	# get default path
	open( PARTITIONS, "<${g_source_root}" . "/private/etc/dovecot/partition_map.conf" );
	while( <PARTITIONS> )
	{
		# store $_ value because subsequent operations may change it
		my( $a_line ) = $_;

		# strip the trailing newline from the line
		chomp( $a_line );

		my $offset = index($a_line, ":");
		if ( $offset != -1 )
		{
			# strip the quotes
			my $a_path = substr( $a_line, $offset + 1 );

			# is it local
			if ( ($a_path =~ m,^/var/spool/imap/dovecot/mail,) || ($a_path =~ m,^/private/var/spool/imap/dovecot/mail,)) {
				&log_message( "Copying mail data from:" );
				&log_message( "       source: $a_path" );
				&log_message( "  destination: $_DATA_ROOT/mail" );
				&log_message( "           by: ${CP} -rpfv ${g_source_root}${a_path}/* $g_target_root$_DATA_ROOT/mail" );

				# create default mail data store destination
				qx( mkdir -p "$g_target_root$_DATA_ROOT/mail" >> $_migration_log_file );

				# copy the mail
				qx( ${CP} -rpfv "${g_source_root}${a_path}/"* "$g_target_root$_DATA_ROOT/mail" >> $_migration_log_file );

				push( @g_clean_partitions, "${g_source_root}" . $a_path );

				# reset default path
				&log_message( "Setting default mail partition to: $_DATA_ROOT/mail" );
				qx( $_server_admin settings mail:imap:partition-default = "$_DATA_ROOT/mail" >> $_migration_log_file );
			} elsif ( (substr($a_path, 0, 5) eq "/var/") || (substr($a_path, 0, 5) eq "/etc/") ) {
				if ( path_exists( "${g_source_root}/private" . $a_path) ) {
					qx( mkdir -p "$g_target_root/private${a_path}" >> $_migration_log_file );
					qx( ${CP} -rpfv "${g_source_root}/private${a_path}/"* "$g_target_root/private${a_path}" >> $_migration_log_file );

					push( @g_clean_partitions, "${g_source_root}/private" . $a_path );
				}
			} elsif ($a_path =~ m,^/Library/Server/Mail/Data/,) {
				qx( mkdir -p "$g_target_root${a_path}" >> $_migration_log_file );
				qx( ${CP} -rpfv "${g_source_root}${a_path}/"* "$g_target_root${a_path}" >> $_migration_log_file );

				push( @g_clean_partitions, "${g_source_root}" . $a_path );
			}
			qx( ${CHOWN} -R _dovecot:mail "$g_target_root${a_path}" >> $_migration_log_file );
		}
	}
	close( PARTITIONS );

	&log_message( "Mail message data migration complete" );

	# new for dovecot >= 2.2:  a place to store mail attributes
	if ( ! path_exists( "$g_target_root$_DATA_ROOT/attributes" ) ) {
		qx( mkdir -p -m 775 "$g_target_root$_DATA_ROOT/attributes" >> $_migration_log_file );
	}

	# set ownership on default dovecot mail data store & sive scripts
	qx( ${CHOWN} -R _dovecot:mail "$g_target_root/Library/Server/Mail/Data/mail" >> $_migration_log_file );
	qx( ${CHOWN} -R _dovecot:mail "$g_target_root/Library/Server/Mail/Data/rules" >> $_migration_log_file );
	qx( ${CHOWN} -R _dovecot:mail "$g_target_root/Library/Server/Mail/Data/attributes" >> $_migration_log_file );

} # migrate_dovecot_data


#############################################################################
# escape_str ()
#	only a-z, A-Z, 0-9 and % allowed
#	and all other characters are hex-encoded

sub escape_str
{
	my $s = shift;
	$s =~ s/([^a-zA-Z0-9])/sprintf("%%%02x", ord($1))/eg;
	return $s;
} # escape_str


#############################################################################
# scan_mail_acct ()
#	scan mail account for sub mailboxes and create indexes for each

sub scan_mail_acct
{
	my $in_dir = $_[0];
	my $clean_name = escape_str($_[1]);
	my $dst_path = $g_target_root . "/var/db/dovecot.fts.update";

	if (!opendir(MAIL_ACCT_DIR, $in_dir)) {
		&log_message( "cannot open mailbox: $in_dir" );
		return;
	}

	my @mailboxes = readdir(MAIL_ACCT_DIR);
	closedir(MAIL_ACCT_DIR);

	# create index for INBOX
	if(open(MY_FILE, ">$dst_path/" . $clean_name . ".INBOX")) {
		print MY_FILE "\n";
		close(MY_FILE);
	}

	$in_dir .= "/";

	# create index for any sub-mailbox
	my $file = "";
	foreach $file (@mailboxes) {
		my $a_path = $in_dir.$file;
		if (-d $a_path) {
			if (($file ne ".") && ($file ne "..")) { 
				if (substr($file, 0, 1) eq ".") {
					$file = substr($file, 1, length($file) -1);
					if (open(MY_FILE, ">$dst_path/$clean_name." . escape_str($file))) {
						print MY_FILE "\n";
						close(MY_FILE);
					}
				}
			}
		}
	}
} # scan_mail_acct

#############################################################################
# uuidof volume mapping

sub uuidof
{
	my $volume = shift;

	my $uuid = "";
	if (defined($volume) && $volume ne "" && -e $volume) {
		my @infos = qx(/usr/sbin/diskutil info "$volume");
		for (@infos) {
			if (/\s*Volume UUID:\s*([0-9A-F]{8}(-[0-9A-F]{4}){3}-[0-9A-F]{12})/) {
				$uuid = $1;
				last;
			}
		}
	}
	return $uuid;
}

#############################################################################
# create_fts_indexes ()
#	create fts indexes for all mail accounts

sub create_fts_indexes ()
{
	log_funct( "create_fts_indexes" );

	# create indexes for accounts on all partitions
	open(PARTITIONS, "<$g_target_root" . $_CONFIG_ROOT . "/dovecot/partition_map.conf");
	while(<PARTITIONS>) {
		my($a_line) = $_;
		chomp($a_line);

		# get partition path
		my $offset = index($a_line, ":");
		if ($offset != -1) {
			# strip the quotes
			my $a_path = substr($a_line, $offset + 1);

			# get list of user mail account
			if (!opendir(MAIL_DIRS, $a_path)) {
				&log_message( "cannot open: $a_path" );
				next;
			}
			my @acct_dirs= readdir(MAIL_DIRS);
			closedir(MAIL_DIRS);

			# make the fts indexes for valid user accounts
			my $file;
			foreach $file (@acct_dirs) {
				next unless $file =~ /^[A-F0-9-]+$/;
				if(($file ne ".") && ($file ne "..")) { 
					# convert GUID to valid user ID
					my $user_id = qx($_mail_data_tool -u $file);
					if (substr($user_id, 0, 16) ne "No user id found") {
						chomp($user_id);
						scan_mail_acct($a_path . "/" . $file, $user_id);
					}
				}
			}
		}
	}
	close(PARTITIONS);
} # create_fts_indexes

################################################################################
# We only want to run this script if the previous system version is greater
#  than or equal to 10.6 and less than 10.8!

sub is_valid_version () 
{
	log_funct( "is_valid_version" );

	my ( $valid ) = 0;

	if ( (substr(${g_source_version}, 0, 4) >= ${MIN_VER}) && (substr(${g_source_version}, 0, 4) < ${MAX_VER}) ) {
		$valid = 1;
    	log_debug( "- valid: ${g_source_version}");

		if ( substr(${g_source_version}, 0, 4) eq "10.9" ) {
			$g_os_ver_10_9_x = 1;
		} elsif ( substr(${g_source_version}, 0, 4) eq "10.8" ) {
			$g_os_ver_10_8_x = 1;
		} elsif ( substr(${g_source_version}, 0, 4) eq "10.7" ) {
			$g_os_ver_10_7_x = 1;
		} elsif ( substr(${g_source_version}, 0, 4) eq "10.6" ) {
			$g_os_ver_10_6_x = 1;
		}
	} else {
		printf( "- Version supplied was not valid: %s\n", $g_source_version );
	}

	return( ${valid} );
} # is_valid_version


################################################################################
# verify the language setting

sub is_valid_language () 
{
	log_funct( "is_valid_language" );

	my ( $valid ) = 0;

	if ( (${g_language} eq "en") || (${g_language} eq "fr") ||
		 (${g_language} eq "de") || (${g_language} eq "ja") ) {
		$valid = 1;
    	log_debug( "- valid: ${g_language}");
	} elsif ( ${g_language} eq "" ) {
		$valid = 1;
		$g_language = "en";
    	&log_message( "No language specified.  Defaulting to: ${g_language}" );
	}

	return( ${valid} );
} # is_valid_language


################################################################################
# parse_options()
#	Takes a list of possible options and a boolean indicating
#	whether the option has a value following, and sets up an associative array
#	%opt of the values of the options given on the command line. It removes all
#	the arguments it uses from @ARGV and returns them in @optArgs.

sub parse_options
{
    my (@optval) = @_;
    my ($opt, @opts, %valFollows, @newargs);

    while (@optval) {
		$opt = shift(@optval);
		push(@opts,$opt);
		$valFollows{$opt} = shift(@optval);
    }

    my @optArgs = ();
    my %opt = ();

	my $arg;
    arg: while (defined($arg = shift(@ARGV))) {
		foreach my $opt (@opts) {
			if ($arg eq $opt) {
				push(@optArgs, $arg);
				if ($valFollows{$opt}) {
					$opt{$opt} = shift(@ARGV);
					push(@optArgs, $opt{$opt});
				} else {
					$opt{$opt} = 1;
				}
				next arg;
			}
		}
		push(@newargs,$arg);
    }
    @ARGV = @newargs;
} # parse_options


################################################################################
# print script argument keys and values

sub print_script_args ()
{
	my %script_args = @_;
	while(my ($theKey, $theVal) = each (%script_args)) {
		print "$theKey: $theVal\n";
	}
} # print_script_args


################################################################################
# check if a path exists

sub path_exists ($)
{
	log_funct( "path_exists" );

	my $exists = 0;
	my ($in_path) = @_;

	if (-e "${in_path}") {
		$exists = 1;
    	log_debug( "- path exists: ${in_path}");
	} else {
    	log_debug( "- path does not exist: ${in_path}");
	}

	return( $exists );
} # path_exists


################################################################################
# check if a path's parent exists

sub parent_exists () 
{
    log_funct( "parent_exists" );

	my ($out_val) = 0;
	my ($in_path) = @_;

	my $parent_path = qx( /usr/bin/dirname "${in_path}" );
	chomp $parent_path;

	if ( -e "${parent_path}" )
	{
		$out_val = 1;
    	log_debug( " path exists: ${in_path}");
	} else {
		log_debug( " path does not exist: ${in_path}");
	}

	return( $out_val );
} # parent_exists


################################################################################
# Create the parent directory

sub create_parent_dir ()
{
	log_funct( "create_parent_dir" );

	my ($out_val) = 0;
	my ($in_path) = @_;

	my $parent_dir = qx(/usr/bin/dirname "${in_path}");
	chomp($parent_dir);

   	log_debug( "- parent_dir: ${parent_dir}");

	qx( /bin/mkdir -p "${parent_dir}" >> $_migration_log_file );

	if ( -e "${parent_dir}" ) {
		$out_val = 1; }

	return( ${out_val} );
} # create_parent_dir


################################################################################
# check if a path exists

sub do_cleanup ($)
{
	log_funct( "do_cleanup" );

	my ($in_path) = @_;

	if ( path_exists("${in_path}") ) {
		&log_message( "Removing source: ${in_path}" );
		qx( ${RM} -rf "${in_path}" 2>&1 >> $_migration_log_file );
	}
} # do_cleanup


################################################################################
# Show usage

sub Usage()
{
	print("Usage:\n");
	print("  --purge <0 | 1>   \"1\" means remove any files from the old system after you've migrated them, \"0\" means leave them alone." . "\n");
	print("  --sourceRoot <path> The path to the root of the system to migrate" . "\n");
	print("  --sourceType <System | TimeMachine> Gives the type of the migration source, whether it's a runnable system or a " . "\n");
	print("                    Time Machine backup." . "\n");
	print("  --sourceVersion <ver> The version number of the old system (like 10.6.7 or 10.7). Since we support migration from 10.6, 10.7," . "\n");
	print("                    and other 10.8 installs." . "\n");
	print("  --targetRoot <path> The path to the root of the new system." . "\n");
	print("  --language <lang> A language identifier, such as \"en.\" Long running scripts should return a description of what they're doing " . "\n");
	print("                    (\"Migrating Open Directory users\"), and possibly provide status update messages along the way. These messages " . "\n");
	print("                    need to be localized (which is not necessarily the server running the migration script). " . "\n");
	print("                    This argument will identify the Server Assistant language. As an alternative to doing localization yourselves " . "\n");
	print("                    send them in English, but in case the script will do this it will need this identifier." . "\n");
	print(" " . "\n");
} # Usage

################################################################################
# do_migration()

sub do_migration()
{
	my %script_args = @_;

	## set the globals with the user options
	$g_purge = $script_args{"--purge"};
	$g_source_root = $script_args{"--sourceRoot"};
	$g_source_type = $script_args{"--sourceType"};
	$g_source_version = $script_args{"--sourceVersion"};
	$g_target_root = $script_args{"--targetRoot"};
	$g_language = $script_args{"--language"};

	## log migration start time
	my $start_time = localtime();
	&log_message( "-------------------------------------------------------------" );
	&log_message( "Begin Mail Migration: $start_time" );

	##  log settings
	&log_message( "        purge: ${g_purge}" );
	&log_message( "   sourceRoot: ${g_source_root}" );
	&log_message( "   sourceType: ${g_source_type}" );
	&log_message( "sourceVersion: ${g_source_version}" );
	&log_message( "   targetRoot: $g_target_root" );
	&log_message( "     language: ${g_language}" );

	##  verify source volume
	if ( ! path_exists( "${g_source_root}" ) ) {
		&log_exit_error( "Source for upgrade/migration: ${g_source_root} does not exist." );
		exit( 1 );
	}

	##  verify target volume
	if ( ! path_exists("$g_target_root") ) {
		&log_exit_error( "Destination for upgrade/migration: $g_target_root does not exist." );
		exit( 1 );
	}

	##  check version info
	if ( ! is_valid_version() ) {
		&log_exit_error( "Invalid version: $g_source_version.  Valid versions are between: >= ${MIN_VER} and < ${MAX_VER}." );
		exit( 1 );
	}

	##  verify language setting
	if ( ! is_valid_language() ) {
		&log_exit_error( "Invalid language: $g_language.  Valid languages are: [en|fr|de|ja]" );
		exit( 1 );
	}

	## parse ServerVersion passed in
	parse_source_version( $g_source_version );

	if ( !("${g_source_root}" eq "/Library/Server/Previous") ) {
		$g_source_uuid = uuidof($g_source_root);
	}

	## stop postfix
	unload_postfix();

	######################
	# General settings
	######################

	# clean up deprecated keys
	if ( "$g_target_root" eq "/" ) {
		&log_message( "Updating postfix desktop config" );

		my $cnt = 0;
		my $src = "/private/etc/postfix/main.cf";
		my @deprecated_keys = ("^virus_db_update_enabled", "^virus_db_last_update", "^smtpd_tls_common_name", "^spam_domain_name");

		# make a copy of original
		copy( "$src",  "$src.$g_source_version.orig" );

		for ( $cnt = 0; $cnt < 3; $cnt++) {
			my $value = `${GREP} $deprecated_keys[$cnt] $src`;
			if ( !($value eq "") ) {
				my $dst = "/private/etc/postfix/main.cf.um.tmp";
				qx( /usr/bin/sed -e "/$deprecated_keys[$cnt]/d" "$src" > "$dst" );
				move( "$dst", "$src" );
			}
		}

		# clean legacy smtp_fallback
		$src = "/private/etc/postfix/master.cf";
		my $value = qx( ${GREP} "o fallback_relay=" $src );
		if ( !($value eq "") ) {
			# fix existing master.cf
			my $dst = "/private/etc/postfix/master.cf.um.tmp";
			qx( /usr/bin/sed -e "s/o fallback_relay=/o smtp_fallback_relay=/" "$src" > "$dst" );
			move( "$src",  "$src" . ".$g_source_version" . ".orig" );
			move( "$dst", "$src" );
		}

		# make sure local postfix is up to date
		system( "mkdir -p $g_target_root/Library/Server/Mail/Data/spool" );

		qx( ${POSTFIX} upgrade-configuration >> $_migration_log_file );
		qx( ${POSTFIX} check >> $_migration_log_file );
		qx( ${POSTFIX} set-permissions >> $_migration_log_file 2>>$_migration_log_file );

		&log_message( "Updating postfix desktop config complete" );
	}

	# if not migrating to root volume
	if ( "$g_target_root" ne "/" ) {
		# need to create and link Mail dir to receive default setup info
		if ( path_exists( $_MAIL_ROOT ) ) {
			move( $_MAIL_ROOT,  $_MAIL_ROOT . ".um.tmp" );
		}

		# create dest mail root if it doesn't exist
		if ( !path_exists( "$g_target_root" . $_MAIL_ROOT ) ) {
			mkdir( "$g_target_root" . $_MAIL_ROOT, 0755 );
		}
		qx( /bin/ln -s "$g_target_root$_MAIL_ROOT" $_MAIL_ROOT );

		# now set target root to default then clean up when finished
		$g_target_root_orig = $g_target_root;
		$g_target_root = "/";
	}

	## setup config files
	system( "$_promo_extras/60-mail_services.pl >> $_migration_log_file" );
	system( "$_promo_extras/61-mail_services_interface.pl >> $_migration_log_file" );
	system( "$_promo_extras/62-mail_services_filter.pl >> $_migration_log_file" );
	system( "$_promo_extras/63-mail_services_virus_scanner.pl >> $_migration_log_file" );
	system( "$_promo_extras/64-mail_services_mta.pl >> $_migration_log_file" );
	system( "$_promo_extras/65-mail_services_access.pl >> $_migration_log_file" );
	# remove pre-generated submit.passdb
	unlink ( "$g_target_root$_DOVECOT_CONFIG/submit.passdb" );

	&log_message( "-------------------------------------------------------------" );
	&log_message( "Migrate Mail Service Settings" );

	# migrate general settings plist
	&log_message( "Migrating cached mail service settings file" );
	if ( path_exists("$g_target_root$_CONFIG_ROOT/MailServicesOther.plist") ) {
		# save current copy
		&log_message( "Saving current cached settings file: $g_target_root$_CONFIG_ROOT/MailServicesOther.${TARGET_VER}.plist" );
		copy("$g_target_root$_CONFIG_ROOT/MailServicesOther.plist", "$g_target_root$_CONFIG_ROOT/MailServicesOther.${TARGET_VER}.plist" );
	}

	# migrate MailServicesOther.plist
	if ( path_exists("${g_source_root}/private/etc/MailServicesOther.plist") ) {
		# copy existing other settings plist
		copy("${g_source_root}/private/etc/MailServicesOther.plist", "$g_target_root$_CONFIG_ROOT/MailServicesOther.plist" );
	} else {
		&log_message( "Warning: Missing cached settings file: ${g_source_root}/private/etc/MailServicesOther.plist.  Using defaults" );

		# copy default MailServicesOther.plist from Source Root if needed
		if ( !path_exists("$g_target_root$_CONFIG_ROOT/MailServicesOther.plist") ) {
			if ( path_exists("$_server_root/private/etc/MailServicesOther.plist.default") ) {
				copy("$_server_root/private/etc/MailServicesOther.plist.default", "$g_target_root$_CONFIG_ROOT/MailServicesOther.plist" );
			}
		}
	}

	######################
	# amavisd
	######################

	&log_message( "-------------------------------------------------------------" );
	&log_message( "Migrate Junkmail & Virus Service Settings and Data" );

	if ( "$g_target_root" eq "/" ) {
		# if boot vol, save spam & virus settings to re-enable later
		open( AMAVIS_CONF, "<${g_source_root}" . "/private/etc/amavisd.conf" );
		while( <AMAVIS_CONF> ) {
			# store $_ value because subsequent operations may change it
			my( $a_line ) = $_;

			# strip the trailing newline from the line
			chomp($a_line);

			# looking for: #@bypass_spam_checks_maps  = (1);
			my $a_key = index( ${a_line}, "\@bypass_spam_checks_maps" );
			my $a_val = index( ${a_line}, "=" );
			if ( ($a_key != -1) && ($a_val != -1) ) {
				if ( substr( ${a_line}, 0, 1) eq "#" ) {
					&log_message( "Junk mail scanning enabled in: ${g_source_root} " );
					$g_enable_spam = 1;
				}
			}

			# looking for: #@bypass_virus_checks_maps = (1);
			$a_key = index( ${a_line}, "\@bypass_virus_checks_maps" );
			$a_val = index( ${a_line}, "=" );
			if ( ($a_key != -1) && ($a_val != -1) ) {
				if ( substr( ${a_line}, 0, 1) eq "#" ) {
					&log_message( "Virus scanning enabled in: ${g_source_root} " );
					$g_enable_virus = 1;
				}
			}

			# get previous hit level
			$a_key = index( ${a_line}, "\$sa_tag2_level_deflt" );
			$a_val = index( ${a_line}, "=" );
			if ( ($a_key != -1) && ($a_val != -1) ) {
				$a_line =~ s/^.*\=//;
				$a_line =~ s/;.*//;
				$a_line =~ s/^\s+//; #remove leading spaces
				$a_line =~ s/\s+$//; #remove trailing spaces
				$g_required_hits = $a_line;
			}

			# get previous spam subject tag
			$a_key = index( ${a_line}, "\$sa_spam_subject_tag" );
			$a_val = index( ${a_line}, "=" );
			if ( ($a_key != -1) && ($a_val != -1) ) {
				$g_spam_subj_tag = $a_line;
				$g_spam_subj_tag =~ s/^.*\= //;
				$g_spam_subj_tag =~ s/;.*//;
				$g_spam_subj_tag =~ s/^\s+//; #remove leading spaces
				$g_spam_subj_tag =~ s/\s+$//; #remove trailing spaces
				$g_spam_subj_tag =~ s/^\'//; #remove leading '
				$g_spam_subj_tag =~ s/\'//; #remove trailing '
			}
		}
		close(AMAVIS_CONF);
	} else {
		my $src_file = "${g_source_root}/private/etc/MailServicesOther.plist";
		my $src_dict = NSDictionary->dictionaryWithContentsOfFile_( ${src_file} );
		if ( $src_dict && $$src_dict ) {
			my $postfix_dict = $src_dict->objectForKey_( "postfix" );
			if ( $postfix_dict && $$postfix_dict) {
				if ( $postfix_dict->isKindOfClass_( NSDictionary->class ) ) {
					$g_enable_spam = obj_value( $postfix_dict->objectForKey_( "spam_enabled") );
				}
			}
		}
	}

	# change home directory for amavisd user
	system(	"${DSCL} localhost change /Local/Default/Users/_amavisd NFSHomeDirectory /var/virusmails /Library/Server/Mail/Data/scanner/amavis" );

	# get learn junk mail users
	my $learn_jm_sh = "$g_source_root/private/etc/mail/spamassassin/learn_junk_mail.sh";
	if ( path_exists( $learn_jm_sh ) ) {
		my $jm_user = qx( grep "^JUNK_MAIL_USER" $learn_jm_sh );
		chomp( $jm_user );
		if ( $jm_user ne "" ) {
			$jm_user =~ s/^.*\=//;
			$jm_user =~ s/^\s+//; #remove leading spaces
			$jm_user =~ s/\s+$//; #remove trailing spaces

			&log_message( "Setting junk mail user account to: $jm_user" );
			qx( ${PLIST_BUDDY} -c 'Add junk_mail:junk_mail_userid string $jm_user' "$g_target_root$_CONFIG_ROOT/MailServicesOther.plist" );
		}

		my $not_jm_user = qx( grep "^NOT_JUNK_MAIL_USER" $learn_jm_sh );
		chomp( $not_jm_user );
		if ( $not_jm_user ne "" ) {
			$not_jm_user =~ s/^.*\=//;
			$not_jm_user =~ s/^\s+//; #remove leading spaces
			$not_jm_user =~ s/\s+$//; #remove trailing spaces

			&log_message( "Setting not junk mail user account to: $not_jm_user" );
			qx( ${PLIST_BUDDY} -c 'Add junk_mail:not_junk_mail_userid string $not_jm_user' "$g_target_root$_CONFIG_ROOT/MailServicesOther.plist" );
		}
	}

	# migrate Spam Assassin config files
	my $sa_local_cf = "$g_source_root/private/etc/mail/spamassassin/local.cf";
	if ( path_exists( $sa_local_cf ) ) {
		copy($sa_local_cf, "$g_target_root$_CONFIG_ROOT/spamassassin/local.cf" );
		qx( $_server_admin settings mail:postfix:bayes_path = "$_DATA_ROOT/scanner/amavis/.spamassassin/bayes" >> $_migration_log_file );
	}

	# set hit level & tag
	system( "$_server_admin settings mail:postfix:required_hits = $g_required_hits >> $_migration_log_file" );
	system( "$_server_admin settings mail:postfix:spam_subject_tag = \"$g_spam_subj_tag\" >> $_migration_log_file" );

	# removed amavisd from launchd overrides.plist
	my $_overrides_plist = "/var/db/launchd.db/com.apple.launchd/overrides.plist";
	my $_overrides_dict = NSDictionary->dictionaryWithContentsOfFile_( $_overrides_plist );
	if ( $_overrides_dict && $$_overrides_dict ) {
		$_overrides_dict->removeObjectForKey_("org.amavis.amavisd");
		$_overrides_dict->removeObjectForKey_("org.amavis.amavisd_cleanup");
		$_overrides_dict->writeToFile_atomically_( $_overrides_plist, 1 );
	}

	######################
	# clamav
	######################

	# migrate database upgrade check times
	migrate_db_update_times();

	######################
	# postfix
	######################

	&log_message( "-------------------------------------------------------------" );
	&log_message( "Migrate SMTP Service Settings and Data" );

	# migrate postfix config
	migrate_postfix_config();

	# validate master cf settings
	qx( $_server_admin command mail:command = validateMasterCf );

	# update obsolete values
	my $src_main_cf = "$g_target_root$_POSTFIX_CONFIG";
	my $client_restrictions = qx( ${POSTCONF} -c "$src_main_cf" smtpd_client_restrictions );
	if ( index($client_restrictions, "reject_unknown_client") != -1 ) {
		qx( $_server_admin settings mail:postfix:reject_unknown_client_enabled = yes >> $_migration_log_file );
	}

	my $helo_restrictions = qx( ${POSTCONF} -c "$src_main_cf" smtpd_helo_restrictions );
	if ( index($helo_restrictions, "reject_non_fqdn_hostname") != -1 ) {
		qx( $_server_admin settings mail:postfix:reject_non_FQDN_enabled = yes >> $_migration_log_file );
	}

	if ( index($helo_restrictions, "reject_unknown_hostname") != -1 ) {
		qx( $_server_admin settings mail:postfix:reject_unknown_host_enabled = yes >> $_migration_log_file );
	}

	if ( index($helo_restrictions, "reject_invalid_hostname") != -1 ) {
		qx( $_server_admin settings mail:postfix:reject_invalid_host_enabled = yes >> $_migration_log_file );
	}

	# migrate postfix spool data
	migrate_postfix_spool();

	# set keys in main.cf
	qx( ${POSTCONF} -c "$g_target_root$_POSTFIX_CONFIG" -e mail_owner=_postfix >> $_migration_log_file );
	qx( ${POSTCONF} -c "$g_target_root$_POSTFIX_CONFIG" -e setgid_group=_postdrop >> $_migration_log_file );
	qx( ${POSTCONF} -c "$g_target_root$_POSTFIX_CONFIG" -e mailbox_transport=dovecot >> $_migration_log_file );

	# enable IPv4 & IPv6
	my @inet_protocols = qx( ${POSTCONF} -h -c "$g_target_root$_POSTFIX_CONFIG" inet_protocols );
	chomp(@inet_protocols);
	# check for custom settings and only change if current settings are IPv4 or misconfigured
	if ( (@inet_protocols > 0) && (($inet_protocols[0] eq "ipv4") || ($inet_protocols[0] eq "")) ) {
		qx( ${POSTCONF} -c "$g_target_root$_POSTFIX_CONFIG" -e inet_protocols=all >> $_migration_log_file );
	}

	&log_message( "" );
	my $virt_doms = qx( ${POSTCONF} -h -c "$g_target_root$_POSTFIX_CONFIG" virtual_alias_domains );
	chomp($virt_doms);
	my $virt_trans = qx( ${POSTCONF} -h -c "$g_target_root$_POSTFIX_CONFIG" virtual_transport );
	chomp($virt_trans);
	if ( index($virt_doms, "hash:/Library/Server/Mail/Config/postfix/virtual_domains") != -1 )
	{
		qx( $_server_admin settings mail:postfix:enable_virtual_domains = yes >> $_migration_log_file );
		qx( ${POSTCONF} -c "$g_target_root$_POSTFIX_CONFIG" -e virtual_transport=virtual >> $_migration_log_file );
		qx( ${POSTCONF} -c "$g_target_root$_POSTFIX_CONFIG" -e virtual_mailbox_domains='$virt_doms' >> $_migration_log_file );
	} else {
		qx( $_server_admin settings mail:postfix:enable_virtual_domains = no >> $_migration_log_file );
	}

	# check for system_user_maps
	if ( !path_exists( "$g_target_root$_POSTFIX_CONFIG/system_user_maps" ) ) {
		open( SYS_USER_MAPS, "> $g_target_root$_POSTFIX_CONFIG/system_user_maps" );
		print SYS_USER_MAPS ${g_header_string};
		close SYS_USER_MAPS;
	}
	if ( !path_exists( "$g_target_root$_POSTFIX_CONFIG/system_user_maps.db" ) ) {
		qx( ${POSTMAP} "$g_target_root$_POSTFIX_CONFIG/system_user_maps" );
	}

	# update using postfix built-in commands
	qx( ${POSTFIX} -c "$g_target_root$_POSTFIX_CONFIG" upgrade-configuration >> $_migration_log_file );
	qx( ${POSTFIX} -c "$g_target_root$_POSTFIX_CONFIG" check >> $_migration_log_file );
	qx( ${POSTFIX} -c "$g_target_root$_POSTFIX_CONFIG" set-permissions >> $_migration_log_file 2>>$_migration_log_file );

	######################
	# config settings
	######################

	&log_message( "-------------------------------------------------------------" );
	&log_message( "Migrate POP/IMAP Service Settings and Data" );

	# migrate dovecot config settings
	migrate_dovecot_config();
	
	# update config paths
	update_dovecot_config_paths();
	
	# migrate dovecot mail data
	migrate_dovecot_data();
	
	# creat fts indexes
	create_fts_indexes();
	
	if ( $g_os_ver_10_6_x ) {
		# setup gssapi hostname if enabled
		my $imap_gssapi_auth =  qx( $_server_admin settings mail:imap:imap_auth_gssapi );
		chomp($imap_gssapi_auth);
		
		my $pop3_gssapi_auth =  qx( $_server_admin settings mail:imap:pop_auth_gssapi );
		chomp($pop3_gssapi_auth);
		if ( ($pop3_gssapi_auth eq "mail:imap:pop_auth_gssapi = yes") || ($imap_gssapi_auth eq "mail:imap:imap_auth_gssapi = yes")) {
			system( "$_server_admin settings mail:imap:imap_auth_gssapi = yes" );
		}
	}

	# set notification service
	if ( path_exists( "$g_source_root/private/etc/dovecot/dovecot.conf" ) ) {
		my $aps_topic = `grep "^aps_topic " "$g_source_root/private/etc/dovecot/dovecot.conf"`;
		chomp( $aps_topic );
		&log_message( "Mail notification services aps topic: $aps_topic" );
		if ( $aps_topic ne "" ) {
			system( "$_server_admin settings mail:imap:notification_server_enabled = yes >> $_migration_log_file" );
		} else {
			system( "$_server_admin settings mail:imap:notification_server_enabled = no >> $_migration_log_file" );
		}
	} else {
		&log_message( "Mail notification services not migrated.  Missing: $g_source_root/private/etc/dovecot/dovecot.conf" );
	}

	# remove mailman cron job
	&log_message( "mailman cron cleanup..." );
	system( "/usr/bin/crontab -u mailman -l >> $_migration_log_file" );
	system( "/usr/bin/crontab -u mailman /dev/null >> $_migration_log_file" );
	&log_message( "mailman cron cleanup complete" );

	############################
	# migrate log level settings
	############################

	&log_message( "-------------------------------------------------------------" );
	&log_message( "Migrate SSL Certificate Settings" );

	set_ssl_certs();

	############################
	# migrate log level settings
	############################

	&log_message( "-------------------------------------------------------------" );
	&log_message( "Migrate Log Level" );

	# migrate log level settings if later than 10.8
	#	otherwise set to default "info" setting
	set_log_defaults();

	######################
	# enable settings
	######################

	&log_message( "-------------------------------------------------------------" );
	&log_message( "Enabling Service Settings" );

	# set junk mail filtering if enabled
	if ( $g_enable_spam == 1 ) {
		system( "$_server_admin settings mail:postfix:smtp_uce_controlls = 1 >> $_migration_log_file" );
		system( "$_server_admin settings mail:postfix:spam_scan_enabled = yes >> $_migration_log_file" );
	}

	# set virus scanning if enabled
	if ( $g_enable_virus == 1 ) {
		system( "$_server_admin settings mail:postfix:virus_scan_enabled = yes >> $_migration_log_file" );
	}

	# set SMTP enabled
	system( "$_server_admin settings mail:postfix:enable_smtp = yes >> $_migration_log_file" );

	# set auto-auth
	system( "$_server_admin settings mail:global:auto_auth = yes >> $_migration_log_file" );

	# set postfix owner & group
	system( "${POSTCONF} -c $g_target_root$_POSTFIX_CONFIG -e mail_owner=_postfix >> $_migration_log_file" );
	system( "${POSTCONF} -c $g_target_root$_POSTFIX_CONFIG -e setgid_group=_postdrop >> $_migration_log_file" );

	# reset host & domain names for all mail services
	my $host_name = `${POSTCONF} -h -c "$g_target_root$_POSTFIX_CONFIG" myhostname`;
	chomp($host_name);
	system( "$_server_admin settings mail:postfix:myhostname = $host_name >> $_migration_log_file" );

	my $domain_name = `${POSTCONF} -h -c "$g_target_root$_POSTFIX_CONFIG" mydomain`;
	chomp($domain_name);
	system( "$_server_admin settings mail:postfix:mydomain = $domain_name >> $_migration_log_file" );

	######################
	# clean up
	######################

	# clean up default plist
	my $_config_plist = "$g_target_root$_CONFIG_ROOT/MailServicesOther.plist";

	my $_config_dict = NSMutableDictionary->dictionaryWithContentsOfFile_( $_config_plist );
	if ( $_config_dict && $$_config_dict ) {
		# remove cluster dict
		my $_cluster_dict = $_config_dict->objectForKey_( "cluster" );
		if ( $_cluster_dict && $$_cluster_dict ) {
			if ( $_cluster_dict->isKindOfClass_( NSDictionary->class ) ) {
				$_config_dict->removeObjectForKey_( "cluster" );
			}
		}

		# remove cyrus dict
		my $_cyrus_dict = $_config_dict->objectForKey_( "cyrus" );
		if ( $_cyrus_dict && $$_cyrus_dict) {
			if ( $_cyrus_dict->isKindOfClass_( NSDictionary->class ) ) {
				$_config_dict->removeObjectForKey_( "cyrus" );
			}
		}

		# remove mailman dict
		my $_mailman_dict = $_config_dict->objectForKey_( "mailman" );
		if ( $_mailman_dict && $$_mailman_dict) {
			if ( $_mailman_dict->isKindOfClass_( NSDictionary->class ) ) {
				$_config_dict->removeObjectForKey_( "mailman" );
			}
		}

		# tag with service initalized
		$_config_dict->setObject_forKey_( (NSNumber->numberWithBool_(1)), "service_initialized" );

		# save changes
		$_config_dict->writeToFile_atomically_( $_config_plist, 1 );
	}

	if ( ($g_purge == 1) && !("$g_target_root" eq "${g_source_root}") ) {
		&log_message( "-------------------------------------------------------------" );
		&log_message( "Cleaning Up ..." );

		do_cleanup( "${g_source_root}/private/var/spool/postfix" );
		do_cleanup( "${g_source_root}/private/etc/postfix" );
		do_cleanup( "${g_source_root}/private/var/amavis" );
		do_cleanup( "${g_source_root}/private/etc/MailServicesOther.plist" );
		do_cleanup( "${g_source_root}/private/etc/amavisd.conf" );
	}

	# cleanup symlink
	if ( path_exists($_MAIL_ROOT . ".um.tmp") && (-l $_MAIL_ROOT) ){
		unlink( $_MAIL_ROOT );
		move( $_MAIL_ROOT . ".um.tmp", $_MAIL_ROOT );
	}

	my $end_time = localtime();
	&log_message( "-------------------------------------------------------------" );
	&log_message( "Mail Migration Complete: $end_time" );
	&log_message( "-------------------------------------------------------------" );
} # do_migration
