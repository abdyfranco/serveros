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
	"_MenuItem.Gear": "動作選單⋯",
	"_MenuItem.LogIn": "登入⋯",
	"_MenuItem.LogOut": "登出⋯",
	"_MenuItem.Plus": "加入選單⋯",
	"_ActionMenu.About.Title": "關於",
	"_Server.About.Dialog.Description.NoXcode": "Server %@，OS X %@",
	"_Server.About.Dialog.Title": "關於 Server",
	"_NavPopover.Application.Xcode.Title": "Xcode",		
	"_NavPopover.Application.Wiki.Title": "Wiki",
	"_NavPopover.Application.ChangePassword.Title": "更改密碼",
	"_NavPopover.Application.WebCalendar.Title": "網頁行事曆",
	"_PoliteLogin.Format": "%@1 以連接更多服務",
	"_PoliteLogin.FormatSimple": " 以連接更多服務",	
	"_PoliteLogin.LogIn": "登入",
	"_QuickSearch.Placeholder": "搜尋",
	"_QuickSearch.Header": "快速搜尋",
	"_QuickSearch.Loading.Placeholder": "正在載入⋯",
	"_QuickSearch.See.All.Results.Title": "顯示全部⋯",
	"_QuickSearch.Headers.RecentSearches": "最近的搜尋項目",
	"_QuickSearch.Headers.SavedSearches": "儲存的搜尋",
	"_QuickSearch.RecentSearch.Delete": "刪除",
	"_QuickSearch.SavedSearch.Delete": "刪除",
	"_QuickSearch.SavedSearch.Untitled": "未命名的搜尋",
	"_Sources.Me.Title": "我的描述檔",
	"_Sources.Me.Description": "管理您的描述檔。",
	"_Sources.MyActivity.Title": "我的活動",
	"_Sources.MyActivity.Description": "即時檢視您的活動。",
	"_Sources.MyDocuments.Title": "我的文件",
	"_Sources.MyDocuments.Description": "檢視和編輯您的個人文件。",
	"_Sources.MyFavorites.Title": "我的喜好項目",
	"_Sources.MyFavorites.Description": "檢視您最關注的網頁和人物。",
	"_Sources.Activity.Title": "所有活動",
	"_Sources.Activity.Description": "追蹤您所關心的人和 wiki 的即時活動。",
	"_Sources.Projects.Title": "所有 Wiki",
	"_Sources.Projects.Description": "與團隊成員通訊並合作。",
	"_Sources.People.Title": "所有人員",
	"_Sources.People.Description": "檢視其他人的活動和部落格。",
	"_Sources.Home.Title": "首頁",
	"_Sources.Home.Description": "檢視伺服器首頁。",
	"_Login.LoggedInUser": "已登入（%@）",
	"_Login.Unexpected.Error": "您的登入失敗，因為發生未預期的錯誤。請再試一次。",
	"_Logout.Confirm.Dialog.Title": "登出",
	"_Logout.Confirm.Dialog.Description": "確定要登出嗎？",
	"_Logout.Confirm.Dialog.OK": "登出",
	"_Deleted.Placeholder.Title": "此內容已被刪除",
	"_Deleted.Placeholder.NoPermissions.Subtitle": "只有管理者和擁有刪除權限的使用者可將其回復",
	"_Deleted.Placeholder.Restore.Subtitle": "回復",
	"_Deleted.Progress.Restoring": "正在回復  ",
	"_Deleted.Error.CouldNotRestore": "無法回復內容。請再試一次。",
	"_Load.Error.CouldNotLoadIngoFromServer": "無法從伺服器載入版本資訊。請再試一次。",
	
	// WAI ARIA - Accessiblity
	"_Accessibility.Navigation.Main": "主要導覽",
	"_Accessibility.Navigation.Secondary": "次要導覽",
	"_Accessibility.Navigation.PageContent": "頁面內容",
	"_Accessibility.Navigation.Label.SearchFor": "搜尋目標"
});
