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

// Breaks a string into an array of tokens.

String.prototype.w = function() {
	var result = [], parts = this.split(' '), length = parts.length;
	for (var idx = 0; idx < length; idx++) {
		var part = parts[idx] ;
		if (part.length !== 0) result.push(part);
	}
	return result;
};

// Returns true if a string is just whitespace.

String.prototype.isWhitespace = function() {
	return this.match(/^[ \t\r\n]+$/);
};

// Substitutes into a string. Borrowed from SproutCore.

String.prototype.fmt = function() {
	var args = arguments;
	var idx  = 0;
	return this.replace(/%@([0-9]+)?/g, function(s, argIndex) {
		argIndex = (argIndex) ? parseInt(argIndex,0) - 1 : idx++;
		s = args[argIndex];
		return ((s === null) ? '(null)' : (s === undefined) ? '' : s).toString(); 
	});
};

// Returns a string with the first character uppercased. We have a seperate method for this
// versus Prototype#capitalize method because Prototype downcases the entire string before
// uppercasing the first character.

String.prototype.capitalizeFirstCharacter = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.trim = function() {
	return this.toString().replace(/^[\s\t\n\r]*|[\s\t\n\r]*$/g,'');
};

// Returns a random string.

var buildRandomString = function(inLength) {
	var result = "";
	var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (var idx = 0; idx < (inLength || 5); idx++) {
		result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
	}
	return result;
};

// Does a string look like a GUID?

var looksLikeGUID = function(inString) {
	return (inString || "").match(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/);
};

// Returns the intersection of an array of strings and a given array of strings (an array of items
// where items exist in both arrays). Accepts an optional inDifferenceInstead flag where the difference
// between the first and second arrays will be returned instead (an array of items in the second
// array but NOT in the first).

var stringArrayIntersection = function(firstArray, secondArray, inDifferenceInstead) {
	var shortestArray = firstArray, longestArray = secondArray;
	if (firstArray.length > secondArray.length) {
		longestArray = firstArray;
		shortestArray = secondArray;
	}
	// If we're building the intersection, loop over the shortest array and build
	// a result of keys that exist in the shortest array and the hash we just built.
	// If we're building the difference, do the opposite.
	var hashingArray = (inDifferenceInstead ? shortestArray : longestArray);
	var hash = {}, idx, length = hashingArray.length;
	for (idx = 0; idx < length; idx++) {
		hash[hashingArray[idx]] = true;
	}
	var loopingArray = shortestArray;
	if (inDifferenceInstead) loopingArray = longestArray;
	var value, length = loopingArray.length, result = [];
	for (idx = 0; idx < length; idx++) {
		value = loopingArray[idx];
		if ((value in hash) && !inDifferenceInstead) {
			result.push(value);
		}
		if (inDifferenceInstead && !(value in hash)) {
			result.push(value);
		}
	}
	return result;
};

var stringArrayDifference = function(firstArray, secondArray) {
	return stringArrayIntersection(firstArray, secondArray, true);
};
