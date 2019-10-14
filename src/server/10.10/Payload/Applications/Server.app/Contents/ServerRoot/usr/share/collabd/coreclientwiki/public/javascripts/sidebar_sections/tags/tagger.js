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

CC.TAGGER_DID_ADD_TAG = 'DID_ADD_TAG';
CC.TAGGER_DID_REMOVE_TAG = 'DID_REMOVE_TAG';

CC.Tagger = Class.create({

	initialize: function(element) {
		this.element = $(element);
		this.options = this.element.getDataAttributes();
		
		this.tag_editor = new CC.TagEditor(this.element.down('.cc-tag-editor'));
		
		this.tags = this.cacheTags();
		
		this.element.on('item:added', this.onItemAdded.bindAsEventListener(this));
		this.element.on('item:triggered', this.onItemTriggered.bindAsEventListener(this));
		this.element.on('item:removed', this.onItemRemoved.bindAsEventListener(this));
	},
	onItemAdded: function(e) {
		var token = e.memo;
		var params = token.serialize();
		var tagName = params.name;
		if (!tagName.match(/\S/)) return;
		var ownerGUID = CC.meta('x-apple-entity-guid');
		server_proxy().addTagForOwner(tagName, ownerGUID, function() {
			globalNotificationCenter().publish(CC.TAGGER_DID_ADD_TAG, this, {'tag': tagName});
		}.bind(this), function() {
			this.tag_editor.tag_collection.remove(token);
			notifier().printErrorMessage("_Tagger.TagAdded.Failure".loc());
		}.bind(this));
		this.tags = this.cacheTags();
	},
	onItemTriggered: function(e) {
		var token = e.memo;
		var params = token.serialize();
		var url = "#{prefix}/find?tags=#{tagname}".interpolate({
			prefix: env().root_path,
			tagname: encodeURIComponent(params.name)
		});
		window.location.href = url;
	},
	onItemRemoved: function(e) {
		var token = e.memo;
		var params = token.serialize();
		var tagName = params.name;
		var entityGUID = CC.meta('x-apple-entity-guid');
		server_proxy().removeTagFromEntityWithGUID(tagName, entityGUID, function() {
			globalNotificationCenter().publish(CC.TAGGER_DID_REMOVE_TAG, this, {'tag': tagName});
		}.bind(this), function() {
			notifier().printErrorMessage("_Tagger.TagRemoved.Failure".loc());
		}.bind(this));
		this.tags = this.cacheTags();
	},
	cacheTags: function()
	{
		return this.tag_editor.tag_collection.getItems().map(function(tag) {
			return tag.serialize();
	  });
	}

});
