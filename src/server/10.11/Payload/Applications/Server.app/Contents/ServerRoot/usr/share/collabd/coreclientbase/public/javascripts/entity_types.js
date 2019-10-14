// Copyright (c) 2009-2014 Apple Inc. All Rights Reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.


//= require "./mvc/model.js"
//= require "./entity_mixins.js"

CC.EntityTypes = CC.EntityTypes || new Object();

// Sessions (read-only).

CC.EntityTypes.Session = Class.create(CC.Mvc.Model, {
	type: 'com.apple.Session',
	user: null,
	authToken: null,
	createTime: null,
	updateTime: null,
	data: null
});

CC.EntityTypes.DateTime = Class.create(CC.Mvc.Model, {
	type: 'com.apple.DateTime',
	epochValue: 0,
	isoValue:"",
	initialize: function(inDate) {
		// given the string, get epoch
		this.isoValue = inDate.toISOString();
		this.epochValue = inDate.getTime() / 1000;
	}
});

// Entity (changeset-aware).

CC.EntityTypes.BaseEntity = Class.create(CC.Mvc.Model, CC.Mvc.Mixins.ChangeAware, {
	_type: 'com.apple.Entity',
	mChangesetAttributes: [],
	initialize: function($super) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		this.type = this._type;
		if (!this.guid) {
			var generator = new CC.GuidBuilder();
			this.guid = generator.toString();
		}
	}
});

CC.EntityTypes.WikiEntity = Class.create(CC.EntityTypes.BaseEntity, CC.EntityMixins.ContainerWithComments, {
	_type: 'com.apple.entity.Wiki',
	mChangesetAttributes: 'description extendedAttributes longName themeInfo detailPageGUID blogGUID'.w()
});

CC.EntityTypes.UserEntity = Class.create(CC.EntityTypes.BaseEntity, {
	_type: 'com.apple.entity.User',
	mChangesetAttributes: 'privateAttributes extendedAttributes longName themeInfo detailPageGUID blogGUID preferredEmailHash'.w()
});

CC.EntityTypes.BlogEntity = Class.create(CC.EntityTypes.BaseEntity, CC.EntityMixins.ContainerWithComments, {
	_type: 'com.apple.entity.Blog',
	mChangesetAttributes: 'extendedAttributes longName'.w()
});

CC.EntityTypes.PageEntity = Class.create(CC.EntityTypes.BaseEntity, {
	_type: 'com.apple.entity.Page',
	mChangesetAttributes: 'extendedAttributes longName'.w()
});

CC.EntityTypes.FileEntity = Class.create(CC.EntityTypes.BaseEntity, {
	_type: 'com.apple.entity.File',
	mChangesetAttributes: 'extendedAttributes longName'.w()
});

CC.EntityTypes.FileDataEntity = Class.create(CC.EntityTypes.BaseEntity, {
	_type: 'com.apple.entity.FileData'
});

CC.EntityTypes.EntityACL = Class.create(CC.Mvc.Model, {
	_type: 'com.apple.EntityACL',
	allow: true,
	action: 'none',
	userExternalID: null,
	userLogin: null,
	userLongName: null,
	initialize: function($super) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		this.type = this._type;
	}
});

// Activity (read-only).

CC.EntityTypes.UserActivity = Class.create(CC.Mvc.Model, {
	type: 'com.apple.UserActivity',
	// Synthesize a guid property so we can stash activity objects in the store.
	guid: null,
	// Model attributes.
	userGUID: null,
	action: null,
	entityGUID: null,
	entityRevision: null,
	data: null,
	actionTime: null,
	containerGUID: null,
	ownerGUID: null,
	subFields: null,
	isUnread: null,
	isFavorite: null,
	initialize: function($super) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		// Synthesize a guid for this model by hashing the userGUID, entityGUID, action and actionTime together.
		this.guid = "%@-%@-%@-%@".fmt(this.userGUID, this.entityGUID, this.action, (this.actionTime.getTime() / 1000));
	}
});

// Search.

CC.EntityTypes.SearchResult = Class.create(CC.Mvc.Model, {
	type: 'com.apple.SearchResult',
	guid: null,
	results: []
});

CC.EntityTypes.SavedQuery = Class.create(CC.Mvc.Model, {
	_type: 'com.apple.entity.SavedQuery',
	guid: null,
	longName: "Untitled Search",
	query: {},
	initialize: function($super) {
		this.type = 'com.apple.entity.SavedQuery',
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
	}
});

// Related entity.

CC.EntityTypes.RelatedRelationship = Class.create(CC.Mvc.Model, {
	type: 'com.apple.relationship.Related',
	guid: null,
	targetEntityGUID: null,
	sourceEntityGUID: null
});

// Entity changeset.

CC.EntityTypes.EntityChangeSet = Class.create(CC.Object, {
	changeGUID: null,
	changeAction: null,
	changeType: null,
	entityGUID: null,
	entityRevision: null,
	entityType: null,
	changeComment: null,
	changeUserGUID: null,
	changeUserLogin: null,
	force: false,
	changes: null,
	initialize: function($super) {
		this.type = "com.apple.EntityChangeSet";
		this.changes = [];
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
	}
});

// Service request/response classes.

CC.EntityTypes.ServiceRequest = Class.create(CC.Object, {
	adminAuthorizationRef: null,
	sessionGUID: null,
	serviceName: null,
	methodName: null,
	arguments: null,
	expandReferencedObjects: null,
	subpropertyPaths: null,
	referencedPathsToFollow: null,
	clientURL: undefined,
	hints: null,
	initialize: function($super) {
		this.type = "com.apple.ServiceRequest";
		this.arguments = [];
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
	}
});

CC.EntityTypes.ServiceResponse = Class.create(CC.Object, {
	succeeded: false,
	response: null,
	responseStatus: null,
	referencedObjects: null
});

CC.EntityTypes.BatchServiceRequest = Class.create(CC.Object, {
	requests: null,
	initialize: function($super) {
		this.type = "com.apple.BatchServiceRequest";
		this.requests = [];
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
	}
});

CC.EntityTypes.BatchServiceResponse = Class.create(CC.Object, {
	responses: null
});

CC.EntityTypes.PaginationRequest = Class.create(CC.Object, {
	serviceRequest: null,
	guid: null,
	startIndex: null,
	resultsLimit: null,
	initialize: function($super) {
		this.type = "com.apple.PaginationRequest"
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
	}
});

CC.EntityTypes.PaginatedResult = Class.create(CC.Object, {
	guid: null,
	startIndex: null,
	results: null,
	total: null,
	initialize: function($super) {
		this.type = "com.apple.PaginatedResult",
		this.results = [];
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
	}
});

// Entity types global.

CC.EntityTypes.SharedInstance = Class.createWithSharedInstance('entity_types');
CC.EntityTypes.SharedInstance.prototype = {
	initialize: function() {},
	typeMap: {
		'com.apple.entity.Wiki': CC.EntityTypes.WikiEntity,
		'com.apple.entity.Page': CC.EntityTypes.PageEntity,
		'com.apple.entity.User': CC.EntityTypes.UserEntity,
		'com.apple.entity.Blog': CC.EntityTypes.BlogEntity,
		'com.apple.entity.File': CC.EntityTypes.FileEntity,
		'com.apple.entity.FileData': CC.EntityTypes.FileDataEntity,
		'com.apple.entity.EntityACL': CC.EntityTypes.EntityACL,
		'com.apple.UserActivity': CC.EntityTypes.UserActivity,
		'com.apple.SearchResult': CC.EntityTypes.SearchResult,
		'com.apple.entity.SavedQuery': CC.EntityTypes.SavedQuery,
		'com.apple.RelatedRelationship': CC.EntityTypes.RelatedRelationship,
		'com.apple.entity.Bot': CC.EntityTypes.BotEntity,
		'com.apple.entity.BotRun': CC.EntityTypes.BotRunEntity,
		'com.apple.entity.SCMCommit': CC.EntityTypes.SCMCommitEntity,
		'com.apple.XCWorkSchedule': CC.EntityTypes.XCWorkSchedule,
		'com.apple.XCWorkScheduleRecurrence': CC.EntityTypes.XCWorkScheduleRecurrence
	},
	prototypeForTypeName: function(inName) {
	    var val = this.typeMap[inName];
	    if (!val) val = CC.EntityTypes.BaseEntity;
		return val;
	},
	entityForHash: function(inHash) {
		var proto = this.prototypeForTypeName(inHash['type']);
		return new proto(inHash);
	}
};

// Returns a localized container string.  E.g. in Andrew's Documents, in Example Wiki.

var localizedContainerString = function(inContainerName, inContainerType) {
	var localized = "";
	if (!inContainerName || !inContainerType) return localized;
	if (inContainerType == "com.apple.entity.User") {
		localized = "_General.Container.Subtitle.User".loc(inContainerName);
	} else if (inContainerType == "com.apple.entity.Blog") {
		localized = "_General.Container.Subtitle.Blog".loc(inContainerName);
	} else if (inContainerType == "com.apple.entity.Wiki") {
		localized = "_General.Container.Subtitle.Wiki".loc(inContainerName);
	}
	return localized;
};

// Returns an avatar icon for a given entity.  Accepts an optional inOptIgnoreAvatarsAndPreviews argument
// which when passed as true, always returns a generic CoreClientBase icon.  Accepts optional width and
// height parameters, and a HIDPI flag.

var iconURIForEntity = function(inEntity, inOptReturnGenericIconsOnly, inOptTargetWidth, inOptTargetHeight, inOptHIDPI) {
	var sizeString = "32x32";
	var hidpi = (inOptHIDPI != undefined ? inOptHIDPI : (window.devicePixelRatio >= 2));
	if (inOptTargetWidth || inOptTargetHeight) {
		sizeString = "%@x%@".fmt(inOptTargetWidth, inOptTargetHeight);
	}
	// Build the iconURI first using the size.
	var iconURI = "/__collabd/coreclientbase/stylesheets/cc/img/document_%@".fmt(sizeString);
	if (inEntity.type == "com.apple.entity.Wiki" || inEntity.type == "com.apple.entity.User") {
		// Do we have a direct avatar? Otherwise fall back on a default.
		if (inEntity.avatarGUID && !inOptReturnGenericIconsOnly) {
			return "%@/files/download/%@".fmt(env().root_path, inEntity.avatarGUID);
		} else {
			if (inEntity.type == "com.apple.entity.Wiki") {
				iconURI = "/__collabd/coreclientbase/stylesheets/cc/img/wiki_%@".fmt(sizeString);
			} else if (inEntity.type == "com.apple.entity.User") {
				iconURI = "/__collabd/coreclientbase/stylesheets/cc/img/user_%@".fmt(sizeString);
			}
		}
	}
	if (inEntity.type == "com.apple.entity.Page" || inEntity.type == "com.apple.entity.File") {
		var guid = (inEntity.avatarGUID || inEntity.iconGUID);
		if (!inOptReturnGenericIconsOnly && guid) {
			return '%@/files/download/%@'.fmt(env().root_path, guid);
		} else {
			if (inEntity.type == "com.apple.entity.Page") {
				iconURI = "/__collabd/coreclientbase/stylesheets/cc/img/page_%@".fmt(sizeString);
			} else if (inEntity.type == "com.apple.entity.File") {
				iconURI = "/__collabd/coreclientbase/stylesheets/cc/img/file_%@".fmt(sizeString);
			}
		}
	}
	if (inEntity.type == "com.apple.entity.Bot") {
		iconURI = "/__collabd/coreclientbase/stylesheets/cc/img/bot_%@".fmt(sizeString);
	}
	if (hidpi) iconURI += "@2x";
	iconURI += ".png";
	return iconURI;
};

var iconURIForEntityType = function(inEntityType, inOptTargetWidth, inOptTargetHeight, inOptHIDPI) {
	var fakeEntity = {type: (inEntityType || 'com.apple.Entity')};
	return iconURIForEntity(fakeEntity, true, inOptTargetWidth, inOptTargetHeight, inOptHIDPI);
};

var getOwnerGuidFromEntityParentGuids = function(inEntity, inLevel) {
	if ( inLevel && inLevel > 0) {
		return ((inEntity.parentGUIDs.length-(inLevel+1) > 0) ? inEntity.parentGUIDs[inEntity.parentGUIDs.length -(inLevel+1)] : '');
	}
	else {
		return inEntity.ownerGUID;
	}
}
