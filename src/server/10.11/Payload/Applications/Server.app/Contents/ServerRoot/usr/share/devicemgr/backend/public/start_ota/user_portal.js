/**
 * Copyright (c) 2016 Apple Inc. All rights reserved.
 */

/**
 * Static namespace/class that houses all JS functionality within device portal.
 */
var UserPortal = {

  switchToSettingsTab: function() {
    this.switchToSettingsTabWithoutSavingPreference();
    if (window.localStorage) {
      window.localStorage.tabShown = 'settingsShown';
    }
  },

  switchToSettingsTabWithoutSavingPreference: function() {
    var container = document.getElementById('container');
    container.className = 'settingsShown';
  },

  switchToDevicesTab: function() {
    var container = document.getElementById('container');
    container.className = 'devicesShown';
    if (window.localStorage) {
      window.localStorage.tabShown = 'devicesShown';
    }
  },

  initSelectedTab: function() {
    var c = UserPortalConfig;

    // Switch to the last selected tab if device management is active.
    if (c.apns_active && c.od_active) {
      var lastSelectedTab = window.localStorage && window.localStorage.tabShown;

      // don't select settings tab if the user cannot see profiles
      if (lastSelectedTab === 'settingsShown' && c.can_download_adhoc_profiles) {
        this.switchToSettingsTab();
      } else {
        this.switchToDevicesTab();
      }
      // always the profiles tab when device management is disabled, don't save the preference though.
    } else {
      this.switchToSettingsTabWithoutSavingPreference();
    }

  },

  showProfileDetails: function(e) {
    var target = $(e.target);
    target.parent('.profile').addClass('detailsShown');
  },

  hideProfileDetails: function(e) {
    var target = $(e.target);
    target.parent('.profile').removeClass('detailsShown');
  },

  handleRemoveDevice: function(e) {
    if (window.confirm(window.localized.portal_are_you_sure_you_want_to_remove_this_device)) {
      var id = $(e.target).closest('div.device').attr('id').split('-')[1];
      var removeDeviceForm = document.getElementById('removeDeviceForm');
      removeDeviceForm.id.value = id;
      removeDeviceForm.submit();
    }
    return;
  },

  updateProfiles: function(profilesInfo) {
    var userProfileIds = profilesInfo.profile_ids,
      updatedProfiles = profilesInfo.updated,
      profileNodes = $("#alacarte_profiles .profile"),
      i, l;

    // remove the profiles that aren't in server anymore.
    for (i = 0, l = profileNodes.length; i < l; i++) {
      var n = profileNodes[i],
        profileId = parseInt(n.id.substr(8), 10);
      if (userProfileIds.indexOf(profileId) === -1) {
        n.remove();
      }
    }

    if (updatedProfiles) {
      for (i = 0, l = updatedProfiles.length; i < l; i++) {
        this.renderProfile(updatedProfiles[i]);
      }
    }

  },

  drawProfileDownloadArrows: function() {
    var realCanvases = document.getElementsByTagName('canvas');
    for (var i = 0, l = realCanvases.length; i < l; i++) {
      var canvas = realCanvases[i];
      canvas.width = 65;
      canvas.height = 45;

      var context = canvas.getContext('2d');
      context.fillStyle = '#777';
      context.beginPath();
      context.moveTo(27, 7);
      context.lineTo(38, 7);
      context.lineTo(38, 21);
      context.lineTo(43, 21);
      context.lineTo(32.5, 33);
      context.lineTo(22, 21);
      context.lineTo(27, 21);
      context.closePath();
      context.fill();
      context.beginPath();
      context.moveTo(22, 33);
      context.lineTo(43, 33);
      context.lineTo(43, 36);
      context.lineTo(22, 36);
      context.closePath();
      context.fill();
    }
  },

  // borrowed from mustache
  entityMap: {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  },

  escapeHtml: function(string) {
    return String(string).replace(/[&<>"'\/]/g, function(s) {
      return UserPortal.entityMap[s];
    });
  },

  renderProfile: function(profile) {
    var knob_set_types = profile.knob_set_types,
      profileHTML,
      knobSetTypesHTML = "",
      t = this;

    if (knob_set_types.length > 0) {

      // Remove the no profiles available message if it's there
      $('#no_profile_available')
        .remove();

      // Remove the updated profile from the list if it already exists
      $('#profile-' + profile.id)
        .remove();

      for (var i = 0, l = knob_set_types.length; i < l; i++) {
        var knobSetType = knob_set_types[i];
        knobSetTypesHTML += '<div class="detail"><div class="icon ' + 'admin-' + knobSetType[0] + '-knob-set-large-icon"></div><div class="detailName">' + t.escapeHtml(knobSetType[1]) + '</div></div>';
      }

      profileHTML = '<div class="profile" id="profile-' + profile.id + '">' +
        '<div class="name">' + t.escapeHtml(profile.name) + '</div>' +
        '<p class="description">' + t.escapeHtml(profile.description || '') + '</p>' +

      // knob sets
      '<a class="showDetails" href="javascript:void(0);">' + localized.portal_profile_show_details + '</a>' +
        '<a class="hideDetails" href="javascript:void(0);">' + localized.portal_profile_hide_details + '</a>' +
        '<div class="details">' + knobSetTypesHTML + '</div>' +

      // download profile link
      '<div class="button"><a title="' + localized.portal_download_and_install_profile + '" href="'+PM_WEBAPP_URI_ROOT+'/profile/get_a_la_carte_profile/' + profile.id + '"><canvas></canvas></a></div>' +
        '<p class="getJoin">' + localized.portal_install + '</p>' +
        '</div>';

      // add the profile to the dom
      $('#alacarte_profiles').append(profileHTML);

      // redraw the arrows.
      this.drawProfileDownloadArrows();
      this.registerProfileLinkActions();
    }

  },

  renderProfiles: function() {
    var t = this,
      config = UserPortalConfig,
      profiles = config.profiles;

    for (var i = 0, l = profiles.length; i < l; i++) {
      this.renderProfile(profiles[i]);
    }
  },


  getDeviceType: function() {
    var platform = navigator.platform,
      deviceType = '';

    if (platform && platform.substr) {

      if (platform.substr(0, 4) === 'iPod') {
        // iOS 7 changed this, change it back for our purposes
        deviceType = 'iPod';
      }

      if (platform.substr(0, 3) === 'Mac') {
        deviceType = 'Mac';
      }

      if (platform === 'iPad' || platform === 'iPod' || platform === 'iPhone') {
        deviceType = platform;
      }

    }
    return deviceType;
  },

  getOSType: function() {
    var deviceType = this.getDeviceType(),
      osType;
    switch (deviceType) {
      case 'Mac':
        osType = 'OSX';
        break;
      case 'iPhone':
        osType = 'iOS';
        break;
      case 'iPod':
        osType = 'iOS';
        break;
      case 'iPad':
        osType = 'iOS';
        break;
    }
    return osType;
  },

  doesOSSupportEnrollment: function() {
    var osIsValid, osVersion,
      osType = this.getOSType();

    if (osType === 'OSX') {
      try {
        osVersion = navigator.userAgent.split('(')[1].split(')')[0].split(';')[2].split(' ')[5].replace(/_/g, '.').split('.').slice(0, 2).join('.');
      } catch (e) {
        // Probably a new WebKit
        osVersion = navigator.userAgent.split('(')[1].split(')')[0].split(';')[1].split(' ')[5].replace(/_/g, '.').split('.').slice(0, 2).join('.');
      }

      var versions = osVersion.split('.'),
        majorVersion = versions[0],
        minorVersion = versions[1];
      if (majorVersion >= 10 && minorVersion >= 7) {
        osIsValid = true;
      }

    }

    if (osType === 'iOS') {
      try {
        osVersion = Number(navigator.userAgent.split('(')[1].split(')')[0].split(';')[2].split(' ')[4].replace(/_/g, '.').split('.').slice(0, 2).join('.'));
      } catch (e2) {
        // Probably iOS 5
        osVersion = Number(navigator.userAgent.split('(')[1].split(')')[0].split(';')[1].split(' ')[3].replace(/_/g, '.').split('.').slice(0, 2).join('.'));
      }

      if (osVersion >= 4.1) {
        osIsValid = true;
      }
    }

    // Future-proof in case we don't get the osVersion at all
    if (osType && !osVersion) {
      osIsValid = true; // This might create false positives for old versions of OSX and iOS
    }

    return osIsValid;
  },

  initDeviceToken: function() {
    var localStorage = window.localStorage;
    if (localStorage && !localStorage.thisDeviceToken) {
      localStorage.thisDeviceToken = Math.floor(Math.random() * 100000000000000);
    }
  },

  getLocalizedTextForDeviceFamilyWithKey: function(key, family) {
    return localized[key + '_' + family.toLowerCase()];
  },

  currentDeviceName: function() {
    return this.getLocalizedTextForDeviceFamilyWithKey('portal_this', this.getDeviceType());
  },

  renderEnrollmentUI: function() {
    var config = UserPortalConfig,
      deviceType = this.getDeviceType(),
      deviceTypeHeader = localized.portal_this_generic_device_type,
      enrollThisDeviceText = localized.portal_enroll_this_generic_device_type,
      onceEnrolledText = localized.portal_once_enrolled_you_will,
      deviceIconUrl = PM_WEBAPP_URI_ROOT+'/device/get_icon_for/' + deviceType.toLowerCase(),
      doesOSSupportEnrollment = this.doesOSSupportEnrollment(),
      enrollButtonHtml = '',
      addDeviceHelperHtml = '<p>' + localized.portal_old_os + '</p>',
      enrollmentUIHtml;

    if (deviceType !== '') {
      deviceTypeHeader = this.currentDeviceName();
      enrollThisDeviceText = this.getLocalizedTextForDeviceFamilyWithKey('portal_enroll_this', deviceType);
      onceEnrolledText = this.getLocalizedTextForDeviceFamilyWithKey('portal_once_enrolled', deviceType);
    }

    if (doesOSSupportEnrollment) {
      addDeviceHelperHtml = '<p>' + enrollThisDeviceText + '</p>' +
        '<p>' + onceEnrolledText + '</p>';
      enrollButtonHtml = '<div id="addDevice"><button>' + localized.portal_enroll_button + '</button></div>';
    }

    enrollmentUIHtml = '<div id="addDeviceFakeDevice" class="device">' +
      '<div class="deviceName">' + deviceTypeHeader + '</div>' +
      '<img id="fakeDeviceIcon" src="' + deviceIconUrl + '" alt="DeviceIcon" />' +
      '<div id="addDeviceHelperText">' +
      addDeviceHelperHtml +
      '</div>' +
      '<form id="addDeviceForm" action="'+PM_PHP_NEW_URI_ROOT+'/mdm_enroll"  method="post">' +
      '<input id="authenticity_token" name="authenticity_token" type="hidden" value="' + config.authenticity_token + '" />' +
      enrollButtonHtml +
      '<input type="hidden" id="device_type" name="device_type" value="' + deviceType + '" />' +
      '<input type="hidden" id="device_identifier" name="device_identifier" value="' + localStorage.thisDeviceToken + '" />' +
      '</form>' +
      '</div>';
    $('#devices').append(enrollmentUIHtml);
  },

  currentDeviceEnrolled: function() {
    var config = UserPortalConfig,
      devices = config.devices,
      thisDeviceToken = localStorage.thisDeviceToken;

    for (var i = 0, l = devices.length; i < l; i++) {
      if (devices[i].identifier === thisDeviceToken) {
        return true;
      }
    }
  },

  initEnrollment: function() {
    if (UserPortalConfig.allow_enrollment_via_portal && !this.currentDeviceEnrolled()) {
      this.renderEnrollmentUI();
    }
  },

  getLastTaskHtml: function(task) {
    var newTaskHTML = '<div class="lastTask">';

    if (task.task_type === 'EraseDevice') {
      newTaskHTML += window.localized.portal_wipe_task + ' ';
    } else if (task.task_type === 'ClearPasscode') {
      newTaskHTML += window.localized.portal_clear_passcode_task + ' ';
    } else
    if (task.task_type === 'DeviceLock') {
      newTaskHTML += window.localized.portal_lock_task + ' ';
    }

    if (task.completed_at) {
      if (task.succeeded_target_count > 0) {
        newTaskHTML += window.localized.portal_task_completed + ' ';
      } else if (task.canceled_target_count > 0) {
        newTaskHTML += window.localized.portal_task_cancelled + ' ';
      } else {
        newTaskHTML += window.localized.portal_task_failed + ' ';
      }
      newTaskHTML += '<br/>';

      // Format the date
      var date = new Date(),
        updatedAt = task.updated_at;
      date.setUTCFullYear(updatedAt.substr(0, 4));
      date.setUTCMonth(updatedAt.substr(5, 2) - 1);
      date.setUTCDate(updatedAt.substr(8, 2));
      date.setUTCHours(updatedAt.substr(11, 2));
      date.setUTCMinutes(updatedAt.substr(14, 2));
      date.setUTCSeconds(updatedAt.substr(17, 2));
      newTaskHTML += date.toLocaleString();

    } else {
      newTaskHTML += window.localized.portal_task_is_in_progress;
    }

    return newTaskHTML;
  },

  getRemoveDeviceHtml: function() {
    return '<div class="removeDevice"><a href="javascript:void(0)" title="' + window.localized.portal_remove_device_tooltip + '" class="removeDeviceLink">' +
      window.localized.portal_remove_device_button +
      '</a></div>';
  },

  getTasksHtml: function(device) {
    var tasksHtml = '<div class="tasks">';

    // Add task buttons based on the permissions
    if (UserPortalConfig.can_lock_device) {
      tasksHtml += '<a href="javascript:void(0)" class="performTask DeviceLock">' + window.localized.portal_lock_task + '</a>';
    }

    if (UserPortalConfig.can_wipe_device) {
      tasksHtml += '<a href="javascript:void(0)" class="performTask EraseDevice">' + window.localized.portal_wipe_task + '</a>';
    }

    if (!device.is_mac && UserPortalConfig.can_clear_passcode_on_device) {
      tasksHtml += '<a href="javascript:void(0)" class="performTask ClearPasscode">' + window.localized.portal_clear_passcode_task + '</a>';
    }

    // End tasks
    tasksHtml += '</div>';

    if (device.is_mac) {
      tasksHtml += '<div class="macLockWipePin" style="display:none;">' +
        '<form>' +
        '<label>' + window.localized.portal_enter_a_passcode + '</label>' +
        '<input type="password" name="pin1"/>' +
        '<label>' + window.localized.portal_reenter_your_passcode + '</label>' +
        '<input type="password" name="pin2"/>' +
        '<label>' + window.localized.portal_this_device_cannot_be_unlocked_remotely + '</label>' +
        '<div class="tasks"><a href="javascript:void(0);" class="performTask">Lock/Wipe</a></div>' +
        '</form>' +
        '</div>';
    }

    return tasksHtml;
  },

  renderDevice: function(device) {
    var currentDevice = (device.identifier === window.localStorage.thisDeviceToken),
      newDeviceHTML = '',
      isDeviceRemovable = UserPortalConfig.allow_enrollment_via_portal && device.is_mdm_removable,
      removeDeviceHTML = isDeviceRemovable ? this.getRemoveDeviceHtml() : '',
      deviceName = (currentDevice ? this.currentDeviceName() : this.escapeHtml(device.DeviceName)),
      deviceDomId = 'device-' + device.id,
      t = this,
      productName = device.ProductName,
      isAppleTV = productName && (productName.indexOf('AppleTV') > -1);

    // don't rerender an existing device, atleast for now.
    if ($("#" + deviceDomId).length > 0) {
      return;
    }

    newDeviceHTML += '<div class="device" id="' + deviceDomId + '">' +
      '<div class="deviceName"><div class="device-name-text">' + deviceName + '</div>' + removeDeviceHTML + '</div>' +
      '<img src="'+PM_WEBAPP_URI_ROOT+'/device/get_icon_for/' + device.ProductName.toLowerCase().replace(',', '_') + '" />' +
      '<div class="deviceSerial">' + window.localized.portal_serial_number + ' ' + device.SerialNumber + '</div>';
        

    if (!isAppleTV) {
      newDeviceHTML += this.getTasksHtml(device);
    }

    if (device.last_task) {
      newDeviceHTML += this.getLastTaskHtml(device.last_task);
    }

    // end device.
    newDeviceHTML += '</div>';

    if (currentDevice) {
      $("#addDeviceFakeDevice").hide();
      $('#devices').prepend(newDeviceHTML);
    } else {
      $('#devices').append(newDeviceHTML);
    }

  },

  renderDevices: function() {
    var devices = UserPortalConfig.devices;
    for (var i = 0, l = devices.length; i < l; i++) {
      this.renderDevice(devices[i]);
    }
  },

  registerProfileLinkActions: function() {
    var t = this;

    $(".showDetails").click(
      $.proxy(t.showProfileDetails, t)
    );

    $(".hideDetails").click(
      $.proxy(t.hideProfileDetails, t)
    );

  },

  registerDeviceActions: function() {
    var t = this;
    $("#devices").delegate(".removeDeviceLink", "click", $.proxy(t.handleRemoveDevice, t));
  },

  registerEventListeners: function() {
    var t = this,
      config = UserPortalConfig;

    $("#settingsTab").click(
      $.proxy(t.switchToSettingsTab, t)
    );

    $("#devicesTab").click(
      $.proxy(t.switchToDevicesTab, t)
    );

    t.registerDeviceActions();
    t.registerProfileLinkActions();
  },

  init: function() {
    var config = UserPortalConfig;
    this.initDeviceToken();
    this.initSelectedTab();
    this.renderProfiles();
    if (config.apns_active && config.od_active) {
      this.initEnrollment();
      this.renderDevices();
    }
    this.registerEventListeners();
    this.drawProfileDownloadArrows();
  }

};

/* Onload handler */
$(document).ready(function() {

  UserPortal.init();

  // Update task completed date nodes with formatted date.
  $('span.task-completed-date').each(function(index, elem) {
    var node = $(elem),
      updatedAt = node.data('task-completed_at'),
      date = new Date();
    date.setUTCFullYear(updatedAt.substr(0, 4));
    date.setUTCMonth(updatedAt.substr(5, 2) - 1);
    date.setUTCDate(updatedAt.substr(8, 2));
    date.setUTCHours(updatedAt.substr(11, 2));
    date.setUTCMinutes(updatedAt.substr(14, 2));
    date.setUTCSeconds(updatedAt.substr(17, 2));
    node.html(date.toLocaleString());
  });

  // Finally, show the UI
  document.body.className += ' ready';

});