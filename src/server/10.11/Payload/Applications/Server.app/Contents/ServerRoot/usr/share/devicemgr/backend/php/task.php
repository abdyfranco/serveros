<?php
// -------------------------------------------------------------------------
// Copyright (c) 2016 Apple Inc. All rights reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//-------------------------------------------------------------------------

require_once('/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/ota_service_common.php');

define('EnableLostMode',               1 << 52);    // Params => Message, PhoneNumber, Footnote
define('DeviceLocation',               1 << 51);
define('DisableLostMode',              1 << 50);
define('EnableActivationLock',         1 << 49);    // TODO: This is not a mdm task and shouldn't be a singleton task

define('PasscodeLockGracePeriod',      1 << 37);
define('EnableAppAnalytics',           1 << 36);
define('DisableAppAnalytics',          1 << 35);
define('EnableDiagnosticSubmission',   1 << 34);
define('DisableDiagnosticSubmission',  1 << 33);
define('LogOutUser',                   1 << 32);
define('EraseDevice',                  1 << 30);    // Param => PIN for Macs
define('RemoveMDM',                    1 << 29);
define('DeviceLock',                   1 << 27);    // Param => PIN
define('ClearPasscode',                1 << 24);
define('ClearRestrictionsPasscode',    1 << 23);
define('RequestMirroring',             1 << 22);
define('StopMirroring',                1 << 21);
define('RefreshMDM',                   1 << 20);
define('AllowActivationLock',          1 << 19);
define('UserList',                     1 << 18);
define('OSUpdateStatus',               1 << 17);
define('ScheduleOSUpdateScan',         1 << 16);
define('DeviceInformation',            1 << 15);
define('Restrictions',                 1 << 14);
define('CertificateList',              1 << 13);
define('ProvisioningProfileList',      1 << 12);
define('ProfileList',                  1 << 11);
define('InstalledApplicationList',     1 << 10);    // IAL must be before MAL, as we build the main table from IAL and supplement it from MAL
define('ManagedApplicationList',       1 << 9);
define('ManagedMediaList',             1 << 8);
define('SecurityInfo',                 1 << 7);
define('SetOrganizationInfo',          1 << 6);     // We bury this with UpdateInformation, and must come after at least the 'DeviceInformation' request, as it's iOS 7 and later only
define('RetrieveALBypassCode',         1 << 5);
define('ClearALBypassCode',            1 << 4);
define('ManagedApplicationFeedback',   1 << 3);
define('AvailableOSUpdates',           1 << 2);
define('LastUpdateInfoCommand',        ManagedApplicationFeedback);  // The last command we can run as part of UpdateInformation

// These are set only on lp_singleton_tasks
define('UserQuota',                    1 << 31);    // Params => Number of users
define('SetupConfiguration',           1 << 1);
define('DeviceConfigured',             1 << 0);

$kTaskTypeForSingleton = [ RemoveMDM                    => 'RemoveMDM',
                           EraseDevice                  => 'EraseDevice',
                           DeviceLock                   => 'DeviceLock',
                           ClearPasscode                => 'ClearPasscode',
                           ClearRestrictionsPasscode    => 'ClearRestrictionsPasscode',
                           RequestMirroring             => 'RequestMirroring',
                           StopMirroring                => 'StopMirroring',
                           RefreshMDM                   => 'EnrollDevice',      // This is essentially a re-enroll command
                           AllowActivationLock          => 'AllowActivationLock',
                           UserList                     => 'UpdateInformation',
                           OSUpdateStatus               => 'UpdateInformation',
                           ScheduleOSUpdateScan         => 'UpdateInformation',
                           DeviceInformation            => 'UpdateInformation',
                           Restrictions                 => 'UpdateInformation',
                           CertificateList              => 'UpdateInformation',
                           ProvisioningProfileList      => 'UpdateInformation',
                           ProfileList                  => 'UpdateInformation',
                           ManagedApplicationList       => 'UpdateInformation',
                           ManagedMediaList             => 'UpdateInformation',
                           InstalledApplicationList     => 'UpdateInformation',
                           SecurityInfo                 => 'UpdateInformation',
                           SetOrganizationInfo          => 'UpdateInformation',
                           RetrieveALBypassCode         => 'UpdateInformation',
                           ClearALBypassCode            => 'UpdateInformation',
                           ManagedApplicationFeedback   => 'UpdateInformation',
                           AvailableOSUpdates           => 'UpdateInformation',
                           SetupConfiguration           => 'EnrollDevice',
                           DeviceConfigured             => 'EnrollDevice',
                           UserQuota                    => 'EnrollDevice',
                           EnableLostMode               => 'EnableLostMode',
                           DeviceLocation               => 'DeviceLocation',
                           DisableLostMode              => 'DisableLostMode',
                           EnableActivationLock         => 'EnableActivationLock',
                           LogOutUser                   => 'LogOutUser',
                           EnableDiagnosticSubmission   => 'EnableDiagnosticSubmission',
                           DisableDiagnosticSubmission  => 'DisableDiagnosticSubmission',
                           EnableAppAnalytics           => 'EnableAppAnalytics',
                           DisableAppAnalytics          => 'DisableAppAnalytics',
                           PasscodeLockGracePeriod      => 'PasscodeLockGracePeriod'];

// The following are managed app substrings that if found in the status of a managed app
// means we consider it installed and won't try to push the app again.
// If the status doesn't contain one of these strings, we will check the
// InstalledApplicationList for the app.
define('AppInstalledUnmanaged', 'unmanaged');
define('AppInstalledManaged',   'managed');
define('AppInstallPending',     'pending');
define('AppNotInstalled',       null);
define('AppRejected',           'rejected');
$kFoundAppStatusMap = [ 'Prompt'      => AppInstallPending,   // Prompting, PromptingForLogin, PromptingForUpdate
                        'Redeem'      => AppInstallPending,   // Redeeming
                        'Redemp'      => AppInstallPending,   // NeedsRedemption
                        'Validat'     => AppInstallPending,   // ValidatingPurchase
                        'Queue'       => AppInstallPending,   // Queued
                        'Installing'  => AppInstallPending,   // Installing
                        'Uninstalled' => AppNotInstalled,     // ManagedButUninstalled  -- before 'Managed' so we consider it uninstalled
                        'Managed'     => AppInstalledManaged, // Managed
                        'Reject'      => AppRejected,         // UserRejected, UpdateRejected
                      ];

//-------------------------------------------------------------------------

function complete_singleton_tasks_for_target($target, $singleton, $succeed, $canceled = FALSE, $error_chain = NULL)
{
  // Parameters
  // target_id   The id of the device
  // singleton   The singleton bit mask of the task to be marked completed
  // succeed     Pass TRUE if the task completed successfully, FALSE if not
  // canceled    Pass TRUE if the task is to be canceled (optional, defaults to FALSE)
  // error_chain The JSON for any error reporting to be saved on the task (optional, defaults to NULL)
  $params = [ 'target_id'   => CV($target, 'id'),
              'singleton'   => $singleton,
              'succeed'     => $succeed,
              'canceled'    => $canceled,
              'error_chain' => $error_chain
            ];
  ExecuteSQLFunction('dm_complete_mdm_tasks_for_mdm_target', $params);
} // complete_singleton_tasks_for_target

//-------------------------------------------------------------------------

function complete_task(&$task, $succeed, $canceled = FALSE, $error_chain = NULL)
{
  if (!$succeed) SetCV($task, 'params', $error_chain);
  SetCV($task, 'succeeded', ($canceled ? -1 : ($succeed ? 1 : 0)));
  // SetCV($task, 'completed_at', kDMCurrentTimestamp);
  SaveToDatabase($task, FALSE);  // Triggers in the DB will handle updating the parent library_item_task's counts and such
} // complete_task

//-------------------------------------------------------------------------

function get_profile_identifier($profile)
{
  $host = GetServerHostname();
  $type = (CV($profile, 'is_manual') ? 'alacarte' : 'pushed');
  $uuid = CV($profile, 'uuid');
  return "com.apple.mdm.$host.$uuid.$type";
} // get_profile_identifier

//-------------------------------------------------------------------------

function skip_task(&$task)
{
  $id   = CV($task, 'id');
  $type = CV($task, 'task_type');
  LogMsg("Skipping task $id ($type)...");
  SetCVMulti($task, ['skipped' => TRUE, 'uuid' => NULL]);
  SaveToDatabase($task);
} // skip_task

//-------------------------------------------------------------------------

function Task_first_for_target($target)
{
  // For ScheduleOSUpdates tasks, we use internal_tasks to track the progress on the device.
  $sql = <<<SQL
WHERE    mdm_target_id = :mdm_target_id
  AND    (internal_task_id IS NULL OR task_type = 'ScheduleOSUpdates')
  AND    completed_at     IS NULL
  AND    NOT skipped
ORDER BY updated_at ASC, id ASC
LIMIT    1
SQL;
  $task = FindBySQL('mdm_tasks', $sql, ['mdm_target_id' => CV($target, 'id')]);

  return $task;
} // Task_first_for_target

//-------------------------------------------------------------------------

function Task_first_for_type($target, $type)
{
  $sql = <<<SQL
WHERE    mdm_target_id = :mdm_target_id
  AND    task_type     = :task_type
  AND    internal_task_id IS NULL
  AND    completed_at     IS NULL
  AND    NOT skipped
ORDER BY updated_at ASC
LIMIT    1
SQL;
  $task = FindBySQL('mdm_tasks', $sql, ['mdm_target_id' => CV($target, 'id'), 'task_type' => $type]);
  return $task;
} // Task_first_for_type

//-------------------------------------------------------------------------

// The caller will call SaveToDatabase() on $target
function Task_generate_singleton_request(&$target, $high_priority, $user_config)
{
  global $gLogLevel;

  $prop = ($high_priority ? 'hp_singleton_tasks' : 'lp_singleton_tasks');
  $mask = CV($target, $prop);
  if (empty($mask)) return NULL;    // No more singletons left

  $uuid = GenerateUUID();

  do {
    if ($mask == 0) {       // No more singletons left
      $request_hash = NULL;
      break;                // Exit the loop, don't return--there's clean-up logic after the loop
    }

    // Note that the check for each singleton task should be performed in descending order of the tasks' bit numbers to preserve priority.
    // But check all high-priority bits before any low-priority-only bits.
    $get_next = FALSE;
    try {
      $request_hash = ['Command' => [], 'CommandUUID' => $uuid];
      if ($mask & EnableLostMode) {                                                                                                          // 52
        $task_type = EnableLostMode;
        if (Target_is_lab_session($target)) DieInternalError(__FUNCTION__.": Invalid task 'EnableLostMode' for LabSession");
        $task = Task_first_for_type($target, 'EnableLostMode');
        if (!$task) DieInternalError(__FUNCTION__.": Corresponding mdm_task not found for singleton command 'EnableLostMode'");

        $lost_mode_params = CV($task, 'params');
        if (!empty($lost_mode_params)) {
          if (!empty($lost_mode_params['Message'])) $request_hash['Command']['Message'] = $lost_mode_params['Message'];
          if (!empty($lost_mode_params['PhoneNumber'])) $request_hash['Command']['PhoneNumber'] = $lost_mode_params['PhoneNumber'];
          if (!empty($lost_mode_params['Footnote'])) $request_hash['Command']['Footnote'] = $lost_mode_params['Footnote'];
        }

        $request_hash['Command']['RequestType'] = 'EnableLostMode';
      } elseif ($mask & DeviceLocation) {                                                                                                         // 51
        $task_type = DeviceLocation;
        if (Target_is_lab_session($target)) DieInternalError(__FUNCTION__.": Invalid task 'DeviceLocation' for LabSession");
        $request_hash['Command']['RequestType'] = 'DeviceLocation';
      } elseif ($mask & DisableLostMode) {                                                                                                        // 50
        $task_type = DisableLostMode;
        if (Target_is_lab_session($target)) DieInternalError(__FUNCTION__.": Invalid task 'DisableLostMode' for LabSession");
        $request_hash['Command']['RequestType'] = 'DisableLostMode';
      } elseif ($mask & EnableActivationLock) {
        $task_type = EnableActivationLock;
        $get_next = TRUE;     // This is not a real task, just ignore it and move on.
      } elseif ($mask & EraseDevice) {                                                                                                            // 30 - Erase device task is a higher priority task than other ones
        $task_type = EraseDevice;
        if (Target_is_lab_session($target)) DieInternalError(__FUNCTION__.": Invalid task 'EraseDevice' for LabSession");
        $request_hash['Command']['RequestType'] = 'EraseDevice';
        if (Target_is_mac($target)) {
          $task = Task_first_for_type($target, 'EraseDevice');
          if (!$task) DieInternalError(__FUNCTION__.": Corresponding mdm_task not found for singleton command 'EraseDevice'");

          $pin = CV($task, 'params');
          if (!empty($pin)) $pin = (!empty($pin['PIN']) ? $pin['PIN'] : NULL);
          if (!empty($pin)) $request_hash['Command']['PIN'] = $pin;
        }
      } elseif ($mask & PasscodeLockGracePeriod) {                                                                                             // 37
        $task_type = PasscodeLockGracePeriod;

        $task = Task_first_for_type($target, 'PasscodeLockGracePeriod');
        if (!$task) DieInternalError(__FUNCTION__.": Corresponding mdm_task not found for singleton command 'PasscodeLockGracePeriod'");
        $params = CV($task, 'params');

        $request_hash['Command']['RequestType'] = 'Settings';
        $request_hash['Command']['Settings']    = [ ['Item' => 'PasscodeLockGracePeriod', 'PasscodeLockGracePeriod' => $params['PasscodeLockGracePeriod']] ];
      } elseif ($mask & EnableAppAnalytics) {                                                                                             // 36
        $task_type = EnableAppAnalytics;
        $request_hash['Command']['RequestType'] = 'Settings';
        $request_hash['Command']['Settings']    = [ ['Item' => 'AppAnalytics', 'Enabled' => true] ];
      } elseif ($mask & DisableAppAnalytics) {                                                                                            // 35
        $task_type = DisableAppAnalytics;
        $request_hash['Command']['RequestType'] = 'Settings';
        $request_hash['Command']['Settings']    = [ ['Item' => 'AppAnalytics', 'Enabled' => false] ];
      } elseif ($mask & EnableDiagnosticSubmission) {                                                                                             // 34
        $task_type = EnableDiagnosticSubmission;
        $request_hash['Command']['RequestType'] = 'Settings';
        $request_hash['Command']['Settings']    = [ ['Item' => 'DiagnosticSubmission', 'Enabled' => true] ];
      } elseif ($mask & DisableDiagnosticSubmission) {                                                                                            // 33
        $task_type = DisableDiagnosticSubmission;
        $request_hash['Command']['RequestType'] = 'Settings';
        $request_hash['Command']['Settings']    = [ ['Item' => 'DiagnosticSubmission', 'Enabled' => false] ];
      } elseif ($mask & LogOutUser) {                                                                                                             // 32
        $task_type = LogOutUser;
        if (!Target_supports_multi_user_mode($target)) DieInternalError(__FUNCTION__.": Invalid task 'LogOutUser' for non-multi-user device");
        $request_hash['Command']['RequestType'] = 'LogOutUser';
      } elseif ($mask & UserQuota) {                                                                                                              // 31
        $task_type = UserQuota;
        if (Target_is_lab_session($target)) DieInternalError(__FUNCTION__.": Invalid task 'UserQuota' for LabSession");
        $request_hash['Command']['RequestType'] = 'Settings';
        $raw = ExecuteSQLFunction('dm_education_mode_user_count_for_device_id', [ 'device_id' => CV($target, 'id') ]);
        $json = (!empty($raw[0]) ? $raw[0]['dm_education_mode_user_count_for_device_id'] : NULL);
        if (!empty($json)) {
          $request_hash['Command']['Settings']    = [ ['Item' => 'MaximumResidentUsers', 'MaximumResidentUsers' => intval($json)] ];
        } else {
          LogMsg('UserQuota: dm_education_mode_user_count_for_device_id('.CV($target,'id').') returned an empty response.');
          $get_next = TRUE;      // No setup to send, move on
        }
      } elseif ($mask & RemoveMDM) {                                                                                                              // 29
        $task_type = RemoveMDM;
        $request_hash['Command'] = [ 'RequestType' => 'RemoveProfile',
                                     'Identifier'  => 'com.apple.config.'.GetServerHostname().'.mdm' ];
      } elseif ($mask & DeviceLock) {                                                                                                             // 27
        $task_type = DeviceLock;
        if (Target_is_lab_session($target)) DieInternalError(__FUNCTION__.": Invalid task 'DeviceLock' for LabSession");
        $task = Task_first_for_type($target, 'DeviceLock');
        if (!$task) DieInternalError(__FUNCTION__.": Corresponding mdm_task not found for singleton command 'DeviceLock'");

        $pin = CV($task, 'params');
        if (!empty($pin)) $pin = (!empty($pin['PIN']) ? $pin['PIN'] : NULL);
        if (empty($pin) && Target_is_mac($target)) DieInternalError(__FUNCTION__.": No PIN set for 'DeviceLock' task on an OS X device.");

        $request_hash['Command']['RequestType'] = 'DeviceLock';
        if (!empty($pin)) $request_hash['Command']['PIN'] = $pin;
      } elseif ($mask & ClearPasscode) {                                                                                                          // 24
        $task_type = ClearPasscode;
        if (Target_is_lab_session($target)) DieInternalError(__FUNCTION__.": Invalid task 'ClearPasscode' for LabSession");
        $request_hash['Command']['RequestType'] = 'ClearPasscode';
        $ext = Target_get_extended_data($target);
        $token = CVDA($ext, 'unlock_token');
        if (!empty($token)) $request_hash['Command']['UnlockToken'] = new PlistData($token, TRUE);  // TRUE => $token is pre-encoded
      } elseif ($mask & ClearRestrictionsPasscode) {                                                                                              // 23
        $task_type = ClearRestrictionsPasscode;
        if (CV($target, 'IsSupervised')) $request_hash['Command']['RequestType'] = 'ClearRestrictionsPassword';
        else $get_next = TRUE;       // Go around again to get another task (will always clear the bit for this task type)
      } elseif ($mask & RequestMirroring) {                                                                                                       // 22
        $task_type = RequestMirroring;
        $task = Task_first_for_type($target, 'RequestMirroring');
        if (!$task) DieInternalError(__FUNCTION__.": Corresponding mdm_task not found for singleton command 'RequestMirroring'");

        $params = CV($task, 'params');
        $request_hash['Command']['RequestType']         = 'RequestMirroring';
        $request_hash['Command']['DestinationName']     = $params['DestinationName'];
        // osx doesn't work with lower case device id, duh!
        $request_hash['Command']['DestinationDeviceID'] = strtoupper($params['DestinationDeviceID']);
        $request_hash['Command']['ScanTime']            = 60; // 60 seconds, range is 10 -300
        if (isset($params['Password'])) $request_hash['Command']['Password'] = $params['Password'];        // Password for a AppleTV placeholder is optional.
      } elseif ($mask & StopMirroring) {                                                                                                          // 21
        $task_type = StopMirroring;
        if (CV($target, 'IsSupervised')) $request_hash['Command']['RequestType'] = 'StopMirroring';
        else $get_next = TRUE;       // Go around again to get another task (will always clear the bit for this task type)
      } elseif ($mask & RefreshMDM) {                                                                                                             // 20
        // We need to send a new MDM binding profile
        $task_type = RefreshMDM;
        $profile = GenerateMDMBindingProfile(CV($target, 'mdm_acl'), CV($target, 'active_checkin_token'));
        $profile = base64_encode($profile);
        $request_hash['Command'] = [ 'RequestType' => 'InstallProfile',
                                     'Payload'     => new PlistData($profile, TRUE) ];
      } elseif ($mask & AllowActivationLock) {                                                                                                    // 19
        $task_type = AllowActivationLock;
        $request_hash['Command']['RequestType'] = 'Settings';
        $mdm_options = [ 'ActivationLockAllowedWhileSupervised' => true ];
        $request_hash['Command']['Settings']    = [ ['Item' => 'MDMOptions', 'MDMOptions' => $mdm_options] ];
      } elseif ($mask & UserList) {                                                                                                               // 18
          $task_type = UserList;
          if (Target_supports_multi_user_mode($target)) $request_hash['Command']['RequestType'] = 'UserList';
          else $get_next = TRUE;
      } elseif ($mask & OSUpdateStatus) {                                                                                                         // 17
        $task_type = OSUpdateStatus;
        if (Target_supports_os_updates($target)) $request_hash['Command']['RequestType'] = 'OSUpdateStatus';
        else $get_next = TRUE;
      } elseif ($mask & ScheduleOSUpdateScan) {                                                                                                   // 16
        $task_type = ScheduleOSUpdateScan;
        if (Target_is_mac($target, TRUE) && Target_supports_os_updates($target)) $request_hash['Command']['RequestType'] = 'ScheduleOSUpdateScan';
        else $get_next = TRUE;
      } elseif ($mask & DeviceInformation) {                                                                                                      // 15
        $task_type = DeviceInformation;
        if (!Target_is_lab_session($target)) {
          $queries = [ 'DeviceName', 'OSVersion', 'BuildVersion', 'ModelName', 'Model', 'ProductName', 'SerialNumber', 'DeviceCapacity',
                       'AvailableDeviceCapacity', 'IMEI', 'MEID', 'ModemFirmwareVersion', 'CellularTechnology', 'ICCID', 'BluetoothMAC', 'BatteryLevel',
                       'WiFiMAC', 'EthernetMAC', 'CurrentCarrierNetwork', 'SIMCarrierNetwork', 'SubscriberCarrierNetwork', 'CarrierSettingsVersion',
                       'PhoneNumber', 'IsSupervised', 'IsDeviceLocatorServiceEnabled', 'IsDoNotDisturbInEffect', 'DeviceID', 'IsActivationLockEnabled',
                       'IsRoaming', 'DataRoamingEnabled', 'VoiceRoamingEnabled', 'PersonalHotspotEnabled', 'SubscriberMCC', 'SubscriberMNC',
                       'CurrentMCC', 'CurrentMNC', 'EASDeviceIdentifier', 'iTunesStoreAccountIsActive', 'IsCloudBackupEnabled', 'XsanConfiguration',
                       'LastCloudBackupDate', 'iTunesStoreAccountHash', 'ActiveManagedUsers', 'LocalHostName', 'HostName', 'OSUpdateSettings',
                       'SystemIntegrityProtectionEnabled', 'AutoSetupAdminAccounts', 'IsMDMLostModeEnabled', 'IsMultiUser', 'DiagnosticSubmissionEnabled', 'AppAnalyticsEnabled'];
        } else $queries = [ 'iTunesStoreAccountHash' ];
        $request_hash['Command'] = ['Queries' => $queries];    // We always and only pass these arguments for this command
        $request_hash['Command']['RequestType'] = 'DeviceInformation';
      } elseif ($mask & Restrictions) {                                                                                                           // 14
        $task_type = Restrictions;
        $request_hash['Command'] = ['ProfileRestrictions' => TRUE];    // We always and only pass these arguments for this command
        $request_hash['Command']['RequestType'] = 'Restrictions';
      } elseif ($mask & CertificateList) {                                                                                                        // 13
        $task_type = CertificateList;
        $request_hash['Command']['RequestType'] = 'CertificateList';
      } elseif ($mask & ProvisioningProfileList) {                                                                                                // 12
        $task_type = ProvisioningProfileList;
        $request_hash['Command']['RequestType'] = 'ProvisioningProfileList';
      } elseif ($mask & ProfileList) {                                                                                                            // 11
        $task_type = ProfileList;
        $request_hash['Command']['RequestType'] = 'ProfileList';
      } elseif ($mask & InstalledApplicationList) {                                                                                               // 10
        $task_type = InstalledApplicationList;
        $request_hash['Command']['RequestType'] = 'InstalledApplicationList';
      } elseif ($mask & ManagedApplicationList) {                                                                                                 //  9
        $task_type = ManagedApplicationList;
        if (Target_is_ios($target)) {    // This task doesn't apply to Macs
          $request_hash['Command']['RequestType'] = 'ManagedApplicationList';
        } else {
          ExecuteSQLFunction('dm_device_application_lists_updated', ['item_id' => CV($target, 'id')]); // We should have received the IAL on the prior request
          $get_next = TRUE;       // Go around again to get another task (will always clear the bit for this task type)
        }
      } elseif ($mask & ManagedMediaList) {                                                                                                       //  8
        $task_type = ManagedMediaList;
        if (Target_is_ios($target) && CompareVersionStrings(CV($target, 'OSVersion'), '8.0') >= 0) {    // This task doesn't apply to OSX and iOS < 8
          $request_hash['Command']['RequestType'] = 'ManagedMediaList';
        } else $get_next = TRUE;       // Go around again to get another task (will always clear the bit for this task type)
      } elseif ($mask & SecurityInfo) {                                                                                                           //  7
        $task_type = SecurityInfo;
        $request_hash['Command']['RequestType'] = 'SecurityInfo';
      } elseif ($mask & SetOrganizationInfo) {                                                                                                    //  6
        $task_type = SetOrganizationInfo;
        if (FromTable($target, 'devices') && (CV($target, 'mdm_acl') & 2048) != 0) {
          $settings = GetSettings();
          if (empty($settings['server_organization'])) DieInternalError(__FUNCTION__.": Missing server_organization for task 'SetOrganizationInfo'");
          $info = ['OrganizationMagic' => $settings['server_org_magic']];
          if (!empty($settings['server_organization'])) $info['OrganizationName']  = $settings['server_organization'];
          if (!empty($settings['email_address']))       $info['OrganizationEmail'] = $settings['email_address'];

          $request_hash['Command']['RequestType'] = 'Settings';
          $request_hash['Command']['Settings']    = [ ['Item' => 'OrganizationInfo', 'OrganizationInfo' => $info] ];
        } else $get_next = TRUE;       // Go around again to get another task (will always clear the bit for this task type)
      } elseif ($mask & RetrieveALBypassCode) {                                                                                                   //  5
        $task_type = RetrieveALBypassCode;
        if (CV($target, 'IsSupervised')) $request_hash['Command']['RequestType'] = 'ActivationLockBypassCode';
        else $get_next = TRUE;       // Go around again to get another task (will always clear the bit for this task type)
      } elseif ($mask & ClearALBypassCode) {                                                                                                      //  4
        $task_type = ClearALBypassCode;
        if (CV($target, 'IsSupervised')) $request_hash['Command']['RequestType'] = 'ClearActivationLockBypassCode';
        else $get_next = TRUE;       // Go around again to get another task (will always clear the bit for this task type)
      } elseif ($mask & ManagedApplicationFeedback) {                                                                                             //  3
        $task_type = ManagedApplicationFeedback;
        if (Target_is_ios($target) && Target_is_at_least_version($target, '7.0')) {
          $sql = "SELECT unique_identifier FROM installed_ios_applications WHERE device_id = :device_id AND status = 'managed'";
          $raw = ExecuteSQLAndFetchRaw('installed_ios_applications', $sql, [ 'device_id' =>  CV($target, 'id') ], TRUE);
        }
        if (!empty($raw)) {   // Will be empty for a Mac target (which doesn't support ManagedApplicationFeedback)
          $ids = [];
          foreach ($raw as $row) $ids[] = $row['unique_identifier'];
          $request_hash['Command'] = [ 'RequestType' => 'ManagedApplicationFeedback', 'DeleteFeedback' => TRUE, 'Identifiers' => $ids ];
        } else $get_next = TRUE;       // Go around again to get another task (will always clear the bit for this task type)
      } elseif ($mask & AvailableOSUpdates) {                                                                                                     //  2
        $task_type = AvailableOSUpdates;
        if (Target_supports_os_updates($target)) $request_hash['Command']['RequestType'] = 'AvailableOSUpdates';
        else $get_next = TRUE;
      } elseif ($mask & SetupConfiguration) {                                                                                                     //  1 LP
        $task_type = SetupConfiguration;
        $request_hash['Command']['RequestType'] = 'SetupConfiguration';
        $raw = ExecuteSQLFunction('dm_setup_assistant_config_for_device_id', [ 'device_id' => CV($target, 'id') ]);
        $json = (!empty($raw[0]) ? $raw[0]['dm_setup_assistant_config_for_device_id'] : NULL);
        if (!empty($json)) {
          $request_hash['Command'] = array_merge($request_hash['Command'], json_decode($json, TRUE));
          if (!empty($request_hash['Command']['AdminAccount'])) {
            $acct = $request_hash['Command']['AdminAccount'];
            $acct['passwordHash'] = new PlistData($acct['passwordHash'], TRUE); // TRUE -> already encoded in B64
            unset($acct['password']);
            unset($acct['password_verify']);
            $request_hash['Command']['AutoSetupAdminAccounts'] = [ $acct ];
            unset($request_hash['Command']['AdminAccount']);
          }
        } else {
          LogMsg('SetupConfiguration: dm_setup_assistant_config_for_device_id('.CV($target,'id').') returned an empty response.');
          $get_next = TRUE;      // No setup to send, move on
        }
      } elseif ($mask & DeviceConfigured) {                                                                                                       //  0 LP
        $task_type = DeviceConfigured;
        if (!$high_priority) {
          $request_hash['Command']['RequestType'] = 'DeviceConfigured';
        } else {
          $get_next = TRUE;
          SetCV($target, 'lp_singleton_tasks', (CV($target, 'lp_singleton_tasks') | DeviceConfigured));
        }
      } else DieInternalError(__FUNCTION__.': Unknown task mask '.$mask);
    } catch (Exception $e) {
      // Mark this task as failed
      if (IsTransactionFailure($e)) throw $e;   // Rethrow transaction conflict exceptions immediately so we can start over
      LogException($e);
      complete_singleton_tasks_for_target($target, $task_type, FALSE, FALSE, ['PHP_SERVER_ERROR' => $e->getMessage()]);
      $get_next = TRUE;
    } // try/catch

    $mask &= ~$task_type;   // Always clear the flag for this task, whether we generated a task for it or not
  } while ($get_next);

  // Clear the flag for this task from both high- and low-priority singletons
  if ($high_priority) {
    $hp = $mask;
    $lp = (CV($target, 'lp_singleton_tasks') & ~$task_type);
  } else {
    $hp = (CV($target, 'hp_singleton_tasks') & ~$task_type);
    $lp = $mask;
  }

  // Queue up a DeviceInformation task after the following task types complete. These tasks report their results
  // via a DeviceInformation query, so we need to run DeviceInformation to retrieve the results and update the UI
  // without having the Admin to run an UpdateInformation explicitly.
  if ($task_type == EnableLostMode || $task_type == DisableLostMode || $task_type == EnableDiagnosticSubmission || $task_type == DisableDiagnosticSubmission || $task_type == EnableAppAnalytics || $task_type == DisableAppAnalytics) $lp |= DeviceInformation;

  // PasscodeLockGracePeriod task reports enforced settings via SecurityInfo query, so queue one up after PasscodeLockGracePeriod task
  if ($task_type == PasscodeLockGracePeriod) $lp |= SecurityInfo;

  SetCVMulti($target, ['hp_singleton_tasks' => $hp, 'lp_singleton_tasks' => $lp, 'singleton_task_type' => $task_type, 'singleton_uuid' => $uuid]);
  if ($gLogLevel > 3) LogMsg(__FUNCTION__.": request_hash=\n".PrintArrayObscuringValuesForKeys($request_hash), 4);
  return $request_hash;
} // Task_generate_singleton_request

//-------------------------------------------------------------------------

function Task_generate_next_request($target, $need_sync_response, $user_config)
{
  global $TIMESTAMP_DATE_FORMAT, $gLogLevel;
  $target_is_task = FromTable($target, 'mdm_tasks');

  do {
    $get_next = FALSE;
    unset($task);
    // Always perform high-priority singleton tasks first, then look for any mdm_tasks, then the low-priority singleton tasks
    try {
      if (!$target_is_task) {
        $request_hash = Task_generate_singleton_request($target, TRUE, $user_config); // High-priority singletons
        if (!empty($request_hash)) break;

        $task = Task_first_for_target($target);
        if (empty($task) && $need_sync_response) {
          $blocked = Target_has_blocked_tasks(CV($target, 'id'));
          if ($blocked) {
            // The device is waiting on the blocked task(s). Rather than blocking here and consuming a valuable connection,
            // just send the device a ProvisioningProfileList task (essentially a NoOp) to have it come back in a bit when the task is (hopefully) unblocked
            LogMsg("Device in 'NeedSyncResponse' mode has $blocked blocked tasks, sending ProvisioningProfileList to keep it busy until tasks are unblocked.\n".Target_description($target));
            SetCV($target, 'hp_singleton_tasks', ProvisioningProfileList);  // No need to 'OR' this in--we won't be here unless this is currently 0
            $request_hash = Task_generate_singleton_request($target, TRUE, $user_config);
            break;
          }
        }
      } else $task = $target;

      if (!empty($task)) {
        $task_type = CV($task, 'task_type');

        // Set the UUID for this task
        $uuid = GenerateUUID();
        SetCV($task, 'uuid', $uuid);

        $is_ls = Target_is_lab_session($target);
        $request_hash = ['CommandUUID' => $uuid];
        switch ($task_type) {
        case 'InstallProfile':
          $pid = intval(CV($task, 'args'));
          if (empty($pid)) DieInternalError(__FUNCTION__.': No profile id specified for InstallProfile task');
          $profile = FindInDatabase('view_profiles', 'id', $pid);
          if (!$profile) DieInternalError(__FUNCTION__.": no profile found for id $pid");

          // See if this is a device that can't handle changing from signed profiles to unsigned profiles.
          // If it is, always sign the profile. Currently this is all versions of iOS 5, 6 and 7.
          $force_signed = (Target_is_ios($target) && preg_match("/^[5-7]\.[0-9]+.*/", CV($target, 'OSVersion')));
          if ($force_signed) {
            $pkcs12 = GetSigningIdentity();
            if (empty($pkcs12)) $force_signed = FALSE;    // No signing identity, so don't bother with the B64 decode/re-encode
          }

          // Do we need to perform any substitutions? When we do, the profile's profile_cache holds an XML PList representation of the profile.
          // Otherwise, the data is already base64-encoded and ready to go.
          $profile_data = CV($profile, 'profile_cache');
          $subKeys      = CV($profile, 'substitution_keys');
          // All keys are lower cased
          $sharedDeviceFilterKeys = [ 'password',                                                                                                               // Generic
                                      'ldapaccountpassword',                                                                                                    // LDAP
                                      'carddavpassword',                                                                                                        // CardDAV
                                      'caldavpassword',                                                                                                         // CalDAV
                                      'subcalaccountpassword',                                                                                                  // Subscription Calendar
                                      'certificate', 'certificatename', 'certificatepassword', 'payloadcertificateuuid',                                        // EAS
                                      'incomingpassword', 'outgoingpassword', 'smimeenabled', 'smimedigningcertificateuuid', 'smimeencryptioncertificateuuid',  // Email
                                    ];

          if ($subKeys) {   // We must always run the following code if we have any substitutions as the profile cache is not base64-encoded
            $user = $device = NULL;
            // Filter out user sensitive data and payloads not supported for shared iPads
            $hash = (Target_is_ios_lab_session($target) ? plist_decode($profile_data, FALSE, $sharedDeviceFilterKeys) : NULL);
            if ($hash) {
              _filter_lab_session_payloads($hash);
              // Mark the task as failed if there are no payloads to be delivered
              if (empty($hash['PayloadContent'])) {
                LogMsg("InstallProfile task has no payloads configured.", 0);
                complete_task($task, FALSE);
                $get_next = TRUE;
                break;
              };
            }

            if ($subKeys & DeviceSubKeysMask) $device = ($is_ls ? LabSession_get_device($target) : $target);
            if ($subKeys & UserSubKeysMask)   $user   = ($is_ls ? LabSession_get_user($target)   : Device_get_user($target));
            if ($device || $user) {
              if (!$hash) $hash = plist_decode($profile_data, FALSE);                                                                // False to keep the __BOGUS__ keys in the plist. Those will be removed in the plist_encode_xml()

              $hash = ReplaceSubstitutionVariables($hash, $device, $user);
              $profile_data = plist_encode_xml($hash);
              if ($force_signed) $profile_data = SignData($profile_data, $pkcs12);
              $profile_data = base64_encode($profile_data);
            } else {                                                  // Nothing to substitute from, don't waste time with all the decoding and re-encoding, just base64 the profile cache and send it out
              if ($hash) $profile_data = plist_encode_xml($hash);     // We had to decode to possibly remove password from iOS lab sessions
              if ($force_signed) $profile_data = SignData($profile_data, $pkcs12);
              $profile_data = base64_encode($profile_data);
            }
          } elseif (Target_is_ios_lab_session($target)) {
              // Filter out user sensitive data and payloads not supported for shared iPads
              $hash = plist_decode(base64_decode($profile_data), FALSE, $sharedDeviceFilterKeys);  // False to keep the __BOGUS__ keys in the plist. Those will be removed in the plist_encode_xml()
              _filter_lab_session_payloads($hash);
              // Mark the task as failed if there are no payloads to be delivered
              if (empty($hash['PayloadContent'])) {
                LogMsg("InstallProfile task has no payloads configured.", 0);
                complete_task($task, FALSE);
                $get_next = TRUE;
                break;
              };
              $profile_data = plist_encode_xml($hash);
              if ($force_signed) $profile_data = SignData($profile_data, $pkcs12);
              $profile_data = base64_encode($profile_data);
          } elseif ($force_signed) $profile_data = base64_encode(SignData(base64_decode($profile_data), $pkcs12));

          if (!empty($profile_data)) {
            $profile_data = new PlistData($profile_data, TRUE);   // TRUE because the data is already base64-encoded

            // Record the updated_at on the profile in our list of profiles installed on the device
            // NOTE: If this InstallProfile task fails and is replacing an older instance of this profile
            //       we won't ever generate another InstallProfile task for this version of the profile
            //       (unless the old profile is deleted from the device). This is intentional behavior,
            //       since subsequent attempts to install this same version of the profile are likely
            //       to continue to fail. The admin needs to correct the problem with the profile, which
            //       will then bump the updated_at on the profile and we'll attempt to push again
            $task_id = CV($task, 'id');
            $updated = CV($profile, 'updated_at');
            $sql = 'UPDATE installed_profiles SET last_pushed = :last_pushed WHERE mdm_task_id = :mdm_task_id';
            ExecuteSQL('installed_profiles', $sql, ['last_pushed' => $updated, 'mdm_task_id' => $task_id]);

            $request_hash['Command'] = [ 'RequestType' => 'InstallProfile',
                                         'Payload'     => $profile_data ];
          } else DieInternalError("No profile_cache set on library item $pid");
          break;

        case 'RemoveProfile':
          $arg = CV($task, 'args');
          if (empty($arg)) DieInternalError(__FUNCTION__.': No profile specified for RemoveProfile task');
          $request_hash['Command'] = [ 'RequestType' => 'RemoveProfile',
                                       'Identifier'  => $arg ];
          break;

        case 'InstallApplication':
          $app_id = CV($task, 'args');
          if (empty($app_id)) DieInternalError(__FUNCTION__.': No application specified for InstallApplication task');
          // Look first for a VPP app
          $app_id = intval($app_id);
          if (($app = FindInDatabase('vpp_products', 'id', $app_id))) {
            $request_hash['Command'] = [ 'RequestType'     => 'InstallApplication',
                                         'iTunesStoreID'   => intval(CV($app, 'adam_id_str_ext')),
                                         'Options'         => ['PurchaseMethod'  => 1],
                                         'PurchaseMethod'  => 1,
                                         'ManagementFlags' => 1 ];
          } elseif (($app = FindInDatabase('enterprise_apps', 'id', $app_id))) {
            $node = (EmptyCV($target, 'active_checkin_token') ? 'vend_manifest' : 'mdm_vend_manifest');
            $request_hash['Command'] = [ 'RequestType'     => 'InstallApplication',
                                         'ManifestURL'     => URLBase().PM_PHP_NEW_URI_ROOT."/$node?uuid=".CV($app, 'uuid'),
                                         'ManagementFlags' => 1 ];
          } else DieInternalError(__FUNCTION__.": Invalid application id $app_id");

          // See if there is any configuration to install with this app
          $config = _get_app_configuration($task, CV($app, 'unique_identifier'));       // Sets stuff on 'params' ivar of the task
          if (!empty($config)) $request_hash['Command']['Configuration'] = $config;
          break;

        case 'InstallAppConfiguration':
          $bid = CV($task, 'args');
          $dict = [ 'Item' => 'ApplicationConfiguration', 'Identifier' => $bid ];
          $config = _get_app_configuration($task, $bid);       // Sets stuff on 'params' ivar of the task
          if (!empty($config)) $dict['Configuration'] = $config;
          $request_hash['Command'] = [ 'RequestType' => 'Settings', 'Settings' => [ $dict ] ];
          break;

        case 'RemoveApplication':
          $arg = CV($task, 'args');
          if (empty($arg)) DieInternalError(__FUNCTION__.': No application specified for RemoveApplication task');
          $request_hash['Command'] = [ 'RequestType' => 'RemoveApplication',
                                       'Identifier'  => $arg ];
          break;

        case 'RemoveAppConfiguration':
          $dict = [ 'Item' => 'ApplicationConfiguration', 'Identifier' => CV($task, 'args') ];
          $request_hash['Command'] = [ 'RequestType' => 'Settings', 'Settings' => [ $dict ] ];
          break;

        case 'InstallMedia':
          $book_id = CV($task, 'args');
          if (empty($book_id)) DieInternalError(__FUNCTION__.': No media specified for InstallMedia task');
          $book_id = intval($book_id);
          // We currently support only books
          if (($book = FindInDatabase('vpp_products', 'id', $book_id))) {
            $request_hash['Command'] = [ 'RequestType'     => 'InstallMedia',
                                         'iTunesStoreID'   => intval(CV($book, 'adam_id_str_ext')),
                                         'MediaType'       => 'Book' ];
          } elseif (($book = FindInDatabase('ebooks', 'id', $book_id))) {
            // Managed Books are only for iOS, so we must have a device target here
            $request_hash['Command'] = [ 'RequestType'     => 'InstallMedia',
                                         'MediaURL'        => URLBase().'/devicemanagement/book/'.CV($book, 'uuid'),
                                         'MediaType'       => 'Book',
                                         'Version'         => strtolower(CV($book, 'version')),
                                         'Kind'            => strtolower(CV($book, 'category')), // Its either pdf,epub or ibooks
                                         'PersistentID'    => CV($book, 'unique_identifier')];
          } else DieInternalError(__FUNCTION__.": Invalid book id '$book_id'");
          break;

        case 'RemoveMedia':
          $unique_id = CV($task, 'args');
          if (empty($unique_id)) DieInternalError(__FUNCTION__.': No media specified for RemoveMedia task');
          $request_hash['Command'] = [ 'RequestType'  => 'RemoveMedia',
                                       'MediaType'    => 'Book',
                                       'PersistentID' => $unique_id ];
          break;

        case 'RemoveMDM':
          $request_hash['Command'] = [ 'RequestType' => 'RemoveProfile',
                                       'Identifier'  => 'com.apple.config.'.GetServerHostname().'.mdm' ];
          break;

        case 'SendVPPInvitation':
          $settings = GetSettings();
          if ($settings['vpp_service_state'] != 3) DieInternalError(__FUNCTION.': VPP service is not enabled');
          $base = $settings['vpp_invitation_base_url'];
          if (empty($base)) DieInternalError(__FUNCTION__.': No vpp_invitation_base_url set');
          $code = CV($task, 'args');
          if (empty($code)) DieInternalError(__FUNCTION__.': No invitation code available');
          $url = str_replace('%inviteCode%', $code, $base);
          $request_hash['Command'] = ['RequestType'   => 'InviteToProgram',
                                      'ProgramID'     => 'com.apple.cloudvpp',
                                      'InvitationURL' => $url ];
          break;

        case 'SetDeviceName':
          if ($is_ls) DieInternalError(__FUNCTION__.": Failing 'SetDeviceName' command for Lab Session");
          if (!Target_is_mac($target) && !CV($target, 'IsSupervised')) DieInternalError(__FUNCTION__.": Failing 'SetDeviceName' command for unsupervised iOS device");
          $params = CV($task, 'params');
          $name   = ReplaceSubstitutionVariables($params['DeviceName'], $target, NULL);
          $request_hash['Command'] = ['RequestType' => 'Settings',
                                      'Settings'    => [ ['Item' => 'DeviceName', 'DeviceName' => $name ] ]
                                     ];
          SetCV($target, 'lp_singleton_tasks', CV($target, 'lp_singleton_tasks') | DeviceInformation);     // Run a device information task *after* to wrap things up
          break;

        case 'ScheduleOSUpdates':
          if ($is_ls) DieInternalError(__FUNCTION__.": Failing 'ScheduleOSUpdate' command for Lab Session");
          $it = CV($task, 'internal_task_id');
          $pk = CV($task, 'params');
          if (empty($pk) || empty($pk[0])) DieInternalError(__FUNCTION__.": 'ScheduleOSUpdate' command with no update requested");
          $pk = $pk[0];

          if (!empty($it)) {
            $it = FindInDatabase('internal_tasks', 'id', $it);
            $bind = [ 'library_item_id' => CV($it, 'library_item_id'), 'os_update_id' => CV($it, 'os_update_id') ];

            // Send the command based on the deepest internal_tasks row blocking the task
            $pend = FindBySQL('internal_tasks', "WHERE library_item_id = :library_item_id AND os_update_id = :os_update_id AND internal_task_id IS NULL", $bind);
            if (CV($pend, 'processing')) {    // We're waiting for this stage to complete, automatic updates scheduled by devicemgrd will let us advance.
              skip_task($task);
              $get_next = TRUE;
            } else {
              $request_hash['Command'] = [ 'RequestType' => 'ScheduleOSUpdate',
                                           'Updates'     => [ ['ProductKey' => $pk, 'InstallAction' => CV($pend, 'action')] ] ];
              SetCV($pend, 'processing', TRUE);     // Mark the internal_task as processing so we know we've sent the command
              SaveToDatabase($pend);
              // Schedule an OSUpdateStatus/AvailableOSUpdates command in case the action we just requested had already been completed
              if (Target_is_mac($target)) SetCV($target, 'hp_singleton_tasks', CV($target, 'hp_singleton_tasks') | AvailableOSUpdates);
              else SetCV($target, 'hp_singleton_tasks', CV($target, 'hp_singleton_tasks') | OSUpdateStatus);
            }
          } else {
            complete_task($task, TRUE);     // We probably shouldn't ever see this here, but if we do, the task has completed successfully
            $get_next = TRUE;
          }
          break;

        case 'SetAutoAdminPassword':
          $params = CV($task, 'params');
          if (empty($params) || empty($params['password_hash'])) DieInternalError(__FUNCTION__.": 'SetAutoAdminPassword' command with no password_hash");
          $pwd = new PlistData($params['password_hash'], TRUE);   // TRUE because the data is already base64-encoded

          $ext = Target_get_extended_data($target);
          $aa  = CVDA($ext, 'AutoSetupAdminAccounts');
          if (empty($aa) || empty($aa[0]) || empty($aa[0]['GUID'])) DieInternalError(__FUNCTION__.": 'SetAutoAdminPassword' command on device w/o 'AutoSetupAdminAccounts'");
          $guid = $aa[0]['GUID'];
          $request_hash['Command'] = [ 'RequestType'  => 'SetAutoAdminPassword',
                                       'GUID'         => $guid,
                                       'passwordHash' => $pwd ];
          break;

        case 'DeleteUser':
          if (!Target_supports_multi_user_mode($target)) DieInternalError(__FUNCTION__.": Invalid task 'DeleteUser' for non multi-user device");
          $maid   = CV($task, 'args');
          $forced = CV($task, 'params');
          if (empty($maid)) DieInternalError(__FUNCTION__.": 'DeleteUser' command with no UserName");
          $request_hash['Command'] = [ 'RequestType'    => 'DeleteUser',
                                       'UserName'       => $maid,
                                       'ForceDeletion'  => empty($forced) ? FALSE : $forced];
          break;

        case 'UpdateInformation':
        case 'EnrollDevice':
          complete_task($task, TRUE);
          $get_next = TRUE;
          break;

        default:  // An unknown or unexpected task, just mark it complete and move on
          DieInternalError(__FUNCTION__.": Unknown task of type '$task_type'");
        } // switch
      } else $request_hash = Task_generate_singleton_request($target, FALSE, $user_config);   // Low-priority singletons
    } catch (Exception $e) {
      if (IsTransactionFailure($e)) throw $e;   // Rethrow transaction conflict exceptions immediately so we can start over
      $get_next = TRUE;
      LogException($e);
      if (!empty($task)) complete_task($task, FALSE, FALSE, ['PHP_SERVER_ERROR' => $e->getMessage()]);
      unset($request_hash);
      // Fall out of the catch block and loop to the next task
    } // try/catch
  } while ($get_next && !$target_is_task);  // Can only loop to the next task for device targets, not individual tasks

  if (!empty($request_hash)) {
    LogMsg('Sending request "'.$request_hash['Command']['RequestType'].'" as CommandUUID='.$request_hash['CommandUUID'], 0);
    $request_plist = plist_encode_xml($request_hash);
    if (!$target_is_task) SetCV($target, 'processing_tasks', TRUE);
  } else {
    if (!$target_is_task) SetCV($target, 'processing_tasks', FALSE);
  }

  if (!empty($task)) SaveToDatabase($task);
  if (!$target_is_task) SaveToDatabase($target);

  if (empty($request_plist)) $request_plist = '';   // Make it the right kind of empty
  if ($gLogLevel > 2) LogMsg(__FUNCTION__.": request =\n$request_plist", 3);
  return $request_plist;
} // Task_generate_next_request

//-------------------------------------------------------------------------

// The caller will call SaveToDatabase() on $target
function Task_handle_error(&$target, $incoming_request)
{
  global $gLogLevel;

  $uuid = $incoming_request['CommandUUID'];
  if (isset($incoming_request['ErrorChain'])) {
    $err = $incoming_request['ErrorChain'];
    LogMsg(MAGENTA.'ErrorChain: '.PrintArrayObscuringValuesForKeys($err).PLAIN);
  } else $err = $incoming_request;

  $is_task = FromTable($target, 'mdm_tasks');
  if (!$is_task && strcasecmp(CV($target, 'singleton_uuid'), $uuid) === 0) {
    $singleton = CV($target, 'singleton_task_type');
    $chain = $err[0];
    if ($chain['ErrorDomain'] == 'MCMDMErrorDomain') {
      $code = $chain['ErrorCode'];
      if ($singleton == AvailableOSUpdates && ($code == 12048 || $code == 12050 || $code == 12077)) {
        if ($code == 12048) $incoming_request['AvailableOSUpdates'] = [ ];
        else unset($incoming_request['AvailableOSUpdates']);
        unset($incoming_request['ErrorChain']);
        return Task_handle_response($target, $incoming_request);
      } elseif ($singleton == OSUpdateStatus && ($code == 12021 || $code == 12077)) {
        // Some versions of OS X didn't implement support for this as promised. So when that happens, we have to fall back to a plain InstallASAP.
        // We do that by simply recording all the updates that were in the "Downloading" state as downloaded.
        // And iOS doesn't allow any OS Updates stuff while a user is logged in to a multi-user device
        if ($code == 12021) $incoming_request['OSUpdateStatus'] = [ [ 'not_supported' => true ] ];
        else unset($incoming_request['OSUpdateStatus']);        // Just turn the response into a NoOp
        unset($incoming_request['ErrorChain']);
        return Task_handle_response($target, $incoming_request);
      } elseif ($singleton == UserList && $code == 12021) {
        unset($incoming_request['UserList']);
        unset($incoming_request['ErrorChain']);
        return Task_handle_response($target, $incoming_request);
      }
    }

    SetCV($target, 'singleton_uuid', NULL);   // Don't clear this until we know we won't be calling Task_handle_response
    // Never flag an error (or stop processing) if the ALBC commands fail. The device probably just doesn't know what we're talking about.
    if ($singleton != RetrieveALBypassCode && $singleton != ClearALBypassCode) complete_singleton_tasks_for_target($target, $singleton, FALSE, FALSE, $err);
  } else {
    if (!$is_task) {
      $task = FindInDatabase('mdm_tasks', 'uuid', $uuid);
      if (!$task) {
        LogMsg(__FUNCTION__.": Task not found for UUID '$uuid'", 0);
        return;
      }
    } else $task = $target;

    $type = CV($task, 'task_type');
    if ($type == 'InstallApplication' && isset($incoming_request['RejectionReason'])) {
      $reason = $incoming_request['RejectionReason'];
      if ($reason == 'AppAlreadyInstalled' || $reason == 'AppAlreadyQueued') return Task_handle_response($target, $incoming_request);
    }

    if ($err && isset($err[0])) {
      $chain = $err[0];
      if (isset($chain['ErrorCode']) && isset($chain['ErrorDomain'])) {
        if ($chain['ErrorDomain'] == 'MCMDMErrorDomain') {
          $code = $chain['ErrorCode'];
          if ($type == 'RemoveApplication' && $code == 12029) return Task_handle_response($target, $incoming_request);  // ErrorCode 12029 is The app is not managed.
          elseif ($code == 12036) return Task_handle_response($target, $incoming_request);                              // ErrorCode 12036 is The app cannot be removed while it is being installed.
        }
      }
    }

    complete_task($task, FALSE, FALSE, $err);
    if ($gLogLevel > 1) LogMsg('incoming_request='.PrintArrayObscuringValuesForKeys($incoming_request).', task='.PrintArrayObscuringValuesForKeys($task), 2);
  }
} // Task_handle_error

//-------------------------------------------------------------------------

// The caller will call SaveToDatabase() on $target
function Task_handle_notnow(&$target, $incoming_request)
{
  if (FromTable($target, 'mdm_tasks')) return; // Just ignore this for RemoveMDM

  $uuid = $incoming_request['CommandUUID'];
  if (strcasecmp(CV($target, 'singleton_uuid'), $uuid) === 0) {
    // Just add the bit for the task we're skipping to the 'nn_singleton_tasks' column
    SetCV($target, 'nn_singleton_tasks', CV($target, 'nn_singleton_tasks') | CV($target, 'singleton_task_type'));
  } else {
    // Just update the task's timestamp and mark it skipped
    $sql = 'UPDATE mdm_tasks SET skipped = TRUE, updated_at = :updated_at WHERE uuid = :uuid';
    ExecuteSQL('mdm_tasks', $sql, ['updated_at' => kDMCurrentTimestamp, 'uuid' => $uuid]);
  }
} // Task_handle_notnow

//-------------------------------------------------------------------------

// The caller will call SaveToDatabase() on $target
function Task_handle_response(&$target, $incoming_request)
{
  global $kTaskTypeForSingleton;

  $uuid    = $incoming_request['CommandUUID'];
  $is_task = FromTable($target, 'mdm_tasks');
  if (!$is_task && strcasecmp(CV($target, 'singleton_uuid'), $uuid) === 0) {
    $singleton  = CV($target, 'singleton_task_type');
    $type       = $kTaskTypeForSingleton[$singleton];
    $is_ls      = Target_is_lab_session($target);
    $succeeded  = TRUE;

    // If this was an EraseDevice task, clear the last_checkin_time and token to make this device a placeholder
    if ($singleton != EraseDevice && $singleton != RemoveMDM && $singleton != EnableLostMode && $singleton != DisableLostMode) {   // The database handles these completely
      if (!$is_ls && !empty($incoming_request['QueryResponses'])) Device_set_unique_columns($target, $incoming_request['QueryResponses']);  // Might return with $target referring to a different row, so do this first!

      $tid       = CV($target, 'id');
      $dev_id    = ($is_ls ? CV($target, 'device_id') : $tid);
      $is_mac    = Target_is_mac($target);
      $ext       = NULL;
      $vals      = [ 'hp_singleton_tasks' => CV($target, 'hp_singleton_tasks'), 'lp_singleton_tasks' => CV($target, 'lp_singleton_tasks')];
      $ext_das   = [];    // The stuff that sits in dynamic_attributes
      $unset_das = [];    // Stuff that needs to be removed from dynamic attributes
      $queue_allow_albc_task  = FALSE;

      if (isset($incoming_request['ProfileList'])) {
        $list = $incoming_request['ProfileList'];

        // Parse, then save, as some stuff is pruned from the raw profile list
        _parse_profile_list($list, $tid, $is_ls);
        $ext = Target_get_extended_data($target);
        SetCVDA($ext, 'ProfileList', $list);

        // Check and start (if needed) an InstallProfile command
        DevicemgrdSend('throttledAutoUpdateAllProfilesForMDMTarget:%d', $tid);
      } // if 'ProfileList'

      if (isset($incoming_request['QueryResponses'])) {
        $query_responses = $incoming_request['QueryResponses'];
        foreach ($query_responses as $key => $val) {
          if     ($key == 'XsanConfiguration')  _update_xsan_configuration($val);
          elseif ($key == 'IsMultiUser')        $vals['is_multi_user'] = $val;
          elseif (ValidColumn($target, $key))   $vals[$key]    = $val;            // If it's in the device's schema, that's where it belongs
          else                                  $ext_das[$key] = $val;            // Otherwise, it goes in library_item_metadata.dynamic_attributes
        }

        // Remove the iTunesStoreAccountHash key from DA if it's not in the response from the device
        if (!array_key_exists('iTunesStoreAccountHash', $ext_das)) $unset_das[] = 'iTunesStoreAccountHash';

        if (!empty($vals['IsSupervised']) && CompareVersionStrings($vals['OSVersion'], '7.1') >= 0) {
          $vals['hp_singleton_tasks'] |= RetrieveALBypassCode;  // Always send retrieve bypass code command.

          // If we find out that device became supervised and we have to allow activation lock, we do so.
          if (!CV($target, 'IsSupervised') && _get_allow_activation_lock_setting($target) == 'Always') $queue_allow_albc_task = TRUE;
        }

        // If the device is a multi user device then scehdule a command to get the list of users and set the user quota on the device
        if (!empty($vals['is_multi_user'])) {
          $vals['hp_singleton_tasks'] |= UserList;
          if ($vals['lp_singleton_tasks'] & DeviceConfigured) $vals['lp_singleton_tasks'] |= UserQuota;                                     // Only if AwaitingConfiguration = 1 was returned in TokenUpdate
        }

        // Set flag for SetupConfiguration
        if (($vals['lp_singleton_tasks'] & DeviceConfigured) && Target_is_mac($target)) $vals['lp_singleton_tasks'] |= SetupConfiguration;  // Only if AwaitingConfiguration = 1 was returned in TokenUpdate

        if (isset($query_responses['ActiveManagedUsers'])) {
          $cur   = (empty($query_responses['CurrentConsoleManagedUser']) ? NULL : $query_responses['CurrentConsoleManagedUser']);
          $guids = [];
          foreach ($query_responses['ActiveManagedUsers'] AS $uuid) {
            $uuid = NormalizeUUID($uuid);
            if (!empty($uuid)) $guids[] = "'$uuid'::uuid";
          }
          $guids = (empty($guids) ? "NULL::uuid" : implode(',', $guids));       // Mark the lab_sessions as either logged in or not logged in
          $sql = <<<SQL
            UPDATE lab_sessions
            SET    last_checkin_time   = CASE WHEN user_guid IN ($guids) THEN (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') ELSE 'epoch' END,
                   last_not_on_console = COALESCE(user_guid <> :user_guid, FALSE)
            WHERE  device_id = :device_id
SQL;
          ExecuteSQL('lab_sessions', $sql, [ 'device_id' => $dev_id, 'user_guid' => $cur ]);
        } // if ('ActiveManagedUsers')
      } // if QueryResponse

      if (!$is_ls) {
        if (isset($incoming_request['GlobalRestrictions']))       $ext_das['GlobalRestrictions']      = $incoming_request['GlobalRestrictions'];
        if (isset($incoming_request['SecurityInfo']))             $ext_das['SecurityInfo']            = $incoming_request['SecurityInfo'];
        if (isset($incoming_request['ProvisioningProfileList']))  $ext_das['ProvisioningProfileList'] = $incoming_request['ProvisioningProfileList'];
        if (isset($incoming_request['ProfileRestrictions']))      $ext_das['ProfileRestrictions']     = $incoming_request['ProfileRestrictions'];

        if (isset($incoming_request['InstalledApplicationList'])) {
          $ial = $incoming_request['InstalledApplicationList'];
          $ext_das['InstalledApplicationList'] = $ial;
          // If we don't have an upcoming MAL request, tell devicemgrd to process the updated applications list
          if ((($vals['hp_singleton_tasks'] | $vals['lp_singleton_tasks']) & ManagedApplicationList) == 0) ExecuteSQLFunction('dm_device_application_lists_updated', ['item_id' => $tid]);
        } // if 'InstalledApplicationList'

        if (isset($incoming_request['ManagedApplicationList'])) {
          $mal = $incoming_request['ManagedApplicationList'];
          $ext_das['ManagedApplicationList'] = $mal;
          // If we don't have an upcoming IAL request, tell devicemgrd to process the updated applications list
          if ((($vals['hp_singleton_tasks'] | $vals['lp_singleton_tasks']) & InstalledApplicationList) == 0) ExecuteSQLFunction('dm_device_application_lists_updated', ['item_id' => $tid]);
        } // if 'ManagedApplicationList'

        if (isset($incoming_request['Books'])) {
          $mal = $incoming_request['Books'];
          $ext_das['Books'] = $mal;
          ExecuteSQLFunction('dm_device_media_lists_updated', ['item_id' => $tid]);
        } // if 'ManagedMediaList'

        if (isset($incoming_request['CertificateList'])) {
          $certificate_array = $incoming_request['CertificateList'];
          $certificate_list  = [];

          // Get the current CertificateList so we can be smart about changes and not re-parse stuff we already have
          if (empty($ext)) $ext = Target_get_extended_data($target);
          $old_cert_list = CVDA($ext, 'CertificateList');
          foreach ($certificate_array as $certificate_entry) {
            $encoded_cert = chunk_split(base64_encode($certificate_entry['Data']->rawData()), 76, "\n");  // Round trip so we can be sure to keep the same formatting as before
            $pem_cert = "-----BEGIN CERTIFICATE-----\n$encoded_cert-----END CERTIFICATE-----\n";
            $new_entry = [ 'CommonName' => isset($certificate_entry['CommonName']) ? $certificate_entry['CommonName'] : '',
                           'IsIdentity' => isset($certificate_entry['IsIdentity']) ? $certificate_entry['IsIdentity'] : FALSE,
                           'Data'       => $pem_cert ];

            if (!empty($old_cert_list)) {
              foreach ($old_cert_list as $old_cert) {
                if ($old_cert['CommonName'] == $new_entry['CommonName'] && $old_cert['IsIdentity'] == $new_entry['IsIdentity'] && $old_cert['Data'] == $new_entry['Data']) {
                  // Found a match, preserve any metadata on the existing entry
                  if (!empty($old_cert['metadata'])) $new_entry['metadata'] = $old_cert['metadata']; break;
                }
              }
            }
            $certificate_list[] = $new_entry;
          } // foreach $certificate_array
          $ext_das['CertificateList'] = $certificate_list;
          ExecuteSQLFunction('dm_device_certificate_list_updated', ['item_id' => $tid]);
        } // if 'CertificateList'

        if (!empty($incoming_request['ActivationLockBypassCode'])) {
          $vals['activation_lock_bypass_code'] = $incoming_request['ActivationLockBypassCode'];
          // TODO: This is probably better handled in the database
          $vals['hp_singleton_tasks'] |= ClearALBypassCode;  // Add the ClearActivationLockBypassCode command

          // If we see a new bypass code from the device and we have to allow activation lock if bypass code is available, we do so.
          if (_get_allow_activation_lock_setting($target) == 'Bypass' && !empty($vals['activation_lock_bypass_code'])) $queue_allow_albc_task = TRUE;
        } // if ActivationLockBypassCode

        if (!empty($incoming_request['ManagedApplicationFeedback'])) _dump_app_feedback($target, $incoming_request['ManagedApplicationFeedback']);

        if (isset($incoming_request['AvailableOSUpdates'])) {
          $ext_das['AvailableOSUpdates'] = $incoming_request['AvailableOSUpdates'];
          ExecuteSQLFunction('dm_device_available_os_updates_updated', ['item_id' => $tid]);
        }

        // OSUpdateStatus is currently supported by iOS only
        if (isset($incoming_request['OSUpdateStatus'])) {
          $ext_das['OSUpdateStatus'] = $incoming_request['OSUpdateStatus'];
          ExecuteSQLFunction('dm_device_os_update_status_updated', ['item_id' => $tid]);
          // If response is empty, schedule an AvailableOSUpdates command to find out about the installed updates
          if (empty($incoming_request['OSUpdateStatus'])) {
            $vals['hp_singleton_tasks'] |= AvailableOSUpdates;
          }
        }

        if (isset($incoming_request['Users'])) {
          $ext_das['UserList'] = $incoming_request['Users'];
          ExecuteSQLFunction('dm_device_user_list_updated', ['item_id' => $tid]);
        }

        // Mark 'RequestMirroring' task as succedded only if the response from the device is 'Prompting'
        if (!empty($incoming_request['MirroringResult']) && $incoming_request['MirroringResult'] != 'Prompting') $succeeded = FALSE;

        // DeviceLocation task
        if (isset($incoming_request['Latitude']) && isset($incoming_request['Longitude'])) {
          $ext_das['Latitude']  = $incoming_request['Latitude'];
          $ext_das['Longitude'] = $incoming_request['Longitude'];
        }

        SetCVMulti($target, $vals);

        // Activation Lock Bypass Code management for Supervised devices running iOS 7.1 and later.
        if ($queue_allow_albc_task) {
          SaveToDatabase($target);
          ExecuteSQLFunction('dm_create_basic_task_for_library_item', [ 'target_id' => CV($target, 'id'),
                                                                        'type'      => 'AllowActivationLock',
                                                                        'params'    => NULL ]);
          ReloadFromDatabase($target);
        }
      } // !$is_ls

      if (!empty($ext_das)) {
        if (empty($ext)) $ext = Target_get_extended_data($target);
        SetCVDAMulti($ext, $ext_das);
      }

      if (!empty($unset_das)) {
        if (empty($ext)) $ext = Target_get_extended_data($target);
        UnsetCVDAMulti($ext, $unset_das);
      }

      if (!empty($ext)) SaveToDatabase($ext);
    } // if ($singleton != EraseDevice && $singleton != RemoveMDM)

    // Don't mark the UpdateInformation/EnrollDevice mdm_task as complete until we've successfully completed the final high-priority singleton task (LastUpdateInfoCommand)
    if (($type != 'UpdateInformation' && $type != 'EnrollDevice') || $vals['hp_singleton_tasks'] < LastUpdateInfoCommand) complete_singleton_tasks_for_target($target, $singleton, $succeeded);
    if (!$is_ls && $singleton <= UserList && $singleton >= SecurityInfo) {
      SetCV($target, 'last_update_info_time', kDMCurrentTimestamp); // Update last_update_info_time for the target
    }
  } else {              // Must be a real task
    if (!$is_task) {
      $task = FindInDatabase('mdm_tasks', 'uuid', $uuid);
      if (empty($task)) {
        LogMsg(__FUNCTION__.": Task not found for UUID '$uuid'", 0);
        return;
      }

      $complete = TRUE;
      switch (CV($task, 'task_type')) {
      case 'RemoveApplication':
        // Update InstalledApplicationList if its a RemoveApplication task
        $did        = CV($task, 'mdm_target_id');
        $identifier = CV($task, 'args');

        $target = FindBySQL('devices', 'WHERE id = :id', ['id' => $did]);
        if (empty($target)) {
          LogMsg(__FUNCTION__.": Target not found for 'RemoveApplication' task with UUID '$uuid'", 0);
          return;
        }
        // Update extended data
        $ext = Target_get_extended_data($target);
        $installed_app_list = CVDA($ext, 'InstalledApplicationList');
        $index = 0;
        if (!empty($installed_app_list)) {
          foreach ($installed_app_list as $app_entry) {
            if ($app_entry['Identifier'] == $identifier) {
              array_splice($installed_app_list, $index, 1);
              SetCVDA($ext, 'InstalledApplicationList', $installed_app_list);
              SaveToDatabase($ext);
              break;
            }
            $index++;
          }
        }
        break;

      case 'ScheduleOSUpdates':
        $complete = FALSE;     // This task is completed when we get info from the device that the requested action is complete
        // We don't really care what InstallAction the device returns, we're going to monitor the status on the device and show the task progressing based on that
        if (!empty($incoming_request['UpdateResults'])) {
          $result = $incoming_request['UpdateResults'][0];
          if (!empty($result['Status'])) $status = $result['Status'];
          elseif (!empty($result['Result'])) {          // Hack to make incorrect OS X 10.11 implementation work
            $result['InstallAction'] = 'InstallASAP';   // This is the only InstallAction we'll send that OS X accepts
            $status = ($result['Result'] == 'Available' ? 'Installing' : 'InstallFailed');
          }
          if (isset($result['ErrorChain']) || $result['InstallAction'] == 'Error' || ($status != 'Downloading' && $status != 'Installing') && $status != 'Idle') {
            if (!isset($incoming_request['ErrorChain']) && isset($result['ErrorChain'])) $incoming_request['ErrorChain'] = $result['ErrorChain']; // Move to top where Task_handle_error() will see it
            Task_handle_error($task, $incoming_request);
          }
        }
        break;
      } // switch
    } else $task = $target;     // The target is the task (it's a RemoveMDM task)

    //////////////////////////////////////////////////////////////////////////
    // The database handles most cleanup when the task is marked succeeded. //
    //////////////////////////////////////////////////////////////////////////

    if ($complete) complete_task($task, TRUE);
  } // Real task
} // Task_handle_response

//-------------------------------------------------------------------------

function _dump_app_feedback(array $target, array $feedback)
{
  $sn = CV($target, 'SerialNumber');
  if (!empty($sn)) {
    $fb_path = PM_LOG_DIR.'/app_feedback';
    if (!is_dir($fb_path)) mkdir($fb_path, 0750);

    foreach ($feedback as $dict) {
      if (!empty($dict['Identifier']) && !empty($dict['Feedback'])) {
        $id = $dict['Identifier'];
        $fb = $dict['Feedback'];
        if (empty($fb)) continue;

        $path = $fb_path.'/'.$sn;
        if (!is_dir($path)) mkdir($path, 0750);
        $path .= '/'.$id;
        if (!is_dir($path)) mkdir($path, 0750);
        $plist = plist_encode_xml($fb);
        if (!empty($plist)) {
          $path .= '/'.date('Y-m-d_His').'_feedback.plist';
          if (!file_put_contents($path, $plist)) LogMsg("Failed to write app feedback to $path!");
        } else LogMsg("Failed to create plist from app feedback:\n".PrintArrayObscuringValuesForKeys($fb));
      } else LogMsg("Ignoring invalid app feedback dictionary:\n".PrintArrayObscuringValuesForKeys($dict));
    } // foreach
  } else LogMsg('Unable to log app feedback because target device has no SerialNumber?!?');
} // _dump_app_feedback

//-------------------------------------------------------------------------

function _get_allow_activation_lock_setting(&$target)
{
  $allow_activation_lock_setting = null;
  $enrollment_settings = _get_enrollment_settings($target);
  if ($enrollment_settings) {
    $allow_activation_lock_setting = CV($enrollment_settings, 'allow_activation_lock');
  }
  return $allow_activation_lock_setting;
} // _get_allow_activation_lock_setting

//-------------------------------------------------------------------------

function _get_app_configuration(&$task, $bid)
{
  $did = CV($task, 'mdm_target_id');
  $truth = FindBySQL('view_truth_app_configurations', 'WHERE device_id = :device_id AND unique_identifier = :unique_identifier', ['device_id' => $did, 'unique_identifier' => $bid]);
  if (empty($truth)) return NULL;

  $cid = CV($truth, 'app_config_id');
  $config = FindInDatabase('app_configurations', 'id', $cid);
  if (!empty($config)) {
    LogMsg("Found App Config $cid for device $did, unique_identifier '$bid'", 2);
    $plist = CVDA($config, 'Configuration');
    SetCV($task, 'params', ['id' => $cid, 'version' => CV($config, 'settings_version')]);  // Save app config ID and version so we can put them on the 'ia' row when the task is acknowledged
    if (empty($plist)) {
      LogMsg("App Config $cid has no 'Configuration' specified, removing configuration from device.", 2);
      $config = NULL;
    } else $config = plist_decode($plist);
  }
  return $config;
} // _get_app_configuration

//-------------------------------------------------------------------------

function _get_enrollment_settings(&$target)
{
  $enrollment_settings = null;
  $function_name = 'dm_device_enrollment_settings_for_device';
  $result = ExecuteSQLFunction($function_name, [ 'd_id' => CV($target, 'id') ]);
  if ($result && count($result) > 0) {
    $enrollment_settings_id = $result[0][$function_name];
    $enrollment_settings = FindInDatabase('device_enrollment_settings', 'id', $enrollment_settings_id);
  }
  return $enrollment_settings;
} // _get_enrollment_settings

//-------------------------------------------------------------------------

function _parse_profile_list(&$list, $tid, $is_ls)
{
  ////////////////////////////////////////////////////////////////////////////
  // Parse the ProfileList to figure out which push profiles are installed. //
  ////////////////////////////////////////////////////////////////////////////
  $bind = ['mdm_target_id' => $tid];

  // Get the ids of all the existing 'ip' rows (that we can delete--rows for pending installations shouldn't ever be deleted)
  // for this target so we know what we don't find and can remove the rows representing the removed profiles.
  $sql = <<<SQL
    SELECT    i.id
    FROM      installed_profiles AS i
    LEFT JOIN mdm_tasks          AS t ON (i.mdm_task_id = t.id)
    WHERE     i.mdm_target_id = :mdm_target_id
      AND     t.task_type IS DISTINCT FROM 'InstallProfile'  -- Will also match task_type IS NULL, which means there is no task on the ip row
SQL;
  $result = ExecuteSQLAndFetchRaw('installed_profiles', $sql, $bind, TRUE);
  $ids = [];
  if (!empty($result)) {
    foreach ($result as $row) { // Flatten the ids into a single array (it comes back from the query an an array of single-entry arrays
      $id = $row['id'];
      $ids[$id] = $id;
    }
  }

  foreach ($list as &$entry) {
    if (isset($entry['PayloadContent'])) {
      foreach($entry['PayloadContent'] as &$sub_entry) unset($sub_entry['PayloadContent']);
    }
    unset($entry['SignerCertificates']);

    if (empty($entry['PayloadUUID'])) continue;

    $uuid = NormalizeUUID($entry['PayloadUUID']);
    if (empty($uuid)) continue;   // Not a profile we care about

    $profile = FindInDatabase('view_profiles', 'uuid', $uuid);
    if ($profile && !CV($profile, 'is_manual')) {     // Don't track manually-installed profiles!
      $bind['profile_id'] = CV($profile, 'id');
      unset($bind['identifier']);
      $ipd = FindBySQL('installed_profiles', 'WHERE mdm_target_id = :mdm_target_id AND profile_id = :profile_id', $bind);
    } else {
      // See if this is a profile we pushed but no longer have any record of
      $ident = $entry['PayloadIdentifier'];
      if (!empty($ident) && strpos($ident, 'com.apple.mdm.'.GetServerHostname()) === 0 && substr($ident, -7) == '.pushed') {
        $bind['identifier'] = $ident;
        unset($bind['profile_id']);
        $ipd = FindBySQL('installed_profiles', 'WHERE mdm_target_id = :mdm_target_id AND identifier = :identifier', $bind);
      } else continue;  // Not a profile we care about
    }

    if (!$ipd) {
      $ipd = NewRecordForTable('installed_profiles');
      SetCVMulti($ipd, $bind);
      SaveToDatabase($ipd, FALSE);  // FALSE to skip updating timestamps, which this table doesn't have
    } else {
      // Remove this from the found list
      $id = CV($ipd, 'id');
      unset($ids[$id]);
    }
  } // foreach 'ProfileList'

  // Remove any 'ipd' rows that exist but weren't found in the ProfileList (i.e., the ids left in $ids)
  if (count($ids) > 0) {
    $ids = implode(',', $ids);
    $sql = "DELETE FROM installed_profiles WHERE id IN ($ids)";
    LogMsg(__FUNCTION__.": $sql", 2);
    ExecuteSQL('installed_profiles', $sql, []);
  }
} // _parse_profile_list

//-------------------------------------------------------------------------

function _filter_lab_session_payloads(&$hash)
{
  if (empty($hash) || empty($hash['PayloadContent'])) return;

  $new_list = [];
  $old_list = $hash['PayloadContent'];
  // Whitelist payloads (all lower cased)
  $lab_session_payloads = [ 'com.apple.homescreenlayout',
                            'com.apple.notificationsettings',
                            'com.apple.applicationaccess',
                            'com.apple.domains',
                            'com.apple.mail.managed',
                            'com.apple.subscribedcalendar.account',
                            'com.apple.caldav.account',
                            'com.apple.ldap.account',
                            'com.apple.carddav.account',
                            'com.apple.eas.account',
                            'com.apple.google-oauth',
                            'com.apple.webclip.managed' ];

  // Filter out payloads not supported by the devices
  foreach ($old_list as $entry) {
    if (isset($entry['PayloadType'])) {
      $payload_type = strtolower($entry['PayloadType']);
      if (in_array($payload_type, $lab_session_payloads)) {
        $new_list[] = $entry;
      } else LogMsg("Filtering unsupported payload type: $payload_type", 0);
    } // if isset
  } // foreach $old_list

  $hash['PayloadContent'] = $new_list;
} // _filter_lab_session_payloads

//-------------------------------------------------------------------------

function _update_xsan_configuration($conf)
{
  if (empty($conf['role']) || $conf['role'] == 'Unconfigured' ||
      empty($conf['sanUUID']) || empty($conf['sanName']) || empty($conf['sanConfigURLs']) || empty($conf['sanAuthMethod']) || empty($conf['sharedSecret'])) return;

  $attrs = [ 'name' => $conf['sanName'], 'san_config_urls' => $conf['sanConfigURLs'], 'san_auth_method' => $conf['sanAuthMethod'], 'san_auth_secret' => $conf['sharedSecret'] ];
  $uuid  = $conf['sanUUID'];
  $xsan  = FindInDatabase('xsan_networks', 'uuid', $uuid);
  if (empty($xsan)) {
    $xsan = NewRecordForTable('xsan_networks');
    $attrs['uuid'] = $uuid;
  }
  SetCVMulti($xsan, $attrs);
  SaveToDatabase($xsan);
} // _update_xsan_configuration
