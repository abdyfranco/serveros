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

//= require "./base.js"

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
