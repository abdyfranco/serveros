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

CC.Accessibility = CC.Accessibility || new Object();

// Tab index name constants.

/* Header menu items */
CC.Accessibility.TAB_INDEX_NAME_NAV_GENERAL 			= 'cc-tab-index-header-general';
CC.Accessibility.TAB_INDEX_NAME_NAV_EDIT 				= 'cc-tab-index-header-edit';
CC.Accessibility.TAB_INDEX_NAME_NAV_DOWNLOAD 			= 'cc-tab-index-header-download';
CC.Accessibility.TAB_INDEX_NAME_NAV_SCOREBOARD 			= 'cc-tab-index-header-scoreboard';
CC.Accessibility.TAB_INDEX_NAME_NAV_PLUS 				= 'cc-tab-index-header-plus';
CC.Accessibility.TAB_INDEX_NAME_NAV_PLUS_NEW_BOT		= 'cc-tab-index-header-plus-new-bot';
CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR 				= 'cc-tab-index-header-gear';
CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_MOVE 			= 'cc-tab-index-header-gear-move';
CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_APPROVE 		= 'cc-tab-index-header-gear-approve';
CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_DELETE 		= 'cc-tab-index-header-gear-delete';
CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_HIDE 			= 'cc-tab-index-header-gear-hide';
CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_WIKI_SETTINGS 	= 'cc-tab-index-header-gear-wiki-settings';
CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_REPLACE 		= 'cc-tab-index-header-gear-wiki-replace';
CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_USER_SETTINGS 	= 'cc-tab-index-header-gear-user-settings';
CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_BOT_DELETE 	= 'cc-tab-index-header-gear-bot-delete';
CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_BOT_SETTINGS 	= 'cc-tab-index-header-gear-bot-settings';
CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_ABOUT 			= 'cc-tab-index-header-gear-about';
CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_HELP 			= 'cc-tab-index-header-gear-help';
CC.Accessibility.TAB_INDEX_NAME_NAV_LOGIN 				= 'cc-tab-index-header-login';
CC.Accessibility.TAB_INDEX_NAME_NAV_LOGOUT 				= 'cc-tab-index-header-logout';
CC.Accessibility.TAB_INDEX_NAME_NAV_SEARCH 				= 'cc-tab-index-header-search';

/* Banner menu items */
CC.Accessibility.TAB_INDEX_NAME_BANNER_HOME 			= 'cc-tab-index-banner-home';
CC.Accessibility.TAB_INDEX_NAME_BANNER_ACTIVITY 		= 'cc-tab-index-banner-activity';
CC.Accessibility.TAB_INDEX_NAME_BANNER_DOCUMENTS 		= 'cc-tab-index-banner-documents';
CC.Accessibility.TAB_INDEX_NAME_BANNER_TAGS 			= 'cc-tab-index-banner-tags';
CC.Accessibility.TAB_INDEX_NAME_BANNER_CALENDAR 		= 'cc-tab-index-banner-calendar';
CC.Accessibility.TAB_INDEX_NAME_BANNER_BLOG 			= 'cc-tab-index-banner-blog';

/* Filter menu items */
CC.Accessibility.TAB_INDEX_NAME_FILTER_MAIN 			= 'cc-tab-index-filter-main';
CC.Accessibility.TAB_INDEX_NAME_FILTER_SORT_BY 			= 'cc-tab-index-filter-sort-by';
CC.Accessibility.TAB_INDEX_NAME_FILTER_SORT_BY_TYPE 	= 'cc-tab-index-filter-sort-by-type';
CC.Accessibility.TAB_INDEX_NAME_FILTER_KEYWORD 			= 'cc-tab-index-filter-keyword';
CC.Accessibility.TAB_INDEX_NAME_FILTER_SAVE 			= 'cc-tab-index-filter-save';
CC.Accessibility.TAB_INDEX_NAME_FILTER_DONE				= 'cc-tab-index-filter-done';

/* Sidebar menu items */
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_TAGS 						= 'cc-tab-index-sidebar-tags';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_TAGS_TEXTBOX 				= 'cc-tab-index-sidebar-tags-textbox';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_TAGS_COLLECTION 			= 'cc-tab-index-sidebar-tags-collection';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_RELATED 					= 'cc-tab-index-sidebar-related';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_RELATED_SEARCH 				= 'cc-tab-index-sidebar-related-search';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_RELATED_RECENT 				= 'cc-tab-index-sidebar-related-recent';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_COMMENTS 					= 'cc-tab-index-sidebar-comments';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_NOTIFICATIONS 				= 'cc-tab-index-sidebar-notifications';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY 					= 'cc-tab-index-sidebar-history';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_SHOWMORE			= 'cc-tab-index-sidebar-history-showmore';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_ACTION_CLOSE 		= 'cc-tab-index-sidebar-history-action-close';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_ACTION_RESTORE	 	= 'cc-tab-index-sidebar-history-action-restore';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_ACTION_SHOWCHANGES 	= 'cc-tab-index-sidebar-history-action-showchanges';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_ACTION_HIDECHANGES 	= 'cc-tab-index-sidebar-history-action-hidechanges';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_SHARING 					= 'cc-tab-index-sidebar-sharing';

/* Popup items - Settings */
CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_GENERAL 					= 'cc-tab-index-popup-settings-general';
CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_APPEARANCE 				= 'cc-tab-index-popup-settings-appearance';
CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_APPEARANCE_PARAMS		= 'cc-tab-index-popup-settings-appearance-params';
CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS 				= 'cc-tab-index-popup-settings-permissions';
CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS_NAME 		= 'cc-tab-index-popup-settings-permissions-name';
CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS_ACCESS 		= 'cc-tab-index-popup-settings-permissions-access';
CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS_COMMENTS		= 'cc-tab-index-popup-settings-permissions-comments';
CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS_MODERATION	= 'cc-tab-index-popup-settings-permissions-moderation';
CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_BUTTON_SAVE				= 'cc-tab-index-popup-settings-button-save';
CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_BUTTON_CANCEL			= 'cc-tab-index-popup-settings-button-cancel';

/* Popup items - Dialog */
CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_NEW_PAGE		 			= 'cc-tab-index-popup-new-page';
CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_DELETE_PAGE				= 'cc-tab-index-popup-move-delete-page';
CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_UPLOAD_FILE_TO_DOCUMENTS	= 'cc-tab-index-popup-upload-file-to-documents';
CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_MOVE_TO_WIKI_NAME			= 'cc-tab-index-popup-move-to-wiki-name';
CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_MOVE_TO_WIKI_RESULT		= 'cc-tab-index-popup-move-to-wiki-result';
CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_MOVE_SIMPLETEXT			= 'cc-tab-index-popup-move-simpletext';
CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_OK_BUTTON 					= 'cc-tab-index-popup-ok-button';
CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_CANCEL_BUTTON 				= 'cc-tab-index-popup-cancel-button';

/* Popup items - Dialog */
CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_BOT_SETTINGS_TABS					= 'cc-tab-index-popup-create-bot-settings-tabs';
CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_INFO_VIEW					= 'cc-tab-index-popup-create-new-bot-info-view';			// (Step 1/4)
CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_SCHEDULE_VIEW				= 'cc-tab-index-popup-create-new-bot-schedule-view';		// (Step 2/4)
CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_TESTING_VIEW				= 'cc-tab-index-popup-create-new-bot-testing-view';			// (Step 3/4)
CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_NOTIFICATION_VIEW			= 'cc-tab-index-popup-create-new-bot-notification-view';	// (Step 4/4)
CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_TESTING_VIEW_DEVICES		= 'cc-tab-index-popup-create-new-bot-testing-view-devices';
CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_SCHEDULE_VIEW_SELECT_BOX	= 'cc-tab-index-popup-create-new-bot-schedule-view-select-box';
CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_CANCEL				= 'cc-tab-index-popup-create-new-bot-button-cancel';
CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_PREVIOUS 			= 'cc-tab-index-popup-create-new-bot-button-previous';
CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_NEXT 				= 'cc-tab-index-popup-create-new-bot-button-next';

/* List of items (Activities, Documents) */
CC.Accessibility.TAB_INDEX_NAME_LIST_ITEMS 	= 'cc-tab-index-list-items';

/* Bot Header View items */
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_ENTITY_TITLE 					= 'cc-tab-index-bot-header-view-entity-title';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY 						= 'cc-tab-index-bot-header-view-summary';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_INFO 					= 'cc-tab-index-bot-header-view-summary-info';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_RESULTS 				= 'cc-tab-index-bot-header-view-summary-results';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_RESULTS_ERRORS 			= 'cc-tab-index-bot-header-view-summary-results-errors';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_RESULTS_WARNINGS 		= 'cc-tab-index-bot-header-view-summary-results-warnings';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_RESULTS_ISSUES 			= 'cc-tab-index-bot-header-view-summary-results-issues';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_RESULTS_TESTS_SUMMARY 	= 'cc-tab-index-bot-header-view-summary-results-tests-summary';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_DOWNLOADS 				= 'cc-tab-index-bot-header-view-summary-downloads';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS 							= 'cc-tab-index-bot-header-view-tests';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_HEADER					= 'cc-tab-index-bot-header-view-tests-header';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_DETAILS					= 'cc-tab-index-bot-header-view-tests-details';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_DEVICE					= 'cc-tab-index-bot-header-view-tests-device';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_BOTTOM					= 'cc-tab-index-bot-header-view-tests-bottom';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_INFO 						= 'cc-tab-index-bot-header-view-tests-info';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_RESULTS					= 'cc-tab-index-bot-header-view-tests-results';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_RESULTS_TOTALS			= 'cc-tab-index-bot-header-view-tests-results-total';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_RESULTS_TESTS_FAILED 		= 'cc-tab-index-bot-header-view-tests-results-tests-failed';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_RESULTS_TESTS_PASSED 		= 'cc-tab-index-bot-header-view-tests-results-tests-passed';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_COMMITS 						= 'cc-tab-index-bot-header-view-commits';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_LOGS 							= 'cc-tab-index-bot-header-view-logs';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_ARCHIVES 						= 'cc-tab-index-bot-header-view-archives';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_INTEGRATE						= 'cc-tab-index-bot-header-view-integrate';

CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP									= 'cc-tab-index-bot-summary-top';
CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_LAST_INTEGRATION				= 'cc-tab-index-bot-summary-top-last-integration';
CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_LAST_INTEGRATION_VIEW_SUMMARY 	= 'cc-tab-index-bot-summary-top-last-integration-view-summary';
CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_NEXT_INTEGRATION				= 'cc-tab-index-bot-summary-top-next-integration';
CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_NEXT_INTEGRATION_INTEGRATE_NOW	= 'cc-tab-index-bot-summary-top-next-integration-integrate-now';
CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_DOWNLOADS						= 'cc-tab-index-bot-summary-top-downloads';
CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_DOWNLOADS_VIEW_ARCHIVES			= 'cc-tab-index-bot-summary-top-downloads-view-archives';
CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_DOWNLOADS_ARCHIVE_LINK			= 'cc-tab-index-bot-summary-top-downloads-archive-link';
CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_BOTTOM								= 'cc-tab-index-bot-summary-bottom';
CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_BOTTOM_LIST 						= 'cc-tab-index-bot-summary-bottom-list';

CC.Accessibility.TAB_INDEX_NAME_MAP = {};
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GENERAL] = '10';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_EDIT] = '20';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_DOWNLOAD] = '30';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_SCOREBOARD] = '40';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_PLUS] = '50';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_PLUS_NEW_BOT] = '51';

CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR] = '60';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_MOVE] = '70';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_APPROVE] = '80';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_DELETE] = '90';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_HIDE] = '100';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_WIKI_SETTINGS] = '110';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_REPLACE] = '120';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_USER_SETTINGS] = '130';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_BOT_DELETE] = '131';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_BOT_SETTINGS] = '132';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_ABOUT] = '140';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_HELP] = '150';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_LOGIN] = '160';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_LOGOUT] = '170';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_SEARCH] = '180';

CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BANNER_HOME] = '200';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BANNER_ACTIVITY] = '210';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BANNER_DOCUMENTS] = '220';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BANNER_TAGS] = '230';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BANNER_CALENDAR] = '240';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BANNER_BLOG] = '250';

CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_FILTER_MAIN] = '260';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_FILTER_SORT_BY] = '270';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_FILTER_SORT_BY_TYPE] = '280';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_FILTER_KEYWORD] = '290';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_FILTER_SAVE] = '291';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_FILTER_DONE] = '292';

CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_TAGS] = '300';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_TAGS_TEXTBOX] = '310';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_TAGS_COLLECTION] = '320';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_RELATED] = '330';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_RELATED_SEARCH] = '340';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_RELATED_RECENT] = '350';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_COMMENTS] = '360';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_NOTIFICATIONS] = '370';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY] = '380';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_SHOWMORE] = '390';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_ACTION_CLOSE] = '501';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_ACTION_RESTORE] = '502';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_ACTION_SHOWCHANGES] = '503';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_ACTION_HIDECHANGES] = '504';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_SHARING] = '600';

// used for list of tags in the side bar
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_TAGS_COLLECTION] = '700';

// used for list of documents, activities, etc
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_LIST_ITEMS] = '1000'; 

/* Popups */
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_GENERAL] = '2000';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_APPEARANCE] = '2100';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_APPEARANCE_PARAMS] = '2101';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS] = '2200';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS_NAME] ='2210';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS_ACCESS] ='2220';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS_COMMENTS] ='2230';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS_MODERATION] ='2240';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_BUTTON_SAVE] = '2301';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_BUTTON_CANCEL] = '2302';

CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_NEW_PAGE] = '2400'; 					// Popup: New Page in My Documents...
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_DELETE_PAGE] = '2410';					// Popup: Delet Page...
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_UPLOAD_FILE_TO_DOCUMENTS] = '2420'; 	// Popup: Upload File to My Documents...
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_MOVE_TO_WIKI_NAME] = '2430'; 			// Popup: Move to Wiki...
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_MOVE_TO_WIKI_RESULT] = '2440';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_MOVE_SIMPLETEXT] = '2450';				// Popups: Log out, About, etc..
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_OK_BUTTON] = '2901'; 					// Popup Buttons: OK, CANCEL
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_CANCEL_BUTTON] = '2902';

CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_BOT_SETTINGS_TABS] = '2900';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_INFO_VIEW] = '2910';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_SCHEDULE_VIEW] = '2920';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_SCHEDULE_VIEW_SELECT_BOX] = '2921';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_TESTING_VIEW] = '2940';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_TESTING_VIEW_DEVICES] = '2945';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_NOTIFICATION_VIEW] = '2960';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_CANCEL] = '2970';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_PREVIOUS] = '2980';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_NEXT] = '2990';

// Used for traveling through list of bots on the left side bar
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_LIST] = '3000';

CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_ENTITY_TITLE] = '3100';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY] = '3200';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_INFO] = '3210';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_RESULTS] = '3220';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_RESULTS_ERRORS] = '3221';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_RESULTS_WARNINGS] = '3222';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_RESULTS_ISSUES] = '3223';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_RESULTS_TESTS_SUMMARY] = '3224';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_DOWNLOADS] = '3230';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS] = '3300';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_HEADER] = '3301';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_INFO] = '3310';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_RESULTS] = '3320';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_RESULTS_TOTAL] = '3321';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_RESULTS_TESTS_FAILED] = '3322';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_RESULTS_TESTS_PASSED] = '3323';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_DETAILS] = '3400';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_DEVICE] = '3410';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_BOTTOM] = '3500';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_COMMITS] = '3600';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_LOGS] = '3700';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_ARCHIVES] = '3800';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_INTEGRATE] = '4100';

// Summary Bot View
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP] = '3211';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_LAST_INTEGRATION] = '3213';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_LAST_INTEGRATION_VIEW_SUMMARY] = '3214';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_NEXT_INTEGRATION] = '3225';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_NEXT_INTEGRATION_INTEGRATE_NOW] = '3226';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_DOWNLOADS] = '3231';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_DOWNLOADS_VIEW_ARCHIVES] = '3232';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_DOWNLOADS_ARCHIVE_LINK] = '3233';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_BOTTOM] = '4000';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_BOTTOM_LIST] = '4010';

CC.Accessibility.TabIndexerElements = [];
CC.Accessibility.TabIndexerElements_Panel = [];

CC.Accessibility.accessibility = Class.createWithSharedInstance('accessibility', true);

CC.Accessibility.accessibility.prototype = {
	initialize: function() {
		CC.Accessibility.TabIndexerElements.push('root');
		CC.Accessibility.TabIndexerElements.push('quicksearch');
		CC.Accessibility.TabIndexerElements.push('table_block_settings_dialog');
		CC.Accessibility.TabIndexerElements.push('dialog_mask');
		CC.Accessibility.TabIndexerElements.push('table_block_inline_popup');
		CC.Accessibility.TabIndexerElements.push('progress_message_dialog');
		CC.Accessibility.TabIndexerElements.push('search');		 
		
		CC.Accessibility.TabIndexerElements_Panel.push('header');
		CC.Accessibility.TabIndexerElements_Panel.push('main');
		CC.Accessibility.TabIndexerElements_Panel.push('dialog_mask');
		CC.Accessibility.TabIndexerElements_Panel.push('table_block_inline_popup');
		CC.Accessibility.TabIndexerElements_Panel.push('progress_message_dialog');
		CC.Accessibility.TabIndexerElements_Panel.push('search');
	},
	
	/* Return tabIndex for a given element name */
	requestTabIndex: function(inName) {
		return CC.Accessibility.TAB_INDEX_NAME_MAP[inName];
	},
	/* Disable all the parents elements behind a popup. */
	makeRootViewsAriaHidden: function(isPanel) {	
		if (!isPanel) {
			for (i=0; i < CC.Accessibility.TabIndexerElements.length; i++) {
				if ($(CC.Accessibility.TabIndexerElements[i]))
					$(CC.Accessibility.TabIndexerElements[i]).writeAttribute('aria-hidden', 'true');
			}			
		} else {
			for (i=0; i < CC.Accessibility.TabIndexerElements_Panel.length; i++) {
				if ($(CC.Accessibility.TabIndexerElements_Panel[i]))
					$(CC.Accessibility.TabIndexerElements_Panel[i]).writeAttribute('aria-hidden', 'true');
			}			
		}
	},
	makeRootViewsAriaVisible: function(isPanel) {
		if (!isPanel) {	
			for (i=0; i < CC.Accessibility.TabIndexerElements.length; i++) {
				if ($(CC.Accessibility.TabIndexerElements[i]))
					$(CC.Accessibility.TabIndexerElements[i]).writeAttribute('aria-hidden', 'false');
			}
		} else {
			for (i=0; i < CC.Accessibility.TabIndexerElements_Panel.length; i++) {
				if ($(CC.Accessibility.TabIndexerElements_Panel[i]))
					$(CC.Accessibility.TabIndexerElements_Panel[i]).writeAttribute('aria-hidden', 'false');
			}			
		}
	}
};