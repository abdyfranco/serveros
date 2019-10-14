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

//= require "./core.js"
//= require "./dates.js"
//= require "./thirdparty/format.js"

var apple_loc_strings = apple_loc_strings || {};

CC.LocalizationManager = Class.createWithSharedInstance('globalLocalizationManager', false);
CC.LocalizationManager.prototype = {
	_strings: {},
	initialize: function() {
	    this.setStrings(apple_loc_strings);
	},
	setStrings: function(stringsHash) {
	    Object.extend(this._strings, stringsHash);
	},
	localize: function(key) {
		return this._strings[key] || key;
	},
	getLprojLocale: function() {
		var LANGUAGE_TO_LPROJ_MAP = {
		  'de': 'de',
		  'en': 'en',
		  'es': 'es',
		  'fr': 'fr',
		  'it': 'it',
		  'ja': 'ja',
		  'ko': 'ko',
		  'nl': 'nl',
		  'zh-cn': 'zh_CN',
		  'zh-tw': 'zh_TW'
		};
		var browserLocale = navigator.language || navigator.browserLanguage || 'en';
		var lProjLocale = LANGUAGE_TO_LPROJ_MAP[browserLocale];
		if (!lProjLocale) {
			// If we can't find an exact match on language AND region, try language alone.
			// For ex, browser can return zh-cn, but also fr-fr or ja-jp, and in the last 2 cases we need to match on fr and ja.
			lProjLocale = LANGUAGE_TO_LPROJ_MAP[browserLocale.split('-')[0]];
		}
		return lProjLocale || 'en';
	},
	localizedDay: function(inDate, inOptUseShortFormat) {
		var adjustedDate = this.adjustDateForUTCOffset(inDate);
		if (adjustedDate) {
			var day_index = adjustedDate.getDay();
			if (day_index < 7) {
				if (inOptUseShortFormat) {
					return "_Date.Short.Day.Names".loc().split(',')[day_index];
				} else {
					return "_Date.Day.Names".loc().split(',')[day_index];
				}
			}
		}
		return "_Date.Unknown".loc();
	},
	localizedDate: function(inDate, inOptUseShortFormat) {
		var adjustedDate = this.adjustDateForUTCOffset(inDate);
		if (adjustedDate) {
			var day_delta = this.calculateDayDeltaForDateFromToday(adjustedDate);
			if (day_delta == 0) {
				return "_Date.Today".loc();
			} else if (day_delta == -1) {
				return "_Date.Yesterday".loc();
			} else if (day_delta == 1) {
				return "_Date.Tomorrow".loc();
			} else {
				var month = adjustedDate.getMonth();
				var localizedMonth;
				if (inOptUseShortFormat) {
					localizedMonth = "_Date.Short.Month.Names".loc().split(',')[month % 12];
				} else {
					localizedMonth = "_Date.Month.Names".loc().split(',')[month % 12];
				}
				var day = adjustedDate.getDate();
				if (Math.abs(day_delta) <= 365) {
					return "_Date.Short.Format".loc(localizedMonth, day);
				} else {
					var year = adjustedDate.getFullYear();
					return "_Date.Long.Format".loc(localizedMonth, day, year);
				}
			}
		}
		return "_Date.Unknown".loc();
	},
	localizedDateWithTime: function(inDate, inOptUseShortFormat) {
		if (inDate) {
			return "_DateTime.Format".loc(this.localizedDate(inDate, inOptUseShortFormat), this.localizedTime(inDate));
		}
		return "_DateTime.Unknown".loc();
	},
	localizedTime: function(inDate) {
		var adjustedDate = this.adjustDateForUTCOffset(inDate);
		if (adjustedDate) {
			var hours = adjustedDate.getHours();
			var am = false;
			if (hours == 0) {
				hours = 12;
				am = true;
			} else if (hours < 12) {
				if (hours > 0) am = true;
			} else if (hours > 12) {
				hours -= 12;
			}
			var minutes = adjustedDate.getMinutes();
			if (minutes < 10) minutes = "0" + minutes;
			return "_Time.Default.Format".loc(hours, minutes, (am ? "_Time.AM".loc() : "_Time.PM".loc()));
		}
		return "_Time.Unknown".loc();
	},
	// Returns a "Today", "Yesterday", "XX at YY:ZZ PM" UTC-adjusted formatted date string.
	localizedDateTime: function(inDate) {
		if (inDate) {
			var adjustedDate = this.adjustDateForUTCOffset(inDate);
			if (adjustedDate) {
				var date = this.localizedDate(adjustedDate);
				var time = this.localizedTime(adjustedDate);
				return "_DateTime.Format".loc(date, time);
			}
		}
		return "_DateTime.Unknown".loc();
	},
	// Returns a "Day at YY:ZZ PM" date string.
	localizedDayAndTime: function(inDate) {
		if (inDate) {
			var adjustedDate = this.adjustDateForUTCOffset(inDate);
			if (adjustedDate) {
				var localizedDay = this.localizedDay(adjustedDate);
				var localizedTime = this.localizedTime(adjustedDate);
				return "_DateTime.Format".loc(localizedDay, localizedTime);
			}
		}
		return "_DateTime.Unknown".loc();
	},
	// Returns the time if the given date is today, otherwise a XX/YY/ZZZZ at AA:BB UTC-adjusted formatted date time string.
	shortLocalizedDateTime: function(inDate) {
		if (inDate) {
			var adjustedDate = this.adjustDateForUTCOffset(inDate);
			if (adjustedDate) {
				var day_delta = this.calculateDayDeltaForDateFromToday(adjustedDate);
				if (day_delta == 0) {
					return this.localizedTime(adjustedDate);
				} else {
					// Remember to increment the month value since they're zero-indexed.
					var localizedDate = "_Date.Default.Format".loc((adjustedDate.getMonth() + 1), adjustedDate.getDate(), adjustedDate.getFullYear());
					var localizedTime = this.localizedTime(adjustedDate);
					return "_DateTime.Format".loc(localizedDate, localizedTime);
				}
			}
		}
		return "_DateTime.Unknown".loc();
	},
	// Returns a "XX/YY/ZZZZ" date string.
	shortLocalizedDate: function(inDate) {
		if (inDate) {
			var adjustedDate = this.adjustDateForUTCOffset(inDate);
			if (adjustedDate) {
				// Remember to increment the month value since they're zero-indexed.
				return "_Date.Default.Format".loc((adjustedDate.getMonth() + 1), adjustedDate.getDate(), adjustedDate.getFullYear());
			}
		}
		return "_DateTime.Unknown".loc();
	},
	// Returns a "XX/YY/ZZZZ HH:MM AM" date time string.
	shortLocalizedDateAndTime: function(inDate) {
		if (inDate) {
			return "_DateTime.NoAt.Format".loc(this.shortLocalizedDate(inDate), this.localizedTime(inDate));
		}
		return "_DateTime.Unknown".loc();
	},
	// Returns a "Mon DD YYYY" date time string.
	shortLocalizedDateWithMonthAsString: function(inDate) {
		var adjustedDate = this.adjustDateForUTCOffset(inDate);
		if (adjustedDate) {
			var month = adjustedDate.getMonth();
			var localizedMonth = "_Date.Short.Month.Names".loc().split(',')[month % 12];
			var day = adjustedDate.getDate();
			var year = adjustedDate.getFullYear();
			return "_Date.Long.Format".loc(localizedMonth, day, year);
		}
		return "_Date.Unknown".loc();
	},
	// Returns a "Mon DD YYYY HH:MM AM" if torday, or "Mon DD YYYY" date time string.
	shortLocalizedDateWithMonthAsStringWithTodaysTime: function(inDate) {
		var adjustedDate = this.adjustDateForUTCOffset(inDate);		
		if (adjustedDate) {
			var day_delta = this.calculateDayDeltaForDateFromToday(adjustedDate);
			var month = adjustedDate.getMonth();
			var day = adjustedDate.getDate();
			var year = adjustedDate.getFullYear();
			var localizedMonth = "_Date.Short.Month.Names".loc().split(',')[month % 12];
			
			if (day_delta == 0) {
				var time = this.localizedTime(adjustedDate);
				return "_Date.Long.WithTime.Format".loc(localizedMonth, day, year,time);
			}
			else {
				return "_Date.Long.Format".loc(localizedMonth, day, year);
			}
		}
		return "_Date.Unknown".loc();
	},
	calculateDayDeltaForDateFromToday: function(inDate) {
		return this.calculateDayDeltaForDateFromDate(inDate, new Date());
	},
	calculateDayDeltaForDateFromDate: function(inDate, inSecondDate) {
		if (!inDate || !inSecondDate) return undefined;
		// Strip everything but the day/month/year from the supplied dates.
		var inSecondDateStripped = new Date(inSecondDate.getFullYear(), inSecondDate.getMonth(), inSecondDate.getDate());
		var inDateStripped = new Date(inDate.getFullYear(), inDate.getMonth(), inDate.getDate());
		// If the difference between the two dates is zero, the day delta is 0.
		var dateDifference = inSecondDateStripped.getTime() - inDateStripped.getTime();
		// If the difference is greater than zero, the supplied date is before the stripped today date.
		// Otherwise if the difference is less than zero, the supplied date is after the stripped today
		// date. We negate the result here so one full day in the past is returned as -1.
		if (dateDifference > 0) {
			return -1 * ((dateDifference / (1000 * 60 * 60)) / 24)
		} else if (dateDifference < 0) {
			return ((Math.abs(dateDifference) / (1000 * 60 * 60)) / 24)
		} else {
			return 0;
		}
	},
	adjustDateForUTCOffset: function(inDate) {
		if (!inDate) return undefined;
		var dt = new Date();
		var offset = dt.getTimezoneOffset();
		var gmt_offset = inDate.getTimezoneOffset();
		var minutes_delta = offset - gmt_offset;
		inDate.setMinutes(inDate.getMinutes() + minutes_delta);
		return inDate;
	},
	localizedFileSize: function(inBytes) {
		if (!inBytes) return inBytes;
		if (inBytes < 1024) {
			return Math.round(inBytes) + " Bytes";
		} else if (inBytes < 1048576) {
			return Math.round(((inBytes / 1024) * 100) / 100)  + " KB";
		} else if (inBytes < 1073741824) {
			return  Math.round(((inBytes / 1048576) * 100) / 100) + " MB";
		} else {
			return  Math.round(((inBytes / 1073741824) * 100) / 100) + " GB";
		}
	},
	localizedDuration: function(inStartDate, inEndDate) {
		if (!inStartDate || !inEndDate) return;
		var delta = Math.abs(inEndDate.getTime() - inStartDate.getTime());
		var dayDifference = Math.floor(delta / (1000 * 60 * 60 * 24));
		delta = (delta % (1000 * 60 * 60 * 24));
		
		if (dayDifference > 1) {
			return "_Duration.MoreThanADay".loc();
		}
		
		var hourDifference = Math.floor(delta / (1000 * 60 * 60));
		delta = (delta % (1000 * 60 * 60));
		
		var minuteDifference = Math.floor(delta / (1000 * 60));
		delta = (delta % (1000 * 60));
		
		var secondDifference = Math.floor(delta / 1000);
		
		if (hourDifference >= 1) {
			if (hourDifference == 1) {
				if (minuteDifference == 1) {
					return "_Duration.SingleHourSingleMinutes".loc();
				} else {
					return "_Duration.SingleHourMinutes".loc(minuteDifference);
				}
			} else {
				if (minuteDifference == 1) {
					return "_Duration.PluralHourSingleMinutes".loc(hourDifference);
				} else {
					return "_Duration.PluralHourMinutes".loc(hourDifference, minuteDifference);
				}
			}
		}
		if (minuteDifference <= 1) {
			return "_Duration.LessThanAMinute".loc();
		} else {
			return "_Duration.Minutes".loc(minuteDifference);
		}
	},
	// Returns something like "Just now", "5 min ago", or "In 2 hrs"
	localizedTimeShift: function(inDate) {
		if (!inDate) return;
		var delta = Date.now() - inDate.getTime();
		var future = (delta < 0);
		delta = Math.abs(delta);
		
		// if we're in the future, and have non-zero seconds, add a minute for more "natural" countdowns
		if (future && Math.floor((delta % (1000 * 60)) / 1000) > 0)
			delta += (1000 * 60);
		
		var dayDifference = Math.floor(delta / (1000 * 60 * 60 * 24));
		delta = (delta % (1000 * 60 * 60 * 24));
		
		if (dayDifference >= 1) {
			if (dayDifference == 1) {
				return (future) ? "_TimeDifference.InSingleDays".loc() : "_TimeDifference.SingleDaysAgo".loc();
			} else {
				return (future) ? "_TimeDifference.InPluralDays".loc(dayDifference) : "_TimeDifference.PluralDaysAgo".loc(dayDifference);
			}
		}
		
		var hourDifference = Math.floor(delta / (1000 * 60 * 60));
		delta = (delta % (1000 * 60 * 60));
		
		var minuteDifference = Math.floor(delta / (1000 * 60));
		delta = (delta % (1000 * 60));
		
		var secondDifference = Math.floor(delta / 1000);
		
		if (hourDifference >= 1) {
			if (hourDifference == 1) {
				return (future) ? "_TimeDifference.InSingleHours".loc() : "_TimeDifference.SingleHoursAgo".loc();
			} else {
				return (future) ? "_TimeDifference.InPluralHours".loc(hourDifference) : "_TimeDifference.PluralHoursAgo".loc(hourDifference);
			}
		}
		
		if (minuteDifference < 1) {
			return (future) ? "_TimeDifference.InSingleMinutes".loc() : "_TimeDifference.LessThanAMinuteAgo".loc();
		} else if (minuteDifference == 1) {
			return (future) ? "_TimeDifference.InSingleMinutes".loc() : "_TimeDifference.SingleMinutesAgo".loc();
		} else {
			return (future) ? "_TimeDifference.InPluralMinutes".loc(minuteDifference) : "_TimeDifference.PluralMinutesAgo".loc(minuteDifference);
		}
	}
};

// Localizes a string.

String.prototype.loc = function() {
	var str = globalLocalizationManager().localize(this);
	return str.fmt.apply(str, arguments);
};
