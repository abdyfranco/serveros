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
require_once('/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/plist.php');
require_once('/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/target.php');
require_once('/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/i18n.php');

$kServerCapabilities = [ 'com.apple.mdm.per-user-connections' ];

//-------------------------------------------------------------------------

function GenerateMDMBindingProfile($device, $cert)
{
  global $gNewURL, $kServerCapabilities;

  $hostname  = GetServerHostname();
  $settings  = GetSettings();
  $scep_url  = getSCEPUrl($hostname);
  $scep_cert = FindInDatabase('view_current_scep_ca_cert', 'usage_type', 'SCEP_CA');
  if (empty($scep_cert)) DieInternalError('Could not retrieve SCEP CA certificate.');
  $raw_root_cert  = CV($scep_cert, 'certificate');
  if (empty($raw_root_cert)) DieInternalError('SCEP CA certificate is empty.');

  $fingerprint = str_replace(':', '', CV($scep_cert, 'sha256_fingerprint'));   // Remove any colons from the fingerprint
  $scep_uuid   = GenerateUUID();

  $base = URLBase().PM_PHP_OLD_URI_ROOT;  // Have to use OLD path because all previously enrolled devices used this path and we can't change it without re-enrolling
  if (CHECK_CLIENT_CERTS && $gNewURL) {
    $checkin_url = "$base/mdm_checkin";
    $server_url  = "$base/mdm_connect";
  } else {
    $checkin_url = "$base/checkin";
    $server_url  = "$base/connect";
  }
  $root_payload_identifier = "com.apple.config.$hostname.mdm";
  $checkin_token = CV($device, 'pending_checkin_token');
  if (empty($checkin_token)) $checkin_token = CV($device, 'active_checkin_token');

  $organization = $settings['server_organization'];
  $profile_hash = [ 'PayloadContent' => [
                      [  // SCEP payload
                        'PayloadContent' => [
                          'CAFingerprint' => new PlistData($fingerprint),
                          'Challenge'     => CV($cert, 'scep_challenge'),
                          'Keysize'       => 2048,
                          'Key Type'      => 'RSA',
                          'Key Usage'     => 0,
                          'Name'          => 'Profile Manager Device Identity CA',
                          'Subject'       => [ [ [ 'CN', kSCEPCertCNPrefix.$checkin_token ] ] ],
                          'URL'           => $scep_url,
                        ],
                        'PayloadDescription'  => 'Configures SCEP',
                        'PayloadDisplayName'  => I18n_t('mdm_profile_cred_display_name'),
                        'PayloadIdentifier'   => 'com.apple.mdmconfig.SCEP',
                        'PayloadOrganization' => $organization,
                        'PayloadType'         => 'com.apple.security.scep',
                        'PayloadUUID'         => $scep_uuid,
                        'PayloadVersion'      => 1,
                      ],
                      [  // MDM binding payload
                        'AccessRights'            => CV($device, 'mdm_acl'),
                        'CheckInURL'              => $checkin_url,
                        'CheckOutWhenRemoved'     => TRUE,
                        'IdentityCertificateUUID' => $scep_uuid,
                        'PayloadDescription'      => I18n_t('mdm_payload_description'),
                        'PayloadDisplayName'      => I18n_t('mdm_payload_display_name'),
                        'PayloadIdentifier'       => 'com.apple.mdmconfig.mdm',
                        'PayloadOrganization'     => $organization,
                        'PayloadType'             => 'com.apple.mdm',
                        'PayloadUUID'             => GenerateUUID(),
                        'PayloadVersion'          => 1,
                        'ServerCapabilities'      => $kServerCapabilities,
                        'ServerURL'               => $server_url,
                        'Topic'                   => $settings['apns_topic'],
                      ],
                  ],
                  'PayloadDescription'  => I18n_t('mdm_profile_description'),
                  'PayloadDisplayName'  => I18n_t('mdm_profile_display_name'),
                  'PayloadIdentifier'   => $root_payload_identifier,
                  'PayloadOrganization' => $organization,
                  'PayloadType'         => 'Configuration',
                  'PayloadUUID'         => GenerateUUID(),
                  'PayloadVersion'      => 1,
                ];

  // Add the trust certificate payloads if we have any
  $trust = ParseJSON($settings['trust_payloads']);
  if (!empty($trust)) {
    foreach ($trust as $pl) {
      $pl['PayloadOrganization'] = $organization;
      $pl['PayloadDescription']  = sprintf(FixFmt(I18n_t('trust_profile_description')),  $organization);
      $pl['PayloadDisplayName']  = sprintf(FixFmt(I18n_t('trust_profile_display_name')), $organization);
      $pl['PayloadContent']      = new PlistData($pl['PayloadContent'], TRUE);    // Wrap it so it's output as <data> and not <string>
      $profile_hash['PayloadContent'][] = $pl;
    }
  }

  LogMsg("profile_hash=\n".PrintArrayObscuringValuesForKeys($profile_hash), 3);

  $profile = plist_encode_xml($profile_hash);
  LogMsg($profile, 2);
  header('Connection: close', true);   // Tell the client to close the connection after sending the enrollment profile
  return SignData($profile);
} // GenerateMDMBindingProfile

//-------------------------------------------------------------------------

function GetMDMACLFromBuildVersion($buildVers, $isIOS)
{
  $mdm_acl = 4095;    // The minimum set of access rights all supported devices will grant
  if ($isIOS) {
    $vers = preg_split('/[A-Z]/i', $buildVers, 1);
    if ($vers[0] >= 9) $mdm_acl |= 4096; // '9Axxxx' is the start of iOS 5
  } else {
    $vers = preg_split('/[A-Z]/i', $buildVers, 1);
    if ($vers[0] >= 13) $mdm_acl |= 4096; // '13Axxxx' is the start of OSX 10.9
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

  $is_mac = (stripos($ua, 'Macintosh') !== FALSE);

  if ($is_mac) {
    if (preg_match('/^.*OS X ([0-9_.]+).*/', $ua, $matches)) {
      $vers = str_replace('_', '.', $matches[1]);
      LogMsg("OSX version $vers", 1);
      if (CompareVersionStrings($vers, '10.9') >= 0) $mdm_acl |= 4096; // OS X 10.9 and later
    } else DieInternalError('Unable to identify OSX version from User-Agent header');
  } else {
    if (preg_match('/^.*OS ([0-9_.]+).*/', $ua, $matches)) {
      $vers = str_replace('_', '.', $matches[1]);
      LogMsg("iOS version $vers", 1);
      if (CompareVersionStrings($vers, '5.0') >= 0) $mdm_acl |= 4096;  // iOS 5 and later
    } else DieInternalError('Unable to identify iOS version from User-Agent header');
  }
  return $mdm_acl;
} // GetMDMACLFromBuildVersion

//-------------------------------------------------------------------------

function _generate_scep_profile($cert)
{
  $hostname  = GetServerHostname();
  $settings  = GetSettings();
  $scep_url  = getSCEPUrl($hostname);
  $scep_cert = FindInDatabase('view_current_scep_ca_cert', 'usage_type', 'SCEP_CA');
  if (empty($scep_cert)) DieInternalError('Could not retrieve SCEP CA certificate.');
  $raw_root_cert  = CV($scep_cert, 'certificate');
  if (empty($raw_root_cert)) DieInternalError('SCEP CA certificate is empty.');

  $fingerprint = str_replace(':', '', CV($scep_cert, 'sha256_fingerprint'));   // Remove any colons from the fingerprint

  $organization = $settings['server_organization'];
  $profile_hash = [ 'PayloadContent' => [
                      [ 'PayloadContent' => [
                          'CAFingerprint' => new PlistData($fingerprint),
                          'Challenge'     => CV($cert, 'scep_challenge'),
                          'Keysize'       => 1024,
                          'Key Type'      => 'RSA',
                          'Key Usage'     => 0,
                          'Name'          => 'Profile Manager Device Identity CA',
                          'Subject'       => [ [ [ 'CN', 'OTA Device Management Identity Certificate' ] ] ],
                          'URL'           => $scep_url,
                        ],
                        'PayloadDescription'  => I18n_t('scep_payload_description'),
                        'PayloadDisplayName'  => I18n_t('scep_payload_display_name'),
                        'PayloadIdentifier'   => 'com.apple.mdmconfig.SCEP',
                        'PayloadOrganization' => $organization,
                        'PayloadType'         => 'com.apple.security.scep',
                        'PayloadUUID'         => GenerateUUID(),
                        'PayloadVersion'      => 1,
                      ],
                    ],
                    'PayloadDescription'       => I18n_t('scep_profile_description'),
                    'PayloadDisplayName'       => I18n_t('scep_profile_display_name'),
                    'PayloadIdentifier'        => "com.apple.$hostname.scepconfig",
                    'PayloadOrganization'      => $organization,
                    'PayloadRemovalDisallowed' => FALSE,
                    'PayloadType'              => 'Configuration',
                    'PayloadUUID'              => GenerateUUID(),
                    'PayloadVersion'           => 1,
                  ];

  $profile = plist_encode_xml($profile_hash);
  LogMsg($profile, 2);
  return SignData($profile);
} // _generate_scep_profile

//-------------------------------------------------------------------------

function _ota_service_transaction_challenge($incoming_request)
{
  $aj_profile = FindInDatabase('auto_join_profiles', 'reg_challenge', $incoming_request['CHALLENGE']);
  if (!$aj_profile) DieUnauthorized('Auto Enrollment Profile not found');

  $device = Device_find_by_query_results($incoming_request);
  if (empty($device)) {
    if (!CV($aj_profile, 'is_wildcard')) DieUnauthorized('Device not in device list');
    $device = NewRecordForTable('devices');
  }
  $checkin_token = GenerateUUID();
  SetCVMulti($device, [ 'pending_checkin_token' => $checkin_token, 'checkin_token_valid_at' => kDMCurrentTimestamp, 'pending_user_id' => NULL ]);

  $ext = Device_update_from_query_results($device, $incoming_request);            // Saves $device and reloads it, possibly with a different id!!!
  SaveToDatabase($device);

  $usage = NewRecordForTable('auto_join_profile_usage', [ 'auto_join_profile_id' => CV($aj_profile, 'id'),
                                                          'device_id'            => CV($device, 'id'),
                                                          'checkin_token'        => $checkin_token ]);
  SaveToDatabase($usage, FALSE);

  return CreateClientCertificatePlaceholderForOTA(CV($device, 'id'));
} // _ota_service_transaction_challenge

//-------------------------------------------------------------------------

function _ota_service_transaction_udid($incoming_request)
{
  $device = FindInDatabase('devices', 'udid', $incoming_request['UDID']);
  if (!$device) DieUnauthorized('Device Not Found');

  // At this point, the enrollment is approved and should complete, so clear/set stuff that we wouldn't want to clear/set earlier in the process
  SetCVMulti($device, [ 'last_checkin_time' => kDMCurrentTimestamp, 'pending_user_id' => NULL ]);

  $ext = Target_get_extended_data($device);
  SetCVDAMulti($ext, [ 'ProfileList' => NULL, 'ProvisioningProfileList' => NULL ]);
  SaveToDatabase($ext);
  SetCV($device, 'mdm_acl', GetMDMACLFromBuildVersion(CVDA($ext, 'BuildVersion'), Target_is_ios($device)));
  SaveToDatabase($device);

  $is_mac = (stripos($incoming_request['PRODUCT'], 'mac') !== FALSE);
  if ($is_mac) LabSession_create_owner_placeholder(CV($device, 'id'), NULL);  // Create an empty placeholder lab_session for macOS

  return [ 'device' => $device, 'cert' => CreateClientCertificatePlaceholderForDevice($device) ];
} // _ota_service_transaction_udid

//-------------------------------------------------------------------------

function getSCEPUrl($hostname = NULL)
{
  if (empty($hostname)) $hostname = GetServerHostname();
  if (empty($hostname)) DieInternalError('Unable to determine hostname');
  return "http://$hostname:80/mdm2/scep/";
} // getSCEPUrl

//-------------------------------------------------------------------------

function OTAServiceCommon()   // This is only used for auto-enrollment profiles now
{
  $body = file_get_contents('php://input');
  $incoming_request = dmx_extract_signed_data($body);
  if (!CHECK_CLIENT_CERTS && empty($incoming_request)) $incoming_request = $body;
  if (empty($incoming_request)) DieBadRequest('invalid signature');

  $incoming_request = plist_decode($incoming_request);
  if (empty($incoming_request)) DieBadRequest('invalid plist');

  $incoming_request = NormalizeIncomingRequest($incoming_request);

  LogMsg('OTAServiceCommon: incoming_request = '.PrintArrayObscuringValuesForKeys($incoming_request), 2);

  if (empty($incoming_request['UDID'])) DieBadRequest('No UDID specified');

  if (!empty($incoming_request['CHALLENGE'])) {
    // The first request will have the 'CHALLENGE' key which identifies the auto_join_profiles to be used.
    // In this case, the request is signed with the device's built-in identity which chains to Apple's root CA
    $cert = PerformInTransaction('_ota_service_transaction_challenge', $incoming_request);
    $final_output = _generate_scep_profile($cert);               // Don't do this inside the transaction--it's very expensive and doesn't modify any DB records
  } else {
    // The second request will be after SCEP enrollment and will not contain 'CHALLENGE'.
    // In this case, the request is signed with the identity issued by the previous SCEP step.
    $result = PerformInTransaction('_ota_service_transaction_udid', $incoming_request);
    $final_output = GenerateMDMBindingProfile($result['device'], $result['cert']); // Another thing we shouldn't be doing inside of a transaction
  }

  return $final_output;
} // OTAServiceCommon

