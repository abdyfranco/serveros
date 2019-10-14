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
