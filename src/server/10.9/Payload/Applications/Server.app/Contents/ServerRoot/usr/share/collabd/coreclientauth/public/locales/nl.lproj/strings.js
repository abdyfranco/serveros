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
	"_Webauth.Title": "Web-identiteitscontrolevoorziening",
	"_Webauth.Please.Log.In": "Log eerst in",
	"_Webauth.User.Name": "Naam",
	"_Webauth.Password": "Wachtwoord",
	"_Webauth.Remember.Me": "Houd me ingelogd",
	"_Webauth.Warning.Plaintext": "Uw wachtwoord wordt ongecodeerd verstuurd",
	"_Webauth.Cancel": "Annuleer",
	"_Webauth.Log.In": "Log in",
	"_Webauth.Error.InvalidUserOrPassword": "De gebruikersnaam of het wachtwoord is ongeldig",
	"_ChangePassword.Title": "Wachtwoord wijzigen",
	"_ChangePassword.Description": "Om het wachtwoord voor uw account te wijzigen, typt u uw bestaande wachtwoord gevolgd door uw nieuwe wachtwoord en klikt u op 'Bewaar'.",
	"_ChangePassword.Old.Password.Label": "Oude wachtw.",
	"_ChangePassword.New.Password.Label": "Nieuwe wachtw.",
	"_ChangePassword.Confirm.Password.Label": "Nieuwe wachtw.",
	"_ChangePassword.Validation.Incorrect.Password": "Het oude wachtwoord is onjuist",
	"_ChangePassword.Validation.Bad.Match": "Het nieuwe en herhaalde wachtwoord komen niet overeen",
	"_ChangePassword.Status.Changing.Password": "Wachtwoord wijzigen…",
	"_ChangePassword.Status.Error": "Uw wachtwoord kan niet worden gewijzigd. Probeer het opnieuw.",
	"_ChangePassword.Status.Success": "Uw wachtwoord is gewijzigd.",
	"_ChangePassword.Save.Title": "Bewaar",
	"_ChangePassword.Cancel.Title": "Log uit"
});
