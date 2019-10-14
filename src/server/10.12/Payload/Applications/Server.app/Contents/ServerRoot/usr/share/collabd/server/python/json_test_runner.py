#!/usr/bin/env python -B

import sys
import json

from object_test_runner import *

def usage_die():
	print 'Usage: %s [list|run] python-file' % (sys.argv[0],)
	sys.exit(255)

if len(sys.argv) < 3:
	usage_die()

suite = load_test_suite_from_module_name(sys.argv[2])

if sys.argv[1] == 'list':
	print json.dumps([t._testMethodName for t in list(suite)])
	sys.exit(0)
elif sys.argv[1] == 'run':
	runner = ObjectTestRunner()
	testName = None
	if len(sys.argv) > 3:
		testName = sys.argv[3]
	exitStatus = runner.run(suite, testName)
	print json.dumps(runner.getTestResults())
	sys.exit(exitStatus)
else:
	usage_die()
