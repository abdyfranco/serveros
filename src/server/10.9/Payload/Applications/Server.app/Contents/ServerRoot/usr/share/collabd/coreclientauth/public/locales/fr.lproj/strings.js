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
	"_Webauth.Title": "Service d’authentification web",
	"_Webauth.Please.Log.In": "Authentification requise",
	"_Webauth.User.Name": "Nom d’utilisateur",
	"_Webauth.Password": "Mot de passe",
	"_Webauth.Remember.Me": "Rester connecté(e)",
	"_Webauth.Warning.Plaintext": "Votre mot de passe sera envoyé en clair",
	"_Webauth.Cancel": "Annuler",
	"_Webauth.Log.In": "Se connecter",
	"_Webauth.Error.InvalidUserOrPassword": "Nom d’utilisateur ou mot de passe incorrect",
	"_ChangePassword.Title": "Modifier le mot de passe",
	"_ChangePassword.Description": "Pour modifier le mot de passe de votre compte, saisissez votre mot de passe actuel suivi de votre nouveau mot de passe puis cliquez sur Enregistrer.",
	"_ChangePassword.Old.Password.Label": "Ancien mot de passe",
	"_ChangePassword.New.Password.Label": "Nouveau mot de passe",
	"_ChangePassword.Confirm.Password.Label": "Nouveau mot de passe",
	"_ChangePassword.Validation.Incorrect.Password": "Votre ancien mot de passe est incorrect",
	"_ChangePassword.Validation.Bad.Match": "Le nouveau mot de passe et sa confirmation ne concordent pas.",
	"_ChangePassword.Status.Changing.Password": "Modification du mot de passe…",
	"_ChangePassword.Status.Error": "Votre mot de passe n’a pas pu être modifié. Veuillez réessayer.",
	"_ChangePassword.Status.Success": "Votre mot de passe a été modifié avec succès.",
	"_ChangePassword.Save.Title": "Enregistrer",
	"_ChangePassword.Cancel.Title": "Déconnecter"
});
