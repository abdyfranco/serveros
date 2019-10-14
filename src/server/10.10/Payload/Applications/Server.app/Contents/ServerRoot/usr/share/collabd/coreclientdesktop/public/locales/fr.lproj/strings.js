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
	"_MenuItem.Gear": "Menu Action…",
	"_MenuItem.LogIn": "Se connecter…",
	"_MenuItem.LogOut": "Se déconnecter…",
	"_MenuItem.Plus": "Menu Ajouter…",
	"_ActionMenu.About.Title": "À propos",
	"_Server.About.Dialog.Description.NoXcode": "Server %@, OS X %@",
	"_Server.About.Dialog.Title": "À propos de Server",
	"_NavPopover.Application.Xcode.Title": "Xcode",		
	"_NavPopover.Application.Wiki.Title": "Wiki",
	"_NavPopover.Application.ChangePassword.Title": "Modifier le mot de passe",
	"_NavPopover.Application.WebCalendar.Title": "Calendrier web",
	"_PoliteLogin.Format": "%@1 pour accéder à plus de services",
	"_PoliteLogin.FormatSimple": " pour accéder à plus de services",	
	"_PoliteLogin.LogIn": "Connectez-vous",
	"_QuickSearch.Placeholder": "Rechercher",
	"_QuickSearch.Header": "Recherche rapide",
	"_QuickSearch.Loading.Placeholder": "Chargement…",
	"_QuickSearch.See.All.Results.Title": "Tout afficher…",
	"_QuickSearch.Headers.RecentSearches": "Recherches récentes",
	"_QuickSearch.Headers.SavedSearches": "Recherches enregistrées",
	"_QuickSearch.RecentSearch.Delete": "Supprimer",
	"_QuickSearch.SavedSearch.Delete": "Supprimer",
	"_QuickSearch.SavedSearch.Untitled": "Recherche sans titre",
	"_Sources.Me.Title": "Mon profil",
	"_Sources.Me.Description": "Gérez votre profil.",
	"_Sources.MyActivity.Title": "Mon activité",
	"_Sources.MyActivity.Description": "Visualisez votre activité en temps réel.",
	"_Sources.MyDocuments.Title": "Mes documents",
	"_Sources.MyDocuments.Description": "Affichez et modifiez vos documents personnels.",
	"_Sources.MyFavorites.Title": "Mes favoris",
	"_Sources.MyFavorites.Description": "Affichez vos pages préférées et voyez ceux qui vous sont chers.",
	"_Sources.Activity.Title": "Toutes les activités",
	"_Sources.Activity.Description": "Suivez en temps réel l’activité des personnes et wikis qui vous intéressent.",
	"_Sources.Projects.Title": "Tous les wikis",
	"_Sources.Projects.Description": "Communiquez et collaborez avec les membres de votre équipe.",
	"_Sources.People.Title": "Tout le monde",
	"_Sources.People.Description": "Afficher l’activité et les blogs d’autres personnes.",
	"_Sources.Home.Title": "Accueil",
	"_Sources.Home.Description": "Afficher la page d’accueil du serveur.",
	"_Login.LoggedInUser": "Connecté (%@)",
	"_Login.Unexpected.Error": "L’ouverture de session a échoué, car une erreur inattendue s’est produite. Veuillez réessayer.",
	"_Logout.Confirm.Dialog.Title": "Se déconnecter",
	"_Logout.Confirm.Dialog.Description": "Souhaitez-vous vous déconnecter ?",
	"_Logout.Confirm.Dialog.OK": "Déconnecter",
	"_Deleted.Placeholder.Title": "Ce contenu a été supprimé",
	"_Deleted.Placeholder.NoPermissions.Subtitle": "Seuls les administrateurs et utilisateurs avec une autorisation de suppression peuvent effectuer une restauration",
	"_Deleted.Placeholder.Restore.Subtitle": "Restaurer",
	"_Deleted.Progress.Restoring": "Restauration…",
	"_Deleted.Error.CouldNotRestore": "Impossible de restaurer le contenu. Réessayez.",
	"_Load.Error.CouldNotLoadIngoFromServer": "Impossible de charger les informations de version depuis le serveur. Réessayez.",
	
	// WAI ARIA - Accessiblity
	"_Accessibility.Navigation.Main": "Navigation principale",
	"_Accessibility.Navigation.Secondary": "Navigation secondaire",
	"_Accessibility.Navigation.PageContent": "Contenu de la page",
	"_Accessibility.Navigation.Label.SearchFor": "Rechercher"
});
