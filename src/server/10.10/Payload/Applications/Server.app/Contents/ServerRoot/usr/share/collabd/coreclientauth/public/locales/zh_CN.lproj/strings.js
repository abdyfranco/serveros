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
	"_Webauth.Title": "Web 鉴定服务",
	"_Webauth.Please.Log.In": "请登录",
	"_Webauth.User.Name": "用户名",
	"_Webauth.Password": "密码",
	"_Webauth.Remember.Me": "保持我的登录状态",
	"_Webauth.Warning.Plaintext": "您的密码将以明文发送",
	"_Webauth.Cancel": "取消",
	"_Webauth.Log.In": "登录",
	"_Webauth.Error.InvalidUserOrPassword": "用户名或密码无效",
	"_ChangePassword.Title": "更改密码",
	"_ChangePassword.Description": "若要更改帐户的密码，请先键入现有的密码，然后输入新密码并点按“存储”。",
	"_ChangePassword.Old.Password.Label": "旧密码",
	"_ChangePassword.New.Password.Label": "新密码",
	"_ChangePassword.Confirm.Password.Label": "新密码",
	"_ChangePassword.Validation.Incorrect.Password": "您的旧密码不正确",
	"_ChangePassword.Validation.Bad.Match": "您的新密码和已确认的密码不匹配",
	"_ChangePassword.Status.Changing.Password": "正在更改密码…",
	"_ChangePassword.Status.Error": "未能更改您的密码。请再试一次。",
	"_ChangePassword.Status.Success": "您的密码已成功更改。",
	"_ChangePassword.Save.Title": "存储",
	"_ChangePassword.Cancel.Title": "退出"
});
