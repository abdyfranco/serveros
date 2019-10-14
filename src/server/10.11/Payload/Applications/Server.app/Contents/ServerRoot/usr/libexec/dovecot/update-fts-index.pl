#!/usr/bin/perl -Tw

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

# Update users' fts search indexes (fts plugin for dovecot).

use strict;
use Getopt::Long;
use IPC::Open3;
use Sys::Syslog qw(:standard :macros);
use Errno;

sub usage
{
	die <<EOT;
Usage: $0 [options] username ...
   or: $0 [options] --queued
Options:
	--mailbox name		update only this mailbox, not all mailboxes;
				multiple --mailbox arguments allowed
	--quiet
	--syslog		log to syslog not stdout/stderr
	--verbose
EOT
}

my %opts;
GetOptions(\%opts,
    'mailbox=s@',
    'queued',
    'quiet',
    'syslog',
    'verbose',
) || usage();

if ((@ARGV == 0 && !defined($opts{queued})) ||
    (@ARGV > 0 && defined($opts{queued}))) {
	usage();
}

if ($opts{syslog}) {
	my $ident = $0;
	$ident =~ s,.*/,,;
	openlog($ident, "pid", "dovecot") or die("openlog: $!\n");
}

if ($> != 0) {
	myfatal("must run as root");
}

my $queue_dir = "/private/var/db/dovecot.fts.update";

$ENV{PATH} = "/usr/bin:/bin:/usr/sbin:/sbin:/Applications/Server.app/Contents/ServerRoot/usr/bin:/Applications/Server.app/Contents/ServerRoot/usr/sbin";
delete $ENV{CDPATH};

# if fts is disabled, don't bother doing anything
my $conf = `/Applications/Server.app/Contents/ServerRoot/usr/bin/doveconf -h mail_plugins`;
chomp $conf;
my $noop = 0;
unless (grep { $_ eq "fts" } split(/\s+/, $conf)) {
	myinfo("Full-text search capability disabled; not doing anything.")
		if $opts{verbose};

	# Need to remove the queue files if applicable, which involves
	# untainting and sanity-checking the file names.
	$noop = 1;
}

my $ok = 1;
if (defined($opts{queued})) {
	# apply hysteresis:  allow a few queuefiles to accumulate so launchd
	# doesn't run us too-too often
	sleep(10);

	opendir(DIR, $queue_dir) or myfatal("$queue_dir: $!");
	my @entries = readdir(DIR);
	closedir(DIR);

	# slurp and unescape the list of files in the directory
	my %work;
	for (@entries) {
		next if $_ eq "." or $_ eq "..";

		# untaint: fts creates files with only alpha, num, %, and .
		# we rename files to .files during processing
		if (!/^(\.?([a-zA-Z0-9%]+)\.([a-zA-Z0-9%]+))$/) {
			mywarn("$queue_dir/$_: malformed or unsafe name");
			next;
		}
		my $name = $1;
		my $user = $2;
		my $mailbox = $3;

		next unless defined $user and defined $mailbox;
		$user =~ s/%([a-fA-F0-9]{2})/chr(hex($1))/ge;
		$mailbox =~ s/%([a-fA-F0-9]{2})/chr(hex($1))/ge;

		push @{$work{$user}->{mailboxes}}, $mailbox;
		$work{$user}->{queuefiles}->{$mailbox} = $name;
		$work{$user}->{order} = rand;
	}

	# process the users in random order so nobody gets preference
	my @order = sort { $work{$a}->{order} <=> $work{$b}->{order} }
			 keys %work;
	for my $user (@order) {
		if ($noop ||
		    update_fts_with_retries($user, \&preserve_queuefile_for,
					    \&delete_queuefile_for,
					    $work{$user},
					    @{$work{$user}->{mailboxes}}) <= 0) {
			$ok = 0;

			# delete all queuefiles on error or FTS disabled
			for (keys %{$work{$user}->{queuefiles}}) {
				my $queuefile = $work{$user}->{queuefiles}->{$_};
				if (!unlink("$queue_dir/$queuefile")) {
					mywarn("$queue_dir/$queuefile: $!")
					    unless $!{ENOENT};
				}
			}
		}
	}
}

if ($noop) {
	exit 0;
}

if (!defined($opts{queued})) {
	for (@ARGV) {
		my @mailboxes;
		if (defined($opts{mailbox})) {
			@mailboxes = @{$opts{mailbox}};
		} else {
			@mailboxes = ();
		}

		# untaint all usernames on command line
		/(.+)/;
		my $user = $1;

		if (update_fts($user, undef, undef, undef, @mailboxes) <= 0) {
			$ok = 0;
		}
	}
}

if (!$opts{quiet}) {
	my $disp = $ok ? "Done" : "Failed";
	myinfo($disp);
}
exit !$ok;

sub update_fts_with_retries
{
	my @args = @_;

	for (my $tries = 3; --$tries >= 0; ) {
		my $r = update_fts(@args);
		return $r if $r >= 0;

		if ($tries > 0) {
			# maybe dovecot isn't running yet (during boot)
			myinfo("Will retry in a minute");
			sleep(60);
		} else {
			myinfo("Giving up");
		}
	}

	return 0;
}

sub update_fts
{
	my $user = shift;
	my $preupdate_func = shift;
	my $postupdate_func = shift;
	my $func_context = shift;
	my @mailboxes = @_;

	if (!$opts{quiet}) {
		myinfo("Updating search indexes for user $user");
	}

	if (@mailboxes == 0) {
		my @list;
		return 0 unless doveadm(\@list, "mailbox", "list", "-u", $user);
		return 0 unless @list;
		for (@list) {
			# untaint
			push @mailboxes, $1 if /(.+)/;
		}
	}

	# rebuild index in each mailbox
	my $ok = 1;
	for my $boxi (0..$#mailboxes) {
		if (!$opts{quiet}) {
			myinfo("Updating search index for user $user" .
				" mailbox " . ($boxi + 1) .
				" of " . scalar(@mailboxes));
		}
		my $mailbox = $mailboxes[$boxi];

		&$preupdate_func($func_context, $mailbox)
		    if defined $preupdate_func;

		# I like the idea of adding -q here to perform the indexing in
		# the indexer-workers -- which can run in parallel up to a
		# configurable limit -- but that's asynchronous and we have to
		# wait until the indexing is done before compacting/optimizing.
		# So, no -q.
		$ok = 0 unless doveadm(undef, "index", "-u", $user, $mailbox);

		&$postupdate_func($func_context, $mailbox)
		    if defined $postupdate_func;
	}

	if (!$opts{quiet}) {
		myinfo("Compacting search indexes for user $user");
	}

	# optimize applies to all mailboxes for some reason
	$ok = 0 unless doveadm(undef, "fts", "optimize", "-u", $user);

	return $ok;
}

sub doveadm
{
	my $outref = shift;
	my @args = @_;

	my $doveadm = "/Applications/Server.app/Contents/ServerRoot/usr/bin/doveadm";
	unshift @args, "-v" if $opts{verbose};
	unshift @args, $doveadm;
	print "> " . join(" ", @args) . "\n" if $opts{verbose};
	my $pid = open3(\*TO_DOVEADM, \*FROM_DOVEADM, \*FROM_DOVEADM, @args);
	if (!defined($pid)) {
		mywarn("'" . join(" ", @args) . "' failed: $!");
		return 0;
	}
	close(TO_DOVEADM);
	my @errs;
	while (my $line = <FROM_DOVEADM>) {
		chomp $line;
		print "< $line\n" if $opts{verbose};
		if ($line =~ /(Debug|Info|Warning|Error|Fatal|Panic):/) {
			push @errs, $line;
		} elsif (defined($outref)) {
			push @$outref, $line;
		}
	}
	close(FROM_DOVEADM);
	waitpid($pid, 0);
	my $status = $?;
	if ($status != 0) {
		for (@errs) {
			chomp;
			mywarn("$doveadm: $_");
		}
		mywarn("'" . join(" ", @args) . "' failed: $status");
		return 0;
	}
	return 1;
}

# rename queuefile to .queuefile before updating a mailbox's index so that:
# - if the system reboots in the middle we will resume
# - if another update request comes in during indexing (queuefile is recreated)
#   we will be run again
sub preserve_queuefile_for
{
	my $userref = shift;
	my $mailbox = shift;

	my $queuefile = $userref->{queuefiles}->{$mailbox};
	if (defined($queuefile) && $queuefile !~ /^\./ &&
	    !rename("$queue_dir/$queuefile", "$queue_dir/.$queuefile")) {
		# maybe another process got it first
		mywarn("rename $queue_dir/$queuefile -> $queue_dir/.$queuefile: $!")
		    unless $!{ENOENT};
	}
}
			
# delete .queuefile after updating a mailbox's index
sub delete_queuefile_for
{
	my $userref = shift;
	my $mailbox = shift;

	my $queuefile = $userref->{queuefiles}->{$mailbox};
	$queuefile = ".$queuefile" unless $queuefile =~ /^\./;
	if (defined($queuefile) && !unlink("$queue_dir/$queuefile")) {
		# maybe another process got it first
		mywarn("$queue_dir/$queuefile: $!") unless $!{ENOENT};
	}
}

sub myfatal
{
	my $msg = shift;

	if ($opts{syslog}) {
		syslog(LOG_ERR, $msg);
	}
	die("$msg\n");
}

sub mywarn
{
	my $msg = shift;

	if ($opts{syslog}) {
		syslog(LOG_WARNING, $msg);
	} else {
		warn(scalar(localtime) . ": $msg\n");
	}
}

sub myinfo
{
	my $msg = shift;

	if ($opts{syslog}) {
		syslog(LOG_INFO, $msg);
	} else {
		print scalar(localtime) . ": $msg\n";
	}
}
