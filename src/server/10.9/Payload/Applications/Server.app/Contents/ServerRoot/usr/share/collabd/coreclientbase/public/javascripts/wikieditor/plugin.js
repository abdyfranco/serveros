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

// An editor block plugin.

CC.WikiEditor.BlockPlugin = Class.create({
	// A unique string identifier for your plugin.
	mBlockIdentifier: null,
	// A string property path for your block controller.
	mBlockController: null,
	// An optional string property path for a block toolbar.
	mBlockToolbar: null,
	// An optional editor toolbar item instance for your block.
	mEditorToolbarItem: null
});

// Global editor plugin manager. Responsible for registering/unregistering block plugins.

CC.WikiEditor.GlobalEditorPluginManager = Class.createWithSharedInstance('globalEditorPluginManager');
CC.WikiEditor.GlobalEditorPluginManager.prototype = {
	initialize: function() {},
	// Proxies to the block plugin registry for quick block registration.
	registerBlockType: function(inBlockTypeIdentifer, inBlockClass /*, {options} */) {
		globalEditorBlockPluginRegistry().registerBlockType.apply(globalEditorBlockPluginRegistry(), arguments);
	},
	// Register a new block plugin.
	registerBlockPlugin: function(inBlockPlugin) {
		if (!inBlockPlugin || !CC.kindOf(inBlockPlugin, CC.WikiEditor.BlockPlugin)) return logger().error("Invalid block plugin (plugins should be an instance of CC.WikiEditor.BlockPlugin or one of its subclasses).");
		globalEditorBlockPluginRegistry().registerBlockType(inBlockPlugin.mBlockIdentifier, inBlockPlugin.mBlockController, {
			'mBlockToolbar': inBlockPlugin.mBlockToolbar,
			'mEditorToolbarItem': inBlockPlugin.mEditorToolbarItem
		});
	},
	// Unregister an already registered block plugin by identifer (if it exists).
	unregisterBlockPluginByIdentifer: function(inBlockPluginIdentifer) {
		if (!inBlockPluginIdentifer) return logger().error("Cannot unregister unknown block plugin (%@)".fmt(inBlockPluginIdentifer));
		globalEditorBlockPluginRegistry().unregisterBlockType(inBlockPluginIdentifer);
	}
};
