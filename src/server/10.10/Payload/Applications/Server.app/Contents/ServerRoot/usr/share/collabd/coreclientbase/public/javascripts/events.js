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

// Global event instance. Supports registration for events using a delegate model where an event
// registration is a tuple of DOM responder identifer (e.g. div#abc123) and callback function. A
// single event handler is registered on the window object and as events fire, they are handed off
// to any receivers that have made themselves known. Allows us to register less handlers for
// performance, but more importantly supports event registration on elements inside a contentEditable
// container which survive undo/redo events.

var GlobalEventDelegate = Class.createWithSharedInstance('globalEventDelegate');
GlobalEventDelegate.prototype = {
	mEventResponderRegistry: null,
	mRegisteredHandlersCache: null,
	initialize: function() {
		bindEventListeners(this, ['handleEventFired']);
		this.mEventResponderRegistry = new Hash();
		this.mRegisteredHandlersCache = {};
	},
	// Registers a DOM-responder for a given event by identifer. When an event fires that is
	// recieved by the global event delegate, we determine the closest element to the
	// event source matching an event responder, and delegate to that responder.
	registerDomResponderForEventByIdentifer: function(inEventName, inIdentifer, inCallback) {
		if (!inEventName) return false;
		if (inEventName == "click" && browser().isMobile()) {
			inEventName = "touchstart";
		}
		
		logger().debug("registerDomResponderForEventByIdentifer: %o %o", inEventName, inIdentifer);
		var responders = this.mEventResponderRegistry.get(inEventName);
		if (!responders) responders = this.mEventResponderRegistry.set(inEventName, new Hash());
		responders.set(inIdentifer, inCallback);
		this._registerEventHandlerForResponder(inEventName);
		return true;
	},
	bulkRegisterDomResponderForEventByIdentifer: function(inBatch) {
		if (!inBatch) return false;
		var batchItem;
		for (var batchIdx = 0; batchIdx < inBatch.length; batchIdx++) {
			batchItem = inBatch[batchIdx];
			this.registerDomResponderForEventByIdentifer(batchItem[0], batchItem[1], batchItem[2]);
		}
	},
	_registerEventHandlerForResponder: function(inEventName) {
		// Strictly one event handler per customer for performance.
		if (!this.mRegisteredHandlersCache[inEventName]) {
			Event.observe(window, inEventName, this.handleEventFired);
		}
	},
	// Unregisters a previously registered responder for an event name by identifer.
	unregisterDomResponderForEventByIdentifer: function(inEventName, inIdentifer) {
		if (!inEventName || !inIdentifer) return false;
		var eventResponders = this.mEventResponderRegistry.get(inEventName);
		if (!eventResponders || !eventResponders.get(inIdentifer)) return false;
		delete eventResponders[inIdentifer];
		this.mEventResponderRegistry.set(inEventName, eventResponders);
		return true;
	},
	// Unregisters all responders for a given event name.
	unregisterDomRespondersForEvent: function(inEventName) {
		if (!inEventName) return false;
		this.mEventResponderRegistry.unset(inEventName);
		return true;
	},
	// Handles an event, delegating to a registered DOM responder where possible. 
	handleEventFired: function(inEvent) {
		var type, responders, eventElement, nearesetResponder, nearestResponderId, nearestResponderCallback;
		// Do we have any responders for this event type?
		type = inEvent.type;
		responders = this.mEventResponderRegistry.get(type);
		if (responders) {
			eventElement = Event.element(inEvent);
			// Find the nearest responder in the document. For performance, check if the direct event
			// source element is a responder for this event. Otherwise walk up the direct ancestors tree.
			var workingNode = eventElement, workingNodeId;
			while (workingNode) {
				workingNodeId = (workingNode.id || (workingNode.readAttribute && workingNode.readAttribute('data-responder-id')));
				if (workingNodeId && responders.get(workingNodeId)) {
					nearestResponder = workingNode;
					nearestResponderId = workingNodeId;
					break;
				}
				workingNode = workingNode.parentNode;
			}
			if (nearestResponderId) {
				responderCallback = responders.get(nearestResponderId);
				// Trigger the callback for the nearest responder.
				if (responderCallback) {
					logger().debug("Delegating event %o to nearest responder %o %o", type, nearestResponderId, nearestResponder);
					return responderCallback(inEvent);
				}
			}
		}
		return false;
	},
	// Debug only. Simulates an event.
	simulateEvent: function(inEventName, inIdentifer) {
		if (!inEventName || !inIdentifer) return false;
		logger().debug("simulateEvent: %o, %o", inEventName, inIdentifer);
		Event.fire($(inIdentifer), inEventName);
	}
};
