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

// Simple wrapper class for link item with a title/tooltip/url/route.

CC.ItemWithTitleAndURL = Class.create(CC.Object, {
	mDisplayTitle: null,
	mTooltip: null,
	mURL: null
});
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

CC.Collection = Class.create({
	
	itemClass: null,
	itemSelector: null,
	itemInsertionPoint: 'bottom',
	
	initialize: function(element) {
		this.element = $(element);
		if (this.itemClass && this.itemSelector) {
			this._items = this.element.select(this.itemSelector).map(function(e){ 
				var item = new (this.itemClass)(e);
				item.collection = this;
				return item;
			}, this);
		} else {
			this._items = [];
		}
		this._selection = [];
	},
	
	
	isValidItem: function(item) {
		return !!item && !!item.element && (item instanceof this.itemClass);
	},
	
	getItemForElement: function(element) {
		return this.getItems().find(function(item) { return item.element == element; });
	},
	getItems: function() {
		return this._items;
	},
	setItems: function(items) {
		return this._items = items;
	},
	
	isMember: function(item) {
		return !!item && this.getItems().include(item);
	},
	add: function(item) {
		if (!this.isValidItem(item)) return false;
		if (this.isMember(item)) return false;
		item.collection = this;
		// insert into the items array
		this.getItems().push(item);
		// insert into the DOM
		var insertion = {};
		insertion[this.itemInsertionPoint] = item.element;
		this.element.insert(insertion);
		// notify
		this.element.fire('item:added', item);
		return item;
	},
	remove: function(item) {
		if (!this.isMember(item)) return false;
		this.deselect(item);
		item.element.remove();
		item.collection = undefined;
		this.setItems(this.getItems().without(item));
		this.element.fire('item:removed', item);
		return item;
	},
	removeSelection: function() {
		this.getSelection().clone().each(function(i) { this.remove(i); }, this);
	},
	removeIndex: function(i) {
		var item = this._items[i];
		this.remove(item);
		this.element.fire('item:removed', item);
		return item;
	},
	
	getSelection: function() {
		return this._selection;
	},
	setSelection: function(items) {
		return this._selection = items;
	},
	hasSelection: function() {
		return this._selection.length > 0;
	},
	isSelected: function(item) {
		return this.getSelection().include(item);
	},
	
	select: function(item) {
		if (!this.isMember(item) || this.isSelected(item)) return false;
		this.getSelection().push(item);
		item.element.addClassName('selected');
		if (item.select) {
			item.select();
		}
		return true;
	},
	selectAll: function() {
		this.getItems().clone().each(function(i) { this.select(i); }, this);
	},
	
	deselect: function(item) {
		if (!this.isMember(item) || !this.isSelected(item)) return false;
		this.setSelection(this.getSelection().without(item));
		item.element.removeClassName('selected');
		if (item.deselect) {
			item.deselect();
		}
		return true;
	},
	deselectAll: function() {
		this.getSelection().clone().each(function(i) { this.deselect(i); }, this);
	}

});
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



CC.BreadcrumbItem = Class.create(CC.ItemWithTitleAndURL, {
	
});
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



// Class for a simple menu item, which is a wrapper around an <li> element with some added sauce.

CC.MenuItem = Class.create({
	mDisplayTitle: null,
	mDisplayTitleLocKey: null,
	mTooltip: null,
	mTooltipLocKey: null,
	mClassName: null,
	mURL: null,
	initialize: function() {
		// Build the DOM element for this menu item.
		this.mElement = this.buildElement();
		// Attach a unique identifer we can use to register this with the global event delegate.
		var randomString = buildRandomString();
		this.mElement.setAttribute('data-responder-id', randomString);
		// Register this event responder (only when we're actually using routes).
		if (!this.mURL) {
			globalEventDelegate().registerDomResponderForEventByIdentifer('click', randomString, this.handleElementClicked.bindAsEventListener(this));
		}
	},
	getAccessibilityID: function() { /* interface */ },
	getElementID: function() { /* interface */ },
	buildElement: function() {
		var li = document.createElement('li');
		var a = document.createElement('a');
		var displayTitle = this.mDisplayTitle;
		if (!displayTitle && this.mDisplayTitleLocKey) displayTitle = this.mDisplayTitleLocKey.loc();
		a.innerHTML = (displayTitle ? displayTitle.escapeHTML() : "???");
		if (this.mTooltip) {
			a.title = this.mTooltip;
		} else if (this.mTooltipLocKey) {
			a.title = this.mTooltipLocKey.loc();
		}
		a.className = "cc-menu-item"
		a.setAttribute('tabindex', this.getAccessibilityID());
		a.setAttribute('role', 'menuitem');
		
		// Used for aria-labelledBy attribute
		if (this.getElementID())
			a.setAttribute('id', this.getElementID());
		
		if (this.mClassName) a.className += " %@".fmt(this.mClassName);
		if (this.mURL) a.href = this.mURL;
		li.appendChild(a);
		return Element.extend(li);
	},
	handleElementClicked: function(inEvent) {
		this.action(inEvent);
	},
	// Your subclass should override this function.
	itemShouldDisplay: function() {
		return true;
	},
	// Updates the hidden state of this menu extra by evaluating itemShouldDisplay.  If your subclass needs
	// to update itself (e.g. changing the displayed text), override this function and do it there.
	updateDisplayState: function() {
		var shouldDisplay = this.itemShouldDisplay();
		shouldDisplay ? this.mElement.show() : this.mElement.hide();
		return shouldDisplay;
	},
	markAsSelected: function(inOptShouldBeSelected) {
		var selected = (inOptShouldBeSelected == undefined ? true : inOptShouldBeSelected);
		if (selected && !this.mElement.hasClassName('selected')) {
			this.mElement.addClassName('selected');
		} else if (!selected && this.mElement.hasClassName('selected')) {
			this.mElement.removeClassName('selected');
		}
	},
	// Your subclass should implement this function or set mURL on this class.
	action: function(inEvent) {}
});
// Copyright (c) 2012-2014 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.Popover = Class.create(CC.Keyboard.Mixins.Responder, {
	initialize: function(inOptToggleBtn) {
		var element = Builder.node('div', {className:"popover left"}, [
			Builder.node('div', {className: "content"}),
			Builder.node('div', {className: "norgie"})
		]);
		var content = this.renderPopoverContent();
		if (content) element.down('.content').appendChild(content);
		this.element = element;
		this.toggleButton = inOptToggleBtn;
		if (this.toggleButton) {
			this.toggleButton.on('click', this.toggle.bindAsEventListener(this));
		}
		this.element.hide();
		this.visible = false;
		document.body.appendChild(this.element);
		Event.observe(window, 'mousedown', this.handleWindowMouseDown.bindAsEventListener(this));
		this.makeAccessible();
	},
	renderPopoverContent: function() { /* Interface */
		return document.createElement('div');
	},
	makeAccessible: function() { },
	show: function() {
		this.becomeFirstResponder();
		this.element.show();
		this.visible = true;
	},
	hide: function() {
		this.element.hide();
		this.visible = false;
		this.currentItem = 0;
		this.loseFirstResponder();
	},
	toggle: function() {
		if (this.visible) {
			this.hide();
		}
		else {
			this.show();
		}
	},
	handleKeyboardNotification: function(inMessage, inObject, inOptExtras) {
		switch (inMessage) {
		case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_ESC:
			if (!this.visible) break;
			this.hide();
			return true;
		default:
			if (this.visible) return true;
			break;
		}
	},
	handleWindowMouseDown: function(inEvent) {
		if (!this.visible) return;
		if (this.toggleButton && inEvent.findElement('a, div, button, input, li') == this.toggleButton) return;
		if (inEvent.findElement('.popover') == this.element) return;
		this.hide();
	}
});
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



CC.QuickSearch = CC.QuickSearch || new Object();

// Notifications.

CC.QuickSearch.DID_SHOW_QUICKSEARCH_MENU = 'DID_SHOW_QUICKSEARCH_MENU';
CC.QuickSearch.DID_HIDE_QUICKSEARCH_MENU = 'DID_HIDE_QUICKSEARCH_MENU';

// Quick search menu instance.

CC.QuickSearch.QuickSearchMenu = Class.create(CC.Popover, {
	mRequestDelay: 200,
	mMinSearchStringLength: 2,
	mCachedRequestString: null,
	mSearchFieldKeyboardDelegate: null,
	mWindowKeyboardDelegate: null,
	mSelectionMode: false,
	mSelection: null,
	initialize: function($super, inSearchField /*, [options] */) {
		this.mSearchField = Element.extend(inSearchField);
		var el = this._render();
		$super(el);
		return el;
	},
	_render: function() {
		var quicksearch = $('quicksearch');
		if (quicksearch) Element.remove(quicksearch);
		this.mParentElement = Builder.node('div', {id: 'quicksearch', className: 'popover right', style: 'display: none;'}, [
			Builder.node('div', {className: 'content'}, [
				Builder.node('div', {className: 'section recentsearches empty'}, [
					Builder.node('div', {className: 'results'}, [
						Builder.node('div', {className: 'resultlist recentsearches selected'})
					])
				]),
				Builder.node('div', {className: 'section search empty'}, [
					Builder.node('h2', {className: 'placeholder'}, "_QuickSearch.Loading.Placeholder".loc()),
					Builder.node('div', {className: 'results'}, [
						Builder.node('div', {className: 'resultlist'})
					]),
					Builder.node('div', {className: 'footer'}, [
						Builder.node('a', "_QuickSearch.See.All.Results.Title".loc())
					])
				]),
				Builder.node('div', {className: 'section savedsearches empty'}, [
					Builder.node('h2', {className: 'placeholder'}, "_QuickSearch.Loading.Placeholder".loc()),
					Builder.node('div', {className: 'results'}, [ Builder.node('div', {className: 'resultlist'}) ])
				])
			]),
			Builder.node('div', {className: 'norgie'})
		]);
		bindEventListeners(this, [
			'handleSearchFieldFocused',
			'handleSearchFieldKeyUp',
			'handleSearchFieldClick',
			'handleSearchShowMoreClicked',
			'handleSearchResultItemClicked',
			'handleRecentSearchDeleteButtonClicked',
			'handleSavedSearchDeleteButtonClicked'
		]);
		// Enable footer links in both search result sections.
		Event.observe(this.mParentElement.down('.section.search .footer a'), 'click', this.handleSearchShowMoreClicked);
		// Show the quicksearch menu when the search field is focused.
		Event.observe(this.mSearchField, 'focus', this.handleSearchFieldFocused);
		Event.observe(this.mSearchField, 'keyup', this.handleSearchFieldKeyUp);
		Event.observe(this.mSearchField.up('li').down('span.searchfield_close_overlay'), 'mousedown', this.handleSearchFieldClick);
		// Finally append to the document before returning.
		d.body.appendChild(this.mParentElement);
		return this.mParentElement;
	},
	renderSearchResults: function(inResults) {
		var resultsElement = this.mParentElement.down('.section.search .results .resultlist');
		var list = Builder.node('ul', {className:'resultlistItems'});
		var resultNode = Builder.node('div', {className:"builtResults"}, [Builder.node('h2', {className:'resultlistHeader'}, "_QuickSearch.Header".loc()), list]);
		replaceElementContents(resultsElement, resultNode);
		$A(inResults).each(function(aResult) {
			var entity = aResult.entity;
			var entityTitle = entity.longName || entity.shortName;
			var hasOwner = (entity.type != "com.apple.entity.Wiki" && entity.type != "com.apple.entity.User");
			var iconURI = iconURIForEntity(entity, true, 32, 32);
			var anItem = Builder.node('li', {className: (hasOwner ? "hasowner" : ""), name:CC.entityURL(entity, true), title:entityTitle}, [
				Builder.node('span', {'className': 'cc-entity-icon', 'style': 'background-image: url(%@); background-size: 32px 32px;'.fmt(iconURI)}, [
					Builder.node('img', {'src': (iconURI || "")})
				]),
				Builder.node('span', {className:"title"}, entityTitle),
				Builder.node('span', {className:"owner"}, localizedContainerString((entity.container.longName || entity.container.shortName), entity.container.type))
			]);
			if (entity.isFavorite) {
				anItem.appendChild(Builder.node('span', {className: 'quicksearch_favorite'}));
			}
			list.appendChild(anItem);
		});
		resultsElement.select('li').each(function(li) {
			Event.observe(li, 'click', this.handleSearchResultItemClicked);
		}, this);
		this.markSectionsWithClassNamesEmpty(['search'], inResults.length == 0);
		this.updateVisibleState();
	},
	renderSavedSearches: function(inResults) {
		var savedElement = this.mParentElement.down('.section.savedsearches .results .resultlist');
		var list = Builder.node('ul', {className:'resultlistItems'});
		var resultNode = Builder.node('div', {className:"builtResults"}, [Builder.node('h2', {className:'resultlistHeader'}, "_QuickSearch.Headers.SavedSearches".loc()), list]);
		replaceElementContents(savedElement, resultNode);
		$A(inResults).each(function(aResult) {
			var entity = aResult.entity;
			var entityTitle = "_QuickSearch.SavedSearch.Untitled".loc();
			if (entity.longName || entity.shortName) {
				entityTitle = entity.longName || entity.shortName;
			}
			var anItem = Builder.node('li', {className: 'savedsearch', name: entity.guid}, [
				Builder.node('span', {className:"delete", name:entityTitle, guid:entity.guid}, "_QuickSearch.SavedSearch.Delete".loc()),
				Builder.node('span', {className:"title"}, entityTitle)
			]);
			list.appendChild(anItem);
		});
		savedElement.select('li').each(function(li) {
			Event.observe(li, 'click', this.handleSearchResultItemClicked);
		}, this);
		savedElement.select('.delete').each(function(btn) {
			Event.observe(btn, 'click', this.handleSavedSearchDeleteButtonClicked);
		}, this);
		this.markSectionsWithClassNamesEmpty(['savedsearches'], inResults.length == 0);
		this.updateVisibleState();
	},
	updateSavedSearches: function() {
		server_proxy().savedSearchesForCurrentUser(this.renderSavedSearches.bind(this), function() {
			logger().error("Could not fetch saved searches for current user");
		});
	},
	updateRecentSearches: function() {
		var recentSearches = globalRecentSearches().searchStack();
		var recentSearchesElm = this.mParentElement.down('.section.recentsearches .results');
		if (recentSearches.length) {
			var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_SEARCH);			
			var ul = Builder.node('ul');
			recentSearchesElm.innerHTML = '';
			recentSearchesElm.appendChild(Builder.node('h1', {'aria-label': '_QuickSearch.Headers.RecentSearches'.loc(), tabindex: tabIndex}, '_QuickSearch.Headers.RecentSearches'.loc()));
			recentSearchesElm.appendChild(Builder.node('div', {className:'resultlist'}, [ul]));
			$A(recentSearches).each(function(searchString) {
				var li = Builder.node('li', {name:this.buildSearchURLForQueryString(searchString), tabindex: tabIndex, role: 'listitem'}, [
					Builder.node('span', {className:"delete", name:searchString}, "_QuickSearch.RecentSearch.Delete".loc()),
					Builder.node('span', {'aria-label': "_Accessibility.Navigation.Label.SearchFor".loc() + ' ' + searchString, className:"title"}, searchString)
				]);
				ul.appendChild(li);
				li.observe('click', this.handleSearchResultItemClicked);
				li.down('.delete').observe('click', this.handleRecentSearchDeleteButtonClicked);
			}.bind(this));
		}
		this.markSectionsWithClassNamesEmpty(['recentsearches'], recentSearches.length == 0);
		// Do NOT update the visible state here.  Wait for the saved searches callback to do it for us.
		// this.updateVisibleState();
		return true;
	},
	show: function($super) {
		this.becomeFirstResponder();
		this.updateRecentSearches();
		this.updateSavedSearches();
		// Don't call $super to prevent the popup showing since we handle that logic in updateVisibleState
		// based on whether recent or saved searches exist.
	},
	_show: function() {
		this.mParentElement.show();
		this.visible = true;
		globalNotificationCenter().publish(CC.QuickSearch.DID_SHOW_QUICKSEARCH_MENU);
	},
	_hide: function() {
		this.mParentElement.hide();
		this.visible = false;
		globalNotificationCenter().publish(CC.QuickSearch.DID_HIDE_QUICKSEARCH_MENU);
	},
	showSectionsWithClassNames: function(inClassNames) {
		if (!inClassNames || !inClassNames.length) return;
		// Hide any expanded sections
		this.mParentElement.select('.section.showing').invoke('removeClassName', 'showing');
		// Iterate through the sections to show.
		$A(inClassNames).each(function(inClassName) {
			var section = this.mParentElement.down('.section.%@'.fmt(inClassName));
			// Bail if the section is already showing.
			if (section.hasClassName('showing')) return;
			// Show our target section.
			section.addClassName('showing');
			this.mParentElement.select('.selected').invoke('removeClassName', 'selected');
		}.bind(this));
	},
	markSectionsWithClassNamesEmpty: function(inClassNames, inEmpty) {
		if (!inClassNames || !inClassNames.length) return;
		// Iterate through the sections to mark empty.
		$A(inClassNames).each(function(inClassName) {
			var section = this.mParentElement.down('.section.%@'.fmt(inClassName));
			if (section) {
				if (inEmpty) {
					section.addClassName('empty');
				} else {
					section.removeClassName('empty');
				}
			}
		}.bind(this));
	},
	// Updates the visible state of the popup based on the state of the sections it displays.
	updateVisibleState: function() {
		var allSections = this.mParentElement.select('.section');
		var showingSections = this.mParentElement.select('.section.showing');
		var emptySections = this.mParentElement.select('.section.empty');
		// If there is nothing showing, or all sections are empty, hide.
		if (!(showingSections.length > 0) || (emptySections.length == allSections.length)) {
			this._hide();
			return;
		}
		// If all the showing sections are empty, hide.
		var allEmpty = true;
		showingSections.each(function(section) {
			if (!section.hasClassName('empty')) allEmpty = false;
		})
		if (allEmpty) {
			this._hide();
			return;
		}
		// Mark the first item as the top item.
		showingSections.each(function(section) {
			section.removeClassName('top');
			section.removeClassName('bottom');
		});
		if (showingSections.length > 0) {
			showingSections[0].addClassName('top');
			showingSections[showingSections.length - 1].addClassName('bottom');
		}
		// Go ahead and show the popup.
		this._show();
	},
	// Configures and selects the next list item in the result set if it exists, otherwise
	// removes the current selection. By default, selects the next item downwards but accepts
	// an optional inOptReversed argument which triggers the previous item in the list to be
	// selected instead.
	selectNextResultItem: function(inOptReversed) {
		// If we don't have a selection, and we're selecting in reverse, bail.
		if (!this.mSelection && inOptReversed) {
			this.mSearchField.focus();
			return;
		}
		this.mSelectionMode = true;
		this.mSearchField.blur();
		var allResultItems = this.mParentElement.select('.section.showing li');
		// If we don't have a selection, select the first list item.
		if (!this.mSelection) {
			var firstResultElement = allResultItems.first();
			if (firstResultElement) {
				firstResultElement.addClassName('selected');
				return (this.mSelection = firstResultElement);
			} else if (inOptReversed) {
				this.mSearchField.focus();
			}
		}
		// Otherwise, select the next/previous result item.
		else {
			var currentIndex = allResultItems.indexOf(this.mSelection);
			var nextResultItem = allResultItems[currentIndex + (inOptReversed ? -1 : 1)];
			if (nextResultItem) {
				this.mSelection.removeClassName('selected');
				nextResultItem.addClassName('selected');
				return (this.mSelection = nextResultItem);
			}
			else if (inOptReversed) {
				this.mSearchField.focus();
			}
		}
	},
	buildSearchURLForQueryString: function(inQueryString) {
		var keyword = (inQueryString || "");
		return "%@/find?keyword=%@".fmt(env().root_path, encodeURIComponent(keyword));
	},
	handleSearchFieldFocused: function(inEvent) {
		if (this.mSelection) this.mSelection.removeClassName('selected');
		this.mSelection = null;
		this.mSelectionMode = false;
		var value = $F(this.mSearchField);
		this.showSectionsWithClassNames((value && value.length >= this.mMinSearchStringLength) ? ['search'] : ['savedsearches', 'recentsearches']);
		this.show();
	},
	handleSearchFieldKeyUp: function(inEvent) {
		var value = $F(this.mSearchField);
		this.showSectionsWithClassNames((value && value.length >= this.mMinSearchStringLength) ? ['search'] : ['savedsearches', 'recentsearches']);
		delete this.mCachedRequestString;
		this.updateVisibleState();
	},
	handleSearchFieldClick: function(inEvent) {	
		var pos = inEvent.pointer();
		var overlayElm = this.mSearchField.up('li').down('span.searchfield_close_overlay');		
		if (Position.within(overlayElm, inEvent.pointerX(), inEvent.pointerY())) {
			inEvent.stop();
			this.mSearchField.value = '';
			this.mSearchField.focus();
			this.handleSearchFieldKeyUp();
		}
	},
	handleWindowMouseDown: function(inEvent) {
		if (!this.visible) return;
		if (inEvent.findElement('#search, #quicksearch')) return;
		this.hide();
	},
	handleKeyboardNotification: function($super, inMessage, inObject, inOptExtras) {
		switch (inMessage) {
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_ESC:
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_TAB:
				this.hide();
				break;
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_RETURN:
				this.handleReturnKeyPressed();
				break;
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_UP:
				this.handleUpKeyPressed();
				break;
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_DOWN:
				this.handleDownKeyPressed();
				break;
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_GENERIC:
				this.handleGenericKeyboardNotification(inMessage, inObject, inOptExtras);
				break;
			default:
				return $super(inMessage, inObject, inOptExtras);
				break;
		}
		return true;
	},
	handleTimerFired: function() {
		var queryString = $F(this.mSearchField);
		// Bail if the search string isn't long enough.
		if (queryString.length < this.mMinSearchStringLength) return;
		// Bail if the search string hasn't changed.
		if (queryString == this.mCachedRequestString) return;
		var scopeGUID = CC.meta('x-apple-parent-guid');
		this.mCachedRequestString = queryString;
		// If we're on a people or peoject listing, restrict the results to a certain type.
		var types = CC.ServerProxy.DefaultTypes;
		var body = document.body;
		this.mCurrentQueryString = queryString;
		server_proxy().entitiesForQuickSearch(this.mCurrentQueryString, types, function(inResults) {
			$('quicksearch').down('.section.search .footer').style.display = '';
			if (this.mCurrentQueryString == $F(this.mSearchField)) {
				this.mCurrentQueryString = null;
				this.mTimer = setTimeout(this.handleTimerFired.bind(this), this.mRequestDelay);
			}
			else {
				this.handleTimerFired();
			}
			this.renderSearchResults(inResults);
			this.mSelection = null;
			this.mSelectionMode = false;
		}.bind(this), function(inErr) {
			logger().error("Could not get search results for quick search popup");
		}.bind(this));
	},
	handleGenericKeyboardNotification: function(inMessage, inObject, inOptExtras) {
		// Don't propagate any keyboard notifications outside the search field.
		var inEvent = inOptExtras.event;
		if (inEvent) inEvent.stopPropagation();
		// Clear any existing search timeouts.
		if (this.mTimer) {
			clearTimeout(this.mTimer);
			this.mTimer = null;
		}
		// Set a new timeout that fires in 500ms.
		if (!this.mCurrentQueryString) this.mTimer = setTimeout(this.handleTimerFired.bind(this), this.mRequestDelay);
	},
	handleReturnKeyPressed: function() {
		if (this.mSelection) {
			var name = this.mSelection.getAttribute('name');
			if (name) {
				this.hide();
				window.location.href = name;
				return true;
			}
		}
		this.hide();
		var searchFieldValue = $F('search');
		if (searchFieldValue.match(/\S/)) globalRecentSearches().addSearchToStack(searchFieldValue.strip());
		window.location.href = this.buildSearchURLForQueryString(searchFieldValue);
	},
	handleUpKeyPressed: function() {
		if (!this.visible) return;
		this.selectNextResultItem(true);
	},
	handleDownKeyPressed: function() {
		if (!this.visible) return;
		this.selectNextResultItem();
	},
	handleSearchShowMoreClicked: function(inEvent) {
		this.hide();
		var searchFieldValue = $F('search');
		window.location.href = this.buildSearchURLForQueryString(searchFieldValue);
	},
	handleSearchResultItemClicked: function(inEvent) {
		this.hide();
		var sourceItem = inEvent.findElement('li');
		if (sourceItem.hasClassName('savedsearch')) {
			dialogManager().showProgressMessage("_Search.SavedSearch.Loading".loc())
			var _gotSavedSearchCallback	= function(result) {
				dialogManager().hide();
				if (result && result.query) {
					window.location.href = env().root_path + CC.Search.queryToURL(result.query);
				} else {
					notifier().printErrorMessage("_Search.Saved.ErrorExecutingSearch".loc());
				}
			};
			var _savedSearchErrback = function(response) {
				dialogManager().hide();
				notifier().printErrorMessage("_Search.Saved.ErrorExecutingSearch".loc());
			};
			var guid = sourceItem.getAttribute('name');
			server_proxy().entityForGUID(guid, _gotSavedSearchCallback, _savedSearchErrback);
		} else {
			var url = sourceItem.getAttribute('name');
			if (url) window.location.href = url;
		}
	},
	handleSavedSearchDeleteButtonClicked: function(inEvent) {
		Event.stop(inEvent);
		this.hide();
		var button = inEvent.findElement('.delete');
		var searchName = button.getAttribute('name');
		var entityGUID = button.getAttribute('guid');
		if (!$('delete_saved_search_dialog')) {
			dialogManager().drawDialog('delete_saved_search_dialog', [
				"_Search.SavedSearch.Delete.Description".loc(searchName)
			], "_Dialogs.OK".loc(), false, "_Search.SavedSearch.Delete.Title".loc(), "_Dialogs.Cancel".loc());
		}
		var callback = function() {
			dialogManager().hide();
			server_proxy().deleteEntityWithGUID(entityGUID, false);
		};
		dialogManager().show('delete_saved_search_dialog', null, callback);
	},
	handleRecentSearchDeleteButtonClicked: function(inEvent) {
		Event.stop(inEvent);
		var button = inEvent.findElement('.delete');
		var recentName = button.getAttribute('name');
		globalRecentSearches().removeSearchFromStack(recentName);
		this.updateRecentSearches();
		this.updateVisibleState();
	}
});
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

// Define a namespace.

CC.MenuItems = CC.MenuItems || new Object();
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



CC.MenuItems.About = Class.create(CC.MenuItem, {
	mDisplayTitle: "_ActionMenu.About.Title".loc(),
	action: function(e) {
		dialogManager().showProgressMessage("_Loading".loc());
		var batch = [
			['ServerVersionService', 'currentServerVersion'],
			['ServerVersionService', 'currentOperatingSystemVersion']
		];
		service_client().batchExecuteAsynchronously(batch, null, function(inBatchedResponse) {
			if (inBatchedResponse && inBatchedResponse.responses && inBatchedResponse.responses.length > 1) {
				var currentServerVersion = inBatchedResponse.responses[0].response;
				var currentOperatingSystemVersion = inBatchedResponse.responses[1].response;
				var aboutString = "_Server.About.Dialog.Description.NoXcode".loc(currentServerVersion, currentOperatingSystemVersion);
				dialogManager().hideProgressMessage();
				var dialog = $('server_about_dialog');
				if (dialog) Element.remove(dialog);
				dialogManager().drawDialog('server_about_dialog', [aboutString], "_Dialogs.OK".loc(), null, "_Server.About.Dialog.Title".loc());
				$('server_about_dialog_cancel').hide();
				dialogManager().show('server_about_dialog', null, null);
			}
		}, function() {
			dialogManager().hideProgressMessage();
			notifier().printErrorMessage("_Load.Error.CouldNotLoadIngoFromServer".loc());
		});
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_ABOUT);
	}
});
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



CC.MenuItems.Delete = Class.create(CC.MenuItem, {
	mDisplayTitle: "_ActionMenu.Delete.Title".loc(),
	updateDisplayState: function($super) {
		var locPrefix = '';
		if (document.body.hasClassName('pages')) {			
			// Check if current page is the main page
			var isDetailPage = CC.meta('x-apple-entity-isDetailPage');			
			// if yes then use delete wiki not delete page
			if ((isDetailPage != undefined) && (isDetailPage == "true")) {
				locPrefix = "Main.";
			} else {
				locPrefix = "Page.";
			}
		}
		
		if (document.body.hasClassName('projects')) locPrefix = "Project.";
		if (document.body.hasClassName('files')) locPrefix = "File.";
		if (document.body.hasClassName('pages') && CC.meta('x-apple-entity-isBlogpost') == "true") locPrefix = "Blog.";
		this.mElement.down('a').update("_ActionMenu.Delete.%@Title".fmt(locPrefix).loc());
		$super();
	},
	itemShouldDisplay: function() {		
		// Only owners and admins can delete current entity.
		var ownerType = CC.meta('x-apple-owner-type');
		var canDelete = ((CC.meta('x-apple-user-can-delete') == "true") && (CC.meta('x-apple-user-is-owner') == "true"));			
		var userCanDelete = (
			// Wiki
			((ownerType == 'com.apple.entity.Wiki') && ((CC.meta('x-apple-user-can-delete') == "true") && (CC.meta('x-apple-user-is-owner') == "true"))) ||
			// Page/File/Blog
			(((ownerType == 'com.apple.entity.Page') || (ownerType == 'com.apple.entity.File') || (ownerType == 'com.apple.entity.Blog')) && (CC.meta('x-apple-entity-tinyID')))
		);
		
		return (userCanDelete && (CC.meta('x-apple-entity-tinyID') != "serverhome"));
	},
	action: function(e) {
		var dialog = $('delete_entity_dialog');
		if (dialog) Element.remove(dialog);
		var locPrefix = '';
		if (document.body.hasClassName('pages')) {			
			// Check if current page is the main page
			var isDetailPage = CC.meta('x-apple-entity-isDetailPage');			
			// if yes then use delete wiki not delete page
			if ((isDetailPage != undefined) && (isDetailPage == "true")) {
				locPrefix = "Main.";
			} else {
				locPrefix = "Page.";
			}
		}
		if (document.body.hasClassName('projects')) locPrefix = "Project.";
		if (document.body.hasClassName('files')) locPrefix = "File.";
		if (document.body.hasClassName('pages') && CC.meta('x-apple-entity-isBlogpost') == "true") locPrefix = "Blog.";
		var fields = ["_Dialogs.Delete.%@Description".fmt(locPrefix).loc()];
		var canDeletePermanently = CC.meta('x-apple-user-is-admin') == "true";
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_DELETE_PAGE);
		if (canDeletePermanently) {
			fields.push({contents:'<label tabindex="-1" for="delete_entity_dialog_permanent_delete"><input tabindex="' + tabIndex + '" role="checkbox" id="delete_entity_dialog_permanent_delete" type="checkbox" />' + "_Dialogs.Delete.Permanently".loc() +'</label>'});
		}
		dialogManager().drawDialog('delete_entity_dialog', fields, "_Dialogs.Delete.OK".loc(), false, "_Dialogs.Delete.%@Title".fmt(locPrefix).loc());
		dialogManager().show('delete_entity_dialog', null, this.onDeleteConfirm.bind(this));		

		if (dialog) {
			var firstAction = dialog.querySelector('input[type="submit"]');
			if(firstAction) 
				firstAction.focus();
		}
	},
	onDeleteConfirm: function() {
		var permanentlyDeleteCheckbox = $('delete_entity_dialog_permanent_delete');
		var canPermanentlyDelete = false;
		if (permanentlyDeleteCheckbox) canPermanentlyDelete = $F('delete_entity_dialog_permanent_delete');
		var detailPage = CC.meta('x-apple-entity-isDetailPage');
		var entityGUID = CC.meta('x-apple-entity-guid');
		if (detailPage == "true") entityGUID = CC.meta('x-apple-owner-guid');
		server_proxy().deleteEntityWithGUID(entityGUID, canPermanentlyDelete, this.onDeleteSuccess.bind(this), this.onDeleteFailure.bind(this));
	},
	onDeleteSuccess: function(response) {
		var url = env().root_path;
		var parentTinyID = CC.meta('x-apple-owner-tinyID');
		var parentType = CC.meta('x-apple-owner-type');
		if (parentType == 'com.apple.entity.User' && parentTinyID) {
		    url = "#{prefix}/people/#{tinyID}".interpolate({
				prefix: env().root_path,
				tinyID: parentTinyID
			});
		}
		else if (parentType == 'com.apple.entity.Wiki') {
			if (CC.meta('x-apple-entity-isDetailPage') == "true") {
				url += '/projects';
				url = url.replace(/\/{2,}/, '/');
			} else {
				url = "#{prefix}/projects/#{tinyID}".interpolate({
					prefix: env().root_path,
					tinyID: parentTinyID
				});
			}
		}
		window.location.href = url;
	},
	onDeleteFailure: function(response) {
		var owner_type = CC.meta('x-apple-owner-type');
		var errorString = "_Dialogs.Delete.Notification.NotBotOwner.Error".loc();
		if (owner_type && owner_type == "com.apple.entity.Wiki") {
			errorString = "_Dialogs.Delete.Notification.NotProjectOwner.Error".loc();
		}
		notifier().printErrorMessage(errorString);
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_DELETE);
	}	
});
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



CC.MenuItems.Help = Class.create(CC.MenuItem, {
	mDisplayTitle: "_ActionMenu.Help.Title".loc(),
	mHelpLink: "",
	buildElement: function($super) {
		var elem = $super();
		var link = elem.down('a');
		link.target = '_blank';
		link.href = this.mHelpLink;
		return elem;
	},
	handleElementClicked: function(e) {
		// Override so we don't stop the event and break the link redirect.
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_HELP);
	}	
});

CC.MenuItems.Help.Wiki = Class.create(CC.MenuItems.Help, {
	mHelpLink: '_Help.Desktop.URL'.loc()
});

CC.MenuItems.Help.Xcs = Class.create(CC.MenuItems.Help, {
	mHelpLink: '_XC.Help.Desktop.URL'.loc()
});
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



CC.MenuItems.GearMenu = Class.create(CC.MenuItem, {
	mDisplayTitle: "_MenuItem.Gear".loc(),
	mClassName: 'gear',
	action: function(e) {
		// Show the gear menu attached to the shared header view.
		sharedHeaderView.mGearMenu.toggle();
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR);
	}	
});
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



CC.MenuItems.Login = Class.create(CC.MenuItem, {
	mDisplayTitle: "_MenuItem.LogIn".loc(),
	mClassName: 'login',
	itemShouldDisplay: function() {
		return (CC.meta('x-apple-user-logged-in') != "true");
	},
	action: function(inEvent) {
		inEvent.preventDefault();

		if ( browser().isiPhone() ) {
			var currentURL = window.location;
			window.location = "/auth?send_token=no&redirect="+currentURL;
			return;
		}
		else {
			authenticator().displayFramedLoginPrompt(function(){
				window.location.reload();
			});
		}
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_LOGIN);
	}
});
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



CC.MenuItems.Logout = Class.create(CC.MenuItem, {
	mDisplayTitle: "_MenuItem.LogOut".loc(),
	mClassName: 'logout',
	itemShouldDisplay: function() {
		return (CC.meta('x-apple-user-logged-in') == "true");
	},
	buildElement: function($super) {
		var loggedInUsername = CC.meta('x-apple-username');
		this.mTooltip = "_Login.LoggedInUser".loc(loggedInUsername);
		return $super();
	},
	action: function(e) {
		// Confirm the user really wants to log out.
		if ($('logout_confirm_dialog')) Element.remove('logout_confirm_dialog');
		dialogManager().drawDialog('logout_confirm_dialog', ["_Logout.Confirm.Dialog.Description".loc()], "_Logout.Confirm.Dialog.OK".loc(), null, "_Logout.Confirm.Dialog.Title".loc());
		// Show the delete block dialog.
		dialogManager().show('logout_confirm_dialog', null, function() {
			authenticator().logout();
		}.bind(this), undefined, false, undefined, false);
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_LOGOUT);
	}
});
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



CC.MenuItems.PlusMenu = Class.create(CC.MenuItem, {
	mDisplayTitle: "Plus".loc(),
	mClassName: 'add',
	action: function(e) {
		// Show the plus menu attached to the shared header view.
		sharedHeaderView.mPlusMenu.toggle();
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_PLUS);
	}
});
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



CC.BannerLink = Class.create(CC.MenuItem, {
	mBannerLinkGUID: 'banner/default',
	
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_BANNER);
	}
});
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




// Banner view class which can be as simple as a centered title, or as detailed as a
// bar with an icon, title, and set of collapsing links on the right.

CC.BannerView = Class.create(CC.Mvc.View, {
	// Is this a top-level banner (title-only)?
	mIsTopLevel: true,
	// The text displayed on this banner.
	mTitle: null,
	// The link URL for this title.
	mTitleURL: '#',
	// An ordered array of banner items.
	mBannerLinkItems: [],
	render: function() {
		var element = Builder.node('div', {id: 'banner', className: 'cc-banner-view chrome'});
		var fragment = document.createDocumentFragment();
		var bannerImageURL = this.getBannerImageURL();
		var iconImageURL = this.getIconImageURL();
		var extraClassNames = this.getIconImageExtraClassNames();
		var bannerLinkItems = this.mBannerLinkItems;
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BANNER_HOME);
		fragment.appendChild(Builder.node('div', {className: 'left', 'style': (bannerImageURL ? 'background-repeat: repeat; background-position: top left; background-image: url(%@)'.fmt(bannerImageURL) : '')}, [
			Builder.node('a', {className: 'title', 'href': this.mTitleURL, 'tabindex': tabIndex, 'id': 'banner_nav'}, [
				Builder.node('div', {className: 'icon'}, [
					Builder.node('div', {className: 'image default' + (extraClassNames ? " " + extraClassNames : ""), 'style': (iconImageURL ? 'background-position: center center; background-size: 100% 100%; background-image: url(%@)'.fmt(iconImageURL) : '')})
				]),
				Builder.node('h1', (this.mTitle || "").escapeHTML())
			])
		]));
		fragment.appendChild(Builder.node('div', {className: 'right'}, [
			Builder.node('div', {className: 'links'}, [
				Builder.node('ul', [bannerLinkItems.collect(function(item) { return item.mElement; })])
			])
		]));
		element.appendChild(fragment);
		return element;
	},
	makeAccessible: function() {
		// Set Navigation landmark (Actions/Nav)
		var banner = this.mParentElement;
		banner.writeAttribute('role', 'navigation');
		banner.writeAttribute('aria-label', "_Accessibility.Navigation.Secondary".loc());
	},
	setTitle: function(inTitle, inOptTitleURL) {
		if (inTitle != this.mTitle) {
			this.mTitle = (inTitle || "").strip();
			this.mTitleURL = (inOptTitleURL || "#");
			var link = this.mParentElement.down('a.title');
			if (inOptTitleURL) {
				this.mTitleURL = inOptTitleURL;
				link.href = inOptTitleURL;
			} else {
				link.removeAttribute('href');
			}
			this.mParentElement.down('a.title h1').innerHTML = this.mTitle.escapeHTML();
		}
	},
	// Configures this banner as a top-level banner. Top-level banners display the title only.
	setIsTopLevel: function(inShouldBeTopLevel) {
		if (inShouldBeTopLevel != this.mIsTopLevel) {
			this.mIsTopLevel = inShouldBeTopLevel;
		}
	},
	getBannerImageURL: function() { /* Interface */ },
	getIconImageURL: function() { /* Interface */ },
	getIconImageExtraClassNames: function() { /* Interface */ },
	updateDisplayState: function() {
		// First update the display state of all the banner links for this banner.
		var items = (this.mBannerLinkItems || []);
		for (var idx = 0; idx < items.length; idx++) {
			var item = items[idx];
			if (item) {
				item.updateDisplayState();
			}
		}
		// Update the visual appearance of the banner based on background/icon image information.
		var element = this.$();
		var bannerImageURL = this.getBannerImageURL();
		var leftElement = element.down('div.left');
		leftElement.setStyle({
			backgroundRepeat: 'repeat',
			backgroundPosition: 'top left',
			backgroundImage: (bannerImageURL ? 'url(%@)'.fmt(bannerImageURL) : ''),
			backgroundSize: "auto " + leftElement.getHeight() + 'px'
		});
		var imageElement = element.down('div.image');
		var iconURL = this.getIconImageURL();
		if (iconURL) {
			imageElement.className = 'image';
		} else {
			var extraClassNames = this.getIconImageExtraClassNames();
			var className = 'image default' + (extraClassNames ? " " + extraClassNames : "");
			imageElement.className = className;
		}
		imageElement.setStyle({
			backgroundPosition: 'center center',
			backgroundSize: '100% 100%',
			backgroundImage: (iconURL ? 'url(%@)'.fmt(iconURL) : '')
		});
	}
});
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



// Main view class.

CC.MainView = Class.create(CC.Mvc.View, {
	render: function() {
		var backgroundImageURL = this.getBackgroundImageURL();
		var elem = Builder.node('div', {id: 'main', className: 'cc-main-view wrapchrome', 'style': (backgroundImageURL ? 'background-repeat: repeat; background-position: top left; background-image: url(%@)'.fmt(backgroundImageURL) : '')});
		elem.appendChild(Builder.node('div', {id: 'content', className: 'animates wrapchrome no-secondary'}, [
			Builder.node('div', {id: 'content-inner'}, [
				Builder.node('div', {id: 'content-primary', className: 'wrapchrome'}),
				Builder.node('div', {id: 'content-secondary', className: 'wrapchrome'}),
				Builder.node('div', {style: 'display: block; clear: both;', className: 'chrome'})
			])
		]));
		if (!globalCookieManager().getCookie('cc.sidebar_closed')) {
			elem.down('div#content').removeClassName('no-secondary');
		}
		return elem;
	},
	makeAccessible: function() {
			
		// Set Navigation landmark (Actions/Nav)
		var main = this.mParentElement.querySelector('#content-primary');
		main.writeAttribute('aria-label', "_Accessibility.Navigation.PageContent".loc());
	},
	getBackgroundImageURL: function() { /* Interface */ },
	updateDisplayState: function() {
		var element = this.$();
		// Do we have a background image?
		var backgroundImageURL = this.getBackgroundImageURL();
		element.setStyle({
			backgroundRepeat: 'repeat',
			backgroundPosition: 'top left',
			backgroundImage: (backgroundImageURL ? 'url(%@)'.fmt(backgroundImageURL) : '')
		});
	}
});
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



CC.NAV_POPOVER_DEFAULT_APPLICATION_WIKI_IDENTIFIER = 'wiki';
CC.NAV_POPOVER_DEFAULT_APPLICATION_CHANGEPASSWORD_IDENTIFIER = 'changepassword';
CC.NAV_POPOVER_DEFAULT_APPLICATION_WEBCAL_IDENTIFIER = 'webcal';

CC.NAV_POPOVER_DEFAULT_APPLICATIONS = [
	{
		'mURL': '/xcode',
		'mIdentifier': CC.NAV_POPOVER_DEFAULT_APPLICATION_XCODE_IDENTIFIER,
		'mDisplayTitle': "_NavPopover.Application.Xcode.Title".loc(),
		'mShouldDisplayCalculator': function() {
			return CC.meta("x-apple-service-xcode-enabled") == "true";
		}
	},
	{		
		'mURL': '/wiki',
		'mIdentifier': CC.NAV_POPOVER_DEFAULT_APPLICATION_WIKI_IDENTIFIER,
		'mDisplayTitle': "_NavPopover.Application.Wiki.Title".loc(),
		'mShouldDisplayCalculator': function() {
			return CC.meta("x-apple-service-wiki-enabled") == "true";
		}
	}, {
		'mURL': '/changepassword',
		'mIdentifier': CC.NAV_POPOVER_DEFAULT_APPLICATION_CHANGEPASSWORD_IDENTIFIER,
		'mDisplayTitle': "_NavPopover.Application.ChangePassword.Title".loc(),
		'mShouldDisplayCalculator': function() {
			return CC.meta("x-apple-service-changepassword-enabled") == "true";
		}
	}, {
		'mURL': '/webcal',
		'mIdentifier': CC.NAV_POPOVER_DEFAULT_APPLICATION_WEBCAL_IDENTIFIER,
		'mDisplayTitle': "_NavPopover.Application.WebCalendar.Title".loc(),
		'mShouldDisplayCalculator': function() {
			return CC.RouteHelpers.webcalEnabledForCurrentProtocol();
		}
	}
];

CC.NavPopover = Class.create(CC.Popover, {
	mNavigationItems: [],
	mActiveApplicationIdentifier: null,
	initialize: function($super, inNavigationItems, inActiveApplicationIdentifier) {
		// Default the anchor position to the first link on the header element (if it exists).
		var anchor = $('header') ? $('header').down('.buttonbar.hierarchy a') : null;
		if (inNavigationItems) this.mNavigationItems = $A(inNavigationItems);
		if (inActiveApplicationIdentifier) this.mActiveApplicationIdentifier = inActiveApplicationIdentifier;
		$super(anchor);
		this.element.setAttribute('id', 'cc-navpopover');
	},
	renderPopoverContent: function() {
		var buildSection = function(url, className, locTitle, locDescription, isSubitem) {
			var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GENERAL);
			var section = Builder.node('a', {href:url, className: "cc-navpopover-item %@%@".fmt(className, (isSubitem ? ' subitem' : '')), tabindex: tabIndex}, [
				Builder.node('span', {className: "icon"}),
				Builder.node('span', {className: "title ellipsis"}, locTitle.loc())
			]);
			if (locDescription) section.setAttribute('title', locDescription.loc());
			return section;
		}
		// Create a document fragment we can use to start assembling the popover contents.
		var fragment = document.createDocumentFragment();
		// Include a user icon as the nav popover header if we're logged in.
		var currentUserLoggedIn = (CC.meta('x-apple-user-logged-in') == "true");
		if (currentUserLoggedIn) {
			var currentUserLogin = CC.meta('x-apple-username');
			var avatarGUID = CC.meta("x-apple-user-avatarGUID");
			var avatarURL = iconURIForEntity({
				'type': 'com.apple.entity.User',
				'avatarGUID': avatarGUID
			});
			var currentUserDisplayName = (CC.meta("x-apple-user-longName") || CC.meta("x-apple-user-shortName"));
			var userElement = Builder.node('div', {'className': "user"}, [
				Builder.node('div', {'role': 'presentation', 'className': 'avatar%@'.fmt(avatarGUID ? '' : ' default')}, [
					Builder.node('img', {'role': 'presentation', 'className': 'avatar_img'}),
					Builder.node('div', {'role': 'presentation', 'className': 'avatar_mask'})
				]),
				Builder.node('div', {'role': 'presentation', 'className': 'fullname ellipsis'}, currentUserDisplayName)
			]);
			if (avatarURL) userElement.down('img').src = avatarURL;
			fragment.appendChild(userElement);
		}
		// Draw the menu items.
		for (var idx = 0; idx < CC.NAV_POPOVER_DEFAULT_APPLICATIONS.length; idx++) {
			var application = CC.NAV_POPOVER_DEFAULT_APPLICATIONS[idx];
			// Should we display the navigation item?
			var shouldDisplayCalculator = application.mShouldDisplayCalculator;
			if (!shouldDisplayCalculator()) continue;
			fragment.appendChild(buildSection(application.mURL, application.mIdentifier, application.mDisplayTitle, application.mTooltip));
			// If this application is the active application, draw the navigation items.
			if (this.mActiveApplicationIdentifier == application.mIdentifier) {
				for (var jdx = 0; jdx < this.mNavigationItems.length; jdx++) {
					var navigationItem = this.mNavigationItems[jdx];
					var navigationItemElement = buildSection(navigationItem[0], navigationItem[1], navigationItem[2], navigationItem[3], true);
					fragment.appendChild(navigationItemElement);
				}
			}
		}
		return fragment;
	},
	makeAccessible: function() { 
		for (var jdx = 0; jdx < this.mNavigationItems.length; jdx++) {
			var navicationItem = this.mNavigationItems[jdx];
		}
	},
	show: function($super) {
		$super();
	},
	onAnchorClick: function(e) {
		e.stop();
		this.toggle();
	},
	handleKeyboardNotification: function($super, inMessage, inObject, inOptExtras) {
		switch (inMessage) {
		case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SHIFT_ESC:
			if (!this.visible)
				this.show();
			return true;
		default:
			break;
		}
		$super(inMessage, inObject, inOptExtras);
	}
});
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

// Polite login reminder shared instance.

CC.PoliteLoginPrompt = Class.create({
	initialize: function() {
		this.updateDisplayState();
		
		// Automatically update when meta tags change
		globalNotificationCenter().subscribe(CC.Meta.NOTIFICATION_DID_REFRESH_META_TAGS, this.updateDisplayState.bind(this));
	},
	showPoliteLoginPrompt: function() {
		if (!this.mElement) {
			var currentURL = window.location;
			var destinationString = "/auth?send_token=no&redirect="+currentURL;

			this.mElement = Builder.node('div', {id:'polite_login'}, [
				Builder.node('a', {'href': destinationString}, '_PoliteLogin.LogIn'.loc()),
				Builder.node('span', {'class': 'dismiss'}),
				'_PoliteLogin.FormatSimple'.loc()
			]);

			this.mElement.down('a').addEventListener('click', function(e) {
				e.preventDefault();

				if ( browser().isiPhone() ) {
					window.location = destinationString;
					return;
				}

				this.hidePoliteLoginPrompt(true);
				authenticator().displayFramedLoginPrompt(function(){
					window.location.reload();
				});
			}.bind(this), false);
			document.body.appendChild(this.mElement);
			this.mElement.down('.dismiss').observe('click', this.hidePoliteLoginPrompt.bindAsEventListener(this));
		}
	},
	hidePoliteLoginPrompt: function(inOptSuppressCookie) {
		if (this.mElement) {
			this.mElement.remove();
			delete this.mElement;
		}
		if (inOptSuppressCookie !== true) {
			globalCookieManager().setCookie('cc.hide_polite_login', true);
		}
	},
	updateDisplayState: function() {
		var loggedIn = (CC.meta('x-apple-user-logged-in') == "true");
		var hideCookie = globalCookieManager().getCookie('cc.hide_polite_login');
		if (loggedIn) {
			// Destroy the cookie so the next time we're logged out it will appear.
			globalCookieManager().destroyCookie('cc.hide_polite_login');
		}
		// If the user is not logged in and hasn't explicitly set the hide cookie, show the
		// polite login prompt.
		if (!loggedIn && !hideCookie) {
			this.showPoliteLoginPrompt();
			globalNotificationCenter().subscribe(CC.WikiEditor.NOTIFICATION_DID_START_EDITING, this.hidePoliteLoginPrompt.bind(this));
			globalNotificationCenter().subscribe(CC.Revisions.NOTIFICATION_DID_SHOW_REVISIONS, this.hidePoliteLoginPrompt.bind(this));
			globalNotificationCenter().subscribe(CC.QuickSearch.DID_SHOW_QUICKSEARCH_MENU, this.hidePoliteLoginPrompt.bind(this));
		} else {
			this.hidePoliteLoginPrompt(true);
		}
	}
});
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



// Shared desktop route helpers.

CC.RouteHelpers = CC.RouteHelpers || new Object();

// Entity type to body class name map.

CC.RouteHelpers.mapEntityTypeToBodyClassName = function(inType) {
	switch (inType) {
		case 'com.apple.entity.Wiki':
			return 'projects';
		case 'com.apple.entity.User':
			return 'people';
		default:
			return '';
	}
};

// Sets the browser title.

CC.RouteHelpers.setBrowserWindowTitle = function(inTitle) {
	var title = (inTitle || "_OSXServer".loc());
	document.title = title;
};

CC.RouteHelpers.setBodyClassName = function(inClassName, inOptShouldSet) {
	if (!inClassName) return;
	var shouldSet = (inOptShouldSet == undefined ? true : inOptShouldSet);
	if (shouldSet) {
		document.body.addClassName(inClassName);
	} else {
		document.body.removeClassName(inClassName);
	}
};

CC.RouteHelpers.setTopLevelClassNames = function(inOptShouldSet) {
	CC.RouteHelpers.setBodyClassName('toplevel', inOptShouldSet);
};

CC.RouteHelpers.setContentPrimaryFullWidth = function(inOptShouldSet, inOptShouldAnimate) {
	var shouldSet = (inOptShouldSet == undefined ? true : inOptShouldSet);
	CC.RouteHelpers.setContentSecondaryVisible(!shouldSet, inOptShouldAnimate);
	var contentPrimary = mainView.$().down('div#content-primary');
	if (shouldSet) {
		contentPrimary.addClassName('full-width');
	} else {
		contentPrimary.removeClassName('full-width');
	}
};

CC.RouteHelpers.setContentSecondaryVisible = function(inOptShouldBeVisible, inOptShouldAnimate) {
	var contentElement = mainView.$().down('div#content');
	if (!inOptShouldAnimate) contentElement.removeClassName('animates');
	if (inOptShouldBeVisible == undefined || inOptShouldBeVisible) {
		contentElement.removeClassName('no-secondary');
	} else {
		contentElement.addClassName('no-secondary');
	}
	setTimeout(function() {
		if (!inOptShouldAnimate) contentElement.addClassName('animates');
	}, 600);
};

// Updates the display state for the shared main view, header and banner.

CC.RouteHelpers.updateSharedDisplayState = function() {
	mainView.updateDisplayState();
	sharedHeaderView.updateDisplayStateForMenuItems();
	sharedBannerView.updateDisplayState();
};

// Updates the banner for the current container.

CC.RouteHelpers.updateBannerForOwnerOrContainer = function(inOptUseContainerInstead) {
	sharedBannerView.setVisible(true);
	sharedBannerView.setIsTopLevel(false);
	var metaSubstring = 'owner';
	if (inOptUseContainerInstead) metaSubstring = 'container';
	var title = (CC.meta('x-apple-%@-longName'.fmt(metaSubstring)) || CC.meta('x-apple-%@-shortName'.fmt(metaSubstring)));
	var type = CC.meta('x-apple-%@-type'.fmt(metaSubstring));
	var tinyID = CC.meta('x-apple-%@-tinyID'.fmt(metaSubstring));
	var url = CC.entityURLForTypeAndTinyID(type, tinyID, title);
	sharedBannerView.setTitle(title, url);
};

// Sets the selected banner link item by identifer (mBannerLinkGUID).

CC.RouteHelpers.setSelectedBannerLinkByGUID = function(inBannerLinkGUID) {
	// Fetch the current banner links.
	var bannerLinks = (sharedBannerView.mBannerLinkItems || []), bannerLink, bannerLinkGUID;
	for (bdx = 0; bdx < bannerLinks.length; bdx++) {
		bannerLink = bannerLinks[bdx];
		bannerLinkGUID = bannerLink.mBannerLinkGUID;
		bannerLink.markAsSelected(inBannerLinkGUID == bannerLinkGUID);
	}
};

// Returns an array of breadcrumb nar items for an owner/container including a leading type breadcrumb, e.g. people.

CC.RouteHelpers.breadcrumbBarItemsForOwnerOrContainer = function(inOptUseContainerInstead) {
	var metaSubstring = 'owner';
	if (inOptUseContainerInstead) metaSubstring = 'container';
	var title = (CC.meta('x-apple-%@-longName'.fmt(metaSubstring)) || CC.meta('x-apple-%@-shortName'.fmt(metaSubstring)));
	var type = CC.meta('x-apple-%@-type'.fmt(metaSubstring));
	var tinyID = CC.meta('x-apple-%@-tinyID'.fmt(metaSubstring));
	var url = CC.entityURLForTypeAndTinyID(type, tinyID, title);
	var crumbs = [];
	if (type == 'com.apple.entity.Wiki') {
		crumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': "_General.Wikis".loc(), 'mURL': '/wiki/projects'}));
	} else if (type == 'com.apple.entity.User') {
		crumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': "_General.People".loc(), 'mURL': '/wiki/people'}));
	}
	crumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': title, 'mURL': url}));
	return crumbs;
};

// Updates the header bar breadcrumb trail.

CC.RouteHelpers.updateBreadcrumbBarForEntityAndOwner = function() {
	var entityIsBlogPost = (CC.meta('x-apple-entity-isBlogpost') == "true");
	var newCrumbs = CC.RouteHelpers.breadcrumbBarItemsForOwnerOrContainer(entityIsBlogPost);
	// If the entity is a blog post, we need one more level of indirection and a blog item.
	if (entityIsBlogPost) {
		var containerType = CC.meta('x-apple-container-type');
		var containerTinyID = CC.meta('x-apple-container-tinyID');
		var containerURL = CC.entityURLForTypeAndTinyID(containerType, containerTinyID);
		newCrumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': "_Blog.Default.Title".loc(), 'mURL': "%@/blog".fmt(containerURL)}));
	}
	// If the entity is not a detail page, push a breadcrumb.
	if (CC.meta('x-apple-entity-isDetailPage') != "true") {
		var entityTitle = (CC.meta('x-apple-entity-longName') || CC.meta('x-apple-entity-shortName'));
		var entityType = CC.meta('x-apple-entity-type');
		var entityTinyID = CC.meta('x-apple-entity-tinyID');
		var entityURL = CC.entityURLForTypeAndTinyID(entityType, entityTinyID, entityTitle);
		newCrumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': entityTitle, 'mURL': entityURL}));
	}
	sharedHeaderView.setBreadcrumbItems(newCrumbs);
};

// Helpers for detecting if features are enabled/disabled.

CC.RouteHelpers.wikiEnabled = function() {
	return (CC.meta("x-apple-service-wiki-enabled") == "true");
};

CC.RouteHelpers.webauthEnabled = function() {
	return (CC.meta("x-apple-service-webauth-enabled") == "true");
};

CC.RouteHelpers.webcalEnabled = function() {
	var nonSSLCalendarWebAppLoaded = (CC.meta("x-apple-service-webcal-enabled") == "true");
	var sslCalendarWebAppLoaded = (CC.meta("x-apple-service-webcalssl-enabled") == "true");
	return (nonSSLCalendarWebAppLoaded || sslCalendarWebAppLoaded);
};

// Webcal may be enabled, but restricted to the SSL site.

CC.RouteHelpers.webcalEnabledForCurrentProtocol = function() {
	var nonSSLCalendarWebAppLoaded = (CC.meta("x-apple-service-webcal-enabled") == "true");
	var sslCalendarWebAppLoaded = (CC.meta("x-apple-service-webcalssl-enabled") == "true");
	var isSecure = (window.location.protocol == "https:");
	// Calendar is enabled if non-SSL calendar is enabled, or non-SSL AND ssl calendar is enabled or only SSL is enabled and the
	// user is accessing the Web UI over the https scheme.
	if (!isSecure) {
		if (nonSSLCalendarWebAppLoaded) return true;
		if (nonSSLCalendarWebAppLoaded && sslCalendarWebAppLoaded) return true;
	} else {
		if (sslCalendarWebAppLoaded) return true;
	}
	return false;
};

CC.RouteHelpers.changePasswordEnabled = function() {
	return (CC.meta("x-apple-service-changepassword-enabled") == "true");
};

// Helpers for UI that can be disabled in the collabd.plist.

CC.RouteHelpers.allActivityEnabled = function() {
	if ((CC.meta("x-apple-config-DisableAllActivityView") == "true") && (CC.meta("x-apple-username") == "unauthenticated")) 
		return false;
	return true;
};

CC.RouteHelpers.peopleEnabled = function() {
	if ((CC.meta("x-apple-config-DisableAllPeopleView") == "true") && (CC.meta("x-apple-username") == "unauthenticated")) 
		return false;
	return true;
};

CC.RouteHelpers.projectsEnabled = function() {
	if (CC.meta("x-apple-config-DisableAllProjectsView") == "true") 
		return false;
	return true;
};

// Updates the browser title for the current entity and owner.

CC.RouteHelpers.setBrowserWindowTitleForEntityAndOwner = function() {
	var titleFormatString = "%@ - %@";
	var ownerTitle = (CC.meta('x-apple-owner-longName') || CC.meta('x-apple-owner-shortName'));
	var entityTitle = (CC.meta('x-apple-entity-longName') || CC.meta('x-apple-entity-shortName'));
	var title = titleFormatString.fmt(ownerTitle, entityTitle);
	CC.RouteHelpers.setBrowserWindowTitle(title);
};
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



CC.Application = CC.Application || new Object();

// Some globals we'll want to reference later.

var rootView, rootViewController, sharedHeaderView, sharedNavPopover, sharedBannerView, mainView;

// Basic error message support.

var renderErrorMessage = function(inErrorMessage, inOptShowBanner) {
	if (sharedBannerView) sharedBannerView.setVisible(inOptShowBanner != undefined ? inOptShowBanner : false);
	CC.RouteHelpers.setContentSecondaryVisible(false, false);
	var view = new CC.ErrorMessageView({
		mErrorMessage: inErrorMessage
	});
	mainView.addSubview(view, '#content-primary', true);
};

var renderErrorHTML = function(inErrorHTML, inOptShowBanner) {
	if (sharedBannerView) sharedBannerView.setVisible(inOptShowBanner != undefined ? inOptShowBanner : false);
	CC.RouteHelpers.setContentSecondaryVisible(false, false);
	var view = new CC.ErrorMessageView({
		mErrorMessage: ""
	});
	view.forceRender();
	// This is safe because only we generate the supplied inner HTML.
	view.$('p').innerHTML = inErrorHTML;
	mainView.addSubview(view, '#content-primary', true);
};

// Base application class.

CC.Application = Class.create({
	mRoutesTriggerReload: true,
	mApplicationIdentifier: '',
	initialize: function(/* [options] */) {
		if (arguments && arguments.length > 0) Object.extend(this, arguments[0]);
		globalNotificationCenter().subscribe('PAGE_INITIALIZE_FINISHED', this.__initialize.bind(this));
	},
	// Internal function that is called to initialize this application. You should not
	// normally override this function.
	__initialize: function() {
		this.routeInitialRequestBeforeRender();
		this.__registerRoutes();
		this.createApplication();
	},
	// Called when the page is ready and the application will be created.
	createApplication: function() {
		// 9695664
		var dt = new Date();
		var offset = dt.getTimezoneOffset() / (-60);
		dt.setFullYear(dt.getFullYear() + 2);
		globalCookieManager().setCookie('cc.utc_offset', offset);
		// Routes should trigger a page reload on desktop.
		globalRouteHandler().mRoutesTriggerReload = this.mRoutesTriggerReload;
		// Write the locale to the body tag.
		document.body.addClassName(globalLocalizationManager().getLprojLocale());
		document.body.addClassName(this.mApplicationIdentifier);
		// Create a special root view and append it to the DOM so we have something to draw into.
		rootView = new CC.Mvc.View();
		rootView._render();
		var rootViewParentElement = rootView.mParentElement;
		rootViewParentElement.id = 'root';
		document.body.appendChild(rootViewParentElement);
		// Create the root view controller.
		rootViewController = new CC.Mvc.ViewController();
		rootViewController.mViewInstance = rootView;
	},
	// Your subclass should implement this function to return a tuple of route patterns and routing functions.
	// Note that routes should be returned in most to least specific order.
	computeRoutes: function() { /* Interface */ },
	// Internal function that registers routes computed above.
	__registerRoutes: function() {
		var routes = (this.computeRoutes() || []);
		var route, routePattern, routeFunction;
		for (var rdx = 0; rdx < routes.length; rdx++) {
			route = routes[rdx];
			routePattern = route[0];
			routeFunction = route[1];
			globalRouteHandler().register(routePattern, routeFunction);
		}
	},	
	// Routes the initial request by handle exceptions returned from the server (e.g. permission
	// denied or resource not found).  By default, looks for a route and routes it. You shouldn't
	// need to override this function unless you're doing something funky.  Remember to call this
	// function to have your application do anything.
	routeInitialRequestBeforeRender: function() {
		var exceptionName = CC.meta('x-apple-exception-name');
		var exceptionReason = CC.meta('x-apple-exception-reason');
		var loggedIn = (CC.meta('x-apple-user-logged-in') == "true");
		if (exceptionName) {
			if (exceptionName == "CSPermissionDeniedError") {
				if (exceptionReason == "permission-denied") {
					if (!loggedIn) {
						var currentURL = window.location;
						window.location.href = "/auth?send_token=no&redirect=" + currentURL;
						return;
					}
				}
			}
		}
	},
	routeInitialRequestAfterRender: function() {
		var exceptionName = CC.meta('x-apple-exception-name');
		var exceptionReason = CC.meta('x-apple-exception-reason');
		// Is the entity/container/owner deleted?
		var ownerDeleted = (CC.meta('x-apple-owner-isDeleted') == "true")
		var containerDeleted = (CC.meta('x-apple-container-isDeleted') == "true");
		var entityDeleted = (CC.meta('x-apple-entity-isDeleted') == "true");
		var deletedGUID;
		if (ownerDeleted) {
			deletedGUID = CC.meta('x-apple-owner-guid');
		} else if (containerDeleted) {
			deletedGUID = CC.meta('x-apple-container-guid');
		} else if (entityDeleted) {
			deletedGUID = CC.meta('x-apple-entity-guid');
		}
		if (deletedGUID || (exceptionName == "CSPermissionDeniedError" && exceptionReason == "deleted")) {
			var canRestore = (CC.meta('x-apple-user-can-delete') == "true");
			var errorHTML = "<div>%@</div><div>%@</div>".loc("_Deleted.Placeholder.Title".loc(), "_Deleted.Placeholder.NoPermissions.Subtitle".loc());
			if (canRestore) {
				errorHTML = "<div>%@</div><div><a class=\"cc-restore-content-link\" data-guid=\"%@\">%@</div>".loc("_Deleted.Placeholder.Title".loc(), deletedGUID, "_Deleted.Placeholder.Restore.Subtitle".loc());
			}
			renderErrorHTML(errorHTML);
			if (canRestore) {
				var restoreLink = $('content-primary').down('.cc-restore-content-link');
				if (restoreLink) {
					Event.observe(restoreLink, 'click', function(inEvent) {
						Element.hide(restoreLink);
						var entityGUID = Event.findElement(inEvent, 'a.cc-restore-content-link').getAttribute('data-guid');
						dialogManager().showProgressMessage("_Deleted.Progress.Restoring".loc());
						// 14054855
						// Restoring may take some time depending on the size of the entity tree, so we periodically
						// check the content is actually isDeleted=false before refreshing the page.  If we refresh
						// the page too soon, we will get the restore UI again.
						var checkEntityPollInterval = 2000; // 2s
						var checkEntityIsDeleted = function() {
							return server_proxy().entityForGUID(entityGUID, function(inEntity) {
								if (!inEntity || inEntity.isDeleted == true) {
									setTimeout(checkEntityIsDeleted, checkEntityPollInterval);
									return;
								}
								dialogManager().hideProgressMessage();
								window.location.reload();
							}, function() {
								dialogManager().hideProgressMessage();
								notifier().printErrorMessage("_Deleted.Error.CouldNotRestore".loc());
								Element.show(restoreLink);
							});
						}
						server_proxy().undeleteEntityWithGUID(entityGUID, function() {
							setTimeout(checkEntityIsDeleted, checkEntityPollInterval);
						}, function() {
							dialogManager().hideProgressMessage();
							notifier().printErrorMessage("_Deleted.Error.CouldNotRestore".loc());
							Element.show(restoreLink);
						});
					});
				}
			}
			return;
		}
		if (exceptionName) {
			if (exceptionName == "CSPermissionDeniedError") {
				if (exceptionReason == "permission-denied") {
					return renderErrorMessage("_Errors.403".loc());
				}
				else if (exceptionReason == "not-found") {
					return renderErrorMessage("_Errors.404".loc());
				}
			}
			else if (exceptionName == "CSDatabaseError") {
				return renderErrorMessage("_Errors.500DB".loc())
			}
			return renderErrorMessage("_Errors.500".loc());
		} else {
			var routeURL = CC.getRouteFromURL();
			var routed;
			if (routeURL) {
				routed = globalRouteHandler().routeURL(routeURL, undefined, true);
			} else {
				routed = globalRouteHandler().routeURL('/', undefined, true);
			}
			if (!routed) {
				renderErrorMessage("_Errors.404".loc());
			}
		}
	}
});
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

