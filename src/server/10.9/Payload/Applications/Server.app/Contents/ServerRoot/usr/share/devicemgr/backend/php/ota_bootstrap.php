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
require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/auth.php");
require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/i18n.php");

//-------------------------------------------------------------------------

function _generate_ota_bootstrap_profile($challenge)
{
   $cur_settings = GetSettings();
   $ota_bootstrap_url = URLBase()."/devicemanagement/api/device/auto_join_ota_service";

   $profile_hash = [ "PayloadDisplayName"       => I18n_t("ota_profile_display_name"),
                     "PayloadIdentifier"        => "com.apple.ota.".GetServerHostname().".bootstrap",
                     "PayloadRemovalDisallowed" => FALSE,
                     "PayloadType"              => "Configuration",
                     "PayloadUUID"              => GenerateUUID(),
                     "PayloadVersion"           => 1,
                     "PayloadOrganization"      => $cur_settings["server_organization"],
                     "PayloadDescription"       => I18n_t("ota_profile_description"),
                     "PayloadType"              => "Profile Service",
                     "PayloadContent"           => [ "URL"              => $ota_bootstrap_url,
                                                     "DeviceAttributes" => ["DEVICE_NAME", "UDID", "IMEI", "MEID", "DeviceID", "SERIAL", "VERSION", "PRODUCT", "COMPROMISED"],
                                                     "Challenge"        => $challenge
                                                   ],
                     "ConfirmInstallation"      => TRUE,
                   ];

  $profile = plist_encode_xml($profile_hash);
  LogMsg($profile, 1);
  return SignData($profile);
} // _generate_ota_bootstrap_profile

//-------------------------------------------------------------------------

try {
  VerifyAuthToken();     // Does not return if it can't verify

  if (empty($_POST['device_identifier']) || empty($_POST['device_type'])) DieBadRequest();
  $device_identifier = $_POST['device_identifier'];
  $device_type       = $_POST['device_type'];
  if (isset($_POST['lab_mode'])) $lab_mode = $_POST['lab_mode'];

  $u_session = LoadPHPSession();
  if (empty($u_session)) DieUnauthorized("no session");
  if (empty($u_session['generated_uid'])) DieUnauthorized("invalid generated_uid");
  $user_guid = $u_session['generated_uid'];

  // There's nothing here that should interfere with other transactions, so to avoid lots of transaction contention
  // during mass-enrollments, we'll not use a transaction around this stuff
  
  $user_guid = strtoupper($user_guid);
  $user = FindInDatabase('users', 'guid', $user_guid);
  if (!$user) DieUnauthorized("user not found");
  // LogMsg("user=".PrintArrayObscuringValuesForKeys($user));

  $device = FindInDatabase('devices', 'identifier', $device_identifier);
  // LogMsg("device=".PrintArrayObscuringValuesForKeys($device));
  if (!$device) {
    $device = NewRecordForTable("devices");
    SetCV($device, 'identifier',    $device_identifier);
    $checkin_token = NULL;
  } else $checkin_token = CV($device, 'checkin_token');          // We need to reuse the checkin_token

  if (empty($checkin_token)) {
    $checkin_token = GenerateUUID();
    SetCV($device, 'checkin_token', $checkin_token);             // Only set this token once!
  }

  SetMultiCV($device, [ 'pending_user_id'        => CV($user, 'id'),
                        'checkin_token_valid_at' => kDMCurrentTimestamp,  // Make the token valid (again)
                        'last_checkin_time'      => kDMCurrentTimestamp,
                        'mdm_target_type'        => (stripos($device_type, 'mac') !== FALSE ? 'mac' : 'ios')
                      ]);
  SaveToDatabase($device);
  $final_output = _generate_ota_bootstrap_profile($checkin_token);

  header('Content-Type: application/x-apple-aspen-config');
  header('Content-Disposition: attachment; filename="ota_profile.mobileconfig"');
} catch (Exception $e) {
  ProcessException($e);   // Does not return
}

SendFinalOutput($final_output);
