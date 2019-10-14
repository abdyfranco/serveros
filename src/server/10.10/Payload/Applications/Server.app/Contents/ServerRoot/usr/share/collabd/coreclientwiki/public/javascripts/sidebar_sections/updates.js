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
