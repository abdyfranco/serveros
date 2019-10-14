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

CC.EntityTitle = CC.EntityTitle || new Object();
CC.EntityTitle.NOTIFICATION_TITLE_SHOULD_UPDATE = 'ENTITY_TITLE_SHOULD_UPDATE';
CC.EntityTitle.NOTIFICATION_TITLE_DID_CHANGE = 'ENTITY_TITLE_DID_CHANGE';

// Base class for an editable page title view.  Used by the editor to display the page title,
// last modified information and a favorite star.  Also used to display standalone file titles.

CC.EntityTitle.EntityTitleView = Class.create(CC.Mvc.View, {
	// Should this title be editable or not?
	mEditable: false,
	// Renders the title view.
	render: function() {
		return Builder.node('div', {className: 'cc-entity-title chrome'}, [
			Builder.node('div', {className: 'title-container'}, [
				Builder.node('h1', {className: 'title-readonly'}),
				Builder.node('div', {className: 'title-edit'}, [
					Builder.node('input', {type: 'text'})
				]),
				Builder.node('h2'),
				Builder.node('a', {className: 'cc-entity-favorite-toggle'})
			])
		]);
	},
	// Watches for a page title changed notification and updates the title. Reverts to a
	// default placeholder where the title is undefined. It is assumed the notification
	// includes a store-compatible instance backed by a suitable record.
	updateDisplay: function(inMessage, inObject, inOptExtras) {
		// Update the page title.
		var title = (inObject && inObject.mRecord && inObject.getRecordPropertyForPath('longName'));
		var displayTitle = (!title || (title && title.isWhitespace())) ? "_EntityTitle.PageTitle.Untitled".loc() : title;
		var strippedTitle = displayTitle.strip();
		var entityURL = CC.entityURL(inObject.mRecord, true);
		var titleElement = this.$().down('h1.title-readonly');
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_ENTITY_TITLE);
		titleElement.innerHTML = "";
		titleElement.appendChild(Builder.node('a', {'tabindex': tabIndex, 'href': '#', 'data-href': entityURL, 'title': displayTitle}, strippedTitle));
		
		// Special treatment for ipad
		if (browser().isMobileSafari()) {
			if (inObject && inObject.mRecord) {
				var entity = inObject.mRecord;
				var favoriteToggle = this.$().down('.cc-entity-favorite-toggle');
				favoriteToggle.setAttribute('data-guid', entity.guid);
				entity.isFavorite ? favoriteToggle.addClassName('selected') : favoriteToggle.removeClassName('selected');
				var updatedTimestamp = globalLocalizationManager().localizedDateTime(entity.updateTime);
				var updatedDisplayName, updatedShortName, updatedByURL, updatedMarkup;				
				updatedDisplayName = CC.meta('x-apple-user-longName');
				updatedShortName = CC.meta('x-apple-user-shortName');				
				if (updatedShortName == "unauthenticated") {
					updatedMarkup = "_EntityTitle.LastModified.Unauthenticated".loc();
				} else {
					updatedByURL = CC.meta('x-apple-username');
					updatedMarkup = "<a href='%@'>%@</a>".fmt("/wiki/people/" + updatedShortName, updatedDisplayName);
				}				
				this.$().down('h2').innerHTML = "_EntityTitle.LastModified".loc(updatedTimestamp, updatedMarkup);
			}
		}
		// Update the favorite widget and last modified information.
		else if (inObject && inObject.mRecord && inObject.mRecord.updatedByUser) {		
			var entity = inObject.mRecord;
			var favoriteToggle = this.$().down('.cc-entity-favorite-toggle');
			favoriteToggle.setAttribute('data-guid', entity.guid);
			entity.isFavorite ? favoriteToggle.addClassName('selected') : favoriteToggle.removeClassName('selected');
			var updatedTimestamp = globalLocalizationManager().localizedDateTime(entity.updateTime);
			var updatedDisplayName, updatedShortName, updatedByURL, updatedMarkup;
			if (entity.updatedByUser.shortName == "unauthenticated") {
				updatedMarkup = "_EntityTitle.LastModified.Unauthenticated".loc();
			} else {
				updatedDisplayName = (entity.updatedByUser.longName || entity.updatedByUser.shortName).escapeHTML();
				updatedShortName = (entity.updatedByUser.shortName || "").escapeHTML();
				updatedByURL = CC.entityURL(entity.updatedByUser);
				updatedMarkup = "<a href='%@'>%@</a>".fmt(updatedByURL, updatedDisplayName);
			}
			this.$().down('h2').innerHTML = "_EntityTitle.LastModified".loc(updatedTimestamp, updatedMarkup);
		}
		globalNotificationCenter().publish(CC.Routes.NOTIFICATION_ROUTES_SHOULD_UPDATE, undefined, {'rootElement': this.$()});
		return true;
	},
	updateTitle: function() {
		var elem = this.$();
		var updatedTitle = $F(elem.down('input'));
		if (this._cachedTitle != updatedTitle) {
			this._cachedTitle = updatedTitle;
			elem.down('h1.title-readonly a').innerHTML = this._cachedTitle.escapeHTML();
			globalNotificationCenter().publish(CC.EntityTitle.NOTIFICATION_TITLE_DID_CHANGE, this, {title: this._cachedTitle});
		}
	},
	registerEventHandlers: function() {
		var elem = this.mParentElement;
		bindEventListeners(this, [
			'handleDisplayTitleClick',
			'handleDisplayTitleFieldBlur',
			'handleDisplayTitleFieldKeyDown',
			'handleDisplayTitleFieldKeyUp'
		]);
		Event.observe(elem.down('h1.title-readonly'), 'click', this.handleDisplayTitleClick);
		Event.observe(elem.down('input'), 'blur', this.handleDisplayTitleFieldBlur);
		Event.observe(elem.down('input'), 'keydown', this.handleDisplayTitleFieldKeyDown);
		Event.observe(elem.down('input'), 'keyup', this.handleDisplayTitleFieldKeyUp);
		elem.select('.cc-entity-favorite-toggle').each(function(toggle) { new CC.EntityFavoriteToggle(toggle); });
		globalNotificationCenter().subscribe(CC.EntityTitle.NOTIFICATION_TITLE_SHOULD_UPDATE, this.updateDisplay.bind(this), this.mContent);
	},
	handleDisplayTitleClick: function(inEvent) {
		if (!this.mEditable) {
			// Grab the data-href from the source.
			var header = Event.findElement(inEvent, 'h1');
			var source = header.down('a');
			var dataHref = source.getAttribute('data-href');
			if (dataHref) {
				globalRouteHandler().routeURL(dataHref);
				return true;
			}
		};
		// Stop the event so we don't trigger the link.
		Event.stop(inEvent);
		var elem = this.$();
		elem.addClassName('editing');
		this._cachedTitle = elem.down('h1.title-readonly a').innerHTML.unescapeHTML();
		this.$().down('input').value = this._cachedTitle;
		this.$().down('input').activate();
	},
	handleDisplayTitleFieldBlur: function(inEvent) {
		this.updateTitle();
		this.$().removeClassName('editing');
	},
	handleDisplayTitleFieldKeyDown: function(inEvent) {
		inEvent.stopPropagation();
		var keyCode = inEvent.keyCode;
		if (keyCode == Event.KEY_RETURN) this.handleDisplayTitleFieldBlur(inEvent);
		if (keyCode == Event.KEY_TAB) this.handleDisplayTitleFieldTab(inEvent);
	},
	handleDisplayTitleFieldKeyUp: function(inEvent) {
		this.updateTitle();
	},
	handleDisplayTitleFieldTab: function(inEvent) {
		Event.stop(inEvent);
		this.updateTitle();
		globalNotificationCenter().publish(CC.Keyboard.NOTIFICATION_DID_KEYBOARD_TAB, this);
	}
});
