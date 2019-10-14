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

//= require "./thirdparty/prototype.js"

var CC = CC || new Object();
var CoreCollaboration = CoreCollaboration || CC;

// Warn about disabled cookies.

if (!navigator.cookieEnabled) {
	alert("_Cookies.NoCookiesUnsupported".loc());
}

// Called once the document object is available.

var d;
document.observe("dom:loaded", function() {
	d = document;
	// Signal any shared instances and delegates to be created.
	globalNotificationCenter().publish('PAGE_INITIALIZE_FINISHED', document);
});

// Creates a global that you can use to refer to an instance of a class.  Shared
// instances are referenced using a supplied name, and can be created on-demand or on
// page load (depending on the value of inOptInstantiateOnAwakeFromPage).  Auto-creating
// happens as soon as the document object is available, instead of waiting around for the
// window onload event.

function invalidate() {
	return false;
}

Class.createWithSharedInstance = function(inOptInstanceShortcutName, inOptInstantiateOnAwakeFromPage) {
	var cls = null;
	cls = function() {
		var result = this.initialize.apply(this, arguments);
		if (result == invalidate) {
			var timeoutCallback = function() {
				try {
					if (this && this['_parentClass'] && this['_parentClass']['_sharedInstance'] == this) {
						this['_parentClass']['_sharedInstance'] = null;
					}
				}
				catch(e) {
					throw e;
				}
			}
			setTimeout(timeoutCallback.bind(this), 200);
		}
	}
	cls.autocreate = inOptInstantiateOnAwakeFromPage;
	cls.sharedInstance = function() {
		if (!cls['_sharedInstance']) {
			cls['_sharedInstance'] = new cls();
			cls['_sharedInstance']['_parentClass'] = cls;
		}
		return cls['_sharedInstance'];
	}
	if (inOptInstanceShortcutName) window[inOptInstanceShortcutName] = cls.sharedInstance;
	if (inOptInstantiateOnAwakeFromPage) {
		globalNotificationCenter().subscribe('PAGE_INITIALIZE_FINISHED', function() {
			if (cls.autocreate) cls.sharedInstance();
		});
	}
	return cls;
};

// A nextTick method which ensures that the passed function will be run on the next
// iteration of the event loop. Uses setTimeout(..., 0) as a fallback, but on supporting
// browsers, uses window.postMessage, which is significantly more efficient: http://jsperf.com/postmessage
CC.RunLoop = CC.RunLoop || new Object();
CC.RunLoop._usePostMessage = (window.postMessage != null);
CC.RunLoop._pendingMessages = [];
CC.RunLoop.nextTick = function(inCallback, inOptContext) {
   if (CC.RunLoop._usePostMessage) {
       CC.RunLoop._pendingMessages.push([inCallback, inOptContext]);
       window.postMessage('__cc-nextTick', '*');
   } else {
       if (inOptContext != null) {
           setTimeout(function() {
               inCallback.call(inOptContext);
           }, 0);
       } else {
           setTimeout(inCallback, 0);
       }
   }
};

if (browserSupportsAddEventListener()) {
	window.addEventListener('message', function(e){
	   if (e.source == window && e.data == '__cc-nextTick') {
	       e.stopPropagation();

	       while (CC.RunLoop._pendingMessages.length > 0) {
	           var fn = CC.RunLoop._pendingMessages.shift();
	           if (fn[1] != null)
	               fn[0].call(fn[1]);
	           else
	               fn[0]();
	       }
	   }
	}, false);
}

// Javascript port of NSNotificationCenter allowing you to broadcasting notifications.
// Basically a notification dispatch table where callback functions can be registered
// and executed when a notification is received matching a given name from a given sender.
// Delivers notifications to observers synchronously.

CC.Notifications = CC.Notifications || new Object();
CC.Notifications.Mixins = CC.Notifications.Mixins || new Object();

// Optimization when broadcasting notifications to a large number of recipients.

CC.Notifications.Mixins.SupportsOptimizedNotifications = {
	mSupportsOptimizedNotifications: true,
	// Returns a unique string identifier representation for this object. Allows us
	// to look up notification recievers for a targeted notification in linear time.
	getNotificationsIdentifer: function() { /* Interface */ }
};

CC.Notifications.GlobalNotificationCenter = Class.createWithSharedInstance('globalNotificationCenter');
CC.Notifications.GlobalNotificationCenter.prototype = {
	initialize: function() {
		// A hash of callback functions keyed by notification identifier.
		this.mGenericSubscribers = {};
		// A hash of targeted callbacks keyed by notification identifer.
		this.mTargetedSubscribers = {};
		// An optimized hash of targeted callbacks keyed by message name and notification identifier.
		this.mOptimizedTargetedSubscribers = {};
	},
	publish: function(inMessage, inObject, inOptExtras) {
		if (!inMessage) return false;
		var shouldNotifyGenericSubscribers = true;
		if (inObject != undefined) {
			// Notify any targeted subscribers.
			if (inObject.mSupportsOptimizedNotifications) {
				var optimized = this.mOptimizedTargetedSubscribers[inMessage];
				if (optimized) {
					var optimizedSubscriber = optimized[inObject.getNotificationsIdentifer()];
					if (optimizedSubscriber) optimizedSubscriber(inMessage, inObject, inOptExtras);
					shouldNotifyGenericSubscribers = false;
				}
			} else {
				var targetedSubscribers = this.mTargetedSubscribers[inMessage];
				if (targetedSubscribers) {
					var targetedIdx, targetedSubscriber, callback;
					for (targetedIdx = 0; targetedIdx < targetedSubscribers.length; targetedIdx++) {
						targetedSubscriber = targetedSubscribers[targetedIdx];
						callback = targetedSubscriber[0], o = targetedSubscriber[1];
						if (o == inObject && callback) callback(inMessage, inObject, inOptExtras);
					}
					shouldNotifyGenericSubscribers = false;
				}
			}
		}
		// Notify any generic subscribers (if we need to)
		if (shouldNotifyGenericSubscribers) {
			var callbacks = this.mGenericSubscribers[inMessage], callbackIdx, callback;
			if (callbacks) {
				for (callbackIdx = 0; callbackIdx < callbacks.length; callbackIdx++) {
					callback = callbacks[callbackIdx];
					callback(inMessage, inObject, inOptExtras);
				}
			}
		}
		// Always signal the test tool where it exists.
		if (window.parent && window.parent.AppleUnitTester) {
			window.parent.AppleUnitTester.sharedTester().publishMessage(inMessage);
		}
		return true;
	},
	subscribe: function(inMessage, inCallback, inOptObject) {
		if (!inMessage || !inCallback) return false;
		// Is this subscription targeted?
		if (inOptObject != undefined) {
			if (inOptObject.mSupportsOptimizedNotifications) {
				if (!this.mOptimizedTargetedSubscribers[inMessage]) this.mOptimizedTargetedSubscribers[inMessage] = {};
				var notificationID = inOptObject.getNotificationsIdentifer();
				var targetedSubscribersForMessage = this.mOptimizedTargetedSubscribers[inMessage];
				targetedSubscribersForMessage[notificationID] = inCallback;
			} else {
				if (!this.mTargetedSubscribers[inMessage]) this.mTargetedSubscribers[inMessage] = new Array();
				this.mTargetedSubscribers[inMessage].push([inCallback, inOptObject]);
			}
		} else {
			if (!this.mGenericSubscribers[inMessage]) this.mGenericSubscribers[inMessage] = new Array();
			this.mGenericSubscribers[inMessage].push(inCallback);
		}
	},
	unsubscribe: function(inMessage, inCallback, inOptObject) {
		if (inOptObject) {
			if (inOptObject.mSupportsOptimizedNotifications) {
				var optimized = this.mOptimizedTargetedSubscribers[inMessage];
				if (optimized) return optimized.unset(inOptObject.getNotificationsIdentifer());
				return true;
			}
			var targeted = this.mTargetedSubscribers[inMessage]
			if (targeted) {
				this.mTargetedSubscribers = this.mTargetedSubscribers[inMessage].reject(function(subscriber) {
					return (subscriber[0] == inCallback && subscriber[1] == inOptObject);
				});
			}
		}
		if (!this.mGenericSubscribers[inMessage]) return false;
		this.mGenericSubscribers = this.mGenericSubscribers[inMessage].without(inCallback);
		return true;
	}
};

var prototypeEventObserve = Event.observe;
Event.observe = function(elem, strEvent, callback) {
	var isMobile = /Mobile/.test(navigator.userAgent);
	if (strEvent == 'click' && isMobile) {
		strEvent = 'touchstart';
	}
	prototypeEventObserve(elem, strEvent, callback);
}

// Binds a series of event handlers to a given source.

function bindEventListeners(inParentObject, inFunctionArray) {
	if (!inParentObject || !inFunctionArray) return this;
	inFunctionArray.each(function(f) {
		inParentObject[f] = inParentObject[f].bindAsEventListener(inParentObject);
	});
}

function observeEvents(inParentObj, inElement, inFnNameArray, inOptStopObserving) {
	var elm = $(inElement);
	$H(inFnNameArray).each(function(handler) {
		if (inOptStopObserving) Event.stopObserving(elm, handler.key, inParentObj[handler.value]);
		else Event.observe(elm, handler.key, inParentObj[handler.value]);
	});
}

function stopObservingEvents(inParentObj, inElement, inFnNameArray) {
	observeEvents(inParentObj, inElement, inFnNameArray, true);
}

// Removes every child node from a given parent.

function removeAllChildNodes(inParent) {
	inParent = $(inParent);
	while (inParent.childNodes.length > 0) {
		inParent.removeChild(inParent.firstChild);
	}
}

// Replaces the contents of an element with a string or another element. Passing inEvaluate
// as true raises the safety flag for using innerHTML for the replacement.

function replaceElementContents(inElement, inStringOrObj, inEvaluate) {
	var elm = $(inElement);
	if (typeof inStringOrObj == 'string' && inEvaluate) {
		elm.innerHTML = inStringOrObj;
	}
	else {
		removeAllChildNodes(elm);
		if (typeof inStringOrObj == 'string') {
			elm.appendChild(elm.ownerDocument.createTextNode(inStringOrObj));
		} else if (inStringOrObj) {
			elm.appendChild(inStringOrObj);
		}
	}
}

function insertAtBeginning(inElement, inParentElement) {
	var elm = $(inParentElement);
	if (!elm) return false;
	if (elm.childNodes.length > 0) elm.insertBefore($(inElement), elm.firstChild);
	else elm.appendChild($(inElement));
}

function insertAfter(inElement, inSibling) {
	var elm = $(inElement);
	var sibling = $(inSibling);
	var nextSibling = sibling.nextSibling;
	if (nextSibling) nextSibling.parentNode.insertBefore(elm, nextSibling);
	else sibling.parentNode.appendChild(inElement);
}

function insertBefore(inElement, inReferenceElement) {
	var elm = $(inElement);
	var ref = $(inReferenceElement);
	ref.parentNode.insertBefore(elm, ref);
}

// Moves all children of an element before the parent, and removes the unwanted parent.

function promoteElementChildren(inParent) {
	var fragment = document.createDocumentFragment(), currentChild;
	while (inParent && inParent.hasChildNodes()) {
		currentChild = inParent.firstChild;
		inParent.removeChild(currentChild);
		fragment.appendChild(currentChild);
	}
	inParent.parentNode.insertBefore(fragment, inParent);
	inParent.parentNode.removeChild(inParent);
}

function boundsForDiv(theDiv) {
	return offsetBoundsForDiv(theDiv); // IE can't handle fixed positioning so we can't depend on this
}

function offsetBoundsForDiv(theDiv) {
	return new Array(Element.getLeft(theDiv), Element.getTop(theDiv), theDiv.offsetWidth, theDiv.offsetHeight);
}

function blur() {
	try {
		var anchors = $A(d.getElementsByTagName('a'));
		if(anchors.length){
			var firstLink = anchors.detect(function(elm) {return elm.href});
			firstLink.focus();
			firstLink.blur();
		}
	}
	catch(e) {}
}

// Does the browser support localStorage?

function browserSupportsLocalStorage() {
	try {
		return (('localStorage' in window) && window['localStorage'] != null);
	} catch (e) {
		return false;
	}
}


// Does the browser support addEventListener?

function browserSupportsAddEventListener() {
	try {
		return (('addEventListener' in window) && window['addEventListener'] != null);
	} catch (e) {
		return false;
	}
}

function browserSupportsModifyBodyClassName() {
	try {
		return (document && document.body && ('addClassName' in document.body) && document.body['addClassName'] != null);
	} catch (e) {
		return false;
	}
}

function browserSupportsJSON() {
	try {
		return (JSON !== undefined);
	} catch (e) {
		return false;
	}
}

function alphabeticalSort(a, b) {
	var aUp = a.toUpperCase(), bUp = b.toUpperCase();
	for (i = 0; i < aUp.length; i++) {
		if (aUp[i] < bUp[i]) {
			return -1;
		}
		if (aUp[i] > bUp[i]) {
			return 1;
		}
	}
	return 0;
}