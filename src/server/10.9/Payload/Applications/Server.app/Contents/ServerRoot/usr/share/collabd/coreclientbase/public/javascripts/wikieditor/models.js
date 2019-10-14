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

// Model for a block.

CC.WikiEditor.BlockModel = Class.create(CC.Mvc.Model, CC.Mvc.Mixins.ChangeAware, {
	type: 'com.apple.model.Block',
	blockType: 'unknown',
	mChangesetAttributes: 'blockType extendedAttributes'.w(),
	// Block GUIDs are generated client-side so we don't have to hit the server
	// for every change by the user before saving, and so we don't end up with
	// rogue blocks that have been created and later deleted before saving the page.
	// When we instantiate a new block model, we auto-provision an model GUID.
	initialize: function($super) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		if (!this.guid) {
			var generator = new CC.GuidBuilder();
			this.guid = generator.toString();
		}
	}
});
