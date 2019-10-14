<?php
// -------------------------------------------------------------------------
// Copyright (c) 2015 Apple Inc. All rights reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//-------------------------------------------------------------------------

require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/common.php");
require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/target.php");
require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/task.php");

//-------------------------------------------------------------------------

// This function is only used to authenticate LabSessions when the UserAuthenticate message is sent from the client
// The caller of this function will issue a SaveToDatabase() on $target
function authenticate_checkin_incoming_request(&$target, $incoming_request)
{
  if (LabSession_validate_auth_token($target, $incoming_request)) return [ 'DigestChallenge' => '' ];

  if (empty($incoming_request['UDID']) || empty($incoming_request['UserID'])) return NULL;      
  $uuid = strtoupper($incoming_request['UDID'].$incoming_request['UserID']);

  if (isset($incoming_request['DigestResponse'])) {
    // Validate the response
    $digest_response = $incoming_request['DigestResponse'];
    if (empty($uuid) || empty($digest_response)) return NULL;

    if (dmx_validate_digest_response($uuid, $digest_response, $_SERVER['REQUEST_METHOD']) !== FALSE) {
      $hash = trim(base64_encode(hash_hmac('sha1', $uuid, GenerateUUID(), TRUE)));
      SetCVMulti($target, ['auth_token' => $hash, 'singleton_uuid' => NULL]);
      return [ 'AuthToken' => $hash ];
    }
  }

  // Need to generate a digest challenge for the client to reply to
  if (IsBoundToAD()) {
    // Get both rfc2069 and rfc2617 variant challenges
    $digest_challenges = dmx_get_network_digest_challenge($uuid, TRUE); 
    if (empty($digest_challenges)) return NULL;    
    return [ 'DigestChallenge' => $digest_challenges[0], 'DigestMD5SessChallenge' => $digest_challenges[1] ];  // DigestMD5SessChallenge to support AD authentication
  } else {
    // Get rfc2069 variant challenge to authenticate new and old clients
    $digest_challenges = dmx_get_network_digest_challenge($uuid, FALSE);
    if (empty($digest_challenges)) return NULL;
    return [ 'DigestChallenge' => $digest_challenges[0] ];
  }
} // authenticate_checkin_incoming_request

//-------------------------------------------------------------------------

function _checkin_transaction($args)
{
  ResetPHPSession();    // At this point, we definitely don't need any prior session

  $incoming_request = $args['incoming_request'];
  $target = Target_for_checkin_request($incoming_request, TRUE);  // Will only be NULL if can't find devices row that presents a valid client certificate
  $owned  = ($target && ((Target_is_lab_session($target) && CV($target, 'is_owner')) || (FromTable($target, 'devices') && (!EmptyCV($target, 'user_id') || !EmptyCV($target, 'pending_user_id')))));
  header('X-MDM-is-owned: '.($owned ? '1' : '0'));

  switch ($incoming_request['MessageType']) {
  case 'TokenUpdate':
    if (!$target) DieForbidden("Target not found for TokenUpdate");
    if (Target_is_lab_session($target) && !LabSession_validate_auth_token($target, $incoming_request)) DieForbidden("unable to validate auth token");

    $new_token = $incoming_request['Token']->base64EncodedData();
    $new_magic = $incoming_request['PushMagic'];
    SetCVMulti($target, ['token' => $new_token, 'push_magic' => $new_magic]);
    if (isset($incoming_request["UnlockToken"]) && !Target_is_lab_session($target)) {
      $ext = Target_get_extended_data($target, "FOR UPDATE");
      SetCVDA($ext, 'unlock_token', $incoming_request['UnlockToken']->base64EncodedData());
      SaveToDatabase($ext);
    }

    $final_output = '';
    break;

  case 'UserAuthenticate':
    if (!$target) DieForbidden("Target not found for UserAuthenticate");
    if (!Target_is_lab_session($target)) DieBadRequest("UserAuthenticate for type '".Table($target));

    $auth_result = authenticate_checkin_incoming_request($target, $incoming_request);
    if (empty($auth_result)) DieBadRequest("Unable to authenticate request");
    $final_output = plist_encode_xml($auth_result);
    break;

  case 'Authenticate':
    if (!$target) DieForbidden("Target not found for Authenticate");
    if (!Target_is_lab_session($target)) {
      $ttl = (empty($_SERVER['SSL_CLIENT_V_REMAIN']) ? NULL : $_SERVER['SSL_CLIENT_V_REMAIN']);
      SetCV($target, 'last_mdm_refresh_ttl_days', $ttl);    // The device just enrolled (or re-enrolled), so reset this
    }
    $final_output = '';
    break;

  case 'CheckOut':  // MDM Profile was removed, turn our record back into a pumpkin
    if ($target) {
      if (!(CV($target, 'singleton_task_type') & RefreshMDM)) {             // OSX clients will "CheckOut" while installing the new MDM profile, so ignore that
        complete_singleton_tasks_for_target($target, RemoveMDM, TRUE);      // Mark any pending RemoveMDM tasks as completed
        SetCV($target, 'token', NULL);
        SaveToDatabase($target);            // Clear the token to mark the device as unenrolled
        unset($target);
      }
    } else {
      // This means we've already deleted the device and we should just look for a 'RemoveMDM' task on the associated tombstone
      $udid = NormalizeUDID($incoming_request['UDID']);
      $target = FindInDatabase('target_tombstones', 'target_ident', $udid);
      if ($target) {
        // Mark the RemoveMDM task complete
        $tid = CV($target, 'id');
        $sql = "UPDATE mdm_tasks SET succeeded = 1 WHERE library_item_tombstone_id = $tid AND task_type = 'RemoveMDM' AND completed_at IS NULL";
        ExecuteSQL('mdm_tasks', $sql, []);
      } else DieForbidden("tombstone target not found");
    }
    $final_output = '';
    break;

  default:
    DieBadRequest("unknown MessageType '".$incoming_request['MessageType']."'");
  } // switch

  if (!empty($target)) SaveToDatabase($target);

  return $final_output;
} // _checkin_transaction

//-------------------------------------------------------------------------

try {
  $body = file_get_contents('php://input');
  if ($gLogLevel > 3) LogMsg(basename(__FILE__).": $body", 4);
  $incoming_request = plist_decode($body);
  if (!isset($incoming_request) || !is_array($incoming_request)) DieBadRequest();

  $incoming_request = NormalizeIncomingRequest($incoming_request);
  LogMsg("checkin: '".$incoming_request['MessageType']."'", 0);
  if ($gLogLevel >= 2) {
    $ir_str = PrintArrayObscuringValuesForKeys($incoming_request);
    LogMsg(basename(__FILE__).": incoming_request=$ir_str", 2);
  }

  $args = ['incoming_request' => $incoming_request];
  $final_output = PerformInTransaction('_checkin_transaction', $args);
} catch (Exception $e) {
  ProcessException($e);   // Does not return
}

SendFinalOutput($final_output);
