

from unittest import TestCase, skip
from collabclient import CoderTypeRegistry

from collabclient import ServiceClient, CSDateTime, PageEntity

from socket import socket

def portIsOpen():
    skt = socket()
    try:
        skt.connect(("127.0.0.1", 4444))
    except:
        return False
    else:
        return True


class RegistrationTests(TestCase):
    """
    Type Registration Tests.
    """

    def test_subclassing(self):
        """
        Subclasses of classes decorated with L{CoderTypeRegistry.registered}
        will yield classes with a union of all codable properties.
        """
        registry = CoderTypeRegistry()
        @registry.registered("com.example.A", ["alpha", "beta"])
        class A(object):
            pass

        @registry.registered("com.example.B", ["gamma", "delta"])
        class B(A):
            pass

        self.assertEqual(B.codableProperties(),
                         ["alpha", "beta", "gamma", "delta"])



class IntegrationTests(TestCase):
    """
    Integration tests for blocking client.
    """

    def setUp(self):
        self.client = ServiceClient()


    def test_ping(self):
        """
        [TestService ping] ought to return a CSDateTime around the current
        time.
        """
        pong = self.client.blockingExecute("TestService", "ping")
        self.assertEquals(pong, CSDateTime.fromDateTime(pong.toDateTime()))


    def test_retrieveServerHome(self):
        """
        # [ContentService entityForID: @"serverhome"] should retrieve a
        # PageEntity.
        """
        serverHome = self.client.blockingExecute(
            "ContentService", "entityForTinyID:", "serverhome"
        )
        self.assertTrue(isinstance(serverHome, PageEntity))
        self.assertTrue(isinstance(serverHome.createTime, CSDateTime))


if not portIsOpen():
    IntegrationTests = skip("Run collabd on port 4444.")(IntegrationTests)

