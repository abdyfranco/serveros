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
	"_MenuItem.Gear": "アクションメニュー...",
	"_MenuItem.LogIn": "ログイン...",
	"_MenuItem.LogOut": "ログアウト...",
	"_MenuItem.Plus": "メニューを追加...",
	"_ActionMenu.About.Title": "情報",
	"_Server.About.Dialog.Description.NoXcode": "Server %@、OS X %@",
	"_Server.About.Dialog.Description.Xcode": "Server %@、OS X %@、Xcode %@",
	"_Server.About.Dialog.Title": "Server について",
	"_NavPopover.Application.Xcode.Title": "Xcode",
	"_NavPopover.Application.Wiki.Title": "Wiki",
	"_NavPopover.Application.ChangePassword.Title": "パスワードを変更",
	"_NavPopover.Application.WebCalendar.Title": "Web カレンダー",
	"_PoliteLogin.Format": "%@1してその他のサービスにアクセス",
	"_PoliteLogin.LogIn": "ログイン",
	"_QuickSearch.Placeholder": "検索",
	"_QuickSearch.Header": "クイック検索",
	"_QuickSearch.Loading.Placeholder": "読み込み中...",
	"_QuickSearch.See.All.Results.Title": "すべてを表示...",
	"_QuickSearch.Headers.RecentSearches": "最近の検索結果",
	"_QuickSearch.Headers.SavedSearches": "保存済みの検索条件",
	"_QuickSearch.RecentSearch.Delete": "削除",
	"_QuickSearch.SavedSearch.Delete": "削除",
	"_QuickSearch.SavedSearch.Untitled": "名称未設定の検索",
	"_Sources.Me.Title": "自分のプロファイル",
	"_Sources.Me.Description": "プロファイルを管理します。",
	"_Sources.MyActivity.Title": "自分のアクティビティ",
	"_Sources.MyActivity.Description": "自分のアクティビティをリアルタイムで表示します。",
	"_Sources.MyDocuments.Title": "マイドキュメント",
	"_Sources.MyDocuments.Description": "自分の個人書類を表示および編集します。",
	"_Sources.MyFavorites.Title": "自分のよく使う項目",
	"_Sources.MyFavorites.Description": "関心のあるページや人を表示します。",
	"_Sources.Activity.Title": "すべてのアクティビティ",
	"_Sources.Activity.Description": "気になる人や Wiki のリアルタイムアクティビティを追跡します。",
	"_Sources.Projects.Title": "すべての Wiki",
	"_Sources.Projects.Description": "チームメンバーとコミュニケーション／共同作業します。",
	"_Sources.People.Title": "すべての人",
	"_Sources.People.Description": "ほかの人のアクティビティとブログを表示します。",
	"_Sources.Home.Title": "ホーム",
	"_Sources.Home.Description": "サーバホームページを表示します。",
	"_Login.LoggedInUser": "ログイン中（%@）",
	"_Login.Unexpected.Error": "予期しないエラーが起きたため、ログインできませんでした。ログインし直してください。",
	"_Logout.Confirm.Dialog.Title": "ログアウト",
	"_Logout.Confirm.Dialog.Description": "ログアウトしてもよろしいですか？",
	"_Logout.Confirm.Dialog.OK": "ログアウト",
	"_Deleted.Placeholder.Title": "このコンテンツは削除されました。",
	"_Deleted.Placeholder.NoPermissions.Subtitle": "復元できるのは、管理者、および削除のアクセス権を持ったユーザのみです。",
	"_Deleted.Placeholder.Restore.Subtitle": "復元",
	"_Deleted.Progress.Restoring": "復元中...",
	"_Deleted.Error.CouldNotRestore": "コンテンツを復元できませんでした。やり直してください。",
	"_Load.Error.CouldNotLoadIngoFromServer": "サーバからバージョン情報を読み込めませんでした。やり直してください。",
	
	// WAI ARIA - Accessiblity
	"_Accessibility.Navigation.Main": "メインナビゲーション",
	"_Accessibility.Navigation.Secondary": "セカンダリーナビゲーション",
	"_Accessibility.Navigation.PageContent": "ページの内容",
	"_Accessibility.Navigation.Label.SearchFor": "検索する項目"
});
