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

// Simple wrapper class for link item with a title/tooltip/url/route.

CC.ItemWithTitleAndURL = Class.create(CC.Object, {
	mDisplayTitle: null,
	mTooltip: null,
	mURL: null
});
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

CC.SidebarSection = Class.create(CC.Keyboard.Mixins.Responder, {
	mClassName: '',
	mDisplayTitle: "Sidebar Title",
	mSidebarSectionGUID: 'sidebar/generic',
	mShowsDisclosureTriangle: true,
	initialize: function() {
		this.element = this.render();
		if (this.mShowsDisclosureTriangle) this.element.down('h3').on('click', this.onHeaderClick.bindAsEventListener(this));
		this.guid = this.element.getDataAttributes().guid;
	},
	render: function() {
		var tagTitle = this.mDisplayTitle.toLowerCase();
		var tabIndexTagName = 'cc-tab-index-sidebar-' + tagTitle; // Use constants for this
		var tabIndexSidebarTag = accessibility().requestTabIndex(tabIndexTagName);
				
		// defaulting to -1 (=no tabindex) to avoid toString() javascript type of errors when undefined...
		if (typeof tabIndexSidebarTag === 'undefined') {
			tabIndexSidebarTag = '-1'
		}
		
		return Builder.node('div', {className: this.buildClassNames(), 'data-guid': this.mSidebarSectionGUID}, [
			Builder.node('h3', {'role': 'menuitem', 'tabindex': tabIndexSidebarTag},  [
				Builder.node('span', {className: 'disclosure'}, "‣"),
				Builder.node('span', {className: 'title ellipsis'}, this.mDisplayTitle)
			].compact()),
			Builder.node('div', {className: 'content'})
		]);
	},
	buildClassNames: function() {
		return 'cc-sidebar-section %@'.fmt(this.mShowsDisclosureTriangle ? 'collapsed ' : '') + this.mClassName;
	},
	onHeaderClick: function(e) {
		e.stop();
		this.toggle();
	},
	toggle: function() {
		this.isOpen() ? this.close() : this.open();
	},
	isOpen: function() {
		return !this.element.hasClassName('collapsed');
	},
	open: function() {
		this.element.removeClassName('collapsed');
		this.element.writeAttribute('aria-pressed', 'true');
		globalCookieManager().setCookie('cc.' + this.mSidebarSectionGUID, true);
	},
	close: function() {
		this.element.addClassName('collapsed');
		this.element.writeAttribute('aria-pressed', 'false');
		globalCookieManager().destroyCookie('cc.' + this.mSidebarSectionGUID);
	},
	restoreOpenStateFromCookie: function() {
		var open = !this.mShowsDisclosureTriangle || globalCookieManager().getCookie('cc.' + this.mSidebarSectionGUID);
		open ? this.open() : this.close();
	}
});
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



CC.PaginatingSidebar = CC.PaginatingSidebar || new Object();
CC.PaginatingSidebar.NOTIFICATION_PAGINATING_SIDEBAR_CONTENT_DID_CHANGE = 'PAGINATING_SIDEBAR_CONTENT_DID_CHANGE';

CC.PaginatingSidebarSection = Class.create(CC.SidebarSection, {
	// Should this sidebar paginate as soon as it is loaded and open.
	mShouldPaginateOnLoad: true,
	// An array of IDs to paginate through.
	mPaginationIDs: null,
	// An internal array of the current items we're paginating.  Will be reset across paginations.
	mPaginationWindow: [],
	// Number of items per pagination.
	mItemCountPerPagination: 5,
	// Number of items to show before paginating.
	mItemCountBeforePaginating: 5,
	// Empty placeholder string.
	mEmptyPlaceholderString: "_Sidebars.No.Results.Found".loc(),
	initialize: function($super) {
		$super();
		this.mPaginationIDs = this.getPaginationIDs();
		// Build a pagination link.
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_SHOWMORE);
		this.mPaginationElement = Builder.node('div', {className: 'cc-sidebar-pagination' + (this.mShouldPaginateOnLoad ? ' loading' : ''), 'data-pagination-ids': this.mPaginationIDs.join(',')}, [
			Builder.node('a', {'tabindex': tabIndex, 'role': 'link'}, "_Sidebars.Show.More".loc()),
			Builder.node('h2', {className: 'placeholder'}, this.mEmptyPlaceholderString)
		]);
		this.element.down('.content').appendChild(this.mPaginationElement);
		// Paginate more results on click.
		bindEventListeners(this, [
			'handleSidebarContentsDidChange'
		]);
		Element.observe(this.mPaginationElement.down('a'), 'click', this.paginate.bind(this));
		// React to sidebar changed notifications.
		globalNotificationCenter().subscribe(CC.PaginatingSidebar.NOTIFICATION_PAGINATING_SIDEBAR_CONTENT_DID_CHANGE, this.handleSidebarContentsDidChange, this);
	},
	open: function($super) {
		$super();
		if (this.mShouldPaginateOnLoad && !this.mDidPaginateOnLoad) {
			this.mDidPaginateOnLoad = true;
			this.paginate();
		}
	},
	// Your subclass should override this to return an array pf IDs to paginate through.
	getPaginationIDs: function() { /* Interface */ },
	// Fetches an array of objects from the server. Your subclass should override this
	// method to retrieve data, and call didPaginateForIDs passing the result.
	paginateForIDs: function(inPaginationIDs) { /* Interface */ },
 	// Should render any pagination items in this sidebar. Remember to call $super() to get any
	// built-in behavior after a pagination.
	didPaginateForIDs: function(inPaginationResults) {
		var ids = this.mPaginationIDs;
		var paginationWindow = this.mPaginationWindow;
		for (var paginationWindowIdx = 0; paginationWindowIdx < paginationWindow.length; paginationWindow++) {
			ids = ids.without(paginationWindow[paginationWindowIdx]);
		}
		this.mPaginationIDs = ids;
		this.mPaginationElement.writeAttribute('data-pagination-ids', this.mPaginationIDs.join(","));
		globalNotificationCenter().publish(CC.PaginatingSidebar.NOTIFICATION_PAGINATING_SIDEBAR_CONTENT_DID_CHANGE, this);
	},
	// Loads n more results for this sidebar.
	paginate: function() {
		if (!this.mPaginationElement) {
			this.handleSidebarContentsDidChange();
			return true;
		}
		this.showLoadingSpinner();
		// Determine the next window of pagination GUIDs.
		var delta = this.mItemCountPerPagination;
		this.mPaginationWindow = (this.mPaginationIDs || []).splice(0, delta);
		if (!this.mPaginationWindow || this.mPaginationWindow.length == 0) {
			this.handleSidebarContentsDidChange();
			return false;
		};
		// Actually fetch the items.
		return this.paginateForIDs(this.mPaginationWindow);
	},
	updatePaginator: function() {
		this.hideLoadingSpinner();
		if (this.isEmpty()) {
			this.showEmptyPlaceholder();
		} else if (!this.mPaginationIDs || this.mPaginationIDs.length == 0) {
			Element.hide(this.mPaginationElement);
		} else {
			this.hideEmptyPlaceholder();
		}
	},
	showLoadingSpinner: function() {
		Element.show(this.mPaginationElement);
		this.mPaginationElement.addClassName('loading');
	},
	hideLoadingSpinner: function() {
		this.mPaginationElement.removeClassName('loading');
	},
	showEmptyPlaceholder: function() {
		Element.show(this.mPaginationElement);
		this.mPaginationElement.addClassName('empty');
	},
	hideEmptyPlaceholder: function() {
		this.mPaginationElement.removeClassName('empty');
	},
	// Returns true if this sidebar is empty. Subclasses should implement this method.
	isEmpty: function() {
		return false;
	},
	handleSidebarContentsDidChange: function() {
		this.element.addClassName('ready');
		this.updatePaginator();
	}
});
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




CC.CommentsSidebarSection = Class.create(CC.PaginatingSidebarSection, {
	mClassName: 'comments',
	mDisplayTitle: "_Sidebars.Comments.Title".loc(),
	mSidebarSectionGUID: 'sidebars/comments',
	mEmptyPlaceholderString: "_Sidebars.Comments.Empty.Placeholder".loc(),
	initialize: function($super) {
		$super();
		var manager = this.element.down('.cc-comment-manager');
		if (manager) {
			this.manager = new CC.CommentManager(manager);
			// Hook the manager to the section so we can notify it when comments are added/removed/moderated.
			this.manager.section = this;
		}
	},
	getPaginationIDs: function() {
		return CC.metaAsArray('x-apple-entity-comment-guids');
	},
	render: function($super) {
		var elem = $super();
		var managerElement = Builder.node('div', {className: 'cc-comment-manager', id: 'comments_sidebar'});
		// Can the logged in user comment?
		var userCanComment = CC.meta('x-apple-user-can-comment');
		if (userCanComment) {
			var userDisplayName = (CC.meta('x-apple-user-longName') || CC.meta('x-apple-user-shortName'));
			var userAvatarGUID = CC.meta('x-apple-user-avatarGUID');
			var tabIndexComment = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_COMMENTS);
			var editorElement = Builder.node('div', {className: 'cc-comment-editor'}, [
				Builder.node('div', {'role': 'navigation', 'aria-label': "_Accessibility.Navigation.Actions".loc(), className: 'cc-sidebar-actions'}, [
					Builder.node('a', {'role': 'button', 'tabindex': ++tabIndexComment, className: 'button add'}, "_Sidebars.Comments.New.Comment".loc()),
					Builder.node('a', {'role': 'button', className: 'button cancel'}, "_General.Cancel".loc()),
					Builder.node('a', {'role': 'button', className: 'button save'}, "_General.Save".loc())
				]),
				Builder.node('div', {className: 'editor'}, [
					Builder.node('div', {className: 'cc-comment'}, [
						Builder.node('div', {className: 'body'}, [
							Builder.node('div', {className: 'top'}),
							Builder.node('div', {className: 'mid'}, [
								Builder.node('textarea', {'role': 'textbox', 'tabindex': ++tabIndexComment})
							]),
							Builder.node('div', {className: 'bottom'}),
							Builder.node('div', {className: 'norgie'})
						]),
						Builder.node('div', {'tabindex': '-1', className: 'author'}, [
							Builder.node('span', {'tabindex': '-1', className: 'icon' + (userAvatarGUID ? '' : ' default')}),
							Builder.node('span', {'tabindex': '-1', className: 'username ellipsis'}, userDisplayName),
							Builder.node('span', {'tabindex': '-1', className: 'datetime ellipsis'}, "_Sidebars.Comments.New.Comment".loc())
						])
					])
				])
			]);
			if (userAvatarGUID) {
				Element.insert(editorElement.down('span.icon'), {'top': Builder.node('img', {'src': "/wiki/files/download/%@".fmt(userAvatarGUID)})});
			}
			managerElement.appendChild(editorElement);
		}
		managerElement.appendChild(Builder.node('div', {className: 'cc-comment-collection'}));
		elem.down('.content').appendChild(managerElement);
		return elem;
	},
	paginateForIDs: function($super, inPaginationIDs) {
		var boundCallback = this.didPaginateForIDs.bind(this);
		return server_proxy().commentsForCommentGUIDs(inPaginationIDs, boundCallback, boundCallback);
	},
	didPaginateForIDs: function($super, inPaginationResults) {
		if (inPaginationResults && inPaginationResults.length) {
			for (pdx = 0; pdx < inPaginationResults.length; pdx++) {
				var comment = inPaginationResults[pdx];
				var commentElement = this.renderCommentElementForComment(comment);
				this.manager.collection.itemInsertionPoint = 'bottom';
				this.manager.collection.add(new CC.Comment(commentElement));
				this.manager.collection.itemInsertionPoint = 'top';
			}
		}
		$super();
	},
	renderCommentElementForComment: function(inComment) {
		var adminOrOwner = (CC.meta('x-apple-user-is-admin') == "true" || CC.meta('x-apple-user-is-owner') == "true");
		var commentAuthor = (inComment.authorUserGUID == CC.meta('x-apple-user-guid'));
		var hasActions = (adminOrOwner || CC.meta('x-apple-user-can-comment') == "true");
		if (!inComment.isApproved && !adminOrOwner) hasActions = false;
		var classes = 'cc-comment selectable' + (inComment.isRead ? '' : ' unread') + (inComment.isApproved ? '' : ' unapproved') + (hasActions ? ' hasactions' : '');
		var element = Builder.node("div", {'className': classes, 'data-guid': inComment.guid, 'data-entityGUID': inComment.entityGUID, 'data-authorUserGUID': inComment.authorUserGUID, 'data-isApproved': inComment.isApproved}, [
			Builder.node('div', {className: 'header'}, [
				Builder.node('span', {className: 'grouping', 'for': inComment.entityGUID}, localizedContainerString((inComment.entityLongName || inComment.entityShortName), inComment.entityType))
			]),
			Builder.node('div', {className: 'body'}, [
				Builder.node('div', {className: 'unread-indicator'}),
				Builder.node('div', {className: 'top'}),
				Builder.node('div', {className: 'mid'}),
				Builder.node('div', {className: 'bottom'}),
				Builder.node('div', {className: 'norgie'})
			]),
			Builder.node('div', {className: 'author'}, [
				Builder.node('span', {className: 'icon' + (inComment.authorUserAvatarGUID ? '' : ' default')}),
				Builder.node('span', {className: 'username ellipsis'}, (inComment.authorUserLongName || inComment.authorUserLogin).loc()),
				Builder.node('span', {className: 'datetime ellipsis'}, globalLocalizationManager().localizedDateTime(inComment.createTime))
			])
		]);
		if (inComment.isApproved) {
			element.writeAttribute('data-approvedByUserGUID', inComment.approvedByUserGUID);
		}
		// Show a custom user avatar for the comment if we have one.
		if (inComment.authorUserAvatarGUID) {
			element.down('div.author span.icon').appendChild(Builder.node('img', {src: "/wiki/files/download/%@".fmt(inComment.authorUserAvatarGUID)}));
		}
		// If the comment is not approved, show a placeholder string to non-admin creators.
		// Otherwise just display the comment normally.
		if (!inComment.isApproved && commentAuthor && !adminOrOwner) {
			element.down('div.mid').appendChild(Builder.node('p', {className: 'moderation message'}, "_Sidebars.Comments.Unmoderated.Message".loc()));
		} else {
			element.down('div.mid').appendChild(Builder.node('pre', {className: 'ellipsis'}, inComment.body));
		}
		// Display an unmoderated comment banner if we need to.
		if (adminOrOwner && !inComment.isApproved) {
			element.down('div.body').appendChild(Builder.node('div', {className: 'moderation banner'}, "_Sidebars.Comments.Unmoderated.Banner".loc()));
		}
		// Build the actions for this comment.
		var actions = Builder.node('div', {className: 'actions'});
		if (adminOrOwner || commentAuthor) {
			actions.appendChild(Builder.node('a', {className: 'button delete'}, "_Sidebars.Comments.Delete".loc()));
		}
		if (adminOrOwner && !inComment.isApproved) {
			actions.appendChild(Builder.node('a', {className: 'button approve'}, "_Sidebars.Comments.Delete".loc()));
		}
		element.down('div.body').appendChild(actions);
		return element;
	},
	isEmpty: function() {
		return (this.element.down('.cc-comment-collection .cc-comment') == undefined);
	}
});
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

CC.Comment = Class.create({

	initialize: function(element) {
		this.element = $(element);
		this.element.on('click', this.onElementClick.bindAsEventListener(this));
		var deleteBtn = this.element.down('.button.delete');
		if (deleteBtn) deleteBtn.on('click', this.onDeleteButtonClick.bindAsEventListener(this));
		var approveBtn = this.element.down('.button.approve');
		if (approveBtn) approveBtn.on('click', this.onApproveButtonClick.bindAsEventListener(this));
	},
	
	onElementClick: function(e) {
		this.element.removeClassName('unread');
		this.element.fire('item:read', this);
	},
	onDeleteButtonClick: function(e) {
		e.stop();
		this.element.fire('item:delete', this);
	},
	onApproveButtonClick: function(e) {
		e.stop();
		this.element.fire('item:approve', this);
	},
	
	serialize: function() {
		return this.element.getDataAttributes();
	}

});

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



CC.CommentCollection = Class.create(CC.Collection, {

	itemClass: CC.Comment,
	itemSelector: '.cc-comment',
	itemInsertionPoint: 'top'

});
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

CC.CommentEditor = Class.create({
	
	initialize: function(element) {
		this.element = $(element);
		this.element.down('.add').on('click', this.onOpenButtonClick.bindAsEventListener(this));
		this.element.down('.cancel').on('click', this.onCancelButtonClick.bindAsEventListener(this));
		this.element.down('.save').on('click', this.onSaveButtonClick.bindAsEventListener(this));
		this.textarea = this.element.down('.body textarea');
		Element.observe(this.textarea, 'keydown', function(e) {
			e.stopPropagation();
		});
		Element.observe(this.textarea, 'keyup', this.autogrow.bind(this));
	},
	
	onOpenButtonClick: function(e) {	
		// Remove tabindex for Add button and generate tabindex for save and cancel button
		var tabIndexComment = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_COMMENTS);
		var add = this.element.querySelector('a.add');
		var save = this.element.querySelector('a.save');
		var cancel = this.element.querySelector('a.cancel');
		add.writeAttribute('tabindex', '-1');
		save.writeAttribute('tabindex', ++tabIndexComment);
		cancel.writeAttribute('tabindex', ++tabIndexComment);
						
		e.stop();
		this.open();
	},
	onCancelButtonClick: function(e) {
		// Remove tabindex for Save and Cancel button to avoid tab on hidden items
		var tabIndexComment = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_COMMENTS);
		var add = this.element.querySelector('a.add');
		var save = this.element.querySelector('a.save');
		var cancel = this.element.querySelector('a.cancel');
		add.writeAttribute('tabindex', ++tabIndexComment);
		save.writeAttribute('tabindex', '-1');
		cancel.writeAttribute('tabindex', '-1');
				
		e.stop();
		this.close();
	},
	onSaveButtonClick: function(e) {
		// Remove tabindex for Save and Cancel button to avoid tab on hidden items
		var tabIndexComment = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_COMMENTS);
		var add = this.element.querySelector('a.add');
		var save = this.element.querySelector('a.save');
		var cancel = this.element.querySelector('a.cancel');
		add.writeAttribute('tabindex', ++tabIndexComment);
		save.writeAttribute('tabindex', '-1');
		cancel.writeAttribute('tabindex', '-1');
		
		e.stop();
		this.save();
	},
	
	open: function() {
		this.element.up('.cc-sidebar-section').addClassName('editing');
		this.element.addClassName('editing');
		this.textarea.focus();
	},
	close: function() {
		this.clear();
		this.element.up('.cc-sidebar-section').removeClassName('editing');
		this.element.removeClassName('editing');
	},
	clear: function() {
		this.textarea.value = '';
	},
	save: function() {
		var comment = {
			entityGUID: CC.meta('x-apple-parent-guid'),
			body: $F(this.textarea)
		};
		this.element.fire('item:save', comment);
		this.close();
	},
	// set the height to the scrollHeight
	autogrow: function(inEvent) {
		var currentHeight = this.textarea.scrollHeight;
		if (currentHeight != this.cachedHeight) {
			this.textarea.style.height = currentHeight+'px';
			this.cachedHeight = currentHeight
		}
	}
	
});
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



// Subscription constants.

CC.DOCUMENT_IS_UPDATED_SUBSCRIPTION = 'com.apple.notifications.DocumentUpdated';
CC.DOCUMENT_IS_RENAMED_SUBSCRIPTION = 'com.apple.notifications.DocumentRenamed';
CC.COMMENT_IS_ADDED_SUBSCRIPTION = 'com.apple.notifications.CommentAdded';
CC.COMMENT_IS_APPROVED_SUBSCRIPTION = 'com.apple.notifications.CommentApproved';

// A mixin for sidebars providing document subscription behavior.  Takes care of
// prompting for a valid preferred email address, and persisting the subscription.
// Used by the standard notifications sidebar and the container notifications sidebar.

CC.NotificationsSidebarMixin = {
	open: function($super) {
		$super();
		if (!this.mDidLoadSubscriptions) {
			this.updateCheckedStateForCurrentSubscriptions();
			this.mDidLoadSubscriptions = true;
		}
	},
	getTargetEntityGUIDForSubscription: function() {
		return CC.meta('x-apple-entity-guid');
	},
	updateCheckedStateForCurrentSubscriptions: function() {
		var entityGUID = this.getTargetEntityGUIDForSubscription();
		server_proxy().subscriptionsForEntity(entityGUID, function(response) {
			var currentSubscriptions = $A(response.response || []);
			var documentUpdatedSubscriptions = (currentSubscriptions.include(CC.DOCUMENT_IS_UPDATED_SUBSCRIPTION) && currentSubscriptions.include(CC.DOCUMENT_IS_RENAMED_SUBSCRIPTION));
			var commentsChangedSubscriptions = (currentSubscriptions.include(CC.COMMENT_IS_ADDED_SUBSCRIPTION) && currentSubscriptions.include(CC.COMMENT_IS_APPROVED_SUBSCRIPTION));
			var checkbox;
			if (documentUpdatedSubscriptions) {
				checkbox = this.element.down('input.updated');
				if (checkbox) checkbox.writeAttribute('checked', "");
			}
			if (commentsChangedSubscriptions) {
				checkbox = this.element.down('input.comments');
				if (checkbox) checkbox.writeAttribute('checked', "");
			}
			if (documentUpdatedSubscriptions && commentsChangedSubscriptions) {
				checkbox = this.element.down('input.all');
				if (checkbox) checkbox.writeAttribute('checked', "");
			}
		}.bind(this), Prototype.emptyFunction);
	},
	handleSubscriptionCheckboxChanged: function(inEvent) {
		var checkbox = Event.findElement(inEvent, 'input');
		// Are we subscribing or unsubscribing?
		var addManifest = [], removeManifest = [];
		if (checkbox.hasClassName('updated')) {
			var updatesSubscribed = checkbox.getValue();
			updatesSubscribed ? addManifest.push(CC.DOCUMENT_IS_UPDATED_SUBSCRIPTION, CC.DOCUMENT_IS_RENAMED_SUBSCRIPTION) : removeManifest.push(CC.DOCUMENT_IS_UPDATED_SUBSCRIPTION, CC.DOCUMENT_IS_RENAMED_SUBSCRIPTION);
		}
		if (checkbox.hasClassName('comments')) {
			var commentsSubscribed = checkbox.getValue();
			commentsSubscribed ? addManifest.push(CC.COMMENT_IS_ADDED_SUBSCRIPTION, CC.COMMENT_IS_APPROVED_SUBSCRIPTION) : removeManifest.push(CC.COMMENT_IS_ADDED_SUBSCRIPTION, CC.COMMENT_IS_APPROVED_SUBSCRIPTION);
		}
		if (checkbox.hasClassName('all')) {
			var allSubscribed = checkbox.getValue();
			if (allSubscribed) {
				addManifest.push(CC.DOCUMENT_IS_UPDATED_SUBSCRIPTION, CC.DOCUMENT_IS_RENAMED_SUBSCRIPTION, CC.COMMENT_IS_ADDED_SUBSCRIPTION, CC.COMMENT_IS_APPROVED_SUBSCRIPTION);
			} else {
				removeManifest.push(CC.DOCUMENT_IS_UPDATED_SUBSCRIPTION, CC.DOCUMENT_IS_RENAMED_SUBSCRIPTION, CC.COMMENT_IS_ADDED_SUBSCRIPTION, CC.COMMENT_IS_APPROVED_SUBSCRIPTION);
			}
		}
		var notificationID = notifier().queueNotificationWithParams("_Sharing.Notification.Updating.Subscription".loc(), undefined, CC.Notifier.BUSY_STATE);
		var callback = function() {
			notifier().updateNotification(notificationID, {
				mDisplayString: "_Sharing.Notification.Updating.Subscription.Succeeded".loc(),
				mState: CC.Notifier.SUCCEEDED_STATE
			});
		};
		var errback = function() {
			notifier().updateNotification(notificationID, {
				mDisplayString: "_Sharing.Notification.Updating.Subscription.Failed".loc(),
				mState: CC.Notifier.FAILED_STATE
			});
		};
		this.updateSubscriptionForEntity(this.getTargetEntityGUIDForSubscription(), addManifest, removeManifest, callback, errback);
	},
	// Updates the notification subscription for the current user for a particular entity.
	// By default, subscribes the currently logged user to recieve document and comment
	// notifications for the entity currently being displayed.
	updateSubscriptionForEntity: function(inEntityGUID, inAddManifest, inRemoveManifest, inOptCallback, inOptErrback) {
		if (!inEntityGUID) return (inOptErrback ? inOptErrback() : undefined);
		// Is the current user logged in?  If not, ask them to log in.
		if (CC.meta('x-apple-user-logged-in') != "true") {
			var currentURL = window.location;
			window.location.href = "/auth?send_token=no&redirect=" + currentURL;
			return true;
		}
		// Otherwise check the current user has a preferred email address set.
		dialogManager().showProgressMessage("_Loading".loc());
		var loggedInUserGUID = CC.meta('x-apple-user-guid');
		server_proxy().entityForGUID(loggedInUserGUID, function(entity) {
			dialogManager().hide();
			var privateAttributes = ((entity && entity.privateAttributes) || {});
			var preferredEmailAddress = privateAttributes['preferredEmailAddress'];
			if (!preferredEmailAddress) {
				if (!$('no_email_set_dialog')) {
					dialogManager().drawDialog('no_email_set_dialog', [
						"_Dialogs.NoEmailSet.Description".loc()
					], "_Dialogs.NoEmailSet.Settings".loc(), false, "_Dialogs.NoEmailSet.Title".loc());
				}
				dialogManager().show('no_email_set_dialog', null, function() {
					var userGUID = CC.meta('x-apple-user-guid')
					settingsPanel().showForGUIDAndType(userGUID, "com.apple.entity.User");
				});
			} else {
				// Build a batch of subscribe/unsubscribe calls based on the add/remove manifests we were passed.
				var batched = [];
				inAddManifest.each(function(s) {
					batched.push(['ContentService', 'subscribeToEntity:withType:', [inEntityGUID, s]]);
				});
				inRemoveManifest.each(function(s) {
					batched.push(['ContentService', 'unsubscribeFromEntity:withType:', [inEntityGUID, s]]);
				});
				return service_client().batchExecuteAsynchronously(batched, {}, inOptCallback, inOptErrback);
			}
		}, function() {
			dialogManager().hide();
			logger().error("Could not get preferredEmail setting for user before updating subscription");
		});
	}
};

CC.NotificationsSidebarSection = Class.create(CC.SidebarSection, CC.NotificationsSidebarMixin, {
	mClassName: 'notifications',
	mDisplayTitle: "_Sidebars.Notifications.Title".loc(),
	mSidebarSectionGUID: 'sidebars/notifications',
	render: function($super) {
		var elem = $super();
		var fragment = document.createDocumentFragment();
		var tabIndexNotification = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_NOTIFICATIONS);
		fragment.appendChild(Builder.node('h2', {'tabindex': '-1'}, "_Sidebars.Notifications.Email.Me.When".loc()));
		// Build the notification checkboxes.
		var updatedCheckbox = Builder.node('div', {className: 'checkbox'}, [
			Builder.node('label', {className: 'ellipsis'}, [
				Builder.node('input', {'tabindex': ++tabIndexNotification, 'role': 'checkbox', 'type': 'checkbox', className: 'updated'}),
				"_Sidebars.Notifications.Email.Document.Updated".loc()
			])
		]);
		var commentsCheckbox = Builder.node('div', {className: 'checkbox'}, [
			Builder.node('label', {className: 'ellipsis'}, [
				Builder.node('input', {'tabindex': ++tabIndexNotification, 'role': 'checkbox', 'type': 'checkbox', className: 'comments'}),
				"_Sidebars.Notifications.Email.Comments.Added".loc()
			])
		]);
		fragment.appendChild(updatedCheckbox);
		fragment.appendChild(commentsCheckbox);
		elem.down('.content').appendChild(fragment);
		// Register any event handlers.
		var updatedInput = elem.down('input.updated');
		var commentsInput = elem.down('input.comments');
		Event.observe(updatedInput, 'change', this.handleSubscriptionCheckboxChanged.bind(this));
		Event.observe(commentsInput, 'change', this.handleSubscriptionCheckboxChanged.bind(this));
		return elem;
	},
	getTargetEntityGUIDForSubscription: function() {
		return CC.meta('x-apple-entity-guid');
	}
});
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




// Container notifications sidebar.

CC.ContainerNotificationsSidebarSection = Class.create(CC.SidebarSection, CC.NotificationsSidebarMixin, {
	mShowsDisclosureTriangle: false,
	mClassName: 'container_notifications',
	mDisplayTitle: "_Sidebars.Notifications.Title".loc(),
	mSidebarSectionGUID: 'sidebars/container_notifications',
	render: function($super) {
		var elem = $super();
		var fragment = document.createDocumentFragment();
		// Build the include in all activity (isWatched) checkbox.
		var activityCheckbox = Builder.node('div', {className: 'checkbox'}, [
			Builder.node('label', {className: 'ellipsis'}, [
				Builder.node('input', {'type': 'checkbox', className: 'activity'}),
				"_Sidebars.Notifications.Container.Include.All.Activity".loc()
			])
		]);
		var ownerIsWatched = (CC.meta('x-apple-owner-isWatched') == "true");
		if (ownerIsWatched) {
			activityCheckbox.down('input.activity').writeAttribute("checked", "");
		}
		// Build the notification checkbox.
		var notificationCheckbox = Builder.node('div', {className: 'checkbox'}, [
			Builder.node('label', {className: 'ellipsis'}, [
				Builder.node('input', {'type': 'checkbox', className: 'all'}),
				"_Sidebars.Notifications.Container.Email.Updated".loc()
			])
		]);
		fragment.appendChild(activityCheckbox);
		fragment.appendChild(notificationCheckbox);
		elem.down('.content').appendChild(fragment);
		// Register any event handlers.
		var activityCheckboxInput = elem.down('input.activity');
		var notificationCheckboxInput = elem.down('input.all');
		Event.observe(activityCheckboxInput, 'change', this.handleAllActivityCheckboxClicked.bind(this));
		Event.observe(notificationCheckboxInput, 'change', this.handleSubscriptionCheckboxChanged.bind(this));
		return elem;
	},
	handleAllActivityCheckboxClicked: function(inEvent) {
		var checked = Event.findElement(inEvent, 'input').checked;
		var ownerGUID = CC.meta('x-apple-owner-guid')
		if (checked) {
			server_proxy().watchEntity(ownerGUID);
		} else {
			server_proxy().unwatchEntity(ownerGUID);
		}
	},
	getTargetEntityGUIDForSubscription: function() {
		return CC.meta('x-apple-owner-guid');
	}
});
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



CC.UpdatesSidebar = CC.UpdatesSidebar || new Object();
CC.UpdatesSidebar.NOTIFICATION_DID_OPEN_UPDATES_SIDEBAR = 'DID_OPEN_UPDATES_SIDEBAR';
CC.UpdatesSidebar.NOTIFICATION_DID_CLOSE_UPDATES_SIDEBAR = 'DID_CLOSE_UPDATES_SIDEBAR';

CC.UpdatesSidebarSection = Class.create(CC.PaginatingSidebarSection, {
	mClassName: 'updates',
	mDisplayTitle: "_Sidebars.History.Title".loc(),
	mSidebarSectionGUID: 'sidebar/updates',
	mEmptyPlaceholderString: "_Sidebars.History.Empty.Placeholder".loc(),
	initialize: function($super) {
		$super();
		this.mRevisionsView = new CC.Revisions.HistoryViewer({
			mRevisionsService: new CC.Revisions.RevisionService(),
			mRootSidebarElement: this.element.down('.content')
		});
		globalNotificationCenter().subscribe(CC.Revisions.NOTIFICATION_REVISIONS_READY, this.updatePaginator.bind(this));
	},
	getPaginationIDs: function() {
		return CC.metaAsArray('x-apple-entity-revisions');
	},
	paginateForIDs: function($super, inPaginationIDs) {
		var boundCallback = this.didPaginateForIDs.bind(this);
		var entityGUID = CC.meta('x-apple-entity-guid');
		var changeTypes = ['create', 'edit', 'delete', 'undelete', 'restore'];
		var fields = ['revision', 'updatedByUserLongName', 'updatedByUserShortName', 'updateTime'];
		return server_proxy().pastEntitiesForGUIDAndRevisionsWithChangeTypesOnlyFields(entityGUID, inPaginationIDs, changeTypes, fields, boundCallback, boundCallback);
	},
	didPaginateForIDs: function($super, inPaginationResults) {
		if (inPaginationResults) {
			var results = (inPaginationResults.response || [])
			var fragment = document.createDocumentFragment();									
			var tabIndexHistoryItem = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY);
						
			for (idx = 0; idx < results.length; idx++) {
				var item = results[idx];
				var itemElement = Builder.node('div', {'tabindex': tabIndexHistoryItem, 'role': 'menuitem', className: 'revision', 'name': "revision-%@".fmt(item.revision), 'data-revision': item.revision, 'data-update-time': item.updateTime}, [
					Builder.node('span', {className: 'unread-indicator'}),
					Builder.node('span', {className: 'author'}, (item.updatedByUserLongName || item.updatedByUserShortName).loc()),
					Builder.node('span', {className: 'time'}, globalLocalizationManager().shortLocalizedDateTime(item.updateTime))
				]);
				fragment.appendChild(itemElement);
			}
			var containerElement = this.element.down('.revisions.listing');
			containerElement.appendChild(fragment);
			this.mRevisionsView.initializeRevisions();
		}
		$super();

	},
	open: function($super) {
		$super();
		globalNotificationCenter().publish(CC.UpdatesSidebar.NOTIFICATION_DID_OPEN_UPDATES_SIDEBAR, this);
	},
	close: function($super) {
		$super();
		globalNotificationCenter().publish(CC.UpdatesSidebar.NOTIFICATION_DID_CLOSE_UPDATES_SIDEBAR, this);
	},
	isEmpty: function() {
		return (this.element.down('.revisions.listing .revision') == undefined);
	}
});
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



CC.ContainerUpdatesSidebarSection = Class.create(CC.UpdatesSidebarSection, {
	initialize: function($super) {
		this.mShowsDisclosureTriangle = false;
		$super();
	}
});
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



CC.RecentDocumentsSidebarSection = Class.create(CC.SidebarSection, {
	mClassName: 'recent_documents',
	mDisplayTitle: "_Sidebars.RecentDocuments.Title".loc(),
	mSidebarSectionGUID: 'sidebars/recent_documents',
	mDefaultHowMany: 5,
	mDefaultSortProperty: 'updateTime',
	mDefaultSortDirection: 'desc',
	mShowsDisclosureTriangle: false,
	open: function($super) {
		$super();
		if (!this.mLoaded) {
			var guid = CC.meta('x-apple-owner-guid');
			var type = CC.meta('x-apple-owner-type');
			this.loadRecentDocumentsForOwnerGUIDAndType(guid, type, this.didLoadRecentDocuments.bind(this));
			this.mLoaded = true;
		}
	},
	render: function($super) {
		var elem = $super();
		var content = elem.down('.content');
		content.appendChild(Builder.node('h2', {className: 'placeholder empty'}, "_Sidebars.RecentDocuments.Empty.Placeholder".loc()));
		return elem;
	},
	loadRecentDocumentsForOwnerGUIDAndType: function(inGUID, inType, inOptCallback) {
		this.element.addClassName('loading');
		var callback = function(inResponse) {
			if (!inOptCallback) return inResponse;
			return inOptCallback(inResponse);
		};
		return server_proxy().recentDocumentsInOptOwnerWithOptions(this.mDefaultHowMany, inGUID, undefined, callback, callback);
	},
	didLoadRecentDocuments: function(inResponse) {
		// Parse the response.
		var recents = (inResponse || []);
		// If we have a bad response, or an empty list of recent documents, display an empty placeholder.
		if (!recents || recents.length == 0) {
			this.element.addClassName('empty');
			this.element.removeClassName('loading');
			return false;
		}
		// Iterate through the related documents and build a list of DOM nodes.
		var recent, ul = Builder.node('ul');
		for (var idx = 0; idx < recents.length; idx++) {
			recent = recents[idx];
			if (!recent) continue;
			var href = CC.entityURL(recent, true);
			var updatedTimestamp = globalLocalizationManager().localizedDateTime(recent.lastActivityTime);
			ul.appendChild(Builder.node('li', [
				Builder.node('a', {href: href}, (recent.longName || recent.shortName || recent.tinyID)),
				Builder.node('span', {className: 'updated'}, updatedTimestamp)
			]));
		}
		this.element.down('.content').appendChild(ul);
		this.element.removeClassName('loading');
	}
});
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



CC.RelatedSidebarSection = Class.create(CC.PaginatingSidebarSection, {
	mClassName: 'related',
	mDisplayTitle: "_Sidebars.Related.Title".loc(),
	mSidebarSectionGUID: 'sidebars/related',
	mEmptyPlaceholderString: "_Sidebars.Related.Empty.Placeholder".loc(),
	mRelatedSearchDialog: null,
	mDocumentGUID: null,
	mRecentItemsCount: 10,
	initialize: function($super) {
		$super();
		var userCanWrite = (CC.meta('x-apple-user-can-write') == "true");
		// Hide chrome only users with write access should see.
		if (userCanWrite) {
			this.renderPopupMenu();
		} else {
			this.element.down('.cc-sidebar-actions').hide();
		}
		// Render the link search dialog, excluding this document from the results.
		this.mDocumentGUID = CC.meta('x-apple-entity-guid');
		this.mRelatedSearchDialog = new LinkSearchDialog({
			mDialogTitle: "_Sidebars.Related.Search.Dialog.Title",
			mSearchFieldPlaceholder: "_Sidebars.Related.Search.Dialog.Placeholder",
			mDialogDescription: "_Sidebars.Related.Search.Dialog.Description",
			mExcludedGUIDs: this.computeGUIDsToExclude()
		});
		if (userCanWrite) {
			this.registerEventHandlers();
		}
	},
	getPaginationIDs: function() {
		return CC.metaAsArray('x-apple-entity-relationship-guids');
	},
	render: function($super) {
		var elem = $super();		
		var tagItemRelated = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_RELATED);
		var relatedElement = Builder.node('div', {className: 'cc-related-items'}, [
			Builder.node('div', {className: 'cc-sidebar-actions'}, [
				Builder.node('a', {'tabindex': ++tagItemRelated, 'role': 'button', className: 'button add'}, "add related item")
			]),
			Builder.node('div', {className: 'cc-related-items-list'}, [
				Builder.node('ul', {className: 'items'})
			])
		]);
		elem.down('.content').appendChild(relatedElement);
		return elem;
	},
	paginateForIDs: function(inPaginationIDs) {
		var boundCallback = this.didPaginateForIDs.bind(this);
		return server_proxy().relationshipsForGUIDs(inPaginationIDs, boundCallback, boundCallback);
	},
	didPaginateForIDs: function($super, inPaginationResults, inOptRenderAtTop) {
		var relations = inPaginationResults;
		if (!relations) {
			$super();
			return;
		}
		// First get the GUID of the currently displayed entity. com.apple.Relationship objects are specified in terms
		// of a sourceEntityGUID and targetEntityGUID (where source and target can switch depending on which side the
		// relationship was originally specified on).
		var entityGUID = CC.meta('x-apple-entity-guid');
		
		var entityGUIDsForOtherSideOfRelationships = [];
		for (var idx = 0; idx < relations.length; idx++) {
			var relation = relations[idx];
			if (!relation) continue;
			var sourceEntityGUID = relation.sourceEntityGUID;
			var targetEntityGUID = relation.targetEntityGUID;
			// If the targetEntityGUID is the GUID of the currently displayed entity, prefer the source.
			if (targetEntityGUID == entityGUID) {
				entityGUIDsForOtherSideOfRelationships.push(sourceEntityGUID);
			} else {
				entityGUIDsForOtherSideOfRelationships.push(targetEntityGUID);
			}
		}
		var relationshipGUIDs = relations.collect(function(relation) {
			return relation.guid;
		});
		var options = {
			'subpropertyPaths' : {
				'ownerGUID.type': 'owner.type',
				'ownerGUID.guid': 'owner.guid',
				'ownerGUID.longName': 'owner.longName',
				'ownerGUID.shortName': 'owner.shortName'
			}
		};
		server_proxy().entitiesForGUIDsWithOptions(entityGUIDsForOtherSideOfRelationships, options, function(relatedItems) {
			this.element.removeClassName('loading');
			var fragment = document.createDocumentFragment();
			var relatedItem, renderedItem;
			for (var idx = 0; idx < relatedItems.length; idx++) {
				relatedItem = relatedItems[idx];
				// Stash away the relationship GUID for later.
				relatedItem.relationshipGUID = relationshipGUIDs[idx];
				renderedItem = this.renderRelatedItemForResult(relatedItem);
				if (renderedItem) fragment.appendChild(renderedItem);
			}
			var itemsElement = this.element.down('ul.items');
			if (inOptRenderAtTop) {
				itemsElement.insertBefore(fragment, itemsElement.firstChild);
			} else {
				itemsElement.appendChild(fragment);
			}
			$super();
		}.bind(this), function() {
			notifier().printErrorMessage("_Sidebars.Related.Notification.Loading.Failed".loc());
		});
	},
	renderRelatedItemForResult: function(inItem) {
		var relationshipGUID = inItem.relationshipGUID;
		var hasOwner = (inItem && inItem.owner);
		var location = (hasOwner ? localizedContainerString((inItem.owner.longName || inItem.owner.shortName), inItem.owner.type) : false)
		if (inItem && inItem.type != "com.apple.EntityPlaceholder") {
			var li = Builder.node('li', {className: 'cc-related-item' + (location ? '' : ' no-location'), 'name': relationshipGUID, 'for': inItem.guid}, [
				Builder.node('a', {className: 'button delete'}, "_Sidebars.Related.Remove".loc()),
				Builder.node('a', {className: 'item', href: CC.entityURL(inItem, true)}, [
					Builder.node('span', {className: 'icon'}),
					Builder.node('span', {className: 'title'}, (inItem.longName || inItem.shortName)),
					Builder.node('span', {className: 'location'}, (location ? location : ""))
				])
			]);
			var userCanWrite = (CC.meta('x-apple-user-can-write') == "true");
			var deleteButton = li.down('a.delete');
			if (!userCanWrite) {
				deleteButton.hide();
			} else {
				// Deliberately avoid binding handleDeleteRelatedEntityClicked since it is already bound as an event listener.
				Element.observe(deleteButton, 'click', this.handleDeleteRelatedEntityClicked);
			}
			return li;
		}
	},
	isEmpty: function() {
		return (this.element.down('.cc-related-item') == undefined);
	},
	// Renders and appends an empty recents popup menu to the sidebar. Initializes
	// in a loading state, so a loading spinner appears as soon as it is shown and
	// before we've fetched any recents.
	renderPopupMenu: function() {
		var tagItemRelatedSearch = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_RELATED_SEARCH);
		var tagItemRelatedRecent = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_RELATED_RECENT);				
		this.mPopupMenu = Builder.node('div', {className: 'cc-related-popup-menu loading', style: 'display: none;'}, [
			Builder.node('div', {className: 'handle'}, [
				Builder.node('span', {className: 'button add'})
			]),
			Builder.node('div', {className: 'body'}, [
				Builder.node('div', {className: 'top-cap'}),
				Builder.node('div', {'role': 'navigation', 'aria-label': "_Accessibility.Navigation.Search".loc(), className: 'top'}, [
					Builder.node('a', {'tabidex': tagItemRelatedSearch, 'role':'link', 'id': 'relatedSearch', className: 'search', title: "_Sidebars.Related.Menu.Search.Tooltip".loc()}, "_Sidebars.Related.Menu.Search.Title".loc()),
				]),
				Builder.node('div', {'role': 'navigation', 'aria-label': "_Accessibility.Navigation.RecentDocuments".loc(), className: 'bottom'}, [
					Builder.node('h2', "_Sidebars.Related.Menu.Recents.Title".loc()),
					Builder.node('h2', {'aria-label': "_Sidebars.Related.Menu.No.Recents.Placeholder".loc(), 'tabindex': tagItemRelatedRecent, className: 'placeholder'}, "_Sidebars.Related.Menu.No.Recents.Placeholder".loc()),
					Builder.node('ul', {'role': 'list', 'tabindex': tagItemRelatedRecent, className: 'recents'})
				]),
				Builder.node('div', {className: 'bottom-cap'}),
			])
		]);
		document.body.appendChild(this.mPopupMenu);
		
	},
	registerEventHandlers: function() {
		bindEventListeners(this, [
			'handleWindowMouseDown',
			'handleAddButtonClicked',
			'handleSearchMenuItemClicked',
			'handleSearchDialogOK',
			'handleRecentItemClicked',
			'handleDeleteRelatedEntityClicked'
		]);
		Event.observe(window, 'mousedown', this.handleWindowMouseDown);
		Event.observe(this.element.down('.button.add'), 'click', this.handleAddButtonClicked);
		Event.observe(this.mPopupMenu.down('a.search'), 'click', this.handleSearchMenuItemClicked);
	},
	// Populates the recent items list in the related popup menu. Uses the related
	// items service to request a JSON payload of recent items, and manually builds
	// out the list with the response. If the response is undefined, or there are no
	// recent items, displays an empty placeholder.
	populateRecentItems: function() {
		var recentsContainer = this.mPopupMenu.down('ul.recents').update();
		this.mPopupMenu.removeClassName('empty').addClassName('loading');
		var callback = function(recents) {
			this.mPopupMenu.removeClassName('loading');
			if (!recents || recents.length == 0) {
				this.mPopupMenu.addClassName('empty');
				return;
			}
			// Don't relate documents to themselves.
			var recent, excludedGUIDs = this.computeGUIDsToExclude();
			for (var recentIdx = (recents.length - 1); recentIdx >= 0; recentIdx--) {
				recent = recents[recentIdx];
				if (recent && recent.guid && excludedGUIDs.include(recent.guid)) recents[recentIdx] = undefined;
			}
			recents = recents.without(undefined);
			if (recents.length == 0) return this.mPopupMenu.addClassName('empty');
			// Build the related items list.
			var recentItemElement;
			recents.each(function(recent) {
				if (recent && recent.guid) {
					var tagItemRelatedRecentItems = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_RELATED_RECENT);
					recentItemElement = Builder.node('li', [
						Builder.node('a', {'tabindex': ++tagItemRelatedRecentItems, 'role': 'menuitem', name: recent.guid, title: (recent.longName || recent.shortName)}, (recent.longName || recent.shortName))
					]);
					Event.observe(recentItemElement, 'click', this.handleRecentItemClicked);
					recentsContainer.appendChild(recentItemElement);
				}
			}, this);
		}.bind(this);
		server_proxy().recentDocumentsWithOptions(this.mRecentItemsCount, {}, callback, callback);
	},
	// Shows the related sidebar popup menu.
	showPopupMenu: function() {
		if (this.mRecentItemsTimer) clearTimeout(this.mRecentItemsTimer);
		this.mPopupMenu.removeClassName('empty').addClassName('loading');
		this.mRecentItemsTimer = setTimeout(this.populateRecentItems.bind(this), 500);
		// Position the popup over the sidebar.
		this.mPopupMenu.show();
		var addButton = this.element.down('.button.add');
		var addButtonPosition = addButton.viewportOffset();
		this.mPopupMenu.setStyle({
			'left': (addButtonPosition.left - 249 + 34) + 'px',
			'top': addButtonPosition.top + 24 + 'px'
		});
		this.mNowShowing = true;
		this.becomeFirstResponder();
		
		// Do not modify the accessibility tab index for the progress message dialog.
		accessibility().makeRootViewsAriaHidden(false);
		
		if ($('relatedSearch')) $('relatedSearch').focus();
	},
	// Hides the related sidebar popup menu.
	hidePopupMenu: function() {
		this.mPopupMenu.hide();
		this.mNowShowing = false;
		this.loseFirstResponder();
		
		// Do not modify the accessibility tab index for the progress message dialog.
		accessibility().makeRootViewsAriaVisible(false);
	},
	// Relates an entity using the related items service and renders the returned
	// partial in the sidebar before displaying a notification.
	relateEntity: function(inRelatedEntityGUID) {
		if (!this.mDocumentGUID) return;
		var callback = function(response) {
			dialogManager().hideProgressMessage();
			if (!response || !response.succeeded) {
				notifier().printErrorMessage("_Sidebars.Related.Notification.Relate.Failed".loc());
				return false;
			}
			var newRelationshipGUID = response.response;
			var innerCallback = function(relations) {
				this.didPaginateForIDs(relations, true);
			}.bind(this);
			return server_proxy().relationshipsForGUIDs([newRelationshipGUID], innerCallback, innerCallback); 
		}.bind(this);
		dialogManager().showProgressMessage('_Sidebars.Related.Status.RelatingDocument'.loc());
		server_proxy().relateEntities(this.mDocumentGUID, inRelatedEntityGUID, callback, callback);
	},
	// Deletes an existing relationship. Displays an error notification if the remove
	// operation failed, otherwise returns silently.
	deleteRelationship: function(inRelationshipGUID) {
		if (!this.mDocumentGUID) return;
		var callback = function(service_response) {
			if (!service_response || (service_response && !service_response.succeeded)) {
				notifier().printErrorMessage("_Sidebars.Related.Notification.Unrelate.Failed".loc());
			} else {
				globalNotificationCenter().publish(CC.PaginatingSidebar.NOTIFICATION_PAGINATING_SIDEBAR_CONTENT_DID_CHANGE, this);
			}
		}.bind(this);
		server_proxy().deleteRelationship(inRelationshipGUID, callback, callback);
	},
	// Handles focus away from the related items sidebar, hiding the sidebar popup.
	handleWindowMouseDown: function(inEvent) {
		if (this.mNowShowing) {
			if (!Position.within(this.mPopupMenu, inEvent.pointerX(), inEvent.pointerY())) this.hidePopupMenu();
			else Event.stop(inEvent);
		}
	},
	handleAddButtonClicked: function(inEvent) {
		this.showPopupMenu();
	},
	handleDeleteRelatedEntityClicked: function(inEvent) {
		var relatedItem = inEvent.findElement('li');
		// Show a puff of smoke before removing the list element immediately.
		smokey().showOverElement(relatedItem);
		var relationshipGUID = relatedItem.getAttribute('name');
		var stashedElement = Element.remove(relatedItem);
		// Do we need to show the empty placeholder string?
		if (this.element.select('.cc-related-item').length == 0) this.element.down('.cc-related-items-list').addClassName('empty');
		// Actually remove the relationship.
		this.deleteRelationship(relationshipGUID)
	},
	handleSearchMenuItemClicked: function(inEvent) {
		var anchor = inEvent.findElement('#related_sidebar');
		this.hidePopupMenu();
		this.mRelatedSearchDialog.mExcludedGUIDs = this.computeGUIDsToExclude();
		this.mRelatedSearchDialog.show(anchor, null, this.handleSearchDialogOK);
	},
	handleSearchDialogOK: function() {
		var suggested = $('link_search_dialog').down('.suggested');
		if (!suggested) return;
		var entityGUID = suggested.getAttribute('id').match(/link_search_dialog_results_(.+)/)[1];
		this.relateEntity(entityGUID);
	},
	handleRecentItemClicked: function(inEvent) {
		var entityGUID = inEvent.findElement('a').getAttribute('name');
		this.hidePopupMenu();
		this.relateEntity(entityGUID);
	},
	handleKeyboardNotification: function(inMessage, inObject, inOptExtras) {
		switch (inMessage) {
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_TAB:
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_ESC:
				this.hidePopupMenu();
				break;
		}
		return true;
	},
	// Computes an array of guids to exclude from the related items popup/search dialog.
	// We don't want to present already related items again.
	computeGUIDsToExclude: function() {
		var related = this.element.select('.cc-related-items-list .cc-related-item').invoke('getAttribute', 'for');
		if (this.mDocumentGUID) related.push(this.mDocumentGUID);
		return related;
	}
});
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



CC.SharingSidebarSection = Class.create(CC.SidebarSection, {
	mClassName: 'sharing',
	mDisplayTitle: "_Sidebars.Sharing.Title".loc(),
	mSidebarSectionGUID: 'sidebars/sharing',
	initialize: function($super) {
		$super();
		var entityGUID = CC.meta('x-apple-entity-guid');
		this.element.down('.content').appendChild(Builder.node('h2', {className: 'placeholder'}, "_Loading".loc()));
		if (entityGUID) {
			var gotAclsResponse = function(acls) {
				if (acls) {
					var sharingView = new CC.DocumentSharingView(acls, entityGUID);
					sharingView._render();
					var contentElement = this.element.down('.content');
					contentElement.innerHTML = "";
					contentElement.appendChild(sharingView.$());
				}
			}.bind(this);
			server_proxy().aclsForEntityGUID(entityGUID, gotAclsResponse, gotAclsResponse);
		} else {
			logger().error("Could not find entityGUID to initialize sharing sidebar.. bailing");
		}
	}
});
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



CC.TagsSidebarSection = Class.create(CC.SidebarSection, {
	mClassName: 'tags',
	mDisplayTitle: "_Sidebars.Tags.Title".loc(),
	mSidebarSectionGUID: 'sidebars/tags',
	mAutocompleteTagPath: '/tags/autocomplete',
	initialize: function($super) {
		$super();
		var taggerElement = this.element.down('.cc-tagger');
		if (CC.meta('x-apple-user-can-write') != 'true') {
			taggerElement.down('.cc-sidebar-actions').hide();
		}
	},
	render: function($super) {
		var elem = $super();
		var tagItemSidebar = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_TAGS);
		var taggerElement = Builder.node('div', {className: 'cc-tagger'}, [
			Builder.node('div', {className: 'cc-tag-editor'}, [
				Builder.node('div', {className: 'cc-sidebar-actions'}, [
					Builder.node('a', {'tabindex': ++tagItemSidebar, 'role': 'button', className: 'button add'}, "_Sidebars.Tags.Add.Tag".loc()),
					Builder.node('a', {'tabindex': '-1', 'role': 'button', className: 'button cancel'}, "_General.Cancel".loc()),
					Builder.node('a', {'tabindex': '-1', 'role': 'button', className: 'button save'}, "_General.Save".loc())
				]),
				Builder.node('div', {className: 'cc-tag-entryfield', 'data-autocompleteurl': this.mAutocompleteTagPath}, [
					Builder.node('input', {'tabindex': '-1', 'role': 'textbox', 'type': 'text', 'maxlength': '100'})
				]),
				Builder.node('h2', {className: 'cc-tag-empty-message placeholder'}, "_Sidebars.Tags.Empty.Placeholder".loc()),
				Builder.node('ul', {className: 'cc-tag-collection'})
			])
		]);
		elem.down('div.content').appendChild(taggerElement);
		return elem;
	},
	open: function($super) {
		$super();
		if (!this.mDidLoadTags) {
			this.mDidLoadTags = true;
			this.loadTags();
		}
	},
	loadTags: function() {
		this.element.addClassName('loading');
		var entityGUID = CC.meta('x-apple-entity-guid');
		server_proxy().tagsForEntityGUID(entityGUID, function(tags) {
			this.element.removeClassName('loading');
			var tagCollectionElement = this.element.down('.cc-tag-collection');
			$A(tags).each(function(tagName) {
				var t = CC.Tag.create({'name': tagName});
				tagCollectionElement.appendChild(t.element);
			});
			var taggerElement = this.element.down('.cc-tagger');
			new CC.Tagger(taggerElement);
		}.bind(this), function() {
			this.element.removeClassName('loading');
		}.bind(this));
	}
});
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

CC.Tag = Class.create({

	initialize: function(element) {
		this.element = $(element);
		this.element.on('click', this.onElementClick.bindAsEventListener(this));			
		if(CC.meta('x-apple-user-can-write') == 'true') {
			var button = new Element('a', { className: 'button delete' }).update('Delete');
			button.on('click', this.onDeleteClick.bindAsEventListener(this));
			this.element.insert(button);
		}
	},
	
	onElementClick: function(e) {
		this.element.fire('item:triggered', this);
	},
	onDeleteClick: function(e) {
		e.stop();
		this.element.fire('item:delete', this);
	},
	
	serialize: function() {
		return this.element.getDataAttributes();
	}

});

CC.Tag.create = function(params) {
	var tagItemCollection = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_TAGS_COLLECTION);
	var name = params.name.escapeHTML() || '';
	var element = new Element('li', { className: 'cc-tag' }).insert("<a href='#' role='menuitem' tabindex='" + tagItemCollection + "'>"+ name +"</a>").setDataAttributes(params);
	return new CC.Tag(element);
};
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



CC.TagCollection = Class.create(CC.Collection, {

	itemClass: CC.Tag,
	itemSelector: '.cc-tag',
	itemInsertionPoint: 'bottom'

});
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

CC.TagEditor = Class.create({
	
	initialize: function(element) {
		this.element = $(element);
		
		this.tag_collection = new CC.TagCollection(this.element.down('.cc-tag-collection'));
		this.tag_entryfield = new CC.TagEntryfield(this.element.down('.cc-tag-entryfield'));
		
		this.element.down('.cc-sidebar-actions .button.add').on('click', this.onAddButtonClick.bindAsEventListener(this));
		this.element.down('.cc-sidebar-actions .button.cancel').on('click', this.onCancelButtonClick.bindAsEventListener(this));
		this.element.down('.cc-sidebar-actions .button.save').on('click', this.onSaveButtonClick.bindAsEventListener(this));
		
		this.element.on('item:autocomplete', this.onItemAutocomplete.bindAsEventListener(this));
		this.element.on('item:delete', this.onItemDelete.bindAsEventListener(this));
		
		this.showOrHideEmptyMessage();
	},
	
	onAddButtonClick: function(e) {
		var tagItemSidebarTextBox = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_TAGS_TEXTBOX);
		this.element.querySelector('input').writeAttribute('tabindex', tagItemSidebarTextBox); // Update text box tabindex
		// Remove tabindex for Add button and generate tabindex for save and cancel button
		var tagItemSidebar = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_TAGS);
		var add = this.element.querySelector('a.add');
		var save = this.element.querySelector('a.save');
		var cancel = this.element.querySelector('a.cancel');
		add.writeAttribute('tabindex', '-1');
		save.writeAttribute('tabindex', ++tagItemSidebar);
		cancel.writeAttribute('tabindex', ++tagItemSidebar);
		
		e.stop();
		this.open();
	},
	onCancelButtonClick: function(e) {
		this.element.querySelector('input').writeAttribute('tabindex', '-1'); // Update text box tabindex
		// Remove tabindex for Save and Cancel button to avoid tab on hidden items
		var tagItemSidebar = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_TAGS);
		var add = this.element.querySelector('a.add');
		var save = this.element.querySelector('a.save');
		var cancel = this.element.querySelector('a.cancel');
		add.writeAttribute('tabindex', ++tagItemSidebar);
		save.writeAttribute('tabindex', '-1');
		cancel.writeAttribute('tabindex', '-1');
		
		e.stop();
		this.close();
	},
	onSaveButtonClick: function(e) {
		this.element.querySelector('input').writeAttribute('tabindex', '-1'); // Update text box tabindex
		// Remove tabindex for Save and Cancel button to avoid tab on hidden items
		var tagItemSidebar = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_TAGS);
		var add = this.element.querySelector('a.add');
		var save = this.element.querySelector('a.save');
		var cancel = this.element.querySelector('a.cancel');
		add.writeAttribute('tabindex', '-1');
		save.writeAttribute('tabindex', ++tagItemSidebar);
		cancel.writeAttribute('tabindex', ++tagItemSidebar);
		
		e.stop();
		this.tag_entryfield.enter();
		this.close();
	},
	
	onItemAutocomplete: function(e) {
		e.stop();
		var params = e.memo;
		if (!params.name.match(/\S/)) {
			logger().warn("Can't save an empty tag");
			return;
		}
		var serialized_tags = this.tag_collection.getItems().map(function(t){ return t.serialize(); });
		var matching_tags = serialized_tags.find(function(h){ return h.name == params.name; });
		if (!matching_tags) {
			this.tag_collection.add(CC.Tag.create(e.memo));
		}
		this.showOrHideEmptyMessage();
	},
	onItemDelete: function(e) {
		e.stop();
		smokey().showOverElement(e.memo.element);
		this.tag_collection.remove(e.memo);
		this.showOrHideEmptyMessage();
	},
	
	open: function() {
		this.element.up('.cc-sidebar-section').addClassName('editing');		
		this.element.addClassName('editing');
		this.tag_entryfield.focus();
	},
	close: function() {
		var save = this.element.querySelector('a.save');
		var cancel = this.element.querySelector('a.cancel');
		save.writeAttribute('tabindex', '-1');
		cancel.writeAttribute('tabindex', '-1');
		this.element.up('.cc-sidebar-section').removeClassName('editing');
		this.element.removeClassName('editing');
	},
	
	showOrHideEmptyMessage: function() {
		var element = this.element.down('.cc-tag-empty-message');
		(this.tag_collection.getItems().length > 0) ? element.hide() : element.show();
	}
	
	
});
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

CC.TagEntryfield = Class.create({
	
	initialize: function(element) {
		this.element = $(element);
		
		var randomID = "cc-menu-autocomplete-%@".fmt(buildRandomString(5));
		this.choices = Builder.node('ul', {'id': randomID, 'className': 'cc-menu-autocomplete cc-tagger-autocomplete-menu'});
		this.choices.hide();
		document.body.appendChild(this.choices);
		
		this.input = this.element.down('input');
		
		this.autocompleteurl = this.element.getDataAttributes().autocompleteurl;
		if (this.autocompleteurl) {
			this.tagfield = new TagSearchField(this.input, {
				mSearchPath: this.autocompleteurl,
				mResultTable: this.choices,
				mClickedItemCallback: this.handleItemClick.bind(this)
			});
		}
		
		this.input.observe('keydown', this.handleKeyboardEvent.bind(this));
	},
	
	handleItemClick: function(inDisplayString, inOptURL) {
		this.clear();
		this.element.fire('item:autocomplete', {'name': inDisplayString});
	},
	
	handleKeyboardEvent: function(evt) {
		evt.stopPropagation();
		if (evt.keyCode == Event.KEY_COMMA) {
			// #7772586
			this.enter();
			this.clear.bind(this).defer();
		}
		else if (evt.keyCode == Event.KEY_RETURN || evt.keyCode == Event.KEY_TAB) {
			this.enter();
			this.focus.bind(this).defer();
		}
		return true;
	},

	enter: function() {
		if (!this.isEmpty()) {
			var params = { name: this.getValue() };
			this.clear();
			this.element.fire('item:autocomplete', params);
		}
	},
	getValue: function() {
		return this.input.value.strip();
	},
	isEmpty: function() {
		return this.getValue().length === 0;
	},
	focus: function() {
		this.input.focus();
	},
	clear: function() {
		this.input.value = '';
		if (this.tagfield && this.tagfield.mResultTable) this.tagfield.mResultTable.hide();
	}

});
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



// Sidebar that displays any upcoming events in a container.

CC.UpcomingEventsSidebarSection = Class.create(CC.PaginatingSidebarSection, {
	mClassName: 'upcoming_events',
	mDisplayTitle: "_Sidebars.UpcomingEvents.Title".loc(),
	mSidebarSectionGUID: 'sidebars/upcoming_events',
	mEmptyPlaceholderString: "_Sidebars.UpcomingEvents.Empty.Placeholder".loc(),
	mShowsDisclosureTriangle: false,
	getPaginationIDs: function() {
		// Fake at least one pagination item so we have a chance to fetch events.
		return new Array(1);
	},
	paginateForIDs: function($super, inPaginationIDs) {
		// Set the principal URL from the meta tag
		principalService().setUserPrincipal('/principals/wikis/'+encodeURIComponent(CC.meta('x-apple-owner-tinyID')));
		// Instantiate the upcoming events service, and listen for a message
		globalNotificationCenter().subscribe('GOT_UPCOMING_EVENTS', this.gotEvents.bind(this));
		upcomingEventsService();
	},
	isEmpty: function() {
		return (this.element.down('li.event') == undefined);
	},
	gotEvents: function(inMessage, inObject, inUserInfo) {
		if (inObject.length >= 1) {
			this.element.down('.content').innerHTML = '<ul></ul>';
			var calendarEvents = $A(inObject || []);
			// Workaround for the fact that Wiki "Upcoming Events" list is out of order
			var sortedEvents = calendarEvents.sortBy(function(e) {
				return e.startDate();
			});
			var eventCount = Math.min(5, sortedEvents.length);
			for (var i = 0; i < eventCount; i++) {
				currentCalendarEvent = sortedEvents[i];
				var containerTinyID = CC.meta('x-apple-container-tinyID');
				var eventURL = '/wiki/projects/'+containerTinyID+'/calendar?dtstart='+encodeURIComponent(currentCalendarEvent.startDate(true).replace(/T.+$/, ''))+'#uid='+encodeURIComponent(currentCalendarEvent.valueForProperty('UID'));
				var timeDisplayString = getTimeRangeDisplayString(currentCalendarEvent.startDate(), currentCalendarEvent.duration());
				this.element.down('ul').appendChild(Builder.node('li', {className: 'event'}, [
					Builder.node('a', {href:eventURL}, currentCalendarEvent.summary()),
					Builder.node('span', {className:'updated'}, timeDisplayString)
				]))
			}
		}
		// Call didPaginateForIDs to get the default pagination sidebar behavior.
		this.didPaginateForIDs();
	}
});
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

CC.MenuItems.AssignToProject = Class.create(CC.MenuItem, {
	mDisplayTitle: "_ActionMenu.AssignToProject.Title".loc(),
	initialize: function($super) {
		$super();
		this.mAssignToProjectDialog = new LinkSearchDialog({
			mDialogTitle: "_ActionMenu.AssignToProject.Dialog.Title",
			mSearchFieldPlaceholder: "_ActionMenu.AssignToProject.Dialog.Search.Placeholder",
			mDialogDescription: "_ActionMenu.AssignToProject.Dialog.Description",
			mEntityTypes: ['com.apple.entity.Wiki']
		});
	},
	itemShouldDisplay: function() {
		var isLoggedIn = CC.meta('x-apple-user-logged-in') == "true";
		if (isLoggedIn) {
			var entity_type = CC.meta('x-apple-entity-type');
			var pageOrFile = ((entity_type == "com.apple.entity.Page") || (entity_type == "com.apple.entity.File"));
			var detailPage = CC.meta('x-apple-entity-isDetailPage') == "true";
			var canWrite = CC.meta('x-apple-user-can-write') == "true";
			return (!document.body.hasClassName('toplevel') && pageOrFile && !detailPage && canWrite);
		}
		else {
			return false;
		}
		
		
	},
	action: function(e) {
		var anchor = Event.findElement(e, 'a');
		this.mAssignToProjectDialog.show(anchor, null, this.onDialogOk.bind(this));
	},
	onDialogOk: function(inURL, inLinkText) {
		// If nothing was selected in the dialog, just return.
		if (!inURL || !inLinkText) return;
		// Otherwise, get the suggested list item.
		var suggested = $('link_search_dialog').down('.suggested');
		if (!suggested) return;
		// Get the project GUID, name and URL from the dialog selection.
		this.mProjectGUID = suggested.getAttribute('id').match(/link_search_dialog_results_(.+)/)[1];
		this.mProjectName = inLinkText;
		this.mProjectURL = inURL;
		dialogManager().showProgressMessage("_ActionMenu.AssignToProject.Waiting".loc(this.mProjectName));
		server_proxy().moveEntityToOwner(CC.meta('x-apple-entity-guid'), this.mProjectGUID, this.onDialogOkSuccess.bind(this), this.onDialogOkFailure.bind(this))
	},
	onDialogOkSuccess: function(response) {
		dialogManager().hideProgressMessage();
		window.location.reload();
	},
	onDialogOkFailure: function(response) {
		dialogManager().hide();
		notifier().printErrorMessage("_ActionMenu.AssignToProject.Failure".loc());
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_MOVE);
	}
});
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

CC.MenuItems.BulkApproveComments = Class.create(CC.MenuItem, {
	mDisplayTitle: "_ActionMenu.BulkApproveComments.Title".loc(),
	itemShouldDisplay: function() {
		var adminOrOwner = (CC.meta('x-apple-user-is-admin') == "true" || CC.meta('x-apple-user-is-owner') == "true");
		return (adminOrOwner && (CC.metaAsArray('x-apple-owner-unapproved-comment-guids').length > 0 || CC.metaAsArray('x-apple-entity-unapproved-comment-guids').length > 0));
	},
	action: function(inEvent) {
		var dialog = $('bulk_approve_comments_dialog');
		if (dialog) Element.remove(dialog);
		var locPrefix = '';
		var isDetailPage = CC.meta('x-apple-entity-isDetailPage');

		if (isDetailPage) {
			// If this is a wiki main page
			if (isDetailPage == "true") {
				locPrefix = ".Wiki";
			}
			else if (isDetailPage == "false") {
				locPrefix = ".Page";
			}
		}
		var locString = "_BulkApproveComments.Confirm.Dialog.Description%@".fmt(locPrefix);

		var fields = [locString.loc()];
		dialogManager().drawDialog('bulk_approve_comments_dialog', fields, "_BulkApproveComments.OK".loc(), false, "_BulkApproveComments.Confirm.Dialog.Title".loc());
		dialogManager().show('bulk_approve_comments_dialog', null, this.onApproveConfirm.bind(this));
	},
	onApproveConfirm: function(inEvent) {
		dialogManager().showProgressMessage("_BulkApproveComments.Progress.Approving".loc());
		var isDetailPage = CC.meta('x-apple-entity-isDetailPage');
		var commentGUIDs = [];

		if (isDetailPage) {
			// If this is a wiki main page
			if (isDetailPage == "true") {
				commentGUIDs = CC.metaAsArray('x-apple-owner-unapproved-comment-guids');
			}
			else if (isDetailPage == "false") {
				commentGUIDs = CC.metaAsArray('x-apple-entity-unapproved-comment-guids');
			}

			server_proxy().approveCommentsWithGUIDs(commentGUIDs, this.onApproveSuccess.bind(this), this.onApproveFailure.bind(this));
		}
	},
	onApproveSuccess: function(inResponse) {
		dialogManager().hide();
		window.location.reload();
	},
	onApproveFailure: function(inResponse) {
		dialogManager().hide();
		notifier().printErrorMessage("_BulkApproveComments.Progress.Failed".loc());
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_APPROVE);
	}	
});
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

CC.MenuItems.Hide = Class.create(CC.MenuItem, {
	mDisplayTitle: "", // Deliberately empty since this is updated dynamically.
	updateDisplayState: function($super) {
		var locAction = "Hide";
		if (CC.meta("x-apple-owner-isHidden") == 'true') locAction = "Unhide";
		this.mElement.down('a').update("_ActionMenu.%@.Person.Title".fmt(locAction).loc());
		$super();
	},
	itemShouldDisplay: function() {
		var guid = CC.meta('x-apple-owner-guid');
		if (!guid) return false;
		return ((CC.meta('x-apple-owner-type') == 'com.apple.entity.User') && (CC.meta('x-apple-user-is-admin') == 'true'));
	},
	action: function(e) {
		var dialog = $('delete_entity_dialog');
		if (dialog) Element.remove(dialog);
		var locAction = "Hide";
		if (CC.meta("x-apple-owner-isHidden") == 'true') locAction = "Unhide";
		var fields = ["_Dialogs.%@.Person.Description".fmt(locAction).loc()];
		dialogManager().drawDialog('hide_entity_dialog', fields, "_Dialogs.%@.OK".fmt(locAction).loc(), false, "_Dialogs.%@.Person.Title".fmt(locAction).loc());
		dialogManager().show('hide_entity_dialog', null, this.onHideConfirm.bind(this));
	},
	onHideConfirm: function() {
		var method = server_proxy().hideUserWithGUID;
		if (CC.meta("x-apple-owner-isHidden") == 'true') {
			method = server_proxy().unhideUserWithGUID;
		}
		// now call whichever one we need to
		method(CC.meta('x-apple-owner-guid'), this.onSuccess.bind(this), this.onFailure.bind(this));
	},
	onSuccess: function(response) {
		// If unhide the person then stay on the same page, else, redirect to the main people page
		if (CC.meta("x-apple-owner-isHidden") == 'true') {
			window.location.reload();			
		} else {
			var url = env().root_path + "/people";
			window.location.href = url;						
		}
	},
	onFailure: function(response) {
		notifier().printErrorMessage("_Dialogs.Hide.Notification.Error".loc());
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_HIDE);
	}
});
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

CC.MenuItems.ProjectSettings = Class.create(CC.MenuItem, {
	mDisplayTitle: "_ActionMenu.Project.Settings.Title".loc(),
	itemShouldDisplay: function() {
		var project = ((CC.meta('x-apple-owner-type') == "com.apple.entity.Wiki") || (CC.meta('x-apple-owner-type') == "com.apple.entity.Wiki"));
		return (project && (CC.meta('x-apple-user-is-owner') == "true" || CC.meta('x-apple-user-is-admin') == "true"));
	},
	action: function(e) {
		var projectGUID;
		if (CC.meta('x-apple-owner-type') == "com.apple.entity.Wiki") {
			projectGUID = CC.meta('x-apple-owner-guid');
		} else {
			projectGUID = CC.meta('x-apple-owner-guid');
		}
		settingsPanel().showForGUIDAndType(projectGUID, "com.apple.entity.Wiki");
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_WIKI_SETTINGS);
	}
});
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

CC.MenuItems.UpdateFile = Class.create(CC.MenuItem, {
	mDisplayTitle: "_ActionMenu.Replace.File.Title".loc(),
	itemShouldDisplay: function() {
		var guid = CC.meta('x-apple-entity-guid');
		if (!guid) return false;
		var type = CC.meta('x-apple-entity-type');
		if (!type || type != 'com.apple.entity.File') return false;
		return (CC.meta('x-apple-user-is-admin') == 'true' || CC.meta('x-apple-user-is-owner') == 'true' || CC.meta('x-apple-user-can-write') == 'true');
	},
	action: function(e) {
		fileUploadManager().updateFile();
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_REPLACE);
	}
});
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

CC.MenuItems.UserSettings = Class.create(CC.MenuItem, {
	mDisplayTitle: "_ActionMenu.User.Settings.Title".loc(),
	itemShouldDisplay: function() {
		return (CC.meta('x-apple-user-logged-in') == "true");
	},
	action: function(e) {
		var userGUID = CC.meta('x-apple-user-guid')
		settingsPanel().showForGUIDAndType(userGUID, "com.apple.entity.User");
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_USER_SETTINGS);
	}
});
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

// Base new menu item class.

CC.NewMenuItem = Class.create(CC.MenuItem, {
	
});

// Returns true if the current page is any child page of a project (based on meta tags).

CC.MenuItems.currentPageIsProjectPage = function() {
	var ownerType = CC.meta('x-apple-owner-type');
	// If the owner is a project, return true.
	if (ownerType == "com.apple.entity.Wiki") return true;
	// Otherwise return false.
	return false;
}

// Mixins tracking the ownerGUID that will be used as the owner guid of any new items
// created by this menu item.

CC.MenuItems.BasePrivateNewMenuItemMixin = {
	calculateOwnerGUIDForNewItem: function(inOptIsBlogPost) {
		if (inOptIsBlogPost) {
			return CC.meta('x-apple-user-blogGUID');
		}
		return CC.meta('x-apple-user-guid');
	},
	itemShouldDisplay: function() {
		var userLoggedIn = (CC.meta('x-apple-user-logged-in') == "true");
		return (!CC.MenuItems.currentPageIsProjectPage() && userLoggedIn);
	}
};

CC.MenuItems.BaseProjectNewMenuItemMixin = {
	updateDisplayState: function($super) {
		// Fix up the menu item text values for the current proejct (if we need to).
		if (CC.MenuItems.currentPageIsProjectPage()) {
			var projectTitle;
			var ownerType = CC.meta('x-apple-owner-type');
			if (ownerType == "com.apple.entity.Wiki") {
				projectTitle = CC.meta('x-apple-owner-longName') || CC.meta('x-apple-owner-shortName');
			}
			this.mElement.down('a').innerHTML = this.mDisplayTitleLocKey.loc(projectTitle).escapeHTML();
		}
		return $super();
	},
	itemShouldDisplay: function() {
		var userCanWrite = CC.meta('x-apple-user-can-write') == "true";
		if (CC.MenuItems.currentPageIsProjectPage()) {
			return userCanWrite;
		}
		return false;
	},
	calculateOwnerGUIDForNewItem: function(inOptIsBlogPost) {
		if (inOptIsBlogPost) {
			return CC.meta('x-apple-owner-blogGUID');
		}
		return CC.meta('x-apple-owner-guid');
	}
};

// Base new items (private by default).

CC.MenuItems.BaseNewPage = Class.create(CC.NewMenuItem, CC.MenuItems.BasePrivateNewMenuItemMixin, {
	mBlogpost: false,
	mClassName: 'page',
	action: function(inEvent) {
		var ownerGUID = this.calculateOwnerGUIDForNewItem(this.mBlogPost);
		globalPagesController().showNewPageDialog(inEvent.findElement('a'), undefined, ownerGUID, this.mBlogPost, function(pageURL, pageName) {
			globalCookieManager().setCookie('cc.toggleEditModeOnLoad', true);
			window.location = pageURL;
		}, undefined);
	}
});

CC.MenuItems.BaseNewFile = Class.create(CC.NewMenuItem, CC.MenuItems.BasePrivateNewMenuItemMixin, {
	mClassName: 'file',
	action: function(inEvent) {
		var ownerGUID = this.calculateOwnerGUIDForNewItem();
		fileUploadManager().uploadNewFileInContainerGUID(ownerGUID);
	}
});

CC.MenuItems.BaseNewBlogpost = Class.create(CC.MenuItems.BaseNewPage, {
	mClassName: 'blogpost',
	mBlogPost: true
});
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



CC.MenuItems.NewPrivatePage = Class.create(CC.MenuItems.BaseNewPage, {
	mDisplayTitleLocKey: "_PlusMenu.Private.Page",
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_PLUS);
	}
});

CC.MenuItems.NewPrivateFile = Class.create(CC.MenuItems.BaseNewFile, {
	mDisplayTitleLocKey: "_PlusMenu.Private.File",
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_PLUS);
	}
});

CC.MenuItems.NewPrivateBlogpost = Class.create(CC.MenuItems.BaseNewBlogpost, {
	mDisplayTitleLocKey: "_PlusMenu.Private.Blogpost",
	itemShouldDisplay: function() {
		var parentType = CC.meta('x-apple-container-type');
		var ownerType = CC.meta('x-apple-owner-type');
		var userBlogEnabled = CC.meta('x-apple-user-isBlogEnabled') == "true";
		return (parentType != "com.apple.entity.Wiki" && ownerType != "com.apple.entity.Wiki" && userBlogEnabled);
	},
	calculateOwnerGUIDForNewItem: function() {
		return CC.meta('x-apple-user-blogGUID');
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_PLUS);
	}
});

CC.MenuItems.NewProjectPage = Class.create(CC.MenuItems.BaseNewPage, CC.MenuItems.BaseProjectNewMenuItemMixin, {
	mDisplayTitleLocKey: "_PlusMenu.Project.Page",
	itemShouldDisplay: function() {
		var userCanWrite = CC.meta('x-apple-user-can-write') == "true";
		return (CC.MenuItems.currentPageIsProjectPage() && userCanWrite);
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_PLUS);
	}	
});

CC.MenuItems.NewProjectFile = Class.create(CC.MenuItems.BaseNewFile, CC.MenuItems.BaseProjectNewMenuItemMixin, {
	mDisplayTitleLocKey: "_PlusMenu.Project.File",
	itemShouldDisplay: function() {
		var userCanWrite = CC.meta('x-apple-user-can-write') == "true";
		return (CC.MenuItems.currentPageIsProjectPage() && userCanWrite);
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_PLUS);
	}
});

CC.MenuItems.NewProjectBlogpost = Class.create(CC.MenuItems.BaseNewBlogpost, CC.MenuItems.BaseProjectNewMenuItemMixin, {
	mDisplayTitleLocKey: "_PlusMenu.Project.Blogpost",
	itemShouldDisplay: function() {
		var userCanWrite = CC.meta('x-apple-user-can-write') == "true";
		var parentType = CC.meta('x-apple-container-type');
		var parentBlogEnabled = CC.meta('x-apple-container-isBlogEnabled') == "true";
		var ownerType = CC.meta('x-apple-owner-type');
		var ownerBlogEnabled = CC.meta('x-apple-owner-isBlogEnabled') == "true";
		if (userCanWrite) {
			return ((parentType == "com.apple.entity.Wiki" && parentBlogEnabled) || (ownerType == "com.apple.entity.Wiki" && ownerBlogEnabled));
		}
		return false;
	},
	updateDisplayState: function($super) {
		var ownerType = CC.meta('x-apple-owner-type');
		var projectTitle = "";
		if ((ownerType == "com.apple.entity.Wiki") || (ownerType == "com.apple.entity.Blog")) {
			projectTitle = CC.meta('x-apple-container-longName') || CC.meta('x-apple-container-shortName');
		}
		this.mElement.down('a').innerHTML = this.mDisplayTitleLocKey.loc(projectTitle).escapeHTML();
		return $super();
	},
	calculateOwnerGUIDForNewItem: function() {
		if (CC.meta('x-apple-owner-isBlogEnabled') == "true") {
			return CC.meta('x-apple-owner-blogGUID');
		} 
		if (CC.meta('x-apple-container-isBlogEnabled') == "true"){
			return CC.meta('x-apple-container-blogGUID');
		}
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_PLUS);
	}
});

CC.MenuItems.NewProject = Class.create(CC.NewMenuItem, {
	mDisplayTitleLocKey: "_PlusMenu.Project",
	action: function(inEvent) {
		wikiSetupAssistant().show();
	},
	itemShouldDisplay: function() {
		var userIsAdmin = (CC.meta('x-apple-user-is-admin') == "true");
		var userCanCreateProjects = (CC.meta('x-apple-user-can-create-projects') == "true");
		return (userIsAdmin || userCanCreateProjects);
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_PLUS);
	}
});
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

CC.MenuItems.Download = Class.create(CC.MenuItem, {
	mDisplayTitle: "_MenuItem.Download".loc(),
	mClassName: 'download',
	itemShouldDisplay: function() {
		return CC.meta('x-apple-entity-type') == 'com.apple.entity.File';
	},
	action: function(e) {
		window.location.href = "/wiki/files/download/" + CC.meta('x-apple-entity-guid');
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_DOWNLOAD);
	}	
});
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

CC.MenuItems.Edit = Class.create(CC.MenuItem, {
	mDisplayTitle: "_MenuItem.Edit".loc(),
	mClassName: 'edit',
	itemShouldDisplay: function() {
		return ((CC.meta('x-apple-user-can-write') == "true" && 
				CC.meta('x-apple-entity-type') == 'com.apple.entity.Page' && 
				CC.meta('x-apple-route') != '/app-context/wiki/projects/:entity-id/[a-zA-Z]+' && 
				CC.meta('x-apple-route') != '/app-context/wiki/?.*') ||
				// The following condition checks if it's the man page. If so then display edit pensil
			    (CC.meta('x-apple-user-can-write') == "true" && 
				 CC.meta('x-apple-entity-type') == 'com.apple.entity.Page' && 
				 (window.location.pathname == "/wiki" || window.location.pathname == "/wiki/" || window.location.pathname == "/")));
	},
	action: function(inEvent) {
		Event.stop(inEvent);
		globalEditorController().toggleEditMode(true);
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_EDIT);
	}
});
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

// Define a namespace.

CC.BannerItems = {};

var baseBannerLinkForOwnerMetaTags = function() {
	var ownerType = CC.meta('x-apple-owner-type');
	var urlType = urlTypeFragmentForEntityType(ownerType);
	var entityType = CC.meta('x-apple-entity-type');
	var isBlogPost = CC.meta('x-apple-entity-isBlogpost') == "true";
	var ownerTinyID = '';
	if ((entityType == 'com.apple.entity.Page' || (entityType == 'com.apple.entity.File')) && isBlogPost) {
		ownerTinyID = CC.meta('x-apple-container-tinyID');
	}
	else {
		ownerTinyID = CC.meta('x-apple-owner-tinyID');
	}
	
	var url = "/wiki/%@/%@".fmt(urlType, ownerTinyID);
	return url;
};

// Individual banner menu items implementations.

CC.BannerItems.Home = Class.create(CC.MenuItem, {
	mBannerLinkGUID: 'banner/home',
	mDisplayTitle: "_Banner.Home.Title".loc(),
	action: function() {
		globalRouteHandler().routeURL(baseBannerLinkForOwnerMetaTags())
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BANNER_HOME);
	}
});

CC.BannerItems.Activity = Class.create(CC.MenuItem, {
	mBannerLinkGUID: 'banner/activity',
	mDisplayTitle: "_Banner.Activity.Title".loc(),
	action: function() {
		globalRouteHandler().routeURL(baseBannerLinkForOwnerMetaTags() + '/activity');
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BANNER_ACTIVITY);
	}	
});

CC.BannerItems.Documents = Class.create(CC.MenuItem, {
	mBannerLinkGUID: 'banner/documents',
	mDisplayTitle: "_Banner.Documents.Title".loc(),
	action: function() {
		globalRouteHandler().routeURL(baseBannerLinkForOwnerMetaTags() + '/documents');
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BANNER_DOCUMENTS);
	}
});

CC.BannerItems.Tags = Class.create(CC.MenuItem, {
	mBannerLinkGUID: 'banner/tags',
	mDisplayTitle: "_Banner.Tags.Title".loc(),
	action: function() {
		globalRouteHandler().routeURL(baseBannerLinkForOwnerMetaTags() + '/tags');
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BANNER_TAGS);
	}	
});

CC.BannerItems.Calendar = Class.create(CC.MenuItem, {
	mBannerLinkGUID: 'banner/calendar',
	mDisplayTitle: "_Banner.Calendar.Title".loc(),
	action: function() {
		globalRouteHandler().routeURL(baseBannerLinkForOwnerMetaTags() + '/calendar');
	},
	itemShouldDisplay: function() {
		return (CC.calendarMetaTagsEnabledForContainer() && CC.RouteHelpers.webcalEnabled());
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BANNER_CALENDAR);
	}
});

CC.BannerItems.Blog = Class.create(CC.MenuItem, {
	mBannerLinkGUID: 'banner/blog',
	mDisplayTitle: "_Banner.Blog.Title".loc(),
	action: function() {
		globalRouteHandler().routeURL(baseBannerLinkForOwnerMetaTags() + '/blog');
	},
	itemShouldDisplay: function() {
		return CC.blogMetaTagsEnabledForContainer();
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BANNER_BLOG);
	}
});
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

CC.ThemeChooserView = Class.create(CC.Mvc.View, {
	render: function() {
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_APPEARANCE_PARAMS);
		
		// Create all the divs for swatches.
		var chooser = Builder.node('div', {'class': 'setting settings_theme_chooser'}, [
			Builder.node('input', {id: 'settings_theme_name', type: 'hidden', value: 'blue'})
		]);
		var ul = chooser.appendChild(Builder.node('ul', {'role': 'presentation', 'class': 'theme_swatches input'}));
		"blue scarlet orange green royal purple steel carbon".split(" ").forEach(function(color) {
			var swatch = Builder.node('li', {'tabindex': tabIndex, 'role': 'listitem', 'aria-label': color + ' ' + "_Accessibility.Label.Color".loc(), className : 'theme_swatch ' + color, 'data-color': color}, 
				Builder.node('div', {'role': 'presentation', className: 'theme_swatch_container'}, [
					Builder.node('div', {'role': 'presentation', className: 'theme_main_swatch'}),
					Builder.node('div', {'role': 'presentation', className: 'theme_sidebar_swatch'})
				])
			);
			ul.appendChild(swatch);
		}, this);
		return chooser;
	}
});
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



// A sidebar view class.

CC.SidebarView = Class.create(CC.Mvc.View, {
	// An ordered array of sidebar sections.
	mSidebarSections: [],
	initialize: function(isTopLevel) {
		this.isTopLevel = isTopLevel || false;
	},
	render: function() {
		var elem = Builder.node('div', {className: 'cc-sidebar'}, [
			this.isTopLevel ? null : Builder.node('h2', {'tabindex': '-1'}, [
				Builder.node('span', {'tabindex': '-1', className: 'title ellipsis'}, "_Sidebar.Document.Info.Title".loc()),
				Builder.node('span', {'tabindex': '-1', className: 'button sidebar-close'}, "_Sidebars.Close.Title".loc())
			]),
			Builder.node('div', {className: 'content'})
		].compact());
		var closeButton = elem.down('.sidebar-close');
		if (closeButton) {
			// If we have a close button hook it up.
			closeButton.observe('click', this.onCloseButtonClick.bindAsEventListener(this));
			// Add the reverse button to re-open it (11292947).
			$$('.sidebar-open').invoke('remove');
			var openSidebar = Builder.node('div', {'className': 'sidebar-open'});
			$('content-primary').insertBefore(openSidebar, null);
			if (openSidebar) {
				openSidebar.observe('click', this.onOpenButtonClick.bindAsEventListener(this));
			}
		}
		if(this.isTopLevel) elem.addClassName('toplevel')
		return elem;
	},
	makeAccessible: function() {
		// Set Navigation landmark (SideBar/Nav)
		this.mParentElement.writeAttribute('role', 'contentinfo');
		this.mParentElement.writeAttribute('aria-label', "_Accessibility.Label.DocumentInfo".loc());
	},
	onCloseButtonClick: function(e) {
		e.stop();
		this.close();
	},
	onOpenButtonClick: function(e) {
		e.stop();
		this.open();
	},
	isOpen: function() {
		return !$('content').hasClassName('no-secondary');
	},
	open: function() {
		$('content').removeClassName('no-secondary');
		globalCookieManager().destroyCookie('cc.sidebar_closed');
	},
	close: function() {
		$('content').addClassName('no-secondary');
		globalCookieManager().setCookie('cc.sidebar_closed', true);
	},
	toggle: function() {
		this.isOpen() ? this.close() : this.open();
	},
	// Sets the sidebar sections for this sidebar.  Immediately renders the sidebar sections
	// and appends them to this sidebar view.
	setSidebarSections: function(inSidebarSections) {
		var items = this.mSidebarSections = (inSidebarSections || []);
		var fragment = document.createDocumentFragment();
		// Sidebar sections are not views, so render them manually.
		for (var idx = 0; idx < items.length; idx++) {
			var item = items[idx];
			if (item && item.element) fragment.appendChild(item.element);
			// Reopen the sidebar based on a cookie if necessary.
			item.restoreOpenStateFromCookie();
		}
		var contentElement = this.mParentElement.down('.content');
		contentElement.innerHTML = "";
		contentElement.appendChild(fragment);
	},
	setSidebarTitle: function(inTitle) {
		this.mElement.down('h2 span.title').innerHTML = (inTitle || "").escapeHTML();
	}
});
	
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

var updateHeaderBarBreadcrumbTrailForRouteInvocation = function(inRouteInvocation) {
	// Build up an array of breadcrumbs to show.
	var crumbs = [];
	if (inRouteInvocation.originalRoutePattern == CC.Routes.WIKI_ACTIVITY_ROUTE) {
		crumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': "_Activity.All".loc(), 'mURL': "/wiki/activity"}));
	} else if (inRouteInvocation.originalRoutePattern == CC.Routes.WIKI_PROJECTS_ROUTE) {
		crumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': "_General.All.Wikis".loc(), 'mURL': "/wiki/projects"}));
	} else if (inRouteInvocation.originalRoutePattern == CC.Routes.WIKI_PEOPLE_ROUTE) {
		crumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': "_General.All.People".loc(), 'mURL': "/wiki/people"}));
	} else if (inRouteInvocation.originalRoutePattern == CC.Routes.WIKI_SEARCH_ROUTE) {
		crumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': "_Search.SearchResults".loc(), 'mURL': 'javascript: window.location.reload();'}));
	}
	// Set the breadcrumbs trail for the shared header view.
	sharedHeaderView.setBreadcrumbItems(crumbs);
};

var buildContainerListUI = function(inType) {
	sharedBannerView.setVisible(true);
	sharedBannerView.setIsTopLevel(true);
	// Figure out the title/types based on the type we were passed.
	var titleLocKey = "_General.All.Wikis", entityTypes = ['com.apple.entity.Wiki'];
	if (inType == 'com.apple.entity.User') {
		titleLocKey = "_General.All.People";
		entityTypes = ['com.apple.entity.User'];
	} else if (inType == 'com.apple.entity.Document') {
		titleLocKey = "_General.Documents";
		entityTypes = ['com.apple.entity.Page', 'com.apple.entity.File'];
	}
	// Build the UI by setting the title and creating a paginating container list view scoped to
	// the correct entity types.
	var localizedTitle = titleLocKey.loc();
	sharedBannerView.setTitle(localizedTitle);
	CC.RouteHelpers.setBrowserWindowTitle(localizedTitle)
	var listView = new CC.PaginatingContainerListView();
	listView.mEntityTypes = entityTypes;
	mainView.addSubview(listView, '#content-primary', true);
	// Immediately paginate.
	listView.paginate();
};

var buildActivityUI = function() {
	var activityView = new CC.Activity.GroupedPaginatingActivityView();
	// Optionally scope the activity view if the meta tags look like this is a person or project
	// activity view. If the owner is a person set the scoping container flag.  Otherwise set the
	// scoping user flag.
	var ownerGUID = CC.meta('x-apple-owner-guid');
	if (ownerGUID) {
		var ownerType = CC.meta('x-apple-owner-type');
		if (ownerType == "com.apple.entity.User") {
			activityView.mScopingUserGUID = ownerGUID;
		} else {
			activityView.mScopingContainerGUID = ownerGUID;
		}
		activityView.mWatchedOnly = false;
	}
	mainView.addSubview(activityView, '#content-primary', true);
	// Hide the sort controls.
	var popup = activityView.mFilterBarView.$().down(".cc-filter-bar-view-popup");
	popup.hide();
	var keyword = activityView.mFilterBarView.$().down(".cc-filter-bar-view-keyword");
	keyword.hide();
	// Immediately paginate the activity view.
	activityView.paginate();
};

var buildDocumentsUI = function() {
	var listView = new CC.PaginatingContainerListView();
	// Use generic icons in the documents list.
	listView.mDisplayGenericPreviewIcons = true;
	listView.mEntityTypes = ['com.apple.entity.Page', 'com.apple.entity.File'];
	listView.mOwnerGUID = CC.meta('x-apple-owner-guid');
	mainView.addSubview(listView, '#content-primary', true);
	// Paginate.
	listView.paginate();
};

var buildPageUIForEntityGUID = function(inEntityGUID, inOptIncludeSidebar, inOptHideTitle, inOptDoNotHideSidebar) {
	// Configure the document sidebar.
	if (inOptIncludeSidebar) {
		buildDocumentSidebarUI();
	} else if (!inOptDoNotHideSidebar) {
		CC.RouteHelpers.setContentSecondaryVisible(false, false);
	}
	// Render the page by inside #content-primary.
	var primary = $('content-primary');
	primary.appendChild(Builder.node('div', {'id': 'wikieditor'}));
	var wikieditor = $('wikieditor');
	_globalEditorController = new CC.WikiEditor.EditorController({
		'mParentElement': wikieditor,
		'mToolbarParentElement': document.body,
		'mPageGUID': inEntityGUID,
		'mDebugMode': (window.location.href || "").match(/\?editorDebugMode=true/)
	});
	// If we're hiding the page title, wait for a page initialized notification first.
	if (inOptHideTitle) {
		globalNotificationCenter().subscribe(CC.WikiEditor.NOTIFICATION_PAGE_WAS_INITIALIZED, function() {
			var titleElement = _globalEditorController.mEditorView.mTitleView.$();
			titleElement.setStyle({
				'height': '0px',
				'overflow': 'hidden'
			});
		}, _globalEditorController);
	}
};

var buildDocumentSidebarUI = function() {
	var sidebarView = new CC.SidebarView(false);
	mainView.addSubview(sidebarView, '#content-secondary', true);
	if (!globalCookieManager().getCookie('cc.sidebar_closed')) {
		CC.RouteHelpers.setContentSecondaryVisible(true, false);
	}
	var sections = [
		new CC.TagsSidebarSection(),
		new CC.RelatedSidebarSection(),
		new CC.CommentsSidebarSection()
	];
	if (CC.meta('x-apple-user-logged-in') == "true") {
		sections.push(new CC.NotificationsSidebarSection());
	}
	sections.push(new CC.UpdatesSidebarSection());
	// Is this a private document?
	if ((CC.meta('x-apple-owner-type') == 'com.apple.entity.User') && (CC.meta('x-apple-owner-guid') == CC.meta('x-apple-user-guid'))) {
		sections.push(new CC.SharingSidebarSection());
	}
	sidebarView.setSidebarSections(sections);
};

var buildTagsUI = function() {
	var tagsView = new CC.Tags.GroupedTagsView();
	mainView.addSubview(tagsView, '#content-primary', true);
	// Hide the sort controls.
	var popup = tagsView.mFilterBarView.$().down(".cc-filter-bar-view-popup");
	popup.hide();
	// Immediately reload the tags view.
	tagsView.updateTags();	
};

var buildBlogListingUI = function() {
	var listView = new CC.BlogListingListView();
	listView.mEntityTypes = ['com.apple.entity.Page', 'com.apple.entity.File'];
	// Set the owner GUID appropiately so we can search for everything in the blog.
	listView.mOwnerGUID = CC.meta('x-apple-owner-blogGUID');
	mainView.addSubview(listView, '#content-primary', true);
	listView.paginate();
};

var buildContainerCalendarUI = function() {
	CC.RouteHelpers.setBodyClassName('calendar');
	// Put a container on the page that the shared calendar can draw into.
	var module = Builder.node('div', {'id': 'module_calendars'});
	// Append that container to main so we can hack it's position.
	var rootElement = $('main');
	rootElement.appendChild(module);
	// Trigger the shared instance to get created.
	calendarViewController();
};

// Route implementations.

var homepageRoute = function(inRouteInvocation) {
	CC.RouteHelpers.setBodyClassName('homepage');
	CC.RouteHelpers.setTopLevelClassNames(true);
	sharedBannerView.setVisible(false);
	CC.RouteHelpers.setBrowserWindowTitle("_OSXServer".loc());
	mainView.updateDisplayState();
	// Wipe out the breadcrumb bar.
	sharedHeaderView.resetBreadcrumbItems();
	CC.RouteHelpers.updateSharedDisplayState();
	// Build the page.
	var entityGUID = CC.meta('x-apple-entity-guid');
	buildPageUIForEntityGUID(entityGUID, false, true);
	// Signal the route as having completed.
	inRouteInvocation.routeDidComplete();
};

var allActivityRoute = function(inRouteInvocation) {
	if (CC.meta("x-apple-config-DisableAllActivityView") == "true") {
		logger().error("All activity is disabled");
		renderErrorMessage("_AllActivity.Disabled".loc());
		inRouteInvocation.routeDidComplete();
		return;
	}
	if (CC.meta("x-apple-username") == "unauthenticated") {
		logger().error("Unauthenticated user");
		renderErrorMessage("_AllActivity.Unauthenticated".loc());
		inRouteInvocation.routeDidComplete();
		return;		
	}	
	CC.RouteHelpers.setBodyClassName('activity');
	CC.RouteHelpers.setTopLevelClassNames();
	CC.RouteHelpers.updateSharedDisplayState();
	updateHeaderBarBreadcrumbTrailForRouteInvocation(inRouteInvocation);
	sharedBannerView.setVisible(true);
	sharedBannerView.setIsTopLevel(true);
	var allActivityTitle = "_Activity.All".loc();
	sharedBannerView.setTitle(allActivityTitle);
	CC.RouteHelpers.setBrowserWindowTitle(allActivityTitle);
	buildActivityUI()
	inRouteInvocation.routeDidComplete();
};

var allProjectsRoute = function(inRouteInvocation) {
	if (CC.meta("x-apple-config-DisableAllProjectsView") == "true") {
		logger().error("Projects are disabled");
		renderErrorMessage("_Projects.Disabled".loc());
		inRouteInvocation.routeDidComplete();
		return;
	}
	
	CC.RouteHelpers.setBodyClassName('projects');
	CC.RouteHelpers.setTopLevelClassNames();
	buildContainerListUI('com.apple.entity.Wiki');
	CC.RouteHelpers.updateSharedDisplayState();
	updateHeaderBarBreadcrumbTrailForRouteInvocation(inRouteInvocation);
	inRouteInvocation.routeDidComplete();
};

var allPeopleRoute = function(inRouteInvocation) {
	if (CC.meta("x-apple-config-DisableAllPeopleView") == "true") {
		logger().error("People are disabled");
		renderErrorMessage("_People.Disabled".loc());
		inRouteInvocation.routeDidComplete();
		return;
	}
	if (CC.meta("x-apple-username") == "unauthenticated") {
		logger().error("Unauthenticated user");
		renderErrorMessage("_People.Unauthenticated".loc());
		inRouteInvocation.routeDidComplete();
		return;		
	}		
	CC.RouteHelpers.setBodyClassName('people');
	CC.RouteHelpers.setTopLevelClassNames();
	buildContainerListUI('com.apple.entity.User');
	CC.RouteHelpers.updateSharedDisplayState();
	updateHeaderBarBreadcrumbTrailForRouteInvocation(inRouteInvocation);
	inRouteInvocation.routeDidComplete();
};

var searchRoute = function(inRouteInvocation) {
	CC.RouteHelpers.setBodyClassName('search');
	CC.RouteHelpers.setTopLevelClassNames();
	CC.RouteHelpers.updateSharedDisplayState();
	updateHeaderBarBreadcrumbTrailForRouteInvocation(inRouteInvocation);
	sharedBannerView.setVisible(true);
	sharedBannerView.setIsTopLevel(true);
	var searchResultsTitle = "_Search.SearchResults".loc();
	sharedBannerView.setTitle(searchResultsTitle);
	CC.RouteHelpers.setBrowserWindowTitle(searchResultsTitle);
	var searchView = new CC.Search.PaginatingSearchResultsView();
	searchView._render();
	var params = CC.params(inRouteInvocation.url);
	var keyword = params['keyword'];
	if (keyword) {
		var keywordTitle = "_Search.SearchResults.Keyword".loc(keyword);
		sharedBannerView.setTitle(keywordTitle);
		CC.RouteHelpers.setBrowserWindowTitle(keywordTitle);
	}
	var rootElement = $('content-primary');
	rootElement.appendChild(searchView.$());
	// Configure the search view by updating it's filter bar. This will indirectly call paginate on the
	// view when notifications fire as property changes like keyword and sortKey so we don't call paginate
	// explicitly.
	CC.Search.setupFilterForQuery(searchView.mFilterBarView, params);
	inRouteInvocation.routeDidComplete();
};

var unimplementedRoute = function(inRouteInvocation) {
	var url = inRouteInvocation.url;
	alert("Route not yet implemented for URL (%@)".fmt(url));
	inRouteInvocation.routeDidFail();
};

var pageRoute = function(inRouteInvocation) {
	CC.RouteHelpers.setBodyClassName('pages');
	CC.RouteHelpers.setTopLevelClassNames(false);
	// Update the banner and breadcrumb bar.
	CC.RouteHelpers.updateBannerForOwnerOrContainer();
	CC.RouteHelpers.updateBreadcrumbBarForEntityAndOwner();
	// Set the browser window title.
	CC.RouteHelpers.setBrowserWindowTitleForEntityAndOwner();
	CC.RouteHelpers.updateSharedDisplayState();
	// Build the page.
	var entityGUID = CC.meta('x-apple-entity-guid');
	buildPageUIForEntityGUID(entityGUID, true);
	var isBlogpost = (CC.meta('x-apple-entity-isBlogpost') == "true");
	if (isBlogpost) {
		CC.RouteHelpers.setSelectedBannerLinkByGUID("banner/blog");
	} else {
		CC.RouteHelpers.setSelectedBannerLinkByGUID("banner/documents");
	}
	// Mark the page as read.
	server_proxy().markEntityAsRead(CC.meta('x-apple-entity-guid'), Prototype.emptyFunction, Prototype.emptyFunction);
	// Signal the route as having completed.
	inRouteInvocation.routeDidComplete();
};


var fileRoute = function(inRouteInvocation) {
	CC.RouteHelpers.setBodyClassName('files');
	CC.RouteHelpers.setTopLevelClassNames(false);
	// Update the banner and breadcrumb bar.
	CC.RouteHelpers.updateBannerForOwnerOrContainer();
	CC.RouteHelpers.updateBreadcrumbBarForEntityAndOwner();
	// Set the browser window title.
	CC.RouteHelpers.setBrowserWindowTitleForEntityAndOwner();
	CC.RouteHelpers.updateSharedDisplayState();
	// Build the file detail view.
	var entityGUID = CC.meta('x-apple-entity-guid');
	var entityType = CC.meta('x-apple-entity-type');
	var isFileEntity = (entityType == "com.apple.entity.File");
	if (!isFileEntity) {
		logger().error("Tried to build a file UI for something that isn't a file (%@, %@)".fmt(entityGUID, entityType));
		return;
	}
	// Create a DOM node to draw into.
	var primary = $('content-primary');
	primary.addClassName('loading');
	// Fetch the file from the server.
	var gotFile = function(fileEntity) {
		var fileDetailView = CC.Files.buildInlineFileDetailView(fileEntity);
		mainView.addSubview(fileDetailView, '#content-primary');
		primary.removeClassName('loading');
	};
	server_proxy().entityForGUIDWithOptions(entityGUID, {'subpropertyPaths': server_proxy().mDefaultSubpropertyPaths}, gotFile, function() {
		logger().error("Could not find file entity for entity guid (%o)", entityGUID);
	});
	// Build the default document sidebar.
	buildDocumentSidebarUI();
	// Set the selected banner tab.
	CC.RouteHelpers.setSelectedBannerLinkByGUID("banner/documents");
	// Mark the file as read.
	server_proxy().markEntityAsRead(CC.meta('x-apple-entity-guid'), Prototype.emptyFunction, Prototype.emptyFunction);
	// Signal the route as having completed.
	inRouteInvocation.routeDidComplete();
};

var containerTabRoute = function(inRouteInvocation) {
	var ownerType = CC.meta('x-apple-owner-type');
	var mappedClassName = CC.RouteHelpers.mapEntityTypeToBodyClassName(ownerType);
	CC.RouteHelpers.setBodyClassName(mappedClassName);
	CC.RouteHelpers.setTopLevelClassNames(false);
	// Update the banner and breadcrumb bars.
	CC.RouteHelpers.updateBannerForOwnerOrContainer();
	CC.RouteHelpers.updateBreadcrumbBarForEntityAndOwner();
	CC.RouteHelpers.updateSharedDisplayState();
	// Start building a browser window title.
	var titleFormatString = "%@ - %@";
	var containerTitle = (CC.meta('x-apple-owner-longName') || CC.meta('x-apple-owner-shortName'));
	// Figure out what view to display.
	var url = inRouteInvocation.url;
	var urlMatches = url.match(/wiki\/[^\/]*\/[^\/]*\/(activity|documents|tags|calendar|blog)/);
	if (urlMatches && urlMatches.length > 0) {
		CC.RouteHelpers.setContentPrimaryFullWidth(true, false);
		var tabName = urlMatches[1];
		CC.RouteHelpers.setSelectedBannerLinkByGUID("banner/%@".fmt(tabName));
		if (tabName == 'activity') {
			buildActivityUI();
			CC.RouteHelpers.setBrowserWindowTitle(titleFormatString.fmt(containerTitle, "_Banner.Activity.Title".loc()));
		} else if (tabName == 'documents') {
			buildDocumentsUI();
			CC.RouteHelpers.setBrowserWindowTitle(titleFormatString.fmt(containerTitle, "_Banner.Documents.Title".loc()));
		} else if (tabName == 'tags') {
			buildTagsUI();
			CC.RouteHelpers.setBrowserWindowTitle(titleFormatString.fmt(containerTitle, "_Banner.Tags.Title".loc()));
		} else if (tabName == 'calendar') {
			if (!CC.calendarMetaTagsEnabledForContainer()) {
				renderErrorMessage("_Errors.Wiki.Calendar.Disabled".loc(), true);
			}
			// If webcal is enabled for the current protocol, display it.  If webcal is disabled completely display the disabled
			// UI, otherwise it must be enabled and disabled for the current protocol, so display that error.
			else if (CC.RouteHelpers.webcalEnabledForCurrentProtocol()) {
				buildContainerCalendarUI();
			}
			else if (!CC.RouteHelpers.webcalEnabled()) {
				renderErrorMessage("_Errors.Calendar.Disabled".loc(), true);
			}
			else {
				renderErrorMessage("_Errors.Wiki.Calendar.Disabled.NonSSL".loc(), true);
			}
			CC.RouteHelpers.setBrowserWindowTitle(titleFormatString.fmt(containerTitle, "_Banner.Calendar.Title".loc()));
		} else if (tabName == 'blog') {
			if (CC.blogMetaTagsEnabledForContainer()) {
				buildBlogListingUI();
			} else {
				renderErrorMessage("_Errors.Wiki.Blog.Disabled".loc(), true);
			}
			CC.RouteHelpers.setBrowserWindowTitle(titleFormatString.fmt(containerTitle, "_Banner.Blog.Title".loc()));
		}
	} else {
		CC.RouteHelpers.setSelectedBannerLinkByGUID("banner/home");
		CC.RouteHelpers.setBrowserWindowTitle(titleFormatString.fmt(containerTitle, "_Banner.Home.Title".loc()));
		var entityGUID = CC.meta('x-apple-entity-guid');
		// Use a custom sidebar on container homepages.
		var sidebarView = new CC.SidebarView(true);
		mainView.addSubview(sidebarView, '#content-secondary', true);
		CC.RouteHelpers.setContentSecondaryVisible(true, false);
		var sections = [
			new CC.RecentDocumentsSidebarSection(),
			new CC.ContainerNotificationsSidebarSection()
		];
		if (CC.metaAsArray('x-apple-owner-unapproved-comment-guids').length > 0) {
			sections.push(new CC.ModeratedCommentsSidebarSection());
		}
		sections.push(new CC.ContainerUpdatesSidebarSection());
		if (CC.calendarMetaTagsEnabledForContainer() && CC.RouteHelpers.webcalEnabledForCurrentProtocol()) {
			sections.push(new CC.UpcomingEventsSidebarSection());
		}
		sidebarView.setSidebarSections(sections);
		// Mark the homepage as read.
		server_proxy().markEntityAsRead(CC.meta('x-apple-entity-guid'), Prototype.emptyFunction, Prototype.emptyFunction);
		// Draw the homepage,
		buildPageUIForEntityGUID(entityGUID, false, true, true);
	}
	inRouteInvocation.routeDidComplete();
};

var allTagsRoute = function(inRouteInvocation) {
	CC.RouteHelpers.setBodyClassName('tags');
	CC.RouteHelpers.setTopLevelClassNames();
	CC.RouteHelpers.updateSharedDisplayState();
	updateHeaderBarBreadcrumbTrailForRouteInvocation(inRouteInvocation);
	sharedBannerView.setVisible(true);
	sharedBannerView.setIsTopLevel(true);
	var allTagsTitle = "_General.All.Tags".loc();
	sharedBannerView.setTitle(allTagsTitle)
	CC.RouteHelpers.setBrowserWindowTitle(allTagsTitle);
	buildTagsUI();
	inRouteInvocation.routeDidComplete();
};
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

// Custom blog page filter view class so we can set the default sort direction to most recent.
// We use updateTime rather than lastActivityTime here too (11737584).

CC.BlogListingAllowedSortKeys = $H({
	'title': 'longName',
	'mostRecent': '-updateTime',
	'leastRecent': 'updateTime'
});

CC.BlogListingListFilterBarView = Class.create(CC.PaginatingSearchQueryListFilterBarView, {
	mSortKey: '-updateTime',
	_mSortKey: 'mostRecent',
	mAllowedSortKeys: CC.BlogListingAllowedSortKeys
});

// Blog listing view subclass.  A paginating list view that renders an inline blog post list.

CC.BlogListingListView = Class.create(CC.PaginatingSearchQueryListView, {
	mSearchFields: ['tinyID', 'longName', 'type', 'createTime', 'updateTime', 'isFavorite', 'extendedAttributes'],
	mSubFields: {
		'containerGUID.longName': 'container.longName',
		'containerGUID.shortName': 'container.shortName',
		'containerGUID.type': 'container.type',
		'containerGUID.avatarGUID': 'container.avatarGUID',
		'containerGUID.tinyID': 'container.tinyID',
		'updatedByUserGUID.longName': 'updatedByUser.longName',
		'updatedByUserGUID.shortName': 'updatedByUser.shortName',
		'updatedByUserGUID.type': 'updatedByUser.type',
		'updatedByUserGUID.avatarGUID': 'updatedByUser.avatarGUID',
		'updatedByUserGUID.tinyID': 'updatedByUser.tinyID'
	},
	mFilterBarViewClass: 'CC.BlogListingListFilterBarView',
	mDefaultPaginationHowMany: 3,
	renderResultItem: function(inResultItem) {
		if (!inResultItem) return;
		var blogPostBodyElement = Builder.node('div', {className: 'cc-blog-item'});
		var blogPostGUID = inResultItem.guid;
		new CC.WikiEditor.ReadOnlyEditorController({
			mParentElement: blogPostBodyElement,
			mPageGUID: blogPostGUID
		});
		return blogPostBodyElement;
	}
});
// Copyright (c) 2009-2015 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



function mapTypeToURL(inType) {
	typeURLMap = {
		'com.apple.entity.Wiki': 'projects',
		'com.apple.entity.User': 'people'
	};
	return typeURLMap[inType];
};

function openSetting(id) {
	$$('#settings-menu ul li > a').each(function(menu) {
		Element.extend(menu);
		menu.up().removeClassName('active');
		if (menu.readAttribute('name') == id) {
			menu.up().addClassName('active');
		}
	});
	$$('.settings-section').each(function(section) {
		Element.extend(section);
		section.removeClassName('showing');
	});
	$(id).addClassName('showing');
};

var SettingsController = Class.create({
	initialize: function(inEntity, inOptBlogEntity) {
		this.mParentElement = $('settings');
		if (!this.mParentElement || !inEntity) return false;
		this.entity = inEntity;
		this.blogEntity = inOptBlogEntity;
		this.entityGUID = inEntity.guid;
		this.entityType = inEntity.type;
		var acls_element = this.mParentElement.down('.cc-access-editor-view');
		if (acls_element) {
			// Get the GUID we're using for ACLs. For a wiki this is unnecessary but for a user we actually display
			// the blog acls.
			var aclEntity = this.entity;
			var acls = aclEntity.acls;
			// Are we actually displaying ACLs for the blog entity for a user? The default ACLs for a blog are world-readable.
			var aclsGUID = (inEntity.type == 'com.apple.entity.Wiki') ? this.entityGUID : this.blogEntity.guid;
			if (aclsGUID != this.entityGUID) {
				if (this.blogEntity) {
					aclEntity = this.blogEntity;
					acls = (aclEntity.acls) ? aclEntity.acls : [];
				}
			}
			if (aclEntity && aclEntity.type == 'com.apple.entity.Blog' && acls && acls.length == 0) {
				var defaultAllUsers = CC.deepClone(CC.AccessEditor.DefaultAllUsersACL);
				defaultAllUsers['action'] = 'read';
				var defaultLoggedInUsers = CC.deepClone(CC.AccessEditor.DefaultLoggedInUsersACL);
				defaultLoggedInUsers['action'] = 'read';
				this.access_editor = new CC.AccessEditorView(acls, false, aclsGUID, defaultAllUsers, defaultLoggedInUsers);
			} else {
				this.access_editor = new CC.AccessEditorView(acls, false, aclsGUID);
			}
			this.access_editor._render();
			acls_element.appendChild(this.access_editor.$());
		}
		var avatar_element = this.mParentElement.down('.cc-avatar-editor');
		if (avatar_element) {
			this.avatar_editor = new CC.AvatarEditor(avatar_element, this.entity['avatarGUID'], true);
		}
		var swatches = this.mParentElement.getElementsByClassName('theme_swatch');
		var themeInfo = this.entity.themeInfo;
		var splitThemeInfo = (themeInfo || "").split(',');
		if (splitThemeInfo.length == 0) splitThemeInfo = ['blue', '', ''];
		if (splitThemeInfo[0] == "") splitThemeInfo[0] = 'blue';
		var themeSettings = splitThemeInfo;
		var selectedColor = themeSettings[0];
		$('settings_theme_name').value = selectedColor;
		for (var i = 0; i < swatches.length; i++) {
			swatches[i].on('click', this.changeColor.bind(this, swatches[i]));
			if (swatches[i].getAttribute('data-color') == selectedColor) {
				swatches[i].addClassName('selected');
			}
		}
		var banner_image_element = this.mParentElement.down('.banner_image_editor .cc-avatar-editor');
		if (banner_image_element) {
			this.banner_image_editor = new CC.AvatarEditor(banner_image_element, themeSettings[1], false, true);
		}
		var background_image_element = this.mParentElement.down('.background_image_editor .cc-avatar-editor');
		if (background_image_element) {
			this.background_image_editor = new CC.AvatarEditor(background_image_element, themeSettings[2], false, true);
		}
		
		// Fill in UI with data from entity
		Form.Element.setValue($('longName'), this.entity.longName);
		if ($('description'))
			Form.Element.setValue($('description'), this.entity.description);
		if ($('settings_services_calendar'))
			Form.Element.setValue($('settings_services_calendar'), this.entity.extendedAttributes.settings.calendar_enabled);
		if ($('settings_preferred_email'))
			Form.Element.setValue($('settings_preferred_email'), this.entity.privateAttributes.preferredEmailAddress);
		if ($('settings_comment_access'))
			Form.Element.setValue($('settings_comment_access'), this.entity.extendedAttributes.settings.comments);
		if ($('settings_comment_moderation'))
			Form.Element.setValue($('settings_comment_moderation'), this.entity.extendedAttributes.settings.commentModeration);
		if ($('settings_send_notification'))
			Form.Element.setValue($('settings_send_notification'), this.entity.extendedAttributes.settings.isNotificationEnabled);
		
		this.saveBtn = this.mParentElement.down('.actions .save');
		this.cancelBtn = this.mParentElement.down('.actions .cancel');
		this.saveBtn.on('click', this.handleSave.bindAsEventListener(this));
		this.cancelBtn.on('click', this.handleCancel.bindAsEventListener(this));
		this.enableButtons();
	},
	enableButtons: function() {
		this.saveBtn.enable();
		this.cancelBtn.enable();
	},
	disableButtons: function() {
		this.saveBtn.disable();
		this.cancelBtn.disable();
	},
	changeColor: function(el) {
		var newTheme = el.getAttribute('data-color');
		$('settings_theme_name').value = newTheme;
		var swatches = this.mParentElement.getElementsByClassName('theme_swatch');
		for (var i = 0; i < swatches.length; i++) {
			swatches[i].removeClassName('selected');
		}
		el.addClassName('selected');
	},
	savedCallback: function() {
		dialogManager().hide();
		this.enableButtons();
		var href = window.location.href;
		var match = href.match(/^(.*)\?showSettings=true/);
		if (match) {
			window.location.href = match[1];
		} else {
			window.location.reload();
		}
	},
	errorCallback: function (err) {
		var acls = this.entity && this.entity.acls;
		var exceptionString = err && err.response && err.response.exceptionString && err.response.exceptionString.split(": ")[1];
		var errorNode = null;
		for (var i = 0; i < acls.length; i++){
			var acl = acls[i];
			var externalGUID = acl.userExternalID.split(":")[1] || acl.userExternalID;
			if(externalGUID == exceptionString) {
				var userLogin = acl.userLogin
				errorNode = this.mParentElement.querySelector("a[userlogin='"+userLogin+"']").parentNode;
			}
		}
		if (errorNode != undefined && errorNode != null) {
			errorNode.style.backgroundColor = "#ffc5cc";
		}
		notifier().printErrorMessage("_Settings.Save.Error.Message".loc());
		dialogManager().hide();
		this.enableButtons();
		logger().error("Error: ", err);
	},
	handleSave: function(e) {
		dialogManager().showProgressMessage("_Settings.Save.Progress.Message".loc());
		this.disableButtons();
		var changes = [];
		var isUserEntity = (this.entity.type == 'com.apple.entity.User');
		$$('div.setting .setting_input').each(function(elem) {
			var elemVal = elem.value;
			var elemID = elem.readAttribute("id");
			if (this.entity[elemID] != elemVal) {
				changes[changes.length] = [elemID, elemVal];
			}
		}, this);
		if (!this.entity['extendedAttributes']) this.entity['extendedAttributes'] = {};
		if (!this.entity['extendedAttributes']['settings']) this.entity['extendedAttributes']['settings'] = {};
		if (!this.entity['privateAttributes']) this.entity['privateAttributes'] = {};
				
		// Avatar settings.
		if (this.avatar_editor) {
			changes.push(['avatarGUID', this.avatar_editor.file_guid]); // #8601188
		}
		// Wiki Theme
		var themeSettings = (this.entity['themeInfo']) ? this.entity['themeInfo'].split(',') : ['blue', '', ''];
		if ($('settings_theme_name')) {
			themeSettings[0] = $F('settings_theme_name');
		}
		// Banner image
		if (this.banner_image_editor) {
			themeSettings[1] = this.banner_image_editor.file_guid || '';
		}
		// Background image
		if (this.background_image_editor) {
			themeSettings[2] = this.background_image_editor.file_guid || '';
		}
		changes.push(['themeInfo', themeSettings.join(',')]);
		
		// Comment moderation.
		if ($('settings_comment_access')) {
			this.entity['extendedAttributes']['settings']['comments'] = $F('settings_comment_access');
		}
		if ($('settings_comment_moderation')) {
			this.entity['extendedAttributes']['settings']['commentModeration'] = $F('settings_comment_moderation');
		}
		var isNotificationEnabled;
		if ($('settings_send_notification')) {		
			this.entity['extendedAttributes']['settings']['settings_send_notification'] = $('settings_send_notification').checked;
		}
		// Profile and services.
		if ($('settings_preferred_email')) {			
			this.entity['privateAttributes']['preferredEmailAddress'] = $F('settings_preferred_email');
		}
		var isBlogEnabled;
		if ($("settings_services_blog")) {
			isBlogEnabled = $('settings_services_blog').checked;
			changes.push(['isBlogEnabled', isBlogEnabled]);
		}
		if ($("settings_services_calendar")) {
			this.entity['extendedAttributes']['settings']['calendar_enabled'] = $('settings_services_calendar').checked;
		}
		// Update the changeset with any extended/private attributes before saving.
		changes.push(['extendedAttributes', this.entity['extendedAttributes']]);
		changes.push(['privateAttributes', this.entity['privateAttributes']]);
		// Persist any changes straightforward entity changes first.
		var cs = new CC.EntityTypes.EntityChangeSet({
			'changeAction': "UPDATE",
			'entityGUID': this.entity.guid,
			'entityRevision': this.entity.revision,
			'entityType': this.entity.type,
			'changes': changes,
			'force': false
		});		
		var boundErrorCallback = this.errorCallback.bind(this);
		var callback = function(inResponse) {
			var innerCallback = function() {
				// If we're saving user settings, update the isBlogEnabled flag seperately.
				if (isUserEntity) {
					return server_proxy().entityForGUID(this.entity.blogGUID, function(blogEntity) {
						var blogcs = new CC.EntityTypes.EntityChangeSet({
							'changeAction': "UPDATE",
							'entityGUID': blogEntity.guid,
							'entityRevision': blogEntity.revision,
							'entityType': blogEntity.type,
							'changes': [['isHidden', (isBlogEnabled ? false : true), null]],
							'force': false
						});
						return server_proxy().updateEntity(blogcs, this.savedCallback.bind(this), boundErrorCallback);
					}.bind(this), boundErrorCallback);
				}
				return this.savedCallback();
			}.bind(this);
			// Update the acls for this project or user blog.
			if (this.access_editor) {
				var isNotificationEnabled = this.entity.extendedAttributes.settings.settings_send_notification;
				return this.access_editor.save(isNotificationEnabled, innerCallback, boundErrorCallback);
			} else {
				return innerCallback();
			}
		};
		return server_proxy().updateEntity(cs, callback.bind(this), boundErrorCallback);
	},
	handleCancel: function(e) {
		settingsPanel().hide();
	}
});

var SettingsPanel = Class.createWithSharedInstance('settingsPanel');
Object.extend(Object.extend(SettingsPanel.prototype, CC.Keyboard.Mixins.Responder), {
	initialize: function() {
		this.placeholderName = "";
		var settings_panel = Builder.node('div', {'role': 'navigation', 'aria-label': "_Accessibility.Dialog.Settings".loc(), id:"settings_panel", className:"dialog settings", role:"dialog"});
		mainView.$().appendChild(settings_panel);
		this.element = settings_panel;
		if (!this.element) return invalidate;
		this.mask = $(Builder.node('div', { id: "settings_panel_mask" }));
		this.mask.on('click', this.onMaskClick.bindAsEventListener(this));
		this.mask.hide();
		this.element.hide();
		document.body.appendChild(this.mask);
		document.body.appendChild(this.element.remove());  // relocate the dialog to the end of the document
		bindEventListeners(this, [
			'onFormSubmit',
			'onCancelButtonClick',
			'onDocumentKeypress'
		]);
	},
	showForGUIDAndType: function(inGUID, inType) {
		var type = mapTypeToURL(inType);
		this.fetchAndRenderDialogForGUIDAndType(inGUID, type, this.didShow.bind(this));
	},
	fetchAndRenderDialogForGUIDAndType: function(inGUID, inType, inCallback) {				
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_GENERAL);		
		var existing = $('content-settings');
		if (existing) {
			Element.remove(existing);
		}
		
		dialogManager().showProgressMessage("_Loading".loc());
		
		var isUser = (inType == 'people');
		var isBlogEnabled, blogGUID;
		var isCalendarEnabled = CC.calendarMetaTagsEnabledForContainer();
		var isCalendarServiceEnabled = CC.RouteHelpers.webcalEnabled();
		if (isUser) {
			isBlogEnabled = CC.meta('x-apple-user-isBlogEnabled') == "true";
			blogGUID = CC.meta('x-apple-user-blogGUID');
		} else {
			isBlogEnabled = CC.meta('x-apple-container-isBlogEnabled') == "true";
			blogGUID = CC.meta('x-apple-container-blogGUID');
		}
		var shouldShowPermissionSection = (!isUser || (isUser && isBlogEnabled)) // always show for projects, conditionally show for users
		
		// Helpers
		var buildMenuList = function(inName, inDisplayName, isSelected, tabindex) {
			return Builder.node('li', {className: isSelected ? 'active' : ''}, 
				Builder.node('a', {'tabindex': tabindex, 'role': 'link', href:'#', title:inDisplayName.loc(), name:inName, onClick:"openSetting('%@');".fmt(inName)}, inDisplayName.loc())
			);
		};	
		var sliceForSetting = function(name, displayName, content) {
			return Builder.node('div', {className: 'setting'}, [
				Builder.node('div', {className: 'label'}, 
					Builder.node('label', {'tabindex': '-1', value: displayName.loc(), 'for': name}, displayName.loc())
				),
				Builder.node('div', {className: 'input'}, content)
			]);
		};
		var buildInput = function(name, type) {
			if (type='text') {
				var inputElem = Builder.node('input', {'tabindex': ++tabIndex, 'role': 'textbox', type: 'text', maxlength: '100'})
			} else {
				var inputElem = Builder.node('textarea', {'tabindex': ++tabIndex, 'role': 'textbox'}, '')
			}
			inputElem.id = name;
			inputElem.className = 'setting_input';
			return inputElem;
		};		
		var buildServiceChoice = function(name, displayName, checked, disabled)  {
			var checkbox = Builder.node('input', {'tabindex': ++tabIndex, 'role': 'checkbox', type: 'checkbox', 'name': name, id: name});
			if (disabled) checkbox.disabled = true;
			checkbox.checked = checked;
			return Builder.node('div', {className: 'service'}, [
				checkbox,
				Builder.node('label', {'for': name}, displayName)
			])
		};
		var buildSelect = function(id, prefix, options, tabindex) {
			var choices = [];
			options.forEach(function(option){
				choices.push(Builder.node('option', {'role': 'option', value: option}, prefix.fmt(option.capitalize()).loc()));
			});
			return Builder.node('select', {'tabindex': tabindex, 'role': 'listbox', 'id': id}, choices);
		};
				
		var tabIndexGeneral = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_GENERAL);
		var tabIndexAppearance = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_APPEARANCE);
		var tabIndexPermissions = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS);		
		var tabIndexSave = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_BUTTON_SAVE);
		var tabIndexCancel = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_BUTTON_CANCEL);
		var tabIndexComment = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS_COMMENTS);
		var tabIndexModeration = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS_MODERATION);
		
		var mainContent = Builder.node('div', {id: 'content-settings', className: 'wrapchrome'}, [
			Builder.node('div', {'atbindex': '-1', id: 'settings-header'}, [
				Builder.node('h2', "_Settings.%@.Title".fmt(inType.capitalize()).loc())
			]),
						
			Builder.node('div', {'role': 'navigation', 'aria-label': "_Accessibility.Navigation.Left".loc(),  id: 'settings-menu'}, 
				Builder.node('ul', {}, [
					buildMenuList("general", "_Settings.General", true, tabIndexGeneral),
					buildMenuList("appearance", "_Settings.Appearance", false, tabIndexAppearance),
					shouldShowPermissionSection ? buildMenuList("permissions", "_Settings.%@.Permissions".fmt(inType.capitalize()), false, tabIndexPermissions) : null
				].compact())
			),
			
			Builder.node('div', {'role': 'navigation', 'aria-label': "_Accessibility.Navigation.Settings".loc(), id: 'settings'}, [
				Builder.node('div', {id: 'general', className: 'settings-section showing'}, 
					Builder.node('fieldset', {className: 'general'}, [
						sliceForSetting('longName', "_Settings.%@.Name".fmt(inType.capitalize()), buildInput('longName', 'text')),
			
						isUser ?
						sliceForSetting("settings_preferred_email", "_Settings.PreferredEmail.Label", buildInput('settings_preferred_email', 'text'))
						:
						sliceForSetting("description", "_Settings.Projects.Description", buildInput('description', 'textarea')),
						
						sliceForSetting('', '_Settings.Services', [
							isUser ? null : buildServiceChoice('settings_services_calendar', "_Settings.Services.Calendar".loc(), isCalendarEnabled, isCalendarServiceEnabled == false),
							buildServiceChoice('settings_services_blog', "_Settings.Services.Blog".loc(), isBlogEnabled)
						].compact())
					])
				),
					
				Builder.node('div', {id: 'appearance', className: 'settings-section'}, 
					Builder.node('fieldset', {}, [
						Builder.node('div', {className: 'setting avatar_editor'}, 
							sliceForSetting('settings_avatar', "_Settings.Avatar.%@.Label".fmt(inType.capitalize()), new CC.AvatarEditorView(inType)._render())
						),						
						Builder.node('div', {className: 'setting color_scheme_editor'}, [
							Builder.node('div', {className: 'label'},
								Builder.node('label', {}, "_Settings.ColorScheme.Label".loc())
							),
							new CC.ThemeChooserView()._render()
						]),
						Builder.node('div', {className: 'setting banner_image_editor'}, sliceForSetting('', "_Settings.BannerImage.Label", [
							new CC.AvatarEditorView(inType)._render(),
							Builder.node('span', {className: 'info'}, "_Settings.BannerImage.Help".loc())
						])),
						Builder.node('div', {className: 'setting background_image_editor'}, sliceForSetting('', "_Settings.BackgroundImage.Label",
							new CC.AvatarEditorView(inType)._render()
						))
					])
				),
				
				shouldShowPermissionSection ? 
				Builder.node('div', {id: 'permissions', className: 'settings-section'}, 
					Builder.node('fieldset', {className: 'acls'}, [
						Builder.node('div', {className: 'settings_access_editor'}, [
							Builder.node('div', {className: 'settings_access_editor_label'}, "_Settings.%@.AccessEditor.Label".fmt(inType.capitalize()).loc()),
							Builder.node('div', {className: 'cc-access-editor-view'})
						]),
						sliceForSetting('settings_comment_access', '_Settings.CommentAccess.Label', 						
							buildSelect('settings_comment_access', '_Settings.CommentAccess.%@', ["disabled", "all", "authenticated"], tabIndexComment)
						),
						sliceForSetting('settings_comment_moderation', '_Settings.CommentModeration.Label', 
							buildSelect('settings_comment_moderation', '_Settings.CommentModeration.%@', ["disabled", "all", "anonymous"], tabIndexModeration)
						)
					])					
				) : null,
								
				Builder.node('div', {id: 'actions'}, 
					Builder.node('fieldset', {className: 'actions'}, [
						Builder.node('input', {'tabindex': tabIndexSave, type: 'submit', className: 'save', value: '_General.Save'.loc()}),
						Builder.node('input', {'tabindex': tabIndexCancel, type: 'button', className: 'cancel', value: '_General.Cancel'.loc()})
					])
				)
				
			].compact())
		]);
				
		this.element.appendChild(mainContent);

		this.didFetchAndRenderDialog(inGUID, blogGUID);
		if (inCallback) inCallback();
		
	},
	didFetchAndRenderDialog: function(inGUID, inOptBlogGUID) {
		var batch = [
			['ContentService', 'entityForGUID:', inGUID],
			['ContentService', 'aclsForEntityGUID:', inGUID]
		];
		if (inOptBlogGUID) {
			batch.push(['ContentService', 'entityForGUID:', inOptBlogGUID]);
			batch.push(['ContentService', 'aclsForEntityGUID:', inOptBlogGUID]);
		}
		// Fetch the entities we need out-of-band to avoid JSON encoding/escaping issues in Rails (11668385).
		var gotResponse = function(response) {
			var entity, blogEntity;
			if (response && response.responses && response.responses.length > 1) {
				var responses = response.responses;
				var firstResponse = responses[0];
				entity = firstResponse.response;
				// Check entity is not a placeholder
				if (!entity || entity.type == 'com.apple.EntityPlaceholder') {
					logger().error("Got a null or placeholder entity (%@) .. bailing".fmt(entity));
					dialogManager().hide();
					return false;
				}
				var secondResponse = responses[1];
				entity.acls = secondResponse.response;
				// Did we also grab a blog entity and its ACLs?
				if (responses.length > 2) {
					var thirdResponse = responses[2];
					var fourthResponse = responses[3];
					blogEntity = thirdResponse.response;
					blogEntity.acls = fourthResponse.response;
				}
				dialogManager().hide();
				var settingsController = new SettingsController(entity, blogEntity);
				return true;
			}
			// Something went badly wrong, bail.
			logger().error("Could not get entity or optional blog entity for settings panel.. bailing");
			dialogManager().hide();
			return false;
		}.bind(this);
		service_client().batchExecuteAsynchronously(batch, null, gotResponse, gotResponse);
	},
	didShow: function() {
		this.becomeFirstResponder();
		
		window.scrollTo(0, 0);
		this.mask.show();
		
		// display hidden so we can get the DOM dimensions
		this.element.setStyle({ visibility: 'hidden' });
		this.element.show();

		// center the dialog
		var offsetTop  = (window.innerHeight || document.documentElement.offsetHeight) - this.element.getHeight();
		var offsetLeft = this.element.getOffsetParent().getWidth() - this.element.getWidth();
		this.element.setStyle({
			top:  Math.max( offsetTop / 4,  0 ) + 'px',
			left: Math.max( offsetLeft / 2, 0 ) + 'px'
		});

		// hide and return visibility so we can animate...
		this.element.hide();
		this.element.setStyle({
			//position: MozillaFixes.isGecko ? 'fixed' : 'absolute',
			position: 'absolute',
			visibility: 'visible'
		});

		// now animate open...
		new Effect.Appear(this.element, { duration:0.3, afterFinish: function() {				
			// do something on appear here
			// Focus on first element of the popup
			var firstElement = this.element.querySelector('input:first-child');
			firstElement.focus();			
		}.bind(this)});
		document.observe('keypress', this.onDocumentKeypress);
		
		// Temporary disabling background items when modal dialog is open in order to avoid bad tabindex-ing
		accessibility().makeRootViewsAriaHidden(false);
	},
	hide: function() {
		document.stopObserving('keypress', this.onDocumentKeypress);
		this.mask.hide();
		this.element.hide();
		this.loseFirstResponder();
		
		// Bring background items back to foreground when closing modal dialog to bring back original tabindex-ing
		accessibility().makeRootViewsAriaVisible(false);
	},
	onFormSubmit: function(e) {
		e.stop();
	},
	// panel button handlers
	onCancelButtonClick: function(e) {
		e.stop();
		// do URL cleanup, then...
		// close the dialog
		this.hide();
	},
	onDocumentKeypress: function(e) {
		if (e.keyCode == Event.KEY_ESC) {
			this.onCancelButtonClick(e);
		}
	},
	onMaskClick: function(e) {
		e.stop();
	},
	handleKeyboardNotification: function(inMessage, inObject, inOptExtras) {
		if (inMessage == CC.Keyboard.NOTIFICATION_DID_KEYBOARD_ESC) {
			this.onCancelButtonClick(inOptExtras.event);
		}
		return true;
	}
});

// Automatically open the settings panel.

var autoSettingsOpener = Class.createWithSharedInstance('autoSettingsOpener', true);
autoSettingsOpener.prototype = {
	initialize: function() {
		var hashMatch = window.location.href.match(/\?showSettings=true/);
		var settingsAccess = (CC.meta('x-apple-user-is-owner') == "true" || CC.meta('x-apple-user-is-admin') == "true");
		if (hashMatch && settingsAccess) {
			var projectGUID = CC.meta('x-apple-owner-guid');
			var parentType = CC.meta('x-apple-owner-type');
			settingsPanel().showForGUIDAndType(projectGUID, parentType);
		} else {
			return invalidate;
		}
	}
};
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



CC.Tags = CC.Tags || new Object();

// A tag querying service.

CC.Tags.TagsService = Class.create({
	// Fetches all tags (in an optional scope or matching) returned as an array of strings.
	// Accepts an optional callback parameter that will be fired with an array of tags response
	// once the request has completed successfully.
	getTags: function(inOptScopeGUID, inOptCallback) {
		if (inOptScopeGUID) {
			return server_proxy().allTagsOwnedByGUID(inOptScopeGUID, inOptCallback, inOptCallback);
		} else {
			return server_proxy().allTags(inOptCallback, inOptCallback);
		}
	},
	// Replaces a given tag with another tag in a container.
	replaceTagInContainer: function(inOldTag, inNewTag, inContainerGUID, inOptCallback, inOptErrback) {
		server_proxy().replaceTagWithTagInOwnerGUID(inOldTag, inNewTag, inContainerGUID, inOptCallback, inOptErrback);
	},
	// Globally replaces a given tag with another tag.
	globallyReplaceTag: function(inOldTag, inNewTag, inOptCallback, inOptErrback) {
		server_proxy().globallyReplaceTagWithTag(inOldTag, inNewTag, inOptCallback, inOptErrback);
	},
	// Deletes a given tag in a container.
	deleteTagInContainer: function(inTag, inContainerGUID, inOptCallback, inOptErrback) {
		if (!inTag || !inContainerGUID) return (inOptErrback ? inOptErrback() : undefined);
		server_proxy().deleteTagInOwnerGUID(inTag, inContainerGUID, inOptCallback, inOptErrback);
	},
	// Globally deletes a given tag. Accepts an optional callback.
	globallyDeleteTag: function(inTag, inOptCallback, inOptErrback) {
		if (!inTag) return (inOptErrback ? inOptErrback() : undefined);
		server_proxy().globallyDeleteTag(inTag, inOptCallback, inOptErrback);
	}
});

CC.Tags.FilterBarView = Class.create(CC.FilterBarView, {
	mAllowedFilters: []
});

// A grouped tags view.

CC.Tags.GroupedTagsView = Class.create(CC.Mvc.View, {
	mTagsService: new CC.Tags.TagsService(),
	mEditing: false,
	mMaximumCollapsedGroupHeight: 105,
	render: function() {
		
		bindEventListeners(this, [
			'handleEditPencilClicked',
			'handleDoneButtonClicked',
			'handleShowMoreClicked',
			'handleShowLessClicked',
			'handleTagClicked',
			'handleTagDeleteClicked'
		]);
		
		var tabIndexFilterEdit = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_FILTER_SAVE);
		var tabIndexFilterDone = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_FILTER_DONE);
		
		var elem = Builder.node('div', {className: 'cc-grouped-tags-view loading'}, [
			Builder.node('div', {'tabindex': '-1', className: 'cc-grouped-tags-view-filters'}),
			Builder.node('div', {'role': 'navigation', 'aria-label': "_Accessibility.Navigation.Actions".loc(), className: 'cc-grouped-tags-view-actions'}, [
				Builder.node('span', {'tabindex': tabIndexFilterEdit, 'role': 'button', className: 'button edit', title: "_Tags.Edit.Tooltip".loc()}, "_Tags.Edit".loc()),
				Builder.node('span', {'tabindex': tabIndexFilterDone, 'role': 'button', className: 'button done cc-filter-bar-right-button'}, "_Tags.Edit.Done".loc())
			]),
			Builder.node('h2', {className: 'loading'}, "_Tags.Placeholder.Loading".loc()),
			Builder.node('h2', {className: 'empty'}, "_Tags.Placeholder.Empty".loc()),
			Builder.node('div', {'role': 'navigation', 'aria-label': "_Accessibility.Navigation.TagGroup".loc(), className: 'groupings'})
		]);
		Event.observe(elem.down('span.edit'), 'click', this.handleEditPencilClicked);
		Event.observe(elem.down('span.done'), 'click', this.handleDoneButtonClicked);
		if (CC.meta('x-apple-user-is-owner') == 'true' || CC.meta('x-apple-user-is-admin') == 'true')  {
			elem.addClassName('editable');
		}
		// Add a filter bar view.
		this.mFilterBarView = new CC.Tags.FilterBarView();
		this.mFilterBarView._render();
		elem.down('.cc-grouped-tags-view-filters').appendChild(this.mFilterBarView.$());
		return elem;
	},
	// Fetches an updated set of tags using the tags service, and updates this view.
	updateTags: function() {
		var scope = CC.meta('x-apple-owner-guid');
		this.mTagsService.getTags(scope, this.gotTagsCallback.bind(this));
	},
	gotTagsCallback: function(inTags) {
		this.mParentElement.removeClassName('loading');
		if (!inTags || inTags.length == 0) {
			this.mParentElement.addClassName('empty');
			return true;
		}
		var groupings = this.getTagGroupings(inTags);
		this.renderGroupedTags(groupings);
	},
	// Divides an array of tags into groupings. To support localization, groupings are
	// defined by a grouping alphabet (all possible grouping headers that can appear in
	// the list), and grouping membership is determined by a "starts with" string match
	// against the allowed grouping patterns for a given grouping header. Returns an array
	// of arrays of grouping information.
	getTagGroupings: function(inTags) {
		// Get all possible grouping headers.
		var groupingHeaders = "_Tags.Groupings.Headers.Keys".loc().split(',');
		// Build a hash of display names and possible prefix matches for each header.
		var groupingData = new Array();
		var header, displayName, prefixes, prefix, tags, tagIndexesToRemove, tag, subsection;
		// Sort the tags before we begin.
		var workingTags = inTags.splice(0).sort();
		for (var groupIdx = 0; groupIdx < groupingHeaders.length; groupIdx++) {
			// For each grouping, determine the grouping header, display name, prefixes and build
			// a set of matching tags.
			header = groupingHeaders[groupIdx];
			displayName = "_Tags.Groupings.Headers.DisplayName.%@".fmt(groupIdx+1).loc();
			prefixes = "_Tags.Groupings.Headers.Patterns.%@".fmt(groupIdx+1).loc().split(',');
			tags = new Array();
			// Determine which tags belong to this grouping, flagging any tags we have processed
			// for removal from the tag list. So we can support Unicode, prefixes are tested
			// against an equal length substring of each tag.
			tagIndexesToRemove = new Array();
			for (var tagIdx = 0; tagIdx < workingTags.length; tagIdx++) {
				for (var prefixIdx = 0; prefixIdx < prefixes.length; prefixIdx++) {
					prefix = prefixes[prefixIdx];
					tag = workingTags[tagIdx];
					subsection = tag.substring(prefix.length, 0);
					if (subsection == prefix) {
						tags.push(tag);
						tagIndexesToRemove.push(tagIdx);
					}
				}
			}
			tags = tags.sort(alphabeticalSort);
			groupingData.push([header, displayName, prefixes, tags]);
			// Remove any tags we've successfully processed.
			for (var removeIdx = tagIndexesToRemove.length - 1; removeIdx >= 0; removeIdx--) {
				workingTags.splice(tagIndexesToRemove[removeIdx], 1);
			}
		}
		// Any tags left over are uncategorized.
		groupingData.push(['*', "_Tags.Groupings.Header.Other".loc(), [], workingTags]);
		return groupingData;
	},
	// Renders an array of grouped tags.
	renderGroupedTags: function(inGroupings) {
		if (!inGroupings || inGroupings.length == 0) return false;
		var groupingsElement = this.$().down('.groupings');
		if (!groupingsElement) return false;
		// Flush any existing groupings.
		groupingsElement.innerHTML = "";
		// For every grouping that has tags, render a group.
		var grouping, groupingElement;
		for (var groupingIdx = 0; groupingIdx < inGroupings.length; groupingIdx++) {
			grouping = inGroupings[groupingIdx];
			if (grouping && grouping[3] && grouping[3].length > 0) {
				groupingElement = this.renderGrouping(grouping[3], grouping[0], grouping[1]);
				groupingsElement.appendChild(groupingElement);
			}
		}
		// Collapse any heavily-populated tag groups.
		this.collapseHeavilyPopulatedGroups();
		
	},
	// Renders an individual tag group.
	renderGrouping: function(inTags, inGroupIdentifer, inGroupDisplayName) {	
		
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_TAGS_COLLECTION);
			
		var elem = Builder.node('div', {'role': 'navigation', 'aria-label': "_Accessibility.Navigation.TagWithLetter".loc() + ' ' + (inGroupDisplayName || inGroupIdentifer), className: 'cc-tag-group', name: 'tag-group-%@'.fmt(inGroupIdentifer)}, [
			Builder.node('h2', {'tabindex': '-1'}, (inGroupDisplayName || inGroupIdentifer)),
			Builder.node('span', {className: 'show more'}, "_Tags.Show.More".loc(inTags.length)),
			Builder.node('span', {className: 'show less'}, "_Tags.Show.Less".loc()),
			Builder.node('ul', inTags.collect(function(tag) {
				var tagURL = '%@/find?tags=%@'.fmt(env().root_path, encodeURIComponent(tag));
				return Builder.node('li', {className: 'cc-tag', 'data-name': tag, 'data-url': tagURL}, Builder.node('div', {className:'tags-container'}, [
					Builder.node('a', {className: 'button delete', href:'#'}, "_Tags.Delete".loc()),
					Builder.node('a', {'tabindex': tabIndex, 'role': 'link', className: 'tag', href: '#'}, tag)
				]));
			}))
		]);
		Event.observe(elem.down('span.more'), 'click', this.handleShowMoreClicked);
		Event.observe(elem.down('span.less'), 'click', this.handleShowLessClicked);
		var tags = elem.select('.cc-tag a.tag');
		for (var tagIdx = 0; tagIdx < tags.length; tagIdx++) {
			Element.observe(tags[tagIdx], 'click', this.handleTagClicked);
		}
		var buttons = elem.select('a.button.delete');
		for (var buttonIdx = 0; buttonIdx < buttons.length; buttonIdx++) {
			Event.observe(buttons[buttonIdx], 'click', this.handleTagDeleteClicked);
		}
		return elem;
	},
	// Collapses any heavily populated tag groups.
	collapseHeavilyPopulatedGroups: function() {
		var groupings = this.$().select('.cc-tag-group');
		var grouping, groupingHeight;
		for (var groupingIdx = 0; groupingIdx < groupings.length; groupingIdx++) {
			grouping = groupings[groupingIdx];
			if (grouping.getHeight() > this.mMaximumCollapsedGroupHeight) grouping.addClassName('expandable');
		}
	},
	// Hides tag groups with no tags.
	hideEmptyGroups: function() {
		var groupings = this.$().select('.cc-tag-group');
		var allGroupsEmpty = true;
		for (var groupingIdx = 0; groupingIdx < groupings.length; groupingIdx++) {
			var grouping = groupings[groupingIdx];
			if (grouping.down('.cc-tag') == undefined) {
				grouping.addClassName('empty')
			} else {
				allGroupsEmpty = false;
			}
		}
		if (allGroupsEmpty) this.mParentElement.addClassName('empty');
	},
	handleEditPencilClicked: function(inEvent) {
		this.$().addClassName('editing');
		this.mEditing = true;
	},
	handleDoneButtonClicked: function(inEvent) {
		this.$().removeClassName('editing');
		this.mEditing = false;
	},
	handleShowMoreClicked: function(inEvent) {
		var grouping = inEvent.findElement('.cc-tag-group');
		if (grouping && grouping.hasClassName('expandable')) grouping.addClassName('expanded');
	},
	handleShowLessClicked: function(inEvent) {
		var grouping = inEvent.findElement('.cc-tag-group');
		if (grouping) grouping.removeClassName('expanded');
	},
	// Handles a click event on the delete button for an individual tag.
	handleTagDeleteClicked: function(inEvent) {
		if (!this.mEditing) return true;
		if ($('tags_page_delete_dialog')) Element.remove('tags_page_delete_dialog');
		var tag = inEvent.findElement('.cc-tag');
		var tagName = tag.getDataAttributes()['name'];
		dialogManager().drawDialog('tags_page_delete_dialog', ["_Tags.Dialogs.Delete.Description".loc(tagName)], "_Tags.Dialogs.Delete.OK".loc(), null, "_Tags.Dialogs.Delete.Header".loc());
		dialogManager().show('tags_page_delete_dialog', null, this.handleDeleteTagOK.bindAsEventListener(this, tag));
	},
	handleDeleteTagOK: function(inEvent, inOptTagElement) {
		if (!inOptTagElement) return true;
		var callback = function() {
			dialogManager().hide();
			smokey().showOverElement(inOptTagElement);
			Element.remove(inOptTagElement);
			this.hideEmptyGroups();
		}.bind(this);
		var errback = function() {
			dialogManager().hide();
			notifier().printErrorMessage("_Tags.Dialogs.Delete.Error".loc());
		}.bind(this);
		dialogManager().showProgressMessage("_Tags.Dialogs.Delete.Progress".loc());
		var tagName = inOptTagElement.getDataAttributes()['name'];
		var scope = CC.meta('x-apple-owner-gui');
		if (scope) {
			this.mTagsService.deleteTagInContainer(tagName, scope, callback, errback);
		} else {
			this.mTagsService.globallyDeleteTag(tagName, callback, errback);
		}
	},
	// Handle a click event on a tag.
	handleTagClicked: function(inEvent) {
		if (!this.mEditing) {
			var tagElement = inEvent.findElement('.cc-tag');
			var attributes = tagElement.getDataAttributes();
			if (attributes['url']) window.location.href = attributes['url'];
			return true;
		}
		if ($('tags_page_edit_dialog')) Element.remove('tags_page_edit_dialog');
		var tag = inEvent.findElement('.cc-tag');
		var tagName = tag.getDataAttributes()['name'];
		dialogManager().drawDialog('tags_page_edit_dialog', [
			"_Tags.Dialogs.Edit.Description".loc(tagName),
			{label: "_Tags.Dialogs.Edit.Tag.Label".loc(), contents: Builder.node('input', {'type': "text", 'id': "tags_page_edit_dialog_tag_name", 'value': tagName})},
		], "_Tags.Dialogs.Edit.OK".loc(), null, "_Tags.Dialogs.Edit.Header".loc());
		dialogManager().show('tags_page_edit_dialog', null, this.handleEditTagOK.bindAsEventListener(this, tag));
	},
	handleEditTagOK: function(inEvent, inOptTagElement) {
		if (!inOptTagElement) return true;
		var callback = function() {
			window.location.reload();
		}.bind(this);
		var errback = function() {
			dialogManager().hide();
			notifier().printErrorMessage("_Tags.Dialogs.Edit.Error".loc());
		}.bind(this);
		dialogManager().showProgressMessage("_Tags.Dialogs.Edit.Progress".loc());
		var tagName = inOptTagElement.getDataAttributes()['name'];
		var newTagName = $F('tags_page_edit_dialog_tag_name');
		var scope = CC.meta('x-apple-owner-guid');
		if (scope) {
			this.mTagsService.replaceTagInContainer(tagName, newTagName, scope, callback, errback);
		} else {
			this.mTagsService.globallyReplaceTag(tagName, newTagName, callback, errback);
		}
	}
});
// Copyright (c) 2009-2015 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



// Namespace.

CC.WikiSetupAssistant = CC.WikiSetupAssistant || new Object();

// Shared instance.

var WikiSetupAssistant = Class.createWithSharedInstance('wikiSetupAssistant');
Object.extend(Object.extend(WikiSetupAssistant.prototype, CC.Keyboard.Mixins.Responder), {
		
	initialize: function()
	{
		this.placeholderName = "";
		// One mask per customer.
		this.mask = $(Builder.node('div', { id: "wiki_setup_mask" }));
		this.mask.on('click', this.onMaskClick.bindAsEventListener(this));
		this.mask.hide();
		document.body.appendChild(this.mask);
		this.renderDialog();
	},
	
	renderDialog: function(inCallback) {
		// Create the empty parent element.
		var existingDialog = $('wiki_setup');
		if (existingDialog) Element.remove(existingDialog);
		this.element = Builder.node('div', {id: 'wiki_setup', 'className': 'dialog', 'style': 'display: none;', 'role': 'dialog', 'aria-label': 'Wiki Assistant Dialog'}, [
			Builder.node('div', {className: 'dialog_contents'}, [
				Builder.node('form')
			])
		]);
		document.body.appendChild(this.element);
		var form = this.element.down('form');
		
		// Add each of the panel views we need, calling _render explicitly since this class isn't a CC.Mvc.View
		// instance and we can't use addSubview.
		this.panelSet = new CC.PanelSet();
		var namePanel = new CC.WikiSetupAssistant.NamePanel();
		form.appendChild(namePanel._render());
		this.panelSet.add(namePanel);
		var accessPanel = new CC.WikiSetupAssistant.AccessPanel();
		form.appendChild(accessPanel._render());
		this.panelSet.add(accessPanel);
		var appearancePanel = new CC.WikiSetupAssistant.AppearancePanel();
		form.appendChild(appearancePanel._render());
		this.panelSet.add(appearancePanel);
		var completePanel = new CC.WikiSetupAssistant.CompletePanel();
		form.appendChild(completePanel._render());
		this.panelSet.add(completePanel);
		
		// Register event handlers.
		bindEventListeners(this, [
			'onFormSubmit',
			'onCancelButtonClick',
			'onPrevButtonClick',
			'onNextButtonClick',
			'onDoneButtonClick',
			'onDismissButtonClick',
			'onGoToButtonClick',
			'onDocumentKeypress'
		]);
		this.onProvisionWikiSuccess = this.onProvisionWikiSuccess.bind(this);
		this.onProvisionWikiFailure = this.onProvisionWikiFailure.bind(this);
		Element.observe(form, 'submit', this.onFormSubmit);
		this.element.select('.button.cancel').invoke('observe', 'click', this.onCancelButtonClick);
		this.element.select('.button.prev').invoke('observe', 'click', this.onPrevButtonClick);
		this.element.select('.button.next').invoke('observe', 'click', this.onNextButtonClick);
		this.element.select('.button.done').invoke('observe', 'click', this.onDoneButtonClick);
		this.element.select('.button.goto').invoke('observe', 'click', this.onGoToButtonClick);
		
		if (inCallback) inCallback();
	},
	
	show: function() {
		accessibility().makeRootViewsAriaHidden(false);
		this.renderDialog(this._show.bind(this));
	},
	
	_show: function()
	{		
		this.becomeFirstResponder();
		
		window.scrollTo(0, 0);
		this.panelSet.first().select();
		
		this.mask.show();
		// display hidden so we can get the DOM dimensions
		this.element.setStyle({ visibility: 'hidden' });
		this.element.show();

		// center the dialog
		var offsetTop  = (window.innerHeight || document.documentElement.offsetHeight) - this.element.getHeight();
		var offsetLeft = this.element.getOffsetParent().getWidth() - this.element.getWidth();
		this.element.setStyle({
			top:  Math.max( offsetTop / 4,  0 ) + 'px',
			left: Math.max( offsetLeft / 2, 0 ) + 'px'
		});

		// hide and return visibility so we can animate...
		this.element.hide();
		this.element.setStyle({
			//position: MozillaFixes.isGecko ? 'fixed' : 'absolute',
			position: 'absolute',
			visibility: 'visible'
		});

		// now animate open...
		new Effect.Appear(this.element, { duration:0.3, afterFinish: function() {
			
			var wikiNameInput = $('wiki_setup_name');
			if (wikiNameInput && this.placeholderName) {
				wikiNameInput.value = this.placeholderName;
				this.element.down('.panel.name').down('.button.next').enable();
			}
			wikiNameInput.activate();
		}.bind(this)});
		
		document.observe('keypress', this.onDocumentKeypress);
	},
	hide: function()
	{
		document.stopObserving('keypress', this.onDocumentKeypress);
		this.mask.hide();
		this.element.hide();
		this.loseFirstResponder();
		accessibility().makeRootViewsAriaVisible(false);
	},
	
	onFormSubmit: function(e)
	{
		e.stop();
	},
	// panel button handlers
	onCancelButtonClick: function(e)
	{
		e.stop();
		// clear out any url cruft sent by server admin...
		var l = window.location;
		var hash = l.hash.gsub(/#create/, '');
		var search = l.search.gsub(/[?&]shortName=[^&]+/, '').gsub(/[?&]displayName=[^&]+/, '');
		if ((l.hash != hash) || (l.search != search)) {
			l.href = l.pathname + search;
		}
		// close the dialog
		this.hide();
	},
	onPrevButtonClick: function(e)
	{
		e.stop();
		this.panelSet.previous().select();
	},
	onNextButtonClick: function(e)
	{
		e.stop();
		this.panelSet.next().select();
	},
	onDoneButtonClick: function(e)
	{
		e.stop();
		this.provisionWiki();
	},
	onDismissButtonClick: function(e)
	{
		e.stop();
		this.hide();
	},
	onGoToButtonClick: function(e)
	{
		e.stop();
		if (this.project && this.project.tinyID) {
			var url = CC.entityURLForTypeAndTinyID('com.apple.entity.Wiki', this.project.tinyID, this.project.longName);
			this.hide();
			window.location = url;
		}
	},
	onDocumentKeypress: function(e)
	{
		if (e.keyCode == Event.KEY_ESC) {
			var btn = this.panelSet.selected().$().down('.button.cancel');
			if (btn) {
				btn.click();
			} else {
				this.onDismissButtonClick(e); // dismiss button was removed
			}
		}
		if (e.keyCode == Event.KEY_RETURN) {
			var accessPanel = this.panelSet.itemAtIndex(1); 
			if (accessPanel.isSelected() && accessPanel.inputHasFocus()) {
				// #8488980 don't trigger default button if the user is assigning ACLs
			} else {
				var button = this.panelSet.selected().$().down('.button[default="default"]');
				if (button && button.click) {
					button.click();
				} else if (this.panelSet.selected().$().hasClassName('complete')) {
					this.onGoToButtonClick(e);
				}
			}
		}
	},
	onMaskClick: function(e) {
		e.stop();
	},
	
	enableAllButtons: function() {
		this.panelSet.all().each(function(panel) {
			panel.$().select('.controls .button').invoke('enable');
		});
	},
	disableAllButtons: function() {
		this.panelSet.all().each(function(panel) {
			panel.$().select('.controls .button').invoke('disable');
		});
	},
	
	provisionWiki: function() {
		// Disable the panel to prevent duplicate submissions
		this.disableAllButtons();
		// Fetch the name, description, theme and avatar from the setup panels.
		var options = {
			'longName': $F('wiki_setup_name'),
			'description': $F('wiki_setup_description'),
			'isNotificationChecked': $('settings_send_notification').checked
		};
		if ($('settings_theme_name')) {
			var themeName = $F('settings_theme_name');
			if (themeName != 'blue') options['themeInfo'] = themeName + ',,';
			var avatar_guid = this.panelSet.itemAtIndex(2).avatar_editor.file_guid;
			if (avatar_guid) options['avatarGUID'] = avatar_guid;
		}
		// Serialize the acls to use for the new project.
		var acls = this.panelSet.itemAtIndex(1).editor.serialize(true);
		// Create the project.
		server_proxy().createProjectWithOptionsAndACLs(options, acls, this.onProvisionWikiSuccess.bind(this), this.onProvisionWikiFailure.bind(this))
	},
	onProvisionWikiSuccess: function(entity) {
		this.enableAllButtons();
		this.project = entity;
		// set the wikiname and select the confirmation panel
		var panel = this.panelSet.itemAtIndex(3);
		panel.$().down('.confirmation span').update((entity.longName || '').escapeHTML());
		panel.select();
		globalNotificationCenter().publish('WIKI_SETUP_ASSISTANT_DID_CREATE_WIKI');
	},
	onProvisionWikiFailure: function() {
		this.enableAllButtons();
		notifier().printErrorMessage("_WikiSetupAssistant.ProvisionWiki.Failure".loc());
	},
	handleKeyboardNotification: function(inMessage, inObject, inOptExtras) {
		if (inMessage == CC.Keyboard.NOTIFICATION_DID_KEYBOARD_ESC) {
			this.onCancelButtonClick(inOptExtras.event);
		}
		return true;
	}

});

/* This class auto-opens the wiki setup assistant if we're at the list of wikis and there's a #createWiki hash */

var WikiSetupAssistantOpener = Class.createWithSharedInstance('wikiSetupAssistantOpener', true);
WikiSetupAssistantOpener.prototype = {
	initialize: function()
	{
		var userLoggedIn = (CC.meta('x-apple-user-logged-in') == "true");
		var userCanCreateProjects = (CC.meta('x-apple-user-can-create-projects') == "true");
		var hashMatch = window.location.hash.match(/^#*createWikiNamed=(.+)$/);
		if (!hashMatch) return invalidate;
		
		// If the user is not logged in and they can't create projects, force them to log in.
		if (!userLoggedIn && !userCanCreateProjects) {
			var currentURL = window.location;
			window.location.href = "/auth?send_token=no&redirect=" + currentURL;
			return;
		}
		
		// If the user is logged in but they still can't create projects, show an alert.
		if (userLoggedIn && !userCanCreateProjects) {
			alert("_Dialogs.CreateWikiNamed.NotAllowed".loc());
			return;
		}
		
		var sharedInstance = wikiSetupAssistant();
		sharedInstance.placeholderName = decodeURI(hashMatch[1]);
		sharedInstance.show();
	}
};

CC.WikiSetupAssistant.NamePanel = Class.create(CC.PanelView, {
	render: function($super) {
		var elem = Builder.node('div', {className: 'panel name'});
		var html = "<h3 class=\"title\">%@<span>%@</span></h3><div class=\"content\"><div class=\"section selected\"><div class=\"field\"><label for=\"wiki_setup_name\">%@</label><input type=\"text\" value=\"\" id=\"wiki_setup_name\" name=\"wiki_setup_name\" /></div><div class=\"field\"><label for=\"wiki_setup_description\">%@</label><textarea id=\"wiki_setup_description\" name=\"wiki_setup_description\"></textarea></div></div></div><div class=\"controls\"><input class=\"button cancel\" type=\"button\" value=\"%@\" /><span><input class=\"button next\" type=\"button\" value=\"%@\" default=\"default\" /></span></div>";
		elem.innerHTML = html.fmt("_WikiSetupAssistant.Name.Header".loc(), "_WikiSetupAssistant.Name.HeaderSteps".loc(), "_WikiSetupAssistant.Name.TitleLabel".loc(), "_WikiSetupAssistant.Name.DescriptionLabel".loc(), "_WikiSetupAssistant.Button.Cancel".loc(), "_WikiSetupAssistant.Button.Next".loc());
		this.onNameKeypress = this.onNameKeypress.bindAsEventListener(this);
		this.onDescriptionKeypress = this.onDescriptionKeypress.bindAsEventListener(this);
		this.name = elem.down('#wiki_setup_name');
		this.name.autocorrect = 'off';
		this.name.on('keyup', this.onNameKeypress);
		this.name.on('change', this.onNameKeypress);
		this.description = elem.down('#wiki_setup_description');
		this.description.on('keypress', this.onDescriptionKeypress);
		this.button = elem.down('.button.next');
		this.button.disable();
		return elem;
	},
	onNameKeypress: function(e) {
		var value = this.name.value;
		(value && (value.strip() == '')) ? this.button.disable() : this.button.enable();
	},
	onDescriptionKeypress: function(e) {
		// prevent enter key from triggering the next panel
		e.stopPropagation();
	}
});

CC.WikiSetupAssistant.AccessPanel = Class.create(CC.PanelView, {
	render: function($super) {
		var elem = Builder.node('div', {className: 'panel access'});
		var html = "<h3 class=\"title\">%@<span>%@</span></h3><div class=\"content\"><div class=\"section selected\"><div class=\"field\"><label for=\"wiki_setup_access\">%@</label><div class=\"cc-access-editor-view\"></div></div></div></div><div class=\"controls\"><input class=\"button cancel\" type=\"button\" value=\"%@\" /><span><input class=\"button prev\" type=\"button\" value=\"%@\" /><input class=\"button next\" type=\"button\" value=\"%@\" default=\"default\" /></span></div>";
		elem.innerHTML = html.fmt("_WikiSetupAssistant.Access.Header".loc(), "_WikiSetupAssistant.Access.HeaderSteps".loc(), "_WikiSetupAssistant.Access.PermissionsLabel".loc(), "_WikiSetupAssistant.Button.Cancel".loc(), "_WikiSetupAssistant.Button.Previous".loc(), "_WikiSetupAssistant.Button.Next".loc());
		var default_acls = [{
			userExternalID: CC.meta('x-apple-user-externalID'),
			userLogin: CC.meta('x-apple-username'),
			userLongName: CC.meta('x-apple-user-longName'),
			allow: true,
			action: 'own'
		}];
		var acls_element = elem.down('.cc-access-editor-view');
		if (acls_element) {
			this.editor = new CC.AccessEditorView(default_acls, false); 
			this.editor._render();
			acls_element.appendChild(this.editor.$());
			this.editor.textfield.on('focus', this.onInputFocus.bindAsEventListener(this));
			this.editor.textfield.on('blur', this.onInputBlur.bindAsEventListener(this));
		}
		return elem;
	},
	onInputFocus: function(e) {
		this._input_focused = true;
	},
	onInputBlur: function(e) {
		this._input_focused = false;
	},
	inputHasFocus: function() {
		return this._input_focused;
	},
	hide: function($super) {
		// Hide autocompletion list if it is up.
		if (this.editor && this.editor.resultList) {
			this.editor.resultList.hide();
		}
		$super();
	}
});

CC.WikiSetupAssistant.AppearancePanel = Class.create(CC.PanelView, {
	render: function($super) {
		var elem = Builder.node('div', {className: 'panel appearance'});
		var html = "<h3 class=\"title\">%@<span>%@</span></h3><div class=\"content\"><div class=\"section selected\"><div class=\"field\"><label for=\"wiki_setup_avatar\">%@</label><div id=\"wiki_setup_avatar\"></div></div><div class=\"field\"><label for=\"wiki_setup_color_scheme\">%@</label><div id=\"wiki_setup_color_scheme\"></div></div></div></div><div class=\"controls\"><input class=\"button cancel\" type=\"button\" value=\"%@\" /><span><input class=\"button prev\" type=\"button\" value=\"%@\" /><input class=\"button done\" type=\"button\" value=\"%@\" default=\"default\" /></span></div>";
		elem.innerHTML = html.fmt("_WikiSetupAssistant.Appearance.Header".loc(), "_WikiSetupAssistant.Appearance.HeaderSteps".loc(), "_Settings.Avatar.Projects.Label".loc(), "_WikiSetupAssistant.Appearance.SchemeLabel".loc(), "_WikiSetupAssistant.Button.Cancel".loc(), "_WikiSetupAssistant.Button.Previous".loc(), "_WikiSetupAssistant.Button.Create".loc());
		elem.down('#wiki_setup_avatar').appendChild(new CC.AvatarEditorView('projects')._render());
		var avatar_element = elem.down('.cc-avatar-editor');
		if (avatar_element) {
			this.avatar_editor = new CC.AvatarEditor(avatar_element, null, true);
		}
		elem.down('#wiki_setup_color_scheme').appendChild(new CC.ThemeChooserView()._render());
		var swatchesElement = elem.down('.theme_swatches');
		if (swatchesElement) {
			swatchesElement.removeClassName('input');
			var swatches = elem.select('.theme_swatch');
			swatches[0].addClassName('selected');
			for (var i = 0; i < swatches.length; i++) {
				swatches[i].on('click', this.changeColor.bind(this, swatches[i]));
			}
		}
		return elem;	
	},
	changeColor: function(el) {
		var newTheme = el.getAttribute('data-color');
		$('settings_theme_name').value = newTheme;
		var swatches = this.$().getElementsByClassName('theme_swatch');
		for (var i = 0; i < swatches.length; i++) {
			swatches[i].removeClassName('selected');
		}
		el.addClassName('selected');
	}
});

CC.WikiSetupAssistant.CompletePanel = Class.create(CC.PanelView, {
	render: function($super) {
		var elem = Builder.node('div', {className: 'panel complete'});
		var html = "<h3 class=\"title\">%@</h3><div class=\"content\"><div class=\"section selected\"><div class=\"confirmation\">%@</div></div></div><div class=\"controls\"><center><input class=\"button goto\" id=\"goto_wiki_btn\" type=\"button\" value=\"%@\" /></center></div>";
		elem.innerHTML = html.fmt("_WikiSetupAssistant.Complete.Header".loc(), "_WikiSetupAssistant.Complete.Confirmation".loc(), "_WikiSetupAssistant.Button.Go".loc());
		return elem;
	}
});
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












var sharedBannerView;

CC.WikiMainView = Class.create(CC.MainView, {
	getBackgroundImageURL: function() {
		var themeTuple = CC.themeTupleFromMetaTag('container');
		if (themeTuple[2]) {
			return "/wiki/files/download/%@".fmt(themeTuple[2]);
		} else {
			var themeTupleOwner = CC.themeTupleFromMetaTag('owner');
			if (themeTupleOwner[2])
				return "/wiki/files/download/%@".fmt(themeTupleOwner[2]);			
		}		
	}
});

CC.WikiHeaderView = Class.create(CC.HeaderView, {
	mBreadcrumbItems: [],
	mTopLevelMenuItems: [
		new CC.MenuItems.Edit(),
		new CC.MenuItems.Download(),
		new CC.MenuItems.PlusMenu(),
		new CC.MenuItems.GearMenu(),
		new CC.MenuItems.Login(),
		new CC.MenuItems.Logout()
	],
	mTopLevelPlusMenuIndex: 2,
	mTopLevelGearMenuIndex: 3,
	mPlusMenuItems: [
		new CC.MenuItems.NewPrivatePage(),
		new CC.MenuItems.NewPrivateFile(),
		new CC.MenuItems.NewPrivateBlogpost(),
		new CC.MenuItems.NewProjectPage(),
		new CC.MenuItems.NewProjectFile(),
		new CC.MenuItems.NewProjectBlogpost(),
		new CC.MenuItems.NewProject()
	],
	mGearMenuItems: [
		new CC.MenuItems.AssignToProject(),
		new CC.MenuItems.BulkApproveComments(),
		new CC.MenuItems.Delete(),
		new CC.MenuItems.Hide(),
		new CC.MenuItems.ProjectSettings(),
		new CC.MenuItems.UpdateFile(),
		new CC.MenuItems.UserSettings(),
		new CC.MenuItems.About(),
		new CC.MenuItems.Help.Wiki()
	],
	render: function($super) {
		var header = $super();
		var li = document.createElement('li');
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_SEARCH);
		li.appendChild(Builder.node('input', {id: 'search', value: '', title: "_QuickSearch.Placeholder".loc(), 'autocapitalize': 'off', tabindex: tabIndex}));
		li.appendChild(Builder.node('span', {className: 'searchfield_close_overlay'}));
		header.down('ul.actions').appendChild(li);
		this.mQuickSearchMenu = new CC.QuickSearch.QuickSearchMenu(header.down('input'));
		return header;
	}
});

CC.WikiBannerView = Class.create(CC.BannerView, {
	mBannerLinkItems: [
		new CC.BannerItems.Home(),
		new CC.BannerItems.Activity(),
		new CC.BannerItems.Documents(),
		new CC.BannerItems.Tags(),
		new CC.BannerItems.Calendar(),
		new CC.BannerItems.Blog()
	],
	getBannerImageURL: function() {
		var themeTuple = CC.themeTupleFromMetaTag('owner');
		if (themeTuple[1]) {
			return "/wiki/files/download/%@".fmt(themeTuple[1]);
		} else {
			var themeTupleOwner = CC.themeTupleFromMetaTag('container');
			if (themeTupleOwner[1])
				return "/wiki/files/download/%@".fmt(themeTupleOwner[1]);			
		}
	},
	getIconImageURL: function() {
		var avatarGUID = CC.meta('x-apple-owner-avatarGUID');
		if (avatarGUID) return '/wiki/files/download/' + avatarGUID;
	},
	getIconImageExtraClassNames: function() {
		var ownerType = CC.meta('x-apple-owner-type');
		if (ownerType) return ownerType.split('.').last().toLowerCase();
	}
});

CC.CoreClientWikiApplication = Class.create(CC.Application, {
	mApplicationIdentifier: "wiki",
	createApplication: function($super) {
		// 11330226
		if (browser().isiPad() && browser().isiOS5Plus()) {
			var routeFromURL = CC.getRouteFromURL();
			if (!routeFromURL || routeFromURL.match(/^\/*$/)) {
				routeFromURL = "/wiki";
			}
			window.location.href = "/wiki/ipad/#route=%@".fmt(routeFromURL);
			return;
		}
		$super();
		// Add a header to the root view, since we'll always need one.
		sharedHeaderView = new CC.WikiHeaderView();
		rootView.addSubview(sharedHeaderView);
		// Build the nav global popover.
		var navigationItems = [];
		var currentUserLoggedIn = (CC.meta('x-apple-user-logged-in') == "true");
		var currentUserLogin = CC.meta('x-apple-username');
		if (currentUserLoggedIn) {
			navigationItems.push(["/wiki/people/%@/activity".fmt(currentUserLogin), "my_activity", "_Sources.MyActivity.Title", "_Sources.MyActivity.Description"]);
			navigationItems.push(["/wiki/people/%@/documents".fmt(currentUserLogin), "my_documents", "_Sources.MyDocuments.Title", "_Sources.MyDocuments.Description"]);
			navigationItems.push(["/wiki/find?favorites_only=true&sortKey=+longName&keyword=", "my_favorites", "_Sources.MyFavorites.Title", "_Sources.MyFavorites.Description"]);
		}
		if ((CC.meta("x-apple-config-DisableAllActivityView") != "true") && ((CC.meta("x-apple-username") != "unauthenticated"))) {
			navigationItems.push(["/wiki/activity", "activity", "_Sources.Activity.Title", "_Sources.Activity.Description"]);
		}
		if (CC.meta("x-apple-config-DisableAllProjectsView") != "true") {
			navigationItems.push(["/wiki/projects", "projects", "_Sources.Projects.Title", "_Sources.Projects.Description"]);
		}
		if ((CC.meta("x-apple-config-DisableAllPeopleView") != "true") && ((CC.meta("x-apple-username") != "unauthenticated"))) {
			navigationItems.push(["/wiki/people", "people", "_Sources.People.Title", "_Sources.People.Description"]);
		}
		sharedNavPopover = new CC.NavPopover(navigationItems, CC.NAV_POPOVER_DEFAULT_APPLICATION_WIKI_IDENTIFIER);
		// Create a scrollable main content view we can use.
		mainView = new CC.WikiMainView();
		rootView.addSubview(mainView);
		// Add a banner to the main view.
		sharedBannerView = new CC.WikiBannerView();
		mainView.addSubview(sharedBannerView, '#content', true);
		// Route the initial request.
		this.routeInitialRequestAfterRender();
	},
	computeRoutes: function() {
		return [
			[CC.Routes.WIKI_CONTAINER_TINYID_TITLE_ROUTE, containerTabRoute],
			[CC.Routes.WIKI_CONTAINER_TINYID_ROUTE, containerTabRoute],
			[CC.Routes.WIKI_CONTAINER_TINYID_BLOG_ROUTE, containerTabRoute],
			[CC.Routes.WIKI_CONTAINER_TINYID_TAGS_ROUTE, containerTabRoute],
			[CC.Routes.WIKI_CONTAINER_TINYID_FAVORITES_ROUTE, containerTabRoute],
			[CC.Routes.WIKI_CONTAINER_TINYID_DOCUMENTS_ROUTE, containerTabRoute],
			[CC.Routes.WIKI_CONTAINER_TINYID_ACTIVITY_ROUTE, containerTabRoute],
			[CC.Routes.WIKI_SEARCH_ROUTE, searchRoute],
			[CC.Routes.WIKI_FILES_TINYID_TITLE_ROUTE, fileRoute],
			[CC.Routes.WIKI_FILES_TINYID_ROUTE, fileRoute],
			[CC.Routes.WIKI_PAGES_TINYID_TITLE_ROUTE, pageRoute],
			[CC.Routes.WIKI_PAGES_TINYID_ROUTE, pageRoute],
			[CC.Routes.WIKI_TAGS_ROUTE, allTagsRoute],
			[CC.Routes.WIKI_PEOPLE_ROUTE, allPeopleRoute],
			[CC.Routes.WIKI_PROJECTS_ROUTE, allProjectsRoute],
			[CC.Routes.WIKI_ACTIVITY_ROUTE, allActivityRoute],
			[CC.Routes.WIKI_HOMEPAGE_ROUTE, homepageRoute],
			[CC.Routes.SLASH_ROUTE, homepageRoute]
		];
	}
});

new CC.CoreClientWikiApplication();

