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
	"_MenuItem.Gear": "Menu Azioni…",
	"_MenuItem.LogIn": "Accedi…",
	"_MenuItem.LogOut": "Esci…",
	"_MenuItem.Plus": "Menu Aggiungi…",
	"_ActionMenu.About.Title": "Informazioni",
	"_Server.About.Dialog.Description.NoXcode": "Server %@, OS X %@",
	"_Server.About.Dialog.Description.Xcode": "Server %@, OS X %@, Xcode %@",
	"_Server.About.Dialog.Title": "Informazioni su Server",
	"_NavPopover.Application.Xcode.Title": "Xcode",
	"_NavPopover.Application.Wiki.Title": "Wiki",
	"_NavPopover.Application.ChangePassword.Title": "Cambia password",
	"_NavPopover.Application.WebCalendar.Title": "Calendario web",
	"_PoliteLogin.Format": "%@1 per accedere ad altri servizi",
	"_PoliteLogin.LogIn": "Esegui il login",
	"_QuickSearch.Placeholder": "Cerca",
	"_QuickSearch.Header": "Ricerca veloce",
	"_QuickSearch.Loading.Placeholder": "Carico…",
	"_QuickSearch.See.All.Results.Title": "Mostra tutti…",
	"_QuickSearch.Headers.RecentSearches": "Ricerche recenti",
	"_QuickSearch.Headers.SavedSearches": "Ricerche salvate",
	"_QuickSearch.RecentSearch.Delete": "Elimina",
	"_QuickSearch.SavedSearch.Delete": "Elimina",
	"_QuickSearch.SavedSearch.Untitled": "Ricerca senza titolo",
	"_Sources.Me.Title": "Il mio profilo",
	"_Sources.Me.Description": "Gestisci il tuo profilo.",
	"_Sources.MyActivity.Title": "Le mie attività",
	"_Sources.MyActivity.Description": "Guarda le tue attività in tempo reale.",
	"_Sources.MyDocuments.Title": "I miei documenti",
	"_Sources.MyDocuments.Description": "Visualizza e modifica i documenti personali.",
	"_Sources.MyFavorites.Title": "I miei preferiti",
	"_Sources.MyFavorites.Description": "Visualizza le pagine e le persone a cui tieni di più.",
	"_Sources.Activity.Title": "Attività",
	"_Sources.Activity.Description": "Controlla in tempo reale l'attività delle persone e dei wiki che ti interessano.",
	"_Sources.Projects.Title": "Tutti i wiki",
	"_Sources.Projects.Description": "Comunica e collabora con altri membri del team.",
	"_Sources.People.Title": "Tutte le persone",
	"_Sources.People.Description": "Visualizza i blog e le attività di altre persone.",
	"_Sources.Home.Title": "Inizio",
	"_Sources.Home.Description": "Visualizza la pagina iniziale del server.",
	"_Login.LoggedInUser": "Accesso effettuato (%@)",
	"_Login.Unexpected.Error": "Login non riuscito a causa di un errore inatteso. Riprova.",
	"_Logout.Confirm.Dialog.Title": "Esci",
	"_Logout.Confirm.Dialog.Description": "Sei sicuro di voler uscire?",
	"_Logout.Confirm.Dialog.OK": "Esci",
	"_Deleted.Placeholder.Title": "Questo contenuto è stato eliminato",
	"_Deleted.Placeholder.NoPermissions.Subtitle": "Solo gli amministratori e gli utenti con i permessi per eliminare possono ripristinarlo",
	"_Deleted.Placeholder.Restore.Subtitle": "Ripristina",
	"_Deleted.Progress.Restoring": "Ripristino…",
	"_Deleted.Error.CouldNotRestore": "Impossibile ripristinare il contenuto. Riprova.",
	"_Load.Error.CouldNotLoadIngoFromServer": "Impossibile caricare le informazioni di versione dal server. Riprova.",
	
	// WAI ARIA - Accessiblity
	"_Accessibility.Navigation.Main": "Navigazione principale",
	"_Accessibility.Navigation.Secondary": "Navigazione secondaria",
	"_Accessibility.Navigation.PageContent": "Contenuto pagina",
	"_Accessibility.Navigation.Label.SearchFor": "Cerca"
});
