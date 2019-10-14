##
# Copyright (c) 2015-2016 Apple Inc. All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
##

"""
Socket file implementation for MaxAccept
"""

__all__ = [
    "MaxAcceptSocketFileServer",
]


from twisted.application import service
from twisted.internet import endpoints
from twisted.internet.defer import inlineCallbacks

from twext.python.log import Logger

log = Logger()


def maxAcceptDoRead(self):
    self.numberAccepts = min(
        self.factory.maxRequests - self.factory.outstandingRequests,
        self.factory.maxAccepts
    )
    self.realDoRead()


class MaxAcceptSocketFileServer(service.Service):
    """
    Socket File server

    @ivar myPort: When running, this is set to the L{IListeningPort} being
        managed by this service.
    """

    def __init__(self, protocolFactory, address, backlog=None):
        self.protocolFactory = protocolFactory
        self.protocolFactory.myServer = self
        self.address = address
        self.backlog = backlog
        self.myPort = None

    @inlineCallbacks
    def startService(self):
        from twisted.internet import reactor
        endpoint = endpoints.UNIXServerEndpoint(
            reactor, self.address, backlog=self.backlog, wantPID=1
        )
        self.myPort = yield endpoint.listen(self.protocolFactory)

        # intercept doRead() to set numberAccepts
        self.myPort.realDoRead = self.myPort.doRead
        self.myPort.doRead = maxAcceptDoRead.__get__(
            self.myPort, self.myPort.__class__
        )

    @inlineCallbacks
    def stopService(self):
        """
        Wait for outstanding requests to finish

        @return: a Deferred which fires when all outstanding requests are
            complete
        """
        if self.myPort is not None:
            yield self.myPort.stopListening()

        if hasattr(self.protocolFactory, "allConnectionsClosed"):
            yield self.protocolFactory.allConnectionsClosed()
