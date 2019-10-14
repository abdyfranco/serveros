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

//= require "./sidebar_section.js"

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
