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
	"_XC.BigScreen.Empty.Label": "Nessun bot configurato",
	"_XC.BigScreen.EntityView.Integration.Label": "Integrazione %@",
	"_XC.BigScreen.EntityView.Committers.Singular.Label": "1 esecutore commit",
	"_XC.BigScreen.EntityView.Committers.Plural.Label": "%@ esecutori commit",
	"_XC.BigScreen.EntityView.Devices.Singular.Label": "1 dispositivo",
	"_XC.BigScreen.EntityView.Devices.Plural.Label": "%@ dispositivi",
	"_XC.BigScreen.Status.PerformingIntegration": "Eseguo integrazione %@ adesso",
	"_XC.BigScreen.Status.IntegrationCompleted": "Integrazione %@ con build alle %@",
	"_XC.BigScreen.Status.Running": "%@ è in esecuzione…",
	"_XC.BigScreen.Commits.Empty.Placeholder": "Nessun commit",
	"_XC.BigScreen.Devices.Empty.Placeholder": "Nessun dispositivo",
	"_XC.BigScreen.Settings.Label": "Impostazioni Grande Schermo",
	"_XC.BigScreen.Settings.SortBy.Label": "Ordina per",
	"_XC.BigScreen.Settings.DisplaySize.Label": "Dimensioni monitor",
	"_XC.BigScreen.Settings.SortBy.Importance.Label": "Importanza",
	"_XC.BigScreen.Settings.SortBy.Name.Label": "Nome",
	"_XC.BigScreen.Settings.SortBy.Time.Label": "Orario",
	"_XC.BigScreen.Settings.DisplaySize.Auto.Label": "Auto",
	"_XC.BigScreen.Settings.DisplaySize.Full.Label": "Intero",
	"_XC.BigScreen.Settings.DisplaySize.Half.Label": "Metà",
	"_XC.BigScreen.Settings.DisplaySize.Mini.Label": "Mini",
	"_XC.BigScreen.Settings.Button.Cancel": "Annulla",
	"_XC.BigScreen.Settings.Button.Save": "Salva",
	"_XC.BigScreen.Settings.Button.Reload": "Ricarica",
	"_XC.BigScreen.Settings.Failure.Title.Default": "Xcode Server non disponibile",
	"_XC.BigScreen.Settings.Failure.Title.UnsupportedBrowser": "Browser non supportato",
	"_XC.BigScreen.Settings.Failure.DefaultMessage": "Xcode Server non disponibile al momento. Fai clic su Ricarica per riconnetterti.",
	"_XC.BigScreen.Settings.Failure.QueuePause": "Grande Schermo ha smesso di rispondere agli aggiornamenti di stato delle esecuzioni bot e deve essere ricaricato.",
	"_XC.BigScreen.Settings.Failure.UnsupportedBrowser": "Grande Schermo è progettato per funzionare solo con Safari, Google Chrome e altri browser web basati su WebKit."
});