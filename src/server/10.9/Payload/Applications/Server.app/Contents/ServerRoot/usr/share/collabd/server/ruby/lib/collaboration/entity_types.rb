##
# Copyright (c) 2009-2014 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#
# IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
# of the Apple Software and is subject to the terms and conditions of the Apple
# Software License Agreement accompanying the package this file is part of.
##

require 'rubygems'
require 'time'
require 'collaboration/type_registry'
require 'collaboration/container_with_comments'
require 'collaboration/container_with_blog'
require 'collaboration/container_with_calendar'
require 'collaboration/container_with_avatar'
require 'collaboration/container_with_theme'

module Collaboration

  class XMLCodable
    def self.type
      Collaboration::CoderTypeRegistry.lookupName(self)
    end

    def xml_properties
      []
    end

    def json_properties
      xml_properties
    end

    def to_h
      h = Hash[*[xml_properties.zip(xml_properties.map{|x| send(x)})].flatten(2)]
      h['type'] ||= Collaboration::CoderTypeRegistry.lookupName(self.class)
      return h
    end

    def to_json_h
      h = Hash[*[json_properties.zip(json_properties.map{|x| send(x)})].flatten(2)]
      h['type'] ||= Collaboration::CoderTypeRegistry.lookupName(self.class)
      return h
    end

    def to_json(*a)
      to_json_h.to_json(*a)
    end

  end

  class PaginatedResult < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.PaginatedResult', self)
    def xml_properties
      super + [:guid, :startIndex, :results, :total]
    end
    attr_accessor :guid, :startIndex, :results, :total
  end

  class PaginationRequest < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.PaginationRequest', self)
    def xml_properties
      super + [:serviceRequest, :startIndex, :resultsLimit, :guid]
    end
    attr_accessor :serviceRequest, :startIndex, :resultsLimit, :guid
  end

  class Notification < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.Notification', self)
    def xml_properties
      super + [:guid, :userGUID, :subscribedUserGUID, :subscribedUserEmail, :sendingUserGUID, :notificationType, :entityGUID, :ownerGUID, :timestamp, :data]
    end
    attr_accessor :guid, :userGUID, :subscribedUserGUID, :subscribedUserEmail, :sendingUserGUID, :notificationType, :entityGUID, :ownerGUID, :timestamp, :data
  end

  class EntityPlaceholder < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.EntityPlaceholder', self)
    def xml_properties
      super + [:guid, :tinyID, :reason]
    end
    attr_accessor :guid, :tinyID, :reason
  end

  class EntityACL < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.EntityACL', self)
    def xml_properties
      super + [:entityGUID, :userLogin, :userExternalID, :userLongName, :action, :allow]
    end
    attr_accessor :entityGUID, :userLogin, :userExternalID, :userLongName, :action, :allow
  end

  class UserActivity < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.UserActivity', self)
    def xml_properties
      super + [:userGUID, :action, :entityGUID, :entityRevision, :data, :actionTime, :containerGUID, :ownerGUID, :subFields, :isUnread, :isFavorite]
    end
    attr_accessor :userGUID, :action, :entityGUID, :entityRevision, :data, :actionTime, :containerGUID, :ownerGUID, :subFields, :isUnread, :isFavorite
  end

  class UserActivityQuery < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.UserActivityQuery', self)
    def xml_properties
      super + [:actions, :entityTypes, :userGUID, :containerGUID, :ownerGUID, :subFields, :onlyWatched, :onlyFavorites, :onlyUnread, :startIndex, :resultsLimit, :startTime]
    end
    attr_accessor :actions, :entityTypes, :userGUID, :containerGUID, :ownerGUID, :subFields, :onlyWatched, :onlyFavorites, :onlyUnread, :startIndex, :resultsLimit, :startTime
  end

  class EntityComment < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.EntityComment', self)
    def xml_properties
      super + [:guid, :parentGUIDs, :entityGUID, :entityLongName, :entityShortName, :entityType, :title, :body, :authorUserGUID, :authorUserLongName, :authorUserLogin, :authorUserAvatarGUID, :isApproved, :approvedByUserGUID, :approvedByUserLongName, :approvedByUserLogin, :approvalTime, :createTime, :isRead]
    end
    attr_accessor :guid, :parentGUIDs, :entityGUID, :entityLongName, :entityShortName, :entityType, :title, :body, :authorUserGUID, :authorUserLongName, :authorUserLogin, :authorUserAvatarGUID, :isApproved, :approvedByUserGUID, :approvedByUserLongName, :approvedByUserLogin, :approvalTime, :createTime, :isRead
  end

  class BatchServiceRequest < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.BatchServiceRequest', self)
    def xml_properties
      super + [:requests]
    end
    attr_accessor :requests

    def initialize(reqs=[])
      @requests = reqs
    end

    def method_missing(sym, *args)
      reqtmpl = @requests[0] || ServiceRequest.new
      if reqtmpl.respond_to?(sym)
        if sym.to_s.end_with?('=')
          @requests.each{|req| req.send(sym, *args) }
        else
          @requests.each{|req| return req.send(sym) }
        end
      else
        super(sym, *args)
      end
    end
  end

  class BatchServiceResponse < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.BatchServiceResponse', self)
    def xml_properties
      super + [:responses]
    end
    attr_accessor :responses

    def initialize(resps=[])
      @responses = resps
    end
  end

  class ServiceRequest < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.ServiceRequest', self)
    def xml_properties
      super + [:adminAuthorizationRef, :sessionGUID, :sandboxTuple, :serviceName, :methodName, :arguments, :expandReferencedObjects, :subpropertyPaths, :referencedPathsToFollow, :clientURL, :hints]
    end
    attr_accessor :adminAuthorizationRef, :sessionGUID, :sandboxTuple, :serviceName, :methodName, :arguments, :expandReferencedObjects, :subpropertyPaths, :referencedPathsToFollow, :clientURL, :hints

    def initialize
      @arguments = []
      @hints = {}
    end
  end

  class ServiceResponse < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.ServiceResponse', self)
    def xml_properties
      super + [:succeeded, :response, :responseStatus, :referencedObjects, :executionTime]
    end
    attr_accessor :succeeded, :response, :responseStatus, :referencedObjects, :executionTime

    def initialize
      @referencedObjects = []
    end
  end

  class CSDateTime < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.DateTime', self)
    def xml_properties
      super + [:epochValue, :isoValue]
    end
    attr_accessor :epochValue, :isoValue

    def initialize(epoch=nil)
      if epoch
        @epochValue = epoch
        @isoValue = to_time.iso8601
      end
    end

    def to_time
      Time.at(epochValue)
    end

    def self.method_missing(sym, *args)
      return CSDateTime.new(Time.send(sym, *args).to_f)
    end

    def method_missing(sym, *args)
      to_time.send(sym, *args)
    end

    def to_s
      # strftime doesn't support milliseconds in Ruby 1.8. :(
      t=to_time
      t.strftime('%Y-%m-%dT%H:%M:%S.') + (t.tv_usec/1000).to_s + t.strftime('%z')
    end

    def inspect
      '#<CSDateTime: ' + to_s + ' (epoch=' + epochValue.to_s + ')>'
    end
  end

  class Session < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.Session', self)
    def xml_properties
      super + [:guid, :user, :authToken, :createTime, :updateTime, :data]
    end
    attr_accessor :guid, :user, :authToken, :createTime, :updateTime, :data
  end

  class Entity < XMLCodable
    include Collaboration::ContainerWithAvatar

    Collaboration::CoderTypeRegistry.registerClass('com.apple.Entity', self)
    def xml_properties
      super + [:guid, :tinyID, :shortName, :longName, :description, :themeInfo, :revision, :createTime, :updateTime, :lastActivityTime, :type, :extendedAttributes, :privateAttributes, :createdByUserGUID, :updatedByUserGUID, :lastActivityUserGUID, :isDeleted, :tags, :ownerGUID, :ownerType, :isFavorite, :isMyPage, :isHidden, :isWatched, :isPermanentlyDeleted, :parentGUIDs, :avatarGUID, :isBlogEnabled, :blogGUID, :containerGUID]
    end
    def json_properties
      super + [:entityURL]
    end
    attr_accessor :guid, :tinyID, :shortName, :longName, :description, :themeInfo, :revision, :createTime, :updateTime, :lastActivityTime, :type, :extendedAttributes, :privateAttributes, :createdByUserGUID, :updatedByUserGUID, :lastActivityUserGUID, :isDeleted, :tags, :ownerGUID, :ownerType, :isFavorite, :isMyPage, :isHidden, :isWatched, :isPermanentlyDeleted, :parentGUIDs, :avatarGUID, :isBlogEnabled, :blogGUID, :containerGUID
    # convenience accessors for CoreClient
    attr_accessor :comments, :acls, :relationshipGUID, :entityURL
    # sub properties helpers
    attr_accessor :owner, :createdByUser, :updatedByUser

    def initialize
      self.type = Collaboration::CoderTypeRegistry.lookupName(self.class)
      self.extendedAttributes = {}
      self.isBlogEnabled = false
    end

    def property_value_or_nil(property_name)
      self.respond_to?(property_name) ? self.send(property_name) : nil
    end

  end

  class WikiEntity < Entity
    include Collaboration::ContainerWithComments
    include Collaboration::ContainerWithBlog
    include Collaboration::ContainerWithCalendar
    include Collaboration::ContainerWithTheme

    Collaboration::CoderTypeRegistry.registerClass('com.apple.entity.Wiki', self)
    def xml_properties
      super + [:detailPageGUID]
    end
    attr_accessor :detailPageGUID
  end

  class BlogEntity < Entity
    include Collaboration::ContainerWithComments
    Collaboration::CoderTypeRegistry.registerClass('com.apple.entity.Blog', self)
  end

  class DocumentEntity < Entity
    Collaboration::CoderTypeRegistry.registerClass('com.apple.entity.Document', self)
  end

  class PageEntity < DocumentEntity
    Collaboration::CoderTypeRegistry.registerClass('com.apple.entity.Page', self)
    def xml_properties
      super + [:isDetailPage, :isBlogpost]
    end
    def json_properties
      super + [:lastUpdatedByUserHeader]
    end

    def initialize
      super
      self.isDetailPage = false
      self.isBlogpost = false
    end

    attr_accessor :isDetailPage, :isBlogpost, :lastUpdatedByUserHeader
  end

  class UserEntity < Entity
    include Collaboration::ContainerWithComments
    include Collaboration::ContainerWithBlog
    include Collaboration::ContainerWithTheme

    Collaboration::CoderTypeRegistry.registerClass('com.apple.entity.User', self)
    def xml_properties
      super + [:login, :externalID, :preferredEmailHash, :detailPageGUID, :isAuthenticated, :activityTime]
    end
    attr_accessor :login, :externalID, :preferredEmailHash, :detailPageGUID, :isAuthenticated, :activityTime, :isAdmin

    def preferred_email
      self.privateAttributes ||= {}
      self.privateAttributes['preferredEmailAddress'] || self.privateAttributes['defaultDirectoryEmailAddress']
    end
    def preferred_email=(value)
      self.privateAttributes ||= {}
      self.privateAttributes['preferredEmailAddress'] = value
    end

  end

  class FileDataEntity < Entity
    Collaboration::CoderTypeRegistry.registerClass('com.apple.entity.FileData', self)
    def xml_properties
      super + [:size, :uti, :contentType, :dataURI, :mediaType, :contentType, :content, :isQuickLookable, :iconGUID, :thumbnailGUIDs, :previewGUIDs]
    end

    attr_accessor :size, :uti, :contentType, :dataURI, :mediaType, :contentType, :content, :isQuickLookable, :iconGUID, :thumbnailGUIDs, :previewGUIDs

    def to_json(*a)
       h = Hash[*[json_properties.zip(json_properties.map{|x|
         unless x == :content # don't send content for files right now
           send(x)
          end
         })].flatten(2)]
       h['type'] ||= Collaboration::CoderTypeRegistry.lookupName(self.class)
       return h.to_json(*a)
    end

    def downloadURL
      return "/wiki/files/download/#{self.guid}"
    end

    def forceDownloadURL
      return "/wiki/files/download/#{self.guid}"
    end

  end

  class FileEntity < DocumentEntity
    Collaboration::CoderTypeRegistry.registerClass('com.apple.entity.File', self)
    def xml_properties
      super + [:mediaType, :contentType, :content, :dataGUID, :isQuickLookable, :iconGUID, :thumbnailGUIDs, :previewGUIDs]
    end

    attr_accessor :mediaType, :contentType, :content, :dataGUID, :isQuickLookable, :iconGUID, :thumbnailGUIDs, :previewGUIDs

    def to_json(*a)
       h = Hash[*[json_properties.zip(json_properties.map{|x|
         unless x == :content # don't send content for files right now
           send(x)
          end
         })].flatten(2)]
       h['type'] ||= Collaboration::CoderTypeRegistry.lookupName(self.class)
       return h.to_json(*a)
    end

    def downloadURL
      return "/wiki/files/download/#{self.dataGUID}"
    end

    def forceDownloadURL
      return "/wiki/files/download/#{self.dataGUID}"
    end

  end

  class SavedQueryEntity < Entity
    Collaboration::CoderTypeRegistry.registerClass('com.apple.entity.SavedQuery', self)
    def xml_properties
      super + [:query]
    end
    attr_accessor :query
  end

  class BotGroup < Entity
    Collaboration::CoderTypeRegistry.registerClass('com.apple.entity.BotGroup', self)
    def xml_properties
      super + [:isDefault]
    end
    attr_accessor :isDefault
  end

  class SCMRepositoryGroup < Entity
    Collaboration::CoderTypeRegistry.registerClass('com.apple.entity.SCMRepositoryGroup', self)
    def xml_properties
      super + [:isDefault]
    end
    attr_accessor :isDefault
  end

  class BotEntity < Entity
    Collaboration::CoderTypeRegistry.registerClass('com.apple.entity.Bot', self)
    def xml_properties
      super + [:latestRunSCMCommits, :latestRunStatus, :latestRunSubStatus, :latestSuccessfulBotRunGUID, :latestFailedBotRunGUID, :notifyCommitterOnSuccess, :notifyCommitterOnFailure]
    end
    attr_accessor :latestRunSCMCommits, :latestRunStatus, :latestRunSubStatus, :latestSuccessfulBotRunGUID, :latestFailedBotRunGUID, :notifyCommitterOnSuccess, :notifyCommitterOnFailure
  end

  class BotRunEntity < Entity
    Collaboration::CoderTypeRegistry.registerClass('com.apple.entity.BotRun', self)
    def xml_properties
      super + [:status, :subStatus, :buildOutputGUID, :xcsbuilddOutputGUID, :scmOutputLogMap, :xcodeResultBundlePlistGUID, :xcodeTestSummariesPlistGUID, :archiveGUID, :productGUID, :startTime, :endTime, :integration, :scmCommitGUIDs, :xcsbuilddOutputGUID, :scmCommitHistoryPlistGUID, :productsPruned, :logsPruned]
    end
    attr_accessor :status, :subStatus, :buildOutputGUID, :xcsbuilddOutputGUID, :scmOutputLogMap, :xcodeResultBundlePlistGUID, :xcodeTestSummariesPlistGUID, :archiveGUID, :productGUID, :startTime, :endTime, :integration, :scmCommitGUIDs, :xcsbuilddOutputGUID, :scmCommitHistoryPlistGUID, :productsPruned, :logsPruned
  end

  class SCMCommitEntity < Entity
    Collaboration::CoderTypeRegistry.registerClass('com.apple.entity.SCMCommit', self)
    def xml_properties
      super + [:scmType, :scmURI, :commitID, :authorName, :authorEmail, :message, :time]
    end
    attr_accessor :scmType, :scmURI, :commitID, :authorName, :authorEmail, :message, :time
  end

  class ADCTeamEntity < Entity
    Collaboration::CoderTypeRegistry.registerClass('com.apple.entity.ADCTeam', self)
    def xml_properties
      super + [:adcTeamID, :adcTeamName, :adcTeamStatus, :adcTeamJoinStatus, :adcTeamEnabledPrograms, :adcTeamIdentityCertificateCredentialGUID]
    end
    attr_accessor :adcTeamID, :adcTeamName, :adcTeamStatus, :adcTeamJoinStatus, :adcTeamEnabledPrograms, :adcTeamIdentityCertificateCredentialGUID
  end

  class ADCDeviceEntity < Entity
    Collaboration::CoderTypeRegistry.registerClass('com.apple.entity.ADCDevice', self)
    def xml_properties
      super + [:adcDeviceName, :adcDeviceModel, :adcDeviceModelCode, :adcDeviceModelUTI, :adcDeviceSoftwareVersion, :adcDeviceECID, :adcDeviceUDID, :adcDeviceSerialNumber, :adcDeviceTeamIDs, :adcDeviceUseForDevelopment, :adcDeviceLocation, :adcDeviceIsConnected, :adcDeviceIsSupported]
    end
    attr_accessor :adcDeviceName, :adcDeviceModel, :adcDeviceModelCode, :adcDeviceModelUTI, :adcDeviceSoftwareVersion, :adcDeviceECID, :adcDeviceUDID, :adcDeviceSerialNumber, :adcDeviceTeamIDs, :adcDeviceUseForDevelopment, :adcDeviceLocation, :adcDeviceIsConnected, :adcDeviceIsSupported
  end

  class XCWorkQueueItem < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.XCWorkQueueItem', self)
    def xml_properties
      super + [:guid, :status, :assignee, :createTime, :updateTime, :data, :entityGUID, :queueName]
    end
    attr_accessor :guid, :status, :assignee, :createTime, :updateTime, :data, :entityGUID, :queueName
  end

  class XCWorkSchedule < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.XCWorkSchedule', self)
    def xml_properties
      super + [:guid, :entityGUID, :isEnabled, :workQueueName, :workData, :recurrences, :scheduleType]
    end
    attr_accessor :guid, :entityGUID, :isEnabled, :workQueueName, :workData, :recurrences, :scheduleType
  end

  class XCWorkScheduleRecurrence < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.XCWorkScheduleRecurrence', self)
    def xml_properties
      super + [:guid, :scheduleGUID, :startTime, :repeatInterval]
    end
    attr_accessor :guid, :scheduleGUID, :startTime, :repeatInterval
  end

  class EntityChangeSet < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.EntityChangeSet', self)
    def xml_properties
      super + [:changeGUID, :changeAction, :changeType, :entityGUID, :entityRevision, :entityType, :changeComment, :changeUserGUID, :changeUserLogin, :force, :changes]
    end
    attr_accessor :changeGUID, :changeAction, :changeType, :entityGUID, :entityRevision, :entityType, :changeComment, :changeUserGUID, :changeUserLogin, :force, :changes
  end

  class Relationship < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.Relationship', self)
    def xml_properties
      super + [:guid, :sourceEntityGUID, :targetEntityGUID, :relationshipType]
    end
    attr_accessor :guid, :sourceEntityGUID, :targetEntityGUID, :relationshipType
  end

  class SearchResults < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.SearchResults', self)
    def xml_properties
      super + [:results]
    end
    attr_accessor :results
  end

  class SearchQuery < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.query.SearchQuery', self)
    def xml_properties
      super + [:fields, :entityTypes, :onlyDeleted, :subFields, :sortFields, :startIndex, :resultsLimit, :child]
    end
    attr_accessor :fields, :entityTypes, :onlyDeleted, :subFields, :sortFields, :startIndex, :resultsLimit, :child

    def initialize(_child=nil)
      self.child = _child
      self.fields = []
      self.entityTypes = []
      self.subFields = {}
      self.sortFields = []
    end
  end

  class MatchNode < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.query.Match', self)
    def xml_properties
      super + [:field, :value, :notFlag, :exactFlag, :op, :numericFlag]
    end
    attr_accessor :field, :value, :notFlag, :exactFlag, :op, :numericFlag

    def initialize(_value=nil, _field=nil, _exactFlag=false)
      if _value.kind_of?(Hash) then
        self.field = _value.keys[0]
        self.value = _value.values[0]
      else
        self.value = _value
        self.field = _field
	self.exactFlag = _exactFlag
      end
      self.notFlag = false
    end
  end

  class NotNode < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.query.Not', self)
    def xml_properties
      super + [:child]
    end
    attr_accessor :child

    def initialize(_child=nil)
      self.child = _child
    end
  end

  class AndNode < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.query.And', self)
    def xml_properties
      super + [:children]
    end
    attr_accessor :children

    def initialize(_children=[])
      self.children = _children
    end
  end

  class OrNode < XMLCodable
    Collaboration::CoderTypeRegistry.registerClass('com.apple.query.Or', self)
    def xml_properties
      super + [:children]
    end
    attr_accessor :children

    def initialize(_children=[])
      self.children = _children
    end
  end

end


