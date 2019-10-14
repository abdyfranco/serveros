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

//= require "./popover.js"

CC.NAV_POPOVER_DEFAULT_APPLICATION_XCODE_IDENTIFIER = 'xcode';
CC.NAV_POPOVER_DEFAULT_APPLICATION_WIKI_IDENTIFIER = 'wiki';
CC.NAV_POPOVER_DEFAULT_APPLICATION_CHANGEPASSWORD_IDENTIFIER = 'changepassword';
CC.NAV_POPOVER_DEFAULT_APPLICATION_WEBCAL_IDENTIFIER = 'webcal';

CC.NAV_POPOVER_DEFAULT_APPLICATIONS = [
	{
		'mURL': '/xcode',
		'mIdentifier': CC.NAV_POPOVER_DEFAULT_APPLICATION_XCODE_IDENTIFIER,
		'mDisplayTitle': "_NavPopover.Application.Xcode.Title".loc(),
		'mShouldDisplayCalculator': function() {
			return CC.meta("x-apple-service-xcode-enabled") == "true";
		}
	},
	{
		'mURL': '/wiki',
		'mIdentifier': CC.NAV_POPOVER_DEFAULT_APPLICATION_WIKI_IDENTIFIER,
		'mDisplayTitle': "_NavPopover.Application.Wiki.Title".loc(),
		'mShouldDisplayCalculator': function() {
			return CC.meta("x-apple-service-wiki-enabled") == "true";
		}
	}, {
		'mURL': '/changepassword',
		'mIdentifier': CC.NAV_POPOVER_DEFAULT_APPLICATION_CHANGEPASSWORD_IDENTIFIER,
		'mDisplayTitle': "_NavPopover.Application.ChangePassword.Title".loc(),
		'mShouldDisplayCalculator': function() {
			return CC.meta("x-apple-service-changepassword-enabled") == "true";
		}
	}, {
		'mURL': '/webcal',
		'mIdentifier': CC.NAV_POPOVER_DEFAULT_APPLICATION_WEBCAL_IDENTIFIER,
		'mDisplayTitle': "_NavPopover.Application.WebCalendar.Title".loc(),
		'mShouldDisplayCalculator': function() {
			return CC.RouteHelpers.webcalEnabledForCurrentProtocol();
		}
	}
];

CC.NavPopover = Class.create(CC.Popover, {
	mNavigationItems: [],
	mActiveApplicationIdentifier: null,
	initialize: function($super, inNavigationItems, inActiveApplicationIdentifier) {
		// Default the anchor position to the first link on the header element (if it exists).
		var anchor = $('header') ? $('header').down('.buttonbar.hierarchy a') : null;
		if (inNavigationItems) this.mNavigationItems = $A(inNavigationItems);
		if (inActiveApplicationIdentifier) this.mActiveApplicationIdentifier = inActiveApplicationIdentifier;
		$super(anchor);
		this.element.setAttribute('id', 'cc-navpopover');
	},
	renderPopoverContent: function() {
		var buildSection = function(url, className, locTitle, locDescription, isSubitem) {
			var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GENERAL);
			var section = Builder.node('a', {href:url, className: "cc-navpopover-item %@%@".fmt(className, (isSubitem ? ' subitem' : '')), tabindex: tabIndex}, [
				Builder.node('span', {className: "icon"}),
				Builder.node('span', {className: "title ellipsis"}, locTitle.loc())
			]);
			if (locDescription) section.setAttribute('title', locDescription.loc());
			return section;
		}
		// Create a document fragment we can use to start assembling the popover contents.
		var fragment = document.createDocumentFragment();
		// Include a user icon as the nav popover header if we're logged in.
		var currentUserLoggedIn = (CC.meta('x-apple-user-logged-in') == "true");
		if (currentUserLoggedIn) {
			var currentUserLogin = CC.meta('x-apple-username');
			var avatarGUID = CC.meta("x-apple-user-avatarGUID");
			var avatarURL = iconURIForEntity({
				'type': 'com.apple.entity.User',
				'avatarGUID': avatarGUID
			});
			var currentUserDisplayName = (CC.meta("x-apple-user-longName") || CC.meta("x-apple-user-shortName"));
			var userElement = Builder.node('div', {'className': "user"}, [
				Builder.node('div', {'role': 'presentation', 'className': 'avatar%@'.fmt(avatarGUID ? '' : ' default')}, [
					Builder.node('img', {'role': 'presentation', 'className': 'avatar_img'}),
					Builder.node('div', {'role': 'presentation', 'className': 'avatar_mask'})
				]),
				Builder.node('div', {'role': 'presentation', 'className': 'fullname ellipsis'}, currentUserDisplayName)
			]);
			if (avatarURL) userElement.down('img').src = avatarURL;
			fragment.appendChild(userElement);
		}
		// Draw the menu items.
		for (var idx = 0; idx < CC.NAV_POPOVER_DEFAULT_APPLICATIONS.length; idx++) {
			var application = CC.NAV_POPOVER_DEFAULT_APPLICATIONS[idx];
			// Should we display the navigation item?
			var shouldDisplayCalculator = application.mShouldDisplayCalculator;
			if (!shouldDisplayCalculator()) continue;
			fragment.appendChild(buildSection(application.mURL, application.mIdentifier, application.mDisplayTitle, application.mTooltip));
			// If this application is the active application, draw the navigation items.
			if (this.mActiveApplicationIdentifier == application.mIdentifier) {
				for (var jdx = 0; jdx < this.mNavigationItems.length; jdx++) {
					var navigationItem = this.mNavigationItems[jdx];
					var navigationItemElement = buildSection(navigationItem[0], navigationItem[1], navigationItem[2], navigationItem[3], true);
					fragment.appendChild(navigationItemElement);
				}
			}
		}
		return fragment;
	},
	makeAccessible: function() { 
		for (var jdx = 0; jdx < this.mNavigationItems.length; jdx++) {
			var navicationItem = this.mNavigationItems[jdx];
		}
	},
	show: function($super) {
		$super();
	},
	onAnchorClick: function(e) {
		e.stop();
		this.toggle();
	},
	handleKeyboardNotification: function($super, inMessage, inObject, inOptExtras) {
		switch (inMessage) {
		case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SHIFT_ESC:
			if (!this.visible)
				this.show();
			return true;
		default:
			break;
		}
		$super(inMessage, inObject, inOptExtras);
	}
});
