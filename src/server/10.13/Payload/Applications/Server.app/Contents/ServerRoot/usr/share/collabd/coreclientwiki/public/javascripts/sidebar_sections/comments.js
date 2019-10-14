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

//= require "./paginating_sidebar_section.js"
//= require "./comments/comment_manager.js"

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
