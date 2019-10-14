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

//= require "./paginating_sidebar_section.js"

CC.RelatedSidebarSection = Class.create(CC.PaginatingSidebarSection, {
	mClassName: 'related',
	mDisplayTitle: "_Sidebars.Related.Title".loc(),
	mSidebarSectionGUID: 'sidebars/related',
	mEmptyPlaceholderString: "_Sidebars.Related.Empty.Placeholder".loc(),
	mRelatedSearchDialog: null,
	mDocumentGUID: null,
	mRecentItemsCount: 10,
	initialize: function($super) {
		$super();
		var userCanWrite = (CC.meta('x-apple-user-can-write') == "true");
		// Hide chrome only users with write access should see.
		if (userCanWrite) {
			this.renderPopupMenu();
		} else {
			this.element.down('.cc-sidebar-actions').hide();
		}
		// Render the link search dialog, excluding this document from the results.
		this.mDocumentGUID = CC.meta('x-apple-entity-guid');
		this.mRelatedSearchDialog = new LinkSearchDialog({
			mDialogTitle: "_Sidebars.Related.Search.Dialog.Title",
			mSearchFieldPlaceholder: "_Sidebars.Related.Search.Dialog.Placeholder",
			mDialogDescription: "_Sidebars.Related.Search.Dialog.Description",
			mExcludedGUIDs: this.computeGUIDsToExclude()
		});
		if (userCanWrite) {
			this.registerEventHandlers();
		}
	},
	getPaginationIDs: function() {
		return CC.metaAsArray('x-apple-entity-relationship-guids');
	},
	render: function($super) {
		var elem = $super();		
		var tagItemRelated = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_RELATED);
		var relatedElement = Builder.node('div', {className: 'cc-related-items'}, [
			Builder.node('div', {className: 'cc-sidebar-actions'}, [
				Builder.node('a', {'tabindex': ++tagItemRelated, 'role': 'button', className: 'button add'}, "add related item")
			]),
			Builder.node('div', {className: 'cc-related-items-list'}, [
				Builder.node('ul', {className: 'items'})
			])
		]);
		elem.down('.content').appendChild(relatedElement);
		return elem;
	},
	paginateForIDs: function(inPaginationIDs) {
		var boundCallback = this.didPaginateForIDs.bind(this);
		return server_proxy().relationshipsForGUIDs(inPaginationIDs, boundCallback, boundCallback);
	},
	didPaginateForIDs: function($super, inPaginationResults, inOptRenderAtTop) {
		var relations = inPaginationResults;
		if (!relations) {
			$super();
			return;
		}
		// First get the GUID of the currently displayed entity. com.apple.Relationship objects are specified in terms
		// of a sourceEntityGUID and targetEntityGUID (where source and target can switch depending on which side the
		// relationship was originally specified on).
		var entityGUID = CC.meta('x-apple-entity-guid');
		
		var entityGUIDsForOtherSideOfRelationships = [];
		for (var idx = 0; idx < relations.length; idx++) {
			var relation = relations[idx];
			if (!relation) continue;
			var sourceEntityGUID = relation.sourceEntityGUID;
			var targetEntityGUID = relation.targetEntityGUID;
			// If the targetEntityGUID is the GUID of the currently displayed entity, prefer the source.
			if (targetEntityGUID == entityGUID) {
				entityGUIDsForOtherSideOfRelationships.push(sourceEntityGUID);
			} else {
				entityGUIDsForOtherSideOfRelationships.push(targetEntityGUID);
			}
		}
		var relationshipGUIDs = relations.collect(function(relation) {
			return relation.guid;
		});
		var options = {
			'subpropertyPaths' : {
				'ownerGUID.type': 'owner.type',
				'ownerGUID.guid': 'owner.guid',
				'ownerGUID.longName': 'owner.longName',
				'ownerGUID.shortName': 'owner.shortName'
			}
		};
		server_proxy().entitiesForGUIDsWithOptions(entityGUIDsForOtherSideOfRelationships, options, function(relatedItems) {
			this.element.removeClassName('loading');
			var fragment = document.createDocumentFragment();
			var relatedItem, renderedItem;
			for (var idx = 0; idx < relatedItems.length; idx++) {
				relatedItem = relatedItems[idx];
				// Stash away the relationship GUID for later.
				relatedItem.relationshipGUID = relationshipGUIDs[idx];
				renderedItem = this.renderRelatedItemForResult(relatedItem);
				if (renderedItem) fragment.appendChild(renderedItem);
			}
			var itemsElement = this.element.down('ul.items');
			if (inOptRenderAtTop) {
				itemsElement.insertBefore(fragment, itemsElement.firstChild);
			} else {
				itemsElement.appendChild(fragment);
			}
			$super();
		}.bind(this), function() {
			notifier().printErrorMessage("_Sidebars.Related.Notification.Loading.Failed".loc());
		});
	},
	renderRelatedItemForResult: function(inItem) {
		var relationshipGUID = inItem.relationshipGUID;
		var hasOwner = (inItem && inItem.owner);
		var location = (hasOwner ? localizedContainerString((inItem.owner.longName || inItem.owner.shortName), inItem.owner.type) : false)
		if (inItem && inItem.type != "com.apple.EntityPlaceholder") {
			var li = Builder.node('li', {className: 'cc-related-item' + (location ? '' : ' no-location'), 'name': relationshipGUID, 'for': inItem.guid}, [
				Builder.node('a', {className: 'button delete'}, "_Sidebars.Related.Remove".loc()),
				Builder.node('a', {className: 'item', href: CC.entityURL(inItem, true)}, [
					Builder.node('span', {className: 'icon'}),
					Builder.node('span', {className: 'title'}, (inItem.longName || inItem.shortName)),
					Builder.node('span', {className: 'location'}, (location ? location : ""))
				])
			]);
			var userCanWrite = (CC.meta('x-apple-user-can-write') == "true");
			var deleteButton = li.down('a.delete');
			if (!userCanWrite) {
				deleteButton.hide();
			} else {
				// Deliberately avoid binding handleDeleteRelatedEntityClicked since it is already bound as an event listener.
				Element.observe(deleteButton, 'click', this.handleDeleteRelatedEntityClicked);
			}
			return li;
		}
	},
	isEmpty: function() {
		return (this.element.down('.cc-related-item') == undefined);
	},
	// Renders and appends an empty recents popup menu to the sidebar. Initializes
	// in a loading state, so a loading spinner appears as soon as it is shown and
	// before we've fetched any recents.
	renderPopupMenu: function() {
		var tagItemRelatedSearch = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_RELATED_SEARCH);
		var tagItemRelatedRecent = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_RELATED_RECENT);				
		this.mPopupMenu = Builder.node('div', {className: 'cc-related-popup-menu loading', style: 'display: none;'}, [
			Builder.node('div', {className: 'handle'}, [
				Builder.node('span', {className: 'button add'})
			]),
			Builder.node('div', {className: 'body'}, [
				Builder.node('div', {className: 'top-cap'}),
				Builder.node('div', {'role': 'navigation', 'aria-label': "_Accessibility.Navigation.Search".loc(), className: 'top'}, [
					Builder.node('a', {'tabidex': tagItemRelatedSearch, 'role':'link', 'id': 'relatedSearch', className: 'search', title: "_Sidebars.Related.Menu.Search.Tooltip".loc()}, "_Sidebars.Related.Menu.Search.Title".loc()),
				]),
				Builder.node('div', {'role': 'navigation', 'aria-label': "_Accessibility.Navigation.RecentDocuments".loc(), className: 'bottom'}, [
					Builder.node('h2', "_Sidebars.Related.Menu.Recents.Title".loc()),
					Builder.node('h2', {'aria-label': "_Sidebars.Related.Menu.No.Recents.Placeholder".loc(), 'tabindex': tagItemRelatedRecent, className: 'placeholder'}, "_Sidebars.Related.Menu.No.Recents.Placeholder".loc()),
					Builder.node('ul', {'role': 'list', 'tabindex': tagItemRelatedRecent, className: 'recents'})
				]),
				Builder.node('div', {className: 'bottom-cap'}),
			])
		]);
		document.body.appendChild(this.mPopupMenu);
		
	},
	registerEventHandlers: function() {
		bindEventListeners(this, [
			'handleWindowMouseDown',
			'handleAddButtonClicked',
			'handleSearchMenuItemClicked',
			'handleSearchDialogOK',
			'handleRecentItemClicked',
			'handleDeleteRelatedEntityClicked'
		]);
		Event.observe(window, 'mousedown', this.handleWindowMouseDown);
		Event.observe(this.element.down('.button.add'), 'click', this.handleAddButtonClicked);
		Event.observe(this.mPopupMenu.down('a.search'), 'click', this.handleSearchMenuItemClicked);
	},
	// Populates the recent items list in the related popup menu. Uses the related
	// items service to request a JSON payload of recent items, and manually builds
	// out the list with the response. If the response is undefined, or there are no
	// recent items, displays an empty placeholder.
	populateRecentItems: function() {
		var recentsContainer = this.mPopupMenu.down('ul.recents').update();
		this.mPopupMenu.removeClassName('empty').addClassName('loading');
		var callback = function(recents) {
			this.mPopupMenu.removeClassName('loading');
			if (!recents || recents.length == 0) {
				this.mPopupMenu.addClassName('empty');
				return;
			}
			// Don't relate documents to themselves.
			var recent, excludedGUIDs = this.computeGUIDsToExclude();
			for (var recentIdx = (recents.length - 1); recentIdx >= 0; recentIdx--) {
				recent = recents[recentIdx];
				if (recent && recent.guid && excludedGUIDs.include(recent.guid)) recents[recentIdx] = undefined;
			}
			recents = recents.without(undefined);
			if (recents.length == 0) return this.mPopupMenu.addClassName('empty');
			// Build the related items list.
			var recentItemElement;
			recents.each(function(recent) {
				if (recent && recent.guid) {
					var tagItemRelatedRecentItems = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_RELATED_RECENT);
					recentItemElement = Builder.node('li', [
						Builder.node('a', {'tabindex': ++tagItemRelatedRecentItems, 'role': 'menuitem', name: recent.guid, title: (recent.longName || recent.shortName)}, (recent.longName || recent.shortName))
					]);
					Event.observe(recentItemElement, 'click', this.handleRecentItemClicked);
					recentsContainer.appendChild(recentItemElement);
				}
			}, this);
		}.bind(this);
		server_proxy().recentDocumentsWithOptions(this.mRecentItemsCount, {}, callback, callback);
	},
	// Shows the related sidebar popup menu.
	showPopupMenu: function() {
		if (this.mRecentItemsTimer) clearTimeout(this.mRecentItemsTimer);
		this.mPopupMenu.removeClassName('empty').addClassName('loading');
		this.mRecentItemsTimer = setTimeout(this.populateRecentItems.bind(this), 500);
		// Position the popup over the sidebar.
		this.mPopupMenu.show();
		var addButton = this.element.down('.button.add');
		var addButtonPosition = addButton.viewportOffset();
		this.mPopupMenu.setStyle({
			'left': (addButtonPosition.left - 249 + 34) + 'px',
			'top': addButtonPosition.top + 24 + 'px'
		});
		this.mNowShowing = true;
		this.becomeFirstResponder();
		
		// Do not modify the accessibility tab index for the progress message dialog.
		accessibility().makeRootViewsAriaHidden(false);
		
		if ($('relatedSearch')) $('relatedSearch').focus();
	},
	// Hides the related sidebar popup menu.
	hidePopupMenu: function() {
		this.mPopupMenu.hide();
		this.mNowShowing = false;
		this.loseFirstResponder();
		
		// Do not modify the accessibility tab index for the progress message dialog.
		accessibility().makeRootViewsAriaVisible(false);
	},
	// Relates an entity using the related items service and renders the returned
	// partial in the sidebar before displaying a notification.
	relateEntity: function(inRelatedEntityGUID) {
		if (!this.mDocumentGUID) return;
		var callback = function(response) {
			dialogManager().hideProgressMessage();
			if (!response || !response.succeeded) {
				notifier().printErrorMessage("_Sidebars.Related.Notification.Relate.Failed".loc());
				return false;
			}
			var newRelationshipGUID = response.response;
			var innerCallback = function(relations) {
				this.didPaginateForIDs(relations, true);
			}.bind(this);
			return server_proxy().relationshipsForGUIDs([newRelationshipGUID], innerCallback, innerCallback); 
		}.bind(this);
		dialogManager().showProgressMessage('_Sidebars.Related.Status.RelatingDocument'.loc());
		server_proxy().relateEntities(this.mDocumentGUID, inRelatedEntityGUID, callback, callback);
	},
	// Deletes an existing relationship. Displays an error notification if the remove
	// operation failed, otherwise returns silently.
	deleteRelationship: function(inRelationshipGUID) {
		if (!this.mDocumentGUID) return;
		var callback = function(service_response) {
			if (!service_response || (service_response && !service_response.succeeded)) {
				notifier().printErrorMessage("_Sidebars.Related.Notification.Unrelate.Failed".loc());
			} else {
				globalNotificationCenter().publish(CC.PaginatingSidebar.NOTIFICATION_PAGINATING_SIDEBAR_CONTENT_DID_CHANGE, this);
			}
		}.bind(this);
		server_proxy().deleteRelationship(inRelationshipGUID, callback, callback);
	},
	// Handles focus away from the related items sidebar, hiding the sidebar popup.
	handleWindowMouseDown: function(inEvent) {
		if (this.mNowShowing) {
			if (!Position.within(this.mPopupMenu, inEvent.pointerX(), inEvent.pointerY())) this.hidePopupMenu();
			else Event.stop(inEvent);
		}
	},
	handleAddButtonClicked: function(inEvent) {
		this.showPopupMenu();
	},
	handleDeleteRelatedEntityClicked: function(inEvent) {
		var relatedItem = inEvent.findElement('li');
		// Show a puff of smoke before removing the list element immediately.
		smokey().showOverElement(relatedItem);
		var relationshipGUID = relatedItem.getAttribute('name');
		var stashedElement = Element.remove(relatedItem);
		// Do we need to show the empty placeholder string?
		if (this.element.select('.cc-related-item').length == 0) this.element.down('.cc-related-items-list').addClassName('empty');
		// Actually remove the relationship.
		this.deleteRelationship(relationshipGUID)
	},
	handleSearchMenuItemClicked: function(inEvent) {
		var anchor = inEvent.findElement('#related_sidebar');
		this.hidePopupMenu();
		this.mRelatedSearchDialog.mExcludedGUIDs = this.computeGUIDsToExclude();
		this.mRelatedSearchDialog.show(anchor, null, this.handleSearchDialogOK);
	},
	handleSearchDialogOK: function() {
		var suggested = $('link_search_dialog').down('.suggested');
		if (!suggested) return;
		var entityGUID = suggested.getAttribute('id').match(/link_search_dialog_results_(.+)/)[1];
		this.relateEntity(entityGUID);
	},
	handleRecentItemClicked: function(inEvent) {
		var entityGUID = inEvent.findElement('a').getAttribute('name');
		this.hidePopupMenu();
		this.relateEntity(entityGUID);
	},
	handleKeyboardNotification: function(inMessage, inObject, inOptExtras) {
		switch (inMessage) {
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_TAB:
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_ESC:
				this.hidePopupMenu();
				break;
		}
		return true;
	},
	// Computes an array of guids to exclude from the related items popup/search dialog.
	// We don't want to present already related items again.
	computeGUIDsToExclude: function() {
		var related = this.element.select('.cc-related-items-list .cc-related-item').invoke('getAttribute', 'for');
		if (this.mDocumentGUID) related.push(this.mDocumentGUID);
		return related;
	}
});
