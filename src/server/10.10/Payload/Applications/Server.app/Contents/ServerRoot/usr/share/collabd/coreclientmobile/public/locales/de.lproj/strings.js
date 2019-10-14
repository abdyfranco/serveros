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
	"_NavigationSidebar.My.Activity": "Meine Aktivität",
	"_NavigationSidebar.My.Documents": "Meine Dokumente",
	"_NavigationSidebar.My.Favorites": "Meine Favoriten",
	"_NavigationSidebar.Home": "Anfang",
	"_NavigationSidebar.All.Activity": "Alle Aktivitäten",
	"_NavigationSidebar.All.Wikis": "Alle Wikis",
	"_NavigationSidebar.All.People": "Alle Personen",
	"_NavigationSidebar.RecentlyViewed.Title": "Neueste Dokumente",
	"_Login.LogIn": "Anmelden",
	"_Login.LogOut": "Abmelden",
	"_Login.Unauthenticated": "Nicht authentifizierter Benutzer",
	"_Login.DialogTitle": "Anmelden",
	"_Login.UserName": "Benutzername",
	"_Login.Password": "Passwort",
	"_Login.RememberMe": "Benutzer merken",
	"_WikiSetupAssistant.Next": "Weiter",
	"_WikiSetupAssistant.Create": "Erstellen",
	"_WikiSetupAssistant.GeneralPane.ShortTitle": "Allgemein",
	"_WikiSetupAssistant.GeneralPane.LongTitle": "Ein neues Wiki erstellen",
	"_WikiSetupAssistant.GeneralPane.Name.Label": "Wiki-Name",
	"_WikiSetupAssistant.GeneralPane.Name.Placeholder": "Apple Wiki",
	"_WikiSetupAssistant.GeneralPane.Description.Label": "Beschreibung",
	"_WikiSetupAssistant.GeneralPane.Description.Placeholder": "Beschreiben Sie dieses Wiki",
	"_WikiSetupAssistant.GeneralUserPane.Name.Label": "Benutzer",
	"_WikiSetupAssistant.GeneralUserPane.Email.Label": "E-Mail",
	"_WikiSetupAssistant.GeneralUserPane.Email.Placeholder": "benutzer@example.com",
	"_WikiSetupAssistant.ACLPane.ShortTitle": "Rechte",
	"_WikiSetupAssistant.ACLPane.LongTitle": "Zugriffsrechte einstellen",
	"_WikiSetupAssistant.AppearancePane.ShortTitle": "Erscheinungsbild",
	"_WikiSetupAssistant.AppearancePane.LongTitle": "Erscheinungsbild festlegen",
	"_WikiSetupAssistant.AppearancePane.ColorScheme.Label": "Farbschema",	
	"_WikiSetupAssistant.DonePane.LongTitle": "Konfiguration beendet",
	"_WikiSetupAssistant.DonePane.GoToWiki%@": "Gehe zum „%@“-Wiki",
	"_WikiSetupAssistant.DonePane.InformationLine1%@" : "Das Wiki „%@“ wurde erstellt und kann verwendet werden.",
	"_WikiSetupAssistant.DonePane.InformationLine2" : "Weitere Konfigurationsoptionen sind im Wiki verfügbar.",
	"_Document.Sidebar.Info": "Info",
	"_Document.Sidebar.ViewAll": "Alle anzeigen",
	"_Document.Sidebar.Comments": "Kommentare",
	"_Document.Sidebar.Comments.None": "Keine Kommentare",
	"_Document.Sidebar.Comments.New": "Kommentar",
	"_Document.Sidebar.Comments.You": "Sie",
	"_Document.Sidebar.Comments.Now": "Jetzt",
	"_Document.Sidebar.Related": "Zugehörig",
	"_Document.Sidebar.Related.None": "Keine zugehörigen Dokumente",
	"_Document.Sidebar.Related.Add": "Zugehöriges Dokument hinzufügen …",
	"_Document.Sidebar.Related.SuggestedDocuments": "Vorgeschlagene Dokumente",
	"_Document.Sidebar.Tags": "Tags",
	"_Document.Sidebar.Tags.None": "Keine Tags",
	"_Document.Sidebar.Tags.Add": "Tag hinzufügen …",
	"_Document.Sidebar.Tags.Add.Name": "Tag-Textfeld hinzufügen",
	"_Document.Sidebar.Tags.SuggestedTags": "Vorgeschlagene Tags",
	"_Document.Sidebar.History": "Verlauf",
	"_Document.Sidebar.History.None": "Kein Verlauf",
	"_Document.Sidebar.History.VersionAvailableSingular": "1 Version verfügbar",
	"_Document.Sidebar.History.VersionAvailablePlural": "%@ Versionen verfügbar",
	"_Document.Sidebar.Notifications": "E-Mail-Benachrichtigungen",
	"_Document.Sidebar.Notifications.Updated": "Alle Updates",
	"_Document.Sidebar.Notifications.CommentAdded": "Kommentar hinzugefügt",
	"_Document.Sidebar.Notifications.DocumentUpdated": "Dokument aktualisiert",
	"_Document.Sidebar.Notifications.EmailInputTitle": "E‑Mail eingeben",
	
	"_Document.Sidebar.Sharing": "Freigaben",
	"_Document.Sidebar.Sharing.None": "Nicht freigegeben",
	"_Document.Sidebar.Sharing.Add": "Für andere freigeben …",
	"_Document.Sidebar.Sharing.PopoverTitle": "Freigabe-Einstellungen bearbeiten",
	
	"_Sharing.Notification.Updating.Subscription": "Abonnement aktualisieren …",
	"_Sharing.Notification.Updating.Subscription.Succeeded": "Abonnement erfolgreich aktualisiert.",
	"_Sharing.Notification.Updating.Subscription.Failed": "Abonnement konnte nicht aktualisiert werden. Versuchen Sie es erneut.",
	"_Sharing.Notification.Updating.Subscription.Failed.Email": "Sie müssen eine bevorzugte E-Mail-Adresse festlegen, um Abonnements zu verwenden.",
	
	"_FilterBar.Filter.Label": "Zeigen:",
	"_FilterBar.Filter.All.Title": "Alles",
	"_FilterBar.Filter.Unread.Title": "Ungelesen",
	"_FilterBar.Filter.Favorites.Title": "Favoriten",
	"_FilterBar.SortBy.Label": "Sortieren nach:",
	"_FilterBar.SortBy.Rank.Title": "Größte Relevanz",
	"_FilterBar.SortBy.Title.Title": "Titel",
	"_FilterBar.SortBy.MostRecent.Title": "Neueste",
	"_FilterBar.SortBy.LeastRecent.Title": "Ältesten",
	"_FilterBar.Grid.Title": "Symbole",
	"_FilterBar.List.Title": "Liste",
	"_GearMenu.General.Help": "Hilfe",
	"_GearMenu.General.MySettings": "Meine Benutzereinstellungen …",
	"_GearMenu.General.MySettings.Title": "Meine Benutzereinstellungen",
	"_GearMenu.General.Move" : "Bewegen …",
	"_GearMenu.General.Replace": "Datei ersetzen …",
	"_GearMenu.Wiki.Settings": "Wiki-Einstellungen …",
	"_GearMenu.Wiki.Settings.Title": "Wiki-Einstellungen",
	"_GearMenu.User.Hide": "Benutzer ausblenden …",
	"_GearMenu.User.Unhide": "Benutzer einblenden …",
	"_GearMenu.Search.SaveSearch" : "Diese Suche sichern",
	"_PlusMenu.NewWiki": "Neues Wiki …",
	"_PlusMenu.NewPage.NewPageInWiki%@": "Neue Seite in „%@“ …",
	"_PlusMenu.NewPage.NewInMyDocs": "Neue Seite in „Meine Dokumente“ …",
	"_PlusMenu.NewPage.Dialog.Title" : "Neue Seite",
	"_PlusMenu.NewPage.Dialog.Label" : "Seitentitel",
	"_Settings.Permissions.CommentAccess.Label":"Kommentare",
	"_Settings.Permissions.CommentAccess.all":"Jeder",
	"_Settings.Permissions.CommentAccess.authenticated":"Authentifizierte Benutzer",
	"_Settings.Permissions.CommentAccess.disabled":"Niemand",
	"_Settings.Permissions.CommentModeration.Label":"Moderation",
	"_Settings.Permissions.CommentModeration.all":"Alle Kommentare",
	"_Settings.Permissions.CommentModeration.anonymous":"Nur anonyme Kommentare",
	"_Settings.Permissions.CommentModeration.disabled":"Ohne",
	"_Settings.General.PreferedEmail":"Bevorzugte E-Mail",
	
	// User Error Messages
	"_Error.Delete.Document.Permissions":"Nur der Eigentümer oder ein Administrator kann dieses Dokument löschen.",
	"_Error.Delete.Wiki.Permissions":"Nur der Eigentümer oder ein Administrator kann dieses Wiki löschen.",
	"_Error.Hide.Person.Permissions":"Nur ein Administrator kann eine Person ausblenden.",	
	"_Error.People.Disabled": "Die Option zum Anzeigen aller Personen ist auf diesem Server deaktiviert.",
	"_Error.Projects.Disabled": "Die Option zum Anzeigen aller Projekte ist auf diesem Server deaktiviert.",
	"_Error.AllActivity.Disabled": "Die Option zum Anzeigen aller Aktivitäten ist auf diesem Server deaktiviert.",

	// Documents
	"_General.Documents.My": "Meine Dokumente",
	"_General.Documents.None": "Keine Dokumente",
	"_General.Documents.Untitled": "Ohne Titel",
	"_General.Documents.Recents": "Neueste Dokumente",
	// Favorites
	"_General.Favorites": "Favoriten",
	// Search
	"_Search": "Suchen",
	"_Search.Results": "Suchergebnisse",
	"_Search.Recents": "Letzte Sucheinträge",
	"_Search.Saved": "Gesicherte Suchabfragen",
	// Controls
	"_Control.Back": "Zurück",
	"_Control.Add": "Hinzufügen",
	"_Control.Cancel": "Abbrechen",
	"_Control.Delete": "Löschen",
	"_Control.TrashIcon": "Papierkorbsymbol",	
	"_Control.Done": "Fertig",
	"_Control.Edit": "Bearbeiten",
	"_Control.Save": "Sichern",
	"_Control.Send": "Senden",
	"_Control.OK": "OK",
	"_Control.Close": "Schließen",
	"_Control.Plus": "Plus",
	"_Control.ShowDiff": "ShowDiff",		
	"_Control.Pagination.ShowAll": "Alle einblenden",
	"_Control.Gear": "Aktionsmenü",
	"_Control.MenuNavigation": "Navigation",
	"_Control.AccessRole.Popup": " Popup",
	"_Control.Switch.On": "EIN",
	"_Control.Switch.Off": "AUS",	
	"_Settings.Notification": "E-Mail-Benachrichtigungen an neue Mitglieder senden"
});
