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
	"_Webauth.Title": "웹 인증 서비스",
	"_Webauth.Please.Log.In": "로그인하십시오",
	"_Webauth.User.Name": "사용자 이름",
	"_Webauth.Password": "암호",
	"_Webauth.Remember.Me": "로그인 유지",
	"_Webauth.Warning.Plaintext": "암호가 평문으로 전송됩니다",
	"_Webauth.Cancel": "취소",
	"_Webauth.Log.In": "로그인",
	"_Webauth.Error.InvalidUserOrPassword": "유효하지 않은 사용자 이름 또는 암호",
	"_ChangePassword.Title": "암호 변경",
	"_ChangePassword.Description": "계정에 대한 암호를 변경하려면 새로운 암호 다음에 기존 암호를 입력하고 저장을 클릭하십시오.",
	"_ChangePassword.Old.Password.Label": "이전 암호",
	"_ChangePassword.New.Password.Label": "새로운 암호",
	"_ChangePassword.Confirm.Password.Label": "새로운 암호",
	"_ChangePassword.Validation.Incorrect.Password": "이전 암호가 정확하지 않습니다.",
	"_ChangePassword.Validation.Bad.Match": "새로운 암호와 확인된 암호가 일치하지 않습니다.",
	"_ChangePassword.Status.Changing.Password": "암호 변경 중…",
	"_ChangePassword.Status.Error": "암호를 변경할 수 없습니다. 다시 시도하십시오.",
	"_ChangePassword.Status.Success": "암호가 성공적으로 변경되었습니다.",
	"_ChangePassword.Save.Title": "저장",
	"_ChangePassword.Cancel.Title": "로그아웃"
});
