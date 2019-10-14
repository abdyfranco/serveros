# -*- test-case-name: twext.python.test.test_sendmsg -*-
##
# Copyright (c) 2010-2015 Apple Inc. All rights reserved.
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

from struct import pack, unpack, calcsize
from socket import SOL_SOCKET

from twisted.python.sendmsg import send1msg, recv1msg, SCM_RIGHTS



def sendfd(socketfd, fd, description):
    """
    Send the given FD to another process via L{send1msg} on the given
    C{AF_UNIX} socket.

    @param socketfd: An C{AF_UNIX} socket, attached to another process waiting
        to receive sockets via the ancillary data mechanism in L{send1msg}.

    @type socketfd: C{int}

    @param fd: A file descriptor to be sent to the other process.

    @type fd: C{int}

    @param description: a string describing the socket that was passed.

    @type description: C{str}
    """
    send1msg(
        socketfd, description, 0, [(SOL_SOCKET, SCM_RIGHTS, pack("i", fd))]
    )



def recvfd(socketfd):
    """
    Receive a file descriptor from a L{send1msg} message on the given
    C{AF_UNIX} socket.

    @param socketfd: An C{AF_UNIX} socket, attached to another process waiting
        to send sockets via the ancillary data mechanism in L{send1msg}.

    @param fd: C{int}

    @return: a 2-tuple of (new file descriptor, description).

    @rtype: 2-tuple of (C{int}, C{str})
    """
    data, _ignore_flags, ancillary = recv1msg(socketfd)
    [(_ignore_cmsg_level, _ignore_cmsg_type, packedFD)] = ancillary

    # cmsg_level and cmsg_type really need to be SOL_SOCKET / SCM_RIGHTS, but
    # since those are the *only* standard values, there's not much point in
    # checking.
    unpackedFD = 0
    int_size = calcsize("i")

    if len(packedFD) > int_size:       # [ar]happens on 64 bit arch (FreeBSD)
        [unpackedFD] = unpack("i", packedFD[0:int_size])
    else:
        [unpackedFD] = unpack("i", packedFD)

    return (unpackedFD, data)
