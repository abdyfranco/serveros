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
	"_NavigationSidebar.My.Activity": "我的活動",
	"_NavigationSidebar.My.Documents": "我的文件",
	"_NavigationSidebar.My.Favorites": "我的喜好項目",
	"_NavigationSidebar.Home": "首頁",
	"_NavigationSidebar.All.Activity": "所有活動",
	"_NavigationSidebar.All.Wikis": "所有 Wiki",
	"_NavigationSidebar.All.People": "所有人員",
	"_NavigationSidebar.RecentlyViewed.Title": "最近使用過的文件",
	"_Login.LogIn": "登入",
	"_Login.LogOut": "登出",
	"_Login.Unauthenticated": "未認證的使用者",
	"_Login.DialogTitle": "登入",
	"_Login.UserName": "使用者名稱",
	"_Login.Password": "密碼",
	"_Login.RememberMe": "記住我",
	"_WikiSetupAssistant.Next": "下一個",
	"_WikiSetupAssistant.Create": "製作",
	"_WikiSetupAssistant.GeneralPane.ShortTitle": "一般",
	"_WikiSetupAssistant.GeneralPane.LongTitle": "新增 Wiki",
	"_WikiSetupAssistant.GeneralPane.Name.Label": "Wiki 名稱",
	"_WikiSetupAssistant.GeneralPane.Name.Placeholder": "Apple Wiki",
	"_WikiSetupAssistant.GeneralPane.Description.Label": "描述",
	"_WikiSetupAssistant.GeneralPane.Description.Placeholder": "註記關於此 wiki 的事項",
	"_WikiSetupAssistant.GeneralUserPane.Name.Label": "使用者名稱",
	"_WikiSetupAssistant.GeneralUserPane.Email.Label": "電子郵件",
	"_WikiSetupAssistant.GeneralUserPane.Email.Placeholder": "user@example.com",
	"_WikiSetupAssistant.ACLPane.ShortTitle": "權限",
	"_WikiSetupAssistant.ACLPane.LongTitle": "設定權限",
	"_WikiSetupAssistant.AppearancePane.ShortTitle": "外觀",
	"_WikiSetupAssistant.AppearancePane.LongTitle": "設定外觀",
	"_WikiSetupAssistant.AppearancePane.ColorScheme.Label": "顏色方案",	
	"_WikiSetupAssistant.DonePane.LongTitle": "設定完成",
	"_WikiSetupAssistant.DonePane.GoToWiki%@": "前往「%@」Wiki",
	"_WikiSetupAssistant.DonePane.InformationLine1%@" : "已製作「%@」wiki 並可供使用。",
	"_WikiSetupAssistant.DonePane.InformationLine2" : "wiki 上有其他可用的設定選項。",
	"_Document.Sidebar.Info": "簡介",
	"_Document.Sidebar.ViewAll": "檢視全部",
	"_Document.Sidebar.Comments": "註解",
	"_Document.Sidebar.Comments.None": "沒有註解",
	"_Document.Sidebar.Comments.New": "註解",
	"_Document.Sidebar.Comments.You": "您",
	"_Document.Sidebar.Comments.Now": "現在",
	"_Document.Sidebar.Related": "相關",
	"_Document.Sidebar.Related.None": "沒有相關文件",
	"_Document.Sidebar.Related.Add": "加入相關文件⋯",
	"_Document.Sidebar.Related.SuggestedDocuments": "建議文件",
	"_Document.Sidebar.Tags": "標記",
	"_Document.Sidebar.Tags.None": "沒有標記",
	"_Document.Sidebar.Tags.Add": "加入標記⋯",
	"_Document.Sidebar.Tags.SuggestedTags": "建議標記",
	"_Document.Sidebar.History": "歷程記錄",
	"_Document.Sidebar.History.None": "沒有歷程記錄",
	"_Document.Sidebar.History.VersionAvailableSingular": "1 個版本可用",
	"_Document.Sidebar.History.VersionAvailablePlural": "%@ 個版本可用",
	"_Document.Sidebar.Notifications": "以電子郵件傳送通知",
	"_Document.Sidebar.Notifications.Updated": "所有更新項目",
	"_Document.Sidebar.Notifications.CommentAdded": "已加入註解",
	"_Document.Sidebar.Notifications.DocumentUpdated": "已更新文件",
	"_Document.Sidebar.Notifications.EmailInputTitle": "輸入您的電子郵件",
	
	"_Document.Sidebar.Sharing": "共享",
	"_Document.Sidebar.Sharing.None": "未共享",
	"_Document.Sidebar.Sharing.Add": "與其他人共享⋯",
	"_Document.Sidebar.Sharing.PopoverTitle": "編輯共享設定",
	
	"_Sharing.Notification.Updating.Subscription": "正在更新訂閱項目⋯",
	"_Sharing.Notification.Updating.Subscription.Succeeded": "訂閱項目更新成功。",
	"_Sharing.Notification.Updating.Subscription.Failed": "無法更新訂閱項目。請再試一次。",
	"_Sharing.Notification.Updating.Subscription.Failed.Email": "您必須設定偏好的電子郵件位址才能使用訂閱項目。",
	
	"_FilterBar.Filter.Label": "顯示：",
	"_FilterBar.Filter.All.Title": "全部",
	"_FilterBar.Filter.Unread.Title": "未閱讀",
	"_FilterBar.Filter.Favorites.Title": "喜好項目",
	"_FilterBar.SortBy.Label": "排序方式：",
	"_FilterBar.SortBy.Rank.Title": "最相關",
	"_FilterBar.SortBy.Title.Title": "標題",
	"_FilterBar.SortBy.MostRecent.Title": "最新項目",
	"_FilterBar.SortBy.LeastRecent.Title": "最舊項目",
	"_FilterBar.Grid.Title": "圖像",
	"_FilterBar.List.Title": "列表",
	"_GearMenu.General.Help": "輔助說明",
	"_GearMenu.General.MySettings": "我的使用者設定⋯",
	"_GearMenu.General.MySettings.Title": "我的使用者設定",
	"_GearMenu.General.Move" : "搬移⋯",
	"_GearMenu.Wiki.Settings": "Wiki 設定⋯",
	"_GearMenu.Wiki.Settings.Title": "Wiki 設定",
	"_GearMenu.User.Hide": "隱藏使用者⋯",
	"_GearMenu.User.Unhide": "取消隱藏使用者⋯",
	"_GearMenu.Search.SaveSearch" : "儲存此搜尋",
	"_PlusMenu.NewWiki": "新增 Wiki⋯",
	"_PlusMenu.NewPage.NewPageInWiki%@": "在「%@」新增網頁⋯",
	"_PlusMenu.NewPage.NewInMyDocs": "在「我的文件」中新增網頁⋯",
	"_PlusMenu.NewPage.Dialog.Title" : "新增網頁",
	"_PlusMenu.NewPage.Dialog.Label" : "頁面標題",
	"_Settings.Permissions.CommentAccess.Label":"註解",
	"_Settings.Permissions.CommentAccess.all":"所有人",
	"_Settings.Permissions.CommentAccess.authenticated":"已認證的使用者",
	"_Settings.Permissions.CommentAccess.disabled":"沒有人",
	"_Settings.Permissions.CommentModeration.Label":"註解審核",
	"_Settings.Permissions.CommentModeration.all":"所有註解",
	"_Settings.Permissions.CommentModeration.anonymous":"僅匿名註解",
	"_Settings.Permissions.CommentModeration.disabled":"無",
	"_Settings.General.PreferedEmail":"偏好的電子郵件",
	
	
	"_Error.Delete.Document.Permissions":"只有持有人或管理者才能刪除此文件。",
	"_Error.Delete.Wiki.Permissions":"只有持有人或管理者才能刪除此 wiki。",
	"_Error.Hide.Person.Permissions":"只有管理者才能隱藏人員。",
	
	// TODO - clean up below this line
	
	

	// Documents
	"_General.Documents.My": "我的文件",
	"_General.Documents.None": "沒有文件",
	"_General.Documents.Untitled": "未命名",
	"_General.Documents.Recents": "最近使用過的文件",
	// Favorites
	"_General.Favorites": "喜好項目",
	// Search
	"_Search": "搜尋",
	"_Search.Results": "搜尋結果",
	"_Search.Recents": "最近的搜尋項目",
	"_Search.Saved": "儲存的搜尋",
	// Controls
	"_Control.Back": "返回",
	"_Control.Add": "加入",
	"_Control.Cancel": "取消",
	"_Control.Delete": "刪除",
	"_Control.Done": "完成",
	"_Control.Edit": "編輯",
	"_Control.Save": "儲存",
	"_Control.Send": "傳送",
	"_Control.OK": "好",
	"_Control.Pagination.ShowAll": "顯示全部"
});
