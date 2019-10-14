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

// Container paginating list view.

CC.PaginatingContainerListView = Class.create(CC.PaginatingSearchQueryListView, {
	// Default to displaying actual preview icons.
	mDisplayGenericPreviewIcons: false,
	renderResultItem: function(inResultItem) {
		if (!inResultItem) return;
		var isFavorite = (inResultItem.isFavorite || false);
		var entityTitle = (inResultItem.longName || inResultItem.shortName);
		var entityURL = CC.entityURL(inResultItem, true);
		var iconURI = iconURIForEntity(inResultItem, this.mDisplayGenericPreviewIcons, 32, 32);
		var description = inResultItem.description;
		var contentListItem = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_LIST_ITEMS);
		var rowItems = [
			Builder.node('a', {'href': '#', 'role': 'checkbox', 'aria-label': "_Accessibility.CheckboxFavorite".loc(), 'className': 'cc-entity-favorite-toggle' + (isFavorite ? ' selected' : ''), 'data-guid': inResultItem.guid, 'title': "_General.Favorite.Toggle.Title".loc()}),
			Builder.node('span', { 'role': 'presentation', 'className': 'modtime'}, "_General.LastActivity.Format".loc(globalLocalizationManager().localizedDateTime(inResultItem.lastActivityTime || inResultItem.createTime))),
			Builder.node('span', { 'role': 'presentation', 'className': 'cc-entity-icon', 'style': 'background-image: url(%@); background-size: 32px 32px;'.fmt(iconURI)}, [
				Builder.node('img', {'role': 'presentation', 'src': (iconURI || "")})
			]),
			Builder.node('span', {'role': 'presentation', 'className': 'title ellipsis'}, [
				Builder.node('a', {'role': 'link', 'href': entityURL}, entityTitle)
			])
		];
		if (description) {
			var infoButton = Builder.node('span', {'className': 'infoButton'});
			infoButton.addEventListener('click', function(event){
				if (infoButton.childElementCount == 0) {
					infoButton.appendChild(Builder.node('div', {'className': 'descriptionPopup'}, [
					Builder.node('h1', "_General.Container.Description".loc()),
					Builder.node('h2', description)
					]));
				} else {
					infoButton.removeChild(infoButton.children[0]);
				}
			}, false);
			rowItems.push(infoButton);
		}
		var elem = Builder.node('div', {className: 'cc-container-list-item'}, rowItems);
		// Enable the favorite toggle.
		elem.select('.cc-entity-favorite-toggle').each(function(toggle) {
			new CC.EntityFavoriteToggle(toggle);
		});
		return elem;
	}
});
