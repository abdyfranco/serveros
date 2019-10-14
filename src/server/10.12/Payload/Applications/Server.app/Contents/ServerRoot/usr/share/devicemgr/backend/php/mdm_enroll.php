<?php
// -------------------------------------------------------------------------
// Copyright (c) 2017 Apple Inc. All rights reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//-------------------------------------------------------------------------

require_once('/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/common.php');
require_once('/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/auth.php');
require_once('/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/i18n.php');
require_once('/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/ota_service_common.php');

//-------------------------------------------------------------------------

function _enroll_transaction($args)
{
  $device_identifier = $args['device_identifier'];
  $is_mac            = $args['is_mac'];
  $user_id           = $args['user_id'];

  // Create a placeholder device to associate to this user
  $device = FindInDatabase('devices', 'identifier', $device_identifier);
  if (!$device) $device = NewRecordForTable('devices', [ 'identifier' => $device_identifier ]);

  SetCVMulti($device, [ 'pending_user_id'        => $user_id,
                        'mdm_acl'                => $args['mdm_acl'],
                        'pending_checkin_token'  => $args['checkin_token'],
                        'checkin_token_valid_at' => kDMCurrentTimestamp,  // Make the token valid (again)
                        'last_checkin_time'      => kDMCurrentTimestamp,
                        'mdm_target_type'        => ($is_mac ? kDeviceTypeMac : kDeviceTypeiOS)
                      ]);
  SaveToDatabase($device);

  // It is not necessary to reload this row as device.id will not change and that's the only value used in the remainder of this function
  // ReloadFromDatabase($device);  // Might have been merged with other placeholder rows, so reload to get all the data

  if ($is_mac) LabSession_create_owner_placeholder(CV($device, 'id'), $user_id);  // Create a placeholder lab_session to associate the owner to the device

  return [ 'device' => $device, 'cert' => CreateClientCertificatePlaceholderForDevice($device) ];
} // _enroll_transaction

//-------------------------------------------------------------------------

try {
  CheckDeviceManagementEnabled();
  if (!VerifyAuthToken()) DieUnauthorized('Failed to authenticate');     // Returns false if it can't verify

  if (empty($_POST['device_identifier']) || empty($_POST['device_type'])) DieBadRequest();
  $device_identifier = $_POST['device_identifier'];
  $device_type       = $_POST['device_type'];

  $u_session = LoadPHPSession();
  if (empty($u_session)) DieUnauthorized('no session');
  if (empty($u_session['generated_uid'])) DieUnauthorized('No generated_uid');
  $user_guid = NormalizeGUID($u_session['generated_uid']);
  if (empty($user_guid)) DieUnauthorized('Invalid generated_uid: '.$u_session['generated_uid']);

  $user_guid = strtoupper($user_guid);
  $user = FindInDatabase('users', 'guid', $user_guid);
  if (!$user) DieUnauthorized('user not found');

  $user_id = CV($user, 'id');
  $function_name = 'dm_allow_portal_enroll_unenrollment_for_user_id';
  $result = ExecuteSQLFunction($function_name, ['user_pk' => $user_id]);
  if (empty($result[0]) || empty($result[0][$function_name])) DieForbidden('user cannot enroll devices via portal');

  $is_mac         = (stripos($device_type, 'mac') !== FALSE);
  $mdm_acl        = GetMDMACLFromUserAgentHeader();
  $checkin_token  = GenerateUUID();

  $args = ['checkin_token' => $checkin_token, 'device_identifier' => $device_identifier, 'is_mac' => $is_mac, 'mdm_acl' => $mdm_acl, 'user_id' => $user_id];
  $args = PerformInTransaction('_enroll_transaction', $args, kDMPGPriorityLow);

  $final_output = GenerateMDMBindingProfile($args['device'], $args['cert']);

  header('Content-Type: application/x-apple-aspen-config');
  header('Content-Disposition: attachment; filename="mdm_profile.mobileconfig"');
} catch (Exception $e) {
  ProcessException($e);   // Does not return
}

SendFinalOutput($final_output);
