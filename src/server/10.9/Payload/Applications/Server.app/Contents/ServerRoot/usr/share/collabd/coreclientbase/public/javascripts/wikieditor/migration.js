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

// Migration namespace.

CC.WikiEditor.Migration = CC.WikiEditor.Migration || new CC.Object();

// Tag constants.

CC.WikiEditor.Migration.SAFE_TEXT_TAGS = [
	'#text',
	'a',
	'abbr',
	'acronym',
	'address',
	'b',
	'bdo',
	'big',
	'blockquote',
	'br',
	'center',
	'code',
	'cite',
	'dd',
	'del',
	'dfn',
	'dir',
	'div',
	'dl',
	'dt',
	'em',
	'font',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'i',
	'ins',
	'kdb',
	'li',
	'link',
	'ol',
	'p',
	'pre',
	'q',
	's',
	'samp',
	'small',
	'span',
	'strike',
	'strong',
	'sub',
	'sup',
	'tt',
	'u',
	'ul',
	'var'
];
CC.WikiEditor.Migration.SAFE_TEXT_TAGS_COMMA_SEPERATED = CC.WikiEditor.Migration.SAFE_TEXT_TAGS.join(', ');
CC.WikiEditor.Migration.INLINE_TAGS = [
	'#text',
	'#comment',
	'a',
	'abbr',
	'acronym',
	'b',
	'bdo',
	'big',
	'code',
	'cite',
	'del',
	'dfn',
	'dt',
	'em',
	'i',
	'ins',
	'kdb',
	'link',
	'q',
	's',
	'samp',
	'small',
	'span',
	'strike',
	'strong',
	'sub',
	'sup',
	'tt',
	'u',
	'var'
];
CC.WikiEditor.Migration.COLLAPSABLE_TEXT_TAGS = ['code', 'div', 'pre'];

// Returns true if a node can be considered an inline node.

var isInlineNode = function(inNode) {
	return (inNode && CC.WikiEditor.Migration.INLINE_TAGS.indexOf(inNode.nodeName.toLowerCase()) >= 0);
};

// Returns true if a node is a <br> tag.

var isBrTag = function(inNode) {
	return (inNode && inNode.nodeName.toLowerCase() == 'br');
};

// A block migration transformer. Each registered transformer is responsible for migrating
// a single HTML tag (or nested set of tags).

CC.WikiEditor.Migration.Transformer = Class.create(CC.Object, {
	// Node names to match.
	mNodeNames: null,
	initialize: function(/* [options] */) {
		if (arguments.length > 0 && arguments[0]) Object.extend(this, arguments[0]);
	},
	// Transforms a DOM node. Since transformers will be invoked in order (and complex transformers
	// e.g. tables handle their own sub-tags), it is expected that a transformer return a single JSON
	// representation of a block can later be added to the page. If your result is a container block,
	// it is assumed that any child blocks are part of that JSON representation (in the same format)
	// in a _childBlocks array. If your container block does complex layout (e.g. a table block) it is
	// also expected that any layout-tracking properties of the parent block are initialized when the
	// result is returned. Alternative return values are false if your transformer failed to handle
	// the node (where it will be sandboxed instead) or true if the your transformer handled the node
	// with no output.
	transformNode: function(inNode) { /* Interface */ }
});

// Migration transformer registry, handling all registered block transformers.

var MigrationTransformerRegistry = Class.createWithSharedInstance('globalEditorMigrationTransformerRegistry');
MigrationTransformerRegistry.prototype = {
	mRegisteredTransformers: new Hash(),
	// Lookup tables for transformers. Keeps things fast. The node name map is just a set of keys/values
	// where the key is a string node name, and the value a pointer to the transformer instance.
	mTransformerForNodeNameMap: new Hash(),
	initialize: function() {},
	// Register a new transformer. Expects a unique transformer identifier and either a string
	// referencing the constructor for your transformer, a pointer to your transformer constructor
	// or an actual instance of your transformer. If a string or pointer is passed, we will just
	// instantiate a transformer.
	registerTransformer: function(inTransformerIdentfier, inTransformerClass) {
		if (this._isTransformerRegistered(inTransformerIdentfier)) logger().warn("Migration transformer (%@) is already registered and will be overridden", inTransformerIdentfier);
		var konstructor = (CC.typeOf(inTransformerClass) === CC.T_STRING) ? CC.objectForPropertyPath(inTransformerClass) : inTransformerClass;
		var instance = (CC.typeOf(konstructor, CC.T_OBJECT) ? konstructor : new konstructor());
		this.mRegisteredTransformers.set(inTransformerIdentfier, instance);
		// Set this transformer for matching node names.
		var nodeNames = (instance.mNodeNames || new Array()), nodeNameIdx, nodeName;
		for (nodeNameIdx = 0; nodeNameIdx < nodeNames.length; nodeNameIdx++) {
			nodeName = nodeNames[nodeNameIdx];
			this.mTransformerForNodeNameMap.set(nodeName, instance);
		}
	},
	// Removes a registered transformer for a given identifier, if it exists.
	unregisterTransformer: function(inTransformerIdentifer) {
		if (!this._isTransformerRegistered(inTransformerIdentifer)) return false;
		this.mRegisteredTransformers.unset(inTransformerIdentifer);
	},
	// Returns an array of identifiers for all registered transformers.
	registeredTransformers: function() {
		return this.mRegisteredTransformers.keys();
	},
	// Returns the registered transformers for a given node name.
	transformerForNodeName: function(inNodeName) {
		return this.mTransformerForNodeNameMap.get(inNodeName);
	},
	_isTransformerRegistered: function(inTransformerIdentifer) {
		if (!inTransformerIdentifer) return false;
		return this.mRegisteredTransformers.get(inTransformerIdentifer) !== undefined;
	}
};

// Helper functions for migration.

CC.WikiEditor.MigrationHelpers = {
	// Returns an object representing a new block.
	$block: function(inBlockType, inOptExtendedAttributes /*, inOptOptions */) {
		if (!inBlockType) return undefined;
		var block = {
			'guid': (new CC.GuidBuilder()).toString(),
			'blockType': inBlockType,
			'extendedAttributes': (inOptExtendedAttributes || {})
		};
		if (arguments && arguments.length > 2) Object.extend(block, arguments[2]);
		return block;
	},
	// Returns a placeholder string for a block with given GUID and block type.
	$placeholder: function(inBlockGUID, inBlockType) {
		if (!inBlockGUID || !inBlockType) return undefined;
		return "<div class=\"block-placeholder\" data-guid=\"%@\" data-type=\"%@\">%@</div>".fmt(inBlockGUID, inBlockType, inBlockGUID);
	}
};

// Individual transformers.

CC.WikiEditor.Migration.TextTransformer = Class.create(CC.WikiEditor.Migration.Transformer, {
	mNodeNames: CC.WikiEditor.Migration.SAFE_TEXT_TAGS,
	// Transforms a block of text into a text block with optional child blocks.
	transformNode: function(inNode, inOptDoNotSandboxUnsafeNodes) {
		if (!inNode) return true;
		// If there are no child nodes, or job is easy.
		if (inNode.nodeType == 3 && !inNode.nodeValue.isWhitespace()) {
			return CC.WikiEditor.MigrationHelpers.$block('text', {'content': inNode.nodeValue});
		}
		// Initialize some properties for the new text block.
		var blockGUIDs = [];
		var _childBlocks = [];
		// Text blocks are freeform content blocks that contain content-driven child nodes, and optionally
		// contain other non-text child blocks. Child blocks are positioned using block placeholder elements.
		// Start migrating this text block by iterating through each of the child nodes pushing into a buffer
		// array until we have no child nodes left, or hit a unrecognized node. Unrecognized nodes may either
		// be transformed into blocks themselves (depending on whether we have a matching transformer or not)
		// or sandboxed in place inside a sandbox block.
		var childNodes = $A(inNode.childNodes);
		var childNodesLength = childNodes.length, childNodeIdx, childNode, childNodeName, allChildren, safeChildren;
		var buffer = [], bufferedChildNode, bufferedChildNodeType, didBufferChildNode, shouldMigrateOrSandboxChildNode;
		var migratedChildNodeResult, migratedChildNodeGUID, migratedChildNodeBlockType, migratedChildNodeExtendedAttributes;
		var contentHTMLConcatenation = [], contentHTML;
		for (childNodeIdx = 0; childNodeIdx < childNodesLength; childNodeIdx++) {
			childNode = childNodes[childNodeIdx];
			if (childNode == undefined) continue;
			childNodeName = childNode.nodeName.toLowerCase();
			didBufferChildNode = shouldMigrateOrSandboxChildNode = false;
			// Sandbox if this child node is considered unsafe. A node is unsafe if the node itself is unsafe
			// or a parent of an unsafe child node.
			if (!inOptDoNotSandboxUnsafeNodes && childNode.nodeType != 3) {
				if (!CC.WikiEditor.Migration.SAFE_TEXT_TAGS.include(childNodeName)) shouldMigrateOrSandboxChildNode = true;
				if (!shouldMigrateOrSandboxChildNode) {
					if (childNode.querySelectorAll) {
						allChildren = childNode.querySelectorAll('*');
						safeChildren = childNode.querySelectorAll(CC.WikiEditor.Migration.SAFE_TEXT_TAGS_COMMA_SEPERATED);
						if (allChildren.length != safeChildren.length) shouldMigrateOrSandboxChildNode = true;
					}
				}
				if (shouldMigrateOrSandboxChildNode) logger().debug("Sandboxing because node is unsafe or contains an unsafe child node %o", childNode);
			}
			// If the child node is a safe text tag, a <br> tag or a non line-breaking text node, push it onto the buffer.
			if (!shouldMigrateOrSandboxChildNode && (isBrTag(childNode) || (CC.WikiEditor.Migration.SAFE_TEXT_TAGS.indexOf(childNodeName) > -1) || (childNode.nodeType == 3 && !(childNode.nodeValue || "").match(/^[\r\n]+$/)))) {
				buffer.push(childNode);
				didBufferChildNode = true;
				if (childNodeIdx < (childNodes.length - 1)) continue;
			}
			// If we didn't push the childNode onto the buffer, we just hit an unrecognized node. Attempt to migrate
			// the node with another registered transformer, otherwise sandbox the node.
			if (!didBufferChildNode || shouldMigrateOrSandboxChildNode) {
				migratedChildNodeResult = globalEditorMigrationController().migrateNode(childNode);
				// If we successfully migrated to another block, push a placeholder onto the buffer and update the
				// blockGUIDs and _childBlocks properties we're computing.
				if (migratedChildNodeResult && (migratedChildNodeResult != true)) {
					migratedChildNodeGUID = migratedChildNodeResult['guid'];
					migratedChildNodeBlockType = migratedChildNodeResult['blockType'];
					// Did we just migrate into a nested text block?
					if (migratedChildNodeBlockType == 'text') {
						migratedChildNodeExtendedAttributes = (migratedChildNodeResult.extendedAttributes || {});
						buffer.push(migratedChildNodeExtendedAttributes.content || "");
						if (migratedChildNodeExtendedAttributes.blockGUIDs) blockGUIDs = blockGUIDs.concat(migratedChildNodeExtendedAttributes.blockGUIDs);
						if (migratedChildNodeResult._childBlocks) _childBlocks = _childBlocks.concat(migratedChildNodeResult._childBlocks);
					} else {
						buffer.push(CC.WikiEditor.MigrationHelpers.$placeholder(migratedChildNodeGUID, migratedChildNodeBlockType));
						blockGUIDs.push(migratedChildNodeGUID);
						_childBlocks.push(migratedChildNodeResult);
					}
				}
			}
			// If we have exhausted the list of child nodes, flush the buffer and build a concatenated content string
			// for the text block we'll return.
			if (childNodeIdx == (childNodesLength - 1) && (buffer.length > 0)) {
				for (var jdx = 0; jdx < buffer.length; jdx++) {
					bufferedChildNode = buffer[jdx];
					if (Object.isString(bufferedChildNode)) {
						contentHTMLConcatenation.push(bufferedChildNode);
					} else if (bufferedChildNode.nodeType == 3) {
						contentHTMLConcatenation.push(bufferedChildNode.nodeValue.escapeHTML());
					} else if (bufferedChildNode.nodeType == 1) {
						contentHTMLConcatenation.push(Element.outerHtmlValue(bufferedChildNode));
					} else {
						logger().debug("Unrecognized child node encountered when building text block contents %o", bufferedChildNode);
					}
				}
				contentHTML = contentHTMLConcatenation.join('');
			}
		}
		return CC.WikiEditor.MigrationHelpers.$block('text', {'content': (contentHTML || ""), 'blockGUIDs': blockGUIDs}, {'_childBlocks': _childBlocks});
	}
});

// Migrates tables.

CC.WikiEditor.Migration.TableTransformer = Class.create(CC.WikiEditor.Migration.Transformer, {
	mNodeNames: ['table'],
	transformNode: function(inNode) {
		// If the user has been prompted to use the wiki table editor before, and they
		// declined for this table, migrate the table into a sandbox. Otherwise, migrate
		// the table and its contents to blocks.
		if (inNode.className && inNode.className.match(/__doNotUseTableEditor/)) {
			var transformer = globalEditorMigrationTransformerRegistry().transformerForNodeName('#sandbox');
			if (transformer) return transformer.transformNode(inNode);
		}
		// If this is a thumbnail masquerading as a table, migrate the child image to
		// a sandbox and ignore any wrapper chrome.
		else if (inNode.className && inNode.className.match(/thumbnail/)) {
			var img = $(inNode).down('img');
			if (img) {
				var transformer = globalEditorMigrationTransformerRegistry().transformerForNodeName('#sandbox');
				if (transformer) return transformer.transformNode(img);
			}
			return true;
		}
		else {
			var table = Element.extend(inNode);
			// Get the number of table rows.
			var rows = table.select('tr');
			if (!rows || !rows.length > 0) return true;
			var rowCount = rows.length;
			// Compensate for any rows where a rowspan is defined.
			var row, rowspan;
			for (var rowIdx = 0; rowIdx < rowCount; rowIdx++) {
				row = rows[rowIdx];
				rowspan = parseInt(row.getAttribute('rowspan'));
				if (!isNaN(rowspan)) rowCount += Math.max(rowspan - 1, 0);
			}
			// Get the number of table columns.
			var firstRow = table.down('tr');
			if (!firstRow) return true;
			var firstRowCells = firstRow.select('th, td');
			var firstRowCellsLength = firstRowCells.length;
			var columnCount = firstRowCellsLength;
			// Compensate for any table cells where a colspan value is defined.
			var cell, colspan;
			for (var cellIdx = 0; cellIdx < firstRowCellsLength; cellIdx++) {
				cell = firstRowCells[cellIdx];
				colspan = parseInt(cell.getAttribute('colspan'));
				if (!isNaN(colspan)) columnCount += Math.max(colspan - 1, 0);
			}
			var size = {'width': columnCount, 'height': rowCount};
			logger().debug("Migrating table with %o columns and %o rows", columnCount, rowCount);
			// Determine if the table has a heading row/column enabled.
			var hasHeadingRow = (table.down('thead') != undefined || table.down('tbody tr th') != undefined);
			var firstRow = table.down('tr');
			var secondRow = (firstRow && firstRow.next('tr'));
			var hasHeadingColumn = (secondRow && secondRow.down('th') != undefined);
			var headerPreferences = [hasHeadingRow, hasHeadingColumn];
			// Initialize a reverse layout and blockGUIDs property for the new table block.
			var reverseLayout = {}, blockGUIDs = [], _childBlocks = [];
			var tableCellTransformer = globalEditorMigrationTransformerRegistry().transformerForNodeName('td');
			// Track the skip cells for a row. A skip cell is a cell that is missing
			// from the original table node (because of a colspan/rowspan attribute).
			// Skip cells are migrated to empty cells in the new table block.
			var skipCells = new Array(size.width * size.height);
			// Now, iterate over every table cell migrating any cell content into child
			// blocks of this container.
			var rowIndex = 0, columnIndex = 0;
			var cells = table.select('th, td');
			for (var cellIdx = 0; cellIdx < cells.length; cellIdx++) {
				cell = cells[cellIdx];
				colspan = parseInt(cell.getAttribute('colspan'));
				rowspan = parseInt(cell.getAttribute('rowspan'));
				colspan = isNaN(colspan) ? 1 : Math.max(colspan, 1);
				rowspan = isNaN(rowspan) ? 1 : Math.max(rowspan, 1);
				// Update the skip cells for this index.
				var arrayStartIdx = (columnIndex + (rowIndex * size.width));
				if (colspan > 1) {
					for (var arrayIdx = arrayStartIdx + 1; arrayIdx <= (arrayStartIdx + Math.min(size.width - columnIndex, colspan - 1)); arrayIdx++) {
						if (arrayIdx >= skipCells.length) break;
						skipCells[arrayIdx] = true;
					}
				}
				if (rowspan > 1) {
					for (var arrayIdx = (arrayStartIdx + size.width); arrayIdx <= (arrayStartIdx + (size.width * (rowspan - 1))); arrayIdx += size.width) {
						if (arrayIdx >= skipCells.length) break;
						skipCells[arrayIdx] = true;
					}
				}
				// If we're about to write into a skip cell, find the next non-skip cell.
				var skipCellIdx = columnIndex + (size.width * rowIndex);
				if (skipCells[skipCellIdx]) {
					while (skipCellIdx < skipCells.length && skipCells[skipCellIdx]) {
						skipCellIdx += 1;
					}
					rowIndex = Math.floor(skipCellIdx / size.width);
					columnIndex = skipCellIdx % size.width;
				}
				// Migrate the table cell, updating the reverse layout of the table.
				var migratedTableCell = tableCellTransformer.transformNode(cell), migratedTableCellBlockGUID;
				if (migratedTableCell) {
					migratedTableCellBlockGUID = migratedTableCell['guid'];
					if (migratedTableCellBlockGUID) {
						reverseLayout[migratedTableCellBlockGUID] = [rowIndex, columnIndex];
						blockGUIDs.push(migratedTableCellBlockGUID);
						_childBlocks.push(migratedTableCell);
					}
				}
				// Update the row and column index, wrapping to the next row if needed.
				columnIndex += 1;
				if (columnIndex == size.width) {
					columnIndex = 0;
					rowIndex += 1;
				}	
			}
			return CC.WikiEditor.MigrationHelpers.$block('table',
				{'size': size, 'headerPreferences': headerPreferences, 'reverseLayout': reverseLayout, 'blockGUIDs': blockGUIDs},
				{'_childBlocks': _childBlocks});
		}
	}
});

// Transforms an individual table cell. Basically, a mini-migration inside an
// optional block container. Called for individual table cells on migrated
// content, and incomplete copy/paste snippets where the browser fails to copy
// the containing table with its content.

CC.WikiEditor.Migration.TableCellTransformer = Class.create(CC.WikiEditor.Migration.Transformer, {
	mNodeNames: ['th', 'td'],
	transformNode: function(inNode) {
		var transformer = globalEditorMigrationTransformerRegistry().transformerForNodeName("#text");
		return transformer.transformNode(inNode, true);
	}
});

// Migrates images, media and attachments.

CC.WikiEditor.Migration.MediaTransformer = Class.create(CC.WikiEditor.Migration.Transformer, {
	mNodeNames: ['img'],
	transformNode: function(inNode) {
		if (!inNode) return true;
		var img = Element.extend(inNode);
		if (!img.src) return true;
		// 10817763
		if (img.src.match(/^file:/i) || img.src.match(/^webkit-fake-url:/i)) return true;
		// Catch unwanted /collaboration/images/blank.gif images.
		if (img.src == "/collaboration/images/blank.gif") return true;
		var longdesc = (img.getAttribute('longdesc') || "");
		var src = (img.getAttribute('src') || "");
		var pattern = /\/([\w-]+)#filename:(.*)(?:(?:#attachment:)|(?:#image:))([\w-]+)/;
		// The migrated file guids are stashed in the longdesc attribute.
		var matches = longdesc.match(pattern);
		// If the longdesc attribute is missing the file info, it might be in the src attrinute.
		if (!matches || matches.length != 4) {
			matches = src.match(pattern);
			if (!matches || matches.length != 4) return undefined;
		}
		// 8761062
		// Filenames are url-encoded and spaces replaced with "+" by CGI.encode.
		var fileName = decodeURIComponent(matches[2] || "").gsub(/\+/, " ");
		var extendedAttributes = {
			'fileName': fileName,
			'fileGUID': matches[3],
			'fileDataGUID': matches[1]
		}
		// Any thumbnail/posterimg info is stashed in the src attribute.
		matches = src.match(pattern);
		if (matches && matches.length != 4) {
			extendedAttributes['thumbnailFileName'] = matches[2],
			extendedAttributes['thumbnailFileGUID'] = matches[3],
			extendedAttributes['thumbnailFileDataGUID'] = matches[1];
		}
		// Stash any legacy metadata away for safe keeping in case we need to recover later.
		extendedAttributes['legacyMetadata'] = {
			'src': img.getAttribute('src'),
			'longdesc': img.getAttribute('longdesc'),
			'name': img.getAttribute('name'),
			'title': img.getAttribute('title'),
			'alt': img.getAttribute('alt'),
			'role': img.getAttribute('role'),
			'className': img.getAttribute('className')
		};
		// Finally, add the block.
		var isAttachment = (img.className && img.className.match(/attachment_handle_img/));
		var isMovie = (img.className && img.className.match(/posterimg/));
		return CC.WikiEditor.MigrationHelpers.$block((isAttachment ? 'attachment' : (isMovie ? 'media' : 'image')), extendedAttributes);
	}
});

// Internal transformer ignoring unwanted node types in a migration.

CC.WikiEditor.Migration.EmptyTransformer = Class.create(CC.WikiEditor.Migration.Transformer, {
	mNodeNames: ['#comment', 'link', 'meta', 'noscript', 'style', 'script', 'title'],
	transformNode: function(inNode) {
		// Deliberately do nothing.
		logger().debug("Node will be ignored in migration (%o)", inNode);
		return true;
	}
});

// Internal transformer for migrating to a sandbox.

CC.WikiEditor.Migration.SandboxTransformer = Class.create(CC.WikiEditor.Migration.Transformer, {
	mNodeNames: ['#sandbox'],
	transformNode: function(inNode) {
		var outerHTML = Element.outerHtmlValue(inNode), sandboxBlock;
		if (outerHTML) {
			sandboxBlock = CC.WikiEditor.MigrationHelpers.$block('sandbox', {'markup': outerHTML});
		}
		return sandboxBlock;
	}
});

// Register a bunch of transformers.

globalEditorMigrationTransformerRegistry().registerTransformer('text', new CC.WikiEditor.Migration.TextTransformer());
globalEditorMigrationTransformerRegistry().registerTransformer('table', new CC.WikiEditor.Migration.TableTransformer());
globalEditorMigrationTransformerRegistry().registerTransformer('table-cell', new CC.WikiEditor.Migration.TableCellTransformer());
globalEditorMigrationTransformerRegistry().registerTransformer('media', new CC.WikiEditor.Migration.MediaTransformer());
globalEditorMigrationTransformerRegistry().registerTransformer('empty', new CC.WikiEditor.Migration.EmptyTransformer());
globalEditorMigrationTransformerRegistry().registerTransformer('sandbox', new CC.WikiEditor.Migration.SandboxTransformer());

// Migrator, doing the heavy lifting of migrating a page (or pasted markup) to a set of blocks.
// It is expected that an editor instance is already initialized (since we require an editor
// store into which the blocks can be inserted and from which they can be persisted).

CC.WikiEditor.Migration.GlobalMigrationInstance = Class.createWithSharedInstance('globalEditorMigrationController');
CC.WikiEditor.Migration.GlobalMigrationInstance.prototype = {
	initialize: function() {},
	// Do our very best to split a supplied string of markup into a tree of blocks, by appending
	// it to the document, walking through the DOM node structure and running block transformers
	// where possible. Used when migrating both migrated page sandboxes and pasted content. Expects
	// a markup argument.
	migrate: function(inMarkup, inOptRestoreSelection) {
		if (!inMarkup || CC.typeOf(inMarkup, CC.T_STRING) && inMarkup.isWhitespace()) {
			logger().debug("Nothing to migrate (%@)".fmt(inMarkup));
			return undefined;
		}
		// First render the original content offscreen.
		if (this.mOffscreenElement) Element.remove(this.mOffscreenElement);
		this.mOffscreenElement = Builder.node('div', {id: 'wikieditor_migration', style: 'display: none;'});
		this.mOffscreenElement.innerHTML = inMarkup;
		document.body.appendChild(this.mOffscreenElement);
		// Clean the markup before we start running transformers.
		this.prepareForMigration(this.mOffscreenElement);
		// Migrate starting with a root text block and return.
		var textTransformer = globalEditorMigrationTransformerRegistry().transformerForNodeName("#text", true);
		return textTransformer.transformNode(this.mOffscreenElement);
	},
	// Migrates a child node by running it through an applicable transformer. Falls back to
	// sandboxing a node, where the node type is unknown (e.g. script tags).
	migrateNode: function(inRootNode) {
		var rootNodeName = inRootNode.nodeName.toLowerCase();
		// Do we have a transformer we can apply to this node?
		var transformer = globalEditorMigrationTransformerRegistry().transformerForNodeName(rootNodeName);
		var successful; 
		if (transformer) {
			logger().debug("Applying node transformer %o %o %o", transformer, rootNodeName, inRootNode);
			successful = transformer.transformNode(inRootNode);
		}
		if (!transformer || !successful) {
			logger().debug("Sandboxing node (%o) in migration", inRootNode);
			var transformer = globalEditorMigrationTransformerRegistry().transformerForNodeName('#sandbox');
			if (transformer) return transformer.transformNode(inRootNode);
		}
		return successful;
	},
	// Normalizes an element for migration.
	prepareForMigration: function(inElement) {
		var nodes, node, nodeIdx;
		// Remove any unnecessary div#wiki_entry tags, promoting children. The div#wiki_entry
		// element was supposed to completely wrap editable content, but a big sample of pages
		// are split inside and outside this tag. So, remove it.
		nodes = $$('#wikieditor_migration .wiki_entry');
		for (nodeIdx = 0; nodeIdx < nodes.length; nodeIdx++) {
			promoteElementChildren(nodes[nodeIdx]);
		}
		// Promote any table wrapper divs.
		nodes = inElement.select('.__tableContainer');
		for (nodeIdx = 0; nodeIdx < nodes.length; nodeIdx++) {
			promoteElementChildren(nodes[nodeIdx]);
		}
		// Remove any table drag handles.
		nodes = inElement.select('.__tableEditorDragHandle');
		for (nodeIdx = 0; nodeIdx < nodes.length; nodeIdx++) {
			Element.remove(nodes[nodeIdx]);
		}
		// Remove any meaningless tags.
		removeMeaninglessMarkup(inElement);
		// Fix up successive <pre> tags, promoting and merging child nodes together.
		nodes = inElement.select('pre');
		for (nodeIdx = 0; nodeIdx < nodes.length; nodeIdx++) {
			node = nodes[nodeIdx];
			// Is the previous sibling a <pre>?
			var previousNode = node.previousSibling;
			// Nuke any extra whitespace between <pre> tags.
			var cleanupStack = [];
			while (previousNode && isWhitespaceNode(previousNode)) {
				cleanupStack.push(previousNode);
				previousNode = previousNode.previousSibling;
			}
			if (previousNode && previousNode.nodeName.toLowerCase() == 'pre') {
				// Add a line break to maintain appearance.
				previousNode.insertBefore(document.createTextNode('\n'), null);
				// Migrate any children accross.
				while (node.childNodes.length > 0) {
					var currentChild = node.firstChild;
					node.removeChild(currentChild);
					previousNode.insertBefore(currentChild, null);
				}
				node.parentNode.removeChild(node);
				// Cleanup any extra whitespace we found.
				for (var idx = 0; idx < cleanupStack.length; idx++) {
					cleanupStack[idx].parentNode.removeChild(cleanupStack[idx]);
				}
			}
		}
		// 8321979
		// Combine successive <div> tags that only contain text/br nodes.
		nodes = inElement.getElementsByTagName('div');
		var workingNode, workingNodeMinusOne;
		if (nodes.length > 1) {
			for (nodeIdx = (nodes.length - 1); nodeIdx > 0; nodeIdx--) {
				workingNode = nodes.item(nodeIdx);
				workingNodeMinusOne = nodes.item(nodeIdx - 1);
				if (workingNode.previousSibling != workingNodeMinusOne) continue;
				if (!workingNode.hasChildNodes()) continue;
				if (onlyTextOrLineBreaks(workingNode) && onlyTextOrLineBreaks(workingNodeMinusOne)) {
					if (workingNodeMinusOne.hasChildNodes()) {
						workingNodeMinusOne.appendChild(document.createElement('br'));
					}
					while (workingNode.hasChildNodes()) {
						var child = workingNode.firstChild;
						workingNode.removeChild(child);
						workingNodeMinusOne.insertBefore(child, null);
					}
					workingNode.parentNode.removeChild(workingNode);
				}
			}
		}
		// 8589118
		// Promote any images unnecessarily wrapped in formatting tags.
		nodes = inElement.select(CC.FORMATTING_TAGS.join(', '));
		var promotable = true, childNodes, childNode, childNodeName, buffer;
		for (nodeIdx = (nodes.length - 1); nodeIdx >= 0; nodeIdx--) {
			node = nodes[nodeIdx];
			if (node.className || node.id) continue;
			// Does the node only contain whitespace, <img> and <br> tags?
			buffer = new Array();
			childNodes = node.childNodes;
			for (childIdx = 0; childIdx < childNodes.length; childIdx++) {
				childNode = childNodes.item(childIdx);
				childNodeName = childNode.nodeName.toLowerCase();
				if (!isWhitespaceNode(childNode) && childNodeName != 'br' && childNodeName != 'img') {
					promotable = false;
					break;
				}
				// Buffer all disposable nodes.
				if (childNodeName != 'img') buffer.push(childNode);
			}
			if (promotable) {
				var bufferIdx, buffered;
				for (bufferIdx = (buffer.length - 1); bufferIdx >= 0; bufferIdx--) {
					buffered = buffer[bufferIdx];
					if (buffered.parentNode) buffered.parentNode.removeChild(buffered);
				}
				promoteElementChildren(node);
			}
		}
		// Fix inline text styles.
		var classNames = ['custom_backcolor_highlight', 'custom_forecolor_important', 'custom_forecolor_emphasis'], classNameIdx, className;
		for (classNameIdx = 0; classNameIdx < classNames.length; classNameIdx++) {
			className = classNames[classNameIdx];
			nodes = inElement.select('.' + className);
			for (nodeIdx = 0; nodeIdx < nodes.length; nodeIdx++) {
				node = nodes[nodeIdx];
				node.addClassName(className.match(/(custom_backcolor_|custom_forecolor_)([\w]+)/)[2]);
				node.removeClassName(className);
			}
		}
		// Remove any non-span inline style attributes.
		nodes = inElement.select('*[style]');
		for (nodeIdx = (nodes.length - 1); nodeIdx >= 0; nodeIdx--) {
			node = nodes[nodeIdx];
			if (node && (node.nodeType == 1) && (node.nodeName.toLowerCase() != 'span')) node.removeAttribute('style');
		}
		// Remove any font tags.
		nodes = inElement.select('font');
		for (nodeIdx = (nodes.length - 1); nodeIdx >= 0; nodeIdx--) {
			node = nodes[nodeIdx];
			promoteElementChildren(node);
		}
		// Strip any editor-specific chrome (8829823 && 8450720 && 8927746).
		nodes = $(inElement).select('.chrome, .block-placeholder, .block-spacer');
		for (nodeIdx = (nodes.length - 1); nodeIdx >= 0; nodeIdx--) {
			node = nodes[nodeIdx];
			if (node && node.parentNode) node.parentNode.removeChild(node);
		}
		nodes = inElement.getElementsByClassName('wrapchrome');
		for (nodeIdx = (nodes.length - 1); nodeIdx >= 0; nodeIdx--) {
			node = nodes.item(nodeIdx);
			if (node) promoteElementChildren(node);
		}
	}
};
