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
;
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

// Global variables
var gAnimate = true;
var gDoubleClickDelay = 300; // .3 sec

var TooltipManager = Class.createWithSharedInstance('tooltipManager');
TooltipManager.prototype = {
	mShowTimeout: 2000,
	mHideTimeout: 20000,
	mEnabled: true,
	initialize: function() {
		bindEventListeners(this, ['handleMouseDown', 'handleMouseOver', 'handleMouseOut']);
	},
	show: function(inElement, inValues) {
		this.mElement = $(inElement);
		var prefix = this.mElement.id+'_';
		this.mPopulatedKeys = [];
		for (var key in inValues) {
			if ($(prefix+key)) {
				this.mPopulatedKeys.push(prefix+key);
				replaceElementContents(prefix+key, (inValues[key].constructor == Function ? inValues[key]() : inValues[key]) || '');
			}
		}
		this.mElement.style.visibility = 'hidden';
		Element.show(inElement);
		var leftPos = Math.min(this.mPos[0], d.viewport.getWidth()-this.mElement.offsetWidth-8);
		var topPos = Math.min(this.mPos[1], d.viewport.getHeight()-this.mElement.offsetHeight-8);
		Element.hide(inElement);
		Element.setStyle(inElement, {
			left:leftPos+'px', 
			top:topPos+'px',
			visibility:''
		});
		this.mEffect = new Effect.Appear(inElement, {duration:0.5});
		if (this.mTimer) clearTimeout(this.mTimer);
		this.mTimer = setTimeout(this.hide.bind(this), this.mHideTimeout);
		observeEvents(this, d, {mousedown:'handleMouseDown'});
	},
	hide: function(/*[inFade]*/) {
		// after we hide the tooltip, clear its values
		var afterFinish = function() {
			this.mPopulatedKeys.each(function(key) {
				replaceElementContents(key, "\u00A0");
			});
		}.bind(this);
		var inFade = (arguments.length > 0 ? arguments[0] : gAnimate);
		Event.stopObserving(d, 'mousedown', this.handleMouseDown);
		if (this.mActiveElement) Event.stopObserving(this.mActiveElement, 'mouseout', this.handleMouseOut);
		this.mActiveElement = null;
		if (this.mEffect) this.mEffect.cancel();
		if (inFade && this.mElement) {
			this.mEffect = new Effect.Fade(this.mElement, {from:0.9, afterFinish:afterFinish});
		}
		else if (this.mElement) {
			Element.hide(this.mElement);
			afterFinish();
		}
		if (this.mTimer) clearTimeout(this.mTimer);
		this.mTimer = null;
	},
	handleMouseDown: function(e) {
		this.mActiveElement = null;
		if (this.mTimer) clearTimeout(this.mTimer);
		this.hide(false)
	},
	handleMouseOver: function(e) {
		if (this.mEnabled) {
			this.mPos = new Array(Event.pointerX(e)+2, Event.pointerY(e)+10);
			this.mActiveElement = Event.element(e);
			while (this.mActiveElement.parentNode && !this.mActiveElement.tooltipElement) {
				this.mActiveElement = $(this.mActiveElement.parentNode);
			}
			if (this.mTimer) clearTimeout(this.mTimer);
			this.mTimer = setTimeout(this.getValues.bind(this), this.mShowTimeout);
			observeEvents(this, this.mActiveElement, {mouseout:'handleMouseOut'});
		}
	},
	handleMouseOut: function(e) {
		if (this.mTimer) clearTimeout(this.mTimer);
		try {
			this.hide(false)
		}
		catch(e) {
			// could happen on page unload, so the hide could be totally bogus
		}
	},
	observe: function(inElement) {
		observeEvents(this, inElement, {mouseover:'handleMouseOver'});
	},
	stopObserving: function(inElement) {
		if (this.mActiveElement == inElement) {
			this.hide(false);
			if (this.mTimer) clearTimeout(this.mTimer);
			this.mTimer = null;
			this.mActiveElement = null;
		}
		Event.stopObserving(inElement, 'mouseover', this.handleMouseOver);
	},
	getValues: function() {
		if (this.mActiveElement && this.mActiveElement.tooltipValues) {
			this.show(this.mActiveElement.tooltipElement, this.mActiveElement.tooltipValues);
		}
		else if (this.mActiveElement && this.mActiveElement.tooltipCallback) {
			this.mActiveElement.tooltipCallback(this.mActiveElement);
		}
	}
}

var NiftyDatePicker = Class.create();
NiftyDatePicker.prototype = {
	mSelectedDate: new Date(),
	mShownDate: new Date(),
	mDateLinks: $A([]),
	mStartWeekday: 0, // sunday
	mEnabled: true,
	initialize: function(/*[options]*/) {
		bindEventListeners(this, ['handleParentElementClick', 'handleWindowClick', 'handleMonthSkipButtonClick', 'handleDateCellClick']);
		this.mParentDateFormat = '_Dates.DateFormats.MediumDate'.loc();
		// extend self based on any passed-in options
		if (arguments.length > 0) Object.extend(this, arguments[0]);
		// remember the parent element or create one if necessary
		if (this.mElement) this.mElement = $(this.mElement);
		if (!this.mElement) {
			this.mElement = Builder.node('div', {className:'niftydate_popup', style:'visibility:hidden'});
			d.body.appendChild(this.mElement);
		}
		// set up an ID so we can use $$ notation
		if (!this.mElement.id) {
			this.mElement.id = 'niftydate_' + Math.floor(Math.random() * 1000000);
		}
		Element.addClassName(this.mElement, 'niftydate');
		// draw the month header
		replaceElementContents(this.mElement, Builder.node('h2', [
			Builder.node('a', {href:'#', className:'niftydate_prev_month'}, '<'),
			Builder.node('span', {className:'niftydate_header'}, this.mShownDate.formatDate('_Dates.DateFormats.LongMonthAndYear'.loc())),
			Builder.node('a', {href:'#', className:'niftydate_next_month'}, '>')
		]));
		// create the element for the weekday headers
		var calendarHeaderElm = Builder.node('ul', {className:'niftydate_headers'});
		this.mElement.appendChild(calendarHeaderElm);
		for (var i = 0; i < 7; i++) {
			calendarHeaderElm.appendChild(Builder.node('li', "\u00A0"));
		}
		this.drawWeekdayHeaders();
		// set up a BlockSpacer to fill the width
		this.mHeaderBlockSpacer = new BlockSpacer(calendarHeaderElm, this.mElement);
		// add the month view
		var calendarDaysElm = Builder.node('ul', {className:'niftydate_days'});
		for (var weekday = 0; weekday < 7; weekday++) {
			calendarDaysElm.appendChild(Builder.node('li', {className:(weekday==0?'niftydate_column niftydate_first_column':'niftydate_column')}));
		}
		this.mElement.appendChild(calendarDaysElm);
		// update the date cells
		this.setShownDate(this.mShownDate);
		// set up a BlockSpacer for the calendar
		this.mCellBlockSpacer = new BlockSpacer(calendarDaysElm, this.mElement);
		// copy the first cell's width to each cell's height
		var width = calendarDaysElm.down('ul').offsetWidth;
		$$('#'+this.mElement.id+' ul.niftydate_days ul li').each(function(li) {
			li.style.lineHeight = width+'px';
		});
		// hide the next and previous month cells
		$$('#'+this.mElement.id+' .niftydate_prev_month_cells').invoke('hide');
		$$('#'+this.mElement.id+' .niftydate_next_month_cells').invoke('hide');
		// hook up the next/prev month links
		Event.observe(this.mElement.down('a.niftydate_prev_month'), 'click', this.handleMonthSkipButtonClick);
		Event.observe(this.mElement.down('a.niftydate_next_month'), 'click', this.handleMonthSkipButtonClick);
		// hook up the parent element
		if (this.mParentElement) Event.observe(this.mParentElement, 'click', this.handleParentElementClick);
		// set the parent element's text
		if (this.mParentElement) replaceElementContents(this.mParentElement, this.mSelectedDate.formatDate(this.mParentDateFormat));
		// watch for other date pickers being shown
		globalNotificationCenter().subscribe('DATE_PICKER_SHOWN', this.handleOtherDatePickerShown.bind(this));
	},
	drawWeekdayHeaders: function() {
		var calendarHeaderElm = this.mElement.down('ul.niftydate_headers');
		$$('#'+this.mElement.id+' ul.niftydate_headers li').each(function(li, i) {
			replaceElementContents(li, '_Dates.Weekdays'.loc().split(',')[(this.mStartWeekday + i) % 7]);
		}, this);
	},
	handleParentElementClick: function(inEvent) {
		Event.stop(inEvent);
		this.show();
		return false;
	},
	handleWindowClick: function(inEvent) {
		if (!Position.within(this.mElement, Event.pointerX(inEvent), Event.pointerY(inEvent))) this.hide();
	},
	handleOtherDatePickerShown: function(inMessage, inObject, inUserInfo) {
		if (inObject != this) this.hide();
	},
	show: function() {
		if (!this.mParentElement) return;
		Position.clone(this.mParentElement, this.mElement, {setWidth:false, setHeight:false});
		Element.show(this.mElement);
		this.mElement.style.visibility = '';
		// watch for clicks outside of the date picker
		Event.observe(window, 'click', this.handleWindowClick);
		globalNotificationCenter().publish('DATE_PICKER_SHOWN', this);
	},
	hide: function() {
		if (!this.mParentElement) return;
		Event.stopObserving(window, 'click', this.handleWindowClick);
		Element.hide(this.mElement);
	},
	setShownDate: function(inNewShownDate) {
		// copy the date object
		var dt = new Date(inNewShownDate.getTime());
		// set it to the first displayed date of the month
		dt.setDate(1);
		dt.setDate(1 - (dt.getDay() - this.mStartWeekday));
		// sanity check; if we've ended up too late, move back a week
		if (1 < dt.getDate() && dt.getDate() < 8) {
			dt.setDate(dt.getDate() - 7);
		}
		// figure out what height to use for the cells
		var cellHeight = $$('#'+this.mElement.id+' ul.niftydate_days li')[0].offsetWidth;
		if (cellHeight == 0) cellHeight = $$('#'+this.mElement.id+' ul.niftydate_headers li')[0].offsetWidth;
		if (cellHeight == 0 && $$('#'+this.mElement.id+' ul.niftydate_headers li')[0].style.width) cellHeight = parseInt($$('#'+this.mElement.id+' ul.niftydate_headers li')[0].style.width, 10);
		// find out if this is the first setup
		var isFirstSetup = $$('#'+this.mElement.id+' ul.niftydate_days li ul').length <= 0;
		// are we viewing an earlier or a later month?
		var direction = (inNewShownDate > this.mShownDate) ? 1 : (-1);
		// get rid of the old lists
		$$('#'+this.mElement.id+' li.niftydate_column ul').invoke('remove');
		// build the new lists (vertical orientation)
		var columns = $$('#'+this.mElement.id+' li.niftydate_column');
		var dateLists = $R(0, 6).collect(function(i) {
			var ul = Builder.node('ul');
			columns[i].appendChild(ul);
			return ul;
		});
		// today's date (for highlighting today)
		var now = new Date();
		var todayDateISO = parseInt(dateObjToISO8601(now));
		var selectedDateISO = parseInt(dateObjToISO8601(this.mSelectedDate));
		// populate the lists with date cells
		for (var i = 0; i < (7*6); i++) {
			var dtISO = parseInt(dateObjToISO8601(dt));
			var li = Builder.node('li', {style:'line-height:'+cellHeight+'px'}, [
				Builder.node('a', {href:'#', className:'niftydate_datecell_'+dtISO}, ''+dt.getDate())
			]);
			// set up the link
			Event.observe(li.down('a'), 'click', this.handleDateCellClick);
			// dim if from another month
			if (dt.getMonth() != inNewShownDate.getMonth()) {
				Element.addClassName(li, 'niftydate_other_month')
			}
			// highlight if today
			else if (dtISO == todayDateISO) {
				Element.addClassName(li, (dtISO == selectedDateISO ? 'niftydate_today_selected_date' : 'niftydate_today'));
			}
			// highlight if selected date
			else if (dtISO == selectedDateISO) {
				Element.addClassName(li, 'niftydate_selected_date');
			}
			// highlight the selected week
			else if (compareDateWeeks(dt, this.mSelectedDate, this.mStartWeekday)) {
				Element.addClassName(li, 'niftydate_selected_week');
			}
			// add the cell
			dateLists[i % 7].appendChild(li);
			dt.setDate(dt.getDate() + 1); // increment the date
		}
		// update the stored date
		this.mShownDate = inNewShownDate;
		// update the header
		replaceElementContents(this.mElement.down('span.niftydate_header'), this.mShownDate.formatDate('_Dates.DateFormats.LongMonthAndYear'.loc()));
		// update the cached list of the date links
		this.mDateLinks = $$('#'+this.mElement.id+' ul.niftydate_days a');
	},
	setSelectedDate: function(inNewSelectedDate, inOptShouldNotify) {
		var shouldNotify = (inOptShouldNotify != undefined) ? inOptShouldNotify : true;
		globalNotificationCenter().publish('SELECTED_DATE_WILL_CHANGE', this);
		// if no arg is passed, simply send a changed message
		if (!inNewSelectedDate) {
			this.mWeekStartDate = new Date(this.mSelectedDate.getTime());
			this.mWeekStartDate.setDate(this.mWeekStartDate.getDate() - (this.mWeekStartDate.getDay() - this.mStartWeekday));
			// ##6732473
			if (parseInt(dateObjToISO8601(this.mWeekStartDate)) > parseInt(dateObjToISO8601(this.mSelectedDate))) {
				this.mWeekStartDate.setDate(this.mWeekStartDate.getDate() - 7);
			}
			if (shouldNotify) globalNotificationCenter().publish('SELECTED_DATE_CHANGED', this, {selectedDate:this.mSelectedDate, weekStartDate:this.mWeekStartDate, oldSelectedDate:this.mSelectedDate});
			return;
		}
		// if the month has changed, update the calendar
		if (inNewSelectedDate.getYear() != this.mShownDate.getYear() || inNewSelectedDate.getMonth() != this.mShownDate.getMonth()) {
			this.mSelectedDate = inNewSelectedDate;
			this.setShownDate(new Date(inNewSelectedDate.getTime()));
		}
		// today's date (for highlighting today)
		var now = new Date();
		var todayDateISO = parseInt(dateObjToISO8601(now));
		var selectedDateISO = parseInt(dateObjToISO8601(inNewSelectedDate));
		var startWeekday = this.mStartWeekday;
		// iterate each of the date links
		this.mDateLinks.each(function(a) {
			// date is stashed away in a CSS class in the link, in ISO format (minus time)
			var dtISO = a.className.match(/niftydate_datecell_(\d{8})/)[1];
			// translate the 8-digit date code to a JavaScript date
			var dt = createDateObjFromISO8601(dtISO);
			// we'll be working primarily with the enclosing list item
			var li = a.up('li');
			// first, clear all classes
			li.className = '';
			// dim if from another month
			if (dt.getMonth() != inNewSelectedDate.getMonth()) {
				Element.addClassName(li, 'niftydate_other_month')
			}
			// highlight if today
			else if (dtISO == todayDateISO) {
				Element.addClassName(li, (dtISO == selectedDateISO ? 'niftydate_today_selected_date' : 'niftydate_today'));
			}
			// highlight if selected date
			else if (dtISO == selectedDateISO) {
				Element.addClassName(li, 'niftydate_selected_date');
			}
			// highlight the selected week
			else if (compareDateWeeks(dt, inNewSelectedDate, startWeekday)) {
				Element.addClassName(li, 'niftydate_selected_week');
			}
		});
		// stash away the selected date
		var oldSelectedDate = this.mSelectedDate;
		this.mSelectedDate = inNewSelectedDate;
		this.mShownDate = inNewSelectedDate;
		// set the parent element's text
		if (this.mParentElement) replaceElementContents(this.mParentElement, inNewSelectedDate.formatDate(this.mParentDateFormat));
		// notify others that our date changed
		this.mWeekStartDate = new Date(inNewSelectedDate.getTime());
		this.mWeekStartDate.setDate(this.mWeekStartDate.getDate() - (this.mWeekStartDate.getDay() - this.mStartWeekday));
		if (this.mWeekStartDate > inNewSelectedDate) {
			this.mWeekStartDate.setDate(this.mWeekStartDate.getDate() - 7);
		}
		if (shouldNotify) globalNotificationCenter().publish('SELECTED_DATE_CHANGED', this, {selectedDate:new Date(this.mSelectedDate.getTime()), weekStartDate:this.mWeekStartDate, oldSelectedDate:oldSelectedDate});
	},
	setStartWeekday: function(inWeekdayInt) {
		this.mStartWeekday = inWeekdayInt;
		this.drawWeekdayHeaders();
		this.setShownDate(new Date(this.mShownDate.getTime()));
	},
	handleMonthSkipButtonClick: function(inEvent) {
		Event.stop(inEvent);
		var direction = Element.hasClassName(Event.findElement(inEvent, 'a'), 'niftydate_prev_month') ? (-1) : 1;
		var dt = new Date(this.mShownDate.getTime());
		//this.mShownDate.setMonth(this.mShownDate.getMonth() + direction);
		dt.setMonth(dt.getMonth() + direction);
		this.setShownDate(dt);
		return false;
	},
	handleDateCellClick: function(inEvent) {
		Event.stop(inEvent);
		var elm = Event.findElement(inEvent, 'a');
		// date is stashed away in a CSS class in the link, in ISO format (minus time)
		var dtISO = elm.className.match(/niftydate_datecell_(\d{8})/)[1];
		// translate the 8-digit date code to a JavaScript date
		var dt = createDateObjFromISO8601(dtISO);
		//alert('clicked '+ dt);
		this.setSelectedDate(dt);
		this.hide();
		return false;
	},
	enableParentElement: function() {
		if (this.mParentElement) Event.observe(this.mParentElement, 'click', this.handleParentElementClick);
		$(this.mParentElement).removeClassName('disabled');
		this.mEnabled = true;
	},
	disableParentElement: function() {
		if (this.mParentElement) Event.stopObserving(this.mParentElement, 'click', this.handleParentElementClick);
		$(this.mParentElement).addClassName('disabled');
		this.mEnabled = false;
	}
}

/* Spaces blocks, horizontally or vertically, to evenly fill the offset parent
   inParent can be either an element or another BlockSpacer. */
var BlockSpacer = Class.create();
BlockSpacer.prototype = {
	initialize: function(inElement, inParent, inOptVertical) {
		this.mElement = $(inElement);
		this.mParent = inParent.mElement ? inParent : $(inParent);
		this.mVertical = inOptVertical;
		Element.cleanWhitespace(this.mElement);
		this.zoomOut();
	},
	space: function(inOptTotalSize) {
		if (!this.mElement.offsetParent || (browser().isIE && this.mElement.offsetWidth == 0 && this.mElement.offsetHeight == 0)) {
			return false; // offscreen view; bail!
		}
		// if the parent is another BlockSpacer, space these to match
		if (this.mParent.mElement) {
			if (!this.mParent.mSpacedBlocks) {
				return false; // parent has never been spaced!
			}
			if (this.mVertical) {
				Element.setOffsetHeight(this.mElement, this.mParent.mElement.offsetHeight);
			}
			else {
				Element.setOffsetWidth(this.mElement, this.mParent.mElement.offsetWidth);
			}
			var nodes = $A(this.mParent.mElement.childNodes);
			if (nodes.length != this.mParent.mElement.childNodes.length) return false; // sanity check
			$A(this.mElement.childNodes).each(function(elm, i) {
				if (nodes[i]) {
					if (!Element.visible(nodes[i])) {
						Element.hide(elm);
					}
					else if (this.mVertical) {
						Element.show(elm);
						Element.setOffsetHeight(elm, nodes[i].offsetHeight);
					}
					else {
						Element.show(elm);
						Element.setOffsetWidth(elm, nodes[i].offsetWidth);
					}
				}
			}.bind(this));
			return true;
		}
		// cache the blocks so we don't have to troll the DOM every time
		if (!this.mSpacedBlocks) {
			this.mSpacedBlocks = [];
			this.mSkippedBlocks = [];
			$A(this.mElement.childNodes).each(function(elm) {
				if (elm.className && Element.hasClassName(elm, 'use_content_size')) {
					this.mSkippedBlocks.push(elm);
				}
				else if (elm.nodeName.toLowerCase() == 'li' || elm.nodeName.toLowerCase() == 'div') {
					this.mSpacedBlocks.push(elm);
				}
			}.bind(this));
		}
		// get the position of the first block
		var pos = 0;
		if (this.mVertical) {
			pos = Element.getTop(this.mElement, this.mParent);
		}
		else {
			pos = Element.getLeft(this.mElement, this.mParent);
		}
		// get the total expected size of all of the blocks
		var parentSize = this.mParent[this.mVertical?'offsetHeight':'offsetWidth'];
		var totalSize = inOptTotalSize ? inOptTotalSize : (parentSize - pos);
		// set the parent element's size
		if (!inOptTotalSize) this.mElement.style[this.mVertical?'height':'width'] = (totalSize+2)+'px';
		// subtract the size of the skipped blocks from the expected total
		this.mSkippedBlocks.each(function(elm) {
			totalSize -= elm[this.mVertical?'offsetHeight':'offsetWidth'];
		}.bind(this));
		if (this.mZoomedItem >= 0) {
			this.mSpacedBlocks.each(function(elm, i) {
				if (i == this.mZoomedItem) {
					elm.style.display = '';
					if (this.mVertical) {
						Element.setOffsetHeight(elm, totalSize);
					}
					else {
						Element.setOffsetWidth(elm, totalSize);
					}
				}
				else {
					elm.style.display = 'none';
				}
			}.bind(this));
			return true;
		}
		// get the sizes of the blocks
		var columnSize = Math.floor(totalSize / this.mSpacedBlocks.length);
		var remainder = totalSize % this.mSpacedBlocks.length;
		var r = remainder;
		// now, space the blocks
		this.mSpacedBlocks.each(function(elm) {
			var w = columnSize;
			if (r > 0) {
				w++;
				r--;
			}
			if (this.mVertical) {
				Element.setOffsetHeight(elm, w);
			}
			else {
				Element.setOffsetWidth(elm, w);
			}
		}.bind(this));
		// if any items have wrapped because the browser lied to us, shrink the column size
		if ((!this.mVertical) && totalSize > 100 && Math.abs(this.mSpacedBlocks[0].offsetTop - this.mSpacedBlocks.last().offsetTop) > 10) {
			this.space(--totalSize);
		}
		return true;
	},
	zoomInOnItem: function(inItemIndex) {
		this.mZoomedItem = inItemIndex;
		this.space();
	},
	zoomOut: function() {
		if (this.mSpacedBlocks) this.mSpacedBlocks.invoke('setStyle', {display:''});
		this.mZoomedItem = (-1);
		this.space();
	}
}



var SearchFieldBase = Class.create();
SearchFieldBase.prototype = {
	mClickedItemCallback: null,
	mStartedItemSearchCallback: null,
	mSearchCancelledCallback: null,
	mResultTable: null,
	mPositionResults: true,
	mHeaderElement: null,
	mMinQueryChars: 1,
	mInterval: 500,
	mNumberOfEntries: 20,
	mSortKey: null,
	mTrapTabs: true,
	mShowPlaceholderStrings: false,
	mCaptureReturnChar: true,
	mSelectOnClick: true,
	initialize: function(inSearchField/*[, options]*/) {
		bindEventListeners(this, ['handleSafariSearch', 'handleKeypress', 'handleChanged', 'mousedOverUser', 'mousedOutUser', 'clickedUser']);
		this.mSearchField = $(inSearchField);
		if (arguments.length > 1) Object.extend(this, arguments[1]);
		if (!this.mResultTable) {
			this.mResultTable = Builder.node('table', {className:'search_field_results', style:'display:none'}, [
				Builder.node('tbody')
			]);
			d.body.appendChild(this.mResultTable);
		}
		this.mIsReallyTable = (this.mResultTable.nodeName.toLowerCase() == 'table');
		observeEvents(this, this.mSearchField, {keydown:'handleKeypress', change:'handleChanged'});
		if (browser().isWebKit() && (this.mSearchField.type == 'search')) Event.observe(this.mSearchField, 'search', this.handleSafariSearch);
	},
	handleSafariSearch: function(e) {
		if (Event.element(e).value == '') this.runQuery(); // handle "x" button in search fields
	},
	handleKeypress: function(e) {
		switch (e.keyCode) {
			case Event.KEY_DOWN:
				this.suggestSibling('nextSibling');
				Event.stop(e);
				break;
			case Event.KEY_UP:
				this.suggestSibling('previousSibling');
				Event.stop(e);
				break;
			case Event.KEY_TAB:
			case Event.KEY_RETURN:
			case 188: // comma
				if (e.keyCode == Event.KEY_TAB && this.mSearchField.value == '') return true;
				if (e.keyCode == Event.KEY_RETURN && !this.mCaptureReturnChar) return true;
				this.handleChanged(e);
				if (e.keyCode == 188 || this.mTrapTabs) Event.stop(e);
				break;
			case Event.KEY_ESC:
				this.mSearchField.value = '';
				this.mLastQuery = null;
				this.mRows = null;
				if (this.mSearchCancelledCallback) this.mSearchCancelledCallback();
				break;
			default:
				if (!this.mTimer) this.mTimer = setTimeout(this.runQuery.bind(this), this.mInterval);
		}
	},
	handleChanged: function(e) {
		if (this.mSearchField.value != '') {
			this.selectSuggestedUID();
			Element.hide(this.mResultTable); // ##6410526
		}
	},
	suggestSibling: function(inKey) { // key = 'nextSibling' or 'previousSibling'
		var elm = $(this.mResultTable.id+'_'+(this.mSuggestedUID||''));
		if (elm && elm.parentNode[inKey]) {
			this.suggestUID(elm.parentNode[inKey].firstChild.dataSource.uid);
		}
		else if ((!elm) && inKey == "nextSibling" && this.mRows && this.mRows.length > 0) {
			this.suggestUID(this.mRows[0].uid);
		}
		// If we're at the first node, and we're keying up, deselect
		// the first item in the list and focus the input field.
		else if (inKey == 'previousSibling' && this.mSuggestedUID == this.mRows[0].uid) {
			this.suggestUID(null);
		}
	},
	suggestUID: function(inUID) {
		Element.removeClassName(this.mResultTable.id+'_'+this.mSuggestedUID, 'suggested');
		this.mSuggestedUID = inUID;
		if (inUID) Element.addClassName(this.mResultTable.id+'_'+inUID, 'suggested');
	},
	selectSuggestedUID: function() {
		this.mChosenUID = this.mSuggestedUID;
		if (this.mChosenUID) {
			var chosenElm = $(this.mResultTable.id+'_'+this.mChosenUID);
			this.mChosenDataSource = chosenElm.dataSource;
			if (this.mPositionResults) {
				Element.hide(this.mResultTable);
				this.mSearchField.value = chosenElm.firstChild.nodeValue;
			}
			if (this.mClickedItemCallback) this.mClickedItemCallback(this.mChosenUID, this.mChosenDataSource.url);
		}
		else if (!Element.hasClassName(this.mSearchField, 'hinted')) {
			if (this.mClickedItemCallback) this.mClickedItemCallback($F(this.mSearchField), null);
		}
		if (this.mTimer) {
			clearTimeout(this.mTimer);
			this.mTimer = null;
		}
	},
	mousedOverUser: function(e) {
		if (this.mSelectOnClick) this.suggestUID(Event.findElement(e, (this.mIsReallyTable?'td':'a')).dataSource.uid);
	},
	mousedOutUser: function(e) {
		// superclass does nothing
	},
	clickedUser: function(e) {
		this.suggestUID(Event.findElement(e, (this.mIsReallyTable?'td':'a')).dataSource.uid);
		if (this.mSelectOnClick) this.selectSuggestedUID();
	},
	constructQuery: function(inSearchString) {
		// subclasses should over-ride
	},
	runQuery: function() {
		if ($F(this.mSearchField) != this.mLastQuery) {
			this.mSuggestedUID = null;
			this.mRows = new Array();
			this.draw();
			if (this.mShowPlaceholderStrings) {
				// NOTE: not bothering with table code here because we don't use placeholder strings for tables
				replaceElementContents(this.mResultTable, Builder.node('li', {className:'search_placeholder busy_field'}, [Builder.node('a', {href:'#', onclick:invalidate}, '_Dialogs.LinkSearch.Progress.Searching'.loc())]));
			}
			if (this.mPrefetch || ($F(this.mSearchField).length >= this.mMinQueryChars)) {
				Element.addClassName(this.mSearchField, 'busy_field');
				if (this.mStartedItemSearchCallback) this.mStartedItemSearchCallback();
				this.constructQuery($F(this.mSearchField));
			}
			else {
				this.mTimer = null;
				if (this.mSearchCancelledCallback) this.mSearchCancelledCallback();
			}
		}
		else {
			this.mTimer = null;
		}
		this.mLastQuery = $F(this.mSearchField);
	},
	gotSearchResult: function(inRequestObj, inResponseObj) {
		this.mRows = inResponseObj;
		if (this.mSortKey) Array.sortArrayUsingKey(this.mRows, this.mSortKey);
		if (this.mPrefetch && (!this.mCachedRows)) {
			this.mCachedRows = inResponseObj;
			Element.removeClassName(this.mSearchField, 'busy_field');
		}
		else {
			this.draw();
		}
		this.mTimer = null;
		this.runQuery(); // in case field changed while we were querying
		if (this.mSearchResultCallback) this.mSearchResultCallback(inResponseObj);
	},
	handleError: function(inFaultCode, inFaultString) {
		this.mTimer = null;
	},
	getDisplayString: function(inRow) {
		// subclasses should over-ride
	},
	updatePosition: function() {
		if (this.mPositionResults) {
			var cloneOptions = {setHeight:false, offsetTop:Element.getHeight(this.mSearchField)};
			Position.clone(this.mSearchField, this.mResultTable, cloneOptions);
		}
	},
	draw: function() {
		this.updatePosition();
		if (this.mPositionResults) Element.hide(this.mResultTable);
		if (this.mHeaderElement) Element.hide(this.mHeaderElement);
		removeAllChildNodes(this.mIsReallyTable ? this.mResultTable.firstChild : this.mResultTable);
		this.mSuggestedUID = null;
		if (this.mShowPlaceholderStrings && (this.mRows.length == 0)) {
			// NOTE: not bothering with table code here because we don't use placeholder strings for tables
			// also hacking hidden form value in here to avoid sending to another round of loc
			this.mResultTable.appendChild(Builder.node('li', [Builder.node('a', {href:'#', onclick:invalidate, className:'search_placeholder'}, $F('no_results_str'))]));
		}
		this.mRows.each(function(row) {
			row.displayString = this.getDisplayString(row);
			if (row.displayString != '') {
				if (this.mPositionResults) Element.show(this.mResultTable);
				if (this.mHeaderElement) Element.show(this.mHeaderElement);
				var currentCell = Builder.node((this.mIsReallyTable?'td':'a'), {id:this.mResultTable.id+'_'+row.uid});
				currentCell.style.cursor = 'pointer';
				currentCell.dataSource = row;
				this.drawCell(currentCell);
				if (this.mIsReallyTable) {
					this.mResultTable.firstChild.appendChild(Builder.node('tr', [currentCell]));
				}
				else {
					currentCell.href = row.url;
					this.mResultTable.appendChild(Builder.node('li', [currentCell]));
				}
				observeEvents(this, currentCell, {click:'clickedUser', mouseover:'mousedOverUser', mouseout:'mousedOutUser'});
			}
		}.bind(this));
		Element.removeClassName(this.mSearchField, 'busy_field');
	},
	drawCell: function(inCell) {
		replaceElementContents(inCell, inCell.dataSource.displayString);
	}
}

/* Watches the provided element for size changes, and notifies you via callbacks.
   Used to detect users hitting command-+ to change font size. */
var SizeObserver = Class.create();
Object.extend(Object.extend(SizeObserver.prototype, Abstract.TimedObserver.prototype), {
	getValue: function() {
		return this.element.offsetHeight;
	}
});

var SplitView = Class.create();
SplitView.prototype = {
	mMaintainTotalHeight: false, // second pane's size gets changed inversely
	mMinimumHeight: 80, // applies to both panes if mMaintainTotalHeight is true
	mMaximumHeight: 10000, // 
	mInverseDelta: false, // use this if you're resizing a bottom-aligned element below the splitter
	initialize: function(inElement/*[, options]*/) {
		bindEventListeners(this, ['handleMouseDown', 'handleMouseMove', 'handleMouseUp']);
		this.mElement = $(inElement);
		Element.cleanWhitespace(this.mElement);
		var nodes = this.mElement.childNodes;
		if (nodes.length > 2) this.mViews = new Array(nodes.item(0), nodes.item(2));
		this.mSplitter = nodes.item(1);
		if (arguments.length > 1) Object.extend(this, arguments[1]);
		Event.observe(this.mSplitter, 'mousedown', this.handleMouseDown);
		this.mElement.onselectstart = invalidate;
	},
	handleMouseDown: function(e) {
		this.mInitialHeight = parseInt(this.mViews[0].style.height);
		if (isNaN(this.mInitialHeight)) this.mInitialHeight = Element.getHeight(this.mViews[0]);
		this.mInitialPos = e.clientY;
		observeEvents(this, d, {mousemove:'handleMouseMove', mouseup:'handleMouseUp'});
		Event.stop(e);
		if (this.mStartCallback) this.mStartCallback();
	},
	handleMouseMove: function(e) {
		var height = this.mInitialHeight;
		if (this.mInverseDelta) {
			height -= e.clientY - this.mInitialPos;
		}
		else {
			height -= this.mInitialPos - e.clientY;
		}
		height = Math.max(height, this.mMinimumHeight);
		height = Math.min(height, this.mMaximumHeight);
		if (this.mMaintainTotalHeight) {
			var delta = height - parseInt(this.mViews[0].style.height || ''+this.mViews[0].offsetHeight);
			var otherHeight = parseInt(this.mViews[1].style.height) - delta;
			if (otherHeight < this.mMinimumHeight) {
				delta = this.mMinimumHeight - otherHeight;
				height -= delta;
				otherHeight += delta;
			}
			this.mViews[1].style.height = otherHeight + 'px';
		}
		this.mViews[0].style.height = height+'px';
		if (this.mDuringCallback) this.mDuringCallback(height);
	},
	handleMouseUp: function(e) {
		Event.stopObserving(d, 'mousemove', this.handleMouseMove);
		Event.stopObserving(d, 'mouseup', this.handleMouseUp);
		if (this.mEndCallback) this.mEndCallback();
	}
}

/* Adds Cocoa-style "springs" to a block-level view, stretching the view so that it horizontally fills the window */
var ViewSprings = Class.create();
ViewSprings.prototype = {
	initialize: function(inElement, inOptCallback, inOptOtherElement) { // other element can be a sidebar or something
		this.handleWindowResize = this.handleWindowResize.bindAsEventListener(this);
		this.mElement = $(inElement);
		this.mCallback = inOptCallback;
		if (inOptOtherElement) this.mOtherElement = $(inOptOtherElement);
		this.boing();
		Event.observe(window, 'resize', this.handleWindowResize);
	},
	boing: function() {
		// if the parent is absolutely positioned, just fill the element
		if (this.mElement.parentNode.getStyle('position') == 'absolute') {
			var oldParentHeight = this.mElement.parentNode.offsetHeight;
			var h = oldParentHeight - this.mElement.offsetTop;
			this.mElement.style.height = (h-2)+'px';
		}
		else {
			var h = this.mOtherElement ? Math.max(this.mElement.offsetHeight, this.mOtherElement.offsetHeight) : this.mElement.offsetHeight;
			h = d.viewport.getHeight() - (d.body.offsetHeight - h);
			if (h < 300) h = 300;
			this.mElement.style.height = h+'px';
			var lies = d.body.offsetHeight - d.body.parentNode.scrollHeight;
			if (lies != 0) this.mElement.style.height = (h+lies)+'px';
		}
		if (this.mCallback) this.mCallback();
	},
	handleWindowResize: function(inEvent) {
		this.boing();
	},
	destroy: function() {
		Event.stopObserving(window, 'resize', this.handleWindowResize);
	}
}

/**
 * Creates popups which can contain more than just text.
 */
var PopupManager = Class.createWithSharedInstance('popupManager');
PopupManager.prototype = {
	mHideDelay: 350, // milliseconds
	mShowDuration: 0, // seconds
	mHideDuration: 0.2, // seconds
	initialize: function(/*[options]*/) {
		bindEventListeners(this, ['handleMouseOut', 'handleMouseOver', 'handleWindowClick', 'handleWindowKeypress', 'handleKeyboardFocus']);
		if (arguments.length > 0) Object.extend(this, arguments[0]);
	},
	show: function(inParent, inElement, inOptOffset, inFade, inOptCallback) {
		var offsetLeft = 0;
		var offsetTop = inOptOffset || 0;
		if (inOptOffset && inOptOffset.constructor == Array) {
			offsetLeft = inOptOffset[0];
			offsetTop = inOptOffset[1];
		}
		var inFade = (arguments.length > 3 ? arguments[3] : gAnimate);
		this.hide(false);
		this.clearTimer();
		this.mActiveParent = $(inParent);
		this.mActiveElement = $(inElement);
		this.mCallback = inOptCallback;
		// position the element
		if (this.mActiveParent) {
			this.mActiveElement.style.position = 'absolute';
			var cloneOptions = {
				setWidth: false,
				setHeight: false,
				offsetLeft: offsetLeft,
				offsetTop: offsetTop // this does not include this.mActiveParent.offsetHeight b/c that differs by theme
			};
			Position.clone(this.mActiveParent, this.mActiveElement, cloneOptions);
			
			if (browser().isIE) { // ##6912980
				var currentLeft = parseInt(this.mActiveElement.style.left);
				if (currentLeft < 0) { // if menu is off screen to left
					this.mActiveElement.style.left = (currentLeft - offsetLeft) + 'px'; // undo the offset, IE styles aren't breaking Position.clone
				}
			}
			
			Element.addClassName(this.mActiveParent,'active');
		}
		var bottomOfWindow = d.viewport.getScrollOffsets()[1] + d.viewport.getHeight();
		var elementTop = parseInt(this.mActiveElement.style.top);
		this.mActiveElement.style.top = '0px';
		var elementHeight = Element.getInvisibleSize(this.mActiveElement)[1]+40; // add a buffer so we don't get too close to the window edge
		this.mActiveElement.style.top = Math.max(Math.min(elementTop, (bottomOfWindow-elementHeight)), 30) + 'px';
		this.mActiveElement.style.opacity = '';
		if (browser().isIE) this.mActiveElement.style.filter = '';
		Event.observe(this.mActiveParent, 'mouseout', this.handleMouseOut);
		Event.observe(this.mActiveElement, 'mouseout', this.handleMouseOut);
		Event.observe(this.mActiveParent, 'mouseover', this.handleMouseOver);
		Event.observe(this.mActiveElement, 'mouseover', this.handleMouseOver);
		if (inFade) {
			Element.hide(this.mActiveElement);
			if (this.mEffect) this.mEffect.cancel();
			this.mEffect = new Effect.Appear(this.mActiveElement, {duration:this.mShowDuration});
		}
		else {
			Element.show(this.mActiveElement);
		}
		Event.observe(d.body.firstChild, 'mousedown', this.handleWindowClick);
		Event.observe(d, 'keypress', this.handleWindowKeypress);
	},
	createPopupElement: function(inOptClassName, inOptID) {
		var sClassName = 'popup';
		if(inOptClassName) sClassName += ' '+inOptClassName;
		var elm = Builder.node('ul', {className:sClassName, style:'display:none'});
		if(inOptID) elm.id = inOptID;
		d.body.appendChild(elm); // ##5389492
		return elm;
	},
	itemWithTitle: function(inPopup, inTitle, inOptHref, inOptCallback, inOptRel) { // returns the anchor
		var a = Builder.node('a', {className:'popuplink', title:'', href:inOptHref || 'javascript:void(0);'}, [inTitle]);
		if(inOptRel) a.setAttribute('rel',inOptRel);
		if(inOptCallback) a.onclick = inOptCallback;
		var elm = Builder.node('li', [a]);
		inPopup.appendChild(elm);
		return a;
	},
	divider: function(inPopup) {
		var li = Builder.node('li', {className:'popupDivider'}, '\u00A0');
		inPopup.appendChild(li);
		return li;
	},
	hide: function(/*[inFade]*/) {
		if (this.mEffect) this.mEffect.cancel();
		if (this.mActiveElement) {
			var inFade = (arguments.length > 0 ? arguments[0] : gAnimate);
			Event.stopObserving(this.mActiveParent, 'mouseout', this.handleMouseOut);
			Event.stopObserving(this.mActiveElement, 'mouseout', this.handleMouseOut);
			Event.stopObserving(this.mActiveParent, 'mouseover', this.handleMouseOver);
			Event.stopObserving(this.mActiveElement, 'mouseover', this.handleMouseOver);
			if (inFade) {
				this.mEffect = new Effect.Fade(this.mActiveElement, {duration:this.mHideDuration});
			}
			else {
				Element.hide(this.mActiveElement);
			}
			if (this.mChildManager) this.mChildManager.hide(inFade);
			Element.removeClassName(this.mActiveParent,'active');
			this.mActiveParent = null;
			this.mActiveElement = null;
			Event.stopObserving(d, 'mousedown', this.handleWindowClick);
			Event.stopObserving(d, 'keypress', this.handleWindowKeypress);
			if (this.mCallback) this.mCallback();
		}
		$$('.popup').each(function(popupElm) {
			popupElm.hide();
		});
	},
	handleMouseOut: function(inEvent) {
		Event.stop(inEvent);
		this.setTimer(); // ##5389498
	},
	handleMouseOver: function(inEvent) {
		Event.stop(inEvent);
		this.clearTimer();
	},
	setTimer: function(inDelay) {
		this.clearTimer();
		this.mTimer = setTimeout(this.handleTimerFired.bind(this), inDelay||this.mHideDelay);
	},
	clearTimer: function() {
		if (this.mTimer) clearTimeout(this.mTimer);
		this.mTimer = null;
	},
	handleTimerFired: function() {
		this.hide();
	},
	handleWindowClick: function(e) {
		var elm = Event.element(e);
		if (elm && Element.hasClassName(elm, 'popuplink')) return true;
		this.setTimer(100);
	},
	handleWindowKeypress: function(e)
	{
		if (e.keyCode == Event.KEY_ESC) {
			this.setTimer(100);
		}
	},
	handleKeyboardFocus: function(e) {
		//this.setTimer(100);
	}
}

var InlineDeleteButton = Class.create();
InlineDeleteButton.prototype = {
	initialize: function(inParent, inCallback, optConfirm) {
		bindEventListeners(this, ['handleParentHover', 'handleParentOut', 'handleButtonClick']);
		this.mParent = $(inParent);
		this.mCallback = inCallback;
		this.mConfirm = (optConfirm !== undefined) ? optConfirm : true;
		observeEvents(this, this.mParent, {mouseover:'handleParentHover', mouseout:'handleParentOut'});
	},
	show: function() {
		if (!this.mElement) {
			this.mElement = Builder.node('a', {href:'#', className:'inline_delete_button', style:'display:none', title:'_Calendar.Dialogs.Invitation.Attendees.Remove'.loc()}, '_Calendar.Dialogs.Invitation.Attendees.Remove'.loc());
			this.mElement.onclick = this.handleButtonClick;
			d.body.appendChild(this.mElement);
			observeEvents(this, this.mElement, {mouseover:'handleParentHover', mouseout:'handleParentOut'});
		}
		Position.clone(this.mParent, this.mElement, {setWidth:false, setHeight:false}); // ##5389480
		Element.show(this.mElement);
		Element.addClassName(this.mParent, 'inlinedeletefocus');
	},
	hide: function() {
		Element.hide(this.mElement);
		Element.removeClassName(this.mParent, 'inlinedeletefocus');
	},
	handleParentHover: function(inEvent) {
		if (this.mTimer) {
			clearTimeout(this.mTimer);
			delete this.mTimer;
		}
		this.show();
	},
	handleParentOut: function(inEvent) {
		if (this.mTimer) {
			clearTimeout(this.mTimer);
			delete this.mTimer;
		}
		this.mTimer = setTimeout(this.hide.bind(this), 200);
	},
	handleButtonClick: function(inEvent) {
		Event.stop(inEvent);
		if (this.mConfirm) {
			if (!InlineDeleteButton.mConfirmDialog) {
				InlineDeleteButton.mConfirmDialog = dialogManager().drawDialog('tags_remove_tag_dialog', ['tags_remove_tag_dialog_description'], 'tags_remove_tag_dialog_ok');
			}
			targetedDialogManager().show(InlineDeleteButton.mConfirmDialog, null, this.handleConfirmDialogOK.bind(this), this.mParent);
		} else {
			this.handleConfirmDialogOK();
		}
		return false;
	},
	handleConfirmDialogOK: function() {
		this.hide(false);
		if (this.mCallback) this.mCallback(this.mParent);
	},
	destroy: function() {
		Event.stopObserving(this.mParent, 'mouseover', this.handleParentHover);
		Event.stopObserving(this.mParent, 'mouseout', this.handleParentOut);
		if (this.mElement) {
			Event.stopObserving(this.mElement, 'mouseover', this.handleParentHover);
			Event.stopObserving(this.mElement, 'mouseout', this.handleParentOut);
		}
	}
}
;
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

/**
 * RemoteTimezoneService
 * Service for fetching timezone info and translating dates from other timezones.
 */

 
var RemoteTimezoneService = Class.createWithSharedInstance('timezoneService');
RemoteTimezoneService.prototype = {
	// FIXME: this whole class needs to properly account for time components in the offsets
	initialize: function() {
		this.mTZIDs = $A([]);
		this.mOffsetData = {};
	},
	getTimezoneList: function(inCallback) {
		// if we've cached the list already, return it
		if (inCallback && this.mTZIDs && this.mTZIDs.length > 0) inCallback(this.mTZIDs);
		// server response callback; parses TZIDs from the response
		var callback = function(transport) {
			// this should never happen; probably means we got invalid XML or a MIME type that isn't text/xml
			if (!transport.responseXML) {
				reportError('Report response is missing responseXML. responseText = '+transport.responseText || '');
				return false;
			}
			// extract all of the TZIDs from the XML document
			this.mTZIDs = Element.childrenWithNodeName(Element.firstChildWithNodeName(transport.responseXML, 'tzids'), 'tzid').collect(function(tzid) {
				return Element.firstNodeValue(tzid);
			});
			// run the callback, if any
			if (inCallback) inCallback(this.mTZIDs);
		}
		// send a list command to the server so we can get a list of TZIDs
		return new Ajax.CalendarRequest('/timezones?method=list', {
			method: 'post',
			onSuccess: callback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	fetchCurrentTimezoneString: function(inCallback) {
		// if we already have it, run the callback immediately
		if (this.mCurrentTimezoneString) {
			if (inCallback) inCallback(this.mCurrentTimezoneString, this.mCurrentTimezoneData);
			return null;
		}
		// otherwise, go to the server and get it
		var gotTimezoneCallback = function(transport) {
			// extract the TZ info from the calendar file
			var tempCalendarFile = new CalendarFile(transport.responseText);
			this.mCurrentTimezoneData = tempCalendarFile.mCalendarObj.VCALENDAR[0].VTIMEZONE[0];
			this.mCurrentTimezoneString = 'BEGIN:VTIMEZONE\n'
				+ tempCalendarFile.updatedCalendarText(this.mCurrentTimezoneData)
				+ '\nEND:VTIMEZONE\n';
			if (inCallback) inCallback(this.mCurrentTimezoneString, this.mCurrentTimezoneData);
		}
		return new Ajax.CalendarRequest('/timezones?method=get&tzid='+encodeURIComponent(this.selectedTimezone()), {
			method: 'post',
			onSuccess: gotTimezoneCallback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	fetchOffsetsForDateRange: function(inCallback, inStartDate, inEndDate, inOptTZID) {
		var tzid = inOptTZID || this.selectedTimezone();
		var performFetch = function(st, en) {
			var fetchCallback = function(transport) {
				// this should never happen; probably means we got invalid XML or a MIME type that isn't text/xml
				if (!transport.responseXML) {
					reportError('Report response is missing responseXML. responseText = '+transport.responseText || '');
					return false;
				}
				// extract all of the TZIDs from the XML document
				var observances = Element.childrenWithNodeName(Element.firstChildWithNodeName(transport.responseXML, 'tzdata'), 'observance');
				for (var observanceIdx = 0; observanceIdx < observances.length; observanceIdx++) {
					var observance = observances[observanceIdx];
					this.mOffsetData[tzid].offsets.push({
						startDate: parseInt(Element.firstNodeValue(Element.firstChildWithNodeName(observance, 'onset'))),
						offset: parseFloat(Element.firstNodeValue(Element.firstChildWithNodeName(observance, 'utc-offset')))
					});
				}
				// sort the TZIDs by start date
				this.mOffsetData[tzid].offsets = this.mOffsetData[tzid].offsets.sortBy(function(offset) {
					return offset.startDate;
				});
				if (inCallback) inCallback(this.mOffsetData[tzid]);
			}
			return new Ajax.CalendarRequest(
					'/timezones?method=expand&tzid='
					+ encodeURIComponent(tzid)
					+ '&start='+dateObjToISO8601(st)
					+ '&end='+dateObjToISO8601(en),
			{
				method: 'post',
				onSuccess: fetchCallback.bind(this),
				onException: reportError,
				on404: function() {
					if (tzid == this.selectedTimezone()) {
						if (!globalNotificationCenter().publish('ERROR_FROM_SERVER', this, {errorObj:{status:'404'}})) reportError('Selected timezone not found.');
						return;
					}
					this.fetchOffsetsForDateRange(inCallback, inStartDate, inEndDate);
				}.bind(this),
				errorNotificationObject: this
			});
		}.bind(this);
		// if we haven't fetched the offsets for this timezone yet, get it for +/- 5 years (TODO: should default offset buffer be configurable?)
		if (!this.mOffsetData[tzid]) {
			this.mOffsetData[tzid] = {startDate:new Date(), endDate:new Date(), offsets:$A([])};
			this.mOffsetData[tzid].startDate.setFullYear(this.mOffsetData[tzid].startDate.getFullYear()-5);
			this.mOffsetData[tzid].endDate.setFullYear(this.mOffsetData[tzid].endDate.getFullYear()+5);
			return performFetch(this.mOffsetData[tzid].startDate, this.mOffsetData[tzid].endDate);
		}
		// if we don't have timezones for the already-fetched range, extend the fetched range
		else if (inStartDate < this.mOffsetData[tzid].startDate && inEndDate > this.mOffsetData[tzid].endDate) {
			this.mOffsetData[tzid].startDate = inStartDate;
			this.mOffsetData[tzid].endDate = inEndDate;
			return performFetch(inStartDate, inEndDate);
		}
		else if (inStartDate < this.mOffsetData[tzid].startDate) {
			var req = performFetch(inStartDate, this.mOffsetData[tzid].startDate);
			this.mOffsetData[tzid].startDate = inStartDate;
			return req;
		}
		else if (inEndDate > this.mOffsetData[tzid].endDate) {
			var req = performFetch(this.mOffsetData[tzid].endDate, inEndDate);
			this.mOffsetData[tzid].endDate = inEndDate;
			return req;
		}
		// if we got this far, we already have "good enough" offset data
		if (inCallback) inCallback(this.mOffsetData[tzid]);
		return null;
	},
	fetchOffsetsForEvents: function(inCallback, inEvents, inOptStartDate, inOptEndDate) {
		if (!inEvents || inEvents.length < 1) {
			if (inCallback) inCallback();
			return false;
		}
		var smallestDate = inOptStartDate || createDateObjFromISO8601(''+(parseInt(inEvents.invoke('startDate', true, true).sort()[0])-1));
		var largestDate = inOptEndDate || createDateObjFromISO8601(''+(parseInt(inEvents.invoke('endDate', true, true).sort().last())+1));
		var tzids = inEvents.invoke('allReferencedTZIDs').flatten().uniq().without(this.selectedTimezone());
		var gotTimezoneOffsetsCallback = function() {
			if (tzids.length <= 0) {
				if (inCallback) inCallback();
				return;
			}
			this.fetchOffsetsForDateRange(gotTimezoneOffsetsCallback.bind(this), smallestDate, largestDate, tzids.pop());
		}
		this.fetchOffsetsForDateRange(gotTimezoneOffsetsCallback.bind(this), smallestDate, largestDate);
	},
	selectedTimezone: function() {
		// try and get from a cookie
		var results = document.cookie.match(/TZID=([^;]+)/);
		if (results) return results[1];
		// now try and get from a meta tag
		results = CC.meta('tzid');
		if (results) return results;
		// fall back to America/Los_Angeles because California is *obviously* the center of the universe :-)
		return 'America/Los_Angeles';
	},
	setSelectedTimezone: function(inTZID, inCallback) {
		this.mCurrentTimezoneString = null;
		this.mCurrentTimezoneData = null;
		var expireDate = new Date();
		expireDate.setFullYear(expireDate.getFullYear()+5); // 5 years is basically forever in web years
		document.cookie='TZID='+escape(inTZID)+'; path=/; expires='+expireDate.toGMTString();
		this.fetchCurrentTimezoneString(inCallback);
	},
	findOffsetForTimezone: function(inTZID, inDate) {
		var dtInt = parseInt(dateObjToISO8601(inDate));
		var offsetSearch = function(offset) {
			return offset.startDate <= dtInt;
		}
		return this.mOffsetData[inTZID].offsets.findAll(offsetSearch).last();
	},
	findOffsetForTimezoneUTCDate: function(inTZID, inUTCDate) {
		var dtInt = parseInt(dateObjToISO8601(inUTCDate));
		var offsetSearch = function(offset) {
			return offset.startDate <= dtInt;
		}
		return this.mOffsetData[inTZID].offsets.findAll(offsetSearch).last();
	},
	correctDateForTimezone: function(inDateObjOrString, inEventTZID, inOptReturnGMT) {
		// convert to a date object, if necessary
		var wasISO = (inDateObjOrString.constructor == String || inDateObjOrString.constructor == Number);
		// if we were handed a date object, make a copy. otherwise get the date from the string
		var dt = (wasISO ? createDateObjFromISO8601(''+inDateObjOrString) : new Date(inDateObjOrString.getTime()));
		// find the offsets
		var oldOffset = (wasISO && (''+inDateObjOrString).match(/Z$/) ? {offset:0} : this.findOffsetForTimezone(inEventTZID, dt));
		var newOffset = {offset:0};
		if (!inOptReturnGMT) newOffset = this.findOffsetForTimezone(this.selectedTimezone(), dt);
		// change the time by the offset differences
		if (oldOffset && newOffset) dt.setHours(dt.getHours() - (oldOffset.offset - newOffset.offset) / 100);
		// return output in the same format as input
		return (wasISO ? dateObjToISO8601(dt, false, inOptReturnGMT) : dt);
	},
	adjustUTCToLocal: function(inUTCDateString, inEventTZID) {
		// convert to a date object
		var dt = createDateObjFromISO8601(''+inUTCDateString);
		// find the offsets
		var oldOffset = {offset:0};
		var newOffset = this.findOffsetForTimezoneUTCDate(inEventTZID, dt);
		// change the time by the offset differences
		if (oldOffset && newOffset) dt.setHours(dt.getHours() - (oldOffset.offset - newOffset.offset) / 100);
		// return output in the same format as input
		return dateObjToISO8601(dt, false, false);
	}
}

/**
 * RemoteProxyService
 * Used to manage proxies (delegates) on the calendar server.
 */
var RemoteProxyService = Class.createWithSharedInstance('proxyService');
RemoteProxyService.prototype = {
	initialize: function() {
	},
	readOnlyProxies: function(inCallback, inPrincipalURL) {
		if (this.mReadOnlyProxies) {
			if (inCallback) inCallback(this.mReadOnlyProxies);
			return;
		}
		this.mReadOnlyProxies = [];
		var bodyTxt = '<?xml version="1.0" encoding="utf-8"?>\n'
		+ '<x0:propfind xmlns:x0="DAV:">\n'
		+ ' <x0:prop>\n'
		+ '  <x0:group-member-set/>\n'
		+ '  <x0:group-membership/>\n'
		+ ' </x0:prop>\n'
		+ '</x0:propfind>';
		var callback = function(transport) {
			if (!transport.responseXML) {
				debugMessage('Report response is missing responseXML. responseText = '+transport.responseText || '');
				return false;
			}
			
			Element.childrenWithNodeName(Element.firstChildWithNodeName(transport.responseXML, 'multistatus'), 'response').each(function(responseNode) {
				if (Element.firstNodeValue(Element.elementWithSimpleXPath(responseNode, 'propstat.status')).indexOf('200') >= 0) {
					var groupMemberSet = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.group-member-set');
					this.mReadOnlyProxies = Element.childrenWithNodeName(groupMemberSet, 'href').collect(function(hrefElm) {
						return Element.firstNodeValue(hrefElm);
					});
				}
			}.bind(this));
			
			if (inCallback) inCallback(this.mReadOnlyProxies);
		}
		return new Ajax.CalendarRequest(String.addSlash(inPrincipalURL) + 'calendar-proxy-read/', {
			method: 'propfind',
			contentType: 'text/xml',
			postBody: bodyTxt,
			requestHeaders: {
				Depth: '0'
			},
			onSuccess: callback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	readWriteProxies: function(inCallback, inPrincipalURL) {
		if (this.mReadWriteProxies) {
			if (inCallback) inCallback(this.mReadWriteProxies);
			return;
		}
		this.mReadWriteProxies = [];
		var bodyTxt = '<?xml version="1.0" encoding="utf-8"?>\n'
		+ '<x0:propfind xmlns:x0="DAV:">\n'
		+ ' <x0:prop>\n'
		+ '  <x0:group-member-set/>\n'
		+ '  <x0:group-membership/>\n'
		+ ' </x0:prop>\n'
		+ '</x0:propfind>';
		var callback = function(transport) {
			if (!transport.responseXML) {
				debugMessage('Report response is missing responseXML. responseText = '+transport.responseText || '');
				return false;
			}
			
			Element.childrenWithNodeName(Element.firstChildWithNodeName(transport.responseXML, 'multistatus'), 'response').each(function(responseNode) {
				if (Element.firstNodeValue(Element.elementWithSimpleXPath(responseNode, 'propstat.status')).indexOf('200') >= 0) {
					var groupMemberSet = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.group-member-set');
					this.mReadWriteProxies = Element.childrenWithNodeName(groupMemberSet, 'href').collect(function(hrefElm) {
						return Element.firstNodeValue(hrefElm);
					});
				}
			}.bind(this));
			
			if (inCallback) inCallback(this.mReadWriteProxies);
		}
		return new Ajax.CalendarRequest(String.addSlash(inPrincipalURL) + 'calendar-proxy-write/', {
			method: 'propfind',
			contentType: 'text/xml',
			postBody: bodyTxt,
			requestHeaders: {
				Depth: '0'
			},
			onSuccess: callback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	setReadOnlyProxies: function(inCallback, inPrincipalURL, inReadOnlyProxyURLs) {
		this.mReadOnlyProxies = inReadOnlyProxyURLs;
		//if (this.mReadOnlyProxies) {
		//	if (inCallback) inCallback(this.mReadOnlyProxies);
		//	return;
		//}
		var hrefs = [];
		inReadOnlyProxyURLs.each(function(proxy) {
			hrefs += '<x0:href>' + proxy + '</x0:href>\n'
		});
		var bodyTxt = '<?xml version="1.0" encoding="utf-8"?>\n'
		+ '<x0:propertyupdate xmlns:x0="DAV:">\n'
		+ ' <x0:set>\n'
		+ ' <x0:prop>\n'
		+ '  <x0:group-member-set>\n'
		+ '    %(hrefs)s\n'
		+ '   </x0:group-member-set>\n'
		+ '  </x0:prop>\n'
		+ ' </x0:set>\n'
		+ '</x0:propertyupdate>';
		bodyTxt = String.format(bodyTxt, {hrefs:hrefs});
		var callback = function(transport) {
			if (!transport.responseXML) {
				debugMessage('Report response is missing responseXML. responseText = '+transport.responseText || '');
				return false;
			}
			
			if (inCallback) inCallback(this.mReadOnlyProxies);
		}
		return new Ajax.CalendarRequest(String.addSlash(inPrincipalURL + '/calendar-proxy-read/'), {
			method: 'proppatch',
			contentType: 'text/xml',
			postBody: bodyTxt,
			requestHeaders: {
				Depth: '0'
			},
			onSuccess: callback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	setReadWriteProxies: function(inCallback, inPrincipalURL, inReadWriteProxyURLs) {
		this.mReadWriteProxies = inReadWriteProxyURLs;
		//if (this.mReadWriteProxies) {
		//	if (inCallback) inCallback(this.mReadWriteProxies);
		//	return;
		//}
		var hrefs = [];
		inReadWriteProxyURLs.each(function(proxy) {
			hrefs += '<x0:href>' + proxy + '</x0:href>\n'
		});
		var bodyTxt = '<?xml version="1.0" encoding="utf-8"?>\n'
		+ '<x0:propertyupdate xmlns:x0="DAV:">\n'
		+ ' <x0:set>\n'
		+ ' <x0:prop>\n'
		+ '  <x0:group-member-set>\n'
		+ '    %(hrefs)s\n'
		+ '   </x0:group-member-set>\n'
		+ '  </x0:prop>\n'
		+ ' </x0:set>\n'
		+ '</x0:propertyupdate>';
		bodyTxt = String.format(bodyTxt, {hrefs:hrefs});
		var callback = function(transport) {
			if (!transport.responseXML) {
				debugMessage('Report response is missing responseXML. responseText = '+transport.responseText || '');
				return false;
			}
			
			if (inCallback) inCallback(this.mReadWriteProxies);
		}
		return new Ajax.CalendarRequest(String.addSlash(inPrincipalURL + '/calendar-proxy-write/'), {
			method: 'proppatch',
			contentType: 'text/xml',
			postBody: bodyTxt,
			requestHeaders: {
				Depth: '0'
			},
			onSuccess: callback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	accountsUserCanAccess: function(inCallback, inPrincipalURL) {
		if (this.mAccountsUserCanAccess) {
			if (inCallback) inCallback(this.mAccountsUserCanAccess);
			return;
		}
		this.mAccountsUserCanAccess = [];
		var bodyTxt = '<?xml version="1.0" encoding="utf-8"?>\n'
		+ '<x0:expand-property xmlns:x0="DAV:">\n'
		+ '	<x0:property name="calendar-proxy-write-for" namespace="http://calendarserver.org/ns/">\n'
		+ '		<x0:property name="displayname"/>\n'
		+ '		<x0:property name="principal-URL"/>\n'
		+ '	</x0:property>\n'
		+ '	<x0:property name="calendar-proxy-read-for" namespace="http://calendarserver.org/ns/">\n'
		+ '		<x0:property name="displayname"/>\n'
		+ '		<x0:property name="principal-URL"/>\n'
		+ '	</x0:property>\n'
		+ '</x0:expand-property>\n';
		var callback = function(transport) {
			if (!transport.responseXML) {
				debugMessage('Report response is missing responseXML. responseText = '+transport.responseText || '');
				return false;
			}
			
			Element.childrenWithNodeName(Element.firstChildWithNodeName(transport.responseXML, 'multistatus'), 'response').each(function(responseNode) {
				if (Element.firstNodeValue(Element.elementWithSimpleXPath(responseNode, 'propstat.status')).indexOf('200') >= 0) {
					$A(['write', 'read']).each(function(accessLevel) {
						Element.childrenWithNodeName(Element.elementWithSimpleXPath(responseNode, 'propstat.prop.calendar-proxy-'+accessLevel+'-for'), 'response').each(function(proxyResponseNode) {
							this.mAccountsUserCanAccess.push({
								displayname: Element.firstNodeValue(Element.elementWithSimpleXPath(proxyResponseNode, 'propstat.prop.displayname')),
								principalURL: Element.firstNodeValue(Element.elementWithSimpleXPath(proxyResponseNode, 'propstat.prop.principal-URL.href'))
							});
						}.bind(this));
					}.bind(this));
				}
			}.bind(this));
			
			if (inCallback) inCallback(this.mAccountsUserCanAccess);
		}
		return new Ajax.CalendarRequest(String.addSlash(inPrincipalURL), {
			method: 'report',
			contentType: 'text/xml',
			postBody: bodyTxt,
			requestHeaders: {
				Depth: '0'
			},
			onSuccess: callback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	}
}

/**
 * RemotePrincipalService
 * Used for lookups of users from the calendar server.
 */
var RemotePrincipalService = Class.createWithSharedInstance('principalService');
RemotePrincipalService.prototype = {
	mDefaultStartWeekday: 0,
	initialize: function() {
		var metaPrincipalLoc = CC.meta('caldav_principal_path');
		if (metaPrincipalLoc) this.setUserPrincipal(metaPrincipalLoc);
	},
	setUserPrincipal: function(inURL, inOptPrincipalInfo) {
		this.mUserPrincipalURL = inURL;
		this.mUserPrincipalInfo = inOptPrincipalInfo;
	},
	getPrincipalInfo: function(inCallback) {
		if (this.mUserPrincipalInfo) {
			if (inCallback) inCallback(this.mUserPrincipalInfo);
			return;
		}
		var reportTxt = '<?xml version="1.0" encoding="utf-8" ?>\n'
		+ '<D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">\n'
		+ '	<D:prop><D:displayname/><C:calendar-home-set/><C:calendar-user-address-set/><C:schedule-inbox-URL/><C:schedule-outbox-URL/><C:calendar-user-type/></D:prop>\n'
		+ '</D:propfind>';
		var callback = function(transport) {
			if (!transport.responseXML) {
				debugMessage('Report response is missing responseXML. responseText = '+transport.responseText || '');
				return false;
			}
			var validProp = Element.childrenWithNodeName(Element.elementWithSimpleXPath(transport.responseXML, 'multistatus.response'), 'propstat').detect(function(propstat) {
				return Element.firstNodeValue(Element.firstChildWithNodeName(propstat, 'status')).match(/\s200\s/);
			});
			if (validProp) {
				var displayname = Element.elementWithSimpleXPath(validProp, 'prop.displayname');
				var calendarhome = Element.elementWithSimpleXPath(validProp, 'prop.calendar-home-set.href');
				if (!calendarhome) {
					if (!globalNotificationCenter().publish('ERROR_FROM_SERVER', this, {errorObj:{status:'404'}})) reportError('Principal is not allowed a calendar');
					return;
				}
				var inboxurl = Element.elementWithSimpleXPath(validProp, 'prop.schedule-inbox-URL.href');
				var outboxurl = Element.elementWithSimpleXPath(validProp, 'prop.schedule-outbox-URL.href');
				var calendarUserType = Element.elementWithSimpleXPath(validProp, 'prop.calendar-user-type');
				var calendarUserAddressSet = Element.childrenWithNodeName(Element.elementWithSimpleXPath(validProp, 'prop.calendar-user-address-set'), 'href').collect(function(hrefElm) {
					return Element.firstNodeValue(hrefElm);
				});
				if (displayname && calendarhome) {
					this.mUserPrincipalInfo = {
						href: this.mUserPrincipalURL,
						uid: this.mUserPrincipalURL,
						url: Element.firstNodeValue(calendarhome),
						displayname: Element.firstNodeValue(displayname),
						inboxurl: Element.firstNodeValue(inboxurl),
						outboxurl: Element.firstNodeValue(outboxurl),
						calendarUserType: Element.firstNodeValue(calendarUserType),
						calendarUserAddressSet: calendarUserAddressSet
					};
				}
			}
			if (inCallback) inCallback(this.mUserPrincipalInfo);
		}
		return new Ajax.CalendarRequest(String.addSlash(this.mUserPrincipalURL), {
			method: 'propfind',
			contentType: 'text/xml',
			postBody: reportTxt,
			requestHeaders: {
				Depth: '0'
			},
			onSuccess: callback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	checkOtherPrincipalExistence: function(inOtherPrincipalPath, inCallback) {
		return new Ajax.CalendarRequest(String.addSlash(inOtherPrincipalPath), {
			method: 'get',
			onComplete: function(response) {
				inCallback(response.status == 200);
			},
			parameters: $H({})
		});
	},
	iCalSubscriptionURLPrefix: function() {
		var hrefUrl = this.mUserPrincipalInfo.calendarUserAddressSet.detect(function(href) {return href.match(/^https*:\/\/[^\/]+\//)});
		if (!hrefUrl) return '';
		// 6946310
		var schemeAdjustedURL = hrefUrl.match(/^https*:\/\/[^\/]+\//)[0].replace(/^https?:/, 'webcal:');
		// 7044241
		var portAdjustedURL = schemeAdjustedURL.replace(/:[\d]+\//, ':8008/');
		return portAdjustedURL;
	},
	principalToCalendarUserTypeMap: { 'users': 'INDIVIDUAL',
									  'locations': 'ROOM',
									  'groups': 'GROUP',
									  'resources': 'RESOURCE' },
	getMatchingUsers: function(inCallback, inSearchString, inSearchTypes) {
		if (!inSearchString || !inSearchString.match(/\S/)) {
			inCallback($A([]));
			return false;
		}
		// ##9422831
		var reportTxt = '<?xml version="1.0" encoding="utf-8" ?>\n'
			+ '<x0:principal-property-search xmlns:x2="urn:ietf:params:xml:ns:caldav" xmlns:x0="DAV:" xmlns:x1="http://calendarserver.org/ns/" test="anyof">\n'
			+ '<x0:property-search>\n'
			+ '<x0:prop><x0:displayname/></x0:prop>\n'
			+ '<x0:match match-type="starts-with">%(q)s</x0:match>\n'
			+ '</x0:property-search>\n'
			+ '<x0:property-search>\n'
			+ '<x0:prop><x1:email-address-set/></x0:prop>\n'
			+ '<x0:match match-type="starts-with">%(q)s</x0:match>\n'
			+ '</x0:property-search>\n'
			+ '<x0:property-search>\n'
			+ '<x0:prop><x1:first-name/></x0:prop>\n'
			+ '<x0:match match-type="starts-with">%(q)s</x0:match>\n'
			+ '</x0:property-search>\n'
			+ '<x0:property-search>\n'
			+ '<x0:prop><x1:last-name/></x0:prop>\n'
			+ '<x0:match match-type="starts-with">%(q)s</x0:match>\n'
			+ '</x0:property-search>\n'
			+ '<x0:prop>\n'
			+ '<x1:email-address-set/>\n'
			+ '<x1:first-name/>\n'
			+ '<x2:calendar-user-address-set/>\n'
			+ '<x2:calendar-user-type/>\n'
			+ '<x2:calendar-home-set/>\n'
			+ '<x1:last-name/>\n'
			+ '<x0:displayname/>\n'
			+ '<x1:record-type/>\n'
			+ '<x0:principal-URL/>\n'
			+ '</x0:prop>\n'
			+ '</x0:principal-property-search>';
		reportTxt = String.format(reportTxt, {q:inSearchString.escapeHTML()});
		var callback = function(transport) {
			if (!transport.responseXML) {
				debugMessage('Report response is missing responseXML. responseText = '+transport.responseText || '');
				return false;
			}
			var wantedCalUserTypes = inSearchTypes.collect(function(el) { return this.principalToCalendarUserTypeMap[el]; }.bind(this)).compact();
			var matchingUsers = $A([]);
			var responseNodes = Element.childrenWithNodeName(Element.firstChildWithNodeName(transport.responseXML, 'multistatus'), 'response');
			for (var responseNodeIdx = 0; responseNodeIdx < responseNodes.length; responseNodeIdx++) {
				var responseNode = responseNodes[responseNodeIdx];
				var href = Element.firstChildWithNodeName(responseNode, 'href').firstChild.nodeValue;
				var statusElm = Element.elementWithSimpleXPath(responseNode, 'propstat.status');
				if (statusElm && statusElm.firstChild && statusElm.firstChild.nodeValue && statusElm.firstChild.nodeValue.match(/\s200\sOK\s*$/)) {
					var displayname = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.displayname');
					var usertype = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.calendar-user-type');
					var calendarhome = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.calendar-home-set.href');
					var displaynameValue = Element.firstNodeValue(displayname);
					var usertypeValue = Element.firstNodeValue(usertype);
					var calendarhomeValue = Element.firstNodeValue(calendarhome);
					if (displayname && calendarhome && wantedCalUserTypes.include(usertypeValue)) {
						matchingUsers.push({
							href: href,
							uid: href,
							url: calendarhomeValue,
							displayname: displaynameValue,
							cutype: usertypeValue
						});
					}
				}
			}
			if (inCallback) inCallback(transport.request, matchingUsers);
		}
		return new Ajax.CalendarRequest('/principals/'+inSearchTypes[0]+'/', { // TODO: support more than one principal search type
			method: 'report',
			contentType: 'text/xml',
			postBody: reportTxt,
			requestHeaders: {
				Depth: '0'
			},
			onSuccess: callback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	isIndividual: function() {
		return (this.mUserPrincipalInfo.calendarUserType == 'INDIVIDUAL');
	},
	startWeekday: function() {
		var results = document.cookie.match(/startWeekday=(\d)/);
		return (results ? parseInt(results[1]) : this.mDefaultStartWeekday);
	},
	setStartWeekday: function(inWeekdayInt) {
		var expireDate = new Date();
		expireDate.setFullYear(expireDate.getFullYear()+5); // 5 years is basically forever in web years
		document.cookie='startWeekday='+inWeekdayInt+'; path=/; expires='+expireDate.toGMTString();
		globalNotificationCenter().publish('START_WEEKDAY_CHANGED', this, {startWeekday:inWeekdayInt});
	}
}


/**
 * RemoteCalendarCollection
 * Represents a calendar collection.
 */
var RemoteCalendarCollection = Class.create();
RemoteCalendarCollection.prototype = {
	mDefaultCalendarColorIdx: 0,
	initialize: function(inCollectionBasePath) {
		this.mDefaultCalendarColors = RemoteCalendarCollection.defaultCalendarColors;
		this.mCollectionBasePath = inCollectionBasePath;
		this.mCanWriteContent = true;
		this.mCanWriteProperties = true;
		this.getCalendars();
	},
	nextAvailableCalendarColor: function(inOptExceptionArray) {
		if (!inOptExceptionArray) inOptExceptionArray = $A([]);
		var calendarColorsCopy = this.mDefaultCalendarColors.clone();
		this.mCalendars.each(function(calObj) {
			var colorIdx = calendarColorsCopy.indexOf(calObj.mColor);
			if (colorIdx >= 0 && inOptExceptionArray.indexOf(calObj) < 0) {
				calendarColorsCopy.splice(colorIdx, 1);
			}
		});
		if (calendarColorsCopy.length > 0) {
			return calendarColorsCopy[0];
		}
		return this.mDefaultCalendarColors[(this.mDefaultCalendarColorIdx++) % this.mDefaultCalendarColors.length];
	},
	getCalendars: function() {
		var callback = function(transport) {
			this.mInboxCalendar = null;
			this.mOutboxCalendar = null;
			this.mDefaultCalendarURL = null;
			this.mDefaultTasksURL = null;
			this.mCalendars = $A([]);
			var calendarsNeedingColors = $A([]);
			if (!transport.responseXML) {
				reportError('Report response is missing responseXML. responseText = '+transport.responseText || '');
				return false;
			}
			Element.childrenWithNodeName(Element.firstChildWithNodeName(transport.responseXML, 'multistatus'), 'response').each(function(responseNode) {
				var href = Element.firstNodeValue(Element.firstChildWithNodeName(responseNode, 'href'));
				var resourceType = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.resourcetype');
				var isCollection = Element.firstChildWithNodeName(resourceType, 'collection');
				var calPrivilegeSet = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.current-user-privilege-set');
				var userCanWriteContent = calPrivilegeSet ? (calPrivilegeSet.getElementsByTagName('write-content').length > 0) : false;
				var userCanWriteProperties = calPrivilegeSet ? (calPrivilegeSet.getElementsByTagName('write-properties').length > 0) : false;
				var needsColor = false;
				if (href == this.mCollectionBasePath) {
					this.mCanWriteContent = userCanWriteContent;
					this.mCanWriteProperties = userCanWriteProperties;
				}
				else if (isCollection && (href != this.mCollectionBasePath)) {
					// closure function to create a calendar
					var createCalendar = function(inOptCreateColor) {
						var displayName = Element.firstNodeValue(Element.elementWithSimpleXPath(responseNode, 'propstat.prop.displayname'));
						var calendarColor = Element.firstNodeValue(Element.elementWithSimpleXPath(responseNode, 'propstat.prop.calendar-color'));
						var ctag = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.getctag');
						if (inOptCreateColor && !calendarColor) {
							calendarColor = this.mDefaultCalendarColors[0];
							needsColor = true;
						}
						var createdCal = new RemoteCalendar(this, href, displayName, calendarColor);
						createdCal.mCanWriteContent = userCanWriteContent;
						createdCal.mCanWriteProperties = userCanWriteProperties;
						if (ctag) createdCal.mCtag = Element.firstNodeValue(ctag);
						return createdCal;
					}.bind(this);
					// put a calendar in the proper bucket
					if (Element.firstChildWithNodeName(resourceType, 'schedule-inbox')) {
						this.mInboxCalendar = createCalendar();
						var defaultCalendarEl = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.schedule-default-calendar-URL.href');
						if (defaultCalendarEl)
							this.mDefaultCalendarURL = Element.firstNodeValue(defaultCalendarEl);
						var defaultTasksEl = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.schedule-default-tasks-URL.href');
						if (defaultTasksEl)
							this.mDefaultTasksURL = Element.firstNodeValue(defaultTasksEl);
					}
					else if (Element.firstChildWithNodeName(resourceType, 'schedule-outbox')) {
						this.mOutboxCalendar = createCalendar();
					}
					else if (Element.firstChildWithNodeName(resourceType, 'calendar')) {
						var supportsEvents = false;
						var supported = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.supported-calendar-component-set');
						if (supported) {
							Element.childrenWithNodeName(supported, 'comp').each(function(compNode) {
								if (Element.firstNodeValue(compNode.attributes.getNamedItem('name')) == 'VEVENT')
									supportsEvents = true;
							}.bind(this));
						} else
							supportsEvents = true;
						if (supportsEvents) {
							var calObj = createCalendar(true);
							this.mCalendars.push(calObj);
							if (needsColor) calendarsNeedingColors.push(calObj);
						}
					}
				}
			}.bind(this));
			// sort the calendars alphabetically
			this.mCalendars = Array.sortArrayUsingKey(this.mCalendars, 'mDisplayName');
			// set colors for calendars that don't have them
			calendarsNeedingColors = Array.sortArrayUsingKey(calendarsNeedingColors, 'mDisplayName');
			this.mDefaultCalendarColorIdx = 0;
			while (calendarsNeedingColors.length > 0) {
				var calObj = calendarsNeedingColors[0];
				calObj.mColor = this.nextAvailableCalendarColor(calendarsNeedingColors);
				calendarsNeedingColors.shift();
				calObj.renameCalendar(calObj.mDisplayName, calObj.mColor, null, true);
			}
			// FIXME: create a calendar if we don't have one
			globalNotificationCenter().publish('GOT_CALENDAR_COLLECTION', this);
		}
		return new Ajax.CalendarRequest(this.mCollectionBasePath, {
			method: 'propfind',
			contentType: 'application/xml',
			postBody: '<?xml version="1.0" ?><D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav" xmlns:I="http://apple.com/ns/ical/" xmlns:CS="http://calendarserver.org/ns/"><D:prop><D:displayname/><D:resourcetype/><D:current-user-privilege-set/><I:calendar-color/><CS:getctag/><C:supported-calendar-component-set/><C:schedule-default-calendar-URL/><CS:schedule-default-tasks-URL/></D:prop></D:propfind>',
			requestHeaders: {
				Depth: '1'
			},
			onSuccess: callback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	updateCalendarCTags: function(inCallback) { // use this method to quickly see which calendars have changed
		var callback = function(transport) {
			if (!transport.responseXML) {
				reportError('Report response is missing responseXML. responseText = '+transport.responseText || '');
				return false;
			}
			var updatedCalendars = $A([]);
			Element.childrenWithNodeName(Element.firstChildWithNodeName(transport.responseXML, 'multistatus'), 'response').each(function(responseNode) {
				var href = Element.firstNodeValue(Element.firstChildWithNodeName(responseNode, 'href'));
				var resourceType = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.resourcetype');
				var isCollection = Element.firstChildWithNodeName(resourceType, 'collection');
				var ctag = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.getctag');
				if (isCollection && (href != this.mCollectionBasePath)) {
					// see if we know about a calendar with this href
					var cal = this.calendarWithPath(href);
					// if there are no ctags, revert back to always assuming it's updated. Otherwise, compare cached ctags.
					var isUpdated = (!cal || !cal.mCtag || !ctag || cal.mCtag != Element.firstNodeValue(ctag));
					// if there is a ctag and we found a calendar, update the cached ctag
					if (cal && ctag && Element.firstNodeValue(ctag)) cal.mCtag = Element.firstNodeValue(ctag);
					// if it's the inbox, flag the result to let clients know
					if (cal && cal == this.mInboxCalendar) {
						if (isUpdated) updatedCalendars.shouldFetchInbox = true;
					}
					// if we know about the calendar and it's updated, add it to the array
					else if (cal) {
						if (isUpdated) updatedCalendars.push(cal);
					}
					// if it's a new calendar, flag that the collection itself needs to be refetched
					else if (Element.firstChildWithNodeName(resourceType, 'calendar') && href != this.mOutboxCalendar.mCalendarBasePath) {
						updatedCalendars.shouldFetchCollection = true;
					}
				}
			}.bind(this));
			if (inCallback) inCallback(updatedCalendars);
		}
		return new Ajax.CalendarRequest(this.mCollectionBasePath, {
			method: 'propfind',
			contentType: 'application/xml',
			postBody: '<?xml version="1.0" ?><D:propfind xmlns:D="DAV:" xmlns:CS="http://calendarserver.org/ns/"><D:prop><D:resourcetype/><CS:getctag/></D:prop></D:propfind>',
			requestHeaders: {Depth:'1'},
			onSuccess: callback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	calendarWithPath: function(inPath) {
		// handle relative paths
		var path = (inPath.indexOf('/') != 0) ? String.addSlash(String.appendPathComponent(this.mCollectionBasePath, inPath)) : inPath;
		// inbox?
		if (String.addSlash(this.mInboxCalendar.mCalendarBasePath) == path) return this.mInboxCalendar;
		// iterate through other calendars
		return this.mCalendars.detect(function(calObj) {
			return (String.addSlash(calObj.mCalendarBasePath) == path);
		});
	},
	getInboxContents: function(inCallback) {
		var gotInboxCallback = function(transport) {
			var request = null;
			// fish out the href values for all responses whose type is text/calendar
			var hrefs = $A([]);
			Element.childrenWithNodeName(Element.firstChildWithNodeName(transport.responseXML, 'multistatus'), 'response').each(function(responseNode) {
				if (Element.firstNodeValue(Element.elementWithSimpleXPath(responseNode, 'propstat.prop.getcontenttype')).match(/^(text\/calendar|application\/xml)/)) {
					hrefs.push(Element.firstNodeValue(Element.firstChildWithNodeName(responseNode, 'href')));
				}
				else if (Element.firstNodeValue(Element.firstChildWithNodeName(responseNode, 'href')) == this.mInboxCalendar.mCalendarBasePath) {
					// track availability calendar (if any)
					var availElm = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.calendar-availability');
					if (availElm && Element.firstNodeValue(availElm) && Element.firstNodeValue(availElm).match(/\S/)) {
						var availCal = new CalendarFile(Element.firstNodeValue(availElm), this.mInboxCalendar.mCalendarBasePath, this.mInboxCalendar);
						if (availCal.mCalendarObj.VCALENDAR[0].VAVAILABILITY && availCal.mCalendarObj.VCALENDAR[0].VAVAILABILITY[0].AVAILABLE && availCal.mCalendarObj.VCALENDAR[0].VAVAILABILITY[0].AVAILABLE.length == 1) {
							var availability = new CalendarEvent(availCal, availCal.mCalendarObj.VCALENDAR[0].VAVAILABILITY[0].AVAILABLE[0]);
							if (availability.recurrenceInfo() && availability.recurrenceInfo().isWeekdays()) this.mAvailability = availability;
						}
					}
				}
			}, this);
			// if we didn't get any vaild hrefs back, make the callback with an empty array and bail
			if (hrefs.length <= 0) {
				if (this.mAvailability) {
					// get availability timezone offsets
					var timezoneCallback = function() {
						if (inCallback) inCallback(request, $A([]));
					}
					timezoneService().fetchOffsetsForEvents(timezoneCallback, $A([this.mAvailability]));
				}
				else {
					if (inCallback) inCallback(request, $A([]));
					return;
				}
			}
			// callback for after we get the inbox calendar files
			var inboxMultigetCallback = function(transport) {
				var calendarEvents = $A([]);
				Element.childrenWithNodeName(Element.firstChildWithNodeName(transport.responseXML, 'multistatus'), 'response').each(function(responseNode) {
					if (Element.firstNodeValue(Element.elementWithSimpleXPath(responseNode, 'propstat.status')).indexOf('200') >= 0) {
						var href = Element.firstNodeValue(Element.firstChildWithNodeName(responseNode, 'href'));
						var calendarText = Element.firstNodeValue(Element.elementWithSimpleXPath(responseNode, 'propstat.prop.calendar-data'));
						var calendarFile = new CalendarFile(calendarText, href, this.mInboxCalendar);
						calendarEvents = calendarEvents.concat(calendarFile.mEvents);
					}
				}, this);
				// get the timezone data for all of the events
				var timezoneCallback = function() {
					if (inCallback) inCallback(request, calendarEvents);
				}
				var timezoneEvents = calendarEvents.clone();
				if (this.mAvailability) timezoneEvents.push(this.mAvailability);
				timezoneService().fetchOffsetsForEvents(timezoneCallback, timezoneEvents);
			}
			// get the inbox calendar files
			// TODO: combine this multiget with the one below, this is pasted code which is bad
			var multiGetText = '<?xml version="1.0" encoding="utf-8" ?>\n'
				+ '<C:calendar-multiget xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">\n'
				+ '	<D:prop>\n'
				+ '		<D:getetag/>\n'
				+ '		<C:calendar-data/>\n'
				+ '	</D:prop>\n'
				+ '%(hrefs)s\n'
				+ '</C:calendar-multiget>';
			var hrefText = '<D:href>%(href)s</D:href>';
			// build a multi-get string
			multiGetText = String.format(multiGetText, {hrefs:hrefs.collect(function(href) {
				return String.format(hrefText, {href:href});
			}).join('\n')});
			// make a multi-get request
			new Ajax.CalendarRequest(this.mInboxCalendar.mCalendarBasePath, {
				method: 'report',
				contentType: 'application/xml',
				postBody: multiGetText,
				onSuccess: inboxMultigetCallback.bind(this),
				onException: reportError,
				errorNotificationObject: this
			});
		}
		request = new Ajax.CalendarRequest(this.mInboxCalendar.mCalendarBasePath, {
			method: 'propfind',
			contentType: 'application/xml',
			postBody: '<?xml version="1.0" ?><D:propfind xmlns:D="DAV:" xmlns:CS="http://calendarserver.org/ns/"><D:prop><CS:calendar-availability/><D:getetag/><D:getcontenttype/></D:prop></D:propfind>',
			requestHeaders: {
				Depth: '1'
			},
			onSuccess: gotInboxCallback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
		return request;
	},
	getEventsForDateRange: function(inStartDate, inEndDate, inCallback) {
		var requestUID = CalendarUuid.generateUUIDString();
		var gotTimezonesCallback = function() {
			var requestCount = this.mCalendars.length; // so we know when we're done with our requests
			var eventsToReturn = $A([]);
			var request = null;
			var calendarResultsCallback = function(inRequestObj, inResponseObj) {
				eventsToReturn = eventsToReturn.concat(inResponseObj);
				if (--requestCount <= 0) {
					var gotTimezoneOffsetsCallback = function() {
						// remove duplicates, favoring events that aren't in the inbox
						var inboxCalendar = this.mInboxCalendar; // so we don't have to bother binding
						eventsToReturn = Array.removeDuplicateRows(eventsToReturn, function(inEarlier, inLater) {
							return (inEarlier.uid == inLater.uid && inEarlier.mParentCalendarFile == inboxCalendar);
						});
						inCallback(requestUID, eventsToReturn);
					}
					timezoneService().fetchOffsetsForEvents(gotTimezoneOffsetsCallback.bind(this), eventsToReturn, inStartDate, inEndDate);
				}
			}
			// generate requests for each of the other calendars, unless they're disabled
			this.mCalendars.each(function(cal) {
				request = cal.getEventsForDateRange(inStartDate, inEndDate, calendarResultsCallback);
			});
			if (!request) { // all calendars are unselected
				setTimeout(function() {inCallback(requestUID, eventsToReturn)}, 10);
			}
		}
		timezoneService().fetchOffsetsForDateRange(gotTimezonesCallback.bind(this), inStartDate, inEndDate);
		return requestUID;
	},
	findEquivalentToInboxCalendarEvent: function(inCalendarEvent, inCallback) {
		// Given an event which may be in the inbox, find the equivalent non-inbox event.
		// May return null if the event only exists in the inbox. (no default calendar)
		var eventWindow = 3; // Days
		var startDate = inCalendarEvent.startDate();
		startDate.setHours(0);
		startDate.setMinutes(0);
		startDate.setSeconds(0);
		startDate.setDate(startDate.getDate()-eventWindow);
		var endDate = new Date(startDate.getTime());
		endDate.setDate(endDate.getDate()+(eventWindow*2));
		// get the matching calendar events on the start date of the inbox event
		var gotCalendarEventsCallback = function(inRequest, inEvents) {
			var matchingEvents = inEvents.select(function(event){
				return event.valueForProperty('UID') == inCalendarEvent.valueForProperty('UID') &&
					   event.mParentCalendarFile.mParentCalendar != this.mInboxCalendar &&
					   event.mParentCalendarFile.mFileLocation.indexOf('/inbox/') == -1; // :(
			});

			if (matchingEvents.length > 0)
			{

				if (inCallback) inCallback(matchingEvents[0]);
				return;
			}

			if (inCallback) inCallback(null);
		}
		this.getEventsForDateRange(startDate, endDate, gotCalendarEventsCallback.bind(this));
	},
	setWeekdayAvailability: function(inStartTime, inEndTime, inCallback) {
		var gotTimezoneStringCallback = function() {
			// move the start time's date to monday
			var delta = inStartTime.getDay() - 1;
			inStartTime.setDate(inStartTime.getDate() - delta);
			// move the end time's date to the same as the start time's date
			inEndTime.setFullYear(inStartTime.getFullYear());
			inEndTime.setMonth(inStartTime.getMonth());
			inEndTime.setDate(inStartTime.getDate());
			// create a calendar event
			var availabilityEvent = this.mInboxCalendar.createCalendarEvent();
			// set the start/end time
			availabilityEvent.setStartDate(inStartTime);
			availabilityEvent.setEndDate(inEndTime);
			availabilityEvent.convertEventDurationToEndDate();
			// set the RRULE (for v1, always weekdays)
			availabilityEvent.setPropertyValue('RRULE', 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR');
			// delete the description (not needed here)
			availabilityEvent.mParentCalendarFile.deleteKeyFromMember('DESCRIPTION', availabilityEvent.mEventStruct);
			// this is a AVAILABLE, not a VEVENT
			var availabilityText = availabilityEvent.mParentCalendarFile.updatedCalendarText();
			var uuid = CalendarUuid.generateUUIDString();
			var dtstamp = dateObjToISO8601(new Date(), true, true);
			availabilityText = availabilityText.replace(/BEGIN:VTIMEZONE/m, 'CALSCALE:GREGORIAN\nBEGIN:VTIMEZONE');
			availabilityText = availabilityText.replace(/BEGIN:VEVENT/m, 'BEGIN:VAVAILABILITY\nUID:'+uuid+'\nDTSTAMP:'+dtstamp+'\nCREATED:'+dtstamp+'\nBEGIN:AVAILABLE');
			availabilityText = availabilityText.replace(/END:VEVENT/m, 'END:AVAILABLE\nEND:VAVAILABILITY');
			// save the event to the server
			var requestBody = '<?xml version="1.0" encoding="utf-8" ?>\n'
				+ '<D:propertyupdate xmlns:D="DAV:" xmlns:CS="http://calendarserver.org/ns/">\n'
				+ '	<D:set>\n'
				+ '		<D:prop>\n'
				+ '			<CS:calendar-availability><![CDATA[%(availabilityText)s]]></CS:calendar-availability>\n'
				+ '		</D:prop>\n'
				+ '	</D:set>\n'
				+ '</D:propertyupdate>';
			requestBody = String.format(requestBody, {availabilityText:availabilityText.escapeHTML()});
			var savedAvailabilityCallback = function() {
				this.mAvailability = availabilityEvent;
				if (inCallback) inCallback(availabilityEvent);
			}
			new Ajax.CalendarRequest(this.mInboxCalendar.mCalendarBasePath, {
				method: 'proppatch',
				contentType: 'text/xml',
				postBody: requestBody,
				requestHeaders: {
					Depth: '0'
				},
				onSuccess: savedAvailabilityCallback.bind(this),
				onException: reportError,
				errorNotificationObject: this
			});
			if (inCallback) inCallback();
		}
		timezoneService().fetchCurrentTimezoneString(gotTimezoneStringCallback.bind(this));
	},
	userCanWriteContent: function() {
		return this.mCanWriteContent;
	},
	userCanWriteProperties: function() {
		return this.mCanWriteProperties;
	},
	makeCalendar: function(inCalendarName, inCallback, inOptCalendarColor) {
		var calendarcolor = inOptCalendarColor || this.nextAvailableCalendarColor();
		var makeCalendarText = '<?xml version="1.0" encoding="utf-8" ?>\n'
			+ '<C:mkcalendar xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav" xmlns:I="http://apple.com/ns/ical/">\n'
			+ '	<D:set>\n'
			+ '	<D:prop>\n'
			+ '		<D:displayname>%(displayname)s</D:displayname>\n'
			+ '		<I:calendar-color>%(calendarcolor)s</I:calendar-color>\n'
			+ '		<C:schedule-calendar-transp><C:opaque/></C:schedule-calendar-transp>\n'
			+ '	</D:prop>\n'
			+ '	</D:set>\n'
			+ '</C:mkcalendar>';
		makeCalendarText = String.format(makeCalendarText, {displayname:inCalendarName.escapeHTML(), calendarcolor:calendarcolor.escapeHTML()});
		var mkCalCallback = function(transport) {
			this.getCalendars();
			if (inCallback) inCallback();
		}
		return new Ajax.CalendarRequest(String.addSlash(this.mCollectionBasePath) + CalendarUuid.generateUUIDString() + '/', {
			method: 'mkcalendar',
			contentType: 'application/xml',
			postBody: makeCalendarText,
			onSuccess: mkCalCallback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	deleteCalendar: function(inCalendar, inCallback) {
		var calendarIdx = this.mCalendars.length;
		while (--calendarIdx >= 0) {
			if (this.mCalendars[calendarIdx] == inCalendar) {
				return new Ajax.CalendarRequest(inCalendar.mCalendarBasePath, {
					method: 'delete',
					onSuccess: function() {
						this.mCalendars.splice(calendarIdx--, 1);
						if (inCallback) inCallback();
					}.bind(this),
					onException: reportError,
					errorNotificationObject: this
				});
			}
		}
	}
}
RemoteCalendarCollection.defaultCalendarColors = $A(['#0052D3', '#2CA00A', '#E41616', '#F57700', '#AF26AD', '#492BA0']);


/**
 * RemoteCalendar
 * Proxy object to a CalDAV server.
 * Note: Everything must be on the same hostname and port.
 */
var RemoteCalendar = Class.create();
RemoteCalendar.prototype = {
	initialize: function(inParentCollection, inCalendarBasePath, inOptDisplayName, inOptColor) {
		this.mParentCollection = inParentCollection;
		this.mCalendarBasePath = inCalendarBasePath;
		this.mLastPathComponent = String.lastPathComponent(inCalendarBasePath);
		this.mDisplayName = (inOptDisplayName && inOptDisplayName.match(/\S/)) ? inOptDisplayName : this.mLastPathComponent;
		this.mColor = (inOptColor && inOptColor.match(/^#[0-9A-Fa-f]{6}/)) ? inOptColor : '#0067C3'; // FIXME: hard-coding blue for calendar colors; pick randomly from a palette
		// The server gives us an opacity component, which we'll ignore
		this.mColor = this.mColor.substr(0, 7);
		this.mEnabled = true;
		this.mCanWriteContent = true;
		this.mCanWriteProperties = true;
	},
	pathForNewEvents: function() {
		return this.mCalendarBasePath.replace(/\/$/, '') + '/';
	},
	userCanWriteContent: function() {
		return this.mCanWriteContent;
	},
	userCanWriteProperties: function() {
		return this.mCanWriteProperties;
	},
	isDefault: function() {
		var basePath = String.addSlash(this.mCalendarBasePath);
		var defCalPath = (this.mParentCollection.mDefaultCalendarURL) ? String.addSlash(this.mParentCollection.mDefaultCalendarURL) : '';
		var defTasksPath = (this.mParentCollection.mDefaultTasksURL) ? String.addSlash(this.mParentCollection.mDefaultTasksURL) : '';
		return (basePath == defCalPath || basePath == defTasksPath);
	},
	iCalSubscriptionURL: function() {
		return String.appendPathComponent(principalService().iCalSubscriptionURLPrefix(), this.mCalendarBasePath).replace(/\/$/, '');
	},
	shareCalendar: function(inCallback) {
		var gotSharedCalendarResponse = function(transport) {
			if (inCallback) inCallback();
		}
		return new Ajax.CalendarRequest(this.mCalendarBasePath.replace(/\/$/, '')+'/?action=share', {
			method: 'get',
			onSuccess: gotSharedCalendarResponse.bind(this),
			onException: reportError,
			errorNotificationObject: this,
			parameters: $H({})
		});
	},
	renameCalendar: function(inDisplayName, inOptColor, inCallback, inOptForceColorSave) {
		var requestBody = '<?xml version="1.0" encoding="utf-8" ?>\n'
			+ '<D:propertyupdate xmlns:D="DAV:" xmlns:CS="http://calendarserver.org/ns/" xmlns:I="http://apple.com/ns/ical/">\n'
			+ '	<D:set>\n'
			+ '		<D:prop>\n'
			+ '		%(displaynameprop)s\n'
			+ '		%(calendarcolorprop)s\n'
			+ '		</D:prop>\n'
			+ '	</D:set>\n'
			+ '</D:propertyupdate>';
		var displaynameprop = '';
		if (inDisplayName && inDisplayName.match(/\S/) && inDisplayName != this.mDisplayName) {
			this.mDisplayName = inDisplayName;
			displaynameprop = '<D:displayname>'+inDisplayName.escapeHTML()+'</D:displayname>';
		}
		var calendarcolorprop = '';
		if (inOptColor && inOptColor.match(/\S/) && (inOptForceColorSave || inOptColor != this.mColor)) {
			this.mColor = inOptColor;
			calendarcolorprop = '<I:calendar-color>'+inOptColor.toUpperCase().escapeHTML()+'</I:calendar-color>';
		}
		if (displaynameprop == '' && calendarcolorprop == '') {
			if (inCallback) inCallback();
			return;
		}
		requestBody = String.format(requestBody, {displaynameprop:displaynameprop, calendarcolorprop:calendarcolorprop});
		var savedDisplayNameCallback = function() {
			this.mDisplayName = inDisplayName;
			if (inCallback) inCallback();
		}
		return new Ajax.CalendarRequest(this.mCalendarBasePath, {
			method: 'proppatch',
			contentType: 'text/xml',
			postBody: requestBody,
			requestHeaders: {
				Depth: '0'
			},
			onSuccess: savedDisplayNameCallback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	createCalendarEvent: function() {
		var cfile = new CalendarFile(null, null, this);
		cfile.mEvents[0].mIsNew = true;
		return cfile.mEvents[0];
	},
	parseResponse: function(transport) {
		var calendarFiles = new Hash();
		var calendarEvents = $A([]);
		if (!transport.responseXML) {
			debugMessage('Report response is missing responseXML. responseText = '+transport.responseText || '');
			return false;
		}
		var responseNodes = Element.childrenWithNodeName(Element.firstChildWithNodeName(transport.responseXML, 'multistatus'), 'response');
		for (var responseNodeIdx = 0; responseNodeIdx < responseNodes.length; responseNodeIdx++) {
			var responseNode = responseNodes[responseNodeIdx];
			var status = Element.elementWithSimpleXPath(responseNode, 'propstat.status').firstChild.nodeValue;
			if (!status.match(/200/)) continue; // bail for not-found responses
			var scheduleTagElm = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.schedule-tag');
			var fileLocation = Element.firstChildWithNodeName(responseNode, 'href').firstChild.nodeValue;
			var calendarText = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.calendar-data').firstChild.nodeValue;
			var calendarFile = new CalendarFile(calendarText, fileLocation, this);
			if (scheduleTagElm) {
				calendarFile.mScheduleTag = scheduleTagElm.firstChild.nodeValue;
			}
			calendarEvents = calendarEvents.concat(calendarFile.mEvents);
			calendarFiles.set(fileLocation, calendarFile);
		}
		return {calendarFiles:calendarFiles, calendarEvents:calendarEvents};
	},
	runReport: function(inReportText, inCallback) {
		var multiGetText = '<?xml version="1.0" encoding="utf-8" ?>\n'
			+ '<C:calendar-multiget xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">\n'
			+ '	<D:prop>\n'
			+ '		<D:getetag/>\n'
			+ '		<C:calendar-data/>\n'
			+ '		<C:schedule-tag/>\n'
			+ '	</D:prop>\n'
			+ '%(hrefs)s\n'
			+ '</C:calendar-multiget>';
		var hrefText = '<D:href>%(href)s</D:href>';
		
		var reportCallback = function(transport) {
			//console.log('got server response');
			// parse the events returned by the report
			//console.log('creating temporary expanded events');
			var reportContent = this.parseResponse(transport);
			//console.log('done creating temporary expanded events');
			// build a multi-get string
			multiGetText = String.format(multiGetText, {hrefs:reportContent.calendarFiles.keys().collect(function(href) {
				return String.format(hrefText, {href:href});
			}).join('\n')});
			var multiGetCallback = function(multiTransport) {
				// parse the events returned by the multi-get
				//console.log('creating temporary saved events');
				var multiGetContent = this.parseResponse(multiTransport);
				//console.log('done creating temporary saved events');
				var tzoffsetCallback = function() {
					//console.log('got timezone offsets');
					// normalize all recurrence-based UID keys to GMT since we have TZ data now
					$A([multiGetContent, reportContent]).pluck('calendarEvents').flatten().invoke('normalizeRecurrenceUID');
					// index the saved events by UID
					var savedEvents = {};
					for (var savedCalendarEventIdx = 0; savedCalendarEventIdx < multiGetContent.calendarEvents.length; savedCalendarEventIdx++) {
						var savedCalendarEvent = multiGetContent.calendarEvents[savedCalendarEventIdx];
						savedEvents[savedCalendarEvent.uid] = savedCalendarEvent;
					}
					// start with the events in the saved data
					//console.log('adding saved events to returned list');
					var allEvents = multiGetContent.calendarEvents.collect(function(savedCalendarEvent) {
						// if there's a recurrence ID, this is a detached calendar event
						if (savedCalendarEvent.recurrenceID()) {
							//console.log('creating DetachedCalendarEvent because we found a saved calendar event with a recurrence ID');
							var parentEvent = savedEvents["uid:" + savedCalendarEvent.valueForProperty('UID')];
							if (!parentEvent && savedCalendarEvent.principalAttendee() != null)
								return new DetachedAttendeeCalendarEvent(savedCalendarEvent.mParentCalendarFile, savedCalendarEvent.mEventStruct);
							return new DetachedCalendarEvent(savedCalendarEvent.mParentCalendarFile, savedCalendarEvent.mEventStruct, parentEvent);
						}
						// check for a detached first event
						var rawStartDate = savedCalendarEvent.valueForProperty('DTSTART');
						var uidToFind = savedCalendarEvent.uid + '/' + timezoneService().correctDateForTimezone(rawStartDate, savedCalendarEvent.tzid(), true);
						if (multiGetContent.calendarEvents.pluck('uid').indexOf(uidToFind) >= 0) {
							//console.log('making an event invisible because there\'s an detached counterpart');
							savedCalendarEvent.setVisible(false);
						}
						return savedCalendarEvent;
					});
					//console.log('done adding saved events to returned list');
					//console.log('adding expanded events to returned list');
					// iterate through each expanded event and add everything that doesn't have a saved equivalent
					for (var expandedEventIdx = 0; expandedEventIdx < reportContent.calendarEvents.length; expandedEventIdx++) {
						var expandedEvent = reportContent.calendarEvents[expandedEventIdx];
						// fix up broken expansions from CalDAV server (recurrences without recurrence IDs)
						var matchingSavedEvent = savedEvents[expandedEvent.uid];
						if (matchingSavedEvent && (!expandedEvent.recurrenceID()) && (expandedEvent.startDate(true) != matchingSavedEvent.startDate(true))) {
							//console.log('fixing a broken CalDAV expansion');
							var recurrenceStruct = Object.toJSON(expandedEvent.mEventStruct.DTSTART).evalJSON();
							recurrenceStruct.key = 'RECURRENCE-ID';
							expandedEvent.mEventStruct['RECURRENCE-ID'] = recurrenceStruct;
							expandedEvent.normalizeRecurrenceUID();
							expandedEvent.resetStacks();
						}
						// bail if we have a matching saved event
						if (savedEvents[expandedEvent.uid]) {
							//console.log('skipping expanded event because we have a matching saved event');
							continue;
						}
						// otherwise, create an ExpandedCalendarEvent
						//console.log('creating an expanded event');
						allEvents.push(new ExpandedCalendarEvent(expandedEvent.mParentCalendarFile, expandedEvent.mEventStruct, savedEvents["uid:" + expandedEvent.valueForProperty('UID')]));
					}
					//console.log('done adding expanded events to returned list');
					// fetch the timezone info before running the callback
					timezoneService().fetchCurrentTimezoneString(function() {
						//console.log('done handling server response');
						if (inCallback) inCallback(transport.request, allEvents);
					});
				}
				var allEvents = multiGetContent.calendarFiles.values().pluck('mEvents').flatten();
				timezoneService().fetchOffsetsForEvents(tzoffsetCallback.bind(this), allEvents);
			}
			// make a multi-get request
			new Ajax.CalendarRequest(this.mCalendarBasePath, {
				method: 'report',
				contentType: 'application/xml',
				postBody: multiGetText,
				onSuccess: multiGetCallback.bind(this),
				onException: reportError,
				errorNotificationObject: this
			});
		}
		return new Ajax.CalendarRequest(this.mCalendarBasePath, {
			method: 'report',
			contentType: 'application/xml',
			postBody: inReportText,
			requestHeaders: {
				Depth: '1'
			},
			onSuccess: reportCallback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	reportTemplate: function() {
		return '<?xml version="1.0" encoding="utf-8" ?>\n'
			+ '<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">\n'
			+ '	<D:prop>\n'
			+ '		<D:getetag/>\n'
			+ '		<C:calendar-data>\n'
			+ '			<C:expand start="%(startDate)s" end="%(endDate)s"/>\n'
			+ '			<C:comp name="VCALENDAR">\n'
			+ '				<C:prop name="VERSION"/>\n'
			+ '				<C:comp name="VEVENT">\n'
			+ '					<C:prop name="UID"/>\n'
			+ '					<C:prop name="DTSTART"/>\n'
			+ '					<C:prop name="DTEND"/>\n'
			+ '					<C:prop name="DURATION"/>\n'
			+ '					<C:prop name="RRULE"/>\n'
			+ '					<C:prop name="RDATE"/>\n'
			+ '					<C:prop name="EXRULE"/>\n'
			+ '					<C:prop name="EXDATE"/>\n'
			+ '					<C:prop name="RECURRENCE-ID"/>\n'
			+ '				</C:comp>\n'
			+ '			</C:comp>\n'
			+ '		</C:calendar-data>\n'
			+ '	</D:prop>\n'
			+ '	<C:filter>\n'
			+ '		<C:comp-filter name="VCALENDAR">\n'
			+ '			<C:comp-filter name="VEVENT">\n'
			+ '				%(filter)s\n'
			+ '			</C:comp-filter>\n'
			+ '		</C:comp-filter>\n'
			+ '	</C:filter>\n'
			+ '</C:calendar-query>';
	},
	getEventsForDateRange: function(inStartDate, inEndDate, inCallback) {
		// build the filter
		var formatParams = {startDate:dateObjToISO8601(inStartDate, true), endDate:dateObjToISO8601(inEndDate, true)};
		formatParams.filter = String.format('<C:time-range start="%(startDate)s" end="%(endDate)s"/>', formatParams);
		// add it to the report text
		var reportText = String.format(this.reportTemplate(), formatParams);
		// now run the report
		return this.runReport(reportText, inCallback);
	},
	expandRecurrencesForEventWithUID: function(inEventUID, inStartDate, inEndDate, inCallback) {
		// build the filter
		var formatParams = {startDate:dateObjToISO8601(inStartDate), endDate:dateObjToISO8601(inEndDate), uid:inEventUID};
		formatParams.filter = String.format('<C:prop-filter name="UID"><C:text-match collation="i;octet">%(uid)s</C:text-match></C:prop-filter>', formatParams);
		// add it to the report text
		var reportText = String.format(this.reportTemplate(), formatParams);
		// now run the report
		return this.runReport(reportText, inCallback);
	}
}


/**
 * CalendarFile
 * Data class for an entire ics file.
 * Initialize with the ics text and the file location as a URL, or
 * to make a new CalendarFile, initialize with null and the remote calendar.
 * Usually abstracted through RemoteCalendar and CalendarEvent.
 */
var CalendarFile = Class.create();
CalendarFile.prototype = {
	initialize: function(inCalendarText, inFileLocation, inParentCalendar) {
		if (!inCalendarText && !inFileLocation) {
			inCalendarText = String.format(CalendarFile.defaultFormat, {
				DTSTAMP: dateObjToISO8601(new Date(), true, true),
				DTSTART: dateObjToISO8601(new Date(), false, false),
				UID: CalendarUuid.generateUUIDString(),
				SUMMARY: 'New Event',
				TZID: timezoneService().selectedTimezone(),
				TIMEZONE: timezoneService().mCurrentTimezoneString || ''
			});
		}
		// stow away the URL for later
		this.mFileLocation = inFileLocation;
		this.mParentCalendar = inParentCalendar;
		// fix CRLF line endings (do we need to do this?) and replace continuation-escaped strings
		inCalendarText = inCalendarText.replace(/\r\n/gm, '\n').replace(/\n[ \t]+/gm, '');
		var lines = inCalendarText.split('\n');
		this.mCalendarObj = $A([]);
		var stack = $A([this.mCalendarObj]);
		lineIdxLabel:
		for (var lineIdx = 0; lineIdx < lines.length; lineIdx++) {
			var line = lines[lineIdx];
			// get rid of continuations
			while (line.match(/\\$/)) {
				line = line.replace(/\\$/, '\n');
				line += lines[lineIdx+1];
				lines.splice(lineIdx--, 1);
			}
			// sanity check to make sure this is a valid line
			if (line.indexOf(':') < 0) continue;
			// remove starting and trailing whitespace
			line = line.strip();
			
			var key = '';
			var valueObj = {value:''};
			// iterate over every character in the line
			var charIdx = (-1), charLength = line.length;
			// look for key
			while (charIdx++ < charLength) {
				if (line.charAt(charIdx) == ';') {
					break;
				}
				if (line.charAt(charIdx) == ':') {
					charIdx--;
					break;
				}
				key += line.charAt(charIdx);
			}
			
			// if no key, bail on this line
			if (key == '') continue;
			// otherwise, set the key in the valueObj
			valueObj.key = key;
			
			// look for attributes
			while (charIdx++ < charLength) {
				if (line.charAt(charIdx) == ':') {
					break;
				}
				// attribute name
				var attrName = '';
				charIdx--;
				while (charIdx++ < charLength) {
					if (line.charAt(charIdx) == '=') {
						break;
					}
					attrName += line.charAt(charIdx);
				}
				// if no attribute name, bail
				if (attrName == '') continue;
				// attribute value
				var attrValue = '';
				var isQuoted = false;
				if (charIdx < charLength && line.charAt(charIdx+1) == '"') {
					isQuoted = true;
					charIdx++;
				}
				while (charIdx++ < charLength) {
					if (isQuoted && line.charAt(charIdx) == '"') {
						if (line.charAt(charIdx+1) == ';') {
							charIdx++;
						}
						break;
					}
					if (!isQuoted && line.charAt(charIdx) == ';') {
						break;
					}
					if (!isQuoted && line.charAt(charIdx) == ':') {
						charIdx--;
						break;
					}
					attrValue += line.charAt(charIdx);
				}
				if (!valueObj.calAttrs) valueObj.calAttrs = {};
				valueObj.calAttrs[attrName] = attrValue;
			}
			
			// the rest of the string is the value
			valueObj.value = (++charIdx < charLength ? line.slice(charIdx) : '');
			
			// push stuff onto the stack
			if (key == 'BEGIN') {
				var newStackItem = $A([]);
				newStackItem.key = valueObj.value;
				if (!stack[stack.length-1][valueObj.value]) {
					var arrayValue = $A([]);
					stack[stack.length-1].push(arrayValue);
					stack[stack.length-1][valueObj.value] = arrayValue;
				}
				stack[stack.length-1][valueObj.value].push(newStackItem);
				stack.push(newStackItem);
			}
			// if we get an END statement, we need to go up a level by popping off of the stack
			else if (key == 'END') {
				stack.pop();
			}
			// if we get to this point and have a value, set it for the given key
			else {
				// if this is a text value, remove escapes
				if (CalendarFile.textProperties.indexOf(valueObj.key) >= 0) {
					valueObj.value = valueObj.value.replace(/\\n/gm, '\n').replace(/\\([;\,])/gm, '$1').replace(/\\\\/, '\\');
				}
				// push the value onto the stack
				stack[stack.length-1].push(valueObj);
				stack[stack.length-1][key] = valueObj;
			}
		}
		// if we don't have a calendar object then bail
		if (!(this.mCalendarObj.VCALENDAR && this.mCalendarObj.VCALENDAR.length > 0)) throw 'Invalid calendar.';
		// now that we have the core object, create CalendarEvent objects
		this.mEvents = $A([]);
		if (this.mCalendarObj.VCALENDAR[0].VEVENT) {
			for (var eventStructIdx = 0; eventStructIdx < this.mCalendarObj.VCALENDAR[0].VEVENT.length; eventStructIdx++) {
				this.mEvents.push(new CalendarEvent(this, this.mCalendarObj.VCALENDAR[0].VEVENT[eventStructIdx]));
			}
		}
	},
	allReferencedTZIDs: function() {
		return this.mEvents.collect(function(evt) { return evt.allReferencedTZIDs(); }).flatten().uniq();
	},
	iTIPMethod: function() {
		if (this.mCalendarObj.VCALENDAR[0].METHOD) return this.mCalendarObj.VCALENDAR[0].METHOD.value;
		return null;
	},
	updatedCalendarText: function(inOptStackItem) {
		var stackItem = inOptStackItem || this.mCalendarObj;
		var calendarText = stackItem.collect(function(valueObj) {
			//7133432 plugging a hole
			if(!valueObj) return;
			
			// if it's a BEGIN statement, then add that stack level
			if (valueObj.constructor == Array) {
				// make sure the struct hasn't been replaced in the individual event
				//if (valueObj.mEventForStruct) valueObj = valueObj.mEventForStruct.mEventStruct;
				if (!valueObj.key) return this.updatedCalendarText(valueObj);
				return 'BEGIN:'+valueObj.key+'\n'+this.updatedCalendarText(valueObj)+'\nEND:'+valueObj.key;
			}
			var valueStr = valueObj.value;
			if (valueStr.length > 0) {
				// start with the key
				var lineText = valueObj.key;
				// add the attributes
				if (valueObj.calAttrs) {
					$H(valueObj.calAttrs).each(function(attr) {
						if (attr.value != null) {
							var attrValue = attr.value;
							if (attrValue.indexOf(';') >= 0) attrValue = '"'+attrValue+'"';
							lineText += ';' + [attr.key, attrValue].join('=');
						}
					});
				}
				if (CalendarFile.textProperties.indexOf(valueObj.key) >= 0) {
					valueStr = valueStr.replace(/\\/gm, '\\\\').replace(/([;\,])/gm, '\\$1').replace(/\n/gm, '\\n');
				}
				lineText = lineText + ':' + valueStr;
				return lineText;
			}
			else {
				return "\n";
			}
		}.bind(this)).join('\r\n');
		if (!inOptStackItem) calendarText = calendarText + '\r\n';
		calendarText = calendarText.replace(/[\r\n]+/gm, '\r\n');
		return calendarText;
	},
	deleteKeyFromMember: function(inKey, inMember) {
		delete inMember[inKey];
		for (var pairIdx = 0; pairIdx < inMember.length; pairIdx++) {
			if (inMember[pairIdx].key == inKey) {
				inMember.splice(pairIdx, 1);
				return true;
			}
		}
		return false;
	},
	deleteEvent: function(inDeleteCallback) {
		if (!this.mFileLocation) return null;
		var callback = function(transport) {
			if (inDeleteCallback) inDeleteCallback(transport);
		}
		return new Ajax.CalendarRequest(this.mFileLocation, {
			method: 'delete',
			onSuccess: callback,
			onException: reportError,
			errorNotificationObject: this
		});
	},
	expandRecurrencesForEvent: function(inEvent, inStartDate, inEndDate, inCallback) {
		var queryUID = inEvent.valueForProperty('UID');
		return this.mParentCalendar.expandRecurrencesForEventWithUID(queryUID, inStartDate, inEndDate, inCallback);
	},
	saveToServer: function(inSaveCallback) {
		// update event date stamps and reset their update stacks
		this.mEvents.each(function(evt) {
			evt.setPropertyValue('DTSTAMP', dateObjToISO8601(new Date(), true, true));
			evt.incrementSequenceNumber();
			evt.resetStacks();
		});
		
		// udpate the text for revertToSaved() on this calendar file
		//this.resetUndoStruct();
		
		timezoneService().fetchCurrentTimezoneString(function(str, parsed) {
			/**
			 * If the CalendarFile has been hijacked, replace the VTIMEZONE with whatever is currently selected.
			 */

			// A more descriptive alias so that I don't have to type 'this.mCalendarObj.VCALENDAR' 7 times.
			var calendars = this.mCalendarObj.VCALENDAR;

			// Always remove unused VTIMEZONEs. This will handle removal for all-day events too.
			var tzids = this.allReferencedTZIDs();
			var selectedTZID = timezoneService().selectedTimezone();
			var selectedTZIDSeen = false;
			calendars[0] = calendars[0].reject(function(el) {
				if (el.constructor==Array && el[0].key=='VTIMEZONE')
				{
					if (selectedTZID==el[0].TZID.value)
						selectedTZIDSeen = true;
					return !tzids.include(el[0].TZID.value);
				}
				return false;
			});
			calendars[0].key = 'VCALENDAR'; // reject() removes the key, put it back.

			if (this.mTimezoneHijacked)
			{
				this.mTimezoneHijacked = false;

				var makeDetectorByKey = function(key) { return function(el) { return el.constructor==Array && el[0].key == key; }; }

				if (!selectedTZIDSeen)
				{
					// Add VTIMEZONE before the VEVENT.
					calendars[0].splice(calendars[0].indexOf(calendars[0].detect(makeDetectorByKey('VEVENT'))), 0, parsed);
					calendars[0].VTIMEZONE = parsed;
				}
			}

			/**
			 * ...and continue saving.
			 */

			var requestHeaders = {};
			var calendarText = this.updatedCalendarText();
			if (!this.mFileLocation) { // this means it's a new event
				requestHeaders['If-None-Match'] = '*'; // make sure there's no duplicate
				// TODO: handle the error condition where we try to add a duplicate event
				//grab the originalUID if we cannot get the event's structure
				var eventUID = (this.mEvents.length == 0) ? this.grabOriginalUID() : this.mEvents[0].mEventStruct.UID.value;
				this.mFileLocation = String.appendPathComponent(this.mParentCalendar.pathForNewEvents(), eventUID + '.ics');
			}
			// if we have a schedule-tag, tell the server to merge with any changes
			else if (this.mScheduleTag) {
				requestHeaders['If-Schedule-Tag-Match'] = this.mScheduleTag;
			}
			var savedFileCallback = function(transport) {
				if (inSaveCallback) inSaveCallback(transport);
			}
			requestHeaders['Content-type'] = 'text/calendar';
			return new Ajax.CalendarRequest(this.mFileLocation, {
				method: 'put',
				contentType: 'text/calendar',
				postBody: calendarText,
				onSuccess: savedFileCallback,
				onException: reportError,
				errorNotificationObject: this,
				requestHeaders: requestHeaders
			});
		}.bind(this));
	},
	moveToCalendar: function(inDestinationCalendar, inCallback) {
		// the destination is the new calendar's base path plus the filename of the calendar file
		var destination = String.appendPathComponent(inDestinationCalendar.pathForNewEvents(), String.lastPathComponent(this.mFileLocation));
		// when we're all done here, switch the internal calendar and file location references, then run the callback
		var callback = function() {
			this.mParentCalendar = inDestinationCalendar;
			this.mFileLocation = destination;
			if (inCallback) inCallback(this);
		}
		/*// if we've got a METHOD parameter, we need to delete it and save the new copy to the server, then delete the old
		if (false && this.mCalendarObj.VCALENDAR[0].METHOD) {
			// clone ourselves a new CalendarFile object
			var newfile = new CalendarFile(this.mOriginalCalendarFile ? this.mOriginalCalendarFile.updatedCalendarText() : this.updatedCalendarText(), null, inDestinationCalendar);
			// get the first VCALENDAR object
			var vcal = newfile.mCalendarObj.VCALENDAR[0];
			// delete the method both from the keyed value and splice it out of the array as well
			newfile.deleteKeyFromMember('METHOD', newfile.mCalendarObj.VCALENDAR[0]);
			// after we save, delete the original event and run the callback...
			var saveCallback = function() {
				this.deleteEvent(callback.bind(this));
			}
			// ...but first, generate a put request for the calendar file copy
			var requestHeaders = {};
			requestHeaders['Content-type'] = 'text/calendar';
			return new Ajax.CalendarRequest(destination, {
				method: 'put',
				contentType: 'text/calendar',
				postBody: newfile.updatedCalendarText(),
				requestHeaders: requestHeaders,
				onSuccess: saveCallback.bind(this),
				onException: reportError,
				errorNotificationObject: this
			});
		}*/
		// If we got to this point, we should just be able to tell the server to move the calendar file.
		return new Ajax.CalendarRequest(this.mFileLocation, {
			method: 'move',
			requestHeaders: {
				Destination: destination
			},
			onSuccess: callback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	grabOriginalUID: function() { // FIXME we can't count on the first event being the original; should look for the one without a recurrence ID
		// Remember we have a "uid:" prefix
		return this.mEvents[0].uid.slice(4);
	}
}
// default new calendar event (substitute in string values using String.format)
CalendarFile.defaultFormat = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Apple Inc.//Web Calendar Client//\n%(TIMEZONE)sBEGIN:VEVENT\nDESCRIPTION:\n'
		+ 'DTSTAMP:%(DTSTAMP)s\nDTSTART;TZID=%(TZID)s:%(DTSTART)s\nDURATION:PT1H\nSEQUENCE:1\nSUMMARY:%(SUMMARY)s\nUID:%(UID)s\nTRANSP:OPAQUE\nEND:VEVENT\nEND:VCALENDAR';
CalendarFile.multiProperties = ['EXDATE', 'RDATE', 'ATTENDEE'];
CalendarFile.textProperties = ['CALSCALE', 'METHOD', 'PRODID', 'VERSION', 'CATEGORIES', 'CLASS', 'COMMENT', 'DESCRIPTION', 'LOCATION', 'RESOURCES', 'STATUS', 'SUMMARY', 'TRANSP', 'TZID', 'TZNAME', 'CONTACT', 'RELATED-TO', 'UID', 'ACTION', 'REQUEST-STATUS'];


/**
 * CalendarEvent
 * Data class for an individual calendar event.
 */
var CalendarEvent = Class.create({
	initialize: function(inParentCalendarFile, inEventStruct) {
		this.mVisible = true;
		this.mUpdateStack = $A([]);
		this.mParentCalendarFile = inParentCalendarFile;
		this.mEventStruct = inEventStruct;
		//this.mEventStruct.mEventForStruct = this;

		// We need to add a "uid:" prefix to make sure this value can legitimately be used as a property on an array
		this.uid = "uid:" + this.mEventStruct.UID.value; // for syncing using Array.syncKeyedArrayWithRows
		if (this.mEventStruct['RECURRENCE-ID']) {
			this.uid += '/' + this.mEventStruct['RECURRENCE-ID'].value;
		}
		// remember the original dates
		this.resetStacks();
		//console.log('created ' + this.recurrenceType() + ' ' + this.toString());
	},
	toString: function() {
		var s = "Event{\n";
		this.mEventStruct.each(function(el) {
			if (el.key) {
				s += "\t";
				s += el.key + '=' + el.value;
				if (el.calAttrs) {
					for (var av in el.calAttrs) {
						s += ';' + av + '=' + el.calAttrs[av];
					}
				}
				s += "\n";
			}
		});
		return s + '}';
	},
	allReferencedTZIDs: function() {
		var tzids = $A([]);
		this.mEventStruct.each(function(el) {
			if (el.key) {
				var val = this.attributeForProperty(el.key, 'TZID');
				if (val)
					tzids.push(val);
			}
		}.bind(this));
		return tzids.uniq();
	},
	resetStacks: function() {
		this.mUpdateStack = $A([]);
		this.mOriginalEventStruct = this.cloneEventStruct();
		this.setRecurrenceChangeAction(CalendarEvent.RecurrenceChangeAction.Unknown);
		this.mOriginalLocalStartDate = this.startDate(false, true);
	},
	rememberDates: function() { // FIXME take out all references to mOriginalDateStruct
		throw 'rememberDates is deprecated; use resetStacks instead'
		/* -- OLD CODE --
		this.mOriginalDateStruct = $A([{
			key: 'DTSTART',
			calAttrs: this.mEventStruct.DTSTART.calAttrs,
			value: this.mEventStruct.DTSTART.value
		}]);
		if (this.mEventStruct['DTEND']) {
			this.mOriginalDateStruct.push({
				key: 'DTEND',
				calAttrs: this.mEventStruct.DTEND.calAttrs,
				value: this.mEventStruct.DTEND.value
			});
		}
		if (this.mEventStruct['DURATION']) {
			this.mOriginalDateStruct.push({
				key: 'DURATION',
				calAttrs: this.mEventStruct.DURATION.calAttrs,
				value: this.mEventStruct.DURATION.value
			});
		}*/
	},
	normalizeRecurrenceUID: function() {
		var tzid = this.attributeForProperty('RECURRENCE-ID', 'TZID');
		if (!tzid) return;
		var dtstr = timezoneService().correctDateForTimezone(this.valueForProperty('RECURRENCE-ID'), tzid, true);

		// We need to add a "uid:" prefix to make sure this value can legitimately be used as a property on an array
		this.uid = "uid:" + this.valueForProperty('UID') + '/' + dtstr;
	},
	useAlphaColors: function() {
		return browser().isWebKit();
	},
	alphaFillColor: function() {
		return 'rgba(' + $R(0,2).collect(function(i) {
			return parseInt(this.mParentCalendarFile.mParentCalendar.mColor.substring((i*2)+1, (i*2)+3), 16);
		}, this).join(',') + ',' + '0.3)';
	},
	color: function() {
		return this.mParentCalendarFile.mParentCalendar.mColor;
	},
	fillColor: function() {
		// Return an rgba color for Safari and FF3, and the color for everyone else.
		if (this.useAlphaColors()) {
			return this.alphaFillColor();
		}
		return this.mParentCalendarFile.mParentCalendar.mColor;
	},
	textColor: function() {
		if (this.useAlphaColors()) {
			return this.mParentCalendarFile.mParentCalendar.mColor;
		}
		return '#FFF';
	},
	isNew: function() {
		return !this.mParentCalendarFile.mFileLocation;
	},
	updateStack: function() {
		if (!this.mUpdateStack) this.mUpdateStack = $A([]);
		return this.mUpdateStack;
	},
	valueForProperty: function(inPropertyName) {
		if (inPropertyName.indexOf(';') >= 0) {
			var splitProperty = inPropertyName.split(';');
			return this.attributeForProperty(splitProperty[0], splitProperty[1]);
		}
		return this.mEventStruct[inPropertyName] ? this.mEventStruct[inPropertyName].value : null;
	},
	attributeForProperty: function(inPropertyName, inAttributeName) {
		if (!this.mEventStruct[inPropertyName] || !this.mEventStruct[inPropertyName].calAttrs) return null;
		return this.mEventStruct[inPropertyName].calAttrs[inAttributeName];
	},
	setPropertyValue: function(inPropertyName, inValue) {
		// if we call setPropertyValue with a ;-separated value, set an attribute instead
		if (inPropertyName.indexOf(';') >= 0) {
			var splitProperty = inPropertyName.split(';');
			this.setPropertyAttribute(splitProperty[0], splitProperty[1], inValue);
			return;
		}
		// if the value hasn't changed, stop now
		if (this.valueForProperty(inPropertyName) == inValue) return;
		// push the change onto the stack
		//debugMessage('pushing changed property onto stack: ' + inPropertyName+': '+(inValue||'(null)')+' (old value:'+(this.valueForProperty(inPropertyName)||'(null)')+')');
		this.updateStack().push(inPropertyName);
		// unset if we got a null value
		if (inValue == null) {
			// delete from array as well as the object
			var spliceIndex = this.mEventStruct.indexOf(this.mEventStruct[inPropertyName]);
			if (spliceIndex >= 0) this.mEventStruct.splice(spliceIndex, 1);
			if (this.mEventStruct[inPropertyName]) delete this.mEventStruct[inPropertyName];
			return;
		}
		// and, of course, we need to add to the array here and set the value if it's not there yet
		if (!this.mEventStruct[inPropertyName]) {
			var newStackItem = {key:inPropertyName, value:inValue};
			this.mEventStruct.push(newStackItem);
			this.mEventStruct[inPropertyName] = newStackItem;
			return;
		}
		// this is just the update case
		this.mEventStruct[inPropertyName]['value'] = inValue;
	},
	setPropertyAttribute: function(inPropertyName, inAttributeName, inValue) {
		// bail if we aren't actually changing anything
		if (this.attributeForProperty(inPropertyName, inAttributeName) == inValue) return;
		// push the change onto the stack
		this.updateStack().push(inPropertyName);
		if (this.mEventStruct[inPropertyName]) {
			this.addPopertyAttribute(this.mEventStruct[inPropertyName], inAttributeName, inValue);
		}
	},
	addPopertyAttribute: function(property, inAttributeName, inValue) {
		if (!property['calAttrs']) {
			property['calAttrs'] = {};
		}
		if (inValue == null && property['calAttrs'][inAttributeName]) {
			delete property['calAttrs'][inAttributeName];
		}
		else {
			property['calAttrs'][inAttributeName] = inValue;
		}
	},
	hijackEventTimezone: function() {
		if (this.attributeForProperty('DTSTART', 'VALUE') == 'DATE') return true; // don't add TZIDs to banner events!
		this.setPropertyAttribute('DTSTART', 'TZID', timezoneService().selectedTimezone());
		if (this.valueForProperty('DTEND'))
			this.setPropertyAttribute('DTEND', 'TZID', timezoneService().selectedTimezone());
		this.mParentCalendarFile.mTimezoneHijacked = true;
	},
	rawGMTDateForProperty: function(inPropertyName) { // used for comparing date values
		var rawDate = this.valueForProperty(inPropertyName);
		if (!rawDate) return null;
		return timezoneService().correctDateForTimezone(rawDate, this.tzid(inPropertyName), true);
	},
	startDate: function(inOptReturnRawFormat, inOptReturnUncorrected) {
		// use the cached corrected start date if we have it
		if (this.mCachedStartDate && !inOptReturnUncorrected) {
			return (inOptReturnRawFormat ? this.mCachedStartDate : createDateObjFromISO8601(this.mCachedStartDate));
		}
		var rawStartDate = this.valueForProperty('DTSTART');
		// if this is a banner event, don't correct for timezones
		if (this.banner()) {
			rawStartDate = rawStartDate.replace(/T.+$/, '');
			this.mCachedStartDate = rawStartDate;
			return (inOptReturnRawFormat ? rawStartDate : createDateObjFromISO8601(rawStartDate));
		}
		// get the corrected date
		if (!inOptReturnUncorrected) {
			rawStartDate = timezoneService().correctDateForTimezone(rawStartDate, this.tzid());
			this.mCachedStartDate = rawStartDate;
		}
		// create a date object so we can get the offset
		return (inOptReturnRawFormat ? rawStartDate : createDateObjFromISO8601(rawStartDate));
	},
	setStartDate: function(inStartDate) {
		// handle set from ISO string
		if (inStartDate && (inStartDate.constructor == String || inStartDate.constructor == Number)) inStartDate = createDateObjFromISO8601(''+inStartDate);
		// if we didn't actually move, then bail
		if (inStartDate.getTime() == this.startDate().getTime()) return;
		// if we have an end date, we have to move it forward
		if (inStartDate && this.startDate() && this.mEventStruct.DTEND) {
			// set the end date using the new start date and the duration
			this.setEndDate(getEndDateUsingDuration(inStartDate, this.duration()));
		}
		// now set the new start date property
		var startDateStr = dateObjToISO8601(inStartDate, false, false);
		// If this is an banner event, strip the time from the string
		if (startDateStr && this.banner()) {
			startDateStr = startDateStr.replace(/T.+$/, '');
			this.setPropertyAttribute('DTSTART', 'TZID', null);
		}
		// Adjust for UTC if current start date is set that way
		if (this.valueForProperty('DTSTART').match(/Z$/)){
			startDateStr = timezoneService().correctDateForTimezone(startDateStr, this.mParentEvent.tzid(), true);
		}
		this.setPropertyValue('DTSTART', startDateStr);
		if (!this.valueForProperty('DTSTART').match(/Z$/)){
			this.hijackEventTimezone();
		}
		delete this.mCachedStartDate; // this will get rebuilt as-needed later by the startDate() method
	},
	tzid: function(inOptProperty) {
		return this.attributeForProperty(inOptProperty || 'DTSTART', 'TZID') || timezoneService().selectedTimezone();
	},
	banner: function() {
		return (this.attributeForProperty('DTSTART', 'VALUE') == 'DATE');
	},
	setBanner: function(inBanner) {
		this.setPropertyAttribute('DTSTART', 'VALUE', (inBanner ? 'DATE' : null));
		// get rid of the timezone if we made this a banner
		if (inBanner) {
			this.setPropertyAttribute('DTSTART', 'TZID', null);
			if (this.valueForProperty('DTEND')) this.setPropertyAttribute('DTEND', 'TZID', null);
		}
		// reset the start and (if applicable) end dates to incorporate times (or not)
		if (inBanner && this.valueForProperty('DTSTART').match(/T/)) {
			var dur = this.duration();
			if (!dur.days || dur.days < 1) {
				this.setDuration({days:1});
			}
			this.setPropertyValue('DTSTART', this.valueForProperty('DTSTART').replace(/T.+$/, ''));
			this.mCachedStartDate = this.valueForProperty('DTSTART');
		}
		else if (!inBanner && !this.valueForProperty('DTSTART').match(/T/)) {
			this.setPropertyValue('DTSTART', this.valueForProperty('DTSTART')+'T000000');
		}
	},
	calculateMissingEndDate: function() {
		var dt = createDateObjFromISO8601(this.valueForProperty('DTSTART'));
		if (this.attributeForProperty('DTSTART', 'VALUE') == 'DATE') {
			dt.setDate(dt.getDate()+1);
		}
		else {
			dt.setHours(11);
			dt.setMinutes(59);
			dt.setSeconds(59);
		}
		return dt;
	},
	endDate: function(inOptReturnRawFormat, inOptReturnUncorrected) {
		if (!this.mEventStruct.DTEND) {
			if (this.startDate(false, inOptReturnUncorrected) && this.mEventStruct.DURATION) {
				var dt = getEndDateUsingDuration(this.startDate(false, inOptReturnUncorrected), this.duration());
				return (inOptReturnRawFormat ? dateObjToISO8601(dt) : dt);
			}
			else if (this.mEventStruct.DTSTART) {
				var dt = this.calculateMissingEndDate();
				return (inOptReturnRawFormat ? dateObjToISO8601(dt) : dt);
			}
			return null; // bail -- no start date
		}
		var dtstr = this.mEventStruct.DTEND.value;
		if (!inOptReturnUncorrected) dtstr = timezoneService().correctDateForTimezone(dtstr, this.tzid());
		return (inOptReturnRawFormat ? dtstr : createDateObjFromISO8601(dtstr));
	},
	setEndDate: function(inEndDate) {
		if (inEndDate.constructor == String || inEndDate.constructor == Number) inEndDate = createDateObjFromISO8601(''+inEndDate);
		// if there's a duration, use it instead
		if (this.mEventStruct.DURATION) {
			this.setPropertyValue('DURATION', durationToISO8601(getDurationUsingEndDate(this.startDate(), inEndDate)).replace(/T$/, ''));
			return;
		}
		var endDateStr = dateObjToISO8601(inEndDate, false, false);
		// If this is an banner event, strip the time from the string
		if (this.banner()) {
			endDateStr = endDateStr.replace(/T.+$/, '');
			this.setPropertyAttribute('DTEND', 'TZID', null);
		}
		this.setPropertyValue('DTEND', endDateStr);
		this.hijackEventTimezone();
	},
	duration: function() {
		if (this.mEventStruct.DURATION) {
			return durationFromISO8601(this.mEventStruct.DURATION.value);
		}
		else if (this.mEventStruct.DTSTART && this.mEventStruct.DTEND) {
			return getDurationUsingEndDate(createDateObjFromISO8601(this.valueForProperty('DTSTART')), createDateObjFromISO8601(this.valueForProperty('DTEND')));
		}
		else if (this.mEventStruct.DTSTART) {
			var dt = this.calculateMissingEndDate();
			return getDurationUsingEndDate(createDateObjFromISO8601(this.valueForProperty('DTSTART')), dt);
		}
		return {days:0, hours:0, minutes:0, seconds:0}; // no duration. should we sanity check here?
	},
	setDuration: function(inDuration) {
		if (inDuration.constructor == String) inDuration = durationFromISO8601(inDuration);
		if (this.mEventStruct.DTSTART && this.mEventStruct.DTEND) {
			this.setPropertyValue('DTEND', dateObjToISO8601(getEndDateUsingDuration(this.startDate(), inDuration), false, false));
		}
		else {
			this.setPropertyValue('DURATION', durationToISO8601(inDuration).replace(/T$/, ''));
		}

		this.hijackEventTimezone();
	},
	convertEventDurationToEndDate: function() {
		if (this.mEventStruct.DTEND || !this.mEventStruct.DURATION) return;
		var endDate = this.endDate();
		this.setPropertyValue('DURATION', null);
		this.setEndDate(endDate);
	},
	location: function() {
		return this.valueForProperty('LOCATION');
	},
	setLocation: function(inLocation) {
		// clear out any attendees that match an existing location
		var loc = this.valueForProperty('LOCATION');
		if (loc != null && loc != inLocation) this.removeAttendeeWithUID(loc);
		this.setPropertyValue('LOCATION', inLocation);
	},
	summary: function() {
		return this.valueForProperty('SUMMARY');
	},
	setSummary: function(inSummary) {
		this.setPropertyValue('SUMMARY', inSummary);
	},
	description: function() {
		return this.valueForProperty('DESCRIPTION');
	},
	setDescription: function(inDescription) {
		this.setPropertyValue('DESCRIPTION', inDescription);
	},
	originalEventFromRecurrence: function(/*inOptReturnBoolean, inOptReturnFromOriginalFile*/) { // FIXME originalEventFromRecurrence is deprecated
		throw 'originalEventFromRecurrence is deprecated';
	},
	recurrenceID: function() {
		return this.valueForProperty('RECURRENCE-ID');
	},
	setRecurrenceID: function(inRecurrenceID) {
		this.setPropertyValue('RECURRENCE-ID', inRecurrenceID);
	},
	recurrenceInfo: function() {
		if (!this.mRecurrenceInfo && this.valueForProperty('RRULE')) {
			this.mRecurrenceInfo = new CalendarRecurrence(this, this.valueForProperty('RRULE'));
		}
		return this.mRecurrenceInfo;
	},
	recurrenceIsNew: function() {
		return !this.mOriginalEventStruct.RRULE;
	},
	setRecurrenceFrequency: function(inRecurrenceType) {
		// if we're not really changing this, just bail
		if (this.recurrenceInfo() && (this.recurrenceInfo().frequency() == inRecurrenceType)) {
			return;
		}
		// TODO: handle custom recurrences
		else if (inRecurrenceType.toUpperCase() == 'CUSTOM') {
			return;
		}
		// if we're setting to "NONE" or null, clear the recurrence info object and unset the RRULE
		else if ((inRecurrenceType.toUpperCase() == 'NONE') || !inRecurrenceType) {
			this.setPropertyValue('RRULE', null);
			this.mRecurrenceInfo = null;
			return;
		}
		// finally, create a new recurrence object and set the RRULE
		this.mRecurrenceInfo = (inRecurrenceType ? new CalendarRecurrence(this, 'FREQ='+inRecurrenceType.toUpperCase()) : null);
		this.setPropertyValue('RRULE', this.mRecurrenceInfo.updatedRecurrenceString());
	},
	exceptionDates: function() {
		// bail if there are no EXDATEs.
		if (!this.mEventStruct.EXDATE) return $A([]);
		// find the EXDATE properties
		return this.mEventStruct.findAll(function(prop) {
			return (prop.key == 'EXDATE');
		// grab date objects for each of the exceptions
		}).collect(function(exdateobj) {
			if (!exdateobj.translatedValue) {
				if (exdateobj.calAttrs && exdateobj.calAttrs.TZID) {
					exdateobj.translatedValue = timezoneService().correctDateForTimezone(exdateobj.value, exdateobj.calAttrs.TZID);
				}
				else {
					exdateobj.translatedValue = exdateobj.value;
				}
				exdateobj.translatedValue = createDateObjFromISO8601(exdateobj.translatedValue);
			}
			return exdateobj.translatedValue;
		});
	},
	expandRecurrences: function(inStartDate, inEndDate, inCallback) {
		return this.mParentCalendarFile.expandRecurrencesForEvent(this, inStartDate, inEndDate, inCallback);
	},
	visible: function() {
		// return false if the parent calendar isn't enabled
		if (this.mParentCalendarFile && !this.mParentCalendarFile.mParentCalendar.mEnabled) return false;
		// otherwise, see if the date is detached from the recurrence
		var dtTm = this.startDate().getTime();
		return this.mVisible && (!this.exceptionDates().detect(function(dt) {
			return dt.getTime() == dtTm;
		}));
	},
	setVisible: function(inIsVisible) {
		this.mVisible = inIsVisible;
	},
	recurrenceType: function() {
		if (this.recurrenceInfo()) return CalendarEvent.RecurrenceType.First;
		return CalendarEvent.RecurrenceType.None;
		
		/* -- OLD CODE --
		// Returns where this event lives in a recurrence, or CalendarEvent.RecurrenceType.None if this isn't a recurrent event
		if (this.originalEventFromRecurrence() == this) {
			return CalendarEvent.RecurrenceType.Separated;
		}
		if (this.recurrenceID()) return CalendarEvent.RecurrenceType.Nth;
		// first event in the series
		if (this.recurrenceInfo()) {
			// this might be a CalDAV mirage... a separated event that's missing a recurrence ID
			var origEventFromOrigFile = this.originalEventFromRecurrence(false, true);
			var realOrigEvent = (this.mParentCalendarFile.mOriginalCalendarFile.mEvents.detect(function(evt) {
				return (evt.mEventStruct['RECURRENCE-ID'] && $H(evt.mEventStruct['RECURRENCE-ID']).toJSON() == $H(origEventFromOrigFile.mEventStruct['DTSTART']).toJSON().replace(/"DTSTART"/, '"RECURRENCE-ID"'));
			}));
			if (realOrigEvent) return CalendarEvent.RecurrenceType.Separated;
			// if we didn't find this, it's really a first event
			return CalendarEvent.RecurrenceType.First;
		}
		return CalendarEvent.RecurrenceType.None;*/
	},
	recurrenceChangeAction: function() {
		// Returns the action that will be taken on this recurrence of an event when it's saved.
		return this.mRecurrenceChangeAction || CalendarEvent.RecurrenceChangeAction.Unknown;
	},
	setRecurrenceChangeAction: function(inChangeType) {
		// Determines the action which will take place when this recurrence is changed.
		if (!inChangeType) this.setRecurrenceChangeAction(CalendarEvent.RecurrenceChangeAction.Unknown);
		if (!$H(CalendarEvent.RecurrenceChangeAction).values().include(inChangeType)) throw 'Unknown change action. See CalendarEvent.RecurrenceChangeAction in caldav.js for options.';
		if (this.recurrenceType() == CalendarEvent.RecurrenceType.None) return false; // ignore actions on non-recurrent events
		this.mRecurrenceChangeAction = inChangeType;
	},
	deleteFromServer: function(inCallback) {
		if (this.mParentCalendarFile.mParentCalendar.mLastPathComponent == 'inbox') return this.mParentCalendarFile.deleteEvent(inCallback);
		globalNotificationCenter().publish('WILL_DELETE_CALENDAR_EVENT', this);
		
		if (this.handleRevertChangeAction()) return false;
		
		if (this.recurrenceType() != CalendarEvent.RecurrenceType.None && this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.Unknown) {
			throw 'Cannot delete a recurrent event without first setting a change action. Set a value using the setRecurrenceChangeAction method.';
		}
		
		if (this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.OnlyThis) {
			this.createExceptionDate();
			return this.mParentCalendarFile.saveToServer(inCallback);
		}
		
		if (this.recurrenceType() == CalendarEvent.RecurrenceType.None || this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.AllFuture) {
			return this.mParentCalendarFile.deleteEvent(inCallback);
		}
		
		throw 'Reached an unknown combination of ' + this.recurrenceType() + ' and ' + this.recurrenceChangeAction();
	},
	createExceptionDate: function(inOptFromEvent) {
		var fromEvent = inOptFromEvent || this;
		// hack the event's DTSTART into an exception
		var clonedExdateStruct = Object.toJSON(fromEvent.mEventStruct['RECURRENCE-ID'] || fromEvent.mEventStruct.DTSTART).evalJSON();
		clonedExdateStruct.key = 'EXDATE';
		this.adjustUTCDateToParentTZID(clonedExdateStruct);
		this.mEventStruct.push(clonedExdateStruct);
		this.mEventStruct['EXDATE'] = clonedExdateStruct;
		
	},
	adjustUTCDateToParentTZID: function(utcDateStruct) {
		// If passed a UTC date-time value try and adjust to parent event TZID
		if (!utcDateStruct.value.match(/Z$/)) return;
		var tzid = this.attributeForProperty('DTSTART', 'TZID');
		if (!tzid) return;
		utcDateStruct.value = timezoneService().adjustUTCToLocal(utcDateStruct.value, tzid);
		this.addPopertyAttribute(utcDateStruct, 'TZID', tzid);
	},
	copyEventStructProperties: function(inDestStruct, inOptPropertiesToCopy) {
		this.mEventStruct.each(function(prop) {
			// skip if this isn't in the properties to copy
			if (inOptPropertiesToCopy && inOptPropertiesToCopy.indexOf(prop.key) >= 0) return;
			// skip if this is an already-defined multiprop
			if (CalendarFile.multiProperties.indexOf(prop.key) >= 0 && inDestStruct[prop.key]) return;
			// if it's defined already, replace it
			if (inDestStruct[prop.key]) {
				var idx = inDestStruct.indexOf(inDestStruct[prop.key]);
				inDestStruct[idx] = prop;
				inDestStruct[prop.key] = prop;
			}
			// if it's not defined, add it to both the struct and the array
			else {
				inDestStruct.push(prop);
				inDestStruct[prop.key] = prop;
			}
		});
	},
	cloneEventStruct: function(inOptKeysToSkip) {
		var clonedStruct = $A([]);
		this.mEventStruct.each(function(prop) {
			// bail if we're skipping recurrence keys and we've hit one
			if (inOptKeysToSkip && inOptKeysToSkip.indexOf(prop.key) >= 0) return;
			// create a copy of the property and set it both as an array val and a keyed val
			var clonedProp = Object.toJSON(prop).evalJSON();
			clonedStruct[clonedProp.key] = clonedProp;
			clonedStruct.push(clonedProp);
		});
		clonedStruct.key = 'VEVENT';
		return clonedStruct;
	},
	detach: function() {
		var clonedStruct = this.cloneEventStruct(['RECURRENCE-ID', 'EXDATE', 'RDATE', 'RRULE']);
		
		// generate a RECURRENCE-ID
		var recurrenceStruct = Object.toJSON(this.mOriginalEventStruct.DTSTART).evalJSON();
		recurrenceStruct.key = 'RECURRENCE-ID';
		clonedStruct['RECURRENCE-ID'] = recurrenceStruct;
		clonedStruct.push(recurrenceStruct);
		
		var detachedEvt = new DetachedCalendarEvent(this.mParentCalendarFile, clonedStruct, this);
		detachedEvt.normalizeRecurrenceUID();
		detachedEvt.resetStacks();
		
		detachedEvt.mParentCalendarFile.mCalendarObj.VCALENDAR[0].VEVENT.push(detachedEvt.mEventStruct);
		detachedEvt.mParentCalendarFile.mEvents.push(detachedEvt);
		return detachedEvt;
	},
	organizer: function() {
		// default organizer info comes from the principal
		var org = {
			uid: principalService().mUserPrincipalURL,
			displayname: (principalService().mUserPrincipalInfo ? principalService().mUserPrincipalInfo.displayname : null)
		};
		// try and fetch from the event
		if (this.valueForProperty('ORGANIZER')) {
			org = {uid:this.valueForProperty('ORGANIZER'), displayname:this.attributeForProperty('ORGANIZER', 'CN'), param:this.mEventStruct.ORGANIZER};
		}
		return org;
	},
	organizerIsPrincipal: function() {
		var org = this.organizer();
		if (org.uid == principalService().mUserPrincipalURL) return true;
		return (principalService().mUserPrincipalInfo.calendarUserAddressSet.indexOf(org.uid) >= 0);
	},
	attendees: function() {
		var attlist = $A([this.organizer()]);
		// Bail if there are no attendees.
		if (!this.mEventStruct.ATTENDEE) return attlist;
		// find the organizer so we can exclude from the list (##6536258)
		var org = this.organizer();
		// find all ATTENDEE parameters
		this.mEventStruct.each(function(param) {
			if (param.key == 'ATTENDEE' && param.value != org.uid) {
				attlist.push({
							   uid: param.value,
							   displayname: (param.calAttrs ? param.calAttrs.CN : null),
							   status: (param.calAttrs ? param.calAttrs.PARTSTAT : null),
							   cutype: (param.calAttrs ? param.calAttrs.CUTYPE : null),
							   param: param
							 });
			}
		});
		return attlist;
	},
	overallAttendeeStatus: function() {
		var attendees = this.attendees();
		var status = null;
		for (var attIdx = 0; attIdx < attendees.length; attIdx++) {
			var att = attendees[attIdx];
			if (att.status && (principalService().mUserPrincipalInfo.calendarUserAddressSet.indexOf(att.uid) < 0)) {
				if (status && status != att.status) {
					return 'MIXED';
				}
				else {
					status = att.status;
				}
			}
		}
		return status;
	},
	addAttendee: function(inAttendeeDict) {
		// don't set an attendee twice
		if ((principalService().mUserPrincipalURL == inAttendeeDict.uid && !this.mEventStruct.ATTENDEE) || this.mEventStruct.detect(function(param) {
			return (param.key == 'ATTENDEE' && param.value == inAttendeeDict.uid);
		})) return false;
		// if there's no organizer yet, add one
		if (!this.valueForProperty('ORGANIZER')) {
			this.setPropertyValue('ORGANIZER', principalService().mUserPrincipalURL);
			if (principalService().mUserPrincipalInfo && principalService().mUserPrincipalInfo.displayname) {
				this.setPropertyAttribute('ORGANIZER', 'CN', principalService().mUserPrincipalInfo.displayname);
			}
		}
		// add an attendee record to the new event
		var att = {key:'ATTENDEE', value:inAttendeeDict.uid, calAttrs:{CN:inAttendeeDict.displayname, PARTSTAT:(inAttendeeDict.status || 'NEEDS-ACTION')}};
		if (inAttendeeDict.cutype) {
			att.calAttrs['CUTYPE'] = inAttendeeDict.cutype;
			// if this is a room, remove the other room resources
			if (inAttendeeDict.cutype == 'ROOM' && (!inAttendeeDict.allowMultipleRooms)) {
				this.removeRoomAttendee();
			}
		}
		this.mEventStruct.push(att);
		this.mEventStruct['ATTENDEE'] = att;
		this.updateStack().push('ATTENDEE');
		// add ourselves as an attendee (##6536258)
		this.addAttendee(Object.extend(this.organizer(), {cutype:'INDIVIDUAL', status:'ACCEPTED'}));
		return true;
	},
	removeRoomAttendee: function() {
		for (var paramIdx = this.mEventStruct.length-1; paramIdx >= 0; paramIdx--) {
			var param = this.mEventStruct[paramIdx];
			if (param.key == 'ATTENDEE' && param.calAttrs && param.calAttrs['CUTYPE'] == 'ROOM') {
				this.mEventStruct.splice(paramIdx, 1);
				this.updateStack().push('ATTENDEE');
				return param.value;
			}
		}
		return null;
	},
	removeAttendeeWithUID: function(inAttendeeUID) {
		for (var paramIdx = 0; paramIdx < this.mEventStruct.length; paramIdx++) {
			var param = this.mEventStruct[paramIdx];
			if ((param.key == 'ATTENDEE' || param.key == 'LOCATION') && param.value == inAttendeeUID) {
				this.mEventStruct.splice(paramIdx, 1);
				this.updateStack().push('ATTENDEE');
				return true;
			}
		}
		return false;
	},
	principalAttendee: function() {
		return this.attendees().detect(function(attendee) {
			return (principalService().mUserPrincipalInfo.calendarUserAddressSet.indexOf(attendee.uid) >= 0);
		});
	},
	participantStatus: function() {
		if (this.organizerIsPrincipal()) return null;
		var pa = this.principalAttendee();
		return (pa && pa.param && pa.param.calAttrs ? pa.param.calAttrs.PARTSTAT : null);
	},
	setParticipantStatus: function(inParticipantStatus) {
		var pa = this.principalAttendee();
		if (!pa) return false;
		if (!pa.param.calAttrs) pa.param.calAttrs = {};
		pa.param.calAttrs.PARTSTAT = inParticipantStatus;
		// try to set the TRANSP and X-APPLE-NEEDS-REPLY parameters
		this.setPropertyValue('TRANSP', (inParticipantStatus == 'DECLINED') ? 'TRANSPARENT' : 'OPAQUE');
		if (this.valueForProperty('X-APPLE-NEEDS-REPLY') == 'TRUE') this.setPropertyValue('X-APPLE-NEEDS-REPLY', 'FALSE');
		if (pa.param.calAttrs.RSVP) delete pa.param.calAttrs.RSVP;
		return true;
	},
	getFreeBusyReport: function(inCallback, inOptStartDate, inOptEndDate, inOptAttendees) {
		if (!this.mFreeBusyLookupObj) this.mFreeBusyLookupObj = new FreeBusyLookup(this);
		var sd = inOptStartDate || this.startDate();
		var ed = inOptEndDate || getEndDateUsingDuration(this.startDate(), this.duration());
		this.mFreeBusyLookupObj.getFreeBusyForDateRange(sd, ed, inCallback, inOptAttendees);
	},
	incrementSequenceNumber: function() {
		var existingSequenceNumber = this.valueForProperty('SEQUENCE');
		existingSequenceNumber = existingSequenceNumber && existingSequenceNumber.match(/^\d/) ? parseInt(existingSequenceNumber) : 0;
		this.setPropertyValue('SEQUENCE', ''+(++existingSequenceNumber));
	},
	handleRevertChangeAction: function() { // for subclass use only
		// if we're postponing or reverting, handle this first
		if ([CalendarEvent.RecurrenceChangeAction.Revert, CalendarEvent.RecurrenceChangeAction.Postpone].indexOf(this.recurrenceChangeAction()) >= 0) {
			// if we're reverting the event, do so now
			if (this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.Revert) this.revertToSaved(true);
			// set the change action back to unknown
			this.setRecurrenceChangeAction(CalendarEvent.RecurrenceChangeAction.Unknown);
			return true;
		}
		return false;
	},
	saveToServer: function(inCallback) {
		globalNotificationCenter().publish('WILL_SAVE_CALENDAR_EVENT', this);
		if (this.handleRevertChangeAction()) return false;
		// shared callback for after saving
		var afterSaveCallback = function(transport) {
			this.mIsNew = false;
			this.setRecurrenceChangeAction(CalendarEvent.RecurrenceChangeAction.Unknown);
			if (inCallback) inCallback(transport);
		}
		// if this is a new event or doesn't have recurrences, or if the recurrence info is new, we can just save it normally
		if (this.isNew() || this.recurrenceType() == CalendarEvent.RecurrenceType.None || this.recurrenceIsNew()) {
			if (this.mPartStatChange) this.setParticipantStatus(this.mPartStatChange);
			return this.mParentCalendarFile.saveToServer(afterSaveCallback.bind(this));
		}
		// if we moved at all...
		if (this.recurrenceType() == CalendarEvent.RecurrenceType.First && this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.AllFuture && Object.toJSON(this.mEventStruct.DTSTART) != Object.toJSON(this.mOriginalEventStruct.DTSTART)) {
			// find out how much the start date moved
			var movedAmt = getDurationUsingEndDate(this.mOriginalLocalStartDate, this.startDate(false, true));
			// update all EXDATES on this event
			this.mEventStruct.each(function(prop) {
				if (prop.key != 'EXDATE') return;
				var dt = createDateObjFromISO8601(prop.value);
				dt = getEndDateUsingDuration(dt, movedAmt);
				prop.value = dateObjToISO8601(dt);
			});
			// find all other events in the calendar file and move their recurrence IDs
			this.mParentCalendarFile.mEvents.each(function(oEvt) {
				if (!oEvt.recurrenceID()) return;
				var recurrenceDate = createDateObjFromISO8601(oEvt.recurrenceID());
				recurrenceDate = getEndDateUsingDuration(recurrenceDate, movedAmt);
				oEvt.setRecurrenceID(dateObjToISO8601(recurrenceDate, false, true));
			});
		}
		// if this is an already separated calendar event, assume "only this" and save as-is
		if (this.recurrenceType() == CalendarEvent.RecurrenceType.Separated) {
			if (this.mPartStatChange) this.setParticipantStatus(this.mPartStatChange);
			return this.mParentCalendarFile.saveToServer(afterSaveCallback.bind(this));
		}
		// if this event has no recurrence change action, throw an exception here
		if (this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.Unknown) {
			throw 'Cannot save a recurrent event without first setting a change action. Set a value using the setRecurrenceChangeAction method.';
		}
		// just save if we chose "All Future"
		if (this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.AllFuture) {
			return this.mParentCalendarFile.saveToServer(afterSaveCallback.bind(this));
		}
		// if "Only This" is chosen, detach the event
		if (this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.OnlyThis) {
			this.mReplacementEvent = this.detach();
			if (this.mPartStatChange) this.mReplacementEvent.setParticipantStatus(this.mPartStatChange);
			this.revertToSaved(true);
			return this.mParentCalendarFile.saveToServer(afterSaveCallback.bind(this));
		}
		throw 'Reached an unknown combination of ' + this.recurrenceType() + ' and ' + this.recurrenceChangeAction();
	},
	revertToSaved: function(inOptRevertDates) {
		this.setRecurrenceChangeAction(CalendarEvent.RecurrenceChangeAction.Unknown);
		var idx = this.mParentCalendarFile.mCalendarObj.VCALENDAR[0].VEVENT.indexOf(this.mEventStruct);
		this.mParentCalendarFile.mCalendarObj.VCALENDAR[0].VEVENT.splice(idx, 1, this.mOriginalEventStruct);
		this.mEventStruct = this.mOriginalEventStruct;
		this.resetStacks();
		globalNotificationCenter().publish('DID_REVERT_CALENDAR_EVENT', this);
	},
	moveToCalendar: function(inDestinationCalendar, inCallback) {
		return this.mParentCalendarFile.moveToCalendar(inDestinationCalendar, inCallback);
	},
	userCanWriteContent: function() {
		return this.mParentCalendarFile.mParentCalendar.userCanWriteContent();
	}
});

/* 
 * An ExpandedCalendarEvent is a "virtual" calendar event which represents a recurrence expansion.
 * It has no equivalent on the server until you detach it.
 */
var ExpandedCalendarEvent = Class.create(CalendarEvent, {
	// FIXME expanded events should show dotted lines for invites too
	initialize: function($super, inParentCalendarFile, inEventStruct, inParentEvent) {
		if (!inParentEvent)
			throw 'Tried to create an expanded calendar event without a parent event.';
		this.mParentEvent = inParentEvent;
		$super(inParentCalendarFile, inEventStruct);
		// server sends back GMT datetimes with a timezone; correct
		var tzid = this.attributeForProperty('DTSTART', 'TZID');
		var dtstart = this.valueForProperty('DTSTART');
		if (tzid && dtstart && !dtstart.match(/Z$/)) {
			this.mEventStruct.DTSTART.value = timezoneService().correctDateForTimezone(dtstart, tzid);
		}
	},
	valueForProperty: function($super, inPropertyName) {
	 	return $super(inPropertyName) || this.mParentEvent.valueForProperty(inPropertyName);
	},
	attributeForProperty: function($super, inPropertyName, inAttributeName) {
		return $super(inPropertyName, inAttributeName) || this.mParentEvent.attributeForProperty(inPropertyName, inAttributeName);
	},
	allReferencedTZIDs: function($super) {
		return $A($super(), this.mParentEvent.allReferencedTZIDs()).flatten().uniq();
	},
	recurrenceType: function() {
		return CalendarEvent.RecurrenceType.Nth;
	},
	exceptionDates: function() {
		return this.mParentEvent.exceptionDates();
	},
	deleteFromServer: function($super, inCallback) {
		globalNotificationCenter().publish('WILL_DELETE_CALENDAR_EVENT', this);
		if (this.handleRevertChangeAction()) return false;
		if (this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.OnlyThis) {
			this.createExceptionDate();
			return this.mParentEvent.mParentCalendarFile.saveToServer(inCallback);
		}
		if (this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.AllFuture) {
			// set the UNTIL on the original recurrence info to 1 sec before this event
			var untilDate = this.startDate();
			untilDate.setSeconds(untilDate.getSeconds()-1);
			this.recurrenceInfo().setUntil(untilDate, this.banner());
			return this.mParentEvent.mParentCalendarFile.saveToServer(inCallback);
		}
		throw 'Reached an unknown combination of ' + this.recurrenceType() + ' and ' + this.recurrenceChangeAction();
	},
	detach: function() {
		// don't copy these properties when cloning the detached event
		var propertiesToSkip = ['DTSTART', 'DTEND', 'DURATION', 'RECURRENCE-ID', 'EXDATE', 'RDATE', 'RRULE'];
		if (this.updateStack().indexOf('ATTENDEE') >= 0) propertiesToSkip.push('ATTENDEE');
		// clone the original event to the detached one
		var clonedStruct = this.mParentEvent.cloneEventStruct(propertiesToSkip);
		// copy the current event's values on top
		this.copyEventStructProperties(clonedStruct);
		
		// Fix up timezones
		this.adjustUTCDateToParentTZID(clonedStruct['RECURRENCE-ID']);
		this.adjustUTCDateToParentTZID(clonedStruct['DTSTART']);
		if (clonedStruct['DTEND']) {
			this.adjustUTCDateToParentTZID(clonedStruct['DTSTART']);
		}

		var detachedEvt = new DetachedCalendarEvent(this.mParentEvent.mParentCalendarFile, clonedStruct, this);
		detachedEvt.mParentCalendarFile.mCalendarObj.VCALENDAR[0].VEVENT[detachedEvt.mParentCalendarFile.mCalendarObj.VCALENDAR[0].VEVENT.length] = clonedStruct;
		detachedEvt.mParentCalendarFile.mEvents.push(detachedEvt);
		return detachedEvt;
	},
	createExceptionDate: function() {
		this.mParentEvent.createExceptionDate(this);
	},
	attendees: function() {
		return this.mParentEvent.attendees();
	},
	setRecurrenceFrequency: function(inRecurrenceType) {
		this.mParentEvent.setRecurrenceFrequency(inRecurrenceType);
	},
	recurrenceInfo: function() {
		return this.mParentEvent.recurrenceInfo();
	},
	recurrenceIsNew: function() {
		return false;
	},
	saveToServer: function($super, inCallback) {
		globalNotificationCenter().publish('WILL_SAVE_CALENDAR_EVENT', this);
		if (this.handleRevertChangeAction()) return false;
		// if the event has no recurrence change action, throw an exception here
		if (this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.Unknown) {
			throw 'Cannot save a recurrent event without first setting a change action. Set a value using the setRecurrenceChangeAction method.';
		}
		var callbackCount = 1; // run the callback when this is decremented to 0; for save operations that have multiple results
		var afterSaveCallback = function(transport) {
			if (--callbackCount > 0) return;
			this.mIsNew = false;
			this.setRecurrenceChangeAction(CalendarEvent.RecurrenceChangeAction.Unknown);
			if (inCallback) inCallback(transport);
		}
		// if "Only This" is chosen, detach the event
		if (this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.OnlyThis) {
			this.mReplacementEvent = this.detach();
			if (this.mPartStatChange) this.mReplacementEvent.setParticipantStatus(this.mPartStatChange);
			this.revertToSaved(true);
			return this.mReplacementEvent.mParentCalendarFile.saveToServer(afterSaveCallback.bind(this));
		}
		// if "All Future" is selected, change the original's recurrence end date
		if (this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.AllFuture) {
			// clone the original event to the detached one
			var clonedStruct = this.mParentEvent.cloneEventStruct(['RECURRENCE-ID', 'DTSTART']);
			// copy the current event's values on top
			this.copyEventStructProperties(clonedStruct);
			this.mReplacementEvent = this.mParentCalendarFile.mParentCalendar.createCalendarEvent();
			// stash away the UID
			var uid = this.mReplacementEvent.valueForProperty('UID');
			// clone the detached event and its parent into the new event
			this.mReplacementEvent.mEventStruct = clonedStruct;
			this.mReplacementEvent.mParentCalendarFile.mCalendarObj.VCALENDAR[0].VEVENT[0] = clonedStruct;
			this.mReplacementEvent.setPropertyValue('RECURRENCE-ID', null);
			this.mReplacementEvent.mEventStruct.UID.value = uid;
			this.mReplacementEvent.mEventStruct.each(function(prop) {if (prop.key == 'UID') prop.value = uid});

			// We need to add a "uid:" prefix to make sure this value can legitimately be used as a property on an array
			this.mReplacementEvent.uid = "uid:" + uid;

			this.mReplacementEvent.resetStacks();
			if (this.mPartStatChange) this.mReplacementEvent.setParticipantStatus(this.mPartStatChange);
			// re-set the UID
			// set the UNTIL on the original recurrence info to 1 sec before this event
			var untilDate = this.startDate();
			untilDate.setSeconds(untilDate.getSeconds()-1);
			this.recurrenceInfo().setUntil(untilDate, this.banner());
			// save both events to the server
			callbackCount++;
			this.mParentEvent.mParentCalendarFile.saveToServer(afterSaveCallback.bind(this));
			return this.mReplacementEvent.mParentCalendarFile.saveToServer(afterSaveCallback.bind(this));
		}
		throw 'Reached an unknown combination of ' + this.recurrenceType() + ' and ' + this.recurrenceChangeAction();
	}
});

var DetachedCalendarEvent = Class.create(CalendarEvent, {
	initialize: function($super, inParentCalendarFile, inEventStruct, inParentEvent) {
		if (!inParentEvent)
			throw 'Tried to create a detached calendar event without a parent event.';
		this.mParentEvent = inParentEvent;
		$super(inParentCalendarFile, inEventStruct);
	},
	recurrenceType: function() {
		return CalendarEvent.RecurrenceType.Separated;
	},
	deleteFromServer: function($super, inCallback) {
		globalNotificationCenter().publish('WILL_DELETE_CALENDAR_EVENT', this);
		if (this.handleRevertChangeAction()) return false;
		if (this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.OnlyThis) {
			// FIXME need to remove event struct in deleteFromServer for OnlyThis on an DetachedCalendarEvent
			this.createExceptionDate();
			return this.saveToServer(inCallback);
		}
		if (this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.AllFuture) {
			if (this.getDate(true) == this.mParentEvent.getDate(true)) {
				return $super(inCallback);
			}
			// FIXME need to implement delete all future for separated events
			throw 'need to implement delete all future for separated events';
		}
		throw 'Reached an unknown combination of ' + this.recurrenceType() + ' and ' + this.recurrenceChangeAction();
	},
	createExceptionDate: function() {
		// FIXME: this line below has never worked, but shouldn't cause any problems
		this.mParentCalendarFile.mEvents = this.mParentCalendarFile.mEvents.without(this);
		
		var idx = this.mParentCalendarFile.mCalendarObj.VCALENDAR[0].indexOf(this.mParentCalendarFile.mCalendarObj.VCALENDAR[0].VEVENT);
		var newEventList = this.mParentCalendarFile.mCalendarObj.VCALENDAR[0].VEVENT.without(this.mEventStruct);
		this.mParentCalendarFile.mCalendarObj.VCALENDAR[0][idx] = newEventList;
		this.mParentCalendarFile.mCalendarObj.VCALENDAR[0].VEVENT = newEventList;
		
		this.mParentEvent.createExceptionDate(this);
	},
	setRecurrenceFrequency: function(inRecurrenceType) {
		this.mParentEvent.setRecurrenceFrequency(inRecurrenceType);
	},
	recurrenceInfo: function() {
		return this.mParentEvent.recurrenceInfo();
	},
	recurrenceIsNew: function() {
		return false;
	}
});

// Represents an event that you've been invited to, but for which no parent is available
var DetachedAttendeeCalendarEvent = Class.create(CalendarEvent, {
	initialize: function($super, inParentCalendarFile, inEventStruct) {
		$super(inParentCalendarFile, inEventStruct);
	},
	recurrenceType: function() {
		return CalendarEvent.RecurrenceType.Separated;
	},
	deleteFromServer: function($super, inCallback) {
		// this is actually the equivalent of declining
		// FIXME: we get shown a "Really delete?" message, but iCal shows a "Decline?" message
		this.setParticipantStatus('DECLINED');
		this.saveToServer(inCallback);
	},
	createExceptionDate: function() {
		throw 'cannot create an exception date for an event you do not own';
	},
	setRecurrenceFrequency: function(inRecurrenceType) {
		throw 'cannot modify recurrence frequency for an event you do not own';
	},
	recurrenceInfo: function() {
		return null;
	},
	recurrenceIsNew: function() {
		return false;
	}
});

CalendarEvent.RecurrenceType = {
	None: 'NO-RECURRENCE',
	First: 'FIRST-RECURRENCE',
	Nth: 'NTH-RECURRENCE',
	Separated: 'SEPARATED-RECURRENCE'
}

CalendarEvent.RecurrenceChangeAction = {
	Unknown: 'UNKNOWN',
	AllFuture: 'ALL-FUTURE',
	OnlyThis: 'ONLY-THIS',
	Revert: 'REVERT',
	Postpone: 'POSTPONE'
}


/**
 * CalendarRecurrence
 * Data class for getting and setting recurrence info.
 */
var CalendarRecurrence = Class.create();
CalendarRecurrence.prototype = {
	initialize: function(inParentCalendarEvent, inRecurrenceString) {
		this.mParentCalendarEvent = inParentCalendarEvent;
		this.mRecurrenceStruct = {};
		$A(inRecurrenceString.split(';')).each(function(keyval) {
			var setting = keyval.match(/^([^=]+)=(.*)$/);
			if (setting) this.mRecurrenceStruct[setting[1]] = setting[2];
		}, this);
	},
	updatedRecurrenceString: function() {
		return $H(this.mRecurrenceStruct).collect(function(attr) {
			return attr.key+'='+attr.value;
		}).join(';');
	},
	frequency: function() {
		return this.mRecurrenceStruct.FREQ;
	},
	isWeekdays: function() {
		var byday = this.mRecurrenceStruct.BYDAY;
		return (this.frequency() == 'WEEKLY' && byday && byday.split(',').length == 5 && !['MO', 'TU', 'WE', 'TH', 'FR'].detect(function(day) {
			return (byday.indexOf(day) < 0);
		}));
	},
	count: function() {
		return this.mRecurrenceStruct.COUNT;
	},
	setCount: function(inCount) {
		if (this.mRecurrenceStruct.UNTIL) delete this.mRecurrenceStruct.UNTIL;
		if (!inCount || !inCount.match(/^\d/)) {
			if (this.mRecurrenceStruct.COUNT) delete this.mRecurrenceStruct.COUNT;
		}
		else {
			this.mRecurrenceStruct.COUNT = ''+parseInt(inCount);
		}
		this.mParentCalendarEvent.setPropertyValue('RRULE', this.updatedRecurrenceString());
	},
	until: function(inOptReturnRawFormat) {
		if (!this.mRecurrenceStruct.UNTIL) return null;
		return (inOptReturnRawFormat ? this.mRecurrenceStruct.UNITL : createDateObjFromISO8601(this.mRecurrenceStruct.UNTIL));
	},
	setUntil: function(inUntil, inBanner) {
		// convert date object to ISO8601, if applicable
		if (inUntil && inUntil.constructor != String) inUntil = dateObjToISO8601(inUntil);
		// move from the event's timezone to GMT
		inUntil = timezoneService().correctDateForTimezone(inUntil, this.mParentCalendarEvent.tzid(), true);
		//<rdar://problem/7123406> Web calendar client needs to use a DATE value for the UNTIL when DTSTART is also a DATE
		if (inBanner) inUntil = removeTime(inUntil);
		if (this.mRecurrenceStruct.COUNT) delete this.mRecurrenceStruct.COUNT;
		if (!inUntil) {
			if (this.mRecurrenceStruct.UNTIL) delete this.mRecurrenceStruct.UNTIL;
		}
		else {
			this.mRecurrenceStruct.UNTIL = inUntil;
		}
		this.mParentCalendarEvent.setPropertyValue('RRULE', this.updatedRecurrenceString());
	}
}


/**
 * FreeBusyLookup
 * Encapsulation for freebusy lookup.
 */
FreeBusyLookup = Class.create();
FreeBusyLookup.prototype = {
	initialize: function(inParentCalendarEvent) {
		this.mParentCalendarEvent = inParentCalendarEvent;
	},
	getFreeBusyForDateRange: function(inStartDate, inEndDate, inCallback, inOptAttendees) {
		var attendees = inOptAttendees || this.mParentCalendarEvent.attendees();
		// pull any email address attendees from the report
		attendees = attendees.findAll(function(att) {
			return (!att.uid.match(/^mailto:/));
		});
		// format looks like: $A([{url:principalService().mUserPrincipalURL, displayname:'Super User'}]);
		var gotPrincipalInfoCallback = function(inPrincipalInfo) {
			var reportString = String.format(FreeBusyLookup.defaultFormat, {
				DTSTAMP: dateObjToISO8601(new Date(), true, true),
				ORGANIZER: this.mParentCalendarEvent.organizer().uid,
				DTSTART: dateObjToISO8601(inStartDate, true, true),
				DTEND: dateObjToISO8601(inEndDate, true, true),
				UID: CalendarUuid.generateUUIDString(),
				attendees: attendees.collect(function(attendeeObj) {
					return String.format('ATTENDEE%(cn)s:%(uid)s', {
						cn: (attendeeObj.displayname ? ';CN='+attendeeObj.displayname : ''),
						uid: attendeeObj.uid
					});
				}).join('\n')
			});
			var reportCallback = function(transport) {
				// this should never happen; probably means we got invalid XML or a MIME type that isn't text/xml
				if (!transport.responseXML) {
					reportError('Report response is missing responseXML. responseText = '+transport.responseText || '');
					return false;
				}
				// get each response object
				var freeBusyInfoForAttendees = $A([]);
				Element.childrenWithNodeName(Element.firstChildWithNodeName(transport.responseXML, 'schedule-response'), 'response').each(function(response) {
					var recipient = Element.firstNodeValue(Element.elementWithSimpleXPath(response, 'recipient.href'));
					// check for success
					var freeBusyObj = {recipient:recipient, requestStatus:Element.firstNodeValue(Element.firstChildWithNodeName(response, 'request-status'))};
					if (freeBusyObj.requestStatus == '2.0;Success') {
						freeBusyObj.blocks = $A([]);
						// create a temporary calendar file
						var calendarText = Element.firstNodeValue(Element.firstChildWithNodeName(response, 'calendar-data'));
						var tempCalFile = new CalendarFile(calendarText, null, this.mParentCalendarEvent.mParentCalendarFile.mParentCalendar);
						// find all of the freebusy properties
						tempCalFile.mCalendarObj.VCALENDAR[0].VFREEBUSY[0].each(function(prop) {
							if (prop.key == 'FREEBUSY') {
								$A(prop.value.split(',')).each(function(pair) {
									var splitPair = pair.split('/');
									var duration = null;
									// make sure we have a duration, not an end date. Then get a duration object
									if (splitPair[1].match(/^P/)) {
										duration = durationFromISO8601(splitPair[1]);
									}
									else {
										duration = getDurationUsingEndDate(createDateObjFromISO8601(splitPair[0], true), createDateObjFromISO8601(splitPair[1], true));
									}
									// push a freebusy block object onto the list
									freeBusyObj.blocks.push({
										type: prop.calAttrs.FBTYPE,
										startDate: createDateObjFromISO8601(timezoneService().correctDateForTimezone(splitPair[0], null, false)),
										duration: duration
									});
								});
							}
						});
						freeBusyInfoForAttendees.push(freeBusyObj);
					}
				}, this);
				if (inCallback) inCallback(freeBusyInfoForAttendees);
			}
			return new Ajax.CalendarRequest(inPrincipalInfo.outboxurl, {
				method: 'post',
				contentType: 'text/calendar',
				postBody: reportString,
				recipients: attendees.pluck('uid'),
				requestHeaders: {
					originator: principalService().mUserPrincipalURL
				},
				onSuccess: reportCallback.bind(this),
				onException: reportError,
				errorNotificationObject: this
			});
		}
		principalService().getPrincipalInfo(gotPrincipalInfoCallback.bind(this));
	}
}
FreeBusyLookup.defaultFormat = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Apple Inc.//Web Calendar Client//\nMETHOD:REQUEST\n'
		+ 'BEGIN:VFREEBUSY\nDTSTAMP:%(DTSTAMP)s\nORGANIZER:%(ORGANIZER)s\nDTSTART:%(DTSTART)s\nDTEND:%(DTEND)s\nUID:%(UID)s\n'
		+ '%(attendees)s\nEND:VFREEBUSY\nEND:VCALENDAR';
FreeBusyLookup.emailAddressTest = /^(mailto:)*[^\s\/:]+@\S+\.\S+/;



var UpcomingEventsService = Class.createWithSharedInstance('upcomingEventsService');
UpcomingEventsService.DayRange = 30;  // # of days worth of events
UpcomingEventsService.prototype = {
	initialize: function()
	{
		this.mEvents   = [];
		this.mRemoteCalendarCollection = null;
		
		this.gotPrincipalInfo      = this.gotPrincipalInfo.bind(this);
		this.gotCalendarCollection = this.gotCalendarCollection.bind(this);
		this.gotCalendarEvents     = this.gotCalendarEvents.bind(this);
		
		// kick off by fetching the principal info...
		principalService().getPrincipalInfo(this.gotPrincipalInfo);
	},
	gotPrincipalInfo: function()
	{
		// once we have the pricipal info, get the entity's calendar collection...
		if (window.globalNotificationCenter) {
			globalNotificationCenter().subscribe('GOT_CALENDAR_COLLECTION', this.gotCalendarCollection, this.mRemoteCalendarCollection);
		}
		else {
			globalNotificationCenter().subscribe('GOT_CALENDAR_COLLECTION', this.gotCalendarCollection, this.mRemoteCalendarCollection);
		}
		// calendars are fetched on instantiation
		this.mRemoteCalendarCollection = new RemoteCalendarCollection(principalService().mUserPrincipalInfo.url + '/');
	},
	gotCalendarCollection: function(inNotificationType, inCalendarCollection)
	{
		// now call refresh, which will fetch the events... 
		// though since the notification could come from any instance of RemoteCalendarCollection, make sure this one is from ours.
		if (inCalendarCollection == this.mRemoteCalendarCollection) {
			this.reload();
		}
	},
	
	reload: function()
	{
		if (!this.mRemoteCalendarCollection) return;
		
		var start = new Date();
		var end = new Date();
		end.setDate(start.getDate() + UpcomingEventsService.DayRange);
		this.mRemoteCalendarCollection.getEventsForDateRange(start, end, this.gotCalendarEvents);
	},
	gotCalendarEvents: function(inRequest, inCalendarEvents)
	{
		var timezoneCallback = function() {
			globalNotificationCenter().publish('GOT_UPCOMING_EVENTS', this.mEvents);
		}.bind(this);
		this.mEvents = inCalendarEvents;
		var timezoneEvents = this.mEvents.clone();
		timezoneService().fetchOffsetsForEvents(timezoneCallback, timezoneEvents);
	}
};


/**
 * Useful string extensions.
 */
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

function padNumberStr(theNumber, digits) {
	var padder = ((arguments.length > 2) ? arguments[2] : '0');
	var theString = "";
	theString += theNumber;
	
	for (var i = 0; i < (digits-theString.length); i++) {
		theString = padder + theString;
	}
	
	return theString;
}


/**
 * Useful array methods.
 */
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
 * Methods for traversing other DOMs.
 */
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
		for (var childIdx = 0; childIdx < inParent.childNodes.length; childIdx++) {
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


/**
 * UUID
 */
var CalendarUuid = Class.create();
CalendarUuid.prototype = {
	initialize: function() {
		var olderDate = new Date(1582, 10, 15, 0, 0, 0, 0);
		var now = new Date();
		var msec = now.valueOf() - olderDate.valueOf();
		var nic = padNumberStr(hex_hmac_md5(this.getShiftedBits(this.getRandomNumberInRange(0, 4095), 0, 16), location.href), 12).substring(0, 12);
		var uidArray = [
			this.getShiftedBits(msec, 0, 8),
			this.getShiftedBits(msec, 8, 12),
			this.getShiftedBits(msec, 12, 19)+'1',
			this.getShiftedBits(this.getRandomNumberInRange(0, 4095), 0, 2) + this.getShiftedBits(this.getRandomNumberInRange(0, 4095), 0, 2),
			nic
		];
		this.mStringValue = uidArray.join('-');
	},
	getRandomNumberInRange: function(inMin, inMax) {
		return Math.min(Math.max(Math.round((Math.random() * (inMin + inMax)) - inMin), inMin), inMax);
	},
	getShiftedBits: function(inValue, inStart, inEnd) {
		var base16str = padNumberStr(inValue.toString(16), inEnd);
		return base16str.substring(inStart, inEnd);
	},
	toString: function() {
		return this.mStringValue;
	}
}
CalendarUuid.generateUUIDString = function() {
	return (new CalendarUuid()).toString();
}

/**
 * Override Prototype's Request object to allow custom HTTP methods.
 */
Ajax.CalendarRequest = Class.create();
Object.extend(Object.extend(Ajax.CalendarRequest.prototype, Ajax.Request.prototype), {
	setRequestRecipients: function() {
		if (this.options.recipients) {
			$A(this.options.recipients).each(function(recipient) {
				this.transport.setRequestHeader('Recipient', recipient);
			}, this);
		}
	},
	request: function(url) {
		if (!this.options.onFailure && this.options.errorNotificationObject) {
			this.options.on0 = function() {
				if (!globalNotificationCenter().publish('ERROR_FROM_SERVER', this.options.errorNotificationObject, {request:this, errorObj:this}) && window.dispatchException) dispatchException(this);
			}.bind(this);
			this.options.onFailure = function(e) {
				if (!globalNotificationCenter().publish('ERROR_FROM_SERVER', this.options.errorNotificationObject, {request:this, errorObj:e}) && window.dispatchException) dispatchException(e);
			}.bind(this);
		}
		this.url = url;
		this.method = this.options.method;
		var params = Object.clone(this.options.parameters);

		this.parameters = params;

		if (params = Hash.toQueryString(params)) {
			// when GET, append parameters to URL
			if (this.method == 'get')
				this.url += (this.url.include('?') ? '&' : '?') + params;
			else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent))
				params += '&_=';
		}

		try {
			if (this.options.onCreate) this.options.onCreate(this.transport);
			Ajax.Responders.dispatch('onCreate', this, this.transport);
			
			if (Prototype.Browser.IE && Ajax.CalendarRequest.gimpedIEMethods.include(this.method.toUpperCase())) {
				this.actualMethod = this.method.toUpperCase();
				this.method = 'POST';
			}
			
			this.transport.open(this.method.toUpperCase(), this.url,
				this.options.asynchronous);

			if (this.options.asynchronous)
				setTimeout(function() { this.respondToReadyState(1) }.bind(this), 10);

			this.transport.onreadystatechange = this.onStateChange.bind(this);
			this.setRequestHeaders();
			
			// IE workaround since it won't send REPORT or MKCALENDAR requests
			if (this.actualMethod) this.transport.setRequestHeader('X-HTTP-Method-Override', this.actualMethod);
			
			this.setRequestRecipients();

			this.body = this.method == 'get' ? null : (this.options.postBody || params);
			this.transport.send(this.body);

			/* Force Firefox to handle ready state 4 for synchronous requests */
			if (!this.options.asynchronous && this.transport.overrideMimeType)
				this.onStateChange();

		}
		catch (e) {
			this.dispatchException(e);
		}
	},
	success: function() {
		var status = this.getStatus();
		// http://dev.jquery.com/ticket/1450
		return (!status || (status >= 200 && status < 300) || /* 7231636 */ (Prototype.Browser.IE && status == 1223));
  	}
});
Ajax.CalendarRequest.gimpedIEMethods = $A(['REPORT', 'MKCALENDAR']);

if (window.loaded) loaded('caldav.js');
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

var TimeTextField = Class.create();
TimeTextField.prototype = {
	mSelectedDate: new Date(),
	mRestrictBeforeTimeField: null,
	mRestrictAfterTimeField: null,
	mDirty: false,
	initialize: function(inElement /*,[options]*/) {
		bindEventListeners(this, ['handleChanged', 'handleKeyPress']);
		this.mElement = $(inElement);
		this.mElement.addClassName('timetextfield');
		if (arguments.length > 1) Object.extend(this, arguments[1]);
		observeEvents(this, this.mElement, {change:'handleChanged', keydown:'handleKeyPress'});
		this.updateShownDate();
	},
	handleChanged: function(inEvent) {
		var dateStr = this.mElement.value;
		// if we see a PM then add 12 hours
		var hourDelta = (dateStr.toLowerCase().indexOf('_Calendar.AMPM.PM'.loc().toLowerCase()) < 0 ? 0 : 12);
		var hours = (-1);
		var minutes = 0;
		// match 12:34
		var hoursAndMinutesMatch = dateStr.match(/(\d{1,2})[:-](\d{1,2})/);
		var hoursMatch = dateStr.match(/(\d{1,2})/);
		if (hoursAndMinutesMatch) {
			hours = parseInt(hoursAndMinutesMatch[1]) + hourDelta;
			minutes = parseInt(hoursAndMinutesMatch[2]);
		}
		// match just an hour
		else if (hoursMatch) {
			hours = parseInt(hoursMatch[1]) + hourDelta;
		}
		// match 12 (such as 12 pm)
		if (hours % 12 == 0) {
			hours = ((hours / 12) - 1) * 12;
		}
		// sanity check
		if ((0 > hours || hours > 23) || (0 > minutes || minutes > 59)) {
			this.updateShownDate();
			return false;
		}
		// set a new date
		var dt = new Date(this.mSelectedDate.getTime());
		dt.setHours(hours);
		dt.setMinutes(minutes);
		if (!this.setValue(dt, true)) return false;
		this.mDirty = true;
		globalNotificationCenter().publish('TIME_FIELD_CHANGED', this, {value:this.getValue()});
	},
	handleKeyPress: function(inEvent) {
		var delta = 0;
		if (inEvent.keyCode == Event.KEY_DOWN) {
			if (this.mSelectedDate.getHours() > 0) {
				delta = (-1);
				inEvent.stop();
			}
		}
		else if (inEvent.keyCode == Event.KEY_UP) {
			if (this.mSelectedDate.getHours() < 23) {
				delta = 1;
				inEvent.stop();
			}
		}
		if (delta != 0) {
			var dt = new Date(this.mSelectedDate.getTime());
			dt.setHours(dt.getHours() + delta);
			if (this.setValue(dt, true)) {
				this.mDirty = true;
				globalNotificationCenter().publish('TIME_FIELD_CHANGED', this, {value:this.getValue()});
			}
		}
	},
	updateShownDate: function() {
		this.mElement.value = this.mSelectedDate.formatDate('_Dates.DateFormats.HourAndMinutes'.loc());
	},
	getValue: function() {
		return new Date(this.mSelectedDate.getTime());
	},
	setValue: function(inDateValue, inOptCheckValue) {
		globalNotificationCenter().publish('SELECTED_DATE_WILL_CHANGE', this);
		if (inOptCheckValue && (
				(this.mRestrictBeforeTimeField && inDateValue > this.mRestrictBeforeTimeField.mSelectedDate)
				|| (this.mRestrictAfterTimeField && inDateValue < this.mRestrictAfterTimeField.mSelectedDate))) {
			this.updateShownDate();
			return false;
		}
		var oldSelectedDate = this.mSelectedDate;
		this.mSelectedDate = inDateValue;
		this.updateShownDate();
		this.mDirty = false;
		globalNotificationCenter().publish('SELECTED_DATE_CHANGED', this, {selectedDate:this.mSelectedDate, oldSelectedDate:oldSelectedDate});
		return true;
	}
}

var CalendarColorPicker = Class.create();
CalendarColorPicker.prototype = {
	mColorKeys: ['Blue', 'Green', 'Red', 'Orange', 'Pink', 'Purple'],
	initialize: function(inParentElement, inPopupElementID) {
		this.mParentElement = $(inParentElement);
		this.mEnabled = true;
		// build the parent element's DOM
		replaceElementContents(inParentElement, Builder.node('a', {href:'#'}, [
			Builder.node('span', {className:'calendarcolor_swatch'}, "\u00A0"),
			Builder.node('span', {className:'calendarcolor_label'}, '_Calendar.Color.Blue'.loc())
		]));
		Element.addClassName(this.mParentElement, 'calendarcolor_handle');
		// install event handler for parent element
		this.mParentElement.down('a').observe('click', function(inEvent) {
			inEvent.stop();
			if (!this.mEnabled) return false;
			if (!$(inPopupElementID)) {
				var colorPopup = popupManager().createPopupElement('calendar_color_popup', inPopupElementID);
				RemoteCalendarCollection.defaultCalendarColors.each(function(currentColor, i) {
					var itemCallback = function() {
						colorPopup.hide();
						this.mParentElement.down('span.calendarcolor_swatch').style.backgroundColor = currentColor;
						replaceElementContents(this.mParentElement.down('span.calendarcolor_label'), ('_Calendar.Color.'+this.mColorKeys[i]).loc());
					}
					var colorPopupItem = popupManager().itemWithTitle(colorPopup, ('_Calendar.Color.'+this.mColorKeys[i]).loc(), null, itemCallback.bind(this));
					colorPopupItem.parentNode.insertBefore(Builder.node('span', {className:'calendarcolor_swatch', style:'background-color:'+currentColor}), colorPopupItem);
				}.bind(this));
			}
			// show the popup
			popupManager().show(this.mParentElement.down('a'), inPopupElementID, (-32));
			return false;
		}.bind(this));
	},
	getValue: function() {
		return String.hexValueForColorString(this.mParentElement.down('span.calendarcolor_swatch').style.backgroundColor);
	},
	setValue: function(inColorValue) {
		this.mParentElement.down('span.calendarcolor_swatch').style.backgroundColor = inColorValue;
		var foundLabel = RemoteCalendarCollection.defaultCalendarColors.indexOf(inColorValue.toUpperCase());
		replaceElementContents(this.mParentElement.down('span.calendarcolor_label'), (foundLabel < 0 ? '_Calendar.Color.Custom'.loc() : ('_Calendar.Color.'+this.mColorKeys[foundLabel]).loc()));
	}
}

var AppointmentDialogManager = Class.createWithSharedInstance('appointmentDialog');
AppointmentDialogManager.prototype = {
	mAvailabilityWidth: 450,
	mAvailabilityRange: [0, 24],
	mTabs: ['appointment_dialog_tab_general', 'appointment_dialog_tab_invitees', 'appointment_dialog_tab_notes'],
	initialize: function() {
		bindEventListeners(this, [
			'handleAllDayChanged', 'handleTabLinkClicked', 'handleDeleteClick', 'handleRecurrenceTypeChanged',
			'handleRecurrenceEndTypeChanged', 'handleAttendeeHeaderLinkClick', 'handleMouseDownInAttendeeTime',
			'handleAttendeeTimeRescheduleMove', 'handleAttendeeTimeRescheduleEnd']);
		// draw the basic dialog
		this.mAppointmentDialog = dialogManager().drawDialog('appointment_dialog', [
			{label:'_Calendar.Dialogs.Appointment.Summary'.loc(), contents:'<input name="summary" id="appointment_dialog_summary" type="text" class="appointment_dialog_field" />'},
			{label:'_Calendar.Dialogs.Appointment.Location'.loc(), contents:'<input name="location" id="appointment_dialog_location" type="text" class="appointment_dialog_field" />'},
			{label:'_Calendar.Dialogs.Appointment.StartTime'.loc(), contents:'<div id="appointment_dialog_dtstart"></div>'},
			{label:'_Calendar.Dialogs.Appointment.EndTime'.loc(), contents:'<div id="appointment_dialog_dtend"></div>'},
			{label:'', contents:'<label for="appointment_dialog_allday_checkbox" id="appointment_dialog_allday_label"><input type="checkbox" id="appointment_dialog_allday_checkbox" />'+('_Calendar.Dialogs.Appointment.AllDayEvent'.loc())+'</label>'},
			{label:'_Calendar.Dialogs.Appointment.Calendar'.loc(), contents:'<select id="appointment_dialog_calendar_select"></select>'},
			{label:'_Calendar.Dialogs.Appointment.Repeat.Label'.loc(), contents:'<select id="appointment_dialog_recurrence_select"></select>'},
			{label:'_Calendar.Dialogs.Appointment.Repeat.End.Label'.loc(), contents:'<div id="appointment_dialog_recurrence_end_container"><select id="appointment_dialog_recurrence_end_select"></select></div>'}
		], '_Dialogs.OK'.loc(), null, '_Calendar.Dialogs.Appointment.Title'.loc());
		// add the view switcher
		replaceElementContents(this.mAppointmentDialog.down('thead').down('td'), Builder.node('div', {className:'calendartoolbar', id:'appointment_dialog_tabs'}, [
			Builder.node('ul', [
				Builder.node('li', {className:'first'}, [
					Builder.node('a', {href:'#', id:'appointment_dialog_tab_general'}, '_Calendar.Dialogs.Appointment.Tabs.General'.loc())
				]),
				Builder.node('li', {className:'middle'}, [
					Builder.node('a', {href:'#', id:'appointment_dialog_tab_invitees'}, '_Calendar.Dialogs.Appointment.Tabs.Attendees'.loc())
				]),
				Builder.node('li', {className:'last'}, [
					Builder.node('a', {href:'#', id:'appointment_dialog_tab_notes'}, '_Calendar.Dialogs.Appointment.Tabs.Notes'.loc())
				])
			])
		]));
		this.mInvitesAllowed = principalService().isIndividual();
		// remove the invite stuff for group calendars
		if (!this.mInvitesAllowed) {
			$('appointment_dialog_tab_invitees').up('ul').addClassName('noInvitees');
			$('appointment_dialog_tab_invitees').up('li').remove();
			$('appointment_dialog_tab_notes').up('li').addClassName('middle');
		}
		// add event handlers for the paginator links
		$$('#appointment_dialog_tabs a').invoke('observe', 'click', this.handleTabLinkClicked);
		// add the attendee list
		this.mButtonsRow = $('appointment_dialog_ok').up('tr');
		this.mButtonsRow.parentNode.insertBefore(Builder.node('tr', [
			Builder.node('td', {colSpan:'2'}, [
				Builder.node('ul', {id:'appointment_dialog_attendee_header'}, [
					Builder.node('li', {className:'appointment_attendee_name'}, '_Calendar.Dialogs.Appointment.Attendees.Name'.loc())
				]),
				Builder.node('div', {id:'appointment_dialog_attendees'}, [
					Builder.node('ul', {id:'appointment_attendee_list'}, [
						Builder.node('li', {className:'next_appointment_attendee'}, [
							Builder.node('ul', {className:'appointment_attendee_availability'}, [
								Builder.node('li', {className:'appointment_attendee_name'}, [
									Builder.node('input', {type:'text', id:'appointment_next_attendee', placeholder:'_Calendar.Dialogs.Appointment.Attendees.Hint'.loc()})
								])
							])
						])
					]),
					Builder.node('div', {id:'appointment_attendee_schedtime'}, "\u00A0")
				])
			])
		]), this.mButtonsRow);
		// add the attendee date row
		this.mButtonsRow.parentNode.insertBefore(Builder.node('tr', {className:'appointment_dialog_attendee_daterow'}, [
			Builder.node('td', {colSpan:'2'}, [
				Builder.node('a', {href:'#', id:'appointment_dialog_attendee_prevdate'}, '<'),
				Builder.node('span', {id:'appointment_dialog_attendee_date'}, '-'),
				Builder.node('a', {href:'#', id:'appointment_dialog_attendee_nextdate'}, '>')
			])
		]), $('appointment_dialog_attendee_header').up('tr'));
		// calculate the availability cell width
		this.mAvailabilityCellWidth = this.mAvailabilityWidth / (this.mAvailabilityRange[1] - this.mAvailabilityRange[0]);
		$('appointment_dialog_attendee_header').down('li.appointment_attendee_name').setStyle({marginRight:'0'});
		// add the labels
		var headerRow = $('appointment_dialog_attendee_header');
		for (var i = this.mAvailabilityRange[0]; i < this.mAvailabilityRange[1]; i+=2) {
			headerRow.appendChild(Builder.node('li', {className:'appointment_attendee_availability_header', style:'width:'+((this.mAvailabilityCellWidth*2)-(browser().isWebKit()?1:0)-/*6717068*/(browser().isIE?1:0))+'px'}, [
				Builder.node('span', getLocalizedHourKey(i))
			]));
		}
		if (this.mInvitesAllowed) {
			// set up the attendee search field
			this.mAttendeeSearchField = new CalendarPrincipalSearchField('appointment_next_attendee', {
				mStartedItemSearchCallback: function() {
					// do nothing for now
				},
				mClickedItemCallback: function(inUID, inURL) {
					if (inURL) {
						this.addAttendee(this.mAttendeeSearchField.mChosenDataSource, true);
						$('appointment_next_attendee').value = '';
						// get updated freebusy
						this.updateAttendeeTimeFromFields();
						this.getFreeBusyReport();
					}
				}.bind(this)
			});
			// watch for email addresses
			this.mAttendeeSearchField.old_handleChanged = this.mAttendeeSearchField.handleChanged;
			this.mAttendeeSearchField.handleChanged = function(e) {
				var attendeeValue = $F('appointment_next_attendee');
				if (attendeeValue.match(FreeBusyLookup.emailAddressTest)) {
					this.addAttendee({uid:'mailto:'+attendeeValue.replace(/^mailto:/, ''), displayname:attendeeValue}, true);
					$('appointment_next_attendee').value = '';
					this.updateAttendeeTimeFromFields();
					Event.stop(e);
					return false;
				}
				return this.mAttendeeSearchField.old_handleChanged(e);
			}.bindAsEventListener(this);
			// location search field
			this.mLocationSearchField = new CalendarLocationSearchField('appointment_dialog_location', {
				mFindResourceTypes: ['locations'],
				mClickedItemCallback: function(inURL, inURL) {
					// add location to the appointment attendees
					var location = this.mLocationSearchField.mChosenDataSource;
					location.cutype = 'ROOM';
					var removedRoom = this.mShownAppointment.removeRoomAttendee();
					if (removedRoom) {
						var removedRoomElm = $('appointment_attendee_uid_'+normalizeUID(removedRoom));
						if (removedRoomElm) removedRoomElm.remove();
					}
					this.addAttendee(location, true);
				}.bind(this),
				mSearchResultCallback: function(inResponseObj) {
					// TODO: perform freebusy search for all of the locations returned
					var gotFreeBusyCallback = function(inResult) {
						this.mLocationSearchField.mRows.each(function(row, i) {
							var elm = $('appointment_dialog_location_results_'+row.uid);
							var fbForElm = inResult.detect(function(result) {
								return (result.recipient == row.uid);
							});
							if (elm && fbForElm && fbForElm.blocks && fbForElm.blocks.length > 0) {
								Element.addClassName(elm, 'appointment_busy_location');
							}
							else if (elm && fbForElm && fbForElm.blocks) {
								Element.addClassName(elm, 'appointment_free_location');
							}
						}.bind(this));
					}
					if (inResponseObj && inResponseObj.length > 0) {
						this.mShownAppointment.getFreeBusyReport(gotFreeBusyCallback.bind(this), null, null, inResponseObj);
					}
				}.bind(this)
			});
			this.mLocationSearchField.mResultTable.id = 'appointment_dialog_location_results';
		}
		// add the notes field
		this.mButtonsRow.parentNode.insertBefore(Builder.node('tr', [
			Builder.node('td', {colSpan:'2'}, [
				Builder.node('textarea', {id:'appointment_dialog_notes'})
			])
		]), this.mButtonsRow);
		this.mDialogRows = $$('#appointment_dialog tbody tr');
		this.mDialogRows.pop(); // last row is the OK/Cancel buttons
		this.mTabbedRows = $A([$R(0, 7), $R(8, 9), $R(10, 10)]);
		// add the recurrence select options
		var recurrenceTypeSelect = $('appointment_dialog_recurrence_select');
		$A(['none', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', '-', 'custom']).each(function(key) {
			recurrenceTypeSelect.appendChild(Builder.node('option', {value:key}, (key=='-'?"\u00A0":('_Calendar.Dialogs.Appointment.Repeat.'+key).loc())));
		});
		recurrenceTypeSelect.options[recurrenceTypeSelect.options.length-2].disabled = true;
		recurrenceTypeSelect.options[recurrenceTypeSelect.options.length-1].disabled = true;
		Event.observe(recurrenceTypeSelect, 'change', this.handleRecurrenceTypeChanged);
		// add the recurrence end select options (FIXME: localize recurrence types for dialog manager)
		this.mRecurrenceEndTypeSelect = $('appointment_dialog_recurrence_end_select');
		var oldLabel = this.mRecurrenceEndTypeSelect.up('tr').down('th').down('label');
		this.mRecurrenceEndLabel = Builder.node('div', {style:'height:0;overflow:hidden'}, Element.firstNodeValue(oldLabel));
		replaceElementContents(oldLabel, this.mRecurrenceEndLabel);
		var recurrenceEndTypeSelect = $('appointment_dialog_recurrence_end_select');
		this.mRecurrenceEndContainer = $('appointment_dialog_recurrence_end_container');
		this.mRecurrenceEndContainer.style['height'] = '0';
		this.mRecurrenceEndContainer.style['overflow'] = 'hidden';
		$A(['Never', 'After', 'On_date']).each(function(key) {
			recurrenceEndTypeSelect.appendChild(Builder.node('option', {value:key.toLowerCase()}, ('_Calendar.Dialogs.Appointment.Repeat.End.'+key).loc()));
		});
		Event.observe(recurrenceEndTypeSelect, 'change', this.handleRecurrenceEndTypeChanged);
		// add the end info
		$('appointment_dialog_recurrence_end_container').appendChild(Builder.node('div', {id:'appointment_dialog_recurrence_end_after_container', style:'display:none'}, [
			Builder.node('input', {type:'text', id:'appointment_dialog_recurrence_end_after'}),
			"\u00A0"+('_Calendar.Dialogs.Appointment.Repeat.End.times'.loc())
		]));
		$('appointment_dialog_recurrence_end_container').appendChild(Builder.node('div', {id:'appointment_dialog_recurrence_end_ondate', style:'display:none'}, "\u00A0"));
		this.mRecurrenceEndDatePicker = new NiftyDatePicker({mParentElement:'appointment_dialog_recurrence_end_ondate', mStartWeekday:principalService().startWeekday()});
		// add the delete button
		var td = $('appointment_dialog_ok').up('td');
		td.colSpan = '1';
		td.parentNode.insertBefore(Builder.node('td', [
			Builder.node('div', {className:'submit'}, [
				Builder.node('input', {type:'button', id:'appointment_dialog_delete', value:'_Calendar.Dialogs.Appointment.Delete'.loc()})
			])
		]), td);
		$('appointment_dialog_delete').onclick = this.handleDeleteClick;
		// add the start date fields
		$('appointment_dialog_dtstart').appendChild(Builder.node('input', {type:'text', id:'appointment_dialog_dtstart_time'}));
		$('appointment_dialog_dtstart').appendChild(Builder.node('a', {href:'#', id:'appointment_dialog_dtstart_date'}, '-'));
		// set up the start date
		this.mDialogStartDatePicker = new NiftyDatePicker({mParentElement:'appointment_dialog_dtstart_date', mStartWeekday:principalService().startWeekday()});
		this.mDialogStartTimePicker = new TimeTextField('appointment_dialog_dtstart_time');
		globalNotificationCenter().subscribe('DATE_PICKER_SHOWN', this.handleDatePickerShown.bind(this), this.mDialogStartDatePicker);
		globalNotificationCenter().subscribe('SELECTED_DATE_WILL_CHANGE', this.handleStartTimeWillChange.bind(this), this.mDialogStartDatePicker);
		globalNotificationCenter().subscribe('SELECTED_DATE_WILL_CHANGE', this.handleStartTimeWillChange.bind(this), this.mDialogStartTimePicker);
		globalNotificationCenter().subscribe('SELECTED_DATE_CHANGED', this.handleStartTimeChanged.bind(this), this.mDialogStartDatePicker);
		globalNotificationCenter().subscribe('SELECTED_DATE_CHANGED', this.handleStartTimeChanged.bind(this), this.mDialogStartTimePicker);
		// add the end date fields
		$('appointment_dialog_dtend').appendChild(Builder.node('input', {type:'text', id:'appointment_dialog_dtend_time'}));
		$('appointment_dialog_dtend').appendChild(Builder.node('a', {href:'#', id:'appointment_dialog_dtend_date'}));
		// set up the end date
		this.mDialogEndDatePicker = new NiftyDatePicker({mParentElement:'appointment_dialog_dtend_date', mStartWeekday:principalService().startWeekday()});
		this.mDialogEndTimePicker = new TimeTextField('appointment_dialog_dtend_time');
		// change the attendee date header when the date picker control changes
		//7101682 ... but only when the START Date picker control changes
		globalNotificationCenter().subscribe('SELECTED_DATE_CHANGED', function(inMessage, inObject, inUserInfo) {
			replaceElementContents('appointment_dialog_attendee_date', inUserInfo.selectedDate.formatDate('_Dates.DateFormats.MediumDate'.loc()));
		}, this.mDialogStartDatePicker);
		// change the date field's start day when the start weekday changes
		globalNotificationCenter().subscribe('START_WEEKDAY_CHANGED', function(inMessage, inObject, inUserInfo) {
			this.mDialogStartDatePicker.setStartWeekday(inUserInfo.startWeekday);
			this.mDialogEndDatePicker.setStartWeekday(inUserInfo.startWeekday);
		}.bind(this));
		// hide start date picker when end date picker is shown
		globalNotificationCenter().subscribe('DATE_PICKER_SHOWN', this.handleDatePickerShown.bind(this), this.mDialogEndDatePicker);
		// hook up the attendee date header links
		$$('#appointment_dialog tr.appointment_dialog_attendee_daterow a').invoke('observe', 'click', this.handleAttendeeHeaderLinkClick);
		// set up the attendee time widget
		$('appointment_attendee_schedtime').observe('mousedown', this.handleMouseDownInAttendeeTime);
		$('appointment_dialog_allday_checkbox').observe('change', this.handleAllDayChanged);
	},
	selectTab: function(inTabIndex, inAnimateDialogSize) {
		if (inAnimateDialogSize) dialogManager().willResize();
		if (!this.mFakeTableBody) {
			this.mFakeTableBody = Builder.node('tbody');
			d.body.appendChild(Builder.node('table', {style:'display:none'}, [this.mFakeTableBody]));
		}
		this.mDialogRows.each(function(row, i) {
			if (this.mTabbedRows[inTabIndex].include(i)) {
				if (!row.up('#appointment_dialog')) {
					row.remove();
					this.mButtonsRow.parentNode.insertBefore(row, this.mButtonsRow);
				}
			}
			else if (row.up('#appointment_dialog')) {
				row.remove();
				this.mFakeTableBody.appendChild(row);
			}
		}.bind(this));
		// set up the current tab stuff
		if (inTabIndex == 0) {
			this.hideOrShowRecurrenceEnd();
		}
		else if (inTabIndex == 1) {
			// attendee tab selected; update the shown time here
			this.updateAttendeeTimeFromFields();
			// get updated freebusy
			this.getFreeBusyReport();
		}
		if (inAnimateDialogSize) dialogManager().didResize();
		// set the selected state on the tab
		if (inTabIndex > this.mTabs.size() - 1) return;		
		calendarViewController().setSelectedChild(this.mTabs[inTabIndex]);
	},
	show: function(inAppointment, inCancelCallback, inOKCallback, inOptElement, inOptDeleteCallback) {
		var elm = inOptElement;
		if (!elm && inAppointment.displayNodes) {
			var node = inAppointment.displayNodes.detect(function(node) {
				if (node.element) return true;
			});
			if (node) elm = node.element;
		}
		if (!elm) {
			tempApptDivs = $$('#module_calendars .temporary_calendar_appointment');
			if (tempApptDivs.length > 0) {
				elm = tempApptDivs[0];
			}
		}
		// reset hidden values
		if (inAppointment.mDesiredCalendar) delete inAppointment.mDesiredCalendar;
		// remember values and callbacks
		this.mShownAppointment = inAppointment;
		this.mDeleteCallback = inOptDeleteCallback;
		// if this is not a user-generated appointment, show the invite dialog instead
		if (!inAppointment.organizerIsPrincipal()) {
			invitationDialog().show(inAppointment, inCancelCallback, inOKCallback, elm);
			return true;
		}
		$('appointment_dialog_delete').style.display = inAppointment.isNew() ? 'none' : '';
		// switch to the first tab
		this.selectTab(0);
		// setup summary and location fields
		$('appointment_dialog_summary').value = inAppointment.summary() || '';
		$('appointment_dialog_location').value = inAppointment.location() || '';
		// populate the calendar popup
		this.updateCalendarsInPopup();
		// calendar in which the event resides
		Form.setSelectValue('appointment_dialog_calendar_select', inAppointment.mParentCalendarFile.mParentCalendar.mLastPathComponent);
		// populate start time
		this.setStartDateOnFields(inAppointment.startDate());
		// all day field
		$('appointment_dialog_allday_checkbox').checked = (inAppointment.banner() == true);
		this.handleAllDayChanged();
		// populate end time
		this.setEndDateOnFields(inAppointment.endDate());
		// recurrence fields
		$('appointment_dialog_recurrence_select').value = (inAppointment.recurrenceInfo() ? inAppointment.recurrenceInfo().frequency() : 'none');
		this.handleRecurrenceTypeChanged();
		// show the dialog
		var cancelCallback = function() {
			this.mDialogStartDatePicker.hide();
			this.mDialogEndDatePicker.hide();
			if (inCancelCallback) inCancelCallback();
		}
		var okCallback = function() {
			inAppointment.setBanner($('appointment_dialog_allday_checkbox').checked);
			inAppointment.setSummary($F('appointment_dialog_summary'));
			inAppointment.setLocation($F('appointment_dialog_location'));
			inAppointment.setStartDate(this.getStartDateFromFields());
			inAppointment.setEndDate(this.getEndDateFromFields());
			inAppointment.setRecurrenceFrequency($F('appointment_dialog_recurrence_select'));
			this.setDesiredCalendarFromFields(inAppointment);
			var idx = $('appointment_dialog_recurrence_select').selectedIndex;
			var d = null;
			if (idx > 0 && idx < 5) {
				var recurrenceInfo = inAppointment.recurrenceInfo();
				switch ($('appointment_dialog_recurrence_end_select').selectedIndex) {
					case 0: // none
						recurrenceInfo.setCount(null);
						break;
					case 1: // count
						recurrenceInfo.setCount($F('appointment_dialog_recurrence_end_after'));
						break;
					case 2: // until date
						// advance date to end of day
						d = this.mRecurrenceEndDatePicker.mSelectedDate;
						d.setHours(23);
						d.setMinutes(59 + d.getTimezoneOffset());	// convert to GMT
						d.setSeconds(59);
						recurrenceInfo.setUntil(d, inAppointment.banner());
						break;
				}
			}
			inAppointment.setDescription($F('appointment_dialog_notes'));
			if (inOKCallback) inOKCallback();
		}
		dialogManager().show(this.mAppointmentDialog, cancelCallback.bind(this), okCallback.bind(this));
		// <rdar://problem/6680609> IE7: Appointment dialog takes 5-6 seconds to open on Internet Explorer
		var elems = $('appointment_attendee_list').select('li.appointment_attendee');
		for (var i = 0; i < elems.length; i++) { elems[i].remove(); }
		var attendees = this.mShownAppointment.attendees();
		for (var j = 0; j < attendees.length; j++) { this.addAttendee(attendees[j]); }
		// notes field
		$('appointment_dialog_notes').value = inAppointment.description() || '';
	},
	// These methods get and set the dialog's date values from the fields.
	// Not updating the appointment object, because I don't want the appointment moving around while the dialog is open.
	getStartDateFromFields: function() {
		// get the start date
		var startDate = new Date(this.mDialogStartDatePicker.mSelectedDate.getTime());
		var startTime = this.mDialogStartTimePicker.getValue();
		startDate.setHours(startTime.getHours());
		startDate.setMinutes(startTime.getMinutes());
		startDate.setSeconds(0);
		return startDate;
	},
	setStartDateOnFields: function(inDate) {
		this.mDialogStartDatePicker.setSelectedDate(inDate);
		this.mDialogStartTimePicker.setValue(inDate);
	},
	getEndDateFromFields: function() {
		var endDate = new Date(this.mDialogEndDatePicker.mSelectedDate.getTime());
		// 6929270
		if ($('appointment_dialog_allday_checkbox').checked) endDate.setDate(endDate.getDate() + 1);
		var endTime = this.mDialogEndTimePicker.getValue();
		endDate.setHours(endTime.getHours());
		endDate.setMinutes(endTime.getMinutes());
		endDate.setSeconds(0);
		return endDate;
	},
	setEndDateOnFields: function(inDate) {
		// 6929270
		// 13725132 - we need to account for all-day events that may be specified with
		// zero length - i.e. DTSTART == DTEND. In that case we do not want to subtract 1 day
		// DTEND as it would appear to be before DTSTART. This means if the user clicks OK to the
		// event they will end up with DTEND + 1 - i.e. it will be a 1 day length event. There is no
		// way for the user to edit and create a zero duration all-day event - but there is really no
		// valid use case for that anyway.
		var endDate = new Date(inDate.getTime());
		var startDate = this.getStartDateFromFields();
		if ($('appointment_dialog_allday_checkbox').checked) {
			if (endDate > startDate)
				endDate.setDate(endDate.getDate() - 1);
		}
		this.mDialogEndDatePicker.setSelectedDate(endDate);
		this.mDialogEndTimePicker.setValue(endDate);
	},
	setDesiredCalendarFromFields: function(inAppointment, inOptPopupElm) {
		var calendarPopup = inOptPopupElm ? $(inOptPopupElm) : $('appointment_dialog_calendar_select');
		if ($F(calendarPopup) != inAppointment.mParentCalendarFile.mParentCalendar.mLastPathComponent) {
			inAppointment.mDesiredCalendar = calendarViewController().mRemoteCalendarCollection.calendarWithPath($F(calendarPopup));
		}
	},
	hideOrShowRecurrenceEnd: function() {
		Element.setStyle(this.mRecurrenceEndLabel, {height:$('appointment_dialog_recurrence_select').selectedIndex % 6 == 0 ? '0' : 'auto'});
		Element.setStyle(this.mRecurrenceEndContainer, {height:$('appointment_dialog_recurrence_select').selectedIndex % 6 == 0 ? '0' : 'auto'});
	},
	updateCalendarsInPopup: function(inOptPopupElm) {
		var calendarPopup = inOptPopupElm ? $(inOptPopupElm) : $('appointment_dialog_calendar_select');
		removeAllChildNodes(calendarPopup);
		calendarViewController().mRemoteCalendarCollection.mCalendars.each(function(calObj) {
			calendarPopup.appendChild(Builder.node('option', {
				id: 'appointment_dialog_calendar_'+calObj.mLastPathComponent,
				value: calObj.mLastPathComponent
			}, (calObj.mDisplayName == 'calendar' ? '_Calendar.Calendar'.loc() : calObj.mDisplayName)));
		});
	},
	updateAttendeeTimeFromFields: function(inOptDate) {
		// give the bar a reasonable starting position
		var firstHourElement = $('appointment_attendee_list').down('li.appointment_attendee_availability_cell');
		var schedElm = $('appointment_attendee_schedtime');
		schedElm.clonePosition(firstHourElement);
		schedElm.style.width = (parseInt(schedElm.style.width)-1)+'px';
		schedElm.style.height = ((parseInt(schedElm.style.height) * ($('appointment_attendee_list').childNodes.length - 1)) - 2)+'px';
		// get the start and end dates selected in the fields
		var selectedStartDate = inOptDate || this.getStartDateFromFields();
		var dur = getDurationUsingEndDate(this.getStartDateFromFields(), this.getEndDateFromFields());
		var selectedEndDate = getEndDateUsingDuration(selectedStartDate, dur);
		// find the beginning and end of the shown range
		var shownRange = $A([new Date(selectedStartDate.getTime()), new Date(selectedStartDate.getTime())]);
		shownRange[0].setHours(this.mAvailabilityRange[0]);
		shownRange[1].setHours(this.mAvailabilityRange[1]);
		// shrink the selection if it's before the shown start date
		if (selectedStartDate < shownRange[0]) {
			selectedEndDate.setTime(selectedEndDate.getTime() - (shownRange[0].getTime() - selectedStartDate.getTime()));
			selectedStartDate.setTime(shownRange[0].getTime());
		}
		// also shrink the selection if it's after the shown end date
		if (selectedStartDate > shownRange[1]) {
			selectedEndDate.setTime(shownRange[1].getTime());
		}
		// set the position of the element
		var hourWidth = schedElm.offsetWidth-1; // account for overlap
		// start with the cloned position
		var pos = parseInt(schedElm.style.left);
		// add the hours
		pos += (selectedStartDate.getHours() - shownRange[0].getHours()) * hourWidth;
		// and the minutes
		pos += (selectedStartDate.getMinutes() / 60) * hourWidth;
		schedElm.style.left = pos+'px';
		// set the width of the element
		var selectedDuration = getDurationUsingEndDate(selectedStartDate, selectedEndDate);
		schedElm.style.width = ((getHoursForDuration(selectedDuration) * hourWidth) - 2)+'px';
	},
	addAttendee: function(inAttendee, inOptSaveToDataStore) {
		// 6929993
		var uid = normalizeUID(inAttendee.uid);
		if (!this.mInvitesAllowed) return false;
		if (inOptSaveToDataStore) this.mShownAppointment.addAttendee(inAttendee);
		if ($('appointment_attendee_uid_'+uid)) return false;
		// get the display name of the attendee
		var attendeeDisplayName = inAttendee.displayname;
		// try and populate orgnizer displayname, which seems to be stripped by the server
		if (!attendeeDisplayName && !$('appointment_attendee_list').down('li.appointment_attendee')) {
			if (this.mShownAppointment.organizerIsPrincipal() && principalService().mUserPrincipalInfo) {
				attendeeDisplayName = principalService().mUserPrincipalInfo.displayname;
			}
			else {
				attendeeDisplayName = '_Calendar.Dialogs.Appointment.Attendees.Organizer'.loc();
			}
		}
		var li = Builder.node('li', {id:'appointment_attendee_uid_'+uid, className:'appointment_attendee'}, [
			Builder.node('ul', {className:'appointment_attendee_availability'}, [
				Builder.node('li', {className:'appointment_attendee_name'}, attendeeDisplayName)
			])
		]);
		// add the status
		if (inAttendee.uid == this.mShownAppointment.organizer().uid || inAttendee.status == 'ACCEPTED') {
			li.down('li.appointment_attendee_name').addClassName('attendeestatus_accepted');
		}
		else if (inAttendee.status == 'TENTATIVE') {
			li.down('li.appointment_attendee_name').addClassName('attendeestatus_maybe');
		}
		else if (inAttendee.status == 'DECLINED') {
			li.down('li.appointment_attendee_name').addClassName('attendeestatus_declined');
		}
		else if (inAttendee.status == 'NEEDS-ACTION' || !inAttendee.status) {
			li.down('li.appointment_attendee_name').addClassName('attendeestatus_unknown');
		}
		// set the alternating row class (if applicable)
		if ($('appointment_attendee_list').childNodes.length % 2 == 0) {
			li.addClassName('alternate_row');
		}
		// add the hour cells
		for (var i = this.mAvailabilityRange[0]; i < this.mAvailabilityRange[1]; i++) {
			li.down('ul').appendChild(Builder.node('li', {
				className: 'appointment_attendee_availability_cell appointment_attendee_hour_'+i,
				style: 'width:'+this.mAvailabilityCellWidth+'px'
			}, "\u00A0"));
		}
		$('appointment_attendee_list').insertBefore(li, $('appointment_attendee_list').lastChild);
		// create a delete button
		inAttendee.deleteButton = new InlineDeleteButton(li.down('li.appointment_attendee_name'), function() {
			this.mShownAppointment.removeAttendeeWithUID(inAttendee.uid);
			li.remove();
			this.updateAttendeeTimeFromFields();
		}.bind(this), false);
	},
	// TODO: allow freebusy reports for just one user
	getFreeBusyReport: function() {
		var startDate = new Date(this.mDialogStartDatePicker.mSelectedDate.getTime());
		var endDate = new Date(startDate.getTime());
		startDate.setHours(this.mAvailabilityRange[0]);
		startDate.setMinutes(0);
		startDate.setSeconds(0);
		endDate.setHours(this.mAvailabilityRange[1]);
		endDate.setSeconds(0);
		var gotFreeBusyCallback = function(inResult) {
			// remove all of the old freebusy divs
			$$('#appointment_attendee_list li.appointment_freebusy_busy').invoke('remove');
			// calculate where midnight and absolute start positions
			var firstHourElement = $('appointment_attendee_list').down('li.appointment_attendee_availability_cell');
			var absoluteStartPos = firstHourElement.offsetLeft;
			var hourWidth = firstHourElement.next().offsetLeft - absoluteStartPos;
			var hourHeight = firstHourElement.offsetHeight;
			// iterate through the response information and add the blocks to the calendar
			inResult.each(function(response) {
				if (!response) return; // 6907080
				var elm = $('appointment_attendee_uid_'+normalizeUID(response.recipient));
				if (!elm) return; // who are you? get off my lawn.
				if (response.requestStatus == '2.0;Success') { // TODO: how do we visually represent error conditions in freebusy?
					var attendee_ul = elm.down('ul');
					// now iterate the blocks
					response.blocks.each(function(block) {
						var blockLeft = absoluteStartPos + (getHoursForDuration(getDurationUsingEndDate(startDate, block.startDate)) * hourWidth);
						var blockWidth = getHoursForDuration(block.duration) * hourWidth;
						var li = Builder.node('li', {
							className: 'appointment_freebusy_busy appointment_freebusy_busy_'+block.type,
							style: 'position:absolute;top:0;left:'+blockLeft+'px',
							title: getTimeRangeDisplayString(block.startDate, block.duration)
						}, "\u00A0");
						attendee_ul.appendChild(li);
						Element.setOffsetWidth(li, blockWidth);
					});
				}
			});
		}
		this.mShownAppointment.getFreeBusyReport(gotFreeBusyCallback.bind(this), startDate, endDate);
	},
	handleDatePickerShown: function(inMessage, inObject, inUserInfo) {
		// 6929125
		niftyDateHack(inMessage, inObject, inUserInfo);
		(inObject == this.mDialogStartDatePicker ? this.mDialogEndDatePicker : this.mDialogStartDatePicker).hide();
	},
	handleAllDayChanged: function() {
		var isChecked = $('appointment_dialog_allday_checkbox').checked;
		if (isChecked == $('appointment_dialog_dtstart_time').disabled) return false; // bail if the setting hasn't changed
		$('appointment_dialog_dtstart_time').disabled = isChecked;
		$('appointment_dialog_dtend_time').disabled = isChecked;
		// if we're checking the checkbox, change the time values to midnight
		var startDate = this.getStartDateFromFields();
		if (isChecked) {
			startDate.setHours(0);
			startDate.setMinutes(0);
			startDate.setSeconds(0);
			var endDate = new Date(startDate.getTime());
			this.setEndDateOnFields(this.getEndDateFromFields());
		}
		// otherwise pick sensible defaults and focus on the time field
		else {
			startDate.setHours(8);
			startDate.setMinutes(0);
			startDate.setSeconds(0);
			this.setStartDateOnFields(startDate);
			var endDate = new Date(startDate.getTime());
			endDate.setHours(9);
			this.setEndDateOnFields(endDate);
			$('appointment_dialog_dtstart_time').focus();
		}
		// add a helper class name to the appointment_dialog that we'll use to
		// hide/show the time picker when all day is checked/unchecked
		(isChecked == true) ? $('appointment_dialog').addClassName('allday') : $('appointment_dialog').removeClassName('allday');
	},
	handleStartTimeWillChange: function(inMessage, inObject, inUserInfo) {
		this.mStartDateBeforeChange = this.getStartDateFromFields();
	},
	handleStartTimeChanged: function(inMessage, inObject, inUserInfo) {
		if (!this.mStartDateBeforeChange) return;
		// find out how much it moved
		var delta = getDurationUsingEndDate(this.mStartDateBeforeChange, this.getStartDateFromFields());
		// move the end date accordingly
		this.setEndDateOnFields(getEndDateUsingDuration(this.getEndDateFromFields(), delta));
	},
	handleTabLinkClicked: function(inEvent) {
		inEvent.stop();
		var elm = inEvent.findElement('a');
		this.selectTab(this.mTabs.indexOf(elm.id), true);
		return false;
	},
	handleRecurrenceTypeChanged: function() {
		dialogManager().willResize();
		// TODO: handle custom recurrences
		this.hideOrShowRecurrenceEnd();
		// populate the end info (if applicable)
		var idx = 0;
		if (this.mShownAppointment.recurrenceInfo() && this.mShownAppointment.recurrenceInfo().count()) idx = 1;
		else if (this.mShownAppointment.recurrenceInfo() && this.mShownAppointment.recurrenceInfo().until()) idx = 2;
		$('appointment_dialog_recurrence_end_select').selectedIndex = idx;
		this.handleRecurrenceEndTypeChanged();
		dialogManager().didResize();
	},
	handleRecurrenceEndTypeChanged: function(inEvent) {
		var idx = $('appointment_dialog_recurrence_end_select').selectedIndex;
		$('appointment_dialog_recurrence_end_after_container').style.display = (idx == 1 ? '' : 'none');
		$('appointment_dialog_recurrence_end_ondate').style.display = (idx == 2 ? '' : 'none');
		var recurrenceInfo = this.mShownAppointment.recurrenceInfo();
		// show the count
		if (idx == 1) {
			$('appointment_dialog_recurrence_end_after').value = (recurrenceInfo && recurrenceInfo.count() ? recurrenceInfo.count() : '');
			if (inEvent) $('appointment_dialog_recurrence_end_after').focus();
		}
		// select the correct date
		if (idx == 2) {
			var dateToSelect = (recurrenceInfo ? recurrenceInfo.until() : null);
			if (!dateToSelect) {
				dateToSelect = this.mShownAppointment.startDate();
				dateToSelect.setDate(dateToSelect.getDate()+1);
			}
			this.mRecurrenceEndDatePicker.setSelectedDate(dateToSelect);
		}
	},
	handleMouseDownInAttendeeTime: function(inEvent) {
		Event.stop(inEvent);
		this.mDragStartPos = Event.pointerX(inEvent);
		this.mDragStartTime = this.getStartDateFromFields();
		this.mDragCurrentTime = this.mDragStartTime;
		var startTimeISO = dateObjToISO8601(this.mDragStartTime);
		// lower limit = midnight
		this.mDragLowerLimit = createDateObjFromISO8601(startTimeISO.replace(/T.+$/, 'T000000'));
		// upper limit = 11:45 PM
		this.mDragUpperLimit = createDateObjFromISO8601(startTimeISO.replace(/T.+$/, 'T234500'));
		observeEvents(this, d, {
			mousemove: 'handleAttendeeTimeRescheduleMove',
			mouseup: 'handleAttendeeTimeRescheduleEnd'
		});
	},
	handleAttendeeHeaderLinkClick: function(inEvent) {
		inEvent.stop();
		var delta = (Event.findElement(inEvent, 'a').id == 'appointment_dialog_attendee_prevdate' ? (-1) : 1);
		var dt = this.getStartDateFromFields();
		dt.setDate(dt.getDate() + delta);
		this.setStartDateOnFields(dt);
		this.getFreeBusyReport();
		return false;
	},
	handleAttendeeTimeRescheduleMove: function(inEvent) {
		Event.stop(inEvent);
		// find out how many horizontal pixels there are in an hour
		var hourWidth = $$('#appointment_attendee_list li.appointment_attendee_availability_cell')[0].offsetWidth-2; // account for overlap
		// turn the drag delta into a time duration
		this.mDragCurrentTime = new Date(this.mDragStartTime.getTime());
		var movedHours = (Event.pointerX(inEvent) - this.mDragStartPos) / hourWidth;
		this.mDragCurrentTime = getEndDateUsingDuration(this.mDragCurrentTime, getDurationForHours(movedHours));
		// bail if we're about to move around to the past day
		if (this.mDragCurrentTime < this.mDragLowerLimit || this.mDragCurrentTime > this.mDragUpperLimit) return false;
		// round the time to the nearest 15 minutes
		this.mDragCurrentTime.setMinutes(Math.floor(this.mDragCurrentTime.getMinutes() / 15) * 15);
		this.mDragCurrentTime.setSeconds(0);
		// now set the fields and redraw
		this.updateAttendeeTimeFromFields(this.mDragCurrentTime);
	},
	handleAttendeeTimeRescheduleEnd: function(inEvent) {
		Event.stop(inEvent);
		stopObservingEvents(this, d, {
			mousemove: 'handleAttendeeTimeRescheduleMove',
			mouseup: 'handleAttendeeTimeRescheduleEnd'
		});
		var dur = getDurationUsingEndDate(this.getStartDateFromFields(), this.getEndDateFromFields());
		this.setStartDateOnFields(this.mDragCurrentTime);
		this.setEndDateOnFields(getEndDateUsingDuration(this.mDragCurrentTime, dur));
	},
	handleDeleteClick: function(inEvent) {
		dialogManager().hide();
		if (this.mDeleteCallback) this.mDeleteCallback();
		return false;
	}
}

var InvitationDialogManager = Class.createWithSharedInstance('invitationDialog');
InvitationDialogManager.prototype = {
	initialize: function() {
		this.mInviteDialog = dialogManager().drawDialog('invitation_dialog', [
			{label:'_Calendar.Dialogs.Invitation.Summary'.loc(), contents:'<div id="invitation_dialog_summary"></div>'},
			{label:'_Calendar.Dialogs.Invitation.Location'.loc(), contents:'<div id="invitation_dialog_location"></div>'},
			{label:'_Calendar.Dialogs.Invitation.Date'.loc(), contents:'<div id="invitation_dialog_date"></div>'},
			{label:'_Calendar.Dialogs.Invitation.Calendar'.loc(), contents:'<select id="invitation_dialog_calendar_select"></select>'},
			{label:'_Calendar.Dialogs.Invitation.Attendees'.loc(), contents:'<ul id="invitation_dialog_attendees"></ul>'},
			{label:'_Calendar.Dialogs.Invitation.Notes'.loc(), contents:'<div id="invitation_dialog_notes"></div>'},
			{label:'_Calendar.Dialogs.Invitation.MyStatus'.loc(), contents:'<select id="invitation_dialog_mystatus_select"></select>'}
			// TODO: add recurrence description
		], '_Dialogs.OK'.loc());
		// remember the notes row
		this.mNotesRow = $('invitation_dialog_notes').up('tr');
		// add the status select options
		$A(['ACCEPTED', 'TENTATIVE', 'DECLINED']).each(function(partstat) {
			$('invitation_dialog_mystatus_select').appendChild(Builder.node('option', {value:partstat}, ('_Calendar.Dialogs.Invitation.MyStatus.'+partstat).loc()));
		});
		// add the delete button
		var td = $('invitation_dialog_ok').up('td');
		td.colSpan = '1';
		td.parentNode.insertBefore(Builder.node('td', [
			Builder.node('div', {className:'submit'}, [
				Builder.node('input', {type:'button', id:'invitation_dialog_delete', value:'_Calendar.Dialogs.Appointment.Delete'.loc()})
			])
		]), td);
		$('invitation_dialog_delete').onclick = appointmentDialog().handleDeleteClick;
	},
	addNotes: function(inNotes) {
		if ($$('#invitation_dialog #invitation_dialog_notes').length == 0) {
			$('invitation_dialog_mystatus_select').up('tr').insert({before:this.mNotesRow});
		}
		replaceElementContents('invitation_dialog_notes', inNotes);
		$('invitation_dialog_notes').innerHTML = $('invitation_dialog_notes').innerHTML.replace(/[\r\n]/g, "\u00A0<br>");
	},
	removeNotes: function() {
		if ($$('#invitation_dialog #invitation_dialog_notes').length > 0) {
			this.mNotesRow.remove();
		}
	},
	show: function(inAppointment, inCancelCallback, inOKCallback, inOptElement) {
		// populate the calendar popup
		appointmentDialog().updateCalendarsInPopup('invitation_dialog_calendar_select');
		// header (including organizer)
		var headerStr = String.format('_Calendar.Dialogs.Invitation.Title'.loc(), {organizer:inAppointment.organizer().displayname || String.lastPathComponent(inAppointment.organizer().uid)});
		replaceElementContents(this.mInviteDialog.down('thead').down('td'), headerStr);
		// summary, location, and date
		replaceElementContents('invitation_dialog_summary', inAppointment.summary() || '');
		//replaceElementContents('invitation_dialog_organizer', inAppointment.organizer().displayname || '');
		replaceElementContents('invitation_dialog_location', inAppointment.location() || '');
		var attendeesList = inAppointment.attendees();
		var isOrganizer = true;
		removeAllChildNodes('invitation_dialog_attendees');
		Element.removeClassName('invitation_dialog_attendees', 'massive_attendee_list');
		var attendeeIdx = 0;
		var attendeeCount = attendeesList.length;
		while (attendeesList.length > 0) {
			var currentAttendee = attendeesList.shift();
			if (currentAttendee.cutype == 'ROOM') continue;
			var li = Builder.node('li', (isOrganizer ? String.format('_Calendar.Dialogs.Invitation.Organizer'.loc(), {displayname:currentAttendee.displayname}) : currentAttendee.displayname));
			if (++attendeeIdx > 5) {
				li.hide();
			}
			$('invitation_dialog_attendees').appendChild(li);
			// add the status
			if (currentAttendee.uid == inAppointment.organizer().uid || currentAttendee.status == 'ACCEPTED') {
				li.addClassName('attendeestatus_accepted');
			}
			else if (currentAttendee.status == 'TENTATIVE') {
				li.addClassName('attendeestatus_maybe');
			}
			else if (currentAttendee.status == 'DECLINED') {
				li.addClassName('attendeestatus_declined');
			}
			else if (currentAttendee.status == 'NEEDS-ACTION' || !currentAttendee.status) {
				li.addClassName('attendeestatus_unknown');
			}
			isOrganizer = false;
		}
		if (attendeeCount > 5) {
			var showAllLink = Builder.node('a', {href:'#'}, String.format('_Calendar.Dialogs.Invitation.SeeAllAttendees'.loc(), {count:attendeeCount}));
			$('invitation_dialog_attendees').appendChild(Builder.node('li', {className:'invitation_attendee_showall'}, [showAllLink]));
			var showAllCallback = function(inEvent) {
				inEvent.stop();
				dialogManager().willResize();
				$('invitation_dialog_attendees').addClassName('massive_attendee_list');
				$$('#invitation_dialog_attendees li').invoke('show');
				showAllLink.up('li').remove();
				dialogManager().didResize();
				return false;
			}
			showAllLink.observe('click', showAllCallback.bind(this));
		}
		//replaceElementContents('invitation_dialog_attendees', attendeesList.pluck('displayname').join(', '));
		replaceElementContents('invitation_dialog_date', getTimeRangeDisplayString(inAppointment.startDate(), inAppointment.duration()));
		// notes
		var notes = inAppointment.description();
		if (notes && notes.match(/\S/)) {
			this.addNotes(notes);
		}
		else {
			this.removeNotes();
		}
		// calendar
		Form.setSelectValue('invitation_dialog_calendar_select', inAppointment.mParentCalendarFile.mParentCalendar.mLastPathComponent);
		// my status
		Form.setSelectValue('invitation_dialog_mystatus_select', inAppointment.participantStatus());
		// OK button callback
		var okCallback = function() {
			appointmentDialog().setDesiredCalendarFromFields(inAppointment, 'invitation_dialog_calendar_select');
			inAppointment.mPartStatChange = $F('invitation_dialog_mystatus_select');
			if (inOKCallback) inOKCallback();
		}
		// finally, show the dialog
		dialogManager().show(this.mInviteDialog, inCancelCallback, okCallback.bind(this));
	}
}

var SettingsDialogManager = Class.createWithSharedInstance('settingsDialog');
SettingsDialogManager.prototype = {
	initialize: function() {
		bindEventListeners(this, ['handleAvailabilityTypeChanged']);
		this.mDeleteButtons = $A([]);
		dialogManager().drawDialog('calendar_settings_dialog', [
			{label:'_Calendar.Dialogs.Settings.Timezone'.loc(), contents:'<select id="calendar_settings_dialog_tzid" name="calendar_settings_dialog_tzid"></select>'},
			{label:'_Calendar.Dialogs.Settings.Availability'.loc(), contents:'<select id="calendar_settings_dialog_availability" name="calendar_settings_dialog_availability"></select><div id="calendar_settings_dialog_availability_options"></div>'},
			{label:'_Calendar.Dialogs.Settings.StartWeekOn'.loc(), contents:'<select id="calendar_settings_dialog_startweekon" name="calendar_settings_dialog_startweekon"></select>'},
			{label:'_Calendar.Dialogs.Settings.Delegates'.loc(), contents:'<input id="calendar_settings_dialog_new_delegate" name="calendar_settings_dialog_new_delegate"><div id="calendar_settings_dialog_delegates"></div>'}
		], '_Dialogs.OK'.loc(), null, '_Calendar.Dialogs.Settings.Title'.loc());
		// append a temporary option to show current timezone -- this will be refreshed when we get the timezone list
		var selectedTimezone = timezoneService().selectedTimezone();
		$('calendar_settings_dialog_tzid').appendChild(Builder.node('option', {value:selectedTimezone}, selectedTimezone));
		// get the timezones after the dialog finishes animating, so that it doesn't redraw all hurky
		var dialogFocusCallback = function() {
			var gotTimezonesCallback = function(inTimezones) {
				var timezonePopup = $('calendar_settings_dialog_tzid');
				removeAllChildNodes(timezonePopup);
				var selectIndex = (-1);
				inTimezones.each(function(tzid, i) {
					timezonePopup.appendChild(Builder.node('option', {value:tzid}, tzid));
					if (tzid == selectedTimezone) selectIndex = i;
				});
				if (selectIndex >= 0) timezonePopup.options[selectIndex].selected = true;
			}
			timezoneService().getTimezoneList(gotTimezonesCallback);
		}
		globalNotificationCenter().subscribe('DIALOG_FOCUS', dialogFocusCallback, $('calendar_settings_dialog'));
		// add contents of availability popup
		['Weekdays', 'Custom'].each(function(lbl) {
			$('calendar_settings_dialog_availability').appendChild(Builder.node('option', {value:lbl.toLowerCase()}, ('_Calendar.Dialogs.Settings.Availability.'+lbl).loc()));
		});
		// disable the custom option and handle change events
		$('calendar_settings_dialog_availability').lastChild.disabled = true;
		$('calendar_settings_dialog_availability').observe('change', this.handleAvailabilityTypeChanged);
		// add contents of availability options
		var optionsDiv = $('calendar_settings_dialog_availability_options');
		optionsDiv.appendChild(Builder.node('input', {type:'text', id:'calendar_settings_dialog_availability_starttime'}));
		optionsDiv.appendChild(Builder.node('span'));
		optionsDiv.lastChild.appendChild(d.createTextNode('_Calendar.Dialogs.Settings.Availability.To'.loc()));
		optionsDiv.appendChild(Builder.node('input', {type:'text', id:'calendar_settings_dialog_availability_endtime'}));
		// set up the time fields
		this.mStartTimeField = new TimeTextField('calendar_settings_dialog_availability_starttime');
		this.mEndTimeField = new TimeTextField('calendar_settings_dialog_availability_endtime', {mRestrictAfterTimeField:this.mStartTimeField});
		this.mStartTimeField.mRestrictBeforeTimeField = this.mEndTimeField;
		// populate "start week on" popup
		var startWeekOnElm = $('calendar_settings_dialog_startweekon');
		'_Dates.LongWeekdays'.loc().split(',').each(function(wkdy, i) {
			startWeekOnElm.appendChild(Builder.node('option', {value:'wkdy_'+i}, wkdy));
		});
		// only show delegate field if this isn't a project calendar
		if (principalService().isIndividual()) {
			// set up the delegate search field
			this.mDelegateSearchField = new CalendarPrincipalSearchField('calendar_settings_dialog_new_delegate', {
				mStartedItemSearchCallback: function() {
					// do nothing for now
				},
				mClickedItemCallback: function(inUID, inURL) {
					if (inURL) {
						this.addDelegate(this.mDelegateSearchField.mChosenDataSource);
						$('calendar_settings_dialog_new_delegate').value = '';
					}
				}.bind(this)
			});
			// hint the text field
			$('calendar_settings_dialog_new_delegate').placeholder = '_Calendar.Dialogs.Settings.Delegates.Hint'.loc();
		}
		else {
			$('calendar_settings_dialog_new_delegate').up('tr').style.display = 'none';
			$('calendar_settings_dialog_availability').up('tr').style.display = 'none';
		}
	},
	addDelegate: function(inDelegateInfo, inDelegateType) {
		var delegateElm = Builder.node('div', {id:'delegate_'+inDelegateInfo.href}, [
			Builder.node('span', inDelegateInfo.displayname),
			Builder.node('select', {id:'delegate_acl_'+inDelegateInfo.href}, [
				Builder.node('option', {value:'readonly'}, '_Calendar.Dialogs.Settings.Delegates.ReadOnly'.loc()),
				Builder.node('option', {value:'readwrite'}, '_Calendar.Dialogs.Settings.Delegates.ReadWrite'.loc())
			])
		]);
		$('calendar_settings_dialog_delegates').appendChild(delegateElm);
		if (inDelegateType == 1) $('delegate_acl_'+inDelegateInfo.href).options[1].selected = true;
		this.mDeleteButtons.push(new InlineDeleteButton(delegateElm, this.handleDeleteButtonClick.bind(this), false));
	},
	handleDeleteButtonClick: function(inDelegateElm) {
		Element.remove(inDelegateElm);
	},
	show: function() {
		// choose the correct option in the availability type menu
		var availability = calendarViewController().mRemoteCalendarCollection.mAvailability;
		Form.setSelectValue('calendar_settings_dialog_availability', (availability ? 'weekdays' : 'custom'));
		if (availability) {
			this.mStartTimeField.setValue(availability.startDate());
			this.mEndTimeField.setValue(availability.endDate());
		}
		else {
			var availStart = new Date();
			availStart.setHours(8);
			availStart.setMinutes(0);
			availStart.setSeconds(0);
			this.mStartTimeField.setValue(availStart);
			var availEnd = new Date();
			availEnd.setHours(18);
			availEnd.setMinutes(0);
			availEnd.setSeconds(0);
			this.mEndTimeField.setValue(availEnd);
		}
		this.handleAvailabilityTypeChanged();
		// set the start weekday
		$('calendar_settings_dialog_startweekon').selectedIndex = principalService().startWeekday();
		dialogManager().hide();
		dialogManager().show('calendar_settings_dialog', null, this.handleOKClick.bind(this));
		// populate the delegates
		$('calendar_settings_dialog_delegates').innerHTML = '';
		var principalURL = calendarViewController().mLoggedInPrincipal;
		proxyService().readOnlyProxies(function(inHrefs){this.handleProxyResponse(inHrefs, 0)}.bind(this), principalURL);
	},
	handleProxyResponse: function(inHrefs, inProxyType) {
		var gotPrincipalInfo = function(inProxyInfo) {
			this.addDelegate(inProxyInfo, inProxyType);
		}
		if (inProxyType < 1) {
			var principalURL = calendarViewController().mLoggedInPrincipal;
			proxyService().readWriteProxies(function(inHrefs){this.handleProxyResponse(inHrefs, 1)}.bind(this), principalURL);
		}
		inHrefs.each(function(href) {
			var principal = new RemotePrincipalService();
			principal.setUserPrincipal(href);
			principal.getPrincipalInfo(gotPrincipalInfo.bind(this));
		}.bind(this));
	},
	handleAvailabilityTypeChanged: function(inEvent) {
		if (!$('calendar_settings_dialog_availability_options')) return false;
		this.mStartTimeField.mDirty = true;
		this.mEndTimeField.mDirty = true;
		$('calendar_settings_dialog_availability_options').style.display = ($F('calendar_settings_dialog_availability') == 'weekdays' ? '' : 'none');
	},
	handleOKClick: function() {
		dialogManager().showProgressMessage('_Settings.Save.Progress.Message'.loc(), false, null, true);
		var gotTimezonesCallback = function() {
			// get the new offsets and redraw the calendar
			var gotOffsetsCallback = function() {
				var finishSavingSettings = function() {
					var weekday = $('calendar_settings_dialog_startweekon').selectedIndex;
					if (weekday != principalService().startWeekday()) principalService().setStartWeekday(weekday);
					dialogManager().hideProgressMessage();
					notifier().printMessage('calendar_settings_dialog_saved');
					calendarViewController().getAppointmentsFromServer(true);
				}
				// we're done here if this is a wiki calendar
				if (!principalService().isIndividual()) {
					finishSavingSettings.bind(this)();
					return;
				}
				// save the proxy settings
				var readWriteProxySaveCallback = function() {
					// set the availability
					if ($F('calendar_settings_dialog_availability') == 'weekdays' && (this.mStartTimeField.mDirty || this.mEndTimeField.mDirty)) {
						calendarViewController().mRemoteCalendarCollection.setWeekdayAvailability(this.mStartTimeField.getValue(), this.mEndTimeField.getValue(), finishSavingSettings.bind(this));
					}
					else {
						finishSavingSettings.bind(this)();
					}
				}
				var principalURL = calendarViewController().mLoggedInPrincipal;
				var readOnlyProxies = $A([]);
				var readWriteProxies = $A([]);
				$$('#calendar_settings_dialog_delegates div').each(function(elm) {
					if (elm.down('select').selectedIndex == 0) {
						readOnlyProxies.push(elm.id.replace(/^delegate_/, ''));
					}
					else {
						readWriteProxies.push(elm.id.replace(/^delegate_/, ''));
					}
				});
				var readOnlyProxySaveCallback = function() {
					proxyService().setReadWriteProxies(readWriteProxySaveCallback.bind(this), principalURL, readWriteProxies);
				}
				proxyService().setReadOnlyProxies(readOnlyProxySaveCallback.bind(this), principalURL, readOnlyProxies);
			}
			var range = calendarViewController().dateRangeToFetch();
			timezoneService().fetchOffsetsForDateRange(gotOffsetsCallback.bind(this), range[0], range[1], $F('calendar_settings_dialog_tzid'));
		}
		// set the timezone
		timezoneService().setSelectedTimezone($F('calendar_settings_dialog_tzid'), gotTimezonesCallback.bind(this));
	}
}

var CalendarPrincipalSearchField = Class.create(SearchFieldBase, {
	mFindResourceTypes: ['users', 'resources'],
	mSortKey: "displayname",
	getDisplayString: function(inRow) {
		return inRow.displayname;
	},
	constructQuery: function(inSearchString) {
		if (this.mQueryStartCallback) this.mQueryingCallback();
		return principalService().getMatchingUsers(this.gotSearchResult.bind(this), inSearchString, this.mFindResourceTypes);
	}
});

var CalendarLocationSearchField = Class.create(CalendarPrincipalSearchField, {
	mFindResourceTypes: ['locations']
});

// IE7 doesn't work well with floats and auto margins, so this method calculates the total width of the toolbar.
// Used in a CSS expression.
function ie7ToolbarWorkaround() {
	return $$('#calendar_grid_toolbar ul.calendar_nav_view_picker li').inject(0, function(total, elm) {
		return total + elm.offsetWidth;
	});
}
function ie7DialogToolbarWorkaround() {
	return $$('#calendar_grid_toolbar ul.calendar_nav_view_picker li').inject(0, function(total, elm) {
		return total + elm.offsetWidth;
	});
}

// controller class for calendar week view
var CalendarViewController = Class.createWithSharedInstance('calendarViewController');
CalendarViewController.prototype = {
	mBufferDays: 32,
	mResizeHandleHeight: 2,
	mSpacerWidth: 2,
	mSnapHours: 0.5, // snap to 1/2 hour increments
	mRefreshTimeout: 300000, // every 5 minutes normally (initialize method sets to 30 seconds in debug mode)
	mCleanupTimeout: 2000, // clean up old divs after 2 seconds to allow for animations
	mDefaultHours: 0.5,
	mMinimumHours: 0.5,
	mMonthGridSize: [50, 50], // initial value is meaningless; will get populated the first time month view is displayed
	mBannerHeight: 15, // initial value is meaningless; will get populated when calendar is drawn
	mMonthBannerHeight: 15, // initial value is meaningless; will get populated when calendar is drawn
	mWeekEventElementOffsets: [0, -1, -2, -2], // offsets because of border and margin differences
	mSecondsInDay: 86400000,
	mMinimumHourHeight: 22,
	mMinimumDisplayHeight: 14,
	initialize: function(/*[options]*/) {
		if (!$('module_calendars')) return invalidate;

		// Need this initialized here
		eventRecurrenceDialogManager();

		bindEventListeners(this, [
			'handleMouseDownInCalendar', 'handleViewToolbarClick', 'handleMonthMoreButtonClick', 'handleTodayButtonClick', 'handleMakeCalendarClick',
			'handleMouseDownInWeekTimedAppointment', 'handleWeekTimedAppointmentRescheduleMove', 'handleWeekTimedAppointmentRescheduleEnd',
			'handleMouseDownInWeekTimedAppointmentSlot', 'handleWeekTimedAppointmentResizeMove', 'handleWeekTimedAppointmentResizeEnd',
			'handleMouseDownInBannerAppointment', 'handleBannerAppointmentRescheduleMove', 'handleBannerAppointmentRescheduleEnd',
			'handleMouseDownInBannerAppointmentSlot', 'handleBannerAppointmentResizeMove', 'handleBannerAppointmentResizeEnd',
			'handleSettingsClick', 'handleWindowResize'
		]);
		this.mParentElement = $('module_calendars').up();
		// shorter delays for tooltips
		tooltipManager().mShowTimeout = 2500;
		// draw the calendar
		this.drawCalendar();
		// block webcal for iOS
		if (Prototype.Browser.MobileSafari) {
	        var unsupportedOSError = {errorObj:{status: -1}};
	        this.handleCalendarError("", null, unsupportedOSError);
	        return;
	    }
	    // handle principal errors
		globalNotificationCenter().subscribe('ERROR_FROM_SERVER', this.handleCalendarError.bind(this));
		// show progress message
		dialogManager().showProgressMessage('_Calendar.Progress.GettingEvents'.loc(), false, null, true);
		// wrap the rest of the init method in a callback in case we need to get the username asynchronously
		var gotUsernameCallback = function() {
			this.mViewSprings.boing();
			// change the title link (invisible anyway)
			var titleLink = Builder.node('a', {href:'#'}, ["\u00A0"]);
			titleLink.onclick = invalidate;
			// look for month view pref
			var calendarView = d.cookie.match(/calendarView=([^;]+)/);
			if (calendarView && (calendarView[1] == 'month')) {
				this.mMonthMode = true;
			}
			// hook up the timezone selector link
			Event.observe('calendar_nav_timezone', 'click', this.handleSettingsClick);
			// hook up the Today link
			Event.observe('calendar_today_link', 'click', this.handleTodayButtonClick);
			// set up the nifty date picker
			this.mDateNavigation = new NiftyDatePicker({mElement:'calendar_date_picker', mStartWeekday:principalService().startWeekday()});
			globalNotificationCenter().subscribe('SELECTED_DATE_CHANGED', this.handleDateChanged.bind(this), this.mDateNavigation);
			globalNotificationCenter().subscribe('START_WEEKDAY_CHANGED', this.handleStartWeekdayChanged.bind(this));
			// set the maximum height of the splitter
			$('calendar_grid_sidebar_splitter').hide();
			this.snapSidebarSplitter();
			// match the height of the two tabbed views
			$('calendar_sidebar_notifications').style.height = (Element.getHeight('calendar_date_picker')-1)+'px';
			// show date picker by default
			this.showDatePicker();
			// watch the sidebar tab buttons
			$('calendar_sidebar_mkcalendar_button').observe('click', this.handleMakeCalendarClick);
			$('calendar_sidebar_toolbar_tab_date').observe('click', function(inEvent) {
				inEvent.stop();
				this.showDatePicker();
			}.bind(this));
			$('calendar_sidebar_toolbar_tab_notifications').observe('click', function(inEvent) {
				Event.stop(inEvent);
				this.showNotifications();
			}.bind(this));
			// IE doesn't space out the week view properly the first time
			if (browser().isIE && !this.mMonthMode) {
				this.mWeekEventSpacer.space();
				this.mWeekHeaderSpacer.space();
				this.mWeekBannerSpacer.space();
			}
			// bind banner slot click events
			$$('.calendar_grid_week_banner_slot').each(function(elm) {
				Event.observe(elm, 'mousedown', this.handleMouseDownInBannerAppointmentSlot);
			}.bind(this));
			// scroll to middle
			var scroller = $('calendar_grid_week_events');
			scroller.scrollTop = (scroller.scrollHeight - Element.getHeight(scroller)) / 2;
			// set up timed observer to see if font size changed
			this.mFontSizeObserver = new SizeObserver($('calendar_grid_week_banner_columns').down('div.calendar_grid_hours_key').down('div'), 1, this.handleFontSizeChanged.bind(this));
			// draw the tooltips
			this.drawTooltips();
			// shorter tooltip delays in calendar
			tooltipManager().mShowTimeout = 2500;
			// get the calendar collection
			var gotCalendarCollection = function() {
				this.mLoggedInPrincipal = CC.meta('caldav_principal_path') || principalService().mUserPrincipalURL;
				var gotAccountsUserCanAccess = function(inAccountsToDelegate) {
					this.mViewSprings.boing();
					// add the calendars
					removeAllChildNodes('calendar_collection_list');
					this.mRemoteCalendarCollection.mCalendars.each(function(cal, i) {
						var elmID = 'calendar_collection_'+cal.mLastPathComponent;
						// select the first calendar by default for new events
						// add checkboxes for the calendars
						var localizedCalendarName = (cal.mDisplayName == 'calendar' ? '_Calendar.Calendar'.loc() : cal.mDisplayName);
						var collectionElm = Builder.node('li', {title:localizedCalendarName}, [
							Builder.node('div', {className:'colorcheckbox_container'}, [
								Builder.node('span', {className:'colorcheckbox_colorfill', style:'background-color:'+cal.mColor}),
								Builder.node('span', {className:'colorcheckbox_state colorcheckbox_checked'})
							]),
							Builder.node('span', {className:'calendar_collection_displayname'}, localizedCalendarName),
							Builder.node('a', {href:'#', className:'calendar_info_button'}, '_Calendar.Sidebar.Info'.loc())
						]);
						collectionElm.down('a').onclick = invalidate;
						$('calendar_collection_list').appendChild(collectionElm);
						// watch for clicks on the collection
						Event.observe(collectionElm, 'mousedown', this.handleMouseDownInCalendar);
					}.bind(this));
					// add link to view delegate calendars
					if (inAccountsToDelegate.length > 0) {
						if ($('calendar_title')) {
							$('calendar_title').down('span').appendChild(Builder.node('span', {className:'popuphandle'}, "\u25BC"));
							$('calendar_title').down('span').appendChild(Builder.node('select', [
								Builder.node('option', {value:'__'}, '_Calendar.Title.MyCalendar'.loc())
							]));
							$('calendar_title').down('select').selectedIndex = 0;
							inAccountsToDelegate.each(function(account) {
								var optionElm = Builder.node('option', {value:account.principalURL}, account.displayname);
								if (account.principalURL == principalService().mUserPrincipalURL) {
									optionElm.selected = true;
								}
								$('calendar_title').down('select').appendChild(optionElm);
							});
							$('calendar_title').down('select').observe('change', function(inEvent) {
								if ($F(inEvent.findElement('select')) == '__') {
									window.location.search = '';
								}
								else {
									window.location.search = 'principal='+encodeURIComponent($F(inEvent.findElement('select')));
								}
							}.bindAsEventListener(this));
						}
					}
					// select the first calendar
					this.selectCalendar(this.mRemoteCalendarCollection.mCalendars.length > 0 ? this.mRemoteCalendarCollection.mCalendars[0] : null);
					// tell the date control to publish a notification; that will indirectly call this.handleDateChanged()
					// look for dtstart in url query
					var dtstart = window.location.search.match(/dtstart=([^&]+)/);
					if (dtstart) {
						var dt = createDateObjFromISO8601(dtstart[1], false); // this time should always be local
							if (dt) {
							// look for an appointment UID in the url
							var apptUidMatch = (window.location.hash||'').match(/#uid=(.+)$/);
							if (apptUidMatch) {
								window.location.hash = '';
								this.mShowAppointmentUID = apptUidMatch[1];
							}
							this.mDateNavigation.setSelectedDate(dt);
						}
					}
					else {
						this.mDateNavigation.setSelectedDate();
					}
				}
				proxyService().accountsUserCanAccess(gotAccountsUserCanAccess.bind(this), this.mLoggedInPrincipal);
				// disable the + button if needed
				if (!this.mRemoteCalendarCollection.userCanWriteContent()) {
					$('calendar_sidebar_mkcalendar_button').addClassName('disabled');
				}
			}
			this.mRemoteCalendarCollection = new RemoteCalendarCollection(this.mCalCollectionHref);
			// <rdar://problem/6416027> Group calendars should not have a notifications icon
			this.mIndividual = principalService().isIndividual();
			if (!this.mIndividual) {
				$('calendar_sidebar_toolbar_tabs').addClassName('noInvitations');
			}
			globalNotificationCenter().subscribe('GOT_CALENDAR_COLLECTION', gotCalendarCollection.bind(this), this.mRemoteCalendarCollection);
			// IE doesn't handle window resize events properly
			if (!browser().isIE) observeEvents(this, window, {resize:'handleWindowResize'});
		}.bind(this);
		// instantiate a remote calendar object with a path like: /calendars/groups/groupname/
		// TODO: support MKCALENDAR
		this.mCalCollectionHref = '/calendars';
		var metaPrincipalLoc = CC.meta('caldav_principal_path');
		var urlProjectCalendarMeta = CC.meta('x-apple-owner-tinyID');
		var urlPrincipalMatch = window.location.search.match(/principal=([^&]+)/);
		var urlUserMatch = window.location.search.match(/username=([^&]+)/);
		if (urlPrincipalMatch) {
			principalService().setUserPrincipal(encodeURI(decodeURIComponent(urlPrincipalMatch[1])));
		}
		else if (metaPrincipalLoc) {
			principalService().setUserPrincipal(metaPrincipalLoc);
		}
		else if (urlUserMatch) {
			principalService().setUserPrincipal('/principals/users/'+encodeURIComponent(urlUserMatch[1]));
		}
		else if (urlProjectCalendarMeta) {
			principalService().setUserPrincipal('/principals/wikis/'+encodeURIComponent(urlProjectCalendarMeta))
		}
		if (!urlProjectCalendarMeta && CC.meta('x-apple-username') && CC.meta('x-apple-username') != 'unauthenticated')
		{
			principalService().setUserPrincipal('/principals/users/' + encodeURIComponent(CC.meta('x-apple-username')));
		}
		if (principalService().mUserPrincipalURL) {
			var callback = function(inPrincipalInfo) {
				if (inPrincipalInfo) {
					this.mCalCollectionHref = String.addSlash(inPrincipalInfo.url);
					var projectName = null;
					if (window.CC) {
				        projectName = CC.meta('x-apple-owner-longName') || CC.meta('x-apple-owner-shortName');
					}
					document.title = String.format('_Calendar.Title'.loc(), {principalDisplayName:projectName || inPrincipalInfo.displayname});
					if ($('calendar_title')) $('calendar_title').down('span').innerHTML = document.title.escapeHTML();
					var logoutURL = '/auth/logout?redirect='+window.location.href;
					insertAfter(Builder.node('p', {id:'calendar_logout_link'}, [Builder.node('a', {href:logoutURL}, '_Calendar.Logout'.loc())]), $('module_calendars'));
					gotUsernameCallback();
				}
				else {
					debugMessage('Princpial info not found for meta tag URL: ' + principalService().mUserPrincipalURL);
				}
			}
			principalService().getPrincipalInfo(callback.bind(this));
		}
		else if (window.uid && uid().mValue != '') {
			this.mCalCollectionHref += uid().mParentLocation;
		}
		else {
			this.mCalCollectionHref += '/users/' + encodeURIComponent(prompt('Username:')) + '/';
		}
		if (arguments.length > 0) Object.extend(this, arguments[0]);
		if (this.mCalCollectionHref != '/calendars') gotUsernameCallback();
	},
	handleCalendarError: function(inMessage, inObject, inUserInfo) {
		// callback to show an error dialog and maybe mask the calendar
		var showError = function(inErrorString) {
			dialogManager().hideProgressMessage();
			if ($('calendar_mask').visible()) {
				$('calendar_mask').style.visibility = 'visible';
				replaceElementContents($('calendar_mask').down('span'), inErrorString);
			}
			else {
				alert(inErrorString);
			}
		}.bind(this);
		// get the status either from the ivar or from the getStatus() method
		var status = inUserInfo.errorObj.status;
		if (inUserInfo.errorObj.getStatus && !status) status = inUserInfo.errorObj.getStatus();
		if ((status == 503 || status == 502) && inUserInfo.errorObj.getAllResponseHeaders && inUserInfo.errorObj.getAllResponseHeaders().match(/Server:\s*Apache/)) {
			showError('_Calendar.Errors.NoServer'.loc());
		}
		else if (status == 403) {
			showError('_Calendar.Errors.NoAccess'.loc());
		}
		else if (status == 404) {
			if (inObject == principalService()) {
				showError('_Calendar.Errors.PrincipalNotFound'.loc());
			}
			else {
				showError('_Calendar.Errors.FileNotFound'.loc());
			}
		}
		else if (status == 412) {
			showError('_Calendar.Errors.ModificationsInProgress'.loc());
		}
		else if (status == 0) {
			// FIXME: we're disabling this for now because it causes errors when
			// navigating away from a page with pending XMLHttpRequests
			//showError('_Calendar.Errors.ProbableHTTPSRedirect'.loc());
		}
		else if (status == -1) {
		    showError('_Calendar.Errors.UnsupportedBrowser'.loc());
		}
		else {
			showError('_Calendar.Errors.Unknown'.loc());
			reportError(inUserInfo.errorObj);
		}
	},
	resizeWeekViewCalendarGrid: function() {
		if (this.mDayMode || !$('calendar_grid_week_view').visible()) return;
		var totalHeight = parseInt($('calendar_grid_week_events').style.height);
		var cellHeight = Math.max(this.mMinimumHourHeight, (totalHeight/12)-4);
		if (!this.mCachedWeekCells || this.mCachedWeekCells.length < 1) {
			this.mCachedWeekCells = $$('#calendar_grid_week_events_columns .calendar_grid_week_event_slot');
		}
		if (this.mCachedWeekCells.length > 0) {
			if ($('calendar_grid_week_events_columns').style.lineHeight != cellHeight+'px') {
				$('calendar_grid_week_events_columns').down('div.calendar_grid_hours_key').style.paddingTop = (cellHeight/2)+'px';
				$('calendar_grid_week_events_columns').style.lineHeight = cellHeight+'px';
				if (this.mAppointments && this.mAppointments.length > 0) this.drawVisibleAppointments(false);
			}
			this.mWeekGridSize = [this.mCachedWeekCells[0].offsetWidth, this.mCachedWeekCells[0].offsetHeight];
		}
	},
	springsResizeCallback: function() {
		if ($('calendar_mask').visible()) {
			Position.clone('module_calendars', 'calendar_mask');
			$('calendar_mask').style.width = (parseInt($('calendar_mask').style.width)-2)+'px';
			$('calendar_mask').style.height = (parseInt($('calendar_mask').style.height)-2)+'px';
		}
		if (Element.visible('calendar_grid_week_view')) {
			var h = parseInt($('calendar_grid_springs').style.height) - $('calendar_grid_week_events').offsetTop;
			Element.setOffsetHeight('calendar_grid_week_events', h);
			this.resizeWeekViewCalendarGrid();
			this.updateAvailableTimeShading();
		}
		else {
			var h = parseInt($('calendar_grid_springs').style.height) - $('calendar_grid_month_content').offsetTop;
			Element.setOffsetHeight('calendar_grid_month_content', h);
			var testDivSlots = $('calendar_grid_month_weekday_columns').getElementsByClassName('calendar_grid_month_row_0');
			if (testDivSlots.length > 0) {
				this.mMonthGridSize = [testDivSlots[0].offsetWidth, testDivSlots[0].offsetHeight];
			}
		}
		this.mBannerHeight = $('banner_sizing_appointment').offsetHeight;
		this.mMonthBannerHeight = $('month_banner_sizing_appointment').offsetHeight;
		this.snapSidebarSplitter();
		if (this.mNotificationsSplitView) this.mNotificationsSplitView.mDuringCallback();
	},
	buildCalendarGrid: function() {
		if (Element.hasClassName(document.body, 'ical_server')) {
			$('module_calendars').parentNode.insertBefore(Builder.node('h1', {id:'calendar_title'}, Builder.node('span', document.title)), $('module_calendars')); // FIXME: localize
		}
		replaceElementContents('module_calendars', Builder.node('div', {id:'calendar_grid_springs'}, [ // these springs stick the calendar to the bottom of the window
			// sidebar (will hold calendar list and date picker)
			Builder.node('div', {id:'calendar_sidebar'}, [
				Builder.node('div', {id:'calendar_splitter_parent'}, [
					// calendars will get populated here in the GOT_CALENDAR_COLLECTION callback defined in the initialize() method above
					Builder.node('ul', {id:'calendar_collection_list'}),
					// date picker's HTML will be populated by the NiftyDatePicker instance
					Builder.node('div', {id:'calendar_grid_sidebar_splitter', className:'splitter'}, [
						Builder.node('div', {className:'splitter_handle'}, "\u00A0")
					]),
					Builder.node('div', {id:'calendar_grid_splitter_sibling'}, [
						Builder.node('div', {id:'calendar_date_picker'}),
						// notifications UI
						Builder.node('div', {id:'calendar_sidebar_notifications', style:'display:none'}, [
							Builder.node('h2', '_Calendar.Sidebar.Notifications'.loc()),
							Builder.node('ul', {id:'calendar_sidebar_notifications_content'})
						]),
						// toolbar for switching between date picker and notifications
						Builder.node('div', {id:'calendar_sidebar_toolbar'}, [
							Builder.node('div', {className:'calendartoolbar', id:'calendar_sidebar_toolbar_tabs'}, [
								Builder.node('ul', [
									Builder.node('li', {className:'first'}, [
										Builder.node('a', {href:'#', id:'calendar_sidebar_mkcalendar_button', title:'_Calendar.Sidebar.NewCalendarCollection'.loc()}, [
											Builder.node('span', '+')
										])
									]),
									Builder.node('li', {className:'middle'}, [
										Builder.node('a', {href:'#', id:'calendar_sidebar_toolbar_tab_date', title:'_Calendar.Sidebar.ShowHideMiniMonth'.loc()}, [
											Builder.node('span', '_Calendar.Sidebar.MiniMonth'.loc())
										])
									]),
									Builder.node('li', {className:'last'}, [
										Builder.node('a', {href:'#', id:'calendar_sidebar_toolbar_tab_notifications', title:'_Calendar.Sidebar.ShowHideInbox'.loc()}, [
											Builder.node('span', '_Calendar.Sidebar.Inbox'.loc())
										])
									])
								])
							])
						])
					])
				])
			]),
			// week view
			Builder.node('div', {id:'calendar_grid_week_view'}, [
				Builder.node('div', {id:'calendar_grid_week_header'}, [
					// header with weekdays on it
					Builder.node('ul', {id:'calendar_grid_week_header_columns', className:'calendar_grid_columns'}, [
						// year cell
						Builder.node('li', {className:'use_content_size'}, [
							Builder.node('div', {id:'calendar_grid_week_year'}, "0000")
						])
						// we'll fill in the rest of the cells later
					]),
					// these lists are float:left, so use a clearing div to force a carriage return
					Builder.node('div', {className:'clear'})
				]),
				// space for all-day (banner) appointments in week view
				Builder.node('div', {id:'calendar_grid_week_banners'}, [
					// banner header (for theming)
					Builder.node('div', {className:'start startcalendar_grid_week_banners'}, [Builder.node('span')]),
					// banner body
					Builder.node('div', {id:'calendar_grid_week_banners_content'}, [
						Builder.node('ul', {id:'calendar_grid_week_banner_columns', className:'calendar_grid_columns'}, [
							// key cell on left
							Builder.node('li', {className:'use_content_size'}, [
								Builder.node('div', {className:'calendar_grid_hours_key'}, [Builder.node('div')])
								// we'll fill in the rest of the cells later
							])
						])
					]),
					// banner footer (for theming)
					// TODO: should we use a span here?
					Builder.node('div', {className:'end endcalendar_grid_week_banners clear'})
				]),
				// splitter between the banner and timed event views
				Builder.node('div', {id:'calendar_grid_week_splitter', className:'splitter calendar_splitter'}, [
					Builder.node('div', {className:'splitter_handle'}, "\u00A0")
				]),
				// timed event view
				Builder.node('div', {id:'calendar_grid_week_events'}, [
					// timed event header (for theming)
					Builder.node('div', {className:'start startcalendar_grid_week_events'}, [Builder.node('span')]),
					// timed event body
					Builder.node('div', {id:'calendar_grid_week_events_content'}, [
						Builder.node('ul', {id:'calendar_grid_week_events_columns', className:'calendar_grid_columns'}, [
							// key cell on left
							Builder.node('li', {className:'use_content_size'}, [
								Builder.node('div', {className:'calendar_grid_hours_key'})
							])
							// we'll fill in the rest of the cells later
						]),
						// these lists are float:left, so use a clearing div to force a carriage return
						Builder.node('div', {className:'clear'})
					]),
					// blocks for availability
					Builder.node('div', {id:'calendar_grid_week_unavailable_morning', className:'calendar_grid_week_unavailable', style:'display:none'}),
					Builder.node('div', {id:'calendar_grid_week_unavailable_evening', className:'calendar_grid_week_unavailable', style:'display:none'}),
					// timed event footer (for theming)
					Builder.node('div', {className:'end endcalendar_grid_week_events clear'})
				])
			]),
			// month view
			Builder.node('div', {id:'calendar_grid_month_view', style:'display:none'}, [
				// month header (displays date range)
				Builder.node('div', {id:'calendar_grid_month_header'}, "\u00A0"),
				// month body (this is where the calendar grid will go)
				Builder.node('div', {id:'calendar_grid_month_content'}, [
					Builder.node('ul', {id:'calendar_grid_month_weekday_columns', className:'calendar_grid_columns'}),
					// these lists are float:left, so use a clearing div to force a carriage return
					Builder.node('div', {className:'clear'})
				])
			]),
			// a SizeObserver object will watch this div for font size changes
			Builder.node('div', {id:'banner_sizing_appointment', className:'calendar_appointment', style:'visibility:hidden'}, "\u00A0"),
			Builder.node('div', {id:'month_banner_sizing_appointment', className:'calendar_appointment calendar_month_banner', style:'visibility:hidden'}, "\u00A0")
		]));
		// add a toolbar with view and date pickers
		insertAtBeginning(Builder.node('div', {id:'calendar_grid_toolbar', className:'calendartoolbar'}, [
			Builder.node('div', {id:'calendar_nav_today'}, [
				Builder.node('a', {href:'#', id:'calendar_today_link'}, '_Calendar.Header.Today'.loc())
			]),
			Builder.node('ul', {className:'calendar_nav_view_picker'}, [
				Builder.node('li', {id:'calendar_nav_date_prev', className:'first'}, [
					Builder.node('a', {href:'#', id:'paginator_prev'}, [
						Builder.node('span', "<")
					])
				]),
				Builder.node('li', {id:'calendar_nav_view_day', className:'middle'}, [
					Builder.node('a', {href:'#', id:'paginator_day', title:'_Calendar.Header.Day.Tooltip'.loc()}, '_Calendar.Header.Day'.loc())
				]),
				Builder.node('li', {id:'calendar_nav_view_week', className:'middle'}, [
					Builder.node('a', {href:'#', id:'paginator_week', title:'_Calendar.Header.Week.Tooltip'.loc()}, '_Calendar.Header.Week'.loc())
				]),
				Builder.node('li', {id:'calendar_nav_view_month', className:'middle'}, [
					Builder.node('a', {href:'#', id:'paginator_month', title:'_Calendar.Header.Month.Tooltip'.loc()}, '_Calendar.Header.Month'.loc())
				]),
				Builder.node('li', {id:'calendar_nav_date_next', className:'last'}, [
					Builder.node('a', {href:'#', id:'paginator_next'}, [
						Builder.node('span', ">")
					])
				])
			]),
			Builder.node('div', {id:'calendar_nav_timezone'}, [
				Builder.node('a', {href:'#', id:'calendar_settings_link'}, '_Calendar.Header.Settings'.loc())
			]),
			// these lists are float:left, so use a clearing div to force a carriage return
			Builder.node('div', {className:'clear'})
		]), 'module_calendars');
		// these lists are float:left, so use a clearing div to force a carriage return
		insertAfter(Builder.node('div', {className:'clear'}), 'calendar_grid_toolbar');
		// add the header and banner grid columns to the week view
		var weekHeaderColumns = $('calendar_grid_week_header_columns');
		var weekBannerColumns = $('calendar_grid_week_banner_columns');
		for (var column = 0; column < 7; column++) {
			weekHeaderColumns.appendChild(Builder.node('li', {className:'calendar_grid_banner_column'}, [
				Builder.node('div', {className:'calendar_grid_column_contents calendar_grid_weekday_label'}, "\u00A0")
			]));
			weekBannerColumns.appendChild(Builder.node('li', {className:'calendar_grid_week_column_'+column}, [
				Builder.node('div', {className:'calendar_grid_column_contents calendar_grid_week_banner_slot'}, "\u00A0")
			]))
		}
		// compensate for scrollbar size
		weekHeaderColumns.appendChild(Builder.node('li', {style:'use_content_size'}));
		// if we're running standalone, and we don't have a slide origin, add one
		if (!$('slideorigin')) {
			insertAtBeginning(Builder.node('div', {id:'slideorigin', className:'slideorigin'}), 'module_calendars');
		}
		// add a mask for when the calendar is loading
		if (!$('calendar_mask')) {
			$('module_calendars').appendChild(Builder.node('div', {id:'calendar_mask', style:'visiblility:visible'}, [
				Builder.node('span') // for holding "calendar not available" text
			]));
		}
	},
	drawCalendar: function() {
		if (!$('calendar_grid_springs')) this.buildCalendarGrid();
		// the springs ensure document height
		this.mViewSprings = new ViewSprings('calendar_grid_springs', this.springsResizeCallback.bind(this));
		// set up the week view
		$A($('calendar_grid_week_events_columns').getElementsByClassName('calendar_grid_hours_key')).each(function(elm) {
			for (var hour = 1; hour < 24; hour++) {
				elm.appendChild(Builder.node('div', (hour==12?('_Dates.Noon'.loc()):getLocalizedHourKey(hour))));
			}
		});
		// ##5303260 Display of the german word for all-day renders under the calendar In week view
		if (browser().locale() != 'en') $$('#calendar_grid_week_events_content div.calendar_grid_hours_key')[0].appendChild(Builder.node('div', {style:'position:relative;top:-5em;left:0;height:1px;margin:0;padding:0 0 0 1em;visibility:hidden'}, '_Calendar.Appointments.AllDay'.loc()));
		for (var column = 0; column < 7; column++) {
			var li = Builder.node('li', {
				className: 'calendar_grid_week_events_column calendar_grid_week_column_' + column
			});
			for (var row = 0; row < 24; row++) {
				var slotDiv = Builder.node('div', {
					className:'calendar_grid_week_event_slot calendar_grid_week_row_' + row
				}, browser().isIE ? "\u00A0" : getLocalizedHourKey(row));
				// IE6 won't accept click events on this div if it only contains text; instead, fill with an invisible invalid image
				if (browser().isIE6()) replaceElementContents(slotDiv, Builder.node('img', {src:'about:blank', alt:''}));
				if (browser().isIE) slotDiv.style.textIndent = '0';
				li.appendChild(slotDiv);
				slotDiv.onmousedown = this.handleMouseDownInWeekTimedAppointmentSlot;
			}
			$('calendar_grid_week_events_columns').appendChild(li);
		}
		// add the current time indicator
		$('calendar_grid_week_events_content').appendChild(Builder.node('div', {id:'current_time_indicator', style:'display:none'}, [Builder.node('div')]));
		// add "all day" label
		replaceElementContents($$('#calendar_grid_week_banner_columns div.calendar_grid_hours_key div')[0], '_Calendar.Appointments.AllDay'.loc());
		// space out week view headers
		this.mWeekEventSpacer = new BlockSpacer('calendar_grid_week_events_columns', $('calendar_grid_week_events_content'));
		this.mWeekHeaderSpacer = new BlockSpacer('calendar_grid_week_header_columns', this.mWeekEventSpacer);
		this.mWeekBannerSpacer = new BlockSpacer('calendar_grid_week_banner_columns', this.mWeekEventSpacer);
		// set up the splitters
		this.mSplitView = new SplitView('calendar_grid_week_view', {
			mViews: [$('calendar_grid_week_banners'), $('calendar_grid_week_events')],
			mSplitter: 'calendar_grid_week_splitter',
			mMaintainTotalHeight: true,
			mMinimumHeight: 23
		});
		this.mNotificationsSplitView = new SplitView('calendar_splitter_parent', {
			mDuringCallback: function() {
				if ($('calendar_sidebar_notifications').visible()) {
					var height = $('calendar_splitter_parent').offsetHeight;
					height -= $('calendar_grid_sidebar_splitter').offsetHeight;
					height -= $('calendar_sidebar_toolbar').offsetHeight;
					height -= $('calendar_collection_list').offsetHeight;
					$('calendar_sidebar_notifications').style.height = (height-1) + 'px';
				}
			},
			mMinimumHeight: 112,
			mMaximumHeight: 500 // we'll figure out the real value later
		});
		// set up the month view
		for (var column = 0; column < 7; column++) {
			var labelElm = Builder.node('div', {className:'calendar_grid_month_weekday_header', id:'calendar_grid_month_weekday_header_'+column}, "foo");
			var columnElm = Builder.node('div', {className:'calendar_grid_column_contents calendar_grid_month_day_contents'});
			$('calendar_grid_month_weekday_columns').appendChild(Builder.node('li', {className:'calendar_grid_month_column_'+column}, [labelElm, columnElm]));
			for (var row = 0; row < 6; row++) {
				var labelElm = Builder.node('div', {className:'calendar_grid_month_daylabel'}, "\u00A0");
				var elm = Builder.node('div', {className:'calendar_grid_month_day calendar_grid_month_row_'+row}, [labelElm]);
				columnElm.appendChild(elm);
				Event.observe(elm, 'mousedown', this.handleMouseDownInBannerAppointmentSlot);
				Event.observe(labelElm, 'mousedown', this.handleMonthMoreButtonClick);
			}
		}
		this.mMonthViewSpacers = [new BlockSpacer('calendar_grid_month_weekday_columns', 'calendar_grid_month_content')];
		$A($('calendar_grid_month_weekday_columns').getElementsByClassName('calendar_grid_month_day_contents')).each(function(elm) {
			this.mMonthViewSpacers.push(new BlockSpacer(elm, (this.mMonthViewSpacers.length > 1 ? this.mMonthViewSpacers[1] : 'calendar_grid_month_content'), true));
		}.bind(this));
		// make the calendar visible
		$('module_calendars').style.visibility = '';
		// set up the view switcher
		$$('#calendar_grid_toolbar ul.calendar_nav_view_picker a').each(function(a) {
			Event.observe(a, 'click', this.handleViewToolbarClick);
		}.bind(this));
		// force size calculations
		this.springsResizeCallback();
		// IE needs a meaningless div above float elements
		if (browser().isIE) insertAtBeginning(Builder.node('div', {style:'height:0'}), 'calendar_grid_week_events_content');
	},
	drawTooltips: function() {
		d.body.appendChild(Builder.node('div', {id:'appointment_tooltip', className:'tooltip', style:'display:none'}, [
			Builder.node('h2', {id:'appointment_tooltip_summary'}),
			Builder.node('h4', {id:'appointment_tooltip_time_string'}),
			Builder.node('dl', [
				Builder.node('dt', '_Calendar.Tooltips.Location'.loc()),
				Builder.node('dd', {id:'appointment_tooltip_location'}),
				Builder.node('dt', '_Calendar.Tooltips.Description'.loc()),
				Builder.node('dd', {id:'appointment_tooltip_description'})
			])
		]));
	},
	selectCalendar: function(inCalendar) {
		this.mSelectedCalendar = inCalendar;
		if (!inCalendar) return;
		var calendarElements = $$('#calendar_collection_list li');
		// deselect all calendars
		calendarElements.invoke('removeClassName', 'calendar_selected_collection');
		// select the right calendar
		var idx = this.mRemoteCalendarCollection.mCalendars.indexOf(inCalendar);
		calendarElements[idx].addClassName('calendar_selected_collection');
	},
	dataSourceForElement: function(inElement) {
		var match = ($(inElement).id || '').match(/appointment_div_(.+)_\d*$/);
		return (match ? this.mAppointments[match[1]] : null);
	},
	handleMouseDownInCalendar: function(inEvent) {
		// figure out if we clicked a checkbox, or an info button...
		//6955821
		var isCheckbox = false, isInfoButton = false;
		var isCheckbox = Event.findElement(inEvent, 'div.colorcheckbox_container');
		if (!isCheckbox) isInfoButton = Event.findElement(inEvent, 'a.calendar_info_button');
		inEvent.stop();
		var elm = Event.findElement(inEvent, 'li');
		// find the offset of this element, use that to find out which calendar this is
		var cal = this.mRemoteCalendarCollection.mCalendars[elm.previousSiblings().length];
		// find out if we clicked a checkbox
		if (isCheckbox) {
			// switch the checkbox state in the data store
			cal.mEnabled = !cal.mEnabled;
			// find the state sub-element
			var stateElm = elm.down('span.colorcheckbox_state');
			// switch the class from checked to unchecked, or vice-versa
			stateElm.className = stateElm.className.replace(/(colorcheckbox_)(un)?(checked)/, '$1'+(cal.mEnabled?'':'un')+'$3');
			// tell the date control to publish a notification; that will indirectly call this.handleDateChanged()
			this.mDateNavigation.setSelectedDate();
		}
		else if (isInfoButton) {
			this.showCalendarInfoDialog(cal, elm.down('a.calendar_info_button'));
		}
		else {
			this.selectCalendar(cal);
			// when moving the mouse, drag the calendar
			var mouseMovedCallback = function(inEvent) {
				
			}.bindAsEventListener(this);
			// when mouse is released, snap back or offer to delete calendar
			var mouseUpCallback = function(inEvent) {
				alert('up');
			}.bindAsEventListener(this);
			// watch mouse moved events
			//observeEvents(this, d, {mousemove:mouseMovedCallback, mouseup:mouseUpCallback});
		}
	},
	handleFontSizeChanged: function(inElement, inHeight) {
		this.mViewSprings.boing();
		if (this.mMonthMode) {
			this.mMonthViewSpacers.invoke('space');
		}
		else {
			this.mWeekEventSpacer.space();
			this.mWeekHeaderSpacer.space();
			this.mWeekBannerSpacer.space();
		}
		this.drawVisibleAppointments(false);
	},
	handleViewToolbarClick: function(inEvent) {
		Event.stop(inEvent);
		var a = Event.findElement(inEvent, 'a');
		if (a.id == 'paginator_prev') {
			var dt = new Date(this.mDateNavigation.mSelectedDate.getTime());
			if (this.mMonthMode) {
				dt.setMonth(dt.getMonth() - 1);
			}
			else {
				dt.setDate(dt.getDate() - (this.mDayMode ? 1 : 7))
			}
			this.mDateNavigation.setSelectedDate(dt);
		}
		else if (a.id == 'paginator_day') {
			this.mMonthMode = false;
			this.mDayMode = true;
			this.mDateNavigation.setSelectedDate();
		}
		else if (a.id == 'paginator_week') {
			this.mMonthMode = false;
			this.mDayMode = false;
			this.mDateNavigation.setSelectedDate();
		}
		else if (a.id == 'paginator_month') {
			this.mMonthMode = true;
			this.mDayMode = false;
			this.mDateNavigation.setSelectedDate();
		}
		else if (a.id == 'paginator_next') {
			var dt = new Date(this.mDateNavigation.mSelectedDate.getTime());
			if (this.mMonthMode) {
				dt.setMonth(dt.getMonth() + 1);
			}
			else {
				dt.setDate(dt.getDate() + (this.mDayMode ? 1 : 7))
			}
			this.mDateNavigation.setSelectedDate(dt);
		}
		return false;
	},
	handleMonthMoreButtonClick: function(inEvent) {
		Event.stop(inEvent);
		var elm = Event.element(inEvent);
		dt = elm.up().id.match(/_(\d{8})/)[1];
		this.mMonthMode = false;
		this.mDateNavigation.setSelectedDate(createDateObjFromISO8601(dt, false));
		return false;
	},
	handleTodayButtonClick: function(inEvent) {
		Event.stop(inEvent);
		this.mDateNavigation.setSelectedDate(new Date());
		return false;
	},
	handleMakeCalendarClick: function(inEvent) {
		inEvent.stop();
		if (!this.mRemoteCalendarCollection.userCanWriteContent()) return false;
		if (!$('mkcalendar_dialog')) {
			dialogManager().drawDialog('mkcalendar_dialog', [
				{label:'_Calendar.Dialogs.NewCalendar.Name'.loc(), contents:'<input type="text" id="mkcalendar_dialog_calendarname"/>'},
				{label:'_Calendar.Dialogs.NewCalendar.Color'.loc(), contents:'<div id="mkcalendar_dialog_calendarcolor"></div>'} // TODO: do we still need a sub-div?
			], '_Calendar.Dialogs.NewCalendar.Create'.loc(), null, '_Calendar.Dialogs.NewCalendar.Title'.loc());
			// set up the color popup
			this.mMakeCalendarColorPicker = new CalendarColorPicker('mkcalendar_dialog_calendarcolor', 'mkcalendar_color_popup');
		}
		this.mMakeCalendarColorPicker.setValue(this.mRemoteCalendarCollection.nextAvailableCalendarColor());
		var okCallback = function() {
			//alert('should make calendar for ' + $F('mkcalendar_dialog_calendarname'));
			var madeCalendarCallback = function() {
				notifier().printMessage('mkcalendar_confirm');
			}
			var calendarName = $F('mkcalendar_dialog_calendarname');
			if (!calendarName.match(/\S/)) calendarName = '_Calendar.Dialogs.NewCalendar.Untitled'.loc();
			this.mRemoteCalendarCollection.makeCalendar(calendarName, madeCalendarCallback, this.mMakeCalendarColorPicker.getValue());
		}
		dialogManager().show('mkcalendar_dialog', null, okCallback.bind(this));
	},
	handleDateChanged: function(inMessage, inObject, inUserInfo) {
		if (Element.visible(this.mParentElement)) {
			this.updateCurrentTime();
			// make sure we have timezone information for the selected range
			var range = this.dateRangeToFetch();
			// get the first day of the selected week
			var today = new Date();
			// update the week view headers
			$('calendar_grid_week_year').update(inUserInfo.selectedDate.formatDate('Y'));
			var currentDate = new Date(inUserInfo.weekStartDate.getTime());
			$A($('calendar_grid_week_header_columns').getElementsByClassName('calendar_grid_weekday_label')).each(function(elm) {
				replaceElementContents(elm, currentDate.formatDate('_Calendar.DateFormats.DayHeader'.loc()));
				currentDate.setDate(currentDate.getDate()+1);
			});
			// update the banner slot IDs
			currentDate = new Date(inUserInfo.weekStartDate.getTime());
			$A($('calendar_grid_week_banner_columns').getElementsByClassName('calendar_grid_week_banner_slot')).each(function(elm) {
				elm.id = 'calendar_grid_week_banner_slot_'+parseInt(dateObjToISO8601(currentDate, false));
				currentDate.setDate(currentDate.getDate()+1);
			});
			// update the month headers
			replaceElementContents('calendar_grid_month_header', inUserInfo.weekStartDate.formatDate('_Dates.DateFormats.LongMonthAndYear'.loc()));
			currentDate = new Date(inUserInfo.weekStartDate.getTime());
			$$('#calendar_grid_month_weekday_columns div.calendar_grid_month_weekday_header').each(function(hdrElm) {
				replaceElementContents(hdrElm, currentDate.formatDate('l')); // no need for this format to be localized
				currentDate.setDate(currentDate.getDate()+1);
			});
			// update the month days
			currentDate = new Date(inUserInfo.weekStartDate.getTime());
			currentDate.setDate(1);
			currentDate.setDate(1 - (currentDate.getDay() - principalService().startWeekday()));
			for (var i = 0; i < 6; i++) {
				$$('#calendar_grid_month_content .calendar_grid_month_row_'+i+' div.calendar_grid_month_daylabel').each(function(elm) {
					replaceElementContents(elm, ''+currentDate.getDate());
					elm.parentNode.id = 'calendar_grid_month_day_'+parseInt(dateObjToISO8601(currentDate, false));
					if (currentDate.getMonth() == inUserInfo.weekStartDate.getMonth()) {
						elm.up().removeClassName('calendar_grid_othermonth_day');
					}
					else {
						elm.up().addClassName('calendar_grid_othermonth_day');
					}
					currentDate.setDate(currentDate.getDate()+1);
				});
			}
			// switch views if needed
			if (Element.visible(this.mMonthMode ? 'calendar_grid_week_view' : 'calendar_grid_month_view')) {
				$('calendar_grid_week_view', 'calendar_grid_month_view').invoke('toggle');
				// set cookie so we remember view
				this.setLastView(this.mMonthMode ? 'month' : 'week');
				// remove elements from old view
				$H(this.mAppointments).each(function(currentAppt) {
					currentAppt.value.displayNodes.each(function(currentNode) {
						if (currentNode.element) {
							Element.remove(currentNode.element);
							delete currentNode.element;
						}
					})
				});
				this.mViewSprings.boing();
				if (this.mMonthMode) {
					this.mMonthViewSpacers.invoke('space');
				}
				else {
					this.mWeekEventSpacer.space();
					this.mWeekHeaderSpacer.space();
					this.mWeekBannerSpacer.space();
					// scroll to middle
					var scroller = $('calendar_grid_week_events');
					scroller.scrollTop = (scroller.scrollHeight - Element.getHeight(scroller)) / 2;
				}
			}
			// select the correct tab
			this.setSelectedChild(this.mMonthMode ? 'paginator_month' : (this.mDayMode ? 'paginator_day' : 'paginator_week'));
			// force size calculations
			this.springsResizeCallback();
			// highlight "columns of interest" in week view
			if ($('calendar_grid_week_view').visible()) {
				// highlight the current date
				$$('#calendar_grid_week_header_columns .calendar_grid_today_weekday_label').invoke('removeClassName', 'calendar_grid_today_weekday_label');
				$$('#calendar_grid_week_view .calendar_grid_week_today_column').invoke('removeClassName', 'calendar_grid_week_today_column');
				if (compareDateWeeks(today, inUserInfo.selectedDate, this.mDateNavigation.mStartWeekday)) {
					var todayColNum = dateToColummNumber(today, this.mDateNavigation.mStartWeekday);
					$$('#calendar_grid_week_header_columns .calendar_grid_weekday_label')[todayColNum].addClassName('calendar_grid_today_weekday_label');
					$$('#calendar_grid_week_view .calendar_grid_week_column_'+todayColNum).invoke('addClassName', 'calendar_grid_week_today_column');
				}
				// highlight the selected date
				$$('#calendar_grid_week_header_columns .calendar_grid_selected_weekday_label').invoke('removeClassName', 'calendar_grid_selected_weekday_label');
				$$('#calendar_grid_week_view .calendar_grid_week_selected_column').invoke('removeClassName', 'calendar_grid_week_selected_column');
				var selectedDtstart = dateObjToISO8601(inUserInfo.selectedDate, false);
				var todayIsSelected = (parseInt(selectedDtstart) == parseInt(dateObjToISO8601(today, false)));
				
				var colNum = dateToColummNumber(inUserInfo.selectedDate, inUserInfo.weekStartDate.getDay());
				if ((!this.mDayMode) && (!todayIsSelected) && this.mAppointments && $('calendar_grid_week_view').visible()) {
					$$('#calendar_grid_week_header_columns .calendar_grid_weekday_label')[colNum].addClassName('calendar_grid_selected_weekday_label');
					$$('#calendar_grid_week_view .calendar_grid_week_column_'+colNum).invoke('addClassName', 'calendar_grid_week_selected_column');
				}
				// zoom in/out for day view
				$A([this.mWeekEventSpacer, this.mWeekHeaderSpacer, this.mWeekBannerSpacer]).invoke((this.mDayMode ? 'zoomInOnItem' : 'zoomOut'), colNum);
				this.resizeWeekViewCalendarGrid();
			}
			// highlight "days of interest" in the month view
			if ($('calendar_grid_month_view').visible()) {
				// highlight the current date
				$$('#calendar_grid_month_content div.current_day_cell').invoke('removeClassName', 'current_day_cell');
				var todayElm = $('calendar_grid_month_day_'+parseInt(dateObjToISO8601(new Date())));
				if (todayElm) todayElm.addClassName('current_day_cell');
				// highlight the selected date
				$$('#calendar_grid_month_content div.selected_day_cell').invoke('removeClassName', 'selected_day_cell');
				var selectedDateElm = $('calendar_grid_month_day_'+parseInt(dateObjToISO8601(inUserInfo.selectedDate)));
				if (selectedDateElm) selectedDateElm.addClassName('selected_day_cell');
			}
			// get appts from server
			this.drawVisibleAppointments(false);
			this.getAppointmentsFromServer();
		}
	},
	handleStartWeekdayChanged: function(inMessage, inObject, inUserInfo) {
		this.mDateNavigation.setStartWeekday(inUserInfo.startWeekday);
		this.mDateNavigation.setSelectedDate();
	},
	handleMouseDownInWeekTimedAppointment: function(inEvent) {
		Event.stop(inEvent);
		var pos = [Event.pointerX(inEvent), Event.pointerY(inEvent)];
		var elm = Event.element(inEvent).up('div.calendar_appointment').down('.calendar_appointment_content');
		var isResize = Event.element(inEvent).className && Event.element(inEvent).className.match(/_resizehandle/);
		var appt = this.dataSourceForElement(elm.parentNode);
		// bail if we can't write to the selected event
		if (!appt.userCanWriteContent()) return false;
		// draw a temporary div
		var apptDiv = Builder.node('div', {className:'temporary_calendar_appointment'}, appt.summary);
		$('calendar_grid_week_events_content').appendChild(apptDiv);
		['width', 'height', 'top', 'left'].each(function(s) {
			apptDiv.style[s] = elm.parentNode.style[s];
		});
		// make the current display nodes invisible
		appt.displayNodes.each(function(currentNode) {
			if (currentNode.element) currentNode.element.style.visibility = 'hidden';
		});
		var allowedRange = [Element.getTop('calendar_grid_week_events')];
		allowedRange.push(allowedRange[0] + Element.getHeight('calendar_grid_week_events'));
		// which column does the div live in?
		var weekday = (-1);
		var foundColumn = $A($('calendar_grid_week_events_columns').getElementsByClassName('calendar_grid_week_events_column')).detect(function(li, i) {
			if (Position.within(li, pos[0], pos[1])) {
				weekday = i;
				return true;
			}
			return false;
		});
		if (!foundColumn) return false; // WTF-case, bail
		this.mDragInfo = {
			appt: appt,
			element: apptDiv,
			startWeekday: weekday,
			startPointer: pos,
			startTop: parseInt(apptDiv.style.top),
			startHeight: parseInt(apptDiv.style.height),
			allowedRange: allowedRange
		}
		this.startDrag();
		// observe mouse events (only allow drag if the organizer is the current principal)
		var eventsToObserve = {mouseup:isResize ? 'handleWeekTimedAppointmentResizeEnd' : 'handleWeekTimedAppointmentRescheduleEnd'};
		if (appt.organizerIsPrincipal()) {
			eventsToObserve.mousemove = isResize ? 'handleWeekTimedAppointmentResizeMove' : 'handleWeekTimedAppointmentRescheduleMove';
		}
		observeEvents(this, d, eventsToObserve);
		return false;
	},
	handleWeekTimedAppointmentRescheduleMove: function(inEvent) {
		Event.stop(inEvent);
		var pos = [Event.pointerX(inEvent), Event.pointerY(inEvent)];
		// only start dragging when the user has passed a threshold of 1/2 hour or 1 day left/right (##6381232)
		if (!this.mDragInfo.threshold && Math.abs(pos[0]-this.mDragInfo.startPointer[0]) < this.mWeekGridSize[0] && Math.abs(pos[1]-this.mDragInfo.startPointer[1]) < (this.mWeekGridSize[1]/2)) {
			return false;
		}
		this.mDragInfo.threshold = true;
		// find out which weekday (if any) the mouse is over
		var weekday = (-1);
		var foundColumn = $$('#calendar_grid_week_events_columns .calendar_grid_week_events_column').detect(function(li, i) {
			if (Position.within(li, pos[0], pos[1])) {
				weekday = i;
				return true;
			}
			return false;
		});
		// make sure the pointer is inside the timed events div
		if (foundColumn && this.mDragInfo.allowedRange[0] <= pos[1] && pos[1] <= this.mDragInfo.allowedRange[1]) {
			// move to the correct column if needed
			if (weekday != this.mDragInfo.currentWeekday) {
				Position.clone(foundColumn.firstChild, this.mDragInfo.element, {setHeight:false, setTop:false});
				// incorporate week offset
				this.mDragInfo.element.style.width = (parseInt(this.mDragInfo.element.style.width) + this.mWeekEventElementOffsets[2]) + 'px';
				this.mDragInfo.currentWeekday = weekday;
			}
			// reposition element based on mouse pointer delta (and snap to grid)
			var snapHeight = this.mWeekGridSize[1] * this.mSnapHours;
			var delta = pos[1] - this.mDragInfo.startPointer[1];
			delta = Math.floor(delta / snapHeight) * snapHeight;
			var top = this.mDragInfo.startTop + delta;
			this.mDragInfo.element.style.top = top + 'px';
		}
	},
	handleWeekTimedAppointmentRescheduleEnd: function(inEvent) {
		stopObservingEvents(this, d, {
			mousemove: 'handleWeekTimedAppointmentRescheduleMove',
			mouseup: 'handleWeekTimedAppointmentRescheduleEnd'
		});
		// get the appointment date and time
		var dt = this.mDragInfo.appt.startDate();
		var dirty = false;
		// only update start date when the user has passed a threshold of 1/2 hour or 1 day left/right (##6381232)
		if (this.mDragInfo.threshold) {
			// if moved to a different day, add the difference
			if (this.mDragInfo.currentWeekday != null) dt.setDate(dt.getDate() + (this.mDragInfo.currentWeekday - this.mDragInfo.startWeekday));
			// add the time delta as well
			var hours = dt.getHours() + (dt.getMinutes() / 60);
			hours += (parseInt(this.mDragInfo.element.style.top) - this.mDragInfo.startTop) / this.mWeekGridSize[1];
			// snap to time
			hours = Math.round(hours / this.mSnapHours) * this.mSnapHours;
			// set the date object hours and minutes
			dt.setHours(Math.floor(hours));
			dt.setMinutes((hours - Math.floor(hours)) * 60);
			// change the value in the appt, and save
			var dtstart = dateObjToISO8601(dt);
			dirty = (dtstart.replace(/Z$/, '') != this.mDragInfo.appt.startDate(true).replace(/Z$/, ''));
			this.mDragInfo.appt.setStartDate(dt);
		}
		// update appt div
		Element.remove(this.mDragInfo.element);
		this.endDrag();
		this.drawAppointment(this.mDragInfo.appt, false);
		if (dirty) { //  save to server
			this.mDragInfo.appt.setStartDate(dt);
			this.updateAppointmentEntry(this.mDragInfo.appt);
		}
		else { // show details (user just clicked)
			this.showApptDetails(this.mDragInfo.appt);
		}
		delete this.mDragInfo;
	},
	handleMouseDownInWeekTimedAppointmentSlot: function(inEvent) {
		Event.stop(inEvent);
		// bail if we can't write to the selected calendar
		if (!this.mSelectedCalendar.userCanWriteContent()) return false;
		var elm = Event.element(inEvent);
		var parentElm = Event.findElement(inEvent, 'li');
		var rowMatch = elm.className.match(/calendar_grid_week_row_(\d+)/);
		var columnMatch = parentElm.className.match(/calendar_grid_week_column_(\d+)/);
		if (rowMatch && columnMatch) {
			// get the overlap (how far into the hour did they click?)
			var overlap = (Event.pointerY(inEvent) - Position.page(elm)[1]) / this.mWeekGridSize[1];
			// snap downward in hours/minutes (upward on screen)
			overlap = Math.floor(overlap / this.mSnapHours) * this.mSnapHours;
			// figure out what time the event should start
			var startDate = new Date(this.mDateNavigation.mWeekStartDate.getTime());
			startDate.setDate(startDate.getDate() + parseInt(columnMatch[1]));
			startDate.setHours(parseInt(rowMatch[1]));
			startDate.setMinutes(overlap * 60);
			startDate.setSeconds(0);
			// create appointment div
			var apptDiv = Builder.node('div', {className:'temporary_calendar_appointment'}, '_Calendar.Appointments.DefaultSummary'.loc());
			$('calendar_grid_week_events_content').appendChild(apptDiv);
			Position.clone(elm, apptDiv, {setWidth:false, setHeight:false});
			Element.setOffsetWidth(apptDiv, elm.offsetWidth);
			Element.setOffsetHeight(apptDiv, this.mWeekGridSize[1] * this.mDefaultHours);
			apptDiv.style.top = (parseInt(apptDiv.style.top) + (overlap * this.mWeekGridSize[1])) + 'px';
			// set up what ivars we need for the resize event
			this.mDragInfo = {
				element: apptDiv,
				startDate: startDate,
				startPointer: [Event.pointerX(inEvent), Event.pointerY(inEvent)],
				startHeight: this.mWeekGridSize[1] * this.mDefaultHours,
				maxSize: 24 - startDate.getHours() - overlap
			}
			this.startDrag();
			// observe mouse events
			observeEvents(this, d, {
				mousemove: 'handleWeekTimedAppointmentResizeMove',
				mouseup: 'handleWeekTimedAppointmentResizeEnd'
			});
		}
		return false; // cancel event
	},
	handleWeekTimedAppointmentResizeMove: function(inEvent) {
		Event.stop(inEvent);
		// find the new height
		var height = (Event.pointerY(inEvent) - this.mDragInfo.startPointer[1]) + this.mDragInfo.startHeight;
		// snap resize height
		var snapHeight = this.mWeekGridSize[1] * this.mSnapHours;
		height = Math.floor(height / snapHeight) * snapHeight;
		// make sure it's not less then the minimum height
		height = Math.max(height, this.mWeekGridSize[1] * this.mMinimumHours);
		// finally, set the element height
		this.mDragInfo.element.style.height = height + 'px';
	},
	handleWeekTimedAppointmentResizeEnd: function(inEvent) {
		stopObservingEvents(this, d, {
			mousemove: 'handleWeekTimedAppointmentResizeMove',
			mouseup: 'handleWeekTimedAppointmentResizeEnd'
		});
		// convert the height to a duration in hours
		var height = parseInt(this.mDragInfo.element.style.height);
		var hours = height / this.mWeekGridSize[1];
		// round the hours
		var overlap = hours - Math.floor(hours);
		overlap = Math.round(overlap / this.mSnapHours) * this.mSnapHours;
		hours = Math.floor(hours) + overlap;
		// create an appointment if it's not in the drag info
		var appt = this.mDragInfo.appt;
		if (!appt) {
			appt = this.mSelectedCalendar.createCalendarEvent();
			appt.setSummary('_Calendar.Appointments.DefaultSummary'.loc());
			appt.setStartDate(this.mDragInfo.startDate);
		}
		appt.setDuration(getDurationForHours(hours));
		this.endDrag();
		if ((!this.mDragInfo.appt) || this.mDragInfo.appt.mIsNew) {
			this.showApptDialog(appt);
		}
		else {
			// change the classes back
			appt.displayNodes.each(function(currentNode) {
				if (currentNode.element) {
					$(currentNode.element).removeClassName('temporary_calendar_appointment');
					$(currentNode.element).addClassName('calendar_appointment');
				}
			});
			this.updateAppointmentEntry(appt);
		}
	},
	handleMouseDownInBannerAppointment: function(inEvent) {
		Event.stop(inEvent);
		var pos = [Event.pointerX(inEvent), Event.pointerY(inEvent)];
		var elm = Event.element(inEvent);
		var isResize = elm.className && elm.className.match(/_resizehandle/);
		var appt = this.dataSourceForElement(elm.up('.calendar_appointment'));
		// switch display to temporary
		appt.displayNodes.each(function(currentNode) {
			if (currentNode.element) {
				Element.removeClassName(currentNode.element, 'calendar_appointment');
				Element.addClassName(currentNode.element, 'temporary_calendar_appointment');
			}
		});
		// get a list of other elements as drop zones
		var allDropZones = [];
		if ($('calendar_grid_week_view').visible()) {
			allDropZones = $A($('calendar_grid_week_banner_columns').getElementsByClassName('calendar_grid_week_banner_slot'));
		}
		else {
			allDropZones = $A($('calendar_grid_month_weekday_columns').getElementsByClassName('calendar_grid_month_day'));
		}
		// figure out what day they clicked in (for an offset)
		var foundElm = allDropZones.detect(function(elm) {
			return Position.within(elm, pos[0], pos[1]) && elm.id && elm.id.match(/_\d{8}/);
		});
		if (!foundElm) return false; // sanity check; this should never happen!
		var clickedDate = createDateObjFromISO8601(foundElm.id.match(/_(\d{8})/)[1], false);
		var startDate = appt.startDate();
		var startOffsetDays = (clickedDate.getTime() - startDate.getTime()) / this.mSecondsInDay;
		this.mDragInfo = {
			appt: appt,
			allDropZones: allDropZones,
			startOffsetDays: startOffsetDays,
			startDate: startDate
		}
		this.startDrag();
		// observe mouse events (only allow drag if the organizer is the current principal)
		var eventsToObserve = {mouseup:isResize ? 'handleBannerAppointmentResizeEnd': 'handleBannerAppointmentRescheduleEnd'};
		if (appt.organizerIsPrincipal()) {
			eventsToObserve.mousemove = isResize ? 'handleBannerAppointmentResizeMove' : 'handleBannerAppointmentRescheduleMove';
		}
		observeEvents(this, d, eventsToObserve);
	},
	handleBannerAppointmentRescheduleMove: function(inEvent) {
		//Event.stop(inEvent);
		var pos = [Event.pointerX(inEvent), Event.pointerY(inEvent)];
		// find out what day the mouse event is in
		var foundElm = this.mDragInfo.allDropZones.detect(function(elm) {
			return Position.within(elm, pos[0], pos[1]) && elm.id && elm.id.match(/_\d{8}/);
		});
		if (!foundElm) return false; // user's getting all crazy-like with their drag
		var dt = createDateObjFromISO8601(foundElm.id.match(/_(\d{8})/)[1], false);
		// subtract the offset days (in case user started drag from days into the appt)
		dt.setDate(dt.getDate() - this.mDragInfo.startOffsetDays);
		var dtstart = dateObjToISO8601(dt, false);
		appointmentDtstart = dateObjToISO8601(this.mDragInfo.appt.startDate());
		// if the date has changed, update appointment and redraw it
		if (parseInt(dtstart) != parseInt(appointmentDtstart)) {
			// make sure we carry the time forward
			var timeMatch = appointmentDtstart.match(/T\d{6}/);
			if (timeMatch) {
				dtstart = dtstart.replace(/T\d{6}/, timeMatch[0]);
			}
			// update the appt info
			this.mDragInfo.appt.setStartDate(createDateObjFromISO8601(dtstart));
			this.drawAppointment(this.mDragInfo.appt, false);
			this.mDragInfo.dirty = true;
			// switch display to temporary (do this again in case different nodes were drawn)
			this.mDragInfo.appt.displayNodes.each(function(currentNode) {
				if (currentNode.element) {
					Element.addClassName(currentNode.element, 'temporary_calendar_appointment');
					Element.removeClassName(currentNode.element, 'calendar_appointment');
				}
			});
		}
	},
	handleBannerAppointmentRescheduleEnd: function(inEvent) {
		//Event.stop(inEvent);
		stopObservingEvents(this, d, {
			mousemove: 'handleBannerAppointmentRescheduleMove',
			mouseup: 'handleBannerAppointmentRescheduleEnd'
		});
		// change the classes back
		this.mDragInfo.appt.displayNodes.each(function(currentNode) {
			if (currentNode.element) {
				$(currentNode.element).removeClassName('temporary_calendar_appointment');
				$(currentNode.element).addClassName('calendar_appointment');
			}
		});
		this.endDrag();
		// if they haven't moved the appointment, go to the appointment page
		if (this.mDragInfo.dirty) {
			this.updateAppointmentEntry(this.mDragInfo.appt);
		}
		else {
			this.showApptDetails(this.mDragInfo.appt);
		}
	},
	handleMouseDownInBannerAppointmentSlot: function(inEvent) {
		Event.stop(inEvent);
		// bail if we can't write to the selected calendar
		if (!this.mSelectedCalendar.userCanWriteContent()) return false;
		
		var elm = Event.element(inEvent);
		var elmDateMatch = elm.id.match(/_(\d{8})/);
		if (elmDateMatch) {
			// get a list of other elements as drop zones
			var allDropZones = [];
			if ($('calendar_grid_week_view').visible()) {
				allDropZones = $A($('calendar_grid_week_banner_columns').getElementsByClassName('calendar_grid_week_banner_slot'));
			}
			else {
				allDropZones = $A($('calendar_grid_month_weekday_columns').getElementsByClassName('calendar_grid_month_day'));
			}
			// create a temporary appointment
			var appt = this.mSelectedCalendar.createCalendarEvent();
			appt.setSummary('_Calendar.Appointments.DefaultSummary'.loc());
			appt.setBanner(true);
			appt.setStartDate(elmDateMatch[1]+'T000000');
			appt.setDuration('P1D');
			// draw the appointment
			this.drawAppointment(appt, false);
			// set up what ivars we need for the resize event
			this.mDragInfo = {
				appt: appt,
				allDropZones: allDropZones,
				startDate: appt.startDate()
			}
			// keep track of the appointment
			this.mAppointments[appt.uid] == appt;
			// start the drag operation
			this.startDrag();
			observeEvents(this, d, {
				mousemove: 'handleBannerAppointmentResizeMove',
				mouseup: 'handleBannerAppointmentResizeEnd'
			});
		}
		return false;
	},
	handleBannerAppointmentResizeMove: function(inEvent) {
		Event.stop(inEvent);
		var pos = [Event.pointerX(inEvent), Event.pointerY(inEvent)];
		var foundElm = this.mDragInfo.allDropZones.detect(function(elm) {
			return Position.within(elm, pos[0], pos[1]) && elm.id && elm.id.match(/_\d{8}/);
		});
		if (foundElm) {
			// get the end date from the found element
			// start date is (probably) in the event
			var startDate = this.mDragInfo.appt.startDate();
			// get the end date from the found element
			var endDate = createDateObjFromISO8601(foundElm.id.match(/_(\d{8})/)[1]);
			// banner events actually end on the NEXT day
			endDate.setDate(endDate.getDate()+1);
			// get the duration from the start and end date
			var duration = {days:1};
			if (endDate > startDate) { // TODO: support dragging events backwards
				duration = getDurationUsingEndDate(startDate, endDate);
			}
			// set the appointment info
			this.mDragInfo.appt.setDuration(duration);
			// draw the appointment
			this.drawAppointment(this.mDragInfo.appt, false);
			return false;
			// set the appointment info
			this.mDragInfo.appt.setEndDate(Math.max(startDate, endDate));
			// if the duration is less than 1 day, make it 1 day
			var duration = this.mDragInfo.appt.duration();
			if (duration.years <= 0 && duration.months <= 0 && duration.days <= 0) {
				this.mDragInfo.appt.setDuration('P1D');
			}
			this.drawAppointment(this.mDragInfo.appt, false);
		}
	},
	handleBannerAppointmentResizeEnd: function(inEvent) {
		Event.stop(inEvent);
		stopObservingEvents(this, d, {
			mousemove: 'handleBannerAppointmentResizeMove',
			mouseup: 'handleBannerAppointmentResizeEnd'
		});
		this.endDrag();
		if (this.mDragInfo.appt.mIsNew) {
			this.showApptDialog(this.mDragInfo.appt);
		}
		else {
			// change the classes back
			//this.mDragInfo.appt.displayNodes.each(function(currentNode) {
			//	if (currentNode.element) {
			//		$(currentNode.element).removeClassName('temporary_calendar_appointment');
			//		$(currentNode.element).addClassName('calendar_appointment');
			//	}
			//});
			this.updateAppointmentEntry(this.mDragInfo.appt);
		}
	},
	revertTemporaryDisplayNodes: function() {
		if (this.mDragInfo && this.mDragInfo.appt) this.mDragInfo.appt.displayNodes.each(function(currentNode) {
			if (currentNode.element) {
				$(currentNode.element).removeClassName('temporary_calendar_appointment');
				$(currentNode.element).addClassName('calendar_appointment');
			}
		});
	},
	handleSettingsClick: function(inEvent) {
		inEvent.stop();
		settingsDialog().show();
		return false;
	},
	handleWindowResize: function(inEvent) {
		this.mViewSprings.boing();
		if (this.mMonthMode) {
			this.mMonthViewSpacers.invoke('space');
		}
		else {
			this.mWeekEventSpacer.space();
			this.mWeekHeaderSpacer.space();
			this.mWeekBannerSpacer.space();
		}
		this.drawVisibleAppointments(false);
	},
	setLastView: function(inViewName) {
		var cookieExpire = new Date();
		cookieExpire.setFullYear(cookieExpire.getFullYear()+2);
		d.cookie = 'calendarView='+inViewName+'; expires='+cookieExpire.toGMTString()+'; path='+window.location.pathname;
	},
	showApptDetails: function(inAppointment) {
		this.showApptDialog(inAppointment);
	},
	showApptDialog: function(inAppointment, inOptShowOverElement) {
		// stop server refresh
		if (this.mTimer) {
			clearTimeout(this.mTimer);
			delete this.mTimer;
		}
		this.mGetApptsRequest = null;
		// cancel button callback
		var cancelButtonCallback = function() {
			$$('#module_calendars .temporary_calendar_appointment').invoke('remove');
			delete this.mDragInfo;
			this.getAppointmentsFromServer();
		}
		var okButtonCallback = function() {
			this.updateAppointmentEntry(inAppointment);
		}
		var deleteCallback = function() {
			// FIXME: confirm dialog doesn't show
			if ($A([CalendarEvent.RecurrenceType.None, CalendarEvent.RecurrenceType.Separated]).include(inAppointment.recurrenceType())) {
				if (confirm('_Calendar.Dialogs.Delete.Title'.loc())) {
					// FIXME: we currently only support OnlyThis for separated events, set the action correctly
					if (inAppointment.recurrenceType() == CalendarEvent.RecurrenceType.Separated)
						inAppointment.setRecurrenceChangeAction(CalendarEvent.RecurrenceChangeAction.OnlyThis);
					this.deleteAppointmentFromServer(inAppointment);
				}
			}
			else { // recurrence manager will handle confirmation
				this.deleteAppointmentFromServer(inAppointment);
			}
			
		}
		dialogManager().showProgressMessage('_Calendar.Progress.GettingEvents'.loc(), false, null, true);
		// show the dialog
		dialogManager().hideProgressMessage();
		appointmentDialog().show(inAppointment, cancelButtonCallback.bind(this), okButtonCallback.bind(this), inOptShowOverElement, deleteCallback.bind(this));
	},
	showCalendarInfoDialog: function(inCalendar, inShowOverElement) {
		var defaultCalendarColors = this.mRemoteCalendarCollection.mDefaultCalendarColors;
		if (!$('calendar_info_dialog')) {
			dialogManager().drawDialog('calendar_info_dialog', [
				{label:'_Calendar.Dialogs.CalendarInfo.Name'.loc(), contents:'<input type="text" id="calendar_info_dialog_calendarname"/>'},
				{label:'_Calendar.Dialogs.CalendarInfo.Color'.loc(), contents:'<div id="calendar_info_dialog_calendarcolor"></div>'},
				{label:'', contents:'<a href="#" id="calendar_info_dialog_calendar_share">'+('_Calendar.Dialogs.CalendarInfo.ShareWithMe'.loc())+"\u00A0\u2192</a>"},
				{label:'', contents:'<a href="#" id="calendar_info_dialog_calendar_subscription_url">'+('_Calendar.Dialogs.CalendarInfo.Subscribe'.loc())+"\u00A0\u2192</a>"}
			], '_Dialogs.Save'.loc(), null, '_Calendar.Dialogs.CalendarInfo.Title'.loc());
			// add the delete button
			var td = $('calendar_info_dialog_ok').up('td');
			td.colSpan = '1';
			td.parentNode.insertBefore(Builder.node('td', [
				Builder.node('div', {className:'submit'}, [
					Builder.node('input', {type:'button', id:'calendar_info_dialog_delete', value:'_Calendar.Dialogs.CalendarInfo.Delete'.loc()})
				])
			]), td);
			// set up the color popup
			this.mCalendarInfoColorPicker = new CalendarColorPicker('calendar_info_dialog_calendarcolor', 'calendar_info_color_popup');
		}
		this.mCalendarInfoColorPicker.mEnabled = inCalendar.userCanWriteContent();
		$('calendar_info_dialog_ok').value = inCalendar.userCanWriteContent() ? '_Dialogs.Save'.loc() : '_Dialogs.Done'.loc();
		$('calendar_info_dialog_cancel').style.display = inCalendar.userCanWriteContent() ? '' : 'none';
		$('calendar_info_dialog_calendarname').value = (inCalendar.mDisplayName == 'calendar' ? '_Calendar.Calendar'.loc() : inCalendar.mDisplayName);
		$('calendar_info_dialog_calendarname').disabled = !inCalendar.userCanWriteContent();
		$('calendar_info_dialog_calendar_subscription_url').href = inCalendar.iCalSubscriptionURL();
		// set up the subscription link
		var subscribeCallback = function() {
			alert(String.format('_Calendar.Dialogs.CalendarInfo.ShareWithMe.Confirmation'.loc(), {calendarName:inCalendar.mDisplayName, serverName:window.location.hostname}));
		}
		$('calendar_info_dialog_calendar_share').onclick = function() {
			inCalendar.shareCalendar(subscribeCallback.bind(this));
			return false;
		}.bind(this);
		// set up the delete button
		if (this.mRemoteCalendarCollection.mCalendars.length < 2 || !inCalendar.userCanWriteContent() || inCalendar.isDefault()) $('calendar_info_dialog_delete').hide();
		else $('calendar_info_dialog_delete').show();
		var deleteButtonCallback = function() {
			dialogManager().hide();
			if (confirm(String.format('_Calendar.Dialogs.CalendarInfo.Delete.Confirmation'.loc(), {calendarName:(inCalendar.mDisplayName == 'calendar' ? '_Calendar.Calendar'.loc() : inCalendar.mDisplayName)}))) {
				var calendarDeleteCallback = function() {
					this.getAppointmentsFromServer();
					dialogManager().hideProgressMessage();
					var calendarElm = inShowOverElement.up('li');
					calendarElm.remove();
					if (this.mRemoteCalendarCollection.mCalendars.length > 0)
						calendarViewController().selectCalendar(this.mRemoteCalendarCollection.mCalendars[0]);
				}
				dialogManager().showProgressMessage('_Calendar.Dialogs.CalendarInfo.Delete.Progress'.loc(), false, null, true);
				if (this.mTimer) {
					clearTimeout(this.mTimer);
					delete this.mTimer;
				}
				this.mRemoteCalendarCollection.deleteCalendar(inCalendar, calendarDeleteCallback.bind(this));
			}
			return false;
		}
		$('calendar_info_dialog_delete').onclick = deleteButtonCallback.bind(this);
		// select the current color
		this.mCalendarInfoColorPicker.setValue(inCalendar.mColor);
		// open the dialog
		var okCallback = function() {
			if (!inCalendar.userCanWriteContent()) return true;
			var updatedName = $F('calendar_info_dialog_calendarname');
			var updatedColor = this.mCalendarInfoColorPicker.getValue();
			if (!(updatedName.match(/\S/))) return;
			dialogManager().showProgressMessage('_Calendar.Dialogs.CalendarInfo.Save.Progress'.loc(), false, null, true);
			var renameCalendarCallback = function() {
				dialogManager().hideProgressMessage();
				replaceElementContents(inShowOverElement.up('li').down('span.calendar_collection_displayname'), updatedName);
				inShowOverElement.up('li').down('span.colorcheckbox_colorfill').style.backgroundColor = updatedColor;
				this.drawVisibleAppointments(false);
				notifier().printMessage('calendar_info_dialog_save_confirm');
			}
			inCalendar.renameCalendar(updatedName, updatedColor, renameCalendarCallback.bind(this));
		}
		var showDialogCallback = function(showAddButton) {
			$('calendar_info_dialog_calendar_share').up('tr').style.display = (showAddButton ? '' : 'none');
			$('calendar_info_dialog_calendar_subscription_url').up('tr').style.display = (showAddButton ? 'none' : '');
			dialogManager().show('calendar_info_dialog', null, okCallback.bind(this));
		}
		if (CC.meta('x-apple-user-logged-in') == 'true' && CC.meta('x-apple-username') != 'unauthenticated') {
			principalService().checkOtherPrincipalExistence('/principals/users/'+CC.meta('x-apple-username'), showDialogCallback.bind(this));
		}
		else {
			showDialogCallback.bind(this)(false);
		}
	},
	deleteAppointmentFromServer: function(inAppointment) {
		// only delete appointments which exist on the server
		if (inAppointment.isNew()) {
			$$('#module_calendars .temporary_calendar_appointment').invoke('remove');
			if (this.mDragInfo) delete this.mDragInfo;
			return;
		}
		dialogManager().showProgressMessage('_Calendar.Dialogs.Delete.Progress'.loc(), false, null, true);
		var callback = function(inRequestObj) {
			dialogManager().hideProgressMessage();
			this.removeAppointment(inAppointment);
			this.mGetApptsRequest = null;
			this.getRecurrencesFromServer(inAppointment);
		};
		this.mRequest = inAppointment.deleteFromServer(callback.bind(this));
	},
	updateAppointmentEntry: function(inAppointment) {
		var movedCallback = function() {
			dialogManager().hideProgressMessage();
			// make sure we remember the appointment
			this.mAppointments[inAppointment.uid] = inAppointment;
			//this.revertTemporaryDisplayNodes();
			// revert the temporary nodes in the appointment
			if (inAppointment.displayNodes) inAppointment.displayNodes.each(function(currentNode) {
				if (currentNode.element) {
					$(currentNode.element).removeClassName('temporary_calendar_appointment');
					$(currentNode.element).addClassName('calendar_appointment');
				}
			});
			// delete the inbox appointment (if applicable)
			var inboxElm = $('inbox_event_'+inAppointment.uid);
			if (inboxElm) inboxElm.remove();
			if (!this.hasNotifications()) this.hideNotificationsBadge();
			// Any remaining temporary divs are orphans. Destroy them.
			$$('.temporary_calendar_appointment').invoke('remove');
			//if (this.mDragInfo) {
			//	if (this.mDragInfo.element) {
			//		Element.remove(this.mDragInfo.element);
			//	}
			//}
			// move calendar to appt date and force redraw
			if (inAppointment.startDate()) this.mDateNavigation.setSelectedDate(inAppointment.startDate());
			notifier().printMessage('_Calendar.Notifications.AppointmentSaved'.loc());
			this.getRecurrencesFromServer(inAppointment);
		}
		var saveCallback = function() {
			// if we want to move the event, move it first
			if (inAppointment.mDesiredCalendar) {
				inAppointment.moveToCalendar(inAppointment.mDesiredCalendar, movedCallback.bind(this));
				delete inAppointment.mDesiredCalendar;
			}
			// if it's already in a calendar but there's an inbox event, 
			else if (this.mInboxContents && this.mInboxContents[inAppointment.uid]) {
				this.mInboxContents[inAppointment.uid].deleteFromServer(movedCallback.bind(this));
			}
			else {
				movedCallback.bind(this)();
			}
		}
		// if it's a new appointment we don't care if the recurrences have changed
		if (inAppointment.isNew()) {
			this.mRequest = inAppointment.saveToServer(saveCallback.bind(this));
		}
		else {
			// remove the iTIP method, if any
			inAppointment.mParentCalendarFile.deleteKeyFromMember('METHOD', inAppointment.mParentCalendarFile.mCalendarObj.VCALENDAR[0]);
			dialogManager().showProgressMessage('_Calendar.Dialogs.Appointment.Save.Progress'.loc(), false, null, true);
			this.mRequest = inAppointment.saveToServer(saveCallback.bind(this));
		}
	},
	dateRangeToFetch: function() {
		var range = [new Date(this.mDateNavigation.mSelectedDate.getTime()), new Date(this.mDateNavigation.mSelectedDate.getTime())];
		if (this.mMonthMode) {
			range[0].setDate(1);
			range[1].setMonth(range[1].getMonth()+1);
			range[1].setDate(0);
		}
		else {
			range[0] = new Date(this.mDateNavigation.mWeekStartDate.getTime());
			range[1] = new Date(range[0].getTime());
			range[1].setDate(range[1].getDate()+7);
		}
		// add a buffer
		range[0].setDate(range[0].getDate() - this.mBufferDays);
		range[1].setDate(range[1].getDate() + this.mBufferDays);
		
		return range;
	},
	updateCurrentTime: function() {
		if ($('calendar_grid_month_view').visible()) return;
		var dt = new Date();
		if ((this.mDayMode && parseInt(dateObjToISO8601(dt)) != parseInt(dateObjToISO8601(this.mDateNavigation.mSelectedDate))) || !compareDateWeeks(dt, this.mDateNavigation.mSelectedDate, this.mDateNavigation.mStartWeekday)) {
			$('current_time_indicator').hide();
			return;
		}
		var divLeft = $$('#calendar_grid_week_events_columns div.calendar_grid_hours_key')[0].up('li').offsetWidth - 18;
		var divTop = (this.mWeekGridSize[1]*(dt.getHours()+(dt.getMinutes()/60)))-6;
		$('current_time_indicator').setStyle({
			display: '',
			left: divLeft+'px',
			top: divTop+'px'
		});
	},
	pollForChanges: function() {
		if (this.mTimer) {
			clearTimeout(this.mTimer);
			delete this.mTimer;
		}
		if (this.mParentElement.style.display != 'none') {
			this.mPollRequest = this.mRemoteCalendarCollection.updateCalendarCTags(this.gotChangeList.bind(this));
			this.updateCurrentTime();
		}
	},
	gotChangeList: function(inChangeList) {
		// if there are new calendars, refresh the whole collection
		if (inChangeList.shouldFetchCollection) {
			this.mRemoteCalendarCollection.getCalendars();
		}
		// for now, being safe and re-fetching everything if anything is updated
		else if (inChangeList.length > 0 || inChangeList.shouldFetchInbox) {
			this.getAppointmentsFromServer();
		}
		// otherwise, set a timer for polling again
		else {
			if (this.mTimer) {
				clearTimeout(this.mTimer);
				delete this.mTimer;
			}
			this.mTimer = setTimeout(this.pollForChanges.bind(this), this.mRefreshTimeout);
		}
	},
	getAppointmentsFromServer: function() {
		if (this.mTimer) {
			clearTimeout(this.mTimer);
			delete this.mTimer;
		}
		if (this.mParentElement.style.display != 'none') {
			var range = this.dateRangeToFetch();
			// get the appointments from the server
			this.mGetApptsRequest = this.mRemoteCalendarCollection.getEventsForDateRange(range[0], range[1], this.gotAppointmentsFromServer.bind(this));
		}
	},
	getRecurrencesFromServer: function(inAppointment, inOptCallback) {
		var range = this.dateRangeToFetch();
		var expandCallback = function(q, r) {
			this.gotAppointmentsFromServer(q, r, "uid:" + inAppointment.valueForProperty('UID'));
			if (inOptCallback) inOptCallback();
		}
		this.mExpandRecurrencesRequest = inAppointment.expandRecurrences(range[0], range[1], expandCallback.bind(this));
	},
	gotAppointmentsFromServer: function(inRequestObj, inResponseObj, inOptDeletePrefix) {
		if (inRequestObj == this.mGetApptsRequest || inRequestObj == this.mExpandRecurrencesRequest) {
			// if this is our first load, kill the calendar mask
			if ($('calendar_mask').visible()) $('calendar_mask').hide();
			// only animate if we've gotten appointments before and we're not just adding exceptions
			var animate = this.mAppointments && gAnimate && !inOptDeletePrefix;
			// lazily create appointments hash
			if (!this.mAppointments) this.mAppointments = new Object();
			// sync with the existing
			var syncStatus = Array.syncKeyedArrayWithRows(this.mAppointments, inResponseObj, ['displayNodes'], inOptDeletePrefix);
			// remove the appointment elements that are no longer being returned from the server
			syncStatus.deletedRows.each(function(appt) {
				this.removeAppointment(appt, animate);
			}.bind(this));
			// redraw all of the others
			this.drawVisibleAppointments(animate);
			// get the inbox stuff
			this.getInboxContentsFromServer();
			// open the requested appointment, if applicable
			if (this.mShowAppointmentUID && this.mAppointments[this.mShowAppointmentUID]) {
				this.showApptDialog(this.mAppointments[this.mShowAppointmentUID]);
				delete this.mShowAppointmentUID;
			}
			// reset the refresh timer and hide progress messages
			if (this.mTimer) {
				clearTimeout(this.mTimer);
				delete this.mTimer;
			}
			this.mTimer = setTimeout(this.pollForChanges.bind(this), this.mRefreshTimeout);
			dialogManager().hideProgressMessage();
			globalNotificationCenter().publish('UPDATED_APPOINTMENTS', this);
		}
	},
	getInboxContentsFromServer: function() {
		this.mGetInboxRequest = this.mRemoteCalendarCollection.getInboxContents(this.gotInboxContentsFromServer.bind(this));
	},
	gotInboxContentsFromServer: function(inRequestObj, inResponseObj) {
		// we don't show event changes, so remove duplicate inbox items from the inbox
		var recentResponse = Array.removeDuplicateRows(inResponseObj, function(inEarlier, inLater) {
			var laterIsBetter = parseInt(inLater.valueForProperty('SEQUENCE')) > parseInt(inEarlier.valueForProperty('SEQUENCE'));
			(laterIsBetter ? inEarlier : inLater).deleteFromServer();
			return laterIsBetter;
		});
		var isFirstTime = (!this.mInboxContents);
		if (isFirstTime) this.mInboxContents = $A([]);
		var syncStatus = Array.syncKeyedArrayWithRows(this.mInboxContents, recentResponse);
		var contentElm = $('calendar_sidebar_notifications_content');
		syncStatus.deletedRows.each(function(calendarEvent) {
			if (calendarEvent.uid && $('inbox_event_'+calendarEvent.uid)) $('inbox_event_'+calendarEvent.uid).remove();
		});
		syncStatus.addedRows.each(function(calendarEvent) {
			var method = calendarEvent.mParentCalendarFile.iTIPMethod();
			var methodString = "\u00A0";
			var organizerString = "\u00A0";
			var buttons = [];
			// delete replies from inbox automatically (TODO: when all invitees can attend, push a notification)
			if (method == 'REPLY') {
				calendarEvent.deleteFromServer();
				return false;
			}
			else if (method == 'CANCEL') {
				methodString = '_Calendar.Sidebar.Inbox.Cancelled'.loc();
				buttons = [Builder.node('a', {href:'#', id:'itip_button_confirmcancel'}, '_Dialogs.OK'.loc())];
				buttons[0].observe('click', function(inEvent) {
					inEvent.stop();
					var eff = new Effect.BlindUp('inbox_event_'+calendarEvent.uid, {duration:0.25, afterFinish: function(eff) {
						eff.element.remove();
					}});
					calendarEvent.deleteFromServer(invalidate);
					var gotCalendarEventCallback = function(inMatchingCalendarEvent) {
						if (inMatchingCalendarEvent) {
							inMatchingCalendarEvent.deleteFromServer(function() {this.getAppointmentsFromServer()}.bind(this));
						}
					}
					this.mRemoteCalendarCollection.findEquivalentToInboxCalendarEvent(calendarEvent, gotCalendarEventCallback.bind(this));
					return false;
				}.bind(this));
			}
			else if (method == 'REQUEST') {
				organizerString = String.format('_Calendar.Sidebar.Inbox.Organizer'.loc(), {organizer:calendarEvent.organizer().displayname})
				buttons = [
					Builder.node('a', {href:'#', id:'itip_button_TENTATIVE'}, '_Calendar.Sidebar.Inbox.Status.TENTATIVE'.loc()),
					Builder.node('a', {href:'#', id:'itip_button_ACCEPTED'}, '_Calendar.Sidebar.Inbox.Status.ACCEPTED'.loc()),
					Builder.node('a', {href:'#', id:'itip_button_DECLINED'}, '_Calendar.Sidebar.Inbox.Status.DECLINED'.loc())
				];
				buttons.invoke('observe', 'click', function(inEvent) {
					inEvent.stop();
					var clickedStatus = inEvent.findElement('a').id.match(/itip_button_(.+)$/)[1];
					dialogManager().showProgressMessage('_Calendar.Dialogs.Appointment.Save.Progress'.loc(), false, null, true);
					var cleanupAfterSave = function() {
						dialogManager().hideProgressMessage();
						var eff = new Effect.BlindUp('inbox_event_'+calendarEvent.uid, {duration:0.25, afterFinish: function(eff) {
							eff.element.remove();
						}});
						this.getAppointmentsFromServer();
					}
					var gotCalendarEventCallback = function(inMatchingCalendarEvent) {
						// we may not find a matching calendar event
						if (inMatchingCalendarEvent) {
							inMatchingCalendarEvent.setParticipantStatus(clickedStatus);
							inMatchingCalendarEvent.saveToServer(function() {
								calendarEvent.deleteFromServer(cleanupAfterSave.bind(this));
							}.bind(this));
						}
						else {
							calendarEvent.deleteFromServer(cleanupAfterSave.bind(this));
						}
					}
					this.mRemoteCalendarCollection.findEquivalentToInboxCalendarEvent(calendarEvent, gotCalendarEventCallback.bind(this));
					return false;
				}.bind(this));
			}
			var li = Builder.node('li', {className:'inbox_event', id:'inbox_event_'+calendarEvent.uid}, [
				Builder.node('div', {className:'inbox_event_summary'}, (calendarEvent.summary() || "\u00A0")),
				Builder.node('div', {className:'inbox_event_organizer', style:(organizerString=="\u00A0"?'display:none':'')}, organizerString),
				Builder.node('div', {className:'inbox_event_dtstart'}, calendarEvent.startDate().formatDate('_Dates.DateFormats.MediumDateAndShortTime'.loc())),
				Builder.node('div', {className:'inbox_event_itip', style:(methodString=="\u00A0"?'display:none':'')}, methodString),
				Builder.node('div', {className:'inbox_event_buttons'}, buttons),
				Builder.node('div', {className:'inbox_event_footer'})
			]);
			li.observe('click', function(inEvent) {
				if (Position.within(li.down('div.inbox_event_buttons'), inEvent.pointerX(), inEvent.pointerY())) return;
				inEvent.stop();
				this.mDateNavigation.setSelectedDate(calendarEvent.startDate());
				// if we have alrady cached the event, show it immediately; otherwise, do a request first
				var showOverAppointment = this.mAppointments[calendarEvent.uid];
				if (showOverAppointment) {
					var showOverElement = li;
					if (showOverAppointment.displayNodes.length > 0 && showOverAppointment.displayNodes[0].element) {
						showOverElement = showOverAppointment.displayNodes[0].element;
					}
					this.showApptDialog(this.mAppointments[calendarEvent.uid], showOverElement);
				}
				else {
					this.mShowAppointmentUID = calendarEvent.uid;
				}
				// // if this was the last unresponded event in the list, hide the new notifications badge
				if (!this.hasNotifications()) this.hideNotificationsBadge();
			}.bindAsEventListener(this));
			insertAtBeginning(li, contentElm);
		}, this);
		if (this.hasNotifications()) {
			this.showNotificationsBadge();
			if (isFirstTime) this.showNotifications();
		}
		else {
			this.hideNotificationsBadge();
		}
		this.updateAvailableTimeShading();
	},
	hasNotifications: function() {
		return ($('calendar_sidebar_notifications').getElementsBySelector('li.inbox_event').length > 0);
	},
	showNotificationsBadge: function() {
		$('calendar_sidebar_toolbar_tab_notifications').addClassName('hasNotifications');
	},
	hideNotificationsBadge: function() {
		$('calendar_sidebar_toolbar_tab_notifications').removeClassName('hasNotifications');
	},
	snapSidebarSplitter: function() {
		if (!this.mNotificationsSplitView) return;
		this.mNotificationsSplitView.mMaximumHeight = $('calendar_splitter_parent').offsetHeight;
		if ($('calendar_grid_sidebar_splitter').visible()) {
			this.mNotificationsSplitView.mMaximumHeight -= $('calendar_grid_sidebar_splitter').offsetHeight + this.mCachedNiftyDateHeight||180;
		}
		else {
			this.mCachedNiftyDateHeight = $('calendar_grid_splitter_sibling').offsetHeight;
			this.mNotificationsSplitView.mMaximumHeight -= this.mCachedNiftyDateHeight;
		}
		$('calendar_collection_list').style.height = (this.mNotificationsSplitView.mMaximumHeight)+'px';
	},
	showDatePicker: function() {
		$('calendar_sidebar_notifications').hide();
		$('calendar_date_picker').show();
		$('calendar_grid_sidebar_splitter').hide();
		this.snapSidebarSplitter();
		this.setSelectedChild('calendar_sidebar_toolbar_tab_date');
	},
	showNotifications: function() {
		$('calendar_date_picker').hide();
		$('calendar_sidebar_notifications').show();
		$('calendar_grid_sidebar_splitter').show();
		this.snapSidebarSplitter();
		this.mNotificationsSplitView.mDuringCallback();
		this.setSelectedChild('calendar_sidebar_toolbar_tab_notifications');
	},
	setSelectedChild: function(inElementId) {
		var inElement = $(inElementId);
		if (!inElement) return;
		// Is there a currently selected adjacent element?
		var parent = inElement.up('ul');
		if (parent) {
			var selectedChild = parent.down('.selected');
			if (selectedChild) selectedChild.removeClassName('selected');
			var selectedParent = parent.down('.selectedparent');
			if (selectedParent) selectedParent.removeClassName('selectedparent');
		}
		// Set selected state using the passed element identifer.
		inElement.addClassName('selected');
		// Roll on CSS3 and styling parent nodes with the "<" selector.
		var inElementParent = inElement.parentNode;
		if (inElementParent && (inElementParent.nodeName.toLowerCase() == 'li'))
			inElementParent.addClassName('selectedparent');
	},
	startDrag: function() {
		Position.prepare();
		this.mGetApptsRequest = null;
		if (this.mTimer) {
			clearTimeout(this.mTimer);
			delete this.mTimer;
		}
		tooltipManager().hide(false);
		var timerFunction = function() { delete this.mDragTimer; };
		this.mDragTimer = setTimeout(timerFunction.bind(this), gDoubleClickDelay);
		tooltipManager().mEnabled = false;
	},
	endDrag: function(inDraw) {
		if (inDraw) this.drawVisibleAppointments(false);
		tooltipManager().mEnabled = true;
	},
	drawAppointment: function(inAppointment, inAnimate) {
		var isMonthView = Element.visible('calendar_grid_month_view');
		if (inAppointment.uid) {
			this.updateRectsForAppointment(inAppointment);
			for (var currentNodeIdx = 0; currentNodeIdx < inAppointment.displayNodes.length; currentNodeIdx++) {
				var currentNode = inAppointment.displayNodes[currentNodeIdx];
				// hide month banner events that overlap too far
				if (currentNode.rect && currentNode.overlaps && currentNode.overlaps.index >= this.mMonthBannerLimit && isMonthView) {
					delete currentNode.rect;
				}
				if (currentNode.rect) {
					// deal with overlaps
					if (currentNode.overlaps && (inAppointment.banner() || isMonthView)) { // banners: vertical
						currentNode.rect[1] += (currentNode.rect[3]+2) * currentNode.overlaps.index;
					}
					else if (currentNode.overlaps) { // other: horizontal
						currentNode.rect[0] += currentNode.rect[2] * currentNode.overlaps.index / currentNode.overlaps.total;
						currentNode.rect[2] = currentNode.rect[2] / currentNode.overlaps.total;
					}
					// get the existing div (if there is one)
					var apptDiv = currentNode.element;
					if (!apptDiv) {
						var readOnlyClassName = inAppointment.userCanWriteContent() ? '' : ' readonly';
						// build the DOM objects
						var contentLink = Builder.node('div', {
							className: (inAppointment.banner() ? 'calendar_banner_content' : 'calendar_appointment_content') + readOnlyClassName
						}, [Builder.node('div', {className:'calendar_appointment_attendeestatus calendar_appointment_attendeestatus_none'}), Builder.node('span')]);
						var resizeHandle = Builder.node('div', {
							className: (inAppointment.banner() ? 'calendar_banner_resizehandle' : 'calendar_appointment_resizehandle') + readOnlyClassName
						});
						var apptDivStyle = 'position:absolute';
						apptDiv = Builder.node(isMonthView && !inAppointment.banner() ? 'p' : 'div', {
							className: inAppointment.isNew() ? 'temporary_calendar_appointment' : 'calendar_appointment',
							style: apptDivStyle,
							id: 'appointment_div_' + inAppointment.uid + '_' + currentNodeIdx
						}, [contentLink, resizeHandle]);
						if (isMonthView && !inAppointment.banner()) {
							Element.addClassName(apptDiv, 'month_view_appointment');
						}
						else if (isMonthView) {
							apptDiv.addClassName('calendar_month_banner');
						}
						// set up event handlers
						apptDiv.onselectstart = invalidate;
						contentLink.onclick = invalidate;
						contentLink.onmousedown = invalidate;
						resizeHandle.onmousedown = invalidate;
						if (isMonthView || inAppointment.banner()) {
							Event.observe(contentLink, 'mousedown', this.handleMouseDownInBannerAppointment);
							Event.observe(resizeHandle, 'mousedown', this.handleMouseDownInBannerAppointment);
						}
						else {
							Event.observe(contentLink, 'mousedown', this.handleMouseDownInWeekTimedAppointment);
							Event.observe(resizeHandle, 'mousedown', this.handleMouseDownInWeekTimedAppointment);
						}
					}
					else if (!isMonthView) {
						if (inAppointment.banner() && (apptDiv.parentNode == $('calendar_grid_week_events_content'))) {
							Element.remove(apptDiv);
							$('calendar_grid_week_banners_content').appendChild(apptDiv);
							Event.stopObserving(apptDiv.firstChild, 'mousedown', this.handleMouseDownInWeekTimedAppointment);
							Event.stopObserving(apptDiv.lastChild, 'mousedown', this.handleMouseDownInWeekTimedAppointment);
							Event.observe(apptDiv.firstChild, 'mousedown', this.handleMouseDownInBannerAppointment);
							Event.observe(apptDiv.lastChild, 'mousedown', this.handleMouseDownInBannerAppointment);
						}
						else if ((!inAppointment.banner()) && (apptDiv.parentNode == $('calendar_grid_week_banners_content'))) {
							Element.remove(apptDiv);
							$('calendar_grid_week_events_content').appendChild(apptDiv);
							Event.stopObserving(apptDiv.firstChild, 'mousedown', this.handleMouseDownInBannerAppointment);
							Event.stopObserving(apptDiv.lastChild, 'mousedown', this.handleMouseDownInBannerAppointment);
							Event.observe(apptDiv.firstChild, 'mousedown', this.handleMouseDownInWeekTimedAppointment);
							Event.observe(apptDiv.lastChild, 'mousedown', this.handleMouseDownInWeekTimedAppointment);
						}
					}
					if (apptDiv && (!inAppointment.isNew()) && (!isMonthView || inAppointment.banner())) {
						apptDiv.setStyle({
							backgroundColor: (isMonthView ? inAppointment.color() : inAppointment.fillColor()),
							borderColor: inAppointment.color(),
							color: (isMonthView ? '#FFF' : inAppointment.textColor())
						});
						var overallAttendeeStatus = inAppointment.overallAttendeeStatus();
						var statusDiv = apptDiv.down('div.calendar_appointment_attendeestatus');
						if (overallAttendeeStatus && statusDiv && inAppointment.organizerIsPrincipal()) {
							overallAttendeeStatus = overallAttendeeStatus.toLowerCase().replace(/[^a-z]/, '');
							statusDiv.className = 'calendar_appointment_attendeestatus calendar_appointment_attendeestatus_'+overallAttendeeStatus;
						}
					}
					// add or remove calendar_appointment_needsaction class depending on the partial status
					if (inAppointment.participantStatus() == 'NEEDS-ACTION') {
						Element.addClassName(apptDiv, 'calendar_appointment_needsaction');
					}
					else {
						Element.removeClassName(apptDiv, 'calendar_appointment_needsaction');
					}
					// reposition (animating if applicable)
					if (!inAnimate) Element.addClassName(apptDiv, 'calendar_appointment_noanimate');
					apptDiv.style.left = currentNode.rect[0]+'px';
					apptDiv.style.top = currentNode.rect[1]+'px';
					// resize (animating if applicable)
					apptDiv.style.width = currentNode.rect[2]+'px';
					apptDiv.style.height = currentNode.rect[3]+'px';
					apptDiv.firstChild.style.height = (parseInt(apptDiv.style.height)-this.mResizeHandleHeight)+'px';
					// update appointment title and tooltip
					var summaryToDisplay = inAppointment.summary() || '-';
					if (isMonthView && (!inAppointment.banner())) {
						summaryToDisplay = '• '+summaryToDisplay;
						apptDiv.style.color = inAppointment.color();
					}
					apptDiv.firstChild.tooltipElement = 'appointment_tooltip';
					apptDiv.firstChild.tooltipValues = inAppointment;
					replaceElementContents(apptDiv.down('span'), summaryToDisplay);
					apptDiv.style.fontSize = (!inAppointment.banner() && !isMonthView && parseInt(apptDiv.style.height) <= this.mMinimumDisplayHeight ? '9px' : '');
					if (!inAppointment.banner() && !isMonthView && apptDiv.down('div.calendar_appointment_attendeestatus_none')) {
						Element.removeClassName(apptDiv, 'calendar_appointment_has_attendeestatus');
					}
					else {
						Element.addClassName(apptDiv, 'calendar_appointment_has_attendeestatus');
					}
					// add the element if it's not there
					if (!currentNode.element) {
						tooltipManager().observe(apptDiv.firstChild);
						if (inAnimate) apptDiv.style.opacity = '0';
						if (isMonthView) {
							$('calendar_grid_month_content').appendChild(apptDiv);
						}
						else {
							(inAppointment.banner() ? $('calendar_grid_week_banners_content') : $('calendar_grid_week_events_content')).appendChild(apptDiv);
						}
						currentNode.element = apptDiv;
						if (inAnimate) apptDiv.style.opacity = '';
					}
					// if we made this invisible during a drag, cure that
					currentNode.element.style.visibility = '';
				}
				// if there's no rect but there's an element, get rid of it
				else if (currentNode.element) {
					Event.stopObserving(currentNode.element.firstChild, 'mousedown', this.handleMouseDownInWeekTimedAppointment);
					Event.stopObserving(currentNode.element.lastChild, 'mousedown', this.handleMouseDownInWeekTimedAppointment);
					Event.stopObserving(currentNode.element.firstChild, 'mousedown', this.handleMouseDownInBannerAppointment);
					Event.stopObserving(currentNode.element.lastChild, 'mousedown', this.handleMouseDownInBannerAppointment);
					tooltipManager().stopObserving(currentNode.element.firstChild);
					currentNode.element.onselectstart = null;
					var deleteElement = function() {
						if (currentNode.element) {
							if (currentNode.element.parentNode) Element.remove(currentNode.element);
						}
						currentNode.element = null;
					}
					if (inAnimate) {
						if (!this.mCleanupCallbacks) this.mCleanupCallbacks = $A([]);
						currentNode.element.style.opacity = '0';
						this.mCleanupCallbacks.push(deleteElement.bind(this));
					}
					else {
						deleteElement();
					}
				}
			}
		}
	},
	removeAppointment: function(inAppointment, inAnimate) {
		if (this.mAppointments[inAppointment.uid]) delete this.mAppointments[inAppointment.uid];
		inAppointment.setVisible(false);
		this.drawAppointment(inAppointment, inAnimate);
	},
	drawVisibleAppointments: function(inAnimate) {
		this.updateCurrentTime();
		if (this.mAppointments) {
			// first, remove the old overlap calcs and banner counts
			this.mBannerCounts = new Object();
			var apptsToDeleteOverlaps = $H(this.mAppointments).values();
			for (var currentApptIdx = 0; currentApptIdx < apptsToDeleteOverlaps.length; currentApptIdx++) {
				var currentAppt = apptsToDeleteOverlaps[currentApptIdx];
				if (currentAppt.displayNodes) {
					for (var currentNodeIdx = 0; currentNodeIdx < currentAppt.displayNodes.length; currentNodeIdx++) {
						var currentNode = currentAppt.displayNodes[currentNodeIdx];
						if (currentNode.overlaps) delete currentNode.overlaps;
					}
				}
			}
			// fig'r out how many appts will fit in month grid
			this.mMonthBannerLimit = Math.floor((this.mMonthGridSize[1]-this.mMonthBannerHeight) / (this.mMonthBannerHeight+3)); // add extra wiggle room (3px)
			// create a by-day index of scanned nodes
			var scannedNodes = new Object();
			var isMonthView = Element.visible('calendar_grid_month_view');
			// look for current overlaps
			var apptsToCalculateOverlaps = $H(this.mAppointments).values();
			apptsToCalculateOverlaps.invoke('startDate', true); // cause the corrected start dates to get cached
			apptsToCalculateOverlaps = Array.sortArrayUsingKey(apptsToCalculateOverlaps, 'mCachedStartDate');
			for (var currentApptIdx = 0; currentApptIdx < apptsToCalculateOverlaps.length; currentApptIdx++) {
				var currentAppt = apptsToCalculateOverlaps[currentApptIdx];
				// update banner counts if needed
				if (currentAppt.startDate()) {
					var bannerStartDateInt = parseInt(currentAppt.startDate(true));
					var bannerEndDateInt = Math.max(parseInt(currentAppt.endDate(true)), bannerStartDateInt+1);
					for (var bannerCountIdx = bannerStartDateInt; bannerCountIdx < bannerEndDateInt; bannerCountIdx++) {
						if (!this.mBannerCounts[''+bannerCountIdx]) this.mBannerCounts[''+bannerCountIdx] = 0;
						this.mBannerCounts[''+bannerCountIdx]++;
					}
				}
				var sectionAxis = isMonthView || currentAppt.banner() ? 1 : 0;
				var overlapAxis = (sectionAxis + 1) % 2; // opposite axis
				// find the appointment's screen loc (will be nil if off-screen)
				this.updateRectsForAppointment(currentAppt);
				for (var currentNodeIdx = 0; currentNodeIdx < currentAppt.displayNodes.length; currentNodeIdx++) {
					var currentNode = currentAppt.displayNodes[currentNodeIdx];
					if (currentNode.rect) {
						var sectionName = sectionAxis+'_'+currentNode.rect[sectionAxis];
						if (!scannedNodes[sectionName]) scannedNodes[sectionName] = [];
						for (var otherNodeIdx = 0; otherNodeIdx < scannedNodes[sectionName].length; otherNodeIdx++) {
							var otherNode = scannedNodes[sectionName][otherNodeIdx];
							var highestBeginning = Math.max(
								otherNode.rect[overlapAxis],
								currentNode.rect[overlapAxis]
							);
							var lowestEnding = Math.min(
								(otherNode.rect[overlapAxis]+otherNode.rect[overlapAxis+2]),
								(currentNode.rect[overlapAxis]+currentNode.rect[overlapAxis+2])
							);
							if (highestBeginning < lowestEnding) {
								// lazily create other node's overlaps
								otherNode.overlaps = otherNode.overlaps || {index:0,total:1};
								// increase overlap total and update indices
								otherNode.overlaps.total++;
								currentNode.overlaps = {
									index: otherNode.overlaps.index+1,
									total: otherNode.overlaps.total
								};
							}
						}
						scannedNodes[sectionName].push(currentNode);
					}
				}
			}
			// if we're in month view, update the "more" links
			if (Element.visible('calendar_grid_month_view')) {
				$A(d.getElementsByClassName('calendar_grid_month_day')).each(function(elm) {
					if (elm.id) {
						var bc = this.mBannerCounts[elm.id.match(/\d{8}/)[0]];
						if (!bc) bc = 0;
						var a = elm.down('a');
						if (!a) { // lazily create
							a = Builder.node('a', {href:'#'});
							a.onclick = this.handleMonthMoreButtonClick;
							elm.appendChild(a);
						}
						replaceElementContents(a, String.format('_Calendar.Appointments.More'.loc(), {count:bc}));
						a.style.display = (bc > this.mMonthBannerLimit ? '' : 'none');
					}
				}.bind(this));
			}
			// finally, draw the appointments
			var apptsToDraw = $H(this.mAppointments).values();
			for (var currentApptIdx = 0; currentApptIdx < apptsToDraw.length; currentApptIdx++) {
				this.drawAppointment(apptsToDraw[currentApptIdx], inAnimate);
			}
			// run cleanup callbacks after CSS transition animations should be finished
			if (this.mCleanupCallbacks) {
				setTimeout(function() {
					if (!this.mCleanupCallbacks) return;
					this.mCleanupCallbacks.each(function(cb) {
						cb();
					});
					delete this.mCleanupCallbacks;
				}.bind(this), this.mCleanupTimeout);
			}
			setTimeout(function() {$$('div.calendar_appointment_noanimate').invoke('removeClassName', 'calendar_appointment_noanimate')}, 10);
		}
	},
	updateRectsForAppointment: function(inAppointment, inOptRecursion) { // also sets time string
		var isMonthView = Element.visible('calendar_grid_month_view');
		var recursion = inOptRecursion || 0;
		// get date and duration objects
		var startDate = inAppointment.startDate();
		var duration = inAppointment.duration();

		// If the duration is zero we must still display something, otherwise events will be missing.
		// For a banner we set the duration to 1 day, for a non-banner we set it to 15 minutes
		if (!getHoursForDuration(duration)) {
			if (inAppointment.banner()) {
				duration.days = 1;
			} else {
				duration.minutes = 15;
			}
		}

		// if this is the first time around, reset some values
		if (recursion == 0) {
			// lazily add array
			inAppointment.displayNodes = inAppointment.displayNodes || $A([]);
			// empty rects
			for (var currentNodeIdx = 0; currentNodeIdx < inAppointment.displayNodes.length; currentNodeIdx++) {
				inAppointment.displayNodes[currentNodeIdx].rect = null;
			}
		}
		// bail if we can't find date or if appointment is invisible
		if (!startDate || !inAppointment.visible()) return false;
		// bail if we've declined the event
		if (inAppointment.participantStatus() == 'DECLINED') return false;
		// bail if this is an inbox cancellation
		if (inAppointment.mParentCalendarFile.iTIPMethod() == 'CANCEL') return false;
		// bail if this is a banner event and we're in day view
		if (this.mDayMode && inAppointment.banner() && recursion > 0) return false;
		// calculate the time string
		if (recursion == 0) inAppointment.time_string = getTimeRangeDisplayString(startDate, duration);
		// branch for banner or normal appointments
		if (inAppointment.banner() || isMonthView) {
			var days = duration.days || 0;
			for (var i = 0; i < recursion; i++) {
				startDate.setDate(startDate.getDate() + inAppointment.displayNodes[i].days);
				days -= inAppointment.displayNodes[i].days;
			}
			// find the maximum number of days we can show for the remainder of this week
			var maxDays = (7-(startDate.getDay()-this.mDateNavigation.mStartWeekday));
			// fix overflows (from non-Sunday start weekdays)
			if (maxDays > 7) maxDays %= 7;
			// can be no more than the maximum
			days = Math.min(days, maxDays); /* ##5389023 */
			if (recursion == 0 && (!inAppointment.banner())) days = Math.max(days, 1);
			// bail if isn't visible
			if (days <= 0) return false;
			// 6956060
			if (this.mDayMode && inAppointment.banner()) {
				var today = this.mDateNavigation.mSelectedDate;
				var endDate = new Date(startDate.getTime());
				endDate.setDate(endDate.getDate() + duration.days);
				// banner event starts after today
				if ((today - startDate) < 0) return false;
				// banner event ends before today
				if ((today - endDate) > 0) return false;
			}
			var rect = null;
			var prefix = isMonthView ? 'calendar_grid_month_day_' : 'calendar_grid_week_banner_slot_';
			var selectedDateElement = $('calendar_grid_week_banner_slot_'+parseInt(dateObjToISO8601(this.mDateNavigation.mSelectedDate)));
			var startElement = (this.mDayMode ? selectedDateElement : $(prefix+parseInt(dateObjToISO8601(startDate))));
			var endDate = getEndDateUsingDuration(startDate, {days:days-1});
			var endElement = (this.mDayMode ? selectedDateElement : $(prefix+parseInt(dateObjToISO8601(endDate))));
			if (startElement && endElement) {
				var startOffsetElement = browser().isIE ? (isMonthView ? startElement.parentNode.parentNode : startElement.parentNode) : startElement;
				var endOffsetElement = browser().isIE ? (isMonthView ? endElement.parentNode.parentNode : endElement.parentNode) : endElement;
				// copy element offsets to rect (width is guessed and changed below)
				rect = [startOffsetElement.offsetLeft, startElement.offsetTop, 50, this[isMonthView?'mMonthBannerHeight':'mBannerHeight']];
				// offset top to account for month view label
				if (isMonthView) rect[1] += this.mMonthBannerHeight+2;
				// calculate width
				rect[2] = endOffsetElement.offsetLeft + endElement.offsetWidth - rect[0] + this.mWeekEventElementOffsets[2];
				if (this.mDayMode) rect[2]--;
			}
			// make sure a node exists at this recursion index
			if (inAppointment.displayNodes.length <= recursion) inAppointment.displayNodes[recursion] = new Object();
			// populate the rect information
			Object.extend(inAppointment.displayNodes[recursion], {days:days, rect:rect});
		}
		else { // not an all-day appt
			// turn the duration into hours
			var hours = duration.hours || 0;
			if (duration.days) hours += (duration.days*24);
			if (duration.minutes) hours += (duration.minutes/60);
			for (var i = 0; i < recursion; i++) {
				startDate.setDate(startDate.getDate()+1);
				startDate.setHours(0);
				startDate.setMinutes(0);
				startDate.setSeconds(0);
				hours -= inAppointment.displayNodes[i].hours;
			}
			hours = Math.min(hours, 24-startDate.getHours()-(startDate.getMinutes()/60));
			// bail if it's not this week
			if (hours <= 0) return false;
			var rect = null;
			if (compareDateWeeks(startDate, this.mDateNavigation.mSelectedDate, this.mDateNavigation.mStartWeekday) && (!this.mDayMode || (parseInt(dateObjToISO8601(startDate, false)) == parseInt(dateObjToISO8601(this.mDateNavigation.mSelectedDate, false, false))))) {
				// get rect position
				var columnNum = dateToColummNumber(startDate, this.mDateNavigation.mStartWeekday);
				var cloneElm = $$('#calendar_grid_week_events_columns .calendar_grid_week_column_' + columnNum + ' .calendar_grid_week_row_' + startDate.getHours())[0];
				hours = Math.max(hours, 0.25);
				var rect = [cloneElm.offsetLeft, cloneElm.offsetTop+((startDate.getMinutes()/60)*this.mWeekGridSize[1]), cloneElm.offsetWidth, Math.max(hours*this.mWeekGridSize[1], this.mMinimumDisplayHeight)];
				this.mWeekEventElementOffsets.each(function(offset, i) {
					rect[i] += offset;
				});
			}
			// make sure a node exists at this recursion index
			if (inAppointment.displayNodes.length <= recursion) inAppointment.displayNodes[recursion] = new Object();
			// populate the rect information
			Object.extend(inAppointment.displayNodes[recursion], {hours:hours, rect:rect});
		}
		// recurse
		this.updateRectsForAppointment(inAppointment, ++recursion);
		return true;
	},
	updateAvailableTimeShading: function() {
		var availability = this.mRemoteCalendarCollection && this.mRemoteCalendarCollection.mAvailability;
		if (availability) {
			// update the morning hours
			var startDate = availability.startDate();
			var morningHeight = ( startDate.getHours() + ( startDate.getMinutes() / 60 ) ) * this.mWeekGridSize[1];
			$('calendar_grid_week_unavailable_morning').style.height = morningHeight+'px';
			// update the evening hours
			var endDate = availability.endDate();
			var eveningStart = ( endDate.getHours() + ( endDate.getMinutes() / 60 ) ) * this.mWeekGridSize[1];
			$('calendar_grid_week_unavailable_evening').style.top = eveningStart+'px';
			$('calendar_grid_week_unavailable_evening').setStyle({
				top: eveningStart+'px',
				height: (Element.getHeight('calendar_grid_week_events_content') - eveningStart)+'px'
			});
		}
		$$('#calendar_grid_week_events .calendar_grid_week_unavailable').invoke(availability?'show':'hide');
	}
}


var EventRecurrenceDialogManager = Class.createWithSharedInstance('eventRecurrenceDialogManager');
EventRecurrenceDialogManager.prototype = {
	initialize: function() {
		if (!$('module_calendars')) return invalidate;
		globalNotificationCenter().subscribe('WILL_SAVE_CALENDAR_EVENT', this.handleAppointmentSave.bind(this));
		globalNotificationCenter().subscribe('WILL_DELETE_CALENDAR_EVENT', this.handleAppointmentDelete.bind(this));
	},
	showDialogForAppointment: function(inDialog, inAppointment, inAppointmentAction, inOptOKCallback) {
		// This method assumes that the dialog has been drawn already
		this.mCurrentAppointment = inAppointment;
		this.mCurrentAppointmentAction = inAppointmentAction;
		inAppointment.setRecurrenceChangeAction(CalendarEvent.RecurrenceChangeAction.Postpone);
		dialogManager().show(inDialog, this.handleCancel.bind(this), inOptOKCallback || this.handleOnlyThisClick.bind(this));
	},
	handleCancel: function() {
		this.mCurrentAppointment.revertToSaved();
		calendarViewController().drawVisibleAppointments();
		calendarViewController().getAppointmentsFromServer();
	},
	handleAllEventsClick: function() {
		this.mCurrentAppointment.setRecurrenceChangeAction(CalendarEvent.RecurrenceChangeAction.AllFuture);
		dialogManager().showProgressMessage(this.mCurrentAppointmentAction == 'deleteFromServer' ? '_Calendar.Dialogs.Delete.Progress'.loc() : '_Calendar.Dialogs.Updating.Progress'.loc(), false, null, true);
		calendarViewController()[this.mCurrentAppointmentAction](this.mCurrentAppointment);
	},
	handleOnlyThisClick: function() {
		this.mCurrentAppointment.setRecurrenceChangeAction(CalendarEvent.RecurrenceChangeAction.OnlyThis);
		calendarViewController()[this.mCurrentAppointmentAction](this.mCurrentAppointment);
	},
	showDeleteFirstDialogForAppointment: function(inAppointment) {
		// lazily draw the dialog
		if (!$('appointment_recur_warn_delete_first_dialog')) {
			dialogManager().drawDialog('appointment_recur_warn_delete_first_dialog', [
				'_Calendar.Dialogs.DeleteFirst.Description'.loc()
			], '_Calendar.Dialogs.DeleteFirst.DeleteOnlyThis'.loc(), null, '_Calendar.Dialogs.DeleteFirst.Title'.loc());
			insertAfter(Builder.node('input', {
				type: 'button',
				id: 'appointment_recur_warn_delete_first_dialog_allappts',
				value: '_Calendar.Dialogs.DeleteFirst.DeleteAllFuture'.loc()
			}), 'appointment_recur_warn_delete_first_dialog_cancel');
			Event.observe('appointment_recur_warn_delete_first_dialog_allappts', 'click', this.handleAllEventsClick.bindAsEventListener(this));
		}
		this.showDialogForAppointment('appointment_recur_warn_delete_first_dialog', inAppointment, 'deleteAppointmentFromServer');
	},
	showDeleteNthDialogForAppointment: function(inAppointment) {
		if (!$('appointment_recur_warn_delete_nth_dialog')) {
			dialogManager().drawDialog('appointment_recur_warn_delete_nth_dialog', [
				'_Calendar.Dialogs.DeleteNth.Description'.loc()
			], '_Calendar.Dialogs.DeleteNth.DeleteOnlyThis'.loc(), null, '_Calendar.Dialogs.DeleteNth.Title'.loc());
			insertAfter(Builder.node('input', {
				type: 'button',
				id: 'appointment_recur_warn_delete_nth_dialog_allapts',
				value: '_Calendar.Dialogs.DeleteNth.DeleteAllFuture'.loc()
			}), 'appointment_recur_warn_delete_nth_dialog_cancel')
			Event.observe('appointment_recur_warn_delete_nth_dialog_allapts', 'click', this.handleAllEventsClick.bindAsEventListener(this));
		}
		this.showDialogForAppointment('appointment_recur_warn_delete_nth_dialog', inAppointment, 'deleteAppointmentFromServer');
	},
	showUpdateRecurrenceDialogForAppointment: function(inAppointment) {
		if (!$('appointment_recur_warn_recur_dialog')) {
			dialogManager().drawDialog('appointment_recur_warn_recur_dialog', [
				'_Calendar.Dialogs.UpdateRecurrence.Description'.loc()
			], '_Calendar.Dialogs.UpdateRecurrence.Change'.loc(), null, '_Calendar.Dialogs.UpdateRecurrence.Title'.loc());
		}
		this.showDialogForAppointment('appointment_recur_warn_recur_dialog', inAppointment, 'updateAppointmentEntry', this.handleAllEventsClick.bind(this));
	},
	showUpdateFirstDialogForAppointment: function(inAppointment) {
		if (!$('appointment_recur_warn_change_first_dialog')) {
			dialogManager().drawDialog('appointment_recur_warn_change_first_dialog', [
				'_Calendar.Dialogs.ChangeFirst.Description'.loc()
			], '_Calendar.Dialogs.ChangeFirst.OnlyThis'.loc(), null, '_Calendar.Dialogs.ChangeFirst.Title'.loc());
			insertAfter(Builder.node('input', {
				type: 'button',
				id: 'appointment_recur_warn_change_first_dialog_allappts',
				value: '_Calendar.Dialogs.ChangeFirst.All'.loc()
			}), 'appointment_recur_warn_change_first_dialog_cancel');
			Event.observe('appointment_recur_warn_change_first_dialog_allappts', 'click', this.handleAllEventsClick.bindAsEventListener(this));
		}
		this.showDialogForAppointment('appointment_recur_warn_change_first_dialog', inAppointment, 'updateAppointmentEntry');
	},
	showUpdateNthDialogForAppointment: function(inAppointment) {
		if (!$('appointment_recur_warn_change_nth_dialog')) {
			dialogManager().drawDialog('appointment_recur_warn_change_nth_dialog', [
				'_Calendar.Dialogs.ChangeNth.Description'.loc()
			], '_Calendar.Dialogs.ChangeNth.OnlyThis'.loc(), null, '_Calendar.Dialogs.ChangeNth.Title'.loc());
			insertAfter(Builder.node('input', {
				type: 'button',
				id: 'appointment_recur_warn_change_nth_dialog_all',
				value: '_Calendar.Dialogs.ChangeNth.All'.loc()
			}), 'appointment_recur_warn_change_nth_dialog_cancel');
			Event.observe('appointment_recur_warn_change_nth_dialog_all', 'click', this.handleAllEventsClick.bindAsEventListener(this));
		}
		this.showDialogForAppointment('appointment_recur_warn_change_nth_dialog', inAppointment, 'updateAppointmentEntry');
	},
	handleAppointmentSave: function(inMessage, inObject, inUserInfo) {
		if (inObject.recurrenceChangeAction() != CalendarEvent.RecurrenceChangeAction.Unknown) return false;
		if (inObject.recurrenceType() != CalendarEvent.RecurrenceType.None && inObject.updateStack().include('RRULE')) {
			if (!inObject.isNew() && !inObject.recurrenceIsNew()) {
				this.showUpdateRecurrenceDialogForAppointment(inObject);
			}
		}
		else if (inObject.recurrenceType() == CalendarEvent.RecurrenceType.First) {
			this.showUpdateFirstDialogForAppointment(inObject);
		}
		else if (inObject.recurrenceType() == CalendarEvent.RecurrenceType.Nth) {
			this.showUpdateNthDialogForAppointment(inObject);
		}
	},
	handleAppointmentDelete: function(inMessage, inObject, inUserInfo) {
		if (inObject.recurrenceChangeAction() != CalendarEvent.RecurrenceChangeAction.Unknown) return false;
		if (inObject.recurrenceType() == CalendarEvent.RecurrenceType.First) {
			this.showDeleteFirstDialogForAppointment(inObject);
		}
		else if (inObject.recurrenceType() == CalendarEvent.RecurrenceType.Nth) {
			this.showDeleteNthDialogForAppointment(inObject);
		}
	}
}
;
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





;

