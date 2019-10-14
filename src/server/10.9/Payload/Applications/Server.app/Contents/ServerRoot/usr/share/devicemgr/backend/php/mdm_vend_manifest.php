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
require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/target.php");

//-------------------------------------------------------------------------

function _vend_manifest_transaction($args)
{
  global $gLogLevel;

  $uuid = $args['uuid'];
  $app  = FindInDatabase('enterprise_apps', 'uuid', $uuid);
  if (empty($app)) DieNotFound();

  $name = CV($app, 'name');
  $base = URLBase();
  $file = CV($app, 'uuid');
  $icon = CV($app, 'icon_url');
  $url  = "$base/devicemanagement/ipa/$file.ipa";
  $assets = [ [ "kind" => 'software-package',
                "url"  => $url
              ] ];

  if (empty($icon) || !file_exists(PM_FILE_STORE_DIR."/$icon")) $icon = 'generic_app.png';  // Fallback to a generic icon
  $assets[] = [ 'kind'        => 'display-image',
                'needs-shine' => FALSE,
                'url'         => "$base/devicemanagement/ipa/$icon" ];
  $assets[] = [ 'kind'        => 'full-size-image',
                'needs-shine' => FALSE,
                'url'         => "$base/devicemanagement/ipa/$icon" ];

  $manifest_hash = [ 'items' => [ [ 'assets'   => $assets,
                                    'metadata' => [ 'bundle-identifier' => CV($app, 'unique_identifier'),
                                                    'bundle-version'    => CV($app, 'version'),
                                                    'kind'              => 'software',
                                                    'subtitle'          => $name,
                                                    'title'             => $name ]
                                  ] ]
                    ];

  if ($gLogLevel > 1) LogMsg("vend_manifest: ".PrintArrayObscuringValuesForKeys($manifest_hash), 2);
  $filename = preg_replace("/\s+/", '_', $name)."-manifest.plist";
  return [ 'manifest_hash' => $manifest_hash, 'filename' => $filename ];
} // _vend_manifest_transaction

//-------------------------------------------------------------------------

try {
  $uuid = $_REQUEST['uuid'];
  if (empty($uuid)) DieBadRequest("invalid uuid");

  $result = PerformInTransaction('_vend_manifest_transaction', ['uuid' => $uuid]);

  $filename = $result['filename'];
  $final_output = plist_encode_xml($result['manifest_hash']);
  header('Content-Type: application/octet-stream'); // TODO: Replace with MIME-type of app manifest plist
  header("Content-Disposition: attachment; filename=\"$filename\"");
  LogMsg("vend_manifest:\n$final_output", 1);
} catch (Exception $e) {
  ProcessException($e);   // Does not return
}

SendFinalOutput($final_output);
