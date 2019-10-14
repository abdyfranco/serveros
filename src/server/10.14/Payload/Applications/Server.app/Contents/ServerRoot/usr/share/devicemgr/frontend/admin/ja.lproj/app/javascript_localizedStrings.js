// Copyright (c) 2018 Apple Inc. All rights reserved.

/* exported localizedStrings */
var localizedStrings = { /* The name of the Web Application itself. */
  "_appName": "Profile Manager",

  "_locale": "jp",

  '_SC.DateTime.dayNames': '日曜日 月曜日 火曜日 水曜日 木曜日 金曜日 土曜日',
  '_SC.DateTime.abbreviatedDayNames': '日 月 火 水 木 金 土',
  '_SC.DateTime.monthNames': '1月 2月 3月 4月 5月 6月 7月 8月 9月 10月 11月 12月',
  '_SC.DateTime.abbreviatedMonthNames': '1 2 3 4 5 6 7 8 9 10 11 12',
  '_SC.DateTime.AMPMNames': '午前 午後',

  /* The name of the sidebar item for Device Groups */
  "_device_groups_sidebar_item_display_name": "デバイスグループ",

  /* The name of the sidebar item for User Groups */
  "_user_groups_sidebar_item_display_name": "グループ",

  /* The name of the sidebar item for EduClasses */
  "_edu_classes_sidebar_item_display_name": "クラス",

  /* This is the cancel button in the Add Device Sheet. It closes the sheet without taking any action. */
  "_add_device_page_cancel_button_title": "キャンセル",

  /* This is the default button in the Add Device Sheet. It takes the unique identifier provided and creates a temporary device record. */
  "_add_device_pane_add_button_title": "デバイスを追加",

  /* This is the name of Mail Settings as it appears in the Add Settings Sheet. */
  "_email_knob_set_name": "メール",

  /* This is the item in the sidebar that when selected displays tasks that are active. */
  "_sidebar_active_tasks": "実行中のタスク",

  /* This is an item in the sidebar that groups the Active and Completed Tasks. It can not be selected. */
  "_sidebar_root_activity": "アクティビティ",

  /* This is an item in the sidebar that gorups the item types that can be placed in Configuration Profiles. It itself can not be selected. */
  "_sidebar_root_library": "ライブラリ",

  //KNOB SET ADD STEP 2a

  /* This is the name of the Setting Type for Printing settings. */
  "_privacy_knob_set_name": "セキュリティとプライバシー",

  /* This is the name of the Setting Type for Printing settings. */
  "_parental_controls_knob_set_name": "ペアレンタルコントロール",

  /* This is the name of the Setting Type for Printing settings. */
  "_cfprefs_knob_set_name": "カスタム設定",

  /* This is the name of the Setting Type for Printing settings. */
  // ==========
  // = Banner =
  // ==========
  "_mac_restrictions_knob_set_name": "制限",
  "_restrictions_knob_set_name_osx": "制限（macOS）",

  /* This is the name of the Setting Type for Printing settings. */
  "_printing_knob_set_name": "プリント",

  /* This is the name of the Setting Type for Mobility and PHD settings. */
  "_mobility_knob_set_name": "モバイル環境",

  /* This is the name of the Setting Type for Login Window settings. */
  "_login_window_knob_set_name": "ログインウインドウ",

  /* This is the name of the Setting Type for Software Update settings. */
  "_software_update_knob_set_name": "ソフトウェア・アップデート",

  /* This is the name of the Setting Type for Advanced settings. */
  "_cellular_knob_set_name": "セルラー",

  /* This is the name of the Setting Type for LDAP settings. */
  "_ldap_knob_set_name": "LDAP",

  /* this is the name of the Setting Type for the Passcode setting. There can only be one Passcode setting in a Configuration Profile. */
  "_passcode_knob_set_name": "パスコード",

  /* This is the name of the Global Http Proxy Knobset */
  "_global_http_proxy_knob_set_name": "グローバルHTTPプロキシ",

  /* This is the name of the Setting Type for the VPN setting. */
  "_vpn_knob_set_name": "VPN",

  /* This is the name of the Setting Type for the CalDav settings. */
  "_cal_dav_knob_set_name": "カレンダー",

  /* This is the name of the Setting Type for the CardDav settings. */
  "_card_dav_knob_set_name": "連絡先",

  /* This is the name of the Setting Type for the Login Items settings. */
  "_login_item_knob_set_name": "ログイン項目",

  /* This is the name of the Network Home Share Point name for the Login Items settings. */
  "_login_item_network_home_share_point_name": "<ネットワークホーム共有ポイント>",

  /* This is the name of the Setting Type for the CardDav settings. */
  "_general_knob_set_name": "一般",

  /* This is the name of the Setting Type for the Subscribed Calendars settings. */
  "_subscribed_calendar_knob_set_name": "照会カレンダー",

  /* This is the name of the Setting Type for the restrictions settings. */
  "_restrictions_knob_set_name": "制限",
  "_restrictions_knob_set_name_ios": "制限（iOS）",

  /* This is the subheading for the Certificate Name field for Certificate Settings. */
  "_certificate_knob_set_view_display_name_description": "証明書資格情報の名前または説明",

  /* The heading for the Certificate Name field for Certificate Settings. */
  "_certificate_knob_set_view_display_name_label": "証明書名",

  /* The name of Messages settings */
  "_ichat_knob_set_name": "メッセージ",

  /* The name of Certificate Settings. */
  "_certificate_knob_set_name": "証明書",

  /* The name of Web Clip Settings. */
  "_web_clip_knob_set_name": "Webクリップ",

  /* This is the hint provided in Fields in Settings when the value of the field is optional. */
  "_knob_set_view_optional_hint": "任意",

  "_generic_string_Retries": "再試行",
  "_generic_string_The number of times to poll the SCEP server for a signed certificate before giving up": "署名済み証明書のためにSCEPサーバへのポーリングを中断するまでの時間",
  "_generic_string_Retry Delay": "再試行間隔",
  "_generic_string_The number of seconds to wait between poll attempts": "ポーリング試行間隔（秒数）",

  /* This is the description for SCEP Setting's Challenge Field. */
  "_admin_scep_knob_set_view_challenge_field_description": "自動登録用の共有シークレットとして使用されます",

  /* This is the description for SCEP Setting's URL Field. */
  "_admin_scep_knob_set_view_url_field_description": "SCEPサーバのベースURL",

  /* This is the label for SCEP Setting's Subject Field. */
  "_admin_scep_knob_set_view_subject_field_label": "サブジェクト",

  /* This is the description of SCEP Setting's Subject Field. */
  "_admin_scep_knob_set_view_subject_field_description": "X.500名の説明",
  /* This is the message that appears when a Server Error occurs. */
  "_Server Error Occurred Message": "サーバエラーが起きました",

  /* This is the description for SCEP Setting's Key Size Field. */
  "_admin_scep_knob_set_view_keysize_field_description": "鍵のサイズ（ビット）",

  "1024": "1024",

  "2048": "2048",

  /* This is the description of the Delete Item Confirmation. */
  "_Show Delete Item Confirmation Description": "この操作は取り消せません。",

  /* This is the description of the Error Occurred error. */
  "_Server Error Occurred Description": "Webページを読み込み直して、やり直してください。",

  /* This is the caption of the Server Error Occurred error. */
  "_Server Error Occurred Caption": "このエラーが続く場合は、管理者に連絡してください。",

  /* This is the message that appears when Settings are being saved. */
  "_save_changes_confirmation_header_string": "変更内容を保存しますか?",
  "_save_changes_confirmation_header_description": "%@の変更を保存していません。",

  /* This is the label for SCEP Setting's Key Size Field. */
  "_admin_scep_knob_set_view_keysize_field_label": "鍵のサイズ",

  /* This is the message that apepars when a Profile is about to be deleted. */
  "_Show Delete Item Confirmation Message": "削除しますか?",
  "_delete_profile_alert_pane_header_Remove All Settings?": "すべての設定を削除しますか?",
  "_delete_settings_button_text_Remove All Settings": "すべての設定を削除",
  '_delete_profile_alert_pane_message_All payloads will be removed from "<profile_name>". "<profile_name>" will then be removed from all devices where it is currently applied. This action cannot be undone.': 'すべてのペイロードが“%@1”から削除されます。その後、“%@1”が、現在適用されているすべてのデバイスから削除されます。この操作は取り消せません。',
  '_delete_profile_alert_pane_message_manual_profile_for_directory_item': 'すべての設定が“%@1”から削除され、“%@1”は“マイデバイス”ポータルでダウンロードできなくなります。',
  '_delete_profile_alert_pane_message_manual_profile_for_device': 'すべての設定が“%@”から削除されます。',
  'no_payloads_alert_header': "ペイロードが構成されていません",
  'no_payloads_alert_description': '“%@”には“一般”以外に少なくとも1つのペイロードが構成されている必要があります。“一般”ペイロードに対する変更は保存されません。',
  "_continue_without_saving": "続ける",

  "_unenroll_device_alert_pane_header": "デバイス管理で管理対象の設定、App、登録を削除しますか?",
  "_unenroll_device_alert_pane_description": "プレースホルダレコードはデバイスが登録解除された後も維持されます。",
  "_unenroll_button_text_Unenroll": "登録解除",
  "_unenroll_and_remove_placeholder_button_text": "プレースホルダの登録を解除して削除",
  "_unenroll_dep_device_alert_pane_description": "Device Enrollment Programからのプレースホルダレコードは、デバイスが登録解除された後も維持されます。",
  "_remove_device_placeholder_alert_pane_header": "プレースホルダレコードを削除しますか?",
  "_remove_device_placeholder_alert_pane_description": "このプレースホルダデバイス用に現在保存されている情報はすべて失われます。",
  "_remove_device_placeholder_with_activation_lock_alert_pane_description": "このプレースホルダデバイス用に現在保存されている情報（アクティベーションロックのバイパスコードを含む）はすべて失われます。アクティベーションロックのバイパスコードは、アクティベーションロックが有効な場合にこのデバイスを復元するために必要です。",
  "_remove_device_placeholder_button_text_Remove Placeholder": "プレースホルダを削除",
  "_remove_dep_device_placeholder_alert_pane_header": "Device Enrollment Programからデバイスを完全に削除しますか?",
  "_remove_dep_device_placeholder_alert_pane_description": "この操作は取り消せません。このデバイスは、Device Enrollment Programポータルから登録できなくなります。このデバイス用に現在保存されている情報はすべて失われます。",
  "_remove_dep_device_placeholder_button_text_Remove": "削除",
  "_unenroll_dep_device_alert_pane_width": "540",
  "_remove_dep_device_alert_pane_width": "570",
  "_revert_device_to_placeholder": "プレースホルダに戻す",

  "_device_enrollment_state_placeholder": "プレースホルダ",
  "_device_enrollment_state_unenrollment_pending": "登録解除が保留中です",
  "_device_enrollment_state_wipe_pending": "ワイプ保留中",
  "_device_state_header_placeholder_label_width": "120",
  "_device_state_header_unenrollment_pending_label_width": "140",
  "_device_state_header_wipe_pending_label_width": "118",

  /* The display title for SCEP Setting's Use as digital signature checkbox */
  "_admin_scep_knob_set_view_use_as_digital_signature_display_title": "デジタル署名として使用",

  /* The display title for SCEP Setting's Use for key encipherment checkbox */
  "_admin_scep_knob_set_view_use_for_key_encipherment": "鍵の暗号化に使用",

  /* The label for Certificate Settings' Certificate Field */
  "_certificate_knob_set_view_upload_label": "証明書または識別子データ",

  /* The description for Certificate Settings' Certificate Field */
  "_certificate_knob_set_view_upload_description": "デバイスに含めるX.509証明書（.cer、.p12など）",

  /* The placeholder text for uploading a Certificate to a Certificate Setting. */
  "_certificate_knob_set_view_upload_placeholder": "証明書なし",

  /* The Lock Task Type */
  "_task_type_lock": "ロック",
  "_task_type_lock_with_display_name": "ロック: %@1",

  /* The Wipe Task Type */
  "_task_type_wipe": "ワイプ",
  "_task_type_wipe_with_display_name": "ワイプ: %@1",

  /* The Rename Task Type */
  "_task_type_rename": "名称変更",
  "_task_type_rename_with_display_name": "名称変更: %@1",
  "_new_task_enter_new_device_name": "新しい名前を入力",

  /* The unlock user account task Type */
  "_new_task_enter_unlock_user_account_name": "ユーザのローカルアカウント名を入力",

  /* This is the name for the Device Info Task Type */
  "_task_type_device_info": "情報を更新",
  "_task_type_device_info_with_display_name": "情報を更新: %@1",
  "_task_type_allow_activation_lock": "アクティベーションロックを許可",
  "_task_type_clear_activation_lock": "アクティベーションロックをクリア",
  "_task_type_restart_device": "デバイスを再起動",
  "_task_type_shutdown_device": "デバイスをシステム終了",
  "_task_type_unlock_user_account": "ユーザのロックを解除",
  "_task_type_enable_lost_mode": "紛失モードを有効にする",
  "_task_type_fetch_device_location": "デバイスの位置情報を取得",
  "_task_type_play_lost_mode_sound": "サウンド再生",
  "_task_type_disable_lost_mode": "紛失モードを無効にする",
  "_task_type_turn_on_activation_lock": "アクティベーションロックを有効にする",
  "_task_type_turn_on_activation_lock_enter_lost_message": "紛失時のメッセージを入力",
  "_task_type_logout_user": "ユーザをログアウト",
  "_task_type_delete_user": "ユーザを削除",
  '_task_type_enable_diagnostic_and_usage_reporting': '診断と使用状況のレポートを有効にする',
  '_task_type_disable_diagnostic_and_usage_reporting': '診断と使用状況のレポートを無効にする',
  '_task_type_enable_app_analytics': 'App解析を有効にする',
  '_task_type_disable_app_analytics': 'App解析を無効にする',
  '_task_type_set_passcode_lock_grace_period': 'パスコードロックの猶予期間を設定',
  '_task_type_set_passcode_lock_grace_period_label': 'パスコードロックの猶予期間を選択',
  '_task_type_passcode_lock_grace_period_action_label': '猶予期間を設定',
  '_passcode_lock_grace_period_immediately': 'パスコードがすぐに必要',
  '_passcode_lock_grace_period_1_minute': '1分',
  '_passcode_lock_grace_period_5_minutes': '5分',
  '_passcode_lock_grace_period_15_minutes': '15分',
  '_passcode_lock_grace_period_1_hour': '1時間',
  '_passcode_lock_grace_period_4_hours': '4時間',

  /* This is the name for the Clear Passcode Task Type */
  "_task_type_clear_passcode": "パスコード消去",
  "_task_type_request_mirroring": "AirPlayミラーリングを要求",
  "_task_type_stop_mirroring": "AirPlayミラーリングを停止",
  "_task_type_clear_passcode_with_display_name": "パスコード消去: %@1",
  "_task_type_clear_restrictions_passcode": "スクリーンタイムのパスコードを消去",
  "_task_type_clear_restrictions_passcode_with_display_name": "スクリーンタイムのパスコードを消去: %@1",
  "_task_type_change_managed_admin_account_password": "管理対象管理者アカウントのパスワードを変更",
  "_task_type_change_managed_admin_account_password_action_label": "パスワードを変更",
  "_task_type_enable_diagnostic_and_usage_reporting_action_label": "有効にする",
  "_task_type_disable_diagnostic_and_usage_reporting_action_label": "無効にする",
  "_task_type_set_firmware_password_action_label": "パスワードを設定",
  "_task_type_verify_firmware_password_action_label": "パスワードを確認",
  "_new_task_enter_new_admin_account_password": "新しい管理者パスワードを入力",
  "_new_task_reenter_new_admin_account_password": "管理者パスワードを再入力",
  "_task_set_admin_password_Passwords do not match": "パスワードが一致しません",
  "_task_set_admin_password_passwords_do_not_match_description": "管理者パスワードが一致しません。入力し直してください。",
  "_task_string_enable_lost_mode_message_label": "ロック画面のメッセージ",
  "_task_string_enable_lost_mode_phone_number_label": "電話番号",
  "_task_string_enable_lost_mode_footnote_label": "追加情報",

  /* The set firmware password task */
  "_generic_string_set_firmware_password": "ファームウェアパスワードを設定",
  "_task_set_firmware_password_Passwords do not match": "パスワードが一致しません",
  "_task_set_firmware_password_passwords_do_not_match_description": "ファームウェアパスワードが一致しません。入力し直してください。",
  "_new_task_enter_new_current_firmware_password": "現在のパスワードを入力",
  "_new_task_enter_new_firmware_password": "新しいパスワードを入力",
  "_new_task_reenter_new_firmware_password": "パスワードを再入力",

  /* The set firmware password task */
  "_generic_string_verify_firmware_password": "ファームウェアパスワードを確認",
  "_new_task_enter_password": "パスワードを入力",
  "_hint_firmware_password_display_information": "プリント可能なASCII小文字のみ",
  "_generic_string_firmware_password_allow_option_rom": "オプションROMの実行を許可",
  "_task_type_Enable Bluetooth": "Bluetoothを有効にする",
  "_task_type_Disable Bluetooth": "Bluetoothを無効にする",


  /* This is the label for the Completed Tasks sidebar entry. */
  "_sidebar_completed_tasks": "完了したタスク",

  /* This is the available device capacity formatter. In English, this is equivalent to 6.23 GB. %@1 is subsituted for something like 6.23. */
  "_available_device_capacity_format": "%@1 GB",

  /* This is the task status when the notification has been sent but the device has not checked in yet. */
  "_task_step_notification_sent_device_pending": "送信中",

  /* This is the task status when the device has reported that it has completed the task. */
  "_task_step_device_completion": "完了",

  /* This is the task status when the device has checked in and received the task, but has not yet checked in reporting that it has completed the task. */
  "_task_step_device_receieved_device_completion_pending": "進行中",

  /* This is the task type when the device is asked to provide info about itself to Profile Manager. */
  "_task_type_update_info": "情報を更新",
  "_task_type_update_info_with_display_name": "情報を更新: %@1",

  /* This is the task status when the device has not yet been sent a notification asking it to check in to recieve its task. This probably should never be displayed. */
  "_task_step_notification_pending": "保留中",
  "_task_step_vpp_status_user_not_invited": "ユーザが参加依頼されていません",
  "_task_step_vpp_status_user_not_enrolled": "ユーザが登録されていません",
  "_task_step_vpp_status_no_copies_available": "ライセンスを待機中です",
  "_task_step_install_update_status_downloading": "ダウンロード中です",
  "_task_step_install_update_status_installing": "インストール中です",

  /* This is the description for when an unknown error occurs within the Profile Manager web app. */
  "_client_error_occurred_description": "プロファイルマネージャを読み込み直して、やり直してください。",

  /* This is the message for when the Profile Manager server cannot be found. */
  "_server_not_found_message": "プロファイルマネージャが見つかりません",

  /* This is the description for when the Profile Manager server cannot be found. */
  "_server_not_found_description": "Serverアプリケーションでプロファイルマネージャがオンになっていることを確認してください。",

  /* This is the caption for when an unknown error occurs within the Profile Manager web app. */
  "_client_error_occurred_caption": "エラー: %@1",

  /* This is the message for when an unknown error occurs within the Profile Manager web app. */
  "_client_error_occurred_message": "エラーが起きました",

  /* This is the description for the network timeout error. */
  "_server_timed_out_description": "プロファイルマネージャがあるネットワークおよびインターネットに接続していることを確認してください。",

  /* This is the message for the network timeout error. */
  "_server_timed_out_message": "サーバへの接続がタイムアウトになりました",

  /* This is the description shown for the No Devices Found warning, which happens when the admin attempts to perform a task on a Library Item that has no Devices as descendants. */
  "_No Devices Found For Task Description": "この項目用のデバイスが見つかりませんでした。",

  /* This is the date and time format for Tasks. */
  "_task_updated_at_formatted_string": "%y/%m/%d %p %i:%M",

  /* This is the message shown for the no Devices Found warning, which happens when the admin attempts to perform a task on a Library Item that has no Devices as descendants. */
  "_No Devices Found For Task Message": "タスク用のデバイスが見つかりませんでした",

  /* This is the label of the Passphrase field of Certificates. */
  "_certificate_knob_set_view_password_label": "パスフレーズ",

  /* This is the description of the Passphrase field of Certificates. */
  "_certificate_knob_set_view_password_description": "資格情報を保護するために使用するパスフレーズ",

  /* This is the task state for cancelled tasks. */
  "_task_cancelled": "キャンセル",

  /* This is the menu item for sorting tasks ascending. */
  "_tasks_sort_ascending": "昇順",

  /* This is the mnu item for sorting tasks descending. */
  "_tasks_sort_descending": "降順",

  /* This is the menu item for sorting tasks by last updated. */
  "_tasks_sort_by_last_updated": "最終更新",

  /* This is the menu item for sorting tasks by name. */
  "_tasks_sort_by_name": "名前",

  /* This is the menu item for sorting tasks by icon. */
  "_tasks_sort_by_icon": "アイコン",

  /* This is the menu item for sorting tasks by status. */
  "_tasks_sort_by_status": "ステータス",
  "_task_type_send_vpp_invitation_with_display_name": "VPP参加依頼を送信: %@",
  "_task_type_remove_device_with_display_name": "デバイスを削除: %@",
  "_task_type_enroll_device_with_display_name": "デバイスを登録: %@",
  "_task_type_push_apps_with_display_name": "Appをプッシュ: %@",
  "_task_type_remove_apps_with_display_name": "Appを削除: %@",
  "_task_type_push_media_with_display_name": "ブックをプッシュ: %@",
  "_task_type_remove_media_with_display_name": "ブックを削除: %@",
  "_task_type_retrieve_activation_lock_bypass_code_with_display_name": "アクティベーションロックのバイパスコードを取得: %@",
  "_task_type_allow_activation_lock_with_display_name": "アクティベーションロックを許可: %@",
  "_task_type_remove_activation_lock_with_display_name": "アクティベーションロックをクリア: %@",
  "_task_type_request_airplay_mirroring_with_display_name": "AirPlayミラーリングを要求: %@",
  "_task_type_stop_airplay_mirroring_with_display_name": "AirPlayミラーリングを停止: %@",
  "_task_type_update_dep_profile_with_display_name": "DEPプロファイルをアップデート: %@",
  "_task_type_schedule_updates_with_display_name": "アップデートをインストール: %@",
  "_task_type_change_managed_admin_account_password_with_display_name": "管理対象管理者アカウントのパスワードを変更: %@",
  "_task_type_enable_lost_mode_with_display_name": "紛失モードを有効にする: %@",
  "_task_type_device_location_with_display_name": "デバイスの位置情報: %@",
  "_task_type_play_lost_mode_sound_with_display_name": "サウンド再生: %@",
  "_task_type_disable_lost_mode_with_display_name": "紛失モードを無効にする: %@",
  "_task_type_turn_on_activation_lock_with_display_name": "アクティベーションロックを有効にする: %@",
  "_task_type_logout_user_with_display_name": "ユーザをログアウト: %@",
  "_task_type_delete_user_with_display_name": "ユーザを削除: %@",
  '_task_type_enable_diagnostic_submission_with_display_name': '診断と使用状況のレポートを有効にする: %@',
  '_task_type_disable_diagnostic_submission_with_display_name': '診断と使用状況のレポートを無効にする: %@',
  '_task_type_enable_app_analytics_with_display_name': 'App解析を有効にする: %@',
  '_task_type_disable_app_analytics_with_display_name': 'App解析を無効にする: %@',
  '_task_type_set_passcode_lock_grace_period_with_display_name': 'パスコードロックの猶予期間を設定: %@',
  '_task_type_restart_device_with_display_name': 'デバイスを再起動: %@',
  '_task_type_shutdown_device_with_display_name': 'デバイスをシステム終了: %@',
  '_task_type_unlock_user_account_with_display_name': 'ユーザのロックを解除: %@',
  '_task_type_set_firmware_password_with_display_name': 'ファームウェアパスワードを設定: %@',
  '_task_type_verify_firmware_password_with_display_name': 'ファームウェアパスワードを確認: %@',
  '_task_type_enable_bluetooth_with_display_name': 'Bluetoothを有効にする: %@',
  '_task_type_disable_bluetooth_with_display_name': 'Bluetoothを無効にする: %@',

  /* This is the unknown type for tasks. This should almost never appear in the UI; it is only there in case there is a bug or something. */
  "_task_type_unknown_type": "不明",
  "_task_type_unknown_type_with_display_name": "不明: %@1",

  /* This is the description that is shown for identity (password protected) certificates. */
  "_certificate_is_identity_description": "このコンテンツは個人情報交換（PKCS12）フォーマットで保存され、パスワードで保護されています。情報は一切表示できません。",

  /* This is the message shown when the server has not finished turning on. This will probably only happen for 10-15 seconds after turning Profile Manager on in Server.app. */
  "_server_not_available_message": "プロファイルマネージャを利用できません",

  /* This is the description shown when the server has not finished turning on. */
  "_server_not_available_description": "しばらくしてから、やり直してください。",
  "_od_sync_in_progress_description": "プロファイルマネージャがディレクトリとの初期同期を完了中です",
  "_od_sync_completion_behavior_description": "管理者Webサイトは同期が完了するまで使用できません。同期が完了すると、このページが自動的に更新されて管理者Webサイトが読み込まれます。",
  "od_sync_in_progress_container_width": "650",
  "od_sync_in_progress_container_height": "160",

  /* This is the message shown when the network is not available. This typically happens when the web browser refuses to connect to anything. */
  "_network_not_available_message": "ネットワークを利用できません",

  /* This is the description shown when the network is not available. */
  "_network_not_available_description": "インターネットに接続していることを確認して、やり直してください。",

  /* This is the hint for the search box which says things like "Search Users", "Search Active Tasks", etc. */
  "_search_type_hint": "%@1を検索",

  "_generic_string_200+ found (200 displayed)": "%@1+項目見つかりました（%@1項目表示されています）",
  "_generic_string_<count> found": "%@1項目見つかりました",


  /* This is the hint for the search box when search is disabled. */
  "_search_disabled_hint": "検索",

  /* This is the Cancel button for the Filetype not Supported error. */
  "_filetype_not_supported_cancel_button": "キャンセル",

  /* This is the description for the Filetype not Supported error. */
  "_filetype_not_supported_description": "選択したファイルはサポートされていません。別のファイルを選択してください。",

  /* This is the Filetype not Supported error. */
  "_filetype_not_supported_message": "サポートされていないファイルタイプ",

  /* This is the combined profile status for Up to Date */
  "_combined_profile_up_to_date": "最新です",

  /* This is the combined profiles status for Pending Install */
  "_combined_profile_pending_install": "インストール保留中",

  /* This is the temporary combined profiles status for either External or Pending Removal */
  "_combined_profile_external_or_pending_removal": "外部または削除保留中",

  /* This is the combined profile status for Out of Date */
  "_combined_profile_out_of_date": "最新ではありません",

  /* This is the combined profile status for Pending Removal. */
  "_combined_profile_pending_removal": "削除保留中",

  /* This is the combined profile status for External. */
  "_combined_profile_external": "外部",

  /* This is the Don't Save button for the Show Save Changes Confirmation sheet. */
  "_show_save_changes_confirmation_dont_save": "保存しない",

  /* This is the passcode Compliant state for Devices for compiance with both Profiles and Accounts */
  "_passcode_compliant_both_compliant": "プロファイルとアカウントの両方",

  /* This is the passcode Compliant state for Devices for compliance with only Profiles, not Accounts */
  "_passcode_compliant_only_profiles_compliant": "プロファイルのみ、アカウントなし",

  /* This is the passcode Compliant state for Devices for compliance with only Accounts, not Profiles */
  "_passcode_compliant_only_other_compliant": "アカウントのみ、プロファイルなし",

  /* This is the passcode Compliant state for Devices for compliance with neither Profiles nor Accounts */
  "_passcode_compliant_not_compliant": "プロファイルとアカウントのどちらもなし",

  /* This is the Passcode Present state for Devices for when the passcode is not present */
  "_passcode_present_not_present": "なし",

  /* This is the Passcode Present state for Devices for when the passcode is present */
  "_passcode_present_present": "プレゼンテーション",
  '_security_info_string_user_configured_passcode_lock_grace_period': 'パスコードロックの猶予期間を構成済み',
  '_security_info_string_enforced_passcode_lock_grace_period': 'パスコードロックの猶予期間を適用済み',
  '_security_info_string_Firewall': 'ファイアウォール',
  '_security_info_string_Stealth Mode': 'ステルスモード',
  '_security_info_string_Block All Incoming Connections': '外部からの接続をすべてブロック',
  '_security_info_string_Firmware Password Exists': 'ファームウェアパスワードが存在します',
  '_security_info_string_Firmware Password Change Pending': 'ファームウェアパスワードの変更保留中',
  '_security_info_string_Firmware Allow Option ROMs': 'オプションROMを許可',

  /* This is the Hardware Encryption Capability state for Devices for when the Hardware is not capable */
  "_hardware_encrpyption_caps_not_capable": "未対応",

  /* This is the Hardware Encryption Capability state for Devices for when the Hardware is only capable of file-level encryption */
  "_hardware_encrpyption_caps_only_file_capable": "ファイルレベルのみ対応",

  /* This is the Hardware Encryption Capability state for Devices for when the Hardware is capable of both block-level and file-level encryption */
  "_hardware_encrpyption_caps_both_capable": "ブロックレベルとファイルレベルの両方に対応",

  /* This is the Hardware Encryption Capability state for Devices for when the Hardware is capable of only block-level encryption */
  "_hardware_encrpyption_caps_only_block_capable": "ブロックレベルのみ対応",

  /* This is the Hardware Encryption field for Devices */
  "_hardware_encrpyption": "ハードウェア暗号化",

  /* This is the Passcode Present field for Devices */
  "_passcode_present": "パスコードの有無",

  /* This is the Passcode Compliant field for Devices */
  "_passcode_compliant": "パスコードの準拠",

  /* This is the Restrictions About Root Item for Devices */
  "_restrictions_about_root_item": "制限",

  /*  */
  "_manual_fetching_when_roaming_on": "オン",

  /*  */
  "_manual_fetching_when_roaming_off": "オフ",

  /*  */
  "_force_forced": "強制",

  /*  */
  "_force_not_forced": "強制しない",

  /*  */
  "_require_required": "必須",

  /*  */
  "_require_not_required": "必須でない",

  /*  */
  "_allow_not_allowed": "不許可",

  /*  */
  "_allow_allowed": "許可",

  /*  */
  "_safari_accept_cookies_never": "しない",

  /*  */
  "_rating_apps_4_plus": "4+",

  /*  */
  "_rating_apps_17_plus": "17+",

  /*  */
  "_safari_accept_cookies_always": "常に受け入れる",

  /*  */
  "_rating_apps_dont_allow_apps": "Appを許可しない",

  /*  */
  "_rating_apps_9_plus": "9+",

  /*  */
  "_rating_apps_12_plus": "12+",

  /*  */
  "_rating_apps_allow_all_apps": "すべてのAppを許可",

  /*  */
  "_safari_accept_cookies_from_visited": "アクセスしたサイトのみ",

  /*  */
  "_unset": "—",

  /* This is the Installed Applications section of the About tab of Devices */
  "_installedApplications_about_root_item": "インストール済みアプリケーション",

  /* This is the payload type for profiles where the payload provides a password to allow users to remove a locaked configuration profile from the device. It can not be created in Profile Manager but may be present on profiles obtained elsewhere. */
  "_installed_profile_profile_removal_password_payload_type": "削除用パスワード",

  /* This is when the issuer of a Certificate can not be determined because it does not have a CN property. */
  "_certificate_issued_by_unknown": "不明",

  /* This is the button in Exchange Settings to remove the certificate. */
  "_knob_set_view_remove_certificate": "証明書の削除",

  /* This is the button in Exchange and Certificate Settings to add the certificate. */
  "_knob_set_view_add_certificate": "証明書を追加…",

  /* This is the helper text in the About tab of Library Items under the In Groups section when the selected Library Item is not in any Groups. */
  "_about_in_groups_not_in_any_groups": "所属グループはありません",

  /* This is the Sort By button, used on the Activity/Tasks tab. */
  "_sort_by_button": "▼",

  /* This is the helper text shown when no Applications are installed on a Device. */
  "_about_installed_applications_no_installed_applications": "追加アプリケーションはインストールされていません",

  /* This is the line item in the Devices tab of a Provisioning Profile that represents the additional devices specified in the Provisioning Profile that Profile Manager is unaware of. */
  "_provisioning_profile_n_additional_devices": "%@1個の追加デバイス",

  /* This is the line item in the Devices tab of a Provisioning Profile that represents the additional device specified in the Provisioning Profile that Profile Manager is unaware of. */
  "_provisioning_profile_one_additional_device": "1個の追加デバイス",

  /* This is the task type when a Provisioning Profile is installed onto a Device. */
  "_task_type_install_provisioning_profile": "プロビジョニングプロファイルをインストール",
  "_task_type_install_provisioning_profile_with_display_name": "プロビジョニングプロファイルをインストール: %@1",

  /* This is the message for the Browser Outdated error. */
  "_browser_outdated_message": "新しいバージョンのブラウザが必要です",

  /* This is the description for the Browser Outdated error. */
  "_browser_outdated_description": "プロファイルマネージャを実行するには、新しいバージョンのブラウザを使用する必要があります。",

  /* This is the cancel button for the Browser Outdated error. */
  "_browser_outdated_cancel": "キャンセル",

  /* This is the helper text shown when the item list for a Library Item is loading. The wildcard will be replaced with the name of the selected sidebar item, for example Users. */
  "_item_list_loading": "%@1を読み込み中…",

  /* This is the message for the Save Changes Conflict warning. */
  "_save_changes_conflict_message": "不一致を保存",

  /* This is the description for the Save Changes Conflict warning. */
  "_save_changes_conflict_description": "あなたが編集を始めた後で変更されました。これらの変更を上書きしますか? 変更の上書きは取り消せません。",

  /* This is the cancel button for the Save Changes Conflict warning. It has no action. */
  "_save_changes_conflict_cancel": "キャンセル",

  /* This is the overwrite button for the Save Changes Conflict warning. It will overrite any remote changes. */
  "_save_changes_conflict_overwrite": "上書き",

  /* The profile is available for installation on this device, but is not currently installed. It is a manual download profile. */
  "_combined_profile_available_for_install": "インストール可能",

  /* This is for profiles installed on Devices whose owners are not authorized for the Manual Profile in question, or the profile is no longer being maintained by the server. This is for manual profiles. */
  "_combined_profile_not_authorized": "認証されていません",

  /* This is the name and version of an installed application. %@1 will become the name of the Application and %@2 will become the Version string of the Application. */
  "_installed_application_name_and_version": "%@1 %@2",

  /* This is the name and version of an users on the device. %@1 will become the name of the User. */
  "_device_user_name": "%@1",

  /* This is the cancel button for the Email Profile to Recipients Confirmation. */
  "_email_profile_to_recipients_cancel": "キャンセル",

  /* This is the message for the Selected Item was Destroyed and Unsaved Changes Lost error. */
  "_selected_item_was_destroyed_unsaved_changes_lost_message": "選択した項目は削除されています",

  /* This is the description for the Selected Item was Destroyed and Unsaved Changes Lost error. */
  "_selected_item_was_destroyed_unsaved_changes_lost_description": "未保存の変更内容が失われました。",

  /* This is the label for the Add Recipients Picker. The wildcard will be replaced with the type of Recipients being added. */
  "_add_members_label_view_value": "%@1を追加",

  /* This is the Save button for the Show Save Changes Confirmation alert. */
  "_show_save_changes_confirmation_save_button": "保存",

  /* This is the Configure button shown when there are No Settings for the Selected Setting Type. */
  "_no_settings_configure_button": "構成",

  /* This is the Message shown when there are no Setting Instances for the Selected Setting Type. */
  "_no_settings_configure_message": "%@1を構成",

  /* This is the generic description for Setting Types when one has not been provided. */
  "_generic_setting_type_description": "このセクションを使用して%@1を構成します。",

  /* This is the secondary information for the General knobset */
  "_setting_type_secondary_information_general_knobset": "必須",

  /* This is the secondary information for a Setting Type which has multiple payloads configured. */
  "_setting_type_secondary_information_multiple_configured": "%@1個のペイロード構成",

  /* This is the secondary information for a Setting Type which has multiple payloads configured. */
  "_setting_type_secondary_information_one_configured": "1個のペイロード構成",

  /* This is the secondary information for a Setting Type which has no payloads configured. */
  "_setting_type_secondary_information_not_configured": "未設定",

  /* This is the Push Settings type of Task. Push Settings is performed automatically whenever a Managed Configuration Profile is Saved. */
  "_task_type_push_settings": "プッシュ設定",
  "_task_type_push_settings_with_display_name": "プッシュ設定: %@1",

  /* This is the message shown when closing the Admin while there are unsaved changes. */
  "_admin_before_unload_unsaved_changes_will_be_lost": "未保存の変更内容は失われます。",

  /* This is the message when the Admin is closed while there is network activity in progress. */
  "_admin_before_unload_network_activity_in_progress": "ネットワーク処理中。",

  /* This is the status for tasks that failed. */
  "_task_failed": "失敗",
  "_task_succeeded": "完了",
  "_task_no_devices": "デバイスがありません",

  /* Library item tasks secondary information */
  "_task_1_failed": "%@1件失敗",
  "_task_many_failed": "%@1件失敗",

  "_task_1_cancelled": "%@1件キャンセル",
  "_task_many_cancelled": "%@1件キャンセル",

  "_task_1_succeeded": "%@1件完了",
  "_task_many_succeeded": "%@1件完了",

  "_task_1_cancelled_1_failed": "%@1件キャンセル、%@2件失敗",
  "_task_many_cancelled_1_failed": "%@1件キャンセル、%@2件失敗",
  "_task_1_cancelled_many_failed": "%@1件キャンセル、%@2件失敗",
  "_task_many_cancelled_many_failed": "%@1件キャンセル、%@2件失敗",

  "_task_1_succeeded_1_cancelled": "%@1件完了、%@2件キャンセル",
  "_task_many_succeeded_1_cancelled": "%@1件完了、%@2件キャンセル",
  "_task_1_succeeded_many_cancelled": "%@1件完了、%@2件キャンセル",
  "_task_many_succeeded_many_cancelled": "%@1件完了、%@2件キャンセル",

  "_task_1_succeeded_1_failed": "%@1件完了、%@2件失敗",
  "_task_many_succeeded_1_failed": "%@1件完了、%@2件失敗",
  "_task_1_succeeded_many_failed": "%@1件完了、%@2件失敗",
  "_task_many_succeeded_many_failed": "%@1件完了、%@2件失敗",

  "_task_1_succeeded_1_cancelled_1_failed": "%@1件完了、%@2件キャンセル、%@3件失敗",
  "_task_many_succeeded_1_cancelled_1_failed": "%@1件完了、%@2件キャンセル、%@3件失敗",
  "_task_1_succeeded_many_cancelled_1_failed": "%@1件完了、%@2件キャンセル、%@3件失敗",
  "_task_1_succeeded_1_cancelled_many_failed": "%@1件完了、%@2件キャンセル、%@3件失敗",
  "_task_many_succeeded_many_cancelled_1_failed": "%@1件完了、%@2件キャンセル、%@3件失敗",
  "_task_1_succeeded_many_cancelled_many_failed": "%@1件完了、%@2件キャンセル、%@3件失敗",
  "_task_many_succeeded_1_cancelled_many_failed": "%@1件完了、%@2件キャンセル、%@3件失敗",
  "_task_many_succeeded_many_cancelled_many_failed": "%@1件完了、%@2件キャンセル、%@3件失敗",

  "_task_1_of_2_in_progress": "%@1 / %@2件進行中",

  "_task_1_of_2_in_progress_1_failed": "%@1 / %@2件進行中、%@3件失敗",
  "_task_1_of_2_in_progress_many_failed": "%@1 / %@2件進行中、%@3件失敗",

  "_task_1_of_2_in_progress_1_cancelled": "%@1 / %@2件進行中、%@3件キャンセル",
  "_task_1_of_2_in_progress_many_cancelled": "%@1 / %@2件進行中、%@3件キャンセル",

  "_task_1_of_2_in_progress_1_succeeded": "%@1 / %@2件進行中、%@3件完了",
  "_task_1_of_2_in_progress_many_succeeded": "%@1 / %@2件進行中、%@3件完了",

  "_task_1_of_2_in_progress_1_cancelled_1_failed": "%@1 / %@2件進行中、%@3件キャンセル、%@4件失敗",
  "_task_1_of_2_in_progress_many_cancelled_1_failed": "%@1 / %@2件進行中、%@3件キャンセル、%@4件失敗",
  "_task_1_of_2_in_progress_1_cancelled_many_failed": "%@1 / %@2件進行中、%@3件キャンセル、%@4件失敗",
  "_task_1_of_2_in_progress_many_cancelled_many_failed": "%@1 / %@2件進行中、%@3件キャンセル、%@4件失敗",

  "_task_1_of_2_in_progress_1_succeeded_1_cancelled_1_failed": "%@1 / %@2件進行中、%@3件完了、%@4件キャンセル、%@5件失敗",
  "_task_1_of_2_in_progress_1_succeeded_1_cancelled_many_failed": "%@1 / %@2件進行中、%@3件完了、%@4件キャンセル、%@5件失敗",
  "_task_1_of_2_in_progress_1_succeeded_many_cancelled_1_failed": "%@1 / %@2件進行中、%@3件完了、%@4件キャンセル、%@5件失敗",
  "_task_1_of_2_in_progress_many_succeeded_1_cancelled_1_failed": "%@1 / %@2件進行中、%@3件完了、%@4件キャンセル、%@5件失敗",
  "_task_1_of_2_in_progress_1_succeeded_many_cancelled_many_failed": "%@1 / %@2件進行中、%@3件完了、%@4件キャンセル、%@5件失敗",
  "_task_1_of_2_in_progress_many_succeeded_many_cancelled_1_failed": "%@1 / %@2件進行中、%@3件完了、%@4件キャンセル、%@5件失敗",
  "_task_1_of_2_in_progress_many_succeeded_1_cancelled_many_failed": "%@1 / %@2件進行中、%@3件完了、%@4件キャンセル、%@5件失敗",
  "_task_1_of_2_in_progress_many_succeeded_many_cancelled_many_failed": "%@1 / %@2件進行中、%@3件完了、%@4件キャンセル、%@5件失敗",

  "_task_1_of_2_in_progress_1_succeeded_1_failed": "%@1 / %@2件進行中、%@3件完了、%@4件失敗",
  "_task_1_of_2_in_progress_many_succeeded_1_failed": "%@1 / %@2件進行中、%@3件完了、%@4件失敗",
  "_task_1_of_2_in_progress_1_succeeded_many_failed": "%@1 / %@2件進行中、%@3件完了、%@4件失敗",
  "_task_1_of_2_in_progress_many_succeeded_many_failed": "%@1 / %@2件進行中、%@3件完了、%@4件失敗",

  "_task_1_of_2_in_progress_1_succeeded_1_cancelled": "%@1 / %@2件進行中、%@3件完了、%@4件キャンセル",
  "_task_1_of_2_in_progress_many_succeeded_1_cancelled": "%@1 / %@2件進行中、%@3件完了、%@4件キャンセル",
  "_task_1_of_2_in_progress_1_succeeded_many_cancelled": "%@1 / %@2件進行中、%@3件完了、%@4件キャンセル",
  "_task_1_of_2_in_progress_many_succeeded_many_cancelled": "%@1 / %@2件進行中、%@3件完了、%@4件キャンセル",

  /* This is the User/User Group access state for when they can Enable Remote Management. */
  "_access_state_binding_access": "リモート管理を有効にできる",

  // KNOB SET ADD STEP 2b
  /*  */
  "_ad_cert_knob_set_description": "このセクションを使用してActive Directory証明書の設定を定義します。",

  /*  */
  "_scep_knob_set_description": "このセクションを使用して、SCEPサーバから証明書を取得する設定を定義します。",

  /*  */
  "_cfprefs_knob_set_description": "このセクションを使用して一般的な環境設定を定義します。",

  /*  */
  "_passcode_knob_set_description": "このセクションを使用して、デバイスに適用するパスコードポリシーを指定します。",

  /*  */
  "_general_knob_set_description": "このセクションを使用して一般の設定を定義します。",

  /*  */
  "_certificate_knob_set_description": "このセクションを使用して、デバイスにインストールするPKCS1およびPKCS12証明書を指定します。デバイスのネットワークアクセス認証に必要な企業の証明書やその他の証明書を追加します。",

  /*  */
  "_cal_dav_knob_set_description": "このセクションを使用して、CalDAVサーバに接続するための設定を定義します。",

  /*  */
  "_software_update_knob_set_description": "このセクションを使用してソフトウェア・アップデートの設定を定義します。",

  /*  */
  "_ichat_knob_set_description": "このセクションを使用して“メッセージ”の設定を定義します。",

  /*  */
  "_privacy_knob_set_description": "このセクションを使用して、セキュリティとプライバシーの設定を定義します。",

  /*  */
  "_exchange_knob_set_description": "このセクションを使用して、Exchangeサーバに接続するための設定を定義します。",

  /*  */
  "_web_clip_knob_set_description": "このセクションでWebクリップを構成します。",

  /*  */
  "_email_knob_set_description": "このセクションを使用して、POPまたはIMAPアカウントに接続するための設定を定義します。",

  /*  */
  "_subscribed_calendar_knob_set_description": "このセクションを使用してカレンダー照会の設定を定義します。",

  /*  */
  "_vpn_knob_set_description": "このセクションを使用して、必要な認証情報など、デバイスがVPN経由でワイヤレスネットワークに接続する方法を構成します。",

  /*  */
  "_card_dav_knob_set_description": "このセクションを使用して、CardDAVサーバに接続するための設定を定義します。",

  /*  */
  "_ldap_knob_set_description": "このセクションを使用して、LDAPサーバに接続するための設定を定義します。",

  /*  */
  "_restrictions_knob_set_description": "このセクションを使用して、ユーザが利用できるApp、デバイスの機能、およびメディアコンテンツを制限します。",

  /*  */
  "_mac_restrictions_knob_set_description": "このセクションを使用してアプリケーションとコンテンツの制限に関連する設定を指定します。（構成プロファイルがインストールされると、ユーザは各デバイス上でこれらの設定を変更できなくなります。）",

  /* Global HTTP Proxy knob set description that shows above the configure button */
  "_global_http_proxy_knob_set_description": "このセクションを使用して、デバイスからのすべてのHTTPトラフィックが経由するプロキシサーバの設定を構成します。これらの設定は監視対象デバイスにのみ適用されます。",

  /* Application Lock knob set description that shows above the configure button */
  "_app_lock_knob_set_description": "このセクションを使用してデバイスをどのアプリケーションにロックするかを指定します。これらの設定は監視対象デバイスにのみ適用されます。",

  /*  */
  "_interface_knob_set_description": "このセクションを使用してインターフェイスの設定を定義します。",
  '_interface_knob_set_string_Restrict Fastlane QoS Marking': '高速レーンのQoSマーキングを制限',
  '_interface_knob_set_string_restrict_fastlane_option_Allow All Apps': 'すべてのAppを許可',
  '_interface_knob_set_string_restrict_fastlane_option_Whitelist Specific Apps': '固有のAppをホワイトリスト',
  '_interface_knob_set_string_restrict_fastlane_option_Disable Fastlane': '高速レーンを無効にする',
  '_interface_knob_set_string_allow_qos_marking_builtin_services': '内蔵のオーディオ/ビデオ用のAppでQoSマーキングを許可',
  '_interface_knob_set_string_Whitelisted Apps': 'ホワイトリストされたApp',

  /*  */
  "_printing_knob_set_description": "このセクションでプリントの設定を定義します。",

  /*  */
  "_mobility_knob_set_description": "このセクションを使用してモバイル環境とポータブル・ホームディレクトリの設定を定義します。",

  /*  */
  "_apn_knob_set_description": "このセクションを使用してキャリアのアクセスポイント名（APN）などの詳細設定を指定します。（これらの設定は、トレーニングを受けた専門家だけが管理するようにしてください。）",

  /*  */
  "_parental_controls_knob_set_description": "このセクションを使用してペアレンタルコントロールの設定を定義します。",

  /* This is the separator in the sidbear that appears if there are any Enrollment Profiles. */
  "_auto_join_profiles_tree_item": "登録プロファイル",

  /* This is a popup menu item in the sidebar's add button popup. It creates a new Enrollment Profile. */
  "_new_auto_join_profile": "登録プロファイル",

  /* This is the default name of newly created Enrollment Profiles */
  "_default_auto_join_profile_name": "新規登録プロファイル",

  /* This action downloads the Enrollment Profile so that it can be used to auto-join devices. */
  "_save_auto_join_profile_to_disk": "登録プロファイルをディスクに保存",

  /* This is the name of a temporary device. The wildcard will be filled in with a unique identifier for the Device, such as serial number, UDID, or IMEI. */
  "_admin_device_name_temporary_device": "一時的: %@1",

  /* This is the Settings tab for Enrollment Profiles. */
  "_auto_join_profile_settings": "設定",

  /* This is the Usage tab for Enrollment Profiles. */
  "_auto_join_profile_usage": "使用状況",

  /* This shows up in the Settings tab of Enrollment Profiles. */
  "_info_auto_join_security_title": "セキュリティ",

  /* This shows up in the Settings tab of Enrollment Profiles. */
  "_info_auto_join_security_paragraph": "セキュリティを高めるために、ライブラリ内にプレースホルダのあるデバイスだけがこのプロファイルを使用できるように制限できます。",

  /* This is the checkbox found in the Settings tab of Enrollment Profiles. */
  "_info_auto_join_restrict_use_checkbox": "プレースホルダのあるデバイスのみに使用を制限",
  "_enrollment_profile_device_groups_header": "デバイスグループ",
  "_enrollment_profile_device_groups_description": "このプロファイルを使って登録するデバイスを次のデバイスグループに自動的に追加します",

  /* This is the download button in the toolbar for Enrollment Profiles. */
  "_download_auto_join_profile": "ダウンロード",

  /* HERE IS WHERE THE LOGIN BEHAVIOR KNOB SET DESCRIPTION GOES */
  "_login_item_knob_set_description": "このセクションを使用してログイン時に実行する項目の設定を指定します",

  /* HERE IS WHERE THE LOGIN WINDOW KNOB SET DESCRIPTION GOES */
  "_login_window_knob_set_description": "このセクションを使用してログインウインドウの動作と外観の設定を指定します",

  /* This is the description inside the Usage tab for Enrollment Profiles. */
  "_usage_auto_join_description": "以下のデバイスが接続時にこのプロファイルを使用しました",

  /* This is the secondaryInformation for Enrollment Profiles where the Enrollment Profile was used one time. */
  "_auto_join_profile_secondary_information_one_time": "1回使用 - 最後の使用: %@1",

  /* This is the secondaryInformation for Enrollment Profiles. The first wildcard specifies the number of times the profile was used. The second wildcard is replaced with the last time it was used. */
  "_auto_join_profile_secondary_information": "%@1回使用 - 最後の使用: %@2",

  /* This is the secondaryInformation for Enrollment Profiles that have never been used. */
  "_auto_join_profile_secondary_information_zero_times": "0回使用",

  /* This is the reload button for the Client Error Occurred alert. */
  "_client_error_occurred_reload_button": "再度読み込む",

  /* This is the reload button for the Server Timed Out Error. */
  "_server_timed_out_reload_button": "再度読み込む",

  /* This is the reload button for the Server Not Available error. */
  "_server_not_available_reload_button": "再度読み込む",

  /* This is the reload button for the Server Error Occurred alert. */
  "_server_error_occurred_reload_button": "再度読み込む",

  /* This is the reload button for the Server Not Found error. */
  "_server_not_found_reload_button": "再度読み込む",

  /* This is the reload button for the Network Not Available error. */
  "_network_not_available_reload_button": "再度読み込む",

  /* This is a temporary explanation of the wall block on Setting payloads that were provided by Server.app. */
  "_temporary_knob_set_wall_block_explanation": "Server.appから割り当て",

  /* This is the URL that the help button will go to. */
  "_go_to_help_url": "https://help.apple.com/profilemanager/mac/5.7/",
  "_devices_help_url": "https://help.apple.com/profilemanager/mac/5.7/#/pmdCBDB5496",
  "_restrictions_help_url": "https://help.apple.com/profilemanager/mac/5.7/#/pmdE3C2931a",
  "_dep_website_url": "https://deploy.apple.com",

  /* This is the Add All button in the Members Picker. It adds all items. */
  "_members_picker_add_all_button": "すべてを追加",

  /* This is the Add Results button in the Members Picker sheet that adds all search results. */
  "_members_picker_add_results_button": "結果を追加",

  /* There are various Continue buttons in the Admin. */
  "_generic_continue_button": "続ける",

  /* This is the About Root Item for General info. */
  "_general_about_root_item": "一般",

  /* This is the label when Adding a Device to Profile Manager. */
  "_add_device_label_view_value": "デバイスを追加",

  "_add_device_Bonjour Device ID:": "デバイスID:",
  "_add_device_Airplay Password:": "AirPlayパスワード:",

  "_add_device_pane_width": "480",
  "_add_device_label_width": "140",
  "_add_device_apple_tv_help_description_height": "75",

  "_general_about_Airplay": "AirPlay",
  "_general_about_Password": "パスワード",
  "_general_about_no password set": "パスワード未設定",
  "_atv_airplay_password_set_from_profile_string": '“%@”から設定',
  "_user_about_info_item_string_Managed AppleID": "管理対象Apple ID",
  "_about_info_item_string_Location": "位置情報",
  "_about_info_item_string_location_info_not_supported": "非対応",
  "_about_info_item_string_location_info_not_available": "使用できません",
  "_about_info_string_latitude": "緯度: %@",
  "_about_info_string_longitude": "経度: %@",
  "_about_info_string_altitude": "高度: %@",
  "_about_info_string_course": "コース: %@",
  "_about_info_string_speed": "速度: %@",
  "_about_info_string_speed_kmhr": "速度: %@ km/h",
  "_about_info_string_speed_mhr": "速度: %@ mph",
  "_about_info_string_timestamp": "タイムスタンプ: %@",
  "_about_info_string_location_info_timestamp": "%y/%m/%d %p %i:%M",
  "_about_info_string_horizontal_accuracy_0": "横方向の精度: %@",
  "_about_info_string_horizontal_accuracy_1": "横方向の精度: %@メートル",
  "_about_info_string_horizontal_accuracy": "横方向の精度: %@メートル",
  "_about_info_string_vertical_accuracy_0": "縦方向の精度: %@",
  "_about_info_string_vertical_accuracy_1": "縦方向の精度: %@メートル",
  "_about_info_string_vertical_accuracy": "縦方向の精度: %@メートル",
  "_about_info_string_open_in_maps": "“マップ”で表示",
  "_about_info_item_string_Managed Apple ID Passcode Type": "管理対象Apple IDのパスコードタイプ",
  "_maps_url_with_lat_long_and_name": "http://maps.apple.com/?ll=%@1,%@2&q=%@3",
  "_general_Bonjour Device ID": "デバイスID",
  "_general_MAC:": "MAC:",
  "_general_about_MAC_Address_Placeholder": "00:00:00:00:00:00",

  "_add_device_apple_tv_help_description": "デバイスIDは、Apple TVで“設定”＞“一般”＞“情報”と選択してから、Siri Remoteの上部をタップするか、Apple Remoteの上ボタンを押すと表示されます。AirPlayパスワードは、このデバイスが許可されたAirPlay出力先として追加されるときに、AirPlayミラーリング設定の構成で使用されます。",

  "_generic_string_Known AirPlay Destinations": "既知のAirPlay出力先",

  /* This is the About Root Item for Details; typically additional information that doesn't fit in General. */
  "_details_about_root_item": "詳細",

  /* This is the About Root Item for Security. */
  "_security_about_root_item": "セキュリティ",
  "_application_firewall_settings_about_root_item_label": "Appのファイアウォール設定",
  "_application_firewall_setting_allow": "外部からの接続を許可",
  "_application_firewall_setting_block": "外部からの接続をブロック",
  "_app_firewall_setting_No App specific firewall settings": "App固有のファイアウォール設定はありません",

  /* This is the Security field for General Settings. */
  "_general_knob_set_view_security_field": "セキュリティ",

  /* This is the Security field for General Settings. */
  "_general_knob_set_view_automatic_profile_removal_field": "プロファイルを自動削除",

  /* This is the About Root Item for the parent Device Groups. */
  "_groups_in_about_root_item_in_device_groups": "所属するデバイスグループ",

  /* This is the About Root Item for parent User Groups. */
  "_groups_in_about_root_item_in_user_groups": "所属するグループ（制限、設定、App、ブックが割り当てられているか、VPPが有効）",

  /* This is the About Root Item for Certificates. */
  "_certificates_about_root_item": "証明書",

  // About page Permissions
  "_permissions_string_Restrictions": "制限",
  "_permissions_string_Allow access to My Devices Portal (https://<hostname>/mydevices)": "“マイデバイス”ポータル（https://%@1/mydevices）へのアクセスを許可",
  "_permissions_string_Allow configuration profile downloads": "構成プロファイルのダウンロードを許可",
  "_permissions_string_Allow device enrollment and unenrollment": "デバイス登録/登録解除を許可",
  "_permissions_string_Allow device lock": "デバイスロックを許可",
  "_permissions_string_Allow device wipe": "デバイスワイプを許可",
  "_permissions_string_Allow device passcode to be cleared": "デバイスパスコードの消去を許可",
  "_permissions_string_Allow enrollment of devices configured via DEP": "Device Enrollment Programで構成されたデバイスを設定アシスタントで登録することを許可",
  "_permissions_string_Allow enrollment of devices configured using Apple Configurator": "Apple Configuratorで構成されたデバイスを設定アシスタントで登録することを許可",
  "_permissions_string_Restrict enrollment to assigned devices": "割り当て済みデバイスのみに登録を制限",
  "_permissions_string_Restrict enrollment to placeholder devices": "プレースホルダデバイスのみに登録を制限",
  "_permissions_string_Learn about restrictions": "制限に関する情報",

  /* This is the Provisioning Profiles tree item, shown in the sidebar as a grouping. */
  "_provisioning_profiles_tree_item": "プロビジョニングプロファイル",

  /* This is the Sidebar Item for Devices, shown under LIBRARY. */
  "_devices_sidebar_item_display_name": "デバイス",

  /* This is the Devices tab. */
  "_tabs_devices_tab": "デバイス",
  '_tabs_shared_ipad_groups_tab': '共有iPadグループ',
  '_layout_shared_ipad_groups_tab_width': '150',

  /* This is the Settings tab. */
  "_tabs_settings_tab": "設定",

  /* This is the Info tab. */
  "_tabs_info_tab": "情報",

  /* This is the Books tab */
  "_tabs_books_tab": "ブック",

  /* This is the About tab. */
  "_tabs_about_tab": "情報",

  /* This is the Profiles tab. */
  "_tabs_profiles_tab": "プロファイル",

  /* This is the Members tab. */
  "_tabs_members_tab": "メンバー",

  /* This is the Instructors tab. */
  "_tabs_instructors_tab": "教師",
  /* This is the Students tab. */
  "_tabs_students_tab": "生徒",

  /* This is the Activity tab. */
  "_tabs_activity_tab": "動作状況",
  "_tabs_apps_tab": "App",

  /* This is the tab shown when the tabs are loading. */
  "_tabs_loading_tab": "読み込み中…",

  /* This is the Sidebar Item for Users, located under LIBRARY. */
  "_users_sidebar_item_display_name": "ユーザ",

  /* This is the part of the Title of the Window Document Title when an Enrollment Profile is selected. */
  "_window_document_title_sidbear_auto_join_profile": "登録プロファイル",

  /* This is the unique identifier popup entry for IMEI in the Add Device Sheet. */
  "_add_device_identifier_imei": "IMEI",

  /* This is the unique identifier popup entry for MEID in the Add Device Sheet. */
  "_add_device_identifier_meid": "MEID",

  /* This is the unique identifier popup entry for Serial Number in the Add Device Sheet. */
  "_add_device_identifier_serial_number": "シリアル番号",

  /* This is the unique identifier popup entry for UDID in the Add Device Sheet. */
  "_add_device_identifier_udid": "UDID",

  /* The hint in text fields where the field is required. */
  "_hint_required": "必須",
  "_hint_optional": "任意",

  /* This is the name label for the Add Device sheet. */
  "_add_device_name_label": "名前:",

  /* This appears on an iPad when it is in vertical mode. */
  "_temporary_ipad_vertical_mode_blocker_label": "プロファイルマネージャを使うにはiPadを回転します",

  /* This is the menu item to create a new Provisioning Profile. */
  "_new_provisioning_profile": "プロビジョニングプロファイル",

  /* This shows up when nothing is selected in the sidebar. */
  "_no_item_view_nothing_selected": "何も選択されていません",

  /* This shows up when searching and nothing was found for the selected sidebar item. The wildcard is replaced with the name of the selected sidebar item. */
  "_no_item_view_no_somethings_found": "%@1が見つかりませんでした",

  /* This shows up when there is none of the thing selected in the sidebar. The wildcard is replaced with the name of the selected sidebar item. */
  "_no_item_view_no_somethings": "%@1がありません",

  /* This is the menu item to add Devices. */
  "_add_recipients_add_devices": "デバイスを追加",
  "_user_toolbar_add_recipients_add_devices_width": "170",

  /* This is the menu item to add User Groups. */
  "_add_recipients_add_user_groups": "グループを追加",

  /* This is the menu item to add Users. */
  "_add_recipients_add_users": "ユーザを追加",

  /* This is the menu item to add Device Groups. */
  "_add_recipients_add_device_groups": "デバイスグループ",
  '_add_recipients_add_shared_ipad_groups': '共有iPadグループを追加',
  '_layout_edu_class_toolbar_menu_width': '200',

  /* This is the hint for search boxes that filter things. */
  "_filter_hint": "フィルタ",

  /*  */
  "_import_placeholder_devices": "プレースホルダを読み込む",

  /*  */
  "_add_placeholder_device": "プレースホルダを追加",

  /*  */
  "_import_placeholder_devices_error_cancel": "キャンセル",

  /*  */
  "_import_placeholder_devices_imported_one_device": "1個のデバイスプレースホルダが読み込まれました",

  /*  */
  "_import_placeholder_devices_error_headers_not_found": "ヘッダが見つかりませんでした。",

  /*  */
  "_import_placeholder_devices_imported_n_devices": "%@1個のデバイスプレースホルダが読み込まれました",

  /*  */
  "_import_placeholder_devices_error_non_csv": "ファイルはCSVではありませんでした。",

  /*  */
  "_import_placeholder_devices_error_unknown": "不明なエラーが起きました。",

  /*  */
  "_import_placeholder_devices_error_occurred": "プレースホルダの読み込み中にエラーが起きました",

  /*  */
  "_import_placeholder_devices_successful": "プレースホルダは正しく読み込まれました",

  /*  */
  "_import_placeholder_devices_error_no_valid_devices": "有効なプレースホルダがありません。",

  /*  */
  "_import_placeholder_devices_not_imported_one_device": "1行が読み込まれませんでした。",

  /*  */
  "_import_placeholder_devices_not_imported_n_devices": "%@1行が読み込まれませんでした。",

  /*  */
  "_import_placeholder_devices_error_csv_invalid": "CSVが無効でした。",

  /* This is shown if there are mac(s) that are incompatible with the task type. */
  "_new_task_1_mac_will_not_apply_to": "これは1台のMacには適用されません。",

  /* This is shown if there are mac(s) that are incompatible with the task type. */
  "_new_task_n_macs_will_not_apply_to": "これは $@1台のMacには適用されません。",

  /*  */
  "_new_task_the_n_ios_devices_can_be_unlocked": "%@1個のiOSデバイスをそれぞれの現在のパスコードでロック解除できます。",

  /*  */
  "_new_task_the_1_ios_device_can_be_unlocked": "1個のiOSデバイスを現在のパスコードでロック解除できます。",

  /*  */
  "_new_task_enter_a_passcode_for_1_mac_os_x_device": "1個のmacOSデバイスのロック解除に使用するパスコードを入力します。",

  /*  */
  "_new_task_enter_a_passcode_for_n_mac_os_x_devices": "%@1個のmacOSデバイスのロック解除に使用するパスコードを入力します。",

  /*  */
  "_new_task_reenter_the_passcode": "パスコードを再入力",

  /*  */
  "_new_task_preserve_data_plan": "iOSデバイスのデータ通信プランを保持",

  /*  */
  "_new_task_preserve_data_plan_1_device": "データ通信プランを保持",
  "_new_task_string_Disable quick start in setup assistant": "設定アシスタントでクイックスタートを無効にする",
  "_new_task_string_Disable quick start in setup assistant for iOS devices": "iOSデバイスの設定アシスタントでクイックスタートを無効にする",

  /*  */
  "_task_set_lock_passcode_Passcodes do not match": "パスコードが一致しません",
  "_task_set_lock_passcode_passcodes_do_not_match_description": "パスコードが一致しません。入力し直してください。",

  /*  */
  "_new_task_cancel": "キャンセル",

  /*  */
  "_new_task_ok": "OK",

  /*  */
  "_new_task_this_command_only_applies_to_ios_devices": "このコマンドはiOSデバイスにのみ適用されます。",

  /*  */
  "_new_task_no_eligible_devices": "このコマンドに対して適格なデバイスがありません。",

  /*  */
  "_new_task_no_devices_ok_button_view": "OK",
  "_new_task_select_airplay_destination": "AirPlay出力先を選択",
  "_new_task_select_admin_accounts": "管理者アカウントを選択",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Don't Allow TV Shows": "テレビ番組を許可しない",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Credential for authenticating the ActiveSync account": "ActiveSyncアカウントを認証するための資格情報",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 day": "1日",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Credential for authenticating the connection": "接続を認証するための資格情報",
  "_authentication_certificate_header_credential": "資格情報",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Screenshot": "スクリーンショットと画面収録を許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password for the outgoing mail server": "送信メールサーバのパスワード",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Safari Allow Popups": "Safari: ポップアップを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_IMEI": "IMEI",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Shared secret for the connection": "接続するための共有シークレット",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add": "追加",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%@1 Members": "メンバー数: %@1",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Maximum Auto-Lock": "自動ロックまでの最長時間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Requires passcode to contain at least one letter": "パスコードに1つ以上の英字と1つ以上の数字を含める必要があります",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The CalDAV password": "CalDAVパスワード",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Company Account": "自分のメールアカウント",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Proxy Server and Port": "プロキシサーバとポート",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Include User PIN": "ユーザPINを含む",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add Users": "ユーザを追加",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Wireless network encryption to use when connecting": "接続時に使用するワイヤレスネットワーク暗号化",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Save...": "保存…",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Days after which the passcode must be changed": "パスコード変更を要求するまでの日数",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Internal Server Path": "内部サーバパス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Identification of the wireless network to connect to": "接続するワイヤレスネットワークの識別子",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Explicit Content": "露骨な内容を許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Display name of the account": "アカウントの表示名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_18+": "18+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication type for connection": "接続の認証タイプ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Camera": "カメラを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Proxy Server URL": "プロキシサーバのURL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Proxy PAC URL": "プロキシPACのURL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow In-App Purchase": "App内課金を許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow In-App Purchases": "App内課金を許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PIN History": "PINの履歴",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MA": "MA",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User Group": "グループ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Configures proxies to be used with this VPN connection": "このVPN接続で使用するプロキシを設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Group identifier for the connection": "接続のためのグループ識別子",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_POP": "POP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_This profile has %@1 errors": "これらの設定には%@1個のエラーがあります",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow All Apps": "すべてのAppを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The display name of the account": "アカウントの表示名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 week": "1週間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_This profile has 1 error": "これらの設定には1個のエラーがあります",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_RSA SecurID": "RSA SecurID",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Maximum passcode age (1-730 days, or none)": "パスコードの有効期限（1〜730日、またはなし）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Modem": "モデム",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Network": "ネットワーク",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable Secure Socket Layer communication with chat server": "チャットサーバとのSecure Socket Layer通信を有効にします",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Last Checkin Time": "最終チェックイン時刻:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_R18+": "R18+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Name": "アカウント名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Number of unique passcodes before reuse": "この数までの一意パスコードを再利用禁止にします",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Permit the use of repeating, ascending, and descending character sequences": "文字列を繰り返したり、昇順または降順に並べることを許可します",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Delete": "削除",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_18A": "18A",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access": "アクセス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The hostname of the directory server": "ディレクトリサーバのホスト名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow All Movies": "すべてのムービーを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 hour": "1時間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Voice Dialing": "音声ダイヤルを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The CardDAV username": "CardDAVユーザ名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Display name of the connection (displayed on the device)": "接続の表示名（デバイス上に表示）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Retrieve incoming mail through secure socket layer": "SSLを使って受信メールを取得します",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow iTunes": "iTunesを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Description": "アカウントの説明",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Force Encrypted Backup": "強制的に暗号化バックアップ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Force limited ad tracking": "強制的に追跡型広告を制限",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Username used to connect to the proxy": "プロキシに接続するために使用するユーザ名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_IMAP": "IMAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ireland": "アイルランド",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No Devices Found For Task Caption": "タスクキャプション用のデバイスが見つかりませんでした",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Passcode history (1-50 passcodes, or none)": "パスコードの履歴（1〜50個のパスコード、またはなし）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Type": "タイプ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The users and groups that cannot login at this computer": "このコンピュータでログインできないユーザとグループ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Search Base": "検索ベース",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_New Device Group": "新規デバイスグループ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Auto Sync while Roaming": "ローミング中の自動同期を許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User Display Name": "ユーザ表示名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Safari Accept Cookies": "Safari: Cookieの受け入れ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_5 minutes": "5分",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password for this LDAP Account": "このLDAPアカウントのパスワード",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Shared Secret": "共有シークレット",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use SSL for External Exchange Host": "外部ExchangeホストにSSLを使用",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable VPN on Demand": "オンデマンドVPNを有効にする",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hostname or IP address, and port number for outgoing mail": "送信メールのホスト名またはIPアドレス、およびポート番号",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Window": "ウインドウ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. Movie Rating": "ムービーの最大制限指定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Server Address and Port": "サーバのアドレスとポート",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 Member": "メンバー数: 1",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication type for the connection": "接続の認証タイプ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use SSL": "SSLを使用",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Group": "グループ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_email": "メール",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The display name of the user (e.g. \"John Appleseed\")": "ユーザの表示名（例: John Appleseed）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_HTTP MD5 Digest": "HTTP MD5ダイジェスト",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Available Capacity": "使用可能なサイズ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The URL of the calendar file": "カレンダーファイルのURL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The username for this LDAP Account": "このLDAPアカウントのユーザ名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Maximum number of failed attempts": "入力を失敗できる回数",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Group Name": "グループ名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Description": "説明",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name for the Exchange ActiveSync account": "Exchange ActiveSyncアカウントの名前",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Hostname": "アカウントのホスト名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The chat protocol to use for this configuration": "この構成に使用するチャットプロトコル",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV-Y": "TV-Y",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Japan": "日本",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Don't Delete": "削除しない",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV-G": "TV-G",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Realm for authenticating the connection": "接続認証用の保護領域",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The username used to connect to the server for outgoing mail": "送信メールサーバに接続するためのユーザ名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Password used to authenticate with the proxy": "プロキシでの認証に使用するパスワード",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Subtree": "サブツリー",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV-14": "TV-14",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_GA": "GA",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_RP16": "RP16",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_12A": "12A",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Safari Force Fraud Warning": "Safari: 強制的に詐欺警告",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Outgoing Mail": "送信メール",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Scope": "範囲",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Type": "アカウントの種類",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User Authentication": "ユーザ認証",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Base": "ベース",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Safari": "Safariを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The users and groups that can login at this computer": "このコンピュータでログインできるユーザとグループ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Don't Allow Movies": "ムービーを許可しない",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Minimum passcode length": "最小のパスコード長",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_URL": "URL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The Principal URL for the CalDAV account": "CalDAVアカウントのプリンシパルURL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The username used to connect to the server for incoming mail": "受信メールサーバに接続するためのユーザ名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Longest auto-lock time available to the user": "ユーザが利用できる最長自動ロック時間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Model Number": "機種番号",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Username": "アカウントのユーザ名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hidden Network": "非公開ネットワーク",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Done": "完了",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Expires: ": "有効期限:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_R-15": "R-15",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The LDAP hostname or IP address": "LDAPホスト名またはIPアドレス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt user for password on the device": "デバイスユーザにパスワードの入力を要求します",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_R-18": "R-18",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Software Update server": "ソフトウェア・アップデート・サーバ",
  "_software_update_knobset_allow_prerelease_installation": "macOSベータリリースのインストールを許可",
  "_software_update_knobset_Allow non-admin users to purchase apps and install software updates": "管理者でないユーザにAppの購入とソフトウェア・アップデートのインストールを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password for this subscription": "この照会のパスワード",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_New Device": "新規デバイス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Routes all network traffic through the VPN connection": "すべてのネットワークトラフィックをVPN接続経由で送信します",

  /* This is a generic string used one or more times in the app. */
  "_wifi_security_type_wpa_wp2_personal": "WPA/WPA2パーソナル",
  "_wifi_security_type_wpa2_personal": "WPA2パーソナル",
  "_wifi_security_type_wpa2_enterprise": "WPA2エンタープライズ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use Kerberos v5 for authentication": "認証にKerberos v5を使用",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Role": "役割",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Login Group or Domain for the connection": "接続するログイングループまたはドメイン",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Login Group or Domain": "ログイングループまたはドメイン",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SonicWALL": "SonicWALL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SonicWALL Mobile Connect": "SonicWALL Mobile Connect",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Aruba VIA": "Aruba VIA",

  /* This is the width of the Connection Type popup button in the VPN payload editor */
  "_layout_vpn_connection_type_button_width": "300",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Serial Number": "シリアル番号",

  /* This is a generic string used one or more times in the app. */
  "_global_http_proxy_type_Automatic": "自動",
  "_network_proxy_type_Automatic": "自動",
  "_vpn_data_encryption_level_Automatic": "自動",
  "_vpn_proxy_type_Automatic": "自動",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The description of the calendar subscription": "カレンダー照会の説明",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The CardDAV password": "CardDAVパスワード",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PG-13": "PG-13",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PG-12": "PG-12",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Always": "常にする",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Caution": "警告",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The image file is invalid or too large": "イメージファイルが無効であるか大きすぎます",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Options": "オプション",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_WEP Enterprise": "ダイナミックWEP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Username": "ユーザ名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Longest device lock grace period available to the user": "ユーザが利用できる最長デバイスロック猶予期間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password for the account (e.g. \"MyP4ssw0rd!\")": "アカウント用のパスワード（例: “MyP4ssw0rd!”）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The authentication method for the incoming mail server": "受信用メールサーバの認証方法",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Simple Passcode": "シンプルパスコードを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Remove": "削除",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_C8": "C8",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My CardDAV Account": "自分の連絡先アカウント",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ICCID": "ICCID",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow simple value": "単純値を許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable Secure Socket Layer communication with CalDAV server": "CalDAVサーバとの通信時にSecure Socket Layerを有効にします",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_One Level": "1レベル",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The manner in which the profile is distributed to devices": "デバイスにプロファイルを配布する方法",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication Type": "認証のタイプ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SMTP authentication uses the same password as POP/IMAP": "SMTP認証にPOP/IMAPと同じパスワードを使用します",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. Failed Attempts": "失敗できる回数",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Uc": "Uc",

  /* This is a generic string used one or more times in the app. */
  "_restriction_string_block_cookies_Allow from Current Website Only": "アクセス中のWebサイトのみ許可",
  "_restriction_string_block_cookies_Allow from Websites I Visit": "アクセスしたWebサイトは許可",
  "_restriction_string_block_cookies_Always Allow": "常に許可",
  "_restriction_safari_block_cookies_options_width": "250",


  /* This is a generic string used one or more times in the app. */
  "_generic_string_Shared Secret / Group Name": "共有シークレット/グループ名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Group for authenticating the connection": "接続認証用のグループ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable Secure Socket Layer for this connection": "この接続のSecure Socket Layerを有効にします",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Password": "アカウントのパスワード",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_External Server Path": "外部サーバパス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication": "認証",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_, ": ", ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No Members": "メンバーがいません",
  "_user_group_membership_count_1 Group, No Users": "1個のグループ",
  "_user_group_membership_count_%@ Groups, No Users": "%@個のグループ",
  "_user_group_membership_count_No Groups, 1 User": "1人のユーザ",
  "_user_group_membership_count_No Groups, %@ Users": "%@人のユーザ",
  "_user_group_membership_count_1 Group, 1 User": "1個のグループ、1人のユーザ",
  "_user_group_membership_count_%@ Groups, %@ Users": "%@個のグループ、%@人のユーザ",
  "_user_group_membership_count_%@ Groups, 1 User": "%@個のグループ、1人のユーザ",
  "_user_group_membership_count_1 Group, %@ User": "1個のグループ、%@人のユーザ",

  /* This is a generic string used one or more times in the app. */
  "_edu_class_membership_count_No Instructor, No Student": "教師なし、生徒なし",
  "_edu_class_membership_count_1 Instructor, No Student": "1人の教師、生徒なし",
  "_edu_class_membership_count_%@ Instructors, No Students": "%@人の教師、生徒なし",
  "_edu_class_membership_count_No Instructors, 1 Student": "教師なし、1人の生徒",
  "_edu_class_membership_count_No Instructors, %@ Students": "教師なし、%@人の生徒",
  "_edu_class_membership_count_1 Instructor, 1 Student": "1人の教師、1人の生徒",
  "_edu_class_membership_count_%@ Instructors, %@ Students": "%@人の教師、%@人の生徒",
  "_edu_class_membership_count_%@ Instructors, 1 Student": "%@人の教師、1人の生徒",
  "_edu_class_membership_count_1 Instructor, %@ Student": "1人の教師、%@人の生徒",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication Credential": "認証資格情報",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Server path for the external exchange host": "外部Exchangeホストのサーバパス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Issued by: %@1": "発行元: %@1",

  /* This is a generic string used one or more times in the app. */
  "_network_proxy_setting_None": "なし",
  "_network_security_type_None": "なし",
  "_incoming_email_authentication_type_None": "なし",
  "_outgoing_email_authentication_type_None": "なし",
  "_vpn_encryption_level_None": "なし",
  "_vpn_proxy_setting_None": "なし",
  "_default_printer_item_None": "なし",
  "_scep_subject_alternative_name_type_None": "なし",
  "_xsan_network_name_none": "なし",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Device": "デバイス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Software Version": "ソフトウェアバージョン",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. TV Shows Rating": "テレビ番組の最大制限指定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Carrier Settings Version": "キャリア設定のバージョン",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Password for the account": "アカウントのパスワード",

  "_cellular_settings_string_configured_apn_types": "構成するAPNのタイプ",
  "_layout_cellular_settings_configured_apn_types_button_width": "200",
  "_cellular_settings_string_configured_apn_type_default": "デフォルトAPN",
  "_cellular_settings_string_configured_apn_type_data": "データAPN",
  "_cellular_settings_string_configured_apn_type_default_and_data": "デフォルトAPNとデータAPN",
  "_cellular_settings_string_attach_access_point_name": "デフォルトAPN名",
  "_cellular_settings_string_attach_access_point_user_name": "デフォルトAPNのユーザ名",
  "_cellular_settings_string_attach_access_point_password": "デフォルトAPNのパスワード",
  "_cellular_settings_string_attach_access_point_user_name_description": "接続を認証するためのユーザ名",
  "_cellular_settings_string_attach_access_point_name_description": "キャリア・アクセス・ポイントの名前",
  "_cellular_settings_string_attach_access_point_authentication_type": "デフォルトAPNの認証タイプ",
  "_cellular_settings_string_access_point_authentication_type_description": "接続に使用する認証タイプ",

  "_cellular_settings_string_access_point_name": "データAPN名",
  "_cellular_settings_string_access_point_user_name": "データAPNのユーザ名",
  "_cellular_settings_string_access_point_password": "データAPNのパスワード",
  "_cellular_settings_string_access_point_authentication_type": "データAPNの認証タイプ",

  "_cellular_settings_string_authentication_type_pap": "PAP",
  "_cellular_settings_string_authentication_type_chap": "CHAP",
  "_layout_cellular_settings_authentication_type_button_width": "50",
  "_cellular_settings_string_access_point_proxy_server": "データAPNのプロキシサーバ",
  "_cellular_settings_string_access_point_proxy_server_description": "プロキシサーバのホスト名またはIPアドレス、およびポート番号",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_www.example.com": "www.example.com",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_smtp.example.com": "smtp.example.com",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_mail.example.com": "mail.example.com",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%m/%d/%y at %i:%M:%S %p": "%y/%m/%d %p %i:%M:%S",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable Secure Socket Layer communication with CardDAV server": "CardDAVサーバとのSecure Socket Layer通信を有効にします",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Controls when the profile can be removed": "プロファイルをいつ削除するかの制御",



  /* This is a generic string used one or more times in the app. */
  "_generic_string_Automatic Push": "自動プッシュ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt for Password": "パスワードの入力を要求",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_OK": "OK",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User account for authenticating the connection": "接続を認証するためのユーザアカウント",


  /* This is a generic string used one or more times in the app. */
  "_generic_string_UDID": "UDID",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Safari Allow JavaScript": "Safari: JavaScriptを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Hostname and Port": "アカウントのホスト名とポート",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The number of past days of mail to synchronize": "どのくらい過去（日数）のメールを同期するかを指定します",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Current Carrier Network": "現在のキャリアネットワーク",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Expires: %A, %B %D, %Y %i:%M:%S %p %Z": "有効期限: %Y年%B%d日（%A）%p%i:%M:%S（%Z）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV-MA": "TV-MA",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Path Prefix:": "パスの接頭辞:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Smallest number of non-alphanumeric characters allowed": "使用できる英数字以外の文字の最小数",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password for the incoming mail server": "受信メールサーバのパスワード",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_2 minutes": "2分",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Any (Enterprise)": "任意（エンタープライズ）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Microsoft Exchange Server": "Microsoft Exchangeサーバ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_account_name": "アカウント名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User Name": "ユーザ名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_account_names": "アカウント名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Security Type": "セキュリティの種類",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_United Kingdom": "イギリス",

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
  "_generic_string_Authentication Credential Passphrase": "認証資格情報パスフレーズ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. Apps Rating": "アプリケーションの最大制限指定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Min. Complex Char's": "複合文字の最小数",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_optional Ex. O=Company Name/CN=Foo": "オプション 例: O=会社名 / CN=Foo",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require Alphanumeric": "英数字が必要",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication Credential Name": "認証資格情報名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_4 minutes": "4分",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Principal URL": "プリンシパルURL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_set on device": "デバイス上で設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My Subscribed Calendar": "自分の照会カレンダー",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The Principal URL for the CardDAV account": "CardDAVアカウントのプリンシパルURL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MD5 Challenge-Response": "MD5チャレンジ応答",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User logs in to authenticate the Mac to the network": "ユーザはログインしてMacをネットワーク認証します",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ab 18 Jahren": "ab 18 Jahren",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MDM": "MDM",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_12+": "12+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require alphanumeric value": "英数字の値が必要",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Bluetooth MAC": "Bluetooth MAC",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow YouTube": "YouTubeを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_United States": "アメリカ合衆国",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Server Hostname": "サーバのホスト名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The address of the account (e.g. \"john@example.com\")": "アカウントのメールアドレス（例: “john@example.com”）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MA15+": "MA15+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use Kerberos v5": "Kerberos v5を使用",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The Mac can access the network without a logged-in user": "このMacはログインユーザがいなくてもネットワークにアクセスできます",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Send All Traffic": "すべてのトラフィックを送信",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Password": "パスワード",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Last Edited %A, %B %d, %Y": "最終編集日: %Y年%B%d日（%A）",


  /* This is a generic string used one or more times in the app. */
  "_generic_string_The protocol for accessing the email account": "アカウントにアクセスするためのプロトコル",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add User Groups": "グループを追加",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Safari Allow Autofill": "Safari: 自動入力を許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Loading…": "読み込み中…",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Connection Type": "接続のタイプ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ask during installation": "インストール中に確認",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Australia": "オーストラリア",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My CalDAV Account": "自分のカレンダーアカウント",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The device will prompt the user for the passphrase if not given": "ユーザがパスフレーズを入力しなかった場合は入力を要求されます",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. PIN Age In Days": "PINの有効期限（日）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_R18": "R18",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hostname of IP address for server": "サーバのホスト名またはIPアドレス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Machine Authentication": "コンピュータ認証",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Outgoing password same as incoming": "送信パスワードを受信パスワードと同じにする",

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
  "_generic_string_Hostname or IP address, and port number for incoming mail": "受信メールのホスト名またはIPアドレス、およびポート番号",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_4+": "4+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Encryption Level": "暗号化レベル",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_URL used to retrieve proxy settings": "プロキシ設定を取得するために使用するURL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Email Address": "メールアドレス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Profile Distribution Type": "プロファイルの配布タイプ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Min. Length": "最小長",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_LDAP Account": "LDAPアカウント",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable if target network is not open or broadcasting": "対象ネットワークがオープンまたはブロードキャストでない場合に有効にします",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Scripts": "スクリプト",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Service Set Identifier (SSID)": "SSID（サービスセット識別子）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Maximum grace period for device lock": "デバイスロックの最大猶予期間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name or description for ActiveSync": "ActiveSyncの名前または説明",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_France": "フランス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Type of network interface on the device": "デバイスのネットワークインターフェイスの種類",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The display name of the account (e.g. 'Company LDAP Account')": "アカウントの表示名（例: “会社のLDAPアカウント”）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_3 minutes": "3分",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_2 weeks": "2週間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_New Configuration Profile": "新規構成プロファイル",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Capacity": "容量",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name for the Exchange Web Services account": "Exchange Web Servicesアカウントの名前",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Network Interface": "ネットワークインターフェイス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Minimum number of complex characters": "複合文字の最小数",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The display name of the account (e.g. \"Company Mail Account\")": "アカウントの表示名（例: “会社のメールアカウント”）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The CalDAV username": "CalDAVユーザ名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_defaults to username@host": "デフォルトでusername@host",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authenticate using secret, name, and server-side certificate": "機密、名前、およびサーバサイド証明書を使用して認証します",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_mobile": "携帯電話",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Source": "ソース",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Machine": "コンピュータ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User": "ユーザ",

  "_generic_string_VPP User": "VPPユーザ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Revert": "元に戻す",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_15 minutes": "15分",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 minutes": "1分",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Password for authenticating the connection": "接続認証用のパスワード",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Password for the wireless network": "このワイヤレスネットワーク用のパスワード",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PS": "PS",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_-18": "-18",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Search settings for this LDAP server": "このLDAPサーバの検索設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_-16": "-16",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Canada": "カナダ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_-12": "-12",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_-10": "-10",

  /* This is a generic string used one or more times in the app. */
  "_cellular_settings_string_attach_access_point_password_description": "接続認証用のパスワード",
  "_cellular_settings_string_attach_access_point_supported_ip_versions": "デフォルトAPN対応IPバージョン",
  "_cellular_settings_string_attach_access_point_upported_ip_versions_description": "接続が対応しているインターネットプロトコルのバージョン",
  "_cellular_settings_string_ip_version_not_set": "--",
  "_cellular_settings_string_ip_version_v4_v6": "IPv4とIPv6",
  "_cellular_settings_string_ip_version_v6": "IPv6",
  "_cellular_settings_string_ip_version_v4": "IPv4",
  "_layout_cellular_settings_ip_version_button_width": "100",
  "_cellular_settings_string_supported_ip_versions": "データAPN対応IPバージョン",
  "_cellular_settings_string_supported_ip_versions_description": "接続が対応しているインターネットプロトコルのバージョン",
  "_cellular_settings_string_supported_ip_versions_roaming": "データAPN対応ローミングIPバージョン",
  "_cellular_settings_string_supported_ip_versions_roaming_description": "ローミング中の接続が対応しているインターネットプロトコルのバージョン",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PG": "PG",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_4 hours": "4時間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Exchange ActiveSync Host": "Exchange ActiveSyncホスト",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Past Days of Mail to Sync": "過去のメールを同期（日数）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow": "許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Wi-Fi MAC": "Wi-Fi MAC",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ethernet MAC": "Ethernet MAC",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV-PG": "TV-PG",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Server": "サーバ",

  /* This is a generic string used one or more times in the app. */
  "_global_http_proxy_type_Manual": "手動",
  "_network_proxy_type_Manual": "手動",
  "_vpn_proxy_type_Manual": "手動",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 month": "1か月",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Force Passcode": "パスコードを強制",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use as a Login Window configuration": "ログインウインドウ構成として使用（macOSのみ）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow FaceTime": "FaceTimeを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Search Settings": "検索設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_YA": "YA",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_optional": "任意",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Save": "保存",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The printers available to a user": "ユーザが利用できるプリンタ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use SSL for Internal Exchange Host": "内部ExchangeホストにSSLを使用",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Build": "ビルド",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Realm": "領域",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The chat username": "チャットユーザ名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Smallest number of passcode characters allowed": "使用できるパスコード文字の最小数",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Incoming Mail": "受信メール",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_NC-17": "NC-17",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_3 days": "3日間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Any (Personal)": "任意（パーソナル）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_9+": "9+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PGR": "PGR",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hostname or IP address, and port number for the proxy server": "プロキシサーバのホスト名またはIPアドレス、およびポート番号",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV-Y7": "TV-Y7",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Mail Server and Port": "メールサーバとポート",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Deny": "拒否",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Retrieve outgoing mail through secure socket layer": "SSLを使って送信メールを取得します",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hostname or IP address, and port number for the server": "サーバのホスト名またはIPアドレス、およびポート番号",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Proxy Setup": "プロキシ設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Proxy Type": "プロキシタイプ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Never": "常にしない",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_--": "--",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_WPA / WPA2 Enterprise": "WPA/WPA2エンタープライズ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. Inactivity": "最大アイドル時間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use Hybrid Authentication": "ハイブリッド認証を使用",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sim Carrier Network": "SIMキャリアネットワーク",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_NTLM": "NTLM",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The type of connection enabled by this policy": "このポリシーで有効な接続のタイプ",
  "_layout_exchange_connection_type_dropdown_button_width": "260",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Printer List": "プリンタリスト",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 minute": "1分",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ab 16 Jahren": "ab 16 Jahren",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Immediately": "即時",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My Account": "マイアカウント",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Manual Download": "手動ダウンロード",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Server path for the internal exchange host": "内部Exchangeホストのサーバパス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_AV15+": "AV15+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Man. Fetch. When Roaming": "ローミング時に手動フェッチ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Cancel": "キャンセル",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ab 6 Jahren": "ab 6 Jahren",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_auto": "自動",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Specify a URL of the form http://server.example.com:8088/index.sucatalog": "http://server.example.com:8088/index.sucatalogのようにURLを指定してください",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Internal Exchange Host": "内部Exchangeホスト",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Role for authenticating the connection": "接続認証用の役割",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Connection Name": "接続名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Explicit Allowed": "不適切な内容を許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The CardDAV hostname or IP address and port number": "CardDAVホスト名またはIPアドレスとポート番号",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate": "証明書",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. Grace Period": "最大猶予期間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Don't Allow Apps": "Appを許可しない",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ch": "チャンネル",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ab 0 Jahren": "ab 0 Jahren",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The authentication method for the outgoing mail server": "送信用メールサーバの認証方法",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_External Exchange Host": "外部Exchangeホスト",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The CalDAV hostname or IP address and port number": "CalDAVのホスト名またはIPアドレスとポート番号",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow All TV Shows": "すべてのテレビ番組を許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Domain": "ドメイン",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Phone": "電話",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_14+": "14+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Germany": "ドイツ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_AO": "AO",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Send all communication through secure socket layer": "すべての通信をSSLで送信します",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Domain and host names that will establish a VPN": "VPNを確立するドメインとホストの名前",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account": "アカウント",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_New Zealand": "ニュージーランド",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The username for this subscription": "この照会のユーザ名",

  /* This is a generic string used one or more times in the app. */
  "_passcode_string_maximum_failed_attempts_description": "パスコードの入力を失敗する回数がこの数を超えると、デバイス上のすべてのデータが消去（iOS）またはロック（macOS）されます",
  "_passcode_string_failed_attempt_timeout_label": "ログイン失敗後の待ち時間（macOSのみ）",
  "_passcode_string_failed_attempt_timeout_description": "ログイン失敗が最大試行回数を超えた後、再度ログインを受け付けるまでの時間（分単位）",
  "_passcode_string_Force password reset": "パスワードリセットを強制（macOSのみ）",
  "_passcode_string_force_password_reset_description": "次回のユーザ認証時にパスワードリセットを強制します",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User authentication type for the connection": "接続のユーザ認証タイプ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_WEP": "WEP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Level of data encryption applied to the connection": "接続に適用されるデータ暗号化のレベル",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow App Installation": "Appのインストールを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_14A": "14A",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Maximum (128-bit)": "最大（128ビット）",

  /*  */
  "_knob_set_from_servermgr_card_dav_hostname": "ホスト名",

  /*  */
  "_knob_set_from_servermgr_card_dav_port": "ポート",

  /*  */
  "_knob_set_from_servermgr_helper": "このペイロードはServerアプリケーションを使用して構成されます",

  /*  */
  "_knob_set_from_servermgr_cal_dav_hostname": "ホスト名",

  /*  */
  "_knob_set_from_servermgr_cal_dav_port": "ポート",

  /*  */
  "_knob_set_from_servermgr_email_group_incoming_mail": "受信メール",

  /*  */
  "_knob_set_from_servermgr_email_account_description": "アカウントの説明",

  /*  */
  "_knob_set_from_servermgr_email_account_type": "アカウントの種類",

  /*  */
  "_knob_set_from_servermgr_email_incoming_hostname": "メールサーバ",

  /*  */
  "_knob_set_from_servermgr_email_incoming_port": "ポート",

  /*  */
  "_knob_set_from_servermgr_email_outgoing_ssl": "SSLを使用",

  /*  */
  "_knob_set_from_servermgr_email_outgoing_hostname": "メールサーバ",

  /*  */
  "_knob_set_from_servermgr_email_group_outgoing_mail": "送信メール",

  /*  */
  "_knob_set_from_servermgr_email_incoming_ssl": "SSLを使用",

  /*  */
  "_knob_set_from_servermgr_email_outgoing_port": "ポート",

  /*  */
  "_knob_set_from_servermgr_email_incoming_authentication": "認証のタイプ",

  /*  */
  "_knob_set_from_servermgr_email_outgoing_authentication": "認証のタイプ",

  /*  */
  "_knob_set_from_servermgr_cal_dav_account_description": "アカウントの説明",

  /*  */
  "_knob_set_from_servermgr_card_dav_account_description": "アカウントの説明",

  /*  */
  "_knob_set_from_servermgr_cal_dav_ssl": "SSLを使用",

  /*  */
  "_knob_set_from_servermgr_card_dav_ssl": "SSLを使用",

  /*  */
  "_knob_set_from_servermgr_ichat_hostname": "サーバのアドレス",

  /*  */
  "_knob_set_from_servermgr_ichat_port": "ポート",

  /*  */
  "_knob_set_from_servermgr_ichat_connection_name": "アカウントの説明",

  /*  */
  "_knob_set_from_servermgr_ichat_connection_type": "アカウントの種類",

  /*  */
  "_knob_set_from_servermgr_passcode_required": "デバイスのパスコードが必要",

  /*  */
  "_knob_set_from_servermgr_passcode_allow_simple": "単純値を許可",

  /*  */
  "_knob_set_from_servermgr_passcode_min_length": "最小のパスコード長",

  /*  */
  "_knob_set_from_servermgr_passcode_require_alphanumeric": "英数字の値が必要",

  /*  */
  "_knob_set_from_servermgr_passcode_min_complex": "複合文字の最小数",

  /*  */
  "_knob_set_from_servermgr_passcode_max_age": "パスコードの有効期限",

  /*  */
  "_knob_set_from_servermgr_passcode_auto_lock": "自動ロック",

  /*  */
  "_knob_set_from_servermgr_passcode_yes": "はい",

  /*  */
  "_knob_set_from_servermgr_passcode_no": "いいえ",

  /*  */
  "_knob_set_from_servermgr_passcode_none": "なし",

  /*  */
  "_knob_set_from_servermgr_passcode_never": "しない",

  /*  */
  "_knob_set_from_servermgr_passcode_1_minute": "1分",

  /*  */
  "_knob_set_from_servermgr_passcode_n_minutes": "%@1分",

  /*  */
  "_knob_set_from_servermgr_ichat_connection_type_jabber": "Jabber",

  /*  */
  "_knob_set_from_servermgr_ichat_connection_type_not_jabber": "Jabber以外",

  /*  */
  "_knob_set_from_servermgr_vpn_server": "サーバ",

  /*  */
  "_knob_set_from_servermgr_vpn_use_shared_secret": "共有シークレットを使用",

  /*  */
  "_knob_set_from_servermgr_vpn_send_proxy_setup": "プロキシ設定",

  /*  */
  "_knob_set_from_servermgr_vpn_send_all_traffic": "すべてのトラフィックを送信",

  /*  */
  "_knob_set_from_servermgr_vpn_user_auth": "ユーザ認証",

  /*  */
  "_knob_set_from_servermgr_vpn_connection_name": "接続名",

  /*  */
  "_knob_set_from_servermgr_vpn_connection_type": "接続のタイプ",

  /*  */
  "_knob_set_from_servermgr_email_account_type_pop": "POP",

  /*  */
  "_knob_set_from_servermgr_email_account_imap": "IMAP",

  /*  */
  "_knob_set_from_servermgr_email_account_crammd5": "MD5チャレンジ応答",

  /*  */
  "_knob_set_from_servermgr_email_account_not_crammd5": "MD5チャレンジ応答以外",

  /*  */
  "_import_placeholder_devices_skip": "スキップ",

  /*  */
  "_import_placeholder_devices_create_device_group": "デバイスグループを作成",

  /*  */
  "_import_placeholder_devices_add_to_existing_device_group": "既存のデバイスグループに追加",

  /*  */
  "_truncated_indicator_view_helper": "追加のレコードにアクセスするには検索ボックスを使用します",

  /* First wildcard is the name of the user, second wildcard is the name of the device. */
  "_lab_session_user_on_device": "%@1（%@2）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name of the organization for the profile": "プロファイルの組織名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Organization": "組織",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add Mount Point": "マウントポイントを追加",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can always launch these applications": "ユーザは常にこれらのアプリケーションを起動できます",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Applications": "App",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Don't add to Device Group": "デバイスグループに追加しない",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Files in these folders will sync as specified above": "これらのフォルダ内のファイルは上記の指定に従って同期されます",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Create a new Device Group": "新規デバイスグループを作成",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Items matching any of the following will not sync": "次のいずれかに一致する項目は同期されません",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Creation": "アカウントの作成",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Preference Sync": "環境設定の同期",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_CHAP": "CHAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Dock Applications": "Dockアプリケーション",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can never launch applications in these folders": "ユーザはこれらのフォルダ内のアプリケーションを起動できません",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can always launch applications in these folders": "ユーザは常にこれらのフォルダ内のアプリケーションを起動できます",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Identity Certificate": "固有名証明書",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate names expected from authentication server": "認証サーバが要求する証明書の名前",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Username for connection to the network": "ネットワークに接続するためのユーザ名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Folders:": "フォルダを許可:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Outer Identity": "外部ID",
  "_knobset_string_TLS Minimum Version": "TLSの最小バージョン",
  "_knobset_string_TLS Maximum Version": "TLSの最大バージョン",
  "_interface_knobset_string_tls_version_none": "なし",
  "_interface_knobset_string_tls_version_1.0": "1.0",
  "_interface_knobset_string_tls_version_1.1": "1.1",
  "_interface_knobset_string_tls_version_1.2": "1.2",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Password for the provided username": "指定したユーザ名のパスワード",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Disallow Folders:": "フォルダを禁止:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Inner Authentication": "内部認証",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The files and folders that will appear in the user's dock": "ユーザのDockに表示されるファイルとフォルダ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Widgets": "ウィジェット",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Skip Items": "項目をスキップ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hostname:": "ホスト名:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PAP": "PAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Expiry": "アカウントの有効期限",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Dock Items": "Dockの項目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication protocol (for use only with TTLS)": "認証プロトコル（TTLSとのみ使用）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificates trusted/expected for authentication": "認証用に信頼/要求された証明書",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Request during connection and send with authentication": "接続および認証あり送信で要求",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Externally visible identification (TTLS, PEAP, and EAP-FAST)": "外部可視識別子（TTLS、PEAP、およびEAP-FAST）",

  /* This is a generic string used one or more times in the app. */
  "_ttls_inner_authentication_string_OS Default": "OSデフォルト",
  "_ttls_inner_authentication_string_EAP": "EAP（iOS 9とOS X 10.11の新機能）",
  "_ttls_inner_authentication_string_button_width": "250",
  "_generic_string_MSCHAP": "MSCHAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Method to use to authenticate to the network": "ネットワーク認証の方法",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use Per-Connection Password": "接続ごとにパスワードを使用",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MSCHAPv2": "MSCHAPv2",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Protocols": "プロトコル",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Preferences in these folders will sync as specified above": "これらのフォルダ内の環境設定は上記の指定に従って同期されます",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Trusted Server Certificate Names": "信頼できるサーバ証明書の名前",

  /* This is a generic string used one or more times in the app. */
  '_mobility_knob_set_tab_header_Rules': 'ルール（OS X 10.11以前）',
  'layout_mobility_knob_set_tabs_width': '570',

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Widgets:": "ウィジェットを許可:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Creation": "クリエイション",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The applications that will appear in the user's dock": "ユーザのDockに表示されるアプリケーション",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Trust": "信頼",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can always run these widgets": "ユーザは常にこれらのウィジェットを実行できます",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Trust Exceptions": "信頼例外を許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Home Sync": "ホーム同期",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Applications:": "アプリケーションを許可:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Credentials for connection to the network": "ネットワークに接続するための資格情報",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sync Folders": "フォルダを同期",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Trusted Certificates": "信頼できる証明書",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Protocol:": "プロトコル:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SMB": "SMB",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_NFS": "NFS",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Volume:": "ボリューム:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_AFP": "AFP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Refresh": "更新",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MEID": "MEID",
  "_interface_knobset_allow_two_rands": "2つのRANDを許可",
  "_interface_knobset_allow_two_rands_description": "2つのRAND値のみを提供するサーバからの認証を許可",

  /*  */
  "_admin_welcome_first_time": "ようこそプロファイルマネージャへ！",

  /*  */
  "_admin_welcome_close": "閉じる",

  /*  */
  "_admin_welcome_dont_show_again": "再度表示しない",

  /*  */
  "_no_item_view_is_truncation_indicator": "%@1を探すには検索機能を使用",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Help": "ヘルプ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Log Out": "ログアウト",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show Welcome Panel": "“ようこそ”パネルを表示",

  /*  */
  "_members_picker_refresh_button": "更新",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show Passcode": "パスコードを表示",

  /*  */
  "_show_passcode_the_passcode_is": "パスコード: %@1",

  /*  */
  "_show_passcode_message": "パスコードを表示",

  /*  */
  "_task_cancel_task": "キャンセル",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Send Email": "メールを送信",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Send": "送信",

  "_setting_section_header_macOS, iOS and tvOS": "macOS、iOS、tvOS",
  "_settings_section_header_macOS and iOS": "macOSとiOS",
  "_setting_section_header_iOS and tvOS": "iOSとtvOS",
  "_setting_section_header_mac": "macOS",
  "_setting_section_header_ios": "iOS",
  "_setting_section_header_tvOS": "tvOS",

  /*  */
  "_task_type_remove_profile_with_display_name": "設定を削除: %@1",

  /*  */
  "_profile_1_payload_configured": "1個のペイロード構成",

  /*  */
  "_profile_n_payloads_configured": "%@1個のペイロード構成",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Created ": "作成日 ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Updated ": "更新日 ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Edit": "編集",

  /*  */
  "_items_settings": "%@1の設定",

  /*  */
  "_items_settings_n": "%@1（%@2）の設定",

  /*  */
  "_add_recipients_new_profile": "新規プロファイル",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Go": "移動",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_With Authorization": "認証が必要",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Wi-Fi": "Wi-Fi",

  "_network_interface_type_First Active Ethernet": "第1アクティブEthernet（macOSのみ）",
  "_network_interface_type_Second Active Ethernet": "第2アクティブEthernet（macOSのみ）",
  "_network_interface_type_Third Active Ethernet": "第3アクティブEthernet（macOSのみ）",
  "_network_interface_type_First Ethernet": "第1 Ethernet（macOSのみ）",
  "_network_interface_type_Second Ethernet": "第2 Ethernet（macOSのみ）",
  "_network_interface_type_Third Ethernet": "第3 Ethernet（macOSのみ）",
  "_network_interface_type_Any Ethernet": "任意のEthernet（macOSのみ）",
  "_layout_network_interface_type_width": "250",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_LEAP": "LEAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TTLS": "TTLS",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PEAP": "PEAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication protocols supported on target network": "対象ネットワークでサポートされる認証プロトコル",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_EAP-SIM": "EAP-SIM",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_EAP-AKA": "EAP-AKA",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Provision PAC Anonymously": "PACを匿名でプロビジョニング",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use PAC": "PACを使用",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Configuration of Protected Access Credential (PAC)": "PAC（Protected Access Credential）の構成",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Accepted EAP Types": "受け入れたEAPの種類",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Provision PAC": "PACをプロビジョニング",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_EAP-FAST": "EAP-FAST",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TLS": "TLS",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate Common Name": "証明書コモンネーム",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow trust decisions (via dialog) to be made by the user": "ユーザによる（ダイアログ経由の）信頼決定を許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_CryptoCard (macOS only)": "CryptoCard（macOSのみ）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate (macOS only)": "証明書（macOSのみ）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Kerberos (macOS only)": "Kerberos（macOSのみ）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Portable": "ポータブル",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allowances": "許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow URLs:": "URLを許可:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Power Adapter": "電源アダプタ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Content Filtering": "コンテンツフィルタ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Preferences": "環境設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Battery": "バッテリー",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Battery Menu": "バッテリーメニュー",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Media": "メディア",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Curfews": "夜間の使用禁止",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Desktop": "デスクトップ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Time Limits": "時間制限",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Schedule": "スケジュール",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can always access sites at these URLs": "ユーザは常にこれらのURLのサイトにアクセスできます",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Deny URLs:": "URLを拒否:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Functionality": "機能",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow only these URLs:": "次のURLのみ許可:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Media Content": "メディアコンテンツ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can never access sites at these URLs": "ユーザはこれらのURLのサイトにアクセスできません",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can only access sites at these URLs": "ユーザはこれらのURLのサイトにのみアクセスできます",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Parental Controls": "ペアレンタルコントロール",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Software Update": "ソフトウェア・アップデート",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Universal Access": "アクセシビリティ",

  "_generic_string_Accessibility": "アクセシビリティ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Keyboard": "キーボード",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sound": "サウンド",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Mouse": "マウス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Displays": "ディスプレイ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_FibreChannel": "Fibre Channel",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sharing": "共有",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Startup Disk": "起動ディスク",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Dock": "Dock",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Energy Saver": "省エネルギー",

  /* This is a generic string used one or more times in the app. */
  '_system_pref_pane_name_Siri': 'Siri',
  '_system_pref_pane_name_Dictation & Speech': '音声入力と読み上げ',

  "_generic_string_Extensions": "機能拡張",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Profiles": "プロファイル",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Internet Accounts": "インターネットアカウント",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Desktop & Screen Saver": "デスクトップ/スクリーンセーバ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Accounts": "ユーザとグループ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Notifications": "通知",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Printers & Scanners": "プリンタとスキャナ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ink": "Ink",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Trackpad": "トラックパッド",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Localization": "言語とテキスト",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Xsan": "Xsan",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_CDs & DVDs": "CDとDVD",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Security": "セキュリティとプライバシー",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Time Machine": "Time Machine",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Date & Time": "日付と時刻",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MobileMe": "MobileMe",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Expose": "Exposé",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Appearance": "一般",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Bluetooth": "Bluetooth",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add in Certificate payload": "証明書ペイロードに追加",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Match Domain or Host": "該当するドメインまたはホスト",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_On Demand Action": "要求があったときの処理",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Not Configured": "未設定",

  "_macos_system_pref_pane_label_Touch ID": "Touch ID",
  "_macos_system_pref_pane_label_Wallet": "WalletとApple Pay",

  // KNOB SET ADD 1b
  /*  */
  "_subscribed_calendar_knob_set_num_lines": "1",

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
  "_login_window_knob_set_num_lines": "1",

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
  "_generic_string_Label": "ラベル",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Choose...": "選択…",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Displays the web clip as a full screen application": "Webクリップをフルスクリーンアプリケーションで表示します",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable removal of the Web Clip": "Webクリップを削除することを許可します",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The icon will be displayed with no added visual effects": "このアイコンは視覚エフェクトなしで表示されます",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Image was too large, returned empty string": "イメージが大きすぎました。空の文字列が返されました",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The URL to be displayed when opening the Web Clip": "Webクリップを開いたときに表示されるURL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Full Screen  (iOS only)": "フルスクリーン（iOSのみ）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Removable  (iOS only)": "リムーバブル（iOSのみ）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The name to display for the Web Clip": "Webクリップに表示する名前",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Precomposed Icon  (iOS only)": "作成済みアイコン（iOSのみ）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The icon to use for the Web Clip": "Webクリップに使用するアイコン",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ou=MyDepartment, o=My Company": "ou=MyDepartment, o=My Company",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Exchange ActiveSync (iOS only)": "Exchange ActiveSync（iOSのみ）",
  "_generic_string_Exchange ActiveSync": "Exchange ActiveSync",
  /* This is a generic string used one or more times in the app. */
  "_generic_string_Exchange Web Services (macOS only)": "Exchange Web Services（macOSのみ）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My Search": "マイ検索",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow use of iTunes Store": "iTunes Storeの使用を許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow use of Safari": "Safariの使用を許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow installing apps": "Apple ConfiguratorおよびiTunesからのAppのインストールを許可",
  "_restriction_string_Allow app installation from App Store": "App StoreからのAppのインストールを許可（監視対象デバイスのみ）",
  "_restrictions_string_Allow automatic app downloads": "Appの自動ダウンロードを許可（監視対象のみ）",
  "_restrictions_string_Allow automatic app updates": "Appの自動アップデートを許可（監視対象のみ）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow removing apps": "Appの削除を許可（監視対象のみ）",
  "_restriction_string_Allow removing system apps": "システムAppの削除を許可（監視対象のみ）",

  /* This is a generic string used one or more times in the app. */
  "_restrictions_string_Allow internet results in Spotlight": "Spotlightの検索候補を許可",
  '_ios_restrictions_knob_set_Allow Siri Suggestions': 'Siriの検索候補を許可',
  '_restrictions_string_Allow sending diagnostic and usage data to Apple': 'Appleへの診断情報と使用状況データの送信を許可',
  '_restrictions_string_Allow modifying diagnostics settings': '診断設定の変更を許可（監視対象のみ）',
  "_restrictions_string_Allow Screen Time": "スクリーンタイムを許可（監視対象のみ）",
  "_restriction_string_Allow modifying notifications settings": "通知設定の変更を許可（監視対象のみ）",
  "_restriction_string_Allow passcode modification": "パスコードの変更を許可（監視対象のみ）",
  "_restriction_string_allow_modifying_touchid": "Touch IDの指紋 / Face IDの顔の変更を許可（監視対象のみ）",
  "_ios_restriction_string_Allow Touch ID to unlock device": "Touch ID / Face IDによるデバイスロック解除を許可",
  "_ios_restriction_string_Allow password AutoFill (supervised only)": "パスワードの自動入力を許可（監視対象のみ）",
  "_ios_restriction_string_Require Face ID authentication for AutoFill (supervised only, Face ID only)": "自動入力でTouch ID / Face IDによる認証を要求（監視対象のみ）",
  "_mac_restriction_string_Allow Touch ID to unlock device": "Touch IDによるデバイスロック解除を許可",
  "_mac_restriction_string_Allow proximity based password sharing requests": "近接通信によるパスワード共有要求を許可",
  "_mac_restriction_string_Allow password sharing": "パスワードの共有を許可",
  "_mac_restriction_string_Allow password AutoFill": "パスワードの自動入力を許可",
  "_restriction_string_Allow password sharing": "パスワードの共有を許可（監視対象のみ）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sets the region for the ratings": "制限指定の地域を設定します",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_DNS Name": "DNS名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow use of YouTube": "YouTubeの使用を許可（iOS 5以前）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_R": "R",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_P": "P",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_An NT principal name for use in the certificate request": "証明書の要求に使用するNTプリンシパル名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_NT Principal Name": "NTプリンシパル名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allowed content ratings": "許可されるコンテンツの制限指定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_G": "G",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_C": "C",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_RFC 822 Name": "RFC 822名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The value of a subject alternative name": "サブジェクト代替名の値",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_M": "M",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sets the maximum allowed ratings": "許可する最大制限指定を設定します",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable JavaScript": "JavaScriptを有効にする",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Block pop-ups": "ポップアップを開かない",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow automatic sync while roaming": "ローミング中の自動同期を許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV Shows:": "テレビ番組:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Uniform Resource Identifier": "URI（Uniform Resource Identifier）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Subject Alternative Name Value": "サブジェクト代替名の値",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow voice dialing": "デバイスのロック中も音声ダイヤルを許可",

  /* This is a generic string used one or more times in the app. */
  "_restriction_string_Block Cookies": "Cookieをブロック",
  "_restriction_string_block_cookies_Always Block": "常にブロック",

  "_generic_string_Autonomous Single App Mode (Supervised Only)": "自律的シングルAppモード（監視対象のみ）",
  "_generic_string_Allow these apps to enter Single App Mode": "これらのAppのシングルAppモードへの移行を許可",
  "_restrictions_string_Restrict App Usage": "Appの使用を制限（監視対象のみ）",
  "_restrictions_restrict_app_usage_string_Allow All Apps": "すべてのAppを許可",
  "_restrictions_restrict_app_usage_string_Allow Some Apps Only": "一部のAppのみを許可",
  "_restrictions_restrict_app_usage_string_Restrict Some Apps": "一部のAppを許可しない",
  "_restrictions_layout_restrict_app_usage_width": "200",
  "_restrictions_string_Allow Web Clips": "Webクリップを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Movies:": "ムービー:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_U": "U",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow screen capture": "スクリーンショットと画面収録を許可",
  '_generic_string_Allow screen observation by Classroom': '“クラスルーム”によるAirPlayと“画面を表示”を許可',
  '_generic_string_Allow screen viewing by Classroom': '“クラスルーム”にプロンプトなしでのAirPlayと“画面を表示”の実行を許可（監視対象のみ）',
  "_restrictions_string_Allow modifying Wallpaper": "壁紙の変更を許可（監視対象のみ）",
  "_restrictions_string_Allow modifying device name": "デバイス名の変更を許可（監視対象のみ）",
  "_restrictions_string_Allow modifying enterprise app trust settings": "エンタープライズAppの信頼設定の変更を許可（監視対象のみ）",
  "_restrictions_string_Force unprompted lock": "“クラスルーム”にプロンプトなしでのAppの制限とデバイスのロックを許可（監視対象のみ）",
  "_restrictions_string_Force unprompted join classes": "“クラスルーム”のクラスにプロンプトなしで自動的に参加（監視対象のみ）",
  "_restrictions_string_Require teacher permission to leave Classroom unmanaged classes (supervised only)": "“クラスルーム”の管理対象外クラスを退席するときに教師の許可を要求（監視対象のみ）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Force fraud warning": "強制的に詐欺警告",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Apps:": "App:",
  "_generic_string_Apps": "App",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The type of a subject alternative name": "サブジェクト代替名のタイプ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable autofill": "自動入力を有効にする",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Force encrypted backups": "強制的に暗号化バックアップ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Subject Alternative Name Type": "サブジェクト代替名のタイプ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow use of camera": "カメラの使用を許可",
  "_mac_restriction_string_Allow use of camera": "カメラの使用を許可",
  '_mac_restriction_string_Allow iCloud Back to My Mac': 'iCloudの“どこでもMy Mac”を許可',
  '_mac_restriction_string_Allow iCloud Find My Mac': 'iCloudの“Macを探す”を許可',
  '_mac_restriction_string_Allow iCloud Mail': 'iCloudのメールを許可',
  '_mac_restriction_string_Allow iCloud Reminders': 'iCloudのリマインダーを許可',
  '_mac_restriction_string_Allow iCloud Bookmarks': 'iCloudのブックマークを許可',
  '_mac_restriction_string_Allow iCloud Notes': 'iCloudのメモを許可',
  '_mac_restriction_string_Allow iCloud Calendars': 'iCloudのカレンダーを許可',
  '_mac_restriction_string_Allow iCloud Contacts': 'iCloudの連絡先を許可',
  "_mac_restriction_string_Allow Content Caching": "コンテンツキャッシュを許可",
  "_mac_restriction_string_Delay Software Updates": "ソフトウェア・アップデートを90日延期",
  "_software_update_string_deferred_date_format": "%y/%m/%dまで延期",
  "_software_update_string_group_deferred_date_format_one_device": "1台のデバイスで%y/%m/%dまで延期",
  "_software_update_string_group_deferred_date_format_multiple_devices": "%@台のデバイスで%y/%m/%dまで延期",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ratings region": "制限指定の地域設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow explicit music, podcasts, and iTunes U": "不適切なミュージック、Podcast、iTunes Uの再生を許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Path of item": "項目のパス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Settings for Dock behavior and appearance": "Dockの動作と外観の設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Right": "右",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add other folders:": "ほかのフォルダを追加:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Network Home": "ネットワークホーム",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Display Settings": "表示設定",

  "_dock_setting_Minimize windows into application icon": "ウインドウをアプリケーションアイコンにしまう",
  "_dock_setting_Automatically hide and show the Dock": "Dockを自動的に表示/非表示",
  "_dock_setting_Show indicators for open apps": "起動済みのアプリケーションにインジケータを表示",
  "_dock_setting_Show recent apps in Dock": "最近使用したAppをDockに表示",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My Applications": "自分のアプリケーション",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authenticate selected share point with user's login name and password": "選択した共有ポイントをユーザの名前とパスワードで認証",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User may press Shift to keep items from opening": "Shiftキーを押して項目を開かないようにすることをユーザに許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The network volumes that will be mounted at login": "ログイン時にマウントされるネットワークボリューム",
  "_generic_string_The network volumes that will be mounted using user's login name and password for authentication": "ユーザのログイン名とパスワードを使用して認証されるネットワークマウント",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Items": "項目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User may add and remove additional items": "その他の項目の追加と削除をユーザに許可する",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authenticated Network Mounts": "認証済みネットワークマウント",
  "_generic_string_Network Mounts": "ネットワークマウント",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add network home share point": "ネットワークホーム共有ポイントを追加",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The files and folders that will open at login": "ログイン時に開かれるファイルとフォルダ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add a network accessible volume to mount at login.": "ログイン時にマウントするネットワーク接続可能なボリュームを追加。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hours": "時間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require computer master password": "コンピュータのマスターパスワードを要求",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_in background": "バックグラウンド",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Manually": "手動",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show status in menu bar": "メニューバーに状況を表示",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Full Path": "フルパス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_at login": "ログイン時",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Days": "日",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Setting this value to 0 causes the mobile account to be deleted as soon as possible.": "この値を0に設定すると、削除できる状態になったモバイルアカウントはすぐに削除されます。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Encrypt contents with FileVault": "FileVaultを使って内容を暗号化",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_RegEx Name": "正規表現名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Partial Path": "部分パス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MB": "MB",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Restrict size:": "サイズを制限:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Home folder location:": "ホームフォルダの場所:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Starts With": "前方一致",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Create home using:": "ホームの作成に使用:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Delete mobile accounts:": "モバイルアカウントを削除:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_at logout": "ログアウト時",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Create mobile account when user logs in to network account": "ユーザがネットワークアカウントにログインするときにモバイルアカウントを作成",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ends With": "で終わる",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_network home and default sync settings": "ネットワークホーム",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use computer master password, if available": "コンピュータのマスターパスワードを使用（ある場合）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Every": " ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sync:": "同期:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_minutes": "分",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_to percentage of network home quota:": "ネットワークホームのクオータ比:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Delete only after successful sync": "正しく同期された後にのみ削除（OS X 10.11以前）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show \"Don't ask me again\" checkbox": "“次回から確認しない”チェックボックスを表示",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Weeks": "週間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_local home template": "ローカル・ホーム・テンプレート",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sync in the background:": "バックグラウンドで同期:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name Is": "名前(完全一致)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_after user's last login": "後（ユーザの前回のログイン後）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_manually": "手動",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_at path:": "パス:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_RegEx Path": "正規表現のパス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%": "%",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_to fixed size:": "固定のサイズ:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Merge with user's settings": "ユーザ設定と結合",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_on startup volume": "起動ボリューム",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name Contains": "名前(部分一致)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require confirmation before creating mobile account": "モバイルアカウントを作成する前に確認を要求",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_New directory path": "新しいディレクトリパス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Font Name:": "フォント名:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require an administrator password": "管理者のパスワードを要求",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Font Size:": "サイズ:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Default Printer:": "デフォルト:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Checked printers require an administrator password": "チェックを付けたプリンタには管理者パスワードが必要です",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Include MAC address": "MACアドレスを含める",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow user to modify printer list": "ユーザによるプリンタリストの変更を許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow printers that connect directly to user's computer": "ユーザのコンピュータに直接接続するプリンタを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Print page footer (user name and date)": "ページフッタ（ユーザ名と日付）をプリント",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Times": "Times",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Settings for the optional footer applied to pages": "ページに適用するオプションのフッタの設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Lucida Grande": "ヒラギノ角ゴ Pro",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Helvetica": "Helvetica",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Only show managed printers": "管理対象のプリンタのみを表示",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Courier": "Courier",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Footer Settings": "フッタ設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_AirDrop:": "AirDrop:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Recordable Discs:": "記録可能ディスク:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_DVD-RAM:": "DVD-RAM:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Directory Path": "ディレクトリパス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access settings for network media": "ネットワークメディアのアクセス設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow only the following Dashboard widgets to run": "次のDashboardウィジェットのみ実行を許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Eject at logout": "ログアウト時に取り出す",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable All": "すべて有効",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access settings for hard disk media": "ハードディスクメディアのアクセス設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Network Access": "ネットワークアクセス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_DVDs:": "DVD:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require Authentication": "認証が必要",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The selected items are enabled in System Preferences": "選択した項目は“システム環境設定”で有効になっています",

  "_generic_string_System Preference Panes": "システム環境設定パネル",

  "_generic_string_Third-party Preference Panes": "サードパーティの環境設定パネル",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable None": "すべて無効",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_CDs & CD-ROMs:": "CD & CD-ROM:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Read-Only": "読み出し専用",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Restrict items in system preferences": "“システム環境設定”の項目を制限",
  "_generic_string_enable selected items": "選択した項目を有効にする",
  "_generic_string_disable selected items": "選択した項目を無効にする",
  "_generic_string_Select None": "すべて選択解除",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require admin password to install or update apps": "Appのインストールまたはアップデート時に管理者パスワードを要求",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Restrict which applications are allowed to launch": "起動を許可するアプリケーションを制限",

  "_generic_string_Restrict App Store to MDM installed apps and software updates": "App StoreをMDMでインストールしたAppとソフトウェア・アップデートに制限",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Disc Media Access": "ディスクメディアへのアクセス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access settings for removable disc media": "リムーバブル・ディスク・メディアのアクセス設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hard Disk Media Access": "ハードディスクメディアへのアクセス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Internal Disks:": "内蔵ディスク:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Eject all removable media at logout": "ログアウト時にすべてのリムーバブルメディアを取り出します",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_External Disks:": "外部ディスク:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_always": "常にする",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_establish": "確立",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_never": "常にしない",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_default": "デフォルト",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Get Root Certificate": "ルート証明書を取得",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prevent computer access during the specified days and hours.": "指定した曜日と時間にコンピュータを使用することを禁止します。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Friday and Saturday": "金曜日と土曜日",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_From:": "",
  "_layout_curfews_from:_left": "20",
  "_layout_curfews_to:_left": "215",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_allowing access to the following websites only": "次のWebサイトにのみアクセスを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Weekends": "週末",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Deny Access": "アクセスを拒否",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_trying to limit access to adult websites": "アダルトサイトへのアクセスを制限",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow computer access Monday through Friday for the specified number of hours only.": "月曜日から金曜日の指定した時間だけコンピュータを使用することを許可します。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_30 min": "30分",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Disk Images:": "ディスクイメージ:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_AM": "午前",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PM": "午後",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sunday through Thursday": "日曜日〜木曜日",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Limit Access to websites by": "Webサイトへのアクセスを制限",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_:": ":",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow computer access Saturday and Sunday for the specified number of hours only.": "土曜日と日曜日の指定した時間だけコンピュータを使用することを許可します。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Weekdays": "平日",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_8 hr": "8時間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hide profanity in Dictionary": "辞書と音声入力に含まれる不適切な単語を表示しない",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_to:": "〜",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enforce Limits": "制限を適用",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Limit computer use to:": "コンピュータの使用を制限:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Download": "ダウンロード",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Please correct the error before continuing.": "続ける前に、エラーを修正してください。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Please correct the errors before continuing.": "続ける前に、エラーを修正してください。",

  /* Add an item */
  "_prefs_list_items_count": "（%@1項目）",
  "_prefs_list_item_count": "（1項目）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Boolean": "ブール式",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Value": "値",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Property List Values": "プロパティリスト値",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Preference Domain": "環境設定ドメイン",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Array": "配列",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Delete Item": "項目を削除",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Dictionary": "辞書",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_String": "文字列",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Data": "データ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Date": "日付",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The name of a preference domain (com.company.application)": "環境設定ドメインの名前（com.company.application）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Key": "キー",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Number": "数値",

  /* Add an item */
  "_prefs_button_title_Add Item": "項目を追加",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Key value pairs for settings in the specified domain": "指定したドメインの設定に使用する鍵/値ペア",

  /* Add a child node */
  "_prefs_button_title_Add Child": "子を追加",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_New Item": "新規項目",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No Data": "なし",

  /*  */
  "_temporary_iphone_ipod_blocker_label": "iPad/コンピュータでプロファイルマネージャを使用。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Upload...": "アップロード",

  /* This is a generic string used one or more times in the app. */

  "_generic_string_Upload File": "アップロード…",

  "_generic_string_About Server": "Serverについて",
  "_generic_string_Go to My Devices": "マイデバイスに移動",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Configurations options for 802.1X network authentication": "802.1Xネットワーク認証の構成オプション",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Network Security Settings": "ネットワークセキュリティ設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No applicable Certificate payload is configured": "適用可能な証明書ペイロードは構成されていません",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_hostname": "ホスト名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No applicable Certificate or SCEP payload is configured": "適用可能な証明書またはSCEPペイロードは構成されていません",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authorization Password": "認証パスワード",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Brief explanation of the content or purpose of the profile": "プロファイルの内容や目的の概要",

  /* This is a generic string used one or more times in the app. */
  '_privacy_knob_set_string_send_diagnostic_and_usage': 'Appleへ診断情報および使用状況データを送信し、Appデベロッパとクラッシュデータを共有',

  /*  */
  "_privacy_knob_set_num_lines": "2",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Guest User": "ゲストユーザを許可",

  "_generic_string_Screen Saver": "スクリーンセーバ",
  "_generic_string_Idle time before screen saver starts": "スクリーンセーバが起動するまでの待機時間",

  "_screen_saver_Never": "しない",
  "_screen_saver_1 Minute": "1分後に",
  "_screen_saver_2 Minutes": "2分後に",
  "_screen_saver_5 Minutes": "5分後に",
  "_screen_saver_10 Minutes": "10分後に",
  "_screen_saver_20 Minutes": "20分後に",
  "_screen_saver_30 Minutes": "30分後に",
  "_screen_saver_1 Hour": "1時間後に",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Start screen saver after:": "スクリーンセーバを開始:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Combine available workgroup settings": "利用可能なワークグループ設定を結合",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Local-only users may log in": "ローカルだけのユーザにはログインを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable external accounts": "外部アカウントを有効にする",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Computer administrators may refresh or disable management": "コンピュータ管理者が管理を更新または無効することを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No file uploaded": "ファイルはアップロードされませんでした",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_• Set EnableMCXLoginScripts to TRUE.": "• EnableMCXLoginScriptsをTRUEに設定します。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show \"Other…\"": "“その他…”を表示",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Set computer name to computer record name": "コンピュータ名をコンピュータレコード名に設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_minutes of inactivity": "分間続いたらロック（最低3分）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Logout Script:": "ログアウト:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Style:": "表示:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable >console login": "コンソールログインを有効にする",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show computer's administrators": "コンピュータの管理者を表示",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Login Screen Preferences": "ログイン画面環境設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The above settings require specific properties in the file ~root/Library/Preferences/com.apple.loginwindow.plist, located on the client computer:": "上の設定を使用するには、クライアントコンピュータ上のファイル ~root/Library/Preferences/com.apple.loginwindow.plistで、特定のプロパティを設定する必要があります。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show password hint when needed and available": "パスワードのヒントが指定されている場合は必要に応じて表示",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ignore workgroup nesting": "ワークグループの入れ子を無視",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Login Script:": "ログイン:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name": "名前",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_IP Address": "IPアドレス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Settings for the behavior of the system while at the login screen": "ログイン画面でのシステムの動作の設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Local-only users use available workgroup settings": "ローカルだけのユーザは利用可能なワークグループ設定を使用",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Time": "時間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show mobile accounts": "モバイルアカウントを表示",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Also execute the client computer's LoginHook script": "クライアントコンピュータのLoginHookスクリプトも実行",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable Fast User Switching": "ファストユーザスイッチを有効にする",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Message:": "伝言:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show network users": "ネットワークユーザを表示",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_• Set MCXScriptTrust to match the binding settings used to connect the client computer to the directory domain.": "• クライアントコンピュータをディレクトリドメインに接続するときに使用するバインド設定と一致するようにMCXScriptTrustを設定します。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Log out users after:": "操作しない状態が:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Directory Status": "ディレクトリ状況",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use screen saver module at path:": "使用するスクリーンセーバモジュールのパス:",

  /* This is a generic string used one or more times in the app. */
  "_login_window_knob_set_string_Show the Shut Down button": "“システム終了”ボタンを表示",
  "_login_window_knob_set_string_Show the Restart button": "“再起動”ボタンを表示",
  "_login_window_knob_set_string_Show the Sleep button": "“スリープ”ボタンを表示",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Always show workgroup dialog during login": "ログイン時にワークグループのダイアログを常に表示",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show local users": "ローカルユーザを表示",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Heading:": "見出し:",

  "_generic_string_Show additional information in the menu bar": "詳細な情報をメニューバーに表示",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name and password text fields": "名前とパスワードのテキストフィールド",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Disable automatic login": "自動ログインを使用不可にする",
  "_generic_string_Banner": "バナー",
  "_generic_string_Show the host name, macOS version and IP address when the menu bar is clicked.": "メニューバーをクリックするとホスト名、macOSバージョン、IPアドレスが表示されます。",
  "_generic_string_Login Prompt": "ログインプロンプト",
  "_generic_string_A message displayed above the login prompt.": "ログインプロンプトの上に表示されるメッセージです。",
  "_generic_string_The display style and related options of the login prompt.": "ログインプロンプトの表示スタイルと関連オプションです。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Version": "バージョン",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Also execute the client computer's LogoutHook script": "クライアントコンピュータのLogoutHookスクリプトも実行",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_List of users able to use these computers": "これらのコンピュータを使用できるユーザのリスト",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Create a placeholder record for a device.": "デバイスのプレースホルダレコードを作成します。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%@1 minutes": "%@1分",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 hour ": "1時間 ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%@1 hours": "%@1時間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%@ hours and 30 minutes": "%@時間30分",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%@ hours": "%@時間",
  "_generic_string_1.5 hours": "1.5時間",
  "_generic_string_%@.5 hours": "%@.5時間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 hour and 30 minutes": "1時間30分",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_30 minutes": "30分",

  /* This is the number of pixels the width of the "Log out users after:" string takes up in the UI. */
  "_log_out_users_after_text_width": "117",

  "_screen_saver_idle_time_popup_width": "100",

  /* This is the number of pixels the width of the "Start screen saver after:" string takes up in the UI. */
  "_start_screen_saver_after_text_width": "175",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%@ certificate": "%@の証明書",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Code Signing": "コード署名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SSL": "SSL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Download Trust Profile": "信頼プロファイル…",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No Certificate payload is configured": "証明書ペイロードは構成されていません",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The domain of the account": "アカウントのドメイン",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user of the account": "アカウントのユーザ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The domain of the account. Leave Domain and User blank to set user on device": "アカウントのドメイン。デバイス上で設定する場合は空のままにします",

  /* This is a generic string used one or more times in the app. */
  "_exchange_username_string_autopush": 'オプションドメイン付きのアカウントを持つユーザ（例: “user”または“domain\\user”）',
  "_generic_string_The user of the account. Leave Domain and User blank to set user on device": "アカウントのユーザ。デバイス上で設定する場合は空のままにします",

  /*  */
  "_new_task_passcode_was_not_six_digit_number": "パスコードが6桁の数字ではありません",

  /*  */
  "_admin_detail_tab_width": "100",

  /*  */
  "_members_picker_example_view_display_name_width": "220",

  /*  */
  "_members_picker_example_view_add_remove_button_width": "80",

  /*  */
  "_system_items_picker_done_button_width": "81",

  /*  */
  "_new_auto_join_profile_width": "150",

  /*  */
  "_admin_sidebar_default_and_min_thickness": "200",
  '_layout_search_field_tip_height': '16',

  /*  */
  "_admin_payload_type_scroll_width": "250",

  /*  */
  "_user_dropdown_menu_width": "215",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Download the Configuration Profile \"Trust Profile for %@\" and install it on your devices to configure them to trust this server's certificates": "構成プロファイル“%@の信頼プロファイル”をダウンロードしてデバイスにインストールし、このサーバの証明書を信頼するようにデバイスを構成します",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authenticate with credentials obtained from the target machine's record in the directory": "このディレクトリで対象コンピュータのレコードから取得した資格情報を使用して認証",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use Directory Authentication": "ディレクトリ認証を使用",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authenticate with the target machine's directory credentials": "対象コンピュータのディレクトリ資格情報を使用して認証",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_set by directory": "ディレクトリごとに設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Trust Profile for %@": "%@の信頼プロファイル",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Download the Configuration Profile \"Trust Profile for %@\" and install it on your devices to configure them to trust this server's certificates.": "構成プロファイル“%@の信頼プロファイル”をダウンロードしてデバイスにインストールし、このサーバの証明書を信頼するようにデバイスを構成します。",

  /* This is a generic string used one or more times in the app. */
  '_download_trust_profile_description': "構成プロファイル“%@の信頼プロファイル”をダウンロードしてiOS、tvOSおよびmacOSデバイスにインストールし、このサーバを信頼するようにデバイスを構成します。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Icon": "アイコン",

  /* This is the width of the labels next to the buttons in iOS Restrictions > Media Control > for Movies, TV Shows, and Apps */
  "_layout_allowed_content_button_labels_width": "100",

  /* This is the combination of first/given name and last/family name. %@1 is first/given and %@2 is last/family. */
  "_user_first_name_last_name": "%@2 %@1",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Wake for Ethernet network administrator access": "Ethernetネットワーク管理者のアクセスによってスリープを解除",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Monday": "月曜日",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sleep Options": "スリープのオプション",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 min": "1分",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_3 hr": "3時間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Put the computer to sleep after a period of inactivity": "一定の待機時間が経過した後にコンピュータをスリープ状態にする",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Start up automatically after a power failure": "停電後に自動的に起動",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Saturday": "土曜日",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Friday": "金曜日",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Put the hard disk(s) to sleep whenever possible": "可能な場合はハードディスクをスリープさせる",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Every Day": "毎日",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sunday": "日曜日",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sleep": "スリープ",
  "_energy_saver_schedule_string_Restart": "再起動",
  "_generic_string_Shut Down": "システム終了",

  "_generic_string_1 hr": "1時間",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Put the display(s) to sleep after:": "ディスプレイのスリープ:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Thursday": "木曜日",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_15 min": "15分",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Other Options": "その他のオプション",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Wednesday": "水曜日",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Settings for waking the computer from sleep": "コンピュータのスリープ解除の設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow power button to sleep the computer": "パワーボタンを使用してコンピュータをスリープできるようにする",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Additional power settings for the computer": "コンピュータの追加電源設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Put the computer to sleep after:": "コンピュータのスリープ:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Tuesday": "火曜日",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Start up the computer:": "コンピュータを起動:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Wake Options": "スリープ解除のオプション",

  /* This is the width of the Hide Columns for the Login Items payload type. */
  "_layout_hide_column_width": "60",

  /* This is the width of the two radio buttons under Settings > Mobility > Rules > Options > Sync in the backgound */
  "_layout_mobility_rules_options_sync_in_background_width": "95",
  "_mobility_path_at_textField_offset_left": "117",


  /* This is a generic string used one or more times in the app. */
  "_generic_string_All Users": "すべてのユーザ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Force FIPS verification": "FIPS検証を強制的に実行",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_App Store": "App Store",
  "_generic_string_Allow iCloud documents & data": "iCloudの書類とデータを許可",
  "_macos_restriction_string_Allow iCloud Drive": "iCloud Driveを許可",
  "_macos_restriction_string_Allow iCloud Desktop & Documents": "iCloudの“デスクトップ”と“書類”を許可",
  "_generic_string_Allow use of iCloud password for local accounts": "ローカルアカウントのiCloudパスワードの使用を許可",
  "_generic_string_Allow iCloud keychain": "iCloudキーチェーンを許可",
  "_generic_string_Allow managed apps to store data in iCloud": "管理対象AppがiCloudにデータを保存することを許可",
  "_restriction_string_Backup enterprise books": "エンタープライズブックのバックアップを許可",
  "_restriction_string_Sync enterprise books notes and highlights": "エンタープライズブックのメモとハイライトの同期を許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enterprise": "エンタープライズ",
  "_generic_string_Allow My Photo Stream (disallowing can cause data loss)": "マイフォトストリームを許可（許可しないとデータ損失の可能性あり）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Application Library": "アプリケーションライブラリ",
  "_generic_string_Force iTunes password entry for every purchase": "購入したすべての項目のiTunesパスワードを強制",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add applications from the iTunes Store to your library": "アプリケーションをiTunes Storeからライブラリへ追加",
  "_generic_string_Allow iCloud backup": "iCloudバックアップを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add enterprise applications to your library": "エンタープライズAppをライブラリに追加",
  "_generic_string_Require iTunes password for all purchases": "購入時に常にiTunes Storeパスワードを要求",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Application Search": "アプリケーション検索",
  "_generic_string_Allow third-party mail clients": "他社製メールクライアントを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Find apps in the iTunes Store": "iTunes Storeでアプリケーションを検索",
  "_generic_string_Configures proxy settings to be used with this network": "このネットワークで使用されるプロキシ設定を構成します",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Search iTunes": "iTunesを検索",
  "_generic_string_Auto Join": "自動接続",
  '_interface_knobset_string_Disable Captive Network Detection': 'キャプティブネットワーク検出を無効にする（iOSのみ）',
  '_interface_knobset_string_disable_captive_network_description': 'キャプティブ・ネットワーク・アシスタントを表示しません',

  /* This is a generic string used one or more times in the app. */
  "_generic_string_iPad Apps": "iPad App",
  "_generic_string_required": "必須",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_iPhone Apps": "iPhone App",
  "_generic_string_Allow user to move messages from this account": "ユーザがこのアカウントからメッセージを移動することを許可",

  /* More */
  "_general_string_More...": "その他",
  /* This is a generic string used one or more times in the app. */
  "_generic_string_Automatically join this wireless network": "このワイヤレスネットワークに自動的に接続します",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Upload": "アップロード",
  "_generic_string_Messages can be moved out of this email account into another": "このアカウントから別のアカウントにメッセージを移動できます",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Select an application to add to the library": "ライブラリに追加するアプリケーションを選択",
  "_generic_string_Messages can be sent from this account using third-party mail clients": "他社製メールクライアントを使って、このアカウントからメッセージを送信できます",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Select...": "選択…",
  "_generic_string_Hostname or IP address for server": "サーバのホスト名またはIPアドレス",

  "_layout_assign_assets_picker_sheet_width": "800",
  "_layout_directory_item_picker_sheet_width": "660",
  "_layout_pane_cancel_button_offset_right": "120",
  "_layout_download_and_edit_buttons_width": "90",

  /* The width of the box in the Profile tab containing the profile overview showing the payloads contained in it */
  "_layout_admin_profiles_view_box_width": "570",

  /* The width of a payload icon and text label within the profile overview box */
  "_layout_admin_profiles_view_settings_column_width": "170",

  /*  */
  "_layout_heading_popup_select_button_width": "166",

  /*  */
  "_layout_security_type_button_field_width": "203",

  /* The width of the tiny upload button inside Settings > Custom Settings > Property List Values > An item of type Data in the Value column */
  "_layout_cfprefs_line_item_upload_button_width": "90",

  /*  */
  "_layout_cfprefs_upload_file_button_width": "100",

  /* This is the width of the Property List Value Type popup button in the Custom Settings payload editor */
  "_layout_cfprefs_value_type_button_width": "115",
  "_layout_cfprefs_value_label_width": "203",

  /* The width of the Path Prefix string */
  "_layout_path_prefix_width": "92",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Upload selected file": "選択したファイルをアップロード",
  "_generic_string_Device Groups": "デバイスグループ",

  "_generic_string_EduClasses": "クラス",
  "_generic_string_profile_manager_edu_class_genesis_description": "プロファイルマネージャを使用すると、“クラスルーム”アプリケーションを使用するためのクラスを簡単に編成できます。",
  "_generic_string_edu_class name": "クラス名",
  "_generic_string_edu_class location": "場所",
  "_generic_string_edu_class description": "説明",
  "_generic_string_edu_class_info": "クラス情報",
  "_generic_string_New EduClass": "新規クラス",
  "_generic_string_Generate": "生成",
  "_generic_string_Generate New Class Identities": "新しいクラス識別子を生成",
  "_generic_string_Generating new certificates for authentication": "全クラスの教師および生徒用の新しい識別子を生成します。古い識別子のデバイスは、新しい識別子が割り当てられるまで“クラスルーム”で使用できなくなります。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Upload an application to add to the library": "ライブラリに追加するアプリケーションをアップロード",
  "_generic_string_Devices": "デバイス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Install Application": "アプリケーションをインストール",
  "_generic_string_Users": "ユーザ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User Groups": "ユーザグループ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add App": "アプリケーションを追加",
  "_generic_string_Printers": "プリンタ",

  /* This is the width of the Configure button for an unconfigured setting type for a profile. */
  "_layout_no_settings_configure_button": "90",

  /* This is the width of the Add Certificate button, as used in Certificate Settings and Exchange Settings. */
  "_layout_knob_set_view_add_certificate": "120",

  /* This is the width of the Add Item and Delete Item buttons in Settings > Custom Settings */
  "_layout_add_item_and_delete_item_buttons_width": "80",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Edit App List": "アプリケーションリストを編集",
  "_generic_string_at": "",

  /* This is the width of the label text for Login Script and Logout Script found under Settings > Login Window > Scripts. */
  "_layout_login_script_and_logout_script_label_width": "100",

  /* This is the width of the upload buttons found in Settings > Login Window > Scripts. */
  "_layout_scripts_upload_button_width": "100",

  /* Width of Settings > Passcode > Grace Period popup */
  "_layout_grace_period_field": "85",

  /* This is the width of the Enable All and Enable None buttons in Restrictions Settings under Preferences. */
  "_layout_enable_all_and_enable_none_buttons_width": "100",

  /* This is the width of the to fixed size string found in Settings > Mobility > Account Creation > Encrypt contents with FileVault. */
  "_layout_to_fixed_size_radio_width": "156",

  /* This is the width of the to percentage of network home quota string found in Settings > Mobility > Account Creation > Encrypt contents with FileVault. */
  "_layout_to_percentage_of_network_home_quote_radio_width": "272",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Edit Apps": "アプリケーションを編集",
  "_generic_string_Language & Text": "言語とテキスト",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Security & Privacy": "セキュリティとプライバシー",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Users & Groups": "ユーザとグループ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Mail, Contacts & Calendars": "メール/連絡先/カレンダー",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_General": "一般",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Mission Control": "Mission Control",

  /* The width of the Add All and Add Visible button that appears in the lower left corner of various picker sheets. */
  "_layout_add_all_and_add_visible_button_width": "120",

  /* The width of the Settings > Dock > Minimize using popup */
  "_layout_minimize_using_select_button_width": "160",

  /* If needed, this increases the width of most of the UI in settings. When increasing this, be careful it still fits on iPad. */
  "_layout_settings_overall_knob_width": "570",

  /* If needed, this increases the width of restrictions payload UI in settings. When increasing this, be careful it still fits on iPad. */
  "_layout_settings_ios_restrictions_knob_set_width": "610",

  /* This is a generic string used one or more times in the app. */
  "_restrictions_string_Allow Erase All Content and Settings": "“すべてのコンテンツと設定を消去”を許可（監視対象のみ）",
  "_generic_string_Allow accepting untrusted TLS certificates": "信頼されていないTLS証明書の受け入れをユーザに許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow automatic updates to certificate trust settings": "証明書信頼設定の自動アップデートを許可",
  "_restrictions_string_Allow trusting new enterprise app authors": "新しいエンタープライズApp作成者の信頼を許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Remaining Battery Life": "バッテリー残存寿命",
  "Supervised": "監視対象",
  "Shared iPad": "共有iPad",

  "_generic_string_Signed in to iTunes": "iTunesにサインインしています",

  "_generic_string_iCloud Backup": "iCloudバックアップ",
  "_device_detail_string_last_icloud_backup": "前回のiCloudバックアップ",
  "_device_detail_icloud_backup_never": "しない",
  "device_detail_icloud_backup_date_format": "%Y年%B%d日 %p %i:%M",

  "_generic_string_Do Not Disturb": "おやすみモード",

  "_generic_string_Personal Hotspot": "インターネット共有",
  "_generic_string_On": "オン",
  "_generic_string_Off": "オフ",

  "_device_detail_info_string_MDM Lost Mode Enabled": "紛失モードが有効です",
  '_device_detail_info_string_Diagnostics & Usage': '診断と使用状況',
  '_device_detail_info_string_Automatically Send': '自動的に送信',
  "_device_detail_info_string_Don't Send": "送信しない",
  '_device_detail_info_string_App Analytics': 'App解析',

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Send outgoing mail from this account only from Mail app": "このアカウントからの送信メールは“メール”アプリケーションからのみ送信します",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use Only in Mail": "“メール”でのみ使用",
  "_generic_string_Enable S/MIME Signing": "S/MIME署名を有効にする",
  "_smime_option_string_Allow user to enable/disable S/MIME signing": "ユーザによるS/MIME署名の有効/無効化を許可",
  "_smime_option_string_Allow user to modify S/MIME signing certificate": "ユーザによるS/MIME署名証明書の変更を許可",
  "_generic_string_Enable S/MIME Encryption": "S/MIME暗号化をデフォルトで有効にする",
  "_smime_option_string_Allow user to enable or disable S/MIME encryption": "ユーザによるS/MIME暗号化の有効/無効化を許可",
  "_smime_option_string_Allow user to modify S/MIME encryption certificate": "ユーザによるS/MIME暗号化証明書の変更を許可",
  "_generic_string_Signing Certificate": "署名証明書",
  "_generic_string_Certificate used to sign messages sent from this account": "このアカウントから送信するメッセージの署名に使用する証明書",
  "_generic_string_Encryption Certificate": "暗号化証明書",
  "_generic_string_Certificate used to decrypt messages sent to this account": "このアカウントで受信するメッセージの暗号解除に使用する証明書",
  "_smime_per_message_switch_title": "メッセージごとの暗号化切り替えを有効にする",
  "_smime_per_message_switch_title_description": "ユーザが各メッセージを暗号化するかどうかを選択することを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Supported": "対応",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Software Build Version": "ソフトウェア・ビルド・バージョン",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Unknown": "不明",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Supports Managed Apps": "管理対象のアプリケーションに対応",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Requires Re-enrollment": "再登録が必要です",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Requires iOS 5 or later": "iOS 5以降が必要です",

  /* This is a generic string used one or more times in the app. */
  "_unsupported_ios_version_for_app_distribution": "Appの配布を有効にするには、iOSをアップグレードしてこのデバイスを再登録してください。エンタープライズAppを配布するにはiOS 5以降が必要です。VPP Appを配布するにはiOS 9以降が必要です。",
  "_unsupported_osx_version_for_app_distribution": "アプリケーションの配布を有効にするには、OS Xをアップグレードしてこのデバイスを再登録してください。エンタープライズアプリケーションを配布するにはOS X 10.10以降が必要です。VPPアプリケーションを配布するにはOS X 10.11以降が必要です。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Re-enroll this device to enable enterprise application distribution": "Appの配布を有効にするには、このデバイスを再度登録してください。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Siri": "Siriを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Siri while device locked": "デバイスのロック中もSiriを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable Siri profanity filter (supervised only)": "Siriの不適切な単語フィルタを有効にする（監視対象のみ）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No Limit": "制限なし",

  /* This is the width of the Cancel Task button, found in the bottom toolbar when selecting an active task. */
  "_layout_cancel_task_button": "100",

  /* This is the width of the secondary information column for the task list item view */
  "_layout_task_list_item_view_secondary_information_width": "90",

  /* This is the width of the updated at timestamp column for the task list item view */
  "_layout_task_list_item_view_updated_at_width": "130",

  /*  */
  "_no_item_view_no_somethings_widget": "ウィジェットなし",

  "_no_item_view_no_somethings_members": "メンバーなし",
  "_no_item_view_inactive_user_group_members": "制限、設定、Appまたはブックが割り当てられるか、VPPサポートが有効になるまでメンバーは同期されません",
  "_inactive_user_group_members_description_height": "70",

  /*  */
  "_no_item_view_is_truncation_indicator_tasks_complete": "完了したタスクを探すには検索機能を使用",

  /*  */
  "_no_item_view_no_somethings_found_tasks_complete": "完了したタスクが見つかりません",

  /*  */
  "_no_item_view_no_somethings_device": "デバイスなし",

  "_no_item_view_no_airplay_destinations": "AirPlay出力先がありません",

  "_no_item_view_no_somethings_edu_classes": "クラスなし",
  "_no_item_view_no_somethings_apps": "アプリケーションなし",
  "_no_item_view_no_somethings_inhouse_enterprise_apps": "インハウスエンタープライズAppなし",
  "_no_item_view_no_somethings_books": "ブックなし",
  "_no_item_view_no_somethings_inhouse_ebooks": "エンタープライズブックなし",
  "_no_item_view_no_somethings_activity": "アクティビティなし",
  /*  */
  "_no_item_view_no_somethings_found_device_group": "デバイスグループが見つかりません",
  "_no_item_view_no_somethings_found_location": "場所が見つかりません",
  "_no_item_view_no_somethings_found_members": "メンバーが見つかりません",
  "_no_item_view_no_somethings_found_edu_classes": "クラスが見つかりません",

  /*  */
  "_no_item_view_no_somethings_system_application": "アプリケーションなし",

  /*  */
  "_item_list_loading_user_group": "グループを読み込み中…",
  "_item_list_loading_vpp_user_group": "VPP対応のグループを読み込み中…",

  /*  */
  "_no_item_view_no_somethings_found_device": "デバイスが見つかりません",

  /*  */
  "_no_item_view_no_somethings_instructors": "教師なし",
  "_no_item_view_no_somethings_students": "生徒なし",
  "_no_item_view_no_somethings_devices": "デバイスなし",

  /*  */
  "_item_list_loading_widget": "ウィジェットを読み込み中…",

  /*  */
  "_item_list_loading_printer": "プリンタを読み込み中…",

  "_item_list_loading_activity": "アクティビティを読み込み中…",
  "_item_list_loading_members": "メンバーを読み込み中…",
  "_item_list_loading_Apps": "アプリケーションを読み込み中…",
  "_item_list_loading_books": "ブックを読み込み中…",

  /*  */
  "_item_list_loading_classes": "クラスを読み込み中…",
  "_item_list_loading_instructors": "教師を読み込み中…",
  "_item_list_loading_students": "生徒を読み込み中…",
  "_item_list_loading_devices": "デバイスを読み込み中…",

  /*  */
  "_item_list_loading_device_group": "デバイスグループを読み込み中…",
  "_item_list_loading_location": "場所を読み込み中…",

  /*  */
  "_no_item_view_no_somethings_found_tasks_active": "実行中のタスクが見つかりません",

  /*  */
  "_no_item_view_no_somethings_printer": "プリンタなし",

  /*  */
  "_no_item_view_is_truncation_indicator_widget": "ウィジェットを探すには検索機能を使用",

  "_no_item_view_is_truncation_indicator_members": "メンバーを探すには検索機能を使用",
  "_no_item_view_is_truncation_indicator_edu_class": "クラスを探すには検索機能を使用",
  /*  */
  "_no_item_view_is_truncation_indicator_printer": "プリンタを探すには検索機能を使用",

  /*  */
  "_no_item_view_is_truncation_indicator_user_group": "グループを探すには検索機能を使用",
  "_no_item_view_is_truncation_indicator_vpp_user_group": "VPP対応のグループを探すには検索機能を使用",

  /*  */
  "_no_item_view_no_somethings_found_system_application": "Appが見つかりません",
  "_no_item_view_no_somethings_found_books": "ブックが見つかりません",

  "_no_item_view_no_somethings_found_apps": "Appが見つかりません",
  "_no_item_view_no_somethings_found_activity": "アクティビティが見つかりません",

  /*  */
  "_no_item_view_no_somethings_user": "ユーザなし",

  /*  */
  "_no_item_view_is_truncation_indicator_tasks_active": "実行中のタスクを探すには検索機能を使用",

  /*  */
  "_no_item_view_is_truncation_indicator_device": "デバイスを探すには検索機能を使用",

  /*  */
  "_item_list_loading_system_application": "アプリケーションを読み込み中…",

  /*  */
  "_no_item_view_is_truncation_indicator_user": "ユーザを探すには検索機能を使用",

  /*  */
  "_no_item_view_no_somethings_found_user": "ユーザが見つかりません",

  /*  */
  "_no_item_view_is_truncation_indicator_system_application": "アプリケーションを探すには検索機能を使用",

  "_no_item_view_is_truncation_indicator_apps": "アプリケーションを探すには検索機能を使用",

  "_no_item_view_is_truncation_indicator_books": "ブックを探すには検索機能を使用",

  "_no_item_view_is_truncation_indicator_activity": "アクティビティを探すには検索機能を使用",

  /*  */
  "_no_item_view_no_somethings_tasks_complete": "完了したタスクが見つかりません",

  /*  */
  "_no_item_view_no_somethings_found_user_group": "グループが見つかりませんでした",
  "_no_item_view_no_somethings_found_vpp_user_group": "VPP対応のグループが見つかりません",

  /*  */
  "_no_item_view_no_somethings_found_printer": "プリンタが見つかりませんでした",

  /*  */
  "_item_list_loading_device": "デバイスを読み込み中…",

  /*  */
  "_no_item_view_no_somethings_user_group": "グループなし",
  "_no_item_view_no_somethings_vpp_user_group": "VPP対応のグループなし",

  /*  */
  "_no_item_view_no_somethings_found_widget": "ウィジェットが見つかりませんでした",

  /*  */
  "_item_list_loading_tasks_active": "実行中のタスクを読み込み中…",

  /*  */
  "_no_item_view_is_truncation_indicator_device_group": "デバイスグループを探すには検索機能を使用",
  "_no_item_view_is_truncation_indicator_location": "場所を探すには検索機能を使用",

  /*  */
  "_item_list_loading_user": "ユーザを読み込み中…",

  /*  */
  "_no_item_view_no_somethings_tasks_active": "実行中のタスクなし",

  /*  */
  "_item_list_loading_tasks_complete": "完了したタスクを読み込み中…",

  /*  */
  "_no_item_view_no_somethings_device_group": "デバイスグループなし",
  "_no_item_view_no_somethings_location": "場所なし",

  /*  */
  "_uploading_filename": '“%@1”をアップロード中',

  /* This is the width of the Upload button inside the iOS App picker. */
  "_layout_apps_picker_upload_button_width": "140",

  /* This is the width of the menu that appears when you click the Perform Task Button in the bottom toolbar for Library Items. */
  "_layout_toolbar_perform_task_button_menu_width": "300",
  "_layout_toolbar_perform_task_button_with_change_admin_password_menu_width": "300",
  "_layout_toolbar_perform_task_button_menu_width_for_placeholder": "170",
  /* Width of the new task sheet*/
  "_layout_new_task_sheet_width": "550",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_user chooses any volume": "ユーザが任意のボリュームを選択",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_user chooses any external volume": "ユーザが任意の外部ボリュームを選択",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_user chooses any internal volume": "ユーザが任意の内蔵ボリュームを選択",

  /* This is the width of the menu itmes for the iOS Restrictions' Media Content Allowed content ratings popup menus */
  "_layout_allowed_content_popup_menu_items_width": "195",

  /*  */
  "_cfprefs_knob_set_num_lines": "1",

  /*  */
  "_identification_knob_set_name": "識別子",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Spotlight": "Spotlight",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_iCloud": "iCloud",

  /*  */
  "_identification_knob_set_num_lines": "1",

  /*  */
  "_identification_knob_set_description": "",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user enters the password upon profile installation": "ユーザがプロファイルのインストール時にパスワードを入力します",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user display name for the accounts": "アカウントのユーザ表示名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt text for any of the above values": "上のいずれかの値のプロンプトテキスト",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt Message": "プロンプトメッセージ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user name for the accounts": "アカウントのユーザ名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User Enters Password": "ユーザがパスワードを入力",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The email address for the accounts": "アカウントのメールアドレス",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt": "プロンプト",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password for the accounts": "アカウントのパスワード",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Additional descriptive text for the Prompt field": "“プロンプト”フィールドの追加説明テキスト",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Set in Identification": "識別子に設定",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Anywhere": "すべてのアプリケーションを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Do not allow user to override Gatekeeper setting": "ユーザによるGatekeeper設定の無効化を許可しない",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allowed Applications": "許可されたアプリケーション",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Mac App Store": "Mac App Store",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate Server": "証明書サーバ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The name of the CA": "CAの名前",

  /*  */
  "_gatekeeper_knob_set_num_lines": "1",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prevents the user from temporarily overriding the Gatekeeper setting by control-clicking to install any app": "Controlキーを押したままクリックすることによりGatekeeper設定を一時期に無効にして、アプリケーションがインストールされることを防ぎます",
  "_generic_string_Allow user to change password": "ユーザによるパスワード変更を許可",
  "_require_password_restriction_string_head_part_Require password": "スリープとスクリーンセーバの解除にパスワードを要求　開始後:",
  "_layout_require_password_restriction_head_view_width": "410",
  "_layout_require_password_restriction_delay_width": "90",
  '_layout_block_incoming_connection_setting_width': '50',
  "_require_password_restriction_string_password_delay_option_immediately": "すぐに",
  "_require_password_restriction_string_password_delay_option_5 seconds": "5秒後に",
  "_require_password_restriction_string_password_delay_option_1 minute": "1分後に",
  "_require_password_restriction_string_password_delay_option_5 minutes": "5分後に",
  "_require_password_restriction_string_password_delay_option_15 minutes": "15分後に",
  "_require_password_restriction_string_password_delay_option_1 hour": "1時間後に",
  "_require_password_restriction_string_password_delay_option_4 hours": "4時間後に",
  "_require_password_restriction_string_password_delay_option_8 hours": "8時間後に",
  "_require_password_restriction_string_tail_part_after sleep or screen saver begins": "",
  "_generic_string_Allow user to set lock message": "ユーザによるロックメッセージの設定を許可",
  '_macos_restriction_string_allow_autounlock': 'ユーザにApple WatchでMacのロックを解除することを許可',

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Mac App Store and identified developers": "Mac App Storeと確認済みの開発元からのアプリケーションを許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The username with which to authenticate to the certificate server": "証明書サーバへの認証に使用するユーザ名",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt for credentials": "資格情報の入力を要求",

  /*  */
  "_gatekeeper_knob_set_description": "",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt the user for credentials.  This setting is not supported for pushed profiles": "ユーザに資格情報を求めます。これはプッシュ配信プロファイルではサポートされません",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Gatekeeper Settings": "Gatekeeper設定を構成",
  '_privacy_knobset_string_General': '一般',
  '_privacy_knobset_string_Firewall': 'ファイアウォール',
  "_privacy_knob_set_string_Manage Firewall Settings": "ファイアウォール設定を管理",
  '_privacy_knob_set_string_Enable Firewall': 'ファイアウォールを有効にする',
  "_privacy_knob_set_string_Disable Firewall": "ファイアウォールを無効にする",
  '_privacy_knob_set_string_Block all incoming connections': '外部からの接続をすべてブロック',
  '_privacy_knob_set_string_block_incoming_connections_description': 'DHCP、Bonjour、IPSecなどの基本インターネットサービスに必要な機能以外への外部からの接続をすべてブロックします',
  '_privacy_knob_set_string_Enable stealth mode': 'ステルスモードを有効にする',
  '_privacy_knob_set_string_enable_stealth_mode_description': "Pingなど、ICMPを使用するテストアプリケーションによってネットワークからこのコンピュータにアクセスしようとする試みに対して、反応または承認しません",
  '_privacy_knob_set_string_App Specific Incoming Connection Settings': 'App固有の受信接続設定',
  '_privacy_knob_set_string_allow_incoming_connections_header': '外部からの接続を許可/ブロック',

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password with which to authenticate to the certificate server": "証明書サーバへの認証に使用するパスワード",

  /*  */
  "_gatekeeper_knob_set_name": "",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The description of the certificate request as shown in the certificate selector of other payloads such as VPN and Network": "ほかのペイロードの証明書選択で表示される、証明書要求の説明（“VPN”、“ネットワーク”など）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow applications downloaded from:": "ダウンロードしたアプリケーションの実行許可:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Users cannot open an unsigned application ...": "ユーザは未署名のアプリケーションを開くことができません…",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate Authority": "認証局",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate Template": "証明書テンプレート",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The name of the certificate template, usually Machine or User": "証明書テンプレートの名前（通常は“コンピュータ”または“ユーザ”）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The network address of the certificate server": "証明書サーバのネットワークアドレス",

  /* This layout gives the height of the Disable ability to open disallowed applications using the Finder checkbox */
  "_layout_privacy_force_disallow_app_checkbox_height": "20",

  /* This layout gives the height of the Disable ability to open disallowed applications using the Finder checkbox description*/
  "_layout_privacy_force_disallow_app_description_height": "40",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My Messages Account": "自分のメッセージアカウント",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Apple Books (supervised only)": "Apple Booksを許可（監視対象のみ）",

  "_generic_string_Allow Podcasts (supervised only)": "Podcastの使用を許可（監視対象のみ）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow explicit sexual content in Apple Books": "Apple Booksで不適切な性的描写のあるブックの閲覧を許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Shared Albums": "共有アルバムを許可",
  "_restriction_string_allow_cloud_photo_library": "iCloud写真を許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Shared PhotoStream Send Invitation": "共有フォトストリームの参加依頼の送信を許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Shared PhotoStream Receive Invitation": "共有フォトストリームの参加依頼の受信を許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Passbook while device locked": "ロック画面でのWallet通知を許可",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow installing configuration profiles (supervised only)": "構成プロファイルのインストールを許可（監視対象デバイスのみ）",
  "_restrictions_string_Allow adding VPN configurations (supervised only)": "VPN構成の追加を許可（監視対象のみ）",
  "_restriction_string_Force automatic date and time": "日時の自動設定を強制（監視対象のみ）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow use of Messages": "iMessageを許可（監視対象のみ）",
  "_restriction_string_Allow iTunes music streaming": "Apple Musicを許可（監視対象のみ）",
  '_restriction_string_Allow Apple Music': 'Apple Musicを許可',
  "_restriction_string_Allow Radio": "Radioを許可（監視対象のみ）",
  "_restriction_string_Allow News": "“News”の使用を許可（監視対象のみ）",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Consent": "承諾",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Consent Text Description": "テキスト説明を承諾",

  /* This is a generic string used one or more times in the app. */
  "_general_string_Lock To App": "Appを制限",

  /* This is a generic string used one or more times in the app. */
  "_general_string_Limit an iOS device to one app": "iOSデバイスを特定のAppに制限（監視対象のみ）",

  /* System Application Names */
  "_general_string_app_name_Safari": "Safari",
  "_general_string_app_name_Videos": "ビデオ",
  "_general_string_app_name_Calendar": "カレンダー",
  "_general_string_app_name_Music": "ミュージック",
  "_general_string_app_name_Contacts": "連絡先",
  "_general_string_app_name_Messages": "メッセージ",
  "_general_string_app_name_Maps": "マップ",
  "_general_string_app_name_Reminders": "リマインダー",
  "_general_string_app_name_Photos": "写真",
  "_general_string_app_name_Mail": "メール",
  "_general_string_app_name_Notes": "メモ",
  "_general_string_app_name_Settings": "設定",
  "_general_string_app_name_Books": "Apple Books",
  "_general_string_app_name_Weather": "天気",
  "_general_string_app_name_Calculator": "計算機",
  "_general_string_app_name_Podcasts": "Podcast",
  "_general_string_app_name_Stocks": "株価",
  "_general_string_app_name_Camera": "カメラ",
  "_general_string_app_name_Gamecenter": "Game Center",
  "_general_string_app_name_Health": "ヘルスケア",
  "_general_string_app_name_Clock": "時計",
  "_general_string_app_name_Appstore": "App Store",
  "_general_string_app_name_iTunes": "iTunes Store",
  "_general_string_app_name_Wallet": "Wallet",
  "_general_string_app_name_News": "News",
  "_general_string_app_name_FaceTime": "FaceTime",
  "_general_string_app_name_Tips": "ヒント",
  "_general_string_app_name_Photo Booth": "Photo Booth",
  '_general_string_app_name_Activity': 'アクティビティ',
  '_general_string_app_name_Compass': 'コンパス',
  '_general_string_app_name_iCloud Drive': 'iCloud Drive',
  '_general_string_app_name_Watch': 'Apple Watch',
  '_general_string_app_name_Phone': '電話',
  '_general_string_app_name_Voice Memos': 'ボイスメモ',
  '_general_string_app_name_Home': 'ホーム',
  "_general_string_app_name_TV": "TV",
  "_general_string_app_name_Files": "ファイル",
  "_general_string_app_name_Measure": "計測",
  "_app_restriction_string_app_name_placeholder": "<クリックしてApp名を編集>",

  "_generic_string_Touch": "タッチ",
  "_generic_string_Device Rotation": "モーション",
  "_generic_string_Volume Buttons": "ボリュームボタン",
  "_generic_string_Ringer Switch": "サイドスイッチ",
  "_generic_string_Sleep/Wake Button": "スリープ/スリープ解除ボタン",
  "_generic_string_Auto-Lock": "自動ロック",
  "_generic_string_VoiceOver": "VoiceOver",
  "_generic_string_Zoom": "拡大/縮小",
  "_generic_string_Invert Colors": "色を反転",
  "_generic_string_AssistiveTouch": "AssistiveTouch",
  "_generic_string_Speak Selection": "選択項目を読み上げる",
  "_generic_string_Mono Audio": "モノラル音声",

  "_generic_string_Settings enforced when in Single App Mode": "シングルAppモードで適用する設定",
  "_generic_string_Allow the user to change these settings when in Single App Mode": "シングルAppモードでこれらの設定の変更をユーザに許可",
  "_general_string_The app to run in Single App Mode (supervised only)": "シングルAppモードで実行するApp（監視対象のみ）",
  /* This is a generic string used one or more times in the app. */
  "_general_string_Settings for automatic profile removal": "プロファイルの自動削除の設定",

  /* This is a generic string used one or more times in the app. */
  "_general_string_On date": "指定日",
  "_general_string_removal_date_format": "%Y/%m/%d ",

  /* This is a generic string used one or more times in the app. */
  "_general_string_After interval": "一定期間後",

  /* used in mail and exchange knob sets */
  "_generic_string_Allow recent addresses to be synced": "最近使ったアドレスの同期を許可",
  "_generic_string_Include this account in recent address syncing": "最近使ったアドレスの同期にこのアカウントを含めます",
  "_generic_string_Allow MailDrop": "Mail Dropを許可",
  "_generic_string_Allow MailDrop for this account": "このアカウントのMail Dropを許可します",

  /* Date display format for each locale */
  "_generic_date_format": "%Y/%m/%d ",


  /* This is a generic string used one or more times in the app. */
  "_generic_string_Delete Application Confirmation": "このAppを削除しますか?",
  "_generic_string_Delete Apps Confirmation": "これらのAppを削除しますか?",

  /* This is a generic string used one or more times in the app. */
  "_remove_osx_app_from_library_description": "アプリケーションはライブラリから削除されます。ユーザ、グループ、デバイスグループ、およびmacOSデバイスへの既存の割り当ては削除されます。",
  "_remove_ios_app_from_library_description": "アプリケーションはライブラリから削除されます。ユーザ、グループ、デバイスグループ、およびiOSデバイスへの既存の割り当ては削除されます。",
  "_generic_string_The apps will be removed from all devices.": "macOSアプリケーションがライブラリから削除され、iOS Appがライブラリおよびすべてのデバイスから削除されます。",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Delete Book Confirmation": "ブックを削除しますか?",
  "_generic_string_Delete Books Confirmation": "ブックを削除しますか?",

  /* This is a generic string used one or more times in the app. */
  "_remove_ios_book_from_library_description": "ブックはライブラリから削除されます。ユーザ、グループ、デバイスグループ、およびiOSデバイスへの既存の割り当ては削除されます。",
  "_remove_ios_books_from_library_description": "選択したブックはライブラリから削除されます。ユーザ、グループ、デバイスグループ、およびiOSデバイスへの既存の割り当ては削除されます。",

  /* Dock */
  "_dock_knob_set_name": "Dock",
  "_dock_knob_set_description": "このセクションを使ってDockの設定を定義します。",
  "_dock_knob_set_num_lines": "1",
  "_generic_string_Position:": "位置:",
  "_generic_string_Dock Size:": "Dockサイズ:",
  "_generic_string_Magnification:": "拡大:",
  "_generic_string_Minimize using:": "しまうときのエフェクト:",
  "_generic_string_Genie Effect": "ジニーエフェクト",
  "_generic_string_Scale Effect": "スケールエフェクト",
  "_generic_string_Animate opening applications": "起動中のアプリケーションをアニメーションで表示",
  "_generic_string_The applications that will launch at login": "ログイン時に起動されるアプリケーション",
  "_generic_string_Left": "左",
  "_generic_string_Bottom": "下",
  "_generic_string_Small": "小",
  "_generic_string_Medium": "中",
  "_generic_string_Large": "大",
  "_generic_string_Item": "項目",
  "_generic_string_Documents": "書類",
  "_generic_string_Merge with User's Dock": "ユーザのDockと結合",
  "_macos_doc_restriction_Allow modifying items in Dock": "Dockで項目の変更を許可",
  "_generic_string_Hide": "非表示",
  "_generic_string_None": "なし",
  "_layout_dock_knob_set_display_settings_label_widths": "177",
  "_layout_dock_knob_set_select_button_width": "140",


  /* Time machine strings */
  "_global_time_machine_knob_set_name": "Time Machine",
  "_global_time_machine_knob_set_description": "このセクションを使用してTime Machineの設定を構成します。",
  "_generic_string_Backup destination URL": "バックアップを作成するサーバ",
  "_generic_string_The URL to backup destination (e.g., smb://server.example.com/)": "バックアップの作成先のURL（smb://server.example.com/backups/ など）",
  "_generic_string_Backup all volumes": "すべてのボリュームのバックアップを作成",
  "_generic_string_Only startup volume is backed up by default": "デフォルトでは起動ボリュームのみのバックアップが作成されます",
  "_generic_string_Backup system files and folders": "システムファイルとシステムフォルダのバックアップを作成",
  "_generic_string_System files and folders are skipped by default": "システムファイルとシステムフォルダをデフォルトでスキップ",
  "_generic_string_Automatic backups": "自動バックアップを有効にする",
  "_generic_string_Enable automatic backups": "一定の間隔で自動的にバックアップ",
  "_generic_string_Mobile backups": "ローカルスナップショットを有効にする（10.8以降のみ）",
  "_generic_string_Enable local snapshots (10.8 and above only)": "ネットワークに接続されていないときはローカルのバックアップスナップショットを作成",
  "_generic_string_BackupSize Limit": "バックアップサイズの制限",
  "_generic_string_BackupSize limit in MB. Set to 0 for unlimited": "バックアップサイズの制限（MB)。0に設定すると無制限になります",
  "_generic_string_Paths to backup:": "バックアップのパス:",
  "_generic_string_The startup volume is always backed up": "起動ボリュームのバックアップを常に作成",
  "_generic_string_Paths to skip:": "スキップするパス:",
  "_generic_string_The paths to skip from startup volume": "起動ボリュームからスキップするパス",

  /* Dictation restriction */
  '_generic_string_Disable use of Siri and Dictation': 'Siriおよび音声入力の使用を無効にする',

  /* Security and Privacy */
  '_generic_string_FileVault': "FileVault",
  "_generic_string_Privacy": "プライバシー",
  "_generic_string_Require FileVault": "FileVaultを必須にする",
  "_generic_string_If not already enabled, FileVault will be enabled at the next logout": "FileVaultがまだ有効になっていない場合は、次回のログアウト時に有効になります",
  "_generic_string_Defer FileVault setup": "FileVault設定を延期",
  "_generic_string_Defers FileVault setup until the current user logs out": "現在のユーザがログアウトするまでFileVault設定を延期",
  "_generic_string_Create recovery key": "パーソナル復旧キーを作成",
  "_generic_string_Create a personal FileVault recovery key": "FileVaultパーソナル復旧キーを作成",
  "_generic_string_Recovery key location": "パーソナル復旧キーの場所",
  "_generic_string_Location to store the recovery key": "パーソナル復旧キーを保管する場所",
  "_generic_string_Create institutional recovery user": "所属団体の復旧キーを使用",
  "_generic_string_Create a personal FileVault recovery key and use an institutional recovery key": "所属団体の復旧キーを使用してFileVaultパーソナル復旧キーを作成",
  "_generic_string_Creates a institutional recovery user using the FileVault Master keychain": "所属団体のキーチェーンを使用して暗号化ディスクにアクセスできるようにします",
  "_generic_string_FileVault username": "指定されたFileVaultユーザ名",
  "_generic_string_FileVault enabled user, current logged in user is used by default": "FileVaultが有効なユーザ、現在ログインしているユーザがデフォルトで使用されます",
  "_generic_string_FileVault user password": "指定されたFileVaultユーザパスワード",
  "_generic_string_Password for the FileVault enabled user": "FileVaultが有効なユーザのパスワード",
  "_generic_string_Certificate that contains the public key from institutional recovery keychain": "所属団体の復旧キーチェーンから取得した公開鍵を含むDERエンコード済み証明書",
  "_generic_string_Require user to unlock FileVault after hibernation": "ハイバネーション後にユーザにFileVaultのロック解除を要求",
  "_generic_string_The user will be required to unlock FileVault when the computer awakes from hibernation": "ハイバネーションからの復帰後にユーザにFileVaultのロック解除を要求します",
  "_generic_string_Allow user to disable FileVault": "ユーザによるFileVaultの無効化を許可",
  "_filevault_setting_string_Escrow Personal Recovery Key": "パーソナル復旧キーをエスクロー",
  "_filevault_setting_string_escrow_personal_recovery_key_description": "有効にすると、デバイスで指定の証明書を使ってパーソナル復旧キーが暗号化され、プロファイルマネージャに報告されます。暗号化されたキーはデバイスの詳細ページからダウンロードできます。",
  "_filevault_setting_string_Escrow Location Description": "エスクロー先の説明",
  "_filevault_setting_string_escrow_location_description": "パーソナル復旧キーのエスクロー先の簡単な説明。このメッセージはFileVaultを有効にするときにユーザに表示されます。",
  "_filevault_setting_string_Escrow Key Encryption Certificate": "パーソナル復旧キーの暗号化証明書",
  "_filevault_setting_string_escrow_key_encryption_certificate_description": "パーソナル復旧キーの暗号化に使用する証明書",
  "_filevault_setting_string_Show personal recovery key": "パーソナル復旧キーを表示",

  /* Checkpoint VPN */
  "_generic_string_Check Point Mobile VPN": "Check Point Mobile VPN",
  "_vpn_type_string_custom_ssl": "カスタムSSL",
  "_vpn_custom_ssl_identifier": "識別子",
  "_vpn_custom_ssl_identifier_description": "カスタムSSL VPNの識別子",
  "_vpn_custom_ssl_data_header": "カスタムデータ",
  "_vpn_custom_ssl_data_description": "カスタムデータのキーと文字列値",
  "_vpn_custom_ssl_data_table_header_key": "キー",
  "_vpn_custom_ssl_data_table_header_value": "値",

  '_vpn_type_Pulse Secure': 'Pulse Secure',

  /* Single App Mode */
  "_generic_string_Single App Mode": "シングルAppモード",
  "_tvos_single_app_mode_knob_set_settings_page_display_name": "シングルAppモード（tvOS）",
  "_ios_single_app_mode_knob_set_settings_page_display_name": "シングルAppモード（iOS）",

  /* Finder Knob set */
  "_global_finder_knob_set_name": "Finder",
  "_global_finder_knob_set_description": "このセクションを使用してFinderの設定を構成します。",
  "_generic_string_Commands": "コマンド",
  "_generic_string_Select commands available to users": "ユーザが使用できるコマンドを選択",
  "_generic_string_Opens a dialog box for finding servers on the network": "ネットワーク上のサーバを探すダイアログボックスを開きます",
  "_generic_string_Connect to Server": "サーバへ接続",
  "_generic_string_Eject": "取り出し",
  "_generic_string_Ejects removable media and mountable volumes": "リムーバブルメディアとマウント可能ボリュームを取り出します",
  "_generic_string_Burn Disc": "ディスクを作成",
  "_generic_string_Writes permanent information to a CD or DVD": "永久に保存する情報をCDまたはDVDに書き込みます",
  "_generic_string_Go to Folder": "フォルダへ移動",
  "_generic_string_Allows user to open files or folders by typing a pathname": "ユーザがパス名を入力してファイルまたはフォルダを開くことを許可します",
  "_generic_string_Restart": "再起動",
  "_generic_string_Makes the restart command appear in the Apple menu": "アップルメニューに“再起動”コマンドを表示します",
  "_generic_string_Makes the shut down command appear in the Apple menu": "アップルメニューに“システム終了”コマンドを表示します",
  "_generic_string_Makes the log out command appear in the Apple menu": "アップルメニューに“ログアウト”コマンドを表示します",
  "_generic_string_Show these items on the desktop": "次の項目をデスクトップに表示",
  "_generic_string_Hard disks": "ハードディスク",
  "_generic_string_External disks": "外部ディスク",
  "_generic_string_CDs, DVDs and iPods": "CD、DVD、およびiPod",
  "_generic_string_Connected servers": "接続中のサーバ",
  "_generic_string_Use regular Finder": "通常のFinderを使用",
  "_generic_string_Use simple Finder": "シンプルFinderを使用",
  "_generic_string_Show warning before emptying the Trash": "ゴミ箱を空にする前に警告を表示",

  /* Security Info FileVault Reporting */
  "_generic_string_Yes": "はい",
  "_generic_string_No": "いいえ",
  "_generic_string_FileVault Enabled": "FileVaultが有効",
  "_generic_string_FileVault has personal key": "パーソナル復旧キー",
  "_generic_string_FileVault has institutional key": "所属団体の復旧キー",
  "_generic_string_System Integrity Protection Enabled": "システム整合性保護が有効",
  "_filevault_string_FileVault has encrypted personal key": "暗号化パーソナル復旧キー",
  "_filevault_status_Recovery Key Set": "設定",
  "_filevault_status_Recovery Key Not Set": "未設定",
  "_generic_string_Activation Lock Enabled": "アクティベーションロック有効",
  "_device_about_string_Find My iPhone Enabled": "“iPhoneを探す”有効",
  "_generic_string_Activation Lock Bypass Code": "アクティベーションロックバイパスコード",
  "_no_activation_lock_bypass_code": "なし",

  /* Sharing Services */
  "_restrictions_tab_header_Sharing": "共有",
  "_generic_string_Select services that should be available in the share menu": "共有メニューで利用可能にするサービスを選択",
  "_generic_string_AirDrop": "AirDrop",
  "_generic_string_Facebook": "Facebook",
  "_generic_string_Twitter": "Twitter",
  '_app_name_string_LinkedIn': 'LinkedIn',
  "_general_string_chinese_blog_name_SinaWeibo": "Sina Weibo",
  "_generic_string_Enable New Share Services": "新しい共有デバイスを自動的に有効にする",
  "_general_string_Video Services - Flickr, Vimeo, Tudou and Youku": "ビデオサービス - Flickr、Vimeo、Tudou、Youku",
  "_generic_string_New share services will be enabled in the share menu automatically": "新しい共有サービスは自動的に共有メニューで有効になります",
  "_general_string_Add to Photos": "“写真”に追加",
  "_general_string_Add to Aperture": "Apertureに追加",
  "_general_string_Add to Reading List": "リーディングリストに追加",

  "_restrictions_tab_header_Functionality": "機能",
  "_generic_string_Lock Desktop Picture": "デスクトップピクチャをロック",
  "_lock_desktop_picture_description": "ユーザがデスクトップピクチャの選択を変更できないようにします",
  "_generic_string_Picture Path": "デスクトップピクチャのパス",
  "_lock_desktop_picture_path_description": "デスクトップピクチャとして使用するファイルのパス。デバイスでの現在の選択を使用する場合は、パスを空のままにします",
  "_mac_restrictions_segment_view_width": "520",

  /* Universal Access */
  "_global_universal_access_knob_set_name": "アクセシビリティ",
  "_global_universal_access_knob_set_description": "このセクションを使用してアクセシビリティの設定を構成します。",
  "_generic_string_Vision": "視覚",
  "_generic_string_Hearing": "聴覚",
  "_accessibility_seeing_tab_width": "540",
  "_accessibility_interactivity_tab_width": "480",
  "_accessibility_interactivity_tab_label_width": "225",
  "_generic_string_Interacting": "操作",
  "_generic_string_Enable Zoom via ScrollWheel:": "スクロールホイールによるズーム機能を有効にする:",
  "_generic_string_Zoom Options": "ズームオプション",
  "_generic_string_Enable Zoom via Keyboard:": "キーボードによるズーム機能を有効にする:",
  "_generic_string_Minimum Zoom:": "最大縮小率:",
  "_generic_string_Maximum Zoom:": "最大拡大率:",
  "_generic_string_Show preview rectangle when zoomed out:": "縮小したときにプレビュー領域を表示:",
  "_generic_string_Smooth images:": "イメージをスムージング:",
  "_generic_string_Display Options": "表示オプション",
  "_generic_string_Invert colors:": "カラーを反転:",
  "_generic_string_Use grayscale:": "グレイスケールを使用:",
  "_generic_string_Enhance Contrast:": "コントラストを強調:",
  "_generic_string_Cursor size:": "カーソルのサイズ:",
  "_generic_string_VoiceOver Options": "VoiceOverのオプション",
  "_generic_string_Enable VoiceOver:": "VoiceOverを有効にする:",
  "_generic_string_Flash the screen when an alert occurs": "通知時に画面を点滅させる",
  "_generic_string_Play stereo audio as mono": "ステレオ・オーディオをモノラルとして再生",
  "_generic_string_Enable Sticky Keys": "複合キーを有効にする",
  "_generic_string_Display pressed keys on screen": "押されたキーを画面に表示",
  "_generic_string_Beep when a modifier key is set": "修飾キーが設定されたときにビープ音を鳴らす",
  "_generic_string_Acceptance delay": "入力認識までの時間:",
  "_generic_string_Use click key sounds": "クリックキーサウンドを使用:",
  "_generic_string_Enable Slow Keys": "スローキーを有効にする",
  "_generic_string_Enable Mouse Keys": "マウスキーを有効にする",
  "_generic_string_Initial delay:": "入力認識までの時間:",
  "_generic_string_Maximum speed": "最大速度:",
  "_generic_string_Ignore built-in trackpad:": "内蔵トラックパッドを無視:",
  "_generic_string_short": "短い",
  "_generic_string_Long": "長い",
  "_generic_string_Fast": "高速",
  "_generic_string_Slow": "低速",
  "_generic_string_time_milliseconds": "ミリ秒",
  "_generic_string_N_second": "%@1秒",
  "_generic_string_N_seconds": "%@1秒",
  "_generic_string_N%": "%@1%",
  "_layout_universal_access_knob_set_title_label_widths": '320',
  "_layout_universal_access_knob_set_select_button_width": '110',

  /* Game Center Stuff */
  "_generic_string_Allow GameCenter": "Game Centerの使用を許可（監視対象のみ）",
  "_generic_string_Allow Game Center": "Game Centerの使用を許可",
  "_generic_string_Allow Game Center account modification": "Game Centerアカウントの変更を許可",
  "_generic_string_Allow adding Game Center friends": "Game Centerの友人の追加を許可",
  "_generic_string_Allow Multiplayer Gaming": "マルチプレイヤーゲームを許可",
  "_generic_string_Allow multiplayer gaming": "マルチプレイヤーゲームを許可",

  // mac restrictions
  "_mac_restrictions_string_Allow App Store app adoption": "App StoreのApp選択を許可",
  "_mac_restrictions_string_Allow Safari to autofill user names and passwords": "Safariの自動入力を許可",
  "_mac_restrictions_string_Allow software update notifications": "ソフトウェア・アップデートの通知を許可",

  /* Content Library Sidebar Item */
  "_content_sidebar_item_display_name": "コンテンツ",
  "_generic_string_Get More Apps": "さらにAppを入手",
  "_vpp_get_more_apps_button_width": "145",
  "_generic_string_Get More Books": "さらにブックを入手",
  "_vpp_get_more_books_button_width": "153",
  "_vpp_portal_url": "https://vpp.itunes.apple.com/jp/?l=ja",

  /* Application Filter Strings*/
  "_application_filter_type_string_All Kinds": "すべての種類",
  "_application_filter_type_string_iPad": "iPad",
  "_application_filter_type_string_iPhone+iPad": "iPhone + iPad",
  "_application_filter_type_string_iPod+iPhone+iPad": "iPod + iPhone + iPad",
  "_application_filter_type_string_iPhone": "iPhone",
  "_application_filter_type_string_iPod+iPhone": "iPod + iPhone",
  "_application_filter_type_string_Mac": "Mac",
  "_application_filter_type_string_macOS": "macOS",
  "_application_filter_type_string_iOS": "iOS",
  "_application_filter_type_string_tvOS": "tvOS",
  "_application_filter_license_type_Enterprise": "エンタープライズ",
  "_application_filter_license_type_App Store": "App Store",
  "_application_filter_category_All Categories": "すべてのカテゴリ",
  "_search_hint_Search Apps": "Appを検索",
  "_search_hint_Search Books": "ブックを検索",
  "_search_hint_Search Students": "生徒を検索",
  "_search_hint_Search Instructors": "教師を検索",

  /* Unified Applications Table View */
  "_table_header_Name": "名前",
  "_table_header_Category": "カテゴリ",
  "_table_header_Version": "バージョン",
  "_table_header_Size": "サイズ",
  "_table_header_Purchased": "購入済み",
  "_table_header_Assigned": "割り当て済み",
  "_table_header_UnFulfilled": "未適用",
  "_table_header_Members": "メンバー",
  "_table_header_Available": "使用可能",
  "_table_header_OS": "OS",
  "_table_header_Assigned To": "割り当て先",
  "_table_header_Device Name": "デバイス名",
  "_table_header_Device Group": "デバイスグループ",
  "_table_header_Password": "パスワード",
  "_table_header_Include Password": "パスワードを含める",
  "_table_header_Assignment Mode": "割り当てモード",
  "_table_header_Installation Mode": "インストールモード",
  "_table_header_Assignable Modes": "割り当て可能モード",
  "_app_installation_mode_Automatic": "自動",
  "_app_installation_mode_Manual": "手動",
  "_app_installation_mode_Tethered": "テザリング",
  "_app_assignment_mode_enterprise": "--",
  "_app_assignment_mode_apple_id": "Apple ID",
  "_app_assignment_mode_managed_apple_id": "管理対象Apple ID",
  "_app_assignment_mode_device": "デバイス",
  "_app_assignable_mode_Enterprise": "--",
  "_app_assignable_mode_Apple ID, MAID, Device": "Apple ID、管理対象Apple ID、デバイス",
  "_app_assignable_mode_Apple ID, Device": "Apple ID、デバイス",
  "_app_assignable_mode_Apple ID, MAID": "Apple ID、管理対象Apple ID",
  "_app_assignable_mode_Apple ID": "Apple ID",
  '_app_assigned_to_multiple_items': '複数',

  "_table_header_Settings": "設定",
  "_table_header_App": "App",
  "_table_header_Book": "ブック",
  "_table_header_User": "ユーザ",
  "_table_header_Target": "ターゲット",
  "_table_header_Status": "ステータス",
  "_table_header_Network": "ネットワーク",
  "_table_header_Last Updated": "最終更新",

  "_generic_string_size_KB": "%@1 KB",
  "_generic_string_size_MB": "%@1 MB",
  "_generic_string_decimal_size_MB": "%@1.%@2 MB",
  "_generic_string_size_GB": "%@1 GB",
  "_generic_string_decimal_size_GB": "%@1.%@2 GB",
  "_generic_string_app_count_singular_and_size_fmt_KB": "1個のApp、%@1 KB",
  "_generic_string_app_count_and_size_fmt_KB": "%@1個のApp、%@2 KB",
  "_generic_string_app_count_singular_and_size_fmt_MB": "1個のApp、%@1 MB",
  "_generic_string_app_count_singular_and_decimal_size_fmt_MB": "1個のApp、%@1.%@2 MB",
  "_generic_string_app_count_and_size_fmt_MB": "%@1個のApp、%@2 MB",
  "_generic_string_app_count_and__decimal_size_fmt_MB": "%@1個のApp、%@2.%@3 MB",
  "_generic_string_app_count_singular_and_size_fmt_GB": "1個のApp、%@1 GB",
  "_generic_string_app_count_singular_and_decimal_size_fmt_GB": "1個のApp、%@1.%@2 GB",
  "_generic_string_app_count_and_size_fmt_GB": "%@1個のApp、%@2 GB",
  "_generic_string_app_count_and_decimal_size_fmt_GB": "%@1個のApp、%@1.%@2 GB",
  "_application_filter_type_string_iPhone,iPad,iPod": "iPod、iPhone、iPad",
  "_application_filter_type_string_iPhone,iPad": "iPhone、iPad",
  "_application_filter_type_string_iPhone,iPod": "iPod、iPhone",
  "_application_type_iOS & macOS": "iOSとmacOS",
  "_application_type_macOS": "macOS",
  "_application_type_iOS": "iOS",
  "_application_type_tvOS": "tvOS",
  "_task_network_type_string_Tethered": "テザリング",
  "_task_network_type_string_Any": "任意",

  /* Genesis Views */
  "_generic_string_Add Enterprise App": "エンタープライズAppを追加",
  "_generic_string_Add Enterprise Book": "エンタープライズブックを追加",
  "_generic_string_Volume Purchase": "Volume Purchase for Apps and Books",
  "_generic_string_Choose apps from your library": "ライブラリからAppを選択",
  "_generic_string_Choose books from your library": "ライブラリからブックを選択",
  "_generic_string_Choose in-house enterprise books from your library": "ライブラリからインハウス・エンタープライズ・ブックを選択",
  "_assign_unified_apps_description": "Volume Purchase for Apps and Booksを使用して購入したApp、またはプロファイルマネージャに追加されたインハウスiOSエンタープライズAppを割り当てることができます。",
  "_assign_unified_apps_description_no_device_management": "Volume Purchase for Apps and Booksを使用して購入したAppを割り当てることができます。",
  "_assign_apps_to_devices_description": "Volume Purchase for Apps and Booksを使用して購入したApp、またはプロファイルマネージャに追加されたインハウスiOSエンタープライズAppのうち、適格なAppをデバイスに割り当てることができます。",
  "_assign_unified_books_description": "Volume Purchase for Apps and Booksを使用して購入したブックを割り当てることができます。",
  "_assign_inhouse_enterprise_books_description": "プロファイルマネージャに追加されたインハウス・エンタープライズ・ブックを割り当てることができます",
  "_generic_string_Purchased": "購入済み",
  "_generic_string_Available_Licenses": "使用可能",
  "_generic_string_Assignment": "割り当て",
  "_generic_string_Groups": "グループ",
  "_generic_string_profile_manager_apps_feature_description": "プロファイルマネージャを使用すると、Volume Purchase for Apps and Booksで購入したAppを簡単にユーザとグループに割り当てて配布することができます。iOSやmacOS用のエンタープライズAppを登録デバイスに配布することもできます。",
  "_generic_string_profile_manager_apps_feature_description_no_device_management": "プロファイルマネージャを使用すると、Volume Purchase for Apps and Booksで購入したAppを簡単にユーザとグループに割り当てて配布することができます。",
  "_generic_string_profile_manager_books_feature_description": "プロファイルマネージャを使用すると、Volume Purchase for Apps and Booksで購入したブックを簡単にユーザとグループに割り当てることができます。エンタープライズブックを登録デバイスに配布することもできます。",
  "_generic_string_profile_manager_books_feature_description_no_device_management": "プロファイルマネージャを使用すると、Volume Purchase for Apps and Booksで購入したブックを簡単にユーザとグループに割り当てて配布することができます。",
  "_generic_string_profile_manager_device_genesis_description": "プロファイルマネージャを使用すると、Appleデバイスを簡単に管理できます。さまざまな設定をカスタマイズして、登録したデバイスごとに適用できます。",
  "_generic_string_profile_manager_device_group_genesis_description": "プロファイルマネージャを使用すると、Appleデバイスを簡単にグループに整理できます。さまざまな設定をカスタマイズして、グループ内の登録したデバイスごとに適用できます。",
  "_button_label_Add Device Group": "デバイスグループを追加",
  "_button_label_Remove Device Group": "デバイスグループを削除",
  "_button_label_Remove Device": "デバイスを削除",
  "_button_label_Add Class": "クラスを追加",
  "_button_label_Remove Class": "クラスを削除",
  "_button_label_Add Students": "生徒を追加",
  "_button_label_Remove Students": "生徒を削除",
  "_button_label_Add Instructors": "教師を追加",
  "_button_label_Remove Instructors": "教師を削除",
  "_button_label_Add Shared iPad Groups": "共有iPadグループを追加",
  "_button_label_Remove Shared iPad Groups": "共有iPadグループを削除",
  "_button_label_Enroll Device": "デバイスを登録",
  "_button_text_Learn More": "デバイスの登録に関する情報",
  "_button_width_learn_more": "215",
  "_genesis_view_width": "800",
  "_layout_books_library_genesis_width": "850",

  /* Apps and Book Categories */
  "_apps_category_string_enterprise": "エンタープライズ",
  "_apps_category_string_B2B": "B2B",
  "_books_category_string_PDF": "PDF",
  "_books_category_string_iBooks": "iBooks Author",
  "_books_category_string_ePub": "ePub",

  /* Books Library */
  "_generic_string_Books": "ブック",
  "_generic_string_book_count": "%@1冊のブック",
  "_generic_string_book_count_and_size_fmt_KB": "%@1冊のブック、%@2 KB",
  "_generic_string_book_count_singular_and_size_fmt_KB": "1冊のブック、%@1 KB",
  "_generic_string_book_count_and_size_fmt_MB": "%@1冊のブック、%@2 MB",
  "_generic_string_book_count_and_decimal_size_fmt_MB": "%@1冊のブック、%@2.%@3 MB",
  "_generic_string_book_count_singular_and_size_fmt_MB": "1冊のブック、%@1 MB",
  "_generic_string_book_count_singular_and_decimal_size_fmt_MB": "1冊のブック、%@1.%@2 MB",
  "_generic_string_book_count_and_size_fmt_GB": "%@1冊のブック、%@2 GB",
  "_generic_string_book_count_and_decimal_size_fmt_GB": "%@1冊のブック、%@2.%@3 GB",
  "_generic_string_book_count_singular_and_size_fmt_GB": "1冊のブック、%@1 GB",
  "_generic_string_book_count_singular_and_decimal_size_fmt_GB": "1冊のブック、%@1.%@2 GB",

  /* VPP Content detail page */
  "_generic_string_This app is designed for both iPhone and iPad": "このAppはiPhoneとiPadの両方に対応しています",
  "_generic_string_View in App Store": "App Storeで表示",
  "_generic_string_Developer Website": "デベロッパWebサイト",
  "_generic_string_VPP Website": "VPP Webサイト",
  "_generic_string_Category: %@": "カテゴリ: %@",
  "_generic_string_Updated: %@": "アップデート日: %@",
  "_generic_string_Version: %@": "バージョン: %@",
  "_generic_string_Version N/A": "N/A",
  "_generic_string_Size: %@": "サイズ: %@",
  "_generic_string_Choose Groups": "グループを選択",
  "_generic_string_choose_vpp_enabled_groups": "VPP対応のグループを選択",
  "_assign_user_groups_to_app_description": "Appを割り当てるVPP対応のユーザグループを選択します。Appは、ユーザが“VPP管理配布”登録を受け入れた時系列順に従って割り当てられます。",
  "_assign_device_groups_to_app_description": "このAppを割り当てるデバイスグループを選択します。",
  "_assign_devices_to_app_description": "このAppを割り当てるデバイスを選択します。",
  "_generic_string_Choose users": "ユーザを選択",
  "_generic_string_Choose user": "ユーザを選択",
  "_generic_string_Choose user groups": "ユーザグループを選択",
  "_generic_string_Choose Device Groups": "デバイスグループを選択",
  "_generic_string_Choose Devices": "デバイスを選択",
  "_assign_users_to_app_description": "このAppを割り当てるユーザを選択します。",
  "_assign_users_to_edu_class": "クラスに追加するユーザを選択",
  "_assign_device_groups_to_edu_class": "クラスに追加する共有iPadデバイスグループを選択",
  "_assign_user_groups_to_edu_class": "クラスに追加するユーザグループを選択",
  "_view_more_info_...More": "…さらに見る",
  "_view_more_info_...Less": "…省略する",
  "_search_hint_Search Groups": "グループを検索",
  "_search_hint_search_vpp_enabled_groups": "VPP対応のグループを検索",
  "_search_hint_Search Users": "ユーザを検索",
  "_search_hint_Search Devices": "デバイスを検索",
  "_search_hint_Search Device Groups": "デバイスグループを検索",
  "_generic_string_Go back": "戻る",
  "_generic_string_Loading Application Information...": "アプリケーション情報を読み込み中…",
  "_application_detail_unavailable_from_itunes_store": "このAppの情報はApp Storeで利用できなくなりました",
  "_layout_vpp_content_left_detail_view_width": "185",
  "_layout_vpp_content_detail_library_item_tabs_width": "300",

  "_generic_string_VPP Managed Distribution": "VPP管理配布",
  "_about_tab_header_string_Software Updates": "OS、内蔵アプリケーション、システムデータファイル、およびセキュリティアップデート",
  "_about_tab_software_updates_string_1 device": "1台のデバイスで利用可能",
  "_about_tab_software_updates_string_multiple_devices": "%@台のデバイスで利用可能",

  // Merge sheet
  "_merge_directory_user_description": "%@（%@）と結合するアカウントを選択してください。排他的な設定、App割り当て、ブック割り当てについては、選択したアカウントの設定が優先されます。",
  "_merge_asm_user_description": "%@（Apple School Manager）と結合するアカウントを選択してください。排他的な設定、App割り当て、ブック割り当てについては、選択したアカウントの設定が優先されます。",
  "_merge_asm_user_header": "Apple School Managerアカウントを結合",
  "_merge_directory_user_header": "ディレクトリアカウントを結合",
  "_table_header_Managed Apple ID": "管理対象Apple ID",

  // height of the vpp section in user group's about tab. This should account for longer status strings in different locales.
  "_user_group_about_vpp_section_height": '450',
  "_generic_string_Enrolled": "登録済み",
  "_generic_string_Not Enrolled": "未登録",
  "_generic_string_Send Email Invitation...": "参加依頼メールを送信…",
  "_generic_string_Send Email Invitation": "参加依頼メールを送信",
  "_vpp_invitation_string_invitation_not_sent": "このユーザには参加依頼が送信されていません。",
  "_invitation_status_An invitation has not been sent via Email": "メールによる参加依頼が送信されていません",
  "_vpp_invitation_status_An invitation has not been sent to <device name>": "%@には参加依頼が送信されていません",
  "_generic_string_Send Invitation to <Device Name>": "%@に参加依頼を送信",
  "_generic_string_Resend Invitation...": "参加依頼を再送信…",
  "_generic_string_Resend Invitation": "参加依頼を再送信",
  "_generic_string_This user un-enrolled from the program on <status_update_date>.": "このユーザは%@にこのプログラムへの登録を解除しました",
  "_generic_string_This user was removed from the program on <od_vpp_status_updated_at>.": "このユーザは%@にこのプログラムから削除されました。",
  "_generic_string_No apps or books are assigned to this user.": "このユーザに割り当てられているAppまたはブックはありません。",
  "_generic_string_Remove From Program": "プログラムから削除",
  "_vpp_enrollment_status_This user was enrolled to receive content on <od_vpp_status_updated_at>.": "このユーザは%@にコンテンツを受信するように登録されました。",
  "_generic_string_An invitation was sent to <email_address> on <last_invited_date>": "%@への参加依頼が%@に送信されました",
  "_generic_string_An invitation was requested to be sent to <email_address> on <last_invited_date>": "%@への参加依頼の送信が%@に要求されました",
  "_generic_string_Enter email address": "メールアドレスを入力",

  "_layout_vpp_invite_pane_width": "350",
  "_layout_vpp_invite_pane_cancel_button_offset_right": "210",

  // VPP Group Enrollments
  "_enable_vpp_service_for_user_group": "VPP管理配布サービスを有効にする",
  "_processing_vpp_service_on_user_group_description": "VPP情報を処理中…",
  "_generic_string_Disable VPP Managed Distribution Services": "VPP管理配布サービスを無効にする",
  "_generic_string_All VPP assignments to this group will be removed. Current book assignments to enrolled users will be unaffected.": "このグループへのすべてのVPP割り当てが削除されます。登録したユーザへの現在のブックの割り当ては影響を受けません。",
  "_layout_disable_vpp_alert_pane_width": "550",
  "_vpp_group_enrollment_status_No Users Enrolled": "ユーザ未登録",
  "_vpp_group_enrollment_status_No Users": "ユーザがいません",
  "_vpp_group_enrollment_status_All Users Enrolled": "すべてのユーザが登録済み",
  "_vpp_group_enrollment_status_X of Y Users Enrolled": "%@ / %@人のユーザが登録済み",
  "_user_group_enrollment_info_These users were enrolled to receive content on <time>": "これらのユーザは%@にコンテンツを受信するように登録されました",
  "_user_group_enrollment_info_These users were enrolled to receive content between <start_time> and <end_time>": "これらのユーザは%@〜%@にコンテンツを受信するように登録されました",
  "_group_users_type_Users not previously invited": "以前に参加依頼されていないユーザ",
  "_group_users_type_Users not enrolled": "登録されていないユーザ",
  "_vpp_group_invitation_string_Invite:": "参加対象:",
  "_user_group_vpp_no_email_invitations_sent": "参加依頼メールがユーザに送信されていません",
  "_user_group_vpp_no_device_invitations_sent": "参加依頼がユーザのデバイスに送信されていません",
  "_vpp_group_invitation_invite_label_width": "72",
  "_user_group_vpp_action_Send VPP Invitation to Devices": "ユーザのデバイスに参加依頼を送信",

  "_user_group_email_invitation_status_Email Invitations were sent to X of Y users on <time>": "未登録のユーザ%@2人中%@1人に%@3に参加依頼メールが送信されました。",
  "_user_group_email_invitation_status_Email Invitations were sent to X of Y users between <start_time> and <end_time>": "未登録のユーザ%@2人中%@1人に%@3〜%@4の間に参加依頼メールが送信されました。",
  "_user_group_device_invitation_status_Device Invitations were sent to X of Y users on <time>": "未登録のユーザ%@2人中%@1人のデバイスに%@3に参加依頼が送信されました",
  "_user_group_device_invitation_status_Device Invitations were sent to X of Y users between <start_time> and <end_time>": "未登録のユーザ%@2人中%@1人のデバイスに%@3〜%@4の間に参加依頼が送信されました",

  "_layout_user_group_vpp_enrollment_in_progress_status_height": "45",
  "_layout_user_group_vpp_email_invitation_in_progress_status_height": "45",
  "_layout_user_group_vpp_device_invitation_in_progress_status_height": "45",

  // User group vpp invitation confirmation dialogues
  "_user_group_vpp_device_invite_alert_Send Invitation": "参加依頼を送信",
  "_user_group_vpp_email_alert_uninvited": "以前に参加依頼されていないユーザ%@人に参加依頼メールを送信しますか?",
  "_user_group_vpp_email_alert_uninvited_single_user": "以前に参加依頼されていないユーザ1人に参加依頼メールを送信しますか?",
  "_user_group_vpp_email_alert_unenrolled": "現在未登録のユーザ%@人に参加依頼メールを送信しますか?",
  "_user_group_vpp_email_alert_unenrolled_single_user": "現在未登録のユーザ1人に参加依頼メールを送信しますか?",
  "_user_group_vpp_device_alert_uninvited": "以前に参加依頼されていないユーザ%@人のデバイスに参加依頼を送信しますか?",
  "_user_group_vpp_device_alert_uninvited_single_user": "以前に参加依頼されていないユーザ1人のデバイスに参加依頼を送信しますか?",
  "_user_group_vpp_device_alert_unenrolled": "現在未登録のユーザ%@人のデバイスに参加依頼を送信しますか?",
  "_user_group_vpp_device_alert_unenrolled_single_user": "現在未登録のユーザ1人のデバイスに参加依頼を送信しますか?",

  "_user_group_email_invitation_info_All users have been invited": "すべてのユーザに参加依頼が送信されました。",
  "_user_group_email_invitation_info_none_uninvited_have_email": "以前に参加依頼されていないユーザのディレクトリアカウントにメールアドレスがありません。",
  "_user_group_email_invitation_info_none_unenrolled_have_email": "未登録のユーザのディレクトリアカウントにメールアドレスがありません。",
  "_user_group_email_invitation_info_x_of_y_uninvited_have_no_email": "以前に参加依頼されていないユーザ%@2人中%@1人のディレクトリアカウントにメールアドレスがありません。",
  "_user_group_email_invitation_info_x_of_y_unenrolled_have_no_email": "未登録のユーザ%@2人中%@1人のディレクトリアカウントにメールアドレスがありません。",
  "_user_group_device_invitation_info_none_uninvited_have_vpp_device": "以前に参加依頼されていないユーザに、適格なデバイスの登録がありません。",
  "_user_group_device_invitation_info_none_unenrolled_have_vpp_device": "未登録のユーザに、適格なデバイスの登録がありません。",
  "_user_group_device_invitation_info_x_of_y_uninvited_have_no_vpp_device": "以前に参加依頼されていないユーザ%@2人中%@1人に、適格なデバイスの登録がありません。",
  "_user_group_device_invitation_info_x_of_y_unenrolled_have_no_vpp_device": "未登録のユーザ%@2人中%@1人に、適格なデバイスの登録がありません。",

  "_mdm_enabled_user_vpp_invite_revoked_description": "このサービスへのアクセスは%@に取り消されました。新しい参加依頼は自動的に送信されません",
  "_mdm_enabled_user_vpp_service_unenrolled_description": "このユーザは%@にこのサービスへの登録を解除しました。新しい参加依頼は自動的に送信されません",
  "_mdm_enabled_user_vpp_service_enrolled_description": "%@に登録済み",
  "_vpp_date_time_format": "%Y年%B%d日 %p %i:%M",
  "_generic_string_Revoke access": "アクセスを取り消す",
  "_vpp_content_No content is assigned to this user.": "このユーザに割り当てられているコンテンツはありません",
  "_vpp_device_status_This user does not have a device enrolled that supports this service.": "このユーザはこのサービスに対応するデバイスを登録していません。",
  "_mdm_enabled_user_vpp_service_enrolled_no_devices_description": "このユーザはこのサービスに対応するデバイスを登録していません",
  "_generic_string_An invitation was requested to be sent to %@1 on %@2": "%@1への参加依頼の送信が%@2に要求されました",
  "_generic_string_An invitation was sent to %@1 on %@2": "%@1への参加依頼が%@2に送信されました",
  "_generic_string_Send invitation via email": "参加依頼をメールで送信",
  "_mdm_disabled_user_invited_for_vpp_service_description": "%@1への参加依頼が%@2に送信されました",
  "_mdm_disabled_user_revoked_for_vpp_service_description": "このサービスへのアクセスは%@に取り消されました。新しい参加依頼は自動的に送信されません",
  "_mdm_disabled_user_unenrolled_for_vpp_service_description": "このユーザは%@にこのサービスへの登録を解除しました。新しい参加依頼は自動的に送信されません",
  '_generic_string_Send invitation to "%@"': '“%@”に参加依頼を送信',

  "generic_string_authorized_users_exceeds_available_licenses_for_single_app_appleid_assignment": "%@は部数が足りないため、このグループ内の何人かのユーザに割り当てることができません。このままAppの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。ユーザが“VPP管理配布”の登録を受け入れた順にAppが割り当てられます。",
  "generic_string_authorized_users_exceeds_available_licenses_for_single_app_maid_assignment": "%@は部数が足りないため、このグループ内の何人かのユーザに割り当てることができません。このままAppの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。フルネームがアルファベット順で早いユーザから順にAppが割り当てられます。",
  "generic_string_authorized_users_exceeds_available_licenses_for_single_app_device_assignment": "%@は部数が足りないため、このグループ内のユーザのいくつかのデバイスに割り当てることができません。このままAppの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。デバイス名がアルファベット順で早い順にAppがデバイスに割り当てられます。",
  "generic_string_authorized_users_exceeds_available_licenses_for_multiple_apps_appleid_assignment": "%@ Appは部数が足りないため、このグループ内の何人かのユーザに割り当てることができません。このままAppの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。ユーザが“VPP管理配布”の登録を受け入れた順にAppが割り当てられます。",
  "generic_string_authorized_users_exceeds_available_licenses_for_multiple_apps_device_assignment": "%@ Appは部数が足りないため、このグループ内のユーザのいくつかのデバイスに割り当てることができません。このままAppの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。デバイス名がアルファベット順で早い順にAppがデバイスに割り当てられます。",
  "generic_string_authorized_users_exceeds_available_licenses_for_multiple_apps_maid_assignment": "%@ Appは部数が足りないため、このグループ内の何人かのユーザに割り当てることができません。このままAppの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。フルネームがアルファベット順で早いユーザから順にAppが割り当てられます。",
  "generic_string_authorized_users_exceeds_available_licenses_for_multiple_apps_mixed_assignment": "%@ Appは部数が足りないため、このグループ内の何人かのユーザとそのデバイスに割り当てることができません。このままAppの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。ユーザが“VPP管理配布”の登録を受け入れた順、割り当てられた“管理対象Apple ID”のフルネームがアルファベットで早い順、そしてデバイス名がアルファベット順で早いデバイスから順にAppが割り当てられます。",

  "_app_assignment_insufficient_licenses_warning_user_for_single_app_device_assignment": "“%@”は部数が足りないため、このユーザのデバイスに今すぐ割り当てることができません。このままAppの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。デバイス名がアルファベット順で早い順にAppがデバイスに割り当てられます。",
  "_app_assignment_insufficient_licenses_warning_user_for_single_app_appleid_assignment": "%@は1部も残っていないため、このユーザに今すぐ割り当てることができません。このままAppの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。ユーザが“VPP管理配布”の登録を受け入れた順にAppが割り当てられます。",
  "_app_assignment_insufficient_licenses_warning_user_for_single_app_maid_assignment": "%@は1部も残っていないため、このユーザに今すぐ割り当てることができません。このままAppの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。フルネームがアルファベット順で早いユーザから順にAppが割り当てられます。",
  "_app_assignment_insufficient_licenses_warning_user_for_multiple_apps_device_assignment": "%@個のAppは部数が足りないため、このユーザのデバイスに今すぐ割り当てることができません。このままAppの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。デバイス名がアルファベット順で早い順にAppがデバイスに割り当てられます。",
  "_app_assignment_insufficient_licenses_warning_user_for_multiple_apps_appleid_assignment": "%@個のAppは部数が足りないため、このユーザに今すぐ割り当てることができません。このままAppの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。ユーザが“VPP管理配布”の登録を受け入れた順にAppが割り当てられます。",
  "_app_assignment_insufficient_licenses_warning_user_for_multiple_apps_maid_assignment": "%@個のAppは部数が足りないため、このユーザに今すぐ割り当てることができません。このままAppの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。フルネームがアルファベット順で早いユーザから順にAppが割り当てられます。",
  "_app_assignment_insufficient_licenses_warning_user_for_multiple_apps_mixed_assignment": "%@個のAppは部数が足りないため、このユーザとそのデバイスに今すぐ割り当てることができません。このままAppの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。ユーザが“VPP管理配布”の登録を受け入れた順、割り当てられた“管理対象Apple ID”のフルネームがアルファベットで早い順、そしてデバイス名がアルファベット順で早いデバイスから順にAppが割り当てられます。",

  "_app_assignment_insufficient_licenses_warning_device_group_for_multiple_apps_device_assignment": "%@個のAppは部数が足りないため、このグループ内のいくつかのデバイスに今すぐ割り当てることができません。このままAppの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。デバイス名がアルファベット順で早いデバイスから順にAppが割り当てられます。",
  "_app_assignment_insufficient_licenses_warning_device_group_for_single_app_device_assignment": "“%@”は部数が足りないため、このグループ内のいくつかのデバイスに今すぐ割り当てることができません。このままAppの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。デバイス名がアルファベット順で早いデバイスから順にAppが割り当てられます。",

  "_app_assignment_insufficient_licenses_warning_device_for_multiple_apps_device_assignment": "%@個のAppは部数が足りないため、このデバイスに今すぐ割り当てることができません。このままAppの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。デバイス名がアルファベット順で早いデバイスから順にAppが割り当てられます。",
  "_app_assignment_insufficient_licenses_warning_device_for_single_app_device_assignment": "“%@”は1部も残っていないため、このデバイスに今すぐ割り当てることができません。このままAppの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。デバイス名がアルファベット順で早いデバイスから順にAppが割り当てられます。",

  "generic_string_authorized_users_exceeds_available_licenses_for_single_book_appleid_assignment": "%@は部数が足りないため、このグループ内の何人かのユーザに割り当てることができません。このままブックの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。ユーザが“VPP管理配布”の登録を受け入れた順にブックが割り当てられます。",
  "generic_string_authorized_users_exceeds_available_licenses_for_single_book_maid_assignment": "%@は部数が足りないため、このグループ内の何人かのユーザに割り当てることができません。このままブックの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。フルネームがアルファベット順で早いユーザから順にブックが割り当てられます。",
  "generic_string_authorized_users_exceeds_available_licenses_for_multiple_books_appleid_assignment": "%@ブックは部数が足りないため、このグループ内の何人かのユーザに割り当てることができません。このままブックの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。ユーザが“VPP管理配布”の登録を受け入れた順にブックが割り当てられます。",
  "generic_string_authorized_users_exceeds_available_licenses_for_multiple_books_maid_assignment": "%@ブックは部数が足りないため、このグループ内の何人かのユーザに割り当てることができません。このままブックの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。フルネームがアルファベット順で早いユーザから順にブックが割り当てられます。",
  "generic_string_authorized_users_exceeds_available_licenses_for_multiple_books_mixed_assignment": "%@ブックは部数が足りないため、このグループ内の何人かのユーザに割り当てることができません。このままブックの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。ユーザが“VPP管理配布”の登録を受け入れた順に、そして割り当てられた“管理対象Apple ID”のフルネームがアルファベットで早い順にブックが割り当てられます。",

  "_book_assignment_insufficient_licenses_warning_user_for_single_book_appleid_assignment": "%@は1部も残っていないため、このユーザに今すぐ割り当てることができません。このままブックの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。ユーザが“VPP管理配布”の登録を受け入れた順にブックが割り当てられます。",
  "_book_assignment_insufficient_licenses_warning_user_for_single_book_maid_assignment": "%@は1部も残っていないため、このユーザに今すぐ割り当てることができません。このままブックの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。フルネームがアルファベット順で早いユーザから順にブックが割り当てられます。",
  "_book_assignment_insufficient_licenses_warning_user_for_multiple_books_appleid_assignment": "%@冊のブックは部数が足りないため、このユーザに今すぐ割り当てることができません。このままブックの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。ユーザが“VPP管理配布”の登録を受け入れた順にブックが割り当てられます。",
  "_book_assignment_insufficient_licenses_warning_user_for_multiple_books_maid_assignment": "%@冊のブックは部数が足りないため、このユーザに今すぐ割り当てることができません。このままブックの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。フルネームがアルファベット順で早いユーザから順にブックが割り当てられます。",
  "_book_assignment_insufficient_licenses_warning_user_for_multiple_books_mixed_assignment": "%@冊のブックは部数が足りないため、ユーザに今すぐ割り当てることができません。このままブックの割り当て処理を進めた場合、1部が利用可能になった時点で自動的に割り当てられます。ユーザが“VPP管理配布”の登録を受け入れた順に、そして割り当てられた“管理対象Apple ID”のフルネームがアルファベットで早い順にブックが割り当てられます。",

  "_processing_vpp_on_user_group_to_assign_vpp_apps": "グループ情報が処理された後にVPP Appを割り当てることができます。",
  "_enabled_vpp_service_on_user_group_to_assign_vpp_apps": "VPP Appを割り当てるために、このグループでVPPサービスを有効にします。",
  "_processing_vpp_on_user_group_to_assign_vpp_books": "グループ情報が処理された後にブックを割り当てることができます。",
  "_enabled_vpp_service_on_user_group_to_assign_vpp_books": "VPPブックを割り当てるために、このグループでVPPサービスを有効にします。",
  "_generic_string_Assign Books": "ブックを割り当てる",
  "_generic_string_Trying to delete VPP books": "VPPブックを削除しています。",
  "_generic_string_Only enterprise books will be deleted": "一度割り当てられたVPPブックは削除できません。削除できるのはエンタープライズブックのみです。",
  "_generic_string_Activation Lock Settings": "アクティベーションロック設定",
  "_generic_string_Unsupervised DEP devices": "監視対象外のDEPデバイス",
  "_generic_string_Supervised DEP devices": "監視対象のDEPデバイス",
  "_generic_string_Supervised devices": "監視対象デバイス",
  "_generic_string_Enable Activation Lock": "アクティベーションロックを有効にする",
  "_generic_string_Allow Activation Lock after MDM enrollment": "アクティベーションロックを許可",
  "_generic_string_Allow Activation Lock if Bypass Code Available": "バイパスコードが使用可能な場合にのみアクティベーションロックを許可",
  '_enrollment_setting_string_Set Device Name': 'デバイス名を設定（監視対象のみ）',

  "_dep_configuration_require_enrollment": "ユーザが登録手順をスキップすることを許可しない",
  "_dep_configuration_require_enrollment_hint": "設定を完了する前にデバイスをMDMに登録する必要があります",
  "_dep_configuration_Prevent unenrollment": "登録解除を禁止",
  "_dep_configuration_Requires supervision on iOS": "iOSとtvOSでの監視を必須にします",
  "_dep_configuration_Requires supervision": "監視を必須にします",
  "_dep_configuration_Supervise": "監視",
  "_generic_string_Supervise (iOS only)": "監視（iOSとtvOSのみ）",
  "_generic_string_Enable supervision and prevent unenrollment": "監視を有効にします",
  "_generic_string_Allow Pairing": "Macとのペアリングを許可",
  "_generic_string_Enable education mode": "共有iPadとして構成",
  "_generic_string_Require credentials for enrollment": "登録に資格情報を要求",
  "_layout_tvos_setup_assistant_configuration_label_width": "70",
  "_generic_string_Setup Assistant Configuration (tvOS only)": "設定アシスタントの構成（tvOSのみ）",
  "_generic_string_Setup Assistant Configuration": "設定アシスタントの構成",
  "_tvos_setup_assistant_string_Language": "言語:",
  "_tvos_setup_assistant_string_Region": "地域:",
  "_tvos_setup_assistant_string_Script": "スクリプト:",
  "_generic_string_Setup Assistant Options": "設定アシスタントのオプション",
  '_generic_string_setup_assistant_options_description': '設定アシスタントで表示するオプションを選択します。非表示のオプションには最もプライベートな設定が使用されます。',
  "_generic_string_Location Services": "位置情報サービス",
  "_skip_setup_option_Move from Android": "Androidから移行",
  "_generic_string_Apple ID": "Apple ID",
  "_generic_string_Terms and Conditions": "利用条件",
  "_generic_string_Send Diagnostics": "App解析",
  "_generic_string_Siri": "Siri",
  "_skip_setup_option_tvos_siri": "Siriと音声入力",
  "_generic_string_Set Up as New or Restore": "新規設定または復元",
  "_skip_setup_option_Transfer Information": "情報を転送",
  "_skip_setup_option_Apps & Data": "Appとデータ",
  "_skip_setup_option_Set Up Your Apple TV": "Apple TVの設定",
  "_skip_setup_option_See the World": "世界を見よう",
  "_dep_option_Automatically advance through setup assistant": "設定アシスタントで自動的に進む",
  "_dep_option_Automatically advance through setup assistant (tvOS only)": "設定アシスタントで自動的に進む（tvOSのみ）",
  "_generic_string_Make MDM Mandatory": "MDMを必須にする",
  "_generic_string_User may not skip applying or remove the configuration returned by the MDM server": "ユーザはMDMサーバから返された構成の適用をスキップすることも構成を削除することもできません",
  "_skip_setup_options_iOS and macOS": "iOSとmacOS",
  "_skip_setup_options_iOS, tvOS and macOS": "iOS、tvOS、macOS",
  "_skip_setup_option_Passcode Lock": "パスコードロック",
  "_skip_setup_option_touchid_faceid": "Touch ID / Face ID",
  "_skip_setup_option_touchid": "Touch ID",
  "_skip_setup_option_applepay": "Apple Pay",
  '_skip_setup_option_Home Button': 'ホームボタン',
  "_skip_setup_option_displayzoom": "画面表示の拡大",
  '_dep_setup_assistant_option_True Tone Display': 'True Toneディスプレイ',
  "_skip_setup_options_iOS": "iOS",
  "_skip_setup_options_tvOS": "tvOS",
  "_skip_setup_options_macOS": "macOS",
  "_skip_setup_option_Registration": "登録",
  "_skip_setup_option_FileVault": "FileVault",
  "_skip_setup_option_Timezone": "時間帯",
  "_skip_setup_option_Watch Migration": "Apple Watch",
  "_dep_setup_option_TV Provider Sign In": "TVプロバイダにサインイン",
  "_skip_setup_option_OnBoarding": "新機能の概要",
  "_dep_setup_option_iCloud Diagnostics": "iCloud診断",
  "_dep_setup_option_TV home screen sync": "1つのホーム画面ですべてのApple TVに対応",
  "_dep_setup_option_TV Where is the Apple TV?": "Apple TVをどこに設置しますか?",
  "_dep_setup_option_Privacy": "プライバシー",
  "_dep_setup_option_iCloudStorage": "iCloudのデスクトップと書類",
  "_dep_setup_option_iMessage & FaceTime": "iMessageとFaceTime",
  "_dep_setup_option_Choose Your Look": "外観モードを選択",
  "_dep_setup_option_Screen Time": "スクリーンタイム",
  "_dep_setup_option_Keep Your Device Up to Date": "デバイスを最新の状態に保つ",
  "_dep_setup_option_Set Up Cellular": "モバイル通信を設定",

  "_layout_ios_edu_mode_user_count_label_width": "103",
  '_layout_dep_settings_shared_ipad_mode_user_count_width': '60',
  "_generic_string_Number of Users:": "ユーザ数:",
  "_layout__osx_setup_assistant_admin_info_label_width": "110",
  "_osx_setup_assistant_string_admin_Full Name": "フルネーム:",
  "_osx_setup_assistant_string_admin_Account Name": "アカウント名:",
  "_osx_setup_assistant_string_admin_Password": "パスワード:",
  "_osx_setup_assistant_string_admin_Password Verify": "確認:",
  "_osx_setup_assistant_string_show_admin_account_description": "“ユーザとグループ”に管理対象管理者アカウントを表示",

  "_osx_account_setup_options_header": "macOSアカウント設定アシスタントのオプション",
  "_osx_account_setup_options_prompt_user_for_account_creation": "ユーザにこのタイプのアカウントの作成を要求:",
  "_osx_account_setup_options_account_type_standard": "通常",
  "_osx_account_setup_options_account_type_admin": "管理者",
  "_osx_admin_account_info_header": "管理対象macOS管理者アカウント",
  "_osx_account_setup_options_create_admin_account": "管理対象macOS管理者アカウントを作成",

  "_generic_string_Enable Zoom": "ズーム機能を有効にする",
  "_generic_string_Enable Invert Colors": "”カラーを反転”を有効にする",
  "_generic_string_Enable AssistiveTouch": "AssistiveTouchを有効にする",
  "_generic_string_Enable Speak Selection": "選択項目の読み上げを有効にする",
  "_generic_string_Enable Mono Audio": "モノラルオーディオを有効にする",
  "_generic_string_Push Apps": "Appをプッシュ",
  "_generic_string_Push Books": "ブックをプッシュ",
  "_push_apps_string_push_when_tethered": "デバイスのテザリング時にプッシュ",
  "_generic_string_Remove Apps": "Appを削除",
  "_generic_string_Remove Books": "ブックを削除",
  "_generic_string_Schedule Software Updates": "アップデートをインストール",
  "_schedule_software_updates_action_description": "インストールするアップデートを選択します",
  "_schedule_software_updates_No Updates Available": "使用可能なアップデートなし",
  "_table_header_Devices": "デバイス",
  "_schedule_software_updates_button_title": "インストール",

  "_generic_string_The selected apps will be pushed to all eligible devices": "選択したAppは適格なすべてのデバイスにプッシュされます。",

  "_generic_string_Choose Apps": "Appを選択",
  "_generic_string_Choose Books": "ブックを選択",
  "_generic_string_Choose Books to push": "プッシュするブックを選択",
  "_push_apps_picker_string_push_apps_to_user_group_description": "割り当て済みApp Store AppまたはエンタープライズAppをプッシュできます。選択したAppは、このグループに属するユーザの適格なすべてのデバイスにプッシュされます。",
  "_push_apps_picker_string_push_apps_to_user_description": "割り当て済みApp Store AppまたはエンタープライズAppをプッシュできます。選択したAppはこのユーザの適格なデバイスにプッシュされます。",
  "_push_apps_picker_string_push_apps_to_device_description": "割り当て済みApp Store AppまたはエンタープライズAppをプッシュできます。選択したAppはこのデバイスにプッシュされます。",
  "_push_apps_picker_string_push_apps_to_device_group_description": "割り当て済みApp Store AppまたはエンタープライズAppをプッシュできます。選択したAppはこのグループの適格なすべてのデバイスにプッシュされます。",
  "_push_books_picker_string_push_books_to_user_group_description": "任意のエンタープライズブックをプッシュできます。選択したブックは、このグループに属するユーザの適格なすべてのデバイスにプッシュされます。",
  "_push_books_picker_string_push_books_to_user_description": "任意のエンタープライズブックをプッシュできます。選択したブックはこのユーザの適格なデバイスにプッシュされます。",
  "_push_books_picker_string_push_books_to_device_description": "任意のエンタープライズブックをプッシュできます。選択したブックはこのデバイスにプッシュされます。",
  "_push_books_picker_string_push_books_to_device_group_description": "任意のエンタープライズブックをプッシュできます。選択したブックはこのグループの適格なすべてのデバイスにプッシュされます。",
  "_remove_apps_picker_string_remove_apps_to_user_group_description": "インストール済みの管理対象Appを削除できます。選択したAppは、このグループに属するユーザの適格なすべてのデバイスから削除されます。",
  "_remove_apps_picker_string_remove_apps_to_user_description": "インストール済みの管理対象Appを削除できます。選択したAppはこのユーザの適格なデバイスから削除されます。",
  "_remove_apps_picker_string_remove_apps_to_device_description": "インストール済みの管理対象Appを削除できます。選択したAppはこのデバイスから削除されます。",
  "_remove_apps_picker_string_remove_apps_to_device_group_description": "インストール済みの管理対象Appを削除できます。選択したAppはこのグループの適格なすべてのデバイスから削除されます。",
  "_remove_books_picker_string_remove_books_to_user_group_description": "任意のエンタープライズブックを削除できます。選択したブックは、このグループに属するユーザの適格なすべてのデバイスから削除されます。",
  "_remove_books_picker_string_remove_books_to_user_description": "任意のエンタープライズブックを削除できます。選択したブックはこのユーザの適格なデバイスから削除されます。",
  "_remove_books_picker_string_remove_books_to_device_description": "任意のエンタープライズブックを削除できます。選択したブックはこのデバイスから削除されます。",
  "_remove_books_picker_string_remove_books_to_device_group_description": "任意のエンタープライズブックを削除できます。選択したブックはこのグループの適格なすべてのデバイスから削除されます。",


  "_generic_string_The selected apps are pushed to the user's eligible devices once they enroll in VPP Managed Distribution.": "選択したAppは、“VPP管理配布”に登録されると、ユーザの適格なデバイスにプッシュされます。",
  "_generic_string_1 user's eligible devices will receive the selected apps once they enrolled in VPP Managed Distribution.": "ユーザ1人の適格なデバイスは、“VPP管理配布”に登録されると、選択したAppを受信します。",
  "_generic_string_<count> users' eligible devices will receive the selected apps once they enrolled in VPP Managed Distribution.": "ユーザ%@1人の適格なデバイスは、“VPP管理配布”に登録されると、選択したAppを受信します。",
  "_generic_string_This user does not have an eligible device to receive the selected apps.": "このユーザには選択したAppを受信するための適格なデバイスがありません。",
  "_generic_string_1 user lacks any eligible devices and will not be pushed the selected apps.": "ユーザ1人に適格なデバイスがありません。選択したAppはプッシュされません。",
  "_generic_string_<count> users lack any eligible devices and the selected apps will not be pushed.": "ユーザ%@1人に適格なデバイスがありません。選択したAppはプッシュされません。",
  "_generic_string_<count> users lack any eligible devices and the selected books will not be pushed.": "ユーザ%@1人に適格なデバイスがありません。選択したブックはプッシュされません。",
  "_generic_string_The selected books will be pushed to all eligible devices of enrolled users.": "選択したブックは登録したユーザのすべての適格なデバイスにプッシュされます。",
  "_generic_string_The selected books will be pushed to all eligible devices of the enrolled user.": "選択したブックは登録したユーザのすべての適格なデバイスにプッシュされます。",
  "_generic_string_The selected books are pushed to the user's eligible devices once they enroll in VPP Managed Distribution.": "選択したブックは、“VPP管理配布”に登録されると、ユーザの適格なデバイスにプッシュされます。",
  "_generic_string_1 user's eligible devices will receive the selected books once they enrolled in VPP Managed Distribution.": "ユーザ1人の適格なデバイスは、“VPP管理配布”に登録されると、選択したブックを受信します。",
  "_generic_string_<count> users' eligible devices will receive the selected books once they enrolled in VPP Managed Distribution.": "ユーザ%@1人の適格なデバイスは、“VPP管理配布”に登録されると、選択したブックを受信します。",
  "_generic_string_This user does not have an eligible device to receive the selected books.": "このユーザには選択したブックを受信するための適格なデバイスがありません。",
  "_generic_string_1 user lacks any eligible devices and will not be pushed the selected books.": "ユーザ1人に適格なデバイスがありません。選択したブックはプッシュされません。",
  "_push_apps_picker_string_No Eligible Apps": "適格なAppがありません",
  "_push_books_picker_string_No Eligible Books": "適格なブックがありません",
  "_generic_string_Select All": "すべて選択",

  "_generic_string_Enable VPP services on this group to push VPP apps.": "VPP Appをプッシュするために、このグループでVPPサービスを有効にします。",
  "_generic_string_Enable VPP services on this group to push VPP books.": "VPPブックをプッシュするために、このグループでVPPサービスを有効にします。",

  "_generic_string_Allow modifying account settings (supervised only)": "アカウント設定の変更を許可（監視対象のみ）",
  '_generic_string_Allow modifying bluetooth settings': 'Bluetooth設定の変更を許可（監視対象のみ）',
  "_generic_string_Allow modifying Find My Friends settings (supervised only)": "“友達を探す”設定の変更を許可（監視対象のみ）",
  "_generic_string_Allow USB restricted mode (supervised only)": "デバイスのロック中もUSBアクセサリを許可（監視対象のみ）",
  "_generic_string_Allow pairing with non-Configurator hosts (supervised only)": "Configurator以外のホストとのペアリングを許可（監視対象のみ）",
  "_generic_string_Allow modifying cellular data settings (supervised only)": "モバイルデータ通信App設定の変更を許可（監視対象のみ）",
  "_generic_string_Allow modifying cellular plan settings (supervised only)": "モバイル通信プラン設定の変更を許可（監視対象のみ）",
  "_restriction_string_Allow modifying eSIM settings (supervised only)": "eSIM設定の変更を許可（監視対象のみ）",
  "_generic_string_Allow documents from managed sources in unmanaged destinations": "管理対象外出力先で管理対象ソースからの書類を許可",
  "_generic_string_Allow documents from unmanaged sources in managed destinations": "管理対象出力先で管理対象外ソースからの書類を許可",
  "_restrictions_string_Allow managed apps to write contacts to unmanaged contacts accounts": "管理対象Appが管理対象外の連絡先アカウントに連絡先を書き込むことを許可",
  "_restrictions_string_Allow unmanaged apps to read contacts from managed contacts accounts": "管理対象外Appが管理対象の連絡先アカウントから連絡先を読み込むことを許可",
  "_restriction_string_Treat AirDrop as unmanaged destination": "AirDropを管理対象外の出力先とみなす",
  "_restrictions_string_Allow Handoff": "Handoffを許可",
  "_generic_string_Allow Control Center on lock screen": "ロック画面にコントロールセンターを表示",
  "_generic_string_Show notifications view on lock screen": "ロック画面に通知センターを表示",
  "_generic_string_Show today view on lock screen": "ロック画面に今日表示を表示",
  "_ios_restriction_string_Defer software updates for ": "ソフトウェア・アップデートを",
  "_ios_restriction_string_suffix_days (supervised only)": "日延期（監視対象のみ）",
  "_layout_ios_restriction_defer_software_udpates_prefix_label_width": "205",
  "_layout_macos_restriction_defer_software_udpates_prefix_label_width": "205",
  "_macos_restriction_string_suffix_days": "日延期",
  "_generic_string_Allow user-generated content in Siri (supervised only)": "Siriでのユーザ生成コンテンツを許可（監視対象のみ）",
  "_generic_string_Allow AirDrop (supervised only)": "AirDropを許可（監視対象のみ）",
  "_generic_string_Require passcode on first AirPlay pairing": "最初のAirPlayペアリングでパスコードを要求",
  "_generic_string_Allow Print": "AirPrintを許可（監視対象のみ）",
  "_generic_string_Force Trusted TLS For AirPrint": "証明書が信頼されていない出力先へのAirPrintを禁止（監視対象のみ）",
  "_generic_string_Allow AirPrint iBeacon Discovery": "iBeaconを使ったAirPrintプリンタの検出を許可（監視対象のみ）",
  "_restriction_string_Allow storage of AirPrint credentials in Keychain": "キーチェーンへのAirPrint資格情報の保存を許可（監視対象のみ）",
  "restriction_string_Allow pairing with an Apple Watch": "Apple Watchとのペアリングを許可（監視対象のみ）",
  "restriction_string_Force Watch wrist detection": "Apple Watchの手首検出を強制",
  "_restriction_string_Force connection to managed Wi-Fi networks": "Wi-FiペイロードによってインストールされたWi-Fiネットワークのみに接続（監視対象のみ）",
  "_restriction_string_Allow setting up new nearby devices": "近くのデバイスの新規設定を許可（監視対象のみ）",
  "_restriction_string_Allow proximity based password sharing requests": "近接通信によるパスワード共有要求を許可（監視対象のみ）",

  "_restriction_string_allow_predictive_keyboard": "予測表示キーボードを許可（監視対象のみ）",
  "_restriction_string_allow_auto_correction": "自動修正を許可（監視対象のみ）",
  "_restriction_string_allow_spellcheck": "スペルチェックを許可（監視対象のみ）",
  "_restriction_string_Allow keyboard shortcuts": "キーボードショートカットを許可（監視対象のみ）",
  "_restriction_string_allow_define": "定義を許可（監視対象のみ）",
  "_restriction_string_allow_dictation": "音声入力を許可（監視対象のみ）",
  "_mac_restriction_string_allow_define": "“調べる”を許可",
  "_mac_restriction_string_Allow iTunes file sharing": "iTunesファイル共有を許可",
  "_mac_restriction_string_iTunes file sharing description": "iTunesを使った書類の転送を許可",

  "_generic_string_Prompt User To Enroll Device": "ユーザにデバイスの登録を要求",
  "_generic_string_Prompt the user in the setup assistant to enroll in device management": "設定アシスタントでユーザにデバイス管理への登録を要求します",
  "dep_accept_agreements_description": "プログラムのエージェントと管理者は、Apple Deployment Programs Webサイトにログインし、アップデートされた契約に同意してこのサービスを再度有効にする必要があります。",
  "dep_program_website": "Apple Deployment Programs Webサイト",

  // AD Certificate
  /* This is the name of the Setting Type for AD Cert settings. */
  "_ad_cert_knob_set_name": "AD証明書",
  /* This is a generic string used one or more times in the app. */
  "_generic_string_My AD Certificate": "自分のAD証明書",
  /* This layout gives the height of the description label of the description field in the AD Cert Payload*/
  "_layout_ad_cert_description_field_height": "40",
  "_ad_cert_Machine": "コンピュータ",
  "_ad_cert_User": "ユーザ",
  "_ad_cert_string_Allow access to all applications": "すべてのアプリケーションへのアクセスを許可",
  "_ad_cert_string_Allow all applications to access the certificate in the keychain": "すべてのアプリケーションにキーチェーン内の証明書へのアクセスを許可",
  "_ad_cert_string_Allow export from keychain": "キーチェーンからの書き出しを許可",
  "_ad_cert_string_Allow admin to export private key from the keychain": "管理者によるキーチェーンからの秘密鍵の書き出しを許可",
  "_ad_cert_string_Certificate Expiration Notification Threshold": "証明書の有効期限切れ通知のしきい値",
  "_ad_cert_string_The number of days before the certificate expires at which to start showing the expiration notification": "証明書の有効期限が切れる何日前から期限切れの予告通知を表示するかを指定",
  '_ad_cert_rsa_keysize_header_RSA Key Size': 'RSA鍵のサイズ',
  '_ad_cert_rsa_keysize_description': '証明書署名要求（CSR）のRSA鍵サイズ',

  // Global HTTP Proxy
  "_generic_string_Allow direct connection if PAC is unreachable": "PACが到達不能の場合に直接接続を許可",
  "_generic_string_Allow bypassing proxy to access captive networks": "キャプティブネットワークにアクセスするためプロキシのバイパスを許可",

  // Network
  "_generic_string_PAC Fallback": "PAC予備",
  "_generic_string_Enable to allow direct connection if PAC is unreachable": "“PACが到達不能の場合に直接接続を許可”を有効にする",
  "_generic_string_Legacy Hotspot": "レガシーホットスポット",
  "_generic_string_Passpoint": "Passpoint",
  "_generic_string_Provider Display Name": "プロバイダの表示名",
  "_generic_string_Display name of the Passpoint service provider": "Passpointサービスプロバイダの名前を表示",
  "_generic_string_Domain Name": "ドメイン名",
  "_generic_string_Domain name of the Passpoint service provider": "Passpointサービスプロバイダのドメイン名",
  "_generic_string_Roaming Consortium OIs": "ローミングコンソーシアムOI",
  "_generic_string_Roaming Consortium Organization Identifiers": "ローミングコンソーシアムの組織識別子",
  "_generic_string_Roaming Consortium OI": "ローミングコンソーシアムOI",
  "_generic_string_NAI Realm Names": "NAIの領域名",
  "_generic_string_Network Access Identifier Realm Names": "ネットワークアクセス識別子の領域名",
  "_generic_string_NAI Realm Name": "NAIの領域名",
  "_generic_string_MCC/MNCs": "MCC/MNC",
  "_generic_string_Mobile Country Code and Mobile Network Configurations": "モバイル国コードとモバイルネットワーク構成",
  "_generic_string_MCC": "MCC",
  "_generic_string_MNC": "MNC",
  "_generic_string_Connect to roaming partner Passpoint networks": "ローミングパートナーのPasspointネットワークに接続",
  "_generic_string_Add Mobile Country Code and Mobile Network Configuration": "モバイル国コードとモバイルネットワーク構成を追加",
  "_generic_string_MCC:": "MCC:",
  "_generic_string_MNC:": "MNC:",

  // Web Content Filter
  "_global_web_content_filter_knob_set_name": "コンテンツフィルタ",
  "_global_web_content_filter_knob_set_description": "このセクションを使用して、デバイスからアクセス可能なURLを構成します。これらの設定は監視対象デバイスにのみ適用されます。",
  "_global_web_content_filter_knob_set_num_lines": "1",
  "_generic_string_Filter Type": "フィルタタイプ",
  "_web_content_filter_Limit Adult Content": "内蔵: アダルトコンテンツを制限",
  "_web_content_filter_Specific Websites Only": "内蔵: 指定したWebサイトのみ",
  "_web_content_filter_Plug-in": "プラグイン",
  "_web_content_filter_Permitted URLs": "許可されたURL",
  "_web_content_filter_Specific URLs that will be allowed": "許可される指定したURL",
  "_web_content_filter_Blacklisted URLs": "ブラックリストにあるURL",
  "_web_content_filter_Additional URLs that will not be allowed": "その他の許可されないURL",
  "_web_content_filter_Specific Websites": "指定したWebサイト",
  "_web_content_filter_Allowed URLs which will be shown as bookmarks": "ブックマークとして表示される許可されたURL",
  "_web_content_filter_URL": "URL",
  "_web_content_filter_Name": "名前",
  "_web_content_filter_Bookmark": "ブックマーク",
  "_web_content_filter_Add Bookmark": "ブックマークを追加",
  "_web_content_filter_Create web content bookmark": "ブックマークを作成",
  "_web_content_filter_Name:": "名前:",
  "_web_content_filter_URL:": "URL:",
  "_web_content_filter_Bookmark Path:": "ブックマークのパス:",
  "_web_content_filter_add_page_label_width": "150",
  "_web_content_URL_Placeholder": "http://example.com",
  "_content_filter_plugin_type_filter_name_header": "フィルタ名",
  "_content_filter_plugin_type_filter_name_description": "Appやデバイスでのフィルタの表示名",
  "_content_filter_plugin_type_plugin_id_header": "識別子",
  "_content_filter_plugin_type_plugin_id_description": "フィルタプラグインの識別子",
  "_content_filter_plugin_type_server_name_header": "サービスのアドレス",
  "_content_filter_plugin_type_server_name_description": "サービスのホスト名、IPアドレス、またはURL",
  "_content_filter_plugin_type_organization_header": "組織",
  "_content_filter_plugin_type_organization_description": "フィルタプラグインの組織",
  "_content_filter_plugin_type_user_account_header": "ユーザ名",
  "_content_filter_plugin_type_user_account_description": "サービス認証に使用するユーザ名",
  "_content_filter_plugin_type_filter_webkit": "WebKitトラフィックをフィルタ",
  "_content_filter_plugin_type_filter_socket": "ソケット・トラフィックをフィルタ",
  "_content_filter_custom_data_header": "カスタムデータ",
  "_content_filter_custom_data_description": "フィルタプラグイン用のカスタム構成データ",
  "_content_filter_type_width": "230",
  "_content_filter_plugin_type_password_header": "パスワード",
  "_content_filter_plugin_type_password_description": "サービス認証に使用するパスワード",
  "_content_filter_plugin_type_certificate_description": "サービス認証に使用する証明書",

  // AirPlay
  "_global_airplay_knob_set_name": "AirPlay",
  "_global_airplay_knob_set_description": "このセクションを使用して、AirPlay出力先に接続するための設定を定義します。",
  "_airplay_knob_set_num_lines": "1",
  "_generic_string_Restrict AirPlay destinations (supervised only)": "AirPlay出力先を制限（監視対象のみ）",
  "_generic_string_Only known AirPlay destinations will be available to the device": "既知のAirPlay出力先のみをデバイスで利用可能にします",
  "_generic_string_Add AirPlay Destinations": "AirPlay出力先を追加",
  "_generic_string_Add a known AirPlay destination to the device": "既知のAirPlay出力先をデバイスに追加",
  "_generic_string_Add by device name": "デバイス名で追加",
  "_generic_string_Pick from enrolled Apple TVs": "登録済みのApple TVから選択",
  "_generic_string_Device Type:": "デバイスの種類:",
  "_device_type_iOS": "iOS",
  "_device_type_macOS": "macOS",
  "_device_type_Apple TV": "Apple TV",

  // Single Sign On
  "_global_single_sign_on_knob_set_name": "シングルサインオン",
  "_global_single_sign_on_knob_set_description": "このセクションを使用してシングルサインオンを構成します。",
  "_single_sign_on_knob_set_num_lines": "1",
  "_generic_string_Principal Name": "プリンシパル名",
  "_generic_string_Principal name of the account": "アカウントのプリンシパル名",
  "_generic_string_Realm of the account": "アカウントの保護領域",
  "_single_sign_on_kerberos_renewal_certificate_title": "更新証明書",
  "_single_sign_on_kerberos_renewal_certificate_description": "ユーザ操作なしでKerberos資格情報を更新するときに使用する証明書",
  "_generic_string_Limit this account to specific URL patterns": "このアカウントを特定のURLパターンに制限",
  "_generic_string_This account will only be used for URLs that match the following patterns": "このアカウントは以下のパターンに一致するURLにのみ使用できます",
  "_generic_string_Limit this account to specific applications": "このアカウントを特定のアプリケーションに制限",
  "_generic_string_This account will only be used for the following application identifiers": "このアカウントは以下のアプリケーション識別子にのみ使用できます",

  // AirPrint
  "_global_airprint_knob_set_name": "AirPrint",
  "_airprint_knob_set_num_lines": "1",
  "_global_airprint_knob_set_description": "このセクションを使用して、AirPrintプリンタに接続するための設定を定義します。",
  "_generic_string_Printers available on the device": "デバイスで利用可能なプリンタ",
  "_table_header_IP Address": "IPアドレス",
  "_table_header_Port": "ポート",
  "_table_header_Resource Path": "リソースのパス",
  "_table_header_Use TLS": "TLSを使用",

  "_generic_string_IP Address:": "IPアドレス:",
  "_generic_string_Port:": "ポート:",
  "_generic_string_Resource Path:": "リソースのパス:",
  "_generic_string_Use TLS:": "TLSを使用:",
  "_layout_airplay_add_sheet_label_width": "120",
  "_generic_string_Add Printer": "プリンタを追加",

  "_generic_string_Enrollment Settings": "登録設定",
  "_enrollment_setting_allow_activation_lock": "MDM登録後に“アクティベーションロックを許可”コマンドを送信（監視対象のみ）",
  "_enrollment_setting_allow_activation_lock_with_bypass_code": "アクティベーションロックのバイパスコードを取得済みの場合のみコマンドを送信",

  // Fonts
  "_fonts_knob_set_name": "フォント",
  "_fonts_knob_set_num_lines": "1",
  "_fonts_knob_set_description": "このセクションを使用して、デバイスにインストールするTrueTypeおよびOpenTypeフォントを指定します。",
  "_generic_string_Font:": "フォント:",
  "_layout_fonts_label_width": "70",
  "_layout_fonts_upload_button_width": "100",

  "_xsan_knob_set_name": "Xsan",
  "_xsan_knob_set_description": "このセクションを使用してXsanを構成します",
  "_xsan_knob_set_num_lines": "1",
  "_header_string_Xsan_Network": "Xsanネットワーク",
  "_xsan_network_selection_description": "デバイスが接続するXsanネットワークを選択します",
  "_xsan_string_name_header": "Xsan名",
  "_xsan_string_name_description": "Xsanネットワークの名前",
  "_xsan_string_uuid_header": "Xsan UUID",
  "_xsan_string_uuid_description": "ネットワークのUUID",
  "_xsan_string_od_header": "Open Directoryサーバ",
  "_xsan_string_od_description": "XsanのOpen Directoryサーバのネットワークアドレス",
  "_xsan_string_authsecret_header": "認証シークレット",
  "_xsan_string_authsecret_description": "Xsanネットワークに接続するためのシークレット資格情報",
  "_xsan_config_type_custom": "カスタム",
  "_xsan_string_fs_name_servers_header": "ファイル・システム・ネーム・サーバ",
  "_xsan_string_fs_name_servers_description": "ファイル・システム・ネーム・サーバのホスト名またはIPアドレス",
  "_xsan_string_Automatic Mounts": "自動マウント",
  "_xsan_string_Only the following volumes": "以下のボリュームのみ",
  "_xsan_string_Everything except the following volumes": "以下のボリューム以外すべて",
  "_xsan_string_only_mount_description": "このリストに含まれないボリュームは、システム管理者がxsanctlのmountコマンドを使って手動でマウントできます",
  "_xsan_string_mount_everything_else_description": "この配列に含まれるボリュームは、システム管理者がxsanctlのmountコマンドを使って手動でマウントできます",
  "_layout_xsan_settings_automatic_button_types_button_width": "250",
  "_xsan_volume_name_placeholder": "/MyXsanVolume",
  "_xsan_string_Disallow distributed LAN client mount for the following volumes": "以下のボリュームでDistributed LAN Clientマウントを禁止",
  "_xsan_string_Prefer distributed LAN client mount for the following volumes": "以下のボリュームでDistributed LAN Clientマウントを優先",
  "_xsan_string_Use distributed LAN client to mount volumes": "ボリュームのマウントにDistributed LAN Clientを使用",


  "_managed_domains_knob_set_name": "ドメイン",
  "_managed_domains_knob_set_description": "このセクションを使用してドメインを構成します",
  "_managed_domains_knob_set_num_lines": "1",
  "_managed_domain_url_placeholder": "example.com",
  "_managed_web_domains_header": "管理対象のSafari Webドメイン",
  "_managed_web_domains_description": "ドメインのURLパターンがこれらと一致する書類は管理対象と見なされます",
  "_safari_password_domains_header": "Safariパスワード・ドメイン（監視対象のみ）",
  "_safari_password_domains_description": "パスワードの保存を許可するWebサイトのURLパターン",
  "_managed_email_domains_header": "マークされていないメールドメイン",
  "_managed_email_domains_description": "これらのドメインと一致しないメールアドレスは“メール”でマークされます",

  // App Configuration
  "_app_configuration_knob_set_name": "App構成",
  "_app_configuration_knob_set_description": "このセクションを使用してApp固有の設定を構成します",
  "_app_configuration_knob_set_num_lines": "1",
  "_app_configuration_string_bundle_id_header": "バンドルID",
  "_app_configuration_string_bundle_id_description": "Appのバンドル識別子（ペイロードごとに一意）",
  "_app_configuration_string_Configuration:": "構成:",
  "_layout_app_configuration_label_width": "40",
  "_app_configuration_string_No config uploaded": "アップロードされた構成はありません",
  "_layout_app_configuration_upload_button_width": "90",

  // Directory
  "_directory_knob_set_name": "ディレクトリ",
  "_directory_knob_set_num_lines": "1",
  "_directory_knob_set_description": "このセクションを使用してディレクトリの設定を定義します。",
  "_directory_string_Directory Type": "ディレクトリのタイプ",
  "_directory_string_The type of directory server configured with this policy": "このポリシーで構成するディレクトリサーバのタイプ",
  "_directory_layout_directory_type_button_width": "150",
  "_directory_Active Directory": "Active Directory",
  "_directory_Open Directory/LDAP": "Open Directory/LDAP",
  "_directory_string_Server Hostname": "サーバのホスト名",
  "_directory_string_The hostname of the directory server": "ディレクトリサーバのホスト名",
  "_directory_string_The directory server username": "ディレクトリサーバのユーザ名",
  "_directory_string_The directory server password": "ディレクトリサーバのパスワード",
  "_directory_string_Client ID": "クライアントID",
  "_directory_string_The directory server client ID": "ディレクトリサーバのクライアントID",
  "_directory_string_Create mobile account at login": "ログイン時にモバイルアカウントを作成",
  "_directory_string_Require confirmation before creating mobile account": "モバイルアカウントを作成する前に確認を要求",
  "_directory_string_Force local home directory on startup disk": "ローカル・ホームディレクトリを起動ディスクに設定",
  "_directory_string_Use UNC path from Active Directory to derive network home location": "Active DirectoryからのUNCパスを使用してネットワークホームを設定",
  "_directory_string_Mount Style": "マウント形式",
  "_directory_string_Network protocol to be used to mount home directory": "ホームディレクトリのマウントに使用するネットワークプロトコル",
  "_directory_string_Default user shell": "デフォルトのユーザシェル",
  "_directory_string_Map UID to attribute": "UIDを属性にマップ",
  "_directory_string_Map user GID to attribute": "ユーザGIDを属性にマップ",
  "_directory_string_Map group GID to attribute": "グループGIDを属性にマップ",
  "_directory_string_Preferred domain server": "優先するドメインサーバ",
  "_directory_string_Allow administration": "管理を許可",
  "_directory_string_All members of these groups will have administrator privileges on this computer": "これらのグループの全メンバーに対して、このコンピュータの管理者権限が与えられます",
  "_directory_string_<group name>": "<グループ名>",
  "_directory_string_Allow authentication from any domain in the forest": "フォレスト内の任意のドメインから認証",
  "_directory_string_Namespace": "名前空間",
  "_directory_mount_style_forest": "フォレスト",
  "_directory_mount_style_domain": "ドメイン",
  "_directory_string_Packet signing": "パケットの署名",
  "_directory_string_Packet encryption": "パケットの暗号化",
  "_directory_mount_style_allow": "許可",
  "_directory_mount_style_disable": "無効",
  "_directory_mount_style_require": "必須",
  "_directory_mount_style_ssl": "ssl",
  "_directory_string_Restrict DDNS": "DDNSを制限",
  "_directory_string_<interface name>": "<インターフェイス名>",
  "_directory_string_Password trust interval": "パスワードの信頼間隔",
  "_directory_string_Organizational Unit": "部署",
  "_directory_string_The directory server organizational unit": "ディレクトリサーバの組織単位",
  "_directory_string_How often to change computer trust account password in days": "コンピュータの信頼アカウントパスワードを変更する頻度（日単位）",
  "_directory_mount_style_afp": "afp",
  "_directory_mount_style_smb": "smb",
  "_directory_string_User Experience": "ユーザ環境",
  "_directory_string_Mappings": "マッピング",
  "_directory_string_Administrative": "管理",

  // SCEP
  /* This is the name of the SCEP Settings. */
  "_scep_knob_set_name": "SCEP",

  /* This is the label for SCEP Settings's Name Field. */
  "_admin_scep_knob_set_view_name_field_label": "名前",

  /* This is the label for SCEP Setting's Fingerprint Field. */
  "_admin_scep_knob_set_view_fingerprint_field_label": "フィンガープリント",

  /* This is the label for SCEP Setting's URL Field. */
  "_admin_scep_knob_set_view_url_field_label": "URL",

  /* This is the description for SCEP Setting's Name Field. */
  "_admin_scep_knob_set_view_name_field_description": "インスタンスの名前: CA-IDENT",

  /* This is the label for SCEP Setting's Challenge Field. */
  "_admin_scep_knob_set_view_challenge_field_label": "チャレンジ",

  /* This is the description for SCEP Setting's Fingerprint Field. */
  "_admin_scep_knob_set_view_fingerprint_field_description": "フィンガープリントとして使用する16進数文字列を入力します",
  "_admin_scep_knob_set_Allow access to all apps (macOS only)": "すべてのアプリケーションへのアクセスを許可（macOSのみ）",
  "_scep_string_Certificate Expiration Notification Threshold (macOS only)": "証明書の有効期限切れ通知のしきい値（macOSのみ）",
  "_scep_string_The number of days before the certificate expires at which to start showing the expiration notification": "証明書の有効期限が切れる何日前から期限切れの予告通知を表示するかを指定します",


  // Exchange
  "_exchange_knob_set_name": "Exchange",
  "_exchange_string_Enable S/MIME Signing": "S/MIME署名を有効にする",
  "_exchange_string_Enable S/MIME Encryption": "S/MIME暗号化を有効にする",
  "_exchange_string_Support S/MIME signing for this account": "このアカウントでS/MIME署名をサポートします",
  "_exchange_string_Support S/MIME encryption for this account": "このアカウントでS/MIME暗号化をサポートします",
  "_exchange_string_Signing Certificate": "署名証明書",
  "_exchange_string_Certificate used to sign messages sent to this account": "このアカウントから送信するメッセージの署名に使用する証明書",
  "_exchange_string_Encryption Certificate": "暗号化証明書",
  "_exchange_string_Certificate used to decrypt messages sent to this account": "このアカウントで受信するメッセージの暗号解除に使用する証明書",
  "_exchange_knob_set_Use OAuth for authentication": "認証にOAuthを使用",
  "_exchange_knob_set_OAuth Sign in URL": "OAuthサインインURL",

  // From Servermgr label widths
  "_layout_servermgr_card_dav_label_width": "140",
  "_layout_servermgr_cal_dav_label_width": "140",
  "_layout_servermgr_ichat_label_width": "140",
  "_layout_servermgr_email_label_width": "140",
  "_layout_servermgr_vpn_label_width": "200",
  "_layout_servermgr_osxserver_account_label_width": "270",

  /* IKEv2 VPN */
  '_vpn_type_string_pptp': 'PPTP（iOS 9以前とOS X 10.11以前）',
  "_vpn_type_string_IKEv2": "IKEv2",
  "_vpn_ikev2_local_identifier_header": "ローカル識別子",
  "_vpn_ikev2_local_identifier_description": "FQDN、UserFQDN、アドレス、またはASN1DNローカル識別子",
  "_vpn_ikev2_remote_identifier_header": "リモート識別子",
  "_vpn_ikev2_remote_identifier_description": "FQDN、UserFQDN、アドレス、またはASN1DNリモート識別子",
  "_vpn_type_string_always_on": "VPNを常にオン（iOS監視対象のみ）",
  "_vpn_type_Cisco Legacy AnyConnect": "Cisco Legacy AnyConnect",
  "_vpn_type_Cisco AnyConnect": "Cisco AnyConnect",
  '_vpn_string_Send all traffic through VPN': 'すべてのトラフィックをVPN経由で送信',
  "_vpn_ikev2_extended_auth_header": "EAPを有効にする",
  "_vpn_ikev2_extended_auth_description": "拡張認証を有効にします",
  "_vpn_ikev2_eap_authentication_type_header": "EAP認証",
  "_vpn_ikev2_eap_authentication_type_password": "ユーザ名/パスワード",
  "_vpn_ikev2_dead_peer_detection_interval_header": "DPD（デッドピア検出）の間隔",
  "_vpn_ikev2_dead_peer_detection_interval_description": "KeepAliveの送信間隔",
  "_vpn_ikev2_dead_peer_detection_interval_disable": "無効にする",
  "_vpn_ikev2_dead_peer_detection_interval_low": "低",
  "_vpn_ikev2_dead_peer_detection_interval_medium": "中",
  "_vpn_ikev2_dead_peer_detection_interval_high": "高",
  "_vpn_ikev2_disable_redirect": "リダイレクトを無効にする",
  "_vpn_ikev2_disable_mobike": "モバイル環境とマルチホーミングを無効にする",
  "_vpn_ikev2_use_internal_subnet_attributes": "IPv4 / IPv6内部サブネットの属性を使用",
  "_vpn_ikev2_Enable NAT keepalive offload": "デバイスのスリープ中もNAT KeepAliveを有効にする",
  "_vpn_ikev2_Enable perfect forward secrecy": "Perfect Forward Secrecyを有効にする",
  "_vpn_ikev2_Enable certificate revocation check": "証明書失効チェックを有効にする",
  "_vpn_ikev2_nat_keepalive_interval_header": "NAT KeepAliveの間隔",
  "_vpn_ikev2_nat_keepalive_interval_description": "しきい値の最小値は20秒です",
  "_vpn_ikev2_nat_keepalive_interval_field_width": "50",
  "_vpn_ikev2_server_certificate_type_header": "証明書のタイプ",
  "_vpn_ikev2_server_certificate_type_description": "サーバ証明書のタイプ",
  "_vpn_ikev2_certificate_type_RSA": "RSA",
  "_vpn_ikev2_certificate_type_ECDSA256": "ECDSA256",
  "_vpn_ikev2_certificate_type_ECDSA384": "ECDSA384",
  "_vpn_ikev2_certificate_type_ECDSA521": "ECDSA521",
  "_vpn_ikev2_server_certificate_common_name_header": "サーバ証明書のコモンネーム",
  "_vpn_ikev2_server_certificate_common_name_description": "サーバ証明書のコモンネーム",
  "_vpn_ikev2_server_certificate_issuer_common_name_header": "サーバ証明書発行者のコモンネーム",
  "_vpn_ikev2_server_certificate_issuer_common_name_description": "サーバ証明書発行者のコモンネーム",
  "_vpn_ikev2_security_association_params_header": "SA（Security Association）パラメータ",
  "_vpn_ikev2_ike_security_association_params": "IKE SAパラメータ",
  "_vpn_ikev2_child_security_association_params": "子SAパラメータ",
  "_vpn_ikev2_encryption_algorithm_header": "暗号化アルゴリズム",
  "_vpn_ikev2_encryption_algorithm_description": "暗号化アルゴリズム",
  "_vpn_ikev2_encryption_algorithm_type_DES": "DES",
  "_vpn_ikev2_encryption_algorithm_type_3DES": "3DES",
  "_vpn_ikev2_encryption_algorithm_type_AES-128": "AES-128",
  "_vpn_ikev2_encryption_algorithm_type_AES-256": "AES-256",
  "_vpn_ikev2_encryption_algorithm_type_AES-128-GCM": "AES-128-GCM",
  "_vpn_ikev2_encryption_algorithm_type_AES-256-GCM": "AES-256-GCM",
  "_vpn_ikev2_integrity_algorithm_header": "整合性アルゴリズム",
  "_vpn_ikev2_integrity_algorithm_description": "整合性アルゴリズム",
  "_vpn_ikev2_integrity_algorithm_type_SHA1-96": "SHA1-96",
  "_vpn_ikev2_integrity_algorithm_type_SHA1-160": "SHA1-160",
  "_vpn_ikev2_integrity_algorithm_type_SHA2-256": "SHA2-256",
  "_vpn_ikev2_integrity_algorithm_type_SHA2-384": "SHA2-384",
  "_vpn_ikev2_integrity_algorithm_type_SHA2-512": "SHA2-512",
  "_vpn_ikev2_diffie_hellman_group_header": "Diffie Hellmanグループ",
  "_vpn_ikev2_diffie_hellman_group_description": "Diffie Hellmanグループ",
  "_vpn_ikev2_lifetime_header": "存続期間",
  "_vpn_ikev2_lifetime_description": "存続期間（分単位）",
  "_vpn_ikev2_lifetime_field_width": "50",
  "_vpn_ikev2_authentication_method_none": "なし",
  "_ip_address_placeholder": "10.0.0.0",
  "_vpn_string_DNS server addresses": "DNSサーバアドレス",
  "_vpn_string_DNS search domains": "DNS検索ドメイン",
  "_vpn_string_DNS supplemental match domains": "DNS追加一致ドメイン",
  "_vpn_string_Domain Name": "ドメイン名",
  "_vpn_string_The primary domain of the tunnel": "トンネルのプライマリドメイン",
  "_vpn_string_Include supplemental domains in the resolver's list of search domains": "リゾルバの検索ドメインリストに追加ドメインを含める",

  /* Always On */
  "_vpn_always_on_use_same_tunnel_configuration": "モバイルデータ通信とWi-Fiに同じトンネル構成を使用",
  "_vpn_always_on_cellular_tunnel_config_tab": "セルラー",
  "_vpn_always_on_cellular_wifi_config_tab": "Wi-Fi",
  "_vpn_always_on_allow_ui_toggle": "ユーザによる自動接続の無効化を許可",
  "_vpn_always_on_service_exceptions": "サービスの例外",
  "_layout_vpn_always_on_service_exception_actions_width": "280",
  "_vpn_always_on_service_exception_allow_via_tunnel": "トンネル経由のトラフィックを許可",
  "_vpn_always_on_service_exception_allow_outside_tunnel": "トンネル外からのトラフィックを許可",
  "_vpn_always_on_service_exception_drop": "トラフィックを切断",
  "_vpn_always_on_service_exception_name_width": '170',
  "_vpn_always_on_service_voicemail": "留守番電話",
  "_vpn_always_on_service_airdrop": "AirDrop",
  "_vpn_always_on_service_airplay": "AirPlay",
  "_vpn_always_on_service_airprint": "AirPrint",
  "_vpn_always_on_service_cellular_services": "モバイルデータ通信サービス",
  "_vpn_always_on_allow_captive_web_sheet": "VPNトンネル外からのキャプティブWebSheetのトラフィックを許可",
  "_vpn_always_on_allow_all_captive_network_plugins": "VPNトンネル外からのすべてのキャプティブネットワークAppのトラフィックを許可",
  "_vpn_always_on_allow_whitelist_captive_network_plugins_header": "キャプティブネットワークAppのバンドル識別子",
  "_vpn_always_on_allow_whitelist_captive_network_plugins_description": "これらのAppのトラフィックはVPNトンネル外からでも許可されます。",
  "_vpn_always_on_captive_network_app_bundle_id_placeholder": "キャプティブネットワークAppのバンドルID",

  /* Energy Saver */
  "_energy_saver_knob_set_name": "省エネルギー",
  "_energy_saver_knob_set_description": "このセクションを使用して省エネルギーの設定を定義します。",
  "_energy_saver_num_lines": "1",
  "_energy_saver_Never": "しない",
  "_energy_saver_1 Minute": "1分",
  "_energy_saver_2 Minutes": "2分",
  "_energy_saver_3 Minutes": "3分",
  "_energy_saver_5 Minutes": "5分",
  "_energy_saver_10 Minutes": "10分",
  "_energy_saver_20 Minutes": "20分",
  "_energy_saver_30 Minutes": "30分",
  "_energy_saver_45 Minutes": "45分",
  "_energy_saver_1 Hour": "1時間",
  "_energy_saver_1 Hour 15 Minutes": "1時間15分",
  "_energy_saver_1 Hour 30 Minutes": "1時間30分",
  "_energy_saver_1 Hour 45 Minutes": "1時間45分",
  "_energy_saver_2 Hours": "2時間",
  "_layout_energy_saver_knob_set_power_settings_label_widths": "200",
  "_layout_energy_saver_knob_set_select_button_width": "130",


  // Parental Controls
  "_parental_controls_string_No Limit": "制限なし",
  "_change_modes_header_Change Modes": "モードを変更",
  "_change_modes_description_Update Assignment and Installation Mode": "割り当てとインストールモードをアップデート",
  "_change_modes_description_Update Installation Mode": "インストールモードをアップデート",
  "_change_modes_description_Update Assignment Mode": "割り当てモードをアップデート",
  "change_modes_label_width": "150",
  "_change_modes_string_Installation Mode:": "インストールモード:",
  "_change_modes_string_Assignment Mode:": "割り当てモード:",
  "_change_modes_cancel_button_title": "キャンセル",
  "_change_modes_update_button_title": "アップデート",
  "_change_modes_warning_message_one_enterprise_app_selected": "iOSエンタープライズAppに適用できるインストールモードは“自動”または“テザリング”のみであるため、“%@”のインストールモードは“手動”にはアップデートされません",
  "_change_modes_warning_message_multiple_enterprise_app_selected": "iOSエンタープライズAppに適用できるインストールモードは“自動”または“テザリング”のみであるため、%@個のAppのインストールモードは“手動”にはアップデートされません",
  "_change_modes_warning_message_one_osx_vpp_app_selected": "macOS VPPアプリケーションに適用できるインストールモードは“自動”または“手動”のみであるため、“%@”のインストールモードは“テザリング”にはアップデートされません",
  "_change_modes_warning_message_multiple_osx_vpp_app_selected": "macOS VPPアプリケーションに適用できるインストールモードは“自動”または“手動”のみであるため、%@個のアプリケーションのインストールモードは“テザリング”にはアップデートされません",
  "_change_modes_warning_message_enterprise_app_osx_vpp_app_selected": "iOSエンタープライズAppおよびmacOS VPPアプリケーションのインストールモードは固定されているため、%@個のAppのインストールモードはアップデートされない場合があります",
  "_change_modes_warning_message_one_tvos_enterprise_app_selected": "tvOSエンタープライズAppに適用できるのは自動インストールモードのみのため、“%@”のインストールモードはアップデートされません",
  "_change_modes_warning_message_multiple_tvos_enterprise_app_selected": "tvOSエンタープライズAppに適用できるのは自動インストールモードのみのため、%@個のAppのインストールモードはアップデートされません",

  "_change_modes_warning_message_one_enterprise_book_selected": "エンタープライズブックには割り当てモードがないため、“%@”の割り当てモードはアップデートされません",
  "_change_modes_warning_message_multiple_enterprise_book_selected": "エンタープライズブックには割り当てモードがないため、%@個のアプリケーションのインストールモードはアップデートされません",

  "_enrollment_settings_errors_header_single": "登録設定に1個のエラーがあります",
  "_enrollment_settings_errors_header_multiple": "登録設定に%@個のエラーがあります",

  // Server Account Payload
  '_osxserver_account_knob_set_deprecation_notice': 'このペイロードは推奨されず、今後リリースされるプロファイルマネージャで削除される予定です',
  "_layout_osxserver_account_knob_set_deprecation_notice_height": "45",
  "_osxserver_account_knob_set_name": "macOS Serverアカウント",
  "_osxserver_account_knob_set_description": "このセクションを使用してmacOS Server書類プロバイダを構成します",
  "_osxserver_account_knob_set_num_lines": "2",
  "_osxserver_account_knob_set_string_default_account_description": "自分のmacOS Serverアカウント",
  "_osxserver_account_knob_set_string_Account Description": "アカウントの説明",
  "_osxserver_account_knob_set_string_The display name of the Server Account": "macOS Serverアカウントの表示名",
  "_osxserver_account_knob_set_string_Hostname": "macOS Serverのホスト名またはIPアドレス",
  "_osxserver_account_knob_set_string_The hostname of the Server": "macOS Serverのホスト名またはIPアドレス",
  "_osxserver_account_knob_set_string_Username": "ユーザ名",
  "_osxserver_account_knob_set_string_The username of the Server Account": "macOS Serverアカウントのユーザ名",
  "_osxserver_account_knob_set_string_Password": "パスワード",
  "_osxserver_account_knob_set_string_The password for the Server Account": "macOS Serverアカウントのパスワード",
  "_osxserver_account_knob_set_string_Documents Server Port": "書類サーバポート",
  "_osxserver_account_knob_set_string_The port to connect to for the documents server": "書類サービスの接続先ポート",

  // Lock Screen Message Payload
  "_lock_screen_message_knob_set_name": "ロック画面のメッセージ",
  "_lock_screen_message_knob_set_description": "このセクションを使用してロック画面のメッセージを構成します。これらの設定は監視対象デバイスにのみ適用されます。",
  "_lock_screen_message_knob_set_num_lines": "2",
  "_lock_screen_message_knob_set_string_lost_message": "“紛失した場合の返却先”メッセージ *",
  '_lock_screen_message_knob_set_string_asset_tag_information': '資産タグ情報 *',
  '_lock_screen_message_knob_set_string_display_information': '* ログインウインドウとロック画面に両方のメッセージが表示されます。',

  // Proxy Servers Payload
  "_proxies_knob_set_name": "プロキシ",
  "_proxies_knob_set_description": "このセクションを使用してプロキシを構成します",
  "_proxies_knob_set_num_lines": "1",
  "_proxies_knob_set_string_Enable Web Proxy (HTTP)": "Webプロキシ（HTTP）を有効にする",
  "_proxies_knob_set_string_Hostname or IP address and port number for web proxy": "Webプロキシのホスト名またはIPアドレス、およびポート番号",
  "_proxies_knob_set_string_Enable Secure Web Proxy (HTTPS)": "保護されたWebプロキシ（HTTPS）を有効にする",
  "_proxies_knob_set_string_Hostname or IP address and port number for secure web proxy": "保護されたWebプロキシのホスト名またはIPアドレス、およびポート番号",
  "_proxies_knob_set_string_Enable FTP Proxy": "FTPプロキシを有効にする",
  "_proxies_knob_set_string_Hostname or IP address and port number for FTP proxy": "FTPプロキシのホスト名またはIPアドレス、およびポート番号",
  "_proxies_knob_set_string_Enable SOCKS Proxy": "SOCKSプロキシを有効にする",
  "_proxies_knob_set_string_Hostname or IP address and port number for SOCKS proxy": "SOCKSプロキシのホスト名またはIPアドレス、およびポート番号",
  "_proxies_knob_set_string_Enable Streaming Proxy (RTSP)": "ストリーミングプロキシ（RTSP）を有効にする",
  "_proxies_knob_set_string_Hostname or IP address and port number for streaming proxy": "ストリーミングプロキシのホスト名またはIPアドレス、およびポート番号",
  "_proxies_knob_set_string_Enable Gopher Proxy": "Gopherプロキシを有効にする",
  "_proxies_knob_set_string_Hostname or IP address and port number for gopher proxy": "Gopherプロキシのホスト名またはIPアドレス、およびポート番号",
  "_proxies_knob_set_string_Exceptions": "例外",
  "_proxies_knob_set_string_Bypass proxy settings for these Hosts & Domains": "プロキシ設定を使用しないホストとドメイン",
  "_proxies_knob_set_string_Use Passive FTP Mode (PASV)": "受動FTPモード（PASV）を使用",
  "_proxies_knob_set_string_Enable Automatic Proxy Configuration": "自動プロキシ構成を有効にする",
  "_proxies_knob_set_string_Automatic Proxy Configuration URL": "自動プロキシ構成のURL",
  "_proxies_exception_url_placeholder": "ローカルホスト",

  // Network Usage Rules Payload
  "_network_usage_rules_knob_set_name": "ネットワーク使用ルール",
  "_network_usage_rules_knob_set_description": "このセクションを使用して、管理対象Appによるモバイルデータ通信ネットワークの使用方法を指定します",
  "_network_usage_rules_knob_set_num_lines": "2",
  "_network_usage_rules_header_App Identifier": "App識別子",
  "_network_usage_rules_header_Allow Cellular Data": "モバイルデータ通信を許可",
  "_network_usage_rules_header_Allow Data Roaming": "データローミングを許可",
  "_layout_network_usage_rules_app_identifier_column_width": "140",
  "_layout_network_usage_rules_allow_cellular_data_column_width": "190",
  "_network_usage_rules_title_Network Usage Rules": "ネットワーク使用ルール",
  "_network_usage_rules_description_Specify how managed apps use cellular data networks": "管理対象Appによるモバイルデータ通信ネットワークの使用方法を指定します",
  "_application_bundle_identifier_placeholder": "com.mycompany.*",

  "_generic_string_Edit Book Name": "ブック名を編集",
  "_generic_string_Edit App Name": "App名を編集",
  "_generic_string_Use Two Factor Authentication": "2ファクタ認証を使用",
  "_no_enrolled_devices_warning_user": "このユーザ用に登録されたデバイスはありません。",
  "_no_enrolled_devices_warning_user_group": "このグループのメンバー用に登録されたデバイスはありません。",
  "_no_enrolled_devices_warning_device_group": "このデバイスグループには登録済みのデバイスがありません。",
  "_no_enrolled_devices_warning_sheet_width": "350",
  "_no_enrolled_devices_warning_sheet_height": "140",

  // Unmerge users
  '_layout_unmerge_users_sheet_width': "450",
  '_layout_unmerge_users_sheet_height': "220",
  "_unmerge_users_sheet_description": "%@の設定、App割り当て、ブック割り当て、デバイス割り当てを維持するアカウントを選択してください",
  "_unmerge_users_sheet_title": "結合されたユーザアカウントを分離",
  "_unmerge_users_sheet_apple_school_manager": "%@（Apple School Manager）",
  "_unmerge_users_sheet_open_directory": "%@（%@）",
  "_unmerge_button": "分離",
  "_merge_button": "結合",
  "_table_header_Account": "アカウント",
  "_generic_string_apple_school_manager": "Apple School Manager",

  // The window width will never be less than 1024, so this calculation is really useful only for locales other than english
  "_layout_access_device_portal_permission_min_width_for_no_wrap": "",
  "_layout_access_device_portal_permission_height": "40",
  "_layout_dep_enrollment_permission_min_width_for_no_wrap": "1110",
  "_layout_dep_enrollment_permission_height": "40",
  "_layout_configurator_enrollment_permission_min_width_for_no_wrap": "1061",
  "_layout_configurator_enrollment_permission_height": "40",

  "_set_none_os_type_for_application_confirmation": "このアプリケーションはOS関連付けが解除され、割り当てとインストールに利用できなくなります。既存の割り当ては保持されます。",
  "_set_osx_os_type_for_device_assignable_application_confirmation": "このアプリケーションは、ユーザ、グループ、デバイスグループ、およびmacOSデバイスへの割り当てとインストールに利用できるようになります。iOSデバイスへの既存の割り当ては削除されます。",
  "_set_ios_os_type_for_device_assignable_application_confirmation": "このアプリケーションは、ユーザ、グループ、デバイスグループ、およびiOSデバイスへの割り当てとインストールに利用できるようになります。macOSデバイスへの既存の割り当ては削除されます。",
  "_set_os_type_for_application_confirmation": "このアプリケーションは、ユーザとグループへの割り当てとインストールに利用できるようになります。",
  "_layout_update_app_os_type_alert_pane_width": "550",
  "_update_app_os_type_header": "OS関連付けを変更",

  // Passcode Policy
  '_passcode_policy_string_complex': '標準（8個以上の数字および文字）',
  '_passcode_policy_string_four': '4桁（4個の数字）',
  '_passcode_policy_string_six': '6桁（6個の数字）',

  // Delete Users
  "_generic_string_Delete Users": "ユーザを削除",
  "_delete_users_action_description": "デバイスから削除するユーザを選択",
  "_table_header_Forced": "強制",

  // iOS HomeScreen Layout Knobset
  "_home_screen_layout_knob_set_name": "ホーム画面のレイアウト",
  "_home_screen_layout_knob_set_settings_page_display_name": "ホーム画面のレイアウト（iOS）",
  "_home_screen_layout_knob_set_description": "このセクションを使用してiOSホーム画面のレイアウトを構成します。これらの設定は監視対象デバイスにのみ適用されます。",
  "_home_screen_layout_knob_set_num_lines": "2",
  "_home_screen_layout_knob_set_pages": "ページ",
  "_home_screen_layout_knob_set_page_with_number": "ページ%@",
  "_home_screen_layout_knob_set_Add Page": "ページを追加",
  "_home_screen_layout_knob_set_Remove Page": "ページを削除",
  "_home_screen_layout_knob_set_Add App": "アプリケーションを追加",
  "_home_screen_layout_knob_set_Add Folder": "フォルダを追加",
  "_home_screen_layout_knob_set_Add Web Clip": "Webクリップを追加",
  "_home_screen_layout_knob_set_Placeholder Folder Name": "フォルダ",
  "_home_screen_layout_knob_set_folder_name_format": '%@2のフォルダ“%@1”内のApp',
  "_layout_home_screen_layout_page_example_add_menu": "200",

  // tvOS HomeScreen Layout Knobset
  "_tvos_home_screen_layout_knob_set_name": "ホーム画面のレイアウト",
  "_tvos_home_screen_layout_knob_set_settings_page_display_name": "ホーム画面のレイアウト（tvOS）",
  "_tvos_home_screen_layout_knob_set_description": "このセクションを使用してtvOSホーム画面のレイアウトを構成します。これらの設定は監視対象デバイスにのみ適用されます。",
  "_tvos_home_screen_layout_knob_set_num_lines": "2",
  "_home_screen_layout_knob_set_tvos_folder_name_format": 'フォルダ“%@”内のApp',

  // Notifications Knobset
  "_notification_knob_set_name": "通知",
  "_notification_knob_set_description": "このセクションを使用してAppの通知設定を構成します。これらの設定は監視対象デバイスにのみ適用されます。",
  "_notification_knob_set_num_lines": "1",
  "_notification_knob_set_Notification Settings": "通知の設定",
  "_notification_knob_set_notification_settings_description": "Appの通知設定を構成",

  "_app_notification_settings_App Name": "App名",
  "_app_notification_settings_Allow Notifications": "通知を許可",
  "_app_notification_settings_Show in Notification Center": "通知センターに表示",
  "_app_notification_settings_Show in Lock Screen": "ロック画面に表示",
  "_app_notification_settings_Allow Sounds": "サウンドを許可",
  "_app_notification_settings_Allow Badging": "バッジを許可",
  "_app_notification_settings_Critical Alerts": "重大な通知",
  "_app_notification_settings_Show in CarPlay": "CarPlayに表示",
  "_app_notification_settings_Alert Style When Unlocked": "ロックされていないときの通知のスタイル",
  "_app_notification_settings_alert_style_description": "モーダル通知は、対応しないとほかの操作ができません。バナーは、上部に表示されて自動的に消えます。",
  "_app_notification_settings_alert_style_none": "なし",
  "_app_notification_settings_alert_style_banner": "バナー",
  "_app_notification_settings_alert_style_modal": "モーダル通知",
  "_layout_app_notification_settings_alert_style_button_width": "150",
  "_layout_app_notification_settings_sheet_height": "440",
  "_app_notification_settings_grouping_type_automatic": "自動",
  "_app_notification_settings_grouping_type_byapp": "App別",
  "_app_notification_settings_grouping_type_off": "オフ",
  "_app_notification_settings_Notification Grouping": "通知のグループ化",
  "_layout_app_notification_settings_grouping_type_button_width": "150",

  '_google_account_knob_set_name': 'Googleアカウント',
  '_google_account_knob_set_description': 'このセクションを使用してGoogleアカウントを構成します。ユーザは構成対象のアカウントへのログインを求められます。',
  '_google_account_knob_set_num_lines': '1',
  '_google_account_description_header': 'アカウントの説明',
  '_google_account_description': 'アカウントの表示名',
  '_google_account_name_header': 'アカウント名',
  '_google_account_name_description': 'アカウントのユーザのフルネーム',
  '_google_account_email_address_header': 'メールアドレス',
  '_google_account_email_address_description': 'アカウントのGoogleメールアドレス',

  '_layout_about_info_item_label_width': '275',
  '_layout_communication_service_name_label_width': '90',
  '_communication_service_rules_header': '通信サービスルール',
  '_communication_service_rules_description': 'このアカウントから連絡先と通話するときに使用するデフォルトApp',
  '_layout_knob_set_remove_app_selection_button_width': '75',

  '_vpn_knob_set_string_disconnect_on_idle_header': '待機時に接続解除',
  '_vpn_knob_set_string_disconnect_on_idle_description': '指定の待機時間後に接続を解除',
  '_vpn_knob_set_string_disconnect_on_idle_never': '常にしない',
  '_vpn_knob_set_string_disconnect_on_idle_after_interval': '一定期間後',
  '_vpn_knob_set_string_disconnect_on_idle_seconds': '秒',
  '_layout_vpn_knob_set_disconnect_idle_options_button_width': '100',

  "_tvos_restrictions_knob_set_name": "制限",
  "_tvos_restrictions_knob_set_settings_page_display_name": "制限（tvOS）",
  "_tvos_restrictions_knob_set_description": "このセクションを使用してApple TVの制限を構成します。",
  "_tvos_restrictions_knob_set_num_lines": "1",
  "_tvos_restriction_string_Allow Incoming AirPlay Requests": "AirPlayを許可（監視対象のみ）",
  "_tvos_restriction_string_Allow remote app pairing": "Remote Appとのペアリングを許可（監視対象のみ）",
  "_tvos_restriction_string_Allow modifying device name": "デバイス名の変更を許可（監視対象のみ）",
  "_tvos_restriction_string_Allow Apple Books (supervised only)": "Apple Booksを許可（監視対象のみ）",

  "_tvos_system_app_name_Movies": "ムービー",
  "_tvos_system_app_name_TV Shows": "テレビ番組",
  "_tvos_system_app_name_App Store": "App Store",
  "_tvos_system_app_name_Photos": "写真",
  "_tvos_system_app_name_Music": "ミュージック",
  "_tvos_system_app_name_Podcasts": "Podcast",
  "_tvos_system_app_name_Computers": "コンピュータ",
  "_tvos_system_app_name_Search": "検索",
  "_tvos_system_app_name_Settings": "設定",

  "_tvos_conference_room_display_knob_set_name": "会議室のディスプレイ",
  "_tvos_conference_room_display_knob_set_description": "このセクションを使用して、監視対象Apple TVを会議室ディスプレイモードにします。",
  "_tvos_conference_room_display_knob_set_num_lines": "2",
  "_tvos_conference_room_dispay_onscreen_message_header": "画面に表示されるメッセージ",
  "_tvos_conference_room_dispay_onscreen_message_description": "会議室ディスプレイモードで画面に表示されるメッセージ",

  "_managed_wifi_restriction_warning_header": "このバンドルで構成されている管理対象Wi-Fiネットワークはありません",
  "_managed_wifi_restriction_warning_description": "この設定バンドルが1つ以上のWi-Fiペイロードを含む設定バンドルより前に受け入れられると、デバイスのネットワーク接続がすべて失われる可能性があります。管理対象Wi-Fiの制限とWi-Fiペイロードは同じ設定バンドル内で構成してください。",
  "_managed_wifi_restriction_warning_action_OK": "OK",

  "_edu_class_actions_toolbar_button_title": "クラスの設定",
  "_classes_action_Configure Settings for Classes": "クラスの設定を構成",
  "_layout_edu_class_actions_menu_width": "225",
  "_layout_edu_class_settings_pane_height": "120",
  "_class_settings_header_Settings for Classes": "クラスの設定",
  "_class_setting_screen_observation_permission_description": "生徒のデバイスのAirPlayおよび画面表示アクセス権の変更を許可",
  "_edu_class_profile_name_Settings for Classes": "クラスの設定",

  "_download_ios_settings_button_title": "iOS",
  "_download_macos_settings_button_title": "macOS",
  "_download_tvos_settings_button_title": "tvOS",

  "_layout_shutdown_restart_warning_message_height": "60",
  "_shutdown_restart_task_warning_message": "パスコードが設定されたデバイスは、再起動後またはシステム終了後、ユーザによりロック解除されるまで、セキュリティ保護されたWi-Fiネットワークに再接続できなくなります。この間プロファイルマネージャはこのようなデバイスを管理できない可能性があります。",

  "_directory_user_warning_missing_single_maid": "ユーザ“%@”は、関連付けられた管理対象Apple IDがなく、共有iPadでクラス名簿に表示されません。",
  "_directory_user_warning_missing_multiple_maid": "%@人のユーザは、関連付けられた管理対象Apple IDがなく、共有iPadでクラス名簿に表示されません。",

  "_smart_card_knob_set_name": "スマートカード",
  "_smart_card_knob_set_description": "このセクションを使用してmacOSでのスマートカードのセキュリティ設定を構成します",
  "_smart_card_knob_set_num_lines": "1",
  "_smart_card_knob_set_string_allow_user_pairing_header": "ユーザによるペアリングを無効にする",
  "_smart_card_knob_set_string_allow_user_pairing_description": "ユーザが新しいスマートカードをペアリングするのを無効にします。既存のペアリングは有効のままになります。",
  "_smart_card_knob_set_string_allow_smart_card_header": "スマートカードを無効にする",
  "_smart_card_knob_set_string_allow_smart_card_description": "ログイン、認証、スクリーンセーバのロック解除に使用するスマートカードを無効にします。この変更を有効にするには再起動が必要です。",
  "_smart_card_knob_set_string_Require Smart Card": "スマートカードを必須にする",
  "_smart_card_knob_set_enforce_smart_card_description": "ログイン、認証、スクリーンセーバのロック解除にスマートカードの使用を必須にします。",
  "_smart_card_knob_set_Enable screensaver on Smart Card removal": "スマートカードが取り外されたらスクリーンセーバを有効にする",
  "_smart_card_knob_set_string_check_certificate_trust_header": "証明書の信頼検証を有効にする",
  "_smart_card_knob_set_string_check_certificate_trust_description": "スマートカードを有効にするには、システムが信頼する、有効期限内の証明書が必要です。",
  "_smart_card_knob_set_string_one_card_per_user_header": "ユーザごとにカード1枚に制限",
  "_smart_card_knob_set_string_one_card_per_user_description": "ユーザがペアリングできるスマートカードを1枚のみに制限します。既存のペアリングは有効のままになります。",

  "_system_migration_knob_set_name": "システムの移行",
  "_system_migration_knob_set_description": "このセクションを使用してシステム移行の設定を構成します",
  "_system_migration_knob_set_num_lines": "1",
  "_system_migration_knob_set_string_Custom Migration Paths": "Windowsのカスタム移行パス",
  "_system_migration_knob_set_string_custom_migration_paths_description": "Windowsからの移行のカスタムパス構成",
  "_layout_system_migration_knob_set_path_list_header_height": "40",
  "_layout_system_migration_knob_set_path_column_header_height": "20",
  "_system_migration_knob_set_string_header_Source Path": "移行元のパス",
  "_layout_system_migration_knob_set_source_path_header_width": "150",
  "_system_migration_knob_set_string_header_Source in User Home": "移行元をユーザホームで指定",
  "_layout_system_migration_knob_set_source_path_in_user_home_header_width": "130",
  "_system_migration_knob_set_string_header_Target Path": "移行先のパス",
  "_layout_system_migration_knob_set_target_path_header_width": "150",
  "_system_migration_knob_set_string_header_Target in User Home": "移行先をユーザホームで指定",
  "_layout_system_migration_knob_set_target_path_in_user_home_header_width": "130",
  "_system_migration_knob_set_source_path_example": "/path/to/source",
  "_system_migration_knob_set_target_path_example": "/path/to/target",

  "_tvos_airplay_security_knob_set_name": "AirPlayセキュリティ",
  "_tvos_airplay_knob_set_Security type": "セキュリティ",
  "_tvos_airplay_knob_set_Security type description": "AirPlayを使ってApple TVに接続するデバイスのセキュリティ要件。",
  "_tvos_airplay_knob_set_select_button_passcode_once": "初回パスコード",
  "_tvos_airplay_knob_set_select_button_passcode_always": "パスコード",
  "_tvos_airplay_knob_set_select_button_password": "パスワード",
  "_tvos_airplay_knob_set_select_button_none": "なし",
  "_tvos_airplay_knob_set_password": "AirPlayアクセスを制限するためのパスワードを入力",
  "_tvos_airplay_knob_set_password_information": "* AirPlayパスワードはプロファイルマネージャで設定できます。“デバイス”リストからApple TVを選択し、“情報”タブに移動して、“AirPlay”セクションを展開します",
  "_tvos_airplay_knob_set_num_lines": "2",
  "_tvos_airplay_knob_set_description": "このセクションを使用してAirPlayセキュリティの設定を構成します。",
  "_tvos_airplay_knob_set_settings_page_display_name": "AirPlayセキュリティ（tvOS）",
  "_tvos_airplay_knob_set_password_warning": "このApple TVにはAirPlayパスワードが設定されていません。セキュリティの種類が“パスワード”の場合、AirPlayパスワードが必須です。AirPlayパスワードはプロファイルマネージャで設定できます。“デバイス”リストからApple TVを選択し、“情報”タブを表示して、“AirPlay”セクションを展開します。",
  "_tvos_airplay_knob_set_select_access_button_width": "320",
  "_tvos_airplay_knob_set_select_security_button_width": "140",
  "_tvos_airplay_knob_set_Access": "アクセス",
  "_tvos_airplay_knob_set_access_type_description": "AirPlayを使ってApple TVに接続するデバイスのネットワーク要件。",
  "_tvos_airplay_knob_set_select_button_access_all_devices": "すべてのWi-Fiネットワーク上のデバイス",
  "_tvos_airplay_knob_set_select_button_access_wifi": "同じWi-Fiネットワーク上のデバイス",
  "_tvos_airplay_knob_set_security_type_none_description": "これはtvOS 11.2以前のみに対応しており、tvOS 11.3以降では初回に画面上でパスコード入力が必要です。",

  "_dns_proxy_knob_set_name": "DNSプロキシ",
  "_dns_proxy_knob_set_description": "このセクションを使用してDNSプロキシ設定を構成します。これらの設定は監視対象デバイスにのみ適用されます。",
  "_dns_proxy_knob_set_num_lines": "1",
  "_dns_proxy_knob_set_provider_configuration_label": "プロバイダ構成",
  "_dns_proxy_knob_set_provider_configuration_description": "ベンダー固有の構成値",
  "_dns_proxy_string_bundle_id_header": "AppバンドルID",
  "_dns_proxy_string_bundle_id_description": "DNSプロキシネットワーク機能拡張を含むAppのバンドル識別子",
  "_dns_proxy_string_provider_bundle_id_header": "プロバイダバンドルID",
  "_dns_proxy_string_provider_bundle_id_description": "使用するDNSプロキシネットワーク機能拡張のバンドル識別子",

  "_macos_extensions_knob_set_name": "機能拡張",
  "_macos_extensions_knob_set_description": "このセクションを使用して、macOSで許可する機能拡張を構成します",
  "_macos_extensions_knob_set_num_lines": "1",
  "_macos_extensions_knob_set_Extension Points": "機能拡張ポイント",
  "_macos_extensions_knob_set_extension_bundle_id_placeholder": "com.example.app.extension",
  "_macos_extensions_knob_set_Allowed Extensions": "許可された機能拡張",
  "_macos_extensions_knob_set_global_allowed_extensions_description": "デバイスでの実行を許可する機能拡張のバンドル識別子。このほかは、どの機能拡張ポイントからのどの機能拡張も禁止されます。",
  "_macos_extensions_knob_set_extension_point_based_allowed_extensions_description": "機能拡張ポイントごとの、実行を許可する機能拡張のバンドル識別子。許可リストが構成されていない機能拡張ポイントからの機能拡張はすべて実行が許可されます。",
  "_macos_extensions_knob_set_Disabled Extensions": "無効にされた機能拡張",

  "_macos_extensions_extension_point_name_All Extension Points": "すべての機能拡張ポイント",
  "_macos_extensions_extension_point_name_Action": "アクション",
  "_macos_extensions_extension_point_name_Audio Unit": "Audio Unit",
  "_macos_extensions_extension_point_name_Content Blocker": "コンテンツブロッカー",
  "_macos_extensions_extension_point_name_Finder Sync": "Finder同期",
  "_macos_extensions_extension_point_name_Photo Editing": "写真編集",
  "_macos_extensions_extension_point_name_Safari": "Safari",
  "_macos_extensions_extension_point_name_Share": "共有",
  "_macos_extensions_extension_point_name_Shared Links": "共有リンク",
  "_macos_extensions_extension_point_name_Smart Card Token": "スマートカード・トークン",
  "_macos_extensions_extension_point_name_Today": "今日",
  "_macos_extensions_extension_point_name_Xcode Source Editor": "Xcode Source Editor",
  "_macos_extensions_knob_set_Disallow all extension points": "すべての機能拡張ポイントを禁止",
  "_macos_extensions_knob_set_Allow all extension points": "すべての機能拡張ポイントを許可",
  "_macos_extensions_knob_set_Disallow some extension points": "一部の機能拡張ポイントを禁止",

  "_content_caching_knob_set_name": "コンテンツキャッシュ",
  "_content_caching_knob_set_description": "このセクションを使用してmacOSのコンテンツキャッシュ設定を構成します",
  "_content_caching_knob_set_num_lines": "2",
  "_content_caching_tab_header_General": "一般",
  "_content_caching_tab_header_Clients": "クライアント",
  "_content_caching_tab_header_Peers": "ピア",
  "_content_caching_tab_header_Parents": "ペアレント",
  "_content_caching_header_Cache Content For:": "キャッシュの対象:",
  "_layout_content_caching_content_cache_for_option_button_width": "470",
  "_content_caching_cache_content_for_devices using the same public IP address": "同じパブリックIPアドレスを使用するデバイス",
  "_content_caching_cache_content_for_devices using the same local networks": "同じローカルネットワークを使用するデバイス",
  "_content_caching_cache_content_for_devices using custom local networks": "カスタム・ローカルネットワークを使用するデバイス",
  "_content_caching_cache_content_for_devices using custom local networks with fallback": "カスタム・ローカルネットワークを使用するデバイス（フォールバックあり）",
  "_content_caching_header_My Local Networks:": "マイ・ローカルネットワーク:",
  "_layout_content_caching_local_network_option_button_width": "470",
  "_content_caching_my_local_networks_option_use one public IP address": "1つのパブリックIPアドレスを使用",
  "_content_caching_my_local_networks_option_use custom public IP addresses": "カスタムパブリックIPアドレスを使用",
  "_content_caching_header_Share content with:": "コンテンツの共有対象:",
  "_content_caching_share_content_with_option_content caches using the same public IP address": "同じパブリックIPアドレスを使用するコンテンツキャッシュ",
  "_content_caching_share_content_with_option_content caches using the same local networks": "同じローカルネットワークを使用するコンテンツキャッシュ",
  "_content_caching_share_content_with_option_content caches using custom local networks": "カスタム・ローカルネットワークを使用するコンテンツキャッシュ",
  "_content_caching_Listen Ranges": "リッスン範囲",
  "_content_caching_IP address ranges for the custom local networks": "カスタム・ローカルネットワークのIPアドレス範囲",
  "_content_caching_IP address ranges of the peers to accept connections from": "接続を受け入れるピアのIPアドレス範囲",
  "_content_caching_IP address ranges of the peers to query content from": "コンテンツ照会を受け入れるピアのIPアドレス範囲",
  "_content_caching_header_Auto Activate": "コンテンツキャッシュを自動的に有効にする",
  "_content_caching_auto_activate_description": "可能なときはコンテンツ・キャッシュ・サービスを自動的に有効にします。ユーザがコンテンツ・キャッシュ・サービスを無効にできないようにします。",
  "_content_caching_header_Content Type": "キャッシュするコンテンツのタイプ",
  "_content_caching_content_type_description": "共有コンテンツにはアプリケーションやソフトウェア・アップデートが含まれます。iCloudコンテンツには写真や書類が含まれます。",
  "_content_caching_content_type_shared": "共有コンテンツのみ",
  "_content_caching_content_type_shared_and_personal": "すべてのコンテンツ",
  "_content_caching_content_type_personal": "iCloudのコンテンツのみ",
  "_content_caching_header_Maximum Cache Size": "最大キャッシュサイズ",
  "_content_caching_cache_limit_description": "コンテンツキャッシュに使用する最大サイズ（バイト単位）。0に設定するとディスク領域が無制限に使用されます。",
  "_content_caching_header_Cache Location": "キャッシュ先",
  "_content_caching_data_path_description": "この設定を変更した場合、キャッシュ済みのコンテンツは古い場所から新しい場所に自動的には移動されません。パスの末尾は、/ライブラリ/Application Support/Apple/AssetCache/Data とする必要があります。",
  "_content_caching_header_Allow Internet Connection Sharing": "インターネット接続共有を許可",
  "_content_caching_tethered_caching_description": "このコンピュータのインターネット接続とキャッシュしたコンテンツを、USB接続されたiOSデバイスと共有することを許可します。",
  "_layout_content_caching_first_ip_address_header_width": "200",
  "_content_caching_ip_range_first": "10.0.0.0",
  "_content_caching_ip_range_last": "10.255.255.255",
  "_content_caching_public_ip_range_first": "17.0.0.0",
  "_content_caching_public_ip_range_last": "17.255.255.255",
  "_content_caching_knob_set_ip_range_list_header_Start IP Address": "開始IPアドレス",
  "_content_caching_knob_set_ip_range_list_header_End IP Address": "終了IPアドレス",
  "_layout_content_caching_knob_set_ip_range_list_header_height": "30",
  "_content_caching_listen_ranges_only_description": "リッスン範囲で指定されたクライアントにのみコンテンツを提供します",
  "_content_caching_header_Log Client Details": "クライアントの詳細をログに記録",
  "_content_caching_log_client_info_description": "コンテンツを要求したクライアントのIPアドレスとポート番号をログに記録します",
  "_content_caching_header_Port": "ポート",
  "_content_caching_port_description": "コンテンツ・キャッシュ・サービスがアップロードまたはダウンロード要求を受信するTCPポート。0に設定するとポートがランダムに選択されます。",
  "_content_caching_header_Parents IP Addresses": "ペアレントIPアドレス",
  "_content_caching_knob_set_parent_ip_address_placeholder": "10.0.0.1",
  "_content_caching_parent_selection_possible_First available": "利用可能な最初の項目",
  "_content_caching_parent_selection_possible_Random": "ランダム",
  "_content_caching_parent_selection_possible_Round robin": "ラウンドロビン",
  "_content_caching_parent_selection_possible_Sticky available": "利用可能なスティッキー",
  "_content_caching_parent_selection_possible_Hash": "ハッシュ",
  "_content_caching_header_Parent Selection Policy": "ペアレント選択ポリシー",
  "_content_caching_header_Peer Filter Ranges": "ピアフィルタ範囲",
  "_content_caching_header_Peer Listen Ranges": "ピアリッスン範囲",
  "_layout_content_caching_parent_selection_policy_button_width": "160",
  "_layout_content_caching_content_type_button_width": "170",

  "_macos_asam_app_bundle_indentifier_placeholder": "com.example.app",
  "_macos_asam_app_team_indentifier_placeholder": "team-identifier",
  "_layout_mac_restriction_knob_set_asam_app_header_height": "30",
  "_layout_mac_restriction_knob_set_bundle_id_header_width": "275",
  "_mac_restriction_knob_set_asam_app_header_Bundle Identifier": "バンドル識別子",
  "_mac_restriction_knob_set_asam_app_header_Team Identifier": "チーム識別子",
  "_mac_restrictions_Autonomous Single App Mode": "自律的シングルAppモード",

  "_macos_kernel_extensions_knob_set_name": "カーネル機能拡張",
  "_macos_kernel_extensions_knob_set_description": "このセクションを使用して、macOSのカーネル機能拡張ポリシーを構成します",
  "_macos_kernel_extensions_knob_set_num_lines": "1",
  "_macos_kernel_extensions_header_Allow User Overrides": "ユーザによる書き換えを許可",
  "_macos_kernel_extensions_allow_user_overrides_description": "ユーザによる追加のカーネル機能拡張の承認を許可",
  "_macos_kernel_extensions_header_Allowed Team Identifiers": "許可されたチーム識別子",
  "_mac_kernel_extensions_Allowed Kernel Extensions": "許可されたカーネル機能拡張",
  "_mac_kernel_extensions_allowed_extensions_description": "許可されるカーネル機能拡張のバンドル識別子およびチーム識別子。未署名のレガシーカーネル機能拡張には空のチーム識別子を使用してください。",
  "_macos_kernel_extension_indentifier_placeholder": "com.example.identifier",

  "_tvos_tv_remote_knob_set_name": "TV Remote",
  "_tvos_tv_remote_knob_set_name_tvos": "TV Remote（tvOS）",
  "_tvos_tv_remote_knob_set_description": "このセクションを使用して、Apple TVを操作できるiOSデバイスのリストを構成します",
  "_tvos_tv_remote_knob_set_num_lines": "1",
  "_ios_devices_with_mac_picker_Choose Devices": "デバイスを選択",
  "_tvos_remote_knob_set_Whitelisted iOS Devices": "ホワイトリストにあるiOSデバイス",
  "_tvos_remote_knob_set_whitelisted_ios_devices_description": "ホワイトリストにあるデバイスのRemote AppによるApple TVの操作を許可します",

  "_ios_tv_remote_knob_set_name": "TV Remote",
  "_ios_tv_remote_knob_set_description": "このセクションを使用して、Remote Appで操作できるApple TVのリストを構成します",
  "_ios_remote_knob_set_Whitelisted tvOS Devices": "ホワイトリストにあるApple TV",
  "_ios_remote_knob_set_whitelisted_ios_devices_description": "Apple TV Remote Appは指定のApple TVのみを操作できるようになります。リストを空にすると、すべてのApple TVを操作できるようになります。",
  "_ios_tv_remote_knob_set_num_lines": "1",
  "_ios_tv_remote_knob_set_name_ios": "TV Remote（iOS）",

  /* Region Names */
  "_region_name_Afghanistan": "アフガニスタン",
  "_region_name_Åland Islands": "オーランド諸島",
  "_region_name_Albania": "アルバニア",
  "_region_name_Algeria": "アルジェリア",
  "_region_name_American Samoa": "米領サモア",
  "_region_name_Andorra": "アンドラ",
  "_region_name_Angola": "アンゴラ",
  "_region_name_Anguilla": "アンギラ",
  "_region_name_Antarctica": "南極",
  "_region_name_Antigua and Barbuda": "アンティグア・バーブーダ",
  "_region_name_Argentina": "アルゼンチン",
  "_region_name_Armenia": "アルメニア",
  "_region_name_Aruba": "アルバ",
  "_region_name_Australia": "オーストラリア",
  "_region_name_Austria": "オーストリア",
  "_region_name_Azerbaijan": "アゼルバイジャン",
  "_region_name_Bahamas": "バハマ",
  "_region_name_Bahrain": "バーレーン",
  "_region_name_Bangladesh": "バングラデシュ",
  "_region_name_Barbados": "バルバドス",
  "_region_name_Belarus": "ベラルーシ",
  "_region_name_Belgium": "ベルギー",
  "_region_name_Belize": "ベリーズ",
  "_region_name_Benin": "ベナン",
  "_region_name_Bermuda": "バーミューダ",
  "_region_name_Bhutan": "ブータン",
  "_region_name_Bolivia (Plurinational State of)": "ボリビア多民族国",
  "_region_name_Bonaire, Sint Eustatius and Saba": "ボネール、シント・ユースタティウスおよびサバ",
  "_region_name_Bosnia and Herzegovina": "ボスニア・ヘルツェゴビナ",
  "_region_name_Botswana": "ボツワナ",
  "_region_name_Bouvet Island": "ブーベ島",
  "_region_name_Brazil": "ブラジル",
  "_region_name_British Indian Ocean Territory": "英領インド洋諸島",
  "_region_name_Brunei Darussalam": "ブルネイ",
  "_region_name_Bulgaria": "ブルガリア",
  "_region_name_Burkina Faso": "ブルキナファソ",
  "_region_name_Burundi": "ブルンジ",
  "_region_name_Cabo Verde": "カーボベルデ",
  "_region_name_Cambodia": "カンボジア",
  "_region_name_Cameroon": "カメルーン",
  "_region_name_Canada": "カナダ",
  "_region_name_Cayman Islands": "ケイマン諸島",
  "_region_name_Central African Republic": "中央アフリカ共和国",
  "_region_name_Chad": "チャド",
  "_region_name_Chile": "チリ",
  "_region_name_China": "中国",
  "_region_name_Christmas Island": "クリスマス諸島",
  "_region_name_Cocos (Keeling) Islands": "ココス（キーリング）諸島",
  "_region_name_Colombia": "コロンビア",
  "_region_name_Comoros": "コモロ",
  "_region_name_Congo": "コンゴ",
  "_region_name_Congo (Democratic Republic of the)": "コンゴ民主共和国",
  "_region_name_Cook Islands": "クック諸島",
  "_region_name_Costa Rica": "コスタリカ",

  "_region_name_Cuba": "キューバ",
  "_region_name_Curaçao": "キュラソー",
  "_region_name_Cyprus": "キプロス",
  "_region_name_Czechia": "チェコ共和国",
  "_region_name_Denmark": "デンマーク",
  "_region_name_Djibouti": "ジブチ",
  "_region_name_Dominica": "ドミニカ",
  "_region_name_Dominican Republic": "ドミニカ共和国",
  "_region_name_Ecuador": "エクアドル",
  "_region_name_Egypt": "エジプト",
  "_region_name_El Salvador": "エルサルバドル",
  "_region_name_Equatorial Guinea": "赤道ギニア",
  "_region_name_Eritrea": "エリトリア",
  "_region_name_Estonia": "エストニア",
  "_region_name_Ethiopia": "エチオピア",
  "_region_name_Falkland Islands (Malvinas)": "フォークランド諸島（マルナビス諸島）",
  "_region_name_Faroe Islands": "フェロー諸島",
  "_region_name_Fiji": "フィジー",
  "_region_name_Finland": "フィンランド",
  "_region_name_France": "フランス",
  "_region_name_French Guiana": "仏領ギアナ",
  "_region_name_French Polynesia": "仏領ポリネシア",
  "_region_name_French Southern Territories": "仏領南太平洋諸島",
  "_region_name_Gabon": "ガボン",
  "_region_name_Gambia": "ガンビア",
  "_region_name_Georgia": "ジョージア",
  "_region_name_Germany": "ドイツ",
  "_region_name_Ghana": "ガーナ",
  "_region_name_Gibraltar": "ジブラルタル",
  "_region_name_Greece": "ギリシャ",
  "_region_name_Greenland": "グリーンランド",
  "_region_name_Grenada": "グレナダ",
  "_region_name_Guadeloupe": "グアドループ",
  "_region_name_Guam": "グアム",
  "_region_name_Guatemala": "グアテマラ",
  "_region_name_Guernsey": "ガーンジー",
  "_region_name_Guinea": "ギニア",
  "_region_name_Guinea-Bissau": "ギニアビサウ",
  "_region_name_Guyana": "ガイアナ",
  "_region_name_Haiti": "ハイチ",
  "_region_name_Heard Island and McDonald Islands": "ハード島およびマクドナルド諸島",
  "_region_name_Holy See": "バチカン",
  "_region_name_Honduras": "ホンジュラス",
  "_region_name_Hong Kong": "香港",
  "_region_name_Hungary": "ハンガリー",
  "_region_name_Iceland": "アイスランド",
  "_region_name_India": "インド",
  "_region_name_Indonesia": "インドネシア",
  "_region_name_Iran (Islamic Republic of)": "イラン・イスラム共和国",
  "_region_name_Iraq": "イラク",
  "_region_name_Ireland": "アイルランド",
  "_region_name_Isle of Man": "マン島",
  "_region_name_Israel": "イスラエル",
  "_region_name_Italy": "イタリア",
  "_region_name_Jamaica": "ジャマイカ",
  "_region_name_Japan": "日本",
  "_region_name_Jersey": "ジャージー",
  "_region_name_Jordan": "ヨルダン",
  "_region_name_Kazakhstan": "カザフスタン",
  "_region_name_Kenya": "ケニア",
  "_region_name_Kiribati": "キリバス",
  "_region_name_Korea (Republic of)": "韓国（大韓民国）",
  "_region_name_Kuwait": "クウェート",
  "_region_name_Kyrgyzstan": "キルギスタン",

  "_region_name_Lebanon": "レバノン",
  "_region_name_Lesotho": "レソト",
  "_region_name_Liberia": "リベリア",
  "_region_name_Libya": "リビア",
  "_region_name_Liechtenstein": "リヒテンシュタイン",
  "_region_name_Lithuania": "リトアニア",
  "_region_name_Luxembourg": "ルクセンブルク",
  "_region_name_Macao": "マカオ",
  "_region_name_Macedonia (the former Yugoslav Republic of)": "マケドニア（旧ユーゴスラビア共和国）",
  "_region_name_Madagascar": "マダガスカル",
  "_region_name_Malawi": "マラウィ",
  "_region_name_Malaysia": "マレーシア",
  "_region_name_Maldives": "モルジブ",
  "_region_name_Mali": "マリ",
  "_region_name_Malta": "マルタ",
  "_region_name_Marshall Islands": "マーシャル諸島共和国",
  "_region_name_Martinique": "マルティニーク",
  "_region_name_Mauritania": "モーリタニア",
  "_region_name_Mauritius": "モーリシャス",
  "_region_name_Mayotte": "マヨット",
  "_region_name_Mexico": "メキシコ",
  "_region_name_Micronesia (Federated States of)": "ミクロネシア連邦",
  "_region_name_Moldova (Republic of)": "モルドバ共和国",
  "_region_name_Monaco": "モナコ",
  "_region_name_Mongolia": "モンゴル",
  "_region_name_Montenegro": "モンテネグロ",
  "_region_name_Montserrat": "モントセラト",
  "_region_name_Morocco": "モロッコ",
  "_region_name_Mozambique": "モザンビーク",
  "_region_name_Myanmar": "ミャンマー",
  "_region_name_Namibia": "ナミビア",
  "_region_name_Nauru": "ナウル",
  "_region_name_Nepal": "ネパール",
  "_region_name_Netherlands": "オランダ",
  "_region_name_New Caledonia": "ニューカレドニア",
  "_region_name_New Zealand": "ニュージーランド",
  "_region_name_Nicaragua": "ニカラグア",
  "_region_name_Niger": "ニジェール",
  "_region_name_Nigeria": "ナイジェリア",
  "_region_name_Niue": "ニウエ",
  "_region_name_Norfolk Island": "ノーフォーク島",
  "_region_name_Northern Mariana Islands": "北マリアナ諸島",
  "_region_name_Norway": "ノルウェー",
  "_region_name_Oman": "オマーン",
  "_region_name_Pakistan": "パキスタン",
  "_region_name_Palau": "パラオ",
  "_region_name_Palestine, State of": "パレスチナ国",
  "_region_name_Panama": "パナマ",
  "_region_name_Papua New Guinea": "パプアニューギニア",
  "_region_name_Paraguay": "パラグアイ",
  "_region_name_Peru": "ペルー",
  "_region_name_Philippines": "フィリピン",
  "_region_name_Pitcairn": "ピトケアン島",
  "_region_name_Poland": "ポーランド",
  "_region_name_Portugal": "ポルトガル",
  "_region_name_Puerto Rico": "プエルトリコ",
  "_region_name_Qatar": "カタール",
  "_region_name_Réunion": "レユニオン",
  "_region_name_Romania": "ルーマニア",
  "_region_name_Russian Federation": "ロシア連邦",
  "_region_name_Rwanda": "ルワンダ",
  "_region_name_Saint Barthélemy": "サン・バルテルミ",
  "_region_name_Saint Helena, Ascension and Tristan da Cunha": "セントヘレナ・アセンションおよびトリスタン・ダ・クーニャ",
  "_region_name_Saint Kitts and Nevis": "セントクリストファー・ネーヴィス",
  "_region_name_Saint Lucia": "セントルシア",
  "_region_name_Saint Martin (French part)": "サン・マルタン（フランス領）",
  "_region_name_Saint Pierre and Miquelon": "サンピエール島およびミクロン島",
  "_region_name_Saint Vincent and the Grenadines": "セントビンセントおよびグレナディン諸島",
  "_region_name_Samoa": "サモア",
  "_region_name_San Marino": "サンマリノ",
  "_region_name_Sao Tome and Principe": "サントメ・プリンシペ",
  "_region_name_Saudi Arabia": "サウジアラビア",
  "_region_name_Senegal": "セネガル",
  "_region_name_Serbia": "セルビア",
  "_region_name_Seychelles": "セーシェル",
  "_region_name_Sierra Leone": "シエラレオネ",
  "_region_name_Singapore": "シンガポール",
  "_region_name_Sint Maarten (Dutch part)": "シント・マールテン（オランダ領）",
  "_region_name_Slovakia": "スロバキア",
  "_region_name_Slovenia": "スロベニア",
  "_region_name_Solomon Islands": "ソロモン諸島",
  "_region_name_Somalia": "ソマリア",
  "_region_name_South Africa": "南アフリカ",
  "_region_name_South Georgia and the South Sandwich Islands": "サウスジョージア・サウスサンドウィッチ諸島",
  "_region_name_South Sudan": "南スーダン",
  "_region_name_Spain": "スペイン",
  "_region_name_Sri Lanka": "スリランカ",
  "_region_name_Sudan": "スーダン",
  "_region_name_Suriname": "スリナム",
  "_region_name_Svalbard and Jan Mayen": "スバールバル諸島およびヤンマイエン島",
  "_region_name_Swaziland": "スワジランド",
  "_region_name_Sweden": "スウェーデン",
  "_region_name_Switzerland": "スイス",
  "_region_name_Syrian Arab Republic": "シリア・アラブ共和国",
  "_region_name_Taiwan, Province of China[a]": "台湾（中国台湾省）",
  "_region_name_Tajikistan": "タジキスタン",
  "_region_name_Tanzania, United Republic of": "タンザニア連合共和国",
  "_region_name_Thailand": "タイ",
  "_region_name_Timor-Leste": "東ティモール",
  "_region_name_Togo": "トーゴ",
  "_region_name_Tokelau": "トケラウ",
  "_region_name_Tonga": "トンガ",
  "_region_name_Trinidad and Tobago": "トリニダード・トバゴ",
  "_region_name_Tunisia": "チュニジア",
  "_region_name_Turkey": "トルコ",
  "_region_name_Turkmenistan": "トルクメニスタン",
  "_region_name_Turks and Caicos Islands": "タークスおよびカイコス諸島",
  "_region_name_Tuvalu": "ツバル",
  "_region_name_Uganda": "ウガンダ",
  "_region_name_Ukraine": "ウクライナ",
  "_region_name_United Arab Emirates": "アラブ首長国連邦",
  "_region_name_United Kingdom of Great Britain and Northern Ireland": "グレート・ブリテンおよび北アイルランド連合王国",
  "_region_name_United States of America": "アメリカ合衆国",
  "_region_name_United States Minor Outlying Islands": "米領太平洋諸島",
  "_region_name_Uruguay": "ウルグアイ",
  "_region_name_Uzbekistan": "ウズベキスタン",
  "_region_name_Vanuatu": "バヌアツ",
  "_region_name_Venezuela (Bolivarian Republic of)": "ベネズエラ・ボリバル共和国",
  "_region_name_Viet Nam": "ベトナム",
  "_region_name_Virgin Islands (British)": "バージン諸島（英領）",
  "_region_name_Virgin Islands (U.S.)": "バージン諸島（米領）",
  "_region_name_Wallis and Futuna": "ウォリス・フトゥナ",
  "_region_name_Western Sahara": "西サハラ",
  "_region_name_Yemen": "イエメン",
  "_region_name_Zambia": "ザンビア",
  "_region_name_Zimbabwe": "ジンバブエ",

  /* Language Names */

  "_language_name_Abkhazian": "アプハジヤ語",
  "_language_name_Afar": "アファル語",
  "_language_name_Afrikaans": "アフリカーンス語",
  "_language_name_Akan": "アカン語",
  "_language_name_Albanian": "アルバニア語",
  "_language_name_Amharic": "アムハラ語",
  "_language_name_Arabic": "アラビア語",
  "_language_name_Aragonese": "アラゴン語",
  "_language_name_Armenian": "アルメニア語",
  "_language_name_Assamese": "アッサム語",
  "_language_name_Avaric": "アヴァル語",
  "_language_name_Avestan": "アヴェスター語",
  "_language_name_Aymara": "アイマラ語",
  "_language_name_Azerbaijani": "アゼルバイジャン語",
  "_language_name_Bambara": "バンバラ語",
  "_language_name_Bashkir": "バシキール語",
  "_language_name_Basque": "バスク語",
  "_language_name_Belarusian": "ベラルーシ語",
  "_language_name_Bengali": "ベンガル語",
  "_language_name_Bihari languages": "ビハール語",
  "_language_name_Bislama": "ビスラマ語",
  "_language_name_Bosnian": "ボスニア語",
  "_language_name_Breton": "ブルトン語",
  "_language_name_Bulgarian": "ブルガリア語",
  "_language_name_Burmese": "ビルマ語",
  "_language_name_Catalan, Valencian": "カタルーニャ語、ヴァレンシア語",
  "_language_name_Chamorro": "チャモロ語",
  "_language_name_Chechen": "チェチェン語",
  "_language_name_Chichewa, Chewa, Nyanja": "チチェワ語、チェワ語、ニャンジャ語",
  "_language_name_Chinese": "中国語",
  "_language_name_Chuvash": "チュバシ語",
  "_language_name_Cornish": "コーンウォール語",
  "_language_name_Corsican": "コルシカ語",
  "_language_name_Cree": "クリー語",
  "_language_name_Croatian": "クロアチア語",
  "_language_name_Czech": "チェコ語",
  "_language_name_Danish": "デンマーク語",
  "_language_name_Divehi, Dhivehi, Maldivian": "ディベヒ語、モルディブ語",
  "_language_name_Dutch, Flemish": "オランダ語、フラマン語",
  "_language_name_Dzongkha": "ゾンカ語",
  "_language_name_English": "英語",
  "_language_name_Esperanto": "エスペラント語",
  "_language_name_Estonian": "エストニア語",
  "_language_name_Ewe": "エウェ語",
  "_language_name_Faroese": "フェロー語",
  "_language_name_Fijian": "フィジー語",
  "_language_name_Finnish": "フィンランド語",
  "_language_name_French": "フランス語",
  "_language_name_Fulah": "フラ語",
  "_language_name_Galician": "ガリシア語",
  "_language_name_Georgian": "ジョージア語",
  "_language_name_German": "ドイツ語",
  "_language_name_Greek (modern)": "ギリシャ語（現代）",
  "_language_name_Guaraní": "グアラニー語",
  "_language_name_Gujarati": "グジャラート語",
  "_language_name_Haitian, Haitian Creole": "ハイチ語、ハイチクレオール語",
  "_language_name_Hausa": "ハウサ語",
  "_language_name_Hebrew (modern)": "ヘブライ語（現代）",
  "_language_name_Herero": "ヘレロ語",
  "_language_name_Hindi": "ヒンディー語",
  "_language_name_Hiri Motu": "ヒリモツ語",
  "_language_name_Hungarian": "ハンガリー語",
  "_language_name_Interlingua": "インターリングア語",
  "_language_name_Indonesian": "インドネシア語",
  "_language_name_Interlingue": "インターリング語",
  "_language_name_Irish": "アイルランド語",
  "_language_name_Igbo": "イボ語",
  "_language_name_Inupiaq": "イヌピア語",
  "_language_name_Ido": "イド語",
  "_language_name_Icelandic": "アイスランド語",
  "_language_name_Italian": "イタリア語",
  "_language_name_Inuktitut": "イヌクティトゥト語",
  "_language_name_Japanese": "日本語",
  "_language_name_Javanese": "ジャワ語",
  "_language_name_Kalaallisut, Greenlandic": "グリーンランド語、カラーリット語",
  "_language_name_Kannada": "カンナダ語",
  "_language_name_Kanuri": "カヌリ語",
  "_language_name_Kashmiri": "カシミール語",
  "_language_name_Kazakh": "カザフ語",
  "_language_name_Central Khmer": "中央クメール語",
  "_language_name_Kikuyu, Gikuyu": "キクユ語",
  "_language_name_Kinyarwanda": "キニャルワンダ語",
  "_language_name_Kirghiz, Kyrgyz": "キルギス語",
  "_language_name_Komi": "コミ語",
  "_language_name_Kongo": "コンゴ語",
  "_language_name_Korean": "韓国語",
  "_language_name_Kurdish": "クルド語",
  "_language_name_Kuanyama, Kwanyama": "クアニャマ語",
  "_language_name_Latin": "ラテン語",
  "_language_name_Luxembourgish, Letzeburgesch": "ルクセンブルグ語",
  "_language_name_Ganda": "ガンダ語",
  "_language_name_Limburgan, Limburger, Limburgish": "リンブルガー語",
  "_language_name_Lingala": "リンガラ語",
  "_language_name_Lao": "ラオ語",
  "_language_name_Lithuanian": "リトアニア語",
  "_language_name_Luba-Katanga": "ルバ・カタンガ語",
  "_language_name_Latvian": "ラトビア語",
  "_language_name_Manx": "マン島語",
  "_language_name_Macedonian": "マケドニア語",
  "_language_name_Malagasy": "マダガスカル語",
  "_language_name_Malay": "マレー語",
  "_language_name_Malayalam": "マラヤーラム語",
  "_language_name_Maltese": "マルタ語",
  "_language_name_Maori": "マオリ語",
  "_language_name_Marathi": "マラーティー語",
  "_language_name_Marshallese": "マーシャル語",
  "_language_name_Mongolian": "モンゴル語",
  "_language_name_Nauru": "ナウル語",
  "_language_name_Navajo, Navaho": "ナヴァホ語",
  "_language_name_North Ndebele": "北ンデベレ語",
  "_language_name_Nepali": "ネパール語",
  "_language_name_Ndonga": "ヌドンガ語",
  "_language_name_Norwegian Bokmål": "ノルウェー語ブークモール",
  "_language_name_Norwegian Nynorsk": "ノルウェー語ニーノシュク",
  "_language_name_Norwegian": "ノルウェー語",
  "_language_name_Sichuan Yi, Nuosu": "四川語、四川彝語",
  "_language_name_South Ndebele": "南ンデベレ語",
  "_language_name_Occitan": "オシタン語",
  "_language_name_Ojibwa": "オジブワ語",
  "_language_name_Church Slavic, Church Slavonic, Old Church Slavonic, Old Slavonic, Old Bulgarian": "教会スラブ語、古代教会スラブ語、古代スラブ語、古代ブルガリア語",
  "_language_name_Oromo": "オロモ語",
  "_language_name_Oriya": "オーリヤ語",
  "_language_name_Ossetian, Ossetic": "オセト語",
  "_language_name_Panjabi, Punjabi": "パンジャブ語",
  "_language_name_Pali": "パーリ語",
  "_language_name_Persian": "ペルシャ語",
  "_language_name_Polabian": "ポラーブ語",
  "_language_name_Polish": "ポーランド語",
  "_language_name_Pashto, Pushto": "パシュト語",
  "_language_name_Portuguese": "ポルトガル語",
  "_language_name_Quechua": "クチュア語",
  "_language_name_Romansh": "ロマンシュ語",
  "_language_name_Rundi": "ルンディ語",
  "_language_name_Romanian, Moldavian, Moldovan": "ルーマニア語、モルダビア語、モルドバ語",
  "_language_name_Russian": "ロシア語",
  "_language_name_Sanskrit": "サンスクリット語",
  "_language_name_Sardinian": "サルデーニャ語",
  "_language_name_Sindhi": "シンド語",
  "_language_name_Northern Sami": "北サーミ語",
  "_language_name_Samoan": "サモア語",
  "_language_name_Sango": "サンゴ語",
  "_language_name_Serbian": "セルビア語",
  "_language_name_Gaelic, Scottish Gaelic": "ゲール語、スコットランド・ゲール語",
  "_language_name_Shona": "ショナ語",
  "_language_name_Sinhala, Sinhalese": "シンハラ語",
  "_language_name_Slovak": "スロバキア語",
  "_language_name_Slovenian": "スロベニア語",
  "_language_name_Somali": "ソマリ語",
  "_language_name_Southern Sotho": "南ソト語",
  "_language_name_Spanish, Castilian": "スペイン語、カスティーリャ語",
  "_language_name_Sundanese": "スンダ語",
  "_language_name_Swahili": "スワヒリ語",
  "_language_name_Swati": "スワジ語（シスワティ語）",
  "_language_name_Swedish": "スウェーデン語",
  "_language_name_Tamil": "タミール語",
  "_language_name_Telugu": "テルグ語",
  "_language_name_Tajik": "タジク語",
  "_language_name_Thai": "タイ語",
  "_language_name_Tigrinya": "ティグリニア語",
  "_language_name_Tibetan": "チベット語",
  "_language_name_Turkmen": "トルクメン語",
  "_language_name_Tagalog": "タガログ語",
  "_language_name_Tswana": "ツワナ語（セツワナ語）",
  "_language_name_Tonga (Tonga Islands)": "トンガ語（トンガ諸島）",
  "_language_name_Turkish": "トルコ語",
  "_language_name_Tsonga": "ツオンガ語",
  "_language_name_Tatar": "タタール語",
  "_language_name_Twi": "トウィ語",
  "_language_name_Tahitian": "タヒチ語",
  "_language_name_Uighur, Uyghur": "ウイグル語",
  "_language_name_Ukrainian": "ウクライナ語",
  "_language_name_Urdu": "ウルドゥ語",
  "_language_name_Uzbek": "ウズベク語",
  "_language_name_Venda": "ヴェンダ語",
  "_language_name_Vietnamese": "ベトナム語",
  "_language_name_Volapük": "ヴォラピュク語",
  "_language_name_Walloon": "ワロン語",
  "_language_name_Welsh": "ウェールズ語",
  "_language_name_Wolof": "ウォロフ語",
  "_language_name_Western Frisian": "西フリジア語",
  "_language_name_Xhosa": "コサ語",
  "_language_name_Yiddish": "イディッシュ語",
  "_language_name_Yoruba": "ヨルバ語",
  "_language_name_Zhuang, Chuang": "チワン語",
  "_language_name_Zulu": "ズールー語",
  "_language_name_Achinese": "アチェー語",
  "_language_name_Acoli": "アチョリ語",
  "_language_name_Adangme": "アダングメ語",
  "_language_name_Adyghe; Adygei": "アディジェイ語",
  "_language_name_Afro-Asiatic languages": "アフロ・アジア語族",
  "_language_name_Afrihili": "アフリヒリ語",
  "_language_name_Ainu": "アイヌ語",
  "_language_name_Akkadian": "アカド語",
  "_language_name_Aleut": "アリュート語",
  "_language_name_Algonquian languages": "アルゴンキン諸語",
  "_language_name_Southern Altai": "南アルタイ語",
  "_language_name_Old English (ca. 450–1100)": "古英語（450〜1100年頃）",
  "_language_name_Angika": "アンギカ語",
  "_language_name_Apache languages": "アパッチ諸語",
  "_language_name_Official Aramaic (700–300 BCE); Imperial Aramaic (700–300 BCE)": "公用アラム語（紀元前700〜300年）、帝国アラム語（紀元前700〜300年）",
  "_language_name_Mapudungun; Mapuche": "マプチェ語",
  "_language_name_Arapaho": "アラパホー語",
  "_language_name_Artificial languages": "人工言語",
  "_language_name_Arawak": "アラワック語",
  "_language_name_Asturian; Bable; Leonese; Asturleonese": "アストゥリア語、バブレ語、レオン語、アストゥリアス語",
  "_language_name_Athapascan languages": "アサパスカン諸語",
  "_language_name_Australian languages": "オーストラリア諸語",
  "_language_name_Awadhi": "アワディー語",
  "_language_name_Banda languages": "バンダ語",
  "_language_name_Bamileke languages": "バミレケ諸語",
  "_language_name_Baluchi": "バルーチー語",
  "_language_name_Balinese": "バリ語",
  "_language_name_Basa": "バサ語",
  "_language_name_Baltic languages": "バルト語派",
  "_language_name_Beja; Bedawiyet": "ベジャ語",
  "_language_name_Bemba": "ベンバ語",
  "_language_name_Berber languages": "ベルベル語",
  "_language_name_Bhojpuri": "ボジュプリー語",
  "_language_name_Bikol": "ビコール語",
  "_language_name_Bini; Edo": "ビニ語、エド語",
  "_language_name_Siksika": "シクシカ語",
  "_language_name_Bantu languages": "バントゥー語群",
  "_language_name_Braj": "ブラジ語",
  "_language_name_Batak languages": "バタク語",
  "_language_name_Buriat": "ブリアット語",
  "_language_name_Buginese": "ブギ語",
  "_language_name_Bilin; Blin": "ビリン語",
  "_language_name_Caddo": "カドー語",
  "_language_name_Central American Indian languages": "中米インディアン諸語",
  "_language_name_Galibi Carib": "カリブ語",
  "_language_name_Caucasian languages": "コーカサス諸語",
  "_language_name_Cebuano": "セブアノ語",
  "_language_name_Celtic languages": "ケルト語派",
  "_language_name_Chibcha": "チブチャ語",
  "_language_name_Chagatai": "チャガタイ語",
  "_language_name_Chuukese": "チューク語",
  "_language_name_Mari": "マリ語",
  "_language_name_Chinook jargon": "混合チヌーク語",
  "_language_name_Choctaw": "チョクトー語",
  "_language_name_Chipewyan; Dene Suline": "チペワイアン語",
  "_language_name_Cherokee": "チェロキー語",
  "_language_name_Cheyenne": "シャイアン語",
  "_language_name_Chamic languages": "チャム諸語",
  "_language_name_Montenegrin": "モンテネグロ語",
  "_language_name_Coptic": "コプト語",
  "_language_name_English based Creoles and pidgins": "英語由来の混成語・混合語",
  "_language_name_French-based Creoles and pidgins": "フランス語由来の混成語・混合語",
  "_language_name_Portuguese-based Creoles and pidgins": "ポルトガル語由来の混成語・混合語",
  "_language_name_Crimean Tatar; Crimean Turkish": "クリミアタタール語；クリミアトルコ語",
  "_language_name_Creoles and pidgins": "混成語・混合語",
  "_language_name_Kashubian": "カシュビアン語",
  "_language_name_Cushitic languages": "クシ語派",
  "_language_name_Dakota": "ダコタ語",
  "_language_name_Dargwa": "ダルグヮ語",
  "_language_name_Land Dayak languages": "陸ダヤク語",
  "_language_name_Delaware": "デラウェア語",
  "_language_name_Slave (Athapascan)": "スレイビー語（アサパスカン語）",
  "_language_name_Dogrib": "ドグリブ語",
  "_language_name_Dinka": "ディンカ語",
  "_language_name_Dogri": "ドグリ語",
  "_language_name_Dravidian languages": "ドラヴィダ語族",
  "_language_name_Lower Sorbian": "低ソルビア語",
  "_language_name_Duala": "ドゥアラ語",
  "_language_name_Middle Dutch (ca. 1050–1350)": "中期オランダ語（1050〜1350年頃）",
  "_language_name_Dyula": "デュラ語",
  "_language_name_Efik": "エフィク語",
  "_language_name_Egyptian (Ancient)": "古代エジプト語",
  "_language_name_Ekajuk": "エカジュク語",
  "_language_name_Elamite": "エラム語",
  "_language_name_Middle English (1100–1500)": "中英語（1100〜1500年）",
  "_language_name_Ewondo": "エウォンド語",
  "_language_name_Fang": "ファング語",
  "_language_name_Fanti": "ファンティー語",
  "_language_name_Filipino; Pilipino": "フィリピノ語",
  "_language_name_Finno-Ugrian languages": "フィン・ウゴル語派",
  "_language_name_Fon": "フォン語",
  "_language_name_Middle French (ca. 1400–1600)": "中世フランス語（1400〜1600年頃）",
  "_language_name_Old French (842–ca. 1400)": "古フランス語（842〜1400年頃）",
  "_language_name_Northern Frisian": "北フリジア語",
  "_language_name_Eastern Frisian": "東フリジア語",
  "_language_name_Friulian": "フリウリ語",
  "_language_name_Ga": "ガー語",
  "_language_name_Gayo": "ガヨ語",
  "_language_name_Gbaya": "バヤ語",
  "_language_name_Germanic languages": "ゲルマン語派",
  "_language_name_Geez": "ゲーズ語",
  "_language_name_Gilbertese": "キリバス語",
  "_language_name_Middle High German (ca. 1050–1500)": "中高ドイツ語（1050〜1500年頃）",
  "_language_name_Old High German (ca. 750–1050)": "古高ドイツ語（750〜1050年頃）",
  "_language_name_Gondi": "ゴーンディー語",
  "_language_name_Gorontalo": "ゴロンタロ語",
  "_language_name_Gothic": "ゴート語",
  "_language_name_Grebo": "グレボ語",
  "_language_name_Ancient Greek (to 1453)": "古代ギリシャ語（1453年以前）",
  "_language_name_Swiss German; Alemannic; Alsatian": "スイスドイツ語、アレマン語、アルザス語",
  "_language_name_Gwichʼin": "グウィッチン語",
  "_language_name_Haida": "ハイダ語",
  "_language_name_Hawaiian": "ハワイ語",
  "_language_name_Hiligaynon": "ヒリガイノン語",
  "_language_name_Himachali languages; Western Pahari languages": "ヒマチャル語、西パハール語群",
  "_language_name_Hittite": "ヒッタイト語",
  "_language_name_Hmong; Mong": "フモン語、モン語",
  "_language_name_Upper Sorbian": "上ソルビア語",
  "_language_name_Hupa": "アタパスカ語",
  "_language_name_Iban": "イバン語",
  "_language_name_Ijo languages": "イジョ語",
  "_language_name_Iloko": "イロカノ語",
  "_language_name_Indic languages": "インド語群",
  "_language_name_Indo-European languages": "インド・ヨーロッパ語族",
  "_language_name_Ingush": "イングシ語",
  "_language_name_Iranian languages": "イラン語群",
  "_language_name_Iroquoian languages": "イロコイ諸語",
  "_language_name_Lojban": "ロジバン語",
  "_language_name_Judeo-Persian": "ユダヤ・ペルシャ語",
  "_language_name_Judeo-Arabic": "ユダヤ・アラビア語",
  "_language_name_Kara-Kalpak": "カラカルパク語",
  "_language_name_Kabyle": "カビル語",
  "_language_name_Kachin; Jingpho": "カチン語、ジンポー語",
  "_language_name_Kamba": "カンバ語",
  "_language_name_Karen languages": "カレン諸語",
  "_language_name_Kawi": "カウィ語",
  "_language_name_Kabardian": "カバルド語",
  "_language_name_Khasi": "カシ語",
  "_language_name_Khoisan languages": "コイサン諸語",
  "_language_name_Khotanese; Sakan": "コータン語、サカ語",
  "_language_name_Kimbundu": "キンブンドゥ語",
  "_language_name_Konkani": "コンカニ語",
  "_language_name_Kosraean": "コスラエ語",
  "_language_name_Kpelle": "クペレ語",
  "_language_name_Karachay-Balkar": "カラチャイ語",
  "_language_name_Karelian": "カレリア語",
  "_language_name_Kru languages": "クルー語",
  "_language_name_Kurukh": "クルク語",
  "_language_name_Kumyk": "クムク語",
  "_language_name_Kutenai": "クテナイ語",
  "_language_name_Ladino": "ラジノ語",
  "_language_name_Lahnda": "ラフンダー語",
  "_language_name_Lamba": "現代プロバンス語",
  "_language_name_Lezghian": "レズギ語",
  "_language_name_Mongo": "モンゴ語",
  "_language_name_Lozi": "ロジ語",
  "_language_name_Luba-Lulua": "ルバ・ルルア語",
  "_language_name_Luiseno": "ルイセニョ語",
  "_language_name_Lunda": "ルンダ語",
  "_language_name_Luo (Kenya and Tanzania)": "ルオ語（ケニヤ、タンザニア）",
  "_language_name_Lushai": "ルシャイ語",
  "_language_name_Madurese": "マドゥラ語",
  "_language_name_Magahi": "マガヒー語",
  "_language_name_Maithili": "マイティリー語",
  "_language_name_Makasar": "マカッサル語",
  "_language_name_Mandingo": "マンディンゴ語",
  "_language_name_Austronesian languages": "オーストロネシア語族",
  "_language_name_Masai": "マサイ語",
  "_language_name_Moksha": "モクシャ語",
  "_language_name_Mandar": "マンダル語",
  "_language_name_Mende": "メンデ語",
  "_language_name_Middle Irish (900–1200)": "中期アイルランド語（900〜1200年）",
  "_language_name_Uncoded languages": "コード未指定言語",
  "_language_name_Mon-Khmer languages": "モン・クメール語派",
  "_language_name_Manchu": "満州語",
  "_language_name_Manipuri": "マニプル語",
  "_language_name_Manobo languages": "マノボ諸語",
  "_language_name_Mohawk": "モーホーク語",
  "_language_name_Mossi": "モシ語",
  "_language_name_Multiple languages": "多言語",
  "_language_name_Munda languages": "ムンダ諸語",
  "_language_name_Creek": "クリーク語",
  "_language_name_Mirandese": "ミランダ語",
  "_language_name_Marwari": "マールワーリー語",
  "_language_name_Mayan languages": "マヤ諸語",
  "_language_name_Erzya": "エルジャ語",
  "_language_name_Nahuatl languages": "ナワトル語",
  "_language_name_North American Indian languages": "北米インディアン諸語",
  "_language_name_Neapolitan": "ナポリ語",
  "_language_name_Low German; Low Saxon": "地ドイツ語；低地サクソン語",
  "_language_name_Nepal Bhasa; Newari": "ネワール語",
  "_language_name_Nias": "ニアス語",
  "_language_name_Niger-Kordofanian languages": "ニジェール・コルドファン諸語",
  "_language_name_Niuean": "ニウーエイ語",
  "_language_name_Nogai": "ノガイ語",
  "_language_name_Old Norse": "古ノルド語",
  "_language_name_Nubian languages": "ヌバ諸語",
  "_language_name_Classical Newari; Old Newari; Classical Nepal Bhasa": "古典ネワール語",
  "_language_name_Nyamwezi": "ムエジ語",
  "_language_name_Nyankole": "ニャンコレ語",
  "_language_name_Nyoro": "ニョロ語",
  "_language_name_Nzima": "ンゼマ語",
  "_language_name_Osage": "オーセージ語",
  "_language_name_Ottoman Turkish (1500–1928)": "オスマントルコ語（1500〜1928年）",
  "_language_name_Otomian languages": "オトミ諸語",
  "_language_name_Papuan languages": "パプア諸語",
  "_language_name_Pangasinan": "パンガシナン語",
  "_language_name_Pahlavi": "パーラヴィー語",
  "_language_name_Pampanga; Kapampangan": "パンパンガ語",
  "_language_name_Papiamento": "パピアメント語",
  "_language_name_Palauan": "パラオ語",
  "_language_name_Old Persian (ca. 600–400 B.C.)": "古代ペルシャ語（紀元前600〜400年頃）",
  "_language_name_Philippine languages": "フィリピン語群",
  "_language_name_Phoenician": "フェニキア語",
  "_language_name_Pohnpeian": "ポンペイ語（ポナペ語）",
  "_language_name_Prakrit languages": "プラークリット諸語",
  "_language_name_Old Provençal (to 1500); Old Occitan (to 1500)": "古期プロヴァンス語（1500年以前）",
  "_language_name_Reserved for local use": "ローカル用に予約",
  "_language_name_Rajasthani": "ラージャスターニ語",
  "_language_name_Rapanui": "ラパヌイ語",
  "_language_name_Rarotongan; Cook Islands Maori": "ラロトンガ語、クック諸島マオリ語",
  "_language_name_Romance languages": "ロマンス諸語",
  "_language_name_Romany": "ロマニ語",
  "_language_name_Aromanian; Arumanian; Macedo-Romanian": "アルーマニア語；マケドニア・ルーマニア語",
  "_language_name_Sandawe": "サンダウェ語",
  "_language_name_Yakut": "ヤクート語",
  "_language_name_South American Indian languages": "南米インディアン諸語",
  "_language_name_Salishan languages": "サリシュ諸語",
  "_language_name_Samaritan Aramaic": "サマリア語",
  "_language_name_Sasak": "ササク語",
  "_language_name_Santali": "サンターリー語",
  "_language_name_Sicilian": "シチリア語",
  "_language_name_Scots": "スコットランド語",
  "_language_name_Selkup": "セリクプ語",
  "_language_name_Semitic languages": "セム語派",
  "_language_name_Old Irish (to 900)": "古アイルランド語（900年以前）",
  "_language_name_Sign languages": "手話",
  "_language_name_Shan": "シャン語",
  "_language_name_Sidamo": "シダモ語",
  "_language_name_Siouan languages": "スー諸語",
  "_language_name_Sino-Tibetan languages": "シナ・チベット語族",
  "_language_name_Slavic languages": "スラヴ語派",
  "_language_name_Southern Sami": "南サーミ語",
  "_language_name_Sami languages": "サーミ語",
  "_language_name_Lule Sami": "ルレ・サーミ語",
  "_language_name_Inari Sami": "イナリ・サーミ語",
  "_language_name_Skolt Sami": "スコルト・サーミ語",
  "_language_name_Soninke": "ソニンケ語",
  "_language_name_Sogdian": "ソグド語",
  "_language_name_Songhai languages": "ソンガイ語派",
  "_language_name_Sranan Tongo": "スラナン語",
  "_language_name_Serer": "セレール語",
  "_language_name_Nilo-Saharan languages": "ナイル・サハラ語族",
  "_language_name_Sukuma": "スクマ語",
  "_language_name_Susu": "スス語",
  "_language_name_Sumerian": "シュメール語",
  "_language_name_Classical Syriac": "古典シリア語",
  "_language_name_Syriac": "シリア語",
  "_language_name_Tai languages": "タイ諸語",
  "_language_name_Timne": "テムネ語",
  "_language_name_Tereno": "テレーノ語",
  "_language_name_Tetum": "テトゥン語",
  "_language_name_Tigre": "ティグレ語",
  "_language_name_Tiv": "ティヴ語",
  "_language_name_Tokelau": "トケラウ語",
  "_language_name_Klingon; tlhIngan-Hol": "クリンゴン語",
  "_language_name_Tlingit": "トリンギット語",
  "_language_name_Tamashek": "タマシェク語",
  "_language_name_Tonga (Nyasa)": "トンガ語（ニアサ）",
  "_language_name_Tok Pisin": "トク・ピシン語",
  "_language_name_Tsimshian": "チムシュ語",
  "_language_name_Tumbuka": "トゥンブカ語",
  "_language_name_Tupi languages": "トゥピ諸語",
  "_language_name_Altaic languages": "アルタイ語族",
  "_language_name_Tuvalua": "ツバル語",
  "_language_name_Tuvinian": "トゥヴァ語",
  "_language_name_Udmurt": "ウドムルト語",
  "_language_name_Ugaritic": "ウガリト語",
  "_language_name_Umbundu": "アンブンドゥ語",
  "_language_name_Undetermined": "言語名不明",
  "_language_name_Vai": "ヴァイ語",
  "_language_name_Votic": "ヴォート語",
  "_language_name_Wakashan languages": "ワカシ諸語",
  "_language_name_Wolaitta; Wolaytta": "ウォライタ語",
  "_language_name_Waray": "ワライ語",
  "_language_name_Washo": "ワショ語",
  "_language_name_Sorbian languages": "ソルビア諸語",
  "_language_name_Kalmyk; Oirat": "カルムイク語；オイラト語",
  "_language_name_Yao": "ヤオ語",
  "_language_name_Yapese": "ヤップ語",
  "_language_name_Yupik languages": "ユピック諸語",
  "_language_name_Zapotec": "ザポテック語",
  "_language_name_Blissymbols; Blissymbolics; Bliss": "ブリスシンボル",
  "_language_name_Zenaga": "ゼナガ語",
  "_language_name_Standard Moroccan Tamazight": "標準モロッコ・タマジクト語",
  "_language_name_Zande languages": "ザンデ語",
  "_language_name_Zuni": "ズニ語",
  "_language_name_No linguistic content; Not applicable": "言語的内容なし、該当なし",
  "_language_name_Zaza; Dimili; Dimli; Kirdki; Kirmanjki; Zazaki": "ザザ語、ザザキ語",

  __eof__: null
};