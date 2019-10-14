<?php
// -------------------------------------------------------------------------
// Copyright (c) 2016 Apple Inc. All rights reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//-------------------------------------------------------------------------

require_once('/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/common.php');
require_once('/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/target.php');
require_once('/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/task.php');

//-------------------------------------------------------------------------

function _connect_transaction_1($incoming_request)
{
  global $gNewURL;
  $target = Target_for_incoming_request($incoming_request);
  if (!$target) {
    // See if there's a RemoveMDM task waiting for this device, but only if using the old URL.
    // Devices with identifiable certificates will return the actual RemoveMDM task in $target
    if (!$gNewURL && !empty($incoming_request['UDID'])) {
      // First we need to see if there's a tombstone
      $target = FindBySQL('target_tombstones', "WHERE target_class = 'Device' AND target_ident = :target_ident", ['target_ident' => $incoming_request['UDID']]);
      if ($target) {
        // Now look for a RemoveMDM task for this tombstone
        $target = FindBySQL('mdm_tasks', "WHERE library_item_tombstone_id = :library_item_tombstone_id AND task_type = 'RemoveMDM'", ['library_item_tombstone_id' => CV($target, 'id')]);
      }
    }
    if (!$target) DieBadRequest('target not found');
    return $target;   // There's nothing below we want to do if we have the RemoveMDM task
  } elseif (FromTable($target, 'mdm_tasks')) return $target;  // We don't handle the Remove MDM task here

  $is_ls = Target_is_lab_session($target);
  if ($is_ls && !LabSession_validate_auth_token($target, $incoming_request)) DieForbidden('unable to validate auth token');

  if (isset($incoming_request['CommandUUID'])) LogMsg('Status="'.$incoming_request['Status'].'" CommandUUID='.$incoming_request['CommandUUID'], 0);
  else LogMsg('Status="'.$incoming_request['Status'].'"', 0);

  switch ($incoming_request['Status']) {
  case 'Acknowledged':
    Task_handle_response($target, $incoming_request);
    if (!$is_ls || empty($incoming_requets['UserConfiguration'])) Target_reset_skipped_tasks($target, FALSE);
    break;

  case 'NotNow':
    Task_handle_notnow($target, $incoming_request);
    break;

  case 'Idle':
    $tid = CV($target, 'id');

    // Check the expiration date of the device's identity. If it's got less than 180 days, schedule it for renewal. We just need to set the singleton bit.
    if (!$is_ls && isset($_SERVER['SSL_CLIENT_V_REMAIN'])) {
      $ttl = $_SERVER['SSL_CLIENT_V_REMAIN'];
      $last_ttl = CV($target, 'last_mdm_refresh_ttl_days');
      if (!isset($last_ttl)) $last_ttl = 999;               // A suitably large value
      LogMsg("Client identity expires in $ttl days.", 3);
      if ($ttl < 15 || ($ttl < 180 && $ttl < $last_ttl)) {  // Only try once per day until we're down to fewer than 15 days left
        $skip = !Target_is_ios($target);
        if ($skip) {
          // OS X clients up through 10.9.2 don't deal with this renewal, so postpone the eventual MDM lobotomy for as long as we can.
          $comps = explode('.', CV($target, 'OSVersion'));
          $skip  = (count($comps) < 2 || ($comps[0] == 10 && ($comps[1] < 9 || ($comps[1] == 9 && (count($comps) == 2 || $comps[2] < 3)))));
        }
        $hp = CV($target, 'hp_singleton_tasks');
        if (!$skip && !($hp & RefreshMDM)) {        // Only if we don't already have this task pending
          SetCVMulti($target, [ 'hp_singleton_tasks' => ($hp | RefreshMDM), 'last_mdm_refresh_ttl_days' => $ttl ]);
          LogMsg('Scheduling client "'.Target_description($target).'" for re-enrollment in MDM.');
        }
      }
    }

    // Reset all skipped tasks. We put all skipped singletons into the "high priority" tasks mask, since they are old and really should get done.
    if (!$is_ls || empty($incoming_requets['UserConfiguration'])) Target_reset_skipped_tasks($target, TRUE);

    if ($is_ls) {
      // On "Idle", we queue up all the user's profiles as tasks for this lab session
      // Unless this target already has pending jobs--that means we've pushed everything already
      if (CV($target, 'hp_singleton_tasks') == 0 && CV($target, 'lp_singleton_tasks') == 0 && !Task_first_for_target($target)) {
        SaveToDatabase($target);          // Must update the row in the database because dm_auto_update_all_profiles_for_mdm_target() uses some columns we've changed
        ExecuteSQLFunction('dm_auto_update_all_profiles_for_mdm_target', ['target_id' => $tid]);
        Target_has_blocked_tasks($tid);   // This will prioritize any newly-created blocked tasks so the blocking internal_tasks are processed first
      }
      // Then fall through to generate_next_request to send the first profile (if any)
    }
    break;

  default:
    Task_handle_error($target, $incoming_request);
    if (!$is_ls || empty($incoming_requets['UserConfiguration'])) Target_reset_skipped_tasks($target, FALSE);
  } // switch

  SaveToDatabase($target);
  return $target;
} // _connect_transaction_1

//-------------------------------------------------------------------------

function _connect_transaction_2($args)
{
  $incoming_request = $args[0];
  $sync   = !empty($incoming_request['NeedSyncResponse']);
  $config = !empty($incoming_requets['UserConfiguration']);
  $target = $args[1];
  ReloadFromDatabase($target);
  return Task_generate_next_request($target, $sync, $config);
} // _connect_transaction_2

//-------------------------------------------------------------------------

try {
  CheckDeviceManagementEnabled();
  $body = file_get_contents('php://input');
  if ($gLogLevel > 3) LogMsg(basename(__FILE__).': '.$body, 4);
  $incoming_request = plist_decode($body);
  if (!isset($incoming_request)) DieBadRequest();

  $incoming_request = NormalizeIncomingRequest($incoming_request);
  if ($gLogLevel >= 3) LogMsg(basename(__FILE__).': incoming_request='.PrintArrayObscuringValuesForKeys($incoming_request), 3);

  // Handle the response to our last command (if any)
  $target = PerformInTransaction('_connect_transaction_1', $incoming_request);
  // Generate the next request for the device (if any)
  $final_output = (!empty($target) ? PerformInTransaction('_connect_transaction_2', [$incoming_request, $target]) : '');
} catch (Exception $e) {
  ProcessException($e);   // Does not return
}

SendFinalOutput($final_output);
