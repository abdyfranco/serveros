#!/usr/bin/env python

# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
# Use the system's available instance of python as we are 
#	uninstalling and the server's version will no longer be accessible 
import os, sys, shutil, syslog

ssh_ol1 = "GSSAPIAuthentication yes";
ssh_ol2 = "GSSAPIDelegateCredentials no";
ssh_ol3 = "GSSAPIKeyExchange no";
ssh_ol4 = "GSSAPITrustDNS no";
ssh_nl1 = "#   GSSAPIAuthentication no";
ssh_nl2 = "#   GSSAPIDelegateCredentials no";
ssh_nl3 = "#   GSSAPIKeyExchange no";
ssh_nl4 = "#   GSSAPITrustDNS no";

ssh_pairs = [(ssh_ol1, ssh_nl1), 
				(ssh_ol2, ssh_nl2), 
				(ssh_ol3, ssh_nl3), 
				(ssh_ol4, ssh_nl4)];

sshd_ol1 = "KerberosAuthentication yes";
sshd_ol2 = "KerberosOrLocalPasswd yes";
sshd_ol3 = "KerberosTicketCleanup yes";
sshd_ol5 = "GSSAPIAuthentication yes";
sshd_ol6 = "GSSAPICleanupCredentials yes";
sshd_ol7 = "GSSAPIStrictAcceptorCheck yes";
sshd_ol8 = "GSSAPIKeyExchange no";
sshd_nl1 = "#KerberosAuthentication no";
sshd_nl2 = "#KerberosOrLocalPasswd yes";
sshd_nl3 = "#KerberosTicketCleanup yes";
sshd_nl5 = "#GSSAPIAuthentication no";
sshd_nl6 = "#GSSAPICleanupCredentials yes";
sshd_nl7 = "#GSSAPIStrictAcceptorCheck yes";
sshd_nl8 = "#GSSAPIKeyExchange no";

sshd_pairs = [(sshd_ol1, sshd_nl1), 
				(sshd_ol2, sshd_nl2), 
				(sshd_ol3, sshd_nl3), 
				(sshd_ol5, sshd_nl5), 
				(sshd_ol6, sshd_nl6), 
				(sshd_ol7, sshd_nl7), 
				(sshd_ol8, sshd_nl8)];

sshConfigFilePath10_10 = "/private/etc/ssh_config";
sshdConfigFilePath10_10 = "/private/etc/sshd_config";
sshConfigFilePath10_11 = "/private/etc/ssh/ssh_config";
sshdConfigFilePath10_11 = "/private/etc/ssh/sshd_config";

sshn = "/tmp/ssh_config";
sshdn = "/tmp/sshd_config";

sshn_lines = "";
sshdn_lines = "";

if os.path.exists(sshConfigFilePath10_10):
	sshConfigFilePath = sshConfigFilePath10_10
elif os.path.exists(sshConfigFilePath10_11):
	sshConfigFilePath = sshConfigFilePath10_11
else:
	print "ERROR: Could not find the ssh_config to update."
	syslog.syslog(syslog.LOG_ERR, 'Could not find the ssh_config to update for server demotion.')
	
if os.path.exists(sshdConfigFilePath10_10):
	sshdConfigFilePath = sshdConfigFilePath10_10
elif os.path.exists(sshdConfigFilePath10_11):
	sshdConfigFilePath = sshdConfigFilePath10_11
else:
	print "WARNING: Could not find the sshd_config to update."
	syslog.syslog(syslog.LOG_ERR, 'Could not find the sshd_config to update for server demotion.')
	
if os.path.exists(sshConfigFilePath):
	with open(sshConfigFilePath) as data:
		with open(sshn, 'w') as new_data:
			for line in data:
				for x in ssh_pairs:
					if x[0] in line:
						line = x[1] + "\n"
				new_data.write(line)
				
if os.path.exists(sshdConfigFilePath):
	with open(sshdConfigFilePath) as data:
		with open(sshdn, 'w') as new_data:
			for line in data:
				for x in sshd_pairs:
					if x[0] in line:
						line = x[1] + "\n"
				new_data.write(line)
				
#Set current config file Aside
sshAside = sshConfigFilePath + "~server_demoted"
sshdAside = sshdConfigFilePath + "~server_demoted"
if os.path.exists(sshConfigFilePath):
	shutil.move(sshConfigFilePath, sshAside)
if os.path.exists(sshdConfigFilePath):
	shutil.move(sshdConfigFilePath, sshdAside)
	
#Copy tmp files to new location
if os.path.exists(sshn):
	shutil.copy2(sshn, sshConfigFilePath)
if os.path.exists(sshdn):
	shutil.copy2(sshdn, sshdConfigFilePath)
	
#Clean tmp
if os.path.exists(sshn):
	os.remove(sshn)
	if os.path.exists(sshAside):
		os.remove(sshAside)
if os.path.exists(sshdn):
	os.remove(sshdn)
	if os.path.exists(sshdAside):
		os.remove(sshdAside)
