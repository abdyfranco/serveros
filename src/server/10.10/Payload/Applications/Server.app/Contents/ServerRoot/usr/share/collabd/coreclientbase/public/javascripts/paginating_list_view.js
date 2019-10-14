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
//= require "./filter_bar_view.js"

CC.DID_UPDATE_PAGINATING_LIST_VIEW = "DID_UPDATE_PAGINATING_LIST_VIEW";

// Base classes for paginating list behavior.

CC.PaginatingListView = Class.create(CC.Mvc.View, {
	mIsPaginating: false,
	mFilterBarViewClass: 'CC.FilterBarView',
	mFilterBarView: null,
	mPlaceholderString: "_General.No.Results.Found".loc(),
	mFilterBarChangedDelay: 100,
	render: function() {
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_BOTTOM);
		var tabIndexList = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_BOTTOM_LIST);
		var elem = Builder.node('div', {'tabindex': tabIndex, 'role': 'navigation', 'aria-label': "_Accessibility.View.BotList".loc(), className: 'cc-paginating-list-view'}, [
			Builder.node('div', {className: 'cc-paginating-list-view-filters'}),
			Builder.node('div', {'tabindex': tabIndexList, 'role': 'navigation', 'aria-label': "_Accessibility.View.ListView".loc(), className: 'cc-paginating-list-view-content loading'}),
			Builder.node('div', {className: 'cc-paginating-list-view-placeholder'}, this.mPlaceholderString),
			Builder.node('div', {className: 'cc-paginating-list-view-pagination', style: 'display: none;'}, "_General.Load.More".loc())
		]);
		elem.down('.cc-paginating-list-view-pagination').observe('click', this.handlePaginationLinkClicked.bind(this));
		// Append a filter bar instance.
		var konstructor = CC.objectForPropertyPath(this.mFilterBarViewClass);
		this.mFilterBarView = new konstructor();
		this.mFilterBarView._render();
		elem.down('.cc-paginating-list-view-filters').appendChild(this.mFilterBarView.$());
		var boundFilterBarChanged = this.handleFilterBarChangedNotification.bind(this);
		globalNotificationCenter().subscribe(CC.FILTER_BAR_DID_CHANGE_KEYWORD, boundFilterBarChanged, this.mFilterBarView);
		globalNotificationCenter().subscribe(CC.FILTER_BAR_DID_CHANGE_FILTER, boundFilterBarChanged, this.mFilterBarView);
		globalNotificationCenter().subscribe(CC.FILTER_BAR_DID_CHANGE_SORT_KEY, boundFilterBarChanged, this.mFilterBarView);
		globalNotificationCenter().subscribe(CC.FILTER_BAR_DID_CHANGE_TAGS, boundFilterBarChanged, this.mFilterBarView);
		return elem;
	},
	reset: function() {
		this.setIsPaginating(false);
		delete this.mPaginationState;
		this.$().down('.cc-paginating-list-view-content').innerHTML = "";
		this.$().down('.cc-paginating-list-view-content').addClassName('loading');
		this.paginate();
	},
	// Sets the paginating state of this paginating list view based on the boolean value inIsPaginating
	// that is passed. Note that if we're thought to be paginating and a pagination event comes in, it
	// will be ignored.
	setIsPaginating: function(inIsPaginating) {
		this.mIsPaginating = (inIsPaginating != undefined ? inIsPaginating : false);
		var content = this.$().down('.cc-paginating-list-view-content'), link = this.$().down('.cc-paginating-list-view-pagination');
		if (this.mIsPaginating) {
			link.addClassName('loading');
		} else {
			content.removeClassName('loading');
			link.removeClassName('loading');
		}
	},
	showPaginationLink: function(inShouldBeVisible) {
		var paginationLink = this.$().down('.cc-paginating-list-view-pagination');
		if (inShouldBeVisible) {
			paginationLink.show();
		} else {
			paginationLink.hide();
		}
	},
	setIsEmpty: function(inIsEmpty) {
		if (inIsEmpty) {
			this.$().addClassName('empty');
		} else {
			this.$().removeClassName('empty');
		}
	},
	handlePaginationLinkClicked: function(inEvent) {
		if (this.mIsPaginating) return false;
		this._paginate();
	},
	// Handle changed notifications on the filter bar view. 
	handleFilterBarChangedNotification: function(inMessage, inObject, inOptExtras) {
		// Since multiple filter bar notifications may come in in quick succession, use a timeout here
		// so we don't lose successive paginations while the previous pagination is in progress.
		if (this.mFilterBarChangedTimer) clearTimeout(this.mFilterBarChangedTimer);
		this.mFilterBarChangedTimer = setTimeout(function() {
			this.reset();
		}.bind(this), this.mFilterBarChangedDelay);
	},
	// Private wrapper function for pagination. You should not normally override this method.
	_paginate: function(inOptForcePaginate) {
		if (this.mIsPaginating && !inOptForcePaginate) return;
		this.setIsPaginating(true);
		var paginationGUID = this.mPaginationState.guid;
		var startIndex = ((this.mPaginationState.startIndex == undefined) ? 0 : this.mPaginationState.startIndex) + this.mPaginationState.previousResults.length;
		return this.paginate(paginationGUID, startIndex);
	},
	// Loads more items from the server. This is indirectly called when the pagination link is clicked
	// You should override this method to call a method in server_proxy asynchronously. You should use the
	// default pagination callback method below in doing so (and you should unless you're doing something
	// really funky).
	paginate: function(inPaginationGUID, inStartIndex) { /* Interface */ },
	// Default pagination callback.
	defaultPaginationCallback: function(inResults, inStartIndex, inTotal, inPaginationGUID) {
		this.setIsPaginating(false);
		// Is the list empty?
		this.setIsEmpty((inStartIndex == undefined || inStartIndex <= 0) && (!inResults || inResults.length == 0));
		var hasMoreResults = ((inTotal - ((inStartIndex || 0) + inResults.length)) > 0);
		// Update the pagination state.
		this.mPaginationState = {
			'previousResults': inResults,
			'startIndex': inStartIndex,
			'total': inTotal,
			'guid': inPaginationGUID,
			'hasMoreResults': hasMoreResults
		};
		// Show the paginator if we have more activity to show, otherwise hide it.
		this.showPaginationLink(hasMoreResults);
		// Render the results we got.
		if (inResults) this.renderResults(inResults);
		// Trigger a notification once the pagination is done.
		globalNotificationCenter().publish(CC.DID_UPDATE_PAGINATING_LIST_VIEW, this);
	},
	defaultPaginationErrback: function() { /* Interface */ },
	// Prepares a set of results for rendering.  You might want to override this if you're doing
	// grouping or client-side manipulation of data.
	prepareResultsForRendering: function(inResults) { /* Interface */
		return inResults;
	},
	// Renders a set of pagination results and appends them to the DOM.  You should not normally
	// override this method.
	renderResults: function(inResults, inOptAppendAtTop) {
	    if (!inResults || inResults.length == 0) return false;
		var rootElement = this.$().down('.cc-paginating-list-view-content');
		if (!rootElement) return;
		var preparedResults = this.prepareResultsForRendering(inResults) || inResults;
		var result, renderedResult;
		for (var resultIdx = 0; resultIdx < preparedResults.length; resultIdx++) {
			result = preparedResults[resultIdx];
			if (result) {
				renderedResult = this.renderResultItem(result);
				if (inOptAppendAtTop) {
					Element.insert(rootElement, {'top': renderedResult});
				} else {
					rootElement.appendChild(renderedResult);
				}
			}
		}
		globalNotificationCenter().publish(CC.Routes.NOTIFICATION_ROUTES_SHOULD_UPDATE);
	},
	// Returns a rendered DOM node for an individual pagination result item.  You should override this.
	renderResultItem: function(inResultItem) { /* Interface */ }
});
