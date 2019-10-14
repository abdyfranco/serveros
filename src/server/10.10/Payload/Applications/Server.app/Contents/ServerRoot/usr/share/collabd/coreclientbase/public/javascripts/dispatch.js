// Copyright (c) 2014 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

/*
    dispatch.js
    A minimal kind of "GCD Lite" for use in the CalDAV library.
    
    This library does not provide actual concurrency, but it does allow you
    to serialize operations on a queue. This is used in CalDAV to simulate "pseudo-background"
    tasks. For example, when creating an event store for the current principal, the lookup
    request for the current principal is dispatched to a background queue. This allows the
    event store object to be returned immediately in a "not fully initialized" state,
    letting object methods that need full state to be delayed until everything is
    ready to run.
    
    Every attempt has been made to mimic the existing GCD API, though some
    functions have been modified to more appropriately suit JavaScript use cases.
    
    SPECIAL NOTE: if you perform an *actually* asynchronous operation inside a
    block (e.g., an Ajax call), you must dispatch_suspend before beginning the call,
    and dispatch_resume in the event handler to get the desired serial-blocking behavior.
*/

/* Class implementations */
function DispatchManager() {
    this.executionStack = [];
    this.usePostMessage = (window.postMessage != null);
	this.pauseDelay = -1;
	this.pauseHandler = null;
    
    if (this.usePostMessage) {
        this.pendingMessages = [];
        
        var self = this;
		if (browserSupportsAddEventListener()) {
	        window.addEventListener('message', function(e) {
	            if (e.source == window && e.data == '__dispatch') {
	                e.stopPropagation();
                
	                while (self.pendingMessages.length > 0) {
	                    var fn = self.pendingMessages.shift();
	                    if (fn[1] != null)
	                        fn[0].call(fn[1]);
	                    else
	                        fn[0]();
	                }
	            }
	        }, false);
		}
    }
}

DispatchManager.prototype.nextTick = function(callback, optContext) {
    if (this.usePostMessage) {
        this.pendingMessages.push([callback, optContext]);
        window.postMessage('__dispatch', '*');
    } else {
        if (optContext != null) {
            setTimeout(function() {
                callback.call(optContext);
            }, 0);
        } else {
            setTimeout(callback, 0);
        }
    }
};

DispatchManager.prototype.beginExecution = function(queue) {
    this.executionStack.push(queue);
};

DispatchManager.prototype.endExecution = function() {
    this.executionStack.pop();
};

DispatchManager.prototype.enablePauseDetection = function(callback, delay) {
	this.pauseHandler = callback;
	this.pauseDelay = delay;
};

DispatchManager.prototype.disablePauseDetection = function() {
	this.pauseHandler = null;
	this.pauseDelay = -1;
};

var __dispatch_manager = new DispatchManager();

function DispatchQueue(label) {
    this.label = label;
    this.tasks = [];
    this.executing = false;
    this.suspendCount = 0;
	this.pauseTimeout = null;
}

DispatchQueue.prototype.dispatch = function(callback) {
    // add this to the end of the queue
    this.tasks.push(callback);
    if (!this.executing)
        __dispatch_manager.nextTick(this.execute, this);
};

DispatchQueue.prototype.dispatchNext = function(callback) {
    // add this to the front of the queue
    this.tasks.unshift(callback);
    if (!this.executing)
        __dispatch_manager.nextTick(this.execute, this);
};

DispatchQueue.prototype.execute = function() {
    if (this.suspendCount > 0)
        return;
    
    this.executing = true;
    __dispatch_manager.beginExecution(this);
    
    while (this.tasks.length > 0) {
        this.tasks.shift()();
        if (this.suspendCount > 0)
            break;
    }
    
    __dispatch_manager.endExecution();
    this.executing = false;
};

DispatchQueue.prototype.suspend = function() {
    if (this.suspendCount++ == 0 && __dispatch_manager.pauseHandler !== null) {
		var queue = this;
    	this.pauseTimeout = setTimeout(function(){
    		if (__dispatch_manager.pauseHandler !== null)
				__dispatch_manager.pauseHandler.call(queue, queue);
    	}, __dispatch_manager.pauseDelay);
	}
};

DispatchQueue.prototype.resume = function() {
    if (--this.suspendCount <= 0) {
        this.suspendCount = 0;
        if (!this.executing)
            __dispatch_manager.nextTick(this.execute, this);
		
		if (this.pauseTimeout !== null) {
			clearTimeout(this.pauseTimeout);
			this.pauseTimeout = null;
		}
    }
};

/* Creating and Managing Queues */
function dispatch_queue_create(label) {
    return new DispatchQueue(label);
}

function dispatch_get_current_queue() {
    if (__dispatch_manager.executionStack.length == 0)
        return null;
    
    return __dispatch_manager.executionStack[__dispatch_manager.executionStack.length - 1];
}

function dispatch_queue_get_label(queue) {
    return queue.label;
}

/* Queuing Tasks for Dispatch */
function dispatch_async(queue, callback) {
    queue.dispatch(callback);
}

// Note: we can't wait() because JavaScript is single-threaded; this just does async
function dispatch_sync(queue, callback) {
    if (console && console.warn)
        console.warn('dispatch_sync is unavailable, performing dispatch_async instead');
    
    dispatch_async(queue, callback);
}

function dispatch_after(delay, queue, callback) {
    setTimeout(function() {
        queue.dispatchNext(callback);
    }, delay);
}

// This takes an optional continuation block to be called when all iterations are done
function dispatch_apply(iterations, queue, callback, continuation) {
    dispatch_async(queue, function() {
        for (var i = 0; i < iterations; i++)
            callback(i);
        
        if (typeof(continuation) === 'function')
            __dispatch_manager.nextTick(continuation);
    });
}

/* Suspending and resuming */
function dispatch_suspend(queue) {
    queue.suspend();
}

function dispatch_resume(queue) {
    queue.resume();
}

/* Debugging */
function dispatch_enable_pause_detection(callback, delay) {
	__dispatch_manager.enablePauseDetection(callback, delay);
}

function dispatch_disable_pause_detection() {
	__dispatch_manager.disablePauseDetection();
}
