<?PHP
// -------------------------------------------------------------------------
// Copyright (c) 2017 Apple Inc. All rights reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//-------------------------------------------------------------------------

$MDM_CONFIG['database']['dsn']      = "pgsql:host=/Library/Server/ProfileManager/Config/var/PostgreSQL/;dbname=devicemgr_v2m0;user=deviceservice";
$MDM_CONFIG['database']['username'] = "deviceservice";
$MDM_CONFIG['database']['password'] = "";
$MDM_CONFIG['database']['options']  = [];

// The timestamp format expected by the database
// $TIMESTAMP_DATE_FORMAT = 'm/d/Y H:i:s';    // '07/03/1996 10:30:00'
$TIMESTAMP_DATE_FORMAT = 'Y-m-d H:i:s';   // '1996-07-03 10:30:00'
