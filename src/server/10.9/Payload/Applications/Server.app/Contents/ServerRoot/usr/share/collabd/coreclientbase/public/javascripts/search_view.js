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
//= require "./paginating_search_query_list_view.js"

CC.Search = CC.Search || new Object();

// Create a custom filter bar so we can sort by rank too.

CC.Search.CustomFilterBarViewFilters = $H({
	'rank': '-rank',
	'title': '+longName',
	'mostRecent': '-lastActivityTime',
	'leastRecent': '+lastActivityTime'
});

CC.Search.ReverseCustomFilterBarViewFilters = $H({
	'-rank': 'rank',
	'+longName': 'title',
	'-lastActivityTime': 'mostRecent',
	'+lastActivityTime': 'leastRecent'
});

CC.Search.PaginatingSearchResultsFilterBarView = Class.create(CC.FilterBarView, {
	mSortKey: '-rank',
	_mSortKey: 'rank',
	mAllowedFilters: CC.PAGINATING_SEARCH_QUERY_LIST_ALLOWED_FILTERS,
	mAllowedSortKeys: CC.Search.CustomFilterBarViewFilters,
	mAllowSavingSearch: true
});

// Paginating search results view.

CC.Search.PaginatingSearchResultsView = Class.create(CC.PaginatingSearchQueryListView, {
	mFilterBarViewClass: 'CC.Search.PaginatingSearchResultsFilterBarView',
	// Override the pagination callback so we can append a save search button. We do it here because
	// we're accessing the sessions global and need to be sure the session information is there (which
	// it may not be until at least one collabdproxy request has been made).
	defaultPaginationCallback: function($super, inResults, inStartIndex, inTotal, inPaginationGUID) {
		$super(inResults, inStartIndex, inTotal, inPaginationGUID);
		sessions().currentUserAsynchronously(function(user) {
			if (user && user.isAuthenticated) {
				if (!this.$().down('.cc-save-search-button')) {
					var savedSearchButton = Builder.node('a', {className:'cc-save-search-button cc-filter-bar-right-button'}, "_Search.SavedSearch.Save".loc());
					Event.observe(savedSearchButton, 'click', this.handleSaveSearchButtonClicked.bind(this));
					Element.insert(this.$().down('.section.last'), {'top': savedSearchButton});
				}
			}
		}.bind(this));
	},
	renderResultItem: function(inResultItem) {
		var entity = inResultItem;
		if (!entity) return;
		var isFavorite = entity.isFavorite ? entity.isFavorite : false;
		var iconURI = iconURIForEntity(inResultItem, true, 32, 32);
		var elem = Builder.node('div', {'role': 'presentation', className: 'cc-search-item'}, [
			Builder.node('div', {'role': 'presentation', className: 'cc-search-item-entity', 'data-guid': entity.guid, 'data-snippets': JSON.stringify(entity.snippets || {})}, [
				Builder.node('a', {'role': 'checkbox', 'href': '#', 'className': 'cc-entity-favorite-toggle' + (isFavorite ? ' selected' : ''), 'data-guid': entity.guid, 'title': "_General.Favorite.Toggle.Title".loc()}),
				Builder.node('span', {'role': 'presentation', 'className': 'modtime ellipsis'}),
				Builder.node('span', {'role': 'presentation', 'className': 'cc-entity-icon', 'style': 'background-image: url(%@); background-size: 32px 32px;'.fmt(iconURI)}, [
					Builder.node('img', {'role': 'presentation', 'src': (iconURI || "")})
				]),
				Builder.node('span', {'role': 'presentation', 'className': 'title ellipsis'}),
				Builder.node('span', {'role': 'presentation', 'className': 'owner ellipsis'}),
				Builder.node('div', {className:'cc-search-item-snippet-content'}),
				Builder.node('div', {className:'cc-search-item-snippet-tags'})
			])
		]);
		elem.select('.cc-entity-favorite-toggle').each(function(toggle) {
			new CC.EntityFavoriteToggle(toggle);
		});
		// Handle a title snippet up-front so we can use it to localize.
		var entityTitle = (entity.longName || entity.shortName).escapeHTML();
		if (entity.snippets) {
			var titleSnippet = (entity.snippets['longName'] || entity.snippets['shortName']);
			if (titleSnippet) {
				entityTitle = this.__wrapSnippetInHighlightTags(titleSnippet.escapeHTML());
			}
		}
		// Render the titles and last modified timestamp.
		var entityLink = "<a href='%@'>%@</a>".fmt(CC.entityURL(entity, true), entityTitle);
		elem.down('span.title').innerHTML = entityLink;
		var ownerLink = "<a href='%@'>%@</a>".fmt(CC.entityURL(entity.container, true), (entity.container.longName || entity.container.shortName).escapeHTML());
		elem.down('span.owner').innerHTML = "_Search.Owner.Title.Format".loc(ownerLink);
		var userLink = "<a href='%@'>%@</a>".fmt(CC.entityURL(entity.updatedByUser, true), (entity.updatedByUser.longName || entity.updatedByUser.shortName).escapeHTML());
		elem.down('span.modtime').innerHTML = "_Search.LastModified.Subtitle.Format".loc(globalLocalizationManager().localizedDateTime(entity.lastActivityTime || entity.createTime), userLink);
		// Handle content and tag snippets.
		if (entity.snippets) {
			var contentSnippet = (entity.snippets['extendedAttributes.pageTextValue'] || entity.snippets['content']);
			// HTML snippets are annotated html fragments with {{{ snippet decorations.
			var htmlSnippet = entity.snippets['extendedAttributes.renderedPage'];
			if (!contentSnippet && htmlSnippet) {
				var tempNode = document.createElement("div");
				// If htmlSnippet is an array, we need to join them to get one string.
				if (Object.isArray(htmlSnippet)) htmlSnippet = htmlSnippet.join("_Search.MultipleSnippet.Divider".loc());
				tempNode.innerHTML = htmlSnippet;
				contentSnippet = tempNode.textContent || tempNode.innerText;
			}
			if (contentSnippet) {
				elem.down('.cc-search-item-snippet-content').innerHTML = this.__wrapSnippetInHighlightTags(contentSnippet);
			}
			var tagsSnippet = entity.snippets['tags'];
			if (tagsSnippet) {
				// When one tag matched, the snippet is a string, otherwise it's an array.  Always work with arrays.
				if (!Object.isArray(tagsSnippet)) tagsSnippet = [tagsSnippet];
				// Always show all tags.  Build a list of all tags interleaved with matching tag snippets.
				var allTags = $A(entity.tags || []);
				// First sort the original tags alphabetically (case insensitive).
				var sortedTags = allTags.sortBy(function(n) { return n.toLowerCase(); });
				for (var i = 0; i < sortedTags.length; i++) {
					sortedTags[i] = sortedTags[i].escapeHTML();
				}
				
				var tag, originalTag, sortedTagIndex;
				for (var tdx = 0; tdx < tagsSnippet.length; tdx++) {
					// Get the original unwrapped tag.
					tag = tagsSnippet[tdx];
					originalTag = tag.replace(/{{{|}}}/g, '');
					// Replace the original tag with an annotated version.
					sortedTagIndex = sortedTags.indexOf(originalTag);
					if (sortedTagIndex != -1) {
						sortedTags[sortedTagIndex] = this.__wrapSnippetInHighlightTags(tag);
					}
				}
				// Build out the tags list.
				elem.down('.cc-search-item-snippet-tags').innerHTML = "<span>%@</span>&nbsp;&nbsp;%@".fmt("_Search.Tags.Subtitle".loc(), sortedTags.join("&nbsp;&nbsp;"));
			}
		}
		return elem;
	},
	__wrapSnippetInHighlightTags: function(inSnippet) {
		var snippets = (Object.isArray(inSnippet) ? inSnippet : [inSnippet]), s, result = [];
		for (var sdx = 0; sdx < snippets.length; sdx++) {
			s = snippets[sdx];
			result.push(s.replace(/{{{/g, '<span class="highlight">').replace(/}}}/g, '</span>'));
		}
		return result.join("_Search.MultipleSnippet.Divider".loc());
	},
	handleSaveSearchButtonClicked:function(inEvent) {
		if (!$('save_search_dialog')) {
			dialogManager().drawDialog('save_search_dialog', [
				{ label: "_Search.SavedSearch.Save.Dialog.Label".loc(), contents: '<input type="text" id="save_search_dialog_input" />' },
			], "_Search.SavedSearch.Save.Dialog.OK".loc(), false, "_Search.SavedSearch.Save.Dialog.Title".loc(), "_Dialogs.Cancel".loc());
		}
		var input = $('save_search_dialog_input');
		var callback = function() {
			dialogManager().hide();
			dialogManager().showProgressMessage("_Search.SavedSearch.Save.Dialog.Progress".loc());
			var name = input.value;
			var query = this.buildQuery();
			return server_proxy().saveQueryAsSavedSearchWithName(query, name, this.handleDidSaveSearch.bind(this), this.handleDidSaveSearch.bind(this));
		}
		input.value = (this.mFilterBarView.mKeyword || "_Search.SavedSearch.Untitled".loc());
		dialogManager().show('save_search_dialog', null, callback.bind(this), null, input);
	},
	handleDidSaveSearch: function(inResponse) {
		dialogManager().hide();
		if (inResponse && inResponse.succeeded) {
			this.mParentElement.down('.cc-save-search-button').hide();
			// Publish a notification to say the search saved.
			globalNotificationCenter().publish(CC.SEARCH_VIEW_DID_SAVE_SEARCH, this);
		}
	}
});

CC.Search.queryToURL = function(inQuery) {
	// utility method for munging from a query to url parameters...
	var onlyDeleted = inQuery.onlyDeleted;
	// go through the actual query and snarf out what we can
	var keywords = [];
	var tags = [];
	var favoritesOnly = false;
	var sortKeys = [];
	// assume it's an and node for now
	$A(inQuery.query.and).each(function(aNode) { 
		if (aNode.field) {
			if (aNode.field == "isFavorite") {
				favoritesOnly = aNode.match;
			}
			if (aNode.field == "tags") {
				tags.push(aNode.value);
			}
		} else {
			if (aNode.value) {
				// assume it's a keyword search
				keywords.push(aNode.value);
			}
			if (aNode.match) {
				keywords.push(aNode.match);
			}
		}
	});
	$A(inQuery.sortFields).each(function(aSortKey) {
		sortKeys.push(aSortKey);
	});
	
	// now construct the query string based on the values we've snarfed
	var queryString = "/find?";
	if (keywords.length > 0) {
		queryString = queryString + "keyword=" + keywords.join("&keyword=");
	}
	if (tags.length > 0) {
		if (keywords.length > 0) {
			queryString = queryString + "&";
		}
		queryString = queryString + "tags=" + tags.join("&tags=");
	}
	if (favoritesOnly) {
		if (tags.length || keywords.length) {
			queryString = queryString + "&";
		}
		queryString = queryString + "favorites_only=true";
	}
	if (sortKeys.length > 0) {
		if (favoritesOnly || tags.length || keywords.length) {
			queryString = queryString + "&";
		}
		queryString = queryString + "sortKey=" + sortKeys.join("&sortKey=");
	}
	return queryString;
};

// Helper function that updates a CC.FilterBarView with a set of URL query params.
// Note that it bypasses the setters for the view deliberately so it can be used to
// set up initial state.

CC.Search.setupFilterForQuery = function(filter, params) {
	if (params['favorites_only'] == 'true') {
		filter.setFilter('favorites');
	} else if (params['deleted_only'] == 'true') {
		filter.setFilter('deleted')
	} else {
		filter.setFilter('everything');
	}
	if (params['sortKey']) {
		var aSortKey = CC.Search.ReverseCustomFilterBarViewFilters.get(params['sortKey']);
		if (aSortKey) {
			filter.setSortKey(aSortKey);
		}
	} else {
		filter.setSortKey('mostRecent');
	}
	if (!params['sortKey']) {
		filter.setSortKey('rank');
	}
	filter.setTags(params['tags']);
	filter.setKeyword(params['keyword']);
};

CC.Search.translateOldQueryParamsToNew = function() {
	var queryString = "/find?";
	var queryParams = [];
	// old urls are in the form ?q[keyword]=test&q[tags][]=find&q[tags][]=hot&q[owners][]=
	// or q[deleted_only]=false&q[favorites_only]=true&q[how_many]=25&q[keyword]=&q[mine_only]=false&q[owners][]=&q[sort_direction]=desc&q[sort_property]=rank&q[start_index]=0&q[tags][]=tag&q[unread_only]=false&q[watched_only]=false
	// we only care about keyword, tags, favorites_only, sort_property, sort_direction, tags, owners
	var params = CC.params();
	if (params['q[keyword]']) {
		var keywords = Object.isArray(params['q[keyword]']) ? params['q[keyword]']: [params['q[keyword]']];
		queryParams.push("keyword="+keywords.join('&keyword='));
	}
	if (params['q[tags][]']) {
		var tags = Object.isArray(params['q[tags][]']) ? params['q[tags][]'] : [params['q[tags][]']];
		queryParams.push("tags="+params['q[tags][]'].join('&tags='));
	}
	if (params['q[owners][]']) {
		var owners = Object.isArray(params['q[owners][]']) ? params['q[owners][]'] : [params['q[owners][]']];
		queryParams.push("scopeGUID="+owners.join('&scopeGUID='));
	}
	if (params['q[deleted_only]']) {
		var deletedOnly = Object.isArray(params['q[deleted_only]']) ? params['q[deleted_only]'][0] : params['q[deleted_only]'];
		queryParams.push("deletedOnly="+deletedOnly);
	}
	if (params['q[favorites_only]']) {
		var favoritesOnly = Object.isArray(params['q[favorites_only]']) ? params['q[favorites_only]'][0] : params['q[favorites_only]'];
		queryParams.push("favoritesOnly="+favoritesOnly);
	}
	queryString = queryString + queryParams.join('&');
	
	return env().root_path + queryString;
};
