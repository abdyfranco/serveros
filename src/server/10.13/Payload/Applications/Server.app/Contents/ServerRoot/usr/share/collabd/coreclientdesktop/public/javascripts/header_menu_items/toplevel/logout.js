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

CC.MenuItems.Logout = Class.create(CC.MenuItem, {
	mDisplayTitle: "_MenuItem.LogOut".loc(),
	mClassName: 'logout',
	itemShouldDisplay: function() {
		return (CC.meta('x-apple-user-logged-in') == "true");
	},
	buildElement: function($super) {
		var loggedInUsername = CC.meta('x-apple-username');
		this.mTooltip = "_Login.LoggedInUser".loc(loggedInUsername);
		return $super();
	},
	action: function(e) {
		// Confirm the user really wants to log out.
		if ($('logout_confirm_dialog')) Element.remove('logout_confirm_dialog');
		dialogManager().drawDialog('logout_confirm_dialog', ["_Logout.Confirm.Dialog.Description".loc()], "_Logout.Confirm.Dialog.OK".loc(), null, "_Logout.Confirm.Dialog.Title".loc());
		// Show the delete block dialog.
		dialogManager().show('logout_confirm_dialog', null, function() {
			authenticator().logout();
		}.bind(this), undefined, false, undefined, false);
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_LOGOUT);
	}
});
