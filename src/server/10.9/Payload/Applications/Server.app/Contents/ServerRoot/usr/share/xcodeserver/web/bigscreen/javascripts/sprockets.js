/** 
* Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
* 
* IMPORTANT NOTE: This file is licensed only for use on Apple-branded
* computers and is subject to the terms and conditions of the Apple Software
* License Agreement accompanying the package this file is a part of.
* You may not port this file to another platform without Apple's written consent.
* 
* IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
* of the Apple Software and is subject to the terms and conditions of the Apple
* Software License Agreement accompanying the package this file is part of.
**/

// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

var CC_BS_DATA_SOURCE_ACTION_INSERT = 'insert';
var CC_BS_DATA_SOURCE_ACTION_UPDATE = 'update';
var CC_BS_DATA_SOURCE_ACTION_IGNORE = 'unchanged';
var CC_BS_DATA_SOURCE_ACTION_REMOVE = 'remove';

var CC_BS_SORT_ORDER_PREFERENCE_KEY = 'com.apple.XcodeServer.BigScreen.SortOrder';
var CC_BS_SORT_ORDER_IMPORTANCE = 'importance';
var CC_BS_SORT_ORDER_ALPHABETICAL = 'alpha';
var CC_BS_SORT_ORDER_FRESHNESS = 'freshness';
var CC_BS_SORT_ORDER_UNSORTED = 'unsorted';
var CC_BS_SORT_ORDER_CHEAPEST = CC_BS_SORT_ORDER_UNSORTED;

var CC_BS_BOT_SORT_PRECEDENCE = {
	'fail': 0,
	'error': 1,
	'test-fail': 2,
	'warning': 3,
	'issue': 4,
	'success': 5,
	'new': 6
};
var CC_BS_BOT_STATUS_ADDITIONAL_DELAYS = {
	'fail': 5000,
	'error': 5000,
	'test-fail': 5000,
	'warning': 3000,
	'issue': 3000,
	'success': 1000,
	'new': 1000
};

var CC_BS_BOT_STATUS_DEFAULT_DELAY = 10000;
var CC_BS_BOT_STATUS_BASE_DELAY = 7000;

var CC_BS_TIMESTAMP_NOTIFICATION = 'com.apple.XcodeServer.BigScreen.Timestamps';
var CC_BS_RESIZE_NOTIFICATION = 'com.apple.XcodeServer.BigScreen.Resize';
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.


CC.XcodeServer.BigScreenDataSourceAction = Class.create({
	mAction: null,
	mOldIndex: -1,
	mNewIndex: -1
});

CC.XcodeServer.BigScreenDataSource = Class.create({
	// duplicate(...) should work for all subclasses as long as any state information
	// is preserved in variables prefixed with "m"
	duplicate: function() {
		var o = new this.constructor();
		for (var prop in this)
		{
			if (prop[0] == 'm' && this.hasOwnProperty(prop))
				o[prop] = this[prop];
		}
		
		return o;
	},
	// controller API
	updateItem: function(inItem, inOptDetermineNewPosition) {
		logger().error('Unimplemented data source method called');
		return null;
	},
	removeItem: function(inItem) {
		logger().error('Unimplemented data source method called');
		// do nothing
	},
	// view API
	numberOfItems: function() {
		logger().error('Unimplemented data source method called');
		return 0;
	},
	itemAtIndex: function(inIdx) {
		logger().error('Unimplemented data source method called');
		return null;
	},
	iterateItems: function(inCallback) {
		logger().error('Unimplemented data source method called');
		this.iterateItemsWithOrder(CC_BS_SORT_ORDER_CHEAPEST, inCallback);
	},
	iterateItemsWithOrder: function(inSortOrder, inCallback) {
		logger().error('Unimplemented data source method called');
		// do nothing
	},
	// no-ops while I debug the proxy
	freeze: function() {},
	unfreeze: function() {}
});

CC.XcodeServer.BigScreenBotRunDataSource = Class.create(CC.XcodeServer.BigScreenDataSource, {
	mBotRuns: null,
	mSortedOrder: CC_BS_SORT_ORDER_UNSORTED,
	mDesiredSortOrder: CC_BS_SORT_ORDER_ALPHABETICAL,
	mPreservedProperties: ['sbStatus', 'sbRunning'],
	mConditionallyPreservedProperties: ['startTime', 'endTime', 'extendedAttributes', 'integration', 'devices', 'commits'],
	initialize: function() {
		this.mBotRuns = [];
		this.mDesiredSortOrder = window.localStorage.getItem(CC_BS_SORT_ORDER_PREFERENCE_KEY) || this.mDesiredSortOrder;
	},
	_relevanceSorter: function(a, b) {
		if (a.sbStatus == b.sbStatus)
		{
			var aSortTime = a.endTime || a.startTime;
			var bSortTime = b.endTime || b.startTime;
			
			if (aSortTime && bSortTime && aSortTime.getTime() != bSortTime.getTime())
				return bSortTime.getTime() - aSortTime.getTime();
			else
			{
				if (a.extendedAttributes.botSnapshot.longName.toLowerCase() < b.extendedAttributes.botSnapshot.longName.toLowerCase())
					return -1;
				else if (a.extendedAttributes.botSnapshot.longName.toLowerCase() > b.extendedAttributes.botSnapshot.longName.toLowerCase())
					return 1;
				return 0;
			}
		}
		else
			return CC_BS_BOT_SORT_PRECEDENCE[a.sbStatus] - CC_BS_BOT_SORT_PRECEDENCE[b.sbStatus];
	},
	_nameSorter: function(a, b) {
		if (a.extendedAttributes.botSnapshot.longName.toLowerCase() < b.extendedAttributes.botSnapshot.longName.toLowerCase())
			return -1;
		else if (a.extendedAttributes.botSnapshot.longName.toLowerCase() > b.extendedAttributes.botSnapshot.longName.toLowerCase())
			return 1;
		else
		{
			if (a.ownerGUID < b.ownerGUID)
				return -1;
			else if (a.ownerGUID > b.ownerGUID)
				return 1;
			return 0;
		}
	},
	_freshnessSorter: function(a, b) {
		var aSortTime = a.endTime || a.startTime;
		var bSortTime = b.endTime || b.startTime;
		
		if (aSortTime && bSortTime && aSortTime.getTime() != bSortTime.getTime())
			return bSortTime.getTime() - aSortTime.getTime();
		else
		{
			if (a.extendedAttributes.botSnapshot.longName.toLowerCase() < b.extendedAttributes.botSnapshot.longName.toLowerCase())
				return -1;
			else if (a.extendedAttributes.botSnapshot.longName.toLowerCase() > b.extendedAttributes.botSnapshot.longName.toLowerCase())
				return 1;
			else
			{
				if (a.ownerGUID < b.ownerGUID)
					return -1;
				else if (a.ownerGUID > b.ownerGUID)
					return 1;
				return 0;
			}
		}
	},
	_sorterForSortOrder: function(inOrder) {
		switch (this.mDesiredSortOrder)
		{
			case CC_BS_SORT_ORDER_IMPORTANCE:
				return this._relevanceSorter;
			
			case CC_BS_SORT_ORDER_ALPHABETICAL:
				return this._nameSorter;
				
			case CC_BS_SORT_ORDER_FRESHNESS:
				return this._freshnessSorter;
		}
		
		return function(a, b) { return 0; };
	},
	validateSortOrder: function() {
		if (this.mSortedOrder != this.mDesiredSortOrder)
		{
			if (this.mDesiredSortOrder == CC_BS_SORT_ORDER_UNSORTED)
				return;
			
			if (this.mDesiredSortOrder == CC_BS_SORT_ORDER_IMPORTANCE ||
				this.mDesiredSortOrder == CC_BS_SORT_ORDER_ALPHABETICAL ||
				this.mDesiredSortOrder == CC_BS_SORT_ORDER_FRESHNESS)
			{
				this.mBotRuns.sort(this._sorterForSortOrder(this.mDesiredSortOrder));
				this.mSortedOrder = this.mDesiredSortOrder;
			}
		}
	},
	// controller API
	updateItem: function(inBotRun, inOptDetermineNewPosition, isRunning) {
		var result = new CC.XcodeServer.BigScreenDataSourceAction();
		inOptDetermineNewPosition = (inOptDetermineNewPosition === undefined) ? true : inOptDetermineNewPosition;
		
		// check if the bot run's bot is already in the list
		for (var i = 0; i < this.mBotRuns.length; i++)
		{
			if (this.mBotRuns[i].ownerGUID == inBotRun.ownerGUID)
			{
				// if this is an existing run, and we're already terminal, bail now
				if (this.mBotRuns[i].guid == inBotRun.guid && CC.XcodeServer.isTerminalBotStatus(this.mBotRuns[i].status))
				{
					result.mAction = CC_BS_DATA_SOURCE_ACTION_IGNORE;
					result.mOldIndex = i;
					return result;
				}
				
				// inherit any annotated properties
				for (var j = 0; j < this.mPreservedProperties.length; j++)
					inBotRun[this.mPreservedProperties[j]] = this.mBotRuns[i][this.mPreservedProperties[j]];
				
				// we don't want to change sort order here, so if it's not terminal, also steal start/end time and status
				if (!CC.XcodeServer.isTerminalBotStatus(inBotRun.status))
				{
					// inherit any annotated properties
					for (var j = 0; j < this.mConditionallyPreservedProperties.length; j++)
						inBotRun[this.mConditionallyPreservedProperties[j]] = this.mBotRuns[i][this.mConditionallyPreservedProperties[j]];
				}
			
				this.mBotRuns[i] = inBotRun;
				result.mAction = CC_BS_DATA_SOURCE_ACTION_UPDATE;
				result.mOldIndex = i;
				break;
			}
		}
		
		// if it wasn't in the list, add it
		if (result.mOldIndex == -1)
		{
			this.mBotRuns.push(inBotRun);
			result.mAction = CC_BS_DATA_SOURCE_ACTION_INSERT;
		}
		
		// annotate the bot run appropriately
		if (!inBotRun.hasOwnProperty('expandedStatusInfo'))
			inBotRun.expandedStatusInfo = CC.XcodeServer.errorsAnalysisIssuesWarningsTestsDictForBotRun(inBotRun);
		
		if (inBotRun.sbRunning)
			result.mWasRunning = true;  // special property for this data source
		
		if (CC.XcodeServer.isTerminalBotStatus(inBotRun.status))
		{
			inBotRun.sbStatus = CC.XcodeServer.normalizedStatusClassForStatus(inBotRun.status, inBotRun.subStatus);
			inBotRun.sbRunning = false;
			
			if (isRunning) {
				inBotRun.sbRunning = true;
			}
		}
		else
		{
			if (!inBotRun.hasOwnProperty('sbStatus'))
				inBotRun.sbStatus = 'new';
			inBotRun.sbRunning = !!CC.XcodeServer.isRunningBotStatus(inBotRun.status);
		}
		
		// mark the list as potentially unsorted
		this.mSortedOrder = CC_BS_SORT_ORDER_UNSORTED;
		
		// resort and determine the new position if necessary
		if (inOptDetermineNewPosition)
		{
			this.validateSortOrder();
			result.mNewIndex = this.mBotRuns.indexOf(inBotRun);
		}
		
		return result;
	},
	removeItem: function(inBotRun) {
		var result = new CC.XcodeServer.BigScreenDataSourceAction();
		
		// find the corresponding bot run
		for (var i = 0; i < this.mBotRuns.length; i++)
		{
			if (this.mBotRuns[i].ownerGUID == inBotRun.ownerGUID)
			{
				this.mBotRuns.splice(i, 1);
				result.mAction = CC_BS_DATA_SOURCE_ACTION_REMOVE;
				result.mOldIndex = i;
				return result;
			}
		}
		
		result.mAction = CC_BS_DATA_SOURCE_ACTION_IGNORE;
		return result;
	},
	hasTerminalStatusForRun: function(inBotRun) {
		// check if the bot run's bot is already in the list
		for (var i = 0; i < this.mBotRuns.length; i++)
		{
			if (this.mBotRuns[i].guid == inBotRun.guid)
			{
				if (CC.XcodeServer.isTerminalBotStatus(this.mBotRuns[i].status))
					return true;
				else
					return false;
			}
		}
		
		return false;
	},
	// view API
	setSortOrder: function(inSortOrder) {
		this.mDesiredSortOrder = inSortOrder;
	},
	numberOfItems: function() {
		return this.mBotRuns.length;
	},
	itemAtIndex: function(inIdx) {
		this.validateSortOrder();
		return this.mBotRuns[inIdx];
	},
	iterateItems: function(inCallback) {
		this.iterateItemsWithOrder(this.mDesiredSortOrder, inCallback);
	},
	iterateItemsWithOrder: function(inSortOrder, inCallback) {
		// prepare a sorted list
		var runs = null;
		if (inSortOrder == CC_BS_SORT_ORDER_CHEAPEST || inSortOrder == this.mSortedOrder)
			runs = this.mBotRuns;
		else if (inSortOrder == this.mDesiredSortOrder)
		{
			this.validateSortOrder();
			runs = this.mBotRuns;
		}
		else
		{
			runs = this.mBotRuns.slice(0);
			runs.sort(this._sorterForSortOrder(inSortOrder));
		}
		
		// iterate through it
		for (var i = 0; i < runs.length; i++)
			inCallback.call(runs[i], runs[i], i);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.XcodeServer.BigScreenControlPanelView = Class.create(CC.Mvc.View, {
	mClassName: 'xc-big-screen-control-panel',
	render: function() {
		return Builder.node('div', [
			Builder.node('div', {className: 'titlebar'}, [
				Builder.node('div', {className: 'leftControls'}, [
					Builder.node('div', {className: 'button exit'}, [
						Builder.node('div', {className: 'icon'})
					])
				]),
				Builder.node('div', {className: 'title'}, document.domain),
				Builder.node('div', {className: 'rightControls'}, [
					Builder.node('div', {className: 'button settings', style: 'display: none'}, [ // TODO: reenable at some point
						Builder.node('div', {className: 'icon'})
					]),
					Builder.node('div', {className: 'button fullscreen'}, [
						Builder.node('div', {className: 'icon'})
					])
				])
			]),
			Builder.node('div', {className: 'shield'}),
			Builder.node('div', {className: 'settingsPanel'}, [
				Builder.node('h1', {className: 'title'}, '_XC.BigScreen.Settings.Label'.loc()),
				Builder.node('div', {className: 'settingGroup sort'}, [
					Builder.node('div', {className: 'label'}, '_XC.BigScreen.Settings.SortBy.Label'.loc()),
					Builder.node('div', {className: 'options'}, [
						Builder.node('div', {className: 'radioButton importance', 'data-value': 'importance'}, [
							Builder.node('div', {className: 'circle'}, [
								Builder.node('div', {className: 'dot'})
							]),
							Builder.node('label', '_XC.BigScreen.Settings.SortBy.Importance.Label'.loc())
						]),
						Builder.node('div', {className: 'radioButton alpha', 'data-value': 'alpha'}, [
							Builder.node('div', {className: 'circle'}, [
								Builder.node('div', {className: 'dot'})
							]),
							Builder.node('label', '_XC.BigScreen.Settings.SortBy.Name.Label'.loc())
						]),
						Builder.node('div', {className: 'radioButton freshness', 'data-value': 'freshness'}, [
							Builder.node('div', {className: 'circle'}, [
								Builder.node('div', {className: 'dot'})
							]),
							Builder.node('label', '_XC.BigScreen.Settings.SortBy.Time.Label'.loc())
						])
					])
				]),
				Builder.node('div', {className: 'settingGroup size'}, [
					Builder.node('div', {className: 'label'}, '_XC.BigScreen.Settings.DisplaySize.Label'.loc()),
					Builder.node('div', {className: 'options'}, [
						Builder.node('div', {className: 'radioButton auto', 'data-value': 'auto'}, [
							Builder.node('div', {className: 'circle'}, [
								Builder.node('div', {className: 'dot'})
							]),
							Builder.node('label', '_XC.BigScreen.Settings.DisplaySize.Auto.Label'.loc())
						]),
						Builder.node('div', {className: 'radioButton full', 'data-value': 'full'}, [
							Builder.node('div', {className: 'circle'}, [
								Builder.node('div', {className: 'dot'})
							]),
							Builder.node('label', '_XC.BigScreen.Settings.DisplaySize.Full.Label'.loc())
						]),
						Builder.node('div', {className: 'radioButton half', 'data-value': 'half'}, [
							Builder.node('div', {className: 'circle'}, [
								Builder.node('div', {className: 'dot'})
							]),
							Builder.node('label', '_XC.BigScreen.Settings.DisplaySize.Half.Label'.loc())
						]),
						Builder.node('div', {className: 'radioButton mini', 'data-value': 'mini'}, [
							Builder.node('div', {className: 'circle'}, [
								Builder.node('div', {className: 'dot'})
							]),
							Builder.node('label', '_XC.BigScreen.Settings.DisplaySize.Mini.Label'.loc())
						])
					])
				]),
				Builder.node('div', {className: 'controls'}, [
					Builder.node('div', {className: 'button cancel'}, '_XC.BigScreen.Settings.Button.Cancel'.loc()),
					Builder.node('div', {className: 'button save'}, '_XC.BigScreen.Settings.Button.Save'.loc())
				])
			]),
			Builder.node('div', {className: 'failurePanel'}, [
				Builder.node('h1', {className: 'title'}, '_XC.BigScreen.Settings.Failure.Title.Default'.loc()),
				Builder.node('div', {className: 'message'}, '_XC.BigScreen.Settings.Failure.DefaultMessage'.loc()),
				Builder.node('div', {className: 'controls'}, [
					Builder.node('div', {className: 'button reload'}, '_XC.BigScreen.Settings.Button.Reload'.loc())
				])
			])
		]);
	},
	initialize: function($super) {
		$super();
		this.forceRender();
		
		this.mParentElement.down('.titlebar .button.settings').addEventListener('click', this.showSettings.bind(this), false);
		this.mParentElement.down('.titlebar .button.exit').addEventListener('click', this.exitBigScreen.bind(this), false);
		this.mParentElement.down('.titlebar .button.fullscreen').addEventListener('click', this.toggleFullscreen.bind(this), false);
		
		this.mParentElement.down('.settingsPanel .button.cancel').addEventListener('click', this.cancelSettings.bind(this), false);
		this.mParentElement.down('.settingsPanel .button.save').addEventListener('click', this.saveSettings.bind(this), false);
		
		this.mParentElement.down('.failurePanel .button.reload').addEventListener('click', this.reloadBigScreen.bind(this), false);
		
		this.mParentElement.select('.radioButton').forEach(function(el){
			el.addEventListener('click', this.selectRadioButton.bind(this), false);
		}.bind(this));
		
		document.addEventListener('webkitfullscreenchange', this.handleFullScreenChange.bind(this), false);
	},
	toggleFullscreen: function() {
		var el = this.mSuperview.mParentElement;
		if (!document.webkitFullscreenElement)
		{
			el.webkitRequestFullscreen();
			document.body.addClassName('fullscreen');
		}
		else
		{
			document.webkitCancelFullScreen();
			document.body.removeClassName('fullscreen');
		}
	},
	handleFullScreenChange: function(e) {
		if (!document.webkitFullscreenElement)
			document.body.removeClassName('fullscreen');
		else
			document.body.addClassName('fullscreen');
	},
	exitBigScreen: function() {
		window.location.href = '/xcode/bots'; // TODO: this is definitely not the best way to do this
	},
	reloadBigScreen: function() {
		window.location.reload();
	},
	validateSettings: function() {
		this.mParentElement.select('.radioButton.selected').forEach(function(el){
			el.removeClassName('selected');
		});
		
		var sortClass = window.localStorage.getItem(CC_BS_SORT_ORDER_PREFERENCE_KEY) || CC_BS_SORT_ORDER_IMPORTANCE;
		var sizeClass = 'auto'; // TODO: get rid of this
		this.mParentElement.down('.settingGroup.sort .radioButton.' + sortClass).addClassName('selected');
		this.mParentElement.down('.settingGroup.size .radioButton.' + sizeClass).addClassName('selected');
		
		if (sortClass != CC_BS_SORT_ORDER_IMPORTANCE)
			this.mParentElement.down('.settingGroup.size .radioButton.auto').addClassName('disabled');
		else
			this.mParentElement.down('.settingGroup.size .radioButton.auto').removeClassName('disabled');
	},
	showSettings: function() {
		this.mSuperview.stopMouseTimer();
		this.mParentElement.addClassName('showSettingsPrep');
		this.validateSettings();
		
		var self = this;
		setTimeout(function(){
			self.mParentElement.addClassName('showSettings');
		}, 10);
	},
	dismissSettings: function() {
		var parEl = this.mParentElement;
		function fixer() {
			parEl.removeClassName('showSettingsPrep');
			parEl.removeClassName('settingsExit');
			this.removeEventListener('webkitTransitionEnd', fixer, false);
		}
		
		this.mSuperview.resetMouseTimer();
		parEl.down('.shield').addEventListener('webkitTransitionEnd', fixer, false);
		parEl.removeClassName('showSettings');
		parEl.addClassName('settingsExit');
	},
	cancelSettings: function() {
		this.dismissSettings();
	},
	saveSettings: function() {
		var sortValue = this.mParentElement.down('.settingGroup.sort .radioButton.selected').readAttribute('data-value');
		var sizeValue = this.mParentElement.down('.settingGroup.size .radioButton.selected').readAttribute('data-value');
		
		window.localStorage.setItem(CC_BS_SORT_ORDER_PREFERENCE_KEY, sortValue);
		this.mSuperview.mDataSource.setSortOrder(sortValue);
		
		this.mSuperview.reloadData();
		this.mSuperview.resetSelectionTimer();
		this.dismissSettings();
	},
	showFailure: function(inOptMessage, inOptTitle, inOptShowButton) {
		this.mParentElement.addClassName('showFailurePrep');
		this.mSuperview.mParentElement.addClassName('titlebarDisabled');
		
		if (!inOptMessage)
			inOptMessage = '_XC.BigScreen.Settings.Failure.DefaultMessage'.loc();
		this.mParentElement.down('.failurePanel .message').textContent = inOptMessage;
		
		if (!inOptTitle)
			inOptTitle = '_XC.BigScreen.Settings.Failure.Title.Default'.loc();
		this.mParentElement.down('.failurePanel .title').textContent = inOptTitle;
		
		if (inOptShowButton === undefined)
			inOptShowButton = true;
		
		if (!inOptShowButton)
			this.mParentElement.down('.failurePanel .controls').hide();
		else
			this.mParentElement.down('.failurePanel .controls').show();
		
		var self = this;
		setTimeout(function(){
			self.mParentElement.addClassName('showFailure');
		}, 10);
	},
	hideFailure: function() {
		if (this.mParentElement.hasClassName('showFailure')) {
			this.mParentElement.removeClassName('showFailurePrep');
			this.mSuperview.mParentElement.removeClassName('titlebarDisabled');
			this.mParentElement.removeClassName('showFailure');
		}
	},
	selectRadioButton: function(e) {
		var button = e.target.up('.radioButton');
		var container = e.target.up('.settingGroup');
		
		if (button.hasClassName('disabled'))
			return;
		
		container.select('.radioButton.selected').forEach(function(el){
			el.removeClassName('selected');
		});
		
		button.addClassName('selected');
		
		if (container.hasClassName('sort'))
		{
			var autoButton = this.mParentElement.down('.settingGroup.size .radioButton.auto');
			if (!button.hasClassName('importance'))
			{
				autoButton.addClassName('disabled');
				if (autoButton.hasClassName('selected'))
				{
					autoButton.removeClassName('selected');
					this.mParentElement.down('.settingGroup.size .radioButton.half').addClassName('selected');
				}
			}
			else
				autoButton.removeClassName('disabled');
		}
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.XcodeServer.BigScreenEntityListItemView = Class.create(CC.Mvc.View, {
	mClassNames: ['xc-big-screen-list-item'],
	mSelected: false,
	mTitle: null,
	mSubtitle: null,
	mSubtitleTimestamp: null,
	mStatusClass: null,
	mFlashing: false,
	mRelativeHeight: 0.045,
	mRelativeMargin: 0.006,
	mCurrentTop: null,
	mNextTop: null,
	render: function() {
		var el = Builder.node('div', (this.mStatusClass) ? {className: this.mStatusClass} : {}, [
			Builder.node('div', {className: 'icon'}),
			Builder.node('div', {className: 'title reltext'}, (this.mTitle) ? this.mTitle : ''),
			Builder.node('div', {className: 'subtitle reltext'}, (this.mSubtitle) ? this.mSubtitle : '')
		]);
		
		if (this.mFlashing)
			el.addClassName('flash');
		
		return el;
	},
	initialize: function($super, inOptEntity) {
		$super();
		if (inOptEntity)
			this.prepare(inOptEntity);
		
		// listen for timestamp update notifications
		globalNotificationCenter().subscribe(CC_BS_TIMESTAMP_NOTIFICATION, function(){
			if (this.mSubtitleTimestamp)
				this.setSubtitleWithDate(this.mSubtitleTimestamp);
		}.bind(this));
	},
	prepare: function(inEntity) {
		this.setTitle((inEntity.longName) ? inEntity.longName : null);
		if (inEntity.updateTime)
			this.setSubtitleWithDate(inEntity.updateTime);
		else
			this.setSubtitle(null);
		this.setStatusClass(null);
	},
	setTitle: function(inTitle) {
		this.mTitle = inTitle;
		if (this.rendered())
			this.mParentElement.down('.title').textContent = (this.mTitle) ? this.mTitle : '';
	},
	setSubtitle: function(inSubtitle) {
		this.mSubtitle = inSubtitle;
		this.mSubtitleTimestamp = null;
		if (this.rendered())
			this.mParentElement.down('.subtitle').textContent = (this.mSubtitle) ? this.mSubtitle : '';
	},
	setSubtitleWithDate: function(inDate) {
		this.setSubtitle(globalLocalizationManager().localizedTimeShift(inDate));
		this.mSubtitleTimestamp = inDate;
	},
	setStatusClass: function(inStatusClass) {
		if (this.mStatusClass && this.rendered())
			this.mParentElement.removeClassName(this.mStatusClass);
		
		this.mStatusClass = inStatusClass;
		
		if (this.mStatusClass && this.rendered())
			this.mParentElement.addClassName(this.mStatusClass);
	},
	setSelected: function(isSelected) {
		this.mSelected = isSelected;
	},
	setFlashing: function(isFlashing) {
		this.mFlashing = isFlashing;
		if (this.rendered())
		{
			if (isFlashing)
				this.mParentElement.addClassName('flash');
			else
				this.mParentElement.removeClassName('flash');
		}
	},
	absoluteHeight: function(inOptIncludeMargin) {
		var height = Math.floor(this.mRelativeHeight * window.innerWidth);
		if (inOptIncludeMargin)
			height += Math.floor(this.mRelativeMargin * window.innerWidth);
		return height;
	},
	resize: function() {
		if (this.rendered())
		{
			this.mParentElement.style.height = Math.floor(this.mRelativeHeight * window.innerWidth) + 'px';
			this.mParentElement.style.marginBottom = Math.floor(this.mRelativeMargin * window.innerWidth) + 'px';
		}
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

function CCAnimFrame(inAnimator) {
	if (window.requestAnimationFrame)
		window.requestAnimationFrame(inAnimator);
	else if (window.webkitRequestAnimationFrame)
		window.webkitRequestAnimationFrame(inAnimator);
	else if (window.mozRequestAnimationFrame)
		window.mozRequestAnimationFrame(inAnimator);
	else
		setTimeout(inAnimator, 1000 / 60);
}

CC.XcodeServer.BigScreenSpinner = Class.create({
	mFrames: null,
	mInitialized: false,
	mRunning: false,
	mActionQueue: null,
	mCanvasName: null,
	mSquareSize: 0,
	mSizeInVWs: false,
	mStartTime: -1,
	mFrameSpeed: 100,
	initialize: function(inCanvasName, inSquareSize, inOptVWs) {
		this.mCanvasName = inCanvasName;
		this.mSquareSize = inSquareSize;
		this.mSizeInVWs = inOptVWs;
		
		var frames = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];
		
		var q = dispatch_queue_create('com.apple.XcodeServer.BigScreen.spinnerAnimationLoad');
		function loaded() {
			dispatch_resume(q);
		}
	
		for (var i = 0; i < frames.length; i++)
		{
			dispatch_suspend(q);
			frames[i].onload = loaded;
		}
		
		frames[0].src = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4xLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI%2BDQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAyNCAxMDI0IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzFfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9Ijg5NC4xNjExIiB5MT0iODI5LjUzNTIiIHgyPSIxMzEuNDA5NiIgeTI9IjE4OS41MTEiPg0KCQkJPHN0b3AgIG9mZnNldD0iMC4zNCIgc3R5bGU9InN0b3AtY29sb3I6IzAwMDAwMDtzdG9wLW9wYWNpdHk6MC41Ii8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjM3MTIiIHN0eWxlPSJzdG9wLWNvbG9yOiMwNjA2MDY7c3RvcC1vcGFjaXR5OjAuNTQ3NSIvPg0KCQkJPHN0b3AgIG9mZnNldD0iMC40MTIyIiBzdHlsZT0ic3RvcC1jb2xvcjojMTYxNjE2O3N0b3Atb3BhY2l0eTowLjYwOTgiLz4NCgkJCTxzdG9wICBvZmZzZXQ9IjAuNDU4NSIgc3R5bGU9InN0b3AtY29sb3I6IzMxMzEzMTtzdG9wLW9wYWNpdHk6MC42ODAyIi8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjUwODgiIHN0eWxlPSJzdG9wLWNvbG9yOiM1NzU3NTc7c3RvcC1vcGFjaXR5OjAuNzU2NyIvPg0KCQkJPHN0b3AgIG9mZnNldD0iMC41NjIzIiBzdHlsZT0ic3RvcC1jb2xvcjojODg4ODg4O3N0b3Atb3BhY2l0eTowLjgzODEiLz4NCgkJCTxzdG9wICBvZmZzZXQ9IjAuNjE3NSIgc3R5bGU9InN0b3AtY29sb3I6I0MyQzJDMjtzdG9wLW9wYWNpdHk6MC45MjIxIi8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjY2ODciIHN0eWxlPSJzdG9wLWNvbG9yOiNGRkZGRkYiLz4NCgkJPC9saW5lYXJHcmFkaWVudD4NCgkJPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9InVybCgjU1ZHSURfMV8pIiBkPSJNMjkzLjAzNSw1MjEuNDk3YzAtMjMuMTU2LTE4Ljc3Mi00MS45My00MS45MjktNDEuOTMNCgkJCUg1MS40MjljLTIzLjE1NywwLTQxLjkyOSwxOC43NzQtNDEuOTI5LDQxLjkzYzAsMjMuMTU1LDE4Ljc3Miw0MS45MjksNDEuOTI5LDQxLjkyOWgxOTkuNjc3DQoJCQlDMjc0LjI2Miw1NjMuNDI2LDI5My4wMzUsNTQ0LjY1MiwyOTMuMDM1LDUyMS40OTd6IE01MTYuNjE3LDcyMi42NDFjLTIzLjE1NywwLTQxLjkyOSwxOC43NzMtNDEuOTI5LDQxLjkyOXYxOTkuNjc2DQoJCQljMCwyMy4xNTUsMTguNzcyLDQxLjkyOSw0MS45MjksNDEuOTI5YzIzLjE1OCwwLDQxLjkzLTE4Ljc3Myw0MS45My00MS45MjlWNzY0LjU2OQ0KCQkJQzU1OC41NDcsNzQxLjQxNCw1MzkuNzc1LDcyMi42NDEsNTE2LjYxNyw3MjIuNjQxeiBNNTE2LjYxNywxMy41NzVjLTIzLjE1NywwLTQxLjkyOSwxOC43NzItNDEuOTI5LDQxLjkyOXYxOTkuNjc3DQoJCQljMCwyMy4xNTcsMTguNzcyLDQxLjkyOSw0MS45MjksNDEuOTI5YzIzLjE1OCwwLDQxLjkzLTE4Ljc3Miw0MS45My00MS45MjlWNTUuNTA0QzU1OC41NDcsMzIuMzQ4LDUzOS43NzUsMTMuNTc1LDUxNi42MTcsMTMuNTc1eg0KCQkJIE0zMjQuOTYzLDYyOC41NmMtMTEuNTc5LTIwLjA1Ni0zNy4yMjEtMjYuOTI2LTU3LjI3Ni0xNS4zNDhMOTQuNzYzLDcxMy4wNWMtMjAuMDU1LDExLjU3OS0yNi45MjYsMzcuMjI0LTE1LjM0OCw1Ny4yNzYNCgkJCWMxMS41NzgsMjAuMDU1LDM3LjIyMiwyNi45MjUsNTcuMjc2LDE1LjM0OGwxNzIuOTI1LTk5LjgzOEMzMjkuNjcsNjc0LjI1NiwzMzYuNTQyLDY0OC42MTMsMzI0Ljk2Myw2MjguNTZ6IE04Mi44NzUsMzIzLjkyMQ0KCQkJbDE3Mi45MjQsOTkuODM4YzIwLjA1NCwxMS41NzksNDUuNjk3LDQuNzA4LDU3LjI3Ny0xNS4zNDdjMTEuNTc3LTIwLjA1NCw0LjcwNi00NS42OTktMTUuMzQ4LTU3LjI3NmwtMTcyLjkyNC05OS44MzgNCgkJCWMtMjAuMDU1LTExLjU4LTQ1LjY5OS00LjcwOC01Ny4yNzcsMTUuMzQ3QzU1Ljk0OCwyODYuNjk5LDYyLjgxOSwzMTIuMzQyLDgyLjg3NSwzMjMuOTIxeiBNMzI5LjY1MiwzMTguOQ0KCQkJYzExLjU3OCwyMC4wNTYsMzcuMjIzLDI2LjkyNyw1Ny4yNzcsMTUuMzQ3YzIwLjA1NS0xMS41NzgsMjYuOTI2LTM3LjIyMSwxNS4zNDYtNTcuMjc2bC05OS44MzgtMTcyLjkyNA0KCQkJYy0xMS41NzgtMjAuMDU1LTM3LjIyMS0yNi45MjYtNTcuMjc1LTE1LjM0OGMtMjAuMDU2LDExLjU3OS0yNi45MjcsMzcuMjIzLTE1LjM0OCw1Ny4yNzdMMzI5LjY1MiwzMTguOXogTTQxMC4yODMsNzAxLjc0Nw0KCQkJYy0yMC4wNTQtMTEuNTc5LTQ1LjY5OS00LjcwOC01Ny4yNzcsMTUuMzQ2bC05OS44MzgsMTcyLjkyNWMtMTEuNTc4LDIwLjA1NS00LjcwOCw0NS42OTksMTUuMzQ4LDU3LjI3OA0KCQkJYzIwLjA1NCwxMS41NzgsNDUuNjk4LDQuNzA2LDU3LjI3NS0xNS4zNDlsOTkuODM4LTE3Mi45MjZDNDM3LjIwOSw3MzguOTY4LDQzMC4zMzcsNzEzLjMyNSw0MTAuMjgzLDcwMS43NDd6IE05NzAuOTg3LDQ3OS41NjcNCgkJCUg3NzEuMzEyYy0yMy4xNTYsMC00MS45MywxOC43NzQtNDEuOTMsNDEuOTNjMCwyMy4xNTUsMTguNzczLDQxLjkyOSw0MS45Myw0MS45MjloMTk5LjY3NmMyMy4xNTYsMCw0MS45My0xOC43NzMsNDEuOTMtNDEuOTI5DQoJCQlDMTAxMi45MTcsNDk4LjM0MSw5OTQuMTQ0LDQ3OS41NjcsOTcwLjk4Nyw0NzkuNTY3eiBNNjY5LjQxLDcxNy4wOTNjLTExLjU3OS0yMC4wNTQtMzcuMjIzLTI2LjkyNS01Ny4yNzYtMTUuMzQ2DQoJCQljLTIwLjA1NCwxMS41NzgtMjYuOTI1LDM3LjIyMS0xNS4zNDgsNTcuMjc0bDk5LjgzOCwxNzIuOTI2YzExLjU4LDIwLjA1NSwzNy4yMjQsMjYuOTI3LDU3LjI3NiwxNS4zNDkNCgkJCWMyMC4wNTYtMTEuNTc5LDI2LjkyNi0zNy4yMjQsMTUuMzQ4LTU3LjI3OEw2NjkuNDEsNzE3LjA5M3ogTTkyNy42NTQsNzEzLjA1bC0xNzIuOTI1LTk5LjgzOA0KCQkJYy0yMC4wNTUtMTEuNTc4LTQ1LjY5Ni00LjcwOC01Ny4yNzgsMTUuMzQ4Yy0xMS41NzYsMjAuMDU0LTQuNzA2LDQ1LjY5NiwxNS4zNSw1Ny4yNzZsMTcyLjkyNCw5OS44MzgNCgkJCWMyMC4wNTUsMTEuNTc3LDQ1LjY5OSw0LjcwNyw1Ny4yNzYtMTUuMzQ4Qzk1NC41NzksNzUwLjI3Myw5NDcuNzA4LDcyNC42MjksOTI3LjY1NCw3MTMuMDV6IE03MDkuMzQyLDQxMC44OTENCgkJCWMxMS41NzgsMjAuMDU1LDM3LjIyMSwyNi45MjYsNTcuMjc1LDE1LjM0N0w5MzkuNTQyLDMyNi40YzIwLjA1NC0xMS41NzgsMjYuOTI1LTM3LjIyMiwxNS4zNDktNTcuMjc2DQoJCQljLTExLjU3OC0yMC4wNTYtMzcuMjI1LTI2LjkyNy01Ny4yNzgtMTUuMzQ4bC0xNzIuOTI2LDk5LjgzOEM3MDQuNjM0LDM2NS4xOTIsNjk3Ljc2MiwzOTAuODM3LDcwOS4zNDIsNDEwLjg5MXogTTYzNS40ODgsMzM0LjI0OA0KCQkJYzIwLjA1NSwxMS41OCw0NS42OTgsNC43MDgsNTcuMjc2LTE1LjM0N2w5OS44MzgtMTcyLjkyM2MxMS41NzktMjAuMDU1LDQuNzA3LTQ1LjY5OC0xNS4zNDctNTcuMjc3DQoJCQljLTIwLjA1NS0xMS41NzgtNDUuNjk2LTQuNzA3LTU3LjI3NywxNS4zNDhsLTk5LjgzOCwxNzIuOTI0QzYwOC41NjIsMjk3LjAyNyw2MTUuNDM0LDMyMi42Nyw2MzUuNDg4LDMzNC4yNDh6Ii8%2BDQoJPC9nPg0KPC9nPg0KPC9zdmc%2BDQo%3D";
		frames[1].src = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4xLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI%2BDQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAyNCAxMDI0IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzFfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjU5NC4zNjcyIiB5MT0iOTkzLjExNzIiIHgyPSI0MjQuMzk5MiIgeTI9IjI5LjE4MDgiPg0KCQkJPHN0b3AgIG9mZnNldD0iMC4zNCIgc3R5bGU9InN0b3AtY29sb3I6IzAwMDAwMDtzdG9wLW9wYWNpdHk6MC41Ii8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjM3MTIiIHN0eWxlPSJzdG9wLWNvbG9yOiMwNjA2MDY7c3RvcC1vcGFjaXR5OjAuNTQ3NSIvPg0KCQkJPHN0b3AgIG9mZnNldD0iMC40MTIyIiBzdHlsZT0ic3RvcC1jb2xvcjojMTYxNjE2O3N0b3Atb3BhY2l0eTowLjYwOTgiLz4NCgkJCTxzdG9wICBvZmZzZXQ9IjAuNDU4NSIgc3R5bGU9InN0b3AtY29sb3I6IzMxMzEzMTtzdG9wLW9wYWNpdHk6MC42ODAyIi8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjUwODgiIHN0eWxlPSJzdG9wLWNvbG9yOiM1NzU3NTc7c3RvcC1vcGFjaXR5OjAuNzU2NyIvPg0KCQkJPHN0b3AgIG9mZnNldD0iMC41NjIzIiBzdHlsZT0ic3RvcC1jb2xvcjojODg4ODg4O3N0b3Atb3BhY2l0eTowLjgzODEiLz4NCgkJCTxzdG9wICBvZmZzZXQ9IjAuNjE3NSIgc3R5bGU9InN0b3AtY29sb3I6I0MyQzJDMjtzdG9wLW9wYWNpdHk6MC45MjIxIi8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjY2ODciIHN0eWxlPSJzdG9wLWNvbG9yOiNGRkZGRkYiLz4NCgkJPC9saW5lYXJHcmFkaWVudD4NCgkJPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9InVybCgjU1ZHSURfMV8pIiBkPSJNMjkzLjAzNSw1MjEuNDk3YzAtMjMuMTU2LTE4Ljc3Mi00MS45My00MS45MjktNDEuOTMNCgkJCUg1MS40MjljLTIzLjE1NywwLTQxLjkyOSwxOC43NzQtNDEuOTI5LDQxLjkzYzAsMjMuMTU1LDE4Ljc3Miw0MS45MjksNDEuOTI5LDQxLjkyOWgxOTkuNjc3DQoJCQlDMjc0LjI2Miw1NjMuNDI2LDI5My4wMzUsNTQ0LjY1MiwyOTMuMDM1LDUyMS40OTd6IE01MTYuNjE3LDcyMi42NDFjLTIzLjE1NywwLTQxLjkyOSwxOC43NzMtNDEuOTI5LDQxLjkyOXYxOTkuNjc2DQoJCQljMCwyMy4xNTUsMTguNzcyLDQxLjkyOSw0MS45MjksNDEuOTI5YzIzLjE1OCwwLDQxLjkzLTE4Ljc3Myw0MS45My00MS45MjlWNzY0LjU2OQ0KCQkJQzU1OC41NDcsNzQxLjQxNCw1MzkuNzc1LDcyMi42NDEsNTE2LjYxNyw3MjIuNjQxeiBNNTE2LjYxNywxMy41NzVjLTIzLjE1NywwLTQxLjkyOSwxOC43NzItNDEuOTI5LDQxLjkyOXYxOTkuNjc3DQoJCQljMCwyMy4xNTcsMTguNzcyLDQxLjkyOSw0MS45MjksNDEuOTI5YzIzLjE1OCwwLDQxLjkzLTE4Ljc3Miw0MS45My00MS45MjlWNTUuNTA0QzU1OC41NDcsMzIuMzQ4LDUzOS43NzUsMTMuNTc1LDUxNi42MTcsMTMuNTc1eg0KCQkJIE0zMjQuOTYzLDYyOC41NmMtMTEuNTc5LTIwLjA1Ni0zNy4yMjEtMjYuOTI2LTU3LjI3Ni0xNS4zNDhMOTQuNzYzLDcxMy4wNWMtMjAuMDU1LDExLjU3OS0yNi45MjYsMzcuMjI0LTE1LjM0OCw1Ny4yNzYNCgkJCWMxMS41NzgsMjAuMDU1LDM3LjIyMiwyNi45MjUsNTcuMjc2LDE1LjM0OGwxNzIuOTI1LTk5LjgzOEMzMjkuNjcsNjc0LjI1NiwzMzYuNTQyLDY0OC42MTMsMzI0Ljk2Myw2MjguNTZ6IE04Mi44NzUsMzIzLjkyMQ0KCQkJbDE3Mi45MjQsOTkuODM4YzIwLjA1NCwxMS41NzksNDUuNjk3LDQuNzA4LDU3LjI3Ny0xNS4zNDdjMTEuNTc3LTIwLjA1NCw0LjcwNi00NS42OTktMTUuMzQ4LTU3LjI3NmwtMTcyLjkyNC05OS44MzgNCgkJCWMtMjAuMDU1LTExLjU4LTQ1LjY5OS00LjcwOC01Ny4yNzcsMTUuMzQ3QzU1Ljk0OCwyODYuNjk5LDYyLjgxOSwzMTIuMzQyLDgyLjg3NSwzMjMuOTIxeiBNMzI5LjY1MiwzMTguOQ0KCQkJYzExLjU3OCwyMC4wNTYsMzcuMjIzLDI2LjkyNyw1Ny4yNzcsMTUuMzQ3YzIwLjA1NS0xMS41NzgsMjYuOTI2LTM3LjIyMSwxNS4zNDYtNTcuMjc2bC05OS44MzgtMTcyLjkyNA0KCQkJYy0xMS41NzgtMjAuMDU1LTM3LjIyMS0yNi45MjYtNTcuMjc1LTE1LjM0OGMtMjAuMDU2LDExLjU3OS0yNi45MjcsMzcuMjIzLTE1LjM0OCw1Ny4yNzdMMzI5LjY1MiwzMTguOXogTTQxMC4yODMsNzAxLjc0Nw0KCQkJYy0yMC4wNTQtMTEuNTc5LTQ1LjY5OS00LjcwOC01Ny4yNzcsMTUuMzQ2bC05OS44MzgsMTcyLjkyNWMtMTEuNTc4LDIwLjA1NS00LjcwOCw0NS42OTksMTUuMzQ4LDU3LjI3OA0KCQkJYzIwLjA1NCwxMS41NzgsNDUuNjk4LDQuNzA2LDU3LjI3NS0xNS4zNDlsOTkuODM4LTE3Mi45MjZDNDM3LjIwOSw3MzguOTY4LDQzMC4zMzcsNzEzLjMyNSw0MTAuMjgzLDcwMS43NDd6IE05NzAuOTg3LDQ3OS41NjcNCgkJCUg3NzEuMzEyYy0yMy4xNTYsMC00MS45MywxOC43NzQtNDEuOTMsNDEuOTNjMCwyMy4xNTUsMTguNzczLDQxLjkyOSw0MS45Myw0MS45MjloMTk5LjY3NmMyMy4xNTYsMCw0MS45My0xOC43NzMsNDEuOTMtNDEuOTI5DQoJCQlDMTAxMi45MTcsNDk4LjM0MSw5OTQuMTQ0LDQ3OS41NjcsOTcwLjk4Nyw0NzkuNTY3eiBNNjY5LjQxLDcxNy4wOTNjLTExLjU3OS0yMC4wNTQtMzcuMjIzLTI2LjkyNS01Ny4yNzYtMTUuMzQ2DQoJCQljLTIwLjA1NCwxMS41NzgtMjYuOTI1LDM3LjIyMS0xNS4zNDgsNTcuMjc0bDk5LjgzOCwxNzIuOTI2YzExLjU4LDIwLjA1NSwzNy4yMjQsMjYuOTI3LDU3LjI3NiwxNS4zNDkNCgkJCWMyMC4wNTYtMTEuNTc5LDI2LjkyNi0zNy4yMjQsMTUuMzQ4LTU3LjI3OEw2NjkuNDEsNzE3LjA5M3ogTTkyNy42NTQsNzEzLjA1bC0xNzIuOTI1LTk5LjgzOA0KCQkJYy0yMC4wNTUtMTEuNTc4LTQ1LjY5Ni00LjcwOC01Ny4yNzgsMTUuMzQ4Yy0xMS41NzYsMjAuMDU0LTQuNzA2LDQ1LjY5NiwxNS4zNSw1Ny4yNzZsMTcyLjkyNCw5OS44MzgNCgkJCWMyMC4wNTUsMTEuNTc3LDQ1LjY5OSw0LjcwNyw1Ny4yNzYtMTUuMzQ4Qzk1NC41NzksNzUwLjI3Myw5NDcuNzA4LDcyNC42MjksOTI3LjY1NCw3MTMuMDV6IE03MDkuMzQyLDQxMC44OTENCgkJCWMxMS41NzgsMjAuMDU1LDM3LjIyMSwyNi45MjYsNTcuMjc1LDE1LjM0N0w5MzkuNTQyLDMyNi40YzIwLjA1NC0xMS41NzgsMjYuOTI1LTM3LjIyMiwxNS4zNDktNTcuMjc2DQoJCQljLTExLjU3OC0yMC4wNTYtMzcuMjI1LTI2LjkyNy01Ny4yNzgtMTUuMzQ4bC0xNzIuOTI2LDk5LjgzOEM3MDQuNjM0LDM2NS4xOTIsNjk3Ljc2MiwzOTAuODM3LDcwOS4zNDIsNDEwLjg5MXogTTYzNS40ODgsMzM0LjI0OA0KCQkJYzIwLjA1NSwxMS41OCw0NS42OTgsNC43MDgsNTcuMjc2LTE1LjM0N2w5OS44MzgtMTcyLjkyM2MxMS41NzktMjAuMDU1LDQuNzA3LTQ1LjY5OC0xNS4zNDctNTcuMjc3DQoJCQljLTIwLjA1NS0xMS41NzgtNDUuNjk2LTQuNzA3LTU3LjI3NywxNS4zNDhsLTk5LjgzOCwxNzIuOTI0QzYwOC41NjIsMjk3LjAyNyw2MTUuNDM0LDMyMi42Nyw2MzUuNDg4LDMzNC4yNDh6Ii8%2BDQoJPC9nPg0KPC9nPg0KPC9zdmc%2BDQo%3D";
		frames[2].src = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4xLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI%2BDQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAyNCAxMDI0IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzFfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjI2MC4zOTY1IiB5MT0iOTQyLjYwNzQiIHgyPSI3NTkuMzY0NCIgeTI9Ijc4LjM2OTciPg0KCQkJPHN0b3AgIG9mZnNldD0iMC4zNCIgc3R5bGU9InN0b3AtY29sb3I6IzAwMDAwMDtzdG9wLW9wYWNpdHk6MC41Ii8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjM3MTIiIHN0eWxlPSJzdG9wLWNvbG9yOiMwNjA2MDY7c3RvcC1vcGFjaXR5OjAuNTQ3NSIvPg0KCQkJPHN0b3AgIG9mZnNldD0iMC40MTIyIiBzdHlsZT0ic3RvcC1jb2xvcjojMTYxNjE2O3N0b3Atb3BhY2l0eTowLjYwOTgiLz4NCgkJCTxzdG9wICBvZmZzZXQ9IjAuNDU4NSIgc3R5bGU9InN0b3AtY29sb3I6IzMxMzEzMTtzdG9wLW9wYWNpdHk6MC42ODAyIi8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjUwODgiIHN0eWxlPSJzdG9wLWNvbG9yOiM1NzU3NTc7c3RvcC1vcGFjaXR5OjAuNzU2NyIvPg0KCQkJPHN0b3AgIG9mZnNldD0iMC41NjIzIiBzdHlsZT0ic3RvcC1jb2xvcjojODg4ODg4O3N0b3Atb3BhY2l0eTowLjgzODEiLz4NCgkJCTxzdG9wICBvZmZzZXQ9IjAuNjE3NSIgc3R5bGU9InN0b3AtY29sb3I6I0MyQzJDMjtzdG9wLW9wYWNpdHk6MC45MjIxIi8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjY2ODciIHN0eWxlPSJzdG9wLWNvbG9yOiNGRkZGRkYiLz4NCgkJPC9saW5lYXJHcmFkaWVudD4NCgkJPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9InVybCgjU1ZHSURfMV8pIiBkPSJNMjkzLjAzNSw1MjEuNDk3YzAtMjMuMTU2LTE4Ljc3Mi00MS45My00MS45MjktNDEuOTMNCgkJCUg1MS40MjljLTIzLjE1NywwLTQxLjkyOSwxOC43NzQtNDEuOTI5LDQxLjkzYzAsMjMuMTU1LDE4Ljc3Miw0MS45MjksNDEuOTI5LDQxLjkyOWgxOTkuNjc3DQoJCQlDMjc0LjI2Miw1NjMuNDI2LDI5My4wMzUsNTQ0LjY1MiwyOTMuMDM1LDUyMS40OTd6IE01MTYuNjE3LDcyMi42NDFjLTIzLjE1NywwLTQxLjkyOSwxOC43NzMtNDEuOTI5LDQxLjkyOXYxOTkuNjc2DQoJCQljMCwyMy4xNTUsMTguNzcyLDQxLjkyOSw0MS45MjksNDEuOTI5YzIzLjE1OCwwLDQxLjkzLTE4Ljc3Myw0MS45My00MS45MjlWNzY0LjU2OQ0KCQkJQzU1OC41NDcsNzQxLjQxNCw1MzkuNzc1LDcyMi42NDEsNTE2LjYxNyw3MjIuNjQxeiBNNTE2LjYxNywxMy41NzVjLTIzLjE1NywwLTQxLjkyOSwxOC43NzItNDEuOTI5LDQxLjkyOXYxOTkuNjc3DQoJCQljMCwyMy4xNTcsMTguNzcyLDQxLjkyOSw0MS45MjksNDEuOTI5YzIzLjE1OCwwLDQxLjkzLTE4Ljc3Miw0MS45My00MS45MjlWNTUuNTA0QzU1OC41NDcsMzIuMzQ4LDUzOS43NzUsMTMuNTc1LDUxNi42MTcsMTMuNTc1eg0KCQkJIE0zMjQuOTYzLDYyOC41NmMtMTEuNTc5LTIwLjA1Ni0zNy4yMjEtMjYuOTI2LTU3LjI3Ni0xNS4zNDhMOTQuNzYzLDcxMy4wNWMtMjAuMDU1LDExLjU3OS0yNi45MjYsMzcuMjI0LTE1LjM0OCw1Ny4yNzYNCgkJCWMxMS41NzgsMjAuMDU1LDM3LjIyMiwyNi45MjUsNTcuMjc2LDE1LjM0OGwxNzIuOTI1LTk5LjgzOEMzMjkuNjcsNjc0LjI1NiwzMzYuNTQyLDY0OC42MTMsMzI0Ljk2Myw2MjguNTZ6IE04Mi44NzUsMzIzLjkyMQ0KCQkJbDE3Mi45MjQsOTkuODM4YzIwLjA1NCwxMS41NzksNDUuNjk3LDQuNzA4LDU3LjI3Ny0xNS4zNDdjMTEuNTc3LTIwLjA1NCw0LjcwNi00NS42OTktMTUuMzQ4LTU3LjI3NmwtMTcyLjkyNC05OS44MzgNCgkJCWMtMjAuMDU1LTExLjU4LTQ1LjY5OS00LjcwOC01Ny4yNzcsMTUuMzQ3QzU1Ljk0OCwyODYuNjk5LDYyLjgxOSwzMTIuMzQyLDgyLjg3NSwzMjMuOTIxeiBNMzI5LjY1MiwzMTguOQ0KCQkJYzExLjU3OCwyMC4wNTYsMzcuMjIzLDI2LjkyNyw1Ny4yNzcsMTUuMzQ3YzIwLjA1NS0xMS41NzgsMjYuOTI2LTM3LjIyMSwxNS4zNDYtNTcuMjc2bC05OS44MzgtMTcyLjkyNA0KCQkJYy0xMS41NzgtMjAuMDU1LTM3LjIyMS0yNi45MjYtNTcuMjc1LTE1LjM0OGMtMjAuMDU2LDExLjU3OS0yNi45MjcsMzcuMjIzLTE1LjM0OCw1Ny4yNzdMMzI5LjY1MiwzMTguOXogTTQxMC4yODMsNzAxLjc0Nw0KCQkJYy0yMC4wNTQtMTEuNTc5LTQ1LjY5OS00LjcwOC01Ny4yNzcsMTUuMzQ2bC05OS44MzgsMTcyLjkyNWMtMTEuNTc4LDIwLjA1NS00LjcwOCw0NS42OTksMTUuMzQ4LDU3LjI3OA0KCQkJYzIwLjA1NCwxMS41NzgsNDUuNjk4LDQuNzA2LDU3LjI3NS0xNS4zNDlsOTkuODM4LTE3Mi45MjZDNDM3LjIwOSw3MzguOTY4LDQzMC4zMzcsNzEzLjMyNSw0MTAuMjgzLDcwMS43NDd6IE05NzAuOTg3LDQ3OS41NjcNCgkJCUg3NzEuMzEyYy0yMy4xNTYsMC00MS45MywxOC43NzQtNDEuOTMsNDEuOTNjMCwyMy4xNTUsMTguNzczLDQxLjkyOSw0MS45Myw0MS45MjloMTk5LjY3NmMyMy4xNTYsMCw0MS45My0xOC43NzMsNDEuOTMtNDEuOTI5DQoJCQlDMTAxMi45MTcsNDk4LjM0MSw5OTQuMTQ0LDQ3OS41NjcsOTcwLjk4Nyw0NzkuNTY3eiBNNjY5LjQxLDcxNy4wOTNjLTExLjU3OS0yMC4wNTQtMzcuMjIzLTI2LjkyNS01Ny4yNzYtMTUuMzQ2DQoJCQljLTIwLjA1NCwxMS41NzgtMjYuOTI1LDM3LjIyMS0xNS4zNDgsNTcuMjc0bDk5LjgzOCwxNzIuOTI2YzExLjU4LDIwLjA1NSwzNy4yMjQsMjYuOTI3LDU3LjI3NiwxNS4zNDkNCgkJCWMyMC4wNTYtMTEuNTc5LDI2LjkyNi0zNy4yMjQsMTUuMzQ4LTU3LjI3OEw2NjkuNDEsNzE3LjA5M3ogTTkyNy42NTQsNzEzLjA1bC0xNzIuOTI1LTk5LjgzOA0KCQkJYy0yMC4wNTUtMTEuNTc4LTQ1LjY5Ni00LjcwOC01Ny4yNzgsMTUuMzQ4Yy0xMS41NzYsMjAuMDU0LTQuNzA2LDQ1LjY5NiwxNS4zNSw1Ny4yNzZsMTcyLjkyNCw5OS44MzgNCgkJCWMyMC4wNTUsMTEuNTc3LDQ1LjY5OSw0LjcwNyw1Ny4yNzYtMTUuMzQ4Qzk1NC41NzksNzUwLjI3Myw5NDcuNzA4LDcyNC42MjksOTI3LjY1NCw3MTMuMDV6IE03MDkuMzQyLDQxMC44OTENCgkJCWMxMS41NzgsMjAuMDU1LDM3LjIyMSwyNi45MjYsNTcuMjc1LDE1LjM0N0w5MzkuNTQyLDMyNi40YzIwLjA1NC0xMS41NzgsMjYuOTI1LTM3LjIyMiwxNS4zNDktNTcuMjc2DQoJCQljLTExLjU3OC0yMC4wNTYtMzcuMjI1LTI2LjkyNy01Ny4yNzgtMTUuMzQ4bC0xNzIuOTI2LDk5LjgzOEM3MDQuNjM0LDM2NS4xOTIsNjk3Ljc2MiwzOTAuODM3LDcwOS4zNDIsNDEwLjg5MXogTTYzNS40ODgsMzM0LjI0OA0KCQkJYzIwLjA1NSwxMS41OCw0NS42OTgsNC43MDgsNTcuMjc2LTE1LjM0N2w5OS44MzgtMTcyLjkyM2MxMS41NzktMjAuMDU1LDQuNzA3LTQ1LjY5OC0xNS4zNDctNTcuMjc3DQoJCQljLTIwLjA1NS0xMS41NzgtNDUuNjk2LTQuNzA3LTU3LjI3NywxNS4zNDhsLTk5LjgzOCwxNzIuOTI0QzYwOC41NjIsMjk3LjAyNyw2MTUuNDM0LDMyMi42Nyw2MzUuNDg4LDMzNC4yNDh6Ii8%2BDQoJPC9nPg0KPC9nPg0KPC9zdmc%2BDQo%3D";
		frames[3].src = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4xLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI%2BDQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAyNCAxMDI0IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzFfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjQ2Ljg1NzQiIHkxPSI2ODIuNzU3OCIgeDI9Ijk4Mi4yMTQ1IiB5Mj0iMzQyLjMxNTYiPg0KCQkJPHN0b3AgIG9mZnNldD0iMC4zNCIgc3R5bGU9InN0b3AtY29sb3I6IzAwMDAwMDtzdG9wLW9wYWNpdHk6MC41Ii8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjM3MTIiIHN0eWxlPSJzdG9wLWNvbG9yOiMwNjA2MDY7c3RvcC1vcGFjaXR5OjAuNTQ3NSIvPg0KCQkJPHN0b3AgIG9mZnNldD0iMC40MTIyIiBzdHlsZT0ic3RvcC1jb2xvcjojMTYxNjE2O3N0b3Atb3BhY2l0eTowLjYwOTgiLz4NCgkJCTxzdG9wICBvZmZzZXQ9IjAuNDU4NSIgc3R5bGU9InN0b3AtY29sb3I6IzMxMzEzMTtzdG9wLW9wYWNpdHk6MC42ODAyIi8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjUwODgiIHN0eWxlPSJzdG9wLWNvbG9yOiM1NzU3NTc7c3RvcC1vcGFjaXR5OjAuNzU2NyIvPg0KCQkJPHN0b3AgIG9mZnNldD0iMC41NjIzIiBzdHlsZT0ic3RvcC1jb2xvcjojODg4ODg4O3N0b3Atb3BhY2l0eTowLjgzODEiLz4NCgkJCTxzdG9wICBvZmZzZXQ9IjAuNjE3NSIgc3R5bGU9InN0b3AtY29sb3I6I0MyQzJDMjtzdG9wLW9wYWNpdHk6MC45MjIxIi8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjY2ODciIHN0eWxlPSJzdG9wLWNvbG9yOiNGRkZGRkYiLz4NCgkJPC9saW5lYXJHcmFkaWVudD4NCgkJPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9InVybCgjU1ZHSURfMV8pIiBkPSJNMjkzLjAzNSw1MjEuNDk3YzAtMjMuMTU2LTE4Ljc3Mi00MS45My00MS45MjktNDEuOTMNCgkJCUg1MS40MjljLTIzLjE1NywwLTQxLjkyOSwxOC43NzQtNDEuOTI5LDQxLjkzYzAsMjMuMTU1LDE4Ljc3Miw0MS45MjksNDEuOTI5LDQxLjkyOWgxOTkuNjc3DQoJCQlDMjc0LjI2Miw1NjMuNDI2LDI5My4wMzUsNTQ0LjY1MiwyOTMuMDM1LDUyMS40OTd6IE01MTYuNjE3LDcyMi42NDFjLTIzLjE1NywwLTQxLjkyOSwxOC43NzMtNDEuOTI5LDQxLjkyOXYxOTkuNjc2DQoJCQljMCwyMy4xNTUsMTguNzcyLDQxLjkyOSw0MS45MjksNDEuOTI5YzIzLjE1OCwwLDQxLjkzLTE4Ljc3Myw0MS45My00MS45MjlWNzY0LjU2OQ0KCQkJQzU1OC41NDcsNzQxLjQxNCw1MzkuNzc1LDcyMi42NDEsNTE2LjYxNyw3MjIuNjQxeiBNNTE2LjYxNywxMy41NzVjLTIzLjE1NywwLTQxLjkyOSwxOC43NzItNDEuOTI5LDQxLjkyOXYxOTkuNjc3DQoJCQljMCwyMy4xNTcsMTguNzcyLDQxLjkyOSw0MS45MjksNDEuOTI5YzIzLjE1OCwwLDQxLjkzLTE4Ljc3Miw0MS45My00MS45MjlWNTUuNTA0QzU1OC41NDcsMzIuMzQ4LDUzOS43NzUsMTMuNTc1LDUxNi42MTcsMTMuNTc1eg0KCQkJIE0zMjQuOTYzLDYyOC41NmMtMTEuNTc5LTIwLjA1Ni0zNy4yMjEtMjYuOTI2LTU3LjI3Ni0xNS4zNDhMOTQuNzYzLDcxMy4wNWMtMjAuMDU1LDExLjU3OS0yNi45MjYsMzcuMjI0LTE1LjM0OCw1Ny4yNzYNCgkJCWMxMS41NzgsMjAuMDU1LDM3LjIyMiwyNi45MjUsNTcuMjc2LDE1LjM0OGwxNzIuOTI1LTk5LjgzOEMzMjkuNjcsNjc0LjI1NiwzMzYuNTQyLDY0OC42MTMsMzI0Ljk2Myw2MjguNTZ6IE04Mi44NzUsMzIzLjkyMQ0KCQkJbDE3Mi45MjQsOTkuODM4YzIwLjA1NCwxMS41NzksNDUuNjk3LDQuNzA4LDU3LjI3Ny0xNS4zNDdjMTEuNTc3LTIwLjA1NCw0LjcwNi00NS42OTktMTUuMzQ4LTU3LjI3NmwtMTcyLjkyNC05OS44MzgNCgkJCWMtMjAuMDU1LTExLjU4LTQ1LjY5OS00LjcwOC01Ny4yNzcsMTUuMzQ3QzU1Ljk0OCwyODYuNjk5LDYyLjgxOSwzMTIuMzQyLDgyLjg3NSwzMjMuOTIxeiBNMzI5LjY1MiwzMTguOQ0KCQkJYzExLjU3OCwyMC4wNTYsMzcuMjIzLDI2LjkyNyw1Ny4yNzcsMTUuMzQ3YzIwLjA1NS0xMS41NzgsMjYuOTI2LTM3LjIyMSwxNS4zNDYtNTcuMjc2bC05OS44MzgtMTcyLjkyNA0KCQkJYy0xMS41NzgtMjAuMDU1LTM3LjIyMS0yNi45MjYtNTcuMjc1LTE1LjM0OGMtMjAuMDU2LDExLjU3OS0yNi45MjcsMzcuMjIzLTE1LjM0OCw1Ny4yNzdMMzI5LjY1MiwzMTguOXogTTQxMC4yODMsNzAxLjc0Nw0KCQkJYy0yMC4wNTQtMTEuNTc5LTQ1LjY5OS00LjcwOC01Ny4yNzcsMTUuMzQ2bC05OS44MzgsMTcyLjkyNWMtMTEuNTc4LDIwLjA1NS00LjcwOCw0NS42OTksMTUuMzQ4LDU3LjI3OA0KCQkJYzIwLjA1NCwxMS41NzgsNDUuNjk4LDQuNzA2LDU3LjI3NS0xNS4zNDlsOTkuODM4LTE3Mi45MjZDNDM3LjIwOSw3MzguOTY4LDQzMC4zMzcsNzEzLjMyNSw0MTAuMjgzLDcwMS43NDd6IE05NzAuOTg3LDQ3OS41NjcNCgkJCUg3NzEuMzEyYy0yMy4xNTYsMC00MS45MywxOC43NzQtNDEuOTMsNDEuOTNjMCwyMy4xNTUsMTguNzczLDQxLjkyOSw0MS45Myw0MS45MjloMTk5LjY3NmMyMy4xNTYsMCw0MS45My0xOC43NzMsNDEuOTMtNDEuOTI5DQoJCQlDMTAxMi45MTcsNDk4LjM0MSw5OTQuMTQ0LDQ3OS41NjcsOTcwLjk4Nyw0NzkuNTY3eiBNNjY5LjQxLDcxNy4wOTNjLTExLjU3OS0yMC4wNTQtMzcuMjIzLTI2LjkyNS01Ny4yNzYtMTUuMzQ2DQoJCQljLTIwLjA1NCwxMS41NzgtMjYuOTI1LDM3LjIyMS0xNS4zNDgsNTcuMjc0bDk5LjgzOCwxNzIuOTI2YzExLjU4LDIwLjA1NSwzNy4yMjQsMjYuOTI3LDU3LjI3NiwxNS4zNDkNCgkJCWMyMC4wNTYtMTEuNTc5LDI2LjkyNi0zNy4yMjQsMTUuMzQ4LTU3LjI3OEw2NjkuNDEsNzE3LjA5M3ogTTkyNy42NTQsNzEzLjA1bC0xNzIuOTI1LTk5LjgzOA0KCQkJYy0yMC4wNTUtMTEuNTc4LTQ1LjY5Ni00LjcwOC01Ny4yNzgsMTUuMzQ4Yy0xMS41NzYsMjAuMDU0LTQuNzA2LDQ1LjY5NiwxNS4zNSw1Ny4yNzZsMTcyLjkyNCw5OS44MzgNCgkJCWMyMC4wNTUsMTEuNTc3LDQ1LjY5OSw0LjcwNyw1Ny4yNzYtMTUuMzQ4Qzk1NC41NzksNzUwLjI3Myw5NDcuNzA4LDcyNC42MjksOTI3LjY1NCw3MTMuMDV6IE03MDkuMzQyLDQxMC44OTENCgkJCWMxMS41NzgsMjAuMDU1LDM3LjIyMSwyNi45MjYsNTcuMjc1LDE1LjM0N0w5MzkuNTQyLDMyNi40YzIwLjA1NC0xMS41NzgsMjYuOTI1LTM3LjIyMiwxNS4zNDktNTcuMjc2DQoJCQljLTExLjU3OC0yMC4wNTYtMzcuMjI1LTI2LjkyNy01Ny4yNzgtMTUuMzQ4bC0xNzIuOTI2LDk5LjgzOEM3MDQuNjM0LDM2NS4xOTIsNjk3Ljc2MiwzOTAuODM3LDcwOS4zNDIsNDEwLjg5MXogTTYzNS40ODgsMzM0LjI0OA0KCQkJYzIwLjA1NSwxMS41OCw0NS42OTgsNC43MDgsNTcuMjc2LTE1LjM0N2w5OS44MzgtMTcyLjkyM2MxMS41NzktMjAuMDU1LDQuNzA3LTQ1LjY5OC0xNS4zNDctNTcuMjc3DQoJCQljLTIwLjA1NS0xMS41NzgtNDUuNjk2LTQuNzA3LTU3LjI3NywxNS4zNDhsLTk5LjgzOCwxNzIuOTI0QzYwOC41NjIsMjk3LjAyNyw2MTUuNDM0LDMyMi42Nyw2MzUuNDg4LDMzNC4yNDh6Ii8%2BDQoJPC9nPg0KPC9nPg0KPC9zdmc%2BDQo%3D";
		frames[4].src = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4xLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI%2BDQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAyNCAxMDI0IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzFfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjM5LjQwNTgiIHkxPSIzNDIuMDI1OSIgeDI9Ijk3NS41NTk5IiB5Mj0iNjgyLjc1ODEiPg0KCQkJPHN0b3AgIG9mZnNldD0iMC4zNCIgc3R5bGU9InN0b3AtY29sb3I6IzAwMDAwMDtzdG9wLW9wYWNpdHk6MC41Ii8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjM3MTIiIHN0eWxlPSJzdG9wLWNvbG9yOiMwNjA2MDY7c3RvcC1vcGFjaXR5OjAuNTQ3NSIvPg0KCQkJPHN0b3AgIG9mZnNldD0iMC40MTIyIiBzdHlsZT0ic3RvcC1jb2xvcjojMTYxNjE2O3N0b3Atb3BhY2l0eTowLjYwOTgiLz4NCgkJCTxzdG9wICBvZmZzZXQ9IjAuNDU4NSIgc3R5bGU9InN0b3AtY29sb3I6IzMxMzEzMTtzdG9wLW9wYWNpdHk6MC42ODAyIi8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjUwODgiIHN0eWxlPSJzdG9wLWNvbG9yOiM1NzU3NTc7c3RvcC1vcGFjaXR5OjAuNzU2NyIvPg0KCQkJPHN0b3AgIG9mZnNldD0iMC41NjIzIiBzdHlsZT0ic3RvcC1jb2xvcjojODg4ODg4O3N0b3Atb3BhY2l0eTowLjgzODEiLz4NCgkJCTxzdG9wICBvZmZzZXQ9IjAuNjE3NSIgc3R5bGU9InN0b3AtY29sb3I6I0MyQzJDMjtzdG9wLW9wYWNpdHk6MC45MjIxIi8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjY2ODciIHN0eWxlPSJzdG9wLWNvbG9yOiNGRkZGRkYiLz4NCgkJPC9saW5lYXJHcmFkaWVudD4NCgkJPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9InVybCgjU1ZHSURfMV8pIiBkPSJNMjkzLjAzNSw1MjEuNDk3YzAtMjMuMTU2LTE4Ljc3Mi00MS45My00MS45MjktNDEuOTMNCgkJCUg1MS40MjljLTIzLjE1NywwLTQxLjkyOSwxOC43NzQtNDEuOTI5LDQxLjkzYzAsMjMuMTU1LDE4Ljc3Miw0MS45MjksNDEuOTI5LDQxLjkyOWgxOTkuNjc3DQoJCQlDMjc0LjI2Miw1NjMuNDI2LDI5My4wMzUsNTQ0LjY1MiwyOTMuMDM1LDUyMS40OTd6IE01MTYuNjE3LDcyMi42NDFjLTIzLjE1NywwLTQxLjkyOSwxOC43NzMtNDEuOTI5LDQxLjkyOXYxOTkuNjc2DQoJCQljMCwyMy4xNTUsMTguNzcyLDQxLjkyOSw0MS45MjksNDEuOTI5YzIzLjE1OCwwLDQxLjkzLTE4Ljc3Myw0MS45My00MS45MjlWNzY0LjU2OQ0KCQkJQzU1OC41NDcsNzQxLjQxNCw1MzkuNzc1LDcyMi42NDEsNTE2LjYxNyw3MjIuNjQxeiBNNTE2LjYxNywxMy41NzVjLTIzLjE1NywwLTQxLjkyOSwxOC43NzItNDEuOTI5LDQxLjkyOXYxOTkuNjc3DQoJCQljMCwyMy4xNTcsMTguNzcyLDQxLjkyOSw0MS45MjksNDEuOTI5YzIzLjE1OCwwLDQxLjkzLTE4Ljc3Miw0MS45My00MS45MjlWNTUuNTA0QzU1OC41NDcsMzIuMzQ4LDUzOS43NzUsMTMuNTc1LDUxNi42MTcsMTMuNTc1eg0KCQkJIE0zMjQuOTYzLDYyOC41NmMtMTEuNTc5LTIwLjA1Ni0zNy4yMjEtMjYuOTI2LTU3LjI3Ni0xNS4zNDhMOTQuNzYzLDcxMy4wNWMtMjAuMDU1LDExLjU3OS0yNi45MjYsMzcuMjI0LTE1LjM0OCw1Ny4yNzYNCgkJCWMxMS41NzgsMjAuMDU1LDM3LjIyMiwyNi45MjUsNTcuMjc2LDE1LjM0OGwxNzIuOTI1LTk5LjgzOEMzMjkuNjcsNjc0LjI1NiwzMzYuNTQyLDY0OC42MTMsMzI0Ljk2Myw2MjguNTZ6IE04Mi44NzUsMzIzLjkyMQ0KCQkJbDE3Mi45MjQsOTkuODM4YzIwLjA1NCwxMS41NzksNDUuNjk3LDQuNzA4LDU3LjI3Ny0xNS4zNDdjMTEuNTc3LTIwLjA1NCw0LjcwNi00NS42OTktMTUuMzQ4LTU3LjI3NmwtMTcyLjkyNC05OS44MzgNCgkJCWMtMjAuMDU1LTExLjU4LTQ1LjY5OS00LjcwOC01Ny4yNzcsMTUuMzQ3QzU1Ljk0OCwyODYuNjk5LDYyLjgxOSwzMTIuMzQyLDgyLjg3NSwzMjMuOTIxeiBNMzI5LjY1MiwzMTguOQ0KCQkJYzExLjU3OCwyMC4wNTYsMzcuMjIzLDI2LjkyNyw1Ny4yNzcsMTUuMzQ3YzIwLjA1NS0xMS41NzgsMjYuOTI2LTM3LjIyMSwxNS4zNDYtNTcuMjc2bC05OS44MzgtMTcyLjkyNA0KCQkJYy0xMS41NzgtMjAuMDU1LTM3LjIyMS0yNi45MjYtNTcuMjc1LTE1LjM0OGMtMjAuMDU2LDExLjU3OS0yNi45MjcsMzcuMjIzLTE1LjM0OCw1Ny4yNzdMMzI5LjY1MiwzMTguOXogTTQxMC4yODMsNzAxLjc0Nw0KCQkJYy0yMC4wNTQtMTEuNTc5LTQ1LjY5OS00LjcwOC01Ny4yNzcsMTUuMzQ2bC05OS44MzgsMTcyLjkyNWMtMTEuNTc4LDIwLjA1NS00LjcwOCw0NS42OTksMTUuMzQ4LDU3LjI3OA0KCQkJYzIwLjA1NCwxMS41NzgsNDUuNjk4LDQuNzA2LDU3LjI3NS0xNS4zNDlsOTkuODM4LTE3Mi45MjZDNDM3LjIwOSw3MzguOTY4LDQzMC4zMzcsNzEzLjMyNSw0MTAuMjgzLDcwMS43NDd6IE05NzAuOTg3LDQ3OS41NjcNCgkJCUg3NzEuMzEyYy0yMy4xNTYsMC00MS45MywxOC43NzQtNDEuOTMsNDEuOTNjMCwyMy4xNTUsMTguNzczLDQxLjkyOSw0MS45Myw0MS45MjloMTk5LjY3NmMyMy4xNTYsMCw0MS45My0xOC43NzMsNDEuOTMtNDEuOTI5DQoJCQlDMTAxMi45MTcsNDk4LjM0MSw5OTQuMTQ0LDQ3OS41NjcsOTcwLjk4Nyw0NzkuNTY3eiBNNjY5LjQxLDcxNy4wOTNjLTExLjU3OS0yMC4wNTQtMzcuMjIzLTI2LjkyNS01Ny4yNzYtMTUuMzQ2DQoJCQljLTIwLjA1NCwxMS41NzgtMjYuOTI1LDM3LjIyMS0xNS4zNDgsNTcuMjc0bDk5LjgzOCwxNzIuOTI2YzExLjU4LDIwLjA1NSwzNy4yMjQsMjYuOTI3LDU3LjI3NiwxNS4zNDkNCgkJCWMyMC4wNTYtMTEuNTc5LDI2LjkyNi0zNy4yMjQsMTUuMzQ4LTU3LjI3OEw2NjkuNDEsNzE3LjA5M3ogTTkyNy42NTQsNzEzLjA1bC0xNzIuOTI1LTk5LjgzOA0KCQkJYy0yMC4wNTUtMTEuNTc4LTQ1LjY5Ni00LjcwOC01Ny4yNzgsMTUuMzQ4Yy0xMS41NzYsMjAuMDU0LTQuNzA2LDQ1LjY5NiwxNS4zNSw1Ny4yNzZsMTcyLjkyNCw5OS44MzgNCgkJCWMyMC4wNTUsMTEuNTc3LDQ1LjY5OSw0LjcwNyw1Ny4yNzYtMTUuMzQ4Qzk1NC41NzksNzUwLjI3Myw5NDcuNzA4LDcyNC42MjksOTI3LjY1NCw3MTMuMDV6IE03MDkuMzQyLDQxMC44OTENCgkJCWMxMS41NzgsMjAuMDU1LDM3LjIyMSwyNi45MjYsNTcuMjc1LDE1LjM0N0w5MzkuNTQyLDMyNi40YzIwLjA1NC0xMS41NzgsMjYuOTI1LTM3LjIyMiwxNS4zNDktNTcuMjc2DQoJCQljLTExLjU3OC0yMC4wNTYtMzcuMjI1LTI2LjkyNy01Ny4yNzgtMTUuMzQ4bC0xNzIuOTI2LDk5LjgzOEM3MDQuNjM0LDM2NS4xOTIsNjk3Ljc2MiwzOTAuODM3LDcwOS4zNDIsNDEwLjg5MXogTTYzNS40ODgsMzM0LjI0OA0KCQkJYzIwLjA1NSwxMS41OCw0NS42OTgsNC43MDgsNTcuMjc2LTE1LjM0N2w5OS44MzgtMTcyLjkyM2MxMS41NzktMjAuMDU1LDQuNzA3LTQ1LjY5OC0xNS4zNDctNTcuMjc3DQoJCQljLTIwLjA1NS0xMS41NzgtNDUuNjk2LTQuNzA3LTU3LjI3NywxNS4zNDhsLTk5LjgzOCwxNzIuOTI0QzYwOC41NjIsMjk3LjAyNyw2MTUuNDM0LDMyMi42Nyw2MzUuNDg4LDMzNC4yNDh6Ii8%2BDQoJPC9nPg0KPC9nPg0KPC9zdmc%2BDQo%3D";
		frames[5].src = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4xLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI%2BDQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAyNCAxMDI0IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzFfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjI2Mi41MTU2IiB5MT0iNzguNjgwMiIgeDI9Ijc2MS40ODI5IiB5Mj0iOTQyLjkxNjkiPg0KCQkJPHN0b3AgIG9mZnNldD0iMC4zNCIgc3R5bGU9InN0b3AtY29sb3I6IzAwMDAwMDtzdG9wLW9wYWNpdHk6MC41Ii8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjM3MTIiIHN0eWxlPSJzdG9wLWNvbG9yOiMwNjA2MDY7c3RvcC1vcGFjaXR5OjAuNTQ3NSIvPg0KCQkJPHN0b3AgIG9mZnNldD0iMC40MTIyIiBzdHlsZT0ic3RvcC1jb2xvcjojMTYxNjE2O3N0b3Atb3BhY2l0eTowLjYwOTgiLz4NCgkJCTxzdG9wICBvZmZzZXQ9IjAuNDU4NSIgc3R5bGU9InN0b3AtY29sb3I6IzMxMzEzMTtzdG9wLW9wYWNpdHk6MC42ODAyIi8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjUwODgiIHN0eWxlPSJzdG9wLWNvbG9yOiM1NzU3NTc7c3RvcC1vcGFjaXR5OjAuNzU2NyIvPg0KCQkJPHN0b3AgIG9mZnNldD0iMC41NjIzIiBzdHlsZT0ic3RvcC1jb2xvcjojODg4ODg4O3N0b3Atb3BhY2l0eTowLjgzODEiLz4NCgkJCTxzdG9wICBvZmZzZXQ9IjAuNjE3NSIgc3R5bGU9InN0b3AtY29sb3I6I0MyQzJDMjtzdG9wLW9wYWNpdHk6MC45MjIxIi8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjY2ODciIHN0eWxlPSJzdG9wLWNvbG9yOiNGRkZGRkYiLz4NCgkJPC9saW5lYXJHcmFkaWVudD4NCgkJPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9InVybCgjU1ZHSURfMV8pIiBkPSJNMjkzLjAzNSw1MjEuNDk3YzAtMjMuMTU2LTE4Ljc3Mi00MS45My00MS45MjktNDEuOTMNCgkJCUg1MS40MjljLTIzLjE1NywwLTQxLjkyOSwxOC43NzQtNDEuOTI5LDQxLjkzYzAsMjMuMTU1LDE4Ljc3Miw0MS45MjksNDEuOTI5LDQxLjkyOWgxOTkuNjc3DQoJCQlDMjc0LjI2Miw1NjMuNDI2LDI5My4wMzUsNTQ0LjY1MiwyOTMuMDM1LDUyMS40OTd6IE01MTYuNjE3LDcyMi42NDFjLTIzLjE1NywwLTQxLjkyOSwxOC43NzMtNDEuOTI5LDQxLjkyOXYxOTkuNjc2DQoJCQljMCwyMy4xNTUsMTguNzcyLDQxLjkyOSw0MS45MjksNDEuOTI5YzIzLjE1OCwwLDQxLjkzLTE4Ljc3Myw0MS45My00MS45MjlWNzY0LjU2OQ0KCQkJQzU1OC41NDcsNzQxLjQxNCw1MzkuNzc1LDcyMi42NDEsNTE2LjYxNyw3MjIuNjQxeiBNNTE2LjYxNywxMy41NzVjLTIzLjE1NywwLTQxLjkyOSwxOC43NzItNDEuOTI5LDQxLjkyOXYxOTkuNjc3DQoJCQljMCwyMy4xNTcsMTguNzcyLDQxLjkyOSw0MS45MjksNDEuOTI5YzIzLjE1OCwwLDQxLjkzLTE4Ljc3Miw0MS45My00MS45MjlWNTUuNTA0QzU1OC41NDcsMzIuMzQ4LDUzOS43NzUsMTMuNTc1LDUxNi42MTcsMTMuNTc1eg0KCQkJIE0zMjQuOTYzLDYyOC41NmMtMTEuNTc5LTIwLjA1Ni0zNy4yMjEtMjYuOTI2LTU3LjI3Ni0xNS4zNDhMOTQuNzYzLDcxMy4wNWMtMjAuMDU1LDExLjU3OS0yNi45MjYsMzcuMjI0LTE1LjM0OCw1Ny4yNzYNCgkJCWMxMS41NzgsMjAuMDU1LDM3LjIyMiwyNi45MjUsNTcuMjc2LDE1LjM0OGwxNzIuOTI1LTk5LjgzOEMzMjkuNjcsNjc0LjI1NiwzMzYuNTQyLDY0OC42MTMsMzI0Ljk2Myw2MjguNTZ6IE04Mi44NzUsMzIzLjkyMQ0KCQkJbDE3Mi45MjQsOTkuODM4YzIwLjA1NCwxMS41NzksNDUuNjk3LDQuNzA4LDU3LjI3Ny0xNS4zNDdjMTEuNTc3LTIwLjA1NCw0LjcwNi00NS42OTktMTUuMzQ4LTU3LjI3NmwtMTcyLjkyNC05OS44MzgNCgkJCWMtMjAuMDU1LTExLjU4LTQ1LjY5OS00LjcwOC01Ny4yNzcsMTUuMzQ3QzU1Ljk0OCwyODYuNjk5LDYyLjgxOSwzMTIuMzQyLDgyLjg3NSwzMjMuOTIxeiBNMzI5LjY1MiwzMTguOQ0KCQkJYzExLjU3OCwyMC4wNTYsMzcuMjIzLDI2LjkyNyw1Ny4yNzcsMTUuMzQ3YzIwLjA1NS0xMS41NzgsMjYuOTI2LTM3LjIyMSwxNS4zNDYtNTcuMjc2bC05OS44MzgtMTcyLjkyNA0KCQkJYy0xMS41NzgtMjAuMDU1LTM3LjIyMS0yNi45MjYtNTcuMjc1LTE1LjM0OGMtMjAuMDU2LDExLjU3OS0yNi45MjcsMzcuMjIzLTE1LjM0OCw1Ny4yNzdMMzI5LjY1MiwzMTguOXogTTQxMC4yODMsNzAxLjc0Nw0KCQkJYy0yMC4wNTQtMTEuNTc5LTQ1LjY5OS00LjcwOC01Ny4yNzcsMTUuMzQ2bC05OS44MzgsMTcyLjkyNWMtMTEuNTc4LDIwLjA1NS00LjcwOCw0NS42OTksMTUuMzQ4LDU3LjI3OA0KCQkJYzIwLjA1NCwxMS41NzgsNDUuNjk4LDQuNzA2LDU3LjI3NS0xNS4zNDlsOTkuODM4LTE3Mi45MjZDNDM3LjIwOSw3MzguOTY4LDQzMC4zMzcsNzEzLjMyNSw0MTAuMjgzLDcwMS43NDd6IE05NzAuOTg3LDQ3OS41NjcNCgkJCUg3NzEuMzEyYy0yMy4xNTYsMC00MS45MywxOC43NzQtNDEuOTMsNDEuOTNjMCwyMy4xNTUsMTguNzczLDQxLjkyOSw0MS45Myw0MS45MjloMTk5LjY3NmMyMy4xNTYsMCw0MS45My0xOC43NzMsNDEuOTMtNDEuOTI5DQoJCQlDMTAxMi45MTcsNDk4LjM0MSw5OTQuMTQ0LDQ3OS41NjcsOTcwLjk4Nyw0NzkuNTY3eiBNNjY5LjQxLDcxNy4wOTNjLTExLjU3OS0yMC4wNTQtMzcuMjIzLTI2LjkyNS01Ny4yNzYtMTUuMzQ2DQoJCQljLTIwLjA1NCwxMS41NzgtMjYuOTI1LDM3LjIyMS0xNS4zNDgsNTcuMjc0bDk5LjgzOCwxNzIuOTI2YzExLjU4LDIwLjA1NSwzNy4yMjQsMjYuOTI3LDU3LjI3NiwxNS4zNDkNCgkJCWMyMC4wNTYtMTEuNTc5LDI2LjkyNi0zNy4yMjQsMTUuMzQ4LTU3LjI3OEw2NjkuNDEsNzE3LjA5M3ogTTkyNy42NTQsNzEzLjA1bC0xNzIuOTI1LTk5LjgzOA0KCQkJYy0yMC4wNTUtMTEuNTc4LTQ1LjY5Ni00LjcwOC01Ny4yNzgsMTUuMzQ4Yy0xMS41NzYsMjAuMDU0LTQuNzA2LDQ1LjY5NiwxNS4zNSw1Ny4yNzZsMTcyLjkyNCw5OS44MzgNCgkJCWMyMC4wNTUsMTEuNTc3LDQ1LjY5OSw0LjcwNyw1Ny4yNzYtMTUuMzQ4Qzk1NC41NzksNzUwLjI3Myw5NDcuNzA4LDcyNC42MjksOTI3LjY1NCw3MTMuMDV6IE03MDkuMzQyLDQxMC44OTENCgkJCWMxMS41NzgsMjAuMDU1LDM3LjIyMSwyNi45MjYsNTcuMjc1LDE1LjM0N0w5MzkuNTQyLDMyNi40YzIwLjA1NC0xMS41NzgsMjYuOTI1LTM3LjIyMiwxNS4zNDktNTcuMjc2DQoJCQljLTExLjU3OC0yMC4wNTYtMzcuMjI1LTI2LjkyNy01Ny4yNzgtMTUuMzQ4bC0xNzIuOTI2LDk5LjgzOEM3MDQuNjM0LDM2NS4xOTIsNjk3Ljc2MiwzOTAuODM3LDcwOS4zNDIsNDEwLjg5MXogTTYzNS40ODgsMzM0LjI0OA0KCQkJYzIwLjA1NSwxMS41OCw0NS42OTgsNC43MDgsNTcuMjc2LTE1LjM0N2w5OS44MzgtMTcyLjkyM2MxMS41NzktMjAuMDU1LDQuNzA3LTQ1LjY5OC0xNS4zNDctNTcuMjc3DQoJCQljLTIwLjA1NS0xMS41NzgtNDUuNjk2LTQuNzA3LTU3LjI3NywxNS4zNDhsLTk5LjgzOCwxNzIuOTI0QzYwOC41NjIsMjk3LjAyNyw2MTUuNDM0LDMyMi42Nyw2MzUuNDg4LDMzNC4yNDh6Ii8%2BDQoJPC9nPg0KPC9nPg0KPC9zdmc%2BDQo%3D";
		frames[6].src = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4xLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI%2BDQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAyNCAxMDI0IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzFfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjU5OC4zNDI4IiB5MT0iMjcuMzMxMSIgeDI9IjQyOC4zNzQ4IiB5Mj0iOTkxLjI2NzQiPg0KCQkJPHN0b3AgIG9mZnNldD0iMC4zNCIgc3R5bGU9InN0b3AtY29sb3I6IzAwMDAwMDtzdG9wLW9wYWNpdHk6MC41Ii8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjM3MTIiIHN0eWxlPSJzdG9wLWNvbG9yOiMwNjA2MDY7c3RvcC1vcGFjaXR5OjAuNTQ3NSIvPg0KCQkJPHN0b3AgIG9mZnNldD0iMC40MTIyIiBzdHlsZT0ic3RvcC1jb2xvcjojMTYxNjE2O3N0b3Atb3BhY2l0eTowLjYwOTgiLz4NCgkJCTxzdG9wICBvZmZzZXQ9IjAuNDU4NSIgc3R5bGU9InN0b3AtY29sb3I6IzMxMzEzMTtzdG9wLW9wYWNpdHk6MC42ODAyIi8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjUwODgiIHN0eWxlPSJzdG9wLWNvbG9yOiM1NzU3NTc7c3RvcC1vcGFjaXR5OjAuNzU2NyIvPg0KCQkJPHN0b3AgIG9mZnNldD0iMC41NjIzIiBzdHlsZT0ic3RvcC1jb2xvcjojODg4ODg4O3N0b3Atb3BhY2l0eTowLjgzODEiLz4NCgkJCTxzdG9wICBvZmZzZXQ9IjAuNjE3NSIgc3R5bGU9InN0b3AtY29sb3I6I0MyQzJDMjtzdG9wLW9wYWNpdHk6MC45MjIxIi8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjY2ODciIHN0eWxlPSJzdG9wLWNvbG9yOiNGRkZGRkYiLz4NCgkJPC9saW5lYXJHcmFkaWVudD4NCgkJPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9InVybCgjU1ZHSURfMV8pIiBkPSJNMjkzLjAzNSw1MjEuNDk3YzAtMjMuMTU2LTE4Ljc3Mi00MS45My00MS45MjktNDEuOTMNCgkJCUg1MS40MjljLTIzLjE1NywwLTQxLjkyOSwxOC43NzQtNDEuOTI5LDQxLjkzYzAsMjMuMTU1LDE4Ljc3Miw0MS45MjksNDEuOTI5LDQxLjkyOWgxOTkuNjc3DQoJCQlDMjc0LjI2Miw1NjMuNDI2LDI5My4wMzUsNTQ0LjY1MiwyOTMuMDM1LDUyMS40OTd6IE01MTYuNjE3LDcyMi42NDFjLTIzLjE1NywwLTQxLjkyOSwxOC43NzMtNDEuOTI5LDQxLjkyOXYxOTkuNjc2DQoJCQljMCwyMy4xNTUsMTguNzcyLDQxLjkyOSw0MS45MjksNDEuOTI5YzIzLjE1OCwwLDQxLjkzLTE4Ljc3Myw0MS45My00MS45MjlWNzY0LjU2OQ0KCQkJQzU1OC41NDcsNzQxLjQxNCw1MzkuNzc1LDcyMi42NDEsNTE2LjYxNyw3MjIuNjQxeiBNNTE2LjYxNywxMy41NzVjLTIzLjE1NywwLTQxLjkyOSwxOC43NzItNDEuOTI5LDQxLjkyOXYxOTkuNjc3DQoJCQljMCwyMy4xNTcsMTguNzcyLDQxLjkyOSw0MS45MjksNDEuOTI5YzIzLjE1OCwwLDQxLjkzLTE4Ljc3Miw0MS45My00MS45MjlWNTUuNTA0QzU1OC41NDcsMzIuMzQ4LDUzOS43NzUsMTMuNTc1LDUxNi42MTcsMTMuNTc1eg0KCQkJIE0zMjQuOTYzLDYyOC41NmMtMTEuNTc5LTIwLjA1Ni0zNy4yMjEtMjYuOTI2LTU3LjI3Ni0xNS4zNDhMOTQuNzYzLDcxMy4wNWMtMjAuMDU1LDExLjU3OS0yNi45MjYsMzcuMjI0LTE1LjM0OCw1Ny4yNzYNCgkJCWMxMS41NzgsMjAuMDU1LDM3LjIyMiwyNi45MjUsNTcuMjc2LDE1LjM0OGwxNzIuOTI1LTk5LjgzOEMzMjkuNjcsNjc0LjI1NiwzMzYuNTQyLDY0OC42MTMsMzI0Ljk2Myw2MjguNTZ6IE04Mi44NzUsMzIzLjkyMQ0KCQkJbDE3Mi45MjQsOTkuODM4YzIwLjA1NCwxMS41NzksNDUuNjk3LDQuNzA4LDU3LjI3Ny0xNS4zNDdjMTEuNTc3LTIwLjA1NCw0LjcwNi00NS42OTktMTUuMzQ4LTU3LjI3NmwtMTcyLjkyNC05OS44MzgNCgkJCWMtMjAuMDU1LTExLjU4LTQ1LjY5OS00LjcwOC01Ny4yNzcsMTUuMzQ3QzU1Ljk0OCwyODYuNjk5LDYyLjgxOSwzMTIuMzQyLDgyLjg3NSwzMjMuOTIxeiBNMzI5LjY1MiwzMTguOQ0KCQkJYzExLjU3OCwyMC4wNTYsMzcuMjIzLDI2LjkyNyw1Ny4yNzcsMTUuMzQ3YzIwLjA1NS0xMS41NzgsMjYuOTI2LTM3LjIyMSwxNS4zNDYtNTcuMjc2bC05OS44MzgtMTcyLjkyNA0KCQkJYy0xMS41NzgtMjAuMDU1LTM3LjIyMS0yNi45MjYtNTcuMjc1LTE1LjM0OGMtMjAuMDU2LDExLjU3OS0yNi45MjcsMzcuMjIzLTE1LjM0OCw1Ny4yNzdMMzI5LjY1MiwzMTguOXogTTQxMC4yODMsNzAxLjc0Nw0KCQkJYy0yMC4wNTQtMTEuNTc5LTQ1LjY5OS00LjcwOC01Ny4yNzcsMTUuMzQ2bC05OS44MzgsMTcyLjkyNWMtMTEuNTc4LDIwLjA1NS00LjcwOCw0NS42OTksMTUuMzQ4LDU3LjI3OA0KCQkJYzIwLjA1NCwxMS41NzgsNDUuNjk4LDQuNzA2LDU3LjI3NS0xNS4zNDlsOTkuODM4LTE3Mi45MjZDNDM3LjIwOSw3MzguOTY4LDQzMC4zMzcsNzEzLjMyNSw0MTAuMjgzLDcwMS43NDd6IE05NzAuOTg3LDQ3OS41NjcNCgkJCUg3NzEuMzEyYy0yMy4xNTYsMC00MS45MywxOC43NzQtNDEuOTMsNDEuOTNjMCwyMy4xNTUsMTguNzczLDQxLjkyOSw0MS45Myw0MS45MjloMTk5LjY3NmMyMy4xNTYsMCw0MS45My0xOC43NzMsNDEuOTMtNDEuOTI5DQoJCQlDMTAxMi45MTcsNDk4LjM0MSw5OTQuMTQ0LDQ3OS41NjcsOTcwLjk4Nyw0NzkuNTY3eiBNNjY5LjQxLDcxNy4wOTNjLTExLjU3OS0yMC4wNTQtMzcuMjIzLTI2LjkyNS01Ny4yNzYtMTUuMzQ2DQoJCQljLTIwLjA1NCwxMS41NzgtMjYuOTI1LDM3LjIyMS0xNS4zNDgsNTcuMjc0bDk5LjgzOCwxNzIuOTI2YzExLjU4LDIwLjA1NSwzNy4yMjQsMjYuOTI3LDU3LjI3NiwxNS4zNDkNCgkJCWMyMC4wNTYtMTEuNTc5LDI2LjkyNi0zNy4yMjQsMTUuMzQ4LTU3LjI3OEw2NjkuNDEsNzE3LjA5M3ogTTkyNy42NTQsNzEzLjA1bC0xNzIuOTI1LTk5LjgzOA0KCQkJYy0yMC4wNTUtMTEuNTc4LTQ1LjY5Ni00LjcwOC01Ny4yNzgsMTUuMzQ4Yy0xMS41NzYsMjAuMDU0LTQuNzA2LDQ1LjY5NiwxNS4zNSw1Ny4yNzZsMTcyLjkyNCw5OS44MzgNCgkJCWMyMC4wNTUsMTEuNTc3LDQ1LjY5OSw0LjcwNyw1Ny4yNzYtMTUuMzQ4Qzk1NC41NzksNzUwLjI3Myw5NDcuNzA4LDcyNC42MjksOTI3LjY1NCw3MTMuMDV6IE03MDkuMzQyLDQxMC44OTENCgkJCWMxMS41NzgsMjAuMDU1LDM3LjIyMSwyNi45MjYsNTcuMjc1LDE1LjM0N0w5MzkuNTQyLDMyNi40YzIwLjA1NC0xMS41NzgsMjYuOTI1LTM3LjIyMiwxNS4zNDktNTcuMjc2DQoJCQljLTExLjU3OC0yMC4wNTYtMzcuMjI1LTI2LjkyNy01Ny4yNzgtMTUuMzQ4bC0xNzIuOTI2LDk5LjgzOEM3MDQuNjM0LDM2NS4xOTIsNjk3Ljc2MiwzOTAuODM3LDcwOS4zNDIsNDEwLjg5MXogTTYzNS40ODgsMzM0LjI0OA0KCQkJYzIwLjA1NSwxMS41OCw0NS42OTgsNC43MDgsNTcuMjc2LTE1LjM0N2w5OS44MzgtMTcyLjkyM2MxMS41NzktMjAuMDU1LDQuNzA3LTQ1LjY5OC0xNS4zNDctNTcuMjc3DQoJCQljLTIwLjA1NS0xMS41NzgtNDUuNjk2LTQuNzA3LTU3LjI3NywxNS4zNDhsLTk5LjgzOCwxNzIuOTI0QzYwOC41NjIsMjk3LjAyNyw2MTUuNDM0LDMyMi42Nyw2MzUuNDg4LDMzNC4yNDh6Ii8%2BDQoJPC9nPg0KPC9nPg0KPC9zdmc%2BDQo%3D";
		frames[7].src = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4xLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI%2BDQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAyNCAxMDI0IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzFfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9Ijc1OS4zNjQzIiB5MT0iNzguMzcwMSIgeDI9IjI2MC4zOTYyIiB5Mj0iOTQyLjYwOCI%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjM0IiBzdHlsZT0ic3RvcC1jb2xvcjojMDAwMDAwO3N0b3Atb3BhY2l0eTowLjUiLz4NCgkJCTxzdG9wICBvZmZzZXQ9IjAuMzcxMiIgc3R5bGU9InN0b3AtY29sb3I6IzA2MDYwNjtzdG9wLW9wYWNpdHk6MC41NDc1Ii8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjQxMjIiIHN0eWxlPSJzdG9wLWNvbG9yOiMxNjE2MTY7c3RvcC1vcGFjaXR5OjAuNjA5OCIvPg0KCQkJPHN0b3AgIG9mZnNldD0iMC40NTg1IiBzdHlsZT0ic3RvcC1jb2xvcjojMzEzMTMxO3N0b3Atb3BhY2l0eTowLjY4MDIiLz4NCgkJCTxzdG9wICBvZmZzZXQ9IjAuNTA4OCIgc3R5bGU9InN0b3AtY29sb3I6IzU3NTc1NztzdG9wLW9wYWNpdHk6MC43NTY3Ii8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjU2MjMiIHN0eWxlPSJzdG9wLWNvbG9yOiM4ODg4ODg7c3RvcC1vcGFjaXR5OjAuODM4MSIvPg0KCQkJPHN0b3AgIG9mZnNldD0iMC42MTc1IiBzdHlsZT0ic3RvcC1jb2xvcjojQzJDMkMyO3N0b3Atb3BhY2l0eTowLjkyMjEiLz4NCgkJCTxzdG9wICBvZmZzZXQ9IjAuNjY4NyIgc3R5bGU9InN0b3AtY29sb3I6I0ZGRkZGRiIvPg0KCQk8L2xpbmVhckdyYWRpZW50Pg0KCQk8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZmlsbD0idXJsKCNTVkdJRF8xXykiIGQ9Ik0yOTMuMDM1LDUyMS40OTdjMC0yMy4xNTYtMTguNzcyLTQxLjkzLTQxLjkyOS00MS45Mw0KCQkJSDUxLjQyOWMtMjMuMTU3LDAtNDEuOTI5LDE4Ljc3NC00MS45MjksNDEuOTNjMCwyMy4xNTUsMTguNzcyLDQxLjkyOSw0MS45MjksNDEuOTI5aDE5OS42NzcNCgkJCUMyNzQuMjYyLDU2My40MjYsMjkzLjAzNSw1NDQuNjUyLDI5My4wMzUsNTIxLjQ5N3ogTTUxNi42MTcsNzIyLjY0MWMtMjMuMTU3LDAtNDEuOTI5LDE4Ljc3My00MS45MjksNDEuOTI5djE5OS42NzYNCgkJCWMwLDIzLjE1NSwxOC43NzIsNDEuOTI5LDQxLjkyOSw0MS45MjljMjMuMTU4LDAsNDEuOTMtMTguNzczLDQxLjkzLTQxLjkyOVY3NjQuNTY5DQoJCQlDNTU4LjU0Nyw3NDEuNDE0LDUzOS43NzUsNzIyLjY0MSw1MTYuNjE3LDcyMi42NDF6IE01MTYuNjE3LDEzLjU3NWMtMjMuMTU3LDAtNDEuOTI5LDE4Ljc3Mi00MS45MjksNDEuOTI5djE5OS42NzcNCgkJCWMwLDIzLjE1NywxOC43NzIsNDEuOTI5LDQxLjkyOSw0MS45MjljMjMuMTU4LDAsNDEuOTMtMTguNzcyLDQxLjkzLTQxLjkyOVY1NS41MDRDNTU4LjU0NywzMi4zNDgsNTM5Ljc3NSwxMy41NzUsNTE2LjYxNywxMy41NzV6DQoJCQkgTTMyNC45NjMsNjI4LjU2Yy0xMS41NzktMjAuMDU2LTM3LjIyMS0yNi45MjYtNTcuMjc2LTE1LjM0OEw5NC43NjMsNzEzLjA1Yy0yMC4wNTUsMTEuNTc5LTI2LjkyNiwzNy4yMjQtMTUuMzQ4LDU3LjI3Ng0KCQkJYzExLjU3OCwyMC4wNTUsMzcuMjIyLDI2LjkyNSw1Ny4yNzYsMTUuMzQ4bDE3Mi45MjUtOTkuODM4QzMyOS42Nyw2NzQuMjU2LDMzNi41NDIsNjQ4LjYxMywzMjQuOTYzLDYyOC41NnogTTgyLjg3NSwzMjMuOTIxDQoJCQlsMTcyLjkyNCw5OS44MzhjMjAuMDU0LDExLjU3OSw0NS42OTcsNC43MDgsNTcuMjc3LTE1LjM0N2MxMS41NzctMjAuMDU0LDQuNzA2LTQ1LjY5OS0xNS4zNDgtNTcuMjc2bC0xNzIuOTI0LTk5LjgzOA0KCQkJYy0yMC4wNTUtMTEuNTgtNDUuNjk5LTQuNzA4LTU3LjI3NywxNS4zNDdDNTUuOTQ4LDI4Ni42OTksNjIuODE5LDMxMi4zNDIsODIuODc1LDMyMy45MjF6IE0zMjkuNjUyLDMxOC45DQoJCQljMTEuNTc4LDIwLjA1NiwzNy4yMjMsMjYuOTI3LDU3LjI3NywxNS4zNDdjMjAuMDU1LTExLjU3OCwyNi45MjYtMzcuMjIxLDE1LjM0Ni01Ny4yNzZsLTk5LjgzOC0xNzIuOTI0DQoJCQljLTExLjU3OC0yMC4wNTUtMzcuMjIxLTI2LjkyNi01Ny4yNzUtMTUuMzQ4Yy0yMC4wNTYsMTEuNTc5LTI2LjkyNywzNy4yMjMtMTUuMzQ4LDU3LjI3N0wzMjkuNjUyLDMxOC45eiBNNDEwLjI4Myw3MDEuNzQ3DQoJCQljLTIwLjA1NC0xMS41NzktNDUuNjk5LTQuNzA4LTU3LjI3NywxNS4zNDZsLTk5LjgzOCwxNzIuOTI1Yy0xMS41NzgsMjAuMDU1LTQuNzA4LDQ1LjY5OSwxNS4zNDgsNTcuMjc4DQoJCQljMjAuMDU0LDExLjU3OCw0NS42OTgsNC43MDYsNTcuMjc1LTE1LjM0OWw5OS44MzgtMTcyLjkyNkM0MzcuMjA5LDczOC45NjgsNDMwLjMzNyw3MTMuMzI1LDQxMC4yODMsNzAxLjc0N3ogTTk3MC45ODcsNDc5LjU2Nw0KCQkJSDc3MS4zMTJjLTIzLjE1NiwwLTQxLjkzLDE4Ljc3NC00MS45Myw0MS45M2MwLDIzLjE1NSwxOC43NzMsNDEuOTI5LDQxLjkzLDQxLjkyOWgxOTkuNjc2YzIzLjE1NiwwLDQxLjkzLTE4Ljc3Myw0MS45My00MS45MjkNCgkJCUMxMDEyLjkxNyw0OTguMzQxLDk5NC4xNDQsNDc5LjU2Nyw5NzAuOTg3LDQ3OS41Njd6IE02NjkuNDEsNzE3LjA5M2MtMTEuNTc5LTIwLjA1NC0zNy4yMjMtMjYuOTI1LTU3LjI3Ni0xNS4zNDYNCgkJCWMtMjAuMDU0LDExLjU3OC0yNi45MjUsMzcuMjIxLTE1LjM0OCw1Ny4yNzRsOTkuODM4LDE3Mi45MjZjMTEuNTgsMjAuMDU1LDM3LjIyNCwyNi45MjcsNTcuMjc2LDE1LjM0OQ0KCQkJYzIwLjA1Ni0xMS41NzksMjYuOTI2LTM3LjIyNCwxNS4zNDgtNTcuMjc4TDY2OS40MSw3MTcuMDkzeiBNOTI3LjY1NCw3MTMuMDVsLTE3Mi45MjUtOTkuODM4DQoJCQljLTIwLjA1NS0xMS41NzgtNDUuNjk2LTQuNzA4LTU3LjI3OCwxNS4zNDhjLTExLjU3NiwyMC4wNTQtNC43MDYsNDUuNjk2LDE1LjM1LDU3LjI3NmwxNzIuOTI0LDk5LjgzOA0KCQkJYzIwLjA1NSwxMS41NzcsNDUuNjk5LDQuNzA3LDU3LjI3Ni0xNS4zNDhDOTU0LjU3OSw3NTAuMjczLDk0Ny43MDgsNzI0LjYyOSw5MjcuNjU0LDcxMy4wNXogTTcwOS4zNDIsNDEwLjg5MQ0KCQkJYzExLjU3OCwyMC4wNTUsMzcuMjIxLDI2LjkyNiw1Ny4yNzUsMTUuMzQ3TDkzOS41NDIsMzI2LjRjMjAuMDU0LTExLjU3OCwyNi45MjUtMzcuMjIyLDE1LjM0OS01Ny4yNzYNCgkJCWMtMTEuNTc4LTIwLjA1Ni0zNy4yMjUtMjYuOTI3LTU3LjI3OC0xNS4zNDhsLTE3Mi45MjYsOTkuODM4QzcwNC42MzQsMzY1LjE5Miw2OTcuNzYyLDM5MC44MzcsNzA5LjM0Miw0MTAuODkxeiBNNjM1LjQ4OCwzMzQuMjQ4DQoJCQljMjAuMDU1LDExLjU4LDQ1LjY5OCw0LjcwOCw1Ny4yNzYtMTUuMzQ3bDk5LjgzOC0xNzIuOTIzYzExLjU3OS0yMC4wNTUsNC43MDctNDUuNjk4LTE1LjM0Ny01Ny4yNzcNCgkJCWMtMjAuMDU1LTExLjU3OC00NS42OTYtNC43MDctNTcuMjc3LDE1LjM0OGwtOTkuODM4LDE3Mi45MjRDNjA4LjU2MiwyOTcuMDI3LDYxNS40MzQsMzIyLjY3LDYzNS40ODgsMzM0LjI0OHoiLz4NCgk8L2c%2BDQo8L2c%2BDQo8L3N2Zz4NCg%3D%3D";
		frames[8].src = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4xLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI%2BDQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAyNCAxMDI0IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzFfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9Ijk4Mi4yMTQ4IiB5MT0iMzQyLjMxNTQiIHgyPSI0Ni44NTcyIiB5Mj0iNjgyLjc1NzYiPg0KCQkJPHN0b3AgIG9mZnNldD0iMC4zNCIgc3R5bGU9InN0b3AtY29sb3I6IzAwMDAwMDtzdG9wLW9wYWNpdHk6MC41Ii8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjM3MTIiIHN0eWxlPSJzdG9wLWNvbG9yOiMwNjA2MDY7c3RvcC1vcGFjaXR5OjAuNTQ3NSIvPg0KCQkJPHN0b3AgIG9mZnNldD0iMC40MTIyIiBzdHlsZT0ic3RvcC1jb2xvcjojMTYxNjE2O3N0b3Atb3BhY2l0eTowLjYwOTgiLz4NCgkJCTxzdG9wICBvZmZzZXQ9IjAuNDU4NSIgc3R5bGU9InN0b3AtY29sb3I6IzMxMzEzMTtzdG9wLW9wYWNpdHk6MC42ODAyIi8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjUwODgiIHN0eWxlPSJzdG9wLWNvbG9yOiM1NzU3NTc7c3RvcC1vcGFjaXR5OjAuNzU2NyIvPg0KCQkJPHN0b3AgIG9mZnNldD0iMC41NjIzIiBzdHlsZT0ic3RvcC1jb2xvcjojODg4ODg4O3N0b3Atb3BhY2l0eTowLjgzODEiLz4NCgkJCTxzdG9wICBvZmZzZXQ9IjAuNjE3NSIgc3R5bGU9InN0b3AtY29sb3I6I0MyQzJDMjtzdG9wLW9wYWNpdHk6MC45MjIxIi8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjY2ODciIHN0eWxlPSJzdG9wLWNvbG9yOiNGRkZGRkYiLz4NCgkJPC9saW5lYXJHcmFkaWVudD4NCgkJPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9InVybCgjU1ZHSURfMV8pIiBkPSJNMjkzLjAzNSw1MjEuNDk3YzAtMjMuMTU2LTE4Ljc3Mi00MS45My00MS45MjktNDEuOTMNCgkJCUg1MS40MjljLTIzLjE1NywwLTQxLjkyOSwxOC43NzQtNDEuOTI5LDQxLjkzYzAsMjMuMTU1LDE4Ljc3Miw0MS45MjksNDEuOTI5LDQxLjkyOWgxOTkuNjc3DQoJCQlDMjc0LjI2Miw1NjMuNDI2LDI5My4wMzUsNTQ0LjY1MiwyOTMuMDM1LDUyMS40OTd6IE01MTYuNjE3LDcyMi42NDFjLTIzLjE1NywwLTQxLjkyOSwxOC43NzMtNDEuOTI5LDQxLjkyOXYxOTkuNjc2DQoJCQljMCwyMy4xNTUsMTguNzcyLDQxLjkyOSw0MS45MjksNDEuOTI5YzIzLjE1OCwwLDQxLjkzLTE4Ljc3Myw0MS45My00MS45MjlWNzY0LjU2OQ0KCQkJQzU1OC41NDcsNzQxLjQxNCw1MzkuNzc1LDcyMi42NDEsNTE2LjYxNyw3MjIuNjQxeiBNNTE2LjYxNywxMy41NzVjLTIzLjE1NywwLTQxLjkyOSwxOC43NzItNDEuOTI5LDQxLjkyOXYxOTkuNjc3DQoJCQljMCwyMy4xNTcsMTguNzcyLDQxLjkyOSw0MS45MjksNDEuOTI5YzIzLjE1OCwwLDQxLjkzLTE4Ljc3Miw0MS45My00MS45MjlWNTUuNTA0QzU1OC41NDcsMzIuMzQ4LDUzOS43NzUsMTMuNTc1LDUxNi42MTcsMTMuNTc1eg0KCQkJIE0zMjQuOTYzLDYyOC41NmMtMTEuNTc5LTIwLjA1Ni0zNy4yMjEtMjYuOTI2LTU3LjI3Ni0xNS4zNDhMOTQuNzYzLDcxMy4wNWMtMjAuMDU1LDExLjU3OS0yNi45MjYsMzcuMjI0LTE1LjM0OCw1Ny4yNzYNCgkJCWMxMS41NzgsMjAuMDU1LDM3LjIyMiwyNi45MjUsNTcuMjc2LDE1LjM0OGwxNzIuOTI1LTk5LjgzOEMzMjkuNjcsNjc0LjI1NiwzMzYuNTQyLDY0OC42MTMsMzI0Ljk2Myw2MjguNTZ6IE04Mi44NzUsMzIzLjkyMQ0KCQkJbDE3Mi45MjQsOTkuODM4YzIwLjA1NCwxMS41NzksNDUuNjk3LDQuNzA4LDU3LjI3Ny0xNS4zNDdjMTEuNTc3LTIwLjA1NCw0LjcwNi00NS42OTktMTUuMzQ4LTU3LjI3NmwtMTcyLjkyNC05OS44MzgNCgkJCWMtMjAuMDU1LTExLjU4LTQ1LjY5OS00LjcwOC01Ny4yNzcsMTUuMzQ3QzU1Ljk0OCwyODYuNjk5LDYyLjgxOSwzMTIuMzQyLDgyLjg3NSwzMjMuOTIxeiBNMzI5LjY1MiwzMTguOQ0KCQkJYzExLjU3OCwyMC4wNTYsMzcuMjIzLDI2LjkyNyw1Ny4yNzcsMTUuMzQ3YzIwLjA1NS0xMS41NzgsMjYuOTI2LTM3LjIyMSwxNS4zNDYtNTcuMjc2bC05OS44MzgtMTcyLjkyNA0KCQkJYy0xMS41NzgtMjAuMDU1LTM3LjIyMS0yNi45MjYtNTcuMjc1LTE1LjM0OGMtMjAuMDU2LDExLjU3OS0yNi45MjcsMzcuMjIzLTE1LjM0OCw1Ny4yNzdMMzI5LjY1MiwzMTguOXogTTQxMC4yODMsNzAxLjc0Nw0KCQkJYy0yMC4wNTQtMTEuNTc5LTQ1LjY5OS00LjcwOC01Ny4yNzcsMTUuMzQ2bC05OS44MzgsMTcyLjkyNWMtMTEuNTc4LDIwLjA1NS00LjcwOCw0NS42OTksMTUuMzQ4LDU3LjI3OA0KCQkJYzIwLjA1NCwxMS41NzgsNDUuNjk4LDQuNzA2LDU3LjI3NS0xNS4zNDlsOTkuODM4LTE3Mi45MjZDNDM3LjIwOSw3MzguOTY4LDQzMC4zMzcsNzEzLjMyNSw0MTAuMjgzLDcwMS43NDd6IE05NzAuOTg3LDQ3OS41NjcNCgkJCUg3NzEuMzEyYy0yMy4xNTYsMC00MS45MywxOC43NzQtNDEuOTMsNDEuOTNjMCwyMy4xNTUsMTguNzczLDQxLjkyOSw0MS45Myw0MS45MjloMTk5LjY3NmMyMy4xNTYsMCw0MS45My0xOC43NzMsNDEuOTMtNDEuOTI5DQoJCQlDMTAxMi45MTcsNDk4LjM0MSw5OTQuMTQ0LDQ3OS41NjcsOTcwLjk4Nyw0NzkuNTY3eiBNNjY5LjQxLDcxNy4wOTNjLTExLjU3OS0yMC4wNTQtMzcuMjIzLTI2LjkyNS01Ny4yNzYtMTUuMzQ2DQoJCQljLTIwLjA1NCwxMS41NzgtMjYuOTI1LDM3LjIyMS0xNS4zNDgsNTcuMjc0bDk5LjgzOCwxNzIuOTI2YzExLjU4LDIwLjA1NSwzNy4yMjQsMjYuOTI3LDU3LjI3NiwxNS4zNDkNCgkJCWMyMC4wNTYtMTEuNTc5LDI2LjkyNi0zNy4yMjQsMTUuMzQ4LTU3LjI3OEw2NjkuNDEsNzE3LjA5M3ogTTkyNy42NTQsNzEzLjA1bC0xNzIuOTI1LTk5LjgzOA0KCQkJYy0yMC4wNTUtMTEuNTc4LTQ1LjY5Ni00LjcwOC01Ny4yNzgsMTUuMzQ4Yy0xMS41NzYsMjAuMDU0LTQuNzA2LDQ1LjY5NiwxNS4zNSw1Ny4yNzZsMTcyLjkyNCw5OS44MzgNCgkJCWMyMC4wNTUsMTEuNTc3LDQ1LjY5OSw0LjcwNyw1Ny4yNzYtMTUuMzQ4Qzk1NC41NzksNzUwLjI3Myw5NDcuNzA4LDcyNC42MjksOTI3LjY1NCw3MTMuMDV6IE03MDkuMzQyLDQxMC44OTENCgkJCWMxMS41NzgsMjAuMDU1LDM3LjIyMSwyNi45MjYsNTcuMjc1LDE1LjM0N0w5MzkuNTQyLDMyNi40YzIwLjA1NC0xMS41NzgsMjYuOTI1LTM3LjIyMiwxNS4zNDktNTcuMjc2DQoJCQljLTExLjU3OC0yMC4wNTYtMzcuMjI1LTI2LjkyNy01Ny4yNzgtMTUuMzQ4bC0xNzIuOTI2LDk5LjgzOEM3MDQuNjM0LDM2NS4xOTIsNjk3Ljc2MiwzOTAuODM3LDcwOS4zNDIsNDEwLjg5MXogTTYzNS40ODgsMzM0LjI0OA0KCQkJYzIwLjA1NSwxMS41OCw0NS42OTgsNC43MDgsNTcuMjc2LTE1LjM0N2w5OS44MzgtMTcyLjkyM2MxMS41NzktMjAuMDU1LDQuNzA3LTQ1LjY5OC0xNS4zNDctNTcuMjc3DQoJCQljLTIwLjA1NS0xMS41NzgtNDUuNjk2LTQuNzA3LTU3LjI3NywxNS4zNDhsLTk5LjgzOCwxNzIuOTI0QzYwOC41NjIsMjk3LjAyNyw2MTUuNDM0LDMyMi42Nyw2MzUuNDg4LDMzNC4yNDh6Ii8%2BDQoJPC9nPg0KPC9nPg0KPC9zdmc%2BDQo%3D";
		frames[9].src = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4xLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI%2BDQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAyNCAxMDI0IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzFfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjEwMTIuOTE3IiB5MT0iNTA5Ljg3NSIgeDI9IjkuNDk5NSIgeTI9IjUwOS44NzQ5Ij4NCgkJCTxzdG9wICBvZmZzZXQ9IjAuMzQiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDAwMDA7c3RvcC1vcGFjaXR5OjAuNSIvPg0KCQkJPHN0b3AgIG9mZnNldD0iMC4zNzEyIiBzdHlsZT0ic3RvcC1jb2xvcjojMDYwNjA2O3N0b3Atb3BhY2l0eTowLjU0NzUiLz4NCgkJCTxzdG9wICBvZmZzZXQ9IjAuNDEyMiIgc3R5bGU9InN0b3AtY29sb3I6IzE2MTYxNjtzdG9wLW9wYWNpdHk6MC42MDk4Ii8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjQ1ODUiIHN0eWxlPSJzdG9wLWNvbG9yOiMzMTMxMzE7c3RvcC1vcGFjaXR5OjAuNjgwMiIvPg0KCQkJPHN0b3AgIG9mZnNldD0iMC41MDg4IiBzdHlsZT0ic3RvcC1jb2xvcjojNTc1NzU3O3N0b3Atb3BhY2l0eTowLjc1NjciLz4NCgkJCTxzdG9wICBvZmZzZXQ9IjAuNTYyMyIgc3R5bGU9InN0b3AtY29sb3I6Izg4ODg4ODtzdG9wLW9wYWNpdHk6MC44MzgxIi8%2BDQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjYxNzUiIHN0eWxlPSJzdG9wLWNvbG9yOiNDMkMyQzI7c3RvcC1vcGFjaXR5OjAuOTIyMSIvPg0KCQkJPHN0b3AgIG9mZnNldD0iMC42Njg3IiBzdHlsZT0ic3RvcC1jb2xvcjojRkZGRkZGIi8%2BDQoJCTwvbGluZWFyR3JhZGllbnQ%2BDQoJCTxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBmaWxsPSJ1cmwoI1NWR0lEXzFfKSIgZD0iTTI5My4wMzUsNTIxLjQ5N2MwLTIzLjE1Ni0xOC43NzItNDEuOTMtNDEuOTI5LTQxLjkzDQoJCQlINTEuNDI5Yy0yMy4xNTcsMC00MS45MjksMTguNzc0LTQxLjkyOSw0MS45M2MwLDIzLjE1NSwxOC43NzIsNDEuOTI5LDQxLjkyOSw0MS45MjloMTk5LjY3Nw0KCQkJQzI3NC4yNjIsNTYzLjQyNiwyOTMuMDM1LDU0NC42NTIsMjkzLjAzNSw1MjEuNDk3eiBNNTE2LjYxNyw3MjIuNjQxYy0yMy4xNTcsMC00MS45MjksMTguNzczLTQxLjkyOSw0MS45Mjl2MTk5LjY3Ng0KCQkJYzAsMjMuMTU1LDE4Ljc3Miw0MS45MjksNDEuOTI5LDQxLjkyOWMyMy4xNTgsMCw0MS45My0xOC43NzMsNDEuOTMtNDEuOTI5Vjc2NC41NjkNCgkJCUM1NTguNTQ3LDc0MS40MTQsNTM5Ljc3NSw3MjIuNjQxLDUxNi42MTcsNzIyLjY0MXogTTUxNi42MTcsMTMuNTc1Yy0yMy4xNTcsMC00MS45MjksMTguNzcyLTQxLjkyOSw0MS45Mjl2MTk5LjY3Nw0KCQkJYzAsMjMuMTU3LDE4Ljc3Miw0MS45MjksNDEuOTI5LDQxLjkyOWMyMy4xNTgsMCw0MS45My0xOC43NzIsNDEuOTMtNDEuOTI5VjU1LjUwNEM1NTguNTQ3LDMyLjM0OCw1MzkuNzc1LDEzLjU3NSw1MTYuNjE3LDEzLjU3NXoNCgkJCSBNMzI0Ljk2Myw2MjguNTZjLTExLjU3OS0yMC4wNTYtMzcuMjIxLTI2LjkyNi01Ny4yNzYtMTUuMzQ4TDk0Ljc2Myw3MTMuMDVjLTIwLjA1NSwxMS41NzktMjYuOTI2LDM3LjIyNC0xNS4zNDgsNTcuMjc2DQoJCQljMTEuNTc4LDIwLjA1NSwzNy4yMjIsMjYuOTI1LDU3LjI3NiwxNS4zNDhsMTcyLjkyNS05OS44MzhDMzI5LjY3LDY3NC4yNTYsMzM2LjU0Miw2NDguNjEzLDMyNC45NjMsNjI4LjU2eiBNODIuODc1LDMyMy45MjENCgkJCWwxNzIuOTI0LDk5LjgzOGMyMC4wNTQsMTEuNTc5LDQ1LjY5Nyw0LjcwOCw1Ny4yNzctMTUuMzQ3YzExLjU3Ny0yMC4wNTQsNC43MDYtNDUuNjk5LTE1LjM0OC01Ny4yNzZsLTE3Mi45MjQtOTkuODM4DQoJCQljLTIwLjA1NS0xMS41OC00NS42OTktNC43MDgtNTcuMjc3LDE1LjM0N0M1NS45NDgsMjg2LjY5OSw2Mi44MTksMzEyLjM0Miw4Mi44NzUsMzIzLjkyMXogTTMyOS42NTIsMzE4LjkNCgkJCWMxMS41NzgsMjAuMDU2LDM3LjIyMywyNi45MjcsNTcuMjc3LDE1LjM0N2MyMC4wNTUtMTEuNTc4LDI2LjkyNi0zNy4yMjEsMTUuMzQ2LTU3LjI3NmwtOTkuODM4LTE3Mi45MjQNCgkJCWMtMTEuNTc4LTIwLjA1NS0zNy4yMjEtMjYuOTI2LTU3LjI3NS0xNS4zNDhjLTIwLjA1NiwxMS41NzktMjYuOTI3LDM3LjIyMy0xNS4zNDgsNTcuMjc3TDMyOS42NTIsMzE4Ljl6IE00MTAuMjgzLDcwMS43NDcNCgkJCWMtMjAuMDU0LTExLjU3OS00NS42OTktNC43MDgtNTcuMjc3LDE1LjM0NmwtOTkuODM4LDE3Mi45MjVjLTExLjU3OCwyMC4wNTUtNC43MDgsNDUuNjk5LDE1LjM0OCw1Ny4yNzgNCgkJCWMyMC4wNTQsMTEuNTc4LDQ1LjY5OCw0LjcwNiw1Ny4yNzUtMTUuMzQ5bDk5LjgzOC0xNzIuOTI2QzQzNy4yMDksNzM4Ljk2OCw0MzAuMzM3LDcxMy4zMjUsNDEwLjI4Myw3MDEuNzQ3eiBNOTcwLjk4Nyw0NzkuNTY3DQoJCQlINzcxLjMxMmMtMjMuMTU2LDAtNDEuOTMsMTguNzc0LTQxLjkzLDQxLjkzYzAsMjMuMTU1LDE4Ljc3Myw0MS45MjksNDEuOTMsNDEuOTI5aDE5OS42NzZjMjMuMTU2LDAsNDEuOTMtMTguNzczLDQxLjkzLTQxLjkyOQ0KCQkJQzEwMTIuOTE3LDQ5OC4zNDEsOTk0LjE0NCw0NzkuNTY3LDk3MC45ODcsNDc5LjU2N3ogTTY2OS40MSw3MTcuMDkzYy0xMS41NzktMjAuMDU0LTM3LjIyMy0yNi45MjUtNTcuMjc2LTE1LjM0Ng0KCQkJYy0yMC4wNTQsMTEuNTc4LTI2LjkyNSwzNy4yMjEtMTUuMzQ4LDU3LjI3NGw5OS44MzgsMTcyLjkyNmMxMS41OCwyMC4wNTUsMzcuMjI0LDI2LjkyNyw1Ny4yNzYsMTUuMzQ5DQoJCQljMjAuMDU2LTExLjU3OSwyNi45MjYtMzcuMjI0LDE1LjM0OC01Ny4yNzhMNjY5LjQxLDcxNy4wOTN6IE05MjcuNjU0LDcxMy4wNWwtMTcyLjkyNS05OS44MzgNCgkJCWMtMjAuMDU1LTExLjU3OC00NS42OTYtNC43MDgtNTcuMjc4LDE1LjM0OGMtMTEuNTc2LDIwLjA1NC00LjcwNiw0NS42OTYsMTUuMzUsNTcuMjc2bDE3Mi45MjQsOTkuODM4DQoJCQljMjAuMDU1LDExLjU3Nyw0NS42OTksNC43MDcsNTcuMjc2LTE1LjM0OEM5NTQuNTc5LDc1MC4yNzMsOTQ3LjcwOCw3MjQuNjI5LDkyNy42NTQsNzEzLjA1eiBNNzA5LjM0Miw0MTAuODkxDQoJCQljMTEuNTc4LDIwLjA1NSwzNy4yMjEsMjYuOTI2LDU3LjI3NSwxNS4zNDdMOTM5LjU0MiwzMjYuNGMyMC4wNTQtMTEuNTc4LDI2LjkyNS0zNy4yMjIsMTUuMzQ5LTU3LjI3Ng0KCQkJYy0xMS41NzgtMjAuMDU2LTM3LjIyNS0yNi45MjctNTcuMjc4LTE1LjM0OGwtMTcyLjkyNiw5OS44MzhDNzA0LjYzNCwzNjUuMTkyLDY5Ny43NjIsMzkwLjgzNyw3MDkuMzQyLDQxMC44OTF6IE02MzUuNDg4LDMzNC4yNDgNCgkJCWMyMC4wNTUsMTEuNTgsNDUuNjk4LDQuNzA4LDU3LjI3Ni0xNS4zNDdsOTkuODM4LTE3Mi45MjNjMTEuNTc5LTIwLjA1NSw0LjcwNy00NS42OTgtMTUuMzQ3LTU3LjI3Nw0KCQkJYy0yMC4wNTUtMTEuNTc4LTQ1LjY5Ni00LjcwNy01Ny4yNzcsMTUuMzQ4bC05OS44MzgsMTcyLjkyNEM2MDguNTYyLDI5Ny4wMjcsNjE1LjQzNCwzMjIuNjcsNjM1LjQ4OCwzMzQuMjQ4eiIvPg0KCTwvZz4NCjwvZz4NCjwvc3ZnPg0K";
		
		this.mFrames = frames;
		this.mActionQueue = q;
	},
	start: function() {
		if (this.mRunning)
			return;
		
		dispatch_async(this.mActionQueue, function(){
			this.mStartTime = Date.now();
			this.mRunning = true;
			CCAnimFrame(this.drawFrame.bind(this));
		}.bind(this));
	},
	stop: function() {
		this.mRunning = false;
		this.mStartTime = -1;
	},
	drawFrame: function() {
		// if we aren't stopped, request the next frame
		if (this.mRunning)
			CCAnimFrame(this.drawFrame.bind(this));
		
		var size = (this.mSizeInVWs) ? Math.floor(this.mSquareSize / 100 * window.innerWidth) : this.mSquareSize;
		var ctx = document.getCSSCanvasContext('2d', this.mCanvasName, size, size);
		
		// clear it out
		ctx.clearRect(0, 0, size, size);
		
		// determine the correct frame
		var frameIdx = (Math.floor((Date.now() - this.mStartTime) / this.mFrameSpeed) % this.mFrames.length);
		var frame = this.mFrames[frameIdx];
		
		// draw it
		ctx.drawImage(frame, 0, 0, size, size);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.




CC.XcodeServer.BigScreenEntityListView = Class.create(CC.Mvc.View, {
	mClassNames: ['xc-big-screen-list', 'updatingLoupe'],
	mListItemClass: CC.XcodeServer.BigScreenEntityListItemView,
	mDataSource: null,
	mItems: null,
	mAnimating: false,
	mAnimationCallback: null,
	mSelectedItem: -1,
	mSelectedTitle: null,
	mSelectedSubtitle: null,
	mSelectedSubtitleTimestamp: null,
	mSelectedStatusClass: null,
	mSelectedRunning: false,
	mFlashTimer: null,
	mFlashIdx: -1,
	mUpdatingLoupe: true,
	mLoupeGap: 0.0635,	/* vw / 100 */
	mLoupeSpinner: null,
	mSpinner: null,
	render: function() {
		return Builder.node('div', [
			Builder.node('div', {className: 'loupeContainer'}, [
				Builder.node('div', {className: 'loupe'}, [
					Builder.node('div', {className: 'title reltext'}, (this.mSelectedTitle) ? this.mSelectedTitle : ''),
					Builder.node('div', {className: 'subtitle reltext'}, (this.mSelectedSubtitle) ? this.mSelectedSubtitle : ''),
					Builder.node('div', {className: 'sbSpinner'})
				])
			]),
			Builder.node('div', {className: 'itemContainer'}),
			Builder.node('div', {className: 'fade'})
		]);
	},
	initialize: function($super, inOptListItemClass) {
		$super();
		this.mItems = [];
		this.mLoupeSpinner = new CC.XcodeServer.BigScreenSpinner('loupeSpinner', 4, true);
		this.mSpinner = new CC.XcodeServer.BigScreenSpinner('entityListSpinner', 3, true);
		
		if (inOptListItemClass)
			this.setListItemClass(inOptListItemClass);
		
		globalNotificationCenter().subscribe(CC_BS_RESIZE_NOTIFICATION, this.handleResize.bind(this));
		
		// listen for timestamp update notifications
		globalNotificationCenter().subscribe(CC_BS_TIMESTAMP_NOTIFICATION, function(){
			if (this.mSelectedSubtitleTimestamp)
			{
				this.mSelectedSubtitle = globalLocalizationManager().localizedTimeShift(this.mSelectedSubtitleTimestamp);
				this.mParentElement.down('.loupe .subtitle').textContent = this.mSelectedSubtitle;
			}
		}.bind(this));
	},
	setListItemClass: function(inListClass) {
		this.mListItemClass = inListClass;
	},
	setDataSource: function(inDataSource) {
		this.mDataSource = inDataSource;
	},
	itemCapacity: function() {
		// determine how many items fit on screen, other than the loupe item
		var relHeight = this.mListItemClass.prototype.mRelativeHeight;
		var relMargin = this.mListItemClass.prototype.mRelativeMargin;
		var actualHeight = Math.floor(relHeight * window.innerWidth);
		var actualMargin = Math.floor(relMargin * window.innerWidth);
		
		var loupeHeight = Math.floor(this.mLoupeGap * window.innerWidth);
		var totalHeight = this.mParentElement.offsetHeight;
		var availableHeight = totalHeight - loupeHeight;
		
		var maxItems = Math.floor(availableHeight / (actualHeight + actualMargin));
		if (availableHeight - (maxItems * (actualHeight + actualMargin)) >= actualHeight)
			maxItems++;
		
		return maxItems + 1;  // for the one in the loupe
	},
	visibleItemCapacity: function() {	// the number of items actually *drawn* on screen, not just comfortably
		var relHeight = this.mListItemClass.prototype.mRelativeHeight;
		var relMargin = this.mListItemClass.prototype.mRelativeMargin;
		var actualHeight = Math.floor(relHeight * window.innerWidth);
		var actualMargin = Math.floor(relMargin * window.innerWidth);
		
		var loupeHeight = Math.floor(this.mLoupeGap * window.innerWidth);
		var totalHeight = this.mParentElement.offsetHeight;
		var availableHeight = totalHeight - loupeHeight;
		
		var maxItems = Math.ceil(availableHeight / (actualHeight + actualMargin));
		return maxItems + 1;  // for the one in the loupe
		
	},
	onScreenRange: function(inOptUseLimitedCapacity) {
		if (inOptUseLimitedCapacity)
			return [this.mSelectedItem, (this.mSelectedItem + Math.min(this.itemCapacity(), this.mItems.length)) % this.mItems.length];
		else
			return [this.mSelectedItem, (this.mSelectedItem + Math.min(this.visibleItemCapacity(), this.mItems.length)) % this.mItems.length];
	},
	indexInRange: function(inIdx, inRange) {
		if (inRange[0] < inRange[1])
			return (inIdx >= inRange[0] && inIdx < inRange[1]);
		else
			return (inIdx >= inRange[0] || inIdx < inRange[1]);
	},
	indexOnScreen: function(inIdx) {
		return this.indexInRange(inIdx, this.onScreenRange());
	},
	iterateOnScreenItems: function(inIterator) {
		var range = this.onScreenRange();
		var i = range[0];
		var iterCount = 0;
		while (iterCount < this.mItems.length && this.indexInRange(i, range))
		{
			if (this.mItems[i] != null)
				inIterator(this.mItems[i], iterCount, i);
			i = (i + 1) % this.mItems.length;
			iterCount++;
		}
	},
	validateBounds: function() {
		if (this.mDataSource.numberOfItems() > this.itemCapacity())
			this.mParentElement.addClassName('offscreen');
		else
			this.mParentElement.removeClassName('offscreen');
	},
	_beginAnimation: function() {
		if (document.hidden || document.webkitHidden)
			return;
		
		this.mAnimating = true;
		
		var self = this;
		function fixer() {
			self.mParentElement.down('.itemContainer').removeEventListener('webkitTransitionEnd', fixer, false);
			self.mParentElement.down('.itemContainer').removeClassName('animating');
			self.mParentElement.down('.itemContainer').sbAnimationCallback = null;
			self.mAnimating = false;
			
			document.removeEventListener('visibilitychange', fixer, false);
			document.removeEventListener('webkitvisibilitychange', fixer, false);
			
			self.cleanup();
			
			if (self.mAnimationCallback)
			{
				var cb = self.mAnimationCallback;
				self.mAnimationCallback = null;
				cb();
			}
		}
		
		this.mParentElement.down('.itemContainer').addEventListener('webkitTransitionEnd', fixer, false);
		this.mParentElement.down('.itemContainer').addClassName('animating');
		this.mParentElement.down('.itemContainer').sbAnimationCallback = fixer;
		
		document.addEventListener('visibilitychange', fixer, false);
		document.addEventListener('webkitvisibilitychange', fixer, false);
	},
	_cancelAnimation: function() {
		if (this.mParentElement.down('.itemContainer').sbAnimationCallback)
			this.mParentElement.down('.itemContainer').sbAnimationCallback();
	},
	_afterAnimation: function(inCallback) {
		if (this.mAnimating)
			this.mAnimationCallback = inCallback;
		else
			inCallback();
	},
	_renderBreak: function(inAnimating, inCallback) {
		if (inAnimating)
			setTimeout(inCallback, 10);
		else
			inCallback();
	},
	visibleViewIsRunning: function() {
		var screenRange = this.onScreenRange();
		for (var i = 0; i < this.mItems.length; i++)
		{
			if (this.mItems[i] && this.mItems[i].mRunning && this.indexInRange(i, screenRange) && i != this.mSelectedItem)
				return true;
		}
		
		return false;
	},
	updateItem: function(idx, view) {
		var oldView = this.mItems[idx];
		if (oldView != null)
			this.removeSubviews([oldView]);
		this.mItems[idx] = view;
	},
	// view methods
	prepareForIntroduction: function(inOptCallback) {
		this.iterateOnScreenItems(function(item, i, iAbs){
			var offset = i * item.absoluteHeight(true);
			item.mParentElement.style.webkitTransform = 'translate3d(0, ' + offset + 'px, -10px) rotateX(-90deg)';
			item.mParentElement.style.opacity = '0';
		});
		
		// update background image size
		var entityView = this.mSuperview.mParentElement.down('.xc-big-screen-bot-run-entity');
		if (entityView)
			this.mParentElement.down('.loupeContainer').style.backgroundSize = '100% ' + entityView.offsetHeight + 'px';
		
		if (inOptCallback)
			setTimeout(inOptCallback, 10);
	},
	introduce: function(inOptCallback) {
		var q = dispatch_queue_create('com.apple.XcodeServer.BigScreen.EntityList.introduction');
		this.mParentElement.down('.itemContainer').addClassName('animating');
		
		if (document.hidden || document.webkitHidden)
		{
			this.relayout();
			if (inOptCallback)
				inOptCallback();
			return;
		}
		
		function resume() {
			this.removeEventListener('webkitTransitionEnd', resume, false);
			this.removeEventListener('webkitvisibilitychange', resume, false);
			this.removeEventListener('visibilitychange', resume, false);
			this.style.webkitTransitionDelay = null;
			dispatch_resume(q);
		}
		
		this.iterateOnScreenItems(function(item, i, iAbs){
			dispatch_suspend(q);
			
			item.mParentElement.addEventListener('webkitTransitionEnd', resume, false);
			item.mParentElement.addEventListener('webkitvisibilitychange', resume, false);
			item.mParentElement.addEventListener('visibilitychange', resume, false);
			
			var offset = i * item.absoluteHeight(true);
			item.mParentElement.style.webkitTransform = 'translate3d(0, ' + offset + 'px, 0)';
			item.mParentElement.style.webkitTransitionDelay = Math.max(0, ((i - 1) * 0.075)) + 's';
			item.mParentElement.style.opacity = '1';
		});
		
		this.mParentElement.removeClassName('updatingLoupe');
		
		dispatch_async(q, function(){
			this.mParentElement.down('.itemContainer').removeClassName('animating');
			if (inOptCallback)
				inOptCallback();
		}.bind(this));
	},
	reloadData: function(inOptCallback) {
		logger().debug('list: reloadData', arguments);
		this.validateBounds();
		
		this.mItems = [];
		this.removeAllSubviews();
		
		var maxOnScreen = this.visibleItemCapacity();
		var l = this.mDataSource.numberOfItems();
		for (var i = 0; i < l; i++)
		{
			if (i < maxOnScreen)
			{
				var view = new this.mListItemClass(this.mDataSource.itemAtIndex(i));
				this.mItems.push(view);
				this.addSubview(view, '.itemContainer');
			}
			else
				this.mItems.push(null);
		}
		
		this.mSelectedItem = (l > 0) ? 0 : -1;
		this.mFlashIdx = -1;
		
		// set current loupe data
		if (l > 0)
			this.updateLoupe(this.mItems[0].mTitle, this.mItems[0].mSubtitle, this.mItems[0].mSubtitleTimestamp, this.mItems[0].mStatusClass, this.mItems[0].mRunning, this.mItems[0].mFlashing);
		
		this.relayout();
		this._cleanup();
		
		if (this.visibleViewIsRunning())
			this.mSpinner.start();
		else
			this.mSpinner.stop();
		
		if (inOptCallback)
			inOptCallback();
	},
	reloadItemAtIndex: function(inIdx, inOptCallback) {
		logger().debug('list: reloadItemAtIndex', arguments);
		var item = this.mDataSource.itemAtIndex(inIdx);
		
		// if it's the selected item, fake it
		if (inIdx == this.mSelectedItem)
		{
			var view = new this.mListItemClass(item);
			this.updateLoupeNoSwap(view.mTitle, view.mSubtitle, view.mSubtitleTimestamp, view.mStatusClass, view.mRunning, inIdx == this.mFlashIdx);
		}
		// otherwise, do the update only if it's on-screen
		else if (this.indexOnScreen(inIdx) && this.mItems[inIdx])
		{
			this.mItems[inIdx].prepare(item);
			if (this.visibleViewIsRunning())
				this.mSpinner.start();
			else
				this.mSpinner.stop();
			
			this.mItems[inIdx].setFlashing(inIdx == this.mFlashIdx);
		}
		
		if (inOptCallback)
			inOptCallback();
	},
	moveItemAtIndex: function(inOldIdx, inNewIdx, inOptAnimate, inOptCallback) {
		logger().debug('list: moveItemAtIndex', arguments);
		
		if (this.mItems.length < 2)
		{
			if (inOptCallback)
				inOptCallback();
			return;  // this was probably a bug to begin with
		}
		
		// update flash index
		if (this.mFlashIdx > -1)
		{
			if (inOldIdx == this.mFlashIdx)
				this.mFlashIdx = inNewIdx;
			else if (inOldIdx < this.mFlashIdx && inNewIdx > this.mFlashIdx)
				this.mFlashIdx--;
			else if (inNewIdx == this.mFlashIdx || (inOldIdx > this.mFlashIdx && inNewIdx < this.mFlashIdx))
				this.mFlashIdx++;
		}
		
		// calculate screen ranges
		var currentScreenRange = this.onScreenRange();
		var newScreenRange = [currentScreenRange[0], currentScreenRange[1]];
		if (inOldIdx == currentScreenRange[0])
		{
			newScreenRange[0] = inNewIdx;
			newScreenRange[1] = (inNewIdx + Math.min(this.visibleItemCapacity(), this.mItems.length)) % this.mItems.length;
		}
		else if (inNewIdx == currentScreenRange[0] || (inOldIdx > currentScreenRange[0] && inNewIdx < currentScreenRange[0]))
		{
			newScreenRange[0] = (newScreenRange[0] + 1) % this.mItems.length;
			newScreenRange[1] = (newScreenRange[1] + 1) % this.mItems.length;
		}
		else if (inOldIdx < currentScreenRange[0] && inNewIdx > currentScreenRange[0])
		{
			newScreenRange[0] = (newScreenRange[0] - 1);
			if (newScreenRange[0] < 0)
				newScreenRange[0] = this.mItems.length - 1;
			newScreenRange[1] = (newScreenRange[1] - 1);
			if (newScreenRange[1] < 0)
				newScreenRange[1] = this.mItems.length - 1;
		}
		
		// if both old and new positions are off-screen, reorder array, update selection, then bail
		var oldOffScreen = (!this.indexInRange(inOldIdx, currentScreenRange));
		var newOffScreen = (!this.indexInRange(inNewIdx, newScreenRange));
		if (oldOffScreen && newOffScreen)
		{
			// fix array
			var view = this.mItems.splice(inOldIdx, 1)[0];
			this.mItems.splice(inNewIdx, 0, view);
			
			// fix selection
			this.mSelectedItem = newScreenRange[0];
			
			if (inOptCallback)
				inOptCallback();
			
			return;
		}
		
		// simulate the move
		var newItemsList = this.mItems.slice(0);
		var view = newItemsList.splice(inOldIdx, 1)[0];
		newItemsList.splice(inNewIdx, 0, view);
		
		// check for on-screen missing views, create them, and add them to both arrays
		var l = Math.min(this.visibleItemCapacity(), this.mItems.length);
		for (var i = 0; i < l; i++)
		{
			var j = (newScreenRange[0] + i) % this.mItems.length;
			if (newItemsList[j] == null)
			{
				// create a view
				var newView = new this.mListItemClass(this.mDataSource.itemAtIndex(j));
				newView.setFlashing(j == this.mFlashIdx);
				newItemsList[j] = newView;
				this.addSubview(newView, '.itemContainer');
				
				// determine old index
				var oldIndex = j;
				if (j == inNewIdx)
					oldIndex = inOldIdx;
				else if (inNewIdx < j && inOldIdx >= j)
					oldIndex--;
				else if (inOldIdx < j && inNewIdx > j)
					oldIndex++;
				
				this.updateItem(oldIndex, newView);
			}
		}
		
		// ANIMATING: call relayout
		if (inOptAnimate)
			this.relayout();
		
		// RENDER BREAK
		this._renderBreak(inOptAnimate, function(){
			// TODO: ANIMATING: mark targeted item as "mover" (will lower z-index, send to back)
			view = this.mItems[inOldIdx];
			
			// update the array and selection index
			this.mItems = newItemsList;
			this.mSelectedItem = newScreenRange[0];
			
			// update the contents of the view
			view.prepare(this.mDataSource.itemAtIndex(inNewIdx));
			if (this.visibleViewIsRunning())
				this.mSpinner.start();
			else
				this.mSpinner.stop();
			
			view.setFlashing(inNewIdx == this.mFlashIdx);
			
			// if inNewIdx is new selection, update selection info
			if (this.mSelectedItem == inNewIdx)
				this.updateLoupe(view.mTitle, view.mSubtitle, view.mSubtitleTimestamp, view.mStatusClass, view.mRunning, view.mFlashing);
			
			// ANIMATING: call _beginAnimation
			if (inOptAnimate)
				this._beginAnimation();
			
			// call relayout
			var thingsMoved = this.relayout();
			if (inOptAnimate && !thingsMoved)
				this._cancelAnimation();
			
			// NOT ANIMATING: call cleanup
			if (!inOptAnimate)
				this.cleanup();
			
			this._afterAnimation(function(){
				if (inOptCallback)
					inOptCallback();
			});
		}.bind(this));
	},
	insertItemAtIndex: function(inIdx, inOptAnimate, inOptCallback) {
		logger().debug('list: insertItemAtIndex', arguments);
		this.validateBounds();
		
		// update flash index
		if (inIdx <= this.mFlashIdx)
			this.mFlashIdx++;
		
		// calculate screen ranges
		var currentScreenRange = this.onScreenRange();
		var newScreenRange = [currentScreenRange[0], currentScreenRange[1]];
		if (inIdx <= newScreenRange[0])
		{
			newScreenRange[0] = (newScreenRange[0] + 1) % (this.mItems.length + 1);
			newScreenRange[1] = (newScreenRange[1] + 1) % (this.mItems.length + 1);
		}
		
		// insert null at inIdx in array
		this.mItems.splice(inIdx, 0, null);
		
		// update the current selection
		this.mSelectedItem = newScreenRange[0];
		
		// determine if we're off-screen, and if so, bail
		if (!this.indexInRange(inIdx, newScreenRange))
		{
			if (inOptCallback)
				inOptCallback();
			return;
		}
		
		// ANIMATING: call _beginAnimation, relayout
		if (inOptAnimate)
		{
			this._beginAnimation();
			var thingsMoved = this.relayout();
			if (!thingsMoved)
				this._cancelAnimation();
		}
		
		// call _afterAnimation
		this._afterAnimation(function(){
			// create new view, insert into array, add as subview
			var view = new this.mListItemClass(this.mDataSource.itemAtIndex(inIdx));
			view.setFlashing(inIdx == this.mFlashIdx);
			this.updateItem(inIdx, view);
			this.addSubview(view, '.itemContainer');
			
			if (this.visibleViewIsRunning())
				this.mSpinner.start();
			else
				this.mSpinner.stop();
			
			// ANIMATING: set opacity to 0 (or other pre-animation state), relayout
			if (inOptAnimate)
			{
				view.mParentElement.style.opacity = '0';
				this.relayout();
			}
					
			// RENDER BREAK
			this._renderBreak(inOptAnimate, function(){
				// ANIMATING: call _beginAnimation
				if (inOptAnimate)
					this._beginAnimation();
				
				// ANIMATING: set opacity to 1 (or other post-animation state)
				view.mParentElement.style.opacity = '1';
				
				// NOT ANIMATING: call cleanup
				if (!inOptAnimate)
					this.cleanup();
				
				this._afterAnimation(function(){
					if (inOptCallback)
						inOptCallback();
				});
			}.bind(this));
		}.bind(this));
	},
	removeItemAtIndex: function(inIdx, inOptAnimate, inOptCallback) {
		logger().debug('list: removeItemAtIndex', arguments);
		
		// update flash index
		if (inIdx < this.mFlashIdx)
			this.mFlashIdx--;
		else if (this.mFlashIdx == inIdx)
			this.mFlashIdx = -1;
		
		// if it's the selected one, fade it out, remove it, call advanceSelection
		if (this.mSelectedItem == inIdx)
		{
			// ANIMATING: call _beginAnimation
			if (inOptAnimate)
				this._beginAnimation();
			
			var finisher = function(){
				this.mParentElement.removeEventListener('webkitTransitionEnd', finisher, false);
			
				// remove the view from the list
				this.updateItem(inIdx, null);
				this.mItems.splice(inIdx, 1);
			
				// update the selection index
				this.mSelectedItem = (this.mSelectedItem == 0) ? (this.mItems.length - 1) : this.mSelectedItem - 1;
			
				// call advance selection to finish things up
				this.advanceSelection(inOptAnimate, function(){
					this.validateBounds();
					if (inOptCallback)
						inOptCallback();
				}.bind(this));
			}.bind(this);
			
			// hide the loupe
			if (inOptAnimate && !(document.hidden || document.webkitHidden))
				this.mParentElement.addEventListener('webkitTransitionEnd', finisher, false);
			else
				finisher();
			
			this.mParentElement.addClassName('updatingLoupe');
			this.mUpdatingLoupe = true;
		}
		
		// otherwise, do a normal fade out
		else
		{
			// determine if we're on-screen
			if (!this.indexOnScreen(inIdx))
			{
				// remove the view from the list
				this.updateItem(inIdx, null);
				this.mItems.splice(inIdx, 1);
				
				// update selection index
				if (inIdx < this.mSelectedItem)
					this.mSelectedItem = (this.mSelectedItem == 0) ? (this.mItems.length - 1) : this.mSelectedItem - 1;
				
				if (inOptCallback)
					inOptCallback();
				return;
			}
			
			// update selection index
			if (inIdx < this.mSelectedItem)
				this.mSelectedItem = (this.mSelectedItem == 0) ? (this.mItems.length - 1) : this.mSelectedItem - 1;
			
			// ANIMATING: set opacity to 1 (or other pre-animation state)
			if (inOptAnimate)
				this.mItems[inIdx].mParentElement.style.opacity = '1';
			
			// RENDER BREAK
			this._renderBreak(inOptAnimate, function(){
				// ANIMATING: call _beginAnimation, set opacity to 0 (or other post-animation state)
				if (inOptAnimate)
				{
					this._beginAnimation();
					this.mItems[inIdx].mParentElement.style.opacity = '0';
				}
				
				// call _afterAnimation
				this._afterAnimation(function(){
					// splice array appropriately, remove view from superview
					this.updateItem(inIdx, null);
					this.mItems.splice(inIdx, 1);
					
					// if we need to bring in another view, let's do so (and translate correctly)
					var screenRange = this.onScreenRange();
					var idx = (screenRange[1] > 0) ? screenRange[1] - 1 : this.mItems.length - 1;
					if (screenRange[0] != screenRange[1] && this.mItems[idx] == null)
					{
						// create a view
						var newView = new this.mListItemClass(this.mDataSource.itemAtIndex(idx));
						newView.setFlashing(idx == this.mFlashIdx);
						this.addSubview(newView, '.itemContainer');
						this.updateItem(idx, newView);
						
						if (newView.mRunning)
							this.mSpinner.start();
						
						var offset = this.mItems.length * newView.absoluteHeight(true);
						newView.mParentElement.style.webkitTransform = 'translate3d(0, ' + offset + 'px, 0)';
					}
					
					// RENDER BREAK
					this._renderBreak(inOptAnimate, function(){
						// ANIMATING: call _beginAnimation
						if (inOptCallback)
							this._beginAnimation();
					
						// call relayout
						var thingsMoved = this.relayout();
						if (!thingsMoved)
							this._cancelAnimation();
		
						// NOT ANIMATING: call cleanup
						if (!inOptAnimate)
							this.cleanup();
						
						this._afterAnimation(function(){
							this.validateBounds();
							
							if (!this.visibleViewIsRunning())
								this.mSpinner.stop();
							
							if (inOptCallback)
								inOptCallback();
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}
	},
	flashItemAtIndex: function(inIdx, inOptCallback) {
		logger().debug('list: flashItemAtIndex', arguments);
		
		var screenRange = this.onScreenRange();
		
		// remove any existing flash
		this.unflash();
		
		// first make sure we're on screen
		if (this.indexInRange(inIdx, screenRange))
		{
			// if it's the loupe, set it to the loupe
			if (screenRange[0] == inIdx)
				this.mParentElement.down('.loupe').addClassName('flash');
			else if (this.mItems[inIdx])
			{
				this.mItems[inIdx].mParentElement.addClassName('flash');
				this.mItems[inIdx].mFlashing = true;
			}
		}
		
		this.mFlashIdx = inIdx;
		
		// set a canceler timeout
		this.mFlashTimer = setTimeout(this.unflash.bind(this), 3000);
		
		// call the callback
		if (inOptCallback)
			inOptCallback();
	},
	unflash: function() {
		if (this.mFlashTimer)
			clearTimeout(this.mFlashTimer);
		this.mFlashTimer = null;
		
		var screenRange = this.onScreenRange();
		if (this.mFlashIdx > -1 && this.indexInRange(this.mFlashIdx, screenRange))
		{
			if (screenRange[0] == this.mFlashIdx)
				this.mParentElement.down('.loupe').removeClassName('flash');
			else if (this.mItems[this.mFlashIdx])
			{
				this.mItems[this.mFlashIdx].mParentElement.removeClassName('flash');
				this.mItems[this.mFlashIdx].mFlashing = false;
			}
		}
		
		this.mFlashIdx = -1;
	},
	advanceSelection: function(inOptAnimate, inOptCallback) {
		// if we have more than a page of items, create a new view (bottom), add it to the array, add as subview
		// we know we have at most one full page if screen range start == screen range end
		var screenRange = this.onScreenRange(true);
		var fullScreenRange = this.onScreenRange();
		var maxItems = this.visibleItemCapacity();
		if (screenRange[0] != screenRange[1])
		{
			var newView = new this.mListItemClass(this.mDataSource.itemAtIndex(fullScreenRange[1]));
			newView.setFlashing(screenRange[1] == this.mFlashIdx);
			this.updateItem(fullScreenRange[1], newView);
			this.addSubview(newView, '.itemContainer');
			newView.mParentElement.style.webkitTransform = 'translate3d(0, ' + (maxItems * newView.absoluteHeight(true)) + 'px, 0)';
			
			if (newView.mRunning)
				this.mSpinner.start();
			else if (!this.visibleViewIsRunning())
				this.mSpinner.stop();
		}
		
		// RENDER BREAK
		this._renderBreak(inOptAnimate, function(){
			// ANIMATING: call _beginAnimation
			if (inOptAnimate)
				this._beginAnimation();
			
			// update mSelectedItem
			this.mSelectedItem = (this.mSelectedItem + 1) % this.mItems.length;
			
			// call relayout
			this.relayout();
			
			// update selection information
			var item = this.mItems[this.mSelectedItem];
			if (item !== undefined && item !== null) {
				this.updateLoupe(item.mTitle, item.mSubtitle, item.mSubtitleTimestamp, item.mStatusClass, item.mRunning, item.mFlashing);
				item.mParentElement.removeClassName('flash');
			}
			
			// if we have less than a page of items, 
			if (screenRange[0] == screenRange[1])
			{
				screenRange = this.onScreenRange();
				var endIdx = screenRange[1] - 1;
				if (endIdx < 0)
					endIdx = this.mItems.length - 1;
				
				if (this.mItems[endIdx] == null)
				{
					// call _afterAnimation
					this._afterAnimation(function(){
						// create a new view for end slot (correctly translated), add to array, add as subview
						var view = new this.mListItemClass(this.mDataSource.itemAtIndex(endIdx));
						view.setFlashing(endIdx == this.mFlashIdx);
						this.updateItem(endIdx, view);
						this.addSubview(view, '.itemContainer');
					
						if (view.mRunning)
							this.mSpinner.start();
						else if (!this.visibleViewIsRunning())
							this.mSpinner.stop();
					
						var offset = ((this.mItems.length - 1) * view.absoluteHeight(true));
						view.mParentElement.style.webkitTransform = 'translate3d(0, ' + offset + 'px, -10px) rotateX(-90deg)';
						view.mParentElement.style.opacity = '0';
					
						function continuation(){
							// ANIMATING: call _beginAnimation
							if (inOptAnimate)
								this._beginAnimation();
					
							// fix opacity
							view.mParentElement.style.opacity = '1';
							view.mParentElement.style.webkitTransform = 'translate3d(0, ' + offset + 'px, 0)';
					
							// NOT ANIMATING: call cleanup
							if (!inOptAnimate)
								this.cleanup();
						
							if (inOptCallback)
								inOptCallback();
						}
					
						if (inOptAnimate)
							setTimeout(continuation.bind(this), 200);
						else
							continuation.call(this);
					}.bind(this));
				}
				else
				{
					// NOT ANIMATING: call cleanup
					if (!inOptAnimate)
						this.cleanup();
				
					if (inOptCallback)
						inOptCallback();
				}
			}
			else
			{
				// NOT ANIMATING: call cleanup
				if (!inOptAnimate)
					this.cleanup();
				
				if (inOptCallback)
					inOptCallback();
			}
		}.bind(this));
	},
	selectItemAtIndex: function(inIdx) {
		// TODO: implement (maybe)
		logger().error('selectItemAtIndex called on entity list view, which is currently not supported');
	},
	relayout: function() {
		// note: relayout does not remove any views; that is done in cleanup (for animation purposes)
		var thingsMoved = false;
		
		// get the screen range
		var screenRange = this.onScreenRange();
		var itemsOnScreen = (screenRange[0] == screenRange[1]) ? this.mItems.length : this.visibleItemCapacity();
		
		var carouselPosition = -1 * screenRange[0];
		for (var i = 0; i < this.mItems.length; i++)
		{
			var pos = carouselPosition++;
			if (this.mItems[i] != null)
			{
				// resize the view
				var view = this.mItems[i];
				view.resize();
				
				// determine layout coordinates
				var top = pos * view.absoluteHeight(true);
				view.mParentElement.style.webkitTransform = 'translate3d(0, ' + top + 'px, 0)';
				view.mNextTop = top;
			}
			
			// mark as on screen
			if (this.indexInRange(i, screenRange) && pos >= 0)
				itemsOnScreen--;
		}
		
		// do a second pass if we can fit more on-screen
		if (itemsOnScreen > 0)
		{
			for (var i = 0; i < screenRange[0]; i++)
			{
				var pos = carouselPosition++;
				if (this.mItems[i] != null)
				{
					// resize the view
					var view = this.mItems[i];
					view.resize();
				
					// determine layout coordinates
					var top = pos * view.absoluteHeight(true);
					view.mParentElement.style.webkitTransform = 'translate3d(0, ' + top + 'px, 0)';
					view.mNextTop = top;
				}
			}
		}
		
		// check if anything moved
		for (var i = 0; i < this.mItems.length; i++)
		{
			if (this.mItems[i] != null && this.mItems[i].mNextTop !== this.mItems[i].mCurrentTop)
			{
				thingsMoved = true;
				this.mItems[i].mCurrentTop = this.mItems[i].mNextTop;
			}
		}
		
		return thingsMoved;
	},
	cleanup: function() {
		// delay a bit so we don't impact animation smoothness
		setTimeout(this._cleanup.bind(this), 750);
	},
	_cleanup: function() {
		// TODO: strip off any animation classes
	
		// if a view is off-screen, purge it (INCLUDING the view under the loupe)
		var screenRange = this.onScreenRange();
		for (var i = 0; i < this.mItems.length; i++)
		{
			if (screenRange[0] == i || !this.indexInRange(i, screenRange))
				this.updateItem(i, null);
		}
	},
	tidy: function() {
		this.relayout();
		this.cleanup();
	},
	handleResize: function() {
		// add any views we need to
		var screenRange = this.onScreenRange();
		for (var i = 0; i < this.mItems.length; i++)
		{
			if (this.indexInRange(i, screenRange) && this.mItems[i] == null)
			{
				var view = new this.mListItemClass(this.mDataSource.itemAtIndex(i));
				this.addSubview(view, '.itemContainer');
				this.updateItem(i, view);
			}
		}
		
		if (this.visibleViewIsRunning())
			this.mSpinner.start();
		else
			this.mSpinner.stop();
		
		// update background image size
		var entityView = this.mSuperview.mParentElement.down('.xc-big-screen-bot-run-entity');
		if (entityView)
			this.mParentElement.down('.loupeContainer').style.backgroundSize = '100% ' + entityView.offsetHeight + 'px';
		
		this.relayout();
		this.validateBounds();
		this.cleanup();
	},
	updateLoupe: function(inTitle, inSubtitle, inSubtitleTimestamp, inStatusClass, inRunning, inFlashing) {
		var loupe = this.mParentElement.down('.loupe');		
		var el = this.mParentElement;
		var self = this;
		function updater() {
			loupe.removeEventListener('webkitTransitionEnd', updater, false);
			document.removeEventListener('visibilitychange', updater, false);
			document.removeEventListener('webkitvisibilitychange', updater, false);
			
			self.updateLoupeNoSwap(inTitle, inSubtitle, inSubtitleTimestamp, inStatusClass, inRunning, inFlashing);
			el.removeClassName('updatingLoupe');
			self.mUpdatingLoupe = false;
		}
		
		if (this.mUpdatingLoupe || document.hidden || document.webkitHidden)
			updater();
		else
		{
			loupe.addEventListener('webkitTransitionEnd', updater, false);
			this.mParentElement.addClassName('updatingLoupe');
			this.mUpdatingLoupe = true;
			
			document.addEventListener('visibilitychange', updater, false);
			document.addEventListener('webkitvisibilitychange', updater, false);
		}
	},
	updateLoupeNoSwap: function(inTitle, inSubtitle, inSubtitleTimestamp, inStatusClass, inRunning, inFlashing) {
		var loupe = this.mParentElement.down('.loupe');
		
		this.mSelectedTitle = inTitle;
		this.mSelectedSubtitle = inSubtitle;
		this.mSelectedSubtitleTimestamp = inSubtitleTimestamp;
		this.mSelectedStatusClass = inStatusClass;
		this.mSelectedRunning = inRunning;
		if (inRunning)
			this.mLoupeSpinner.start();
		else
			this.mLoupeSpinner.stop();
		
		loupe.className = ['loupe', this.mSelectedStatusClass, (this.mSelectedRunning) ? 'running' : '', (inFlashing) ? 'flash' : ''].join(' ');
		loupe.down('.title').textContent = this.mSelectedTitle;
		loupe.down('.subtitle').textContent = this.mSelectedSubtitle;
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.XcodeServer.BigScreenEntityView = Class.create(CC.Mvc.View, {
	mClassNames: ['xc-big-screen-entity'],
	initialize: function($super, inOptEntity) {
		$super();
		if (inOptEntity)
			this.prepare(inOptEntity);
	},
	prepare: function(inEntity) {
		// do nothing
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.XcodeServer.BigScreenDeviceView = Class.create(CC.Mvc.View, {
	mClassNames: ['xc-big-screen-device-view'],
	mDeviceClass: null,
	mStatusClass: null,
	mDeviceName: null,
	render: function() {
		return Builder.node('div', {className: [(this.mDeviceClass) ? this.mDeviceClass : '', (this.mStatusClass) ? this.mStatusClass : ''].join(' ')}, [
			Builder.node('div', {className: 'deviceImage'}),
			Builder.node('div', {className: 'deviceStatus'}),
			Builder.node('div', {className: 'deviceName reltext'}, (this.mDeviceName) ? this.mDeviceName : '')
		]);
	},
	initialize: function($super, inOptDeviceInfo, inOptStatus) {
		$super();
		
		if (inOptDeviceInfo)
			this.prepare(inOptDeviceInfo, inOptStatus);
	},
	prepare: function(inDeviceInfo, inOptStatus) {
		var deviceName = inDeviceInfo[CC.XcodeServer.BOT_RUN_TEST_DETAIL_NAME_TAG];
		
		this.mDeviceClass = CC.XcodeServer.getDeviceFamily(inDeviceInfo);
		this.mStatusClass = inOptStatus;
		this.mDeviceName = deviceName;
		
		if (this.rendered())
		{
			this.mParentElement.className = ['xc-big-screen-device-view', this.mDeviceClass, (this.mStatusClass) ? this.mStatusClass : ''].join(' ');
			this.mParentElement.down('.deviceName').textContent = (deviceName) ? deviceName : '';
		}
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.





CC.XcodeServer.BigScreenBotRunListItemView = Class.create(CC.XcodeServer.BigScreenEntityListItemView, {
	mClassNames: ['xc-big-screen-list-item', 'xc-big-screen-bot-run-list-item'],
	mRunning: false,
	render: function($super) {
		var el = $super();
		
		el.appendChild(Builder.node('div', {className: 'sbSpinner'}));
		if (this.mRunning)
			el.addClassName('running');
		
		return el;
	},
	prepare: function(inEntity) {
		this.setTitle(inEntity.extendedAttributes.botSnapshot.longName);
		this.setStatusClass(inEntity.sbStatus);
		this.setRunning(inEntity.sbRunning);
		
		var relevantTime = inEntity.endTime || inEntity.startTime;
		if (relevantTime)
			this.setSubtitleWithDate(relevantTime);
		else
			this.setSubtitle(null);
	},
	setRunning: function(inRunning) {
		this.mRunning = inRunning;
		if (this.rendered())
		{
			if (this.mRunning)
				this.mParentElement.addClassName('running');
			else
				this.mParentElement.removeClassName('running');
		}
	}
});

CC.XcodeServer.BigScreenBotRunEntityView = Class.create(CC.XcodeServer.BigScreenEntityView, {
	mClassNames: ['xc-big-screen-entity', 'xc-big-screen-bot-run-entity', 'updating', 'preshow'],
	mEntity: null,
	mUpdating: true,
	mUpdatingCommit: false,
	mCommitSwapTimer: null,
	mCommits: null,
	mCurrentCommit: -1,
	render: function() {
		var el = Builder.node('div', [
			Builder.node('div', {className: 'innerView'}, [
				Builder.node('div', {className: 'header'}, [
					Builder.node('h1', {className: 'title reltext animatable'}, ''),
				]),
				Builder.node('div', {className: 'status'}, [
					CC.XcodeServer.summaryElementForBotRunSummary(0, 0, 0, 0, 0)
				]),
				Builder.node('div', {className: 'committers'}, [
					Builder.node('div', {className: 'normal animatable'}, [
						Builder.node('h2', {className: 'title reltext'}, ''),
						Builder.node('div', {className: 'messageContainer'}, [
							Builder.node('div', {className: 'message reltext'}, ''),
							Builder.node('div', {className: 'author'}, [
								Builder.node('div', {className: 'avatar none'}, [
									Builder.node('img', {src: ''})
								]),
								Builder.node('div', {className: 'name reltext'}, ''),
								Builder.node('div', {className: 'timestamp reltext'}, ''),
								Builder.node('div', {className: 'fileCount reltext'}, '')
							])
						])
					]),
					Builder.node('div', {className: 'empty animatable'}, [
						Builder.node('div', {className: 'message reltext'}, '_XC.BigScreen.Commits.Empty.Placeholder'.loc())
					])
				]),
				Builder.node('div', {className: 'devices'}, [
					Builder.node('div', {className: 'normal animatable'}, [
						Builder.node('h2', {className: 'title reltext'}, ''),
						Builder.node('div', {className: 'devicesContainer'})
					]),
					Builder.node('div', {className: 'empty animatable'}, [
						Builder.node('div', {className: 'message reltext'}, '_XC.BigScreen.Devices.Empty.Placeholder'.loc())
					])
				])
			])
		]);
		
		return el;
	},
	initialize: function($super) {
		$super();
		globalNotificationCenter().subscribe(CC_BS_RESIZE_NOTIFICATION, this.handleResize.bind(this));
        globalNotificationCenter().subscribe(CC_BS_TIMESTAMP_NOTIFICATION, this.updateCommitTimestamp.bind(this));
	},
	prepare: function(inEntity) {
		// TODO: handle inEntity == null
		if (this.rendered())
		{
			this.stopCommitSwapTimer();
			
			var el = this.mParentElement;
			var self = this;
			function updater() {
				// clean up, if necessary
				el.removeEventListener('webkitTransitionEnd', updater, false);
				document.removeEventListener('visbilityChange', updater, false);
				document.removeEventListener('webkitvisibilitychange', updater, false);
				
				// update our build status information
				el.down('.header .title').textContent = '_XC.BigScreen.EntityView.Integration.Label'.loc(inEntity.integration);
				CC.XcodeServer.updateSummaryElementWithTestsWithBotRuns(el.down('.xc-bot-run-summary'), inEntity);
				CC.RunLoop.nextTick(self.resizeStatusElement.bind(self));
				
				// prepare our committer information
				if (self.mUpdatingCommit)
				{
					el.down('.committers').removeClassName('updating');
					self.mUpdatingCommit = false;
				}
				
				if (inEntity.commits.length == 0)
				{
					el.down('.committers .title').textContent = '_XC.BigScreen.EntityView.Committers.Plural.Label'.loc(0);
					el.down('.committers').addClassName('none');
					self.mCommits = null;
					self.mCurrentCommit = -1;
				}
				else
				{
					el.down('.committers').removeClassName('none');
					
					var committers = [];
					for (var i = 0; i < inEntity.commits.length; i++)
					{
						var authorID = inEntity.commits[i].author.email || inEntity.commits[i].author.name;
						authorID = authorID.toLowerCase();
					
						if (committers.indexOf(authorID) == -1)
							committers.push(authorID);
					}
				
					el.down('.committers .title').textContent = (committers.length == 1) ? '_XC.BigScreen.EntityView.Committers.Singular.Label'.loc() : '_XC.BigScreen.EntityView.Committers.Plural.Label'.loc(committers.length);
					
					// fill in the first commit in the list
					var commit = inEntity.commits[0];
					var authorDisplay = commit.author.name || commit.author.email;
					var message = commit.message;
					var authorImageURL = '/xcs/avatar/' + commit.author.email;
					
					el.down('.committers .message').textContent = message;
					el.down('.committers .author .name').textContent = authorDisplay;
					el.down('.committers .author .timestamp').textContent = globalLocalizationManager().localizedDateWithTime(commit.date);
					el.down('.committers .author .fileCount').textContent = (commit.filesChanged == 1) ? '_XC.Bot.CommitHistory.Files.Modified.Singular'.loc(1) : '_XC.Bot.CommitHistory.Files.Modified.Plural'.loc(commit.filesChanged);
					
					var imgEl = el.down('.committers .author .avatar img');
					if (commit.author.email)
					{
						if (imgEl.authorImageURL != authorImageURL)
						{
							imgEl.parentNode.addClassName('none');
							imgEl.authorImageURL = authorImageURL;
							imgEl.onload = function(){
								if (imgEl.authorImageURL == authorImageURL)
									imgEl.parentNode.removeClassName('none');
							};
							imgEl.src = authorImageURL;
						}
					}
					else
						imgEl.parentNode.addClassName('none');
					
					
					self.mCommits = inEntity.commits;
					self.mCurrentCommit = 0;
					if (inEntity.commits.length > 1)
						self.resetCommitSwapTimer();
				}
				
				// prepare our device information
				self.removeAllSubviews();
				
				var deviceIdentifiers = Object.keys(inEntity.devices);
				var numDevices = deviceIdentifiers.length;
				
				if (numDevices == 0)
					el.down('.devices').addClassName('none');
				else
				{
					el.down('.devices').removeClassName('none');
					el.down('.devices .title').textContent = (numDevices == 1) ? '_XC.BigScreen.EntityView.Devices.Singular.Label'.loc() : '_XC.BigScreen.EntityView.Devices.Plural.Label'.loc(numDevices);
				
					for (var i = 0; i < deviceIdentifiers.length; i++)
					{
						var device = inEntity.devices[deviceIdentifiers[i]];
						var view = new CC.XcodeServer.BigScreenDeviceView(device, (device.Fail) ? 'failure' : 'success');
						self.addSubview(view, '.devices .devicesContainer');
					}
				}
				
				// do an animation if necessary
				if (el.hasClassName('preshow') && !(document.hidden || document.webkitHidden))
				{
					setTimeout(function(){
						el.removeClassName('preshow');
					}, 200);
				}
				
				// show it
				el.removeClassName('updating');
				self.mUpdating = false;
			}
			
			if (this.mUpdating || this.mEntity.ownerGUID == inEntity.ownerGUID || document.hidden || document.webkitHidden)
				updater();
			else
			{
				this.mParentElement.addEventListener('webkitTransitionEnd', updater, false);
				this.mParentElement.addClassName('updating');
				this.mUpdating = true;
				
				document.addEventListener('visibilitychange', updater, false);
				document.addEventListener('webkitvisibilitychange', updater, false);
			}
			
			this.mEntity = inEntity;
		}
	},
	resetCommitSwapTimer: function() {
		this.stopCommitSwapTimer();
		this.mCommitSwapTimer = setTimeout(this.advanceCommitMessage.bind(this), 5000);
	},
	stopCommitSwapTimer: function() {
		if (this.mCommitSwapTimer != null)
		{
			clearTimeout(this.mCommitSwapTimer);
			this.mCommitSwapTimer = null;
		}
	},
	advanceCommitMessage: function() {
		var nextCommit = (this.mCurrentCommit + 1) % this.mCommits.length;
		if (nextCommit == this.mCurrentCommit)
			return this.resetCommitSwapTimer();
		
		var el = this.mParentElement.down('.committers');
		var self = this;
		function updater() {
			el.removeEventListener('webkitTransitionEnd', updater, false);
			document.removeEventListener('visbilityChange', updater, false);
			document.removeEventListener('webkitvisibilitychange', updater, false);
			
			self.mCurrentCommit = nextCommit;
			var commit = self.mCommits[self.mCurrentCommit];
			var authorDisplay = commit.author.name || commit.author.email;
			var message = commit.message;
			var authorImageURL = '/xcs/avatar/' + commit.author.email;
			
			el.down('.message').textContent = message;
			el.down('.author .name').textContent = authorDisplay;
			el.down('.author .timestamp').textContent = globalLocalizationManager().localizedDateWithTime(commit.date);
			el.down('.author .fileCount').textContent = (commit.filesChanged == 1) ? '_XC.Bot.CommitHistory.Files.Modified.Singular'.loc(1) : '_XC.Bot.CommitHistory.Files.Modified.Plural'.loc(commit.filesChanged);
			
			var imgEl = el.down('.author .avatar img');
			if (commit.author.email)
			{
				if (imgEl.authorImageURL != authorImageURL)
				{
					imgEl.parentNode.addClassName('none');
					imgEl.authorImageURL = authorImageURL;
					imgEl.onload = function(){
						if (imgEl.authorImageURL == authorImageURL)
							imgEl.parentNode.removeClassName('none');
					};
					imgEl.src = authorImageURL;
				}
			}
			else
				imgEl.parentNode.addClassName('none');
			
			el.removeClassName('updating');
			self.mUpdatingCommit = false;
			self.resetCommitSwapTimer();
		}
		
		if (this.mUpdatingCommit || document.hidden || document.webkitHidden)
			updater();
		else
		{
			this.mParentElement.down('.committers').addEventListener('webkitTransitionEnd', updater, false);
			this.mParentElement.down('.committers').addClassName('updating');
			this.mUpdatingCommit = true;
			
			document.addEventListener('visibilitychange', updater, false);
			document.addEventListener('webkitvisibilitychange', updater, false);
		}
	},
    updateCommitTimestamp: function() {
        // this is really only necessary in the case where we have a single bot with a single commit
        // see <rdar://problem/14834932>
        if (this.rendered() && !this.mUpdating && this.mCommits && this.mCommits.length > 0)
        {
            var commit = this.mCommits[this.mCurrentCommit];
            var el = this.mParentElement.down('.committers');
            el.down('.author .timestamp').textContent = globalLocalizationManager().localizedDateWithTime(commit.date);
        }
    },
	handleResize: function() {
		this.resizeStatusElement();
	},
	resizeStatusElement: function() {
		if (this.rendered())
		{
			// calculate new dimensions
			var containerEl = this.mParentElement.down('.status');
			var statusEl = this.mParentElement.down('.xc-bot-run-summary');
			var innerRatio = statusEl.offsetWidth / statusEl.offsetHeight;
			var outerRatio = containerEl.offsetWidth / containerEl.offsetHeight;
			
			var newWidth = statusEl.offsetWidth;
			var newHeight = statusEl.offsetHeight;
			
			if (innerRatio >= outerRatio)
			{
				newWidth = containerEl.offsetWidth;
				newHeight = newWidth / innerRatio;
			}
			else
			{
				newHeight = containerEl.offsetHeight;
				newWidth = newHeight * innerRatio;
			}
			
			// vertically center it
			var offset = Math.floor((containerEl.offsetHeight - statusEl.offsetHeight) / 2);
			
			// determine the correct scale
			var scale = newWidth / statusEl.offsetWidth;
			if (!this.mEntity || !this.mEntity.expandedStatusInfo || (this.mEntity.expandedStatusInfo.tests.passed == 0 && this.mEntity.expandedStatusInfo.tests.failed == 0))
				scale *= 0.9;
			
			// apply transform
			statusEl.style.webkitTransform = 'translateY(' + offset + 'px) scale(' + scale + ')';
		}
	}
});

CC.XcodeServer.BigScreenBotsView = Class.create(CC.Mvc.View, {
	mClassNames: ['xc-big-screen-bots'],
	mSelectionTimer: null,
	mSelectionTimerStartTime: -1,
	mSelectionTimerDuration: -1,
	mDataSource: null,
	mListView: null,
	mEntityView: null,
	mCurrentBotRun: null,
	mPaused: false,
	mTimeLeftAfterPause: -1,
	mResizePauseTimer: null,
	initialize: function($super) {
		$super();
		
		// create the list view
		this.mListView = new CC.XcodeServer.BigScreenEntityListView(CC.XcodeServer.BigScreenBotRunListItemView);
		this.addSubview(this.mListView);
		
		// create the entity view
		this.mEntityView = new CC.XcodeServer.BigScreenBotRunEntityView();
		this.addSubview(this.mEntityView);
		
		// resync everything when we come back from being occluded, just in case
		document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this), false);
		document.addEventListener('webkitvisibilitychange', this.handleVisibilityChange.bind(this), false);
		globalNotificationCenter().subscribe(CC_BS_RESIZE_NOTIFICATION, this.handleResize.bind(this));
	},
	prepareForIntroduction: function(inOptCallback) {
		this.mListView.prepareForIntroduction(function(){
			if (inOptCallback)
				inOptCallback();
		});
	},
	introduce: function(inOptCallback) {
		setTimeout(function(){
			this.mListView.introduce(function(){
				if (inOptCallback)
					inOptCallback();
			});
		}.bind(this), 400);
	},
	setDataSource: function(inDataSource) {
		this.mDataSource = inDataSource;
		this.mListView.setDataSource(inDataSource);
	},
	reloadData: function(inOptContinuation) {
		dispatch_async(this.mSuperview.mAnimationQueue, function(){
			this._reloadData(inOptContinuation);
		}.bind(this));
	},
	_reloadData: function(inOptContinuation) {
		logger().debug('_reloadData', arguments);
		this.mListView.reloadData();
		if (this.mDataSource.numberOfItems() > 0)
			this.mEntityView.prepare(this.mDataSource.itemAtIndex(0));
		
		if (inOptContinuation)
			inOptContinuation.ready();
	},
	insertRunAtIndex: function(inBotRun, inIndex, inOptContinuation) {
		dispatch_async(this.mSuperview.mAnimationQueue, function(){
			this._insertRunAtIndex(inBotRun, inIndex, true, inOptContinuation);
		}.bind(this));
	},
	_insertRunAtIndex: function(inBotRun, inIndex, inOptAnimate, inOptContinuation) {
		logger().debug('_insertRunAtIndex', arguments);
		
		var q = this.mSuperview.mAnimationQueue;
		
		dispatch_suspend(q);
		this.mListView.insertItemAtIndex(inIndex, inOptAnimate, function(){
			dispatch_resume(q);
			if (this.mDataSource.numberOfItems() == 2) // meaning we only had one before
				this.resetSelectionTimer();
			if (inOptContinuation)
				inOptContinuation.ready();
		}.bind(this));
	},
	updateRunWithIndices: function(inBotRun, inOldIndex, inNewIndex, inOptContinuation) {
		dispatch_async(this.mSuperview.mAnimationQueue, function(){
			this._updateRunWithIndices(inBotRun, inOldIndex, inNewIndex, true, inOptContinuation);
		}.bind(this));
	},
	_updateRunWithIndices: function(inBotRun, inOldIndex, inNewIndex, inOptAnimate, inOptContinuation) {
		logger().debug('_updateRunWithIndices', arguments);
		var entity = this.mDataSource.itemAtIndex(inNewIndex);
		
		if (inOldIndex == inNewIndex)
		{
			this.mListView.reloadItemAtIndex(inNewIndex);
			if (this.mListView.mSelectedItem == inNewIndex)
				this.mEntityView.prepare(entity);
			if (inOptContinuation)
				inOptContinuation.ready();
		}
		else
		{
			var q = this.mSuperview.mAnimationQueue;
		
			dispatch_suspend(q);
			this.mListView.moveItemAtIndex(inOldIndex, inNewIndex, inOptAnimate, function(){
				if (this.mListView.mSelectedItem == inNewIndex)
					this.mEntityView.prepare(entity);
				
				dispatch_resume(q);
				if (inOptContinuation)
					inOptContinuation.ready();
			}.bind(this));
		}
	},
	removeRunAtIndex: function(inBotRun, inIndex, inOptContinuation) {
		dispatch_async(this.mSuperview.mAnimationQueue, function(){
			this._removeRunAtIndex(inBotRun, inIndex, true, inOptContinuation);
		}.bind(this));
	},
	_removeRunAtIndex: function(inBotRun, inIndex, inOptAnimate, inOptContinuation) {
		logger().debug('_removeRunAtIndex', arguments);
		
		var q = this.mSuperview.mAnimationQueue;
		
		dispatch_suspend(q);
		this.mListView.removeItemAtIndex(inIndex, inOptAnimate, function(){
			dispatch_resume(q);
			if (this.mDataSource.numberOfItems() <= 1)
				this.stopSelectionTimer();
			if (inOptContinuation)
				inOptContinuation.ready();
		}.bind(this));
	},
	runStartedOrChanged: function(inBotRun, inIdx, inOptContinuation) {
		if (CC.XcodeServer.isTerminalBotStatus(inBotRun.status))
		{
			if (inBotRun.guid == this.mCurrentBotRun)
				this.mCurrentBotRun = null;
		}
		else
			this.mCurrentBotRun = inBotRun.guid;
		
		if (inOptContinuation)
			inOptContinuation.ready();
	},
	runCompleted: function(inBotRun, inIdx, inOptContinuation) {
		dispatch_async(this.mSuperview.mAnimationQueue, function(){
			this.mListView.flashItemAtIndex(inIdx);
			if (inOptContinuation)
				inOptContinuation.ready();
		}.bind(this));
	},
	resetSelectionTimer: function(inOptDelay) {
		this.stopSelectionTimer();
		if (this.mDataSource.numberOfItems() > 1)
		{
			this.mSelectionTimer = setTimeout(this.swapSelection.bind(this), (inOptDelay) ? inOptDelay : CC_BS_BOT_STATUS_DEFAULT_DELAY);
			this.mSelectionTimerStartTime = Date.now();
			this.mSelectionTimerDuration = (inOptDelay) ? inOptDelay : CC_BS_BOT_STATUS_DEFAULT_DELAY;
			// this.mPageControl.setPageTimer(this.mPages[this.mPageControl.mActivePage].pageDuration);
		}
	},
	stopSelectionTimer: function() {
		if (this.mSelectionTimer != null)
		{
			clearTimeout(this.mSelectionTimer);
			this.mSelectionTimer = null;
			this.mSelectionTimerStartTime = -1;
			this.mSelectionTimerDuration = -1;
		}
	},
	swapSelection: function() {
		dispatch_async(this.mSuperview.mAnimationQueue, function(){
			this._swapSelection(true);
		}.bind(this));
	},
	_swapSelection: function(inOptAnimate) {
		var selection = (this.mListView.mSelectedItem + 1) % this.mDataSource.numberOfItems();
		var entity = this.mDataSource.itemAtIndex(selection);
		
		dispatch_suspend(this.mSuperview.mAnimationQueue);
		this.stopSelectionTimer();
		this.mEntityView.prepare(entity);
		this.mListView.advanceSelection(inOptAnimate, function(){
			dispatch_resume(this.mSuperview.mAnimationQueue);
			this.resetSelectionTimer(this.calculateDelayForEntity(entity));
		}.bind(this));
	},
	calculateDelayForEntity: function(inEntity) {
		var delay = CC_BS_BOT_STATUS_BASE_DELAY;
		if (inEntity.sbStatus == 'error' || inEntity.sbStatus == 'fail' || inEntity.sbStatus == 'test-fail')
			delay += 5000;
		else if (inEntity.sbStatus == 'warning')
			delay += 3000;
		else if (inEntity.sbStatus == 'issue')
			delay += 1000;
		
		if (inEntity.commits.length > 0)
			delay = Math.max(delay, ((5000 * inEntity.commits.length) + (500 * (inEntity.commits.length - 1))));
		
		return Math.min(delay, 30000);
	},
	handleVisibilityChange: function() {
		if (document.hidden || document.webkitHidden)
			return this.pause();
		
		this.resume();
	},
	handleResize: function() {
		if (this.mResizePauseTimer)
			clearTimeout(this.mResizePauseTimer);
		
		this.mResizePauseTimer = setTimeout(this.resume.bind(this), 750);
		this.pause();
	},
	pause: function() {
		if (!this.mPaused)
		{
			logger().info('Pausing Big Screen due to occlusion or resize');
			this.mPaused = true;
			
			if (this.mSelectionTimerDuration != -1 && this.mSelectionTimerStartTime != -1)
				this.mTimeLeftAfterPause = this.mSelectionTimerDuration - (Date.now() - this.mSelectionTimerStartTime);
			else
				this.mTimeLeftAfterPause = -1;
			
			this.stopSelectionTimer();
		}
	},
	resume: function() {
		if (this.mPaused)
		{
			logger().info('Resuming Big Screen');
			this.mPaused = false;
		
			this.mListView.tidy();
		
			if (this.mDataSource.numberOfItems() > 0)
			{
				var entity = this.mDataSource.itemAtIndex(this.mListView.mSelectedItem);
				this.mEntityView.prepare(entity);
				this.resetSelectionTimer((this.mTimeLeftAfterPause != -1) ? this.mTimeLeftAfterPause : this.calculateDelayForEntity(entity));
			}
			else
				this.mEntityView.prepare(null);
		}
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.XcodeServer.BigScreenEmptyView = Class.create(CC.Mvc.View, {
	mClassNames: ['xc-big-screen-empty'],
	render: function() {
		return Builder.node('div', [
			Builder.node('div', {className: 'icon'}),
			Builder.node('div', {className: 'message reltext'}, '_XC.BigScreen.Empty.Label'.loc())
		]);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.







CC.XcodeServer.BIG_SCREEN_NO_STREAM_UPDATE_TIMER = 90000;
CC.XcodeServer.NO_STREAM_UPDATES_INTERVALS_BEFORE_POP_UP = 24;

CC.XcodeServer.BigScreen = Class.create({
	mActivityQueue: null,
	mView: null,
	mBotRunDataSource: null,
	mInitialLoadCompleted: false,
	mTimestampUpdateTimer: null,
	mCyclesWithoutStreamUpdates: 0,
	initialize: function() {
		// if we aren't on a supported browser, bail immediately
		if (!browser().isWebKit())
		{
			this.mView = new CC.XcodeServer.BigScreenView(this);
			this.mView.mControlPanel.showFailure('_XC.BigScreen.Settings.Failure.UnsupportedBrowser'.loc(), '_XC.BigScreen.Settings.Failure.Title.UnsupportedBrowser'.loc(), false);
			this.mView.mParentElement.removeClassName('preload');
			this.mView.mParentElement.addClassName('ready');
			return;
		}
		
		// inject a viewport tag if necessary
		if (browser().isMobileSafari())
		{
			var viewportTag = document.createElement('meta');
			viewportTag.name = 'viewport';
			viewportTag.content = 'width=device-width, initial-scale=1, maximum-scale=1';
			document.head.appendChild(viewportTag);
		}
		
		// create the view and data source
		this.mView = new CC.XcodeServer.BigScreenView(this);
		this.mBotRunDataSource = new CC.XcodeServer.BigScreenBotRunDataSource();
		
		// setup a timestamp update timer
		var nextFire = (60 * 1000) - (Date.now() % (1000 * 60));
		if (nextFire < 1000)
			nextFire += 60000;
		this.mTimestampUpdateTimer = setTimeout(this.updateTimestamps.bind(this), nextFire);
		
		// react to status changes for bot runs we are displaying
		this.mActivityQueue = new CC.XcodeServer.ActivityQueue(true);
		this.mActivityQueue.subscribe(this.handleBotRunActivityStreamUpdate.bind(this));
		globalNotificationCenter().subscribe(CC.XcodeServer.NOTIFICATION_BOT_RUN_ACTIVITY_STREAM_UPDATE, this.mActivityQueue.push.bind(this.mActivityQueue));
		globalNotificationCenter().subscribe(CC.ActivityStream.NOTIFICATION_NO_STREAM_ACTIVITY, this.handleNoStreamUpdates.bind(this));
		globalNotificationCenter().subscribe(CC.ActivityStream.NOTIFICATION_DID_GET_NEW_ACTIVITY_CHUNK, this.handleActivityStreamChunk.bind(this));
		
		// TODO TEMP: debug queue pauses
		dispatch_enable_pause_detection(function(queue){
			logger().warn('Queue', dispatch_queue_get_label(queue), 'appears to have stalled for more than 10 seconds');
			if (this.mView.mBotsView) this.mView.mBotsView.stopSelectionTimer();
			this.mView.mControlPanel.showFailure('_XC.BigScreen.Settings.Failure.QueuePause'.loc());
		}.bind(this), 10000);
		
		// load any past bot runs now
		server_proxy().entitiesForType('com.apple.entity.Bot', function(bots){
			if (bots.length == 0 && CC.meta('x-apple-user-logged-in') == 'false')
			{
				window.location.href = "/auth?send_token=no&redirect=" + window.location;
				return;
			}
			
			var guids = [];
			for (var i = 0; i < bots.length; i++)
			{
				if (!bots[i].isDeleted)
					guids.push(bots[i].guid);
			}
			
			
			var callback = function(response){
				var responses = (response.responses || []);
				if (responses.length == 2) {
					var interestingBotRuns = responses[0].response;
					var terminalBotRuns = responses[1].response;
					var botsRunsByOwnerGuids = {};
					
					for (var i = 0; i < interestingBotRuns.length; i++) {
						var interestingBotRun = interestingBotRuns[i];
						if (interestingBotRun !== null) {
							botsRunsByOwnerGuids[interestingBotRun.ownerGUID] = {};
							botsRunsByOwnerGuids[interestingBotRun.ownerGUID]['interestingBotRun'] = interestingBotRun;
							if (interestingBotRun.status == "running") {
								botsRunsByOwnerGuids[interestingBotRun.ownerGUID]['isRunning'] = true;
							}
							else {
								botsRunsByOwnerGuids[interestingBotRun.ownerGUID]['fetchExtra'] = 'interesting';
								botsRunsByOwnerGuids[interestingBotRun.ownerGUID]['isRunning'] = false;
							}
						}
					}
					
					for (var i = 0; i < terminalBotRuns.length; i++) {
						var terminalBotRun = terminalBotRuns[i];
						if (terminalBotRun !== null) {
							if (botsRunsByOwnerGuids[terminalBotRun.ownerGUID] === undefined) {
								botsRunsByOwnerGuids[terminalBotRun.ownerGUID] = {};
							}
							botsRunsByOwnerGuids[terminalBotRun.ownerGUID]['terminalBotRun'] = terminalBotRun;
							if (botsRunsByOwnerGuids[terminalBotRun.ownerGUID]['fetchExtra'] == undefined || botsRunsByOwnerGuids[terminalBotRun.ownerGUID]['fetchExtra'] == null) {
								botsRunsByOwnerGuids[terminalBotRun.ownerGUID]['fetchExtra'] = 'terminal';
							}
						}
					}
					
					var completionQueue = dispatch_queue_create('com.apple.XcodeServer.BigScreen.initialLoadCompletion');
				
					for (var key in botsRunsByOwnerGuids)
					{
						if (botsRunsByOwnerGuids[key])
						{
							var botRuns = botsRunsByOwnerGuids[key];
							var botRun = null;
							if ((botRuns['fetchExtra'] && botRuns['fetchExtra'] == 'interesting') || (botRuns['fetchExtra'] == undefined && botRuns['interestingBotRun'] !== undefined)) {
								botRun = botRuns['interestingBotRun'];
							}
							else if (botRuns['fetchExtra'] && botRuns['fetchExtra'] == 'terminal'){
								botRun = botRuns['terminalBotRun'];
							}
							
							dispatch_suspend(completionQueue);
							this.fetchFullBotRunInformation(botRun, null, function(theEntity){
								var isRunning = (botsRunsByOwnerGuids[theEntity.ownerGUID]['isRunning'] || false);
								this.mBotRunDataSource.updateItem(theEntity, false, isRunning);
								dispatch_resume(completionQueue);
							}.bind(this));
						}
					}
				
					// this will be called after all suspensions are lifted
					dispatch_async(completionQueue, function(){
						this.mView.completeInitialLoad(function(){
							this.mInitialLoadCompleted = true;
						}.bind(this));
					}.bind(this));
				}
			};
			
			var batch = [
				['XCBotService', 'latestInterestingBotRunForBotsWithGUIDs:', [guids]],
				['XCBotService', 'latestTerminalBotRunForBotsWithGUIDs:', [guids]]
			];
			service_client().batchExecuteAsynchronously(batch, null, callback.bind(this), function(){ console.log('error'); });

		}.bind(this), Prototype.emptyFunction);
	},
	view: function() {
		return this.mView;
	},
	handleBotRunActivityStreamUpdate: function(inActivity, inContinuation) {
		var botRunGUID = (inActivity && inActivity.entityGUID);
		if (botRunGUID)
		{	
			if (inActivity.action == 'com.apple.activity.EntityRemoved')
				this.processBotDeletion(inActivity.ownerGUID, inContinuation);
			else
			{
				server_proxy().entityForGUID(botRunGUID, function(theEntity){
					this.fetchFullBotRunInformation(theEntity, inContinuation, this.processNewBotRun.bind(this));
				}.bind(this), Prototype.emptyFunction);
			}
		}
	},
	handleActivityStreamChunk: function(inActivity, inContinuation) {
		this.mCyclesWithoutStreamUpdates = 0;
		this.mView.mControlPanel.hideFailure();
	},
	handleNoStreamUpdates: function(inActivity, inContinuation) {
		this.mCyclesWithoutStreamUpdates++;
		if (this.mCyclesWithoutStreamUpdates >= CC.XcodeServer.NO_STREAM_UPDATES_INTERVALS_BEFORE_POP_UP) {
			logger().info("Show Big Screen popup.");
			this.mView.mControlPanel.showFailure();
		}
	},
	fetchFullBotRunInformation: function(theEntity, continuation, callback) {
		// fetch test information
		service_client().executeAsynchronously('XCGraphService', 'timeseriesDataForEntityGUID:andCategory:inRange:', [theEntity.ownerGUID, CC.XcodeServer.TIMESERIES_CATEGORY_TEST_RUN, [0, 1]], null, function(response){
			// pull out device test information
			theEntity.devices = CC.XcodeServer.deviceTestInformationForTimeseriesData(response.response);
			
			// fetch commit information
			if (theEntity.scmCommitGUIDs)
			{
				server_proxy().entitiesForGUIDs(theEntity.scmCommitGUIDs, function(commitEntities){
					theEntity.commits = [];
					
					for (var i = 0; i < commitEntities.length; i++)
						theEntity.commits.push({author: {name: commitEntities[i].authorName, email: commitEntities[i].authorEmail}, message: commitEntities[i].message, date: commitEntities[i].time, filesChanged: (commitEntities[i].extendedAttributes.changedFiles) ? Object.keys(commitEntities[i].extendedAttributes.changedFiles).length : 0});
			
					callback(theEntity, continuation);
				}.bind(this), Prototype.emptyFunction);
			}
			else
			{
				theEntity.commits = [];
				callback(theEntity, continuation);
			}
		}.bind(this));
	},
	processNewBotRun: function(theEntity, inContinuation) {
		var botsView = this.mView.mBotsView;
		
		// update the data source
		var action = this.mBotRunDataSource.updateItem(theEntity, (this.mInitialLoadCompleted && botsView != null));
	
		// determine what to do with this information
		if (this.mInitialLoadCompleted && botsView != null && action.mAction != CC_BS_DATA_SOURCE_ACTION_IGNORE)
		{
			if (action.mAction == CC_BS_DATA_SOURCE_ACTION_INSERT)
				botsView.insertRunAtIndex(theEntity, action.mNewIndex, inContinuation);
			else if (action.mAction == CC_BS_DATA_SOURCE_ACTION_UPDATE)
				botsView.updateRunWithIndices(theEntity, action.mOldIndex, action.mNewIndex, inContinuation);
			else
				botsView.reloadData(inContinuation);
			
			if (action.mNewIndex > -1)
				botsView.runStartedOrChanged(theEntity, action.mNewIndex);
			
			if (action.mWasRunning && !theEntity.sbRunning)
				botsView.runCompleted(theEntity, action.mNewIndex);
		}
		else if (botsView == null && action.mAction == CC_BS_DATA_SOURCE_ACTION_INSERT && this.mBotRunDataSource.numberOfItems() == 1)
			this.mView.reload(inContinuation);
		else
			inContinuation.ready();
	},
	processBotDeletion: function(theEntityGUID, inContinuation) {
		var botsView = this.mView.mBotsView;
		var theEntity = {ownerGUID: theEntityGUID};
		
		// update the data source with a fake entity
		var action = this.mBotRunDataSource.removeItem(theEntity);
		
		// update the relevant views
		if (this.mInitialLoadCompleted && botsView != null && action.mAction == CC_BS_DATA_SOURCE_ACTION_REMOVE && this.mBotRunDataSource.numberOfItems() > 0)
			botsView.removeRunAtIndex(theEntity, action.mOldIndex, inContinuation);
		else if (botsView != null && action.mAction == CC_BS_DATA_SOURCE_ACTION_REMOVE && this.mBotRunDataSource.numberOfItems() == 0)
			this.mView.reload(inContinuation);
		else
			inContinuation.ready();
	},
	updateTimestamps: function() {
		globalNotificationCenter().publish(CC_BS_TIMESTAMP_NOTIFICATION, this);
		
		// calculate the next fire date
		var nextFire = (60 * 1000) - (Date.now() % (1000 * 60));
		if (nextFire < 1000)
			nextFire += 60000;
		this.mTimestampUpdateTimer = setTimeout(this.updateTimestamps.bind(this), nextFire);
	}
});

CC.XcodeServer.BigScreenView = Class.create(CC.Mvc.View, CC.Keyboard.Mixins.Responder, {
	mClassNames: ['xc-big-screen', 'preload', 'titlebarDisabled'],
	mController: null,
	mAnimationQueue: null,
	mMouseTimer: null,
	mLastMouseCoords: null,
	mControlPanel: null,
	mTitlebarFirstLoad: false,
	mLoadCompletionCallback: null,
	mBotsView: null,
	mEmptyView: null,
	initialize: function($super, inController) {
		$super();
		this.forceRender();
		this.mController = inController;
		this.becomeFirstResponder();
		
		// create a dispatch queue
		this.mAnimationQueue = dispatch_queue_create('com.apple.XcodeServer.BigScreenView.animations');
		
		// this.mPageSizeHelper = new CC.XcodeServer.BigScreenPageInnerView();
		// this.mPageSizeHelper.mParentElement.style.zIndex = '-10';
		// this.addSubview(this.mPageSizeHelper);
		
		// setup a control panel
		this.mControlPanel = new CC.XcodeServer.BigScreenControlPanelView();
		this.addSubview(this.mControlPanel);
		
		// setup listeners for window resize and mouse move
		this.mLastMouseCoords = {x: -1, y: -1};
		document.addEventListener('mousemove', this.handleMouseMove.bind(this), false);
		window.addEventListener('resize', this.handleWindowResize.bind(this), false);
		
		// reset timers
		this.resetMouseTimer();
		
		// block the animation queue until the initial load completes
		dispatch_suspend(this.mAnimationQueue);
		dispatch_async(this.mAnimationQueue, function(){
			dispatch_suspend(this.mAnimationQueue);
			
			if (this.mLoadCompletionCallback)
			{
				this.mLoadCompletionCallback();
				this.mLoadCompletionCallback = null;
			}
			
			// TODO: address this once we have multiple screens
			if (this.mBotsView)
			{
				this.mBotsView._reloadData();
				this.mBotsView.prepareForIntroduction();
			}
				
			
			// enable the titlebar after 3 seconds
			setTimeout(function(){
				this.mTitlebarFirstLoad = true;
				this.mParentElement.addClassName('titlebarFirstLoad');
				this.mParentElement.removeClassName('titlebarDisabled');
			}.bind(this), 3000);
			
			var self = this;
			function fixer(){
				this.removeEventListener('webkitTransitionEnd', fixer, false);
				this.removeClassName('ready');
				if (self.mBotsView && self.mBotsView.mDataSource.numberOfItems() > 0)
				{
					self.mBotsView.introduce(function(){
						self.mBotsView.resetSelectionTimer(self.mBotsView.calculateDelayForEntity(self.mBotsView.mDataSource.itemAtIndex(0)));
						dispatch_resume(self.mAnimationQueue);
					});
				}
				else	
					dispatch_resume(self.mAnimationQueue);
			}
			
			this.mParentElement.addEventListener('webkitTransitionEnd', fixer, false);
			this.mParentElement.removeClassName('preload');
			this.mParentElement.addClassName('ready');
			if (document.hidden || document.webkitHidden)
				fixer.call(this.mParentElement);
		}.bind(this));
	},
	completeInitialLoad: function(inCallback) {
		this.mLoadCompletionCallback = inCallback;
		
		if (this.mController.mBotRunDataSource.numberOfItems() > 0)
			this.loadBotsView();
		else
			this.loadEmptyView();
		
		dispatch_resume(this.mAnimationQueue);
	},
	reload: function(inOptContinuation) {
		var q = this.mAnimationQueue;
		dispatch_suspend(q);
		
		function continuation() {
			this.removeEventListener('webkitTransitionEnd', continuation, false);
			dispatch_resume(q);
		}
		
		this.mParentElement.addEventListener('webkitTransitionEnd', continuation, false);
		this.mParentElement.addClassName('preload');
		
		dispatch_async(this.mAnimationQueue, function(){
			if (this.mController.mBotRunDataSource.numberOfItems() > 0)
			{
				this.purgeEmptyView();
				this.loadBotsView();
				this.mBotsView._reloadData();
			}
			else
			{
				this.purgeBotsView();
				this.loadEmptyView();
			}
			
			var self = this;
			function fixer(){
				this.removeEventListener('webkitTransitionEnd', fixer, false);
				this.removeClassName('ready');
				if (self.mBotsView && self.mBotsView.mDataSource.numberOfItems() > 0)
					self.mBotsView.resetSelectionTimer(self.mBotsView.calculateDelayForEntity(self.mBotsView.mDataSource.itemAtIndex(0)));
				dispatch_resume(self.mAnimationQueue);
				inOptContinuation.ready();
			}
			
			this.mParentElement.addEventListener('webkitTransitionEnd', fixer, false);
			this.mParentElement.removeClassName('preload');
			this.mParentElement.addClassName('ready');
			if (document.hidden || document.webkitHidden)
				fixer.call(this.mParentElement);
		}.bind(this));
		
		if (document.hidden || document.webkitHidden)
			continuation.call(this.mParentElement);
	},
	loadBotsView: function() {
		if (!this.mBotsView)
		{
			this.mBotsView = new CC.XcodeServer.BigScreenBotsView();
			this.mBotsView.setDataSource(this.mController.mBotRunDataSource);
			this.addSubview(this.mBotsView);
		}
		
		return this.mBotsView;
	},
	purgeBotsView: function() {
		if (this.mBotsView)
		{
			this.removeSubviews([this.mBotsView]);
			this.mBotsView = null;
		}
	},
	loadEmptyView: function() {
		if (!this.mEmptyView)
		{
			this.mEmptyView = new CC.XcodeServer.BigScreenEmptyView();
			this.addSubview(this.mEmptyView);
		}
		
		return this.mEmptyView;
	},
	purgeEmptyView: function() {
		if (this.mEmptyView)
		{
			this.removeSubviews([this.mEmptyView]);
			this.mEmptyView = null;
		}
	},
	handleWindowResize: function() {
		// this code exists to work around a WebKit bug where variable-size text
		// doesn't get resized with the browser window
		var els = document.querySelectorAll('.xc-big-screen .reltext, .xc-big-screen-control-panel .title, .xc-big-screen-control-panel .button, .xc-big-screen-control-panel .label, .xc-big-screen-control-panel label, .xc-big-screen-control-panel .message');
		for (var i = 0; i < els.length; i++)
			els[i].style.zIndex = '1';
		
		// anything with pixel dimensions will also need a resize
		globalNotificationCenter().publish(CC_BS_RESIZE_NOTIFICATION, this);
	},
	handleMouseMove: function(e) {
		if (e.screenX != this.mLastMouseCoords.x || e.screenY != this.mLastMouseCoords.y)
		{
			this.mLastMouseCoords = {x: e.screenX, y: e.screenY};
			
			if (this.mMouseTimer == null)
				return;
			
			this.resetMouseTimer();
			this.showMouseUI();
		}
	},
	stopMouseTimer: function() {
		if (this.mMouseTimer != null && this.mMouseTimer !== 1)
		{
			clearTimeout(this.mMouseTimer);
			this.mMouseTimer = null;
		}
	},
	resetMouseTimer: function() {
		this.stopMouseTimer();
		this.mMouseTimer = setTimeout(this.hideMouseUI.bind(this), 2000);
	},
	showMouseUI: function() {
		document.body.removeClassName('nomouse');
		
		if (this.mTitlebarFirstLoad)
		{
			this.mTitlebarFirstLoad = false;
			this.mParentElement.removeClassName('titlebarFirstLoad');
		}
	},
	hideMouseUI: function() {
		this.mMouseTimer = null; // disable mouse moves
		document.body.addClassName('nomouse');
		
		if (this.mTitlebarFirstLoad)
		{
			this.mTitlebarFirstLoad = false;
			this.mParentElement.removeClassName('titlebarFirstLoad');
		}
		
		setTimeout(function() {
			this.mMouseTimer = 1; // enable mouse moves
		}.bind(this), 10);
	},
	handleKeyboardNotification: function(inMessage, inObject, inOptExtras) {
		if (inMessage == CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SPACE)
		{
			this.mControlPanel.toggleFullscreen();
			inOptExtras.event.preventDefault();
			inOptExtras.event.stopPropagation();
		}
	}
});

