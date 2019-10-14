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

//= require "./sidebar_section.js"

CC.SharingSidebarSection = Class.create(CC.SidebarSection, {
	mClassName: 'sharing',
	mDisplayTitle: "_Sidebars.Sharing.Title".loc(),
	mSidebarSectionGUID: 'sidebars/sharing',
	initialize: function($super) {
		$super();
		var entityGUID = CC.meta('x-apple-entity-guid');
		this.element.down('.content').appendChild(Builder.node('h2', {className: 'placeholder'}, "_Loading".loc()));
		if (entityGUID) {
			var gotAclsResponse = function(acls) {
				if (acls) {
					var sharingView = new CC.DocumentSharingView(acls, entityGUID);
					sharingView._render();
					var contentElement = this.element.down('.content');
					contentElement.innerHTML = "";
					contentElement.appendChild(sharingView.$());
				}
			}.bind(this);
			server_proxy().aclsForEntityGUID(entityGUID, gotAclsResponse, gotAclsResponse);
		} else {
			logger().error("Could not find entityGUID to initialize sharing sidebar.. bailing");
		}
	}
});
