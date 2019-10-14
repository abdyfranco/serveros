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

CC.QuickLook.NOTIFICATION_DID_FETCH_QUICKLOOK_INFO = 'DID_FETCH_QUICKLOOK_INFO';

// Basic quicklook service.

CC.QuickLook.Service = Class.create({
	// Is this the first polling request?
	mIsFirstRequest: true,
	// How often should we ask for preview information?
	mInitialInterval: 1000,
	mSubsequentInterval: 3000,
	// How many times should we ask for preview information before giving up?
	mMaxPollRequests: 50,
	mPollRequestsSoFar: 0,
	// Returns a hash of preview information for an entity with a given GUID if it
	// exists. Returns undefined where a quicklook could not be generated or a
	// preview does not exist.
	getPreviewInfoForEntityGUID: function(inGUID, inOptCallback, inOptForceRefresh) {
		if (!inGUID) return (inOptCallback ? inOptCallback() : undefined);
		var gotBatchedResponse = function(service_response) {
			var mappedEntity;
			if (service_response && service_response.responses && service_response.responses.length > 1) {
				var firstResponse = service_response.responses[1];
				var entity = firstResponse.response;
				var mappedEntity = (entity ? this._mapPreviewInfoFromEntity(entity) : undefined);
			}
			if (!inOptCallback) return mappedEntity;
			return inOptCallback(mappedEntity);
		}.bind(this);
		var batch = [
			// Kick off a preview if we need one.
			['QuickLookService', 'generateQuicklookIfNeededForFileEntityGUID:', inGUID],
			// Fetch the entity and map the result into a preview hash.
			['ContentService', 'entityForGUID:', inGUID, {'subpropertyPaths': server_proxy().mDefaultSubpropertyPaths}]
		];
		return service_client().batchExecuteAsynchronously(batch, {}, gotBatchedResponse, function() {
			console.error("Could not get preview information for entity guid (%o)", inGUID);
			return invalidate;
		});
	},
	// Fetches preview properties for a given entity on a timer. Where a preview is still
	// being generated, we poll (degrading exponentially) until the preview is ready or it
	// is deemed the preview cannot be generated.
	pollForPreviewInformation: function(inGUID, inCallback) {
		var gotResponse = function(inResponse) {
			this.mPollRequestsSoFar += 1;
			var properties = inResponse;
			// Is the preview still generating? Have we requested too many times?
			if ((this.mPollRequestsSoFar < this.mMaxPollRequests) && (!properties || (properties && properties.status && (properties.status == 'working')))) {
				var interval = (this.mIsFirstRequest ? this.mInitialInterval : this.mSubsequentInterval);
				this.mIsFirstRequest = false;
				if (this.mRequestTimer) clearTimeout(this.mRequestTimer);
				this.mRequestTimer = setTimeout(function() {
					this.getPreviewInfoForEntityGUID(inGUID, gotResponse.bind(this));
				}.bind(this), interval);
			} else {
				if (this.mRequestTimer) {
					clearTimeout(this.mRequestTimer);
					delete this.mRequestTimer;
					this.mIsFirstRequest = true;
					this.mPollRequestsSoFar = 0;
				}
				if (inCallback) return inCallback(properties);
			}
		}.bind(this);
		return this.getPreviewInfoForEntityGUID(inGUID, gotResponse);
	},
	// Returns a hash of preview info for a file entity.
	_mapPreviewInfoFromEntity: function(inEntity) {
		var result = {};
		if (!inEntity) return undefined;
		var isQuickLookable = inEntity.isQuickLookable;
		var title = inEntity.longName;
		var result = $H({
			'status': (isQuickLookable == true || isQuickLookable == false) ? 'ready' : 'working',
			'isQuickLookable': isQuickLookable,
			'title': title
		});
		// Bail if the entity isn't quicklookable, or the preview is not yet ready.
		if (!isQuickLookable) return result.toObject();
		// Is the preview audio or video?
		var mediaType = (inEntity.mediaType || "");
		result.update({'mediaType': mediaType});
		if (inEntity.extendedAttributes) {
			var width = parseInt(inEntity.extendedAttributes.width) || 0;
			var height = parseInt(inEntity.extendedAttributes.height) || 0;
			var size = (!width.isNaN ? {'width': Math.floor(width), 'height': Math.floor(height)} : undefined);
			result.update({
				'isAudio': (mediaType.match(/audio/) != undefined),
				'isVideo': (mediaType.match(/movie|video/) != undefined),
				'size': size
			});
		}
		// Build a list of all the thumbnails and previews for this quicklook.
		var url = '%@//%@'.fmt(window.location.protocol, window.location.host);
		var mapGUIDtoURL = function(guid) {
			return url + '%@/files/download/%@'.fmt(env().root_path, guid);
		}
		var thumbnailURLs = $A(inEntity.thumbnailGUIDs).map(mapGUIDtoURL);
		var previewURLs = $A(inEntity.previewGUIDs).map(mapGUIDtoURL);
		var downloadURL = mapGUIDtoURL(inEntity.guid);
		// A preview is paginated if there is more than one preview image.
		var isPaginated = (previewURLs.length > 1);
		// Update and return.
		result.update({
			'isPaginated': isPaginated,
			'pageCount': previewURLs.length,
			'thumbnailURLs': thumbnailURLs,
			'previewURLs': previewURLs,
			'downloadURL': downloadURL,
			'fileDataEntity': inEntity
		});
		return result.toObject();
	}
});
