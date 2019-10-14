// Copyright (c) 2009-2014 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

var TimeTextField = Class.create();
TimeTextField.prototype = {
	mSelectedDate: new Date(),
	mRestrictBeforeTimeField: null,
	mRestrictAfterTimeField: null,
	mDirty: false,
	initialize: function(inElement /*,[options]*/) {
		bindEventListeners(this, ['handleChanged', 'handleKeyPress']);
		this.mElement = $(inElement);
		this.mElement.addClassName('timetextfield');
		if (arguments.length > 1) Object.extend(this, arguments[1]);
		observeEvents(this, this.mElement, {change:'handleChanged', keydown:'handleKeyPress'});
		this.updateShownDate();
	},
	handleChanged: function(inEvent) {
		var dateStr = this.mElement.value;
		// if we see a PM then add 12 hours
		var hourDelta = (dateStr.toLowerCase().indexOf('_Calendar.AMPM.PM'.loc().toLowerCase()) < 0 ? 0 : 12);
		var hours = (-1);
		var minutes = 0;
		// match 12:34
		var hoursAndMinutesMatch = dateStr.match(/(\d{1,2})[:-](\d{1,2})/);
		var hoursMatch = dateStr.match(/(\d{1,2})/);
		if (hoursAndMinutesMatch) {
			hours = parseInt(hoursAndMinutesMatch[1]) + hourDelta;
			minutes = parseInt(hoursAndMinutesMatch[2]);
		}
		// match just an hour
		else if (hoursMatch) {
			hours = parseInt(hoursMatch[1]) + hourDelta;
		}
		// match 12 (such as 12 pm)
		if (hours % 12 == 0) {
			hours = ((hours / 12) - 1) * 12;
		}
		// sanity check
		if ((0 > hours || hours > 23) || (0 > minutes || minutes > 59)) {
			this.updateShownDate();
			return false;
		}
		// set a new date
		var dt = new Date(this.mSelectedDate.getTime());
		dt.setHours(hours);
		dt.setMinutes(minutes);
		if (!this.setValue(dt, true)) return false;
		this.mDirty = true;
		globalNotificationCenter().publish('TIME_FIELD_CHANGED', this, {value:this.getValue()});
	},
	handleKeyPress: function(inEvent) {
		var delta = 0;
		if (inEvent.keyCode == Event.KEY_DOWN) {
			if (this.mSelectedDate.getHours() > 0) {
				delta = (-1);
				inEvent.stop();
			}
		}
		else if (inEvent.keyCode == Event.KEY_UP) {
			if (this.mSelectedDate.getHours() < 23) {
				delta = 1;
				inEvent.stop();
			}
		}
		if (delta != 0) {
			var dt = new Date(this.mSelectedDate.getTime());
			dt.setHours(dt.getHours() + delta);
			if (this.setValue(dt, true)) {
				this.mDirty = true;
				globalNotificationCenter().publish('TIME_FIELD_CHANGED', this, {value:this.getValue()});
			}
		}
	},
	updateShownDate: function() {
		this.mElement.value = this.mSelectedDate.formatDate('_Dates.DateFormats.HourAndMinutes'.loc());
	},
	getValue: function() {
		return new Date(this.mSelectedDate.getTime());
	},
	setValue: function(inDateValue, inOptCheckValue) {
		globalNotificationCenter().publish('SELECTED_DATE_WILL_CHANGE', this);
		if (inOptCheckValue && (
				(this.mRestrictBeforeTimeField && inDateValue > this.mRestrictBeforeTimeField.mSelectedDate)
				|| (this.mRestrictAfterTimeField && inDateValue < this.mRestrictAfterTimeField.mSelectedDate))) {
			this.updateShownDate();
			return false;
		}
		var oldSelectedDate = this.mSelectedDate;
		this.mSelectedDate = inDateValue;
		this.updateShownDate();
		this.mDirty = false;
		globalNotificationCenter().publish('SELECTED_DATE_CHANGED', this, {selectedDate:this.mSelectedDate, oldSelectedDate:oldSelectedDate});
		return true;
	}
}

var CalendarColorPicker = Class.create();
CalendarColorPicker.prototype = {
	mColorKeys: ['Blue', 'Green', 'Red', 'Orange', 'Pink', 'Purple'],
	initialize: function(inParentElement, inPopupElementID) {
		this.mParentElement = $(inParentElement);
		this.mEnabled = true;
		// build the parent element's DOM
		replaceElementContents(inParentElement, Builder.node('a', {href:'#'}, [
			Builder.node('span', {className:'calendarcolor_swatch'}, "\u00A0"),
			Builder.node('span', {className:'calendarcolor_label'}, '_Calendar.Color.Blue'.loc())
		]));
		Element.addClassName(this.mParentElement, 'calendarcolor_handle');
		// install event handler for parent element
		this.mParentElement.down('a').observe('click', function(inEvent) {
			inEvent.stop();
			if (!this.mEnabled) return false;
			if (!$(inPopupElementID)) {
				var colorPopup = popupManager().createPopupElement('calendar_color_popup', inPopupElementID);
				RemoteCalendarCollection.defaultCalendarColors.each(function(currentColor, i) {
					var itemCallback = function() {
						colorPopup.hide();
						this.mParentElement.down('span.calendarcolor_swatch').style.backgroundColor = currentColor;
						replaceElementContents(this.mParentElement.down('span.calendarcolor_label'), ('_Calendar.Color.'+this.mColorKeys[i]).loc());
					}
					var colorPopupItem = popupManager().itemWithTitle(colorPopup, ('_Calendar.Color.'+this.mColorKeys[i]).loc(), null, itemCallback.bind(this));
					colorPopupItem.parentNode.insertBefore(Builder.node('span', {className:'calendarcolor_swatch', style:'background-color:'+currentColor}), colorPopupItem);
				}.bind(this));
			}
			// show the popup
			popupManager().show(this.mParentElement.down('a'), inPopupElementID, (-32));
			return false;
		}.bind(this));
	},
	getValue: function() {
		return String.hexValueForColorString(this.mParentElement.down('span.calendarcolor_swatch').style.backgroundColor);
	},
	setValue: function(inColorValue) {
		this.mParentElement.down('span.calendarcolor_swatch').style.backgroundColor = inColorValue;
		var foundLabel = RemoteCalendarCollection.defaultCalendarColors.indexOf(inColorValue.toUpperCase());
		replaceElementContents(this.mParentElement.down('span.calendarcolor_label'), (foundLabel < 0 ? '_Calendar.Color.Custom'.loc() : ('_Calendar.Color.'+this.mColorKeys[foundLabel]).loc()));
	}
}

var AppointmentDialogManager = Class.createWithSharedInstance('appointmentDialog');
AppointmentDialogManager.prototype = {
	mAvailabilityWidth: 450,
	mAvailabilityRange: [0, 24],
	mTabs: ['appointment_dialog_tab_general', 'appointment_dialog_tab_invitees', 'appointment_dialog_tab_notes'],
	initialize: function() {
		bindEventListeners(this, [
			'handleAllDayChanged', 'handleTabLinkClicked', 'handleDeleteClick', 'handleRecurrenceTypeChanged',
			'handleRecurrenceEndTypeChanged', 'handleAttendeeHeaderLinkClick', 'handleMouseDownInAttendeeTime',
			'handleAttendeeTimeRescheduleMove', 'handleAttendeeTimeRescheduleEnd']);
		// draw the basic dialog
		this.mAppointmentDialog = dialogManager().drawDialog('appointment_dialog', [
			{label:'_Calendar.Dialogs.Appointment.Summary'.loc(), contents:'<input name="summary" id="appointment_dialog_summary" type="text" class="appointment_dialog_field" />'},
			{label:'_Calendar.Dialogs.Appointment.Location'.loc(), contents:'<input name="location" id="appointment_dialog_location" type="text" class="appointment_dialog_field" />'},
			{label:'_Calendar.Dialogs.Appointment.StartTime'.loc(), contents:'<div id="appointment_dialog_dtstart"></div>'},
			{label:'_Calendar.Dialogs.Appointment.EndTime'.loc(), contents:'<div id="appointment_dialog_dtend"></div>'},
			{label:'', contents:'<label for="appointment_dialog_allday_checkbox" id="appointment_dialog_allday_label"><input type="checkbox" id="appointment_dialog_allday_checkbox" />'+('_Calendar.Dialogs.Appointment.AllDayEvent'.loc())+'</label>'},
			{label:'_Calendar.Dialogs.Appointment.Calendar'.loc(), contents:'<select id="appointment_dialog_calendar_select"></select>'},
			{label:'_Calendar.Dialogs.Appointment.Repeat.Label'.loc(), contents:'<select id="appointment_dialog_recurrence_select"></select>'},
			{label:'_Calendar.Dialogs.Appointment.Repeat.End.Label'.loc(), contents:'<div id="appointment_dialog_recurrence_end_container"><select id="appointment_dialog_recurrence_end_select"></select></div>'}
		], '_Dialogs.OK'.loc(), null, '_Calendar.Dialogs.Appointment.Title'.loc());
		// add the view switcher
		replaceElementContents(this.mAppointmentDialog.down('thead').down('td'), Builder.node('div', {className:'calendartoolbar', id:'appointment_dialog_tabs'}, [
			Builder.node('ul', [
				Builder.node('li', {className:'first'}, [
					Builder.node('a', {href:'#', id:'appointment_dialog_tab_general'}, '_Calendar.Dialogs.Appointment.Tabs.General'.loc())
				]),
				Builder.node('li', {className:'middle'}, [
					Builder.node('a', {href:'#', id:'appointment_dialog_tab_invitees'}, '_Calendar.Dialogs.Appointment.Tabs.Attendees'.loc())
				]),
				Builder.node('li', {className:'last'}, [
					Builder.node('a', {href:'#', id:'appointment_dialog_tab_notes'}, '_Calendar.Dialogs.Appointment.Tabs.Notes'.loc())
				])
			])
		]));
		this.mInvitesAllowed = principalService().isIndividual();
		// remove the invite stuff for group calendars
		if (!this.mInvitesAllowed) {
			$('appointment_dialog_tab_invitees').up('ul').addClassName('noInvitees');
			$('appointment_dialog_tab_invitees').up('li').remove();
			$('appointment_dialog_tab_notes').up('li').addClassName('middle');
		}
		// add event handlers for the paginator links
		$$('#appointment_dialog_tabs a').invoke('observe', 'click', this.handleTabLinkClicked);
		// add the attendee list
		this.mButtonsRow = $('appointment_dialog_ok').up('tr');
		this.mButtonsRow.parentNode.insertBefore(Builder.node('tr', [
			Builder.node('td', {colSpan:'2'}, [
				Builder.node('ul', {id:'appointment_dialog_attendee_header'}, [
					Builder.node('li', {className:'appointment_attendee_name'}, '_Calendar.Dialogs.Appointment.Attendees.Name'.loc())
				]),
				Builder.node('div', {id:'appointment_dialog_attendees'}, [
					Builder.node('ul', {id:'appointment_attendee_list'}, [
						Builder.node('li', {className:'next_appointment_attendee'}, [
							Builder.node('ul', {className:'appointment_attendee_availability'}, [
								Builder.node('li', {className:'appointment_attendee_name'}, [
									Builder.node('input', {type:'text', id:'appointment_next_attendee', placeholder:'_Calendar.Dialogs.Appointment.Attendees.Hint'.loc()})
								])
							])
						])
					]),
					Builder.node('div', {id:'appointment_attendee_schedtime'}, "\u00A0")
				])
			])
		]), this.mButtonsRow);
		// add the attendee date row
		this.mButtonsRow.parentNode.insertBefore(Builder.node('tr', {className:'appointment_dialog_attendee_daterow'}, [
			Builder.node('td', {colSpan:'2'}, [
				Builder.node('a', {href:'#', id:'appointment_dialog_attendee_prevdate'}, '<'),
				Builder.node('span', {id:'appointment_dialog_attendee_date'}, '-'),
				Builder.node('a', {href:'#', id:'appointment_dialog_attendee_nextdate'}, '>')
			])
		]), $('appointment_dialog_attendee_header').up('tr'));
		// calculate the availability cell width
		this.mAvailabilityCellWidth = this.mAvailabilityWidth / (this.mAvailabilityRange[1] - this.mAvailabilityRange[0]);
		$('appointment_dialog_attendee_header').down('li.appointment_attendee_name').setStyle({marginRight:'0'});
		// add the labels
		var headerRow = $('appointment_dialog_attendee_header');
		for (var i = this.mAvailabilityRange[0]; i < this.mAvailabilityRange[1]; i+=2) {
			headerRow.appendChild(Builder.node('li', {className:'appointment_attendee_availability_header', style:'width:'+((this.mAvailabilityCellWidth*2)-(browser().isWebKit()?1:0)-/*6717068*/(browser().isIE?1:0))+'px'}, [
				Builder.node('span', getLocalizedHourKey(i))
			]));
		}
		if (this.mInvitesAllowed) {
			// set up the attendee search field
			this.mAttendeeSearchField = new CalendarPrincipalSearchField('appointment_next_attendee', {
				mStartedItemSearchCallback: function() {
					// do nothing for now
				},
				mClickedItemCallback: function(inUID, inURL) {
					if (inURL) {
						this.addAttendee(this.mAttendeeSearchField.mChosenDataSource, true);
						$('appointment_next_attendee').value = '';
						// get updated freebusy
						this.updateAttendeeTimeFromFields();
						this.getFreeBusyReport();
					}
				}.bind(this)
			});
			// watch for email addresses
			this.mAttendeeSearchField.old_handleChanged = this.mAttendeeSearchField.handleChanged;
			this.mAttendeeSearchField.handleChanged = function(e) {
				var attendeeValue = $F('appointment_next_attendee');
				if (attendeeValue.match(FreeBusyLookup.emailAddressTest)) {
					this.addAttendee({uid:'mailto:'+attendeeValue.replace(/^mailto:/, ''), displayname:attendeeValue}, true);
					$('appointment_next_attendee').value = '';
					this.updateAttendeeTimeFromFields();
					Event.stop(e);
					return false;
				}
				return this.mAttendeeSearchField.old_handleChanged(e);
			}.bindAsEventListener(this);
			// location search field
			this.mLocationSearchField = new CalendarLocationSearchField('appointment_dialog_location', {
				mFindResourceTypes: ['locations'],
				mClickedItemCallback: function(inURL, inURL) {
					// add location to the appointment attendees
					var location = this.mLocationSearchField.mChosenDataSource;
					location.cutype = 'ROOM';
					var removedRoom = this.mShownAppointment.removeRoomAttendee();
					if (removedRoom) {
						var removedRoomElm = $('appointment_attendee_uid_'+normalizeUID(removedRoom));
						if (removedRoomElm) removedRoomElm.remove();
					}
					this.addAttendee(location, true);
				}.bind(this),
				mSearchResultCallback: function(inResponseObj) {
					// TODO: perform freebusy search for all of the locations returned
					var gotFreeBusyCallback = function(inResult) {
						this.mLocationSearchField.mRows.each(function(row, i) {
							var elm = $('appointment_dialog_location_results_'+row.uid);
							var fbForElm = inResult.detect(function(result) {
								return (result.recipient == row.uid);
							});
							if (elm && fbForElm && fbForElm.blocks && fbForElm.blocks.length > 0) {
								Element.addClassName(elm, 'appointment_busy_location');
							}
							else if (elm && fbForElm && fbForElm.blocks) {
								Element.addClassName(elm, 'appointment_free_location');
							}
						}.bind(this));
					}
					if (inResponseObj && inResponseObj.length > 0) {
						this.mShownAppointment.getFreeBusyReport(gotFreeBusyCallback.bind(this), null, null, inResponseObj);
					}
				}.bind(this)
			});
			this.mLocationSearchField.mResultTable.id = 'appointment_dialog_location_results';
		}
		// add the notes field
		this.mButtonsRow.parentNode.insertBefore(Builder.node('tr', [
			Builder.node('td', {colSpan:'2'}, [
				Builder.node('textarea', {id:'appointment_dialog_notes'})
			])
		]), this.mButtonsRow);
		this.mDialogRows = $$('#appointment_dialog tbody tr');
		this.mDialogRows.pop(); // last row is the OK/Cancel buttons
		this.mTabbedRows = $A([$R(0, 7), $R(8, 9), $R(10, 10)]);
		// add the recurrence select options
		var recurrenceTypeSelect = $('appointment_dialog_recurrence_select');
		$A(['none', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', '-', 'custom']).each(function(key) {
			recurrenceTypeSelect.appendChild(Builder.node('option', {value:key}, (key=='-'?"\u00A0":('_Calendar.Dialogs.Appointment.Repeat.'+key).loc())));
		});
		recurrenceTypeSelect.options[recurrenceTypeSelect.options.length-2].disabled = true;
		recurrenceTypeSelect.options[recurrenceTypeSelect.options.length-1].disabled = true;
		Event.observe(recurrenceTypeSelect, 'change', this.handleRecurrenceTypeChanged);
		// add the recurrence end select options (FIXME: localize recurrence types for dialog manager)
		this.mRecurrenceEndTypeSelect = $('appointment_dialog_recurrence_end_select');
		var oldLabel = this.mRecurrenceEndTypeSelect.up('tr').down('th').down('label');
		this.mRecurrenceEndLabel = Builder.node('div', {style:'height:0;overflow:hidden'}, Element.firstNodeValue(oldLabel));
		replaceElementContents(oldLabel, this.mRecurrenceEndLabel);
		var recurrenceEndTypeSelect = $('appointment_dialog_recurrence_end_select');
		this.mRecurrenceEndContainer = $('appointment_dialog_recurrence_end_container');
		this.mRecurrenceEndContainer.style['height'] = '0';
		this.mRecurrenceEndContainer.style['overflow'] = 'hidden';
		$A(['Never', 'After', 'On_date']).each(function(key) {
			recurrenceEndTypeSelect.appendChild(Builder.node('option', {value:key.toLowerCase()}, ('_Calendar.Dialogs.Appointment.Repeat.End.'+key).loc()));
		});
		Event.observe(recurrenceEndTypeSelect, 'change', this.handleRecurrenceEndTypeChanged);
		// add the end info
		$('appointment_dialog_recurrence_end_container').appendChild(Builder.node('div', {id:'appointment_dialog_recurrence_end_after_container', style:'display:none'}, [
			Builder.node('input', {type:'text', id:'appointment_dialog_recurrence_end_after'}),
			"\u00A0"+('_Calendar.Dialogs.Appointment.Repeat.End.times'.loc())
		]));
		$('appointment_dialog_recurrence_end_container').appendChild(Builder.node('div', {id:'appointment_dialog_recurrence_end_ondate', style:'display:none'}, "\u00A0"));
		this.mRecurrenceEndDatePicker = new NiftyDatePicker({mParentElement:'appointment_dialog_recurrence_end_ondate', mStartWeekday:principalService().startWeekday()});
		// add the delete button
		var td = $('appointment_dialog_ok').up('td');
		td.colSpan = '1';
		td.parentNode.insertBefore(Builder.node('td', [
			Builder.node('div', {className:'submit'}, [
				Builder.node('input', {type:'button', id:'appointment_dialog_delete', value:'_Calendar.Dialogs.Appointment.Delete'.loc()})
			])
		]), td);
		$('appointment_dialog_delete').onclick = this.handleDeleteClick;
		// add the start date fields
		$('appointment_dialog_dtstart').appendChild(Builder.node('input', {type:'text', id:'appointment_dialog_dtstart_time'}));
		$('appointment_dialog_dtstart').appendChild(Builder.node('a', {href:'#', id:'appointment_dialog_dtstart_date'}, '-'));
		// set up the start date
		this.mDialogStartDatePicker = new NiftyDatePicker({mParentElement:'appointment_dialog_dtstart_date', mStartWeekday:principalService().startWeekday()});
		this.mDialogStartTimePicker = new TimeTextField('appointment_dialog_dtstart_time');
		globalNotificationCenter().subscribe('DATE_PICKER_SHOWN', this.handleDatePickerShown.bind(this), this.mDialogStartDatePicker);
		globalNotificationCenter().subscribe('SELECTED_DATE_WILL_CHANGE', this.handleStartTimeWillChange.bind(this), this.mDialogStartDatePicker);
		globalNotificationCenter().subscribe('SELECTED_DATE_WILL_CHANGE', this.handleStartTimeWillChange.bind(this), this.mDialogStartTimePicker);
		globalNotificationCenter().subscribe('SELECTED_DATE_CHANGED', this.handleStartTimeChanged.bind(this), this.mDialogStartDatePicker);
		globalNotificationCenter().subscribe('SELECTED_DATE_CHANGED', this.handleStartTimeChanged.bind(this), this.mDialogStartTimePicker);
		// add the end date fields
		$('appointment_dialog_dtend').appendChild(Builder.node('input', {type:'text', id:'appointment_dialog_dtend_time'}));
		$('appointment_dialog_dtend').appendChild(Builder.node('a', {href:'#', id:'appointment_dialog_dtend_date'}));
		// set up the end date
		this.mDialogEndDatePicker = new NiftyDatePicker({mParentElement:'appointment_dialog_dtend_date', mStartWeekday:principalService().startWeekday()});
		this.mDialogEndTimePicker = new TimeTextField('appointment_dialog_dtend_time');
		// change the attendee date header when the date picker control changes
		//7101682 ... but only when the START Date picker control changes
		globalNotificationCenter().subscribe('SELECTED_DATE_CHANGED', function(inMessage, inObject, inUserInfo) {
			replaceElementContents('appointment_dialog_attendee_date', inUserInfo.selectedDate.formatDate('_Dates.DateFormats.MediumDate'.loc()));
		}, this.mDialogStartDatePicker);
		// change the date field's start day when the start weekday changes
		globalNotificationCenter().subscribe('START_WEEKDAY_CHANGED', function(inMessage, inObject, inUserInfo) {
			this.mDialogStartDatePicker.setStartWeekday(inUserInfo.startWeekday);
			this.mDialogEndDatePicker.setStartWeekday(inUserInfo.startWeekday);
		}.bind(this));
		// hide start date picker when end date picker is shown
		globalNotificationCenter().subscribe('DATE_PICKER_SHOWN', this.handleDatePickerShown.bind(this), this.mDialogEndDatePicker);
		// hook up the attendee date header links
		$$('#appointment_dialog tr.appointment_dialog_attendee_daterow a').invoke('observe', 'click', this.handleAttendeeHeaderLinkClick);
		// set up the attendee time widget
		$('appointment_attendee_schedtime').observe('mousedown', this.handleMouseDownInAttendeeTime);
		$('appointment_dialog_allday_checkbox').observe('change', this.handleAllDayChanged);
	},
	selectTab: function(inTabIndex, inAnimateDialogSize) {
		if (inAnimateDialogSize) dialogManager().willResize();
		if (!this.mFakeTableBody) {
			this.mFakeTableBody = Builder.node('tbody');
			d.body.appendChild(Builder.node('table', {style:'display:none'}, [this.mFakeTableBody]));
		}
		this.mDialogRows.each(function(row, i) {
			if (this.mTabbedRows[inTabIndex].include(i)) {
				if (!row.up('#appointment_dialog')) {
					row.remove();
					this.mButtonsRow.parentNode.insertBefore(row, this.mButtonsRow);
				}
			}
			else if (row.up('#appointment_dialog')) {
				row.remove();
				this.mFakeTableBody.appendChild(row);
			}
		}.bind(this));
		// set up the current tab stuff
		if (inTabIndex == 0) {
			this.hideOrShowRecurrenceEnd();
		}
		else if (inTabIndex == 1) {
			// attendee tab selected; update the shown time here
			this.updateAttendeeTimeFromFields();
			// get updated freebusy
			this.getFreeBusyReport();
		}
		if (inAnimateDialogSize) dialogManager().didResize();
		// set the selected state on the tab
		if (inTabIndex > this.mTabs.size() - 1) return;		
		calendarViewController().setSelectedChild(this.mTabs[inTabIndex]);
	},
	show: function(inAppointment, inCancelCallback, inOKCallback, inOptElement, inOptDeleteCallback) {
		var elm = inOptElement;
		if (!elm && inAppointment.displayNodes) {
			var node = inAppointment.displayNodes.detect(function(node) {
				if (node.element) return true;
			});
			if (node) elm = node.element;
		}
		if (!elm) {
			tempApptDivs = $$('#module_calendars .temporary_calendar_appointment');
			if (tempApptDivs.length > 0) {
				elm = tempApptDivs[0];
			}
		}
		// reset hidden values
		if (inAppointment.mDesiredCalendar) delete inAppointment.mDesiredCalendar;
		// remember values and callbacks
		this.mShownAppointment = inAppointment;
		this.mDeleteCallback = inOptDeleteCallback;
		// if this is not a user-generated appointment, show the invite dialog instead
		if (!inAppointment.organizerIsPrincipal()) {
			invitationDialog().show(inAppointment, inCancelCallback, inOKCallback, elm);
			return true;
		}
		$('appointment_dialog_delete').style.display = inAppointment.isNew() ? 'none' : '';
		// switch to the first tab
		this.selectTab(0);
		// setup summary and location fields
		$('appointment_dialog_summary').value = inAppointment.summary() || '';
		$('appointment_dialog_location').value = inAppointment.location() || '';
		// populate the calendar popup
		this.updateCalendarsInPopup();
		// calendar in which the event resides
		Form.setSelectValue('appointment_dialog_calendar_select', inAppointment.mParentCalendarFile.mParentCalendar.mLastPathComponent);
		// populate start time
		this.setStartDateOnFields(inAppointment.startDate());
		// all day field
		$('appointment_dialog_allday_checkbox').checked = (inAppointment.banner() == true);
		this.handleAllDayChanged();
		// populate end time
		this.setEndDateOnFields(inAppointment.endDate());
		// recurrence fields
		$('appointment_dialog_recurrence_select').value = (inAppointment.recurrenceInfo() ? inAppointment.recurrenceInfo().frequency() : 'none');
		this.handleRecurrenceTypeChanged();
		// show the dialog
		var cancelCallback = function() {
			this.mDialogStartDatePicker.hide();
			this.mDialogEndDatePicker.hide();
			if (inCancelCallback) inCancelCallback();
		}
		var okCallback = function() {
			inAppointment.setBanner($('appointment_dialog_allday_checkbox').checked);
			inAppointment.setSummary($F('appointment_dialog_summary'));
			inAppointment.setLocation($F('appointment_dialog_location'));
			inAppointment.setStartDate(this.getStartDateFromFields());
			inAppointment.setEndDate(this.getEndDateFromFields());
			inAppointment.setRecurrenceFrequency($F('appointment_dialog_recurrence_select'));
			this.setDesiredCalendarFromFields(inAppointment);
			var idx = $('appointment_dialog_recurrence_select').selectedIndex;
			var d = null;
			if (idx > 0 && idx < 5) {
				var recurrenceInfo = inAppointment.recurrenceInfo();
				switch ($('appointment_dialog_recurrence_end_select').selectedIndex) {
					case 0: // none
						recurrenceInfo.setCount(null);
						break;
					case 1: // count
						recurrenceInfo.setCount($F('appointment_dialog_recurrence_end_after'));
						break;
					case 2: // until date
						// advance date to end of day
						d = this.mRecurrenceEndDatePicker.mSelectedDate;
						d.setHours(23);
						d.setMinutes(59 + d.getTimezoneOffset());	// convert to GMT
						d.setSeconds(59);
						recurrenceInfo.setUntil(d, inAppointment.banner());
						break;
				}
			}
			inAppointment.setDescription($F('appointment_dialog_notes'));
			if (inOKCallback) inOKCallback();
		}
		dialogManager().show(this.mAppointmentDialog, cancelCallback.bind(this), okCallback.bind(this));
		// Workaround for IE7: Appointment dialog takes 5-6 seconds to open on Internet Explorer
		var elems = $('appointment_attendee_list').select('li.appointment_attendee');
		for (var i = 0; i < elems.length; i++) { elems[i].remove(); }
		var attendees = this.mShownAppointment.attendees();
		for (var j = 0; j < attendees.length; j++) { this.addAttendee(attendees[j]); }
		// notes field
		$('appointment_dialog_notes').value = inAppointment.description() || '';
	},
	// These methods get and set the dialog's date values from the fields.
	// Not updating the appointment object, because I don't want the appointment moving around while the dialog is open.
	getStartDateFromFields: function() {
		// get the start date
		var startDate = new Date(this.mDialogStartDatePicker.mSelectedDate.getTime());
		var startTime = this.mDialogStartTimePicker.getValue();
		startDate.setHours(startTime.getHours());
		startDate.setMinutes(startTime.getMinutes());
		startDate.setSeconds(0);
		return startDate;
	},
	setStartDateOnFields: function(inDate) {
		this.mDialogStartDatePicker.setSelectedDate(inDate);
		this.mDialogStartTimePicker.setValue(inDate);
	},
	getEndDateFromFields: function() {
		var endDate = new Date(this.mDialogEndDatePicker.mSelectedDate.getTime());
		// 6929270
		if ($('appointment_dialog_allday_checkbox').checked) endDate.setDate(endDate.getDate() + 1);
		var endTime = this.mDialogEndTimePicker.getValue();
		endDate.setHours(endTime.getHours());
		endDate.setMinutes(endTime.getMinutes());
		endDate.setSeconds(0);
		return endDate;
	},
	setEndDateOnFields: function(inDate) {
		// 6929270
		// 13725132 - we need to account for all-day events that may be specified with
		// zero length - i.e. DTSTART == DTEND. In that case we do not want to subtract 1 day
		// DTEND as it would appear to be before DTSTART. This means if the user clicks OK to the
		// event they will end up with DTEND + 1 - i.e. it will be a 1 day length event. There is no
		// way for the user to edit and create a zero duration all-day event - but there is really no
		// valid use case for that anyway.
		var endDate = new Date(inDate.getTime());
		var startDate = this.getStartDateFromFields();
		if ($('appointment_dialog_allday_checkbox').checked) {
			if (endDate > startDate)
				endDate.setDate(endDate.getDate() - 1);
		}
		this.mDialogEndDatePicker.setSelectedDate(endDate);
		this.mDialogEndTimePicker.setValue(endDate);
	},
	setDesiredCalendarFromFields: function(inAppointment, inOptPopupElm) {
		var calendarPopup = inOptPopupElm ? $(inOptPopupElm) : $('appointment_dialog_calendar_select');
		if ($F(calendarPopup) != inAppointment.mParentCalendarFile.mParentCalendar.mLastPathComponent) {
			inAppointment.mDesiredCalendar = calendarViewController().mRemoteCalendarCollection.calendarWithPath($F(calendarPopup));
		}
	},
	hideOrShowRecurrenceEnd: function() {
		Element.setStyle(this.mRecurrenceEndLabel, {height:$('appointment_dialog_recurrence_select').selectedIndex % 6 == 0 ? '0' : 'auto'});
		Element.setStyle(this.mRecurrenceEndContainer, {height:$('appointment_dialog_recurrence_select').selectedIndex % 6 == 0 ? '0' : 'auto'});
	},
	updateCalendarsInPopup: function(inOptPopupElm) {
		var calendarPopup = inOptPopupElm ? $(inOptPopupElm) : $('appointment_dialog_calendar_select');
		removeAllChildNodes(calendarPopup);
		calendarViewController().mRemoteCalendarCollection.mCalendars.each(function(calObj) {
			calendarPopup.appendChild(Builder.node('option', {
				id: 'appointment_dialog_calendar_'+calObj.mLastPathComponent,
				value: calObj.mLastPathComponent
			}, (calObj.mDisplayName == 'calendar' ? '_Calendar.Calendar'.loc() : calObj.mDisplayName)));
		});
	},
	updateAttendeeTimeFromFields: function(inOptDate) {
		// give the bar a reasonable starting position
		var firstHourElement = $('appointment_attendee_list').down('li.appointment_attendee_availability_cell');
		var schedElm = $('appointment_attendee_schedtime');
		schedElm.clonePosition(firstHourElement);
		schedElm.style.width = (parseInt(schedElm.style.width)-1)+'px';
		schedElm.style.height = ((parseInt(schedElm.style.height) * ($('appointment_attendee_list').childNodes.length - 1)) - 2)+'px';
		// get the start and end dates selected in the fields
		var selectedStartDate = inOptDate || this.getStartDateFromFields();
		var dur = getDurationUsingEndDate(this.getStartDateFromFields(), this.getEndDateFromFields());
		var selectedEndDate = getEndDateUsingDuration(selectedStartDate, dur);
		// find the beginning and end of the shown range
		var shownRange = $A([new Date(selectedStartDate.getTime()), new Date(selectedStartDate.getTime())]);
		shownRange[0].setHours(this.mAvailabilityRange[0]);
		shownRange[1].setHours(this.mAvailabilityRange[1]);
		// shrink the selection if it's before the shown start date
		if (selectedStartDate < shownRange[0]) {
			selectedEndDate.setTime(selectedEndDate.getTime() - (shownRange[0].getTime() - selectedStartDate.getTime()));
			selectedStartDate.setTime(shownRange[0].getTime());
		}
		// also shrink the selection if it's after the shown end date
		if (selectedStartDate > shownRange[1]) {
			selectedEndDate.setTime(shownRange[1].getTime());
		}
		// set the position of the element
		var hourWidth = schedElm.offsetWidth-1; // account for overlap
		// start with the cloned position
		var pos = parseInt(schedElm.style.left);
		// add the hours
		pos += (selectedStartDate.getHours() - shownRange[0].getHours()) * hourWidth;
		// and the minutes
		pos += (selectedStartDate.getMinutes() / 60) * hourWidth;
		schedElm.style.left = pos+'px';
		// set the width of the element
		var selectedDuration = getDurationUsingEndDate(selectedStartDate, selectedEndDate);
		schedElm.style.width = ((getHoursForDuration(selectedDuration) * hourWidth) - 2)+'px';
	},
	addAttendee: function(inAttendee, inOptSaveToDataStore) {
		// 6929993
		var uid = normalizeUID(inAttendee.uid);
		if (!this.mInvitesAllowed) return false;
		if (inOptSaveToDataStore) this.mShownAppointment.addAttendee(inAttendee);
		if ($('appointment_attendee_uid_'+uid)) return false;
		// get the display name of the attendee
		var attendeeDisplayName = inAttendee.displayname;
		// try and populate orgnizer displayname, which seems to be stripped by the server
		if (!attendeeDisplayName && !$('appointment_attendee_list').down('li.appointment_attendee')) {
			if (this.mShownAppointment.organizerIsPrincipal() && principalService().mUserPrincipalInfo) {
				attendeeDisplayName = principalService().mUserPrincipalInfo.displayname;
			}
			else {
				attendeeDisplayName = '_Calendar.Dialogs.Appointment.Attendees.Organizer'.loc();
			}
		}
		var li = Builder.node('li', {id:'appointment_attendee_uid_'+uid, className:'appointment_attendee'}, [
			Builder.node('ul', {className:'appointment_attendee_availability'}, [
				Builder.node('li', {className:'appointment_attendee_name'}, attendeeDisplayName)
			])
		]);
		// add the status
		if (inAttendee.uid == this.mShownAppointment.organizer().uid || inAttendee.status == 'ACCEPTED') {
			li.down('li.appointment_attendee_name').addClassName('attendeestatus_accepted');
		}
		else if (inAttendee.status == 'TENTATIVE') {
			li.down('li.appointment_attendee_name').addClassName('attendeestatus_maybe');
		}
		else if (inAttendee.status == 'DECLINED') {
			li.down('li.appointment_attendee_name').addClassName('attendeestatus_declined');
		}
		else if (inAttendee.status == 'NEEDS-ACTION' || !inAttendee.status) {
			li.down('li.appointment_attendee_name').addClassName('attendeestatus_unknown');
		}
		// set the alternating row class (if applicable)
		if ($('appointment_attendee_list').childNodes.length % 2 == 0) {
			li.addClassName('alternate_row');
		}
		// add the hour cells
		for (var i = this.mAvailabilityRange[0]; i < this.mAvailabilityRange[1]; i++) {
			li.down('ul').appendChild(Builder.node('li', {
				className: 'appointment_attendee_availability_cell appointment_attendee_hour_'+i,
				style: 'width:'+this.mAvailabilityCellWidth+'px'
			}, "\u00A0"));
		}
		$('appointment_attendee_list').insertBefore(li, $('appointment_attendee_list').lastChild);
		// create a delete button
		inAttendee.deleteButton = new InlineDeleteButton(li.down('li.appointment_attendee_name'), function() {
			this.mShownAppointment.removeAttendeeWithUID(inAttendee.uid);
			li.remove();
			this.updateAttendeeTimeFromFields();
		}.bind(this), false);
	},
	// TODO: allow freebusy reports for just one user
	getFreeBusyReport: function() {
		var startDate = new Date(this.mDialogStartDatePicker.mSelectedDate.getTime());
		var endDate = new Date(startDate.getTime());
		startDate.setHours(this.mAvailabilityRange[0]);
		startDate.setMinutes(0);
		startDate.setSeconds(0);
		endDate.setHours(this.mAvailabilityRange[1]);
		endDate.setSeconds(0);
		var gotFreeBusyCallback = function(inResult) {
			// remove all of the old freebusy divs
			$$('#appointment_attendee_list li.appointment_freebusy_busy').invoke('remove');
			// calculate where midnight and absolute start positions
			var firstHourElement = $('appointment_attendee_list').down('li.appointment_attendee_availability_cell');
			var absoluteStartPos = firstHourElement.offsetLeft;
			var hourWidth = firstHourElement.next().offsetLeft - absoluteStartPos;
			var hourHeight = firstHourElement.offsetHeight;
			// iterate through the response information and add the blocks to the calendar
			inResult.each(function(response) {
				if (!response) return; // 6907080
				var elm = $('appointment_attendee_uid_'+normalizeUID(response.recipient));
				if (!elm) return; // who are you? get off my lawn.
				if (response.requestStatus == '2.0;Success') { // TODO: how do we visually represent error conditions in freebusy?
					var attendee_ul = elm.down('ul');
					// now iterate the blocks
					response.blocks.each(function(block) {
						var blockLeft = absoluteStartPos + (getHoursForDuration(getDurationUsingEndDate(startDate, block.startDate)) * hourWidth);
						var blockWidth = getHoursForDuration(block.duration) * hourWidth;
						var li = Builder.node('li', {
							className: 'appointment_freebusy_busy appointment_freebusy_busy_'+block.type,
							style: 'position:absolute;top:0;left:'+blockLeft+'px',
							title: getTimeRangeDisplayString(block.startDate, block.duration)
						}, "\u00A0");
						attendee_ul.appendChild(li);
						Element.setOffsetWidth(li, blockWidth);
					});
				}
			});
		}
		this.mShownAppointment.getFreeBusyReport(gotFreeBusyCallback.bind(this), startDate, endDate);
	},
	handleDatePickerShown: function(inMessage, inObject, inUserInfo) {
		// 6929125
		niftyDateHack(inMessage, inObject, inUserInfo);
		(inObject == this.mDialogStartDatePicker ? this.mDialogEndDatePicker : this.mDialogStartDatePicker).hide();
	},
	handleAllDayChanged: function() {
		var isChecked = $('appointment_dialog_allday_checkbox').checked;
		if (isChecked == $('appointment_dialog_dtstart_time').disabled) return false; // bail if the setting hasn't changed
		$('appointment_dialog_dtstart_time').disabled = isChecked;
		$('appointment_dialog_dtend_time').disabled = isChecked;
		// if we're checking the checkbox, change the time values to midnight
		var startDate = this.getStartDateFromFields();
		if (isChecked) {
			startDate.setHours(0);
			startDate.setMinutes(0);
			startDate.setSeconds(0);
			var endDate = new Date(startDate.getTime());
			this.setEndDateOnFields(this.getEndDateFromFields());
		}
		// otherwise pick sensible defaults and focus on the time field
		else {
			startDate.setHours(8);
			startDate.setMinutes(0);
			startDate.setSeconds(0);
			this.setStartDateOnFields(startDate);
			var endDate = new Date(startDate.getTime());
			endDate.setHours(9);
			this.setEndDateOnFields(endDate);
			$('appointment_dialog_dtstart_time').focus();
		}
		// add a helper class name to the appointment_dialog that we'll use to
		// hide/show the time picker when all day is checked/unchecked
		(isChecked == true) ? $('appointment_dialog').addClassName('allday') : $('appointment_dialog').removeClassName('allday');
	},
	handleStartTimeWillChange: function(inMessage, inObject, inUserInfo) {
		this.mStartDateBeforeChange = this.getStartDateFromFields();
	},
	handleStartTimeChanged: function(inMessage, inObject, inUserInfo) {
		if (!this.mStartDateBeforeChange) return;
		// find out how much it moved
		var delta = getDurationUsingEndDate(this.mStartDateBeforeChange, this.getStartDateFromFields());
		// move the end date accordingly
		this.setEndDateOnFields(getEndDateUsingDuration(this.getEndDateFromFields(), delta));
	},
	handleTabLinkClicked: function(inEvent) {
		inEvent.stop();
		var elm = inEvent.findElement('a');
		this.selectTab(this.mTabs.indexOf(elm.id), true);
		return false;
	},
	handleRecurrenceTypeChanged: function() {
		dialogManager().willResize();
		// TODO: handle custom recurrences
		this.hideOrShowRecurrenceEnd();
		// populate the end info (if applicable)
		var idx = 0;
		if (this.mShownAppointment.recurrenceInfo() && this.mShownAppointment.recurrenceInfo().count()) idx = 1;
		else if (this.mShownAppointment.recurrenceInfo() && this.mShownAppointment.recurrenceInfo().until()) idx = 2;
		$('appointment_dialog_recurrence_end_select').selectedIndex = idx;
		this.handleRecurrenceEndTypeChanged();
		dialogManager().didResize();
	},
	handleRecurrenceEndTypeChanged: function(inEvent) {
		var idx = $('appointment_dialog_recurrence_end_select').selectedIndex;
		$('appointment_dialog_recurrence_end_after_container').style.display = (idx == 1 ? '' : 'none');
		$('appointment_dialog_recurrence_end_ondate').style.display = (idx == 2 ? '' : 'none');
		var recurrenceInfo = this.mShownAppointment.recurrenceInfo();
		// show the count
		if (idx == 1) {
			$('appointment_dialog_recurrence_end_after').value = (recurrenceInfo && recurrenceInfo.count() ? recurrenceInfo.count() : '');
			if (inEvent) $('appointment_dialog_recurrence_end_after').focus();
		}
		// select the correct date
		if (idx == 2) {
			var dateToSelect = (recurrenceInfo ? recurrenceInfo.until() : null);
			if (!dateToSelect) {
				dateToSelect = this.mShownAppointment.startDate();
				dateToSelect.setDate(dateToSelect.getDate()+1);
			}
			this.mRecurrenceEndDatePicker.setSelectedDate(dateToSelect);
		}
	},
	handleMouseDownInAttendeeTime: function(inEvent) {
		Event.stop(inEvent);
		this.mDragStartPos = Event.pointerX(inEvent);
		this.mDragStartTime = this.getStartDateFromFields();
		this.mDragCurrentTime = this.mDragStartTime;
		var startTimeISO = dateObjToISO8601(this.mDragStartTime);
		// lower limit = midnight
		this.mDragLowerLimit = createDateObjFromISO8601(startTimeISO.replace(/T.+$/, 'T000000'));
		// upper limit = 11:45 PM
		this.mDragUpperLimit = createDateObjFromISO8601(startTimeISO.replace(/T.+$/, 'T234500'));
		observeEvents(this, d, {
			mousemove: 'handleAttendeeTimeRescheduleMove',
			mouseup: 'handleAttendeeTimeRescheduleEnd'
		});
	},
	handleAttendeeHeaderLinkClick: function(inEvent) {
		inEvent.stop();
		var delta = (Event.findElement(inEvent, 'a').id == 'appointment_dialog_attendee_prevdate' ? (-1) : 1);
		var dt = this.getStartDateFromFields();
		dt.setDate(dt.getDate() + delta);
		this.setStartDateOnFields(dt);
		this.getFreeBusyReport();
		return false;
	},
	handleAttendeeTimeRescheduleMove: function(inEvent) {
		Event.stop(inEvent);
		// find out how many horizontal pixels there are in an hour
		var hourWidth = $$('#appointment_attendee_list li.appointment_attendee_availability_cell')[0].offsetWidth-2; // account for overlap
		// turn the drag delta into a time duration
		this.mDragCurrentTime = new Date(this.mDragStartTime.getTime());
		var movedHours = (Event.pointerX(inEvent) - this.mDragStartPos) / hourWidth;
		this.mDragCurrentTime = getEndDateUsingDuration(this.mDragCurrentTime, getDurationForHours(movedHours));
		// bail if we're about to move around to the past day
		if (this.mDragCurrentTime < this.mDragLowerLimit || this.mDragCurrentTime > this.mDragUpperLimit) return false;
		// round the time to the nearest 15 minutes
		this.mDragCurrentTime.setMinutes(Math.floor(this.mDragCurrentTime.getMinutes() / 15) * 15);
		this.mDragCurrentTime.setSeconds(0);
		// now set the fields and redraw
		this.updateAttendeeTimeFromFields(this.mDragCurrentTime);
	},
	handleAttendeeTimeRescheduleEnd: function(inEvent) {
		Event.stop(inEvent);
		stopObservingEvents(this, d, {
			mousemove: 'handleAttendeeTimeRescheduleMove',
			mouseup: 'handleAttendeeTimeRescheduleEnd'
		});
		var dur = getDurationUsingEndDate(this.getStartDateFromFields(), this.getEndDateFromFields());
		this.setStartDateOnFields(this.mDragCurrentTime);
		this.setEndDateOnFields(getEndDateUsingDuration(this.mDragCurrentTime, dur));
	},
	handleDeleteClick: function(inEvent) {
		dialogManager().hide();
		if (this.mDeleteCallback) this.mDeleteCallback();
		return false;
	}
}

var InvitationDialogManager = Class.createWithSharedInstance('invitationDialog');
InvitationDialogManager.prototype = {
	initialize: function() {
		this.mInviteDialog = dialogManager().drawDialog('invitation_dialog', [
			{label:'_Calendar.Dialogs.Invitation.Summary'.loc(), contents:'<div id="invitation_dialog_summary"></div>'},
			{label:'_Calendar.Dialogs.Invitation.Location'.loc(), contents:'<div id="invitation_dialog_location"></div>'},
			{label:'_Calendar.Dialogs.Invitation.Date'.loc(), contents:'<div id="invitation_dialog_date"></div>'},
			{label:'_Calendar.Dialogs.Invitation.Calendar'.loc(), contents:'<select id="invitation_dialog_calendar_select"></select>'},
			{label:'_Calendar.Dialogs.Invitation.Attendees'.loc(), contents:'<ul id="invitation_dialog_attendees"></ul>'},
			{label:'_Calendar.Dialogs.Invitation.Notes'.loc(), contents:'<div id="invitation_dialog_notes"></div>'},
			{label:'_Calendar.Dialogs.Invitation.MyStatus'.loc(), contents:'<select id="invitation_dialog_mystatus_select"></select>'}
			// TODO: add recurrence description
		], '_Dialogs.OK'.loc());
		// remember the notes row
		this.mNotesRow = $('invitation_dialog_notes').up('tr');
		// add the status select options
		$A(['ACCEPTED', 'TENTATIVE', 'DECLINED']).each(function(partstat) {
			$('invitation_dialog_mystatus_select').appendChild(Builder.node('option', {value:partstat}, ('_Calendar.Dialogs.Invitation.MyStatus.'+partstat).loc()));
		});
		// add the delete button
		var td = $('invitation_dialog_ok').up('td');
		td.colSpan = '1';
		td.parentNode.insertBefore(Builder.node('td', [
			Builder.node('div', {className:'submit'}, [
				Builder.node('input', {type:'button', id:'invitation_dialog_delete', value:'_Calendar.Dialogs.Appointment.Delete'.loc()})
			])
		]), td);
		$('invitation_dialog_delete').onclick = appointmentDialog().handleDeleteClick;
	},
	addNotes: function(inNotes) {
		if ($$('#invitation_dialog #invitation_dialog_notes').length == 0) {
			$('invitation_dialog_mystatus_select').up('tr').insert({before:this.mNotesRow});
		}
		replaceElementContents('invitation_dialog_notes', inNotes);
		$('invitation_dialog_notes').innerHTML = $('invitation_dialog_notes').innerHTML.replace(/[\r\n]/g, "\u00A0<br>");
	},
	removeNotes: function() {
		if ($$('#invitation_dialog #invitation_dialog_notes').length > 0) {
			this.mNotesRow.remove();
		}
	},
	show: function(inAppointment, inCancelCallback, inOKCallback, inOptElement) {
		// populate the calendar popup
		appointmentDialog().updateCalendarsInPopup('invitation_dialog_calendar_select');
		// header (including organizer)
		var headerStr = String.format('_Calendar.Dialogs.Invitation.Title'.loc(), {organizer:inAppointment.organizer().displayname || String.lastPathComponent(inAppointment.organizer().uid)});
		replaceElementContents(this.mInviteDialog.down('thead').down('td'), headerStr);
		// summary, location, and date
		replaceElementContents('invitation_dialog_summary', inAppointment.summary() || '');
		//replaceElementContents('invitation_dialog_organizer', inAppointment.organizer().displayname || '');
		replaceElementContents('invitation_dialog_location', inAppointment.location() || '');
		var attendeesList = inAppointment.attendees();
		var isOrganizer = true;
		removeAllChildNodes('invitation_dialog_attendees');
		Element.removeClassName('invitation_dialog_attendees', 'massive_attendee_list');
		var attendeeIdx = 0;
		var attendeeCount = attendeesList.length;
		while (attendeesList.length > 0) {
			var currentAttendee = attendeesList.shift();
			if (currentAttendee.cutype == 'ROOM') continue;
			var li = Builder.node('li', (isOrganizer ? String.format('_Calendar.Dialogs.Invitation.Organizer'.loc(), {displayname:currentAttendee.displayname}) : currentAttendee.displayname));
			if (++attendeeIdx > 5) {
				li.hide();
			}
			$('invitation_dialog_attendees').appendChild(li);
			// add the status
			if (currentAttendee.uid == inAppointment.organizer().uid || currentAttendee.status == 'ACCEPTED') {
				li.addClassName('attendeestatus_accepted');
			}
			else if (currentAttendee.status == 'TENTATIVE') {
				li.addClassName('attendeestatus_maybe');
			}
			else if (currentAttendee.status == 'DECLINED') {
				li.addClassName('attendeestatus_declined');
			}
			else if (currentAttendee.status == 'NEEDS-ACTION' || !currentAttendee.status) {
				li.addClassName('attendeestatus_unknown');
			}
			isOrganizer = false;
		}
		if (attendeeCount > 5) {
			var showAllLink = Builder.node('a', {href:'#'}, String.format('_Calendar.Dialogs.Invitation.SeeAllAttendees'.loc(), {count:attendeeCount}));
			$('invitation_dialog_attendees').appendChild(Builder.node('li', {className:'invitation_attendee_showall'}, [showAllLink]));
			var showAllCallback = function(inEvent) {
				inEvent.stop();
				dialogManager().willResize();
				$('invitation_dialog_attendees').addClassName('massive_attendee_list');
				$$('#invitation_dialog_attendees li').invoke('show');
				showAllLink.up('li').remove();
				dialogManager().didResize();
				return false;
			}
			showAllLink.observe('click', showAllCallback.bind(this));
		}
		//replaceElementContents('invitation_dialog_attendees', attendeesList.pluck('displayname').join(', '));
		replaceElementContents('invitation_dialog_date', getTimeRangeDisplayString(inAppointment.startDate(), inAppointment.duration()));
		// notes
		var notes = inAppointment.description();
		if (notes && notes.match(/\S/)) {
			this.addNotes(notes);
		}
		else {
			this.removeNotes();
		}
		// calendar
		Form.setSelectValue('invitation_dialog_calendar_select', inAppointment.mParentCalendarFile.mParentCalendar.mLastPathComponent);
		// my status
		Form.setSelectValue('invitation_dialog_mystatus_select', inAppointment.participantStatus());
		// OK button callback
		var okCallback = function() {
			appointmentDialog().setDesiredCalendarFromFields(inAppointment, 'invitation_dialog_calendar_select');
			inAppointment.mPartStatChange = $F('invitation_dialog_mystatus_select');
			if (inOKCallback) inOKCallback();
		}
		// finally, show the dialog
		dialogManager().show(this.mInviteDialog, inCancelCallback, okCallback.bind(this));
	}
}

var SettingsDialogManager = Class.createWithSharedInstance('settingsDialog');
SettingsDialogManager.prototype = {
	initialize: function() {
		bindEventListeners(this, ['handleAvailabilityTypeChanged']);
		this.mDeleteButtons = $A([]);
		dialogManager().drawDialog('calendar_settings_dialog', [
			{label:'_Calendar.Dialogs.Settings.Timezone'.loc(), contents:'<select id="calendar_settings_dialog_tzid" name="calendar_settings_dialog_tzid"></select>'},
			{label:'_Calendar.Dialogs.Settings.Availability'.loc(), contents:'<select id="calendar_settings_dialog_availability" name="calendar_settings_dialog_availability"></select><div id="calendar_settings_dialog_availability_options"></div>'},
			{label:'_Calendar.Dialogs.Settings.StartWeekOn'.loc(), contents:'<select id="calendar_settings_dialog_startweekon" name="calendar_settings_dialog_startweekon"></select>'},
			{label:'_Calendar.Dialogs.Settings.Delegates'.loc(), contents:'<input id="calendar_settings_dialog_new_delegate" name="calendar_settings_dialog_new_delegate"><div id="calendar_settings_dialog_delegates"></div>'}
		], '_Dialogs.OK'.loc(), null, '_Calendar.Dialogs.Settings.Title'.loc());
		// append a temporary option to show current timezone -- this will be refreshed when we get the timezone list
		var selectedTimezone = timezoneService().selectedTimezone();
		$('calendar_settings_dialog_tzid').appendChild(Builder.node('option', {value:selectedTimezone}, selectedTimezone));
		// get the timezones after the dialog finishes animating, so that it doesn't redraw all hurky
		var dialogFocusCallback = function() {
			var gotTimezonesCallback = function(inTimezones) {
				var timezonePopup = $('calendar_settings_dialog_tzid');
				removeAllChildNodes(timezonePopup);
				var selectIndex = (-1);
				inTimezones.each(function(tzid, i) {
					timezonePopup.appendChild(Builder.node('option', {value:tzid}, tzid));
					if (tzid == selectedTimezone) selectIndex = i;
				});
				if (selectIndex >= 0) timezonePopup.options[selectIndex].selected = true;
			}
			timezoneService().getTimezoneList(gotTimezonesCallback);
		}
		globalNotificationCenter().subscribe('DIALOG_FOCUS', dialogFocusCallback, $('calendar_settings_dialog'));
		// add contents of availability popup
		['Weekdays', 'Custom'].each(function(lbl) {
			$('calendar_settings_dialog_availability').appendChild(Builder.node('option', {value:lbl.toLowerCase()}, ('_Calendar.Dialogs.Settings.Availability.'+lbl).loc()));
		});
		// disable the custom option and handle change events
		$('calendar_settings_dialog_availability').lastChild.disabled = true;
		$('calendar_settings_dialog_availability').observe('change', this.handleAvailabilityTypeChanged);
		// add contents of availability options
		var optionsDiv = $('calendar_settings_dialog_availability_options');
		optionsDiv.appendChild(Builder.node('input', {type:'text', id:'calendar_settings_dialog_availability_starttime'}));
		optionsDiv.appendChild(Builder.node('span'));
		optionsDiv.lastChild.appendChild(d.createTextNode('_Calendar.Dialogs.Settings.Availability.To'.loc()));
		optionsDiv.appendChild(Builder.node('input', {type:'text', id:'calendar_settings_dialog_availability_endtime'}));
		// set up the time fields
		this.mStartTimeField = new TimeTextField('calendar_settings_dialog_availability_starttime');
		this.mEndTimeField = new TimeTextField('calendar_settings_dialog_availability_endtime', {mRestrictAfterTimeField:this.mStartTimeField});
		this.mStartTimeField.mRestrictBeforeTimeField = this.mEndTimeField;
		// populate "start week on" popup
		var startWeekOnElm = $('calendar_settings_dialog_startweekon');
		'_Dates.LongWeekdays'.loc().split(',').each(function(wkdy, i) {
			startWeekOnElm.appendChild(Builder.node('option', {value:'wkdy_'+i}, wkdy));
		});
		// only show delegate field if this isn't a project calendar
		if (principalService().isIndividual()) {
			// set up the delegate search field
			this.mDelegateSearchField = new CalendarPrincipalSearchField('calendar_settings_dialog_new_delegate', {
				mStartedItemSearchCallback: function() {
					// do nothing for now
				},
				mClickedItemCallback: function(inUID, inURL) {
					if (inURL) {
						this.addDelegate(this.mDelegateSearchField.mChosenDataSource);
						$('calendar_settings_dialog_new_delegate').value = '';
					}
				}.bind(this)
			});
			// hint the text field
			$('calendar_settings_dialog_new_delegate').placeholder = '_Calendar.Dialogs.Settings.Delegates.Hint'.loc();
		}
		else {
			$('calendar_settings_dialog_new_delegate').up('tr').style.display = 'none';
			$('calendar_settings_dialog_availability').up('tr').style.display = 'none';
		}
	},
	addDelegate: function(inDelegateInfo, inDelegateType) {
		var delegateElm = Builder.node('div', {id:'delegate_'+inDelegateInfo.href}, [
			Builder.node('span', inDelegateInfo.displayname),
			Builder.node('select', {id:'delegate_acl_'+inDelegateInfo.href}, [
				Builder.node('option', {value:'readonly'}, '_Calendar.Dialogs.Settings.Delegates.ReadOnly'.loc()),
				Builder.node('option', {value:'readwrite'}, '_Calendar.Dialogs.Settings.Delegates.ReadWrite'.loc())
			])
		]);
		$('calendar_settings_dialog_delegates').appendChild(delegateElm);
		if (inDelegateType == 1) $('delegate_acl_'+inDelegateInfo.href).options[1].selected = true;
		this.mDeleteButtons.push(new InlineDeleteButton(delegateElm, this.handleDeleteButtonClick.bind(this), false));
	},
	handleDeleteButtonClick: function(inDelegateElm) {
		Element.remove(inDelegateElm);
	},
	show: function() {
		// choose the correct option in the availability type menu
		var availability = calendarViewController().mRemoteCalendarCollection.mAvailability;
		Form.setSelectValue('calendar_settings_dialog_availability', (availability ? 'weekdays' : 'custom'));
		if (availability) {
			this.mStartTimeField.setValue(availability.startDate());
			this.mEndTimeField.setValue(availability.endDate());
		}
		else {
			var availStart = new Date();
			availStart.setHours(8);
			availStart.setMinutes(0);
			availStart.setSeconds(0);
			this.mStartTimeField.setValue(availStart);
			var availEnd = new Date();
			availEnd.setHours(18);
			availEnd.setMinutes(0);
			availEnd.setSeconds(0);
			this.mEndTimeField.setValue(availEnd);
		}
		this.handleAvailabilityTypeChanged();
		// set the start weekday
		$('calendar_settings_dialog_startweekon').selectedIndex = principalService().startWeekday();
		dialogManager().hide();
		dialogManager().show('calendar_settings_dialog', null, this.handleOKClick.bind(this));
		// populate the delegates
		$('calendar_settings_dialog_delegates').innerHTML = '';
		var principalURL = calendarViewController().mLoggedInPrincipal;
		proxyService().readOnlyProxies(function(inHrefs){this.handleProxyResponse(inHrefs, 0)}.bind(this), principalURL);
	},
	handleProxyResponse: function(inHrefs, inProxyType) {
		var gotPrincipalInfo = function(inProxyInfo) {
			this.addDelegate(inProxyInfo, inProxyType);
		}
		if (inProxyType < 1) {
			var principalURL = calendarViewController().mLoggedInPrincipal;
			proxyService().readWriteProxies(function(inHrefs){this.handleProxyResponse(inHrefs, 1)}.bind(this), principalURL);
		}
		inHrefs.each(function(href) {
			var principal = new RemotePrincipalService();
			principal.setUserPrincipal(href);
			principal.getPrincipalInfo(gotPrincipalInfo.bind(this));
		}.bind(this));
	},
	handleAvailabilityTypeChanged: function(inEvent) {
		if (!$('calendar_settings_dialog_availability_options')) return false;
		this.mStartTimeField.mDirty = true;
		this.mEndTimeField.mDirty = true;
		$('calendar_settings_dialog_availability_options').style.display = ($F('calendar_settings_dialog_availability') == 'weekdays' ? '' : 'none');
	},
	handleOKClick: function() {
		dialogManager().showProgressMessage('_Settings.Save.Progress.Message'.loc(), false, null, true);
		var gotTimezonesCallback = function() {
			// get the new offsets and redraw the calendar
			var gotOffsetsCallback = function() {
				var finishSavingSettings = function() {
					var weekday = $('calendar_settings_dialog_startweekon').selectedIndex;
					if (weekday != principalService().startWeekday()) principalService().setStartWeekday(weekday);
					dialogManager().hideProgressMessage();
					notifier().printMessage('calendar_settings_dialog_saved');
					calendarViewController().getAppointmentsFromServer(true);
				}
				// we're done here if this is a wiki calendar
				if (!principalService().isIndividual()) {
					finishSavingSettings.bind(this)();
					return;
				}
				// save the proxy settings
				var readWriteProxySaveCallback = function() {
					// set the availability
					if ($F('calendar_settings_dialog_availability') == 'weekdays' && (this.mStartTimeField.mDirty || this.mEndTimeField.mDirty)) {
						calendarViewController().mRemoteCalendarCollection.setWeekdayAvailability(this.mStartTimeField.getValue(), this.mEndTimeField.getValue(), finishSavingSettings.bind(this));
					}
					else {
						finishSavingSettings.bind(this)();
					}
				}
				var principalURL = calendarViewController().mLoggedInPrincipal;
				var readOnlyProxies = $A([]);
				var readWriteProxies = $A([]);
				$$('#calendar_settings_dialog_delegates div').each(function(elm) {
					if (elm.down('select').selectedIndex == 0) {
						readOnlyProxies.push(elm.id.replace(/^delegate_/, ''));
					}
					else {
						readWriteProxies.push(elm.id.replace(/^delegate_/, ''));
					}
				});
				var readOnlyProxySaveCallback = function() {
					proxyService().setReadWriteProxies(readWriteProxySaveCallback.bind(this), principalURL, readWriteProxies);
				}
				proxyService().setReadOnlyProxies(readOnlyProxySaveCallback.bind(this), principalURL, readOnlyProxies);
			}
			var range = calendarViewController().dateRangeToFetch();
			timezoneService().fetchOffsetsForDateRange(gotOffsetsCallback.bind(this), range[0], range[1], $F('calendar_settings_dialog_tzid'));
		}
		// set the timezone
		timezoneService().setSelectedTimezone($F('calendar_settings_dialog_tzid'), gotTimezonesCallback.bind(this));
	}
}

var CalendarPrincipalSearchField = Class.create(SearchFieldBase, {
	mFindResourceTypes: ['users', 'resources'],
	mSortKey: "displayname",
	getDisplayString: function(inRow) {
		return inRow.displayname;
	},
	constructQuery: function(inSearchString) {
		if (this.mQueryStartCallback) this.mQueryingCallback();
		return principalService().getMatchingUsers(this.gotSearchResult.bind(this), inSearchString, this.mFindResourceTypes);
	}
});

var CalendarLocationSearchField = Class.create(CalendarPrincipalSearchField, {
	mFindResourceTypes: ['locations']
});

// IE7 doesn't work well with floats and auto margins, so this method calculates the total width of the toolbar.
// Used in a CSS expression.
function ie7ToolbarWorkaround() {
	return $$('#calendar_grid_toolbar ul.calendar_nav_view_picker li').inject(0, function(total, elm) {
		return total + elm.offsetWidth;
	});
}
function ie7DialogToolbarWorkaround() {
	return $$('#calendar_grid_toolbar ul.calendar_nav_view_picker li').inject(0, function(total, elm) {
		return total + elm.offsetWidth;
	});
}

// controller class for calendar week view
var CalendarViewController = Class.createWithSharedInstance('calendarViewController');
CalendarViewController.prototype = {
	mBufferDays: 32,
	mResizeHandleHeight: 2,
	mSpacerWidth: 2,
	mSnapHours: 0.5, // snap to 1/2 hour increments
	mRefreshTimeout: 300000, // every 5 minutes normally (initialize method sets to 30 seconds in debug mode)
	mCleanupTimeout: 2000, // clean up old divs after 2 seconds to allow for animations
	mDefaultHours: 0.5,
	mMinimumHours: 0.5,
	mMonthGridSize: [50, 50], // initial value is meaningless; will get populated the first time month view is displayed
	mBannerHeight: 15, // initial value is meaningless; will get populated when calendar is drawn
	mMonthBannerHeight: 15, // initial value is meaningless; will get populated when calendar is drawn
	mWeekEventElementOffsets: [0, -1, -2, -2], // offsets because of border and margin differences
	mSecondsInDay: 86400000,
	mMinimumHourHeight: 22,
	mMinimumDisplayHeight: 14,
	initialize: function(/*[options]*/) {
		if (!$('module_calendars')) return invalidate;

		// Need this initialized here
		eventRecurrenceDialogManager();

		bindEventListeners(this, [
			'handleMouseDownInCalendar', 'handleViewToolbarClick', 'handleMonthMoreButtonClick', 'handleTodayButtonClick', 'handleMakeCalendarClick',
			'handleMouseDownInWeekTimedAppointment', 'handleWeekTimedAppointmentRescheduleMove', 'handleWeekTimedAppointmentRescheduleEnd',
			'handleMouseDownInWeekTimedAppointmentSlot', 'handleWeekTimedAppointmentResizeMove', 'handleWeekTimedAppointmentResizeEnd',
			'handleMouseDownInBannerAppointment', 'handleBannerAppointmentRescheduleMove', 'handleBannerAppointmentRescheduleEnd',
			'handleMouseDownInBannerAppointmentSlot', 'handleBannerAppointmentResizeMove', 'handleBannerAppointmentResizeEnd',
			'handleSettingsClick', 'handleWindowResize'
		]);
		this.mParentElement = $('module_calendars').up();
		// shorter delays for tooltips
		tooltipManager().mShowTimeout = 2500;
		// draw the calendar
		this.drawCalendar();
		// block webcal for iOS
		if (Prototype.Browser.MobileSafari) {
	        var unsupportedOSError = {errorObj:{status: -1}};
	        this.handleCalendarError("", null, unsupportedOSError);
	        return;
	    }
	    // handle principal errors
		globalNotificationCenter().subscribe('ERROR_FROM_SERVER', this.handleCalendarError.bind(this));
		// show progress message
		dialogManager().showProgressMessage('_Calendar.Progress.GettingEvents'.loc(), false, null, true);
		// wrap the rest of the init method in a callback in case we need to get the username asynchronously
		var gotUsernameCallback = function() {
			this.mViewSprings.boing();
			// change the title link (invisible anyway)
			var titleLink = Builder.node('a', {href:'#'}, ["\u00A0"]);
			titleLink.onclick = invalidate;
			// look for month view pref
			var calendarView = d.cookie.match(/calendarView=([^;]+)/);
			if (calendarView && (calendarView[1] == 'month')) {
				this.mMonthMode = true;
			}
			// hook up the timezone selector link
			Event.observe('calendar_nav_timezone', 'click', this.handleSettingsClick);
			// hook up the Today link
			Event.observe('calendar_today_link', 'click', this.handleTodayButtonClick);
			// set up the nifty date picker
			this.mDateNavigation = new NiftyDatePicker({mElement:'calendar_date_picker', mStartWeekday:principalService().startWeekday()});
			globalNotificationCenter().subscribe('SELECTED_DATE_CHANGED', this.handleDateChanged.bind(this), this.mDateNavigation);
			globalNotificationCenter().subscribe('START_WEEKDAY_CHANGED', this.handleStartWeekdayChanged.bind(this));
			// set the maximum height of the splitter
			$('calendar_grid_sidebar_splitter').hide();
			this.snapSidebarSplitter();
			// match the height of the two tabbed views
			$('calendar_sidebar_notifications').style.height = (Element.getHeight('calendar_date_picker')-1)+'px';
			// show date picker by default
			this.showDatePicker();
			// watch the sidebar tab buttons
			$('calendar_sidebar_mkcalendar_button').observe('click', this.handleMakeCalendarClick);
			$('calendar_sidebar_toolbar_tab_date').observe('click', function(inEvent) {
				inEvent.stop();
				this.showDatePicker();
			}.bind(this));
			$('calendar_sidebar_toolbar_tab_notifications').observe('click', function(inEvent) {
				Event.stop(inEvent);
				this.showNotifications();
			}.bind(this));
			// IE doesn't space out the week view properly the first time
			if (browser().isIE && !this.mMonthMode) {
				this.mWeekEventSpacer.space();
				this.mWeekHeaderSpacer.space();
				this.mWeekBannerSpacer.space();
			}
			// bind banner slot click events
			$$('.calendar_grid_week_banner_slot').each(function(elm) {
				Event.observe(elm, 'mousedown', this.handleMouseDownInBannerAppointmentSlot);
			}.bind(this));
			// scroll to middle
			var scroller = $('calendar_grid_week_events');
			scroller.scrollTop = (scroller.scrollHeight - Element.getHeight(scroller)) / 2;
			// set up timed observer to see if font size changed
			this.mFontSizeObserver = new SizeObserver($('calendar_grid_week_banner_columns').down('div.calendar_grid_hours_key').down('div'), 1, this.handleFontSizeChanged.bind(this));
			// draw the tooltips
			this.drawTooltips();
			// shorter tooltip delays in calendar
			tooltipManager().mShowTimeout = 2500;
			// get the calendar collection
			var gotCalendarCollection = function() {
				this.mLoggedInPrincipal = CC.meta('caldav_principal_path') || principalService().mUserPrincipalURL;
				var gotAccountsUserCanAccess = function(inAccountsToDelegate) {
					this.mViewSprings.boing();
					// add the calendars
					removeAllChildNodes('calendar_collection_list');
					this.mRemoteCalendarCollection.mCalendars.each(function(cal, i) {
						var elmID = 'calendar_collection_'+cal.mLastPathComponent;
						// select the first calendar by default for new events
						// add checkboxes for the calendars
						var localizedCalendarName = (cal.mDisplayName == 'calendar' ? '_Calendar.Calendar'.loc() : cal.mDisplayName);
						var collectionElm = Builder.node('li', {title:localizedCalendarName}, [
							Builder.node('div', {className:'colorcheckbox_container'}, [
								Builder.node('span', {className:'colorcheckbox_colorfill', style:'background-color:'+cal.mColor}),
								Builder.node('span', {className:'colorcheckbox_state colorcheckbox_checked'})
							]),
							Builder.node('span', {className:'calendar_collection_displayname'}, localizedCalendarName),
							Builder.node('a', {href:'#', className:'calendar_info_button'}, '_Calendar.Sidebar.Info'.loc())
						]);
						collectionElm.down('a').onclick = invalidate;
						$('calendar_collection_list').appendChild(collectionElm);
						// watch for clicks on the collection
						Event.observe(collectionElm, 'mousedown', this.handleMouseDownInCalendar);
					}.bind(this));
					// add link to view delegate calendars
					if (inAccountsToDelegate.length > 0) {
						if ($('calendar_title')) {
							$('calendar_title').down('span').appendChild(Builder.node('span', {className:'popuphandle'}, "\u25BC"));
							$('calendar_title').down('span').appendChild(Builder.node('select', [
								Builder.node('option', {value:'__'}, '_Calendar.Title.MyCalendar'.loc())
							]));
							$('calendar_title').down('select').selectedIndex = 0;
							inAccountsToDelegate.each(function(account) {
								var optionElm = Builder.node('option', {value:account.principalURL}, account.displayname);
								if (account.principalURL == principalService().mUserPrincipalURL) {
									optionElm.selected = true;
								}
								$('calendar_title').down('select').appendChild(optionElm);
							});
							$('calendar_title').down('select').observe('change', function(inEvent) {
								if ($F(inEvent.findElement('select')) == '__') {
									window.location.search = '';
								}
								else {
									window.location.search = 'principal='+encodeURIComponent($F(inEvent.findElement('select')));
								}
							}.bindAsEventListener(this));
						}
					}
					// select the first calendar
					this.selectCalendar(this.mRemoteCalendarCollection.mCalendars.length > 0 ? this.mRemoteCalendarCollection.mCalendars[0] : null);
					// tell the date control to publish a notification; that will indirectly call this.handleDateChanged()
					// look for dtstart in url query
					var dtstart = window.location.search.match(/dtstart=([^&]+)/);
					if (dtstart) {
						var dt = createDateObjFromISO8601(dtstart[1], false); // this time should always be local
							if (dt) {
							// look for an appointment UID in the url
							var apptUidMatch = (window.location.hash||'').match(/#uid=(.+)$/);
							if (apptUidMatch) {
								window.location.hash = '';
								this.mShowAppointmentUID = apptUidMatch[1];
							}
							this.mDateNavigation.setSelectedDate(dt);
						}
					}
					else {
						this.mDateNavigation.setSelectedDate();
					}
				}
				proxyService().accountsUserCanAccess(gotAccountsUserCanAccess.bind(this), this.mLoggedInPrincipal);
				// disable the + button if needed
				if (!this.mRemoteCalendarCollection.userCanWriteContent()) {
					$('calendar_sidebar_mkcalendar_button').addClassName('disabled');
				}
			}
			this.mRemoteCalendarCollection = new RemoteCalendarCollection(this.mCalCollectionHref);
			// Group calendars should not have a notifications icon
			this.mIndividual = principalService().isIndividual();
			if (!this.mIndividual) {
				$('calendar_sidebar_toolbar_tabs').addClassName('noInvitations');
			}
			globalNotificationCenter().subscribe('GOT_CALENDAR_COLLECTION', gotCalendarCollection.bind(this), this.mRemoteCalendarCollection);
			// IE doesn't handle window resize events properly
			if (!browser().isIE) observeEvents(this, window, {resize:'handleWindowResize'});
		}.bind(this);
		// instantiate a remote calendar object with a path like: /calendars/groups/groupname/
		// TODO: support MKCALENDAR
		this.mCalCollectionHref = '/calendars';
		var metaPrincipalLoc = CC.meta('caldav_principal_path');
		var urlProjectCalendarMeta = CC.meta('x-apple-owner-tinyID');
		var urlPrincipalMatch = window.location.search.match(/principal=([^&]+)/);
		var urlUserMatch = window.location.search.match(/username=([^&]+)/);
		if (urlPrincipalMatch) {
			principalService().setUserPrincipal(encodeURI(decodeURIComponent(urlPrincipalMatch[1])));
		}
		else if (metaPrincipalLoc) {
			principalService().setUserPrincipal(metaPrincipalLoc);
		}
		else if (urlUserMatch) {
			principalService().setUserPrincipal('/principals/users/'+encodeURIComponent(urlUserMatch[1]));
		}
		else if (urlProjectCalendarMeta) {
			principalService().setUserPrincipal('/principals/wikis/'+encodeURIComponent(urlProjectCalendarMeta))
		}
		if (!urlProjectCalendarMeta && CC.meta('x-apple-username') && CC.meta('x-apple-username') != 'unauthenticated')
		{
			principalService().setUserPrincipal('/principals/users/' + encodeURIComponent(CC.meta('x-apple-username')));
		}
		if (principalService().mUserPrincipalURL) {
			var callback = function(inPrincipalInfo) {
				if (inPrincipalInfo) {
					this.mCalCollectionHref = String.addSlash(inPrincipalInfo.url);
					var projectName = null;
					if (window.CC) {
				        projectName = CC.meta('x-apple-owner-longName') || CC.meta('x-apple-owner-shortName');
					}
					document.title = String.format('_Calendar.Title'.loc(), {principalDisplayName:projectName || inPrincipalInfo.displayname});
					if ($('calendar_title')) $('calendar_title').down('span').innerHTML = document.title.escapeHTML();
					var logoutURL = '/auth/logout?redirect='+window.location.href;
					var wikiURL = '/wiki';					
					insertAfter(Builder.node('p', {id:'calendar_logout_link'}, [
								Builder.node('a', {href:wikiURL}, '_Calendar.Wiki'.loc()), ' | ',
								Builder.node('a', {href:logoutURL}, '_Calendar.Logout'.loc())]), $('module_calendars'));
					gotUsernameCallback();
				}
				else {
					debugMessage('Princpial info not found for meta tag URL: ' + principalService().mUserPrincipalURL);
				}
			}
			principalService().getPrincipalInfo(callback.bind(this));
		}
		else if (window.uid && uid().mValue != '') {
			this.mCalCollectionHref += uid().mParentLocation;
		}
		else {
			this.mCalCollectionHref += '/users/' + encodeURIComponent(prompt('Username:')) + '/';
		}
		if (arguments.length > 0) Object.extend(this, arguments[0]);
		if (this.mCalCollectionHref != '/calendars') gotUsernameCallback();
	},
	handleCalendarError: function(inMessage, inObject, inUserInfo) {
		// callback to show an error dialog and maybe mask the calendar
		var showError = function(inErrorString) {
			dialogManager().hideProgressMessage();
			if ($('calendar_mask').visible()) {
				$('calendar_mask').style.visibility = 'visible';
				replaceElementContents($('calendar_mask').down('span'), inErrorString);
			}
			else {
				alert(inErrorString);
			}
		}.bind(this);
		// get the status either from the ivar or from the getStatus() method
		var status = inUserInfo.errorObj.status;
		if (inUserInfo.errorObj.getStatus && !status) status = inUserInfo.errorObj.getStatus();
		if ((status == 503 || status == 502) && inUserInfo.errorObj.getAllResponseHeaders && inUserInfo.errorObj.getAllResponseHeaders().match(/Server:\s*Apache/)) {
			showError('_Calendar.Errors.NoServer'.loc());
		}
		else if (status == 403) {
			showError('_Calendar.Errors.NoAccess'.loc());
		}
		else if (status == 404) {
			if (inObject == principalService()) {
				showError('_Calendar.Errors.PrincipalNotFound'.loc());
			}
			else {
				showError('_Calendar.Errors.FileNotFound'.loc());
			}
		}
		else if (status == 412) {
			showError('_Calendar.Errors.ModificationsInProgress'.loc());
		}
		else if (status == 0) {
			// FIXME: we're disabling this for now because it causes errors when
			// navigating away from a page with pending XMLHttpRequests
			//showError('_Calendar.Errors.ProbableHTTPSRedirect'.loc());
		}
		else if (status == -1) {
		    showError('_Calendar.Errors.UnsupportedBrowser'.loc());
		}
		else {
			showError('_Calendar.Errors.Unknown'.loc());
			reportError(inUserInfo.errorObj);
		}
	},
	resizeWeekViewCalendarGrid: function() {
		if (this.mDayMode || !$('calendar_grid_week_view').visible()) return;
		var totalHeight = parseInt($('calendar_grid_week_events').style.height);
		var cellHeight = Math.max(this.mMinimumHourHeight, (totalHeight/12)-4);
		if (!this.mCachedWeekCells || this.mCachedWeekCells.length < 1) {
			this.mCachedWeekCells = $$('#calendar_grid_week_events_columns .calendar_grid_week_event_slot');
		}
		if (this.mCachedWeekCells.length > 0) {
			if ($('calendar_grid_week_events_columns').style.lineHeight != cellHeight+'px') {
				$('calendar_grid_week_events_columns').down('div.calendar_grid_hours_key').style.paddingTop = (cellHeight/2)+'px';
				$('calendar_grid_week_events_columns').style.lineHeight = cellHeight+'px';
				if (this.mAppointments && this.mAppointments.length > 0) this.drawVisibleAppointments(false);
			}
			this.mWeekGridSize = [this.mCachedWeekCells[0].offsetWidth, this.mCachedWeekCells[0].offsetHeight];
		}
	},
	springsResizeCallback: function() {
		if ($('calendar_mask').visible()) {
			Position.clone('module_calendars', 'calendar_mask');
			$('calendar_mask').style.width = (parseInt($('calendar_mask').style.width)-2)+'px';
			$('calendar_mask').style.height = (parseInt($('calendar_mask').style.height)-2)+'px';
		}
		if (Element.visible('calendar_grid_week_view')) {
			var h = parseInt($('calendar_grid_springs').style.height) - $('calendar_grid_week_events').offsetTop;
			Element.setOffsetHeight('calendar_grid_week_events', h);
			this.resizeWeekViewCalendarGrid();
			this.updateAvailableTimeShading();
		}
		else {
			var h = parseInt($('calendar_grid_springs').style.height) - $('calendar_grid_month_content').offsetTop;
			Element.setOffsetHeight('calendar_grid_month_content', h);
			var testDivSlots = $('calendar_grid_month_weekday_columns').getElementsByClassName('calendar_grid_month_row_0');
			if (testDivSlots.length > 0) {
				this.mMonthGridSize = [testDivSlots[0].offsetWidth, testDivSlots[0].offsetHeight];
			}
		}
		this.mBannerHeight = $('banner_sizing_appointment').offsetHeight;
		this.mMonthBannerHeight = $('month_banner_sizing_appointment').offsetHeight;
		this.snapSidebarSplitter();
		if (this.mNotificationsSplitView) this.mNotificationsSplitView.mDuringCallback();
	},
	buildCalendarGrid: function() {
		if (Element.hasClassName(document.body, 'ical_server')) {
			$('module_calendars').parentNode.insertBefore(Builder.node('h1', {id:'calendar_title'}, Builder.node('span', document.title)), $('module_calendars')); // FIXME: localize
		}
		replaceElementContents('module_calendars', Builder.node('div', {id:'calendar_grid_springs'}, [ // these springs stick the calendar to the bottom of the window
			// sidebar (will hold calendar list and date picker)
			Builder.node('div', {id:'calendar_sidebar'}, [
				Builder.node('div', {id:'calendar_splitter_parent'}, [
					// calendars will get populated here in the GOT_CALENDAR_COLLECTION callback defined in the initialize() method above
					Builder.node('ul', {id:'calendar_collection_list'}),
					// date picker's HTML will be populated by the NiftyDatePicker instance
					Builder.node('div', {id:'calendar_grid_sidebar_splitter', className:'splitter'}, [
						Builder.node('div', {className:'splitter_handle'}, "\u00A0")
					]),
					Builder.node('div', {id:'calendar_grid_splitter_sibling'}, [
						Builder.node('div', {id:'calendar_date_picker'}),
						// notifications UI
						Builder.node('div', {id:'calendar_sidebar_notifications', style:'display:none'}, [
							Builder.node('h2', '_Calendar.Sidebar.Notifications'.loc()),
							Builder.node('ul', {id:'calendar_sidebar_notifications_content'})
						]),
						// toolbar for switching between date picker and notifications
						Builder.node('div', {id:'calendar_sidebar_toolbar'}, [
							Builder.node('div', {className:'calendartoolbar', id:'calendar_sidebar_toolbar_tabs'}, [
								Builder.node('ul', [
									Builder.node('li', {className:'first'}, [
										Builder.node('a', {href:'#', id:'calendar_sidebar_mkcalendar_button', title:'_Calendar.Sidebar.NewCalendarCollection'.loc()}, [
											Builder.node('span', '+')
										])
									]),
									Builder.node('li', {className:'middle'}, [
										Builder.node('a', {href:'#', id:'calendar_sidebar_toolbar_tab_date', title:'_Calendar.Sidebar.ShowHideMiniMonth'.loc()}, [
											Builder.node('span', '_Calendar.Sidebar.MiniMonth'.loc())
										])
									]),
									Builder.node('li', {className:'last'}, [
										Builder.node('a', {href:'#', id:'calendar_sidebar_toolbar_tab_notifications', title:'_Calendar.Sidebar.ShowHideInbox'.loc()}, [
											Builder.node('span', '_Calendar.Sidebar.Inbox'.loc())
										])
									])
								])
							])
						])
					])
				])
			]),
			// week view
			Builder.node('div', {id:'calendar_grid_week_view'}, [
				Builder.node('div', {id:'calendar_grid_week_header'}, [
					// header with weekdays on it
					Builder.node('ul', {id:'calendar_grid_week_header_columns', className:'calendar_grid_columns'}, [
						// year cell
						Builder.node('li', {className:'use_content_size'}, [
							Builder.node('div', {id:'calendar_grid_week_year'}, "0000")
						])
						// we'll fill in the rest of the cells later
					]),
					// these lists are float:left, so use a clearing div to force a carriage return
					Builder.node('div', {className:'clear'})
				]),
				// space for all-day (banner) appointments in week view
				Builder.node('div', {id:'calendar_grid_week_banners'}, [
					// banner header (for theming)
					Builder.node('div', {className:'start startcalendar_grid_week_banners'}, [Builder.node('span')]),
					// banner body
					Builder.node('div', {id:'calendar_grid_week_banners_content'}, [
						Builder.node('ul', {id:'calendar_grid_week_banner_columns', className:'calendar_grid_columns'}, [
							// key cell on left
							Builder.node('li', {className:'use_content_size'}, [
								Builder.node('div', {className:'calendar_grid_hours_key'}, [Builder.node('div')])
								// we'll fill in the rest of the cells later
							])
						])
					]),
					// banner footer (for theming)
					// TODO: should we use a span here?
					Builder.node('div', {className:'end endcalendar_grid_week_banners clear'})
				]),
				// splitter between the banner and timed event views
				Builder.node('div', {id:'calendar_grid_week_splitter', className:'splitter calendar_splitter'}, [
					Builder.node('div', {className:'splitter_handle'}, "\u00A0")
				]),
				// timed event view
				Builder.node('div', {id:'calendar_grid_week_events'}, [
					// timed event header (for theming)
					Builder.node('div', {className:'start startcalendar_grid_week_events'}, [Builder.node('span')]),
					// timed event body
					Builder.node('div', {id:'calendar_grid_week_events_content'}, [
						Builder.node('ul', {id:'calendar_grid_week_events_columns', className:'calendar_grid_columns'}, [
							// key cell on left
							Builder.node('li', {className:'use_content_size'}, [
								Builder.node('div', {className:'calendar_grid_hours_key'})
							])
							// we'll fill in the rest of the cells later
						]),
						// these lists are float:left, so use a clearing div to force a carriage return
						Builder.node('div', {className:'clear'})
					]),
					// blocks for availability
					Builder.node('div', {id:'calendar_grid_week_unavailable_morning', className:'calendar_grid_week_unavailable', style:'display:none'}),
					Builder.node('div', {id:'calendar_grid_week_unavailable_evening', className:'calendar_grid_week_unavailable', style:'display:none'}),
					// timed event footer (for theming)
					Builder.node('div', {className:'end endcalendar_grid_week_events clear'})
				])
			]),
			// month view
			Builder.node('div', {id:'calendar_grid_month_view', style:'display:none'}, [
				// month header (displays date range)
				Builder.node('div', {id:'calendar_grid_month_header'}, "\u00A0"),
				// month body (this is where the calendar grid will go)
				Builder.node('div', {id:'calendar_grid_month_content'}, [
					Builder.node('ul', {id:'calendar_grid_month_weekday_columns', className:'calendar_grid_columns'}),
					// these lists are float:left, so use a clearing div to force a carriage return
					Builder.node('div', {className:'clear'})
				])
			]),
			// a SizeObserver object will watch this div for font size changes
			Builder.node('div', {id:'banner_sizing_appointment', className:'calendar_appointment', style:'visibility:hidden'}, "\u00A0"),
			Builder.node('div', {id:'month_banner_sizing_appointment', className:'calendar_appointment calendar_month_banner', style:'visibility:hidden'}, "\u00A0")
		]));
		// add a toolbar with view and date pickers
		insertAtBeginning(Builder.node('div', {id:'calendar_grid_toolbar', className:'calendartoolbar'}, [
			Builder.node('div', {id:'calendar_nav_today'}, [
				Builder.node('a', {href:'#', id:'calendar_today_link'}, '_Calendar.Header.Today'.loc())
			]),
			Builder.node('ul', {className:'calendar_nav_view_picker'}, [
				Builder.node('li', {id:'calendar_nav_date_prev', className:'first'}, [
					Builder.node('a', {href:'#', id:'paginator_prev'}, [
						Builder.node('span', "<")
					])
				]),
				Builder.node('li', {id:'calendar_nav_view_day', className:'middle'}, [
					Builder.node('a', {href:'#', id:'paginator_day', title:'_Calendar.Header.Day.Tooltip'.loc()}, '_Calendar.Header.Day'.loc())
				]),
				Builder.node('li', {id:'calendar_nav_view_week', className:'middle'}, [
					Builder.node('a', {href:'#', id:'paginator_week', title:'_Calendar.Header.Week.Tooltip'.loc()}, '_Calendar.Header.Week'.loc())
				]),
				Builder.node('li', {id:'calendar_nav_view_month', className:'middle'}, [
					Builder.node('a', {href:'#', id:'paginator_month', title:'_Calendar.Header.Month.Tooltip'.loc()}, '_Calendar.Header.Month'.loc())
				]),
				Builder.node('li', {id:'calendar_nav_date_next', className:'last'}, [
					Builder.node('a', {href:'#', id:'paginator_next'}, [
						Builder.node('span', ">")
					])
				])
			]),
			Builder.node('div', {id:'calendar_nav_timezone'}, [
				Builder.node('a', {href:'#', id:'calendar_settings_link'}, '_Calendar.Header.Settings'.loc())
			]),
			// these lists are float:left, so use a clearing div to force a carriage return
			Builder.node('div', {className:'clear'})
		]), 'module_calendars');
		// these lists are float:left, so use a clearing div to force a carriage return
		insertAfter(Builder.node('div', {className:'clear'}), 'calendar_grid_toolbar');
		// add the header and banner grid columns to the week view
		var weekHeaderColumns = $('calendar_grid_week_header_columns');
		var weekBannerColumns = $('calendar_grid_week_banner_columns');
		for (var column = 0; column < 7; column++) {
			weekHeaderColumns.appendChild(Builder.node('li', {className:'calendar_grid_banner_column'}, [
				Builder.node('div', {className:'calendar_grid_column_contents calendar_grid_weekday_label'}, "\u00A0")
			]));
			weekBannerColumns.appendChild(Builder.node('li', {className:'calendar_grid_week_column_'+column}, [
				Builder.node('div', {className:'calendar_grid_column_contents calendar_grid_week_banner_slot'}, "\u00A0")
			]))
		}
		// compensate for scrollbar size
		weekHeaderColumns.appendChild(Builder.node('li', {style:'use_content_size'}));
		// if we're running standalone, and we don't have a slide origin, add one
		if (!$('slideorigin')) {
			insertAtBeginning(Builder.node('div', {id:'slideorigin', className:'slideorigin'}), 'module_calendars');
		}
		// add a mask for when the calendar is loading
		if (!$('calendar_mask')) {
			$('module_calendars').appendChild(Builder.node('div', {id:'calendar_mask', style:'visiblility:visible'}, [
				Builder.node('span') // for holding "calendar not available" text
			]));
		}
	},
	drawCalendar: function() {
		if (!$('calendar_grid_springs')) this.buildCalendarGrid();
		// the springs ensure document height
		this.mViewSprings = new ViewSprings('calendar_grid_springs', this.springsResizeCallback.bind(this));
		// set up the week view
		$A($('calendar_grid_week_events_columns').getElementsByClassName('calendar_grid_hours_key')).each(function(elm) {
			for (var hour = 1; hour < 24; hour++) {
				elm.appendChild(Builder.node('div', (hour==12?('_Dates.Noon'.loc()):getLocalizedHourKey(hour))));
			}
		});
		// ##5303260 Display of the german word for all-day renders under the calendar In week view
		if (browser().locale() != 'en') $$('#calendar_grid_week_events_content div.calendar_grid_hours_key')[0].appendChild(Builder.node('div', {style:'position:relative;top:-5em;left:0;height:1px;margin:0;padding:0 0 0 1em;visibility:hidden'}, '_Calendar.Appointments.AllDay'.loc()));
		for (var column = 0; column < 7; column++) {
			var li = Builder.node('li', {
				className: 'calendar_grid_week_events_column calendar_grid_week_column_' + column
			});
			for (var row = 0; row < 24; row++) {
				var slotDiv = Builder.node('div', {
					className:'calendar_grid_week_event_slot calendar_grid_week_row_' + row
				}, browser().isIE ? "\u00A0" : getLocalizedHourKey(row));
				// IE6 won't accept click events on this div if it only contains text; instead, fill with an invisible invalid image
				if (browser().isIE6()) replaceElementContents(slotDiv, Builder.node('img', {src:'about:blank', alt:''}));
				if (browser().isIE) slotDiv.style.textIndent = '0';
				li.appendChild(slotDiv);
				slotDiv.onmousedown = this.handleMouseDownInWeekTimedAppointmentSlot;
			}
			$('calendar_grid_week_events_columns').appendChild(li);
		}
		// add the current time indicator
		$('calendar_grid_week_events_content').appendChild(Builder.node('div', {id:'current_time_indicator', style:'display:none'}, [Builder.node('div')]));
		// add "all day" label
		replaceElementContents($$('#calendar_grid_week_banner_columns div.calendar_grid_hours_key div')[0], '_Calendar.Appointments.AllDay'.loc());
		// space out week view headers
		this.mWeekEventSpacer = new BlockSpacer('calendar_grid_week_events_columns', $('calendar_grid_week_events_content'));
		this.mWeekHeaderSpacer = new BlockSpacer('calendar_grid_week_header_columns', this.mWeekEventSpacer);
		this.mWeekBannerSpacer = new BlockSpacer('calendar_grid_week_banner_columns', this.mWeekEventSpacer);
		// set up the splitters
		this.mSplitView = new SplitView('calendar_grid_week_view', {
			mViews: [$('calendar_grid_week_banners'), $('calendar_grid_week_events')],
			mSplitter: 'calendar_grid_week_splitter',
			mMaintainTotalHeight: true,
			mMinimumHeight: 23
		});
		this.mNotificationsSplitView = new SplitView('calendar_splitter_parent', {
			mDuringCallback: function() {
				if ($('calendar_sidebar_notifications').visible()) {
					var height = $('calendar_splitter_parent').offsetHeight;
					height -= $('calendar_grid_sidebar_splitter').offsetHeight;
					height -= $('calendar_sidebar_toolbar').offsetHeight;
					height -= $('calendar_collection_list').offsetHeight;
					$('calendar_sidebar_notifications').style.height = (height-1) + 'px';
				}
			},
			mMinimumHeight: 112,
			mMaximumHeight: 500 // we'll figure out the real value later
		});
		// set up the month view
		for (var column = 0; column < 7; column++) {
			var labelElm = Builder.node('div', {className:'calendar_grid_month_weekday_header', id:'calendar_grid_month_weekday_header_'+column}, "foo");
			var columnElm = Builder.node('div', {className:'calendar_grid_column_contents calendar_grid_month_day_contents'});
			$('calendar_grid_month_weekday_columns').appendChild(Builder.node('li', {className:'calendar_grid_month_column_'+column}, [labelElm, columnElm]));
			for (var row = 0; row < 6; row++) {
				var labelElm = Builder.node('div', {className:'calendar_grid_month_daylabel'}, "\u00A0");
				var elm = Builder.node('div', {className:'calendar_grid_month_day calendar_grid_month_row_'+row}, [labelElm]);
				columnElm.appendChild(elm);
				Event.observe(elm, 'mousedown', this.handleMouseDownInBannerAppointmentSlot);
				Event.observe(labelElm, 'mousedown', this.handleMonthMoreButtonClick);
			}
		}
		this.mMonthViewSpacers = [new BlockSpacer('calendar_grid_month_weekday_columns', 'calendar_grid_month_content')];
		$A($('calendar_grid_month_weekday_columns').getElementsByClassName('calendar_grid_month_day_contents')).each(function(elm) {
			this.mMonthViewSpacers.push(new BlockSpacer(elm, (this.mMonthViewSpacers.length > 1 ? this.mMonthViewSpacers[1] : 'calendar_grid_month_content'), true));
		}.bind(this));
		// make the calendar visible
		$('module_calendars').style.visibility = '';
		// set up the view switcher
		$$('#calendar_grid_toolbar ul.calendar_nav_view_picker a').each(function(a) {
			Event.observe(a, 'click', this.handleViewToolbarClick);
		}.bind(this));
		// force size calculations
		this.springsResizeCallback();
		// IE needs a meaningless div above float elements
		if (browser().isIE) insertAtBeginning(Builder.node('div', {style:'height:0'}), 'calendar_grid_week_events_content');
	},
	drawTooltips: function() {
		d.body.appendChild(Builder.node('div', {id:'appointment_tooltip', className:'tooltip', style:'display:none'}, [
			Builder.node('h2', {id:'appointment_tooltip_summary'}),
			Builder.node('h4', {id:'appointment_tooltip_time_string'}),
			Builder.node('dl', [
				Builder.node('dt', '_Calendar.Tooltips.Location'.loc()),
				Builder.node('dd', {id:'appointment_tooltip_location'}),
				Builder.node('dt', '_Calendar.Tooltips.Description'.loc()),
				Builder.node('dd', {id:'appointment_tooltip_description'})
			])
		]));
	},
	selectCalendar: function(inCalendar) {
		this.mSelectedCalendar = inCalendar;
		if (!inCalendar) return;
		var calendarElements = $$('#calendar_collection_list li');
		// deselect all calendars
		calendarElements.invoke('removeClassName', 'calendar_selected_collection');
		// select the right calendar
		var idx = this.mRemoteCalendarCollection.mCalendars.indexOf(inCalendar);
		calendarElements[idx].addClassName('calendar_selected_collection');
	},
	dataSourceForElement: function(inElement) {
		var match = ($(inElement).id || '').match(/appointment_div_(.+)_\d*$/);
		return (match ? this.mAppointments[match[1]] : null);
	},
	handleMouseDownInCalendar: function(inEvent) {
		// figure out if we clicked a checkbox, or an info button...
		//6955821
		var isCheckbox = false, isInfoButton = false;
		var isCheckbox = Event.findElement(inEvent, 'div.colorcheckbox_container');
		if (!isCheckbox) isInfoButton = Event.findElement(inEvent, 'a.calendar_info_button');
		inEvent.stop();
		var elm = Event.findElement(inEvent, 'li');
		// find the offset of this element, use that to find out which calendar this is
		var cal = this.mRemoteCalendarCollection.mCalendars[elm.previousSiblings().length];
		// find out if we clicked a checkbox
		if (isCheckbox) {
			// switch the checkbox state in the data store
			cal.mEnabled = !cal.mEnabled;
			// find the state sub-element
			var stateElm = elm.down('span.colorcheckbox_state');
			// switch the class from checked to unchecked, or vice-versa
			stateElm.className = stateElm.className.replace(/(colorcheckbox_)(un)?(checked)/, '$1'+(cal.mEnabled?'':'un')+'$3');
			// tell the date control to publish a notification; that will indirectly call this.handleDateChanged()
			this.mDateNavigation.setSelectedDate();
		}
		else if (isInfoButton) {
			this.showCalendarInfoDialog(cal, elm.down('a.calendar_info_button'));
		}
		else {
			this.selectCalendar(cal);
			// when moving the mouse, drag the calendar
			var mouseMovedCallback = function(inEvent) {
				
			}.bindAsEventListener(this);
			// when mouse is released, snap back or offer to delete calendar
			var mouseUpCallback = function(inEvent) {
				alert('up');
			}.bindAsEventListener(this);
			// watch mouse moved events
			//observeEvents(this, d, {mousemove:mouseMovedCallback, mouseup:mouseUpCallback});
		}
	},
	handleFontSizeChanged: function(inElement, inHeight) {
		this.mViewSprings.boing();
		if (this.mMonthMode) {
			this.mMonthViewSpacers.invoke('space');
		}
		else {
			this.mWeekEventSpacer.space();
			this.mWeekHeaderSpacer.space();
			this.mWeekBannerSpacer.space();
		}
		this.drawVisibleAppointments(false);
	},
	handleViewToolbarClick: function(inEvent) {
		Event.stop(inEvent);
		var a = Event.findElement(inEvent, 'a');
		if (a.id == 'paginator_prev') {
			var dt = new Date(this.mDateNavigation.mSelectedDate.getTime());
			if (this.mMonthMode) {
				dt.setMonth(dt.getMonth() - 1);
			}
			else {
				dt.setDate(dt.getDate() - (this.mDayMode ? 1 : 7))
			}
			this.mDateNavigation.setSelectedDate(dt);
		}
		else if (a.id == 'paginator_day') {
			this.mMonthMode = false;
			this.mDayMode = true;
			this.mDateNavigation.setSelectedDate();
		}
		else if (a.id == 'paginator_week') {
			this.mMonthMode = false;
			this.mDayMode = false;
			this.mDateNavigation.setSelectedDate();
		}
		else if (a.id == 'paginator_month') {
			this.mMonthMode = true;
			this.mDayMode = false;
			this.mDateNavigation.setSelectedDate();
		}
		else if (a.id == 'paginator_next') {
			var dt = new Date(this.mDateNavigation.mSelectedDate.getTime());
			if (this.mMonthMode) {
				dt.setMonth(dt.getMonth() + 1);
			}
			else {
				dt.setDate(dt.getDate() + (this.mDayMode ? 1 : 7))
			}
			this.mDateNavigation.setSelectedDate(dt);
		}
		return false;
	},
	handleMonthMoreButtonClick: function(inEvent) {
		Event.stop(inEvent);
		var elm = Event.element(inEvent);
		dt = elm.up().id.match(/_(\d{8})/)[1];
		this.mMonthMode = false;
		this.mDateNavigation.setSelectedDate(createDateObjFromISO8601(dt, false));
		return false;
	},
	handleTodayButtonClick: function(inEvent) {
		Event.stop(inEvent);
		this.mDateNavigation.setSelectedDate(new Date());
		return false;
	},
	handleMakeCalendarClick: function(inEvent) {
		inEvent.stop();
		if (!this.mRemoteCalendarCollection.userCanWriteContent()) return false;
		if (!$('mkcalendar_dialog')) {
			dialogManager().drawDialog('mkcalendar_dialog', [
				{label:'_Calendar.Dialogs.NewCalendar.Name'.loc(), contents:'<input type="text" id="mkcalendar_dialog_calendarname"/>'},
				{label:'_Calendar.Dialogs.NewCalendar.Color'.loc(), contents:'<div id="mkcalendar_dialog_calendarcolor"></div>'} // TODO: do we still need a sub-div?
			], '_Calendar.Dialogs.NewCalendar.Create'.loc(), null, '_Calendar.Dialogs.NewCalendar.Title'.loc());
			// set up the color popup
			this.mMakeCalendarColorPicker = new CalendarColorPicker('mkcalendar_dialog_calendarcolor', 'mkcalendar_color_popup');
		}
		this.mMakeCalendarColorPicker.setValue(this.mRemoteCalendarCollection.nextAvailableCalendarColor());
		var okCallback = function() {
			//alert('should make calendar for ' + $F('mkcalendar_dialog_calendarname'));
			var madeCalendarCallback = function() {
				notifier().printMessage('mkcalendar_confirm');
			}
			var calendarName = $F('mkcalendar_dialog_calendarname');
			if (!calendarName.match(/\S/)) calendarName = '_Calendar.Dialogs.NewCalendar.Untitled'.loc();
			this.mRemoteCalendarCollection.makeCalendar(calendarName, madeCalendarCallback, this.mMakeCalendarColorPicker.getValue());
		}
		dialogManager().show('mkcalendar_dialog', null, okCallback.bind(this));
	},
	handleDateChanged: function(inMessage, inObject, inUserInfo) {
		if (Element.visible(this.mParentElement)) {
			this.updateCurrentTime();
			// make sure we have timezone information for the selected range
			var range = this.dateRangeToFetch();
			// get the first day of the selected week
			var today = new Date();
			// update the week view headers
			$('calendar_grid_week_year').update(inUserInfo.selectedDate.formatDate('Y'));
			var currentDate = new Date(inUserInfo.weekStartDate.getTime());
			$A($('calendar_grid_week_header_columns').getElementsByClassName('calendar_grid_weekday_label')).each(function(elm) {
				replaceElementContents(elm, currentDate.formatDate('_Calendar.DateFormats.DayHeader'.loc()));
				currentDate.setDate(currentDate.getDate()+1);
			});
			// update the banner slot IDs
			currentDate = new Date(inUserInfo.weekStartDate.getTime());
			$A($('calendar_grid_week_banner_columns').getElementsByClassName('calendar_grid_week_banner_slot')).each(function(elm) {
				elm.id = 'calendar_grid_week_banner_slot_'+parseInt(dateObjToISO8601(currentDate, false));
				currentDate.setDate(currentDate.getDate()+1);
			});
			// update the month headers
			replaceElementContents('calendar_grid_month_header', inUserInfo.weekStartDate.formatDate('_Dates.DateFormats.LongMonthAndYear'.loc()));
			currentDate = new Date(inUserInfo.weekStartDate.getTime());
			$$('#calendar_grid_month_weekday_columns div.calendar_grid_month_weekday_header').each(function(hdrElm) {
				replaceElementContents(hdrElm, currentDate.formatDate('l')); // no need for this format to be localized
				currentDate.setDate(currentDate.getDate()+1);
			});
			// update the month days
			currentDate = new Date(inUserInfo.weekStartDate.getTime());
			currentDate.setDate(1);
			currentDate.setDate(1 - (currentDate.getDay() - principalService().startWeekday()));
			for (var i = 0; i < 6; i++) {
				$$('#calendar_grid_month_content .calendar_grid_month_row_'+i+' div.calendar_grid_month_daylabel').each(function(elm) {
					replaceElementContents(elm, ''+currentDate.getDate());
					elm.parentNode.id = 'calendar_grid_month_day_'+parseInt(dateObjToISO8601(currentDate, false));
					if (currentDate.getMonth() == inUserInfo.weekStartDate.getMonth()) {
						elm.up().removeClassName('calendar_grid_othermonth_day');
					}
					else {
						elm.up().addClassName('calendar_grid_othermonth_day');
					}
					currentDate.setDate(currentDate.getDate()+1);
				});
			}
			// switch views if needed
			if (Element.visible(this.mMonthMode ? 'calendar_grid_week_view' : 'calendar_grid_month_view')) {
				$('calendar_grid_week_view', 'calendar_grid_month_view').invoke('toggle');
				// set cookie so we remember view
				this.setLastView(this.mMonthMode ? 'month' : 'week');
				// remove elements from old view
				$H(this.mAppointments).each(function(currentAppt) {
					currentAppt.value.displayNodes.each(function(currentNode) {
						if (currentNode.element) {
							Element.remove(currentNode.element);
							delete currentNode.element;
						}
					})
				});
				this.mViewSprings.boing();
				if (this.mMonthMode) {
					this.mMonthViewSpacers.invoke('space');
				}
				else {
					this.mWeekEventSpacer.space();
					this.mWeekHeaderSpacer.space();
					this.mWeekBannerSpacer.space();
					// scroll to middle
					var scroller = $('calendar_grid_week_events');
					scroller.scrollTop = (scroller.scrollHeight - Element.getHeight(scroller)) / 2;
				}
			}
			// select the correct tab
			this.setSelectedChild(this.mMonthMode ? 'paginator_month' : (this.mDayMode ? 'paginator_day' : 'paginator_week'));
			// force size calculations
			this.springsResizeCallback();
			// highlight "columns of interest" in week view
			if ($('calendar_grid_week_view').visible()) {
				// highlight the current date
				$$('#calendar_grid_week_header_columns .calendar_grid_today_weekday_label').invoke('removeClassName', 'calendar_grid_today_weekday_label');
				$$('#calendar_grid_week_view .calendar_grid_week_today_column').invoke('removeClassName', 'calendar_grid_week_today_column');
				if (compareDateWeeks(today, inUserInfo.selectedDate, this.mDateNavigation.mStartWeekday)) {
					var todayColNum = dateToColummNumber(today, this.mDateNavigation.mStartWeekday);
					$$('#calendar_grid_week_header_columns .calendar_grid_weekday_label')[todayColNum].addClassName('calendar_grid_today_weekday_label');
					$$('#calendar_grid_week_view .calendar_grid_week_column_'+todayColNum).invoke('addClassName', 'calendar_grid_week_today_column');
				}
				// highlight the selected date
				$$('#calendar_grid_week_header_columns .calendar_grid_selected_weekday_label').invoke('removeClassName', 'calendar_grid_selected_weekday_label');
				$$('#calendar_grid_week_view .calendar_grid_week_selected_column').invoke('removeClassName', 'calendar_grid_week_selected_column');
				var selectedDtstart = dateObjToISO8601(inUserInfo.selectedDate, false);
				var todayIsSelected = (parseInt(selectedDtstart) == parseInt(dateObjToISO8601(today, false)));
				
				var colNum = dateToColummNumber(inUserInfo.selectedDate, inUserInfo.weekStartDate.getDay());
				if ((!this.mDayMode) && (!todayIsSelected) && this.mAppointments && $('calendar_grid_week_view').visible()) {
					$$('#calendar_grid_week_header_columns .calendar_grid_weekday_label')[colNum].addClassName('calendar_grid_selected_weekday_label');
					$$('#calendar_grid_week_view .calendar_grid_week_column_'+colNum).invoke('addClassName', 'calendar_grid_week_selected_column');
				}
				// zoom in/out for day view
				$A([this.mWeekEventSpacer, this.mWeekHeaderSpacer, this.mWeekBannerSpacer]).invoke((this.mDayMode ? 'zoomInOnItem' : 'zoomOut'), colNum);
				this.resizeWeekViewCalendarGrid();
			}
			// highlight "days of interest" in the month view
			if ($('calendar_grid_month_view').visible()) {
				// highlight the current date
				$$('#calendar_grid_month_content div.current_day_cell').invoke('removeClassName', 'current_day_cell');
				var todayElm = $('calendar_grid_month_day_'+parseInt(dateObjToISO8601(new Date())));
				if (todayElm) todayElm.addClassName('current_day_cell');
				// highlight the selected date
				$$('#calendar_grid_month_content div.selected_day_cell').invoke('removeClassName', 'selected_day_cell');
				var selectedDateElm = $('calendar_grid_month_day_'+parseInt(dateObjToISO8601(inUserInfo.selectedDate)));
				if (selectedDateElm) selectedDateElm.addClassName('selected_day_cell');
			}
			// get appts from server
			this.drawVisibleAppointments(false);
			this.getAppointmentsFromServer();
		}
	},
	handleStartWeekdayChanged: function(inMessage, inObject, inUserInfo) {
		this.mDateNavigation.setStartWeekday(inUserInfo.startWeekday);
		this.mDateNavigation.setSelectedDate();
	},
	handleMouseDownInWeekTimedAppointment: function(inEvent) {
		Event.stop(inEvent);
		var pos = [Event.pointerX(inEvent), Event.pointerY(inEvent)];
		var elm = Event.element(inEvent).up('div.calendar_appointment').down('.calendar_appointment_content');
		var isResize = Event.element(inEvent).className && Event.element(inEvent).className.match(/_resizehandle/);
		var appt = this.dataSourceForElement(elm.parentNode);
		// bail if we can't write to the selected event
		if (!appt.userCanWriteContent()) return false;
		// draw a temporary div
		var apptDiv = Builder.node('div', {className:'temporary_calendar_appointment'}, appt.summary);
		$('calendar_grid_week_events_content').appendChild(apptDiv);
		['width', 'height', 'top', 'left'].each(function(s) {
			apptDiv.style[s] = elm.parentNode.style[s];
		});
		// make the current display nodes invisible
		appt.displayNodes.each(function(currentNode) {
			if (currentNode.element) currentNode.element.style.visibility = 'hidden';
		});
		var allowedRange = [Element.getTop('calendar_grid_week_events')];
		allowedRange.push(allowedRange[0] + Element.getHeight('calendar_grid_week_events'));
		// which column does the div live in?
		var weekday = (-1);
		var foundColumn = $A($('calendar_grid_week_events_columns').getElementsByClassName('calendar_grid_week_events_column')).detect(function(li, i) {
			if (Position.within(li, pos[0], pos[1])) {
				weekday = i;
				return true;
			}
			return false;
		});
		if (!foundColumn) return false; // WTF-case, bail
		this.mDragInfo = {
			appt: appt,
			element: apptDiv,
			startWeekday: weekday,
			startPointer: pos,
			startTop: parseInt(apptDiv.style.top),
			startHeight: parseInt(apptDiv.style.height),
			allowedRange: allowedRange
		}
		this.startDrag();
		// observe mouse events (only allow drag if the organizer is the current principal)
		var eventsToObserve = {mouseup:isResize ? 'handleWeekTimedAppointmentResizeEnd' : 'handleWeekTimedAppointmentRescheduleEnd'};
		if (appt.organizerIsPrincipal()) {
			eventsToObserve.mousemove = isResize ? 'handleWeekTimedAppointmentResizeMove' : 'handleWeekTimedAppointmentRescheduleMove';
		}
		observeEvents(this, d, eventsToObserve);
		return false;
	},
	handleWeekTimedAppointmentRescheduleMove: function(inEvent) {
		Event.stop(inEvent);
		var pos = [Event.pointerX(inEvent), Event.pointerY(inEvent)];
		// only start dragging when the user has passed a threshold of 1/2 hour or 1 day left/right (##6381232)
		if (!this.mDragInfo.threshold && Math.abs(pos[0]-this.mDragInfo.startPointer[0]) < this.mWeekGridSize[0] && Math.abs(pos[1]-this.mDragInfo.startPointer[1]) < (this.mWeekGridSize[1]/2)) {
			return false;
		}
		this.mDragInfo.threshold = true;
		// find out which weekday (if any) the mouse is over
		var weekday = (-1);
		var foundColumn = $$('#calendar_grid_week_events_columns .calendar_grid_week_events_column').detect(function(li, i) {
			if (Position.within(li, pos[0], pos[1])) {
				weekday = i;
				return true;
			}
			return false;
		});
		// make sure the pointer is inside the timed events div
		if (foundColumn && this.mDragInfo.allowedRange[0] <= pos[1] && pos[1] <= this.mDragInfo.allowedRange[1]) {
			// move to the correct column if needed
			if (weekday != this.mDragInfo.currentWeekday) {
				Position.clone(foundColumn.firstChild, this.mDragInfo.element, {setHeight:false, setTop:false});
				// incorporate week offset
				this.mDragInfo.element.style.width = (parseInt(this.mDragInfo.element.style.width) + this.mWeekEventElementOffsets[2]) + 'px';
				this.mDragInfo.currentWeekday = weekday;
			}
			// reposition element based on mouse pointer delta (and snap to grid)
			var snapHeight = this.mWeekGridSize[1] * this.mSnapHours;
			var delta = pos[1] - this.mDragInfo.startPointer[1];
			delta = Math.floor(delta / snapHeight) * snapHeight;
			var top = this.mDragInfo.startTop + delta;
			this.mDragInfo.element.style.top = top + 'px';
		}
	},
	handleWeekTimedAppointmentRescheduleEnd: function(inEvent) {
		stopObservingEvents(this, d, {
			mousemove: 'handleWeekTimedAppointmentRescheduleMove',
			mouseup: 'handleWeekTimedAppointmentRescheduleEnd'
		});
		// get the appointment date and time
		var dt = this.mDragInfo.appt.startDate();
		var dirty = false;
		// only update start date when the user has passed a threshold of 1/2 hour or 1 day left/right (##6381232)
		if (this.mDragInfo.threshold) {
			// if moved to a different day, add the difference
			if (this.mDragInfo.currentWeekday != null) dt.setDate(dt.getDate() + (this.mDragInfo.currentWeekday - this.mDragInfo.startWeekday));
			// add the time delta as well
			var hours = dt.getHours() + (dt.getMinutes() / 60);
			hours += (parseInt(this.mDragInfo.element.style.top) - this.mDragInfo.startTop) / this.mWeekGridSize[1];
			// snap to time
			hours = Math.round(hours / this.mSnapHours) * this.mSnapHours;
			// set the date object hours and minutes
			dt.setHours(Math.floor(hours));
			dt.setMinutes((hours - Math.floor(hours)) * 60);
			// change the value in the appt, and save
			var dtstart = dateObjToISO8601(dt);
			dirty = (dtstart.replace(/Z$/, '') != this.mDragInfo.appt.startDate(true).replace(/Z$/, ''));
			this.mDragInfo.appt.setStartDate(dt);
		}
		// update appt div
		Element.remove(this.mDragInfo.element);
		this.endDrag();
		this.drawAppointment(this.mDragInfo.appt, false);
		if (dirty) { //  save to server
			this.mDragInfo.appt.setStartDate(dt);
			this.updateAppointmentEntry(this.mDragInfo.appt);
		}
		else { // show details (user just clicked)
			this.showApptDetails(this.mDragInfo.appt);
		}
		delete this.mDragInfo;
	},
	handleMouseDownInWeekTimedAppointmentSlot: function(inEvent) {
		Event.stop(inEvent);
		// bail if we can't write to the selected calendar
		if (!this.mSelectedCalendar.userCanWriteContent()) return false;
		var elm = Event.element(inEvent);
		var parentElm = Event.findElement(inEvent, 'li');
		var rowMatch = elm.className.match(/calendar_grid_week_row_(\d+)/);
		var columnMatch = parentElm.className.match(/calendar_grid_week_column_(\d+)/);
		if (rowMatch && columnMatch) {
			// get the overlap (how far into the hour did they click?)
			var overlap = (Event.pointerY(inEvent) - Position.page(elm)[1]) / this.mWeekGridSize[1];
			// snap downward in hours/minutes (upward on screen)
			overlap = Math.floor(overlap / this.mSnapHours) * this.mSnapHours;
			// figure out what time the event should start
			var startDate = new Date(this.mDateNavigation.mWeekStartDate.getTime());
			startDate.setDate(startDate.getDate() + parseInt(columnMatch[1]));
			startDate.setHours(parseInt(rowMatch[1]));
			startDate.setMinutes(overlap * 60);
			startDate.setSeconds(0);
			// create appointment div
			var apptDiv = Builder.node('div', {className:'temporary_calendar_appointment'}, '_Calendar.Appointments.DefaultSummary'.loc());
			$('calendar_grid_week_events_content').appendChild(apptDiv);
			Position.clone(elm, apptDiv, {setWidth:false, setHeight:false});
			Element.setOffsetWidth(apptDiv, elm.offsetWidth);
			Element.setOffsetHeight(apptDiv, this.mWeekGridSize[1] * this.mDefaultHours);
			apptDiv.style.top = (parseInt(apptDiv.style.top) + (overlap * this.mWeekGridSize[1])) + 'px';
			// set up what ivars we need for the resize event
			this.mDragInfo = {
				element: apptDiv,
				startDate: startDate,
				startPointer: [Event.pointerX(inEvent), Event.pointerY(inEvent)],
				startHeight: this.mWeekGridSize[1] * this.mDefaultHours,
				maxSize: 24 - startDate.getHours() - overlap
			}
			this.startDrag();
			// observe mouse events
			observeEvents(this, d, {
				mousemove: 'handleWeekTimedAppointmentResizeMove',
				mouseup: 'handleWeekTimedAppointmentResizeEnd'
			});
		}
		return false; // cancel event
	},
	handleWeekTimedAppointmentResizeMove: function(inEvent) {
		Event.stop(inEvent);
		// find the new height
		var height = (Event.pointerY(inEvent) - this.mDragInfo.startPointer[1]) + this.mDragInfo.startHeight;
		// snap resize height
		var snapHeight = this.mWeekGridSize[1] * this.mSnapHours;
		height = Math.floor(height / snapHeight) * snapHeight;
		// make sure it's not less then the minimum height
		height = Math.max(height, this.mWeekGridSize[1] * this.mMinimumHours);
		// finally, set the element height
		this.mDragInfo.element.style.height = height + 'px';
	},
	handleWeekTimedAppointmentResizeEnd: function(inEvent) {
		stopObservingEvents(this, d, {
			mousemove: 'handleWeekTimedAppointmentResizeMove',
			mouseup: 'handleWeekTimedAppointmentResizeEnd'
		});
		// convert the height to a duration in hours
		var height = parseInt(this.mDragInfo.element.style.height);
		var hours = height / this.mWeekGridSize[1];
		// round the hours
		var overlap = hours - Math.floor(hours);
		overlap = Math.round(overlap / this.mSnapHours) * this.mSnapHours;
		hours = Math.floor(hours) + overlap;
		// create an appointment if it's not in the drag info
		var appt = this.mDragInfo.appt;
		if (!appt) {
			appt = this.mSelectedCalendar.createCalendarEvent();
			appt.setSummary('_Calendar.Appointments.DefaultSummary'.loc());
			appt.setStartDate(this.mDragInfo.startDate);
		}
		appt.setDuration(getDurationForHours(hours));
		this.endDrag();
		if ((!this.mDragInfo.appt) || this.mDragInfo.appt.mIsNew) {
			this.showApptDialog(appt);
		}
		else {
			// change the classes back
			appt.displayNodes.each(function(currentNode) {
				if (currentNode.element) {
					$(currentNode.element).removeClassName('temporary_calendar_appointment');
					$(currentNode.element).addClassName('calendar_appointment');
				}
			});
			this.updateAppointmentEntry(appt);
		}
	},
	handleMouseDownInBannerAppointment: function(inEvent) {
		Event.stop(inEvent);
		var pos = [Event.pointerX(inEvent), Event.pointerY(inEvent)];
		var elm = Event.element(inEvent);
		var isResize = elm.className && elm.className.match(/_resizehandle/);
		var appt = this.dataSourceForElement(elm.up('.calendar_appointment'));
		// switch display to temporary
		appt.displayNodes.each(function(currentNode) {
			if (currentNode.element) {
				Element.removeClassName(currentNode.element, 'calendar_appointment');
				Element.addClassName(currentNode.element, 'temporary_calendar_appointment');
			}
		});
		// get a list of other elements as drop zones
		var allDropZones = [];
		if ($('calendar_grid_week_view').visible()) {
			allDropZones = $A($('calendar_grid_week_banner_columns').getElementsByClassName('calendar_grid_week_banner_slot'));
		}
		else {
			allDropZones = $A($('calendar_grid_month_weekday_columns').getElementsByClassName('calendar_grid_month_day'));
		}
		// figure out what day they clicked in (for an offset)
		var foundElm = allDropZones.detect(function(elm) {
			return Position.within(elm, pos[0], pos[1]) && elm.id && elm.id.match(/_\d{8}/);
		});
		if (!foundElm) return false; // sanity check; this should never happen!
		var clickedDate = createDateObjFromISO8601(foundElm.id.match(/_(\d{8})/)[1], false);
		var startDate = appt.startDate();
		var startOffsetDays = (clickedDate.getTime() - startDate.getTime()) / this.mSecondsInDay;
		this.mDragInfo = {
			appt: appt,
			allDropZones: allDropZones,
			startOffsetDays: startOffsetDays,
			startDate: startDate
		}
		this.startDrag();
		// observe mouse events (only allow drag if the organizer is the current principal)
		var eventsToObserve = {mouseup:isResize ? 'handleBannerAppointmentResizeEnd': 'handleBannerAppointmentRescheduleEnd'};
		if (appt.organizerIsPrincipal()) {
			eventsToObserve.mousemove = isResize ? 'handleBannerAppointmentResizeMove' : 'handleBannerAppointmentRescheduleMove';
		}
		observeEvents(this, d, eventsToObserve);
	},
	handleBannerAppointmentRescheduleMove: function(inEvent) {
		//Event.stop(inEvent);
		var pos = [Event.pointerX(inEvent), Event.pointerY(inEvent)];
		// find out what day the mouse event is in
		var foundElm = this.mDragInfo.allDropZones.detect(function(elm) {
			return Position.within(elm, pos[0], pos[1]) && elm.id && elm.id.match(/_\d{8}/);
		});
		if (!foundElm) return false; // user's getting all crazy-like with their drag
		var dt = createDateObjFromISO8601(foundElm.id.match(/_(\d{8})/)[1], false);
		// subtract the offset days (in case user started drag from days into the appt)
		dt.setDate(dt.getDate() - this.mDragInfo.startOffsetDays);
		var dtstart = dateObjToISO8601(dt, false);
		appointmentDtstart = dateObjToISO8601(this.mDragInfo.appt.startDate());
		// if the date has changed, update appointment and redraw it
		if (parseInt(dtstart) != parseInt(appointmentDtstart)) {
			// make sure we carry the time forward
			var timeMatch = appointmentDtstart.match(/T\d{6}/);
			if (timeMatch) {
				dtstart = dtstart.replace(/T\d{6}/, timeMatch[0]);
			}
			// update the appt info
			this.mDragInfo.appt.setStartDate(createDateObjFromISO8601(dtstart));
			this.drawAppointment(this.mDragInfo.appt, false);
			this.mDragInfo.dirty = true;
			// switch display to temporary (do this again in case different nodes were drawn)
			this.mDragInfo.appt.displayNodes.each(function(currentNode) {
				if (currentNode.element) {
					Element.addClassName(currentNode.element, 'temporary_calendar_appointment');
					Element.removeClassName(currentNode.element, 'calendar_appointment');
				}
			});
		}
	},
	handleBannerAppointmentRescheduleEnd: function(inEvent) {
		//Event.stop(inEvent);
		stopObservingEvents(this, d, {
			mousemove: 'handleBannerAppointmentRescheduleMove',
			mouseup: 'handleBannerAppointmentRescheduleEnd'
		});
		// change the classes back
		this.mDragInfo.appt.displayNodes.each(function(currentNode) {
			if (currentNode.element) {
				$(currentNode.element).removeClassName('temporary_calendar_appointment');
				$(currentNode.element).addClassName('calendar_appointment');
			}
		});
		this.endDrag();
		// if they haven't moved the appointment, go to the appointment page
		if (this.mDragInfo.dirty) {
			this.updateAppointmentEntry(this.mDragInfo.appt);
		}
		else {
			this.showApptDetails(this.mDragInfo.appt);
		}
	},
	handleMouseDownInBannerAppointmentSlot: function(inEvent) {
		Event.stop(inEvent);
		// bail if we can't write to the selected calendar
		if (!this.mSelectedCalendar.userCanWriteContent()) return false;
		
		var elm = Event.element(inEvent);
		var elmDateMatch = elm.id.match(/_(\d{8})/);
		if (elmDateMatch) {
			// get a list of other elements as drop zones
			var allDropZones = [];
			if ($('calendar_grid_week_view').visible()) {
				allDropZones = $A($('calendar_grid_week_banner_columns').getElementsByClassName('calendar_grid_week_banner_slot'));
			}
			else {
				allDropZones = $A($('calendar_grid_month_weekday_columns').getElementsByClassName('calendar_grid_month_day'));
			}
			// create a temporary appointment
			var appt = this.mSelectedCalendar.createCalendarEvent();
			appt.setSummary('_Calendar.Appointments.DefaultSummary'.loc());
			appt.setBanner(true);
			appt.setStartDate(elmDateMatch[1]+'T000000');
			appt.setDuration('P1D');
			// draw the appointment
			this.drawAppointment(appt, false);
			// set up what ivars we need for the resize event
			this.mDragInfo = {
				appt: appt,
				allDropZones: allDropZones,
				startDate: appt.startDate()
			}
			// keep track of the appointment
			this.mAppointments[appt.uid] == appt;
			// start the drag operation
			this.startDrag();
			observeEvents(this, d, {
				mousemove: 'handleBannerAppointmentResizeMove',
				mouseup: 'handleBannerAppointmentResizeEnd'
			});
		}
		return false;
	},
	handleBannerAppointmentResizeMove: function(inEvent) {
		Event.stop(inEvent);
		var pos = [Event.pointerX(inEvent), Event.pointerY(inEvent)];
		var foundElm = this.mDragInfo.allDropZones.detect(function(elm) {
			return Position.within(elm, pos[0], pos[1]) && elm.id && elm.id.match(/_\d{8}/);
		});
		if (foundElm) {
			// get the end date from the found element
			// start date is (probably) in the event
			var startDate = this.mDragInfo.appt.startDate();
			// get the end date from the found element
			var endDate = createDateObjFromISO8601(foundElm.id.match(/_(\d{8})/)[1]);
			// banner events actually end on the NEXT day
			endDate.setDate(endDate.getDate()+1);
			// get the duration from the start and end date
			var duration = {days:1};
			if (endDate > startDate) { // TODO: support dragging events backwards
				duration = getDurationUsingEndDate(startDate, endDate);
			}
			// set the appointment info
			this.mDragInfo.appt.setDuration(duration);
			// draw the appointment
			this.drawAppointment(this.mDragInfo.appt, false);
			return false;
			// set the appointment info
			this.mDragInfo.appt.setEndDate(Math.max(startDate, endDate));
			// if the duration is less than 1 day, make it 1 day
			var duration = this.mDragInfo.appt.duration();
			if (duration.years <= 0 && duration.months <= 0 && duration.days <= 0) {
				this.mDragInfo.appt.setDuration('P1D');
			}
			this.drawAppointment(this.mDragInfo.appt, false);
		}
	},
	handleBannerAppointmentResizeEnd: function(inEvent) {
		Event.stop(inEvent);
		stopObservingEvents(this, d, {
			mousemove: 'handleBannerAppointmentResizeMove',
			mouseup: 'handleBannerAppointmentResizeEnd'
		});
		this.endDrag();
		if (this.mDragInfo.appt.mIsNew) {
			this.showApptDialog(this.mDragInfo.appt);
		}
		else {
			// change the classes back
			//this.mDragInfo.appt.displayNodes.each(function(currentNode) {
			//	if (currentNode.element) {
			//		$(currentNode.element).removeClassName('temporary_calendar_appointment');
			//		$(currentNode.element).addClassName('calendar_appointment');
			//	}
			//});
			this.updateAppointmentEntry(this.mDragInfo.appt);
		}
	},
	revertTemporaryDisplayNodes: function() {
		if (this.mDragInfo && this.mDragInfo.appt) this.mDragInfo.appt.displayNodes.each(function(currentNode) {
			if (currentNode.element) {
				$(currentNode.element).removeClassName('temporary_calendar_appointment');
				$(currentNode.element).addClassName('calendar_appointment');
			}
		});
	},
	handleSettingsClick: function(inEvent) {
		inEvent.stop();
		settingsDialog().show();
		return false;
	},
	handleWindowResize: function(inEvent) {
		this.mViewSprings.boing();
		if (this.mMonthMode) {
			this.mMonthViewSpacers.invoke('space');
		}
		else {
			this.mWeekEventSpacer.space();
			this.mWeekHeaderSpacer.space();
			this.mWeekBannerSpacer.space();
		}
		this.drawVisibleAppointments(false);
	},
	setLastView: function(inViewName) {
		var cookieExpire = new Date();
		cookieExpire.setFullYear(cookieExpire.getFullYear()+2);
		d.cookie = 'calendarView='+inViewName+'; expires='+cookieExpire.toGMTString()+'; path='+window.location.pathname;
	},
	showApptDetails: function(inAppointment) {
		this.showApptDialog(inAppointment);
	},
	showApptDialog: function(inAppointment, inOptShowOverElement) {
		// stop server refresh
		if (this.mTimer) {
			clearTimeout(this.mTimer);
			delete this.mTimer;
		}
		this.mGetApptsRequest = null;
		// cancel button callback
		var cancelButtonCallback = function() {
			$$('#module_calendars .temporary_calendar_appointment').invoke('remove');
			delete this.mDragInfo;
			this.getAppointmentsFromServer();
		}
		var okButtonCallback = function() {
			this.updateAppointmentEntry(inAppointment);
		}
		var deleteCallback = function() {
			// FIXME: confirm dialog doesn't show
			if ($A([CalendarEvent.RecurrenceType.None, CalendarEvent.RecurrenceType.Separated]).include(inAppointment.recurrenceType())) {
				if (confirm('_Calendar.Dialogs.Delete.Title'.loc())) {
					// FIXME: we currently only support OnlyThis for separated events, set the action correctly
					if (inAppointment.recurrenceType() == CalendarEvent.RecurrenceType.Separated)
						inAppointment.setRecurrenceChangeAction(CalendarEvent.RecurrenceChangeAction.OnlyThis);
					this.deleteAppointmentFromServer(inAppointment);
				}
			}
			else { // recurrence manager will handle confirmation
				this.deleteAppointmentFromServer(inAppointment);
			}
			
		}
		dialogManager().showProgressMessage('_Calendar.Progress.GettingEvents'.loc(), false, null, true);
		// show the dialog
		dialogManager().hideProgressMessage();
		appointmentDialog().show(inAppointment, cancelButtonCallback.bind(this), okButtonCallback.bind(this), inOptShowOverElement, deleteCallback.bind(this));
	},
	showCalendarInfoDialog: function(inCalendar, inShowOverElement) {
		var defaultCalendarColors = this.mRemoteCalendarCollection.mDefaultCalendarColors;
		if (!$('calendar_info_dialog')) {
			dialogManager().drawDialog('calendar_info_dialog', [
				{label:'_Calendar.Dialogs.CalendarInfo.Name'.loc(), contents:'<input type="text" id="calendar_info_dialog_calendarname"/>'},
				{label:'_Calendar.Dialogs.CalendarInfo.Color'.loc(), contents:'<div id="calendar_info_dialog_calendarcolor"></div>'},
				{label:'', contents:'<a href="#" id="calendar_info_dialog_calendar_share">'+('_Calendar.Dialogs.CalendarInfo.ShareWithMe'.loc())+"\u00A0\u2192</a>"},
				{label:'', contents:'<a href="#" id="calendar_info_dialog_calendar_subscription_url">'+('_Calendar.Dialogs.CalendarInfo.Subscribe'.loc())+"\u00A0\u2192</a>"}
			], '_Dialogs.Save'.loc(), null, '_Calendar.Dialogs.CalendarInfo.Title'.loc());
			// add the delete button
			var td = $('calendar_info_dialog_ok').up('td');
			td.colSpan = '1';
			td.parentNode.insertBefore(Builder.node('td', [
				Builder.node('div', {className:'submit'}, [
					Builder.node('input', {type:'button', id:'calendar_info_dialog_delete', value:'_Calendar.Dialogs.CalendarInfo.Delete'.loc()})
				])
			]), td);
			// set up the color popup
			this.mCalendarInfoColorPicker = new CalendarColorPicker('calendar_info_dialog_calendarcolor', 'calendar_info_color_popup');
		}
		this.mCalendarInfoColorPicker.mEnabled = inCalendar.userCanWriteContent();
		$('calendar_info_dialog_ok').value = inCalendar.userCanWriteContent() ? '_Dialogs.Save'.loc() : '_Dialogs.Done'.loc();
		$('calendar_info_dialog_cancel').style.display = inCalendar.userCanWriteContent() ? '' : 'none';
		$('calendar_info_dialog_calendarname').value = (inCalendar.mDisplayName == 'calendar' ? '_Calendar.Calendar'.loc() : inCalendar.mDisplayName);
		$('calendar_info_dialog_calendarname').disabled = !inCalendar.userCanWriteContent();
		$('calendar_info_dialog_calendar_subscription_url').href = inCalendar.iCalSubscriptionURL();
		// set up the subscription link
		var subscribeCallback = function() {
			alert(String.format('_Calendar.Dialogs.CalendarInfo.ShareWithMe.Confirmation'.loc(), {calendarName:inCalendar.mDisplayName, serverName:window.location.hostname}));
		}
		$('calendar_info_dialog_calendar_share').onclick = function() {
			inCalendar.shareCalendar(subscribeCallback.bind(this));
			return false;
		}.bind(this);
		// set up the delete button
		if (this.mRemoteCalendarCollection.mCalendars.length < 2 || !inCalendar.userCanWriteContent() || inCalendar.isDefault()) $('calendar_info_dialog_delete').hide();
		else $('calendar_info_dialog_delete').show();
		var deleteButtonCallback = function() {
			dialogManager().hide();
			if (confirm(String.format('_Calendar.Dialogs.CalendarInfo.Delete.Confirmation'.loc(), {calendarName:(inCalendar.mDisplayName == 'calendar' ? '_Calendar.Calendar'.loc() : inCalendar.mDisplayName)}))) {
				var calendarDeleteCallback = function() {
					this.getAppointmentsFromServer();
					dialogManager().hideProgressMessage();
					var calendarElm = inShowOverElement.up('li');
					calendarElm.remove();
					if (this.mRemoteCalendarCollection.mCalendars.length > 0)
						calendarViewController().selectCalendar(this.mRemoteCalendarCollection.mCalendars[0]);
				}
				dialogManager().showProgressMessage('_Calendar.Dialogs.CalendarInfo.Delete.Progress'.loc(), false, null, true);
				if (this.mTimer) {
					clearTimeout(this.mTimer);
					delete this.mTimer;
				}
				this.mRemoteCalendarCollection.deleteCalendar(inCalendar, calendarDeleteCallback.bind(this));
			}
			return false;
		}
		$('calendar_info_dialog_delete').onclick = deleteButtonCallback.bind(this);
		// select the current color
		this.mCalendarInfoColorPicker.setValue(inCalendar.mColor);
		// open the dialog
		var okCallback = function() {
			if (!inCalendar.userCanWriteContent()) return true;
			var updatedName = $F('calendar_info_dialog_calendarname');
			var updatedColor = this.mCalendarInfoColorPicker.getValue();
			if (!(updatedName.match(/\S/))) return;
			dialogManager().showProgressMessage('_Calendar.Dialogs.CalendarInfo.Save.Progress'.loc(), false, null, true);
			var renameCalendarCallback = function() {
				dialogManager().hideProgressMessage();
				replaceElementContents(inShowOverElement.up('li').down('span.calendar_collection_displayname'), updatedName);
				inShowOverElement.up('li').down('span.colorcheckbox_colorfill').style.backgroundColor = updatedColor;
				this.drawVisibleAppointments(false);
				notifier().printMessage('calendar_info_dialog_save_confirm');
			}
			inCalendar.renameCalendar(updatedName, updatedColor, renameCalendarCallback.bind(this));
		}
		var showDialogCallback = function(showAddButton) {
			$('calendar_info_dialog_calendar_share').up('tr').style.display = (showAddButton ? '' : 'none');
			$('calendar_info_dialog_calendar_subscription_url').up('tr').style.display = (showAddButton ? 'none' : '');
			dialogManager().show('calendar_info_dialog', null, okCallback.bind(this));
		}
		if (CC.meta('x-apple-user-logged-in') == 'true' && CC.meta('x-apple-username') != 'unauthenticated') {
			principalService().checkOtherPrincipalExistence('/principals/users/'+CC.meta('x-apple-username'), showDialogCallback.bind(this));
		}
		else {
			showDialogCallback.bind(this)(false);
		}
	},
	deleteAppointmentFromServer: function(inAppointment) {
		// only delete appointments which exist on the server
		if (inAppointment.isNew()) {
			$$('#module_calendars .temporary_calendar_appointment').invoke('remove');
			if (this.mDragInfo) delete this.mDragInfo;
			return;
		}
		dialogManager().showProgressMessage('_Calendar.Dialogs.Delete.Progress'.loc(), false, null, true);
		var callback = function(inRequestObj) {
			dialogManager().hideProgressMessage();
			this.removeAppointment(inAppointment);
			this.mGetApptsRequest = null;
			this.getRecurrencesFromServer(inAppointment);
		};
		this.mRequest = inAppointment.deleteFromServer(callback.bind(this));
	},
	updateAppointmentEntry: function(inAppointment) {
		var movedCallback = function() {
			dialogManager().hideProgressMessage();
			// make sure we remember the appointment
			this.mAppointments[inAppointment.uid] = inAppointment;
			//this.revertTemporaryDisplayNodes();
			// revert the temporary nodes in the appointment
			if (inAppointment.displayNodes) inAppointment.displayNodes.each(function(currentNode) {
				if (currentNode.element) {
					$(currentNode.element).removeClassName('temporary_calendar_appointment');
					$(currentNode.element).addClassName('calendar_appointment');
				}
			});
			// delete the inbox appointment (if applicable)
			var inboxElm = $('inbox_event_'+inAppointment.uid);
			if (inboxElm) inboxElm.remove();
			if (!this.hasNotifications()) this.hideNotificationsBadge();
			// Any remaining temporary divs are orphans. Destroy them.
			$$('.temporary_calendar_appointment').invoke('remove');
			//if (this.mDragInfo) {
			//	if (this.mDragInfo.element) {
			//		Element.remove(this.mDragInfo.element);
			//	}
			//}
			// move calendar to appt date and force redraw
			if (inAppointment.startDate()) this.mDateNavigation.setSelectedDate(inAppointment.startDate());
			notifier().printMessage('_Calendar.Notifications.AppointmentSaved'.loc());
			this.getRecurrencesFromServer(inAppointment);
		}
		var saveCallback = function() {
			// if we want to move the event, move it first
			if (inAppointment.mDesiredCalendar) {
				inAppointment.moveToCalendar(inAppointment.mDesiredCalendar, movedCallback.bind(this));
				delete inAppointment.mDesiredCalendar;
			}
			// if it's already in a calendar but there's an inbox event, 
			else if (this.mInboxContents && this.mInboxContents[inAppointment.uid]) {
				this.mInboxContents[inAppointment.uid].deleteFromServer(movedCallback.bind(this));
			}
			else {
				movedCallback.bind(this)();
			}
		}
		// if it's a new appointment we don't care if the recurrences have changed
		if (inAppointment.isNew()) {
			this.mRequest = inAppointment.saveToServer(saveCallback.bind(this));
		}
		else {
			// remove the iTIP method, if any
			inAppointment.mParentCalendarFile.deleteKeyFromMember('METHOD', inAppointment.mParentCalendarFile.mCalendarObj.VCALENDAR[0]);
			dialogManager().showProgressMessage('_Calendar.Dialogs.Appointment.Save.Progress'.loc(), false, null, true);
			this.mRequest = inAppointment.saveToServer(saveCallback.bind(this));
		}
	},
	dateRangeToFetch: function() {
		var range = [new Date(this.mDateNavigation.mSelectedDate.getTime()), new Date(this.mDateNavigation.mSelectedDate.getTime())];
		if (this.mMonthMode) {
			range[0].setDate(1);
			range[1].setMonth(range[1].getMonth()+1);
			range[1].setDate(0);
		}
		else {
			range[0] = new Date(this.mDateNavigation.mWeekStartDate.getTime());
			range[1] = new Date(range[0].getTime());
			range[1].setDate(range[1].getDate()+7);
		}
		// add a buffer
		range[0].setDate(range[0].getDate() - this.mBufferDays);
		range[1].setDate(range[1].getDate() + this.mBufferDays);
		
		return range;
	},
	updateCurrentTime: function() {
		if ($('calendar_grid_month_view').visible()) return;
		var dt = new Date();
		if ((this.mDayMode && parseInt(dateObjToISO8601(dt)) != parseInt(dateObjToISO8601(this.mDateNavigation.mSelectedDate))) || !compareDateWeeks(dt, this.mDateNavigation.mSelectedDate, this.mDateNavigation.mStartWeekday)) {
			$('current_time_indicator').hide();
			return;
		}
		var divLeft = $$('#calendar_grid_week_events_columns div.calendar_grid_hours_key')[0].up('li').offsetWidth - 18;
		var divTop = (this.mWeekGridSize[1]*(dt.getHours()+(dt.getMinutes()/60)))-6;
		$('current_time_indicator').setStyle({
			display: '',
			left: divLeft+'px',
			top: divTop+'px'
		});
	},
	pollForChanges: function() {
		if (this.mTimer) {
			clearTimeout(this.mTimer);
			delete this.mTimer;
		}
		if (this.mParentElement.style.display != 'none') {
			this.mPollRequest = this.mRemoteCalendarCollection.updateCalendarCTags(this.gotChangeList.bind(this));
			this.updateCurrentTime();
		}
	},
	gotChangeList: function(inChangeList) {
		// if there are new calendars, refresh the whole collection
		if (inChangeList.shouldFetchCollection) {
			this.mRemoteCalendarCollection.getCalendars();
		}
		// for now, being safe and re-fetching everything if anything is updated
		else if (inChangeList.length > 0 || inChangeList.shouldFetchInbox) {
			this.getAppointmentsFromServer();
		}
		// otherwise, set a timer for polling again
		else {
			if (this.mTimer) {
				clearTimeout(this.mTimer);
				delete this.mTimer;
			}
			this.mTimer = setTimeout(this.pollForChanges.bind(this), this.mRefreshTimeout);
		}
	},
	getAppointmentsFromServer: function() {
		if (this.mTimer) {
			clearTimeout(this.mTimer);
			delete this.mTimer;
		}
		if (this.mParentElement.style.display != 'none') {
			var range = this.dateRangeToFetch();
			// get the appointments from the server
			this.mGetApptsRequest = this.mRemoteCalendarCollection.getEventsForDateRange(range[0], range[1], this.gotAppointmentsFromServer.bind(this));
		}
	},
	getRecurrencesFromServer: function(inAppointment, inOptCallback) {
		var range = this.dateRangeToFetch();
		var expandCallback = function(q, r) {
			this.gotAppointmentsFromServer(q, r, "uid:" + inAppointment.valueForProperty('UID'));
			if (inOptCallback) inOptCallback();
		}
		this.mExpandRecurrencesRequest = inAppointment.expandRecurrences(range[0], range[1], expandCallback.bind(this));
	},
	gotAppointmentsFromServer: function(inRequestObj, inResponseObj, inOptDeletePrefix) {
		if (inRequestObj == this.mGetApptsRequest || inRequestObj == this.mExpandRecurrencesRequest) {
			// if this is our first load, kill the calendar mask
			if ($('calendar_mask').visible()) $('calendar_mask').hide();
			// only animate if we've gotten appointments before and we're not just adding exceptions
			var animate = this.mAppointments && gAnimate && !inOptDeletePrefix;
			// lazily create appointments hash
			if (!this.mAppointments) this.mAppointments = new Object();
			// sync with the existing
			var syncStatus = Array.syncKeyedArrayWithRows(this.mAppointments, inResponseObj, ['displayNodes'], inOptDeletePrefix);
			// remove the appointment elements that are no longer being returned from the server
			syncStatus.deletedRows.each(function(appt) {
				this.removeAppointment(appt, animate);
			}.bind(this));
			// redraw all of the others
			this.drawVisibleAppointments(animate);
			// get the inbox stuff
			this.getInboxContentsFromServer();
			// open the requested appointment, if applicable
			if (this.mShowAppointmentUID && this.mAppointments[this.mShowAppointmentUID]) {
				this.showApptDialog(this.mAppointments[this.mShowAppointmentUID]);
				delete this.mShowAppointmentUID;
			}
			// reset the refresh timer and hide progress messages
			if (this.mTimer) {
				clearTimeout(this.mTimer);
				delete this.mTimer;
			}
			this.mTimer = setTimeout(this.pollForChanges.bind(this), this.mRefreshTimeout);
			dialogManager().hideProgressMessage();
			globalNotificationCenter().publish('UPDATED_APPOINTMENTS', this);
		}
	},
	getInboxContentsFromServer: function() {
		this.mGetInboxRequest = this.mRemoteCalendarCollection.getInboxContents(this.gotInboxContentsFromServer.bind(this));
	},
	gotInboxContentsFromServer: function(inRequestObj, inResponseObj) {
		// we don't show event changes, so remove duplicate inbox items from the inbox
		var recentResponse = Array.removeDuplicateRows(inResponseObj, function(inEarlier, inLater) {
			var laterIsBetter = parseInt(inLater.valueForProperty('SEQUENCE')) > parseInt(inEarlier.valueForProperty('SEQUENCE'));
			(laterIsBetter ? inEarlier : inLater).deleteFromServer();
			return laterIsBetter;
		});
		var isFirstTime = (!this.mInboxContents);
		if (isFirstTime) this.mInboxContents = $A([]);
		var syncStatus = Array.syncKeyedArrayWithRows(this.mInboxContents, recentResponse);
		var contentElm = $('calendar_sidebar_notifications_content');
		syncStatus.deletedRows.each(function(calendarEvent) {
			if (calendarEvent.uid && $('inbox_event_'+calendarEvent.uid)) $('inbox_event_'+calendarEvent.uid).remove();
		});
		syncStatus.addedRows.each(function(calendarEvent) {
			var method = calendarEvent.mParentCalendarFile.iTIPMethod();
			var methodString = "\u00A0";
			var organizerString = "\u00A0";
			var buttons = [];
			// delete replies from inbox automatically (TODO: when all invitees can attend, push a notification)
			if (method == 'REPLY') {
				calendarEvent.deleteFromServer();
				return false;
			}
			else if (method == 'CANCEL') {
				methodString = '_Calendar.Sidebar.Inbox.Cancelled'.loc();
				buttons = [Builder.node('a', {href:'#', id:'itip_button_confirmcancel'}, '_Dialogs.OK'.loc())];
				buttons[0].observe('click', function(inEvent) {
					inEvent.stop();
					var eff = new Effect.BlindUp('inbox_event_'+calendarEvent.uid, {duration:0.25, afterFinish: function(eff) {
						eff.element.remove();
					}});
					calendarEvent.deleteFromServer(invalidate);
					var gotCalendarEventCallback = function(inMatchingCalendarEvent) {
						if (inMatchingCalendarEvent) {
							inMatchingCalendarEvent.deleteFromServer(function() {this.getAppointmentsFromServer()}.bind(this));
						}
					}
					this.mRemoteCalendarCollection.findEquivalentToInboxCalendarEvent(calendarEvent, gotCalendarEventCallback.bind(this));
					return false;
				}.bind(this));
			}
			else if (method == 'REQUEST') {
				organizerString = String.format('_Calendar.Sidebar.Inbox.Organizer'.loc(), {organizer:calendarEvent.organizer().displayname})
				buttons = [
					Builder.node('a', {href:'#', id:'itip_button_TENTATIVE'}, '_Calendar.Sidebar.Inbox.Status.TENTATIVE'.loc()),
					Builder.node('a', {href:'#', id:'itip_button_ACCEPTED'}, '_Calendar.Sidebar.Inbox.Status.ACCEPTED'.loc()),
					Builder.node('a', {href:'#', id:'itip_button_DECLINED'}, '_Calendar.Sidebar.Inbox.Status.DECLINED'.loc())
				];
				buttons.invoke('observe', 'click', function(inEvent) {
					inEvent.stop();
					var clickedStatus = inEvent.findElement('a').id.match(/itip_button_(.+)$/)[1];
					dialogManager().showProgressMessage('_Calendar.Dialogs.Appointment.Save.Progress'.loc(), false, null, true);
					var cleanupAfterSave = function() {
						dialogManager().hideProgressMessage();
						var eff = new Effect.BlindUp('inbox_event_'+calendarEvent.uid, {duration:0.25, afterFinish: function(eff) {
							eff.element.remove();
						}});
						this.getAppointmentsFromServer();
					}
					var gotCalendarEventCallback = function(inMatchingCalendarEvent) {
						// we may not find a matching calendar event
						if (inMatchingCalendarEvent) {
							inMatchingCalendarEvent.setParticipantStatus(clickedStatus);
							inMatchingCalendarEvent.saveToServer(function() {
								calendarEvent.deleteFromServer(cleanupAfterSave.bind(this));
							}.bind(this));
						}
						else {
							calendarEvent.deleteFromServer(cleanupAfterSave.bind(this));
						}
					}
					this.mRemoteCalendarCollection.findEquivalentToInboxCalendarEvent(calendarEvent, gotCalendarEventCallback.bind(this));
					return false;
				}.bind(this));
			}
			var li = Builder.node('li', {className:'inbox_event', id:'inbox_event_'+calendarEvent.uid}, [
				Builder.node('div', {className:'inbox_event_summary'}, (calendarEvent.summary() || "\u00A0")),
				Builder.node('div', {className:'inbox_event_organizer', style:(organizerString=="\u00A0"?'display:none':'')}, organizerString),
				Builder.node('div', {className:'inbox_event_dtstart'}, calendarEvent.startDate().formatDate('_Dates.DateFormats.MediumDateAndShortTime'.loc())),
				Builder.node('div', {className:'inbox_event_itip', style:(methodString=="\u00A0"?'display:none':'')}, methodString),
				Builder.node('div', {className:'inbox_event_buttons'}, buttons),
				Builder.node('div', {className:'inbox_event_footer'})
			]);
			li.observe('click', function(inEvent) {
				if (Position.within(li.down('div.inbox_event_buttons'), inEvent.pointerX(), inEvent.pointerY())) return;
				inEvent.stop();
				this.mDateNavigation.setSelectedDate(calendarEvent.startDate());
				// if we have alrady cached the event, show it immediately; otherwise, do a request first
				var showOverAppointment = this.mAppointments[calendarEvent.uid];
				if (showOverAppointment) {
					var showOverElement = li;
					if (showOverAppointment.displayNodes.length > 0 && showOverAppointment.displayNodes[0].element) {
						showOverElement = showOverAppointment.displayNodes[0].element;
					}
					this.showApptDialog(this.mAppointments[calendarEvent.uid], showOverElement);
				}
				else {
					this.mShowAppointmentUID = calendarEvent.uid;
				}
				// // if this was the last unresponded event in the list, hide the new notifications badge
				if (!this.hasNotifications()) this.hideNotificationsBadge();
			}.bindAsEventListener(this));
			insertAtBeginning(li, contentElm);
		}, this);
		if (this.hasNotifications()) {
			this.showNotificationsBadge();
			if (isFirstTime) this.showNotifications();
		}
		else {
			this.hideNotificationsBadge();
		}
		this.updateAvailableTimeShading();
	},
	hasNotifications: function() {
		return ($('calendar_sidebar_notifications').getElementsBySelector('li.inbox_event').length > 0);
	},
	showNotificationsBadge: function() {
		$('calendar_sidebar_toolbar_tab_notifications').addClassName('hasNotifications');
	},
	hideNotificationsBadge: function() {
		$('calendar_sidebar_toolbar_tab_notifications').removeClassName('hasNotifications');
	},
	snapSidebarSplitter: function() {
		if (!this.mNotificationsSplitView) return;
		this.mNotificationsSplitView.mMaximumHeight = $('calendar_splitter_parent').offsetHeight;
		if ($('calendar_grid_sidebar_splitter').visible()) {
			this.mNotificationsSplitView.mMaximumHeight -= $('calendar_grid_sidebar_splitter').offsetHeight + this.mCachedNiftyDateHeight||180;
		}
		else {
			this.mCachedNiftyDateHeight = $('calendar_grid_splitter_sibling').offsetHeight;
			this.mNotificationsSplitView.mMaximumHeight -= this.mCachedNiftyDateHeight;
		}
		$('calendar_collection_list').style.height = (this.mNotificationsSplitView.mMaximumHeight)+'px';
	},
	showDatePicker: function() {
		$('calendar_sidebar_notifications').hide();
		$('calendar_date_picker').show();
		$('calendar_grid_sidebar_splitter').hide();
		this.snapSidebarSplitter();
		this.setSelectedChild('calendar_sidebar_toolbar_tab_date');
	},
	showNotifications: function() {
		$('calendar_date_picker').hide();
		$('calendar_sidebar_notifications').show();
		$('calendar_grid_sidebar_splitter').show();
		this.snapSidebarSplitter();
		this.mNotificationsSplitView.mDuringCallback();
		this.setSelectedChild('calendar_sidebar_toolbar_tab_notifications');
	},
	setSelectedChild: function(inElementId) {
		var inElement = $(inElementId);
		if (!inElement) return;
		// Is there a currently selected adjacent element?
		var parent = inElement.up('ul');
		if (parent) {
			var selectedChild = parent.down('.selected');
			if (selectedChild) selectedChild.removeClassName('selected');
			var selectedParent = parent.down('.selectedparent');
			if (selectedParent) selectedParent.removeClassName('selectedparent');
		}
		// Set selected state using the passed element identifer.
		inElement.addClassName('selected');
		// Roll on CSS3 and styling parent nodes with the "<" selector.
		var inElementParent = inElement.parentNode;
		if (inElementParent && (inElementParent.nodeName.toLowerCase() == 'li'))
			inElementParent.addClassName('selectedparent');
	},
	startDrag: function() {
		Position.prepare();
		this.mGetApptsRequest = null;
		if (this.mTimer) {
			clearTimeout(this.mTimer);
			delete this.mTimer;
		}
		tooltipManager().hide(false);
		var timerFunction = function() { delete this.mDragTimer; };
		this.mDragTimer = setTimeout(timerFunction.bind(this), gDoubleClickDelay);
		tooltipManager().mEnabled = false;
	},
	endDrag: function(inDraw) {
		if (inDraw) this.drawVisibleAppointments(false);
		tooltipManager().mEnabled = true;
	},
	drawAppointment: function(inAppointment, inAnimate) {
		var isMonthView = Element.visible('calendar_grid_month_view');
		if (inAppointment.uid) {
			this.updateRectsForAppointment(inAppointment);
			for (var currentNodeIdx = 0; currentNodeIdx < inAppointment.displayNodes.length; currentNodeIdx++) {
				var currentNode = inAppointment.displayNodes[currentNodeIdx];
				// hide month banner events that overlap too far
				if (currentNode.rect && currentNode.overlaps && currentNode.overlaps.index >= this.mMonthBannerLimit && isMonthView) {
					delete currentNode.rect;
				}
				if (currentNode.rect) {
					// deal with overlaps
					if (currentNode.overlaps && (inAppointment.banner() || isMonthView)) { // banners: vertical
						currentNode.rect[1] += (currentNode.rect[3]+2) * currentNode.overlaps.index;
					}
					else if (currentNode.overlaps) { // other: horizontal
						currentNode.rect[0] += currentNode.rect[2] * currentNode.overlaps.index / currentNode.overlaps.total;
						currentNode.rect[2] = currentNode.rect[2] / currentNode.overlaps.total;
					}
					// get the existing div (if there is one)
					var apptDiv = currentNode.element;
					if (!apptDiv) {
						var readOnlyClassName = inAppointment.userCanWriteContent() ? '' : ' readonly';
						// build the DOM objects
						var contentLink = Builder.node('div', {
							className: (inAppointment.banner() ? 'calendar_banner_content' : 'calendar_appointment_content') + readOnlyClassName
						}, [Builder.node('div', {className:'calendar_appointment_attendeestatus calendar_appointment_attendeestatus_none'}), Builder.node('span')]);
						var resizeHandle = Builder.node('div', {
							className: (inAppointment.banner() ? 'calendar_banner_resizehandle' : 'calendar_appointment_resizehandle') + readOnlyClassName
						});
						var apptDivStyle = 'position:absolute';
						apptDiv = Builder.node(isMonthView && !inAppointment.banner() ? 'p' : 'div', {
							className: inAppointment.isNew() ? 'temporary_calendar_appointment' : 'calendar_appointment',
							style: apptDivStyle,
							id: 'appointment_div_' + inAppointment.uid + '_' + currentNodeIdx
						}, [contentLink, resizeHandle]);
						if (isMonthView && !inAppointment.banner()) {
							Element.addClassName(apptDiv, 'month_view_appointment');
						}
						else if (isMonthView) {
							apptDiv.addClassName('calendar_month_banner');
						}
						// set up event handlers
						apptDiv.onselectstart = invalidate;
						contentLink.onclick = invalidate;
						contentLink.onmousedown = invalidate;
						resizeHandle.onmousedown = invalidate;
						if (isMonthView || inAppointment.banner()) {
							Event.observe(contentLink, 'mousedown', this.handleMouseDownInBannerAppointment);
							Event.observe(resizeHandle, 'mousedown', this.handleMouseDownInBannerAppointment);
						}
						else {
							Event.observe(contentLink, 'mousedown', this.handleMouseDownInWeekTimedAppointment);
							Event.observe(resizeHandle, 'mousedown', this.handleMouseDownInWeekTimedAppointment);
						}
					}
					else if (!isMonthView) {
						if (inAppointment.banner() && (apptDiv.parentNode == $('calendar_grid_week_events_content'))) {
							Element.remove(apptDiv);
							$('calendar_grid_week_banners_content').appendChild(apptDiv);
							Event.stopObserving(apptDiv.firstChild, 'mousedown', this.handleMouseDownInWeekTimedAppointment);
							Event.stopObserving(apptDiv.lastChild, 'mousedown', this.handleMouseDownInWeekTimedAppointment);
							Event.observe(apptDiv.firstChild, 'mousedown', this.handleMouseDownInBannerAppointment);
							Event.observe(apptDiv.lastChild, 'mousedown', this.handleMouseDownInBannerAppointment);
						}
						else if ((!inAppointment.banner()) && (apptDiv.parentNode == $('calendar_grid_week_banners_content'))) {
							Element.remove(apptDiv);
							$('calendar_grid_week_events_content').appendChild(apptDiv);
							Event.stopObserving(apptDiv.firstChild, 'mousedown', this.handleMouseDownInBannerAppointment);
							Event.stopObserving(apptDiv.lastChild, 'mousedown', this.handleMouseDownInBannerAppointment);
							Event.observe(apptDiv.firstChild, 'mousedown', this.handleMouseDownInWeekTimedAppointment);
							Event.observe(apptDiv.lastChild, 'mousedown', this.handleMouseDownInWeekTimedAppointment);
						}
					}
					if (apptDiv && (!inAppointment.isNew()) && (!isMonthView || inAppointment.banner())) {
						apptDiv.setStyle({
							backgroundColor: (isMonthView ? inAppointment.color() : inAppointment.fillColor()),
							borderColor: inAppointment.color(),
							color: (isMonthView ? '#FFF' : inAppointment.textColor())
						});
						var overallAttendeeStatus = inAppointment.overallAttendeeStatus();
						var statusDiv = apptDiv.down('div.calendar_appointment_attendeestatus');
						if (overallAttendeeStatus && statusDiv && inAppointment.organizerIsPrincipal()) {
							overallAttendeeStatus = overallAttendeeStatus.toLowerCase().replace(/[^a-z]/, '');
							statusDiv.className = 'calendar_appointment_attendeestatus calendar_appointment_attendeestatus_'+overallAttendeeStatus;
						}
					}
					// add or remove calendar_appointment_needsaction class depending on the partial status
					if (inAppointment.participantStatus() == 'NEEDS-ACTION') {
						Element.addClassName(apptDiv, 'calendar_appointment_needsaction');
					}
					else {
						Element.removeClassName(apptDiv, 'calendar_appointment_needsaction');
					}
					// reposition (animating if applicable)
					if (!inAnimate) Element.addClassName(apptDiv, 'calendar_appointment_noanimate');
					apptDiv.style.left = currentNode.rect[0]+'px';
					apptDiv.style.top = currentNode.rect[1]+'px';
					// resize (animating if applicable)
					apptDiv.style.width = currentNode.rect[2]+'px';
					apptDiv.style.height = currentNode.rect[3]+'px';
					apptDiv.firstChild.style.height = (parseInt(apptDiv.style.height)-this.mResizeHandleHeight)+'px';
					// update appointment title and tooltip
					var summaryToDisplay = inAppointment.summary() || '-';
					if (isMonthView && (!inAppointment.banner())) {
						summaryToDisplay = '• '+summaryToDisplay;
						apptDiv.style.color = inAppointment.color();
					}
					apptDiv.firstChild.tooltipElement = 'appointment_tooltip';
					apptDiv.firstChild.tooltipValues = inAppointment;
					replaceElementContents(apptDiv.down('span'), summaryToDisplay);
					apptDiv.style.fontSize = (!inAppointment.banner() && !isMonthView && parseInt(apptDiv.style.height) <= this.mMinimumDisplayHeight ? '9px' : '');
					if (!inAppointment.banner() && !isMonthView && apptDiv.down('div.calendar_appointment_attendeestatus_none')) {
						Element.removeClassName(apptDiv, 'calendar_appointment_has_attendeestatus');
					}
					else {
						Element.addClassName(apptDiv, 'calendar_appointment_has_attendeestatus');
					}
					// add the element if it's not there
					if (!currentNode.element) {
						tooltipManager().observe(apptDiv.firstChild);
						if (inAnimate) apptDiv.style.opacity = '0';
						if (isMonthView) {
							$('calendar_grid_month_content').appendChild(apptDiv);
						}
						else {
							(inAppointment.banner() ? $('calendar_grid_week_banners_content') : $('calendar_grid_week_events_content')).appendChild(apptDiv);
						}
						currentNode.element = apptDiv;
						if (inAnimate) apptDiv.style.opacity = '';
					}
					// if we made this invisible during a drag, cure that
					currentNode.element.style.visibility = '';
				}
				// if there's no rect but there's an element, get rid of it
				else if (currentNode.element) {
					Event.stopObserving(currentNode.element.firstChild, 'mousedown', this.handleMouseDownInWeekTimedAppointment);
					Event.stopObserving(currentNode.element.lastChild, 'mousedown', this.handleMouseDownInWeekTimedAppointment);
					Event.stopObserving(currentNode.element.firstChild, 'mousedown', this.handleMouseDownInBannerAppointment);
					Event.stopObserving(currentNode.element.lastChild, 'mousedown', this.handleMouseDownInBannerAppointment);
					tooltipManager().stopObserving(currentNode.element.firstChild);
					currentNode.element.onselectstart = null;
					var deleteElement = function() {
						if (currentNode.element) {
							if (currentNode.element.parentNode) Element.remove(currentNode.element);
						}
						currentNode.element = null;
					}
					if (inAnimate) {
						if (!this.mCleanupCallbacks) this.mCleanupCallbacks = $A([]);
						currentNode.element.style.opacity = '0';
						this.mCleanupCallbacks.push(deleteElement.bind(this));
					}
					else {
						deleteElement();
					}
				}
			}
		}
	},
	removeAppointment: function(inAppointment, inAnimate) {
		if (this.mAppointments[inAppointment.uid]) delete this.mAppointments[inAppointment.uid];
		inAppointment.setVisible(false);
		this.drawAppointment(inAppointment, inAnimate);
	},
	drawVisibleAppointments: function(inAnimate) {
		this.updateCurrentTime();
		if (this.mAppointments) {
			// first, remove the old overlap calcs and banner counts
			this.mBannerCounts = new Object();
			var apptsToDeleteOverlaps = $H(this.mAppointments).values();
			for (var currentApptIdx = 0; currentApptIdx < apptsToDeleteOverlaps.length; currentApptIdx++) {
				var currentAppt = apptsToDeleteOverlaps[currentApptIdx];
				if (currentAppt.displayNodes) {
					for (var currentNodeIdx = 0; currentNodeIdx < currentAppt.displayNodes.length; currentNodeIdx++) {
						var currentNode = currentAppt.displayNodes[currentNodeIdx];
						if (currentNode.overlaps) delete currentNode.overlaps;
					}
				}
			}
			// fig'r out how many appts will fit in month grid
			this.mMonthBannerLimit = Math.floor((this.mMonthGridSize[1]-this.mMonthBannerHeight) / (this.mMonthBannerHeight+3)); // add extra wiggle room (3px)
			// create a by-day index of scanned nodes
			var scannedNodes = new Object();
			var isMonthView = Element.visible('calendar_grid_month_view');
			// look for current overlaps
			var apptsToCalculateOverlaps = $H(this.mAppointments).values();
			apptsToCalculateOverlaps.invoke('startDate', true); // cause the corrected start dates to get cached
			apptsToCalculateOverlaps = Array.sortArrayUsingKey(apptsToCalculateOverlaps, 'mCachedStartDate');
			for (var currentApptIdx = 0; currentApptIdx < apptsToCalculateOverlaps.length; currentApptIdx++) {
				var currentAppt = apptsToCalculateOverlaps[currentApptIdx];
				// update banner counts if needed
				if (currentAppt.startDate()) {
					var bannerStartDateInt = parseInt(currentAppt.startDate(true));
					var bannerEndDateInt = Math.max(parseInt(currentAppt.endDate(true)), bannerStartDateInt+1);
					for (var bannerCountIdx = bannerStartDateInt; bannerCountIdx < bannerEndDateInt; bannerCountIdx++) {
						if (!this.mBannerCounts[''+bannerCountIdx]) this.mBannerCounts[''+bannerCountIdx] = 0;
						this.mBannerCounts[''+bannerCountIdx]++;
					}
				}
				var sectionAxis = isMonthView || currentAppt.banner() ? 1 : 0;
				var overlapAxis = (sectionAxis + 1) % 2; // opposite axis
				// find the appointment's screen loc (will be nil if off-screen)
				this.updateRectsForAppointment(currentAppt);
				for (var currentNodeIdx = 0; currentNodeIdx < currentAppt.displayNodes.length; currentNodeIdx++) {
					var currentNode = currentAppt.displayNodes[currentNodeIdx];
					if (currentNode.rect) {
						var sectionName = sectionAxis+'_'+currentNode.rect[sectionAxis];
						if (!scannedNodes[sectionName]) scannedNodes[sectionName] = [];
						for (var otherNodeIdx = 0; otherNodeIdx < scannedNodes[sectionName].length; otherNodeIdx++) {
							var otherNode = scannedNodes[sectionName][otherNodeIdx];
							var highestBeginning = Math.max(
								otherNode.rect[overlapAxis],
								currentNode.rect[overlapAxis]
							);
							var lowestEnding = Math.min(
								(otherNode.rect[overlapAxis]+otherNode.rect[overlapAxis+2]),
								(currentNode.rect[overlapAxis]+currentNode.rect[overlapAxis+2])
							);
							if (highestBeginning < lowestEnding) {
								// lazily create other node's overlaps
								otherNode.overlaps = otherNode.overlaps || {index:0,total:1};
								// increase overlap total and update indices
								otherNode.overlaps.total++;
								currentNode.overlaps = {
									index: otherNode.overlaps.index+1,
									total: otherNode.overlaps.total
								};
							}
						}
						scannedNodes[sectionName].push(currentNode);
					}
				}
			}
			// if we're in month view, update the "more" links
			if (Element.visible('calendar_grid_month_view')) {
				$A(d.getElementsByClassName('calendar_grid_month_day')).each(function(elm) {
					if (elm.id) {
						var bc = this.mBannerCounts[elm.id.match(/\d{8}/)[0]];
						if (!bc) bc = 0;
						var a = elm.down('a');
						if (!a) { // lazily create
							a = Builder.node('a', {href:'#'});
							a.onclick = this.handleMonthMoreButtonClick;
							elm.appendChild(a);
						}
						replaceElementContents(a, String.format('_Calendar.Appointments.More'.loc(), {count:bc}));
						a.style.display = (bc > this.mMonthBannerLimit ? '' : 'none');
					}
				}.bind(this));
			}
			// finally, draw the appointments
			var apptsToDraw = $H(this.mAppointments).values();
			for (var currentApptIdx = 0; currentApptIdx < apptsToDraw.length; currentApptIdx++) {
				this.drawAppointment(apptsToDraw[currentApptIdx], inAnimate);
			}
			// run cleanup callbacks after CSS transition animations should be finished
			if (this.mCleanupCallbacks) {
				setTimeout(function() {
					if (!this.mCleanupCallbacks) return;
					this.mCleanupCallbacks.each(function(cb) {
						cb();
					});
					delete this.mCleanupCallbacks;
				}.bind(this), this.mCleanupTimeout);
			}
			setTimeout(function() {$$('div.calendar_appointment_noanimate').invoke('removeClassName', 'calendar_appointment_noanimate')}, 10);
		}
	},
	updateRectsForAppointment: function(inAppointment, inOptRecursion) { // also sets time string
		var isMonthView = Element.visible('calendar_grid_month_view');
		var recursion = inOptRecursion || 0;
		// get date and duration objects
		var startDate = inAppointment.startDate();
		var duration = inAppointment.duration();

		// If the duration is zero we must still display something, otherwise events will be missing.
		// For a banner we set the duration to 1 day, for a non-banner we set it to 15 minutes
		if (!getHoursForDuration(duration)) {
			if (inAppointment.banner()) {
				duration.days = 1;
			} else {
				duration.minutes = 15;
			}
		}

		// if this is the first time around, reset some values
		if (recursion == 0) {
			// lazily add array
			inAppointment.displayNodes = inAppointment.displayNodes || $A([]);
			// empty rects
			for (var currentNodeIdx = 0; currentNodeIdx < inAppointment.displayNodes.length; currentNodeIdx++) {
				inAppointment.displayNodes[currentNodeIdx].rect = null;
			}
		}
		// bail if we can't find date or if appointment is invisible
		if (!startDate || !inAppointment.visible()) return false;
		// bail if we've declined the event
		if (inAppointment.participantStatus() == 'DECLINED') return false;
		// bail if this is an inbox cancellation
		if (inAppointment.mParentCalendarFile.iTIPMethod() == 'CANCEL') return false;
		// bail if this is a banner event and we're in day view
		if (this.mDayMode && inAppointment.banner() && recursion > 0) return false;
		// calculate the time string
		if (recursion == 0) inAppointment.time_string = getTimeRangeDisplayString(startDate, duration);
		// branch for banner or normal appointments
		if (inAppointment.banner() || isMonthView) {
			var days = duration.days || 0;
			for (var i = 0; i < recursion; i++) {
				startDate.setDate(startDate.getDate() + inAppointment.displayNodes[i].days);
				days -= inAppointment.displayNodes[i].days;
			}
			// find the maximum number of days we can show for the remainder of this week
			var maxDays = (7-(startDate.getDay()-this.mDateNavigation.mStartWeekday));
			// fix overflows (from non-Sunday start weekdays)
			if (maxDays > 7) maxDays %= 7;
			// can be no more than the maximum
			days = Math.min(days, maxDays); /* ##5389023 */
			if (recursion == 0 && (!inAppointment.banner())) days = Math.max(days, 1);
			// bail if isn't visible
			if (days <= 0) return false;
			// 6956060
			if (this.mDayMode && inAppointment.banner()) {
				var today = this.mDateNavigation.mSelectedDate;
				var endDate = new Date(startDate.getTime());
				endDate.setDate(endDate.getDate() + duration.days);
				// banner event starts after today
				if ((today - startDate) < 0) return false;
				// banner event ends before today
				if ((today - endDate) > 0) return false;
			}
			var rect = null;
			var prefix = isMonthView ? 'calendar_grid_month_day_' : 'calendar_grid_week_banner_slot_';
			var selectedDateElement = $('calendar_grid_week_banner_slot_'+parseInt(dateObjToISO8601(this.mDateNavigation.mSelectedDate)));
			var startElement = (this.mDayMode ? selectedDateElement : $(prefix+parseInt(dateObjToISO8601(startDate))));
			var endDate = getEndDateUsingDuration(startDate, {days:days-1});
			var endElement = (this.mDayMode ? selectedDateElement : $(prefix+parseInt(dateObjToISO8601(endDate))));
			if (startElement && endElement) {
				var startOffsetElement = browser().isIE ? (isMonthView ? startElement.parentNode.parentNode : startElement.parentNode) : startElement;
				var endOffsetElement = browser().isIE ? (isMonthView ? endElement.parentNode.parentNode : endElement.parentNode) : endElement;
				// copy element offsets to rect (width is guessed and changed below)
				rect = [startOffsetElement.offsetLeft, startElement.offsetTop, 50, this[isMonthView?'mMonthBannerHeight':'mBannerHeight']];
				// offset top to account for month view label
				if (isMonthView) rect[1] += this.mMonthBannerHeight+2;
				// calculate width
				rect[2] = endOffsetElement.offsetLeft + endElement.offsetWidth - rect[0] + this.mWeekEventElementOffsets[2];
				if (this.mDayMode) rect[2]--;
			}
			// make sure a node exists at this recursion index
			if (inAppointment.displayNodes.length <= recursion) inAppointment.displayNodes[recursion] = new Object();
			// populate the rect information
			Object.extend(inAppointment.displayNodes[recursion], {days:days, rect:rect});
		}
		else { // not an all-day appt
			// turn the duration into hours
			var hours = duration.hours || 0;
			if (duration.days) hours += (duration.days*24);
			if (duration.minutes) hours += (duration.minutes/60);
			for (var i = 0; i < recursion; i++) {
				startDate.setDate(startDate.getDate()+1);
				startDate.setHours(0);
				startDate.setMinutes(0);
				startDate.setSeconds(0);
				hours -= inAppointment.displayNodes[i].hours;
			}
			hours = Math.min(hours, 24-startDate.getHours()-(startDate.getMinutes()/60));
			// bail if it's not this week
			if (hours <= 0) return false;
			var rect = null;
			if (compareDateWeeks(startDate, this.mDateNavigation.mSelectedDate, this.mDateNavigation.mStartWeekday) && (!this.mDayMode || (parseInt(dateObjToISO8601(startDate, false)) == parseInt(dateObjToISO8601(this.mDateNavigation.mSelectedDate, false, false))))) {
				// get rect position
				var columnNum = dateToColummNumber(startDate, this.mDateNavigation.mStartWeekday);
				var cloneElm = $$('#calendar_grid_week_events_columns .calendar_grid_week_column_' + columnNum + ' .calendar_grid_week_row_' + startDate.getHours())[0];
				hours = Math.max(hours, 0.25);
				var rect = [cloneElm.offsetLeft, cloneElm.offsetTop+((startDate.getMinutes()/60)*this.mWeekGridSize[1]), cloneElm.offsetWidth, Math.max(hours*this.mWeekGridSize[1], this.mMinimumDisplayHeight)];
				this.mWeekEventElementOffsets.each(function(offset, i) {
					rect[i] += offset;
				});
			}
			// make sure a node exists at this recursion index
			if (inAppointment.displayNodes.length <= recursion) inAppointment.displayNodes[recursion] = new Object();
			// populate the rect information
			Object.extend(inAppointment.displayNodes[recursion], {hours:hours, rect:rect});
		}
		// recurse
		this.updateRectsForAppointment(inAppointment, ++recursion);
		return true;
	},
	updateAvailableTimeShading: function() {
		var availability = this.mRemoteCalendarCollection && this.mRemoteCalendarCollection.mAvailability;
		if (availability) {
			// update the morning hours
			var startDate = availability.startDate();
			var morningHeight = ( startDate.getHours() + ( startDate.getMinutes() / 60 ) ) * this.mWeekGridSize[1];
			$('calendar_grid_week_unavailable_morning').style.height = morningHeight+'px';
			// update the evening hours
			var endDate = availability.endDate();
			var eveningStart = ( endDate.getHours() + ( endDate.getMinutes() / 60 ) ) * this.mWeekGridSize[1];
			$('calendar_grid_week_unavailable_evening').style.top = eveningStart+'px';
			$('calendar_grid_week_unavailable_evening').setStyle({
				top: eveningStart+'px',
				height: (Element.getHeight('calendar_grid_week_events_content') - eveningStart)+'px'
			});
		}
		$$('#calendar_grid_week_events .calendar_grid_week_unavailable').invoke(availability?'show':'hide');
	}
}


var EventRecurrenceDialogManager = Class.createWithSharedInstance('eventRecurrenceDialogManager');
EventRecurrenceDialogManager.prototype = {
	initialize: function() {
		if (!$('module_calendars')) return invalidate;
		globalNotificationCenter().subscribe('WILL_SAVE_CALENDAR_EVENT', this.handleAppointmentSave.bind(this));
		globalNotificationCenter().subscribe('WILL_DELETE_CALENDAR_EVENT', this.handleAppointmentDelete.bind(this));
	},
	showDialogForAppointment: function(inDialog, inAppointment, inAppointmentAction, inOptOKCallback) {
		// This method assumes that the dialog has been drawn already
		this.mCurrentAppointment = inAppointment;
		this.mCurrentAppointmentAction = inAppointmentAction;
		inAppointment.setRecurrenceChangeAction(CalendarEvent.RecurrenceChangeAction.Postpone);
		dialogManager().show(inDialog, this.handleCancel.bind(this), inOptOKCallback || this.handleOnlyThisClick.bind(this));
	},
	handleCancel: function() {
		this.mCurrentAppointment.revertToSaved();
		calendarViewController().drawVisibleAppointments();
		calendarViewController().getAppointmentsFromServer();
	},
	handleAllEventsClick: function() {
		this.mCurrentAppointment.setRecurrenceChangeAction(CalendarEvent.RecurrenceChangeAction.AllFuture);
		dialogManager().showProgressMessage(this.mCurrentAppointmentAction == 'deleteFromServer' ? '_Calendar.Dialogs.Delete.Progress'.loc() : '_Calendar.Dialogs.Updating.Progress'.loc(), false, null, true);
		calendarViewController()[this.mCurrentAppointmentAction](this.mCurrentAppointment);
	},
	handleOnlyThisClick: function() {
		this.mCurrentAppointment.setRecurrenceChangeAction(CalendarEvent.RecurrenceChangeAction.OnlyThis);
		calendarViewController()[this.mCurrentAppointmentAction](this.mCurrentAppointment);
	},
	showDeleteFirstDialogForAppointment: function(inAppointment) {
		// lazily draw the dialog
		if (!$('appointment_recur_warn_delete_first_dialog')) {
			dialogManager().drawDialog('appointment_recur_warn_delete_first_dialog', [
				'_Calendar.Dialogs.DeleteFirst.Description'.loc()
			], '_Calendar.Dialogs.DeleteFirst.DeleteOnlyThis'.loc(), null, '_Calendar.Dialogs.DeleteFirst.Title'.loc());
			insertAfter(Builder.node('input', {
				type: 'button',
				id: 'appointment_recur_warn_delete_first_dialog_allappts',
				value: '_Calendar.Dialogs.DeleteFirst.DeleteAllFuture'.loc()
			}), 'appointment_recur_warn_delete_first_dialog_cancel');
			Event.observe('appointment_recur_warn_delete_first_dialog_allappts', 'click', this.handleAllEventsClick.bindAsEventListener(this));
		}
		this.showDialogForAppointment('appointment_recur_warn_delete_first_dialog', inAppointment, 'deleteAppointmentFromServer');
	},
	showDeleteNthDialogForAppointment: function(inAppointment) {
		if (!$('appointment_recur_warn_delete_nth_dialog')) {
			dialogManager().drawDialog('appointment_recur_warn_delete_nth_dialog', [
				'_Calendar.Dialogs.DeleteNth.Description'.loc()
			], '_Calendar.Dialogs.DeleteNth.DeleteOnlyThis'.loc(), null, '_Calendar.Dialogs.DeleteNth.Title'.loc());
			insertAfter(Builder.node('input', {
				type: 'button',
				id: 'appointment_recur_warn_delete_nth_dialog_allapts',
				value: '_Calendar.Dialogs.DeleteNth.DeleteAllFuture'.loc()
			}), 'appointment_recur_warn_delete_nth_dialog_cancel')
			Event.observe('appointment_recur_warn_delete_nth_dialog_allapts', 'click', this.handleAllEventsClick.bindAsEventListener(this));
		}
		this.showDialogForAppointment('appointment_recur_warn_delete_nth_dialog', inAppointment, 'deleteAppointmentFromServer');
	},
	showUpdateRecurrenceDialogForAppointment: function(inAppointment) {
		if (!$('appointment_recur_warn_recur_dialog')) {
			dialogManager().drawDialog('appointment_recur_warn_recur_dialog', [
				'_Calendar.Dialogs.UpdateRecurrence.Description'.loc()
			], '_Calendar.Dialogs.UpdateRecurrence.Change'.loc(), null, '_Calendar.Dialogs.UpdateRecurrence.Title'.loc());
		}
		this.showDialogForAppointment('appointment_recur_warn_recur_dialog', inAppointment, 'updateAppointmentEntry', this.handleAllEventsClick.bind(this));
	},
	showUpdateFirstDialogForAppointment: function(inAppointment) {
		if (!$('appointment_recur_warn_change_first_dialog')) {
			dialogManager().drawDialog('appointment_recur_warn_change_first_dialog', [
				'_Calendar.Dialogs.ChangeFirst.Description'.loc()
			], '_Calendar.Dialogs.ChangeFirst.OnlyThis'.loc(), null, '_Calendar.Dialogs.ChangeFirst.Title'.loc());
			insertAfter(Builder.node('input', {
				type: 'button',
				id: 'appointment_recur_warn_change_first_dialog_allappts',
				value: '_Calendar.Dialogs.ChangeFirst.All'.loc()
			}), 'appointment_recur_warn_change_first_dialog_cancel');
			Event.observe('appointment_recur_warn_change_first_dialog_allappts', 'click', this.handleAllEventsClick.bindAsEventListener(this));
		}
		this.showDialogForAppointment('appointment_recur_warn_change_first_dialog', inAppointment, 'updateAppointmentEntry');
	},
	showUpdateNthDialogForAppointment: function(inAppointment) {
		if (!$('appointment_recur_warn_change_nth_dialog')) {
			dialogManager().drawDialog('appointment_recur_warn_change_nth_dialog', [
				'_Calendar.Dialogs.ChangeNth.Description'.loc()
			], '_Calendar.Dialogs.ChangeNth.OnlyThis'.loc(), null, '_Calendar.Dialogs.ChangeNth.Title'.loc());
			insertAfter(Builder.node('input', {
				type: 'button',
				id: 'appointment_recur_warn_change_nth_dialog_all',
				value: '_Calendar.Dialogs.ChangeNth.All'.loc()
			}), 'appointment_recur_warn_change_nth_dialog_cancel');
			Event.observe('appointment_recur_warn_change_nth_dialog_all', 'click', this.handleAllEventsClick.bindAsEventListener(this));
		}
		this.showDialogForAppointment('appointment_recur_warn_change_nth_dialog', inAppointment, 'updateAppointmentEntry');
	},
	handleAppointmentSave: function(inMessage, inObject, inUserInfo) {
		if (inObject.recurrenceChangeAction() != CalendarEvent.RecurrenceChangeAction.Unknown) return false;
		if (inObject.recurrenceType() != CalendarEvent.RecurrenceType.None && inObject.updateStack().include('RRULE')) {
			if (!inObject.isNew() && !inObject.recurrenceIsNew()) {
				this.showUpdateRecurrenceDialogForAppointment(inObject);
			}
		}
		else if (inObject.recurrenceType() == CalendarEvent.RecurrenceType.First) {
			this.showUpdateFirstDialogForAppointment(inObject);
		}
		else if (inObject.recurrenceType() == CalendarEvent.RecurrenceType.Nth) {
			this.showUpdateNthDialogForAppointment(inObject);
		}
	},
	handleAppointmentDelete: function(inMessage, inObject, inUserInfo) {
		if (inObject.recurrenceChangeAction() != CalendarEvent.RecurrenceChangeAction.Unknown) return false;
		if (inObject.recurrenceType() == CalendarEvent.RecurrenceType.First) {
			this.showDeleteFirstDialogForAppointment(inObject);
		}
		else if (inObject.recurrenceType() == CalendarEvent.RecurrenceType.Nth) {
			this.showDeleteNthDialogForAppointment(inObject);
		}
	}
}
