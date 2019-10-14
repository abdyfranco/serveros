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

CC.Menu = Class.create({

	initialize: function(element, anchor, inOptBeforeShowCallback) {
		var element = $(element);
		if (element.parentNode) element.remove();
		element.show();
		
		this.menu = $(Builder.node('div'));
		this.menu.addClassName('cc-menu');
		this.menu.setStyle({
			position: 'absolute',
			zIndex: '800'
		});
		this.menu.insert(element);
		this.menu.hide();
		this.menu.on('click', this.onMenuClick.bindAsEventListener(this));
		
		this.anchor = $(anchor);
		this.anchor.on('click', this.onAnchorClick.bindAsEventListener(this));
		
		this.mask = $(Builder.node('div'));
		this.mask.addClassName('cc-menu-mask');
		this.mask.setStyle({
			position: 'fixed',
			top: '0px',
			bottom: '0px',
			left: '0px',
			right: '0px',
			zIndex: '700'
		});
		this.mask.on('click', this.onMaskClick.bindAsEventListener(this));
		this.mask.hide();
		
		if (inOptBeforeShowCallback) this.mBeforeShowCallback = inOptBeforeShowCallback;
		
		if (window.orientation || window.orientation === 0)
			this.menu.on('orientationchange', this.onOrientationChange.bindAsEventListener(this));
		
		document.body.appendChild(this.mask);
		document.body.appendChild(this.menu);
	},
	
	onMenuClick: function(e) {
		this.close();
	},
	onAnchorClick: function(e) {
		e.stop();
		this.open();
	},
	onMaskClick: function(e) {
		e.stop();
		this.close();
	},
	
	onOrientationChange: function() {
		if (this.anchor.up('li')) this.anchor.up('li').removeClassName('open');
		this.mask.hide();
		this.menu.hide();
	},
	
	open: function() {
		if (this.anchor.up('li')) this.anchor.up('li').addClassName('open');
		this.positionElementToAnchor();
		this.mask.show();
		this.menu.show();
		if (this.mBeforeShowCallback) this.mBeforeShowCallback();
	},
	close: function() {
		if (this.anchor.up('li')) this.anchor.up('li').removeClassName('open');
		this.mask.hide();
		this.menu.hide();
	},
	toggle: function() {
		this.menu.visible() ? this.close() : this.open();
	},
	
	positionElementToAnchor: function() {
		this.menu.show();
		var mLayout = this.menu.getLayout();
		var aLayout = this.anchor.getLayout();
		this.menu.clonePosition(this.anchor, {
			setWidth:   false,
			setHeight:  false,
			offsetTop:  aLayout.get('border-box-height') - 2, // 2px  is to account for the difference between the real and apparent boundaries of the anchor, because of the use of a background image to simulate the anchor borders
			offsetLeft: aLayout.get('border-box-width') - mLayout.get('border-box-width')
		});
		this.menu.hide();
	},
	
	destroy: function() {
		this.anchor.stopObserving('click', this.onAnchorClick.bindAsEventListener(this));
		Element.remove(this.menu);
		Element.remove(this.mask);
		delete this;
	}

});

