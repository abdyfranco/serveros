<?php
// -------------------------------------------------------------------------
// Copyright (c) 2016 Apple Inc. All rights reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//-------------------------------------------------------------------------

require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/common.php");
require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/auth.php");

//-------------------------------------------------------------------------

function _accept_invitation($user_guid)
{
  CheckVPPServiceEnabled();
  // Find the user record
  $user = FindInDatabase('users', 'guid', $user_guid);
  if (!$user) DieUnauthorized("No matching user record with guid: $user_guid");
  // Generate the url
  $user_id      = CV($user, 'id');
  $invite_code  = CV($user, 'vpp_invite_code');
  $settings     = GetSettings();
  $base         = $settings['vpp_invitation_base_url'];
  if (empty($base)) DieInternalError('VPP service not configured correctly');

  // If we're here that means the user has authenticated correctly and ready to recieve the invitation
  if (empty($invite_code)) {
    if (strcasecmp(CV($user, 'vpp_status_ext'),'Associated') === 0)
      $err = "You have already accepted your invitation.";
    else
      $err = "Your invitation has been withdrawn.";
    return ['error' => $err];
  }
  $url = str_ireplace('%inviteCode%', $invite_code, $base);
  return ['url' => $url];
} // _accept_invitation

try {
  if (empty($_GET['user']) && empty($_SESSION['user_guid'])) DieBadRequest();
  $user_guid = (!empty($_GET['user']) ? $_GET['user'] : (!empty($_SESSION['user_guid']) ? $_SESSION['user_guid'] : ""));

  // Auth
  if (!VerifyAuthToken()) {
    LogMsg("Failed to authenticate user. Requesting authentication");
    $_SESSION['user_guid'] = $user_guid;
    return RequestAuthentication();
  }

  // Check if the logged in user guid matches the invited user guid
  $u_session = LoadPHPSession();
  if (empty($user_guid)) DieBadRequest("no invited user guid");
  if (empty($u_session) || empty($u_session['generated_uid'])) DieUnauthorized("no session info");
  if (strcasecmp($user_guid, $u_session['generated_uid']) !== 0) {
    LogMsg("Logged in user does not match the invited user.");
    $callback_url = URLBase().PM_PHP_NEW_URI_ROOT."/accept_invitation?user=$user_guid";
    return LogoutUser($callback_url);
  }

  $url = '';
  $results = PerformInTransaction('_accept_invitation', $user_guid);
  // Error case
  if ($results && isset($results['error'])) {
    return SendFinalOutput("<h1>".$results['error']."</h1>");
  }
  // Redirect user
  if ($results && isset($results['url'])) {
    $url = $results['url'];
  }
  if (empty($url)) DieForbidden('No redirect URL set');
  LogMsg("Redirecting to URL: $url", 1);
  $_SESSION['user_guid'] = FALSE;
  header("Location: $url");
} catch (Exception $e) {
  ProcessException($e);   // Does not return
}
