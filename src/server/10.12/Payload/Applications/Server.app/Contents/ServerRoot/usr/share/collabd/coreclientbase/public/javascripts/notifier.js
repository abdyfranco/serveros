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

// A unified way of displaying notification messages.

CC.Notifier = CC.Notifier || new Object();

// Allowed notification states.

CC.Notifier.NORMAL_STATE = 'normal';
CC.Notifier.BUSY_STATE = 'busy';
CC.Notifier.FAILED_STATE = 'failed';
CC.Notifier.SUCCEEDED_STATE = 'succeeded';

// Model class for a queued notification.

CC.Notifier.Notification = Class.create({
	mDisplayString: null,
	mDisplayParams: null,
	mState: CC.NOTIFIER_MESSAGE_STATE_NORMAL,
	initialize: function(/* [inOptions] */) {
		if (arguments.length > 0 && arguments[0]) Object.extend(this, arguments[0]);
		return this;
	},
	// Private.
	mCompleted: false
});

// Global notifier shared instance.

CC.Notifier.DID_QUEUE_NOTIFICATION = 'DID_QUEUE_NOTIFICATION';
CC.Notifier.DID_UPDATE_NOTIFICATION = 'DID_UPDATE_NOTIFICATION';

var Notifier = Class.createWithSharedInstance('notifier');
Notifier.prototype = {
	// Track the current queue of notifications.
	mNotificationQueue: new Array(),
	// Track all registered notifications.
	mNotifications: new Hash(),
	// Track the currently dispatched notification.
	mActiveNotification: null,
	mNextNotificationIdentifer: 0,
	mTimeout: 1500,
	mFinalDelay: 3000,
	mShowNotifications: false,
	mShowErrorNotifications: true,
	initialize: function() {
		this.render();
		globalNotificationCenter().subscribe(CC.Notifier.DID_QUEUE_NOTIFICATION, this.dispatchNotification.bind(this));
		globalNotificationCenter().subscribe(CC.Notifier.DID_UPDATE_NOTIFICATION, this.updateAndDispatch.bind(this));
		this._initializeInlineContent();
	},
	// Initializes any inline flash messages from the server on load.
	_initializeInlineContent: function() {
		var payload = $('notifier');
		if (!payload) return;
		var alert = payload.down('.alert').innerHTML;
		var notice = payload.down('.notice').innerHTML;
		if (alert && alert != "") this.queueNotificationWithParams(error, undefined, CC.Notifier.FAILED_STATE);
		if (notice && notice != "") this.queueNotificationWithParams(notice);
	},
	// Renders and appends the notification chrome.
	render: function() {
		this.mParentElement = Builder.node('div', {className: 'notifier hidden'}, [
			Builder.node('div', {className: 'content'})
		]);
		document.body.appendChild(this.mParentElement);
	},
	redraw: function() {
		var active = this.mActiveNotification;
		if (!active || !active.mDisplayString) return;
		var displayString = active.mDisplayString;
		var localized = displayString.loc.apply(displayString, active.mDisplayParams || []);
		// Update the display string.
		this.mParentElement.down('.content').innerHTML = localized;
		// Update the state.
		var state = active.mState || CC.Notifier.NORMAL_STATE;
		['normal', 'busy', 'failed', 'succeeded'].each(function(klass) {
			this.mParentElement.removeClassName(klass);
		}, this);
		this.mParentElement.addClassName(state);
	},
	// Hide/show the notification widget. Uses CSS transitions for animation.
	hide: function() {
		this.mParentElement.addClassName('hidden');
	},
	show: function() {
		if (browser().isMobileSafari()) {
			var notification = this.mActiveNotification;
			var displayString = notification.mDisplayString;
			var localized = displayString.loc.apply(displayString, notification.mDisplayParams || []);
			alert(localized);
		} else {
			this.mParentElement.show();
			setTimeout(function() {
				this.redraw();
				this.mParentElement.removeClassName('hidden');
			}.bind(this), 250);
		}
	},
	// Queues a simple notification.
	printMessage: function(inString) {
		return this.queueNotificationWithParams(inString);
	},
	// Queues a simple error notification.
	printErrorMessage: function(inString) {
		var result = this.queueNotificationWithParams(inString, undefined, CC.Notifier.FAILED_STATE);
		return result;
	},
	printBusyMessage: function(inString) {
		return this.queueNotificationWithParams(inString, undefined, CC.Notifier.BUSY_STATE);
	},
	// Pushes a new notification onto the notification queue to be displayed at
	// the next available opportunity. Returns undefined where a notification
	// could not be added, or a notification identifer where the notification was
	// successfully queued. You can use the notification identifer to cancel or
	// update the notification later.
	queueNotification: function(inNotification) {
		if (!inNotification) return undefined;
		var identifier = this.mNextNotificationIdentifer;
		this.mNotifications.set(this.mNextNotificationIdentifer, inNotification);
		this.mNotificationQueue.push(inNotification);
		this.mNextNotificationIdentifer += 1;
		globalNotificationCenter().publish(CC.Notifier.DID_QUEUE_NOTIFICATION, inNotification);
		return identifier;
	},
	queueNotificationWithParams: function(inDisplayString, inDisplayParams, inState) {
		if (inState != CC.Notifier.FAILED_STATE && !this.mShowNotifications) return;
		if (inState == CC.Notifier.FAILED_STATE && !this.mShowErrorNotifications) return;
		var notification = new CC.Notifier.Notification({
			mDisplayString: inDisplayString,
			mDisplayParams: inDisplayParams,
			mState: inState
		});
		return this.queueNotification(notification);
	},
	// Updates an existing notification in the notification queue. Expects a
	// valid notification identifier (returned by addNotification) and a hash
	// of attribute changes. Allowed attributes are mDisplayString,
	// mDisplayParams and mState.
	updateNotification: function(inNotificationID, inUpdates) {
		if (inNotificationID == undefined || !this.mNotifications.get(inNotificationID) || !inUpdates) return false;
		var notification = this.mNotifications.get(inNotificationID);
		if (notification == this.mActiveNotification) this._pendingUpdate = true;
		Object.extend(notification, inUpdates);
		globalNotificationCenter().publish(CC.Notifier.DID_UPDATE_NOTIFICATION, notification, {
			notificationID: inNotificationID,
			updates: inUpdates
		});
		return true;
	},
	// Dispatches the first queued notification.
	dispatchNotification: function() {
		// Dispatch later if a change is-a-pending.
		if (this._pendingUpdate) {
			if (this.mDispatchTimeout) clearTimeout(this.mDispatchTimeout);
			this.mDispatchTimeout = setTimeout(function() {
				this._pendingUpdate = false;
				this._dispatch();
			}.bind(this), this.mTimeout);
		}
		// Dispatch later if we're already dispatching.
		if (this._dispatching) return;
		// Otherwise dispatch.
		this._dispatching = true;
		var queue = this.mNotificationQueue;
		// Mark any in-progress notifications as done.
		var active = this.mActiveNotification;
		if (active) active.mCompleted = true;
		// Pop the next notification in the queue.
		var notification = queue.shift();
		// Bail if the queue was actually empty.
		if (!notification && queue.length == 0) {
			this._dispatching = false;
			// Delay hiding the last notification.
			if (this.mTimer) clearTimeout(this.mTimer);
			this.mTimer = setTimeout(function() {
				this.hide();
				setTimeout(function() {
					this.mParentElement.hide();
				}.bind(this), 400);
			}.bind(this), this.mFinalDelay);
			return;
		}
		// Cache and recurse.
		if (notification) this.mActiveNotification = notification;
		this.hide();
		this.show();
		if (this.mTimer) clearTimeout(this.mTimer);
		this.mTimer = setTimeout(this._dispatch.bind(this), this.mTimeout);
	},
	updateAndDispatch: function() {
		this.redraw();
		this.dispatchNotification();
	},
	_dispatch: function() {
		// It's safe to dispatch if we're not pending an update or busy.
		var pending = this._pendingUpdate == undefined ? false : this._pendingUpdate;
		var busy = (this.mActiveNotification && (this.mActiveNotification.mState == CC.Notifier.BUSY_STATE));
		if (busy) this._pendingUpdate = true;
		if (!pending && !busy) this._dispatching = false;
		this.dispatchNotification();
	}
};
