// Copyright (c) 2014 Apple Inc. All rights reserved.
var localizedStrings = { /* The name of the Web Application itself. */
  "_appName": "Profile Manager",

  "_locale": "en",

  '_SC.DateTime.dayNames': 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday',
  '_SC.DateTime.abbreviatedDayNames': 'Sun Mon Tue Wed Thu Fri Sat',
  '_SC.DateTime.monthNames': 'January February March April May June July August September October November December',
  '_SC.DateTime.abbreviatedMonthNames': 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec',
  '_SC.DateTime.AMPMNames': 'AM PM',

  /* The name of the sidebar item for Device Groups */
  "_device_groups_sidebar_item_display_name": "Device Groups",

  /* The name of the sidebar item for User Groups */
  "_user_groups_sidebar_item_display_name": "Groups",

  /* This is the cancel button in the Add Device Sheet. It closes the sheet without taking any action. */
  "_add_device_page_cancel_button_title": "Cancel",

  /* This is the default button in the Add Device Sheet. It takes the unique identifier provided and creates a temporary device record. */
  "_add_device_pane_add_button_title": "Add Device",

  /* This is the name of Mail Settings as it appears in the Add Settings Sheet. */
  "_email_knob_set_name": "Mail",

  /* This is the item in the sidebar that when selected displays tasks that are active. */
  "_sidebar_active_tasks": "Active Tasks",

  /* This is an item in the sidebar that groups the Active and Completed Tasks. It can not be selected. */
  "_sidebar_root_activity": "ACTIVITY",

  /* This is an item in the sidebar that gorups the item types that can be placed in Configuration Profiles. It itself can not be selected. */
  "_sidebar_root_library": "LIBRARY",

  //KNOB SET ADD STEP 2a

  /* This is the name of the Setting Type for Printing settings. */
  "_energy_saver_knob_set_name": "Energy Saver",

  /* This is the name of the Setting Type for Printing settings. */
  "_privacy_knob_set_name": "Security & Privacy",

  /* This is the name of the Setting Type for Printing settings. */
  "_parental_controls_knob_set_name": "Parental Controls",

  /* This is the name of the Setting Type for Printing settings. */
  "_cfprefs_knob_set_name": "Custom Settings",

  /* This is the name of the Setting Type for Printing settings. */
  // ==========
  // = Banner =
  // ==========
  "_mac_restrictions_knob_set_name": "Restrictions",

  /* This is the name of the Setting Type for Printing settings. */
  "_printing_knob_set_name": "Printing",

  /* This is the name of the Setting Type for Mobility and PHD settings. */
  "_mobility_knob_set_name": "Mobility",

  /* This is the name of the Setting Type for Login Window settings. */
  "_login_window_knob_set_name": "Login Window",

  /* This is the name of the Setting Type for Software Update settings. */
  "_software_update_knob_set_name": "Software Update",

  /* This is the name of the Setting Type for Dock settings. */
  "_dock_knob_set_name": "Dock",

  /* This is the name of the Setting Type for Exchange settings. */
  "_exchange_knob_set_name": "Exchange",

  /* This is the name of the Setting Type for Directory settings. */
  "_directory_knob_set_name": "Directory",

  /* This is the name of the Setting Type for Advanced settings. */
  "_apn_knob_set_name": "APN",

  /* This is the name of the Setting Type for LDAP settings. */
  "_ldap_knob_set_name": "LDAP",

  /* this is the name of the Setting Type for the Passcode setting. There can only be one Passcode setting in a Configuration Profile. */
  "_passcode_knob_set_name": "Passcode",

  /* This is the name of the Global Http Proxy Knobset */
  "_global_http_proxy_knob_set_name": "Global HTTP Proxy",

  /* This is the name of the Setting Type for the VPN setting. */
  "_vpn_knob_set_name": "VPN",

  /* This is the name of the Setting Type for the CalDav settings. */
  "_cal_dav_knob_set_name": "Calendar",

  /* This is the name of the Setting Type for the CardDav settings. */
  "_card_dav_knob_set_name": "Contacts",

  /* This is the name of the Setting Type for the Login Items settings. */
  "_login_item_knob_set_name": "Login Items",

  /* This is the name of the Network Home Share Point name for the Login Items settings. */
  "_login_item_network_home_share_point_name": "<Network Home Share Point>",

  /* This is the name of the Setting Type for the CardDav settings. */
  "_general_knob_set_name": "General",

  /* This is the name of the Setting Type for the Subscribed Calendars settings. */
  "_subscribed_calendar_knob_set_name": "Subscribed Calendars",

  /* This is the name of the Setting Type for the restrictions settings. */
  "_restrictions_knob_set_name": "Restrictions",

  /* This is the subheading for the Certificate Name field for Certificate Settings. */
  "_certificate_knob_set_view_display_name_description": "Name or description of the certificate credential",

  /* The heading for the Certificate Name field for Certificate Settings. */
  "_certificate_knob_set_view_display_name_label": "Certificate Name",

  /* The name of Messages settings */
  "_ichat_knob_set_name": "Messages",

  /* The hint that appears in fields for Settings where the field is required. */
  "_knob_set_view_required_hint": "required",

  /* The name of Certificate Settings. */
  "_certificate_knob_set_name": "Certificates",

  /* The name of Web Clip Settings. */
  "_web_clip_knob_set_name": "Web Clips",

  /* This is the description for SCEP Setting's Fingerprint Field. */
  "_admin_scep_knob_set_view_fingerprint_field_description": "Enter hex string to be used as a fingerprint",

  /* This is the name of the SCEP Settings. */
  "_scep_knob_set_name": "SCEP",

  /* This is the label for SCEP Settings's Name Field. */
  "_admin_scep_knob_set_view_name_field_label": "Name",

  /* This is the label for SCEP Setting's Fingerprint Field. */
  "_admin_scep_knob_set_view_fingerprint_field_label": "Fingerprint",

  /* This is the label for SCEP Setting's URL Field. */
  "_admin_scep_knob_set_view_url_field_label": "URL",

  /* This is the description for SCEP Setting's Name Field. */
  "_admin_scep_knob_set_view_name_field_description": "The name of the instance: CA-IDENT",

  /* This is the label for SCEP Setting's Challenge Field. */
  "_admin_scep_knob_set_view_challenge_field_label": "Challenge",

  /* This is the hint provided in Fields in Settings when the value of the field is optional. */
  "_knob_set_view_optional_hint": "optional",

  "_generic_string_Retries": "Retries",
  "_generic_string_The number of times to poll the SCEP server for a signed certificate before giving up": "The number of times to poll the SCEP server for a signed certificate before giving up",
  "_generic_string_Retry Delay": "Retry Delay",
  "_generic_string_The number of seconds to wait between poll attempts": "The number of seconds to wait between poll attempts",

  /* This is the description for SCEP Setting's Challenge Field. */
  "_admin_scep_knob_set_view_challenge_field_description": "Used as the pre-shared secret for automatic enrollment",

  /* This is the description for SCEP Setting's URL Field. */
  "_admin_scep_knob_set_view_url_field_description": "The base URL for the SCEP server",

  /* This is the label for SCEP Setting's Subject Field. */
  "_admin_scep_knob_set_view_subject_field_label": "Subject",

  /* This is the description of SCEP Setting's Subject Field. */
  "_admin_scep_knob_set_view_subject_field_description": "Representation of a X.500 name",
  /* This is the message that appears when a Server Error occurs. */
  "_Server Error Occurred Message": "A Server Error has Occurred",

  /* This is the description for SCEP Setting's Key Size Field. */
  "_admin_scep_knob_set_view_keysize_field_description": "Keysize in bits",

  "1024": "1024",

  "2048": "2048",


  /* This is the description of the save Changes Confirmation. */
  "_Show Save Changes Confirmation Description": "This will push the changed settings to devices.",

  /* This is the description of the Delete Item Confirmation. */
  "_Show Delete Item Confirmation Description": "This cannot be undone.",

  /* This is the description of the Error Occurred error. */
  "_Server Error Occurred Description": "Please reload the webpage and try again.",

  /* This is the caption of the Server Error Occurred error. */
  "_Server Error Occurred Caption": "If this error continues, please contact your administrator.",

  /* This is the message that appears when Settings are being saved. */
  "_Show Save Changes Confirmation Message": "Save Changes?",

  /* This is the label for SCEP Setting's Key Size Field. */
  "_admin_scep_knob_set_view_keysize_field_label": "Key Size",

  /* This is the message that apepars when a Profile is about to be deleted. */
  "_Show Delete Item Confirmation Message": "Delete?",
  "_delete_profile_alert_pane_header_Remove All Settings?": "Remove All Settings?",
  "_delete_settings_button_text_Remove All Settings": "Remove All Settings",
  '_delete_profile_alert_pane_message_All payloads will be removed from "<profile_name>". "<profile_name>" will then be removed from all devices where it is currently applied. This action cannot be undone.': 'All payloads will be removed from "%@1". "%@1" will then be removed from all devices where it is currently applied. This action cannot be undone.',
  '_delete_profile_alert_pane_message_manual_profile_for_directory_item': 'All settings will be removed from "%@1" and "%@1" will no longer be available for download in the My Devices portal.',
  '_delete_profile_alert_pane_message_manual_profile_for_device': 'All settings will be removed from "%@".',
  'no_payloads_alert_header': "No Payloads Configured",
  'no_payloads_alert_description': '"%@" must have atleast one payload configured in addition to "General". Changes to "General" payload will not be saved.',
  "_continue_without_saving": "Continue",

  "_unenroll_device_alert_pane_header": "Remove managed settings, apps and enrollment in device management?",
  "_unenroll_device_alert_pane_description": "A placeholder record will remain after the device is unenrolled.",
  "_unenroll_button_text_Unenroll": "Unenroll",
  "_unenroll_and_remove_placeholder_button_text": "Unenroll and Remove Placeholder",
  "_unenroll_dep_device_alert_pane_description": "The placeholder record from the Device Enrollment Program will remain after the device is unenrolled.",
  "_remove_device_placeholder_alert_pane_header": "Remove the placeholder record?",
  "_remove_device_placeholder_alert_pane_description": "All currently stored information for this placeholder device will be lost.",
  "_remove_device_placeholder_with_activation_lock_alert_pane_description": "All currently stored information including the activation lock bypass code for this placeholder device will be lost. The activation lock bypass code is required to restore this device if activation lock is enabled.",
  "_remove_device_placeholder_button_text_Remove Placeholder": "Remove Placeholder",
  "_remove_dep_device_placeholder_alert_pane_header": "Permanently remove the device from the Device Enrollment Program?",
  "_remove_dep_device_placeholder_alert_pane_description": "This action cannot be undone. You will not be allowed to register this device through the Device Enrollment Program portal. All currently stored information for this device will be lost.",
  "_remove_dep_device_placeholder_button_text_Remove": "Remove",
  "_unenroll_dep_device_alert_pane_width": "540",
  "_remove_dep_device_alert_pane_width": "570",
  "_revert_device_to_placeholder": "Revert to Placeholder",

  "_device_enrollment_state_placeholder": "Placeholder",
  "_device_enrollment_state_unenrollment_pending": "Unenroll Pending",
  "_device_state_header_placeholder_label_width": "105",
  "_device_state_header_unenrollment_pending_label_width": "140",

  /* The display title for SCEP Setting's Use as digital signature checkbox */
  "_admin_scep_knob_set_view_use_as_digital_signature_display_title": "Use as digital signature",

  /* The display title for SCEP Setting's Use for key encipherment checkbox */
  "_admin_scep_knob_set_view_use_for_key_encipherment": "Use for key encipherment",

  /* The label for Certificate Settings' Certificate Field */
  "_certificate_knob_set_view_upload_label": "Certificate or Identity Data",

  /* The description for Certificate Settings' Certificate Field */
  "_certificate_knob_set_view_upload_description": "X.509 certificate (.cer, .p12, etc) for inclusion on device",

  /* The placeholder text for uploading a Certificate to a Certificate Setting. */
  "_certificate_knob_set_view_upload_placeholder": "No Certificate",

  /* The Lock Task Type */
  "_task_type_lock": "Lock",
  "_task_type_lock_with_display_name": "Lock: %@1",

  /* The Wipe Task Type */
  "_task_type_wipe": "Wipe",
  "_task_type_wipe_with_display_name": "Wipe: %@1",

  /* This is the name for the Device Info Task Type */
  "_task_type_device_info": "Update Info",
  "_task_type_device_info_with_display_name": "Update Info: %@1",
  "_task_type_allow_activation_lock": "Allow Activation Lock",
  "_task_type_clear_activation_lock": "Clear Activation Lock",

  /* This is the name for the Clear Passcode Task Type */
  "_task_type_clear_passcode": "Clear Passcode",
  "_task_type_clear_passcode_with_display_name": "Clear Passcode: %@1",

  /* This is the label for the Completed Tasks sidebar entry. */
  "_sidebar_completed_tasks": "Completed Tasks",

  /* This is the available device capacity formatter. In English, this is equivalent to 6.23 GB. %@1 is subsituted for something like 6.23. */
  "_available_device_capacity_format": "%@1 GB",

  /* This is the task status when the notification has been sent but the device has not checked in yet. */
  "_task_step_notification_sent_device_pending": "Sending",

  /* This is the task status when the device has reported that it has completed the task. */
  "_task_step_device_completion": "Completed",

  /* This is the task status when the device has checked in and received the task, but has not yet checked in reporting that it has completed the task. */
  "_task_step_device_receieved_device_completion_pending": "In Progress",

  /* This is the task type when the device is asked to provide info about itself to Profile Manager. */
  "_task_type_update_info": "Update Info",
  "_task_type_update_info_with_display_name": "Update Info: %@1",

  /* This is the task status when the device has not yet been sent a notification asking it to check in to recieve its task. This probably should never be displayed. */
  "_task_step_notification_pending": "Pending",
  "_task_step_vpp_status_user_not_invited": "User not invited",
  "_task_step_vpp_status_user_not_enrolled": "User not enrolled",
  "_task_step_vpp_status_no_copies_available": "No copies available",

  /* This is the description for when an unknown error occurs within the Profile Manager web app. */
  "_client_error_occurred_description": "Reload Profile Manager and try again.",

  /* This is the message for when the Profile Manager server cannot be found. */
  "_server_not_found_message": "Profile Server Not Found",

  /* This is the description for when the Profile Manager server cannot be found. */
  "_server_not_found_description": "Make sure Profile Manager is turned on in the Server app.",

  /* This is the caption for when an unknown error occurs within the Profile Manager web app. */
  "_client_error_occurred_caption": "Error: %@1",

  /* This is the message for when an unknown error occurs within the Profile Manager web app. */
  "_client_error_occurred_message": "An Error Occurred",

  /* This is the description for the network timeout error. */
  "_server_timed_out_description": "Make sure you are connected to the Internet and the network on which your Profile Server is located.",

  /* This is the message for the network timeout error. */
  "_server_timed_out_message": "Connection with Server Timed Out",

  /* This is the description shown for the No Devices Found warning, which happens when the admin attempts to perform a task on a Library Item that has no Devices as descendants. */
  "_No Devices Found For Task Description": "No devices were found for this item.",

  /* This is the date and time format for Tasks. */
  "_task_updated_at_formatted_string": "%m/%d/%y at %i:%M %p",

  /* This is the message shown for the no Devices Found warning, which happens when the admin attempts to perform a task on a Library Item that has no Devices as descendants. */
  "_No Devices Found For Task Message": "No Devices Found for Task",

  /* This is the label of the Passphrase field of Certificates. */
  "_certificate_knob_set_view_password_label": "Passphrase",

  /* This is the description of the Passphrase field of Certificates. */
  "_certificate_knob_set_view_password_description": "Passphrase used to secure the credentials",

  /* This is the task state for cancelled tasks. */
  "_task_cancelled": "Canceled",

  /* This is the menu item for sorting tasks ascending. */
  "_tasks_sort_ascending": "Ascending",

  /* This is the mnu item for sorting tasks descending. */
  "_tasks_sort_descending": "Descending",

  /* This is the menu item for sorting tasks by last updated. */
  "_tasks_sort_by_last_updated": "Last Updated",

  /* This is the menu item for sorting tasks by name. */
  "_tasks_sort_by_name": "Name",

  /* This is the menu item for sorting tasks by icon. */
  "_tasks_sort_by_icon": "Icon",

  /* This is the menu item for sorting tasks by status. */
  "_tasks_sort_by_status": "Status",
  "_task_type_send_vpp_invitation_with_display_name": "Send VPP Invitation: %@",
  "_task_type_remove_device_with_display_name": "Remove Device: %@",
  "_task_type_enroll_device_with_display_name": "Enroll Device: %@",
  "_task_type_push_apps_with_display_name": "Push Apps: %@",
  "_task_type_remove_apps_with_display_name": "Remove Apps: %@",
  "_task_type_retrieve_activation_lock_bypass_code_with_display_name": "Retrieve Activation Lock Bypass Code: %@",
  "_task_type_allow_activation_lock_with_display_name": "Allow Activation Lock: %@",
  "_task_type_remove_activation_lock_with_display_name": "Clear Activation Lock: %@",

  /* This is the unknown type for tasks. This should almost never appear in the UI; it is only there in case there is a bug or something. */
  "_task_type_unknown_type": "Unknown",
  "_task_type_unknown_type_with_display_name": "Unknown: %@1",

  /* This is the description that is shown for identity (password protected) certificates. */
  "_certificate_is_identity_description": "This content is stored in Personal Information Exchange (PKCS12) format, and is password protected. No information can be displayed.",

  /* This is the message shown when the server has not finished turning on. This will probably only happen for 10-15 seconds after turning Profile Manager on in Server.app. */
  "_server_not_available_message": "Profile Server Not Available",

  /* This is the description shown when the server has not finished turning on. */
  "_server_not_available_description": "Please wait a moment and try again.",

  /* This is the message shown when the network is not available. This typically happens when the web browser refuses to connect to anything. */
  "_network_not_available_message": "Network not Available",

  /* This is the description shown when the network is not available. */
  "_network_not_available_description": "Make sure you have an internet connection and try again.",

  /* This is the hint for the search box which says things like "Search Users", "Search Active Tasks", etc. */
  "_search_type_hint": "Search %@1",

  "_generic_string_200+ found (200 displayed)": "%@1+ found (%@1 displayed)",
  "_generic_string_<count> found": "%@1 found",


  /* This is the hint for the search box when search is disabled. */
  "_search_disabled_hint": "Search",

  /* This is the Cancel button for the Filetype not Supported error. */
  "_filetype_not_supported_cancel_button": "Cancel",

  /* This is the description for the Filetype not Supported error. */
  "_filetype_not_supported_description": "The file you selected is not supported. Please choose a different file.",

  /* This is the Filetype not Supported error. */
  "_filetype_not_supported_message": "Filetype Not Supported",

  /* This is the combined profile status for Up to Date */
  "_combined_profile_up_to_date": "Up to Date",

  /* This is the combined profiles status for Pending Install */
  "_combined_profile_pending_install": "Pending Install",

  /* This is the temporary combined profiles status for either External or Pending Removal */
  "_combined_profile_external_or_pending_removal": "External or Pending Removal",

  /* This is the combined profile status for Out of Date */
  "_combined_profile_out_of_date": "Out of Date",

  /* This is the combined profile status for Pending Removal. */
  "_combined_profile_pending_removal": "Pending Removal",

  /* This is the combined profile status for External. */
  "_combined_profile_external": "External",

  /* This is the Don't Save button for the Show Save Changes Confirmation sheet. */
  "_show_save_changes_confirmation_dont_save": "Don't Save",

  /* This is the passcode Compliant state for Devices for compiance with both Profiles and Accounts */
  "_passcode_compliant_both_compliant": "Both Profiles and Accounts",

  /* This is the passcode Compliant state for Devices for compliance with only Profiles, not Accounts */
  "_passcode_compliant_only_profiles_compliant": "Only Profiles, Not Accounts",

  /* This is the passcode Compliant state for Devices for compliance with only Accounts, not Profiles */
  "_passcode_compliant_only_other_compliant": "Only Accounts, Not Profiles",

  /* This is the passcode Compliant state for Devices for compliance with neither Profiles nor Accounts */
  "_passcode_compliant_not_compliant": "Neither Profiles nor Accounts",

  /* This is the Passcode Present state for Devices for when the passcode is not present */
  "_passcode_present_not_present": "Not Present",

  /* This is the Passcode Present state for Devices for when the passcode is present */
  "_passcode_present_present": "Present",

  /* This is the Hardware Encryption Capability state for Devices for when the Hardware is not capable */
  "_hardware_encrpyption_caps_not_capable": "Not Capable",

  /* This is the Hardware Encryption Capability state for Devices for when the Hardware is only capable of file-level encryption */
  "_hardware_encrpyption_caps_only_file_capable": "Only File-level Capable",

  /* This is the Hardware Encryption Capability state for Devices for when the Hardware is capable of both block-level and file-level encryption */
  "_hardware_encrpyption_caps_both_capable": "Both Block-level and File-level Capable",

  /* This is the Hardware Encryption Capability state for Devices for when the Hardware is capable of only block-level encryption */
  "_hardware_encrpyption_caps_only_block_capable": "Only Block-level Capable",

  /* This is the Hardware Encryption field for Devices */
  "_hardware_encrpyption": "Hardware Encryption",

  /* This is the Passcode Present field for Devices */
  "_passcode_present": "Passcode Present",

  /* This is the Passcode Compliant field for Devices */
  "_passcode_compliant": "Passcode Compliant",

  /* This is the Restrictions About Root Item for Devices */
  "_restrictions_about_root_item": "Restrictions",

  /*  */
  "_manual_fetching_when_roaming_on": "On",

  /*  */
  "_manual_fetching_when_roaming_off": "Off",

  /*  */
  "_force_forced": "Forced",

  /*  */
  "_force_not_forced": "Not Forced",

  /*  */
  "_require_required": "Required",

  /*  */
  "_require_not_required": "Not Required",

  /*  */
  "_allow_not_allowed": "Not Allowed",

  /*  */
  "_allow_allowed": "Allowed",

  /*  */
  "_safari_accept_cookies_never": "Never",

  /*  */
  "_rating_apps_4_plus": "4+",

  /*  */
  "_rating_apps_17_plus": "17+",

  /*  */
  "_safari_accept_cookies_always": "Always",

  /*  */
  "_rating_apps_dont_allow_apps": "Don't Allow Apps",

  /*  */
  "_rating_apps_9_plus": "9+",

  /*  */
  "_rating_apps_12_plus": "12+",

  /*  */
  "_rating_apps_allow_all_apps": "Allow All Apps",

  /*  */
  "_safari_accept_cookies_from_visited": "From Visited",

  /*  */
  "_unset": "—",

  /* This is the Installed Applications section of the About tab of Devices */
  "_installedApplications_about_root_item": "Installed Apps",

  /* This is the hint for fields in Profile Settings where the field is required. */
  "_knob_set_view_hint_required": "required",

  /* This is the payload type for profiles where the payload provides a password to allow users to remove a locaked configuration profile from the device. It can not be created in Profile Manager but may be present on profiles obtained elsewhere. */
  "_installed_profile_profile_removal_password_payload_type": "Removal Password",

  /* This is when the issuer of a Certificate can not be determined because it does not have a CN property. */
  "_certificate_issued_by_unknown": "Unknown",

  /* This is the button in Exchange Settings to remove the certificate. */
  "_knob_set_view_remove_certificate": "Remove Certificate",

  /* This is the button in Exchange and Certificate Settings to add the certificate. */
  "_knob_set_view_add_certificate": "Add Certificate…",

  /* This is the helper text in the About tab of Library Items under the In Groups section when the selected Library Item is not in any Groups. */
  "_about_in_groups_not_in_any_groups": "Not in any Groups",

  /* This is the Sort By button, used on the Activity/Tasks tab. */
  "_sort_by_button": "▼",

  /* This is the helper text shown when no Applications are installed on a Device. */
  "_about_installed_applications_no_installed_applications": "No additional apps installed",

  /* This is the line item in the Devices tab of a Provisioning Profile that represents the additional devices specified in the Provisioning Profile that Profile Manager is unaware of. */
  "_provisioning_profile_n_additional_devices": "%@1 Additional Devices",

  /* This is the line item in the Devices tab of a Provisioning Profile that represents the additional device specified in the Provisioning Profile that Profile Manager is unaware of. */
  "_provisioning_profile_one_additional_device": "1 Additional Device",

  /* This is the task type when a Provisioning Profile is installed onto a Device. */
  "_task_type_install_provisioning_profile": "Install Provisioning Profile",
  "_task_type_install_provisioning_profile_with_display_name": "Install Provisioning Profile: %@1",

  /* This is the message for the Browser Outdated error. */
  "_browser_outdated_message": "A newer browser is needed",

  /* This is the description for the Browser Outdated error. */
  "_browser_outdated_description": "Profile Manager requires a newer browser to run.",

  /* This is the cancel button for the Browser Outdated error. */
  "_browser_outdated_cancel": "Cancel",

  /* This is the helper text shown when the item list for a Library Item is loading. The wildcard will be replaced with the name of the selected sidebar item, for example Users. */
  "_item_list_loading": "Loading %@1…",

  /* This is the message for the Save Changes Conflict warning. */
  "_save_changes_conflict_message": "Save Conflict",

  /* This is the description for the Save Changes Conflict warning. */
  "_save_changes_conflict_description": "This has been modified since you began editing it. Would you like to overwrite these changes? Overwriting changes cannot be undone.",

  /* This is the cancel button for the Save Changes Conflict warning. It has no action. */
  "_save_changes_conflict_cancel": "Cancel",

  /* This is the overwrite button for the Save Changes Conflict warning. It will overrite any remote changes. */
  "_save_changes_conflict_overwrite": "Overwrite",

  /* The profile is available for installation on this device, but is not currently installed. It is a manual download profile. */
  "_combined_profile_available_for_install": "Available for Install",

  /* This is for profiles installed on Devices whose owners are not authorized for the Manual Profile in question, or the profile is no longer being maintained by the server. This is for manual profiles. */
  "_combined_profile_not_authorized": "Not Authorized",

  /* This is the name and version of an installed application. %@1 will become the name of the Application and %@2 will become the Version string of the Application. */
  "_installed_application_name_and_version": "%@1 %@2",

  /* This is the cancel button for the Email Profile to Recipients Confirmation. */
  "_email_profile_to_recipients_cancel": "Cancel",

  /* This is the message for the Selected Item was Destroyed and Unsaved Changes Lost error. */
  "_selected_item_was_destroyed_unsaved_changes_lost_message": "Selected Item was Deleted",

  /* This is the description for the Selected Item was Destroyed and Unsaved Changes Lost error. */
  "_selected_item_was_destroyed_unsaved_changes_lost_description": "Your unsaved changes were lost.",

  /* This is the label for the Add Recipients Picker. The wildcard will be replaced with the type of Recipients being added. */
  "_add_members_label_view_value": "Add %@1",

  /* This is the Save button for the Show Save Changes Confirmation alert. */
  "_show_save_changes_confirmation_save_button": "Save",

  /* This is the Configure button shown when there are No Settings for the Selected Setting Type. */
  "_no_settings_configure_button": "Configure",

  /* This is the Message shown when there are no Setting Instances for the Selected Setting Type. */
  "_no_settings_configure_message": "Configure %@1",

  /* This is the generic description for Setting Types when one has not been provided. */
  "_generic_setting_type_description": "Use this section to configure %@1.",

  /* This is the secondary information for the General knobset */
  "_setting_type_secondary_information_general_knobset": "Mandatory",

  /* This is the secondary information for a Setting Type which has multiple payloads configured. */
  "_setting_type_secondary_information_multiple_configured": "%@1 Payloads configured",

  /* This is the secondary information for a Setting Type which has multiple payloads configured. */
  "_setting_type_secondary_information_one_configured": "1 Payload configured",

  /* This is the secondary information for a Setting Type which has no payloads configured. */
  "_setting_type_secondary_information_not_configured": "Not Configured",

  /* This is the Push Settings type of Task. Push Settings is performed automatically whenever a Managed Configuration Profile is Saved. */
  "_task_type_push_settings": "Push Settings",
  "_task_type_push_settings_with_display_name": "Push Settings: %@1",

  /* This is the message shown when closing the Admin while there are unsaved changes. */
  "_admin_before_unload_unsaved_changes_will_be_lost": "Unsaved changes will be lost.",

  /* This is the message when the Admin is closed while there is network activity in progress. */
  "_admin_before_unload_network_activity_in_progress": "Network activity in progress.",

  /* This is the status for tasks that failed. */
  "_task_failed": "Failed",
  "_task_succeeded": "Succeeded",
  "_task_no_devices": "No Devices",

  /* Library item tasks secondary information */
  "_task_1_failed": "%@1 failed",
  "_task_many_failed": "%@1 failed",

  "_task_1_cancelled": "%@1 canceled",
  "_task_many_cancelled": "%@1 canceled",

  "_task_1_succeeded": "%@1 succeeded",
  "_task_many_succeeded": "%@1 succeeded",

  "_task_1_cancelled_1_failed": "%@1 canceled, %@2 failed",
  "_task_many_cancelled_1_failed": "%@1 canceled, %@2 failed",
  "_task_1_cancelled_many_failed": "%@1 canceled, %@2 failed",
  "_task_many_cancelled_many_failed": "%@1 canceled, %@2 failed",

  "_task_1_succeeded_1_cancelled": "%@1 succeeded, %@2 canceled",
  "_task_many_succeeded_1_cancelled": "%@1 succeeded, %@2 canceled",
  "_task_1_succeeded_many_cancelled": "%@1 succeeded, %@2 canceled",
  "_task_many_succeeded_many_cancelled": "%@1 succeeded, %@2 canceled",

  "_task_1_succeeded_1_failed": "%@1 succeeded, %@2 failed",
  "_task_many_succeeded_1_failed": "%@1 succeeded, %@2 failed",
  "_task_1_succeeded_many_failed": "%@1 succeeded, %@2 failed",
  "_task_many_succeeded_many_failed": "%@1 succeeded, %@2 failed",

  "_task_1_succeeded_1_cancelled_1_failed": "%@1 succeeded, %@2 canceled, %@3 failed",
  "_task_many_succeeded_1_cancelled_1_failed": "%@1 succeeded, %@2 canceled, %@3 failed",
  "_task_1_succeeded_many_cancelled_1_failed": "%@1 succeeded, %@2 canceled, %@3 failed",
  "_task_1_succeeded_1_cancelled_many_failed": "%@1 succeeded, %@2 canceled, %@3 failed",
  "_task_many_succeeded_many_cancelled_1_failed": "%@1 succeeded, %@2 canceled, %@3 failed",
  "_task_1_succeeded_many_cancelled_many_failed": "%@1 succeeded, %@2 canceled, %@3 failed",
  "_task_many_succeeded_1_cancelled_many_failed": "%@1 succeeded, %@2 canceled, %@3 failed",
  "_task_many_succeeded_many_cancelled_many_failed": "%@1 succeeded, %@2 canceled, %@3 failed",

  "_task_1_of_2_in_progress": "%@1 of %@2 in progress",

  "_task_1_of_2_in_progress_1_failed": "%@1 of %@2 in progress; %@3 failed",
  "_task_1_of_2_in_progress_many_failed": "%@1 of %@2 in progress; %@3 failed",

  "_task_1_of_2_in_progress_1_cancelled": "%@1 of %@2 in progress; %@3 canceled",
  "_task_1_of_2_in_progress_many_cancelled": "%@1 of %@2 in progress; %@3 canceled",

  "_task_1_of_2_in_progress_1_succeeded": "%@1 of %@2 in progress; %@3 succeeded",
  "_task_1_of_2_in_progress_many_succeeded": "%@1 of %@2 in progress; %@3 succeeded",

  "_task_1_of_2_in_progress_1_cancelled_1_failed": "%@1 of %@2 in progress; %@3 canceled, %@4 failed",
  "_task_1_of_2_in_progress_many_cancelled_1_failed": "%@1 of %@2 in progress; %@3 canceled, %@4 failed",
  "_task_1_of_2_in_progress_1_cancelled_many_failed": "%@1 of %@2 in progress; %@3 canceled, %@4 failed",
  "_task_1_of_2_in_progress_many_cancelled_many_failed": "%@1 of %@2 in progress; %@3 canceled, %@4 failed",

  "_task_1_of_2_in_progress_1_succeeded_1_cancelled_1_failed": "%@1 of %@2 in progress; %@3 succeeded, %@4 canceled, %@5 failed",
  "_task_1_of_2_in_progress_1_succeeded_1_cancelled_many_failed": "%@1 of %@2 in progress; %@3 succeeded, %@4 canceled, %@5 failed",
  "_task_1_of_2_in_progress_1_succeeded_many_cancelled_1_failed": "%@1 of %@2 in progress; %@3 succeeded, %@4 canceled, %@5 failed",
  "_task_1_of_2_in_progress_many_succeeded_1_cancelled_1_failed": "%@1 of %@2 in progress; %@3 succeeded, %@4 canceled, %@5 failed",
  "_task_1_of_2_in_progress_1_succeeded_many_cancelled_many_failed": "%@1 of %@2 in progress; %@3 succeeded, %@4 canceled, %@5 failed",
  "_task_1_of_2_in_progress_many_succeeded_many_cancelled_1_failed": "%@1 of %@2 in progress; %@3 succeeded, %@4 canceled, %@5 failed",
  "_task_1_of_2_in_progress_many_succeeded_1_cancelled_many_failed": "%@1 of %@2 in progress; %@3 succeeded, %@4 canceled, %@5 failed",
  "_task_1_of_2_in_progress_many_succeeded_many_cancelled_many_failed": "%@1 of %@2 in progress; %@3 succeeded, %@4 canceled, %@5 failed",

  "_task_1_of_2_in_progress_1_succeeded_1_failed": "%@1 of %@2 in progress; %@3 succeeded, %@4 failed",
  "_task_1_of_2_in_progress_many_succeeded_1_failed": "%@1 of %@2 in progress; %@3 succeeded, %@4 failed",
  "_task_1_of_2_in_progress_1_succeeded_many_failed": "%@1 of %@2 in progress; %@3 succeeded, %@4 failed",
  "_task_1_of_2_in_progress_many_succeeded_many_failed": "%@1 of %@2 in progress; %@3 succeeded, %@4 failed",

  "_task_1_of_2_in_progress_1_succeeded_1_cancelled": "%@1 of %@2 in progress; %@3 succeeded, %@4 canceled",
  "_task_1_of_2_in_progress_many_succeeded_1_cancelled": "%@1 of %@2 in progress; %@3 succeeded, %@4 canceled",
  "_task_1_of_2_in_progress_1_succeeded_many_cancelled": "%@1 of %@2 in progress; %@3 succeeded, %@4 canceled",
  "_task_1_of_2_in_progress_many_succeeded_many_cancelled": "%@1 of %@2 in progress; %@3 succeeded, %@4 canceled",

  /* This is the User/User Group access state for when they can Enable Remote Management. */
  "_access_state_binding_access": "Can Enable Remote Management",

  // KNOB SET ADD STEP 2b
  /*  */
  "_ad_cert_knob_set_description": "Use this section to define settings for Active Directory Certificates.",

  /*  */
  "_scep_knob_set_description": "Use this section to define settings obtaining certificates from SCEP servers.",

  /*  */
  "_cfprefs_knob_set_description": "Use this section to define generic preferences.",

  /*  */
  "_passcode_knob_set_description": "Use this section to specify passcode policies to be enforced on the device.",

  /*  */
  "_general_knob_set_description": "Use this section to define settings for General.",

  /*  */
  "_certificate_knob_set_description": "Use this section to specify the PKCS1 and PKCS12 certificates you want to install on the device. Add your corporate certificate and other certificates necessary to authenticate the device's access to your network.",

  /*  */
  "_cal_dav_knob_set_description": "Use this section to define settings for connecting to CalDAV servers.",

  /*  */
  "_software_update_knob_set_description": "Use this section to define settings for Software Update.",

  /*  */
  "_ichat_knob_set_description": "Use this section to define settings for Messages.",

  /*  */
  "_directory_knob_set_description": "Use this section to define settings for Directory.",

  /*  */
  "_privacy_knob_set_description": "Use this section to define settings for Security and Privacy.",

  /*  */
  "_exchange_knob_set_description": "Use this section to define settings for connecting to your Exchange server.",

  /*  */
  "_web_clip_knob_set_description": "Use this section to configure Web Clips.",

  /*  */
  "_email_knob_set_description": "Use this section to define settings for connecting to your POP or IMAP accounts.",

  /*  */
  "_subscribed_calendar_knob_set_description": "Use this section to define settings for calendar subscriptions.",

  /*  */
  "_vpn_knob_set_description": "Use this section to configure how the device connects to your wireless network via VPN, including the necessary authentication information.",

  /*  */
  "_card_dav_knob_set_description": "Use this section to define settings for connecting to CardDAV servers.",

  /*  */
  "_ldap_knob_set_description": "Use this section to define settings for connecting to LDAP servers.",

  /*  */
  "_restrictions_knob_set_description": "Use this section to restrict which apps, device functionality, and media content are available to the user.",

  /*  */
  "_mac_restrictions_knob_set_description": "Use this section to specify settings related to app and content restrictions. (Users will not be able to modify these settings on their devices once the configuration profile is installed.)",

  /* Global HTTP Proxy knob set description that shows above the configure button */
  "_global_http_proxy_knob_set_description": "Use this section to configure settings for a proxy server through which all HTTP traffic from the device will pass. These settings will only affect supervised devices.",

  /* Application Lock knob set description that shows above the configure button */
  "_app_lock_knob_set_description": "Use this section to specify the app to which the device should be locked to. This setting will only affect supervised devices.",

  /*  */
  "_interface_knob_set_description": "Use this section to define settings for Interfaces.",

  /*  */
  "_printing_knob_set_description": "Use this section to define settings for Printing.",

  /*  */
  "_dock_knob_set_description": "Use this section to define settings for Dock.",

  /*  */
  "_mobility_knob_set_description": "Use this section to define settings for Mobility and Portable Home Directories.",

  /*  */
  "_apn_knob_set_description": "Use this section to specify advanced settings, such as a carrier Access Point Name (APN). (These settings should be managed only by trained professionals.)",

  /*  */
  "_energy_saver_knob_set_description": "Use this section to define settings for Energy Saver.",

  /*  */
  "_parental_controls_knob_set_description": "Use this section to define settings for Parental Controls.",

  /* This is the separator in the sidbear that appears if there are any Enrollment Profiles. */
  "_auto_join_profiles_tree_item": "ENROLLMENT PROFILES",

  /* This is a popup menu item in the sidebar's add button popup. It creates a new Enrollment Profile. */
  "_new_auto_join_profile": "Enrollment Profile",

  /* This is the default name of newly created Enrollment Profiles */
  "_default_auto_join_profile_name": "New Enrollment Profile",

  /* This action downloads the Enrollment Profile so that it can be used to auto-join devices. */
  "_save_auto_join_profile_to_disk": "Save Enrollment Profile to Disk",

  /* This is the name of a temporary device. The wildcard will be filled in with a unique identifier for the Device, such as serial number, UDID, or IMEI. */
  "_admin_device_name_temporary_device": "Temporary: %@1",

  /* This is the Settings tab for Enrollment Profiles. */
  "_auto_join_profile_settings": "Settings",

  /* This is the Usage tab for Enrollment Profiles. */
  "_auto_join_profile_usage": "Usage",

  /* This shows up in the Settings tab of Enrollment Profiles. */
  "_info_auto_join_security_title": "Security",

  /* This shows up in the Settings tab of Enrollment Profiles. */
  "_info_auto_join_security_paragraph": "To improve security, the use of this profile can be restricted to devices with placeholders already in the library.",

  /* This is the checkbox found in the Settings tab of Enrollment Profiles. */
  "_info_auto_join_restrict_use_checkbox": "Restrict use to devices with placeholders",

  /* This is the download button in the toolbar for Enrollment Profiles. */
  "_download_auto_join_profile": "Download",

  /* HERE IS WHERE THE LOGIN BEHAVIOR KNOB SET DESCRIPTION GOES */
  "_login_item_knob_set_description": "Use this section to specify settings for the items that run at login",

  /* HERE IS WHERE THE LOGIN WINDOW KNOB SET DESCRIPTION GOES */
  "_login_window_knob_set_description": "Use this section to specify settings for the behavior and appearance of the Login Window",

  /* This is the description inside the Usage tab for Enrollment Profiles. */
  "_usage_auto_join_description": "The following devices used this profile to join",

  /* This is the secondaryInformation for Enrollment Profiles where the Enrollment Profile was used one time. */
  "_auto_join_profile_secondary_information_one_time": "Used one Time - Last Used on %@1",

  /* This is the secondaryInformation for Enrollment Profiles. The first wildcard specifies the number of times the profile was used. The second wildcard is replaced with the last time it was used. */
  "_auto_join_profile_secondary_information": "Used %@1 Times - Last Used on %@2",

  /* This is the secondaryInformation for Enrollment Profiles that have never been used. */
  "_auto_join_profile_secondary_information_zero_times": "Used 0 Times",

  /* This is the reload button for the Client Error Occurred alert. */
  "_client_error_occurred_reload_button": "Reload",

  /* This is the reload button for the Server Timed Out Error. */
  "_server_timed_out_reload_button": "Reload",

  /* This is the reload button for the Server Not Available error. */
  "_server_not_available_reload_button": "Reload",

  /* This is the reload button for the Server Error Occurred alert. */
  "_server_error_occurred_reload_button": "Reload",

  /* This is the reload button for the Server Not Found error. */
  "_server_not_found_reload_button": "Reload",

  /* This is the reload button for the Network Not Available error. */
  "_network_not_available_reload_button": "Reload",

  /* This is the description shown when showing the Save Changes Confirmation alert if the selected item is a Library Item. */
  "_show_save_changes_confirmation_description_for_library_item": "This might cause settings to be pushed to devices.",

  /* This is a temporary explanation of the wall block on Setting payloads that were provided by Server.app. */
  "_temporary_knob_set_wall_block_explanation": "Provided by Server.app",

  /* This is the URL that the help button will go to. */
  "_go_to_help_url": "https://help.apple.com/profilemanager/mac/3.1/",
  "_devices_help_url": "https://help.apple.com/profilemanager/mac/3.1/#apdCBDB5496-B0DD-41DF-BD85-C5B6A7977C4A",
  "_restrictions_help_url": "https://help.apple.com/profilemanager/mac/3.1/#apdE3C2931F-CD48-46C8-AAC6-C34F5D9AEB54",

  /* This is the Add All button in the Members Picker. It adds all items. */
  "_members_picker_add_all_button": "Add All",

  /* This is the Add Results button in the Members Picker sheet that adds all search results. */
  "_members_picker_add_results_button": "Add Results",

  /* There are various Continue buttons in the Admin. */
  "_generic_continue_button": "Continue",

  /* This is the About Root Item for General info. */
  "_general_about_root_item": "General",

  /* This is the label when Adding a Device to Profile Manager. */
  "_add_device_label_view_value": "Add Device",

  "_add_device_Bonjour Device ID:": "Bonjour Device ID:",
  "_add_device_Airplay Password:": "Airplay Password:",

  "_add_device_pane_width": "480",
  "_add_device_label_width": "140",
  "_add_device_apple_tv_help_description_height": "75",

  "_general_about_Airplay": "AirPlay",
  "_general_about_Password": "Password",
  "_general_about_no password set": "no password set",
  "_general_Bonjour Device ID": "Bonjour Device ID",
  "_general_MAC:": "MAC:",
  "_general_about_MAC_Address_Placeholder": "00:00:00:00:00:00",

  "_generic_string_The Bonjour Device ID can be found by navigating to Settings > General > About on your Apple TV and pressing up on your remote until it is displayed. The AirPlay password is used in the configuration of AirPlay Mirroring settings when this device is added as an allowed AirPlay destination.": "The Bonjour Device ID can be found by navigating to Settings > General > About on your Apple TV and pressing up on your remote until it is displayed. The AirPlay password is used in the configuration of AirPlay Mirroring settings when this device is added as an allowed AirPlay destination.",

  "_generic_string_Known AirPlay Destinations": "Known AirPlay Destinations",

  /* This is the About Root Item for Details; typically additional information that doesn't fit in General. */
  "_details_about_root_item": "Details",

  /* This is the About Root Item for Security. */
  "_security_about_root_item": "Security",

  /* This is the Security field for General Settings. */
  "_general_knob_set_view_security_field": "Security",

  /* This is the Security field for General Settings. */
  "_general_knob_set_view_automatic_profile_removal_field": "Automatically Remove Profile",

  /* This is the About Root Item for the parent Device Groups. */
  "_groups_in_about_root_item_in_device_groups": "In Device Groups",

  /* This is the About Root Item for parent User Groups. */
  "_groups_in_about_root_item_in_user_groups": "In Groups",

  /* This is the About Root Item for Certificates. */
  "_certificates_about_root_item": "Certificates",

  // About page Permissions
  "_permissions_string_Restrictions": "Restrictions",
  "_permissions_string_Allow access to My Devices Portal (https://<hostname>/mydevices)": "Allow access to My Devices Portal (https://%@1/mydevices)",
  "_permissions_string_Allow configuration profile downloads": "Allow configuration profile downloads",
  "_permissions_string_Allow device enrollment and unenrollment": "Allow device enrollment and unenrollment",
  "_permissions_string_Allow device lock": "Allow device lock",
  "_permissions_string_Allow device wipe": "Allow device wipe",
  "_permissions_string_Allow device passcode to be cleared": "Allow device passcode to be cleared",
  "_permissions_string_Allow device enrollment during Setup Assistant": "Allow device enrollment during Setup Assistant",
  "_permissions_string_Restrict enrollment to assigned devices": "Restrict enrollment to assigned devices",
  "_permissions_string_Restrict enrollment to placeholder devices": "Restrict enrollment to placeholder devices",
  "_permissions_string_Learn about restrictions": "Learn about restrictions",

  /* This is the Provisioning Profiles tree item, shown in the sidebar as a grouping. */
  "_provisioning_profiles_tree_item": "PROVISIONING PROFILES",

  /* This is the Sidebar Item for Devices, shown under LIBRARY. */
  "_devices_sidebar_item_display_name": "Devices",

  /* This is the Devices tab. */
  "_tabs_devices_tab": "Devices",

  /* This is the Settings tab. */
  "_tabs_settings_tab": "Settings",

  /* This is the Info tab. */
  "_tabs_info_tab": "Info",

  /* This is the Books tab */
  "_tabs_books_tab": "Books",

  /* This is the About tab. */
  "_tabs_about_tab": "About",

  /* This is the Profiles tab. */
  "_tabs_profiles_tab": "Profile",

  /* This is the Members tab. */
  "_tabs_members_tab": "Members",

  /* This is the Activity tab. */
  "_tabs_activity_tab": "Activity",
  "_tabs_apps_tab": "Apps",

  /* This is the tab shown when the tabs are loading. */
  "_tabs_loading_tab": "Loading…",

  /* This is the Sidebar Item for Users, located under LIBRARY. */
  "_users_sidebar_item_display_name": "Users",

  /* This is the part of the Title of the Window Document Title when an Enrollment Profile is selected. */
  "_window_document_title_sidbear_auto_join_profile": "Enrollment Profile",

  /* This is the unique identifier popup entry for IMEI in the Add Device Sheet. */
  "_add_device_identifier_imei": "IMEI",

  /* This is the unique identifier popup entry for MEID in the Add Device Sheet. */
  "_add_device_identifier_meid": "MEID",

  /* This is the unique identifier popup entry for Serial Number in the Add Device Sheet. */
  "_add_device_identifier_serial_number": "Serial Number",

  /* This is the unique identifier popup entry for UDID in the Add Device Sheet. */
  "_add_device_identifier_udid": "UDID",

  /* The hint in text fields where the field is required. */
  "_hint_required": "required",

  /* This is the name label for the Add Device sheet. */
  "_add_device_name_label": "Name:",

  /* This appears on an iPad when it is in vertical mode. */
  "_temporary_ipad_vertical_mode_blocker_label": "Rotate your iPad to use Profile Manager.",

  /* This is the menu item to create a new Provisioning Profile. */
  "_new_provisioning_profile": "Provisioning Profile",

  /* This shows up when nothing is selected in the sidebar. */
  "_no_item_view_nothing_selected": "Nothing Selected",

  /* This shows up when searching and nothing was found for the selected sidebar item. The wildcard is replaced with the name of the selected sidebar item. */
  "_no_item_view_no_somethings_found": "No %@1 Found",

  /* This shows up when there is none of the thing selected in the sidebar. The wildcard is replaced with the name of the selected sidebar item. */
  "_no_item_view_no_somethings": "No %@1",

  /* This is the menu item to add Devices. */
  "_add_recipients_add_devices": "Add Devices",

  /* This is the menu item to add User Groups. */
  "_add_recipients_add_user_groups": "Add Groups",

  /* This is the menu item to add Users. */
  "_add_recipients_add_users": "Add Users",

  /* This is the menu item to add Device Groups. */
  "_add_recipients_add_device_groups": "Add Device Groups",

  /* This is the hint for search boxes that filter things. */
  "_filter_hint": "Filter",

  /*  */
  "_import_placeholder_devices": "Import Placeholders",

  /*  */
  "_add_placeholder_device": "Add Placeholder",

  /*  */
  "_import_placeholder_devices_error_cancel": "Cancel",

  /*  */
  "_import_placeholder_devices_imported_one_device": "Imported one device placeholder",

  /*  */
  "_import_placeholder_devices_error_headers_not_found": "Headers not found.",

  /*  */
  "_import_placeholder_devices_imported_n_devices": "Imported %@1 device placeholders",

  /*  */
  "_import_placeholder_devices_error_non_csv": "File was not CSV.",

  /*  */
  "_import_placeholder_devices_error_unknown": "Unknown error.",

  /*  */
  "_import_placeholder_devices_error_occurred": "An error occured while attempting to import placeholders",

  /*  */
  "_import_placeholder_devices_successful": "Placeholder import was successful",

  /*  */
  "_import_placeholder_devices_error_no_valid_devices": "No valid placeholders.",

  /*  */
  "_import_placeholder_devices_not_imported_one_device": "Did not import one row.",

  /*  */
  "_import_placeholder_devices_not_imported_n_devices": "Did not import %@1 rows.",

  /*  */
  "_import_placeholder_devices_error_csv_invalid": "CSV was invalid.",

  /* This is shown if there are mac(s) that are incompatible with the task type. */
  "_new_task_1_mac_will_not_apply_to": "This will not apply to one Mac.",

  /* This is shown if there are mac(s) that are incompatible with the task type. */
  "_new_task_n_macs_will_not_apply_to": "This will not apply to $@1 Macs.",

  /*  */
  "_new_task_the_n_ios_devices_can_be_unlocked": "The %@1 iOS devices can be unlocked using their current passcode.",

  /*  */
  "_new_task_the_1_ios_device_can_be_unlocked": "The one iOS device can be unlocked using its current passcode.",

  /*  */
  "_new_task_enter_a_passcode_for_1_mac_os_x_device": "Enter a passcode that can be used later to unlock the one OS X device.",

  /*  */
  "_new_task_enter_a_passcode_for_n_mac_os_x_devices": "Enter a passcode that can be used later to unlock the %@1 OS X devices.",

  /*  */
  "_new_task_reenter_the_passcode": "Re-enter the passcode",

  /*  */
  "_new_task_passcodes_did_not_match_warning": "Passcodes did not match",

  /*  */
  "_new_task_cancel": "Cancel",

  /*  */
  "_new_task_ok": "OK",

  /*  */
  "_new_task_this_command_only_applies_to_ios_devices": "This command only applies to iOS devices.",

  /*  */
  "_new_task_you_must_select_one_or_more_devices": "You must select one or more devices before running this command.",

  /*  */
  "_new_task_no_devices_ok_button_view": "OK",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Don't Allow TV Shows": "Don't Allow TV Shows",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Credential for authenticating the ActiveSync account": "Credential for authenticating the ActiveSync account",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 day": "1 day",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Credential for authenticating the connection": "Credential for authenticating the connection",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Screenshot": "Allow Screenshot",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password for the outgoing mail server": "The password for the outgoing mail server",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Safari Allow Popups": "Safari Allow Popups",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_IMEI": "IMEI",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Shared secret for the connection": "Shared secret for the connection",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add": "Add",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%@1 Members": "%@1 Members",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Maximum Auto-Lock": "Maximum Auto-Lock",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Requires passcode to contain at least one letter": "Requires passcode to contain at least one letter",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The CalDAV password": "The CalDAV password",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Company Account": "My Mail Account",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Proxy Server and Port": "Proxy Server and Port",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Include User PIN": "Include User PIN",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add Users": "Add Users",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Wireless network encryption to use when connecting": "Wireless network encryption to use when connecting",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Save...": "Save…",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Days after which the passcode must be changed": "Days after which the passcode must be changed",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Internal Server Path": "Internal Server Path",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Identification of the wireless network to connect to": "Identification of the wireless network to connect to",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Explicit Content": "Allow Explicit Content",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Display name of the account": "Display name of the account",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_18+": "18+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication type for connection": "Authentication type for connection",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Camera": "Allow Camera",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Proxy Server URL": "Proxy Server URL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Proxy PAC URL": "Proxy PAC URL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow In-App Purchase": "Allow In-App Purchase",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow In-App Purchases": "Allow In-App Purchases",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PIN History": "PIN History",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MA": "MA",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User Group": "Group",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Configures proxies to be used with this VPN connection": "Configures proxies to be used with this VPN connection",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Group identifier for the connection": "Group identifier for the connection",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_POP": "POP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_This profile has %@1 errors": "This profile has %@1 errors",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow All Apps": "Allow All Apps",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The display name of the account": "The display name of the account",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 week": "1 week",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_This profile has 1 error": "This profile has 1 error",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_RSA SecurID": "RSA SecurID",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Maximum passcode age (1-730 days, or none)": "Maximum passcode age (1-730 days, or none)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Modem": "Modem",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Network": "Network",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable Secure Socket Layer communication with chat server": "Enable Secure Socket Layer communication with chat server",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Last Checkin Time": "Last Checkin Time",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_R18+": "R18+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Name": "Account Name",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Number of unique passcodes before reuse": "Number of unique passcodes before reuse",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Permit the use of repeating, ascending, and descending character sequences": "Permit the use of repeating, ascending, and descending character sequences",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Delete": "Delete",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_18A": "18A",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access": "Access",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The hostname of the directory server": "The hostname of the directory server",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow All Movies": "Allow All Movies",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 hour": "1 hour",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Voice Dialing": "Allow Voice Dialing",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The CardDAV username": "The CardDAV username",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Display name of the connection (displayed on the device)": "Display name of the connection (displayed on the device)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Retrieve incoming mail through secure socket layer": "Retrieve incoming mail through secure socket layer",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow iTunes": "Allow iTunes",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Description": "Account Description",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Force Encrypted Backup": "Force Encrypted Backup",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Force limited ad tracking": "Force limited ad tracking",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Username used to connect to the proxy": "Username used to connect to the proxy",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_IMAP": "IMAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ireland": "Ireland",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No Devices Found For Task Caption": "No Devices Found For Task Caption",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Passcode history (1-50 passcodes, or none)": "Passcode history (1-50 passcodes, or none)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Type": "Type",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The users and groups that cannot login at this computer": "The users and groups that cannot login at this computer",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Search Base": "Search Base",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_New Device Group": "New Device Group",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Auto Sync while Roaming": "Allow Auto Sync while Roaming",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User Display Name": "User Display Name",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Safari Accept Cookies": "Safari Accept Cookies",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_5 minutes": "5 minutes",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access Point Password": "Access Point Password",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password for this LDAP Account": "The password for this LDAP Account",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Shared Secret": "Shared Secret",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_This configuration profile has no recipents, it will not be distributed": "This configuration profile has no recipents, it will not be distributed",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use SSL for External Exchange Host": "Use SSL for External Exchange Host",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable VPN on Demand": "Enable VPN on Demand",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable VPN on Demand (OS X only)": "Enable VPN on Demand (OS X only)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hostname or IP address, and port number for outgoing mail": "Hostname or IP address, and port number for outgoing mail",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Window": "Window",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. Movie Rating": "Max. Movie Rating",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Server Address and Port": "Server Address and Port",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 Member": "1 Member",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication type for the connection": "Authentication type for the connection",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use SSL": "Use SSL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Group": "Group",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_email": "email",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The display name of the user (e.g. \"John Appleseed\")": "The display name of the user (e.g. \"John Appleseed\")",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_HTTP MD5 Digest": "HTTP MD5 Digest",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Available Capacity": "Available Capacity",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The URL of the calendar file": "The URL of the calendar file",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The username for this LDAP Account": "The username for this LDAP Account",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Maximum number of failed attempts": "Maximum number of failed attempts",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Group Name": "Group Name",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Description": "Description",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name for the Exchange ActiveSync account": "Name for the Exchange ActiveSync account",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Hostname": "Account Hostname",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The chat protocol to use for this configuration": "The chat protocol to use for this configuration",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV-Y": "TV-Y",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Japan": "Japan",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Don\'t Delete": "Don\'t Delete",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV-G": "TV-G",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Realm for authenticating the connection": "Realm for authenticating the connection",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The username used to connect to the server for outgoing mail": "The username used to connect to the server for outgoing mail",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Password used to authenticate with the proxy": "Password used to authenticate with the proxy",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Subtree": "Subtree",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV-14": "TV-14",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_GA": "GA",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_RP16": "RP16",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_12A": "12A",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Safari Force Fraud Warning": "Safari Force Fraud Warning",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Outgoing Mail": "Outgoing Mail",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Scope": "Scope",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Type": "Account Type",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User Authentication": "User Authentication",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access Point Name (APN)": "Access Point Name (APN)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Base": "Base",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Safari": "Allow Safari",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The users and groups that can login at this computer": "The users and groups that can login at this computer",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Don't Allow Movies": "Don't Allow Movies",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Minimum passcode length": "Minimum passcode length",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_URL": "URL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The Principal URL for the CalDAV account": "The Principal URL for the CalDAV account",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The username used to connect to the server for incoming mail": "The username used to connect to the server for incoming mail",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Longest auto-lock time available to the user": "Longest auto-lock time available to the user",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Model Number": "Model Number",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Username": "Account Username",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hidden Network": "Hidden Network",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Done": "Done",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Expires: ": "Expires: ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_R-15": "R-15",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The LDAP hostname or IP address": "The LDAP hostname or IP address",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt user for password on the device": "Prompt user for password on the device",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_R-18": "R-18",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Software Update server": "Software Update server",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password for this subscription": "The password for this subscription",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_New Device": "New Device",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Routes all network traffic through the VPN connection": "Routes all network traffic through the VPN connection",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_WPA / WPA2": "WPA / WPA2",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use Kerberos v5 for authentication": "Use Kerberos v5 for authentication",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Role": "Role",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Login Group or Domain for the connection": "Login Group or Domain for the connection",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Login Group or Domain": "Login Group or Domain",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SonicWALL": "SonicWALL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SonicWALL Mobile Connect": "SonicWALL Mobile Connect",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Aruba VIA": "Aruba VIA",

  /* This is the width of the Connection Type popup button in the VPN payload editor */
  "_layout_vpn_connection_type_button_width": "200",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Serial Number": "Serial Number",

  /* This is a generic string used one or more times in the app. */
  "_global_http_proxy_type_Automatic": "Automatic",
  "_network_proxy_type_Automatic": "Automatic",
  "_vpn_data_encryption_level_Automatic": "Automatic",
  "_vpn_proxy_type_Automatic": "Automatic",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The description of the calendar subscription": "The description of the calendar subscription",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The CardDAV password": "The CardDAV password",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PG-13": "PG-13",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PG-12": "PG-12",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Always": "Always",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Caution": "Caution",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The image file is invalid or too large": "The image file is invalid or too large",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Options": "Options",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_WEP Enterprise": "WEP Enterprise",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Username": "Username",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Longest device lock grace period available to the user": "Longest device lock grace period available to the user",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password for the account (e.g. \"MyP4ssw0rd!\")": "The password for the account (e.g. \"MyP4ssw0rd!\")",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The authentication method for the incoming mail server": "The authentication method for the incoming mail server",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Simple Passcode": "Allow Simple Passcode",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Remove": "Remove",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_C8": "C8",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My CardDAV Account": "My Contacts Account",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ICCID": "ICCID",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow simple value": "Allow simple value",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable Secure Socket Layer communication with CalDAV server": "Enable Secure Socket Layer communication with CalDAV server",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_One Level": "One Level",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The manner in which the profile is distributed to devices": "The manner in which the profile is distributed to devices",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication Type": "Authentication Type",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SMTP authentication uses the same password as POP/IMAP": "SMTP authentication uses the same password as POP/IMAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_groupname": "groupname",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. Failed Attempts": "Max. Failed Attempts",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Uc": "Uc",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_From visited sites": "From visited sites",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Shared Secret / Group Name": "Shared Secret / Group Name",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Group for authenticating the connection": "Group for authenticating the connection",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable Secure Socket Layer for this connection": "Enable Secure Socket Layer for this connection",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Password": "Account Password",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_External Server Path": "External Server Path",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication": "Authentication",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_, ": ", ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No Members": "No Members",
  "_user_group_membership_count_1 Group, No Users": "1 Group",
  "_user_group_membership_count_%@ Groups, No Users": "%@ Groups",
  "_user_group_membership_count_No Groups, 1 User": "1 User",
  "_user_group_membership_count_No Groups, %@ Users": "%@ Users",
  "_user_group_membership_count_1 Group, 1 User": "1 Group, 1 User",
  "_user_group_membership_count_%@ Groups, %@ Users": "%@ Groups, %@ Users",
  "_user_group_membership_count_%@ Groups, 1 User": "%@ Groups, 1 User",
  "_user_group_membership_count_1 Group, %@ User": "1 Group, %@ Users",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication Credential": "Authentication Credential",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Server path for the external exchange host": "Server path for the external exchange host",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Issued by: %@1": "Issued by: %@1",

  /* This is a generic string used one or more times in the app. */
  "_network_proxy_setting_None": "None",
  "_network_security_type_None": "None",
  "_incoming_email_authentication_type_None": "None",
  "_outgoing_email_authentication_type_None": "None",
  "_vpn_encryption_level_None": "None",
  "_vpn_proxy_setting_None": "None",
  "_default_printer_item_None": "None",
  "_scep_subject_alternative_name_type_None": "None",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Device": "Device",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Software Version": "Software Version",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. TV Shows Rating": "Max. TV Shows Rating",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Carrier Settings Version": "Carrier Settings Version",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Password for the account": "Password for the account",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The directory server username": "The directory server username",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user name to connect to the access point": "The user name to connect to the access point",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_smtp.example.com": "smtp.example.com",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%m/%d/%y at %i:%M:%S %p": "%m/%d/%y at %i:%M:%S %p",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable Secure Socket Layer communication with CardDAV server": "Enable Secure Socket Layer communication with CardDAV server",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Controls when the profile can be removed": "Controls when the profile can be removed",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_mail.example.com": "mail.example.com",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Automatic Push": "Automatic Push",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The directory server client ID": "The directory server client ID",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt for Password": "Prompt for Password",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_OK": "OK",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User account for authenticating the connection": "User account for authenticating the connection",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use as a System configuration": "Use as a System configuration (OS X only)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_UDID": "UDID",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Safari Allow JavaScript": "Safari Allow JavaScript",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Hostname and Port": "Account Hostname and Port",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The number of past days of mail to synchronize": "The number of past days of mail to synchronize",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Current Carrier Network": "Current Carrier Network",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Expires: %A, %B %D, %Y %i:%M:%S %p %Z": "Expires: %A, %B %D, %Y %i:%M:%S %p %Z",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV-MA": "TV-MA",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Path Prefix:": "Path Prefix:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Smallest number of non-alphanumeric characters allowed": "Smallest number of non-alphanumeric characters allowed",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password for the incoming mail server": "The password for the incoming mail server",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_2 minutes": "2 minutes",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Any (Enterprise)": "Any (Enterprise)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Microsoft Exchange Server": "Microsoft Exchange Server",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_username": "username",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User Name": "User Name",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_usernames": "usernames",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Security Type": "Security Type",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_United Kingdom": "United Kingdom",

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
  "_generic_string_Authentication Credential Passphrase": "Authentication Credential Passphrase",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. Apps Rating": "Max. Apps Rating",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Min. Complex Char's": "Min. Complex Char's",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_optional Ex. O=Company Name, CN=Foo": "optional Ex. O=Company Name, CN=Foo",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require Alphanumeric": "Require Alphanumeric",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication Credential Name": "Authentication Credential Name",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_4 minutes": "4 minutes",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Principal URL": "Principal URL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_set on device": "set on device",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The directory server password": "The directory server password",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My Subscribed Calendar": "My Subscribed Calendar",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The Principal URL for the CardDAV account": "The Principal URL for the CardDAV account",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MD5 Challenge-Response": "MD5 Challenge-Response",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User logs in to authenticate the Mac to the network": "User logs in to authenticate the Mac to the network",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ab 18 Jahren": "ab 18 Jahren",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MDM": "MDM",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_12+": "12+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require alphanumeric value": "Require alphanumeric value",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Bluetooth MAC": "Bluetooth MAC",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow YouTube": "Allow YouTube",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_United States": "United States",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Server Hostname": "Server Hostname",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The address of the account (e.g. \"john@example.com\")": "The address of the account (e.g. \"john@example.com\")",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MA15+": "MA15+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use Kerberos v5": "Use Kerberos v5",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The Mac can access the network without a logged-in user": "The Mac can access the network without a logged-in user",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Send All Traffic": "Send All Traffic",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Password": "Password",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Last Edited %A, %B %d, %Y": "Last Edited %A, %B %d, %Y",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The name of the carrier (GPRS) access point": "The name of the carrier (GPRS) access point",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The protocol for accessing the email account": "The protocol for accessing the account",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add User Groups": "Add Groups",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Safari Allow Autofill": "Safari Allow Autofill",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Loading…": "Loading…",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Connection Type": "Connection Type",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ask during installation": "ask during installation",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Australia": "Australia",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My CalDAV Account": "My Calendar Account",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The device will prompt the user for the passphrase if not given": "The device will prompt the user for the passphrase if not given",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. PIN Age In Days": "Max. PIN Age In Days",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_R18": "R18",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hostname of IP address for server": "Hostname of IP address for server",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Machine Authentication": "Machine Authentication",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Outgoing password same as incoming": "Outgoing password same as incoming",

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
  "_generic_string_Hostname or IP address, and port number for incoming mail": "Hostname or IP address, and port number for incoming mail",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_4+": "4+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Encryption Level": "Encryption Level",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_URL used to retrieve proxy settings": "URL used to retrieve proxy settings",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Email Address": "Email Address",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Profile Distribution Type": "Profile Distribution Type",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Min. Length": "Min. Length",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_LDAP Account": "LDAP Account",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable if target network is not open or broadcasting": "Enable if target network is not open or broadcasting",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Scripts": "Scripts",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Service Set Identifier (SSID)": "Service Set Identifier (SSID)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Maximum grace period for device lock": "Maximum grace period for device lock",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name or description for ActiveSync": "Name or description for ActiveSync",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_France": "France",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Type of network interface on the device": "Type of network interface on the device",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The display name of the account (e.g. 'Company LDAP Account')": "The display name of the account (e.g. 'Company LDAP Account')",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_3 minutes": "3 minutes",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_2 weeks": "2 weeks",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_New Configuration Profile": "New Configuration Profile",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Capacity": "Capacity",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name for the Exchange Web Services account": "Name for the Exchange Web Services account",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Network Interface": "Network Interface",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Minimum number of complex characters": "Minimum number of complex characters",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The display name of the account (e.g. \"Company Mail Account\")": "The display name of the account (e.g. \"Company Mail Account\")",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The CalDAV username": "The CalDAV username",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_defaults to username@host": "defaults to username@host",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authenticate using secret, name, and server-side certificate": "Authenticate using secret, name, and server-side certificate",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_mobile": "mobile",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Machine": "Machine",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User": "User",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Revert": "Revert",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_15 minutes": "15 minutes",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 minutes": "1 minutes",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Password for authenticating the connection": "Password for authenticating the connection",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Password for the wireless network": "Password for the wireless network",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PS": "PS",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_-18": "-18",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Search settings for this LDAP server": "Search settings for this LDAP server",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_-16": "-16",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Canada": "Canada",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_-12": "-12",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_-10": "-10",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password to connect to the access point": "The password to connect to the access point",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PG": "PG",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_4 hours": "4 hours",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Exchange ActiveSync Host": "Exchange ActiveSync Host",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Past Days of Mail to Sync": "Past Days of Mail to Sync",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow": "Allow",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Wi-Fi MAC": "Wi-Fi MAC",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ethernet MAC": "Ethernet MAC",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV-PG": "TV-PG",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Server": "Server",

  /* This is a generic string used one or more times in the app. */
  "_global_http_proxy_type_Manual": "Manual",
  "_network_proxy_type_Manual": "Manual",
  "_vpn_proxy_type_Manual": "Manual",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 month": "1 month",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Force Passcode": "Force Passcode",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use as a Login Window configuration": "Use as a Login Window configuration (OS X only)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow FaceTime": "Allow FaceTime",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Search Settings": "Search Settings",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_YA": "YA",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_optional": "optional",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Save": "Save",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The printers available to a user": "The printers available to a user",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use SSL for Internal Exchange Host": "Use SSL for Internal Exchange Host",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Build": "Build",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Realm": "Realm",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The chat username": "The chat username",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Smallest number of passcode characters allowed": "Smallest number of passcode characters allowed",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Incoming Mail": "Incoming Mail",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_NC-17": "NC-17",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_3 days": "3 days",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Any (Personal)": "Any (Personal)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_9+": "9+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PGR": "PGR",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hostname or IP address, and port number for the proxy server": "Hostname or IP address, and port number for the proxy server",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV-Y7": "TV-Y7",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Mail Server and Port": "Mail Server and Port",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Deny": "Deny",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Retrieve outgoing mail through secure socket layer": "Retrieve outgoing mail through secure socket layer",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hostname or IP address, and port number for the server": "Hostname or IP address, and port number for the server",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Proxy Setup": "Proxy Setup",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Proxy Type": "Proxy Type",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Never": "Never",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_--": "--",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_WPA / WPA2 Enterprise": "WPA / WPA2 Enterprise",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. Inactivity": "Max. Inactivity",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use Hybrid Authentication": "Use Hybrid Authentication",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sim Carrier Network": "Sim Carrier Network",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_NTLM": "NTLM",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The type of connection enabled by this policy": "The type of connection enabled by this policy",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Printer List": "Printer List",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 minute": "1 minute",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ab 16 Jahren": "ab 16 Jahren",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Immediately": "Immediately",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My Account": "My Account",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Manual Download": "Manual Download",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Server path for the internal exchange host": "Server path for the internal exchange host",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_AV15+": "AV15+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Client ID": "Client ID",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Man. Fetch. When Roaming": "Man. Fetch. When Roaming",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Cancel": "Cancel",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ab 6 Jahren": "ab 6 Jahren",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_auto": "auto",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Specify a URL of the form http://server.example.com:8088/catalogs.sucatalog": "Specify a URL of the form http://server.example.com:8088/catalogs.sucatalog",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Internal Exchange Host": "Internal Exchange Host",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Role for authenticating the connection": "Role for authenticating the connection",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Connection Name": "Connection Name",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Explicit Allowed": "Explicit Allowed",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The CardDAV hostname or IP address and port number": "The CardDAV hostname or IP address and port number",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate": "Certificate",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max. Grace Period": "Max. Grace Period",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Don't Allow Apps": "Don't Allow Apps",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ch": "Ch",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ab 0 Jahren": "ab 0 Jahren",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The authentication method for the outgoing mail server": "The authentication method for the outgoing mail server",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_External Exchange Host": "External Exchange Host",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The CalDAV hostname or IP address and port number": "The CalDAV hostname or IP address and port number",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow All TV Shows": "Allow All TV Shows",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Domain": "Domain",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Phone": "Phone",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_14+": "14+",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Germany": "Germany",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_AO": "AO",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Send all communication through secure socket layer": "Send all communication through secure socket layer",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Domain and host names that will establish a VPN": "Domain and host names that will establish a VPN",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account": "Account",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_New Zealand": "New Zealand",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The username for this subscription": "The username for this subscription",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Number of passcode entry attempts allowed before all data on device will be erased": "Number of passcode entry attempts allowed before all data on   device will be erased",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access Point User Name": "Access Point User Name",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User authentication type for the connection": "User authentication type for the connection",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_WEP": "WEP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Level of data encryption applied to the connection": "Level of data encryption applied to the connection",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow App Installation": "Allow App Installation",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_14A": "14A",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Maximum (128-bit)": "Maximum (128-bit)",

  /*  */
  "_knob_set_from_servermgr_card_dav_hostname": "Hostname",

  /*  */
  "_knob_set_from_servermgr_card_dav_port": "Port",

  /*  */
  "_knob_set_from_servermgr_helper": "This payload is configured using the Server app",

  /*  */
  "_knob_set_from_servermgr_cal_dav_hostname": "Hostname",

  /*  */
  "_knob_set_from_servermgr_cal_dav_port": "Port",

  /*  */
  "_knob_set_from_servermgr_email_group_incoming_mail": "Incoming Mail",

  /*  */
  "_knob_set_from_servermgr_email_account_description": "Account Description",

  /*  */
  "_knob_set_from_servermgr_email_account_type": "Account Type",

  /*  */
  "_knob_set_from_servermgr_email_incoming_hostname": "Mail Server",

  /*  */
  "_knob_set_from_servermgr_email_incoming_port": "Port",

  /*  */
  "_knob_set_from_servermgr_email_outgoing_ssl": "Use SSL",

  /*  */
  "_knob_set_from_servermgr_email_outgoing_hostname": "Mail Server",

  /*  */
  "_knob_set_from_servermgr_email_group_outgoing_mail": "Outgoing Mail",

  /*  */
  "_knob_set_from_servermgr_email_incoming_ssl": "Use SSL",

  /*  */
  "_knob_set_from_servermgr_email_outgoing_port": "Port",

  /*  */
  "_knob_set_from_servermgr_email_incoming_authentication": "Authentication Type",

  /*  */
  "_knob_set_from_servermgr_email_outgoing_authentication": "Authentication Type",

  /*  */
  "_knob_set_from_servermgr_cal_dav_account_description": "Account Description",

  /*  */
  "_knob_set_from_servermgr_card_dav_account_description": "Account Description",

  /*  */
  "_knob_set_from_servermgr_cal_dav_ssl": "Use SSL",

  /*  */
  "_knob_set_from_servermgr_card_dav_ssl": "Use SSL",

  /*  */
  "_knob_set_from_servermgr_ichat_hostname": "Server Address",

  /*  */
  "_knob_set_from_servermgr_ichat_port": "Port",

  /*  */
  "_knob_set_from_servermgr_ichat_connection_name": "Account Description",

  /*  */
  "_knob_set_from_servermgr_ichat_connection_type": "Account Type",

  /*  */
  "_knob_set_from_servermgr_passcode_required": "Require Passcode on device",

  /*  */
  "_knob_set_from_servermgr_passcode_allow_simple": "Allow simple value",

  /*  */
  "_knob_set_from_servermgr_passcode_min_length": "Minimum passcode length",

  /*  */
  "_knob_set_from_servermgr_passcode_require_alphanumeric": "Require alphanumeric value",

  /*  */
  "_knob_set_from_servermgr_passcode_min_complex": "Minimum complex characters",

  /*  */
  "_knob_set_from_servermgr_passcode_max_age": "Maximum passcode age",

  /*  */
  "_knob_set_from_servermgr_passcode_auto_lock": "Auto-Lock",

  /*  */
  "_knob_set_from_servermgr_passcode_yes": "Yes",

  /*  */
  "_knob_set_from_servermgr_passcode_no": "No",

  /*  */
  "_knob_set_from_servermgr_passcode_none": "None",

  /*  */
  "_knob_set_from_servermgr_passcode_never": "Never",

  /*  */
  "_knob_set_from_servermgr_passcode_1_minute": "One minute",

  /*  */
  "_knob_set_from_servermgr_passcode_n_minutes": "%@1 minutes",

  /*  */
  "_knob_set_from_servermgr_ichat_connection_type_jabber": "Jabber",

  /*  */
  "_knob_set_from_servermgr_ichat_connection_type_not_jabber": "Not Jabber",

  /*  */
  "_knob_set_from_servermgr_vpn_server": "Server",

  /*  */
  "_knob_set_from_servermgr_vpn_use_shared_secret": "Use Shared Secret",

  /*  */
  "_knob_set_from_servermgr_vpn_send_proxy_setup": "Proxy Setup",

  /*  */
  "_knob_set_from_servermgr_vpn_send_all_traffic": "Send All Traffic",

  /*  */
  "_knob_set_from_servermgr_vpn_user_auth": "User Authentication",

  /*  */
  "_knob_set_from_servermgr_vpn_connection_name": "Connection Name",

  /*  */
  "_knob_set_from_servermgr_vpn_connection_type": "Connection Type",

  /*  */
  "_knob_set_from_servermgr_email_account_type_pop": "POP",

  /*  */
  "_knob_set_from_servermgr_email_account_imap": "IMAP",

  /*  */
  "_knob_set_from_servermgr_email_account_crammd5": "MD5 Challenge-Response",

  /*  */
  "_knob_set_from_servermgr_email_account_not_crammd5": "Not MD5 Challenge-Response",

  /*  */
  "_import_placeholder_devices_skip": "Skip",

  /*  */
  "_import_placeholder_devices_create_device_group": "Create Device Group",

  /*  */
  "_import_placeholder_devices_add_to_existing_device_group": "Add to Existing Device Group",

  /*  */
  "_truncated_indicator_view_helper": "Use the search box to access additional records",

  /* First wildcard is the name of the user, second wildcard is the name of the device. */
  "_lab_session_user_on_device": "%@1 on %@2",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name of the organization for the profile": "Name of the organization for the profile",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Organization": "Organization",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add Mount Point": "Add Mount Point",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can always launch these applications": "The user can always launch these apps",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Applications": "Apps",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Don't add to Device Group": "Don't add to Device Group",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Files in these folders will sync as specified above": "Files in these folders will sync as specified above",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Create a new Device Group": "Create a new Device Group",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Items matching any of the following will not sync": "Items matching any of the following will not sync",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Creation": "Account Creation",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Preference Sync": "Preference Sync",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_CHAP": "CHAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Dock Applications": "Dock Apps",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can never launch applications in these folders": "The user can never launch apps in these folders",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can always launch applications in these folders": "The user can always launch apps in these folders",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Identity Certificate": "Identity Certificate",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate names expected from authentication server": "Certificate names expected from authentication server",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Username for connection to the network": "Username for connection to the network",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Folders:": "Allow Folders:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Outer Identity": "Outer Identity",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Password for the provided username": "Password for the provided username",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Disallow Folders:": "Disallow Folders:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Inner Authentication": "Inner Authentication",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The files and folders that will appear in the user's dock": "The files and folders that will appear in the user's dock",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Widgets": "Widgets",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Skip Items": "Skip Items",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hostname:": "Hostname:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PAP": "PAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Account Expiry": "Account Expiry",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Dock Items": "Dock Items",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication protocol (for use only with TTLS)": "Authentication protocol (for use only with TTLS)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificates trusted/expected for authentication": "Certificates trusted/expected for authentication",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Request during connection and send with authentication": "Request during connection and send with authentication",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Externally visible identification (TTLS, PEAP, and EAP-FAST)": "Externally visible identification (TTLS, PEAP, and EAP-FAST)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MSCHAP": "MSCHAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Method to use to authenticate to the network": "Method to use to authenticate to the network",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use Per-Connection Password": "Use Per-Connection Password",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MSCHAPv2": "MSCHAPv2",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Protocols": "Protocols",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Preferences in these folders will sync as specified above": "Preferences in these folders will sync as specified above",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Trusted Server Certificate Names": "Trusted Server Certificate Names",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Rules": "Rules",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Widgets:": "Allow Widgets:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Creation": "Creation",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The applications that will appear in the user's dock": "The apps that will appear in the user's dock",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Trust": "Trust",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can always run these widgets": "The user can always run these widgets",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Trust Exceptions": "Allow Trust Exceptions",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Home Sync": "Home Sync",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Applications:": "Allow Apps:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Credentials for connection to the network": "Credentials for connection to the network",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sync Folders": "Sync Folders",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Trusted Certificates": "Trusted Certificates",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Protocol:": "Protocol:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SMB": "SMB",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_NFS": "NFS",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Volume:": "Volume:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_AFP": "AFP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Refresh": "Refresh",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MEID": "MEID",

  /*  */
  "_admin_welcome_first_time": "Welcome to Profile Manager!",

  /*  */
  "_admin_welcome_close": "Close",

  /*  */
  "_admin_welcome_dont_show_again": "Don't Show Again",

  /*  */
  "_no_item_view_is_truncation_indicator": "Use search to find %@1",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Help": "Help",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Log Out": "Log Out",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show Welcome Panel": "Show Welcome Panel",

  /*  */
  "_members_picker_refresh_button": "Refresh",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show Passcode": "Show Passcode",

  /*  */
  "_show_passcode_the_passcode_is": "The passcode is: %@1",

  /*  */
  "_show_passcode_message": "Show Passcode",

  /*  */
  "_task_cancel_task": "Cancel Task",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Send Email": "Send Email",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Send": "Send",

  /*  */
  "_setting_types_mac": "OS X",

  /*  */
  "_setting_types_both": "OS X and iOS",

  /*  */
  "_setting_types_ios": "iOS",

  /*  */
  "_task_type_remove_profile_with_display_name": "Remove Settings: %@1",

  /*  */
  "_profile_1_payload_configured": "1 Payload Configured",

  /*  */
  "_profile_n_payloads_configured": "%@1 Payloads Configured",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Created ": "Created ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Updated ": "Updated ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Edit": "Edit",

  /*  */
  "_items_settings": "Settings for %@1",

  /*  */
  "_items_settings_n": "Settings for %@1 (%@2)",

  /*  */
  "_add_recipients_new_profile": "New Profile",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Go": "Go",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_With Authorization": "With Authorization",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Wi-Fi": "Wi-Fi",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ethernet (OS X only)": "Ethernet (OS X only)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_LEAP": "LEAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TTLS": "TTLS",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PEAP": "PEAP",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authentication protocols supported on target network": "Authentication protocols supported on target network",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_EAP-SIM": "EAP-SIM",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_EAP-AKA": "EAP-AKA",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Provision PAC Anonymously": "Provision PAC Anonymously",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use PAC": "Use PAC",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Configuration of Protected Access Credential (PAC)": "Configuration of Protected Access Credential (PAC)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Accepted EAP Types": "Accepted EAP Types",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Provision PAC": "Provision PAC",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_EAP-FAST": "EAP-FAST",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TLS": "TLS",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate Common Name": "Certificate Common Name",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Directory (OS X only)": "Directory (OS X only)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow trust decisions (via dialog) to be made by the user": "Allow trust decisions (via dialog) to be made by the user",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_CryptoCard (OS X only)": "CryptoCard (OS X only)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate (OS X only)": "Certificate (OS X only)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Kerberos (OS X only)": "Kerberos (OS X only)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Portable": "Portable",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allowances": "Allowances",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow URLs:": "Allow URLs:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Power Adapter": "Power Adapter",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Content Filtering": "Content Filtering",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Preferences": "Preferences",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Battery": "Battery",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Battery Menu": "Battery Menu",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Media": "Media",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Curfews": "Curfews",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Desktop": "Desktop",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Time Limits": "Time Limits",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Schedule": "Schedule",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can always access sites at these URLs": "The user can always access sites at these URLs",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Deny URLs:": "Deny URLs:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Functionality": "Functionality",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow only these URLs:": "Allow only these URLs:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Media Content": "Media Content",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can never access sites at these URLs": "The user can never access sites at these URLs",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user can only access sites at these URLs": "The user can only access sites at these URLs",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Parental Controls": "Parental Controls",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Software Update": "Software Update",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Universal Access": "Accessibility",

  "_generic_string_Accessibility": "Accessibility",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Keyboard": "Keyboard",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sound": "Sound",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Mouse": "Mouse",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Displays": "Displays",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_FibreChannel": "FibreChannel",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sharing": "Sharing",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Startup Disk": "Startup Disk",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Dock": "Dock",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Speech": "Dictation & Speech",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Energy Saver": "Energy Saver",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Profiles": "Profiles",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Internet Accounts": "Internet Accounts",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Desktop & Screen Saver": "Desktop & Screen Saver",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Accounts": "Accounts",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Notifications": "Notifications",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Print & Scan": "Print & Scan",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ink": "Ink",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Trackpad": "Trackpad",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Localization": "Localization",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Xsan": "Xsan",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_CDs & DVDs": "CDs & DVDs",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Security": "Security",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Time Machine": "Time Machine",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Date & Time": "Date & Time",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MobileMe": "MobileMe",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Expose": "Expose",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Appearance": "Appearance",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Bluetooth": "Bluetooth",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add in Certificate payload": "Add in Certificate payload",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Match Domain or Host": "Match Domain or Host",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_On Demand Action": "On Demand Action",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Not Configured": "Not Configured",

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
  "_generic_string_Label": "Label",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Choose...": "Choose…",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Displays the web clip as a full screen application": "Displays the web clip as a full screen app",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable removal of the Web Clip": "Enable removal of the Web Clip",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The icon will be displayed with no added visual effects": "The icon will be displayed with no added visual effects",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Image was too large, returned empty string": "Image was too large, returned empty string",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The URL to be displayed when opening the Web Clip": "The URL to be displayed when opening the Web Clip",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Full Screen  (iOS only)": "Full Screen  (iOS only)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Removable  (iOS only)": "Removable  (iOS only)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The name to display for the Web Clip": "The name to display for the Web Clip",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Precomposed Icon  (iOS only)": "Precomposed Icon  (iOS only)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The icon to use for the Web Clip": "The icon to use for the Web Clip",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_ou=MyDepartment, o=My Company": "ou=MyDepartment, o=My Company",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Exchange ActiveSync (iOS only)": "Exchange ActiveSync (iOS only)",
  "_generic_string_Exchange ActiveSync": "Exchange ActiveSync",
  /* This is a generic string used one or more times in the app. */
  "_generic_string_Exchange Web Services (OS X only)": "Exchange Web Services (OS X only)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My Search": "My Search",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow use of iTunes Store": "Allow use of iTunes Store",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow use of Safari": "Allow use of Safari",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow installing apps": "Allow installing apps",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow removing apps": "Allow removing apps (Supervised devices only)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Touch ID to unlock device": "Allow Touch ID to unlock device",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sets the region for the ratings": "Sets the region for the ratings",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_DNS Name": "DNS Name",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow use of YouTube": "Allow use of YouTube",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_R": "R",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_P": "P",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_An NT principal name for use in the certificate request": "An NT principal name for use in the certificate request",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_NT Principal Name": "NT Principal Name",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allowed content ratings": "Allowed content ratings",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_G": "G",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_C": "C",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow in App Purchase": "Allow in App Purchase",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_RFC 822 Name": "RFC 822 Name",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The value of a subject alternative name": "The value of a subject alternative name",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_M": "M",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sets the maximum allowed ratings": "Sets the maximum allowed ratings",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable JavaScript": "Enable JavaScript",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Block pop-ups": "Block pop-ups",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow automatic sync while roaming": "Allow automatic sync while roaming",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_TV Shows:": "TV Shows:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Uniform Resource Identifier": "Uniform Resource Identifier",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Subject Alternative Name Value": "Subject Alternative Name Value",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow voice dialing": "Allow voice dialing",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Accept Cookies": "Accept Cookies",

  "_generic_string_Autonomous Single App Mode (Supervised Only)": "Autonomous Single App Mode (Supervised Only)",
  "_generic_string_Allow these apps to enter Single App Mode": "Allow these apps to enter Single App Mode",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Movies:": "Movies:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_U": "U",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow screen capture": "Allow screenshots",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Force fraud warning": "Force fraud warning",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Apps:": "Apps:",
  "_generic_string_Apps": "Apps",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The type of a subject alternative name": "The type of a subject alternative name",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable autofill": "Enable autofill",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Force encrypted backups": "Force encrypted backups",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Subject Alternative Name Type": "Subject Alternative Name Type",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow use of camera": "Allow use of camera",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ratings region": "Ratings region",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow explicit music, podcasts, and iTunes U": "Allow explicit music, podcasts and iTunes U",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Path of item": "Path of item",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Settings for Dock behavior and appearance": "Settings for Dock behavior and appearance",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Automatically hide and show the Dock": "Automatically hide and show the Dock",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Right": "Right",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add other folders:": "Add other folders:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Network Home": "Network Home",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Display Settings": "Display Settings",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show indicator lights for open applications": "Show indicator lights for open apps",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My Applications": "My Apps",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Animate opening applications": "Animate opening apps",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Bottom": "Bottom",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Scale Effect": "Scale Effect",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Large": "Large",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Merge with User's Dock": "Merge with User's Dock",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Minimize using:": "Minimize using:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Small": "Small",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Documents": "Documents",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Minimize window into application icon": "Minimize window into app icon",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Position:": "Position:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Dock Size:": "Dock Size:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Magnification:": "Magnification:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Genie Effect": "Genie Effect",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Max": "Max",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Min": "Min",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Left": "Left",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Item": "Item",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The applications that will launch at login": "The apps that will launch at login",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hide": "Hide",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authenticate selected share point with user's login name and password": "Authenticate selected share point with user's login name and password",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User may press Shift to keep items from opening": "User may press Shift to keep items from opening",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The network volumes that will be mounted at login": "The network volumes that will be mounted at login",
  "_generic_string_The network volumes that will be mounted using user's login name and password for authentication": "The network mounts authenticated using user's login name and password",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Items": "Items",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User may add and remove additional items": "User may add and remove additional items",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authenticated Network Mounts": "Authenticated Network Mounts",
  "_generic_string_Network Mounts": "Network Mounts",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add network home share point": "Add network home share point",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The files and folders that will open at login": "The files and folders that will open at login",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add a network accessible volume to mount at login.": "Add a network accessible volume to mount at login.",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hours": "Hours",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require computer master password": "Require computer master password",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_in background": "in background",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Manually": "Manually",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show status in menu bar": "Show status in menu bar",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Full Path": "Full Path",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_at login": "at login",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Days": "Days",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Setting this value to 0 causes the mobile account to be deleted as soon as possible.": "Setting this value to 0 causes the mobile account to be deleted as soon as possible.",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Encrypt contents with FileVault": "Encrypt contents with FileVault",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_RegEx Name": "RegEx Name",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Partial Path": "Partial Path",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_MB": "MB",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Restrict size:": "Restrict size:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Home folder location:": "Home folder location:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Starts With": "Starts With",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Create home using:": "Create home using:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Delete mobile accounts:": "Delete mobile accounts:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_at logout": "at logout",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Create mobile account when user logs in to network account": "Create mobile account when user logs in to network account",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ends With": "Ends With",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_network home and default sync settings": "network home and default sync settings",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use computer master password, if available": "Use computer master password, if available",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Every": "Every",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sync:": "Sync:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_minutes": "minutes",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_to percentage of network home quota:": "to percentage of network home quota:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Delete only after successful sync": "Delete only after successful sync",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show \"Don't ask me again\" checkbox": "Show \"Don't ask me again\" checkbox",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Weeks": "Weeks",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_local home template": "local home template",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sync in the background:": "Sync in the background:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name Is": "Name Is",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_after user's last login": "after user's last login",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_manually": "manually",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_at path:": "at path:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_RegEx Path": "RegEx Path",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%": "%",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_to fixed size:": "to fixed size:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Merge with user's settings": "Merge with user's settings",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_on startup volume": "on startup volume",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name Contains": "Name Contains",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require confirmation before creating mobile account": "Require confirmation before creating mobile account",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_New directory path": "New directory path",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Font Name:": "Font Name:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require an administrator password": "Require an administrator password",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Font Size:": "Font Size:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Default Printer:": "Default Printer:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Checked printers require an administrator password": "Checked printers require an administrator password",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Include MAC address": "Include MAC address",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow user to modify printer list": "Allow user to modify printer list",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow printers that connect directly to user's computer": "Allow printers that connect directly to user's computer",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Print page footer (user name and date)": "Print page footer (user name and date)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Times": "Times",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Settings for the optional footer applied to pages": "Settings for the optional footer applied to pages",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Lucida Grande": "Lucida Grande",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Helvetica": "Helvetica",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Only show managed printers": "Only show managed printers",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Courier": "Courier",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Footer Settings": "Footer Settings",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_AirDrop:": "AirDrop:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Recordable Discs:": "Recordable Discs:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_DVD-RAM:": "DVD-RAM:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Directory Path": "Directory Path",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access settings for network media": "Access settings for network media",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow only the following Dashboard widgets to run": "Allow only the following Dashboard widgets to run",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Eject at logout": "Eject at logout",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable All": "Enable All",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access settings for hard disk media": "Access settings for hard disk media",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Network Access": "Network Access",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_DVDs:": "DVDs:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require Authentication": "Require Authentication",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The selected items are enabled in System Preferences": "The selected items are enabled in System Preferences",

  "_generic_string_System Preference Panes": "System Preference Panes",

  "_generic_string_Third-party Preference Panes": "Third-party Preference Panes",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable None": "Enable None",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_CDs & CD-ROMs:": "CDs & CD-ROMs:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Read-Only": "Read-Only",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Restrict items in system preferences": "Restrict items in System Preferences",
  "_generic_string_enable selected items": "enable selected items",
  "_generic_string_disable selected items": "disable selected items",
  "_generic_string_Select None": "Select None",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Require admin password to install or update apps": "Require admin password to install or update apps",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Restrict which applications are allowed to launch": "Restrict which apps are allowed to launch",

  "_generic_string_Restrict App Store to software updates only": "Restrict App Store to software updates only",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Disc Media Access": "Disc Media Access",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Access settings for removable disc media": "Access settings for removable disc media",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hard Disk Media Access": "Hard Disk Media Access",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Internal Disks:": "Internal Disks:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Eject all removable media at logout": "Eject all removable media at logout",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_External Disks:": "External Disks:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_always": "always",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_establish": "establish",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_never": "never",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_default": "default",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Get Root Certificate": "Get Root Certificate",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prevent computer access during the specified days and hours.": "Prevent computer access during the specified days and hours.",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Friday and Saturday": "Friday and Saturday",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_From:": "From:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_allowing access to the following websites only": "allowing access to the following websites only",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Weekends": "Weekends",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Deny Access": "Deny Access",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_trying to limit access to adult websites": "trying to limit access to adult websites",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow computer access Monday through Friday for the specified number of hours only.": "Allow computer access Monday through Friday for the specified number of hours only.",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_30 min": "30 min",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Disk Images:": "Disk Images:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_AM": "AM",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_PM": "PM",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sunday through Thursday": "Sunday through Thursday",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Limit Access to websites by": "Limit Access to websites by",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_:": ":",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow computer access Saturday and Sunday for the specified number of hours only.": "Allow computer access Saturday and Sunday for the specified number of hours only.",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Weekdays": "Weekdays",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_8 hr": "8 hr",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Hide profanity in Dictionary": "Hide profanity in Dictionary and Dictation",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_to:": "to:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enforce Limits": "Enforce Limits",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Limit computer use to:": "Limit computer use to:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Download": "Download",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Please correct the error before continuing.": "Please correct the error before continuing.",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Please correct the errors before continuing.": "Please correct the errors before continuing.",

  /* Add an item */
  "_prefs_list_item_count": "(%@1 items)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Boolean": "Boolean",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Value": "Value",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Property List Values": "Property List Values",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Preference Domain": "Preference Domain",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Array": "Array",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Delete Item": "Delete Item",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Dictionary": "Dictionary",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_String": "String",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Data": "Data",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Date": "Date",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The name of a preference domain (com.company.application)": "The name of a preference domain (com.company.application)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Key": "Key",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Number": "Number",

  /* Add an item */
  "_prefs_button_title_Add Item": "Add Item",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Key value pairs for settings in the specified domain": "Key value pairs for settings in the specified domain",

  /* Add a child node */
  "_prefs_button_title_Add Child": "Add Child",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_New Item": "New Item",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No Data": "No Data",

  /*  */
  "_temporary_iphone_ipod_blocker_label": "Use Profile Manager on iPad or computer.",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Upload...": "Upload…",

  /* This is a generic string used one or more times in the app. */

  "_generic_string_Upload File": "Upload File…",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Go to My Devices": "Go to My Devices",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Configurations options for 802.1X network authentication": "Configurations options for 802.1X network authentication",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Network Security Settings": "Network Security Settings",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No applicable Certificate payload is configured": "No applicable Certificate payload is configured",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_hostname": "hostname",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No applicable Certificate or SCEP payload is configured": "No applicable Certificate or SCEP payload is configured",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authorization Password": "Authorization Password",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Brief explanation of the content or purpose of the profile": "Brief explanation of the content or purpose of the profile",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow sending diagnostic and usage data to Apple": "Allow sending diagnostic and usage data to Apple",

  /*  */
  "_privacy_knob_set_num_lines": "1",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Guest User": "Allow Guest User",

  "_generic_string_Screen Saver": "Screen Saver",
  "_generic_string_Idle time before screen saver starts": "Idle time before screen saver starts",

  "_screen_saver_Never": "Never",
  "_screen_saver_1 Minute": "1 Minute",
  "_screen_saver_2 Minutes": "2 Minutes",
  "_screen_saver_5 Minutes": "5 Minutes",
  "_screen_saver_10 Minutes": "10 Minutes",
  "_screen_saver_20 Minutes": "20 Minutes",
  "_screen_saver_30 Minutes": "30 Minutes",
  "_screen_saver_1 Hour": "1 Hour",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Start screen saver after:": "Start screen saver after:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Combine available workgroup settings": "Combine available workgroup settings",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Local-only users may log in": "Local-only users may log in",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable external accounts": "Enable external accounts",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Computer administrators may refresh or disable management": "Computer administrators may refresh or disable management",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No file uploaded": "No file uploaded",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_• Set EnableMCXLoginScripts to TRUE.": "• Set EnableMCXLoginScripts to TRUE.",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show \"Other…\"": "Show \"Other…\"",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Set computer name to computer record name": "Set computer name to computer record name",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_minutes of inactivity": "minutes of inactivity (minimum 3 minutes)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Logout Script:": "Logout Script:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Style:": "Style:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable >console login": "Enable >console login",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show computer's administrators": "Show computer's administrators",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Login Screen Preferences": "Login Screen Preferences",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The above settings require specific properties in the file ~root/Library/Preferences/com.apple.loginwindow.plist, located on the client computer:": "The above settings require specific properties in the file ~root/Library/Preferences/com.apple.loginwindow.plist, located on the client computer:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show password hint when needed and available": "Show password hint when needed and available",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Ignore workgroup nesting": "Ignore workgroup nesting",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Login Script:": "Login Script:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name": "Name",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_IP Address": "IP Address",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Settings for the behavior of the system while at the login screen": "Settings for the behavior of the system while at the login screen",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Local-only users use available workgroup settings": "Local-only users use available workgroup settings",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Time": "Time",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show mobile accounts": "Show mobile accounts",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Also execute the client computer's LoginHook script": "Also execute the client computer's LoginHook script",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable Fast User Switching": "Enable Fast User Switching",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Message:": "Message:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show network users": "Show network users",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_• Set MCXScriptTrust to match the binding settings used to connect the client computer to the directory domain.": "• Set MCXScriptTrust to match the binding settings used to connect the client computer to the directory domain.",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Log out users after:": "Log out users after:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Directory Status": "Directory Status",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use screen saver module at path:": "Use screen saver module at path:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show the Sleep, Restart and Shut Down buttons": "Show the Sleep, Restart and Shut Down buttons",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Always show workgroup dialog during login": "Always show workgroup dialog during login",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Show local users": "Show local users",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Heading:": "Heading:",

  "_generic_string_Show additional information in the menu bar": "Show additional information in the menu bar",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Name and password text fields": "Name and password text fields",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Disable automatic login": "Disable automatic login",
  "_generic_string_Banner": "Banner",
  "_generic_string_Show the host name, OS X version and IP address when the menu bar is clicked.": "Show the host name, OS X version and IP address when the menu bar is clicked.",
  "_generic_string_Login Prompt": "Login Prompt",
  "_generic_string_A message displayed above the login prompt.": "A message displayed above the login prompt.",
  "_generic_string_The display style and related options of the login prompt.": "The display style and related options of the login prompt.",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Version": "Version",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Also execute the client computer's LogoutHook script": "Also execute the client computer's LogoutHook script",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_List of users able to use these computers": "List of users able to use these computers",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Create a placeholder record for a device.": "Create a placeholder record for a device.",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%@1 minutes": "%@1 minutes",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 hour ": "1 hour ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%@1 hours": "%@1 hours ",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%@ hour and 30 minutes": "%@ hour and 30 minutes",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%@ hours": "%@ hours",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 hour and 30 minutes": "1 hour and 30 minutes",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_30 minutes": "30 minutes",

  /* This is the number of pixels the width of the "Log out users after:" string takes up in the UI. */
  "_log_out_users_after_text_width": "130",

  "_screen_saver_idle_time_popup_width": "100",

  /* This is the number of pixels the width of the "Start screen saver after:" string takes up in the UI. */
  "_start_screen_saver_after_text_width": "175",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_%@ certificate": "%@ certificate",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SSL and code signing certificates": "SSL and code signing certificates",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Code Signing": "Code Signing",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SSL": "SSL",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_By default, iOS and OS X devices do not trust this server's %@.": "By default, iOS and OS X devices do not trust this server's %@.",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Download Trust Profile": "Download Trust Profile",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No Certificate payload is configured": "No Certificate payload is configured",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The domain of the account": "The domain of the account",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user of the account": "The user of the account",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The domain of the account. Leave Domain and User blank to set user on device": "The domain of the account. Leave Domain and User blank to set user on device",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user of the account. Leave Domain and User blank to set user on device": "The user of the account. Leave Domain and User blank to set user on device",

  /*  */
  "_new_task_passcode_was_not_six_digit_number": "Passcode was not six digit number",

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
  "_generic_string_Download the Configuration Profile \"Trust Profile for %@\" and install it on your devices to configure them to trust this server's certificates": "Download the Configuration Profile \"Trust Profile for %@\" and install it on your devices to configure them to trust this server's certificates",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authenticate with credentials obtained from the target machine's record in the directory": "Authenticate with credentials obtained from the target machine's record in the directory",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use Directory Authentication": "Use Directory Authentication",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Authenticate with the target machine's directory credentials": "Authenticate with the target machine's directory credentials",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_set by directory": "set by directory",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Trust Profile for %@": "Trust Profile for %@",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Download the Configuration Profile \"Trust Profile for %@\" and install it on your devices to configure them to trust this server's certificates.": "Download the Configuration Profile \"Trust Profile for %@\" and install it on your devices to configure them to trust this server's certificates.",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Download and install the \"Trust Profile for %@\" configuration profile on iOS and OS X devices to configure them to trust this server's %@.": "Download and install the \"Trust Profile for %@\" configuration profile on iOS and OS X devices to configure them to trust this server's %@.",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_SSL certificate": "SSL certificate",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_code signing certificate": "code signing certificate",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Icon": "Icon",

  /* This is the width of the labels next to the buttons in iOS Restrictions > Media Control > for Movies, TV Shows, and Apps */
  "_layout_allowed_content_button_labels_width": "100",

  /* This is the combination of first/given name and last/family name. %@1 is first/given and %@2 is last/family. */
  "_user_first_name_last_name": "%@1 %@2",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Wake for Ethernet network administrator access": "Wake for Ethernet network administrator access",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Monday": "Monday",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sleep Options": "Sleep Options",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 min": "1 min",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_3 hr": "3 hr",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Put the computer to sleep after a period of inactivity": "Put the computer to sleep after a period of inactivity",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Start up automatically after a power failure": "Start up automatically after a power failure",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Saturday": "Saturday",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Friday": "Friday",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Put the hard disk(s) to sleep whenever possible": "Put the hard disk(s) to sleep whenever possible",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Every Day": "Every Day",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sunday": "Sunday",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Sleep": "Sleep",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_1 hr": "1 hr",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Put the display(s) to sleep after:": "Put the display(s) to sleep after:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Thursday": "Thursday",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_15 min": "15 min",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Other Options": "Other Options",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Shut Down": "Shut Down",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Wednesday": "Wednesday",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Settings for waking the computer from sleep": "Settings for waking the computer from sleep",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow power button to sleep the computer": "Allow power button to sleep the computer",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Additional power settings for the computer": "Additional power settings for the computer",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Put the computer to sleep after:": "Put the computer to sleep after:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Tuesday": "Tuesday",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Start up the computer:": "Start up the computer:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Wake Options": "Wake Options",

  /* This is the width of the Hide Columns for the Login Items payload type. */
  "_layout_hide_column_width": "40",

  /* This is the width of the two radio buttons under Settings > Mobility > Rules > Options > Sync in the backgound */
  "_layout_mobility_rules_options_sync_in_background_width": "170",
  "_mobility_path_at_textField_offset_left": "117",


  /* This is a generic string used one or more times in the app. */
  "_generic_string_All Users": "All Users",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Force FIPS verification": "Force FIPS verification",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_App Store": "App Store",
  "_generic_string_Allow iCloud documents & data": "Allow iCloud documents & data",
  "_generic_string_Allow iCloud keychain": "Allow iCloud keychain",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enterprise": "Enterprise",
  "_generic_string_Allow My Photo Stream (disallowing can cause data loss)": "Allow My Photo Stream (disallowing can cause data loss)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Application Library": "App Library",
  "_generic_string_Force iTunes password entry for every purchase": "Force iTunes password entry for every purchase",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add applications from the iTunes Store to your library": "Add apps from the iTunes Store to your library",
  "_generic_string_Allow iCloud backup": "Allow iCloud backup",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add enterprise applications to your library": "Add enterprise apps to your library",
  "_generic_string_Require iTunes password for all purchases": "Require iTunes password for all purchases",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Application Search": "App Search",
  "_generic_string_Allow third-party mail clients": "Allow third-party mail clients",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Find apps in the iTunes Store": "Find apps in the iTunes Store",
  "_generic_string_Configures proxy settings to be used with this network": "Configures proxy settings to be used with this network",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Search iTunes": "Search iTunes",
  "_generic_string_Auto Join": "Auto Join",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_iPad Apps": "iPad Apps",
  "_generic_string_required": "required",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_iPhone Apps": "iPhone Apps",
  "_generic_string_Allow user to move messages from this account": "Allow user to move messages from this account",

  /* More */
  "_general_string_More...": "More",
  /* This is a generic string used one or more times in the app. */
  "_generic_string_Automatically join this wireless network": "Automatically join this wireless network",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Upload": "Upload",
  "_generic_string_Messages can be moved out of this email account into another": "Messages can be moved out of this account into another",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Select an application to add to the library": "Select an app to add to the library",
  "_generic_string_Messages can be sent from this account using third-party mail clients": "Messages can be sent from this account using third-party mail clients",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Select...": "Select...",
  "_generic_string_Hostname or IP address for server": "Hostname or IP address for server",

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
  "_generic_string_Upload selected file": "Upload selected file",
  "_generic_string_Device Groups": "Device Groups",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Upload an application to add to the library": "Upload an app to add to the library",
  "_generic_string_Devices": "Devices",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Install Application": "Install App",
  "_generic_string_Users": "Users",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User Groups": "User Groups",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Add App": "Add App",
  "_generic_string_Printers": "Printers",

  /* This is the width of the Configure button for an unconfigured setting type for a profile. */
  "_layout_no_settings_configure_button": "90",

  /* This is the width of the Add Certificate button, as used in Certificate Settings and Exchange Settings. */
  "_layout_knob_set_view_add_certificate": "120",

  /* This is the width of the Add Item and Delete Item buttons in Settings > Custom Settings */
  "_layout_add_item_and_delete_item_buttons_width": "80",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Edit App List": "Edit App List",
  "_generic_string_at": "at",

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
  "_layout_to_percentage_of_network_home_quote_radio_width": "289",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Edit Apps": "Edit Apps",
  "_generic_string_Language & Text": "Language & Text",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Security & Privacy": "Security & Privacy",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Users & Groups": "Users & Groups",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Mail, Contacts & Calendars": "Mail, Contacts & Calendars",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_General": "General",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Mission Control": "Mission Control",

  /* The width of the Add All and Add Visible button that appears in the lower left corner of various picker sheets. */
  "_layout_add_all_and_add_visible_button_width": "100",

  /* The width of the Settings > Dock > Minimize using popup */
  "_layout_minimize_using_select_button_width": "140",

  /* If needed, this increases the width of most of the UI in settings. When increasing this, be careful it still fits on iPad. */
  "_layout_settings_overall_knob_width": "480",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow accepting untrusted TLS certificates": "Allow users to accept untrusted TLS certificates",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow automatic updates to certificate trust settings": "Allow automatic updates to certificate trust settings",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Remaining Battery Life": "Remaining Battery Life",
  "Supervised": "Supervised",

  "_generic_string_Signed in to iTunes": "Signed in to iTunes",

  "_generic_string_iCloud Backup": "iCloud Backup",

  "_generic_string_Do Not Disturb": "Do Not Disturb",

  "_generic_string_Personal Hotspot": "Personal Hotspot",
  "_generic_string_On": "On",
  "_generic_string_Off": "Off",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Send outgoing mail from this account only from Mail app": "Send outgoing mail from this account only from Mail app",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Use Only in Mail": "Use Only in Mail",
  "_generic_string_Enable S/MIME": "Enable S/MIME",
  "_generic_string_Support S/MIME for this account": "Support S/MIME for this account",
  "_generic_string_Signing Certificate": "Signing Certificate",
  "_generic_string_Certificate used to sign messages sent from this account": "Certificate used to sign messages sent from this account",
  "_generic_string_Encryption Certificate": "Encryption Certificate",
  "_generic_string_Certificate used to decrypt messages sent to this account": "Certificate used to decrypt messages sent to this account",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Supported": "Supported",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Software Build Version": "Software Build Version",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Unknown": "Unknown",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Supports Managed Apps": "Supports Managed Apps",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Not Supported": "Not Supported",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Requires Re-enrollment": "Requires Re-enrollment",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Requires iOS 5 or later": "Requires iOS 5 or later",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Upgrade to iOS 5 and re-enroll this device to enable enterprise application distribution": "Upgrade to iOS 5 and re-enroll this device to enable enterprise app distribution",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Re-enroll this device to enable enterprise application distribution": "Re-enroll this device to enable enterprise app distribution",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Siri": "Allow Siri",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Siri while device locked": "Allow Siri while device locked",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Enable Siri profanity filter (Supervised devices only)": "Enable Siri profanity filter (Supervised devices only)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_No Limit": "No Limit",

  /* This is the width of the Cancel Task button, found in the bottom toolbar when selecting an active task. */
  "_layout_cancel_task_button": "100",

  /* This is the width of the secondary information column for the task list item view */
  "_layout_task_list_item_view_secondary_information_width": "90",

  /* This is the width of the updated at timestamp column for the task list item view */
  "_layout_task_list_item_view_updated_at_width": "130",

  /* This is the width of the labels under Display Settings for Dock Settings. */
  "_layout_dock_knob_set_display_settings_label_widths": "110",

  /*  */
  "_no_item_view_no_somethings_widget": "No Widgets",

  "_no_item_view_no_somethings_members": "No Members",

  /*  */
  "_no_item_view_is_truncation_indicator_tasks_complete": "Use search to find Completed Tasks",

  /*  */
  "_no_item_view_no_somethings_found_tasks_complete": "No Completed Tasks Found",

  /*  */
  "_no_item_view_no_somethings_device": "No Devices",

  "_no_item_view_no_airplay_destinations": "No AirPlay Destinations",

  "_no_item_view_no_somethings_apps": "No Apps",
  "_no_item_view_no_somethings_inhouse_enterprise_apps": "No in-house enterprise apps",
  "_no_item_view_no_somethings_books": "No Books",
  "_no_item_view_no_somethings_activity": "No Activity",
  /*  */
  "_no_item_view_no_somethings_found_device_group": "No Device Groups Found",
  "_no_item_view_no_somethings_found_location": "No Locations Found",
  "_no_item_view_no_somethings_found_members": "No Members Found",
  /*  */
  "_no_item_view_no_somethings_system_application": "No Apps",

  /*  */
  "_item_list_loading_user_group": "Loading Groups…",
  "_item_list_loading_vpp_user_group": "Loading VPP Enabled Groups…",

  /*  */
  "_no_item_view_no_somethings_found_device": "No Devices Found",

  /*  */
  "_item_list_loading_widget": "Loading Widgets…",

  /*  */
  "_item_list_loading_printer": "Loading Printers…",

  "_item_list_loading_activity": "Loading Activity…",
  "_item_list_loading_members": "Loading Members…",
  "_item_list_loading_Apps": "Loading Apps…",
  "_item_list_loading_books": "Loading Books…",

  /*  */
  "_item_list_loading_device_group": "Loading Device Groups…",
  "_item_list_loading_location": "Loading Locations…",

  /*  */
  "_no_item_view_no_somethings_found_tasks_active": "No Active Tasks Found",

  /*  */
  "_no_item_view_no_somethings_printer": "No Printers",

  /*  */
  "_no_item_view_is_truncation_indicator_widget": "Use search to find Widgets",

  "_no_item_view_is_truncation_indicator_members": "Use search to find Members",
  /*  */
  "_no_item_view_is_truncation_indicator_printer": "Use search to find Printers",

  /*  */
  "_no_item_view_is_truncation_indicator_user_group": "Use Search to find Groups",
  "_no_item_view_is_truncation_indicator_vpp_user_group": "Use search to find VPP enabled groups",

  /*  */
  "_no_item_view_no_somethings_found_system_application": "No Apps Found",
  "_no_item_view_no_somethings_found_books": "No Books Found",

  "_no_item_view_no_somethings_found_apps": "No Apps Found",
  "_no_item_view_no_somethings_found_activity": "No Activity Found",

  /*  */
  "_no_item_view_no_somethings_user": "No Users",

  /*  */
  "_no_item_view_is_truncation_indicator_tasks_active": "Use search to find Active Tasks",

  /*  */
  "_no_item_view_is_truncation_indicator_device": "Use search to find Devices",

  /*  */
  "_item_list_loading_system_application": "Loading Apps…",

  /*  */
  "_no_item_view_is_truncation_indicator_user": "Use search to find Users",

  /*  */
  "_no_item_view_no_somethings_found_user": "No Users Found",

  /*  */
  "_no_item_view_is_truncation_indicator_system_application": "Use search to find Apps",

  "_no_item_view_is_truncation_indicator_apps": "Use search to find Apps",

  "_no_item_view_is_truncation_indicator_books": "Use search to find Books",

  "_no_item_view_is_truncation_indicator_activity": "Use search to find Activity",

  /*  */
  "_no_item_view_no_somethings_tasks_complete": "No Completed Tasks Found",

  /*  */
  "_no_item_view_no_somethings_found_user_group": "No Groups Found",
  "_no_item_view_no_somethings_found_vpp_user_group": "No VPP Enabled Groups Found",

  /*  */
  "_no_item_view_no_somethings_found_printer": "No Printers Found",

  /*  */
  "_item_list_loading_device": "Loading Devices…",

  /*  */
  "_no_item_view_no_somethings_user_group": "No Groups",
  "_no_item_view_no_somethings_vpp_user_group": "No VPP Enabled Groups",

  /*  */
  "_no_item_view_no_somethings_found_widget": "No Widgets Found",

  /*  */
  "_item_list_loading_tasks_active": "Loading Active Tasks…",

  /*  */
  "_no_item_view_is_truncation_indicator_device_group": "Use search to find Device Groups",
  "_no_item_view_is_truncation_indicator_location": "Use search to find Locations",

  /*  */
  "_item_list_loading_user": "Loading Users…",

  /*  */
  "_no_item_view_no_somethings_tasks_active": "No Active Tasks",

  /*  */
  "_item_list_loading_tasks_complete": "Loading Completed Tasks…",

  /*  */
  "_no_item_view_no_somethings_device_group": "No Device Groups",
  "_no_item_view_no_somethings_location": "No Locations",

  /*  */
  "_uploading_filename": "Uploading %@1…",

  /* This is the width of the Upload button inside the iOS App picker. */
  "_layout_apps_picker_upload_button_width": "100",

  /* This is the width of the menu that appears when you click the Perform Task Button in the bottom toolbar for Library Items. */
  "_layout_toolbar_perform_task_button_menu_width": "175",
  "_layout_toolbar_perform_task_button_menu_width_for_placeholder": "170",
  /* Width of the new task sheet*/
  "_layout_new_task_sheet_width": "350",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_user chooses any volume": "user chooses any volume",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_user chooses any external volume": "user chooses any external volume",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_user chooses any internal volume": "user chooses any internal volume",

  /* This is the width of the menu itmes for the iOS Restrictions' Media Content Allowed content ratings popup menus */
  "_layout_allowed_content_popup_menu_items_width": "195",

  /*  */
  "_cfprefs_knob_set_num_lines": "2",

  /*  */
  "_identification_knob_set_name": "Identification",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Spotlight": "Spotlight",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_iCloud": "iCloud",

  /*  */
  "_identification_knob_set_num_lines": "1",

  /*  */
  "_identification_knob_set_description": "",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user enters the password upon profile installation": "The user enters the password upon profile installation",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user display name for the accounts": "The user display name for the accounts",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt text for any of the above values": "Prompt text for any of the above values",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt Message": "Prompt Message",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The user name for the accounts": "The user name for the accounts",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_User Enters Password": "User Enters Password",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The email address for the accounts": "The email address for the accounts",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt": "Prompt",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password for the accounts": "The password for the accounts",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Additional descriptive text for the Prompt field": "Additional descriptive text for the Prompt field",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Set in Identification": "Set in Identification",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Anywhere": "Anywhere",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Do not allow user to override Gatekeeper setting": "Do not allow user to override Gatekeeper setting",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allowed Applications": "Allowed Apps",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Mac App Store": "Mac App Store",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate Server": "Certificate Server",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The name of the CA": "The name of the CA",

  /*  */
  "_gatekeeper_knob_set_num_lines": "1",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prevents the user from temporarily overriding the Gatekeeper setting by control-clicking to install any app": "Prevents the user from temporarily overriding the Gatekeeper setting by control-clicking to install any app",
  "_generic_string_Allow user to change password": "Allow user to change password",
  "_generic_string_Require password after sleep or screen saver begins": "Require password after sleep or screen saver begins",
  "_generic_string_Allow user to set lock message": "Allow user to set lock message",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Mac App Store and identified developers": "Mac App Store and identified developers",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The username with which to authenticate to the certificate server": "The username with which to authenticate to the certificate server",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt for credentials": "Prompt for credentials",

  /*  */
  "_gatekeeper_knob_set_description": "",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Prompt the user for credentials.  This setting is not supported for pushed profiles": "Prompt the user for credentials.  This setting is not supported for pushed profiles",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Gatekeeper": "Gatekeeper",
  "_generic_string_General (OS X Only)": "General (OS X Only)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The password with which to authenticate to the certificate server": "The password with which to authenticate to the certificate server",

  /*  */
  "_gatekeeper_knob_set_name": "",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The description of the certificate request as shown in the certificate selector of other payloads such as VPN and Network": "The description of the certificate request as shown in the certificate selector of other payloads such as VPN and Network",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow applications downloaded from:": "Allow apps downloaded from:",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Users cannot open an unsigned application ...": "Users cannot open an unsigned app ...",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate Authority": "Certificate Authority",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Certificate Template": "Certificate Template",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The name of the certificate template, usually Machine or User": "The name of the certificate template, usually Machine or User",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_The network address of the certificate server": "The network address of the certificate server",

  /* This layout gives the height of the Disable ability to open disallowed applications using the Finder checkbox */
  "_layout_privacy_force_disallow_app_checkbox_height": "20",

  /* This layout gives the height of the Disable ability to open disallowed applications using the Finder checkbox description*/
  "_layout_privacy_force_disallow_app_description_height": "40",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_My Messages Account": "My Messages Account",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow iBooks Store (Supervised devices only)": "Allow iBooks Store (Supervised devices only)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow explicit sexual content in iBooks Store": "Allow explicit sexual content in iBooks Store",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow iCloud photo sharing": "Allow iCloud photo sharing",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Shared PhotoStream Send Invitation": "Allow Sending Shared Photo Streams Invitations",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Shared PhotoStream Receive Invitation": "Allow Receiving Shared Photo Streams Invitations",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow Passbook while device locked": "Allow Passbook notifications in Lock screen",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow installing configuration profiles (Supervised devices only)": "Allow installing configuration profiles (Supervised devices only)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Allow use of Messages": "Allow iMessage (Supervised devices only)",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Consent": "Consent",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_Consent Text Description": "Consent Text Description",

  /* This is a generic string used one or more times in the app. */
  "_general_string_Lock To App": "Lock To App",

  /* This is a generic string used one or more times in the app. */
  "_general_string_Limit an iOS device to one app": "Limit an iOS device to one app (Supervised devices only)",

  /* System Application Names */
  "_general_string_app_name_Safari": "Safari",
  "_general_string_app_name_Videos": "Videos",
  "_general_string_app_name_Calendar": "Calendar",
  "_general_string_app_name_Music": "Music",
  "_general_string_app_name_Contacts": "Contacts",
  "_general_string_app_name_Messages": "Messages",
  "_general_string_app_name_Maps": "Maps",
  "_general_string_app_name_Reminders": "Reminders",
  "_general_string_app_name_Photos": "Photos",
  "_general_string_app_name_Mail": "Mail",
  "_general_string_app_name_Notes": "Notes",

  "_generic_string_Touch": "Touch",
  "_generic_string_Device Rotation": "Motion",
  "_generic_string_Volume Buttons": "Volume Buttons",
  "_generic_string_Ringer Switch": "Side Switch",
  "_generic_string_Sleep/Wake Button": "Sleep/Wake Button",
  "_generic_string_Auto-Lock": "Auto-Lock",
  "_generic_string_VoiceOver": "VoiceOver",
  "_generic_string_Zoom": "Zoom",
  "_generic_string_Invert Colors": "Invert Colors",
  "_generic_string_AssistiveTouch": "AssistiveTouch",
  "_generic_string_Speak Selection": "Speak Selection",
  "_generic_string_Mono Audio": "Mono Audio",

  "_generic_string_Settings enforced when in Single App Mode": "Settings enforced when in Single App Mode",
  "_generic_string_Allow the user to change these settings when in Single App Mode": "Allow the user to change these settings when in Single App Mode",
  "_general_string_The app to run in Single App Mode (Supervised devices only)": "The app to run in Single App Mode (Supervised devices only)",
  /* This is a generic string used one or more times in the app. */
  "_general_string_Settings for automatic profile removal": "Settings for automatic profile removal",

  /* This is a generic string used one or more times in the app. */
  "_general_string_On date": "On date",

  /* This is a generic string used one or more times in the app. */
  "_general_string_After interval": "After interval",

  /* used in mail and exchange knob sets */
  "_generic_string_Allow recent addresses to be synced": "Allow recent addresses to be synced",
  "_generic_string_Include this account in recent address syncing": "Include this account in recent address syncing",

  /* Date display format for each locale */
  "_generic_date_format": "%m/%d/%Y",


  /* This is a generic string used one or more times in the app. */
  "_generic_string_Delete Application Confirmation": "Delete  App?",
  "_generic_string_Delete Apps Confirmation": "Delete  Apps?",

  /* This is a generic string used one or more times in the app. */
  "_generic_string_This application will be removed from all devices.": "The app will be removed from all devices.",
  "_generic_string_The apps will be removed from all devices.": "The apps will be removed from all devices.",

  /* Time machine strings */
  "_global_time_machine_knob_set_name": "Time Machine",
  "_global_time_machine_knob_set_description": "Use this section to configure settings for Time Machine.",
  "_generic_string_Backup destination URL": "Backup Server",
  "_generic_string_The URL to backup destination (e.g., afp://server.example.com/)": "URL of the backup destination (e.g., afp://server.example.com/backups/)",
  "_generic_string_Backup all volumes": "Backup all volumes",
  "_generic_string_Only startup volume is backed up by default": "Only startup volume is backed up by default",
  "_generic_string_Backup system files and folders": "Backup system files and folders",
  "_generic_string_System files and folders are skipped by default": "System files and folders are skipped by default",
  "_generic_string_Automatic backups": "Enable automatic backups",
  "_generic_string_Enable automatic backups": "Automatically backup at regular intervals",
  "_generic_string_Mobile backups": "Enable local snaphots (10.8 and above only)",
  "_generic_string_Enable local snapshots (10.8 and above only)": "Creates local backup snapshots when not connected to network",
  "_generic_string_BackupSize Limit": "Backup size Limit",
  "_generic_string_BackupSize limit in MB. Set to 0 for unlimited": "Backup size limit in MB. Set to 0 for unlimited",
  "_generic_string_Paths to backup:": "Paths to backup:",
  "_generic_string_The startup volume is always backed up": "The startup volume is always backed up",
  "_generic_string_Paths to skip:": "Paths to skip:",
  "_generic_string_The paths to skip from startup volume": "The paths to skip from startup volume",

  /* Dictation restriction */
  "_generic_string_Disable use of Dictation": "Disable use of Dictation",

  /* Security and Privacy */
  "_generic_string_FileVault (OS X Only)": "FileVault (OS X Only)",
  "_generic_string_Privacy": "Privacy",
  "_generic_string_Require FileVault": "Require FileVault",
  "_generic_string_If not already enabled, FileVault will be enabled at the next logout": "If not already enabled, FileVault will be enabled at the next logout",
  "_generic_string_Defer FileVault setup": "Defer FileVault setup",
  "_generic_string_Defers FileVault setup until the current user logs out": "Defers FileVault setup until the current user logs out",
  "_generic_string_Create recovery key": "Create personal recovery key",
  "_generic_string_Create a personal FileVault recovery key": "Create a personal FileVault recovery key",
  "_generic_string_Recovery key location": "Personal recovery key location",
  "_generic_string_Location to store the recovery key": "Location to store the personal recovery key",
  "_generic_string_Create institutional recovery user": "Use an institutional recovery key",
  "_generic_string_Create a personal FileVault recovery key and use an institutional recovery key": "Use an institutional recovery key and create a personal FileVault recovery key",
  "_generic_string_Creates a institutional recovery user using the FileVault Master keychain": "Enables access to the encrypted disc using the institutional keychain",
  "_generic_string_FileVault username": "Designated FileVault username",
  "_generic_string_FileVault enabled user, current logged in user is used by default": "FileVault enabled user, current logged in user is used by default",
  "_generic_string_FileVault user password": "Designated FileVault user password",
  "_generic_string_Password for the FileVault enabled user": "Password for the FileVault enabled user",
  "_generic_string_Certificate that contains the public key from institutional recovery keychain": "Certificate that contains the public key from institutional recovery keychain",
  "_generic_string_Require user to unlock FileVault after hibernation": "Require user to unlock FileVault after hibernation",
  "_generic_string_The user will be required to unlock FileVault when the computer awakes from hibernation": "The user will be required to unlock FileVault when the computer awakes from hibernation",
  "_generic_string_Allow user to disable FileVault": "Allow user to disable FileVault",

  /* Checkpoint VPN */
  "_generic_string_Check Point Mobile VPN": "Check Point Mobile VPN",

  /* Single App Mode */
  "_generic_string_Single App Mode": "Single App Mode",

  /* Finder Knob set */
  "_global_finder_knob_set_name": "Finder",
  "_global_finder_knob_set_description": "Use this section to configure settings for Finder.",
  "_generic_string_Commands": "Commands",
  "_generic_string_Select commands available to users": "Select commands available to users",
  "_generic_string_Opens a dialog box for finding servers on the network": "Opens a dialog box for finding servers on the network",
  "_generic_string_Connect to Server": "Connect to Server",
  "_generic_string_Eject": "Eject",
  "_generic_string_Ejects removable media and mountable volumes": "Ejects removable media and mountable volumes",
  "_generic_string_Burn Disc": "Burn Disc",
  "_generic_string_Writes permanent information to a CD or DVD": "Writes permanent information to a CD or DVD",
  "_generic_string_Go to Folder": "Go to Folder",
  "_generic_string_Allows user to open files or folders by typing a pathname": "Allows user to open files or folders by typing a pathname",
  "_generic_string_Restart": "Restart",
  "_generic_string_Makes the restart command appear in the Apple menu": "Makes the restart command appear in the Apple menu",
  "_generic_string_Makes the shut down command appear in the Apple menu": "Makes the shut down command appear in the Apple menu",
  "_generic_string_Show these items on the desktop": "Show these items on the desktop",
  "_generic_string_Hard disks": "Hard disks",
  "_generic_string_External disks": "External disks",
  "_generic_string_CDs, DVDs and iPods": "CDs, DVDs and iPods",
  "_generic_string_Connected servers": "Connected servers",
  "_generic_string_Use regular Finder": "Use regular Finder",
  "_generic_string_Use simple Finder": "Use simple Finder",
  "_generic_string_Show warning before emptying the Trash": "Show warning before emptying the Trash",

  /* Security Info FileVault Reporting */
  "_generic_string_Yes": "Yes",
  "_generic_string_No": "No",
  "_generic_string_FileVault Enabled": "FileVault Enabled",
  "_generic_string_FileVault has personal key": "Personal Recovery Key",
  "_generic_string_FileVault has institutional key": "Institutional Recovery Key",
  "_filevault_status_Recovery Key Set": "Set",
  "_filevault_status_Recovery Key Not Set": "Not Set",
  "_generic_string_Activation Lock Enabled": "Activation Lock Enabled",
  "_generic_string_Activation Lock Bypass Code": "Activation Lock Bypass Code",
  "_no_activation_lock_bypass_code": "None",

  /* Sharing Services */
  "_restrictions_tab_header_Sharing": "Sharing",
  "_generic_string_Select services that should be available in the share menu": "Select services that should be available in the share menu",
  "_generic_string_AirDrop": "AirDrop",
  "_generic_string_Facebook": "Facebook",
  "_generic_string_Twitter": "Twitter",
  "_general_string_chinese_blog_name_SinaWeibo": "Sina Weibo",
  "_generic_string_Enable New Share Services": "Automatically enable new sharing services",
  "_general_string_Video Services - Flickr, Vimeo, Tudou and Youku": "Video Services - Flickr, Vimeo, Tudou and Youku",
  "_generic_string_New share services will be enabled in the share menu automatically": "New sharing services will be enabled in the share menu automatically",
  "_general_string_Add to iPhoto": "Add to iPhoto",
  "_general_string_Add to Aperture": "Add to Aperture",
  "_general_string_Add to Reading List": "Add to Reading List",

  "_restrictions_tab_header_Desktop": "Desktop",
  "_generic_string_Lock Desktop Picture": "Lock desktop picture",
  "_lock_desktop_picture_description": "Prevents user from modifying the desktop picture selection",
  "_generic_string_Picture Path": "Desktop picture path",
  "_lock_desktop_picture_path_description": "The path of the file to use as the desktop picture. Leave path blank to use the current selection on device",
  "_mac_restrictions_segment_view_width": "490",

  /* Universal Access */
  "_global_universal_access_knob_set_name": "Accessibility",
  "_global_universal_access_knob_set_description": "Use this section to configure Accessibility settings.",
  "_generic_string_Seeing": "Seeing",
  "_generic_string_Hearing": "Hearing",
  "_accessibility_seeing_tab_width": "480",
  "_accessibility_interactivity_tab_width": "480",
  "_accessibility_interactivity_tab_label_width": "180",
  "_generic_string_Interacting": "Interacting",
  "_generic_string_Enable Zoom via ScrollWheel:": "Enable Zoom via ScrollWheel:",
  "_generic_string_Zoom Options": "Zoom Options",
  "_generic_string_Enable Zoom via Keyboard:": "Enable Zoom via Keyboard:",
  "_generic_string_Minimum Zoom:": "Minimum Zoom:",
  "_generic_string_Maximum Zoom:": "Maximum Zoom:",
  "_generic_string_Show preview rectangle when zoomed out:": "Show preview rectangle when zoomed out:",
  "_generic_string_Smooth images:": "Smooth images:",
  "_generic_string_Display Options": "Display Options",
  "_generic_string_Invert colors:": "Invert colors:",
  "_generic_string_Use grayscale:": "Use grayscale:",
  "_generic_string_Enhance Contrast:": "Enhance Contrast:",
  "_generic_string_Cursor size:": "Cursor size:",
  "_generic_string_VoiceOver Options": "VoiceOver Options",
  "_generic_string_Enable VoiceOver:": "Enable VoiceOver:",
  "_generic_string_Flash the screen when an alert occurs": "Flash the screen when an alert occurs",
  "_generic_string_Play stereo audio as mono": "Play stereo audio as mono",
  "_generic_string_Enable Sticky Keys": "Enable Sticky Keys",
  "_generic_string_Display pressed keys on screen": "Display pressed keys on screen",
  "_generic_string_Beep when a modifier key is set": "Beep when a modifier key is set",
  "_generic_string_Acceptance delay": "Acceptance delay:",
  "_generic_string_Use click key sounds": "Use click key sounds:",
  "_generic_string_Enable Slow Keys": "Enable Slow Keys",
  "_generic_string_Enable Mouse Keys": "Enable Mouse Keys",
  "_generic_string_Initial delay:": "Initial delay:",
  "_generic_string_Maximum speed": "Maximum speed:",
  "_generic_string_Ignore built-in trackpad:": "Ignore built-in trackpad:",
  "_generic_string_short": "short",
  "_generic_string_Long": "long",
  "_generic_string_fast": "fast",
  "_generic_string_slow": "slow",
  "_generic_string_time_milliseconds": "milliseconds",

  /* Game Center Stuff */
  "_generic_string_Allow GameCenter": "Allow use of Game Center (Supervised devices only)",
  "_generic_string_Allow Game Center": "Allow use of Game Center",
  "_generic_string_Allow Game Center account modification": "Allow Game Center account modification",
  "_generic_string_Allow adding Game Center friends": "Allow adding Game Center friends",
  "_generic_string_Allow App Store app adoption": "Allow App Store app adoption",
  "_generic_string_Allow Multiplayer Gaming": "Allow Multiplayer Gaming",
  "_generic_string_Allow multiplayer gaming": "Allow multiplayer gaming",

  /* Content Library Sidebar Item */
  "_content_sidebar_item_display_name": "Content",
  "_generic_string_Get More Apps": "Get More Apps",
  "_vpp_get_more_apps_button_width": "125",
  "_generic_string_Get More Books": "Get More Books",
  "_vpp_get_more_books_button_width": "130",
  "_vpp_portal_url": "https://vpp.itunes.apple.com/?l=en",

  /* Application Filter Strings*/
  "_application_filter_type_string_All Kinds": "All Kinds",
  "_application_filter_type_string_iPad": "iPad",
  "_application_filter_type_string_iPhone+iPad": "iPhone+iPad",
  "_application_filter_type_string_iPod+iPhone+iPad": "iPod+iPhone+iPad",
  "_application_filter_type_string_iPhone": "iPhone",
  "_application_filter_type_string_iPod+iPhone": "iPod+iPhone",
  "_application_filter_type_string_Mac": "Mac",
  "_application_filter_type_string_OSX": "OS X",
  "_application_filter_type_string_iOS": "iOS",
  "_application_filter_license_type_Enterprise": "Enterprise",
  "_application_filter_license_type_App Store": "App Store",
  "_application_filter_category_All Categories": "All Categories",
  "_search_hint_Search Apps": "Search Apps",
  "_search_hint_Search Books": "Search Books",

  /* Unified Applications Table View */
  "_table_header_Name": "Name",
  "_table_header_Category": "Category",
  "_table_header_Size": "Size",
  "_table_header_Purchased": "Purchased",
  "_table_header_Assigned": "Assigned",
  "_table_header_UnFulfilled": "UnFulfilled",
  "_table_header_Members": "Members",
  "_table_header_Available": "Available",
  "_table_header_Kind": "Kind",
  "_table_header_Assigned To": "Assigned To",
  "_table_header_Device Name": "Device Name",
  "_table_header_Password": "Password",
  "_table_header_Include Password": "Include Password",

  "_table_header_Settings": "Settings",
  "_table_header_App": "App",
  "_table_header_User": "User",
  "_table_header_Target": "Target",
  "_table_header_Status": "Status",
  "_table_header_Last Updated": "Last Updated",

  "_generic_string_size_KB": "%@1 KB",
  "_generic_string_size_MB": "%@1 MB",
  "_generic_string_size_GB": "%@1 GB",
  "_generic_string_app_count_and_size_fmt_KB": "%@1 Apps, %@2 KB",
  "_generic_string_app_count_and_size_fmt_MB": "%@1 Apps, %@2 MB",
  "_generic_string_app_count_and_size_fmt_GB": "%@1 Apps, %@2 GB",
  "_application_filter_type_string_iPhone,iPad,iPod": "iPod, iPhone, iPad",
  "_application_filter_type_string_iPhone,iPad": "iPhone, iPad",
  "_application_filter_type_string_iPhone,iPod": "iPod, iPhone",
  "_application_type_OSX": "OS X",
  "_application_type_iOS": "iOS",

  /* Genesis Views */
  "_generic_string_Add Enterprise App": "Add Enterprise App",
  "_generic_string_Volume Purchase": "Volume Purchase Program",
  "_generic_string_Choose apps from your library": "Choose apps from your library",
  "_generic_string_Choose in-house enterprise apps from your library": "Choose in-house enterprise apps from your library",
  "_generic_string_Choose books from your library": "Choose books from your library",
  "_assign_unified_apps_description": "You can assign apps that have been purchased using the Volume Purchase Program or in-house enterprise apps added to Profile Manager.",
  "_assign_inhouse_enterprise_apps_description": "You can assign in-house enterprise apps added to Profile Manager",
  "_assign_books_description": "You can assign books that have been purchased using the Volume Purchase Program.",
  "_generic_string_Purchased": "Purchased",
  "_generic_string_Available_Licenses": "Available",
  "_generic_string_Assignment": "Assignment",
  "_generic_string_Groups": "Groups",
  "_generic_string_profile_manager_apps_feature_description": "Profile Manager makes it easy to assign and distribute apps purchased through the Volume Purchase Program to users and groups. You can also distribute apps developed using the iOS Developer Enterprise Program to enrolled devices.",
  "_generic_string_profile_manager_apps_feature_description_no_device_management": "Profile Manager makes it easy to assign and distribute apps purchased through the Volume Purchase Program to users and groups.",
  "_generic_string_profile_manager_books_feature_description": "Profile Manager makes it easy to assign books purchased though the Volume Purchase Program to users and groups.",
  "_generic_string_profile_manager_device_genesis_description": "Profile Manager makes it easy to manage Apple devices. You can customize different settings and apply them to each enrolled device.",
  "_generic_string_profile_manager_device_group_genesis_description": "Profile Manager makes it easy to organize Apple devices into groups. You can customize different settings and apply them to each enrolled device in the group.",
  "_button_label_Add Device Group": "Add Device Group",
  "_button_label_Enroll Device": "Enroll Device",
  "_button_text_Learn More": "Learn about enrolling devices",
  "_button_width_learn_more": "215",
  "_genesis_view_width": "800",

  /* Books Library */
  "_generic_string_Books": "Books",
  "_generic_string_book_count": "%@1 Books",
  "_generic_string_book_count_and_size_fmt_KB": "%@1 Books, %@2 KB",
  "_generic_string_book_count_and_size_fmt_MB": "%@1 Books, %@2 MB",
  "_generic_string_book_count_and_size_fmt_GB": "%@1 Books, %@2 GB",

  /* VPP Content detail page */
  "_generic_string_This app is designed for both iPhone and iPad": "This app is designed for both iPhone and iPad",
  "_generic_string_View in App Store": "View in App Store",
  "_generic_string_Developer Website": "Developer Website",
  "_generic_string_VPP Website": "VPP Website",
  "_generic_string_Category: %@": "Category: %@",
  "_generic_string_Updated: %@": "Updated: %@",
  "_generic_string_Version: %@": "Version: %@",
  "_generic_string_Size: %@": "Size: %@",
  "_generic_string_Choose Groups": "Choose Groups",
  "_generic_string_choose_vpp_enabled_groups": "Choose VPP Enabled Groups",
  "_assign_user_groups_to_app_description": "Choose VPP enabled user groups to which the app should be assigned. The app will be assigned in chronological order according to when users accepted VPP Managed Distribution enrollment.",
  "_generic_string_Choose users": "Choose Users",
  "_assign_users_to_app_description": "Choose users to which the app should be assigned.",
  "_view_more_info_...More": "...More",
  "_view_more_info_...Less": "...Less",
  "_search_hint_Search Groups": "Search Groups",
  "_search_hint_search_vpp_enabled_groups": "Search VPP Enabled Groups",
  "_search_hint_Search Users": "Search Users",
  "_generic_string_Go back": "Go back",
  "_generic_string_Loading Application Information...": "Loading Application Information...",
  "_layout_vpp_content_left_detail_view_width": "160",

  "_generic_string_VPP Managed Distribution": "VPP Managed Distribution",

  // height of the vpp section in user group's about tab. This should account for longer status strings in different locales.
  "_user_group_about_vpp_section_height": '450',
  "_generic_string_Enrolled": "Enrolled",
  "_generic_string_Not Enrolled": "Not Enrolled",
  "_generic_string_Send Email Invitation...": "Send email invitation…",
  "_generic_string_Send Email Invitation": "Send email invitation",
  "_vpp_invitation_string_invitation_not_sent": "An invitation has not been sent to this user.",
  "_invitation_status_An invitation has not been sent via Email": "An invitation has not been sent via email",
  "_vpp_invitation_status_An invitation has not been sent to <device name>": "An invitation has not been sent to %@",
  "_generic_string_Send Invitation to <Device Name>": "Send invitation to %@",
  "_generic_string_Resend Invitation...": "Resend invitation…",
  "_generic_string_Resend Invitation": "Resend invitation",
  "_generic_string_This user un-enrolled from the program on <status_update_date>.": "This user un-enrolled from the program on %@.",
  "_generic_string_This user was removed from the program on <vpp_status_updated_at>.": "This user was removed from the program on %@.",
  "_generic_string_No apps or books are assigned to this user.": "No apps or books are assigned to this user.",
  "_generic_string_Remove From Program": "Remove From Program",
  "_vpp_enrollment_status_This user was enrolled to receive content on <vpp_status_updated_at>.": "This user was enrolled to receive content on %@.",
  "_generic_string_An invitation was sent to <email_address> on <last_invited_date>": "An invitation was sent to %@ on %@",
  "_generic_string_An invitation was requested to be sent to <email_address> on <last_invited_date>": "An invitation was requested to be sent to %@ on %@",
  "_generic_string_Enter email address": "Enter email address",

  "_layout_vpp_invite_pane_width": "350",
  "_layout_vpp_invite_pane_cancel_button_offset_right": "210",

  // VPP Group Enrollments
  "_enable_vpp_service_for_user_group": "Enable VPP Managed Distribution Services",
  "_processing_vpp_service_on_user_group_description": "Processing VPP information...",
  "_generic_string_Disable VPP Managed Distribution Services": "Disable VPP Managed Distribution Services",
  "_generic_string_All VPP assignments to this group will be removed. Current book assignments to enrolled users will be unaffected.": "All VPP assignments to this group will be removed. Current book assignments to enrolled users will be unaffected.",
  "_layout_disable_vpp_alert_pane_width": "550",
  "_vpp_group_enrollment_status_No Users Enrolled": "No Users Enrolled",
  "_vpp_group_enrollment_status_No Users": "No Users",
  "_vpp_group_enrollment_status_All Users Enrolled": "All Users Enrolled",
  "_vpp_group_enrollment_status_X of Y Users Enrolled": "%@ of %@ Users Enrolled",
  "_user_group_enrollment_info_These users were enrolled to receive content on <time>": "These users were enrolled to receive content on %@",
  "_user_group_enrollment_info_These users were enrolled to receive content between <start_time> and <end_time>": "These users were enrolled to receive content between %@ and %@",
  "_group_users_type_Users not previously invited": "Users not previously invited",
  "_group_users_type_Users not enrolled": "Users not enrolled",
  "_vpp_group_invitation_string_Invite:": "Invite:",
  "_user_group_vpp_no_email_invitations_sent": "An email invitation has not been sent to any users",
  "_user_group_vpp_no_device_invitations_sent": "An invitation has not been sent to the devices of any users",
  "_vpp_group_invitation_invite_label_width": "42",
  "_user_group_vpp_action_Send VPP Invitation to Devices": "Send invitation to users' devices",

  "_user_group_email_invitation_status_Email Invitations were sent to X of Y users on <time>": "Email Invitations were sent to %@ of %@ unenrolled users on %@",
  "_user_group_email_invitation_status_Email Invitations were sent to X of Y users between <start_time> and <end_time>": "Email invitations were sent to %@ of %@ unenrolled users between %@ and %@",
  "_user_group_device_invitation_status_Device Invitations were sent to X of Y users on <time>": "Invitations were sent to the devices of %@ of %@ unenrolled users on %@",
  "_user_group_device_invitation_status_Device Invitations were sent to X of Y users between <start_time> and <end_time>": "Invitations were sent to the devices of %@ of %@ unenrolled users between %@ and %@",

  "_layout_user_group_vpp_enrollment_in_progress_status_height": "45",
  "_layout_user_group_vpp_email_invitation_in_progress_status_height": "45",
  "_layout_user_group_vpp_device_invitation_in_progress_status_height": "45",

  // User group vpp invitation confirmation dialogues
  "_user_group_vpp_device_invite_alert_Send Invitation": "Send Invitation",
  "_user_group_vpp_email_alert_uninvited": "Send an email invitation to the %@ users who have not previously been invited?",
  "_user_group_vpp_email_alert_uninvited_single_user": "Send an email invitation to the 1 user who has not previously been invited?",
  "_user_group_vpp_email_alert_unenrolled": "Send an email invitation to the %@ users who are currently not enrolled?",
  "_user_group_vpp_email_alert_unenrolled_single_user": "Send an email invitation to the 1 user who is currently not enrolled?",
  "_user_group_vpp_device_alert_uninvited": "Send an invitation to the devices of the %@ users who have not previously been invited?",
  "_user_group_vpp_device_alert_uninvited_single_user": "Send an invitation to the devices of the 1 user who has not previously been invited?",
  "_user_group_vpp_device_alert_unenrolled": "Send an invitation to the devices of the %@ users who are currently not enrolled?",
  "_user_group_vpp_device_alert_unenrolled_single_user": "Send an invitation to the devices of the 1 user who is currently not enrolled?",

  "_user_group_email_invitation_info_All users have been invited": "All users have been invited.",
  "_user_group_email_invitation_info_none_uninvited_have_email": "Users not previously invited are missing an email address in their directory account.",
  "_user_group_email_invitation_info_none_unenrolled_have_email": "Users not enrolled are missing an email address in their directory account.",
  "_user_group_email_invitation_info_x_of_y_uninvited_have_no_email": "%@ of %@ users not previously invited are missing an email address in their directory account.",
  "_user_group_email_invitation_info_x_of_y_unenrolled_have_no_email": "%@ of %@ users not enrolled are missing an email address in their directory account.",
  "_user_group_device_invitation_info_none_uninvited_have_vpp_device": "Users not previously invited lack enrollment of an eligible device.",
  "_user_group_device_invitation_info_none_unenrolled_have_vpp_device": "Users not enrolled lack enrollment of an eligible device.",
  "_user_group_device_invitation_info_x_of_y_uninvited_have_no_vpp_device": "%@ of %@ users not previously invited lack enrollment of an eligible device.",
  "_user_group_device_invitation_info_x_of_y_unenrolled_have_no_vpp_device": "%@ of %@ users not enrolled lack enrollment of an eligible device.",

  "_mdm_enabled_user_vpp_invite_revoked_description": "Access to this service was revoked on %@. A new invitation will not be sent automatically",
  "_mdm_enabled_user_vpp_service_unenrolled_description": "This user un-enrolled from this service on %@. A new invitation will not be sent automatically",
  "_mdm_enabled_user_vpp_service_enrolled_description": "Enrolled on %@",
  "_vpp_date_time_format": "%B %d, %Y at %i:%M %p",
  "_generic_string_Revoke access": "Revoke access",
  "_vpp_content_No content is assigned to this user.": "No content is assigned to this user",
  "_vpp_device_status_This user does not have a device enrolled that supports this service.": "This user does not have a device enrolled that supports this service.",
  "_mdm_enabled_user_vpp_service_enrolled_no_devices_description": "The user does not have a device enrolled that supports this service",
  "_generic_string_An invitation was requested to be sent to %@1 on %@2": "An invitation was requested to be sent to %@1 on %@2",
  "_generic_string_An invitation was sent to %@1 on %@2": "An invitation was sent to %@1 on %@2",
  "_generic_string_Send invitation via email": "Send invitation via email",
  "_mdm_disabled_user_invited_for_vpp_service_description": "An invitation was sent to %@1 on %@2",
  "_mdm_disabled_user_revoked_for_vpp_service_description": "Access to this service was revoked on %@. A new invitation will not be sent automatically",
  "_mdm_disabled_user_unenrolled_for_vpp_service_description": "This user un-enrolled from this service on %@. A new invitation will not be sent automatically",
  '_generic_string_Send invitation to "%@"': 'Send invitation to "%@"',
  "generic_string_authorized_users_exceeds_available_licenses_for_single_app": "You have not purchased enough copies of %@ for all the users in this group. The apps will be assigned in chronological order according to when users accepted VPP Managed Distribution enrollment.",
  "generic_string_authorized_users_exceeds_available_licenses_for_multiple_apps": "You have not purchased enough copies of %@ apps for all the users in this group. The apps will be assigned in chronological order according to when users accepted VPP Managed Distribution enrollment.",
  "_processing_vpp_on_user_group_to_assign_vpp_apps": "VPP apps can be assigned after the group information is processed.",
  "_enabled_vpp_service_on_user_group_to_assign_vpp_apps": "Enable VPP services on this group to assign VPP apps.",
  "_processing_vpp_on_user_group_to_assign_vpp_books": "Books can be assigned after the group information is processed.",
  "_enable_vpp_service_to_assign_books": "Enable VPP services on this group to assign books.",
  "_generic_string_Assign Books": "Assign Books",

  "_cloud_configuration_knob_set_name": "Cloud Configuration",
  "_cloud_configuration_knob_set_num_lines": "2",
  "_cloud_configuration_knob_set_description": "Use this section to define settings for Cloud Configuration.",
  "_cloud_configuration_require_enrollment": "Do not allow user to skip enrollment step",
  "_cloud_configuration_require_enrollment_hint": "Requires device to enroll in MDM before completing setup",
  "_generic_string_Supervise (iOS only)": "Supervise (iOS only)",
  "_generic_string_Enable supervision and prevent unenrollment": "Enable supervision and prevent unenrollment",
  "_generic_string_Allow Pairing": "Allow Pairing",
  "_generic_string_Enable the iOS device to be paired with a Mac": "Enable the iOS device to be paired with a Mac",
  "_generic_string_Require credentials for enrollment": "Require credentials for enrollment",
  "_generic_string_Setup Assistant Options": "Setup Assistant Options",
  "_generic_string_Choose which options to show in the assistant": "Choose which options to show in the assistant",
  "_generic_string_Location Services": "Location Services",
  "_generic_string_Apple ID": "Apple ID",
  "_generic_string_Terms and Conditions": "Terms and Conditions",
  "_generic_string_Send Diagnostics": "Send Diagnostics",
  "_generic_string_Siri": "Siri",
  "_generic_string_Set Up as New or Restore": "Set Up as New or Restore",
  "_generic_string_Make MDM Mandatory": "Make MDM Mandatory",
  "_generic_string_User may not skip applying or remove the configuration returned by the MDM server": "User may not skip applying or remove the configuration returned by the MDM server",
  "_skip_setup_options_iOS and OSX": "iOS and OS X",
  "_skip_setup_option_Passcode Lock": "Passcode Lock",
  "_skip_setup_options_iOS": "iOS",
  "_skip_setup_options_OSX": "OS X",
  "_skip_setup_option_Registration": "Registration",
  "_skip_setup_option_Timezone": "Timezone",

  "_generic_string_Enable Zoom": "Enable Zoom",
  "_generic_string_Enable Invert Colors": "Enable Invert Colors",
  "_generic_string_Enable AssistiveTouch": "Enable AssistiveTouch",
  "_generic_string_Enable Speak Selection": "Enable Speak Selection",
  "_generic_string_Enable Mono Audio": "Enable Mono Audio",
  "_generic_string_Push Apps": "Push Apps",
  "_generic_string_Push VPP Apps": "Push VPP Apps",
  "_generic_string_Choose VPP Apps to push": "Choose VPP Apps to push",
  "_generic_string_The selected apps will be pushed to all eligible devices of enrolled users.": "The selected apps will be pushed to all eligible devices of enrolled users.",
  "_generic_string_The selected apps will be pushed to all eligible devices of the enrolled user.": "The selected apps will be pushed to all eligible devices of the enrolled user.",
  "_generic_string_The selected apps are pushed to the user's eligible devices once they enroll in VPP Managed Distribution.": "The selected apps are pushed to the user's eligible devices once they enroll in VPP Managed Distribution.",
  "_generic_string_1 user's eligible devices will receive the selected apps once they enrolled in VPP Managed Distribution.": "1 user's eligible devices will receive the selected apps once they enrolled in VPP Managed Distribution.",
  "_generic_string_<count> users' eligible devices will receive the selected apps once they enrolled in VPP Managed Distribution.": "%@1 users' eligible devices will receive the selected apps once they enrolled in VPP Managed Distribution.",
  "_generic_string_This user does not have an eligible device to receive the selected apps.": "This user does not have an eligible device to receive the selected apps.",
  "_generic_string_1 user lacks any eligible devices and will not be pushed the selected apps.": "1 user lacks any eligible devices and will not be pushed the selected apps.",
  "_generic_string_<count> users lack any eligible devices and the selected apps will not be pushed.": "%@1 users lack any eligible devices and the selected apps will not be pushed.",
  "_generic_string_No VPP Apps assigned": "No VPP Apps assigned",
  "_generic_string_Select All": "Select All",
  "_generic_string_No VPP apps assigned to this user.": "No VPP apps assigned to this user.",
  "_generic_string_No VPP apps assigned to this group.": "No VPP apps assigned to this group.",
  "_generic_string_Enable VPP services on this group to push VPP apps.": "Enable VPP services on this group to push VPP apps.",
  "_generic_string_No eligible devices.": "No eligible devices.",
  "_generic_string_Allow modifying account settings (Supervised devices only)": "Allow modifying account settings (Supervised devices only)",
  "_generic_string_Allow modifying Find My Friends settings (Supervised devices only)": "Allow modifying Find My Friends settings (Supervised devices only)",
  "_generic_string_Allow pairing with non-Configurator hosts (Supervised Devices only)": "Allow pairing with non-Configurator hosts (Supervised Devices only)",
  "_generic_string_Allow modifying cellular data settings (Supervised devices only)": "Allow modifying cellular data settings (Supervised devices only)",
  "_generic_string_Allow opening managed app documents in unmanaged apps": "Allow documents from managed apps in unmanaged apps",
  "_generic_string_Allow opening unmanaged app documents in managed apps": "Allow documents from unmanaged apps in managed apps",
  "_generic_string_Allow Control Center on lock screen": "Show Control Center in Lock screen",
  "_generic_string_Show notifications view on lock screen": "Show Notification Center in Lock screen",
  "_generic_string_Show today view on lock screen": "Show Today view in Lock screen",
  "_generic_string_Allow user-generated content in Siri (Supervised devices only)": "Allow user-generated content in Siri (Supervised devices only)",
  "_generic_string_Allow AirDrop (Supervised devices only)": "Allow AirDrop (Supervised devices only)",
  "_generic_string_Require passcode on first AirPlay pairing": "Require passcode on first AirPlay pairing",

  "_locations_sidebar_item_display_name": "Locations",
  "_generic_string_Prompt User To Enroll Device": "Prompt User To Enroll Device",
  "_generic_string_Prompt the user in the setup assistant to enroll in device management": "Prompt the user in the setup assistant to enroll in device management",

  // AD Certificate
  /* This is the name of the Setting Type for AD Cert settings. */
  "_ad_cert_knob_set_name": "AD Certificate",
  /* This is a generic string used one or more times in the app. */
  "_generic_string_My AD Certificate": "My AD Certificate",
  /* This layout gives the height of the description label of the description field in the AD Cert Payload*/
  "_layout_ad_cert_description_field_height": "40",
  "_ad_cert_Machine": "Machine",
  "_ad_cert_User": "User",

  // Global HTTP Proxy
  "_generic_string_Allow direct connection if PAC is unreachable": "Allow direct connection if PAC is unreachable",
  "_generic_string_Allow bypassing proxy to access captive networks": "Allow bypassing proxy to access captive networks",

  // Network
  "_generic_string_PAC Fallback": "PAC Fallback",
  "_generic_string_Enable to allow direct connection if PAC is unreachable": "Enable to allow direct connection if PAC is unreachable",
  "_generic_string_Legacy Hotspot": "Legacy Hotspot",
  "_generic_string_Passpoint": "Passpoint",
  "_generic_string_Provider Display Name": "Provider Display Name",
  "_generic_string_Display name of the Passpoint service provider": "Display name of the Passpoint service provider",
  "_generic_string_Domain Name": "Domain Name",
  "_generic_string_Domain name of the Passpoint service provider": "Domain name of the Passpoint service provider",
  "_generic_string_Roaming Consortium OIs": "Roaming Consortium OIs",
  "_generic_string_Roaming Consortium Organization Identifiers": "Roaming Consortium Organization Identifiers",
  "_generic_string_Roaming Consortium OI": "Roaming Consortium OI",
  "_generic_string_NAI Realm Names": "NAI Realm Names",
  "_generic_string_Network Access Identifier Realm Names": "Network Access Identifier Realm Names",
  "_generic_string_NAI Realm Name": "NAI Realm Name",
  "_generic_string_MCC/MNCs": "MCC/MNCs",
  "_generic_string_Mobile Country Code and Mobile Network Configurations": "Mobile Country Code and Mobile Network Configurations",
  "_generic_string_MCC": "MCC",
  "_generic_string_MNC": "MNC",
  "_generic_string_Connect to roaming partner Passpoint networks": "Connect to roaming partner Passpoint networks",
  "_generic_string_Add Mobile Country Code and Mobile Network Configuration": "Add Mobile Country Code and Mobile Network Configuration",
  "_generic_string_MCC:": "MCC:",
  "_generic_string_MNC:": "MNC:",

  // Web Content Filter
  "_global_web_content_filter_knob_set_name": "Web Content Filter",
  "_global_web_content_filter_knob_set_description": "Use this section to configure which URLS can be accessed by the device. These settings will only affect supervised devices.",
  "_global_web_content_filter_knob_set_num_lines": "1",
  "_generic_string_Allowed Websites": "Allowed Websites",
  "_web_content_filter_Limit Adult Content": "Limit Adult Content",
  "_web_content_filter_Specific Websites Only": "Specific Websites Only",
  "_web_content_filter_Permitted URLs": "Permitted URLs",
  "_web_content_filter_Specific URLs that will be allowed": "Specific URLs that will be allowed",
  "_web_content_filter_Blacklisted URLs": "Blacklisted URLs",
  "_web_content_filter_Additional URLs that will not be allowed": "Additional URLs that will not be allowed",
  "_web_content_filter_Specific Websites": "Specific Websites",
  "_web_content_filter_Allowed URLs which will be shown as bookmarks": "Allowed URLs which will be shown as bookmarks",
  "_web_content_filter_URL": "URL",
  "_web_content_filter_Name": "Name",
  "_web_content_filter_Bookmark": "Bookmark",
  "_web_content_filter_Add Bookmark": "Add Bookmark",
  "_web_content_filter_Create web content bookmark": "Create a bookmark",
  "_web_content_filter_Name:": "Name:",
  "_web_content_filter_URL:": "URL:",
  "_web_content_filter_Bookmark Path:": "Bookmark Path:",
  "_web_content_filter_add_page_label_width": "110",
  "_web_content_URL_Placeholder": "http://example.com",


  // AirPlay
  "_global_airplay_knob_set_name": "AirPlay",
  "_global_airplay_knob_set_description": "Use this section to define settings for connecting to AirPlay destinations.",
  "_airplay_knob_set_num_lines": "1",
  "_generic_string_Restrict AirPlay destinations (Supervised devices only)": "Restrict AirPlay destinations (Supervised devices only)",
  "_generic_string_Only known AirPlay destinations will be available to the device": "Only known AirPlay destinations will be available to the device",
  "_generic_string_Add AirPlay Destinations": "Add AirPlay Destinations",
  "_generic_string_Add a known AirPlay destination to the device": "Add a known AirPlay destination to the device",
  "_generic_string_Add by device name": "Add by device name",
  "_generic_string_Pick from enrolled Apple TVs": "Pick from enrolled Apple TVs",
  "_generic_string_Device Type:": "Device Type:",
  "_device_type_iOS/OS X": "iOS/OS X",
  "_device_type_Apple TV": "Apple TV",

  // Single Sign On
  "_global_single_sign_on_knob_set_name": "Single Sign-On",
  "_global_single_sign_on_knob_set_description": "Use this section to configure Single Sign-On",
  "_single_sign_on_knob_set_num_lines": "1",
  "_generic_string_Principal Name": "Principal Name",
  "_generic_string_Principal name of the account": "Principal name of the account",
  "_generic_string_Realm of the account": "Realm of the account",
  "_generic_string_Limit this account to specific URL patterns": "Limit this account to specific URL patterns",
  "_generic_string_This account will only be used for URLs that match the following patterns": "This account will only be used for URLs that match the following patterns",
  "_generic_string_Limit this account to specific applications": "Limit this account to specific apps",
  "_generic_string_This account will only be used for the following application identifiers": "This account will only be used for the following app identifiers",

  // AirPrint
  "_global_airprint_knob_set_name": "AirPrint",
  "_airprint_knob_set_num_lines": "1",
  "_global_airprint_knob_set_description": "Use this section to define settings for connecting to Airprint printers.",
  "_generic_string_Printers available on the device": "Printers available on the device",
  "_table_header_IP Address": "IP Address",
  "_table_header_Resource Path": "Resource Path",

  "_generic_string_IP Address:": "IP Address:",
  "_generic_string_Resource Path:": "Resource Path:",
  "_layout_airplay_add_sheet_label_width": "110",
  "_generic_string_Add Printer": "Add Printer",

  "_generic_string_Enrollment Settings": "Enrollment Settings",
  "_enrollment_setting_allow_activation_lock": "Send 'Allow Activation Lock' command after MDM enrollment (Supervised devices only)",
  "_enrollment_setting_allow_activation_lock_with_bypass_code": "Only send command if Activation Lock bypass code has been obtained",

  // Fonts
  "_fonts_knob_set_name": "Fonts",
  "_fonts_knob_set_num_lines": "1",
  "_fonts_knob_set_description": "Use this section to specify the TrueType and OpenType fonts you want to install on the device.",
  "_generic_string_Font:": "Font:",
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