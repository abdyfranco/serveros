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

CC.MenuItems.ProjectSettings = Class.create(CC.MenuItem, {
	mDisplayTitle: "_ActionMenu.Project.Settings.Title".loc(),
	itemShouldDisplay: function() {
		var project = ((CC.meta('x-apple-owner-type') == "com.apple.entity.Wiki") || (CC.meta('x-apple-owner-type') == "com.apple.entity.Wiki"));
		return (project && (CC.meta('x-apple-user-is-owner') == "true" || CC.meta('x-apple-user-is-admin') == "true"));
	},
	action: function(e) {
		var projectGUID;
		if (CC.meta('x-apple-owner-type') == "com.apple.entity.Wiki") {
			projectGUID = CC.meta('x-apple-owner-guid');
		} else {
			projectGUID = CC.meta('x-apple-owner-guid');
		}
		settingsPanel().showForGUIDAndType(projectGUID, "com.apple.entity.Wiki");
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_WIKI_SETTINGS);
	}
});
