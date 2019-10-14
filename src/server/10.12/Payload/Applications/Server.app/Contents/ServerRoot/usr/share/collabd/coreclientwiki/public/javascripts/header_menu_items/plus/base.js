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
