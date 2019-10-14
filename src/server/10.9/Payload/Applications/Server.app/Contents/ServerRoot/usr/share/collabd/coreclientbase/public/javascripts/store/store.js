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
//= require "../ext/object.js"

// Store tracking objects returned from the server, local modifications to those objects,
// and responsible for building changesets for objects that can be pushed back to the server.

CC.Store.BackingStore = Class.create(CC.Object, {
	// Hash tracking objects as returned by the server. Cannonical unaltered copies.
	_store: null,
	// A set of working copies for each object in the store.
	_workingCopies: null,
	// A set of working changes for objects in the working copy store.
	_changes: null,
	// A set of deferred changes for objects in the working copy store.
	_deferredChanges: null,
	_deferredChangesOrderStack: null,
	// Initialize the store.
	initialize: function() { this.purgeStore(); },
	// Push a new model into the store. We only support instances of our
	// CC.Mvc.Model base class. Returns a working copy if the object was
	// successfully added to the store, and undefined otherwise.
	pushObject: function(inObject) {
		if (!inObject || !inObject.isModel || !inObject.guid) return undefined;
		var guid = inObject.guid;
		// Add the object to the store.
		this._store.set(guid, inObject);
		// Clone and return a working copy.
		var workingCopy = CC.deepClone(inObject);
		this._workingCopies.set(guid, workingCopy);
		// Keep the store consistent by nuking any changes for this guid.
		this._changes.unset(guid);
		logger().debug("pushObject: %o", inObject);
		return workingCopy;
	},
	// Pushes an individual change for an object into the store. Returns
	// true if the change was successfully added and false otherwise.
	pushChangeForObject: function(inObject, inPropertyPath, inChange) {
		if (!inObject || !inObject.isModel || !inPropertyPath) return false;
		// Fetch the changelist for the object.
		var guid = inObject.guid;
		if (!guid || !this._store.get(guid)) return false;
		var changelist = this._changes.get(guid);
		if (!changelist) changelist = this._changes.set(guid, {});
		// Update the changelist.
		changelist[inPropertyPath] = inChange;
		// Update the working copy.
		var workingCopy = this._workingCopies.get(guid);
		if (!workingCopy) return false;
		if (inPropertyPath.indexOf('.') == -1) {
			workingCopy[inPropertyPath] = inChange;
		}
		else {
			// We have a property path, so get a reference to the property we're
			// trying to update.
			var matches = inPropertyPath.match(/(.*)\.(\w+)$/);
			if (!matches.length || matches.length < 3) return false;
			var path = matches[1], attribute = matches[2];
			var property = CC.objectForPropertyPath(path, workingCopy);
			if (!property) {
				var property = {};
				var subproperty = property;
				for (var idx = 0; idx < matches.length; idx++) {
					subproperty = subproperty[matches[idx]] = {};
				}
			}
			property[attribute] = inChange;
		}
		logger().debug("pushChangeForObject: %o %o %o", inObject, inPropertyPath, inChange);
		return true;
	},
	// Pushes a bulk change for an object into the store.
	pushBulkChangeForObject: function(inObject, inBulkChanges) {
		if (!inObject || !inObject.isModel || !inBulkChanges) return false;
		for (var key in inBulkChanges) {
			if (inBulkChanges.hasOwnProperty(key)) {
				this.pushBulkChangeForObject(inObject, key, inBulkChanges[key]);
			}
		}
		logger().debug("pushBulkChangeForObject: %o %o", inObject, inBulkChanges);
		return true;
	},
	// Pushes a deferred individual change for an object into the store. A deferred
	// change is determined by the object being updated, the property being changed
	// and a callback function calculating the new value. Deferred values will be
	// calculated once calculateDeferredChanges() is called on the parent store.
	// Deferred store changes are calculated in the order in which they were pushed.
	// Returns true if the change was successfully queued, and false otherwise.
	pushChangeForObjectUsingDeferred: function(inObject, inPropertyPath, inCallback) {
		if (!inObject || !inObject.isModel || !inPropertyPath) return false;
		// Fetch the list of deferred changes for the object.
		var guid = inObject.guid;
		if (!guid || !this._store.get(guid)) return false
		var deferred = this._deferredChanges.get(guid);
		if (!deferred) deferred = this._deferredChanges.set(guid, []);
		// Each deferred change is stored as a property and callback tuple.
		var change = [inPropertyPath, inCallback];
		deferred.push(change);
		this._deferredChanges.set(guid, deferred);
		if (!this._deferredChangesReverseMap.get(guid)) {
			this._deferredChangesStack.push(guid);
			this._deferredChangesReverseMap.set(guid, true);
		}
		logger().debug("pushDeferredChangeForObject: %o %o %o", inObject, inPropertyPath, inCallback);
		return true;
	},
	// Returns the working copy for an object with a given GUID.
	workingCopyForGUID: function(inGUID) {
		return (inGUID && this._workingCopies && this._workingCopies.get(inGUID));
	},
	// Removes an object with a given identifer from the store if it exists.
	// Returns the object where it was successfully removed, and undefined
	// otherwise.
	popObject: function(inGUID) {
		if (!inGUID || !this._store.get(inGUID)) return undefined;
		this._changes.unset(inGUID);
		return this._store.unset(inGUID);
	},
	// Deletes everything from the store.
	purgeStore: function() {
		this._store = new Hash();
		this._workingCopies = new Hash();
		this.purgeChangesFromStore();
	},
	purgeChangesFromStore: function() {
		this._changes = new Hash();
		this._deferredChanges = new Hash();
		this._deferredChangesStack = new Array();
		this._deferredChangesReverseMap = new Hash();
	},
	// Deletes any trace of a given GUID from the store.
	purgeGUID: function(inGUID) {
		if (!inGUID || !this._store.get(inGUID)) return false;
		this._store.unset(inGUID);
		this._changes.unset(inGUID);
		this._workingCopies.unset(inGUID);
		this._deferredChanges.unset(inGUID);
		return true;
	},
	// Calculates any deferred record changes, pushing the results back into the store.
	// If inOptCalculateOnly is specified, changes are calculated and returned without
	// being pushed into the store.
	calculateDeferredChanges: function(inOptCalculateOnly) {
		var deferredChanges = this._deferredChanges;
		var deferredGUIDs = this._deferredChangesStack;
		if (!deferredGUIDs || deferredGUIDs.length == 0) return [];
		var result = {}, deferredChangeIdx, deferredGUID;
		for (deferredGUIDIdx = 0; deferredGUIDIdx < deferredGUIDs.length; deferredGUIDIdx++) {
			deferredGUID = deferredGUIDs[deferredGUIDIdx];
			result[deferredGUID] = this.calculateDeferredChangesForGUID(deferredGUID, inOptCalculateOnly);
		}
		logger().debug("calculateDeferredChanges: %o %o", inOptCalculateOnly, result);
		return result;
	},
	// Calculates any deferred record changes for a given block guid, pushing the results back
	// into the store. If inOptCalculateOnly is specified, changes are calculated and returned
	// without being pushed into the store.
	calculateDeferredChangesForGUID: function(inGUID, inOptCalculateOnly) {
		if (!inGUID) return undefined;
		var deferredChanges = this._deferredChanges.get(inGUID);
		if (!deferredChanges || deferredChanges.length == 0) return [];
		var deferredChangeIdx, deferredChange, deferredChangePropertyPath, deferredChangeCallback, value, result = [];
		for (deferredChangeIdx = 0; deferredChangeIdx < deferredChanges.length; deferredChangeIdx++) {
			deferredChange = deferredChanges[deferredChangeIdx];
			deferredChangePropertyPath = deferredChange[0];
			deferredChangeCallback = deferredChange[1];
			// Evaluate the deferred property.
			value = (deferredChangeCallback ? deferredChangeCallback() : undefined);
			// Push the evaluated property onto the changeset for this GUID.
			result.push([deferredChangePropertyPath, value, null]);
			// Bail early if we're calculating deferred changes only.
			if (inOptCalculateOnly) continue;
			// Otherwise push the change into the store.
			this.pushChangeForObject(this._workingCopies.get(inGUID), deferredChangePropertyPath, value);
		}
		logger().debug("calculateDeferredChangesForGUID: %o %o %o", inGUID, (inOptCalculateOnly == true), result);
		return result;
	},
	// Builds a changeset for a model with a given guid. Returns a changeset, which
	// is a dictionary of revision (an integer) and changes (a tuple of key, new value
	// pairs and timestamp).
	buildChangesetForObjectWithGUID: function(inGUID) {
		if (!inGUID) return undefined;
		var changeset = [], changelist = this._changes.get(inGUID);
		if (!changelist) return undefined;
		// Get the working copy so we can calculate which attributes to include
		// in the changeset.
		var workingCopy = this._workingCopies.get(inGUID);
		if (!workingCopy || !workingCopy.isChangeAware) return undefined;
		var attributes = workingCopy.changesetAttributes();
		// Track any keys we've already added to the changeset.
		var changeKeysSoFar = $A([]);
		// Build the changeset.
		var propertyPath, value, type;
		for (var key in changelist) {
			propertyPath = key;
			// Only consider the root of a property path.
			if (propertyPath.match(/\./)) propertyPath = propertyPath.split('.')[0];
			// Bail if the property is not flagged for inclusion in a changeset.
			if (attributes.indexOf(propertyPath) == -1) continue;
			value = workingCopy[propertyPath];
			// Map any fancy attributes to vanilla objects.
			if ((type = CC.typeOf(value)) && (type == CC.T_OBJECT || type == CC.T_HASH) && value.toObject) value = value.toObject();
			if (changeKeysSoFar.include(propertyPath)) continue;
			changeset.push([propertyPath, value, null]);
			changeKeysSoFar.push(propertyPath);
		}
		return changeset
	},
	// Bulk builds a set of changesets for an array of models. Returns
	// a dictionary of changesets keyed by model guid.
	buildChangesetForObjectsWithGUIDs: function(inGUIDs) {
		var changesets = {}, guidIdx, guid;
		if (!inGUIDs) return changesets;
		if (CC.typeOf(inGUIDs) != 'array') inGUIDs = [inGUIDs];
		for (guidIdx = 0; guidIdx < inGUIDs.length; guidIdx++) {
			guid = inGUIDs[guidIdx];
			changesets[guid] = this.buildChangesetForObjectWithGUID(guid);
		}
		logger().debug("buildChangesetForObjectWithGUIDs: %o %o", inGUIDs, changesets);
		return changesets;
	},
	// Returns a hash of changesets for all modified objects in the store.
	allChanges: function() {
		return this.buildChangesetForObjectsWithGUIDs(this._changes.keys());
	},
	// Returns a double-array of object guids and changests for all modified objects with a matching type in the store.
	allChangesForModelType: function(inType) {
		if (!inType) return [];
		var guids = [];
		var workingCopyValues = this._workingCopies.values(), workingCopyValueIdx, workingCopyValue;
		for (workingCopyValueIdx = 0; workingCopyValueIdx < workingCopyValues.length; workingCopyValueIdx++) {
			workingCopyValue = workingCopyValues[workingCopyValueIdx];
			if (workingCopyValue.isModel && workingCopyValue.type == inType) guids.push(workingCopyValue.guid);
		}
		return this.buildChangesetForObjectsWithGUIDs(guids);
	},
	// Returns true if the store has unsaved changes.
	hasUnsavedChanges: function() {
		return (this._changes.size() > 0 || this._deferredChanges.size() > 0);
	}
});
