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

//= require "./core.js"

CC.Revisions.NOTIFICATION_DID_RESTORE_ENTITY_REVISION = 'DID_RESTORE_ENTITY_REVISION';

// Revisions service responsible for fetching and restoring entity revisions.

CC.Revisions.RevisionService = Class.create({
	// Returns an single revision for an entity with a given GUID.
	getRevisionForEntityWithGUID: function(inGUID, inRevision, inOptCallback) {
		if (!inGUID || inRevision == undefined) return (inOptCallback ? inOptCallback([]) : undefined);
		var callback = function(inResponse) {
			if (inOptCallback) return inOptCallback(inResponse);
		}
		server_proxy().pastEntityForGUIDAtRevision(inGUID, inRevision, callback, callback);
	},
	// Fetches a lightweight set of revision data for an entity. Returns a rendered partial
	// ready to be inserted into the DOM. Accepts an optional revision and callback.
	getRevisionsSummaryForEntityWithGUID: function(inGUID, inRevision, inOptCallback) {
		if (!inGUID) return (inOptCallback ? inOptCallback([]) : undefined);
		var callback = function(inResponse) {
			if (inOptCallback) return inOptCallback(inResponse.response[0]);
		}
		server_proxy().revisionSummaryForGUID(inGUID, inRevision, callback, callback);
	},
	// Returns a diffed version of an entity between two specified revisions.
	// Assumes the entity is a page, and extendedAttributes.renderedPage is
	// being compared.
	getDiffForEntityBetweenRevisions: function(inGUID, inFirstRevision, inSecondRevision, inOptCallback) {
		if (!inGUID || (inFirstRevision == undefined || inSecondRevision == undefined)) return (inOptCallback ? inOptCallback() : undefined);
		server_proxy().diffForEntityBetweenRevisions(inGUID, inFirstRevision, inSecondRevision, inOptCallback, inOptCallback);
	},
	// Restores an entity with a given GUID to a state determined by a given timestamp.
	// Returns true if the operation was successful, and false otherwise.
	restoreEntityWithGUIDToRevision: function(inGUID, inRevision, inOptCallback) {
		if (!inGUID || !inRevision) return (inOptCallback ? inOptCallback() : undefined);
		var callback = function(inResponse) {
			var entity = inResponse.response;
			globalNotificationCenter().publish(CC.Revisions.NOTIFICATION_DID_RESTORE_ENTITY_REVISION, null, {'entity': entity});
			if (inOptCallback) inOptCallback(entity);
		}
		server_proxy().restoreRevision(inGUID, inRevision, callback, inOptCallback);
	}
});
