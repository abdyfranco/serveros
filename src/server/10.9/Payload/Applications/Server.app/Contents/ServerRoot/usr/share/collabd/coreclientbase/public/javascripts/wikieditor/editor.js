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

//= require "./base.js"
//= require "./selection.js"
//= require "./models.js"
//= require "./registry.js"
//= require "./plugin.js"
//= require "./service.js"
//= require "./migration.js"
//= require "./copyright.js"
//= require "./links.js"

CC.WikiEditor.EDITOR_VERSION = 1.0;
CC.WikiEditor.MINIMUM_SUPPORTED_EDITOR_VERSION = 1.0;
CC.WikiEditor.LOCAL_STORAGE_INDEX_KEY = 'x-apple-wiki-autosaved-index';
CC.WikiEditor.LOCAL_STORAGE_KEY = 'x-apple-wiki-autosaved';

// Fake a global shared instance (so other shared instances can reference the current editor). If you
// want to set globalEditorController, you should set _globalEditorController instead.

var _globalEditorController;
var globalEditorController = function() {
	if (!_globalEditorController) return invalidate;
	return _globalEditorController;
};

// Editor controller responsible for tracking state of the page and its
// editable content and the editing session.

CC.WikiEditor.EditorController = Class.create(CC.Keyboard.Mixins.Responder, {
	mIdentifer: null,
	mDebugMode: false,
	mEditMode: false,
	mEditorViewClass: 'CC.WikiEditor.EditorView',
	mEditorView: null,
	mParentElement: null,
	mToolbarParentElement: null,
	mPageGUID: null,
	mPreviousPageGUID: null, 
	mPage: null,
	mActiveBlock: null,
	mPreviouslyActiveBlock: null,
	mActiveActionToolbar: null,
	mBlockContextualToolbarCache: new Hash(),
	mStore: new CC.Store.BackingStore(),
	mEditingService: new CC.WikiEditor.EditingService(),
	mDoubleReturnTimeout: 200,
	mDoNotFocusScrollTolerance: 150, // px
	mSelecting: false,
	mSelectingAll: false,
	mSelectedBlocks: null,
	mCopyPasteDelegate: null,
	mSelectAllDelegate: null,
	mAutosaveDrafts: true,
	mAutosaveDelay: 60000, // 60 seconds
	mDebugModeAutosaveDelay: 2000, // 2 seconds
	mAutosaveTimer: null,
	mPageSaveRetryCount: 5,
	initialize: function(/* {options} */) {
		return this._initialize.apply(this, arguments);
	},
	// Initializes the editor controller, instantiating any necessary views and registering
	// any event handlers.
	_initialize: function(/* {options} */) {
		// First set an identifer for this editor.
		this.mIdentifer = (new CC.GuidBuilder()).toString();
		if (arguments && arguments.length > 0) Object.extend(this, arguments[0]);
		if (!this.mParentElement) return false;
		// Otherwise render and register any event handlers.
		if (!this.mEditorView) {
			var konstructor = this.mEditorViewClass;
			this.mEditorView = CC.objectInstanceForPropertyPath(konstructor);
			if (!this.mEditorView) throw("Could not initialize main view for editor");
		}
		this.mParentElement.appendChild(this.mEditorView._render());
		// Reposition the editor toolbar at the document root.
		(this.mToolbarParentElement || document.body).appendChild(Element.remove(this.mEditorView.mToolbarView.$()));
		this.toggleDebugMode(this.mDebugMode || false);
		// Configure the editor toolbar.
		this._configureEditorToolbar();
		this._registerEventHandlers();
		// Configure a copy/paste and select-all delegate.
		this.mCopyPasteDelegate = new CC.WikiEditor.CopyPasteDelegate();
		this.mSelectAllDelegate = new CC.WikiEditor.SelectAllDelegate(this);
		// Send the ready notification before we initialize the page.
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_EDITOR_READY, this);
		// Initialize any content.
		this._initializeInlineContent();
	},
	// Preloads page and block data.
	_initializeInlineContent: function(inOptEntity) {
		// Flush the editor store and any old state.
		this.mStore.purgeStore();
		this.mPage = this.mActiveBlock = this.mPreviouslyActiveBlock = this.mActiveActionToolbar = this.mSelecting = this.mSelectedBlocks = this.mPageSaveRetryCountSoFar = null;
		// Get the page GUID.
		var pageGUID = ((inOptEntity ? inOptEntity.guid : undefined) || this.mPageGUID);
		if (!pageGUID) {
			logger().error("Could not find page GUID to initialize editor. Editor will be temporarily disabled.");
			return false;
		}
		this.mPageGUID = pageGUID;
		var gotPage = function(inPage) {
			this.mEditorView.$().removeClassName('loading');
			// Cache so we can quickly restore later on edit cancel.
			this.mStashedContent = CC.deepClone(inPage);
			// Push the page into the editor store too.
			var pageRecord = inPage;
			pageRecord = this.mStore.pushObject(pageRecord);
			if (!pageRecord) throw("Could not initialize editor for page");
			this.mPage = new CC.WikiEditor.Page({
				'mStore': this.mStore,
				'mRecord': pageRecord
			});
			// Initialize the page title and page views.
			var titleView = this.mEditorView.mTitleView = new CC.EntityTitle.EntityTitleView({'mContent': this.mPage});
			titleView._render();
			var existingTitleView = this.mEditorView.$().down('.cc-entity-title');
			if (existingTitleView) Element.remove(existingTitleView);
			this.mEditorView.$().appendChild(titleView.$());
			var pageView = new CC.WikiEditor.PageView({
				'mContent': this.mPage
			});
			this.mPage.mViewInstance = this.mEditorView.mPageView = pageView;
			pageRecord.mControllerInstance = this.mPage;
			var existingPageView = this.mEditorView.$().down('.page.blocks');
			pageView._render();
			var renderedPageView = pageView.$();
			// Inflated any child blocks for the page first (so we can guarantee ordering).
			var inflatedJSON = this._inflateBlocksForPage(pageRecord);
			// Create any blocks, expanding nested child blocks where needed.
			if (inflatedJSON._childBlocks != undefined) {
				var childBlockIdx, childBlock;
				for (childBlockIdx = 0; childBlockIdx < pageRecord._childBlocks.length; childBlockIdx++) {
					childBlock = pageRecord._childBlocks[childBlockIdx];
					this.bulkAddBlock(childBlock, {'bottom': renderedPageView}, undefined, true, false);
				}
				// 10473966
				// Append the new page view and remove the previous one.
				this.mEditorView.$().appendChild(renderedPageView);
				if (existingPageView) Element.remove(existingPageView);
			}
			// Trigger a page changed notification.
			globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_PAGE_DID_CHANGE, this.mPage);
			globalNotificationCenter().publish(CC.EntityTitle.NOTIFICATION_TITLE_SHOULD_UPDATE, this.mPage);
			// Trigger a routes change now we've rendered the page.
			globalNotificationCenter().publish(CC.Routes.NOTIFICATION_ROUTES_SHOULD_UPDATE, undefined, {'rootElement': this.mEditorView.mPageView.$()});
			// Migrate the page if we need to.
			var needToMigrate = this.mPage.getRecordPropertyForPath('extendedAttributes.migrated');
			if (needToMigrate) this.migratePage();
			// Update pre-seed pages if we need to.
			var version = this.mPage.getRecordPropertyForPath("extendedAttributes.editorVersion");
			if ((version == undefined) || (version < CC.WikiEditor.MINIMUM_SUPPORTED_EDITOR_VERSION)) this._updatePreSeedPageSchema();
			// Do we have unsaved changes?
			if (this.mAutosaveDrafts) this.restoreAutosavedEdits();
			// Should we start in edit mode?
			if (globalCookieManager().getCookie('cc.toggleEditModeOnLoad')) {
				globalCookieManager().destroyCookie('cc.toggleEditModeOnLoad');
				setTimeout(function() {
					this.toggleEditMode(true, true);
				}.bind(this), 500);
			}
			this.becomeFirstResponder();
			globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_PAGE_WAS_INITIALIZED, this);
			return true;
		}.bind(this);
		// Do we have the page already?
		var existingPageEntity = server_proxy().objectFromStoreWithGUID(pageGUID);
		if (existingPageEntity) {
			gotPage(existingPageEntity);
			return true;
		}
		// Otherwise fetch it.
		server_proxy().entityForGUIDWithOptions(pageGUID, {'subpropertyPaths': server_proxy().mDefaultSubpropertyPaths}, gotPage, function() {
			logger().error("Could not fetch page for GUID %@ to initialize editor. Editor will be temporarily disabled.".fmt(pageGUID));
			return false;
		});
		// Trigger a service_client flush so we wait for as little time as possible on a page.
		service_client().flushQueuedServiceRequests();
		this.mEditorView.$().addClassName('loading');
	},
	// Given a page from the server, returns a tree-representation with child blocks positioned under
	// their container block. Ensures parent blocks are added before child blocks on the page, and also
	// allows us to know exactly when every child of a container has been added to that container.
	_inflateBlocksForPage: function(inPage) {
		if (!inPage) return;
		var pageExtendedAttributes = (inPage['extendedAttributes'] || {});
		var pageBlocks = $H(pageExtendedAttributes['_blocks'] || {});
		// Blocks are grouped by blockType for each page. Remove that grouping.
		var _pageBlocks = new Object();
		var _pageBlocksValues = pageBlocks.values(), _pageBlocksValuesIdx, _pageBlocksValue;
		for (_pageBlocksValuesIdx = 0; _pageBlocksValuesIdx < _pageBlocksValues.length; _pageBlocksValuesIdx++) {
			_pageBlocksValue = _pageBlocksValues[_pageBlocksValuesIdx];
			Object.extend(_pageBlocks, _pageBlocksValue);
		}
		var __inflateBlocksForParent = function(parent, recursiveParent) {
			var currentParent = (recursiveParent || parent);
			var parentExtendedAttributes = (currentParent['extendedAttributes'] || {});
			var parentBlockGUIDs = (parentExtendedAttributes['blockGUIDs'] || []), parentBlockGUID, parentInflatedChildren;
			if (!currentParent._childBlocks) currentParent._childBlocks = [];
			for (var parentBlockGUIDIdx = 0; parentBlockGUIDIdx < parentBlockGUIDs.length; parentBlockGUIDIdx++) {
				parentBlockGUID = parentBlockGUIDs[parentBlockGUIDIdx];
				if (_pageBlocks[parentBlockGUID]) {
					parentInflatedChildren = __inflateBlocksForParent(parent, _pageBlocks[parentBlockGUID]);
					currentParent._childBlocks.push(parentInflatedChildren);
				}
			}
			return currentParent;
		}
		var inflated = __inflateBlocksForParent(inPage);
		delete _pageBlocks;
		return inflated;
	},
	// Starts editing. Verifies the current revision of the page before editing offering to reload first.
	// Toggles the current editing state of the editor. Accepts an optional
	// boolean argument as the target editing state for the editor.
	toggleEditMode: function(inOptEditModeEnabled, inOptDoNotCheckForNewerVersion, inOptPageSaveErrorCondition) {
		if (!this.mParentElement) return false;
		// Are we entering or exiting edit mode?
		var editMode = (inOptEditModeEnabled != undefined) ? (inOptEditModeEnabled || false) : !this.mEditMode;
		var root = document.body.up('html') || document.body;
		// If we're already in edit mode, stop editing and leave edit mode.
		if (!editMode) {
			root.removeClassName('editing');
			globalRouteHandler().setRoutePrefireCallback(this.mStashedRoutePrefireCallback);
			this.mEditMode = this.mEditorView.mTitleView.mEditable = false;
			this.stopEditing(true);
			if (this.mAutosaveTimer) {
				clearInterval(this.mAutosaveTimer);
				this.mAutosaveTimer = null;
				this.flushAutosavedChanges(this.mPage.getRecordPropertyForPath('guid'));
			}
			globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_DID_FINISH_EDITING, this.mPage);
			return this.mEditMode;
		}
		// 9246551
		// Edit the page immediately. Unless inOptDoNotCheckForNewerVersion has been passed, also check that
		// the page has not been edited and saved since the editor was a initialized. If the page is deemed
		// to be out-of-date, warn the user and offer to reload the page (automatically toggling edit mode on
		// refresh).
		dialogManager().hide();
		root.addClassName('editing');
		// If we're using routes, register a prefire callback.
		this.mStashedRoutePrefireCallback = globalRouteHandler().mRoutePrefireCallback;
		globalRouteHandler().setRoutePrefireCallback(function() {
			// Disable routes in edit mode.
			if (this.mEditMode) return false;
			// 11469918
			if (browser().isiOS5Plus()) return confirm("_Editor.Unload.Full.Warning".loc());
			return true;
		}.bind(this));
		// Make sure there is always at least one block on the page.
		if (this.mPage.mBlocks.size() == 0) {
			var prediction = this.predictNextBlock();
			this.addBlock(prediction.blockType, {'extendedAttributes': prediction.attributes}, false);
		}
		// Publish a notification.
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_DID_START_EDITING, this.mPage);
		// We're now in edit mode.
		this.mEditMode = this.mEditorView.mTitleView.mEditable = true;
		// Start editing the first block.
		this.startEditing(this.mPage.firstBlock(), {moveToStart: true});
		// Start autosaving.
		if (this.mAutosaveDrafts && browserSupportsLocalStorage()) {
			this.mAutosaveTimer = setTimeout(this.autosavePage.bind(this), (this.mDebugMode ? this.mDebugModeAutosaveDelay : this.mAutosaveDelay));
		}
		// 8533718
		if (browser().isFirefox()) {
			document.execCommand("enableInlineTableEditing", false, false);
			document.execCommand("enableObjectResizing", false, false);
		}
		// Check that the user is logged in in the background (<rdar://problem/14179604>)
		var oldStatus = CC.meta('x-apple-user-can-write');
		server_proxy().refreshMetaTags(function() {
			if (CC.meta('x-apple-user-can-write') !== 'true' && oldStatus === 'true') {
				// suppress the polite login prompt, we're in edit mode
				setTimeout(function(){
					(sharedHeaderView && sharedHeaderView.mPoliteLoginPrompt && sharedHeaderView.mPoliteLoginPrompt.hidePoliteLoginPrompt(true));
				}, 0);
				
				if ( browser().isiPhone() ) {
					var currentURL = window.location;
					window.location = "/auth?send_token=no&redirect="+currentURL;
					return;
				}

				// ask the user to relogin
				authenticator().displayFramedLoginPrompt(function() {
					if (inOptPageSaveErrorCondition) {
						// try a re-save now
						this.savePage();
					}
				}.bind(this), function() {
					if (!inOptPageSaveErrorCondition) {
						this.toggleEditMode(false, true);
						(sharedHeaderView && sharedHeaderView.mPoliteLoginPrompt && sharedHeaderView.mPoliteLoginPrompt.updateDisplayState());
					}
				}.bind(this), (inOptPageSaveErrorCondition) ? "_Editor.Notifications.Page.Saved.LoginError".loc() : "_Editor.Notifications.Page.Edit.LoginError".loc());
				return;
			} else if (inOptPageSaveErrorCondition) {
				notifier().printErrorMessage("_Editor.Notifications.Page.Saved.Error".loc());
			}
			
			if (!inOptDoNotCheckForNewerVersion) {
				var gotStalePage = function() {
					if (confirm("_Editor.Conflict.Edit.Outdated".loc())) {
						globalCookieManager().setCookie('cc.toggleEditModeOnLoad', true);
						window.onbeforeunload = Prototype.emptyFunction;
						window.location.reload();
					}
				};
				this.mEditingService.checkServerForEdits(gotStalePage, Prototype.emptyFunction);
			}
		}.bind(this), Prototype.emptyFunction);
	},
	toggleDebugMode: function(inDebugModeEnabled) {
		this.mDebugMode = (inDebugModeEnabled != undefined) ? (inDebugModeEnabled || false) : !this.mDebugMode;
		var root = document.body.up('html') || document.body;
		this.mDebugMode ? root.addClassName('wikieditor-debugmode') : root.removeClassName('wikieditor-debugmode');
		if (inDebugModeEnabled) logger().setLogLevel(CC.Logger.LOG_LEVEL_DEBUG);
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_EDITOR_DID_TOGGLE_DEBUG_MODE, this);
	},
	// Migrates a pre-Lion wiki page to the new editor architecture.
	migratePage: function() {
		dialogManager().showProgressMessage("_Editor.Migration.Progress.Migrating".loc());
		// Get the first child block on the page.
		var firstSandboxBlockView = this.mEditorView.$('.block.sandbox');
		var firstSandboxBlockGUID = firstSandboxBlockView.getAttribute('data-guid');
		if (!firstSandboxBlockGUID) return (inOptCallback ? inOptCallback() : undefined);
		var firstSandboxBlock = this.mPage.mBlocks.get(firstSandboxBlockGUID);
		if (!firstSandboxBlock) return (inOptCallback ? inOptCallback() : undefined);
		var markup = firstSandboxBlock.getRecordPropertyForPath('extendedAttributes.markup');
		var migrated = globalEditorMigrationController().migrate(markup);
		if (migrated) {
			// Update the page chrome before adding any migrated blocks.
			this.mEditorView.$('.page.blocks').removeClassName('migrated');
			// Add a text block before the sandbox we just migrated.
			var newTextBlock = this.addBlock('text', undefined, false, {'before': firstSandboxBlockView}, this.mPage);
			var fragment = textBlockDelegate().buildFragmentForBulkAddMigratedResultToBlock(migrated, newTextBlock, this);
			newTextBlock.mViewInstance._editable.appendChild(fragment);
			// Hide the original sandbox block view.
			firstSandboxBlockView.hide();
			// Remove the unwanted sandbox.
			this.removeBlock(firstSandboxBlock, true);
			// Update the page model.
			this.mPage.setRecordPropertyForPath('extendedAttributes.migrated', false);
			this.mPage.setRecordPropertyForPath('extendedAttributes.editorVersion', CC.WikiEditor.EDITOR_VERSION);
			globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_PAGE_DID_MIGRATE, this.mPage);
		}
		// Hide the migration progress message.
		dialogManager().hideProgressMessage();
		return true;
	},
	// 9261334
	_updatePreSeedPageSchema: function() {
		logger().debug("_updatePreSeedPageSchema: %o (editorVersion: %o)", this.mPage, this.mPage.getRecordPropertyForPath('extendedAttributes.editorVersion'));
		// Text blocks become block containers by recursively expanding page into a root-level
		// text block, and any table cells into nested text blocks. As we expand into a container
		// block, text blocks at that level are collapsed together as their markup is concatenated.
		var promoteBlocksInsideElementIntoTextBlock = function(element, rootTextBlock) {
			var rootTextBlockGUID = rootTextBlock.getRecordPropertyForPath('guid');
			var rootTextBlockElement = rootTextBlock.mViewInstance.$('.editable');
			var blockViews = element.select('.block'), nestedBlockViews = element.select('.block .block');
			var topLevelBlockGUIDs = stringArrayDifference(blockViews.invoke('getAttribute', 'data-guid'), nestedBlockViews.invoke('getAttribute', 'data-guid'));
			// Don't promote the new root text block inside itself.
			topLevelBlockGUIDs = topLevelBlockGUIDs.without(rootTextBlockGUID);
			var topLevelBlockGUIDIdx, topLevelBlockGUID, topLevelBlock, topLevelBlockViewElement, topLevelBlockAttrs;
			var targetElement, newTargetElement, tagname, alignment, _editable;
			for (topLevelBlockGUIDIdx = 0; topLevelBlockGUIDIdx < topLevelBlockGUIDs.length; topLevelBlockGUIDIdx++) {
				topLevelBlockGUID = topLevelBlockGUIDs[topLevelBlockGUIDIdx];
				topLevelBlock = this.blockForBlock(topLevelBlockGUID);
				topLevelBlockViewElement = topLevelBlock.mViewInstance.mParentElement;
				topLevelBlockAttrs = topLevelBlock.getRecordPropertyForPath('extendedAttributes');
				// Is the child a text block?
				if (CC.kindOf(topLevelBlock, CC.WikiEditor.TextBlock)) {
					targetElement = rootTextBlockElement.appendChild(document.createElement('div')), newTargetElement = null;
					tagName = (topLevelBlockAttrs.tagName || 'p'), alignment = topLevelBlockAttrs.alignment;
					// Preserve block-level formatting and alignment settings.
					if (tagName == 'blockquote') {
						newTargetElement = targetElement.appendChild(Builder.node('blockquote', {className: 'quote'}));
					} else {
						if (!tagName && rootTextBlock.getRecordPropertyForPath('blockType') != 'table') tagName = 'p';
						if (tagName) newTargetElement = targetElement.appendChild(document.createElement(tagName));
					}
					if (alignment && alignment != 'left') {
						targetElement = targetElement.appendChild(Builder.node('span', {className: "align-%@".fmt(alignment)}));
						if (newTargetElement) targetElement = targetElement.appendChild(Element.remove(newTargetElement));
					} else {
						if (newTargetElement) targetElement = newTargetElement;
					}
					// Push the block content into the new root text block. We relocate DOM nodes
					// here to preserve text-node whitespace.
					_editable = topLevelBlockViewElement.down('.editable');
					while (_editable.hasChildNodes()) {
						targetElement.appendChild(_editable.removeChild(_editable.firstChild));
					}
					// Remove the original text block since we no longer need it.
					this.removeBlock(topLevelBlock, true);
					continue;
				}
				// Otherwise, relocate the block view to its new home and update the block instance.
				rootTextBlockElement.appendChild(Element.remove(topLevelBlockViewElement));
				topLevelBlock.mParentContainer = rootTextBlock;
				topLevelBlock.setRecordPropertyForPath('extendedAttributes.containerGUID', rootTextBlockGUID);
				rootTextBlock.mBlocks.set(topLevelBlockGUID, topLevelBlock);
				rootTextBlock.handleBlocksDidChange();
			}
		}.bind(this);
		// Start bottom-up, promoting blocks inside every table cell.
		var blocksView = this.mEditorView.$('.page.blocks');
		var _block, tableBlocks = blocksView.select('.block.table'), tableBlockIdx, table;
		var tableBlockGUID, tableBlock, tableBlockCells, tableBlockCellIdx, tableBlockCell;
		for (tableBlockIdx = 0; tableBlockIdx < tableBlocks.length; tableBlockIdx++) {
			table = tableBlocks[tableBlockIdx];
			tableBlockGUID = table.getAttribute('data-guid');
			tableBlock = this.blockForBlock(tableBlockGUID);
			tableBlockCells = table.select('td.cell');
			for (tableBlockCellIdx = 0; tableBlockCellIdx < tableBlockCells.length; tableBlockCellIdx++) {
				tableBlockCell = tableBlockCells[tableBlockCellIdx];
				// Does this cell have anything inside we need to migrate?
				if (tableBlockCell.select('.block')) {
					_block = this.addBlock('text', {}, false, {'bottom': tableBlockCell}, tableBlock, false, false);
					promoteBlocksInsideElementIntoTextBlock(tableBlockCell, _block);
				}
			}
		}
		// Move all top-level blocks inside a new root text block.
		_block = this.addBlock('text', {}, false, undefined, this.mPage, false, false);
		promoteBlocksInsideElementIntoTextBlock(blocksView, _block);
		// Update the editor version for the page.
		this.mPage.setRecordPropertyForPath('extendedAttributes.editorVersion', CC.WikiEditor.EDITOR_VERSION);
		return true;
	},
	// Restores any autosaved edits.
	restoreAutosavedEdits: function() {
		var pageGUID = this.mPage.mRecord.guid;
		if (!pageGUID) return false;
		// Read any cached changes from local storage.
		var autosaved;
		if (browserSupportsLocalStorage()) {
			autosaved = window.localStorage.getItem("%@-%@".fmt(CC.WikiEditor.LOCAL_STORAGE_KEY, pageGUID)) || '{}';
		}
		// Do we have autosaved changes?
		if (!autosaved) return false;
		autosaved = autosaved.evalJSON(true);
		// If we have autosaved changes for a conflicting page revision, discard them.
		var pageRevision = this.mPage.mRecord.revision;
		if (autosaved['revision'] != pageRevision) {
			logger().debug("Autosaved changes will be discarded (page revision conflict).");
			this.flushAutosavedChanges(pageGUID);
			return false;
		}
		if (!this.mAutosaveDialog) {
			this.mAutosaveDialog = dialogManager().drawDialog('restore_autosaved_edits_dialog', [
				"_Editor.Autosave.Restore.Unsaved.Changes.Dialog.Description".loc()
			], "_Editor.Autosave.Restore.Unsaved.Changes.Dialog.OK".loc(), false, "_Editor.Autosave.Restore.Unsaved.Changes.Dialog.Title".loc());
		}
		var discardCallback = function() {
			this.flushAutosavedChanges(pageGUID);
			dialogManager().hide();
		};
		var restoreCallback = function() {
			this._restoreAutosavedEdits(autosaved['payload']);
			this.toggleEditMode(true, true);
			dialogManager().hide();
		};
		dialogManager().show(this.mAutosaveDialog, discardCallback.bind(this), restoreCallback.bind(this));
	},
	// Restores a set of autosaved edits for a given presave payload.
	_restoreAutosavedEdits: function(inPayload) {
		var payload = (inPayload || []);
		// Start with the stashed content for the page we just rendered. Iterate over each of the changesets in the save
		// payload and merge to the stashed page structure.
		var stashedContent = this.mStashedContent, payloadEntry, payloadHash;
		for (var pdx = 0; pdx < payload.length; pdx++) {
			payloadEntry = payload[pdx];
			payloadHash = {};
			payloadHash[payloadEntry[0]] = payloadEntry[1];
			Object.extend(stashedContent, payloadHash);
		}
		// Reinitialize the page.
		this._initializeInlineContent(stashedContent);
	},
	// Adds a new block to the editor. Accepts a block identifier and an optional set of properties to be applied
	// to the block model. Can optionally be activated after creation, and added at an optional position. If inOptAddQuietly
	// is unspecified or false, the block will be created on the server on first save, otherwise, it is assumed the block
	// already exists on the server (we will generate changesets from now on). Also accepts an inOptWorkingElement
	// argument where this block is being rendered in an offscreen tree or fragment.
	addBlock: function(inBlockIdentifer, inOptBlockProperties, inOptActivateAfterCreating, inOptPosition, inOptContainer, inOptAddQuietly, inOptDoNotTriggerContainerChanges, inOptWorkingElement) {
		if (!inBlockIdentifer) return false;
		// Ensure we're adding a block type we know about.
		if (!globalEditorBlockPluginRegistry()._isBlockTypeRegistered(inBlockIdentifer)) {
			logger().error("Tried to add unknown block (%@) to editor".fmt(inBlockIdentifer));
			return false;
		}
		// Create and add the block record to the editor store.
		var blockProperties = {'blockType': inBlockIdentifer};
		if (inOptBlockProperties) Object.extend(blockProperties, inOptBlockProperties);
		// If we didn't get an explicit container, find the nearest container.
		var container = inOptContainer;
		if (!container && (this.mActiveBlock && this.mActiveBlock.mIsContainer)) container = this.mActiveBlock;
		if (!container) {
			// Try and insert the block in neareset parent text block to the active block.
			if (this.mActiveBlock) {
				var nearestTextBlock = this.mActiveBlock.mViewInstance.$().up('.block');
				if (nearestTextBlock.hasClassName('text')) {
					container = this.blockForBlock(nearestTextBlock);
					if (container) inOptPosition = {'after': this.mActiveBlock.mViewInstance.$()};
				}
			}
		}
		if (!container) container = this.mPage
		// Track the container dependency for this block.
		extendedAttributes = blockProperties['extendedAttributes'] || {};
		extendedAttributes['containerGUID'] = container.getRecordPropertyForPath('guid');
		blockProperties['extendedAttributes'] = extendedAttributes;
		// Create the new block.
		var block = new CC.WikiEditor.BlockModel(blockProperties);
		block = this.mStore.pushObject(block);
		// Push a bulk changeset for a new block.
		if (!inOptAddQuietly) {
			var changesetAttributes = block.changesetAttributes(), changesetAttributeIdx, attr;
			for (changesetAttributeIdx = 0; changesetAttributeIdx < changesetAttributes.length; changesetAttributeIdx++) {
				attr = changesetAttributes[changesetAttributeIdx];
				this.mStore.pushChangeForObject(block, attr, block[attr]);
			}
		}
		// Look up the correct controller in the block plugin registry and wrap the block.
		var konstructor = globalEditorBlockPluginRegistry().blockControllerForType(inBlockIdentifer);
		if (!konstructor) throw("Could not find constructor for known block type (%@)".fmt(inBlockIdentifer));
		var controller = new konstructor({
			'mStore': this.mStore,
			'mRecord': block,
			'mParentContainer': container
		});
		// Instantiate a view for the block.
		konstructor = CC.objectForPropertyPath(controller.mBlockView) || CC.WikiEditor.BlockView;
		var view = new konstructor({
			'mContent': controller
		});
		if (!view) throw("Could not initialize view (%@) for block (%@)".fmt(view, controller));
		// Prime the view and glue the view and the controller.
		controller.mViewInstance = view;
		// Glue the record and the controller.
		block.mControllerInstance = controller
		// Stash away the currently active block.
		var previouslyActiveBlock = this.mActiveBlock;
		// Add the block.
		if (!container && !inOptPosition && previouslyActiveBlock) {
			var blockView = previouslyActiveBlock.mViewInstance;
			container = previouslyActiveBlock.mParentContainer;
			inOptPosition = {'after': blockView};
			// If we don't have a position, and we have an active text block, split the text
			// block and place the file between the result of the split.
			if (previouslyActiveBlock.mSupportsNavigation) {
				if (previouslyActiveBlock.focusedAtStart()) {
					inOptPosition = {'before': blockView};
				} else if (previouslyActiveBlock.focusedAtEnd()) {
					inOptPosition = {'after': blockView};
				}
			}
		}
		var newBlock = container.addBlock(controller, inOptPosition, inOptAddQuietly, inOptDoNotTriggerContainerChanges, inOptWorkingElement);
		// Optionally start editing.
		if (inOptActivateAfterCreating) this.startEditing(newBlock, {moveToStart: true});
		return newBlock;
	},
	// Bulk support for adding a block tree to the page. Here, blocks are represented in JSON
	// format with any sub-blocks of a parent container block provided in an ordered array of
	// a _childBlocks JSON hash parameter. Called when batch-adding a page representation from
	// the server, after a page migration or a copy/paste migration.
	bulkAddBlock: function(inBlockToExpand, inOptPosition, inOptContainer, inOptAddQuietly, inOptWorkingElement) {
		var result = [], fragment, fragmentChild, stashedPosition;
		// If we're bulk-appending at a DOM position, use a fragment for performance.
		if (inOptPosition) {
			fragment = document.createDocumentFragment();
			stashedPosition = inOptPosition;
			inOptPosition = {'bottom': fragment};
		}
		this._bulkAddBlock(result, inBlockToExpand, inOptPosition, inOptContainer, inOptAddQuietly, inOptWorkingElement);
		// Append the fragment to the DOM.
		if (stashedPosition) {
			for (var key in stashedPosition) {
				var value = stashedPosition[key];
				var position = {};
				position[key] = fragment;
				fragmentSafeElementInsert(value, position);
				break;
			}
		}
		if (!inOptAddQuietly) {
			var parent = (inOptContainer || this.mPage);
			if (parent) parent.handleBlocksDidChange();
		}
		return result;
	},
	_bulkAddBlock: function(inWorkingArray, inBlockToExpand, inOptPosition, inOptContainer, inOptAddQuietly, inOptWorkingElement) {
		if (!inBlockToExpand) return false;
		var _childBlocks, parentBlock, childBlockIdx, childBlock;
		_childBlocks = inBlockToExpand._childBlocks;
		parentBlock = this.addBlock(inBlockToExpand.blockType, inBlockToExpand, false, inOptPosition, inOptContainer, inOptAddQuietly, true, inOptWorkingElement);
		inWorkingArray.push(parentBlock);
		// Do we have anything to expand?
		if (_childBlocks && _childBlocks.length > 0) {
			for (childBlockIdx = 0; childBlockIdx < _childBlocks.length; childBlockIdx++) {
				childBlock = _childBlocks[childBlockIdx];
				this._bulkAddBlock(inWorkingArray, childBlock, undefined, parentBlock, inOptAddQuietly, false, parentBlock.mViewInstance.$());
			}
			parentBlock.handleBlocksDidChange({'quietly': inOptAddQuietly});
		}
	},
	// Removes an existing block from the editor. Mostly delegates the remove
	// behavior to the page or parent container for a given block to be removed.
	removeBlock: function(inBlock, inOptControlledExplosion) {
		if (!CC.kindOf(inBlock, CC.WikiEditor.Block)) return false;
		if (inBlock == this.mActiveBlock) this.stopEditing(true);
		var previousBlock = this.findPreviousBlock(inBlock);
		var parent = inBlock.mParentContainer ? inBlock.mParentContainer : this.mPage;
		parent.removeBlock(inBlock, inOptControlledExplosion);
		// Purge the block from the store.
		this.mStore.purgeGUID(inBlock.getRecordPropertyForPath('guid'));
		// Delete the block.
		delete inBlock;
		// Always enforce at least one text block on a page.
		if (this.mPage.mBlocks.size() == 0) {
			var prediction = this.predictNextBlock();
			previousBlock = this.addBlock(prediction.blockType, {'extendedAttributes': prediction.attributes});
		}
		// If we have a previous block, activate it.
		if (previousBlock) this.startEditing(previousBlock, {'moveToEnd': true});
	},
	// Batch remove an array of blocks from the editor.
	removeBlocks: function(inBlocks, inOptControlledExplosion) {
		if (!inBlocks) return false;
		var blocks = $A(inBlocks), blockIdx, block;
		for (blockIdx = (blocks.length - 1); blockIdx >= 0; blockIdx--) {
			block - blocks[blockIdx];
			if (!CC.kindOf(block, CC.WikiEditor.Block)) return;
			this.removeBlock(block, inOptControlledExplosion);
		}
	},
	// Batch removes all blocks from the editor (faster than iterating over all blocks
	// and calling removeBlock individually). Bypasses previous block activation and
	// notification propagation.
	fastRemoveAllBlocks: function() {
		// If we have an active block (we should) stop editing.
		this.stopEditing(true);
		// Collect all the blocks on the page and purge them from the store.
		var allBlocks = this.mPage.mBlocks.values(), block;
		for (var allBlocksIdx = 0; allBlocksIdx < allBlocks.length; allBlocksIdx++) {
			block = allBlocks[allBlocksIdx];
			this.mStore.purgeGUID(block.getRecordPropertyForPath('guid'));
		}
		// Fast-update the page view.
		this.mEditorView.mPageView.$().innerHTML = "";
		this.mPage.mBlocks = new Hash();
		// Enforce at least one block on the page.
		var prediction = this.predictNextBlock();
		var newBlock = this.addBlock(prediction.blockType, {'extendedAttributes': prediction.attributes});
		this.startEditing(newBlock, {'moveToStart': true}, true);
	},
	// Returns the block controller for a given DOM element or block GUID, if it exists.
	// Returns undefined otherwise.
	blockForBlock: function(inOptBlockElement) {
		if (!inOptBlockElement) return undefined;
		var blockGUID, workingCopy, element;
		if (CC.typeOf(inOptBlockElement) == CC.T_STRING) {
			blockGUID = inOptBlockElement;
		} else {
			element = $(inOptBlockElement);
			if (element) blockGUID = element.getAttribute('data-guid');
		}
		workingCopy = this.mStore.workingCopyForGUID(blockGUID);
		return (workingCopy && workingCopy.mControllerInstance);
	},
	// Starts editing a given block. Accepts an arbitary hash of activation information.
	// If startEditing is called on the currently active block, we resume editing that
	// block (which may or not have any effect).
	startEditing: function(inBlock, inOptActivationInfo, inOptForceActivate) {
		if (!this.mEditMode) return false;
		if (!inBlock || !CC.kindOf(inBlock, CC.WikiEditor.Block)) return false;
		// Bail if the block is locked or if the block is refusing to be editable.
		if (!inBlock.isEditable() || inBlock.isLocked()) return false;
		// Do we have an existing active block or is inBlock already the active block?
		var currentlyActiveBlock = this.mActiveBlock;
		if (inBlock != currentlyActiveBlock || inOptForceActivate) {
			// Stop editing the previous active block.
			this.stopEditing(true);
			// Mark the new block as being active.
			this.mActiveBlock = inBlock;
			// 10473966
			// Only focus the new block if we're not scrolled.
			var main = $('main');
			if (main) {
				var scrollTop = main.scrollTop;
				if (scrollTop > this.mDoNotFocusScrollTolerance) {
					inOptActivationInfo['focus'] = false;
				}
			}
			this.mActiveBlock.handleDidStartEditing(inOptActivationInfo);
			this._propagateCallbackForContainers(this.mActiveBlock, 'handleDidStartEditing');
		} else {
			// Resume editing the already active block.
			this.mActiveBlock.handleDidResumeEditing(inOptActivationInfo);
			this._propagateCallbackForContainers(this.mActiveBlock, 'handleDidResumeEditing');
		}
		// Reconfigure the editor toolbar.
		this.reconfigureEditorToolbar(this.mActiveBlock);
		return true;
	},
	// Resumes editing a given block. Called after this block has lost focus.
	resumeEditing: function(inBlock, inOptActivationInfo) {
		if (!this.mEditMode || !this.mActiveBlock || !inBlock || !CC.kindOf(inBlock, CC.WikiEditor.Block)) return false;
		if (this.mActiveBlock != inBlock) return false;
		this.reconfigureEditorToolbar();
		this.mActiveBlock.handleDidResumeEditing(inOptActivationInfo);
		this._propagateCallbackForContainers(this.mActiveBlock, 'handleDidResumeEditing');
		return true;
	},
	// Stops editing the active block (if it exists).
	stopEditing: function(inOptStayInEditMode, inOptDeactivationInfo) {
		if (!this.mActiveBlock) return false;
		// Stash the active block in case we change our mind.
		var activeBlock = this.mActiveBlock;
		this.mPreviouslyActiveBlock = activeBlock;
		this.mActiveBlock.handleDidStopEditing(inOptDeactivationInfo);
		this._propagateCallbackForContainers(this.mActiveBlock, 'handleDidStopEditing');
		this.mActiveBlock = null;
		if (!inOptStayInEditMode) this.toggleEditMode(false);
		this.reconfigureEditorToolbar();
		return true;
	},
	// Helper method that propagates callback functions to the parents of a container.
	_propagateCallbackForContainers: function(inBlock, inCallbackName) {
		if (!inBlock || !CC.kindOf(inBlock, CC.WikiEditor.Block)) return false;
		var container = inBlock.mParentContainer, callback;
		while (container && CC.kindOf(container, CC.WikiEditor.Block)) {
			callback = container[inCallbackName];
			if (callback) callback.apply(container, [{'propagated': true}]);
			container = container.mParentContainer;
		}
	},
	// Finds the next/previous block to a reference block determined by the closed block view
	// element in the DOM.
	findNextBlock: function(inOptBlock, inSearchBackwards) {
		if (!inOptBlock || !CC.kindOf(inOptBlock, CC.WikiEditor.Block)) return undefined;
		if (!inOptBlock.mViewInstance) return inOptBlock;
		var nextBlockElement = inOptBlock.mViewInstance.mParentElement[inSearchBackwards ? 'previous' : 'next']('.block');
		if (!nextBlockElement) return undefined;
		var nextBlockGUID = nextBlockElement.getAttribute('data-guid');
		var workingCopy = this.mStore._workingCopies.get(nextBlockGUID);
		return (workingCopy && workingCopy.mControllerInstance);
	},
	// Finds the previous page-level block controller.
	findPreviousBlock: function(inOptBlock) {
		return this.findNextBlock(inOptBlock, true);
	},
	// Prepares a page for saving.
	prepareToSavePage: function() {
		// Detect and fix any missing blocks.
		this.detectAndFixMissingBlocks();
		// Publish a page will save notification so any blocks can flush any state before saving.
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_WILL_SAVE_PAGE, this.mPage);
		// Update any extended attributes of the page.
		var store = this.mStore;
		var locale = globalLocalizationManager().getLprojLocale();
		var blockDependencyGUIDs = this._getBlockDependencyGUIDs(true);
		var renderedPageProperties = this._getRenderedPageProperties();
		store.pushChangeForObject(this.mPage.mRecord, 'extendedAttributes.renderedPage', renderedPageProperties[0]);
		store.pushChangeForObject(this.mPage.mRecord, 'extendedAttributes.pageTextValue', renderedPageProperties[1]);
		store.pushChangeForObject(this.mPage.mRecord, 'extendedAttributes.blockDependencyGUIDs', blockDependencyGUIDs);
		store.pushChangeForObject(this.mPage.mRecord, 'extendedAttributes.locale', locale);
		// Flush any deferred store changes (in reverse block dependency order) into the store before saving.
		var blockDependencyIdx, blockDependencyGUID;
		for (blockDependencyIdx = (blockDependencyGUIDs.length - 1); blockDependencyIdx >= 0; blockDependencyIdx--) {
			blockDependencyGUID = blockDependencyGUIDs[blockDependencyIdx];
			store.calculateDeferredChangesForGUID(blockDependencyGUID);
		}
	},
	// Creates a page save payload used by savePage.
	presavePage: function() {
		this.prepareToSavePage();
		// Create a payload with the new block object graph. Blocks are saved in a hash first keyed
		// by block type, then keyed by block GUID.
		var store = this.mStore;
		var pageGUID = this.mPage.getRecordPropertyForPath('guid');
		var payload = store.buildChangesetForObjectWithGUID(pageGUID);
		var _blocks = {};
		var registeredBlockTypes = globalEditorBlockPluginRegistry().registeredBlocks(), registeredBlockType;
		for (var registeredBlockTypesIdx = 0; registeredBlockTypesIdx < registeredBlockTypes.length; registeredBlockTypesIdx++) {
			registeredBlockType = registeredBlockTypes[registeredBlockTypesIdx];
			_blocks[registeredBlockType] = {};
		}
		var blockDependencyGUIDs = this._getBlockDependencyGUIDs(), blockDependencyIdx, blockGUID, blockType;
		for (blockDependencyIdx = 0; blockDependencyIdx < blockDependencyGUIDs.length; blockDependencyIdx++) {
			blockGUID = blockDependencyGUIDs[blockDependencyIdx];
			block = store.workingCopyForGUID(blockGUID);
			blockType = (block.blockType || "unknown");
			_blocks[blockType][blockGUID] = store.workingCopyForGUID(blockGUID).serialize();
		}
		// Find the extendedAttributes changeset entry for the page, manually include block information
		// for child blocks on the page. By manually updating the changeset, we avoid having to push an
		// unnecessary change into the store.
		var payloadIdx, payloadItem, payloadKey, payloadValue;
		for (payloadIdx = 0; payloadIdx < payload.length; payloadIdx++) {
			payloadItem = payload[payloadIdx];
			if (!payloadItem) continue;
			payloadKey = payloadItem[0], payloadValue = payloadItem[1];
			if (payloadKey != 'extendedAttributes') continue;
			payloadValue['_blocks'] = _blocks;
			break;
		}
		return payload;
	},
	// Saves any changes tracked by the editor to the server. Updates to the page model are submitted
	// as an array of changesets for that object. The object graph of the page is submitted as
	// serialized copies of the current working copy of any child objects in the store. Accepts an
	// inOptForceSavePage parameter, triggering a force-override any server-version of the page where
	// an editing conflict exists. For performance reasons, the object graph of a page (its direct-descendant
	// blocks and any nested child blocks) are serialized and saved in an extendedAttribute of the page.
	savePage: function(inOptForceSavePage) {
		// Create the save payload before exiting edit mode.
		var payload = this.presavePage();
		this.toggleEditMode(false);
		// Save the page.
		var pageGUID = this.mPage.getRecordPropertyForPath('guid');
		logger().debug("savePage: %o %o", pageGUID, payload);
		dialogManager().showProgressMessage("_Editor.Notifications.Page.Saving".loc());
		this.mEditingService.saveChanges(payload, inOptForceSavePage, this.didSavePage.bind(this), this.pageSaveDidFail.bind(this));
	},
	// Auto-saves any changes to the current page in local storage as JSON.
	autosavePage: function() {
		// Get any pending changesets from the editor store, bail if we have no new changesets.
		if (this.mStore.hasUnsavedChanges() && browserSupportsLocalStorage()) {
			// Build a page payload.
			var payload = this.presavePage();
			// Stash our edits.
			var localStorageKey = "%@-%@".fmt(CC.WikiEditor.LOCAL_STORAGE_KEY, this.mPage.mRecord.guid);
			try {
				var revision = this.mPage.mRecord.revision;
				window.localStorage.setItem(localStorageKey, Object.toJSON({'payload': payload, 'revision': revision, 'authenticated': (CC.meta('x-apple-user-logged-in') == 'true')}));
				var keysIndex = this.getAutosavedKeysIndex();
				keysIndex.push(localStorageKey);
				window.localStorage.setItem(CC.WikiEditor.LOCAL_STORAGE_INDEX_KEY, keysIndex.uniq().join(","));
			} catch (e) {
				logger().error("Could not autosave page because an error occurred or the local storage quota has been exceeded.");
				window.localStorage.removeItem(localStorageKey);
			}
		}
		if (this.mAutosaveDrafts && browserSupportsLocalStorage()) {
			this.mAutosaveTimer = setTimeout(this.autosavePage.bind(this), (this.mDebugMode ? this.mDebugModeAutosaveDelay : this.mAutosaveDelay));
		}
	},
	// Flushes any autosaved edits from local storage. Accepts an optional page GUID for which
	// changes should be flushed, but by default flushes changes for all pages.
	flushAutosavedChanges: function(inOptPageGUID) {
		if (!browserSupportsLocalStorage()) return false;
		logger().debug("Flusing autosaved changes from local storage");
		var keysIndex = this.getAutosavedKeysIndex();
		if (!inOptPageGUID) {
			for (var keyIdx = 0; keyIdx < keysIndex.length; keyIdx++) {
				window.localStorage.removeItem(keysIndex[keyIdx]);
			}
			window.localStorage.removeItem(CC.WikiEditor.LOCAL_STORAGE_INDEX_KEY);
		} else {
			var localStorageKey = "%@-%@".fmt(CC.WikiEditor.LOCAL_STORAGE_KEY, inOptPageGUID);
			window.localStorage.removeItem(localStorageKey);
			window.localStorage.setItem(CC.WikiEditor.LOCAL_STORAGE_INDEX_KEY, keysIndex.without(localStorageKey).join(","));
		}
		// Stop autosaving since we will start any time we go back into edit mode.
		if (this.mAutosaveTimer) clearTimeout(this.mAutosaveTimer);
	},
	getAutosavedKeysIndex: function() {
		if (browserSupportsLocalStorage()) {
			var allKeys = window.localStorage.getItem(CC.WikiEditor.LOCAL_STORAGE_INDEX_KEY);
			if (allKeys) return $A(allKeys.split(','));
		}
		return new Array();
	},
	// Validate the structure of the page before saving, detecting any blocks that have been
	// removed by the browser without notifying the editor, and updates their parent abstract
	// block container model to no longer reference the deleted block.
	detectAndFixMissingBlocks: function() {
		// Get the current block dependency value for the page from the store.
		var previousDependencies = this.mPage.getRecordPropertyForPath('extendedAttributes.blockDependencyGUIDs', new Array());
		// Get an array of block dependencies for the current state of the page.
		var currentDependencies = this._getBlockDependencyGUIDs(true);
		// Calculate an intersection of GUIDs to determine blocks that have been removed in this
		// editing session (either deliberately or unexpectedly). For each missing GUID, we walk
		// the parentGUIDs tree and determine the nearest still-existant block and update it to
		// reflect the change.
		
		var missingBlockGUIDs = [];
		for (var i = 0; i < previousDependencies.length; i++) {
			var dependency = previousDependencies[i];
			if (currentDependencies.indexOf(dependency) == -1) {
				missingBlockGUIDs.push(dependency);
			}
		}
		
		var missingBlockGUID, missingBlock;
		var parentGUIDs, missingParentGUIDs, missingParentGUIDIdx, missingParentGUID;
		var firstParent = null;
		var firstMissingParentGUID, firstMissingParent, firstParentBlockGUIDs;
		for (mdx = (missingBlockGUIDs.length - 1); mdx >= 0; mdx--) {
			missingBlockGUID = missingBlockGUIDs.shift();
			missingBlock = this.mStore.workingCopyForGUID(missingBlockGUID);
			if (!missingBlock || !missingBlock.mControllerInstance) continue;
			missingBlock = missingBlock.mControllerInstance;
			parentGUIDs = $A(missingBlock.getRecordPropertyForPath('parentGUIDs'));
			// Detect the first missing parent in the dependency graph for this missing block.
			missingParentGUIDs = new Array();
			for (var pdx = 0; pdx < parentGUIDs.length; pdx++) {
				if (missingBlockGUIDs.indexOf(parentGUIDs[pdx]) != -1) {
					missingParentGUIDs.push(parentGUIDs[pdx]);
					firstMissingParentGUID = parentGUIDs[pdx];
					continue;
				}
				firstParent = this.mStore.workingCopyForGUID(parentGUIDs[pdx]);
				break;
			}
			// If we didn't find a parent, try the page itself
			if (!firstParent) {
				firstParent = this.mStore.workingCopyForGUID(this.mPage.getRecordPropertyForPath('guid'));
			}
			// Update the blockGUIDs property of the closest existing parent container.
			if (firstParent && firstParent.mControllerInstance) {
				firstParent = firstParent.mControllerInstance;
				firstParentBlockGUIDs = firstParent.getRecordPropertyForPath('extendedAttributes.blockGUIDs');
				// If we have a missing parent of this block, we remove the missing parent
				// GUID which will also remove all children of that parent (including this
				// misssing block). Otherwise, just remove the GUID for this missing block.
				if (firstParentBlockGUIDs.include(firstMissingParentGUID || missingBlockGUID)) {
					firstParent.setRecordPropertyForPath('extendedAttributes.blockGUIDs', firstParentBlockGUIDs.without(firstMissingParentGUID || missingBlockGUID));
				}
			}
			// We no longer need to keep track of this missing block, or any of its missing parents.
			for (missingParentGUIDIdx = 0; missingParentGUIDIdx < missingParentGUIDs.length; missingParentGUIDIdx++) {
				missingParentGUID = missingParentGUIDs[missingParentGUIDIdx];
				missingBlockGUIDs = missingBlockGUIDs.without(missingParentGUID)
			}
		}
	},
	// Returns an array of all the block dependencies for this page. You should not call this
	// method yourself (performance optimization for the server).
	mCachedBlockDependencyGUIDs: null,
	_getBlockDependencyGUIDs: function(inOptForceRecalculate) {
		if (!inOptForceRecalculate && this.mCachedBlockDependencyGUIDs) return this.mCachedBlockDependencyGUIDs;
		var blocks = this.mEditorView.mPageView.$().select('.block, .block-placeholder');
		var blockDependencyGUIDs = [], block;
		var store = this.mStore;
		for (var blockIdx = 0; blockIdx < blocks.length; blockIdx++) {
			if (blocks[blockIdx]) {
				block = blocks[blockIdx];
				if (block) {
					var blockGUID = block.getAttribute('data-guid');
					if (store && store.workingCopyForGUID(blockGUID)) blockDependencyGUIDs.push(blockGUID);
				}
			}
		}
		return (this.mCachedBlockDependencyGUIDs = blockDependencyGUIDs);
	},
	// Update the blockDependencyGUIDs property on the page.
	_updateBlockDependencyGUIDs: function() {
		this.mPage.setRecordPropertyForPath('extendedAttributes.blockDependencyGUIDs', this._getBlockDependencyGUIDs(true));
	},
	// Returns a plaintext representation for the string contents of an element. Iterates
	// over all the text nodes and joins them with a single whitespace.
	_buildPlaintextStringForElement: function(element) {
		var collectTextNodesRecursively = function(_element, _workingArray) {
			if (_element && (_element.nodeType == 3)) {
				_workingArray.push(_element.data);
			}
			else if (_element && _element.hasChildNodes()) {
				for (var i = 0; i < _element.childNodes.length; i++) {
					collectTextNodesRecursively(_element.childNodes[i], _workingArray);
				}
			}
		}
		var workingArray = [];
		collectTextNodesRecursively(element, workingArray);
		return workingArray.join(" ");
	},
	// Returns a tuple of rendered HTML and text content representation of the page.
	// Clones offscreen and removes any non-content elements (8274877).
	_getRenderedPageProperties: function() {
		// Clone the page content off-screen.
		var innerHTML = this.mEditorView.mPageView.$().innerHTML;
		var offscreenElement = Builder.node('div', {className: 'wikieditor-offscreen'});
		document.body.appendChild(offscreenElement);
		offscreenElement.innerHTML = innerHTML;
		var chromeElements = offscreenElement.select(".chrome");
		for (var chromeElementIdx = (chromeElements.length - 1); chromeElementIdx >= 0; chromeElementIdx--) {
			Element.remove(chromeElements[chromeElementIdx]);
		}
		// Ensure there are no editable elements.
		offscreenElement.select('*[contentEditable="true"]').invoke('removeAttribute', 'contentEditable');
		offscreenElement.select('.editing').invoke('removeClassName', 'editing');
		// Return the markup/text value.
		var htmlValue = offscreenElement.innerHTML;
		var textValue = this._buildPlaintextStringForElement(offscreenElement);
		Element.remove(offscreenElement);
		return [htmlValue, textValue];
	},
	didSavePage: function(inResponse) {
		logger().debug("didSavePage: %o", inResponse);
		var responses = (inResponse && inResponse.responses);
		var firstResponse = (responses && responses[0]);
		if (firstResponse && firstResponse.succeeded) {
			var entity = firstResponse.response;
			dialogManager().hide();
			// Push the response into the server_proxy store.
			server_proxy()._parseAndStoreEntity(entity);
			// Flush any autosaved changes we have pending.
			this.flushAutosavedChanges(entity.guid);
			// Trigger an asynchronous preview.
			this.mEditingService.triggerPreviewForPageGUID(entity.guid);
			// Re-initialize the page (using the new entity in server_proxy).
			this._initializeInlineContent();
			globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_DID_SAVE_PAGE, this.mPage);
			globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_DID_SAVE_PAGE_WITH_GUID, undefined, {'entity': entity, 'guid': entity.guid});
		}
		else {
			this.pageSaveDidFail(inResponse);
		}
	},
	// Handles a failed save by retrying to save mPageSaveRetryCount times. Eventually gives up.
	pageSaveDidFail: function(inResponse) {
		logger().debug("pageSaveDidFail: %o", inResponse);
		if (this.mPageSaveRetryCountSoFar == undefined) this.mPageSaveRetryCountSoFar = 0;
		if (this.mPageSaveRetryCountSoFar < this.mPageSaveRetryCount) {
			logger().debug("Retrying page save");
			this.mPageSaveRetryCountSoFar += 1;
			this.savePage();
		} else {
			logger().error("Tried to save page %@ times and failed, bailing".fmt(this.mPageSaveRetryCount));
			delete this.mPageSaveRetryCountSoFar;
			dialogManager().hide();
			this.toggleEditMode(true, true, true);
			globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_ERROR_SAVING_PAGE, this.mPage);
		}
	},
	// Restores unaltered versions of the page and any dependant blocks from the editor
	// store. Invoked when editing is cancelled.
	restoreStashedContent: function() {
		this._initializeInlineContent(this.mStashedContent);
	},
	// Predicts the next block in the editor. Just passes off to the top-level abstract
	// container, the page.
	predictNextBlock: function(inOptPreviousBlock, inOptIsPlaceholder) {
		return this.mPage.predictNextBlock(inOptPreviousBlock, inOptIsPlaceholder);
	},
	predictAndAddNextBlock: function(inOptPreviousBlock, inOptIsPlaceholder, inOptActivateAfterCreating, inOptPosition) {
		var block = (this.mSelecting && this.mSelectedBlocks) ? this.mSelectedBlocks.values().first() : this.mActiveBlock;
		var prediction = this.predictNextBlock(inOptPreviousBlock, inOptIsPlaceholder);
		var position = (inOptPosition ? inOptPosition : (inOptPreviousBlock ? {after: inOptPreviousBlock.mViewInstance.mParentElement} : undefined));
		var container = (this.mActiveBlock && this.mActiveBlock.mParentContainer) ? this.mActiveBlock.mParentContainer : undefined;
		if (container == this.mPage) container = undefined;
		this.addBlock(prediction.blockType, {'extendedAttributes': prediction.attributes}, inOptActivateAfterCreating, position, container);
	},
	// Handles a select/deselect all.
	handleSelectAll: function() {
		this.mSelectAllDelegate.prepareToSelectAll();
		this.selectAllBlocks();
	},
	handleDeselectAll: function() {
		this.mSelectAllDelegate.prepareToDeselectAll();
		this.deselectAllBlocks();
	},
	// Iterates through every block registered with the block plugin registry,
	// and configures the editor toolbar. The editor toolbar is split into
	// three sections; blocks, actions and containers. If a registered block
	// nominates an editor toolbar item, we add it to the first well. If a
	// registered block elects a contextual toolbar, we add it to the second well
	// if it is a content block and the third well if it is a container block.
	// Block toolbar items are shared among block instances of the same type.
	_configureEditorToolbar: function() {
		var registry = globalEditorBlockPluginRegistry();
		var toolbar = this.mEditorView.mToolbarView;
		var blocks = toolbar.mBlockSectionParentElement;
		var actions = toolbar.mActionSectionParentElement;
		var containers = toolbar.mContainerSectionParentElement;
		var blockToolbar, blockToolbarView;
		// First initialize any contextual toolbars for all registered blocks.
		var registeredBlockKeys = $A(registry.registeredBlocks()), registeredBlockKeyIdx, registeredBlockKey;
		for (registeredBlockKeyIdx = 0; registeredBlockKeyIdx < registeredBlockKeys.length; registeredBlockKeyIdx++) {
			registeredBlockKey = registeredBlockKeys[registeredBlockKeyIdx];
			// Get the block toolbar for this registeredBlockKey from the registry.
			blockToolbar = registry.blockToolbarForType(registeredBlockKey);
			// Bail if this block doesn't have a toolbar.
			if (!blockToolbar) continue;
			// Otherwise, instantiate and render the toolbar.
			blockToolbarView = new CC.WikiEditor.EditorInlineToolbarView({
				mContent: blockToolbar
			});
			renderedView = blockToolbarView._render();
			// Aggressively cache the toolbar by registeredBlockKey.
			this.mBlockContextualToolbarCache.set(registeredBlockKey, {'renderedView': renderedView, 'view': blockToolbarView});
			if (!renderedView) continue;
			registry.blockTypeBehavesAsContainer(registeredBlockKey) ? containers.appendChild(renderedView) : actions.appendChild(renderedView);
		}
		// Next, initialize a single toolbar with any "add block" buttons for each
		// individual block type registered with the editor. This single toolbar is
		// always visible in the leftmost well in the editor toolbar.
		var editorToolbarItem;
		blockToolbar = new CC.WikiEditor.BlockToolbar();
		for (registeredBlockKeyIdx = 0; registeredBlockKeyIdx < registeredBlockKeys.length; registeredBlockKeyIdx++) {
			registeredBlockKey = registeredBlockKeys[registeredBlockKeyIdx];
			// Grab the eidtor toolbar item for this registeredBlockKey.
			editorToolbarItem = registry.editorToolbarItemForType(registeredBlockKey);
			if (!editorToolbarItem) continue;
			// Push the toolbar item onto our one-time toolbar.
			blockToolbar.mToolbarItems.push(editorToolbarItem);
		}
		// Render the toolbar and append.
		var blocksToolbar = new CC.WikiEditor.EditorInlineToolbarView({
			mContent: blockToolbar
		});
		var renderedToolbar = blocksToolbar._render();
		if (renderedToolbar) blocks.appendChild(renderedToolbar);
		// Append a divider for each section.
		$([blocks, actions, containers]).each(function(section) {
			section.appendChild(Builder.node('div', {className: 'divider'}, [
				Builder.node('div', {className: 'divider-left'}),
				Builder.node('div', {className: 'divider-right'})
			]));
		});
	},
	// Reconfigures the editor toolbar after a change in editing context. As
	// the active block changes, the currently shown action and/or container
	// toolbars will update to reflect the current context. Once displayed,
	// individual options on those toolbars will be enabled/disabled depending
	// on the currently focused block.
	reconfigureEditorToolbar: function(inOptBlock) {
		var activeBlock = (inOptBlock || this.mActiveBlock || undefined);
		// Walk up the container tree from the active block, finding any containers.
		var blocks = $A([activeBlock]), nextContainer = (activeBlock ? activeBlock.mParentContainer : undefined);
		while ((nextContainer != undefined) && (nextContainer != this.mPage)) {
			blocks.push(nextContainer);
			nextContainer = nextContainer.mParentContainer;
		}
		// Compute an array of the identifers of the toolbars required for the stack.
		// That way, we don't hide a toolbar that we'll later need to show.
		var blockTypes = new Array(), blockIdx, block;
		for (blockIdx = 0; blockIdx < blocks.length; blockIdx++) {
			block = blocks[blockIdx];
			if (block && block.mRecord && block.mRecord.blockType) blockTypes.push(block.mRecord.blockType);
		}
		// Hide any unwanted toolbars first.
		var toolbars = this.mBlockContextualToolbarCache;
		var toolbarKeys = toolbars.keys(), toolbarKey, toolbarValue, toolbarIdx;
		for (toolbarIdx = 0; toolbarIdx < toolbarKeys.length; toolbarIdx++) {
			toolbarKey = toolbarKeys[toolbarIdx];
			toolbarValue = toolbars.get(toolbarKey);
			if (!this.mSelecting && blockTypes.include(toolbarKey)) continue;
			if (!(toolbarValue && toolbarValue.renderedView && toolbarValue.view)) continue;
			toolbarValue.renderedView.addClassName('hidden');
			toolbarValue.renderedView.up('.section').addClassName('hidden');
			toolbarValue.view.mBlockTarget = null;
			globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_DID_HIDE_BLOCK_TOOLBAR, toolbarValue);
		}
		// Bail if we're in selection mode.
		if (this.mSelecting) return;
		// Iterate over the list of containers we just derived and configure the new set.
		var blockType;
		for (blockIdx = 0; blockIdx < blocks.length; blockIdx++) {
			block = blocks[blockIdx];
			if (!CC.kindOf(block, CC.WikiEditor.Block)) continue;
			blockType = ((block && block.mRecord) ? block.mRecord.blockType : undefined);
			toolbar = this.mBlockContextualToolbarCache.get(blockType);
			if (toolbar && toolbar.view && toolbar.renderedView) {
				toolbarView = toolbar.view;
				toolbarKeys = toolbarView.keys();
				toolbarSettingsForKeys = block.mViewInstance.toolbarSettingsForKeys(toolbarKeys);
				toolbarView.updateToolbarUsingPropertiesForKeys(toolbarSettingsForKeys);
				toolbar.renderedView.removeClassName('hidden');
				toolbar.renderedView.up('.section').removeClassName('hidden');
				toolbarView.mBlockTarget = block;
				globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_DID_SHOW_BLOCK_TOOLBAR, toolbar);
			}
		}
	},
	// Handles key events in the main editor view. Supports keyboard navigation between
	// existing blocks and deleting blocks.
	_registerEventHandlers: function() {
		bindEventListeners(this, [
			'handleWindowMouseDown',
			'handleEditorBufferViewClick'
		]);
		Event.observe(window, 'mousedown', this.handleWindowMouseDown);
		globalEventDelegate().bulkRegisterDomResponderForEventByIdentifer([
			['click', 'wikieditor_top', this.handleEditorBufferViewClick],
			['click', 'wikieditor_bottom', this.handleEditorBufferViewClick]
		]);
		globalNotificationCenter().subscribe(CC.EntityTitle.NOTIFICATION_TITLE_DID_CHANGE, this.handlePageTitleDidChange.bind(this));
		globalNotificationCenter().subscribe('DID_RESTORE_ENTITY_REVISION', this.handlePageRestored.bind(this));
		var boundReconfigureEditorToolbar = this.handleToolbarShouldUpdateNotification.bind(this);
		globalNotificationCenter().subscribe(CC.WikiEditor.NOTIFICATION_DID_SELECT_ALL, boundReconfigureEditorToolbar);
		globalNotificationCenter().subscribe(CC.WikiEditor.NOTIFICATION_DID_DESELECT_ALL, boundReconfigureEditorToolbar);
		globalNotificationCenter().subscribe(CC.WikiEditor.NOTIFICATION_EDITOR_SHOULD_UPDATE_TOOLBAR, boundReconfigureEditorToolbar);
		globalNotificationCenter().subscribe(CC.WikiEditor.NOTIFICATION_EDITOR_WILL_LOSE_FOCUS, this.handleEditorWillLoseFocus.bind(this));
		globalNotificationCenter().subscribe(CC.WikiEditor.NOTIFICATION_BLOCK_CONTENTEDITABLE_DID_FOCUS, this.handleBlockFocusDidChange.bind(this));
		globalNotificationCenter().subscribe(CC.WikiEditor.NOTIFICATION_BLOCK_CONTENTEDITABLE_DID_BLUR, this.handleBlockFocusDidChange.bind(this));
		globalNotificationCenter().subscribe('AUTHENTICATION_LOGGED_OUT', this.flushAutosavedChanges.bind(this));
		window.onbeforeunload = this.handleWindowShouldUnload.bind(this);
	},
	// Unload handler for the editor if we're in edit mode.
	handleWindowShouldUnload: function() {
		if (this.mEditMode) return "_Editor.Unload.Warning".loc();
	},
	// Handles lost focus (e.g. when a toolbar is activated).
	handleEditorWillLoseFocus: function(inMessage, inObject, inOptExtras) {
		if (this.mActiveBlock) globalEditorTextSelectionDelegate().cacheSelection();
	},
	handleToolbarShouldUpdateNotification: function(inMessage, inObject, inOptExtras) {
		this.reconfigureEditorToolbar();
	},
	// Handles mouse down events on the window object. Responsible for block selection,
	// cancelling editing on any active blocks and hiding any active toolbar menus.
	handleWindowMouseDown: function(inEvent) {
		// If we're selecting, deselect everything first.
		if (this.mSelecting) this.handleDeselectAll();
		// If we're not in edit mode, bail.
		if (!this.mEditMode) return;
		// Otherwise handle toolbar/block activation.
		var toolbarElem = (this.mEditorView && this.mEditorView.mToolbarView) ? this.mEditorView.mToolbarView.$() : undefined;
		var activeToolbar = $$('.editor.toolbar .expanded, .editor.inline.popup.expanded').length > 0;
		var toolbarSource = toolbarElem ? Position.within(toolbarElem, inEvent.pointerX(), inEvent.pointerY()) : false;
		// If the event fired outside an active toolbar, collapse and resume editing.
		// We deliberately delay this so any mouse events on individual menu options
		// have enough time to fire.
		if (!toolbarSource && toolbarElem && activeToolbar) {
			setTimeout(function() {
				toolbarElem.select('.expanded').invoke('removeClassName', 'expanded');
				if (this.mActiveBlock) this.resumeEditing(this.mActiveBlock);
			}.bind(this), 200);
			return true;
		}
	},
	// Handles click events on the page buffer view (the view that wraps all top-level blocks).
	// We explicitly watch for events in this space so we can implicitly relocate the cursor to
	// the nearest top-level text block.
	handleEditorBufferViewClick: function(inEvent) {
		if (!this.mEditMode) return;
		Event.stop(inEvent);
		var top = inEvent.findElement('.buffer .top');
		var bottom = inEvent.findElement('.buffer .bottom');
		if (top || bottom) {
			block = top ? this.mPage.firstBlock() : this.mPage.lastBlock();
			before = top;
			after = bottom;
			moveToStart = top;
			moveToEnd = bottom;
		}
		return this.startEditing(block, {'moveToStart': moveToStart, 'moveToEnd': moveToEnd}, true);
	},
	// Handle a change in page title from the page title view.
	handlePageTitleDidChange: function(inMessage, inObject, inOptExtras) {
		var title = inOptExtras ? inOptExtras.title : undefined;
		this.mPage.setRecordPropertyForPath('longName', title);
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_PAGE_DID_CHANGE, this.mPage);
	},
	// Handles a restored page.
	handlePageRestored: function(inMessage, inObject, inOptExtras) {
		this.toggleEditMode(false);
		var entity = (inOptExtras && inOptExtras.entityObject);
		this._initializeInlineContent(entity);
	},
	// Handles a block focus change behind our back.
	handleBlockFocusDidChange: function(inMessage, inObject, inOptExtras) {
		logger().debug("handleBlockFocusDidChange: %o", inObject);
		if (inMessage == CC.WikiEditor.NOTIFICATION_BLOCK_CONTENTEDITABLE_DID_FOCUS) {
			return this.startEditing(inObject);
		}
	}
});

// A read-only instance of the editor. Supports multiple instances on a page.

CC.WikiEditor.ReadOnlyEditorController = Class.create(CC.WikiEditor.EditorController, {
	mEditorViewClass: 'CC.WikiEditor.ReadOnlyEditorView',
	mEditingService: null,
	// Override the read-write editor controller to limit behavior.
	_initialize: function(/* {options} */) {
		this.mIdentifer = (new CC.GuidBuilder()).toString();
		if (arguments && arguments.length > 0) Object.extend(this, arguments[0]);
		if (!this.mParentElement) return false;
		if (!this.mEditorView) {
			var konstructor = this.mEditorViewClass;
			this.mEditorView = CC.objectInstanceForPropertyPath(konstructor);
			if (!this.mEditorView) throw("Could not initialize main view for editor");
		}
		this.mParentElement.appendChild(this.mEditorView._render());
		this.mParentElement.select('.cc-entity-favorite-toggle').each(function(toggle) { new CC.EntityFavoriteToggle(toggle); });
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_EDITOR_READY, this);
		this._initializeInlineContent();
	},
	toggleEditMode: function() {
		return false;
	},
	restoreAutosavedEdits: function() {
		return false;
	},
	startEditing: function() {
		return false;
	},
	resumeEditing: function() {
		return false;
	},
	stopEditing: function() {
		return false;
	},
	savePage: function() {
		return false;
	},
	autosavePage: function() {
		return false;
	},
	handleSelectAll: function() {
		return false;
	},
	handleDeselectAll: function() {
		return false;
	},
	reconfigureEditorToolbar: function() {
		return false;
	},
	_registerEventHandlers: function() {
		return false;
	}
});

// Core editor view.

CC.WikiEditor.EditorView = Class.create(CC.Mvc.View, {
	mContent: null,
	render: function() {
		this.mBufferView = new CC.WikiEditor.EditorBufferView();
		this.mToolbarView = new CC.WikiEditor.EditorToolbarView();
		var childViews = [this.mBufferView, this.mToolbarView].invoke('_render');
		return Builder.node('div', {className: 'editor container wrapchrome'}, childViews);
	}
});

// Read only editor view.

CC.WikiEditor.ReadOnlyEditorView = Class.create(CC.WikiEditor.EditorView, {
	render: function() {
		return Builder.node('div', {className: 'editor read-only container wrapchrome'});
	}
});

// Editor mask view.

CC.WikiEditor.EditorBufferView = Class.create(CC.Mvc.View, {
	render: function() {
		return Builder.node('div', {id: 'wikieditor_buffer', className: 'page buffer chrome'}, [
			Builder.node('div', {id: 'wikieditor_top', className: 'top'}),
			Builder.node('div', {id: 'wikieditor_bottom', className: 'bottom'})
		]);
	}
});

// Editor toolbar view.

CC.WikiEditor.EditorToolbarView = Class.create(CC.Mvc.View, {
	render: function() {
		// Build out a container element with save/cancel buttons and our three contextual
		// toolbars (one for blocks, one for actions and one for containers). The editor
		// will populate this later.
		var toolbar = Builder.node('div', {className: 'editor toolbar chrome'}, [
			Builder.node('div', {className: 'contents'}, [
				Builder.node('div', {className: 'tools'}, [
					Builder.node('div', {className: 'section blocks'}),
					Builder.node('div', {className: 'section actions'}),
					Builder.node('div', {className: 'section containers'})
				]),
				// XXX buttons are temporarily disabled from tabindexing (rdar: 14841070 - Make the editor accessible)
				Builder.node('div', {className: 'buttons'}, [
					Builder.node('input', {type: 'button', className: 'undo', value: "_Editor.Undo.Title".loc(), title: "_Editor.Undo.Tooltip".loc(), tabindex: "-1"}),
					Builder.node('input', {type: 'button', className: 'cancel', value: "_Editor.Cancel.Title".loc(), title: "_Editor.Cancel.Tooltip".loc(), tabindex: "-1"}),
					Builder.node('input', {type: 'button', className: 'save', value: "_Editor.Save.Title".loc(), title: "_Editor.Save.Tooltip".loc(), tabindex: "-1"})
				])
			])
		]);
		// Cache each of the toolbar sections for easy reference.
		this.mBlockSectionParentElement = toolbar.down('.section.blocks');
		this.mActionSectionParentElement = toolbar.down('.section.actions');
		this.mContainerSectionParentElement = toolbar.down('.section.containers');
		// Hook up the undo button.
		Event.observe(toolbar.down('input.undo'), 'click', this.handleEditorToolbarUndo.bind(this));
		// Hook up the save and cancel buttons.
		Event.observe(toolbar.down('input.cancel'), 'click', this.handleEditorToolbarCancel.bind(this));
		Event.observe(toolbar.down('input.save'), 'click', this.handleEditorToolbarSave.bind(this));
		return toolbar;
	},
	handleEditorToolbarUndo: function(inEvent) {
		Event.stop(inEvent);
		textBlockDelegate().attemptUndo();
	},
	handleEditorToolbarCancel: function(inEvent) {
		Event.stop(inEvent);
		globalEditorController().flushAutosavedChanges();
		globalEditorController().restoreStashedContent();
		globalEditorController().toggleEditMode(false);
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_DID_CANCEL_EDITING, this.mPage);
	},
	handleEditorToolbarSave: function(inEvent) {
		dialogManager().showProgressMessage("_Editor.Notifications.Page.Checking.Status".loc());
		Event.stop(inEvent);
		var changesCallback = function() {
			dialogManager().hide();
			if (confirm("_Editor.Conflict.Save.Override".loc())) {
				globalEditorController().savePage(true);
			}
		};
		var noChangesCallback = function() {
			globalEditorController().savePage();
		};
		var errback = function(response) {
			dialogManager().hide();
			notifier().printErrorMessage("_Editor.Notifications.Page.Checking.Status.Error".loc());
		};
		globalEditorController().mEditingService.checkServerForEdits(changesCallback.bind(this), noChangesCallback.bind(this), errback.bind(this));
	},
	handleDidStartEditing: function() {
		if (browser().isMobileSafari()) {
			this.$().addClassName('displaying');
		} else {
			setTimeout(function() {
				this.$().addClassName('displaying');
			}.bind(this), 500);
		}
	}.observes(CC.WikiEditor.NOTIFICATION_DID_START_EDITING, true),
	handleDidFinishEditing: function() {
		this.$().removeClassName('displaying');
	}.observes(CC.WikiEditor.NOTIFICATION_DID_FINISH_EDITING, true)
});
