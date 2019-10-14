// Copyright (c) 2009-2015 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

if (typeof apple_loc_strings == "undefined") {
	apple_loc_strings = {version:'1.0'};
}

var populateStrings = function(obj) {
	for (aProperty in obj) {
		apple_loc_strings[aProperty] = obj[aProperty];
	}
};

populateStrings({
	"_NavigationSidebar.My.Activity": "My Activity",
	"_NavigationSidebar.My.Documents": "My Documents",
	"_NavigationSidebar.My.Favorites": "My Favorites",
	"_NavigationSidebar.Home": "Home",
	"_NavigationSidebar.All.Activity": "All Activity",
	"_NavigationSidebar.All.Wikis": "All Wikis",
	"_NavigationSidebar.All.People": "All People",
	"_NavigationSidebar.RecentlyViewed.Title": "Recent documents",
	"_Login.LogIn": "Log In",
	"_Login.LogOut": "Log Out",
	"_Login.Unauthenticated": "Unauthenticated User",
	"_Login.DialogTitle": "Log In",
	"_Login.UserName": "User Name",
	"_Login.Password": "Password",
	"_Login.RememberMe": "Remember Me",
	"_WikiSetupAssistant.Next": "Next",
	"_WikiSetupAssistant.Create": "Create",
	"_WikiSetupAssistant.GeneralPane.ShortTitle": "General",
	"_WikiSetupAssistant.GeneralPane.LongTitle": "Create a New Wiki",
	"_WikiSetupAssistant.GeneralPane.Name.Label": "Wiki name",
	"_WikiSetupAssistant.GeneralPane.Name.Placeholder": "Apple Wiki",
	"_WikiSetupAssistant.GeneralPane.Description.Label": "Description",
	"_WikiSetupAssistant.GeneralPane.Description.Placeholder": "Say something about this wiki",
	"_WikiSetupAssistant.GeneralUserPane.Name.Label": "User name",
	"_WikiSetupAssistant.GeneralUserPane.Email.Label": "Email",
	"_WikiSetupAssistant.GeneralUserPane.Email.Placeholder": "user@example.com",
	"_WikiSetupAssistant.ACLPane.ShortTitle": "Permissions",
	"_WikiSetupAssistant.ACLPane.LongTitle": "Set Permissions",
	"_WikiSetupAssistant.AppearancePane.ShortTitle": "Appearance",
	"_WikiSetupAssistant.AppearancePane.LongTitle": "Set Appearance",
	"_WikiSetupAssistant.AppearancePane.ColorScheme.Label": "Color scheme",	
	"_WikiSetupAssistant.DonePane.LongTitle": "Setup Complete",
	"_WikiSetupAssistant.DonePane.GoToWiki%@": "Go to \"%@\" Wiki",
	"_WikiSetupAssistant.DonePane.InformationLine1%@" : "The \"%@\" wiki has been created and is ready to use.",
	"_WikiSetupAssistant.DonePane.InformationLine2" : "Additional configuration options are available on the wiki.",
	"_Document.Sidebar.Info": "Info",
	"_Document.Sidebar.ViewAll": "View all",
	"_Document.Sidebar.Comments": "Comments",
	"_Document.Sidebar.Comments.None": "No comments",
	"_Document.Sidebar.Comments.New": "Comment",
	"_Document.Sidebar.Comments.You": "You",
	"_Document.Sidebar.Comments.Now": "Now",
	"_Document.Sidebar.Related": "Related",
	"_Document.Sidebar.Related.None": "No related documents",
	"_Document.Sidebar.Related.Add": "Add related document…",
	"_Document.Sidebar.Related.SuggestedDocuments": "Suggested Documents",
	"_Document.Sidebar.Tags": "Tags",
	"_Document.Sidebar.Tags.None": "No tags",
	"_Document.Sidebar.Tags.Add": "Add tag…",
	"_Document.Sidebar.Tags.Add.Name": "Add tag textfield",
	"_Document.Sidebar.Tags.SuggestedTags": "Suggested Tags",
	"_Document.Sidebar.History": "History",
	"_Document.Sidebar.History.None": "No history",
	"_Document.Sidebar.History.VersionAvailableSingular": "1 version available",
	"_Document.Sidebar.History.VersionAvailablePlural": "%@ versions available",
	"_Document.Sidebar.Notifications": "Email Notifications",
	"_Document.Sidebar.Notifications.Updated": "All updates",
	"_Document.Sidebar.Notifications.CommentAdded": "Comment added",
	"_Document.Sidebar.Notifications.DocumentUpdated": "Document updated",
	"_Document.Sidebar.Notifications.EmailInputTitle": "Enter your email",
	
	"_Document.Sidebar.Sharing": "Sharing",
	"_Document.Sidebar.Sharing.None": "Not shared",
	"_Document.Sidebar.Sharing.Add": "Share with someone…",
	"_Document.Sidebar.Sharing.PopoverTitle": "Edit Sharing Settings",
	
	"_Sharing.Notification.Updating.Subscription": "Updating subscription…",
	"_Sharing.Notification.Updating.Subscription.Succeeded": "Subscription successfully updated.",
	"_Sharing.Notification.Updating.Subscription.Failed": "Could not update subscription. Please try again.",
	"_Sharing.Notification.Updating.Subscription.Failed.Email": "You must have a preferred email address set to use subscriptions.",
	
	"_FilterBar.Filter.Label": "Show:",
	"_FilterBar.Filter.All.Title": "Everything",
	"_FilterBar.Filter.Unread.Title": "Unread",
	"_FilterBar.Filter.Favorites.Title": "Favorites",
	"_FilterBar.SortBy.Label": "Sort by:",
	"_FilterBar.SortBy.Rank.Title": "Most relevant",
	"_FilterBar.SortBy.Title.Title": "Title",
	"_FilterBar.SortBy.MostRecent.Title": "Most recent",
	"_FilterBar.SortBy.LeastRecent.Title": "Least recent",
	"_FilterBar.Grid.Title": "Icons",
	"_FilterBar.List.Title": "List",
	"_GearMenu.General.Help": "Help",
	"_GearMenu.General.MySettings": "My User Settings…",
	"_GearMenu.General.MySettings.Title": "My User Settings",
	"_GearMenu.General.Move" : "Move…",
	"_GearMenu.General.Replace": "Replace File…",
	"_GearMenu.Wiki.Settings": "Wiki Settings…",
	"_GearMenu.Wiki.Settings.Title": "Wiki Settings",
	"_GearMenu.User.Hide": "Hide User…",
	"_GearMenu.User.Unhide": "Unhide User…",
	"_GearMenu.Search.SaveSearch" : "Save this search",
	"_PlusMenu.NewWiki": "New Wiki…",
	"_PlusMenu.NewPage.NewPageInWiki%@": "New Page in \"%@\"…",
	"_PlusMenu.NewPage.NewInMyDocs": "New Page in My Documents…",
	"_PlusMenu.NewPage.Dialog.Title" : "New Page",
	"_PlusMenu.NewPage.Dialog.Label" : "Page Title",
	"_Settings.Permissions.CommentAccess.Label":"Comments",
	"_Settings.Permissions.CommentAccess.all":"Anyone",
	"_Settings.Permissions.CommentAccess.authenticated":"Authenticated users",
	"_Settings.Permissions.CommentAccess.disabled":"Nobody",
	"_Settings.Permissions.CommentModeration.Label":"Comment Moderation",
	"_Settings.Permissions.CommentModeration.all":"All comments",
	"_Settings.Permissions.CommentModeration.anonymous":"Only anonymous comments",
	"_Settings.Permissions.CommentModeration.disabled":"None",
	"_Settings.General.PreferedEmail":"Preferred Email",
	
	// User Error Messages
	"_Error.Delete.Document.Permissions":"Only the owner or an admin may delete this document.",
	"_Error.Delete.Wiki.Permissions":"Only the owner or an admin may delete this wiki.",
	"_Error.Hide.Person.Permissions":"Only an admin may hide a person.",	
	"_Error.People.Disabled": "Viewing All People is disabled on this server.",
	"_Error.Projects.Disabled": "Viewing All Projects is disabled on this server.",
	"_Error.AllActivity.Disabled": "Viewing All Activity is disabled on this server.",

	// Documents
	"_General.Documents.My": "My Documents",
	"_General.Documents.None": "No Documents",
	"_General.Documents.Untitled": "Untitled",
	"_General.Documents.Recents": "Recent Documents",
	// Favorites
	"_General.Favorites": "Favorites",
	// Search
	"_Search": "Search",
	"_Search.Results": "Search Results",
	"_Search.Recents": "Recent Searches",
	"_Search.Saved": "Saved Searches",
	// Controls
	"_Control.Back": "Back",
	"_Control.Add": "Add",
	"_Control.Cancel": "Cancel",
	"_Control.Delete": "Delete",
	"_Control.TrashIcon": "Trash Icon",	
	"_Control.Done": "Done",
	"_Control.Edit": "Edit",
	"_Control.Save": "Save",
	"_Control.Send": "Send",
	"_Control.OK": "OK",
	"_Control.Close": "Close",
	"_Control.Plus": "Plus",
	"_Control.ShowDiff": "ShowDiff",		
	"_Control.Pagination.ShowAll": "Show All",
	"_Control.Gear": "Action menu",
	"_Control.MenuNavigation": "Navigation",
	"_Control.AccessRole.Popup": " popup",
	"_Control.Switch.On": "ON",
	"_Control.Switch.Off": "OFF",	
	"_Settings.Notification": "Send email notifications to new members"
});
