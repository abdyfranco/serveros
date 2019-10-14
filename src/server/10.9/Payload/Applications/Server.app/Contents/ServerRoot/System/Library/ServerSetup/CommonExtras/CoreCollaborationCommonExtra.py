#!/usr/bin/env python

##
# Copyright (c) 2009-2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
# IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
# of the Apple Software and is subject to the terms and conditions of the Apple
# Software License Agreement accompanying the package this file is part of.
##

import os
from subprocess import Popen, PIPE

def main():
	serverInstallPathPrefix = "/Applications/Server.app/Contents/ServerRoot"
	
	# 13406610
	os.system(serverInstallPathPrefix + "/usr/sbin/collabd_database_loader --mode start")
	os.system(serverInstallPathPrefix + "/usr/bin/wikiadmin updateSchema")
	os.system(serverInstallPathPrefix + "/usr/sbin/collabd_database_loader --mode stop")
	
	# Stop collabd (killing any _teamsserver processes to be doubly-sure 14831645)
	os.system(serverInstallPathPrefix + "/usr/sbin/serveradmin stop collabd")
	process = Popen('ps aux | grep -v grep | grep _teamsserver', stdout=PIPE, shell=True)
	lines = process.stdout.read().split('\n')
	for line in lines:
		cols = line.split()
		if (len(cols) > 1):
			owner = cols[0]
			pid = cols[1]
			if owner == '_teamsserver':
				os.system('kill -TERM ' + pid)
	
	# Run the XCS preflight and start collabd again
	os.system(serverInstallPathPrefix + "/usr/sbin/xcs_preflight")
	os.system(serverInstallPathPrefix + "/usr/sbin/serveradmin start collabd")

if __name__ == '__main__':
	main()
