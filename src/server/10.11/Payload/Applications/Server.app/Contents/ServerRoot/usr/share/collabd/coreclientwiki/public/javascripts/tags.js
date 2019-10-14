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
