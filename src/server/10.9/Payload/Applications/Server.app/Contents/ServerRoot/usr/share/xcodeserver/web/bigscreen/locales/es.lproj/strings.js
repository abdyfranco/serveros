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
	"_XC.BigScreen.Empty.Label": "No hay ningún bot configurado",
	"_XC.BigScreen.EntityView.Integration.Label": "Integración %@",
	"_XC.BigScreen.EntityView.Committers.Singular.Label": "1 confirmador",
	"_XC.BigScreen.EntityView.Committers.Plural.Label": "%@ confirmadores",
	"_XC.BigScreen.EntityView.Devices.Singular.Label": "1 dispositivo",
	"_XC.BigScreen.EntityView.Devices.Plural.Label": "%@ dispositivos",
	"_XC.BigScreen.Status.PerformingIntegration": "Ejecutando integración %@ ahora",
	"_XC.BigScreen.Status.IntegrationCompleted": "Integración %@ construida en %@",
	"_XC.BigScreen.Status.Running": "%@ se está ejecutando…",
	"_XC.BigScreen.Commits.Empty.Placeholder": "Sin confirmaciones",
	"_XC.BigScreen.Devices.Empty.Placeholder": "Sin dispositivos",
	"_XC.BigScreen.Settings.Label": "Ajustes de Big Screen",
	"_XC.BigScreen.Settings.SortBy.Label": "Ordenar por",
	"_XC.BigScreen.Settings.DisplaySize.Label": "Tamaño de pantalla",
	"_XC.BigScreen.Settings.SortBy.Importance.Label": "Importancia",
	"_XC.BigScreen.Settings.SortBy.Name.Label": "Nombre",
	"_XC.BigScreen.Settings.SortBy.Time.Label": "Hora",
	"_XC.BigScreen.Settings.DisplaySize.Auto.Label": "Automático",
	"_XC.BigScreen.Settings.DisplaySize.Full.Label": "Completo",
	"_XC.BigScreen.Settings.DisplaySize.Half.Label": "50%",
	"_XC.BigScreen.Settings.DisplaySize.Mini.Label": "Mini",
	"_XC.BigScreen.Settings.Button.Cancel": "Cancelar",
	"_XC.BigScreen.Settings.Button.Save": "Guardar",
	"_XC.BigScreen.Settings.Button.Reload": "Volver a cargar",
	"_XC.BigScreen.Settings.Failure.Title.Default": "Xcode Server no está disponible",
	"_XC.BigScreen.Settings.Failure.Title.UnsupportedBrowser": "Navegador incompatible",
	"_XC.BigScreen.Settings.Failure.DefaultMessage": "Xcode Server no está disponible temporalmente. Haga clic en “Volver a cargar” para conectarse de nuevo.",
	"_XC.BigScreen.Settings.Failure.QueuePause": "Big Screen ha dejado de responder a las actualizaciones de estado de las ejecuciones de bot, por lo que debe volver a cargarse.",
	"_XC.BigScreen.Settings.Failure.UnsupportedBrowser": "Big Screen ha sido diseñado para funcionar solamente en Safari, Google Chrome y otros navegadores web basados en WebKit."
});