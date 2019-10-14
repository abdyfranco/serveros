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
