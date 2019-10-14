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

// Notifications.

CC.Files.NOTIFICATION_FILE_DID_CHANGE = 'FILE_DID_CHANGE';
CC.Files.NOTIFICATION_DID_DOWNLOAD_FILE = 'DID_DOWNLOAD_FILE';
CC.Files.NOTIFICATION_DID_ABORT_FILE_REPLACE = 'DID_ABORT_FILE_REPLACE';
CC.Files.NOTIFICATION_DID_REPLACE_FILE = 'DID_REPLACE_FILE';
CC.Files.NOTIFICATION_REPLACE_FILE_DID_FAIL = 'REPLACE_FILE_DID_FAIL';

// File detail view.

CC.Files.FileDetailView = Class.create(CC.Mvc.View, {
	// How many preview pages shuold we load first?
	mInitialDisplayedPreviewCount: 5,
	// How many preview pages should we load per pagination?
	mPaginationCount: 5,
	// How many previews are we currently displaying?
	mCurrentDisplayedPreviewCount: 0,
	// do we render the title Element
	mRenderTitleElement: true,
	// Renders the core chrome and registers any event handlers.
	render: function() {
		// Build the icon path for this preview.
		var iconPath = this.buildIconPath();
		var titleViewElement = Builder.node('span', {}, "");
		if (this.mRenderTitleElement) {
			// Build a title view for this file and pre-render it.
			var titleView = new CC.EntityTitle.EntityTitleView({'mContent': this.mContent});
			titleView._render();
			titleView.updateDisplay(undefined, this.mContent, undefined);
			titleViewElement = titleView.$();
		}
		// Build the surrounding chrome.
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
		// Is the file quicklookable yet? If the quicklook is still pending, show a spinner.
		// Otherwise, if the quicklook is ready show the preview, otherwise so the no preview
		// chrome.
		var fileData = this.mContent.mRecord;
		var gotPreviewInformation = function(properties) {
			elem.removeClassName('loading');
			if (!properties || (!properties.isQuickLookable) || (properties && properties.previewURLs && properties.previewURLs.length == 0)) {
				elem.addClassName('nopreview');
				return;
			}
			var entity = properties['fileDataEntity'];
			this.mContent.mRecord = entity;
			this.renderPreviewForRange(0, this.mInitialDisplayedPreviewCount);
			quicklook().mPreviewInfo = properties;			
		}.bind(this);
		quicklook().mService.pollForPreviewInformation(fileData.dataGUID || fileData.guid, gotPreviewInformation);
		// Trigger a service_client flush so we wait for as little time as possible on a file view.
		service_client().flushQueuedServiceRequests();
		return elem;
	},
	// Renders and appends a specified amount of preview pages from a given start index
	// inside the previews container element. Displays spinners while we wait for images
	// to download, and automatically updates and localizes the pagination control.
	renderPreviewForRange: function(inStartIndex, inHowMany) {
		if (inStartIndex == undefined || inHowMany == undefined) return true;
		var fileData = this.mContent.mRecord;
		if (!fileData.isQuickLookable) return true;
		var previewCount = fileData.previewGUIDs.length;
		// Bail if we're trying to render an non-existing preview.
		if (inStartIndex > (previewCount - 1)) return true;
		// Otherwise, build our previews.
		var previewElements = new Array();
		// Define a did load callback, just removes the loading class name on the container.
		var didLoadPreview = function(inEvent) {
			var element = inEvent.element();
			if (element) element.up('.preview.loading').removeClassName('loading');
		};
		// Build a bunch of preview elements, and append to a list.
		for (var idx = inStartIndex; (idx < (inStartIndex + inHowMany)); idx++) {
			if (idx >= previewCount) break;
			var previewElement = Builder.node('div', {className: 'preview loading'}, [
				Builder.node('img'),
				Builder.node('div', {className: 'description'}, "_Files.Pagination.Page.Count".loc(idx + 1, previewCount))
			]);
			var img = previewElement.down('img');
			Event.observe(img, 'load', didLoadPreview);
			
			if ((fileData.mediaType == 'audio') || (fileData.mediaType == 'video')) {
				var iconPath = this.buildIconPath();
				img.setAttribute('src', iconPath);
			} else {
				var imagePath = '%@/files/download/%@'.fmt(env().root_path, fileData.previewGUIDs[idx]);
				img.setAttribute('src', imagePath);				
			}
		
			Event.observe(previewElement, 'click', this.handlePreviewPageClicked);
			previewElements.push(previewElement);
			this.mCurrentDisplayedPreviewCount++;
		}
		// Update the paginator.
		var previewsLeft = Math.max(0, previewCount - (inStartIndex + inHowMany));
		var paginationString = "_Files.Pagination.Load.More".loc();
		this.mParentElement.down('.pagination .more').innerHTML = paginationString;
		if (previewsLeft == 0) this.mParentElement.down('.pagination').hide();
		// Append the previews to the document and return.
		previewElements.each(function(elem) {
			Element.insert(this.mParentElement.down('.previews'), {'bottom': elem});
		}, this);
	},
	// Returns the icon path for the content of this view.
	buildIconPath: function() {
		if (!this.mContent.mRecord.iconGUID) return "";
		return '%@/files/download/%@'.fmt(env().root_path, this.mContent.mRecord.iconGUID);
	},
	registerEventHandlers: function() {
		bindEventListeners(this, [
			'handleDownloadFileClicked',
			'handlePaginationControlClicked',
			'handlePreviewPageClicked'
		]);
		Event.observe(this.$().down('.pagination .more'), 'click', this.handlePaginationControlClicked);
	},
	handleDownloadFileClicked: function(inEvent) {
		var path = '%@/files/download/%@'.fmt(env().root_path, this.mContent.mRecord.guid);
		window.location.href = path;
		globalNotificationCenter().publish(CC.Files.NOTIFICATION_DID_DOWNLOAD_FILE);
	},
	handlePaginationControlClicked: function(inEvent) {
		this.renderPreviewForRange(this.mCurrentDisplayedPreviewCount, this.mPaginationCount);
	},
	handlePreviewPageClicked: function(inEvent) {
		var previews = this.mParentElement.select('.preview');
		var preview = inEvent.findElement('.preview');
		var previewIdx = previews.indexOf(preview);		
		quicklook().showPreviewPanelForAttachment(inEvent.findElement('.preview'), this.mContent.mRecord.guid, (previewIdx >= 0 ? previewIdx : undefined));
	}
});


// Builds and returns a rendered inline file detail view, with event handlers already
// attached. Automatically renders the first preview thumbnail, if it exists.
CC.Files.buildInlineFileDetailView = function(inEntity, inOptShowTitle) {
	if (!inEntity) return undefined;
	// Otherwise, initialize and render a new file controller and view.
	var controller = new CC.Mvc.ObjectController({mRecord: inEntity});
	var view = new CC.Files.FileDetailView({
		'mContent': controller
	});
	if (inOptShowTitle == undefined) {
		inOptShowTitle = true;
	}
	view.mRenderTitleElement = inOptShowTitle;
	controller.mViewInstance = view;
	view._render();
	return view;
};
