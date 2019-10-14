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
//= require "./service.js"
//= require "../keyboard.js"

CC.Revisions.NOTIFICATION_REVISIONS_READY = 'DID_SHOW_REVISIONS';
CC.Revisions.NOTIFICATION_DID_SHOW_REVISIONS = 'DID_SHOW_REVISIONS';
CC.Revisions.NOTIFICATION_DID_HIDE_REVISIONS = 'DID_HIDE_REVISIONS';
CC.Revisions.NOTIFICATION_DID_SHOW_REVISION = 'DID_SHOW_REVISION';
CC.Revisions.NOTIFICATION_DID_SHOW_REVISION_DIFF = 'DID_SHOW_REVISION_DIFF';
CC.Revisions.NOTIFICATION_DID_SHOW_PREVIOUS_REVISION = 'DID_SHOW_PREVIOUS_REVISION';
CC.Revisions.NOTIFICATION_DID_SHOW_NEXT_REVISION = 'DID_SHOW_NEXT_REVISION';
CC.Revisions.NOTIFICATION_DID_RESTORE_PREVIOUS_REVISION = 'DID_RESTORE_PREVIOUS_REVISION';

// Simple history view implementation.

CC.Revisions.HistoryViewer = Class.create(CC.Keyboard.Mixins.Responder, {
	mRequestDelay: 250,
	mService: null,
	mBrowsingRevisions: false,
	mNowShowingRevisionIndex: 0,
	initialize: function(/* [options] */) {
		if (arguments.length && arguments[0]) Object.extend(this, arguments[0]);
		this._render();
		globalNotificationCenter().subscribe(CC.Revisions.NOTIFICATION_DID_SHOW_REVISIONS, this.updateButtonsForSelection.bind(this));
		globalNotificationCenter().subscribe(CC.Revisions.NOTIFICATION_DID_SHOW_PREVIOUS_REVISION, this.updateButtonsForSelection.bind(this));
		globalNotificationCenter().subscribe(CC.Revisions.NOTIFICATION_DID_SHOW_NEXT_REVISION, this.updateButtonsForSelection.bind(this));
		globalNotificationCenter().subscribe(CC.WikiEditor.NOTIFICATION_DID_SAVE_PAGE, this.handlePageDidSave.bind(this));
		globalNotificationCenter().subscribe(CC.WikiEditor.NOTIFICATION_DID_START_EDITING, this.hideRevisions.bind(this));
		globalNotificationCenter().subscribe(CC.UpdatesSidebar.NOTIFICATION_DID_CLOSE_UPDATES_SIDEBAR, this.hideRevisions.bind(this));
	},
	_render: function() {
		var rootElement = this.mRootSidebarElement;
		var tabIndexHistoryActionClose = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_ACTION_CLOSE);
		var tabIndexHistoryActionRestore = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_ACTION_RESTORE);
		var tabIndexHistoryActionShowchanges = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_ACTION_SHOWCHANGES);
		var tabIndexHistoryHideChanges = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_ACTION_HIDECHANGES);
				
		this.mRevisionsListingElement = Builder.node('div', {className: 'revisions listing'});		
		Element.insert(rootElement, {'top': this.mRevisionsListingElement});
		
		var canRestore = (CC.meta('x-apple-user-can-delete') == "false");
		if (canRestore) {
			this.mRevisionsDetailElement = Builder.node('div', {className: 'revisions detail browsing'}, [
				Builder.node('div', {'role': 'navigation', 'aria-label': "_Accessibility.MenuBar.HistoryControls".loc(), className: 'controls'}, [
					Builder.node('a', {'tabindex': tabIndexHistoryActionClose, 'role': 'button', className: 'button close'}, "_Revisions.Controls.Cancel.Label".loc()),				
					Builder.node('a', {'tabindex': tabIndexHistoryActionShowchanges, 'role': 'button', className: 'button showchanges'}, "_Revisions.Controls.ShowChanges.Label".loc()),
					Builder.node('a', {'tabindex': tabIndexHistoryHideChanges, 'role': 'button', className: 'button hidechanges'}, "_Revisions.Controls.HideChanges.Label".loc())
				]),
				Builder.node('div', {className: 'previews'})
			]);			
			bindEventListeners(this, [
				'hideRevisions',
				'handleShowChangesButtonClicked',
				'handleHideChangesButtonClicked',
				'handleRevisionItemClicked'
			]);
			Event.observe(this.mRevisionsDetailElement.down('.button.close'), 'click', this.hideRevisions);
			Event.observe(this.mRevisionsDetailElement.down('.button.showchanges'), 'click', this.handleShowChangesButtonClicked);
			Event.observe(this.mRevisionsDetailElement.down('.button.hidechanges'), 'click', this.handleHideChangesButtonClicked);			
		} else {
			this.mRevisionsDetailElement = Builder.node('div', {className: 'revisions detail browsing'}, [
				Builder.node('div', {'role': 'navigation', 'aria-label': "_Accessibility.MenuBar.HistoryControls".loc(), className: 'controls'}, [
					Builder.node('a', {'tabindex': tabIndexHistoryActionClose, 'role': 'button', className: 'button close'}, "_Revisions.Controls.Cancel.Label".loc()),
					Builder.node('a', {'tabindex': tabIndexHistoryActionRestore, 'role': 'button', className: 'button restore'}, "_Revisions.Controls.Restore.Label".loc()),				
					Builder.node('a', {'tabindex': tabIndexHistoryActionShowchanges, 'role': 'button', className: 'button showchanges'}, "_Revisions.Controls.ShowChanges.Label".loc()),
					Builder.node('a', {'tabindex': tabIndexHistoryHideChanges, 'role': 'button', className: 'button hidechanges'}, "_Revisions.Controls.HideChanges.Label".loc())
				]),
				Builder.node('div', {className: 'previews'})
			]);			
			bindEventListeners(this, [
				'hideRevisions',
				'handleRestoreButtonClicked',
				'handleShowChangesButtonClicked',
				'handleHideChangesButtonClicked',
				'handleRevisionItemClicked'
			]);
			Event.observe(this.mRevisionsDetailElement.down('.button.close'), 'click', this.hideRevisions);
			Event.observe(this.mRevisionsDetailElement.down('.button.restore'), 'click', this.handleRestoreButtonClicked);
			Event.observe(this.mRevisionsDetailElement.down('.button.showchanges'), 'click', this.handleShowChangesButtonClicked);
			Event.observe(this.mRevisionsDetailElement.down('.button.hidechanges'), 'click', this.handleHideChangesButtonClicked);
		}

		$('content-primary').appendChild(this.mRevisionsDetailElement);
	},
	initializeRevisions: function() {
		var revisionsContainer = this.mRevisionsListingElement;
		var revisions = revisionsContainer.select('.revision');
		// Show an empty placeholder if needs be, and register any event handlers.
		if (revisions.length == 0) {
			this.mRootSidebarElement.down('.placeholder').show();
		} else {
			this.mRootSidebarElement.down('.placeholder').hide();
			revisions.each(function(item) {
				Event.observe(item, 'click', this.handleRevisionItemClicked);
			}, this);
		}
		globalNotificationCenter().publish(CC.Revisions.NOTIFICATION_REVISIONS_READY);
	},
	// Handles a page save notification.
	handlePageDidSave: function(inMessage, inObject, inOptExtras) {
		if (inObject) {
			var pageGUID = CC.meta('x-apple-entity-guid');
			var revision = inObject.getRecordPropertyForPath('revision');
			var tabIndexHistoryItem = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY);
			var callback = function(response) {
				CC.setMeta('x-apple-entity-revision', response.revision);
				var newElem = Builder.node('div', {}, [Builder.node('div', {'tabindex': tabIndexHistoryItem, 'role': 'menuitem', className:'revision', name:"revision-"+response.revision, 'data-revision':response.revision, 'data-update-time':response.updateTime}, [
					Builder.node('span', {className:'author'}, response.updatedByUserLongName),
					Builder.node('span', {className:'time'}, globalLocalizationManager().shortLocalizedDateTime(response.updateTime))
				])]);				
				this.mRevisionsListingElement.innerHTML = (newElem.innerHTML + this.mRevisionsListingElement.innerHTML);
				this.initializeRevisions();
			}.bind(this);
			this.mRevisionsService.getRevisionsSummaryForEntityWithGUID(pageGUID, revision, callback);
		}
	},
	// Restores an entity with a given entity guid to a particular revision.
	restoreEntityWithGUIDToRevision: function(inEntityGUID, inRevision, inOptCallback) {
		this.mRevisionsService.restoreEntityWithGUIDToRevision(inEntityGUID, inRevision, inOptCallback);
	},
	showRevisions: function() {
		if (this.mBrowsingRevisions) return;
		document.body.addClassName('revisions');
		this.mBrowsingRevisions = true;
		this.becomeFirstResponder();
		globalNotificationCenter().publish(CC.Revisions.NOTIFICATION_DID_SHOW_REVISIONS);
	},
	hideRevisions: function() {
		if (!this.mBrowsingRevisions) return;
		document.body.removeClassName('revisions');
		$$('.revision.selected').invoke('removeClassName', 'selected');
		this.mBrowsingRevisions = false;
		this.loseFirstResponder();
		globalNotificationCenter().publish(CC.Revisions.NOTIFICATION_DID_HIDE_REVISIONS);
	},
	prepareAndShowRevisionAtIndex: function(inRevisionIndex) {
		var revision = this.mRevisionsListingElement.select('.revision')[inRevisionIndex];
		this.prepareAndShowRevision(revision.getAttribute('name').match(/revision-([0-9]+)/)[1]);
	},
	// Prepares and shows a particular revision in the timeline. If no revision index is
	// specified, defaults to showing the first revision. The revision index is the index
	// of the revision in the stack, not the revision identifier (since they may not be
	// sequential).
	prepareAndShowRevision: function(inOptRevision) {
		var revision = (inOptRevision || 0);
		// Update the currently selected revision in the revisions listing.
		var items = this.mRevisionsListingElement.select('.revision');
		items.invoke('removeClassName', 'selected');
		if (revision < 0) revision = 0;
		var item = this.mRevisionsListingElement.down('.revision[name="revision-%@"]'.fmt(revision));
		if (!item) return;
		item.addClassName('selected');
		item.removeClassName('unread');
		// Update the unread count.
		var unreadCount = this.mRevisionsListingElement.select('.unread').length;
		var unreadElement = this.mRevisionsListingElement.up('.cc-sidebar-section').down('h3 .unread');
		if (unreadElement) {
			unreadElement.innerHTML = (unreadCount > 0 ? "_Sidebars.Title.Unread.Count".loc(unreadCount) : "");
		}
		// Show the corresponding preview for this revision, loading the preview on-demand
		// if we don't already have it.
		dialogManager().showProgressMessage("_Revisions.Progress.Loading.Revision".loc());
		var preview = this.mRevisionsDetailElement.down('.revision[name="revision-%@"]'.fmt(revision));
		if (!preview) {
			preview = Builder.node('div', {className: 'revision', name: "revision-%@".fmt(revision)});
			Element.insert(this.mRevisionsDetailElement.down('.previews'), {'top': preview});
		}
		var previewReadyCallback = function() {
			dialogManager().hide();
			// Hide any currently showing previews.
			this.mRevisionsDetailElement.select('.selected').invoke('removeClassName', 'selected');
			preview.addClassName('selected');
			// Update the now showing index.
			this.mNowShowingRevision = revision;
			// If we're diffing, toggle diff mode.
			if (this.mRevisionsDetailElement.hasClassName('diffing')) this.handleShowChangesButtonClicked();
			// If we're displaying the most recent document revision, hide the restore button.
			var currentRevision = (CC.meta('x-apple-entity-revision') == this.mNowShowingRevision);
			var restoreButton = this.mRevisionsDetailElement.down('.controls .restore');
			if (restoreButton) currentRevision ? restoreButton.hide() : restoreButton.show();
			// Publish a notification.
			globalNotificationCenter().publish(CC.Revisions.NOTIFICATION_DID_SHOW_REVISION);
			this.showRevisions();
		}.bind(this);
		// If we have the revision preview already, show it immediately.
		if (preview.down('.current')) return previewReadyCallback();
		// Otherwise fetch and render it before displaying it.
		var entityGUID = CC.meta('x-apple-entity-guid');
		// If the revision is a wiki page, use the rapid-rendered page content as the preview.
		// Otherwise, if the revision looks like a file entity, render an inline file detail.
		// If the revision appears empty, fall back to rendering a placeholder string.
		var gotRevisionCallback = function(inRevision) {
			var revisionTitle = Builder.node('div', {className: 'cc-entity-title'}, [
				Builder.node('h1', inRevision.longName),
			]);
			var revisionPreview = Builder.node('div', {className: 'current'});
			if (inRevision.extendedAttributes && inRevision.extendedAttributes.renderedPage) {
				revisionPreview.innerHTML = inRevision.extendedAttributes.renderedPage;
				// 9311069
				// Some pages got saved with contentEditable attributes or editing class names.
				revisionPreview.select('*[contentEditable="true"]').invoke('removeAttribute', 'contentEditable');
				revisionPreview.select('.editing').invoke('removeClassName', 'editing');
				this.enableAttachmentsForPreviewElement(revisionPreview);
			} else if (inRevision.previewGUIDs || inRevision.iconGUID) {
				var fileDetailView = CC.Files.buildInlineFileDetailView(inRevision, false);
				revisionPreview.appendChild(fileDetailView.mParentElement);
			} else {			
				// Check it is not the first revision then we're in a case where it is a document which does not have
				// any preview available. So we should manually display UI for preview not available.
				if (revision > 1) {	
					// Build the surrounding chrome.
					var iconPath = '';
					var titleViewElement = Builder.node('span', {}, "");
					var elem = Builder.node('div', {className: 'files info loading' + (iconPath ? ' hasicon' : '')}, [
						titleViewElement,
						Builder.node('div', {className: 'detail'}, [
							Builder.node('div', {className: 'missing'}, [
								Builder.node('div', {className: 'icon'}, [
									Builder.node('img', {src: iconPath})
								]),
								Builder.node('h2', "_Files.PreviewMissing".loc())
							]),
							Builder.node('div', {className: 'previews'}),
							Builder.node('div', {className: 'pagination'}, [
								Builder.node('a', {className: 'more'})
							])
						])
					]);
					
					elem.removeClassName('loading');
					elem.addClassName('nopreview');
				
					revisionPreview.appendChild(elem);
				} else {
					revisionPreview.appendChild(Builder.node('h1', {className: 'empty'}, "_Revisions.Placeholder.Empty.Revision".loc()));
				}
			}
			// Show the preview we just rendered.
			preview.appendChild(revisionTitle);
			preview.appendChild(revisionPreview);
			previewReadyCallback();
		}.bind(this);
		this.mRevisionsService.getRevisionForEntityWithGUID(entityGUID, revision, gotRevisionCallback);
	},
	// 9311069
	enableAttachmentsForPreviewElement: function(inElement) {
		var attachments = inElement.select('.block.attachment'), attachmentIdx, attachment;
		for (attachmentIdx = 0; attachmentIdx < attachments.length; attachmentIdx++) {
			attachment = attachments[attachmentIdx];
			attachment.down('.attachment').removeClassName('quicklookable');
			var fileDataGUID = attachment.getAttribute('data-file-guid');
			if (fileDataGUID) {
				var leftContainer = attachment.down('.left-container');
				leftContainer.onclick = function() {
					window.location.href = "/wiki/files/download/%@".fmt(fileDataGUID);
					return true;
				}
			}
		}
	},
	// Updates the buttons for the currently selected preview.
	updateButtonsForSelection: function() {
		// TODO
	},
	older: function() {
		var currentRevision = this.mRevisionsListingElement.down('.revision.selected');
		if (currentRevision) {
			var previousRevision = currentRevision.next('.revision');
			if (previousRevision) {
				this.prepareAndShowRevision(previousRevision.getAttribute('name').match(/revision-([0-9]+)/)[1]);
				globalNotificationCenter().publish(CC.Revisions.NOTIFICATION_DID_SHOW_PREVIOUS_REVISION);
			}
		}
	},
	newer: function() {
		var currentRevision = this.mRevisionsListingElement.down('.revision.selected');
		if (currentRevision) {
			var nextRevision = currentRevision.previous('.revision');
			if (nextRevision) {
				this.prepareAndShowRevision(nextRevision.getAttribute('name').match(/revision-([0-9]+)/)[1]);
				globalNotificationCenter().publish(CC.Revisions.NOTIFICATION_DID_SHOW_NEXT_REVISION);
			}
		}
	},
	handleRestoreButtonClicked: function(inEvent) {
		dialogManager().showProgressMessage("_Revisions.Progress.Restoring.Document".loc());
		var entityGUID = CC.meta('x-apple-entity-guid');
		var revision = this.mRevisionsListingElement.down('.revision.selected');
		if (!revision) return true;
		var revisionAttributes = revision.getDataAttributes();
		var revisionNumber = revisionAttributes['revision'];
		var restoreCallback = function(entity) {
			dialogManager().hide();
			this.hideRevisions();
			if (entity && entity.guid) {
				window.location.reload();
			} else {
				notifier().printErrorMessage("_Revisions.Notification.Restore.Document.Failed".loc())
			}
		}
		this.mRevisionsService.restoreEntityWithGUIDToRevision(entityGUID, revisionNumber, restoreCallback.bind(this));
	},
	handleShowChangesButtonClicked: function(inEvent) {
		// Do we already have the diff for this revision?
		var activeRevision = this.mRevisionsDetailElement.down('.revision[name="revision-%@"]'.fmt(this.mNowShowingRevision));
		if (!activeRevision) return;
		if (activeRevision.down('.diff')) {
			this.mRevisionsDetailElement.removeClassName('browsing').addClassName('diffing');
			return;
		}
		// Otherwise we need to request it.
		dialogManager().showProgressMessage("_Revisions.Progress.Loading.Revision.Changes".loc());
		var currentRevision = this.mRevisionsListingElement.down('.revision.selected');
		var previousRevisionIndex = 0;
		if (currentRevision) {
			// Previous revision is actually the next revision in the history list.
			var previousRevision = currentRevision.next('.revision');
			if (previousRevision) {
				previousRevisionIndex = previousRevision.getAttribute('data-revision');
			} else {
				// May be we are at the last revision before pagination
				var paginationElement = this.mRootSidebarElement.up().down('.cc-sidebar-pagination');
				if (paginationElement && paginationElement.getAttribute('data-pagination-ids').length) {
					previousRevisionIndex = paginationElement.getAttribute('data-pagination-ids').split(',')[0];
				}
			}
		}
		var diffCallback = function(diff) {
			dialogManager().hide();
			this.mRevisionsDetailElement.removeClassName('browsing').addClassName('diffing');
			// If we didn't get a diff, show an error.
			if (diff == undefined) return notifier().printErrorMessage("_Revisions.Notification.Revision.Changes.Failed".loc());
			// Otherwise append a new diff element. If the diff is empty, use the content
			// of the revision instead so we have something to show.
			var diffElement = Builder.node('div', {className: 'diff'});
			diffElement.innerHTML = diff ? diff : activeRevision.down('.current').innerHTML;
			activeRevision.appendChild(diffElement);
			globalNotificationCenter().publish(CC.Revisions.NOTIFICATION_DID_SHOW_REVISION_DIFF);
		};
		var entityGUID = CC.meta('x-apple-entity-guid');
		logger().debug("diffing between current: %s and previous %s", this.mNowShowingRevision, previousRevisionIndex)
		this.mRevisionsService.getDiffForEntityBetweenRevisions(entityGUID, previousRevisionIndex, this.mNowShowingRevision, diffCallback.bind(this));
	},
	handleHideChangesButtonClicked: function(inEvent) {
		this.mRevisionsDetailElement.removeClassName('diffing').addClassName('browsing');
	},
	handleRevisionItemClicked: function(inEvent) {
		var listElement = inEvent.findElement('.revision');
		// If we're toggling an already selected item, exit the history view.
		if (listElement.hasClassName('selected') && this.mBrowsingRevisions) {
			return this.hideRevisions();
		}
		// Otherwise, show just clicked revision.
		var revision = listElement.getAttribute('name').match(/revision-([0-9]+)/)[1];
		this.prepareAndShowRevision(revision);
	},
	handleKeyboardNotification: function(inMessage, inObject, inOptExtras) {
		switch (inMessage) {
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_ESC:
				this.hideRevisions();
				break;
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_UP:
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_RIGHT:
				this.newer();
				break;
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_DOWN:
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_LEFT:
				this.older();
				break;
		}
		return true;
	}
});
