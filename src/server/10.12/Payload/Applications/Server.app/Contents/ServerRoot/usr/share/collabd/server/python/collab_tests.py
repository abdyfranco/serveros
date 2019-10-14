import sys
import random
import unittest
import datetime

from collabclient import *

def _random_id():
	return ''.join(random.sample('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10))

class CollabTests(unittest.TestCase):
	def setUp(self):
		self.svc = ServiceClient()
		self.wikiGUID = None

	def test_001_ping(self):
		r = self.svc.blockingExecute('AuthService', 'ping')
		self.assertIsInstance(r, CSDateTime)
		self.assertTrue(r.toDateTime() > datetime.datetime.utcfromtimestamp(0))

	def test_002_fetch_unauthenticated_user(self):
		r = self.svc.blockingExecute('ContentService', 'entityForTinyID:', 'unauth')
		self.assertIsInstance(r, UserEntity)
		self.assertEquals(r.longName, 'unauthenticated user')
		self.assertEquals(r.login, 'unauthenticated')

	def test_003_fetch_serverhome_page(self):
		r = self.svc.blockingExecute('ContentService', 'entityForTinyID:', 'serverhome')
		self.assertIsInstance(r, PageEntity)

	def _assert_entity_saved_successfully(self, e1, e2, etype):
		self.assertIsInstance(e2, etype)
		self.assertIsNotNone(e2.guid)
		self.assertIsNotNone(e2.createTime)
		self.assertEquals(e1.longName, e2.longName)

	def test_004_create_wiki(self):
		wiki1 = WikiEntity()
		wiki1.longName = 'Wiki LongName ' + _random_id()
		wiki2 = self.svc.blockingExecute('ContentService', 'createEntity:', wiki1)
		self._assert_entity_saved_successfully(wiki1, wiki2, WikiEntity)
		self.wikiGUID = wiki2.guid

	def test_005_create_wiki_page(self):
		page1 = PageEntity()
		page1.ownerGUID = self.wikiGUID
		page1.longName = 'Wiki Page ' + _random_id()
		page2 = self.svc.blockingExecute('ContentService', 'createEntity:', page1)
		self._assert_entity_saved_successfully(page1, page2, PageEntity)

