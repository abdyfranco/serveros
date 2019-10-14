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
	"_XC.BigScreen.Empty.Label": "未配置 Bot",
	"_XC.BigScreen.EntityView.Integration.Label": "整合 %@",
	"_XC.BigScreen.EntityView.Committers.Singular.Label": "1 个提交者",
	"_XC.BigScreen.EntityView.Committers.Plural.Label": "%@ 个提交者",
	"_XC.BigScreen.EntityView.Devices.Singular.Label": "1 个设备",
	"_XC.BigScreen.EntityView.Devices.Plural.Label": "%@ 个设备",
	"_XC.BigScreen.Status.PerformingIntegration": "立刻执行整合“%@”",
	"_XC.BigScreen.Status.IntegrationCompleted": "整合“%@”构建于 %@",
	"_XC.BigScreen.Status.Running": "“%@”正在运行…",
	"_XC.BigScreen.Commits.Empty.Placeholder": "无提交",
	"_XC.BigScreen.Devices.Empty.Placeholder": "无设备",
	"_XC.BigScreen.Settings.Label": "大屏幕设置",
	"_XC.BigScreen.Settings.SortBy.Label": "排序方式",
	"_XC.BigScreen.Settings.DisplaySize.Label": "显示大小",
	"_XC.BigScreen.Settings.SortBy.Importance.Label": "重要性",
	"_XC.BigScreen.Settings.SortBy.Name.Label": "名称",
	"_XC.BigScreen.Settings.SortBy.Time.Label": "时间",
	"_XC.BigScreen.Settings.DisplaySize.Auto.Label": "自动",
	"_XC.BigScreen.Settings.DisplaySize.Full.Label": "完整",
	"_XC.BigScreen.Settings.DisplaySize.Half.Label": "一半大小",
	"_XC.BigScreen.Settings.DisplaySize.Mini.Label": "极小",
	"_XC.BigScreen.Settings.Button.Cancel": "取消",
	"_XC.BigScreen.Settings.Button.Save": "存储",
	"_XC.BigScreen.Settings.Button.Reload": "重新载入",
	"_XC.BigScreen.Settings.Failure.Title.Default": "Xcode 服务器不可用",
	"_XC.BigScreen.Settings.Failure.Title.UnsupportedBrowser": "不支持的浏览器",
	"_XC.BigScreen.Settings.Failure.DefaultMessage": "Xcode 服务器暂时不可用。请点按“重新载入”以重新连接。",
	"_XC.BigScreen.Settings.Failure.QueuePause": "“大屏幕”已停止响应运行状态更新的 bot，且必须重新载入。",
	"_XC.BigScreen.Settings.Failure.UnsupportedBrowser": "“大屏幕”被设计为仅适用于 Safari、Google Chrome 和其他基于 WebKit 的 Web 浏览器。"
});