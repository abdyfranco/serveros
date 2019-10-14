/**
 * Copyright (c) 2016 Apple Inc. All rights reserved.
 */

window.addEventListener('click', function(e) {

  if (e.target.className.indexOf('performTask') > -1) {
    var taskType = e.target.className.split(' ')[1],
      targetObject = $(e.target),
      targetId = targetObject.closest('.device').attr('id').split('-')[1];


    // If the user is initiating Lock or Erase task show the passcode fields. The button to actually perform the task
    // will have a closest pin in the DOM tree
    if (!targetObject.closest('.macLockWipePin').length && (taskType === 'DeviceLock' || taskType === 'EraseDevice')) {

      var deviceContainer = targetObject.parent().parent(),
        requirePasscodes = deviceContainer.find('.macLockWipePin').length > 0;
      if (requirePasscodes) {

        deviceContainer.find('.macLockWipePin').show();
        deviceContainer.find('.macLockWipePin input[name="pin1"]').focus().show();

        $('html,body').animate({
          scrollTop: deviceContainer.find('.macLockWipePin input[name="pin1"]').offset().top - 32
        }, 1);

        deviceContainer.find('.macLockWipePin .tasks .performTask').html(
          targetObject.html()
        ).attr('class', 'performTask ' + taskType);

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
        task_type: taskType,
        target_id: targetId,
      };
      if (pin1) {
        performTaskFormInfo.pin = pin1;
      }
      jQuery.ajax({
        url: PM_WEBAPP_URI_ROOT + '/task/start_task_from_portal',
        data: performTaskFormInfo,
        type: "POST"
      });
    }

  }
}, false);