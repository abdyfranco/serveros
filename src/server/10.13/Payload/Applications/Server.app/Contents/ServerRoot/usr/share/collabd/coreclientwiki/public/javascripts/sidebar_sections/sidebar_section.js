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

CC.SidebarSection = Class.create(CC.Keyboard.Mixins.Responder, {
	mClassName: '',
	mDisplayTitle: "Sidebar Title",
	mSidebarSectionGUID: 'sidebar/generic',
	mShowsDisclosureTriangle: true,
	initialize: function() {
		this.element = this.render();
		if (this.mShowsDisclosureTriangle) this.element.down('h3').on('click', this.onHeaderClick.bindAsEventListener(this));
		this.guid = this.element.getDataAttributes().guid;
	},
	render: function() {
		var tagTitle = this.mDisplayTitle.toLowerCase();
		var tabIndexTagName = 'cc-tab-index-sidebar-' + tagTitle; // Use constants for this
		var tabIndexSidebarTag = accessibility().requestTabIndex(tabIndexTagName);
				
		// defaulting to -1 (=no tabindex) to avoid toString() javascript type of errors when undefined...
		if (typeof tabIndexSidebarTag === 'undefined') {
			tabIndexSidebarTag = '-1'
		}
		
		return Builder.node('div', {className: this.buildClassNames(), 'data-guid': this.mSidebarSectionGUID}, [
			Builder.node('h3', {'role': 'menuitem', 'tabindex': tabIndexSidebarTag},  [
				Builder.node('span', {className: 'disclosure'}, "‣"),
				Builder.node('span', {className: 'title ellipsis'}, this.mDisplayTitle)
			].compact()),
			Builder.node('div', {className: 'content'})
		]);
	},
	buildClassNames: function() {
		return 'cc-sidebar-section %@'.fmt(this.mShowsDisclosureTriangle ? 'collapsed ' : '') + this.mClassName;
	},
	onHeaderClick: function(e) {
		e.stop();
		this.toggle();
	},
	toggle: function() {
		this.isOpen() ? this.close() : this.open();
	},
	isOpen: function() {
		return !this.element.hasClassName('collapsed');
	},
	open: function() {
		this.element.removeClassName('collapsed');
		this.element.writeAttribute('aria-pressed', 'true');
		globalCookieManager().setCookie('cc.' + this.mSidebarSectionGUID, true);
	},
	close: function() {
		this.element.addClassName('collapsed');
		this.element.writeAttribute('aria-pressed', 'false');
		globalCookieManager().destroyCookie('cc.' + this.mSidebarSectionGUID);
	},
	restoreOpenStateFromCookie: function() {
		var open = !this.mShowsDisclosureTriangle || globalCookieManager().getCookie('cc.' + this.mSidebarSectionGUID);
		open ? this.open() : this.close();
	}
});
