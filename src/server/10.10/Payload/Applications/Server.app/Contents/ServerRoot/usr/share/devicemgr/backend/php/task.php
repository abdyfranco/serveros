<?php
// -------------------------------------------------------------------------
// Copyright (c) 2015 Apple Inc. All rights reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//-------------------------------------------------------------------------

require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/ota_service_common.php");

define('EraseDevice',              1 << 30);    // Param => PIN for Macs
define('RemoveMDM',                1 << 29);
define('DeviceLock',               1 << 27);    // Param => PIN
define('ClearPasscode',            1 << 24);
define('ClearRestrictionsPasscode',1 << 23);
define('RequestMirroring',         1 << 22);
define('StopMirroring',            1 << 21);
define('RefreshMDM',               1 << 20);
define('AllowActivationLock',      1 << 19);
define('DeviceInformation',        1 << 15);
define('Restrictions',             1 << 14);
define('CertificateList',          1 << 13);
define('ProvisioningProfileList',  1 << 12);
define('ProfileList',              1 << 11);
define('InstalledApplicationList', 1 << 10);    // IAL must be before MAL, as we build the main table from IAL and supplement it from MAL
define('ManagedApplicationList',   1 << 9);
define('ManagedMediaList',         1 << 8);
define('SecurityInfo',             1 << 7);
define('SetOrganizationInfo',      1 << 6);     // We bury this with UpdateInformation, and must come after at least the 'DeviceInformation' request, as it's iOS 7 and later only
define('RetrieveALBypassCode',     1 << 5);
define('ClearALBypassCode',        1 << 4);
define('LastUpdateInfoCommand',    ClearALBypassCode);  // The last command we can run as part of UpdateInformation

$kTaskTypeForSingleton = [ RemoveMDM                  => 'RemoveMDM',
                           EraseDevice                => 'EraseDevice',
                           DeviceLock                 => 'DeviceLock',
                           ClearPasscode              => 'ClearPasscode',
                           ClearRestrictionsPasscode  => 'ClearRestrictionsPasscode',
                           RequestMirroring           => 'RequestMirroring',
                           StopMirroring              => 'StopMirroring',
                           RefreshMDM                 => 'EnrollDevice',      // This is essentially a re-enroll command
                           DeviceInformation          => 'UpdateInformation',
                           Restrictions               => 'UpdateInformation',
                           CertificateList            => 'UpdateInformation',
                           ProvisioningProfileList    => 'UpdateInformation',
                           ProfileList                => 'UpdateInformation',
                           ManagedApplicationList     => 'UpdateInformation',
                           ManagedMediaList           => 'UpdateInformation',
                           InstalledApplicationList   => 'UpdateInformation',
                           SecurityInfo               => 'UpdateInformation',
                           SetOrganizationInfo        => 'UpdateInformation',
                           RetrieveALBypassCode       => 'UpdateInformation',
                           ClearALBypassCode          => 'UpdateInformation',
                           AllowActivationLock        => 'AllowActivationLock' ];

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
  SetCV($task, 'params', $error_chain);
  SetCV($task, 'succeeded', ($canceled ? -1 : ($succeed ? 1 : 0)));
  // SetCV($task, 'completed_at', kDMCurrentTimestamp);
  SaveToDatabase($task, FALSE);  // Triggers in the DB will handle updating the parent library_item_task's counts and such
} // complete_task

//-------------------------------------------------------------------------

function get_profile_identifier($profile)
{
  $host = GetServerHostname();
  $type = (CV($profile, 'is_a_la_carte') ? 'alacarte' : 'pushed');
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
  SaveToDatabsae($task);
} // skip_task

//-------------------------------------------------------------------------

function Task_first_for_target($target)
{
  $sql = <<<SQL
WHERE    mdm_target_id = :mdm_target_id
  AND    internal_task_id IS NULL
  AND    completed_at     IS NULL
  AND    skipped          IS NOT TRUE
ORDER BY updated_at ASC, id ASC
LIMIT    1
SQL;
  $task = FindBySQL('mdm_tasks', $sql, ['mdm_target_id' => CV($target, 'id')], 'FOR UPDATE');

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
  AND    skipped          IS NOT TRUE
ORDER BY updated_at ASC
LIMIT    1
SQL;
  $task = FindBySQL("mdm_tasks", $sql, ['mdm_target_id' => CV($target, 'id'), 'task_type' => $type], 'FOR UPDATE');
  return $task;
} // Task_first_for_type

//-------------------------------------------------------------------------

// The caller will call SaveToDatabase() on $target
function Task_generate_singleton_request(&$target, $high_priority)
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

    $get_next = FALSE;
    try {
      $request_hash = ['Command' => [], 'CommandUUID' => $uuid];

      if ($mask & EraseDevice) {
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
      } elseif ($mask & RemoveMDM) {
        $task_type = RemoveMDM;
        $request_hash['Command'] = [ 'RequestType' => 'RemoveProfile',
                                     'Identifier'  => 'com.apple.config.'.GetServerHostname().'.mdm' ];
      } elseif ($mask & DeviceLock) {
        $task_type = DeviceLock;
        if (Target_is_lab_session($target)) DieInternalError(__FUNCTION__.": Invalid task 'DeviceLock' for LabSession");
        $task = Task_first_for_type($target, 'DeviceLock');
        if (!$task) DieInternalError(__FUNCTION__.": Corresponding mdm_task not found for singleton command 'DeviceLock'");

        $pin = CV($task, 'params');
        if (!empty($pin)) $pin = (!empty($pin['PIN']) ? $pin['PIN'] : NULL);
        if (empty($pin) && Target_is_mac($target)) DieInternalError(__FUNCTION__.": No PIN set for 'DeviceLock' task on an OS X device.");

        $request_hash['Command']['RequestType'] = 'DeviceLock';
        if (!empty($pin)) $request_hash['Command']['PIN'] = $pin;
      } elseif ($mask & ClearPasscode) {
        $task_type = ClearPasscode;
        if (Target_is_lab_session($target)) DieInternalError(__FUNCTION__.": Invalid task 'ClearPasscode' for LabSession");
        $request_hash['Command']['RequestType'] = "ClearPasscode";
        $ext = Target_get_extended_data($target);
        $token = CVDA($ext, 'unlock_token');
        if (!empty($token)) $request_hash['Command']["UnlockToken"] = new PlistData($token, TRUE);  // TRUE => $token is pre-encoded
      } elseif ($mask & ClearRestrictionsPasscode) {
        $task_type = ClearRestrictionsPasscode;
        if (CV($target, 'IsSupervised')) $request_hash['Command']['RequestType'] = 'ClearRestrictionsPassword';
        else $get_next = TRUE;       // Go around again to get another task (will always clear the bit for this task type)        
      } elseif ($mask & RequestMirroring) {
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
      } elseif ($mask & StopMirroring) {
        $task_type = StopMirroring;
        if (CV($target, 'IsSupervised')) $request_hash['Command']['RequestType'] = 'StopMirroring';
        else $get_next = TRUE;       // Go around again to get another task (will always clear the bit for this task type)        
      } elseif ($mask & RefreshMDM) {
        // We need to send a new MDM binding profile
        $task_type = RefreshMDM;
        $profile = GenerateMDMBindingProfile(CV($target, 'mdm_acl'), CV($target, 'active_checkin_token'));
        $profile = base64_encode($profile);
        $request_hash['Command'] = [ 'RequestType' => 'InstallProfile',
                                     'Payload'     => new PlistData($profile, TRUE) ];
      } elseif ($mask & DeviceInformation) {
        $task_type = DeviceInformation;
        if (Target_is_lab_session($target)) $queries = [ "iTunesStoreAccountHash" ];
        else $queries = [ "DeviceName", "OSVersion", "BuildVersion", "ModelName", "Model", "ProductName", "SerialNumber", "DeviceCapacity", 
                          "AvailableDeviceCapacity", "IMEI", "MEID", "ModemFirmwareVersion", "CellularTechnology", "ICCID", "BluetoothMAC", "BatteryLevel",
                          "WiFiMAC", "EthernetMAC", "CurrentCarrierNetwork", "SIMCarrierNetwork", "SubscriberCarrierNetwork", "CarrierSettingsVersion",
                          "PhoneNumber", "IsSupervised", "IsDeviceLocatorServiceEnabled", "IsDoNotDisturbInEffect", "DeviceID", "IsActivationLockEnabled",
                          "IsRoaming", "DataRoamingEnabled", "VoiceRoamingEnabled", "PersonalHotspotEnabled", "SubscriberMCC", "SubscriberMNC",
                          "CurrentMCC", "CurrentMNC", "EASDeviceIdentifier", "iTunesStoreAccountIsActive", "IsCloudBackupEnabled", "XsanConfiguration", 
                          "LastCloudBackupDate", "iTunesStoreAccountHash" ];
        $request_hash['Command'] = ["Queries" => $queries];    // We always and only pass these arguments for this command
        $request_hash['Command']['RequestType'] = 'DeviceInformation';
      } elseif ($mask & Restrictions) {
        $task_type = Restrictions;
        $request_hash['Command'] = ["ProfileRestrictions" => TRUE];    // We always and only pass these arguments for this command
        $request_hash['Command']['RequestType'] = 'Restrictions';
      } elseif ($mask & CertificateList) {
        $task_type = CertificateList;
        $request_hash['Command']['RequestType'] = 'CertificateList';
      } elseif ($mask & ProvisioningProfileList) {
        $task_type = ProvisioningProfileList;
        $request_hash['Command']['RequestType'] = 'ProvisioningProfileList';
      } elseif ($mask & ProfileList) {
        $task_type = ProfileList;
        $request_hash['Command']['RequestType'] = 'ProfileList';
      } elseif ($mask & InstalledApplicationList) {
        $task_type = InstalledApplicationList;
        $request_hash['Command']['RequestType'] = 'InstalledApplicationList';
      } elseif ($mask & ManagedApplicationList) {
        $task_type = ManagedApplicationList;
        if (Target_is_ios($target)) {    // This task doesn't apply to Macs
          $request_hash['Command']['RequestType'] = 'ManagedApplicationList';
        } else {
          ExecuteSQLFunction('dm_device_application_lists_updated', ['item_id' => CV($target, 'id')]); // We should have received the IAL on the prior request
          $get_next = TRUE;       // Go around again to get another task (will always clear the bit for this task type)
        }
      } elseif ($mask & ManagedMediaList) {
        $task_type = ManagedMediaList;
        if (Target_is_ios($target) && CompareVersionStrings(CV($target, 'OSVersion'), '8.0') >= 0) {    // This task doesn't apply to OSX and iOS < 8
          $request_hash['Command']['RequestType'] = 'ManagedMediaList';
        } else $get_next = TRUE;       // Go around again to get another task (will always clear the bit for this task type)
      } elseif ($mask & SecurityInfo) {
        $task_type = SecurityInfo;
        $request_hash['Command']['RequestType'] = 'SecurityInfo';
      } elseif ($mask & SetOrganizationInfo) {
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
      } elseif ($mask & RetrieveALBypassCode) {
        $task_type = RetrieveALBypassCode;
        if (CV($target, 'IsSupervised')) $request_hash['Command']['RequestType'] = 'ActivationLockBypassCode';
        else $get_next = TRUE;       // Go around again to get another task (will always clear the bit for this task type)
      } elseif ($mask & ClearALBypassCode) {
        $task_type = ClearALBypassCode;
        if (CV($target, 'IsSupervised')) $request_hash['Command']['RequestType'] = 'ClearActivationLockBypassCode';
        else $get_next = TRUE;       // Go around again to get another task (will always clear the bit for this task type)
      } elseif ($mask & AllowActivationLock) {
        $task_type = AllowActivationLock;
        $request_hash['Command']['RequestType'] = 'Settings';
        $mdm_options = [ 'ActivationLockAllowedWhileSupervised' => true];
        $request_hash['Command']['Settings']    = [ ['Item' => 'MDMOptions', 'MDMOptions' => $mdm_options] ];
      } else DieInternalError(__FUNCTION__.": Unknown task mask ".$mask);
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
    $lp = CV($target, 'lp_singleton_tasks') & ~$task_type;
  } else {
    $hp = CV($target, 'hp_singleton_tasks') & ~$task_type;
    $lp = $mask;
  }
  SetCVMulti($target, ['hp_singleton_tasks' => $hp, 'lp_singleton_tasks' => $lp, 'singleton_task_type' => $task_type, 'singleton_uuid' => $uuid]);
  if ($gLogLevel > 3) LogMsg(__FUNCTION__.": request_hash=\n".PrintArrayObscuringValuesForKeys($request_hash), 4);
  return $request_hash;
} // Task_generate_singleton_request

//-------------------------------------------------------------------------

function Task_generate_next_request($target, $need_sync_response)
{
  global $TIMESTAMP_DATE_FORMAT, $gLogLevel;
  $target_is_task = FromTable($target, 'mdm_tasks');

  do {
    $get_next = FALSE;
    unset($task);
    // Always perform high-priority singleton tasks first, then look for any mdm_tasks, then the low-priority singleton tasks
    try {
      if (!$target_is_task) {
        $request_hash = Task_generate_singleton_request($target, TRUE); // High-priority singletons
        if (!empty($request_hash)) break;

        $task = Task_first_for_target($target);
        if (empty($task) && $need_sync_response) {
          $blocked = Target_has_blocked_tasks(CV($target, 'id'));
          if ($blocked) {
            // The device is waiting on the blocked task(s). Rather than blocking here and consuming a valuable connection,
            // just send the device a ProvisioningProfileList task (essentially a NoOp) to have it come back in a bit when the task is (hopefully) unblocked
            LogMsg("Device in 'NeedSyncResponse' mode has $blocked blocked tasks, sending ProvisioningProfileList to keep it busy until tasks are unblocked.\n".Target_description($target));
            SetCV($target, 'hp_singleton_tasks', ProvisioningProfileList);  // No need to 'OR' this in--we won't be here unless this is currently 0
            $request_hash = Task_generate_singleton_request($target, TRUE);
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
          $pid = intval(CV($task, 'profile_id'));
          if (empty($pid)) DieInternalError(__FUNCTION__.": No profile specified for InstallProfile task");
          $profile = FindInDatabase('profiles', 'id', $pid);
          if (!$profile) DieInternalError(__FUNCTION__.": no profile found for profile_id $pid");

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
          $hasDSKeys = !EmptyCV($profile, 'device_substitution_keys');
          $hasUSKeys = !EmptyCV($profile, 'user_substitution_keys');
          if ($hasDSKeys || $hasUSKeys) {   // We must always run the following code if we have any substitutions as the profile cache is not base64-encoded
            $user = $device = NULL;
            if ($hasDSKeys) $device = ($is_ls ? LabSession_get_device($target) : $target);
            if ($hasUSKeys) $user   = ($is_ls ? LabSession_get_user($target)   : Device_get_user($target));
            if ($device || $user) {
              $hash = plist_decode($profile_data, FALSE); // False to keep the __BOGUS__ keys in the plist. Those will be removed in the plist_encode_xml()
              $hash = ReplaceSubstitutionVariables($hash, $device, $user);
              $profile_data = plist_encode_xml($hash);
              if ($force_signed) $profile_data = SignData($profile_data, $pkcs12);
              $profile_data = base64_encode($profile_data);
            } else {          // Nothing to substitute from, don't waste time with all the decoding and re-encoding, just base64 the profile cache and send it out
              if ($force_signed) $profile_data = SignData($profile_data, $pkcs12);
              $profile_data = base64_encode($profile_data);
            }
          } else if ($force_signed) $profile_data = base64_encode(SignData(base64_decode($profile_data), $pkcs12));
          
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
            $sql = "UPDATE installed_profiles SET last_pushed = :last_pushed WHERE mdm_task_id = :mdm_task_id";
            ExecuteSQL('installed_profiles', $sql, ['last_pushed' => $updated, 'mdm_task_id' => $task_id]);

            $request_hash['Command'] = [ 'RequestType' => 'InstallProfile',
                                         'Payload'     => $profile_data ];
          } else DieInternalError("No profile_cache set on profile $pid");
          break;

        case 'RemoveProfile':
          $arg = CV($task, 'args');
          if (empty($arg)) DieInternalError(__FUNCTION__.": No profile specified for RemoveProfile task");
          $request_hash['Command'] = [ 'RequestType' => 'RemoveProfile',
                                       'Identifier'  => $arg ];
          break;

        case 'InstallApplication':
          $app_id = CV($task, 'args');
          if (empty($app_id)) DieInternalError(__FUNCTION__.": No application specified for InstallApplication task");
          // Look first for a VPP app
          $app_id = intval($app_id);
          if (($app = FindInDatabase('vpp_products', 'id', $app_id))) {
            $request_hash['Command'] = [ 'RequestType'     => 'InstallApplication',
                                         'iTunesStoreID'   => CV($app, 'adam_id_ext'),
                                         'PurchaseMethod'  => 1,
                                         'ManagementFlags' => 1 ];
          } elseif (($app = FindInDatabase('enterprise_apps', 'id', $app_id))) {
            $node = (EmptyCV($target, 'active_checkin_token') ? 'vend_manifest' : 'mdm_vend_manifest');
            $request_hash['Command'] = [ 'RequestType'     => 'InstallApplication',
                                         'ManifestURL'     => URLBase().PM_PHP_NEW_URI_ROOT."/$node?uuid=".CV($app, 'uuid'),
                                         'ManagementFlags' => 1 ];
          } else DieInternalError(__FUNCTION__.": Invalid application id $app_id");
          break;

        case 'RemoveApplication':
          $arg = CV($task, 'args');
          if (empty($arg)) DieInternalError(__FUNCTION__.": No application specified for RemoveApplication task");
          $request_hash['Command'] = [ 'RequestType' => 'RemoveApplication',
                                       'Identifier'  => $arg ];
          break;

        case 'InstallMedia':
          $unique_id = CV($task, 'args');
          if (empty($unique_id)) DieInternalError(__FUNCTION__.": No media specified for InstallMedia task");
          // We currently support only books
          if (($book = FindInDatabase('vpp_products', 'unique_identifier', $unique_id))) {
            $request_hash['Command'] = [ 'RequestType'     => 'InstallMedia',
                                         'iTunesStoreID'   => CV($book, 'adam_id_ext'),
                                         'MediaType'       => 'Book' ];
          } elseif (($book = FindInDatabase('ebooks', 'unique_identifier', $unique_id))) {
            // Managed Books are only for iOS, so we must have a device target here
            $request_hash['Command'] = [ 'RequestType'     => 'InstallMedia',
                                         'MediaURL'        => URLBase()."/devicemanagement/book/".CV($book, 'uuid'),
                                         'MediaType'       => 'Book',
                                         'Version'         => strtolower(CV($book, 'version')),
                                         'Kind'            => strtolower(CV($book, 'category')), // Its either pdf,epub or ibooks
                                         'PersistentID'    => $unique_id];
          } else DieInternalError(__FUNCTION__.": Invalid book '$unique_id'");
          break;

        case 'RemoveMedia':
          $unique_id = CV($task, 'args');
          if (empty($unique_id)) DieInternalError(__FUNCTION__.": No media specified for RemoveMedia task");
          $request_hash['Command'] = [ 'RequestType'      => 'RemoveMedia',                                       
                                       'MediaType'        => 'Book',
                                       'PersistentID'     => $unique_id ];
          break;

        case 'RemoveMDM':
          $request_hash['Command'] = [ 'RequestType' => 'RemoveProfile',
                                       'Identifier'  => "com.apple.config.".GetServerHostname().".mdm" ];
          break;

        case 'SendVPPInvitation':
          $settings = GetSettings();
          if ($settings['vpp_service_state'] != 3) DieInternalError(__FUNCTION.": VPP service is not enabled");
          $base = $settings['vpp_invitation_base_url'];
          if (empty($base)) DieInternalError(__FUNCTION__.": No vpp_invitation_base_url set");
          $code = CV($task, 'args');
          if (empty($code)) DieInternalError(__FUNCTION__.": No invitation code available");
          $url = str_replace('%inviteCode%', $code, $base);
          $request_hash['Command'] = ['RequestType'   => 'InviteToProgram',
                                      'ProgramID'     => "com.apple.cloudvpp",
                                      'InvitationURL' => $url ];
          break;

        case 'SetDeviceName':
          if ($is_ls) DieInternalError(__FUNCTION__.": Failing 'SetDeviceName' command for Lab Session");
          if (!Target_is_mac($target) && !CV($target, 'IsSupervised')) DieInternalError(__FUNCTION__.": Failing 'SetDeviceName' command for unsupervised iOS device");
          $params = CV($task, 'params');
          $name   = ReplaceSubstitutionVariables($params['DeviceName'], $target, NULL);
          $request_hash['Command'] = ['RequestType' => 'Settings',
                                      'Settings'    => [ ['Item'       => 'DeviceName',
                                                          'DeviceName' => $name ] ]
                                     ];
          SetCV($target, 'lp_singleton_tasks', CV($target, 'lp_singleton_tasks') | DeviceInformation);  // Run a device information task *after* to wrap things up
          break;

        case 'UpdateInformation':
        case 'EnrollDevice':
          complete_task($task, TRUE);
          $get_next = TRUE;
          break;

        default:  // An unknown or unexpected task, just mark it complete and move on
          DieInternalError(__FUNCTION__.": Unknown task of type '$task_type'");
        } // switch
      } else $request_hash = Task_generate_singleton_request($target, FALSE);   // Low-priority singletons
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
    LogMsg("Sending request '".$request_hash['Command']['RequestType']."' as CommandUUID=".$request_hash["CommandUUID"], 0);
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
  $uuid = $incoming_request['CommandUUID'];
  if (isset($incoming_request["ErrorChain"])) {
    $err = $incoming_request["ErrorChain"];
    LogMsg("ErrorChain: ". PrintArrayObscuringValuesForKeys($err));
  } else $err = $incoming_request;
  $is_task = FromTable($target, 'mdm_tasks');
  if (!$is_task && strcasecmp(CV($target, 'singleton_uuid'), $uuid) === 0) {
    SetCV($target, 'singleton_uuid', NULL);
    $singleton = CV($target, 'singleton_task_type');
    // Never flag an error (or stop processing) if the ALBC commands fail. The device probably just doesn't know what we're talking about.
    if ($singleton != RetrieveALBypassCode && $singleton != ClearALBypassCode) complete_singleton_tasks_for_target($target, $singleton, FALSE, FALSE, $err);
  } else {
    if (!$is_task) {
      $task = FindInDatabase('mdm_tasks', 'uuid', $uuid, 'FOR UPDATE');
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
      if (isset($chain["ErrorCode"]) && isset($chain['ErrorDomain'])) {
        if ($chain['ErrorDomain'] == 'MCMDMErrorDomain') {
          $code = $chain["ErrorCode"];
          if ($type == "RemoveApplication" && $code == 12029) return Task_handle_response($target, $incoming_request);  // ErrorCode 12029 is The app is not managed.
          elseif ($code == 12036) return Task_handle_response($target, $incoming_request);                              // ErrorCode 12036 is The app cannot be removed while it is being installed.
        }
      }
    }

    complete_task($task, FALSE, FALSE, $err);
    LogMsg("incoming_request=".PrintArrayObscuringValuesForKeys($incoming_request).", task=".PrintArrayObscuringValuesForKeys($task), 2);
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
    $sql = "UPDATE mdm_tasks SET skipped = TRUE, updated_at = :updated_at WHERE uuid = :uuid";
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
    if ($singleton != EraseDevice && $singleton != RemoveMDM) {   // The database handles these completely
      $tid       = CV($target, 'id');
      $dev_id    = ($is_ls ? CV($target, 'device_id') : $tid);
      $is_mac    = Target_is_mac($target);
      $ext       = NULL;
      $vals      = [];
      $ext_das   = [];    // The stuff that sits in dynamic_attributes
      $unset_das = [];    // Stuff that needs to be removed from dynamic attributes
      $queue_allow_albc_task  = FALSE;

      if (isset($incoming_request['ProfileList'])) {
        $list = $incoming_request['ProfileList'];

        // Parse, then save, as some stuff is pruned from the raw profile list
        _parse_profile_list($list, $tid, $is_ls);
        $ext = Target_get_extended_data($target, 'FOR UPDATE');
        SetCVDA($ext, 'ProfileList', $list);

        // Check and start (if needed) an InstallProfile command
        ExecuteSQLFunction('dm_update_all_profiles_for_mdm_target', ['target_id' => $tid, 'is_sync' => TRUE]);
      } // if 'ProfileList'

      if (isset($incoming_request['QueryResponses'])) {
        $query_responses = $incoming_request['QueryResponses'];
        foreach ($query_responses as $key => $val) {
          if ($key == "XsanConfiguration")    _update_xsan_configuration($val);
          elseif (ValidColumn($target, $key)) $vals[$key]    = $val;  // If it's in the devices schema, that's where it belongs
          else                                $ext_das[$key] = $val;  // Otherwise, it goes in library_item_metadata.dynamic_attributes
        }

        // Remove the iTunesStoreAccountHash key from DA if it's not in the response from the device
        if(!array_key_exists('iTunesStoreAccountHash', $ext_das)) $unset_das[] = 'iTunesStoreAccountHash';

        if (!empty($vals['IsSupervised']) && CompareVersionStrings($vals['OSVersion'], '7.1') >= 0) {
          $vals['hp_singleton_tasks'] = (CV($target, 'hp_singleton_tasks') | RetrieveALBypassCode);  // Always send retrieve bypass code command.

          // If we find out that device became supervised and we have to allow activation lock, we do so.
          if (!CV($target, 'IsSupervised') && _get_allow_activation_lock_setting($target) == 'Always') {
            $queue_allow_albc_task = TRUE;
          }
        }
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
          if (((CV($target, 'hp_singleton_tasks') | CV($target, 'lp_singleton_tasks')) & ManagedApplicationList) == 0) {
            ExecuteSQLFunction('dm_device_application_lists_updated', ['item_id' => $tid]);
          }
        } // if 'InstalledApplicationList'

        if (isset($incoming_request['ManagedApplicationList'])) {
          $mal = $incoming_request['ManagedApplicationList'];
          $ext_das['ManagedApplicationList'] = $mal;
          // If we don't have an upcoming IAL request, tell devicemgrd to process the updated applications list
          if (((CV($target, 'hp_singleton_tasks') | CV($target, 'lp_singleton_tasks')) & InstalledApplicationList) == 0) {
            ExecuteSQLFunction('dm_device_application_lists_updated', ['item_id' => $tid]);
          }
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
          if (empty($ext)) $ext = Target_get_extended_data($target, 'FOR UPDATE');
          $old_cert_list = CVDA($ext, 'CertificateList');
          foreach ($certificate_array as $certificate_entry) {
            $encoded_cert = chunk_split(base64_encode($certificate_entry['Data']->rawData()), 76, "\n");  // Round trip so we can be sure to keep the same formatting as before
            $pem_cert = "-----BEGIN CERTIFICATE-----\n$encoded_cert-----END CERTIFICATE-----\n";
            $new_entry = [ 'CommonName' => isset($certificate_entry['CommonName']) ? $certificate_entry['CommonName'] : "",
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
          }
          $ext_das['CertificateList'] = $certificate_list;
          ExecuteSQLFunction('dm_device_certificate_list_updated', ['item_id' => $tid]);
        } // if 'CertificateList'

        if (!empty($incoming_request['ActivationLockBypassCode'])) {
          $vals['activation_lock_bypass_code'] = $incoming_request['ActivationLockBypassCode'];
          // TODO: This is probably better handled in the database
          $vals['hp_singleton_tasks'] = (CV($target, 'hp_singleton_tasks') | ClearALBypassCode);  // Add the ClearActivationLockBypassCode command

          // If we see a new bypass code from the device and we have to allow activation lock if bypass code is available, we do so.
          if (_get_allow_activation_lock_setting($target) == 'Bypass' && !empty($vals['activation_lock_bypass_code'])) {
            $queue_allow_albc_task = TRUE;
          }
        } // if ActivationLockBypassCode

        // Mark 'RequestMirroring' task as succedded only if the response from the device is 'Prompting'
        if (!empty($incoming_request['MirroringResult'])){
          if ($incoming_request['MirroringResult'] != 'Prompting') $succeeded = FALSE;
        } // if MirroringResult

        Device_set_unique_columns($target, $vals);  // Will leave values for non-unique columns in $vals. Also saves and re-loads $$target
        SetCVMulti($target, $vals);

        // Activation Lock Bypass Code management for Supervised devices running iOS 7.1 and later.
        if ($queue_allow_albc_task) {
          SaveToDatabase($target);
          ExecuteSQLFunction('dm_create_basic_task_for_library_item', [ 'target_type' => 'Device',
                                                                        'target_id'   => CV($target, 'id'),
                                                                        'type'        => 'AllowActivationLock',
                                                                        'params'      => NULL ]);
          ReloadFromDatabase($target);
        }        
      } // !$is_ls

      if (!empty($ext_das)) {
        if (empty($ext)) $ext = Target_get_extended_data($target, 'FOR UPDATE');
        SetCVDAMulti($ext, $ext_das);
      }

      if (!empty($unset_das)) {
        if (empty($ext)) $ext = Target_get_extended_data($target, 'FOR UPDATE');
        UnsetCVDAMulti($ext, $unset_das);
      }

      if (!empty($ext)) SaveToDatabase($ext);
    } // if ($singleton != EraseDevice && $singleton != RemoveMDM)

    // Don't mark the "UpdateInformation"/"EnrollDevice" mdm_task as complete until we've successfully completed the final high-priority singleton task (LastUpdateInfoCommand)
    if (($type != 'UpdateInformation' && $type != 'EnrollDevice') || CV($target, 'hp_singleton_tasks') < LastUpdateInfoCommand) complete_singleton_tasks_for_target($target, $singleton, $succeeded);
    if (!$is_ls && $singleton <= DeviceInformation && $singleton >= SecurityInfo) {
      SetCV($target,'last_update_info_time', kDMCurrentTimestamp); // Update last_update_info_time for the target      
    }
  } else {
    // Must be a real task
    if (!$is_task) {
      $task = FindInDatabase('mdm_tasks', 'uuid', $uuid, 'FOR UPDATE');
      if (empty($task)) {
        LogMsg(__FUNCTION__.": Task not found for UUID '$uuid'", 0);
        return;
      }
    } else $task = $target;     // The target is the task (it's a RemoveMDM task)

    ///////////////////////////////////////////////////////////////////////////
    // The database handles all this now, when the task is marked succeeded. //
    ///////////////////////////////////////////////////////////////////////////
    // $task_type = CV($task, 'task_type');
    // $task_id   = CV($task, 'id');
    // switch ($task_type) {
    // case 'InstallProfile':
    //   // Update the 'installed_profiles' that this was for (there should always be one)
    //   // $ipd = FindInDatabase('installed_profiles', 'mdm_task_id', $task_id, 'FOR UPDATE');
    //   // if ($ipd) {
    //   //   SetCV($ipd, 'mdm_task_id', NULL);
    //   //   SaveToDatabase($ipd);
    //   // } else LogMsg(__FUNCTION__.": No row found in installed_profiles for InstallProfile task.");
    //   break;
    // 
    // case 'RemoveProfile':
    //   // Just delete the row that tells us the profile is installed.
    //   // $sql = "DELETE FROM installed_profiles WHERE mdm_task_id = :mdm_task_id";
    //   // ExecuteSQL('installed_profiles', $sql, ['mdm_task_id' => $task_id]);
    //   break;
    // 
    // case 'InstallApplication':
    //   // Update the 'installed_applications' that this was for (there should always be one)
    //   // We note that it's pending installation, but this means we installed it so we can remove it later
    //   // $sql = "UPDATE installed_applications SET mdm_task_id = NULL, status = 0 WHERE mdm_task_id = :mdm_task_id";
    //   // ExecuteSQL('installed_applications', $sql, ['mdm_task_id' => $task_id]);
    //   break;
    // 
    // case 'RemoveApplication':
    //   // Just delete the row that tells us the app is installed.
    //   // $sql = "DELETE FROM installed_applications WHERE mdm_task_id = :mdm_task_id";
    //   // ExecuteSQL('installed_applications', $sql, ['mdm_task_id' => $task_id]);
    //   break;
    // 
    // case 'SendVPPInvitation':
    //   // Mark that we've invited the user on this device
    //   // if (Target_is_lab_session($target)) {
    //   //   // Need to update the actual device record
    //   //   $sql = "UPDATE devices SET vpp_last_invited = (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'), updated_at = (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') WHERE id = :id AND user_id = :user_id";
    //   //   ExecuteSQL('devices', $sql, ['id' => CV($target, 'device_id'), 'user_id' => CV($target, 'user_id')]);
    //   // } else SetCV($target, 'vpp_last_invited', kDMCurrentTimestamp);
    //   break;
    // } // switch

    complete_task($task, TRUE);
  } // Real task
} // Task_handle_response

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
    SELECT          i.id
    FROM            installed_profiles AS i
    LEFT OUTER JOIN mdm_tasks          AS t
                 ON i.mdm_task_id = t.id
    WHERE           i.mdm_target_id = :mdm_target_id
      AND           t.task_type IS DISTINCT FROM 'InstallProfile'  -- Will also match task_type IS NULL, which means there is no task on the ip row
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

    if (!empty($entry['PayloadUUID'])) {
      $uuid = $entry['PayloadUUID'];
      $profile = FindInDatabase('profiles', 'uuid', $uuid);
      if ($profile && !CV($profile, 'is_a_la_carte')) {     // Don't track manually-installed profiles!
        $bind['profile_id'] = CV($profile, 'id');
        unset($bind['identifier']);
        $ipd = FindBySQL('installed_profiles', "WHERE mdm_target_id = :mdm_target_id AND profile_id = :profile_id", $bind, 'FOR UPDATE');
      } else {
        // See if this is a profile we pushed but no longer have any record of
        $ident = $entry['PayloadIdentifier'];
        if (!empty($ident) && strpos($ident, "com.apple.mdm.".GetServerHostname()) === 0 && substr($ident, -7) == '.pushed') {
          $bind['identifier'] = $ident;
          unset($bind['profile_id']);
          $ipd = FindBySQL('installed_profiles', "WHERE mdm_target_id = :mdm_target_id AND identifier = :identifier", $bind, 'FOR UPDATE');
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

      // Don't copy 'identifier' now, as we don't need it until the profile is deleted and a trigger in the DB will take care of copying this on profile delete
      // $ident = CV($profile, 'identifier'); 
      // SetCV($ipd, 'identifier', $ident);
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

function _get_enrollment_settings(&$target)
{
  $enrollment_settings = null;
  $params = [ 
    'u_id'   => CV($target, 'user_id')
  ];
  $function_name = 'dm_device_enrollment_settings_for_user';
  $result = ExecuteSQLFunction($function_name, $params);
  if ($result && count($result) > 0) {
    $enrollment_settings_id = $result[0][$function_name];
    $enrollment_settings = FindInDatabase('device_enrollment_settings', 'id', $enrollment_settings_id);
  }
  return $enrollment_settings;
} // _get_enrollment_settings

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
