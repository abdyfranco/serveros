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
	"_NavigationSidebar.My.Activity": "Mon activité",
	"_NavigationSidebar.My.Documents": "Mes documents",
	"_NavigationSidebar.My.Favorites": "Mes favoris",
	"_NavigationSidebar.Home": "Accueil",
	"_NavigationSidebar.All.Activity": "Toutes les activités",
	"_NavigationSidebar.All.Wikis": "Tous les wikis",
	"_NavigationSidebar.All.People": "Tout le monde",
	"_NavigationSidebar.RecentlyViewed.Title": "Documents récents",
	"_Login.LogIn": "Connexion",
	"_Login.LogOut": "Déconnecter",
	"_Login.Unauthenticated": "Utilisateur non authentifié",
	"_Login.DialogTitle": "Connexion",
	"_Login.UserName": "Nom d’utilisateur",
	"_Login.Password": "Mot de passe",
	"_Login.RememberMe": "Mémoriser",
	"_WikiSetupAssistant.Next": "Suivant",
	"_WikiSetupAssistant.Create": "Créer",
	"_WikiSetupAssistant.GeneralPane.ShortTitle": "Général",
	"_WikiSetupAssistant.GeneralPane.LongTitle": "Créer un nouveau Wiki",
	"_WikiSetupAssistant.GeneralPane.Name.Label": "Nom du Wiki",
	"_WikiSetupAssistant.GeneralPane.Name.Placeholder": "Apple Wiki",
	"_WikiSetupAssistant.GeneralPane.Description.Label": "Description",
	"_WikiSetupAssistant.GeneralPane.Description.Placeholder": "Commenter ce wiki",
	"_WikiSetupAssistant.GeneralUserPane.Name.Label": "Nom d’utilisateur",
	"_WikiSetupAssistant.GeneralUserPane.Email.Label": "Adresse e-mail",
	"_WikiSetupAssistant.GeneralUserPane.Email.Placeholder": "utilisateur@example.com",
	"_WikiSetupAssistant.ACLPane.ShortTitle": "Autorisations",
	"_WikiSetupAssistant.ACLPane.LongTitle": "Définir les autorisations",
	"_WikiSetupAssistant.AppearancePane.ShortTitle": "Apparence",
	"_WikiSetupAssistant.AppearancePane.LongTitle": "Définir l’aspect",
	"_WikiSetupAssistant.AppearancePane.ColorScheme.Label": "Thème de couleurs",	
	"_WikiSetupAssistant.DonePane.LongTitle": "Configuration terminée",
	"_WikiSetupAssistant.DonePane.GoToWiki%@": "Aller au Wiki « %@ »",
	"_WikiSetupAssistant.DonePane.InformationLine1%@" : "Le wiki « %@ » a été créé et est prêt à être utilisé.",
	"_WikiSetupAssistant.DonePane.InformationLine2" : "Des options de configuration supplémentaires sont disponibles sur le wiki.",
	"_Document.Sidebar.Info": "Info",
	"_Document.Sidebar.ViewAll": "Afficher tout",
	"_Document.Sidebar.Comments": "Commentaires",
	"_Document.Sidebar.Comments.None": "Aucun commentaire",
	"_Document.Sidebar.Comments.New": "Commentaire",
	"_Document.Sidebar.Comments.You": "Vous",
	"_Document.Sidebar.Comments.Now": "Maintenant",
	"_Document.Sidebar.Related": "Documents liés",
	"_Document.Sidebar.Related.None": "Aucun document lié",
	"_Document.Sidebar.Related.Add": "Ajouter un document lié…",
	"_Document.Sidebar.Related.SuggestedDocuments": "Documents suggérés",
	"_Document.Sidebar.Tags": "Étiquettes",
	"_Document.Sidebar.Tags.None": "Aucune étiquette",
	"_Document.Sidebar.Tags.Add": "Ajouter une étiquette…",
	"_Document.Sidebar.Tags.SuggestedTags": "Étiquettes suggérées",
	"_Document.Sidebar.History": "Historique",
	"_Document.Sidebar.History.None": "Aucun historique",
	"_Document.Sidebar.History.VersionAvailableSingular": "1 version disponible",
	"_Document.Sidebar.History.VersionAvailablePlural": "%@ versions disponibles",
	"_Document.Sidebar.Notifications": "Notifications par e-mail",
	"_Document.Sidebar.Notifications.Updated": "Toutes les mises à jour",
	"_Document.Sidebar.Notifications.CommentAdded": "Commentaire ajouté",
	"_Document.Sidebar.Notifications.DocumentUpdated": "Document mis à jour",
	"_Document.Sidebar.Notifications.EmailInputTitle": "Saisissez votre adresse e-mail",
	
	"_Document.Sidebar.Sharing": "Partage",
	"_Document.Sidebar.Sharing.None": "Non partagé",
	"_Document.Sidebar.Sharing.Add": "Partager…",
	"_Document.Sidebar.Sharing.PopoverTitle": "Modifier les réglages de partage",
	
	"_Sharing.Notification.Updating.Subscription": "Mise à jour de l’abonnement…",
	"_Sharing.Notification.Updating.Subscription.Succeeded": "Abonnement mis à jour correctement.",
	"_Sharing.Notification.Updating.Subscription.Failed": "Impossible de mettre à jour l’abonnement. Veuillez réessayer.",
	"_Sharing.Notification.Updating.Subscription.Failed.Email": "Une adresse e-mail préférée doit être configurée pour pouvoir vous abonner.",
	
	"_FilterBar.Filter.Label": "Afficher :",
	"_FilterBar.Filter.All.Title": "Tout",
	"_FilterBar.Filter.Unread.Title": "Non lu(s)",
	"_FilterBar.Filter.Favorites.Title": "Favoris",
	"_FilterBar.SortBy.Label": "Trier par :",
	"_FilterBar.SortBy.Rank.Title": "Le plus pertinent",
	"_FilterBar.SortBy.Title.Title": "Titre",
	"_FilterBar.SortBy.MostRecent.Title": "Le plus récent",
	"_FilterBar.SortBy.LeastRecent.Title": "Le moins récent",
	"_FilterBar.Grid.Title": "Icônes",
	"_FilterBar.List.Title": "Liste",
	"_GearMenu.General.Help": "Aide",
	"_GearMenu.General.MySettings": "Mes réglages utilisateur…",
	"_GearMenu.General.MySettings.Title": "Mes réglages utilisateur",
	"_GearMenu.General.Move" : "Déplacer…",
	"_GearMenu.Wiki.Settings": "Réglages wiki…",
	"_GearMenu.Wiki.Settings.Title": "Réglages wiki",
	"_GearMenu.User.Hide": "Masquer l’utilisateur…",
	"_GearMenu.User.Unhide": "Afficher l’utilisateur…",
	"_GearMenu.Search.SaveSearch" : "Enregistrer cette recherche",
	"_PlusMenu.NewWiki": "Nouveau wiki…",
	"_PlusMenu.NewPage.NewPageInWiki%@": "Nouvelle page dans « %@ »…",
	"_PlusMenu.NewPage.NewInMyDocs": "Nouvelle page dans Mes Documents…",
	"_PlusMenu.NewPage.Dialog.Title" : "Nouvelle page",
	"_PlusMenu.NewPage.Dialog.Label" : "Titre de la page",
	"_Settings.Permissions.CommentAccess.Label":"Commentaires",
	"_Settings.Permissions.CommentAccess.all":"Tous les utilisateurs",
	"_Settings.Permissions.CommentAccess.authenticated":"Utilisateurs authentifiés",
	"_Settings.Permissions.CommentAccess.disabled":"Aucun utilisateur",
	"_Settings.Permissions.CommentModeration.Label":"Modération des commentaires",
	"_Settings.Permissions.CommentModeration.all":"Tous les commentaires",
	"_Settings.Permissions.CommentModeration.anonymous":"Commentaires anonymes uniquement",
	"_Settings.Permissions.CommentModeration.disabled":"Aucune",
	"_Settings.General.PreferedEmail":"Adresse e-mail préférée",
	
	
	"_Error.Delete.Document.Permissions":"Seul le propriétaire ou un administrateur peut supprimer ce document.",
	"_Error.Delete.Wiki.Permissions":"Seul le propriétaire ou un administrateur peut supprimer ce wiki.",
	"_Error.Hide.Person.Permissions":"Seul l’administrateur peut masquer une personne.",
	
	// TODO - clean up below this line
	
	

	// Documents
	"_General.Documents.My": "Mes documents",
	"_General.Documents.None": "Aucun document",
	"_General.Documents.Untitled": "Sans titre",
	"_General.Documents.Recents": "Documents récents",
	// Favorites
	"_General.Favorites": "Favoris",
	// Search
	"_Search": "Rechercher",
	"_Search.Results": "Résultats de la recherche",
	"_Search.Recents": "Recherches récentes",
	"_Search.Saved": "Recherches enregistrées",
	// Controls
	"_Control.Back": "Retour",
	"_Control.Add": "Ajouter",
	"_Control.Cancel": "Annuler",
	"_Control.Delete": "Supprimer",
	"_Control.Done": "Fermer",
	"_Control.Edit": "Modifier",
	"_Control.Save": "Enregistrer",
	"_Control.Send": "Envoyer",
	"_Control.OK": "OK",
	"_Control.Pagination.ShowAll": "Tout afficher"
});
