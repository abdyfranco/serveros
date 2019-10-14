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

// Base model class.

CC.Mvc.Model = Class.create(CC.Object, {
	// Walk like a model.
	isModel: true,
	// The type of this model.
	type: 'com.apple.Model',
	// A unique identifer for this model.
	guid: null,
	// Serializes this model to a JSON hash.
	serialize: function() {
		return {'type': this.type, 'guid': this.guid};
	}
});

// Mixin for a change-aware model; one that we can build changesets for.

CC.Mvc.Mixins.ChangeAware = {
	// Walk like a channge-aware duck.
	isChangeAware: true,
	// An array of attributes of this model to be considered when
	// building a changeset.
	mChangesetAttributes: [],
	// Private function returning a list of changeset attributes.
	// Do not override.
	_changesetAttributes: 'guid type'.w(),
	_cachedChangesetAttributes: null,
	changesetAttributes: function(inOptForceRecalculate) {
		if (!this._cachedChangesetAttributes || inOptForceRecalculate) {
			this._cachedChangesetAttributes = this.mChangesetAttributes ? this._changesetAttributes.concat(this.mChangesetAttributes) : this._changesetAttributes;
		}
		return this._cachedChangesetAttributes;
	},
	// Override serialize to return a simple object representation of this model
	// including changeset-aware attributes.
	serialize: function($super) {
		var serialized = new Object(), attrs = this.changesetAttributes(), attr;
		for (var attrIdx = 0; attrIdx < attrs.length; attrIdx++) {
			attr = attrs[attrIdx];
			serialized[attr] = this[attr];
		}
		serialized['type'] = this.type;
		serialized['guid'] = this.guid;
		return serialized;
	}
};
