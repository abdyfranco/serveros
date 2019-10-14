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
	"_MenuItem.Gear": "동작 메뉴...",
	"_MenuItem.LogIn": "로그인...",
	"_MenuItem.LogOut": "로그아웃...",
	"_MenuItem.Plus": "메뉴 추가...",
	"_ActionMenu.About.Title": "정보",
	"_Server.About.Dialog.Description.NoXcode": "Server %@, OS X %@",
	"_Server.About.Dialog.Description.Xcode": "Server %@, OS X %@, Xcode %@",
	"_Server.About.Dialog.Title": "Server에 관하여",
	"_NavPopover.Application.Xcode.Title": "Xcode",
	"_NavPopover.Application.Wiki.Title": "Wiki",
	"_NavPopover.Application.ChangePassword.Title": "암호 변경",
	"_NavPopover.Application.WebCalendar.Title": "웹 캘린더",
	"_PoliteLogin.Format": "추가 서비스에 접근하려면 %@1",
	"_PoliteLogin.LogIn": "로그인",
	"_QuickSearch.Placeholder": "검색",
	"_QuickSearch.Header": "빠른 검색",
	"_QuickSearch.Loading.Placeholder": "로드 중...",
	"_QuickSearch.See.All.Results.Title": "모두 보기…",
	"_QuickSearch.Headers.RecentSearches": "최근 검색",
	"_QuickSearch.Headers.SavedSearches": "저장된 검색",
	"_QuickSearch.RecentSearch.Delete": "삭제",
	"_QuickSearch.SavedSearch.Delete": "삭제",
	"_QuickSearch.SavedSearch.Untitled": "무제 검색",
	"_Sources.Me.Title": "나의 프로파일",
	"_Sources.Me.Description": "프로파일을 관리합니다.",
	"_Sources.MyActivity.Title": "나의 작업",
	"_Sources.MyActivity.Description": "사용자의 작업을 실시간으로 봅니다.",
	"_Sources.MyDocuments.Title": "나의 도큐멘트",
	"_Sources.MyDocuments.Description": "사용자의 개인 도큐멘트를 보고 편집합니다.",
	"_Sources.MyFavorites.Title": "나의 즐겨찾기",
	"_Sources.MyFavorites.Description": "해당 페이지 및 가장 즐겨찾는 사람을 봅니다.",
	"_Sources.Activity.Title": "모든 작업",
	"_Sources.Activity.Description": "관심을 가지고 있는 사람 및 Wiki에 대한 활동을 실시간으로 추적합니다.",
	"_Sources.Projects.Title": "모든 Wiki",
	"_Sources.Projects.Description": "팀 구성원과 소통 및 공동으로 작업합니다.",
	"_Sources.People.Title": "모든 사람",
	"_Sources.People.Description": "다름 사람들의 활동 및 블로그를 봅니다.",
	"_Sources.Home.Title": "홈",
	"_Sources.Home.Description": "서버 홈 페이지를 봅니다.",
	"_Login.LoggedInUser": "로그인됨(%@)",
	"_Login.Unexpected.Error": "예기치 않은 오류 때문에 로그인에 실패했습니다. 다시 시도하십시오.",
	"_Logout.Confirm.Dialog.Title": "로그아웃",
	"_Logout.Confirm.Dialog.Description": "로그아웃하겠습니까?",
	"_Logout.Confirm.Dialog.OK": "로그아웃",
	"_Deleted.Placeholder.Title": "이 콘텐츠는 삭제됨",
	"_Deleted.Placeholder.NoPermissions.Subtitle": "삭제할 권한이 있는 관리자와 사용자만 복원할 수 있음",
	"_Deleted.Placeholder.Restore.Subtitle": "복원",
	"_Deleted.Progress.Restoring": "복원 중…",
	"_Deleted.Error.CouldNotRestore": "콘텐츠를 복원할 수 없습니다. 다시 시도하십시오.",
	"_Load.Error.CouldNotLoadIngoFromServer": "서버에서 버전 정보를 로드할 수 없습니다. 다시 시도하십시오.",
	
	// WAI ARIA - Accessiblity
	"_Accessibility.Navigation.Main": "주 탐색",
	"_Accessibility.Navigation.Secondary": "보조 탐색",
	"_Accessibility.Navigation.PageContent": "페이지 내용",
	"_Accessibility.Navigation.Label.SearchFor": "검색"
});
