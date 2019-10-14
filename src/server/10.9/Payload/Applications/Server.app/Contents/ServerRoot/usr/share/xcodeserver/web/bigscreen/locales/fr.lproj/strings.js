// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
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
	"_XC.BigScreen.Empty.Label": "Aucun robot configuré",
	"_XC.BigScreen.EntityView.Integration.Label": "Intégration %@",
	"_XC.BigScreen.EntityView.Committers.Singular.Label": "1 valideur",
	"_XC.BigScreen.EntityView.Committers.Plural.Label": "%@ valideurs",
	"_XC.BigScreen.EntityView.Devices.Singular.Label": "1 appareil",
	"_XC.BigScreen.EntityView.Devices.Plural.Label": "%@ appareils",
	"_XC.BigScreen.Status.PerformingIntegration": "Intégration %@ en cours",
	"_XC.BigScreen.Status.IntegrationCompleted": "Intégration %@ à %@",
	"_XC.BigScreen.Status.Running": "%@ est en cours d’exécution…",
	"_XC.BigScreen.Commits.Empty.Placeholder": "Aucun commit",
	"_XC.BigScreen.Devices.Empty.Placeholder": "Aucun appareil",
	"_XC.BigScreen.Settings.Label": "Réglages Grand écran",
	"_XC.BigScreen.Settings.SortBy.Label": "Trier par",
	"_XC.BigScreen.Settings.DisplaySize.Label": "Taille d’affichage",
	"_XC.BigScreen.Settings.SortBy.Importance.Label": "Importance",
	"_XC.BigScreen.Settings.SortBy.Name.Label": "Nom",
	"_XC.BigScreen.Settings.SortBy.Time.Label": "Heure",
	"_XC.BigScreen.Settings.DisplaySize.Auto.Label": "Autom.",
	"_XC.BigScreen.Settings.DisplaySize.Full.Label": "Plein écran",
	"_XC.BigScreen.Settings.DisplaySize.Half.Label": "Demi",
	"_XC.BigScreen.Settings.DisplaySize.Mini.Label": "Mini",
	"_XC.BigScreen.Settings.Button.Cancel": "Annuler",
	"_XC.BigScreen.Settings.Button.Save": "Enregistrer",
	"_XC.BigScreen.Settings.Button.Reload": "Recharger",
	"_XC.BigScreen.Settings.Failure.Title.Default": "Serveur Xcode indisponible",
	"_XC.BigScreen.Settings.Failure.Title.UnsupportedBrowser": "Navigateur non pris en charge",
	"_XC.BigScreen.Settings.Failure.DefaultMessage": "Serveur Xcode est temporairement indisponible. Cliquez sur Recharger pour vous connecter à nouveau.",
	"_XC.BigScreen.Settings.Failure.QueuePause": "Grand écran ne répond plus aux mises à jour d’état de robots et doit être rechargé.",
	"_XC.BigScreen.Settings.Failure.UnsupportedBrowser": "Grand écran ne fonctionne que sur Safari, Google Chrome et autres navigateurs web WebKit."
});