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
require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/auth.php");
require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/plist.php");
require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/target.php");
require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/i18n.php");

$kServerCapabilities = [ "com.apple.mdm.per-user-connections" ];

//-------------------------------------------------------------------------

function _getScepRootCert($od_master)
{
  $cert = apc_fetch("ScepRootCert");
  if (empty($cert)) {
    $cert = dmx_get_scep_root_certificate($od_master);
    if (!empty($cert)) apc_store("ScepRootCert", $cert);
  }
  return $cert;
} // _getScepRootCert

//-------------------------------------------------------------------------

function GenerateMDMBindingProfile($mdm_acl, $checkin_token)
{
  global $gNewURL, $kServerCapabilities;

  $cur_settings = GetSettings();
  $hostname     = GetServerHostname();
  $od_master    = $cur_settings["od_master"];
  $scep_host    = ($od_master == "127.0.0.1" ? $hostname : $od_master);

  $raw_root_cert  = _getScepRootCert($od_master);
  if (empty($raw_root_cert)) DieInternalError("Could not retrieve root certificate from open directory server.");
  $scep_url       = getSCEPUrl($scep_host);
  if (empty($scep_url)) DieInternalError("Could not retrieve SCEP server URL.");
  $scep_challenge = dmx_get_scep_challenge_for_host($od_master);
  if (empty($scep_challenge)) DieInternalError("Could not retrieve SCEP challenge.");

  $root_cert   = preg_replace('/-+(BEGIN|END) CERTIFICATE-+/', "", $raw_root_cert);
  $fingerprint = sha1(base64_decode($root_cert), TRUE);
  $scep_uuid   = GenerateUUID();

  $base = URLBase().'/'.PM_PHP_OLD_URI_ROOT;  // Have to use OLD path because all previously enrolled devices used this path and we can't change it without re-enrolling
  if (CHECK_CLIENT_CERTS && $gNewURL) {
    $checkin_url = "$base/mdm_checkin";
    $server_url  = "$base/mdm_connect";
  } else {
    $checkin_url = "$base/checkin";
    $server_url  = "$base/connect";
  }
  $root_payload_identifier = "com.apple.config.$hostname.mdm";

  $organization = $cur_settings["server_organization"];
  $profile_hash = [ "PayloadContent" => [
                      [  // SCEP payload
                        "PayloadContent" => [
                          "CAFingerprint" => new PlistData($fingerprint),
                          "Challenge"     => $scep_challenge,
                          "Keysize"       => 1024,
                          "Key Type"      => 'RSA',
                          "Key Usage"     => 0,
                          "Name"          => 'Device Management Identity Certificate',
                          "Subject"       => [ [ [ 'CN', kSCEPCertCNPrefix.$checkin_token ] ] ],
                          "URL"           => $scep_url,
                        ],
                        "PayloadDescription"  => 'Configures SCEP',
                        "PayloadDisplayName"  => I18n_t('mdm_profile_cred_display_name'),
                        "PayloadIdentifier"   => 'com.apple.mdmconfig.SCEP',
                        "PayloadOrganization" => $organization,
                        "PayloadType"         => 'com.apple.security.scep',
                        "PayloadUUID"         => $scep_uuid,
                        "PayloadVersion"      => 1,
                      ],
                      [  // MDM binding payload
                        "AccessRights"            => $mdm_acl,
                        "CheckInURL"              => $checkin_url,
                        "CheckOutWhenRemoved"     => TRUE,
                        "IdentityCertificateUUID" => $scep_uuid,
                        "PayloadDescription"      => I18n_t('mdm_payload_description'),
                        "PayloadDisplayName"      => I18n_t('mdm_payload_display_name'),
                        "PayloadIdentifier"       => "com.apple.mdmconfig.mdm",
                        "PayloadOrganization"     => $organization,
                        "PayloadType"             => "com.apple.mdm",
                        "PayloadUUID"             => GenerateUUID(),
                        "PayloadVersion"          => 1,
                        "ServerCapabilities"      => $kServerCapabilities,
                        "ServerURL"               => $server_url,
                        "Topic"                   => $cur_settings["apns_topic"],
                      ],
                  ],
                  "PayloadDescription"  => I18n_t("mdm_profile_description"),
                  "PayloadDisplayName"  => I18n_t("mdm_profile_display_name"),
                  "PayloadIdentifier"   => $root_payload_identifier,
                  "PayloadOrganization" => $organization,
                  "PayloadType"         => "Configuration",
                  "PayloadUUID"         => GenerateUUID(),
                  "PayloadVersion"      => 1,
                ];

  // Add the trust certificate payloads if we have any
  $trust = ParseJSON($cur_settings['trust_payloads']);
  if (!empty($trust)) {
    foreach ($trust as $pl) {
      $pl['PayloadOrganization'] = $organization;
      $pl['PayloadDescription']  = sprintf(I18n_t("trust_payload_description"), $organization);
      $pl['PayloadDisplayName']  = sprintf(I18n_t("trust_payload_display_name"), $organization);
      $pl['PayloadContent']      = new PlistData($pl['PayloadContent'], TRUE);    // Wrap it so it's output as <data> and not <string>
      $profile_hash['PayloadContent'][] = $pl;
    }
  }

  $profile = plist_encode_xml($profile_hash);
  LogMsg($profile, 2);
  header("Connection: close", true);   // Tell the client to close the connection after sending the enrollment profile
  return SignData($profile);
} // GenerateMDMBindingProfile

//-------------------------------------------------------------------------

function GetMDMACLFromBuildVersion($buildVers, $isIOS)
{
  $mdm_acl = 4095;    // The minimum set of access rights all supported devices will grant
  if ($isIOS) {
    $vers = preg_split("/[A-Z]/i", $buildVers, 1);
    if ($vers[0] >= 9) $mdm_acl |= 4096; // "9Axxxx" is the start of iOS 5
  } else {
    $vers = preg_split("/[A-Z]/i", $buildVers, 1);
    if ($vers[0] >= 13) $mdm_acl |= 4096; // "13Axxxx" is the start of OSX 10.9
  }
  return $mdm_acl;
} // GetMDMACLFromBuildVersion

//-------------------------------------------------------------------------

function GetMDMACLFromUserAgentHeader(&$is_mac = NULL)
{
  $mdm_acl = 4095;    // The minimum set of access rights all supported devices will grant
  $ua = $_SERVER['HTTP_USER_AGENT'];
  LogMsg("User-Agent: $ua", 2);

  // Sample User-Agent strings from various OS/browser combinations
  // iOS 7 iPhone Safari: (iPhone; CPU iPhone OS 7_0 like Mac OS X)
  // iOS 7 iPhone Chrome: (iPhone; CPU iPhone OS 7_0 like Mac OS X)
  // iOS 6 iPad Safari: (iPad; CPU OS 6_1_3 like Mac OS X)
  // iOS 6 iPad Chrome: (iPad; CPU OS 6_1_3 like Mac OS X)  
  // iOS 5 iPad Safari: (iPad; CPU OS 5_1_1 like Mac OS X)
  // OSX 10.9 Safari: (Macintosh; Intel Mac OS X 10_9)
  // OSX 10.9 Firefox: (Macintosh; Intel Mac OS X 10.9; rv:20.0)
  // OSX 10.9 Chrome: (Macintosh; Intel Mac OS X 10_9_0)
  // OSX 10.8 Safari: (Macintosh; Intel Mac OS X 10_8_4)
  // OSX 10.8 Firefox: (Macintosh; Intel Mac OS X 10.8; rv:22.0)
  // OSX 10.8 Chrome: (Macintosh; Intel Mac OS X 10_8_4)

  $is_mac = (stripos($ua, "Macintosh") !== FALSE);

  if ($is_mac) {
    if (preg_match("/^.*OS X ([0-9_.]+).*/", $ua, $matches)) {
      $vers = str_replace('_', '.', $matches[1]);
      LogMsg("OSX version $vers", 1);
      if (CompareVersionStrings($vers, '10.9') >= 0) $mdm_acl |= 4096; // OS X 10.9 and later
    } else DieInternalError("Unable to identify OSX version from User-Agent header");
  } else {
    if (preg_match("/^.*OS ([0-9_.]+).*/", $ua, $matches)) {
      $vers = str_replace('_', '.', $matches[1]);
      LogMsg("iOS version $vers", 1);
      if (CompareVersionStrings($vers, '5.0') >= 0) $mdm_acl |= 4096;  // iOS 5 and later
    } else DieInternalError("Unable to identify iOS version from User-Agent header");
  }
  return $mdm_acl;
} // GetMDMACLFromBuildVersion

//-------------------------------------------------------------------------

function _generate_scep_profile($device)
{
  $cur_settings = GetSettings();
  $hostname     = GetServerHostname();
  $od_master    = $cur_settings["od_master"];
  $scep_host    = ($od_master == "127.0.0.1" ? $hostname : $od_master);

  $raw_root_cert  = _getScepRootCert($od_master);
  if (empty($raw_root_cert)) DieInternalError("Could not retrieve root certificate from open directory server.");
  $scep_url       = getSCEPUrl($scep_host);
  if (empty($scep_url)) DieInternalError("Could not retrieve SCEP server URL.");
  $scep_challenge = dmx_get_scep_challenge_for_host($od_master);
  if (empty($scep_challenge)) DieInternalError("Could not retrieve SCEP challenge.");

  $root_cert   = preg_replace('/-+(BEGIN|END) CERTIFICATE-+/', "", $raw_root_cert);
  $fingerprint = sha1(base64_decode($root_cert), TRUE); // SHA1.hexdigest(root_cert.to_der).to_a.pack("H*");
  $scep_uuid   = GenerateUUID();

  $organization = $cur_settings["server_organization"];
  $profile_hash = [ "PayloadContent" =>
                    [
                      [
                        "PayloadContent" => [
                          "CAFingerprint" => new PlistData($fingerprint),
                          "Challenge"     => $scep_challenge,
                          "Keysize"       => 1024,
                          "Key Type"      => "RSA",
                          "Key Usage"     => 0,
                          "Name"          => "Device Management Identity Certificate",
                          "Subject"       => [ [ [ "CN", "Device Management Identity Certificate" ] ] ],
                          "URL"           => $scep_url,
                        ],
                        "PayloadDescription"  => I18n_t("scep_payload_description"),
                        "PayloadDisplayName"  => I18n_t("scep_payload_display_name"),
                        "PayloadIdentifier"   => "com.apple.mdmconfig.SCEP",
                        "PayloadOrganization" => $organization,
                        "PayloadType"         => "com.apple.security.scep",
                        "PayloadUUID"         => $scep_uuid,
                        "PayloadVersion"      => 1,
                      ]
                    ],
                    "PayloadDescription"       => I18n_t("scep_profile_description"),
                    "PayloadDisplayName"       => I18n_t("scep_profile_display_name"),
                    "PayloadIdentifier"        => "com.apple.$hostname.scepconfig",
                    "PayloadOrganization"      => $organization,
                    "PayloadRemovalDisallowed" => false,
                    "PayloadType"              => "Configuration",
                    "PayloadUUID"              => GenerateUUID(),
                    "PayloadVersion"           => 1,
                  ];

  $profile = plist_encode_xml($profile_hash);
  LogMsg($profile, 2);
  return SignData($profile);
} // _generate_scep_profile

//-------------------------------------------------------------------------

function _ota_service_transaction_challenge($incoming_request)
{
  $aj_profile = FindInDatabase('auto_join_profiles', 'reg_challenge', $incoming_request['CHALLENGE'], 'FOR UPDATE');
  if (!$aj_profile) DieUnauthorized("Auto Enrollment Profile not found");

  if (empty($incoming_request['UDID'])) DieForbidden("No UDID specified");
  $device = Device_find_by_query_results($incoming_request, 'FOR UPDATE');
  if (!$device) {
    if (!CV($aj_profile, 'is_wildcard')) DieUnauthorized("Device not in device list");
    $device = NewRecordForTable('devices');
  }
  SetCVMulti($device, ['pending_checkin_token' => GenerateUUID(), 'checkin_token_valid_at' => kDMCurrentTimestamp, 'pending_user_id' => NULL]);

  $ext = Device_update_from_query_results($device, $incoming_request);   // Auto-enrollment profiles don't set a user on the device
  SaveToDatabase($device);

  $usage = NewRecordForTable('auto_join_profile_usage');
  SetCVMulti($usage, ['auto_join_profile_id' => CV($aj_profile, 'id'), 'device_id' => CV($device, 'id')]);
  SaveToDatabase($usage, FALSE);

  unset($incoming_request["CHALLENGE"]);
  unset($incoming_request["UDID"]);
  return array_merge($incoming_request, $device);
} // _ota_service_transaction_challenge

//-------------------------------------------------------------------------

function _ota_service_transaction_udid($incoming_request)
{
  $device = FindInDatabase('devices', 'udid', $incoming_request['UDID'], 'FOR UPDATE');
  if (!$device) DieUnauthorized("Device Not Found");

  // At this point, the enrollment is approved and should complete, so clear/set stuff that we wouldn't want to clear/set earlier in the process
  SetCVMulti($device, ['last_checkin_time' => kDMCurrentTimestamp, 'pending_user_id' => NULL]);

  $ext = Target_get_extended_data($device);
  SetCVDAMulti($ext, ['ProfileList' => NULL, 'ProvisioningProfileList' => NULL]);
  SaveToDatabase($ext);
  $mdm_acl = GetMDMACLFromBuildVersion(CVDA($ext, 'BuildVersion'), Target_is_ios($device));
  SetCV($device, 'mdm_acl', $mdm_acl);
  SaveToDatabase($device);
  return $device;
} // _ota_service_transaction_udid

//-------------------------------------------------------------------------

function getSCEPUrl($hostname = '')
{ 
  if (empty($hostname)) $hostname = "127.0.0.1";
  return "http://$hostname:1640/scep/"; 
} // getSCEPUrl

//-------------------------------------------------------------------------

function OTAServiceCommon()   // This is only used for auto-enrollment profiles now
{
  $body = file_get_contents('php://input');
  $incoming_request = dmx_extract_signed_data($body);
  if (!CHECK_CLIENT_CERTS && empty($incoming_request)) $incoming_request = $body;
  if (empty($incoming_request)) DieBadRequest("invalid signature");

  $incoming_request = plist_decode($incoming_request);
  if (empty($incoming_request)) DieBadRequest("invalid plist");

  $incoming_request = NormalizeIncomingRequest($incoming_request);

  LogMsg("OTAServiceCommon: incoming_request = ".PrintArrayObscuringValuesForKeys($incoming_request), 2);

  if (!empty($incoming_request['CHALLENGE'])) {
    $device = PerformInTransaction('_ota_service_transaction_challenge', $incoming_request);
    $final_output = _generate_scep_profile($device);               // Don't do this inside the transaction--it's very expensive and doesn't modify any DB records
  } elseif (!empty($incoming_request["UDID"])) {
    $device = PerformInTransaction('_ota_service_transaction_udid', $incoming_request);
    $final_output = GenerateMDMBindingProfile(CV($device, 'mdm_acl'), CV($device, 'pending_checkin_token')); // Another thing we shouldn't be doing inside of a transaction
  } else {
    LogMsg(basename(__FILE__).": incoming_request=".PrintArrayObscuringValuesForKeys($incoming_request));
    DieBadRequest("Invalid request");
  }

  return $final_output;
} // OTAServiceCommon

