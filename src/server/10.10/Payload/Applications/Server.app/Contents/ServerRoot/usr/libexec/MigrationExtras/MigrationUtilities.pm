#!/usr/bin/perl

# Copyright (c) 2013-2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#

package MigrationUtilities;
use Carp;

$MINVER="10.6"; # => 10.6
$MAXVER="10.10"; # <  10.10
$DEBUG="0";
$FUNC_LOG="0";

sub new {
  my ($package) = @_;
  my %hash;
  %hash = (PATH => "Hello, world\n");
  bless \%hash => $package;
}

################################################################################
##Create the parent directory for the item passed!
sub createParentDirForItem() 
{
    if (${FUNC_LOG}) { print("createParentDirForItem : S\n"); }
	my $exists = 0;
	my ($self, $tPath) = @_; chomp($tPath);
	$parentDir=qx(/usr/bin/dirname "${tPath}"); chomp($parentDir);
   	if (${DEBUG}) {printf("parentDir := %s\n", "${parentDir}");}
	$ret=qx(/bin/mkdir -p $parentDir);
	if (-e "${parentDir}") {
		$exists = 1;
	}
    if (${FUNC_LOG}) { print("createParentDirForItem : E\n"); }
	return($exists);
}

################################################################################
sub dumpAssociativeArray()
{
    if (${FUNC_LOG}) { print("dumpAssociativeArray : S\n"); }
	my ($self, %BigList) = @_;
	while(($theKey, $theVal) = each (%BigList))
		{ print "$theKey is the key for value $theVal\n"; }
    if (${FUNC_LOG}) { print("dumpAssociativeArray : E\n"); }
}

################################################################################
##We only want to run this script if the previous system version is greater than or equal to 10.6 and less than 10.8!
sub isValidVersion()
{
    if (${FUNC_LOG}) { print("isValidVersion : S\n"); }
	my $valid=0;
	my ($self, $gSourceVersion) = @_;
    
    ($src_MAJOR,       $src_MINOR,    $src_UPDATE)=$self->serverVersionParts($gSourceVersion);
    ($minVer_MAJOR, $minVer_MINOR, $minVer_UPDATE)=$self->serverVersionParts($MINVER);
    ($maxVer_MAJOR, $maxVer_MINOR, $maxVer_UPDATE)=$self->serverVersionParts($MAXVER);
    
    if( ( ($src_MAJOR >= $minVer_MAJOR) && ($src_MINOR >= $minVer_MINOR) ) &&
        ( ($src_MAJOR <= $maxVer_MAJOR) && ($src_MINOR < $maxVer_MAJOR) ) ) {
            $valid = 1;
        }
	if (${DEBUG}) {
		printf("Is %s >= %s && %s < %s\n", $gSourceVersion, $MINVER, $gSourceVersion, $MAXVER);
		if($valid) { printf("Version supplied was valid := %s\n", $gSourceVersion);}
		else { printf("Version supplied was not valid := %s\n", $gSourceVersion); }
	}
    if (${FUNC_LOG}) { print("isValidVersion : E\n"); }
	return(${valid});
}

################################################################################
##Make sure the language suppled is one we care about!
sub isValidLanguage() 
{
    if (${FUNC_LOG}) { print("isValidLanguage : S\n"); }
	my $valid=0;
	my ($self, $tLang) = @_;
	if (${DEBUG}) { printf("Language supplied := %s\n", $tLang); }
	if ((${tLang} eq "en") || (${tLang} eq "fr") || (${tLang} eq "de") || (${tLang} eq "ja")) {
		$valid = 1;
    	if (${DEBUG}) {printf("valid\n");}
	}
    if (${FUNC_LOG}) { print("isValidLanguage : E\n"); }
	return(${valid});
}

################################################################################
##Check a path's parent exists!
sub itemParentExists() 
{
    if (${FUNC_LOG}) { print("itemParentExists : S\n"); }
	my $exists = 0;
	my ($self, $tPath) = @_;
	$parentExists=qx(/usr/bin/dirname "${tPath}");
   	if (${DEBUG}) {printf("path := %s\n", "${tPath}");}
	if (-e "${tPath}") {
		$exists = 1;
    	if (${DEBUG}) {printf("exists\n");}
	}
    if (${FUNC_LOG}) { print("itemParentExists : E\n"); }
	return($exists);
}

################################################################################
##Check a path's existence!
sub pathExists() 
{
	my ($self, $path) = @_;
	croak("missing argument to pathExists") unless defined $path;
	$self->{PATH} = $path;
	if (${FUNC_LOG}) { print("pathExists : S\n"); }
	my $exists = 0;
	if (${DEBUG}) {printf("path := %s\n", $path);}
	if (-e "${path}") {
		$exists = 1;
		if (${DEBUG}) {printf("exists\n");}
	} else {
		if (${DEBUG}) {printf("exists not\n");}
	}
    if (${FUNC_LOG}) { print("pathExists : E\n"); }
	return($exists);
}

################################################################################
#
# ParseOptions takes a list of possible options and a boolean indicating
# whether the option has a value following, and sets up an associative array
# %opt of the values of the options given on the command line. It removes all
# the arguments it uses from @ARGV and returns them in @optArgs.
#
sub ParseOptions {
    if (${FUNC_LOG}) { print("ParseOptions : S\n"); }
	my ($self, @optval) = @_;
	my @forLater=@optval;
    local ($opt, @opts, %valFollows, @newargs);

    while (@optval) {
		$opt = shift(@optval);
		push(@opts,$opt);
		$valFollows{$opt} = shift(@optval);
    }

    @optArgs = ();
    %opt = ();

    arg: while (defined($arg = shift(@forLater))) {
		foreach $opt (@opts) {
			if ($arg eq $opt) {
					push(@optArgs, $arg);
				if ($valFollows{$opt}) {
					$opt{$opt} = shift(@forLater);
					push(@optArgs, $opt{$opt});
				} else {
					$opt{$opt} = 1;
				}
				next arg;
			}
		}
		push(@newargs,$arg);
    }
    @NEW_ARGV = @newargs;
    if (${FUNC_LOG}) { print("ParseOptions : E\n"); }
	return(%opt);
}

################################################################################
# Get source system version parts
sub serverVersionParts()
{
	my ($self, $VERS) = @_;
	if (${FUNC_LOG}) { print("serverVersionParts : S\n"); }

	if (${DEBUG}) {printf("sourceVersion := %s\n", "${VERS}");}
	@SRV_VER_PARTS = split(/\./, $VERS); 
	if (${DEBUG}) {
		print(${SRV_VER_PARTS}[0] . "\n"); #Major
		print(${SRV_VER_PARTS}[1] . "\n"); #Minor
		if(length(${SRV_VER_PARTS}[2])) {
			print(${SRV_VER_PARTS}[2] . "\n"); #Update
		}
	}
	$SRV_MAJOR=${SRV_VER_PARTS}[0];
	$SRV_MINOR=${SRV_VER_PARTS}[1];
	$SRV_UPDATE=${SRV_VER_PARTS}[2];

	if (${FUNC_LOG}) { print("serverVersionParts : E\n"); }
	return($SRV_MAJOR, $SRV_MINOR, $SRV_UPDATE);
}

1;
