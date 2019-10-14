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
	"_XC.BigScreen.Empty.Label": "Keine Bots konfiguriert",
	"_XC.BigScreen.EntityView.Integration.Label": "Integration %@",
	"_XC.BigScreen.EntityView.Committers.Singular.Label": "1 Committer",
	"_XC.BigScreen.EntityView.Committers.Plural.Label": "%@ Committer",
	"_XC.BigScreen.EntityView.Devices.Singular.Label": "1 Gerät",
	"_XC.BigScreen.EntityView.Devices.Plural.Label": "%@ Geräte",
	"_XC.BigScreen.Status.PerformingIntegration": "Integration %@ wird jetzt ausgeführt",
	"_XC.BigScreen.Status.IntegrationCompleted": "Integration %@ beendet um %@",
	"_XC.BigScreen.Status.Running": "%@ wird ausgeführt …",
	"_XC.BigScreen.Commits.Empty.Placeholder": "Keine Commits",
	"_XC.BigScreen.Devices.Empty.Placeholder": "Keine Geräte",
	"_XC.BigScreen.Settings.Label": "Big Screen-Einstellungen",
	"_XC.BigScreen.Settings.SortBy.Label": "Sortiert nach",
	"_XC.BigScreen.Settings.DisplaySize.Label": "Anzeigegröße",
	"_XC.BigScreen.Settings.SortBy.Importance.Label": "Bedeutung",
	"_XC.BigScreen.Settings.SortBy.Name.Label": "Name",
	"_XC.BigScreen.Settings.SortBy.Time.Label": "Zeit",
	"_XC.BigScreen.Settings.DisplaySize.Auto.Label": "Auto",
	"_XC.BigScreen.Settings.DisplaySize.Full.Label": "Voll",
	"_XC.BigScreen.Settings.DisplaySize.Half.Label": "Halbe",
	"_XC.BigScreen.Settings.DisplaySize.Mini.Label": "Mini",
	"_XC.BigScreen.Settings.Button.Cancel": "Abbrechen",
	"_XC.BigScreen.Settings.Button.Save": "Sichern",
	"_XC.BigScreen.Settings.Button.Reload": "Neu laden",
	"_XC.BigScreen.Settings.Failure.Title.Default": "Xcode-Server nicht verfügbar",
	"_XC.BigScreen.Settings.Failure.Title.UnsupportedBrowser": "Nicht unterstützter Browser",
	"_XC.BigScreen.Settings.Failure.DefaultMessage": "Xcode-Server ist vorübergehend nicht verfügbar. Klicken Sie auf „Neu laden“, um die Verbindung wieder herzustellen.",
	"_XC.BigScreen.Settings.Failure.QueuePause": "Big Screen reagiert nicht mehr auf Aktualisierungen des Bot-Ausführungsstatus und muss neu geladen werden.",
	"_XC.BigScreen.Settings.Failure.UnsupportedBrowser": "Big Screen unterstützt nur Safari, Google Chrome und andere WebKit-basierte Webbrowser."
});