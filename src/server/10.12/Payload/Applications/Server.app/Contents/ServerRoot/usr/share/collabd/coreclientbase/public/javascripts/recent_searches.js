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

CC.RecentSearches = Class.createWithSharedInstance('globalRecentSearches');
CC.RecentSearches.prototype = {
	mStackSize: 5,
	mStackName: 'x-apple-wiki-recent-searches',
	initialize: function() {
		globalNotificationCenter().subscribe("AUTHENTICATION_LOGGED_OUT", this.flush.bind(this));
	},
	_stackRepository: function() {
		if (browserSupportsLocalStorage()) {
			var repoStr = window.localStorage.getItem(this.mStackName);
			if (!repoStr || repoStr == 'null') {
				repoStr = Object.toJSON({tags:[], searches:[]});
				window.localStorage.setItem(this.mStackName, repoStr);
			}
			return repoStr.evalJSON();
		}
		return {};
	},
	_addItemToStack: function(inItem, inStackKey, inOptRemoveInstead) {
		if (!browserSupportsLocalStorage()) return false;
		// bail if there's no item (or it's an empty string)
		if (!inItem) return null;
		// bail if we can't get a repo
		var repo = this._stackRepository();
		if (!repo) return false;
		// get the array for the key
		var keyArray = repo[inStackKey];
		// remove the item if there's another instance in the stack
		if (keyArray.indexOf(inItem) >= 0) keyArray.splice(keyArray.indexOf(inItem), 1);
		// reduce it to stackSize-1
		while (keyArray.length >= this.mStackSize) {
			keyArray.pop();
		}
		// add the item to the beginning of the array
		if (!inOptRemoveInstead) keyArray.unshift(inItem);
		window.localStorage.setItem(this.mStackName, Object.toJSON(repo));
		return true;
	},
	_getStack: function(inStackKey) {
		var repo = this._stackRepository();
		return (repo ? repo[inStackKey] : []);
	},
	searchStack: function() {
		return this._getStack('searches');
	},
	addSearchToStack: function(inSearchString) {
		return this._addItemToStack(inSearchString, 'searches');
	},
	removeSearchFromStack: function(inSearchString) {
		return this._addItemToStack(inSearchString, 'searches', true);
	},
	flush: function() {
		if (browserSupportsLocalStorage()) {
			if (window.localStorage.getItem(this.mStackName)) window.localStorage.removeItem(this.mStackName);
		}
	}
};
