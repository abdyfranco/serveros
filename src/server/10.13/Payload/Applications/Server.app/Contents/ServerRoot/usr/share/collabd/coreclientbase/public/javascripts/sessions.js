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
//= require "./entity_types.js"

// Sessions global responsible for tracking all things session related, including session cookies
// and session instances returned from the server. Important note: the session is not magically loaded
// when the page is loaded to avoid blocking the UI and to avoid race conditions where the session
// is loaded after dependent code is called. Any code that is expecting a populated session/user should
// be making calls to currentUserAsynchronously and currentOrNewSessionAsynchronously before drawing
// any dependent UI.

CC.now = function() {
	return Math.round(new Date().getTime() / 1000);
};

CC.Sessions = Class.createWithSharedInstance('sessions');
CC.Sessions.prototype = {
	mCurrentSession: null,
	mTimestamp: null,
	mRefreshInterval: 8 * 60 * 60,
	initialize: function() {},
	// Fetches a full session instance given the current session cookie, accepting an optional force
	// reset flag which nukes the local cookie and obtains a new session.
	currentOrNewSessionAsynchronously: function(inShouldReset, inCallback, inErrback) {
		var sessionGUID;
		if (!inShouldReset) {
			var currentSession = this.__getCurrentSession();
			if (currentSession) {
				logger().debug("currentOrNewSessionAsynchronously: %@", currentSession);
				var timestamp = CC.now();
				if ((timestamp - this.mTimestamp) < this.mRefreshInterval) {
					inCallback(currentSession);
					return;
				}
			}
			// Do we have a session cookie we can use?
			sessionGUID = this.currentSessionCookie();
		} else {
			// Nuke the current session (including the cookie) to force the server to grant us a new one.
			this.__resetCurrentSession();
		}
		// Fetch a session.
		service_client().executeAsynchronously('AuthService', 'currentOrNewSession', [], {}, function(service_response) {
			var session = (service_response && service_response.response);
			if (session) {
				logger().debug("session: " + JSON.stringify(session));
				this.__setCurrentSession(session);
				if (inCallback) inCallback(session);
				return;
			}
		}.bind(this), inErrback);
	},
	currentUserAsynchronously: function(inCallback, inErrback) {
		this.currentOrNewSessionAsynchronously(false, function(session) {
			return inCallback(session.user);
		}, function() {
			logger().error("Could not fetch current user");
			return inErrback();
		});
	},
	// Returns the current session cookie if it exists.
	currentSessionCookie: function() {
		return globalCookieManager().getCookie('cc.collabd_session_guid');
	},
	// Returns the current session.  You should not normally call this manually, use currentOrNewSessionAsynchronously.
	__getCurrentSession: function() {
		logger().debug("currentSession: %@", this.mCurrentSession);
		return this.mCurrentSession;
	},
	// Sets the current session. You should not normally call this manually.
	__setCurrentSession: function(inSession) {
		this.mTimestamp = CC.now();
		var sessionModel = new CC.EntityTypes.Session(inSession);
		logger().debug("__setCurrentSession: %@", sessionModel);
		globalCookieManager().setCookie('cc.collabd_session_guid', sessionModel.guid);
		return (this.mCurrentSession = sessionModel);
	},
	// Resets the current session (logging the current user out if they're authenticated). You should not normally
	// call this method manually.
	__resetCurrentSession: function(inOptCallback, inOptErrback) {
		logger().debug("__resetCurrentSession: %@");
		this.mCurrentSession = null;
		this.mTimestamp = null;
		globalCookieManager().destroyCookie('cc.collabd_session_guid');
	}
};
