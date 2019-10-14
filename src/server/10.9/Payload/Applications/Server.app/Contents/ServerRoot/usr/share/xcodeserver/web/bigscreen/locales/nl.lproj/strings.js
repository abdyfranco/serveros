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
	"_XC.BigScreen.Empty.Label": "Geen bots geconfigureerd",
	"_XC.BigScreen.EntityView.Integration.Label": "Integratie %@",
	"_XC.BigScreen.EntityView.Committers.Singular.Label": "1 committer",
	"_XC.BigScreen.EntityView.Committers.Plural.Label": "%@ committers",
	"_XC.BigScreen.EntityView.Devices.Singular.Label": "1 apparaat",
	"_XC.BigScreen.EntityView.Devices.Plural.Label": "%@ apparaten",
	"_XC.BigScreen.Status.PerformingIntegration": "Integratie %@ wordt nu uitgevoerd",
	"_XC.BigScreen.Status.IntegrationCompleted": "Integratie %@ gebouwd om %@",
	"_XC.BigScreen.Status.Running": "%@ is actief…",
	"_XC.BigScreen.Commits.Empty.Placeholder": "Geen commits",
	"_XC.BigScreen.Devices.Empty.Placeholder": "Geen apparaten",
	"_XC.BigScreen.Settings.Label": "Instellingen Big Screen",
	"_XC.BigScreen.Settings.SortBy.Label": "Sorteer op",
	"_XC.BigScreen.Settings.DisplaySize.Label": "Weergavegrootte",
	"_XC.BigScreen.Settings.SortBy.Importance.Label": "Importantie",
	"_XC.BigScreen.Settings.SortBy.Name.Label": "Naam",
	"_XC.BigScreen.Settings.SortBy.Time.Label": "Tijd",
	"_XC.BigScreen.Settings.DisplaySize.Auto.Label": "Auto",
	"_XC.BigScreen.Settings.DisplaySize.Full.Label": "Volledig",
	"_XC.BigScreen.Settings.DisplaySize.Half.Label": "Half",
	"_XC.BigScreen.Settings.DisplaySize.Mini.Label": "Mini",
	"_XC.BigScreen.Settings.Button.Cancel": "Annuleer",
	"_XC.BigScreen.Settings.Button.Save": "Bewaar",
	"_XC.BigScreen.Settings.Button.Reload": "Laad opnieuw",
	"_XC.BigScreen.Settings.Failure.Title.Default": "Xcode Server is niet beschikbaar",
	"_XC.BigScreen.Settings.Failure.Title.UnsupportedBrowser": "Browser niet ondersteund",
	"_XC.BigScreen.Settings.Failure.DefaultMessage": "Xcode Server is tijdelijk niet beschikbaar. Klik op 'Laad opnieuw' om de verbinding te herstellen.",
	"_XC.BigScreen.Settings.Failure.QueuePause": "Big Screen reageert niet meer op statusupdates van botuitvoeringen. Big Screen moet opnieuw worden geladen.",
	"_XC.BigScreen.Settings.Failure.UnsupportedBrowser": "Big Screen is alleen ontworpen voor gebruik op Safari, Google Chrome en andere op WebKit gebaseerde webbrowsers."
});