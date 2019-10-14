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

//= require "./theme_chooser.js"

// A sidebar view class.

CC.SidebarView = Class.create(CC.Mvc.View, {
	// An ordered array of sidebar sections.
	mSidebarSections: [],
	initialize: function(isTopLevel) {
		this.isTopLevel = isTopLevel || false;
	},
	render: function() {
		var elem = Builder.node('div', {className: 'cc-sidebar'}, [
			this.isTopLevel ? null : Builder.node('h2', {'tabindex': '-1'}, [
				Builder.node('span', {'tabindex': '-1', className: 'title ellipsis'}, "_Sidebar.Document.Info.Title".loc()),
				Builder.node('span', {'tabindex': '-1', className: 'button sidebar-close'}, "_Sidebars.Close.Title".loc())
			]),
			Builder.node('div', {className: 'content'})
		].compact());
		var closeButton = elem.down('.sidebar-close');
		if (closeButton) {
			// If we have a close button hook it up.
			closeButton.observe('click', this.onCloseButtonClick.bindAsEventListener(this));
			// Add the reverse button to re-open it (11292947).
			$$('.sidebar-open').invoke('remove');
			var openSidebar = Builder.node('div', {'className': 'sidebar-open'});
			$('content-primary').insertBefore(openSidebar, null);
			if (openSidebar) {
				openSidebar.observe('click', this.onOpenButtonClick.bindAsEventListener(this));
			}
		}
		if(this.isTopLevel) elem.addClassName('toplevel')
		return elem;
	},
	makeAccessible: function() {
		// Set Navigation landmark (SideBar/Nav)
		this.mParentElement.writeAttribute('role', 'contentinfo');
		this.mParentElement.writeAttribute('aria-label', "_Accessibility.Label.DocumentInfo".loc());
	},
	onCloseButtonClick: function(e) {
		e.stop();
		this.close();
	},
	onOpenButtonClick: function(e) {
		e.stop();
		this.open();
	},
	isOpen: function() {
		return !$('content').hasClassName('no-secondary');
	},
	open: function() {
		$('content').removeClassName('no-secondary');
		globalCookieManager().destroyCookie('cc.sidebar_closed');
	},
	close: function() {
		$('content').addClassName('no-secondary');
		globalCookieManager().setCookie('cc.sidebar_closed', true);
	},
	toggle: function() {
		this.isOpen() ? this.close() : this.open();
	},
	// Sets the sidebar sections for this sidebar.  Immediately renders the sidebar sections
	// and appends them to this sidebar view.
	setSidebarSections: function(inSidebarSections) {
		var items = this.mSidebarSections = (inSidebarSections || []);
		var fragment = document.createDocumentFragment();
		// Sidebar sections are not views, so render them manually.
		for (var idx = 0; idx < items.length; idx++) {
			var item = items[idx];
			if (item && item.element) fragment.appendChild(item.element);
			// Reopen the sidebar based on a cookie if necessary.
			item.restoreOpenStateFromCookie();
		}
		var contentElement = this.mParentElement.down('.content');
		contentElement.innerHTML = "";
		contentElement.appendChild(fragment);
	},
	setSidebarTitle: function(inTitle) {
		this.mElement.down('h2 span.title').innerHTML = (inTitle || "").escapeHTML();
	}
});
	