// Copyright (c) 2009-2015 Apple Inc. All Rights Reserved.
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

// Create a namespace.

CC.AccessEditor = CC.AccessEditor || new Object();

CC.AccessEditor.DefaultAllUsersACL = {
	userExternalID:'unauthenticated',
	userLogin:'unauthenticated',
	userLongName:"_Access.User.unauthenticated".loc(),
	action:'none',
	allow: true
};

CC.AccessEditor.DefaultLoggedInUsersACL = {
	userExternalID:'authenticated',
	userLogin:'authenticated',
	userLongName:"_Access.User.authenticated".loc(),
	action:'none',
	allow: true
};

CC.AccessEditor.ACCESS_EDITOR_VIEW_LIST_DID_CHANGE = 'NOTIFICATION_ACCESS_EDITOR_VIEW_LIST_DID_CHANGE';

// ACL Editor view.

CC.AccessEditorView = Class.create(CC.Mvc.View, {
	// The original set of acl items we were passed when this view was initialized.
	mPassedACLItems: [],
	// A computed set of acl items being used to render (after we exclude duplicates and include the logged in user etc).
	mACLItems: [],
	// Prevents from spamming the permission list when edit permission
	// Unlike mACLItems, mNewPermissionList only contains the new permission used for sending 'share document' notifications 
	mNewPermissionList: [],	
	mAllUsers: null,
	mLoggedInUsers: null,
	mEntityGUID: null,
	mShowMe: false,
	dirty: false,
	mStashedCurrentUser: null,
	initialize: function($super, aclItems, mShowMe, inOptEntityGuid, inOptDefaultAllUsersACL, inOptDefaultLoggedInUsersACL) {
		$super();
		this.mPassedACLItems = aclItems;
		this.mAllUsers = (inOptDefaultAllUsersACL || CC.deepClone(CC.AccessEditor.DefaultAllUsersACL));
		this.mLoggedInUsers = (inOptDefaultLoggedInUsersACL || CC.deepClone(CC.AccessEditor.DefaultLoggedInUsersACL));
		this.mEntityGUID = inOptEntityGuid;
		this.mShowMe = mShowMe;
		this.dirty = false;
	},
	_itemIsPublic: function(anItem) {
		return (anItem['userLogin'] == 'unauthenticated' || anItem['userLogin'] == 'authenticated');
	}, 
	_itemIsMe: function(anItem) {
		var currentUser = this.mStashedCurrentUser;
		return (currentUser && (anItem['userExternalID'] == currentUser.externalID));
	},
	_rolesForItem: function(inItem) {
		if (this._itemIsPublic(inItem)) {
			return ['write', 'read', "none"];
		}
		return ['own', 'write', 'read'];
	},
	_itemAlreadyPresent: function(inItem) {
		return this._itemForLogin(inItem.userLogin) != null;
	},
	_itemForLogin:function(inLogin) {
		for (var i = 0; i < this.mACLItems.length; i++) {
			if (this.mACLItems[i].userLogin == inLogin) {
				return this.mACLItems[i];
			}
		}
		return null;
	},
	_update: function(inDirty) {
		// this will go through and clean up anything that needs to get cleaned up
		if (inDirty) this.dirty = true;
		var unauthedElement = this.mAllUsers.element.down('.permissions select')
		var unauthedRole = unauthedElement.value;
		var authedElement = this.mLoggedInUsers.element.down('.permissions select')
		var authedRole = authedElement.value;
		// authed can't be less than unauthed
		if (unauthedRole == "read") {
			if (authedRole == "none") {
				// set auth to read
				authedElement.setValue('read');
			}
		}
		if (unauthedRole == "write") {
			if (authedRole == "none" || authedRole == "read") {
				// set authed role to write
				authedElement.setValue("write");
			}
		}
		// publish a notification since the UI might need to be refreshed
		if (this.dirty) {
			globalNotificationCenter().publish(CC.AccessEditor.ACCESS_EDITOR_VIEW_LIST_DID_CHANGE, this);
		}
	},
	_buildAccessItemView: function(inItem) {
		// fix longname if it is empty
		if (!inItem.userLongName) {
			inItem.userLongName = inItem.userLogin;
		}
		var meAcl = this._itemIsMe(inItem);
		var removeClass = "remove";
		if (this._itemIsPublic(inItem) || meAcl) {
			removeClass = "remove disabled";
		}
		var removeButton = Builder.node('a', {className:removeClass, href:'#', userlogin:inItem.userLogin, title:"_Access.Remove".loc()}, "_Access.Remove".loc());
		Event.observe(removeButton, 'click', this.remove.bind(this));
		
		// Helping QA running automation script...
		// Separating names for "Access Role" between desktop and ipad version
		var popupUIName;
		if (browser().isMobileSafari()) 
			popupUIName = inItem.userLongName + "_Control.AccessRole.Popup".loc();
		else
			popupUIName = inItem.userLongName;
		
		var tabIndexName = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS_ACCESS);		
		var token = Builder.node('span', {className: 'token'}, [
			removeButton,
			Builder.node('span', {'tabindex': tabIndexName, 'aria-label': inItem['userLongName'], className:'label', title:inItem['userLongName'] + " (" + inItem['userLogin'] + ")"}, inItem['userLongName']),
		]);
		var accessSelect = Builder.node('select', {'tabindex': tabIndexName, 'role': 'listbox', 'aria-label': popupUIName, 'name': popupUIName, userlogin:inItem.userLogin}, this._rolesForItem(inItem).collect(function(aRole) {
			var accessString = "_Access.Role." + aRole;
			return Builder.node('option', {'role': 'option', value: aRole}, accessString.loc());
		}));
		// Setting selected programatically on the node rather than declaratively in Builder.node to workaround a weird bug in FF. 12236806.
		accessSelect.setValue(inItem['action']);
		if (meAcl) accessSelect.setAttribute('disabled', true);
		Event.observe(accessSelect, 'change', this.handleAccessChanged.bind(this));
		var accessElement = Builder.node('span', {className:"permissions"}, accessSelect);
		var elem = Builder.node('li', {className: 'item'}, [ token, accessElement]);
		inItem.element = elem;
		if (meAcl && !this.mShowMe) elem.style.display = 'none';
		return elem;
	},
	render: function() {						
		// Rendering the access editor view requires the current user, so draw what we can first
		// and fill in the rest in a callback. Start by building the auto-completing user search
		// field.		
		var tabIndexName = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS_NAME);				
		this.textfield = Builder.node('input', {'tabindex': tabIndexName, 'role': 'textbox', 'aria-label': "_Access.Autocomplete.Placeholder".loc(), 
												'type':"text", name:"", value:"", placeholder:"_Access.Autocomplete.Placeholder".loc()});													
		var randomID = "cc-menu-autocomplete-%@".fmt(buildRandomString(5));
		this.resultList = Builder.node('ul', {'id': randomID, 'className': 'cc-menu-autocomplete cc-access-editor-view-autocomplete-menu'});
		document.body.appendChild(this.resultList);
		this.resultList.hide();
		this.userSearchField = new UserSearchField(this.textfield, {
			mResultTable: this.resultList,
			mClickedItemCallback: this.handleClickedRecord.bind(this)
		});
		
		// Build email notification checkbox
		this.notificationCheckBox = Builder.node('div', {className: 'setting'}, 
										[Builder.node('div', {className: 'service', style: 'margin-top: 10px'}, [
											Builder.node('input', {disabled: 'disabled', role: 'checkbox', type: 'checkbox', name: 'settings_send_notification', id: 'settings_send_notification', value: "_Settings.Notification".loc()}), 
											Builder.node('span', {}, "_Settings.Notification".loc())]											
										)]);	
		
		// Build out a shell.
		var elem = Builder.node('div', {className: 'cc-access-editor-view loading'}, [
			Builder.node('div', {className: 'field'}, this.textfield),
			Builder.node('div', {className:'items'}),			
			Builder.node('div', {className: 'setting'}, this.notificationCheckBox)
		]);
		
		// Grab the current user, and update the ACLs asynchrounously.  Do this after 500ms so the view
		// has time to render (bit of a hack).
		setTimeout(function() {
			sessions().currentUserAsynchronously(function(currentUser) {
				this.mStashedCurrentUser = currentUser;
				this.$().removeClassName('loading');
				this.redrawACLItems();
			}.bind(this));
		}.bind(this), 500);
		
		return elem;
	},
	redrawACLItems: function() {
		// First recompute the ACLs we will draw.
		this.mACLItems = new Array();
		this.mNewPermissionList = new Array();
		// Add an owner ACL entry for me.  We assume that if you can see the ACL settings, you own the item.
		var currentUser = this.mStashedCurrentUser;
		if (currentUser) {
			var meACL = {
				userExternalID: currentUser.externalID,
				userLogin: currentUser.login,
				userLongName: (currentUser.longName || currentUser.shortName),
				action: 'own',
				allow: true
			};
			this.mACLItems.push(meACL);
		}
		// Add acl entries for every acl in the array we were passed
		var aclItems = $A(this.mPassedACLItems).reverse(); // reverse the aclItems so the first version of the same acl will overwrite the second
		for (var i = 0; i < aclItems.length; i++) {
			var anItem = aclItems[i];
			if (anItem.userExternalID == 'unauthenticated') {
				this.mAllUsers['action'] = anItem['action'];
				this.mAllUsers.allow = anItem.allow;
			} else if (anItem.userExternalID == 'authenticated') {
				this.mLoggedInUsers['action'] = anItem['action'];
				this.mLoggedInUsers.allow = anItem.allow;
			} else if (anItem.userExternalID == '*'){
				// special user that is a cons of allUsers and allLoggedInUsers
				this.mLoggedInUsers['action'] = anItem['action'];
				this.mLoggedInUsers.allow = anItem.allow;
				this.mAllUsers['action'] = anItem['action'];
				this.mAllUsers.allow = anItem.allow;
			} else if (currentUser && (anItem.userExternalID == currentUser.externalID)) {
				if (!this.mShowMe) continue; // don't add me twice
			} else {
				if (!this._itemAlreadyPresent(anItem)) { // my algorithms professor would slap me for this
					this.mACLItems.push(anItem);
				}
			}
		}
		// Add the public acl items
		this.mACLItems.push(this.mLoggedInUsers);
		this.mACLItems.push(this.mAllUsers);
		// Build out the UI.
		var recordListElements = []
		for (var i = 0; i < this.mACLItems.length; i++) {
			var anItem = this.mACLItems[i];
			if (this._itemIsPublic(anItem)) continue;
			recordListElements.push(this._buildAccessItemView(anItem));
		}
		var publicRecordsElements = [
			this._buildAccessItemView(this.mLoggedInUsers),
			this._buildAccessItemView(this.mAllUsers)
		];
		this.recordList = Builder.node('ul', {className: 'cc-acl-list', 'aria-label': "_Accessibility.Added.All".loc()}, recordListElements);
		this.publicRecordList = Builder.node('ul', {className: 'cc-acl-list', 'aria-label': "_Accessibility.Acls.All".loc()}, publicRecordsElements);
		var fragment = document.createDocumentFragment();
		fragment.appendChild(this.recordList);
		fragment.appendChild(this.publicRecordList);
		var itemsElement = this.$().down('div.items');
		itemsElement.update();
		itemsElement.appendChild(fragment);
		this._update(false);
	},
	remove: function(inEvent) {
		var elem = inEvent.element();
		var item = this._itemForLogin(elem.getAttribute('userlogin')); 
		if (item) {
			this.mACLItems = this.mACLItems.without(item);
			this.mNewPermissionList = this.mNewPermissionList.without(item);
			smokey().showOverElement(item.element);
			item.element.remove();
			item = null;
		}
		
		if (this.mNewPermissionList.length == 0) {
			$('settings_send_notification').checked = false;	
			$('settings_send_notification').disabled = true;			
		} else {
			$('settings_send_notification').disabled = false;
		}
		
		this._update(true);
	},
	handleAccessChanged: function(inEvent) {
		// if it was authed that changed, then check that unauthed isn't better
		if (inEvent.element().getAttribute('userlogin') == "authenticated") {
			var unauthedElement = this.mAllUsers.element.down('.permissions select')
			var unauthedRole = unauthedElement.value;
			var authedElement = this.mLoggedInUsers.element.down('.permissions select')
			var authedRole = authedElement.value;
			if (authedRole == "none") {
				if (unauthedRole != "none") {
					unauthedElement.setValue("none");
				}
			}
			if (authedRole == "read") {
				if (unauthedRole != "none" && unauthedRole != "read") {
					unauthedElement.setValue("read");
				}
			}
		}
		// now that the UI elements agree, set the in memory attributes
		for (var i = 0; i < this.mACLItems.length; i++) {
			var anItem = this.mACLItems[i];
			// update action and allow...
			var selElement = anItem.element.down('.permissions select');
			anItem.action = selElement.value;
		}
		
		this._update(true);
	},
	handleClickedRecord: function(inUnusedDisplayString, inUnusedURL) {
		var dataSource = (this.userSearchField.mChosenDataSource || {});
		if (!dataSource.entityGUID)
			return; // empty click, or bad record, don't add it 
		var item = {
			action: "read",
			allow: "true",
			userExternalID: dataSource.entityGUID,
			userLogin: dataSource.entityUserLogin,
			userLongName: dataSource.entityUserLongName
		};
		this.textfield.value = '';
		if (this._itemAlreadyPresent(item)) return; // don't add something more than once
		this.mACLItems.push(item);
		this.mNewPermissionList.push(item);
		this.recordList.appendChild(this._buildAccessItemView(item));
		
		if (this.mNewPermissionList.length == 0) {
			$('settings_send_notification').checked = false;	
			$('settings_send_notification').disabled = true;			
		} else {
			$('settings_send_notification').disabled = false;
		}
		
		this._update(true);
	},
	validItems: function() {
		var val = [];
		for (var i = 0; i < this.mACLItems.length; i++) {
			var anItem = this.mACLItems[i];
			if (anItem.allow && (anItem.action != "none")) {
				val.push(anItem);
			}
		}
		return val;
	},
	validNewItems: function() {
		var val = [];
		for (var i = 0; i < this.mNewPermissionList.length; i++) {
			var anItem = this.mNewPermissionList[i];
			if (anItem.allow && (anItem.action != "none")) {
				val.push(anItem);
			}
		}
		return val;
	},	
	serialize: function(isUpdatedList) {
		// go through and only serialize special users if their allow is not none
		var val = [];
		// Valid entity acl fields (because validItems includes extra junk like DOM element pointers).
		var fields = 'allow action userExternalID userLogin userLongName'.w();
		
		// use the same function to serialize either the new updatedALCs List or the new sharedNotifications List
		// both are sent out to the server (setACLs)
		var currentList = [];
		if (isUpdatedList)
			currentList = this.validItems();
		else
			currentList = this.validNewItems();
					
		currentList.each(function(anItem) {	
			var newItem = {};
			for (var i = 0; i < fields.length; i++) {
				newItem[fields[i]] = anItem[fields[i]];
			}
			var acl = new CC.EntityTypes.EntityACL(newItem);
			val.push(acl);
		});
		return val;
	},
	save: function(isNotificationEnabled,inOptCallback, inOptErrback) {
		var callback = function() {
			this.onSaveSuccess();
			if (inOptCallback) inOptCallback();
		}.bind(this);
		var errback = function(response) {
			this.onSaveFailure();
			if (inOptErrback) inOptErrback(response);
		}.bind(this);
		
		// Updated list of ACLs that has to be sent to the server
		var updatedACLs = this.serialize(true);
		
		// New notification list (send email when document is shared to the related users only, not all the subscribed users!)
		var sharedNotifications = this.serialize(false);	
			
		if (updatedACLs.length > 0) {
			server_proxy().setACLsOnEntity(isNotificationEnabled, sharedNotifications, updatedACLs, this.mEntityGUID, callback, errback);
												
			// resets shared notifications list for the next permission edition
			this.mNewPermissionList = [];			
		}
	},
	onSaveSuccess: function(request) {
		this.dirty = false;
	},
	onSaveFailure: function(request) {
		notifier().printErrorMessage("_AccessEditor.SaveFailure".loc());
	}
});
