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

// Editing service responsible for marshalling requests to and from the
// server, basic conflict resolution and handling concurrent editing.

CC.WikiEditor.EditingService = Class.create(CC.Object, {
	saveChanges: function(inPayload, inOptForceSavePage, inOptCallback, inOptErrback) {
		if (!inPayload) return inOptErrback ? inOptErrback() : false;
		var entity = globalEditorController().mPage.mRecord;
		var pageGUID = entity.guid;
		var gotCurrentUser = function(currentUser) {
			this.latestRevisionForPageGUID(pageGUID, function(serverRevision) {
				var cs = new CC.EntityTypes.EntityChangeSet({
					'changeAction': "UPDATE",
					'entityGUID': pageGUID,
					'entityRevision': serverRevision,
					'entityType': "com.apple.entity.Page",
					'changes': inPayload,
					'force': (inOptForceSavePage || false)
				});
				var href = window.location.protocol + "//" + window.location.host;
				var entityURL = href + CC.entityURLForTypeAndGUID(entity.type, entity.guid);
				var ownerURL = href + CC.entityURLForTypeAndGUID(entity.ownerType, entity.ownerGUID);
				var clientURL = "#entity_url:%@#owner_url:%@".fmt(entityURL, ownerURL);
				var batched = [
					['ContentService', 'updateEntity:', cs],
					['ContentService', 'markEntityAsRead:', pageGUID]
				];
				// 10750097
				// If the currently editing user is authenticated and hidden unhide.
				if (currentUser && currentUser.isHidden && currentUser.isAuthenticated) {
					batched.push(['ContentService', 'unhideUserWithGUID:', currentUser.guid, {'hints': {'activity.ignore': true}}]);
				}
				return service_client().batchExecuteAsynchronously(batched, {
					'expandReferencedObjects': false,
					'subpropertyPaths': server_proxy().mDefaultSubpropertyPaths,
					'clientURL': clientURL
				}, inOptCallback, inOptErrback);
			}, inOptErrback);
		}.bind(this);
		return sessions().currentUserAsynchronously(gotCurrentUser, inOptErrback);
	},
	checkServerForEdits: function(inOptChangesCallback, inOptNoChangesCallback, inOptErrback) {
		var pageGUID = globalEditorController().mPage.getRecordPropertyForPath('guid');
		var pageRevision = parseInt(globalEditorController().mPage.getRecordPropertyForPath('revision'), 10);
		this.latestRevisionForPageGUID(pageGUID, function(serverRevision) {
			if (serverRevision > pageRevision) {
				logger().debug("Server revision is newer than local revision (%@ > %@)", serverRevision, pageRevision);
				if (inOptChangesCallback) inOptChangesCallback();
			} else {
				if (inOptNoChangesCallback) inOptNoChangesCallback();
			}
		}, Prototype.emptyFunction);
	},
	latestRevisionForPageGUID: function(inPageGUID, inOptCallback, inOptErrback) {
		return server_proxy().revisionForEntityGUID(inPageGUID, inOptCallback, inOptErrback);
	},
	triggerPreviewForPageGUID: function(inPageGUID) {
		service_client().executeAsynchronously('PagePreviewService', 'kickPreviewQueue', null, Prototype.emptyFunction, Prototype.emptyFunction);
	}
});
