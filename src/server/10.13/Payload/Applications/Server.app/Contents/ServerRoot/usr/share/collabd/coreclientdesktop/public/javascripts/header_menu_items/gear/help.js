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

CC.MenuItems.Help = Class.create(CC.MenuItem, {
	mDisplayTitle: "_ActionMenu.Help.Title".loc(),
	mHelpLink: "",
	buildElement: function($super) {
		var elem = $super();
		var link = elem.down('a');
		link.target = '_blank';
		link.href = this.mHelpLink;
		return elem;
	},
	handleElementClicked: function(e) {
		// Override so we don't stop the event and break the link redirect.
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_HELP);
	}	
});

CC.MenuItems.Help.Wiki = Class.create(CC.MenuItems.Help, {
	mHelpLink: '_Help.Desktop.URL'.loc()
});

CC.MenuItems.Help.Xcs = Class.create(CC.MenuItems.Help, {
	mHelpLink: '_XC.Help.Desktop.URL'.loc()
});