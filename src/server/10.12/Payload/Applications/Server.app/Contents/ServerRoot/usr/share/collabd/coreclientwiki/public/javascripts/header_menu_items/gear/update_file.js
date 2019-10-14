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

CC.MenuItems.UpdateFile = Class.create(CC.MenuItem, {
	mDisplayTitle: "_ActionMenu.Replace.File.Title".loc(),
	itemShouldDisplay: function() {
		var guid = CC.meta('x-apple-entity-guid');
		if (!guid) return false;
		var type = CC.meta('x-apple-entity-type');
		if (!type || type != 'com.apple.entity.File') return false;
		return (CC.meta('x-apple-user-is-admin') == 'true' || CC.meta('x-apple-user-is-owner') == 'true' || CC.meta('x-apple-user-can-write') == 'true');
	},
	action: function(e) {
		fileUploadManager().updateFile();
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_REPLACE);
	}
});
