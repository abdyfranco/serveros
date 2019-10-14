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

if (typeof apple_loc_strings == "undefined") {
	apple_loc_strings = {version:'1.0'};
}

var populateStrings = function(obj) {
	for (aProperty in obj) {
		apple_loc_strings[aProperty] = obj[aProperty];
	}
};

populateStrings({
	"_MenuItem.Gear": "Action menu…",
	"_MenuItem.LogIn": "Log in…",
	"_MenuItem.LogOut": "Log out…",
	"_MenuItem.Plus": "Add menu…",
	"_ActionMenu.About.Title": "About",
	"_Server.About.Dialog.Description.NoXcode": "Server %@, OS X %@",
	"_Server.About.Dialog.Title": "About Server",
	"_NavPopover.Application.Xcode.Title": "Xcode",		
	"_NavPopover.Application.Wiki.Title": "Wiki",
	"_NavPopover.Application.ChangePassword.Title": "Change Password",
	"_NavPopover.Application.WebCalendar.Title": "Web Calendar",
	"_PoliteLogin.Format": "%@1 to access more services",
	"_PoliteLogin.FormatSimple": " to access more services",	
	"_PoliteLogin.LogIn": "Log in",
	"_QuickSearch.Placeholder": "Search",
	"_QuickSearch.Header": "Quick Search",
	"_QuickSearch.Loading.Placeholder": "Loading…",
	"_QuickSearch.See.All.Results.Title": "Show all…",
	"_QuickSearch.Headers.RecentSearches": "Recent Searches",
	"_QuickSearch.Headers.SavedSearches": "Saved Searches",
	"_QuickSearch.RecentSearch.Delete": "Delete",
	"_QuickSearch.SavedSearch.Delete": "Delete",
	"_QuickSearch.SavedSearch.Untitled": "Untitled search",
	"_Sources.Me.Title": "My Profile",
	"_Sources.Me.Description": "Manage your profile.",
	"_Sources.MyActivity.Title": "My Activity",
	"_Sources.MyActivity.Description": "See your activity in real-time.",
	"_Sources.MyDocuments.Title": "My Documents",
	"_Sources.MyDocuments.Description": "View and edit your personal documents.",
	"_Sources.MyFavorites.Title": "My Favorites",
	"_Sources.MyFavorites.Description": "View the pages and people you care about most.",
	"_Sources.Activity.Title": "All Activity",
	"_Sources.Activity.Description": "Track real-time activity for people and wikis you care about.",
	"_Sources.Projects.Title": "All Wikis",
	"_Sources.Projects.Description": "Communicate and collaborate with team members.",
	"_Sources.People.Title": "All People",
	"_Sources.People.Description": "View other people's activity and blogs.",
	"_Sources.Home.Title": "Home",
	"_Sources.Home.Description": "View the server homepage.",
	"_Login.LoggedInUser": "Logged in (%@)",
	"_Login.Unexpected.Error": "Your login failed because of an unexpected error. Please try again.",
	"_Logout.Confirm.Dialog.Title": "Log Out",
	"_Logout.Confirm.Dialog.Description": "Are you sure you want to log out?",
	"_Logout.Confirm.Dialog.OK": "Log Out",
	"_Deleted.Placeholder.Title": "This content has been deleted",
	"_Deleted.Placeholder.NoPermissions.Subtitle": "Only administrators and users with permission to delete can restore it",
	"_Deleted.Placeholder.Restore.Subtitle": "Restore",
	"_Deleted.Progress.Restoring": "Restoring…",
	"_Deleted.Error.CouldNotRestore": "Could not restore content. Please try again.",
	"_Load.Error.CouldNotLoadIngoFromServer": "Could not load version information from the server. Please try again.",
	
	// WAI ARIA - Accessiblity
	"_Accessibility.Navigation.Main": "Main Navigation",
	"_Accessibility.Navigation.Secondary": "Secondary Navigation",
	"_Accessibility.Navigation.PageContent": "Page Content",
	"_Accessibility.Navigation.Label.SearchFor": "Search for"
});
