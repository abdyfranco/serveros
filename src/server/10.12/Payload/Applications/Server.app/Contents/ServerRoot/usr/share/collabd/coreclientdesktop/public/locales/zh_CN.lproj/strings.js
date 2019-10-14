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
	"_MenuItem.Gear": "操作菜单…",
	"_MenuItem.LogIn": "登录…",
	"_MenuItem.LogOut": "退出…",
	"_MenuItem.Plus": "添加菜单…",
	"_ActionMenu.About.Title": "关于",
	"_Server.About.Dialog.Description.NoXcode": "macOS Server %@，macOS %@",
	"_Server.About.Dialog.Title": "关于 macOS Server",
	"_NavPopover.Application.Xcode.Title": "Xcode",		
	"_NavPopover.Application.Wiki.Title": "Wiki",
	"_NavPopover.Application.ChangePassword.Title": "更改密码",
	"_NavPopover.Application.WebCalendar.Title": "网络日历",
	"_PoliteLogin.Format": "%@1 以访问更多服务",
	"_PoliteLogin.FormatSimple": "以访问更多服务",	
	"_PoliteLogin.LogIn": "登录",
	"_QuickSearch.Placeholder": "搜索",
	"_QuickSearch.Header": "快速搜索",
	"_QuickSearch.Loading.Placeholder": "正在载入…",
	"_QuickSearch.See.All.Results.Title": "全部显示…",
	"_QuickSearch.Headers.RecentSearches": "最近的搜索",
	"_QuickSearch.Headers.SavedSearches": "已存储的搜索",
	"_QuickSearch.RecentSearch.Delete": "删除",
	"_QuickSearch.SavedSearch.Delete": "删除",
	"_QuickSearch.SavedSearch.Untitled": "未命名搜索",
	"_Sources.Me.Title": "我的描述文件",
	"_Sources.Me.Description": "管理您的个人资料。",
	"_Sources.MyActivity.Title": "我的活动",
	"_Sources.MyActivity.Description": "查看实时活动。",
	"_Sources.MyDocuments.Title": "我的文稿",
	"_Sources.MyDocuments.Description": "查看并编辑您的个人文稿。",
	"_Sources.MyFavorites.Title": "我的收藏",
	"_Sources.MyFavorites.Description": "查看您最关心的页面和联系人。",
	"_Sources.Activity.Title": "所有活动",
	"_Sources.Activity.Description": "跟踪您关注的联系人的活动或 Wiki。",
	"_Sources.Projects.Title": "所有 Wiki",
	"_Sources.Projects.Description": "与团队成员进行沟通与协作。",
	"_Sources.People.Title": "所有联系人",
	"_Sources.People.Description": "查看其他联系人的活动和博客。",
	"_Sources.Home.Title": "主页",
	"_Sources.Home.Description": "查看服务器主页。",
	"_Login.LoggedInUser": "已登录（%@）",
	"_Login.Unexpected.Error": "由于意外错误，登录失败。请再试一次。",
	"_Logout.Confirm.Dialog.Title": "退出",
	"_Logout.Confirm.Dialog.Description": "您确定要退出吗？",
	"_Logout.Confirm.Dialog.OK": "退出",
	"_Deleted.Placeholder.Title": "此内容已被删除",
	"_Deleted.Placeholder.NoPermissions.Subtitle": "仅管理员和具有删除权限的用户可以恢复它",
	"_Deleted.Placeholder.Restore.Subtitle": "恢复",
	"_Deleted.Progress.Restoring": "正在恢复…",
	"_Deleted.Error.CouldNotRestore": "未能恢复内容。请再试一次。",
	"_Load.Error.CouldNotLoadIngoFromServer": "未能从服务器载入版本信息。请再试一次。",
	
	// WAI ARIA - Accessiblity
	"_Accessibility.Navigation.Main": "主页面导航",
	"_Accessibility.Navigation.Secondary": "二级面板导航",
	"_Accessibility.Navigation.PageContent": "页面内容",
	"_Accessibility.Navigation.Label.SearchFor": "搜索"
});
