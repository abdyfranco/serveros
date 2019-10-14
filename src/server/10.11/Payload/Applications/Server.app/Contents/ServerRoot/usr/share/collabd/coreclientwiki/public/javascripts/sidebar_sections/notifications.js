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

// Subscription constants.

CC.DOCUMENT_IS_UPDATED_SUBSCRIPTION = 'com.apple.notifications.DocumentUpdated';
CC.DOCUMENT_IS_RENAMED_SUBSCRIPTION = 'com.apple.notifications.DocumentRenamed';
CC.COMMENT_IS_ADDED_SUBSCRIPTION = 'com.apple.notifications.CommentAdded';
CC.COMMENT_IS_APPROVED_SUBSCRIPTION = 'com.apple.notifications.CommentApproved';

// A mixin for sidebars providing document subscription behavior.  Takes care of
// prompting for a valid preferred email address, and persisting the subscription.
// Used by the standard notifications sidebar and the container notifications sidebar.

CC.NotificationsSidebarMixin = {
	open: function($super) {
		$super();
		if (!this.mDidLoadSubscriptions) {
			this.updateCheckedStateForCurrentSubscriptions();
			this.mDidLoadSubscriptions = true;
		}
	},
	getTargetEntityGUIDForSubscription: function() {
		return CC.meta('x-apple-entity-guid');
	},
	updateCheckedStateForCurrentSubscriptions: function() {
		var entityGUID = this.getTargetEntityGUIDForSubscription();
		server_proxy().subscriptionsForEntity(entityGUID, function(response) {
			var currentSubscriptions = $A(response.response || []);
			var documentUpdatedSubscriptions = (currentSubscriptions.include(CC.DOCUMENT_IS_UPDATED_SUBSCRIPTION) && currentSubscriptions.include(CC.DOCUMENT_IS_RENAMED_SUBSCRIPTION));
			var commentsChangedSubscriptions = (currentSubscriptions.include(CC.COMMENT_IS_ADDED_SUBSCRIPTION) && currentSubscriptions.include(CC.COMMENT_IS_APPROVED_SUBSCRIPTION));
			var checkbox;
			if (documentUpdatedSubscriptions) {
				checkbox = this.element.down('input.updated');
				if (checkbox) checkbox.writeAttribute('checked', "");
			}
			if (commentsChangedSubscriptions) {
				checkbox = this.element.down('input.comments');
				if (checkbox) checkbox.writeAttribute('checked', "");
			}
			if (documentUpdatedSubscriptions && commentsChangedSubscriptions) {
				checkbox = this.element.down('input.all');
				if (checkbox) checkbox.writeAttribute('checked', "");
			}
		}.bind(this), Prototype.emptyFunction);
	},
	handleSubscriptionCheckboxChanged: function(inEvent) {
		var checkbox = Event.findElement(inEvent, 'input');
		// Are we subscribing or unsubscribing?
		var addManifest = [], removeManifest = [];
		if (checkbox.hasClassName('updated')) {
			var updatesSubscribed = checkbox.getValue();
			updatesSubscribed ? addManifest.push(CC.DOCUMENT_IS_UPDATED_SUBSCRIPTION, CC.DOCUMENT_IS_RENAMED_SUBSCRIPTION) : removeManifest.push(CC.DOCUMENT_IS_UPDATED_SUBSCRIPTION, CC.DOCUMENT_IS_RENAMED_SUBSCRIPTION);
		}
		if (checkbox.hasClassName('comments')) {
			var commentsSubscribed = checkbox.getValue();
			commentsSubscribed ? addManifest.push(CC.COMMENT_IS_ADDED_SUBSCRIPTION, CC.COMMENT_IS_APPROVED_SUBSCRIPTION) : removeManifest.push(CC.COMMENT_IS_ADDED_SUBSCRIPTION, CC.COMMENT_IS_APPROVED_SUBSCRIPTION);
		}
		if (checkbox.hasClassName('all')) {
			var allSubscribed = checkbox.getValue();
			if (allSubscribed) {
				addManifest.push(CC.DOCUMENT_IS_UPDATED_SUBSCRIPTION, CC.DOCUMENT_IS_RENAMED_SUBSCRIPTION, CC.COMMENT_IS_ADDED_SUBSCRIPTION, CC.COMMENT_IS_APPROVED_SUBSCRIPTION);
			} else {
				removeManifest.push(CC.DOCUMENT_IS_UPDATED_SUBSCRIPTION, CC.DOCUMENT_IS_RENAMED_SUBSCRIPTION, CC.COMMENT_IS_ADDED_SUBSCRIPTION, CC.COMMENT_IS_APPROVED_SUBSCRIPTION);
			}
		}
		var notificationID = notifier().queueNotificationWithParams("_Sharing.Notification.Updating.Subscription".loc(), undefined, CC.Notifier.BUSY_STATE);
		var callback = function() {
			notifier().updateNotification(notificationID, {
				mDisplayString: "_Sharing.Notification.Updating.Subscription.Succeeded".loc(),
				mState: CC.Notifier.SUCCEEDED_STATE
			});
		};
		var errback = function() {
			notifier().updateNotification(notificationID, {
				mDisplayString: "_Sharing.Notification.Updating.Subscription.Failed".loc(),
				mState: CC.Notifier.FAILED_STATE
			});
		};
		this.updateSubscriptionForEntity(this.getTargetEntityGUIDForSubscription(), addManifest, removeManifest, callback, errback);
	},
	// Updates the notification subscription for the current user for a particular entity.
	// By default, subscribes the currently logged user to recieve document and comment
	// notifications for the entity currently being displayed.
	updateSubscriptionForEntity: function(inEntityGUID, inAddManifest, inRemoveManifest, inOptCallback, inOptErrback) {
		if (!inEntityGUID) return (inOptErrback ? inOptErrback() : undefined);
		// Is the current user logged in?  If not, ask them to log in.
		if (CC.meta('x-apple-user-logged-in') != "true") {
			var currentURL = window.location;
			window.location.href = "/auth?send_token=no&redirect=" + currentURL;
			return true;
		}
		// Otherwise check the current user has a preferred email address set.
		dialogManager().showProgressMessage("_Loading".loc());
		var loggedInUserGUID = CC.meta('x-apple-user-guid');
		server_proxy().entityForGUID(loggedInUserGUID, function(entity) {
			dialogManager().hide();
			var privateAttributes = ((entity && entity.privateAttributes) || {});
			var preferredEmailAddress = privateAttributes['preferredEmailAddress'];
			if (!preferredEmailAddress) {
				if (!$('no_email_set_dialog')) {
					dialogManager().drawDialog('no_email_set_dialog', [
						"_Dialogs.NoEmailSet.Description".loc()
					], "_Dialogs.NoEmailSet.Settings".loc(), false, "_Dialogs.NoEmailSet.Title".loc());
				}
				dialogManager().show('no_email_set_dialog', null, function() {
					var userGUID = CC.meta('x-apple-user-guid')
					settingsPanel().showForGUIDAndType(userGUID, "com.apple.entity.User");
				});
			} else {
				// Build a batch of subscribe/unsubscribe calls based on the add/remove manifests we were passed.
				var batched = [];
				inAddManifest.each(function(s) {
					batched.push(['ContentService', 'subscribeToEntity:withType:', [inEntityGUID, s]]);
				});
				inRemoveManifest.each(function(s) {
					batched.push(['ContentService', 'unsubscribeFromEntity:withType:', [inEntityGUID, s]]);
				});
				return service_client().batchExecuteAsynchronously(batched, {}, inOptCallback, inOptErrback);
			}
		}, function() {
			dialogManager().hide();
			logger().error("Could not get preferredEmail setting for user before updating subscription");
		});
	}
};

CC.NotificationsSidebarSection = Class.create(CC.SidebarSection, CC.NotificationsSidebarMixin, {
	mClassName: 'notifications',
	mDisplayTitle: "_Sidebars.Notifications.Title".loc(),
	mSidebarSectionGUID: 'sidebars/notifications',
	render: function($super) {
		var elem = $super();
		var fragment = document.createDocumentFragment();
		var tabIndexNotification = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_NOTIFICATIONS);
		fragment.appendChild(Builder.node('h2', {'tabindex': '-1'}, "_Sidebars.Notifications.Email.Me.When".loc()));
		// Build the notification checkboxes.
		var updatedCheckbox = Builder.node('div', {className: 'checkbox'}, [
			Builder.node('label', {className: 'ellipsis'}, [
				Builder.node('input', {'tabindex': ++tabIndexNotification, 'role': 'checkbox', 'type': 'checkbox', className: 'updated'}),
				"_Sidebars.Notifications.Email.Document.Updated".loc()
			])
		]);
		var commentsCheckbox = Builder.node('div', {className: 'checkbox'}, [
			Builder.node('label', {className: 'ellipsis'}, [
				Builder.node('input', {'tabindex': ++tabIndexNotification, 'role': 'checkbox', 'type': 'checkbox', className: 'comments'}),
				"_Sidebars.Notifications.Email.Comments.Added".loc()
			])
		]);
		fragment.appendChild(updatedCheckbox);
		fragment.appendChild(commentsCheckbox);
		elem.down('.content').appendChild(fragment);
		// Register any event handlers.
		var updatedInput = elem.down('input.updated');
		var commentsInput = elem.down('input.comments');
		Event.observe(updatedInput, 'change', this.handleSubscriptionCheckboxChanged.bind(this));
		Event.observe(commentsInput, 'change', this.handleSubscriptionCheckboxChanged.bind(this));
		return elem;
	},
	getTargetEntityGUIDForSubscription: function() {
		return CC.meta('x-apple-entity-guid');
	}
});
