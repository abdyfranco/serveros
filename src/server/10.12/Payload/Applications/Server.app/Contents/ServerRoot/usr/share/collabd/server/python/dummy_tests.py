import sys
import random

import unittest

class TestSequenceFunctions(unittest.TestCase):
	def setUp(self):
		self.seq = range(10)
	def test_fail_sometimes(self):
		self.assertTrue(random.choice([1,2]) == 1)
	def test_always_fail(self):
		self.assertTrue(False)
	def test_always_error(self):
		raise Exception('Errrrrrrrorrrrrr')
	def test_shuffle(self):
		# make sure the shuffled sequence does not lose any elements
		random.shuffle(self.seq)
		self.seq.sort()
		self.assertEqual(self.seq, range(10))
		# should raise an exception for an immutable sequence
		self.assertRaises(TypeError, random.shuffle, (1,2,3))
	def test_choice(self):
		element = random.choice(self.seq)
		self.assertTrue(element in self.seq)
	def test_sample(self):
		with self.assertRaises(ValueError):
			random.sample(self.seq, 20)
		for element in random.sample(self.seq, 5):
			self.assertTrue(element in self.seq)
