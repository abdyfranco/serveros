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

//= require "./image.js"
//= require "./file.js"

CC.WikiEditor.MediaBlock = Class.create(CC.WikiEditor.ImageBlock, {
	mBlockView: 'CC.WikiEditor.MediaBlockView'
});

CC.WikiEditor.MediaBlockView = Class.create(CC.WikiEditor.FileBlockView, {
	mDefaultMovieDimensions: {'width': 384, 'height': 288},
	mDefaultAudioDimensions: {'width': 258, 'height': 258},
	mDeleteDialogTitle: "_Editor.Block.Media.Dialog.Delete.Title".loc(),
	mDeleteDialogDescription: "_Editor.Block.Media.Dialog.Delete.Description".loc(),
	renderAsHTML: function() {
		var eventDelegateIdentifer = this.getEventDelegateIdentifer();
		return "<div class=\"container wrapchrome loading\"><div id=\"%@\" class=\"delete clickable chrome\">%@</div><div id=\"%@\" class=\"placeholder clickable wrapchrome\"></div></div>".fmt(eventDelegateIdentifer + "-container-delete", "_Editor.Delete.Block".loc(), eventDelegateIdentifer + "-container-placeholder");
	},
	registerEventHandlers: function() {
		bindEventListeners(this, [
			'handleDeleteButtonClick',
			'handlePosterImageClicked'
		]);
		globalEventDelegate().registerDomResponderForEventByIdentifer('click', this.getEventDelegateIdentifer() + "-container-delete", this.handleDeleteButtonClick);
		this.fetchPreviewProperties();
	},
	handlePosterImageClicked: function(inEvent) {
		var fileBlock = this.mContent.mRecord;
		var mediaPath = this.buildFileURL();
		// Fetch the width of the poster image.
		var posterDimensions = this.mDefaultMovieDimensions;
		var posterImage = this.$('.placeholder img');
		if (posterImage) {
			var _posterDimensions = posterImage.getDimensions();
			if (_posterDimensions.width > 0) {
				posterDimensions = _posterDimensions
			}
		}
		this.$('.placeholder').hide();
		var mediaElement = Builder.node('div', {className: 'media'});
		this.$('.container').appendChild(mediaElement);
		qtMediaExpander().expandMedia({'src': mediaPath, 'width': posterDimensions.width, 'height': posterDimensions.height, 'mediaType': posterImage.alt}, undefined, mediaElement, 'transparent');
	},
	// Fetches the preview information for this media, displaying a suitable poster
	// image and updating the dimensions of the media block on success, or displaying
	// an error message on failure
	fetchPreviewProperties: function() {
		var fileDataEntityGUID = this.mContent.getRecordPropertyForPath('extendedAttributes.fileDataGUID');
		var gotPreviewInformation = function(properties) {
			var elem = this.$('.container');
			// Remove any loading placeholders.
			elem.removeClassName('loading');
			// If we have no preview, show some placeholder error text.
			var quicklookable = (properties && properties.isQuickLookable);
			var audio = (properties && properties.mediaType && (properties.mediaType == 'audio'));
			var movie = (properties && properties.mediaType && (properties.mediaType == 'movie'));
			if (!quicklookable || !(audio || movie)) {
				elem.down('.placeholder').appendChild(Builder.node('h2', "_Editor.Block.Media.Preview.Missing".loc()));
				return;
			}
			var parentElement = elem.down('.placeholder');
			// Render the play overlay.
			parentElement.appendChild(Builder.node('div', {className: 'play'}));
			// If we're showing a movie, size the preview.
			var mediaType = properties.mediaType, previewWidth, previewHeight, posterImageSrc;
			var size = properties.size;
			if (mediaType == 'movie') {
				var maxSize = this.mDefaultMovieDimensions;
				if (size.width && size.height) maxSize = this.calculateMaxPreviewSize(size.width, size.height, elem);
				previewWidth = maxSize.width;
				previewHeight = maxSize.height;
				if (properties.previewURLs.length > 0) {
					posterImageSrc = properties.previewURLs[0];
				}
			} else if (mediaType == 'audio') {
				previewWidth = this.mDefaultAudioDimensions.width;
				previewHeight = this.mDefaultAudioDimensions.height;
				posterImageSrc = '/__collabd/coreclientbase/stylesheets/wikieditor/img/media_audio_poster.png';
			}
			// Append the poster image for the media preview (if we have it).
			var posterImage = Builder.node('img', {'width': previewWidth + 'px', 'height': previewHeight + 'px', 'alt': mediaType}); // store media type into alt attribute
			if (posterImageSrc) {
				posterImage.src = posterImageSrc;
				posterImage.show();
			} else {
				posterImage.hide();
			}
			parentElement.appendChild(posterImage);
			if (previewWidth && previewHeight) {
				parentElement.setStyle({
					'width': previewWidth + 'px',
					'height': previewHeight + 'px'
				});
			}
			this.$().addClassName(mediaType);
			// Only respond to click/tap once fully loaded.
			globalEventDelegate().registerDomResponderForEventByIdentifer('click', this.getEventDelegateIdentifer() + "-container-placeholder", this.handlePosterImageClicked);
		};
		quicklook().mService.pollForPreviewInformation(fileDataEntityGUID, gotPreviewInformation.bind(this));
	},
	// Determines the maximum dimensions for a preview based on the width of the page.
	// The height of the preview is scaled proportionally.
	calculateMaxPreviewSize: function(inWidth, inHeight, inOptElement) {
		if (!inWidth || !inHeight) return;
		var element = (inOptElement || this.$());
		var containerWidth = element.up('.wrapper').getLayout().get('width'); // Takes .wrapper padding into account
		var maxWidth = Math.round(Math.min(containerWidth, inWidth));
		var maxHeight = Math.round(maxWidth * (inHeight / inWidth));
		return {'width': maxWidth, 'height': maxHeight};
	}
});

globalEditorPluginManager().registerBlockType('media', 'CC.WikiEditor.MediaBlock', {});
