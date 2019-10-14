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

CC.MenuItems.BulkApproveComments = Class.create(CC.MenuItem, {
	mDisplayTitle: "_ActionMenu.BulkApproveComments.Title".loc(),
	itemShouldDisplay: function() {
		var adminOrOwner = (CC.meta('x-apple-user-is-admin') == "true" || CC.meta('x-apple-user-is-owner') == "true");
		return (adminOrOwner && (CC.metaAsArray('x-apple-owner-unapproved-comment-guids').length > 0 || CC.metaAsArray('x-apple-entity-unapproved-comment-guids').length > 0));
	},
	action: function(inEvent) {
		var dialog = $('bulk_approve_comments_dialog');
		if (dialog) Element.remove(dialog);
		var locPrefix = '';
		var isDetailPage = CC.meta('x-apple-entity-isDetailPage');

		if (isDetailPage) {
			// If this is a wiki main page
			if (isDetailPage == "true") {
				locPrefix = ".Wiki";
			}
			else if (isDetailPage == "false") {
				locPrefix = ".Page";
			}
		}
		var locString = "_BulkApproveComments.Confirm.Dialog.Description%@".fmt(locPrefix);

		var fields = [locString.loc()];
		dialogManager().drawDialog('bulk_approve_comments_dialog', fields, "_BulkApproveComments.OK".loc(), false, "_BulkApproveComments.Confirm.Dialog.Title".loc());
		dialogManager().show('bulk_approve_comments_dialog', null, this.onApproveConfirm.bind(this));
	},
	onApproveConfirm: function(inEvent) {
		dialogManager().showProgressMessage("_BulkApproveComments.Progress.Approving".loc());
		var isDetailPage = CC.meta('x-apple-entity-isDetailPage');
		var commentGUIDs = [];

		if (isDetailPage) {
			// If this is a wiki main page
			if (isDetailPage == "true") {
				commentGUIDs = CC.metaAsArray('x-apple-owner-unapproved-comment-guids');
			}
			else if (isDetailPage == "false") {
				commentGUIDs = CC.metaAsArray('x-apple-entity-unapproved-comment-guids');
			}

			server_proxy().approveCommentsWithGUIDs(commentGUIDs, this.onApproveSuccess.bind(this), this.onApproveFailure.bind(this));
		}
	},
	onApproveSuccess: function(inResponse) {
		dialogManager().hide();
		window.location.reload();
	},
	onApproveFailure: function(inResponse) {
		dialogManager().hide();
		notifier().printErrorMessage("_BulkApproveComments.Progress.Failed".loc());
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_APPROVE);
	}	
});
