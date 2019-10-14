# -*- test-case-name: twext.python.test.test_launchd -*-
##
# Copyright (c) 2013-2017 Apple Inc. All rights reserved.
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
Binding for launchd socket hand-off API.
"""

from __future__ import print_function

from cffi import FFI, VerificationError

ffi = FFI()

ffi.cdef(
    """
    int launch_activate_socket(const char *name, int **fds, size_t *cnt);
    """
)

try:
    lib = ffi.verify(
        """
        #include <launch.h>
        """,
        tag=__name__.replace(".", "_")
    )
except VerificationError as ve:
    raise ImportError(ve)


def launchActivateSocket(name):
    fdList = []

    fds = ffi.new('int **')
    count = ffi.new('size_t *')
    result = lib.launch_activate_socket(name, fds, count)
    if result == 0:
        for i in xrange(count[0]):
            fdList.append(fds[0][i])
    return fdList


__all__ = [
    'launchActivateSocket',
]
