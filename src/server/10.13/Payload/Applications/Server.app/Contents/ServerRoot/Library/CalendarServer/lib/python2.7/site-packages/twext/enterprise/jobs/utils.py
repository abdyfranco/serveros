##
# Copyright (c) 2015-2017 Apple Inc. All rights reserved.
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

from twisted.internet.defer import inlineCallbacks, returnValue
from twisted.python.failure import Failure
from datetime import datetime


@inlineCallbacks
def inTransaction(transactionCreator, operation, label="jobqueue.inTransaction", **kwargs):
    """
    Perform the given operation in a transaction, committing or aborting as
    required.

    @param transactionCreator: a 0-arg callable that returns an
        L{IAsyncTransaction}

    @param operation: a 1-arg callable that takes an L{IAsyncTransaction} and
        returns a value.

    @param label: label to be used with the transaction.

    @return: a L{Deferred} that fires with C{operation}'s result or fails with
        its error, unless there is an error creating, aborting or committing
        the transaction.
    """
    txn = transactionCreator(label=label)
    try:
        result = yield operation(txn, **kwargs)
    except:
        f = Failure()
        yield txn.abort()
        returnValue(f)
    else:
        yield txn.commit()
        returnValue(result)


def astimestamp(v):
    """
    Convert the given datetime to a POSIX timestamp.
    """
    return (v - datetime.utcfromtimestamp(0)).total_seconds()
