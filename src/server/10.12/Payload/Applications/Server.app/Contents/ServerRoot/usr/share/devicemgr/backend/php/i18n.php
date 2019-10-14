<?php
// -------------------------------------------------------------------------
// Copyright (c) 2017 Apple Inc. All rights reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//-------------------------------------------------------------------------

//-------------------------------------------------------------------------

function I18n_t($str)
{
  global $gLogLevel;

  $valid = apc_fetch("valid-locales");
  if (empty($valid)) {
    $valid = [ "en"    => "en",
               "nl"    => "nl",
               "fr"    => "fr",
               "de"    => "de",
               "it"    => "it",
               "ja"    => "ja",
               "es"    => "es",
               "ko"    => "ko",
               "zh-cn" => "zh_CN",
               "zh-tw" => "zh_TW",
              ];
    apc_store("valid-locales", $valid);
  }

  // Parse the HTTP_ACCEPT_LANGUAGE header to identify the preferred languages
  if (empty($GLOBALS['USER_PREFERRED_LANGUAGE'])) {
    if (!empty($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
      $hal = $_SERVER['HTTP_ACCEPT_LANGUAGE'];
      LogMsg("HTTP_ACCEPT_LANGUAGE = '$hal'", 2);
      $locs = explode(",", $hal);
      $hash = [];
      foreach ($locs as $l) {
        $l = trim($l);
        if (preg_match('/;q=\d+\.\d+$/', $l) == 0) $l .= ';q=1.0';
        $hash[] = explode(";q=", $l);
      }
      arsort($hash, SORT_NUMERIC);  // Sort the languages by 'q', highest first

      // Roll loc values off the top until we find one that matches a locale we support
      do {
        $loc = array_shift($hash);
        if (empty($loc)) break;

        $loc = $loc[0];
        LogMsg("popped loc='$loc'", 2);
        if (isset($valid[$loc])) break;   // Found one!

        // See if we've got a more specific language specification than we have in our $valid table
        $split = explode("-", $loc);
        $loc = $split[0];
      } while (!isset($valid[$loc]));
    }
    $loc = (empty($loc) || empty($valid[$loc]) ? 'en' : $valid[$loc]);

    $GLOBALS['USER_PREFERRED_LANGUAGE'] = $loc;
  } else $loc = $GLOBALS['USER_PREFERRED_LANGUAGE'];
  LogMsg("loc = '$loc'", 2);

  $table = apc_fetch("loc-$loc"); // See if we have already cached the loc table
  if (empty($table)) {
    $path = SERVERMGR_DEVICEMGR_PATH."/Contents/Resources/$loc.lproj/default.strings";
    LogMsg("locale path='$path'", 2);
    $table = dmx_parse_plist_at_path($path);
    if ($gLogLevel > 1) LogMsg("localizations for '$loc':\n".PrintArrayObscuringValuesForKeys($table), 2);
    if (!empty($table)) apc_store("loc-$loc", $table);  // Cache it for next time
  }

  if (!empty($table) && isset($table[$str])) {
    $loc = $table[$str];
    LogMsg("'$str' => '$loc'", 2);
    $str = $loc;
  } else {
    LogMsg("No localization found for '$str'");
  }
  return $str;
} // I18n_t

//-------------------------------------------------------------------------
