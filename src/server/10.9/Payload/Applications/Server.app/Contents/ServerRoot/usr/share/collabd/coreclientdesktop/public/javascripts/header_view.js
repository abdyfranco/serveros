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

//= require "./core.js"
//= require "./quicksearch.js"
//= require_tree "./header_menu_items"

// Black header bar view class.

CC.HeaderView = Class.create(CC.Mvc.View, {
	mBreadcrumbItems: [],
	mTopLevelMenuItems: [
		new CC.MenuItems.PlusMenu(),
		new CC.MenuItems.GearMenu(),
		new CC.MenuItems.Login(),
		new CC.MenuItems.Logout()
	],
	mTopLevelPlusMenuIndex: 0,
	mTopLevelGearMenuIndex: 1,
	mPlusMenuItems: [],
	mGearMenuItems: [],
	initialize: function($super) {
		$super();
		// Automatically update when meta tags change
		globalNotificationCenter().subscribe(CC.Meta.NOTIFICATION_DID_REFRESH_META_TAGS, this.updateDisplayStateForMenuItems.bind(this));
	},
	render: function() {
		var header = Builder.node('div', {id: 'header', className: 'cc-header-view chrome'}, [
			this.renderBreadcrumbs(),
			this.renderTopLevelMenuItems(),
			Builder.node('div', {style: 'display: block; clear: both;'})
		]);
		this.mPoliteLoginPrompt = new CC.PoliteLoginPrompt();
		return header;
	},
	makeAccessible: function() {
		
		// Set Navigation landmark (Actions/Nav)
		this.mParentElement.writeAttribute('role', 'toolbox');
		this.mParentElement.writeAttribute('aria-label', "_Accessibility.Navigation.Main".loc());
		
		// Add role to actions in the Navigation landmark
		var navigationItems = this.mParentElement.querySelectorAll("li:not([style*='display: none']) a");	
		
		for (var i = 0; i < navigationItems.length; i++) {			
			navigationItems[i].writeAttribute("role", "button");
			navigationItems[i].writeAttribute("aria-haspopup", "true");			
		}
		
		// search box
		var search = this.mParentElement.querySelector('#search');
		if (search) {
			search.writeAttribute("role", "search");
		}
		
	},
	handleDidRenderView: function($super, inOptInfo) {
		$super(inOptInfo);
		this.setPlusMenuItems(this.mPlusMenuItems);
		this.setGearMenuItems(this.mGearMenuItems);
	},
	renderBreadcrumbs: function() {
		var ul = Builder.node('ul', {'role': 'presentation', className: 'buttonbar hierarchy'});
		var breadcrumbs = this.mBreadcrumbItems, breadcrumb;
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GENERAL);
		// First append the first breadcrumb which is always added automatically.
		this.cachedNavLink = this.cachedNavLink || Builder.node('li', {'role': 'presentation'}, [
			Builder.node('a', {tabindex: tabIndex}, "_General.Navigation".loc())
		]);
		ul.appendChild(this.cachedNavLink);
		// Next iterate over any breadcrumbs we were passed and render breadcrumbs in order.
		var a;
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GENERAL);
		for (var idx = 0; idx < breadcrumbs.length; idx++) {
			breadcrumb = breadcrumbs[idx];
			a = document.createElement('a');
			a.writeAttribute('tabindex', ++tabIndex); // using a range from 10 to 19 (collition with 20: we don't have more then 5 items...)
			if (breadcrumb.mURL) a.href = breadcrumb.mURL;
			if (breadcrumb.mTooltip) a.title = breadcrumb.mTooltip;
			a.innerHTML = (breadcrumb.mDisplayTitle || "###").strip().escapeHTML();
			ul.appendChild(Builder.node('li', [a]));
		}
		return ul;
	},
	// Updates the breadcrumb bar for the current set of items.
	updateBreadcrumbsFromItems: function() {
		var _ul = this.mParentElement.down('ul.hierarchy');
		var ul = this.renderBreadcrumbs();
		_ul.parentElement.replaceChild(ul, _ul);
	},
	// Updates the current set of breadcrumb items and redraws the breadcrumb bar.
	setBreadcrumbItems: function(inBreadcrumbItems) {
		this.mBreadcrumbItems = (inBreadcrumbItems || []);
		this.updateBreadcrumbsFromItems();
	},
	resetBreadcrumbItems: function() {
		this.setBreadcrumbItems([]);
	},
	// Updates the current set of plus menu items.
	setPlusMenuItems: function(inPlusMenuItems) {
		this.mPlusMenuItems = (inPlusMenuItems || []);
		if (this.mPlusMenu) this.mPlusMenu.destroy();
		var addButton = this.$().down('a.add');
		if (addButton) {
			Event.stopObserving('click', addButton);
			this.mPlusMenu = new CC.Menu(this.__buildListFromMenuItems(this.mPlusMenuItems), addButton, this.updateDisplayStateForMenuItems.bind(this));
		}
		this.updateDisplayStateForMenuItems();
	},
	resetPlusMenuItems: function() {
		this.setPlusMenuItems([]);
	},
	// Updates the current set of gear menu items.
	setGearMenuItems: function(inGearMenuItems) {
		this.mGearMenuItems = (inGearMenuItems || []);
		if (this.mGearMenu) this.mGearMenu.destroy();
		var gearButton = this.$().down('a.gear');
		if (gearButton) {
			Event.stopObserving('click', gearButton);
			var items = this.mGearMenuItems;
			this.mGearMenu = new CC.Menu(this.__buildListFromMenuItems(items), gearButton, this.updateDisplayStateForMenuItems.bind(this));
		}
		this.updateDisplayStateForMenuItems();
	},
	resetGearMenuItems: function() {
		this.setGearMenuItems([]);
	},
	// Helper function that builds a <ul> element from an array of CC.MenuItem instances.
	__buildListFromMenuItems: function(inMenuItems) {
		var ul = document.createElement('ul');
		var items = (inMenuItems || []) , item;
		for (var idx = 0; idx < items.length; idx++) {
			item = items[idx];
			if (item && item.mElement) ul.appendChild(item.mElement); 
		}
		return ul;
	},
	renderTopLevelMenuItems: function() {
		var ul = this.__buildListFromMenuItems(this.mTopLevelMenuItems);
		ul.className = 'buttonbar actions';
		ul.writeAttribute('role', 'presentation');
		return ul;
	},
	// Updates the display state for all menu items.
	updateDisplayStateForMenuItems: function() {
		this.__updateDisplayStateForMenuItems(this.mTopLevelMenuItems);
		if (this.mTopLevelPlusMenuIndex != undefined) {
			var showPlusMenu = this.__updateDisplayStateForMenuItems(this.mPlusMenuItems);
			var plusMenuElement = this.mTopLevelMenuItems[this.mTopLevelPlusMenuIndex].mElement;
			if (plusMenuElement) showPlusMenu ? plusMenuElement.show() : plusMenuElement.hide();
		}
		if (this.mTopLevelGearMenuIndex != undefined) {
			this.__updateDisplayStateForMenuItems(this.mGearMenuItems);
			// Always show the gear menu (because we always show at least the help item).
			var gearMenuElement = this.mTopLevelMenuItems[this.mTopLevelGearMenuIndex].mElement;
			if (gearMenuElement) gearMenuElement.show();
		}
	},
	__updateDisplayStateForMenuItems: function(inMenuItems) {
		var items = (inMenuItems || []), item;
		var atLeastOneItemShown = false;
		for (var idx = 0; idx < items.length; idx++) {
			item = items[idx];
			if (item) {
				var didShow = item.updateDisplayState();
				if (didShow) atLeastOneItemShown = true;
			}
		}
		return atLeastOneItemShown;
	}
});