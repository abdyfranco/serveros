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

// Shared desktop route helpers.

CC.RouteHelpers = CC.RouteHelpers || new Object();

// Entity type to body class name map.

CC.RouteHelpers.mapEntityTypeToBodyClassName = function(inType) {
	switch (inType) {
		case 'com.apple.entity.Wiki':
			return 'projects';
		case 'com.apple.entity.User':
			return 'people';
		default:
			return '';
	}
};

// Sets the browser title.

CC.RouteHelpers.setBrowserWindowTitle = function(inTitle) {
	var title = (inTitle || "_OSXServer".loc());
	document.title = title;
};

CC.RouteHelpers.setBodyClassName = function(inClassName, inOptShouldSet) {
	if (!inClassName) return;
	var shouldSet = (inOptShouldSet == undefined ? true : inOptShouldSet);
	if (shouldSet) {
		document.body.addClassName(inClassName);
	} else {
		document.body.removeClassName(inClassName);
	}
};

CC.RouteHelpers.setTopLevelClassNames = function(inOptShouldSet) {
	CC.RouteHelpers.setBodyClassName('toplevel', inOptShouldSet);
};

CC.RouteHelpers.setContentPrimaryFullWidth = function(inOptShouldSet, inOptShouldAnimate) {
	var shouldSet = (inOptShouldSet == undefined ? true : inOptShouldSet);
	CC.RouteHelpers.setContentSecondaryVisible(!shouldSet, inOptShouldAnimate);
	var contentPrimary = mainView.$().down('div#content-primary');
	if (shouldSet) {
		contentPrimary.addClassName('full-width');
	} else {
		contentPrimary.removeClassName('full-width');
	}
};

CC.RouteHelpers.setContentSecondaryVisible = function(inOptShouldBeVisible, inOptShouldAnimate) {
	var contentElement = mainView.$().down('div#content');
	if (!inOptShouldAnimate) contentElement.removeClassName('animates');
	if (inOptShouldBeVisible == undefined || inOptShouldBeVisible) {
		contentElement.removeClassName('no-secondary');
	} else {
		contentElement.addClassName('no-secondary');
	}
	setTimeout(function() {
		if (!inOptShouldAnimate) contentElement.addClassName('animates');
	}, 600);
};

// Updates the display state for the shared main view, header and banner.

CC.RouteHelpers.updateSharedDisplayState = function() {
	mainView.updateDisplayState();
	sharedHeaderView.updateDisplayStateForMenuItems();
	sharedBannerView.updateDisplayState();
};

// Updates the banner for the current container.

CC.RouteHelpers.updateBannerForOwnerOrContainer = function(inOptUseContainerInstead) {
	sharedBannerView.setVisible(true);
	sharedBannerView.setIsTopLevel(false);
	var metaSubstring = 'owner';
	if (inOptUseContainerInstead) metaSubstring = 'container';
	var title = (CC.meta('x-apple-%@-longName'.fmt(metaSubstring)) || CC.meta('x-apple-%@-shortName'.fmt(metaSubstring)));
	var type = CC.meta('x-apple-%@-type'.fmt(metaSubstring));
	var tinyID = CC.meta('x-apple-%@-tinyID'.fmt(metaSubstring));
	var url = CC.entityURLForTypeAndTinyID(type, tinyID, title);
	sharedBannerView.setTitle(title, url);
};

// Sets the selected banner link item by identifer (mBannerLinkGUID).

CC.RouteHelpers.setSelectedBannerLinkByGUID = function(inBannerLinkGUID) {
	// Fetch the current banner links.
	var bannerLinks = (sharedBannerView.mBannerLinkItems || []), bannerLink, bannerLinkGUID;
	for (bdx = 0; bdx < bannerLinks.length; bdx++) {
		bannerLink = bannerLinks[bdx];
		bannerLinkGUID = bannerLink.mBannerLinkGUID;
		bannerLink.markAsSelected(inBannerLinkGUID == bannerLinkGUID);
	}
};

// Returns an array of breadcrumb nar items for an owner/container including a leading type breadcrumb, e.g. people.

CC.RouteHelpers.breadcrumbBarItemsForOwnerOrContainer = function(inOptUseContainerInstead) {
	var metaSubstring = 'owner';
	if (inOptUseContainerInstead) metaSubstring = 'container';
	var title = (CC.meta('x-apple-%@-longName'.fmt(metaSubstring)) || CC.meta('x-apple-%@-shortName'.fmt(metaSubstring)));
	var type = CC.meta('x-apple-%@-type'.fmt(metaSubstring));
	var tinyID = CC.meta('x-apple-%@-tinyID'.fmt(metaSubstring));
	var url = CC.entityURLForTypeAndTinyID(type, tinyID, title);
	var crumbs = [];
	if (type == 'com.apple.entity.Wiki') {
		crumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': "_General.Wikis".loc(), 'mURL': '/wiki/projects'}));
	} else if (type == 'com.apple.entity.User') {
		crumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': "_General.People".loc(), 'mURL': '/wiki/people'}));
	}
	crumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': title, 'mURL': url}));
	return crumbs;
};

// Updates the header bar breadcrumb trail.

CC.RouteHelpers.updateBreadcrumbBarForEntityAndOwner = function() {
	var entityIsBlogPost = (CC.meta('x-apple-entity-isBlogpost') == "true");
	var newCrumbs = CC.RouteHelpers.breadcrumbBarItemsForOwnerOrContainer(entityIsBlogPost);
	// If the entity is a blog post, we need one more level of indirection and a blog item.
	if (entityIsBlogPost) {
		var containerType = CC.meta('x-apple-container-type');
		var containerTinyID = CC.meta('x-apple-container-tinyID');
		var containerURL = CC.entityURLForTypeAndTinyID(containerType, containerTinyID);
		newCrumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': "_Blog.Default.Title".loc(), 'mURL': "%@/blog".fmt(containerURL)}));
	}
	// If the entity is not a detail page, push a breadcrumb.
	if (CC.meta('x-apple-entity-isDetailPage') != "true") {
		var entityTitle = (CC.meta('x-apple-entity-longName') || CC.meta('x-apple-entity-shortName'));
		var entityType = CC.meta('x-apple-entity-type');
		var entityTinyID = CC.meta('x-apple-entity-tinyID');
		var entityURL = CC.entityURLForTypeAndTinyID(entityType, entityTinyID, entityTitle);
		newCrumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': entityTitle, 'mURL': entityURL}));
	}
	sharedHeaderView.setBreadcrumbItems(newCrumbs);
};

// Helpers for detecting if features are enabled/disabled.

CC.RouteHelpers.wikiEnabled = function() {
	return (CC.meta("x-apple-service-wiki-enabled") == "true");
};

CC.RouteHelpers.webauthEnabled = function() {
	return (CC.meta("x-apple-service-webauth-enabled") == "true");
};

CC.RouteHelpers.webcalEnabled = function() {
	var nonSSLCalendarWebAppLoaded = (CC.meta("x-apple-service-webcal-enabled") == "true");
	var sslCalendarWebAppLoaded = (CC.meta("x-apple-service-webcalssl-enabled") == "true");
	return (nonSSLCalendarWebAppLoaded || sslCalendarWebAppLoaded);
};

// Webcal may be enabled, but restricted to the SSL site.

CC.RouteHelpers.webcalEnabledForCurrentProtocol = function() {
	var nonSSLCalendarWebAppLoaded = (CC.meta("x-apple-service-webcal-enabled") == "true");
	var sslCalendarWebAppLoaded = (CC.meta("x-apple-service-webcalssl-enabled") == "true");
	var isSecure = (window.location.protocol == "https:");
	// Calendar is enabled if non-SSL calendar is enabled, or non-SSL AND ssl calendar is enabled or only SSL is enabled and the
	// user is accessing the Web UI over the https scheme.
	if (!isSecure) {
		if (nonSSLCalendarWebAppLoaded) return true;
		if (nonSSLCalendarWebAppLoaded && sslCalendarWebAppLoaded) return true;
	} else {
		if (sslCalendarWebAppLoaded) return true;
	}
	return false;
};

CC.RouteHelpers.changePasswordEnabled = function() {
	return (CC.meta("x-apple-service-changepassword-enabled") == "true");
};

// Helpers for UI that can be disabled in the collabd.plist.

CC.RouteHelpers.allActivityEnabled = function() {
	if (CC.meta("x-apple-config-DisableAllActivityView") == "true")
		return false;
	return true;
};

CC.RouteHelpers.peopleEnabled = function() {
	if (CC.meta("x-apple-config-DisableAllPeopleView") == "true")
		return false;
	return true;
};

CC.RouteHelpers.projectsEnabled = function() {
	if (CC.meta("x-apple-config-DisableAllProjectsView") == "true")
		return false;
	return true;
};

// Updates the browser title for the current entity and owner.

CC.RouteHelpers.setBrowserWindowTitleForEntityAndOwner = function() {
	var titleFormatString = "%@ - %@";
	var ownerTitle = (CC.meta('x-apple-owner-longName') || CC.meta('x-apple-owner-shortName'));
	var entityTitle = (CC.meta('x-apple-entity-longName') || CC.meta('x-apple-entity-shortName'));
	var title = titleFormatString.fmt(ownerTitle, entityTitle);
	CC.RouteHelpers.setBrowserWindowTitle(title);
};
