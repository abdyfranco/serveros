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
