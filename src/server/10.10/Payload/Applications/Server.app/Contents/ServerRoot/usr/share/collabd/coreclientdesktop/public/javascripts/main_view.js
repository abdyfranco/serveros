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

// Main view class.

CC.MainView = Class.create(CC.Mvc.View, {
	render: function() {
		var backgroundImageURL = this.getBackgroundImageURL();
		var elem = Builder.node('div', {id: 'main', className: 'cc-main-view wrapchrome', 'style': (backgroundImageURL ? 'background-repeat: repeat; background-position: top left; background-image: url(%@)'.fmt(backgroundImageURL) : '')});
		elem.appendChild(Builder.node('div', {id: 'content', className: 'animates wrapchrome no-secondary'}, [
			Builder.node('div', {id: 'content-inner'}, [
				Builder.node('div', {id: 'content-primary', className: 'wrapchrome'}),
				Builder.node('div', {id: 'content-secondary', className: 'wrapchrome'}),
				Builder.node('div', {style: 'display: block; clear: both;', className: 'chrome'})
			])
		]));
		if (!globalCookieManager().getCookie('cc.sidebar_closed')) {
			elem.down('div#content').removeClassName('no-secondary');
		}
		return elem;
	},
	makeAccessible: function() {
			
		// Set Navigation landmark (Actions/Nav)
		var main = this.mParentElement.querySelector('#content-primary');
		main.writeAttribute('aria-label', "_Accessibility.Navigation.PageContent".loc());
	},
	getBackgroundImageURL: function() { /* Interface */ },
	updateDisplayState: function() {
		var element = this.$();
		// Do we have a background image?
		var backgroundImageURL = this.getBackgroundImageURL();
		element.setStyle({
			backgroundRepeat: 'repeat',
			backgroundPosition: 'top left',
			backgroundImage: (backgroundImageURL ? 'url(%@)'.fmt(backgroundImageURL) : '')
		});
	}
});