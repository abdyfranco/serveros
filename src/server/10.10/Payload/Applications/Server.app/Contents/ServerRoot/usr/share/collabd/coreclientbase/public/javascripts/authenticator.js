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

//= require "./core.js"
//= require "./thirdparty/digest.js"
//= require "./thirdparty/md5.js"

// Authenticator class for plain/digest authentication.
CC.Auth = {};
CC.Auth.LOGIN_STATUS_CHANGED_NOTIFICATION = 'LOGIN_STATUS_CHANGED';

var Authenticator = Class.createWithSharedInstance('authenticator');
Authenticator.prototype = {
	basePath: "/auth",
	csrf_token: null,
	loginFrame: null,
	currentErrorMessage: null,
	initialize: function() {
		this.rememberMe = false;
	},
	displayWindowedLoginPrompt: function(inOptCallback, inOptCancelback, inOptErrMessage) {
		var width = window.innerWidth;
		var height = window.innerHeight;
		var x = Math.floor((width - 340) / 2) + (window.screenX || window.screenLeft);
		var y = Math.floor((height - 300) / 2) + (window.screenY || window.screenTop);
		var w = window.open("/auth?sendToken=no&windowed=yes", "authWindow", "width=340,height=300,left=" + x + ",top=" + y + ",resizable=no,scrollbars=no,dialog=yes,centerscreen=yes");
		if (w == null)
			return false;
		if (inOptCallback)
			w.completionCallback = inOptCallback;
		if (inOptCancelback)
			w.cancelCallback = inOptCancelback;
		if (inOptErrMessage)
			this.currentErrorMessage = inOptErrMessage;
		return true;
	},
	displayFramedLoginPrompt: function(inOptCallback, inOptCancelback, inOptErrMessage) {
		if (this.loginFrame)
			return false;
		
		this.loginFrame = document.createElement('iframe');
		this.loginFrame.className = 'authenticationFrame';
		this.loginFrame.src = "/auth?sendToken=no&framed=yes";
		
		if (inOptCallback)
			this.loginFrame.completionCallback = inOptCallback;
		if (inOptCancelback)
			this.loginFrame.cancelCallback = inOptCancelback;
		if (inOptErrMessage)
			this.currentErrorMessage = inOptErrMessage;
			
		this.loginFrame.addEventListener('load', function(inEvent){
			dialogManager().hide();
			inEvent.target.addClassName('ready');
		}, false);
		
		document.body.appendChild(this.loginFrame);
		
		dialogManager().showProgressMessage("_General.Loading".loc());
		
		return true;
	},
	getCurrentErrorMessage: function() {
		var msg = this.currentErrorMessage;
		this.currentErrorMessage = null;
		return msg;
	},
	completeWindowedLogin: function(inLoginWindow) {
		this.repopulateUserMetadata(function(){
			if (inLoginWindow)
				inLoginWindow.close();
			
			globalNotificationCenter().publish(CC.Auth.LOGIN_STATUS_CHANGED_NOTIFICATION, this);
		
			if (inLoginWindow && inLoginWindow.completionCallback)
				inLoginWindow.completionCallback.call(this);
			if (this.loginFrame && this.loginFrame.completionCallback)
				this.loginFrame.completionCallback.call(this);
			
			if (this.loginFrame)
			{
				this.loginFrame.parentNode.removeChild(this.loginFrame);
				this.loginFrame = null;
			}
		}.bind(this), function(){
			inLoginWindow.close();
			window.location.reload();
		});
	},
	cancelWindowedLogin: function(inLoginWindow) {
		if (inLoginWindow)
			inLoginWindow.close();
		
		if (inLoginWindow && inLoginWindow.cancelCallback)
			inLoginWindow.cancelCallback.call(this);
		if (this.loginFrame && this.loginFrame.cancelCallback)
			this.loginFrame.cancelCallback.call(this);
		
		if (this.loginFrame)
		{
			this.loginFrame.parentNode.removeChild(this.loginFrame);
			this.loginFrame = null;
		}
	},
	repopulateUserMetadata: function(inOptCallback, inOptErrback) {
		server_proxy().refreshMetaTags(inOptCallback, inOptErrback);
	},
	// Plain login.
	login_plain: function(inUsername, inPassword, inCallback, inErrback) {
		var callback = function(inWorked) {
			if (!inWorked) {
				inErrback(inWorked);
			} else {
				inCallback(inWorked);
			}
		}
		server_proxy().validateUsernameAndPassword(inUsername, inPassword, this.rememberMe, callback, inErrback);
	},
	// Digest login.
	login_digest: function(inUsername, inPassword, inCallback, inErrback) {
		var validateCallback = function(success) {
			if (success) {
				inCallback(success);
			} else {
				inErrback(success);
			}
		}
		var challengeCallback = function(challenge) {
			var digested = digestResponse(inUsername, inPassword, challenge);
			server_proxy().validateUsernameAndPasswordDigest(digested, this.rememberMe, validateCallback, inErrback);
		}
		server_proxy().getChallenge(inUsername, true, challengeCallback.bind(this), inErrback);
	},
	// Logout.
	logout: function() {
		var currentURL = window.location;
		window.location.href = "/auth/logout?redirect=" + currentURL;
	},
	setRememberMe: function(inRemember) {
		this.rememberMe = inRemember;
	}
};
