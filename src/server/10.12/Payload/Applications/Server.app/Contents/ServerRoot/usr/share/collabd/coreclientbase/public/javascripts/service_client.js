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
//= require "./ext/object.js"
//= require "./entity_types.js"

CC.ServiceClient = CC.ServiceClient || new Object();

// Simple JSON encoder/decoder classes.

CC.ServiceClient.JSONEncoder = Class.create({
	encode_object: function(obj) {
		return JSON.stringify(obj, function(key, val) {
			if (val instanceof Date) {
				return csDateTimeFromDate(val);
			}
			return val;
		}.bind(this))
	}
});

CC.ServiceClient.JSONDecoder = Class.create({
	decode_object: function(data) {
		return JSON.parse(data, function(key, val) {
			if (val && val.type && val.type == 'com.apple.DateTime') {
				return dateFromCSDateTime(val);
			}
			return val;
		});
	}
});

// Service client instance.

CC.ServiceClient.ServiceClientSharedInstance = Class.createWithSharedInstance('service_client');
CC.ServiceClient.ServiceClientSharedInstance.prototype = {
	basePath: "/collabdproxy",
	encoder: null,
	decoder: null,
	session_guid: null,
	referencedObjects: null,
	// Automatic request batching support.
	autobatchRequests: true,
	autobatchWindow: 100, // 100ms
	autobatchQueue: [],
	initialize: function() {
		this.encoder = new CC.ServiceClient.JSONEncoder();
		this.decoder = new CC.ServiceClient.JSONDecoder();
	},
	__httpPUT: function(inRequestData, inCallback, inErrback) {
		logger().info(inRequestData);
		return new Ajax.Request(this.basePath, {
			method: 'put',
			contentType: 'application/json',
			postBody: inRequestData,
			onSuccess: function(response) {
				var unpacked = this.unpackResponse(response);
				return inCallback(unpacked);
			}.bind(this),
			onFailure: inErrback
		});
	},
	__sendRequestAsynchronously: function(inRequest, inOptions, inCallback, inErrback) {
		if (inOptions != undefined) {
			// If this is a batch request, auto-forward request options to individual requests in the batch.
			// Otherwise set request options on the request itself.
			if (inRequest.type == "com.apple.BatchServiceRequest") {
				var requests = inRequest.requests;
				for (var requestIdx = 0; requestIdx < requests.length; requestIdx++) {
					var request = this.setRequestOptionsForRequest(requests[requestIdx], inOptions);
					requests[requestIdx] = request;
				}
			} else {
				inRequest = this.setRequestOptionsForRequest(inRequest, inOptions);
			}
		}
		// Encode the request.
		var requestData = this.encoder.encode_object(inRequest);
		// Make the request.
		return this.__httpPUT(requestData, function(response) {
			// Catch CSSessionRequiredError exception and force-rebuild the session.
			if (response && response.response && response.response.exceptionName) {
			 	if (response.response.exceptionName == 'CSSessionRequiredError') {
					sessions().currentOrNewSessionAsynchronously(true, function(session) {
						return this.__sendRequestAsynchronously(inRequest, inOptions, inCallback, inErrback);
					}.bind(this), Prototype.emptyFunction)
					return;
				}
				logger().error("Exception: " + response.response.exceptionName + " " + response.response.exceptionString);
				if (inErrback) inErrback(response);
				return;
			}
			if (inCallback) inCallback(response);
			return;
		}.bind(this), inErrback);
	},
	// Immediately flushes the autobatched service request queue.
	flushQueuedServiceRequests: function() {
		setTimeout(this.__flushAutobatchQueue.bind(this), 10);
	},
	// Flushes the current set of queued requests by packaging them up in a single batch request.
	__flushAutobatchQueue: function() {
		var queue = this.autobatchQueue;
		this.autobatchQueue = [];
		logger().info("Flushing service client autobatched request queue (%@ items)".fmt(queue.length));
		// Do we have anything in the queue to flush?
		if (!queue || queue.length == 0) return;
		// Build a new batch request by iterating the autobatch queue.
		var batchedRequest = new CC.EntityTypes.BatchServiceRequest();
		var requests = [], orderedCallbackTuples = [];
		for (var idx = 0; idx < queue.length; idx++) {
			var item = queue[idx];
			var request = item[0], options = item[1], callback = item[2], errback = item[3];
			// If the queued request is already a batch request, something is badly wrong.
			if (request.type == "com.apple.BatchServiceRequest") {
				logger().error("Found a com.apple.BatchServiceRequest request in the service client autobatch queue (%@)... skipping", request);
				continue;
			} else {
				if (options) request = this.setRequestOptionsForRequest(request, options);
				requests.push(request);
				logger().info("    Included request: %@ %@".fmt(request.serviceName, request.methodName));
				orderedCallbackTuples.push([callback, errback]);
			}
		}
		// Actually make the service request.
		batchedRequest.requests = requests;
		(function(callbackTuples) {
			this.__sendRequestAsynchronously(batchedRequest, undefined, function(response) {
				// Intercept the response so we can call any callbacks/errbacks in order.
				var _responses = $A(response.responses);
				for (var rdx = 0; rdx < _responses.length; rdx++) {
					var _response = _responses[rdx];
					var callbacks = callbackTuples[rdx];
					if (_response && _response.succeeded) {
						logger().debug("Got batched response %@, dispatching result to callback function", _response);
						(callbacks[0] || Prototype.emptyFunction)(_response);
					} else {
						logger().debug("Got batched response %@, dispatching result to errback function", _response);
						(callbacks[1] || Prototype.emptyFunction)(_response);
					}
				}
			}, function() {
				logger().error("Failed to flush autobatch queue because an error occurred");
			});
		}.bind(this))(orderedCallbackTuples);
	},
	queueRequest: function(inRequest, inOptions, inCallback, inErrback) {
		// Enqueue the request in the autobatch queue. If autobatching is enabled and we don't have an active
		// timer, create a new queue flushing timer which flushes the autobatch queue. If autobatching is disabled
		// flush the autobatch queue right away without using a timer.
		this.autobatchQueue.push([inRequest, inOptions, inCallback, inErrback]);
		// Do we need to flush the autobatch queue?
		if (this.autobatchRequests) {
			if (!this.autobatchQueueTimer) {
				this.autobatchQueueTimer = setTimeout(function() {
					delete this.autobatchQueueTimer;
					this.__flushAutobatchQueue();
				}.bind(this), this.autobatchWindow);
			}
		} else {
			this.__flushAutobatchQueue();
		}
	},
	executeAsynchronously: function(inService, inMethod, inParams, inOptions, inCallback, inErrback) {
		var request = new CC.EntityTypes.ServiceRequest();
		var sessionGUID = sessions().currentSessionCookie();
		request.sessionGUID = sessionGUID;
		request.serviceName = inService;
		request.methodName = inMethod;
		if (inParams) request.arguments = Object.isArray(inParams) ? inParams : [inParams];
		this.queueRequest(request, inOptions, inCallback, inErrback);
	},
	batchExecuteAsynchronously: function(inBatched, inOptions, inCallback, inErrback) {
		var request;
		var sessionGUID = sessions().currentSessionCookie();
		var batchedRequest = new CC.EntityTypes.BatchServiceRequest();
		batchedRequest.requests = $A(inBatched).map(function(arg) {
			request = new CC.EntityTypes.ServiceRequest();
			request.sessionGUID = sessionGUID;
			request.serviceName = arg[0];
			request.methodName = arg[1];
			if (arg.length > 2 && arg[2]) {
				request.arguments = (Object.isArray(arg[2]) ? arg[2] : [arg[2]]);
			}
			if (arg.length > 3 && arg[3]) {
				request = this.setRequestOptionsForRequest(request, arg[3]);
			}
			return request;
		}.bind(this));
		this.__sendRequestAsynchronously(batchedRequest, inOptions, inCallback, inErrback);
	},
	paginateAsynchronously: function(inService, inMethod, inParams, inOptions, inPaginationGUID, inPaginationStartIndex, inPaginationHowMany, inCallback, inErrback) {
		// Create the inner service request we will paginate.
		var request = new CC.EntityTypes.ServiceRequest();
		var sessionGUID = sessions().currentSessionCookie();
		request.sessionGUID = sessionGUID;
		request.serviceName = inService;
		request.methodName = inMethod;
		request.expandReferencedObjects = false;
		if (inParams) request.arguments = Object.isArray(inParams) ? inParams : [inParams];
		// Create the pagination request.
		var pagination = new CC.EntityTypes.PaginationRequest();
		pagination.serviceRequest = request;
		pagination.guid = inPaginationGUID;
		pagination.startIndex = inPaginationStartIndex;
		pagination.resultsLimit = inPaginationHowMany;
		// Create a wrapping service request.
		var service = new CC.EntityTypes.ServiceRequest();
		service.sessionGUID = sessionGUID;
		service.serviceName = 'ContentService';
		service.methodName = 'paginateRequest:'
		service.arguments = [pagination];
		this.__sendRequestAsynchronously(service, inOptions, inCallback, inErrback);
	},
	// Returns a tuple of response (either an response or an ordered array of responses) and an optional
	// array of referenced objects for a service request.
	unpackResponse: function(inResponse) {
		if (!inResponse) return undefined;
		var responseText = inResponse.responseText;
		var decodedResponse = this.decoder.decode_object(responseText);
		if (decodedResponse.type == "com.apple.ServiceResponse") {
			return new CC.EntityTypes.ServiceResponse(decodedResponse);
		} else if (decodedResponse.type == "com.apple.BatchServiceResponse") {
			return new CC.EntityTypes.BatchServiceResponse({'responses': decodedResponse.responses});
		} else if (decodedResponse.type == "com.apple.PaginatedResponse") {
			return new CC.EntityTypes.PaginatedResponse(decodedResponse.response);
		}
		return inResponse;
	},
	// Internal method that maps an options hash to properties on an individual request. Doesn't replace existing request properties.
	// You shouldn't normally call this method yourself.
	setRequestOptionsForRequest: function(inRequest, inOptions) {
		if (inRequest && inOptions) {
			if (inOptions.adminAuthorizationRef != undefined && inRequest.adminAuthorizationRef == undefined) inRequest.adminAuthorizationRef = inOptions.adminAuthorizationRef;
			inRequest.expandReferencedObjects = (inOptions.expandReferencedObjects == undefined ? false : (inOptions.expandReferencedObjects == true ? true : false));
			if (inOptions.referencedPathsToFollow != undefined && inRequest.referencedPathsToFollow == undefined) inRequest.referencedPathsToFollow = inOptions.referencedPathsToFollow;
			if (inOptions.subpropertyPaths != undefined && inRequest.subpropertyPaths == undefined) inRequest.subpropertyPaths = inOptions.subpropertyPaths;
			if (inOptions.clientURL != undefined && inRequest.clientURL == undefined) inRequest.clientURL = inOptions.clientURL;
			if (inOptions.hints != undefined && inRequest.hints == undefined) inRequest.hints = inOptions.hints;
		}
		return inRequest;
	}
};
