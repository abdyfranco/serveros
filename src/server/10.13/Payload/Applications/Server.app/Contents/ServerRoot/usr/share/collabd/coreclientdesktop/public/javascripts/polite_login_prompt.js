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

// Polite login reminder shared instance.

CC.PoliteLoginPrompt = Class.create({
	initialize: function() {
		this.updateDisplayState();
		
		// Automatically update when meta tags change
		globalNotificationCenter().subscribe(CC.Meta.NOTIFICATION_DID_REFRESH_META_TAGS, this.updateDisplayState.bind(this));
	},
	showPoliteLoginPrompt: function() {
		if (!this.mElement) {
			var currentURL = window.location;
			var destinationString = "/auth?send_token=no&redirect="+currentURL;

			this.mElement = Builder.node('div', {id:'polite_login'}, [
				Builder.node('a', {'href': destinationString}, '_PoliteLogin.LogIn'.loc()),
				Builder.node('span', {'class': 'dismiss'}),
				'_PoliteLogin.FormatSimple'.loc()
			]);

			this.mElement.down('a').addEventListener('click', function(e) {
				e.preventDefault();

				if ( browser().isiPhone() ) {
					window.location = destinationString;
					return;
				}

				this.hidePoliteLoginPrompt(true);
				authenticator().displayFramedLoginPrompt(function(){
					window.location.reload();
				});
			}.bind(this), false);
			document.body.appendChild(this.mElement);
			this.mElement.down('.dismiss').observe('click', this.hidePoliteLoginPrompt.bindAsEventListener(this));
		}
	},
	hidePoliteLoginPrompt: function(inOptSuppressCookie) {
		if (this.mElement) {
			this.mElement.remove();
			delete this.mElement;
		}
		if (inOptSuppressCookie !== true) {
			globalCookieManager().setCookie('cc.hide_polite_login', true);
		}
	},
	updateDisplayState: function() {
		var loggedIn = (CC.meta('x-apple-user-logged-in') == "true");
		var hideCookie = globalCookieManager().getCookie('cc.hide_polite_login');
		if (loggedIn) {
			// Destroy the cookie so the next time we're logged out it will appear.
			globalCookieManager().destroyCookie('cc.hide_polite_login');
		}
		// If the user is not logged in and hasn't explicitly set the hide cookie, show the
		// polite login prompt.
		if (!loggedIn && !hideCookie) {
			this.showPoliteLoginPrompt();
			globalNotificationCenter().subscribe(CC.WikiEditor.NOTIFICATION_DID_START_EDITING, this.hidePoliteLoginPrompt.bind(this));
			globalNotificationCenter().subscribe(CC.Revisions.NOTIFICATION_DID_SHOW_REVISIONS, this.hidePoliteLoginPrompt.bind(this));
			globalNotificationCenter().subscribe(CC.QuickSearch.DID_SHOW_QUICKSEARCH_MENU, this.hidePoliteLoginPrompt.bind(this));
		} else {
			this.hidePoliteLoginPrompt(true);
		}
	}
});
