#!/usr/bin/env python

# Copyright (c) 2014-2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#

import sys, os, plistlib, shutil, errno
from subprocess import call

def main():
	oldSPPath = "/Library/Server/Previous/private/var/db/dslocal/nodes/Default/sharepoints/"
	if os.path.exists(oldSPPath):
		tmpSharePointsPath = "/tmp/sharepoints/"
		#copy the old plist to a temp location so we can convert them for reading.
		copyanything(oldSPPath, tmpSharePointsPath)

		if os.path.exists(tmpSharePointsPath):
			for filename in os.listdir(tmpSharePointsPath):
				curFN = os.path.join (tmpSharePointsPath, filename)

				#plistlib can't read binary plist so we need to make sure to convert it first.
				retcode = call(["plutil", "-convert", "xml1", curFN])
				pl = plistlib.readPlist(curFN)
				curSPPathArray = pl["directory_path"]
				curSPPath = curSPPathArray[0]
				if not os.path.isdir(curSPPath):
					print "Sharepoint path is missing and may not be available. Plist was := %s" % pl
	
		#nuke the tmp files when done.
		shutil.rmtree(tmpSharePointsPath)

		#copy the old sharepoint files to the new dslocal node
		newSPPath = "/private/var/db/dslocal/nodes/Default/sharepoints/"
		errors = []
		names = os.listdir(oldSPPath)
		if not os.path.isdir(newSPPath):
			os.makedirs(newSPPath)
		for name in names:
			srcname = os.path.join(oldSPPath, name)
			dstname = os.path.join(newSPPath, name)
		
			try:
				shutil.copy2(srcname, dstname)
			except (IOError, os.error) as why:
				errors.append((srcname, dstname, str(why)))
			# catch the Error from the recursive copytree so that we can
			# continue with other files
			except Error as err:
				errors.extend(err.args[0])
		
def copyanything(src, dst):
	try:
		shutil.copytree(src, dst)
	except OSError as exc: # python >2.5
		if exc.errno == errno.ENOTDIR:
			shutil.copy(src, dst)
		else: raise
				
if __name__ == '__main__':
	main()
