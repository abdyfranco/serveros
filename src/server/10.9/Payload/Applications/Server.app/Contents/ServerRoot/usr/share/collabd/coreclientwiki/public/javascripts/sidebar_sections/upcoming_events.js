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

//= require "./paginating_sidebar_section.js"

// Sidebar that displays any upcoming events in a container.

CC.UpcomingEventsSidebarSection = Class.create(CC.PaginatingSidebarSection, {
	mClassName: 'upcoming_events',
	mDisplayTitle: "_Sidebars.UpcomingEvents.Title".loc(),
	mSidebarSectionGUID: 'sidebars/upcoming_events',
	mEmptyPlaceholderString: "_Sidebars.UpcomingEvents.Empty.Placeholder".loc(),
	mShowsDisclosureTriangle: false,
	getPaginationIDs: function() {
		// Fake at least one pagination item so we have a chance to fetch events.
		return new Array(1);
	},
	paginateForIDs: function($super, inPaginationIDs) {
		// Set the principal URL from the meta tag
		principalService().setUserPrincipal('/principals/wikis/'+encodeURIComponent(CC.meta('x-apple-owner-tinyID')));
		// Instantiate the upcoming events service, and listen for a message
		globalNotificationCenter().subscribe('GOT_UPCOMING_EVENTS', this.gotEvents.bind(this));
		upcomingEventsService();
	},
	isEmpty: function() {
		return (this.element.down('li.event') == undefined);
	},
	gotEvents: function(inMessage, inObject, inUserInfo) {
		if (inObject.length >= 1) {
			this.element.down('.content').innerHTML = '<ul></ul>';
			var calendarEvents = $A(inObject || []);
			// <rdar://problem/10138981> Wiki "Upcoming Events" list is out of order
			var sortedEvents = calendarEvents.sortBy(function(e) {
				return e.startDate();
			});
			var eventCount = Math.min(5, sortedEvents.length);
			for (var i = 0; i < eventCount; i++) {
				currentCalendarEvent = sortedEvents[i];
				var containerTinyID = CC.meta('x-apple-container-tinyID');
				var eventURL = '/wiki/projects/'+containerTinyID+'/calendar?dtstart='+encodeURIComponent(currentCalendarEvent.startDate(true).replace(/T.+$/, ''))+'#uid='+encodeURIComponent(currentCalendarEvent.valueForProperty('UID'));
				var timeDisplayString = getTimeRangeDisplayString(currentCalendarEvent.startDate(), currentCalendarEvent.duration());
				this.element.down('ul').appendChild(Builder.node('li', {className: 'event'}, [
					Builder.node('a', {href:eventURL}, currentCalendarEvent.summary()),
					Builder.node('span', {className:'updated'}, timeDisplayString)
				]))
			}
		}
		// Call didPaginateForIDs to get the default pagination sidebar behavior.
		this.didPaginateForIDs();
	}
});
