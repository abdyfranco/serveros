/**
 * Copyright (c) 2015 Apple Inc. All rights reserved.
 */

window.addEventListener('click', function(e) {

  if (e.target.className.indexOf('performTask') > -1) {
    var TaskType = e.target.className.split(' ')[1];
    var TargetId = $(e.target)
      .closest('.device')
      .attr('id')
      .split('-')[1];

    if (!$(e.target)
      .closest('.macLockWipePin')
      .length && (TaskType === 'DeviceLock' || TaskType === 'EraseDevice')) {
      var deviceType = jQuery(e.target)
        .closest('.device')
        .find('img')
        .attr('src')
        .split('/')
        .pop();

      // iOS devices can not receive PINs
      if (Math.max(deviceType.indexOf('ipod'), deviceType.indexOf('iphone'), deviceType.indexOf('ipad')) === -1) {
        $(e.target)
          .parent()
          .parent()
          .find('.macLockWipePin')
          .show();
        $(e.target)
          .parent()
          .parent()
          .find('.macLockWipePin input[name="pin1"]')
          .focus()
          .show();
        $('html,body')
          .animate({
            scrollTop: $(e.target)
              .parent()
              .parent()
              .find('.macLockWipePin input[name="pin1"]')
              .offset()
              .top - 32
          }, 1);

        $(e.target)
          .parent()
          .parent()
          .find('.macLockWipePin .tasks .performTask')
          .html($(e.target)
            .html())
          .attr('class', 'performTask ' + TaskType);
        return;
      }
    }

    var pin1, pin2;
    if ($(e.target)
      .closest('.macLockWipePin')
      .length) {

      // Verify both pins are the same
      pin1 = $(e.target)
        .closest('.macLockWipePin')
        .find('input[name="pin1"]')
        .val();
      pin2 = $(e.target)
        .closest('.macLockWipePin')
        .find('input[name="pin2"]')
        .val();

      if (!pin1 && !pin2) {
        return window.alert(window.localized.portal_passcode_is_required);
      }
      if (pin1 !== pin2) {
        return window.alert(window.localized.portal_passcodes_did_not_match);
      }
      if (!(/^[0-9][0-9][0-9][0-9][0-9][0-9]$/)
        .test(pin1)) {
        return window.alert(window.localized.portal_passcode_was_not_six_digit_number);
      }
    }

    if (window.confirm(window.localized.portal_are_you_sure_you_want_to_perform_the + e.target.innerHTML + window.localized.portal_task_on_this_device)) {
      var performTaskFormInfo = {
        task_type: TaskType,
        target_id: TargetId,
      };
      if (pin1) {
        performTaskFormInfo.pin = pin1;
      }
      jQuery.ajax({
        url:  PM_WEBAPP_URI_ROOT+'/task/start_task_from_portal',
        data: performTaskFormInfo,
        type: "POST"
      });
    }

  }
}, false);