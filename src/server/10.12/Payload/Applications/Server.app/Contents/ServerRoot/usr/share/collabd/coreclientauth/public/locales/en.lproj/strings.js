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
	"_Webauth.Title": "Web Authentication Service",
	"_Webauth.Please.Log.In": "Please Log In",
	"_Webauth.User.Name": "User Name",
	"_Webauth.Password": "Password",
	"_Webauth.Remember.Me": "Keep me logged in",
	"_Webauth.Warning.Plaintext": "Your password will be sent in clear text",
	"_Webauth.Cancel": "Cancel",
	"_Webauth.Log.In": "Log In",
	"_Webauth.Error.InvalidUserOrPassword": "Invalid username or password",
	"_ChangePassword.Title": "Change Password",
	"_ChangePassword.Description": "To change the password for your account, type your existing password followed by your new password and click Save.",
	"_ChangePassword.Old.Password.Label": "Old Password",
	"_ChangePassword.New.Password.Label": "New Password",
	"_ChangePassword.Confirm.Password.Label": "New Password",
	"_ChangePassword.Validation.Incorrect.Password": "Your old password is incorrect",
	"_ChangePassword.Validation.Bad.Match": "Your new and confirmed passwords do not match",
	"_ChangePassword.Status.Changing.Password": "Changing password…",
	"_ChangePassword.Status.Error": "Your password could not be changed. Please try again.",
	"_ChangePassword.Status.Success": "Your password has been successfully changed.",
	"_ChangePassword.Save.Title": "Save",
	"_ChangePassword.Cancel.Title": "Log Out"
});
