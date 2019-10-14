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


CC.EntityMixins = CC.EntityMixins || new Object();

// Container with comments mixin, e.g. a project or a blog.

CC.EntityMixins.COMMENT_ACCESS_DISABLED = 'disabled';
CC.EntityMixins.COMMENT_ACCESS_ALL = 'all';
CC.EntityMixins.COMMENT_ACCESS_AUTHENTICATED = 'authenticated';
CC.EntityMixins.COMMENT_ACCESS_DEFAULT = CC.EntityMixins.COMMENT_ACCESS_AUTHENTICATED;
CC.EntityMixins.COMMENT_ACCESS_ALLOWED_VALUES = [
	CC.EntityMixins.COMMENT_ACCESS_DISABLED,
	CC.EntityMixins.COMMENT_ACCESS_ALL,
	CC.EntityMixins.COMMENT_ACCESS_AUTHENTICATED
];

CC.EntityMixins.COMMENT_MODERATION_DISABLED = 'disabled';
CC.EntityMixins.COMMENT_MODERATION_ALL = 'all';
CC.EntityMixins.COMMENT_MODERATION_ANONYMOUS = 'anonymous';
CC.EntityMixins.COMMENT_MODERATION_DEFAULT = CC.EntityMixins.COMMENT_MODERATION_DISABLED;
CC.EntityMixins.COMMENT_MODERATION_ALLOWED_VALUES = [
	CC.EntityMixins.COMMENT_MODERATION_DISABLED,
	CC.EntityMixins.COMMENT_MODERATION_ALL,
	CC.EntityMixins.COMMENT_MODERATION_ANONYMOUS
];

CC.EntityMixins.ContainerWithComments = {
	getCommentAccessLevel: function() {
		var xattrs = (this.extendedAttributes || {});
		var settings = (xattrs['settings'] || {});
		return settings['comments'];
	},
	setCommentAccessLevel: function(inLevel) {
		if (CC.EntityMixins.COMMENT_ACCESS_ALLOWED_VALUES.include(inLevel)) {
			if (!this.extendedAttributes) this.extendedAttributes = {};
			if (!this.extendedAttributes.settings) this.extendedAttributes.settings = {};
			this.extendedAttributes.settings.comments = inLevel;
		}
		return false;
	},
	getCommentModerationLevel: function() {
		var xattrs = (this.extendedAttributes || {});
		var settings = (xattrs['settings'] || {});
		return settings['commentModeration'];
	},
	setCommentModerationLevel: function(inLevel) {
		if (CC.EntityMixins.COMMENT_MODERATION_ALLOWED_VALUES.include(inLevel)) {
			if (!this.extendedAttributes) this.extendedAttributes = {};
			if (!this.extendedAttributes.settings) this.extendedAttributes.settings = {};
			this.extendedAttributes.settings.commentModeration = inLevel;
		}
		return false;
	}
};
