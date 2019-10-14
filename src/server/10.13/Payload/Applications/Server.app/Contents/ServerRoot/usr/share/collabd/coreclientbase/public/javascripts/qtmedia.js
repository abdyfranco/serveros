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

var QTMediaExpander = Class.createWithSharedInstance('qtMediaExpander', true);
QTMediaExpander.prototype = {
	initialize: function() {
		bindEventListeners(this, ['handleClick']);
		this.mEmbedFrameID = 0;
		this.findMedia();
		globalNotificationCenter().subscribe('DIALOG_WILL_SHOW', function(){this.collapseAllMedia()}.bind(this));
		globalNotificationCenter().subscribe('DIALOG_HIDDEN', function(){this.findMedia()}.bind(this));
	},
	findMedia: function() {
		$$('img.posterimg').each(function(img) {
			if (img.onclick != this.handleClick) {
				img.onclick = this.handleClick;
				img.setAttribute('tabindex','0');
				img.setAttribute('role','button');
			}
		}.bind(this));
	},
	collapseAllMedia: function() {
		$$('div.qtmedia').each(function(div) {
			var img = div.next('img');
			if (!img || !img.hasClassName('posterimg')) return false;
			div.remove();
			img.show();
			img.setAttribute('tabindex','0');
			img.setAttribute('role','button');
		});
		$$('img.posterimg').each(function(img) {
			img.onclick = invalidate;
		});
	},
	expandPosterImage: function(mediaType, inPosterImage, inOptBackgroundColor) {
		if (!inPosterImage) return false;	
		// If we are coming from a quicklook view then use mediatype
		// otherwise, use the alt attribute which stores the MediaType value
		if (!mediaType) mediaType = inPosterImage.getAttribute('alt');
		var mediaProperties = {
			'src': inPosterImage.getAttribute('longdesc') || inPosterImage.getAttribute('name') || inPosterImage.getAttribute('alt'),
			'width': inPosterImage.width,
			'height': inPosterImage.height,
			'mediaType': mediaType
		}
		return this.expandMedia(mediaProperties, inPosterImage, undefined, inOptBackgroundColor);
	},
	expandMedia: function(inMediaProperties, inOptPosterImage, inOptParentElement, inOptBackgroundColor) {
		var src = inMediaProperties.src;
		var width = inMediaProperties.width;
		var height = inMediaProperties.height;
		var mediaType = inMediaProperties.mediaType;
		var backgroundColor = (inOptBackgroundColor || '#FFFFFF');
		var parentElement = $(inOptParentElement) || document.body;
		var posterImage = $(inOptPosterImage);
		if (src && src != '' && width && height) {
			// var useHTML5Controls = (browser().isiPad() || browser().isiPhone() || browser().isSafari5Plus());
			// All the modern browsers support HTML <video/audio> control now, so this should always be true. Leaving the old
			// code as is, just in case. Users on *really* old browsers won't be able to play videos anymore.
			var useHTML5Controls = true;
			var extendHeight = (!useHTML5Controls && height >= 20);
			var wrapper = Builder.node('div', {id:'qtmovie1', className:'qtmedia', style:'width:'+width+'px;height:'+(height+(extendHeight?12:0))+'px'});
			// Append an auth token in case the plugin fails to forward cookies.
			var matches = document.cookie.match(/cc.collabd_session_guid=([a-zA-Z0-9\-]+)/)
			if (matches && matches[1] && !src.match(/auth_token=/)) {
				src += ('?auth_token=' + matches[1] + '&qt=true');
			} else {
				src += '?qt=true';
			}
			
			// Do we have a poster image?
			if (posterImage) {
				posterImage.parentNode.insertBefore(wrapper, posterImage);
			} else {
				parentElement.appendChild(wrapper);
			}		
							
			if (useHTML5Controls) {
				var videoElement;				
				if (mediaType == 'audio') {
					wrapper.innerHTML = '<audio src="'+src+'" width="'+width+'" height="'+height+'" controls autoplay></audio>';
					videoElement = wrapper.down('audio');
				} else { // default to video tag
					wrapper.innerHTML = '<video src="'+src+'" width="'+width+'" height="'+height+'" controls autoplay></video>';
					videoElement = wrapper.down('video');					
				}		
				if (posterImage) Element.hide(posterImage);
				// Force autoplay of HTML5 video tags.
				if (videoElement) {
					videoElement.load();
					videoElement.play();
				}
				return true;
			}
			// Build an object/embed combination that we can append to the page.
			var envFunction = ((window.env == undefined) ?  window.parent.env() : env()); // Handle iFrames used for migrated content
			var fakeqti = envFunction.root_path + '/__collabd/coreclientbase/static/fake.qti';
			var objectHTMLWithoutClosingTag = '<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" width="'+width+'" height="'+(height+(extendHeight?16:0))+'" codebase="http://www.apple.com/qtactivex/qtplugin.cab"><param name="SRC" value="/static/fake.qti"><param name="QTSRC" value="'+src+'"><param name="TYPE" value="video/quicktime"><param name="SCALE" value="aspect"><param name="AUTOPLAY" value="true"><param name="CONTROLLER" value="true"><param name="TARGET" value="myself"><param name="BGCOLOR" value="'+backgroundColor+'">';
			var objectHTML = objectHTMLWithoutClosingTag+'<embed src="'+fakeqti+'" qtsrc="'+src+'" type="video/quicktime" autoplay="true" controller="true" target="myself" bgcolor="'+backgroundColor+'" width="'+width+'" height="'+(height+(extendHeight?16:0))+'" pluginspage="http://www.apple.com/quicktime/download/" scale="aspect" />'+'</object>';
			// IE requires that the plugin be written using document.write at page load time, so we must create an iframe
			if (browser().isIE()) {
				var frmID = 'qFrame'+(this.mEmbedFrameID++);
				var qFrame = Builder.node('iframe', {border:'0', frameborder:'0', id:frmID, name:frmID, style:'width:'+width+'px;height:'+(height+(extendHeight?16:0))+'px;border:0;overflow:hidden'});
				wrapper.appendChild(qFrame);
				$(frmID).contentWindow.document.write('<html><body style="padding:0;margin:0;overflow:hidden">'+objectHTML.replace(/<object/, '<object id="qtmovie1"')+'</body></html>');
				if (posterImage) Element.hide(posterImage);
				var attempts = 0;
				var checkForPlayer = function() {
					try {
						$(frmID).contentWindow.document.qtmovie1.Play();
					}
					catch(e) {
						if (++attempts > 10) return false;
						setTimeout(checkForPlayer, 1000);
					}
				}
				setTimeout(checkForPlayer, 1000);
			}
			else {
				wrapper.innerHTML = objectHTML;
				// Safari demands that you hide the image last, for some reason.
				if (posterImage) Element.hide(posterImage);
			}
		}
	},
	handleClick: function(inEvent) {
		var img = Event.element(inEvent);
		this.expandPosterImage(img);
	}
};
