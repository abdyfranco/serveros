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
	"_MenuItem.Gear": "Taakmenu…",
	"_MenuItem.LogIn": "Log in…",
	"_MenuItem.LogOut": "Log uit…",
	"_MenuItem.Plus": "Voeg menu toe…",
	"_ActionMenu.About.Title": "Info",
	"_Server.About.Dialog.Description.NoXcode": "macOS Server %@, macOS %@",
	"_Server.About.Dialog.Title": "Over macOS Server",
	"_NavPopover.Application.Xcode.Title": "Xcode",		
	"_NavPopover.Application.Wiki.Title": "Wiki",
	"_NavPopover.Application.ChangePassword.Title": "Wijzig wachtwoord",
	"_NavPopover.Application.WebCalendar.Title": "Webagenda",
	"_PoliteLogin.Format": "%@1 voor toegang tot meer voorzieningen",
	"_PoliteLogin.FormatSimple": " voor toegang tot meer voorzieningen",	
	"_PoliteLogin.LogIn": "Log in",
	"_QuickSearch.Placeholder": "Zoek",
	"_QuickSearch.Header": "Snelle zoekactie",
	"_QuickSearch.Loading.Placeholder": "Laden…",
	"_QuickSearch.See.All.Results.Title": "Toon alles…",
	"_QuickSearch.Headers.RecentSearches": "Recente zoekacties",
	"_QuickSearch.Headers.SavedSearches": "Bewaarde zoekacties",
	"_QuickSearch.RecentSearch.Delete": "Verwijder",
	"_QuickSearch.SavedSearch.Delete": "Verwijder",
	"_QuickSearch.SavedSearch.Untitled": "Naamloze zoekactie",
	"_Sources.Me.Title": "Mijn profiel",
	"_Sources.Me.Description": "Beheer je profiel.",
	"_Sources.MyActivity.Title": "Mijn activiteit",
	"_Sources.MyActivity.Description": "Je activiteit in realtime zien.",
	"_Sources.MyDocuments.Title": "Mijn documenten",
	"_Sources.MyDocuments.Description": "Je persoonlijke documenten bekijken en bewerken.",
	"_Sources.MyFavorites.Title": "Mijn favorieten",
	"_Sources.MyFavorites.Description": "De pagina's en personen bekijken die het belangrijkst voor je zijn.",
	"_Sources.Activity.Title": "Alle activiteit",
	"_Sources.Activity.Description": "Je kunt continu op de hoogte blijven van wijzigingen in blogs en wiki's die je interesseren.",
	"_Sources.Projects.Title": "Alle wiki's",
	"_Sources.Projects.Description": "Via een wiki kun je met anderen overleggen en samenwerken.",
	"_Sources.People.Title": "Alle personen",
	"_Sources.People.Description": "Hier kun je activiteiten en blogs van anderen bekijken.",
	"_Sources.Home.Title": "Thuis",
	"_Sources.Home.Description": "Dit is de thuispagina van de server.",
	"_Login.LoggedInUser": "Ingelogd (%@)",
	"_Login.Unexpected.Error": "Inloggen is mislukt vanwege een onverwachte fout. Probeer het opnieuw.",
	"_Logout.Confirm.Dialog.Title": "Log uit",
	"_Logout.Confirm.Dialog.Description": "Weet je zeker dat je wilt uitloggen?",
	"_Logout.Confirm.Dialog.OK": "Log uit",
	"_Deleted.Placeholder.Title": "Dit materiaal is verwijderd",
	"_Deleted.Placeholder.NoPermissions.Subtitle": "Alleen beheerders en gebruikers met verwijderbevoegdheid kunnen het onderdeel terugzetten",
	"_Deleted.Placeholder.Restore.Subtitle": "Zet terug",
	"_Deleted.Progress.Restoring": "Terugzetten…",
	"_Deleted.Error.CouldNotRestore": "Materiaal kan niet worden teruggezet. Probeer het opnieuw.",
	"_Load.Error.CouldNotLoadIngoFromServer": "Er kan geen versie-informatie van de server worden geladen. Probeer het opnieuw.",
	
	// WAI ARIA - Accessiblity
	"_Accessibility.Navigation.Main": "Primaire navigatie",
	"_Accessibility.Navigation.Secondary": "Secundaire navigatie",
	"_Accessibility.Navigation.PageContent": "Inhoud pagina",
	"_Accessibility.Navigation.Label.SearchFor": "Zoek naar"
});
