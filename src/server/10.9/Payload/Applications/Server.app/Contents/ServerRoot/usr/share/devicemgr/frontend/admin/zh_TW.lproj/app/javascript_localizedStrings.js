// Copyright (c) 2014 Apple Inc. All rights reserved.
var localizedStrings = { /* The name of the Web Application itself. */
  "_appName": "描述檔管理程式",

  "_locale": "zh_TW",

  '_SC.DateTime.dayNames': '星期日 星期一 星期二 星期三 星期四 星期五 星期六',
  '_SC.DateTime.abbreviatedDayNames': '週日 週一 週二 週三 週四 週五 週六',
  '_SC.DateTime.monthNames': '1 月 2 月 3 月 4 月 5 月 6 月 7 月 8 月 9 月 10 月 11 月 12 月',
  '_SC.DateTime.abbreviatedMonthNames': '1 2 3 4 5 6 7 8 9 10 11 12',
  '_SC.DateTime.AMPMNames': '上午 下午',

  /* The name of the sidebar item for Device Groups */
  "_device_groups_sidebar_item_display_name": "裝置群組",

  /* The name of the sidebar item for User Groups */
  "_user_groups_sidebar_item_display_name": "群組",

  /* This is the cancel button in the Add Device Sheet. It closes the sheet without taking any action. */
  "_add_device_page_cancel_button_title": "取消",

  /* This is the default button in the Add Device Sheet. It takes the unique identifier provided and creates a temporary device record. */
  "_add_device_pane_add_button_title": "加入裝置",

  /* This is the name of Mail Settings as it appears in the Add Settings Sheet. */
  "_email_knob_set_name": "電子郵件",

  /* This is the item in the sidebar that when selected displays tasks that are active. */
  "_sidebar_active_tasks": "啟用的作業",

  /* This is an item in the sidebar that groups the Active and Completed Tasks. It can not be selected. */
  "_sidebar_root_activity": "活動",

  /* This is an item in the sidebar that gorups the item types that can be placed in Configuration Profiles. It itself can not be selected. */
  "_sidebar_root_library": "資料庫",

  //KNOB SET ADD STEP 2a

  /* This is the name of the Setting Type for Printing settings. */
  "_energy_saver_knob_set_name": "能源節約器",

  /* This is the name of the Setting Type for Printing settings. */
  "_privacy_knob_set_name": "安全性與隱私",

  /* This is the name of the Setting Type for Printing settings. */
  "_parental_controls_knob_set_name": "分級保護控制",

  /* This is the name of the Setting Type for Printing settings. */
  "_cfprefs_knob_set_name": "自定設定",

  /* This is the name of the Setting Type for Printing settings. */
  // ==========
  // = Banner =
  // ==========
  "_mac_restrictions_knob_set_name": "限制",

  /* This is the name of the Setting Type for Printing settings. */
  "_printing_knob_set_name": "列印",

  /* This is the name of the Setting Type for Mobility and PHD settings. */
  "_mobility_knob_set_name": "行動能力",

  /* This is the name of the Setting Type for Login Window settings. */
  "_login_window_knob_set_name": "登入視窗",

  /* This is the name of the Setting Type for Software Update settings. */
  "_software_update_knob_set_name": "軟體更新",

  /* This is the name of the Setting Type for Dock settings. */
  "_dock_knob_set_name": "Dock",

  /* This is the name of the Setting Type for Exchange settings. */
  "_exchange_knob_set_name": "Exchange",

  /* This is the name of the Setting Type for Directory settings. */
  "_directory_knob_set_name": "目錄",

  /* This is the name of the Setting Type for Advanced settings. */
  "_apn_knob_set_name": "APN",

  /* This is the name of the Setting Type for LDAP settings. */
  "_ldap_knob_set_name": "LDAP",

  /* this is the name of the Setting Type for the Passcode setting. There can only be one Passcode setting in a Configuration Profile. */
  "_passcode_knob_set_name": "密碼",

  /* This is the name of the Global Http Proxy Knobset */
  "_global_http_proxy_knob_set_name": "全域 HTTP 代理伺服器",

  /* This is the name of the Setting Type for the VPN setting. */
  "_vpn_knob_set_name": "VPN",

  /* This is the name of the Setting Type for the CalDav settings. */
  "_cal_dav_knob_set_name": "行事曆",

  /* This is the name of the Setting Type for the CardDav settings. */
  "_card_dav_knob_set_name": "聯絡資訊",

  /* This is the name of the Setting Type for the Login Items settings. */
  "_login_item_knob_set_name": "登入項目",

  /* This is the name of the Network Home Share Point name for the Login Items settings. */
  "_login_item_network_home_share_point_name": "<網路個人專屬共享點>",

  /* This is the name of the Setting Type for the CardDav settings. */
  "_general_knob_set_name": "一般",

  /* This is the name of the Setting Type for the Subscribed Calendars settings. */
  "_subscribed_calendar_knob_set_name": "已訂閱的行事曆",

  /* This is the name of the Setting Type for the restrictions settings. */
  "_restrictions_knob_set_name": "限制",

  /* This is the subheading for the Certificate Name field for Certificate Settings. */
  "_certificate_knob_set_view_display_name_description": "憑證的名稱或描述",

  /* The heading for the Certificate Name field for Certificate Settings. */
  "_certificate_knob_set_view_display_name_label": "憑證名稱",

  /* The name of Messages settings */
  "_ichat_knob_set_name": "訊息",

  /* The hint that appears in fields for Settings where the field is required. */
  "_knob_set_view_required_hint": "必須",

  /* The name of Certificate Settings. */
  "_certificate_knob_set_name": "憑證",

  /* The name of Web Clip Settings. */
  "_web_clip_knob_set_name": "Web Clip",

  /* This is the description for SCEP Setting's Fingerprint Field. */
  "_admin_scep_knob_set_view_fingerprint_field_description": "輸入要做為指紋的十六進位字串",

  /* This is the name of the SCEP Settings. */
  "_scep_knob_set_name": "SCEP",

  /* This is the label for SCEP Settings's Name Field. */
  "_admin_scep_knob_set_view_name_field_label": "名稱",

  /* This is the label for SCEP Setting's Fingerprint Field. */
  "_admin_scep_knob_set_view_fingerprint_field_label": "指紋",

  /* This is the label for SCEP Setting's URL Field. */
  "_admin_scep_knob_set_view_url_field_label": "URL",

  /* This is the description for SCEP Setting's Name Field. */
  "_admin_scep_knob_set_view_name_field_description": "實例的名稱：CA-IDENT",

  /* This is the label for SCEP Setting's Challenge Field. */
  "_admin_scep_knob_set_view_challenge_field_label": "詢問",

  /* This is the hint provided in Fields in Settings when the value of the field is optional. */
  "_knob_set_view_optional_hint": "可留空",

  "_generic_string_Retries": "重試",
  "_generic_string_The number of times to poll the SCEP server for a signed certificate before giving up": "在放棄之前，輪詢 SCEP 伺服器以簽署憑證的次數",
  "_generic_string_Retry Delay": "重試延遲",
  "_generic_string_The number of seconds to wait between poll attempts": "輪詢嘗試之間的等待秒數",

  /* This is the description for SCEP Setting's Challenge Field. */
  "_admin_scep_knob_set_view_challenge_field_description": "做為自動登記的預先共享密鑰",

  /* This is the description for SCEP Setting's URL Field. */
  "_admin_scep_knob_set_view_url_field_description": "SCEP 伺服器的基本 URL",

  /* This is the label for SCEP Setting's Subject Field. */
  "_admin_scep_knob_set_view_subject_field_label": "標題",

  /* This is the description of SCEP Setting's Subject Field. */
  "_admin_scep_knob_set_view_subject_field_description": "X.500 名稱的呈現方式",
  /* This is the message that appears when a Server Error occurs. */
  "_Server Error Occurred Message": "發生伺服器錯誤",

  /* This is the description for SCEP Setting's Key Size Field. */
  "_admin_scep_knob_set_view_keysize_field_description": "鍵值大小（以 bit 計）",

  "1024": "1024",

  "2048": "2048",


  /* This is the description of the save Changes Confirmation. */
  "_Show Save Changes Confirmation Description": "這會將更改的設定內容推播到裝置上。",

  /* This is the description of the Delete Item Confirmation. */
  "_Show Delete Item Confirmation Description": "無法還原此動作。",

  /* This is the description of the Error Occurred error. */
  "_Server Error Occurred Description": "請重新載入網頁，然後再試一次。",

  /* This is the caption of the Server Error Occurred error. */
  "_Server Error Occurred Caption": "若此錯誤持續發生，請聯絡您的管理者。",

  /* This is the message that appears when Settings are being saved. */
  "_Show Save Changes Confirmation Message": "要儲存所作更動嗎？",

  /* This is the label for SCEP Setting's Key Size Field. */
  "_admin_scep_knob_set_view_keysize_field_label": "鍵值大小",

  /* This is the message that apepars when a Profile is about to be deleted. */
  "_Show Delete Item Confirmation Message": "刪除？",
  "_delete_profile_alert_pane_header_Remove All Settings?": "要移除所有設定嗎？",
  "_delete_settings_button_text_Remove All Settings": "移除所有設定",
  '_delete_profile_alert_pane_message_All payloads will be removed from "<profile_name>". "<profile_name>" will then be removed from all devices where it is currently applied. This action cannot be undone.': '所有承載資料將從「%@1」移除。之後，「%@1」會從所有目前已套用的裝置上移除。此動作無法還原。',
  '_delete_profile_alert_pane_message_manual_profile_for_directory_item': '所有設定都將從「%@1」移除，且「%@1」將無法再從「我的裝置」入口頁面中下載。',
  '_delete_profile_alert_pane_message_manual_profile_for_device': '所有設定都將從「%@」移除。',
  'no_payloads_alert_header': "未設定承載資料",
  'no_payloads_alert_description': '「%@」必須已設定至少一個除了「一般」之外的承載資料。將不會儲存「一般」承載資料的更動。',
  "_continue_without_saving": "繼續",

  "_unenroll_device_alert_pane_header": "要移除裝置管理中已管理的設定、App 和登記嗎？",
  "_unenroll_device_alert_pane_description": "在裝置取消登記之後仍會保留暫存區記錄。",
  "_unenroll_button_text_Unenroll": "取消登記",
  "_unenroll_and_remove_placeholder_button_text": "取消登記並移除暫存區",
  "_unenroll_dep_device_alert_pane_description": "在裝置取消登記之後仍會保留來自「裝置登記方案」的暫存區記錄。",
  "_remove_device_placeholder_alert_pane_header": "要移除暫存區記錄嗎？",
  "_remove_device_placeholder_alert_pane_description": "此暫存區裝置目前儲存的所有資訊都將遺失。",
  "_remove_device_placeholder_with_activation_lock_alert_pane_description": "目前已儲存的所有資訊，包含此暫存區裝置的啟用鎖定略過代碼都會遺失。若已啟用鎖定，則需要啟用鎖定略過代碼才能回復此裝置。",
  "_remove_device_placeholder_button_text_Remove Placeholder": "移除暫存區",
  "_remove_dep_device_placeholder_alert_pane_header": "要將裝置從「裝置登記方案」中永久移除嗎？",
  "_remove_dep_device_placeholder_alert_pane_description": "此動作無法還原。將不會允許您透過「裝置登記方案」入口頁面來登錄此裝置。此裝置目前儲存的所有資訊都將遺失。",
  "_remove_dep_device_placeholder_button_text_Remove": "移除",
  "_unenroll_dep_device_alert_pane_width": "540",
  "_remove_dep_device_alert_pane_width": "570",
  "_revert_device_to_placeholder": "回復成暫存區",

  "_device_enrollment_state_placeholder": "暫存區",
  "_device_enrollment_state_unenrollment_pending": "取消登記擱置中",
  "_device_state_header_placeholder_label_width": "70",
  "_device_state_header_unenrollment_pending_label_width": "140",

  /* The display title for SCEP Setting's Use as digital signature checkbox */
  "_admin_scep_knob_set_view_use_as_digital_signature_display_title": "做為數位簽名",

  /* The display title for SCEP Setting's Use for key encipherment checkbox */
  "_admin_scep_knob_set_view_use_for_key_encipherment": "用於密鑰加密",

  /* The label for Certificate Settings' Certificate Field */
  "_certificate_knob_set_view_upload_label": "憑證或識別身分資料",

  /* The description for Certificate Settings' Certificate Field */
  "_certificate_knob_set_view_upload_description": "包含在裝置上的 X.509 憑證（.cer、.p12 等）",

  /* The placeholder text for uploading a Certificate to a Certificate Setting. */
  "_certificate_knob_set_view_upload_placeholder": "沒有憑證",

  /* The Lock Task Type */
  "_task_type_lock": "鎖定",
  "_task_type_lock_with_display_name": "鎖定：%@1",

  /* The Wipe Task Type */
  "_task_type_wipe": "清除",
  "_task_type_wipe_with_display_name": "清除：%@1",

  /* This is the name for the Device Info Task Type */
  "_task_type_device_info": "更新資訊",
  "_task_type_device_info_with_display_name": "更新資訊：%@1",
  "_task_type_allow_activation_lock": "允許啟用鎖定",
  "_task_type_clear_activation_lock": "清除啟用鎖定",

  /* This is the name for the Clear Passcode Task Type */
  "_task_type_clear_passcode": "清除密碼",
  "_task_type_clear_passcode_with_display_name": "清除密碼：%@1",

  /* This is the label for the Completed Tasks sidebar entry. */
  "_sidebar_completed_tasks": "完成的作業",

  /* This is the available device capacity formatter. In English, this is equivalent to 6.23 GB. %@1 is subsituted for something like 6.23. */
  "_available_device_capacity_format": "%@1 GB",

  /* This is the task status when the notification has been sent but the device has not checked in yet. */
  "_task_step_notification_sent_device_pending": "傳送中",

  /* This is the task status when the device has reported that it has completed the task. */
  "_task_step_device_completion": "已完成",

  /* This is the task status when the device has checked in and received the task, but has not yet checked in reporting that it has completed the task. */
  "_task_step_device_receieved_device_completion_pending": "進行中",

  /* This is the task type when the device is asked to provide info about itself to Profile Manager. */
  "_task_type_update_info": "更新資訊",
  "_task_type_update_info_with_display_name": "更新資訊：%@1",

  /* This is the task status when the device has not yet been sent a notification asking it to check in to recieve its task. This probably should never be displayed. */
  "_task_step_notification_pending": "等待中",
  "_task_step_vpp_status_user_not_invited": "未邀請使用者",
  "_task_step_vpp_status_user_not_enrolled": "使用者未登記",
  "_task_step_vpp_status_no_copies_available": "沒有可用的拷貝",

  /* This is the description for when an unknown error occurs within the Profile Manager web app. */
  "_client_error_occurred_description": "請重新載入「描述檔管理程式」，然後再試一次。",

  /* This is the message for when the Profile Manager server cannot be found. */
  "_server_not_found_message": "找不到描述檔伺服器",

  /* This is the description for when the Profile Manager server cannot be found. */
  "_server_not_found_description": "請確定已在 Server App 中開啟「描述檔管理程式」。",

  /* This is the caption for when an unknown error occurs within the Profile Manager web app. */
  "_client_error_occurred_caption": "錯誤：%@1",

  /* This is the message for when an unknown error occurs within the Profile Manager web app. */
  "_client_error_occurred_message": "發生錯誤",

  /* This is the description for the network timeout error. */
  "_server_timed_out_description": "請確定已連接 Internet 以及「描述檔伺服器」所在的網路。",

  /* This is the message for the network timeout error. */
  "_server_timed_out_message": "與伺服器的連線已逾時",

  /* This is the description shown for the No Devices Found warning, which happens when the admin attempts to perform a task on a Library Item that has no Devices as descendants. */
  "_No Devices Found For Task Description": "找不到此項目的裝置。",

  /* This is the date and time format for Tasks. */
  "_task_updated_at_formatted_string": "%y/%m/%d %p %i:%M",

  /* This is the message shown for the no Devices Found warning, which happens when the admin attempts to perform a task on a Library Item that has no Devices as descendants. */
  "_No Devices Found For Task Message": "找不到執行作業的裝置",

  /* This is the label of the Passphrase field of Certificates. */
  "_certificate_knob_set_view_password_label": "密語",

  /* This is the description of the Passphrase field of Certificates. */
  "_certificate_knob_set_view_password_description": "用以保護憑證安全的密語",

  /* This is the task state for cancelled tasks. */
  "_task_cancelled": "已取消",

  /* This is the menu item for sorting tasks ascending. */
  "_tasks_sort_ascending": "升冪排序",

  /* This is the mnu item for sorting tasks descending. */
  "_tasks_sort_descending": "降冪排序",

  /* This is the menu item for sorting tasks by last updated. */
  "_tasks_sort_by_last_updated": "上次更新",

  /* This is the menu item for sorting tasks by name. */
  "_tasks_sort_by_name": "名稱",

  /* This is the menu item for sorting tasks by icon. */
  "_tasks_sort_by_icon": "圖像",

  /* This is the menu item for sorting tasks by status. */
  "_tasks_sort_by_status": "狀態",
  "_task_type_send_vpp_invitation_with_display_name": "傳送 VPP 邀請：%@",
  "_task_type_remove_device_with_display_name": "移除裝置：%@",
  "_task_type_enroll_device_with_display_name": "登記裝置：%@",
  "_task_type_push_apps_with_display_name": "推播 App：%@",
  "_task_type_remove_apps_with_display_name": "移除 App：%@",
  "_task_type_retrieve_activation_lock_bypass_code_with_display_name": "取得啟用鎖定略過代碼：%@",
  "_task_type_allow_activation_lock_with_display_name": "允許啟用鎖定：%@",
  "_task_type_remove_activation_lock_with_display_name": "清除啟用鎖定：%@",

  /* This is the unknown type for tasks. This should almost never appear in the UI; it is only there in case there is a bug or something. */
  "_task_type_unknown_type": "未知的",
  "_task_type_unknown_type_with_display_name": "未知：%@1",

  /* This is the description that is shown for identity (password protected) certificates. */
  "_certificate_is_identity_description": "此內容是以「個人資訊交換」（PKCS12）格式儲存的，並以密碼保護。無法顯示任何內容。",

  /* This is the message shown when the server has not finished turning on. This will probably only happen for 10-15 seconds after turning Profile Manager on in Server.app. */
  "_server_not_available_message": "無法使用描述檔伺服器",

  /* This is the description shown when the server has not finished turning on. */
  "_server_not_available_description": "請稍候片刻，然後再試一次。",

  /* This is the message shown when the network is not available. This typically happens when the web browser refuses to connect to anything. */
  "_network_not_available_message": "網路無法使用",

  /* This is the description shown when the network is not available. */
  "_network_not_available_description": "請確定您已連接 Internet，並且再試一次。",

  /* This is the hint for the search box which says things like "Search Users", "Search Active Tasks", etc. */
  "_search_type_hint": "搜尋 %@1",

  "_generic_string_200+ found (200 displayed)": "找到 %@1+ 個（顯示 %@1 個）",
  "_generic_string_<count> found": "找到 %@1 個",


  /* This is the hint for the search box when search is disabled. */
  "_search_disabled_hint": "搜尋",

  /* This is the Cancel button for the Filetype not Supported error. */
  "_filetype_not_supported_cancel_button": "取消",

  /* This is the description for the Filetype not Supported error. */
  "_filetype_not_supported_description": "不支援所選的檔案。請選取不同的檔案。",

  /* This is the Filetype not Supported error. */
  "_filetype_not_supported_message": "不支援檔案類型",

  /* This is the combined profile status for Up to Date */
  "_combined_profile_up_to_date": "最新的",

  /* This is the combined profiles status for Pending Install */
  "_combined_profile_pending_install": "擱置中的安裝",

  /* This is the temporary combined profiles status for either External or Pending Removal */
  "_combined_profile_external_or_pending_removal": "外部或待執行的移除",

  /* This is the combined profile status for Out of Date */
  "_combined_profile_out_of_date": "過時",

  /* This is the combined profile status for Pending Removal. */
  "_combined_profile_pending_removal": "擱置中的移除",

  /* This is the combined profile status for External. */
  "_combined_profile_external": "外部",

  /* This is the Don't Save button for the Show Save Changes Confirmation sheet. */
  "_show_save_changes_confirmation_dont_save": "不儲存",

  /* This is the passcode Compliant state for Devices for compiance with both Profiles and Accounts */
  "_passcode_compliant_both_compliant": "描述檔和帳號",

  /* This is the passcode Compliant state for Devices for compliance with only Profiles, not Accounts */
  "_passcode_compliant_only_profiles_compliant": "僅描述檔，非帳號",

  /* This is the passcode Compliant state for Devices for compliance with only Accounts, not Profiles */
  "_passcode_compliant_only_other_compliant": "僅帳號，非描述檔",

  /* This is the passcode Compliant state for Devices for compliance with neither Profiles nor Accounts */
  "_passcode_compliant_not_compliant": "不是描述檔或帳號",

  /* This is the Passcode Present state for Devices for when the passcode is not present */
  "_passcode_present_not_present": "不存在",

  /* This is the Passcode Present state for Devices for when the passcode is present */
  "_passcode_present_present": "放映",

  /* This is the Hardware Encryption Capability state for Devices for when the Hardware is not capable */
  "_hardware_encrpyption_caps_not_capable": "無法使用",

  /* This is the Hardware Encryption Capability state for Devices for when the Hardware is only capable of file-level encryption */
  "_hardware_encrpyption_caps_only_file_capable": "僅相容於檔案層級",

  /* This is the Hardware Encryption Capability state for Devices for when the Hardware is capable of both block-level and file-level encryption */
  "_hardware_encrpyption_caps_both_capable": "相容於區塊層級和檔案層級",

  /* This is the Hardware Encryption Capability state for Devices for when the Hardware is capable of only block-level encryption */
  "_hardware_encrpyption_caps_only_block_capable": "僅相容於區塊層級",

  /* This is the Hardware Encryption field for Devices */
  "_hardware_encrpyption": "硬體加密",

  /* This is the Passcode Present field for Devices */
  "_passcode_present": "密碼存在",

  /* This is the Passcode Compliant field for Devices */
  "_passcode_compliant": "密碼相容",

  /* This is the Restrictions About Root Item for Devices */
  "_restrictions_about_root_item": "限制",

  /*  */
  "_manual_fetching_when_roaming_on": "開啟",

  /*  */
  "_manual_fetching_when_roaming_off": "關閉",

  /*  */
  "_force_forced": "強制",

  /*  */
  "_force_not_forced": "未強制",

  /*  */
  "_require_required": "必須",

  /*  */
  "_require_not_required": "不需要",

  /*  */
  "_allow_not_allowed": "不允許",

  /*  */
  "_allow_allowed": "允許",

  /*  */
  "_safari_accept_cookies_never": "永不",

  /*  */
  "_rating_apps_4_plus": "4+",

  /*  */
  "_rating_apps_17_plus": "17+",

  /*  */
  "_safari_accept_cookies_always": "總是",

  /*  */
  "_rating_apps_dont_allow_apps": "不允許 App",

  /*  */
  "_rating_apps_9_plus": "9+",

  /*  */
  "_rating_apps_12_plus": "12+",

  /*  */
  "_rating_apps_allow_all_apps": "允許所有 App",

  /*  */
  "_safari_accept_cookies_from_visited": "從已參訪的網站",

  /*  */
  "_unset": "—",

  /* This is the Installed Applications section of the About tab of Devices */
  "_installedApplications_about_root_item": "已安裝的 App",

  /* This is the hint for fields in Profile Settings where the field is required. */
  "_knob_set_view_hint_required": "必須",

  /* This is the payload type for profiles where the payload provides a password to allow users to remove a locaked configuration profile from the device. It can not be created in Profile Manager but may be present on profiles obtained elsewhere. */
  "_installed_profile_profile_removal_password_payload_type": "移除密碼",

  /* This is when the issuer of a Certificate can not be determined because it does not have a CN property. */
  "_certificate_issued_by_unknown": "未知的",

  /* This is the button in Exchange Settings to remove the certificate. */
  "_knob_set_view_remove_certificate": "移除憑證",

  /* This is the button in Exchange and Certificate Settings to add the certificate. */
  "_knob_set_view_add_certificate": "加入憑證⋯",

  /* This is the helper text in the About tab of Library Items under the In Groups section when the selected Library Item is not in any Groups. */
  "_about_in_groups_not_in_any_groups": "不在任何群組中",

  /* This is the Sort By button, used on the Activity/Tasks tab. */
  "_sort_by_button": "▼",

  /* This is the helper text shown when no Applications are installed on a Device. */
  "_about_installed_applications_no_installed_applications": "未安裝其他 App",

  /* This is the line item in the Devices tab of a Provisioning Profile that represents the additional devices specified in the Provisioning Profile that Profile Manager is unaware of. */
  "_provisioning_profile_n_additional_devices": "%@1 個額外裝置",

  /* This is the line item in the Devices tab of a Provisioning Profile that represents the additional device specified in the Provisioning Profile that Profile Manager is unaware of. */
  "_provisioning_profile_one_additional_device": "1 個額外裝置",

  /* This is the task type when a Provisioning Profile is installed onto a Device. */
  "_task_type_install_provisioning_profile": "安裝佈建描述檔",
  "_task_type_install_provisioning_profile_with_display_name": "安裝佈建描述檔：%@1",

  /* This is the message for the Browser Outdated error. */
  "_browser_outdated_message": "需要較新的瀏覽器",

  /* This is the description for the Browser Outdated error. */
  "_browser_outdated_description": "需要較新的瀏覽器才能執行「描述檔管理程式」。",

  /* This is the cancel button for the Browser Outdated error. */
  "_browser_outdated_cancel": "取消",

  /* This is the helper text shown when the item list for a Library Item is loading. The wildcard will be replaced with the name of the selected sidebar item, for example Users. */
  "_item_list_loading": "正在載入「%@1」⋯",

  /* This is the message for the Save Changes Conflict warning. */
  "_save_changes_conflict_message": "儲存衝突",

  /* This is the description for the Save Changes Conflict warning. */
  "_save_changes_conflict_description": "此項目從您上一次編輯之後已經被修改過了。您要覆寫這些更動嗎？覆寫更動之後無法還原。",

  /* This is the cancel button for the Save Changes Conflict warning. It has no action. */
  "_save_changes_conflict_cancel": "取消",

  /* This is the overwrite button for the Save Changes Conflict warning. It will overrite any remote changes. */
  "_save_changes_conflict_overwrite": "覆寫",

  /* The profile is available for installation on this device, but is not currently installed. It is a manual download profile. */
  "_combined_profile_available_for_install": "可用於安裝",

  /* This is for profiles installed on Devices whose owners are not authorized for the Manual Profile in question, or the profile is no longer being maintained by the server. This is for manual profiles. */
  "_combined_profile_not_authorized": "未經授權",

  /* This is the name and version of an installed application. %@1 will become the name of the Application and %@2 will become the Version string of the Application. */
  "_installed_application_name_and_version": "%@1 %@2",

  /* This is the cancel button for the Email Profile to Recipients Confirmation. */
  "_email_profile_to_recipients_cancel": "取消",

  /* This is the message for the Selected Item was Destroyed and Unsaved Changes Lost error. */
  "_selected_item_was_destroyed_unsaved_changes_lost_message": "已刪除所選項目",

  /* This is the description for the Selected Item was Destroyed and Unsaved Changes Lost error. */
  "_selected_item_was_destroyed_unsaved_changes_lost_description": "未儲存的更動將會遺失。",

  /* This is the label for the Add Recipients Picker. The wildcard will be replaced with the type of Recipients being added. */
  "_add_members_label_view_value": "加入 %@1",

  /* This is the Save button for the Show Save Changes Confirmation alert. */
  "_show_save_changes_confirmation_save_button": "儲存",

  /* This is the Configure button shown when there are No Settings for the Selected Setting Type. */
  "_no_settings_configure_button": "設定",

  /* This is the Message shown when there are no Setting Instances for the Selected Setting Type. */
  "_no_settings_configure_message": "設定「%@1」",

  /* This is the generic description for Setting Types when one has not been provided. */
  "_generic_setting_type_description": "使用此部分來設定「%@1」。",

  /* This is the secondary information for the General knobset */
  "_setting_type_secondary_information_general_knobset": "強制",

  /* This is the secondary information for a Setting Type which has multiple payloads configured. */
  "_setting_type_secondary_information_multiple_configured": "已設定 %@1 個承載資料",

  /* This is the secondary information for a Setting Type which has multiple payloads configured. */
  "_setting_type_secondary_information_one_configured": "已設定 1 個承載資料",

  /* This is the secondary information for a Setting Type which has no payloads configured. */
  "_setting_type_secondary_information_not_configured": "尚未設定",

  /* This is the Push Settings type of Task. Push Settings is performed automatically whenever a Managed Configuration Profile is Saved. */
  "_task_type_push_settings": "推播設定",
  "_task_type_push_settings_with_display_name": "推播設定：%@1",

  /* This is the message shown when closing the Admin while there are unsaved changes. */
  "_admin_before_unload_unsaved_changes_will_be_lost": "未儲存的更動都將遺失。",

  /* This is the message when the Admin is closed while there is network activity in progress. */
  "_admin_before_unload_network_activity_in_progress": "網路活動進行中。",

  /* This is the status for tasks that failed. */
  "_task_failed": "失敗",
  "_task_succeeded": "成功",
  "_task_no_devices": "沒有裝置",

  /* Library item tasks secondary information */
  "_task_1_failed": "%@1 個已失敗",
  "_task_many_failed": "%@1 個已失敗",

  "_task_1_cancelled": "%@1 個已取消",
  "_task_many_cancelled": "%@1 個已取消",

  "_task_1_succeeded": "%@1 個已成功",
  "_task_many_succeeded": "%@1 個已成功",

  "_task_1_cancelled_1_failed": "%@1 個已取消，%@2 個已失敗",
  "_task_many_cancelled_1_failed": "%@1 個已取消，%@2 個已失敗",
  "_task_1_cancelled_many_failed": "%@1 個已取消，%@2 個已失敗",
  "_task_many_cancelled_many_failed": "%@1 個已取消，%@2 個已失敗",

  "_task_1_succeeded_1_cancelled": "%@1 個已成功，%@2 個已取消",
  "_task_many_succeeded_1_cancelled": "%@1 個已成功，%@2 個已取消",
  "_task_1_succeeded_many_cancelled": "%@1 個已成功，%@2 個已取消",
  "_task_many_succeeded_many_cancelled": "%@1 個已成功，%@2 個已取消",

  "_task_1_succeeded_1_failed": "%@1 個已成功，%@2 個已失敗",
  "_task_many_succeeded_1_failed": "%@1 個已成功，%@2 個已失敗",
  "_task_1_succeeded_many_failed": "%@1 個已成功，%@2 個已失敗",
  "_task_many_succeeded_many_failed": "%@1 個已成功，%@2 個已失敗",

  "_task_1_succeeded_1_cancelled_1_failed": "%@1 個已成功，%@2 個已取消，%@3 個已失敗",
  "_task_many_succeeded_1_cancelled_1_failed": "%@1 個已成功，%@2 個已取消，%@3 個已失敗",
  "_task_1_succeeded_many_cancelled_1_failed": "%@1 個已成功，%@2 個已取消，%@3 個已失敗",
  "_task_1_succeeded_1_cancelled_many_failed": "%@1 個已成功，%@2 個已取消，%@3 個已失敗",
  "_task_many_succeeded_many_cancelled_1_failed": "%@1 個已成功，%@2 個已取消，%@3 個已失敗",
  "_task_1_succeeded_many_cancelled_many_failed": "%@1 個已成功，%@2 個已取消，%@3 個已失敗",
  "_task_many_succeeded_1_cancelled_many_failed": "%@1 個已成功，%@2 個已取消，%@3 個已失敗",
  "_task_many_succeeded_many_cancelled_many_failed": "%@1 個已成功，%@2 個已取消，%@3 個已失敗",

  "_task_1_of_2_in_progress": "%@1/%@2 進行中",

  "_task_1_of_2_in_progress_1_failed": "%@1∕%@2 進行中；%@3 個已失敗",
  "_task_1_of_2_in_progress_many_failed": "%@1∕%@2 進行中；%@3 個已失敗",

  "_task_1_of_2_in_progress_1_cancelled": "%@1/%@2 進行中；%@3 個已取消",
  "_task_1_of_2_in_progress_many_cancelled": "%@1/%@2 進行中；%@3 個已取消",

  "_task_1_of_2_in_progress_1_succeeded": "%@1∕%@2 進行中；%@3 個已成功",
  "_task_1_of_2_in_progress_many_succeeded": "%@1∕%@2 進行中；%@3 個已成功",

  "_task_1_of_2_in_progress_1_cancelled_1_failed": "%@1/%@2 進行中；%@3 個已取消，%@4 個已失敗",
  "_task_1_of_2_in_progress_many_cancelled_1_failed": "%@1/%@2 進行中；%@3 個已取消，%@4 個已失敗",
  "_task_1_of_2_in_progress_1_cancelled_many_failed": "%@1/%@2 進行中；%@3 個已取消，%@4 個已失敗",
  "_task_1_of_2_in_progress_many_cancelled_many_failed": "%@1/%@2 進行中；%@3 個已取消，%@4 個已失敗",

  "_task_1_of_2_in_progress_1_succeeded_1_cancelled_1_failed": "%@1/%@2 進行中；%@3 個已成功，%@4 個已取消，%@5 個已失敗",
  "_task_1_of_2_in_progress_1_succeeded_1_cancelled_many_failed": "%@1/%@2 進行中；%@3 個已成功，%@4 個已取消，%@5 個已失敗",
  "_task_1_of_2_in_progress_1_succeeded_many_cancelled_1_failed": "%@1/%@2 進行中；%@3 個已成功，%@4 個已取消，%@5 個已失敗",
  "_task_1_of_2_in_progress_many_succeeded_1_cancelled_1_failed": "%@1/%@2 進行中；%@3 個已成功，%@4 個已取消，%@5 個已失敗",
  "_task_1_of_2_in_progress_1_succeeded_many_cancelled_many_failed": "%@1/%@2 進行中；%@3 個已成功，%@4 個已取消，%@5 個已失敗",
  "_task_1_of_2_in_progress_many_succeeded_many_cancelled_1_failed": "%@1/%@2 進行中；%@3 個已成功，%@4 個已取消，%@5 個已失敗",
  "_task_1_of_2_in_progress_many_succeeded_1_cancelled_many_failed": "%@1/%@2 進行中；%@3 個已成功，%@4 個已取消，%@5 個已失敗",
  "_task_1_of_2_in_progress_many_succeeded_many_cancelled_many_failed": "%@1/%@2 進行中；%@3 個已成功，%@4 個已取消，%@5 個已失敗",

  "_task_1_of_2_in_progress_1_succeeded_1_failed": "%@1∕%@2 進行中；%@3 個已成功，%@4 個已失敗",
  "_task_1_of_2_in_progress_many_succeeded_1_failed": "%@1∕%@2 進行中；%@3 個已成功，%@4 個已失敗",
  "_task_1_of_2_in_progress_1_succeeded_many_failed": "%@1∕%@2 進行中；%@3 個已成功，%@4 個已失敗",
  "_task_1_of_2_in_progress_many_succeeded_many_failed": "%@1∕%@2 進行中；%@3 個已成功，%@4 個已失敗",

  "_task_1_of_2_in_progress_1_succeeded_1_cancelled": "%@1/%@2 進行中；%@3 個已成功，%@4 個已取消",
  "_task_1_of_2_in_progress_many_succeeded_1_cancelled": "%@1/%@2 進行中；%@3 個已成功，%@4 個已取消",
  "_task_1_of_2_in_progress_1_succeeded_many_cancelled": "%@1/%@2 進行中；%@3 個已成功，%@4 個已取消",
  "_task_1_of_2_in_progress_many_succeeded_many_cancelled": "%@1/%@2 進行中；%@3 個已成功，%@4 個已取消",

  /* This is the User/User Group access state for when they can Enable Remote Management. */
  "_access_state_binding_access": "可以啟用遠端管理",

  // KNOB SET ADD STEP 2b
  /*  */
  "_ad_cert_knob_set_description": "使用此部分來定義「Active Directory 憑證」的設定。",

  /*  */
  "_scep_knob_set_description": "使用此部分來定義從 SCEP 伺服器取得憑證的設定。",

  /*  */
  "_cfprefs_knob_set_description": "使用此部分來定義通用的偏好設定。",

  /*  */
  "_passcode_knob_set_description": "使用此部分來指定在裝置上執行的密碼規則。",

  /*  */
  "_general_knob_set_description": "使用此部分來定義「一般」的設定。",

  /*  */
  "_certificate_knob_set_description": "使用此部分來指定您要在裝置上安裝的 PKCS1 和 PKCS12 憑證。加入您要使用的憑證，以及其他用以認證裝置來連接網路所需的憑證。",

  /*  */
  "_cal_dav_knob_set_description": "使用此部分來定義 CalDAV 伺服器的連線設定。",

  /*  */
  "_software_update_knob_set_description": "使用此部分來定義「軟體更新」的設定。",

  /*  */
  "_ichat_knob_set_description": "使用此部分來指定「訊息」的設定。",

  /*  */
  "_directory_knob_set_description": "使用此部分來定義「目錄」的設定。",

  /*  */
  "_privacy_knob_set_description": "使用此部分來定義「安全性與隱私」的設定。",

  /*  */
  "_exchange_knob_set_description": "使用此部分來定義 Exchange 伺服器的連線設定。",

  /*  */
  "_web_clip_knob_set_description": "使用此部分來設定 Web Clip。",

  /*  */
  "_email_knob_set_description": "使用此部分來定義 POP 或 IMAP 帳號的連線設定。",

  /*  */
  "_subscribed_calendar_knob_set_description": "使用此部分來定義行事曆訂閱的設定。",

  /*  */
  "_vpn_knob_set_description": "使用此部分來設定裝置如何透過 VPN 來連接您的無線網路，包含必要的認證資訊。",

  /*  */
  "_card_dav_knob_set_description": "使用此部分來定義 CardDAV 伺服器的連線設定。",

  /*  */
  "_ldap_knob_set_description": "使用此部分來定義 LDAP 伺服器的連線設定。",

  /*  */
  "_restrictions_knob_set_description": "使用此部分來限制使用者可取得哪些 App、裝置功能和媒體內容。",

  /*  */
  "_mac_restrictions_knob_set_description": "使用此部分來指定與 App 和內容限制相關的設定。（一旦安裝了描述檔之後，使用者便無法在其裝置上修改這些設定。）",

  /* Global HTTP Proxy knob set description that shows above the configure button */
  "_global_http_proxy_knob_set_description": "使用此部分以設定來自裝置的所有 HTTP 流量將會通過哪一個代理伺服器。這些設定只會影響監管的裝置。",

  /* Application Lock knob set description that shows above the configure button */
  "_app_lock_knob_set_description": "使用此部分來指定裝置應鎖定至哪一個 App。此設定只會影響監管的裝置。",

  /*  */
  "_interface_knob_set_description": "使用此部分來定義「介面」的設定。",

  /*  */
  "_printing_knob_set_description": "使用此部分來定義「列印」的設定。",

  /*  */
  "_dock_knob_set_description": "使用此部分來定義 Dock 的設定。",

  /*  */
  "_mobility_knob_set_description": "使用此部分來定義「行動能力」和「可攜式個人專屬目錄」的設定。",

  /*  */
  "_apn_knob_set_description": "使用此部分來指定進階設定，例如電信業者「連接點名稱」（APN）。（這些設定只能由受過訓練的專業人員來管理。）",

  /*  */
  "_energy_saver_knob_set_description": "使用此部分來定義「能源節約器」的設定。",

  /*  */
  "_parental_controls_knob_set_description": "使用此部分來定義「分級保護控制」的設定。",

  /* This is the separator in the sidbear that appears if there are any Enrollment Profiles. */
  "_auto_join_profiles_tree_item": "登記描述檔",

  /* This is a popup menu item in the sidebar's add button popup. It creates a new Enrollment Profile. */
  "_new_auto_join_profile": "登記描述檔",

  /* This is the default name of newly created Enrollment Profiles */
  "_default_auto_join_profile_name": "新增登記描述檔",

  /* This action downloads the Enrollment Profile so that it can be used to auto-join devices. */
  "_save_auto_join_profile_to_disk": "將登記描述檔儲存到磁碟上",

  /* This is the name of a temporary device. The wildcard will be filled in with a unique identifier for the Device, such as serial number, UDID, or IMEI. */
  "_admin_device_name_temporary_device": "暫時：%@1",

  /* This is the Settings tab for Enrollment Profiles. */
  "_auto_join_profile_settings": "設定",

  /* This is the Usage tab for Enrollment Profiles. */
  "_auto_join_profile_usage": "使用情況",

  /* This shows up in the Settings tab of Enrollment Profiles. */
  "_info_auto_join_security_title": "安全性",

  /* This shows up in the Settings tab of Enrollment Profiles. */
  "_info_auto_join_security_paragraph": "若要增進安全性，可將此描述檔的使用限制為資料庫中具備暫存區的已有裝置。",

  /* This is the checkbox found in the Settings tab of Enrollment Profiles. */
  "_info_auto_join_restrict_use_checkbox": "限制裝置使用暫存區",

  /* This is the download button in the toolbar for Enrollment Profiles. */
  "_download_auto_join_profile": "下載",

  /* HERE IS WHERE THE LOGIN BEHAVIOR KNOB SET DESCRIPTION GOES */
  "_login_item_knob_set_description": "使用此部分來指定在登入時執行項目的設定",

  /* HERE IS WHERE THE LOGIN WINDOW KNOB SET DESCRIPTION GOES */
  "_login_window_knob_set_description": "使用此部分來指定「登入視窗」的執行方式和外觀設定",

  /* This is the description inside the Usage tab for Enrollment Profiles. */
  "_usage_auto_join_description": "下列裝置是使用此描述來登入",

  /* This is the secondaryInformation for Enrollment Profiles where the Enrollment Profile was used one time. */
  "_auto_join_profile_secondary_information_one_time": "已使用 1 次 - 上一次使用時間：%@1",

  /* This is the secondaryInformation for Enrollment Profiles. The first wildcard specifies the number of times the profile was used. The second wildcard is replaced with the last time it was used. */
  "_auto_join_profile_secondary_information": "已使用 %@1 次 - 上一次使用時間：%@2",

  /* This is the secondaryInformation for Enrollment Profiles that have never been used. */
  "_auto_join_profile_secondary_information_zero_times": "已使用 0 次",

  /* This is the reload button for the Client Error Occurred alert. */
  "_client_error_occurred_reload_button": "重新載入",

  /* This is the reload button for the Server Timed Out Error. */
  "_server_timed_out_reload_button": "重新載入",

  /* This is the reload button for the Server Not Available error. */
  "_server_not_available_reload_button": "重新載入",

  /* This is the reload button for the Server Error Occurred alert. */
  "_server_error_occurred_reload_button": "重新載入",

  /* This is the reload button for the Server Not Found error. */
  "_server_not_found_reload_button": "重新載入",

  /* This is the reload button for the Network Not Available error. */
  "_network_not_available_reload_button": "重新載入",

  /* This is the description shown when showing the Save Changes Confirmation alert if the selected item is a Library Item. */
  "_show_save_changes_confirmation_description_for_library_item": "這樣可能會導致設定內容推播到裝置上。",

  /* This is a temporary explanation of the wall block on Setting payloads that were provided by Server.app. */
  "_temporary_knob_set_wall_block_explanation": "由 Server.app 提供",

  /* This is the URL that the help button will go to. */
  "_go_to_help_url": "https://help.apple.com/profilemanager/mac/3.1/",
  "_devices_help_url": "https://help.apple.com/profilemanager/mac/3.1/#apdCBDB5496-B0DD-41DF-BD85-C5B6A7977C4A",
  "_restrictions_help_url": "https://help.apple.com/profilemanager/mac/3.1/#apdE3C2931F-CD48-46C8-AAC6-C34F5D9AEB54",

  /* This is the Add All button in the Members Picker. It adds all items. */
  "_members_picker_add_all_button": "加入全部",

  /* This is the Add Results button in the Members Picker sheet that adds all search results. */
  "_members_picker_add_results_button": "加入結果",

  /* There are various Continue buttons in the Admin. */
  "_generic_continue_button": "繼續",

  /* This is the About Root Item for General info. */
  "_general_about_root_item": "一般",

  /* This is the label when Adding a Device to Profile Manager. */
  "_add_device_label_view_value": "加入裝置",

  "_add_device_Bonjour Device ID:": "Bonjour 裝置識別碼：",
  "_add_device_Airplay Password:": "Airplay 密碼：",

  "_add_device_pane_width": "480",
  "_add_device_label_width": "140",
  "_add_device_apple_tv_help_description_height": "75",

  "_general_about_Airplay": "AirPlay",
  "_general_about_Password": "密碼",
  "_general_about_no password set": "未設定密碼",
  "_general_Bonjour Device ID": "Bonjour 裝置識別碼",
  "_general_MAC:": "MAC：",
  "_general_about_MAC_Address_Placeholder": "00:00:00:00:00:00",

  "_generic_string_The Bonjour Device ID can be found by navigating to Settings > General > About on your Apple TV and pressing up on your remote until it is displayed. The AirPlay password is used in the configuration of AirPlay Mirroring settings when this device is added as an allowed AirPlay destination.": "您可以在 Apple TV 上選擇「設定」>「一般」>「關於本機」來找到「Bonjour 裝置識別碼」，請按下遙控器上的按鈕直至它顯示為止。當裝置加入為允許 AirPlay 目標時，AirPlay 密碼是用於「AirPlay 鏡像輸出」的設定。",

  "_generic_string_Known AirPlay Destinations": "已知的 AirPlay 目標",

  /* This is the About Root Item for Details; typically additional information that doesn't fit in General. */
  "_details_about_root_item": "詳細資訊",

  /* This is the About Root Item for Security. */
  "_security_about_root_item": "安全性",

  /* This is the Security field for General Settings. */
  "_general_knob_set_view_security_field": "安全性",

  /* This is the Security field for General Settings. */
  "_general_knob_set_view_automatic_profile_removal_field": "自動移除描述檔",

  /* This is the About Root Item for the parent Device Groups. */
  "_groups_in_about_root_item_in_device_groups": "在裝置群組中",

  /* This is the About Root Item for parent User Groups. */
  "_groups_in_about_root_item_in_user_groups": "在群組中",

  /* This is the About Root Item for Certificates. */
  "_certificates_about_root_item": "憑證",

  // About page Permissions
  "_permissions_string_Restrictions": "限制",
  "_permissions_string_Allow access to My Devices Portal (https://<hostname>/mydevices)": "允許連接「我的裝置入口頁面」（https://%@1/mydevices）",
  "_permissions_string_Allow configuration profile downloads": "允許下載設定描述檔",
  "_permissions_string_Allow device enrollment and unenrollment": "允許登記和取消登記裝置",
  "_permissions_string_Allow device lock": "允許裝置鎖定",
  "_permissions_string_Allow device wipe": "允許清除裝置",
  "_permissions_string_Allow device passcode to be cleared": "允許清除裝置密碼",
  "_permissions_string_Allow device enrollment during Setup Assistant": "允許在執行「設定輔助程式」時登記裝置",
  "_permissions_string_Restrict enrollment to assigned devices": "限制登記已指定的裝置",
  "_permissions_string_Restrict enrollment to placeholder devices": "限制登記暫存區裝置",
  "_permissions_string_Learn about restrictions": "瞭解限制",

  /* This is the Provisioning Profiles tree item, shown in the sidebar as a grouping. */
  "_provisioning_profiles_tree_item": "佈建描述檔",

  /* This is the Sidebar Item for Devices, shown under LIBRARY. */
  "_devices_sidebar_item_display_name": "裝置",

  /* This is the Devices tab. */
  "_tabs_devices_tab": "裝置",

  /* This is the Settings tab. */
  "_tabs_settings_tab": "設定",

  /* This is the Info tab. */
  "_tabs_info_tab": "資訊",

  /* This is the Books tab */
  "_tabs_books_tab": "書籍",

  /* This is the About tab. */
  "_tabs_about_tab": "關於",

  /* This is the Profiles tab. */
  "_tabs_profiles_tab": "描述檔",

  /* This is the Members tab. */
  "_tabs_members_tab": "成員",

  /* This is the Activity tab. */
  "_tabs_activity_tab": "活動",
  "_tabs_apps_tab": "應用程式",

  /* This is the tab shown when the tabs are loading. */
  "_tabs_loading_tab": "正在載入⋯",

  /* This is the Sidebar Item for Users, located under LIBRARY. */
  "_users_sidebar_item_display_name": "使用者",

  /* This is the part of the Title of the Window Document Title when an Enrollment Profile is selected. */
  "_window_document_title_sidbear_auto_join_profile": "登記描述檔",

  /* This is the unique identifier popup entry for IMEI in the Add Device Sheet. */
  "_add_device_identifier_imei": "IMEI",

  /* This is the unique identifier popup entry for MEID in the Add Device Sheet. */
  "_add_device_identifier_meid": "MEID",

  /* This is the unique identifier popup entry for Serial Number in the Add Device Sheet. */
  "_add_device_identifier_serial_number": "序號",

  /* This is the unique identifier popup entry for UDID in the Add Device Sheet. */
  "_add_device_identifier_udid": "UDID",

  /* The hint in text fields where the field is required. */
  "_hint_required": "必須",

  /* This is the name label for the Add Device sheet. */
  "_add_device_name_label": "名稱：",

  /* This appears on an iPad when it is in vertical mode. */
  "_temporary_ipad_vertical_mode_blocker_label": "旋轉您的 iPad 來使用「描述檔管理程式」。",

  /* This is the menu item to create a new Provisioning Profile. */
  "_new_provisioning_profile": "佈建描述檔",

  /* This shows up when nothing is selected in the sidebar. */
  "_no_item_view_nothing_selected": "未選取任何物件",

  /* This shows up when searching and nothing was found for the selected sidebar item. The wildcard is replaced with the name of the selected sidebar item. */
  "_no_item_view_no_somethings_found": "找不到「%@1」",

  /* This shows up when there is none of the thing selected in the sidebar. The wildcard is replaced with the name of the selected sidebar item. */
  "_no_item_view_no_somethings": "無「%@1」",

  /* This is the menu item to add Devices. */
  "_add_recipients_add_devices": "加入裝置",

  /* This is the menu item to add User Groups. */
  "_add_recipients_add_user_groups": "加入群組",

  /* This is the menu item to add Users. */
  "_add_recipients_add_users": "加入使用者",

  /* This is the menu item to add Device Groups. */
  "_add_recipients_add_device_groups": "加入裝置群組",

  /* This is the hint for search boxes that filter things. */
  "_filter_hint": "過濾",

  /*  */
  "_import_placeholder_devices": "輸入暫存區",

  /*  */
  "_add_placeholder_device": "加入暫存區",

  /*  */
  "_import_placeholder_devices_error_cancel": "取消",

  /*  */
  "_import_placeholder_devices_imported_one_device": "已輸入 1 個裝置暫存區",

  /*  */
  "_import_placeholder_devices_error_headers_not_found": "找不到標頭。",

  /*  */
  "_import_placeholder_devices_imported_n_devices": "已輸入 %@1 個裝置暫存區",

  /*  */
  "_import_placeholder_devices_error_non_csv": "檔案不是 CSV。",

  /*  */
  "_import_placeholder_devices_error_unknown": "未知的錯誤。",

  /*  */
  "_import_placeholder_devices_error_occurred": "嘗試輸入暫存區時發生錯誤",

  /*  */
  "_import_placeholder_devices_successful": "成功輸入暫存區",

  /*  */
  "_import_placeholder_devices_error_no_valid_devices": "沒有有效的暫存區。",

  /*  */
  "_import_placeholder_devices_not_imported_one_device": "未輸入 1 列。",

  /*  */
  "_import_placeholder_devices_not_imported_n_devices": "未輸入 %@1 列。",

  /*  */
  "_import_placeholder_devices_error_csv_invalid": "CSV 無效。",

  /* This is shown if there are mac(s) that are incompatible with the task type. */
  "_new_task_1_mac_will_not_apply_to": "這不會套用到 1 部 Mac 上。",

  /* This is shown if there are mac(s) that are incompatible with the task type. */
  "_new_task_n_macs_will_not_apply_to": "這不會套用到 $@1 部 Mac 上。",

  /*  */
  "_new_task_the_n_ios_devices_can_be_unlocked": "無法使用現有的密碼來鎖定 %@1 個 iOS 裝置。",

  /*  */
  "_new_task_the_1_ios_device_can_be_unlocked": "無法使用現有的密碼來鎖定 1 個 iOS 裝置。",

  /*  */
  "_new_task_enter_a_passcode_for_1_mac_os_x_device": "輸入密碼，稍後可用於解鎖 1 個 OS X 裝置。",

  /*  */
  "_new_task_enter_a_passcode_for_n_mac_os_x_devices": "輸入密碼，稍後可用於解鎖 %@1 個 OS X 裝置。",

  /*  */
  "_new_task_reenter_the_passcode": "重新輸入密碼",

  /*  */
  "_new_task_passcodes_did_not_match_warning": "密碼不符",

  /*  */
  "_new_task_cancel": "取消",

  /*  */
  "_new_task_ok": "好",

  /*  */
  "_new_task_this_command_only_applies_to_ios_devices": "此指令只會套用至 iOS 裝置。",

  /*  */
  "_new_task_you_must_select_one_or_more_devices": "執行這個指令之前，您必須選擇一或多部裝置。",

  /*  */
  "_new_task_no_devices_ok_button_view": "好",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Don't Allow TV Shows": "不允許電視節目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Credential for authenticating the ActiveSync account": "用以認證 ActiveSync 帳號的憑證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 day": "1 天",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Credential for authenticating the connection": "用以認證連線的憑證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Screenshot": "允許螢幕快照",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password for the outgoing mail server": "寄件伺服器的密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Safari Allow Popups": "Safari 允許彈出式項目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_IMEI": "IMEI",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Shared secret for the connection": "連線的共享密鑰",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add": "加入",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%@1 Members": "%@1 個成員",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Maximum Auto-Lock": "最長自動鎖定時間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Requires passcode to contain at least one letter": "密碼必須至少包含一個字母",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The CalDAV password": "CalDAV 密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Company Account": "我的郵件帳號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Proxy Server and Port": "代理伺服器和傳輸埠",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Include User PIN": "包含使用者 PIN",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add Users": "加入使用者",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Wireless network encryption to use when connecting": "在連接時所使用的無線網路加密",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Save...": "儲存⋯",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Days after which the passcode must be changed": "必須更改密碼的天數",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Internal Server Path": "內部伺服器路徑",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Identification of the wireless network to connect to": "要連接之無線網路的識別身分",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Explicit Content": "允許不適當內容",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Display name of the account": "帳號的顯示名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_18+": "18+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication type for connection": "連線的認證類型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Camera": "允許攝影機",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Proxy Server URL": "代理伺服器 URL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Proxy PAC URL": "代理伺服器 PAC URL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow In-App Purchase": "允許 App 內建購買功能",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow In-App Purchases": "允許 App 內建購買功能",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PIN History": "PIN 總覽",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MA": "MA",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User Group": "群組",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Configures proxies to be used with this VPN connection": "設定要用於此 VPN 連線的代理伺服器",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Group identifier for the connection": "連線的群組識別碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_POP": "POP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_This profile has %@1 errors": "此描述檔有 %@1 個錯誤",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow All Apps": "允許所有 App",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The display name of the account": "帳號的顯示名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 week": "1 週",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_This profile has 1 error": "此描述檔有 1 個錯誤",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_RSA SecurID": "RSA 安全識別碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Maximum passcode age (1-730 days, or none)": "最長密碼使用期限（1-730 天或無期限）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Modem": "數據機",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Network": "網路",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable Secure Socket Layer communication with chat server": "啟用與聊天伺服器的「安全編碼傳輸」通訊",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Last Checkin Time": "上次登記時間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_R18+": "R18+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Name": "帳號名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Number of unique passcodes before reuse": "重新使用前的獨有密碼數量",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Permit the use of repeating, ascending, and descending character sequences": "允許使用重複、升冪和降冪的字元順序",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Delete": "刪除",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_18A": "18A",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access": "連線",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The hostname of the directory server": "目錄伺服器的主機名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow All Movies": "允許所有影片",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 hour": "1 小時",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Voice Dialing": "允許語音撥號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The CardDAV username": "CardDAV 使用者名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Display name of the connection (displayed on the device)": "連線的顯示名稱（顯示於裝置上）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Retrieve incoming mail through secure socket layer": "透過安全編碼傳輸取得內送郵件",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow iTunes": "允許 iTunes",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Description": "帳號描述",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Force Encrypted Backup": "強制加密的備份",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Force limited ad tracking": "強制限制廣告追蹤",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Username used to connect to the proxy": "用以連接代理伺服器的使用者名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_IMAP": "IMAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ireland": "愛爾蘭",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No Devices Found For Task Caption": "找不到作業標題的裝置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Passcode history (1-50 passcodes, or none)": "密碼總覽（1-50 個密碼或不限制）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Type": "類型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The users and groups that cannot login at this computer": "無法登入此電腦的使用者和群組",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Search Base": "搜尋基準",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_New Device Group": "新增裝置群組",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Auto Sync while Roaming": "允許漫遊時自動同步",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User Display Name": "使用者顯示名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Safari Accept Cookies": "Safari 接受 Cookie",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_5 minutes": "5 分鐘",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access Point Password": "連接點密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password for this LDAP Account": "此 LDAP 帳號的密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Shared Secret": "共享的密鑰",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_This configuration profile has no recipents, it will not be distributed": "設定描述檔沒有收件人，將不會發佈",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use SSL for External Exchange Host": "在外部 Exchange 主機上使用 SSL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable VPN on Demand": "啟用隨選即用 VPN",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable VPN on Demand (OS X only)": "啟用隨選即用 VPN（僅 OS X）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hostname or IP address, and port number for outgoing mail": "主機名稱或 IP 位址，以及寄件的埠號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Window": "視窗",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. Movie Rating": "最大影片分級",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Server Address and Port": "伺服器位址與傳輸埠",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 Member": "1 個成員",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication type for the connection": "連線的認證類型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use SSL": "使用 SSL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Group": "群組",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_email": "電子郵件",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The display name of the user (e.g. \"John Appleseed\")": "使用者的顯示名稱（例如「John Appleseed」）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_HTTP MD5 Digest": "HTTP MD5 摘要",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Available Capacity": "可用空間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The URL of the calendar file": "行事曆檔案的 URL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The username for this LDAP Account": "此 LDAP 帳號的使用者名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Maximum number of failed attempts": "嘗試失敗的最大數",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Group Name": "群組名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Description": "描述",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name for the Exchange ActiveSync account": "Exchange ActiveSync 帳號的名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Hostname": "帳號主機名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The chat protocol to use for this configuration": "此設定所使用的聊天通訊協定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV-Y": "TV-Y",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Japan": "日本",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Don\'t Delete": "不要刪除",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV-G": "TV-G",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Realm for authenticating the connection": "用以認證連線的領域",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The username used to connect to the server for outgoing mail": "用以連接寄件伺服器的使用者名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Password used to authenticate with the proxy": "用以認證代理伺服器的密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Subtree": "子樹狀結構",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV-14": "TV-14",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_GA": "GA",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_RP16": "RP16",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_12A": "12A",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Safari Force Fraud Warning": "Safari 強制詐騙警告",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Outgoing Mail": "外寄郵件",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Scope": "範圍",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Type": "帳號類型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User Authentication": "使用者認證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access Point Name (APN)": "連接點名稱（APN）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Base": "基本",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Safari": "允許 Safari",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The users and groups that can login at this computer": "可以登入此電腦的使用者和群組",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Don't Allow Movies": "不允許影片",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Minimum passcode length": "最短密碼長度",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_URL": "URL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The Principal URL for the CalDAV account": "CalDAV 帳號的主要 URL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The username used to connect to the server for incoming mail": "用以連接收件伺服器的使用者名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Longest auto-lock time available to the user": "使用者可設定的最長自動鎖定時間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Model Number": "機型型號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Username": "帳號使用者名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hidden Network": "隱藏的網路",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Done": "完成",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Expires: ": "到期日：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_R-15": "R-15",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The LDAP hostname or IP address": "LDAP 主機名稱或 IP 位址",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt user for password on the device": "在裝置上提示使用者輸入密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_R-18": "R-18",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Software Update server": "軟體更新伺服器",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password for this subscription": "此訂閱項目的密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_New Device": "增新裝置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Routes all network traffic through the VPN connection": "透過 VPN 連線遞送所有網路流量",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_WPA / WPA2": "WPA/WPA2",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use Kerberos v5 for authentication": "使用 Kerberos v5 認證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Role": "角色",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Login Group or Domain for the connection": "登入群組或網域以連線",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Login Group or Domain": "登入群組或網域",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SonicWALL": "SonicWALL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SonicWALL Mobile Connect": "SonicWALL Mobile Connect",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Aruba VIA": "Aruba VIA",

  /* This is the width of the Connection Type popup button in the VPN payload editor */
  "_layout_vpn_connection_type_button_width": "200",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Serial Number": "序號",

  /* This is a generic string used one or more times in the app. */
  "_global_http_proxy_type_Automatic": "自動",
  "_network_proxy_type_Automatic": "自動",
  "_vpn_data_encryption_level_Automatic": "自動",
  "_vpn_proxy_type_Automatic": "自動",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The description of the calendar subscription": "行事曆訂閱的描述",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The CardDAV password": "CardDAV 密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PG-13": "PG-13",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PG-12": "PG-12",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Always": "總是",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Caution": "注意",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The image file is invalid or too large": "影像檔案無效或太大",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Options": "選項",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_WEP Enterprise": "WEP 企業級",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Username": "使用者名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Longest device lock grace period available to the user": "使用者可設定的裝置鎖定寬限期",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password for the account (e.g. \"MyP4ssw0rd!\")": "帳號的密碼（例如「MyP4ssw0rd!」）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The authentication method for the incoming mail server": "收件伺服器的認證方式",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Simple Passcode": "允許簡易密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Remove": "移除",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_C8": "C8",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My CardDAV Account": "我的聯絡資訊帳號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ICCID": "ICCID",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow simple value": "允許簡易數值",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable Secure Socket Layer communication with CalDAV server": "啟用與 CalDAV 伺服器的「安全編碼傳輸」通訊",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_One Level": "單層",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The manner in which the profile is distributed to devices": "描述檔發佈至裝置的方式",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication Type": "認證類型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SMTP authentication uses the same password as POP/IMAP": "SMTP 認證使用與 POP/IMAP 相同的密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_groupname": "群組名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. Failed Attempts": "嘗試失敗的最大數",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Uc": "Uc",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_From visited sites": "來自瀏覽的網站",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Shared Secret / Group Name": "共享的密鑰/群組名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Group for authenticating the connection": "用以認證連線的群組",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable Secure Socket Layer for this connection": "啟用此連線的「安全編碼傳輸」",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Password": "帳號密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_External Server Path": "外部伺服器路徑",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication": "認證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_, ": "、",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No Members": "沒有成員",
  "_user_group_membership_count_1 Group, No Users": "1 個群組",
  "_user_group_membership_count_%@ Groups, No Users": "%@ 個群組",
  "_user_group_membership_count_No Groups, 1 User": "1 個使用者",
  "_user_group_membership_count_No Groups, %@ Users": "%@ 個使用者",
  "_user_group_membership_count_1 Group, 1 User": "1 個群組，1 個使用者",
  "_user_group_membership_count_%@ Groups, %@ Users": "%@ 個群組，%@ 個使用者",
  "_user_group_membership_count_%@ Groups, 1 User": "%@ 個群組，1 個使用者",
  "_user_group_membership_count_1 Group, %@ User": "1 個群組，%@ 個使用者",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication Credential": "認證憑證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Server path for the external exchange host": "外部 Exchange 主機的伺服器路徑",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Issued by: %@1": "簽發人：%@1",

  /* This is a generic string used one or more times in the app. */
  "_network_proxy_setting_None": "無",
  "_network_security_type_None": "無",
  "_incoming_email_authentication_type_None": "無",
  "_outgoing_email_authentication_type_None": "無",
  "_vpn_encryption_level_None": "無",
  "_vpn_proxy_setting_None": "無",
  "_default_printer_item_None": "無",
  "_scep_subject_alternative_name_type_None": "無",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Device": "裝置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Software Version": "軟體版本",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. TV Shows Rating": "最大電視節目分級",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Carrier Settings Version": "電信業者設定版本",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Password for the account": "帳號的密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The directory server username": "目錄伺服器使用者名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user name to connect to the access point": "用以連接連接點的使用者名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_smtp.example.com": "smtp.example.com",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%m/%d/%y at %i:%M:%S %p": "%y/%m/%d %i:%M:%S %p",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable Secure Socket Layer communication with CardDAV server": "啟用與 CardDAV 伺服器的「安全編碼傳輸」通訊",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Controls when the profile can be removed": "控制何時可以移除描述檔",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_mail.example.com": "mail.example.com",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Automatic Push": "自動推播",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The directory server client ID": "目錄伺服器用戶端識別碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt for Password": "提示輸入密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_OK": "好",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User account for authenticating the connection": "用以認證連線的使用者帳號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use as a System configuration": "做為系統設定（僅 OS X）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_UDID": "UDID",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Safari Allow JavaScript": "Safari 允許 JavaScript",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Hostname and Port": "帳號主機名稱和傳輸埠",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The number of past days of mail to synchronize": "要同步的過去郵件天數",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Current Carrier Network": "現用電信業者網路",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Expires: %A, %B %D, %Y %i:%M:%S %p %Z": "到期日：%A, %B %D, %Y %i:%M:%S %p %Z",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV-MA": "TV-MA",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Path Prefix:": "路徑前置碼：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Smallest number of non-alphanumeric characters allowed": "允許的最少非英數字元數量",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password for the incoming mail server": "收件伺服器的密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_2 minutes": "2 分鐘",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Any (Enterprise)": "任何（企業級）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Microsoft Exchange Server": "Microsoft Exchange Server",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_username": "使用者名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User Name": "使用者名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_usernames": "使用者名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Security Type": "安全類型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_United Kingdom": "英國",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_10": "10",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_11": "11",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_12": "12",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_13": "13",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_14": "14",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_15": "15",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_16": "16",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_18": "18",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication Credential Passphrase": "認證憑證密語",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. Apps Rating": "最大 App 分級",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Min. Complex Char's": "最短複雜字元",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_optional Ex. O=Company Name, CN=Foo": "選用的代號 O=公司名稱，CN=Foo",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require Alphanumeric": "需要英數字元",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication Credential Name": "認證憑證名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_4 minutes": "4 分鐘",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Principal URL": "主要 URL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_set on device": "在裝置上設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The directory server password": "目錄伺服器密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My Subscribed Calendar": "我已訂閱的行事曆",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The Principal URL for the CardDAV account": "CardDAV 帳號的主要 URL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MD5 Challenge-Response": "MD5 Challenge-Response",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User logs in to authenticate the Mac to the network": "使用者登入以認證網路上的 Mac",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ab 18 Jahren": "ab 18 Jahren",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MDM": "MDM",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_12+": "12+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require alphanumeric value": "需要英數數值",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Bluetooth MAC": "藍牙 MAC",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow YouTube": "允許 YouTube",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_United States": "美國",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Server Hostname": "伺服器主機名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The address of the account (e.g. \"john@example.com\")": "帳號的位址（例如「john@company.com」）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MA15+": "MA15+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use Kerberos v5": "使用 Kerberos v5",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The Mac can access the network without a logged-in user": "Mac 不需要已登入的使用者即可連接網路",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Send All Traffic": "傳送所有流量",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Password": "密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Last Edited %A, %B %d, %Y": "上次編輯時間 %A, %B %d, %Y",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The name of the carrier (GPRS) access point": "電信業者（GPRS）連接點的名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The protocol for accessing the email account": "用以取用帳號的通訊協定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add User Groups": "加入群組",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Safari Allow Autofill": "Safari 允許自動填寫",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Loading…": "正在載入⋯",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Connection Type": "連接類型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ask during installation": "在安裝時詢問",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Australia": "澳洲",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My CalDAV Account": "我的行事曆帳號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The device will prompt the user for the passphrase if not given": "若使用者未提供密語，裝置會提示使用者提供密語",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. PIN Age In Days": "最長 PIN 使用期限（以天為單位）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_R18": "R18",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hostname of IP address for server": "伺服器 IP 位址的主機名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Machine Authentication": "機器認證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Outgoing password same as incoming": "寄件密碼與收件密碼相同",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_17+": "17+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_R13": "R13",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ab 12 Jahren": "ab 12 Jahren",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_R15": "R15",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_R16": "R16",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hostname or IP address, and port number for incoming mail": "主機名稱或 IP 位址，以及收件的埠號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_4+": "4+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Encryption Level": "加密層級",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_URL used to retrieve proxy settings": "用以取得代理伺服器設定的 URL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Email Address": "電子郵件位址",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Profile Distribution Type": "描述檔分配類型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Min. Length": "最短長度",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_LDAP Account": "LDAP 帳號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable if target network is not open or broadcasting": "若目標網路未開啟或廣播則啟用",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Scripts": "工序指令",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Service Set Identifier (SSID)": "服務集識別碼（SSID）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Maximum grace period for device lock": "最大裝置鎖定寬限期",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name or description for ActiveSync": "ActiveSync 的名稱或描述",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_France": "法國",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Type of network interface on the device": "裝置上的網路介面類型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The display name of the account (e.g. 'Company LDAP Account')": "帳號的顯示名稱（例如「Company LDAP Account」）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_3 minutes": "3 分鐘",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_2 weeks": "2 週",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_New Configuration Profile": "新增設定描述檔",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Capacity": "容量",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name for the Exchange Web Services account": "Exchange Web Services 帳號的名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Network Interface": "網路介面",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Minimum number of complex characters": "最短複雜字元數量",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The display name of the account (e.g. \"Company Mail Account\")": "帳號的顯示名稱（例如「Company Mail Account」）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The CalDAV username": "CalDAV 使用者名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_defaults to username@host": "username@host 的預設值",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authenticate using secret, name, and server-side certificate": "使用密鑰、名稱和伺服器端憑證進行認證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_mobile": "行動電話",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Machine": "機器",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User": "使用者",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Revert": "回復",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_15 minutes": "15 分鐘",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 minutes": "1 分鐘",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Password for authenticating the connection": "用以認證連線的密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Password for the wireless network": "無線網路的密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PS": "PS",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_-18": "-18",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Search settings for this LDAP server": "此 LDAP 伺服器的搜尋設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_-16": "-16",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Canada": "加拿大",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_-12": "-12",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_-10": "-10",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password to connect to the access point": "用以連接連接點的密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PG": "PG",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_4 hours": "4 小時",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Exchange ActiveSync Host": "Exchange ActiveSync 主機",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Past Days of Mail to Sync": "要同步的過去郵件天數",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow": "允許",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Wi-Fi MAC": "Wi-Fi MAC",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ethernet MAC": "乙太網路 MAC",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV-PG": "TV-PG",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Server": "伺服器",

  /* This is a generic string used one or more times in the app. */
  "_global_http_proxy_type_Manual": "手動",
  "_network_proxy_type_Manual": "手動",
  "_vpn_proxy_type_Manual": "手動",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 month": "1 個月",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Force Passcode": "強制密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use as a Login Window configuration": "做為登入視窗設定（僅 OS X）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow FaceTime": "允許 FaceTime",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Search Settings": "搜尋設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_YA": "YA",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_optional": "可留空",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Save": "儲存",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The printers available to a user": "使用者可用的印表機",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use SSL for Internal Exchange Host": "在內部 Exchange 主機上使用 SSL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Build": "版號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Realm": "領域",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The chat username": "聊天使用者名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Smallest number of passcode characters allowed": "允許的最少密碼字元數量",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Incoming Mail": "傳入郵件",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_NC-17": "NC-17",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_3 days": "3 天",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Any (Personal)": "任何（個人級）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_9+": "9+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PGR": "PGR",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hostname or IP address, and port number for the proxy server": "主機名稱或 IP 位址，以及代理伺服器的埠號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV-Y7": "TV-Y7",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Mail Server and Port": "郵件伺服器和傳輸埠",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Deny": "拒絕",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Retrieve outgoing mail through secure socket layer": "透過安全編碼傳輸取得外寄郵件",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hostname or IP address, and port number for the server": "主機名稱或 IP 位址，以及伺服器的埠號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Proxy Setup": "代理伺服器設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Proxy Type": "代理伺服器類型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Never": "永不",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_--": "--",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_WPA / WPA2 Enterprise": "WPA/WPA2 企業級",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. Inactivity": "最長閒置時間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use Hybrid Authentication": "使用混合認證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sim Carrier Network": "SIM 電信業者密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_NTLM": "NTLM",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The type of connection enabled by this policy": "此規則所啟用的連線類型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Printer List": "印表機列表",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 minute": "1 分鐘",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ab 16 Jahren": "ab 16 Jahren",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Immediately": "立即",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My Account": "我的帳號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Manual Download": "手動下載",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Server path for the internal exchange host": "內部 Exchange 主機的伺服器路徑",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_AV15+": "AV15+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Client ID": "用戶端識別碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Man. Fetch. When Roaming": "Man. Fetch. 漫遊時",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Cancel": "取消",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ab 6 Jahren": "ab 6 Jahren",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_auto": "自動",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Specify a URL of the form http://server.example.com:8088/catalogs.sucatalog": "指定 http://server.example.com:8088/catalogs.sucatalog 的 URL 形式",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Internal Exchange Host": "內部 Exchange 主機",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Role for authenticating the connection": "用以認證連線的角色",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Connection Name": "連線名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Explicit Allowed": "允許的不適當內容",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The CardDAV hostname or IP address and port number": "CardDAV 主機名稱或 IP 位址和埠號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate": "憑證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. Grace Period": "最大寬限期",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Don't Allow Apps": "不允許 App",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ch": "Ch",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ab 0 Jahren": "ab 0 Jahren",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The authentication method for the outgoing mail server": "寄件伺服器的認證方式",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_External Exchange Host": "外部 Exchange 主機",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The CalDAV hostname or IP address and port number": "CalDAV 主機名稱或 IP 位址和埠號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow All TV Shows": "允許所有電視節目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Domain": "網域",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Phone": "電話",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_14+": "14+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Germany": "德國",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_AO": "AO",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Send all communication through secure socket layer": "透過安全編碼傳輸傳送所有通訊",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Domain and host names that will establish a VPN": "將會建立 VPN 的網域和主機名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account": "帳號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_New Zealand": "紐西蘭",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The username for this subscription": "此訂閱項目的使用者名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Number of passcode entry attempts allowed before all data on device will be erased": "在清除裝置上的所有資料之前，允許嘗試輸入密碼的次數",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access Point User Name": "連接點使用者名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User authentication type for the connection": "連線的使用者認證類型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_WEP": "WEP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Level of data encryption applied to the connection": "套用至連線的資料加密層級",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow App Installation": "允許 App 安裝",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_14A": "14A",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Maximum (128-bit)": "最大（128 位元）",

  /*  */
  "_knob_set_from_servermgr_card_dav_hostname": "主機名稱",

  /*  */
  "_knob_set_from_servermgr_card_dav_port": "傳輸埠",

  /*  */
  "_knob_set_from_servermgr_helper": "此承載資料使用了 Server App 來設定",

  /*  */
  "_knob_set_from_servermgr_cal_dav_hostname": "主機名稱",

  /*  */
  "_knob_set_from_servermgr_cal_dav_port": "傳輸埠",

  /*  */
  "_knob_set_from_servermgr_email_group_incoming_mail": "傳入郵件",

  /*  */
  "_knob_set_from_servermgr_email_account_description": "帳號描述",

  /*  */
  "_knob_set_from_servermgr_email_account_type": "帳號類型",

  /*  */
  "_knob_set_from_servermgr_email_incoming_hostname": "郵件伺服器",

  /*  */
  "_knob_set_from_servermgr_email_incoming_port": "傳輸埠",

  /*  */
  "_knob_set_from_servermgr_email_outgoing_ssl": "使用 SSL",

  /*  */
  "_knob_set_from_servermgr_email_outgoing_hostname": "郵件伺服器",

  /*  */
  "_knob_set_from_servermgr_email_group_outgoing_mail": "外寄郵件",

  /*  */
  "_knob_set_from_servermgr_email_incoming_ssl": "使用 SSL",

  /*  */
  "_knob_set_from_servermgr_email_outgoing_port": "傳輸埠",

  /*  */
  "_knob_set_from_servermgr_email_incoming_authentication": "認證類型",

  /*  */
  "_knob_set_from_servermgr_email_outgoing_authentication": "認證類型",

  /*  */
  "_knob_set_from_servermgr_cal_dav_account_description": "帳號描述",

  /*  */
  "_knob_set_from_servermgr_card_dav_account_description": "帳號描述",

  /*  */
  "_knob_set_from_servermgr_cal_dav_ssl": "使用 SSL",

  /*  */
  "_knob_set_from_servermgr_card_dav_ssl": "使用 SSL",

  /*  */
  "_knob_set_from_servermgr_ichat_hostname": "伺服器位址",

  /*  */
  "_knob_set_from_servermgr_ichat_port": "傳輸埠",

  /*  */
  "_knob_set_from_servermgr_ichat_connection_name": "帳號描述",

  /*  */
  "_knob_set_from_servermgr_ichat_connection_type": "帳號類型",

  /*  */
  "_knob_set_from_servermgr_passcode_required": "在裝置上需要密碼",

  /*  */
  "_knob_set_from_servermgr_passcode_allow_simple": "允許簡易數值",

  /*  */
  "_knob_set_from_servermgr_passcode_min_length": "最短密碼長度",

  /*  */
  "_knob_set_from_servermgr_passcode_require_alphanumeric": "需要英數數值",

  /*  */
  "_knob_set_from_servermgr_passcode_min_complex": "最短複雜字元",

  /*  */
  "_knob_set_from_servermgr_passcode_max_age": "最長密碼使用期限",

  /*  */
  "_knob_set_from_servermgr_passcode_auto_lock": "自動鎖定",

  /*  */
  "_knob_set_from_servermgr_passcode_yes": "是",

  /*  */
  "_knob_set_from_servermgr_passcode_no": "否",

  /*  */
  "_knob_set_from_servermgr_passcode_none": "無",

  /*  */
  "_knob_set_from_servermgr_passcode_never": "永不",

  /*  */
  "_knob_set_from_servermgr_passcode_1_minute": "1 分鐘",

  /*  */
  "_knob_set_from_servermgr_passcode_n_minutes": "%@1 分鐘",

  /*  */
  "_knob_set_from_servermgr_ichat_connection_type_jabber": "Jabber",

  /*  */
  "_knob_set_from_servermgr_ichat_connection_type_not_jabber": "不是 Jabber",

  /*  */
  "_knob_set_from_servermgr_vpn_server": "伺服器",

  /*  */
  "_knob_set_from_servermgr_vpn_use_shared_secret": "使用共享密鑰",

  /*  */
  "_knob_set_from_servermgr_vpn_send_proxy_setup": "代理伺服器設定",

  /*  */
  "_knob_set_from_servermgr_vpn_send_all_traffic": "傳送所有流量",

  /*  */
  "_knob_set_from_servermgr_vpn_user_auth": "使用者認證",

  /*  */
  "_knob_set_from_servermgr_vpn_connection_name": "連線名稱",

  /*  */
  "_knob_set_from_servermgr_vpn_connection_type": "連接類型",

  /*  */
  "_knob_set_from_servermgr_email_account_type_pop": "POP",

  /*  */
  "_knob_set_from_servermgr_email_account_imap": "IMAP",

  /*  */
  "_knob_set_from_servermgr_email_account_crammd5": "MD5 Challenge-Response",

  /*  */
  "_knob_set_from_servermgr_email_account_not_crammd5": "不是 MD5 Challenge-Response",

  /*  */
  "_import_placeholder_devices_skip": "略過",

  /*  */
  "_import_placeholder_devices_create_device_group": "製作裝置群組",

  /*  */
  "_import_placeholder_devices_add_to_existing_device_group": "加入現有的裝置群組",

  /*  */
  "_truncated_indicator_view_helper": "使用搜尋框來取用其他記錄",

  /* First wildcard is the name of the user, second wildcard is the name of the device. */
  "_lab_session_user_on_device": "「%@2」上的「%@1」",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name of the organization for the profile": "描述檔的組織名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Organization": "組織",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add Mount Point": "加入裝載點",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can always launch these applications": "使用者總是可以啟動這些 App",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Applications": "App",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Don't add to Device Group": "不要加入裝置群組",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Files in these folders will sync as specified above": "這些檔案夾內的檔案將會如同上述指定的來同步",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Create a new Device Group": "製作新的裝置群組",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Items matching any of the following will not sync": "符合下列任何其一的項目都不會進行同步",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Creation": "製作帳號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Preference Sync": "偏好設定同步",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_CHAP": "CHAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Dock Applications": "Dock App",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can never launch applications in these folders": "使用者無法啟動這些檔案夾中的 App",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can always launch applications in these folders": "使用者總是可以啟動這些檔案夾中的 App",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Identity Certificate": "識別憑證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate names expected from authentication server": "認證伺服器預期的憑證名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Username for connection to the network": "網路連線的使用者名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Folders:": "允許檔案夾：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Outer Identity": "外部身分",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Password for the provided username": "提供之使用者名稱的密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Disallow Folders:": "不允許檔案夾：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Inner Authentication": "內部認證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The files and folders that will appear in the user's dock": "會顯示在使用者 Dock 上的檔案和檔案夾",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Widgets": "Widget",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Skip Items": "略過項目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hostname:": "主機名稱：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PAP": "PAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Expiry": "帳號到期",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Dock Items": "Dock 項目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication protocol (for use only with TTLS)": "認證通訊協定（僅與 TTLS 一起使用）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificates trusted/expected for authentication": "認證信任或預期的憑證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Request during connection and send with authentication": "在連線期間要求，並與認證一起傳送",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Externally visible identification (TTLS, PEAP, and EAP-FAST)": "外部可見的身分（TTLS、PEAP 和 EAP-FAST）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MSCHAP": "MSCHAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Method to use to authenticate to the network": "用來認證網路的方式",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use Per-Connection Password": "使用每一個連線的密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MSCHAPv2": "MSCHAPv2",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Protocols": "通訊協定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Preferences in these folders will sync as specified above": "這些檔案夾內的偏好設定將會如同上述指定的來同步",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Trusted Server Certificate Names": "信任的伺服器憑證名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Rules": "規則",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Widgets:": "允許 Widget：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Creation": "製作",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The applications that will appear in the user's dock": "會顯示在使用者 Dock 上的 App",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Trust": "信任",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can always run these widgets": "使用者總是可以執行這些 widget",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Trust Exceptions": "允許信任的例外情況",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Home Sync": "個人專屬同步",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Applications:": "允許 App：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Credentials for connection to the network": "網路連線的憑證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sync Folders": "同步檔案夾",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Trusted Certificates": "信任的憑證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Protocol:": "通訊協定：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SMB": "SMB",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_NFS": "NFS",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Volume:": "卷宗：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_AFP": "AFP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Refresh": "重新整理",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MEID": "MEID",

  /*  */
  "_admin_welcome_first_time": "歡迎使用描述檔管理程式！",

  /*  */
  "_admin_welcome_close": "關閉",

  /*  */
  "_admin_welcome_dont_show_again": "不要再顯示",

  /*  */
  "_no_item_view_is_truncation_indicator": "使用搜尋來尋找「%@1」",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Help": "輔助說明",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Log Out": "登出",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show Welcome Panel": "顯示歡迎面板",

  /*  */
  "_members_picker_refresh_button": "重新整理",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show Passcode": "顯示密碼",

  /*  */
  "_show_passcode_the_passcode_is": "密碼為：%@1",

  /*  */
  "_show_passcode_message": "顯示密碼",

  /*  */
  "_task_cancel_task": "取消作業",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Send Email": "傳送電子郵件",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Send": "傳送",

  /*  */
  "_setting_types_mac": "OS X",

  /*  */
  "_setting_types_both": "OS X 和 iOS",

  /*  */
  "_setting_types_ios": "iOS",

  /*  */
  "_task_type_remove_profile_with_display_name": "移除設定：%@1",

  /*  */
  "_profile_1_payload_configured": "已設定 1 個承載資料",

  /*  */
  "_profile_n_payloads_configured": "已設定 %@1 個承載資料",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Created ": "建立日期 ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Updated ": "更新於",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Edit": "編輯",

  /*  */
  "_items_settings": "「%@1」的設定",

  /*  */
  "_items_settings_n": "%@1（%@2）的設定",

  /*  */
  "_add_recipients_new_profile": "新增描述檔",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Go": "前往",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_With Authorization": "授權",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Wi-Fi": "Wi-Fi",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ethernet (OS X only)": "乙太網路（僅 OS X）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_LEAP": "LEAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TTLS": "TTLS",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PEAP": "PEAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication protocols supported on target network": "目標網路上支援的認證通訊協定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_EAP-SIM": "EAP-SIM",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_EAP-AKA": "EAP-AKA",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Provision PAC Anonymously": "以匿名方式佈建 PAC",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use PAC": "使用 PAC",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Configuration of Protected Access Credential (PAC)": "保護存取憑證（PAC）的設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Accepted EAP Types": "接受的 EAP 類型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Provision PAC": "佈建 PAC",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_EAP-FAST": "EAP-FAST",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TLS": "TLS",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate Common Name": "憑證一般名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Directory (OS X only)": "目錄（僅 OS X）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow trust decisions (via dialog) to be made by the user": "允許使用者透過對話框進行受信任的決定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_CryptoCard (OS X only)": "CryptoCard（僅 OS X）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate (OS X only)": "憑證（僅 OS X）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Kerberos (OS X only)": "Kerberos（僅 OS X）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Portable": "可攜式電腦",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allowances": "允許",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow URLs:": "允許 URL：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Power Adapter": "電源轉換器",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Content Filtering": "內容過濾",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Preferences": "偏好設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Battery": "電池",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Battery Menu": "電池選單",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Media": "媒體",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Curfews": "休息時間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Desktop": "桌面",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Time Limits": "時間限制",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Schedule": "排程",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can always access sites at these URLs": "使用者總是可以連接這些 URL 的網站",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Deny URLs:": "拒絕 URL：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Functionality": "功能性",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow only these URLs:": "僅允許這些 URL：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Media Content": "媒體內容",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can never access sites at these URLs": "使用者無法連接這些 URL 的網站",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can only access sites at these URLs": "使用者只能連接這些 URL 的網站",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Parental Controls": "分級保護控制",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Software Update": "軟體更新",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Universal Access": "輔助使用",

  "_generic_string_Accessibility": "輔助使用",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Keyboard": "鍵盤",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sound": "聲音",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Mouse": "滑鼠",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Displays": "顯示器",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_FibreChannel": "光纖通道",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sharing": "共享",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Startup Disk": "啟動磁碟",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Dock": "Dock",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Speech": "聽寫與語音",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Energy Saver": "能源節約器",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Profiles": "描述檔",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Internet Accounts": "Internet 帳號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Desktop & Screen Saver": "桌面與螢幕保護程式",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Accounts": "帳號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Notifications": "通知",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Print & Scan": "列印與掃描",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ink": "Ink",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Trackpad": "觸控式軌跡板",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Localization": "語言與文字",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Xsan": "Xsan",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_CDs & DVDs": "CD 與 DVD",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Security": "安全性",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Time Machine": "Time Machine",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Date & Time": "日期與時間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MobileMe": "MobileMe",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Expose": "顯示",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Appearance": "外觀",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Bluetooth": "藍牙",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add in Certificate payload": "在「憑證」承載資料中加入",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Match Domain or Host": "符合網域或主機",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_On Demand Action": "隨選即用動作",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Not Configured": "尚未設定",

  // KNOB SET ADD 1b
  /*  */
  "_subscribed_calendar_knob_set_num_lines": "2",

  /*  */
  "_apn_knob_set_num_lines": "1",

  /*  */
  "_ad_cert_knob_set_num_lines": "1",

  /*  */
  "_cal_dav_knob_set_num_lines": "1",

  /*  */
  "_card_dav_knob_set_num_lines": "1",

  /*  */
  "_certificate_knob_set_num_lines": "1",

  /*  */
  "_directory_knob_set_num_lines": "1",

  /*  */
  "_dock_knob_set_num_lines": "1",

  /*  */
  "_energy_saver_num_lines": "1",

  /*  */
  "_exchange_knob_set_num_lines": "1",

  /*  */
  "_general_knob_set_num_lines": "1",

  /*  */
  "_ichat_knob_set_num_lines": "1",

  /*  */
  "_interface_knob_set_num_lines": "1",

  /*  */
  "_ldap_knob_set_num_lines": "1",

  /*  */
  "_login_item_knob_set_num_lines": "1",

  /*  */
  "_login_window_knob_set_num_lines": "2",

  /*  */
  "_mac_restrictions_knob_set_num_lines": "1",

  /*  */
  "_email_knob_set_num_lines": "1",

  /*  */
  "_mobility_knob_set_num_lines": "1",

  /*  */
  "_parental_controls_knob_set_num_lines": "2",

  /*  */
  "_passcode_knob_set_num_lines": "1",

  /* Don't know what this is */
  "_global_http_proxy_knob_set_num_lines": "2",

  /* Don't know what this is */
  "_app_lock_knob_set_num_lines": "2",

  /*  */
  "_restrictions_knob_set_num_lines": "1",

  /*  */
  "_vpn_knob_set_num_lines": "1",

  /*  */
  "_scep_knob_set_numLines": "1",

  /*  */
  "_web_clip_knob_set_num_lines": "1",

  /*  */
  "_software_update_knob_set_num_lines": "2",

  /*  */
  "_printing_knob_set_num_lines": "1",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Label": "標籤",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Choose...": "選擇⋯",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Displays the web clip as a full screen application": "將 web clip 顯示為全螢幕 App",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable removal of the Web Clip": "啟用 Web Clip 的移除",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The icon will be displayed with no added visual effects": "圖像顯示時將不會加入視覺效果",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Image was too large, returned empty string": "影像太大，傳回空白字串",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The URL to be displayed when opening the Web Clip": "打開 Web Clip 時所顯示的 URL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Full Screen  (iOS only)": "全螢幕（僅 iOS）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Removable  (iOS only)": "可移除的（僅 iOS）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The name to display for the Web Clip": "Web Clip 顯示的名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Precomposed Icon  (iOS only)": "預先製作的圖像（僅 iOS）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The icon to use for the Web Clip": "用於 Web Clip 的圖像",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ou=MyDepartment, o=My Company": "ou=我的部門，o=我的公司",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Exchange ActiveSync (iOS only)": "Exchange ActiveSync（僅 iOS）",
  "_generic_string_Exchange ActiveSync": "Exchange ActiveSync",
  /* This is a generic string used one or more times in the app. */
  "_generic_string_Exchange Web Services (OS X only)": "Exchange Web Services（僅 OS X）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My Search": "我的搜尋",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow use of iTunes Store": "允許使用 iTunes Store",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow use of Safari": "允許使用 Safari",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow installing apps": "允許安裝 App",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow removing apps": "允許移除 App（僅限監管裝置）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Touch ID to unlock device": "允許 Touch ID 解鎖裝置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sets the region for the ratings": "設定分級的區域",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_DNS Name": "DNS 名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow use of YouTube": "允許使用 YouTube",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_R": "R",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_P": "P",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_An NT principal name for use in the certificate request": "在憑證要求中使用的 NT 主要名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_NT Principal Name": "NT 主要名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allowed content ratings": "允許的內容分級",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_G": "G",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_C": "C",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow in App Purchase": "允許 App 內建購買功能",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_RFC 822 Name": "RFC 822 名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The value of a subject alternative name": "主題替用名稱的值",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_M": "M",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sets the maximum allowed ratings": "設定允許的最大分級數量",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable JavaScript": "啟用 JavaScript",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Block pop-ups": "阻擋彈出式項目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow automatic sync while roaming": "允許漫遊時自動同步",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV Shows:": "電視節目：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Uniform Resource Identifier": "統一資源識別碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Subject Alternative Name Value": "主題替用名稱數值",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow voice dialing": "允許語音撥號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Accept Cookies": "接受 Cookie",

  "_generic_string_Autonomous Single App Mode (Supervised Only)": "自主單一 App 模式（僅限監管）",
  "_generic_string_Allow these apps to enter Single App Mode": "允許這些 App 進入「單一 App 模式」",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Movies:": "影片：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_U": "U",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow screen capture": "允許螢幕快照",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Force fraud warning": "強制詐騙警告",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Apps:": "App：",
  "_generic_string_Apps": "App",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The type of a subject alternative name": "主題替用名稱的類型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable autofill": "啟用自動填寫",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Force encrypted backups": "強制加密備份",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Subject Alternative Name Type": "主題替用名稱類型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow use of camera": "允許使用攝影機",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ratings region": "分級區域",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow explicit music, podcasts, and iTunes U": "允許不適當音樂、podcast 與 iTunes U",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Path of item": "項目路徑",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Settings for Dock behavior and appearance": "Dock 動作和外觀的設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Automatically hide and show the Dock": "自動隱藏及顯示 Dock",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Right": "右側",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add other folders:": "加入其他檔案夾：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Network Home": "網路個人專屬",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Display Settings": "顯示設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show indicator lights for open applications": "為開啟的 App 顯示指示燈",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My Applications": "我的 App",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Animate opening applications": "使用動畫效果來表示開啟中的 App",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Bottom": "底部",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Scale Effect": "縮放效果",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Large": "大",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Merge with User's Dock": "與使用者的 Dock 合併",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Minimize using:": "縮到最小的方式：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Small": "小",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Documents": "文件",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Minimize window into application icon": "將視窗縮小為 App 圖像",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Position:": "位置：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Dock Size:": "Dock 大小：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Magnification:": "放大：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Genie Effect": "精靈效果",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max": "最大",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Min": "最小",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Left": "左側",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Item": "項目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The applications that will launch at login": "會在登入時啟動的 App",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hide": "隱藏",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authenticate selected share point with user's login name and password": "認證以使用者登入名稱和密碼所選擇的共享點",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User may press Shift to keep items from opening": "使用者可按下 Shift 鍵來防止項目開啟",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The network volumes that will be mounted at login": "會在登入時裝載的網路卷宗",
  "_generic_string_The network volumes that will be mounted using user's login name and password for authentication": "網路裝載是以使用者的登入名稱和密碼來進行認證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Items": "項目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User may add and remove additional items": "使用者可加入和移除額外的項目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authenticated Network Mounts": "已認證的網路裝載",
  "_generic_string_Network Mounts": "網路裝載",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add network home share point": "加入網路個人專屬共享點",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The files and folders that will open at login": "會在登入時打開的檔案和檔案夾",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add a network accessible volume to mount at login.": "在登入時加入要裝載的網路連接卷宗。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hours": "小時",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require computer master password": "需要電腦主密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_in background": "在背景中",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Manually": "手動移除",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show status in menu bar": "在選單列中顯示狀態",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Full Path": "完整路徑",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_at login": "在登入時",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Days": "天",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Setting this value to 0 causes the mobile account to be deleted as soon as possible.": "將此數值設為 0 會導致行動帳號立即被刪除。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Encrypt contents with FileVault": "使用 FileVault 加密內容",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_RegEx Name": "RegEx 名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Partial Path": "部分路徑",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MB": "MB",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Restrict size:": "限制大小：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Home folder location:": "個人專屬檔案夾位置：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Starts With": "開頭為",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Create home using:": "製作個人專屬，使用：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Delete mobile accounts:": "刪除行動帳號：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_at logout": "在登出時",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Create mobile account when user logs in to network account": "當使用者登入網路帳號時建立行動帳號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ends With": "結尾為",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_network home and default sync settings": "網路個人專屬和預設同步設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use computer master password, if available": "使用電腦主密碼（若有的話）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Every": "每",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sync:": "同步：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_minutes": "分鐘",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_to percentage of network home quota:": "至網路個人專屬配額的百分比：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Delete only after successful sync": "只在成功同步後刪除",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show \"Don't ask me again\" checkbox": "顯示「別再詢問」註記框",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Weeks": "週",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_local home template": "本機個人專屬樣板",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sync in the background:": "在背景同步：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name Is": "名稱為",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_after user's last login": "在使用者上一次登入後",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_manually": "手動",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_at path:": "於路徑：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_RegEx Path": "RegEx 路徑",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%": "%",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_to fixed size:": "成為固定大小：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Merge with user's settings": "與使用者的設定合併",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_on startup volume": "在啟動卷宗上",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name Contains": "名稱包含",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require confirmation before creating mobile account": "在建立行動帳號前需要先確認",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_New directory path": "新增目錄路徑",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Font Name:": "字體名稱：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require an administrator password": "需要管理者密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Font Size:": "字體大小：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Default Printer:": "預設印表機：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Checked printers require an administrator password": "勾選的印表機需要管理者密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Include MAC address": "包含 MAC 位址",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow user to modify printer list": "允許使用者修改印表機列表",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow printers that connect directly to user's computer": "允許直接連接使用者電腦的印表機",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Print page footer (user name and date)": "列印頁面註腳（使用者名稱和日期）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Times": "Times",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Settings for the optional footer applied to pages": "套用至頁面的額外註腳設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Lucida Grande": "儷黑 Pro",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Helvetica": "Helvetica",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Only show managed printers": "僅顯示管理印表機",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Courier": "Courier",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Footer Settings": "註腳設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_AirDrop:": "AirDrop：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Recordable Discs:": "可燒錄式光碟：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_DVD-RAM:": "DVD-RAM：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Directory Path": "目錄路徑",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access settings for network media": "網路媒體的存取設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow only the following Dashboard widgets to run": "僅允許執行下列 Dashboard widget",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Eject at logout": "在登出時退出",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable All": "啟用全部",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access settings for hard disk media": "硬碟媒體的存取設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Network Access": "網路連線",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_DVDs:": "DVD：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require Authentication": "需要認證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The selected items are enabled in System Preferences": "所選的項目已在「系統偏好設定」中啟用",

  "_generic_string_System Preference Panes": "系統偏好設定面板",

  "_generic_string_Third-party Preference Panes": "協力廠商偏好設定面板",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable None": "不啟用任何項目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_CDs & CD-ROMs:": "CD 和 CD-ROM：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Read-Only": "唯讀",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Restrict items in system preferences": "限制「系統偏好設定」中的項目",
  "_generic_string_enable selected items": "啟用所選項目",
  "_generic_string_disable selected items": "停用所選項目",
  "_generic_string_Select None": "不選擇",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require admin password to install or update apps": "需要管理者密碼才能安裝或更新 App",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Restrict which applications are allowed to launch": "限制可以啟動的 App",

  "_generic_string_Restrict App Store to software updates only": "限制 App Store 只能進行軟體更新",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Disc Media Access": "光碟媒體存取",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access settings for removable disc media": "可移除式光碟媒體的存取設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hard Disk Media Access": "硬碟媒體存取",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Internal Disks:": "內置磁碟：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Eject all removable media at logout": "在登出時退出所有可移除媒體",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_External Disks:": "外接磁碟：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_always": "總是",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_establish": "建立",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_never": "永不",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_default": "預設值",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Get Root Certificate": "取得 Root 憑證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prevent computer access during the specified days and hours.": "避免在指定的天數和時數內連接電腦。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Friday and Saturday": "星期五與星期六",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_From:": "從：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_allowing access to the following websites only": "僅允許連接下列網站",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Weekends": "週末",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Deny Access": "拒絕存取",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_trying to limit access to adult websites": "嘗試限制連接成人網站",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow computer access Monday through Friday for the specified number of hours only.": "只允許在星期一至星期五指定的時數內連接電腦。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_30 min": "30 分鐘",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Disk Images:": "磁碟映像檔：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_AM": "上午",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PM": "下午",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sunday through Thursday": "星期日到星期四",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Limit Access to websites by": "限制連接網站",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_:": ":",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow computer access Saturday and Sunday for the specified number of hours only.": "只允許在星期六和星期日指定的時數內連接電腦。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Weekdays": "工作日",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_8 hr": "8 小時",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hide profanity in Dictionary": "隱藏辭典和聽寫裡的粗話",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_to:": "至：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enforce Limits": "強制限制",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Limit computer use to:": "限制電腦使用：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Download": "下載",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Please correct the error before continuing.": "在繼續之前，請先修正錯誤。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Please correct the errors before continuing.": "在繼續之前，請先修正錯誤。",

  /* Add an item */
  "_prefs_list_item_count": "（%@1 個項目）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Boolean": "布林值",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Value": "數值",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Property List Values": "屬性列表值",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Preference Domain": "偏好的網域",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Array": "陣列",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Delete Item": "刪除項目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Dictionary": "辭典",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_String": "字串",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Data": "資料",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Date": "日期",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The name of a preference domain (com.company.application)": "偏好設定網域的名稱（com.company.application）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Key": "鍵值",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Number": "編號",

  /* Add an item */
  "_prefs_button_title_Add Item": "加入項目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Key value pairs for settings in the specified domain": "指定網域中的設定鍵值配對",

  /* Add a child node */
  "_prefs_button_title_Add Child": "加入子裝置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_New Item": "新增項目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No Data": "沒有資料",

  /*  */
  "_temporary_iphone_ipod_blocker_label": "使用 iPad 或電腦上的「描述檔管理程式」。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Upload...": "上傳⋯",

  /* This is a generic string used one or more times in the app. */

  "_generic_string_Upload File": "上傳檔案⋯",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Go to My Devices": "前往我的裝置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Configurations options for 802.1X network authentication": "802.1X 網路認證的設定選項",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Network Security Settings": "網路安全性設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No applicable Certificate payload is configured": "未設定可用的憑證承載資料",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_hostname": "主機名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No applicable Certificate or SCEP payload is configured": "未設定可用的憑證或 SCEP 承載資料",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authorization Password": "授權密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Brief explanation of the content or purpose of the profile": "描述檔內容或用途的簡短說明",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow sending diagnostic and usage data to Apple": "允許傳送診斷和用量資料給 Apple",

  /*  */
  "_privacy_knob_set_num_lines": "1",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Guest User": "允許訪客使用者",

  "_generic_string_Screen Saver": "螢幕保護程式",
  "_generic_string_Idle time before screen saver starts": "螢幕保護程式開始前的閒置時間",

  "_screen_saver_Never": "永不執行",
  "_screen_saver_1 Minute": "1 分鐘",
  "_screen_saver_2 Minutes": "2 分鐘",
  "_screen_saver_5 Minutes": "5 分鐘",
  "_screen_saver_10 Minutes": "10 分鐘",
  "_screen_saver_20 Minutes": "20 分鐘",
  "_screen_saver_30 Minutes": "30 分鐘",
  "_screen_saver_1 Hour": "1 小時",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Start screen saver after:": "在此之後啟動螢幕保護程式：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Combine available workgroup settings": "結合可用的工作群組設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Local-only users may log in": "僅本機的使用者可以登入",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable external accounts": "啟用外部帳號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Computer administrators may refresh or disable management": "電腦管理者可以重新整理或停用管理",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No file uploaded": "未上傳檔案",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_• Set EnableMCXLoginScripts to TRUE.": "• 設定 EnableMCXLoginScripts 為 TRUE。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show \"Other…\"": "顯示「其他」⋯",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Set computer name to computer record name": "將電腦記錄名稱設定為電腦名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_minutes of inactivity": "分鐘閒置（最少 3 分鐘）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Logout Script:": "登出工序指令：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Style:": "樣式：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable >console login": "啟用 > 主控台登入",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show computer's administrators": "顯示電腦的管理者",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Login Screen Preferences": "登入螢幕偏好設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The above settings require specific properties in the file ~root/Library/Preferences/com.apple.loginwindow.plist, located on the client computer:": "上述設定需要檔案 ~root/Library/Preferences/com.apple.loginwindow.plist 中特定的屬性，位於用戶端電腦上：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show password hint when needed and available": "需要且可用時顯示密碼提示",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ignore workgroup nesting": "忽略工作群組的巢狀結構",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Login Script:": "登入工序指令：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name": "名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_IP Address": "IP 位址",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Settings for the behavior of the system while at the login screen": "登出螢幕中系統行為的設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Local-only users use available workgroup settings": "僅本機的使用者使用可取得的工作群組設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Time": "時間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show mobile accounts": "顯示行動帳號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Also execute the client computer's LoginHook script": "也執行用戶端電腦的 LoginHook 工序指令",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable Fast User Switching": "啟用快速切換使用者功能",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Message:": "訊息：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show network users": "顯示網路使用者",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_• Set MCXScriptTrust to match the binding settings used to connect the client computer to the directory domain.": "• 設定 MCXScriptTrust 以符合用來將用戶端電腦連接至目錄網域的綁定設定。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Log out users after:": "於下列時間之後登出使用者：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Directory Status": "目錄狀態",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use screen saver module at path:": "使用螢幕保護程式模組，位於路徑：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show the Sleep, Restart and Shut Down buttons": "顯示「睡眠」、「重新開機」和「關機」按鈕",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Always show workgroup dialog during login": "總是在登入時顯示工作群組對話框",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show local users": "顯示本機使用者",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Heading:": "標題：",

  "_generic_string_Show additional information in the menu bar": "在選單列中顯示其他資訊",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name and password text fields": "名稱和密碼文字欄位",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Disable automatic login": "停用自動登入",
  "_generic_string_Banner": "標語",
  "_generic_string_Show the host name, OS X version and IP address when the menu bar is clicked.": "按下選單列時顯示主機名稱、OS X 版本和 IP 位址。",
  "_generic_string_Login Prompt": "登入提示",
  "_generic_string_A message displayed above the login prompt.": "登入提示上方顯示的訊息。",
  "_generic_string_The display style and related options of the login prompt.": "登入提示的顯示樣式和相關選項。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Version": "版本",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Also execute the client computer's LogoutHook script": "也執行用戶端電腦的 LogoutHook 工序指令",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_List of users able to use these computers": "可以使用這些電腦的使用者列表",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Create a placeholder record for a device.": "為裝置製作暫存區記錄。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%@1 minutes": "%@1 分鐘",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 hour ": "1 小時 ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%@1 hours": "%@1 小時",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%@ hour and 30 minutes": "%@ 小時 30 分",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%@ hours": "%@ 小時",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 hour and 30 minutes": "1 小時 30 分",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_30 minutes": "30 分鐘",

  /* This is the number of pixels the width of the "Log out users after:" string takes up in the UI. */
  "_log_out_users_after_text_width": "165",

  "_screen_saver_idle_time_popup_width": "100",

  /* This is the number of pixels the width of the "Start screen saver after:" string takes up in the UI. */
  "_start_screen_saver_after_text_width": "175",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%@ certificate": "%@ 憑證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SSL and code signing certificates": "SSL 與代碼簽名憑證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Code Signing": "代碼簽名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SSL": "SSL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_By default, iOS and OS X devices do not trust this server's %@.": "依預設，iOS 和 OS X 裝置並不信任此伺服器的「%@」。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Download Trust Profile": "下載信任描述檔",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No Certificate payload is configured": "未設定憑證承載資料",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The domain of the account": "帳號的網域",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user of the account": "帳號的使用者",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The domain of the account. Leave Domain and User blank to set user on device": "帳號的網域。請將「網域」和「使用者」留空以設定裝置上的使用者",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user of the account. Leave Domain and User blank to set user on device": "帳號的使用者。請將「網域」和「使用者」留空以設定裝置上的使用者",

  /*  */
  "_new_task_passcode_was_not_six_digit_number": "密碼不是六位數字",

  /*  */
  "_admin_detail_tab_width": "100",

  /*  */
  "_members_picker_example_view_display_name_width": "150",

  /*  */
  "_members_picker_example_view_add_remove_button_width": "80",

  /*  */
  "_system_items_picker_done_button_width": "81",

  /*  */
  "_new_auto_join_profile_width": "150",

  /*  */
  "_admin_sidebar_default_and_min_thickness": "200",

  /*  */
  "_admin_payload_type_scroll_width": "250",

  /*  */
  "_user_dropdown_menu_width": "175",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Download the Configuration Profile \"Trust Profile for %@\" and install it on your devices to configure them to trust this server's certificates": "下載設定描述檔「%@ 的信任描述檔」並在裝置上安裝，以設定裝置信任此伺服器的憑證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authenticate with credentials obtained from the target machine's record in the directory": "認證由目標機器的目錄記錄中所取得的憑證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use Directory Authentication": "使用目錄認證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authenticate with the target machine's directory credentials": "認證目標機器的目錄憑證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_set by directory": "由目錄設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Trust Profile for %@": "「%@」的信任描述檔",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Download the Configuration Profile \"Trust Profile for %@\" and install it on your devices to configure them to trust this server's certificates.": "下載設定描述檔「%@ 的信任描述檔」並在裝置上安裝，以設定裝置信任此伺服器的憑證。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Download and install the \"Trust Profile for %@\" configuration profile on iOS and OS X devices to configure them to trust this server's %@.": "在 iOS 和 OS X 裝置上下載並安裝「%@ 的信任描述檔」設定描述檔，以設定裝置信任此伺服器的 %@。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SSL certificate": "SSL 憑證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_code signing certificate": "代碼簽名憑證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Icon": "圖像",

  /* This is the width of the labels next to the buttons in iOS Restrictions > Media Control > for Movies, TV Shows, and Apps */
  "_layout_allowed_content_button_labels_width": "100",

  /* This is the combination of first/given name and last/family name. %@1 is first/given and %@2 is last/family. */
  "_user_first_name_last_name": "%@1 %@2",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Wake for Ethernet network administrator access": "進行乙太網路管理者連線時喚醒電腦",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Monday": "星期一",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sleep Options": "睡眠選項",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 min": "1 分鐘",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_3 hr": "3 小時",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Put the computer to sleep after a period of inactivity": "讓電腦在閒置一段時間後進入睡眠",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Start up automatically after a power failure": "於電力故障排除後自動重新開機",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Saturday": "星期六",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Friday": "星期五",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Put the hard disk(s) to sleep whenever possible": "如果情況允許，讓硬碟進入睡眠",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Every Day": "每天",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sunday": "星期天",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sleep": "睡眠",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 hr": "1 小時",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Put the display(s) to sleep after:": "在此時間後讓顯示器進入睡眠：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Thursday": "星期四",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_15 min": "15 分鐘",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Other Options": "其他選項",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Shut Down": "關機",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Wednesday": "星期三",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Settings for waking the computer from sleep": "將電腦從睡眠中喚醒的設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow power button to sleep the computer": "允許按電源按鈕來讓電腦進入睡眠",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Additional power settings for the computer": "電腦的其他電源設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Put the computer to sleep after:": "在此時間後讓電腦進入睡眠：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Tuesday": "星期二",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Start up the computer:": "啟動電腦：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Wake Options": "喚醒選項",

  /* This is the width of the Hide Columns for the Login Items payload type. */
  "_layout_hide_column_width": "40",

  /* This is the width of the two radio buttons under Settings > Mobility > Rules > Options > Sync in the backgound */
  "_layout_mobility_rules_options_sync_in_background_width": "140",
  "_mobility_path_at_textField_offset_left": "117",


  /* This is a generic string used one or more times in the app. */
  "_generic_string_All Users": "所有使用者",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Force FIPS verification": "強制進行 FIPS 驗證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_App Store": "App Store",
  "_generic_string_Allow iCloud documents & data": "允許 iCloud 文件與資料",
  "_generic_string_Allow iCloud keychain": "允許 iCloud 鑰匙圈",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enterprise": "企業級",
  "_generic_string_Allow My Photo Stream (disallowing can cause data loss)": "允許我的照片串流（若不允許可能會造成資料遺失）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Application Library": "App 資料庫",
  "_generic_string_Force iTunes password entry for every purchase": "強制每次購買時都輸入 iTunes 密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add applications from the iTunes Store to your library": "將 iTunes Store 的 App 加入資料庫",
  "_generic_string_Allow iCloud backup": "允許 iCloud 備份",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add enterprise applications to your library": "將企業級 App 加入資料庫",
  "_generic_string_Require iTunes password for all purchases": "每次購買時都需要輸入 iTunes 密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Application Search": "App 搜尋",
  "_generic_string_Allow third-party mail clients": "允許協力廠商的郵件用戶端",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Find apps in the iTunes Store": "尋找 iTunes Store 的 App",
  "_generic_string_Configures proxy settings to be used with this network": "設定代理伺服器的設定來與此網路搭配使用",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Search iTunes": "搜尋 iTunes",
  "_generic_string_Auto Join": "自動加入",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_iPad Apps": "iPad  App",
  "_generic_string_required": "必須",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_iPhone Apps": "iPhone  App",
  "_generic_string_Allow user to move messages from this account": "允許使用者從此帳號搬移郵件",

  /* More */
  "_general_string_More...": "更多",
  /* This is a generic string used one or more times in the app. */
  "_generic_string_Automatically join this wireless network": "自動加入此無線網路",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Upload": "上傳",
  "_generic_string_Messages can be moved out of this email account into another": "可從此帳號將郵件搬移到其他帳號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Select an application to add to the library": "選取 App 來加入資料庫",
  "_generic_string_Messages can be sent from this account using third-party mail clients": "可使用協力廠商的郵件用戶端從此帳號傳送郵件",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Select...": "選取⋯",
  "_generic_string_Hostname or IP address for server": "伺服器的主機名稱或 IP 位址",

  /*  */
  "_layout_pane_cancel_button_offset_right": "120",
  "_layout_download_and_edit_buttons_width": "70",

  /* The width of the box in the Profile tab containing the profile overview showing the payloads contained in it */
  "_layout_admin_profiles_view_box_width": "520",

  /* The width of a payload icon and text label within the profile overview box */
  "_layout_admin_profiles_view_settings_column_width": "153",

  /*  */
  "_layout_heading_popup_select_button_width": "140",

  /*  */
  "_layout_security_type_button_field_width": "163",

  /* The width of the tiny upload button inside Settings > Custom Settings > Property List Values > An item of type Data in the Value column */
  "_layout_cfprefs_line_item_upload_button_width": "65",

  /*  */
  "_layout_cfprefs_upload_file_button_width": "100",

  /* This is the width of the Property List Value Type popup button in the Custom Settings payload editor */
  "_layout_cfprefs_value_type_button_width": "115",

  /* The width of the Path Prefix string */
  "_layout_path_prefix_width": "80",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Upload selected file": "上傳所選檔案",
  "_generic_string_Device Groups": "裝置群組",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Upload an application to add to the library": "上傳 App 來加入資料庫",
  "_generic_string_Devices": "裝置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Install Application": "安裝 App",
  "_generic_string_Users": "使用者",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User Groups": "使用者群組",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add App": "加入 App",
  "_generic_string_Printers": "印表機",

  /* This is the width of the Configure button for an unconfigured setting type for a profile. */
  "_layout_no_settings_configure_button": "90",

  /* This is the width of the Add Certificate button, as used in Certificate Settings and Exchange Settings. */
  "_layout_knob_set_view_add_certificate": "120",

  /* This is the width of the Add Item and Delete Item buttons in Settings > Custom Settings */
  "_layout_add_item_and_delete_item_buttons_width": "80",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Edit App List": "編輯應用程式列表",
  "_generic_string_at": "於",

  /* This is the width of the label text for Login Script and Logout Script found under Settings > Login Window > Scripts. */
  "_layout_login_script_and_logout_script_label_width": "100",

  /* This is the width of the upload buttons found in Settings > Login Window > Scripts. */
  "_layout_scripts_upload_button_width": "80",

  /* Width of Settings > Passcode > Grace Period popup */
  "_layout_grace_period_field": "95",

  /* This is the width of the Enable All and Enable None buttons in Restrictions Settings under Preferences. */
  "_layout_enable_all_and_enable_none_buttons_width": "100",

  /* This is the width of the to fixed size string found in Settings > Mobility > Account Creation > Encrypt contents with FileVault. */
  "_layout_to_fixed_size_radio_width": "147",

  /* This is the width of the to percentage of network home quota string found in Settings > Mobility > Account Creation > Encrypt contents with FileVault. */
  "_layout_to_percentage_of_network_home_quote_radio_width": "239",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Edit Apps": "編輯 App",
  "_generic_string_Language & Text": "語言與文字",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Security & Privacy": "安全性與隱私",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Users & Groups": "使用者與群組",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Mail, Contacts & Calendars": "郵件、聯絡資訊與行事曆",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_General": "一般",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Mission Control": "Mission Control",

  /* The width of the Add All and Add Visible button that appears in the lower left corner of various picker sheets. */
  "_layout_add_all_and_add_visible_button_width": "100",

  /* The width of the Settings > Dock > Minimize using popup */
  "_layout_minimize_using_select_button_width": "140",

  /* If needed, this increases the width of most of the UI in settings. When increasing this, be careful it still fits on iPad. */
  "_layout_settings_overall_knob_width": "480",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow accepting untrusted TLS certificates": "允許使用者接受不受信任的 TLS 憑證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow automatic updates to certificate trust settings": "允許自動更新憑證信任設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Remaining Battery Life": "剩餘電池壽命",
  "Supervised": "已監管",

  "_generic_string_Signed in to iTunes": "已登入 iTunes",

  "_generic_string_iCloud Backup": "iCloud 備份",

  "_generic_string_Do Not Disturb": "勿擾模式",

  "_generic_string_Personal Hotspot": "個人熱點",
  "_generic_string_On": "開啟",
  "_generic_string_Off": "關閉",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Send outgoing mail from this account only from Mail app": "只能從「郵件」App 傳送此帳號的外寄郵件",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use Only in Mail": "僅在「郵件」中使用",
  "_generic_string_Enable S/MIME": "啟用 S/MIME",
  "_generic_string_Support S/MIME for this account": "讓此帳號支援 S/MIME",
  "_generic_string_Signing Certificate": "簽署憑證",
  "_generic_string_Certificate used to sign messages sent from this account": "用來簽署由此帳號傳送之郵件的憑證",
  "_generic_string_Encryption Certificate": "加密憑證",
  "_generic_string_Certificate used to decrypt messages sent to this account": "用來解密傳送至此帳號之郵件的憑證",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Supported": "支援",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Software Build Version": "軟體版號版本",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Unknown": "未知的",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Supports Managed Apps": "支援管理的 App",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Not Supported": "不支援",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Requires Re-enrollment": "需要重新登記",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Requires iOS 5 or later": "需要 iOS 5 或以上版本",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Upgrade to iOS 5 and re-enroll this device to enable enterprise application distribution": "升級到 iOS 5 並重新登記此裝置來啟用企業級 App 分配",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Re-enroll this device to enable enterprise application distribution": "重新登記此裝置來啟用企業級 App 分配",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Siri": "允許 Siri",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Siri while device locked": "允許裝置鎖定時使用 Siri",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable Siri profanity filter (Supervised devices only)": "啟用 Siri 粗話過濾器（僅限監管裝置）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No Limit": "無上限",

  /* This is the width of the Cancel Task button, found in the bottom toolbar when selecting an active task. */
  "_layout_cancel_task_button": "100",

  /* This is the width of the secondary information column for the task list item view */
  "_layout_task_list_item_view_secondary_information_width": "90",

  /* This is the width of the updated at timestamp column for the task list item view */
  "_layout_task_list_item_view_updated_at_width": "130",

  /* This is the width of the labels under Display Settings for Dock Settings. */
  "_layout_dock_knob_set_display_settings_label_widths": "110",

  /*  */
  "_no_item_view_no_somethings_widget": "沒有 Widget",

  "_no_item_view_no_somethings_members": "沒有成員",

  /*  */
  "_no_item_view_is_truncation_indicator_tasks_complete": "使用搜尋來尋找「完成的作業」",

  /*  */
  "_no_item_view_no_somethings_found_tasks_complete": "找不到完成的作業",

  /*  */
  "_no_item_view_no_somethings_device": "沒有裝置",

  "_no_item_view_no_airplay_destinations": "沒有 AirPlay 目標",

  "_no_item_view_no_somethings_apps": "沒有 App",
  "_no_item_view_no_somethings_inhouse_enterprise_apps": "沒有內部企業級 App",
  "_no_item_view_no_somethings_books": "沒有書籍",
  "_no_item_view_no_somethings_activity": "沒有活動",
  /*  */
  "_no_item_view_no_somethings_found_device_group": "找不到裝置群組",
  "_no_item_view_no_somethings_found_location": "找不到位置",
  "_no_item_view_no_somethings_found_members": "找不到成員",
  /*  */
  "_no_item_view_no_somethings_system_application": "沒有 App",

  /*  */
  "_item_list_loading_user_group": "正在載入群組⋯",
  "_item_list_loading_vpp_user_group": "正在載入已啟用 VPP 的群組⋯",

  /*  */
  "_no_item_view_no_somethings_found_device": "找不到裝置",

  /*  */
  "_item_list_loading_widget": "正在載入 Widget⋯",

  /*  */
  "_item_list_loading_printer": "正在載入印表機⋯",

  "_item_list_loading_activity": "正在載入活動⋯",
  "_item_list_loading_members": "正在載入成員⋯",
  "_item_list_loading_Apps": "正在載入 App⋯",
  "_item_list_loading_books": "正在載入書籍⋯",

  /*  */
  "_item_list_loading_device_group": "正在載入裝置群組⋯",
  "_item_list_loading_location": "正在載入位置⋯",

  /*  */
  "_no_item_view_no_somethings_found_tasks_active": "找不到啟用的作業",

  /*  */
  "_no_item_view_no_somethings_printer": "沒有印表機",

  /*  */
  "_no_item_view_is_truncation_indicator_widget": "使用搜尋來尋找 Widget",

  "_no_item_view_is_truncation_indicator_members": "使用搜尋來尋找「成員」",
  /*  */
  "_no_item_view_is_truncation_indicator_printer": "使用搜尋來尋找「印表機」",

  /*  */
  "_no_item_view_is_truncation_indicator_user_group": "使用搜尋來尋找「群組」",
  "_no_item_view_is_truncation_indicator_vpp_user_group": "使用搜尋來尋找已啟用 VPP 的裝置群組",

  /*  */
  "_no_item_view_no_somethings_found_system_application": "找不到 App",
  "_no_item_view_no_somethings_found_books": "找不到書籍",

  "_no_item_view_no_somethings_found_apps": "找不到 App",
  "_no_item_view_no_somethings_found_activity": "找不到活動",

  /*  */
  "_no_item_view_no_somethings_user": "沒有使用者",

  /*  */
  "_no_item_view_is_truncation_indicator_tasks_active": "使用搜尋來尋找「啟用的作業」",

  /*  */
  "_no_item_view_is_truncation_indicator_device": "使用搜尋來尋找「裝置」",

  /*  */
  "_item_list_loading_system_application": "正在載入 App⋯",

  /*  */
  "_no_item_view_is_truncation_indicator_user": "使用搜尋來尋找「使用者」",

  /*  */
  "_no_item_view_no_somethings_found_user": "找不到使用者",

  /*  */
  "_no_item_view_is_truncation_indicator_system_application": "使用搜尋來尋找 App",

  "_no_item_view_is_truncation_indicator_apps": "使用搜尋來尋找 App",

  "_no_item_view_is_truncation_indicator_books": "使用搜尋來尋找「書籍」",

  "_no_item_view_is_truncation_indicator_activity": "使用搜尋來尋找「活動」",

  /*  */
  "_no_item_view_no_somethings_tasks_complete": "找不到完成的作業",

  /*  */
  "_no_item_view_no_somethings_found_user_group": "找不到群組",
  "_no_item_view_no_somethings_found_vpp_user_group": "找不到已啟用 VPP 的群組",

  /*  */
  "_no_item_view_no_somethings_found_printer": "找不到印表機",

  /*  */
  "_item_list_loading_device": "正在載入裝置⋯",

  /*  */
  "_no_item_view_no_somethings_user_group": "沒有群組",
  "_no_item_view_no_somethings_vpp_user_group": "沒有已啟用 VPP 的群組",

  /*  */
  "_no_item_view_no_somethings_found_widget": "找不到 Widget",

  /*  */
  "_item_list_loading_tasks_active": "正在載入啟用的作業⋯",

  /*  */
  "_no_item_view_is_truncation_indicator_device_group": "使用搜尋來尋找「裝置群組」",
  "_no_item_view_is_truncation_indicator_location": "使用搜尋來尋找「位置」",

  /*  */
  "_item_list_loading_user": "正在載入使用者⋯",

  /*  */
  "_no_item_view_no_somethings_tasks_active": "沒有啟用的作業",

  /*  */
  "_item_list_loading_tasks_complete": "正在載入完成的作業⋯",

  /*  */
  "_no_item_view_no_somethings_device_group": "沒有裝置群組",
  "_no_item_view_no_somethings_location": "沒有位置",

  /*  */
  "_uploading_filename": "正在上傳%@1⋯",

  /* This is the width of the Upload button inside the iOS App picker. */
  "_layout_apps_picker_upload_button_width": "100",

  /* This is the width of the menu that appears when you click the Perform Task Button in the bottom toolbar for Library Items. */
  "_layout_toolbar_perform_task_button_menu_width": "175",
  "_layout_toolbar_perform_task_button_menu_width_for_placeholder": "170",
  /* Width of the new task sheet*/
  "_layout_new_task_sheet_width": "350",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_user chooses any volume": "使用者選擇了卷宗",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_user chooses any external volume": "使用者選擇了外部卷宗",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_user chooses any internal volume": "使用者選擇了內部卷宗",

  /* This is the width of the menu itmes for the iOS Restrictions' Media Content Allowed content ratings popup menus */
  "_layout_allowed_content_popup_menu_items_width": "195",

  /*  */
  "_cfprefs_knob_set_num_lines": "2",

  /*  */
  "_identification_knob_set_name": "識別身分",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Spotlight": "Spotlight",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_iCloud": "iCloud",

  /*  */
  "_identification_knob_set_num_lines": "1",

  /*  */
  "_identification_knob_set_description": "",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user enters the password upon profile installation": "使用者在安裝描述檔時輸入密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user display name for the accounts": "帳號的使用者顯示名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt text for any of the above values": "以上任何值的提示文字",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt Message": "提示訊息",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user name for the accounts": "帳號的使用者名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User Enters Password": "使用者輸入密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The email address for the accounts": "帳號的電子郵件位址",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt": "提示",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password for the accounts": "帳號的密碼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Additional descriptive text for the Prompt field": "「提示」欄位的其他說明文字",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Set in Identification": "在識別身分中設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Anywhere": "任何來源",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Do not allow user to override Gatekeeper setting": "不允許使用者覆蓋 Gatekeeper 設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allowed Applications": "允許的 App",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Mac App Store": "Mac App Store",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate Server": "憑證伺服器",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The name of the CA": "CA 的名稱",

  /*  */
  "_gatekeeper_knob_set_num_lines": "1",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prevents the user from temporarily overriding the Gatekeeper setting by control-clicking to install any app": "按住 Control 鍵來安裝 App，以防止使用者暫時覆蓋 Gatekeeper 設定。",
  "_generic_string_Allow user to change password": "允許使用者更改密碼",
  "_generic_string_Require password after sleep or screen saver begins": "進入睡眠或螢幕保護程式後需要密碼",
  "_generic_string_Allow user to set lock message": "允許使用者設定鎖定訊息",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Mac App Store and identified developers": "Mac App Store 和已識別的開發者",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The username with which to authenticate to the certificate server": "用以認證憑證伺服器的使用者名稱",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt for credentials": "提示憑證",

  /*  */
  "_gatekeeper_knob_set_description": "",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt the user for credentials.  This setting is not supported for pushed profiles": "提示使用者提供憑證。此設定不支援推播的描述檔",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Gatekeeper": "Gatekeeper",
  "_generic_string_General (OS X Only)": "一般（僅 OS X）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password with which to authenticate to the certificate server": "用以認證憑證伺服器的密碼",

  /*  */
  "_gatekeeper_knob_set_name": "",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The description of the certificate request as shown in the certificate selector of other payloads such as VPN and Network": "憑證要求的描述如同其他承載資料（例如 VPN 和「網路」）憑證選擇器中所顯示的一樣",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow applications downloaded from:": "允許從以下來源下載的 App：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Users cannot open an unsigned application ...": "使用者無法打開未經簽署的 App⋯",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate Authority": "憑證授權",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate Template": "憑證樣板",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The name of the certificate template, usually Machine or User": "憑證樣板名稱，通常為「機器」或「使用者」",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The network address of the certificate server": "憑證伺服器的網路位址",

  /* This layout gives the height of the Disable ability to open disallowed applications using the Finder checkbox */
  "_layout_privacy_force_disallow_app_checkbox_height": "20",

  /* This layout gives the height of the Disable ability to open disallowed applications using the Finder checkbox description*/
  "_layout_privacy_force_disallow_app_description_height": "40",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My Messages Account": "我的訊息帳號",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow iBooks Store (Supervised devices only)": "允許 iBooks Store（僅限監管裝置）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow explicit sexual content in iBooks Store": "允許 iBooks Store 中不適當的成人內容",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow iCloud photo sharing": "允許 iCloud 照片共享",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Shared PhotoStream Send Invitation": "允許傳送「共享的照片串流」邀請",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Shared PhotoStream Receive Invitation": "允許接收「共享的照片串流」邀請",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Passbook while device locked": "允許在鎖定畫面上顯示 Passbook 通知",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow installing configuration profiles (Supervised devices only)": "允許安裝設定描述檔（僅限監管裝置）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow use of Messages": "允許 iMessage（僅限監管裝置）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Consent": "許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Consent Text Description": "許可文字描述",

  /* This is a generic string used one or more times in the app. */
  "_general_string_Lock To App": "鎖定至 App",

  /* This is a generic string used one or more times in the app. */
  "_general_string_Limit an iOS device to one app": "限制 iOS 裝置僅使用一個 App（僅限監管裝置）",

  /* System Application Names */
  "_general_string_app_name_Safari": "Safari",
  "_general_string_app_name_Videos": "視訊",
  "_general_string_app_name_Calendar": "行事曆",
  "_general_string_app_name_Music": "音樂",
  "_general_string_app_name_Contacts": "聯絡資訊",
  "_general_string_app_name_Messages": "訊息",
  "_general_string_app_name_Maps": "地圖",
  "_general_string_app_name_Reminders": "提醒事項",
  "_general_string_app_name_Photos": "照片",
  "_general_string_app_name_Mail": "郵件",
  "_general_string_app_name_Notes": "附註",

  "_generic_string_Touch": "觸碰",
  "_generic_string_Device Rotation": "動作",
  "_generic_string_Volume Buttons": "音量按鈕",
  "_generic_string_Ringer Switch": "側邊切換",
  "_generic_string_Sleep/Wake Button": "睡眠/喚醒按鈕",
  "_generic_string_Auto-Lock": "自動鎖定",
  "_generic_string_VoiceOver": "VoiceOver",
  "_generic_string_Zoom": "縮放",
  "_generic_string_Invert Colors": "反相顏色",
  "_generic_string_AssistiveTouch": "AssistiveTouch",
  "_generic_string_Speak Selection": "朗讀所選範圍",
  "_generic_string_Mono Audio": "單聲道音訊",

  "_generic_string_Settings enforced when in Single App Mode": "在「單一 App 模式」中強制使用設定",
  "_generic_string_Allow the user to change these settings when in Single App Mode": "允許使用者在「單一 App 模式」中更改這些設定",
  "_general_string_The app to run in Single App Mode (Supervised devices only)": "在「單一 App 模式」中執行 App（僅限監管裝置）",
  /* This is a generic string used one or more times in the app. */
  "_general_string_Settings for automatic profile removal": "自動移除描述檔的設定",

  /* This is a generic string used one or more times in the app. */
  "_general_string_On date": "於日期",

  /* This is a generic string used one or more times in the app. */
  "_general_string_After interval": "在此間隔之後",

  /* used in mail and exchange knob sets */
  "_generic_string_Allow recent addresses to be synced": "允許同步最近的位址",
  "_generic_string_Include this account in recent address syncing": "在最近同步的位址中包含此帳號",

  /* Date display format for each locale */
  "_generic_date_format": "%Y/%m/%d",


  /* This is a generic string used one or more times in the app. */
  "_generic_string_Delete Application Confirmation": "要刪除 App 嗎？",
  "_generic_string_Delete Apps Confirmation": "要刪除 App 嗎？",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_This application will be removed from all devices.": "App 將會從所有裝置上移除。",
  "_generic_string_The apps will be removed from all devices.": "App 將會從所有裝置上移除。",

  /* Time machine strings */
  "_global_time_machine_knob_set_name": "Time Machine",
  "_global_time_machine_knob_set_description": "使用此部分來配置 Time Machine 設定。",
  "_generic_string_Backup destination URL": "備份伺服器",
  "_generic_string_The URL to backup destination (e.g., afp://server.example.com/)": "備份目標的 URL（例如 afp://server.example.com/backups/）",
  "_generic_string_Backup all volumes": "備份所有卷宗",
  "_generic_string_Only startup volume is backed up by default": "預設僅備份啟動卷宗",
  "_generic_string_Backup system files and folders": "備份系統檔案和檔案夾",
  "_generic_string_System files and folders are skipped by default": "預設略過系統檔案和檔案夾",
  "_generic_string_Automatic backups": "啟用自動備份",
  "_generic_string_Enable automatic backups": "定期自動備份",
  "_generic_string_Mobile backups": "啟用本機快照（僅限 10.8 和以上版本）",
  "_generic_string_Enable local snapshots (10.8 and above only)": "未連接網路時，製作本機備份快照",
  "_generic_string_BackupSize Limit": "備份大小限制",
  "_generic_string_BackupSize limit in MB. Set to 0 for unlimited": "備份大小限制（以 MB 為單位），設為 0 則無限制",
  "_generic_string_Paths to backup:": "指向備份的路徑：",
  "_generic_string_The startup volume is always backed up": "總是備份啟動卷宗",
  "_generic_string_Paths to skip:": "要略過的路徑：",
  "_generic_string_The paths to skip from startup volume": "啟動卷宗上要略過的路徑",

  /* Dictation restriction */
  "_generic_string_Disable use of Dictation": "停用聽寫",

  /* Security and Privacy */
  "_generic_string_FileVault (OS X Only)": "FileVault（僅 OS X）",
  "_generic_string_Privacy": "隱私",
  "_generic_string_Require FileVault": "需要 FileVault",
  "_generic_string_If not already enabled, FileVault will be enabled at the next logout": "若尚未啟用，則會在下次登出時啟用 FileVault",
  "_generic_string_Defer FileVault setup": "延遲 FileVault 設定",
  "_generic_string_Defers FileVault setup until the current user logs out": "延遲 FileVault 設定直到目前使用者登出",
  "_generic_string_Create recovery key": "製作個人恢復密鑰",
  "_generic_string_Create a personal FileVault recovery key": "製作個人 FileVault 恢復密鑰",
  "_generic_string_Recovery key location": "個人恢復密鑰位置",
  "_generic_string_Location to store the recovery key": "用以儲存個人恢復密鑰的位置",
  "_generic_string_Create institutional recovery user": "使用機構恢復密鑰",
  "_generic_string_Create a personal FileVault recovery key and use an institutional recovery key": "使用機構恢復密鑰並製作個人 FileVault 恢復密鑰",
  "_generic_string_Creates a institutional recovery user using the FileVault Master keychain": "啟用透過機構鑰匙圈取用加密磁碟",
  "_generic_string_FileVault username": "指定 FileVault 使用者名稱",
  "_generic_string_FileVault enabled user, current logged in user is used by default": "已啟用 FileVault 的使用者，預設值是使用目前登入的使用者",
  "_generic_string_FileVault user password": "指定 FileVault 使用者密碼",
  "_generic_string_Password for the FileVault enabled user": "已啟用 FileVault 的使用者密碼",
  "_generic_string_Certificate that contains the public key from institutional recovery keychain": "憑證包含來自機構恢復鑰匙圈的公用密鑰",
  "_generic_string_Require user to unlock FileVault after hibernation": "休眠後需要使用者解鎖 FileVault",
  "_generic_string_The user will be required to unlock FileVault when the computer awakes from hibernation": "當電腦從休眠喚醒後，使用者必須解鎖 FileVault",
  "_generic_string_Allow user to disable FileVault": "允許使用者停用 FileVault",

  /* Checkpoint VPN */
  "_generic_string_Check Point Mobile VPN": "檢查點行動 VPN",

  /* Single App Mode */
  "_generic_string_Single App Mode": "單一 App 模式",

  /* Finder Knob set */
  "_global_finder_knob_set_name": "Finder",
  "_global_finder_knob_set_description": "使用此部分來配置 Finder 設定。",
  "_generic_string_Commands": "指令",
  "_generic_string_Select commands available to users": "選擇使用者可用的指令",
  "_generic_string_Opens a dialog box for finding servers on the network": "打開對話框來尋找網路上的伺服器",
  "_generic_string_Connect to Server": "連接伺服器",
  "_generic_string_Eject": "退出",
  "_generic_string_Ejects removable media and mountable volumes": "退出可移除媒體和可裝載卷宗",
  "_generic_string_Burn Disc": "燒錄光碟",
  "_generic_string_Writes permanent information to a CD or DVD": "將永久資訊燒錄到 CD 或 DVD",
  "_generic_string_Go to Folder": "前往檔案夾",
  "_generic_string_Allows user to open files or folders by typing a pathname": "允許使用者輸入路徑名稱來打開檔案或檔案夾",
  "_generic_string_Restart": "重新啟動",
  "_generic_string_Makes the restart command appear in the Apple menu": "讓重新啟動指令顯示在「蘋果」選單中",
  "_generic_string_Makes the shut down command appear in the Apple menu": "讓關機指令顯示在「蘋果」選單中",
  "_generic_string_Show these items on the desktop": "在桌面上顯示這些項目",
  "_generic_string_Hard disks": "硬碟",
  "_generic_string_External disks": "外接磁碟",
  "_generic_string_CDs, DVDs and iPods": "CD、DVD 和 iPod",
  "_generic_string_Connected servers": "連接的伺服器",
  "_generic_string_Use regular Finder": "使用正常 Finder",
  "_generic_string_Use simple Finder": "使用簡易 Finder",
  "_generic_string_Show warning before emptying the Trash": "清空垃圾桶前顯示警告",

  /* Security Info FileVault Reporting */
  "_generic_string_Yes": "是",
  "_generic_string_No": "否",
  "_generic_string_FileVault Enabled": "已啟用 FileVault",
  "_generic_string_FileVault has personal key": "個人恢復密鑰",
  "_generic_string_FileVault has institutional key": "機構恢復密鑰",
  "_filevault_status_Recovery Key Set": "設定",
  "_filevault_status_Recovery Key Not Set": "尚未設定",
  "_generic_string_Activation Lock Enabled": "已啟動啟用鎖定",
  "_generic_string_Activation Lock Bypass Code": "啟用鎖定略過代碼",
  "_no_activation_lock_bypass_code": "無",

  /* Sharing Services */
  "_restrictions_tab_header_Sharing": "共享",
  "_generic_string_Select services that should be available in the share menu": "選擇應該顯示在共享選單中的服務",
  "_generic_string_AirDrop": "AirDrop",
  "_generic_string_Facebook": "Facebook",
  "_generic_string_Twitter": "Twitter",
  "_general_string_chinese_blog_name_SinaWeibo": "新浪微博",
  "_generic_string_Enable New Share Services": "自動啟用新的共享服務",
  "_general_string_Video Services - Flickr, Vimeo, Tudou and Youku": "視訊服務 - Flickr、Vimeo、土豆網和優酷",
  "_generic_string_New share services will be enabled in the share menu automatically": "新的共享服務將自動在共享選單中啟用",
  "_general_string_Add to iPhoto": "加入到 iPhoto",
  "_general_string_Add to Aperture": "加入 Aperture",
  "_general_string_Add to Reading List": "加入閱讀列表",

  "_restrictions_tab_header_Desktop": "桌面",
  "_generic_string_Lock Desktop Picture": "鎖定桌面圖片",
  "_lock_desktop_picture_description": "防止使用者修改所選的桌面圖片",
  "_generic_string_Picture Path": "桌面圖片路徑",
  "_lock_desktop_picture_path_description": "用來做為桌面圖片的檔案路徑。將路徑留空來使用目前在裝置上選取的項目。",
  "_mac_restrictions_segment_view_width": "490",

  /* Universal Access */
  "_global_universal_access_knob_set_name": "輔助使用",
  "_global_universal_access_knob_set_description": "使用此部分來配置「輔助使用」設定。",
  "_generic_string_Seeing": "視力",
  "_generic_string_Hearing": "聽力",
  "_accessibility_seeing_tab_width": "480",
  "_accessibility_interactivity_tab_width": "480",
  "_accessibility_interactivity_tab_label_width": "180",
  "_generic_string_Interacting": "互動",
  "_generic_string_Enable Zoom via ScrollWheel:": "啟用透過滾輪縮放：",
  "_generic_string_Zoom Options": "縮放選項",
  "_generic_string_Enable Zoom via Keyboard:": "啟用透過鍵盤縮放：",
  "_generic_string_Minimum Zoom:": "縮放最小值：",
  "_generic_string_Maximum Zoom:": "縮放最大值：",
  "_generic_string_Show preview rectangle when zoomed out:": "縮小時顯示預覽長方格：",
  "_generic_string_Smooth images:": "平滑影像：",
  "_generic_string_Display Options": "顯示選項",
  "_generic_string_Invert colors:": "反相顏色：",
  "_generic_string_Use grayscale:": "使用灰階：",
  "_generic_string_Enhance Contrast:": "增強對比：",
  "_generic_string_Cursor size:": "游標大小：",
  "_generic_string_VoiceOver Options": "VoiceOver 選項",
  "_generic_string_Enable VoiceOver:": "啟用 VoiceOver：",
  "_generic_string_Flash the screen when an alert occurs": "發出提示時閃爍螢幕",
  "_generic_string_Play stereo audio as mono": "以單聲道播放立體音訊",
  "_generic_string_Enable Sticky Keys": "啟用按鍵暫留",
  "_generic_string_Display pressed keys on screen": "在螢幕上顯示按下的按鍵",
  "_generic_string_Beep when a modifier key is set": "設定變更鍵時發出嗶聲",
  "_generic_string_Acceptance delay": "停頓時間：",
  "_generic_string_Use click key sounds": "使用按鍵音效：",
  "_generic_string_Enable Slow Keys": "啟用慢速按鍵",
  "_generic_string_Enable Mouse Keys": "啟用模擬滑鼠",
  "_generic_string_Initial delay:": "開始前的暫延：",
  "_generic_string_Maximum speed": "最快速度：",
  "_generic_string_Ignore built-in trackpad:": "忽略內建觸控式軌跡板：",
  "_generic_string_short": "短",
  "_generic_string_Long": "長",
  "_generic_string_fast": "快",
  "_generic_string_slow": "慢",
  "_generic_string_time_milliseconds": "毫秒",

  /* Game Center Stuff */
  "_generic_string_Allow GameCenter": "允許使用 Game Center（僅限監管裝置）",
  "_generic_string_Allow Game Center": "允許使用 Game Center",
  "_generic_string_Allow Game Center account modification": "允許修改 Game Center 帳號",
  "_generic_string_Allow adding Game Center friends": "允許加入 Game Center 朋友",
  "_generic_string_Allow App Store app adoption": "允許接受 App Store App",
  "_generic_string_Allow Multiplayer Gaming": "允許多人遊戲",
  "_generic_string_Allow multiplayer gaming": "允許多人遊戲",

  /* Content Library Sidebar Item */
  "_content_sidebar_item_display_name": "內容",
  "_generic_string_Get More Apps": "取得更多 App",
  "_vpp_get_more_apps_button_width": "115",
  "_generic_string_Get More Books": "取得更多書籍",
  "_vpp_get_more_books_button_width": "115",
  "_vpp_portal_url": "https://vpp.itunes.apple.com/?l=en",

  /* Application Filter Strings*/
  "_application_filter_type_string_All Kinds": "所有種類",
  "_application_filter_type_string_iPad": "iPad",
  "_application_filter_type_string_iPhone+iPad": "iPhone+iPad",
  "_application_filter_type_string_iPod+iPhone+iPad": "iPod+iPhone+iPad",
  "_application_filter_type_string_iPhone": "iPhone",
  "_application_filter_type_string_iPod+iPhone": "iPod+iPhone",
  "_application_filter_type_string_Mac": "Mac",
  "_application_filter_type_string_OSX": "OS X",
  "_application_filter_type_string_iOS": "iOS",
  "_application_filter_license_type_Enterprise": "企業級",
  "_application_filter_license_type_App Store": "App Store",
  "_application_filter_category_All Categories": "所有類別",
  "_search_hint_Search Apps": "搜尋 App",
  "_search_hint_Search Books": "搜尋書籍",

  /* Unified Applications Table View */
  "_table_header_Name": "名稱",
  "_table_header_Category": "類別",
  "_table_header_Size": "大小",
  "_table_header_Purchased": "已購買",
  "_table_header_Assigned": "已指定",
  "_table_header_UnFulfilled": "未完成",
  "_table_header_Members": "成員",
  "_table_header_Available": "可用",
  "_table_header_Kind": "種類",
  "_table_header_Assigned To": "已指定到",
  "_table_header_Device Name": "裝置名稱",
  "_table_header_Password": "密碼",
  "_table_header_Include Password": "包含密碼",

  "_table_header_Settings": "設定",
  "_table_header_App": "App",
  "_table_header_User": "使用者",
  "_table_header_Target": "目標",
  "_table_header_Status": "狀態",
  "_table_header_Last Updated": "上次更新",

  "_generic_string_size_KB": "%@1 KB",
  "_generic_string_size_MB": "%@1 MB",
  "_generic_string_size_GB": "%@1 GB",
  "_generic_string_app_count_and_size_fmt_KB": "%@1 個 App，%@2 KB",
  "_generic_string_app_count_and_size_fmt_MB": "%@1 個 App，%@2 MB",
  "_generic_string_app_count_and_size_fmt_GB": "%@1 個 App，%@2 GB",
  "_application_filter_type_string_iPhone,iPad,iPod": "iPod，iPhone，iPad",
  "_application_filter_type_string_iPhone,iPad": "iPhone，iPad",
  "_application_filter_type_string_iPhone,iPod": "iPod，iPhone",
  "_application_type_OSX": "OS X",
  "_application_type_iOS": "iOS",

  /* Genesis Views */
  "_generic_string_Add Enterprise App": "加入企業級 App",
  "_generic_string_Volume Purchase": "大量採購方案",
  "_generic_string_Choose apps from your library": "從您的資料庫中選擇 App",
  "_generic_string_Choose in-house enterprise apps from your library": "從資料庫中選擇內部企業級 App",
  "_generic_string_Choose books from your library": "從您的書庫中選擇書籍",
  "_assign_unified_apps_description": "您可以指定透過「大量採購方案」購買的 App，或加入至「描述檔管理程式」的內部企業級 App。",
  "_assign_inhouse_enterprise_apps_description": "您可以指定加入至「描述檔管理程式」的內部企業級 App",
  "_assign_books_description": "您可以指定使用「大量採購方案」購買的書籍。",
  "_generic_string_Purchased": "已購買",
  "_generic_string_Available_Licenses": "可用",
  "_generic_string_Assignment": "指定",
  "_generic_string_Groups": "群組",
  "_generic_string_profile_manager_apps_feature_description": "「描述檔管理程式」可讓您輕易地指定和分配透過「大量採購方案」購買的 App 給使用者和群組。您也可以分配使用 iOS Developer Enterprise Program 部署到登記裝置上的 App。",
  "_generic_string_profile_manager_apps_feature_description_no_device_management": "「描述檔管理程式」可讓您輕易地指定和分配透過「大量採購方案」購買的 App 給使用者和群組。",
  "_generic_string_profile_manager_books_feature_description": "「描述檔管理程式」可讓您輕易地指定透過「大量採購方案」購買的書籍給使用者和群組。",
  "_generic_string_profile_manager_device_genesis_description": "「描述檔管理程式」可輕易地管理 Apple 裝置。您可以自定不同的設定，並套用至每一部登記裝置。",
  "_generic_string_profile_manager_device_group_genesis_description": "「描述檔管理程式」可輕易地將 Apple 裝置整理成群組。您可以自定不同的設定，並套用至群組中的每一部登記裝置。",
  "_button_label_Add Device Group": "加入裝置群組",
  "_button_label_Enroll Device": "登記裝置",
  "_button_text_Learn More": "瞭解登記裝置",
  "_button_width_learn_more": "115",
  "_genesis_view_width": "800",

  /* Books Library */
  "_generic_string_Books": "書籍",
  "_generic_string_book_count": "%@1 本書",
  "_generic_string_book_count_and_size_fmt_KB": "%@1 本書，%@2 KB",
  "_generic_string_book_count_and_size_fmt_MB": "%@1 本書，%@2 MB",
  "_generic_string_book_count_and_size_fmt_GB": "%@1 本書，%@2 GB",

  /* VPP Content detail page */
  "_generic_string_This app is designed for both iPhone and iPad": "此 App 是為 iPhone 和 iPad 設計的",
  "_generic_string_View in App Store": "於 App Store 檢視",
  "_generic_string_Developer Website": "開發人員網站",
  "_generic_string_VPP Website": "VPP 網站",
  "_generic_string_Category: %@": "類別：%@",
  "_generic_string_Updated: %@": "更新於：%@",
  "_generic_string_Version: %@": "版本：%@",
  "_generic_string_Size: %@": "大小：%@",
  "_generic_string_Choose Groups": "選擇群組",
  "_generic_string_choose_vpp_enabled_groups": "選擇已啟用 VPP 的群組",
  "_assign_user_groups_to_app_description": "選擇要指定 App 的使用者群組（已啟用 VPP）。App 會依據使用者於何時接受「VPP 管理分配」登記，按時間先後的順序來加以指定。",
  "_generic_string_Choose users": "選擇使用者",
  "_assign_users_to_app_description": "選擇 App 應指定的使用者。",
  "_view_more_info_...More": "⋯更多",
  "_view_more_info_...Less": "⋯較少",
  "_search_hint_Search Groups": "搜尋群組",
  "_search_hint_search_vpp_enabled_groups": "搜尋已啟用 VPP 的群組",
  "_search_hint_Search Users": "搜尋使用者",
  "_generic_string_Go back": "返回上一頁",
  "_generic_string_Loading Application Information...": "正在載入應用程式資訊⋯",
  "_layout_vpp_content_left_detail_view_width": "160",

  "_generic_string_VPP Managed Distribution": "VPP 管理分配",

  // height of the vpp section in user group's about tab. This should account for longer status strings in different locales.
  "_user_group_about_vpp_section_height": '450',
  "_generic_string_Enrolled": "已登記",
  "_generic_string_Not Enrolled": "未登記",
  "_generic_string_Send Email Invitation...": "傳送電子郵件邀請⋯",
  "_generic_string_Send Email Invitation": "傳送電子郵件邀請",
  "_vpp_invitation_string_invitation_not_sent": "尚未傳送邀請給這位使用者。",
  "_invitation_status_An invitation has not been sent via Email": "尚未透過電子郵件傳送邀請",
  "_vpp_invitation_status_An invitation has not been sent to <device name>": "尚未傳送邀請給「%@」",
  "_generic_string_Send Invitation to <Device Name>": "傳送邀請給「%@」",
  "_generic_string_Resend Invitation...": "重新傳送邀請⋯",
  "_generic_string_Resend Invitation": "重新傳送邀請",
  "_generic_string_This user un-enrolled from the program on <status_update_date>.": "此使用者已於 %@ 取消登記程式。",
  "_generic_string_This user was removed from the program on <vpp_status_updated_at>.": "此使用者已於 %@ 從程式中移除。",
  "_generic_string_No apps or books are assigned to this user.": "未指定 App 或書籍給這位使用者。",
  "_generic_string_Remove From Program": "從程式中移除",
  "_vpp_enrollment_status_This user was enrolled to receive content on <vpp_status_updated_at>.": "此使用者已登記來接收 %@ 上的內容。",
  "_generic_string_An invitation was sent to <email_address> on <last_invited_date>": "已於 %@2 傳送邀請至 %@1",
  "_generic_string_An invitation was requested to be sent to <email_address> on <last_invited_date>": "已要求於%@2傳送邀請至 %@1。",
  "_generic_string_Enter email address": "輸入電子郵件位址",

  "_layout_vpp_invite_pane_width": "350",
  "_layout_vpp_invite_pane_cancel_button_offset_right": "180",

  // VPP Group Enrollments
  "_enable_vpp_service_for_user_group": "啟用 VPP 管理分配服務",
  "_processing_vpp_service_on_user_group_description": "正在處理 VPP 資訊⋯",
  "_generic_string_Disable VPP Managed Distribution Services": "停用 VPP 管理分配服務",
  "_generic_string_All VPP assignments to this group will be removed. Current book assignments to enrolled users will be unaffected.": "將移除此群組的所有 VPP 指定。不會影響已登記之使用者的現有書籍指定。",
  "_layout_disable_vpp_alert_pane_width": "550",
  "_vpp_group_enrollment_status_No Users Enrolled": "未登記使用者",
  "_vpp_group_enrollment_status_No Users": "沒有使用者",
  "_vpp_group_enrollment_status_All Users Enrolled": "已登記所有使用者",
  "_vpp_group_enrollment_status_X of Y Users Enrolled": "已登記 %@ 個使用者（共 %@ 個）",
  "_user_group_enrollment_info_These users were enrolled to receive content on <time>": "已登記這些使用者來接收 %@ 上的內容",
  "_user_group_enrollment_info_These users were enrolled to receive content between <start_time> and <end_time>": "在 %@ 和 %@ 之間已登記使用者接收內容",
  "_group_users_type_Users not previously invited": "之前未邀請使用者",
  "_group_users_type_Users not enrolled": "使用者未登記",
  "_vpp_group_invitation_string_Invite:": "邀請：",
  "_user_group_vpp_no_email_invitations_sent": "尚未透過電子郵件傳送邀請給任何使用者",
  "_user_group_vpp_no_device_invitations_sent": "尚未傳送邀請至任何使用者的裝置",
  "_vpp_group_invitation_invite_label_width": "42",
  "_user_group_vpp_action_Send VPP Invitation to Devices": "傳送邀請至使用者的裝置",

  "_user_group_email_invitation_status_Email Invitations were sent to X of Y users on <time>": "已在 %@3 透過電子郵件傳送邀請給 %@1 個未登記的使用者（共 %@2 個）",
  "_user_group_email_invitation_status_Email Invitations were sent to X of Y users between <start_time> and <end_time>": "已在 %@3 和 %@4 之間透過電子郵件傳送邀請給 %@1 個未登記的使用者（共 %@2 個）",
  "_user_group_device_invitation_status_Device Invitations were sent to X of Y users on <time>": "已在 %@3 傳送邀請至 %@1 個未登記使用者的裝置（共 %@2 個）",
  "_user_group_device_invitation_status_Device Invitations were sent to X of Y users between <start_time> and <end_time>": "已在 %@3 和 %@4 之間傳送邀請至 %@1 個未登記使用者的裝置（共 %@2 個）",

  "_layout_user_group_vpp_enrollment_in_progress_status_height": "45",
  "_layout_user_group_vpp_email_invitation_in_progress_status_height": "45",
  "_layout_user_group_vpp_device_invitation_in_progress_status_height": "45",

  // User group vpp invitation confirmation dialogues
  "_user_group_vpp_device_invite_alert_Send Invitation": "傳送邀請",
  "_user_group_vpp_email_alert_uninvited": "要傳送電子郵件邀請給 %@ 個之前未邀請的使用者嗎？",
  "_user_group_vpp_email_alert_uninvited_single_user": "要傳送電子郵件邀請給 1 個之前未邀請的使用者嗎？",
  "_user_group_vpp_email_alert_unenrolled": "要傳送電子郵件邀請給 %@ 個目前未登記的使用者嗎？",
  "_user_group_vpp_email_alert_unenrolled_single_user": "要傳送電子郵件邀請給 1 個目前未登記的使用者嗎？",
  "_user_group_vpp_device_alert_uninvited": "要傳送邀請至 %@ 個之前未邀請使用者的裝置上嗎？",
  "_user_group_vpp_device_alert_uninvited_single_user": "要傳送邀請至 1 個之前未邀請使用者的裝置上嗎？",
  "_user_group_vpp_device_alert_unenrolled": "要傳送邀請至 %@ 個目前未登記使用者的裝置上嗎？",
  "_user_group_vpp_device_alert_unenrolled_single_user": "要傳送邀請至 1 個目前未登記使用者的裝置上嗎？",

  "_user_group_email_invitation_info_All users have been invited": "已經邀請所有使用者。",
  "_user_group_email_invitation_info_none_uninvited_have_email": "先前未邀請的使用者遺失其目錄帳號中的電子郵件位址。",
  "_user_group_email_invitation_info_none_unenrolled_have_email": "未登記的使用者遺失其目錄帳號中的電子郵件位址。",
  "_user_group_email_invitation_info_x_of_y_uninvited_have_no_email": "%@ 個先前未邀請的使用者（共 %@ 個）遺失其目錄帳號中的電子郵件位址。",
  "_user_group_email_invitation_info_x_of_y_unenrolled_have_no_email": "%@ 個未登記的使用者（共 %@ 個）遺失其目錄帳號中的電子郵件位址。",
  "_user_group_device_invitation_info_none_uninvited_have_vpp_device": "先前未邀請的使用者沒有登記合格的裝置。",
  "_user_group_device_invitation_info_none_unenrolled_have_vpp_device": "未登記的使用者沒有登記合格的裝置。",
  "_user_group_device_invitation_info_x_of_y_uninvited_have_no_vpp_device": "%@ 個先前未邀請的使用者（共 %@ 個）沒有登記合格的裝置。",
  "_user_group_device_invitation_info_x_of_y_unenrolled_have_no_vpp_device": "%@ 個未登記的使用者（共 %@ 個）沒有登記合格的裝置。",

  "_mdm_enabled_user_vpp_invite_revoked_description": "此服務的取用權限已在「%@」上撤銷。將不會自動傳送新的邀請。",
  "_mdm_enabled_user_vpp_service_unenrolled_description": "此使用者已於 %@ 取消登記這項服務。將不會自動傳送新的邀請",
  "_mdm_enabled_user_vpp_service_enrolled_description": "登記於 %@",
  "_vpp_date_time_format": "%Y 年 %B 月 %d 日，%p %i:%M",
  "_generic_string_Revoke access": "撤銷連線",
  "_vpp_content_No content is assigned to this user.": "未指定內容給這位使用者",
  "_vpp_device_status_This user does not have a device enrolled that supports this service.": "此使用者沒有登記支援此服務的裝置。",
  "_mdm_enabled_user_vpp_service_enrolled_no_devices_description": "使用者沒有登記支援此服務的裝置",
  "_generic_string_An invitation was requested to be sent to %@1 on %@2": "已要求於%@2傳送邀請至 %@1。",
  "_generic_string_An invitation was sent to %@1 on %@2": "已於 %@2 傳送邀請至 %@1",
  "_generic_string_Send invitation via email": "透過電子郵件傳送邀請",
  "_mdm_disabled_user_invited_for_vpp_service_description": "已於 %@2 傳送邀請至 %@1",
  "_mdm_disabled_user_revoked_for_vpp_service_description": "此服務的取用權限已在「%@」上撤銷。將不會自動傳送新的邀請。",
  "_mdm_disabled_user_unenrolled_for_vpp_service_description": "此使用者已於 %@ 取消登記這項服務。將不會自動傳送新的邀請",
  '_generic_string_Send invitation to "%@"': '傳送邀請給「%@」',
  "generic_string_authorized_users_exceeds_available_licenses_for_single_app": "您還沒有為此群組中的所有使用者購買足夠數量的「%@」。App 會依據使用者於何時接受「VPP 管理分配」登記，按時間先後的順序來加以指定。",
  "generic_string_authorized_users_exceeds_available_licenses_for_multiple_apps": "您還沒有為此群組中的所有使用者購買足夠數量的「%@」App。App 會依據使用者於何時接受「VPP 管理分配」登記，按時間先後的順序來加以指定。",
  "_processing_vpp_on_user_group_to_assign_vpp_apps": "處理過群組資訊之後即可指定 VPP App。",
  "_enabled_vpp_service_on_user_group_to_assign_vpp_apps": "在此群組上啟用 VPP 服務來指定 VPP App。",
  "_processing_vpp_on_user_group_to_assign_vpp_books": "處理過群組資訊之後即可指定書籍。",
  "_enable_vpp_service_to_assign_books": "在此群組上啟用 VPP 服務來指定書籍。",
  "_generic_string_Assign Books": "指定書籍",

  "_cloud_configuration_knob_set_name": "雲端設定",
  "_cloud_configuration_knob_set_num_lines": "2",
  "_cloud_configuration_knob_set_description": "使用此部分來定義「雲端設定」。",
  "_cloud_configuration_require_enrollment": "不允許使用者略過登記步驟",
  "_cloud_configuration_require_enrollment_hint": "必須在 MDM 中登記裝置才能完成設定",
  "_generic_string_Supervise (iOS only)": "監管（僅 iOS）",
  "_generic_string_Enable supervision and prevent unenrollment": "啟用監管並避免取消登記",
  "_generic_string_Allow Pairing": "允許配對",
  "_generic_string_Enable the iOS device to be paired with a Mac": "啟用 iOS 裝置與 Mac 配對",
  "_generic_string_Require credentials for enrollment": "需要登記憑證",
  "_generic_string_Setup Assistant Options": "設定輔助程式選項",
  "_generic_string_Choose which options to show in the assistant": "選擇在此輔助程式中顯示的選項",
  "_generic_string_Location Services": "定位服務",
  "_generic_string_Apple ID": "Apple ID",
  "_generic_string_Terms and Conditions": "條款與條件",
  "_generic_string_Send Diagnostics": "傳送診斷資料",
  "_generic_string_Siri": "Siri",
  "_generic_string_Set Up as New or Restore": "設定為新的或回復",
  "_generic_string_Make MDM Mandatory": "強制 MDM",
  "_generic_string_User may not skip applying or remove the configuration returned by the MDM server": "使用者無法略過套用或移除 MDM 伺服器傳回的設定",
  "_skip_setup_options_iOS and OSX": "iOS 和 OS X",
  "_skip_setup_option_Passcode Lock": "密碼鎖定",
  "_skip_setup_options_iOS": "iOS",
  "_skip_setup_options_OSX": "OS X",
  "_skip_setup_option_Registration": "註冊",
  "_skip_setup_option_Timezone": "時區",

  "_generic_string_Enable Zoom": "啟用縮放",
  "_generic_string_Enable Invert Colors": "啟用反相顏色",
  "_generic_string_Enable AssistiveTouch": "啟用 AssistiveTouch",
  "_generic_string_Enable Speak Selection": "啟用朗讀所選項目",
  "_generic_string_Enable Mono Audio": "啟用單聲道音訊",
  "_generic_string_Push Apps": "推播 App",
  "_generic_string_Push VPP Apps": "推播 VPP App",
  "_generic_string_Choose VPP Apps to push": "選擇要推播的 VPP App",
  "_generic_string_The selected apps will be pushed to all eligible devices of enrolled users.": "所選的 App 將會推播到已登記之使用者的所有合格裝置上。",
  "_generic_string_The selected apps will be pushed to all eligible devices of the enrolled user.": "所選的 App 將會推播到已登記之使用者的所有合格裝置上。",
  "_generic_string_The selected apps are pushed to the user's eligible devices once they enroll in VPP Managed Distribution.": "當使用者登記「VPP 管理分配」之後，所選的 App 會推播到使用者的合格裝置上。",
  "_generic_string_1 user's eligible devices will receive the selected apps once they enrolled in VPP Managed Distribution.": "使用者登記「VPP 管理分配」之後，1 個使用者的合格裝置將會接收到所選的 App。",
  "_generic_string_<count> users' eligible devices will receive the selected apps once they enrolled in VPP Managed Distribution.": "使用者登記「VPP 管理分配」之後，%@1 個使用者的合格裝置將會接收到所選的 App。",
  "_generic_string_This user does not have an eligible device to receive the selected apps.": "此使用者沒有合格的裝置可接收所選的 App。",
  "_generic_string_1 user lacks any eligible devices and will not be pushed the selected apps.": "1 個使用者沒有任何合格的裝置，將不會推播所選的 App。",
  "_generic_string_<count> users lack any eligible devices and the selected apps will not be pushed.": "%@1 個使用者沒有任何合格的裝置，將不會推播所選的 App。",
  "_generic_string_No VPP Apps assigned": "未指定 VPP App",
  "_generic_string_Select All": "全選",
  "_generic_string_No VPP apps assigned to this user.": "此使用者未指定 VPP App。",
  "_generic_string_No VPP apps assigned to this group.": "此群組未指定 VPP App。",
  "_generic_string_Enable VPP services on this group to push VPP apps.": "在此群組上啟用 VPP 服務來推播 VPP App。",
  "_generic_string_No eligible devices.": "沒有合格的裝置。",
  "_generic_string_Allow modifying account settings (Supervised devices only)": "允許修改帳號設定（僅限監管裝置）",
  "_generic_string_Allow modifying Find My Friends settings (Supervised devices only)": "允許修改「尋找我的朋友」設定（僅限監管裝置）",
  "_generic_string_Allow pairing with non-Configurator hosts (Supervised Devices only)": "允許與非 Configurator 的主機配對（僅限監管裝置）",
  "_generic_string_Allow modifying cellular data settings (Supervised devices only)": "允許修改行動數據設定（僅限監管裝置）",
  "_generic_string_Allow opening managed app documents in unmanaged apps": "在未管理 App 中允許來自已管理 App 的文件",
  "_generic_string_Allow opening unmanaged app documents in managed apps": "在已管理 App 中允許來自未管理 App 的文件",
  "_generic_string_Allow Control Center on lock screen": "在鎖定畫面上顯示「控制中心」",
  "_generic_string_Show notifications view on lock screen": "在鎖定畫面上顯示「通知中心」",
  "_generic_string_Show today view on lock screen": "在鎖定畫面上顯示「今日」顯示方式",
  "_generic_string_Allow user-generated content in Siri (Supervised devices only)": "在 Siri 中允許使用者產生的內容（僅限監管裝置）",
  "_generic_string_Allow AirDrop (Supervised devices only)": "允許 AirDrop（僅限監管裝置）",
  "_generic_string_Require passcode on first AirPlay pairing": "在第一次 AirPlay 配對時需要密碼",

  "_locations_sidebar_item_display_name": "所在位置",
  "_generic_string_Prompt User To Enroll Device": "提示使用者登記裝置",
  "_generic_string_Prompt the user in the setup assistant to enroll in device management": "在設定輔助程式中提示使用者登記裝置管理",

  // AD Certificate
  /* This is the name of the Setting Type for AD Cert settings. */
  "_ad_cert_knob_set_name": "AD 憑證",
  /* This is a generic string used one or more times in the app. */
  "_generic_string_My AD Certificate": "我的 AD 憑證",
  /* This layout gives the height of the description label of the description field in the AD Cert Payload*/
  "_layout_ad_cert_description_field_height": "40",
  "_ad_cert_Machine": "機器",
  "_ad_cert_User": "使用者",

  // Global HTTP Proxy
  "_generic_string_Allow direct connection if PAC is unreachable": "若無法連接 PAC 則允許直接連線",
  "_generic_string_Allow bypassing proxy to access captive networks": "允許略過代理伺服器來連接限制網路",

  // Network
  "_generic_string_PAC Fallback": "PAC 回降",
  "_generic_string_Enable to allow direct connection if PAC is unreachable": "若無法連接 PAC 則啟用來允許直接連線",
  "_generic_string_Legacy Hotspot": "舊有熱點",
  "_generic_string_Passpoint": "Passpoint",
  "_generic_string_Provider Display Name": "供應商顯示名稱",
  "_generic_string_Display name of the Passpoint service provider": "顯示 Passpoint 服務供應商名稱",
  "_generic_string_Domain Name": "網域名稱",
  "_generic_string_Domain name of the Passpoint service provider": "Passpoint 服務供應商網域名稱",
  "_generic_string_Roaming Consortium OIs": "漫遊協會 OI",
  "_generic_string_Roaming Consortium Organization Identifiers": "漫遊協會組織識別碼",
  "_generic_string_Roaming Consortium OI": "漫遊協會 OI",
  "_generic_string_NAI Realm Names": "NAI 領域名稱",
  "_generic_string_Network Access Identifier Realm Names": "網路連線識別碼領域名稱",
  "_generic_string_NAI Realm Name": "NAI 領域名稱",
  "_generic_string_MCC/MNCs": "MCC/MNC",
  "_generic_string_Mobile Country Code and Mobile Network Configurations": "行動電話國碼和行動網路設定",
  "_generic_string_MCC": "MCC",
  "_generic_string_MNC": "MNC",
  "_generic_string_Connect to roaming partner Passpoint networks": "連接漫遊合作 Passpoint 網路",
  "_generic_string_Add Mobile Country Code and Mobile Network Configuration": "加入行動電話國碼和行動網路設定",
  "_generic_string_MCC:": "MCC：",
  "_generic_string_MNC:": "MNC：",

  // Web Content Filter
  "_global_web_content_filter_knob_set_name": "網頁內容過濾器",
  "_global_web_content_filter_knob_set_description": "使用此部分來設定裝置可連接哪些 URL。這些設定只會影響監管的裝置。",
  "_global_web_content_filter_knob_set_num_lines": "1",
  "_generic_string_Allowed Websites": "允許的網站",
  "_web_content_filter_Limit Adult Content": "限制成人內容",
  "_web_content_filter_Specific Websites Only": "僅特定網站",
  "_web_content_filter_Permitted URLs": "允許的 URL",
  "_web_content_filter_Specific URLs that will be allowed": "允許的特定 URL",
  "_web_content_filter_Blacklisted URLs": "加入黑名單的 URL",
  "_web_content_filter_Additional URLs that will not be allowed": "其他不被允許的 URL",
  "_web_content_filter_Specific Websites": "特定網站",
  "_web_content_filter_Allowed URLs which will be shown as bookmarks": "允許的 URL 將被顯示為書籤",
  "_web_content_filter_URL": "URL",
  "_web_content_filter_Name": "名稱",
  "_web_content_filter_Bookmark": "書籤",
  "_web_content_filter_Add Bookmark": "加入書籤",
  "_web_content_filter_Create web content bookmark": "製作書籤",
  "_web_content_filter_Name:": "名稱：",
  "_web_content_filter_URL:": "URL：",
  "_web_content_filter_Bookmark Path:": "書籤路徑：",
  "_web_content_filter_add_page_label_width": "110",
  "_web_content_URL_Placeholder": "http://example.com",


  // AirPlay
  "_global_airplay_knob_set_name": "AirPlay",
  "_global_airplay_knob_set_description": "使用此部分來定義 AirPlay 目標的連線設定。",
  "_airplay_knob_set_num_lines": "1",
  "_generic_string_Restrict AirPlay destinations (Supervised devices only)": "限制 AirPlay 目標（僅限監管裝置）",
  "_generic_string_Only known AirPlay destinations will be available to the device": "裝置只能使用已知的 AirPlay 目標",
  "_generic_string_Add AirPlay Destinations": "加入 AirPlay 目標",
  "_generic_string_Add a known AirPlay destination to the device": "將已知的 AirPlay 目標加入裝置",
  "_generic_string_Add by device name": "按裝置名稱加入",
  "_generic_string_Pick from enrolled Apple TVs": "從已登記的 Apple TV 選取",
  "_generic_string_Device Type:": "裝置類型：",
  "_device_type_iOS/OS X": "iOS/OS X",
  "_device_type_Apple TV": "Apple TV",

  // Single Sign On
  "_global_single_sign_on_knob_set_name": "單一登入",
  "_global_single_sign_on_knob_set_description": "使用此部分來設定單一登入。",
  "_single_sign_on_knob_set_num_lines": "1",
  "_generic_string_Principal Name": "主要名稱",
  "_generic_string_Principal name of the account": "帳號的主要名稱",
  "_generic_string_Realm of the account": "帳號的領域",
  "_generic_string_Limit this account to specific URL patterns": "限制此帳號使用特定 URL 格式",
  "_generic_string_This account will only be used for URLs that match the following patterns": "此帳號只會用於符合下列格式的 URL",
  "_generic_string_Limit this account to specific applications": "限制此帳號使用特定 App",
  "_generic_string_This account will only be used for the following application identifiers": "此帳號只會用於下列的 App 識別碼",

  // AirPrint
  "_global_airprint_knob_set_name": "AirPrint",
  "_airprint_knob_set_num_lines": "1",
  "_global_airprint_knob_set_description": "使用此部分來定義 Airprint 印表機的連線設定。",
  "_generic_string_Printers available on the device": "裝置上可用的印表機",
  "_table_header_IP Address": "IP 位址",
  "_table_header_Resource Path": "資源路徑",

  "_generic_string_IP Address:": "IP 位址：",
  "_generic_string_Resource Path:": "資源路徑：",
  "_layout_airplay_add_sheet_label_width": "110",
  "_generic_string_Add Printer": "加入印表機",

  "_generic_string_Enrollment Settings": "登記設定",
  "_enrollment_setting_allow_activation_lock": "在 MDM 登記之後傳送「允許啟用鎖定」指令（僅限監管裝置）",
  "_enrollment_setting_allow_activation_lock_with_bypass_code": "僅在已取得「啟用鎖定」略過代碼時傳送指令",

  // Fonts
  "_fonts_knob_set_name": "字體",
  "_fonts_knob_set_num_lines": "1",
  "_fonts_knob_set_description": "使用此部分來指定要在裝置上安裝的 TrueType 和 OpenType 字體。",
  "_generic_string_Font:": "字體：",
  "_layout_fonts_label_width": "40",
  "_layout_fonts_upload_button_width": "70",

  // From Servermgr label widths
  "_layout_servermgr_card_dav_label_width": "140",
  "_layout_servermgr_cal_dav_label_width": "140",
  "_layout_servermgr_ichat_label_width": "140",
  "_layout_servermgr_email_label_width": "140",
  "_layout_servermgr_vpn_label_width": "140",


  __eof__: null
};