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
	"_MenuItem.Gear": "Menú Acción…",
	"_MenuItem.LogIn": "Iniciar sesión…",
	"_MenuItem.LogOut": "Cerrar sesión…",
	"_MenuItem.Plus": "Añadir menú…",
	"_ActionMenu.About.Title": "Información",
	"_Server.About.Dialog.Description.NoXcode": "Server %@, OS X %@",
	"_Server.About.Dialog.Title": "Acerca de Servidor",
	"_NavPopover.Application.Xcode.Title": "Xcode",		
	"_NavPopover.Application.Wiki.Title": "Wiki",
	"_NavPopover.Application.ChangePassword.Title": "Cambiar contraseña",
	"_NavPopover.Application.WebCalendar.Title": "Calendario web",
	"_PoliteLogin.Format": "%@1 para acceder a más servicios",
	"_PoliteLogin.FormatSimple": " para acceder a más servicios",	
	"_PoliteLogin.LogIn": "Iniciar sesión",
	"_QuickSearch.Placeholder": "Buscar",
	"_QuickSearch.Header": "Búsqueda rápida",
	"_QuickSearch.Loading.Placeholder": "Cargando…",
	"_QuickSearch.See.All.Results.Title": "Mostrar todo…",
	"_QuickSearch.Headers.RecentSearches": "Búsquedas recientes",
	"_QuickSearch.Headers.SavedSearches": "Búsquedas guardadas",
	"_QuickSearch.RecentSearch.Delete": "Eliminar",
	"_QuickSearch.SavedSearch.Delete": "Eliminar",
	"_QuickSearch.SavedSearch.Untitled": "Búsqueda sin título",
	"_Sources.Me.Title": "Mi perfil",
	"_Sources.Me.Description": "Gestione su perfil.",
	"_Sources.MyActivity.Title": "Mi actividad",
	"_Sources.MyActivity.Description": "Vea su actividad en tiempo real.",
	"_Sources.MyDocuments.Title": "Mis documentos",
	"_Sources.MyDocuments.Description": "Vea y edite sus documentos personales.",
	"_Sources.MyFavorites.Title": "Mis favoritos",
	"_Sources.MyFavorites.Description": "Vea las páginas y las personas que más le interesan.",
	"_Sources.Activity.Title": "Actividad",
	"_Sources.Activity.Description": "Realice un seguimiento en tiempo real de la actividad de las personas y las wikis que le interesen.",
	"_Sources.Projects.Title": "Todas las wikis",
	"_Sources.Projects.Description": "Comuníquese y colabore con los miembros del equipo.",
	"_Sources.People.Title": "Todas las personas",
	"_Sources.People.Description": "Vea los blogs y la actividad de otras personas.",
	"_Sources.Home.Title": "Inicio",
	"_Sources.Home.Description": "Vea la página de inicio del servidor.",
	"_Login.LoggedInUser": "Sesión iniciada (%@)",
	"_Login.Unexpected.Error": "El inicio de sesión ha fallado debido a un error inesperado. Inténtelo de nuevo.",
	"_Logout.Confirm.Dialog.Title": "Cerrar sesión",
	"_Logout.Confirm.Dialog.Description": "¿Seguro que desea cerrar la sesión?",
	"_Logout.Confirm.Dialog.OK": "Cerrar",
	"_Deleted.Placeholder.Title": "Este contenido se ha eliminado",
	"_Deleted.Placeholder.NoPermissions.Subtitle": "Solo los administradores y los usuarios con permiso para eliminar pueden restaurarlo",
	"_Deleted.Placeholder.Restore.Subtitle": "Restaurar",
	"_Deleted.Progress.Restoring": "Restaurando…",
	"_Deleted.Error.CouldNotRestore": "No se ha podido restaurar el contenido. Inténtelo de nuevo.",
	"_Load.Error.CouldNotLoadIngoFromServer": "No se ha podido cargar la información de la versión desde el servidor. Inténtelo de nuevo.",
	
	// WAI ARIA - Accessiblity
	"_Accessibility.Navigation.Main": "Navegación principal",
	"_Accessibility.Navigation.Secondary": "Navegación secundaria",
	"_Accessibility.Navigation.PageContent": "Contenido de la página",
	"_Accessibility.Navigation.Label.SearchFor": "Buscar"
});
