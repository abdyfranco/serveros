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

// File block delegate for the editor. Because we want to upload an attachment/image
// before adding a block to the page, the default toolbar plugin action calls this
// handler before invoking the default editor add block behavior by hand.

var FileBlockDelegate = Class.createWithSharedInstance('fileBlockDelegate');
FileBlockDelegate.prototype = {
	_cachedBlockType: null,
	initialize: function() {},
	addBlock: function() {		
		var pageGUID = CC.meta('x-apple-entity-guid');
		
		// if pageGUID is null then look for special cases
		if (!pageGUID) {					
			// Specific case 1: iPad unauthenticated user trying to upload a document
			if (browser().isMobileSafari()) {			
				// making sure we're in the unauthenticated user case
				if (CC.meta('x-apple-user-logged-in') == "false") {
					var element = window.getSelection().anchorNode;
					while (element && !pageGUID) {
						// if it has a data-owner-guid then it is the node which should contain the uploaded document
						if (element.hasAttribute("data-owner-guid")) {
							pageGUID = element.getAttribute("data-guid");
						} else {
							element = element.parentElement;
						}
					}
				}
			}			
			// Add new specific cases here...
		}			

		// Show the upload file panel and register our callbacks, setting the owner of the
		// file to be the page.
		fileUploadManager().createUploadPanel(0, pageGUID, {
			'complete': {callback: 'didCompleteUpload', target: this},
			'error': {callback: 'didFailUpload', target: this}
		}, true);
	},
	didCompleteUpload: function(inFileData) {
		logger().debug("didCompleteUpload: %o", inFileData);
		if (!(inFileData && inFileData.fileGUID && inFileData.fileName && inFileData.fileEntity)) return false;
		// Add a file-backed block depending on the mediaType returned by the server.
		var mediaType = (inFileData && inFileData.fileEntity && inFileData.fileEntity.mediaType);
		var blockType;
		if (mediaType == "image") {
			blockType = "image";
		} else if (mediaType == 'movie' || mediaType == 'audio') {
			blockType = "media";
		} else {
			blockType = "attachment";
		}
		// Add a new block to the page, passing the file data along to the block model.
		var fileBlock = editorToolbarDelegate().addBlock(blockType, {
			'extendedAttributes': {
				'fileGUID': inFileData.fileGUID,
				'fileDataGUID': inFileData.fileEntity.dataGUID,
				'fileName': inFileData.fileName,
				'width': inFileData.fileEntity.extendedAttributes.width,
				'height': inFileData.fileEntity.extendedAttributes.height
			}
		}, true);
	},
	didFailUpload: function(inError) {
		logger().error("didFailUpload: %o", inError);
		notifier().printErrorMessage("_Editor.Block.File.Uploaded.Error".loc());
	}
};

// A file-backed block.

CC.WikiEditor.FileBlock = Class.create(CC.WikiEditor.Block, {
	mBlockView: 'CC.WikiEditor.FileBlockView',
	restore: function($super, inChangesets) {
		var changesetKey, changesetValue, changesetIdx, changes;
		for (changesetIdx = 0; changesetIdx < inChangesets.length; changesetIdx++) {
			changes = inChangesets[changesetIdx];
			if (changes.length < 2) continue;
			changesetKey = changes[0];
			changesetValue = changes[1];
			if (changesetKey != 'extendedAttributes') continue;
			if (changesetValue.fileGUID == undefined || changesetValue.fileDataGUID == undefined) continue;
			this.mViewInstance.didReplaceFile(undefined, changesetValue.fileGUID, changesetValue.fileDataGUID, changesetValue.fileName);
		}
		$super(inChangesets);
	}
});

CC.WikiEditor.FileBlockView = Class.create(CC.WikiEditor.NonTextBlockView, CC.WikiEditor.Mixins.AskBeforeDeleting, {
	// Overload _registerEventHandlers so we can add file-specific requirements.
	_registerEventHandlers: function($super) {
		this.$().addClassName('file');
		var fileGUID = this.mContent.getRecordPropertyForPath('extendedAttributes.fileGUID');
		if (fileGUID) this.$().setAttribute('data-file-guid', fileGUID);
		var fileDataGUID = this.mContent.getRecordPropertyForPath('extendedAttributes.fileDataGUID');
		if (fileDataGUID) this.$().setAttribute('data-file-data-guid', fileDataGUID);
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
	},
	buildFileURL: function() {
		return '%@/files/download/%@'.fmt(env().root_path, this.mContent.getRecordPropertyForPath('extendedAttributes.fileDataGUID'));
	},
	buildForceDownloadFileURL: function() {
		return '%@/files/download/%@'.fmt(env().root_path, this.mContent.getRecordPropertyForPath('extendedAttributes.fileDataGUID'));
	},
	downloadFile: function() {
		window.location.href = this.buildForceDownloadFileURL();
	},
	showMoreInfo: function() {
		window.location.href = '%@/files/%@'.fmt(env().root_path, this.mContent.getRecordPropertyForPath('extendedAttributes.fileGUID'));
	},
	handleKeyboardNotification: function(inMessage, inObject, inOptExtras) {
		switch (inMessage) {
			// 8685082
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_BACKSPACE:
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_DELETE:
				Event.stop(inOptExtras.event);
				return true;
		}
	}
});

globalEditorPluginManager().registerBlockType('file', 'CC.WikiEditor.FileBlock', {
	mEditorToolbarItem: new CC.WikiEditor.EditorToolbarItem({
		mDisplayTitle: "_Editor.Toolbar.Block.File.Title".loc(),
		mTooltip: "_Editor.Toolbar.Block.File.Tooltip".loc(),
		mIsEnabled: true,
		mKey: 'file',
		mAction: 'addBlock',
		mTarget: fileBlockDelegate()
	})
});
