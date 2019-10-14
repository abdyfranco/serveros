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
	"_NavigationSidebar.My.Activity": "我的活动",
	"_NavigationSidebar.My.Documents": "我的文稿",
	"_NavigationSidebar.My.Favorites": "我的收藏",
	"_NavigationSidebar.Home": "主页",
	"_NavigationSidebar.All.Activity": "所有活动",
	"_NavigationSidebar.All.Wikis": "所有 Wiki",
	"_NavigationSidebar.All.People": "所有人",
	"_NavigationSidebar.RecentlyViewed.Title": "最近使用的文稿",
	"_Login.LogIn": "登录",
	"_Login.LogOut": "退出",
	"_Login.Unauthenticated": "未鉴定用户",
	"_Login.DialogTitle": "登录",
	"_Login.UserName": "用户名称",
	"_Login.Password": "密码",
	"_Login.RememberMe": "记住我",
	"_WikiSetupAssistant.Next": "下一步",
	"_WikiSetupAssistant.Create": "创建",
	"_WikiSetupAssistant.GeneralPane.ShortTitle": "通用",
	"_WikiSetupAssistant.GeneralPane.LongTitle": "创建新 Wiki",
	"_WikiSetupAssistant.GeneralPane.Name.Label": "Wiki 名称",
	"_WikiSetupAssistant.GeneralPane.Name.Placeholder": "Apple Wiki",
	"_WikiSetupAssistant.GeneralPane.Description.Label": "描述",
	"_WikiSetupAssistant.GeneralPane.Description.Placeholder": "评价此 Wiki",
	"_WikiSetupAssistant.GeneralUserPane.Name.Label": "用户名",
	"_WikiSetupAssistant.GeneralUserPane.Email.Label": "电子邮件",
	"_WikiSetupAssistant.GeneralUserPane.Email.Placeholder": "user@example.com",
	"_WikiSetupAssistant.ACLPane.ShortTitle": "权限",
	"_WikiSetupAssistant.ACLPane.LongTitle": "设定权限",
	"_WikiSetupAssistant.AppearancePane.ShortTitle": "外观",
	"_WikiSetupAssistant.AppearancePane.LongTitle": "设定外观",
	"_WikiSetupAssistant.AppearancePane.ColorScheme.Label": "颜色方案",	
	"_WikiSetupAssistant.DonePane.LongTitle": "设置完成",
	"_WikiSetupAssistant.DonePane.GoToWiki%@": "前往“%@”Wiki",
	"_WikiSetupAssistant.DonePane.InformationLine1%@" : "“%@”Wiki 已创建完毕，可以随时使用了。",
	"_WikiSetupAssistant.DonePane.InformationLine2" : "Wiki 上提供了附加配置选项。",
	"_Document.Sidebar.Info": "简介",
	"_Document.Sidebar.ViewAll": "全部查看",
	"_Document.Sidebar.Comments": "注释",
	"_Document.Sidebar.Comments.None": "无注释",
	"_Document.Sidebar.Comments.New": "注释",
	"_Document.Sidebar.Comments.You": "您",
	"_Document.Sidebar.Comments.Now": "现在",
	"_Document.Sidebar.Related": "相关",
	"_Document.Sidebar.Related.None": "无相关文稿",
	"_Document.Sidebar.Related.Add": "添加相关文稿…",
	"_Document.Sidebar.Related.SuggestedDocuments": "建议的文稿",
	"_Document.Sidebar.Tags": "标记",
	"_Document.Sidebar.Tags.None": "无标记",
	"_Document.Sidebar.Tags.Add": "添加标记…",
	"_Document.Sidebar.Tags.SuggestedTags": "建议的标记",
	"_Document.Sidebar.History": "历史记录",
	"_Document.Sidebar.History.None": "无历史记录",
	"_Document.Sidebar.History.VersionAvailableSingular": "1 个版本可用",
	"_Document.Sidebar.History.VersionAvailablePlural": "%@ 个版本可用",
	"_Document.Sidebar.Notifications": "电子邮件通知",
	"_Document.Sidebar.Notifications.Updated": "所有更新",
	"_Document.Sidebar.Notifications.CommentAdded": "已添加注释",
	"_Document.Sidebar.Notifications.DocumentUpdated": "文稿已更新",
	"_Document.Sidebar.Notifications.EmailInputTitle": "输入您的电子邮件",
	
	"_Document.Sidebar.Sharing": "共享",
	"_Document.Sidebar.Sharing.None": "未共享",
	"_Document.Sidebar.Sharing.Add": "与某个人共享…",
	"_Document.Sidebar.Sharing.PopoverTitle": "编辑共享设置",
	
	"_Sharing.Notification.Updating.Subscription": "正在更新订阅…",
	"_Sharing.Notification.Updating.Subscription.Succeeded": "已成功更新订阅。",
	"_Sharing.Notification.Updating.Subscription.Failed": "未能更新订阅。请再试一次。",
	"_Sharing.Notification.Updating.Subscription.Failed.Email": "您必须设定有一个首选电子邮件地址才能使用订阅功能。",
	
	"_FilterBar.Filter.Label": "显示：",
	"_FilterBar.Filter.All.Title": "全部",
	"_FilterBar.Filter.Unread.Title": "未读",
	"_FilterBar.Filter.Favorites.Title": "个人收藏",
	"_FilterBar.SortBy.Label": "排序方式：",
	"_FilterBar.SortBy.Rank.Title": "最相关的",
	"_FilterBar.SortBy.Title.Title": "标题",
	"_FilterBar.SortBy.MostRecent.Title": "最近的",
	"_FilterBar.SortBy.LeastRecent.Title": "不是最近的",
	"_FilterBar.Grid.Title": "图标",
	"_FilterBar.List.Title": "列表",
	"_GearMenu.General.Help": "帮助",
	"_GearMenu.General.MySettings": "我的用户设置…",
	"_GearMenu.General.MySettings.Title": "我的用户设置",
	"_GearMenu.General.Move" : "移动…",
	"_GearMenu.Wiki.Settings": "Wiki 设置…",
	"_GearMenu.Wiki.Settings.Title": "Wiki 设置",
	"_GearMenu.User.Hide": "隐藏用户…",
	"_GearMenu.User.Unhide": "取消隐藏用户…",
	"_GearMenu.Search.SaveSearch" : "存储此搜索结果",
	"_PlusMenu.NewWiki": "新建 Wiki…",
	"_PlusMenu.NewPage.NewPageInWiki%@": "在“%@”中新建页面…",
	"_PlusMenu.NewPage.NewInMyDocs": "在“我的文稿”中新建页面…",
	"_PlusMenu.NewPage.Dialog.Title" : "新建页面",
	"_PlusMenu.NewPage.Dialog.Label" : "页面标题",
	"_Settings.Permissions.CommentAccess.Label":"注释",
	"_Settings.Permissions.CommentAccess.all":"任何人",
	"_Settings.Permissions.CommentAccess.authenticated":"已鉴定的用户",
	"_Settings.Permissions.CommentAccess.disabled":"没有人",
	"_Settings.Permissions.CommentModeration.Label":"注释审核",
	"_Settings.Permissions.CommentModeration.all":"所有注释",
	"_Settings.Permissions.CommentModeration.anonymous":"仅匿名注释",
	"_Settings.Permissions.CommentModeration.disabled":"无",
	"_Settings.General.PreferedEmail":"首选电子邮件",
	
	
	"_Error.Delete.Document.Permissions":"只有所有者或管理员可以删除此文稿。",
	"_Error.Delete.Wiki.Permissions":"只有所有者或管理员可以删除此 Wiki。",
	"_Error.Hide.Person.Permissions":"只有管理员可以隐藏联系人。",
	
	// TODO - clean up below this line
	
	

	// Documents
	"_General.Documents.My": "我的文稿",
	"_General.Documents.None": "无文稿",
	"_General.Documents.Untitled": "未命名",
	"_General.Documents.Recents": "最近使用的文稿",
	// Favorites
	"_General.Favorites": "个人收藏",
	// Search
	"_Search": "搜索",
	"_Search.Results": "搜索结果",
	"_Search.Recents": "最近的搜索",
	"_Search.Saved": "已存储的搜索结果",
	// Controls
	"_Control.Back": "返回",
	"_Control.Add": "添加",
	"_Control.Cancel": "取消",
	"_Control.Delete": "删除",
	"_Control.Done": "完成",
	"_Control.Edit": "编辑",
	"_Control.Save": "存储",
	"_Control.Send": "发送",
	"_Control.OK": "好",
	"_Control.Pagination.ShowAll": "全部显示"
});
