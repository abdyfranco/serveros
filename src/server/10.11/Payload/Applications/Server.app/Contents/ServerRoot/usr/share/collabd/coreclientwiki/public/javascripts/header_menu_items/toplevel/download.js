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

CC.MenuItems.Download = Class.create(CC.MenuItem, {
	mDisplayTitle: "_MenuItem.Download".loc(),
	mClassName: 'download',
	itemShouldDisplay: function() {
		return CC.meta('x-apple-entity-type') == 'com.apple.entity.File';
	},
	action: function(e) {
		window.location.href = "/wiki/files/download/" + CC.meta('x-apple-entity-guid');
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_DOWNLOAD);
	}	
});
