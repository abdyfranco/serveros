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

//= require "./popover.js"

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
