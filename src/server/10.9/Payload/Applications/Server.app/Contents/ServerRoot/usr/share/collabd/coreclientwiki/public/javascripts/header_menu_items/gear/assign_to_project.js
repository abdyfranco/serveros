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

CC.MenuItems.AssignToProject = Class.create(CC.MenuItem, {
	mDisplayTitle: "_ActionMenu.AssignToProject.Title".loc(),
	initialize: function($super) {
		$super();
		this.mAssignToProjectDialog = new LinkSearchDialog({
			mDialogTitle: "_ActionMenu.AssignToProject.Dialog.Title",
			mSearchFieldPlaceholder: "_ActionMenu.AssignToProject.Dialog.Search.Placeholder",
			mDialogDescription: "_ActionMenu.AssignToProject.Dialog.Description",
			mEntityTypes: ['com.apple.entity.Wiki']
		});
	},
	itemShouldDisplay: function() {
		var isLoggedIn = CC.meta('x-apple-user-logged-in') == "true";
		if (isLoggedIn) {
			var entity_type = CC.meta('x-apple-entity-type');
			var pageOrFile = ((entity_type == "com.apple.entity.Page") || (entity_type == "com.apple.entity.File"));
			var detailPage = CC.meta('x-apple-entity-isDetailPage') == "true";
			var canWrite = CC.meta('x-apple-user-can-write') == "true";
			return (!document.body.hasClassName('toplevel') && pageOrFile && !detailPage && canWrite);
		}
		else {
			return false;
		}
		
		
	},
	action: function(e) {
		var anchor = Event.findElement(e, 'a');
		this.mAssignToProjectDialog.show(anchor, null, this.onDialogOk.bind(this));
	},
	onDialogOk: function(inURL, inLinkText) {
		// If nothing was selected in the dialog, just return.
		if (!inURL || !inLinkText) return;
		// Otherwise, get the suggested list item.
		var suggested = $('link_search_dialog').down('.suggested');
		if (!suggested) return;
		// Get the project GUID, name and URL from the dialog selection.
		this.mProjectGUID = suggested.getAttribute('id').match(/link_search_dialog_results_(.+)/)[1];
		this.mProjectName = inLinkText;
		this.mProjectURL = inURL;
		dialogManager().showProgressMessage("_ActionMenu.AssignToProject.Waiting".loc(this.mProjectName));
		server_proxy().moveEntityToOwner(CC.meta('x-apple-entity-guid'), this.mProjectGUID, this.onDialogOkSuccess.bind(this), this.onDialogOkFailure.bind(this))
	},
	onDialogOkSuccess: function(response) {
		dialogManager().hideProgressMessage();
		window.location.reload();
	},
	onDialogOkFailure: function(response) {
		dialogManager().hide();
		notifier().printErrorMessage("_ActionMenu.AssignToProject.Failure".loc());
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_MOVE);
	}
});
