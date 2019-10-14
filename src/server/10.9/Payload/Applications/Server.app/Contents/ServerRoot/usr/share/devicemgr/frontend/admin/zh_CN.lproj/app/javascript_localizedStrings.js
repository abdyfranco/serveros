// Copyright (c) 2014 Apple Inc. All rights reserved.
var localizedStrings = { /* The name of the Web Application itself. */
  "_appName": "描述文件管理器",

  "_locale": "zh_CN",

  '_SC.DateTime.dayNames': '星期日 星期一 星期二 星期三 星期四 星期五 星期六',
  '_SC.DateTime.abbreviatedDayNames': '周日 周一 周二 周三 周四 周五 周六',
  '_SC.DateTime.monthNames': '1月 2月 3月 4月 5月 6月 7月 8月 9月 10月 11月 12月',
  '_SC.DateTime.abbreviatedMonthNames': '1月 2月 3月 4月 5月 6月 7月 8月 9月 10月 11月 12月',
  '_SC.DateTime.AMPMNames': '上午 下午',

  /* The name of the sidebar item for Device Groups */
  "_device_groups_sidebar_item_display_name": "设备群组",

  /* The name of the sidebar item for User Groups */
  "_user_groups_sidebar_item_display_name": "群组",

  /* This is the cancel button in the Add Device Sheet. It closes the sheet without taking any action. */
  "_add_device_page_cancel_button_title": "取消",

  /* This is the default button in the Add Device Sheet. It takes the unique identifier provided and creates a temporary device record. */
  "_add_device_pane_add_button_title": "添加设备",

  /* This is the name of Mail Settings as it appears in the Add Settings Sheet. */
  "_email_knob_set_name": "邮件",

  /* This is the item in the sidebar that when selected displays tasks that are active. */
  "_sidebar_active_tasks": "活跃的任务",

  /* This is an item in the sidebar that groups the Active and Completed Tasks. It can not be selected. */
  "_sidebar_root_activity": "活动",

  /* This is an item in the sidebar that gorups the item types that can be placed in Configuration Profiles. It itself can not be selected. */
  "_sidebar_root_library": "资源库",

  //KNOB SET ADD STEP 2a

  /* This is the name of the Setting Type for Printing settings. */
  "_energy_saver_knob_set_name": "节能器",

  /* This is the name of the Setting Type for Printing settings. */
  "_privacy_knob_set_name": "安全性与隐私",

  /* This is the name of the Setting Type for Printing settings. */
  "_parental_controls_knob_set_name": "家长控制",

  /* This is the name of the Setting Type for Printing settings. */
  "_cfprefs_knob_set_name": "自定设置",

  /* This is the name of the Setting Type for Printing settings. */
  // ==========
  // = Banner =
  // ==========
  "_mac_restrictions_knob_set_name": "限制",

  /* This is the name of the Setting Type for Printing settings. */
  "_printing_knob_set_name": "打印",

  /* This is the name of the Setting Type for Mobility and PHD settings. */
  "_mobility_knob_set_name": "移动",

  /* This is the name of the Setting Type for Login Window settings. */
  "_login_window_knob_set_name": "登录窗口",

  /* This is the name of the Setting Type for Software Update settings. */
  "_software_update_knob_set_name": "软件更新",

  /* This is the name of the Setting Type for Dock settings. */
  "_dock_knob_set_name": "Dock",

  /* This is the name of the Setting Type for Exchange settings. */
  "_exchange_knob_set_name": "Exchange",

  /* This is the name of the Setting Type for Directory settings. */
  "_directory_knob_set_name": "目录",

  /* This is the name of the Setting Type for Advanced settings. */
  "_apn_knob_set_name": "APN",

  /* This is the name of the Setting Type for LDAP settings. */
  "_ldap_knob_set_name": "LDAP",

  /* this is the name of the Setting Type for the Passcode setting. There can only be one Passcode setting in a Configuration Profile. */
  "_passcode_knob_set_name": "密码",

  /* This is the name of the Global Http Proxy Knobset */
  "_global_http_proxy_knob_set_name": "全局 HTTP 代理",

  /* This is the name of the Setting Type for the VPN setting. */
  "_vpn_knob_set_name": "VPN",

  /* This is the name of the Setting Type for the CalDav settings. */
  "_cal_dav_knob_set_name": "日历",

  /* This is the name of the Setting Type for the CardDav settings. */
  "_card_dav_knob_set_name": "通讯录",

  /* This is the name of the Setting Type for the Login Items settings. */
  "_login_item_knob_set_name": "登录项",

  /* This is the name of the Network Home Share Point name for the Login Items settings. */
  "_login_item_network_home_share_point_name": "<网络个人共享点>",

  /* This is the name of the Setting Type for the CardDav settings. */
  "_general_knob_set_name": "通用",

  /* This is the name of the Setting Type for the Subscribed Calendars settings. */
  "_subscribed_calendar_knob_set_name": "已订阅的日历",

  /* This is the name of the Setting Type for the restrictions settings. */
  "_restrictions_knob_set_name": "限制",

  /* This is the subheading for the Certificate Name field for Certificate Settings. */
  "_certificate_knob_set_view_display_name_description": "证书凭证的名称或描述",

  /* The heading for the Certificate Name field for Certificate Settings. */
  "_certificate_knob_set_view_display_name_label": "证书名称",

  /* The name of Messages settings */
  "_ichat_knob_set_name": "信息",

  /* The hint that appears in fields for Settings where the field is required. */
  "_knob_set_view_required_hint": "必填",

  /* The name of Certificate Settings. */
  "_certificate_knob_set_name": "证书",

  /* The name of Web Clip Settings. */
  "_web_clip_knob_set_name": "Web Clip",

  /* This is the description for SCEP Setting's Fingerprint Field. */
  "_admin_scep_knob_set_view_fingerprint_field_description": "输入要用作指纹的十六进制字符串",

  /* This is the name of the SCEP Settings. */
  "_scep_knob_set_name": "SCEP",

  /* This is the label for SCEP Settings's Name Field. */
  "_admin_scep_knob_set_view_name_field_label": "名称",

  /* This is the label for SCEP Setting's Fingerprint Field. */
  "_admin_scep_knob_set_view_fingerprint_field_label": "指纹",

  /* This is the label for SCEP Setting's URL Field. */
  "_admin_scep_knob_set_view_url_field_label": "URL",

  /* This is the description for SCEP Setting's Name Field. */
  "_admin_scep_knob_set_view_name_field_description": "示例名称：CA-IDENT",

  /* This is the label for SCEP Setting's Challenge Field. */
  "_admin_scep_knob_set_view_challenge_field_label": "质询",

  /* This is the hint provided in Fields in Settings when the value of the field is optional. */
  "_knob_set_view_optional_hint": "可选",

  "_generic_string_Retries": "重试次数",
  "_generic_string_The number of times to poll the SCEP server for a signed certificate before giving up": "轮询 SCEP 服务器以获得签名证书的次数",
  "_generic_string_Retry Delay": "重试延迟",
  "_generic_string_The number of seconds to wait between poll attempts": "轮询尝试之间等待的秒数",

  /* This is the description for SCEP Setting's Challenge Field. */
  "_admin_scep_knob_set_view_challenge_field_description": "用作自动注册的预共享密钥",

  /* This is the description for SCEP Setting's URL Field. */
  "_admin_scep_knob_set_view_url_field_description": "SCEP 服务器的基本 URL",

  /* This is the label for SCEP Setting's Subject Field. */
  "_admin_scep_knob_set_view_subject_field_label": "主题",

  /* This is the description of SCEP Setting's Subject Field. */
  "_admin_scep_knob_set_view_subject_field_description": "X.500 名称的描述",
  /* This is the message that appears when a Server Error occurs. */
  "_Server Error Occurred Message": "服务器出错",

  /* This is the description for SCEP Setting's Key Size Field. */
  "_admin_scep_knob_set_view_keysize_field_description": "以位为单位的密钥大小",

  "1024": "1024",

  "2048": "2048",


  /* This is the description of the save Changes Confirmation. */
  "_Show Save Changes Confirmation Description": "这会将更改的设置推送到设备。",

  /* This is the description of the Delete Item Confirmation. */
  "_Show Delete Item Confirmation Description": "此操作不能撤销。",

  /* This is the description of the Error Occurred error. */
  "_Server Error Occurred Description": "请重新载入网页并再试一次。",

  /* This is the caption of the Server Error Occurred error. */
  "_Server Error Occurred Caption": "如果此错误仍然存在，请联系管理员。",

  /* This is the message that appears when Settings are being saved. */
  "_Show Save Changes Confirmation Message": "要存储更改吗？",

  /* This is the label for SCEP Setting's Key Size Field. */
  "_admin_scep_knob_set_view_keysize_field_label": "密钥大小",

  /* This is the message that apepars when a Profile is about to be deleted. */
  "_Show Delete Item Confirmation Message": "要删除吗？",
  "_delete_profile_alert_pane_header_Remove All Settings?": "要移除所有设置吗？",
  "_delete_settings_button_text_Remove All Settings": "移除所有设置",
  '_delete_profile_alert_pane_message_All payloads will be removed from "<profile_name>". "<profile_name>" will then be removed from all devices where it is currently applied. This action cannot be undone.': '所有负载都将从“%@1”中移除。“%@1”之后将从所有当前应用它的设备中移除。此操作不能撤销。',
  '_delete_profile_alert_pane_message_manual_profile_for_directory_item': '将从“%@1”移除所有设置，且不能再从“我的设备”门户下载“%@1”。',
  '_delete_profile_alert_pane_message_manual_profile_for_device': '将从“%@”移除所有设置。',
  'no_payloads_alert_header': "未配置有效负载",
  'no_payloads_alert_description': '除“通用”外，“%@”还必须至少配置一个有效负载。对“通用”有效负载的更改将不会被存储。',
  "_continue_without_saving": "继续",

  "_unenroll_device_alert_pane_header": "要在设备管理中移除被管理的设置、应用程序和注册吗？",
  "_unenroll_device_alert_pane_description": "设备取消注册后，占位符记录仍将保留。",
  "_unenroll_button_text_Unenroll": "取消注册",
  "_unenroll_and_remove_placeholder_button_text": "取消注册并移除占位符",
  "_unenroll_dep_device_alert_pane_description": "设备取消注册后，来自“设备注册计划”的占位符记录仍将保留。",
  "_remove_device_placeholder_alert_pane_header": "要移除占位符记录吗？",
  "_remove_device_placeholder_alert_pane_description": "当前储存的有关此占位符设备的所有信息都将丢失。",
  "_remove_device_placeholder_with_activation_lock_alert_pane_description": "当前存储的所有与此占位符设备相关的信息（包括激活锁忽略码）都将丢失。如果启用了激活锁，那么恢复此设备将需要激活锁忽略码。",
  "_remove_device_placeholder_button_text_Remove Placeholder": "移除占位符",
  "_remove_dep_device_placeholder_alert_pane_header": "要从“设备注册计划”中永久移除设备吗？",
  "_remove_dep_device_placeholder_alert_pane_description": "此操作不能撤销。您不允许通过“设备注册计划”门户注册此设备。此设备的所有当前储存的信息都将丢失。",
  "_remove_dep_device_placeholder_button_text_Remove": "移除",
  "_unenroll_dep_device_alert_pane_width": "540",
  "_remove_dep_device_alert_pane_width": "570",
  "_revert_device_to_placeholder": "复原到占位符",

  "_device_enrollment_state_placeholder": "占位符",
  "_device_enrollment_state_unenrollment_pending": "取消注册等待中",
  "_device_state_header_placeholder_label_width": "70",
  "_device_state_header_unenrollment_pending_label_width": "140",

  /* The display title for SCEP Setting's Use as digital signature checkbox */
  "_admin_scep_knob_set_view_use_as_digital_signature_display_title": "用作数字签名",

  /* The display title for SCEP Setting's Use for key encipherment checkbox */
  "_admin_scep_knob_set_view_use_for_key_encipherment": "用于密钥加密",

  /* The label for Certificate Settings' Certificate Field */
  "_certificate_knob_set_view_upload_label": "证书或身份数据",

  /* The description for Certificate Settings' Certificate Field */
  "_certificate_knob_set_view_upload_description": "要包含在设备上的 X.509 证书（.cer、.p12 等）",

  /* The placeholder text for uploading a Certificate to a Certificate Setting. */
  "_certificate_knob_set_view_upload_placeholder": "无证书",

  /* The Lock Task Type */
  "_task_type_lock": "锁定",
  "_task_type_lock_with_display_name": "锁定：%@1",

  /* The Wipe Task Type */
  "_task_type_wipe": "擦除",
  "_task_type_wipe_with_display_name": "擦除：%@1",

  /* This is the name for the Device Info Task Type */
  "_task_type_device_info": "更新信息",
  "_task_type_device_info_with_display_name": "更新信息：%@1",
  "_task_type_allow_activation_lock": "允许激活锁",
  "_task_type_clear_activation_lock": "清除激活锁",

  /* This is the name for the Clear Passcode Task Type */
  "_task_type_clear_passcode": "清除密码",
  "_task_type_clear_passcode_with_display_name": "清除密码：%@1",

  /* This is the label for the Completed Tasks sidebar entry. */
  "_sidebar_completed_tasks": "已完成的任务",

  /* This is the available device capacity formatter. In English, this is equivalent to 6.23 GB. %@1 is subsituted for something like 6.23. */
  "_available_device_capacity_format": "%@1 GB",

  /* This is the task status when the notification has been sent but the device has not checked in yet. */
  "_task_step_notification_sent_device_pending": "正在发送",

  /* This is the task status when the device has reported that it has completed the task. */
  "_task_step_device_completion": "已完成",

  /* This is the task status when the device has checked in and received the task, but has not yet checked in reporting that it has completed the task. */
  "_task_step_device_receieved_device_completion_pending": "进行中",

  /* This is the task type when the device is asked to provide info about itself to Profile Manager. */
  "_task_type_update_info": "更新信息",
  "_task_type_update_info_with_display_name": "更新信息：%@1",

  /* This is the task status when the device has not yet been sent a notification asking it to check in to recieve its task. This probably should never be displayed. */
  "_task_step_notification_pending": "等待中",
  "_task_step_vpp_status_user_not_invited": "未邀请的用户",
  "_task_step_vpp_status_user_not_enrolled": "未注册的用户",
  "_task_step_vpp_status_no_copies_available": "没有可用的副本",

  /* This is the description for when an unknown error occurs within the Profile Manager web app. */
  "_client_error_occurred_description": "请重新载入“描述文件管理器”并再试一次。",

  /* This is the message for when the Profile Manager server cannot be found. */
  "_server_not_found_message": "找不到 Profile Server",

  /* This is the description for when the Profile Manager server cannot be found. */
  "_server_not_found_description": "请确定已在 Server 应用程序中打开“描述文件管理器”。",

  /* This is the caption for when an unknown error occurs within the Profile Manager web app. */
  "_client_error_occurred_caption": "错误：%@1",

  /* This is the message for when an unknown error occurs within the Profile Manager web app. */
  "_client_error_occurred_message": "出错",

  /* This is the description for the network timeout error. */
  "_server_timed_out_description": "请确定您的电脑已连接到互联网及 Profile Server 所在的网络。",

  /* This is the message for the network timeout error. */
  "_server_timed_out_message": "与服务器的连接已超时",

  /* This is the description shown for the No Devices Found warning, which happens when the admin attempts to perform a task on a Library Item that has no Devices as descendants. */
  "_No Devices Found For Task Description": "找不到此项目的设备。",

  /* This is the date and time format for Tasks. */
  "_task_updated_at_formatted_string": "%y-%m-%d %p%i:%M",

  /* This is the message shown for the no Devices Found warning, which happens when the admin attempts to perform a task on a Library Item that has no Devices as descendants. */
  "_No Devices Found For Task Message": "找不到执行任务的设备",

  /* This is the label of the Passphrase field of Certificates. */
  "_certificate_knob_set_view_password_label": "口令",

  /* This is the description of the Passphrase field of Certificates. */
  "_certificate_knob_set_view_password_description": "用于保护凭证的口令",

  /* This is the task state for cancelled tasks. */
  "_task_cancelled": "已取消",

  /* This is the menu item for sorting tasks ascending. */
  "_tasks_sort_ascending": "升序",

  /* This is the mnu item for sorting tasks descending. */
  "_tasks_sort_descending": "降序",

  /* This is the menu item for sorting tasks by last updated. */
  "_tasks_sort_by_last_updated": "上次更新",

  /* This is the menu item for sorting tasks by name. */
  "_tasks_sort_by_name": "名称",

  /* This is the menu item for sorting tasks by icon. */
  "_tasks_sort_by_icon": "图标",

  /* This is the menu item for sorting tasks by status. */
  "_tasks_sort_by_status": "状态",
  "_task_type_send_vpp_invitation_with_display_name": "发送 VPP 邀请：%@",
  "_task_type_remove_device_with_display_name": "移除设备：%@",
  "_task_type_enroll_device_with_display_name": "注册设备：%@",
  "_task_type_push_apps_with_display_name": "推送应用程序：%@",
  "_task_type_remove_apps_with_display_name": "移除应用程序：%@",
  "_task_type_retrieve_activation_lock_bypass_code_with_display_name": "取回激活锁忽略码：%@",
  "_task_type_allow_activation_lock_with_display_name": "允许激活锁：%@",
  "_task_type_remove_activation_lock_with_display_name": "清除激活锁：%@",

  /* This is the unknown type for tasks. This should almost never appear in the UI; it is only there in case there is a bug or something. */
  "_task_type_unknown_type": "未知",
  "_task_type_unknown_type_with_display_name": "未知：%@1",

  /* This is the description that is shown for identity (password protected) certificates. */
  "_certificate_is_identity_description": "此内容以个人信息交换 (PKCS12) 格式进行储存，并受密码保护。不能显示任何信息。",

  /* This is the message shown when the server has not finished turning on. This will probably only happen for 10-15 seconds after turning Profile Manager on in Server.app. */
  "_server_not_available_message": "Profile Server 不可用",

  /* This is the description shown when the server has not finished turning on. */
  "_server_not_available_description": "请稍等片刻并再试一次。",

  /* This is the message shown when the network is not available. This typically happens when the web browser refuses to connect to anything. */
  "_network_not_available_message": "网络不可用",

  /* This is the description shown when the network is not available. */
  "_network_not_available_description": "请确定您的电脑具有互联网连接并再试一次。",

  /* This is the hint for the search box which says things like "Search Users", "Search Active Tasks", etc. */
  "_search_type_hint": "搜索“%@1”",

  "_generic_string_200+ found (200 displayed)": "已找到 %@1+ 个（显示了 %@1 个）",
  "_generic_string_<count> found": "已找到 %@ 个",


  /* This is the hint for the search box when search is disabled. */
  "_search_disabled_hint": "搜索",

  /* This is the Cancel button for the Filetype not Supported error. */
  "_filetype_not_supported_cancel_button": "取消",

  /* This is the description for the Filetype not Supported error. */
  "_filetype_not_supported_description": "不支持您所选择的文件。请选取其他文件。",

  /* This is the Filetype not Supported error. */
  "_filetype_not_supported_message": "不支持文件类型",

  /* This is the combined profile status for Up to Date */
  "_combined_profile_up_to_date": "最新",

  /* This is the combined profiles status for Pending Install */
  "_combined_profile_pending_install": "等待安装",

  /* This is the temporary combined profiles status for either External or Pending Removal */
  "_combined_profile_external_or_pending_removal": "外部或等待移除",

  /* This is the combined profile status for Out of Date */
  "_combined_profile_out_of_date": "过期",

  /* This is the combined profile status for Pending Removal. */
  "_combined_profile_pending_removal": "等待移除",

  /* This is the combined profile status for External. */
  "_combined_profile_external": "外部",

  /* This is the Don't Save button for the Show Save Changes Confirmation sheet. */
  "_show_save_changes_confirmation_dont_save": "不存储",

  /* This is the passcode Compliant state for Devices for compiance with both Profiles and Accounts */
  "_passcode_compliant_both_compliant": "描述文件和帐户两者",

  /* This is the passcode Compliant state for Devices for compliance with only Profiles, not Accounts */
  "_passcode_compliant_only_profiles_compliant": "仅限描述文件，而非帐户",

  /* This is the passcode Compliant state for Devices for compliance with only Accounts, not Profiles */
  "_passcode_compliant_only_other_compliant": "仅限帐户，而非描述文件",

  /* This is the passcode Compliant state for Devices for compliance with neither Profiles nor Accounts */
  "_passcode_compliant_not_compliant": "描述文件和帐户两者皆非",

  /* This is the Passcode Present state for Devices for when the passcode is not present */
  "_passcode_present_not_present": "不需要",

  /* This is the Passcode Present state for Devices for when the passcode is present */
  "_passcode_present_present": "显示",

  /* This is the Hardware Encryption Capability state for Devices for when the Hardware is not capable */
  "_hardware_encrpyption_caps_not_capable": "不支持",

  /* This is the Hardware Encryption Capability state for Devices for when the Hardware is only capable of file-level encryption */
  "_hardware_encrpyption_caps_only_file_capable": "仅支持文件级别",

  /* This is the Hardware Encryption Capability state for Devices for when the Hardware is capable of both block-level and file-level encryption */
  "_hardware_encrpyption_caps_both_capable": "同时支持块级别和文件级别",

  /* This is the Hardware Encryption Capability state for Devices for when the Hardware is capable of only block-level encryption */
  "_hardware_encrpyption_caps_only_block_capable": "仅支持块级别",

  /* This is the Hardware Encryption field for Devices */
  "_hardware_encrpyption": "硬件加密",

  /* This is the Passcode Present field for Devices */
  "_passcode_present": "需要密码",

  /* This is the Passcode Compliant field for Devices */
  "_passcode_compliant": "符合密码规格",

  /* This is the Restrictions About Root Item for Devices */
  "_restrictions_about_root_item": "限制",

  /*  */
  "_manual_fetching_when_roaming_on": "打开",

  /*  */
  "_manual_fetching_when_roaming_off": "关闭",

  /*  */
  "_force_forced": "强制",

  /*  */
  "_force_not_forced": "非强制",

  /*  */
  "_require_required": "必填",

  /*  */
  "_require_not_required": "不要求",

  /*  */
  "_allow_not_allowed": "不允许",

  /*  */
  "_allow_allowed": "允许",

  /*  */
  "_safari_accept_cookies_never": "永不",

  /*  */
  "_rating_apps_4_plus": "4+",

  /*  */
  "_rating_apps_17_plus": "17+",

  /*  */
  "_safari_accept_cookies_always": "总是",

  /*  */
  "_rating_apps_dont_allow_apps": "不允许应用程序",

  /*  */
  "_rating_apps_9_plus": "9+",

  /*  */
  "_rating_apps_12_plus": "12+",

  /*  */
  "_rating_apps_allow_all_apps": "允许所有应用程序",

  /*  */
  "_safari_accept_cookies_from_visited": "从访问的站点",

  /*  */
  "_unset": "—",

  /* This is the Installed Applications section of the About tab of Devices */
  "_installedApplications_about_root_item": "已安装的应用程序",

  /* This is the hint for fields in Profile Settings where the field is required. */
  "_knob_set_view_hint_required": "必填",

  /* This is the payload type for profiles where the payload provides a password to allow users to remove a locaked configuration profile from the device. It can not be created in Profile Manager but may be present on profiles obtained elsewhere. */
  "_installed_profile_profile_removal_password_payload_type": "移除密码",

  /* This is when the issuer of a Certificate can not be determined because it does not have a CN property. */
  "_certificate_issued_by_unknown": "未知",

  /* This is the button in Exchange Settings to remove the certificate. */
  "_knob_set_view_remove_certificate": "移除证书",

  /* This is the button in Exchange and Certificate Settings to add the certificate. */
  "_knob_set_view_add_certificate": "添加证书…",

  /* This is the helper text in the About tab of Library Items under the In Groups section when the selected Library Item is not in any Groups. */
  "_about_in_groups_not_in_any_groups": "不在任何群组中",

  /* This is the Sort By button, used on the Activity/Tasks tab. */
  "_sort_by_button": "▼",

  /* This is the helper text shown when no Applications are installed on a Device. */
  "_about_installed_applications_no_installed_applications": "未安装附加应用程序",

  /* This is the line item in the Devices tab of a Provisioning Profile that represents the additional devices specified in the Provisioning Profile that Profile Manager is unaware of. */
  "_provisioning_profile_n_additional_devices": "%@1 个附加设备",

  /* This is the line item in the Devices tab of a Provisioning Profile that represents the additional device specified in the Provisioning Profile that Profile Manager is unaware of. */
  "_provisioning_profile_one_additional_device": "1 个附加设备",

  /* This is the task type when a Provisioning Profile is installed onto a Device. */
  "_task_type_install_provisioning_profile": "安装预置描述文件",
  "_task_type_install_provisioning_profile_with_display_name": "安装预置描述文件：%@1",

  /* This is the message for the Browser Outdated error. */
  "_browser_outdated_message": "需要一个更高版本的浏览器",

  /* This is the description for the Browser Outdated error. */
  "_browser_outdated_description": "“描述文件管理器”要求较新的浏览器才能运行。",

  /* This is the cancel button for the Browser Outdated error. */
  "_browser_outdated_cancel": "取消",

  /* This is the helper text shown when the item list for a Library Item is loading. The wildcard will be replaced with the name of the selected sidebar item, for example Users. */
  "_item_list_loading": "正在载入“%@1”…",

  /* This is the message for the Save Changes Conflict warning. */
  "_save_changes_conflict_message": "存储冲突",

  /* This is the description for the Save Changes Conflict warning. */
  "_save_changes_conflict_description": "它已从您开始编辑时被修改。要覆盖这些更改吗？覆盖更改不能撤销。",

  /* This is the cancel button for the Save Changes Conflict warning. It has no action. */
  "_save_changes_conflict_cancel": "取消",

  /* This is the overwrite button for the Save Changes Conflict warning. It will overrite any remote changes. */
  "_save_changes_conflict_overwrite": "覆盖",

  /* The profile is available for installation on this device, but is not currently installed. It is a manual download profile. */
  "_combined_profile_available_for_install": "可用于安装",

  /* This is for profiles installed on Devices whose owners are not authorized for the Manual Profile in question, or the profile is no longer being maintained by the server. This is for manual profiles. */
  "_combined_profile_not_authorized": "未获得授权",

  /* This is the name and version of an installed application. %@1 will become the name of the Application and %@2 will become the Version string of the Application. */
  "_installed_application_name_and_version": "%@1 %@2",

  /* This is the cancel button for the Email Profile to Recipients Confirmation. */
  "_email_profile_to_recipients_cancel": "取消",

  /* This is the message for the Selected Item was Destroyed and Unsaved Changes Lost error. */
  "_selected_item_was_destroyed_unsaved_changes_lost_message": "所选项目已删除",

  /* This is the description for the Selected Item was Destroyed and Unsaved Changes Lost error. */
  "_selected_item_was_destroyed_unsaved_changes_lost_description": "未存储的更改已丢失。",

  /* This is the label for the Add Recipients Picker. The wildcard will be replaced with the type of Recipients being added. */
  "_add_members_label_view_value": "添加%@1",

  /* This is the Save button for the Show Save Changes Confirmation alert. */
  "_show_save_changes_confirmation_save_button": "存储",

  /* This is the Configure button shown when there are No Settings for the Selected Setting Type. */
  "_no_settings_configure_button": "配置",

  /* This is the Message shown when there are no Setting Instances for the Selected Setting Type. */
  "_no_settings_configure_message": "配置“%@1”",

  /* This is the generic description for Setting Types when one has not been provided. */
  "_generic_setting_type_description": "使用此部分来配置“%@1”。",

  /* This is the secondary information for the General knobset */
  "_setting_type_secondary_information_general_knobset": "强制",

  /* This is the secondary information for a Setting Type which has multiple payloads configured. */
  "_setting_type_secondary_information_multiple_configured": "已配置了 %@1 个有效负载",

  /* This is the secondary information for a Setting Type which has multiple payloads configured. */
  "_setting_type_secondary_information_one_configured": "已配置了 1 个有效负载",

  /* This is the secondary information for a Setting Type which has no payloads configured. */
  "_setting_type_secondary_information_not_configured": "未配置",

  /* This is the Push Settings type of Task. Push Settings is performed automatically whenever a Managed Configuration Profile is Saved. */
  "_task_type_push_settings": "推送设置",
  "_task_type_push_settings_with_display_name": "推送设置：%@1",

  /* This is the message shown when closing the Admin while there are unsaved changes. */
  "_admin_before_unload_unsaved_changes_will_be_lost": "未存储的更改将会丢失。",

  /* This is the message when the Admin is closed while there is network activity in progress. */
  "_admin_before_unload_network_activity_in_progress": "网络活动正在进行中。",

  /* This is the status for tasks that failed. */
  "_task_failed": "失败",
  "_task_succeeded": "已成功",
  "_task_no_devices": "无设备",

  /* Library item tasks secondary information */
  "_task_1_failed": "%@1 个失败",
  "_task_many_failed": "%@1 个失败",

  "_task_1_cancelled": "%@1 个已取消",
  "_task_many_cancelled": "%@1 个已取消",

  "_task_1_succeeded": "%@1 个成功",
  "_task_many_succeeded": "%@1 个成功",

  "_task_1_cancelled_1_failed": "%@1 个已取消，%@2 个失败",
  "_task_many_cancelled_1_failed": "%@1 个已取消，%@2 个失败",
  "_task_1_cancelled_many_failed": "%@1 个已取消，%@2 个失败",
  "_task_many_cancelled_many_failed": "%@1 个已取消，%@2 个失败",

  "_task_1_succeeded_1_cancelled": "%@1 个成功，%@2 个已取消",
  "_task_many_succeeded_1_cancelled": "%@1 个成功，%@2 个已取消",
  "_task_1_succeeded_many_cancelled": "%@1 个成功，%@2 个已取消",
  "_task_many_succeeded_many_cancelled": "%@1 个成功，%@2 个已取消",

  "_task_1_succeeded_1_failed": "%@1 个成功，%@2 个失败",
  "_task_many_succeeded_1_failed": "%@1 个成功，%@2 个失败",
  "_task_1_succeeded_many_failed": "%@1 个成功，%@2 个失败",
  "_task_many_succeeded_many_failed": "%@1 个成功，%@2 个失败",

  "_task_1_succeeded_1_cancelled_1_failed": "%@1 个成功，%@2 个已取消，%@3 个失败",
  "_task_many_succeeded_1_cancelled_1_failed": "%@1 个成功，%@2 个已取消，%@3 个失败",
  "_task_1_succeeded_many_cancelled_1_failed": "%@1 个成功，%@2 个已取消，%@3 个失败",
  "_task_1_succeeded_1_cancelled_many_failed": "%@1 个成功，%@2 个已取消，%@3 个失败",
  "_task_many_succeeded_many_cancelled_1_failed": "%@1 个成功，%@2 个已取消，%@3 个失败",
  "_task_1_succeeded_many_cancelled_many_failed": "%@1 个成功，%@2 个已取消，%@3 个失败",
  "_task_many_succeeded_1_cancelled_many_failed": "%@1 个成功，%@2 个已取消，%@3 个失败",
  "_task_many_succeeded_many_cancelled_many_failed": "%@1 个成功，%@2 个已取消，%@3 个失败",

  "_task_1_of_2_in_progress": "%@1 个进行中（总共 %@2 个）",

  "_task_1_of_2_in_progress_1_failed": "%@1 个进行中（总共 %@2 个）；%@3 个失败",
  "_task_1_of_2_in_progress_many_failed": "%@1 个进行中（总共 %@2 个）；%@3 个失败",

  "_task_1_of_2_in_progress_1_cancelled": "%@1 个进行中（共 %@2 个）；%@3 个已取消",
  "_task_1_of_2_in_progress_many_cancelled": "%@1 个进行中（共 %@2 个）；%@3 个已取消",

  "_task_1_of_2_in_progress_1_succeeded": "%@1 个进行中（总共 %@2 个）；%@3 个成功",
  "_task_1_of_2_in_progress_many_succeeded": "%@1 个进行中（总共 %@2 个）；%@3 个成功",

  "_task_1_of_2_in_progress_1_cancelled_1_failed": "%@1 个进行中（共 %@2 个）；%@3 个已取消，%@4 个失败",
  "_task_1_of_2_in_progress_many_cancelled_1_failed": "%@1 个进行中（共 %@2 个）；%@3 个已取消，%@4 个失败",
  "_task_1_of_2_in_progress_1_cancelled_many_failed": "%@1 个进行中（共 %@2 个）；%@3 个已取消，%@4 个失败",
  "_task_1_of_2_in_progress_many_cancelled_many_failed": "%@1 个进行中（共 %@2 个）；%@3 个已取消，%@4 个失败",

  "_task_1_of_2_in_progress_1_succeeded_1_cancelled_1_failed": "%@1 个进行中（共 %@2 个）；%@3 个成功，%@4 个已取消，%@5 个失败",
  "_task_1_of_2_in_progress_1_succeeded_1_cancelled_many_failed": "%@1 个进行中（共 %@2 个）；%@3 个成功，%@4 个已取消，%@5 个失败",
  "_task_1_of_2_in_progress_1_succeeded_many_cancelled_1_failed": "%@1 个进行中（共 %@2 个）；%@3 个成功，%@4 个已取消，%@5 个失败",
  "_task_1_of_2_in_progress_many_succeeded_1_cancelled_1_failed": "%@1 个进行中（共 %@2 个）；%@3 个成功，%@4 个已取消，%@5 个失败",
  "_task_1_of_2_in_progress_1_succeeded_many_cancelled_many_failed": "%@1 个进行中（共 %@2 个）；%@3 个成功，%@4 个已取消，%@5 个失败",
  "_task_1_of_2_in_progress_many_succeeded_many_cancelled_1_failed": "%@1 个进行中（共 %@2 个）；%@3 个成功，%@4 个已取消，%@5 个失败",
  "_task_1_of_2_in_progress_many_succeeded_1_cancelled_many_failed": "%@1 个进行中（共 %@2 个）；%@3 个成功，%@4 个已取消，%@5 个失败",
  "_task_1_of_2_in_progress_many_succeeded_many_cancelled_many_failed": "%@1 个进行中（共 %@2 个）；%@3 个成功，%@4 个已取消，%@5 个失败",

  "_task_1_of_2_in_progress_1_succeeded_1_failed": "%@1 个进行中（总共 %@2 个）；%@3 个成功，%@4 个失败",
  "_task_1_of_2_in_progress_many_succeeded_1_failed": "%@1 个进行中（总共 %@2 个）；%@3 个成功，%@4 个失败",
  "_task_1_of_2_in_progress_1_succeeded_many_failed": "%@1 个进行中（总共 %@2 个）；%@3 个成功，%@4 个失败",
  "_task_1_of_2_in_progress_many_succeeded_many_failed": "%@1 个进行中（总共 %@2 个）；%@3 个成功，%@4 个失败",

  "_task_1_of_2_in_progress_1_succeeded_1_cancelled": "%@1 个进行中（共 %@2 个）；%@3 个成功，%@4 个已取消",
  "_task_1_of_2_in_progress_many_succeeded_1_cancelled": "%@1 个进行中（共 %@2 个）；%@3 个成功，%@4 个已取消",
  "_task_1_of_2_in_progress_1_succeeded_many_cancelled": "%@1 个进行中（共 %@2 个）；%@3 个成功，%@4 个已取消",
  "_task_1_of_2_in_progress_many_succeeded_many_cancelled": "%@1 个进行中（共 %@2 个）；%@3 个成功，%@4 个已取消",

  /* This is the User/User Group access state for when they can Enable Remote Management. */
  "_access_state_binding_access": "可以启用远程管理",

  // KNOB SET ADD STEP 2b
  /*  */
  "_ad_cert_knob_set_description": "使用此部分来定义 Active Directory 证书的设置。",

  /*  */
  "_scep_knob_set_description": "使用此部分来定义用于从 SCEP 服务器获取证书的设置。",

  /*  */
  "_cfprefs_knob_set_description": "使用此部分来定义通用偏好设置。",

  /*  */
  "_passcode_knob_set_description": "使用此部分来指定在设备上执行的密码策略。",

  /*  */
  "_general_knob_set_description": "使用此部分来定义“通用”的设置。",

  /*  */
  "_certificate_knob_set_description": "使用此部分来指定您要安装在设备上的 PKCS1 和 PKCS12 证书。请添加您的公司证书，以及对设备接入您的网络进行鉴定所需的其他证书。",

  /*  */
  "_cal_dav_knob_set_description": "使用此部分来定义用于连接到 CalDAV 服务器的设置。",

  /*  */
  "_software_update_knob_set_description": "使用此部分来定义“软件更新”的设置。",

  /*  */
  "_ichat_knob_set_description": "使用此部分来定义“信息”的设置。",

  /*  */
  "_directory_knob_set_description": "使用此部分来定义“目录”的设置。",

  /*  */
  "_privacy_knob_set_description": "使用此部分来定义“安全性与隐私”的设置。",

  /*  */
  "_exchange_knob_set_description": "使用此部分来定义用于连接到 Exchange 服务器的设置。",

  /*  */
  "_web_clip_knob_set_description": "使用此部分来配置 Web Clip。",

  /*  */
  "_email_knob_set_description": "使用此部分来定义用于连接到 POP 或 IMAP 帐户的设置。",

  /*  */
  "_subscribed_calendar_knob_set_description": "使用此部分来定义日历订阅的设置。",

  /*  */
  "_vpn_knob_set_description": "使用此部分来配置设备通过 VPN 连接到您的无线网络的方式（包括必要的鉴定信息）。",

  /*  */
  "_card_dav_knob_set_description": "使用此部分来定义用于连接到 CardDAV 服务器的设置。",

  /*  */
  "_ldap_knob_set_description": "使用此部分来定义用于连接到 LDAP 服务器的设置。",

  /*  */
  "_restrictions_knob_set_description": "使用此部分来限制用户可以使用的应用程序、设备功能和媒体内容。",

  /*  */
  "_mac_restrictions_knob_set_description": "使用此部分来指定与应用程序和内容限制有关的设置。（在安装配置描述文件后，用户将无法在其设备上修改这些设置。）",

  /* Global HTTP Proxy knob set description that shows above the configure button */
  "_global_http_proxy_knob_set_description": "使用此部分来配置代理服务器的设置（设备的所有 HTTP 流量都会通过该代理服务器）。这些设置仅会影响被监督的设备。",

  /* Application Lock knob set description that shows above the configure button */
  "_app_lock_knob_set_description": "使用此部分来指定设备应锁定到哪个应用程序。此设置将仅影响被监督的设备。",

  /*  */
  "_interface_knob_set_description": "使用此部分来定义“接口”的设置。",

  /*  */
  "_printing_knob_set_description": "使用此部分来定义“打印”的设置。",

  /*  */
  "_dock_knob_set_description": "使用此部分来定义 Dock 的设置。",

  /*  */
  "_mobility_knob_set_description": "使用此部分来定义移动和便携式个人目录的设置。",

  /*  */
  "_apn_knob_set_description": "使用此部分来指定高级设置，如运营商访问点名称 (APN)。（必须由经过训练的专业人员来管理这些设置。）",

  /*  */
  "_energy_saver_knob_set_description": "使用此部分来定义“节能器”的设置。",

  /*  */
  "_parental_controls_knob_set_description": "使用此部分来定义“家长控制”的设置。",

  /* This is the separator in the sidbear that appears if there are any Enrollment Profiles. */
  "_auto_join_profiles_tree_item": "注册描述文件",

  /* This is a popup menu item in the sidebar's add button popup. It creates a new Enrollment Profile. */
  "_new_auto_join_profile": "注册描述文件",

  /* This is the default name of newly created Enrollment Profiles */
  "_default_auto_join_profile_name": "新建注册描述文件",

  /* This action downloads the Enrollment Profile so that it can be used to auto-join devices. */
  "_save_auto_join_profile_to_disk": "将注册描述文件存储到磁盘",

  /* This is the name of a temporary device. The wildcard will be filled in with a unique identifier for the Device, such as serial number, UDID, or IMEI. */
  "_admin_device_name_temporary_device": "临时：%@1",

  /* This is the Settings tab for Enrollment Profiles. */
  "_auto_join_profile_settings": "设置",

  /* This is the Usage tab for Enrollment Profiles. */
  "_auto_join_profile_usage": "使用情况",

  /* This shows up in the Settings tab of Enrollment Profiles. */
  "_info_auto_join_security_title": "安全性",

  /* This shows up in the Settings tab of Enrollment Profiles. */
  "_info_auto_join_security_paragraph": "必须仅允许资源库中现有带占位符的设备使用此描述文件，才能改善安全性。",

  /* This is the checkbox found in the Settings tab of Enrollment Profiles. */
  "_info_auto_join_restrict_use_checkbox": "仅允许带占位符的设备使用",

  /* This is the download button in the toolbar for Enrollment Profiles. */
  "_download_auto_join_profile": "下载",

  /* HERE IS WHERE THE LOGIN BEHAVIOR KNOB SET DESCRIPTION GOES */
  "_login_item_knob_set_description": "使用此部分来指定登录时所运行项目的设置",

  /* HERE IS WHERE THE LOGIN WINDOW KNOB SET DESCRIPTION GOES */
  "_login_window_knob_set_description": "使用此部分来指定“登录窗口”的行为和外观设置",

  /* This is the description inside the Usage tab for Enrollment Profiles. */
  "_usage_auto_join_description": "以下设备使用了此描述文件来加入",

  /* This is the secondaryInformation for Enrollment Profiles where the Enrollment Profile was used one time. */
  "_auto_join_profile_secondary_information_one_time": "使用了 1 次 - 上一次使用时间：%@",

  /* This is the secondaryInformation for Enrollment Profiles. The first wildcard specifies the number of times the profile was used. The second wildcard is replaced with the last time it was used. */
  "_auto_join_profile_secondary_information": "使用了 %@1 次 - 上一次使用时间：%@2",

  /* This is the secondaryInformation for Enrollment Profiles that have never been used. */
  "_auto_join_profile_secondary_information_zero_times": "使用了 0 次",

  /* This is the reload button for the Client Error Occurred alert. */
  "_client_error_occurred_reload_button": "重新载入",

  /* This is the reload button for the Server Timed Out Error. */
  "_server_timed_out_reload_button": "重新载入",

  /* This is the reload button for the Server Not Available error. */
  "_server_not_available_reload_button": "重新载入",

  /* This is the reload button for the Server Error Occurred alert. */
  "_server_error_occurred_reload_button": "重新载入",

  /* This is the reload button for the Server Not Found error. */
  "_server_not_found_reload_button": "重新载入",

  /* This is the reload button for the Network Not Available error. */
  "_network_not_available_reload_button": "重新载入",

  /* This is the description shown when showing the Save Changes Confirmation alert if the selected item is a Library Item. */
  "_show_save_changes_confirmation_description_for_library_item": "这可能导致将设置推送到设备。",

  /* This is a temporary explanation of the wall block on Setting payloads that were provided by Server.app. */
  "_temporary_knob_set_wall_block_explanation": "由 Server.app 提供",

  /* This is the URL that the help button will go to. */
  "_go_to_help_url": "https://help.apple.com/profilemanager/mac/3.1/",
  "_devices_help_url": "https://help.apple.com/profilemanager/mac/3.1/#apdCBDB5496-B0DD-41DF-BD85-C5B6A7977C4A",
  "_restrictions_help_url": "https://help.apple.com/profilemanager/mac/3.1/#apdE3C2931F-CD48-46C8-AAC6-C34F5D9AEB54",

  /* This is the Add All button in the Members Picker. It adds all items. */
  "_members_picker_add_all_button": "全部添加",

  /* This is the Add Results button in the Members Picker sheet that adds all search results. */
  "_members_picker_add_results_button": "添加结果",

  /* There are various Continue buttons in the Admin. */
  "_generic_continue_button": "继续",

  /* This is the About Root Item for General info. */
  "_general_about_root_item": "通用",

  /* This is the label when Adding a Device to Profile Manager. */
  "_add_device_label_view_value": "添加设备",

  "_add_device_Bonjour Device ID:": "Bonjour 设备 ID：",
  "_add_device_Airplay Password:": "Airplay 密码：",

  "_add_device_pane_width": "480",
  "_add_device_label_width": "140",
  "_add_device_apple_tv_help_description_height": "75",

  "_general_about_Airplay": "AirPlay",
  "_general_about_Password": "密码",
  "_general_about_no password set": "未设定密码",
  "_general_Bonjour Device ID": "Bonjour 设备 ID",
  "_general_MAC:": "MAC：",
  "_general_about_MAC_Address_Placeholder": "00:00:00:00:00:00",

  "_generic_string_The Bonjour Device ID can be found by navigating to Settings > General > About on your Apple TV and pressing up on your remote until it is displayed. The AirPlay password is used in the configuration of AirPlay Mirroring settings when this device is added as an allowed AirPlay destination.": "通过浏览到 Apple TV 上的“设置”>“通用”>“关于”，按下遥控器上的向上按钮直到 Bonjour 设备 ID 显示的方法来找到它。当此设备添加为允许的 AirPlay 目的位置时，在配置“AirPlay 镜像”的设置中会使用 AirPlay 密码。",

  "_generic_string_Known AirPlay Destinations": "已知的 AirPlay 目的位置",

  /* This is the About Root Item for Details; typically additional information that doesn't fit in General. */
  "_details_about_root_item": "详细信息",

  /* This is the About Root Item for Security. */
  "_security_about_root_item": "安全性",

  /* This is the Security field for General Settings. */
  "_general_knob_set_view_security_field": "安全性",

  /* This is the Security field for General Settings. */
  "_general_knob_set_view_automatic_profile_removal_field": "自动移除描述文件",

  /* This is the About Root Item for the parent Device Groups. */
  "_groups_in_about_root_item_in_device_groups": "在设备群组中",

  /* This is the About Root Item for parent User Groups. */
  "_groups_in_about_root_item_in_user_groups": "在群组中",

  /* This is the About Root Item for Certificates. */
  "_certificates_about_root_item": "证书",

  // About page Permissions
  "_permissions_string_Restrictions": "限制",
  "_permissions_string_Allow access to My Devices Portal (https://<hostname>/mydevices)": "允许访问“我的设备门户”(https://%@1/mydevices)",
  "_permissions_string_Allow configuration profile downloads": "允许下载配置描述文件",
  "_permissions_string_Allow device enrollment and unenrollment": "允许设备注册和取消注册",
  "_permissions_string_Allow device lock": "允许设备锁定",
  "_permissions_string_Allow device wipe": "允许设备擦除",
  "_permissions_string_Allow device passcode to be cleared": "允许清除设备密码",
  "_permissions_string_Allow device enrollment during Setup Assistant": "允许在使用“设置助理”的过程中进行设备注册",
  "_permissions_string_Restrict enrollment to assigned devices": "限制注册已分配的设备",
  "_permissions_string_Restrict enrollment to placeholder devices": "限制注册占位符设备",
  "_permissions_string_Learn about restrictions": "了解限制",

  /* This is the Provisioning Profiles tree item, shown in the sidebar as a grouping. */
  "_provisioning_profiles_tree_item": "预置描述文件",

  /* This is the Sidebar Item for Devices, shown under LIBRARY. */
  "_devices_sidebar_item_display_name": "设备",

  /* This is the Devices tab. */
  "_tabs_devices_tab": "设备",

  /* This is the Settings tab. */
  "_tabs_settings_tab": "设置",

  /* This is the Info tab. */
  "_tabs_info_tab": "信息",

  /* This is the Books tab */
  "_tabs_books_tab": "图书",

  /* This is the About tab. */
  "_tabs_about_tab": "关于",

  /* This is the Profiles tab. */
  "_tabs_profiles_tab": "描述文件",

  /* This is the Members tab. */
  "_tabs_members_tab": "成员",

  /* This is the Activity tab. */
  "_tabs_activity_tab": "活动",
  "_tabs_apps_tab": "应用程序",

  /* This is the tab shown when the tabs are loading. */
  "_tabs_loading_tab": "正在载入…",

  /* This is the Sidebar Item for Users, located under LIBRARY. */
  "_users_sidebar_item_display_name": "用户",

  /* This is the part of the Title of the Window Document Title when an Enrollment Profile is selected. */
  "_window_document_title_sidbear_auto_join_profile": "注册描述文件",

  /* This is the unique identifier popup entry for IMEI in the Add Device Sheet. */
  "_add_device_identifier_imei": "IMEI",

  /* This is the unique identifier popup entry for MEID in the Add Device Sheet. */
  "_add_device_identifier_meid": "MEID",

  /* This is the unique identifier popup entry for Serial Number in the Add Device Sheet. */
  "_add_device_identifier_serial_number": "序列号",

  /* This is the unique identifier popup entry for UDID in the Add Device Sheet. */
  "_add_device_identifier_udid": "UDID",

  /* The hint in text fields where the field is required. */
  "_hint_required": "必填",

  /* This is the name label for the Add Device sheet. */
  "_add_device_name_label": "名称：",

  /* This appears on an iPad when it is in vertical mode. */
  "_temporary_ipad_vertical_mode_blocker_label": "旋转 iPad 以使用“描述文件管理器”。",

  /* This is the menu item to create a new Provisioning Profile. */
  "_new_provisioning_profile": "预置描述文件",

  /* This shows up when nothing is selected in the sidebar. */
  "_no_item_view_nothing_selected": "未选择任何内容",

  /* This shows up when searching and nothing was found for the selected sidebar item. The wildcard is replaced with the name of the selected sidebar item. */
  "_no_item_view_no_somethings_found": "找不到“%@1”",

  /* This shows up when there is none of the thing selected in the sidebar. The wildcard is replaced with the name of the selected sidebar item. */
  "_no_item_view_no_somethings": "无“%@1”",

  /* This is the menu item to add Devices. */
  "_add_recipients_add_devices": "添加设备",

  /* This is the menu item to add User Groups. */
  "_add_recipients_add_user_groups": "添加群组",

  /* This is the menu item to add Users. */
  "_add_recipients_add_users": "添加用户",

  /* This is the menu item to add Device Groups. */
  "_add_recipients_add_device_groups": "添加设备群组",

  /* This is the hint for search boxes that filter things. */
  "_filter_hint": "过滤器",

  /*  */
  "_import_placeholder_devices": "导入占位符",

  /*  */
  "_add_placeholder_device": "添加占位符",

  /*  */
  "_import_placeholder_devices_error_cancel": "取消",

  /*  */
  "_import_placeholder_devices_imported_one_device": "已导入 1 个设备占位符",

  /*  */
  "_import_placeholder_devices_error_headers_not_found": "找不到标题。",

  /*  */
  "_import_placeholder_devices_imported_n_devices": "已导入 %@1 个设备占位符",

  /*  */
  "_import_placeholder_devices_error_non_csv": "文件不是 CSV 格式。",

  /*  */
  "_import_placeholder_devices_error_unknown": "未知错误。",

  /*  */
  "_import_placeholder_devices_error_occurred": "尝试导入占位符时出错",

  /*  */
  "_import_placeholder_devices_successful": "已成功导入占位符",

  /*  */
  "_import_placeholder_devices_error_no_valid_devices": "不存在有效的占位符。",

  /*  */
  "_import_placeholder_devices_not_imported_one_device": "未导入 1 行。",

  /*  */
  "_import_placeholder_devices_not_imported_n_devices": "未导入 %@1 行。",

  /*  */
  "_import_placeholder_devices_error_csv_invalid": "CSV 无效。",

  /* This is shown if there are mac(s) that are incompatible with the task type. */
  "_new_task_1_mac_will_not_apply_to": "这将不适用于 1 台 Mac。",

  /* This is shown if there are mac(s) that are incompatible with the task type. */
  "_new_task_n_macs_will_not_apply_to": "这将不适用于 $@1 台 Mac。",

  /*  */
  "_new_task_the_n_ios_devices_can_be_unlocked": "这 %@1 个 iOS 设备可使用其当前密码来解锁。",

  /*  */
  "_new_task_the_1_ios_device_can_be_unlocked": "此 iOS 设备可使用其当前密码来解锁。",

  /*  */
  "_new_task_enter_a_passcode_for_1_mac_os_x_device": "输入密码，供稍后用来解锁 1 个 OS X 设备。",

  /*  */
  "_new_task_enter_a_passcode_for_n_mac_os_x_devices": "输入密码，供稍后用来解锁 %@1 个 OS X 设备。",

  /*  */
  "_new_task_reenter_the_passcode": "再次输入密码",

  /*  */
  "_new_task_passcodes_did_not_match_warning": "密码不匹配",

  /*  */
  "_new_task_cancel": "取消",

  /*  */
  "_new_task_ok": "好",

  /*  */
  "_new_task_this_command_only_applies_to_ios_devices": "此命令仅适用于 iOS 设备。",

  /*  */
  "_new_task_you_must_select_one_or_more_devices": "必须选择一个或多个设备才能运行此命令。",

  /*  */
  "_new_task_no_devices_ok_button_view": "好",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Don't Allow TV Shows": "不允许电视节目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Credential for authenticating the ActiveSync account": "用于鉴定 ActiveSync 帐户的凭证",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 day": "1 天",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Credential for authenticating the connection": "用于鉴定连接的凭证",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Screenshot": "允许屏幕快照",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password for the outgoing mail server": "发件服务器的密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Safari Allow Popups": "Safari 允许弹出式窗口",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_IMEI": "IMEI",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Shared secret for the connection": "用于连接的共享密钥",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add": "添加",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%@1 Members": "%@1 位成员",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Maximum Auto-Lock": "最长自动锁定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Requires passcode to contain at least one letter": "要求密码至少包含一个字母",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The CalDAV password": "CalDAV 密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Company Account": "我的邮件帐户",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Proxy Server and Port": "代理服务器和端口",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Include User PIN": "包括用户的 PIN",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add Users": "添加用户",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Wireless network encryption to use when connecting": "连接时使用的无线网络加密类型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Save...": "存储…",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Days after which the passcode must be changed": "密码必须更改之前的有效天数",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Internal Server Path": "内部服务器路径",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Identification of the wireless network to connect to": "要连接的无线网络的标识",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Explicit Content": "允许不良内容",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Display name of the account": "帐户的显示名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_18+": "18+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication type for connection": "用于连接的鉴定类型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Camera": "允许相机",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Proxy Server URL": "代理服务器 URL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Proxy PAC URL": "代理 PAC URL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow In-App Purchase": "允许应用程序内购买",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow In-App Purchases": "允许应用程序内购买",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PIN History": "PIN 历史记录",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MA": "MA",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User Group": "群组",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Configures proxies to be used with this VPN connection": "配置要与此 VPN 连接配合使用的代理",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Group identifier for the connection": "连接的群组标识符",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_POP": "POP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_This profile has %@1 errors": "此描述文件有 %@1 个错误",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow All Apps": "允许所有应用程序",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The display name of the account": "帐户的显示名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 week": "1 周",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_This profile has 1 error": "此描述文件有 1 个错误",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_RSA SecurID": "RSA SecurID",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Maximum passcode age (1-730 days, or none)": "最长的密码有效期（1 到 730 天，或无限期）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Modem": "调制解调器",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Network": "网络",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable Secure Socket Layer communication with chat server": "启用与聊天服务器的安全套接字层通信",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Last Checkin Time": "上一次检入时间",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_R18+": "R18+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Name": "帐户名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Number of unique passcodes before reuse": "重新使用前的唯一密码的数量",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Permit the use of repeating, ascending, and descending character sequences": "允许使用重复字符序列、升序字符序列和降序字符序列",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Delete": "删除",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_18A": "18A",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access": "访问",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The hostname of the directory server": "目录服务器的主机名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow All Movies": "允许所有影片",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 hour": "1 小时",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Voice Dialing": "允许语音拨号",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The CardDAV username": "CardDAV 用户名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Display name of the connection (displayed on the device)": "连接的显示名称（显示在设备上）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Retrieve incoming mail through secure socket layer": "通过安全套接字层获取传入的邮件",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow iTunes": "允许 iTunes",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Description": "帐户描述",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Force Encrypted Backup": "强制加密的备份",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Force limited ad tracking": "强制限制广告跟踪",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Username used to connect to the proxy": "用于连接到代理的用户名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_IMAP": "IMAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ireland": "爱尔兰",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No Devices Found For Task Caption": "“找不到执行任务的设备”说明",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Passcode history (1-50 passcodes, or none)": "密码历史记录（1 到 50 个密码，或者不记录）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Type": "类型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The users and groups that cannot login at this computer": "不能在本电脑登录的用户和群组",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Search Base": "搜索基准",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_New Device Group": "新建设备群组",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Auto Sync while Roaming": "允许在漫游时自动同步",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User Display Name": "用户显示名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Safari Accept Cookies": "Safari 接受 Cookie",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_5 minutes": "5 分钟",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access Point Password": "访问点密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password for this LDAP Account": "此 LDAP 帐户的密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Shared Secret": "共享密钥",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_This configuration profile has no recipents, it will not be distributed": "此配置描述文件没有收件人，因此不予分发",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use SSL for External Exchange Host": "将 SSL 用于外部 Exchange 主机",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable VPN on Demand": "启用请求 VPN 域",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable VPN on Demand (OS X only)": "启用请求 VPN 域（仅限 OS X）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hostname or IP address, and port number for outgoing mail": "发送邮件的主机名或 IP 地址及端口号",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Window": "窗口",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. Movie Rating": "最大影片评级",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Server Address and Port": "服务器地址和端口",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 Member": "1 位成员",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication type for the connection": "连接的鉴定类型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use SSL": "使用 SSL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Group": "群组",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_email": "电子邮件",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The display name of the user (e.g. \"John Appleseed\")": "用户的显示名称（例如“John Appleseed”）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_HTTP MD5 Digest": "HTTP MD5 摘要",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Available Capacity": "可用容量",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The URL of the calendar file": "日历文件的 URL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The username for this LDAP Account": "此 LDAP 帐户的用户名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Maximum number of failed attempts": "最多可允许的失败次数",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Group Name": "群组名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Description": "描述",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name for the Exchange ActiveSync account": "Exchange ActiveSync 帐户的名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Hostname": "帐户主机名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The chat protocol to use for this configuration": "要用于此配置的聊天协议",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV-Y": "TV-Y",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Japan": "日本",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Don\'t Delete": "不删除",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV-G": "TV-G",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Realm for authenticating the connection": "用于鉴定连接的领域",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The username used to connect to the server for outgoing mail": "用于连接发件服务器的用户名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Password used to authenticate with the proxy": "用于鉴定代理的密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Subtree": "子树",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV-14": "TV-14",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_GA": "GA",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_RP16": "RP16",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_12A": "12A",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Safari Force Fraud Warning": "Safari 强制欺诈警告",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Outgoing Mail": "发送邮件",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Scope": "范围",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Type": "帐户类型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User Authentication": "用户鉴定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access Point Name (APN)": "访问点名称 (APN)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Base": "基准",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Safari": "允许 Safari",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The users and groups that can login at this computer": "可以在本电脑登录的用户和群组",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Don't Allow Movies": "不允许影片",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Minimum passcode length": "最短的密码长度",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_URL": "URL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The Principal URL for the CalDAV account": "CalDAV 帐户的主体 URL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The username used to connect to the server for incoming mail": "用于连接收件服务器的用户名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Longest auto-lock time available to the user": "适用于用户的最长自动锁定时间",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Model Number": "型号",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Username": "帐户用户名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hidden Network": "隐藏网络",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Done": "完成",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Expires: ": "过期时间：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_R-15": "R-15",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The LDAP hostname or IP address": "LDAP 主机名或 IP 地址",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt user for password on the device": "提示用户在设备上输入密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_R-18": "R-18",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Software Update server": "软件更新服务器",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password for this subscription": "此订阅的密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_New Device": "新设备",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Routes all network traffic through the VPN connection": "通过 VPN 连接来路由所有网络流量",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_WPA / WPA2": "WPA/WPA2",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use Kerberos v5 for authentication": "使用 Kerberos v5 进行鉴定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Role": "职能",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Login Group or Domain for the connection": "用于连接的登录群组或域",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Login Group or Domain": "登录群组或域",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SonicWALL": "SonicWALL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SonicWALL Mobile Connect": "SonicWALL Mobile Connect",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Aruba VIA": "Aruba VIA",

  /* This is the width of the Connection Type popup button in the VPN payload editor */
  "_layout_vpn_connection_type_button_width": "200",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Serial Number": "序列号",

  /* This is a generic string used one or more times in the app. */
  "_global_http_proxy_type_Automatic": "自动",
  "_network_proxy_type_Automatic": "自动",
  "_vpn_data_encryption_level_Automatic": "自动",
  "_vpn_proxy_type_Automatic": "自动",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The description of the calendar subscription": "日历订阅的描述",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The CardDAV password": "CardDAV 密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PG-13": "PG-13",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PG-12": "PG-12",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Always": "总是",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Caution": "警告",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The image file is invalid or too large": "映像文件无效或太大",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Options": "选项",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_WEP Enterprise": "WEP 企业级",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Username": "用户名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Longest device lock grace period available to the user": "适用于用户的最长设备锁定宽限期",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password for the account (e.g. \"MyP4ssw0rd!\")": "帐户的密码（例如“MyP4ssw0rd!”）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The authentication method for the incoming mail server": "收件服务器的鉴定方法",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Simple Passcode": "允许简单密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Remove": "移除",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_C8": "C8",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My CardDAV Account": "我的通讯录帐户",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ICCID": "ICCID",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow simple value": "允许简单值",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable Secure Socket Layer communication with CalDAV server": "启用与 CalDAV 服务器的安全套接字层通信",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_One Level": "一级",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The manner in which the profile is distributed to devices": "描述文件分发到设备的方式",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication Type": "鉴定类型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SMTP authentication uses the same password as POP/IMAP": "SMTP 鉴定使用与 POP/IMAP 相同的密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_groupname": "群组名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. Failed Attempts": "最多失败尝试次数",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Uc": "Uc",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_From visited sites": "来自所访问的站点",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Shared Secret / Group Name": "共享密钥/群组名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Group for authenticating the connection": "用于鉴定连接的群组",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable Secure Socket Layer for this connection": "启用此连接的安全套接字层",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Password": "帐户密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_External Server Path": "外部服务器路径",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication": "鉴定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_, ": ", ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No Members": "无成员",
  "_user_group_membership_count_1 Group, No Users": "1 个群组",
  "_user_group_membership_count_%@ Groups, No Users": "%@ 个群组",
  "_user_group_membership_count_No Groups, 1 User": "1 位用户",
  "_user_group_membership_count_No Groups, %@ Users": "%@ 位用户",
  "_user_group_membership_count_1 Group, 1 User": "1 个群组，1 位用户",
  "_user_group_membership_count_%@ Groups, %@ Users": "%@ 个群组，%@ 位用户",
  "_user_group_membership_count_%@ Groups, 1 User": "%@ 个群组，1 位用户",
  "_user_group_membership_count_1 Group, %@ User": "1 个群组，%@ 位用户",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication Credential": "鉴定凭证",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Server path for the external exchange host": "外部 Exchange 主机的服务器路径",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Issued by: %@1": "签发者：%@1",

  /* This is a generic string used one or more times in the app. */
  "_network_proxy_setting_None": "无",
  "_network_security_type_None": "无",
  "_incoming_email_authentication_type_None": "无",
  "_outgoing_email_authentication_type_None": "无",
  "_vpn_encryption_level_None": "无",
  "_vpn_proxy_setting_None": "无",
  "_default_printer_item_None": "无",
  "_scep_subject_alternative_name_type_None": "无",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Device": "设备",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Software Version": "软件版本",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. TV Shows Rating": "最大电视节目评级",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Carrier Settings Version": "运营商设置版本",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Password for the account": "帐户的密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The directory server username": "目录服务器用户名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user name to connect to the access point": "连接访问点的用户名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_smtp.example.com": "smtp.example.com",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%m/%d/%y at %i:%M:%S %p": "%y-%m-%d %p%i:%M:%S",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable Secure Socket Layer communication with CardDAV server": "启用与 CardDAV 服务器的安全套接字层通信",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Controls when the profile can be removed": "控制在何种情况下可以删除描述文件",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_mail.example.com": "mail.example.com",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Automatic Push": "自动推送",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The directory server client ID": "目录服务器客户端 ID",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt for Password": "提示输入密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_OK": "好",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User account for authenticating the connection": "用于鉴定连接的用户帐户",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use as a System configuration": "用作“系统”配置（仅限 OS X）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_UDID": "UDID",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Safari Allow JavaScript": "Safari 允许 JavaScript",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Hostname and Port": "帐户主机名和端口",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The number of past days of mail to synchronize": "要同步过去邮件的天数",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Current Carrier Network": "当前的运营商网络",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Expires: %A, %B %D, %Y %i:%M:%S %p %Z": "过期时间：%Y年%B%D日%A %p%i:%M:%S %Z",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV-MA": "TV-MA",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Path Prefix:": "路径前缀：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Smallest number of non-alphanumeric characters allowed": "允许的非字母和数字字符的最少数目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password for the incoming mail server": "收件服务器的密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_2 minutes": "2 分钟",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Any (Enterprise)": "任一（企业级）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Microsoft Exchange Server": "Microsoft Exchange Server",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_username": "用户名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User Name": "用户名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_usernames": "用户名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Security Type": "安全性类型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_United Kingdom": "英国",

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
  "_generic_string_Authentication Credential Passphrase": "鉴定凭证口令",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. Apps Rating": "最大应用程序评级",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Min. Complex Char's": "最少复杂字符数",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_optional Ex. O=Company Name, CN=Foo": "可选。例如 O=Company Name, CN=Foo",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require Alphanumeric": "要求字母数字",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication Credential Name": "鉴定凭证名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_4 minutes": "4 分钟",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Principal URL": "主体 URL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_set on device": "在设备上设定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The directory server password": "目录服务器密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My Subscribed Calendar": "我订阅的日历",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The Principal URL for the CardDAV account": "CardDAV 帐户的主体 URL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MD5 Challenge-Response": "MD5 质询－响应",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User logs in to authenticate the Mac to the network": "用户登录以将 Mac 鉴定到网络",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ab 18 Jahren": "ab 18 Jahren",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MDM": "MDM",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_12+": "12+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require alphanumeric value": "要求字母和数字值",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Bluetooth MAC": "蓝牙 MAC",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow YouTube": "允许 YouTube",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_United States": "美国",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Server Hostname": "服务器主机名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The address of the account (e.g. \"john@example.com\")": "帐户地址（例如：john@example.com）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MA15+": "MA15+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use Kerberos v5": "使用 Kerberos v5",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The Mac can access the network without a logged-in user": "用户无须登录，Mac 就可以访问网络",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Send All Traffic": "发送全部流量",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Password": "密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Last Edited %A, %B %d, %Y": "上一次编辑日期：%Y年%B%d日%A",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The name of the carrier (GPRS) access point": "运营商 (GPRS) 访问点的名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The protocol for accessing the email account": "访问该帐户时使用的协议",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add User Groups": "添加群组",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Safari Allow Autofill": "Safari 允许自动填充",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Loading…": "正在载入…",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Connection Type": "连接类型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ask during installation": "安装时询问",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Australia": "澳大利亚",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My CalDAV Account": "我的日历帐户",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The device will prompt the user for the passphrase if not given": "设备将提示用户输入口令（如果未给定）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. PIN Age In Days": "以天为单位的最长 PIN 时效",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_R18": "R18",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hostname of IP address for server": "服务器的主机名或 IP 地址",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Machine Authentication": "机器鉴定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Outgoing password same as incoming": "发件密码与收件密码相同",

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
  "_generic_string_Hostname or IP address, and port number for incoming mail": "接收邮件的主机名或 IP 地址及端口号",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_4+": "4+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Encryption Level": "加密级别",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_URL used to retrieve proxy settings": "用于取回代理设置的 URL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Email Address": "电子邮件地址",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Profile Distribution Type": "描述文件分发类型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Min. Length": "最小长度",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_LDAP Account": "LDAP 帐户",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable if target network is not open or broadcasting": "如果目标网络不是开放网络或未广播信号，请启用此功能",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Scripts": "脚本",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Service Set Identifier (SSID)": "服务集标识符 (SSID)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Maximum grace period for device lock": "设备锁定的最长宽限时间",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name or description for ActiveSync": "ActiveSync 的名称或描述",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_France": "法国",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Type of network interface on the device": "设备上的网络接口类型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The display name of the account (e.g. 'Company LDAP Account')": "帐户的显示名称（例如“公司 LDAP 帐户”）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_3 minutes": "3 分钟",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_2 weeks": "2 周",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_New Configuration Profile": "新建配置描述文件",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Capacity": "容量",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name for the Exchange Web Services account": "Exchange Web 服务帐户的名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Network Interface": "网络接口",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Minimum number of complex characters": "必须包含的复杂字符的最少数目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The display name of the account (e.g. \"Company Mail Account\")": "帐户的显示名称（例如“公司邮件帐户”）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The CalDAV username": "CalDAV 用户名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_defaults to username@host": "默认为 username@host",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authenticate using secret, name, and server-side certificate": "使用密钥、名称和服务器端证书进行鉴定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_mobile": "移动电话",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Machine": "机器",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User": "用户",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Revert": "复原",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_15 minutes": "15 分钟",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 minutes": "1 分钟",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Password for authenticating the connection": "用于鉴定连接的密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Password for the wireless network": "无线网络的密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PS": "PS",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_-18": "-18",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Search settings for this LDAP server": "搜索此 LDAP 服务器的设置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_-16": "-16",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Canada": "加拿大",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_-12": "-12",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_-10": "-10",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password to connect to the access point": "用以连接到访问点的密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PG": "PG",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_4 hours": "4 小时",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Exchange ActiveSync Host": "Exchange ActiveSync 主机",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Past Days of Mail to Sync": "要同步过去邮件的天数",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow": "允许",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Wi-Fi MAC": "Wi-Fi MAC",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ethernet MAC": "以太网 MAC",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV-PG": "TV-PG",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Server": "服务器",

  /* This is a generic string used one or more times in the app. */
  "_global_http_proxy_type_Manual": "手动",
  "_network_proxy_type_Manual": "手动",
  "_vpn_proxy_type_Manual": "手动",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 month": "1 个月",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Force Passcode": "强制密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use as a Login Window configuration": "用作“登录窗口”配置（仅限 OS X）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow FaceTime": "允许 FaceTime",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Search Settings": "搜索设置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_YA": "YA",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_optional": "可选",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Save": "存储",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The printers available to a user": "可供用户使用的打印机",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use SSL for Internal Exchange Host": "将 SSL 用于内部 Exchange 主机",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Build": "版号",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Realm": "领域",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The chat username": "聊天用户名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Smallest number of passcode characters allowed": "允许的密码字符的最少数目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Incoming Mail": "接收邮件",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_NC-17": "NC-17",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_3 days": "3 天",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Any (Personal)": "任一（个人级）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_9+": "9+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PGR": "PGR",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hostname or IP address, and port number for the proxy server": "代理服务器的主机名或 IP 地址及端口号",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV-Y7": "TV-Y7",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Mail Server and Port": "邮件服务器和端口",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Deny": "拒绝",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Retrieve outgoing mail through secure socket layer": "通过安全套接字层来取回外发邮件",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hostname or IP address, and port number for the server": "服务器的主机名或 IP 地址及端口号",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Proxy Setup": "代理设置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Proxy Type": "代理类型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Never": "永不",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_--": "--",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_WPA / WPA2 Enterprise": "WPA/WPA2 企业级",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. Inactivity": "最长闲置时间",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use Hybrid Authentication": "使用混合鉴定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sim Carrier Network": "SIM 运营商网络",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_NTLM": "NTLM",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The type of connection enabled by this policy": "此策略所启用的连接类型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Printer List": "打印机列表",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 minute": "1 分钟",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ab 16 Jahren": "ab 16 Jahren",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Immediately": "立即",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My Account": "我的帐户",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Manual Download": "手动下载",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Server path for the internal exchange host": "内部 Exchange 主机的服务器路径",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_AV15+": "AV15+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Client ID": "客户端 ID",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Man. Fetch. When Roaming": "漫游时手动取回",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Cancel": "取消",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ab 6 Jahren": "ab 6 Jahren",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_auto": "自动",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Specify a URL of the form http://server.example.com:8088/catalogs.sucatalog": "以 http://server.example.com:8088/catalogs.sucatalog 形式指定 URL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Internal Exchange Host": "内部 Exchange 主机",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Role for authenticating the connection": "用于鉴定连接的角色",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Connection Name": "连接名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Explicit Allowed": "允许不良内容",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The CardDAV hostname or IP address and port number": "CardDAV 主机名或 IP 地址和端口号",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate": "证书",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. Grace Period": "最长宽限期",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Don't Allow Apps": "不允许应用程序",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ch": "Ch",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ab 0 Jahren": "ab 0 Jahren",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The authentication method for the outgoing mail server": "发件服务器的鉴定方法",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_External Exchange Host": "外部 Exchange 主机",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The CalDAV hostname or IP address and port number": "CalDAV 主机名或者 IP 地址及端口号",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow All TV Shows": "允许所有电视节目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Domain": "域",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Phone": "电话",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_14+": "14+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Germany": "德国",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_AO": "AO",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Send all communication through secure socket layer": "通过安全套接字层发送全部通信",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Domain and host names that will establish a VPN": "域名称和主机名，它们将建立 VPN",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account": "帐户",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_New Zealand": "新西兰",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The username for this subscription": "此订阅的用户名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Number of passcode entry attempts allowed before all data on device will be erased": "在抹掉设备上的所有数据之前所允许的密码输入失败次数",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access Point User Name": "访问点用户名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User authentication type for the connection": "连接的用户鉴定类型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_WEP": "WEP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Level of data encryption applied to the connection": "连接所应用的数据加密级别",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow App Installation": "允许应用程序安装",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_14A": "14A",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Maximum (128-bit)": "最大（128 位）",

  /*  */
  "_knob_set_from_servermgr_card_dav_hostname": "主机名",

  /*  */
  "_knob_set_from_servermgr_card_dav_port": "端口",

  /*  */
  "_knob_set_from_servermgr_helper": "此有效负载是使用 Server 应用程序进行配置的",

  /*  */
  "_knob_set_from_servermgr_cal_dav_hostname": "主机名",

  /*  */
  "_knob_set_from_servermgr_cal_dav_port": "端口",

  /*  */
  "_knob_set_from_servermgr_email_group_incoming_mail": "接收邮件",

  /*  */
  "_knob_set_from_servermgr_email_account_description": "帐户描述",

  /*  */
  "_knob_set_from_servermgr_email_account_type": "帐户类型",

  /*  */
  "_knob_set_from_servermgr_email_incoming_hostname": "邮件服务器",

  /*  */
  "_knob_set_from_servermgr_email_incoming_port": "端口",

  /*  */
  "_knob_set_from_servermgr_email_outgoing_ssl": "使用 SSL",

  /*  */
  "_knob_set_from_servermgr_email_outgoing_hostname": "邮件服务器",

  /*  */
  "_knob_set_from_servermgr_email_group_outgoing_mail": "发送邮件",

  /*  */
  "_knob_set_from_servermgr_email_incoming_ssl": "使用 SSL",

  /*  */
  "_knob_set_from_servermgr_email_outgoing_port": "端口",

  /*  */
  "_knob_set_from_servermgr_email_incoming_authentication": "鉴定类型",

  /*  */
  "_knob_set_from_servermgr_email_outgoing_authentication": "鉴定类型",

  /*  */
  "_knob_set_from_servermgr_cal_dav_account_description": "帐户描述",

  /*  */
  "_knob_set_from_servermgr_card_dav_account_description": "帐户描述",

  /*  */
  "_knob_set_from_servermgr_cal_dav_ssl": "使用 SSL",

  /*  */
  "_knob_set_from_servermgr_card_dav_ssl": "使用 SSL",

  /*  */
  "_knob_set_from_servermgr_ichat_hostname": "服务器地址",

  /*  */
  "_knob_set_from_servermgr_ichat_port": "端口",

  /*  */
  "_knob_set_from_servermgr_ichat_connection_name": "帐户描述",

  /*  */
  "_knob_set_from_servermgr_ichat_connection_type": "帐户类型",

  /*  */
  "_knob_set_from_servermgr_passcode_required": "要求设备密码",

  /*  */
  "_knob_set_from_servermgr_passcode_allow_simple": "允许简单值",

  /*  */
  "_knob_set_from_servermgr_passcode_min_length": "最短的密码长度",

  /*  */
  "_knob_set_from_servermgr_passcode_require_alphanumeric": "要求字母和数字值",

  /*  */
  "_knob_set_from_servermgr_passcode_min_complex": "最少复杂字符数",

  /*  */
  "_knob_set_from_servermgr_passcode_max_age": "最长密码时效",

  /*  */
  "_knob_set_from_servermgr_passcode_auto_lock": "自动锁定",

  /*  */
  "_knob_set_from_servermgr_passcode_yes": "是",

  /*  */
  "_knob_set_from_servermgr_passcode_no": "否",

  /*  */
  "_knob_set_from_servermgr_passcode_none": "无",

  /*  */
  "_knob_set_from_servermgr_passcode_never": "永不",

  /*  */
  "_knob_set_from_servermgr_passcode_1_minute": "一分钟",

  /*  */
  "_knob_set_from_servermgr_passcode_n_minutes": "%@1 分钟",

  /*  */
  "_knob_set_from_servermgr_ichat_connection_type_jabber": "Jabber",

  /*  */
  "_knob_set_from_servermgr_ichat_connection_type_not_jabber": "非 Jabber",

  /*  */
  "_knob_set_from_servermgr_vpn_server": "服务器",

  /*  */
  "_knob_set_from_servermgr_vpn_use_shared_secret": "使用共享密钥",

  /*  */
  "_knob_set_from_servermgr_vpn_send_proxy_setup": "代理设置",

  /*  */
  "_knob_set_from_servermgr_vpn_send_all_traffic": "发送全部流量",

  /*  */
  "_knob_set_from_servermgr_vpn_user_auth": "用户鉴定",

  /*  */
  "_knob_set_from_servermgr_vpn_connection_name": "连接名称",

  /*  */
  "_knob_set_from_servermgr_vpn_connection_type": "连接类型",

  /*  */
  "_knob_set_from_servermgr_email_account_type_pop": "POP",

  /*  */
  "_knob_set_from_servermgr_email_account_imap": "IMAP",

  /*  */
  "_knob_set_from_servermgr_email_account_crammd5": "MD5 质询－响应",

  /*  */
  "_knob_set_from_servermgr_email_account_not_crammd5": "非 MD5 质询－响应",

  /*  */
  "_import_placeholder_devices_skip": "跳过",

  /*  */
  "_import_placeholder_devices_create_device_group": "创建设备群组",

  /*  */
  "_import_placeholder_devices_add_to_existing_device_group": "添加到现有设备群组",

  /*  */
  "_truncated_indicator_view_helper": "使用搜索框来访问其他记录",

  /* First wildcard is the name of the user, second wildcard is the name of the device. */
  "_lab_session_user_on_device": "%@1 在 %@2 上",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name of the organization for the profile": "描述文件组织的名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Organization": "组织",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add Mount Point": "添加装载点",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can always launch these applications": "用户总是可以开启这些应用程序",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Applications": "应用程序",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Don't add to Device Group": "不添加到设备群组",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Files in these folders will sync as specified above": "这些文件夹中的文件将按照上述指定内容进行同步",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Create a new Device Group": "创建新的设备群组",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Items matching any of the following will not sync": "与以下任何项目匹配的项目将不会同步",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Creation": "帐户创建",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Preference Sync": "偏好设置同步",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_CHAP": "CHAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Dock Applications": "Dock 应用程序",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can never launch applications in these folders": "用户永不能在这些文件夹中开启应用程序",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can always launch applications in these folders": "用户总是可以在这些文件夹中开启应用程序",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Identity Certificate": "身份证书",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate names expected from authentication server": "证书名称应来自鉴定服务器",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Username for connection to the network": "网络连接的用户名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Folders:": "允许文件夹：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Outer Identity": "外部身份",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Password for the provided username": "所提供用户名称的密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Disallow Folders:": "不允许文件夹：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Inner Authentication": "内部鉴定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The files and folders that will appear in the user's dock": "将出现在用户的 Dock 中的文件和文件夹",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Widgets": "Widget",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Skip Items": "跳过项目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hostname:": "主机名：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PAP": "PAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Expiry": "帐户到期",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Dock Items": "Dock 项目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication protocol (for use only with TTLS)": "鉴定协议（仅用于 TTLS）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificates trusted/expected for authentication": "证书获得信任/通过鉴定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Request during connection and send with authentication": "每次连接时要求输入并与鉴定一起发送",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Externally visible identification (TTLS, PEAP, and EAP-FAST)": "外部公开身份（适用于 TTLS、PEAP 和 EAP-FAST）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MSCHAP": "MSCHAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Method to use to authenticate to the network": "要用于进行网络鉴定的方法",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use Per-Connection Password": "使用单一连接密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MSCHAPv2": "MSCHAPv2",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Protocols": "协议",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Preferences in these folders will sync as specified above": "这些文件夹中的偏好设置将按照上述指定内容进行同步",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Trusted Server Certificate Names": "可信的服务器证书的名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Rules": "规则",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Widgets:": "允许 Widget：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Creation": "创建",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The applications that will appear in the user's dock": "将出现在用户的 Dock 中的应用程序",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Trust": "信任",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can always run these widgets": "用户总是可以运行这些 Widget",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Trust Exceptions": "允许信任例外",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Home Sync": "个人同步",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Applications:": "允许应用程序：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Credentials for connection to the network": "网络连接的凭证",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sync Folders": "同步文件夹",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Trusted Certificates": "可信的证书",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Protocol:": "协议：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SMB": "SMB",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_NFS": "NFS",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Volume:": "宗卷：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_AFP": "AFP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Refresh": "刷新",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MEID": "MEID",

  /*  */
  "_admin_welcome_first_time": "欢迎使用“描述文件管理器”！",

  /*  */
  "_admin_welcome_close": "关闭",

  /*  */
  "_admin_welcome_dont_show_again": "不再显示",

  /*  */
  "_no_item_view_is_truncation_indicator": "使用搜索来查找“%@1”",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Help": "帮助",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Log Out": "退出",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show Welcome Panel": "显示欢迎面板",

  /*  */
  "_members_picker_refresh_button": "刷新",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show Passcode": "显示密码",

  /*  */
  "_show_passcode_the_passcode_is": "密码是：%@1",

  /*  */
  "_show_passcode_message": "显示密码",

  /*  */
  "_task_cancel_task": "取消任务",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Send Email": "发送电子邮件",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Send": "发送",

  /*  */
  "_setting_types_mac": "OS X",

  /*  */
  "_setting_types_both": "OS X 和 iOS",

  /*  */
  "_setting_types_ios": "iOS",

  /*  */
  "_task_type_remove_profile_with_display_name": "移除设置：%@1",

  /*  */
  "_profile_1_payload_configured": "已配置了 1 个有效负载",

  /*  */
  "_profile_n_payloads_configured": "已配置了 %@1 个有效负载",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Created ": "创建时间 ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Updated ": "已更新 ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Edit": "编辑",

  /*  */
  "_items_settings": "“%@1”的设置",

  /*  */
  "_items_settings_n": "“%@1”的设置 (%@2)",

  /*  */
  "_add_recipients_new_profile": "新建描述文件",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Go": "前往",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_With Authorization": "使用授权",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Wi-Fi": "Wi-Fi",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ethernet (OS X only)": "以太网（仅限 OS X）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_LEAP": "LEAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TTLS": "TTLS",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PEAP": "PEAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication protocols supported on target network": "目标网络所支持的鉴定协议",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_EAP-SIM": "EAP-SIM",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_EAP-AKA": "EAP-AKA",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Provision PAC Anonymously": "匿名预置 PAC",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use PAC": "使用 PAC",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Configuration of Protected Access Credential (PAC)": "保护性访问凭证 (PAC) 的配置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Accepted EAP Types": "已接受的 EAP 类型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Provision PAC": "预置 PAC",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_EAP-FAST": "EAP-FAST",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TLS": "TLS",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate Common Name": "证书通用名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Directory (OS X only)": "目录（仅限 OS X）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow trust decisions (via dialog) to be made by the user": "允许由用户（通过对话）所作的信任决定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_CryptoCard (OS X only)": "CryptoCard（仅限 OS X）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate (OS X only)": "证书（仅限 OS X）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Kerberos (OS X only)": "Kerberos（仅限 OS X）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Portable": "便携设备",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allowances": "宽限时间",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow URLs:": "允许 URL：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Power Adapter": "电源适配器",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Content Filtering": "内容过滤",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Preferences": "偏好设置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Battery": "电池",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Battery Menu": "电池菜单",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Media": "介质",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Curfews": "宵禁时间",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Desktop": "桌面",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Time Limits": "时间限制",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Schedule": "定时",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can always access sites at these URLs": "用户总是可以通过这些 URL 来访问站点",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Deny URLs:": "拒绝 URL：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Functionality": "功能",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow only these URLs:": "仅允许这些 URL：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Media Content": "媒体内容",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can never access sites at these URLs": "用户永不能通过这些 URL 来访问站点",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can only access sites at these URLs": "用户只能通过这些 URL 来访问站点",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Parental Controls": "家长控制",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Software Update": "软件更新",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Universal Access": "辅助功能",

  "_generic_string_Accessibility": "辅助功能",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Keyboard": "键盘",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sound": "声音",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Mouse": "鼠标",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Displays": "显示器",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_FibreChannel": "光纤通道",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sharing": "共享",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Startup Disk": "启动磁盘",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Dock": "Dock",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Speech": "听写与语音",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Energy Saver": "节能器",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Profiles": "描述文件",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Internet Accounts": "互联网帐户",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Desktop & Screen Saver": "桌面与屏幕保护程序",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Accounts": "帐户",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Notifications": "通知",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Print & Scan": "打印与扫描",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ink": "Ink",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Trackpad": "触控板",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Localization": "本地化",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Xsan": "Xsan",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_CDs & DVDs": "CD 与 DVD",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Security": "安全性",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Time Machine": "Time Machine",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Date & Time": "日期与时间",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MobileMe": "MobileMe",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Expose": "显示",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Appearance": "外观",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Bluetooth": "蓝牙",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add in Certificate payload": "在证书有效负载中添加",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Match Domain or Host": "匹配域或主机",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_On Demand Action": "请求操作",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Not Configured": "未配置",

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
  "_generic_string_Label": "标签",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Choose...": "选取…",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Displays the web clip as a full screen application": "将 Web Clip 显示为全屏幕应用程序",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable removal of the Web Clip": "允许删除 Web Clip",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The icon will be displayed with no added visual effects": "显示图标时将不添加视觉效果",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Image was too large, returned empty string": "映像太大，返回了空字符串",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The URL to be displayed when opening the Web Clip": "打开 Web Clip 时要显示的 URL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Full Screen  (iOS only)": "全屏幕（仅限 iOS）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Removable  (iOS only)": "可删除（仅限 iOS）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The name to display for the Web Clip": "要显示的 Web Clip 的名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Precomposed Icon  (iOS only)": "预作图标（仅限 iOS）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The icon to use for the Web Clip": "用于 Web Clip 的图标",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ou=MyDepartment, o=My Company": "ou=我的部门, o=我的公司",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Exchange ActiveSync (iOS only)": "Exchange ActiveSync（仅限 iOS）",
  "_generic_string_Exchange ActiveSync": "Exchange ActiveSync",
  /* This is a generic string used one or more times in the app. */
  "_generic_string_Exchange Web Services (OS X only)": "Exchange Web 服务（仅限 OS X）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My Search": "我的搜索",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow use of iTunes Store": "允许使用 iTunes Store",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow use of Safari": "允许使用 Safari",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow installing apps": "允许安装应用程序",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow removing apps": "允许移除应用程序（仅限被监督的设备）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Touch ID to unlock device": "允许使用 Touch ID 解锁设备",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sets the region for the ratings": "设定评级的地区",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_DNS Name": "DNS 名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow use of YouTube": "允许使用 YouTube",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_R": "R",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_P": "P",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_An NT principal name for use in the certificate request": "用在证书请求中的 NT 主体名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_NT Principal Name": "NT 主体名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allowed content ratings": "已允许内容评级",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_G": "G",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_C": "C",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow in App Purchase": "允许应用程序内购买",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_RFC 822 Name": "RFC 822 名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The value of a subject alternative name": "主题备用名称的值",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_M": "M",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sets the maximum allowed ratings": "设定许可的最大评级",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable JavaScript": "启用 JavaScript",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Block pop-ups": "阻止弹出式窗口",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow automatic sync while roaming": "允许在漫游时自动同步",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV Shows:": "电视节目：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Uniform Resource Identifier": "统一资源标识符",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Subject Alternative Name Value": "主题备用名称值",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow voice dialing": "允许语音拨号",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Accept Cookies": "接受 Cookie",

  "_generic_string_Autonomous Single App Mode (Supervised Only)": "自发单应用程序模式（仅限被监督的设备）",
  "_generic_string_Allow these apps to enter Single App Mode": "允许这些应用程序进入“单应用程序模式”",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Movies:": "影片：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_U": "U",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow screen capture": "允许屏幕快照",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Force fraud warning": "强制发出欺诈警告",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Apps:": "应用程序：",
  "_generic_string_Apps": "应用程序",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The type of a subject alternative name": "主题备用名称的类型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable autofill": "启用自动填充",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Force encrypted backups": "强制对备份进行加密",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Subject Alternative Name Type": "主题备用名称类型",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow use of camera": "允许使用相机",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ratings region": "评级地区",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow explicit music, podcasts, and iTunes U": "允许不良的音乐、播客和 iTunes U",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Path of item": "项目的路径",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Settings for Dock behavior and appearance": "Dock 行为和外观的设置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Automatically hide and show the Dock": "自动显示和隐藏 Dock",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Right": "右侧",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add other folders:": "添加其他文件夹：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Network Home": "网络个人",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Display Settings": "显示设置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show indicator lights for open applications": "显示已打开的应用程序的指示灯",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My Applications": "我的应用程序",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Animate opening applications": "弹跳打开应用程序",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Bottom": "底部",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Scale Effect": "缩放效果",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Large": "大",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Merge with User's Dock": "与用户的 Dock 合并",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Minimize using:": "最小化方式：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Small": "小",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Documents": "文稿",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Minimize window into application icon": "将窗口最小化成应用程序图标",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Position:": "位置：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Dock Size:": "Dock 大小：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Magnification:": "放大比例：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Genie Effect": "神奇效果",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max": "最大",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Min": "最小",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Left": "左侧",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Item": "项目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The applications that will launch at login": "将在登录时开启的应用程序",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hide": "隐藏",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authenticate selected share point with user's login name and password": "使用用户的登录名称和密码来鉴定所选共享点",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User may press Shift to keep items from opening": "用户可按下 Shift 键以阻止项目打开",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The network volumes that will be mounted at login": "将在登录时装载的网络宗卷",
  "_generic_string_The network volumes that will be mounted using user's login name and password for authentication": "已使用用户的登录名称和密码进行鉴定的互联网装载",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Items": "项目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User may add and remove additional items": "用户可以添加和移除附加项目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authenticated Network Mounts": "已鉴定的网络装载",
  "_generic_string_Network Mounts": "网络装载",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add network home share point": "添加网络个人共享点",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The files and folders that will open at login": "将在登录时打开的文件和文件夹",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add a network accessible volume to mount at login.": "添加要在登录时装载的网络可访问宗卷。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hours": "小时",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require computer master password": "要求电脑主密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_in background": "在后台",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Manually": "手动",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show status in menu bar": "在菜单栏中显示状态",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Full Path": "完整路径",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_at login": "登录时",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Days": "天",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Setting this value to 0 causes the mobile account to be deleted as soon as possible.": "将此值设为 0 会促使尽可能快地删除移动帐户。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Encrypt contents with FileVault": "使用 FileVault 对内容进行加密",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_RegEx Name": "RegEx 名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Partial Path": "部分路径",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MB": "MB",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Restrict size:": "限制大小：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Home folder location:": "个人文件夹位置：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Starts With": "开头是",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Create home using:": "个人创建方式：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Delete mobile accounts:": "删除移动帐户：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_at logout": "退出时",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Create mobile account when user logs in to network account": "在用户登录到网络帐户时创建移动帐户",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ends With": "结尾是",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_network home and default sync settings": "网络个人和默认同步设置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use computer master password, if available": "使用电脑主密码（如果可用的话）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Every": "每",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sync:": "同步：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_minutes": "分钟",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_to percentage of network home quota:": "为网络个人配额的百分比：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Delete only after successful sync": "仅在成功同步后才删除",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show \"Don't ask me again\" checkbox": "显示“不再询问我”复选框",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Weeks": "周",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_local home template": "本地个人模板",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sync in the background:": "在后台同步：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name Is": "名称是",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_after user's last login": "在用户的最后一次登录之后",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_manually": "手动",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_at path:": "在以下路径：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_RegEx Path": "RegEx 路径",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%": "%",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_to fixed size:": "为固定大小：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Merge with user's settings": "与用户的设置合并",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_on startup volume": "在启动宗卷上",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name Contains": "名称包含",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require confirmation before creating mobile account": "创建移动帐户前要求确认",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_New directory path": "新建目录路径",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Font Name:": "字体名称：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require an administrator password": "要求管理员密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Font Size:": "字体大小：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Default Printer:": "默认打印机：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Checked printers require an administrator password": "选中的打印机要求管理员密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Include MAC address": "包含 MAC 地址",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow user to modify printer list": "允许用户修改打印机列表",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow printers that connect directly to user's computer": "允许直接连接到用户电脑的打印机",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Print page footer (user name and date)": "打印页脚（用户名称和日期）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Times": "Times",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Settings for the optional footer applied to pages": "应用于页面的可选页脚的设置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Lucida Grande": "Lucida Grande",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Helvetica": "Helvetica",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Only show managed printers": "仅显示被管理的打印机",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Courier": "Courier",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Footer Settings": "页脚设置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_AirDrop:": "AirDrop：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Recordable Discs:": "可刻录光盘：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_DVD-RAM:": "DVD-RAM：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Directory Path": "目录路径",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access settings for network media": "网络介质的访问设置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow only the following Dashboard widgets to run": "仅允许以下 Dashboard Widget 运行",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Eject at logout": "退出时推出",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable All": "全部启用",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access settings for hard disk media": "硬盘介质的访问设置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Network Access": "网络访问",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_DVDs:": "DVD：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require Authentication": "要求鉴定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The selected items are enabled in System Preferences": "所选项目已在“系统偏好设置”中启用",

  "_generic_string_System Preference Panes": "系统偏好设置面板",

  "_generic_string_Third-party Preference Panes": "第三方偏好设置面板",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable None": "不启用",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_CDs & CD-ROMs:": "CD 和 CD-ROM：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Read-Only": "只读",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Restrict items in system preferences": "在“系统偏好设置”中限制项目",
  "_generic_string_enable selected items": "启用所选项目",
  "_generic_string_disable selected items": "停用所选项目",
  "_generic_string_Select None": "都不选",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require admin password to install or update apps": "需要管理员密码来安装或更新应用程序",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Restrict which applications are allowed to launch": "限定允许开启的应用程序",

  "_generic_string_Restrict App Store to software updates only": "限制 App Store 仅显示软件更新",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Disc Media Access": "光盘介质访问",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access settings for removable disc media": "可移动光盘介质的访问设置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hard Disk Media Access": "硬盘介质访问",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Internal Disks:": "内置磁盘：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Eject all removable media at logout": "退出时推出所有可移动的介质",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_External Disks:": "外置磁盘：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_always": "总是",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_establish": "建立",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_never": "永不",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_default": "默认",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Get Root Certificate": "获得根证书",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prevent computer access during the specified days and hours.": "在指定的日期和时间内阻止电脑访问。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Friday and Saturday": "星期五和星期六",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_From:": "从：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_allowing access to the following websites only": "仅允许访问以下网址",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Weekends": "周末",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Deny Access": "拒绝访问",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_trying to limit access to adult websites": "尝试限制访问成人网站",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow computer access Monday through Friday for the specified number of hours only.": "星期一到星期五仅允许电脑访问指定的小时数。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_30 min": "30 分钟",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Disk Images:": "磁盘映像：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_AM": "上午",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PM": "下午",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sunday through Thursday": "星期日至星期四",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Limit Access to websites by": "限制网站访问，依照",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_:": ":",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow computer access Saturday and Sunday for the specified number of hours only.": "星期六和星期日仅允许电脑访问指定的小时数。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Weekdays": "工作日",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_8 hr": "8 小时",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hide profanity in Dictionary": "隐藏词典和听写中的亵渎词汇",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_to:": "至：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enforce Limits": "实施限制",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Limit computer use to:": "电脑使用的时间限制在：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Download": "下载",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Please correct the error before continuing.": "请纠正错误，然后再继续操作。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Please correct the errors before continuing.": "请纠正错误，然后再继续操作。",

  /* Add an item */
  "_prefs_list_item_count": "（%@1 个项目）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Boolean": "布尔值",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Value": "值",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Property List Values": "属性列表值",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Preference Domain": "偏好设置域",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Array": "数组",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Delete Item": "删除项目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Dictionary": "字典",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_String": "字符串",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Data": "数据",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Date": "日期",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The name of a preference domain (com.company.application)": "偏好设置域的名称 (com.company.application)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Key": "密钥",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Number": "编号",

  /* Add an item */
  "_prefs_button_title_Add Item": "添加项目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Key value pairs for settings in the specified domain": "所指定域中设置的键值对",

  /* Add a child node */
  "_prefs_button_title_Add Child": "添加子节点",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_New Item": "新项目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No Data": "无数据",

  /*  */
  "_temporary_iphone_ipod_blocker_label": "在 iPad 或电脑上使用“描述文件管理器”。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Upload...": "上传…",

  /* This is a generic string used one or more times in the app. */

  "_generic_string_Upload File": "上传文件…",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Go to My Devices": "前往我的设备",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Configurations options for 802.1X network authentication": "802.1X 网络鉴定的配置选项",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Network Security Settings": "网络安全设置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No applicable Certificate payload is configured": "未配置适用的证书有效负载",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_hostname": "主机名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No applicable Certificate or SCEP payload is configured": "未配置适用的证书或 SCEP 有效负载",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authorization Password": "授权密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Brief explanation of the content or purpose of the profile": "描述文件的内容或用途的简短解释",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow sending diagnostic and usage data to Apple": "允许向 Apple 发送诊断和使用数据",

  /*  */
  "_privacy_knob_set_num_lines": "1",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Guest User": "允许客人用户",

  "_generic_string_Screen Saver": "屏幕保护程序",
  "_generic_string_Idle time before screen saver starts": "屏幕保护程序启动前的闲置时间",

  "_screen_saver_Never": "永不",
  "_screen_saver_1 Minute": "1 分钟",
  "_screen_saver_2 Minutes": "2 分钟",
  "_screen_saver_5 Minutes": "5 分钟",
  "_screen_saver_10 Minutes": "10 分钟",
  "_screen_saver_20 Minutes": "20 分钟",
  "_screen_saver_30 Minutes": "30 分钟",
  "_screen_saver_1 Hour": "1 小时",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Start screen saver after:": "启动屏幕保护程序前闲置：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Combine available workgroup settings": "合并可用的工作组设置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Local-only users may log in": "仅本地用户可以登录",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable external accounts": "启用外部帐户",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Computer administrators may refresh or disable management": "电脑管理员可刷新或停用管理",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No file uploaded": "未上传文件",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_• Set EnableMCXLoginScripts to TRUE.": "• 将 EnableMCXLoginScripts 设为 TRUE。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show \"Other…\"": "显示“其他…”",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Set computer name to computer record name": "将电脑名称设为电脑记录名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_minutes of inactivity": "不活跃分钟数（最短 3 分钟）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Logout Script:": "退出脚本：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Style:": "样式：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable >console login": "启用 >控制台登录",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show computer's administrators": "显示电脑的管理员",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Login Screen Preferences": "登录屏幕偏好设置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The above settings require specific properties in the file ~root/Library/Preferences/com.apple.loginwindow.plist, located on the client computer:": "上述设置需要“~root/资源库/Preferences/com.apple.loginwindow.plist”文件（位于客户端电脑上）中的特定属性：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show password hint when needed and available": "需要且可用时显示密码提示",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ignore workgroup nesting": "忽略工作组嵌套",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Login Script:": "登录脚本：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name": "名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_IP Address": "IP 地址",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Settings for the behavior of the system while at the login screen": "位于登录屏幕时系统行为的设置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Local-only users use available workgroup settings": "仅本地用户能使用可用的工作组设置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Time": "时间",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show mobile accounts": "显示移动帐户",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Also execute the client computer's LoginHook script": "还执行客户端电脑的 LoginHook 脚本",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable Fast User Switching": "启用快速用户切换",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Message:": "邮件：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show network users": "显示网络用户",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_• Set MCXScriptTrust to match the binding settings used to connect the client computer to the directory domain.": "• 设定 MCXScriptTrust 以与用来将客户端电脑和目录域连接在一起的绑定设置相匹配。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Log out users after:": "在以下时间过后退出用户：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Directory Status": "目录状态",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use screen saver module at path:": "使用以下路径处的屏幕保护程序模块：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show the Sleep, Restart and Shut Down buttons": "显示“睡眠”、“重新启动”和“关机”按钮",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Always show workgroup dialog during login": "登录时总是显示工作组对话框",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show local users": "显示本地用户",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Heading:": "标题：",

  "_generic_string_Show additional information in the menu bar": "在菜单栏中显示其他信息",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name and password text fields": "名称和密码文本栏",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Disable automatic login": "停用自动登录",
  "_generic_string_Banner": "横幅",
  "_generic_string_Show the host name, OS X version and IP address when the menu bar is clicked.": "点按菜单栏时，显示主机名、OS X 版本和 IP 地址。",
  "_generic_string_Login Prompt": "登录提示",
  "_generic_string_A message displayed above the login prompt.": "登录提示上方会显示一条信息。",
  "_generic_string_The display style and related options of the login prompt.": "登录提示的显示样式和相关选项。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Version": "版本",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Also execute the client computer's LogoutHook script": "还执行客户端电脑的 LogoutHook 脚本",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_List of users able to use these computers": "可以登录这些电脑的用户的列表",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Create a placeholder record for a device.": "为设备创建占位符记录。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%@1 minutes": "%@1 分钟",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 hour ": "1 小时 ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%@1 hours": "%@1 小时 ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%@ hour and 30 minutes": "%@ 小时 30 分钟",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%@ hours": "%@ 小时",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 hour and 30 minutes": "1 小时 30 分钟",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_30 minutes": "30 分钟",

  /* This is the number of pixels the width of the "Log out users after:" string takes up in the UI. */
  "_log_out_users_after_text_width": "153",

  "_screen_saver_idle_time_popup_width": "100",

  /* This is the number of pixels the width of the "Start screen saver after:" string takes up in the UI. */
  "_start_screen_saver_after_text_width": "175",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%@ certificate": "“%@”证书",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SSL and code signing certificates": "SSL 和代码签名证书",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Code Signing": "代码签名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SSL": "SSL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_By default, iOS and OS X devices do not trust this server's %@.": "默认情况下，iOS 和 OS X 设备不信任此服务器的“%@”。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Download Trust Profile": "下载信任描述文件",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No Certificate payload is configured": "未配置证书有效负载",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The domain of the account": "帐户的域",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user of the account": "帐户的用户",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The domain of the account. Leave Domain and User blank to set user on device": "帐户的域。请将“域”和“用户”留空以在设备上设定用户",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user of the account. Leave Domain and User blank to set user on device": "帐户的用户。请将“域”和“用户”留空以在设备上设定用户",

  /*  */
  "_new_task_passcode_was_not_six_digit_number": "密码不是六位数字",

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
  "_generic_string_Download the Configuration Profile \"Trust Profile for %@\" and install it on your devices to configure them to trust this server's certificates": "下载配置描述文件“‘%@’的信任描述文件”并在设备上安装它，以配置设备信任此服务器的证书",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authenticate with credentials obtained from the target machine's record in the directory": "使用从目录中的目标机器的记录中获得的凭证进行签定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use Directory Authentication": "使用目录鉴定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authenticate with the target machine's directory credentials": "使用目标机器的目录凭证进行签定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_set by directory": "按目录设定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Trust Profile for %@": "“%@”的信任描述文件",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Download the Configuration Profile \"Trust Profile for %@\" and install it on your devices to configure them to trust this server's certificates.": "下载配置描述文件“‘%@’的信任描述文件”并在设备上安装它，以配置设备信任此服务器的证书。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Download and install the \"Trust Profile for %@\" configuration profile on iOS and OS X devices to configure them to trust this server's %@.": "将“‘%@’的信任描述文件”配置描述文件下载到 iOS 和 OS X 设备上并进行安装，以将这些设备配置为信任此服务器的“%@”。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SSL certificate": "SSL 证书",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_code signing certificate": "代码签名证书",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Icon": "图标",

  /* This is the width of the labels next to the buttons in iOS Restrictions > Media Control > for Movies, TV Shows, and Apps */
  "_layout_allowed_content_button_labels_width": "100",

  /* This is the combination of first/given name and last/family name. %@1 is first/given and %@2 is last/family. */
  "_user_first_name_last_name": "%@2 %@1",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Wake for Ethernet network administrator access": "以太网络管理员访问时唤醒",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Monday": "星期一",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sleep Options": "睡眠选项",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 min": "1 分钟",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_3 hr": "3 小时",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Put the computer to sleep after a period of inactivity": "让电脑在一段时间不活跃后睡眠",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Start up automatically after a power failure": "断电后自动启动",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Saturday": "星期六",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Friday": "星期五",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Put the hard disk(s) to sleep whenever possible": "如果可能，让硬盘睡眠",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Every Day": "每天",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sunday": "星期日",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sleep": "睡眠",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 hr": "1 小时",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Put the display(s) to sleep after:": "此时间段后让显示器睡眠：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Thursday": "星期四",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_15 min": "15 分钟",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Other Options": "其他选项",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Shut Down": "关机",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Wednesday": "星期三",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Settings for waking the computer from sleep": "将电脑从睡眠中唤醒的设置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow power button to sleep the computer": "允许用电源按钮让电脑睡眠",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Additional power settings for the computer": "电脑的附加电源设置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Put the computer to sleep after:": "此时间段后让电脑睡眠：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Tuesday": "星期二",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Start up the computer:": "启动电脑：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Wake Options": "唤醒选项",

  /* This is the width of the Hide Columns for the Login Items payload type. */
  "_layout_hide_column_width": "40",

  /* This is the width of the two radio buttons under Settings > Mobility > Rules > Options > Sync in the backgound */
  "_layout_mobility_rules_options_sync_in_background_width": "118",
  "_mobility_path_at_textField_offset_left": "140",


  /* This is a generic string used one or more times in the app. */
  "_generic_string_All Users": "所有用户",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Force FIPS verification": "强制 FIPS 验证",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_App Store": "App Store",
  "_generic_string_Allow iCloud documents & data": "允许 iCloud 文稿与数据",
  "_generic_string_Allow iCloud keychain": "允许 iCloud 钥匙串",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enterprise": "企业级",
  "_generic_string_Allow My Photo Stream (disallowing can cause data loss)": "允许“我的照片流”（若不允许可能会导致数据丢失）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Application Library": "应用程序资源库",
  "_generic_string_Force iTunes password entry for every purchase": "每次购买时强制输入 iTunes 密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add applications from the iTunes Store to your library": "将应用程序从 iTunes Store 添加到您的资源库",
  "_generic_string_Allow iCloud backup": "允许 iCloud 云备份",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add enterprise applications to your library": "将企业级应用程序添加到您的资源库",
  "_generic_string_Require iTunes password for all purchases": "所有购买均需要输入 iTunes 密码。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Application Search": "应用程序搜索",
  "_generic_string_Allow third-party mail clients": "允许第三方邮件客户端",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Find apps in the iTunes Store": "在 iTunes Store 中查找应用程序",
  "_generic_string_Configures proxy settings to be used with this network": "配置代理设置，以用于此网络",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Search iTunes": "搜索 iTunes",
  "_generic_string_Auto Join": "自动加入",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_iPad Apps": "iPad 应用程序",
  "_generic_string_required": "必需",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_iPhone Apps": "iPhone 应用程序",
  "_generic_string_Allow user to move messages from this account": "允许用户从这个帐户移动邮件",

  /* More */
  "_general_string_More...": "更多",
  /* This is a generic string used one or more times in the app. */
  "_generic_string_Automatically join this wireless network": "自动加入此无线网络",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Upload": "上传",
  "_generic_string_Messages can be moved out of this email account into another": "可以将信息从此帐户移出到其他帐户",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Select an application to add to the library": "选择一个应用程序添加到资源库",
  "_generic_string_Messages can be sent from this account using third-party mail clients": "可以使用第三方邮件客户端从此帐户发送邮件",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Select...": "选择…",
  "_generic_string_Hostname or IP address for server": "服务器的主机名或 IP 地址",

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
  "_layout_path_prefix_width": "70",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Upload selected file": "上传所选文件",
  "_generic_string_Device Groups": "设备群组",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Upload an application to add to the library": "上传一个应用程序来添加到资源库",
  "_generic_string_Devices": "设备",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Install Application": "安装应用程序",
  "_generic_string_Users": "用户",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User Groups": "用户群组",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add App": "添加应用程序",
  "_generic_string_Printers": "打印机",

  /* This is the width of the Configure button for an unconfigured setting type for a profile. */
  "_layout_no_settings_configure_button": "90",

  /* This is the width of the Add Certificate button, as used in Certificate Settings and Exchange Settings. */
  "_layout_knob_set_view_add_certificate": "120",

  /* This is the width of the Add Item and Delete Item buttons in Settings > Custom Settings */
  "_layout_add_item_and_delete_item_buttons_width": "80",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Edit App List": "编辑应用程序列表",
  "_generic_string_at": "于",

  /* This is the width of the label text for Login Script and Logout Script found under Settings > Login Window > Scripts. */
  "_layout_login_script_and_logout_script_label_width": "100",

  /* This is the width of the upload buttons found in Settings > Login Window > Scripts. */
  "_layout_scripts_upload_button_width": "80",

  /* Width of Settings > Passcode > Grace Period popup */
  "_layout_grace_period_field": "95",

  /* This is the width of the Enable All and Enable None buttons in Restrictions Settings under Preferences. */
  "_layout_enable_all_and_enable_none_buttons_width": "100",

  /* This is the width of the to fixed size string found in Settings > Mobility > Account Creation > Encrypt contents with FileVault. */
  "_layout_to_fixed_size_radio_width": "140",

  /* This is the width of the to percentage of network home quota string found in Settings > Mobility > Account Creation > Encrypt contents with FileVault. */
  "_layout_to_percentage_of_network_home_quote_radio_width": "218",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Edit Apps": "编辑应用程序",
  "_generic_string_Language & Text": "语言与文本",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Security & Privacy": "安全性与隐私",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Users & Groups": "用户与群组",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Mail, Contacts & Calendars": "邮件、通讯录、日历",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_General": "通用",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Mission Control": "Mission Control",

  /* The width of the Add All and Add Visible button that appears in the lower left corner of various picker sheets. */
  "_layout_add_all_and_add_visible_button_width": "100",

  /* The width of the Settings > Dock > Minimize using popup */
  "_layout_minimize_using_select_button_width": "140",

  /* If needed, this increases the width of most of the UI in settings. When increasing this, be careful it still fits on iPad. */
  "_layout_settings_overall_knob_width": "480",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow accepting untrusted TLS certificates": "允许用户接受不信任的 TLS 证书",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow automatic updates to certificate trust settings": "允许自动更新证书信任设置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Remaining Battery Life": "剩余电池寿命",
  "Supervised": "被监督",

  "_generic_string_Signed in to iTunes": "登录到 iTunes",

  "_generic_string_iCloud Backup": "iCloud 云备份",

  "_generic_string_Do Not Disturb": "勿扰模式",

  "_generic_string_Personal Hotspot": "个人热点",
  "_generic_string_On": "打开",
  "_generic_string_Off": "关闭",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Send outgoing mail from this account only from Mail app": "只在“邮件”应用程序中从此帐户发送邮件",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use Only in Mail": "只用于“邮件”",
  "_generic_string_Enable S/MIME": "启用 S/MIME",
  "_generic_string_Support S/MIME for this account": "支持这个帐户的 S/MIME",
  "_generic_string_Signing Certificate": "签名证书",
  "_generic_string_Certificate used to sign messages sent from this account": "用于给从这个帐户发送的邮件签名的证书",
  "_generic_string_Encryption Certificate": "加密证书",
  "_generic_string_Certificate used to decrypt messages sent to this account": "用于给发送到这个帐户的邮件解密的证书",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Supported": "支持",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Software Build Version": "软件版号",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Unknown": "未知",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Supports Managed Apps": "支持被管理的应用程序",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Not Supported": "不支持",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Requires Re-enrollment": "要求重新注册",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Requires iOS 5 or later": "要求 iOS 5 或更高版本",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Upgrade to iOS 5 and re-enroll this device to enable enterprise application distribution": "升级到 iOS 5，并重新注册此设备以分发企业级应用程序",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Re-enroll this device to enable enterprise application distribution": "重新注册此设备，以分发企业级应用程序",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Siri": "允许 Siri",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Siri while device locked": "设备锁定时允许使用 Siri",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable Siri profanity filter (Supervised devices only)": "启用 Siri 脏话过滤器（仅限被监督的设备）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No Limit": "无限制",

  /* This is the width of the Cancel Task button, found in the bottom toolbar when selecting an active task. */
  "_layout_cancel_task_button": "100",

  /* This is the width of the secondary information column for the task list item view */
  "_layout_task_list_item_view_secondary_information_width": "90",

  /* This is the width of the updated at timestamp column for the task list item view */
  "_layout_task_list_item_view_updated_at_width": "150",

  /* This is the width of the labels under Display Settings for Dock Settings. */
  "_layout_dock_knob_set_display_settings_label_widths": "110",

  /*  */
  "_no_item_view_no_somethings_widget": "无 widget",

  "_no_item_view_no_somethings_members": "无成员",

  /*  */
  "_no_item_view_is_truncation_indicator_tasks_complete": "使用搜索来查找已完成的任务",

  /*  */
  "_no_item_view_no_somethings_found_tasks_complete": "找不到已完成的任务",

  /*  */
  "_no_item_view_no_somethings_device": "无设备",

  "_no_item_view_no_airplay_destinations": "无 AirPlay 目的位置",

  "_no_item_view_no_somethings_apps": "没有应用程序",
  "_no_item_view_no_somethings_inhouse_enterprise_apps": "没有内部企业级应用程序",
  "_no_item_view_no_somethings_books": "没有图书",
  "_no_item_view_no_somethings_activity": "无活动",
  /*  */
  "_no_item_view_no_somethings_found_device_group": "找不到设备群组",
  "_no_item_view_no_somethings_found_location": "未找到位置",
  "_no_item_view_no_somethings_found_members": "找不到成员",
  /*  */
  "_no_item_view_no_somethings_system_application": "没有应用程序",

  /*  */
  "_item_list_loading_user_group": "正在载入群组…",
  "_item_list_loading_vpp_user_group": "正在载入 VPP 启用的群组…",

  /*  */
  "_no_item_view_no_somethings_found_device": "找不到设备",

  /*  */
  "_item_list_loading_widget": "正在载入 Widget…",

  /*  */
  "_item_list_loading_printer": "正在载入打印机…",

  "_item_list_loading_activity": "正在载入活动…",
  "_item_list_loading_members": "正在载入成员…",
  "_item_list_loading_Apps": "正在载入应用程序…",
  "_item_list_loading_books": "正在载入图书…",

  /*  */
  "_item_list_loading_device_group": "正在载入设备群组…",
  "_item_list_loading_location": "正在载入位置…",

  /*  */
  "_no_item_view_no_somethings_found_tasks_active": "找不到活跃的任务",

  /*  */
  "_no_item_view_no_somethings_printer": "无打印机",

  /*  */
  "_no_item_view_is_truncation_indicator_widget": "使用搜索来查找 Widget",

  "_no_item_view_is_truncation_indicator_members": "使用搜索来查找成员",
  /*  */
  "_no_item_view_is_truncation_indicator_printer": "使用搜索来查找打印机",

  /*  */
  "_no_item_view_is_truncation_indicator_user_group": "使用搜索来查找群组",
  "_no_item_view_is_truncation_indicator_vpp_user_group": "使用搜索来查找 VPP 启用的群组",

  /*  */
  "_no_item_view_no_somethings_found_system_application": "找不到应用程序",
  "_no_item_view_no_somethings_found_books": "找不到图书",

  "_no_item_view_no_somethings_found_apps": "找不到应用程序",
  "_no_item_view_no_somethings_found_activity": "找不到活动",

  /*  */
  "_no_item_view_no_somethings_user": "无用户",

  /*  */
  "_no_item_view_is_truncation_indicator_tasks_active": "使用搜索来查找活跃的任务",

  /*  */
  "_no_item_view_is_truncation_indicator_device": "使用搜索来查找设备",

  /*  */
  "_item_list_loading_system_application": "正在载入应用程序…",

  /*  */
  "_no_item_view_is_truncation_indicator_user": "使用搜索来查找用户",

  /*  */
  "_no_item_view_no_somethings_found_user": "找不到用户",

  /*  */
  "_no_item_view_is_truncation_indicator_system_application": "使用搜索来查找应用程序",

  "_no_item_view_is_truncation_indicator_apps": "使用搜索来查找应用程序",

  "_no_item_view_is_truncation_indicator_books": "使用搜索来查找图书",

  "_no_item_view_is_truncation_indicator_activity": "使用搜索来查找活动",

  /*  */
  "_no_item_view_no_somethings_tasks_complete": "找不到已完成的任务",

  /*  */
  "_no_item_view_no_somethings_found_user_group": "找不到群组",
  "_no_item_view_no_somethings_found_vpp_user_group": "找不到 VPP 启用的群组",

  /*  */
  "_no_item_view_no_somethings_found_printer": "未找到打印机",

  /*  */
  "_item_list_loading_device": "正在载入设备…",

  /*  */
  "_no_item_view_no_somethings_user_group": "无群组",
  "_no_item_view_no_somethings_vpp_user_group": "没有 VPP 启用的群组",

  /*  */
  "_no_item_view_no_somethings_found_widget": "找不到 Widget",

  /*  */
  "_item_list_loading_tasks_active": "正在载入活跃的任务…",

  /*  */
  "_no_item_view_is_truncation_indicator_device_group": "使用搜索来查找设备群组",
  "_no_item_view_is_truncation_indicator_location": "使用搜索来查找位置",

  /*  */
  "_item_list_loading_user": "正在载入用户…",

  /*  */
  "_no_item_view_no_somethings_tasks_active": "无活跃的任务",

  /*  */
  "_item_list_loading_tasks_complete": "正在载入已完成的任务…",

  /*  */
  "_no_item_view_no_somethings_device_group": "无设备群组",
  "_no_item_view_no_somethings_location": "无位置",

  /*  */
  "_uploading_filename": "正在上传“%@1”…",

  /* This is the width of the Upload button inside the iOS App picker. */
  "_layout_apps_picker_upload_button_width": "100",

  /* This is the width of the menu that appears when you click the Perform Task Button in the bottom toolbar for Library Items. */
  "_layout_toolbar_perform_task_button_menu_width": "175",
  "_layout_toolbar_perform_task_button_menu_width_for_placeholder": "170",
  /* Width of the new task sheet*/
  "_layout_new_task_sheet_width": "350",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_user chooses any volume": "用户选取任何宗卷",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_user chooses any external volume": "用户选取外接宗卷",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_user chooses any internal volume": "用户选取内置宗卷",

  /* This is the width of the menu itmes for the iOS Restrictions' Media Content Allowed content ratings popup menus */
  "_layout_allowed_content_popup_menu_items_width": "195",

  /*  */
  "_cfprefs_knob_set_num_lines": "2",

  /*  */
  "_identification_knob_set_name": "身份",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Spotlight": "Spotlight",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_iCloud": "iCloud",

  /*  */
  "_identification_knob_set_num_lines": "1",

  /*  */
  "_identification_knob_set_description": "",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user enters the password upon profile installation": "用户在安装描述文件时输入密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user display name for the accounts": "帐户的用户显示名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt text for any of the above values": "上述任何值的提示文本",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt Message": "提示信息",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user name for the accounts": "帐户的用户名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User Enters Password": "用户输入密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The email address for the accounts": "帐户的电子邮件地址",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt": "提示",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password for the accounts": "帐户的密码",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Additional descriptive text for the Prompt field": "“提示”栏的附加描述文本",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Set in Identification": "在身份中设定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Anywhere": "任意位置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Do not allow user to override Gatekeeper setting": "不允许用户覆盖 Gatekeeper 设置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allowed Applications": "允许的应用程序",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Mac App Store": "Mac App Store",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate Server": "证书服务器",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The name of the CA": "CA 的名称",

  /*  */
  "_gatekeeper_knob_set_num_lines": "1",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prevents the user from temporarily overriding the Gatekeeper setting by control-clicking to install any app": "通过按住 control 键点按任何应用程序来安装以阻止用户临时覆盖 Gatekeeper 设置",
  "_generic_string_Allow user to change password": "允许用户更改密码",
  "_generic_string_Require password after sleep or screen saver begins": "需要密码才能从睡眠状态或屏幕保护程序唤醒",
  "_generic_string_Allow user to set lock message": "允许用户设定锁定信息",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Mac App Store and identified developers": "Mac App Store 和被认可的开发者",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The username with which to authenticate to the certificate server": "用来向证书服务器进行鉴定的用户名称",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt for credentials": "提示输入凭证",

  /*  */
  "_gatekeeper_knob_set_description": "",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt the user for credentials.  This setting is not supported for pushed profiles": "提示用户输入凭证。推送的描述文件不支持此设置",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Gatekeeper": "Gatekeeper",
  "_generic_string_General (OS X Only)": "通用（仅限 OS X）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password with which to authenticate to the certificate server": "用来向证书服务器进行鉴定的密码",

  /*  */
  "_gatekeeper_knob_set_name": "",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The description of the certificate request as shown in the certificate selector of other payloads such as VPN and Network": "其他有效负载（如“VPN”和“网络”）的证书选择器中所示的证书请求的描述",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow applications downloaded from:": "允许从以下位置下载应用程序：",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Users cannot open an unsigned application ...": "用户不能打开未签名的应用程序…",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate Authority": "证书颁发机构",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate Template": "证书模板",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The name of the certificate template, usually Machine or User": "证书模板的名称，通常为“机器”或“用户”",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The network address of the certificate server": "证书服务器的网络地址",

  /* This layout gives the height of the Disable ability to open disallowed applications using the Finder checkbox */
  "_layout_privacy_force_disallow_app_checkbox_height": "20",

  /* This layout gives the height of the Disable ability to open disallowed applications using the Finder checkbox description*/
  "_layout_privacy_force_disallow_app_description_height": "40",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My Messages Account": "我的信息帐户",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow iBooks Store (Supervised devices only)": "允许 iBooks Store（仅限被监督的设备）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow explicit sexual content in iBooks Store": "允许 iBooks Store 中暴露的性内容",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow iCloud photo sharing": "允许 iCloud 照片共享",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Shared PhotoStream Send Invitation": "允许发送共享的照片流邀请",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Shared PhotoStream Receive Invitation": "允许接收共享的照片流邀请",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Passbook while device locked": "屏幕锁定时允许 Passbook 通知",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow installing configuration profiles (Supervised devices only)": "允许安装配置描述文件（仅限被监督的设备）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow use of Messages": "允许 iMessage（仅限被监督的设备）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Consent": "同意",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Consent Text Description": "同意文本描述",

  /* This is a generic string used one or more times in the app. */
  "_general_string_Lock To App": "锁定到应用程序",

  /* This is a generic string used one or more times in the app. */
  "_general_string_Limit an iOS device to one app": "限制 iOS 设备仅使用一个应用程序（仅限被监督的设备）",

  /* System Application Names */
  "_general_string_app_name_Safari": "Safari",
  "_general_string_app_name_Videos": "视频",
  "_general_string_app_name_Calendar": "日历",
  "_general_string_app_name_Music": "音乐",
  "_general_string_app_name_Contacts": "通讯录",
  "_general_string_app_name_Messages": "信息",
  "_general_string_app_name_Maps": "地图",
  "_general_string_app_name_Reminders": "提醒事项",
  "_general_string_app_name_Photos": "照片",
  "_general_string_app_name_Mail": "邮件",
  "_general_string_app_name_Notes": "备忘录",

  "_generic_string_Touch": "触摸",
  "_generic_string_Device Rotation": "运动",
  "_generic_string_Volume Buttons": "音量按钮",
  "_generic_string_Ringer Switch": "侧边开关",
  "_generic_string_Sleep/Wake Button": "睡眠/唤醒按钮",
  "_generic_string_Auto-Lock": "自动锁定",
  "_generic_string_VoiceOver": "VoiceOver",
  "_generic_string_Zoom": "缩放",
  "_generic_string_Invert Colors": "反转颜色",
  "_generic_string_AssistiveTouch": "AssistiveTouch",
  "_generic_string_Speak Selection": "朗读所选内容",
  "_generic_string_Mono Audio": "单声道音频",

  "_generic_string_Settings enforced when in Single App Mode": "单应用程序模式中实施的设置",
  "_generic_string_Allow the user to change these settings when in Single App Mode": "允许用户在“单应用程序模式”中更改这些设置",
  "_general_string_The app to run in Single App Mode (Supervised devices only)": "要在“单应用程序模式”中运行的应用程序（仅限被监督的设备）",
  /* This is a generic string used one or more times in the app. */
  "_general_string_Settings for automatic profile removal": "用于自动描述文件移除的设置",

  /* This is a generic string used one or more times in the app. */
  "_general_string_On date": "于日期",

  /* This is a generic string used one or more times in the app. */
  "_general_string_After interval": "间隔时间后",

  /* used in mail and exchange knob sets */
  "_generic_string_Allow recent addresses to be synced": "允许同步最新的地址",
  "_generic_string_Include this account in recent address syncing": "同步最近使用的地址时包括此帐户",

  /* Date display format for each locale */
  "_generic_date_format": "%Y-%m-%d",


  /* This is a generic string used one or more times in the app. */
  "_generic_string_Delete Application Confirmation": "要删除应用程序吗？",
  "_generic_string_Delete Apps Confirmation": "要删除应用程序吗？",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_This application will be removed from all devices.": "应用程序将从所有设备中移除。",
  "_generic_string_The apps will be removed from all devices.": "应用程序将从所有设备中移除。",

  /* Time machine strings */
  "_global_time_machine_knob_set_name": "Time Machine",
  "_global_time_machine_knob_set_description": "使用此部分来配置 Time Machine 的设置。",
  "_generic_string_Backup destination URL": "备份服务器",
  "_generic_string_The URL to backup destination (e.g., afp://server.example.com/)": "备份目标位置的 URL（例如：afp://server.example.com/backups/）",
  "_generic_string_Backup all volumes": "备份所有宗卷",
  "_generic_string_Only startup volume is backed up by default": "默认仅备份启动宗卷",
  "_generic_string_Backup system files and folders": "备份系统文件和文件夹",
  "_generic_string_System files and folders are skipped by default": "默认跳过系统文件和文件夹",
  "_generic_string_Automatic backups": "启用自动备份",
  "_generic_string_Enable automatic backups": "定期自动备份",
  "_generic_string_Mobile backups": "启用本地快照（仅 10.8 及以上）",
  "_generic_string_Enable local snapshots (10.8 and above only)": "未连接到互联网时，创建本地备份快照",
  "_generic_string_BackupSize Limit": "备份大小限制",
  "_generic_string_BackupSize limit in MB. Set to 0 for unlimited": "备份大小限制 (MB)。设定为 0 可取消限制",
  "_generic_string_Paths to backup:": "要备份的路径：",
  "_generic_string_The startup volume is always backed up": "始终备份启动宗卷",
  "_generic_string_Paths to skip:": "要跳过的路径：",
  "_generic_string_The paths to skip from startup volume": "从启动宗卷跳过的路径",

  /* Dictation restriction */
  "_generic_string_Disable use of Dictation": "停用听写",

  /* Security and Privacy */
  "_generic_string_FileVault (OS X Only)": "FileVault（仅限 OS X）",
  "_generic_string_Privacy": "隐私",
  "_generic_string_Require FileVault": "需要 FileVault",
  "_generic_string_If not already enabled, FileVault will be enabled at the next logout": "如果 FileVault 尚未启用，则会在下次退出时启用",
  "_generic_string_Defer FileVault setup": "推迟 FileVault 设置",
  "_generic_string_Defers FileVault setup until the current user logs out": "推迟 FileVault 设置直到当前用户退出",
  "_generic_string_Create recovery key": "创建个人恢复密钥",
  "_generic_string_Create a personal FileVault recovery key": "创建个人 FileVault 恢复密钥",
  "_generic_string_Recovery key location": "个人恢复密钥的位置",
  "_generic_string_Location to store the recovery key": "储存个人恢复密钥的位置",
  "_generic_string_Create institutional recovery user": "使用机构恢复密钥",
  "_generic_string_Create a personal FileVault recovery key and use an institutional recovery key": "使用机构恢复密钥并创建个人 FileVault 恢复密钥",
  "_generic_string_Creates a institutional recovery user using the FileVault Master keychain": "启用使用机构钥匙串访问加密光盘",
  "_generic_string_FileVault username": "已指定的 FileVault 用户名称",
  "_generic_string_FileVault enabled user, current logged in user is used by default": "启用了 FileVault 的用户，默认使用当前登录的用户",
  "_generic_string_FileVault user password": "已指定的 FileVault 用户密码",
  "_generic_string_Password for the FileVault enabled user": "启用了 FileVault 的用户的密码",
  "_generic_string_Certificate that contains the public key from institutional recovery keychain": "证书包含从机构恢复钥匙串获取的公用密钥",
  "_generic_string_Require user to unlock FileVault after hibernation": "要求用户在休眠后解锁 FileVault",
  "_generic_string_The user will be required to unlock FileVault when the computer awakes from hibernation": "当电脑从休眠中唤醒时，将要求用户解锁 FileVault",
  "_generic_string_Allow user to disable FileVault": "允许用户停用 FileVault",

  /* Checkpoint VPN */
  "_generic_string_Check Point Mobile VPN": "Check Point Mobile VPN",

  /* Single App Mode */
  "_generic_string_Single App Mode": "单应用程序模式",

  /* Finder Knob set */
  "_global_finder_knob_set_name": "Finder",
  "_global_finder_knob_set_description": "使用此部分来配置 Finder 的设置。",
  "_generic_string_Commands": "命令",
  "_generic_string_Select commands available to users": "选择可供用户使用的命令",
  "_generic_string_Opens a dialog box for finding servers on the network": "打开对话框来查找互联网上的服务器",
  "_generic_string_Connect to Server": "连接服务器",
  "_generic_string_Eject": "推出",
  "_generic_string_Ejects removable media and mountable volumes": "推出所有可移动的介质和可装载的宗卷",
  "_generic_string_Burn Disc": "刻录光盘",
  "_generic_string_Writes permanent information to a CD or DVD": "将永久信息写入到 CD 或 DVD",
  "_generic_string_Go to Folder": "前往文件夹",
  "_generic_string_Allows user to open files or folders by typing a pathname": "允许用户通过键入路径名称来打开文件或文件夹",
  "_generic_string_Restart": "重新启动",
  "_generic_string_Makes the restart command appear in the Apple menu": "使重新启动命令出现在苹果菜单中",
  "_generic_string_Makes the shut down command appear in the Apple menu": "使关机命令出现在苹果菜单中",
  "_generic_string_Show these items on the desktop": "在桌面上显示这些项目",
  "_generic_string_Hard disks": "硬盘",
  "_generic_string_External disks": "外置磁盘",
  "_generic_string_CDs, DVDs and iPods": "CD、DVD 和 iPod",
  "_generic_string_Connected servers": "已连接的服务器",
  "_generic_string_Use regular Finder": "使用常规 Finder",
  "_generic_string_Use simple Finder": "使用简单 Finder",
  "_generic_string_Show warning before emptying the Trash": "清倒废纸篓之前显示警告",

  /* Security Info FileVault Reporting */
  "_generic_string_Yes": "是",
  "_generic_string_No": "否",
  "_generic_string_FileVault Enabled": "FileVault 已启用",
  "_generic_string_FileVault has personal key": "个人恢复密钥",
  "_generic_string_FileVault has institutional key": "机构恢复密钥",
  "_filevault_status_Recovery Key Set": "设定",
  "_filevault_status_Recovery Key Not Set": "未设定",
  "_generic_string_Activation Lock Enabled": "激活锁已启用",
  "_generic_string_Activation Lock Bypass Code": "激活锁忽略码",
  "_no_activation_lock_bypass_code": "无",

  /* Sharing Services */
  "_restrictions_tab_header_Sharing": "共享",
  "_generic_string_Select services that should be available in the share menu": "选择应该在共享菜单中可用的服务",
  "_generic_string_AirDrop": "AirDrop",
  "_generic_string_Facebook": "Facebook",
  "_generic_string_Twitter": "Twitter",
  "_general_string_chinese_blog_name_SinaWeibo": "新浪微博",
  "_generic_string_Enable New Share Services": "自动启用新的共享服务",
  "_general_string_Video Services - Flickr, Vimeo, Tudou and Youku": "视频服务 - Flickr、Vimeo、土豆和优酷",
  "_generic_string_New share services will be enabled in the share menu automatically": "将在共享菜单中自动启用新的共享服务",
  "_general_string_Add to iPhoto": "添加到 iPhoto",
  "_general_string_Add to Aperture": "添加到 Aperture",
  "_general_string_Add to Reading List": "添加到阅读列表",

  "_restrictions_tab_header_Desktop": "桌面",
  "_generic_string_Lock Desktop Picture": "锁定桌面图片",
  "_lock_desktop_picture_description": "阻止用户修改桌面图片选择",
  "_generic_string_Picture Path": "桌面图片路径",
  "_lock_desktop_picture_path_description": "用作桌面图片的文件的路径。路径留空将使用设备上的当前选择",
  "_mac_restrictions_segment_view_width": "490",

  /* Universal Access */
  "_global_universal_access_knob_set_name": "辅助功能",
  "_global_universal_access_knob_set_description": "使用此部分来配置“辅助功能”设置。",
  "_generic_string_Seeing": "视觉",
  "_generic_string_Hearing": "听觉",
  "_accessibility_seeing_tab_width": "480",
  "_accessibility_interactivity_tab_width": "480",
  "_accessibility_interactivity_tab_label_width": "180",
  "_generic_string_Interacting": "互动",
  "_generic_string_Enable Zoom via ScrollWheel:": "启用通过滚轮缩放：",
  "_generic_string_Zoom Options": "缩放选项",
  "_generic_string_Enable Zoom via Keyboard:": "启用通过键盘缩放：",
  "_generic_string_Minimum Zoom:": "缩放最小值：",
  "_generic_string_Maximum Zoom:": "缩放最大值：",
  "_generic_string_Show preview rectangle when zoomed out:": "缩小时显示预览矩形：",
  "_generic_string_Smooth images:": "平滑图像：",
  "_generic_string_Display Options": "显示选项",
  "_generic_string_Invert colors:": "反转颜色：",
  "_generic_string_Use grayscale:": "使用灰度：",
  "_generic_string_Enhance Contrast:": "增强对比度：",
  "_generic_string_Cursor size:": "光标大小：",
  "_generic_string_VoiceOver Options": "VoiceOver 选项",
  "_generic_string_Enable VoiceOver:": "启用 VoiceOver：",
  "_generic_string_Flash the screen when an alert occurs": "出现警告时闪烁屏幕",
  "_generic_string_Play stereo audio as mono": "将立体声音频作为单声道音频播放",
  "_generic_string_Enable Sticky Keys": "启用粘滞键",
  "_generic_string_Display pressed keys on screen": "在屏幕上显示按下的键",
  "_generic_string_Beep when a modifier key is set": "在设定修饰键时发出蜂鸣声",
  "_generic_string_Acceptance delay": "接受延迟：",
  "_generic_string_Use click key sounds": "使用按键音：",
  "_generic_string_Enable Slow Keys": "启用慢速键",
  "_generic_string_Enable Mouse Keys": "启用鼠标键",
  "_generic_string_Initial delay:": "初始延迟：",
  "_generic_string_Maximum speed": "最大速度：",
  "_generic_string_Ignore built-in trackpad:": "忽略内建触控板：",
  "_generic_string_short": "短",
  "_generic_string_Long": "长",
  "_generic_string_fast": "快",
  "_generic_string_slow": "慢",
  "_generic_string_time_milliseconds": "毫秒",

  /* Game Center Stuff */
  "_generic_string_Allow GameCenter": "允许使用 Game Center（仅限被监督的设备）",
  "_generic_string_Allow Game Center": "允许使用 Game Center",
  "_generic_string_Allow Game Center account modification": "允许修改 Game Center 帐户",
  "_generic_string_Allow adding Game Center friends": "允许添加 Game Center 朋友",
  "_generic_string_Allow App Store app adoption": "允许 App Store 应用程序采用",
  "_generic_string_Allow Multiplayer Gaming": "允许多人游戏",
  "_generic_string_Allow multiplayer gaming": "允许多人游戏",

  /* Content Library Sidebar Item */
  "_content_sidebar_item_display_name": "内容",
  "_generic_string_Get More Apps": "获得更多应用程序",
  "_vpp_get_more_apps_button_width": "137",
  "_generic_string_Get More Books": "获取更多图书",
  "_vpp_get_more_books_button_width": "113",
  "_vpp_portal_url": "https://vpp.itunes.apple.com/?l=cn",

  /* Application Filter Strings*/
  "_application_filter_type_string_All Kinds": "所有类型",
  "_application_filter_type_string_iPad": "iPad",
  "_application_filter_type_string_iPhone+iPad": "iPhone+iPad",
  "_application_filter_type_string_iPod+iPhone+iPad": "iPod+iPhone+iPad",
  "_application_filter_type_string_iPhone": "iPhone",
  "_application_filter_type_string_iPod+iPhone": "iPod+iPhone",
  "_application_filter_type_string_Mac": "Mac",
  "_application_filter_type_string_OSX": "OS X",
  "_application_filter_type_string_iOS": "iOS",
  "_application_filter_license_type_Enterprise": "企业级",
  "_application_filter_license_type_App Store": "App Store",
  "_application_filter_category_All Categories": "所有类别",
  "_search_hint_Search Apps": "搜索应用程序",
  "_search_hint_Search Books": "搜索图书",

  /* Unified Applications Table View */
  "_table_header_Name": "名称",
  "_table_header_Category": "类别",
  "_table_header_Size": "大小",
  "_table_header_Purchased": "已购买",
  "_table_header_Assigned": "已分配",
  "_table_header_UnFulfilled": "尚未完成",
  "_table_header_Members": "成员",
  "_table_header_Available": "可用",
  "_table_header_Kind": "类型",
  "_table_header_Assigned To": "分配给",
  "_table_header_Device Name": "设备名称",
  "_table_header_Password": "密码",
  "_table_header_Include Password": "包括密码",

  "_table_header_Settings": "设置",
  "_table_header_App": "应用程序",
  "_table_header_User": "用户",
  "_table_header_Target": "目标",
  "_table_header_Status": "状态",
  "_table_header_Last Updated": "上次更新",

  "_generic_string_size_KB": "%@1 KB",
  "_generic_string_size_MB": "%@1 MB",
  "_generic_string_size_GB": "%@1 GB",
  "_generic_string_app_count_and_size_fmt_KB": "%@1 个应用程序，%@2 KB",
  "_generic_string_app_count_and_size_fmt_MB": "%@1 个应用程序，%@2 MB",
  "_generic_string_app_count_and_size_fmt_GB": "%@1 个应用程序，%@2 GB",
  "_application_filter_type_string_iPhone,iPad,iPod": "iPod、iPhone、iPad",
  "_application_filter_type_string_iPhone,iPad": "iPhone、iPad",
  "_application_filter_type_string_iPhone,iPod": "iPod、iPhone",
  "_application_type_OSX": "OS X",
  "_application_type_iOS": "iOS",

  /* Genesis Views */
  "_generic_string_Add Enterprise App": "添加企业级应用程序",
  "_generic_string_Volume Purchase": "批量购买计划",
  "_generic_string_Choose apps from your library": "从资源库中选取应用程序",
  "_generic_string_Choose in-house enterprise apps from your library": "从资源库选取内部企业级应用程序",
  "_generic_string_Choose books from your library": "从资源库中选取图书",
  "_assign_unified_apps_description": "您可以分配通过“批量购买计划”购买的应用程序或者添加到“描述文件管理器”的内部企业级应用程序。",
  "_assign_inhouse_enterprise_apps_description": "您可以分配添加到“描述文件管理器”的内部企业级应用程序",
  "_assign_books_description": "您可以分配使用“批量购买计划”购买的图书。",
  "_generic_string_Purchased": "已购买",
  "_generic_string_Available_Licenses": "可用",
  "_generic_string_Assignment": "分配",
  "_generic_string_Groups": "群组",
  "_generic_string_profile_manager_apps_feature_description": "描述文件管理器能够方便地将通过“批量购买计划”购买的应用程序分配和分发给用户和群组。您还可以将通过“iOS 开发者企业级计划”开发的应用程序分发给已注册设备。",
  "_generic_string_profile_manager_apps_feature_description_no_device_management": "描述文件管理器能够方便地将通过“批量购买计划”购买的应用程序分配和分发给用户和群组。",
  "_generic_string_profile_manager_books_feature_description": "描述文件管理器能够方便地将通过“批量购买计划”购买的图书分配给用户和群组。",
  "_generic_string_profile_manager_device_genesis_description": "描述文件管理器能够方便地管理 Apple 设备。您可以自定不同的设置并将它们应用到每个已注册设备。",
  "_generic_string_profile_manager_device_group_genesis_description": "描述文件管理器能够方便地将 Apple 设备整理到群组。您可以自定不同的设置并将它们应用到群组中的每个已注册设备。",
  "_button_label_Add Device Group": "添加设备群组",
  "_button_label_Enroll Device": "注册设备",
  "_button_text_Learn More": "了解有关注册设备的信息",
  "_button_width_learn_more": "185",
  "_genesis_view_width": "800",

  /* Books Library */
  "_generic_string_Books": "图书",
  "_generic_string_book_count": "%@1 本图书",
  "_generic_string_book_count_and_size_fmt_KB": "%@1 本图书，%@2 KB",
  "_generic_string_book_count_and_size_fmt_MB": "%@1 本图书，%@2 MB",
  "_generic_string_book_count_and_size_fmt_GB": "%@1 本图书，%@2 GB",

  /* VPP Content detail page */
  "_generic_string_This app is designed for both iPhone and iPad": "此应用程序专为 iPhone 和 iPad 而设计",
  "_generic_string_View in App Store": "显示于 App Store",
  "_generic_string_Developer Website": "开发人员网站",
  "_generic_string_VPP Website": "VPP 网站",
  "_generic_string_Category: %@": "类别：%@",
  "_generic_string_Updated: %@": "更新于：%@",
  "_generic_string_Version: %@": "版本：%@",
  "_generic_string_Size: %@": "大小：%@",
  "_generic_string_Choose Groups": "选取群组",
  "_generic_string_choose_vpp_enabled_groups": "选取 VPP 启用的群组",
  "_assign_user_groups_to_app_description": "选取应当将应用程序分配到的 VPP 启用的群组。应用程序会根据用户接收 VPP 管理的分发注册的时间顺序来进行分配。",
  "_generic_string_Choose users": "选取用户",
  "_assign_users_to_app_description": "选取要将应用程序分配给的用户。",
  "_view_more_info_...More": "…更多",
  "_view_more_info_...Less": "…更少",
  "_search_hint_Search Groups": "搜索群组",
  "_search_hint_search_vpp_enabled_groups": "搜索 VPP 启用的群组",
  "_search_hint_Search Users": "搜索用户",
  "_generic_string_Go back": "后退",
  "_generic_string_Loading Application Information...": "正在载入应用程序信息…",
  "_layout_vpp_content_left_detail_view_width": "160",

  "_generic_string_VPP Managed Distribution": "VPP 管理的分发",

  // height of the vpp section in user group's about tab. This should account for longer status strings in different locales.
  "_user_group_about_vpp_section_height": '450',
  "_generic_string_Enrolled": "已注册",
  "_generic_string_Not Enrolled": "未注册",
  "_generic_string_Send Email Invitation...": "发送电子邮件邀请…",
  "_generic_string_Send Email Invitation": "发送电子邮件邀请",
  "_vpp_invitation_string_invitation_not_sent": "尚未发送邀请给此用户。",
  "_invitation_status_An invitation has not been sent via Email": "尚未通过电子邮件发送邀请",
  "_vpp_invitation_status_An invitation has not been sent to <device name>": "尚未发送邀请给“%@”",
  "_generic_string_Send Invitation to <Device Name>": "向“%@”发送邀请",
  "_generic_string_Resend Invitation...": "重新发送邀请…",
  "_generic_string_Resend Invitation": "重新发送邀请",
  "_generic_string_This user un-enrolled from the program on <status_update_date>.": "此用户于 %@ 退出了该计划。",
  "_generic_string_This user was removed from the program on <vpp_status_updated_at>.": "已于 %@ 将此用户从计划中移除。",
  "_generic_string_No apps or books are assigned to this user.": "未给此用户分配应用程序或图书。",
  "_generic_string_Remove From Program": "从计划中移除",
  "_vpp_enrollment_status_This user was enrolled to receive content on <vpp_status_updated_at>.": "此用户已于 %@ 注册以接收内容。",
  "_generic_string_An invitation was sent to <email_address> on <last_invited_date>": "已于 %@2 发送邀请到 %@1",
  "_generic_string_An invitation was requested to be sent to <email_address> on <last_invited_date>": "已于 %@2 请求发送邀请到 %@1",
  "_generic_string_Enter email address": "输入电子邮件地址",

  "_layout_vpp_invite_pane_width": "350",
  "_layout_vpp_invite_pane_cancel_button_offset_right": "180",

  // VPP Group Enrollments
  "_enable_vpp_service_for_user_group": "启用 VPP 已管理的分发服务",
  "_processing_vpp_service_on_user_group_description": "正在处理 VPP 信息…",
  "_generic_string_Disable VPP Managed Distribution Services": "停用 VPP 管理的分发服务",
  "_generic_string_All VPP assignments to this group will be removed. Current book assignments to enrolled users will be unaffected.": "此群组所有的 VPP 分配都将被移除。已注册用户的当前图书分配将不会受到影响。",
  "_layout_disable_vpp_alert_pane_width": "550",
  "_vpp_group_enrollment_status_No Users Enrolled": "未注册任何用户",
  "_vpp_group_enrollment_status_No Users": "无用户",
  "_vpp_group_enrollment_status_All Users Enrolled": "所有用户均已注册",
  "_vpp_group_enrollment_status_X of Y Users Enrolled": "%@ 位用户已注册（共 %@ 位）",
  "_user_group_enrollment_info_These users were enrolled to receive content on <time>": "这些用户已于 %@ 注册以接收内容",
  "_user_group_enrollment_info_These users were enrolled to receive content between <start_time> and <end_time>": "这些用户已于 %@ 到 %@ 期间注册以接收内容",
  "_group_users_type_Users not previously invited": "之前未被邀请的用户",
  "_group_users_type_Users not enrolled": "未注册的用户",
  "_vpp_group_invitation_string_Invite:": "邀请：",
  "_user_group_vpp_no_email_invitations_sent": "尚未向任何用户发送电子邮件邀请",
  "_user_group_vpp_no_device_invitations_sent": "尚未向任何用户的设备发送邀请",
  "_vpp_group_invitation_invite_label_width": "42",
  "_user_group_vpp_action_Send VPP Invitation to Devices": "向用户的设备发送邀请",

  "_user_group_email_invitation_status_Email Invitations were sent to X of Y users on <time>": "电子邮件邀请已于 %@3 发送到 %@1 位尚未注册的用户（共 %@2 位用户）",
  "_user_group_email_invitation_status_Email Invitations were sent to X of Y users between <start_time> and <end_time>": "电子邮件邀请已于 %@3 到 %@4 期间发送到 %@1 位尚未注册的用户（共 %@2 位用户）",
  "_user_group_device_invitation_status_Device Invitations were sent to X of Y users on <time>": "邀请已于 %@3 发送到 %@1 位尚未注册的用户（共 %@2 位用户）的设备",
  "_user_group_device_invitation_status_Device Invitations were sent to X of Y users between <start_time> and <end_time>": "邀请已于 %@3 到 %@4 期间发送到 %@1 位尚未注册的用户（共 %@2 位用户）的设备",

  "_layout_user_group_vpp_enrollment_in_progress_status_height": "45",
  "_layout_user_group_vpp_email_invitation_in_progress_status_height": "45",
  "_layout_user_group_vpp_device_invitation_in_progress_status_height": "45",

  // User group vpp invitation confirmation dialogues
  "_user_group_vpp_device_invite_alert_Send Invitation": "发送邀请",
  "_user_group_vpp_email_alert_uninvited": "要向以前未邀请的 %@ 位用户发送电子邮件邀请吗？",
  "_user_group_vpp_email_alert_uninvited_single_user": "要向以前未邀请的 1 位用户发送电子邮件邀请吗？",
  "_user_group_vpp_email_alert_unenrolled": "要向当前尚未注册的 %@ 位用户发送电子邮件邀请吗？",
  "_user_group_vpp_email_alert_unenrolled_single_user": "要向当前尚未注册的 1 位用户发送电子邮件邀请吗？",
  "_user_group_vpp_device_alert_uninvited": "要向以前未邀请的 %@ 位用户的设备发送邀请吗？",
  "_user_group_vpp_device_alert_uninvited_single_user": "要向以前未邀请的 1 位用户的设备发送邀请吗？",
  "_user_group_vpp_device_alert_unenrolled": "要向当前尚未注册的 %@ 位用户的设备发送邀请吗？",
  "_user_group_vpp_device_alert_unenrolled_single_user": "要向以前尚未注册的 1 位用户的设备发送邀请吗？",

  "_user_group_email_invitation_info_All users have been invited": "所有用户都已邀请。",
  "_user_group_email_invitation_info_none_uninvited_have_email": "以前未邀请的用户的目录帐户中缺少电子邮件地址。",
  "_user_group_email_invitation_info_none_unenrolled_have_email": "未注册用户的目录帐户中缺少电子邮件地址。",
  "_user_group_email_invitation_info_x_of_y_uninvited_have_no_email": "%@ 位之前未被邀请的用户（共 %@ 位）的目录帐户中缺少电子邮件地址。",
  "_user_group_email_invitation_info_x_of_y_unenrolled_have_no_email": "%@ 位未注册用户（共 %@ 位）的目录帐户中缺少电子邮件地址。",
  "_user_group_device_invitation_info_none_uninvited_have_vpp_device": "以前未邀请的用户缺少合格设备的注册。",
  "_user_group_device_invitation_info_none_unenrolled_have_vpp_device": "未注册用户缺少合格设备的注册。",
  "_user_group_device_invitation_info_x_of_y_uninvited_have_no_vpp_device": "%@ 位之前未被邀请的用户（共 %@ 位）缺少合格设备的注册。",
  "_user_group_device_invitation_info_x_of_y_unenrolled_have_no_vpp_device": "%@ 位未注册用户（共 %@ 位）缺少合格设备的注册。",

  "_mdm_enabled_user_vpp_invite_revoked_description": "已于 %@ 撤销对此服务的访问。不会自动发送新的邀请",
  "_mdm_enabled_user_vpp_service_unenrolled_description": "此用户于 %@ 退出了该服务。将不会自动发送新的邀请",
  "_mdm_enabled_user_vpp_service_enrolled_description": "已注册%@",
  "_vpp_date_time_format": "%Y年%B%d日，%p %i:%M",
  "_generic_string_Revoke access": "撤销访问",
  "_vpp_content_No content is assigned to this user.": "未给此用户分配内容",
  "_vpp_device_status_This user does not have a device enrolled that supports this service.": "此用户没有注册支持此服务的设备。",
  "_mdm_enabled_user_vpp_service_enrolled_no_devices_description": "该用户没有注册支持此服务的设备",
  "_generic_string_An invitation was requested to be sent to %@1 on %@2": "已于 %@2 请求发送邀请到 %@1",
  "_generic_string_An invitation was sent to %@1 on %@2": "已于 %@2 发送邀请到 %@1",
  "_generic_string_Send invitation via email": "通过电子邮件发送邀请",
  "_mdm_disabled_user_invited_for_vpp_service_description": "已于 %@2 发送邀请到 %@1",
  "_mdm_disabled_user_revoked_for_vpp_service_description": "已于 %@ 撤销对此服务的访问。不会自动发送新的邀请",
  "_mdm_disabled_user_unenrolled_for_vpp_service_description": "此用户于 %@ 退出了该服务。将不会自动发送新的邀请",
  '_generic_string_Send invitation to "%@"': '给“%@”发送邀请',
  "generic_string_authorized_users_exceeds_available_licenses_for_single_app": "您购买的 %@ 副本不足，无法提供给此群组中的所有用户。应用程序会根据用户接受 VPP 已管理的分发注册的时间顺序进行分配。",
  "generic_string_authorized_users_exceeds_available_licenses_for_multiple_apps": "您购买的 %@ 应用程序的副本不足，无法提供给此群组中的所有用户。应用程序会根据用户接受 VPP 已管理的分发注册的时间顺序进行分配。",
  "_processing_vpp_on_user_group_to_assign_vpp_apps": "处理了群组信息后，VPP 应用程序可被分配。",
  "_enabled_vpp_service_on_user_group_to_assign_vpp_apps": "启用此群组的 VPP 服务以分配 VPP 应用程序。",
  "_processing_vpp_on_user_group_to_assign_vpp_books": "处理了群组信息后，图书可被分配。",
  "_enable_vpp_service_to_assign_books": "启用此群组的 VPP 服务以分配图书。",
  "_generic_string_Assign Books": "分配图书",

  "_cloud_configuration_knob_set_name": "云配置",
  "_cloud_configuration_knob_set_num_lines": "2",
  "_cloud_configuration_knob_set_description": "使用此部分来定义“云配置”的设置。",
  "_cloud_configuration_require_enrollment": "禁止用户跳过注册步骤",
  "_cloud_configuration_require_enrollment_hint": "完成设置前，要求设备注册 MDM",
  "_generic_string_Supervise (iOS only)": "监督（仅限 iOS）",
  "_generic_string_Enable supervision and prevent unenrollment": "启用监督和防止未注册",
  "_generic_string_Allow Pairing": "允许配对",
  "_generic_string_Enable the iOS device to be paired with a Mac": "使 iOS 设备与 Mac 配对",
  "_generic_string_Require credentials for enrollment": "要求注册凭证",
  "_generic_string_Setup Assistant Options": "设置助理选项",
  "_generic_string_Choose which options to show in the assistant": "选取要显示在助理中的选项",
  "_generic_string_Location Services": "定位服务",
  "_generic_string_Apple ID": "Apple ID",
  "_generic_string_Terms and Conditions": "条款和条件",
  "_generic_string_Send Diagnostics": "发送诊断",
  "_generic_string_Siri": "Siri",
  "_generic_string_Set Up as New or Restore": "设置为新建或恢复",
  "_generic_string_Make MDM Mandatory": "使 MDM 变为强制",
  "_generic_string_User may not skip applying or remove the configuration returned by the MDM server": "用户可能不会跳过应用或不会移除由 MDM 服务器返回的配置",
  "_skip_setup_options_iOS and OSX": "iOS 和 OS X",
  "_skip_setup_option_Passcode Lock": "密码锁定",
  "_skip_setup_options_iOS": "iOS",
  "_skip_setup_options_OSX": "OS X",
  "_skip_setup_option_Registration": "注册",
  "_skip_setup_option_Timezone": "时区",

  "_generic_string_Enable Zoom": "启用缩放",
  "_generic_string_Enable Invert Colors": "启用反转颜色",
  "_generic_string_Enable AssistiveTouch": "启用 AssistiveTouch",
  "_generic_string_Enable Speak Selection": "启用朗读所选内容",
  "_generic_string_Enable Mono Audio": "启用单声道音频",
  "_generic_string_Push Apps": "推送应用程序",
  "_generic_string_Push VPP Apps": "推送 VPP 应用程序",
  "_generic_string_Choose VPP Apps to push": "选取要推送的 VPP 应用程序",
  "_generic_string_The selected apps will be pushed to all eligible devices of enrolled users.": "所选应用程序将被推送到已注册用户的所有合格设备上。",
  "_generic_string_The selected apps will be pushed to all eligible devices of the enrolled user.": "所选应用程序将被推送到已注册用户的所有合格设备上。",
  "_generic_string_The selected apps are pushed to the user's eligible devices once they enroll in VPP Managed Distribution.": "用户注册 VPP 已管理的分发后，所选应用程序将被推送到他们的合格设备上。",
  "_generic_string_1 user's eligible devices will receive the selected apps once they enrolled in VPP Managed Distribution.": "1 位用户注册 VPP 已管理的分发后，他的合格设备将接收所选应用程序。",
  "_generic_string_<count> users' eligible devices will receive the selected apps once they enrolled in VPP Managed Distribution.": "%@1 位用户注册 VPP 已管理的分发后，他们的合格设备将接收所选应用程序。",
  "_generic_string_This user does not have an eligible device to receive the selected apps.": "此用户没有合格的设备来接收所选应用程序。",
  "_generic_string_1 user lacks any eligible devices and will not be pushed the selected apps.": "1 位用户缺少任何合格的设备，所选应用程序将不会被推送。",
  "_generic_string_<count> users lack any eligible devices and the selected apps will not be pushed.": "%@1 位用户缺少任何合格的设备，所选应用程序将不会被推送。",
  "_generic_string_No VPP Apps assigned": "无分配的 VPP 应用程序",
  "_generic_string_Select All": "全选",
  "_generic_string_No VPP apps assigned to this user.": "无分配到此用户的 VPP 应用程序。",
  "_generic_string_No VPP apps assigned to this group.": "无分配到此群组的 VPP 应用程序。",
  "_generic_string_Enable VPP services on this group to push VPP apps.": "启用此群组的 VPP 服务以推送 VPP 应用程序。",
  "_generic_string_No eligible devices.": "无合格的设备。",
  "_generic_string_Allow modifying account settings (Supervised devices only)": "允许修改帐户设置（仅限被监督的设备）",
  "_generic_string_Allow modifying Find My Friends settings (Supervised devices only)": "允许修改“查找我的朋友”设置（仅限被监督的设备）",
  "_generic_string_Allow pairing with non-Configurator hosts (Supervised Devices only)": "允许与未安装 Configurator 的主机配对（仅限被监督的设备）",
  "_generic_string_Allow modifying cellular data settings (Supervised devices only)": "允许修改蜂窝移动数据设置（仅限被监督的设备）",
  "_generic_string_Allow opening managed app documents in unmanaged apps": "允许未被管理的应用程序中包含来自被管理的应用程序中的文稿",
  "_generic_string_Allow opening unmanaged app documents in managed apps": "允许被管理的应用程序中包含来自未被管理的应用程序中的文稿",
  "_generic_string_Allow Control Center on lock screen": "在锁定屏幕中显示控制中心",
  "_generic_string_Show notifications view on lock screen": "在锁定屏幕中显示通知中心",
  "_generic_string_Show today view on lock screen": "在锁定屏幕中显示今日视图",
  "_generic_string_Allow user-generated content in Siri (Supervised devices only)": "允许 Siri 中用户生成的内容（仅限被监督的设备）",
  "_generic_string_Allow AirDrop (Supervised devices only)": "允许 AirDrop（仅限被监督的设备）",
  "_generic_string_Require passcode on first AirPlay pairing": "首次 AirPlay 配对时要求密码",

  "_locations_sidebar_item_display_name": "位置",
  "_generic_string_Prompt User To Enroll Device": "提示用户注册设备",
  "_generic_string_Prompt the user in the setup assistant to enroll in device management": "在设置助理中提示用户加入设备管理",

  // AD Certificate
  /* This is the name of the Setting Type for AD Cert settings. */
  "_ad_cert_knob_set_name": "AD 证书",
  /* This is a generic string used one or more times in the app. */
  "_generic_string_My AD Certificate": "我的 AD 证书",
  /* This layout gives the height of the description label of the description field in the AD Cert Payload*/
  "_layout_ad_cert_description_field_height": "40",
  "_ad_cert_Machine": "机器",
  "_ad_cert_User": "用户",

  // Global HTTP Proxy
  "_generic_string_Allow direct connection if PAC is unreachable": "在 PAC 无法连接时允许直接连接",
  "_generic_string_Allow bypassing proxy to access captive networks": "允许忽略代理以访问俘获型网络",

  // Network
  "_generic_string_PAC Fallback": "PAC 回退",
  "_generic_string_Enable to allow direct connection if PAC is unreachable": "启用以在 PAC 无法连接时允许直接连接",
  "_generic_string_Legacy Hotspot": "旧热点",
  "_generic_string_Passpoint": "Passpoint",
  "_generic_string_Provider Display Name": "服务商显示名称",
  "_generic_string_Display name of the Passpoint service provider": "Passpoint 服务商的显示名称",
  "_generic_string_Domain Name": "域名",
  "_generic_string_Domain name of the Passpoint service provider": "Passpoint 服务商的域名",
  "_generic_string_Roaming Consortium OIs": "漫游联盟 OI",
  "_generic_string_Roaming Consortium Organization Identifiers": "漫游联盟组织标识符",
  "_generic_string_Roaming Consortium OI": "漫游联盟 OI",
  "_generic_string_NAI Realm Names": "NAI 领域名称",
  "_generic_string_Network Access Identifier Realm Names": "网络访问标识符领域名称",
  "_generic_string_NAI Realm Name": "NAI 领域名称",
  "_generic_string_MCC/MNCs": "MCC/MNC",
  "_generic_string_Mobile Country Code and Mobile Network Configurations": "移动设备国家/地区代码和移动设备网络配置",
  "_generic_string_MCC": "MCC",
  "_generic_string_MNC": "MNC",
  "_generic_string_Connect to roaming partner Passpoint networks": "连接到漫游方 Passpoint 网络",
  "_generic_string_Add Mobile Country Code and Mobile Network Configuration": "添加移动设备国家/地区代码和移动设备网络配置",
  "_generic_string_MCC:": "MCC：",
  "_generic_string_MNC:": "MNC：",

  // Web Content Filter
  "_global_web_content_filter_knob_set_name": "Web 内容过滤器",
  "_global_web_content_filter_knob_set_description": "使用此部分来配置设备可以访问的 URL。这些设置将仅影响被监督的设备。",
  "_global_web_content_filter_knob_set_num_lines": "1",
  "_generic_string_Allowed Websites": "允许的网站",
  "_web_content_filter_Limit Adult Content": "限制成人内容",
  "_web_content_filter_Specific Websites Only": "仅特定网站",
  "_web_content_filter_Permitted URLs": "允许的 URL",
  "_web_content_filter_Specific URLs that will be allowed": "允许的特定 URL",
  "_web_content_filter_Blacklisted URLs": "列入黑名单中的 URL",
  "_web_content_filter_Additional URLs that will not be allowed": "不允许的其他 URL",
  "_web_content_filter_Specific Websites": "特定网站",
  "_web_content_filter_Allowed URLs which will be shown as bookmarks": "将显示为书签且被允许的 URL",
  "_web_content_filter_URL": "URL",
  "_web_content_filter_Name": "名称",
  "_web_content_filter_Bookmark": "书签",
  "_web_content_filter_Add Bookmark": "添加书签",
  "_web_content_filter_Create web content bookmark": "创建书签",
  "_web_content_filter_Name:": "名称：",
  "_web_content_filter_URL:": "URL：",
  "_web_content_filter_Bookmark Path:": "书签路径：",
  "_web_content_filter_add_page_label_width": "110",
  "_web_content_URL_Placeholder": "http://example.com",


  // AirPlay
  "_global_airplay_knob_set_name": "AirPlay",
  "_global_airplay_knob_set_description": "使用此部分来定义用于连接到 AirPlay 目的位置的设置。",
  "_airplay_knob_set_num_lines": "1",
  "_generic_string_Restrict AirPlay destinations (Supervised devices only)": "限制 AirPlay 目的位置（仅限被监督的设备）",
  "_generic_string_Only known AirPlay destinations will be available to the device": "设备只能使用已知的 AirPlay 目的位置",
  "_generic_string_Add AirPlay Destinations": "添加 AirPlay 目的位置",
  "_generic_string_Add a known AirPlay destination to the device": "将已知的 AirPlay 目的位置添加到设备",
  "_generic_string_Add by device name": "按设备名称添加",
  "_generic_string_Pick from enrolled Apple TVs": "从已注册的 Apple TV 中挑选",
  "_generic_string_Device Type:": "设备类型：",
  "_device_type_iOS/OS X": "iOS/OS X",
  "_device_type_Apple TV": "Apple TV",

  // Single Sign On
  "_global_single_sign_on_knob_set_name": "单点登录",
  "_global_single_sign_on_knob_set_description": "使用此部分来配置单点登录",
  "_single_sign_on_knob_set_num_lines": "1",
  "_generic_string_Principal Name": "主体名称",
  "_generic_string_Principal name of the account": "帐户的主体名称",
  "_generic_string_Realm of the account": "帐户的领域",
  "_generic_string_Limit this account to specific URL patterns": "将此帐户限制为使用特定 URL 模式",
  "_generic_string_This account will only be used for URLs that match the following patterns": "此帐户将仅用于匹配以下样式的 URL",
  "_generic_string_Limit this account to specific applications": "将此帐户限制为使用特定应用程序",
  "_generic_string_This account will only be used for the following application identifiers": "此帐户将仅用于以下应用程序标识符",

  // AirPrint
  "_global_airprint_knob_set_name": "AirPrint",
  "_airprint_knob_set_num_lines": "1",
  "_global_airprint_knob_set_description": "使用此部分来定义用于连接到 Airprint 打印机的设置。",
  "_generic_string_Printers available on the device": "设备上可用的打印机",
  "_table_header_IP Address": "IP 地址",
  "_table_header_Resource Path": "资源路径",

  "_generic_string_IP Address:": "IP 地址：",
  "_generic_string_Resource Path:": "资源路径：",
  "_layout_airplay_add_sheet_label_width": "110",
  "_generic_string_Add Printer": "添加打印机",

  "_generic_string_Enrollment Settings": "注册设置",
  "_enrollment_setting_allow_activation_lock": "MDM 注册之后发送“允许激活锁”命令（仅限被监督的设备）",
  "_enrollment_setting_allow_activation_lock_with_bypass_code": "如果已获得激活锁忽略码则仅发送命令",

  // Fonts
  "_fonts_knob_set_name": "字体",
  "_fonts_knob_set_num_lines": "1",
  "_fonts_knob_set_description": "使用此部分来指定想要安装在设备上的 TrueType 和 OpenType 字体。",
  "_generic_string_Font:": "字体：",
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