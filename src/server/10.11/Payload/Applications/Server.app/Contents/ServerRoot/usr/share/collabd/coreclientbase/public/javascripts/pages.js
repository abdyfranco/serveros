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

// Global pages controller. Handles creating new pages (and blog posts).

CC.PagesController = Class.createWithSharedInstance('globalPagesController');
CC.PagesController.prototype = {
	initialize: function() {},
	showNewPageDialog: function(inOptAnchor, inOptPageName, inOptOwnerGUID, inOptIsBlogpost, inOptCallback, inOptCancelCallback) {
		// Remove any existing new page dialogs.
		var existingDialog = $('new_page_dialog');
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_NEW_PAGE);
		if (existingDialog) Element.remove(existingDialog);
		// Draw the new page dialog.
		var pageOrBlogLocKey = (inOptIsBlogpost == true) ? "NewBlogpost" : "NewPage";
		dialogManager().drawDialog('new_page_dialog', [
			{label:'_Dialogs.%@.Label'.fmt(pageOrBlogLocKey).loc(), contents: '<input tabindex="' + tabIndex + '" role="textbox" type="text" id="new_page_dialog_title" maxlength="100"/>'},
		], "_Dialogs.%@.OK".fmt(pageOrBlogLocKey).loc(), undefined, "_Dialogs.%@.Title".fmt(pageOrBlogLocKey).loc());
		// Create a new page, and link to it.
		var callback = function() {
			dialogManager().showProgressMessage("_Dialogs.%@.Progress.Creating".fmt(pageOrBlogLocKey).loc());
			var options = {'longName': $('new_page_dialog_title').value || undefined};
			// Is the page a blog post?
			if (inOptIsBlogpost) options['isBlogpost'] = true;
			// Do we have an explicit owner?
			if (inOptOwnerGUID) options['ownerGUID'] = inOptOwnerGUID;
			// Create the page.
			var success = function(entity) {
				dialogManager().hide();
				if (entity && inOptCallback) {
					var url = CC.entityURL(entity, true);
					inOptCallback(url, (inOptPageName || entity.longName));
				}
			};
			var failure = function() {
				dialogManager().hide();
				notifier().printErrorMessage("_Dialogs.%@.Progress.Failed".fmt(pageOrBlogLocKey).loc());
			};
			server_proxy().createPageWithOptionsAndOptionalACLs(options, undefined, success, failure);
		}.bind(this);
		// Prepare the dialog.
		$('new_page_dialog_title').value = (inOptPageName || '').escapeHTML();
		// Show the dialog.
		dialogManager().show('new_page_dialog', inOptCancelCallback, callback, inOptAnchor, false, 'new_page_dialog_title', false);
		// Setting focus on input field by default.
		$('new_page_dialog_title').focus();
	}
};
