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

// Properties we allow to be styled inline.

CC.WikiEditor.TEXT_BLOCK_ALLOWED_INLINE_STYLES = 'background-color color font-style font-weight text-decoration'.w();
CC.WikiEditor.CAMELIZED_TEXT_BLOCK_ALLOWED_INLINE_STYLES = CC.WikiEditor.TEXT_BLOCK_ALLOWED_INLINE_STYLES.invoke('camelize');

// Text block helpers.

CC.WikiEditor.TextBlockHelpers = {
	// Cleans up the last trailing empty list item in a text block.
	cleanLastTrailingListItem: function(inElement) {
		if (!inElement) return;
		var elem = $(inElement);
		// If we're working inside a list, clean up the last list item if it exists and is empty.
		var items = elem.select('li');
		if (items.length > 0) {
			var lastItem = items[items.length - 1];
			if (lastItem.empty()) Element.remove(lastItem);
			if (lastItem.hasChildNodes()) {
				var clonedItem = lastItem.cloneNode(true);
				if (!cleanTrailingWhitespace(clonedItem).hasChildNodes()) Element.remove(lastItem);
			}
			return;
		}
	},
	// Cleans up the last trailing line break node.
	cleanLastTrailingLineBreak: function(inElement) {
		if (!inElement) return;
		var childNodes = inElement.childNodes;
		var childNodesLength = childNodes.length, childNode;
		// Walk through the childNodes in reverse, looking for the outermost <br> tag in the
		// rightmost childNode tree.
		childNode = childNodes.item(childNodesLength - 1);
		while (childNode != undefined) {
			if (isBrTag(childNode)) {
				childNode.parentNode.removeChild(childNode);
				break;
			}
			if (childNode.hasChildNodes()) {
				childNode = childNode.lastChild;
				continue;
			}
			break;
		}
	},
	buildSpacerNode: function() {
		return Builder.node('img', {src: '/__collabd/coreclientbase/static/spacer.gif', className: 'chrome block-spacer', width: '1px', height: '1px'});
	},
	// Helper function mapping a CSS style name/value into a class name, stripping anything non-alphanumeric.
	styleValueToClassName: function(inStyleName, inValue) {
		var styleName = inStyleName.toLowerCase();
		var val = ('' + inValue).toLowerCase().replace(/,/g, '-').replace(/[^a-z0-9-_]/g, '');
		if (inStyleName == 'font-weight') val = CC.WikiEditor.TextBlockHelpers.normalizeBoldStyleValue(val);
		return styleName + '-' + val;
	},
	// Normalizes potentially integral boldness style values to a string (bold or normal).
	normalizeBoldStyleValue: function(inStyleValue) {
		var styleValue = inStyleValue;
		var boldnessNumberMatch = (styleValue || "").match(/(\d{3})/);
		if (boldnessNumberMatch) styleValue = (parseInt(boldnessNumberMatch[1], 10) >= 600 ? 'bold' : 'normal');
		return styleValue;
	},
	// Fixes any rogue inline styles.
	fixInlineStyles: function(inElement) {
		if (!inElement) return true;
		inElement = $(inElement);
		var elements, elmIdx, elm;
		// 8553023
		elements = inElement.select('strong, em');
		for (elmIdx = 0; elmIdx < elements.length; elmIdx++) {
			elm = elements[elmIdx];
			if (elm.nodeName.toLowerCase() == 'strong') changeNodeName(elm, 'b');
			if (elm.nodeName.toLowerCase() == 'em') changeNodeName(elm, 'i');
		}
		// 5682257
		elements = inElement.select('.wiki_unbold');
		for (elmIdx = 0; elmIdx < elements.length; elmIdx++) {
			elm = elements[elmIdx];
			Element.unwrap(elm, 'b', function() { return Builder.node('b') });
		}
		elements = inElement.select('.wiki_unitalic');
		for (elmIdx = 0; elmIdx < elements.length; elmIdx++) {
			elm = elements[elmIdx];
			Element.unwrap(elm, 'i', function() { return Builder.node('i') });
		}
		elements = inElement.select('.wiki_ununderline');
		for (elmIdx = 0; elmIdx < elements.length; elmIdx++) {
			elm = elements[elmIdx];
			Element.unwrap(elm, 'u', function() { return Builder.node('u') });
		}
	}
};

// Text block delegate. Really only handles the link popup.

var TextBlockDelegate = Class.createWithSharedInstance('textBlockDelegate');
TextBlockDelegate.prototype = {
	mTextBlockDebugDialog: null,
	mDelimeterClassName: 'wikieditor-textblock-delimeter',
	initialize: function() {
		if (document && document.body) return this._initialize();
	},
	_initialize: function() {
		this.mSmartLinkPopup = new CC.WikiEditor.SmartLinkPopup();
		this.mSmartLinkPopup._render();
		document.body.appendChild(this.mSmartLinkPopup.$());
		this.renderTextBlockDebugDialog();
		this.renderCopyPasteDebugConsole();
		var boundEditModeDidChange = this.handleEditModeDidChange.bind(this);
		globalNotificationCenter().subscribe(CC.WikiEditor.NOTIFICATION_DID_START_EDITING, boundEditModeDidChange);
		globalNotificationCenter().subscribe(CC.WikiEditor.NOTIFICATION_DID_FINISH_EDITING, boundEditModeDidChange);
	},
	addBlock: function() {
		editorToolbarDelegate().addBlock('text', {}, true);
	},
	showSmartLinkPopup: function(inOptAnchor, inOptURL, inOptLinkText, inOptTarget, inOptCallback, inOptCancelCallback) {
		this.mSmartLinkPopup.preparePopup(inOptAnchor, inOptURL, inOptLinkText, inOptTarget, inOptCallback, inOptCancelCallback);
		this.mSmartLinkPopup.show(inOptAnchor);
	},
	// Hash of allowed inline text styles.
	mRegisteredStyles: new Hash(),
	// A reverse hash of normalized inline styles we allow. Note that because this is calculated
	// in runtime depending on the reported style value returned by Element.getStyle, this is not
	// guaranteed to be the same across clients.
	mAllowedNormalizedStyles: new Hash(),
	// Registers a new inline style for the text block. Expects some kind of identifier
	// and accepts an optional description, class name and style hash. Text styling works by
	// converting inline styles to a class name on save, and vice versa on load. Doing so
	// allows us to safely save and serve markup maintaining appearance (inline styles can
	// contain malicious code/scripts in IE). Each registered style is stored as a tuple of
	// description, class name and style.
	registerInlineTextStyle: function(inTextStyleIdentifer, inOptTextStyleDescription, inOptClassName, inOptStyleHash) {
		if (!inTextStyleIdentifer) return logger().warn("Cannot register an inline text style without an identifer (%@)".fmt(inTextStyleIdentifer));
		if (this.mRegisteredStyles.get(inTextStyleIdentifer)) logger().warn("Inline text style (%@) is already registered and will be overwritten".fmt(inTextStyleIdentifer));
		var identifier = inTextStyleIdentifer;
		var displayName = (inOptTextStyleDescription || "%@ style".fmt(identifer));
		var className = (inOptClassName || identifier);
		var styles = $H(inOptStyleHash || {});
		var styleKeys = styles.keys(), styleKeyIdx, styleKey;
		this.mRegisteredStyles.set(identifier, [displayName, className, styles]);
		// Cache any allowed inline styles.
		for (styleKeyIdx = 0; styleKeyIdx < styleKeys.length; styleKeyIdx++) {
			styleKey = styleKeys[styleKeyIdx];
			this.mAllowedNormalizedStyles.set(CC.WikiEditor.TextBlockHelpers.styleValueToClassName(styleKey, styles.get(styleKey)), true);
		}
		logger().debug("Registered new inline text style (%@, %@)".fmt(className, styles));
		return true;
	},
	// Unregisters an inline text style if it exists.
	unregisterInlineTextStyle: function(inTextStyleIdentifer) {
		if (!inTextStyleIdentifer) return false;
		return this.mRegisteredStyles.unset(inTextStyleIdentifer);
	},
	// Renders a debug-friendly dialog capable of setting raw HTML and formatting options for
	// a text block by hand. Can be triggered on any text block.
	renderTextBlockDebugDialog: function() {
		this.mTextBlockDebugDialog = dialogManager().drawDialog('text_block_debug_dialog', [
			{label:'_Editor.Block.Text.Debug.Dialog.HTML.Label'.loc(), contents: '<textarea id="text_block_debug_dialog_html"/>'},
			{label:'_Editor.Block.Text.Debug.Dialog.Properties.Label'.loc(), contents: '<p id="text_block_debug_dialog_properties"></p>'},
		], "_Editor.Block.Text.Debug.Dialog.Update".loc(), undefined, "_Editor.Block.Text.Debug.Dialog.Title".loc(), "_Editor.Block.Text.Debug.Dialog.Cancel".loc());
	},
	// Initializes and shows a text block debug dialog for a given block. Returns false
	// where undefined or an invalid block is passed.
	showTextBlockDebugDialogForBlock: function(inEvent) {
		var element = inEvent.findElement('.block.text');
		if (!element) return false;
		var block = globalEditorController().blockForBlock(element);
		if (!block || !CC.kindOf(block, CC.WikiEditor.TextBlock)) return false;
		// Flush any pending changes before reading the state of the text block.
		block.handleDidStopEditing();
		var guid = block.getRecordPropertyForPath('guid');
		var extendedAttributes = block.getRecordPropertyForPath('extendedAttributes');
		var content = block.mViewInstance.$('.editable').innerHTML;
		var infoString = "GUID: %@, blockGUIDs: %@, containerGUID: %@".fmt(guid, extendedAttributes.blockGUIDs, extendedAttributes.containerGUID);
		// Update the dialog for the given block.
		$('text_block_debug_dialog_html').value = content;
		var debugDialogOptions, debugDialogOptionIdx, debugDialogOption;
		debugDialogOptions = $$('#text_block_debug_dialog option');
		for (debugDialogOptionIdx = 0; debugDialogOptionIdx < debugDialogOptions.length; debugDialogOptionIdx++) {
			debugDialogOption = debugDialogOptions[debugDialogOptionIdx];
			(debugDialogOption.value == tagName || debugDialogOption.value == alignment) ? debugDialogOption.setAttribute('selected', true) : debugDialogOption.removeAttribute('selected');
		}
		$('text_block_debug_dialog_properties').innerHTML = infoString;
		var callback = function(event, block) {
			markup = $('text_block_debug_dialog_html').value;
			block.setContent(markup);
		}
		// Show the dialog.
		dialogManager().show('text_block_debug_dialog', undefined, callback.bindAsEventListener(this, block));
	},
	// Initializes a copy/paste debug console that shows the current contents of the
	// offscreen simulated clipboard. Only shows in editor debug mode.
	renderCopyPasteDebugConsole: function() {
		var debugElem = Builder.node('div', {id: 'text_block_copy_paste_debug', className: 'collapsed chrome'}, [
			Builder.node('input', {type: 'button', className: 'clear', value: "_Editor.Block.Text.Debug.CopyPaste.Clear.Title".loc(), title: "_Editor.Block.Text.Debug.CopyPaste.Clear.Tooltip".loc()}),
			Builder.node('input', {type: 'button', className: 'toggle', value: "_Editor.Block.Text.Debug.CopyPaste.Toggle.Open.Title".loc(), title: "_Editor.Block.Text.Debug.CopyPaste.Toggle.Tooltip".loc()}),
			Builder.node('h2', {className: 'header'}, "_Editor.Block.Text.Debug.CopyPaste.Title".loc()),
			Builder.node('span', "_Editor.Block.Text.Debug.CopyPaste.Clipboard.Label".loc()),
			Builder.node('div', {className: 'clipboard'}),
		]);
		globalNotificationCenter().subscribe(CC.WikiEditor.NOTIFICATION_CLIPBOARD_DID_CHANGE, this.updateCopyPasteDebugConsole.bind(this));
		Element.observe(debugElem.down('input.clear'), 'click', this.handleCopyPasteDialogClear.bind(this));
		Element.observe(debugElem.down('input.toggle'), 'click', function(inEvent) {
			var _console = $('text_block_copy_paste_debug');
			this.toggleCopyPasteDebugConsole(inEvent, _console.hasClassName('collapsed'));
		}.bind(this));
		document.body.appendChild(debugElem);
	},
	handleCopyPasteDialogClear: function(inEvent) {
		$('text_block_copy_paste_debug').down('.clipboard').innerHTML = "";
	},
	updateCopyPasteDebugConsole: function(inMessage, inObject, inOptExtras) {
		$('text_block_copy_paste_debug').down('.clipboard').innerHTML = (inOptExtras.content.escapeHTML() || "_Editor.Block.Text.Debug.CopyPaste.Clipboard.Placeholder".loc());
	},
	toggleCopyPasteDebugConsole: function(inEvent, inShouldShowConsole) {
		var _console = $('text_block_copy_paste_debug');
		if (_console && (inShouldShowConsole != undefined)) {
			if (inShouldShowConsole) {
				_console.removeClassName('collapsed');
				_console.down('input.toggle').setValue("_Editor.Block.Text.Debug.CopyPaste.Toggle.Close.Title".loc());
			} else {
				_console.addClassName('collapsed');
				_console.down('input.toggle').setValue("_Editor.Block.Text.Debug.CopyPaste.Toggle.Open.Title".loc());
			}
		}
	},
	// 8764353
	// Normalizes inline styles for all text blocks or an optional text block on the page (using class names or
	// CSS style declarations). We convert any inline styled text to use a whitelist-friendly class name to avoid
	// potentially malicious inline style declarations and maintain page appearance. When the page first renders,
	// this method is automatically called for all text blocks. It is called in reverse when preparing individual
	// text blocks for save. You should not normally call this yourself.
	_normalizeInlineStyles: function(inShouldUseClassNames, inRootElement, inOptRecursiveElement) {
		var elem = $(inOptRecursiveElement || inRootElement);
		if (!elem) return false;
		if (!inOptRecursiveElement) {
			// 9314251
			// Bail if we don't have any tags with inline styles or font tags
			if ((!elem.down('font')) && (!elem.down('*[style]'))) return true;
			var formattingTags, formattingTagIdx, formattingTag;
			formattingTags = elem.select('b, i, u');
			for (formattingTagIdx = 0; formattingTagIdx < formattingTags.length; formattingTagIdx++) {
				formattingTag = formattingTags[formattingTagIdx];
				formattingTag.addClassName('wikieditor-textblock-deleteme');
			};
			// 7017852
			if (browser().isIE()) {
				var fontTags, fontTagIdx, fontTag;
				fontTags = elem.getElementsByTagName('font');
				for (fontTagIdx = 0; fontTagIdx < fontTags.length; fontTagIdx++) {
					fontTag = fontTags.item(fontTagIdx);
					var tempContainer = document.createElement('span');
					fontTag.parentNode.insertBefore(tempContainer, fontTag);
					tempContainer.innerHTML = Element.outerHtmlValue(fontTag).replace('FONT','SPAN');
					fontTag.parentNode.removeChild(fontTag);
					promoteElementChildren(tempContainer);
				}
			}
		} else {
			// Otherwise if we're recursing, bail if we're about to normalize a child-block.
			if (elem.hasClassName('block')) return true;
		}
		// If we're not using class names, we can heavily optimize converting to inline styles since we know exactly what
		// we're looking for. Also, by not querying the document for computed style values, we can normalize from classes
		// offscreen or in a fragment (9318032).
		if (!inShouldUseClassNames) {
			var stylesCache = textBlockDelegate().mRegisteredStyles;
			var stylesCacheKeys = stylesCache.keys(), stylesCacheIdx, stylesCacheKey, stylesCacheValue, styles, className;
			var tagsWithClassNames, tagWithClassName, styleKeys, styleKeyIdx, styleKey, _styles;
			for (stylesCacheIdx = 0; stylesCacheIdx < stylesCacheKeys.length; stylesCacheIdx++) {
				stylesCacheKey = stylesCacheKeys[stylesCacheIdx];
				stylesCacheValue = stylesCache.get(stylesCacheKey);
				styles = stylesCacheValue[2];
				className = stylesCacheValue[1];
				if (className) {
					tagsWithClassNames = elem.select("." + className);
					for (var tagIdx = 0; tagIdx < tagsWithClassNames.length; tagIdx++) {
						tagWithClassName = tagsWithClassNames[tagIdx];
						_styles = {};
						styleKeys = styles.keys();
						for (styleKeyIdx = 0; styleKeyIdx < styleKeys.length; styleKeyIdx++) {
							styleKey = styleKeys[styleKeyIdx];
							_styles[styleKey.camelize()] = styles.get(styleKey);
						}
						tagWithClassName.setStyle(_styles);
						tagWithClassName.removeClassName(className);
					}
				}
			}
			return true;
		}
		// For every non-whitespace text node child of the current working node, wrap the text node
		// in an <appletn> tag and re-apply the inherited styles to that tag.
		var childNodesLength = elem.childNodes.length, childNodeIdx, childNode, classNames, inheritedStylesString, tn, styles, styleIdx, style;
		for (childNodeIdx = 0; childNodeIdx < childNodesLength; childNodeIdx++) {
			var childNode = elem.childNodes.item(childNodeIdx);
			// Is the child a non-empty text node? 
			if (childNode.nodeType == 3 && childNode.nodeValue && childNode.nodeValue.match(/\S/)) {
				// Build an array of computed styles for the working element.
				var classNames = $A([]);
				for (var sIdx = 0; sIdx < CC.WikiEditor.TEXT_BLOCK_ALLOWED_INLINE_STYLES.length; sIdx++) {
					var s = CC.WikiEditor.TEXT_BLOCK_ALLOWED_INLINE_STYLES[sIdx];
					classNames.push(CC.WikiEditor.TextBlockHelpers.styleValueToClassName(s, elem.getStyle(s.camelize())));
				}
				// Wrap the working element (forcing inherited styles from the parent node).
				inheritedStylesString = CC.WikiEditor.TEXT_BLOCK_ALLOWED_INLINE_STYLES.join(': inherit; ') + ': inherit;';
				tn = Builder.node('appletn', {className: classNames.join(' '), style: inheritedStylesString}, childNode.nodeValue);
				elem.insertBefore(tn, childNode);
				// Clone the inherited styles to the newly inserted wrapper node and remove the originaltext node.
				styles = {}, styleIdx, style;
				for (styleIdx = 0; styleIdx < CC.WikiEditor.CAMELIZED_TEXT_BLOCK_ALLOWED_INLINE_STYLES.length; styleIdx++) {
					style = CC.WikiEditor.CAMELIZED_TEXT_BLOCK_ALLOWED_INLINE_STYLES[styleIdx];
					styles[style] = document.defaultView.getComputedStyle(tn, null)[style];
					if (style == 'fontWeight') styles[style] = CC.WikiEditor.TextBlockHelpers.normalizeBoldStyleValue(styles[style]);
				}
				Element.setStyle(tn, styles);
				Element.remove(childNode);
			}
			else if (childNode.nodeType == 1 && childNode.getAttribute('contentEditable') != false) {
				this._normalizeInlineStyles(inShouldUseClassNames, inRootElement, childNode);
			}
		}
		if (!inOptRecursiveElement) {
			// Remove all span tags and decorated formatting tags.
			var spans = elem.select('span'), spanIdx, span;
			for (spanIdx = spans.length - 1; spanIdx >= 0; spanIdx--) {
				span = spans[spanIdx];
				promoteElementChildren(span);
			}
			var formattingTags = elem.select('.wikieditor-textblock-deleteme'), formattingTagIdx, formattingTag;
			for (formattingTagIdx = formattingTags.length - 1; formattingTagIdx >= 0; formattingTagIdx--) {
				formattingTag = formattingTags[formattingTagIdx];
				promoteElementChildren(formattingTag);
			}
			// Convert any appletn wrapped text nodes back to styled text nodes using a combination of
			// bold, italic and underline formatting nodes and span tags with either class names or inline
			// styles depending on the value of inShouldUseClassNames passed.
			var tns = $A(elem.getElementsByTagName('appletn')), tnIdx, tn, tnClassNames, tnClassNameIdx, tnClassName;
			for (tnIdx = 0; tnIdx < tns.length; tnIdx++) {
				tn = tns[tnIdx];
				tnClassNames = tn.className.split(' ');
				// Are we normalizing to a class name on a wrapper element?
				if (inShouldUseClassNames) {
					var stylesCache = textBlockDelegate().mRegisteredStyles;
					var stylesCacheKeys = stylesCache.keys(), stylesCacheIdx, stylesCacheKey, stylesCacheValue, styles, styleKeys, styleKeysIdx, styleKey, className, allStylesPresent;
					for (stylesCacheIdx = 0; stylesCacheIdx < stylesCacheKeys.length; stylesCacheIdx++) {
						stylesCacheKey = stylesCacheKeys[stylesCacheIdx];
						stylesCacheValue = stylesCache.get(stylesCacheKey);
						styles = stylesCacheValue[2];
						styleKeys = styles.keys();
						className = stylesCacheValue[1];
						// Only swap styles for a registered class name where we (at least) have all styles
						// required for that class name. Wrap applicable nodes in a span with a className.
						allStylesPresent = true;
						for (styleKeysIdx = 0; styleKeysIdx < styleKeys.length; styleKeysIdx++) {
							styleKey = styleKeys[styleKeysIdx];
							if (!tn.hasClassName(CC.WikiEditor.TextBlockHelpers.styleValueToClassName(styleKey, styles.get(styleKey)))) allStylesPresent = false;
						}
						if (allStylesPresent && className != 'plain') {
							var spanWithClassName = Element.wrap(tn, 'span');
							Element.addClassName(spanWithClassName, className);
						}
					}
				}
				// Otherwise we're normalizing to inline styles/formatting tags surrounding a wrapper element.
				else {
					var styledSpan; 
					for (tnClassNameIdx = 0; tnClassNameIdx < tnClassNames.length; tnClassNameIdx++) {
						tnClassName = tnClassNames[tnClassNameIdx];
						if (!textBlockDelegate().mAllowedNormalizedStyles.get(tnClassName)) continue;
						if (tnClassName == 'font-weight-bold') {
							Element.wrap(tn, 'b');
						}
						else if (tnClassName == 'font-style-italic') {
							Element.wrap(tn, 'i');
						}
						else if (tnClassName == 'text-decoration-underline') {
							Element.wrap(tn, 'u');
						}
						else {
							var backgroundColorMatch = tnClassName.match(/^\s*(background-color-.+)\s*$/);
							if (backgroundColorMatch) {
								if (!styledSpan) styledSpan = Element.wrap(tn, 'span');
								Element.setStyle(styledSpan, {'backgroundColor': tn.getStyle('backgroundColor')});
							}
							var colorMatch = tnClassName.match(/^\s*(color-.+)\s*$/);
							if (colorMatch) {
								if (!styledSpan) styledSpan = Element.wrap(tn, 'span');
								Element.setStyle(styledSpan, {'color': Element.getStyle(tn, 'color')});
							}
						}
					}
					styledSpan = null;
				}
				promoteElementChildren(tn);
			}
		}
	},
	// Normalizes alignment properties for an optional text block on the page. Converts text-align
	// style declarations and align attributes to class names (and vice-versa).
	_normalizeTextAlignment: function(inShouldUseClassNames, inRootElement) {
		var elem = $(inRootElement);
		var alignments = 'left right center justify'.w(), alignedTags, alignedTagIdx, alignedTag, alignment;
		if (inShouldUseClassNames) {
			alignedTags = elem.select("*[align], *[style]");
			for (alignedTagIdx = (alignedTags.length - 1); alignedTagIdx >= 0; alignedTagIdx--) {
				alignedTag = alignedTags[alignedTagIdx];
				alignment = (alignedTag.hasAttribute('align') ? alignedTag.getAttribute('align') : alignedTag.style.textAlign);
				if (alignment && !/\s/.test(alignment) && (alignments.indexOf(alignment) != -1)) {
					alignedTag.removeAttribute('align');
					alignedTag.style.textAlign = '';
					alignedTag.addClassName('align-' + alignment);
				}
			}
		} else {
			var alignedTags = elem.select(".align-%@".fmt(alignments.join(', .align-')));
			for (var alignedTagIdx = (alignedTags.length - 1); alignedTagIdx >= 0; alignedTagIdx--) {
				alignedTag = alignedTags[alignedTagIdx];
				alignment = alignedTag.className.match(/align-([\w]*)/)[1];
				alignedTag.removeClassName('align-' + alignment);
				alignedTag.setStyle({
					'textAlign': alignment
				});
			}
		}
	},
	// Takes the current document selection and inserts delimeters at the start and end
	// points of the selection range.
	addDelimetersToCurrentSelection: function() {
		// Flush any unwanted delimeters first.
		$$('.' + this.mDelimeterClassName).invoke('remove');
		// Get the current selection if it exists.
		var selectedRange = globalEditorTextSelectionDelegate().getSelectionAsRange();
		var startDelimeter = document.createElement('span');
		startDelimeter.className = '%@ start'.fmt(this.mDelimeterClassName);
		var endDelimeter = document.createElement('span');
		endDelimeter.className = '%@ end'.fmt(this.mDelimeterClassName);
		var clonedNode = document.createElement('div');
		// Surround the selected range in two delimeter elements.
		if (selectedRange && selectedRange.cloneContents && selectedRange.insertNode) {
			var extractedFragment = selectedRange.cloneContents();
			clonedNode.appendChild(extractedFragment.cloneNode(true));
			// Insert the start delimeter.
			selectedRange.insertNode(startDelimeter);
			// Create a new, non-destructive range after the current selection.
			var range = document.createRange();
			range.setStart(selectedRange.endContainer, selectedRange.endOffset);
			// Insert the end delimeter.
			range.insertNode(endDelimeter);
		}
	},
	// Partitions a given DOM element based on the position of any child delimeters, returning three
	// complete node trees (before the first delimeter, between the first and second delimeter and
	// after the second delimeter). Where the element being partitioned only contains one delimeter
	// returns two complete node trees (before the delimeter and between the delimeter and the end of
	// the text block). To split on a delimeter, we start at the delimeter node and recursively remove
	// all the previous/next nodes at that working level before stepping up to the parent node and repeating
	// until we hit the root node. The result is split element with unwanted non-layout-affecting peer nodes
	// removed. You should not normally call this method yourself.	
	partitionElement: function(inElement) {
		if (!inElement) return;
		logger().debug("partitionElement: %o", inElement.innerHTML);
		// Ensure we have at least one delimeter before we clone any nodes.
		var delimeters = inElement.getElementsByClassName(this.mDelimeterClassName);
		if (!delimeters || delimeters.length == 0) return;
		// Clone the root node twice so we can create two adjusted trees.
		var leftTree = inElement.cloneNode(true), rightTree = inElement.cloneNode(true);
		var leftTreeDelimeter = leftTree.querySelector('.' + this.mDelimeterClassName);
		var rightTreeDelimeter = rightTree.querySelector('.' + this.mDelimeterClassName);
		// Recursively prunes peer node up to the root element.
		var pruneTree = function(inDelimeterNode, inOptPruneDirection, inOptRemoveNodeIdentifiers) {
			var workingNode = inDelimeterNode, sibling;
			while (workingNode && workingNode.parentNode) {
				if (inOptRemoveNodeIdentifiers && workingNode.id) workingNode.removeAttribute('id');
				sibling = (inOptPruneDirection == 'left' ? workingNode.previousSibling : workingNode.nextSibling);
				if (sibling == undefined) {
					workingNode = workingNode.parentNode;
					continue;
				}
				workingNode.parentNode.removeChild(sibling);
			}
			// Remove any cloned delimeters from the tree.
			if (inDelimeterNode && inDelimeterNode.parentNode) inDelimeterNode.parentNode.removeChild(inDelimeterNode);
			// Return.
			return workingNode;
		}
		// Initialize an array of partitions, and compute the partitions.
		var partitions = new Array();
		// Prune the cloned elements.
		leftTree = pruneTree(leftTreeDelimeter);
		rightTree = pruneTree(rightTreeDelimeter, 'left', true);
		partitions.push(leftTree.innerHTML);
		// Do we have another delimeter to partition on?
		if (rightTree.querySelector('.' + this.mDelimeterClassName)) {
			partitions = partitions.concat(this.partitionElement(rightTree));
		} else {
			partitions.push(rightTree.innerHTML);
		}
		// Remove any delimeter elements from the original element.
		var delimeterIdx, delimeter;
		for (delimeterIdx = (delimeters.length - 1); delimeterIdx >= 0; delimeterIdx--) {
			delimeter = delimeters.item(delimeterIdx);
			delimeter.parentNode.removeChild(delimeter);
		}
		// Return our newly computed partitions.
		logger().debug("partitions: %o", partitions);
		return partitions;
	},
	// Handles a change in edit mode on the page. Configures contentEditable on any text blocks on
	// the page, and exchanges classes for inline style declarations.
	handleEditModeDidChange: function(inMessage, inObject, inOptExtras) {
		var editable = (inMessage == CC.WikiEditor.NOTIFICATION_DID_START_EDITING) ? true : false;
		// Configure contentEditable on all text blocks.
		var editorView = globalEditorController().mEditorView.$();
		var editables = (editorView ? editorView.select('.block.text .editable') : []), editableIdx, _editable;
		for (editableIdx = 0; editableIdx < editables.length; editableIdx++) {
			_editable = editables[editableIdx];
			_editable.setAttribute('contentEditable', editable);
		}
		// If we need to, configure debug links.
		if (globalEditorController().mDebugMode) {
			var debugLinks = $$('.block.text .inner .debug'), debugLinkIdx, debugLink;
			var boundShowTextBlockDebugDialog = this.showTextBlockDebugDialogForBlock.bind(this);
			for (debugLinkIdx = 0; debugLinkIdx < debugLinks.length; debugLinkIdx++) {
				debugLink = debugLinks[debugLinkIdx];
				Event.observe(debugLink, 'click', boundShowTextBlockDebugDialog);
			}
		}
	},
	// Appends the result of a markup migration to a given block at an optionally restored selection point.
	// Since migrations are internally consistent, appends the contents of the text block at the root of the
	// migration result to the given block at the current/restored selection point. Following that, any child
	// blocks are added and placeholder elements expanded.
	appendMigratedContentToBlockAtSelection: function(inBlock, inMigrationResult, inOptRestoreSelection) {
		if (!CC.kindOf(inBlock, CC.WikiEditor.TextBlock) || (!inMigrationResult || !inMigrationResult.extendedAttributes.content)) return false;
		if (inOptRestoreSelection) {
			// 9454485
			if (browser().isFirefox()) inBlock.mViewInstance._editable.focus();
			try { globalEditorTextSelectionDelegate().restoreSelection(); } catch(e) {}
		}
		var _fragment = this.buildFragmentForBulkAddMigratedResultToBlock(inMigrationResult, inBlock);
		// 9408143
		// Insert a placeholder with an empty text node child, otherwise insertHTML will skip it.
		inBlock.mViewInstance.insertHTML('<img class="wikieditor-paste-placeholder"/>');
		// Find and replace the placeholder we just created.
		var placeholder = inBlock.mViewInstance.$('.wikieditor-paste-placeholder');
		if (placeholder) {
			placeholder.parentNode.insertBefore(_fragment, placeholder);
			// 9382142
			// Create a wrapping span around the placeholder element, and give it focus. This span will
			// be cleaned up sometime later when the content of the parent text block is normalized.
			var wrapperSpan = Element.wrap(placeholder, 'span');
			placeholder.parentNode.removeChild(placeholder);
			wrapperSpan.focus();
			globalEditorTextSelectionDelegate().selectAllChildren(wrapperSpan);
		}
	},
	// Appends the result of a migration to a given block, working inside a document fragment. Accepts an
	// optional editor argument for cases where we're not appending to the globalEditorController shared
	// instance.
	buildFragmentForBulkAddMigratedResultToBlock: function(inMigrationResult, inBlock, inOptEditor) {
		// Append the markup of the first migrated text block, working inside a document fragment.
		var _fragment = document.createDocumentFragment();
		var _workingElement = _fragment.appendChild(Element.extend(document.createElement('span')));
		var topLevelTextBlockMarkup = (inMigrationResult.extendedAttributes || {}).content;
		_workingElement.innerHTML = topLevelTextBlockMarkup;
		// Next migrate any child blocks in place. Child blocks will automatically be rendered in the position
		// of a corresponding placeholder element where it exists.
		var editorInstance = (inOptEditor || globalEditorController());
		if (!editorInstance) return _fragment;
		var _childBlocks = inMigrationResult._childBlocks, _childBlockIdx, _childBlock;
		if (_childBlocks && (_childBlocks.length > 0)) {
			for (_childBlockIdx = 0; _childBlockIdx < _childBlocks.length; _childBlockIdx++) {
				_childBlock = _childBlocks[_childBlockIdx];
				editorInstance.bulkAddBlock(_childBlock, undefined, inBlock, false, _workingElement);
			}
		}
		return _fragment;
	},
	attemptUndo: function() {
		try {
			document.execCommand('undo', false)
		} catch (e) {};
	}
};

// Text block controller.

CC.WikiEditor.TextBlock = Class.create(CC.WikiEditor.Block, CC.WikiEditor.Mixins.Navigation, {
	mBlockView: 'CC.WikiEditor.TextBlockView',
	mIsContainer: true,
	// Proxy most controller methods off to the view for this block.
	setContent: function() {
		return this.mViewInstance.setContent.apply(this.mViewInstance, arguments);
	},
	setFormatting: function() {
		return this.mViewInstance.setFormatting.apply(this.mViewInstance, arguments);
	},
	setStyle: function() {
		return this.mViewInstance.setStyle.apply(this.mViewInstance, arguments);
	},
	setAlignment: function() {
		return this.mViewInstance.setAlignment.apply(this.mViewInstance, arguments);
	},
	setListStyle: function() {
		return this.mViewInstance.setListStyle.apply(this.mViewInstance, arguments);
	},
	adjustIndentation: function() {
		return this.mViewInstance.adjustIndentation.apply(this.mViewInstance, arguments);
	},
	moveToStart: function() {
		return this.mViewInstance.moveToStart.apply(this.mViewInstance, arguments);
	},
	moveToEnd: function() {
		return this.mViewInstance.moveToEnd.apply(this.mViewInstance, arguments);
	},
	focusedAtStart: function() {
		return this.mViewInstance.focusedAtStart.apply(this.mViewInstance, arguments);
	},
	focusedAtEnd: function() {
		return this.mViewInstance.focusedAtEnd.apply(this.mViewInstance, arguments);
	},
	isEmpty: function() {
		var layer = this.mViewInstance.$('.editable');
		var val = (layer && layer.innerHTML);
		// Is the innerHTML of the editable element empty?
		var hasValue = ((val != undefined) && (val != ""));
		// If not, clone the editable element and strip any meaningless markup. If we're
		// left anything less than a single <br> tag, the node is considered empty.
		if (hasValue) {
			var clonedLayer = layer.cloneNode(true);
			removeMeaninglessMarkup(clonedLayer);
			if (clonedLayer.hasChildNodes()) {
				if (clonedLayer.childNodes.length == 1) {
					if (clonedLayer.firstChild.nodeName.toLowerCase() == 'br') return true;
				}
			} else {
				return true;
			}
			return false;
		}
		return true;
	},
	isExplosive: function() {
		return false;
	},
	handleDidStartEditing: function($super, inOptInfo) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		if (inOptInfo && inOptInfo.propagated) return true;
		// We only need to focus the contenteditable field to do text selection queries.
		// We explicitly choose not to focus if this callback was fired by a mouse event.
		var focus = false;
		// Was focus explicitly passed as false?
		if (inOptInfo && (inOptInfo.focus != false)) {
			focus = true;
		}
		// Should we position the cursor at the beginning?
		var start = inOptInfo ? inOptInfo.moveToStart : false;
		// Or the end?
		var end = inOptInfo ? inOptInfo.moveToEnd : false;
		this.mViewInstance._activate(focus, start, end);
	},
	handleDidStopEditing: function($super, inOptInfo) {
		$super();
		if (inOptInfo && inOptInfo.propagated) return true;
		this.mViewInstance._deactivate();
	},
	addLink: function(inLink, inEvent) {
		if (this.mViewInstance) this.mViewInstance.showLinkDialog(inEvent);
	},
	handleDidAddBlock: function($super, inOptInfo) {
		// Do we have a placeholder DOM element corresponding to the position of the child block view?
		// If we do, remove the placeholder element and replace it with the newly rendered block view.
		// Otherwise insert the block at the current cursor position (if we have one).
		if (!inOptInfo.block) return false;
		var blockGUID = inOptInfo.block.getRecordPropertyForPath('guid');
		var workingElement = (inOptInfo.workingElement || this.mViewInstance.$());
		var placeholder = workingElement.down(".block-placeholder[data-guid=\"%@\"]".fmt(blockGUID));
		var renderedResult;
		if (!placeholder) {
			// If we don't have a specific placeholder for this block, do we have a generic one? A
			// placeholder should only ever not have a specific GUID if it is declared in one of our
			// default page templates. Bit of a hack...
			var _placeholder = workingElement.down(".block-placeholder");
			if (_placeholder && !_placeholder.getAttribute('data-guid')) placeholder = _placeholder;
		}
		if (placeholder) {
			renderedResult = blockRenderingDelegate().renderAndInsertBlockAtPosition(inOptInfo.block, {'after': placeholder});
			placeholder.parentNode.removeChild(placeholder);
		} else if (inOptInfo.position) {
			renderedResult = blockRenderingDelegate().renderAndInsertBlockAtPosition(inOptInfo.block, inOptInfo.position);
		} else {
			// This may well fail, depending on whether we have a selection or not.
			try { globalEditorTextSelectionDelegate().restoreSelection(); } catch (e) {};
			renderedResult = blockRenderingDelegate().renderAndInsertBlock(inOptInfo.block);
			// If we don't have a selection, or inserting the block failed, fall back to inserting at
			// the end of this blocks view instance element.
			if (!renderedResult) {
				var editableElement = workingElement.down('.editable');
				if (editableElement) renderedResult = blockRenderingDelegate().renderAndInsertBlockAtPosition(inOptInfo.block, {'bottom': editableElement});
			}
		}
		if (!renderedResult) {
			logger().error("Could not add sub-block (%@) to text block (%@)", inOptInfo.block, this);
		}
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
	},
	// Autosave support.
	restore: function($super, inChangesets) {
		var changesetKey, changesetValue, changesetIdx, changes;
		for (changesetIdx = 0; changesetIdx < inChangesets.length; changesetIdx++) {
			changes = inChangesets[changesetIdx];
			if (changes.length < 2) continue;
			changesetKey = changes[0];
			changesetValue = changes[1];
			if (changesetKey != 'extendedAttributes') continue;
			var content = changesetValue['content'];
			if (content) this.mViewInstance.setContent(content);
		}
		$super(inChangesets);
	}
});

CC.WikiEditor.TextBlockView = Class.create(CC.WikiEditor.BlockView, CC.WikiEditor.Mixins.Prediction, CC.WikiEditor.Mixins.Comparable, {
	mDefaultContent: "",
	mPasteHandlerDelay: 100,
	mChangeHandlerDelay: 5000,
	renderAsHTML: function() {
		var block = this.mContent;
		var attrs = block.getRecordPropertyForPath('extendedAttributes');
		var content = (attrs['content'] || this.mDefaultContent);
		var isPlaceholder = attrs['placeholder'], isEditable = block.isEditable();
		// If this block is a placeholder text block, render placeholder content. We first check for a
		// placeholderStringKey in the block extended attributes falling back to a default placeholder 
		// string where necessary.
		var innerHTML = (content || "");
		if (isPlaceholder && (!content || content.isWhitespace())) {
			var placeholderStringKey = block.getRecordPropertyForPath('extendedAttributes.placeholderStringKey', "_Editor.Block.Text.Placeholder");
			innerHTML = placeholderStringKey.loc();
		}
		// 9261334
		var tagName = attrs['tagName'], alignment = attrs['alignment'];
		var extraSeedClassNames = "";
		if (tagName || alignment) extraSeedClassNames += " " + ((tagName || "") + (alignment ? " align-%@".fmt(alignment) : ""));
		// Build the rendered text block.
		var html = "<div id=\"%@\" class=\"editable wrapchrome%@\" contentEditable=\"%@\">%@</div>".fmt(this.getEventDelegateIdentifer() + "-editable", extraSeedClassNames, isEditable, innerHTML);
		this._cachedContent = (innerHTML || "");
		return html;
	},
	registerEventHandlers: function() {
		this._editable = this.$().down('.editable');
		if (!this._editable) return;
		bindEventListeners(this, [
			'handleContentEditableMouseDown',
			'handleContentEditablePaste',
			'handleContentEditableDidFocus',
			'handleContentEditableDidBlur'
		]);
		var editableIdentifer = this.getEventDelegateIdentifer() + "-editable";
		globalEventDelegate().bulkRegisterDomResponderForEventByIdentifer([
			['mousedown', editableIdentifer, this.handleContentEditableMouseDown],
			['paste', editableIdentifer, this.handleContentEditablePaste],
			['focus', editableIdentifer, this.handleContentEditableDidFocus],
			['blur', editableIdentifer, this.handleContentEditableDidBlur]
		]);
		this.formatAllLinks(this._editable);
		this.initializePoorMansChangeObserver();
	},
	// Once the view has rendered, immediately convert classes to inline styles. We always work in inline
	// style declarations for performance. Note that when a text block is edited it pushes a deferred store
	// update that recalculates its HTML content value using normalized class name styles on a cloned DOM
	// node. On save - the page refreshes, and handleDidRenderView is called on the new view instance that
	// was just added. We normalize inline styles as soon as the view is rendered for performance (so we
	// don't recursively try to normalize styles on a nested tree of blocks).
	handleDidRenderView: function($super, inOptInfo) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		// Normalize inline styles before any child blocks are added to this parent.
		textBlockDelegate()._normalizeTextAlignment(false, this._editable);
		textBlockDelegate()._normalizeInlineStyles(false, this._editable);
	},
	_activate: function(inOptFocus, inOptMoveToStart, inOptMoveToEnd) {
		if (!this._editable) return;
		var block = this.mContent.mRecord;
		var attrs = block.extendedAttributes;
		if (inOptFocus) {
			if ((attrs.placeholder || inOptMoveToStart || inOptMoveToEnd) && this._editable) this._editable.focus();
			if (!attrs.placeholder && inOptMoveToStart) this.mContent.moveToStart();
			if (!attrs.placeholder && inOptMoveToEnd) this.mContent.moveToEnd();
		}
	},
	_deactivate: function() {
		// See prepareForEdit. Instead of setting content on deactivate, we set it on a change timer.
	},
	// Workaround the fact that change handlers refuse to fire for contentEditable elements and DOM mutation
	// events are EXTREMELY expensive in IE/Firefox by rigging up a poor-mans change observer.
	initializePoorMansChangeObserver: function() {
		if (this.mContentEditableChangeInterval) clearInterval(this.mContentEditableChangeInterval);
		var _observer = function() {
			if (!this.mPushedDeferredContentChange) {
				if (this.mContentEditableChangeInterval) clearInterval(this.mContentEditableChangeInterval);
				this.mContent.setRecordPropertyForPathUsingDeferred('extendedAttributes.content', this.prepareAndReturnMarkupForSave.bind(this));
				this.mPushedDeferredContentChange = true;
			}
		}.bind(this);
		this.mContentEditableChangeInterval = setInterval(_observer, this.mChangeHandlerDelay);
		// 9390569
		return _observer();
	},
	// Callback function called on page save when the editable region of this block has changed.
	prepareAndReturnMarkupForSave: function() {
		// Work on a clone so we don't lose the active selection by manipulating the DOM when autosaving changes.
		// The clone MUST be added to the dom so we can query computed styles when normalizing styles.
		var elem = this._editable.cloneNode(true);
		elem.style.display = 'none';
		document.body.appendChild(elem);
		// Replace child blocks with placeholders.
		this.replaceChildBlocksWithPlaceholders(elem);
		// Remove any external link targets.
		this.removeExternalLinkTargets(elem);
		// Normalize alignment and inline styles.
		textBlockDelegate()._normalizeTextAlignment(true, elem);
		textBlockDelegate()._normalizeInlineStyles(true, elem);
		// Remove any meaningless markup.
		removeMeaninglessMarkup(elem);
		// Remove any unwanted styles.
		CC.WikiEditor.TextBlockHelpers.fixInlineStyles(elem);
		var _innerHTML = elem.innerHTML;
		elem.parentNode.removeChild(elem);
		return _innerHTML;
	},
	handleContentEditableDidFocus: function(inEvent) {
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_BLOCK_CONTENTEDITABLE_DID_FOCUS, this.mContent);
	},
	handleContentEditableDidBlur: function(inEvent) {
		this._deactivate();
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_BLOCK_CONTENTEDITABLE_DID_BLUR, this.mContent);
	},
	handleKeyboardNotification: function(inMessage, inObject, inOptExtras) {
		if (inMessage == CC.Keyboard.NOTIFICATION_DID_KEYBOARD_BACKSPACE || inMessage == CC.Keyboard.NOTIFICATION_DID_KEYBOARD_DELETE || inMessage == CC.Keyboard.NOTIFICATION_DID_KEYBOARD_FORWARD_DELETE) {
			if (inOptExtras.event) inOptExtras.event.stopPropagation();
			return false;
		}
		if (inMessage == CC.Keyboard.NOTIFICATION_DID_KEYBOARD_INDENT || inMessage == CC.Keyboard.NOTIFICATION_DID_KEYBOARD_OUTDENT) {
			var direction = (inMessage == CC.Keyboard.NOTIFICATION_DID_KEYBOARD_OUTDENT ? 'outdent' : 'indent');
			this.adjustIndentation(direction);
			Event.stop(inOptExtras.event);
			return true;
		}
	},
	moveToStart: function() {
		return globalEditorTextSelectionDelegate().moveCursorToStart(this._editable);
	},
	moveToEnd: function() {
		return globalEditorTextSelectionDelegate().moveCursorToEnd(this._editable);
	},
	focusedAtStart: function() {
		return globalEditorTextSelectionDelegate().isCursorFocusedAtStart(this._editable);
	},
	focusedAtEnd: function() {
		return globalEditorTextSelectionDelegate().isCursorFocusedAtEnd(this._editable);
	},
	// Returns a comparable, sortable value for this block.
	getComparableValue: function() {
		return Element.textValue(this._editable);
	},
	// Raw html manipulation.
	insertHTML: function(inHTML) {
		if (browser().isIE()) {
			if (document.selection.type == 'None') this._editable.innerHTML += inHTML;
			else document.selection.createRange().pasteHTML(inHTML);
		}
		else {
			if (document.queryCommandEnabled('inserthtml')) {
				document.execCommand('inserthtml', false, inHTML);
			}
		}
	},
	// Removes the placeholder flag from this text block if it is set.
	removePlaceholderFlag: function() {
		var placeholder = this.mContent.getRecordPropertyForPath('extendedAttributes.placeholder');
		if (placeholder) this.mContent.setRecordPropertyForPath('extendedAttributes.placeholder', false);
	},
	// Triggers an editor toolbar update.
	triggerToolbarUpdate: function() {
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_EDITOR_SHOULD_UPDATE_TOOLBAR, this, {'block': this.mContent});
	},
	// Contextual toolbar actions for text formatting.
	setContent: function(inContent) {
		var content = (inContent || this._editable.innerHTML);
		if (content != this._cachedContent) {
			if (inContent != undefined) this._editable.innerHTML = content;
			this.mContent.setRecordPropertyForPath('extendedAttributes.content', content);
			this._cachedContent = content;
			this.removePlaceholderFlag();
		}
		return true;
	},
	setFormatting: function(inFormatting) {
		if (!inFormatting) return;
		try { globalEditorTextSelectionDelegate().restoreSelection(); } catch(e) {};
		var formatting = inFormatting;
		if (browser().isIE()) formatting = "<%@>".fmt(formatting);
		document.execCommand('formatblock', false, (browser().isIE() ? "<p>" : "p"));
		// 5297272
		document.execCommand('outdent', false, null);
		// We overload the blockquote tag for both quote styling, and indentation. If we're applying
		// in the former context, track any blockquote tags before the operation and add a class name
		// to any new blockquote tags added as a result of the operation. Since IE doesn't support
		// formatBlock using blockquote, temporarily format as h4 tags.
		var fakeBlockquotes;
		if (inFormatting == 'blockquote') {
			formatting = browser().isIE() ? "<h4>" : "h4";
			fakeBlockquotes = $$('.block .editable h4');
		}
		// Apply the formatting.
		document.execCommand('formatblock', false, formatting);
		// Touch up any fake blockquotes.
		if (inFormatting == "blockquote") {
			var _fakeBlockquotes = $$('.block .editable h4'), _fakeBlockquote;
			for (var idx = (_fakeBlockquotes.length - 1); idx >= 0; idx--) {
				_fakeBlockquote = _fakeBlockquotes[idx];
				if (fakeBlockquotes.indexOf(_fakeBlockquote) == -1) {
					var blockquote = Element.wrap(_fakeBlockquote, 'blockquote');
					blockquote.addClassName('quote');
					promoteElementChildren(blockquote.firstChild);
				}
			}
		}
		this.triggerToolbarUpdate();
	},
	setStyle: function(inStyle) {
		if (!inStyle) return;
		try { globalEditorTextSelectionDelegate().restoreSelection(); } catch(e) {};
		// Special-case plain styles and remove everything.
		if (inStyle == 'plain') {
			if (globalEditorTextSelectionDelegate().currentSelectionIsEmpty()) {
				if (document.queryCommandState('bold')) document.execCommand('bold', false, null);
				if (document.queryCommandState('italic')) document.execCommand('italic', false, null);
				if (document.queryCommandState('underline')) document.execCommand('underline', false, null);
				document.execCommand('foreColor', false, 'inherit');
				document.execCommand('backColor', false, 'inherit');
			}
			document.execCommand('removeFormat', false, null);
		}
		// Do we have any styles to apply?
		var style = textBlockDelegate().mRegisteredStyles.get(inStyle);
		if (style && style[2]) {
			var isIE = browser().isIE();
			// Apply any inline styles.
			// 5366338
			if (!isIE) document.execCommand('styleWithCSS', false, true);
			var styles = style[2];
			var styleKeys = styles.keys(), styleKeyIdx, styleKey, styleValue;
			for (styleKeyIdx = 0; styleKeyIdx < styleKeys.length; styleKeyIdx++) {
				styleKey = styleKeys[styleKeyIdx];
				styleValue = styles.get(styleKey);
				this._applyInlineStyle(styleKey, styleValue);
			}
			if (!isIE) document.execCommand('styleWithCSS', false, false);
		}
		CC.WikiEditor.TextBlockHelpers.fixInlineStyles(this._editable);
	},
	// Use execCommand to apply inline styles we know will work cross-browser.
	// http://www.quirksmode.org/dom/execCommand.html
	_applyInlineStyle: function(inStyleProperty, inOptStyleValue) {
		logger().debug("_applyInlineStyle: %o %o", inStyleProperty, inOptStyleValue);
		if (!inStyleProperty) return false;
		var styleValue = (inOptStyleValue || '');
		switch (inStyleProperty) {
			case 'background-color':
			case 'color':
				// 5369907
				if (browser().isIE()) styleValue = styleValue.replace(/^#/, '');
				var attr = (inStyleProperty == 'color' ? 'foreColor' : 'backColor');
				document.execCommand(attr, false, styleValue);
				break;
			case 'font-style':
				if (styleValue == 'italic' && !document.queryCommandState('italic')) document.execCommand('italic', false, null);
				break;
			case 'font-weight':
				// Convert integer boldness values to either bold or normal.
				styleValue = CC.WikiEditor.TextBlockHelpers.normalizeBoldStyleValue(styleValue);
				if ((styleValue == 'bold' && !document.queryCommandState('bold')) || (styleValue == 'normal' && document.queryCommandState('bold'))) document.execCommand('bold', false, null);
				break;
			case 'text-decoration':
				if (styleValue == 'underline' && !document.queryCommandState('underline')) document.execCommand('underline', false, null);
				break;
		}
	},
	setAlignment: function(inAlignment) {
		if (!this._editable || !inAlignment) return;
		document.execCommand('justifynone', false, null);
		var alignment = inAlignment;
		if (alignment == "justify") alignment = "full";
		alignment = "justify%@".fmt(alignment);
		document.execCommand(alignment, false, null);
		this.triggerToolbarUpdate();
	},
	showLinkDialog: function(inEvent, inOptAnchor) {
		var anchor = inOptAnchor || (inEvent && inEvent.findElement('li.item'));
		var selectedString = globalEditorTextSelectionDelegate().getSelectedString();
		textBlockDelegate().showSmartLinkPopup(anchor, undefined, selectedString, undefined, this.addLink.bind(this), this.handleLinkDialogCancelled.bind(this));
	},
	handleLinkDialogCancelled: function(inEvent) {
		this._activate(true);
		try { globalEditorTextSelectionDelegate().restoreSelection(); } catch(e) {};
	},
	// Makes the existing selection a link if it exists, or adds a new link.
	addLink: function(inURL, inLinkText, inTarget) {
		this._activate(true);
		try { globalEditorTextSelectionDelegate().restoreSelection(); } catch(e) {};
		if (inURL && inURL != "" && !inURL.isWhitespace()) {
			// Always link to something.
			if (!inURL.match(/^\/|[A-Za-z]+:/i)) inURL = 'http://' + inURL;
			// Do we have an empty selection?
			if (globalEditorTextSelectionDelegate().currentSelectionIsEmpty()) {
				var match = inURL.match(/\/([^\/])$/);
				var linkText = inLinkText || (match ? match[1] : inURL);
				// To avoid refactoring too much code on the server side, we use the href to pass all the extra attributes of a link
				// like the target attribute for example. We're using the URI standard protocol (http//...?key=value&key=value...)		
				this.insertHTML('<a href=\"%@?target=%@\">%@</a>'.fmt(inURL, inTarget, linkText.escapeHTML()));
			} else {
				var selected = window.getSelection().toString();
				document.execCommand('insertHTML', false, '<a href=\"%@?target=%@\">%@</a>'.fmt(inURL, inTarget, selected));
			}
		} else {
			// Strip any links if a URL isn't specified.
			document.execCommand('unlink');
		}
	},
	removeExternalLinkTargets: function(inOptElement) {
		(inOptElement || this._editable).select('a').invoke('removeAttribute', 'target');
	},
	addExternalLinkTargets: function(inOptElement) {
		var links = (inOptElement || this._editable).select('a'), href, linkIdx, link
		for (linkIdx = 0; linkIdx < links.length; linkIdx++) {
			link = links[linkIdx];
			href = link.getAttribute('href');
			if (href && href.match(/^[A-Za-z]+:\/{2,3}/)) link.setAttribute('target', '_self');
		}
	},
	// Formats all the links in a page using the 'data-editable-link' which stores all the <a> attributes like target for example.
	formatAllLinks: function(inOptElement) {
		var links = (inOptElement || this._editable).select('a'), href, linkIdx, link;
		var url, target, dataEditableLink;		
		for (linkIdx = 0; linkIdx < links.length; linkIdx++) {			
			link = links[linkIdx];			
			href = link.getAttribute('href');
			url = href.split('?')[0];						
			dataEditableLink = link.getAttribute('data-editable-link');

			// If it's a new link creation then dataLinkAttribute should be null. 
			// In this case use the href which contains all the attributes based on the URI standard protocol (http//...?key=value&key=value...)
			if (!dataEditableLink) {
				target = globalEditorTextSelectionDelegate().getParameterByName(href, 'target');
				dataEditableLink = href;
			} else {
				target = globalEditorTextSelectionDelegate().getParameterByName(dataEditableLink, 'target');			
			}
			
			// Migration case: if target ends up being null or can't be extracted from the href
			// Then set default values... we may reach that case during a wiki migration from older versions.
			if (!target) {
				target = "_self";
				dataEditableLink = url + '?target=' + target;
			}
			
			// Set link attribute with the correct and formatted data
			link.setAttribute('href', url);
			link.setAttribute('target', target);
			link.setAttribute('data-editable-link', dataEditableLink);
		}		
	},
	// Replaces first-descendant child blocks of this text block with rendering placeholders.
	// A rendering placeholder is a div.wiki-block-placeholder element.
	replaceChildBlocksWithPlaceholders: function(inOptWorkingElement) {
		var topLevelBlockGUIDs = this.mContent.computeBlockGUIDs();
		if (!topLevelBlockGUIDs || topLevelBlockGUIDs.length == 0) return;
		var selector = "";
		if (topLevelBlockGUIDs.length == 1) {
			selector = ".block[data-guid=\"" + topLevelBlockGUIDs[0] + "\"]";
		} else {
			var lastGUID = topLevelBlockGUIDs.pop();
			selector = ".block[data-guid=\"" + topLevelBlockGUIDs.join("\"], .block[data-guid=\"") + "\"], .block[data-guid=\"" + lastGUID + "\"]";
		}
		var firstLevelBlocks = $(inOptWorkingElement).select(selector), blockIdx, block, blockAttrs;
		if (!firstLevelBlocks || firstLevelBlocks.length == 0) return;
		var placeholder, _placeholder = document.createElement('div');
		_placeholder.className = 'block-placeholder';
		for (var blockIdx = 0; blockIdx < firstLevelBlocks.length; blockIdx++) {
			block = firstLevelBlocks[blockIdx];
			if (block) {
				blockAttrs = block.getDataAttributes();
				placeholder = _placeholder.cloneNode(false);
				placeholder.setAttribute('data-guid', blockAttrs.guid);
				placeholder.setAttribute('data-type', blockAttrs.type);
				placeholder.appendChild(document.createTextNode(blockAttrs.guid));
				block.parentNode.replaceChild(placeholder, block);
			}
		}
	},
	setListStyle: function(inListStyle) {
		switch (inListStyle) {
			case 'bulleted':
				document.execCommand('insertUnorderedList', false, null);
				break;
			case 'numbered':
				document.execCommand('insertOrderedList', false, null);
				break;
			case 'unformatted':
			default:
				// Toggle an existing list state if it exists.
				var isOrderedList = document.queryCommandState('insertOrderedList');
				var isUnorderedList = document.queryCommandState('insertUnorderedList');
				if (isOrderedList || isUnorderedList) {
					document.execCommand((isOrderedList ? 'insertOrderedList' : 'insertUnorderedList'), false, null);
				}
				break;
		}
		
		// 13483959
		if (browser().isIE()) {
			_globalEditorController.mEditorView.mPageView.mParentElement = $(_globalEditorController.mEditorView.mParentElement.querySelector('.page.blocks.selectable.wrapchrome.cc-view'));
		}
	},
	adjustIndentation: function(inIndentationDirection) {
		if (inIndentationDirection && $A(['indent', 'outdent']).include(inIndentationDirection)) document.execCommand(inIndentationDirection, false, null);
	},
	toolbarSettingsForKeys: function(inKeys) {
		var result = new Hash();
		var alignment = 'left';
		if (document.queryCommandState('justifyright')) alignment = 'right';
		if (document.queryCommandState('justifycenter')) alignment = 'center';
		if (document.queryCommandState('justifyfull')) alignment = 'justify';
		var keys = $A(inKeys), keyIdx, key;
		for (keyIdx = 0; keyIdx < keys.length; keyIdx++) {
			key = keys[keyIdx];
			result.set(key, {
				'enabled': true,
				'selected': (alignment == key)
			});
		}
		return result;
	},
	// Cleans up the last trailing line break in this text block.
	cleanLastTrailingLineBreak: function() {
		CC.WikiEditor.TextBlockHelpers.cleanLastTrailingLineBreak(this._editable);
	},
	// Cleans up the last trailing list item in this text block.
	cleanLastTrailingListItem: function() {
		CC.WikiEditor.TextBlockHelpers.cleanLastTrailingListItem(this._editable);
	},
	// 9272663
	handleContentEditableMouseDown: function(inEvent) {
		if (inEvent) inEvent.stopPropagation();
	},
	// Handles a paste event in a text block, migrating any pasted nodes to blocks.
	// We catch the paste event and redirect the paste to an off-screen focused element
	// where, after a delay, we process the markup by running it through a migrator.
	handleContentEditablePaste: function(inEvent) {
		var textSelectionDelegate = globalEditorTextSelectionDelegate();
		// Cache the current window selection.
		textSelectionDelegate.cacheSelection();
		// Stage something offscreen to recieve a paste event.
		globalEditorController().mCopyPasteDelegate.prepareToPaste();
		// Show a progress message.
		dialogManager().showProgressMessage("_Editor.Migration.Progress.CopyPaste".loc());
		// Give the runtime 100ms to process the paste event.
		setTimeout(function() {
			// If this text block is nested inside a table, remove any tables from the clipboard.
			// We don't allow tables inside tables.
			var elem = globalEditorController().mCopyPasteDelegate.mOffscreenElement;
			if (this.$().up('.block.table')) {
				var tables = elem.select('table'), table;
				for (var tableIdx = (tables.length - 1); tableIdx >= 0; tableIdx--) {
					table = tables[tableIdx];
					Element.insert(table, {'before': Builder.node('div', Element.textValue(table))});
					table.parentNode.removeChild(table);
				}
			}
			// Fetch the clipboard contents and migrate it.
			var markup = globalEditorController().mCopyPasteDelegate.clipboard(false);
			var migrated = globalEditorMigrationController().migrate(markup);
			// Restore the cached text selection, and process the migration result.
			textBlockDelegate().appendMigratedContentToBlockAtSelection(this.mContent, migrated, true);
			dialogManager().hideProgressMessage();
			return true;
		}.bind(this), this.mPasteHandlerDelay);
		// Return false to override default paste behavior.
		return false;
	}
});

// Define our text block toolbar.

CC.WikiEditor.TextBlockToolbar = Class.create(CC.WikiEditor.BlockToolbar, {
	mToolbarItems: [
		new CC.WikiEditor.EditorToolbarItem({
			mDisplayTitle: "_Editor.Block.Text.Toolbar.Formatting.Title".loc(),
			mTooltip: "_Editor.Block.Text.Toolbar.Formatting.Tooltip".loc(),
			mToolbarStyle: CC.WikiEditor.EDITOR_TOOLBAR_ITEM_STYLE_POPUP,
			mKey: 'formatting',
			mAction: 'setFormatting',
			mSubMenuItems: [
				new CC.WikiEditor.EditorToolbarItem({
					mDisplayTitle: "_Editor.Block.Text.Toolbar.Formatting.Paragraph.Title".loc(),
					mTooltip: "_Editor.Block.Text.Toolbar.Formatting.Paragraph.Tooltip".loc(),
					mKey: 'p'
				}),
				new CC.WikiEditor.EditorToolbarItem({
					mDisplayTitle: "_Editor.Block.Text.Toolbar.Formatting.BlockQuote.Title".loc(),
					mTooltip: "_Editor.Block.Text.Toolbar.Formatting.BlockQuote.Tooltip".loc(),
					mKey: 'blockquote'
				}),
				new CC.WikiEditor.EditorToolbarItem({
					mDisplayTitle: "_Editor.Block.Text.Toolbar.Formatting.Monospace.Title".loc(),
					mTooltip: "_Editor.Block.Text.Toolbar.Formatting.Monospace.Tooltip".loc(),
					mKey: 'pre'
				}),
				new CC.WikiEditor.EditorToolbarItem({
					mDisplayTitle: "_Editor.Block.Text.Toolbar.Formatting.LargeHeader.Title".loc(),
					mTooltip: "_Editor.Block.Text.Toolbar.Formatting.LargeHeader.Tooltip".loc(),
					mKey: 'h1'
				}),
				new CC.WikiEditor.EditorToolbarItem({
					mDisplayTitle: "_Editor.Block.Text.Toolbar.Formatting.MediumHeader.Title".loc(),
					mTooltip: "_Editor.Block.Text.Toolbar.Formatting.MediumHeader.Tooltip".loc(),
					mKey: 'h2'
				}),
				new CC.WikiEditor.EditorToolbarItem({
					mDisplayTitle: "_Editor.Block.Text.Toolbar.Formatting.SmallHeader.Title".loc(),
					mTooltip: "_Editor.Block.Text.Toolbar.Formatting.SmallHeader.Tooltip".loc(),
					mKey: 'h3'
				})
			]
		}),
		new CC.WikiEditor.EditorToolbarItem({
			mDisplayTitle: "_Editor.Block.Text.Toolbar.Style.Title".loc(),
			mTooltip: "_Editor.Block.Text.Toolbar.Style.Tooltip".loc(),
			mToolbarStyle: CC.WikiEditor.EDITOR_TOOLBAR_ITEM_STYLE_POPUP,
			mKey: 'style',
			mAction: 'setStyle',
			mSubMenuItems: [
				new CC.WikiEditor.EditorToolbarItem({
					mDisplayTitle: "_Editor.Block.Text.Toolbar.Style.Plain.Title".loc(),
					mTooltip: "_Editor.Block.Text.Toolbar.Style.Plain.Tooltip".loc(),
					mKey: 'plain'
				}),
				new CC.WikiEditor.EditorToolbarItem({
					mDisplayTitle: "_Editor.Block.Text.Toolbar.Style.Bold.Title".loc(),
					mTooltip: "_Editor.Block.Text.Toolbar.Style.Bold.Tooltip".loc(),
					mKey: 'bold'
				}),
				new CC.WikiEditor.EditorToolbarItem({
					mDisplayTitle: "_Editor.Block.Text.Toolbar.Style.Italic.Title".loc(),
					mTooltip: "_Editor.Block.Text.Toolbar.Style.Italic.Tooltip".loc(),
					mKey: 'italic'
				}),
				new CC.WikiEditor.EditorToolbarItem({
					mDisplayTitle: "_Editor.Block.Text.Toolbar.Style.Underline.Title".loc(),
					mTooltip: "_Editor.Block.Text.Toolbar.Style.Underline.Tooltip".loc(),
					mKey: 'underline'
				}),
				new CC.WikiEditor.EditorToolbarItem({
					mDisplayTitle: "_Editor.Block.Text.Toolbar.Style.Important.Title".loc(),
					mTooltip: "_Editor.Block.Text.Toolbar.Style.Important.Tooltip".loc(),
					mKey: 'important'
				}),
				new CC.WikiEditor.EditorToolbarItem({
					mDisplayTitle: "_Editor.Block.Text.Toolbar.Style.Emphasis.Title".loc(),
					mTooltip: "_Editor.Block.Text.Toolbar.Style.Emphasis.Tooltip".loc(),
					mKey: 'emphasis'
				}),
				new CC.WikiEditor.EditorToolbarItem({
					mDisplayTitle: "_Editor.Block.Text.Toolbar.Style.Highlight.Title".loc(),
					mTooltip: "_Editor.Block.Text.Toolbar.Style.Highlight.Tooltip".loc(),
					mKey: 'highlight'
				})
			]
		}),
		new CC.WikiEditor.EditorToolbarItem({
			mDisplayTitle: "_Editor.Block.Text.Toolbar.Link.Title".loc(),
			mTooltip: "_Editor.Block.Text.Toolbar.Link.Tooltip".loc(),
			mToolbarStyle: CC.WikiEditor.EDITOR_TOOLBAR_ITEM_STYLE_SELECT,
			mAction: 'addLink',
			mKey: 'link'
		}),
		new CC.WikiEditor.EditorToolbarItem({
			mDisplayTitle: "_Editor.Block.Text.Toolbar.Alignment.Title".loc(),
			mTooltip: "_Editor.Block.Text.Toolbar.Alignment.Tooltip".loc(),
			mToolbarStyle: CC.WikiEditor.EDITOR_TOOLBAR_ITEM_STYLE_SEGMENTED,
			mKey: 'alignment',
			mAction: 'setAlignment',
			mSubMenuItems: [
				new CC.WikiEditor.EditorToolbarItem({
					mDisplayTitle: "_Editor.Block.Text.Toolbar.Alignment.Left.Title".loc(),
					mTooltip: "_Editor.Block.Text.Toolbar.Alignment.Left.Tooltip".loc(),
					mKey: 'left'
				}),
				new CC.WikiEditor.EditorToolbarItem({
					mDisplayTitle: "_Editor.Block.Text.Toolbar.Alignment.Center.Title".loc(),
					mTooltip: "_Editor.Block.Text.Toolbar.Alignment.Center.Tooltip".loc(),
					mKey: 'center'
				}),
				new CC.WikiEditor.EditorToolbarItem({
					mDisplayTitle: "_Editor.Block.Text.Toolbar.Alignment.Right.Title".loc(),
					mTooltip: "_Editor.Block.Text.Toolbar.Alignment.Right.Tooltip".loc(),
					mKey: 'right'
				}),
				new CC.WikiEditor.EditorToolbarItem({
					mDisplayTitle: "_Editor.Block.Text.Toolbar.Alignment.Justify.Title".loc(),
					mTooltip: "_Editor.Block.Text.Toolbar.Alignment.Justify.Tooltip".loc(),
					mKey: 'justify'
				})
			]
		}),
		new CC.WikiEditor.EditorToolbarItem({
			mDisplayTitle: "_Editor.Block.Text.Toolbar.List.Style.Title".loc(),
			mTooltip: "_Editor.Block.Text.Toolbar.List.Style.Tooltip".loc(),
			mToolbarStyle: CC.WikiEditor.EDITOR_TOOLBAR_ITEM_STYLE_POPUP,
			mKey: 'liststyle',
			mAction: 'setListStyle',
			mSubMenuItems: [
				new CC.WikiEditor.EditorToolbarItem({
					mDisplayTitle: "_Editor.Block.Text.Toolbar.List.Style.Bulleted.Title".loc(),
					mTooltip: "_Editor.Block.Text.Toolbar.List.Style.Bulleted.Tooltip".loc(),
					mKey: 'bulleted'
				}),
				new CC.WikiEditor.EditorToolbarItem({
					mDisplayTitle: "_Editor.Block.Text.Toolbar.List.Style.Numbered.Title".loc(),
					mTooltip: "_Editor.Block.Text.Toolbar.List.Style.Numbered.Tooltip".loc(),
					mKey: 'numbered'
				}),
				new CC.WikiEditor.EditorToolbarItem({
					mDisplayTitle: "_Editor.Block.Text.Toolbar.List.Style.None.Title".loc(),
					mTooltip: "_Editor.Block.Text.Toolbar.List.Style.None.Tooltip".loc(),
					mKey: 'unformatted'
				})
			]
		}),
		new CC.WikiEditor.EditorToolbarItem({
			mDisplayTitle: "_Editor.Block.Text.Toolbar.List.Indentation.Title".loc(),
			mTooltip: "_Editor.Block.Text.Toolbar.List.Indentation.Tooltip".loc(),
			mToolbarStyle: CC.WikiEditor.EDITOR_TOOLBAR_ITEM_STYLE_SEGMENTED,
			mKey: 'indentation',
			mAction: 'adjustIndentation',
			mSubMenuItems: [
				new CC.WikiEditor.EditorToolbarItem({
					mDisplayTitle: "_Editor.Block.Text.Toolbar.List.Indentation.Indent.Title".loc(),
					mTooltip: "_Editor.Block.Text.Toolbar.List.Indentation.Indent.Tooltip".loc(),
					mKey: 'indent'
				}),
				new CC.WikiEditor.EditorToolbarItem({
					mDisplayTitle: "_Editor.Block.Text.Toolbar.List.Indentation.Outdent.Title".loc(),
					mTooltip: "_Editor.Block.Text.Toolbar.List.Indentation.Outdent.Tooltip".loc(),
					mKey: 'outdent'
				})
			]
		})
	]
});

// Register inline text styles. So that we can support theming, deliberately wait for
// the document object (and an editor toolbar) so we can sniff the inline styling of
// each built-in text style from the toolbar and duplicate it.

globalNotificationCenter().subscribe(CC.WikiEditor.NOTIFICATION_EDITOR_READY, function(inMessage, inObject, inOptExtras) {
	var toolbarDefinedStyles = $A([
		['plain', "_Editor.Block.Text.Style.Plain.Description".loc(), 'background-color color font-style font-weight text-decoration'.w()],
		['bold', "_Editor.Block.Text.Style.Bold.Description".loc(), 'font-weight'.w()],
		['italic', "_Editor.Block.Text.Style.Italic.Description".loc(), 'font-style'.w()],
		['underline', "_Editor.Block.Text.Style.Underline.Description".loc(), 'text-decoration'.w()],
		['important', "_Editor.Block.Text.Style.Important.Description".loc(), 'color font-weight'.w()],
		['emphasis', "_Editor.Block.Text.Style.Emphasis.Description".loc(), 'color font-weight'.w()],
		['highlight', "_Editor.Block.Text.Style.Highlight.Description".loc(), 'background-color color'.w()]
	]);
	var toolbarDefinedStyleIdx, style;
	for (toolbarDefinedStyleIdx = 0; toolbarDefinedStyleIdx < toolbarDefinedStyles.length; toolbarDefinedStyleIdx++) {
		style = toolbarDefinedStyles[toolbarDefinedStyleIdx];
		var stylePropertiesForDefinedStyle = style[2];
		var properties = new Hash();
		var styleMenuRoot;
		if (inObject && inObject.mToolbarParentElement) {
			styleMenuRoot = inObject.mToolbarParentElement.down('li.item.toplevel.style');
		}
		if (!styleMenuRoot) return;
		var allowedInlineStyles = CC.WikiEditor.TEXT_BLOCK_ALLOWED_INLINE_STYLES, allowedInlineStyleIdx, allowedInlineStyle;
		for (allowedInlineStyleIdx = 0; allowedInlineStyleIdx < allowedInlineStyles.length; allowedInlineStyleIdx++) {
			allowedInlineStyle = allowedInlineStyles[allowedInlineStyleIdx];
			// 10567453
			// Support multiple inline styles by only registering style properties we specifically set for each defined style.
			// When we convert between inline styles and class names, we will apply class names for all matching styles. 
			if (stylePropertiesForDefinedStyle.indexOf(allowedInlineStyle) != -1) {
				var styleMenuItem = styleMenuRoot.down('li.item.' + style[0]);
				var camelizedKey = allowedInlineStyle.camelize();
				var value = document.defaultView.getComputedStyle(styleMenuItem, null)[camelizedKey];
				if (camelizedKey == 'fontWeight') value = CC.WikiEditor.TextBlockHelpers.normalizeBoldStyleValue(value);
				properties.set(allowedInlineStyle, value);
			}
		}
		textBlockDelegate().registerInlineTextStyle(style[0], style[1], style[0], properties);
	}
});

// Register the text block with the editor.

globalEditorPluginManager().registerBlockType('text', 'CC.WikiEditor.TextBlock', {
	mBlockToolbar: 'CC.WikiEditor.TextBlockToolbar'
});
