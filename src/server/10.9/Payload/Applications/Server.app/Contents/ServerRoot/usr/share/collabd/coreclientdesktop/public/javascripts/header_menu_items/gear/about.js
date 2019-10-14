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

CC.MenuItems.About = Class.create(CC.MenuItem, {
	mDisplayTitle: "_ActionMenu.About.Title".loc(),
	action: function(e) {
		dialogManager().showProgressMessage("_Loading".loc());
		var batch = [
			['ServerVersionService', 'currentServerVersion'],
			['ServerVersionService', 'currentOperatingSystemVersion'],
			['ServerVersionService', 'currentXcodeVersion']
		];
		service_client().batchExecuteAsynchronously(batch, null, function(inBatchedResponse) {
			if (inBatchedResponse && inBatchedResponse.responses && inBatchedResponse.responses.length > 2) {
				var currentServerVersion = inBatchedResponse.responses[0].response;
				var currentOperatingSystemVersion = inBatchedResponse.responses[1].response;
				var currentXcodeVersion = inBatchedResponse.responses[2].response;
				var aboutString = "_Server.About.Dialog.Description.NoXcode".loc(currentServerVersion, currentOperatingSystemVersion);
				if (currentXcodeVersion) {
					aboutString = "_Server.About.Dialog.Description.Xcode".loc(currentServerVersion, currentOperatingSystemVersion, currentXcodeVersion);
				}
				dialogManager().hideProgressMessage();
				var dialog = $('server_about_dialog');
				if (dialog) Element.remove(dialog);
				dialogManager().drawDialog('server_about_dialog', [aboutString], "_Dialogs.OK".loc(), null, "_Server.About.Dialog.Title".loc());
				$('server_about_dialog_cancel').hide();
				dialogManager().show('server_about_dialog', null, null);
			}
		}, function() {
			dialogManager().hideProgressMessage();
			notifier().printErrorMessage("_Load.Error.CouldNotLoadIngoFromServer".loc());
		});
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_ABOUT);
	}
});
