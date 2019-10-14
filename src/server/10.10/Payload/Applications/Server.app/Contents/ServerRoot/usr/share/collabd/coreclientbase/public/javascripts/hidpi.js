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

CC.HiDPI = Class.createWithSharedInstance('hidpi', true);
CC.HiDPI.prototype = {
	initialize: function() {
		this.setDPIClassName();
	},
	isHiDPI: function() {
		if (!('devicePixelRatio' in window)) return false;
		if (('devicePixelRatio' in window) && window['devicePixelRatio'] == undefined) return false;
		return (window.devicePixelRatio >= 2);
	},
	setDPIClassName: function() {
		if (this.isHiDPI()) {
			document.body.addClassName('hidpi');
		} else {
			document.body.removeClassName('hidpi');
		}
	}
};
