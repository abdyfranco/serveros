#!/usr/bin/perl

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
	if ($x =~ $FALSE_SHELL) {
		$hasShell=1;
	}
}

if ($hasShell == 0) {
	foreach my $x (@all_lines) {
		if ($x =~ $COMMENT) {
			$hasComment=1;
		}
		if ($x =~ "^#") {
			$LastCommentIndex++;
			push(@tCommentsArray, $x);
		}

		if (($x =~ "^#") || (length($x) <= 4)) {
			next;
		} else {
			push(@ShellsArray, $x);
		}
	}
	push(@tCommentsArray, "");
	push(@ShellsArray, $FALSE_SHELL);

	if (($hasComment == 0)) {
		$LastCommentIndex=0;
		foreach my $x (@tCommentsArray) {
			if ($x =~ "^#") {
				$LastCommentIndex++;
				push(@CommentsArray, $x);
			}
		}
		$tStr=$COMMENT . "\n";
		push(@CommentsArray, $tStr);
		push(@CommentsArray, "");
		$LastCommentIndex+=2;
		$changed++;
	}
	$changed++;
}

@Merged = (@CommentsArray, @ShellsArray);

if ($changed) {
	open FILE, "+> $SHELLS" or die "Can not open $SHELLS file for output!\n";
	while( @Merged) {
	    $tmp = shift( @Merged);
		chomp($tmp);
	    print FILE ( $tmp . "\n");  # adding a CR/LF character to maintain file format
	}
	close FILE;
}