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

// Returns the current set of URL parameters in an Object keyed by parameter name.

CC.params = function(inOptHref) {
	var href = (inOptHref || window.location.href);
	var properties = href.slice(href.indexOf('?') + 1);
	return properties.toQueryParams();
};

// Caches so we don't recalculate URLs over and over.

var __urlTypeFragmentMap = {};
var __entityURLMap = {};
var __entityURLMapMinusTitles = {};

// Maps an entity type (e.g. com.apple.entity.Page) to a lowercase URL component (e.g. pages).

var urlTypeFragmentForEntityType = function(inEntityType) {
	var type = __urlTypeFragmentMap[inEntityType]
	if (!type) {
		var split = (inEntityType || "entities").split('.');
		var lastComponent = split[split.length - 1];
		type = lastComponent = lastComponent.toLowerCase();
		if (type != "entities") {
			var entityType = CC.meta('x-apple-entity-type');
			var isBlogPost = CC.meta('x-apple-entity-isBlogpost') == "true";
			var containerType = CC.meta('x-apple-container-type');
						
			// Pluralize and downcase the last component.
			type += "s";
			if (type == "users") {
				type = "people";
			}
			else if (type == 'wikis') {
				type = 'projects';
			}
			else if (type == 'blogs' && ((entityType == 'com.apple.entity.Page') || (entityType == 'com.apple.entity.File')) && isBlogPost) {
				type = urlTypeFragmentForEntityType(containerType);
			}
		}
		__urlTypeFragmentMap[inEntityType] = type;
	}
	return type;
};

CC.entityURL = function(inEntity, inOptShouldIncludeTitle) {
	var type = inEntity.type;
	var tinyID = inEntity.tinyID;
	var guid = inEntity.guid;
	var login = inEntity.shortName || inEntity.tinyID;
	if (!type || !(tinyID || guid || login)) return undefined;
	var id = (tinyID || guid);
	var subpath = "/wiki";
	type = urlTypeFragmentForEntityType(type);
	if (type == "people") {
		id = login;
	}
	var url = (inOptShouldIncludeTitle ? __entityURLMap[id] : __entityURLMapMinusTitles[id]);
	if (!url) {
		if (inOptShouldIncludeTitle) {
			var title = (inEntity.longName || inEntity.shortName || "Untitled");
			title = title.gsub(/[\s]+/, '_').gsub(/[^\w]+/, '')
			url = __entityURLMap[id] = "%@/%@/%@/%@.html".fmt(subpath, type, id, title);
		} else {
			url = __entityURLMapMinusTitles[id] = "%@/%@/%@".fmt(subpath, type, id);
		}
	}
	return url.escapeHTML();
};

CC.entityURLForTypeAndTinyID = function(inType, inTinyID, inOptTitle) {
	return CC.entityURL({
		'type': inType,
		'tinyID': inTinyID,
		'longName': inOptTitle
	}, (inOptTitle != undefined));
};

CC.entityURLForTypeAndGUID = function(inType, inGUID, inOptTitle) {
	return CC.entityURL({
		'type': inType,
		'guid': inGUID,
		'longName': inOptTitle
	}, (inOptTitle != undefined));
};

// Sniffs a route from the URL hash, expects http://...#route=/wiki/foo/bar.

CC.getRouteFromURLHash = function() {
	var hash = window.location.hash;
	if (hash) {
		var matches = hash.match(/route=(.*)$/);
		if (matches && matches.length && matches[1].startsWith("/")) {
			return matches[1];
		}
	}
};

// Sniffs a route from the URL itself, expects http://.../wiki/foo/bar.

CC.getRouteFromURL= function() {
	var search = window.location.search;
	var href = window.location.pathname + (search != "?" ? search : "");
	return href;
};
