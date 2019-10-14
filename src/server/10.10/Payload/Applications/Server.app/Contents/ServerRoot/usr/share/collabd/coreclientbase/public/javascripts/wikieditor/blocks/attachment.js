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

//= require "./file.js"

CC.WikiEditor.AttachmentBlock = Class.create(CC.WikiEditor.FileBlock, {
	mBlockView: 'CC.WikiEditor.AttachmentBlockView'
	// TOOD
});

CC.WikiEditor.AttachmentBlockView = Class.create(CC.WikiEditor.FileBlockView, {
	mDeleteDialogTitle: "_Editor.Block.Attachment.Dialog.Delete.Title".loc(),
	mDeleteDialogDescription: "_Editor.Block.Attachment.Dialog.Delete.Description".loc(),
	mDefaultQuickLookableExtensions: "ada adb ads asm bash bmp c cc class cp cpp csh cxx c++ doc docx f for f77 f95 gif hh hp hpp hxx h++ html i ii icns ics jav java jpeg jpg jp2 js key ksh l lm lmm lpp lxx m mi mm mii mov mpeg mpg mp3 mp4 m4a m4p m4v 3gp nasm numbers pages pas pdf plist png ppt pptx psd rb rtf rtfd s sh strings tcsh tif tiff txt xhtml xml xls xlsx y ym ymm ypp yxx zsh".w(),
	renderAsHTML: function() {
		var filename = this.mContent.getRecordPropertyForPath('extendedAttributes.fileName');
		var fileGUID = this.mContent.getRecordPropertyForPath('extendedAttributes.fileGUID');
		var quicklookableExtensions = this.mDefaultQuickLookableExtensions;
		quicklookableExtensions.concat(CC.meta('x-apple-quicklookable-extensions').split(','));
		var extension = (filename.match(/([\w]+)$/)[1] || "").toLowerCase();
		// If the attachment is a zip archive and filename includes a clue to the bundle extension, try again.
		if (extension == 'zip') {
			var extensions = filename.match(/\.([\w]+)\.zip$/);
			if (extensions && extensions.size() > 1) {
				extension = extensions[1];
			}
		}
		// Is this attachment quicklookble or do we think it will be quicklookable?
		var isQuickLookable = (quicklookableExtensions.indexOf(extension) != -1);
		// Build out the HTML for this block.
		var eventDelegateIdentifer = this.getEventDelegateIdentifer();
		var html = "<div class=\"attachment%@\">".fmt((isQuickLookable ? " quicklookable" : "")) +
			"<div id=\"%@\" class=\"right-cap\"%@></div>".fmt(eventDelegateIdentifer + "-right-cap", (isQuickLookable ? " title=\"%@\"".fmt("_Editor.Block.Attachment.QuickLook.Label".loc()) : "")) +
			"<div id=\"%@\" class=\"left-container\"><div id=\"%@\" class=\"delete clickable chrome\">%@</div>".fmt(eventDelegateIdentifer + "-left-container", eventDelegateIdentifer + "-left-container-delete", "_Editor.Block.Attachment.Remove.Label".loc()) +
			"<div class=\"left-cap\"></div><div class=\"mid\">" +
			"<div class=\"filename default\" title=\"%@\">%@</div>".fmt(filename, filename) +
			"</div></div></div>";
		return html;
	},
	registerEventHandlers: function() {
		bindEventListeners(this, [
			'handleDownloadFileClicked',
			'handleQuickLookFileClicked',
			'handleDeleteButtonClick'
		]);
		var eventDelegateIdentifer = this.getEventDelegateIdentifer();
		var clickEvent = browser().isMobileSafari() ? 'touchstart' : 'click';
		globalEventDelegate().bulkRegisterDomResponderForEventByIdentifer([
			[clickEvent, "%@-left-container".fmt(eventDelegateIdentifer), this.handleDownloadFileClicked],
			[clickEvent, "%@-left-container-delete".fmt(eventDelegateIdentifer), this.handleDeleteButtonClick]
		]);
		var elem = this.mParentElement;
		if (elem.down('.attachment').hasClassName('quicklookable')) globalEventDelegate().registerDomResponderForEventByIdentifer(clickEvent, eventDelegateIdentifer + "-right-cap", this.handleQuickLookFileClicked);
	},
	handleDownloadFileClicked: function(inEvent) {
		if (globalEditorController().mEditMode) return true;
		return this.downloadFile();
	},
	handleQuickLookFileClicked: function(inEvent) {
		if (globalEditorController().mEditMode) return true;
		// Preload the file entity so we can animate at the correct size.
		var fileDataGUID = this.mContent.getRecordPropertyForPath('extendedAttributes.fileDataGUID');
		dialogManager().showProgressMessage("_QuickLook.Status.Preview.Loading".loc());
		var callback = function(response) {
			dialogManager().hideProgressMessage();
			quicklook().mPreviewInfo = response;
			quicklook().showPreviewPanelForAttachment(this.$().down('.left-container'), fileDataGUID);
		}.bind(this);
		quicklook().mService.pollForPreviewInformation(fileDataGUID, callback);
	}
});

globalEditorPluginManager().registerBlockType('attachment', 'CC.WikiEditor.AttachmentBlock', {});
