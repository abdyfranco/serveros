<?php
// -------------------------------------------------------------------------
// Copyright (c) 2014 Apple Inc. All rights reserved.
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
  $device = FindBySQL('devices', 'WHERE "SerialNumber" = :SerialNumber LIMIT 1', ['SerialNumber' => $sn], 'FOR UPDATE');

  // Load the DEP profile for this device, see if we need credentials or not
  $need_auth = TRUE;
  if ($device) {
    $uuid = CV($device, 'assigned_dep_profile_uuid');
    // Need to find this profile, it will either be the device's profile (if any) or one on a device group
    if ($uuid != CV($device, 'dep_profile_uuid')) {
      $dg = FindBySQL('device_groups', 'WHERE dep_profile_uuid = :dep_profile_uuid LIMIT 1', ['dep_profile_uuid' => $uuid]);
      if (!empty($dg)) $profile = CV($dg, 'dep_profile');
    } else $profile = CV($device, 'dep_profile');
    if (!empty($profile) && !empty($profile['__SKIP_USER_AUTH'])) $need_auth = FALSE;

    $args['device_id']  = CV($device, 'id');
  }

  $args['need_auth'] = $need_auth;
  return $args;
} // _dep_mdm_enroll_1

//-------------------------------------------------------------------------

function _dep_mdm_enroll_2(array $args)
{
  // Make sure we've got valid authorization credentials (if required)
  if (!empty($args['userData'])) {
    $userData = $args['userData'];
    $guid = $userData['dsAttrTypeStandard:GeneratedUID'];
    $user = FindInDatabase('abstract_users', 'guid', $guid);  // Get this user's record
    if (!$user) {
      // Didn't find the user in the DB, but we know they're in OD, so go ahead and insert them
      // First we need to make sure we have the od_nodes row
      $node_name = $userData['dsAttrTypeStandard:AppleMetaNodeLocation'];
      $od_node   = FindInDatabase('od_nodes', 'od_node_name', $node_name);
      if (empty($od_node)) {
        $od_node = NewRecordForTable('od_nodes');
        SetCV($od_node, $node_name);
        SaveToDatabase($od_node);
      }
      $user = NewRecordForTable('users');
      $set  = [ 'guid' => $guid, 'od_node_id' => CV($od_node, 'od_node_id') ];
      if (!empty($userData['dsAttrTypeStandard:RecordName']))     $set['short_name']       = $userData['dsAttrTypeStandard:RecordName'];
      if (!empty($userData['dsAttrTypeStandard:RealName']))       $set['full_name']        = $userData['dsAttrTypeStandard:RealName'];
      if (!empty($userData['dsAttrTypeStandard:PrimaryGroupID'])) $set['primary_group_id'] = $userData['dsAttrTypeStandard:PrimaryGroupID'];

      SetCVMulti($user, $set);
      SaveToDatabase($user);
    }
  }

  // Find the specified device (we won't be here unless we've already found the device in our DB)
  if (!empty($args['device_id'])) $device = FindInDatabase('devices', 'id', $args['device_id'], 'FOR UPDATE');
  if(empty($device)){
    $device = NewRecordForTable('devices');
    SetCV($device, 'SerialNumber', $args['SERIAL']);
  }

  $user_id = (empty($user) ? NULL : CV($user, 'id'));

  // Possibilities are as follows:
  // RESTRICTION (MUST BE)   
  // KNOWN ASSIGNED         RESULT
  // 0      X               Can enroll all devices whether or not assigned
  // 1      0               Can enroll known devices only, whether or not assigned to the user
  // 1      1               Can enroll known devices that are assigned to the user only.
  //
  // For expediency, we use the origin privilege model here, so the possibilities are transformed as follows:
  // PRIVILEGE (ALLOW)   
  // UNKNOWN UNASSIGNED     RESULT
  // 1          X           Can enroll all devices whether or not assigned
  // 0          1           Can enroll known devices only, whether or not assigned to the user (must be known)
  // 0          0           Can enroll known devices that are assigned to the user only (must be known and owned)
  if (!empty($user)) {
    $function = "dm_expanded_privileges_for_user_id";
    $priv_result = ExecuteSQLFunction($function, ['user_pk' => $user_id]);
    if (!empty($priv_result[0]) && !empty($priv_result[0][$function])) $permissions = json_decode($priv_result[0][$function]);
    if (empty($permissions)) DieForbidden("Unable to determine privileges for user");
    if (!$permissions->enroll_dep ||
       (!$permissions->enroll_unowned && !$permissions->enroll_unknown && $user_id != CV($device, 'user_id')) ||
       (EmptyCV($device, 'id') && !$permissions->enroll_unknown))
    {
      LogMsg(__FUNCTION__.": User does not have the privileges necessary to enroll this device"); // Cannot enroll any DEP device
      _request_authorization($args['UDID']);        // Does not return
    }
  }

  SetCVMulti($device, ['pending_checkin_token'  => GenerateUUID(), 
                       'pending_user_id'        => $user_id, 
                       'checkin_token_valid_at' => kDMCurrentTimestamp]);

  $ext = Device_update_from_query_results($device, $args);    // Set the Device Enrollment Program user as the pending user

  $mdm_acl = GetMDMACLFromBuildVersion(CVDA($ext, "OSBuildVersion"), Target_is_ios($device));
  SetCV($device, 'mdm_acl', $mdm_acl);

  SaveToDatabase($device);
  ReloadFromDatabase($device);  // Might have been merged with other placeholder rows, so reload to get all the data

  if (Target_is_mac($device) && !empty($user_id)) LabSession_create_owner_placeholder(CV($device, 'id'), $user_id);

  return ['device' => $device];
} // _dep_mdm_enroll_2

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
  $body = file_get_contents('php://input');
  $incoming_request = dmx_extract_signed_data($body);
  if (empty($incoming_request)) DieBadRequest("invalid signature");

  $incoming_request = plist_decode($incoming_request);
  if (empty($incoming_request)) DieBadRequest("invalid plist");

  $incoming_request = NormalizeIncomingRequest($incoming_request);
  if ($gLogLevel > 1) LogMsg(__FILE__.": incoming_request = ".PrintArrayObscuringValuesForKeys($incoming_request), 2);
  if (empty($incoming_request['UDID'])) DieForbidden("No UDID specified");

  // We're going to process this in two different transactions so we don't hold a transaction while checking auth.
  $results = PerformInTransaction('_dep_mdm_enroll_1', $incoming_request);
  if ($results['need_auth']) {
    $udid = $incoming_request['UDID'];
    if (!empty($_SERVER['Authorization']) && !empty($_SERVER['REQUEST_METHOD'])) {
      $userJSON = dmx_validate_digest_response($udid, $_SERVER['Authorization'], $_SERVER['REQUEST_METHOD']);
      if (!empty($userJSON)) $results['userData'] = json_decode($userJSON, TRUE);
      else LogMsg(__FILE__.': Authorization failed');
    }

    if (empty($results['userData'])) _request_authorization($udid);    // Does not return
  }

  $results = PerformInTransaction('_dep_mdm_enroll_2', $results);
  $device  = $results['device'];
  $output  = GenerateMDMBindingProfile(CV($device, 'udid'), CV($device, 'mdm_acl'), CV($device, 'pending_checkin_token'));
} catch (Exception $e) {
  ProcessException($e, TRUE, $gAuthPrompt); // Does not return
}

SendFinalOutput($output);
