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
	"_XC.BigScreen.Empty.Label": "未設定 Bot",
	"_XC.BigScreen.EntityView.Integration.Label": "整合 %@",
	"_XC.BigScreen.EntityView.Committers.Singular.Label": "1 位提供者",
	"_XC.BigScreen.EntityView.Committers.Plural.Label": "%@ 位提供者",
	"_XC.BigScreen.EntityView.Devices.Singular.Label": "1 部裝置",
	"_XC.BigScreen.EntityView.Devices.Plural.Label": "%@ 部裝置",
	"_XC.BigScreen.Status.PerformingIntegration": "立即執行整合「%@」",
	"_XC.BigScreen.Status.IntegrationCompleted": "整合 %@ 建構於 %@",
	"_XC.BigScreen.Status.Running": "「%@」正在執行⋯",
	"_XC.BigScreen.Commits.Empty.Placeholder": "沒有確認",
	"_XC.BigScreen.Devices.Empty.Placeholder": "沒有裝置",
	"_XC.BigScreen.Settings.Label": "「大螢幕」設定",
	"_XC.BigScreen.Settings.SortBy.Label": "排序方式",
	"_XC.BigScreen.Settings.DisplaySize.Label": "顯示大小",
	"_XC.BigScreen.Settings.SortBy.Importance.Label": "重要性",
	"_XC.BigScreen.Settings.SortBy.Name.Label": "名稱",
	"_XC.BigScreen.Settings.SortBy.Time.Label": "時間",
	"_XC.BigScreen.Settings.DisplaySize.Auto.Label": "自動",
	"_XC.BigScreen.Settings.DisplaySize.Full.Label": "全螢幕",
	"_XC.BigScreen.Settings.DisplaySize.Half.Label": "一半大小",
	"_XC.BigScreen.Settings.DisplaySize.Mini.Label": "迷你",
	"_XC.BigScreen.Settings.Button.Cancel": "取消",
	"_XC.BigScreen.Settings.Button.Save": "儲存",
	"_XC.BigScreen.Settings.Button.Reload": "重新載入",
	"_XC.BigScreen.Settings.Failure.Title.Default": "無法使用「Xcode 伺服器」",
	"_XC.BigScreen.Settings.Failure.Title.UnsupportedBrowser": "不支援的瀏覽器",
	"_XC.BigScreen.Settings.Failure.DefaultMessage": "暫時無法使用「Xcode 伺服器」。請按一下「重新載入」來重新連線。",
	"_XC.BigScreen.Settings.Failure.QueuePause": "「大螢幕」已停止回應 Bot 執行狀態更新，必須重新載入。",
	"_XC.BigScreen.Settings.Failure.UnsupportedBrowser": "「大螢幕」是設計只能用於 Safari、Google Chrome 和其他以 WebKit 為基準的網頁瀏覽器。"
});