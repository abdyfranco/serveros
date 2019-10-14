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

/**
 * RemoteTimezoneService
 * Service for fetching timezone info and translating dates from other timezones.
 */
 
var RemoteTimezoneService = Class.createWithSharedInstance('timezoneService');
RemoteTimezoneService.prototype = {
	// FIXME: this whole class needs to properly account for time components in the offsets
	initialize: function() {
		this.mTZIDs = $A([]);
		this.mOffsetData = {};
	},
	getTimezoneList: function(inCallback) {
		// if we've cached the list already, return it
		if (inCallback && this.mTZIDs && this.mTZIDs.length > 0) inCallback(this.mTZIDs);
		// server response callback; parses TZIDs from the response
		var callback = function(transport) {
			// this should never happen; probably means we got invalid XML or a MIME type that isn't text/xml
			if (!transport.responseXML) {
				reportError('Report response is missing responseXML. responseText = '+transport.responseText || '');
				return false;
			}
			// extract all of the TZIDs from the XML document
			this.mTZIDs = Element.childrenWithNodeName(Element.firstChildWithNodeName(transport.responseXML, 'tzids'), 'tzid').collect(function(tzid) {
				return Element.firstNodeValue(tzid);
			});
			// run the callback, if any
			if (inCallback) inCallback(this.mTZIDs);
		}
		// send a list command to the server so we can get a list of TZIDs
		return new Ajax.CalendarRequest('/timezones?method=list', {
			method: 'post',
			onSuccess: callback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	fetchCurrentTimezoneString: function(inCallback) {
		// if we already have it, run the callback immediately
		if (this.mCurrentTimezoneString) {
			if (inCallback) inCallback(this.mCurrentTimezoneString, this.mCurrentTimezoneData);
			return null;
		}
		// otherwise, go to the server and get it
		var gotTimezoneCallback = function(transport) {
			// extract the TZ info from the calendar file
			var tempCalendarFile = new CalendarFile(transport.responseText);
			this.mCurrentTimezoneData = tempCalendarFile.mCalendarObj.VCALENDAR[0].VTIMEZONE[0];
			this.mCurrentTimezoneString = 'BEGIN:VTIMEZONE\n'
				+ tempCalendarFile.updatedCalendarText(this.mCurrentTimezoneData)
				+ '\nEND:VTIMEZONE\n';
			if (inCallback) inCallback(this.mCurrentTimezoneString, this.mCurrentTimezoneData);
		}
		return new Ajax.CalendarRequest('/timezones?method=get&tzid='+encodeURIComponent(this.selectedTimezone()), {
			method: 'post',
			onSuccess: gotTimezoneCallback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	fetchOffsetsForDateRange: function(inCallback, inStartDate, inEndDate, inOptTZID) {
		var tzid = inOptTZID || this.selectedTimezone();
		var performFetch = function(st, en) {
			var fetchCallback = function(transport) {
				// this should never happen; probably means we got invalid XML or a MIME type that isn't text/xml
				if (!transport.responseXML) {
					reportError('Report response is missing responseXML. responseText = '+transport.responseText || '');
					return false;
				}
				// extract all of the TZIDs from the XML document
				var observances = Element.childrenWithNodeName(Element.firstChildWithNodeName(transport.responseXML, 'tzdata'), 'observance');
				for (var observanceIdx = 0; observanceIdx < observances.length; observanceIdx++) {
					var observance = observances[observanceIdx];
					this.mOffsetData[tzid].offsets.push({
						startDate: parseInt(Element.firstNodeValue(Element.firstChildWithNodeName(observance, 'onset'))),
						offset: parseFloat(Element.firstNodeValue(Element.firstChildWithNodeName(observance, 'utc-offset')))
					});
				}
				// sort the TZIDs by start date
				this.mOffsetData[tzid].offsets = this.mOffsetData[tzid].offsets.sortBy(function(offset) {
					return offset.startDate;
				});
				if (inCallback) inCallback(this.mOffsetData[tzid]);
			}
			return new Ajax.CalendarRequest(
					'/timezones?method=expand&tzid='
					+ encodeURIComponent(tzid)
					+ '&start='+dateObjToISO8601(st)
					+ '&end='+dateObjToISO8601(en),
			{
				method: 'post',
				onSuccess: fetchCallback.bind(this),
				onException: reportError,
				on404: function() {
					if (tzid == this.selectedTimezone()) {
						if (!globalNotificationCenter().publish('ERROR_FROM_SERVER', this, {errorObj:{status:'404'}})) reportError('Selected timezone not found.');
						return;
					}
					this.fetchOffsetsForDateRange(inCallback, inStartDate, inEndDate);
				}.bind(this),
				errorNotificationObject: this
			});
		}.bind(this);
		// if we haven't fetched the offsets for this timezone yet, get it for +/- 5 years (TODO: should default offset buffer be configurable?)
		if (!this.mOffsetData[tzid]) {
			this.mOffsetData[tzid] = {startDate:new Date(), endDate:new Date(), offsets:$A([])};
			this.mOffsetData[tzid].startDate.setFullYear(this.mOffsetData[tzid].startDate.getFullYear()-5);
			this.mOffsetData[tzid].endDate.setFullYear(this.mOffsetData[tzid].endDate.getFullYear()+5);
			return performFetch(this.mOffsetData[tzid].startDate, this.mOffsetData[tzid].endDate);
		}
		// if we don't have timezones for the already-fetched range, extend the fetched range
		else if (inStartDate < this.mOffsetData[tzid].startDate && inEndDate > this.mOffsetData[tzid].endDate) {
			this.mOffsetData[tzid].startDate = inStartDate;
			this.mOffsetData[tzid].endDate = inEndDate;
			return performFetch(inStartDate, inEndDate);
		}
		else if (inStartDate < this.mOffsetData[tzid].startDate) {
			var req = performFetch(inStartDate, this.mOffsetData[tzid].startDate);
			this.mOffsetData[tzid].startDate = inStartDate;
			return req;
		}
		else if (inEndDate > this.mOffsetData[tzid].endDate) {
			var req = performFetch(this.mOffsetData[tzid].endDate, inEndDate);
			this.mOffsetData[tzid].endDate = inEndDate;
			return req;
		}
		// if we got this far, we already have "good enough" offset data
		if (inCallback) inCallback(this.mOffsetData[tzid]);
		return null;
	},
	fetchOffsetsForEvents: function(inCallback, inEvents, inOptStartDate, inOptEndDate) {
		if (!inEvents || inEvents.length < 1) {
			if (inCallback) inCallback();
			return false;
		}
		var smallestDate = inOptStartDate || createDateObjFromISO8601(''+(parseInt(inEvents.invoke('startDate', true, true).sort()[0])-1));
		var largestDate = inOptEndDate || createDateObjFromISO8601(''+(parseInt(inEvents.invoke('endDate', true, true).sort().last())+1));
		var tzids = inEvents.invoke('allReferencedTZIDs').flatten().uniq().without(this.selectedTimezone());
		var gotTimezoneOffsetsCallback = function() {
			if (tzids.length <= 0) {
				if (inCallback) inCallback();
				return;
			}
			this.fetchOffsetsForDateRange(gotTimezoneOffsetsCallback.bind(this), smallestDate, largestDate, tzids.pop());
		}
		this.fetchOffsetsForDateRange(gotTimezoneOffsetsCallback.bind(this), smallestDate, largestDate);
	},
	selectedTimezone: function() {
		// try and get from a cookie
		var results = document.cookie.match(/TZID=([^;]+)/);
		if (results) return results[1];
		// now try and get from a meta tag
		results = CC.meta('tzid');
		if (results) return results;
		// fall back to America/Los_Angeles because California is *obviously* the center of the universe :-)
		return 'America/Los_Angeles';
	},
	setSelectedTimezone: function(inTZID, inCallback) {
		this.mCurrentTimezoneString = null;
		this.mCurrentTimezoneData = null;
		var expireDate = new Date();
		expireDate.setFullYear(expireDate.getFullYear()+5); // 5 years is basically forever in web years
		document.cookie='TZID='+escape(inTZID)+'; path=/; expires='+expireDate.toGMTString();
		this.fetchCurrentTimezoneString(inCallback);
	},
	findOffsetForTimezone: function(inTZID, inDate) {
		var dtInt = parseInt(dateObjToISO8601(inDate));
		var offsetSearch = function(offset) {
			return offset.startDate <= dtInt;
		}
		return this.mOffsetData[inTZID].offsets.findAll(offsetSearch).last();
	},
	findOffsetForTimezoneUTCDate: function(inTZID, inUTCDate) {
		var dtInt = parseInt(dateObjToISO8601(inUTCDate));
		var offsetSearch = function(offset) {
			return offset.startDate <= dtInt;
		}
		return this.mOffsetData[inTZID].offsets.findAll(offsetSearch).last();
	},
	correctDateForTimezone: function(inDateObjOrString, inEventTZID, inOptReturnGMT) {
		// convert to a date object, if necessary
		var wasISO = (inDateObjOrString.constructor == String || inDateObjOrString.constructor == Number);
		// if we were handed a date object, make a copy. otherwise get the date from the string
		var dt = (wasISO ? createDateObjFromISO8601(''+inDateObjOrString) : new Date(inDateObjOrString.getTime()));
		// find the offsets
		var oldOffset = (wasISO && (''+inDateObjOrString).match(/Z$/) ? {offset:0} : this.findOffsetForTimezone(inEventTZID, dt));
		var newOffset = {offset:0};
		if (!inOptReturnGMT) newOffset = this.findOffsetForTimezone(this.selectedTimezone(), dt);
		// change the time by the offset differences
		if (oldOffset && newOffset) dt.setHours(dt.getHours() - (oldOffset.offset - newOffset.offset) / 100);
		// return output in the same format as input
		return (wasISO ? dateObjToISO8601(dt, false, inOptReturnGMT) : dt);
	},
	adjustUTCToLocal: function(inUTCDateString, inEventTZID) {
		// convert to a date object
		var dt = createDateObjFromISO8601(''+inUTCDateString);
		// find the offsets
		var oldOffset = {offset:0};
		var newOffset = this.findOffsetForTimezoneUTCDate(inEventTZID, dt);
		// change the time by the offset differences
		if (oldOffset && newOffset) dt.setHours(dt.getHours() - (oldOffset.offset - newOffset.offset) / 100);
		// return output in the same format as input
		return dateObjToISO8601(dt, false, false);
	}
}

/**
 * RemoteProxyService
 * Used to manage proxies (delegates) on the calendar server.
 */
var RemoteProxyService = Class.createWithSharedInstance('proxyService');
RemoteProxyService.prototype = {
	initialize: function() {
	},
	readOnlyProxies: function(inCallback, inPrincipalURL) {
		if (this.mReadOnlyProxies) {
			if (inCallback) inCallback(this.mReadOnlyProxies);
			return;
		}
		this.mReadOnlyProxies = [];
		var bodyTxt = '<?xml version="1.0" encoding="utf-8"?>\n'
		+ '<x0:propfind xmlns:x0="DAV:">\n'
		+ ' <x0:prop>\n'
		+ '  <x0:group-member-set/>\n'
		+ '  <x0:group-membership/>\n'
		+ ' </x0:prop>\n'
		+ '</x0:propfind>';
		var callback = function(transport) {
			if (!transport.responseXML) {
				debugMessage('Report response is missing responseXML. responseText = '+transport.responseText || '');
				return false;
			}
			
			Element.childrenWithNodeName(Element.firstChildWithNodeName(transport.responseXML, 'multistatus'), 'response').each(function(responseNode) {
				if (Element.firstNodeValue(Element.elementWithSimpleXPath(responseNode, 'propstat.status')).indexOf('200') >= 0) {
					var groupMemberSet = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.group-member-set');
					this.mReadOnlyProxies = Element.childrenWithNodeName(groupMemberSet, 'href').collect(function(hrefElm) {
						return Element.firstNodeValue(hrefElm);
					});
				}
			}.bind(this));
			
			if (inCallback) inCallback(this.mReadOnlyProxies);
		}
		return new Ajax.CalendarRequest(String.addSlash(inPrincipalURL) + 'calendar-proxy-read/', {
			method: 'propfind',
			contentType: 'text/xml',
			postBody: bodyTxt,
			requestHeaders: {
				Depth: '0'
			},
			onSuccess: callback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	readWriteProxies: function(inCallback, inPrincipalURL) {
		if (this.mReadWriteProxies) {
			if (inCallback) inCallback(this.mReadWriteProxies);
			return;
		}
		this.mReadWriteProxies = [];
		var bodyTxt = '<?xml version="1.0" encoding="utf-8"?>\n'
		+ '<x0:propfind xmlns:x0="DAV:">\n'
		+ ' <x0:prop>\n'
		+ '  <x0:group-member-set/>\n'
		+ '  <x0:group-membership/>\n'
		+ ' </x0:prop>\n'
		+ '</x0:propfind>';
		var callback = function(transport) {
			if (!transport.responseXML) {
				debugMessage('Report response is missing responseXML. responseText = '+transport.responseText || '');
				return false;
			}
			
			Element.childrenWithNodeName(Element.firstChildWithNodeName(transport.responseXML, 'multistatus'), 'response').each(function(responseNode) {
				if (Element.firstNodeValue(Element.elementWithSimpleXPath(responseNode, 'propstat.status')).indexOf('200') >= 0) {
					var groupMemberSet = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.group-member-set');
					this.mReadWriteProxies = Element.childrenWithNodeName(groupMemberSet, 'href').collect(function(hrefElm) {
						return Element.firstNodeValue(hrefElm);
					});
				}
			}.bind(this));
			
			if (inCallback) inCallback(this.mReadWriteProxies);
		}
		return new Ajax.CalendarRequest(String.addSlash(inPrincipalURL) + 'calendar-proxy-write/', {
			method: 'propfind',
			contentType: 'text/xml',
			postBody: bodyTxt,
			requestHeaders: {
				Depth: '0'
			},
			onSuccess: callback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	setReadOnlyProxies: function(inCallback, inPrincipalURL, inReadOnlyProxyURLs) {
		this.mReadOnlyProxies = inReadOnlyProxyURLs;
		//if (this.mReadOnlyProxies) {
		//	if (inCallback) inCallback(this.mReadOnlyProxies);
		//	return;
		//}
		var hrefs = [];
		inReadOnlyProxyURLs.each(function(proxy) {
			hrefs += '<x0:href>' + proxy + '</x0:href>\n'
		});
		var bodyTxt = '<?xml version="1.0" encoding="utf-8"?>\n'
		+ '<x0:propertyupdate xmlns:x0="DAV:">\n'
		+ ' <x0:set>\n'
		+ ' <x0:prop>\n'
		+ '  <x0:group-member-set>\n'
		+ '    %(hrefs)s\n'
		+ '   </x0:group-member-set>\n'
		+ '  </x0:prop>\n'
		+ ' </x0:set>\n'
		+ '</x0:propertyupdate>';
		bodyTxt = String.format(bodyTxt, {hrefs:hrefs});
		var callback = function(transport) {
			if (!transport.responseXML) {
				debugMessage('Report response is missing responseXML. responseText = '+transport.responseText || '');
				return false;
			}
			
			if (inCallback) inCallback(this.mReadOnlyProxies);
		}
		return new Ajax.CalendarRequest(String.addSlash(inPrincipalURL + '/calendar-proxy-read/'), {
			method: 'proppatch',
			contentType: 'text/xml',
			postBody: bodyTxt,
			requestHeaders: {
				Depth: '0'
			},
			onSuccess: callback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	setReadWriteProxies: function(inCallback, inPrincipalURL, inReadWriteProxyURLs) {
		this.mReadWriteProxies = inReadWriteProxyURLs;
		//if (this.mReadWriteProxies) {
		//	if (inCallback) inCallback(this.mReadWriteProxies);
		//	return;
		//}
		var hrefs = [];
		inReadWriteProxyURLs.each(function(proxy) {
			hrefs += '<x0:href>' + proxy + '</x0:href>\n'
		});
		var bodyTxt = '<?xml version="1.0" encoding="utf-8"?>\n'
		+ '<x0:propertyupdate xmlns:x0="DAV:">\n'
		+ ' <x0:set>\n'
		+ ' <x0:prop>\n'
		+ '  <x0:group-member-set>\n'
		+ '    %(hrefs)s\n'
		+ '   </x0:group-member-set>\n'
		+ '  </x0:prop>\n'
		+ ' </x0:set>\n'
		+ '</x0:propertyupdate>';
		bodyTxt = String.format(bodyTxt, {hrefs:hrefs});
		var callback = function(transport) {
			if (!transport.responseXML) {
				debugMessage('Report response is missing responseXML. responseText = '+transport.responseText || '');
				return false;
			}
			
			if (inCallback) inCallback(this.mReadWriteProxies);
		}
		return new Ajax.CalendarRequest(String.addSlash(inPrincipalURL + '/calendar-proxy-write/'), {
			method: 'proppatch',
			contentType: 'text/xml',
			postBody: bodyTxt,
			requestHeaders: {
				Depth: '0'
			},
			onSuccess: callback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	accountsUserCanAccess: function(inCallback, inPrincipalURL) {
		if (this.mAccountsUserCanAccess) {
			if (inCallback) inCallback(this.mAccountsUserCanAccess);
			return;
		}
		this.mAccountsUserCanAccess = [];
		var bodyTxt = '<?xml version="1.0" encoding="utf-8"?>\n'
		+ '<x0:expand-property xmlns:x0="DAV:">\n'
		+ '	<x0:property name="calendar-proxy-write-for" namespace="http://calendarserver.org/ns/">\n'
		+ '		<x0:property name="displayname"/>\n'
		+ '		<x0:property name="principal-URL"/>\n'
		+ '	</x0:property>\n'
		+ '	<x0:property name="calendar-proxy-read-for" namespace="http://calendarserver.org/ns/">\n'
		+ '		<x0:property name="displayname"/>\n'
		+ '		<x0:property name="principal-URL"/>\n'
		+ '	</x0:property>\n'
		+ '</x0:expand-property>\n';
		var callback = function(transport) {
			if (!transport.responseXML) {
				debugMessage('Report response is missing responseXML. responseText = '+transport.responseText || '');
				return false;
			}
			
			Element.childrenWithNodeName(Element.firstChildWithNodeName(transport.responseXML, 'multistatus'), 'response').each(function(responseNode) {
				if (Element.firstNodeValue(Element.elementWithSimpleXPath(responseNode, 'propstat.status')).indexOf('200') >= 0) {
					$A(['write', 'read']).each(function(accessLevel) {
						Element.childrenWithNodeName(Element.elementWithSimpleXPath(responseNode, 'propstat.prop.calendar-proxy-'+accessLevel+'-for'), 'response').each(function(proxyResponseNode) {
							this.mAccountsUserCanAccess.push({
								displayname: Element.firstNodeValue(Element.elementWithSimpleXPath(proxyResponseNode, 'propstat.prop.displayname')),
								principalURL: Element.firstNodeValue(Element.elementWithSimpleXPath(proxyResponseNode, 'propstat.prop.principal-URL.href'))
							});
						}.bind(this));
					}.bind(this));
				}
			}.bind(this));
			
			if (inCallback) inCallback(this.mAccountsUserCanAccess);
		}
		return new Ajax.CalendarRequest(String.addSlash(inPrincipalURL), {
			method: 'report',
			contentType: 'text/xml',
			postBody: bodyTxt,
			requestHeaders: {
				Depth: '0'
			},
			onSuccess: callback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	}
}

/**
 * RemotePrincipalService
 * Used for lookups of users from the calendar server.
 */
var RemotePrincipalService = Class.createWithSharedInstance('principalService');
RemotePrincipalService.prototype = {
	mDefaultStartWeekday: 0,
	initialize: function() {
		var metaPrincipalLoc = CC.meta('caldav_principal_path');
		if (metaPrincipalLoc) this.setUserPrincipal(metaPrincipalLoc);
	},
	setUserPrincipal: function(inURL, inOptPrincipalInfo) {
		this.mUserPrincipalURL = inURL;
		this.mUserPrincipalInfo = inOptPrincipalInfo;
	},
	getPrincipalInfo: function(inCallback) {
		if (this.mUserPrincipalInfo) {
			if (inCallback) inCallback(this.mUserPrincipalInfo);
			return;
		}
		var reportTxt = '<?xml version="1.0" encoding="utf-8" ?>\n'
		+ '<D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">\n'
		+ '	<D:prop><D:displayname/><C:calendar-home-set/><C:calendar-user-address-set/><C:schedule-inbox-URL/><C:schedule-outbox-URL/><C:calendar-user-type/></D:prop>\n'
		+ '</D:propfind>';
		var callback = function(transport) {
			if (!transport.responseXML) {
				debugMessage('Report response is missing responseXML. responseText = '+transport.responseText || '');
				return false;
			}
			var validProp = Element.childrenWithNodeName(Element.elementWithSimpleXPath(transport.responseXML, 'multistatus.response'), 'propstat').detect(function(propstat) {
				return Element.firstNodeValue(Element.firstChildWithNodeName(propstat, 'status')).match(/\s200\s/);
			});
			if (validProp) {
				var displayname = Element.elementWithSimpleXPath(validProp, 'prop.displayname');
				var calendarhome = Element.elementWithSimpleXPath(validProp, 'prop.calendar-home-set.href');
				if (!calendarhome) {
					if (!globalNotificationCenter().publish('ERROR_FROM_SERVER', this, {errorObj:{status:'404'}})) reportError('Principal is not allowed a calendar');
					return;
				}
				var inboxurl = Element.elementWithSimpleXPath(validProp, 'prop.schedule-inbox-URL.href');
				var outboxurl = Element.elementWithSimpleXPath(validProp, 'prop.schedule-outbox-URL.href');
				var calendarUserType = Element.elementWithSimpleXPath(validProp, 'prop.calendar-user-type');
				var calendarUserAddressSet = Element.childrenWithNodeName(Element.elementWithSimpleXPath(validProp, 'prop.calendar-user-address-set'), 'href').collect(function(hrefElm) {
					return Element.firstNodeValue(hrefElm);
				});
				if (displayname && calendarhome) {
					this.mUserPrincipalInfo = {
						href: this.mUserPrincipalURL,
						uid: this.mUserPrincipalURL,
						url: Element.firstNodeValue(calendarhome),
						displayname: Element.firstNodeValue(displayname),
						inboxurl: Element.firstNodeValue(inboxurl),
						outboxurl: Element.firstNodeValue(outboxurl),
						calendarUserType: Element.firstNodeValue(calendarUserType),
						calendarUserAddressSet: calendarUserAddressSet
					};
				}
			}
			if (inCallback) inCallback(this.mUserPrincipalInfo);
		}
		return new Ajax.CalendarRequest(String.addSlash(this.mUserPrincipalURL), {
			method: 'propfind',
			contentType: 'text/xml',
			postBody: reportTxt,
			requestHeaders: {
				Depth: '0'
			},
			onSuccess: callback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	checkOtherPrincipalExistence: function(inOtherPrincipalPath, inCallback) {
		return new Ajax.CalendarRequest(String.addSlash(inOtherPrincipalPath), {
			method: 'get',
			onComplete: function(response) {
				inCallback(response.status == 200);
			},
			parameters: $H({})
		});
	},
	iCalSubscriptionURLPrefix: function() {
		var hrefUrl = this.mUserPrincipalInfo.calendarUserAddressSet.detect(function(href) {return href.match(/^https*:\/\/[^\/]+\//)});
		if (!hrefUrl) return '';
		// 6946310
		var schemeAdjustedURL = hrefUrl.match(/^https*:\/\/[^\/]+\//)[0].replace(/^https?:/, 'webcal:');
		// 7044241
		var portAdjustedURL = schemeAdjustedURL.replace(/:[\d]+\//, ':8008/');
		return portAdjustedURL;
	},
	principalToCalendarUserTypeMap: { 'users': 'INDIVIDUAL',
									  'locations': 'ROOM',
									  'groups': 'GROUP',
									  'resources': 'RESOURCE' },
	getMatchingUsers: function(inCallback, inSearchString, inSearchTypes) {
		if (!inSearchString || !inSearchString.match(/\S/)) {
			inCallback($A([]));
			return false;
		}
		// ##9422831
		var reportTxt = '<?xml version="1.0" encoding="utf-8" ?>\n'
			+ '<x0:principal-property-search xmlns:x2="urn:ietf:params:xml:ns:caldav" xmlns:x0="DAV:" xmlns:x1="http://calendarserver.org/ns/" test="anyof">\n'
			+ '<x0:property-search>\n'
			+ '<x0:prop><x0:displayname/></x0:prop>\n'
			+ '<x0:match match-type="starts-with">%(q)s</x0:match>\n'
			+ '</x0:property-search>\n'
			+ '<x0:property-search>\n'
			+ '<x0:prop><x1:email-address-set/></x0:prop>\n'
			+ '<x0:match match-type="starts-with">%(q)s</x0:match>\n'
			+ '</x0:property-search>\n'
			+ '<x0:property-search>\n'
			+ '<x0:prop><x1:first-name/></x0:prop>\n'
			+ '<x0:match match-type="starts-with">%(q)s</x0:match>\n'
			+ '</x0:property-search>\n'
			+ '<x0:property-search>\n'
			+ '<x0:prop><x1:last-name/></x0:prop>\n'
			+ '<x0:match match-type="starts-with">%(q)s</x0:match>\n'
			+ '</x0:property-search>\n'
			+ '<x0:prop>\n'
			+ '<x1:email-address-set/>\n'
			+ '<x1:first-name/>\n'
			+ '<x2:calendar-user-address-set/>\n'
			+ '<x2:calendar-user-type/>\n'
			+ '<x2:calendar-home-set/>\n'
			+ '<x1:last-name/>\n'
			+ '<x0:displayname/>\n'
			+ '<x1:record-type/>\n'
			+ '<x0:principal-URL/>\n'
			+ '</x0:prop>\n'
			+ '</x0:principal-property-search>';
		reportTxt = String.format(reportTxt, {q:inSearchString.escapeHTML()});
		var callback = function(transport) {
			if (!transport.responseXML) {
				debugMessage('Report response is missing responseXML. responseText = '+transport.responseText || '');
				return false;
			}
			var wantedCalUserTypes = inSearchTypes.collect(function(el) { return this.principalToCalendarUserTypeMap[el]; }.bind(this)).compact();
			var matchingUsers = $A([]);
			var responseNodes = Element.childrenWithNodeName(Element.firstChildWithNodeName(transport.responseXML, 'multistatus'), 'response');
			for (var responseNodeIdx = 0; responseNodeIdx < responseNodes.length; responseNodeIdx++) {
				var responseNode = responseNodes[responseNodeIdx];
				var href = Element.firstChildWithNodeName(responseNode, 'href').firstChild.nodeValue;
				var statusElm = Element.elementWithSimpleXPath(responseNode, 'propstat.status');
				if (statusElm && statusElm.firstChild && statusElm.firstChild.nodeValue && statusElm.firstChild.nodeValue.match(/\s200\sOK\s*$/)) {
					var displayname = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.displayname');
					var usertype = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.calendar-user-type');
					var calendarhome = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.calendar-home-set.href');
					var displaynameValue = Element.firstNodeValue(displayname);
					var usertypeValue = Element.firstNodeValue(usertype);
					var calendarhomeValue = Element.firstNodeValue(calendarhome);
					if (displayname && calendarhome && wantedCalUserTypes.include(usertypeValue)) {
						matchingUsers.push({
							href: href,
							uid: href,
							url: calendarhomeValue,
							displayname: displaynameValue,
							cutype: usertypeValue
						});
					}
				}
			}
			if (inCallback) inCallback(transport.request, matchingUsers);
		}
		return new Ajax.CalendarRequest('/principals/'+inSearchTypes[0]+'/', { // TODO: support more than one principal search type
			method: 'report',
			contentType: 'text/xml',
			postBody: reportTxt,
			requestHeaders: {
				Depth: '0'
			},
			onSuccess: callback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	isIndividual: function() {
		return (this.mUserPrincipalInfo.calendarUserType == 'INDIVIDUAL');
	},
	startWeekday: function() {
		var results = document.cookie.match(/startWeekday=(\d)/);
		return (results ? parseInt(results[1]) : this.mDefaultStartWeekday);
	},
	setStartWeekday: function(inWeekdayInt) {
		var expireDate = new Date();
		expireDate.setFullYear(expireDate.getFullYear()+5); // 5 years is basically forever in web years
		document.cookie='startWeekday='+inWeekdayInt+'; path=/; expires='+expireDate.toGMTString();
		globalNotificationCenter().publish('START_WEEKDAY_CHANGED', this, {startWeekday:inWeekdayInt});
	}
}


/**
 * RemoteCalendarCollection
 * Represents a calendar collection.
 */
var RemoteCalendarCollection = Class.create();
RemoteCalendarCollection.prototype = {
	mDefaultCalendarColorIdx: 0,
	initialize: function(inCollectionBasePath) {
		this.mDefaultCalendarColors = RemoteCalendarCollection.defaultCalendarColors;
		this.mCollectionBasePath = inCollectionBasePath;
		this.mCanWriteContent = true;
		this.mCanWriteProperties = true;
		this.getCalendars();
	},
	nextAvailableCalendarColor: function(inOptExceptionArray) {
		if (!inOptExceptionArray) inOptExceptionArray = $A([]);
		var calendarColorsCopy = this.mDefaultCalendarColors.clone();
		this.mCalendars.each(function(calObj) {
			var colorIdx = calendarColorsCopy.indexOf(calObj.mColor);
			if (colorIdx >= 0 && inOptExceptionArray.indexOf(calObj) < 0) {
				calendarColorsCopy.splice(colorIdx, 1);
			}
		});
		if (calendarColorsCopy.length > 0) {
			return calendarColorsCopy[0];
		}
		return this.mDefaultCalendarColors[(this.mDefaultCalendarColorIdx++) % this.mDefaultCalendarColors.length];
	},
	getCalendars: function() {
		var callback = function(transport) {
			this.mInboxCalendar = null;
			this.mOutboxCalendar = null;
			this.mDefaultCalendarURL = null;
			this.mDefaultTasksURL = null;
			this.mCalendars = $A([]);
			var calendarsNeedingColors = $A([]);
			if (!transport.responseXML) {
				reportError('Report response is missing responseXML. responseText = '+transport.responseText || '');
				return false;
			}
			Element.childrenWithNodeName(Element.firstChildWithNodeName(transport.responseXML, 'multistatus'), 'response').each(function(responseNode) {
				var href = Element.firstNodeValue(Element.firstChildWithNodeName(responseNode, 'href'));
				var resourceType = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.resourcetype');
				var isCollection = Element.firstChildWithNodeName(resourceType, 'collection');
				var calPrivilegeSet = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.current-user-privilege-set');
				var userCanWriteContent = calPrivilegeSet ? (calPrivilegeSet.getElementsByTagName('write-content').length > 0) : false;
				var userCanWriteProperties = calPrivilegeSet ? (calPrivilegeSet.getElementsByTagName('write-properties').length > 0) : false;
				var needsColor = false;
				if (href == this.mCollectionBasePath) {
					this.mCanWriteContent = userCanWriteContent;
					this.mCanWriteProperties = userCanWriteProperties;
				}
				else if (isCollection && (href != this.mCollectionBasePath)) {
					// closure function to create a calendar
					var createCalendar = function(inOptCreateColor) {
						var displayName = Element.firstNodeValue(Element.elementWithSimpleXPath(responseNode, 'propstat.prop.displayname'));
						var calendarColor = Element.firstNodeValue(Element.elementWithSimpleXPath(responseNode, 'propstat.prop.calendar-color'));
						var ctag = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.getctag');
						if (inOptCreateColor && !calendarColor) {
							calendarColor = this.mDefaultCalendarColors[0];
							needsColor = true;
						}
						var createdCal = new RemoteCalendar(this, href, displayName, calendarColor);
						createdCal.mCanWriteContent = userCanWriteContent;
						createdCal.mCanWriteProperties = userCanWriteProperties;
						if (ctag) createdCal.mCtag = Element.firstNodeValue(ctag);
						return createdCal;
					}.bind(this);
					// put a calendar in the proper bucket
					if (Element.firstChildWithNodeName(resourceType, 'schedule-inbox')) {
						this.mInboxCalendar = createCalendar();
						var defaultCalendarEl = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.schedule-default-calendar-URL.href');
						if (defaultCalendarEl)
							this.mDefaultCalendarURL = Element.firstNodeValue(defaultCalendarEl);
						var defaultTasksEl = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.schedule-default-tasks-URL.href');
						if (defaultTasksEl)
							this.mDefaultTasksURL = Element.firstNodeValue(defaultTasksEl);
					}
					else if (Element.firstChildWithNodeName(resourceType, 'schedule-outbox')) {
						this.mOutboxCalendar = createCalendar();
					}
					else if (Element.firstChildWithNodeName(resourceType, 'calendar')) {
						var supportsEvents = false;
						var supported = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.supported-calendar-component-set');
						if (supported) {
							Element.childrenWithNodeName(supported, 'comp').each(function(compNode) {
								if (Element.firstNodeValue(compNode.attributes.getNamedItem('name')) == 'VEVENT')
									supportsEvents = true;
							}.bind(this));
						} else
							supportsEvents = true;
						if (supportsEvents) {
							var calObj = createCalendar(true);
							this.mCalendars.push(calObj);
							if (needsColor) calendarsNeedingColors.push(calObj);
						}
					}
				}
			}.bind(this));
			// sort the calendars alphabetically
			this.mCalendars = Array.sortArrayUsingKey(this.mCalendars, 'mDisplayName');
			// set colors for calendars that don't have them
			calendarsNeedingColors = Array.sortArrayUsingKey(calendarsNeedingColors, 'mDisplayName');
			this.mDefaultCalendarColorIdx = 0;
			while (calendarsNeedingColors.length > 0) {
				var calObj = calendarsNeedingColors[0];
				calObj.mColor = this.nextAvailableCalendarColor(calendarsNeedingColors);
				calendarsNeedingColors.shift();
				calObj.renameCalendar(calObj.mDisplayName, calObj.mColor, null, true);
			}
			// FIXME: create a calendar if we don't have one
			globalNotificationCenter().publish('GOT_CALENDAR_COLLECTION', this);
		}
		return new Ajax.CalendarRequest(this.mCollectionBasePath, {
			method: 'propfind',
			contentType: 'application/xml',
			postBody: '<?xml version="1.0" ?><D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav" xmlns:I="http://apple.com/ns/ical/" xmlns:CS="http://calendarserver.org/ns/"><D:prop><D:displayname/><D:resourcetype/><D:current-user-privilege-set/><I:calendar-color/><CS:getctag/><C:supported-calendar-component-set/><C:schedule-default-calendar-URL/><CS:schedule-default-tasks-URL/></D:prop></D:propfind>',
			requestHeaders: {
				Depth: '1'
			},
			onSuccess: callback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	updateCalendarCTags: function(inCallback) { // use this method to quickly see which calendars have changed
		var callback = function(transport) {
			if (!transport.responseXML) {
				reportError('Report response is missing responseXML. responseText = '+transport.responseText || '');
				return false;
			}
			var updatedCalendars = $A([]);
			Element.childrenWithNodeName(Element.firstChildWithNodeName(transport.responseXML, 'multistatus'), 'response').each(function(responseNode) {
				var href = Element.firstNodeValue(Element.firstChildWithNodeName(responseNode, 'href'));
				var resourceType = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.resourcetype');
				var isCollection = Element.firstChildWithNodeName(resourceType, 'collection');
				var ctag = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.getctag');
				if (isCollection && (href != this.mCollectionBasePath)) {
					// see if we know about a calendar with this href
					var cal = this.calendarWithPath(href);
					// if there are no ctags, revert back to always assuming it's updated. Otherwise, compare cached ctags.
					var isUpdated = (!cal || !cal.mCtag || !ctag || cal.mCtag != Element.firstNodeValue(ctag));
					// if there is a ctag and we found a calendar, update the cached ctag
					if (cal && ctag && Element.firstNodeValue(ctag)) cal.mCtag = Element.firstNodeValue(ctag);
					// if it's the inbox, flag the result to let clients know
					if (cal && cal == this.mInboxCalendar) {
						if (isUpdated) updatedCalendars.shouldFetchInbox = true;
					}
					// if we know about the calendar and it's updated, add it to the array
					else if (cal) {
						if (isUpdated) updatedCalendars.push(cal);
					}
					// if it's a new calendar, flag that the collection itself needs to be refetched
					else if (Element.firstChildWithNodeName(resourceType, 'calendar') && href != this.mOutboxCalendar.mCalendarBasePath) {
						updatedCalendars.shouldFetchCollection = true;
					}
				}
			}.bind(this));
			if (inCallback) inCallback(updatedCalendars);
		}
		return new Ajax.CalendarRequest(this.mCollectionBasePath, {
			method: 'propfind',
			contentType: 'application/xml',
			postBody: '<?xml version="1.0" ?><D:propfind xmlns:D="DAV:" xmlns:CS="http://calendarserver.org/ns/"><D:prop><D:resourcetype/><CS:getctag/></D:prop></D:propfind>',
			requestHeaders: {Depth:'1'},
			onSuccess: callback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	calendarWithPath: function(inPath) {
		// handle relative paths
		var path = (inPath.indexOf('/') != 0) ? String.addSlash(String.appendPathComponent(this.mCollectionBasePath, inPath)) : inPath;
		// inbox?
		if (String.addSlash(this.mInboxCalendar.mCalendarBasePath) == path) return this.mInboxCalendar;
		// iterate through other calendars
		return this.mCalendars.detect(function(calObj) {
			return (String.addSlash(calObj.mCalendarBasePath) == path);
		});
	},
	getInboxContents: function(inCallback) {
		var gotInboxCallback = function(transport) {
			var request = null;
			// fish out the href values for all responses whose type is text/calendar
			var hrefs = $A([]);
			Element.childrenWithNodeName(Element.firstChildWithNodeName(transport.responseXML, 'multistatus'), 'response').each(function(responseNode) {
				if (Element.firstNodeValue(Element.elementWithSimpleXPath(responseNode, 'propstat.prop.getcontenttype')).match(/^(text\/calendar|application\/xml)/)) {
					hrefs.push(Element.firstNodeValue(Element.firstChildWithNodeName(responseNode, 'href')));
				}
				else if (Element.firstNodeValue(Element.firstChildWithNodeName(responseNode, 'href')) == this.mInboxCalendar.mCalendarBasePath) {
					// track availability calendar (if any)
					var availElm = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.calendar-availability');
					if (availElm && Element.firstNodeValue(availElm) && Element.firstNodeValue(availElm).match(/\S/)) {
						var availCal = new CalendarFile(Element.firstNodeValue(availElm), this.mInboxCalendar.mCalendarBasePath, this.mInboxCalendar);
						if (availCal.mCalendarObj.VCALENDAR[0].VAVAILABILITY && availCal.mCalendarObj.VCALENDAR[0].VAVAILABILITY[0].AVAILABLE && availCal.mCalendarObj.VCALENDAR[0].VAVAILABILITY[0].AVAILABLE.length == 1) {
							var availability = new CalendarEvent(availCal, availCal.mCalendarObj.VCALENDAR[0].VAVAILABILITY[0].AVAILABLE[0]);
							if (availability.recurrenceInfo() && availability.recurrenceInfo().isWeekdays()) this.mAvailability = availability;
						}
					}
				}
			}, this);
			// if we didn't get any vaild hrefs back, make the callback with an empty array and bail
			if (hrefs.length <= 0) {
				if (this.mAvailability) {
					// get availability timezone offsets
					var timezoneCallback = function() {
						if (inCallback) inCallback(request, $A([]));
					}
					timezoneService().fetchOffsetsForEvents(timezoneCallback, $A([this.mAvailability]));
				}
				else {
					if (inCallback) inCallback(request, $A([]));
					return;
				}
			}
			// callback for after we get the inbox calendar files
			var inboxMultigetCallback = function(transport) {
				var calendarEvents = $A([]);
				Element.childrenWithNodeName(Element.firstChildWithNodeName(transport.responseXML, 'multistatus'), 'response').each(function(responseNode) {
					if (Element.firstNodeValue(Element.elementWithSimpleXPath(responseNode, 'propstat.status')).indexOf('200') >= 0) {
						var href = Element.firstNodeValue(Element.firstChildWithNodeName(responseNode, 'href'));
						var calendarText = Element.firstNodeValue(Element.elementWithSimpleXPath(responseNode, 'propstat.prop.calendar-data'));
						var calendarFile = new CalendarFile(calendarText, href, this.mInboxCalendar);
						calendarEvents = calendarEvents.concat(calendarFile.mEvents);
					}
				}, this);
				// get the timezone data for all of the events
				var timezoneCallback = function() {
					if (inCallback) inCallback(request, calendarEvents);
				}
				var timezoneEvents = calendarEvents.clone();
				if (this.mAvailability) timezoneEvents.push(this.mAvailability);
				timezoneService().fetchOffsetsForEvents(timezoneCallback, timezoneEvents);
			}
			// get the inbox calendar files
			// TODO: combine this multiget with the one below, this is pasted code which is bad
			var multiGetText = '<?xml version="1.0" encoding="utf-8" ?>\n'
				+ '<C:calendar-multiget xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">\n'
				+ '	<D:prop>\n'
				+ '		<D:getetag/>\n'
				+ '		<C:calendar-data/>\n'
				+ '	</D:prop>\n'
				+ '%(hrefs)s\n'
				+ '</C:calendar-multiget>';
			var hrefText = '<D:href>%(href)s</D:href>';
			// build a multi-get string
			multiGetText = String.format(multiGetText, {hrefs:hrefs.collect(function(href) {
				return String.format(hrefText, {href:href});
			}).join('\n')});
			// make a multi-get request
			new Ajax.CalendarRequest(this.mInboxCalendar.mCalendarBasePath, {
				method: 'report',
				contentType: 'application/xml',
				postBody: multiGetText,
				onSuccess: inboxMultigetCallback.bind(this),
				onException: reportError,
				errorNotificationObject: this
			});
		}
		request = new Ajax.CalendarRequest(this.mInboxCalendar.mCalendarBasePath, {
			method: 'propfind',
			contentType: 'application/xml',
			postBody: '<?xml version="1.0" ?><D:propfind xmlns:D="DAV:" xmlns:CS="http://calendarserver.org/ns/"><D:prop><CS:calendar-availability/><D:getetag/><D:getcontenttype/></D:prop></D:propfind>',
			requestHeaders: {
				Depth: '1'
			},
			onSuccess: gotInboxCallback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
		return request;
	},
	getEventsForDateRange: function(inStartDate, inEndDate, inCallback) {
		var requestUID = CalendarUuid.generateUUIDString();
		var gotTimezonesCallback = function() {
			var requestCount = this.mCalendars.length; // so we know when we're done with our requests
			var eventsToReturn = $A([]);
			var request = null;
			var calendarResultsCallback = function(inRequestObj, inResponseObj) {
				eventsToReturn = eventsToReturn.concat(inResponseObj);
				if (--requestCount <= 0) {
					var gotTimezoneOffsetsCallback = function() {
						// remove duplicates, favoring events that aren't in the inbox
						var inboxCalendar = this.mInboxCalendar; // so we don't have to bother binding
						eventsToReturn = Array.removeDuplicateRows(eventsToReturn, function(inEarlier, inLater) {
							return (inEarlier.uid == inLater.uid && inEarlier.mParentCalendarFile == inboxCalendar);
						});
						inCallback(requestUID, eventsToReturn);
					}
					timezoneService().fetchOffsetsForEvents(gotTimezoneOffsetsCallback.bind(this), eventsToReturn, inStartDate, inEndDate);
				}
			}
			// generate requests for each of the other calendars, unless they're disabled
			this.mCalendars.each(function(cal) {
				request = cal.getEventsForDateRange(inStartDate, inEndDate, calendarResultsCallback);
			});
			if (!request) { // all calendars are unselected
				setTimeout(function() {inCallback(requestUID, eventsToReturn)}, 10);
			}
		}
		timezoneService().fetchOffsetsForDateRange(gotTimezonesCallback.bind(this), inStartDate, inEndDate);
		return requestUID;
	},
	findEquivalentToInboxCalendarEvent: function(inCalendarEvent, inCallback) {
		// Given an event which may be in the inbox, find the equivalent non-inbox event.
		// May return null if the event only exists in the inbox. (no default calendar)
		var eventWindow = 3; // Days
		var startDate = inCalendarEvent.startDate();
		startDate.setHours(0);
		startDate.setMinutes(0);
		startDate.setSeconds(0);
		startDate.setDate(startDate.getDate()-eventWindow);
		var endDate = new Date(startDate.getTime());
		endDate.setDate(endDate.getDate()+(eventWindow*2));
		// get the matching calendar events on the start date of the inbox event
		var gotCalendarEventsCallback = function(inRequest, inEvents) {
			var matchingEvents = inEvents.select(function(event){
				return event.valueForProperty('UID') == inCalendarEvent.valueForProperty('UID') &&
					   event.mParentCalendarFile.mParentCalendar != this.mInboxCalendar &&
					   event.mParentCalendarFile.mFileLocation.indexOf('/inbox/') == -1; // :(
			});

			if (matchingEvents.length > 0)
			{

				if (inCallback) inCallback(matchingEvents[0]);
				return;
			}

			if (inCallback) inCallback(null);
		}
		this.getEventsForDateRange(startDate, endDate, gotCalendarEventsCallback.bind(this));
	},
	setWeekdayAvailability: function(inStartTime, inEndTime, inCallback) {
		var gotTimezoneStringCallback = function() {
			// move the start time's date to monday
			var delta = inStartTime.getDay() - 1;
			inStartTime.setDate(inStartTime.getDate() - delta);
			// move the end time's date to the same as the start time's date
			inEndTime.setFullYear(inStartTime.getFullYear());
			inEndTime.setMonth(inStartTime.getMonth());
			inEndTime.setDate(inStartTime.getDate());
			// create a calendar event
			var availabilityEvent = this.mInboxCalendar.createCalendarEvent();
			// set the start/end time
			availabilityEvent.setStartDate(inStartTime);
			availabilityEvent.setEndDate(inEndTime);
			availabilityEvent.convertEventDurationToEndDate();
			// set the RRULE (for v1, always weekdays)
			availabilityEvent.setPropertyValue('RRULE', 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR');
			// delete the description (not needed here)
			availabilityEvent.mParentCalendarFile.deleteKeyFromMember('DESCRIPTION', availabilityEvent.mEventStruct);
			// this is a AVAILABLE, not a VEVENT
			var availabilityText = availabilityEvent.mParentCalendarFile.updatedCalendarText();
			var uuid = CalendarUuid.generateUUIDString();
			var dtstamp = dateObjToISO8601(new Date(), true, true);
			availabilityText = availabilityText.replace(/BEGIN:VTIMEZONE/m, 'CALSCALE:GREGORIAN\nBEGIN:VTIMEZONE');
			availabilityText = availabilityText.replace(/BEGIN:VEVENT/m, 'BEGIN:VAVAILABILITY\nUID:'+uuid+'\nDTSTAMP:'+dtstamp+'\nCREATED:'+dtstamp+'\nBEGIN:AVAILABLE');
			availabilityText = availabilityText.replace(/END:VEVENT/m, 'END:AVAILABLE\nEND:VAVAILABILITY');
			// save the event to the server
			var requestBody = '<?xml version="1.0" encoding="utf-8" ?>\n'
				+ '<D:propertyupdate xmlns:D="DAV:" xmlns:CS="http://calendarserver.org/ns/">\n'
				+ '	<D:set>\n'
				+ '		<D:prop>\n'
				+ '			<CS:calendar-availability><![CDATA[%(availabilityText)s]]></CS:calendar-availability>\n'
				+ '		</D:prop>\n'
				+ '	</D:set>\n'
				+ '</D:propertyupdate>';
			requestBody = String.format(requestBody, {availabilityText:availabilityText.escapeHTML()});
			var savedAvailabilityCallback = function() {
				this.mAvailability = availabilityEvent;
				if (inCallback) inCallback(availabilityEvent);
			}
			new Ajax.CalendarRequest(this.mInboxCalendar.mCalendarBasePath, {
				method: 'proppatch',
				contentType: 'text/xml',
				postBody: requestBody,
				requestHeaders: {
					Depth: '0'
				},
				onSuccess: savedAvailabilityCallback.bind(this),
				onException: reportError,
				errorNotificationObject: this
			});
			if (inCallback) inCallback();
		}
		timezoneService().fetchCurrentTimezoneString(gotTimezoneStringCallback.bind(this));
	},
	userCanWriteContent: function() {
		return this.mCanWriteContent;
	},
	userCanWriteProperties: function() {
		return this.mCanWriteProperties;
	},
	makeCalendar: function(inCalendarName, inCallback, inOptCalendarColor) {
		var calendarcolor = inOptCalendarColor || this.nextAvailableCalendarColor();
		var makeCalendarText = '<?xml version="1.0" encoding="utf-8" ?>\n'
			+ '<C:mkcalendar xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav" xmlns:I="http://apple.com/ns/ical/">\n'
			+ '	<D:set>\n'
			+ '	<D:prop>\n'
			+ '		<D:displayname>%(displayname)s</D:displayname>\n'
			+ '		<I:calendar-color>%(calendarcolor)s</I:calendar-color>\n'
			+ '		<C:schedule-calendar-transp><C:opaque/></C:schedule-calendar-transp>\n'
			+ '	</D:prop>\n'
			+ '	</D:set>\n'
			+ '</C:mkcalendar>';
		makeCalendarText = String.format(makeCalendarText, {displayname:inCalendarName.escapeHTML(), calendarcolor:calendarcolor.escapeHTML()});
		var mkCalCallback = function(transport) {
			this.getCalendars();
			if (inCallback) inCallback();
		}
		return new Ajax.CalendarRequest(String.addSlash(this.mCollectionBasePath) + CalendarUuid.generateUUIDString() + '/', {
			method: 'mkcalendar',
			contentType: 'application/xml',
			postBody: makeCalendarText,
			onSuccess: mkCalCallback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	deleteCalendar: function(inCalendar, inCallback) {
		var calendarIdx = this.mCalendars.length;
		while (--calendarIdx >= 0) {
			if (this.mCalendars[calendarIdx] == inCalendar) {
				return new Ajax.CalendarRequest(inCalendar.mCalendarBasePath, {
					method: 'delete',
					onSuccess: function() {
						this.mCalendars.splice(calendarIdx--, 1);
						if (inCallback) inCallback();
					}.bind(this),
					onException: reportError,
					errorNotificationObject: this
				});
			}
		}
	}
}
RemoteCalendarCollection.defaultCalendarColors = $A(['#0052D3', '#2CA00A', '#E41616', '#F57700', '#AF26AD', '#492BA0']);


/**
 * RemoteCalendar
 * Proxy object to a CalDAV server.
 * Note: Everything must be on the same hostname and port.
 */
var RemoteCalendar = Class.create();
RemoteCalendar.prototype = {
	initialize: function(inParentCollection, inCalendarBasePath, inOptDisplayName, inOptColor) {
		this.mParentCollection = inParentCollection;
		this.mCalendarBasePath = inCalendarBasePath;
		this.mLastPathComponent = String.lastPathComponent(inCalendarBasePath);
		this.mDisplayName = (inOptDisplayName && inOptDisplayName.match(/\S/)) ? inOptDisplayName : this.mLastPathComponent;
		this.mColor = (inOptColor && inOptColor.match(/^#[0-9A-Fa-f]{6}/)) ? inOptColor : '#0067C3'; // FIXME: hard-coding blue for calendar colors; pick randomly from a palette
		// The server gives us an opacity component, which we'll ignore
		this.mColor = this.mColor.substr(0, 7);
		this.mEnabled = true;
		this.mCanWriteContent = true;
		this.mCanWriteProperties = true;
	},
	pathForNewEvents: function() {
		return this.mCalendarBasePath.replace(/\/$/, '') + '/';
	},
	userCanWriteContent: function() {
		return this.mCanWriteContent;
	},
	userCanWriteProperties: function() {
		return this.mCanWriteProperties;
	},
	isDefault: function() {
		var basePath = String.addSlash(this.mCalendarBasePath);
		var defCalPath = (this.mParentCollection.mDefaultCalendarURL) ? String.addSlash(this.mParentCollection.mDefaultCalendarURL) : '';
		var defTasksPath = (this.mParentCollection.mDefaultTasksURL) ? String.addSlash(this.mParentCollection.mDefaultTasksURL) : '';
		return (basePath == defCalPath || basePath == defTasksPath);
	},
	iCalSubscriptionURL: function() {
		return String.appendPathComponent(principalService().iCalSubscriptionURLPrefix(), this.mCalendarBasePath).replace(/\/$/, '');
	},
	shareCalendar: function(inCallback) {
		var gotSharedCalendarResponse = function(transport) {
			if (inCallback) inCallback();
		}
		return new Ajax.CalendarRequest(this.mCalendarBasePath.replace(/\/$/, '')+'/?action=share', {
			method: 'get',
			onSuccess: gotSharedCalendarResponse.bind(this),
			onException: reportError,
			errorNotificationObject: this,
			parameters: $H({})
		});
	},
	renameCalendar: function(inDisplayName, inOptColor, inCallback, inOptForceColorSave) {
		var requestBody = '<?xml version="1.0" encoding="utf-8" ?>\n'
			+ '<D:propertyupdate xmlns:D="DAV:" xmlns:CS="http://calendarserver.org/ns/" xmlns:I="http://apple.com/ns/ical/">\n'
			+ '	<D:set>\n'
			+ '		<D:prop>\n'
			+ '		%(displaynameprop)s\n'
			+ '		%(calendarcolorprop)s\n'
			+ '		</D:prop>\n'
			+ '	</D:set>\n'
			+ '</D:propertyupdate>';
		var displaynameprop = '';
		if (inDisplayName && inDisplayName.match(/\S/) && inDisplayName != this.mDisplayName) {
			this.mDisplayName = inDisplayName;
			displaynameprop = '<D:displayname>'+inDisplayName.escapeHTML()+'</D:displayname>';
		}
		var calendarcolorprop = '';
		if (inOptColor && inOptColor.match(/\S/) && (inOptForceColorSave || inOptColor != this.mColor)) {
			this.mColor = inOptColor;
			calendarcolorprop = '<I:calendar-color>'+inOptColor.toUpperCase().escapeHTML()+'</I:calendar-color>';
		}
		if (displaynameprop == '' && calendarcolorprop == '') {
			if (inCallback) inCallback();
			return;
		}
		requestBody = String.format(requestBody, {displaynameprop:displaynameprop, calendarcolorprop:calendarcolorprop});
		var savedDisplayNameCallback = function() {
			this.mDisplayName = inDisplayName;
			if (inCallback) inCallback();
		}
		return new Ajax.CalendarRequest(this.mCalendarBasePath, {
			method: 'proppatch',
			contentType: 'text/xml',
			postBody: requestBody,
			requestHeaders: {
				Depth: '0'
			},
			onSuccess: savedDisplayNameCallback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	createCalendarEvent: function() {
		var cfile = new CalendarFile(null, null, this);
		cfile.mEvents[0].mIsNew = true;
		return cfile.mEvents[0];
	},
	parseResponse: function(transport) {
		var calendarFiles = new Hash();
		var calendarEvents = $A([]);
		if (!transport.responseXML) {
			debugMessage('Report response is missing responseXML. responseText = '+transport.responseText || '');
			return false;
		}
		var responseNodes = Element.childrenWithNodeName(Element.firstChildWithNodeName(transport.responseXML, 'multistatus'), 'response');
		for (var responseNodeIdx = 0; responseNodeIdx < responseNodes.length; responseNodeIdx++) {
			var responseNode = responseNodes[responseNodeIdx];
			var status = Element.elementWithSimpleXPath(responseNode, 'propstat.status').firstChild.nodeValue;
			if (!status.match(/200/)) continue; // bail for not-found responses
			var scheduleTagElm = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.schedule-tag');
			var fileLocation = Element.firstChildWithNodeName(responseNode, 'href').firstChild.nodeValue;
			var calendarText = Element.elementWithSimpleXPath(responseNode, 'propstat.prop.calendar-data').firstChild.nodeValue;
			var calendarFile = new CalendarFile(calendarText, fileLocation, this);
			if (scheduleTagElm) {
				calendarFile.mScheduleTag = scheduleTagElm.firstChild.nodeValue;
			}
			calendarEvents = calendarEvents.concat(calendarFile.mEvents);
			calendarFiles.set(fileLocation, calendarFile);
		}
		return {calendarFiles:calendarFiles, calendarEvents:calendarEvents};
	},
	runReport: function(inReportText, inCallback) {
		var multiGetText = '<?xml version="1.0" encoding="utf-8" ?>\n'
			+ '<C:calendar-multiget xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">\n'
			+ '	<D:prop>\n'
			+ '		<D:getetag/>\n'
			+ '		<C:calendar-data/>\n'
			+ '		<C:schedule-tag/>\n'
			+ '	</D:prop>\n'
			+ '%(hrefs)s\n'
			+ '</C:calendar-multiget>';
		var hrefText = '<D:href>%(href)s</D:href>';
		
		var reportCallback = function(transport) {
			//console.log('got server response');
			// parse the events returned by the report
			//console.log('creating temporary expanded events');
			var reportContent = this.parseResponse(transport);
			//console.log('done creating temporary expanded events');
			// build a multi-get string
			multiGetText = String.format(multiGetText, {hrefs:reportContent.calendarFiles.keys().collect(function(href) {
				return String.format(hrefText, {href:href});
			}).join('\n')});
			var multiGetCallback = function(multiTransport) {
				// parse the events returned by the multi-get
				//console.log('creating temporary saved events');
				var multiGetContent = this.parseResponse(multiTransport);
				//console.log('done creating temporary saved events');
				var tzoffsetCallback = function() {
					//console.log('got timezone offsets');
					// normalize all recurrence-based UID keys to GMT since we have TZ data now
					$A([multiGetContent, reportContent]).pluck('calendarEvents').flatten().invoke('normalizeRecurrenceUID');
					// index the saved events by UID
					var savedEvents = {};
					for (var savedCalendarEventIdx = 0; savedCalendarEventIdx < multiGetContent.calendarEvents.length; savedCalendarEventIdx++) {
						var savedCalendarEvent = multiGetContent.calendarEvents[savedCalendarEventIdx];
						savedEvents[savedCalendarEvent.uid] = savedCalendarEvent;
					}
					// start with the events in the saved data
					//console.log('adding saved events to returned list');
					var allEvents = multiGetContent.calendarEvents.collect(function(savedCalendarEvent) {
						// if there's a recurrence ID, this is a detached calendar event
						if (savedCalendarEvent.recurrenceID()) {
							//console.log('creating DetachedCalendarEvent because we found a saved calendar event with a recurrence ID');
							var parentEvent = savedEvents["uid:" + savedCalendarEvent.valueForProperty('UID')];
							if (!parentEvent && savedCalendarEvent.principalAttendee() != null)
								return new DetachedAttendeeCalendarEvent(savedCalendarEvent.mParentCalendarFile, savedCalendarEvent.mEventStruct);
							return new DetachedCalendarEvent(savedCalendarEvent.mParentCalendarFile, savedCalendarEvent.mEventStruct, parentEvent);
						}
						// check for a detached first event
						var rawStartDate = savedCalendarEvent.valueForProperty('DTSTART');
						var uidToFind = savedCalendarEvent.uid + '/' + timezoneService().correctDateForTimezone(rawStartDate, savedCalendarEvent.tzid(), true);
						if (multiGetContent.calendarEvents.pluck('uid').indexOf(uidToFind) >= 0) {
							//console.log('making an event invisible because there\'s an detached counterpart');
							savedCalendarEvent.setVisible(false);
						}
						return savedCalendarEvent;
					});
					//console.log('done adding saved events to returned list');
					//console.log('adding expanded events to returned list');
					// iterate through each expanded event and add everything that doesn't have a saved equivalent
					for (var expandedEventIdx = 0; expandedEventIdx < reportContent.calendarEvents.length; expandedEventIdx++) {
						var expandedEvent = reportContent.calendarEvents[expandedEventIdx];
						// fix up broken expansions from CalDAV server (recurrences without recurrence IDs)
						var matchingSavedEvent = savedEvents[expandedEvent.uid];
						if (matchingSavedEvent && (!expandedEvent.recurrenceID()) && (expandedEvent.startDate(true) != matchingSavedEvent.startDate(true))) {
							//console.log('fixing a broken CalDAV expansion');
							var recurrenceStruct = Object.toJSON(expandedEvent.mEventStruct.DTSTART).evalJSON();
							recurrenceStruct.key = 'RECURRENCE-ID';
							expandedEvent.mEventStruct['RECURRENCE-ID'] = recurrenceStruct;
							expandedEvent.normalizeRecurrenceUID();
							expandedEvent.resetStacks();
						}
						// bail if we have a matching saved event
						if (savedEvents[expandedEvent.uid]) {
							//console.log('skipping expanded event because we have a matching saved event');
							continue;
						}
						// otherwise, create an ExpandedCalendarEvent
						//console.log('creating an expanded event');
						allEvents.push(new ExpandedCalendarEvent(expandedEvent.mParentCalendarFile, expandedEvent.mEventStruct, savedEvents["uid:" + expandedEvent.valueForProperty('UID')]));
					}
					//console.log('done adding expanded events to returned list');
					// fetch the timezone info before running the callback
					timezoneService().fetchCurrentTimezoneString(function() {
						//console.log('done handling server response');
						if (inCallback) inCallback(transport.request, allEvents);
					});
				}
				var allEvents = multiGetContent.calendarFiles.values().pluck('mEvents').flatten();
				timezoneService().fetchOffsetsForEvents(tzoffsetCallback.bind(this), allEvents);
			}
			// make a multi-get request
			new Ajax.CalendarRequest(this.mCalendarBasePath, {
				method: 'report',
				contentType: 'application/xml',
				postBody: multiGetText,
				onSuccess: multiGetCallback.bind(this),
				onException: reportError,
				errorNotificationObject: this
			});
		}
		return new Ajax.CalendarRequest(this.mCalendarBasePath, {
			method: 'report',
			contentType: 'application/xml',
			postBody: inReportText,
			requestHeaders: {
				Depth: '1'
			},
			onSuccess: reportCallback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	reportTemplate: function() {
		return '<?xml version="1.0" encoding="utf-8" ?>\n'
			+ '<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">\n'
			+ '	<D:prop>\n'
			+ '		<D:getetag/>\n'
			+ '		<C:calendar-data>\n'
			+ '			<C:expand start="%(startDate)s" end="%(endDate)s"/>\n'
			+ '			<C:comp name="VCALENDAR">\n'
			+ '				<C:prop name="VERSION"/>\n'
			+ '				<C:comp name="VEVENT">\n'
			+ '					<C:prop name="UID"/>\n'
			+ '					<C:prop name="DTSTART"/>\n'
			+ '					<C:prop name="DTEND"/>\n'
			+ '					<C:prop name="DURATION"/>\n'
			+ '					<C:prop name="RRULE"/>\n'
			+ '					<C:prop name="RDATE"/>\n'
			+ '					<C:prop name="EXRULE"/>\n'
			+ '					<C:prop name="EXDATE"/>\n'
			+ '					<C:prop name="RECURRENCE-ID"/>\n'
			+ '				</C:comp>\n'
			+ '			</C:comp>\n'
			+ '		</C:calendar-data>\n'
			+ '	</D:prop>\n'
			+ '	<C:filter>\n'
			+ '		<C:comp-filter name="VCALENDAR">\n'
			+ '			<C:comp-filter name="VEVENT">\n'
			+ '				%(filter)s\n'
			+ '			</C:comp-filter>\n'
			+ '		</C:comp-filter>\n'
			+ '	</C:filter>\n'
			+ '</C:calendar-query>';
	},
	getEventsForDateRange: function(inStartDate, inEndDate, inCallback) {
		// build the filter
		var formatParams = {startDate:dateObjToISO8601(inStartDate, true), endDate:dateObjToISO8601(inEndDate, true)};
		formatParams.filter = String.format('<C:time-range start="%(startDate)s" end="%(endDate)s"/>', formatParams);
		// add it to the report text
		var reportText = String.format(this.reportTemplate(), formatParams);
		// now run the report
		return this.runReport(reportText, inCallback);
	},
	expandRecurrencesForEventWithUID: function(inEventUID, inStartDate, inEndDate, inCallback) {
		// build the filter
		var formatParams = {startDate:dateObjToISO8601(inStartDate), endDate:dateObjToISO8601(inEndDate), uid:inEventUID};
		formatParams.filter = String.format('<C:prop-filter name="UID"><C:text-match collation="i;octet">%(uid)s</C:text-match></C:prop-filter>', formatParams);
		// add it to the report text
		var reportText = String.format(this.reportTemplate(), formatParams);
		// now run the report
		return this.runReport(reportText, inCallback);
	}
}


/**
 * CalendarFile
 * Data class for an entire ics file.
 * Initialize with the ics text and the file location as a URL, or
 * to make a new CalendarFile, initialize with null and the remote calendar.
 * Usually abstracted through RemoteCalendar and CalendarEvent.
 */
var CalendarFile = Class.create();
CalendarFile.prototype = {
	initialize: function(inCalendarText, inFileLocation, inParentCalendar) {
		if (!inCalendarText && !inFileLocation) {
			inCalendarText = String.format(CalendarFile.defaultFormat, {
				DTSTAMP: dateObjToISO8601(new Date(), true, true),
				DTSTART: dateObjToISO8601(new Date(), false, false),
				UID: CalendarUuid.generateUUIDString(),
				SUMMARY: 'New Event',
				TZID: timezoneService().selectedTimezone(),
				TIMEZONE: timezoneService().mCurrentTimezoneString || ''
			});
		}
		// stow away the URL for later
		this.mFileLocation = inFileLocation;
		this.mParentCalendar = inParentCalendar;
		// fix CRLF line endings (do we need to do this?) and replace continuation-escaped strings
		inCalendarText = inCalendarText.replace(/\r\n/gm, '\n').replace(/\n[ \t]+/gm, '');
		var lines = inCalendarText.split('\n');
		this.mCalendarObj = $A([]);
		var stack = $A([this.mCalendarObj]);
		lineIdxLabel:
		for (var lineIdx = 0; lineIdx < lines.length; lineIdx++) {
			var line = lines[lineIdx];
			// get rid of continuations
			while (line.match(/\\$/)) {
				line = line.replace(/\\$/, '\n');
				line += lines[lineIdx+1];
				lines.splice(lineIdx--, 1);
			}
			// sanity check to make sure this is a valid line
			if (line.indexOf(':') < 0) continue;
			// remove starting and trailing whitespace
			line = line.strip();
			
			var key = '';
			var valueObj = {value:''};
			// iterate over every character in the line
			var charIdx = (-1), charLength = line.length;
			// look for key
			while (charIdx++ < charLength) {
				if (line.charAt(charIdx) == ';') {
					break;
				}
				if (line.charAt(charIdx) == ':') {
					charIdx--;
					break;
				}
				key += line.charAt(charIdx);
			}
			
			// if no key, bail on this line
			if (key == '') continue;
			// otherwise, set the key in the valueObj
			valueObj.key = key;
			
			// look for attributes
			while (charIdx++ < charLength) {
				if (line.charAt(charIdx) == ':') {
					break;
				}
				// attribute name
				var attrName = '';
				charIdx--;
				while (charIdx++ < charLength) {
					if (line.charAt(charIdx) == '=') {
						break;
					}
					attrName += line.charAt(charIdx);
				}
				// if no attribute name, bail
				if (attrName == '') continue;
				// attribute value
				var attrValue = '';
				var isQuoted = false;
				if (charIdx < charLength && line.charAt(charIdx+1) == '"') {
					isQuoted = true;
					charIdx++;
				}
				while (charIdx++ < charLength) {
					if (isQuoted && line.charAt(charIdx) == '"') {
						if (line.charAt(charIdx+1) == ';') {
							charIdx++;
						}
						break;
					}
					if (!isQuoted && line.charAt(charIdx) == ';') {
						break;
					}
					if (!isQuoted && line.charAt(charIdx) == ':') {
						charIdx--;
						break;
					}
					attrValue += line.charAt(charIdx);
				}
				if (!valueObj.calAttrs) valueObj.calAttrs = {};
				valueObj.calAttrs[attrName] = attrValue;
			}
			
			// the rest of the string is the value
			valueObj.value = (++charIdx < charLength ? line.slice(charIdx) : '');
			
			// push stuff onto the stack
			if (key == 'BEGIN') {
				var newStackItem = $A([]);
				newStackItem.key = valueObj.value;
				if (!stack[stack.length-1][valueObj.value]) {
					var arrayValue = $A([]);
					stack[stack.length-1].push(arrayValue);
					stack[stack.length-1][valueObj.value] = arrayValue;
				}
				stack[stack.length-1][valueObj.value].push(newStackItem);
				stack.push(newStackItem);
			}
			// if we get an END statement, we need to go up a level by popping off of the stack
			else if (key == 'END') {
				stack.pop();
			}
			// if we get to this point and have a value, set it for the given key
			else {
				// if this is a text value, remove escapes
				if (CalendarFile.textProperties.indexOf(valueObj.key) >= 0) {
					valueObj.value = valueObj.value.replace(/\\n/gm, '\n').replace(/\\([;\,])/gm, '$1').replace(/\\\\/, '\\');
				}
				// push the value onto the stack
				stack[stack.length-1].push(valueObj);
				stack[stack.length-1][key] = valueObj;
			}
		}
		// if we don't have a calendar object then bail
		if (!(this.mCalendarObj.VCALENDAR && this.mCalendarObj.VCALENDAR.length > 0)) throw 'Invalid calendar.';
		// now that we have the core object, create CalendarEvent objects
		this.mEvents = $A([]);
		if (this.mCalendarObj.VCALENDAR[0].VEVENT) {
			for (var eventStructIdx = 0; eventStructIdx < this.mCalendarObj.VCALENDAR[0].VEVENT.length; eventStructIdx++) {
				this.mEvents.push(new CalendarEvent(this, this.mCalendarObj.VCALENDAR[0].VEVENT[eventStructIdx]));
			}
		}
	},
	allReferencedTZIDs: function() {
		return this.mEvents.collect(function(evt) { return evt.allReferencedTZIDs(); }).flatten().uniq();
	},
	iTIPMethod: function() {
		if (this.mCalendarObj.VCALENDAR[0].METHOD) return this.mCalendarObj.VCALENDAR[0].METHOD.value;
		return null;
	},
	updatedCalendarText: function(inOptStackItem) {
		var stackItem = inOptStackItem || this.mCalendarObj;
		var calendarText = stackItem.collect(function(valueObj) {
			//7133432 plugging a hole
			if(!valueObj) return;
			
			// if it's a BEGIN statement, then add that stack level
			if (valueObj.constructor == Array) {
				// make sure the struct hasn't been replaced in the individual event
				//if (valueObj.mEventForStruct) valueObj = valueObj.mEventForStruct.mEventStruct;
				if (!valueObj.key) return this.updatedCalendarText(valueObj);
				return 'BEGIN:'+valueObj.key+'\n'+this.updatedCalendarText(valueObj)+'\nEND:'+valueObj.key;
			}
			var valueStr = valueObj.value;
			if (valueStr.length > 0) {
				// start with the key
				var lineText = valueObj.key;
				// add the attributes
				if (valueObj.calAttrs) {
					$H(valueObj.calAttrs).each(function(attr) {
						if (attr.value != null) {
							var attrValue = attr.value;
							if (attrValue.indexOf(';') >= 0) attrValue = '"'+attrValue+'"';
							lineText += ';' + [attr.key, attrValue].join('=');
						}
					});
				}
				if (CalendarFile.textProperties.indexOf(valueObj.key) >= 0) {
					valueStr = valueStr.replace(/\\/gm, '\\\\').replace(/([;\,])/gm, '\\$1').replace(/\n/gm, '\\n');
				}
				lineText = lineText + ':' + valueStr;
				return lineText;
			}
			else {
				return "\n";
			}
		}.bind(this)).join('\r\n');
		if (!inOptStackItem) calendarText = calendarText + '\r\n';
		calendarText = calendarText.replace(/[\r\n]+/gm, '\r\n');
		return calendarText;
	},
	deleteKeyFromMember: function(inKey, inMember) {
		delete inMember[inKey];
		for (var pairIdx = 0; pairIdx < inMember.length; pairIdx++) {
			if (inMember[pairIdx].key == inKey) {
				inMember.splice(pairIdx, 1);
				return true;
			}
		}
		return false;
	},
	deleteEvent: function(inDeleteCallback) {
		if (!this.mFileLocation) return null;
		var callback = function(transport) {
			if (inDeleteCallback) inDeleteCallback(transport);
		}
		return new Ajax.CalendarRequest(this.mFileLocation, {
			method: 'delete',
			onSuccess: callback,
			onException: reportError,
			errorNotificationObject: this
		});
	},
	expandRecurrencesForEvent: function(inEvent, inStartDate, inEndDate, inCallback) {
		var queryUID = inEvent.valueForProperty('UID');
		return this.mParentCalendar.expandRecurrencesForEventWithUID(queryUID, inStartDate, inEndDate, inCallback);
	},
	saveToServer: function(inSaveCallback) {
		// update event date stamps and reset their update stacks
		this.mEvents.each(function(evt) {
			evt.setPropertyValue('DTSTAMP', dateObjToISO8601(new Date(), true, true));
			evt.incrementSequenceNumber();
			evt.resetStacks();
		});
		
		// udpate the text for revertToSaved() on this calendar file
		//this.resetUndoStruct();
		
		timezoneService().fetchCurrentTimezoneString(function(str, parsed) {
			/**
			 * If the CalendarFile has been hijacked, replace the VTIMEZONE with whatever is currently selected.
			 */

			// A more descriptive alias so that I don't have to type 'this.mCalendarObj.VCALENDAR' 7 times.
			var calendars = this.mCalendarObj.VCALENDAR;

			// Always remove unused VTIMEZONEs. This will handle removal for all-day events too.
			var tzids = this.allReferencedTZIDs();
			var selectedTZID = timezoneService().selectedTimezone();
			var selectedTZIDSeen = false;
			calendars[0] = calendars[0].reject(function(el) {
				if (el.constructor==Array && el[0].key=='VTIMEZONE')
				{
					if (selectedTZID==el[0].TZID.value)
						selectedTZIDSeen = true;
					return !tzids.include(el[0].TZID.value);
				}
				return false;
			});
			calendars[0].key = 'VCALENDAR'; // reject() removes the key, put it back.

			if (this.mTimezoneHijacked)
			{
				this.mTimezoneHijacked = false;

				var makeDetectorByKey = function(key) { return function(el) { return el.constructor==Array && el[0].key == key; }; }

				if (!selectedTZIDSeen)
				{
					// Add VTIMEZONE before the VEVENT.
					calendars[0].splice(calendars[0].indexOf(calendars[0].detect(makeDetectorByKey('VEVENT'))), 0, parsed);
					calendars[0].VTIMEZONE = parsed;
				}
			}

			/**
			 * ...and continue saving.
			 */

			var requestHeaders = {};
			var calendarText = this.updatedCalendarText();
			if (!this.mFileLocation) { // this means it's a new event
				requestHeaders['If-None-Match'] = '*'; // make sure there's no duplicate
				// TODO: handle the error condition where we try to add a duplicate event
				//grab the originalUID if we cannot get the event's structure
				var eventUID = (this.mEvents.length == 0) ? this.grabOriginalUID() : this.mEvents[0].mEventStruct.UID.value;
				this.mFileLocation = String.appendPathComponent(this.mParentCalendar.pathForNewEvents(), eventUID + '.ics');
			}
			// if we have a schedule-tag, tell the server to merge with any changes
			else if (this.mScheduleTag) {
				requestHeaders['If-Schedule-Tag-Match'] = this.mScheduleTag;
			}
			var savedFileCallback = function(transport) {
				if (inSaveCallback) inSaveCallback(transport);
			}
			requestHeaders['Content-type'] = 'text/calendar';
			return new Ajax.CalendarRequest(this.mFileLocation, {
				method: 'put',
				contentType: 'text/calendar',
				postBody: calendarText,
				onSuccess: savedFileCallback,
				onException: reportError,
				errorNotificationObject: this,
				requestHeaders: requestHeaders
			});
		}.bind(this));
	},
	moveToCalendar: function(inDestinationCalendar, inCallback) {
		// the destination is the new calendar's base path plus the filename of the calendar file
		var destination = String.appendPathComponent(inDestinationCalendar.pathForNewEvents(), String.lastPathComponent(this.mFileLocation));
		// when we're all done here, switch the internal calendar and file location references, then run the callback
		var callback = function() {
			this.mParentCalendar = inDestinationCalendar;
			this.mFileLocation = destination;
			if (inCallback) inCallback(this);
		}
		/*// if we've got a METHOD parameter, we need to delete it and save the new copy to the server, then delete the old
		if (false && this.mCalendarObj.VCALENDAR[0].METHOD) {
			// clone ourselves a new CalendarFile object
			var newfile = new CalendarFile(this.mOriginalCalendarFile ? this.mOriginalCalendarFile.updatedCalendarText() : this.updatedCalendarText(), null, inDestinationCalendar);
			// get the first VCALENDAR object
			var vcal = newfile.mCalendarObj.VCALENDAR[0];
			// delete the method both from the keyed value and splice it out of the array as well
			newfile.deleteKeyFromMember('METHOD', newfile.mCalendarObj.VCALENDAR[0]);
			// after we save, delete the original event and run the callback...
			var saveCallback = function() {
				this.deleteEvent(callback.bind(this));
			}
			// ...but first, generate a put request for the calendar file copy
			var requestHeaders = {};
			requestHeaders['Content-type'] = 'text/calendar';
			return new Ajax.CalendarRequest(destination, {
				method: 'put',
				contentType: 'text/calendar',
				postBody: newfile.updatedCalendarText(),
				requestHeaders: requestHeaders,
				onSuccess: saveCallback.bind(this),
				onException: reportError,
				errorNotificationObject: this
			});
		}*/
		// If we got to this point, we should just be able to tell the server to move the calendar file.
		return new Ajax.CalendarRequest(this.mFileLocation, {
			method: 'move',
			requestHeaders: {
				Destination: destination
			},
			onSuccess: callback.bind(this),
			onException: reportError,
			errorNotificationObject: this
		});
	},
	grabOriginalUID: function() { // FIXME we can't count on the first event being the original; should look for the one without a recurrence ID
		// Remember we have a "uid:" prefix
		return this.mEvents[0].uid.slice(4);
	}
}
// default new calendar event (substitute in string values using String.format)
CalendarFile.defaultFormat = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Apple Inc.//Web Calendar Client//\n%(TIMEZONE)sBEGIN:VEVENT\nDESCRIPTION:\n'
		+ 'DTSTAMP:%(DTSTAMP)s\nDTSTART;TZID=%(TZID)s:%(DTSTART)s\nDURATION:PT1H\nSEQUENCE:1\nSUMMARY:%(SUMMARY)s\nUID:%(UID)s\nTRANSP:OPAQUE\nEND:VEVENT\nEND:VCALENDAR';
CalendarFile.multiProperties = ['EXDATE', 'RDATE', 'ATTENDEE'];
CalendarFile.textProperties = ['CALSCALE', 'METHOD', 'PRODID', 'VERSION', 'CATEGORIES', 'CLASS', 'COMMENT', 'DESCRIPTION', 'LOCATION', 'RESOURCES', 'STATUS', 'SUMMARY', 'TRANSP', 'TZID', 'TZNAME', 'CONTACT', 'RELATED-TO', 'UID', 'ACTION', 'REQUEST-STATUS'];


/**
 * CalendarEvent
 * Data class for an individual calendar event.
 */
var CalendarEvent = Class.create({
	initialize: function(inParentCalendarFile, inEventStruct) {
		this.mVisible = true;
		this.mUpdateStack = $A([]);
		this.mParentCalendarFile = inParentCalendarFile;
		this.mEventStruct = inEventStruct;
		//this.mEventStruct.mEventForStruct = this;

		// We need to add a "uid:" prefix to make sure this value can legitimately be used as a property on an array
		this.uid = "uid:" + this.mEventStruct.UID.value; // for syncing using Array.syncKeyedArrayWithRows
		if (this.mEventStruct['RECURRENCE-ID']) {
			this.uid += '/' + this.mEventStruct['RECURRENCE-ID'].value;
		}
		// remember the original dates
		this.resetStacks();
		//console.log('created ' + this.recurrenceType() + ' ' + this.toString());
	},
	toString: function() {
		var s = "Event{\n";
		this.mEventStruct.each(function(el) {
			if (el.key) {
				s += "\t";
				s += el.key + '=' + el.value;
				if (el.calAttrs) {
					for (var av in el.calAttrs) {
						s += ';' + av + '=' + el.calAttrs[av];
					}
				}
				s += "\n";
			}
		});
		return s + '}';
	},
	allReferencedTZIDs: function() {
		var tzids = $A([]);
		this.mEventStruct.each(function(el) {
			if (el.key) {
				var val = this.attributeForProperty(el.key, 'TZID');
				if (val)
					tzids.push(val);
			}
		}.bind(this));
		return tzids.uniq();
	},
	resetStacks: function() {
		this.mUpdateStack = $A([]);
		this.mOriginalEventStruct = this.cloneEventStruct();
		this.setRecurrenceChangeAction(CalendarEvent.RecurrenceChangeAction.Unknown);
		this.mOriginalLocalStartDate = this.startDate(false, true);
	},
	rememberDates: function() { // FIXME take out all references to mOriginalDateStruct
		throw 'rememberDates is deprecated; use resetStacks instead'
		/* -- OLD CODE --
		this.mOriginalDateStruct = $A([{
			key: 'DTSTART',
			calAttrs: this.mEventStruct.DTSTART.calAttrs,
			value: this.mEventStruct.DTSTART.value
		}]);
		if (this.mEventStruct['DTEND']) {
			this.mOriginalDateStruct.push({
				key: 'DTEND',
				calAttrs: this.mEventStruct.DTEND.calAttrs,
				value: this.mEventStruct.DTEND.value
			});
		}
		if (this.mEventStruct['DURATION']) {
			this.mOriginalDateStruct.push({
				key: 'DURATION',
				calAttrs: this.mEventStruct.DURATION.calAttrs,
				value: this.mEventStruct.DURATION.value
			});
		}*/
	},
	normalizeRecurrenceUID: function() {
		var tzid = this.attributeForProperty('RECURRENCE-ID', 'TZID');
		if (!tzid) return;
		var dtstr = timezoneService().correctDateForTimezone(this.valueForProperty('RECURRENCE-ID'), tzid, true);

		// We need to add a "uid:" prefix to make sure this value can legitimately be used as a property on an array
		this.uid = "uid:" + this.valueForProperty('UID') + '/' + dtstr;
	},
	useAlphaColors: function() {
		return browser().isWebKit();
	},
	alphaFillColor: function() {
		return 'rgba(' + $R(0,2).collect(function(i) {
			return parseInt(this.mParentCalendarFile.mParentCalendar.mColor.substring((i*2)+1, (i*2)+3), 16);
		}, this).join(',') + ',' + '0.3)';
	},
	color: function() {
		return this.mParentCalendarFile.mParentCalendar.mColor;
	},
	fillColor: function() {
		// Return an rgba color for Safari and FF3, and the color for everyone else.
		if (this.useAlphaColors()) {
			return this.alphaFillColor();
		}
		return this.mParentCalendarFile.mParentCalendar.mColor;
	},
	textColor: function() {
		if (this.useAlphaColors()) {
			return this.mParentCalendarFile.mParentCalendar.mColor;
		}
		return '#FFF';
	},
	isNew: function() {
		return !this.mParentCalendarFile.mFileLocation;
	},
	updateStack: function() {
		if (!this.mUpdateStack) this.mUpdateStack = $A([]);
		return this.mUpdateStack;
	},
	valueForProperty: function(inPropertyName) {
		if (inPropertyName.indexOf(';') >= 0) {
			var splitProperty = inPropertyName.split(';');
			return this.attributeForProperty(splitProperty[0], splitProperty[1]);
		}
		return this.mEventStruct[inPropertyName] ? this.mEventStruct[inPropertyName].value : null;
	},
	attributeForProperty: function(inPropertyName, inAttributeName) {
		if (!this.mEventStruct[inPropertyName] || !this.mEventStruct[inPropertyName].calAttrs) return null;
		return this.mEventStruct[inPropertyName].calAttrs[inAttributeName];
	},
	setPropertyValue: function(inPropertyName, inValue) {
		// if we call setPropertyValue with a ;-separated value, set an attribute instead
		if (inPropertyName.indexOf(';') >= 0) {
			var splitProperty = inPropertyName.split(';');
			this.setPropertyAttribute(splitProperty[0], splitProperty[1], inValue);
			return;
		}
		// if the value hasn't changed, stop now
		if (this.valueForProperty(inPropertyName) == inValue) return;
		// push the change onto the stack
		//debugMessage('pushing changed property onto stack: ' + inPropertyName+': '+(inValue||'(null)')+' (old value:'+(this.valueForProperty(inPropertyName)||'(null)')+')');
		this.updateStack().push(inPropertyName);
		// unset if we got a null value
		if (inValue == null) {
			// delete from array as well as the object
			var spliceIndex = this.mEventStruct.indexOf(this.mEventStruct[inPropertyName]);
			if (spliceIndex >= 0) this.mEventStruct.splice(spliceIndex, 1);
			if (this.mEventStruct[inPropertyName]) delete this.mEventStruct[inPropertyName];
			return;
		}
		// and, of course, we need to add to the array here and set the value if it's not there yet
		if (!this.mEventStruct[inPropertyName]) {
			var newStackItem = {key:inPropertyName, value:inValue};
			this.mEventStruct.push(newStackItem);
			this.mEventStruct[inPropertyName] = newStackItem;
			return;
		}
		// this is just the update case
		this.mEventStruct[inPropertyName]['value'] = inValue;
	},
	setPropertyAttribute: function(inPropertyName, inAttributeName, inValue) {
		// bail if we aren't actually changing anything
		if (this.attributeForProperty(inPropertyName, inAttributeName) == inValue) return;
		// push the change onto the stack
		this.updateStack().push(inPropertyName);
		if (this.mEventStruct[inPropertyName]) {
			this.addPopertyAttribute(this.mEventStruct[inPropertyName], inAttributeName, inValue);
		}
	},
	addPopertyAttribute: function(property, inAttributeName, inValue) {
		if (!property['calAttrs']) {
			property['calAttrs'] = {};
		}
		if (inValue == null && property['calAttrs'][inAttributeName]) {
			delete property['calAttrs'][inAttributeName];
		}
		else {
			property['calAttrs'][inAttributeName] = inValue;
		}
	},
	hijackEventTimezone: function() {
		if (this.attributeForProperty('DTSTART', 'VALUE') == 'DATE') return true; // don't add TZIDs to banner events!
		this.setPropertyAttribute('DTSTART', 'TZID', timezoneService().selectedTimezone());
		if (this.valueForProperty('DTEND'))
			this.setPropertyAttribute('DTEND', 'TZID', timezoneService().selectedTimezone());
		this.mParentCalendarFile.mTimezoneHijacked = true;
	},
	rawGMTDateForProperty: function(inPropertyName) { // used for comparing date values
		var rawDate = this.valueForProperty(inPropertyName);
		if (!rawDate) return null;
		return timezoneService().correctDateForTimezone(rawDate, this.tzid(inPropertyName), true);
	},
	startDate: function(inOptReturnRawFormat, inOptReturnUncorrected) {
		// use the cached corrected start date if we have it
		if (this.mCachedStartDate && !inOptReturnUncorrected) {
			return (inOptReturnRawFormat ? this.mCachedStartDate : createDateObjFromISO8601(this.mCachedStartDate));
		}
		var rawStartDate = this.valueForProperty('DTSTART');
		// if this is a banner event, don't correct for timezones
		if (this.banner()) {
			rawStartDate = rawStartDate.replace(/T.+$/, '');
			this.mCachedStartDate = rawStartDate;
			return (inOptReturnRawFormat ? rawStartDate : createDateObjFromISO8601(rawStartDate));
		}
		// get the corrected date
		if (!inOptReturnUncorrected) {
			rawStartDate = timezoneService().correctDateForTimezone(rawStartDate, this.tzid());
			this.mCachedStartDate = rawStartDate;
		}
		// create a date object so we can get the offset
		return (inOptReturnRawFormat ? rawStartDate : createDateObjFromISO8601(rawStartDate));
	},
	setStartDate: function(inStartDate) {
		// handle set from ISO string
		if (inStartDate && (inStartDate.constructor == String || inStartDate.constructor == Number)) inStartDate = createDateObjFromISO8601(''+inStartDate);
		// if we didn't actually move, then bail
		if (inStartDate.getTime() == this.startDate().getTime()) return;
		// if we have an end date, we have to move it forward
		if (inStartDate && this.startDate() && this.mEventStruct.DTEND) {
			// set the end date using the new start date and the duration
			this.setEndDate(getEndDateUsingDuration(inStartDate, this.duration()));
		}
		// now set the new start date property
		var startDateStr = dateObjToISO8601(inStartDate, false, false);
		// If this is an banner event, strip the time from the string
		if (startDateStr && this.banner()) {
			startDateStr = startDateStr.replace(/T.+$/, '');
			this.setPropertyAttribute('DTSTART', 'TZID', null);
		}
		// Adjust for UTC if current start date is set that way
		if (this.valueForProperty('DTSTART').match(/Z$/)){
			startDateStr = timezoneService().correctDateForTimezone(startDateStr, this.mParentEvent.tzid(), true);
		}
		this.setPropertyValue('DTSTART', startDateStr);
		if (!this.valueForProperty('DTSTART').match(/Z$/)){
			this.hijackEventTimezone();
		}
		delete this.mCachedStartDate; // this will get rebuilt as-needed later by the startDate() method
	},
	tzid: function(inOptProperty) {
		return this.attributeForProperty(inOptProperty || 'DTSTART', 'TZID') || timezoneService().selectedTimezone();
	},
	banner: function() {
		return (this.attributeForProperty('DTSTART', 'VALUE') == 'DATE');
	},
	setBanner: function(inBanner) {
		this.setPropertyAttribute('DTSTART', 'VALUE', (inBanner ? 'DATE' : null));
		// get rid of the timezone if we made this a banner
		if (inBanner) {
			this.setPropertyAttribute('DTSTART', 'TZID', null);
			if (this.valueForProperty('DTEND')) this.setPropertyAttribute('DTEND', 'TZID', null);
		}
		// reset the start and (if applicable) end dates to incorporate times (or not)
		if (inBanner && this.valueForProperty('DTSTART').match(/T/)) {
			var dur = this.duration();
			if (!dur.days || dur.days < 1) {
				this.setDuration({days:1});
			}
			this.setPropertyValue('DTSTART', this.valueForProperty('DTSTART').replace(/T.+$/, ''));
			this.mCachedStartDate = this.valueForProperty('DTSTART');
		}
		else if (!inBanner && !this.valueForProperty('DTSTART').match(/T/)) {
			this.setPropertyValue('DTSTART', this.valueForProperty('DTSTART')+'T000000');
		}
	},
	calculateMissingEndDate: function() {
		var dt = createDateObjFromISO8601(this.valueForProperty('DTSTART'));
		if (this.attributeForProperty('DTSTART', 'VALUE') == 'DATE') {
			dt.setDate(dt.getDate()+1);
		}
		else {
			dt.setHours(11);
			dt.setMinutes(59);
			dt.setSeconds(59);
		}
		return dt;
	},
	endDate: function(inOptReturnRawFormat, inOptReturnUncorrected) {
		if (!this.mEventStruct.DTEND) {
			if (this.startDate(false, inOptReturnUncorrected) && this.mEventStruct.DURATION) {
				var dt = getEndDateUsingDuration(this.startDate(false, inOptReturnUncorrected), this.duration());
				return (inOptReturnRawFormat ? dateObjToISO8601(dt) : dt);
			}
			else if (this.mEventStruct.DTSTART) {
				var dt = this.calculateMissingEndDate();
				return (inOptReturnRawFormat ? dateObjToISO8601(dt) : dt);
			}
			return null; // bail -- no start date
		}
		var dtstr = this.mEventStruct.DTEND.value;
		if (!inOptReturnUncorrected) dtstr = timezoneService().correctDateForTimezone(dtstr, this.tzid());
		return (inOptReturnRawFormat ? dtstr : createDateObjFromISO8601(dtstr));
	},
	setEndDate: function(inEndDate) {
		if (inEndDate.constructor == String || inEndDate.constructor == Number) inEndDate = createDateObjFromISO8601(''+inEndDate);
		// if there's a duration, use it instead
		if (this.mEventStruct.DURATION) {
			this.setPropertyValue('DURATION', durationToISO8601(getDurationUsingEndDate(this.startDate(), inEndDate)).replace(/T$/, ''));
			return;
		}
		var endDateStr = dateObjToISO8601(inEndDate, false, false);
		// If this is an banner event, strip the time from the string
		if (this.banner()) {
			endDateStr = endDateStr.replace(/T.+$/, '');
			this.setPropertyAttribute('DTEND', 'TZID', null);
		}
		this.setPropertyValue('DTEND', endDateStr);
		this.hijackEventTimezone();
	},
	duration: function() {
		if (this.mEventStruct.DURATION) {
			return durationFromISO8601(this.mEventStruct.DURATION.value);
		}
		else if (this.mEventStruct.DTSTART && this.mEventStruct.DTEND) {
			return getDurationUsingEndDate(createDateObjFromISO8601(this.valueForProperty('DTSTART')), createDateObjFromISO8601(this.valueForProperty('DTEND')));
		}
		else if (this.mEventStruct.DTSTART) {
			var dt = this.calculateMissingEndDate();
			return getDurationUsingEndDate(createDateObjFromISO8601(this.valueForProperty('DTSTART')), dt);
		}
		return {days:0, hours:0, minutes:0, seconds:0}; // no duration. should we sanity check here?
	},
	setDuration: function(inDuration) {
		if (inDuration.constructor == String) inDuration = durationFromISO8601(inDuration);
		if (this.mEventStruct.DTSTART && this.mEventStruct.DTEND) {
			this.setPropertyValue('DTEND', dateObjToISO8601(getEndDateUsingDuration(this.startDate(), inDuration), false, false));
		}
		else {
			this.setPropertyValue('DURATION', durationToISO8601(inDuration).replace(/T$/, ''));
		}

		this.hijackEventTimezone();
	},
	convertEventDurationToEndDate: function() {
		if (this.mEventStruct.DTEND || !this.mEventStruct.DURATION) return;
		var endDate = this.endDate();
		this.setPropertyValue('DURATION', null);
		this.setEndDate(endDate);
	},
	location: function() {
		return this.valueForProperty('LOCATION');
	},
	setLocation: function(inLocation) {
		// clear out any attendees that match an existing location
		var loc = this.valueForProperty('LOCATION');
		if (loc != null && loc != inLocation) this.removeAttendeeWithUID(loc);
		this.setPropertyValue('LOCATION', inLocation);
	},
	summary: function() {
		return this.valueForProperty('SUMMARY');
	},
	setSummary: function(inSummary) {
		this.setPropertyValue('SUMMARY', inSummary);
	},
	description: function() {
		return this.valueForProperty('DESCRIPTION');
	},
	setDescription: function(inDescription) {
		this.setPropertyValue('DESCRIPTION', inDescription);
	},
	originalEventFromRecurrence: function(/*inOptReturnBoolean, inOptReturnFromOriginalFile*/) { // FIXME originalEventFromRecurrence is deprecated
		throw 'originalEventFromRecurrence is deprecated';
	},
	recurrenceID: function() {
		return this.valueForProperty('RECURRENCE-ID');
	},
	setRecurrenceID: function(inRecurrenceID) {
		this.setPropertyValue('RECURRENCE-ID', inRecurrenceID);
	},
	recurrenceInfo: function() {
		if (!this.mRecurrenceInfo && this.valueForProperty('RRULE')) {
			this.mRecurrenceInfo = new CalendarRecurrence(this, this.valueForProperty('RRULE'));
		}
		return this.mRecurrenceInfo;
	},
	recurrenceIsNew: function() {
		return !this.mOriginalEventStruct.RRULE;
	},
	setRecurrenceFrequency: function(inRecurrenceType) {
		// if we're not really changing this, just bail
		if (this.recurrenceInfo() && (this.recurrenceInfo().frequency() == inRecurrenceType)) {
			return;
		}
		// TODO: handle custom recurrences
		else if (inRecurrenceType.toUpperCase() == 'CUSTOM') {
			return;
		}
		// if we're setting to "NONE" or null, clear the recurrence info object and unset the RRULE
		else if ((inRecurrenceType.toUpperCase() == 'NONE') || !inRecurrenceType) {
			this.setPropertyValue('RRULE', null);
			this.mRecurrenceInfo = null;
			return;
		}
		// finally, create a new recurrence object and set the RRULE
		this.mRecurrenceInfo = (inRecurrenceType ? new CalendarRecurrence(this, 'FREQ='+inRecurrenceType.toUpperCase()) : null);
		this.setPropertyValue('RRULE', this.mRecurrenceInfo.updatedRecurrenceString());
	},
	exceptionDates: function() {
		// bail if there are no EXDATEs.
		if (!this.mEventStruct.EXDATE) return $A([]);
		// find the EXDATE properties
		return this.mEventStruct.findAll(function(prop) {
			return (prop.key == 'EXDATE');
		// grab date objects for each of the exceptions
		}).collect(function(exdateobj) {
			if (!exdateobj.translatedValue) {
				if (exdateobj.calAttrs && exdateobj.calAttrs.TZID) {
					exdateobj.translatedValue = timezoneService().correctDateForTimezone(exdateobj.value, exdateobj.calAttrs.TZID);
				}
				else {
					exdateobj.translatedValue = exdateobj.value;
				}
				exdateobj.translatedValue = createDateObjFromISO8601(exdateobj.translatedValue);
			}
			return exdateobj.translatedValue;
		});
	},
	expandRecurrences: function(inStartDate, inEndDate, inCallback) {
		return this.mParentCalendarFile.expandRecurrencesForEvent(this, inStartDate, inEndDate, inCallback);
	},
	visible: function() {
		// return false if the parent calendar isn't enabled
		if (this.mParentCalendarFile && !this.mParentCalendarFile.mParentCalendar.mEnabled) return false;
		// otherwise, see if the date is detached from the recurrence
		var dtTm = this.startDate().getTime();
		return this.mVisible && (!this.exceptionDates().detect(function(dt) {
			return dt.getTime() == dtTm;
		}));
	},
	setVisible: function(inIsVisible) {
		this.mVisible = inIsVisible;
	},
	recurrenceType: function() {
		if (this.recurrenceInfo()) return CalendarEvent.RecurrenceType.First;
		return CalendarEvent.RecurrenceType.None;
		
		/* -- OLD CODE --
		// Returns where this event lives in a recurrence, or CalendarEvent.RecurrenceType.None if this isn't a recurrent event
		if (this.originalEventFromRecurrence() == this) {
			return CalendarEvent.RecurrenceType.Separated;
		}
		if (this.recurrenceID()) return CalendarEvent.RecurrenceType.Nth;
		// first event in the series
		if (this.recurrenceInfo()) {
			// this might be a CalDAV mirage... a separated event that's missing a recurrence ID
			var origEventFromOrigFile = this.originalEventFromRecurrence(false, true);
			var realOrigEvent = (this.mParentCalendarFile.mOriginalCalendarFile.mEvents.detect(function(evt) {
				return (evt.mEventStruct['RECURRENCE-ID'] && $H(evt.mEventStruct['RECURRENCE-ID']).toJSON() == $H(origEventFromOrigFile.mEventStruct['DTSTART']).toJSON().replace(/"DTSTART"/, '"RECURRENCE-ID"'));
			}));
			if (realOrigEvent) return CalendarEvent.RecurrenceType.Separated;
			// if we didn't find this, it's really a first event
			return CalendarEvent.RecurrenceType.First;
		}
		return CalendarEvent.RecurrenceType.None;*/
	},
	recurrenceChangeAction: function() {
		// Returns the action that will be taken on this recurrence of an event when it's saved.
		return this.mRecurrenceChangeAction || CalendarEvent.RecurrenceChangeAction.Unknown;
	},
	setRecurrenceChangeAction: function(inChangeType) {
		// Determines the action which will take place when this recurrence is changed.
		if (!inChangeType) this.setRecurrenceChangeAction(CalendarEvent.RecurrenceChangeAction.Unknown);
		if (!$H(CalendarEvent.RecurrenceChangeAction).values().include(inChangeType)) throw 'Unknown change action. See CalendarEvent.RecurrenceChangeAction in caldav.js for options.';
		if (this.recurrenceType() == CalendarEvent.RecurrenceType.None) return false; // ignore actions on non-recurrent events
		this.mRecurrenceChangeAction = inChangeType;
	},
	deleteFromServer: function(inCallback) {
		if (this.mParentCalendarFile.mParentCalendar.mLastPathComponent == 'inbox') return this.mParentCalendarFile.deleteEvent(inCallback);
		globalNotificationCenter().publish('WILL_DELETE_CALENDAR_EVENT', this);
		
		if (this.handleRevertChangeAction()) return false;
		
		if (this.recurrenceType() != CalendarEvent.RecurrenceType.None && this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.Unknown) {
			throw 'Cannot delete a recurrent event without first setting a change action. Set a value using the setRecurrenceChangeAction method.';
		}
		
		if (this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.OnlyThis) {
			this.createExceptionDate();
			return this.mParentCalendarFile.saveToServer(inCallback);
		}
		
		if (this.recurrenceType() == CalendarEvent.RecurrenceType.None || this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.AllFuture) {
			return this.mParentCalendarFile.deleteEvent(inCallback);
		}
		
		throw 'Reached an unknown combination of ' + this.recurrenceType() + ' and ' + this.recurrenceChangeAction();
	},
	createExceptionDate: function(inOptFromEvent) {
		var fromEvent = inOptFromEvent || this;
		// hack the event's DTSTART into an exception
		var clonedExdateStruct = Object.toJSON(fromEvent.mEventStruct['RECURRENCE-ID'] || fromEvent.mEventStruct.DTSTART).evalJSON();
		clonedExdateStruct.key = 'EXDATE';
		this.adjustUTCDateToParentTZID(clonedExdateStruct);
		this.mEventStruct.push(clonedExdateStruct);
		this.mEventStruct['EXDATE'] = clonedExdateStruct;
		
	},
	adjustUTCDateToParentTZID: function(utcDateStruct) {
		// If passed a UTC date-time value try and adjust to parent event TZID
		if (!utcDateStruct.value.match(/Z$/)) return;
		var tzid = this.attributeForProperty('DTSTART', 'TZID');
		if (!tzid) return;
		utcDateStruct.value = timezoneService().adjustUTCToLocal(utcDateStruct.value, tzid);
		this.addPopertyAttribute(utcDateStruct, 'TZID', tzid);
	},
	copyEventStructProperties: function(inDestStruct, inOptPropertiesToCopy) {
		this.mEventStruct.each(function(prop) {
			// skip if this isn't in the properties to copy
			if (inOptPropertiesToCopy && inOptPropertiesToCopy.indexOf(prop.key) >= 0) return;
			// skip if this is an already-defined multiprop
			if (CalendarFile.multiProperties.indexOf(prop.key) >= 0 && inDestStruct[prop.key]) return;
			// if it's defined already, replace it
			if (inDestStruct[prop.key]) {
				var idx = inDestStruct.indexOf(inDestStruct[prop.key]);
				inDestStruct[idx] = prop;
				inDestStruct[prop.key] = prop;
			}
			// if it's not defined, add it to both the struct and the array
			else {
				inDestStruct.push(prop);
				inDestStruct[prop.key] = prop;
			}
		});
	},
	cloneEventStruct: function(inOptKeysToSkip) {
		var clonedStruct = $A([]);
		this.mEventStruct.each(function(prop) {
			// bail if we're skipping recurrence keys and we've hit one
			if (inOptKeysToSkip && inOptKeysToSkip.indexOf(prop.key) >= 0) return;
			// create a copy of the property and set it both as an array val and a keyed val
			var clonedProp = Object.toJSON(prop).evalJSON();
			clonedStruct[clonedProp.key] = clonedProp;
			clonedStruct.push(clonedProp);
		});
		clonedStruct.key = 'VEVENT';
		return clonedStruct;
	},
	detach: function() {
		var clonedStruct = this.cloneEventStruct(['RECURRENCE-ID', 'EXDATE', 'RDATE', 'RRULE']);
		
		// generate a RECURRENCE-ID
		var recurrenceStruct = Object.toJSON(this.mOriginalEventStruct.DTSTART).evalJSON();
		recurrenceStruct.key = 'RECURRENCE-ID';
		clonedStruct['RECURRENCE-ID'] = recurrenceStruct;
		clonedStruct.push(recurrenceStruct);
		
		var detachedEvt = new DetachedCalendarEvent(this.mParentCalendarFile, clonedStruct, this);
		detachedEvt.normalizeRecurrenceUID();
		detachedEvt.resetStacks();
		
		detachedEvt.mParentCalendarFile.mCalendarObj.VCALENDAR[0].VEVENT.push(detachedEvt.mEventStruct);
		detachedEvt.mParentCalendarFile.mEvents.push(detachedEvt);
		return detachedEvt;
	},
	organizer: function() {
		// default organizer info comes from the principal
		var org = {
			uid: principalService().mUserPrincipalURL,
			displayname: (principalService().mUserPrincipalInfo ? principalService().mUserPrincipalInfo.displayname : null)
		};
		// try and fetch from the event
		if (this.valueForProperty('ORGANIZER')) {
			org = {uid:this.valueForProperty('ORGANIZER'), displayname:this.attributeForProperty('ORGANIZER', 'CN'), param:this.mEventStruct.ORGANIZER};
		}
		return org;
	},
	organizerIsPrincipal: function() {
		var org = this.organizer();
		if (org.uid == principalService().mUserPrincipalURL) return true;
		return (principalService().mUserPrincipalInfo.calendarUserAddressSet.indexOf(org.uid) >= 0);
	},
	attendees: function() {
		var attlist = $A([this.organizer()]);
		// Bail if there are no attendees.
		if (!this.mEventStruct.ATTENDEE) return attlist;
		// find the organizer so we can exclude from the list (##6536258)
		var org = this.organizer();
		// find all ATTENDEE parameters
		this.mEventStruct.each(function(param) {
			if (param.key == 'ATTENDEE' && param.value != org.uid) {
				attlist.push({
							   uid: param.value,
							   displayname: (param.calAttrs ? param.calAttrs.CN : null),
							   status: (param.calAttrs ? param.calAttrs.PARTSTAT : null),
							   cutype: (param.calAttrs ? param.calAttrs.CUTYPE : null),
							   param: param
							 });
			}
		});
		return attlist;
	},
	overallAttendeeStatus: function() {
		var attendees = this.attendees();
		var status = null;
		for (var attIdx = 0; attIdx < attendees.length; attIdx++) {
			var att = attendees[attIdx];
			if (att.status && (principalService().mUserPrincipalInfo.calendarUserAddressSet.indexOf(att.uid) < 0)) {
				if (status && status != att.status) {
					return 'MIXED';
				}
				else {
					status = att.status;
				}
			}
		}
		return status;
	},
	addAttendee: function(inAttendeeDict) {
		// don't set an attendee twice
		if ((principalService().mUserPrincipalURL == inAttendeeDict.uid && !this.mEventStruct.ATTENDEE) || this.mEventStruct.detect(function(param) {
			return (param.key == 'ATTENDEE' && param.value == inAttendeeDict.uid);
		})) return false;
		// if there's no organizer yet, add one
		if (!this.valueForProperty('ORGANIZER')) {
			this.setPropertyValue('ORGANIZER', principalService().mUserPrincipalURL);
			if (principalService().mUserPrincipalInfo && principalService().mUserPrincipalInfo.displayname) {
				this.setPropertyAttribute('ORGANIZER', 'CN', principalService().mUserPrincipalInfo.displayname);
			}
		}
		// add an attendee record to the new event
		var att = {key:'ATTENDEE', value:inAttendeeDict.uid, calAttrs:{CN:inAttendeeDict.displayname, PARTSTAT:(inAttendeeDict.status || 'NEEDS-ACTION')}};
		if (inAttendeeDict.cutype) {
			att.calAttrs['CUTYPE'] = inAttendeeDict.cutype;
			// if this is a room, remove the other room resources
			if (inAttendeeDict.cutype == 'ROOM' && (!inAttendeeDict.allowMultipleRooms)) {
				this.removeRoomAttendee();
			}
		}
		this.mEventStruct.push(att);
		this.mEventStruct['ATTENDEE'] = att;
		this.updateStack().push('ATTENDEE');
		// add ourselves as an attendee (##6536258)
		this.addAttendee(Object.extend(this.organizer(), {cutype:'INDIVIDUAL', status:'ACCEPTED'}));
		return true;
	},
	removeRoomAttendee: function() {
		for (var paramIdx = this.mEventStruct.length-1; paramIdx >= 0; paramIdx--) {
			var param = this.mEventStruct[paramIdx];
			if (param.key == 'ATTENDEE' && param.calAttrs && param.calAttrs['CUTYPE'] == 'ROOM') {
				this.mEventStruct.splice(paramIdx, 1);
				this.updateStack().push('ATTENDEE');
				return param.value;
			}
		}
		return null;
	},
	removeAttendeeWithUID: function(inAttendeeUID) {
		for (var paramIdx = 0; paramIdx < this.mEventStruct.length; paramIdx++) {
			var param = this.mEventStruct[paramIdx];
			if ((param.key == 'ATTENDEE' || param.key == 'LOCATION') && param.value == inAttendeeUID) {
				this.mEventStruct.splice(paramIdx, 1);
				this.updateStack().push('ATTENDEE');
				return true;
			}
		}
		return false;
	},
	principalAttendee: function() {
		return this.attendees().detect(function(attendee) {
			return (principalService().mUserPrincipalInfo.calendarUserAddressSet.indexOf(attendee.uid) >= 0);
		});
	},
	participantStatus: function() {
		if (this.organizerIsPrincipal()) return null;
		var pa = this.principalAttendee();
		return (pa && pa.param && pa.param.calAttrs ? pa.param.calAttrs.PARTSTAT : null);
	},
	setParticipantStatus: function(inParticipantStatus) {
		var pa = this.principalAttendee();
		if (!pa) return false;
		if (!pa.param.calAttrs) pa.param.calAttrs = {};
		pa.param.calAttrs.PARTSTAT = inParticipantStatus;
		// try to set the TRANSP and X-APPLE-NEEDS-REPLY parameters
		this.setPropertyValue('TRANSP', (inParticipantStatus == 'DECLINED') ? 'TRANSPARENT' : 'OPAQUE');
		if (this.valueForProperty('X-APPLE-NEEDS-REPLY') == 'TRUE') this.setPropertyValue('X-APPLE-NEEDS-REPLY', 'FALSE');
		if (pa.param.calAttrs.RSVP) delete pa.param.calAttrs.RSVP;
		return true;
	},
	getFreeBusyReport: function(inCallback, inOptStartDate, inOptEndDate, inOptAttendees) {
		if (!this.mFreeBusyLookupObj) this.mFreeBusyLookupObj = new FreeBusyLookup(this);
		var sd = inOptStartDate || this.startDate();
		var ed = inOptEndDate || getEndDateUsingDuration(this.startDate(), this.duration());
		this.mFreeBusyLookupObj.getFreeBusyForDateRange(sd, ed, inCallback, inOptAttendees);
	},
	incrementSequenceNumber: function() {
		var existingSequenceNumber = this.valueForProperty('SEQUENCE');
		existingSequenceNumber = existingSequenceNumber && existingSequenceNumber.match(/^\d/) ? parseInt(existingSequenceNumber) : 0;
		this.setPropertyValue('SEQUENCE', ''+(++existingSequenceNumber));
	},
	handleRevertChangeAction: function() { // for subclass use only
		// if we're postponing or reverting, handle this first
		if ([CalendarEvent.RecurrenceChangeAction.Revert, CalendarEvent.RecurrenceChangeAction.Postpone].indexOf(this.recurrenceChangeAction()) >= 0) {
			// if we're reverting the event, do so now
			if (this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.Revert) this.revertToSaved(true);
			// set the change action back to unknown
			this.setRecurrenceChangeAction(CalendarEvent.RecurrenceChangeAction.Unknown);
			return true;
		}
		return false;
	},
	saveToServer: function(inCallback) {
		globalNotificationCenter().publish('WILL_SAVE_CALENDAR_EVENT', this);
		if (this.handleRevertChangeAction()) return false;
		// shared callback for after saving
		var afterSaveCallback = function(transport) {
			this.mIsNew = false;
			this.setRecurrenceChangeAction(CalendarEvent.RecurrenceChangeAction.Unknown);
			if (inCallback) inCallback(transport);
		}
		// if this is a new event or doesn't have recurrences, or if the recurrence info is new, we can just save it normally
		if (this.isNew() || this.recurrenceType() == CalendarEvent.RecurrenceType.None || this.recurrenceIsNew()) {
			if (this.mPartStatChange) this.setParticipantStatus(this.mPartStatChange);
			return this.mParentCalendarFile.saveToServer(afterSaveCallback.bind(this));
		}
		// if we moved at all...
		if (this.recurrenceType() == CalendarEvent.RecurrenceType.First && this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.AllFuture && Object.toJSON(this.mEventStruct.DTSTART) != Object.toJSON(this.mOriginalEventStruct.DTSTART)) {
			// find out how much the start date moved
			var movedAmt = getDurationUsingEndDate(this.mOriginalLocalStartDate, this.startDate(false, true));
			// update all EXDATES on this event
			this.mEventStruct.each(function(prop) {
				if (prop.key != 'EXDATE') return;
				var dt = createDateObjFromISO8601(prop.value);
				dt = getEndDateUsingDuration(dt, movedAmt);
				prop.value = dateObjToISO8601(dt);
			});
			// find all other events in the calendar file and move their recurrence IDs
			this.mParentCalendarFile.mEvents.each(function(oEvt) {
				if (!oEvt.recurrenceID()) return;
				var recurrenceDate = createDateObjFromISO8601(oEvt.recurrenceID());
				recurrenceDate = getEndDateUsingDuration(recurrenceDate, movedAmt);
				oEvt.setRecurrenceID(dateObjToISO8601(recurrenceDate, false, true));
			});
		}
		// if this is an already separated calendar event, assume "only this" and save as-is
		if (this.recurrenceType() == CalendarEvent.RecurrenceType.Separated) {
			if (this.mPartStatChange) this.setParticipantStatus(this.mPartStatChange);
			return this.mParentCalendarFile.saveToServer(afterSaveCallback.bind(this));
		}
		// if this event has no recurrence change action, throw an exception here
		if (this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.Unknown) {
			throw 'Cannot save a recurrent event without first setting a change action. Set a value using the setRecurrenceChangeAction method.';
		}
		// just save if we chose "All Future"
		if (this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.AllFuture) {
			return this.mParentCalendarFile.saveToServer(afterSaveCallback.bind(this));
		}
		// if "Only This" is chosen, detach the event
		if (this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.OnlyThis) {
			this.mReplacementEvent = this.detach();
			if (this.mPartStatChange) this.mReplacementEvent.setParticipantStatus(this.mPartStatChange);
			this.revertToSaved(true);
			return this.mParentCalendarFile.saveToServer(afterSaveCallback.bind(this));
		}
		throw 'Reached an unknown combination of ' + this.recurrenceType() + ' and ' + this.recurrenceChangeAction();
	},
	revertToSaved: function(inOptRevertDates) {
		this.setRecurrenceChangeAction(CalendarEvent.RecurrenceChangeAction.Unknown);
		var idx = this.mParentCalendarFile.mCalendarObj.VCALENDAR[0].VEVENT.indexOf(this.mEventStruct);
		this.mParentCalendarFile.mCalendarObj.VCALENDAR[0].VEVENT.splice(idx, 1, this.mOriginalEventStruct);
		this.mEventStruct = this.mOriginalEventStruct;
		this.resetStacks();
		globalNotificationCenter().publish('DID_REVERT_CALENDAR_EVENT', this);
	},
	moveToCalendar: function(inDestinationCalendar, inCallback) {
		return this.mParentCalendarFile.moveToCalendar(inDestinationCalendar, inCallback);
	},
	userCanWriteContent: function() {
		return this.mParentCalendarFile.mParentCalendar.userCanWriteContent();
	}
});

/* 
 * An ExpandedCalendarEvent is a "virtual" calendar event which represents a recurrence expansion.
 * It has no equivalent on the server until you detach it.
 */
var ExpandedCalendarEvent = Class.create(CalendarEvent, {
	// FIXME expanded events should show dotted lines for invites too
	initialize: function($super, inParentCalendarFile, inEventStruct, inParentEvent) {
		if (!inParentEvent)
			throw 'Tried to create an expanded calendar event without a parent event.';
		this.mParentEvent = inParentEvent;
		$super(inParentCalendarFile, inEventStruct);
		// server sends back GMT datetimes with a timezone; correct
		var tzid = this.attributeForProperty('DTSTART', 'TZID');
		var dtstart = this.valueForProperty('DTSTART');
		if (tzid && dtstart && !dtstart.match(/Z$/)) {
			this.mEventStruct.DTSTART.value = timezoneService().correctDateForTimezone(dtstart, tzid);
		}
	},
	valueForProperty: function($super, inPropertyName) {
	 	return $super(inPropertyName) || this.mParentEvent.valueForProperty(inPropertyName);
	},
	attributeForProperty: function($super, inPropertyName, inAttributeName) {
		return $super(inPropertyName, inAttributeName) || this.mParentEvent.attributeForProperty(inPropertyName, inAttributeName);
	},
	allReferencedTZIDs: function($super) {
		return $A($super(), this.mParentEvent.allReferencedTZIDs()).flatten().uniq();
	},
	recurrenceType: function() {
		return CalendarEvent.RecurrenceType.Nth;
	},
	exceptionDates: function() {
		return this.mParentEvent.exceptionDates();
	},
	deleteFromServer: function($super, inCallback) {
		globalNotificationCenter().publish('WILL_DELETE_CALENDAR_EVENT', this);
		if (this.handleRevertChangeAction()) return false;
		if (this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.OnlyThis) {
			this.createExceptionDate();
			return this.mParentEvent.mParentCalendarFile.saveToServer(inCallback);
		}
		if (this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.AllFuture) {
			// set the UNTIL on the original recurrence info to 1 sec before this event
			var untilDate = this.startDate();
			untilDate.setSeconds(untilDate.getSeconds()-1);
			this.recurrenceInfo().setUntil(untilDate, this.banner());
			return this.mParentEvent.mParentCalendarFile.saveToServer(inCallback);
		}
		throw 'Reached an unknown combination of ' + this.recurrenceType() + ' and ' + this.recurrenceChangeAction();
	},
	detach: function() {
		// don't copy these properties when cloning the detached event
		var propertiesToSkip = ['DTSTART', 'DTEND', 'DURATION', 'RECURRENCE-ID', 'EXDATE', 'RDATE', 'RRULE'];
		if (this.updateStack().indexOf('ATTENDEE') >= 0) propertiesToSkip.push('ATTENDEE');
		// clone the original event to the detached one
		var clonedStruct = this.mParentEvent.cloneEventStruct(propertiesToSkip);
		// copy the current event's values on top
		this.copyEventStructProperties(clonedStruct);
		
		// Fix up timezones
		this.adjustUTCDateToParentTZID(clonedStruct['RECURRENCE-ID']);
		this.adjustUTCDateToParentTZID(clonedStruct['DTSTART']);
		if (clonedStruct['DTEND']) {
			this.adjustUTCDateToParentTZID(clonedStruct['DTSTART']);
		}

		var detachedEvt = new DetachedCalendarEvent(this.mParentEvent.mParentCalendarFile, clonedStruct, this);
		detachedEvt.mParentCalendarFile.mCalendarObj.VCALENDAR[0].VEVENT[detachedEvt.mParentCalendarFile.mCalendarObj.VCALENDAR[0].VEVENT.length] = clonedStruct;
		detachedEvt.mParentCalendarFile.mEvents.push(detachedEvt);
		return detachedEvt;
	},
	createExceptionDate: function() {
		this.mParentEvent.createExceptionDate(this);
	},
	attendees: function() {
		return this.mParentEvent.attendees();
	},
	setRecurrenceFrequency: function(inRecurrenceType) {
		this.mParentEvent.setRecurrenceFrequency(inRecurrenceType);
	},
	recurrenceInfo: function() {
		return this.mParentEvent.recurrenceInfo();
	},
	recurrenceIsNew: function() {
		return false;
	},
	saveToServer: function($super, inCallback) {
		globalNotificationCenter().publish('WILL_SAVE_CALENDAR_EVENT', this);
		if (this.handleRevertChangeAction()) return false;
		// if the event has no recurrence change action, throw an exception here
		if (this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.Unknown) {
			throw 'Cannot save a recurrent event without first setting a change action. Set a value using the setRecurrenceChangeAction method.';
		}
		var callbackCount = 1; // run the callback when this is decremented to 0; for save operations that have multiple results
		var afterSaveCallback = function(transport) {
			if (--callbackCount > 0) return;
			this.mIsNew = false;
			this.setRecurrenceChangeAction(CalendarEvent.RecurrenceChangeAction.Unknown);
			if (inCallback) inCallback(transport);
		}
		// if "Only This" is chosen, detach the event
		if (this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.OnlyThis) {
			this.mReplacementEvent = this.detach();
			if (this.mPartStatChange) this.mReplacementEvent.setParticipantStatus(this.mPartStatChange);
			this.revertToSaved(true);
			return this.mReplacementEvent.mParentCalendarFile.saveToServer(afterSaveCallback.bind(this));
		}
		// if "All Future" is selected, change the original's recurrence end date
		if (this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.AllFuture) {
			// clone the original event to the detached one
			var clonedStruct = this.mParentEvent.cloneEventStruct(['RECURRENCE-ID', 'DTSTART']);
			// copy the current event's values on top
			this.copyEventStructProperties(clonedStruct);
			this.mReplacementEvent = this.mParentCalendarFile.mParentCalendar.createCalendarEvent();
			// stash away the UID
			var uid = this.mReplacementEvent.valueForProperty('UID');
			// clone the detached event and its parent into the new event
			this.mReplacementEvent.mEventStruct = clonedStruct;
			this.mReplacementEvent.mParentCalendarFile.mCalendarObj.VCALENDAR[0].VEVENT[0] = clonedStruct;
			this.mReplacementEvent.setPropertyValue('RECURRENCE-ID', null);
			this.mReplacementEvent.mEventStruct.UID.value = uid;
			this.mReplacementEvent.mEventStruct.each(function(prop) {if (prop.key == 'UID') prop.value = uid});

			// We need to add a "uid:" prefix to make sure this value can legitimately be used as a property on an array
			this.mReplacementEvent.uid = "uid:" + uid;

			this.mReplacementEvent.resetStacks();
			if (this.mPartStatChange) this.mReplacementEvent.setParticipantStatus(this.mPartStatChange);
			// re-set the UID
			// set the UNTIL on the original recurrence info to 1 sec before this event
			var untilDate = this.startDate();
			untilDate.setSeconds(untilDate.getSeconds()-1);
			this.recurrenceInfo().setUntil(untilDate, this.banner());
			// save both events to the server
			callbackCount++;
			this.mParentEvent.mParentCalendarFile.saveToServer(afterSaveCallback.bind(this));
			return this.mReplacementEvent.mParentCalendarFile.saveToServer(afterSaveCallback.bind(this));
		}
		throw 'Reached an unknown combination of ' + this.recurrenceType() + ' and ' + this.recurrenceChangeAction();
	}
});

var DetachedCalendarEvent = Class.create(CalendarEvent, {
	initialize: function($super, inParentCalendarFile, inEventStruct, inParentEvent) {
		if (!inParentEvent)
			throw 'Tried to create a detached calendar event without a parent event.';
		this.mParentEvent = inParentEvent;
		$super(inParentCalendarFile, inEventStruct);
	},
	recurrenceType: function() {
		return CalendarEvent.RecurrenceType.Separated;
	},
	deleteFromServer: function($super, inCallback) {
		globalNotificationCenter().publish('WILL_DELETE_CALENDAR_EVENT', this);
		if (this.handleRevertChangeAction()) return false;
		if (this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.OnlyThis) {
			// FIXME need to remove event struct in deleteFromServer for OnlyThis on an DetachedCalendarEvent
			this.createExceptionDate();
			return this.saveToServer(inCallback);
		}
		if (this.recurrenceChangeAction() == CalendarEvent.RecurrenceChangeAction.AllFuture) {
			if (this.getDate(true) == this.mParentEvent.getDate(true)) {
				return $super(inCallback);
			}
			// FIXME need to implement delete all future for separated events
			throw 'need to implement delete all future for separated events';
		}
		throw 'Reached an unknown combination of ' + this.recurrenceType() + ' and ' + this.recurrenceChangeAction();
	},
	createExceptionDate: function() {
		// FIXME: this line below has never worked, but shouldn't cause any problems
		this.mParentCalendarFile.mEvents = this.mParentCalendarFile.mEvents.without(this);
		
		var idx = this.mParentCalendarFile.mCalendarObj.VCALENDAR[0].indexOf(this.mParentCalendarFile.mCalendarObj.VCALENDAR[0].VEVENT);
		var newEventList = this.mParentCalendarFile.mCalendarObj.VCALENDAR[0].VEVENT.without(this.mEventStruct);
		this.mParentCalendarFile.mCalendarObj.VCALENDAR[0][idx] = newEventList;
		this.mParentCalendarFile.mCalendarObj.VCALENDAR[0].VEVENT = newEventList;
		
		this.mParentEvent.createExceptionDate(this);
	},
	setRecurrenceFrequency: function(inRecurrenceType) {
		this.mParentEvent.setRecurrenceFrequency(inRecurrenceType);
	},
	recurrenceInfo: function() {
		return this.mParentEvent.recurrenceInfo();
	},
	recurrenceIsNew: function() {
		return false;
	}
});

// Represents an event that you've been invited to, but for which no parent is available
var DetachedAttendeeCalendarEvent = Class.create(CalendarEvent, {
	initialize: function($super, inParentCalendarFile, inEventStruct) {
		$super(inParentCalendarFile, inEventStruct);
	},
	recurrenceType: function() {
		return CalendarEvent.RecurrenceType.Separated;
	},
	deleteFromServer: function($super, inCallback) {
		// this is actually the equivalent of declining
		// FIXME: we get shown a "Really delete?" message, but iCal shows a "Decline?" message
		this.setParticipantStatus('DECLINED');
		this.saveToServer(inCallback);
	},
	createExceptionDate: function() {
		throw 'cannot create an exception date for an event you do not own';
	},
	setRecurrenceFrequency: function(inRecurrenceType) {
		throw 'cannot modify recurrence frequency for an event you do not own';
	},
	recurrenceInfo: function() {
		return null;
	},
	recurrenceIsNew: function() {
		return false;
	}
});

CalendarEvent.RecurrenceType = {
	None: 'NO-RECURRENCE',
	First: 'FIRST-RECURRENCE',
	Nth: 'NTH-RECURRENCE',
	Separated: 'SEPARATED-RECURRENCE'
}

CalendarEvent.RecurrenceChangeAction = {
	Unknown: 'UNKNOWN',
	AllFuture: 'ALL-FUTURE',
	OnlyThis: 'ONLY-THIS',
	Revert: 'REVERT',
	Postpone: 'POSTPONE'
}


/**
 * CalendarRecurrence
 * Data class for getting and setting recurrence info.
 */
var CalendarRecurrence = Class.create();
CalendarRecurrence.prototype = {
	initialize: function(inParentCalendarEvent, inRecurrenceString) {
		this.mParentCalendarEvent = inParentCalendarEvent;
		this.mRecurrenceStruct = {};
		$A(inRecurrenceString.split(';')).each(function(keyval) {
			var setting = keyval.match(/^([^=]+)=(.*)$/);
			if (setting) this.mRecurrenceStruct[setting[1]] = setting[2];
		}, this);
	},
	updatedRecurrenceString: function() {
		return $H(this.mRecurrenceStruct).collect(function(attr) {
			return attr.key+'='+attr.value;
		}).join(';');
	},
	frequency: function() {
		return this.mRecurrenceStruct.FREQ;
	},
	isWeekdays: function() {
		var byday = this.mRecurrenceStruct.BYDAY;
		return (this.frequency() == 'WEEKLY' && byday && byday.split(',').length == 5 && !['MO', 'TU', 'WE', 'TH', 'FR'].detect(function(day) {
			return (byday.indexOf(day) < 0);
		}));
	},
	count: function() {
		return this.mRecurrenceStruct.COUNT;
	},
	setCount: function(inCount) {
		if (this.mRecurrenceStruct.UNTIL) delete this.mRecurrenceStruct.UNTIL;
		if (!inCount || !inCount.match(/^\d/)) {
			if (this.mRecurrenceStruct.COUNT) delete this.mRecurrenceStruct.COUNT;
		}
		else {
			this.mRecurrenceStruct.COUNT = ''+parseInt(inCount);
		}
		this.mParentCalendarEvent.setPropertyValue('RRULE', this.updatedRecurrenceString());
	},
	until: function(inOptReturnRawFormat) {
		if (!this.mRecurrenceStruct.UNTIL) return null;
		return (inOptReturnRawFormat ? this.mRecurrenceStruct.UNITL : createDateObjFromISO8601(this.mRecurrenceStruct.UNTIL));
	},
	setUntil: function(inUntil, inBanner) {
		// convert date object to ISO8601, if applicable
		if (inUntil && inUntil.constructor != String) inUntil = dateObjToISO8601(inUntil);
		// move from the event's timezone to GMT
		inUntil = timezoneService().correctDateForTimezone(inUntil, this.mParentCalendarEvent.tzid(), true);
		// Web calendar client needs to use a DATE value for the UNTIL when DTSTART is also a DATE
		if (inBanner) inUntil = removeTime(inUntil);
		if (this.mRecurrenceStruct.COUNT) delete this.mRecurrenceStruct.COUNT;
		if (!inUntil) {
			if (this.mRecurrenceStruct.UNTIL) delete this.mRecurrenceStruct.UNTIL;
		}
		else {
			this.mRecurrenceStruct.UNTIL = inUntil;
		}
		this.mParentCalendarEvent.setPropertyValue('RRULE', this.updatedRecurrenceString());
	}
}


/**
 * FreeBusyLookup
 * Encapsulation for freebusy lookup.
 */
FreeBusyLookup = Class.create();
FreeBusyLookup.prototype = {
	initialize: function(inParentCalendarEvent) {
		this.mParentCalendarEvent = inParentCalendarEvent;
	},
	getFreeBusyForDateRange: function(inStartDate, inEndDate, inCallback, inOptAttendees) {
		var attendees = inOptAttendees || this.mParentCalendarEvent.attendees();
		// pull any email address attendees from the report
		attendees = attendees.findAll(function(att) {
			return (!att.uid.match(/^mailto:/));
		});
		// format looks like: $A([{url:principalService().mUserPrincipalURL, displayname:'Super User'}]);
		var gotPrincipalInfoCallback = function(inPrincipalInfo) {
			var reportString = String.format(FreeBusyLookup.defaultFormat, {
				DTSTAMP: dateObjToISO8601(new Date(), true, true),
				ORGANIZER: this.mParentCalendarEvent.organizer().uid,
				DTSTART: dateObjToISO8601(inStartDate, true, true),
				DTEND: dateObjToISO8601(inEndDate, true, true),
				UID: CalendarUuid.generateUUIDString(),
				attendees: attendees.collect(function(attendeeObj) {
					return String.format('ATTENDEE%(cn)s:%(uid)s', {
						cn: (attendeeObj.displayname ? ';CN='+attendeeObj.displayname : ''),
						uid: attendeeObj.uid
					});
				}).join('\n')
			});
			var reportCallback = function(transport) {
				// this should never happen; probably means we got invalid XML or a MIME type that isn't text/xml
				if (!transport.responseXML) {
					reportError('Report response is missing responseXML. responseText = '+transport.responseText || '');
					return false;
				}
				// get each response object
				var freeBusyInfoForAttendees = $A([]);
				Element.childrenWithNodeName(Element.firstChildWithNodeName(transport.responseXML, 'schedule-response'), 'response').each(function(response) {
					var recipient = Element.firstNodeValue(Element.elementWithSimpleXPath(response, 'recipient.href'));
					// check for success
					var freeBusyObj = {recipient:recipient, requestStatus:Element.firstNodeValue(Element.firstChildWithNodeName(response, 'request-status'))};
					if (freeBusyObj.requestStatus == '2.0;Success') {
						freeBusyObj.blocks = $A([]);
						// create a temporary calendar file
						var calendarText = Element.firstNodeValue(Element.firstChildWithNodeName(response, 'calendar-data'));
						var tempCalFile = new CalendarFile(calendarText, null, this.mParentCalendarEvent.mParentCalendarFile.mParentCalendar);
						// find all of the freebusy properties
						tempCalFile.mCalendarObj.VCALENDAR[0].VFREEBUSY[0].each(function(prop) {
							if (prop.key == 'FREEBUSY') {
								$A(prop.value.split(',')).each(function(pair) {
									var splitPair = pair.split('/');
									var duration = null;
									// make sure we have a duration, not an end date. Then get a duration object
									if (splitPair[1].match(/^P/)) {
										duration = durationFromISO8601(splitPair[1]);
									}
									else {
										duration = getDurationUsingEndDate(createDateObjFromISO8601(splitPair[0], true), createDateObjFromISO8601(splitPair[1], true));
									}
									// push a freebusy block object onto the list
									freeBusyObj.blocks.push({
										type: prop.calAttrs.FBTYPE,
										startDate: createDateObjFromISO8601(timezoneService().correctDateForTimezone(splitPair[0], null, false)),
										duration: duration
									});
								});
							}
						});
						freeBusyInfoForAttendees.push(freeBusyObj);
					}
				}, this);
				if (inCallback) inCallback(freeBusyInfoForAttendees);
			}
			return new Ajax.CalendarRequest(inPrincipalInfo.outboxurl, {
				method: 'post',
				contentType: 'text/calendar',
				postBody: reportString,
				recipients: attendees.pluck('uid'),
				requestHeaders: {
					originator: principalService().mUserPrincipalURL
				},
				onSuccess: reportCallback.bind(this),
				onException: reportError,
				errorNotificationObject: this
			});
		}
		principalService().getPrincipalInfo(gotPrincipalInfoCallback.bind(this));
	}
}
FreeBusyLookup.defaultFormat = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Apple Inc.//Web Calendar Client//\nMETHOD:REQUEST\n'
		+ 'BEGIN:VFREEBUSY\nDTSTAMP:%(DTSTAMP)s\nORGANIZER:%(ORGANIZER)s\nDTSTART:%(DTSTART)s\nDTEND:%(DTEND)s\nUID:%(UID)s\n'
		+ '%(attendees)s\nEND:VFREEBUSY\nEND:VCALENDAR';
FreeBusyLookup.emailAddressTest = /^(mailto:)*[^\s\/:]+@\S+\.\S+/;



var UpcomingEventsService = Class.createWithSharedInstance('upcomingEventsService');
UpcomingEventsService.DayRange = 30;  // # of days worth of events
UpcomingEventsService.prototype = {
	initialize: function()
	{
		this.mEvents   = [];
		this.mRemoteCalendarCollection = null;
		
		this.gotPrincipalInfo      = this.gotPrincipalInfo.bind(this);
		this.gotCalendarCollection = this.gotCalendarCollection.bind(this);
		this.gotCalendarEvents     = this.gotCalendarEvents.bind(this);
		
		// kick off by fetching the principal info...
		principalService().getPrincipalInfo(this.gotPrincipalInfo);
	},
	gotPrincipalInfo: function()
	{
		// once we have the pricipal info, get the entity's calendar collection...
		if (window.globalNotificationCenter) {
			globalNotificationCenter().subscribe('GOT_CALENDAR_COLLECTION', this.gotCalendarCollection, this.mRemoteCalendarCollection);
		}
		else {
			globalNotificationCenter().subscribe('GOT_CALENDAR_COLLECTION', this.gotCalendarCollection, this.mRemoteCalendarCollection);
		}
		// calendars are fetched on instantiation
		this.mRemoteCalendarCollection = new RemoteCalendarCollection(principalService().mUserPrincipalInfo.url + '/');
	},
	gotCalendarCollection: function(inNotificationType, inCalendarCollection)
	{
		// now call refresh, which will fetch the events... 
		// though since the notification could come from any instance of RemoteCalendarCollection, make sure this one is from ours.
		if (inCalendarCollection == this.mRemoteCalendarCollection) {
			this.reload();
		}
	},
	
	reload: function()
	{
		if (!this.mRemoteCalendarCollection) return;
		
		var start = new Date();
		var end = new Date();
		end.setDate(start.getDate() + UpcomingEventsService.DayRange);
		this.mRemoteCalendarCollection.getEventsForDateRange(start, end, this.gotCalendarEvents);
	},
	gotCalendarEvents: function(inRequest, inCalendarEvents)
	{
		var timezoneCallback = function() {
			globalNotificationCenter().publish('GOT_UPCOMING_EVENTS', this.mEvents);
		}.bind(this);
		this.mEvents = inCalendarEvents;
		var timezoneEvents = this.mEvents.clone();
		timezoneService().fetchOffsetsForEvents(timezoneCallback, timezoneEvents);
	}
};


/**
 * Useful string extensions.
 */
Object.extend(String, {
	append: function(inOrig, inNew/*[, delimiter]*/) {
		var delimiter = arguments.length > 2 ? arguments[2] : ' ';
		if (inNew) {
			if (inOrig != '') inOrig += delimiter;
			inOrig += inNew;
		}
		return inOrig;
	},
	appendPathComponent: function(inString, inPathComponent) {
		return inString.replace(/\/$/, '') + '/' + inPathComponent.replace(/^\//, '');
	},
	appendPathExtension: function(inString, inPathExtension) {
		return inString.replace(/\.[^.]+$/, '') + '.' + inPathExtension.replace(/^\./, '');
	},
	addSlash: function(inString) {
		return inString.replace(/([^\/])$/, '$1/');
	},
	removeSlash: function(inString) {
		return inString.replace(/\/+$/, '');
	},
	lastPathComponent: function(inString) {
		return inString.match(/\/([^\/]+)\/*$/)[1];
	},
	format: function(inFormatStr, inDictionary) {
		return $H(inDictionary).inject(inFormatStr, function(str, cur) {
			var r = new RegExp('%\\('+cur.key+'\\)[sdig]', 'gi');
			return str.replace(r, cur.value);
		});
	},
	hexValueForColorString: function(inColorString) {
		var rgbColorMatch = inColorString.match(/rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\s*\)/);
		if (!rgbColorMatch) return inColorString;
		var colorStr = '#';
		for (var colorMatchIdx = 1; colorMatchIdx < 4; colorMatchIdx++) {
			colorStr += padNumberStr(parseInt(rgbColorMatch[colorMatchIdx]).toString(16), 2);
		}
		return colorStr;
	}
});

function padNumberStr(theNumber, digits) {
	var padder = ((arguments.length > 2) ? arguments[2] : '0');
	var theString = "";
	theString += theNumber;
	
	for (var i = 0; i < (digits-theString.length); i++) {
		theString = padder + theString;
	}
	
	return theString;
}


/**
 * Useful array methods.
 */
Object.extend(Array, {
	// Sort an array of dictionaries.
	sortArrayUsingKey: function(inArray, inKey) {
		var sortCallback = function(a, b) {
			if (!(a[inKey])) return 0;
			if (a[inKey] > b[inKey]) return 1;
			else if (a[inKey] < b[inKey]) return -1;
			return 0;
		}
		return inArray.sort(sortCallback);
	},
	removeDuplicateRows: function(inArray, inOptPreferenceTest) {
		// Use the UID key to check for duplicate rows.
		var keyedArray = inArray.clone();
		for (var rowIdx = 0; rowIdx < keyedArray.length; rowIdx++) {
			var row = keyedArray[rowIdx];
			if (!row.uid) continue;
			// check for duplicates
			if (keyedArray[row.uid]) {
				keyedArray.splice(rowIdx--, 1);
				// if the preference test returns true, substitute the later occurrence for the earlier one
				if (inOptPreferenceTest && inOptPreferenceTest(keyedArray[row.uid], row)) {
					var earlierIndex = keyedArray.indexOf(keyedArray[row.uid]);
					keyedArray.splice(earlierIndex, 1, row);
				}
			}
			keyedArray[row.uid] = row;
		}
		return keyedArray.clone();
	}
});


/**
 * Methods for traversing other DOMs.
 */
Object.extend(Element, {
	// childrenWithNodeName and firstChildWithNodeName are used when we're working with a different document, otherwise use Selector
	childrenWithNodeName: function(inParent, inNodeName) {
		var retList = [];
		var children = inParent.childNodes;
		for (var childIdx = 0; childIdx < children.length; childIdx++) {
			if (children.item(childIdx).nodeName == inNodeName) retList.push(children.item(childIdx));
		}
		return retList;
	},
	// Use Selector on this one as well, unless it's a different document. Uses a simple dot-delimited path. No fancy stuff.
	elementWithSimpleXPath: function(inParent, inPath) {
		return $A(inPath.split('.')).inject(inParent, function(currentParent, pathComponent) {
			return currentParent ? Element.firstChildWithNodeName(currentParent, pathComponent) : null;
		});
	},
	firstChildWithNodeName: function(inParent, inNodeName) {
		var children = inParent.childNodes;
		for (var childIdx = 0; childIdx < inParent.childNodes.length; childIdx++) {
			if (children.item(childIdx).nodeName == inNodeName) return children.item(childIdx);
		}
		return null;
	},
	firstNodeValue: function(inElement) {
		var elm = (inElement && inElement.constructor == String) ? $(inElement) : inElement;
		if (elm && elm.firstChild) return elm.firstChild.nodeValue || '';
		return '';
	}
});


/**
 * UUID
 */
var CalendarUuid = Class.create();
CalendarUuid.prototype = {
	initialize: function() {
		var olderDate = new Date(1582, 10, 15, 0, 0, 0, 0);
		var now = new Date();
		var msec = now.valueOf() - olderDate.valueOf();
		var nic = padNumberStr(hex_hmac_md5(this.getShiftedBits(this.getRandomNumberInRange(0, 4095), 0, 16), location.href), 12).substring(0, 12);
		var uidArray = [
			this.getShiftedBits(msec, 0, 8),
			this.getShiftedBits(msec, 8, 12),
			this.getShiftedBits(msec, 12, 19)+'1',
			this.getShiftedBits(this.getRandomNumberInRange(0, 4095), 0, 2) + this.getShiftedBits(this.getRandomNumberInRange(0, 4095), 0, 2),
			nic
		];
		this.mStringValue = uidArray.join('-');
	},
	getRandomNumberInRange: function(inMin, inMax) {
		return Math.min(Math.max(Math.round((Math.random() * (inMin + inMax)) - inMin), inMin), inMax);
	},
	getShiftedBits: function(inValue, inStart, inEnd) {
		var base16str = padNumberStr(inValue.toString(16), inEnd);
		return base16str.substring(inStart, inEnd);
	},
	toString: function() {
		return this.mStringValue;
	}
}
CalendarUuid.generateUUIDString = function() {
	return (new CalendarUuid()).toString();
}

/**
 * Override Prototype's Request object to allow custom HTTP methods.
 */
Ajax.CalendarRequest = Class.create();
Object.extend(Object.extend(Ajax.CalendarRequest.prototype, Ajax.Request.prototype), {
	setRequestRecipients: function() {
		if (this.options.recipients) {
			$A(this.options.recipients).each(function(recipient) {
				this.transport.setRequestHeader('Recipient', recipient);
			}, this);
		}
	},
	request: function(url) {
		if (!this.options.onFailure && this.options.errorNotificationObject) {
			this.options.on0 = function() {
				if (!globalNotificationCenter().publish('ERROR_FROM_SERVER', this.options.errorNotificationObject, {request:this, errorObj:this}) && window.dispatchException) dispatchException(this);
			}.bind(this);
			this.options.onFailure = function(e) {
				if (!globalNotificationCenter().publish('ERROR_FROM_SERVER', this.options.errorNotificationObject, {request:this, errorObj:e}) && window.dispatchException) dispatchException(e);
			}.bind(this);
		}
		this.url = url;
		this.method = this.options.method;
		var params = Object.clone(this.options.parameters);

		this.parameters = params;

		if (params = Hash.toQueryString(params)) {
			// when GET, append parameters to URL
			if (this.method == 'get')
				this.url += (this.url.include('?') ? '&' : '?') + params;
			else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent))
				params += '&_=';
		}

		try {
			if (this.options.onCreate) this.options.onCreate(this.transport);
			Ajax.Responders.dispatch('onCreate', this, this.transport);
			
			if (Prototype.Browser.IE && Ajax.CalendarRequest.gimpedIEMethods.include(this.method.toUpperCase())) {
				this.actualMethod = this.method.toUpperCase();
				this.method = 'POST';
			}
			
			this.transport.open(this.method.toUpperCase(), this.url,
				this.options.asynchronous);

			if (this.options.asynchronous)
				setTimeout(function() { this.respondToReadyState(1) }.bind(this), 10);

			this.transport.onreadystatechange = this.onStateChange.bind(this);
			this.setRequestHeaders();
			
			// IE workaround since it won't send REPORT or MKCALENDAR requests
			if (this.actualMethod) this.transport.setRequestHeader('X-HTTP-Method-Override', this.actualMethod);
			
			this.setRequestRecipients();

			this.body = this.method == 'get' ? null : (this.options.postBody || params);
			this.transport.send(this.body);

			/* Force Firefox to handle ready state 4 for synchronous requests */
			if (!this.options.asynchronous && this.transport.overrideMimeType)
				this.onStateChange();

		}
		catch (e) {
			this.dispatchException(e);
		}
	},
	success: function() {
		var status = this.getStatus();
		// http://dev.jquery.com/ticket/1450
		return (!status || (status >= 200 && status < 300) || /* 7231636 */ (Prototype.Browser.IE && status == 1223));
  	}
});
Ajax.CalendarRequest.gimpedIEMethods = $A(['REPORT', 'MKCALENDAR']);

if (window.loaded) loaded('caldav.js');