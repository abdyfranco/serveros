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

// Class for a simple menu item, which is a wrapper around an <li> element with some added sauce.

CC.MenuItem = Class.create({
	mDisplayTitle: null,
	mDisplayTitleLocKey: null,
	mTooltip: null,
	mTooltipLocKey: null,
	mClassName: null,
	mURL: null,
	initialize: function() {
		// Build the DOM element for this menu item.
		this.mElement = this.buildElement();
		// Attach a unique identifer we can use to register this with the global event delegate.
		var randomString = buildRandomString();
		this.mElement.setAttribute('data-responder-id', randomString);
		// Register this event responder (only when we're actually using routes).
		if (!this.mURL) {
			globalEventDelegate().registerDomResponderForEventByIdentifer('click', randomString, this.handleElementClicked.bindAsEventListener(this));
		}
	},
	getAccessibilityID: function() { /* interface */ },
	getElementID: function() { /* interface */ },
	buildElement: function() {
		var li = document.createElement('li');
		var a = document.createElement('a');
		var displayTitle = this.mDisplayTitle;
		if (!displayTitle && this.mDisplayTitleLocKey) displayTitle = this.mDisplayTitleLocKey.loc();
		a.innerHTML = (displayTitle ? displayTitle.escapeHTML() : "???");
		if (this.mTooltip) {
			a.title = this.mTooltip;
		} else if (this.mTooltipLocKey) {
			a.title = this.mTooltipLocKey.loc();
		}
		a.className = "cc-menu-item"
		a.setAttribute('tabindex', this.getAccessibilityID());
		a.setAttribute('role', 'menuitem');
		
		// Used for aria-labelledBy attribute
		if (this.getElementID())
			a.setAttribute('id', this.getElementID());
		
		if (this.mClassName) a.className += " %@".fmt(this.mClassName);
		if (this.mURL) a.href = this.mURL;
		li.appendChild(a);
		return Element.extend(li);
	},
	handleElementClicked: function(inEvent) {
		this.action(inEvent);
	},
	// Your subclass should override this function.
	itemShouldDisplay: function() {
		return true;
	},
	// Updates the hidden state of this menu extra by evaluating itemShouldDisplay.  If your subclass needs
	// to update itself (e.g. changing the displayed text), override this function and do it there.
	updateDisplayState: function() {
		var shouldDisplay = this.itemShouldDisplay();
		shouldDisplay ? this.mElement.show() : this.mElement.hide();
		return shouldDisplay;
	},
	markAsSelected: function(inOptShouldBeSelected) {
		var selected = (inOptShouldBeSelected == undefined ? true : inOptShouldBeSelected);
		if (selected && !this.mElement.hasClassName('selected')) {
			this.mElement.addClassName('selected');
		} else if (!selected && this.mElement.hasClassName('selected')) {
			this.mElement.removeClassName('selected');
		}
	},
	// Your subclass should implement this function or set mURL on this class.
	action: function(inEvent) {}
});
