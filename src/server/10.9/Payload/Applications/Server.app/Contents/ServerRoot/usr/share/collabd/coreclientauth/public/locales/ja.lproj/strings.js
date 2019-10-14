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
	"_Webauth.Title": "Web 認証サービス",
	"_Webauth.Please.Log.In": "ログインしてください",
	"_Webauth.User.Name": "ユーザ名",
	"_Webauth.Password": "パスワード",
	"_Webauth.Remember.Me": "ログインを保持",
	"_Webauth.Warning.Plaintext": "パスワードはクリアテキストで送信されます",
	"_Webauth.Cancel": "キャンセル",
	"_Webauth.Log.In": "ログイン",
	"_Webauth.Error.InvalidUserOrPassword": "ユーザ名またはパスワードが無効です",
	"_ChangePassword.Title": "パスワードを変更",
	"_ChangePassword.Description": "アカウントのパスワードを変更するには、既存のパスワードを入力し、続いて新しいパスワードを入力してから、“保存”をクリックします。",
	"_ChangePassword.Old.Password.Label": "古いパスワード",
	"_ChangePassword.New.Password.Label": "新しいパスワード",
	"_ChangePassword.Confirm.Password.Label": "新しいパスワード",
	"_ChangePassword.Validation.Incorrect.Password": "入力した古いパスワードが正しくありません",
	"_ChangePassword.Validation.Bad.Match": "新しいパスワードと確認したパスワードが一致しません",
	"_ChangePassword.Status.Changing.Password": "パスワードを変更中...",
	"_ChangePassword.Status.Error": "パスワードを変更できませんでした。やり直してください。",
	"_ChangePassword.Status.Success": "パスワードが正常に変更されました。",
	"_ChangePassword.Save.Title": "保存",
	"_ChangePassword.Cancel.Title": "ログアウト"
});
