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

//= require "./change_password.js"

var Webauth = Class.createWithSharedInstance('webauth', true);
Webauth.prototype = {
	initialize: function() {
		this.mContainer = $('webauth');
		if (!this.mContainer) return invalidate;
		document.body.addClassName(globalLocalizationManager().getLprojLocale());
		this.setAuthenticatedCallback(this.defaultSuccessCallback.bind(this));
		this.setFailureCallback(this.defaultFailureCallback.bind(this));
		// Render and focus the username field.
		this.renderLogInForm();
		$('username').focus();
		// Set the browser title.
		document.title = "_Webauth.Title".loc();
	},
	enableLoginButton: function() {
		$$('input.submit').invoke('enable');
		$$('input.cancel').invoke('enable');
	},
	disableLoginButton: function() {
		$$('input.submit').invoke('disable');
		$$('input.cancel').invoke('disable');
	},
	renderLogInForm: function() {
		var useDigest = (CC.meta("x-apple-auth-type") == "digest");
		var isSecure = (window.location.protocol == "https:");
		var enableRememberMe = (CC.meta("x-apple-enable-remember-me") == "true");
		var windowed = (CC.meta("x-apple-auth-windowmode") == "windowed");
		var framed = (CC.meta("x-apple-auth-windowmode") == "framed");
		var rememberMeCookie = globalCookieManager().getCookie('cc.collabd_session_remember_me');
		var rememberMeCheckedString = ((rememberMeCookie && enableRememberMe) ? " checked=\"checked\"" : "");
		// Check remember me by default.
		if (rememberMeCookie == undefined && enableRememberMe) rememberMeCheckedString = " checked=\"checked\"";
		if (windowed) document.body.addClassName('windowed');
		if (framed) document.body.addClassName('framed');
		var hostname = window.location.hostname;
		var rootElement = Builder.node('div', {id: "webauth", 'className': "cc-auth-dialog"});
		var templateHTML = "<div class=\"inner\"><h1>%@</h1><form accept-charset=\"UTF-8\" action=\"#\"><div style=\"margin: 0px; padding: 0px; display: inline;\"><div class=\"icon\"><div class=\"img\"></div></div><h2>%@</h2><div class=\"sections\"><div class=\"section\"><label for=\"username\">%@</label><input id=\"username\" name=\"username\" type=\"text\" placeholder=\"%@\" autocorrect=\"off\" autocapitalize=\"off\" autocomplete=\"off\"></div><div class=\"section\"><label for=\"password\">%@</label><input id=\"password\" name=\"password\" placeholder=\"%@\" type=\"password\" value=\"\"></div><div class=\"remember_me_checkbox\"><label for=\"rememberMe\"><input%@ id=\"rememberMe\" name=\"rememberMe\" type=\"checkbox\" value=\"true\">%@</label></div></div><p class=\"error\" style=\"display: none;\">%@</p><p class=\"info\">%@</p><div class=\"buttons\"><input type=\"reset\" class=\"cancel\" value=\"%@\" onclick=\"webauth().cancel(); return false;\"/><input type=\"submit\" class=\"submit\" value=\"%@\" onclick=\"webauth().sendAuthentication(); return false;\"/></div></form></div>";
		rootElement.innerHTML = templateHTML.fmt("_Webauth.Please.Log.In".loc(), hostname, "_Webauth.User.Name".loc(), "_Webauth.User.Name".loc(), "_Webauth.Password".loc(), "_Webauth.Password".loc(), rememberMeCheckedString, "_Webauth.Remember.Me".loc(), "_Webauth.Error.InvalidUserOrPassword".loc(), "_Webauth.Warning.Plaintext".loc(), "_Webauth.Cancel".loc(), "_Webauth.Log.In".loc());
		// If we're using digest authentication, hide the plaintext password warning.
		if (useDigest || (!useDigest && isSecure)) {
			rootElement.down('p.info').hide();
		}
		if (!enableRememberMe) {
			rootElement.down('.remember_me_checkbox').hide();
		}
		this.mContainer.appendChild(rootElement);
		
		if (windowed || framed) {
			var msg = ((windowed) ? window.opener : window.parent).authenticator().getCurrentErrorMessage();
			if (msg) {
				var e = rootElement.down('p.error');
				e.innerHTML = msg;
				e.show();
			}
		}

		if ( browser().isiPhone() ) {
			var meta = document.createElement('meta');
			meta.id = "viewport";
			meta.name = "viewport";
			meta.content = "width=device-width, maximum-scale=1.0";
			var headNode = document.querySelector('head');
			headNode.appendChild(meta);
		}
	},
	cancel: function() {
		if (CC.meta("x-apple-auth-windowmode") == "framed") {
			window.parent.authenticator().cancelWindowedLogin();
		}
	},
	sendAuthentication: function() {
		$$('p.error').invoke('hide');
		this.disableLoginButton();
		if (CC.meta("x-apple-auth-type") == "digest") {
			this.sendAuthenticationDigest();
		} else {
			this.sendAuthenticationPlain();
		}
	},
	sendAuthenticationDigest: function() {
		this.setRememberMeCookie();
		var username = $F('username'), password = $F('password');
		authenticator().login_digest(username, password, this.gotAuthenticationResponse.bind(this), this.failureCallback);
		return false;
	},
	sendAuthenticationPlain: function() {
		this.setRememberMeCookie();
		var username = $F('username'), password = $F('password');
		authenticator().login_plain(username, password, this.gotAuthenticationResponse.bind(this), this.failureCallback);
		return false;
	},
	gotAuthenticationResponse: function(inWorked) {
		if (inWorked == true) {
			this.successCallback();
		} else {
			this.failureCallback();
		}
	},
	setAuthenticatedCallback: function(callback) {
		// set the callback for successful auth
		this.successCallback = callback;
	},
	setFailureCallback: function(callback) {
		// set the callback for failed auth
		this.failureCallback = callback;
	},
	defaultSuccessCallback: function() {
		if (CC.meta("x-apple-auth-windowmode") == "windowed") {
			window.opener.authenticator().completeWindowedLogin(window);
		} else if (CC.meta("x-apple-auth-windowmode") == "framed") {
			window.parent.authenticator().completeWindowedLogin();
		} else {
			this.redirect();
		}
	},
	defaultFailureCallback: function(response) {
		$$('p.error').invoke('show');
		this.enableLoginButton();
		$('password').value = "";
		$('password').focus();
	},
	setRememberMeCookie: function() {
		var rememberMeCheck = false;
		var checkBox = $('rememberMe');
		if (checkBox == undefined) {
			rememberMeCheck = false;
		} else {
			rememberMeCheck = checkBox.checked;
		}
		authenticator().setRememberMe(rememberMeCheck);
		if (rememberMeCheck) {
			globalCookieManager().setCookie('cc.collabd_session_remember_me', true);
		} else {
			globalCookieManager().destroyCookie('cc.collabd_session_remember_me');
		}
	},
	redirect: function() {
		var redirectString = "";
		var addAuthToken = true;
		var redirectKey = "redirect=";
		var addAuthTokenKey = "send_token=";
		var searchString = window.location.href;
		if (searchString.length) {
			var begin = searchString.indexOf(redirectKey);
			if (begin != -1) {
				begin += redirectKey.length;
				end = searchString.indexOf("&", begin);
				if (end == -1) {
					end = searchString.length;
				}
				redirectString = searchString.substring(begin, end);
			}
			begin = searchString.indexOf(addAuthTokenKey);
			if (begin != -1) {
				begin += addAuthTokenKey.length;
				end = searchString.indexOf("&", begin);
				if (end == -1) {
					end = searchString.length;
				}
				addAuthToken = searchString.substring(begin, end) != "no";
			}
		}
		var _sanitizedCallback = function(resultRedirect) {
			if (addAuthToken) {
				resultRedirect = resultRedirect+"?auth_token="+sessions().currentSessionCookie();
			}
			window.location.href = resultRedirect;
		}
		var _errback = function(result) {
			_sanitizedCallback("/");
		}
		server_proxy().sanitizeRedirect(redirectString, _sanitizedCallback, _errback);
	}
};
