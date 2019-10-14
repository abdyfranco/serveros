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

//-------------------------------------------------------------------------

function _vend_manifest_transaction($uuid)
{
  global $gLogLevel;

  $app  = FindInDatabase('enterprise_apps', 'uuid', $uuid);
  if (empty($app)) DieNotFound();

  $type = ((CV($app, 'supported_devices') & 8) ? 'pkg' : 'ipa');
  $name = CV($app, 'name');
  $base = URLBase().PM_IPA_URI_ROOT;
  $icon = CV($app, 'icon_url');
  $url  = "$base/$uuid.$type";
  $path = PM_FILE_STORE_DIR."/$uuid";

  $pkg_hash = [ "kind" => 'software-package',
                "url"  => $url
              ];
  $metadata = [ 'bundle-identifier' => CV($app, 'unique_identifier'),
                'bundle-version'    => CV($app, 'version'),
                'kind'              => 'software',
                'subtitle'          => $name,
                'title'             => $name ];

  $md5_path = $path.".md5";
  if (file_exists($md5_path)) {
    $md5_hash = file_get_contents($md5_path);
    if (!empty($md5_hash)) {
      $st = stat($path);
      $pkg_hash['md5s']     = [ $md5_hash ];
      $pkg_hash['md5-size'] = $metadata['sizeInBytes'] = $st['size'];
    }
  }

  if (empty($icon) || !file_exists(PM_FILE_STORE_DIR."/$icon")) $icon = 'generic_app.png';  // Fallback to a generic icon
  $assets   = [ $pkg_hash,
                [ 'kind'        => 'display-image',
                  'needs-shine' => FALSE,
                  'url'         => "$base/$icon" ],
                [ 'kind'        => 'full-size-image',
                  'needs-shine' => FALSE,
                  'url'         => "$base/$icon" ]
              ];

  $manifest_hash = [ 'items' => [ [ 'assets'   => $assets,
                                    'metadata' => $metadata
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

  // This doesn't need to be performed in a transaction, since we only read one row and do not modify anything in the DB.
  // $result = PerformInTransaction('_vend_manifest_transaction', ['uuid' => $uuid]);
  $result = _vend_manifest_transaction($uuid);

  $filename = $result['filename'];
  $final_output = plist_encode_xml($result['manifest_hash']);
  header('Content-Type: application/octet-stream'); // TODO: Replace with MIME-type of app manifest plist
  header("Content-Disposition: attachment; filename=\"$filename\"");
  LogMsg("vend_manifest:\n$final_output", 1);
} catch (Exception $e) {
  ProcessException($e);   // Does not return
}

SendFinalOutput($final_output);
