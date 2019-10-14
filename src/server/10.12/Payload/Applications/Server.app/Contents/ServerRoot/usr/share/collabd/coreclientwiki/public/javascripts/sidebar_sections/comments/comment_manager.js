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

CC.CommentManager = Class.create({
	
	// Parent CC.SidebarSection instance for this comment manager (if it exists).
	section: null,
	
	initialize: function(element) {
		this.element = $(element);
		
		this.collection = new CC.CommentCollection(this.element.down('.cc-comment-collection'));
		
		if (this.element.down('.cc-comment-editor'))
		    this.editor = new CC.CommentEditor(this.element.down('.cc-comment-editor'));
		
		this.element.on('item:save', this.onItemSave.bindAsEventListener(this));
		this.element.on('item:delete', this.onItemDelete.bindAsEventListener(this));
		this.element.on('item:approve', this.onItemApprove.bindAsEventListener(this));
		this.element.on('item:read', this.onItemMarkedAsRead.bindAsEventListener(this));
	},
	
	onItemSave: function(e) {
		var comment = e.memo;
		if (comment.body.length == 0) return;
		// 8361696
		var temporaryComment = this.editor.element.down('.cc-comment').cloneNode(true).addClassName('temporary');
		temporaryComment.down('.mid').update(Builder.node('pre', comment.body));
		Element.insert(this.collection.element, {'top': temporaryComment});
		this.publishSidebarDidChange();
		var ownerGUID = CC.meta('x-apple-entity-guid');
		server_proxy().addCommentToOwnerGUID(comment.body, ownerGUID, this.onItemSaveSuccess.bind(this), this.onItemSaveFailure.bind(this));
	},
	onItemSaveSuccess: function(response) {
		if (response && response.response) {
			var renderedComment = this.section.renderCommentElementForComment(response.response);
			renderedComment.removeClassName('unread');
			this.collection.add(new CC.Comment(renderedComment));
			$$('.cc-comment.temporary').invoke('remove');
		} else {
			this.onItemSaveFailure(response);
		}
	},
	onItemSaveFailure: function(response) {
		notifier().printErrorMessage("_CommentManager.CommentCreate.Failure".loc());
		$$('.cc-comment.temporary').invoke('remove');
		this.publishSidebarDidChange();
	},
	
	onItemDelete: function(e) {
		this._commentToDelete = e.memo;
		if (!$('delete_comment_dialog')) {
			dialogManager().drawDialog('delete_comment_dialog', [
				"_CommentManager.CommentDelete.Description".loc()
			], "_Dialogs.OK".loc(), false, "_CommentManager.CommentDelete.Title".loc(), "_Dialogs.Cancel".loc());
		}
		dialogManager().show('delete_comment_dialog', null, this.onItemDeleteConfirm.bind(this), e.memo.element);
	},
	onItemDeleteConfirm: function() {
		var comment = this._commentToDelete;
		server_proxy().deleteCommentWithGUID(comment.serialize().guid, Prototype.emptyFunction, this.onItemDeleteFailure.bind(this));
		smokey().showOverElement(comment.element);
		Element.remove(comment.element);
		this._commentToDelete = null;
		this.publishSidebarDidChange();
	},
	onItemDeleteFailure: function() {
		notifier().printErrorMessage("_CommentManager.CommentDelete.Failure".loc());
		this.publishSidebarDidChange();
	},
	
	onItemApprove: function(e) {
		var comment = e.memo;
		server_proxy().approveCommentWithGUID(comment.serialize().guid, Prototype.emptyFunction, this.onItemApproveFailure.bind(this));
		comment.element.removeClassName('unapproved');
		this.publishSidebarDidChange();
	},
	onItemApproveFailure: function(response) {
		notifier().printErrorMessage("_CommentManager.CommentApprove.Failure".loc());
		this.publishSidebarDidChange();
	},
	
	onItemMarkedAsRead: function(inEvent) {
		var unread = this.collection.element.select('.unread');
		var unreadElement = this.collection.element.up('.cc-sidebar-section').down('h3 .count');
		if (unreadElement) {
			unreadElement.innerHTML = (unreadCount > 0 ? "_Sidebars.Title.Unread.Count".loc(unreadCount) : "");
		}
	},
	
	publishSidebarDidChange: function() {
		globalNotificationCenter().publish(CC.PaginatingSidebar.NOTIFICATION_PAGINATING_SIDEBAR_CONTENT_DID_CHANGE, this.section);
	}
	
});