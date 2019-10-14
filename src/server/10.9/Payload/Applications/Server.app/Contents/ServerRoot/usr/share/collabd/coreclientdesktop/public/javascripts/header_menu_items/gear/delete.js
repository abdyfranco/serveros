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

CC.MenuItems.Delete = Class.create(CC.MenuItem, {
	mDisplayTitle: "_ActionMenu.Delete.Title".loc(),
	updateDisplayState: function($super) {
		var locPrefix = '';
		if (document.body.hasClassName('pages')) locPrefix = "Page.";
		if (document.body.hasClassName('projects')) locPrefix = "Project.";
		if (document.body.hasClassName('files')) locPrefix = "File.";
		if (document.body.hasClassName('pages') && CC.meta('x-apple-entity-isBlogpost') == "true") locPrefix = "Blog.";
		this.mElement.down('a').update("_ActionMenu.Delete.%@Title".fmt(locPrefix).loc());
		$super();
	},
	itemShouldDisplay: function() {
		var ownerType = CC.meta('x-apple-owner-type');
		var entity = CC.meta('x-apple-entity-type');
	
		// Prevents current user from deleting someone else's profile page
		var currentGUID = CC.meta('x-apple-user-guid'); 	
		var createdByGUID = CC.meta('x-apple-createdByUser-guid');		
		if (!createdByGUID) createdByGUID = CC.meta('x-apple-owner-guid'); // if createdByUser-guid is there then look for owner-guid
		 
		var isOwned = (createdByGUID == currentGUID);
		var isPageOwnedByUser = (((ownerType == 'com.apple.entity.User') && (entity == 'com.apple.entity.Page')) && isOwned);
	
		var supportedEntity = (ownerType == 'com.apple.entity.Page' 
			|| ownerType == 'com.apple.entity.Wiki' 
			|| ownerType == 'com.apple.entity.File' 
			|| ownerType == 'com.apple.entity.Blog'
			|| isPageOwnedByUser);
		
		return (supportedEntity && (CC.meta('x-apple-user-can-delete') == 'true') && (CC.meta('x-apple-entity-tinyID') != "serverhome"));
	},
	action: function(e) {
		var dialog = $('delete_entity_dialog');
		if (dialog) Element.remove(dialog);
		var locPrefix = '';
		if (document.body.hasClassName('pages')) locPrefix = "Page.";
		if (document.body.hasClassName('projects')) locPrefix = "Project.";
		if (document.body.hasClassName('files')) locPrefix = "File.";
		if (document.body.hasClassName('pages') && CC.meta('x-apple-entity-isBlogpost') == "true") locPrefix = "Blog.";
		var fields = ["_Dialogs.Delete.%@Description".fmt(locPrefix).loc()];
		var canDeletePermanently = CC.meta('x-apple-user-is-admin') == "true";
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_DELETE_PAGE);
		if (canDeletePermanently) {
			fields.push({contents:'<label tabindex="-1" for="delete_entity_dialog_permanent_delete"><input tabindex="' + tabIndex + '" role="checkbox" id="delete_entity_dialog_permanent_delete" type="checkbox" />' + "_Dialogs.Delete.Permanently".loc() +'</label>'});
		}
		dialogManager().drawDialog('delete_entity_dialog', fields, "_Dialogs.Delete.OK".loc(), false, "_Dialogs.Delete.%@Title".fmt(locPrefix).loc());
		dialogManager().show('delete_entity_dialog', null, this.onDeleteConfirm.bind(this));		

		if (dialog) {
			var firstAction = dialog.querySelector('input[type="submit"]');
			if(firstAction) 
				firstAction.focus();
		}
	},
	onDeleteConfirm: function() {
		var permanentlyDeleteCheckbox = $('delete_entity_dialog_permanent_delete');
		var canPermanentlyDelete = false;
		if (permanentlyDeleteCheckbox) canPermanentlyDelete = $F('delete_entity_dialog_permanent_delete');
		var detailPage = CC.meta('x-apple-entity-isDetailPage');
		var entityGUID = CC.meta('x-apple-entity-guid');
		if (detailPage == "true") entityGUID = CC.meta('x-apple-owner-guid');
		server_proxy().deleteEntityWithGUID(entityGUID, canPermanentlyDelete, this.onDeleteSuccess.bind(this), this.onDeleteFailure.bind(this));
	},
	onDeleteSuccess: function(response) {
		var url = env().root_path;
		var parentTinyID = CC.meta('x-apple-owner-tinyID');
		var parentType = CC.meta('x-apple-owner-type');
		if (parentType == 'com.apple.entity.User' && parentTinyID) {
		    url = "#{prefix}/people/#{tinyID}".interpolate({
				prefix: env().root_path,
				tinyID: parentTinyID
			});
		}
		else if (parentType == 'com.apple.entity.Wiki') {
			if (CC.meta('x-apple-entity-isDetailPage') == "true") {
				url += '/projects';
				url = url.replace(/\/{2,}/, '/');
			} else {
				url = "#{prefix}/projects/#{tinyID}".interpolate({
					prefix: env().root_path,
					tinyID: parentTinyID
				});
			}
		}
		window.location.href = url;
	},
	onDeleteFailure: function(response) {
		var owner_type = CC.meta('x-apple-owner-type');
		var errorString = "_Dialogs.Delete.Notification.NotBotOwner.Error".loc();
		if (owner_type && owner_type == "com.apple.entity.Wiki") {
			errorString = "_Dialogs.Delete.Notification.NotProjectOwner.Error".loc();
		}
		notifier().printErrorMessage(errorString);
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_DELETE);
	}	
});
