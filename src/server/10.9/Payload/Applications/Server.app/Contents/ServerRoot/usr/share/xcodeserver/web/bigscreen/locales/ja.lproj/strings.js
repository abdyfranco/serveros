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
	"_XC.BigScreen.Empty.Label": "ボット未構成",
	"_XC.BigScreen.EntityView.Integration.Label": "インテグレーション %@",
	"_XC.BigScreen.EntityView.Committers.Singular.Label": "コミッタ：1 人",
	"_XC.BigScreen.EntityView.Committers.Plural.Label": "コミッタ：%@ 人",
	"_XC.BigScreen.EntityView.Devices.Singular.Label": "デバイス：1 個",
	"_XC.BigScreen.EntityView.Devices.Plural.Label": "デバイス：%@ 個",
	"_XC.BigScreen.Status.PerformingIntegration": "インテグレーション %@ を実行中",
	"_XC.BigScreen.Status.IntegrationCompleted": "インテグレーション %@ は %@ にビルドされました",
	"_XC.BigScreen.Status.Running": "%@ 実行中...",
	"_XC.BigScreen.Commits.Empty.Placeholder": "コミットなし",
	"_XC.BigScreen.Devices.Empty.Placeholder": "デバイスがありません",
	"_XC.BigScreen.Settings.Label": "ビッグスクリーンの設定",
	"_XC.BigScreen.Settings.SortBy.Label": "表示順序",
	"_XC.BigScreen.Settings.DisplaySize.Label": "表示サイズ",
	"_XC.BigScreen.Settings.SortBy.Importance.Label": "重要度",
	"_XC.BigScreen.Settings.SortBy.Name.Label": "名前",
	"_XC.BigScreen.Settings.SortBy.Time.Label": "時間",
	"_XC.BigScreen.Settings.DisplaySize.Auto.Label": "自動",
	"_XC.BigScreen.Settings.DisplaySize.Full.Label": "最大",
	"_XC.BigScreen.Settings.DisplaySize.Half.Label": "半分",
	"_XC.BigScreen.Settings.DisplaySize.Mini.Label": "最小",
	"_XC.BigScreen.Settings.Button.Cancel": "キャンセル",
	"_XC.BigScreen.Settings.Button.Save": "保存",
	"_XC.BigScreen.Settings.Button.Reload": "再度読み込む",
	"_XC.BigScreen.Settings.Failure.Title.Default": "Xcode Server は使用できません",
	"_XC.BigScreen.Settings.Failure.Title.UnsupportedBrowser": "未サポートのブラウザ",
	"_XC.BigScreen.Settings.Failure.DefaultMessage": "Xcode Server は一時的に使用できません。“再度読み込む”をクリックして接続し直してください。",
	"_XC.BigScreen.Settings.Failure.QueuePause": "ボット実行ステータスのアップデートに反応してビッグスクリーンが停止しました。読み込み直す必要があります。",
	"_XC.BigScreen.Settings.Failure.UnsupportedBrowser": "ビッグスクリーンが動作するのは、Safari、Google Chrome、その他の WebKit ベースの Web ブラウザのみです。"
});