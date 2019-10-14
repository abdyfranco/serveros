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

// A controlled explosion of smoke.

var Smokey = Class.createWithSharedInstance('smokey');
Smokey.prototype = {
	mWidth: 42,
	mHeight: 42,
	mPoofFrameDelay: 90,
	initialize: function() {
		this.mParentElement = document.createElement('div');
		Element.extend(this.mParentElement);
		this.mParentElement.addClassName('smokey').hide();
		document.body.appendChild(this.mParentElement);
	},
	showOverElement: function(elementId) {
		if (!elementId) return null;
		var element = $(elementId);
		if (!element) return null;
		if (element.getStyle('display') == "none") return null;
		Position.clone(element, this.mParentElement, {
			setWidth: false,
			setHeight: false,
			offsetLeft: (element.offsetWidth / 2) - (this.mWidth / 2),
			offsetTop: (element.offsetHeight / 2) - (this.mHeight / 2)
		});
		this.show();
	},
	showAtPosition: function(inPosition) {
		if (!inPosition || !inPosition.left || !inPosition.top) return null;
		this.mParentElement.setStyle({
			'left': inPosition.left + 'px',
			'top': inPosition.top + 'px'
		});
		this.show();
	},
	show: function() {
		this.mParentElement.show();
		this.mCurrentFrame = 0;
		if (this.mTimer) clearTimeout(this.mTimer);
		this.mTimer = setTimeout(this.handleTimerFired.bind(this), this.mPoofFrameDelay);
	},
	handleTimerFired: function() {
		if (this.mCurrentFrame < 5) {
			this.mCurrentFrame++;
			var x = this.mCurrentFrame * this.mHeight * (-1);
			this.mParentElement.style.backgroundPosition = '0px ' + x + 'px';
			this.mTimer = setTimeout(this.handleTimerFired.bind(this), this.mPoofFrameDelay);
		}
		else {
			this.mParentElement.hide();
			delete this.mTimer;
		}
	}	
};
