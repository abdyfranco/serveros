/**
 * Copyright (c) 2010-2014, Apple Inc. All rights reserved. 
 * 
 * IMPORTANT NOTE: This file is licensed only for use on Apple-branded
 * computers and is subject to the terms and conditions of the Apple Software
 * License Agreement accompanying the package this file is a part of.
 * You may not port this file to another platform without Apple's written consent.
 * 
 * IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
 * of the Apple Software and is subject to the terms and conditions of the Apple
 * Software License Agreement accompanying the package this file is part of.
 **/

function _ucs4Ordinal(ch) {
	var ucs4Ordinal = "";
	ucs4Ordinal += String.fromCharCode(240 | (ch >> 18));
	ucs4Ordinal += String.fromCharCode(127 | ((ch >> 12) & 63));
	ucs4Ordinal += String.fromCharCode(127 | ((ch >> 6) & 63));
	ucs4Ordinal += String.fromCharCode(127 | (ch & 63));
	return ucs4Ordinal;
}

/*
 * Based on PyUnicode_EncodeUTF8
 */

function utf8Encode (string) {
	var utf8Text = "";

	for (var i = 0; i < string.length; i++) {
		var ch = string.charCodeAt(i);

		if (ch < 128) {
			// Characters less than 128 are ASCII
			utf8Text += String.fromCharCode(ch);
		}
		else if((ch > 127) && (ch < 2048)) {
			// Characters between 127 and 2048 are Latin-1
			utf8Text += String.fromCharCode(192 | (ch >> 6));
			utf8Text += String.fromCharCode(128 | (ch & 63));
		}
		else {
			// All other characters are UCS2 or UCS4 unicode ordinals
			if (ch < 65536) {
				// Special case check for high surrogates
				if ((55296 <= ch) && (ch <= 57343) && i != string.length) {
					var ch2 = string.charCodeAt(i + 1);
					// Check for low surrogate and combine for a UCS4 value
					if ((56320 <= ch2) && (ch2 < 57343)) {
						ch = ((ch - 55296) << 10 | (ch2 - 56320)) + 65536;
						i++;
						utf8Text += _ucs4Ordinal(ch);
					}
					// Fall through and handle isolated high surrogates
				}
				utf8Text += String.fromCharCode(224 | (ch >> 12));
				utf8Text += String.fromCharCode(128 | ((ch >> 6) & 63));
				utf8Text += String.fromCharCode(128 | (ch & 63));
				continue;
			}
			utf8Text += _ucs4Ordinal(ch);
		}

	}

	return utf8Text;
}

/*
 * Convert an array of little-endian words to a hex string.
 */
function binl2binstr(binarray)
{
  var str = "";
  for (var i = 0; i < binarray.length; i++)
  {
	for (var j = 0; j < 4; j++)
	{
		str += String.fromCharCode(((binarray[i] >> (j*8)) & 0xFF));
	}
  }
  return str;
}

/*
 * Convert a string to an array of little-endian words
 * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
 */
function str2binl2(str)
{
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
  return bin;
}

function digestResponse(username, password, challengeString) {
	var challenge = challengeToObject(challengeString);
	// for now lets just handle the realm and nonce
	var nonce = challenge['Digest nonce'];
	if (!nonce) {
	    nonce = challenge.nonce;
	}
	var realm = challenge.realm;
	//var method = challenge['method'];
	//if (!method) {
	//	method = 'GET';
	//}
	var method = 'AUTHENTICATE';
	var path = challenge.path;
	if (!path || path == undefined) {
		path = '/';
	}
	
	// handle qop
	var qop = challenge.qop;
	var doQOPAuth = false;
	var extras = "" // for any of the extra fields we need
	if (qop) {
		var opaque = challenge.opaque;
		var qops = qop.split(",");
		qops.each(function(aQop) {
			if (aQop.indexOf("auth") != -1) {
				doQOPAuth = true;
			}
		});
	}
	
	if (doQOPAuth) {
		// generate a 2617 response
		var cnonce = randomString(36);
	}
	
	var HA1 = new Array(username, realm, password)
	HA1 = utf8Encode(HA1.join(':'));
	
	if (doQOPAuth) {
		HA1 = core_md5(str2binl2(HA1), HA1.length * chrsz);
		HA1 = binl2binstr(HA1) + ":" + nonce + ":" + cnonce;
	}

	HA1 = hex_md5(HA1, HA1.length + chrsz);

	var HA2 = new Array(method, path);
	HA2 = utf8Encode(HA2.join(':'));
	HA2 = hex_md5(HA2, HA2.length + chrsz);
	
	// first, generate a legacy response which will be used in most cases
	var response = new Array(HA1, nonce, HA2);
	
	// now deal with more sophisticated challenges
	if (doQOPAuth) {
		response = new Array(HA1, nonce, "00000001", cnonce, "auth", HA2);
		extras = "qop=\"auth\",nc=\"00000001\",cnonce=\""+cnonce+"\",algorithm=md5-sess,";
	}
	
	response = utf8Encode(response.join(':'));
	response = hex_md5(response, response.length + chrsz);
	var digest = "Digest username=\""+username+"\",realm=\""+realm+"\",nonce=\""+nonce+"\",uri=\""+path+"\","+extras+"response=\""+response +"\"";
	if (opaque != undefined) {
		digest += ",opaque=\""+opaque+"\""
	}
	return digest;
}

function challengeToObject(challengeString) {
	var anObj = {};
	var pairs = challengeString.split(",");
	pairs.each(function(aPair) {
		var kv = aPair.split("=");
		var key = kv[0];
		var value = stripIt(kv.slice(1).join("="));
		anObj[key] = value;
	});
	return anObj;
}

function stripIt(x){
	x = x.replace(/['"]/g,'');
	return x;
}

function randomString(strLength, charSet) {
	if (charSet == undefined) {
		// not great, but good enough to plow the field
		charSet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	}
	var randomString = "";
	for (var i = 0; i < strLength; i++) {
		var whichChar = Math.floor(Math.random()*charSet.length);
		randomString += charSet[whichChar];
	}
	return randomString;
}

