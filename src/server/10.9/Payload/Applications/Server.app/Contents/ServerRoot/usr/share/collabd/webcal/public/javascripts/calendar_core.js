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

function reportError(e, optRealErrorObj) {
	var	errorString = 'Server returned an error: '+e.status+'. Check the console for detailed request/response logs.';
	throw (optRealErrorObj || e);
}
 
function debugMessage(inString) {
	window.console.log(inString);
}

function normalizeUID(inUID) {
	return inUID.replace(/^urn:uuid:|^\/(principals|calendars)\/__uids__\/|\/$/g, '');
}

function compareDateWeeks(inDate1, inDate2, inOptStartWeekday) {
	var dates = new Array();
	var startWeekday = inOptStartWeekday || 0;
	for (i = 0; i < 2; i++) {
		var date = new Date(arguments[i].getTime());
		if (date.getDay() < startWeekday) {
			date.setDate(date.getDate() - 7);
		}
		date.setDate(date.getDate() - (date.getDay() - startWeekday));
		dates.push(date);
	}
	return (parseInt(dateObjToISO8601(dates[0], false, false)) == parseInt(dateObjToISO8601(dates[1], false, false)));
}

function dateToColummNumber(inDate, inStartWeekDayPref) {
    // If inDate is Sunday and inStartWeekDayPref is Monday, ensures result is 6, not -1. <rdar://problem/9580293>
    return (inDate.getDay() - inStartWeekDayPref + 7) %7;
}

Object.extend(String, {
	append: function(inOrig, inNew/*[, delimiter]*/) {
		var delimiter = arguments.length > 2 ? arguments[2] : ' ';
		if (inNew) {
			if (inOrig != '') inOrig += delimiter;
			inOrig += inNew;
		}
		return inOrig;
	},
	appendPathComponent: function(inString, inPathComponent) {
		return inString.replace(/\/$/, '') + '/' + inPathComponent.replace(/^\//, '');
	},
	appendPathExtension: function(inString, inPathExtension) {
		return inString.replace(/\.[^.]+$/, '') + '.' + inPathExtension.replace(/^\./, '');
	},
	addSlash: function(inString) {
		return inString.replace(/([^\/])$/, '$1/');
	},
	removeSlash: function(inString) {
		return inString.replace(/\/+$/, '');
	},
	lastPathComponent: function(inString) {
		return inString.match(/\/([^\/]+)\/*$/)[1];
	},
	format: function(inFormatStr, inDictionary) {
		return $H(inDictionary).inject(inFormatStr, function(str, cur) {
			var r = new RegExp('%\\('+cur.key+'\\)[sdig]', 'gi');
			return str.replace(r, cur.value);
		});
	},
	hexValueForColorString: function(inColorString) {
		var rgbColorMatch = inColorString.match(/rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\s*\)/);
		if (!rgbColorMatch) return inColorString;
		var colorStr = '#';
		for (var colorMatchIdx = 1; colorMatchIdx < 4; colorMatchIdx++) {
			colorStr += padNumberStr(parseInt(rgbColorMatch[colorMatchIdx]).toString(16), 2);
		}
		return colorStr;
	}
});

Object.extend(Element, {
	// childrenWithNodeName and firstChildWithNodeName are used when we're working with a different document, otherwise use Selector
	childrenWithNodeName: function(inParent, inNodeName) {
		var retList = [];
		var children = inParent.childNodes;
		for (var childIdx = 0; childIdx < children.length; childIdx++) {
			if (children.item(childIdx).nodeName == inNodeName) retList.push(children.item(childIdx));
		}
		return retList;
	},
	// Use Selector on this one as well, unless it's a different document. Uses a simple dot-delimited path. No fancy stuff.
	elementWithSimpleXPath: function(inParent, inPath) {
		return $A(inPath.split('.')).inject(inParent, function(currentParent, pathComponent) {
			return currentParent ? Element.firstChildWithNodeName(currentParent, pathComponent) : null;
		});
	},
	firstChildWithNodeName: function(inParent, inNodeName) {
		var children = inParent.childNodes;
		for (childIdx = 0; childIdx < inParent.childNodes.length; childIdx++) {
			if (children.item(childIdx).nodeName == inNodeName) return children.item(childIdx);
		}
		return null;
	},
	firstNodeValue: function(inElement) {
		var elm = (inElement && inElement.constructor == String) ? $(inElement) : inElement;
		if (elm && elm.firstChild) return elm.firstChild.nodeValue || '';
		return '';
	}
});

Object.extend(Array, {
	// Sort an array of dictionaries.
	sortArrayUsingKey: function(inArray, inKey) {
		var sortCallback = function(a, b) {
			if (!(a[inKey])) return 0;
			if (a[inKey] > b[inKey]) return 1;
			else if (a[inKey] < b[inKey]) return -1;
			return 0;
		}
		return inArray.sort(sortCallback);
	},
	removeDuplicateRows: function(inArray, inOptPreferenceTest) {
		// Use the UID key to check for duplicate rows.
		var keyedArray = inArray.clone();
		for (var rowIdx = 0; rowIdx < keyedArray.length; rowIdx++) {
			var row = keyedArray[rowIdx];
			if (!row.uid) continue;
			// check for duplicates
			if (keyedArray[row.uid]) {
				keyedArray.splice(rowIdx--, 1);
				// if the preference test returns true, substitute the later occurrence for the earlier one
				if (inOptPreferenceTest && inOptPreferenceTest(keyedArray[row.uid], row)) {
					var earlierIndex = keyedArray.indexOf(keyedArray[row.uid]);
					keyedArray.splice(earlierIndex, 1, row);
				}
			}
			keyedArray[row.uid] = row;
		}
		return keyedArray.clone();
	}
});


/**
 * Position.clone() will merrily open dialogs above the document fold; this version of the method stops that behavior
 */

Position.super__clone = Position.clone;
Position.ieCompatibleClone = function(source, target /*, options*/) {
	// if not Internet Explorer, immediately fall back to Prototype's method
	var options = Object.extend({setLeft:true, setTop:true, setWidth:true, setHeight:true, offsetTop:0, offsetLeft:0}, arguments[2] || { });
	if (!browser().isIE) return Position.super__clone(source, target, options);
	// if we're not a direct descendant of the body tag, also fall back to Prototype
	var targetElm = $(target);
	if (targetElm.parentNode != document.body) return Position.super__clone(source, target, options);
	// okay, here's where IE starts causing trouble. There's no style element on the parent tag. Good news is: cloning is simpler
	var p = $(source).viewportOffset();
	targetElm.style.position = 'absolute';
	if (options.setLeft) targetElm.style.left = (p[0]-document.body.offsetLeft+options.offsetLeft)+'px';
	if (options.setTop) targetElm.style.top = (p[1]-document.body.offsetTop+options.offsetTop)+'px';
	if (options.setWidth) targetElm.style.width = $(source).offsetWidth+'px';
	if (options.setHeight) targetElm.style.height = $(source).offsetHeight+'px';
}
Position.clone = function(source, target) {
	var options = arguments[2] || {};
	if (!options.limitWithScrollbars) return Position.ieCompatibleClone(source, target, options);
	var scrolledParent = null;
	var elm = source;
	// if we're in an iframe, use the iframe as the scrolled parent
	if (elm.ownerDocument && (elm.ownerDocument != document) && elm.ownerDocument.defaultView) {
		scrolledParent = elm.ownerDocument.defaultView.frameElement;
	}
	// iterate through the document hierarchy, looking for something that's been scrolled
	while (!scrolledParent && elm && elm.parentNode && (elm.nodeName.toLowerCase() != 'body')) {
		if (elm.scrollTop && elm.scrollTop > 0) {
			scrolledParent = elm;
		}
		else {
			elm = elm.parentNode;
		}
	};
	// if we didn't find a scrolled parent, use the original Position.clone() method
	if (!scrolledParent) return Position.ieCompatibleClone(source, target, options);
	// otherwise, get the top of the scrolled element
	var parentTop = Element.getTop(scrolledParent);
	Position.ieCompatibleClone(source, target, options);
	// if we're higher than the scrolled element, match the scrolled element's height
	if (parseFloat(target.style.top) < parentTop) target.style.top = parentTop+'px';
}

Object.extend(Array, {
	syncKeyedArrayWithRows: function(inKeyedArray, inRows, inOptCopyKeys, inOptDeletePrefix) {
		var copyKeys = inOptCopyKeys || $A([]);
		var syncStatus = {deletedRows:Object.extend({}, inKeyedArray), updatedRows:[], addedRows:[]};
		// iterate through each of the new rows...
		for (var rowIdx = 0; rowIdx < inRows.length; rowIdx++) {
			var row = inRows[rowIdx];
			if (!row.uid) continue;
			// updated
			if (inKeyedArray[row.uid]) {
				delete syncStatus.deletedRows[row.uid];
				syncStatus.updatedRows.push(row);
				for (var i = 0; i < copyKeys.length; i++) {
					row[copyKeys[i]] = inKeyedArray[row.uid][copyKeys[i]];
				}
			}
			// added
			else {
				syncStatus.addedRows.push(row);
			}
			// now set the value
			inKeyedArray[row.uid] = row;
		}
		// anything that's left is deleted
		var deletedKeys = $H(syncStatus.deletedRows).keys();
		syncStatus.deletedRows = $A([]);
		for (var i = 0; i < deletedKeys.length; i++) {
			if (!inOptDeletePrefix || deletedKeys[i].indexOf(inOptDeletePrefix) >= 0) {
				syncStatus.deletedRows.push(inKeyedArray[deletedKeys[i]]);
				delete inKeyedArray[deletedKeys[i]];
			}
		}
		return syncStatus;
	}
});

Object.extend(Form, {
	getIntValue: function(inFieldElement) {
		var val = parseInt($(inFieldElement).value);
		return (isNaN(val) ? 0 : val);
	},
	setSelectValue: function(inSelectElement, inValue, inOptDefaultIdx) {
		var defaultIdx = inOptDefaultIdx || 0;
		var elm = $(inSelectElement);
		elm.options[defaultIdx].selected = true;
		if (!inValue) return;
		for (var optionIdx = 0; optionIdx < elm.options.length; optionIdx++) {
			if (elm.options[optionIdx].value == inValue) {
				elm.options[optionIdx].selected = true;
				return;
			}
		}
	}
});

Object.extend(Form.Element.Serializers, {
	textarea: function(element) {
		return Element.hasClassName('hinted') ? '' : element.value;
	}
});


Object.extend(PeriodicalExecuter.prototype, {
	start: function()
	{
		if (this.timer) this.stop();
		this.registerCallback();
	}
});

// 6929125

function niftyDateHack(inMessage, inObject, inUserInfo)
{
	if (!inObject) return;
	var dt = new Date(inObject.mShownDate.getTime());
	dt.setMonth(dt.getMonth() + 1);
	inObject.setShownDate(dt);
	dt.setMonth(dt.getMonth() - 1);
	inObject.setShownDate(dt);
}

// 7123406
function removeTime(inDate) {
	//truncate the string at the first T
	if (!inDate) return;
	var indexT = inDate.indexOf('T');
	if (indexT > 0) return inDate.substr(0,indexT);
	else return inDate;
}

function getHoursForDuration(inDuration) {
	var hours = inDuration.hours || 0;
	if (inDuration.minutes) hours += (inDuration.minutes/60);
	if (inDuration.days) hours += (inDuration.days*24);
	return (hours == 0 ? null : hours);
}

function getDurationForHours(inHours) {
	var duration = {hours:Math.floor(inHours)};
	var r = inHours - duration.hours;
	if (r > 0) duration.minutes = Math.floor(60 * r);
	return duration;
}
