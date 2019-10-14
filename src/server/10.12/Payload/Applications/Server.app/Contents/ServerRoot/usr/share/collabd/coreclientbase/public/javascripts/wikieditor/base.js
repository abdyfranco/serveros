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
//= require "./ext/array.js"
//= require "./ext/element.js"
//= require "./ext/fixtures.js"
//= require "./ext/random.js"

// Notifications.

CC.WikiEditor.NOTIFICATION_EDITOR_READY = 'EDITOR_READY';
CC.WikiEditor.NOTIFICATION_EDITOR_DID_TOGGLE_DEBUG_MODE = 'EDITOR_DID_TOGGLE_DEBUG_MODE';
CC.WikiEditor.NOTIFICATION_EDITOR_WILL_LOSE_FOCUS = 'EDITOR_WILL_LOSE_FOCUS';
CC.WikiEditor.NOTIFICATION_EDITOR_SHOULD_UPDATE_TOOLBAR = 'EDITOR_SHOULD_UPDATE_TOOLBAR';
CC.WikiEditor.NOTIFICATION_DID_REGISTER_BLOCK_TYPE = 'DID_REGISTER_BLOCK_TYPE';
CC.WikiEditor.NOTIFICATION_DID_UNREGISTER_BLOCK_TYPE = 'DID_UNREGISTER_BLOCK_TYPE';
CC.WikiEditor.NOTIFICATION_PAGE_WAS_INITIALIZED = 'PAGE_WAS_INITIALIZED';
CC.WikiEditor.NOTIFICATION_PAGE_DID_CHANGE = 'PAGE_DID_CHANGE';
CC.WikiEditor.NOTIFICATION_PAGE_DID_MIGRATE = 'PAGE_DID_MIGRATE';
CC.WikiEditor.NOTIFICATION_DID_START_EDITING = 'DID_START_EDITING';
CC.WikiEditor.NOTIFICATION_DID_FINISH_EDITING = 'DID_FINISH_EDITING';
CC.WikiEditor.NOTIFICATION_DID_CANCEL_EDITING = 'DID_CANCEL_EDITING';
CC.WikiEditor.NOTIFICATION_DID_SELECT_ALL = 'DID_SELECT_ALL';
CC.WikiEditor.NOTIFICATION_DID_DESELECT_ALL = 'DID_DESELECT_ALL';
CC.WikiEditor.NOTIFICATION_WILL_SAVE_PAGE = 'WILL_SAVE_PAGE';
CC.WikiEditor.NOTIFICATION_DID_SAVE_PAGE = 'DID_SAVE_PAGE';
CC.WikiEditor.NOTIFICATION_DID_SAVE_PAGE_WITH_GUID = 'DID_SAVE_PAGE_WITH_GUID';
CC.WikiEditor.NOTIFICATION_ERROR_SAVING_PAGE = 'ERROR_SAVING_PAGE';
CC.WikiEditor.NOTIFICATION_DID_SHOW_BLOCK_TOOLBAR = 'DID_SHOW_BLOCK_TOOLBAR';
CC.WikiEditor.NOTIFICATION_DID_HIDE_BLOCK_TOOLBAR = 'DID_HIDE_BLOCK_TOOLBAR';
CC.WikiEditor.NOTIFICATION_DID_RESTORE_OBJECT_FROM_LOCAL_STORAGE = 'DID_RESTORE_OBJECT_FROM_LOCAL_STORAGE';
CC.WikiEditor.NOTIFICATION_BLOCK_CONTENTEDITABLE_DID_FOCUS = 'BLOCK_CONTENTEDITABLE_DID_FOCUS';
CC.WikiEditor.NOTIFICATION_BLOCK_CONTENTEDITABLE_DID_BLUR = 'BLOCK_CONTENTEDITABLE_DID_BLUR';

// Prediction mixin for blocks. Predicts the next block in a container (page or block).

CC.WikiEditor.Mixins.Prediction = {
	// Predict like a duck.
	mSupportsPrediction: true,
	// Predicts and returns a hash of prediction information, including the blockType, and any
	// attributes for the block e.g. {blockType: 'text', attributes: {placeholder: true}}.
	predictNextBlock: function() {}
};

// Comparable mixin for block. Used for sorting.

CC.WikiEditor.Mixins.Comparable = {
	// Compare like a duck.
	mIsComparable: true,
	// Returns a comparable value for this block.
	getComparableValue: function() {}
};

// View mixin that provides confirm to delete behavior.

CC.WikiEditor.Mixins.AskBeforeDeleting = {
	mShouldAskBeforeDeleting: true,
	mDeleteDialogTitle: "Delete",
	mDeleteDialogDescription: "Are you sure you want to delete?",
	handleDeleteButtonClick: function(inEvent) {
		if (inEvent) Event.stop(inEvent);
		// Bail if we're not editing.
		if (!globalEditorController().mEditMode) return true;
		// First draw the dialog, if we need to.
		if ($('block_delete_dialog')) Element.remove('block_delete_dialog');
		dialogManager().drawDialog('block_delete_dialog', [(this.mDeleteDialogDescription || "").loc()], "_Editor.Block.Table.Dialog.Delete.OK".loc(), null, (this.mDeleteDialogTitle || "").loc());
		// Show the delete block dialog.
		dialogManager().show('block_delete_dialog', null, function() {
			globalEditorController().removeBlock(this.mContent);
		}.bind(this), undefined, false, undefined, false);
	}
};

// Abstract block container controller.

CC.WikiEditor.AbstractBlockContainer = Class.create(CC.Mvc.ObjectController, CC.Notifications.Mixins.SupportsOptimizedNotifications, CC.WikiEditor.Mixins.Prediction, {
	// Can this block container actually contain blocks?
	mIsContainer: true,
	// A cache of block controllers keyed by guid.
	mBlocks: null,
	// The parent abstract block container parent for this container.
	mParentContainer: null,
	// All abstract block containers are autosave aware.
	mIsAutosaveAware: true,
	initialize: function($super) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		this.mBlocks = new Hash();
		return this;
	},
	// Notifications optimization.
	getNotificationsIdentifer: function() {
		return this.getRecordPropertyForPath('guid');
	},
	// Adds a new child block to this block container. It is the responsibility of a blocks
	// container to render and position a block once a DID_ADD_BLOCK notification is recieved.
	// The recommended way to do this is to implement handleDidAddBlock in your view.
	addBlock: function(inBlock, inOptPosition, inOptAddQuietly, inOptDoNotTriggerContainerChanges, inOptWorkingElement) {
		if (!inBlock || !CC.kindOf(inBlock, CC.WikiEditor.Block)) return undefined;
		// Update the local mBlocks property for this controller.
		this.mBlocks.set(inBlock.getRecordPropertyForPath('guid'), inBlock);
		// Mark this container as being the container for our new block.
		inBlock.mParentContainer = this;
		// Notify and return.
		this.handleDidAddBlock({'block': inBlock, 'position': inOptPosition, 'quietly': inOptAddQuietly, 'workingElement': inOptWorkingElement});
		if (inOptDoNotTriggerContainerChanges != true) {
			this.handleBlocksDidChange({'added': inBlock, 'quietly': inOptAddQuietly, 'workingElement': inOptWorkingElement});
		}
		return inBlock;
	},
	// Removes a child block from this block container, if it exists.
	removeBlock: function(inBlock, inOptControlledExplosion, inOptRemoveQuietly, inOptDoNotTriggerContainerChanges) {
		if (!inBlock || !CC.kindOf(inBlock, CC.WikiEditor.Block)) return false;
		// First remove the block view in an optional puff of smoke.
		var blockView = inBlock.mViewInstance;
		if (!blockView && !blockView.mParentElement) return true;
		if (inBlock.isExplosive() && !inOptControlledExplosion) smokey().showOverElement(blockView.$());
		var blockViewElement = blockView.$();
		if (blockViewElement && blockViewElement.parentNode) blockViewElement.parentNode.removeChild(blockViewElement);
		// Notify.
		this.handleDidRemoveBlock({'block': inBlock, 'quietly': inOptRemoveQuietly});
		if (inOptDoNotTriggerContainerChanges != true) {
			this.handleBlocksDidChange({'removed': inBlock, 'quietly': inOptRemoveQuietly});
		}
		// Nuke the unwanted controller.
		this.mBlocks.unset(inBlock.getRecordPropertyForPath('guid'));
	},
	// Add/remove block notification callbacks. You should render and position child blocks here.
	handleDidAddBlock: function(inOptInfo) {
		if (inOptInfo.block) inOptInfo.block.handleFinishedAddingBlock();
	},
	handleFinishedAddingBlock: function(inOptInfo) { /* Interface */ },
	handleDidRemoveBlock: function(inOptInfo) {
		if (inOptInfo.block) inOptInfo.block.handleFinishedRemovingBlock();
	},
	handleFinishedRemovingBlock: function(inOptInfo) { /* Interface */ },
	handleBlocksDidChange: function(inOptInfo) {
		if (this.mBlocksDidChangeTimer) clearTimeout(this.mBlocksDidChangeTimer);
		// Update the blockGUIDs property for this container. We defer setting this key to buffer
		// rapid changes, and give any views a chance to render before we query the DOM.
		this.mBlocksDidChangeTimer = setTimeout(function() {
			if (!inOptInfo || (inOptInfo && !inOptInfo.quietly)) {
				var blockGUIDs = this.computeBlockGUIDs();
				this.setRecordPropertyForPath('extendedAttributes.blockGUIDs', blockGUIDs);
			}
		}.bind(this), 100);
	},
	// Returns an (ordered) array of child block GUIDs for this container. Your
	// custom block controller can choose to override this. The default implementation
	// plucks GUIDs from the for attribute of every direct-descendant block view.
	computeBlockGUIDs: function() {
		if (!this.mViewInstance || !this.mViewInstance.$()) return [];
		var _v = this.mViewInstance.$();
		var blockViews = _v.select('.block'), nestedBlockViews = _v.select('.block .block');
		return stringArrayDifference(blockViews.invoke('getAttribute', 'data-guid'), nestedBlockViews.invoke('getAttribute', 'data-guid'));
	},
	// Returns the first or last block in this container. Returns undefined if
	// this container is empty. Your block should implement these methods to
	// support keyboard navigation between block containers.
	firstBlock: function() { /* Interface */ },
	lastBlock: function() { /* Interface */ },
	// Predicts the next block in this container. The default prediction is just
	// a placeholder text block. Accepts an optional previous block (usually the
	// currently active block) that can be used to calculate the prediction.
	// Also accepts an inOptForceEmpty parameter that should override any template
	// or placeholder behavior of the new block.
	predictNextBlock: function(inOptPreviousBlock, inOptIsPlaceholder) {
		var defaultPrediction = {blockType: 'text', attributes: {}};
		if (inOptIsPlaceholder) defaultPrediction.attributes = {content: "_Editor.Block.Text.Placeholder".loc(), placeholder: true};
		var prediction;
		// If we have an block to use as a context, and that block implements the prediction
		// mixin, delegate to that.
		if (inOptPreviousBlock && inOptPreviousBlock.mSupportsPrediction) prediction = inOptPreviousBlock.predictNextBlock(undefined, inOptIsPlaceholder);
		if (!prediction) prediction = defaultPrediction;
		return prediction;
	},
	// Restores an array of changset tuples. Each changeset corresponds to a change to the model
	// object backing your controller. An appropiate implementation of this method will update the
	// state of the view (and controller if needed) and push the changeset into the content store
	// by calling setRecordPropertyForPath on your object controller. We don't automatically push
	// the change back into the store on restore, because the changeset could be tracking transient
	// state you want to know about, but not necessarily persist.
	restore: function(inChangesets) {
		// Remove any child blocks that were removed.
		var changesetKey, changesetValue, changesetIdx, changes;
		for (var changesetIdx = 0; changesetIdx < inChangesets.length; changesetIdx++) {
			changes = inChangesets[changesetIdx];
			if (changes.length < 2) return;
			changesetKey = changes[0];
			changesetValue = changes[1];
			if (changesetKey == 'extendedAttributes') {
				var currentBlockGUIDs = this.getRecordPropertyForPath('extendedAttributes.blockGUIDs');
				var blockGUIDs = changesetValue['blockGUIDs'];
				if (!blockGUIDs || blockGUIDs.length == 0) continue;
				// Calculate a set difference between existing blocks on the page, and those in
				// the changeset we're restoring. Any blocks that are in the existing set, but not
				// in the new set are deleted.
				var difference = stringArrayDifference(currentBlockGUIDs, blockGUIDs), differenceIdx, guid;
				for (var differenceIdx = 0; differenceIdx < difference.length; differenceIdx++) {
					guid = difference[differenceIdx];
					if (currentBlockGUIDs.include(guid)) {
						this.removeBlock(this.mBlocks.get(guid), true, false, true);
					}
				}
			}
			this.setRecordPropertyForPath(changesetKey, changesetValue);
		}
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_DID_RESTORE_OBJECT_FROM_LOCAL_STORAGE, this, {
			'changesets': inChangesets,
			'object': this
		});
	}
});

// Simple page controller.

CC.WikiEditor.Page = Class.create(CC.WikiEditor.AbstractBlockContainer, {
	mIsContainer: true,
	firstBlock: function() {
		var blockGUIDs = this.computeBlockGUIDs();
		return this.mBlocks.get(blockGUIDs.first());
	},
	lastBlock: function() {
		var blockGUIDs = this.computeBlockGUIDs();
		return this.mBlocks.get(blockGUIDs.last());
	},
	// Autosave support.
	restore: function($super, inChangesets) {
		var changesetKey, changesetValue, changesetIdx, changes;
		for (changesetIdx = 0; changesetIdx < inChangesets.length; changesetIdx++) {
			changes = inChangesets[changesetIdx];
			if (changes.length < 2) continue;
			changesetKey = changes[0];
			changesetValue = changes[1];
			// Restore page titles and child block ordering.
			if (changesetKey == 'longName') {
				this.setRecordPropertyForPath('longName', changesetValue);
			} else if (changesetKey == 'extendedAttributes') {
				if (changesetValue['blockGUIDs'] && (changesetValue['blockGUIDs'] != this.getRecordPropertyForPath('extendedAttributes.blockGUIDs'))) {
					var blockGUIDs = changesetValue['blockGUIDs'];
					var blockElements = this.mViewInstance.$().up().select('.page.blocks > .block');
					var removedBlocks = {}, removedBlock;
					// Remove and stash any block elements we've already rendered.
					for (var blockElementIdx = 0; blockElementIdx < blockElements.length; blockElementIdx++) {
						removedBlock = Element.remove(blockElements[blockElementIdx]);
						removedBlocks[removedBlock.getAttribute('data-guid')] = removedBlock;
					}
					// Restore the block elements in order.
					for (var blockGUIDIdx = 0; blockGUIDIdx < blockGUIDs.length; blockGUIDIdx++) {
						removedBlock = removedBlocks[blockGUIDs[blockGUIDIdx]];
						if (removedBlock) this.mViewInstance.$().appendChild(removedBlock);
					}
				}
			}
		}
		$super(inChangesets);
	},
	handleDidAddBlock: function($super, inOptInfo) {
		if (inOptInfo && inOptInfo.block) {
			var position = (inOptInfo.position || {'bottom': (inOptInfo.workingElement || this.mViewInstance.$())});
			blockRenderingDelegate().renderAndInsertBlockAtPosition(inOptInfo.block, position);
		}
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
	}
});

// Block controller shuttling info between a CC.WikiEditor.BlockView instance and
// a CC.WikiEditor.BlockModel model.

CC.WikiEditor.Block = Class.create(CC.WikiEditor.AbstractBlockContainer, {
	mBlockView: 'CC.WikiEditor.BlockView',
	// Is this block currently being edited?
	mCurrentlyEditing: false,
	// Is this block a container block (e.g. a table).
	mIsContainer: false,
	// Returns a boolean if this block is empty. Your subclass should implement this in a way 
	// that is compatible with your custom block structure.
	isEmpty: function() {
		return false;
	},
	// Returns true if this block should be treated as a template/placeholder.
	isPlaceholder: function() {
		return this.getRecordPropertyForPath('extendedAttributes.placeholder');
	},
	// Returns a boolean if this block should be removed with an explosion.
	isExplosive: function() {
		return true;
	},
	isEditable: function() {
		return (globalEditorController().mEditMode || false);
	},
	isLocked: function() {
		return false;
	},
	// Called when this block becomes active.
	handleDidStartEditing: function(inOptInfo) {
		this.mCurrentlyEditing = true;
		this.mViewInstance.mParentElement.addClassName('editing');
		this.mViewInstance.becomeFirstResponder();
	},
	// Called when this block gets reactivated.
	handleDidResumeEditing: function(inOptInfo) {},
	// Called when this block is deactivated.
	handleDidStopEditing: function(inOptInfo) {
		if (!this.mCurrentlyEditing) return true;
		this.mCurrentlyEditing = false;
		this.mViewInstance.mParentElement.removeClassName('editing');
		this.mViewInstance.loseFirstResponder();
	}
});

// Editor toolbar mixin. If your block needs to enable or disable menu options
// depending on settings on your block, or selection within your block, you should
// implement this mixin.

CC.WikiEditor.Mixins.Toolbar = {
	// Returns a hash of properties for a set of toolbar keys for this block.
	// The result is a hash keyed by toolbar key. Each value is expected to have
	// a selected and enabled boolean flag that is determined from the state of
	// your block. When a toolbar key is selected, it is expected that that option
	// is applied to your block, and when it is disabled, it is expected that that
	// toolbar option is no longer applicable to your block.
	toolbarSettingsForKeys: function(inToolbarKeys) {
		var result = new Hash(), toolbarKeysIdx, key;
		for (toolbarKeysIdx = 0; toolbarKeysIdx < inToolbarKeys.length; toolbarKeysIdx++) {
			key = inToolbarKeys[toolbarKeysIdx];
			result.set(key, {
				'enabled': true,
				'selected': false
			});
		}
		return result;
	}
};

// Block navigation delegate mixin. If your block needs to support complex keyboard
// navigation, you should implement this in your view class. Key events captured by
// the editor will be converted into calls to your receiver if it includes this mixin.

CC.WikiEditor.NOTIFICATION_BLOCK_DID_MOVE_TO_START = 'BLOCK_DID_MOVE_TO_START';
CC.WikiEditor.NOTIFICATION_BLOCK_DID_MOVE_TO_END = 'NOTIFICATION_BLOCK_DID_MOVE_TO_END';
CC.WikiEditor.NOTIFICATION_BLOCK_DID_MOVE_RIGHT = 'NOTIFICATION_BLOCK_DID_MOVE_RIGHT';
CC.WikiEditor.NOTIFICATION_BLOCK_DID_MOVE_LEFT = 'NOTIFICATION_BLOCK_DID_MOVE_LEFT';
CC.WikiEditor.NOTIFICATION_BLOCK_DID_MOVE_UP = 'NOTIFICATION_BLOCK_DID_MOVE_UP';
CC.WikiEditor.NOTIFICATION_BLOCK_DID_MOVE_DOWN = 'NOTIFICATION_BLOCK_DID_MOVE_DOWN';

CC.WikiEditor.Mixins.Navigation = {
	// Navigate like a duck.
	mSupportsNavigation: true,
	moveToStart: function() {
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_BLOCK_DID_MOVE_TO_START, this);
	},
	moveToEnd: function() {
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_BLOCK_DID_MOVE_TO_END, this);
	},
	moveRight: function() {
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_BLOCK_DID_MOVE_RIGHT, this);
	},
	moveLeft: function() {
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_BLOCK_DID_MOVE_LEFT, this);
	},
	moveUp: function() {
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_BLOCK_DID_MOVE_UP, this);
	},
	moveDown: function() {
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_BLOCK_DID_MOVE_DOWN, this);
	},
	focusedAtStart: function() {},
	focusedAtEnd: function() {}
};

// Base view class for any block container.

CC.WikiEditor.AbstractBlockContainerView = Class.create(CC.Mvc.View, {
	// TODO
});

// Standard view for a page.

CC.WikiEditor.PageView = Class.create(CC.WikiEditor.AbstractBlockContainerView, {
	mEditing: false,
	registerEventHandlers: function() {
		globalNotificationCenter().subscribe(CC.WikiEditor.NOTIFICATION_PAGE_DID_CHANGE, this.handlePageDidChange.bind(this));
	},
	render: function() {
		var elem = Builder.node('div', {className: 'page blocks selectable wrapchrome'});
		var pageGUID = this.mContent.getRecordPropertyForPath('guid');
		if (pageGUID) elem.setAttribute('data-guid', pageGUID);
		var pageTinyID = this.mContent.getRecordPropertyForPath('tinyID');
		if (pageTinyID) elem.setAttribute('data-tiny-id', pageTinyID);
		var ownerGUID = this.mContent.getRecordPropertyForPath('ownerGUID');
		if (ownerGUID) elem.setAttribute('data-owner-guid', ownerGUID);
		return elem;
	},
	handlePageDidChange: function(inMessage, inObject, inOptExtras) {
		if (inObject) {
			var isMigrated = inObject.getRecordPropertyForPath('extendedAttributes.migrated');
			if (isMigrated) {
				this.$().addClassName('migrated');
			} else {
				this.$().removeClassName('migrated');
			}
		}
	}
});

// Standard view for a block.

CC.WikiEditor.BlockView = Class.create(CC.WikiEditor.AbstractBlockContainerView, CC.WikiEditor.Mixins.Toolbar, CC.Notifications.Mixins.SupportsOptimizedNotifications, {
	isEditable: function() { return this.mContent.isEditable(); },
	isLocked: function() { return this.mContent.isLocked(); },
	// Returns a unique identifer for this block view that can be used for delegate event registration.
	// You can use this identifer as a prefix for sub-elements of your view that use delegate-based
	// events, but you should not normally need to override this implementation.
	mCachedEventDelegateIdentifer: null,
	mCachedBlockGUID: null,
	mCachedBlockType: null,
	getEventDelegateIdentifer: function(inOptForceRecalcuate) {
		if (!inOptForceRecalcuate && this.mCachedEventDelegateIdentifer) return this.mCachedEventDelegateIdentifer;
		if (inOptForceRecalcuate || !this.mCachedBlockGUID) this.mCachedBlockGUID = this.mContent.getRecordPropertyForPath('guid');
		if (inOptForceRecalcuate || !this.mCachedBlockType) this.mCachedBlockType = this.mContent.getRecordPropertyForPath('blockType');
		return (this.mCachedEventDelegateIdentifer = "%@-block-view-%@".fmt(this.mCachedBlockType, this.mCachedBlockGUID));
	},
	// Notifications optimization for this view.
	getNotificationsIdentifer: function() {
		return this.getEventDelegateIdentifer();
	},
	// Internal renderAsHTML function wrapping a block view in required editor chrome.
	// You should not override or call this function directly.
	_renderAsHTML: function() {
		var blockGUID = this.mContent.mRecord.guid, blockType = this.mContent.mRecord.blockType;
		var extraClassNames = this.mContent.getRecordPropertyForPath('extendedAttributes.extraClassNames');
		extraClassNames = (extraClassNames ? (" " + extraClassNames) : "");
		var eventDelegateIdentifer = this.getEventDelegateIdentifer();
		var blockHTML = "<div id=\"%@\" class=\"block wrapchrome %@ %@%@\" data-guid=\"%@\" data-type=\"%@\" contentEditable=\"false\">".fmt(this.getEventDelegateIdentifer(), blockType, blockGUID, extraClassNames, blockGUID, blockType) +
			"<div id=\"" + eventDelegateIdentifer + "-wrapper\" class=\"wrapper wrapchrome\"><div id=\"" + eventDelegateIdentifer + "-inner\" class=\"inner wrapchrome\"><div id=\""+
			eventDelegateIdentifer + "-inner-delete\" class=\"delete clickable chrome\">" + "_Editor.Delete.Block".loc() + "</div><div class=\"lock chrome\"><div class=\"lockedby\"></div></div>" +
			"<a id=\"" + eventDelegateIdentifer + "-inner-debug\" class=\"debug chrome\" title=\"" + blockGUID + "\">" + "_Editor.Block.Debug".loc() + "</a><div class=\"content selectable wrapchrome\">" +
			(this.renderAsHTML() || "") + "</div></div></div></div>";
		return [blockGUID, blockHTML];
	},
	renderAsHTML: function() { /* Interface */ },
	_registerEventHandlers: function() {
		bindEventListeners(this, [
			'handleParentElementClick',
			'handleParentElementMouseDown',
			'handleDeleteButtonClick'
		]);
		var eventDelegateIdentifer = this.getEventDelegateIdentifer();
		globalEventDelegate().bulkRegisterDomResponderForEventByIdentifer([
			['click', eventDelegateIdentifer + "-wrapper", this.handleParentElementClick],
			['mousedown', eventDelegateIdentifer + "-wrapper", this.handleParentElementMouseDown],
			['click', eventDelegateIdentifer + "-inner-delete", this.handleDeleteButtonClick]
		]);
		this.registerEventHandlers();
	},
	handleParentElementClick: function(inEvent) {
		if (!this.isEditable()) return true;
		Event.stop(inEvent);
		globalEditorController().startEditing(this.mContent, {focus: false});
	},
	handleDeleteButtonClick: function(inEvent) {
		Event.stop(inEvent);
		globalEditorController().removeBlock(this.mContent);
	},
	handleParentElementMouseDown: function(inEvent) { /* Interface */ }
});

// Block rendering delegate. Responsible for rendering and placing a block at a specific location
// on the page, either at the top-level or inside a container. Supports Prototype notation for
// element positioning, e.g. {'after': element}, but uses contentEditable insertHTML commands to
// ensure page changes are included in the browser undo/redo stack.

CC.WikiEditor.BlockRenderingDelegate = Class.createWithSharedInstance('blockRenderingDelegate');
CC.WikiEditor.BlockRenderingDelegate.prototype = {
	mTemporaryRenderingMarkerClassName: 'wikieditor-temporary-rendering-marker',
	initialize: function() {},
	// Renders a block to an HTML fragment inserting and replacing the current document selection.
	// Returns the newly added element where the block was successfully added, and false otherwise.
	renderAndInsertBlock: function(inBlock) {
		return this._renderAndInsertBlock(inBlock, undefined, true);
	},
	// Renders a block to an HTML fragment inserting it at a given position.
	renderAndInsertBlockAtPosition: function(inBlock, inPosition) {
		return this._renderAndInsertBlock(inBlock, inPosition, false);
	},
	// Internal block rendering method. Do not call yourself.
	_renderAndInsertBlock: function(inBlock, inOptPosition, inOptUseContentEditableMethods) {
		if (!inBlock || !CC.kindOf(inBlock, CC.WikiEditor.Block) || !inBlock.mViewInstance) {
			logger().error("Cannot append an invalid block or a block with no view instance (%o)", inBlock);
			return undefined;
		}
		if (!inOptPosition && !inOptUseContentEditableMethods) {
			logger().error("Cannot append a block to an unknown position or without an active selection");
			return undefined;
		}
		// Render the fragment.
		var result = inBlock.mViewInstance._renderAsHTML(), identifer, markup, elements, element;
		identifer = result[0], markup = result[1];
		logger().debug("blockRenderingDelegate markup: %@", markup);
		if (inOptUseContentEditableMethods) {
			var range = globalEditorTextSelectionDelegate().getSelectionAsRange();
			if (!range) {
				logger().debug("Could not append rendered block because there is no selection");
				return undefined;
			}
			if (browser().isIE()) {
				var range = globalEditorTextSelectionDelegate().getSelectionAsRange();
				if (!range) {
					logger().debug("Could not append rendered block because there is no selection");
					return undefined;
				}
				browser().pasteHTMLForIE(range, markup);
			}
			else {
				if (!document.queryCommandEnabled('inserthtml')) {
					logger().debug("Could not append rendered block because queryCommandEnabled returned false for insertHTML");
					return undefined;
				}
				// Insert the rendered view.
				document.execCommand('inserthtml', false, markup);
			}
		} else {
			var position, positionKey, positionValue, position;
			// Determine the position and the container.
			positionHash = $H(inOptPosition);
			positionKey = positionHash.keys().first();
			if (!positionKey || !positionHash.get(positionKey)) {
				logger().error("Invalid position specified when adding block (%o)", inOptPosition);
				return undefined;
			}
			positionValue = positionHash.get(positionKey);
			// Support passing a block, a view or an anchoring DOM element.
			if (CC.kindOf(positionValue, CC.WikiEditor.Block)) positionValue = positionValue.mViewInstance.$();
			if (CC.kindOf(positionValue, CC.Mvc.View)) positionValue = positionValue.$();
			// Append the rendered block directly to the document using an insertion.
			position = {};
			position[positionKey] = markup;
			element = fragmentSafeElementInsert(positionValue, position)
		}
		// Query and return the newly added DOM node.
		if (!element) {
			elements = document.getElementsByClassName(identifer);
			if (elements && elements.length > 0) element = $(elements.item(0));
			if (!element) return undefined;
		}
		// Enforce contentEditable on the root element.
		element.setAttribute('contentEditable', false);
		// Remove the temporary class name before proceeding.
		element.removeClassName(identifer);
		// Manually fire a rendered notification.
		inBlock.mViewInstance.handleDidRenderView({'element': element});
		// Return the newly added view element.
		return element;
	}
};

// Workaround for 9272663
// An abstract view class for non-text-block views.
 
CC.WikiEditor.NonTextBlockView = Class.create(CC.WikiEditor.BlockView, {
	handleParentElementMouseDown: function(inEvent) {
		if (this.mCachedBlockType == 'text' || this.mCachedBlockType == 'sandbox') return;
		var closestParentBlockElement = this.$().up('.block');
		if (!closestParentBlockElement || (closestParentBlockElement.getAttribute('data-type') != 'text')) return;
		// Did the event originate exactly on a .wrapper element.
		var source = Event.element(inEvent);
		if (!source.hasClassName('.wrapper')) return;
		// 9272663
		// Stop the event since we'll simulate a result.
		Event.stop(inEvent);
		// If this block is a non-text block, and we get a mousedown event on the block wrapper
		// element, we need to simulate a cursor. Divide the receiving .wrapper element into three
		// regions; the whitespace on the left side of the block (minus any bottom padding on the
		// content), the whitespace on the right side of the block (minus any bottom padding on the
		// content) and the strip of padding along the bottom of the block (if it exists). Calculate
		// which region the mouse event originated in.
		var wrapper = this.$('.wrapper');
		var pointerX = inEvent.pointerX();
		var pointerY = inEvent.pointerY();
		var position = Element.cumulativeOffset(wrapper);
		position.top = (position.top - wrapper.up('#main').scrollTop);
		var wrapperLayout = Element.getLayout(wrapper);
		var bounds = {
			xMin: position.left,
			xMax: position.left + wrapperLayout.get('padding-box-width'),
			yMin: position.top,
			yMax: position.top + wrapperLayout.get('padding-box-height')
		};
		// The mid-point is the mid point of the inner block content, or the right bound of
		// block view content (whichever is smaller and leftmost).
		var inner = wrapper.down('.inner');
		var innerLayout = Element.getLayout(inner);
		var midPoint = Math.min((bounds.xMax - bounds.xMin) / 2, (innerLayout.get('left') + (innerLayout.get('width') / 2)));
		var bottom = ((pointerX >= bounds.xMin && pointerX <= bounds.xMax) && (pointerY >= (bounds.yMax - wrapperLayout.get('padding-bottom')) && pointerY <= bounds.yMax));
		var left = ((pointerX >= bounds.xMin && pointerX <= (bounds.xMin + midPoint)) && (pointerY >= bounds.yMin && pointerY <= bounds.yMax));
		var right = ((pointerX >= (bounds.xMin + midPoint) && pointerX <= bounds.xMax) && (pointerY >= bounds.yMin && pointerY <= bounds.yMax));
		// Select the previous block if we detected a click in the content left padding, otherwise
		// select the next block.
		var before, after, moveToStart, moveToEnd;
		before = moveToEnd = (left && !bottom);
		after = moveToStart = !before;
		// Position the cursor before or after this block view.
		var wrapperSpan = Element.wrap(this.$(), 'div');
		wrapperSpan.focus();
		if (before) {
			globalEditorTextSelectionDelegate().moveCursorToStart(wrapperSpan);
		} else {
			globalEditorTextSelectionDelegate().moveCursorToEnd(wrapperSpan);
		}
		logger().debug("handleParentElementMouseDown (before? %o after? %o moveToStart? %o moveToEnd? %o)", before, after, moveToStart, moveToEnd);
		return true;
	}
});

// Editor or contextual toolbar entry for a block.

CC.WikiEditor.EDITOR_TOOLBAR_ITEM_STYLE_POPUP = 'popup';
CC.WikiEditor.EDITOR_TOOLBAR_ITEM_STYLE_SELECT = 'select';
CC.WikiEditor.EDITOR_TOOLBAR_ITEM_STYLE_SEGMENTED = 'segmented';

CC.WikiEditor.EditorToolbarItem = Class.create(CC.Object, {
	// Identifier for this toolbar item.
	mKey: null,
	// Display title and tooltip for this item.
	mDisplayTitle: null,
	mTooltip: null,
	// Is this toolbar item enabled?
	mIsEnabled: true,
	// Is this toolbar action a block-level operation (e.g. alignment)?
	mBlockLevelOperation: false,
	// An array of editor toolbar sub-items.
	mSubMenuItems: [],
	// The style of this toolbar item.
	mToolbarStyle: null,
	// Action to trigger when this menu item is selected, and
	// the target that will handle it.
	mAction: null,
	mTarget: null
});

// Toolbar instance representing contextual toolbar entry for a particular block.
// Each toolbar manages one or more EditorToolbarItem instances.

CC.WikiEditor.BlockToolbar = Class.create(CC.Object, {
	mToolbarItems: []
});

// Editor toolbar delegate. Responsible for marshaling requests between the editor
// toolbar and the global editor instance (mostly adding new blocks).

CC.WikiEditor.EditorToolbarDelegate = Class.createWithSharedInstance('editorToolbarDelegate');
CC.WikiEditor.EditorToolbarDelegate.prototype = {
	initialize: function() {},
	addBlock: function(/* [arguments] */) {
		// If the editor is tracking a selection, remove it
		if (globalEditorController().mSelecting) globalEditorController()._removeExistingSelection();
		// If we're editing a block, stash it away.
		var previouslyActiveBlock = globalEditorController().mActiveBlock;
		// Add a new block of type inBlockType.
		var newBlock = globalEditorController().addBlock.apply(globalEditorController(), arguments);
		// Return the newly added block.
		return newBlock;
	}
};

// Inline toolbar view used for the add block toolbar, and contextual toolbars for
// content block and conxtainer blocks. Expects an mContent object before rendering,
// and that mContentObject should have an mToolbarItems array of editor toolbar item
// instances (CC.WikiEditor.EditorToolbarItem).

CC.WikiEditor.EditorInlineToolbarView = Class.create(CC.Mvc.View, {
	// The target for actions of this toolbar. This property is considered
	// to be bound to the currently active block. The editor is responsible
	// for updating this property depending on the currently focused block.
	mBlockTarget: null,
	// Automagically renders a toolbar view.
	render: function() {
		if (!this.mContent || !this.mContent.mToolbarItems || this.mContent.mToolbarItems.length == 0) return Builder.node('span', {className: 'chrome'}, "_Editor.Toolbar.Empty.Placeholder".loc());
		// Transforms an array of menu items into a <ul> tag.
		var $ul = function(inItems, inOptParentItem, inOptBlockIdentifer, inOptIsTopLevel) {
			var classNames = ['items'];
			if (inOptBlockIdentifer) classNames.push('%@block'.fmt(inOptBlockIdentifer));
			if (inOptIsTopLevel) classNames.push('chrome');
			var ul = Builder.node('ul', {className: classNames.join(' ')});
			for (var i = 0; i < inItems.length; i++) {		
				ul.appendChild($li(inItems[i], inOptIsTopLevel, inOptParentItem));
				if (browser().isMobileSafari()) ul.setAttribute('role', 'presentation');
			}
			return ul;
		}.bind(this);
		// Transforms an individual menu item into a single <li> tag, or an <li> tag
		// with a nested <ul> tag inside. Recursively builds a menu.
		var $li = function(inItem, inOptIsTopLevel, inOptParent) {
			var attributes = {};
			if (inItem.mTooltip) attributes.title = inItem.mTooltip;
			var classNames = ['item'];
			if (inOptIsTopLevel) classNames.push('toplevel');
			if (inItem.mKey) {
				attributes.name = inItem.mKey;
				classNames.push(inItem.mKey);
			}
			if (inItem.mEnabled !== undefined && !inItem.mEnabled) classNames.push('disabled');
			if (inItem.mToolbarStyle) classNames.push('styled', inItem.mToolbarStyle);
			attributes.className = classNames.join(' ');
			
			if (browser().isMobileSafari()) attributes.role = "presentation";
			var li = Builder.node('li', attributes, [
				Builder.node('span', {'role': 'link', 'aria-label': inItem.mDisplayTitle, 'aria-hidden': 'false'}, inItem.mDisplayTitle)
			]);
			// Configure any event handlers on this menu item.
			var inheritedAction = inOptParent ? inOptParent.mAction : undefined;
			var inheritedTarget = inOptParent ? inOptParent.mTarget : undefined
			$evt(inItem, li, inheritedAction, inheritedTarget);
			// Recurse and expand any children.
			var children = inItem.mSubMenuItems;
			if (children && children.length > 0) li.appendChild($ul(children, inItem));
			return li;
		}.bind(this);
		// Registers events on an individual toolbar <li> tag.
		var $evt = function(inToolbarItem, inElement, inOptInheritedAction, inOptInheritedTarget) {
			if (!inToolbarItem || !inElement) return false;
			var mAction = inToolbarItem.mAction || inOptInheritedAction;
			var mTarget = inToolbarItem.mTarget || inOptInheritedTarget;
			if (inToolbarItem.mSubMenuItems && inToolbarItem.mSubMenuItems.length > 0) {
				Event.observe(inElement, 'mousedown', function(inEvent) {
					Event.stop(inEvent);
					if (inEvent.findElement('.disabled')) return true;
					globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_EDITOR_WILL_LOSE_FOCUS);
					setTimeout(function() {
						var toolbars = $$('.editor.toolbar .expanded, .editor.inline.popup.expanded'), toolbarIdx, toolbar;
						for (toolbarIdx = 0; toolbarIdx < toolbars.length; toolbarIdx++) {
							toolbar = toolbars[toolbarIdx];
							toolbar.removeClassName('expanded');
							if (toolbar.hasClassName('inline') && toolbar.hasClassName('popup')) toolbar.hide();
						}
						var parent = inEvent.findElement('.toplevel');
						if (parent) parent.toggleClassName('expanded');
					}, 200);
				});
			}
			else if (mAction) {
				Event.observe(inElement, 'mousedown', function(inEvent) {
					Event.stop(inEvent);
					if (inEvent.findElement('.disabled')) return true;
					globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_EDITOR_WILL_LOSE_FOCUS);
					setTimeout(function() {
						var toolbars = $$('.editor.toolbar .expanded, .editor.inline.popup.expanded'), toolbarIdx, toolbar;
						for (toolbarIdx = 0; toolbarIdx < toolbars.length; toolbarIdx++) {
							toolbar = toolbars[toolbarIdx];
							toolbar.removeClassName('expanded');
							if (toolbar.hasClassName('inline') && toolbar.hasClassName('popup')) toolbar.hide();
						}
						// Build a list of arguments.
						var args = inToolbarItem.mActionArguments || [inToolbarItem.mKey, inEvent];
						if (args && CC.typeOf(args) != CC.T_ARRAY) throw("Cannot initialize toolbar item (%@) with unknown argument list (%@)".fmt(inToolbarItem, args));
						// Get the target for this callback (if it exists). Default to the block
						// controller if it exists, otherwise the global editor controller.
						var target = mTarget || this.mBlockTarget || editorToolbarDelegate();
						// Call the action passing along any arguments.
						if (target && target[mAction]) return target[mAction].apply(target, args);
						// Fall back on the global editor controller for a bad or unspecified target.
						var editor = globalEditorController();
						if (editor[mAction]) return editor[mAction].apply(editor, args);
					}.bind(this), 200);
				}.bind(this));
			}
		}.bind(this);
		// Render the menu. Flag the first render as being top-level so we can add any
		// special sauce for hiding/showing the menu and activating/deactivating
		// the menu based on the active block in the editor. The true flag won't get
		// passed on recursive render calls.
		var menu = $ul(this.mContent.mToolbarItems, null, this.mContent.mBlockTypeIdentifer, true);
		return menu;
	},
	registerEventHandlers: function() {
		Event.observe(this.mParentElement, 'mousedown', function(inEvent) {
			inEvent.stopPropagation();
			Event.stop(inEvent);
		});
	},
	// Returns an array of toolbar keys.
	keys: function() {
		var keys = $A([]), elem = this.$();
		if (!elem) return keys;
		keys = elem.select('li.item').collect(function(item) {
			return item ? item.getAttribute('name') : undefined;
		});
		return keys.compact();
	},
	// Updates the state of this toolbar using the supplied properties hash.
	updateToolbarUsingPropertiesForKeys: function(inPropertiesByKey) {
		if (!inPropertiesByKey) return;
		var renderedToolbar = this.$();
		var toolbarItems = this.$().select('li.item');
		var key, attrs, itemIdx, item;
		for (itemIdx = 0; itemIdx < toolbarItems.length; itemIdx++) {
			item = toolbarItems[itemIdx];
			// What toolbar key is this list item representing?
			key = item.getAttribute('name');
			// Look up the properties for this menu key.
			attrs = inPropertiesByKey.get(key);
			if (!attrs || (attrs && !(attrs.enabled || attrs.selected))) continue;
			// Update the enabled and selected state of this toolbar item.
			if (attrs.enabled !== undefined) attrs.enabled ? item.removeClassName('disabled') : item.addClassName('disabled');
			if (attrs.selected !== undefined) attrs.selected ? item.addClassName('selected') : item.removeClassName('selected');
		}
		return true;
	}
});

// Fake editor toolbar item popup menu designed to mimic static toolbar popup menus (e.g. text
// formatting or list styling), but support dynamically generated content. It is your responsibility
// to instantiate and render a popup menu. The suggested way to do so is have a delegate shared
// instance that your editor toolbar item calls, which handles populating/hiding/showing your popup.

CC.WikiEditor.EditorToolbarPopupMenu = Class.create(CC.Mvc.View, {
	mShowing: false,
	mIdentifer: null,
	_render: function() {
		var elem = Builder.node('div', {className: 'editor inline popup chrome', style: 'display: none;'});
		if (this.mIdentifer) elem.setAttribute('id', this.mIdentifer);
		var rendered = this.render();
		if (rendered) elem.appendChild(rendered);
		this.handleDidRenderView({'element': elem});
		return (this.mParentElement = elem);
	},
	registerEventHandlers: function() {
		bindEventListeners(this, [
			'handleParentElementMouseDown',
			'handleWindowMouseDown'
		]);
		Event.observe(this.mParentElement, 'mousedown', this.handleParentElementMouseDown);
	},
	// Show/hide this popup. Accepts an optional anchor element to center this popup
	// over when showing.
	show: function(inOptAnchorElement) {
		// Do we have an anchor?
		this.mAnchorElement = inOptAnchorElement ? $(inOptAnchorElement) : undefined;
		var position = this.mAnchorElement ? this.mAnchorElement.viewportOffset() : {top: 0, left: 0};
		var dimensions = this.mAnchorElement ? this.mAnchorElement.getDimensions() : {width: 0, height: 0};		
		this.$().setStyle({
			'top': position.top + dimensions.height + 1 + 'px', // +1 is to account for the difference between the real and apparent boundaries of the anchor			
			'left': position.left + 'px'
		});
		this.$().show();
		this.mShowing = true;
		this.$().addClassName('expanded');
		// Watch for something equivilant to a popup blur.
		Event.observe(window, 'mousedown', this.handleWindowMouseDown);
	},
	hide: function(inEvent, inOptCallback) {
		this.$().hide();
		this.$().removeClassName('expanded');
		this.mShowing = false;
		// Clean up unwanted event handlers.
		Event.stopObserving(window, 'mousedown', this.handleWindowMouseDown);
	},
	toggle: function(inOptAnchorElement) {
		(this.mShowing == false) ? this.show(inOptAnchorElement) : this.hide();
	},
	// If the mouse event came from the popup, stop propagation so we don't
	// unintentially hide it (the editor will interpret it as a toolbar hide).
	handleParentElementMouseDown: function(inEvent) {
		Event.stop(inEvent);
		return true;
	},
	// If the mouse event came from the anchor, and we're showing, hide the
	// popup instead of showing.
	handleWindowMouseDown: function(inEvent) {
		var popup = inEvent.findElement('.editor.popup');
		if (popup && this.mAnchorElement && popup == this.mAnchorElement) {
			this.handleParentElementMouseDown(inEvent);
			this.toggle(this.mAnchorElement);
		} else {
			this.hide();
		}
	},
	// Prepares your popup for display. You can use this method to safely pass
	// page state to your popup instance (e.g. any current selection context). For
	// example, in the link popup, we pass whether or not the current selection
	// has an active hyperlink (so we know whether we need to include unlink), and
	// the current selection so we can pre-populate the link text/url fields in the
	// manual link dialog.
	preparePopup: function() {}
});

// Copy/paste delegate. Works by adding an offscreen editable element to the document
// that can be staged with a focused set of content ready to be placed on the clipboard,
// or ready to recieve a paste event.

CC.WikiEditor.NOTIFICATION_DID_INITIALIZE_COPY_PASTE_DELEGATE = 'DID_INITIALIZE_COPY_PASTE_DELEGATE';
CC.WikiEditor.NOTIFICATION_CLIPBOARD_DID_CHANGE = 'CLIPBOARD_DID_CHANGE'

CC.WikiEditor.CopyPasteDelegate = Class.create({
	initialize: function(inOptMarkup) {
		this.mOffscreenElement = Builder.node('div', {className: 'wikieditor-offscreen chrome'});
		this.mOffscreenElement.innerHTML = (inOptMarkup || "");
		document.body.appendChild(this.mOffscreenElement);
		Event.observe(this.mOffscreenElement, 'blur', this.handleOffscreenElementBlur.bind(this));
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_DID_INITIALIZE_COPY_PASTE_DELEGATE, this);
	},
	prepareToCopy: function(inMarkup) {
		this.mOffscreenElement.innerHTML = (inMarkup || "");
		this.focusOffscreenElement();
		this.handleOffscreenElementBlur();
	},
	prepareToPaste: function() {
		this.mOffscreenElement.innerHTML = "";
		this.mOffscreenElement.addClassName('selectable');
		this.mOffscreenElement.setAttribute('contentEditable', true);
		this.focusOffscreenElement();
	},
	clipboard: function(inOptTextOnly) {
		// If we're returning a text-only representation of the clipboard (including links and
		// inline styles), clone the offscreen element and tidy the DOM before returning.
		if (inOptTextOnly) {
			var clonedNode = this.mOffscreenElement.cloneNode(true);
			return reduceToTextLinksAndStyles(clonedNode).innerHTML;
		}
		return this.mOffscreenElement.innerHTML;
	},
	focusOffscreenElement: function() {
		this.mOffscreenElement.focus();
		globalEditorTextSelectionDelegate().selectAllChildren(this.mOffscreenElement);
	},
	handleOffscreenElementBlur: function(inEvent) {
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_CLIPBOARD_DID_CHANGE, this, {
			'content': this.mOffscreenElement.innerHTML
		});
		this.mOffscreenElement.removeClassName('selectable');
		this.mOffscreenElement.setAttribute('contentEditable', false);
	}
});

// Editor selection delegate. Responsible for cleanup tasks before and after we process
// a select-all operation. Since we use a series of nested contentEditable containers for
// text editing, select-all needs to escape an actively focused contentEditable space by
// stashing the current selection, disabling contentEditable everywhere temporarily and
// allowing the select-all to process as expected.

CC.WikiEditor.SelectAllDelegate = Class.create({
	mIsSelectingAll: false,
	mStashedActiveBlock: null,
	mStashedEditables: null,
	initialize: function() {},
	prepareToSelectAll: function() {
		// First cache the window selection if it exists.
		globalEditorTextSelectionDelegate().cacheSelection();;
		// Stash the currently active block.
		this.mStashedActiveBlock = globalEditorController().mActiveBlock;
		if (this.mStashedActiveBlock) globalEditorController().stopEditing(true);
		// Next undo and stash any contentEditable elements.
		var editables = $(document.body).select("*[contentEditable=true]"), editableIdx, editable;
		for (editableIdx = 0; editableIdx < editables.length; editableIdx++) {
			editable = editables[editableIdx];
			editable.setAttribute('contentEditable', false);
		}
		this.mStashedEditables = editables;
	},
	prepareToDeselectAll: function() {
		// Re-enable any contentEditable elements.
		var stashedEditables = this.mStashedEditables, stashedEditablesIdx, stashedEditable;
		for (stashedEditablesIdx = 0; stashedEditablesIdx < stashedEditables.length; stashedEditablesIdx++) {
			stashedEditable = stashedEditables[stashedEditablesIdx];
			stashedEditable.setAttribute('contentEditable', true);
		}
		// Restore the previously active block and selection.
		if (this.mStashedActiveBlock) globalEditorController().startEditing(this.mStashedActiveBlock);
		try { globalEditorTextSelectionDelegate().restoreSelection(); } catch(e) {};
	}
});
