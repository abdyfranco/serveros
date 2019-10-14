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
	"_NavigationSidebar.My.Activity": "나의 작업",
	"_NavigationSidebar.My.Documents": "나의 도큐멘트",
	"_NavigationSidebar.My.Favorites": "나의 즐겨찾기",
	"_NavigationSidebar.Home": "홈",
	"_NavigationSidebar.All.Activity": "모든 작업",
	"_NavigationSidebar.All.Wikis": "모든 Wiki",
	"_NavigationSidebar.All.People": "모든 사람",
	"_NavigationSidebar.RecentlyViewed.Title": "최근 사용 도큐멘트",
	"_Login.LogIn": "로그인",
	"_Login.LogOut": "로그아웃",
	"_Login.Unauthenticated": "인증되지 않은 사용자",
	"_Login.DialogTitle": "로그인",
	"_Login.UserName": "사용자 이름",
	"_Login.Password": "암호",
	"_Login.RememberMe": "나 기억하기",
	"_WikiSetupAssistant.Next": "다음",
	"_WikiSetupAssistant.Create": "생성",
	"_WikiSetupAssistant.GeneralPane.ShortTitle": "일반",
	"_WikiSetupAssistant.GeneralPane.LongTitle": "새로운 Wiki 생성",
	"_WikiSetupAssistant.GeneralPane.Name.Label": "Wiki 이름",
	"_WikiSetupAssistant.GeneralPane.Name.Placeholder": "Apple Wiki",
	"_WikiSetupAssistant.GeneralPane.Description.Label": "설명",
	"_WikiSetupAssistant.GeneralPane.Description.Placeholder": "이 wiki에 관한 설명",
	"_WikiSetupAssistant.GeneralUserPane.Name.Label": "사용자 이름",
	"_WikiSetupAssistant.GeneralUserPane.Email.Label": "이메일",
	"_WikiSetupAssistant.GeneralUserPane.Email.Placeholder": "user@example.com",
	"_WikiSetupAssistant.ACLPane.ShortTitle": "권한",
	"_WikiSetupAssistant.ACLPane.LongTitle": "권한 설정",
	"_WikiSetupAssistant.AppearancePane.ShortTitle": "모양새",
	"_WikiSetupAssistant.AppearancePane.LongTitle": "모양새 설정",
	"_WikiSetupAssistant.AppearancePane.ColorScheme.Label": "색상 체계",	
	"_WikiSetupAssistant.DonePane.LongTitle": "설정 완료",
	"_WikiSetupAssistant.DonePane.GoToWiki%@": "\'%@\' Wiki로 이동",
	"_WikiSetupAssistant.DonePane.InformationLine1%@" : "\'%@\' Wiki가 생성되었으며 사용할 준비가 되었습니다.",
	"_WikiSetupAssistant.DonePane.InformationLine2" : "Wiki에서 추가 구성 옵션을 사용할 수 있습니다.",
	"_Document.Sidebar.Info": "정보",
	"_Document.Sidebar.ViewAll": "모두 보기",
	"_Document.Sidebar.Comments": "댓글",
	"_Document.Sidebar.Comments.None": "댓글 없음",
	"_Document.Sidebar.Comments.New": "댓글",
	"_Document.Sidebar.Comments.You": "사용자",
	"_Document.Sidebar.Comments.Now": "지금",
	"_Document.Sidebar.Related": "관련됨",
	"_Document.Sidebar.Related.None": "관련 도큐멘트 없음",
	"_Document.Sidebar.Related.Add": "관련 도큐멘트 추가...",
	"_Document.Sidebar.Related.SuggestedDocuments": "권장 도큐멘트",
	"_Document.Sidebar.Tags": "태그",
	"_Document.Sidebar.Tags.None": "태그 없음",
	"_Document.Sidebar.Tags.Add": "태그 추가...",
	"_Document.Sidebar.Tags.SuggestedTags": "권장 태그",
	"_Document.Sidebar.History": "기록",
	"_Document.Sidebar.History.None": "기록 없음",
	"_Document.Sidebar.History.VersionAvailableSingular": "1개의 버전 사용 가능",
	"_Document.Sidebar.History.VersionAvailablePlural": "%@개의 버전 사용 가능",
	"_Document.Sidebar.Notifications": "이메일 알림",
	"_Document.Sidebar.Notifications.Updated": "모든 업데이트",
	"_Document.Sidebar.Notifications.CommentAdded": "댓글이 추가됨",
	"_Document.Sidebar.Notifications.DocumentUpdated": "도큐멘트 업데이트됨",
	"_Document.Sidebar.Notifications.EmailInputTitle": "이메일 입력",
	
	"_Document.Sidebar.Sharing": "공유",
	"_Document.Sidebar.Sharing.None": "공유하지 않음",
	"_Document.Sidebar.Sharing.Add": "다른 사람과 공유...",
	"_Document.Sidebar.Sharing.PopoverTitle": "공유 설정 편집",
	
	"_Sharing.Notification.Updating.Subscription": "구독 정보 업데이트 중…",
	"_Sharing.Notification.Updating.Subscription.Succeeded": "구독 정보가 성공적으로 업데이트되었습니다.",
	"_Sharing.Notification.Updating.Subscription.Failed": "구독 정보를 업데이트할 수 없습니다. 다시 시도하십시오.",
	"_Sharing.Notification.Updating.Subscription.Failed.Email": "구독 사용이 설정된 선호하는 이메일 주소가 있어야 합니다.",
	
	"_FilterBar.Filter.Label": "보기:",
	"_FilterBar.Filter.All.Title": "모두",
	"_FilterBar.Filter.Unread.Title": "읽지 않음",
	"_FilterBar.Filter.Favorites.Title": "즐겨찾기",
	"_FilterBar.SortBy.Label": "정렬:",
	"_FilterBar.SortBy.Rank.Title": "가장 관련성이 높음",
	"_FilterBar.SortBy.Title.Title": "제목",
	"_FilterBar.SortBy.MostRecent.Title": "가장 최신 항목",
	"_FilterBar.SortBy.LeastRecent.Title": "가장 예전",
	"_FilterBar.Grid.Title": "아이콘",
	"_FilterBar.List.Title": "목록",
	"_GearMenu.General.Help": "도움말",
	"_GearMenu.General.MySettings": "나의 사용자 설정...",
	"_GearMenu.General.MySettings.Title": "나의 사용자 설정",
	"_GearMenu.General.Move" : "이동...",
	"_GearMenu.Wiki.Settings": "Wiki 설정...",
	"_GearMenu.Wiki.Settings.Title": "Wiki 설정",
	"_GearMenu.User.Hide": "사용자 가리기...",
	"_GearMenu.User.Unhide": "사용자 가리기 해제...",
	"_GearMenu.Search.SaveSearch" : "이 검색 결과 저장",
	"_PlusMenu.NewWiki": "새로운 Wiki...",
	"_PlusMenu.NewPage.NewPageInWiki%@": "\'%@\'에 있는 새로운 페이지...",
	"_PlusMenu.NewPage.NewInMyDocs": "나의 도큐멘트에 있는 새로운 페이지...",
	"_PlusMenu.NewPage.Dialog.Title" : "새로운 페이지",
	"_PlusMenu.NewPage.Dialog.Label" : "페이지 제목",
	"_Settings.Permissions.CommentAccess.Label":"댓글",
	"_Settings.Permissions.CommentAccess.all":"모두",
	"_Settings.Permissions.CommentAccess.authenticated":"인증된 사용자",
	"_Settings.Permissions.CommentAccess.disabled":"아무도 안 됨",
	"_Settings.Permissions.CommentModeration.Label":"댓글 관리",
	"_Settings.Permissions.CommentModeration.all":"모든 댓글",
	"_Settings.Permissions.CommentModeration.anonymous":"익명의 댓글만",
	"_Settings.Permissions.CommentModeration.disabled":"없음",
	"_Settings.General.PreferedEmail":"선호하는 이메일",
	
	
	"_Error.Delete.Document.Permissions":"오직 소유자 또는 관리자만 이 도큐멘트를 삭제할 수 있습니다.",
	"_Error.Delete.Wiki.Permissions":"오직 소유자 또는 관리자만 이 Wiki를 삭제할 수 있습니다.",
	"_Error.Hide.Person.Permissions":"오직 관리자만 사람을 가릴 수 있습니다.",
	
	// TODO - clean up below this line
	
	

	// Documents
	"_General.Documents.My": "나의 도큐멘트",
	"_General.Documents.None": "도큐멘트 없음",
	"_General.Documents.Untitled": "무제",
	"_General.Documents.Recents": "최근 사용 도큐멘트",
	// Favorites
	"_General.Favorites": "즐겨찾기",
	// Search
	"_Search": "검색",
	"_Search.Results": "검색 결과",
	"_Search.Recents": "최근 검색",
	"_Search.Saved": "저장된 검색",
	// Controls
	"_Control.Back": "뒤로",
	"_Control.Add": "추가",
	"_Control.Cancel": "취소",
	"_Control.Delete": "삭제",
	"_Control.Done": "완료",
	"_Control.Edit": "편집",
	"_Control.Save": "저장",
	"_Control.Send": "보내기",
	"_Control.OK": "승인",
	"_Control.Pagination.ShowAll": "모두 보기"
});
