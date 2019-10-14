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

CC.MenuItems.Hide = Class.create(CC.MenuItem, {
	mDisplayTitle: "", // Deliberately empty since this is updated dynamically.
	updateDisplayState: function($super) {
		var locAction = "Hide";
		if (CC.meta("x-apple-entity-isHidden") == 'true') locAction = "Unhide";
		this.mElement.down('a').update("_ActionMenu.%@.Person.Title".fmt(locAction).loc());
		$super();
	},
	itemShouldDisplay: function() {
		var guid = CC.meta('x-apple-entity-guid');
		if (!guid) return false;
		return ((CC.meta('x-apple-entity-type') == 'com.apple.entity.User') && (CC.meta('x-apple-user-is-admin') == 'true'));
	},
	action: function(e) {
		var dialog = $('delete_entity_dialog');
		if (dialog) Element.remove(dialog);
		var locAction = "Hide";
		if (CC.meta("x-apple-entity-isHidden") == 'true') locAction = "Unhide";
		var fields = ["_Dialogs.%@.Person.Description".fmt(locAction).loc()];
		var entityType = CC.meta('x-apple-entity-type');
		dialogManager().drawDialog('hide_entity_dialog', fields, "_Dialogs.%@.OK".fmt(locAction).loc(), false, "_Dialogs.%@.Person.Title".fmt(locAction).loc());
		dialogManager().show('hide_entity_dialog', null, this.onHideConfirm.bind(this));
	},
	onHideConfirm: function() {
		var method = server_proxy().hideUserWithGUID;
		if (CC.meta("x-apple-entity-isHidden") == 'true') {
			method = server_proxy().unhideUserWithGUID;
		}
		// now call whichever one we need to
		method(CC.meta('x-apple-entity-guid'), this.onSuccess.bind(this), this.onFailure.bind(this));
	},
	onSuccess: function(response) {
		window.location.reload();
	},
	onFailure: function(response) {
		notifier().printErrorMessage("_Dialogs.Hide.Notification.Error".loc());
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_HIDE);
	}
});
