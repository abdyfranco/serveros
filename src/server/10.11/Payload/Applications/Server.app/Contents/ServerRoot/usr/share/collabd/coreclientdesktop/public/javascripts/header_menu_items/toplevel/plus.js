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

//= require "../menu_items"

CC.MenuItems.PlusMenu = Class.create(CC.MenuItem, {
	mDisplayTitle: "Plus".loc(),
	mClassName: 'add',
	action: function(e) {
		// Show the plus menu attached to the shared header view.
		sharedHeaderView.mPlusMenu.toggle();
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_PLUS);
	}
});
