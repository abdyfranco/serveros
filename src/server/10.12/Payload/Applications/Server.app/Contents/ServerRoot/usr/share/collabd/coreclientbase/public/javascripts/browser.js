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

CC.Browser = Class.createWithSharedInstance('browser');
CC.Browser.prototype = {
	initialize: function() {
		this.addBrowserVersionToBodyTag();
	},
	addBrowserVersionToBodyTag: function(name) {
		var matches;
		if (this.isiOS5Plus()) {
			this.addClassName('ios5plus');
		}
		if (this.isiOS6Plus()) {
			this.addClassName('ios6plus');
		}
		if (this.isiPhone()) {
			this.addClassName('iphone');
			return true;
		} else if (this.isiPod()) {
			this.addClassName('ipod');
			return true;
		} else if (this.isiPad()) {
			this.addClassName('ipad');
			return true;
		} else if (this.isSafari5Plus()) {
			this.addClassName('safari5plus');
			return true;
		} else if (matches = navigator.userAgent.match(/(Chrome|Firefox)\/([\d]+)/)) {
			if (matches && matches[1] != null && matches[2] != null) {
				var application = matches[1];
				var version = parseFloat(matches[2]);
				if (application == "Chrome" && version >= 11) {
					this.addClassName('chrome11plus');
					return true;
				} else if (application == "Firefox" && version >= 4) {
					this.addClassName('firefox4plus');
					return true;
				}
			}
		} else if (matches = navigator.userAgent.match(/MSIE ([\d]+)/)) {
			if (matches && matches[1] != null) {
				if (parseFloat(matches[1]) >= 9) {
					this.addClassName('ie9plus');
					return true;
				} else if (tridentMatches = navigator.userAgent.match(/Trident\/([\d]+)/)) {
					if (tridentMatches && tridentMatches[1] != null) {
						if (parseFloat(tridentMatches[1]) >= 5) {
							this.addClassName('ie9plus');
							return true;
						}
					}
				}
			}
		} else if (matches = navigator.userAgent.match(/Mozilla\/5.0 \(Windows NT/)) {
			if (matches && matches[0] != null) {
				this.addClassName('ie9plus');
				return true;
			}
		}
		this.addClassName('unsupported_browser');
		alert("_UnsupportedBrowser.Warning".loc());
		return false;
	},
	locale: function() {
		return (navigator.language ? navigator.language : navigator.browserLanguage || 'en').split('-')[0];
	},
	isIE: function() {
		return ((document.all && /MSIE/.test(navigator.userAgent)) || this.isIE11());
	},
	isIE6: function() {
		return document.all && /MSIE 6/.test(navigator.userAgent);
	},
	isIE7: function() {
		return document.all && /MSIE 7/.test(navigator.userAgent);
	},
	isIE8: function() {
		return document.all && /MSIE 8/.test(navigator.userAgent);
	},
	isIE9: function() {
		return document.all && /MSIE 9/.test(navigator.userAgent);
	},
	isIE11: function() { // IE 11 is using the Revision Token, no more MSIE.
		return /rv:11/.test(navigator.userAgent);
	},
	isWebKit: function() {
		return /WebKit/.test(navigator.userAgent);
	},
	isSafari: function() {
		return /AppleWebKit\/.+Version/.test(navigator.userAgent);
	},
	isSafari4: function() {
		return /AppleWebKit\/.+Version\/4/.test(navigator.userAgent);
	},
	isSafari5: function() {
		return /AppleWebKit\/.+Version\/5/.test(navigator.userAgent);
	},
	isSafari6: function() {
		return /AppleWebKit\/.+Version\/6/.test(navigator.userAgent);
	},
	isSafari5Plus: function() {
		var matches = navigator.userAgent.match(/AppleWebKit\/.+Version\/([\d]+)/);
		if (matches && matches[1] != null) {
			if (parseFloat(matches[1]) >= 5) {
				return true
			}
		}
		return false;
	},
	isMobile: function() {
		return /Mobile/.test(navigator.userAgent);
	},
	isMobileSafari: function() {
		return / AppleWebKit\/.+Mobile\//.test(navigator.userAgent);
	},
	isiPad: function() {
		return this.isMobileSafari() && /iPad/.test(navigator.userAgent);
	},
	isiPhone: function() {
		return this.isMobileSafari() && /iPhone/.test(navigator.userAgent);
	},
	isiPod: function() {
		return this.isMobileSafari() && /iPod/.test(navigator.userAgent);
	},
	isiOS4Plus: function() {
		var matches = navigator.userAgent.match(/(iPhone|iPod|iPad|iPod touch); (U; )?(CPU|CPU [\w]*)? OS (\d+)/);
		if (matches && matches.length > 0) {
			var version = parseFloat(matches[4]);
			if (version >= 4) {
				return true;
			}
		}
		return false;
	},
	isiOS5Plus: function() {
		var matches = navigator.userAgent.match(/(iPhone|iPod|iPad|iPod touch); (U; )?(CPU|CPU [\w]*)? OS (\d+)/);
		if (matches && matches.length > 0) {
			var version = parseFloat(matches[4]);
			if (version >= 5) {
				return true;
			}
		}
		return false;
	},
	isiOS6Plus: function() {
		var matches = navigator.userAgent.match(/(iPhone|iPod|iPad|iPod touch); (U; )?(CPU|CPU [\w]*)? OS (\d+)/);
		if (matches && matches.length > 0) {
			var version = parseFloat(matches[4]);
			if (version >= 6) {
				return true;
			}
		}
		return false;
	},
	isChrome: function() {
		return /Chrome/.test(navigator.userAgent);
	},
	isGecko: function() {
		return /Gecko\/\d*/.test(navigator.userAgent);
	},
	isFirefox: function() {
		return this.isGecko();
	},
	isCamino: function() {
		return /Gecko\/\d*.+Camino\/\d*/.test(navigator.userAgent);
	},
	isOpera: function() {
		return /Opera/.test(navigator.userAgent);
	},
	isMacintosh: function() {
		return /Macintosh/.test(navigator.userAgent);
	},
	isWindows: function() {
		return /Windows/.test(navigator.userAgent);
	},
	isLinux: function() {
		return /X11/.test(navigator.userAgent);
	},
	addClassName: function(inClassName) {
		if (browserSupportsModifyBodyClassName()) {
			document.body.addClassName(inClassName);
		}
	},
	pasteHTMLForIE: function(range, html) {
		var sel;
		if (window.getSelection) {
			// IE9 and non-IE
			sel = window.getSelection();
			if (sel.getRangeAt && sel.rangeCount) {
				range = sel.getRangeAt(0);
				range.deleteContents();

				var el = document.createElement("div");
				el.innerHTML = html;
	             var frag = document.createDocumentFragment(), node, lastNode;
				while ((node = el.firstChild)) {
					lastNode = frag.appendChild(node);
				}
				range.insertNode(frag);

				// Preserve the selection
				if (lastNode) {
					range = range.cloneRange();
					range.setStartAfter(lastNode);
					range.collapse(true);
					sel.removeAllRanges();
					sel.addRange(range);
				}
			}
		} else if (document.selection && document.selection.type != "Control") {
			// IE < 9
			document.selection.createRange().pasteHTML(html);
		}
	},
	isIOS9: function() {
		var deviceAgent = navigator.userAgent.toLowerCase();
		return /(iphone|ipod|ipad).* os 9_/.test(deviceAgent);
	}
};

browser();