#!/usr/bin/perl
#
# Copyright (c) 2011-2014 Apple Inc. All Rights Reserved.
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

## Script for mail certificate management

##################   Input Parameters  #######################
# certHandler passed up to 5 args
#	$1 - command  { "remove" | "replace" }
#	$2 - cert_path
#	$3 - cert_ref or 0x00
#	$4 - new_cert_path
#	$5 - new_cert_ref or 0x00
# 
# is this a cert I'm interested in?
# no - return 0 (don't care)
# yes - 
#	if command == remove
#		complain to the HI
#		return 1 (don't remove)
#	if command == replace
#		replace the old cert with the new one in the config
#		restart the service if needed
#		return 0 (all good)
#	if there is an error return 2
#
# Examples:
#   1) mail_cert_handler.pl remove /etc/certificates/my.host.net.8A7E928331B8BF5D8334B7757699885D45EA55BE.cert.pem 0x00
#   2) mail_cert_handler.pl replace /etc/certificates/my.host.net.8A7E928331B8BF5D8334B7757699885D45EA55BE.cert.pem 0x00 my.new.cert.net.8A7E928331B8BF5D8334B7757699885D45EA55BE.cert.pem 0x00

############################# System  Constants #############################
my $POSTFIX			= "/usr/sbin/postfix";
my $LAUNCHCTL		= "/bin/launchctl";
my $SERVER_ADMIN	= "/Applications/Server.app/Contents/ServerRoot/usr/sbin/serveradmin";
my $CERT_ADMIN		= "/Applications/Server.app/Contents/ServerRoot/usr/sbin/certadmin";

########################### Server Admin Commands ###########################
my $SMD_CMD			= "mail:command = writeSettings\nmail:skipReadSettings = yes";

my $SMD_IMAP_CERT	= "\nmail:configuration:imap:tls_cert_file = ";
my $SMD_IMAP_KEY	= "\nmail:configuration:imap:tls_key_file = ";
my $SMD_IMAP_CHAIN	= "\nmail:configuration:imap:tls_ca_file = ";

my $SMD_SMTP_CERT	= "\nmail:configuration:postfix:smtp_tls_cert_file = ";
my $SMD_SMTPD_CERT	= "\nmail:configuration:postfix:smtpd_tls_cert_file = ";
my $SMD_SMTP_KEY	= "\nmail:configuration:postfix:smtp_tls_key_file = ";
my $SMD_SMTPD_KEY	= "\nmail:configuration:postfix:smtpd_tls_key_file = ";
my $SMD_SMTP_CHAIN	= "\nmail:configuration:postfix:smtp_tls_CAfile = ";
my $SMD_SMTPD_CHAIN	= "\nmail:configuration:postfix:smtpd_tls_CAfile = ";

################################## Globals ##################################
my $g_command		= "";  #remove or replace
my $g_cert_path		= "";
my $g_new_cert_path	= "";
my $g_cur_imap_cert	= "";
my $g_cur_smtp_cert	= "";
my $g_set_default	= 0;  # set to 1 if setting default certificates

################################### Flags ###################################
my $_VERBOSE		= 0;

#############################################################################
# main
#############################################################################

use Foundation;
use File::Copy;
use File::Basename;
use File::Temp;
use Sys::Syslog qw( :DEFAULT setlogsock );

my $result = 0;

# open syslog
openlog('mail_cert_handler', 'ndelay,pid', 'syslog');

parse_options();
if ( $g_command eq "remove" ) {
	$result = do_remove();
} else {
	$result = do_replace();
}

print_verbose( "return value: $result" );

closelog;

exit( $result );


################################################################################
# verify_imap_cert()

sub verify_imap_cert
{
	print_verbose( "verify_imap_cert:" );

	# get imap tls_cert_file from serveradmin
	#	result ~= mail:imap:tls_cert_file = "/etc/certificates/host.cert.pem"
	(my $key_value) = `$SERVER_ADMIN settings mail:imap:tls_cert_file`;
	chomp( $key_value );

	# get just the cert name from the serveradmin response
	my ($value) = $key_value =~ /=\s*(?:"((?:[^"]|"")*)"|([^,"]*))\s*,?/;
	$g_cur_imap_cert = $value;

	print_verbose( "   - current tls_cert_file: $value" );

	# return 1 if we are using it
	if ( $value eq $g_cert_path ) {
		print_verbose( "   - certificate is used by IMAP service" );
		return( 1 );
	}

	# not used
	print_verbose( "   - certificate not used by IMAP service" );

	return( 0 );
} # verify_imap_cert

################################################################################
# verify_smtp_cert()

sub verify_smtp_cert
{
	print_verbose( "verify_smtp_cert:" );

	# check postfix smtpd_tls_cert_file
	(my $key_value) = `$SERVER_ADMIN settings mail:postfix:smtpd_tls_cert_file`;
	chomp( $key_value );

	my ($value) = $key_value =~ /=\s*(?:"((?:[^"]|"")*)"|([^,"]*))\s*,?/;
	$g_cur_smtp_cert = $value;

	print_verbose( "   - current smtpd_tls_cert_file: $value" );

	# return 1 if we are using it
	if ( $value eq $g_cert_path ) {
		print_verbose( "   - certificate is used by SMTP service" );
		return( 1 );
	}

	# not used
	print_verbose( "   - certificate not used by SMTP service" );

	return( 0 );
} # verify_smtp_cert

################################################################################
# do_remove()
#
#	remove now sets to default certificate

sub do_remove
{
	my $result = 0;

	print_verbose( "do_remove:" );

	# get & verify default certifcates
	(my $def_cert) = `$CERT_ADMIN --default-certificate-path`;
	chomp( $def_cert );
	if ( !path_exists( $def_cert ) ) {
		syslog('err', 'cannot update mail certificates, default certificate: %s does not exist.', $def_cert );
		return( 2 );
	}

	print_verbose( "  - defautl cert: $def_cert" );

	# ----------------------------
	# IMAP
	# get current IMAP certificate
	my ($key_value) = `$SERVER_ADMIN settings mail:imap:tls_cert_file`;
	chomp( $key_value );
	my ($imap_cert) = $key_value =~ /=\s*(?:"((?:[^"]|"")*)"|([^,"]*))\s*,?/;

	# ----------------------------
	# SMTP
	# get current SMTP certificate
	$key_value = `$SERVER_ADMIN settings mail:postfix:smtpd_tls_cert_file`;
	chomp( $key_value );
	my ($smtp_cert) = $key_value =~ /=\s*(?:"((?:[^"]|"")*)"|([^,"]*))\s*,?/;

	# if we are removing current cert, set to default
	if ( ($imap_cert eq $g_cert_path) || ($smtp_cert eq $g_cert_path) ) {
		$g_set_default = 1;
		$g_new_cert_path = $def_cert;
		$result = do_replace();
	} else {
		syslog('notice', 'Mail SSL certificates do not need to be update' );
	}

	return( $result );
} # do_remove

################################################################################
# do_replace()

sub do_replace
{
	print_verbose( "do_replace" );

	# first parse the certificate and verify that the key and chain files exist
	my ($sub_path) = substr( $g_new_cert_path, 0, length($g_new_cert_path)-9);

	print_verbose( " - old: $g_cert_path" );
	print_verbose( " - new: $g_new_cert_path" );

	# verify key file
	my ($key_file) = "";
	if ( $g_set_default == 1 ) {
		$key_file = `$CERT_ADMIN --default-private-key-path`;
		chomp($key_file);
	} else {
		$key_file = "$sub_path" . ".key.pem";
	}

	if ( !path_exists( $key_file ) ) {
		syslog('err', 'cannot replace mail certificates: %s does not exist', $key_file );
		print_verbose( "Error: do_replace: $key_file does not exist" );

		return( 2 );
	}

	# verify chain file
	my ($chain_file) = "";
	if ( $g_set_default == 1 ) {
		$chain_file = `$CERT_ADMIN --default-certificate-authority-chain-path`;
		chomp($chain_file);
	} else {
		$chain_file = "$sub_path" . ".chain.pem";
	}
	if ( !path_exists( $chain_file ) ) {
		syslog('err', 'cannot replace mail certificates: %s does not exist', $chain_file );
		print_verbose( "Error: do_replace: $chain_file does not exist" );

		return( 2 );
	}

	# ----------------------------
	# IMAP
	# check if IMAP server is using the old certificate
	if ( verify_imap_cert() ) {
		syslog('notice', 'replacing IMAP server certificate: %s with: %s', $g_cert_path, $g_new_cert_path );

		print_verbose( " - replacing IMAP certs:" );
		print_verbose( "   - setting tls_cert_file:" . $g_new_cert_path );
		print_verbose( "   - setting tls_key_file:" . $key_file );
		print_verbose( "   - setting tls_ca_file:" . $chain_file );

		# create temp file for serveradmin command
		my $file_handle = File::Temp->new(UNLINK => 0);
		my $file_name = ${file_handle}->filename;

		# setup serveradmin command
		my $command = ${SMD_CMD} . ${SMD_IMAP_CERT} . ${g_new_cert_path} . ${SMD_IMAP_KEY} . ${key_file} . ${SMD_IMAP_CHAIN} . ${chain_file} . "\n";

		# write command to temp file
		print ${file_handle} ${command};

		# execute command
		`${SERVER_ADMIN} command < ${file_name}`;

		# file cleanup
		close( $file_name );
		unlink( $file_name ); 
	} else {
		syslog('notice', 'IMAP SSL certificate: %s does not need to be update', $g_cur_imap_cert );
	}

	# ----------------------------
	# SMTP
	# check if SMTP server is using the old certificate
	if ( verify_smtp_cert() ) {
		syslog('notice', 'replacing SMTP server certificate: %s with: %s', $g_cert_path, $g_new_cert_path );

		print_verbose( " - replacing SMTP certs:" );
		print_verbose( "   - setting smtpd_tls_cert_file:" . $g_new_cert_path );
		print_verbose( "   - setting smtpd_tls_key_file:" . $key_file );
		print_verbose( "   - setting smtpd_tls_CAfile:" . $chain_file );

		# create temp file for serveradmin command
		my $file_handle = File::Temp->new(UNLINK => 0);
		my $file_name = ${file_handle}->filename;

		# setup serveradmin command
		my $command = ${SMD_CMD} . ${SMD_SMTPD_CERT} . ${g_new_cert_path} . ${SMD_SMTP_CERT} . ${g_new_cert_path} . ${SMD_SMTPD_KEY} . ${key_file} . ${SMD_SMTP_KEY} . ${key_file} . ${SMD_SMTPD_CHAIN} . ${chain_file} . ${SMD_SMTP_CHAIN} . ${chain_file} . "\n";

		# write command to temp file
		print ${file_handle} ${command};

		# execute command
		`${SERVER_ADMIN} command < ${file_name}`;

		# file cleanup
		close( $file_name );
		unlink( $file_name ); 
	} else {
		syslog('notice', 'SMTP SSL certificate: %s does not need to be update', $g_cur_smtp_cert );
	}

	return( 0 );
} # do_replace

################################################################################
# check if a path exists

sub print_verbose ($)
{
	my ($in_str) = @_;

	if ( $_VERBOSE ) {
		print "$in_str\n";
	}
} # print_verbose

################################################################################
# parse_options()

sub parse_options
{
	my $arg;
	$g_command = $ARGV[0];
	$g_cert_path = $ARGV[1];
	$g_new_cert_path = $ARGV[3];

	if ( $g_command eq "" ) {
		syslog('err', 'missing certificate command' );
		exit(2);
	}

	if ( $g_cert_path eq "" ) {
		syslog('err', 'missing certificate arguments to: "%s" command', $g_command );
		exit(2);
	}

	if ( ($g_command eq "replace") && ($g_new_cert_path eq "") ) {
		syslog('err', 'missing new certificate argument to: "replace" command' );
		exit(2);
	}

	if ( $g_command eq "remove" ) {
		syslog('notice', 'command: "%s" certificate: %s', $g_command, $g_cert_path ); }

	if ( $g_command eq "replace" ) {
		syslog('notice', 'command: "%s" certificate: %s with: %s', $g_command, $g_cert_path, $g_new_cert_path ); }
} # parse_options

################################################################################
# check if a path exists

sub path_exists ($)
{
	my $exists = 0;
	my ($in_path) = @_;

	if (-e "$in_path") {
		$exists = 1;
	}

	return( $exists );
} # path_exists
