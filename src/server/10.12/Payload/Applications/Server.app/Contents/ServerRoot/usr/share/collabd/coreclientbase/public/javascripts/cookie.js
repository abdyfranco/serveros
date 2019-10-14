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

// Prompt if cookies are disabled.

if (!navigator.cookieEnabled) {
	alert("_Cookies.NoCookiesUnsupported".loc());
}

// Global cookie accessor shared instance.

CC.CookieManager = Class.createWithSharedInstance('globalCookieManager', false);
CC.CookieManager.prototype = {
	initialize: function() {},
	// Writes a new key/value pair to the browser cookie. Accepts a cookie
	// name, value, and optional path, expiry and secure preferences.
	setCookie: function(inCookieKey, inCookieValue, inOptCookiePath, inOptCookieExpiry, inOptIsSecure) {
		if (!inCookieKey) return false;
		this.destroyCookie(inCookieKey, inOptCookiePath);
		var expire = inOptCookieExpiry;
		if (!expire) {
			var today = new Date();
			expire = new Date();
			expire.setTime(today.getTime() + 1000 * 60 * 60);
		}
		var cookieValue = (inCookieValue == undefined ? '' : inCookieValue);
		var cookie = inCookieKey + '=' + cookieValue + '; path=' + (inOptCookiePath || '/') + '; expires=' + expire.toGMTString() + ';' + (inOptIsSecure ? ' secure;' : '');
		document.cookie = cookie;
		return true;
	},
	// Returns the value of a supplied cookie key.
	getCookie: function(inCookieKey) {
		if (!inCookieKey) return undefined;
		var pattern = new RegExp(inCookieKey + '=([^;]+)');
		var value = document.cookie.match(pattern);
		if (value && value.length > 1) {
			return value[1];
		}
		return undefined;
	},
	// Destoys a cookie entry for a given key and optional path.
	destroyCookie: function(inCookieKey, inOptPath) {
		if (!inCookieKey) return;
		document.cookie = inCookieKey + '=; path=' + (inOptPath || '/') + '; expires=Thu, 01-Jan-1970 00:00:01 GMT;';
	}
};
