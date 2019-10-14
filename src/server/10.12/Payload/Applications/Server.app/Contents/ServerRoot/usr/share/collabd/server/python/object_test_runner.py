#!/usr/bin/env python -B

import re
import sys
import time
import random
import importlib

import unittest
from unittest import result
from unittest.signals import registerResult

class _WritelnDecorator(object):
	"""Used to decorate file-like objects with a handy 'writeln' method"""
	def __init__(self,stream):
		self.stream = stream

	def __getattr__(self, attr):
		if attr in ('stream', '__getstate__'):
			raise AttributeError(attr)
		return getattr(self.stream,attr)

	def writeln(self, arg=None):
		if arg:
			self.write(arg)
		self.write('\n') # text-mode streams translate to \r\n if needed


class ObjectTestResult(result.TestResult):
	def __init__(self):
		super(ObjectTestResult, self).__init__()
		self.testResult = {}

	def getTestResult(self):
		return self.testResult

	def startTest(self, test):
		super(ObjectTestResult, self).startTest(test)
		self.testResult['name'] = test._testMethodName
		self.startTime = time.time()

	def addSuccess(self, test):
		super(ObjectTestResult, self).addSuccess(test)
		self.testResult['result'] = 'OK'

	def addError(self, test, err):
		super(ObjectTestResult, self).addError(test, err)
		self.testResult['result'] = 'ERROR'
		self.testResult['error'] = str(self.errors[-1][1])

	def addFailure(self, test, err):
		super(ObjectTestResult, self).addFailure(test, err)
		self.testResult['result'] = 'FAIL'
		self.testResult['failure'] = str(self.failures[-1][1])

	def addSkip(self, test, reason):
		super(ObjectTestResult, self).addSkip(test, reason)
		self.testResult['result'] = "SKIPPED:{0!r}".format(reason)

	def addExpectedFailure(self, test, err):
		super(ObjectTestResult, self).addExpectedFailure(test, err)
		self.testResult['result'] = 'EXPECTED-FAILURE'

	def addUnexpectedSuccess(self, test):
		super(ObjectTestResult, self).addUnexpectedSuccess(test)
		self.testResult['result'] = 'EXPECTED-SUCCESS'

	def stopTest(self, test):
		self.testResult['elapsed'] = round(time.time() - self.startTime, 4)


class ObjectTestRunner(object):
	def __init__(self, stream=sys.stdout, failfast=False):
		self.stream = _WritelnDecorator(stream)
		self.failfast = failfast
		self.testResults = []

	def getTestResults(self):
		return self.testResults

	def run(self, suite, testName=None):
		"Run the given test case or test suite."

		errorsOrFailures = 0
		for test in suite:
			if testName == None or test._testMethodName == testName:
				result = ObjectTestResult()
				registerResult(result)
				result.failfast = self.failfast
				startTestRun = getattr(result, 'startTestRun', None)
				if startTestRun is not None:
					startTestRun()
				try:
					test(result)
				finally:
					stopTestRun = getattr(result, 'stopTestRun', None)
					if stopTestRun is not None:
						stopTestRun()
					errorsOrFailures += len(result.errors)+len(result.failures)
					self.testResults.append(result.getTestResult())
		if testName != None:
			self.testResults = self.testResults[0]
		return errorsOrFailures


def find_test_class(module):
	for x in dir(module):
		obj = getattr(module, x)
		if hasattr(obj, '__class__') and isinstance(obj, type) and issubclass(obj, unittest.TestCase):
			return obj
	return None

def load_test_suite_from_module_name(module_name):
	testModule = importlib.import_module(module_name)
	# suite = unittest.TestLoader().loadTestsFromModule(testModule)
	return unittest.TestLoader().loadTestsFromTestCase(find_test_class(testModule))
