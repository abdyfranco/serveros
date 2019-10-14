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
	"_Webauth.Title": "網路授權服務",
	"_Webauth.Please.Log.In": "請登入",
	"_Webauth.User.Name": "使用者名稱",
	"_Webauth.Password": "密碼",
	"_Webauth.Remember.Me": "保持登入",
	"_Webauth.Warning.Plaintext": "您的密碼將以純文字送出",
	"_Webauth.Cancel": "取消",
	"_Webauth.Log.In": "登入",
	"_Webauth.Error.InvalidUserOrPassword": "無效的使用者名稱或密碼",
	"_ChangePassword.Title": "更改密碼",
	"_ChangePassword.Description": "若要更改您的帳號密碼，請先輸入舊密碼再輸入新密碼，然後按一下「儲存」。",
	"_ChangePassword.Old.Password.Label": "舊密碼",
	"_ChangePassword.New.Password.Label": "新密碼",
	"_ChangePassword.Confirm.Password.Label": "新密碼",
	"_ChangePassword.Validation.Incorrect.Password": "您的舊密碼不正確",
	"_ChangePassword.Validation.Bad.Match": "您的新密碼和確認的密碼不符",
	"_ChangePassword.Status.Changing.Password": "正在更改密碼⋯",
	"_ChangePassword.Status.Error": "無法更改密碼。請再試一次。",
	"_ChangePassword.Status.Success": "已成功更改您的密碼。",
	"_ChangePassword.Save.Title": "儲存",
	"_ChangePassword.Cancel.Title": "登出"
});
