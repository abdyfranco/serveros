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
//= require "./mvc/mvc.js"
//= require "./menu.js"

CC.FILTER_BAR_DID_CHANGE_KEYWORD = "FILTER_BAR_DID_CHANGE_KEYWORD";
CC.FILTER_BAR_DID_CHANGE_FILTER = "FILTER_BAR_DID_CHANGE_FILTER";
CC.FILTER_BAR_DID_CHANGE_SORT_KEY = "FILTER_BAR_DID_CHANGE_SORT_KEY";

// Default filtering/sorting options.

CC.FILTER_BAR_ALLOWED_FILTERS = ['everything', 'unread', 'favorites'];
CC.FILTER_BAR_ALLOWED_SORT_KEYS = $H({
	'title': '-longName'
});

// Basic filter bar view.

CC.FilterBarView = Class.create(CC.Mvc.View, {
	mKeyword: null,
	mTags: [],
	mFilter: 'everything',
	// mSortKey is the query-compatible key.
	mSortKey: '+longName',
	// _mSortKey is the sort direction agnostic version of the sort key.
	_mSortKey: 'title',
	// Allow overriding the filters/sort keys used by this filter bar.
	mAllowedFilters: CC.FILTER_BAR_ALLOWED_FILTERS,
	mAllowedSortKeys: CC.FILTER_BAR_ALLOWED_SORT_KEYS,
	// Format strings (substituted with capitilized filter/sort keys at runtime).
	mFilterTitleFormatString: "_FilterBarView.Filters.%@.Title",
	mFilterTooltipFormatString: "_FilterBarView.Filters.%@.Tooltip",
	mSortKeyTitleFormatString: "_FilterBarView.SortKeys.%@.Title",
	mSortKeyTooltipFormatString: "_FilterBarView.SortKeys.%@.Tooltip",
	// Popup menu.
	mSortDirectionMenu: null,
	mFilterBarKeypressDelay: 500,
	initialize: function($super) {
		$super();
		this.mAllowedFilters = (this.mAllowedFilters || new Array());
		this.mAllowedSortKeys = (this.mAllowedSortKeys || new Hash());
	},
	render: function() {
		var filterTooltipFormat = this.mFilterTooltipFormatString;
		var filterTitleFormat = this.mFilterTitleFormatString;
		var sortTooltipFormat = this.mSortKeyTooltipFormatString;
		var sortTitleFormat = this.mSortKeyTitleFormatString;
		var currentCapitalizedSortKey = this._mSortKey.capitalizeFirstCharacter();
		var tabIndexFilterMain = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_FILTER_MAIN);
		var tabIndexFilterSortBy = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_FILTER_SORT_BY);
		var tabIndexFilterSortByType = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_FILTER_SORT_BY_TYPE);
		var tabIndexFilterKeyWord = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_FILTER_KEYWORD);
						
		var elem = Builder.node('div', {className: 'cc-filter-bar-view'}, [
			Builder.node('div', {'role': 'presentation', className: 'section first'}, this.mAllowedFilters.collect(function(filter) {
				var capitalizedFilterName = filter.capitalizeFirstCharacter();
				var button = Builder.node('a', {'tabindex': tabIndexFilterMain++, className: 'button' + (filter == this.mFilter ? ' selected' : ''), name: filter, title: filterTooltipFormat.fmt(capitalizedFilterName).loc()}, filterTitleFormat.fmt(capitalizedFilterName).loc());
				Event.observe(button, 'click', this.handleFilterButtonClicked.bind(this));
				return button;
			}, this)),
			Builder.node('div', {'tabindex': '-1', className: 'section'}),
			Builder.node('div', {'tabindex': '-1', className: 'section last'}, [
				Builder.node('div', {className: 'cc-filter-bar-view-popup'}, [
					Builder.node('a', {'tabindex': tabIndexFilterSortBy, href: '#'}, "_FilterBarView.SortBy".loc()),
					Builder.node('span', {'tabindex': tabIndexFilterSortByType, className: 'cc-filter-bar-view-popup-selected', title: sortTooltipFormat.fmt(currentCapitalizedSortKey).loc()}, sortTitleFormat.fmt(currentCapitalizedSortKey).loc()),
					Builder.node('div', {className: 'cc-filter-bar-popup-menu', style: 'display: none;'}, [
						Builder.node('ul', {className: 'items'}, this.mAllowedSortKeys.collect(function(value, index) {
							var sortKey = value[0];
							var capitalizedSortKey = sortKey.capitalizeFirstCharacter();
							var listItem = Builder.node('li', [
								Builder.node('a', {'tabindex': tabIndexFilterSortByType, 'role': 'button', className: 'button' + (sortKey == this._mSortKey ? ' selected' : ''), name: sortKey, title: sortTooltipFormat.fmt(capitalizedSortKey).loc()}, sortTitleFormat.fmt(capitalizedSortKey).loc())
							]);
							Event.observe(listItem, 'click', this.handleSortOptionClicked.bind(this));
							return listItem;
						}, this))
					])
				]),
				Builder.node('div', {className: 'cc-filter-bar-view-keyword'}, [
					Builder.node('input', {'tabindex': tabIndexFilterKeyWord, 'id': 'filter_keyword', 'type': 'text', 'placeholder': "_FilterBarView.Filter".loc()})
				])
			])
		]);
		// Observe keyup events in the filter field.
		var filterInput = elem.down('.cc-filter-bar-view-keyword input');
		Event.observe(filterInput, 'keyup', this.handleFilterInputKeyUp.bind(this));
		// Initialize the sort popup menu if we have items, otherwise hide it.
		if (this.mAllowedSortKeys.keys().length <= 0) {
			elem.down('.cc-filter-bar-view-popup').hide();
		} else {
			this.mSortDirectionMenu = new CC.Menu(elem.down('.cc-filter-bar-popup-menu'), elem.down('.cc-filter-bar-view-popup-selected'));
		}
		return elem;
	},
	makeAccessible: function() {
		// Set Navigation landmark (Filter/Nav)
		this.mParentElement.writeAttribute('role', 'navigation');
		this.mParentElement.writeAttribute('aria-label', "_Accessibility.MenuBar.Filter".loc());
				
		var navigationItems = this.mParentElement.querySelectorAll("a");
		var sortBy = this.mParentElement.querySelector('span');
		var keywordInput = this.mParentElement.querySelector('#filter_keyword');
		sortBy.writeAttribute("role", "listbox");
		keywordInput.writeAttribute("role", "search");
		
		for (var i = 0; i < navigationItems.length; i++) {			
			navigationItems[i].writeAttribute("role", "link");
		}
		
	},
	handleFilterButtonClicked: function(inEvent) {
		var source = Event.findElement(inEvent, '.button');
		if (source) this.setFilter(source.getAttribute('name'));
	},
	handleSortOptionClicked: function(inEvent) {
		var item = Event.findElement(inEvent, 'a.button');
		if (item) this.setSortKey(item.getAttribute('name'));
	},
	handleFilterInputKeyUp: function(inEvent) {
		var keyword = Event.findElement(inEvent, 'input').getValue();
		if (this.mFilterInputKeyTimer) clearTimeout(this.mFilterInputKeyTimer);
		this.mFilterInputKeyTimer = setTimeout(function() {
			this.setKeyword(keyword);
		}.bind(this), this.mFilterBarKeypressDelay);
	},
	setKeyword: function(inKeyword) {
		this.mKeyword = inKeyword;
		globalNotificationCenter().publish(CC.FILTER_BAR_DID_CHANGE_KEYWORD, this, {keyword: this.mKeyword});
	},
	setFilter: function(inFilter) {
		if (!inFilter) return false;
		this.mFilter = inFilter;
		var buttons = this.$().select('.section.first .button'), button;
		for (var bdx = 0; bdx < buttons.length; bdx++) {
			button = buttons[bdx];
			if (button) {
				button.removeClassName('selected');
				if (button.getAttribute('name') == inFilter) {
					button.addClassName('selected');
				}
			}
		}
		globalNotificationCenter().publish(CC.FILTER_BAR_DID_CHANGE_FILTER, this, {filter: this.mFilter});
	},
	setSortKey: function(inSortKey) {
		if (!inSortKey) return false;
		this._mSortKey = inSortKey;
		this.mSortKey = this.mAllowedSortKeys.get(this._mSortKey);
		// Update the currently selected filter.
		var selected = this.$().down('.cc-filter-bar-view-popup-selected');
		var capitalizedSortKey = this._mSortKey.capitalizeFirstCharacter();
		selected.setAttribute('title', this.mSortKeyTooltipFormatString.fmt(capitalizedSortKey).loc());
		selected.innerHTML = this.mSortKeyTitleFormatString.fmt(capitalizedSortKey).loc();
		// Update the popup menu.
		if (this.mSortDirectionMenu) {
			var buttons = this.mSortDirectionMenu.menu.select('.items .button');
			buttons.invoke('removeClassName', 'selected');
			var foundButton = buttons.find(function(b) {
				return (b && b.getAttribute('name') == inSortKey);
			});
			if (foundButton) foundButton.addClassName('selected');
		}
		globalNotificationCenter().publish(CC.FILTER_BAR_DID_CHANGE_SORT_KEY, this, {sortKey: this._mSortKey});
	},
	setTags: function(inTags) {
		if (inTags == undefined) return false;
		this.mTags = inTags;
		globalNotificationCenter().publish(CC.FILTER_BAR_DID_CHANGE_TAGS, this, {tags: this.mTags});
	}
});
