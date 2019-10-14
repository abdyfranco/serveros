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
	"_Webauth.Title": "Webauthentifizierungsdienst",
	"_Webauth.Please.Log.In": "Bitte melden Sie sich an",
	"_Webauth.User.Name": "Benutzername",
	"_Webauth.Password": "Kennwort",
	"_Webauth.Remember.Me": "Benutzer merken",
	"_Webauth.Warning.Plaintext": "Ihr Kennwort wird in Klartext übertragen",
	"_Webauth.Cancel": "Abbrechen",
	"_Webauth.Log.In": "Anmelden",
	"_Webauth.Error.InvalidUserOrPassword": "Benutzername oder Kennwort ist ungültig",
	"_ChangePassword.Title": "Kennwort ändern",
	"_ChangePassword.Description": "Geben Sie Ihr aktuelles Kennwort gefolgt von Ihrem neuen Kennwort ein und klicken Sie auf „Sichern“, um Ihr Accountkennwort zu ändern.",
	"_ChangePassword.Old.Password.Label": "Altes Kennwort",
	"_ChangePassword.New.Password.Label": "Neues Kennwort",
	"_ChangePassword.Confirm.Password.Label": "Neues Kennwort",
	"_ChangePassword.Validation.Incorrect.Password": "Das alte Kennwort ist falsch",
	"_ChangePassword.Validation.Bad.Match": "Neues Kennwort und Bestätigung stimmen nicht überein",
	"_ChangePassword.Status.Changing.Password": "Kennwort ändern …",
	"_ChangePassword.Status.Error": "Ihr Kennwort konnte nicht geändert werden. Versuchen Sie es erneut.",
	"_ChangePassword.Status.Success": "Ihr Kennwort wurde erfolgreich geändert.",
	"_ChangePassword.Save.Title": "Sichern",
	"_ChangePassword.Cancel.Title": "Abmelden"
});
