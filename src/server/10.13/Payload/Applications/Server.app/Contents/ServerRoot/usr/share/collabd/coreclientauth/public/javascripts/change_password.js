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

var ChangePasswordSharedInstance = Class.createWithSharedInstance('changePasswordSharedInstance', true);
ChangePasswordSharedInstance.prototype = {
	initialize: function() {
		this.mContainer = $('change_password');
		if (!this.mContainer) return invalidate;
		document.body.addClassName(globalLocalizationManager().getLprojLocale());
		bindEventListeners(this, [
			'handleSubmitButtonClicked',
			'handleCancelButtonClicked',
			'handleEditableElementChanged'
		]);
		this.render();
		this.mDirtySettings = false;
		// Set the browser title.
		document.title = "_ChangePassword.Title".loc();
		// Show all non-error notifications.
		notifier().mShowNotifications = true;
	},
	enableSaveButton: function() {
		$$('input.save').invoke('enable');
	},
	disableSaveButton: function() {
		$$('input.save').invoke('disable');
	},
	render: function() {
		if (this.mRendered) return;
		var rootElement = Builder.node('div', {'className': "cc-auth-dialog"});
		var templateHTML = "<div class=\"inner\"><h1>%@</h1><form accept-charset=\"UTF-8\" action=\"#\"><div style=\"margin: 0px; padding: 0px; display: inline;\"><p class=\"intro\">%@</p><div class=\"sections\"><div class=\"section\"><label for=\"old_password\">%@</label><input id=\"old_password\" name=\"old_password\" type=\"password\"></div><div class=\"section\"><label for=\"new_password\">%@</label><input id=\"new_password\" name=\"new_password\" type=\"password\"></div><div class=\"section\"><label for=\"confirmed_password\">%@</label><input id=\"confirmed_password\" name=\"confirmed_password\" type=\"password\"></div></div><p class=\"error incorrect\" style=\"display: none;\">%@</p><p class=\"error match\" style=\"display: none;\">%@</p><div class=\"buttons\"><input type=\"button\" class=\"cancel\" value=\"%@\" onclick=\"changePasswordSharedInstance().handleCancelButtonClicked(); return false;\"/><input type=\"submit\" class=\"submit\" value=\"%@\" onclick=\"changePasswordSharedInstance().handleSubmitButtonClicked(); return false;\" /></div></form></div>";
		rootElement.innerHTML = templateHTML.fmt("_ChangePassword.Title".loc(), "_ChangePassword.Description".loc(), "_ChangePassword.Old.Password.Label".loc(), "_ChangePassword.New.Password.Label".loc(), "_ChangePassword.Confirm.Password.Label".loc(), "_ChangePassword.Validation.Incorrect.Password".loc(), "_ChangePassword.Validation.Bad.Match".loc(), "_ChangePassword.Cancel.Title".loc(), "_ChangePassword.Save.Title".loc());
		this.mContainer.appendChild(rootElement);
		// Add extra event handlers.
		$$('input[type=text], input[type=password]').each(function(field) {
			field.observe('keyup', this.handleEditableElementChanged);
		}.bind(this));
	},
	handleSubmitButtonClicked: function(inEvent) {
		$$('p.error').invoke('hide');
		this.save();
		return false;
	},
	handleCancelButtonClicked: function(inEvent) {
		authenticator().logout();
	},
	handleEditableElementChanged: function(inEvent) {
		var oldPassword = $F('old_password');
		var newPassword = $F('old_password');
		var verifiedPassword = $F('confirmed_password');
		if (!oldPassword || !newPassword || !verifiedPassword) {
			this.disableSaveButton();
		} else {
			this.enableSaveButton();
		}
	},
	save: function() {
		dialogManager().showProgressMessage("_ChangePassword.Status.Changing.Password".loc());
		var oldPassword = $F('old_password');
		var newPassword = $F('new_password');
		var verifiedPassword = $F('confirmed_password');
		var _callback = function(inResponse) {
			dialogManager().hideProgressMessage();
			if (inResponse == true) {
				notifier().printMessage("_ChangePassword.Status.Success".loc());
				this.disableSaveButton();
				$$('input[type=text], input[type=password]').each(function(field) {
					field.clear();
				});
			}
			else {
				_errback();
			}
		}.bind(this);
		var _errback = function(inResponse) {
			dialogManager().hideProgressMessage();
			this.enableSaveButton();
			var exception = "unknown";
			if (inResponse && inResponse.response && inResponse.response.exceptionName) {
				exception = inResponse.response.exceptionName;
			}
			if (exception == "CSAuthBadPassword") {
				this.mContainer.down('p.error.incorrect').show();
			}
			else if (exception == "CSAuthPasswordMismatch") {
				this.mContainer.down('p.error.match').show();
			} else {
				notifier().printErrorMessage("_ChangePassword.Status.Error".loc());
			}
		}.bind(this);
		server_proxy().changePassword(oldPassword, newPassword, verifiedPassword, _callback, _errback);
	}
};
