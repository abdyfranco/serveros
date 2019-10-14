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

function createDateObjFromISO8601(inISOString, inOptIsGMT) {
	if (!inISOString) return null;
	var str = inISOString.match(/[Tt]/) ? inISOString : inISOString+'T000000Z';
	var d = str.match(/(\d{4})-?(\d{2})-?(\d{2})\s*[Tt]?(\d{2}):?(\d{2}):?(\d{2})/);
	if (!d) return null; // bail if the format doesn't match
	var dt = new Date(d[1], d[2]-1, d[3], d[4], d[5], d[6]);
	if (inOptIsGMT) dt.setHours(dt.getHours()-(dt.getTimezoneOffset() / 60));
	return dt;
}

// Copied from calendar_widget_core
function padNumberStr(theNumber, digits) {
	var padder = ((arguments.length > 2) ? arguments[2] : '0');
	var theString = "";
	theString += theNumber;
	
	for (var i = 0; i < (digits-theString.length); i++) {
		theString = padder + theString;
	}
	
	return theString;
}

function dateObjToISO8601(inDateObj, inOptMakeGMT, inIncludeZ) {
	if (!inDateObj) return null;
	var includeZ = (arguments.length > 2 ? inIncludeZ : true);
	var dt = new Date(inDateObj.getTime()); // copy the incoming date
	if (inOptMakeGMT) dt.setHours(dt.getHours()-(dt.getTimezoneOffset() / (-60)));
	var iso_string = '';
	iso_string += dt.getFullYear()
				+ padNumberStr(dt.getMonth()+1, 2)
				+ padNumberStr(dt.getDate(), 2)
				+ 'T'
				+ padNumberStr(dt.getHours(), 2)
				+ padNumberStr(dt.getMinutes(), 2)
				+ padNumberStr(dt.getSeconds(), 2)
				+ (includeZ ? 'Z' : '');
	return iso_string;
}

function getEndDateUsingDuration(inDate, inDuration) {
	var dt = new Date(inDate.getTime());
	if (inDuration.days) dt.setDate(dt.getDate() + inDuration.days);
	if (inDuration.hours) dt.setHours(dt.getHours() + inDuration.hours);
	if (inDuration.minutes) dt.setMinutes(dt.getMinutes() + inDuration.minutes);
	if (inDuration.seconds) dt.setMinutes(dt.getSeconds() + inDuration.seconds);
	return dt;
}

function getDurationUsingEndDate(inStartDate, inEndDate) {
	var time = Math.floor((inEndDate.getTime() - inStartDate.getTime()) / 1000);
	var whole = (time < 0 ? Math.ceil : Math.floor);
	var duration = {days:whole(time / 86400)};
	time = time % 86400;
	duration.hours = whole(time / 3600);
	time = time % 3600;
	duration.minutes = whole(time / 60);
	duration.seconds = time % 60;
	return duration;
}

function durationFromISO8601(inISOString) {
	if (!inISOString) return null; // bail if we're not being handed a string
	var dt = inISOString.match(/^P([^T]*)T?(.*)$/);
	if (!dt) return null; // bail if string isn't a valid format
	var duration = new Object();
	['years', 'months', 'days', 'hours', 'minutes', 'seconds'].each(function(key, i) {
		var mat = dt[Math.floor(i/3)+1].match("([0-9]+)"+key.charAt(0).toUpperCase());
		duration[key] = mat ? parseInt(mat[1]) : 0;
	});
	return duration;
}

function durationToISO8601(inDuration) {
	var str = 'P';
	if (inDuration.years && inDuration.years > 0) str += inDuration.years+'Y';
	if (inDuration.months && inDuration.months > 0) str += inDuration.months+'M';
	if (inDuration.days && inDuration.days > 0) str += inDuration.days+'D';
	str += 'T';
	if (inDuration.hours && inDuration.hours > 0) str += inDuration.hours+'H';
	if (inDuration.minutes && inDuration.minutes > 0) str += inDuration.minutes+'M';
	if (inDuration.seconds && inDuration.seconds > 0) str += inDuration.seconds+'S';
	return str;
}

function getLocalizedHourKey(inHours, inOptMinutes) {
	var dt = new Date();
	dt.setHours(inHours);
	dt.setMinutes(inOptMinutes||0);
	var formatString = (inOptMinutes && inOptMinutes > 0 ? '_Dates.DateFormats.HourAndMinutes' : '_Dates.DateFormats.Hour');
	return dt.formatDate(formatString.loc());
}

function getTimeRangeDisplayString(inStartDate, inDuration) {
	if (inDuration.days > 0 && inDuration.hours == 0 && inDuration.minutes == 0) {
		var str = inStartDate.formatDate('_Dates.DateFormats.MediumDate'.loc());
		if (inDuration.days > 1) {
			var endDate = getEndDateUsingDuration(inStartDate, inDuration);
			endDate.setDate(endDate.getDate()-1);
			str += ' - ' + endDate.formatDate('_Dates.DateFormats.MediumDate'.loc());
		}
		return str;
	}
	var time_string = getLocalizedHourKey(inStartDate.getHours(), inStartDate.getMinutes());
	var endDate = getEndDateUsingDuration(inStartDate, inDuration);
	return inStartDate.formatDate('_Dates.DateFormats.MediumDate'.loc()) + '; ' + time_string + ' - ' + getLocalizedHourKey(endDate.getHours(), endDate.getMinutes());
}
