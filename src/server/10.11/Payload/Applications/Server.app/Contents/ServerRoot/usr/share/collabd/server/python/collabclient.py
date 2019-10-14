# -*- test-case-name: test_collabclient -*-

# pip install msgpack-python

import sys
import msgpack
import traceback
import urllib2

import datetime

from cStringIO import StringIO

from twisted.internet.defer import inlineCallbacks, returnValue, Deferred
from twisted.internet.protocol import Protocol
from twisted.internet import reactor

from twisted.web.client import Agent, Headers, FileBodyProducer, ResponseDone

class Error(Exception):
    """
    Base error type for all bridged exceptions.
    """



class UnknownResponse(Error):
    """
    An unknown response code was encountered.
    """



class CoderTypeRegistry(object):
    def __init__(self):
        self.registry = {}
        self.reverse = {}


    def registerClass(self, name, cls):
        self.registry[name] = cls
        self.reverse[cls] = name


    def lookupClass(self, name):
        """
        Look up a class by its name, returning the relevant type object.
        """
        return self.registry.get(name)


    def lookupName(self, cls):
        """
        Look up a class name by its type object.
        """
        return self.reverse[cls]


    def registered(self, name, codablePropertyList):
        """
        Class decorator that registers a class.

        Use like so::

            @registry.registered('com.apple.Foo', ['foo', 'bar'])
            class Foo(object):
                def __init__(self, foo, bar):
                    self.foo = foo
                    self.bar = bar
        """
        def gotClass(cls):
            @classmethod
            def codableProperties(me):
                return (super(subcls, me).codableProperties() +
                        codablePropertyList)
            ns = cls.__dict__.copy()
            ns.update(codableProperties=codableProperties)
            bases = []
            if not issubclass(cls, Codable):
                bases.append(Codable)
            subcls = type(cls.__name__, tuple(bases) + cls.__bases__, ns)
            self.registerClass(name, subcls)
            return subcls
        return gotClass



registry = CoderTypeRegistry()



class Codable(object):
    """
    An object that can be encoded as part of a service request.  If you use
    L{CoderTypeRegistry.registered}, you will automatically inherit from this
    class.
    """

    @classmethod
    def type(cls):
        return registry.lookupName(cls)


    @classmethod
    def codableProperties(cls):
        return []


    def asDictionary(self):
        """
        Convert this codable object into a dictionary.
        """
        return dict([(k, getattr(self, k, None))
                     for k in self.codableProperties()] +
                    [("type", registry.lookupName(self.__class__))])

    def __repr__(self):
        return '%s(%s)' % (self.__class__.__name__, self.asDictionary())



@registry.registered("com.apple.ServiceRequest",
                     ["adminAuthorizationRef", "sessionGUID", "sandboxTuple",
                      "serviceName", "methodName", "arguments",
                      "expandReferencedObjects", "subpropertyPaths",
                      "referencedPathsToFollow", "clientURL", "hints"])
class ServiceRequest(object):
    def __init__(self, adminAuthorizationRef=None, sessionGUID=None,
                 sandboxTuple=None, serviceName=None, methodName=None,
                 arguments=None, expandReferencedObjects=None,
                 subpropertyPaths=None, referencedPathsToFollow=None,
                 clientURL=None, hints=None):
        super(ServiceRequest, self).__init__()
        self.adminAuthorizationRef = adminAuthorizationRef
        self.sessionGUID = sessionGUID
        self.sandboxTuple = sandboxTuple
        self.serviceName = serviceName
        self.methodName = methodName
        self.arguments = arguments
        self.expandReferencedObjects = expandReferencedObjects
        self.subpropertyPaths = subpropertyPaths
        self.referencedPathsToFollow = referencedPathsToFollow
        self.clientURL = clientURL
        self.hints = hints



@registry.registered("com.apple.ServiceResponse",
                     ["succeeded", "response", "responseStatus",
                     "referencedObjects", "executionTime"])
class ServiceResponse(object):
    """
    A response to a L{ServiceRequest}
    """
    def __init__(self, succeeded, response, responseStatus, referencedObjects,
                 executionTime):
        super(ServiceResponse, self).__init__()
        self.succeeded = succeeded
        self.response = response
        self.responseStatus = responseStatus
        self.referencedObjects = referencedObjects
        self.executionTime = executionTime



_EPOCH = datetime.datetime.utcfromtimestamp(0)



@registry.registered("com.apple.DateTime", ["epochValue", "isoValue"])
class CSDateTime(object):
    """
    Codable datetime object.
    """

    def __init__(self, epochValue):
        self.epochValue = epochValue
        self.isoValue = self.toDateTime().isoformat()


    def toDateTime(self):
        return datetime.datetime.utcfromtimestamp(self.epochValue)


    @classmethod
    def fromDateTime(cls, dt):
        """
        Construct a L{CSDateTime} from a L{datetime.datetime}.
        """
        delta = dt - _EPOCH
        return CSDateTime((delta.days * (60 * 60 * 24)) + (delta.seconds) +
                          (delta.microseconds * 1e-6))


    def __getattr__(self, name):
        """
        Masquerade as a python C{datetime} object.
        """
        return getattr(self.toDateTime(), name)


    def __str__(self):
        return self.toDateTime().isoformat()


    def __repr__(self):
        return 'CSDateTime.fromDateTime({!r})'.format(self.toDateTime())


    def __eq__(self, other):
        if isinstance(other, CSDateTime):
            return (self.epochValue == other.epochValue)
        else:
            return False



class MsgPackEncoder(object):

    def contentType(self):
        return 'x-apple/msgpack'


    def transformObject(self, obj):
        if isinstance(obj, datetime.datetime):
            return CSDateTime.fromDateTime(obj)
        elif isinstance(obj, dict):
            return dict(
                (self.transformObject(key), self.transformObject(value))
                for (key, value) in obj.iteritems()
            )
        elif isinstance(obj, list) or isinstance(obj, tuple):
            return [self.transformObject(item) for item in obj]
        elif isinstance(obj, Codable):
            return self.transformObject(obj.asDictionary())
        else:
            return obj


    def encodeObject(self, object):
        return msgpack.dumps(self.transformObject(object))



class MsgPackDecoder(object):
    def contentType(self):
        return 'x-apple/msgpack'


    def transformObject(self, obj):
        if type(obj) == type({}):
            typeName = obj.get("type")
            typeClass = registry.lookupClass(typeName)
            if typeName is not None and typeClass is not None:
                instance = typeClass.__new__(typeClass)
                for key, val in obj.items():
                    if key != 'type':
                        setattr(instance, key, self.transformObject(val))
                return instance
            else:
                for key, val in obj.items():
                    if key != 'type':
                        obj[key] = self.transformObject(val)
                return obj
        elif type(obj) == type([]):
            return [self.transformObject(sub) for sub in obj]
        return obj


    def decodeObject(self, data):
        return self.transformObject(msgpack.loads(data))



class ServiceClient(object):
    """
    A client which can encode collabd service requests.
    """

    encoder = MsgPackEncoder()
    decoder = MsgPackDecoder()

    def __init__(self, baseURL="http://localhost:4444/svc"):
        super(ServiceClient, self).__init__()
        self.baseURL = baseURL
        self.sessionGUID = None


    _agent = None

    @property
    def agent(self):
        """
        Create an L{Agent} if one hasn't already been associated with this
        L{ServiceClient}.
        """
        if self._agent is None:
            self._agent = Agent(reactor)
        return self._agent


    def convertResponse(self, responseData):
        """
        Convert the data received from a response into an object.

        @param responseData: Response data.
        @type responseData: L{bytes}
        """
        response = self.decoder.decodeObject(responseData)
        if response.responseStatus == 'succeeded':
            return response.response
        elif response.responseStatus == 'failed':
            exname = response.response.get('exceptionName')
            here = sys.modules[__name__]
            if exname is not None:
                ex = getattr(here, exname, None)
                if ex is None:
                    ex = type(exname, tuple([Error]), {})
                    setattr(here, exname, ex)
            exi = ex(response.response['exceptionString'])
            raise exi
        else:
            raise UnknownResponse("Unknown Response Status: {!r}".format(
                response.responseStatus
            ))
        return response


    def encodeRequest(self, service, method, params):
        """
        Create a L{ServiceRequest} for the given service, method, and parameter
        list.
        """
        return self.encoder.encodeObject(
            ServiceRequest(sessionGUID=self.sessionGUID, serviceName=service,
                           methodName=method, arguments=params)
        )


    def blockingExecute(self, service, method, *params):
        """
        Execute a service request.

        @param service: The name of the service to issue the request to.
        @type service: L{str}

        @param method: The name of the method to issue.
        @type method: L{str}

        @param params: The list of parameters to serialize and send to the
            remote method.
        """
        return self.convertResponse(self.blockingSend(self.encodeRequest(
            service, method, params
        )))


    @inlineCallbacks
    def asyncExecute(self, service, method, *params):
        """
        Asynchronously execute the given service method and return a
        L{twisted.internet.defer.Deferred} with the result.

        @param service: The name of the service to issue the request to.
        @type service: L{str}

        @param method: The name of the method to issue.
        @type method: L{str}

        @param params: The list of parameters to serialize and send to the
            remote method.
        """
        returnValue(self.convertResponse((yield self.asyncSend(
            self.encodeRequest(service, method, params))
        )))


    def blockingSend(self, data):
        """
        Synchronously send some data to the endpoint URL as an HTTP PUT.
        """
        class Putter(urllib2.Request):
            def get_method(self):
                return 'PUT'
        req = Putter(self.baseURL, data,
                     {"Content-Type": self.encoder.contentType()})
        return urllib2.urlopen(req).read()


    @inlineCallbacks
    def asyncSend(self, data):
        """
        Asynchronously send some data to the endpoint URL as an HTTP PUT.
        """
        response = yield self.agent.request(
            "PUT", self.baseURL,
            Headers({"Content-Type": [self.encoder.contentType()]}),
            FileBodyProducer(StringIO(data))
        )
        out = StringIO()
        done = Deferred()
        class Catcher(Protocol):
            dataReceived = out.write
            def connectionLost(self, reason):
                if reason.check(ResponseDone):
                    done.callback(out.getvalue())
                else:
                    done.errback(reason)
        response.deliverBody(Catcher())
        returnValue((yield done))

@registry.registered("com.apple.PaginatedResult", ["guid", "startIndex", "results", "total"])
class PaginatedResult(object): pass

@registry.registered("com.apple.PaginationRequest", ["serviceRequest", "startIndex", "resultsLimit", "guid"])
class PaginationRequest(object): pass

@registry.registered("com.apple.Notification", ["guid", "userGUID", "notificationType", "entityGUID", "ownerGUID", "timestamp", "data"])
class Notification(object): pass

@registry.registered("com.apple.EntityPlaceholder", ["guid", "tinyID", "reason"])
class EntityPlaceholder(object): pass

@registry.registered("com.apple.EntityACL", ["entityGUID", "userLogin", "userExternalID", "userLongName", "action", "allow"])
class EntityACL(object): pass

@registry.registered("com.apple.UserActivity", ["userGUID", "action", "entityGUID", "entityRevision", "data", "actionTime", "containerGUID", "subFields", "isUnread", "isFavorite", "ownerGUID"])
class UserActivity(object): pass

@registry.registered("com.apple.UserActivityQuery", ["actions", "entityTypes", "userGUID", "ownerGUID", "containerGUID", "subFields", "onlyWatched", "onlyFavorites", "onlyUnread", "startIndex", "resultsLimit", "startTime"])
class UserActivityQuery(object): pass

@registry.registered("com.apple.EntityComment", ["guid", "parentGUIDs", "entityGUID", "entityLongName", "entityShortName", "entityType", "title", "body", "authorUserGUID", "authorUserLongName", "authorUserLogin", "authorUserAvatarGUID", "isApproved", "approvedByUserGUID", "approvedByUserLongName", "approvedByUserLogin", "approvalTime", "createTime", "isRead"])
class EntityComment(object): pass

@registry.registered("com.apple.Session", ["guid", "user", "authToken", "createTime", "updateTime", "data"])
class Session(object): pass

@registry.registered("com.apple.Entity",
                     ["guid", "tinyID", "shortName", "longName", "description",
                      "themeInfo", "revision", "createTime", "updateTime",
                      "lastActivityTime", "extendedAttributes",
                      "privateAttributes", "createdByUserGUID",
                      "updatedByUserGUID", "lastActivityUserGUID",
                      "isDeleted", "tags", "ownerGUID", "ownerType",
                      "isFavorite", "isMyPage", "isHidden", "isWatched",
                      "isPermanentlyDeleted", "parentGUIDs", "avatarGUID",
                      "isBlogEnabled", "blogGUID", "containerGUID"])
class Entity(object): pass

@registry.registered("com.apple.entity.Wiki", ["detailPageGUID"])
class WikiEntity(Entity): pass

@registry.registered("com.apple.entity.Blog", [])
class BlogEntity(Entity): pass

@registry.registered("com.apple.entity.Document", [])
class DocumentEntity(Entity): pass

@registry.registered("com.apple.entity.Page", ["isDetailPage", "isBlogpost"])
class PageEntity(DocumentEntity): pass

@registry.registered("com.apple.entity.User", ["login", "externalID", "preferredEmailHash", "detailPageGUID", "isAuthenticated", "activityTime", "isAdmin"])
class UserEntity(Entity): pass

@registry.registered("com.apple.entity.FileData", ["size", "uti", "contentType", "dataURI", "mediaType", "contentType", "content", "isQuickLookable", "iconGUID", "thumbnailGUIDs", "previewGUIDs"])
class FileDataEntity(Entity): pass

@registry.registered("com.apple.entity.File", ["mediaType", "contentType", "content", "dataGUID", "isQuickLookable", "iconGUID", "thumbnailGUIDs", "previewGUIDs"])
class FileEntity(Entity): pass

@registry.registered("com.apple.entity.SavedQuery", ["query"])
class SavedQueryEntity(Entity): pass

@registry.registered("com.apple.entity.BotGroup", ["isDefault"])
class BotGroupEntity(Entity): pass

@registry.registered("com.apple.entity.SCMRepositoryGroup", ["isDefault"])
class SCMRepositoryGroupEntity(Entity): pass

@registry.registered("com.apple.entity.Bot", ["latestRunSCMCommits", "latestRunStatus", "latestRunSubStatus", "latestSuccessfulBotRunGUID", "latestFailedBotRunGUID", "notifyCommitterOnSuccess", "notifyCommitterOnFailure"])
class BotEntity(Entity): pass

@registry.registered("com.apple.entity.BotRun", ["status", "subStatus", "buildOutputGUID", "xcsbuilddOutputGUID", "scmOutputLogMap", "xcodeResultBundlePlistGUID", "xcodeTestSummariesPlistGUID", "archiveGUID", "productGUID", "startTime", "endTime", "integration", "scmCommitGUIDs", "xcsbuilddOutputGUID", "scmCommitHistoryPlistGUID", "productsPruned", "logsPruned"])
class BotRunEntity(Entity): pass

@registry.registered("com.apple.entity.SCMCommit", ["scmType", "scmURI", "commitID", "authorName", "authorEmail", "message", "time"])
class SCMCommitEntity(Entity): pass

@registry.registered("com.apple.entity.ADCTeam", ["adcTeamID", "adcTeamName", "adcTeamStatus", "adcTeamJoinStatus", "adcTeamEnabledPrograms", "adcTeamIdentityCertificateCredentialGUID"])
class ADCTeam(object): pass

@registry.registered("com.apple.entity.ADCDevice", ["adcDeviceName", "adcDeviceModel", "adcDeviceModelCode", "adcDeviceModelUTI", "adcDeviceSoftwareVersion", "adcDeviceECID", "adcDeviceUDID", "adcDeviceSerialNumber", "adcDeviceTeamIDs", "adcDeviceUseForDevelopment", "adcDeviceLocation", "adcDeviceIsConnected", "adcDeviceIsSupported"])
class ADCDevice(object): pass

@registry.registered("com.apple.XCWorkSchedule", ["guid", "entityGUID", "isEnabled", "workQueueName", "workData", "recurrences", "scheduleType"])
class XCWorkSchedule(object): pass

@registry.registered("com.apple.XCWorkScheduleRecurrence", ["guid", "scheduleGUID", "startTime", "repeatInterval"])
class XCWorkScheduleRecurrence(object): pass

@registry.registered("com.apple.EntityChangeSet", ["changeGUID", "changeAction", "changeType", "entityGUID", "entityRevision", "entityType", "changeComment", "changeUserGUID", "changeUserLogin", "force", "changes"])
class EntityChangeSet(object): pass

@registry.registered("com.apple.Relationship", ["guid", "sourceEntityGUID", "targetEntityGUID", "relationshipType"])
class Relationship(object): pass

@registry.registered("com.apple.SearchResults", ["results"])
class SearchResults(object): pass

@registry.registered("com.apple.query.SearchQuery", ["fields", "entityTypes", "onlyDeleted", "subFields", "sortFields", "startIndex", "resultsLimit", "child"])
class SearchQuery(object): pass

@registry.registered("com.apple.query.MatchNode", ["field", "value", "notFlag", "exactFlag", "op", "numericFlag"])
class MatchNode(object): pass

@registry.registered("com.apple.query.NotNode", ["child"])
class NotNode(object): pass

@registry.registered("com.apple.query.AndNode", ["children"])
class AndNode(object): pass

@registry.registered("com.apple.query.OrNode", ["children"])
class OrNode(object): pass

if __name__ == '__main__':
    print repr(ServiceClient().blockingExecute("AuthService", "ping"))
    @reactor.callWhenRunning
    @inlineCallbacks
    def main():
        try:
            result = yield ServiceClient().asyncExecute("ContentService", "randomEntity")
        except:
            traceback.print_exc()
        else:
            print repr(result)
        finally:
            reactor.stop()
    reactor.run()
