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

Element.addMethods({
	getDataAttributes: function(element) {
		var hash = {};
		var attributes = element.attributes;
		var regex = /^data-/;
		for (var i=0, n=attributes.length; i < n; i++) {
			var attribute = attributes[i].name;
			if (regex.match(attribute)) {
				var key = attribute.gsub(regex,'');
				var value = element.readAttribute(attribute);
				hash[key] = value;
			}
		}
		return hash;
	},
	setDataAttributes: function(element, hash) {
		$H(hash).each(function(item) {
			element.writeAttribute('data-' + item.key, item.value);
		});
		return element;
	},
	setClassName: function(element, name, bool) {
		return (bool) ? element.addClassName(name) : element.removeClassName(name);
	},
	getLeft: function(inElement, inOptParent) {
		var parent = inOptParent?$(inOptParent):null;
		var currentNode = $(inElement);
		var currentLeft = 0;
		while (currentNode) {
			currentLeft += currentNode.offsetLeft;
			currentNode = currentNode.offsetParent;
			if (parent && currentNode == parent) {
				currentNode = null;
			}
			if (currentNode && !browser().isIE() && currentNode.nodeName.toLowerCase() == 'body') {
				currentNode = null;
			}
		}
		return currentLeft;
	},
	getTop: function(inElement, inOptParent) {
		var parent = inOptParent?$(inOptParent):null;
		var currentNode = $(inElement);
		var currentTop = 0;
		while (currentNode) {
			currentTop += currentNode.offsetTop;
			currentNode = currentNode.offsetParent;
			if (parent && currentNode == parent) {
				currentNode = null;
			}
			if (currentNode && !browser().isIE() && currentNode.nodeName.toLowerCase() == 'body') {
				currentNode = null;
			}
		}
		return currentTop;
	},
	setOffsetHeight: function(element, height) {
		element = $(element);
		if (height) {
			element.style.height = height+'px';
		}
		else {
			height = parseInt(element.style.height);
		}
		var actual = Element.getHeight(element);
		element.style.height = (height-(actual-height))+'px';
	},
	setOffsetWidth: function(element, width) {
		element = $(element);
		if (width) {
			element.style.width = width+'px';
		}
		else {
			width = parseInt(element.style.width);
		}
		var actual = element.offsetWidth;
		element.style.width = (width-(actual-width))+'px';
	},
	getInvisibleSize: function(inElement) {
		var elm = $(inElement);
		if (Element.visible(inElement)) return [Element.getWidth(inElement), Element.getHeight(inElement)];
		elm.style.visibility = 'hidden';
		Element.show(elm);
		var width = elm.offsetWidth;
		var height = Element.getHeight(elm);
		Element.hide(elm);
		elm.style.visibility = '';
		return [width, height];
	},
	getInvisibleHeight: function(inElement) { // ##5389514
		return Element.getInvisibleSize(inElement)[1];
	},
	isChild: function(inChildElement, inParentElement) { // ##5389516
		return Element.descendantOf(inChildElement, inParentElement);
	},
	/* The unwrap() function removes a child element from a parent matching a given selector. */
	/* inSelector is a CSS selector for a parent tag, and tagBuilderCallback is a function to return a new enclosing tag. */
	/* Don't use inOptParentTag; it's used internally when recursing through the DOM. */
	unwrap: function(inChildElm, inSelector, inTagBuilderCallback, inOptParentElm) {
		inChildElm = $(inChildElm);
		// find the parent element
		var parentElm = inOptParentElm || inChildElm.up(inSelector);
		if (parentElm) {
			// find the child which is an ancestor of the child element
			var ancestor = $A(parentElm.childNodes).detect(function(elm) {
				return (elm == inChildElm || inChildElm.descendantOf(elm));
			});
			// wrap the previous siblings
			if (ancestor && ancestor.previousSibling) {
				var subelm = inTagBuilderCallback();
				while (ancestor.previousSibling) {
					var sibling = ancestor.previousSibling;
					Element.remove(sibling);
					insertAtBeginning(sibling, subelm);
				}
				insertAtBeginning(subelm, parentElm);
			}
			// wrap the next siblings
			if (ancestor && ancestor.nextSibling) {
				var subelm = inTagBuilderCallback();
				while (ancestor.nextSibling) {
					var sibling = ancestor.nextSibling;
					Element.remove(sibling);
					subelm.appendChild(sibling);
				}
				parentElm.appendChild(subelm);
			}
			// if we're not a direct parent, recursively wrap the ancestor
			if (ancestor != inChildElm) {
				Element.unwrap(inChildElm, inSelector, inTagBuilderCallback, ancestor);
			}
			// if we're not being called recursively, remove the parent and child elements (but not their children)
			if (!inOptParentElm) {
				promoteElementChildren(parentElm);
				promoteElementChildren(inChildElm);
			}
		}
	},
	reload: function(inElement, inCallback, optUrl) {
		var elm = $(inElement);
		var inCallback = inCallback || Prototype.emptyFunction;
		if (!elm || !elm.id) { // bail if the element has no ID
			inCallback(false);
			return false;
		}
		// caller can pass in a custom URL... default just reloads the current location.
		var url = optUrl || (window.location.pathname + window.location.search);
		// load this document in an invisible iframe
		var reloadFrame = Builder.node('iframe', {
			name: 'element_reload_'+server().getNextUploadID(),
			style: 'position:absolute;top:0;left:0;width:1px;height:1px;visibility:hidden',
			// IE test
			// use this to debug
			//style: 'visibility:visible;width:200px;height:200px;position:absolute;top:0;left:0;z-index:5000',
			src: 'about:blank'
		});
		d.body.appendChild(reloadFrame);
		var frameWindow = reloadFrame.contentWindow;
		// maybeLoadedCallback -- outermost check, looks for a document and body for the newly added iframe
		// this is a workaround because onload doesn't work in this context
		var maybeLoadedCallback = function() {
			if (frameWindow.document && frameWindow.document.body) {
				// once we have a document and body, do a GET request for the page
				var req = new Ajax.Request(url, {method:'get', onSuccess:function(inTransport) {
					// grab the contents of the BODY tag
					var bodyTextMatch = inTransport.responseText.replace(/[\r\n]/gm, '').match(/<body[^>]*>(.+)<\/body>/);
					if (bodyTextMatch) {
						// populate the body of the iframe with the body tag contents
						frameWindow.document.body.innerHTML = bodyTextMatch[1];
						// now look for the element on this page
						var replacementElement = frameWindow.document.getElementById(elm.id);
						if (replacementElement) {
							elm.update(replacementElement.innerHTML);
							inCallback(true);
						}
						else {
							inCallback(false);
						}
					}
					else { // no body tag -- FAIL
						inCallback(false);
					}
					Element.remove(reloadFrame);
				}});
			}
			else {
				setTimeout(maybeLoadedCallback, 250);
			}
		}
		setTimeout(maybeLoadedCallback, 750);
	},
	enableLinkIfAvailable: function(inElement, inOptCallback) {
		// get the element and its href
		var elm = $(inElement);
		if (!elm) return;
		
		var availability_url = elm.getAttribute('name') || elm.getAttribute('href');
		if (availability_url)
		{
			var href = elm.getAttribute('href');
			// disable
			elm.addClassName('disabled');
			elm.setAttribute('href', '#');
			// now try to re-enable if it's reachable
			new Ajax.Request(availability_url, {
				method: (browser().isWebKit() ? 'get' : 'post'),
				onComplete: function(transport)
				{
					if (transport.status >= 200 && transport.status < 300)
					{
						elm.removeClassName('disabled');
						elm.setAttribute('href', href);
					}
					if (Object.isFunction(inOptCallback)) inOptCallback(elm);
				}
			});
		}
	},
	forceReflow: function(inElement) {
		var elm = $(inElement);
		if (elm && elm.style) {
			Element.hide(elm);
			setTimeout(function() {Element.show(elm)}, 1);
		}
	},
	formatElementDateContents: function(inElement, inOptIsGMT) {
		var elm = $(inElement);
		var d = createDateObjFromISO8601(Element.firstNodeValue(elm), inOptIsGMT);
		if (d) replaceElementContents(elm, Loc.getLongDateString(d));
	},
	// Returns the innerText/textContent of this element.
	textValue: function(inElement, inOptParent) {
		if (!inElement) return "";
		if (inElement.nodeType == 3) return inElement.nodeValue;
		return (inElement.textContent || inElement.innerText || "");
	},
	// Returns the outerHTML equivilant of this element.
	outerHtmlValue: function(inElement) {
		if (!inElement) return undefined;
		if (!('outerHTML' in document.documentElement)) {
			return $(inElement).outerHTML;
		} else {
			var temporaryParent = document.createElement('div');
			temporaryParent.appendChild(inElement.cloneNode(true));
			var _innerHTML = temporaryParent.innerHTML;
			temporaryParent = null;
			return _innerHTML;
		}
	}
});

function changeNodeName(inElement, inNodeName) {
	var elm = $(inElement);
	var node = elm.ownerDocument.createElement(inNodeName);
	$A(elm.childNodes).each(function(child) {
		elm.removeChild(child);
		node.appendChild(child);
	});
	elm.parentNode.insertBefore(node, elm);
	Element.remove(elm);
	return node;
};
