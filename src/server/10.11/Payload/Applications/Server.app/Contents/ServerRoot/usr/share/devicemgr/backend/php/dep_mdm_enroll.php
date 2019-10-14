<?php
// -------------------------------------------------------------------------
// Copyright (c) 2016 Apple Inc. All rights reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//-------------------------------------------------------------------------

require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/common.php");
require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/ota_service_common.php");

$gAuthPrompt = null;

//-------------------------------------------------------------------------

function _dep_mdm_enroll_1(array $args)
{
  $sn = $args['SERIAL'];  // DEP only provides a serial number to us, so this is the only option for looking up the device.

  // Find the specified device
  $device = FindBySQL('devices', 'WHERE "SerialNumber" = :SerialNumber LIMIT 1', ['SerialNumber' => $sn]);

  // Load the DEP profile for this device, see if we need credentials or not
  $need_auth = TRUE;
  if ($device) {
    $uuid = CV($device, 'assigned_dep_profile_uuid');
    // Need to find this profile, it will either be the device's profile (if any) or one on a device group
    if ($uuid != CV($device, 'dep_profile_uuid')) {
      $dg = FindBySQL('device_groups', 'WHERE dep_profile_uuid = :dep_profile_uuid LIMIT 1', ['dep_profile_uuid' => $uuid]);
      if (!empty($dg)) $profile = CV($dg, 'dep_profile');
    } else $profile = CV($device, 'dep_profile');
    if (!is_null($profile) && is_array($profile)) {
      if (!empty($profile['__SKIP_USER_AUTH'])) $need_auth = FALSE;
      $args['has_dep_profile'] = TRUE;
    }

    $args['device_id']  = CV($device, 'id');
  }

  $args['need_auth'] = $need_auth;
  return $args;
} // _dep_mdm_enroll_1

//-------------------------------------------------------------------------

function _dep_mdm_enroll_2(array $args)
{
  // initialize user id and device.
  $user_id = $device = NULL;

  // Find the existing device placeholder, if we already found a device id.
  if (!empty($args['device_id'])) $device = FindInDatabase('devices', 'id', $args['device_id']);

  // If userData is not empty, then authorization was required for enrollment. We should find the user and check
  // their enrollment permissions, restrictions before we proceed with enrollment.
  if (!empty($args['userData'])) {
    $user = _find_or_create_user($args);
    $user_id = CV($user, 'id');

    // Possibilities are as follows:
    // RESTRICTION (MUST BE)
    // KNOWN ASSIGNED         RESULT
    // 0      X               Can enroll all devices whether or not assigned
    // 1      0               Can enroll known devices only, whether or not assigned to the user
    // 1      1               Can enroll known devices that are assigned to the user only.

    // query permissions for the user, die if we are not able to.
    $function = "dm_expanded_privileges_for_user_id";
    $priv_result = ExecuteSQLFunction($function, ['user_pk' => $user_id]);
    LogMsg("priv_result=".PrintArrayObscuringValuesForKeys($priv_result));
    if (!empty($priv_result[0]) && !empty($priv_result[0][$function])) $permissions = json_decode($priv_result[0][$function]);
    if (empty($permissions)) DieForbidden("Unable to determine privileges for user");

    $perms_result = 'Unknown reason';
    $check_ac     = $permissions->enroll_configurator;  // If the user is allowed to enroll via AC, check that case if normal DEP checks fail

    // If the device is a DEP device, the user must have permissions to enroll a DEP device, and possibly other permissions
    if ($device) {
      if (CV($device, 'is_dep_device')) {
        // we don't have to check require placeholder permissions, because we always have a placeholder for DEP
        $check_ac = FALSE;    // DEP devices should *never* be enrolling via AC mechanisms
        if ($permissions->enroll_dep) {
          if (!empty($args['has_dep_profile'])) {   // A DEP device must have a DEP profile defined for it somewhere
            // Check if ownership is required.
            $perms_result = ($permissions->require_ownership ? ($user_id == CV($device, 'user_id') ? 'ALLOWED' : 'Device is not owned by authenticated user') : 'ALLOWED');
          } else $perms_result = 'Device has no DEP profile assigned';
        } else $perms_result = 'User does not have permissions to enroll DEP devices';
      } else $perms_result = 'Device is not in DEP';
    } else $perms_result = 'No device record found';    // No device row can only be OK if the user is allowed to enroll via AC (BYOD)

    if ($perms_result != 'ALLOWED' && $check_ac) {
      if ($permissions->require_ownership) {      // requires ownership, in which case there should be a placeholder that belongs to the user.
        $perms_result = ($device && $user_id == CV($device, 'user_id') ? 'ALLOWED' : 'Device is not owned by authenticated user [AC]');
      } else if ($permissions->require_placeholder) $perms_result = ($device ? 'ALLOWED' : 'No placeholder device found');
      else $perms_result = 'ALLOWED';      // no restrictions, the user can enroll any device (BYOD) using configurator.
    }

    // Request new authorization if the user doesn't have privileges to enroll.
    if ($perms_result != 'ALLOWED') {
      LogMsg(__FUNCTION__.": User does not have the privileges necessary to enroll this device ($perms_result)");
      _request_authorization($args['UDID']);        // Does not return
    }
  } // if (!empty($args['userData']))

  // We have checked all the enrollment permissions at this point and allowed to enroll. So create a placeholder for
  // the device if we don't have a device record.
  if (empty($device)) {
    $device = NewRecordForTable('devices');
    SetCV($device, 'SerialNumber', $args['SERIAL']);
  }

  SetCVMulti($device, ['pending_checkin_token'  => GenerateUUID(),
                       'pending_user_id'        => $user_id,
                       'checkin_token_valid_at' => kDMCurrentTimestamp]);

  $ext = Device_update_from_query_results($device, $args);    // Set the Device Enrollment Program user as the pending user (saves $device and reloads it, possibly with a different id!!!)

  $mdm_acl = GetMDMACLFromBuildVersion(CVDA($ext, "BuildVersion"), Target_is_ios($device));
  SetCV($device, 'mdm_acl', $mdm_acl);

  SaveToDatabase($device);

  if (Target_is_mac($device) && !empty($user_id)) LabSession_create_owner_placeholder(CV($device, 'id'), $user_id);

  return ['device' => $device];
} // _dep_mdm_enroll_2

//-------------------------------------------------------------------------

function _find_or_create_user(&$args)
{
  $userData = $args['userData'];
  $guid = $userData['dsAttrTypeStandard:GeneratedUID'];
  $user = FindInDatabase('users', 'guid', $guid);  // Get this user's record
  if (!$user) {
    // Didn't find the user in the DB, but we know they're in OD, so go ahead and insert them
    // First we need to make sure we have the od_nodes row
    $node_name = $userData['dsAttrTypeStandard:AppleMetaNodeLocation'];
    $od_node   = FindInDatabase('od_nodes', 'od_node_name', $node_name);
    if (empty($od_node)) {
      $sql = "INSERT INTO od_nodes(od_node_name) VALUES (:od_node_name) RETURNING od_node_id";
      $node_id = ExecuteSQL('od_nodes', $sql, ['od_node_name' => $node_name]);
    } else {
      $node_id = CV($od_node, 'od_node_id');
    }
    $user = NewRecordForTable('users');
    $set  = [ 'guid' => $guid, 'od_node_id' => $node_id ];
    if (!empty($userData['dsAttrTypeStandard:RecordName']))     $set['short_name']       = $userData['dsAttrTypeStandard:RecordName'];
    if (!empty($userData['dsAttrTypeStandard:RealName']))       $set['full_name']        = $userData['dsAttrTypeStandard:RealName'];
    if (!empty($userData['dsAttrTypeStandard:PrimaryGroupID'])) $set['primary_group_id'] = $userData['dsAttrTypeStandard:PrimaryGroupID'];

    SetCVMulti($user, $set);
    SaveToDatabase($user);
  }
  return $user;
} // _find_or_create_user

//-------------------------------------------------------------------------

function _request_authorization($udid)
{
  global $gAuthPrompt;
  $digest_challenge = dmx_get_digest_challenge($udid);
  if (empty($digest_challenge)) DieInternalError("No digest challenge generated");

  header("WWW-Authenticate: $digest_challenge");
  $settings = GetSettings();
  $org = $settings['server_organization'];
  $gAuthPrompt = sprintf(I18n_t('dep_prompt_credentials'), $org);
  DieUnauthorized("Requesting user digest authentication");
} // _request_authorization

//-------------------------------------------------------------------------

try {
  CheckDeviceManagementEnabled();
  $body = file_get_contents('php://input');
  $incoming_request = dmx_extract_signed_data($body);
  if (empty($incoming_request)) DieBadRequest("invalid signature");

  $incoming_request = plist_decode($incoming_request);
  if (empty($incoming_request)) DieBadRequest("invalid plist");

  $incoming_request = NormalizeIncomingRequest($incoming_request);
  if ($gLogLevel > 1) LogMsg(__FILE__.": incoming_request = ".PrintArrayObscuringValuesForKeys($incoming_request), 2);
  if (empty($incoming_request['UDID'])) DieForbidden("No UDID specified");

  // We're going to process this in two different transactions so we don't hold a transaction while checking auth.
  $results = PerformInTransaction('_dep_mdm_enroll_1', $incoming_request, kDMPGPriorityLow);
  if ($results['need_auth']) {
    $udid = $incoming_request['UDID'];
    if (!empty($_SERVER['HTTP_AUTHORIZATION']) && !empty($_SERVER['REQUEST_METHOD'])) {     // 'HTTP_AUTHORIZATION' is a rewrite of the 'Authorization' header in our apache config file
      $userJSON = dmx_validate_digest_response($udid, $_SERVER['HTTP_AUTHORIZATION'], $_SERVER['REQUEST_METHOD']);
      if (!empty($userJSON)) $results['userData'] = json_decode($userJSON, TRUE);
      else LogMsg(__FILE__.': Authorization failed');
    }

    if (empty($results['userData'])) _request_authorization($udid);    // Does not return
  }

  $results = PerformInTransaction('_dep_mdm_enroll_2', $results, kDMPGPriorityLow);
  $device  = $results['device'];
  $final_output = GenerateMDMBindingProfile(CV($device, 'mdm_acl'), CV($device, 'pending_checkin_token'));
} catch (Exception $e) {
  ProcessException($e, TRUE, $gAuthPrompt); // Does not return
}

SendFinalOutput($final_output);
