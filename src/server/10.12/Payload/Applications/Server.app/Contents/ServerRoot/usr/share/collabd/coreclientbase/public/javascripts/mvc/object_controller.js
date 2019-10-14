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

// Base object controller class.

CC.Mvc.ObjectController = Class.create(CC.Object, {
	mStore: null,
	mRecord: null,
	mViewInstance: null,
	// Safe methods for getting and setting model properties on this record backing this
	// object controller. Any changes to the record go through the store.
	// Returns a property at a given path for the record managed by this controller.
	// Returns undefined where the property or record itself doesn't exist.
	getRecordPropertyForPath: function(inPropertyPath, inDefaultValue) {
		if (!inPropertyPath || !this.mRecord) return undefined;
		var property = CC.objectForPropertyPath(inPropertyPath, this.mRecord);
		return (property != undefined ? property : inDefaultValue);
	},
	// Updates the record backing this object controller with a new value for a given
	// property path. Returns true if the property was successfully updated, and false
	// otherwise.
	setRecordPropertyForPath: function(inPropertyPath, inValue) {
		if (!inPropertyPath || !this.mStore || !this.mRecord) return undefined;
		return this.mStore.pushChangeForObject(this.mRecord, inPropertyPath, inValue);
	},
	// Updates the record backing this object controller using a deferred callback.
	setRecordPropertyForPathUsingDeferred: function(inPropertyPath, inDeferredCallback) {
		if (!inPropertyPath || !this.mStore || !this.mRecord) return undefined;
		return this.mStore.pushChangeForObjectUsingDeferred(this.mRecord, inPropertyPath, inDeferredCallback);
	}
});
