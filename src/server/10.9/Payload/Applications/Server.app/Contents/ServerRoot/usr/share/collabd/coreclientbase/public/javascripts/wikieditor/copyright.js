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

var CopyrightNoticeHeightObserver = Class.create(Abstract.TimedObserver, {
	getValue: function() {
		return Element.getHeight(this.element);
	}
});

// Vanishing copyright text support. Dissapears after first edit.

var GlobalEditorVanishingCopyrightManager = Class.createWithSharedInstance('globalEditorVanishingCopyrightManager', true);
GlobalEditorVanishingCopyrightManager.prototype = {
	mParentElement: null,
	initialize: function() {
		// Are we on the server homepage?
		if (!(document.body.hasClassName('sources') && document.body.hasClassName('index'))) return invalidate;
		// Has the homepage been edited?
		if (CC.meta('x-apple-entity-revision') != "1") return invalidate;
		globalNotificationCenter().subscribe(CC.WikiEditor.NOTIFICATION_EDITOR_READY, this._initialize.bind(this));
	},
	_initialize: function() {
		this.mParentElement = this.render();
		this.showCopyright();
		globalNotificationCenter().subscribe(CC.WikiEditor.NOTIFICATION_DID_START_EDITING, this.hideCopyright.bind(this));
		globalNotificationCenter().subscribe(CC.WikiEditor.NOTIFICATION_DID_CANCEL_EDITING, this.showCopyright.bind(this));
		// 9540592
		var heightChangedCallback = function(inElement, inHeight) {
			this.mParentElement.style.minHeight = (inHeight + 44 + 'px'); // 16px +  21px + 7px
		};
		this.mObserver = new CopyrightNoticeHeightObserver($('content'), 1, heightChangedCallback.bind(this));
	},
	render: function() {
		var element = Builder.node('div', {className: 'wikieditor-vanishing-copyright hidden'}, [
			Builder.node('p')
		]);
		element.down('p').innerHTML = "_Editor.Apple.Copyright.Notice".loc();
		$('main').appendChild(element);
		return element;
	},
	hideCopyright: function() {
		document.body.removeClassName('showing-copyright');
		this.mParentElement.addClassName('hidden');
	},
	showCopyright: function() {
		document.body.addClassName('showing-copyright');
		this.mParentElement.removeClassName('hidden');
	}
};
