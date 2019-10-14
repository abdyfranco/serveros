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

// Image block delegate. Only really responsible for linking.

var ImageBlockDelegate = Class.createWithSharedInstance('imageBlockDelegate');
ImageBlockDelegate.prototype = {
	initialize: function() {
		if (document && document.body) return this._initialize();
	},
	_initialize: function() {
		this.mSmartLinkPopup = new CC.WikiEditor.SmartLinkPopup();
		this.mSmartLinkPopup._render();
		document.body.appendChild(this.mSmartLinkPopup.$());
	},
	showSmartLinkPopup: function(inOptAnchor, inOptURL, inOptLinkText, inOptCallback, inOptCancelCallback) {
		this.mSmartLinkPopup.preparePopup(inOptAnchor, inOptURL, inOptLinkText, inOptCallback, inOptCancelCallback);
		this.mSmartLinkPopup.show(inOptAnchor);
	}
};

CC.WikiEditor.ImageBlock = Class.create(CC.WikiEditor.FileBlock, {
	mBlockView: 'CC.WikiEditor.ImageBlockView',
	// Proxy method for the image editor toolbar.
	replaceFile: function() {
		if (this.mViewInstance) this.mViewInstance.replaceFile();
	},
	addLink: function(inLink, inEvent) {
		if (this.mViewInstance) this.mViewInstance.showLinkDialog(inEvent);
	}
});

CC.WikiEditor.ImageBlockView = Class.create(CC.WikiEditor.FileBlockView, {
	// Cache the image size so we can open new windows quickly.
	mCachedImageSize: null,
	mDeleteDialogTitle: "_Editor.Block.Image.Dialog.Delete.Title".loc(),
	mDeleteDialogDescription: "_Editor.Block.Image.Dialog.Delete.Description".loc(),
	renderAsHTML: function() {
		// Is this image borderless?
		var borderless = this.mContent.getRecordPropertyForPath('extendedAttributes.borderless');
		// Does this image have an explicit size setting?
		var size = (this.mContent.getRecordPropertyForPath('extendedAttributes.size') || {});
		var width = size.width, height = size.height;
		var sizeAttribute = width && height ? " width=\"%@px\" height=\"%@px\"".fmt(width, height) : "";
		// Figure out a path for this image.
		var imagePath;
		var staticImagePath = this.mContent.getRecordPropertyForPath('extendedAttributes.staticImagePath');
		var staticImagePathAt2x = this.mContent.getRecordPropertyForPath('extendedAttributes.staticImagePathAt2x');
		// Do we have a static image path to use?
		if (staticImagePath) imagePath = staticImagePath;
		if (staticImagePathAt2x && hidpi().isHiDPI()) imagePath = staticImagePathAt2x;
		// Otherwise fall back on expecting a file GUID in the extended attributes for this file block.
		if (!imagePath) imagePath = this.buildFileURL();
		// Do we have link attributes to worry about?
		var linkURL = this.mContent.getRecordPropertyForPath('extendedAttributes.linkURL');
		var linkText = this.mContent.getRecordPropertyForPath('extendedAttributes.linkText');
		this._preloadImage(imagePath);
		var eventDelegateIdentifer = this.getEventDelegateIdentifer();
		var html = "<div class=\"container wrapchrome%@\">".fmt((borderless ? ' borderless' : '')) +
			"<div id=\"%@\" class=\"delete clickable chrome\">%@</div><div class=\"placeholder chrome\"><h2>%@</h2></div>".fmt(eventDelegateIdentifer + "-container-delete", "_Editor.Delete.Block".loc(), "_Editor.Block.Image.Loading.Placeholder".loc()) +
			"<div class=\"image wrapchrome%@\"><a href=\"%@\"><img id=\"%@\" class=\"clickable cc-routeable\" data-route-href=\"%@\" src=\"%@\"%@/></a></div></div>".fmt((size.width ? ' sized' : ''), linkURL, eventDelegateIdentifer + "-container-image-img", linkURL, imagePath, sizeAttribute);
		return html;
	},
	_preloadImage: function(inImagePathToPreload) {
		var img = new Image();
		Event.observe(img, 'load', function(inEvent) {
			this.mCachedImageSize = {'width': img.width, 'height': img.height};
		}.bind(this));
		img.src = inImagePathToPreload;
	},
	registerEventHandlers: function() {
		bindEventListeners(this, [
			'handleDeleteButtonClick',
			'handleImageClick'
		]);
		var eventDelegateIdentifer = this.getEventDelegateIdentifer();
		globalEventDelegate().bulkRegisterDomResponderForEventByIdentifer([
			['click', "%@-container-delete".fmt(eventDelegateIdentifer), this.handleDeleteButtonClick],
			['click', "%@-container-image-img".fmt(eventDelegateIdentifer), this.handleImageClick]
		]);
		this.updateLinkSettings();
	},
	updateLinkSettings: function() {
		var linkURL = this.mContent.getRecordPropertyForPath('extendedAttributes.linkURL');
		var linkText = this.mContent.getRecordPropertyForPath('extendedAttributes.linkText');
		var linkTarget = this.mContent.getRecordPropertyForPath('extendedAttributes.linkTarget');	
		
		var image = this.$('.image');
		if (linkURL) {
			image.addClassName('linked');
			if (linkText) image.setAttribute('title', linkText);
		} else {
			image.removeClassName('linked');
			image.removeAttribute('title');
		}
	},
	handleImageClick: function(inEvent) {
		if (globalEditorController().mEditMode) return false;
		var linkURL = this.mContent.getRecordPropertyForPath('extendedAttributes.linkURL');
		if (linkURL) {
			if (!linkURL.match(/^\/|[A-Za-z]+:/i)) linkURL = 'http://' + linkURL;
			if (linkURL.match(/^\//)) {
				globalRouteHandler().routeURL(linkURL);
				return true;
			} else {
				window.open(linkURL, undefined, 'status=0,toolbar=1,resizable=1,scrollbars=1');
				return true;
			}
		}
		// 11730803
		// Bail if we're on an iPad running iOS5 for GM.
		if (browser().isiPad() && browser().isiOS5Plus()) return false;
		// Otherwise show a full-size preview (if we can).
		var imageWindowURL = this.buildImageWindowURL();
		if (imageWindowURL) {
			var windowSize = this.mCachedImageSize;
			if (!windowSize) windowSize = {'width': document.viewport.getWidth(), 'height': document.viewport.getHeight()};
			var windowTitle = this.mContent.getRecordPropertyForPath('extendedAttributes.fileName') || "";
			var w = window.open(this.buildImageWindowURL(), undefined, 'status=0,toolbar=0,resizable=1,scrollbars=1,width=%@,height=%@'.fmt(windowSize.width+20, windowSize.height+20));
			w.moveTo(0, 0);
		}
	},
	buildImageWindowURL: function() {
		var fileGUID = this.mContent.getRecordPropertyForPath('extendedAttributes.fileGUID');
		if (fileGUID) {
			return '/__collabd/coreclientbase/image_window.html#fileDataGUID=%@'.fmt(fileGUID);
		}
	},
	showLinkDialog: function(inEvent) {
		var anchor = inEvent.findElement('li.item');
		var linkURL = this.mContent.getRecordPropertyForPath('extendedAttributes.linkURL');
		var linkText = this.mContent.getRecordPropertyForPath('extendedAttributes.linkText');
		var linkTarget = this.mContent.getRecordPropertyForPath('extendedAttributes.linkTarget');
		textBlockDelegate().showSmartLinkPopup(anchor, linkURL, linkText, linkTarget, this.handleLinkDialogOK.bind(this));
	},
	handleLinkDialogOK: function(inURL, inLinkText, inTarget) {
		// check if there's already a an '?' in the url
		if(inURL.indexOf('?') > -1) {
			inURL = inURL + '&target=' + inTarget;
		} else {
			inURL = inURL + '?target=' + inTarget;			
		}
		
		this.mContent.setRecordPropertyForPath('extendedAttributes.linkURL', inURL);
		this.mContent.setRecordPropertyForPath('extendedAttributes.linkText', inLinkText);
		this.mContent.setRecordPropertyForPath('extendedAttributes.linkTarget', inTarget);
								
		this.updateLinkSettings();
	}
});

CC.WikiEditor.ImageBlockToolbar = Class.create(CC.WikiEditor.BlockToolbar, {
	mToolbarItems: [
		new CC.WikiEditor.EditorToolbarItem({
			mDisplayTitle: "_Editor.Block.Image.Toolbar.Link.Title".loc(),
			mTooltip: "_Editor.Block.Image.Toolbar.Link.Tooltip".loc(),
			mToolbarStyle: CC.WikiEditor.EDITOR_TOOLBAR_ITEM_STYLE_SELECT,
			mAction: 'addLink',
			mKey: 'link'
		})
	]
});

globalEditorPluginManager().registerBlockType('image', 'CC.WikiEditor.ImageBlock', {
	mBlockToolbar: 'CC.WikiEditor.ImageBlockToolbar'
});
