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
//= require "./logger.js"

CC.Routes = CC.Routes || new Object();

// Built-in regexp patterns for default application routes.

CC.Routes.TrailingSlashOptionalQueryParam = "/?(\\\?[^\/]+)?";
CC.Routes.SLASH_ROUTE = "/" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.WIKI_HOMEPAGE_ROUTE = "/wiki" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.WIKI_ACTIVITY_ROUTE = "/wiki/activity" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.WIKI_PROJECTS_ROUTE = "/wiki/projects" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.WIKI_PEOPLE_ROUTE = "/wiki/people" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.WIKI_TAGS_ROUTE = "/wiki/tags" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.WIKI_MYPAGE_ROUTE = "/wiki/mypage" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.WIKI_MYPAGE_ACTIVITY_ROUTE = "/wiki/mypage/activity" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.WIKI_MYPAGE_DOCUMENTS_ROUTE = "/wiki/mypage/documents" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.WIKI_MYPAGE_FAVORITES_ROUTE = "/wiki/mypage/favorites" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.WIKI_PAGES_TINYID_ROUTE = "/wiki/pages/:tinyID" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.WIKI_PAGES_TINYID_TITLE_ROUTE = "/wiki/pages/:tinyID/:title";
CC.Routes.WIKI_FILES_TINYID_ROUTE = "/wiki/files/:tinyID" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.WIKI_FILES_TINYID_TITLE_ROUTE = "/wiki/files/:tinyID/:title";
CC.Routes.WIKI_SEARCH_ROUTE = "/wiki/(search|find)/?:query";
CC.Routes.WIKI_CONTAINER_TINYID_ACTIVITY_ROUTE = "/wiki/:containerName/:tinyID/activity" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.WIKI_CONTAINER_TINYID_DOCUMENTS_ROUTE = "/wiki/:containerName/:tinyID/documents" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.WIKI_CONTAINER_TINYID_FAVORITES_ROUTE = "/wiki/:containerName/:tinyID/favorites" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.WIKI_CONTAINER_TINYID_TAGS_ROUTE = "/wiki/:containerName/:tinyID/tags" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.WIKI_CONTAINER_TINYID_BLOG_ROUTE = "/wiki/:containerName/:tinyID/blog" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.WIKI_CONTAINER_TINYID_CALENDAR_ROUTE = "/wiki/:containerName/:tinyID/calendar" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.WIKI_CONTAINER_TINYID_SETTINGS_ROUTE = "/wiki/:containerName/:tinyID/settings" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.WIKI_CONTAINER_TINYID_ROUTE = "/wiki/:containerName/:tinyID" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.WIKI_CONTAINER_TINYID_TITLE_ROUTE = "/wiki/:containerName/:tinyID/:title";

// Route notifications.

CC.Routes.NOTIFICATION_ROUTES_SHOULD_UPDATE = 'ROUTES_SHOULD_UPDATE';
CC.Routes.NOTIFICATION_ROUTE_DID_DISPATCH = 'ROUTE_DID_DISPATCH';
CC.Routes.NOTIFICATION_ROUTE_DID_COMPLETE = 'ROUTE_DID_COMPLETE';
CC.Routes.NOTIFICATION_ROUTE_DID_FAIL = 'ROUTE_DID_FAIL';

// Route constants.

CC.Routes.ROUTE_FAILED = 0;
CC.Routes.ROUTE_FIRED = 1;
CC.Routes.ROUTE_QUEUED = 2;
CC.Routes.ROUTE_IGNORED = 3;

// Base route class. A route is a combination of a route regex pattern and a callback function
// that fires when that route is matched.

CC.Routes.Route = Class.create(CC.Object, {
	mRegexPatternString: null,
	mCallback: null,
	initialize: function(/* [options] */) {
		if (arguments && arguments.length > 0) Object.extend(this, arguments[0]);
	},
	// Callback function that will fire when this route is activated. You will be passed a
	// CC.Routes.RouteInvocation instance.
	mCallback: function(inRouteInvocation) {
		window.location.url = inURL;
	}
});

// Route invocation class. Your route callback will be passed a route invocation when it fires.
// The global routes system only fires one route at a time. When your route fires, you can do
// whatever work you need to in your route callback function, but it is your responsibility to
// call routeDidComplete or routeDidFail to dequeue this route invocation from the global queue.

CC.Routes.RouteInvocation = Class.create(CC.Object, {
	// The URL that activated this route.
	url: null,
	// A hash of named regular expression matches (e.g. {tinyID: 'abc123', title: 'Title.html'}).
	namedMatches: null,
	// An array of all matches. 
	matches: null,
	// Callback function for this route.
	callback: null,
	// Should this route alter the URL hash?
	setURLHash: false,
	// Should we push a URL state for this route?
	pushURLState: false,
	// Window title for this route.
	windowTitle: "",
	// State.
	_completed: false,
	_failed: false,
	routeDidComplete: function() {
		this._completed = true;
		globalNotificationCenter().publish(CC.Routes.NOTIFICATION_ROUTE_DID_COMPLETE, this);
	},
	routeDidFail: function() {
		this._failed = true;
		globalNotificationCenter().publish(CC.Routes.NOTIFICATION_ROUTE_DID_FAIL, this);
	}
});

// A wrapper around an array that behaves as a stack.

CC.Routes.RouteHistoryStack = Class.create({
	initialize: function() {
		this.flush();
	},
	stack: function() {
		return this._stack;
	},
	// Pushes a new route on to the stack returning true where the route was added successfully.
	pushRoute: function(inRoute) {
		if (inRoute) {
			this._stack.push(inRoute);
			return true;
		}
		return false;
	},
	// Pops the least recent route from the stack and returns it.
	popLeastRecentRoute: function() {
		return this._stack.shift();
	},
	// Pops the most recent route from the stack and returns it.
	popMostRecentRoute: function() {
		return this._stack.pop();
	},
	flush: function() {
		this._stack = new Array();
	},
	isFirstLoad: function(){
		var stack = this.stack();
		if (stack.length > 1) {
			return true;
		}
		else {
			return false;
		}
	}
});

// Route handling.

CC.Routes.GlobalRouteHandler = Class.createWithSharedInstance('globalRouteHandler');
CC.Routes.GlobalRouteHandler.prototype = {
	// An array of (compiledRegex, groupingNames, callback) tuples for each registered route.
	mRegisteredRoutes: new Array(),
	// Global route queue.  Routes are dispatched from this queue in order, one at a time.
	mGlobalRouteQueue: new Array(),
	// The currently active route.
	mCurrentRoute: null,
	// Route history stack.  When a route is fired, the invocation is automatically pushed onto the route history stack.
	mRouteStack: new CC.Routes.RouteHistoryStack(),
	// The current prefire callback function.
	mRoutePrefireCallback: null,
	// Does firing a route trigger a page redirect to the route url?
	mRoutesTriggerReload: false,
	// Should we set the URL hash by default?
	mDefaultRoutesSetURLHash: false,
	// Should we push URL state by default?
	mDefaultRoutesPushURLState: false,
	// Should we route ALL links (regardless of their cc-routable status)?
	mRouteAllLinks: false,
	// The CSS selector that determines which elements should be routeable.
	mRouteSelectorPattern: '*.cc-routable:not(.cc-route-enabled)',
	initialize: function() {
		globalNotificationCenter().subscribe(CC.Routes.NOTIFICATION_ROUTES_SHOULD_UPDATE, this.handleRoutesShouldUpdateNotification.bind(this));
		globalNotificationCenter().subscribe(CC.Routes.NOTIFICATION_ROUTE_DID_COMPLETE, this.handleRouteStatusNotification.bind(this));
		globalNotificationCenter().subscribe(CC.Routes.NOTIFICATION_ROUTE_DID_FAIL, this.handleRouteStatusNotification.bind(this));
		window.onpopstate = this.handlePopStateEvent.bind(this);
	},
	// Registers an arbitrary pattern string and callback function.
	register: function(inRegexPatternString, inCallback) {
		var route = new CC.Routes.Route({
			'mRegexPatternString': inRegexPatternString,
			'mCallback': inCallback
		});
		this.registerRoute(route);
	},
	// Registers a new CC.Routes.Route handler.
	registerRoute: function(inRoute) {
		if (!CC.kindOf(inRoute, CC.Routes.Route)) logger().error("Tried to register something other than a CC.Routes.Route as a route handler");
		var patternString = inRoute.mRegexPatternString, callback = inRoute.mCallback;
		// Compile the regex for this route, and keep track of the named groupings.
		var namedParamMatchesRegex = /(:[A-Za-z0-9-_]+)/g;
		var namedParamMatches = patternString.match(namedParamMatchesRegex);
		var replacedPatternString = patternString.replace(namedParamMatchesRegex, "([^\/]+)");
		replacedPatternString = "^" + replacedPatternString.replace(/\//g, "\\/") + "$";
		// Drop the ":" off the front of each grouping name.
		var groupingNames = [];
		if (namedParamMatches) {
			for (var idx = 0; idx < namedParamMatches.length; idx++) {
				var param = namedParamMatches[idx];
				groupingNames.push(param.substring(1, param.length));
			}
		}
		// Push this registered route in reverse-registered order so routes registered later have the opportunity
		// to override default routes.
		this.mRegisteredRoutes.unshift([replacedPatternString, groupingNames, inRoute.mCallback, patternString]);
		logger().debug("Registered new route (%@, %@, %@)", replacedPatternString, groupingNames, inRoute.mCallback);
	},
	// Evaluates a URL against all registered route handlers (in the order in which they were registered). Instantiates
	// a route invocation for the first matching route, and pushes it on to the global route dispatch queue.
	__evaluateURL: function(inURLString) {
		if (!inURLString) return false;
		var routes = this.mRegisteredRoutes, route, regexp, namedGroupings, namedGrouping, callback, originalRoutePattern, matches, namedMatches;
		for (var rdx = 0; rdx < routes.length; rdx++) {
			route = routes[rdx];
			regexp = route[0], namedGroupings = route[1], callback = route[2], originalRoutePattern = route[3], matches, namedMatches = {};
			// Evaluate the URL against the compiled regular expression for this route.
			matches = inURLString.match(regexp);
			if (matches && matches.length) {
				// We got a match, do we have any named groupings?
				if (namedGroupings && namedGroupings.length) {
					for (gdx = 0; gdx < namedGroupings.length; gdx++) {
						namedGrouping = namedGroupings[gdx];
						if (namedGrouping) namedMatches[namedGrouping] = matches[gdx + 1].escapeHTML();
					}
				}
				
				if (namedMatches['containerName'] && namedMatches['containerName'] != 'projects' && namedMatches['containerName'] != 'people' && namedMatches['containerName'] != 'mypage') {
					logger().warn("Failed to find matching route for URL (%@) with container name (%@)".fmt(inURLString, namedMatches['containerName']));
					return false;
				}
				
				// Return a tuple of callback, url, hash of named matches and array of original matches for the regex.
				logger().debug("Found matching route for URL (%@, %@, %@, %@)".fmt(inURLString, namedMatches, matches, callback));
				return [callback, inURLString, namedMatches, matches, originalRoutePattern];
			} else {
				continue;
			}
		}
		logger().warn("Failed to find matching route for URL (%@)".fmt(inURLString));
		return false;
	},
	// Internal method that dispatches the next route in the global route queue. You should not call manually.
	__dispatchRoute: function(inRouteInvocation) {
		if (!inRouteInvocation || !inRouteInvocation.url) return CC.Routes.ROUTE_FAILED;
		var url = inRouteInvocation.url;
		// Do we have a queued identical route? Routes are deemed to be identical if their URLs are identical.
		var queue = this.mGlobalRouteQueue, queueItem;
		if (queue.length) {
			for (var idx = (queue.length - 1); idx >= 0; idx--) {
				queueItem = queue[idx];
				if (queueItem && queueItem.url == url) {
					logger().info("Ignoring route because an identical route is already queued (%@)".fmt(url));
					return CC.Routes.ROUTE_IGNORED;
				}
			}
		}
		// Do we have a route in progress that is identical?
		if (this.mCurrentRoute && (this.mCurrentRoute.url == url)) {
			logger().info("Ignoring route because it has a url that is identical to the last route (%@)".fmt(url));
			return CC.Routes.ROUTE_IGNORED;
		}
		// Push this route invocation onto the queue.
		this.mGlobalRouteQueue.push(inRouteInvocation);
		// Immediately dispatch if we don't have an active route already.
		if (!this.mCurrentRoute) this.__dispatchNextRoute();
	},
	__dispatchNextRoute: function() {
		delete this.mCurrentRoute;
		if (this.mGlobalRouteQueue.length > 0) {
			var queued = false;
			if (this.mGlobalRouteQueue.length != 1) queued = true;
			// Grab the next route invocation in the dispatch queue.
			var nextRoute = this.mGlobalRouteQueue.shift();
			if (nextRoute && nextRoute.callback) {
				this.mCurrentRoute = nextRoute;
				var cb = nextRoute.callback;
				cb(nextRoute);
				globalNotificationCenter().publish(CC.Routes.NOTIFICATION_ROUTE_DID_DISPATCH, nextRoute);
				// Push the route we just fired onto the route stack.
				this.mRouteStack.pushRoute(nextRoute);
				return (queued ? CC.Routes.ROUTE_QUEUED : CC.Routes.ROUTE_FIRED);
			} else {
				this.__dispatchNextRoute();
			}
		}
	},
	// Enables a route for every link tag or element with a cc-routable class name element on the page.
	handleRoutesShouldUpdateNotification: function(inMessage, inObject, inOptExtras) {
		var bound = this.routeEvent.bindAsEventListener(this);
		var routables = [], routable;
		var selector = (this.mRouteAllLinks ? 'a, ' + this.mRouteSelectorPattern : this.mRouteSelectorPattern);
		// Did we get passed an explicit root element?
		if (inOptExtras && inOptExtras.rootElement) {
			routables = $(inOptExtras.rootElement).select(selector);
		} else {
			routables = $$(selector);
		}
		for (var idx = 0; idx < routables.length; idx++) {
			routable = routables[idx];
			Event.observe(routable, 'click', bound, false);
			Element.addClassName(routable, 'cc-route-enabled');
		}
	},
	// Route status changed notification handler.
	handleRouteStatusNotification: function(inMessage, inObject, inOptExtras) {
		var didComplete = (inMessage == CC.Routes.NOTIFICATION_ROUTE_DID_COMPLETE);
		didComplete ? logger().debug("Route completed:", inObject) : logger().error("Route failed:", inObject);
		if (inObject == this.mCurrentRoute) {
			// Set the URL hash if we need to.
			var setHash = (inObject.setURLHash || this.mDefaultRoutesSetURLHash);
			if (didComplete && setHash) window.location.hash = "route=%@".fmt(inObject.url);
			// Push the URL state if we need to.
			var shouldPushURLState = (inObject.pushURLState || this.mDefaultRoutesPushURLState);
			if (didComplete && shouldPushURLState) {
				if (history.pushState) {
					history.pushState({}, (inObject.windowTitle || ""), inObject.url);
				}
				else {
					window.location = inObject.url;
				}
			}
			this.__dispatchNextRoute();
		} else {
			logger().debug("Got a route notification for a route other than the active route, ignoring");
		}
	},
	handlePopStateEvent: function(inEvent) {
		if (this.mRouteStack.isFirstLoad()) {
			this.routeURL(window.location.pathname, undefined, true, false, false, document.title);
		}
	},
	// Default callback for all routed elements which evaluates a URL to a routing tuple and fires a registered
	// callback where it exists. Otherwise the event proceeds as normal.
	routeEvent: function(inEvent) {
		var elem = Event.findElement(inEvent, '.cc-route-enabled');
		if (elem) {
			// Grab the URL by looking at a data-route-href attribute first, and an href second.
			var href = elem.getAttribute('data-route-href') || elem.getAttribute('href');
			if (href) {
				return this.routeURL(href, inEvent);
			}
		}
		return false;
	},
	routeURL: function(inURL, inOptSourceEvent, inOptRedirectOverrideFlag, inOptSetURLHash, inOptPushURLState, inOptWindowTitle) {
		// Do we have a prefire callback?  If we do, check if we should even process this route.
		if (this.mRoutePrefireCallback) {
			var _callback = this.mRoutePrefireCallback;
			var shouldProceed = _callback();
			if (!shouldProceed) return true;
		}
		var routeTuple = this.__evaluateURL(inURL);
		var routeInvocation;
		if (routeTuple && routeTuple.length) {
			// Do routes trigger a page reload?  Only redirect if the override flag has not been passed.
			if (this.mRoutesTriggerReload && !inOptRedirectOverrideFlag) {
				window.location.href = inURL;
				return true;
			}
			// Stop the event since we're about to handle it.
			if (inOptSourceEvent) Event.stop(inOptSourceEvent);
			var callback = routeTuple[0], url = routeTuple[1], namedMatches = routeTuple[2], matches = routeTuple[3], originalRoutePattern = routeTuple[4];
			// Initialize a route invocation.
			var invocationHash = {
				'callback': (callback || Prototype.emptyFunction),
				'url': (url || ""),
				'namedMatches': (namedMatches || {}),
				'matches': (matches || []),
				'originalRoutePattern': originalRoutePattern
			};
			if (inOptSetURLHash !== undefined) invocationHash['setURLHash'] = (inOptSetURLHash == true);
			if (inOptPushURLState !== undefined) invocationHash['pushURLState'] = (inOptPushURLState == true);
			if (inOptWindowTitle) invocationHash['windowTitle'] = inOptWindowTitle;
			routeInvocation = new CC.Routes.RouteInvocation(invocationHash);
			// Dispatch it.
			this.__dispatchRoute(routeInvocation);
			return true;
		}
		logger().debug("Got an empty route tuple after evaluating URL (%@)", inURL);
		return false;
	},
	// Registers a callback function that fires before any route is fired similar to the window onunload event
	// that fires when the user tries to click away from the active window.  Useful for mimicing the same
	// behavior where routes are in use but the window is not reloading.  If you return true the route will fire,
	// otherwise the route will be cancelled.
	setRoutePrefireCallback: function(inCallback) {
		if (!inCallback) {
			logger().warn("Called setRoutePrefireCallback without passing a valid callback (%@) ... current callback will be cleared", inCallback);
			this.mRoutePrefireCallback = null;
		} else {
			logger().debug("Set a new prefire callback (%@) in globalRouteHandler", inCallback);
			this.mRoutePrefireCallback = inCallback;
		}
	}
};
