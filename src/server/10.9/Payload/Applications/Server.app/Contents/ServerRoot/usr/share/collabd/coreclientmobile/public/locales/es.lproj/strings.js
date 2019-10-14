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
	"_NavigationSidebar.My.Activity": "Mi actividad",
	"_NavigationSidebar.My.Documents": "Mis documentos",
	"_NavigationSidebar.My.Favorites": "Mis favoritos",
	"_NavigationSidebar.Home": "Inicio",
	"_NavigationSidebar.All.Activity": "Actividad",
	"_NavigationSidebar.All.Wikis": "Todas las wikis",
	"_NavigationSidebar.All.People": "Todas las personas",
	"_NavigationSidebar.RecentlyViewed.Title": "Documentos recientes",
	"_Login.LogIn": "Iniciar sesión",
	"_Login.LogOut": "Cerrar sesión",
	"_Login.Unauthenticated": "Usuario no autenticado",
	"_Login.DialogTitle": "Iniciar sesión",
	"_Login.UserName": "Nombre de usuario",
	"_Login.Password": "Contraseña",
	"_Login.RememberMe": "Recordar",
	"_WikiSetupAssistant.Next": "Siguiente",
	"_WikiSetupAssistant.Create": "Crear",
	"_WikiSetupAssistant.GeneralPane.ShortTitle": "General",
	"_WikiSetupAssistant.GeneralPane.LongTitle": "Crear una wiki nueva",
	"_WikiSetupAssistant.GeneralPane.Name.Label": "Nombre",
	"_WikiSetupAssistant.GeneralPane.Name.Placeholder": "Wiki de Apple",
	"_WikiSetupAssistant.GeneralPane.Description.Label": "Descripción",
	"_WikiSetupAssistant.GeneralPane.Description.Placeholder": "Comentarios sobre esta wiki",
	"_WikiSetupAssistant.GeneralUserPane.Name.Label": "Usuario",
	"_WikiSetupAssistant.GeneralUserPane.Email.Label": "Correo",
	"_WikiSetupAssistant.GeneralUserPane.Email.Placeholder": "usuario@ejemplo.com",
	"_WikiSetupAssistant.ACLPane.ShortTitle": "Permisos",
	"_WikiSetupAssistant.ACLPane.LongTitle": "Establecer permisos",
	"_WikiSetupAssistant.AppearancePane.ShortTitle": "Apariencia",
	"_WikiSetupAssistant.AppearancePane.LongTitle": "Definir apariencia",
	"_WikiSetupAssistant.AppearancePane.ColorScheme.Label": "Esquema de colores",	
	"_WikiSetupAssistant.DonePane.LongTitle": "Configuración completa",
	"_WikiSetupAssistant.DonePane.GoToWiki%@": "Ir a la Wiki \“%@\”",
	"_WikiSetupAssistant.DonePane.InformationLine1%@" : "La wiki “%@” está creada y ya puede utilizarse.",
	"_WikiSetupAssistant.DonePane.InformationLine2" : "Hay más opciones de configuración disponibles en la wiki.",
	"_Document.Sidebar.Info": "Información",
	"_Document.Sidebar.ViewAll": "Ver todo",
	"_Document.Sidebar.Comments": "Comentarios",
	"_Document.Sidebar.Comments.None": "Ningún comentario",
	"_Document.Sidebar.Comments.New": "Comentario",
	"_Document.Sidebar.Comments.You": "Usted",
	"_Document.Sidebar.Comments.Now": "Ahora",
	"_Document.Sidebar.Related": "Relacionado",
	"_Document.Sidebar.Related.None": "No hay documentos relacionados",
	"_Document.Sidebar.Related.Add": "Añadir documento relacionado…",
	"_Document.Sidebar.Related.SuggestedDocuments": "Documentos sugeridos",
	"_Document.Sidebar.Tags": "Etiquetas",
	"_Document.Sidebar.Tags.None": "No hay etiquetas",
	"_Document.Sidebar.Tags.Add": "Añadir etiqueta…",
	"_Document.Sidebar.Tags.SuggestedTags": "Etiquetas sugeridas",
	"_Document.Sidebar.History": "Historial",
	"_Document.Sidebar.History.None": "No hay historial",
	"_Document.Sidebar.History.VersionAvailableSingular": "Una versión disponible",
	"_Document.Sidebar.History.VersionAvailablePlural": "%@ versiones disponibles",
	"_Document.Sidebar.Notifications": "Notificaciones por correo electrónico",
	"_Document.Sidebar.Notifications.Updated": "Todas las actualiz.",
	"_Document.Sidebar.Notifications.CommentAdded": "Comentario añadido",
	"_Document.Sidebar.Notifications.DocumentUpdated": "Documento actualizado",
	"_Document.Sidebar.Notifications.EmailInputTitle": "Introduzca su correo electrónico",
	
	"_Document.Sidebar.Sharing": "Compartir",
	"_Document.Sidebar.Sharing.None": "No compartido",
	"_Document.Sidebar.Sharing.Add": "Compartir con alguien…",
	"_Document.Sidebar.Sharing.PopoverTitle": "Editar ajustes para compartir",
	
	"_Sharing.Notification.Updating.Subscription": "Actualizando suscripción…",
	"_Sharing.Notification.Updating.Subscription.Succeeded": "Suscripción actualizada correctamente.",
	"_Sharing.Notification.Updating.Subscription.Failed": "No se ha podido actualizar la suscripción. Inténtelo de nuevo.",
	"_Sharing.Notification.Updating.Subscription.Failed.Email": "Debe tener configurada una dirección de correo electrónico preferida para utilizar suscripciones.",
	
	"_FilterBar.Filter.Label": "Mostrar:",
	"_FilterBar.Filter.All.Title": "Todos",
	"_FilterBar.Filter.Unread.Title": "No leído",
	"_FilterBar.Filter.Favorites.Title": "Favoritos",
	"_FilterBar.SortBy.Label": "Ordenar por:",
	"_FilterBar.SortBy.Rank.Title": "Más relevantes",
	"_FilterBar.SortBy.Title.Title": "Título",
	"_FilterBar.SortBy.MostRecent.Title": "Más recientes",
	"_FilterBar.SortBy.LeastRecent.Title": "Menos recientes",
	"_FilterBar.Grid.Title": "Iconos",
	"_FilterBar.List.Title": "Lista",
	"_GearMenu.General.Help": "Ayuda",
	"_GearMenu.General.MySettings": "Mis ajustes de usuario…",
	"_GearMenu.General.MySettings.Title": "Mis ajustes de usuario",
	"_GearMenu.General.Move" : "Trasladar…",
	"_GearMenu.Wiki.Settings": "Ajustes de la wiki…",
	"_GearMenu.Wiki.Settings.Title": "Ajustes de la wiki",
	"_GearMenu.User.Hide": "Ocultar usuario…",
	"_GearMenu.User.Unhide": "Mostrar usuario…",
	"_GearMenu.Search.SaveSearch" : "Guardar esta búsqueda",
	"_PlusMenu.NewWiki": "Nueva wiki…",
	"_PlusMenu.NewPage.NewPageInWiki%@": "Nueva página en “%@”…",
	"_PlusMenu.NewPage.NewInMyDocs": "Nueva página en “Mis documentos”…",
	"_PlusMenu.NewPage.Dialog.Title" : "Nueva página",
	"_PlusMenu.NewPage.Dialog.Label" : "Título de página",
	"_Settings.Permissions.CommentAccess.Label":"Comentarios",
	"_Settings.Permissions.CommentAccess.all":"Cualquiera",
	"_Settings.Permissions.CommentAccess.authenticated":"Usuarios autenticados",
	"_Settings.Permissions.CommentAccess.disabled":"Nadie",
	"_Settings.Permissions.CommentModeration.Label":"Moderación comentarios",
	"_Settings.Permissions.CommentModeration.all":"Todos los comentarios",
	"_Settings.Permissions.CommentModeration.anonymous":"Solo anónimos",
	"_Settings.Permissions.CommentModeration.disabled":"Ninguno",
	"_Settings.General.PreferedEmail":"Dirección de correo preferida",
	
	
	"_Error.Delete.Document.Permissions":"Este documento solamente puede borrarlo el propietario o un administrador.",
	"_Error.Delete.Wiki.Permissions":"Esta wiki solamente puede borrarla el propietario o un administrador.",
	"_Error.Hide.Person.Permissions":"Solo un administrador puede ocultar a una persona.",
	
	// TODO - clean up below this line
	
	

	// Documents
	"_General.Documents.My": "Mis documentos",
	"_General.Documents.None": "No hay documentos",
	"_General.Documents.Untitled": "Sin título",
	"_General.Documents.Recents": "Documentos recientes",
	// Favorites
	"_General.Favorites": "Favoritos",
	// Search
	"_Search": "Buscar",
	"_Search.Results": "Resultados de la búsqueda",
	"_Search.Recents": "Búsquedas recientes",
	"_Search.Saved": "Búsquedas guardadas",
	// Controls
	"_Control.Back": "Atrás",
	"_Control.Add": "Añadir",
	"_Control.Cancel": "Cancelar",
	"_Control.Delete": "Eliminar",
	"_Control.Done": "Aceptar",
	"_Control.Edit": "Editar",
	"_Control.Save": "Guardar",
	"_Control.Send": "Enviar",
	"_Control.OK": "Aceptar",
	"_Control.Pagination.ShowAll": "Mostrar todo"
});
