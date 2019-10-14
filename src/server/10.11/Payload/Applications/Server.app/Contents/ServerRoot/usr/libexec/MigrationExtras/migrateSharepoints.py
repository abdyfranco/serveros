#!/usr/bin/env python

##
# Copyright (c) 2013-2015 Apple Inc. All Rights Reserved.
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
import sys, os, plistlib, shutil, errno, tempfile
from subprocess import call
from optparse import OptionParser, IndentedHelpFormatter

def main():
	oldSPPath = "PathMissing"
	optParser = OptionParser(formatter=IndentedHelpFormatter(max_help_position=40, width=120))
	optParser.set_defaults(sourceRoot='/',
						   targetRoot='/',
						   verbose=1)
	optParser.add_option('-v', '--verbose', dest='verbose', action='count', help='verbose output')
	optParser.add_option('--sourceRoot', metavar='SOURCE_ROOT', help='the root of the system to migrate from')
	optParser.add_option('--targetRoot', metavar='TARGET_ROOT', help='the root of the new system to migrate to')
	optParser.add_option('--purge', metavar='[0|1]', help='ignored')
	optParser.add_option('--sourceType', choices=('System', 'TimeMachine'), metavar='[System|TimeMachine]', help='ignored')
	optParser.add_option('--sourceVersion', metavar='10.x', help='ignored')
	optParser.add_option('--language', help='ignored')
	global options
	(options, args) = optParser.parse_args()
	
	if not options.sourceVersion:
		optParser.print_help()
		sys.exit(0)
		
	verbose = options.verbose
	if verbose:
		print "Maximum verbosity"

	# Sharepoints config plist can live in one of two old locations.
	oldSPPathOldStyle = options.sourceRoot + "/private/var/db/dslocal/nodes/Default/config/sharepoints/"
	oldSPPathOldStyleUC = options.sourceRoot + "/private/var/db/dslocal/nodes/Default/config/SharePoints/"
	oldSPPathNewStyle = options.sourceRoot + "/private/var/db/dslocal/nodes/Default/sharepoints/"
	oldSPPathNewStyleUC = options.sourceRoot + "/private/var/db/dslocal/nodes/Default/SharePoints/"
	
	if os.path.exists(oldSPPathOldStyle):
		oldSPPath = oldSPPathOldStyle
	elif os.path.exists(oldSPPathOldStyleUC):
		oldSPPath = oldSPPathOldStyleUC
	elif os.path.exists(oldSPPathNewStyle):
		oldSPPath = oldSPPathNewStyle
	elif os.path.exists(oldSPPathNewStyleUC):
		oldSPPath = oldSPPathNewStyleUC
	
	tmpSharePointsPath = tempfile.mkdtemp() # create temp dir
	
	#copy the old plist to a temp location so we can convert them for reading.
	if os.path.exists(oldSPPath):
		copytree(oldSPPath, tmpSharePointsPath)

		if os.path.exists(tmpSharePointsPath):
			for filename in os.listdir(tmpSharePointsPath):
				curFN = os.path.join (tmpSharePointsPath, filename)

				#plistlib can't read binary plist so we need to make sure to convert it first.
				retcode = call(["plutil", "-convert", "xml1", curFN])
				pl = plistlib.readPlist(curFN)
				curSPPathArray = pl["directory_path"]
				curSPPath = curSPPathArray[0]
				if not os.path.isdir(curSPPath):
					print "Sharepoint path is missing and may not be available. Path was := %s" % curSPPath
					print "Sharepoint file is := %s" % os.path.basename(curFN)
	
		#nuke the tmp files when done.
		try:
			shutil.rmtree(tmpSharePointsPath) # delete directory
		except OSError, e:
			if e.errno != 2: # code 2 - no such file or directory
				raise

		#copy the old sharepoint files to the new dslocal node
		newSPPath = options.targetRoot + "private/var/db/dslocal/nodes/Default/sharepoints/"
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

def copytree(src, dst, symlinks=False, ignore=None):
	if not os.path.exists(dst):
		os.makedirs(dst)
	for item in os.listdir(src):
		s = os.path.join(src, item)
		d = os.path.join(dst, item)
		if os.path.isdir(s):
			copytree(s, d, symlinks, ignore)
		else:
			if not os.path.exists(d) or os.stat(src).st_mtime - os.stat(dst).st_mtime > 1:
				shutil.copy2(s, d)

if __name__ == '__main__':
	main()

