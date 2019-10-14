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

// -------------------------------------------------------------------------

function VerifyAuthToken()     // Does not return if it can't verify
{
  try {
    GetSettings();
    if (isset($_COOKIE['cc_collabd_session_guid'])) $token = $_COOKIE['cc_collabd_session_guid'];
    if (empty($token)) {
      $u_session = LoadPHPSession();  // Will make sure the session hasn't expired (we'll get an empty session if it has expired or is otherwise invalid)
      if (empty($u_session['succeeded']) || empty($u_session['generated_uid']) || empty($u_session['authed_at']) || empty($u_session['auth_token'])) DieUnauthorized("auth_token doesn't exist");
      $token = $u_session['auth_token'];
    } else $u_session = ResetPHPSession();   // When we have a proper webauth token, always use that and start a new session

    $url = GetRequestScheme()."://localhost:443/auth/verify?auth_token=$token";
    // $request  = new HttpRequest($url);
    // $response = new HttpMessage($request->send());
    // if ($response->getResponseCode() != 200) throw new Exception("auth server error ".$response->getResponseCode());
    // $headers = $response->getHeaders();
    // LogMsg("headers=$headers");
    // $sig64 = $headers["verification-signature"];
    // $verifyBody = $response->getBody();
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE); 
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE); 
    curl_setopt($ch, CURLOPT_HEADER, TRUE);
    $body = curl_exec($ch);
    $info = curl_getinfo($ch);
    curl_close($ch);
    if ($info['http_code'] != 200) DieInternalError("auth server error: ".PrintArrayObscuringValuesForKeys($info));
    $headers    = substr($body, 0, $info['header_size']);
    $verifyBody = substr($body, -$info['size_download']);

    // Extract the signature from the headers
    $start = stripos($headers, "Verification-Signature: ");
    if ($start !== FALSE) {
      $headers = explode("\n", substr($headers, $start), 2);
      $headers = explode(": ", $headers[0], 2);
      $sig64 = $headers[1];
    }
    if (empty($sig64)) DieUnauthorized("no verification signature");

    $signature = bin2hex(base64_decode($sig64));
    if (empty($signature)) DieUnauthorized("invalid verification signature");

    // grab the shared secret, and regenerate the signature
    $secret = _get_shared_secret();
    if (empty($secret)) DieInternalError("Can't find the shared secret");
    $hash = hash_hmac('sha1', $verifyBody, $secret);
    if (empty($hash)) DieInternalError("hash_mac failed");
    if (!_hex_hash_eq_ct($hash, $signature)) DieUnauthorized("verification signature mismatch");    // check that the signature and hash are equal

    // now json parse the body
    $verification = json_decode($verifyBody);
    if (empty($verification)) DieInternalError("invalid response from the auth server:\n$verifyBody");
    if (empty($verification->succeeded)) DieUnauthorized("auth_token verification failed");    // empty() returns TRUE for an argument of FALSE or NULL, so this will catch both cases

    // if we've gotten here, that means we've verified the auth_token and can trust it
    // set your cookie or whatever with the information supplied
    if (empty($u_session['authed_at']) || empty($u_session['auth_token'])) {
      $u_session = get_object_vars($verification);  // Convert to an array
      $u_session['auth_token'] = $token;
      $u_session['authed_at']  = time();
      $_SESSION['dm_user']     = $u_session;
    }
  } catch (Exception $e) {
    ResetPHPSession();
    LogException($e);
    throw $e;
  }
  return TRUE;
} // VerifyAuthToken

// -------------------------------------------------------------------------

function _get_shared_secret()
{
  $secret = file_get_contents('/Library/Server/Wiki/Config/shared/shared_secret');
  return (is_string($secret) ? trim($secret) : "");
} // _get_shared_secret

//-------------------------------------------------------------------------

// This function compares two hexadecimal strings for being equal in a constant time to prevent duration-based attacks
function _hex_hash_eq_ct($hash1, $hash2)
{
  $len = strlen($hash1);
  if (strlen($hash2) != $len) return FALSE;
  $hash1 = strtolower($hash1);
  $hash2 = strtolower($hash2);
  $eq = TRUE;
  while ($len-- > 0) $eq &= ($hash1[$len] === $hash2[$len]);
  return $eq;
} // _hex_hash_eq_ct

// -------------------------------------------------------------------------
