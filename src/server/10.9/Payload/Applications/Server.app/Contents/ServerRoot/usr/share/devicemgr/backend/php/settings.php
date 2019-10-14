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

$SETTINGS = NULL;

// -------------------------------------------------------------------------

function GetServerHostname($settings = NULL)
{
  $host = gethostname();
  if (empty($host) || $host == "localhost" || $host == "127.0.0.1") {
    if (empty($settings)) $settings = GetSettings();
    $host = $settings->server_hostname;
  }
  if (empty($host)) DieInternalError("Unable to determine FQDN.");
  return $host;
} // GetServerHostname

//-------------------------------------------------------------------------

function GetRequestScheme()
{
  return "https";     // The device side NEVER uses unencrypted connections
  // $settings = GetSettings();
  // return ($settings['ssl_active'] ? "https" : "http");
} // GetRequestScheme

//-------------------------------------------------------------------------

function GetSettings()
{
  global $DB, $SETTINGS;
  if (isset($SETTINGS)) return $SETTINGS;

  $st = $DB->prepare('SELECT * FROM settings LIMIT 1');
  $st->execute();
  $SETTINGS = $st->fetch(PDO::FETCH_ASSOC);
  if (is_array($SETTINGS) && empty($SETTINGS['server_organization'])) $SETTINGS['server_organization'] = " ";
  return $SETTINGS;
} // GetSettings

// -------------------------------------------------------------------------

function URLBase()
{
  $base = GetRequestScheme()."://".GetServerHostname();
  // $base .= ":3000" unless RAILS_ENV == 'production'
  return $base;
} // URLBase

//-------------------------------------------------------------------------

