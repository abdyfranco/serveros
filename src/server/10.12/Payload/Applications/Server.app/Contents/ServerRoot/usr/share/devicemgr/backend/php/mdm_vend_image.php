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

//-------------------------------------------------------------------------

function _vend_mdm_image($image)
{
  global $gCheckinToken;

  $gCheckinToken = NULL;
  $cn = '';
  $file_name = PM_IMAGES_DIR."/$image";

  // Retrieve the active token from the client identity
  if (!empty($_SERVER['SSL_CLIENT_S_DN_CN'])) $cn = trim($_SERVER['SSL_CLIENT_S_DN_CN']);
  if (empty($cn) && !empty($_SERVER['REDIRECT_SSL_CLIENT_S_DN_CN'])) $cn = trim($_SERVER['REDIRECT_SSL_CLIENT_S_DN_CN']);
  if (empty($cn) && !CHECK_CLIENT_CERTS && !empty($_SERVER['HTTP_MDM_SIGNATURE'])) $cn = trim($_SERVER['HTTP_MDM_SIGNATURE']);
  if (empty($cn)) DieForbidden('No CN found in client certificate');

  // Extract the UUID out of the CN.
  LogMsg(basename(__FILE__).": CN = '$cn'", 4);
  $i = strpos($cn, kSCEPCertCNPrefix);
  if ($i === FALSE) DieForbidden("Unrecognized CN found in client certificate '$cn'");

  $gCheckinToken = NormalizeUUID(trim(substr($cn, $i + strlen(kSCEPCertCNPrefix))));  // Will be NULL if not a valid-looking UUID
  LogMsg(basename(__FILE__).": checkin_token = '$gCheckinToken'", 2);
  if (empty($gCheckinToken)) DieForbidden("Invalid CN found in client certificate '$cn'");

  // Check if the device can access the images on the disk
  $result = ExecuteSQLFunction('dm_device_can_access_images', [ 'checkin_token' => $gCheckinToken ]);
  if (empty($result[0]) || empty($result[0]['dm_device_can_access_images'])) DieForbidden('Device does not have access to images');

  // The device is now ready to accept images
  return $file_name;
} // _vend_mdm_image

try {
  CheckDeviceManagementEnabled();

  $image = $_REQUEST['image'];
  if (empty($image)) DieBadRequest("Invalid image"); // return if no image id provided
  $file_name = PerformInTransaction('_vend_mdm_image', $image);
} catch (Exception $e) {
  ProcessException($e);   // Does not return
}

header("Content-Type: image/png");
SendFinalOutputFile($file_name);
