<?PHP
// -------------------------------------------------------------------------
// Copyright (c) 2014 Apple Inc. All rights reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//-------------------------------------------------------------------------

function Device_can_be_enrolled_via_portal($target, $device_info)
{
  $result = TRUE;
  
  if (!EmptyCV($target, 'pending_user_id')) {
    // Determine the user's privileges
    $u_id = CV($target, 'pending_user_id');
    $function = "dm_expanded_privileges_for_user_id";
    $priv_result = ExecuteSQLFunction($function, ['user_pk' => $u_id]);
    if (!empty($priv_result[0]) && !empty($priv_result[0][$function])) $permissions = json_decode($priv_result[0][$function]);
    if (empty($permissions)) DieForbidden("Unable to determine privileges for user");
    
    // If needed, check whether placeholders satisfy requirements on the user
    if (!$permissions->enroll_unknown || !$permissions->enroll_unowned) {
      $found = FALSE;
      $owned = FALSE;
      $candidates = Device_find_by_query_results($device_info, '', FALSE);
      if (!empty($candidates)) {
        foreach ($candidates as $placeholder) {
          $found = TRUE;
            if (CV($placeholder, 'user_id') == $u_id) {
              $owned = TRUE;
              break;              // No need to search any further
            } 
        }
      }
      
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
      if (!$found && !$permissions->enroll_unknown) { 
        LogMsg("User is not allowed to enroll unknown devices.");
        $result = FALSE;
      }
      if (!$owned && !$permissions->enroll_unknown && !$permissions->enroll_unowned) {
        LogMsg("User is not allowed to enroll devices that are not already assigned to them.");
        $result = FALSE;
      }
    }
  }
  
  return $result; 
} // Device_can_be_enrolled_via_portal

//-------------------------------------------------------------------------

function Device_find_by_query_results($query, $select_modifier = '', $require_unique = TRUE)
{
  // This maps the keys we find in $query to the columns in the devices table
  $fields = ['IMEI' => 'IMEI', 'MEID' => 'MEID', 'DeviceID' => 'DeviceID', 'SERIAL' => 'SerialNumber', 'SerialNumber' => 'SerialNumber', 'UDID' => 'udid'];
  $where  = "";
  $bind   = [];
  foreach ($fields as $key => $col) {
    if (empty($query[$key])) continue;

    if (!empty($where)) $where .= " OR ";
    $where .= "\"$col\" = :$col";
    $bind[$col] = $query[$key];
  }
  if (empty($bind)) return FALSE;

  $where   = "WHERE $where";
  $results = FindAllBySQL('devices', $where, $bind, $select_modifier);
  $count   = count($results);
  if ($require_unique) {
      if ($count > 1) DieInternalError("Found multiple device rows for query values ".PrintArrayObscuringValuesForKeys($query));
      return ($count == 1 ? $results[0] : FALSE);
  } else return ($count > 0 ? $results : FALSE);
} // Device_find_by_query_results

//-------------------------------------------------------------------------

function Device_get_user($dev, $select_modifier = '')
{
  $uid = CV($dev, 'user_id');
  if (empty($uid)) {
    $uid = CV($dev, 'pending_user_id');
    if (empty($uid)) return FALSE;
  }
  return FindInDatabase("users", "id", $uid, $select_modifier);
} // Device_get_user

//-------------------------------------------------------------------------

function Device_update_from_query_results(&$device, $incoming_request)
{
  $vals    = [];
  $ext_das = [];
  $vals["udid"]            = (empty($incoming_request["UDID"])     ? NULL : $incoming_request["UDID"]);
  $vals["SerialNumber"]    = (empty($incoming_request["SERIAL"])   ? NULL : $incoming_request["SERIAL"]);
  $vals["IMEI"]            = (empty($incoming_request["IMEI"])     ? NULL : $incoming_request["IMEI"]);
  $vals["MEID"]            = (empty($incoming_request["MEID"])     ? NULL : $incoming_request["MEID"]);
  $vals['mdm_target_type'] = (stripos($incoming_request['PRODUCT'], 'mac') !== FALSE ? 'mac' : 'ios');
  if (isset($incoming_request["DeviceID"]))    $vals["DeviceID"]    = (empty($incoming_request["DeviceID"]) ? NULL : $incoming_request["DeviceID"]);
  if (isset($incoming_request["OSVERSION"]))   $vals["OSVersion"]   = $incoming_request["OSVERSION"];
  if (isset($incoming_request["PRODUCT"]))     $vals["ProductName"] = $incoming_request["PRODUCT"];
  if (isset($incoming_request["DEVICE_NAME"])) $vals["DeviceName"]  = $incoming_request["DEVICE_NAME"];

  if (isset($incoming_request["VERSION"])) $ext_das["OSBuildVersion"] = $incoming_request["VERSION"];

  if (!empty($ext_das)) {
    $ext = Target_get_extended_data($device, "FOR UPDATE");
    SetCVDAMulti($ext, $ext_das);
    SaveToDatabase($ext);
    ReloadFromDatabase($ext);   // Because SaveToDatabase isn't smart enough to properly update the internal values
  } else $ext = NULL;

  SetCVMulti($device, $vals);
  return $ext;
} // Device_update_from_query_results

// --------------------------------------------------------------------

function LabSession_create_owner_placeholder($device_id, $user_id)
{
  // Make sure we don't already have this placeholder (we might if a prior enrollment attempt failed or was canceled)
  $ls = LabSession_for_device_and_user($device_id, $user_id, TRUE);
  if (!$ls) {
    $ls = NewRecordForTable('owner_lab_sessions');
    SetCVMulti($ls, ['last_checkin_time' => kDMCurrentTimestamp,
                     'device_id'         => $device_id,
                     'user_id'           => $user_id,
                     'is_owner'          => TRUE]);
  } else SetCV($ls, 'last_checkin_time', kDMCurrentTimestamp);
  SaveToDatabase($ls);
  return $ls;
} // LabSession_create_owner_placeholder

// --------------------------------------------------------------------

function LabSession_for_device_and_user($device_id, $user_id, $owner_only = FALSE, $select_modifier = '')
{
  // If the user_id is NULL, we're only going to find a match on the owner_lab_sessions table
  if (empty($user_id) || $owner_only) $ls = FindBySQL('owner_lab_sessions', 'WHERE device_id = :device_id LIMIT 1', ['device_id' => $device_id], $select_modifier);
  else $ls = FindBySQL('lab_sessions', 'WHERE device_id = :device_id AND user_id = :user_id LIMIT 1', ['device_id' => $device_id, 'user_id' => $user_id], $select_modifier);
  return $ls;
} // LabSession_for_device_and_user

// --------------------------------------------------------------------

// All callers of this function must eventually call SaveToDatabase() on the returned array
function LabSession_for_incoming_request($incoming_request, $dev = NULL, $auth_user = NULL)
{
  global $gLogLevel;
//  LogMsg(__FUNCTION__."incoming_request=".PrintArrayObscuringValuesForKeys($incoming_request), 3);
  if (empty($incoming_request['UDID']) || empty($incoming_request['UserID'])) return NULL;

  $dev_udid  = NormalizeUDID($incoming_request['UDID']);
  $user_guid = NormalizeGUID($incoming_request['UserID']);
  if ($gLogLevel > 1) LogMsg("dev_udid='$dev_udid', user_guid='$user_guid', auth_user=".PrintArrayObscuringValuesForKeys($auth_user), 2);

  if (isset($dev) && CV($dev, 'udid') != $dev_udid) unset($dev);      // If given a device record, make sure it matches the UDID of the incoming request
  if (empty($dev)) $dev = FindInDatabase('devices', 'udid', $dev_udid);
  if (empty($dev)) return NULL;

  $session = FindBySQL('lab_sessions', "WHERE user_guid = :user_guid AND device_id = :device_id LIMIT 1", ['user_guid' => $user_guid, 'device_id' => CV($dev, 'id')], 'FOR UPDATE');

  if (!$session || isset($auth_user)) {
    // Before we create a new LabSession record, make sure the user and device are valid
    $user = (isset($auth_user) ? $auth_user : FindInDatabase('users', 'guid', $user_guid));
    if (empty($user)) return NULL;

    if (!$session) {
      $session = NewRecordForTable('lab_sessions');
      SetCV($session, 'user_guid', $user_guid);
      SetCV($session, 'device_id', CV($dev, 'id'));
      if (!isset($auth_user)) SetCV($session, 'user_id', CV ($user, 'id'));
    }
  }

  SetCV($session, 'last_checkin_time',  kDMCurrentTimestamp);

  if ($gLogLevel > 2) LogMsg(__FUNCTION__.": LabSession for UserID $user_guid, UDID $dev_udid: ".Target_description($session, $dev), 3);
  return $session;
} // LabSession_for_incoming_request

//-------------------------------------------------------------------------

function LabSession_get_device($ls)
{
  $id = CV($ls, 'device_id');
  if (empty($id)) return FALSE;
  return FindInDatabase("devices", "id", $id);
} // LabSession_get_device

// --------------------------------------------------------------------

function LabSession_validate_auth_token($ls, $incoming_request)
{
  // Was an 'AuthToken' given? If not, the only allowed target is the owner's LabSession
  if (empty($incoming_request['AuthToken'])) {
    if (CV($ls, 'is_owner')) return TRUE;       // The database maintains the is_owner flag, so we don't need to check device ownership beyond checking this flag
  } else if (CV($ls, 'auth_token') == $incoming_request['AuthToken']) return TRUE;

  LogMsg("Failed auth for target ".Target_description($ls).", incoming_request=".PrintArrayObscuringValuesForKeys($incoming_request));
  return FALSE;
} // LabSession_validate_auth_token

//-------------------------------------------------------------------------

// All callers of this function must eventually call SaveToDatabase() on the returned value
function Target_for_client_certificate($for_checkin = FALSE)
{
  global $gNewURL, $gLogLevel, $gCheckinToken;

  if ($gLogLevel > 4) LogMsg(PrintArrayObscuringValuesForKeys($_SERVER), 5);

  // Try to extract the checkin_token from the CN value of the client's certificate to ensure the client isn't trying to spoof us.
  // If we're using the older URL, it's OK if we can't identify the client by CN.
  $gCheckinToken = $cn_device = NULL;
  $cn = '';
  if (!empty($_SERVER['SSL_CLIENT_S_DN_CN'])) $cn = trim($_SERVER['SSL_CLIENT_S_DN_CN']);
  if (empty($cn) && !empty($_SERVER['REDIRECT_SSL_CLIENT_S_DN_CN'])) $cn = trim($_SERVER['REDIRECT_SSL_CLIENT_S_DN_CN']);
  if ($gNewURL && empty($cn)) DieForbidden("No CN found in client certificate");

  if (!empty($cn)) {
    // Extract the UUID out of the CN.
    LogMsg(__FUNCTION__.": CN = '$cn'", 4);
    $i = strpos($cn, kSCEPCertCNPrefix);
    if ($i !== FALSE) $gCheckinToken = NormalizeUUID(trim(substr($cn, $i + strlen(kSCEPCertCNPrefix))));  // Will be NULL if not a valid-looking UUID
    elseif ($gNewURL) DieForbidden("Unrecognized CN found in client certificate '$cn'");

    LogMsg(__FUNCTION__.": checkin_token = '$gCheckinToken'", 2);
    if (!empty($gCheckinToken)) {
      $gNewURL = TRUE;    // We extracted a valid checkin_token from the CN so we need to behave as though we're using the new URL
      $cn_device = FindInDatabase('devices', 'active_checkin_token', $gCheckinToken);       // Always look for the device indicated by the checkin_token.
      // It might be OK if we didn't find the device (if we have a pending RemoveMDM task or this is a checkin request.
      // We'll return NULL and let the caller sort that out.
    } elseif ($gNewURL) DieForbidden("Invalid CN found in client certificate '$cn'");
  } // if (!empty($cn))

  return $cn_device;
} // Target_for_client_certificate

//-------------------------------------------------------------------------

// All callers of this function must eventually call SaveToDatabase() on the returned array
function Target_for_checkin_request($incoming_request)
{
  global $gNewURL, $gCheckinToken, $gLogLevel;

  // See if we know this target already
  $cn_device = NULL;
  // If Target_for_incoming_request returns a non-NULL value, it will be a fully-validated target (if using the new URLs),
  // but it still might not be a fully-enrolled target.
  $target = Target_for_incoming_request($incoming_request, TRUE, $cn_device);

  // We don't need to do a bunch of work for a CheckOut request. If we don't know the device, we'll just ignore it.
  if ($incoming_request['MessageType'] == 'CheckOut') return $target;
  if ($target) {
    // If we found a LabSession and it has a user_guid set, we're all done.
    // But if user_guid isn't set, this must be the first checkin request for the owner's LabSession and we need to set the user_guid to that given in the request
    if (Target_is_lab_session($target) && CV($target, 'is_owner') && EmptyCV($target, 'user_guid')) {
      // Make sure the checkin_token on the device is still valid, then accept the new user_guid value ($cn_device should be set from Target_for_incoming_request)
      if (!$cn_device) DieForbidden("No device found for target LabSession");
      if ((strtotime(CV($cn_device, 'checkin_token_valid_at')."GMT") + kDeviceMaxCheckinTime) < time()) DieForbidden("MDM binding profile expired for LabSession");
      SetCVMulti($target, ['user_guid' => $incoming_request['UserID'], 'auth_token' => NULL]);
    }
    return $target;   // Target is validated (but not necessarily authenticated, caller must handle that)
  }

  // If we're here, we have a device to enroll or a LabSession to setup.
  if (!$gNewURL) DieForbidden("old enrollment scheme not supported");

  if (!empty($incoming_request["UserID"])) {
    // Fetch the owner lab_session for the found $cn_device
    $d_id = CV($cn_device, 'id');
    $target = FindInDatabase('owner_lab_sessions', 'device_id', $d_id);
    if (!$target) {
      $target = NewRecordForTable('owner_lab_sessions');
      SetCVMulti($target, ['device_id' => $d_id, 'is_owner' => TRUE]);
    }
    SetCVMulti($target, ['user_guid' => $incoming_request["UserID"], 'last_checkin_time' => kDMCurrentTimestamp]);
  } else {
    // Look for a device pending on this checkin_token and make sure it hasn't expired
    $target = FindInDatabase('devices', 'pending_checkin_token', $gCheckinToken);
    if (!$target) DieForbidden("No pending device for checkin_token '$gCheckinToken'");
    if ((strtotime(CV($target, 'checkin_token_valid_at')."GMT") + kDeviceMaxCheckinTime) < time()) DieForbidden("MDM binding profile expired");
    
    // This is our first checkin request (probably Authenticate). We get here when we've found a device by its certificate, but there is no row 
    // with the UDID of the device. This is our first chance to verify whether the UDID (and eventually other fields) matches a known place
    // holder so we can enforce some of the user permissions. If enrollment is not authorized, we die here, and leave it to the garbage collection
    // function to clean up the dead row.
    if (!Device_can_be_enrolled_via_portal($target, $incoming_request)) DieForbidden("User does not have sufficient privileges to enroll device");

    // Found our device target, make the pending_checkin_token the active_checkin_token.
    // This will signal to the DB to complete device enrollment, including clearing "pending_checkin_token" so we don't get here again w/o a new enrollment profile.
    SetCVMulti($target, ['udid' => $incoming_request['UDID'], 'active_checkin_token' => $gCheckinToken]);  // Set the actual UDID and active token, will set the new user_id
  }
  return $target;
} // Target_for_checkin_request

//-------------------------------------------------------------------------

// All callers of this function must eventually call SaveToDatabase() on the returned value
function Target_for_incoming_request($incoming_request, $for_checkin = FALSE, &$cn_device = NULL)
{
  global $gLogLevel, $gCheckinToken;

  // In this function, $req_target is the target (device or lab_session) as identified by the body of the request,
  // while $cn_device is the device (only) that is identified by the client certificate (if supported by the device)
  $gCheckinToken = $cn_device = $req_target = NULL;
  $ir_str = ($gLogLevel > 1 ? "\nFor request:\n".PrintArrayObscuringValuesForKeys($incoming_request) : '');

  // Try to extract the checkin_token from the CN value of the client's certificate to ensure the client isn't trying to spoof us.
  // If we're using the older URL, it's OK if we can't identify the client by CN, but regardless of URL, if we do extract a
  // checkin_token from the CN, it MUST match the device specified in the request. Additionally, if we are unable to extract the
  // checkin_token from the CN (using the old URL) but the device is known to have a certificate that has an identifiable CN,
  // reject the request. The only way a target can be considered valid with an older cert that doesn't have an identifiable CN
  // is iff:
  //    1) The client is using the old checkin/connect URLs
  //    2) the client is KNOWN to NOT have an identifiable CN
  //    3) the CN is, in fact, not identifiable.
  $cn_device = Target_for_client_certificate($for_checkin); // Sets $gCheckinToken if it's available
  if (!$cn_device && !empty($gCheckinToken)) {
    // We didn't find a device for an apparently valid checkin_token. This is only OK if:
    // 1) we're using the new URL and being called at checkin, as this suggests a newly-enrolled device is talking to us for the first time, or
    // 2) there is a pending RemoveMDM task where the task's uuid is equal to the CN of the device that's connected
    if (!$for_checkin) {
      $req_target = FindBySQL('mdm_tasks', "WHERE uuid = :uuid AND task_type = 'RemoveMDM' AND completed_at IS NULL", ['uuid' => $gCheckinToken]);
      if (!$req_target) DieForbidden("Device not found for CN '$gCheckinToken'");
      LogMsg("Found target for RemoveMDM task for CN '$gCheckinToken'$ir_str", 1);
      return $req_target;
    }
    return NULL;   // Not a token for an active device, but the caller will want to look for a matching pending_checkin_token, so don't throw an exception
  }

  // Find the target as specified by the request.
      if (!empty($incoming_request["UserID"])) $req_target = LabSession_for_incoming_request($incoming_request, $cn_device);
  elseif (!empty($incoming_request['UDID']))   $req_target = FindInDatabase('devices', 'udid', $incoming_request['UDID'], 'FOR UPDATE');
  else DieBadRequest("no UserID or UDID specified");

  if ($req_target) {
    if ($cn_device) {  // This will be set only when we have a client certificate with the token encoded into CN
      // Make sure the token in the client's cert's CN matches what we expect. (The checkin_token is only stored on the 'devices' table.)
      if (Target_is_lab_session($req_target)) {
        if (CV($req_target, 'device_id') != CV($cn_device, 'id')) DieForbidden("LabSession belongs to different device");
      } else {
        if (CV($req_target, 'id') != CV($cn_device, 'id')) DieForbidden("Device certificate's CN does not correspond to the request's UDID");
      }
    } else if (!Target_is_lab_session($req_target) && !EmptyCV($req_target, 'active_checkin_token')) DieForbidden("Device which has identifiable certificate did not present it");

    SetCV($req_target, 'last_checkin_time', kDMCurrentTimestamp);
  }

  if ($req_target) LogMsg("Found target ".Target_description($req_target, $cn_device).$ir_str, 1);
  else LogMsg("Target not found $ir_str", 2);

  return $req_target;
} // Target_for_incoming_request

//-------------------------------------------------------------------------

function Target_description($target, $device = NULL)
{
  global $gLogLevel;
  if (Target_is_task($target)) return "Task: ".CV($target, 'task_type');

  $is_ls = Target_is_lab_session($target);
  $tid   = CV($target, 'id');
  $uid   = CV($target, 'user_id');
  $short = '';
  $guid  = '';
  if ($gLogLevel > 1 && !empty($uid)) {
    if (!empty($uid))  $user = FindInDatabase('users', 'id', $uid);
    if (!empty($user)) {
      $short = CV($user, 'short_name');
      $guid  = CV($user, 'guid');
    }
  }

  if ($is_ls) { // LabSession
    // Get info we might need
    $did   = CV($target, 'device_id');
    $type  = (CV($target, 'is_owner') ? "OWNER LS" : "NETWORK LS");
    $cguid = CV($target, 'user_guid');
    if (empty($device) && $gLogLevel > 1) $device = LabSession_get_device($target);

    // Now build the description
    $dev_name = ($device ? CV($device, 'DeviceName') : "Device[$did]");
    if ($gLogLevel > 1) {
      $user_name = (!empty($short) ? $short : "User")."[$uid]";
      $user_name .= (!empty($guid) ? "(S-GUID:$guid, C-GUID:$cguid)" : "(C-GUID:$cguid)");
      if ($device) {
        $token = CV($device, 'active_checkin_token');
        if (empty($token)) $token = CV($device, 'pending_checkin_token');
        $sn = CV($device, 'SerialNumber');
        $dev_name .= "(SN:$sn, CN:$token)";
      }
    } else $user_name = (!empty($short) ? $short : "User[$uid]");
    
    $desc = "$type: <$user_name@$dev_name>";
  } else {      // Device
    $dev_name = CV($target, 'DeviceName');
    $dev_name = "'$dev_name'[$tid]";
    $type = CV($target, 'mdm_target_type');
    switch ($type) {
    case 'ios': $type = 'iOS'; break;
    case 'mac': $type = 'Mac'; break;
    case 'tv':  $type = 'AppleTV'; break;
    default:    $type = 'UNKNOWN';
    }
    if ($gLogLevel > 1) {
      $user_name = (!empty($uid) ? (!empty($short) ? $short : "User")."[$uid](S-GUID:$guid)" : '');
      $token = CV($target, 'active_checkin_token');
      if (empty($token)) $token = CV($target, 'pending_checkin_token');
      $sn = CV($target, 'SerialNumber');
      if (!empty($user_name)) $user_name = " OWNER:$user_name";
      $desc = "$type: <$dev_name(SN:$sn, CN:$token)$user_name>";
    } else {
      $user_name = (!empty($uid) ? (!empty($short) ? $short : "User[$uid]") : '');
      if (!empty($user_name)) $user_name = "(OWNER:$user_name)";
      $desc = "$type: <$dev_name$user_name>";
    }
  }

  return $desc;
} // Target_description

//-------------------------------------------------------------------------

function Target_get_extended_data(&$target, $select_modifier = '')
{
  $id = CV($target, 'id');
  if (empty($id)) {
    SaveToDatabase($target);      // Save the new device row so the library_item_metadata row is created, too
    ReloadFromDatabase($target);
    $id = CV($target, 'id');
  }

  $ext = FindInDatabase('library_item_metadata', 'id', $id, $select_modifier);
  if (empty($ext)) DieInternalError("No library_item_metadata found!");
  return $ext;
} // Target_get_extended_data

//-------------------------------------------------------------------------

function Target_has_blocked_tasks($tid)
{
  $result = ExecuteSQLFunction('dm_mdm_target_blocked_tasks_count', ['target_id' => $tid]);
  return (empty($result[0]) || empty($result[0]['dm_mdm_target_blocked_tasks_count']) ? 0 : $result[0]['dm_mdm_target_blocked_tasks_count']);
} // Target_has_blocked_tasks

//-------------------------------------------------------------------------

function Target_is_ios($target)
{
  return (FromTable($target, 'devices') && CV($target, 'mdm_target_type') != 'mac');
} // Target_is_ios

// --------------------------------------------------------------------

function Target_is_lab_session($target)
{
  return (FromTable($target, 'lab_sessions') || FromTable($target, 'owner_lab_sessions') || FromTable($target, 'network_lab_sessions'));
} // Target_is_lab_session

//-------------------------------------------------------------------------

function Target_is_mac($target)
{
  return (Target_is_lab_session($target) || CV($target, 'mdm_target_type') == 'mac');
} // Target_is_mac

//-------------------------------------------------------------------------

function Target_is_task($target)
{
  return FromTable($target, 'mdm_tasks');
} // Target_is_task

//-------------------------------------------------------------------------
