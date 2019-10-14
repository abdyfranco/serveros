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

// Notifications.

CC.QuickLook.NOTIFICATION_DID_SHOW_QUICKLOOK_PANEL = 'DID_SHOW_QUICKLOOK_PANEL';
CC.QuickLook.NOTIFICATION_DID_HIDE_QUICKLOOK_PANEL = 'DID_HIDE_QUICKLOOK_PANEL';
CC.QuickLook.NOTIFICATION_DID_CENTER_QUICKLOOK_PREVIEW = 'DID_CENTER_QUICKLOOK_PREVIEW';
CC.QuickLook.NOTIFICATION_DID_RESIZE_QUICKLOOK_PREVIEW = 'DID_RESIZE_QUICKLOOK_PREVIEW';
CC.QuickLook.NOTIFICATION_QUICKLOOK_DID_ENTER_FULLSCREEN_MODE = 'QUICKLOOK_DID_ENTER_FULLSCREEN_MODE';
CC.QuickLook.NOTIFICATION_QUICKLOOK_DID_EXIT_FULLSCREEN_MODE = 'QUICKLOOK_DID_EXIT_FULLSCREEN_MODE';

// Global quicklook instance.

CC.QuickLook.GlobalQuickLookInstance = Class.createWithSharedInstance('quicklook', false);
CC.QuickLook.GlobalQuickLookInstance.prototype = {
	mService: new CC.QuickLook.Service(),
	// The default panel size for a preview.
	mDefaultPanelSize: {'width': 960, 'height': 780},
	// The minimum panel size for a preview.
	mMinimumPanelSize: {'width': 640, 'height': 480},
	// Audio preview artwork should be 258px x 258px. Includes 6px width and 49px height compensation.
	mDefaultAudioPanelSize: {'width': 264, 'height': 307},
	// Default 480p movie size.
	mDefaultMovieSize: {'width': 640, 'height': 480},
	// Animation scale factor.
	mScaleFactor: 0.1,
	// Preloading spinner delay.
	mPreloadingDelay: 500,
	// Is quicklook active?
	mNowShowing: false,
	// Is the active request the first one we've made.
	mIsFirstRequest: true,
	// Is the active preview a movie or audio file?
	mIsVideo: false,
	mIsAudio: false,
	// Are we in full screen mode?
	mFullScreenBoundary: 25,
	mFullScreenMode: false,
	// Track any gesture start positions.
	mMouseDownPosition: {},
	initialize: function() {
		// User a smaller default panel size on mobile WebKit.
		if (browser().isMobileSafari) this.mDefaultPanelSize = {'width': 720, 'height': 588};
		// Bind any event listeners.
		bindEventListeners(this, [
			'showPreviewPanelAnimationDidFinish', 'hidePreviewPanel', 'hidePreviewPanelAnimationDidFinish', 
			'handleThumbnailClicked', 'handleResizeWidgetMouseDown', 'handleResizeWidgetMouseDrag',
			'handleResizeWidgetEndMouseDrag', 'toggleFullScreenMode', 'handleAttachmentDownloadClick',
			'handleWindowResized', 'handleWindowScrolled', 'handleWindowMouseDown', 'handleThumbnailScrollUpClick',
			'handleThumbnailScrollDownClick'
		]);
		globalNotificationCenter().subscribe(CC.Keyboard.NOTIFICATION_DID_KEYBOARD_ESC, this.handleKeyboardNotification.bind(this));
		globalNotificationCenter().subscribe(CC.Keyboard.NOTIFICATION_DID_KEYBOARD_LEFT, this.handleKeyboardNotification.bind(this));
		globalNotificationCenter().subscribe(CC.Keyboard.NOTIFICATION_DID_KEYBOARD_RIGHT, this.handleKeyboardNotification.bind(this));
		globalNotificationCenter().subscribe(CC.Keyboard.NOTIFICATION_DID_KEYBOARD_UP, this.handleKeyboardNotification.bind(this));
		globalNotificationCenter().subscribe(CC.Keyboard.NOTIFICATION_DID_KEYBOARD_DOWN, this.handleKeyboardNotification.bind(this));
	},
	// Renders the reusable quicklook chrome for displaying an preview. The quicklook dialog is
	// completely self contained, and appended to the document at the root level once the shared
	// instance is created.
	render: function() {
		if (this.mPreviewMask) this.mPreviewMask.remove();
		if (this.mPreviewPanel) this.mPreviewPanel.remove();
		this.mPreviewMask = Builder.node('div', {id: 'quicklook_mask', style: 'display: none;'});
		this.mPreviewPanel = Builder.node('div', {id: 'quicklook_panel', style: 'display: none;'}, [
			Builder.node('div', {id: 'quicklook_panel_close'}),
			Builder.node('div', {id: 'quicklook_panel_title'}),
			Builder.node('div', {id: 'quicklook_panel_loading', className: 'progress'}, [
				Builder.node('h2', {}, "_QuickLook.Status.Preview.Loading".loc())
			]),
			Builder.node('div', {id: 'quicklook_panel_error', className: 'progress', style: 'display: none;'}, [
				Builder.node('h2', {}, "_QuickLook.Status.Preview.Missing".loc())
			]),
			Builder.node('div', {id: 'quicklook_panel_browser', style: 'display: none'}),
			Builder.node('div', {id: 'quicklook_hovering_area'}, [
			    Builder.node('div', {id: 'quicklook_panel_preview', style: 'display: none'})
			])
		] );
		d.body.appendChild(this.mPreviewMask);
		d.body.appendChild(this.mPreviewPanel);

		this.renderRolloverControls();
		this.registerEventHandlers();
	},
	renderRolloverControls: function() {
		var fitOrFullScreen = document.body.hasClassName('ipad') ? 'fitscreen' : 'fullscreen';
		if (this.mRolloverControls) this.mRolloverControls.remove();
		this.mRolloverControls = Builder.node('div', {id: 'quicklook_hud', style: 'display: none;'}, [
			Builder.node('a', {id: 'quicklook_hud_scale', className: fitOrFullScreen}),
			Builder.node('a', {id: 'quicklook_hud_download', className: 'download'}),
			Builder.node('a', {id: 'quicklook_hud_close', className: 'close'})
		]);
		$('quicklook_hovering_area').insert(this.mRolloverControls);
		$('quicklook_hud_scale').observe('mousedown', this.toggleFullScreenMode);
		$('quicklook_hud_close').observe('mousedown', this.hidePreviewPanel);
		$('quicklook_hud_download').observe('click', this.handleAttachmentDownloadClick);
	},
	registerEventHandlers: function() {
		Event.observe('quicklook_panel_close', 'mouseup', this.hidePreviewPanel);
		Event.observe(window, 'resize', this.handleWindowResized);
		Event.observe(window, 'scroll', this.handleWindowScrolled);
		Event.observe(window, 'mousewheel', this.handleWindowScrolled);
		Event.observe(window, 'DOMMouseScroll', this.handleWindowScrolled);
		Event.observe(window, 'mousedown', this.handleWindowMouseDown);
	},
	unregisterEventHandlers: function() {
		Event.stopObserving('quicklook_panel_close', 'mouseup', this.hidePreviewPanel);
		Event.stopObserving('quicklook_mask', 'mouseup', this.hidePreviewPanel);
		Event.stopObserving(window, 'resize', this.handleWindowResized);
		Event.stopObserving(window, 'scroll', this.handleWindowScrolled);
		Event.stopObserving(window, 'mousewheel', this.handleWindowScrolled);
		Event.stopObserving(window, 'DOMMouseScroll', this.handleWindowScrolled);
		Event.stopObserving(window, 'mousedown', this.handleWindowMouseDown);
	},
	// Shows the preview panel. Accepts an optional inOptToggleFullScreenAtPageIndex argument
	// which, when supplied, will force the preview panel into full-screen mode at the specified
	// page index (if it exists).
	showPreviewPanelForAttachment: function(inAnchorElement, inEntityGUID, inOptToggleFullScreenAtPageIndex) {		
		if (!inAnchorElement || !inEntityGUID) return false;
		// Stash the entity guid for later.
		this.mEntityGUID = inEntityGUID;
		// Render.
		this.render();
		this.mPreviewMask.show();
		// Do we have the preview information already?
		if (this.mPreviewInfo) {
			this.mIsAudio = this.mPreviewInfo.isAudio;
			this.mIsVideo = this.mPreviewInfo.isVideo;
			// Special-case audio and video previews (6421171 & 6421173). If the preview is a movie,
			// size the preview window to fit the width, height and aspect ratio of the preview. If
			// the preview is an audio file, special case the window dimensions. Otherwise, use the default
			// dimensions.
			if (this.mIsAudio || this.mIsVideo) {
				this.mStashedDefaultPanelSize = this.mDefaultPanelSize;
				if (this.mIsVideo) {
					if (this.mPreviewInfo.size && this.mPreviewInfo.size.width && this.mPreviewInfo.size.height) {
						this.mDefaultPanelSize = {'width': this.mPreviewInfo.size.width + 6, 'height': this.mPreviewInfo.size.height + 49};
					}
				}
				else if (this.mIsAudio) {
					this.mDefaultPanelSize = this.mDefaultAudioPanelSize;
				}
			}
			// Are we opening at a specific page index?
			else if ((inOptToggleFullScreenAtPageIndex != undefined) && (this.mPreviewInfo.previewURLs && inOptToggleFullScreenAtPageIndex < this.mPreviewInfo.previewURLs.length)) {
				this.mStashedDefaultPanelSize = this.mDefaultPanelSize;
				this.mDefaultPanelSize = this.calculateFullScreenWidthHeightLeftTop();
				this.mToggleFullScreenIndex = Math.max(0, inOptToggleFullScreenAtPageIndex);
			}
			// If this is a single-image preview, size the quicklook window to fit.
			else if (!this.mPreviewInfo.isPaginated && this.mPreviewInfo.size && this.mPreviewInfo.size.width && this.mPreviewInfo.size.height) {
				this.mStashedDefaultPanelSize = this.mDefaultPanelSize;
				var width = this.mPreviewInfo.size.width;
				var height = this.mPreviewInfo.size.height;
				var ratio = width / height;
				if (width > height) {
					if (height < this.mMinimumPanelSize.height) {
						this.mDefaultPanelSize = this.mMinimumPanelSize;
					} else {
						var displayHeight = this.mDefaultPanelSize.height;
						var displayWidth = (displayHeight * ratio);
						this.mDefaultPanelSize = {
							'width': displayWidth,
							'height': displayHeight + 27
						}
					}
				}
			}
		}
		// Position the quicklook panel over the anchor before animating.
		this.mAnchorElement = $(inAnchorElement);
		this.mPreviewPanel.setStyle(this.calculateStartStateForAnimation(this.mAnchorElement, this.mDefaultPanelSize));
		this.mPreviewPanel.show();
		// If we're not on an animation-capable browser, bail.
		if (!browser().isWebKit()) return this.showPreviewPanelAnimationDidFinish();
		// Otherwise, observe animation events and animate by removing the scale and updating
		// the opacity. We delay by 100ms to work around the fact that the CSS spec was changed to say animations don't work to/from display:none.
		if (browser().isWebKit()) {
			Event.stopObserving(this.mPreviewPanel, 'webkitTransitionEnd');
			Event.observe(this.mPreviewPanel, 'webkitTransitionEnd', this.showPreviewPanelAnimationDidFinish);
		}
		setTimeout(function() {
			this.mPreviewPanel.setStyle({
				'opacity': 1,
				'-webkit-transform': 'scale(1.0)'
			});
		}.bind(this), 100);
	},
	showPreviewPanelAnimationDidFinish: function(inEvent) {
		if (inEvent && inEvent.propertyName && inEvent.propertyName != '-webkit-transform') return;
		if (this.mPreviewInfo && this.mPreviewInfo.isQuickLookable) return this.configurePreviewPanel(this.mPreviewInfo);
		this.mService.pollForPreviewInformation(this.mEntityGUID, this.configurePreviewPanel.bind(this));
	},
	// Hides the preview panel.
	hidePreviewPanel: function() {
		if (this.mRequestTimer) {
			clearTimeout(this.mRequestTimer);
			delete this.mRequestTimer;
		}
		if (browser().isWebKit()) {
			Event.stopObserving(this.mPreviewPanel, 'webkitTransitionEnd');
			Event.observe(this.mPreviewPanel, 'webkitTransitionEnd', this.hidePreviewPanelAnimationDidFinish);
		}
		this.mPreviewPanel.setStyle(this.calculateStartStateForAnimation(this.mAnchorElement, this.mPreviewPanel.getDimensions()));
		if (!browser().isWebKit()) this.hidePreviewPanelAnimationDidFinish();
	},
	hidePreviewPanelAnimationDidFinish: function(inEvent) {
		if (inEvent && inEvent.propertyName && inEvent.propertyName != '-webkit-transform') return;
		this.unregisterEventHandlers();
		this.mPreviewPanel.hide();
		this.mPreviewMask.hide();
		if (this.mStashedDefaultPanelSize) this.mDefaultPanelSize = this.mStashedDefaultPanelSize;
		if (this.mPreviewInfo) delete this.mPreviewInfo;
		this.mIsAudio = this.mIsVideo = this.mIsFirstRequest = this.mFullScreenMode = false;
		this.mNowShowing = false;
		globalNotificationCenter().publish(CC.QuickLook.NOTIFICATION_DID_HIDE_QUICKLOOK_PANEL);
	},
	// Configures a preview panel for a supplied hash of preview info.
	configurePreviewPanel: function(inPreviewInfo) {
		if (!inPreviewInfo || (!inPreviewInfo.isQuickLookable) || (inPreviewInfo && !inPreviewInfo.downloadURL)) {
			$('quicklook_panel_error').show();
			$('quicklook_panel_loading').hide()
			return;
		}
		// Stash the preview information away.
		this.mPreviewInfo = inPreviewInfo;
		// Is the preview pane ready?
		this.mIsPreviewPanelReady = false;
		// Should we show the thumbnail browser?
		var shouldShowThumbnailBrowser = false;
		// Should we show the rollover controls?
		var shouldShowRolloverControls = false;
		// Is the preview an audio file? Audio files are displayed at a fixed window size with
		// embedded artwork (if we have it). Videos are displayed at their actual resolution up
		// to a limit.
		if (inPreviewInfo.isAudio || inPreviewInfo.isVideo) {
			this.mIsPreviewPanelReady = true;
			var mediaPath = inPreviewInfo.downloadURL;
			var previewPanel = $('quicklook_panel_preview');
			// Override the line height values for the preview panel if we're showing a media
			// preview, since we manually, absolutely, position media content using the
			// qtMediaExpander global. 
			previewPanel.setStyle({lineHeight: 'normal'});
			if (inPreviewInfo.isAudio) {
				var media = Builder.node('div', {className: 'media audio'}, [
					Builder.node('div', { className: 'artwork'})
				]);
				var audio = Builder.node('img', {className: 'posterimg', alt: mediaPath, width: '258px', height: '16px'});
				Element.insert(media, {bottom: audio});
				Element.insert(previewPanel, {top: media});
			}
			else if (inPreviewInfo.isVideo && inPreviewInfo.size) {
				var media = Builder.node('div', {className: 'media movie'});
				var movieSize = this.mDefaultMovieSize;
				if (inPreviewInfo.size && inPreviewInfo.size.width && inPreviewInfo.size.height) movieSize = inPreviewInfo.size;
				var movie = Builder.node('img', {className: 'posterimg', alt: mediaPath, width: movieSize.width + 'px', height: movieSize.height + 'px'});
				Element.insert(media, {top: movie});
				Element.insert(previewPanel, {top: media});
			}
		}
		else {
			shouldShowRolloverControls = true;
			// If the preview is paginated, configure the preview window. We'll load the
			// actual thumbnails later.
			if (inPreviewInfo.isPaginated) {
				shouldShowThumbnailBrowser = true;
				$('quicklook_hovering_area').addClassName('paginated');
			}
			// Load the first preview image.
			var previewPath = this.mToggleFullScreenIndex ? inPreviewInfo.previewURLs[this.mToggleFullScreenIndex] : inPreviewInfo.previewURLs[0];
			var previewImageElement = Builder.node('img', {src: previewPath, id: 'quicklook_now_showing', className: inPreviewInfo.isPaginated ? ' paginated' : ''});
			var preloadedImage = new Image();
			Event.observe(preloadedImage, 'load', function() {
				this.mIsPreviewPanelReady = true;
				this.mStashedPreviewWidth = preloadedImage.width;
				this.mStashedPreviewHeight = preloadedImage.height;
				// If the preview is paginated, populate the thumbnail browser.
				if (inPreviewInfo.isPaginated) {
					var browser = $('quicklook_panel_browser');
					var thumbnailCount = inPreviewInfo.thumbnailURLs.length;
					var thumbnailPath, thumbnailElement, thumbnailImage;
					var didLoadThumbnail = function(inEvent) {
						var thumbnailImage = inEvent.element();
						var thumbnail = thumbnailImage.up('.thumbnail');
						thumbnail.removeClassName('loading');
						if ($$('.thumbnail.loading').length == 0) {
							var browser = $('quicklook_panel_browser')
							var first = browser.down('.thumbnail');
							var selected = browser.down('.thumbnail.selected');
							if (selected && selected != first) this.scrollToThumbnail(selected, browser);
						}
					}.bind(this);
					for (var thumbnailIdx = 0; thumbnailIdx < thumbnailCount; thumbnailIdx++) {
						thumbnailPath = inPreviewInfo.thumbnailURLs[thumbnailIdx];
						thumbnailElement = Builder.node('div', {className: 'thumbnail loading'}, [
							Builder.node('div', {className: 'pagination-wrapper'}, [
								Builder.node( 'span', { className: 'pagination' }, "_QuickLook.Thumbnail.Page.Count".loc((thumbnailIdx + 1), thumbnailCount))
							])
						]);
						thumbnailImage = Builder.node('img');
						Event.observe(thumbnailElement, 'click', this.handleThumbnailClicked);
						Event.observe(thumbnailImage, 'load', didLoadThumbnail);
						if (thumbnailIdx == (this.mToggleFullScreenIndex || 0)) {
							thumbnailElement.addClassName('selected');
							thumbnailElement.down('span.pagination').show();
						}
						thumbnailImage.setAttribute('src', thumbnailPath);
						Element.insert(thumbnailElement, {'top': thumbnailImage});
						Element.insert(browser, {'bottom': thumbnailElement});
					}
					// Add thumbnail scrolling widgets (iPad-specific).
					var scrollThumbnailsUpElement = Builder.node('div', {id: 'quicklook_panel_thumbnails_scroll_up', className: 'scroller up disabled', style: 'display: none;'}, "_QuickLook.Thumbnail.Scroll.Up".loc());
					var scrollThumbnailsDownElement = Builder.node('div', {id: 'quicklook_panel_thumbnails_scroll_down', className: 'scroller down', style: 'display: none;'}, "_QuickLook.Thumbnail.Scroll.Down".loc());
					Element.insert(browser, {'after': scrollThumbnailsUpElement});
					Element.insert(browser, {'after': scrollThumbnailsDownElement});
					Event.observe(scrollThumbnailsUpElement, 'click', this.handleThumbnailScrollUpClick);
					Event.observe(scrollThumbnailsDownElement, 'click', this.handleThumbnailScrollDownClick);						
				}
			}.bind(this));
			preloadedImage.src = previewImageElement.src = previewPath;
			var previewPanel = $('quicklook_panel_preview');
			Element.insert(previewPanel, {top: previewImageElement});
		}
		// Add a title to the window.
		var titleElement = Builder.node('h3', {className: 'title', style: 'display: none;'}, [
			unescape(inPreviewInfo.title)
		]);
		var iconPath = inPreviewInfo.thumbnailURLs.length > 0 ? inPreviewInfo.thumbnailURLs[0] : undefined;
		if (iconPath) Element.insert(titleElement, {'top': Builder.node('img', {className: 'icon', src: iconPath})});
		var titlePanel = $('quicklook_panel_title');
		titlePanel.innerHTML = "";
		titlePanel.appendChild(titleElement);
		// Make the quicklook panel resizeable, if needed.
		if (!inPreviewInfo.isAudio) this.makePreviewPanelResizeable();
		// Make the preview panable if it needs to be.
		if (!inPreviewInfo.isAudio || !inPreviewInfo.isVideo) {
			this.renderRolloverControls();
			this.makePreviewPanable();
		}
		// Update any child elements.
		this.updatePreviewPanelChildElementsAfterResize(this.mPreviewPanel.getHeight());
		// Purposely delay hiding the loading panel for (at least) 500ms.
		var showPreviewAfterLoading = function() {
			// If the preview still isn't ready, show a loading spinner for another 0.5s.
			if (!this.mIsPreviewPanelReady) {
				this.mShowPreviewPanelTimer = setTimeout(showPreviewAfterLoading, this.mPreloadingDelay);
				return;
			}
			var loading = $('quicklook_panel_loading');
			if (loading) loading.hide();
			var title = $('quicklook_panel_title').down('.title');
			if (title) title.show();
			var browser = $('quicklook_panel_browser');
			if (browser && shouldShowThumbnailBrowser) {
				browser.show();
				var up = $('quicklook_panel_thumbnails_scroll_up');
				if (up) up.show();
				var down = $('quicklook_panel_thumbnails_scroll_down');
				if (down) down.show();
			}
			var panel = $('quicklook_panel_preview')
			if (panel) {
				panel.show();
				panel.focus();
			}
			var rollover = $('quicklook_hud');
			if (rollover && shouldShowRolloverControls) rollover.show();
			// If we're showing a media preview, auto-play and adjust the preview window to fit.
			if (inPreviewInfo && (inPreviewInfo.isAudio || inPreviewInfo.isVideo)) {
				var posterimg = panel.down('img.posterimg');
				if (posterimg) qtMediaExpander().expandPosterImage(inPreviewInfo.mediaType, posterimg, "transparent");
				this.resizeMediaPreview();
			}
			// Detect horizontally or vertically challenged previews
			var w = this.mStashedPreviewWidth;
			var h = this.mStashedPreviewHeight;
			var isPreviewSuperThin = h > w ? (w/h < 0.7) : (h/w < 0.7);
			delete this.mStashedPreviewHeight;
			delete this.mStashedPreviewWidth;
			// Are we toggling full-screen?
			if (this.mToggleFullScreenIndex != undefined || isPreviewSuperThin) {
				this.toggleFullScreenMode();
				delete this.mToggleFullScreenIndex;
			}
		}.bind(this);
		this.mShowPreviewPanelTimer = setTimeout(showPreviewAfterLoading, this.mPreloadingDelay);
		this.mNowShowing = true;
		globalNotificationCenter().publish(CC.QuickLook.NOTIFICATION_DID_SHOW_QUICKLOOK_PANEL);
	},
	calculateStartStateForAnimation: function(inAnchorElement, inPreviewPanelDimensions) {
		var anchorElement = $(inAnchorElement);
		var anchorOffset = anchorElement.viewportOffset();
		// Calculate the position of the preview panel once we show it.
		var centerX = anchorOffset.left + Math.floor(anchorElement.getWidth() / 2);
		var centerY = anchorOffset.top + Math.floor(anchorElement.getHeight() / 2);
		var newPosition = this.calculateCenterPositionForDimensions({ 'width': inPreviewPanelDimensions.width, 'height': inPreviewPanelDimensions.height});
		// So that the preview panel appears to animate from the anchor element, calculate top and
		// left pixel adjustment values and translate the scaled preview before animating.
		var targetLeft = Math.floor(centerX - (inPreviewPanelDimensions.width / 2));
		var targetTop = Math.floor(centerY - (inPreviewPanelDimensions.height / 2));
		var translateX = Math.abs(newPosition.left - targetLeft) / this.mScaleFactor;
		if (newPosition.left > targetLeft) translateX = translateX * (-1);
		var translateY = Math.abs(newPosition.top - targetTop) / this.mScaleFactor;
		if (newPosition.top > targetTop) translateY = translateY * (-1);
		var frame = {
			'opacity': browser().isWebKit() ? 0 : 1.0,
			'width': inPreviewPanelDimensions.width + 'px',
			'height': inPreviewPanelDimensions.height + 'px',
			'left': newPosition.left + 'px',
			'top': newPosition.top + 'px'
		};
		// If we're on WebKit, sprinkle some animation dust.
		if (browser().isWebKit()) frame['-webkit-transform'] = 'scale(' + this.mScaleFactor + ') translateX(' + translateX + 'px) translateY(' + translateY + 'px)';
		// Return the frame.
		return frame;
	},
	// Given a set of preview window dimensions, calculates a viewport-centered position.
	// Returns a hash of top/left width/height values.
	calculateCenterPositionForDimensions: function(inDimensions) {
		if (!inDimensions || !inDimensions.width || !inDimensions.height ) return true;
		var newLeft = (document.viewport.getWidth() / 2) - (inDimensions.width / 2);
		var newTop = ((document.viewport.getHeight() / 2) + document.viewport.getScrollOffsets().top) - (inDimensions.height / 2);
		if (newLeft < this.mFullScreenBoundary) newLeft = this.mFullScreenBoundary;
		if (newTop < this.mFullScreenBoundary) newTop = this.mFullScreenBoundary;
		return {'left': newLeft, 'top': newTop};
	},
	calculateFullScreenWidthHeightLeftTop: function() {
		var maxWidth = (d.viewport.getWidth() - (2 * this.mFullScreenBoundary));
		var maxHeight = (d.viewport.getHeight() - (2 * this.mFullScreenBoundary));
		// If the preview is not audio or video, ignore any aspect ratio and fit the browser.
		if (this.mPreviewInfo && (!this.mPreviewInfo.isAudio && !this.mPreviewInfo.isVideo)) {
			return {'width': maxWidth, 'height': maxHeight, 'left': this.mFullScreenBoundary, 'top': this.mFullScreenBoundary};
		}
		// If the window is taller than it is wider, calculate a height value
		// that is proportionate to the max width. If the window is wider than it
		// is taller, do the opposite.
		if (maxWidth < this.mDefaultPanelSize.width) maxWidth = this.mDefaultPanelSize.width;
		if (maxHeight < this.mDefaultPanelSize.height) maxHeight = this.mDefaultPanelSize.height;
		var newWidth = maxWidth;
		var newHeight = maxHeight;
		if (maxWidth <= maxHeight) {
			var widthScaleFactor = newWidth / this.mDefaultPanelSize.width;
			newHeight = Math.round(this.mDefaultPanelSize.height * widthScaleFactor);
			// 6412724
			if (newHeight > maxHeight) {
				newHeight = maxHeight;
				widthScaleFactor = newHeight / this.mDefaultPanelSize.height;
				newWidth = Math.round(this.mDefaultPanelSize.width * widthScaleFactor);
			}
		}
		else {
			var heightScaleFactor = newHeight / this.mDefaultPanelSize.height;
			newWidth = Math.round(this.mDefaultPanelSize.width * heightScaleFactor);
			// 6412724
			if (newWidth > maxWidth) {
				newWidth = maxWidth;
				widthScaleFactor = newWidth / this.mDefaultPanelSize.width;
				newHeight = Math.round(this.mDefaultPanelSize.height * widthScaleFactor);
			}
		}
		var newLeft = (d.viewport.getWidth() / 2) - (newWidth / 2);
		var newTop = ((d.viewport.getHeight() / 2) + d.viewport.getScrollOffsets().top) - (newHeight / 2);
		if (newLeft < this.mFullScreenBoundary) newLeft = this.mFullScreenBoundary;
		if (newTop < this.mFullScreenBoundary) newTop = this.mFullScreenBoundary;
		// Return the new dimensions and position.
		return {'width': newWidth, 'height': newHeight, 'left': newLeft, 'top': newTop};
	},
	// Resizes the preview panel to a given set of dimensions.
	resize: function(inDimensions) {
		if (!inDimensions || !inDimensions.width || !inDimensions.height || !inDimensions.left || !inDimensions.top ) return true;
		$('quicklook_panel').setStyle({
			'width': position.width + 'px',
			'height': position.height + 'px',
			'left': position.left + 'px',
			'top': position.top + 'px'
		});
		this.updatePreviewPanelChildElementsAfterResize(inDimensions.height);
	},
	resizeMediaPreview: function() {
		// Fudges with the width and height of media previews to compensate for quicklook
		// window paddings and the quicktime controller. Should be called any time the
		// container panel size is changed.
		var preview = $('quicklook_panel_preview');
		var media = preview.down('.media');
		if (media) {
			// 3px border on either side of the movie.
			var newWidth = preview.getWidth() - 6;
			// Audio previews are fixed at 16px tall. Movies fill the
			// height of the quicklook window (minus 21px padding for
			// the resize handle).
			var newHeight = (media.hasClassName('audio') ? 16 : preview.getHeight() - 21);
			var qtmedia = media.down('.qtmedia');
			if (qtmedia) {
				qtmedia.setStyle({
					'width': newWidth + 'px',
					'height': newHeight + 'px'
				});
			}
			var mediaChildren = media.getElementsBySelector('embed, object, video');
			mediaChildren.each(function(mediaChild) {
				mediaChild.width = newWidth;
				mediaChild.height = newHeight;
			});
		}
	},
	// Centers the preview panel in the viewport.
	centerPreviewPanel: function() {
		// If we're in fullscreen mode, stay in fullscreen mode by fitting
		// the preview window to the new browser size and redrawing the current
		// panned image.
		if (this.mFullScreenMode) {
			this.resize(this.calculateFullScreenWidthHeightLeftTop());
			this.switchPannedImage();
			if (this.mStashedPreviousPosition) {
				var updatedTopLeft = this.calculateCenterPositionForDimensions(this.mStashedPreviousPosition);
				this.mStashedPreviousPosition.top = updatedTopLeft.top;
				this.mStashedPreviousPosition.left = updatedTopLeft.left;
			}
			return true;
		}
		// Otherwise, center the window at its current size (need to compensate for 
		// getDimensions oversizing the window by including the glass border in the
		// dimensions calculation).
		var dimensions = this.mPreviewPanel.getDimensions();
		dimensions.width -= 6;
		dimensions.height -= 6;
		var pos = this.calculateCenterPositionForDimensions(dimensions);
		this.mPreviewPanel.setStyle({
			'left': pos.left + 'px',
			'top': pos.top + 'px'
		});
		globalNotificationCenter().publish(CC.QuickLook.NOTIFICATION_DID_CENTER_QUICKLOOK_PREVIEW);
	},
	// Resizes the preview window.
	resize: function(inPosition) {
		if (!inPosition.width || !inPosition.height || !inPosition.left || !inPosition.top) return true;
		this.mPreviewPanel.setStyle( {
			'width': inPosition.width + 'px',
			'height': inPosition.height + 'px',
			'left': inPosition.left + 'px',
			'top': inPosition.top + 'px'
		});
		this.updatePreviewPanelChildElementsAfterResize(inPosition.height);
		globalNotificationCenter().publish(CC.QuickLook.NOTIFICATION_DID_RESIZE_QUICKLOOK_PREVIEW);
	},
	updatePreviewPanelChildElementsAfterResize: function(newPreviewPanelHeight) {
		var newContentHeight = newPreviewPanelHeight - 35 + 'px';
		$('quicklook_panel_preview').setStyle({lineHeight: ((this.mIsAudio || this.mIsVideo) ? 'normal' :  newContentHeight)});
		this.resizeMediaPreview();
	},
	handleThumbnailClicked: function(inEvent) {
		var thumbnailElement = inEvent.findElement('.thumbnail');
		this.switchDisplayedPreview(thumbnailElement);
	},
	// Handles a new thumbnail selection on the left.
	switchDisplayedPreview: function(inThumbnailElementToActivate) {
		var newThumbnail = inThumbnailElementToActivate;
		var oldThumbnail = $('quicklook_panel_browser').down('.thumbnail.selected');
		if (newThumbnail != oldThumbnail) {
			oldThumbnail.removeClassName('selected');
			newThumbnail.addClassName('selected');
			var thumbnails = $('quicklook_panel_browser').select('.thumbnail');
			var thumbnailIdx = thumbnails.indexOf(newThumbnail);
			var previews = this.mPreviewInfo.previewURLs;
			var newPreviewImagePath = (previews.length >= thumbnailIdx) ? previews[thumbnailIdx] : previews[0];
			var preloadedPreviewImage = new Image();
			var preloadingContainer = $('quicklook_panel_preview');
			// Display a preloading spinner if loading the new image takes any more than
			// 0.5s, and ensure it shows for >= 0.5s.
			this.mNewPreviewHasLoaded = false;
			this.mCanHidePreviewPreloadingSpinner = false;
			this.mPreloadingPreviewTimer = setTimeout(function() {
				setTimeout(function() {
					// Signal the spinner can hide in case we're ahead of the preload.
					this.mCanHidePreviewPreloadingSpinner = true;
					if (this.mNewPreviewHasLoaded) preloadingContainer.removeClassName('preloading');
				}.bind(this), this.mPreloadingDelay);
				preloadingContainer.addClassName('preloading');
			}.bind(this), this.mPreloadingDelay);
			var doneLoadingImage = function() {
				if (this.preloadingTimer) clearTimeout(this.preloadingTimer);
				// Signal the image has loaded in case we're ahead of the timer.
				this.mNewPreviewHasLoaded = true;
				if (this.mCanHidePreviewPreloadingSpinner) preloadingContainer.removeClassName('preloading');
				$('quicklook_now_showing').src = preloadedPreviewImage.src;
				this.switchPannedImage();
			}
			Event.observe(preloadedPreviewImage, 'load', doneLoadingImage.bind(this));
			preloadedPreviewImage.src = newPreviewImagePath;
			this.scrollToThumbnail(newThumbnail);
		}
	},
	scrollToThumbnail: function(inThumbnailElement) {
		var thumbnail = $(inThumbnailElement);
		var container = $('quicklook_panel_browser');
		if (!thumbnail || !container) return true;
		var scroller = new CC.Scroller();
		scroller.scrollToInContainer(thumbnail, container);
	},
	makePreviewPanelResizeable: function() {
		var resizeHandle = Builder.node('div', {id: 'quicklook_resizehandle'});
		resizeHandle.observe('mousedown', this.handleResizeWidgetMouseDown);
		this.mPreviewPanel.insert(resizeHandle);
	},
	handleThumbnailScrollUpClick: function(inEvent) {
		var source = inEvent.findElement('.scroller');
		if (source.hasClassName('disabled')) return;
		var container = $('quicklook_panel_browser');
		this.scrollThumbnailsBrowserInDirectionByDelta(Math.floor(container.getHeight() * 0.9), 'up');
	},
	handleThumbnailScrollDownClick: function(inEvent) {
		var source = inEvent.findElement('.scroller');
		if (source.hasClassName('disabled')) return;
		var container = $('quicklook_panel_browser');
		this.scrollThumbnailsBrowserInDirectionByDelta(Math.floor(container.getHeight() * 0.9), 'down');		
	},
	scrollThumbnailsBrowserInDirectionByDelta: function(inDelta, inDirection) {
		var container = $('quicklook_panel_browser');
		if (!container) return true;
		if (this.mThumbnailScrollingEffect) this.mThumbnailScrollingEffect.cancel();
		var scrollFrom = container.scrollTop;
		var scrollTo = scrollFrom + (inDelta || 0);
		if (inDirection == 'up') scrollTo = (scrollFrom - (inDelta || 0)); 
		this.mThumbnailScrollingEffect = new Effect.Tween(container,
			scrollFrom,
			scrollTo,
			{duration: 0.4, afterFinish: this.updateThumbnailScrollers.bind(this)},
			function(p) { container.scrollTop = p.round(); }
		);
	},
	updateThumbnailScrollers: function() {
		var container = $('quicklook_panel_browser');
		var up = $('quicklook_panel_thumbnails_scroll_up');
		var down = $('quicklook_panel_thumbnails_scroll_down');
		(container.scrollTop <= 0) ? up.addClassName('disabled') : up.removeClassName('disabled');
		(container.scrollTop >= (container.scrollHeight - container.getHeight())) ? down.addClassName('disabled') : down.removeClassName('disabled');
	},
	handleResizeWidgetMouseDown: function(inEvent) {
		Event.stop(inEvent);
		var dragcanvas = Builder.node('div', {id:'quicklook_dragcanvas'});
		var dragoutline = Builder.node('div', {id: 'quicklook_dragoutline'});
		Element.insert(this.mPreviewPanel, {after: dragcanvas});
		Element.insert(this.mPreviewPanel, {after: dragoutline});
		dragoutline.setStyle({
			'width': this.mPreviewPanel.getStyle('width'),
			'height': this.mPreviewPanel.getStyle('height'),
			'left': this.mPreviewPanel.getStyle('left'),
			'top': this.mPreviewPanel.getStyle('top')
		});
		var offset = Element.cumulativeOffset(this.mPreviewPanel);
		this.mMouseDownPosition.x = offset.left + this.mPreviewPanel.getWidth();
		this.mMouseDownPosition.y = offset.top + this.mPreviewPanel.getHeight();
		dragcanvas.observe('mousemove', this.handleResizeWidgetMouseDrag);
		// 6405528
		Event.observe(document, 'mouseup', this.handleResizeWidgetEndMouseDrag);
		// 6417450
		Event.stopObserving(document, 'keydown', this.handleWindowKeyboardEvent);
	},
	handleResizeWidgetMouseDrag: function(inEvent) {
		Event.stop(inEvent);
		var dragoutline = $('quicklook_dragoutline');
		var oldPosition = {
			'left': Position.cumulativeOffset(dragoutline).left,
			'top': Position.cumulativeOffset(dragoutline).top,
			'width': dragoutline.getWidth(),
			'height': dragoutline.getHeight()
		};
		// Calculate delta for the mouse gesture we just tracked.
		var delta = {'x': inEvent.pointerX() - this.mMouseDownPosition.x, 'y': inEvent.pointerY() - this.mMouseDownPosition.y};
		// Calculate the new dimensions and position so that we maintain the
		// aspect ratio of the window.
		var newWidth = oldPosition.width + delta.x;
		var widthScaleFactor = newWidth / this.mDefaultPanelSize.width;
		var newHeight = Math.round(this.mDefaultPanelSize.height * widthScaleFactor);
		// Constrain to minimum and maximum bounds.
		if (newWidth < this.mDefaultPanelSize.width) {
			newWidth = this.mDefaultPanelSize.width;
			newHeight = this.mDefaultPanelSize.height;
		}
		if (newWidth > (d.viewport.getWidth() - (2 * this.mFullScreenBoundary))) return;
		if (newHeight > (d.viewport.getHeight() - (2 * this.mFullScreenBoundary))) return;
		// Update the positioning given the new dimensions.
		var newLeft = (d.viewport.getWidth() / 2) - (newWidth / 2);
		var newTop = ((d.viewport.getHeight() / 2) + d.viewport.getScrollOffsets().top) - (newHeight / 2);
		// Update the drag outline.
		dragoutline.setStyle({
			'width': newWidth + 'px',
			'left': newLeft + 'px',
			'height': newHeight + 'px',
			'top': newTop + 'px'
		});
		this.mMouseDownPosition.x = newLeft + newWidth;
		this.mMouseDownPosition.y = newTop + newHeight;
	},
	handleResizeWidgetEndMouseDrag: function(inEvent) {
		Event.stop(inEvent);
		var dragcanvas = $('quicklook_dragcanvas');
		if (!dragcanvas) return true;
		Element.remove(dragcanvas);
		// Resize the quicklook panel to match the drag outline.
		var dragoutline = $('quicklook_dragoutline');
		if (!dragoutline) return true;
		this.mPreviewPanel.setStyle({
			'width': dragoutline.getStyle('width'),
			'height': dragoutline.getStyle('height'),
			'left': dragoutline.getStyle('left'),
			'top': dragoutline.getStyle('top')
		});
		// Resize any content views to match the new height.
		this.updatePreviewPanelChildElementsAfterResize(parseInt(dragoutline.getStyle('height')));
		dragoutline.remove();
		// 6405528
		Element.stopObserving(document, 'mouseup', this.handleResizeWidgetEndMouseDrag);
		// 6417450
		Event.observe(document, 'keydown', this.handleWindowKeyboardEvent);
	},
	toggleFullScreenMode: function(inOptEvent) {
		if (inOptEvent) inOptEvent.stopPropagation();
		var btn = $('quicklook_hud_scale');
		if (btn.hasClassName('disabled')) return true;
		if (btn.hasClassName('fitscreen')) {
			// 6385209
			if (this.mStashedPreviousPosition) {
				this.resize(this.mStashedPreviousPosition);
				delete this.mStashedPreviousPosition;
			}
			$('quicklook_hud_scale').removeClassName('fitscreen');
			$('quicklook_hud_scale').addClassName('fullscreen');
			$('quicklook_panel_preview').removeClassName('fullscreen');
			var handle = $('quicklook_resizehandle');
			if (handle) handle.show();
			this.mFullScreenMode = false;
			globalNotificationCenter().publish(CC.QuickLook.NOTIFICATION_QUICKLOOK_DID_EXIT_FULLSCREEN_MODE);
		}
		else {
			// 6385209
			this.mStashedPreviousPosition = {
				'width': parseInt(this.mPreviewPanel.getStyle('width')),
				'height': parseInt(this.mPreviewPanel.getStyle('height')),
				'left': parseInt(this.mPreviewPanel.getStyle('left')),
				'top': parseInt(this.mPreviewPanel.getStyle('top'))
			}	
			this.resize(this.calculateFullScreenWidthHeightLeftTop());
			var handle = $('quicklook_resizehandle');
			if (handle) handle.hide();
			
			$('quicklook_panel_preview').addClassName('fullscreen');
			this.switchPannedImage();
			this.mFullScreenMode = true;
			globalNotificationCenter().publish(CC.QuickLook.NOTIFICATION_QUICKLOOK_DID_ENTER_FULLSCREEN_MODE);
		}
	},
	makePreviewPanable: function() {
		// If the preview image we're currently showing is taller or wider
		// than the default quick look panel size, enable the "expand" arrows
		// for viewing at 100%. Otherwise, dim the button and disable window
		// resizing.
		var currentImage = $('quicklook_now_showing');
		if (!currentImage || !currentImage.src) return true
		var previewImage = Element.extend(new Image());
		var callback = function() {
			var expandButton = $('quicklook_hud_scale');
			if (!expandButton) return true;
			var panX = previewImage.width > this.mDefaultPanelSize.width;
			var panY = previewImage.height > this.mDefaultPanelSize.height;
			if (panX || panY) {
				expandButton.removeClassName('disabled')
			}
			else {
				expandButton.addClassName('disabled');
				var handle = $('quicklook_resizehandle');
				if (handle) handle.remove();
			}
		};
		previewImage.observe('load', callback.bind(this));
		previewImage.src = currentImage.src;
	},
	switchPannedImage: function() {
		$('quicklook_hud_scale').removeClassName('fullscreen');
		$('quicklook_hud_scale').addClassName('fitscreen');
	},
	handleAttachmentDownloadClick: function(inEvent) {
		var href = '%@/files/download/%@'.fmt(env().root_path, this.mEntityGUID);
		window.location.href = href;
	},
	handleWindowResized: function(inEvent) {
		this.centerPreviewPanel();
	},
	handleWindowMouseDown: function(inEvent) {
		var quicklook = $('quicklook_panel');
		if (quicklook && !Position.within(quicklook, inEvent.pointerX(), inEvent.pointerY())) {
			this.hidePreviewPanel();
		}
	},
	handleWindowScrolled: function(inEvent) {
		// Allow normal scrolling inside the thumbnail browser.
		var thumbnailBrowser = inEvent.findElement('#quicklook_panel_browser');
		if (thumbnailBrowser) {
			var mouseDelta = inEvent.detail ? inEvent.detail : (-1) * (inEvent.wheelDelta / 40);
			// Are we scrolling past the top or the bottom?
			if (thumbnailBrowser.scrollTop + mouseDelta <= 0) inEvent.stop();
			if ((thumbnailBrowser.scrollTop + thumbnailBrowser.offsetHeight + mouseDelta) >= thumbnailBrowser.scrollHeight) inEvent.stop();
		}
	},
	handleKeyboardNotification: function(inMessage, inObject, inOptExtras) {
		if (!this.mNowShowing) return;
		var inEvent = Event.extend(inOptExtras.event);
		Event.stop(inEvent);
		switch (inMessage) {
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_ESC:
				this.hidePreviewPanel();
				break;
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_LEFT:
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_UP:
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_RIGHT:
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_DOWN:
				var browser = $('quicklook_panel_browser')
				if (!browser) break;
				var selectedThumbnail = browser.down('.thumbnail.selected');
				if (!selectedThumbnail) break;
				var thumbnail = selectedThumbnail.previous('.thumbnail');
				if (inMessage == CC.Keyboard.NOTIFICATION_DID_KEYBOARD_RIGHT || inMessage == CC.Keyboard.NOTIFICATION_DID_KEYBOARD_DOWN) thumbnail = selectedThumbnail.next('.thumbnail');
				var targetThumbnail = thumbnail || selectedThumbnail;
				this.switchDisplayedPreview(targetThumbnail);
				break;
		}
	}
}
