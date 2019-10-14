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
//= require "./notifications.js"

// Container notifications sidebar.

CC.ContainerNotificationsSidebarSection = Class.create(CC.SidebarSection, CC.NotificationsSidebarMixin, {
	mShowsDisclosureTriangle: false,
	mClassName: 'container_notifications',
	mDisplayTitle: "_Sidebars.Notifications.Title".loc(),
	mSidebarSectionGUID: 'sidebars/container_notifications',
	render: function($super) {
		var elem = $super();
		var fragment = document.createDocumentFragment();
		// Build the include in all activity (isWatched) checkbox.
		var activityCheckbox = Builder.node('div', {className: 'checkbox'}, [
			Builder.node('label', {className: 'ellipsis'}, [
				Builder.node('input', {'type': 'checkbox', className: 'activity'}),
				"_Sidebars.Notifications.Container.Include.All.Activity".loc()
			])
		]);
		var ownerIsWatched = (CC.meta('x-apple-owner-isWatched') == "true");
		if (ownerIsWatched) {
			activityCheckbox.down('input.activity').writeAttribute("checked", "");
		}
		// Build the notification checkbox.
		var notificationCheckbox = Builder.node('div', {className: 'checkbox'}, [
			Builder.node('label', {className: 'ellipsis'}, [
				Builder.node('input', {'type': 'checkbox', className: 'all'}),
				"_Sidebars.Notifications.Container.Email.Updated".loc()
			])
		]);
		fragment.appendChild(activityCheckbox);
		fragment.appendChild(notificationCheckbox);
		elem.down('.content').appendChild(fragment);
		// Register any event handlers.
		var activityCheckboxInput = elem.down('input.activity');
		var notificationCheckboxInput = elem.down('input.all');
		Event.observe(activityCheckboxInput, 'change', this.handleAllActivityCheckboxClicked.bind(this));
		Event.observe(notificationCheckboxInput, 'change', this.handleSubscriptionCheckboxChanged.bind(this));
		return elem;
	},
	handleAllActivityCheckboxClicked: function(inEvent) {
		var checked = Event.findElement(inEvent, 'input').checked;
		var ownerGUID = CC.meta('x-apple-owner-guid')
		if (checked) {
			server_proxy().watchEntity(ownerGUID);
		} else {
			server_proxy().unwatchEntity(ownerGUID);
		}
	},
	getTargetEntityGUIDForSubscription: function() {
		return CC.meta('x-apple-owner-guid');
	}
});
