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

// A text selection delegate.

var GlobalEditorTextSelectionDelegate = Class.createWithSharedInstance('globalEditorTextSelectionDelegate');
GlobalEditorTextSelectionDelegate.prototype = {
	mCachedSelection: null,
	mCacheSafariSelection: null,
	initialize: function() {},
	// Caches the current text selection and cursor position.
	cacheSelection: function() {
		if (document.selection && document.selection.createRange) {
			this.mCachedSelection = document.selection.createRange();
		} else if (window.getSelection) {
			var sel = window.getSelection();
			if (sel) this.mCachedSelection = {
				anchorNode: sel.anchorNode,
				anchorOffset: sel.anchorOffset,
				focusNode: sel.focusNode,
				focusOffset: sel.focusOffset
			};
			if (!sel || !this.mCachedSelection.anchorNode) this.mCachedSelection = null;
		}
		else {
			this.mCachedSelection = null;
		}

		logger().debug("cacheSelection: %o", this.mCachedSelection);
	},	
	cacheSafariSelection: function(arg) {
		if (arg) this.mCacheSafariSelection = arg;
	},	
	// Returns value by parameter name in a URI standard protocol (http//...?key=value&key=value...)
	getParameterByName: function(href, name) {
	    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	        results = regex.exec(href);
	    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	},
	// Changes the target of the selected link
	changeAnchorTarget: function(link, target) {			
		var anchor = this.getSelectedAnchorInfo(link);		
		if (anchor) {
			var href = anchor.getAttribute('href');			
			anchor.href = '%@?target=%@'.fmt(href.split('?')[0], target);
			anchor.removeAttribute('data-editable-link');
		}
	},
	getSelectedAnchorInfo: function(link) {
		if (window.getSelection) {
			var sel = null;			
			// FireFox
			if (browser().isFirefox()) {
				sel = this.getSelectionTextAndContainerElement();
				var childNodes = sel.containerElement.childNodes;				
				if (childNodes) {				
					for (i = 0; i < childNodes.length; i++) {
						if (childNodes[i].nodeName == 'A') {
							if (childNodes[i].textContent == link) {
								return childNodes[i];
							}
						}
					}				
				}	
			// Webkit (Safari, Chrome)			
			} else {				
				sel = this.mCacheSafariSelection;				
				var element = sel.anchorNode.parentNode;
				while (element) {
					if (element.nodeName == "A")
						return element;
					else
						element = element.parentElement;
				}
			}
		}
		return null;
	},	
	// Returns the currently selected string.
	getSelectedString: function() {
		var result = "";
		if (document.selection && document.selection.createRange) {
			result = document.selection.createRange().text.replace(/^\s+/, '').replace(/\s+$/, '');
		} else if (window.getSelection && window.getSelection().toString) {
			result = window.getSelection().toString() || "";
		}
		return result;
	},	
	// Please use this function for everything related to window.getSelection
	// It fixes all browser compatibility issues and can be used instead of XXXX.getSelection
	getSelectionTextAndContainerElement: function() {
	    var text = "", containerElement = null;
	    if (typeof window.getSelection != "undefined") {
	        var sel = window.getSelection();
	        if (sel.rangeCount) {
	            var node = sel.getRangeAt(0).commonAncestorContainer;
	            containerElement = node.nodeType == 1 ? node : node.parentNode;
	            text = sel.toString();
	        }
	    } else if (typeof document.selection != "undefined" &&
	               document.selection.type != "Control") {
	        var textRange = document.selection.createRange();
	        containerElement = textRange.parentElement();
	        text = textRange.text;
	    }
	    return {
	        text: text,
	        containerElement: containerElement
	    };
	},	
	// Returns a Range (or TextRange) for the current document selection, if it exists.
	getSelectionAsRange: function() {
		var sel, range;
		if (browser().isIE() && document.selection) {
			range = document.selection.createRange();
		} else if (window.getSelection) {
			sel = window.getSelection();
			if (!sel.anchorNode || !sel.focusNode) return;
			// Keep track of the original anchorNode, focusNode, anchorOffset and focusOffset.
			var anchorNode = sel.anchorNode, focusNode = sel.focusNode, anchorOffset = sel.anchorOffset, focusOffset = sel.focusOffset;
			range = document.createRange();
			range.setStart(sel.anchorNode, sel.anchorOffset);
			range.setEnd(sel.focusNode, sel.focusOffset);
			// If the new range appears to be collapsed (where it previously was not collapsed)
			// it was reversed. Flip the range we just created.
			if (range.collapsed && ((anchorNode != focusNode) || ((focusOffset - anchorOffset) != 0))) {
				range.setStart(sel.focusNode, sel.focusOffset);
				range.setEnd(sel.anchorNode, sel.anchorOffset);
			}
		}
		return range;
	},
	// Restores a cached text selection.
	restoreSelection: function() {
		if (!this.mCachedSelection) return;
		if (document.selection && document.selection.createRange) {
			this.mCachedSelection.select();
		} else if (window.getSelection) {
			var sel = window.getSelection();
			if (sel.setBaseAndExtent) {
				sel.setBaseAndExtent(this.mCachedSelection.anchorNode, this.mCachedSelection.anchorOffset, this.mCachedSelection.focusNode, this.mCachedSelection.focusOffset);
			}
			else if (document.createRange) {
				var rng = document.createRange();
				rng.setStart(this.mCachedSelection.anchorNode, this.mCachedSelection.anchorOffset);
				rng.setEnd(this.mCachedSelection.focusNode, this.mCachedSelection.focusOffset);
				sel.removeAllRanges();
				sel.addRange(rng);
				window.focus();
			}
		}
	},
	// Returns true if a selection exists, and it is empty.
	currentSelectionIsEmpty: function() {
		var sel = null;
		if (document.selection && document.selection.type) {
			return document.selection.type == 'None';
		} else if (window.getSelection) {
			sel = window.getSelection();
			return (sel.anchorNode == sel.focusNode && sel.anchorOffset == sel.focusOffset);
		}
		return true;
	},
	// Returns true if a selection exists, and that selection is a child of an
	// element with a given tag name. Useful for detecting whether we're focused
	// inside an ordered/unordered list, for example.
	currentSelectionChildOfNodeName: function(inNodeName) {
		if (!inNodeName) return false;
		var nodeName = inNodeName.toLowerCase();
		var selectionAsRange = this.getSelectionAsRange();
		var startContainer = selectionAsRange.startContainer;
		var nearestExtendedContainer = $((startContainer.nodeType == 3) ? startContainer.parentNode : startContainer);
		return ((nearestExtendedContainer.nodeName.toLowerCase() == nodeName) || (nearestExtendedContainer.up(nodeName) != undefined));
	},
	// Selects all child elements of an element.
	selectAllChildren: function(inContextElement) {
		if (!inContextElement) return false;
		if (document.selection && document.body.createTextRange) { // IE
			var rng = document.body.createTextRange();
			rng.moveToElementText(inContextElement);
			rng.select();
		} else if (window.getSelection) {
			var sel = window.getSelection();
			if (sel.setBaseAndExtent) { // Safari
				sel.setBaseAndExtent(inContextElement, 0, inContextElement, Math.max(inContextElement.innerText.length - 1, 0));
			}
			else if (sel.selectAllChildren) { // Firefox
				sel.selectAllChildren(inContextElement);
			}
		}
	},
	// Moves the text cursor to the start/end of an optional context element
	// if it exists or to the start/end of the active text selection.
	moveCursorToStart: function(inOptContextElement) {
		var sel = window.getSelection();
		if (sel) {
			sel.removeAllRanges();
			if (inOptContextElement && sel.selectAllChildren) sel.selectAllChildren(inOptContextElement);
			sel.collapseToStart();
		}
	},
	moveCursorToEnd: function(inOptContextElement) {
		var sel = window.getSelection();
		if (sel) {
			sel.removeAllRanges();
			if (inOptContextElement && sel.selectAllChildren) sel.selectAllChildren(inOptContextElement);
			sel.collapseToEnd();
		}
	},
	// Returns true if the cursor is focused at the start of a text range.
	// Accepts an optional context element used for calculating the cursor
	// position when we have a series of nested nodes.
	isCursorFocusedAtStart: function(inOptContextElement) {
		var sel = window.getSelection(), result;
		// Are we focused at the start of the active text node?
		var focusedAtStartOfNode = (sel && sel.anchorNode && (sel.anchorOffset == 0));
		if (!inOptContextElement) {
			result = focusedAtStartOfNode;
			logger().debug("isCursorFocusedAtStart: %o", result);
			return result;
		}
		// We're focused at the start if the cursor is at the start
		// of the selection node, and the selection node is leftmost
		// in the editing context.
		var isBoundary = this.isBoundaryNode(sel.anchorNode, inOptContextElement);
		result = (focusedAtStartOfNode && isBoundary);
		logger().debug("isCursorFocusedAtStart: %o", result);
		return result;
	},
	// Returns true if the cursor is focused at the end of a text range.
	isCursorFocusedAtEnd: function(inOptContextElement) {
		var sel = window.getSelection();
		var focusedAtEndOfNode = false;
		if (sel.focusNode) {
			// If we're selecting inside a text node, the focusOffset is calculated relative to the
			// length of the nodeValue string.
			if (sel.focusNode.nodeType == 3) {
				var focusNodeTextValue = Element.textValue(sel.focusNode);
				focusedAtEndOfNode = ((sel.focusOffset == focusNodeTextValue.length) || (sel.focusOffset == focusNodeTextValue.gsub(/\n$/, "").length));
			} else if (sel.focusNode.hasChildNodes()) {
				var focusNodeChildNodes = sel.focusNode.childNodes;
				var focusNodeChildNodesLength = focusNodeChildNodes.length;
				focusedAtEndOfNode = (sel.focusOffset == focusNodeChildNodesLength);
				// Firefox hack (which insists on placing the cursor before a trailing <br> tag).
				if (!focusedAtEndOfNode && browser().isFirefox()) {
					if (isBrTag(focusNodeChildNodes.item(focusNodeChildNodesLength - 1))) {
						focusedAtEndOfNode = (sel.focusOffset == (focusNodeChildNodesLength - 1));
					}
				}
			}
		}
		// We're focused at the end if the cursor is at the end of
		// the selection node, and the selection node is rightmost in
		// the editing context.
		var isBoundary = this.isBoundaryNode(sel.focusNode, inOptContextElement, true);
		var result = (focusedAtEndOfNode && isBoundary);
		logger().debug("isCursorFocusedAtEnd: %o", result);
		return result;
	},
	// Returns true if a given childnode is a boundary node inside a given
	// root node. Walks the DOM and determines if a given child node is the
	// leftmost or rightmost child in a set of (possibly nested) child nodes.
	isBoundaryNode: function(inChildNode, inRootNode, inOptRightBoundary) {
		if (!inChildNode || !inRootNode) return true;
		var isBoundary = false, root = inRootNode, brTagCount = 0, childNodes, childNode;
		while (!isBoundary && root) {
			if (root == inChildNode) {
				isBoundary = true;
				break;
			}
			childNodes = root.childNodes;
			if (!childNodes || childNodes.length == 0) break;
			var idx = (inOptRightBoundary !== undefined) ? childNodes.length - 1 : 0;
			childNode = childNodes.item(idx);
			if (isBrTag(childNode)) {
				brTagCount += 1;
				root = childNodes.item(idx - 1);
				continue;
			}
			if ((childNode == inChildNode) && (!browser().isFirefox() || (browser().isFirefox() && brTagCount <= 1))) {
				isBoundary = true;
				break;
			}
			// Spin again.
			root = childNodes[idx];
		}
		return isBoundary;
	}
};
