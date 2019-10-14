#!/usr/bin/perl

use Net::LDAP;
use Net::LDAP::Control::Paged;
use Net::LDAP::Constant qw( LDAP_CONTROL_PAGED );
use Net::LDAP::Entry;
use Convert::ASN1;
use Text::ParseWords;
use Authen::SASL;
use Expect;
$Expect::Log_Stdout = 0;
use Getopt::Std;


#Defaults
$casei = 0;

#Usage:
#
# changeDirData.pl -i -s serverIP -u diradmin -o old -n new -r rectypes
#


getopts("ivhs:u:o:n:r:");

if ($opt_h || ($opt_s eq "") || ($opt_u eq "") || ($opt_o eq "") || ($opt_n eq "")){
	&printUsage;
}

$serverIP = $opt_s;
$dadmin = $opt_u;
$old = $opt_o;
$new = $opt_n;


$diradpass = &getPasswd;


$baseDN = &getBaseDN;
$kerbRealm = &getKerbRealm;
$diradmin = "uid=".$dadmin.",cn=users,".$baseDN;

@argRecord = split(',',$opt_r);



if ((@argRecord[0] eq "all") || ($opt_r eq "") ){
	@argRecord = ("users", "groups", "people", "mounts", "computers", "augments", "autoserversetup", "computer_lists", "computer_groups", "computer_lists", "printers", "places", "locations", "maps", "presets_computers", "presets_computer_groups", "presets_users", "presets_groups", "presets_computer_lists" );
}



# ideally, we want to use kerberos for authentication.  Let's try to get a ticket with the credentials, but if we can't, we'll fall back to simple auth
if (&getKerbTicket == 1){
	
	foreach $rectype (@argRecord){
		&queryLDAP("kerb",$rectype);
	}
}else{
	foreach $rectype (@argRecord){
		&queryLDAP("simple",$rectype);
	}
}


sub queryLDAP {
	$authType = $_[0];
	$searchType = $_[1];
	
	print "processing $searchType\n";
	
	my $searchFilter = "";
	my $returnAttrs = [];
	
	if ($searchType eq "users"){
		$searchFilter = "(objectclass=apple-user)";
		$searchbaseDN = "cn=users,$baseDN";
	}elsif ($searchType eq "groups"){
		$searchFilter = "(objectclass=apple-group)";
		$searchbaseDN = "cn=groups,$baseDN";
	}elsif($searchType eq "mounts"){
		$searchFilter = "(objectclass=mount)";
		$searchbaseDN = "cn=mounts,$baseDN";
	}elsif($searchType eq "augments"){
		$searchFilter = "(objectclass=apple-augment)";
		$searchbaseDN = "cn=augments,$baseDN";
	}elsif($searchType eq "autoserversetup"){
		$searchFilter = "(objectclass=apple-serverassistant-config)";
		$searchbaseDN = "cn=autoserversetup,$baseDN";
	}elsif($searchType eq "computer_lists"){
		$searchFilter = "(objectclass=apple-computer-list)";
		$searchbaseDN = "cn=computer_lists,$baseDN";
	}elsif($searchType eq "computers"){
		$searchFilter = "(objectclass=apple-computer)";
		$searchbaseDN = "cn=computers,$baseDN";
	}elsif($searchType eq "locations"){
		$searchFilter = "(objectclass=apple-location)";
		$searchbaseDN = "cn=locations,$baseDN";
	}elsif($searchType eq "maps"){
		$searchFilter = "(objectclass=apple-resource)";
		$searchbaseDN = "cn=maps,$baseDN";
	}elsif($searchType eq "people"){
		$searchFilter = "(objectclass=inetOrgPerson)";
		$searchbaseDN = "cn=people,$baseDN";
	}elsif($searchType eq "computer_groups"){
		$searchFilter = "(objectclass=apple-group)";
		$searchbaseDN = "cn=computer_groups,$baseDN";
	}elsif($searchType eq "printers"){
		$searchFilter = "(objectclass=apple-printer)";
		$searchbaseDN = "cn=printers,$baseDN";
	}elsif($searchType eq "places"){
		$searchFilter = "(objectclass=apple-resource)";
		$searchbaseDN = "cn=places,$baseDN";
	}elsif($searchType eq "presets_computers"){
		$searchFilter = "(objectclass=apple-preset-computer)";
		$searchbaseDN = "cn=presets_computers,$baseDN";
	}elsif($searchType eq "presets_computer_groups"){
		$searchFilter = "(objectclass=apple-preset-computer-groups)";
		$searchbaseDN = "cn=presets_computer_groups,$baseDN";
	}elsif($searchType eq "presets_users"){
		$searchFilter = "(objectclass=apple-preset-user)";
		$searchbaseDN = "cn=presets_users,$baseDN";
	}elsif($searchType eq "presets_groups"){
		$searchFilter = "(objectclass=apple-preset-group)";
		$searchbaseDN = "cn=presets_groups,$baseDN";
	}elsif($searchType eq "presets_computer_lists"){
		$searchFilter = "(objectclass=apple-preset-computer-list)";
		$searchbaseDN = "cn=presets_computer_lists,$baseDN";
	}
	
	$page = Net::LDAP::Control::Paged->new( size => 1000 );
	if ($authType eq "kerb"){
		my $STARTTLS = 1;  # 0 for no, 1 for yes
		my $SASL_TYPE = 'GSSAPI';
		my $sasl;
		$sasl = Authen::SASL->new(mechanism=>'GSSAPI');
	
		eval {
			$ldap = Net::LDAP->new($serverIP, port=>389, version=>3) or die "Can't connect to LDAP server $serverIP";
		
			$bindresult = $ldap->bind(sasl => $sasl ) || die "Can't bind to LDAP server $serverIP";
		};
		if ($@) {
				print "Please check your server address and credentials, and try again.\n";
		}	
    }else{
		eval {
    	$ldap = Net::LDAP->new($serverIP, port=>389, version=>3) or die "Can't connect to LDAP server $serverIP";
		$bindresult = $ldap->bind( dn => $diradmin, password => $diradpass) || die "Can't bind to LDAP server $serverIP"; 
		};
		if ($@ || $bindresult->code ) {
			print "Please check your server address and credentials, and try again.\n";
		}
    }

	$result=$bindresult->error();
	if ($opt_v){
		print "bind result: $result\n";
	}	
	my $cookie;
	$total = 0;
 	while(1) {
		
		my $msg = $ldap->search(
			base=> $searchbaseDN,
			filter => $searchFilter,
			control  => [ $page ]
			);		
		
		$results = $msg->count();
		$total+= $results;
		
		if ($opt_v){
		print "$results $searchType fetched, $total $searchType found so far \n";
		}	
		
		&processResults($msg);
		# Only continue on LDAP_SUCCESS
		$msg->code and last;
		# Get cookie from paged control
		my ($resp)  = $msg->control( LDAP_CONTROL_PAGED ) or last;
		$cookie = $resp->cookie or last;
		# Set cookie in paged control
		$page->cookie($cookie);
	}		
	if ($cookie) {
			# We had an abnormal exit, so let the server know we do not want any more
			$page->cookie($cookie);
			$page->size(0);
			$ldap->search(			base=> $searchbaseDN,
									filter => $searchFilter,
									control  => [ $page ]
                  					 );
		}
	$ldap->unbind();
}

sub processResults{
	my $msg = $_[0];
	
	if ($msg->count() >0){		
		
		foreach $entry ($msg->all_entries()){
			foreach $attr ($entry->attributes()){
			
				@attrValue = $entry->get_value( $attr);
				
				if (($#attrValue + 1 > 1) && ($attr ne authAuthority)){
					#deal with multivalued attrs
					foreach $value (@attrValue){
						if (($value =~ m/$old/) || ($casei && $value =~ m/$old/i)) {
							$entry ->delete($attr => [$value]);
							if ($casei == 0){
								$value =~ s/$old/$new/;	
							}else{
								$value =~ s/$old/$new/i;
							}
							$entry ->add ($attr => [$value]);
						}
					}
				}else{
					if ($attr ne authAuthority){
						$attrValue = $entry->get_value( $attr);
						$oldValue = $attrValue;
						if ($casei == 0){
							$attrValue =~ s/$old/$new/;
						}else{
							$attrValue =~ s/$old/$new/i;
						}
					
						$mydn = $entry->dn();
						if (($attr eq "cn") && ($oldValue ne $attrValue)){
		
							$ldap->moddn(	$mydn,
											newrdn => "cn = ".$attrValue,
											deleteoldrdn => TRUE);	
							if ($casei == 0){
								$mydn =~ s/$old/$new/;
							}else{
								$mydn =~ s/$old/$new/i;
							}
						
							$entry->dn($mydn);
						}else{
							$entry->replace($attr => $attrValue);
						}	
					}
					}
				}
			$err = $entry->update($ldap);
			warn $err->error if $err->code != LDAP_SUCCESS;
			$res = $err->error();
			if ($opt_v){
				print "Updating record $mydn update status: $res\n";
			}	
		}
		
	}		
	

}

sub getKerbTicket{
	# suppress warnings about IO::Stty
	BEGIN { $SIG{'__WARN__'} = sub { warn $_[0] if $DOWARN } }
	my $exp = new Expect;
	
	my $command = "kinit $dadmin\@$kerbRealm\n";
	
	eval {
	$exp->spawn($command) or die "Cannot spawn $command: $!\n";
	$exp->expect(30, 'Please enter the password');
	$exp->send("$diradpass\n");
	$exp->interact();
	};
	if ($@) {
		print "expect failed";
	}
	#Re-enable warnings
	$DOWARN = 1;
	# let's see if we got one
	$klist = `klist`;
	if (($klist =~ /"$diradmin\@$kerbRealm"/) && ($klist =~ /"krbtgt\/$kerbRealm\@$kerbRealm"/)){
		return 1;
	}
	else{
		return 0;
	}



}

sub getKerbRealm{
	eval {
	$kRealm = `ldapsearch -h $serverIP -x -b "cn=config,$baseDN" "cn=KerberosKDC" | grep apple-config-realname | awk '{print \$2}'` || die;
	};
	if ($@) {
		print "\nCan't contact LDAP Server to get kerberos config info.  Please check your server IP address.\n";
		exit(-1);
	}
	chomp $kRealm;
	return $kRealm;
}

sub getBaseDN{
	# with SnowLeopard there are 2 search bases, need to pick the right one
	eval {
	$bDN= `ldapsearch -h $serverIP -x -b "cn=config" "olcDatabase={1}bdb" | grep olcSuffix | awk '{print \$2}'` || die;
	};
	if ($@) {
		print "\nCan't contact LDAP Server to get config info.  Please check your server IP address.\n";
		exit(-1);
	}
	chomp $bDN;
	return $bDN;
}

sub getPasswd{
	print "Remember: Before making bulk changes to your directory, it is recommended that you archive your Open Directory master as a backup.\n";
	print "Please enter the password of the directory admin you specified:";
	system("stty -echo");
	$| = 1;
	$_ = <STDIN>;
	chomp;
	system("stty echo");
	print "\n";
	return $_;
}

sub printUsage{
	print "Usage: changeDirData.pl -h\n";
	print "Usage: changeDirData.pl [-i] [-v] -s server -u diradmin -o oldValue -n newValue -r recordType1,recordType2\n";
	print "\t\t-h\tprints this usage message\n";
	print "\t\t-i\tdoes a case-insensitive find/replace\n";
	print "\t\t-v\tVerbose mode\n";
	print "\n";
	print "\t\t-s\tLDAP Server DNS name or IP number\n";
	print "\t\t-u\tUsername of the directory administrator\n";
	print "\t\t-o\tString to find and be replaced\n";
	print "\t\t-n\tString to replace the value from -o\n";
	print "\t\t-r\tComma separated list of record type(s) to do the search/replace on.  For all record types, you can just specify \"all\"  for a list of record types see the man page\n";
	exit(0);
	
}
