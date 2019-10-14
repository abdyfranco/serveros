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

//= require "./comments.js"

CC.ModeratedCommentsSidebarCommentManager = Class.create(CC.CommentManager, {
	onItemDeleteConfirm: function($super) {
		$super();
		this.recomputeCommentHeaders();
	},
	onItemApprove: function($super, inEvent) {
		$super(inEvent);
		// Remove the just-approved comment.
		if (inEvent.memo.element) Element.remove(inEvent.memo.element);
		this.recomputeCommentHeaders();
	},
	// Shows the first comment header for each unique comment parent by iterating
	// over comments in the list. Headers need to be recomputed because the client
	// will be unsure of the comment groupings currently being displayed as they are
	// moderated client-side and paginated.
	recomputeCommentHeaders: function() {
		var collection = this.element.down('.cc-comment-collection');
		var comments = collection.select('.cc-comment');
		var commentElement, headerElement, lastSeenHeaderId, currentHeaderId;
		for (var commentIdx = 0; commentIdx < comments.length; commentIdx++) {
			commentElement = comments[commentIdx];
			if (commentElement) {
				headerElement = commentElement.down('.header .grouping');
				currentHeaderId = headerElement.getAttribute('for');
				if (currentHeaderId != lastSeenHeaderId) {
					lastSeenHeaderId = currentHeaderId;
					headerElement.addClassName('displayed');
				} else {
					headerElement.removeClassName('displayed');
				}
			}
		}
	}
});

CC.ModeratedCommentsSidebarSection = Class.create(CC.CommentsSidebarSection, {
	mShowsDisclosureTriangle: false,
	mClassName: 'moderated_comments',
	mDisplayTitle: "_Sidebars.ModeratedComments.Title".loc(),
	mSidebarSectionGUID: 'sidebars/moderated_comments',
	initialize: function($super) {
		$super();
		var manager = this.element.down('.cc-comment-manager');
		if (manager) {
			this.manager = new CC.ModeratedCommentsSidebarCommentManager(manager);
			this.manager.recomputeCommentHeaders();
		}
	},
	getPaginationIDs: function() {
		return CC.metaAsArray('x-apple-owner-unapproved-comment-guids');
	},
	didPaginateForIDs: function($super, inPaginationResults) {
		$super(inPaginationResults);
		if (this.manager) this.manager.recomputeCommentHeaders();
	}
});
