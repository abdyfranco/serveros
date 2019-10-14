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
