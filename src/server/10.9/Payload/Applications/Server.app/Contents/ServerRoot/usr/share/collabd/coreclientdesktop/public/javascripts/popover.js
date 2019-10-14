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

CC.Popover = Class.create(CC.Keyboard.Mixins.Responder, {
	initialize: function(inOptToggleBtn) {
		var element = Builder.node('div', {className:"popover left"}, [
			Builder.node('div', {className: "content"}),
			Builder.node('div', {className: "norgie"})
		]);
		var content = this.renderPopoverContent();
		if (content) element.down('.content').appendChild(content);
		this.element = element;
		this.toggleButton = inOptToggleBtn;
		if (this.toggleButton) {
			this.toggleButton.on('click', this.toggle.bindAsEventListener(this));
		}
		this.element.hide();
		this.visible = false;
		document.body.appendChild(this.element);
		Event.observe(window, 'mousedown', this.handleWindowMouseDown.bindAsEventListener(this));
		this.makeAccessible();
	},
	renderPopoverContent: function() { /* Interface */
		return document.createElement('div');
	},
	makeAccessible: function() { },
	show: function() {
		this.becomeFirstResponder();
		this.element.show();
		this.visible = true;
	},
	hide: function() {
		this.element.hide();
		this.visible = false;
		this.currentItem = 0;
		this.loseFirstResponder();
	},
	toggle: function() {
		if (this.visible) {
			this.hide();
		}
		else {
			this.show();
		}
	},
	handleKeyboardNotification: function(inMessage, inObject, inOptExtras) {
		switch (inMessage) {
		case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_ESC:
			if (!this.visible) break;
			this.hide();
			return true;
		default:
			if (this.visible) return true;
			break;
		}
	},
	handleWindowMouseDown: function(inEvent) {
		if (!this.visible) return;
		if (this.toggleButton && inEvent.findElement('a, div, button, input, li') == this.toggleButton) return;
		if (inEvent.findElement('.popover') == this.element) return;
		this.hide();
	}
});
