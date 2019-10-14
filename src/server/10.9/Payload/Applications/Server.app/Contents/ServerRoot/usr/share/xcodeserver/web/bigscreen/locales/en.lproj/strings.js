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
	"_XC.BigScreen.Empty.Label": "No Bots Configured",
	"_XC.BigScreen.EntityView.Integration.Label": "Integration %@",
	"_XC.BigScreen.EntityView.Committers.Singular.Label": "1 Committer",
	"_XC.BigScreen.EntityView.Committers.Plural.Label": "%@ Committers",
	"_XC.BigScreen.EntityView.Devices.Singular.Label": "1 Device",
	"_XC.BigScreen.EntityView.Devices.Plural.Label": "%@ Devices",
	"_XC.BigScreen.Status.PerformingIntegration": "Performing Integration %@ Now",
	"_XC.BigScreen.Status.IntegrationCompleted": "Integration %@ built at %@",
	"_XC.BigScreen.Status.Running": "%@ is running…",
	"_XC.BigScreen.Commits.Empty.Placeholder": "No Commits",
	"_XC.BigScreen.Devices.Empty.Placeholder": "No Devices",
	"_XC.BigScreen.Settings.Label": "Big Screen Settings",
	"_XC.BigScreen.Settings.SortBy.Label": "Sort by",
	"_XC.BigScreen.Settings.DisplaySize.Label": "Display size",
	"_XC.BigScreen.Settings.SortBy.Importance.Label": "Importance",
	"_XC.BigScreen.Settings.SortBy.Name.Label": "Name",
	"_XC.BigScreen.Settings.SortBy.Time.Label": "Time",
	"_XC.BigScreen.Settings.DisplaySize.Auto.Label": "Auto",
	"_XC.BigScreen.Settings.DisplaySize.Full.Label": "Full",
	"_XC.BigScreen.Settings.DisplaySize.Half.Label": "Half",
	"_XC.BigScreen.Settings.DisplaySize.Mini.Label": "Mini",
	"_XC.BigScreen.Settings.Button.Cancel": "Cancel",
	"_XC.BigScreen.Settings.Button.Save": "Save",
	"_XC.BigScreen.Settings.Button.Reload": "Reload",
	"_XC.BigScreen.Settings.Failure.Title.Default": "Xcode Server is unavailable",
	"_XC.BigScreen.Settings.Failure.Title.UnsupportedBrowser": "Unsupported Browser",
	"_XC.BigScreen.Settings.Failure.DefaultMessage": "Xcode Server is temporarily unavailable. Click Reload to reconnect.",
	"_XC.BigScreen.Settings.Failure.QueuePause": "Big Screen has stopped responding to bot run status updates and must be reloaded.",
	"_XC.BigScreen.Settings.Failure.UnsupportedBrowser": "Big Screen is designed to work only on Safari, Google Chrome, and other WebKit-based web browsers."
});