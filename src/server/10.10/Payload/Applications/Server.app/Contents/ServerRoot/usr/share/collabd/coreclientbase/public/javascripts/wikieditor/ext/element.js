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

CC.TRAILING_WHITESPACE_TAGS = 'blockquote div dd dt h1 h2 h3 h4 h5 h6 li ol p pre ul span'.w();
CC.HEADER_TAGS = 'h1 h2 h3 h4 h5 h6'.w();
CC.FORMATTING_TAGS = 'b i u strong em'.w();
CC.LIST_TAGS = 'ol ul'.w();
CC.BLOCK_LEVEL_TAGS = 'blockquote code div dl fieldset form h1 h2 h3 h4 h5 h6 hr img ol p pre table ul'.w();

// Cleans any unwanted trailing whitespace or whitespace-containing text nodes,
// or empty trailing tags from the end of an element. Optionally accepts a boolean
// parameter where leading whitespace is removed instead of trailing.

var cleanTrailingWhitespace = function(inElement, inOptLeadingInstead) {
	if (!inElement) return false;
	// Does the node just contain whitespace nodes, or empty meaningless tags?
	var recursivelyClean = function(rootNode) {
		if (!rootNode) return false;
		if (rootNode.nodeType == 3) {
			// If the text node is just a whitespace node, remove it.
			if (isWhitespaceNode(rootNode)) {
				rootNode.parentNode.removeChild(rootNode);
				return true;
			}
			// Otherwise clean any leading/trailing whitespace from the text node.
			else {
				var nodeValue = (rootNode.nodeValue || "");
				var matches = nodeValue.match(/^(\s*)(.*)(\s*)$/);
				if (matches && matches.length == 4) {
					rootNode.nodeValue = matches.splice((inOptLeadingInstead ? 2 : 1), 2).join('');
				}
			}
			return false;
		}
		// Is the node an empty block-level node?
		var children = rootNode.childNodes;
		if (children.length == 0) {
			var rootNodeName = rootNode.nodeName.toLowerCase();
			if (rootNodeName == 'br' || CC.TRAILING_WHITESPACE_TAGS.indexOf(rootNodeName) != -1) {
				rootNode.parentNode.removeChild(rootNode);
				return true;
			}
			return false;
		}
		// Otherwise recurse over each of the children.
		var bubbleDeleteToParentNode = true;
		var childrenLength = children.length, childNode;
		for (var j = 0; j < childrenLength; j++) {
			childNode = children.item(j);
			if (!recursivelyClean(childNode)) {
				bubbleDeleteToParentNode = false;
				break;
			}
		}
		// If every nested child node was empty or whitespace, nuke the parent.
		if (bubbleDeleteToParentNode) {
			rootNode.parentNode.removeChild(rootNode)
			return true;
		}
		return false;
	};
	// Recursively clean trailing or leading whitespace from the element.
	var element = $(inElement), node = (inOptLeadingInstead ? element.firstChild : element.lastChild), nextNode;
	while (node) {
		nextNode = (inOptLeadingInstead ? node.nextSibling : node.previousSibling);
		if (!recursivelyClean(node)) break;
		node = nextNode;
		continue;
	}
	// Return the cleaned element.
	return element;
};

var cleanLeadingWhitespace = function(inElement) {
	return cleanTrailingWhitespace(inElement, true);
};

// Whitespace nodes are text nodes with nothing but whitespace in them. Formatting
// nodes are bold, italic or underline tags.

var isWhitespaceNode = function(node) {
	return (node && node.nodeType == 3 && !/\S/.test(node.nodeValue));
};

var isFormattingNode = function(node) {
	return (node && CC.FORMATTING_TAGS.indexOf(node.nodeName.toLowerCase()) >= 0);
};

// Returns true if a node is a span tag with a recognized styling class name applied.

var isStyledSpanTag = function(node) {
	return (node && node.nodeName.toLowerCase() == 'span' && (node.className && node.className.match(/important|emphasis|highlight/)));
};

// Defining a bogus div child as another div or a line break.

var isBogusDivChild = function(node) {
	return (node && (['br', 'div'].indexOf(node.nodeName.toLowerCase()) >= 0) && !node.hasChildNodes());
};

// Returns true if a node is a empty list node.

var isEmptyList = function(inNode) {
	if (!inNode) return false;
	var childNodes, childNodesLength, childNode, childNodeIdx;
	var subChildNodes, subChildNodesLength, subChildNode, subChildNodeIdx;
	childNodes = inNode.childNodes;
	childNodesLength = childNodes.length;
	// A list is empty if it has no child nodes.
	if (childNodesLength == 0) return true;
	// A list is empty if it contains empty/whitespace child nodes.
	for (childNodeIdx = 0; childNodeIdx < childNodesLength; childNodeIdx++) {
		childNode = childNodes.item(childNodeIdx);
		if (childNode) {
			subChildNodes = childNode.childNodes;
			subChildNodesLength = subChildNodes.length;
			for (subChildNodeIdx = 0; subChildNodeIdx < subChildNodesLength; subChildNodeIdx++) {
				subChildNode = subChildNodes.item(subChildNodeIdx);
				// Is the child node a nested list?
				if (CC.LIST_TAGS.indexOf(subChildNode && subChildNode.nodeName.toLowerCase())) {
					if (!isEmptyList(subChildNode)) return false;
				}
				// Is the child node a whitespace node?
				if (!isWhitespaceNode(subChildNode)) return false;
			}
		}
	}
	return true;
};

// Returns true if a node only contains text or line-break nodes.

var onlyTextOrLineBreaks = function(inNode) {
	if (!inNode) return false;
	var childNodes, childIdx, currentChild, only = true;
	childNodes = inNode.childNodes;
	for (childIdx = 0; childIdx < childNodes.length; childIdx++) {
		currentChild = childNodes.item(childIdx);
		if (currentChild.nodeType != 3 && currentChild.nodeName.toLowerCase() != 'br') {
			only = false;
			break;
		}
	}
	return only;
};

// Removes any unwanted markup turds.

var removeMeaninglessMarkup = function(inElement) {
	var elem = $(inElement);
	// Remove any unnecessary header tags.
	var headers = elem.select(CC.HEADER_TAGS.join(','));
	var headerIndex, header, children, childrenLength, zombieHeader, childIndex, child;
	for (headerIndex = 0; headerIndex < headers.length; headerIndex++) {
		header = headers[headerIndex];
		// If the header only contains block level elements and/or whitespace
		// nodes, promote the children and zap the header.
		children = header.childNodes;
		childrenLength = children.length;
		zombieHeader = true;
		for (childIndex = 0; childIndex < childrenLength; childIndex++) {
			child = children[childIndex];
			// Bail if we find something non-zombie-esque.
			if ((CC.BLOCK_LEVEL_TAGS.include(child.nodeName.toLowerCase()) || isWhitespaceNode(child)) == false) {
				zombieHeader = false;
				break;
			}
		}
		if (zombieHeader) {
			promoteElementChildren(header);
		}
	}
	// Nuke any superfluous div tags.
	var pageDivs = elem.getElementsByTagName('div');
	var divIdx, div, node, whitespace, whitespaceIdx, whitespaceNode, nextNode, childNodes;
	for (divIdx = (pageDivs.length - 1); divIdx >= 0; divIdx--) {
		div = pageDivs.item(divIdx);
		// Bail if we have an identifer or a class name.
		if ((div.className && div.className != '') || (div.id && div.id != '')  || (div.style && div.style != '')) continue;
		// If the div is completely empty, nuke it.
		if (div.childNodes.length == 0) {
			div.parentNode.removeChild(div);
			continue;
		}
		// If the first child of the div is a block-level element, promote
		// the children and nuke the div.
		node = div.childNodes.item(0);
		whitespace = new Array(), bail = false;
		while (node) {
			nextNode = node.nextSibling;
			if (!isWhitespaceNode(node)) {
				if (CC.BLOCK_LEVEL_TAGS.include(node.nodeName.toLowerCase())) {
					for (whitespaceIdx = 0; whitespaceIdx < whitespace.length; whitespaceIdx++) {
						whitespaceNode = whitespace[whitespaceIdx];
						whitespaceNode.parentNode.removeChild(whitespaceNode);
					}
					promoteElementChildren(div);
					bail = true;
				}
				break;
			}
			whitespace.push(node);
			node = nextNode;
		}
		if (bail) continue;
		// If the first node is a whitespace node wih no next sibling, remove
		// the div.
		node = div.childNodes.item(0);
		if (isWhitespaceNode(node)) {
			if (!node.nextSibling) {
				node.parentNode.removeChild(node);
				continue;
			}
			node = node.nextSibling;
		}
		// Is the tag an empty/meaningless formatting tag.
		if (isFormattingNode(node)) {
			if (node.className || node.id) continue;
			// Is the node empty?
			childNodes = node.childNodes;
			if (isWhitespaceNode(node) || childNodes.length == 0) {
				node.parentNode.removeChild(node);
				continue;
			}
		}
		if (isBogusDivChild(node)) {
			// Bail if there is a non-whitespace node that follows this one.
			if (node.nextSibling && !isWhitespaceNode(node.nextSibling)) continue;
			// Zap!
			promoteElementChildren(div);
		}
	}
	// Nuke any superfluous span tags.
	var pageSpans = elem.getElementsByTagName('span');
	var spanIdx, span;
	for (spanIdx = (pageSpans.length - 1); spanIdx >= 0; spanIdx--) {
		span = pageSpans.item(spanIdx);
		if ((span.className && span.className != '') || (span.id && span.id != '') || (span.style && span.style != '')) continue;
		promoteElementChildren(span);
	}
	// Nuke any empty list elements.
	var lists = elem.select(CC.LIST_TAGS.join(','));
	var list, listIdx;
	for (listIdx = (lists.length - 1); listIdx >= 0; listIdx--) {
		list = lists[listIdx];
		if (isEmptyList(list)) {
			list.parentNode.removeChild(list);
		}
	}
	// Nuke any HR tags.
	var hrs = elem.select('hr');
	var hrIdx, hr;
	for (hrIdx = (hrs.length - 1); hrIdx >= 0; hrIdx--) {
		hr = hrs[hrIdx];
		hr.parentNode.removeChild(hr);
	}
	// Fix any unnecessarily nested lists where the only child of an li tag is a ul tag.
	var nestedBullets = elem.select('li ul, li ol'), bulletIdx, bullet, oldParent;
	for (bulletIdx = (nestedBullets.length - 1); bulletIdx >= 0; bulletIdx--) {
		bullet = nestedBullets[bulletIdx];
		oldParent = bullet.parentNode;
		if (oldParent.nodeName.toLowerCase() == 'li' && oldParent.childNodes.length == 1) {
			promoteElementChildren(oldParent);
		}
	}
	// Return.
	return elem;
};

// Reduces the child nodes of a supplied DOM element to be only a combination of
// text nodes, inline styles and link nodes.

var isTextNodeFormattingNodeOrLinkNode = function(inNode) {
	if (!inNode) return false;
	return (inNode.nodeType == 3 || isFormattingNode(inNode) || isStyledSpanTag(inNode) || inNode.nodeName.toLowerCase() == 'a');
};

var reduceToTextLinksAndStyles = function(inElement) {
	var elem = removeMeaninglessMarkup(inElement);
	var rootNode, childNodesLength, childIdx;
	var recursivelyReduce = function(elementsToReduce) {
		// If we have nothing left to reduce, we're done.
		if (elementsToReduce.length == 0) return elem;
		// Reduce the first element in the queue.
		rootNode = elementsToReduce.shift();
		// Continue reducing if the first element has no children and is a text/link/formatting node.
		if (rootNode.childNodes.length == 0 && isTextNodeFormattingNodeOrLinkNode(rootNode)) return recursivelyReduce(elementsToReduce);
		// Otherwise, push each of the current nodes children on to the reduction queue.
		childNodesLength = rootNode.childNodes.length;
		for (childIdx = 0; childIdx < childNodesLength; childIdx++) {
			elementsToReduce.push(rootNode.childNodes.item(childIdx));
		}
		// If the wrapping node is not a text node, link or formatting node, remove it.
		if (!isTextNodeFormattingNodeOrLinkNode(rootNode)) promoteElementChildren(rootNode);
		// Recurse on the remaining elements to reduce.
		return recursivelyReduce(elementsToReduce);
	}
	var childNodes = elem.childNodes, topLevelChildren = new Array();
	for (var childNodeIdx = 0; childNodeIdx < childNodes.length; childNodeIdx++) {
		topLevelChildren.push(childNodes.item(childNodeIdx));
	}
	return recursivelyReduce(topLevelChildren);
};

// Is the node a <br> tag.

var isBrTag = function(inElement) {
	return (inElement && inElement.nodeType == 1 && inElement.nodeName.toLowerCase() == 'br');
};

// A fast document fragment friendly version of Element#insert. You should only
// ever call this if you know what you're doing.

var fragmentSafeElementInsert = function(inElement, inPosition) {
	if (!inElement || !inPosition) return inElement;
	if (Object.isString(inPosition) || Object.isNumber(inPosition) || Object.isElement(inPosition) || (inPosition && (inPosition.toElement || inPosition.toHTML))) {
		inPosition = {'bottom': inPosition};
	}
	var key, element, _wrapper, position;
	for (key in inPosition) {
		element  = inPosition[key];
		if (!element) continue;
		position = key.toLowerCase();
		_wrapper = null;
		if (Object.isString(element)) {
			_wrapper = new Element('div').update(element);
		}
		switch (position) {
			case 'before':
				if (inElement.parentNode) inElement.parentNode.insertBefore((_wrapper || element), inElement);
				break;
			case 'after':
				if (inElement.parentNode) inElement.parentNode.insertBefore((_wrapper || element), inElement.nextSibling);
				break;
			case 'top':
				inElement.insertBefore((_wrapper || element), inElement.firstChild);
				break;
			case 'bottom':
				inElement.appendChild((_wrapper || element))
				break;
		}
		if (_wrapper && _wrapper.parentNode) {
			element = _wrapper.firstChild;
			_wrapper.parentNode.replaceChild(element, _wrapper);
		}
	}
	return Element.extend(element);
};
