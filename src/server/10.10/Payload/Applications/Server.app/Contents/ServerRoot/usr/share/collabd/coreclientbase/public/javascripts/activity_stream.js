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

CC.ActivityStream = CC.ActivityStream || new Object();

// Notifications.

CC.ActivityStream.NOTIFICATION_DID_GET_NEW_ACTIVITY_CHUNK = 'DID_GET_NEW_ACTIVITY_CHUNK';
CC.ActivityStream.NOTIFICATION_NO_STREAM_ACTIVITY = 'NO_STREAM_ACTIVITY';
CC.ActivityStream.NOTIFICATION_ACTIVITY_STREAM_SHOULD_RECONNECT = 'ACTIVITY_STREAM_SHOULD_RECONNECT';
CC.ActivityStream.IFRAME_NO_ACTIVITY_INTERVAL = 300000;

// Activity stream shared instance so the chunked response <script> tag has something to call.
// Publishes a notification when any new activity arrives. Private shared instance hard-coded
// on the server to prevent XSS.

var ActivityStreamSharedInstance = Class.createWithSharedInstance('activityStream');
ActivityStreamSharedInstance.prototype = {
	initialize: function() {},
	signalWithJSON: function(inScriptTag, inJSON) {
		globalNotificationCenter().publish(CC.ActivityStream.NOTIFICATION_DID_GET_NEW_ACTIVITY_CHUNK, this, {'json': inJSON});
		inScriptTag.parentNode.removeChild(inScriptTag);
	}
};

// Activity stream chunked frame class. Initialize one of these to get activity stream behavior.
// The chunked response will call the activityStream() shared instance, which publishes a notification
// and triggers a callback.

CC.ActivityStream.ChunkFrame = Class.create({
	mCallback: null,
	mURL: "/__collabd/streams/activity?format=js",
	mFrame: null,
	mFrameReloadThreshold: 5000,
	mFrameReloadInterval: null,
	initialize: function(/* [options] */) {
		if (arguments && arguments.length > 0) Object.extend(this, arguments[0]);
		var frame = document.createElement('iFrame');
		frame.className = 'cc-activity-stream-chunk-frame';
		frame.style.display = 'none';
		document.body.appendChild(frame);
		this.mFrame = frame;
		this.setFrameURL(this.mURL);
		// Listen for notifications.
		globalNotificationCenter().subscribe(CC.ActivityStream.NOTIFICATION_DID_GET_NEW_ACTIVITY_CHUNK, this.handleChunkNotification.bind(this));
		globalNotificationCenter().subscribe(CC.ActivityStream.NOTIFICATION_ACTIVITY_STREAM_SHOULD_RECONNECT, this.reloadFrame.bind(this));
		
		Event.observe(frame, 'load', this.reloadFrame.bind(this));
		Event.observe(frame, 'error', this.reloadFrame.bind(this));
		
		this.setFrameNoActivityTimeout();
	},
	resetFrameNoActivityTimeout: function() {
		if (this.mFrameReloadInterval) {
			clearInterval(this.mFrameReloadInterval);
			this.setFrameNoActivityTimeout();
		}
	},
	setFrameNoActivityTimeout: function() {
		this.mFrameReloadInterval = setInterval(function() {
			logger().info("No stream activity notifications or heartbeat in a while. Reloading stream.");
			globalNotificationCenter().publish(CC.ActivityStream.NOTIFICATION_NO_STREAM_ACTIVITY);
			this.reloadFrame();
		}.bind(this), CC.ActivityStream.IFRAME_NO_ACTIVITY_INTERVAL);
	},
	reloadFrame: function() {
		if (event && event.type == "load") {
			logger().error("Activity frame appears to have fully loaded, will reload in %@ms".fmt(this.mFrameReloadThreshold));
		}
		if (event && event.type == "error") {
			logger().error("Activity frame appears to have encountered an error, will reload in %@ms".fmt(this.mFrameReloadThreshold));
		}
		
		if (this.mFrameReloadTimer) {
			clearTimeout(this.mFrameReloadTimer);
			this.mFrameReloadTimer = null;
		}
		this.mFrameReloadTimer = setTimeout(function() {
			this.setFrameURL(this.mURL);
		}.bind(this), this.mFrameReloadThreshold);
	},
	setFrameURL: function(inURL) {
		logger().debug("Reloading activity frame (url = %@)".fmt(inURL));
		if (this.mFrame) {
			this.mFrame.src = inURL;
		} else {
			logger().error("Activity frame not found, something is really wrong");
		}
	},
	handleChunkNotification: function(inMessage, inObject, inOptExtras) {
		this.resetFrameNoActivityTimeout();
		if (this.mCallback) return this.mCallback(inOptExtras && inOptExtras.json);
		logger().error("No chunk callback registered ... skipping");
	}
});
