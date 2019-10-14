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

CC.Keyboard = CC.Keyboard || new Object();
CC.Keyboard.Mixins = CC.Keyboard.Mixins || new Object();

// A keyboard shortcut delegate.

CC.Keyboard.NOTIFICATION_DID_KEYBOARD_RETURN = 'DID_KEYBOARD_RETURN';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_TAB = 'DID_KEYBOARD_TAB';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SHIFT_TAB = 'DID_KEYBOARD_SHIFT_TAB';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_ESC = 'DID_KEYBOARD_ESC';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SHIFT_ESC = 'DID_KEYBOARD_SHIFT_ESC'
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SPACE = 'DID_KEYBOARD_SPACE';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_BACKSPACE = 'DID_KEYBOARD_BACKSPACE';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_DELETE = 'DID_KEYBOARD_DELETE';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_FORWARD_DELETE = 'DID_KEYBOARD_FORWARD_DELETE';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_LEFT = 'DID_KEYBOARD_LEFT';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_RIGHT = 'DID_KEYBOARD_RIGHT';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_UP = 'DID_KEYBOARD_UP';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_DOWN = 'DID_KEYBOARD_DOWN';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_PAGEUP = 'DID_KEYBOARD_PAGEUP';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_PAGEDOWN = 'DID_KEYBOARD_PAGEDOWN';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SELECT_ALL = 'DID_KEYBOARD_SELECT_ALL';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_CLOSE = 'DID_KEYBOARD_CLOSE';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SAVE = 'DID_KEYBOARD_SAVE';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_CUT = 'DID_KEYBOARD_CUT';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_COPY = 'DID_KEYBOARD_COPY';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_PASTE = 'DID_KEYBOARD_PASTE';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_INDENT = 'DID_KEYBOARD_INDENT';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_OUTDENT = 'DID_KEYBOARD_OUTDENT';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_BOLD = 'DID_KEYBOARD_BOLD';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_ITALIC = 'DID_KEYBOARD_ITALIC';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_UNDERLINE = 'DID_KEYBOARD_UNDERLINE';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_MODIFIER = 'DID_KEYBOARD_MODIFIER';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_MODIFIER_UP = 'DID_KEYBOARD_MODIFIER_UP';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_GENERIC = 'DID_KEYBOARD_GENERIC';

Object.extend(Event, {
	CHARACTER_A: 65,
	CHARACTER_B: 66,
	CHARACTER_C: 67,
	CHARACTER_I: 73,
	CHARACTER_S: 83,
	CHARACTER_U: 85,
	CHARACTER_V: 86,
	CHARACTER_W: 87,
	CHARACTER_X: 88,
	CHARACTER_LEFT_SQUARE_BRACKET: 219,
	CHARACTER_RIGHT_SQUARE_BRACKET: 221,
	KEY_DELETE: 46,
	KEY_TAB: 9,
	KEY_SHIFT: 16,
	KEY_CONTROL: 17,
	KEY_OPTION: 18,
	KEY_COMMAND: 91,
	KEY_SPACE: 32,
	KEY_COMMA: 188,
	KEY_FORWARD_DELETE: 127
});

// Keyboard responder mixin.

CC.Keyboard.Mixins.Responder = {
	mIsKeyboardResponder: true,
	// Handles a keyboard notification returning true if the notification was
	// handled successfully and false otherwise. Returning true will prevent
	// the notification from firing elsewhere.
	handleKeyboardNotification: function(inMessage, inObject, inOptExtras) { /* Interface */ },
	willBecomeFirstResponder: function() { /* Interface */ },
	willLoseFirstResponder: function() { /* Interface */ },
	// Make this keyboard responder first responder. If another responder later
	// steals first responder status, your responder will regain first responder
	// once once the new responder loses first responder status.
	becomeFirstResponder: function() {
		this.willBecomeFirstResponder();
		globalKeyboardDelegate().mResponderChain = globalKeyboardDelegate().mResponderChain.without(this);
		globalKeyboardDelegate().pushFirstResponder(this);
	},
	// Give up first responder status.
	loseFirstResponder: function() {
		this.willLoseFirstResponder();
		globalKeyboardDelegate().mResponderChain = globalKeyboardDelegate().mResponderChain.without(this);
	}
};

// Global keyboard shortcut delegate.

CC.Keyboard.GlobalKeyboardShortcutDelegate = Class.createWithSharedInstance('globalKeyboardDelegate', true);
CC.Keyboard.GlobalKeyboardShortcutDelegate.prototype = {
	mResponderChain: null,
	initialize: function() {
		Event.observe(window, 'keydown', this.handleKeyboardEvent.bind(this));
		Event.observe(window, 'keyup', this.handleKeyboardUpEvent.bind(this));
		this.mResponderChain = new Array();
	},
	// Returns the first available responder in the responder chain.
	firstResponder: function() {
		if (this.mResponderChain.length > 0) return this.mResponderChain[0];
	},
	// Returns the next available responder after the current first responder.
	nextResponder: function() {
		if (this.mResponderChain.length > 1) return this.mResponderChain[1];
	},
	// Pushes a new first responder at the top of the responder chain.
	pushFirstResponder: function(inResponder) {
		if (!inResponder || (inResponder && !inResponder.mIsKeyboardResponder)) return;
		if (this.firstResponder() == inResponder) return;
		this.mResponderChain = this.mResponderChain.without(inResponder);
		this.mResponderChain.unshift(inResponder);
	},
	// Removes and returns the current first responder from the responder chain.
	popFirstResponder: function() {
		return this.mResponderChain.shift();
	},
	// Returns true if the user is holding the default modifier combination
	// for their platform (ctrl on Windows/Linux, cmd on Mac).
	isHoldingDefaultModifier: function(inEvent) {
		if ((browser().isWindows() || browser().isLinux()) && inEvent.ctrlKey) return false;
		else return (browser().isMacintosh() && inEvent.metaKey);
	},
	// Returns true if the user is holding the shift key.
	isHoldingShiftKey: function(inEvent) {
		return (inEvent && inEvent.shiftKey);
	},
	// Handles a keyboard event by traversing the responder chain looking for a responder that
	// successfully handles the event. Otherwise, publishes a generic keyboard notification.
	handleKeyboardEvent: function(inEvent) {
		var keyCode = inEvent.keyCode;
		if (!keyCode) return;
		// Initialize some constants.
		var notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_GENERIC;
		var optExtras = {'event': inEvent};
		// Determine the notification we will publish.
		switch (keyCode) {
			case Event.KEY_RETURN:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_RETURN;
				break;
			case Event.KEY_TAB:
				notification = (this.isHoldingShiftKey(inEvent) ? CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SHIFT_TAB : CC.Keyboard.NOTIFICATION_DID_KEYBOARD_TAB);
				break;
			case Event.KEY_SPACE:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SPACE;
				break;
			case Event.KEY_BACKSPACE:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_BACKSPACE;
				break;
			case Event.KEY_DELETE:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_DELETE;
				break;
			case Event.KEY_FORWARD_DELETE:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_FORWARD_DELETE;
				break;
			case Event.KEY_LEFT:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_LEFT;
				break;
			case Event.KEY_RIGHT:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_RIGHT;
				break;
			case Event.KEY_UP:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_UP;
				break;
			case Event.KEY_DOWN:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_DOWN;
				break;
			case Event.KEY_PAGEUP:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_PAGEUP;
				break;
			case Event.KEY_PAGEDOWN:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_PAGEDOWN;
				break;
			case Event.KEY_ESC:
				notification = (this.isHoldingShiftKey(inEvent) ? CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SHIFT_ESC : CC.Keyboard.NOTIFICATION_DID_KEYBOARD_ESC);
				break;
			// Select all.
			case Event.CHARACTER_A:
				if (!this.isHoldingDefaultModifier(inEvent)) break;
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SELECT_ALL;
				break;
			// Close.
			case Event.CHARACTER_W:
				if (!this.isHoldingDefaultModifier(inEvent)) break;
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_CLOSE;
				break;
			// Save.
			case Event.CHARACTER_S:
				if (!this.isHoldingDefaultModifier(inEvent)) break;
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SAVE;
				break;
			// Cut.
			case Event.CHARACTER_X:
				if (!this.isHoldingDefaultModifier(inEvent)) break;
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_CUT;
				break;
			// Copy.
			case Event.CHARACTER_C:
				if (!this.isHoldingDefaultModifier(inEvent)) break;
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_COPY;
				break;
			// Paste.
			case Event.CHARACTER_V:
				if (!this.isHoldingDefaultModifier(inEvent)) break;
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_PASTE;
				break;
			// Indent.
			case Event.CHARACTER_RIGHT_SQUARE_BRACKET:
				if (!this.isHoldingDefaultModifier(inEvent)) break;
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_INDENT;
				break;
			// Outdent.
			case Event.CHARACTER_LEFT_SQUARE_BRACKET:
				if (!this.isHoldingDefaultModifier(inEvent)) break;
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_OUTDENT;
				break;
			// Bold.
			case Event.CHARACTER_B:
				if (!this.isHoldingDefaultModifier(inEvent)) break;
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_BOLD;
				break;
			// Italic.
			case Event.CHARACTER_I:
				if (!this.isHoldingDefaultModifier(inEvent)) break;
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_ITALIC;
				break;
			// Underline.
			case Event.CHARACTER_U:
				if (!this.isHoldingDefaultModifier(inEvent)) break;
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_UNDERLINE;
				break;
			// Modifier.
			case Event.KEY_SHIFT:
			case Event.KEY_CONTROL:
			case Event.KEY_OPTION:
			case Event.KEY_COMMAND:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_MODIFIER;
				break;
		}
		// Is there a responder in the chain that wants to handle the notification?
		var responderIdx, responder, processed;
		for (var responderIdx = 0; responderIdx < this.mResponderChain.length; responderIdx++) {
			responder = this.mResponderChain[responderIdx];
			if (responder && (responder.handleKeyboardNotification(notification, undefined, optExtras) == true)) {
				processed = true;
				break;
			}
		}
		// Otherwise, publish a notification.
		if (!processed) {
			logger().debug("dispatchKeyboardNotification: %o %o", notification, optExtras);
			globalNotificationCenter().publish(notification, undefined, optExtras);
			return false;
		}
		return true;
	},
	// Handles a keyboard event by traversing the responder chain looking for a responder that
	// successfully handles the event. Otherwise, publishes a generic keyboard notification.
	// Up events are only processed for modifier keys.
	handleKeyboardUpEvent: function(inEvent) {
		var keyCode = inEvent.keyCode;
		if (!keyCode) return;
		// Initialize some constants.
		var notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_GENERIC;
		var optExtras = {'event': inEvent};
		// Determine the notification we will publish.
		switch (keyCode) {
			// Modifier.
			case Event.KEY_SHIFT:
			case Event.KEY_CONTROL:
			case Event.KEY_OPTION:
			case Event.KEY_COMMAND:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_MODIFIER_UP;
				break;
		}
		if (notification != CC.Keyboard.NOTIFICATION_DID_KEYBOARD_MODIFIER_UP) return;
		// Go straight to publishing a notification.
		logger().debug("dispatchKeyboardNotification: %o %o", notification, optExtras);
		globalNotificationCenter().publish(notification, undefined, optExtras);
		return false;
	}
};
