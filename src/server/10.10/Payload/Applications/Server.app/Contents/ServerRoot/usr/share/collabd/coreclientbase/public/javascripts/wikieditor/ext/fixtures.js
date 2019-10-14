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

// Zero-pads a given number up to a supplied length (defaults to 3)
// and returns the result as a string, e.g. pad(13, 3) = "013".
// Handy for building random guids in fixture data.

var pad = function(x, length) {
	var val = "" + x;
	while (val.length < (length || 3)) {
		val = "0" + val;
	}
	return val;
}

// Returns a random integer between 0 and the supplied limit (returns
// 0 or 1 by default).

var randomInt = function(limit) {
	return Math.floor(Math.random() * (limit || 2));
}
