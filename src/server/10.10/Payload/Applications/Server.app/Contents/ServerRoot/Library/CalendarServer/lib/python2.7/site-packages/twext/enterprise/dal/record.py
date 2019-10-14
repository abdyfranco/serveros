# -*- test-case-name: twext.enterprise.dal.test.test_record -*-
##
# Copyright (c) 2012-2015 Apple Inc. All rights reserved.
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
RECORD: Relational Entity Creation from Objects Representing Data.

This is an asynchronous object-relational mapper based on
L{twext.enterprise.dal.syntax}.
"""

__all__ = [
    "ReadOnly",
    "NoSuchRecord",
    "fromTable",
    "Record",
]

from twisted.internet.defer import inlineCallbacks, returnValue
from twext.enterprise.dal.syntax import (
    Select, Tuple, Constant, ColumnSyntax, Insert, Update, Delete, SavepointAction
)
from twext.enterprise.util import parseSQLTimestamp
# from twext.enterprise.dal.syntax import ExpressionSyntax



class ReadOnly(AttributeError):
    """
    A caller attempted to set an attribute on a database-backed record, rather
    than updating it through L{Record.update}.
    """

    def __init__(self, className, attributeName):
        self.className = className
        self.attributeName = attributeName
        super(ReadOnly, self).__init__(
            "SQL-backed attribute '{0}.{1}' is read-only. "
            "Use '.update(...)' to modify attributes."
            .format(className, attributeName)
        )



class NoSuchRecord(Exception):
    """
    No matching record could be found.
    """



class _RecordMeta(type):
    """
    Metaclass for associating a L{fromTable} with a L{Record} at inheritance
    time.
    """

    def __new__(cls, name, bases, ns):
        """
        Create a new instance of this meta-type.
        """
        newbases = []
        table = None
        namer = None

        for base in bases:
            if isinstance(base, fromTable):
                if table is not None:
                    raise RuntimeError(
                        "Can't define a class from two or more tables at once."
                    )
                table = base.table
            elif getattr(base, "table", None) is not None:
                raise RuntimeError(
                    "Can't define a record class by inheriting one already "
                    "mapped to a table."
                    # TODO: more info
                )
            else:
                if namer is None:
                    if isinstance(base, _RecordMeta):
                        namer = base
                newbases.append(base)

        if table is not None:
            attrmap = {}
            colmap = {}
            allColumns = list(table)
            for column in allColumns:
                attrname = namer.namingConvention(column.model.name)
                attrmap[attrname] = column
                colmap[column] = attrname
            ns.update(table=table, __attrmap__=attrmap, __colmap__=colmap)
            ns.update(attrmap)

        return super(_RecordMeta, cls).__new__(cls, name, tuple(newbases), ns)



class fromTable(object):
    """
    Inherit from this after L{Record} to specify which table your L{Record}
    subclass is mapped to.
    """

    def __init__(self, aTable):
        """
        @param table: The table to map to.
        @type table: L{twext.enterprise.dal.syntax.TableSyntax}
        """
        self.table = aTable



class Record(object):
    """
    Superclass for all database-backed record classes.  (i.e.  an object mapped
    from a database record).

    @cvar table: the table that represents this L{Record} in the database.
    @type table: L{TableSyntax}

    @ivar transaction: The L{IAsyncTransaction} where this record is being
        loaded.  This may be C{None} if this L{Record} is not participating in
        a transaction, which may be true if it was instantiated but never
        saved.

    @cvar __colmap__: map of L{ColumnSyntax} objects to attribute names.
    @type __colmap__: L{dict}

    @cvar __attrmap__: map of attribute names to L{ColumnSyntax} objects.
    @type __attrmap__: L{dict}
    """

    __metaclass__ = _RecordMeta

    transaction = None

    def __setattr__(self, name, value):
        """
        Once the transaction is initialized, this object is immutable.  If you
        want to change it, use L{Record.update}.
        """
        if self.transaction is not None:
            raise ReadOnly(self.__class__.__name__, name)

        return super(Record, self).__setattr__(name, value)


    def __repr__(self):
        r = (
            "<{0} record from table {1}"
            .format(self.__class__.__name__, self.table.model.name)
        )
        for k in sorted(self.__attrmap__.keys()):
            r += " {0}={1}".format(k, repr(getattr(self, k)))
        r += ">"
        return r


    @classmethod
    def fromTable(cls, table):
        """
        Initialize from a L{Table} at run time.

        @param table: table containing the record data
        @type table: L{Table}
        """
        cls.__attrmap__ = {}
        cls.__colmap__ = {}
        allColumns = list(table)
        for column in allColumns:
            attrname = cls.namingConvention(column.model.name)
            cls.__attrmap__[attrname] = column
            cls.__colmap__[column] = attrname


    @staticmethod
    def namingConvention(columnName):
        """
        Implement the convention for naming-conversion between column names
        (typically, upper-case database names map to lower-case attribute
        names).
        """
        words = columnName.lower().split("_")

        def cap(word):
            if word.lower() == "id":
                return word.upper()
            else:
                return word.capitalize()

        return words[0] + "".join(map(cap, words[1:]))


    @classmethod
    def _primaryKeyExpression(cls):
        return Tuple([ColumnSyntax(c) for c in cls.table.model.primaryKey])


    def _primaryKeyValue(self):
        val = []
        for col in self._primaryKeyExpression().columns:
            val.append(getattr(self, self.__class__.__colmap__[col]))
        return val


    @classmethod
    def _primaryKeyComparison(cls, primaryKey):
        return cls._primaryKeyExpression() == Tuple(map(Constant, primaryKey))


    @classmethod
    @inlineCallbacks
    def load(cls, transaction, *primaryKey):
        results = yield cls.query(
            transaction,
            cls._primaryKeyComparison(primaryKey)
        )
        if len(results) != 1:
            raise NoSuchRecord()
        else:
            returnValue(results[0])


    @classmethod
    @inlineCallbacks
    def create(cls, transaction, **k):
        """
        Create a row.

        Used like this::

            MyRecord.create(transaction, column1=1, column2=u"two")
        """
        self = cls()
        colmap = {}
        attrtocol = cls.__attrmap__
        needsCols = []
        needsAttrs = []

        for attr in attrtocol:
            col = attrtocol[attr]
            if attr in k:
                setattr(self, attr, k[attr])
                colmap[col] = k.pop(attr)
            else:
                if col.model.needsValue():
                    raise TypeError(
                        "required attribute {0!r} not passed"
                        .format(attr)
                    )
                else:
                    needsCols.append(col)
                    needsAttrs.append(attr)

        if k:
            raise TypeError("received unknown attribute{0}: {1}".format(
                "s" if len(k) > 1 else "", ", ".join(sorted(k))
            ))
        result = yield (Insert(colmap, Return=needsCols if needsCols else None)
                        .on(transaction))
        if needsCols:
            self._attributesFromRow(zip(needsAttrs, result[0]))

        self.transaction = transaction

        returnValue(self)


    def _attributesFromRow(self, attributeList):
        """
        Take some data loaded from a row and apply it to this instance,
        converting types as necessary.

        @param attributeList: a C{list} of 2-C{tuples} of C{(attributeName,
            attributeValue)}.
        """
        for setAttribute, setValue in attributeList:
            setColumn = self.__attrmap__[setAttribute]
            if setColumn.model.type.name == "timestamp" and setValue is not None:
                setValue = parseSQLTimestamp(setValue)
            setattr(self, setAttribute, setValue)


    def delete(self):
        """
        Delete this row from the database.

        @return: a L{Deferred} which fires with C{None} when the underlying row
            has been deleted, or fails with L{NoSuchRecord} if the underlying
            row was already deleted.
        """
        return Delete(
            From=self.table,
            Where=self._primaryKeyComparison(self._primaryKeyValue())
        ).on(self.transaction, raiseOnZeroRowCount=NoSuchRecord)


    @inlineCallbacks
    def update(self, **kw):
        """
        Modify the given attributes in the database.

        @return: a L{Deferred} that fires when the updates have been sent to
            the database.
        """
        colmap = {}
        for k, v in kw.iteritems():
            colmap[self.__attrmap__[k]] = v

        yield Update(
            colmap,
            Where=self._primaryKeyComparison(self._primaryKeyValue())
        ).on(self.transaction)

        self.__dict__.update(kw)


    @inlineCallbacks
    def lock(self, where=None):
        """
        Lock with a select for update.

        @param where: SQL expression used to match the rows to lock, by default this is just an expression
            that matches the primary key of this L{Record}, but it can be used to lock multiple L{Records}
            matching the expression in one go. If it is an L{str}, then all rows will be matched.
        @type where: L{SQLExpression} or L{None}
        @return: a L{Deferred} that fires when the lock has been acquired.
        """
        if where is None:
            where = self._primaryKeyComparison(self._primaryKeyValue())
        elif isinstance(where, str):
            where = None
        yield Select(
            list(self.table),
            From=self.table,
            Where=where,
            ForUpdate=True,
        ).on(self.transaction)


    @inlineCallbacks
    def trylock(self, where=None):
        """
        Try to lock with a select for update no wait. If it fails, rollback to
        a savepoint and return L{False}, else return L{True}.

        @param where: SQL expression used to match the rows to lock, by default this is just an expression
            that matches the primary key of this L{Record}, but it can be used to lock multiple L{Records}
            matching the expression in one go. If it is an L{str}, then all rows will be matched.
        @type where: L{SQLExpression} or L{None}
        @return: a L{Deferred} that fires when the updates have been sent to
            the database.
        """

        if where is None:
            where = self._primaryKeyComparison(self._primaryKeyValue())
        elif isinstance(where, str):
            where = None
        savepoint = SavepointAction("Record_trylock_{}".format(self.__class__.__name__))
        yield savepoint.acquire(self.transaction)
        try:
            yield Select(
                list(self.table),
                From=self.table,
                Where=where,
                ForUpdate=True,
                NoWait=True,
            ).on(self.transaction)
        except:
            yield savepoint.rollback(self.transaction)
            returnValue(False)
        else:
            yield savepoint.release(self.transaction)
            returnValue(True)


    @classmethod
    def pop(cls, transaction, *primaryKey):
        """
        Atomically retrieve and remove a row from this L{Record}'s table
        with a primary key value of C{primaryKey}.

        @return: a L{Deferred} that fires with an instance of C{cls}, or fails
            with L{NoSuchRecord} if there were no records in the database.
        @rtype: L{Deferred}
        """
        return cls._rowsFromQuery(
            transaction,
            Delete(
                Where=cls._primaryKeyComparison(primaryKey),
                From=cls.table,
                Return=list(cls.table)
            ),
            lambda: NoSuchRecord()
        ).addCallback(lambda x: x[0])


    @classmethod
    def query(cls, transaction, expr, order=None, ascending=True, group=None, forUpdate=False, noWait=False, limit=None):
        """
        Query the table that corresponds to C{cls}, and return instances of
        C{cls} corresponding to the rows that are returned from that table.

        @param expr: An L{ExpressionSyntax} that constraints the results of the
            query.  This is most easily produced by accessing attributes on the
            class; for example, C{MyRecordType.query((MyRecordType.col1 >
            MyRecordType.col2).And(MyRecordType.col3 == 7))}

        @param order: A L{ColumnSyntax} to order the resulting record objects
            by.

        @param ascending: A boolean; if C{order} is not C{None}, whether to
            sort in ascending or descending order.

        @param group: a L{ColumnSyntax} to group the resulting record objects
            by.

        @param forUpdate: do a SELECT ... FOR UPDATE
        @type forUpdate: L{bool}
        @param noWait: include NOWAIT with the FOR UPDATE
        @type noWait: L{bool}
        """
        kw = {}
        if order is not None:
            kw.update(OrderBy=order, Ascending=ascending)
        if group is not None:
            kw.update(GroupBy=group)
        if forUpdate:
            kw.update(ForUpdate=True)
            if noWait:
                kw.update(NoWait=True)
        if limit is not None:
            kw.update(Limit=limit)
        return cls._rowsFromQuery(
            transaction,
            Select(
                list(cls.table),
                From=cls.table,
                Where=expr,
                **kw
            ),
            None
        )


    @classmethod
    def all(cls, transaction):
        """
        Load all rows from the table that corresponds to C{cls} and return
        instances of C{cls} corresponding to all.
        """
        return cls._rowsFromQuery(
            transaction,
            Select(
                list(cls.table),
                From=cls.table,
                OrderBy=cls._primaryKeyExpression()
            ),
            None
        )


    @classmethod
    def deleteall(cls, transaction):
        """
        Delete all rows from the table that corresponds to C{cls}.
        """
        return cls.deletesome(transaction, None)


    @classmethod
    def deletesome(cls, transaction, where):
        """
        Delete all rows matching the where expression from the table that corresponds to C{cls}.
        """
        return Delete(
            From=cls.table,
            Where=where,
        ).on(transaction)


    @classmethod
    @inlineCallbacks
    def _rowsFromQuery(cls, transaction, qry, rozrc):
        """
        Execute the given query, and transform its results into instances of
        C{cls}.

        @param transaction: an L{IAsyncTransaction} to execute the query on.

        @param qry: a L{_DMLStatement} (XXX: maybe _DMLStatement or some
            interface that defines "on" should be public?) whose results are
            the list of columns in C{self.table}.

        @param rozrc: The C{raiseOnZeroRowCount} argument.

        @return: a L{Deferred} that succeeds with a C{list} of instances of
            C{cls} or fails with an exception produced by C{rozrc}.
        """
        rows = yield qry.on(transaction, raiseOnZeroRowCount=rozrc)
        selves = []
        names = [cls.__colmap__[column] for column in list(cls.table)]
        for row in rows:
            self = cls()
            self._attributesFromRow(zip(names, row))
            self.transaction = transaction
            selves.append(self)
        returnValue(selves)
