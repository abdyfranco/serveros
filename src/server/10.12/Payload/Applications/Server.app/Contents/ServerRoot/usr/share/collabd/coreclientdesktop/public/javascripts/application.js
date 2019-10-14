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

CC.Application = CC.Application || new Object();

// Some globals we'll want to reference later.

var rootView, rootViewController, sharedHeaderView, sharedNavPopover, sharedBannerView, mainView;

// Basic error message support.

var renderErrorMessage = function(inErrorMessage, inOptShowBanner) {
	if (sharedBannerView) sharedBannerView.setVisible(inOptShowBanner != undefined ? inOptShowBanner : false);
	CC.RouteHelpers.setContentSecondaryVisible(false, false);
	var view = new CC.ErrorMessageView({
		mErrorMessage: inErrorMessage
	});
	mainView.addSubview(view, '#content-primary', true);
};

var renderErrorHTML = function(inErrorHTML, inOptShowBanner) {
	if (sharedBannerView) sharedBannerView.setVisible(inOptShowBanner != undefined ? inOptShowBanner : false);
	CC.RouteHelpers.setContentSecondaryVisible(false, false);
	var view = new CC.ErrorMessageView({
		mErrorMessage: ""
	});
	view.forceRender();
	// This is safe because only we generate the supplied inner HTML.
	view.$('p').innerHTML = inErrorHTML;
	mainView.addSubview(view, '#content-primary', true);
};

// Base application class.

CC.Application = Class.create({
	mRoutesTriggerReload: true,
	mApplicationIdentifier: '',
	initialize: function(/* [options] */) {
		if (arguments && arguments.length > 0) Object.extend(this, arguments[0]);
		globalNotificationCenter().subscribe('PAGE_INITIALIZE_FINISHED', this.__initialize.bind(this));
	},
	// Internal function that is called to initialize this application. You should not
	// normally override this function.
	__initialize: function() {
		this.routeInitialRequestBeforeRender();
		this.__registerRoutes();
		this.createApplication();
	},
	// Called when the page is ready and the application will be created.
	createApplication: function() {
		// 9695664
		var dt = new Date();
		var offset = dt.getTimezoneOffset() / (-60);
		dt.setFullYear(dt.getFullYear() + 2);
		globalCookieManager().setCookie('cc.utc_offset', offset);
		// Routes should trigger a page reload on desktop.
		globalRouteHandler().mRoutesTriggerReload = this.mRoutesTriggerReload;
		// Write the locale to the body tag.
		document.body.addClassName(globalLocalizationManager().getLprojLocale());
		document.body.addClassName(this.mApplicationIdentifier);
		// Create a special root view and append it to the DOM so we have something to draw into.
		rootView = new CC.Mvc.View();
		rootView._render();
		var rootViewParentElement = rootView.mParentElement;
		rootViewParentElement.id = 'root';
		document.body.appendChild(rootViewParentElement);
		// Create the root view controller.
		rootViewController = new CC.Mvc.ViewController();
		rootViewController.mViewInstance = rootView;
	},
	// Your subclass should implement this function to return a tuple of route patterns and routing functions.
	// Note that routes should be returned in most to least specific order.
	computeRoutes: function() { /* Interface */ },
	// Internal function that registers routes computed above.
	__registerRoutes: function() {
		var routes = (this.computeRoutes() || []);
		var route, routePattern, routeFunction;
		for (var rdx = 0; rdx < routes.length; rdx++) {
			route = routes[rdx];
			routePattern = route[0];
			routeFunction = route[1];
			globalRouteHandler().register(routePattern, routeFunction);
		}
	},	
	// Routes the initial request by handle exceptions returned from the server (e.g. permission
	// denied or resource not found).  By default, looks for a route and routes it. You shouldn't
	// need to override this function unless you're doing something funky.  Remember to call this
	// function to have your application do anything.
	routeInitialRequestBeforeRender: function() {
		var exceptionName = CC.meta('x-apple-exception-name');
		var exceptionReason = CC.meta('x-apple-exception-reason');
		var loggedIn = (CC.meta('x-apple-user-logged-in') == "true");
		if (exceptionName) {
			if (exceptionName == "CSPermissionDeniedError") {
				if (exceptionReason == "permission-denied") {
					if (!loggedIn) {
						var currentURL = window.location;
						window.location.href = "/auth?send_token=no&redirect=" + currentURL;
						return;
					}
				}
			}
		}
	},
	routeInitialRequestAfterRender: function() {
		var exceptionName = CC.meta('x-apple-exception-name');
		var exceptionReason = CC.meta('x-apple-exception-reason');
		// Is the entity/container/owner deleted?
		var ownerDeleted = (CC.meta('x-apple-owner-isDeleted') == "true")
		var containerDeleted = (CC.meta('x-apple-container-isDeleted') == "true");
		var entityDeleted = (CC.meta('x-apple-entity-isDeleted') == "true");
		var deletedGUID;
		if (ownerDeleted) {
			deletedGUID = CC.meta('x-apple-owner-guid');
		} else if (containerDeleted) {
			deletedGUID = CC.meta('x-apple-container-guid');
		} else if (entityDeleted) {
			deletedGUID = CC.meta('x-apple-entity-guid');
		}
		if (deletedGUID || (exceptionName == "CSPermissionDeniedError" && exceptionReason == "deleted")) {
			var canRestore = (CC.meta('x-apple-user-can-delete') == "true");
			var errorHTML = "<div>%@</div><div>%@</div>".loc("_Deleted.Placeholder.Title".loc(), "_Deleted.Placeholder.NoPermissions.Subtitle".loc());
			if (canRestore) {
				errorHTML = "<div>%@</div><div><a class=\"cc-restore-content-link\" data-guid=\"%@\">%@</div>".loc("_Deleted.Placeholder.Title".loc(), deletedGUID, "_Deleted.Placeholder.Restore.Subtitle".loc());
			}
			renderErrorHTML(errorHTML);
			if (canRestore) {
				var restoreLink = $('content-primary').down('.cc-restore-content-link');
				if (restoreLink) {
					Event.observe(restoreLink, 'click', function(inEvent) {
						Element.hide(restoreLink);
						var entityGUID = Event.findElement(inEvent, 'a.cc-restore-content-link').getAttribute('data-guid');
						dialogManager().showProgressMessage("_Deleted.Progress.Restoring".loc());
						// 14054855
						// Restoring may take some time depending on the size of the entity tree, so we periodically
						// check the content is actually isDeleted=false before refreshing the page.  If we refresh
						// the page too soon, we will get the restore UI again.
						var checkEntityPollInterval = 2000; // 2s
						var checkEntityIsDeleted = function() {
							return server_proxy().entityForGUID(entityGUID, function(inEntity) {
								if (!inEntity || inEntity.isDeleted == true) {
									setTimeout(checkEntityIsDeleted, checkEntityPollInterval);
									return;
								}
								dialogManager().hideProgressMessage();
								window.location.reload();
							}, function() {
								dialogManager().hideProgressMessage();
								notifier().printErrorMessage("_Deleted.Error.CouldNotRestore".loc());
								Element.show(restoreLink);
							});
						}
						server_proxy().undeleteEntityWithGUID(entityGUID, function() {
							setTimeout(checkEntityIsDeleted, checkEntityPollInterval);
						}, function() {
							dialogManager().hideProgressMessage();
							notifier().printErrorMessage("_Deleted.Error.CouldNotRestore".loc());
							Element.show(restoreLink);
						});
					});
				}
			}
			return;
		}
		if (exceptionName) {
			if (exceptionName == "CSPermissionDeniedError") {
				if (exceptionReason == "permission-denied") {
					return renderErrorMessage("_Errors.403".loc());
				}
				else if (exceptionReason == "not-found") {
					return renderErrorMessage("_Errors.404".loc());
				}
			}
			else if (exceptionName == "CSDatabaseError") {
				return renderErrorMessage("_Errors.500DB".loc())
			}
			return renderErrorMessage("_Errors.500".loc());
		} else {
			var routeURL = CC.getRouteFromURL();
			var routed;
			if (routeURL) {
				routed = globalRouteHandler().routeURL(routeURL, undefined, true);
			} else {
				routed = globalRouteHandler().routeURL('/', undefined, true);
			}
			if (!routed) {
				renderErrorMessage("_Errors.404".loc());
			}
		}
	}
});
