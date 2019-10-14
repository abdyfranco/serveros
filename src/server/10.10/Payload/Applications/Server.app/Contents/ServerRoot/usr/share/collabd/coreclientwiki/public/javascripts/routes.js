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

var updateHeaderBarBreadcrumbTrailForRouteInvocation = function(inRouteInvocation) {
	// Build up an array of breadcrumbs to show.
	var crumbs = [];
	if (inRouteInvocation.originalRoutePattern == CC.Routes.WIKI_ACTIVITY_ROUTE) {
		crumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': "_Activity.All".loc(), 'mURL': "/wiki/activity"}));
	} else if (inRouteInvocation.originalRoutePattern == CC.Routes.WIKI_PROJECTS_ROUTE) {
		crumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': "_General.All.Wikis".loc(), 'mURL': "/wiki/projects"}));
	} else if (inRouteInvocation.originalRoutePattern == CC.Routes.WIKI_PEOPLE_ROUTE) {
		crumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': "_General.All.People".loc(), 'mURL': "/wiki/people"}));
	} else if (inRouteInvocation.originalRoutePattern == CC.Routes.WIKI_SEARCH_ROUTE) {
		crumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': "_Search.SearchResults".loc(), 'mURL': 'javascript: window.location.reload();'}));
	}
	// Set the breadcrumbs trail for the shared header view.
	sharedHeaderView.setBreadcrumbItems(crumbs);
};

var buildContainerListUI = function(inType) {
	sharedBannerView.setVisible(true);
	sharedBannerView.setIsTopLevel(true);
	// Figure out the title/types based on the type we were passed.
	var titleLocKey = "_General.All.Wikis", entityTypes = ['com.apple.entity.Wiki'];
	if (inType == 'com.apple.entity.User') {
		titleLocKey = "_General.All.People";
		entityTypes = ['com.apple.entity.User'];
	} else if (inType == 'com.apple.entity.Document') {
		titleLocKey = "_General.Documents";
		entityTypes = ['com.apple.entity.Page', 'com.apple.entity.File'];
	}
	// Build the UI by setting the title and creating a paginating container list view scoped to
	// the correct entity types.
	var localizedTitle = titleLocKey.loc();
	sharedBannerView.setTitle(localizedTitle);
	CC.RouteHelpers.setBrowserWindowTitle(localizedTitle)
	var listView = new CC.PaginatingContainerListView();
	listView.mEntityTypes = entityTypes;
	mainView.addSubview(listView, '#content-primary', true);
	// Immediately paginate.
	listView.paginate();
};

var buildActivityUI = function() {
	var activityView = new CC.Activity.GroupedPaginatingActivityView();
	// Optionally scope the activity view if the meta tags look like this is a person or project
	// activity view. If the owner is a person set the scoping container flag.  Otherwise set the
	// scoping user flag.
	var ownerGUID = CC.meta('x-apple-owner-guid');
	if (ownerGUID) {
		var ownerType = CC.meta('x-apple-owner-type');
		if (ownerType == "com.apple.entity.User") {
			activityView.mScopingUserGUID = ownerGUID;
		} else {
			activityView.mScopingContainerGUID = ownerGUID;
		}
		activityView.mWatchedOnly = false;
	}
	mainView.addSubview(activityView, '#content-primary', true);
	// Hide the sort controls.
	var popup = activityView.mFilterBarView.$().down(".cc-filter-bar-view-popup");
	popup.hide();
	var keyword = activityView.mFilterBarView.$().down(".cc-filter-bar-view-keyword");
	keyword.hide();
	// Immediately paginate the activity view.
	activityView.paginate();
};

var buildDocumentsUI = function() {
	var listView = new CC.PaginatingContainerListView();
	// Use generic icons in the documents list.
	listView.mDisplayGenericPreviewIcons = true;
	listView.mEntityTypes = ['com.apple.entity.Page', 'com.apple.entity.File'];
	listView.mOwnerGUID = CC.meta('x-apple-owner-guid');
	mainView.addSubview(listView, '#content-primary', true);
	// Paginate.
	listView.paginate();
};

var buildPageUIForEntityGUID = function(inEntityGUID, inOptIncludeSidebar, inOptHideTitle, inOptDoNotHideSidebar) {
	// Configure the document sidebar.
	if (inOptIncludeSidebar) {
		buildDocumentSidebarUI();
	} else if (!inOptDoNotHideSidebar) {
		CC.RouteHelpers.setContentSecondaryVisible(false, false);
	}
	// Render the page by inside #content-primary.
	var primary = $('content-primary');
	primary.appendChild(Builder.node('div', {'id': 'wikieditor'}));
	var wikieditor = $('wikieditor');
	_globalEditorController = new CC.WikiEditor.EditorController({
		'mParentElement': wikieditor,
		'mToolbarParentElement': document.body,
		'mPageGUID': inEntityGUID,
		'mDebugMode': (window.location.href || "").match(/\?editorDebugMode=true/)
	});
	// If we're hiding the page title, wait for a page initialized notification first.
	if (inOptHideTitle) {
		globalNotificationCenter().subscribe(CC.WikiEditor.NOTIFICATION_PAGE_WAS_INITIALIZED, function() {
			var titleElement = _globalEditorController.mEditorView.mTitleView.$();
			titleElement.setStyle({
				'height': '0px',
				'overflow': 'hidden'
			});
		}, _globalEditorController);
	}
};

var buildDocumentSidebarUI = function() {
	var sidebarView = new CC.SidebarView(false);
	mainView.addSubview(sidebarView, '#content-secondary', true);
	if (!globalCookieManager().getCookie('cc.sidebar_closed')) {
		CC.RouteHelpers.setContentSecondaryVisible(true, false);
	}
	var sections = [
		new CC.TagsSidebarSection(),
		new CC.RelatedSidebarSection(),
		new CC.CommentsSidebarSection()
	];
	if (CC.meta('x-apple-user-logged-in') == "true") {
		sections.push(new CC.NotificationsSidebarSection());
	}
	sections.push(new CC.UpdatesSidebarSection());
	// Is this a private document?
	if ((CC.meta('x-apple-owner-type') == 'com.apple.entity.User') && (CC.meta('x-apple-owner-guid') == CC.meta('x-apple-user-guid'))) {
		sections.push(new CC.SharingSidebarSection());
	}
	sidebarView.setSidebarSections(sections);
};

var buildTagsUI = function() {
	var tagsView = new CC.Tags.GroupedTagsView();
	mainView.addSubview(tagsView, '#content-primary', true);
	// Hide the sort controls.
	var popup = tagsView.mFilterBarView.$().down(".cc-filter-bar-view-popup");
	popup.hide();
	// Immediately reload the tags view.
	tagsView.updateTags();	
};

var buildBlogListingUI = function() {
	var listView = new CC.BlogListingListView();
	listView.mEntityTypes = ['com.apple.entity.Page', 'com.apple.entity.File'];
	// Set the owner GUID appropiately so we can search for everything in the blog.
	listView.mOwnerGUID = CC.meta('x-apple-owner-blogGUID');
	mainView.addSubview(listView, '#content-primary', true);
	listView.paginate();
};

var buildContainerCalendarUI = function() {
	CC.RouteHelpers.setBodyClassName('calendar');
	// Put a container on the page that the shared calendar can draw into.
	var module = Builder.node('div', {'id': 'module_calendars'});
	// Append that container to main so we can hack it's position.
	var rootElement = $('main');
	rootElement.appendChild(module);
	// Trigger the shared instance to get created.
	calendarViewController();
};

// Route implementations.

var homepageRoute = function(inRouteInvocation) {
	CC.RouteHelpers.setBodyClassName('homepage');
	CC.RouteHelpers.setTopLevelClassNames(true);
	sharedBannerView.setVisible(false);
	CC.RouteHelpers.setBrowserWindowTitle("_OSXServer".loc());
	mainView.updateDisplayState();
	// Wipe out the breadcrumb bar.
	sharedHeaderView.resetBreadcrumbItems();
	CC.RouteHelpers.updateSharedDisplayState();
	// Build the page.
	var entityGUID = CC.meta('x-apple-entity-guid');
	buildPageUIForEntityGUID(entityGUID, false, true);
	// Signal the route as having completed.
	inRouteInvocation.routeDidComplete();
};

var allActivityRoute = function(inRouteInvocation) {
	if (!CC.RouteHelpers.allActivityEnabled()) {
		logger().error("All activity is disabled");
		renderErrorMessage("_AllActivity.Disabled".loc());
		inRouteInvocation.routeDidComplete();
		return;
	}
	CC.RouteHelpers.setBodyClassName('activity');
	CC.RouteHelpers.setTopLevelClassNames();
	CC.RouteHelpers.updateSharedDisplayState();
	updateHeaderBarBreadcrumbTrailForRouteInvocation(inRouteInvocation);
	sharedBannerView.setVisible(true);
	sharedBannerView.setIsTopLevel(true);
	var allActivityTitle = "_Activity.All".loc();
	sharedBannerView.setTitle(allActivityTitle);
	CC.RouteHelpers.setBrowserWindowTitle(allActivityTitle);
	buildActivityUI()
	inRouteInvocation.routeDidComplete();
};

var allProjectsRoute = function(inRouteInvocation) {
	if (!CC.RouteHelpers.projectsEnabled()) {
		logger().error("Projects are disabled");
		renderErrorMessage("_Projects.Disabled".loc());
		inRouteInvocation.routeDidComplete();
		return;
	}
	CC.RouteHelpers.setBodyClassName('projects');
	CC.RouteHelpers.setTopLevelClassNames();
	buildContainerListUI('com.apple.entity.Wiki');
	CC.RouteHelpers.updateSharedDisplayState();
	updateHeaderBarBreadcrumbTrailForRouteInvocation(inRouteInvocation);
	inRouteInvocation.routeDidComplete();
};

var allPeopleRoute = function(inRouteInvocation) {
	if (!CC.RouteHelpers.peopleEnabled()) {
		logger().error("People are disabled");
		renderErrorMessage("_People.Disabled".loc());
		inRouteInvocation.routeDidComplete();
		return;
	}
	CC.RouteHelpers.setBodyClassName('people');
	CC.RouteHelpers.setTopLevelClassNames();
	buildContainerListUI('com.apple.entity.User');
	CC.RouteHelpers.updateSharedDisplayState();
	updateHeaderBarBreadcrumbTrailForRouteInvocation(inRouteInvocation);
	inRouteInvocation.routeDidComplete();
};

var searchRoute = function(inRouteInvocation) {
	CC.RouteHelpers.setBodyClassName('search');
	CC.RouteHelpers.setTopLevelClassNames();
	CC.RouteHelpers.updateSharedDisplayState();
	updateHeaderBarBreadcrumbTrailForRouteInvocation(inRouteInvocation);
	sharedBannerView.setVisible(true);
	sharedBannerView.setIsTopLevel(true);
	var searchResultsTitle = "_Search.SearchResults".loc();
	sharedBannerView.setTitle(searchResultsTitle);
	CC.RouteHelpers.setBrowserWindowTitle(searchResultsTitle);
	var searchView = new CC.Search.PaginatingSearchResultsView();
	searchView._render();
	var params = CC.params(inRouteInvocation.url);
	var keyword = params['keyword'];
	if (keyword) {
		var keywordTitle = "_Search.SearchResults.Keyword".loc(keyword);
		sharedBannerView.setTitle(keywordTitle);
		CC.RouteHelpers.setBrowserWindowTitle(keywordTitle);
	}
	var rootElement = $('content-primary');
	rootElement.appendChild(searchView.$());
	// Configure the search view by updating it's filter bar. This will indirectly call paginate on the
	// view when notifications fire as property changes like keyword and sortKey so we don't call paginate
	// explicitly.
	CC.Search.setupFilterForQuery(searchView.mFilterBarView, params);
	inRouteInvocation.routeDidComplete();
};

var unimplementedRoute = function(inRouteInvocation) {
	var url = inRouteInvocation.url;
	alert("Route not yet implemented for URL (%@)".fmt(url));
	inRouteInvocation.routeDidFail();
};

var pageRoute = function(inRouteInvocation) {
	CC.RouteHelpers.setBodyClassName('pages');
	CC.RouteHelpers.setTopLevelClassNames(false);
	// Update the banner and breadcrumb bar.
	CC.RouteHelpers.updateBannerForOwnerOrContainer();
	CC.RouteHelpers.updateBreadcrumbBarForEntityAndOwner();
	// Set the browser window title.
	CC.RouteHelpers.setBrowserWindowTitleForEntityAndOwner();
	CC.RouteHelpers.updateSharedDisplayState();
	// Build the page.
	var entityGUID = CC.meta('x-apple-entity-guid');
	buildPageUIForEntityGUID(entityGUID, true);
	var isBlogpost = (CC.meta('x-apple-entity-isBlogpost') == "true");
	if (isBlogpost) {
		CC.RouteHelpers.setSelectedBannerLinkByGUID("banner/blog");
	} else {
		CC.RouteHelpers.setSelectedBannerLinkByGUID("banner/documents");
	}
	// Mark the page as read.
	server_proxy().markEntityAsRead(CC.meta('x-apple-entity-guid'), Prototype.emptyFunction, Prototype.emptyFunction);
	// Signal the route as having completed.
	inRouteInvocation.routeDidComplete();
};


var fileRoute = function(inRouteInvocation) {
	CC.RouteHelpers.setBodyClassName('files');
	CC.RouteHelpers.setTopLevelClassNames(false);
	// Update the banner and breadcrumb bar.
	CC.RouteHelpers.updateBannerForOwnerOrContainer();
	CC.RouteHelpers.updateBreadcrumbBarForEntityAndOwner();
	// Set the browser window title.
	CC.RouteHelpers.setBrowserWindowTitleForEntityAndOwner();
	CC.RouteHelpers.updateSharedDisplayState();
	// Build the file detail view.
	var entityGUID = CC.meta('x-apple-entity-guid');
	var entityType = CC.meta('x-apple-entity-type');
	var isFileEntity = (entityType == "com.apple.entity.File");
	if (!isFileEntity) {
		logger().error("Tried to build a file UI for something that isn't a file (%@, %@)".fmt(entityGUID, entityType));
		return;
	}
	// Create a DOM node to draw into.
	var primary = $('content-primary');
	primary.addClassName('loading');
	// Fetch the file from the server.
	var gotFile = function(fileEntity) {
		var fileDetailView = CC.Files.buildInlineFileDetailView(fileEntity);
		mainView.addSubview(fileDetailView, '#content-primary');
		primary.removeClassName('loading');
	};
	server_proxy().entityForGUIDWithOptions(entityGUID, {'subpropertyPaths': server_proxy().mDefaultSubpropertyPaths}, gotFile, function() {
		logger().error("Could not find file entity for entity guid (%o)", entityGUID);
	});
	// Build the default document sidebar.
	buildDocumentSidebarUI();
	// Set the selected banner tab.
	CC.RouteHelpers.setSelectedBannerLinkByGUID("banner/documents");
	// Mark the file as read.
	server_proxy().markEntityAsRead(CC.meta('x-apple-entity-guid'), Prototype.emptyFunction, Prototype.emptyFunction);
	// Signal the route as having completed.
	inRouteInvocation.routeDidComplete();
};

var containerTabRoute = function(inRouteInvocation) {
	var ownerType = CC.meta('x-apple-owner-type');
	var mappedClassName = CC.RouteHelpers.mapEntityTypeToBodyClassName(ownerType);
	CC.RouteHelpers.setBodyClassName(mappedClassName);
	CC.RouteHelpers.setTopLevelClassNames(false);
	// Update the banner and breadcrumb bars.
	CC.RouteHelpers.updateBannerForOwnerOrContainer();
	CC.RouteHelpers.updateBreadcrumbBarForEntityAndOwner();
	CC.RouteHelpers.updateSharedDisplayState();
	// Start building a browser window title.
	var titleFormatString = "%@ - %@";
	var containerTitle = (CC.meta('x-apple-owner-longName') || CC.meta('x-apple-owner-shortName'));
	// Figure out what view to display.
	var url = inRouteInvocation.url;
	var urlMatches = url.match(/wiki\/[^\/]*\/[^\/]*\/(activity|documents|tags|calendar|blog)/);
	if (urlMatches && urlMatches.length > 0) {
		CC.RouteHelpers.setContentPrimaryFullWidth(true, false);
		var tabName = urlMatches[1];
		CC.RouteHelpers.setSelectedBannerLinkByGUID("banner/%@".fmt(tabName));
		if (tabName == 'activity') {
			buildActivityUI();
			CC.RouteHelpers.setBrowserWindowTitle(titleFormatString.fmt(containerTitle, "_Banner.Activity.Title".loc()));
		} else if (tabName == 'documents') {
			buildDocumentsUI();
			CC.RouteHelpers.setBrowserWindowTitle(titleFormatString.fmt(containerTitle, "_Banner.Documents.Title".loc()));
		} else if (tabName == 'tags') {
			buildTagsUI();
			CC.RouteHelpers.setBrowserWindowTitle(titleFormatString.fmt(containerTitle, "_Banner.Tags.Title".loc()));
		} else if (tabName == 'calendar') {
			if (!CC.calendarMetaTagsEnabledForContainer()) {
				renderErrorMessage("_Errors.Wiki.Calendar.Disabled".loc(), true);
			}
			// If webcal is enabled for the current protocol, display it.  If webcal is disabled completely display the disabled
			// UI, otherwise it must be enabled and disabled for the current protocol, so display that error.
			else if (CC.RouteHelpers.webcalEnabledForCurrentProtocol()) {
				buildContainerCalendarUI();
			}
			else if (!CC.RouteHelpers.webcalEnabled()) {
				renderErrorMessage("_Errors.Calendar.Disabled".loc(), true);
			}
			else {
				renderErrorMessage("_Errors.Wiki.Calendar.Disabled.NonSSL".loc(), true);
			}
			CC.RouteHelpers.setBrowserWindowTitle(titleFormatString.fmt(containerTitle, "_Banner.Calendar.Title".loc()));
		} else if (tabName == 'blog') {
			if (CC.blogMetaTagsEnabledForContainer()) {
				buildBlogListingUI();
			} else {
				renderErrorMessage("_Errors.Wiki.Blog.Disabled".loc(), true);
			}
			CC.RouteHelpers.setBrowserWindowTitle(titleFormatString.fmt(containerTitle, "_Banner.Blog.Title".loc()));
		}
	} else {
		CC.RouteHelpers.setSelectedBannerLinkByGUID("banner/home");
		CC.RouteHelpers.setBrowserWindowTitle(titleFormatString.fmt(containerTitle, "_Banner.Home.Title".loc()));
		var entityGUID = CC.meta('x-apple-entity-guid');
		// Use a custom sidebar on container homepages.
		var sidebarView = new CC.SidebarView(true);
		mainView.addSubview(sidebarView, '#content-secondary', true);
		CC.RouteHelpers.setContentSecondaryVisible(true, false);
		var sections = [
			new CC.RecentDocumentsSidebarSection(),
			new CC.ContainerNotificationsSidebarSection()
		];
		if (CC.metaAsArray('x-apple-owner-unapproved-comment-guids').length > 0) {
			sections.push(new CC.ModeratedCommentsSidebarSection());
		}
		sections.push(new CC.ContainerUpdatesSidebarSection());
		if (CC.calendarMetaTagsEnabledForContainer() && CC.RouteHelpers.webcalEnabledForCurrentProtocol()) {
			sections.push(new CC.UpcomingEventsSidebarSection());
		}
		sidebarView.setSidebarSections(sections);
		// Mark the homepage as read.
		server_proxy().markEntityAsRead(CC.meta('x-apple-entity-guid'), Prototype.emptyFunction, Prototype.emptyFunction);
		// Draw the homepage,
		buildPageUIForEntityGUID(entityGUID, false, true, true);
	}
	inRouteInvocation.routeDidComplete();
};

var allTagsRoute = function(inRouteInvocation) {
	CC.RouteHelpers.setBodyClassName('tags');
	CC.RouteHelpers.setTopLevelClassNames();
	CC.RouteHelpers.updateSharedDisplayState();
	updateHeaderBarBreadcrumbTrailForRouteInvocation(inRouteInvocation);
	sharedBannerView.setVisible(true);
	sharedBannerView.setIsTopLevel(true);
	var allTagsTitle = "_General.All.Tags".loc();
	sharedBannerView.setTitle(allTagsTitle)
	CC.RouteHelpers.setBrowserWindowTitle(allTagsTitle);
	buildTagsUI();
	inRouteInvocation.routeDidComplete();
};
