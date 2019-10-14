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

//= require "./paginating_list_view.js"

CC.PAGINATING_SEARCH_QUERY_LIST_ALLOWED_FILTERS = ['everything', 'favorites'];
if (CC.meta('x-apple-user-is-admin') == "true") {
	CC.PAGINATING_SEARCH_QUERY_LIST_ALLOWED_FILTERS.push('deleted');
}
CC.PAGINATING_SEARCH_QUERY_LIST_ALLOWED_SORT_KEYS = $H({
	'title': 'longName',
	'mostRecent': '-lastActivityTime',
	'leastRecent': 'lastActivityTime'
});

CC.PaginatingSearchQueryListFilterBarView = Class.create(CC.FilterBarView, {
	mAllowedFilters: CC.PAGINATING_SEARCH_QUERY_LIST_ALLOWED_FILTERS,
	mAllowedSortKeys: CC.PAGINATING_SEARCH_QUERY_LIST_ALLOWED_SORT_KEYS
});

// A search-backed paginating list view base class.

CC.PaginatingSearchQueryListView = Class.create(CC.PaginatingListView, {
	mEntityTypes: ['com.apple.entity.Page', 'com.apple.entity.File'],
	mSearchFields: null,
	mSubFields: null,
	mRequestOptions: null,
	mOwnerGUID: null,
	mDefaultPaginationHowMany: 25,
	mStashedRecordedQuery: null,
	mRecordedQueryGUID: null,
	mFilterBarViewClass: 'CC.PaginatingSearchQueryListFilterBarView',
	buildQuery: function(inStartIndex, inHowMany) {
		var keyword = this.mFilterBarView.mKeyword;
		// Are we filtering by favorites only?
		var filter = this.mFilterBarView.mFilter;
		var favoritesOnly = (filter == 'favorites');
		var deletedOnly = (filter == 'deleted');
		// Grab the sort order of the filter bar.
		var sortOrder = this.mFilterBarView.mSortKey;
		// Grab the scope of the filter bar.
		var ownerGUID = this.mOwnerGUID;
		// Build a query to search with.
		var query = server_proxy().searchQuery((keyword ? [keyword] : []), this.mEntityTypes);
		var tags = this.mFilterBarView.mTags;
		if (tags && tags.length > 0) {
			query = server_proxy().addTagsToQuery(tags, query);
		}
		if (deletedOnly) {
			query.onlyDeleted = true;
		}
		// Update the query with favorite/sort settings.
		query = server_proxy().searchQueryFavoritesOnly(query, favoritesOnly);
		query = server_proxy().searchQueryUpdateSort(query, sortOrder);
		query = server_proxy().searchQueryUpdateOwnerGUID(query, ownerGUID);
		// Fake a start index (we use the query range here instead of the pagination API).
		var startIndex = (inStartIndex || query.range[0]);
		// Fake pagination by requesting n+1 items.  We'll throw away the last item later.
		// Set the query range.
		query.range = [startIndex, (inHowMany || this.mDefaultPaginationHowMany + 1)];
		// Does this view specify custom search/sub/sort fields for the search?
		if (this.mSearchFields) query.fields = this.mSearchFields;
		if (this.mSubFields) query.subFields = this.mSubFields;
		return query;
	},
	// Use a custom pagination method that actually adjusts the range of a search query instead
	// of the paginateQuery API.
	paginate: function(inPaginationGUID, inStartIndex) {
		var howMany = this.mDefaultPaginationHowMany + 1;
		var query = this.buildQuery(inStartIndex, howMany);
		// Stash the query so we can record it.
		this.mStashedRecordedQuery = CC.deepClone(query);
		// Paginate using a custom callback that fakes the pagination API.
		var _callback = function(inResponse) {
			var models = server_proxy()._parseSearchResultsAndStoreEntities(inResponse);
			var total = ((inStartIndex || 0) + models.length + 1);
			// Did we get less than a full window of items?  If we did, we don't need to continue paginating.
			if (models.length < howMany) total -= 1;
			// Otherwise, drop the last item.
			if (models.length == howMany) {
				models.pop();
			}
			return this.defaultPaginationCallback(models, (inStartIndex || 0), total);
		}.bind(this);
		server_proxy().entitiesForSearchQueryWithOptions(query, this.mRequestOptions, _callback, this.defaultPaginationErrback.bind(this));
	},
	// Override this function so we can fetch a recorded query GUID out-of-band.
	defaultPaginationCallback: function($super, inResults, inStartIndex, inTotal, inPaginationGUID) {
		$super(inResults, inStartIndex, inTotal, inPaginationGUID);
		// Once we've rendered the list, record the query if query recording is enabled.
		if (CC.meta('x-apple-config-RecordSearchStats') == "true") {
			server_proxy().recordQuery(this.mStashedRecordedQuery, function(guid) {
				this.mRecordedQueryGUID = guid;
				// Attach an event handler that will fire before the route.
				var results = $$('.cc-search-item-entity span.title:not(.cc-search-recording-enabled)');
				var boundHandler = this.handleRecordedSearchResultMouseDown.bind(this);
				results.each(function(result) {
					// Use mousedown to ensure the event handler fires before the default route handler.
					Event.observe(result, 'mousedown', boundHandler);
					result.addClassName('cc-search-recording-enabled');
				});
			}.bind(this), Prototype.emptyFunction);
		}
	},
	// Records a result.
	handleRecordedSearchResultMouseDown: function(inEvent) {
		var clickedResult = Event.findElement(inEvent, '.cc-search-item-entity');
		var clickedDataAttributes = clickedResult.getDataAttributes();
		var clickedGUID = clickedDataAttributes['guid'];
		var clickedSnippets = JSON.parse(clickedDataAttributes['snippets']);
		var allSearchResults = $$('.cc-search-item-entity');
		var index = allSearchResults.indexOf(clickedResult);
		server_proxy().recordClickInResultsWithGUID(this.mRecordedQueryGUID, index, clickedSnippets, clickedGUID);
	}
});
