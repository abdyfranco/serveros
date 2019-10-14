//-------------------------------------------------------------------------
// Copyright (c) 2018 Apple Inc. All rights reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//-------------------------------------------------------------------------

var Webauth = {
  initialize: function() {
    if (window.location.protocol === "https:") {
      $('#username').attr('disabled', false);
      $('#password').attr('disabled', false);
      $('#submit').attr('disabled', false);
      $('#username').focus();
    } else {
      $('#username').attr('disabled', true);
      $('#password').attr('disabled', true);
      $('#submit').attr('disabled', true);
    }

    // Focus username field on load
    $('#username')[0].focus();

    // Submit on click
    var that = this;
    $("#submit_info").click(function() {
      that.performAuthentication();
    });
    $("#login_form").submit(function() {
      that.performAuthentication();
    });
  },

  authenticationFailed: function() {
    $('#password').val('');
    $("div.login-username").addClass("error");
    $("div.login-password-cont").addClass("error");
    $("#login-error").show();
  }, // authenticationFailed

  authenticationSucceeded: function(response, status, xhr) {
    response = JSON.parse(response);
    if (response.success) {
      var redir = $('meta[name=x-apple-auth-redirect]').attr('content');
      if (!redir || redir.length === 0) redir = '/mydevices';
      window.location.href = redir;
    } else Webauth.authenticationFailed();
  },

  performAuthentication: function() {
    var u = $('#username').val(),
      p = $('#password').val(),
      r = $('#rememberMe').prop('checked');
    if (u && u.length > 0 && p && p.length > 0) {
      $('p.error').hide();
      var req = {
        data: JSON.stringify({
          username: u,
          password: p,
          rememberMe: r
        }),
        dataType: 'text',
        processData: false,
        method: 'POST',
        url: '/auth/user',
        cache: false,
        contentType: 'application/json;charset=UTF8',
        timeout: 30000, // 30 seconds
        error: Webauth.authenticationFailed,
        success: Webauth.authenticationSucceeded
      };
      $.ajax(req);
    } else Webauth.authenticationFailed();
  } // performAuthentication
};

$(document).ready(function() {
  Webauth.initialize();
});