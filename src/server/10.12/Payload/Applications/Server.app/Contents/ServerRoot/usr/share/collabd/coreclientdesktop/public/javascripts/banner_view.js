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
//= require "./banner_link.js"

// Banner view class which can be as simple as a centered title, or as detailed as a
// bar with an icon, title, and set of collapsing links on the right.

CC.BannerView = Class.create(CC.Mvc.View, {
	// Is this a top-level banner (title-only)?
	mIsTopLevel: true,
	// The text displayed on this banner.
	mTitle: null,
	// The link URL for this title.
	mTitleURL: '#',
	// An ordered array of banner items.
	mBannerLinkItems: [],
	render: function() {
		var element = Builder.node('div', {id: 'banner', className: 'cc-banner-view chrome'});
		var fragment = document.createDocumentFragment();
		var bannerImageURL = this.getBannerImageURL();
		var iconImageURL = this.getIconImageURL();
		var extraClassNames = this.getIconImageExtraClassNames();
		var bannerLinkItems = this.mBannerLinkItems;
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BANNER_HOME);
		fragment.appendChild(Builder.node('div', {className: 'left', 'style': (bannerImageURL ? 'background-repeat: repeat; background-position: top left; background-image: url(%@)'.fmt(bannerImageURL) : '')}, [
			Builder.node('a', {className: 'title', 'href': this.mTitleURL, 'tabindex': tabIndex, 'id': 'banner_nav'}, [
				Builder.node('div', {className: 'icon'}, [
					Builder.node('div', {className: 'image default' + (extraClassNames ? " " + extraClassNames : ""), 'style': (iconImageURL ? 'background-position: center center; background-size: 100% 100%; background-image: url(%@)'.fmt(iconImageURL) : '')})
				]),
				Builder.node('h1', (this.mTitle || "").escapeHTML())
			])
		]));
		fragment.appendChild(Builder.node('div', {className: 'right'}, [
			Builder.node('div', {className: 'links'}, [
				Builder.node('ul', [bannerLinkItems.collect(function(item) { return item.mElement; })])
			])
		]));
		element.appendChild(fragment);
		return element;
	},
	makeAccessible: function() {
		// Set Navigation landmark (Actions/Nav)
		var banner = this.mParentElement;
		banner.writeAttribute('role', 'navigation');
		banner.writeAttribute('aria-label', "_Accessibility.Navigation.Secondary".loc());
	},
	setTitle: function(inTitle, inOptTitleURL) {
		if (inTitle != this.mTitle) {
			this.mTitle = (inTitle || "").strip();
			this.mTitleURL = (inOptTitleURL || "#");
			var link = this.mParentElement.down('a.title');
			if (inOptTitleURL) {
				this.mTitleURL = inOptTitleURL;
				link.href = inOptTitleURL;
			} else {
				link.removeAttribute('href');
			}
			this.mParentElement.down('a.title h1').innerHTML = this.mTitle.escapeHTML();
		}
	},
	// Configures this banner as a top-level banner. Top-level banners display the title only.
	setIsTopLevel: function(inShouldBeTopLevel) {
		if (inShouldBeTopLevel != this.mIsTopLevel) {
			this.mIsTopLevel = inShouldBeTopLevel;
		}
	},
	getBannerImageURL: function() { /* Interface */ },
	getIconImageURL: function() { /* Interface */ },
	getIconImageExtraClassNames: function() { /* Interface */ },
	updateDisplayState: function() {
		// First update the display state of all the banner links for this banner.
		var items = (this.mBannerLinkItems || []);
		for (var idx = 0; idx < items.length; idx++) {
			var item = items[idx];
			if (item) {
				item.updateDisplayState();
			}
		}
		// Update the visual appearance of the banner based on background/icon image information.
		var element = this.$();
		var bannerImageURL = this.getBannerImageURL();
		var leftElement = element.down('div.left');
		leftElement.setStyle({
			backgroundRepeat: 'repeat',
			backgroundPosition: 'top left',
			backgroundImage: (bannerImageURL ? 'url(%@)'.fmt(bannerImageURL) : ''),
			backgroundSize: "auto " + leftElement.getHeight() + 'px'
		});
		var imageElement = element.down('div.image');
		var iconURL = this.getIconImageURL();
		if (iconURL) {
			imageElement.className = 'image';
		} else {
			var extraClassNames = this.getIconImageExtraClassNames();
			var className = 'image default' + (extraClassNames ? " " + extraClassNames : "");
			imageElement.className = className;
		}
		imageElement.setStyle({
			backgroundPosition: 'center center',
			backgroundSize: '100% 100%',
			backgroundImage: (iconURL ? 'url(%@)'.fmt(iconURL) : '')
		});
	}
});
