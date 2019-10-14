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
//= require "./paginating_list_view.js"

CC.Activity = CC.Activity || new Object();

// An array of supported entity types.

CC.Activity.SUPPORTED_ENTITY_TYPES = $A([
	"com.apple.entity.Page",
	"com.apple.entity.File"	
]);

// An array of supported activity types.

CC.Activity.SUPPORTED_ACTIVITY_TYPES = $A([
	"com.apple.activity.TagAdded",
	"com.apple.activity.TagRemoved",
	"com.apple.activity.EntityCreated",
	"com.apple.activity.EntityUpdated",
	"com.apple.activity.EntityRenamed",
	"com.apple.activity.EntityMoved",
	"com.apple.activity.EntityRemoved",
	"com.apple.activity.RelationshipAdded",
	"com.apple.activity.RelationshipRemoved",
	"com.apple.activity.CommentAdded",
	"com.apple.activity.CommentRemoved",
	"com.apple.activity.CommentApproved"
]);

// An array of activity types that coalesce, e.g. "added 3 tags".

CC.Activity.COALESCING_ACTIVITY_TYPES = $A([
	"com.apple.activity.TagAdded",
	"com.apple.activity.TagRemoved",
	"com.apple.activity.EntityUpdated",
	"com.apple.activity.RelationshipAdded",
	"com.apple.activity.RelationshipRemoved",
	"com.apple.activity.CommentAdded",
	"com.apple.activity.CommentRemoved",
	"com.apple.activity.CommentApproved"
]);

// Grouped activity view.

CC.Activity.GroupedPaginatingActivityView = Class.create(CC.PaginatingListView, {
	mDefaultActivityRequestWindow: 250,
	mWatchedOnly: true,
	mMinimumItemsPerActivityBucket: 1,
	// Coalescing window (in seconds). Multiple sequential activity by the same user in this window will be collapsed.
	// Defaults to 30 minutes.
	mActivityCoalescingWindow: 1800,
	mEnableActivityWindowCoalescing: false,
	// Scoping GUIDs which triggers the container or user-specific activity list behaviors. When you pass a containerGUID,
	// we see all activity under that GUID, and when you pass a userGUID, you see all activity by that user.  Note that
	// this is not the same as container/owner meta tags.
	mScopingUserGUID: null,
	mScopingOwnerGUID: null,
	mScopingContainerGUID: null,
	mPlaceholderString: "_Activity.No.Results.Found".loc(),
	mSomethingUnread: false,
	initialize: function($super) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		bindEventListeners(this, ['toggleCollapsed']);
	},
	render: function($super) {
		var elem = $super();
		var markAllReadButton = Builder.node('a', {className:'cc-mark-all-read-button cc-filter-bar-right-button', id:'cc-mark-all-read-button', style: 'display: none;'}, "_Activity.MarkAllRead".loc());
		Event.observe(markAllReadButton, 'click', this.handleMarkAllReadButtonClicked.bind(this));
		Element.insert(elem.down('.section.last'), {'top': markAllReadButton});
		return elem;
	},
	activityStreamCallback: function() {
		var callback = function(inResults, inStartIndex, inTotal, inPaginationGUID) {
			// Drop any activity items we are already displaying.
			var topLevelActivityGUIDs = this.$().select('.cc-activity-item').invoke('getAttribute', 'data-guid');
			var filteredResults = [], resultItem;
			for (var rdx = 0; rdx < inResults.length; rdx++) {
				resultItem = inResults[rdx];
				if (topLevelActivityGUIDs.indexOf(resultItem.guid) != -1) break;
				filteredResults.push(resultItem);
				continue;
			}
			this.renderResults(filteredResults, true, true);
		}
		this.paginatedActivity(undefined, 0, callback.bind(this), Prototype.emptyFunction);
	},
	paginate: function(inPaginationGUID, inStartIndex) {
		// Set up an activity page stream after our first pagination.
		if (!this.mActivityStream) {
			var url = "/__collabd/streams/activity?format=js";
			if (this.mScopingContainerGUID) url += "&containerGUID=" + this.mScopingContainerGUID;
			if (this.mScopingOwnerGUID) url += "&ownerGUID=" + this.mScopingOwnerGUID;
			if (this.mScopingUserGUID) url += "&userGUID=" + this.mScopingUserGUID;
			this.mActivityStream = new CC.ActivityStream.ChunkFrame({mURL: url, mCallback: this.activityStreamCallback.bind(this)});
		}
		this.paginatedActivity(inPaginationGUID, inStartIndex, this.defaultPaginationCallback.bind(this), this.defaultPaginationErrback.bind(this));
	},
	paginatedActivity: function(inOptPaginationGUID, inOptStartIndex, inOptCallback, inOptErrback) {
		// Do we have a filter?
		var filter = this.mFilterBarView.mFilter;
		var favoritesOnly = (filter == 'favorites');
		var unreadOnly = (filter == 'unread');
		server_proxy().paginatedActivity(this.mScopingUserGUID, this.mScopingOwnerGUID, this.mScopingContainerGUID, inOptPaginationGUID, (inOptStartIndex || 0), this.mDefaultActivityRequestWindow, favoritesOnly, unreadOnly, this.mWatchedOnly, null, inOptCallback, inOptErrback);
	},
	// Buckets an array of activity model objects based on root entity. Returns an array of 2-part
	// tuples. The first entry in the tuple is the entity model, the second a date-ordered array
	// of activity models. We assume that activity items are already sorted in date order (newest
	// to oldest).
	groupActivity: function(inActivityItems) {
		var bucketed = [];
		var orderedEntityGUIDs = new Array();
		var activityHashByGUID = new Hash();
		// First partition the activity by entityGUID.
		for (var idx = 0; idx < inActivityItems.length; idx++) {
			var item = inActivityItems[idx];
			// Skip unsupported activity types.
			if (!CC.Activity.SUPPORTED_ACTIVITY_TYPES.include(item.action)) continue;
			// Skip unsupported entity types.
			var subFields = item.subFields;
			if (subFields.entityType && !CC.Activity.SUPPORTED_ENTITY_TYPES.include(subFields.entityType)) continue;
			// Push the entity guid on to the stack.
			var entityGUID = item.entityGUID;
			orderedEntityGUIDs.push(entityGUID);
			// Push this activity item into the activity stack for the corresponding entity.
			if (!activityHashByGUID[entityGUID]) activityHashByGUID[entityGUID] = [];
			activityHashByGUID[entityGUID].push(item);
		}
		// Flatten the ordered entity guid array.
		var uniq = orderedEntityGUIDs.uniq();
		// Sort each activity partition by actionTime (newest to oldest).
		for (var idx = 0; idx < uniq.length; idx++) {
			var guid = uniq[idx];
			var activityItems = activityHashByGUID[guid];
			activityHashByGUID[guid] = activityItems.sort(function(a, b) {
				return b.actionTime - a.actionTime;
			});
		}
		// Build the result.
		for (var idx = 0; idx < uniq.length; idx++) {
			var entityGUID = uniq[idx];
			bucketed.push([entityGUID, activityHashByGUID[entityGUID]]);
		}
		return bucketed;
	},
	// Renders an individual array of grouped activity.
	renderGrouping: function(inGrouping) {
		if (!inGrouping || inGrouping.length != 2) return;
		var entityGUID = inGrouping[0], activityItems = inGrouping[1];
		var firstActivity = activityItems[0];
		var isUnread = firstActivity.isUnread, isFavorite = firstActivity.isFavorite, subFields = firstActivity.subFields || {};
		var entityType = subFields.entityType;
		if (!this.mSomethingUnread && isUnread) this.mSomethingUnread = isUnread;
		var remainingActivity = activityItems.splice(1, activityItems.length - 1);
		var iconURI = iconURIForEntityType(subFields.entityType, 32, 32);
		var elem = Builder.node('div', {className: 'cc-activity-item collapsed', 'data-guid': firstActivity.guid}, [
			Builder.node('div', {className: 'cc-activity-item-entity'}, [
				Builder.node('a', {'role': 'checkbox', 'href': '#', 'className': 'cc-entity-unread-toggle' + (isUnread ? ' selected' : ''), 'data-guid': entityGUID, 'title': "_General.Unread.Toggle.Title".loc()}),
				Builder.node('a', {'role': 'checkbox', 'href': '#', 'className': 'cc-entity-favorite-toggle' + (isFavorite ? ' selected' : ''), 'data-guid': entityGUID, 'title': "_General.Favorite.Toggle.Title".loc()}),
				Builder.node('span', {'role': 'presentation', 'className': 'modtime'}, [
					this.__renderActivityItem(firstActivity),
					Builder.node('span', {'role': 'presentation', 'className': 'moreupdates'})
				]),
				Builder.node('span', {'role': 'presentation', 'className': 'cc-entity-icon', 'style': 'background-image: url(%@); background-size: 32px 32px;'.fmt(iconURI)}, [
					Builder.node('img', {'role': 'presentation', 'src': (iconURI || "")})
				]),
				Builder.node('span', {'role': 'link', 'className': 'title ellipsis'}),
				Builder.node('span', {'role': 'link', 'className': 'owner ellipsis'})
			]),
			Builder.node('div', {className: 'cc-activity-item-actions'}, [
				Builder.node('div', {className: 'cc-activity-item-actions-wrapper'}, [
					Builder.node('span', {'className': 'norgie'}),
					Builder.node('div', {className: 'cc-activity-item-actions-inner'})
				])
			])
		]);
		// Render the more activity bucket.
		var otherActivityCount = remainingActivity.length;
		if (isUnread && (remainingActivity && remainingActivity.length > 0)) {
			var fragment = document.createDocumentFragment();
			// 10938920
			// Collapse updates of the same type, by the same user together.
			var coalesced = [], previousCoalescedActivityType, nextActivity;
			for (var idx = 0; idx < remainingActivity.length; idx++) {
				nextActivity = remainingActivity[idx];
				// If we're starting a new coalesce stack, push this activity item onto it.
				if (!coalesced || coalesced.length == 0) {
					coalesced.push(nextActivity);
					continue;
				}
				// If the next activity item is the same activity type as the previously coalesced activity item,
				// by the same user within the coalescing window, push it onto the stack.
				var firstCoalescedActivity = coalesced[0];
				var lastCoalescedActivity = coalesced[coalesced.length - 1];
				if ((CC.Activity.COALESCING_ACTIVITY_TYPES.indexOf(nextActivity.action) == -1) ||
					((lastCoalescedActivity && (lastCoalescedActivity.action == nextActivity.action)) &&
					(lastCoalescedActivity.subFields.userTinyID == nextActivity.subFields.userTinyID) &&
					(!this.mEnableActivityWindowCoalescing || ((Math.abs(firstCoalescedActivity.actionTime - lastCoalescedActivity.actionTime) / 1000) <= this.mActivityCoalescingWindow)))) {
					coalesced.push(nextActivity);
					continue;
				}
				// Otherwise flush the coalesced list.
				fragment.appendChild(this.__renderActivityItem(coalesced[0], coalesced.length));
				otherActivityCount -= (coalesced.length - 1);
				coalesced = [nextActivity];
			}
			// Catch any trailing items.
			if (coalesced && coalesced.length) {
				fragment.appendChild(this.__renderActivityItem(coalesced[0], coalesced.length));
				otherActivityCount -= (coalesced.length - 1);
			}
			elem.down('.cc-activity-item-actions-inner').appendChild(fragment);
			var fold = elem.down('span.moreupdates');
			if (fold) {
				fold.addClassName('hasmore');
				var moreLink = Builder.node('a', {'className': 'count'}, (otherActivityCount > 1 ? "_Activity.More.Count.Plural".loc(otherActivityCount) : "_Activity.More.Count.Singular".loc()));
				var hideLink = Builder.node('a', {'className': 'hide'}, "_Activity.More.Hide".loc());
				Event.observe(moreLink, 'click', this.toggleCollapsed);
				Event.observe(hideLink, 'click', this.toggleCollapsed);
				fold.appendChild(moreLink);
				fold.appendChild(hideLink);
			}
		}
		// Enable unread and favorite toggles.
		elem.select('.cc-entity-unread-toggle').each(function(toggle) {
			new CC.EntityUnreadToggle(toggle);
		});
		elem.select('.cc-entity-favorite-toggle').each(function(toggle) {
			new CC.EntityFavoriteToggle(toggle);
		});
		// Notify after animation.
		var actionElements = elem.select('.cc-activity-item-actions');
		var boundToggledCollapsed = this.didToggleCollapsed.bind(this);
		for (var idx = 0; idx < actionElements.length; idx++) {
			Event.observe(actionElements[idx], 'webkitTransitionEnd', boundToggledCollapsed);
		}
		// Localize title in owner and last modified author.
		var entityTitle = (subFields.entityLongName || subFields.entityShortName).escapeHTML();
		var entityID = subFields.entityTinyID;
		if (subFields.entityType == "com.apple.entity.User") entityID = subFields.entityShortName;
		var entityLink = "<a href='%@'>%@</a>".fmt(CC.entityURLForTypeAndTinyID(subFields.entityType, entityID, entityTitle), entityTitle);
		elem.down('.title').innerHTML = entityLink;
		var ownerTitle = (subFields.ownerLongName || subFields.ownerShortName).escapeHTML();
		var ownerID = subFields.ownerTinyID;
		if (subFields.ownerType == "com.apple.entity.User") ownerID = subFields.ownerShortName;
		var ownerLink = "<a href='%@'>%@</a>".fmt(CC.entityURLForTypeAndTinyID(subFields.ownerType, ownerID, ownerTitle), ownerTitle);
		elem.down('.owner').innerHTML = ownerLink;
		return elem;
	},
	// Renders an individual activity item. Localizes the activity type and activity data into
	// a friendly activity string with a link to the triggering user. Supports rendering an activity
	// item as a coalesced activity item (where a single activity item represents a collapsed set of
	// sequential similar activity).
	__renderActivityItem: function(inActivityItem, inCoalescedCount) {
		if (!inActivityItem) return undefined;
		if (!inCoalescedCount) inCoalescedCount = 0;
		var elem = Builder.node('span', {'role': 'presentation', className: 'cc-activity-item-action ellipsis', 'data-guid': inActivityItem.guid, 'data-action': inActivityItem.action});
		// Build a localized activity string (including the user link and timestamp).
		var userDisplayName = (inActivityItem.subFields.userLongName || inActivityItem.subFields.userShortName);
		var userURL = CC.entityURLForTypeAndTinyID(inActivityItem.subFields.userType, inActivityItem.subFields.userShortName, userDisplayName);
		var userLink = "<a tabindex='-1' class='user ellipsis' href='%@'>%@</a>".fmt(CC.entityURLForTypeAndTinyID(inActivityItem.subFields.userType, inActivityItem.subFields.userShortName.escapeHTML(), userDisplayName.escapeHTML()), userDisplayName.escapeHTML());
		var localizedTimestamp = globalLocalizationManager().localizedDateTime(inActivityItem.actionTime);
		var localizedString, activityData = inActivityItem.data || {};
		switch (inActivityItem.action) {
			case "com.apple.activity.TagAdded":
				if (inCoalescedCount > 1) {
					localizedString = "_Activity.Action.Coalesced.TagAdded".loc(userLink, inCoalescedCount, localizedTimestamp);
				} else {
					localizedString = "_Activity.Action.TagAdded".loc(userLink, activityData.tag.escapeHTML(), localizedTimestamp);
				}
				break;
			case "com.apple.activity.TagRemoved":
				if (inCoalescedCount > 1) {
					localizedString = "_Activity.Action.Coalesced.TagRemoved".loc(userLink, inCoalescedCount, localizedTimestamp);
				} else {
					localizedString = "_Activity.Action.TagRemoved".loc(userLink, activityData.tag.escapeHTML(), localizedTimestamp);
				}
				break;
			case "com.apple.activity.EntityUpdated":
				if (inCoalescedCount > 1) {
					localizedString = "_Activity.Action.Coalesced.EntityUpdated".loc(userLink, inCoalescedCount, localizedTimestamp);
				} else {
					localizedString = "_Activity.Action.EntityUpdated".loc(userLink, localizedTimestamp);
				}
				break;
			case "com.apple.activity.EntityRenamed":
				localizedString =  "_Activity.Action.EntityRenamed".loc(userLink, activityData.oldLongName.escapeHTML(), activityData.newLongName.escapeHTML(), localizedTimestamp);
				break;
			case "com.apple.activity.EntityMoved":
				localizedString = "_Activity.Action.EntityMoved".loc(userLink, (inActivityItem.subFields.ownerLongName || inActivityItem.subFields.ownerShortName).escapeHTML(), localizedTimestamp);
				break;
			case "com.apple.activity.CommentAdded":
			case "com.apple.activity.CommentRemoved":
			case "com.apple.activity.CommentApproved":
				var locString = "_Activity.Action." + ((inCoalescedCount > 1) ? "Coalesced." : "") + inActivityItem.action.split('.').last();
				if (inCoalescedCount > 1) {
					localizedString = locString.loc(userLink, inCoalescedCount, localizedTimestamp);
				} else {
					localizedString = locString.loc(userLink, activityData['body'].escapeHTML(), localizedTimestamp);
				}
				break;
			case "com.apple.activity.EntityCreated":
			case "com.apple.activity.EntityRemoved":
			case "com.apple.activity.RelationshipAdded":
			case "com.apple.activity.RelationshipRemoved":
			case "com.apple.activity.BlogEnabled":
			case "com.apple.activity.BlogDisabled":
			case "com.apple.activity.CalendarEnabled":
			case "com.apple.activity.CalendarDisabled":
				var locString = "_Activity.Action." + inActivityItem.action.split('.').last();
				localizedString = locString.loc(userLink, localizedTimestamp);
		}
		elem.innerHTML = localizedString;
		return elem;
	},
	prepareResultsForRendering: function(inResults) {
		return this.groupActivity(inResults);
	},
	renderResults: function($super, inResults, inOptAppendAtTop) {
		$super(inResults, inOptAppendAtTop);
		// Hide or show the mark all as read button.
		if (this.mSomethingUnread) {
			$('cc-mark-all-read-button').show();
		} else {
			$('cc-mark-all-read-button').hide();
		}
		// Enable any routes we need to.
		globalNotificationCenter().publish(CC.Routes.NOTIFICATION_ROUTES_SHOULD_UPDATE);
		globalNotificationCenter().publish(CC.DID_UPDATE_PAGINATING_LIST_VIEW, this);
	},
	renderResultItem: function(inResultItem) {
		return this.renderGrouping(inResultItem)
	},
	defaultPaginationCallback: function($super, inResults, inStartIndex, inTotal, inPaginationGUID) {
		$super(inResults, inStartIndex, inTotal, inPaginationGUID);
		// Is the list empty? We check here because our bucketing/grouping algorithms might
		// have filtered everything out even though we got results from the server.
		if (this.$().select('.cc-activity-item').length == 0) this.setIsEmpty(true);
	},
	toggleCollapsed: function(inEvent) {
		var activityItem = Event.findElement(inEvent, '.cc-activity-item');
		if (activityItem) {
			if (activityItem.hasClassName('collapsed')) {
				var actionsElement = activityItem.down('.cc-activity-item-actions');
				var actionsWrapper = actionsElement.down('.cc-activity-item-actions-wrapper');
				actionsElement.style.height = actionsWrapper.clientHeight + 'px';
				activityItem.removeClassName('collapsed');
			}
			else {
				var actionsElement = activityItem.down('.cc-activity-item-actions');
				actionsElement.style.height = '0px';
				activityItem.addClassName('collapsed');
			}
		}
		this.didToggleCollapsed();
	},
	didToggleCollapsed: function() {
		globalNotificationCenter().publish(CC.DID_UPDATE_PAGINATING_LIST_VIEW, this);
	},
	handleMarkAllReadButtonClicked: function() {
		if (!$('mark_all_read_dialog')) {
			dialogManager().drawDialog('mark_all_read_dialog', [
				"_MarkAllAsRead.Description".loc()
			], "_Dialogs.OK".loc(), false, "_MarkAllAsRead.Title".loc(), "_Dialogs.Cancel".loc());
		}
		dialogManager().show('mark_all_read_dialog', null, this.onMarkAllConfirm.bind(this));
	},
	onMarkAllConfirm: function() {
		var callback = function(result) {
			$('cc-mark-all-read-button').hide();
			$$('.cc-entity-unread-toggle').invoke('removeClassName', 'selected');
		};
		var errback = function() {
		
		};
		server_proxy().markAllAsRead(callback, errback);
	}
});
