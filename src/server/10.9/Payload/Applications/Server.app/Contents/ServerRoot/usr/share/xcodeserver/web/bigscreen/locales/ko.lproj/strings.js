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
	"_XC.BigScreen.Empty.Label": "구성된 봇 없음",
	"_XC.BigScreen.EntityView.Integration.Label": "%@ 통합",
	"_XC.BigScreen.EntityView.Committers.Singular.Label": "1명의 커밋한 사람",
	"_XC.BigScreen.EntityView.Committers.Plural.Label": "%@명의 커밋한 사람",
	"_XC.BigScreen.EntityView.Devices.Singular.Label": "1개의 장비",
	"_XC.BigScreen.EntityView.Devices.Plural.Label": "%@대의 장비",
	"_XC.BigScreen.Status.PerformingIntegration": "지금 %@ 통합 수행 중",
	"_XC.BigScreen.Status.IntegrationCompleted": "%@2에서 %@1 통합",
	"_XC.BigScreen.Status.Running": "%@ 실행 중...",
	"_XC.BigScreen.Commits.Empty.Placeholder": "커밋 없음",
	"_XC.BigScreen.Devices.Empty.Placeholder": "장비 없음",
	"_XC.BigScreen.Settings.Label": "큰 화면 설정",
	"_XC.BigScreen.Settings.SortBy.Label": "다음으로 정렬",
	"_XC.BigScreen.Settings.DisplaySize.Label": "표시 크기",
	"_XC.BigScreen.Settings.SortBy.Importance.Label": "중요",
	"_XC.BigScreen.Settings.SortBy.Name.Label": "이름",
	"_XC.BigScreen.Settings.SortBy.Time.Label": "시간",
	"_XC.BigScreen.Settings.DisplaySize.Auto.Label": "자동",
	"_XC.BigScreen.Settings.DisplaySize.Full.Label": "전체",
	"_XC.BigScreen.Settings.DisplaySize.Half.Label": "절반",
	"_XC.BigScreen.Settings.DisplaySize.Mini.Label": "미니",
	"_XC.BigScreen.Settings.Button.Cancel": "취소",
	"_XC.BigScreen.Settings.Button.Save": "저장",
	"_XC.BigScreen.Settings.Button.Reload": "다시 로드",
	"_XC.BigScreen.Settings.Failure.Title.Default": "Xcode 서버를 사용할 수 없음",
	"_XC.BigScreen.Settings.Failure.Title.UnsupportedBrowser": "지원되지 않는 브라우저",
	"_XC.BigScreen.Settings.Failure.DefaultMessage": "Xcode 서버를 일시적으로 사용할 수 없습니다. 재연결하려면 다시 시도를 클릭하십시오.",
	"_XC.BigScreen.Settings.Failure.QueuePause": "큰 화면이 봇 실행 상태 업데이트에 응답하지 않으며 다시 로드되어야 합니다.",
	"_XC.BigScreen.Settings.Failure.UnsupportedBrowser": "큰 화면은 Safari, Google Chrome 및 기타 WebKit 기반 웹 브라우저에서만 동작되도록 제작되었습니다."
});