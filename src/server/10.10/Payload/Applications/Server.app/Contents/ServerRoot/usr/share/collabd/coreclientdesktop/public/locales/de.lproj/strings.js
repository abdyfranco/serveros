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
	"_MenuItem.Gear": "Aktionsmenü …",
	"_MenuItem.LogIn": "Anmelden …",
	"_MenuItem.LogOut": "Abmelden …",
	"_MenuItem.Plus": "Menü hinzufügen ...",
	"_ActionMenu.About.Title": "Über",
	"_Server.About.Dialog.Description.NoXcode": "Server %@, OS X %@",
	"_Server.About.Dialog.Title": "Über Server",
	"_NavPopover.Application.Xcode.Title": "Xcode",		
	"_NavPopover.Application.Wiki.Title": "Wiki",
	"_NavPopover.Application.ChangePassword.Title": "Passwort ändern",
	"_NavPopover.Application.WebCalendar.Title": "Web-Kalender",
	"_PoliteLogin.Format": "%@1 für weitere Dienste",
	"_PoliteLogin.FormatSimple": " für weitere Dienste",	
	"_PoliteLogin.LogIn": "Anmelden",
	"_QuickSearch.Placeholder": "Suchen",
	"_QuickSearch.Header": "Schnellsuche",
	"_QuickSearch.Loading.Placeholder": "Laden …",
	"_QuickSearch.See.All.Results.Title": "Alle anzeigen …",
	"_QuickSearch.Headers.RecentSearches": "Letzte Sucheinträge",
	"_QuickSearch.Headers.SavedSearches": "Gesicherte Suchabfragen",
	"_QuickSearch.RecentSearch.Delete": "Löschen",
	"_QuickSearch.SavedSearch.Delete": "Löschen",
	"_QuickSearch.SavedSearch.Untitled": "Neue Suche",
	"_Sources.Me.Title": "Mein Profil",
	"_Sources.Me.Description": "Verwalten Sie Ihre Profile.",
	"_Sources.MyActivity.Title": "Meine Aktivität",
	"_Sources.MyActivity.Description": "Die eigene Aktivität in Echtzeit anzeigen.",
	"_Sources.MyDocuments.Title": "Meine Dokumente",
	"_Sources.MyDocuments.Description": "Persönliche Dokumente anzeigen und bearbeiten.",
	"_Sources.MyFavorites.Title": "Meine Favoriten",
	"_Sources.MyFavorites.Description": "Bevorzugte Seiten und Personen anzeigen.",
	"_Sources.Activity.Title": "Alle Aktivitäten",
	"_Sources.Activity.Description": "Beobachten Sie in Echtzeit die Aktivität vom Personen und Wikis, für die Sie sich interessieren.",
	"_Sources.Projects.Title": "Alle Wikis",
	"_Sources.Projects.Description": "Mit Team-Mitgliedern kommunizieren und zusammenarbeiten",
	"_Sources.People.Title": "Alle Personen",
	"_Sources.People.Description": "Die Aktivität und Blogs anderer Personen anzeigen",
	"_Sources.Home.Title": "Anfang",
	"_Sources.Home.Description": "Die Server-Homepage anzeigen",
	"_Login.LoggedInUser": "Angemeldet (%@)",
	"_Login.Unexpected.Error": "Ihre Anmeldung ist aufgrund eines unerwarteten Fehlers fehlgeschlagen. Bitte versuchen Sie es erneut.",
	"_Logout.Confirm.Dialog.Title": "Abmelden",
	"_Logout.Confirm.Dialog.Description": "Möchten Sie sich wirklich abmelden?",
	"_Logout.Confirm.Dialog.OK": "Abmelden",
	"_Deleted.Placeholder.Title": "Dieser Inhalt wurde gelöscht",
	"_Deleted.Placeholder.NoPermissions.Subtitle": "Nur Administratoren und Benutzer mit Rechten zum Löschen können die Wiederherstellung ausführen",
	"_Deleted.Placeholder.Restore.Subtitle": "Wiederherstellen",
	"_Deleted.Progress.Restoring": "Wiederherstellen …",
	"_Deleted.Error.CouldNotRestore": "Inhalt konnte nicht wiederhergestellt werden. Versuchen Sie es erneut.",
	"_Load.Error.CouldNotLoadIngoFromServer": "Versionsinformationen konnten nicht vom Server geladen werden. Versuchen Sie es erneut.",
	
	// WAI ARIA - Accessiblity
	"_Accessibility.Navigation.Main": "Hauptnavigation",
	"_Accessibility.Navigation.Secondary": "Sekundärnavigation",
	"_Accessibility.Navigation.PageContent": "Seiteninhalt",
	"_Accessibility.Navigation.Label.SearchFor": "Suchen nach"
});
