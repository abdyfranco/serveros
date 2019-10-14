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

CC.MenuItems.Edit = Class.create(CC.MenuItem, {
	mDisplayTitle: "_MenuItem.Edit".loc(),
	mClassName: 'edit',
	itemShouldDisplay: function() {
		return (CC.meta('x-apple-user-can-write') == "true" && CC.meta('x-apple-entity-type') == 'com.apple.entity.Page');
	},
	action: function(inEvent) {
		Event.stop(inEvent);
		globalEditorController().toggleEditMode(true);
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_EDIT);
	}
});
