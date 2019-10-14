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
//= require_tree "./sidebar_sections"
//= require_tree "./header_menu_items"
//= require_tree "./banner_items"
//= require "./sidebar.js"
//= require "./routes.js"
//= require "./blogs.js"
//= require "./settings.js"
//= require "./tags.js"
//= require "./wiki_setup_assistant.js"

var sharedBannerView;

CC.WikiMainView = Class.create(CC.MainView, {
	getBackgroundImageURL: function() {
		var themeTuple = CC.themeTupleFromMetaTag('container');
		if (themeTuple[2]) {
			return "/wiki/files/download/%@".fmt(themeTuple[2]);
		} else {
			var themeTupleOwner = CC.themeTupleFromMetaTag('owner');
			if (themeTupleOwner[2])
				return "/wiki/files/download/%@".fmt(themeTupleOwner[2]);			
		}		
	}
});

CC.WikiHeaderView = Class.create(CC.HeaderView, {
	mBreadcrumbItems: [],
	mTopLevelMenuItems: [
		new CC.MenuItems.Edit(),
		new CC.MenuItems.Download(),
		new CC.MenuItems.PlusMenu(),
		new CC.MenuItems.GearMenu(),
		new CC.MenuItems.Login(),
		new CC.MenuItems.Logout()
	],
	mTopLevelPlusMenuIndex: 2,
	mTopLevelGearMenuIndex: 3,
	mPlusMenuItems: [
		new CC.MenuItems.NewPrivatePage(),
		new CC.MenuItems.NewPrivateFile(),
		new CC.MenuItems.NewPrivateBlogpost(),
		new CC.MenuItems.NewProjectPage(),
		new CC.MenuItems.NewProjectFile(),
		new CC.MenuItems.NewProjectBlogpost(),
		new CC.MenuItems.NewProject()
	],
	mGearMenuItems: [
		new CC.MenuItems.AssignToProject(),
		new CC.MenuItems.BulkApproveComments(),
		new CC.MenuItems.Delete(),
		new CC.MenuItems.Hide(),
		new CC.MenuItems.ProjectSettings(),
		new CC.MenuItems.UpdateFile(),
		new CC.MenuItems.UserSettings(),
		new CC.MenuItems.About(),
		new CC.MenuItems.Help.Wiki()
	],
	render: function($super) {
		var header = $super();
		var li = document.createElement('li');
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_SEARCH);
		li.appendChild(Builder.node('input', {id: 'search', value: '', title: "_QuickSearch.Placeholder".loc(), 'autocapitalize': 'off', tabindex: tabIndex}));
		li.appendChild(Builder.node('span', {className: 'searchfield_close_overlay'}));
		header.down('ul.actions').appendChild(li);
		this.mQuickSearchMenu = new CC.QuickSearch.QuickSearchMenu(header.down('input'));
		return header;
	}
});

CC.WikiBannerView = Class.create(CC.BannerView, {
	mBannerLinkItems: [
		new CC.BannerItems.Home(),
		new CC.BannerItems.Activity(),
		new CC.BannerItems.Documents(),
		new CC.BannerItems.Tags(),
		new CC.BannerItems.Calendar(),
		new CC.BannerItems.Blog()
	],
	getBannerImageURL: function() {
		var themeTuple = CC.themeTupleFromMetaTag('owner');
		if (themeTuple[1]) {
			return "/wiki/files/download/%@".fmt(themeTuple[1]);
		} else {
			var themeTupleOwner = CC.themeTupleFromMetaTag('container');
			if (themeTupleOwner[1])
				return "/wiki/files/download/%@".fmt(themeTupleOwner[1]);			
		}
	},
	getIconImageURL: function() {
		var avatarGUID = CC.meta('x-apple-owner-avatarGUID');
		if (avatarGUID) return '/wiki/files/download/' + avatarGUID;
	},
	getIconImageExtraClassNames: function() {
		var ownerType = CC.meta('x-apple-owner-type');
		if (ownerType) return ownerType.split('.').last().toLowerCase();
	}
});

CC.CoreClientWikiApplication = Class.create(CC.Application, {
	mApplicationIdentifier: "wiki",
	createApplication: function($super) {
		// 11330226
		if (browser().isiPad() && browser().isiOS5Plus()) {
			var routeFromURL = CC.getRouteFromURL();
			if (!routeFromURL || routeFromURL.match(/^\/*$/)) {
				routeFromURL = "/wiki";
			}
			window.location.href = "/wiki/ipad/#route=%@".fmt(routeFromURL);
			return;
		}
		$super();
		// Add a header to the root view, since we'll always need one.
		sharedHeaderView = new CC.WikiHeaderView();
		rootView.addSubview(sharedHeaderView);
		// Build the nav global popover.
		var navigationItems = [];
		var currentUserLoggedIn = (CC.meta('x-apple-user-logged-in') == "true");
		var currentUserLogin = CC.meta('x-apple-username');
		if (currentUserLoggedIn) {
			navigationItems.push(["/wiki/people/%@/activity".fmt(currentUserLogin), "my_activity", "_Sources.MyActivity.Title", "_Sources.MyActivity.Description"]);
			navigationItems.push(["/wiki/people/%@/documents".fmt(currentUserLogin), "my_documents", "_Sources.MyDocuments.Title", "_Sources.MyDocuments.Description"]);
			navigationItems.push(["/wiki/find?favorites_only=true&sortKey=+longName&keyword=", "my_favorites", "_Sources.MyFavorites.Title", "_Sources.MyFavorites.Description"]);
		}
		if ((CC.meta("x-apple-config-DisableAllActivityView") != "true") && ((CC.meta("x-apple-username") != "unauthenticated"))) {
			navigationItems.push(["/wiki/activity", "activity", "_Sources.Activity.Title", "_Sources.Activity.Description"]);
		}
		if (CC.meta("x-apple-config-DisableAllProjectsView") != "true") {
			navigationItems.push(["/wiki/projects", "projects", "_Sources.Projects.Title", "_Sources.Projects.Description"]);
		}
		if ((CC.meta("x-apple-config-DisableAllPeopleView") != "true") && ((CC.meta("x-apple-username") != "unauthenticated"))) {
			navigationItems.push(["/wiki/people", "people", "_Sources.People.Title", "_Sources.People.Description"]);
		}
		sharedNavPopover = new CC.NavPopover(navigationItems, CC.NAV_POPOVER_DEFAULT_APPLICATION_WIKI_IDENTIFIER);
		// Create a scrollable main content view we can use.
		mainView = new CC.WikiMainView();
		rootView.addSubview(mainView);
		// Add a banner to the main view.
		sharedBannerView = new CC.WikiBannerView();
		mainView.addSubview(sharedBannerView, '#content', true);
		// Route the initial request.
		this.routeInitialRequestAfterRender();
	},
	computeRoutes: function() {
		return [
			[CC.Routes.WIKI_CONTAINER_TINYID_TITLE_ROUTE, containerTabRoute],
			[CC.Routes.WIKI_CONTAINER_TINYID_ROUTE, containerTabRoute],
			[CC.Routes.WIKI_CONTAINER_TINYID_BLOG_ROUTE, containerTabRoute],
			[CC.Routes.WIKI_CONTAINER_TINYID_TAGS_ROUTE, containerTabRoute],
			[CC.Routes.WIKI_CONTAINER_TINYID_FAVORITES_ROUTE, containerTabRoute],
			[CC.Routes.WIKI_CONTAINER_TINYID_DOCUMENTS_ROUTE, containerTabRoute],
			[CC.Routes.WIKI_CONTAINER_TINYID_ACTIVITY_ROUTE, containerTabRoute],
			[CC.Routes.WIKI_SEARCH_ROUTE, searchRoute],
			[CC.Routes.WIKI_FILES_TINYID_TITLE_ROUTE, fileRoute],
			[CC.Routes.WIKI_FILES_TINYID_ROUTE, fileRoute],
			[CC.Routes.WIKI_PAGES_TINYID_TITLE_ROUTE, pageRoute],
			[CC.Routes.WIKI_PAGES_TINYID_ROUTE, pageRoute],
			[CC.Routes.WIKI_TAGS_ROUTE, allTagsRoute],
			[CC.Routes.WIKI_PEOPLE_ROUTE, allPeopleRoute],
			[CC.Routes.WIKI_PROJECTS_ROUTE, allProjectsRoute],
			[CC.Routes.WIKI_ACTIVITY_ROUTE, allActivityRoute],
			[CC.Routes.WIKI_HOMEPAGE_ROUTE, homepageRoute],
			[CC.Routes.SLASH_ROUTE, homepageRoute]
		];
	}
});

new CC.CoreClientWikiApplication();
