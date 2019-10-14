/*-------------------------------------------------------------------------
 Copyright (c) 2018 Apple Inc. All rights reserved.

 IMPORTANT NOTE: This file is licensed only for use with the Profile Manager
 server feature of the Apple Software and is subject to the terms and conditions
 of the Apple Software License Agreement accompanying the package this file is part of.
------------------------------------------------------------------------- */

jQuery(function() {

  jQuery.ajaxSetup({
    headers: {
      'X-CSRF-Token': $('meta[name="csrf-token"]')
        .attr('content'),
      'X-This': 'that'
    }
  });


  window.intervalCheck = function() {

    if (window.ajaxStatus !== 'inProgress') {
      return;
    }

    var now = new Date();
    if (now - window.lastAJAXTimestamp > 60000) {
      console.log('It took more than 60 seconds to respond to the last AJAX call, reloading just in case it failed...');
      window.ajaxStatus = 'reloadingBecauseError'; // Prevents the intervalCheck from attempting to reload the portal over and over again
      setTimeout(function() {
        window.location.reload(false);
      }, 1000);
    }
  };
  window.periodicUpdate = function() {
    if (window.ajaxStatus == 'reloadingBecauseError') {
      return;
    }
    window.lastAJAXTimestamp = new Date();
    var data = {
      last_txid_snapshot: UserPortalConfig.last_txid_snapshot
    };
    jQuery.post(PM_WEBAPP_URI_ROOT+'/magic/get_updated_for_user', JSON.stringify(data), window.periodicCallback, 'json');
    window.ajaxStatus = 'inProgress';
  };

  window.periodicCallback = function(data) {

    // Spawn off another ajax call
    var now = new Date();
    if (now - window.lastAJAXTimestamp > 3000) {
      console.log('It took more than 3 seconds to respond to the last AJAX call, slowing down...');
    }
    setTimeout(window.periodicUpdate, Math.max(3000, (now - window.lastAJAXTimestamp)));
    window.ajaxStatus = 'waiting';

    if (!data) {
      if (console) {
        console.warn('data was not available');
      }
      return; // For some reason nothing came back
    }

    // Zeroth, check if there was a redirect_url
    if (data.redirect_url) {
      top.location = data.redirect_url;
      return;
    }

    // update the new transaction id
    if (data.last_txid_snapshot) {
      UserPortalConfig.last_txid_snapshot = data.last_txid_snapshot;
    }

    if (data.result.devices && data.result.devices.updated) {
      var updatedDevices = data.result.devices.updated;
      for (var i = 0, l = updatedDevices.length; i < l; i++) {
        UserPortal.renderDevice(updatedDevices[i]);
      }
    }

    // Next, check if there are any updated tasks
    if (data.result.tasks && data.result.tasks.updated) {
      var updatedTasks = data.result.tasks.updated;
      for (var i = 0, l = updatedTasks.length; i < l; i++) {
        var updatedTask = updatedTasks[i];

        if (updatedTask.target_class !== 'Device') {
          continue;
        }

        // Find the device in our HTML for this task
        var devices = $('#devices > div');
        for (var i2 = 0, l2 = devices.length; i2 < l2; i2++) {
          var device = devices[i2];
          if (device.id.substr(0, 7) !== 'device-') {
            continue;
          }

          if (updatedTask.target_id.toString() === device.id.split('-')[1]) {
            // Remove prior task if it's there
            $(device).find('.lastTask').remove();
            var newTaskHTML = UserPortal.getTaskHtml(updatedTask);
            $(device).append(newTaskHTML);
          }

        }
      }
    }

    // We always will send a list of alacarte profile ids for this user.
    if (data.result.profiles) {
      UserPortal.updateProfiles(data.result.profiles);
    }
  };

  // Setup error handling
  jQuery.ajaxSetup({
    errorq: function(errorObject) {
      // if (console) console.log('error or logged out; going to reload...');
      if (errorObject.status) {
        if (console) {
          console.log('got an error and a status, probably logged out; going to reload...');
        }
        setTimeout(function() {
          window.location.reload(false);
        }, 1000);
      } else {
        if (console) {
          console.log('got an error but no status, going to retry the ajax...');
        }
        setTimeout(window.periodicUpdate, 3000);
      }
    }
  });

  window.onpageshow = function() {
    window.periodicUpdate();
  };

  // Wait 3 seconds before initial periodicUpdate
  setTimeout(window.periodicUpdate, 3000);
  setInterval(window.intervalCheck, 1000);
});