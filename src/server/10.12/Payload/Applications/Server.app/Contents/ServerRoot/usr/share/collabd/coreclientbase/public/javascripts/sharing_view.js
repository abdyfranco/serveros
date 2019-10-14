// Copyright (c) 2012-2014 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

//= require "./core.js"
//= require "./server_proxy.js"
//= require "./mvc/mvc.js"

// ACL Editor view.

CC.DocumentSharingView = Class.create(CC.Mvc.View, {
	mAccessEditor: null,
	mACLs: [],
	mSharingListElement: null,
	mWidgetElement: null,
	mStashedCurrentUser: null,
	initialize: function($super, acls, entityGUID) {
		$super();
		this.mACLs = acls;
		this.mEntityGUID = entityGUID;
	},
	_buildSharingElement: function(anACL) {
		var accessString = "_Access.Role." + anACL['action'];
		var aclElement = Builder.node('li', {className:'cc-sharing-item'}, [
			Builder.node('span', {className:'icon'}),
			Builder.node('span', {className:'username'}, anACL.userLongName || anACL.userLogin),
			Builder.node('span', {className:'access'}, accessString.loc())
		]);
		
		return aclElement;
	},
	_buildSharingList: function() {
		// build list of people shared with
		var sharingItemElements = this._sharingItemsToShow().collect(function(anACL) {
			return this._buildSharingElement(anACL);
		}.bind(this));
		
		return sharingItemElements;
	},
	_sharingItemsToShow: function() {
		var sharingItems = [];
		for (i = 0; i < this.mACLs.length; i++) {
			var anACL = this.mACLs[i];
			if (anACL.action != 'none' && anACL.allow != 'false') {
				if (this.mStashedCurrentUser && this.mStashedCurrentUser.externalID != anACL.userExternalID) {
					sharingItems.push(anACL);
				}
			}
		}
		return sharingItems;
	},
	showOrHideEmptyMessage: function() {
		var placeholder = this.mWidgetElement.down('.cc-sharing-empty-message');
		if (placeholder)
			(this._sharingItemsToShow().length > 0) ? placeholder.hide() : placeholder.show();
	},
	render: function() {
		var tagItemSharing = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_SHARING);
		// build the label and edit button
		var editButton = Builder.node('a', {'tabindex': tagItemSharing, 'role': 'button', className:'cc-sidebar-rounded-button'}, "_Sharing.Sidebar.Edit".loc());
		Event.observe(editButton, 'click', this.edit.bind(this));
		var headerElement = Builder.node('div', {className:'cc-sharing-header'}, [
			Builder.node('span', {'tabindex': '-1', className:'label'}, "_Sharing.Sidebar.SharingWith".loc()),
			editButton
		]);
		
		// build the access editor
		this.mAccessEditor = new CC.AccessEditorView(this.mACLs, false, this.mEntityGUID);
		this.mAccessEditor._render();
		
		// build the whole thing
		this.mWidgetElement = Builder.node('div', {className:'cc-sharing-view'}, [
			headerElement,
			Builder.node('h2', {className:'cc-sharing-empty-message placeholder', style:'display:none'}, "_Sharing.Sidebar.EmptyPlaceholder".loc()),
			Builder.node('div', {className:'cc-sharing-dialog', style:'display:none'})
		]);
		
		// We require the current user actually rendering the sharing list, so fetch it before
		// drawing. In most cases this call will come back immediately. We cache it here to avoid
		// wrapping all our drawing code in asynchronous user calls.
		sessions().currentUserAsynchronously(function(currentUser) {
			this.mStashedCurrentUser = currentUser;
			this.redrawSharingList();
		}.bind(this));
		
		return this.mWidgetElement;
	},
	redrawSharingList: function() {
		if (this.mSharingListElement) this.mSharingListElement.remove();
		this.mSharingListElement = Builder.node('ul', {className:'cc-sharing-items'}, this._buildSharingList());
		this.mWidgetElement.appendChild(this.mSharingListElement);
		this.showOrHideEmptyMessage();
	},
	onSharingDialogOkButtonClick: function() {
		// mACLs is only used for refreshing the UI. It is not sent out to the server when invoking save()
		this.mACLs = this.mAccessEditor.validItems();				
		this.mAccessEditor.save(this.redrawSharingList.bind(this));
	},
	edit: function(inEvent) {
		if (!$('sharing_dialog')) {
			dialogManager().drawDialog('sharing_dialog', [
				""
			], "_Dialogs.OK".loc(), false, "_SharingDialog.Title".loc(), "_Dialogs.Cancel".loc());
			var editor_element = this.mAccessEditor.$();
			editor_element.show();
			$("sharing_dialog").down(".dialog_description").insert(editor_element);
		}
		dialogManager().show('sharing_dialog', null, this.onSharingDialogOkButtonClick.bind(this));
	}
});