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
	"_Webauth.Title": "Servizio autenticazione web",
	"_Webauth.Please.Log.In": "Esegui il login",
	"_Webauth.User.Name": "Nome utente",
	"_Webauth.Password": "Password",
	"_Webauth.Remember.Me": "Rimani connesso",
	"_Webauth.Warning.Plaintext": "La password sarà inviata in chiaro",
	"_Webauth.Cancel": "Annulla",
	"_Webauth.Log.In": "Accedi",
	"_Webauth.Error.InvalidUserOrPassword": "Nome utente o password non validi",
	"_ChangePassword.Title": "Cambia password",
	"_ChangePassword.Description": "Per modificare la password del tuo account, inserisci la password esistente seguita dalla nuova password e fai clic su Salva.",
	"_ChangePassword.Old.Password.Label": "Vecchia pass.",
	"_ChangePassword.New.Password.Label": "Nuova pass.",
	"_ChangePassword.Confirm.Password.Label": "Nuova pass.",
	"_ChangePassword.Validation.Incorrect.Password": "La vecchia password non è corretta",
	"_ChangePassword.Validation.Bad.Match": "La password nuova e quella vecchia non coincidono",
	"_ChangePassword.Status.Changing.Password": "Cambio password…",
	"_ChangePassword.Status.Error": "Impossibile modificare la password. Riprova.",
	"_ChangePassword.Status.Success": "La password è stata modificata con successo.",
	"_ChangePassword.Save.Title": "Salva",
	"_ChangePassword.Cancel.Title": "Esci"
});
