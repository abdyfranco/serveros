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

// Zero-pads a given number up to a supplied length (defaults to 3) and
// returns the result as a string, e.g. pad(13, 3) = "013". Handy for
// building random guids in fixture data.

var pad = function(x, length) {
	var val = "" + x;
	while (val.length < (length || 3)) {
		val = "0" + val;
	}
	return val;
}

// Builds a 36-character alphanumeric guid.

CC.GuidBuilder = Class.create({
	initialize: function() {
		var olderDate = new Date(1582, 10, 15, 0, 0, 0, 0);
		var now = new Date();
		var msec = now.valueOf() - olderDate.valueOf();
		var nic = pad(hex_hmac_md5(this.getShiftedBits(this.getRandomNumberInRange(0, 4095), 0, 16), location.href), 12).substring(0, 12);
		var uidArray = [
			this.getShiftedBits(msec, 0, 8),
			this.getShiftedBits(msec, 8, 12),
			this.getShiftedBits(msec, 12, 16),
			this.getShiftedBits(this.getRandomNumberInRange(0, 4095), 0, 2) + this.getShiftedBits(this.getRandomNumberInRange(0, 4095), 0, 2),
			nic
		];
		this.mStringValue = uidArray.join('-');
	},
	getRandomNumberInRange: function(inMin, inMax) {
		return Math.min(Math.max(Math.round((Math.random() * (inMin + inMax)) - inMin), inMin), inMax);
	},
	getShiftedBits: function(inValue, inStart, inEnd) {
		var base16str = pad(inValue.toString(16), inEnd);
		return base16str.substring(inStart, inEnd);
	},
	toString: function() {
		return this.mStringValue;
	}
});
