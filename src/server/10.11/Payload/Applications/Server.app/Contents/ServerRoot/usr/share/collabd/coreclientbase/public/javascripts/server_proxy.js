// Copyright (c) 2009-2015 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

//= require "./service_client.js"
//= require "./ext/string.js"
//= require "./store/core.js"
//= require "./entity_types.js"

CC.ServerProxy = CC.ServerProxy || new Object();

// A server proxy shared instance.

CC.ServerProxy.SharedInstance = Class.createWithSharedInstance('server_proxy');
CC.ServerProxy.SharedInstance.prototype = {
	mDefaultSubpropertyPaths: {
		'containerGUID.longName': 'container.longName',
		'containerGUID.shortName': 'container.shortName',
		'containerGUID.type': 'container.type',
		'containerGUID.avatarGUID': 'container.avatarGUID',
		'containerGUID.tinyID': 'container.tinyID',
		'containerGUID.isHidden': 'container.isHidden',
		'updatedByUserGUID.longName': 'updatedByUser.longName',
		'updatedByUserGUID.shortName': 'updatedByUser.shortName',
		'updatedByUserGUID.type': 'updatedByUser.type',
		'updatedByUserGUID.avatarGUID': 'updatedByUser.avatarGUID',
		'updatedByUserGUID.tinyID': 'updatedByUser.tinyID',
		'createdByUserGUID.longName': 'createdByUser.longName',
		'createdByUserGUID.shortName': 'createdByUser.shortName',
		'createdByUserGUID.type': 'createdByUser.type',
		'createdByUserGUID.avatarGUID': 'createdByUser.avatarGUID',
		'createdByUserGUID.tinyID': 'createdByUser.tinyID'
	},
	mDefaultSearchHowMany: 10,
	mDefaultSearchFields: ['tinyID', 'longName', 'themeInfo', 'shortName', 'type', 'createTime', 'updateTime', 'isFavorite', 'isDeleted', 'tags', 'avatarGUID', 'previewGUIDs', 'thumbnailGUIDs', 'iconGUID', 'description'],
	mDefaultSearchSortFields: ['+longName'],
	mDefaultActivityTotalResultLimit: 500,
	mDefaultActivitySubFields: {
		'entityGUID.longName': 'entityLongName',
		'entityGUID.shortName': 'entityShortName',
		'entityGUID.tinyID': 'entityTinyID',
		'entityGUID.type': 'entityType',
		'containerGUID.longName': 'ownerLongName',
		'containerGUID.shortName': 'ownerShortName',
		'containerGUID.tinyID': 'ownerTinyID',
		'containerGUID.type': 'ownerType',
		'containerGUID.avatarGUID': 'ownerAvatarGUID',
		'userGUID.longName': 'userLongName',
		'userGUID.shortName': 'userShortName',
		'userGUID.tinyID': 'userTinyID',
		'userGUID.type': 'userType',
		'userGUID.avatarGUID': 'userAvatarGUID'
	},
	mDefaultRecentDocumentsLimit: 5,
	mStore: new CC.Store.BackingStore(),
	initialize: function() {},
	// Store convenience function.
	objectFromStoreWithGUID: function(inGUID) {
		return this.mStore.workingCopyForGUID(inGUID);
	},
	// Default entities callback. Returns an array of store-added model objects.
	_defaultEntitiesCallback: function(inResponse, inCallback, inErrback) {
		if (inResponse && inResponse.response) {
			var response = $A(inResponse.response);
			var entities = this._parseAndStoreEntities(response);
			return inCallback(entities);
		}
		if (inErrback) return inErrback(inResponse);
	},
	// Default paginated entities callback. Takes a paginated response, and maps the result to models in the
	// local backing store. Returns a tuple of (results, startIndex, total, paginationGUID) which is enough to
	// request future windows in this paginated set. You shouldn't really call this manually.
	_defaultPaginatedEntitiesCallback: function(inResponse, inCallback, inErrback) {
		if (inResponse && inResponse.response) {
			var paginated = new CC.EntityTypes.PaginatedResult(inResponse.response);
			var models = this._parseAndStoreEntities(paginated.results);
			return inCallback(models, paginated.startIndex, paginated.total, paginated.guid);
		}
		return inErrback(inResponse);
	},
	// Default search callback. Returns an  array of search result objects (note that they
	// are not automatically added to the store).
	_defaultSearchResultsCallback: function(inResponse, inCallback, inErrback) {
		if (inResponse && inResponse.response) {
			var results = (inResponse.response.results || []);
			return inCallback(results);
		}
		if (inErrback) return inErrback(inResponse);
	},
	// Generic pagination method for paginating a service method, and pushing the results into the local backing
	// store. Note that the results must be valid entity_types models to be pushed into the store correctly. You
	// shouldn't really call this manually.
	_paginateAndStoreEntities: function(inServiceName, inMethodName, inArguments, inOptPaginationGUID, inOptPaginationStartIndex, inOptPaginationHowMany, inCallback, inErrback) {
		var _callback = function(response) {
			return this._defaultPaginatedEntitiesCallback(response, inCallback, inErrback);
		}.bind(this);
		service_client().paginateAsynchronously(inServiceName, inMethodName, inArguments, {}, inOptPaginationGUID, inOptPaginationStartIndex, inOptPaginationHowMany, _callback.bind(this), inErrback);
	},
	// Maps an array of JSON structures to model objects, and pushes them into the store.
	// Returns an array of store-based models. This should only be called for models you
	// want to retain in the server_proxy backing store.
	_parseAndStoreEntities: function(models) {
		var stored = [];
		if (models && models.length) {
			var model, storedModel;
			for (var modelIdx = 0; modelIdx < models.length; modelIdx++) {
				model = models[modelIdx];
				storedModel = this._parseAndStoreEntity(model);
				if (storedModel) stored.push(storedModel);
			}
		}
		return stored;
	},
	_parseSearchResultsAndStoreEntities: function(searchResults) {
		var stored = searchResults.collect(function(result) {
			var entity = this._parseAndStoreEntity(result.entity);
			entity.snippets = result.snippets;
			return entity;
		}, this);
		return stored;
	},
	_parseAndStoreEntity: function(model) {
		if (!model || !model.type || model.type == "com.apple.EntityPlaceholder") return;
		var entity = entity_types().entityForHash(model);
		var pushed = this.mStore.pushObject(entity);
		return pushed;
	},
	// Returns all entities for a given type.
	entitiesForType: function(inType, inCallback, inErrback) {
		var _callback = function(response) {
			return this._defaultEntitiesCallback(response, inCallback, inErrback);
		}.bind(this);
		return service_client().executeAsynchronously('ContentService', 'entitiesForType:', inType, {}, _callback, inErrback);
	},
	// Paginated version of entities for a given type.
	paginatedEntitiesForType: function(inType, inOptPaginationGUID, inOptPaginationStartIndex, inOptPaginationHowMany, inCallback, inErrback) {
		var _callback = function(response) {
			return this._defaultPaginatedEntitiesCallback(response, inCallback, inErrback);
		}.bind(this);
		service_client().paginateAsynchronously('ContentService', 'entitiesForType:', inType, {}, inOptPaginationGUID, inOptPaginationStartIndex, inOptPaginationHowMany, _callback, inErrback);
	},
	// Returns all document entities under a given container GUID.
	documentsForContainer: function(inGUID, inCallback, inErrback) {
		var _callback = function(response) {
			return this._defaultEntitiesCallback(response, inCallback, inErrback);
		}.bind(this);
		return service_client().executeAsynchronously('ContentService', 'entitiesForType:inContainerGUID:', ['com.apple.entity.Document', inGUID], {}, _callback, inErrback);
	},
	// Returns an entity by GUID.
	entityForGUID: function(inGUID, inCallback, inErrback) {
		return this.entityForGUIDWithOptions(inGUID, {}, inCallback, inErrback);
	},
	// Returns an entity by GUID with options.
	entityForGUIDWithOptions: function(inGUID, inOptions, inCallback, inErrback) {
		var _callback = function(service_response) {
			var response = service_response.response;
			var entity = this._parseAndStoreEntity(response);
			if (!entity) return inErrback(response);
			if (inCallback) inCallback(entity);
		}.bind(this);
		return service_client().executeAsynchronously('ContentService', 'entityForGUID:', inGUID, inOptions || {}, _callback, inErrback);
	},
	// Returns an array of entities by GUID.
	entitiesForGUIDs: function(inGUIDs, inCallback, inErrback) {
		return this.entitiesForGUIDsWithOptions(inGUIDs, {}, inCallback, inErrback);
	},
	// Returns an array of entities by GUID with options.
	entitiesForGUIDsWithOptions: function(inGUIDs, inOptions, inCallback, inErrback) {
		var _callback = function(response) {
			return this._defaultEntitiesCallback(response, inCallback, inErrback);
		}.bind(this);
		return service_client().executeAsynchronously('ContentService', 'entitiesForGUIDs:', [inGUIDs], inOptions || {}, _callback, inErrback);
	},
	entitiesForGUIDsWithInternalTags: function(inGUIDs, inCallback, inErrback) {
		return this.entitiesForGUIDsWithInternalTagsWithOptions(inGUIDs, {}, inCallback, inErrback);
	},
	entitiesForGUIDsWithInternalTagsWithOptions: function(inGUIDs, inOptions, inCallback, inErrback) {
		var _callback = function(response) {
			return this._defaultEntitiesCallback(response, inCallback, inErrback);
		}.bind(this);
		return service_client().executeAsynchronously('ContentService', 'entitiesForGUIDs:withInternalTags:', [inGUIDs, true], inOptions || {}, _callback, inErrback);
	},
	// Returns an entity by tinyID.
	entityForTinyID: function(inTinyID, inCallback, inErrback) {
		return this.entityForTinyIDWithOptions(inTinyID, {}, inCallback, inErrback);
	},
	// Returns an entity by tinyID with options.
	entityForTinyIDWithOptions: function(inTinyID, inOptions, inCallback, inErrback) {
		var _callback = function(service_response) {
			var response = service_response.response;
			var entity = this._parseAndStoreEntity(response);
			if (!entity) return inErrback(response);
			if (inCallback) inCallback(entity);
		}.bind(this);
		return service_client().executeAsynchronously('ContentService', 'entityForTinyID:', inTinyID, inOptions || {}, _callback, inErrback);
	},
	entityForLogin: function(inLogin, inCallback, inErrback) {
		return this.entityForLoginWithOptions(inLogin, {}, inCallback, inErrback)
	},
	entityForLoginWithOptions: function(inLogin, inOptions, inCallback, inErrback) {
		var _callback = function(service_response) {
			var response = service_response.response;
			var entity = this._parseAndStoreEntity(response);
			if (!entity) return inErrback(response);
			if (inCallback) inCallback(entity);
		}.bind(this);
		return service_client().executeAsynchronously('ContentService', 'bestGuessForUserEntityForLogin:', inLogin, inOptions || {}, _callback, inErrback);
	},
	entityForID: function(inID, inCallback, inErrback) {
		return this.entityForIDWithOptions(inID, {}, inCallback, inErrback);
	},
	entityForIDWithOptions: function(inID, inOptions, inCallback, inErrback) {
		// if it is a GUID, use that otherwise try login and tinyID
		if (looksLikeGUID(inID)) {
			return server_proxy().entityForGUIDWithOptions(inID, inOptions, inCallback, inErrback);
		}
		var _errback = function(result) {
			// assume error means we need to look it up differently
			return server_proxy().entityForLoginWithOptions(inID, inOptions, inCallback, inErrback);
		}
		return server_proxy().entityForTinyIDWithOptions(inID, inOptions, inCallback, _errback);
	},
	// repopulates the values of the meta tags for the current page
	refreshMetaTags: function(inCallback, inErrback) {
		var _callback = function(service_response) {
			for (var key in service_response.response)
			{
				if (service_response.response.hasOwnProperty(key))
					CC.setMeta(key, service_response.response[key]);
			}
			
			if (inCallback)
				inCallback();
			
			globalNotificationCenter().publish(CC.Meta.NOTIFICATION_DID_REFRESH_META_TAGS, server_proxy());
		};
		var entityID = (CC.meta('x-apple-entity-guid') == '') ? null : CC.meta('x-apple-entity-guid');
		var route = CC.meta('x-apple-route');
		return service_client().executeAsynchronously('AppContextService', 'metaTagsForEntityID:withRoute:', [entityID, route], {}, _callback, inErrback);
	},
	deleteEntityWithGUID: function(inGUID, permanently, inCallback, inErrback) {
		var methodName = permanently ? 'permanentlyDeleteEntityWithGUID:' : 'deleteEntityWithGUID:';
		return service_client().executeAsynchronously('ContentService', methodName, inGUID, {}, inCallback, inErrback);
	},
	undeleteEntityWithGUID: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'undeleteEntityWithGUID:', inGUID, {}, inCallback, inErrback);
	},
	hideUserWithGUID: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'hideUserWithGUID:', inGUID, {}, inCallback, inErrback);
	},
	unhideUserWithGUID: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'unhideUserWithGUID:', inGUID, {}, inCallback, inErrback);
	},
	// move to a new owner
	moveEntityToOwner: function(inEntityGUID, inOwnerGUID, inCallback, inErrback) {
		var _updateCallback = function(inResult) {
			return service_client().executeAsynchronously('ContentService', 'removeACLsForEntityGUID:', inEntityGUID, {}, inCallback, inErrback);
		}
		var _getEntityCallback = function(inEntity) {
			var cs = new CC.EntityTypes.EntityChangeSet({
				'changeAction': "UPDATE",
				'entityGUID': inEntityGUID,
				'entityRevision': inEntity.revision,
				'entityType': inEntity.type,
				'changes': [["ownerGUID", inOwnerGUID]],
				'force': false
			});
			return server_proxy().updateEntityAndACLs(false, null, cs, null, _updateCallback, inErrback);
		}
		return server_proxy().entityForGUID(inEntityGUID, _getEntityCallback, inErrback);
	},
	// Returns the current revision for an entity with a given GUID as an Integer.
	revisionForEntityGUID: function(inGUID, inCallback, inErrback) {
		var _callback = function(service_response) {
			var response = service_response.response;
			var revision = (response) ? parseInt(response, 10) : null;
			if (inCallback) inCallback(revision);
		}.bind(this);
		return service_client().executeAsynchronously('ContentService', 'revisionForEntityGUID:', inGUID, {}, _callback, inErrback);
	},
	commentsForCommentGUIDs: function(inGUIDs, inCallback, inErrback) {
		var _callback = function(service_response) {
			var response = service_response.response;
			if (inCallback) inCallback(response);
		}.bind(this);
		return service_client().executeAsynchronously('ContentService', 'commentsForGUIDs:', [inGUIDs], {}, _callback, inErrback);
	},
	commentsAndCanICommentForGUID: function(inGUID, inCallback, inErrback) {
		var batch = [
			['ContentService', 'commentsForEntityGUID:', inGUID],
			['ContentService', 'canICommentOnEntityGUID:', inGUID]
		]
		return service_client().batchExecuteAsynchronously(batch, null, function(service_response) {
			if (service_response && service_response.responses) {
				var firstResponse = service_response.responses[0];
				var secondResponse = service_response.responses[1];
				var comments = server_proxy()._parseAndStoreEntities(firstResponse.response);
				var canIcomment = secondResponse.response;
				return inCallback(comments, canIcomment);
			}
			return inErrback(service_response);
		}.bind(this), inErrback);
	},
	addCommentToOwnerGUID: function(inText, inOwnerGUID, inCallback, inErrback) {
		var newComment = {
			type: 'com.apple.EntityComment',
			entityGUID: inOwnerGUID,
			body: inText
		};
		if (globalEditorController().mPage) {			
			var entity = globalEditorController().mPage.mRecord;
			var href = window.location.protocol + "//" + window.location.host;
			var entityURL = href + CC.entityURLForTypeAndGUID(entity.type, entity.guid);
			var ownerURL = href + CC.entityURLForTypeAndGUID(entity.ownerType, entity.ownerGUID);
			var clientURL = "#entity_url:%@#owner_url:%@".fmt(entityURL, ownerURL);
			return service_client().executeAsynchronously('ContentService', 'addComment:', newComment, {'clientURL': clientURL}, inCallback, inErrback);			
		} 
		
		// if there is no globalEditorController then manualy construct clientURL
		var href = window.location.protocol + "//" + window.location.host;
		var entityType = CC.meta('x-apple-entity-type');
		var entityGuid = CC.meta('x-apple-entity-guid');
		var entityURL = href + CC.entityURLForTypeAndGUID(entityType, entityGuid);		
		var entityOwnerType = CC.meta('x-apple-owner-type');
		var entityOwnerGuid = CC.meta('x-apple-owner-guid');
		var ownerURL = href + CC.entityURLForTypeAndGUID(entityOwnerType, entityOwnerGuid);
		var clientURL = "#entity_url:%@#owner_url:%@".fmt(entityURL, ownerURL);
		
		return service_client().executeAsynchronously('ContentService', 'addComment:', newComment, {'clientURL': clientURL}, inCallback, inErrback);								
	},
	deleteCommentWithGUID: function(inCommentGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'removeCommentWithGUID:', inCommentGUID, {}, inCallback, inErrback);	
	},
	approveCommentWithGUID: function(inCommentGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'approveCommentWithGUID:', inCommentGUID, {}, inCallback, inErrback);	
	},
	approveCommentsWithGUIDs: function(inGUIDs, inCallback, inErrback) {
		if (!inGUIDs) return inErrback();
		var batch = [];
		for (var idx = 0; idx < inGUIDs.length; idx++) {
			batch.push(['ContentService', 'approveCommentWithGUID:', inGUIDs[idx]]);
		}
		return service_client().batchExecuteAsynchronously(batch, null, inCallback, inErrback);
	},
	// Returns an array of relationship objects.
	relationshipsForGUID: function(inGUID, inCallback, inErrback) {
		var _callback = function(response) {
			if (response && response.response) {
				// Iterate over each of the relationship tuples we got ([relationshipGUID, otherEntity]).
				var relationships = $A(response.response);
				var relationshipModels = new Array();
				var relationship, _relationship, relationshipModel;
				for (var rdx = 0; rdx < relationships.length; rdx++) {
					// First create a relationship model for each relationship.
					relationship = relationships[rdx];
					_relationship = {'guid': relationship[0], 'targetEntityGUID': relationship[1].guid, 'sourceEntityGUID': inGUID};
					relationshipModel = new CC.EntityTypes.RelatedRelationship(_relationship);
					relationshipModels.push(this.mStore.pushObject(relationshipModel));
					// Next push the target entity into the store. Note that you'll need to ask for these later if you want them.
					this._parseAndStoreEntity(relationship[1]);
				}
				if (inCallback) inCallback(relationshipModels);
			} else {
				if (inErrback) inErrback(response);
			}
		}.bind(this);
		return service_client().executeAsynchronously('ContentService', 'relatedEntitiesForGUID:withType:', [inGUID, 'com.apple.relationship.Related'], {}, _callback, inErrback);
	},
	relateEntities: function(guid1, guid2, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'relateEntityWithGUID:toEntityWithGUID:withType:', [guid1, guid2, 'com.apple.relationship.Related'], {}, inCallback, inErrback);
	},
	relationshipsForGUIDs: function(inGUIDs, inCallback, inErrback) {
 		var _callback = function(service_response) {
			var results = $A(service_response.response || []);
			return inCallback(results);
 		};
		var guids = inGUIDs || [];
		return service_client().executeAsynchronously('ContentService', 'relationshipsForGUIDs:', [guids], {}, _callback, inErrback);
	},
	deleteRelationship: function(relationshipGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'deleteRelationshipWithGUID:', relationshipGUID, {}, inCallback, inErrback);
	},
	// Recent documents helper.  Note these methods deliberately don't push results in to the store since the results
	// have no referenced objects or subproperties expanded.  Also note the difference - recentEntitiesForUser returns
	// recent entities for the currently logged in user.  Recent documents uses search to list the last updated entities.
	recentEntitiesForUserWithLimitAndOptions: function(inLimit, inOptions, inCallback, inErrback) {
 		var _callback = function(service_response) {
			var results = $A(service_response.response || []);
			return inCallback(results);
 		};
		return service_client().executeAsynchronously('ContentService', 'recentEntitiesWithLimit:', (inLimit || this.mDefaultRecentDocumentsLimit), (inOptions || {}), _callback, inErrback);
	},
	recentEntitiesForUserForOwnerGUIDWithLimitAndOptions: function(inOwnerGUID, inLimit, inOptions, inCallback, inErrback) {
 		var _callback = function(service_response) {
			var results = $A(service_response.response || []);
			return inCallback(results);
 		};
		return service_client().executeAsynchronously('ContentService', 'recentEntitiesForOwnerGUID:withLimit:', inOwnerGUID, (inLimit || this.mDefaultRecentDocumentsLimit), (inOptions || {}), _callback, inErrback);
	},
	recentDocumentsWithOptions: function(inLimit, inOptions, inCallback, inErrback) {
		return this.recentDocumentsInOptOwnerWithOptions(inLimit, undefined, inOptions, inCallback, inErrback);
	},
	recentDocumentsInOptOwnerWithOptions: function(inLimit, inOptOwnerGUID, inOptions, inCallback, inErrback) {
		var query = this.searchQuery(undefined, ['com.apple.entity.Page', 'com.apple.entity.File'], 0, (inLimit || this.mDefaultRecentDocumentsLimit), undefined);
		this.searchQueryUpdateSort(query, '-lastActivityTime');
		if (inOptOwnerGUID) query = this.searchQueryUpdateOwnerGUID(query, inOptOwnerGUID);
		var _callback = function(service_response) {
			var results = new Array();
			if (service_response.response && service_response.response.results) {
				results = $A(service_response.response.results).collect(function(result) {
					return result.entity;
				});
			}
			return inCallback(results.without(undefined));
		}.bind(this);
		return service_client().executeAsynchronously('SearchService', 'query:', query, (inOptions || {}), _callback, inErrback);
	},
	addTagForOwner: function(inTag, inOwnerGUID, inCallback, inErrback) {
		if (!inTag.match(/\S/)) {
			inErrback({error:"Cannot add an empty tag"});
			return;
		}
		return service_client().executeAsynchronously('ContentService', 'addTag:toEntityWithGUID:', [inTag, inOwnerGUID], {}, inCallback, inErrback);
	},
	deleteTagForOwner: function(inTag, inOwnerGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'deleteTag:inOwnerGUID:', [inTag, inOwnerGUID], {}, inCallback, inErrback);
	},
	subscriptionsForEntity: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'subscriptionsForEntity:', inGUID, {}, inCallback, inErrback);
	},
	subscribeToEntityWithType: function(inGUID, inType, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'subscribeToEntity:withType:', [inGUID, inType], {}, inCallback, inErrback);
	},
	unsubscribeToEntityWithType: function(inGUID, inType, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'unsubscribeFromEntity:withType:', [inGUID, inType], {}, inCallback, inErrback);
	},
	// Creates a new page entity with a given set of page options and ACLs.
	createPageWithOptionsAndOptionalACLs: function(inOptions, inOptAcls, inCallback, inErrback) {
		var gotCurrentUser = function(currentUser) {
			// Figure out a title and whether this page is a blog post.
			var longName = (inOptions.longName || "_Page.Default.Title".loc());
			var isBlogpost = (inOptions.isBlogpost || false);
			// Did we get passed an explicit ownerGUID for the page? Fall back to the current user GUID.
			var currentUserGUID = currentUser.guid;
			var ownerGUID = (inOptions.ownerGUID ? inOptions.ownerGUID : currentUserGUID);
			var _page = {'longName': longName, 'isBlogpost': isBlogpost};
			var page = new CC.EntityTypes.PageEntity(_page);
			var variables = {'ownerGUID': ownerGUID, 'longName': longName};
			var language = globalLocalizationManager().getLprojLocale();
			// Build a batch (including ACLs if the owner is the current user and the current user is authenticated).
			var batched = [];
			if (inOptAcls) {
				batched.push(['ContentService', 'createEntitiesFromTemplate:withData:andVariables:andACL:andLanguage:', ['wiki_page', page, variables, inOptAcls, language], {}]);
			} else if ((currentUser && currentUser.isAuthenticated) && (ownerGUID == currentUserGUID)) {
				var acl = new CC.EntityTypes.EntityACL({
					'userLogin': currentUser.login,
					'userLongName': currentUser.longName,
					'userExternalID': currentUser.externalID,
					'action': 'own',
					'allow': true
				});
				batched.push(['ContentService', 'createEntitiesFromTemplate:withData:andVariables:andACL:andLanguage:', ['wiki_page', page, variables, [acl], language], {}]);
			} else {
				batched.push(['ContentService', 'createEntitiesFromTemplate:withData:andVariables:andACL:andLanguage:', ['wiki_page', page, variables, null, language], {}]);
			}
			// Unhide the creating user if they're hidden.
			if (currentUser && currentUser.isHidden && currentUser.isAuthenticated) {
				batched.push(['ContentService', 'unhideUserWithGUID:', currentUser.guid, {'hints': {'activity.ignore': true}}]);
			}
			// Define a callback.
			var _callback = function(service_response) {
				if (service_response && service_response.responses) {
					var firstResponse = service_response.responses[0];
					var entities = firstResponse.response;
					if (entities && entities[0]) {
						var storedModel = this._parseAndStoreEntity(entities[0]);
						// Immediately kick the preview queue.
						service_client().executeAsynchronously('PagePreviewService', 'kickPreviewQueue', null, Prototype.emptyFunction, Prototype.emptyFunction);
						return inCallback(storedModel);
					}
				}
				return inErrback(service_response);
			};
			// Create the page.
			return service_client().batchExecuteAsynchronously(batched, {}, _callback.bind(this), inErrback);
			
		}.bind(this);
		return sessions().currentUserAsynchronously(gotCurrentUser, inErrback);
	},
	// Creates a new project entity with a given set of project options and ACLs.
	createProjectWithOptionsAndACLs: function(inOptions, inACLs, inCallback, inErrback) {
		// Start by creating three GUIDs we can use in the batch.
		var projectGUID = (new CC.GuidBuilder()).toString();
		var detailPageGUID = (new CC.GuidBuilder()).toString();
		var blogGUID = (new CC.GuidBuilder()).toString();
		// Build up the batch by creating the project, detail page, blog and setting the project ACLs.
		var longName = (inOptions.longName || "_Project.Default.Title".loc());
		var tinyID = longName.strip().gsub(/[^\w]/, "").toLowerCase();
		if (tinyID == "") tinyID = null;
		var description = (inOptions.description || "");
		var extendedAttributes = (inOptions.extendedAttributes || {});
		var _project = {
			'guid': projectGUID,
			'tinyID': tinyID,
			'shortName': tinyID,
			'longName': longName,
			'description': description,
			'extendedAttributes': extendedAttributes,
			'detailPageGUID': detailPageGUID,
			'blogGUID': blogGUID
		}
		if (inOptions.themeInfo) _project['themeInfo'] = inOptions.themeInfo;
		if (inOptions.avatarGUID) _project['avatarGUID'] = inOptions.avatarGUID;
		var project = new CC.EntityTypes.WikiEntity(_project);
		project.setCommentAccessLevel(CC.EntityMixins.COMMENT_ACCESS_DEFAULT);
		project.setCommentModerationLevel(CC.EntityMixins.COMMENT_MODERATION_DEFAULT);
		var blogEntity = new CC.EntityTypes.BlogEntity({
			'guid': blogGUID,
			'longName': "_Blog.Default.Title".loc(),
			'ownerGUID': projectGUID
		});
		var language = globalLocalizationManager().getLprojLocale();
		// if email notification checkbox is checked then send email notification to ACLs (automatically excluding owner on the server side)
		var sharedNotificationList = [];
		if (inOptions.isNotificationChecked) sharedNotificationList = inACLs;		
		
		var batched = [
			['ContentService', 'createEntity:', project],
			['ContentService', 'createEntitiesFromTemplate:withData:andVariables:andACL:andLanguage:', ['wiki_home', {}, {'guid': detailPageGUID, 'ownerGUID': projectGUID, 'longName': longName}, null, language], {'hints': {'activity.ignore': true}}],
			['ContentService', 'createEntity:', blogEntity, {'hints': {'activity.ignore': true}}],
			['ContentService', 'setACLs:with:forEntityGUID:', [sharedNotificationList, inACLs, projectGUID], {'hints': {'activity.ignore': true}}]
		];
		// Define a callback.
		var _callback = function(service_response) {
			if (service_response && service_response.responses) {
				var firstResponse = service_response.responses[0];
				if (firstResponse) {
					var storedModel = this._parseAndStoreEntity(firstResponse.response);
					service_client().executeAsynchronously('PagePreviewService', 'kickPreviewQueue', null, Prototype.emptyFunction, Prototype.emptyFunction);
					return inCallback(storedModel);
				}
			}
			return inErrback(service_response);
		};
		// Create the project in a batch.
		return service_client().batchExecuteAsynchronously(batched, {'expandReferencedObjects': false}, _callback.bind(this), inErrback);
	},
	createEntity: function(inEntity, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'createEntity:', inEntity, {}, inCallback, inErrback);
	},
	updateEntity: function(inChangeset, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'updateEntity:', inChangeset, {}, function(service_response) {
			if (service_response && service_response.response) {
				var model = this._parseAndStoreEntity(service_response.response);
				return inCallback(model);
			}
			return inErrback(service_response);
		}.bind(this), inErrback);
	},
	updateEntityAndACLs: function(isNotificationChecked, sharedNotificationList, changeset, acls, inCallback, inErrback) {
		var batch = [
			['ContentService', 'updateEntity:', changeset]
		];
						
		if (acls) {
			if (isNotificationChecked)
				batch.push(['ContentService', 'setACLs:with:forEntityGUID:', [sharedNotificationList, acls, changeset.entityGUID]]);
			else
				batch.push(['ContentService', 'setACLs:with:forEntityGUID:', [[], acls, changeset.entityGUID]]);
		}
		return service_client().batchExecuteAsynchronously(batch, {'expandReferencedObjects': false}, function(service_response){
			if (service_response && service_response.responses) {
				var firstResponse = service_response.responses[0];
				this._parseAndStoreEntity(firstResponse.response);
				return inCallback();
			}
			return inErrback(service_response);
		}.bind(this), inErrback);
	},
	saveQueryAsSavedSearchWithName: function(inQuery, inName, inCallback, inErrback) {
		var savedSearch = new CC.EntityTypes.SavedQuery({
			'longName': (inName || ""),
			'query': inQuery
		});
		return server_proxy().createEntity(savedSearch, inCallback, inErrback);
	},
	savedSearchesForCurrentUser: function(inCallback, inErrback) {
		sessions().currentUserAsynchronously(function(currentUser) {
			if (currentUser && currentUser.isAuthenticated) {
				var query = {
					entityTypes: ['com.apple.entity.SavedQuery'],
					query: {
						match: currentUser.guid,
						field: 'ownerGUID',
						exact: true
					},
					sortFields: ['-updateTime'],
					fields: ['type', 'longName', 'query']
				};
				return this.entitiesForSearchQuery(query, inCallback, inErrback);
			}
			return inCallback([]);
		}.bind(this), inErrback);
	},
	// Quick search keyword/type search.
	entitiesForQuickSearch: function(inKeyword, inTypes, inCallback, inErrback) {
		if (!inTypes) inTypes = ['com.apple.entity.File', 'com.apple.entity.Page'];
		var aQuery = this.searchQuery(inKeyword, inTypes, 0, 5);
		this.searchQueryUpdateSort(aQuery, '-rank');
		this.entitiesForSearchQuery(aQuery, inCallback, inErrback);
	},
	// Returns an array of entities matching a query.
	entitiesForSearchQuery: function(inQuery, inCallback, inErrback) {
		return this.entitiesForSearchQueryWithOptions(inQuery, undefined, inCallback, inErrback);
	},
	entitiesForSearchQueryWithOptions: function(inQuery, inOptions, inCallback, inErrback) {
		var _callback = function(response) {
			return this._defaultSearchResultsCallback(response, inCallback, inErrback);
		}.bind(this);
		return service_client().executeAsynchronously('SearchService', 'query:', inQuery, (inOptions || {}), _callback, inErrback);
	},
	entitiesForSavedSearch: function(inSavedSearchGUID, inCallback, inErrback) {
		var _savedSearchCallback = function(response) {
			this.entitiesForSearchQuery(response.query, inCallback, inErrback);
		}.bind(this);
		return this.entityForGUID(inSavedSearchGUID, _savedSearchCallback, inErrback);
	},
	// Returns a JSON-format search query.
	searchQuery: function(inKeywords, inTypes, inStartIndex, inHowMany, inOptSearchGUID) {
		var queryNode = null;
		var keywords = [];
		if (inKeywords) keywords = Object.isArray(inKeywords) ? inKeywords: [inKeywords];
		if (keywords.length) {
			queryNode = {};
			var andNode = queryNode['and'] = [];
			$A(keywords).each(function(keyword) {
				if (keyword && keyword != "") {
					andNode.push({
						'match': keyword
					});
				}
			});
		}
		var entityTypes = [];
		if (inTypes) entityTypes = Object.isArray(inTypes) ? inTypes: [inTypes];
		return {
			'guid': inOptSearchGUID,
			'query': queryNode,
			'fields': this.mDefaultSearchFields,
			'subFields': this.mDefaultSubpropertyPaths,
			'sortFields': this.mDefaultSearchSortFields,
			'range': [(inStartIndex || 0), (inHowMany || this.mDefaultSearchHowMany)],
			'entityTypes': entityTypes,
			'onlyDeleted': false
		};
	},
	searchQueryForTags: function(inTags, inTypes, inStartIndex, inHowMany, inOptSearchGUID) {
    	var aQuery = this.searchQuery("", inTypes, inStartIndex, inHowMany, inOptSearchGUID);
    	return this.addTagsToQuery(aQuery, inTags);
	},
	addTagsToQuery: function(inTags, inQuery) {
		var tags = (inTags == undefined) ? [] : (Object.isArray(inTags) ? inTags: [inTags]);
		if (tags.length) {
			var andNode = ((inQuery.query ? inQuery.query['and'] : []) || []);
			$A(tags).each(function(tag) {
				if (tag && tag != "") {
					andNode.push({
						match: tag,
						field: 'tags',
						exact: true
					});
				}
			});
			if (!inQuery.query) inQuery.query = {};
			inQuery.query['and'] = andNode;
		}
		return inQuery;
	},
	searchQueryAddToOrNode: function(inQuery, inItem) {
		return this.searchQueryAddToTypedNode('or', inQuery, inItem);
	},
	searchQueryAddToAndNode: function(inQuery, inItem) {
		return this.searchQueryAddToTypedNode('and', inQuery, inItem);
	},
	searchQueryAddToTypedNode: function(inType, inQuery, inItem) {
		var types = ['or', 'and'];
		
		if (types.indexOf(inType) != -1) {
			var typedNode = ((inQuery.query ? inQuery.query[inType] : []) || []);
			var hasNodeAlready = false;
			if (inItem) {
				if (inItem.field) {
					for (var a = 0; a < typedNode.length; a++) {
						var node = typedNode[a];
						if (node.field && node.field == inItem.field && node.match == inItem.match) {
							hasNodeAlready = true;
						}
					}
				}
			
				if(!hasNodeAlready) {
					typedNode.push(inItem);
				}
			}
			
			if (!inQuery.query) inQuery.query = {};
			inQuery.query[inType] = typedNode;
			return inQuery;
		}
		else {
			return null;
		}
		
	},
	searchQueryCreateNode: function(inFieldName, inMatchValue, inExact) {
		var node = {
			match: inMatchValue,
			field: inFieldName,
			exact: (inExact == true)
		}
		return node;
	},
	searchQueryCreateOrArray: function(inArrayOfNodes) {
		var orNode = {
			or: []
		};
		
		if (inArrayOfNodes) {
			for (var i = 0; i < inArrayOfNodes.length; i++) {
				var node = inArrayOfNodes[i];
				orNode.or.push(node);
			}
		}
		return orNode;
	},
	searchQueryCreateAndArray: function(inArrayOfNodes) {
		var andNode = {
			and: []
		};
		
		if (inArrayOfNodes) {
			for (var i = 0; i < inArrayOfNodes.length; i++) {
				var node = inArrayOfNodes[i];
				andNode.and.push(node);
			}
		}
		return andNode;
	},
	searchQueryUpdateSort: function(inQuery, inSortField) {
		inQuery.sortFields = [inSortField];
		return inQuery;
	},
	searchQueryFavoritesOnly: function(inQuery, inFavoritesOnly) {
		var andNode, _andNode;
		var oldAndNode = (inQuery.query ? inQuery.query['and'] || [] : []);
		var markedExistingAndNode = false;
		for (var nodeIdx = 0; nodeIdx < oldAndNode.length; nodeIdx++) {
			if (!andNode) andNode = inQuery.query['and'] = [];
			_andNode = oldAndNode[nodeIdx];
			if (_andNode && _andNode.field == 'isFavorite') {
				andNode[nodeIdx] = {match: (inFavoritesOnly == true), field: 'isFavorite'};
				markedExistingAndNode = true;
			} else {
				andNode[nodeIdx] = _andNode;
			}
		}
		if (!markedExistingAndNode && inFavoritesOnly) {
			if (!andNode) andNode = [];
			andNode.push({match: true, field: 'isFavorite'});
		}
		if (andNode) {
			if (!inQuery.query) inQuery.query = {};
			inQuery.query['and'] = andNode;
		}
		return inQuery;
	},
	searchQueryUpdateContainerGUID: function(inQuery, inContainerGUID) {
		return this.__updateQueryForContainerOrOwnerGUID(inQuery, 'containerGUID', inContainerGUID);
	},
	searchQueryUpdateOwnerGUID: function(inQuery, inOwnerGUID) {
		return this.__updateQueryForContainerOrOwnerGUID(inQuery, 'ownerGUID', inOwnerGUID);
	},
	__updateQueryForContainerOrOwnerGUID: function(inQuery, inContainerOrOwnerKey, inContainerOrOwnerValue) {
		if (inContainerOrOwnerKey && inContainerOrOwnerValue) {
			// Expand out entityTypes to individual nodes in an OR clause.
			if (!inQuery.query) inQuery.query = {};
			if (!inQuery.query['and']) inQuery.query['and'] = [];
			var andNode = inQuery.query['and'];
			var orNode = [];
			var entityTypes = (inQuery.entityTypes || []);
			if (entityTypes.length) {
				for (var tdx = 0; tdx < entityTypes.length; tdx++) {
					orNode.push({match: entityTypes[tdx], field: 'type', exact: true});
				}
				andNode.push({'or': orNode});
			}
			delete inQuery.entityTypes;
			// Push the new container or owner key.
			andNode.push({match: inContainerOrOwnerValue, field: inContainerOrOwnerKey, exact: true});
		}
		return inQuery;	
	},
	// Fetches activity (for an optional user or container GUID) from a given start index.	Accepts an
	// optional inOptPaginationGUID argument that triggers use of a cached pagination result on the server.
	paginatedActivity: function(inOptUserGUID, inOptOwnerGUID, inOptContainerGUID, inOptPaginationGUID, inOptPaginationStartIndex, inOptPaginationHowMany, inOptPaginationOnlyFavorites, inOptPaginationOnlyUnread, inOptPaginationOnlyWatched, inOptPaginationStartTime, inCallback, inErrback) {
		var query = {
			type: 'com.apple.UserActivityQuery',
			userGUID: inOptUserGUID,
			startIndex: 0, // The outer pagination request will take care of moving the pagination window.
			resultsLimit: this.mDefaultActivityTotalResultLimit,
			containerGUID: inOptContainerGUID,
			ownerGUID: inOptOwnerGUID,
			subFields: this.mDefaultActivitySubFields,
			onlyFavorites: (inOptPaginationOnlyFavorites || false),
			onlyUnread: (inOptPaginationOnlyUnread || false),
			onlyWatched: (inOptPaginationOnlyWatched || true),
			startTime: inOptPaginationStartTime
		};
		var _callback = function(response) {
			return this._defaultPaginatedEntitiesCallback(response, inCallback, inErrback);
		}.bind(this);
		service_client().paginateAsynchronously('ContentService', 'userActivity:', query, {}, inOptPaginationGUID, inOptPaginationStartIndex, inOptPaginationHowMany, _callback, inErrback);
	},
	paginatedSearchQuery: function(inQuery, inOptPaginationGUID, inOptPaginationStartIndex, inOptPaginationHowMany, inCallback, inErrback) {
		var _callback = function(service_response) {
			if (service_response && service_response.response) {
				var paginated = new CC.EntityTypes.PaginatedResult(service_response.response);
				var searchResult = new CC.EntityTypes.SearchResult(paginated.results[0]);
				var models = this._parseSearchResultsAndStoreEntities(searchResult.results);
				return inCallback(models, paginated.startIndex, paginated.total, paginated.guid);
			}
			return inErrback(service_response);
		}.bind(this);
		return service_client().entitiesForSearchQuery(inQuery, _callback, inErrback);
	},
	// Favorites/unread support.
	addEntityToFavorites: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'addEntityToFavorites:', inGUID, {}, inCallback, inErrback);
	},
	removeEntityFromFavorites: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'removeEntityFromFavorites:', inGUID, {}, inCallback, inErrback);
	},
	markEntityAsRead: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'markEntityAsRead:', inGUID, {}, inCallback, inErrback);
	},
	markEntityAsUnread: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'markEntityAsUnread:', inGUID, {}, inCallback, inErrback);
	},
	markAllAsRead: function(inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'markAllEntitiesAsRead', [], {}, inCallback, inErrback);
	},
	// Watched support.
	watchEntity: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'addEntityToWatchlist:', inGUID, {}, inCallback, inErrback);
	},
	unwatchEntity: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'removeEntityFromWatchlist:', inGUID, {}, inCallback, inErrback);
	},
	// acls
	aclsForEntityGUID: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'aclsForEntityGUID:', inGUID, {}, function(service_response) {
			var acls = service_response.response;
			inCallback(acls);
		}.bind(this), inErrback);
	},
	setACLsOnEntity: function(isNotificationEnabled, sharedNotificationList, inACLs, inGUID, inCallback, inErrback) {
		
		// Send clientURL info to server for document link information used in notification emails (shared document notification, etc).
		var href = window.location.protocol + "//" + window.location.host;
		var entityURL = href + CC.entityURLForTypeAndGUID(CC.meta('x-apple-entity-type'), CC.meta('x-apple-entity-guid'));
		var ownerURL = href + CC.entityURLForTypeAndGUID(CC.meta('x-apple-owner-type'), CC.meta('x-apple-owner-guid'));
		var clientURL = "#entity_url:%@#owner_url:%@".fmt(entityURL, ownerURL);
				
		if (!inACLs || inACLs.length == 0) return inErrback();
		if (isNotificationEnabled)
			return service_client().executeAsynchronously('ContentService', 'setACLs:with:forEntityGUID:', [sharedNotificationList, inACLs, inGUID], {'clientURL': clientURL}, inCallback, inErrback);
		else
			return service_client().executeAsynchronously('ContentService', 'setACLs:with:forEntityGUID:', [[], inACLs, inGUID], {'clientURL': clientURL}, inCallback, inErrback);
	},
	accessToEntityWithGUID: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'accessToEntityWithGUID:', inGUID, {}, function(service_response) {
			var access = service_response.response;
			inCallback(access);
		}, inErrback);
	},
	odRecordsMatching: function(inKeyword, inCallback, inErrback) {
		var _callback = function(service_response) {
			var response = service_response.response;
			var rawRecords = (response) ? response : [];
			var records = rawRecords.collect(function(aRawRecord) {
				var aRecord = {
					login: aRawRecord.login,
					externalID: aRawRecord.externalID,
					longName: aRawRecord.longName
				};
				return aRecord;
			});
			if (inCallback) inCallback(records);
		}.bind(this);
		return service_client().executeAsynchronously('ODService', 'odRecordsMatching:', inKeyword, {}, _callback, inErrback);
	},
	detailPageWithContainerAndPermissionForID: function(inID, inCallback, inErrback) {
		// gets a container and its detail page
		var options =  {'expandReferencedObjects': false, 'subpropertyPaths': this.mDefaultSubpropertyPaths};
		var _callback = function(aModel) {
			var anEntity = server_proxy()._parseAndStoreEntity(aModel);
			if (!anEntity) return inErrback({responses:[aModel]});
			// Fetch the detail page for this entity.
			var detailPageGUID = anEntity.detailPageGUID;
			server_proxy().entityForIDWithOptions(detailPageGUID, {}, function(detailPage) {
				// Next grab the permissions.
				server_proxy().accessToEntityWithGUID(anEntity.guid, function (inAccess) {
					inCallback(detailPage, anEntity, server_proxy()._accessForString(inAccess));
				}, inErrback);
			}, inErrback);
		}.bind(this);
		server_proxy().entityForIDWithOptions(inID, options, _callback, inErrback);
	},
	documentWithContainerAndPermissionForID: function(inID, inCallback, inErrback) {
		// gets a document and it's container
		var options =  {'expandReferencedObjects': false, 'subpropertyPaths': this.mDefaultSubpropertyPaths};
		var _callback = function(aModel) {
			var anEntity = server_proxy()._parseAndStoreEntity(aModel);
			if (!anEntity) return inErrback({responses:[aModel]});
			// Fetch the container for this entity.
			var containerGUID = anEntity.containerGUID;
			server_proxy().entityForIDWithOptions(containerGUID, {}, function(container) {
				// Next grab the permissions.
				server_proxy().accessToEntityWithGUID(container.guid, function (inAccess) {
					inCallback(anEntity, container, server_proxy()._accessForString(inAccess));
				}, inErrback);
			}, inErrback);
		}.bind(this);
		// document first
		server_proxy().entityForIDWithOptions(inID, options, _callback, inErrback);
	},
	serverHomepageDocument: function(inCallback, inErrback) {
		// grab the server home page document
		var _callback = function(document, permissions) {
			// get permissions
			var anEntity = server_proxy()._parseAndStoreEntity(document);
			if (!anEntity) return inErrback({responses:[document]});
			server_proxy().accessToEntityWithGUID(anEntity.guid, function (inAccess) {
					inCallback(document, server_proxy()._accessForString(inAccess));
				}, inErrback);
		}.bind(this);
		server_proxy().entityForIDWithOptions('serverhome', {}, _callback, inErrback);
	},
	permissionsForUser: function(inCallback, inErrback) {
		sessions().currentUserAsynchronously(function(currentUser) {
			var batch = [
				['ContentService', 'canICreateProjects'],
				['ContentService', 'amIAnAdmin']
			];
			return service_client().batchExecuteAsynchronously(batch, null, function(service_response) {
				if (service_response && service_response.responses) {
					var firstResponse = service_response.responses[0];
					var secondResponse = service_response.responses[1];
					var userPermissions = {
						isLoggedIn : currentUser.isAuthenticated,
						canCreateWikis : firstResponse.response,
						isAdmin : secondResponse.response
					}
					if (inCallback) return inCallback(userPermissions);
				}
				if (inErrback) return inErrback(service_response);
			}, inErrback);
		}, inErrback);
	},
	_accessForString: function(inString) {
		return {
			canRead : (inString == 'read') || (inString == 'write') || (inString == 'own'),
			canWrite : (inString == 'write') || (inString == 'own'),
			owns : (inString == 'own')
		};
	},
	preferredEmailAddressForUser: function(inCallback, inErrback) {
		sessions().currentUserAsynchronously(function(currentUser) {
			var callback = function(result) {
				var email = "";
				if (result.privateAttributes) {
					email = result.privateAttributes.preferredEmailAddress ? result.privateAttributes.preferredEmailAddress : result.privateAttributes.defaultDirectoryEmailAddress;
				}
				if (email == undefined) {
					email = "";
				}
				return inCallback(email);
			}
			return server_proxy().entityForGUID(currentUser.guid, callback, inErrback);
		}, inErrback);
	},
	tagsForEntityGUID: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'tagsForEntityGUID:', [inGUID], {}, function(service_response){
			if (service_response && service_response.succeeded) {
				return inCallback(service_response.response || []);
			}
			return inErrback(service_response);
		}, inErrback);
	},
	removeTagFromEntityWithGUID: function(inTag, inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'removeTag:fromEntityWithGUID:', [inTag, inGUID], {}, function(service_response){
			if (service_response && service_response.succeeded) {
				return inCallback(service_response);
			}
			return inErrback(service_response);
		}, inErrback);
	},
	allTags: function(inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'allTags', [], {}, function(service_response){
			if (service_response && service_response.response) {
				return inCallback(service_response.response);
			}
			return inErrback(service_response);
		}, inErrback);
	},
	allTagsOwnedByGUID: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'allTagsOwnedByGUID:', [inGUID], {}, function(service_response){
			if (service_response && service_response.response) {
				return inCallback(service_response.response);
			}
			return inErrback(service_response);
		}, inErrback);
	},
	allTagsStartingWith: function(tagPrefix, inCallback) {
		return service_client().executeAsynchronously('ContentService', 'allTagsStartingWith:', tagPrefix, {}, function(service_response){
			if (service_response && service_response.response) {
				return inCallback(service_response.response);
			}
		}, function(){
			logger.error("Could not fetch all tags starting with " + tagPrefix);
		});
	},
	replaceTagWithTagInOwnerGUID: function(firstTag, secondTag, ownerGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'replaceTag:withTag:inOwnerGUID:', [firstTag, secondTag, ownerGUID], {}, function(service_response){
			if (service_response && service_response.succeeded) {
				return inCallback(service_response);
			}
			return inErrback(service_response);
		}, inErrback);
	},
	globallyReplaceTagWithTag: function(oldTag, newTag, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'globallyReplaceTag:WithTag:', [oldTag, newTag], {}, function(service_response){
			if (service_response && service_response.succeeded) {
				return inCallback(service_response);
			}
			return inErrback(service_response);
		}, inErrback);
	},
	deleteTagInOwnerGUID: function(inTag, ownerGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'deleteTag:inOwnerGUID:', [inTag, ownerGUID], {}, function(service_response){
			if (service_response && service_response.succeeded) {
				return inCallback(service_response);
			}
			return inErrback(service_response);
		}, inErrback);
	},
	globallyDeleteTag: function(inTag, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'globallyDeleteTag:', [inTag], {}, function(service_response){
			if (service_response && service_response.succeeded) {
				return inCallback(service_response);
			}
			return inErrback(service_response);
		}, inErrback);
	},
	// Search tracking support. Returns a GUID to record a search by. You should pass an identical
	// query to the one you're using to search by.
	recordQuery: function(inQuery, inCallback, inErrback) {
		return service_client().executeAsynchronously('SearchService', 'recordQuery:', inQuery, {}, function(service_response) {
			if (service_response && service_response.response) {
				if (inCallback) return inCallback(service_response.response);
			}
		}, (inErrback || Prototype.emptyFunction));
	},
	// Records a click on a specific result for a in-progress query.
	recordClickInResultsWithGUID: function(inRecordedQueryGUID, inIndex, inSnippets, inClickedEntityGUID /*, No callbacks */) {
		var args = [inRecordedQueryGUID, (inIndex != undefined ? inIndex : -1), (inSnippets || {}), inClickedEntityGUID]
		return service_client().executeAsynchronously('SearchService', 'recordClickInResultsWithGUID:atIndex:withSnippets:andEntityGUID:', args, {}, Prototype.emptyFunction, Prototype.emptyFunction);
	},
	// Returns an array of revisions for a given entity GUID.
	revisionsForGUID: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'pastEntitiesForGUID:withChangeTypes:onlyFields:', [inGUID, ['create', 'edit', 'delete', 'undelete', 'restore'], []], {}, inCallback, inErrback);
	},
	pastEntityForGUIDAtRevision: function(inGUID, inRevision, inCallback, inErrback) {
		var _callback = function(service_response) {
			var result = service_response.response;
			if (result.dataGUID) {
				// we've got a file revision, fetch the file data of that revision
				var dataCallback = function(dataResponse) {
					result.mediaType = dataResponse.mediaType;
					result.contentType = dataResponse.contentType;
					result.isQuickLookable = dataResponse.isQuickLookable;
					result.iconGUID = dataResponse.iconGUID;
					result.thumbnailGUIDs = dataResponse.thumbnailGUIDs;
					result.previewGUIDs = dataResponse.previewGUIDs;
					
					var revision = entity_types().entityForHash(result);
					inCallback(revision);
				}
				server_proxy().entityForGUID(result.dataGUID, dataCallback, function(response) {logger.error("Error getting entity for revision");});
			} else {
				var revision = entity_types().entityForHash(result);
				inCallback(revision);
			}
		}
		return service_client().executeAsynchronously('ContentService', 'pastEntityForGUID:atRevision:', [inGUID, inRevision], {}, _callback, inErrback);
	},
	pastEntitiesForGUIDAndRevisionsWithChangeTypesOnlyFields: function(inGUID, inRevisions, inChangeTypes, inOnlyFields, inCallback, inErrback) {
		var changeTypes = (inChangeTypes || []);
		var onlyFields = (inOnlyFields || []);
		return service_client().executeAsynchronously('ContentService', 'pastEntitiesForGUID:andRevisions:withChangeTypes:onlyFields:', [inGUID, (inRevisions || []), changeTypes, onlyFields], {}, inCallback, inErrback);
	},
	revisionSummaryForGUID: function(inGUID, inRevision, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'pastEntitiesForGUID:andRevisions:withChangeTypes:onlyFields:', [inGUID, [inRevision], ['create', 'edit', 'delete', 'undelete', 'restore'], ['revision', 'updatedByUserLongName', 'updatedByUserShortName', 'updateTime']], {}, inCallback, inErrback);
	},
	restoreRevision: function(inGUID, inRevision, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'restoreEntityWithGUID:toRevision:', [inGUID, inRevision], {}, inCallback, inErrback);
	},
	diffForEntityBetweenRevisions: function(inGUID, inFirstRevision, inSecondRevision, inCallback, inErrback) {
		var callback = function(service_response) {
			var result = service_response.response;
			inCallback(result);
		}
		return service_client().executeAsynchronously('ContentService', 'diffPastEntityGUID:compareRevision:againstRevision:usingProperty:', [inGUID, inFirstRevision, inSecondRevision, 'extendedAttributes.renderedPage'], {}, callback, inErrback);
	},
	// authentication 
	validateUsernameAndPassword: function(inUsername, inPassword, inRemember, inCallback, inErrback) {
		var callback = function(inResponse) {
			inCallback(inResponse.response);
		}
		return service_client().executeAsynchronously('AuthService', 'validateUsername:andPassword:remember:', [inUsername, inPassword, inRemember], {}, callback, inErrback);
	},
	getChallenge: function(inUsername, inAdvanced, inCallback, inErrback) {
		var callback = function(inResponse) {
			inCallback(inResponse.response);
		}
		return service_client().executeAsynchronously('AuthService', 'challengeForUsername:advanced:', [inUsername, inAdvanced], {}, callback, inErrback);
	},
	validateUsernameAndPasswordDigest: function(inDigest, inRemember, inCallback, inErrback) {
		var callback = function(inResponse) {
			inCallback(inResponse.response);
		}
		service_client().executeAsynchronously('AuthService', 'validateUsernameAndPasswordDigest:remember:', [inDigest, inRemember], {}, callback, inErrback);
	},
	amILoggedIn: function(inCallback, inErrback) {
		var callback = function(inResponse) {
			inCallback(inResponse.response);
		}
		return service_client().executeAsynchronously('ContentService', 'amILoggedIn', [], {}, callback, inErrback);
	},
	sanitizeRedirect: function(inRedirect, inCallback, inErrback) {
		var callback = function(inResponse) {
			inCallback(inResponse.response);
		}
		return service_client().executeAsynchronously('AuthService', 'sanitizeRedirect:withHost:', [inRedirect, window.location.hostname], {}, callback, inErrback);
	},
	changePassword: function(inOldPassword, inNewPassword, inVerifiedPassword, inCallback, inErrback) {
		var callback = function(inResponse) {
			inCallback(inResponse.response);
		}
		return service_client().executeAsynchronously('AuthService', 'changePasswordFrom:to:verified:', [inOldPassword, inNewPassword, inVerifiedPassword], {}, callback, inErrback);
	},
	currentServerTime: function(inCallback, inErrback) {
		var callback = function(inResponse) {
			inCallback(inResponse.response);
		}
		return service_client().executeAsynchronously('TimeService', 'currentServerTime', [], {}, callback, inErrback);
	}
};
