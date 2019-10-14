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
	"_Webauth.Title": "Servicio de autenticación web",
	"_Webauth.Please.Log.In": "Inicia sesión",
	"_Webauth.User.Name": "Usuario",
	"_Webauth.Password": "Contraseña",
	"_Webauth.Remember.Me": "Recordar",
	"_Webauth.Warning.Plaintext": "La contraseña se enviará sin encriptar",
	"_Webauth.Cancel": "Cancelar",
	"_Webauth.Log.In": "Iniciar",
	"_Webauth.Error.InvalidUserOrPassword": "Nombre de usuario o contraseña no válidos",
	"_ChangePassword.Title": "Cambiar contraseña",
	"_ChangePassword.Description": "Si quieres cambiar la contraseña de tu cuenta, escribe la contraseña actual seguida de la nueva contraseña y haz clic en Guardar.",
	"_ChangePassword.Old.Password.Label": "Antigua",
	"_ChangePassword.New.Password.Label": "Nueva",
	"_ChangePassword.Confirm.Password.Label": "Nueva",
	"_ChangePassword.Validation.Incorrect.Password": "La contraseña antigua es incorrecta",
	"_ChangePassword.Validation.Bad.Match": "La nueva contraseña y la confirmación no coinciden",
	"_ChangePassword.Status.Changing.Password": "Cambiando contraseña…",
	"_ChangePassword.Status.Error": "No se ha podido cambiar la contraseña. Inténtalo de nuevo.",
	"_ChangePassword.Status.Success": "La contraseña se ha cambiado correctamente.",
	"_ChangePassword.Save.Title": "Guardar",
	"_ChangePassword.Cancel.Title": "Cerrar sesión"
});
