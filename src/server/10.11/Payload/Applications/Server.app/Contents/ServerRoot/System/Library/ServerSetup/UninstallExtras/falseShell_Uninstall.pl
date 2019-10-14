#!/usr/bin/perl

# Copyright (c) 2013-2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
#

use warnings;
use File::Slurp;

$COMMENT="# /bin/false was added for FTP users that do not have a home directory.";
$FALSE_SHELL="/usr/bin/false";
$SHELLS="/private/etc/shells";

$hasComment=0;
$hasShell=0;
$changed=0;

@all_lines = read_file($SHELLS); # one line per element

foreach my $x (@all_lines) {
	if ($x =~ $COMMENT) {
		$hasComment=1;
	}
	if ($x =~ $FALSE_SHELL) {
		$hasShell=1;
	}
}

## Only remove the entry if we find the comment that we placed when
##	adding the shell. If the comment is absent then we did not add it,
##	and should not remove it.
if (($hasComment == 1)) {
	foreach my $x (@all_lines) {
		if ($x =~ $FALSE_SHELL) {
			next;
		}
		if ($x =~ $COMMENT) {
			next;
		}
		push(@newShellArray, $x);
	}
	$changed++;
}

if ($changed) {
	open FILE, "+> $SHELLS" or die "Can not open $SHELLS file for output!\n";
	while( @newShellArray) {
	    $tmp = shift( @newShellArray);
		chomp($tmp);
	    print FILE ( $tmp . "\n");  # adding a CR/LF character to maintain file format
	}
	close FILE;
}