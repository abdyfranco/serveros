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

// Global block type registry responsible for managing registered block
// types, and mapping block identifers (e.g. "text") to block controller
// instances. Strictly one per customer. Each editor instance has a plugin
// registry.

CC.WikiEditor.GlobalBlockPluginRegistry = Class.createWithSharedInstance('globalEditorBlockPluginRegistry');
CC.WikiEditor.GlobalBlockPluginRegistry.prototype = {
	mRegisteredBlocks: new Hash(),
	initialize: function() {},
	registerBlockType: function(inBlockTypeIdentifer, inBlockClass /*, {options} */) {
		if (!(inBlockTypeIdentifer && inBlockClass)) throw("Block registration requires a type identifier and class path");
		if (this._isBlockTypeRegistered(inBlockTypeIdentifer)) throw("Block type (%@) is already registered".fmt(inBlockTypeIdentifer));
		// If we got a property path, convert it to a function pointer.
		var konstructor = (CC.typeOf(inBlockClass) === CC.T_STRING) ? CC.objectForPropertyPath(inBlockClass) : inBlockClass;
		if (!konstructor) throw("Block " +  inBlockTypeIdentifer + " has an invalid constructor path " + inBlockClass);
		// Add the block to our hash of registered blocks, instantiating a contextual
		// block toolbar for this block type where necessary.
		var hash = {'klass': konstructor};
		if (arguments.length > 2) Object.extend(hash, arguments[2]);
		if ('mBlockToolbar' in hash) {
			var blockToolbar = CC.objectInstanceForPropertyPath(hash['mBlockToolbar']);
			// Set the block type for the toolbar, for convenience.
			if (blockToolbar.mBlockTypeIdentifer === undefined) blockToolbar.mBlockTypeIdentifer = inBlockTypeIdentifer;
			hash['mBlockToolbar'] = blockToolbar;
		}
		if ('mEditorToolbarItem' in hash) {
			hash['mEditorToolbarItem'] = CC.objectInstanceForPropertyPath(hash['mEditorToolbarItem']);
		}
		// Update our registered blocks structure.
		this.mRegisteredBlocks.set(inBlockTypeIdentifer, hash);
	},
	// Unregisters block information for a particular block identifer. Does not clean
	// up any instances of a block type on the page.
	unregisterBlockType: function(inBlockTypeIdentifer) {
		if (!this._isBlockTypeRegistered(inBlockTypeIdentifer)) return false;
		this.mRegisteredBlocks.unset(inBlockTypeIdentifer);
	},
	// Returns an array of registered block identifers.
	registeredBlocks: function() {
		return this.mRegisteredBlocks.keys();
	},
	// Returns the block registered for a given type identifer, if it exists.
	registeredBlockForType: function(inBlockTypeIdentifer) {
		if (!inBlockTypeIdentifer || !this._isBlockTypeRegistered(inBlockTypeIdentifer)) return undefined;
		return this.mRegisteredBlocks.get(inBlockTypeIdentifer);
	},
	// Private helper method that returns true if a given block type identifier exists in
	// the block registry, and false otherwise. Assumes that if the identifer is in the
	// CC.Set associated with this class it is correctly registered.
	_isBlockTypeRegistered: function(inBlockTypeIdentifer) {
		if (!inBlockTypeIdentifer) return false;
		return this.mRegisteredBlocks.get(inBlockTypeIdentifer) !== undefined;
	},
	// Returns the registered block controller for a given block type identifer (the block
	// controller registered with the plugin registry for block records in the store of that
	// type).
	blockControllerForType: function(inBlockTypeIdentifer) {
		var block = this.registeredBlockForType(inBlockTypeIdentifer);
		return block ? block['klass'] : undefined;
	},
	blockToolbarForType: function(inBlockTypeIdentifer) {
		var block = this.registeredBlockForType(inBlockTypeIdentifer);
		return block ? block['mBlockToolbar'] : undefined;
	},
	editorToolbarItemForType: function(inBlockTypeIdentifer) {
		var block = this.registeredBlockForType(inBlockTypeIdentifer);
		return block ? block['mEditorToolbarItem'] : undefined;
	},
	// Returns true if blocks registered with a particular identifier allow nesting (they
	// can behave as containers for other blocks).
	blockTypeBehavesAsContainer: function(inBlockTypeIdentifer) {
		var block = this.blockControllerForType(inBlockTypeIdentifer);
		return (block && block.prototype && block.prototype.mIsContainer);
	}
};
