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

CC.metaCache = {};
CC.Meta = {};
CC.Meta.NOTIFICATION_DID_REFRESH_META_TAGS = 'NOTIFICATION_DID_REFRESH_META_TAGS';

CC.meta = function(name, inOptForceRecalculate) {
	var cachedValue = CC.metaCache[name];
	if (cachedValue && !inOptForceRecalculate) return cachedValue;
	var node = $$('meta[name='+ name +']').first();
	var val = (node ? node.readAttribute('content') : '');
	CC.metaCache[name] = val;
	return val;
};

CC.metaAsArray = function(name, inOptForceRecalculate) {
	var meta = CC.meta(name, inOptForceRecalculate);
	var result = (meta || "").split(',');
	if (result && result.length == 1 && result[0] == "") return [];
	return result;
};

CC.setMeta = function(name, val) {
	CC.metaCache[name] = val;
	var node = $$('meta[name='+ name +']').first();
	if (node)
		node.writeAttribute('content', val);
	else
	{
		node = document.createElement('meta');
		node.writeAttribute('name', name);
		node.writeAttribute('content', val);
		document.head.appendChild(node);
	}
};

// Theme tag meta helpers.

CC.themeTupleFromMetaTag = function(inOptEntityOwnerOrContainerString) {
	var target = (inOptEntityOwnerOrContainerString || "container");
	var themeParts = new Array(3);
	var containerThemeInfo = (CC.meta("x-apple-%@-themeInfo".fmt(target)) || "");
	var splitContainerThemeInfo = containerThemeInfo.split(',');
	for (var sdx = 0; sdx < splitContainerThemeInfo.length; sdx++) {
		var t = splitContainerThemeInfo[sdx];
		if (t != undefined) {
			themeParts[sdx] = t.strip();
		}
	}
	return themeParts;
};

// Calendar meta helpers.

CC.calendarMetaTagsEnabledForContainer = function() {
	return (CC.meta("x-apple-container-isCalendarEnabled") == "true");
};

// Blog meta helpers.

CC.blogMetaTagsEnabledForContainer = function() {
	var isBlogEnabled = false;
	if (CC.meta('x-apple-owner-type') == 'com.apple.entity.User') {
		isBlogEnabled = (CC.meta("x-apple-owner-isBlogEnabled") == "true");
	}
	else {
		isBlogEnabled = (CC.meta("x-apple-container-isBlogEnabled") == "true");
	}
	return isBlogEnabled;
};
