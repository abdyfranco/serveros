<?php
// -------------------------------------------------------------------------
// Copyright (c) 2014 Apple Inc. All rights reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//-------------------------------------------------------------------------

require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/utf8.php");  // For UTF8String
require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/plist.php"); 
require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/db.php");
require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/settings.php");

$gStartTime = microtime(TRUE);
ob_start();
session_start();

// This silliness because PHP is lame about timezones
set_error_handler(function ($errno, $errstr) {
  date_default_timezone_set('UTC'); // Sets to UTC if not specified anywhere in .ini
  return TRUE;
});
date_default_timezone_get();
restore_error_handler();

set_error_handler("_exception_error_handler");
mb_language('uni');
mb_internal_encoding('UTF-8');
define ('MB_EXPECTED_ENCODINGS', 'UTF-8, ISO-8859-1');

///////////////////////////////////////////////////////////////////////////////////////
// KEEP THE FOLLOWING IN SYNC WITH DeviceManager-main.h, mdm_paths.rb AND common.sh! //
///////////////////////////////////////////////////////////////////////////////////////
define('PM_LOG_DIR',            "/Library/Logs/ProfileManager");
  define('PM_PHP_LOG_FILE',     PM_LOG_DIR."/php.log");

define('SERVER_LIBRARY_PATH',   "/Library/Server");
define('PM_LIBRARY_DIR',        SERVER_LIBRARY_PATH."/ProfileManager");
  define('PM_CONFIG_DIR',       PM_LIBRARY_DIR."/Config");
    define('SERVICE_DATA_LINK', PM_CONFIG_DIR."/ServiceData");  // Defaults to a symlink to PM_LIBRARY_DIR (/Library/Server/ProfileManager/Config/ServiceData)
define('PM_DATA_DIR',           SERVICE_DATA_LINK."/Data");     // Only the "Data" directory is accessed through the symlink, everything else is always in PM_LIBRARY_DIR
  define('PM_FILE_STORE_DIR',   PM_DATA_DIR."/FileStore");

define('kSCEPCertCNPrefix', "MDM Identity Certificate:");
define('CHECK_CLIENT_CERTS', TRUE);    // ###

if (!isset($gNewURL)) $gNewURL = TRUE;

$gDefaultObscureKeys = ['AuthToken','auth_token','Data','SignerCertificates','Token','UnlockToken','_schema'];

$gPID         = getmypid();
$gStatus      = "200 OK";  // Assume OK unless we send something else
$gLogLevel    = 1;
$gClientIdent = $_SERVER['REMOTE_ADDR'];
$gLogFD       = 0;
$gLogLevel    = GetAppPreference('debugOutput', $gLogLevel);
$gLogSQL      = ($gLogLevel > 1 ? GetAppPreference('DBLogSQL', FALSE) : FALSE);

// $gErrorLog = "";
$gScriptName = basename($_SERVER['PHP_SELF']);

// We only handle PUT/POST requests, except for the "vend_*" scripts
if (strpos($gScriptName, 'vend') === FALSE) {
  $meth = $_SERVER['REQUEST_METHOD'];
  if ($meth != 'PUT' && $meth != 'POST') {
    ProcessException(new Exception("405 Method Not Supported : $meth"));
    die;
  }
}

$uri = (isset($_SERVER['REDIRECT_SCRIPT_URI']) ? $_SERVER['REDIRECT_SCRIPT_URI'] : $_SERVER['SCRIPT_URI']);
LogElapsedTime("Time since script start: %et% [$uri]", TRUE);

LogMsg("vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv - ".$_SERVER['REQUEST_METHOD']." ".$gScriptName, 1);

if (!function_exists('apc_fetch')) LogMsg("*** APC NOT LOADED ***");
$gServerHeader = ServerHeader();

//-------------------------------------------------------------------------

function _exception_error_handler($errno, $errstr, $errfile, $errline, $errcontext)
{
  $msg = "Caught error '$errstr' of severity $errno at $errfile:$errline";
  if ($errno != E_NOTICE && $errno != E_USER_NOTICE && $errno != E_DEPRECATED && $errno != E_USER_DEPRECATED) {
    LogMsg($msg);
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
  } elseif (!empty($errcontext)) {
    $msg .= "\nCONTEXT: ".print_r($errcontext, TRUE);
  }
  LogMsg($msg);
  return FALSE;
} // _exception_error_handler

//-------------------------------------------------------------------------

// function DumpLogToBrowser()
// {
//  global $gErrorLog;
//  $log = str_replace(array("\n", " "), array("<br/>\n", "&nbsp;"), $gErrorLog);
//  echo "<code>$log</code>";
// } // DumpLogToBrowser

//-------------------------------------------------------------------------

function CFBundleShortVersion()
{
  $version = apc_fetch("CFBundleShortversion");
  if (empty($version)) {
    $response = plist_decode_file('/Applications/Server.app/Contents/Info.plist'); 
    if (!empty($response['CFBundleShortVersionString'])) {
      $version = $response['CFBundleShortVersionString'];
      apc_store("CFBundleShortversion", $version);
    }
  }
  return $version;
} // CFBundleShortVersionString

//-------------------------------------------------------------------------

function DieBadRequest($msg = '')
{
  if (!empty($msg)) $msg = " - ".$msg;
  throw new Exception("400 Bad Request".$msg);
} // DieBadRequest

//-------------------------------------------------------------------------

function DieForbidden($msg = '')
{
  if (!empty($msg)) $msg = " - ".$msg;
  throw new Exception("403 Forbidden".$msg);
} // DieForbidden

//-------------------------------------------------------------------------

function DieInternalError($msg = '')
{
  if (!empty($msg)) $msg = " - ".$msg;
  throw new Exception("500 Internal Server Error".$msg);
} // DieInternalError

//-------------------------------------------------------------------------

function DieNotFound($msg = '')
{
  if (!empty($msg)) $msg = " - ".$msg;
  throw new Exception("404 Not Found".$msg);
} // DieNotFound

//-------------------------------------------------------------------------

function DieUnauthorized($msg = '')
{
  if (!empty($msg)) $msg = " - ".$msg;
  throw new Exception("401 Unauthorized".$msg);
} // DieUnauthorized

// --------------------------------------------------------------------

function GenerateUUID($obfuscate = FALSE)
{
  return dmx_uuid_generate($obfuscate);
} // GenerateUUID

//-------------------------------------------------------------------------

function GetAppPreference($key, $default = NULL)
{
  $prefs = apc_fetch("__PMPrefs", $success);
  if (!$success) {
    $prefs = dmx_parse_plist_at_path('/Library/Preferences/com.apple.ProfileManager.plist');
    if (!is_array($prefs)) $prefs = [];
    apc_store("__PMPrefs", $prefs);
  }
  if (!empty($prefs[$key])) $value = $prefs[$key];
  else $value = $default;
  LogMsg(__FUNCTION__.": Pref for '$key' = $value", 2);
  return $value;
} // GetAppPreference

//-------------------------------------------------------------------------

function GMNow()
{
  global $TIMESTAMP_DATE_FORMAT;
  return gmdate($TIMESTAMP_DATE_FORMAT);
} // GMNow

//-------------------------------------------------------------------------

function IsBoundToAD()
{  
  $isBoundToAD = FindBySQL('od_nodes', "WHERE od_node_name LIKE '/Active Directory/%' LIMIT 1", []);
  return !empty($isBoundToAD);
} // IsBoundToAD

// -------------------------------------------------------------------------

function LoadPHPSession()
{
  $valid = FALSE;
  if (isset($_SESSION['dm_user']) && is_array($_SESSION['dm_user'])) {
    // We have a session, make sure it's still valid (sessions are only vald for 10 minutes, which should be pleny of time to complete device enrollment
    if (!empty($_SESSION['dm_session_start']) && time() - $_SESSION['dm_session_start'] < 10*60) $valid = TRUE;
  }
  if (!$valid) ResetPHPSession();
  return $_SESSION['dm_user'];
} // LoadPHPSession

//-------------------------------------------------------------------------

function LogElapsedTime($msg, $in_us = FALSE)
{
  global $gStartTime;

  $et = microtime(TRUE) - $gStartTime;
  $et = ($in_us ? sprintf("%dus", $et * 1000000) : sprintf("%dms", $et * 1000));
  if (!empty($msg)) {
    $msg = str_replace("%et%", $et, $msg);
    LogMsg($msg, 1);
  } else LogMsg("Elapsed time: $et", 1);
} // LogElapsedTime

//-------------------------------------------------------------------------

function LogException($e, $level = 0)
{
  if ($e instanceof PDOException) {
    $msg = LogPDOException($e, NULL, $level);
  } else {
    $msg = $e->getMessage();
    LogMsg("EXCEPTION: $msg at\n".$e->getTraceAsString(), $level);
  }
  return $msg;
  } // LogException

// --------------------------------------------------------------------

function LogMsg($str, $level = 0)
{
  global $gErrorLog, $gLogFD, $gLogLevel, $gClientIdent, $gPID;
  if ($level > $gLogLevel) return;

//  $gErrorLog .= "$str\n";

  if ($gLogFD == 0) $gLogFD = fopen(PM_PHP_LOG_FILE, "a+");

  $time   = microtime(TRUE);
  $ms     = substr(1000+round(($time - floor($time)) * 1000.0), 1); // Add 1000 and take the last three characters to get leading zeros
  $ts     = date("M d H:i:s", $time) . ".$ms";
  $prefix = "$level::$ts [$gPID] <$gClientIdent> ";
  if ($gLogLevel > 0) {
    $bt = debug_backtrace();
    if (isset($bt[1])) {
      $p    = $bt[1];
      if (isset($p['function']) && isset($p['line'])) {
        $fn   = $p['function'];
        $file = basename($p['file']);
        $line = $p['line'];
        $str  = '{'."$fn ($file:$line)".'} '.$str;
      }
    }
  }
  if (mb_strlen($prefix) > 0) {
    $lines = explode("\n", $str);
    $str = implode("\n$prefix", $lines);
    // $str = preg_replace("/(^.*$)\n/", "$prefix${1}\n", $str);
  }
  if (substr($str, -1) != "\n") $str .=  "\n";
  fwrite($gLogFD, "$prefix$str");
  fflush($gLogFD);
  // if (isset($_SERVER["REQUEST_URI"])) $gErrorLog .= "$str<br/>\n";
  // else echo "LOG: $str\n";
} // LogMsg

function LogMsgError($str)  { LogMsg($str, 0); }
function LogMsgDebug($str)  { LogMsg($str, 2); }
function LogMsgInfo($str)   { LogMsg($str, 1); }

//-------------------------------------------------------------------------

function NormalizeGUID($value)
{
  if (empty($value)) return NULL;
  $value = preg_replace('/[^-0-9A-F]/', '', strtoupper($value));
  if (strlen($value) != 36) $value = NULL;    // A GUID is always 36 characters
  return $value;
} // NormalizeGUID

//-------------------------------------------------------------------------

function NormalizeIMEI($value)
{
  if (empty($value)) return NULL;
  $value = preg_replace('/[^0-9]/', '', $value);  // Strip all non-numeric characters
  return substr($value, 0, 2)." ".substr($value, 2, 6)." ".substr($value, 8, 6)." ".substr($value, 14);
} // NormalizeIMEI

//-------------------------------------------------------------------------

function NormalizeIncomingRequest($incoming_request)
{
  // Normalize input
  if (empty($GLOBALS['NORMALIZE_INPUTS'])) $GLOBALS['NORMALIZE_INPUTS'] = ["UDID" => "UDID", "SERIAL" => "SerialNumber", "IMEI" => "IMEI", "MEID" => "MEID", "DeviceID" => "DeviceID", "UserID" => "GUID"];

  foreach ($GLOBALS['NORMALIZE_INPUTS'] as $key => $fn) {
    if (empty($incoming_request[$key])) continue;
    $fn = "Normalize$fn";
    $incoming_request[$key] = $fn($incoming_request[$key]);
  }

  return $incoming_request;
} // NormalizeIncomingRequest

// --------------------------------------------------------------------

function NormalizeMAC($value)
{
  if (empty($value)) return NULL;
  $value = preg_replace('/[^0-9a-f]/', '', strtolower($value)); // Strip all non-numeric characters
  return substr($value, 0, 2).":".substr($value, 2, 2).":".substr($value, 4, 2).":".substr($value, 6, 2).":".substr($value, 8, 2).":".substr($value, 10, 2);
} // NormalizeMAC

//-------------------------------------------------------------------------

function NormalizeMEID($value)
{
  if (empty($value)) return NULL;
  return preg_replace('/[^0-9A-F]/', '', strtoupper($value));
} // NormalizeMEID

//-------------------------------------------------------------------------

function NormalizeSerialNumber($value)
{
  if (empty($value)) return NULL;
  return preg_replace('/[^0-9A-Z]/', '', strtoupper($value));
} // NormalizeSerialNumber

//-------------------------------------------------------------------------

function NormalizeUDID($value)
{
  if (empty($value)) return NULL;
  return preg_replace('/[^0-9a-f]/', '', strtolower($value));
} // NormalizeUDID

//-------------------------------------------------------------------------

function NormalizeUUID($value)
{
  if (empty($value)) return NULL;
  $value = preg_replace('/[^-0-9a-f]/', '', strtolower($value));
  if (strlen($value) != 36) $value = NULL;    // A UUID is always 36 characters
  return $value;
} // NormalizeUUID

//-------------------------------------------------------------------------

function ParseYAML($string)
{
  if (!empty($string)) {
    $val = yaml_parse($string, -1);
    if (is_array($val) && count($val) == 1 && isset($val[0])) $val = $val[0];   // Convert this "array-wrapped" hash to just the hash
  } else $val = [];
  return $val;
} // ParseYAML

//-------------------------------------------------------------------------

function PrepareArrayObscuringValuesForKeys($a, $keys = NULL, $depth = 0)
{
  global  $gDefaultObscureKeys, $gLogLevel;
  if (!isset($keys)) $keys = $gDefaultObscureKeys;

  $replace = [];
  $all_numeric = TRUE;
  foreach ($a as $k => $v) {
    $str_key = is_string($k);
    if ($all_numeric && $str_key) $all_numeric = FALSE;
    if (is_array($v)) {
      if ($depth > $gLogLevel) {
        $l = count($v);
        $v = "<Array: $l entries beyond depth $depth>";
      } elseif ($str_key && in_array($k, $keys)) {    // If the value is in the array
        $l = count($v);
        $v = "<Array: $l entries>";
      } else $v = PrepareArrayObscuringValuesForKeys($v, $keys, $depth + 1);  // Recurse into arrays we're not replacing to look for more replacements
    } elseif (in_array($k, $keys)) {
      if (is_string($v)) {
        $l = strlen($v);
        $v = "<BinaryString: $l bytes>";
      } else $v = "<BinaryObject>";
    }
    $replace[$k] = $v;
  } // foreach

  // Pretty-print the array
  $str = '';
  $indent = substr('                              ', 0, ($depth + 1) * 2);
  if (!$all_numeric) {
    foreach ($replace as $k => $v) {
          if (is_object($v))   $v = "<BinaryObject>";
      elseif (!is_numeric($v)) $v = "'$v'";
      if (!empty($str)) $str .= ",\n$indent'$k'=>$v";
      else              $str  =  "$indent'$k'=>$v";
    }
    $indent = substr($indent, 0, $depth * 2);
    $str = "{\n$str\n$indent}";
  } else $str = "[ ".implode(",", $replace)." ]";
  return $str;
} // PrepareArrayObscuringValuesForKeys

//-------------------------------------------------------------------------

function PrintArrayObscuringValuesForKeys($a, $keys = NULL)
{
  global  $gDefaultObscureKeys;

  if (!is_array($a)) return print_r($a, TRUE);

  if (!isset($keys)) $keys = $gDefaultObscureKeys;

  return PrepareArrayObscuringValuesForKeys($a, $keys);
} // PrintArrayObscuringValuesForKeys

//-------------------------------------------------------------------------

function ProcessException($e, $exit = TRUE, $body = null)
{
  global $gStatus, $gInTransaction;

  $msg = LogException($e);
  $errstr = preg_replace("/([1-5][0-9][0-9]) +([^-]*)-.*/", "$1 $2", $msg);
  if (strlen($errstr) < 3 || !is_numeric(substr($errstr, 0, 3))) $errstr = "500 Internal Server Error";
  $gStatus = $errstr;
  if ($exit) {
    if ($gInTransaction) RollbackTransaction(); // Throw away whatever we might have been working on
    header("Status: $errstr");
    SendFinalOutput($body ? $body : $errstr);
    $GLOBALS['DB'] = null;
    exit;
  }
  return $errstr;
} // ProcessException

//-------------------------------------------------------------------------

function ProductBuildVersion()
{
  $version = apc_fetch("ProductBuildVersion");
  if (empty($version)) {
    $response = plist_decode_file('/Applications/Server.app/Contents/ServerRoot/System/Library/CoreServices/ServerVersion.plist'); 
    if (!empty($response['ProductBuildVersion'])) {
      $version = $response['ProductBuildVersion'];
      apc_store("ProductBuildVersion", $version);
    }
  }
  return $version;
} // ProductBuildVersion

// -------------------------------------------------------------------------

function ResetPHPSession()
{
  // From http://www.php.net/manual/en/function.session-destroy.php
  $_SESSION = [];
  $params = session_get_cookie_params();
  setcookie(session_name(), '', time() - 42000, $params["path"], $params["domain"], $params["secure"], $params["httponly"]);
  session_destroy();
  session_start();
  session_regenerate_id(true);
  $_SESSION['dm_session_start'] = time();
  $_SESSION['dm_user'] = [];
  return $_SESSION['dm_user'];
} // ResetPHPSession

//-------------------------------------------------------------------------

// function SendAsyncDevicemgrdRequestData($str)
// {
//   dmx_send_async_devicemgrd_request($str);
// } // SendAsyncDevicemgrdRequestHash

//-------------------------------------------------------------------------

// function SendAsyncDevicemgrdRequestHash($hash)
// {
//   $str = plist_encode_xml($hash);
//   dmx_send_async_devicemgrd_request($str);
// } // SendAsyncDevicemgrdRequestHash

//-------------------------------------------------------------------------

function SendFinalOutput($str)
{
  global $gStartTime, $gStatus, $gInTransaction, $gServerHeader;
  if ($gInTransaction) DieInternalError(__FUNCTION__.": There is an outstanding transaction on the database session!");

  $len = strlen($str);                          // NOT mb_strlen--we need bytes, not characters
  header("Content-Length: $len");
  header("X-Apple-MDM-Server: ".$gServerHeader);
  if ($len == 0) header("Connection: close", true);   // Tell the client to close the connection when we send an empty reply
  $out = ob_get_contents();
  if (!empty($out)) LogMsg("*** CAPTURED SCRIPT OUTPUT ***\n$out\n***********************");
  ob_end_clean();

  echo $str;
  @flush();
  fastcgi_finish_request();

  $dur = microtime(TRUE) - $gStartTime;
  $dur = sprintf("%dms", $dur*1000);
  $uri = (isset($_SERVER['REDIRECT_SCRIPT_URI']) ? $_SERVER['REDIRECT_SCRIPT_URI'] : $_SERVER['SCRIPT_URI']);
  LogMsg("Sent Final Output ($len bytes)\n^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ - ".$_SERVER['PHP_SELF'], 1);
  LogMsg("Completed in $dur | $gStatus [$uri]");
  $GLOBALS['DB'] = null;
} // SendFinalOutput

//-------------------------------------------------------------------------

function SendFinalOutputFile($path, $len = nil)
{
  global $gStartTime, $gStatus, $gInTransaction, $gServerHeader;
  if ($gInTransaction) DieInternalError(__FUNCTION__.": There is an outstanding transaction on the database session!");

  if (empty($path) || !file_exists($path)) ProcessException(new Exception("404 Not Found - Output file '$path' not found"));

  if (empty($len)) $len = filesize($path);
  header("Content-Length: $len");
  header("X-Apple-MDM-Server: ".$gServerHeader);
  $out = ob_get_contents();
  if (!empty($out)) LogMsg("*** CAPTURED SCRIPT OUTPUT ***\n$out\n***********************");
  @ob_end_clean();
  @ob_flush();
  @flush();

  @ob_implicit_flush(TRUE);
  $out_len = @readfile($path);
  fastcgi_finish_request();
  if ($out_len === FALSE || $out_len != $len) LogMsg("Failed to send file '$path'. (Sent $out_len bytes, expected $len bytes.)");

  $dur = microtime(TRUE) - $gStartTime;
  $dur = sprintf("%dms", $dur*1000);
  $uri = (isset($_SERVER['REDIRECT_SCRIPT_URI']) ? $_SERVER['REDIRECT_SCRIPT_URI'] : $_SERVER['SCRIPT_URI']);
  LogMsg("Sent Final Output ($len bytes)\n^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ - ".$_SERVER['PHP_SELF'], 1);
  LogMsg("Completed in $dur | $gStatus [$uri]");
  $GLOBALS['DB'] = null;
} // SendFinalOutputFile

//-------------------------------------------------------------------------

function ServerHeader()
{
  $header = apc_fetch("ServerHeader");
  if (empty($header)) {
    try{
      $bundleVersion = CFBundleShortVersion();
      $productVersion = ProductBuildVersion();
    } catch(Exception $e){
      LogException($e);
      if(!$bundleVersion) $bundleVersion = "2.2.?";
      if(!$productVersion) $productVersion = "13S?"; 
    }
    $header = "ProfileManager/$bundleVersion ($productVersion)";
    apc_store("ServerHeader", $header);       
  }
  return $header;
} // ServerHeaderString

//-------------------------------------------------------------------------

function SignData($data)
{
  $settings = GetSettings();
  if (!$settings["use_code_signing"] || !isset($settings["signing_cert_path"]) || strlen($settings["signing_cert_path"]) == 0 || !isset($settings["signing_key_path"]) || strlen($settings["signing_key_path"]) == 0) {
    LogMsg("No signing certificate specified, unable to sign.");
    return $data;
  }

  $signed_data = dmx_get_cms_signed_data($settings["signing_cert_path"], $settings["signing_key_path"], $data);

  if (empty($signed_data)) {
    LogMsg("Signing failed, using unsigned data instead.");
    return $data;
  }

  return $signed_data;
} // SignData

//-------------------------------------------------------------------------

require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/db.php");
