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

//= require "./dialogs.js"

CC.DID_FAVORITE_ENTITY_NOTIFICATION = 'DID_FAVORITE_ENTITY';
CC.DID_UNFAVORITE_ENTITY_NOTIFICATION = 'DID_UNFAVORITE_ENTITY';
CC.DID_MARK_ENTITY_AS_READ_NOTIFICATION = 'DID_MARK_ENTITY_AS_READ';
CC.DID_MARK_ENTITY_AS_UNREAD_NOTIFICATION = 'DID_MARK_ENTITY_AS_UNREAD';

// Entity toggle base class.

CC.BaseEntityToggle = Class.create({
	initialize: function(element) {
		this.element = $(element);
		if (this.element.hasClassName('enabled')) return;
		this.element.addClassName('enabled');
		this.element.on(browser().isMobileSafari() ? 'touchstart' : 'mousedown', this.onElementClick.bindAsEventListener(this));
		this.setIsSelected(this.element.hasClassName('selected'), false);
	},
	onElementClick: function(e) {
		Event.stop(e);
		this.toggleIsSelected();
	},
	toggleIsSelected: function() {
		this.setIsSelected(!this.getIsSelected());
	},
	getIsSelected: function() {
		return this.element.hasClassName('selected');
	},
	setIsSelected: function(value, persist) {
		if (persist === undefined) persist = true;
		this.element.setClassName('selected', value);
		this.updateTooltip();
		if (persist) this.persistIsSelected();
	},
	updateTooltip: function() { /* Interface */ },
	persistIsSelected: function() { /* Interface */ }
});

CC.EntityFavoriteToggle = Class.create(CC.BaseEntityToggle, {
	persistIsSelected: function() {
		if (this.getIsSelected()) {
			server_proxy().addEntityToFavorites(this.element.getDataAttributes().guid, function() {
				globalNotificationCenter().publish(CC.DID_FAVORITE_ENTITY_NOTIFICATION, this, {'guid': this.element.getDataAttributes().guid});
			}.bind(this));
		} else {
			server_proxy().removeEntityFromFavorites(this.element.getDataAttributes().guid, function() {
				globalNotificationCenter().publish(CC.DID_UNFAVORITE_ENTITY_NOTIFICATION, this, {'guid': this.element.getDataAttributes().guid});
			}.bind(this));
		}
	}
});

CC.EntityUnreadToggle = Class.create(CC.BaseEntityToggle, {
	persistIsSelected: function() {
		if (this.getIsSelected()) {
			server_proxy().markEntityAsUnread(this.element.getDataAttributes().guid, function() {
				globalNotificationCenter().publish(CC.DID_MARK_ENTITY_AS_READ_NOTIFICATION, this, {'guid': this.element.getDataAttributes().guid});
			}.bind(this));
		} else {
			server_proxy().markEntityAsRead(this.element.getDataAttributes().guid, function() {
				globalNotificationCenter().publish(CC.DID_MARK_ENTITY_AS_UNREAD_NOTIFICATION, this, {'guid': this.element.getDataAttributes().guid});
			}.bind(this));
		}
	}
});

var SearchFieldBase = Class.create({
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
		observeEvents(this, this.mSearchField, {keydown:'handleKeypress'});
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
			this.suggestUID(elm.parentNode[inKey].firstChild.dataSource.entityGUID);
		}
		else if ((!elm) && inKey == "nextSibling" && this.mRows && this.mRows.length > 0) {
			this.suggestUID(this.mRows[0].entityGUID);
		}
		// If we're at the first node, and we're keying up, deselect
		// the first item in the list and focus the input field.
		else if (inKey == 'previousSibling' && this.mSuggestedUID == this.mRows[0].entityGUID) {
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
			if (this.mClickedItemCallback) this.mClickedItemCallback(this.mChosenUID, this.mChosenDataSource.entityURL);
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
		// superclass does nothing
	},
	mousedOutUser: function(e) {
		// superclass does nothing
	},
	clickedUser: function(e) {
		this.suggestUID(Event.findElement(e, (this.mIsReallyTable?'td':'a')).dataSource.entityGUID);
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
				replaceElementContents(this.mResultTable, Builder.node('li', {className:'search_placeholder busy_field'}, [Builder.node('a', {href:'#', onclick:invalidate}, "_Dialogs.LinkSearch.Progress.Searching".loc())]));
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
				var currentCell = Builder.node((this.mIsReallyTable?'td':'a'), {id:this.mResultTable.id+'_'+row.entityGUID});
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
});

var LinkSearchDialog = Class.create({
	mDialogTitle: "_Dialogs.LinkSearch.Title",
	mSearchFieldPlaceholder: "_Dialogs.LinkSearch.Search.Placeholder",
	mDialogDescription: "_Dialogs.LinkSearch.Description",
	mEntityTypes: ['com.apple.entity.Page', 'com.apple.entity.File'],
	mExcludedGUIDs: [],
	// An array of guids to exclude from search results.
	mExcludedGUIDs: null,
	initialize: function(/* [options] */) {
		if (arguments.length && arguments[0]) Object.extend(this, arguments[0]);
	},
	show: function(inAnchor, inCancelCallback, inOKCallback, inOptSearchString) {
		var tabIndexName = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_MOVE_TO_WIKI_NAME);
		var tabIndexResult = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_MOVE_TO_WIKI_RESULT);
		
		var linkSearchDialog = $('link_search_dialog');
		if (linkSearchDialog) Element.remove(linkSearchDialog);
		dialogManager().drawDialog('link_search_dialog', [
			{contents:'<input tabindex="' + tabIndexName + '" role="textbox" type="'+(browser().isWebKit?'search':'text')+'" id="link_search_dialog_q" class="search_field" placeholder="'+(this.mSearchFieldPlaceholder || "").loc()+'"+"results="10" incremental>'},
			{contents:'<ul tabindex="' + tabIndexResult + '" role="list" aria-label="' + "_Accessibility.View.SearchResult".loc() + '" id="link_search_dialog_results"></ul>'}
		], "_Dialogs.LinkSearch.Button.OK".loc(), undefined, this.mDialogTitle.loc());
		// don't send the form when the user hits return
		$('link_search_dialog').down('form').onsubmit = invalidate;
		// hook up the search field
		this.mSearchField = new LinkSearchField('link_search_dialog_q', {
			mEntityTypes: this.mEntityTypes,
			mExcludedGUIDs: this.mExcludedGUIDs,
			mResultTable: $('link_search_dialog_results'),
			mClickedItemCallback: this.handleItemClick.bind(this)
		});
		var descriptionRow = Builder.node('tr', [
			Builder.node('td', {colSpan: 2, className: 'description'}, (this.mDialogDescription || "").loc())
		]);
		Element.insert($('link_search_dialog').down('tbody'), {top: descriptionRow});
		this.mCancelCallback = inCancelCallback;
		this.mOKCallback = inOKCallback;
		dialogManager().show('link_search_dialog', this.handleCancel.bind(this), this.handleOK.bind(this), $(inAnchor), undefined, 'link_search_dialog_q');
		if (inOptSearchString) {
			$('link_search_dialog_q').value = inOptSearchString;
			this.mSearchString = inOptSearchString;
			this.mSearchField.runQuery();
		}
		
		// Temporary disabling background items when modal dialog is open in order to avoid bad tabindex-ing
		accessibility().makeRootViewsAriaHidden(false);
	},
	handleCancel: function() {				
		if (this.mCancelCallback) this.mCancelCallback();		
		
		// Bring background items back to foreground when closing modal dialog to bring back original tabindex-ing
		accessibility().makeRootViewsAriaVisible(false);
	},
	handleOK: function() {
		this.mSearchField.selectSuggestedUID();
		var dataSource = (this.mSearchField.mChosenDataSource || {})
		if (this.mOKCallback) this.mOKCallback(dataSource.entityURL, (this.mSearchString || dataSource.entityLongName));
		delete this.mChosenUID;
		delete this.mChosenTitle;
		
		// Bring background items back to foreground when closing modal dialog to bring back original tabindex-ing
		accessibility().makeRootViewsAriaVisible(false);		
	},
	handleItemClick: function(inDisplayString, inOptURL) {
		var dataSource = (this.mSearchField.mChosenDataSource || {});
		this.mChosenUID = dataSource.entityGUID;
		this.mChosenTitle = dataSource.entityLongName;
		return false;
	}
});

var LinkSearchField = Class.create(SearchFieldBase, {
	mEntityTypes: null,
	mExcludedGUIDs: null,
	mPositionResults: false,
	mCaptureReturnChar: true,
	mSelectOnClick: true,
	gotSearchResult: function(inRows) {
		this.mRows = (inRows || []);
		this.draw();
		this.mTimer = null;
	},
	getDisplayString: function(inRow) {
		return inRow.entityLongName || inRow.entityGUID;
	},
	clickedUser: function(e) {
		e.stop();
		this.suggestUID(Event.findElement(e, 'a').dataSource.entityGUID);
		return false;
	},
	constructQuery: function(inSearchString) {
		var searchString;
		if (inSearchString && inSearchString != "") searchString = inSearchString;
		var query = server_proxy().searchQuery(searchString, this.mEntityTypes, 0, 10);
		var callback = function(response) {
			if (response) {
				var r, rentity, rows = [];
				for (var rdx = 0; rdx < response.length; rdx++) {
					r = response[rdx];
					if (r && r.entity) {
						rentity = r.entity;
						if (this.mExcludedGUIDs && this.mExcludedGUIDs.length) {
							if (this.mExcludedGUIDs.indexOf(rentity.guid) > -1) continue;
						}
						rows.push({
							'entityGUID': rentity.guid,
							'entityType': rentity.type,
							'entityURL': CC.entityURL(rentity),
							'entityLongName': (rentity.longName || rentity.shortName)
						});
					}
				}
				return this.gotSearchResult(rows);
			}
			this.mTimer = null;
		}.bind(this);
		return server_proxy().entitiesForSearchQuery(query, callback, callback);
	},
	fieldChanged: function(e) {
		if (!this.mTimer) this.mTimer = setTimeout(this.runQuery.bind(this), this.mInterval);
	},
	handleChanged: function(e) {
		// statically displayed results table, so we shouldn't do the normal hiding stuff in this subclass
	}
});

var UserSearchField = Class.create(SearchFieldBase, {
	mSortKey: 'displayName',
	mValueKey: 'displayName',
	mMinQueryChars: 3,
	mSearchCancelledCallback: function() {
		this.mResultTable.hide();
	},
	filterTagInput: function(inTagName) {
		return inTagName.replace(/[\t\r\n]/g, ' ').replace(/^\s+/, '').replace(/\s+$/, '');
	},
	getDisplayString: function(inRow) {
		return inRow['entityUserLongName'] + ' (' + inRow['entityUserLogin'] + ')';
	},
	constructQuery: function(inSearchString) {
		if (!inSearchString) return;
		server_proxy().odRecordsMatching(inSearchString, this.gotSearchResult.bind(this), function() { this.mTimer = null; }.bind(this));
	},
	gotSearchResult: function(inResponse) {
		this.mRows = inResponse.collect(function(aRow) {
			var anItem = {
				entityUserLogin: aRow.login,
				entityUserLongName: (aRow.longName || aRow.login),
				entityGUID: aRow.externalID,
				url: "#"
			}
			return anItem;
		})
		this.draw();
		this.mTimer = null;
	},
	updatePosition: function($super) {
		$super();
		this.mResultTable.setStyle({
			'top': parseInt(this.mResultTable.getStyle('top'), 10) - 1 + 'px',
			'width': this.mResultTable.getWidth() - 4 + 'px'
		});
	}
});

var TagSearchField = Class.create(UserSearchField, {
	mSearchPath: '/tags/autocomplete',
	getDisplayString: function(inRow) {
		return inRow.entityGUID;
	},
	gotSearchResult: function(inResponse) {
		this.mRows = inResponse.responseJSON.each(function(row) { row.url = "#"; });
		this.draw();
		this.mTimer = null;
	},
	constructQuery: function(inSearchString) {
		if (!inSearchString) return;
		var url = "%@%@?keyword=%@".fmt(env().root_path, this.mSearchPath, inSearchString);
		return new Ajax.Request(url, {
			method: 'get',
			contentType: 'application/json',
			requestHeaders: { Accept: 'application/json' },
			onSuccess: this.gotSearchResult.bind(this),
			onFailure: function() { this.mTimer = null }.bind(this)
		});
	}
});
