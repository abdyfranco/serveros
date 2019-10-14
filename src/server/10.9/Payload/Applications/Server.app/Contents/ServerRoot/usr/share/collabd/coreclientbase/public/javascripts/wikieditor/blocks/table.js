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

// Table block delegate.

var TableBlockDelegate = Class.createWithSharedInstance('tableBlockDelegate');
TableBlockDelegate.prototype = {
	// The active table block tracked by this delegate.
	mTableBlock: null,
	initialize: function() {
		if (document && document.body) return this._initialize();
	},
	_initialize: function() {
		// Initialize an inline table popup.
		this.mInlineTablePopup = new CC.WikiEditor.InlineTablePopup();
		this.mInlineTablePopup._render();
		document.body.appendChild(this.mInlineTablePopup.$());
		// Initialize a table block settings dialog.
		this.mTextBlockDebugDialog = dialogManager().drawDialog('table_block_settings_dialog', [
			{label: '', contents: '<label for="table_block_settings_alternating" class="checkbox"><input type="checkbox" id="table_block_settings_alternating", checked="checked"/> %@</label>'.fmt("_Editor.Block.Table.Dialog.Settings.Alternating.Label".loc())},
			{label: '', contents: '<label for="table_block_settings_gridlines" class="checkbox"><input type="checkbox" id="table_block_settings_gridlines", checked="checked"/> %@</label>'.fmt("_Editor.Block.Table.Dialog.Settings.Gridlines.Label".loc())}
		], "_Editor.Block.Table.Dialog.Settings.OK".loc(), undefined, "_Editor.Block.Table.Dialog.Settings.Title".loc(), "_Editor.Block.Table.Dialog.Settings.Cancel".loc());
	},
	addBlock: function() {
		// Restrict tables inside tables.
		if (globalEditorController().mActiveBlock.mViewInstance.$().up('.block.table')) return false;
		editorToolbarDelegate().addBlock('table', {}, true);
	},
	// Configures and shows the shared inline table popup for given column or row header.
	// Expects an anchor element (which should be the leading table cell of the row or
	// column for which the popup is being configured).
	configureAndShowTablePopup: function(inAnchorElement, inTableBlock) {
		if (!inAnchorElement) return console.error("Cannot configure inline table popup for an undefined anchor element (%@).".fmt(inAnchorElement));
		if (!inTableBlock || inTableBlock.getRecordPropertyForPath('blockType') != 'table') return console.error("Cannot configure inline table popup for an unknown block (%@).".fmt(inTableBlock));
		// First hide the popup if we're already showing it.
		if (this.mInlineTablePopup.mShowing) this.mInlineTablePopup.hide();
		// Find the closest containing td element.
		var anchor = (inAnchorElement.hasClassName('header') ? inAnchorElement : inAnchorElement.up('header'));
		if (!anchor) return console.error("Invalid anchor for table popup. Must be a row or column header.");
		// Track the new anchor for callbacks and block for callbacks.
		this.mAnchorElement = anchor;
		this.mTableBlock = inTableBlock;
		// Show the popup over the row or column heading.
		var isRow = anchor.hasClassName('row');
		var menu = anchor.down('.menu');
		this.mInlineTablePopup.preparePopup(menu, isRow);
		this.mInlineTablePopup.show(menu);
	},
	// Configures and shows the table settings dialog.
	configureAndShowTableSettingsDialog: function(inOptGridlinesEnabled, inOptAlternatingRows, inOptCallback) {
		$('table_block_settings_gridlines').checked = (inOptGridlinesEnabled || false);
		$('table_block_settings_alternating').checked = (inOptAlternatingRows || false);
		var callback = function() {
			var gridlines = $('table_block_settings_gridlines').checked;
			var alternating = $('table_block_settings_alternating').checked;
			if (inOptCallback) inOptCallback(gridlines, alternating);
		}
		dialogManager().show('table_block_settings_dialog', undefined, callback.bind(this));
	},
	// Hash of allowed table styles. Each style is a tuple of identifer and extra class names
	// that will be associated with the table when that style is applied. For simplicity, table
	// styles are exclusively specified in CSS.
	mRegisteredStyles: new Hash(),
	// Registers a new inline table style.
	registerTableStyle: function(inTableStyleIdentifer, inOptTableStyleDescription, inOptExtraClassNames) {
		if (!inTableStyleIdentifer) return logger().warn("Cannot register a table style without an identifer (%@)".fmt(inTableStyleIdentifer));
		if (this.mRegisteredStyles.get(inTableStyleIdentifer)) logger().warn("Table style (%@) is already registered and will be overwritten");
		var identifer = inTableStyleIdentifer;
		// Build some sort of description if we didn't get one.
		var displayName = (inOptTableStyleDescription || "%@ style".fmt(identifer));
		// The class names for a table style always include at least the table style identifier.
		var classNames = [inTableStyleIdentifer].concat((inOptExtraClassNames || []));
		this.mRegisteredStyles.set(identifer, [displayName, classNames]);
		return true;
	},
	// Unregisters a table style if it exists.
	unregisterTableStyle: function(inTableStyleIdentifer) {
		if (!inTableStyleIdentifer) return false;
		return this.mRegisteredStyles.unset(inTableStyleIdentifer);
	}
};

// Inline table row/column popup menu. Managed by the global table block delegate.

CC.WikiEditor.InlineTablePopup = Class.create(CC.WikiEditor.EditorToolbarPopupMenu, {
	mIdentifer: "table_block_inline_popup",
	render: function() {
		var elem = Builder.node('ul', {className: 'items'}, [
			Builder.node('li', {id: 'table_block_inline_popup_headercolumn', className: 'item headercolumn appliescolumn'}, [
				Builder.node('span', {title: "_Editor.Block.Table.Popup.Column.Header.Tooltip".loc()}, "_Editor.Block.Table.Popup.Column.Header.Title".loc())
			]),
			Builder.node('li', {id: 'table_block_inline_popup_sortasc', className: 'item sortasc appliescolumn'}, [
				Builder.node('span', {title: "_Editor.Block.Table.Popup.Column.Sort.Ascending.Tooltip".loc()}, "_Editor.Block.Table.Popup.Column.Sort.Ascending.Title".loc())
			]),
			Builder.node('li', {id: 'table_block_inline_popup_sortdesc', className: 'item sortdesc appliescolumn'}, [
				Builder.node('span', {title: "_Editor.Block.Table.Popup.Column.Sort.Descending.Tooltip".loc()}, "_Editor.Block.Table.Popup.Column.Sort.Descending.Title".loc())
			]),
			Builder.node('li', {id: 'table_block_inline_popup_addcolumnbefore', className: 'item addcolumnbefore appliescolumn'}, [
				Builder.node('span', {title: "_Editor.Block.Table.Popup.Column.Add.Before.Tooltip".loc()}, "_Editor.Block.Table.Popup.Column.Add.Before.Title".loc())
			]),
			Builder.node('li', {id: 'table_block_inline_popup_addcolumnafter', className: 'item addcolumnafter appliescolumn'}, [
				Builder.node('span', {title: "_Editor.Block.Table.Popup.Column.Add.After.Tooltip".loc()}, "_Editor.Block.Table.Popup.Column.Add.After.Title".loc())
			]),
			Builder.node('li', {id: 'table_block_inline_popup_deletecolumn', className: 'item deletecolumn appliescolumn'}, [
				Builder.node('span', {title: "_Editor.Block.Table.Popup.Column.Delete.Tooltip".loc()}, "_Editor.Block.Table.Popup.Column.Delete.Title".loc())
			]),
			Builder.node('li', {id: 'table_block_inline_popup_headerrow', className: 'item headerrow appliesrow'}, [
				Builder.node('span', {title: "_Editor.Block.Table.Popup.Row.Header.Tooltip".loc()}, "_Editor.Block.Table.Popup.Row.Header.Title".loc())
			]),
			Builder.node('li', {id: 'table_block_inline_popup_addrowabove', className: 'item addrowabove appliesrow'}, [
				Builder.node('span', {title: "_Editor.Block.Table.Popup.Row.Add.Above.Tooltip".loc()}, "_Editor.Block.Table.Popup.Row.Add.Above.Title".loc())
			]),
			Builder.node('li', {id: 'table_block_inline_popup_addrowbelow', className: 'item addrowbelow appliesrow'}, [
				Builder.node('span', {title: "_Editor.Block.Table.Popup.Row.Add.Below.Tooltip".loc()}, "_Editor.Block.Table.Popup.Row.Add.Below.Title".loc())
			]),
			Builder.node('li', {id: 'table_block_inline_popup_deleterow', className: 'item deleterow appliesrow'}, [
				Builder.node('span', {title: "_Editor.Block.Table.Popup.Row.Delete.Tooltip".loc()}, "_Editor.Block.Table.Popup.Row.Delete.Title".loc())
			])
		]);
		return elem;
	},
	registerEventHandlers: function($super) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		bindEventListeners(this, [
			'handleHeaderItemClicked',
			'handleSortByColumnClicked',
			'handleAddColumnClicked',
			'handleDeleteColumnClicked',
			'handleAddRowClicked',
			'handleDeleteRowClicked'
		]);
		globalEventDelegate().bulkRegisterDomResponderForEventByIdentifer([
			['click', 'table_block_inline_popup_headercolumn', this.handleHeaderItemClicked],
			['click', 'table_block_inline_popup_sortasc', this.handleSortByColumnClicked],
			['click', 'table_block_inline_popup_sortdesc', this.handleSortByColumnClicked],
			['click', 'table_block_inline_popup_addcolumnbefore', this.handleAddColumnClicked],
			['click', 'table_block_inline_popup_addcolumnafter', this.handleAddColumnClicked],
			['click', 'table_block_inline_popup_deletecolumn', this.handleDeleteColumnClicked],
			['click', 'table_block_inline_popup_headerrow', this.handleHeaderItemClicked],
			['click', 'table_block_inline_popup_addrowabove', this.handleAddRowClicked],
			['click', 'table_block_inline_popup_addrowbelow', this.handleAddRowClicked],
			['click', 'table_block_inline_popup_deleterow', this.handleDeleteRowClicked]
		]);
	},
	// Prepares this inline popup for display. Accepts an optional anchor for positioning,
	// and an optional showForRow flag that determines what options are included in the menu
	// before being shown. If inOptShowForRow is false or undefined, only menu items applicable
	// for a table column will be rendered.
	preparePopup: function(inOptAnchor, inOptShowForRow) {
		inOptShowForRow ? this.$().addClassName('forrow').removeClassName('forcolumn') : this.$().addClassName('forcolumn').removeClassName('forrow');
		// Configure the table heading option in the contextual toolbar. For simplicity,
		// we only allow the first row, or first column of a table to be a heading.
		if (!inOptAnchor) return;		
		var td = inOptAnchor.up('td'), rows = inOptAnchor.up('table').select('tr');
		var canBeHeadingRow = false, canBeHeadingColumn = false;
		if (inOptShowForRow && rows.indexOf(td.up('tr')) == 1) canBeHeadingRow = true;
		if (!inOptShowForRow && td.up('tr').select('td').indexOf(td) == 1) canBeHeadingColumn = true;
		var headerRowMenuItem = this.$('.item.headerrow'), headerColumnMenuItem = this.$('.item.headercolumn');
		canBeHeadingRow ? headerRowMenuItem.show() : headerRowMenuItem.hide();
		canBeHeadingColumn ? headerColumnMenuItem.show() : headerColumnMenuItem.hide();
		// Update the menu to reflect the current heading state.
		var table = inOptAnchor.up('table');
		var hasHeadingRow = table.hasClassName('headingrow'), hasHeadingColumn = table.hasClassName('headingcolumn');
		var headerRowItem = this.$('.item.headerrow');
		var headerColumnItem = this.$('.item.headercolumn');
		hasHeadingRow ? headerRowItem.addClassName('selected') : headerRowItem.removeClassName('selected');
		hasHeadingColumn ? headerColumnItem.addClassName('selected') : headerColumnItem.removeClassName('selected');
		// Disable add row above and add column before for header-enabled tables.
		var addRowAboveItem = this.$('.item.addrowabove');
		(canBeHeadingRow && hasHeadingRow) ? addRowAboveItem.hide() : addRowAboveItem.show();
		var addColumnBeforeItem = this.$('.item.addcolumnbefore');
		(canBeHeadingColumn && hasHeadingColumn) ? addColumnBeforeItem.hide() : addColumnBeforeItem.show();
	},
	// Override show/hide so we can force-display the table chrome while the menu is showing.
	show: function($super, inOptAnchorElement) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		if (this.mTimer) {
			clearTimeout(this.mTimer);
			delete this.mTimer;
		}
		if (inOptAnchorElement) Element.extend(inOptAnchorElement).up('.block.table table').addClassName('showingmenu');
	},
	hide: function($super, inEvent, inOptCallback) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		// Delay this so we don't show toolbar transitions on a table mid-change.
		this.mTimer = setTimeout(function() {
			var tableBlock = tableBlockDelegate().mTableBlock;
			if (tableBlock) tableBlock.mViewInstance.$().down('table').removeClassName('showingmenu');
		}, 400);
	},
	// Returns the row or column index for the anchor point for the inline table menu.
	// The index is determined by inspecting the position of the anchor element, over
	// which the popup formatting menu is shown.
	_$index: function() {
		var anchorElement = tableBlockDelegate().mInlineTablePopup.mAnchorElement;
		var headerElement = CC.WikiEditor.TableBlockHelpers.$td(anchorElement);
		return CC.WikiEditor.TableBlockHelpers.getRowOrColumnIndex(headerElement);
	},
	// Proxy methods to the table block instance we're editing.
	handleHeaderItemClicked: function(inEvent) {
		var element = inEvent.findElement('.item');
		var isRow = element.hasClassName('appliesrow');
		// Determin if we are toggling a header column or header row.
		element.hasClassName('appliesrow') ? tableBlockDelegate().mTableBlock.toggleHeaderRow() : tableBlockDelegate().mTableBlock.toggleHeaderColumn();
		this.hide();
	},
	handleSortByColumnClicked: function(inEvent) {
		var element = inEvent.findElement('.item');
		// Determine the sort direction.
		var sortDirection = (element.hasClassName('sortasc') ? 'ASC' : 'DESC');
		// Do the sort.
		tableBlockDelegate().mTableBlock.sortColumn(this._$index(), sortDirection);
		this.hide();
	},
	handleAddColumnClicked: function(inEvent) {
		var element = inEvent.findElement('.item');
		// Determine where to add the new column.
		var addBefore = element.hasClassName('addcolumnbefore');
		// Add the column.
		tableBlockDelegate().mTableBlock.addColumn(this._$index(), addBefore);
		this.hide();
	},
	handleDeleteColumnClicked: function(inEvent) {
		// Delete the column.
		tableBlockDelegate().mTableBlock.removeColumn(this._$index(), false);
		this.hide();
	},
	handleAddRowClicked: function(inEvent) {
		var element = inEvent.findElement('.item');
		// Determine where to add the new column.
		var addAbove = element.hasClassName('addrowabove');
		// Add the column.
		tableBlockDelegate().mTableBlock.addRow(this._$index(), addAbove);
		this.hide()
	},
	handleDeleteRowClicked: function(inEvent) {
		// Delete the row.
		tableBlockDelegate().mTableBlock.removeRow(this._$index(), false);
		this.hide();
	}
});

// Table helpers.

CC.WikiEditor.TableBlockHelpers = {
	// Returns the nearest table cell to an element, or the element itself.
	$td: function(inElement) {
		if (!inElement) return undefined;
		var tableCell = Element.extend(inElement);
		if (!tableCell) return undefined;
		return (tableCell.tagName.toLowerCase() == 'td') ? tableCell : tableCell.up('td');
	},
	// Calculates and returns the row or column index for a given table
	// header by parsing the title attribute.
	getRowOrColumnIndex: function(inElement) {
		var title = inElement.getAttribute('name');
		if (title) {
			var match = title.match(/(row|col)-([0-9]+)/i);
			if (match) return parseInt(match[2]);
		}
		return undefined;
	},
	// Returns the table row (0-indexed) for a supplied table cell element, or
	// child element of a table cell.
	rowForTableCell: function(inTableCellElement) {
		var tableCell = this.$td(inTableCellElement);
		if (!tableCell) return undefined;
		// Find the containing table row.
		var row = tableCell.up('tr');
		var table = tableCell.up('table'), rows = table.select('tr');
		// Get the index of the containing table row in the table.
		var index = rows.indexOf(row) - 1;
		return (index >= 0 ? index : undefined);
	},
	// Likewise, returns the table column.
	columnForTableCell: function(inTableCellElement) {
		var tableCell = this.$td(inTableCellElement);
		if (!tableCell) return undefined;
		// Find all the adjacent td elements.
		var row = tableCell.up('tr'), columns = row.select('td');
		var index = columns.indexOf(tableCell) - 1;
		return (index >= 0 ? index : undefined);
	},
	// Returns a tuple of arrays of table headers and data cells.
	computeTableCells: function(inRootElement) {
		// Fetch all table cells.
		var root = $(inRootElement);
		var cells = root.getElementsByTagName('td');
		// Partition into four sets (headers, data, row and column headers).
		var headerCells = [], dataCells = [], rowHeaders = [], columnHeaders = [], cellsLength = cells.length, cellIdx, cell;
		for (cellIdx = 1; cellIdx < cells.length; cellIdx++) {
			cell = cells.item(cellIdx);
			if (Element.hasClassName(cell, 'header')) {
				headerCells.push(cell);
				Element.hasClassName(cell, 'row') ? rowHeaders.push(cell) : columnHeaders.push(cell);
			} else {
				dataCells.push(cell);
			}
		}
		return [headerCells, dataCells, rowHeaders, columnHeaders];
	}
};

// A simple table height observer.

CC.WikiEditor.TableHeightObserver = Class.create(Abstract.TimedObserver, {
	getValue: function() {
		return Element.getHeight(this.element);
	}
});

CC.WikiEditor.NOTIFICATION_TABLE_DID_CHANGE = 'TABLE_DID_CHANGE';
CC.WikiEditor.NOTIFICATION_TABLE_SETTINGS_DID_CHANGE = 'TABLE_SETTINGS_DID_CHANGE';

// A table block.

CC.WikiEditor.TableBlock = Class.create(CC.WikiEditor.Block, {
	mBlockView: 'CC.WikiEditor.TableBlockView',
	mIsContainer: true,
	initialize: function($super) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		globalNotificationCenter().subscribe(CC.WikiEditor.NOTIFICATION_TABLE_DID_CHANGE, this.updateLayoutAndSize.bind(this), this);
	},
	// A table is empty if it has no rows or columns.
	isEmpty: function() {
		var size = this.mViewInstance.getComputedSize();
		return (size.width == 0 && size.height == 0);
	},
	// Tables are explosive.
	isExplosive: function() {
		return true;
	},
	handleDidStartEditing: function($super, inOptInfo) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		if (inOptInfo && !inOptInfo.propagated && (inOptInfo.moveToStart || inOptInfo.moveToEnd)) this.mViewInstance._activate();
		this.mViewInstance.trackActiveCell();
	},
	handleDidStopEditing: function($super, inOptInfo) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		this.mViewInstance._deactivate();
		this.updateLayoutAndSize();
		this.mViewInstance.trackActiveCell();
	},
	// Table editing proxy methods.
	sortColumn: function(inColumnIndex, inOptSortDirection) {
		this.mViewInstance.sortColumn(inColumnIndex, inOptSortDirection);
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_TABLE_DID_CHANGE, this);
	},
	addColumn: function(inColumnIndex, inOptShouldAddColumnBefore) {
		this.mViewInstance.addColumn(inColumnIndex, (inOptShouldAddColumnBefore == true));
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_TABLE_DID_CHANGE, this);
	},
	removeColumn: function(inColumnIndex, inOptControlledExplosion) {
		this.mViewInstance.removeColumn(inColumnIndex, (inOptControlledExplosion == true));
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_TABLE_DID_CHANGE, this);
	},
	addRow: function(inRowIndex, inOptShouldAddRowAbove) {
		this.mViewInstance.addRow(inRowIndex, (inOptShouldAddRowAbove == true));
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_TABLE_DID_CHANGE, this);
	},
	removeRow: function(inRowIndex, inOptControlledExplosion) {
		this.mViewInstance.removeRow(inRowIndex, (inOptControlledExplosion == true));
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_TABLE_DID_CHANGE, this);
	},
	toggleHeaderRow: function(inRowIndex) {
		this.mViewInstance.toggleHeaderRow(inRowIndex);
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_TABLE_DID_CHANGE, this);
	},
	toggleHeaderColumn: function(inColumnIndex) {
		this.mViewInstance.toggleHeaderColumn(inColumnIndex);
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_TABLE_DID_CHANGE, this);
	},
	showSettingsDialog: function() {
		var table = this.mViewInstance.$('table');
		var gridlines = table.hasClassName('gridlines');
		var alternating = table.hasClassName('alternating');
		var callback = function(inOptGridlinesEnabled, inOptAlternatingRows) {
			this.setRecordPropertyForPath('extendedAttributes.gridlines', (inOptGridlinesEnabled || false));
			this.setRecordPropertyForPath('extendedAttributes.alternating', (inOptAlternatingRows || false));
			globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_TABLE_SETTINGS_DID_CHANGE, this);
		};
		tableBlockDelegate().configureAndShowTableSettingsDialog(gridlines, alternating, callback.bind(this));
	},
	// Table-specific implementation of computeBlockGUIDs.
	computeBlockGUIDs: function() {
		if (!this.mViewInstance || !this.mViewInstance.$()) return [];
		var blockViews = this.mViewInstance.$().select('table td > .block, table td > .block-placeholder');
		return blockViews.invoke('getAttribute', 'data-guid');
	},
	// Updates the current size and layout information for this block.
	updateLayoutAndSize: function() {
		this.mViewInstance._computeAndCacheTableCells();
		var size = this.mViewInstance.getComputedSize(true);
		var layout = this.mViewInstance.getComputedLayout(true);
		var reverseLayout = this.mViewInstance.getComputedReverseLayout(true);
		var headerPreferences = this.mViewInstance.getComputedHeaderPreference(true);
		var dimensions = this.mViewInstance.getComputedDimensions(true);
		var blockGUIDs = this.computeBlockGUIDs();
		this.setRecordPropertyForPath('extendedAttributes.size', size);
		this.setRecordPropertyForPath('extendedAttributes.layout', layout);
		this.setRecordPropertyForPath('extendedAttributes.reverseLayout', reverseLayout);
		this.setRecordPropertyForPath('extendedAttributes.headerPreferences', headerPreferences);
		if (this.mViewInstance.mSizedManually) this.setRecordPropertyForPath('extendedAttributes.dimensions', dimensions);
		this.setRecordPropertyForPath('extendedAttributes.blockGUIDs', blockGUIDs);
	},
	mCachedWorkingElement: null,
	mCachedWorkingElementDataCells: null,
	handleDidAddBlock: function($super, inOptInfo) {
		// If the block is being added in an explicit position, render it immediately.
		if (!inOptInfo.quietly && inOptInfo.position) {
			blockRenderingDelegate().renderAndInsertBlockAtPosition(inOptInfo.block, inOptInfo.position);
		}
		// Otherwise, if we're rendering quietly (response from the server on page load or an autosave
		// restore) manually append the block to this contain in the position we already know about.
		else if (inOptInfo && inOptInfo.block) {
			var size = this.getRecordPropertyForPath('extendedAttributes.size');
			var layout = $H(this.getRecordPropertyForPath('extendedAttributes.reverseLayout'));
			var blockGUID = inOptInfo.block.getRecordPropertyForPath('guid');
			if (inOptInfo.workingElement && inOptInfo.workingElement != this.mCachedWorkingElement) {
				this.mCachedWorkingElement = inOptInfo.workingElement;
				this.mCachedWorkingElementDataCells = CC.WikiEditor.TableBlockHelpers.computeTableCells(this.mCachedWorkingElement)[1];
			}
			var workingElement = (inOptInfo.workingElement || this.mViewInstance.$());
			var position, rowId, columnIdx, dataCells, targetCellIdx;
			if (blockGUID && (position = layout.get(blockGUID))) {
				if (position.length != 2) return;
				var rowIdx = position[0], columnIdx = position[1];
				// Are we rendering in a scratch element?
				if (inOptInfo.workingElement) {
					if (this.mCachedWorkingElement != inOptInfo.workingElement) {
						this.mCachedWorkingElement = inOptInfo.workingElement;
						this.mCachedWorkingElementDataCells = CC.WikiEditor.TableBlockHelpers.computeTableCells(this.mCachedWorkingElement)[1];
					}
					dataCells = this.mCachedWorkingElementDataCells;
				} else {
					dataCells = this.mViewInstance.getDataCells();
				}
				targetCellIdx = (rowIdx * size.width) + columnIdx;
				if (dataCells.length <= targetCellIdx) return;
				// Render and position the block.
				blockRenderingDelegate().renderAndInsertBlockAtPosition(inOptInfo.block, {'bottom': dataCells[targetCellIdx]});
			}
		}
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
	},
	handleBlocksDidChange: function($super, inOptInfo) {
		if (!inOptInfo || (inOptInfo && !inOptInfo.quietly)) {
			globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_TABLE_DID_CHANGE, this);
		}
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
	},
	// Autosave support.
	restore: function($super, inChangesets) {
		$super(inChangesets);
		// To restore a table, we need to both restore the state of the table (header settings,
		// number of rows and columns etc) and any child blocks that are already saved on the
		// page and were rendered when the page was rendered.
		var childBlockElements = this.mViewInstance.$().select('table .block'), childBlockElementIdx, childBlockElement;
		var stashedBlockViewElements = new Array();
		for (childBlockElementIdx = 0; childBlockElementIdx < childBlockElements.length; childBlockElementIdx++) {
			childBlockElement = childBlockElements[childBlockElementIdx];
			stashedBlockViewElements.push(Element.remove(childBlockElement));
		}
		// Force re-render the table with any new changeset-applied attributes.
		var selectableElement = this.mViewInstance.$('.content.selectable .container');
		Element.insert(selectableElement, {'before': this.mViewInstance.renderBlock()});
		Element.remove(selectableElement);
		// Re-add any child blocks.
		var block, stashedBlockViewElementIdx, stashedBlockViewElement;
		for (stashedBlockViewElementIdx = 0; stashedBlockViewElementIdx < stashedBlockViewElements.length; stashedBlockViewElementIdx++) {
			stashedBlockViewElement = stashedBlockViewElements[stashedBlockViewElementIdx];
			block = globalEditorController().blockForBlock(stashedBlockViewElement);
			this.addBlock(block, undefined, true, true);
		}
	}
});

// The view displaying a table block. A table block is a container for a series of child
// content blocks, e.g. text and images, presented in a tabular form. Like other container
// blocks, a table block's model has a blockGUIDs array in its extendedAttributes (with an
// ordered array of the GUIDs for each child block), and a layout property in its extendedAttributes
// tracking the positioning of each of those children. The layout of a table is stored as an array of
// arrays (where the array snakes to fill the table). For performance, we also track the
// table size, and a reverse layout (dictionary keyed by block guid with an row and column
// index tuple).

CC.WikiEditor.TableBlockView = Class.create(CC.WikiEditor.NonTextBlockView, CC.WikiEditor.Mixins.AskBeforeDeleting, {
	// The default number of rows and columns for an empty table.
	mDefaultSize: {'width': 3, 'height': 4},
	// The default layout for an empty table.
	mDefaultLayout: [],
	// The default reverse layout for an empty table.
	mDefaultReverseLayout: {},
	mDefaultDisplayAlternatingRows: true,
	mDefaultDisplayGridlines: true,
	mDefaultColumnWidth: 215,
	mMinimumColumnWidth: 40,
	mDefaultRowHeight: 32,
	mMinimumRowHeight: 32,
	// The currently active cell if it exists.
	mActiveCell: null,
	// Is this table being sized manually?
	mSizedManually: false,
	mDeleteDialogTitle: "_Editor.Block.Table.Dialog.Delete.Title".loc(),
	mDeleteDialogDescription: "_Editor.Block.Table.Dialog.Delete.Description".loc(),
	initialize: function($super) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		bindEventListeners(this, [
			'handleInlineTableMenuButtonMouseDown',
			'handleResizeTableRowColumnMouseDown',
			'handleWindowMouseMove',
			'handleWindowMouseUp',
			'handleTableCellClick',
			'handleTableCellMouseDown'
		]);
	},
	getEventDelegateIdentiferForRowColumnIndex: function(inRowIndex, inColumnIndex) {
		return this.getEventDelegateIdentifer() + "-cell-%@".fmt(generateRamdomAlphanumericString(6));
	},
	renderAsHTML: function() {
		// Get the number of rows and columns.
		var size = (this.mContent.getRecordPropertyForPath('extendedAttributes.size') || this.mDefaultSize);
		// Get any row and column dimensions.
		var dimensions = this.mContent.getRecordPropertyForPath('extendedAttributes.dimensions');
		if (dimensions) this.mSizedManually = true;
		// Get the header preferences.
		var headerPreferences = this.mContent.getRecordPropertyForPath('extendedAttributes.headerPreferences') || [false, false];
		// Get the true size of the table, since the layout might not be null-padded.
		var upperLimit = (size.width + 1) * (size.height + 1);
		// Should we display gridlines or alternating rows?
		var gridlines = this.mContent.getRecordPropertyForPath('extendedAttributes.gridlines', this.mDefaultDisplayGridlines);
		var alternating = this.mContent.getRecordPropertyForPath('extendedAttributes.alternating', this.mDefaultDisplayAlternatingRows);
		// Are we rendering in edit mode?
		var editable = this.mContent.isEditable();
		// Render the table.
		var tableRows = [], cellIndex, rowIndex, columnIndex, dimension;
		var workingRow, workingRowSubstitutions = [];
		for (cellIndex = 0; cellIndex < upperLimit; cellIndex++) {
			columnIndex = (cellIndex % (size.width + 1));
			rowIndex = Math.floor(cellIndex / (size.width + 1));
			// Render a new HTML row.
			if (columnIndex == 0) {
				workingRow = this._renderRowAsHTML(rowIndex, (rowIndex == 0), size.width + 1);
			}
			// Are we building the 0th row?
			if (rowIndex == 0) {
				// Add the delete widget to the top left cell of every table.
				if (columnIndex == 0) {
					var eventDelegateIdentifer = this.getEventDelegateIdentifer() + "-delete";
					workingRowSubstitutions.push("<td class=\"reserved header chrome\" width=\"18px\" height=\"16px\"><div id=\"%@\" class=\"delete clickable\">%@</div></td>".fmt(eventDelegateIdentifer, "_Editor.Delete.Block".loc()));
				} else {
					dimension = ((dimensions && dimensions[0][columnIndex - 1]) || this.mDefaultColumnWidth);
					workingRowSubstitutions.push(this._renderHeaderAsHTML(rowIndex, columnIndex, false, dimension));
				}
			// Are we building the 0th column?
			} else {
				if (columnIndex == 0) {
					dimension = ((dimensions && dimensions[1][rowIndex - 1]) || this.mDefaultRowHeight);
					workingRowSubstitutions.push(this._renderHeaderAsHTML(rowIndex, columnIndex, true, dimension));
					continue;
				}
				workingRowSubstitutions.push(this._renderCellAsHTML(rowIndex, columnIndex, editable));
			}
			// Flush each row buffer as we go.
			if (columnIndex == size.width) {
				tableRows.push(workingRow.fmt.apply(workingRow, workingRowSubstitutions));
				workingRowSubstitutions = [];
			}
		}
		var result = "<div class=\"container wrapchrome\">" +
			"<div class=\"table mask chrome\" style=\"display: none;\"></div>" +
			"<div class=\"table alt controls row chrome\"><div id=\"%@\" class=\"toggle clickable\"></div><div class=\"rotary\"><div class=\"count\">3</div><div id=\"%@\" class=\"up clickable\"></div><div id=\"%@\" class=\"down clickable\"></div><div class=\"up-bg\"></div><div class=\"down-bg\"></div></div></div>".fmt(this.getEventDelegateIdentifer() + "-alt-controls-row-toggle", this.getEventDelegateIdentifer() + "-alt-controls-row-up", this.getEventDelegateIdentifer() + "-alt-controls-row-down") +
			"<div class=\"table alt controls col chrome\"><div id=\"%@\" class=\"toggle clickable\"></div><div class=\"rotary\"><div class=\"count\">2</div><div id=\"%@\" class=\"up clickable\"></div><div id=\"%@\" class=\"down clickable\"></div><div class=\"up-bg\"></div><div class=\"down-bg\"></div></div></div>".fmt(this.getEventDelegateIdentifer() + "-alt-controls-col-toggle", this.getEventDelegateIdentifer() + "-alt-controls-col-up", this.getEventDelegateIdentifer() + "-alt-controls-col-down") +
			"<table class=\"__wikiTableVersion:Lion%@%@%@%@\" width=\"1px\">%@</table>".fmt((headerPreferences[0] ? " headingrow" : ""), (headerPreferences[1] ? " headingcolumn" : ""), (gridlines ? " gridlines" : ""), (alternating ? " alternating" : ""), tableRows.join('')) +
			"</div>";
		return result;
	},
	// Renders an individual header cell.
	_renderHeader: function(inRowIndex, inColumnIndex, inOptIsRowHeader, inOptDimension) {
		var eventDelegateIdentifer = this.getEventDelegateIdentiferForRowColumnIndex(inRowIndex, inColumnIndex);
		var header = Builder.node('td', {id: eventDelegateIdentifer, className: 'reserved header chrome ' + (inOptIsRowHeader ? 'row' : 'col')}, [
			Builder.node('div', {className: 'chrome'}, [
				Builder.node('div', {className: 'index'}),
				Builder.node('div', {className: 'menu clickable', id: "%@-menu".fmt(eventDelegateIdentifer)}),
				Builder.node('div', {className: 'resize', id: "%@-resize".fmt(eventDelegateIdentifer)})
			])
		]);
		// Force width/height using a spacer image.
		var attrs = {className: 'sizer', src: '/__collabd/coreclientbase/static/spacer.gif', width: '16px', height: '18px'};
		var dimensionKey, dimension;
		if (inOptIsRowHeader) {
			dimensionKey = 'height';
			dimension = this.mDefaultRowHeight;
		} else {
			dimensionKey = 'width';
			dimension = this.mDefaultColumnWidth;
		}
		if (inOptDimension) {
			dimensionKey = (inOptIsRowHeader ? 'height' : 'width');
			dimension = inOptDimension;
		}
		attrs[dimensionKey] = (dimension - 1) + 'px';
		header.down('div.chrome').appendChild(Builder.node('img', attrs));
		header.setAttribute(dimensionKey, dimension + 'px');
		this._registerEventHandlersForHeader(header);
		return header;
	},
	_renderHeaderAsHTML: function(inRowIndex, inColumnIndex, inOptIsRowHeader, inOptDimension) {
		var spacerDimension = "width=\"16px\" height=\"18px\"", cellDimension = "", dimension;
		if (inOptIsRowHeader) {
			dimension = (inOptDimension || this.mDefaultRowHeight);
			cellDimension = " width=\"16px\" height=\"" + dimension + "px\""
			spacerDimension = " width=\"16px\" height=\"" + (dimension - 1) + "px\""
		} else {
			dimension = (inOptDimension || this.mDefaultColumnWidth);
			cellDimension = " width=\"" + dimension + "px\" height=\"18px\"";
			spacerDimension = " width=\"" + (dimension - 1) + "px\" height=\"18px\"";
		}
		var eventDelegateIdentifer = this.getEventDelegateIdentiferForRowColumnIndex(inRowIndex, inColumnIndex);
		var markup = "<td id=\"%@\" class=\"reserved header chrome %@\"%@>".fmt(eventDelegateIdentifer, (inOptIsRowHeader ? 'row' : 'col'), cellDimension) +
			"<div><div class=\"top\"></div><div class=\"right\"></div><div class=\"bottom\"></div><div class=\"left\"></div>" +
			"<div class=\"index\"></div><div id=\"%@\" class=\"menu\"></div>".fmt(eventDelegateIdentifer + "-menu") + 
			"<div id=\"%@\" class=\"resize\"></div><img class=\"sizer\" src=\"/__collabd/coreclientbase/static/spacer.gif\"%@/></div></td>".fmt(eventDelegateIdentifer + "-resize", spacerDimension);
		return markup;
	},
	_registerEventHandlersForHeader: function(inHeaderElement) {
		if (inHeaderElement) {
			var eventDelegateIdentifer = inHeaderElement.getAttribute('id');
			globalEventDelegate().bulkRegisterDomResponderForEventByIdentifer([
				['mousedown', "%@-menu".fmt(eventDelegateIdentifer), this.handleInlineTableMenuButtonMouseDown],
				['mousedown', "%@-resize".fmt(eventDelegateIdentifer), this.handleResizeTableRowColumnMouseDown]
			]);
		}
	},
	// Renders a row.
	_renderRow: function(inRowIndex, inOptIsHeaderRow) {
		var tr = Builder.node('tr');
		if (inOptIsHeaderRow) tr.addClassName('chrome');
		return tr;
	},
	_renderRowAsHTML: function(inRowIndex, inOptIsHeaderRow, inOptSubstitutions) {
		var substitutions = "";
		if (inOptSubstitutions) {
			for (var i = 0; i < inOptSubstitutions; i++) {
				substitutions += "%@";
			}
		}
		return "<tr%@>%@</tr>".fmt((inOptIsHeaderRow ? " class=\"chrome\"" : ""), substitutions);
	},
	// Renders an individual data cell.
	_renderCell: function(inRowIndex, inColumnIndex) {
		var eventDelegateIdentifer = this.getEventDelegateIdentiferForRowColumnIndex(inRowIndex, inColumnIndex);
		var cell = Builder.node('td', {id: eventDelegateIdentifer, className: 'cell'});
		this._registerEventHandlersForCell(cell);
		return cell;
	},
	_renderCellAsHTML: function(inRowIndex, inColumnIndex) {
		var eventDelegateIdentifer = this.getEventDelegateIdentiferForRowColumnIndex(inRowIndex, inColumnIndex);
		return "<td id=\"%@\" class=\"cell\"></td>".fmt(eventDelegateIdentifer);
	},
	_registerEventHandlersForCell: function(inCellElement) {
		globalEventDelegate().bulkRegisterDomResponderForEventByIdentifer([
			['mousedown', inCellElement.getAttribute('id'), this.handleTableCellMouseDown],
			['touchstart', inCellElement.getAttribute('id'), this.handleTableCellMouseDown],
			['click', inCellElement.getAttribute('id'), this.handleTableCellClick]
		]);
	},
	// Registers table-level event handlers.
	mTableHeightObserver: null,
	registerEventHandlers: function() {
		// As soon as we can, compute and cache any table cells.
		this._computeAndCacheTableCells();
		// Reconfigure any table headers.
		this.reconfigureTableHeaders();
		// Reconfigure the alt popup counts.
		this.reconfigureAltPopupCounts();
		// Enable the delete table button.
		var eventIdentifer = this.getEventDelegateIdentifer();
		globalEventDelegate().registerDomResponderForEventByIdentifer('click', "%@-delete".fmt(eventIdentifer), this.handleDeleteButtonClick.bind(this));
		// Enable the alternative row/column popup.
		bindEventListeners(this, [
			'handleDisplayAltControlsClicked',
			'handleAltTablePopupAddRowClicked',
			'handleAltTablePopupRemoveRowClicked',
			'handleAltTablePopupAddColumnClicked',
			'handleAltTablePopupRemoveColumnClicked'
		]);
		globalEventDelegate().bulkRegisterDomResponderForEventByIdentifer([
			['click', "%@-alt-controls-row-toggle".fmt(eventIdentifer), this.handleDisplayAltControlsClicked],
			['click', "%@-alt-controls-col-toggle".fmt(eventIdentifer), this.handleDisplayAltControlsClicked],
			['click', "%@-alt-controls-row-up".fmt(eventIdentifer), this.handleAltTablePopupAddRowClicked],
			['click', "%@-alt-controls-col-up".fmt(eventIdentifer), this.handleAltTablePopupAddColumnClicked],
			['click', "%@-alt-controls-row-down".fmt(eventIdentifer), this.handleAltTablePopupRemoveRowClicked],
			['click', "%@-alt-controls-col-down".fmt(eventIdentifer), this.handleAltTablePopupRemoveColumnClicked]
		]);
		// Register event handlers on table headers and cells.
		var headers = this.mCachedHeaderCells;
		for (var headerIdx = 0; headerIdx < headers.length; headerIdx++) {
			this._registerEventHandlersForHeader(headers[headerIdx]);
		}
		var cells = this.mCachedDataCells;
		for (var cellIdx = 0; cellIdx < cells.length; cellIdx++) {
			this._registerEventHandlersForCell(cells[cellIdx]);
		}
		// 9421864
		// Observe table height changes in case a sub-element in one of the table row cells
		// is forcing the row to draw taller than we expect. We have no option here, really.
		this.mTableHeightObserver = new CC.WikiEditor.TableHeightObserver(this.$().down('table'), 1, this.handleTableHeightChanged.bind(this));
		// Publish a notification once we're done.
		globalNotificationCenter().subscribe(CC.WikiEditor.NOTIFICATION_TABLE_SETTINGS_DID_CHANGE, this.handleTableSettingsDidChange.bind(this), this.mContent);
	},
	// Cached layouts, size and dimensions for this table.
	mCachedComputedLayout: null,
	mCachedComputedReverseLayout: null,
	mCachedComputedSize: null,
	mCachedComputedDimensions: null,
	// Returns the current computed layout based on the layout of the table.
	getComputedLayout: function(inOptForceRecalculate) {
		// If we can, return a cached value.
		if (this.mCachedComputedLayout && !inOptForceRecalculate) return this.mCachedComputedLayout;
		// First get the size of the table.
		var size = this.getComputedSize();
		// Initialize a new layout as an array of length size.width x size.height.
		var layout = new Array(size.width * size.height);
		// Iterate over every non-header table cell and inspect any child blocks.
		var rows = this.$().select('tr');
		if (rows.length > 0) rows.shift();
		// Loop through each table cell and build an ordered array of child block GUIDs. Each block
		// view that is a child node of a table cell has its GUID stashed in the for attribute of the
		// rendered block view. Once we have a list of children, update the layout array and continue.
		var cells, cellIdx, cell, topLevelBlockGUIDs, row, rowIdx;
		for (rowIdx = 0; rowIdx < rows.length; rowIdx++) {
			row = rows[rowIdx];
			cells = row.select('td');
			for (cellIdx = 1; cellIdx < cells.length; cellIdx++) {
				cell = cells[cellIdx];
				var blockGUIDs = cell.select('.block').invoke('getAttribute', 'data-guid');
				var nestedBlockGUIDs = cell.select('.block .block').invoke('getAttribute', 'data-guid');
				topLevelBlockGUIDs = stringArrayDifference(blockGUIDs, nestedBlockGUIDs);
				layout[(rowIdx * size.width) + (cellIdx - 1)] = (blockGUIDs.length > 0 ? blockGUIDs : undefined);
			}
		}
		return (this.mCachedComputedLayout = layout);
	},
	getComputedReverseLayout: function(inOptForceRecalculate) {
		if (this.mCachedComputedReverseLayout && !inOptForceRecalculate) return this.mCachedComputedReverseLayout;
		var size = this.getComputedSize();
		var computedLayout = this.getComputedLayout();
		// Initialize a new reverse layout.
		var reverseLayout = {};
		var cellLayout, columnIdx, rowIdx;
		// Iterate over the computed layout and build a layout keyed by block GUID.
		for (var idx = 0; idx < computedLayout.length; idx++) {
			cellLayout = $A(computedLayout[idx]);
			rowIdx = Math.floor(idx / size.width);
			columnIdx = (idx % size.width);
			for (var jdx = 0; jdx < cellLayout.length; jdx++) {
				blockGUID = cellLayout[jdx];
				reverseLayout[blockGUID] = [rowIdx, columnIdx];
			}
		}
		return (this.mCachedComputedReverseLayout = reverseLayout);
	},
	// Likewise, for size.
	getComputedSize: function(inOptForceRecalculate) {
		if (this.mCachedComputedSize && !inOptForceRecalculate) return this.mCachedComputedSize;
		var rows = this.$().select('table tr');
		var rowCount = rows.length;
		var cells = this.$().select('table td');
		var cellCount = cells.length;
		return (this.mCachedComputedSize = {'width': Math.floor(cellCount / rowCount) - 1, 'height': rowCount - 1});
	},
	// Likewise, for dimensions. Dimensions of a table (widths of columns and rows) are tracked as
	// a length-2 array of integer arrays, with the widths of all columns in an array at index 0, and
	// the heights of all rows in an array at index 1.
	getComputedDimensions: function(inOptForceRecalculate) {
		if (this.mCachedComputedDimensions && !inOptForceRecalculate) return this.mCachedComputedDimensions;
		var table = this.$('table'), width, height;
		var columnDimensions = table.select('td.reserved.header.col').collect(function(td) {
			return td.getWidth() - 1;
		});
		var rowDimensions = table.select('td.reserved.header.row').collect(function(td) {
			return td.getHeight() - 1;
		});
		return (this.mCachedComputedDimensions = [columnDimensions, rowDimensions]);
	},
	// Returns the current computed header settings for this table, as an length-2 array of booleans,
	// representing whether the row or column heading preference is enabled.
	mCachedHasHeadingPreferences: null,
	getComputedHeaderPreference: function(inOptForceRecalculate) {
		// If we can, return a cached value.
		if (this.mCachedHasHeadingPreferences && !inOptForceRecalculate) return this.mCachedHasHeadingPreferences;
		// Otherwise, recompute and return.
		var table = this.$('table');
		var hasRowHeading = table.hasClassName('headingrow');
		var hasColumnHeading = table.hasClassName('headingcolumn');
		return (this.mCachedHasHeadingPreferences = [hasRowHeading, hasColumnHeading]);
	},
	// Caches header/data cells for table performance as an array of table <td> elements.
	mCachedHeaderCells: null,
	mCachedRowHeaderCells: null,
	mCachedColumnHeaderCells: null,
	mCachedDataCells: null,
	getHeaderCells: function(inOptForceRecalculate) {
		if (this.mCachedHeaderCells && !inOptForceRecalculate) return this.mCachedHeaderCells;
		this._computeAndCacheTableCells();
		return this.mCachedHeaderCells;
	},
	getDataCells: function(inOptForceRecalculate) {
		if (this.mCachedDataCells && !inOptForceRecalculate) return this.mCachedDataCells;
		this._computeAndCacheTableCells();
		return this.mCachedDataCells;
	},
	_computeAndCacheTableCells: function() {
		var result = CC.WikiEditor.TableBlockHelpers.computeTableCells(this.$());
		this.mCachedHeaderCells = result[0];
		this.mCachedDataCells = result[1];
		this.mCachedRowHeaderCells = result[2];
		this.mCachedColumnHeaderCells = result[3];
	},
	// Returns the header string for use in a row/column header at a particular index.
	mAlphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
	buildHeaderString: function(inRowOrColumnIndex, inOptIsRowHeader) {
		var headerString = "%@".fmt(inRowOrColumnIndex);
		// Column headers are A-Z.
		if (!inOptIsRowHeader) {
			if (inRowOrColumnIndex >= this.mAlphabet.length) {
				var times = Math.floor(inRowOrColumnIndex / this.mAlphabet.length);
				var mod = inRowOrColumnIndex % this.mAlphabet.length;
				// Only go as far as "ZZ".
				if (times < this.mAlphabet.length) {
					headerString = "%@%@".fmt(this.mAlphabet[times], this.mAlphabet[mod]);
				}
			} else {
				headerString = this.mAlphabet[inRowOrColumnIndex];
			}
		}
		return headerString;
	},
	// Iterates over each of the table header elements, tagging them with their row or
	// column index, and adjusting the row or column display name. By tagging rows and
	// columns with an identifier, we can quickly determine the index of a row or column
	// operation without walking up and down the DOM inefficiently.
	reconfigureTableHeaders: function(inOptRootElement) {
		var elem = (inOptRootElement || this.$());
		// Adjust all the column headings in the first table row.
		var firstRow = elem.down('tr');
		var colHeaders = firstRow.select('td.header.col'), colHeaderIdx, colHeader;
		for (colHeaderIdx = 0; colHeaderIdx < colHeaders.length; colHeaderIdx++) {
			colHeader = colHeaders[colHeaderIdx];
			colHeader.setAttribute('name', 'col-' + colHeaderIdx);
			colHeader.down('.index').innerHTML = this.buildHeaderString(colHeaderIdx, false);
		}
		// Adjust each of the row headings.
		var rowHeaders = elem.select('td.header.row'), rowHeaderIdx, rowHeader;
		for (rowHeaderIdx = 0; rowHeaderIdx < rowHeaders.length; rowHeaderIdx++) {
			rowHeader = rowHeaders[rowHeaderIdx];
			rowHeader.setAttribute('name', 'row-' + rowHeaderIdx);
			rowHeader.down('.index').innerHTML = this.buildHeaderString((rowHeaderIdx + 1), true);
		}
	},
	// Reconfigures the count values in the alt table row/column popups.
	reconfigureAltPopupCounts: function(inOptRootElement) {
		var elem = (inOptRootElement || this.$());
		var computedSize = this.getComputedSize(true);
		var rowPopup = elem.down('.alt.controls.row');
		rowPopup.down('.count').update(computedSize.height);
		var columnPopup = elem.down('.alt.controls.col');
		columnPopup.down('.count').update(computedSize.width);
	},
	// Adds a new empty column to the table at a given index. By default, new columns are
	// added to the table to the right of the specified index, but you can optionally pass
	// inOptShouldAddColumnBefore as true to override this behavior. Because of the nature
	// of an HTML table, iterates through each of the existing rows in the table and
	// pushes a new table cell at the correct index for the insertion.
	addColumn: function(inColumnIndex, inOptShouldAddColumnBefore) {
		if (inColumnIndex < 0) return;
		// By default, columns are added at the end of a table.
		var newColumnIndex = this.getComputedSize().width;
		// Calculate an adjusted column index for the insertion point (if we have one).
		if (inColumnIndex != undefined) newColumnIndex = (inOptShouldAddColumnBefore) ? Math.max(inColumnIndex - 1, 1) : inColumnIndex + 1;
		var rows = this.$().select('table tr'), row;
		var pivotElement, cell, insertion, editable = this.mContent.isEditable();
		for (var rowIdx = 0; rowIdx < rows.length; rowIdx++) {
			row = rows[rowIdx];
			pivotElement = ((inColumnIndex != undefined) ? row.select('td')[inColumnIndex + 1] : row.select('td')[newColumnIndex]);
			cell = (rowIdx == 0 ? this._renderHeader(rowIdx, newColumnIndex, false, this.mDefaultColumnWidth) : this._renderCell(newColumnIndex, rowIdx, editable));
			insertion = (inOptShouldAddColumnBefore ? {'before': cell} : {'after': cell});
			Element.insert(pivotElement, insertion);
		}
		this.reconfigureTableHeaders();
		this.reconfigureAltPopupCounts();
	},
	removeColumn: function(inColumnIndex, inOptControlledExplosion) {
		if (inColumnIndex < 0) return;
		if (inColumnIndex == undefined) inColumnIndex = Math.max(this.getComputedSize().width - 1, 1);
		// There should always be at least one column.
		var columns = this.$().down('tr').select('td');
		if (columns.length <= 2) return false;
		// Calculate where to summon the smoke monster.
		if (inOptControlledExplosion != true) {
			var headerCell = this.$().select('td.header.col')[inColumnIndex];
			var table = this.$().down('table');
			var viewportOffset = Element.viewportOffset(headerCell);
			var dimensions = Element.getDimensions(headerCell);
			var left = viewportOffset.left + (dimensions.width / 2)
			var viewportHeight = document.viewport.getHeight();
			// The top position of smokey should be half way between the header cell
			// and the bottom of the table, or the header cell and the bottom of the
			// viewport, whichever is smaller.
			var top = viewportOffset.top + Math.min(((viewportHeight - viewportOffset.top) / 2), ((table.getHeight() - 27) / 2)); 
			smokey().showAtPosition({'left': left, 'top': top});
		}
		// Now delete each of the table cells in turn.
		var rows = this.$().select('table tr'), rowIdx, row;
		for (rowIdx = 0; rowIdx < rows.length; rowIdx++) {
			row = rows[rowIdx];
			Element.remove(row.childElements()[inColumnIndex + 1]);
		}
		// Reconfigure our table headers.
		this.reconfigureTableHeaders();
		this.reconfigureAltPopupCounts();
	},
	// Adds a new empty row to the table at a given index. Simply renders a new tr tag, with
	// a row header element and enough empty table cells to fill the row before appending.
	addRow: function(inRowIndex, inOptShouldAddRowAbove) {
		if (inRowIndex < 0) return;
		var newRowIndex = this.getComputedSize().height;
		// Calculate an adjusted row index for the insertion point.
		if (inRowIndex != undefined) newRowIndex = (inOptShouldAddRowAbove) ? Math.max(inRowIndex - 1, 0) : inRowIndex + 1;
		// Render a new row.
		var size = this.getComputedSize(), row = this._renderRow(newRowIndex), editable = this.mContent.isEditable();
		row.appendChild(this._renderHeader(newRowIndex, 0, true, this.mDefaultRowHeight));
		for (var columnIdx = 0; columnIdx < size.width; columnIdx++) {
			row.appendChild(this._renderCell(newRowIndex, columnIdx, editable));
		}
		// Find the pivot row about which we'll be inserting.
		var table = this.$().down('table')
		var rows = table.select('tr');
		var pivotElement = table;
		var insertion = {'bottom': row};
		if (inRowIndex != undefined) {
			pivotElement = rows[inRowIndex + 1];
			insertion = (inOptShouldAddRowAbove ? {'before': row} : {'after': row});
		}
		Element.insert(pivotElement, insertion);
		this.reconfigureTableHeaders();
		this.reconfigureAltPopupCounts();
	},
	removeRow: function(inRowIndex, inOptControlledExplosion) {
		if (inRowIndex < 0) return;
		if (inRowIndex == undefined) inRowIndex = Math.max(this.getComputedSize().height - 1, 1);
		var rows = this.$().select('table tr');
		// There should always be at least one row.
		if (rows.length <= 2) return false;
		var row = rows[inRowIndex + 1];
		if (inOptControlledExplosion != true) smokey().showOverElement(row);
		Element.remove(row);
		this.reconfigureTableHeaders();
		this.reconfigureAltPopupCounts();
	},
	// Redraws the table in-place, sorting rows in a specified direction by inspecting the contents
	// of a given column index.
	sortColumn: function(inColumnIndex, inOptSortDirection) {
		// Adjust the column index.
		inColumnIndex += 1;
		// First remove every non-header row.
		var table = this.$().down('table');
		var rows = table.select('tr');
		if (rows.length > 0) rows.shift();
		if (table.hasClassName('headingrow')) rows.shift();
		rows.collect(function(row) {
			return Element.remove(row);
		});
		// Next, sort the rows in the specified direction.
		var columns, firstBlockElement, firstBlockGUID, firstBlock;
		var sharedEditorInstance = globalEditorController();
		var sorted = rows.sortBy(function(row) {
			columns = row.select('td');
			if (columns.length <= inColumnIndex) return 0;
			firstBlockElement = columns[inColumnIndex].down('.block');
			var val = "";
			if (firstBlockElement) {
				firstBlockGUID = firstBlockElement.getAttribute('data-guid');
				firstBlock = sharedEditorInstance.blockForBlock(firstBlockGUID);
				if (firstBlock && firstBlock.mViewInstance && firstBlock.mViewInstance.mIsComparable) {
					val = firstBlock.mViewInstance.getComparableValue();
				}
			}
			return (null == val ? 0 : val.toLowerCase());
		});
		// Append ordered the rows to the document again.
		if (inOptSortDirection == "DESC") {
			for (var idx = (sorted.length - 1); idx >= 0; idx--) {
				table.appendChild(sorted[idx]);
			}
		} else {
			for (var idx = 0; idx < sorted.length; idx++) {
				table.appendChild(sorted[idx]);
			}
		}
		// Reconfigure table headings which might now be out of order.
		this.reconfigureTableHeaders();
	},
	toggleHeaderRow: function() {
		var table = this.$('table');
		table.hasClassName('headingrow') ? table.removeClassName('headingrow') : table.addClassName('headingrow');
	},
	toggleHeaderColumn: function(inColumnIndex) {
		var table = this.$('table');
		table.hasClassName('headingcolumn') ? table.removeClassName('headingcolumn') : table.addClassName('headingcolumn');
	},
	// Handles a table settings change from the table settings dialog.
	handleTableSettingsDidChange: function() {
		var gridlines = this.mContent.getRecordPropertyForPath('extendedAttributes.gridlines')
		var alternating = this.mContent.getRecordPropertyForPath('extendedAttributes.alternating')
		var table = this.$('table');
		gridlines ? table.addClassName('gridlines') : table.removeClassName('gridlines');
		alternating ? table.addClassName('alternating') : table.removeClassName('alternating');
	},
	// Tracks the currently active table cell.
	trackActiveCell: function() {
		this.mActiveCell = null;
		var activeBlock = this.$().down('.block.editing');
		if (activeBlock) {
			var cell = activeBlock.up('td');
			var rowIdx = CC.WikiEditor.TableBlockHelpers.rowForTableCell(cell);
			var colIdx = CC.WikiEditor.TableBlockHelpers.columnForTableCell(cell);
			this.mActiveCell = [rowIdx, colIdx];
		}
	},
	// Tabs to the next/previous table cells after/before the active cell.
	_tab: function(inOptTabInReverse) {
		if (!this.mActiveCell) this.mActiveCell = [0, 0];
		// Otherwise, figure out the next cell we can relocate to.
		var rowIdx = this.mActiveCell[0], colIdx = this.mActiveCell[1];
		var size = this.getComputedSize();
		// If we're at the end of a row, and not in the last row, select the first cell in
		// the next row.
		if (!inOptTabInReverse && colIdx == (size.width - 1)) {
			rowIdx = (rowIdx < (size.height - 1)) ? rowIdx + 1 : 0;
			colIdx = 0;
		}
		// If we're selecting in reverse, and we're at the start of the row, and not in
		// the first row, select the last cell in the previous row.
		else if (inOptTabInReverse && colIdx == 0) {
			rowIdx = (rowIdx > 0) ? rowIdx - 1 : size.height - 1;
			colIdx = size.width - 1;
		}
		// Otherwise select the next/previous cell in the same row.
		else {
			colIdx += (inOptTabInReverse ? -1 : 1);
		}
		logger().debug("rowIdx: %o, colIdx: %o", rowIdx, colIdx);
		this._activate(rowIdx, colIdx);
	},
	tabToNextCell: function() {
		this._tab();
	},
	tabToPreviousCell: function() {
		this._tab(true);
	},
	_activate: function(inOptRowIdx, inOptColumnIdx, inOptActivateAtEnd) {
		var blockGUIDs = this.mContent.getRecordPropertyForPath('extendedAttributes.blockGUIDs');
		var layout = this.mContent.getRecordPropertyForPath('extendedAttributes.layout');
		// If the layout is missing, recompute it.
		if (!layout) layout = this.getComputedLayout(true);
		var size = this.getComputedSize();
		var layoutIdx = 0;
		if (inOptRowIdx != undefined && inOptColumnIdx != undefined) {
			layoutIdx = (inOptRowIdx * size.width) + inOptColumnIdx;
		}
		// Do we have a layout for the calculated layout index?
		if (layout && layout[layoutIdx] != undefined) {
			var cellLayout = layout[layoutIdx];
			var blockGUID = cellLayout[(inOptActivateAtEnd ? (cellLayout.length - 1) : 0)];
			var block = this.mContent.mBlocks.get(blockGUID);
			return globalEditorController().startEditing(block, {'moveToStart': !inOptActivateAtEnd, 'moveToEnd': inOptActivateAtEnd}, true);
		}
		var prediction = globalEditorController().predictNextBlock();
		var cells = this.mCachedDataCells;
		var cell = (cells.length > layoutIdx) ? cells[layoutIdx] : cells[0];
		var position = (inOptActivateAtEnd ? {'bottom': cell} : {'top': cell});
		globalEditorController().addBlock(prediction.blockType, {'extendedAttributes': prediction.attributes}, true, position, this.mContent);
	},
	_deactivate: function() {
		// TODO
	},
	handleKeyboardNotification: function(inMessage, inObject, inOptExtras) {
		var inEvent = inOptExtras.event;
		var activeBlock = globalEditorController().mActiveBlock;
		switch (inMessage) {
			// Support tabbing and reverse tabbing through the table.
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_TAB:
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SHIFT_TAB:
				Event.stop(inEvent);
				if (inMessage == CC.Keyboard.NOTIFICATION_DID_KEYBOARD_TAB) {
					this.tabToNextCell();
				} else {
					this.tabToPreviousCell();
				}
				return true;
			// Do not allow navigation between table cells using arrows keys. The browser will
			// navigate between table cells and editable regions outside this table based on
			// arrow key presses, so watch for an unwanted activation of another block and revert
			// it.
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_LEFT:
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_UP:
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_RIGHT:
			case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_DOWN:
				var stashedActiveBlock = globalEditorController().mActiveBlock;
				var stashedActiveBlockTableCell = stashedActiveBlock.mViewInstance.$().up('td');
				setTimeout(function() {
					var currentlyActiveBlock = globalEditorController().mActiveBlock;
					if (currentlyActiveBlock.mViewInstance.$().up('td') != stashedActiveBlockTableCell) {
						var options = (inMessage == CC.Keyboard.NOTIFICATION_DID_KEYBOARD_LEFT || inMessage == CC.Keyboard.NOTIFICATION_DID_KEYBOARD_UP) ? {'moveToStart': true} : {'moveToEnd': true};
						globalEditorController().startEditing(stashedActiveBlock, options);
					}
				}, 10);
				return true;
		}
		return false;
	},
	// Configures and presents the inline table popup meny over a header cell.
	handleInlineTableMenuButtonMouseDown: function(inEvent) {
		if (!this.isEditable()) return;
		tableBlockDelegate().configureAndShowTablePopup(inEvent.findElement('td'), this.mContent);
	},
	// Handles click events in an individual table data cell.
	handleTableCellClick: function(inEvent) {
		if (!this.isEditable()) return;
		Event.stop(inEvent);
		var cell = inEvent.findElement('td');
		var rowIdx = CC.WikiEditor.TableBlockHelpers.rowForTableCell(cell);
		var colIdx = CC.WikiEditor.TableBlockHelpers.columnForTableCell(cell);
		this._activate(rowIdx, colIdx, true);
	},
	// Handles mouse down events in an individual cell.
	handleTableCellMouseDown: function(inEvent) {
		if (Event.element(inEvent).tagName.toLowerCase() != 'td') return true;
		this.handleTableCellClick(inEvent);
	},
	// Row and column resize support. Allows inline resizing of rows and columns by dragging
	// a hidden handle left/right or up/down. The new row/column widths are applied right away,
	// but the adjusted dimensions are not persisted to the table block extended attributes until
	// the table block is deactivated.
	mResizeGesture: null,
	handleResizeTableRowColumnMouseDown: function(inEvent) {
		if (!this.isEditable()) return;
		Event.stop(inEvent);
		Event.observe(window, 'mousemove', this.handleWindowMouseMove);
		Event.observe(window, 'mouseup', this.handleWindowMouseUp);
		// Cache any resize gesture information.
		var anchor = inEvent.findElement('.resize');
		var root = inEvent.findElement('.reserved.header');
		var sizer = root.down('img.sizer');
		var table = root.up('table');
		this.mResizeGesture = {
			'anchor': anchor,
			'root': root,
			'sizer': sizer,
			'table': table,
			'isColumn': root.hasClassName('col'),
			'startPosition': {'x': inEvent.pointerX(), 'y': inEvent.pointerY()},
			'startDimensions': sizer.getDimensions()
		};
		this.$().addClassName('resizing');
	},
	handleWindowMouseMove: function(inEvent) {
		var start = this.mResizeGesture.startPosition;
		var column = this.mResizeGesture.isColumn;
		// Calculate a delta value from the original mouse down position.
		var delta = (column ? (inEvent.pointerX() - start.x) : (inEvent.pointerY() - start.y));
		// Tables with a width less than the width of the page are centered, therefore the delta
		// value needs to be compensated (doubled).
		if (column && (this.$('table').getWidth() <= this.$('.wrapper').getWidth())) delta = delta * 2;
		// Calculate the new height/width of the row/column.
		if (column) {
			this.handleTableColumnHeaderWidthChanged(this.mResizeGesture.root, (this.mResizeGesture.startDimensions.width + delta));
		} else {
			this.handleTableRowHeaderHeightChanged(this.mResizeGesture.root, (this.mResizeGesture.startDimensions.height + delta));
		}
	},
	handleWindowMouseUp: function(inEvent) {
		Event.stopObserving(window, 'mousemove', this.handleWindowMouseMove);
		Event.stopObserving(window, 'mouseup', this.handleWindowMouseUp);
		this.mResizeGesture = null;
		this.$().removeClassName('resizing');
		this.mSizedManually = true;
		globalNotificationCenter().publish(CC.WikiEditor.NOTIFICATION_TABLE_DID_CHANGE, this.mContent);
	},
	handleTableHeightChanged: function(inElement, inNewHeight) {
		// 9421864
		var rowHeaders = this.mCachedRowHeaderCells, rowHeader, rowHeaderHeight;
		for (var rowHeaderIdx = 0; rowHeaderIdx < rowHeaders.length; rowHeaderIdx++) {
			rowHeader = rowHeaders[rowHeaderIdx];
			this.handleTableRowHeaderHeightChanged(rowHeader, (rowHeader.getHeight() - 1));
		}
	},
	handleTableColumnHeaderWidthChanged: function(inElement, inNewWidth) {
		var newColumnWidth = Math.max(inNewWidth, this.mMinimumColumnWidth);
		inElement.setAttribute('width', newColumnWidth + 'px');
		inElement.down('img.sizer').setAttribute('width', newColumnWidth + 'px');
	},
	handleTableRowHeaderHeightChanged: function(inElement, inNewHeight) {
		var row = inElement.up("tr");
		var cellChildren = row.select("td:not(.header) > div");
		var maxCellHeight = cellChildren.max(function(child) { return (child.getHeight() + 4 + 1)}) || 0;
		var newRowHeight = Math.max(Math.max(inNewHeight, maxCellHeight), this.mMinimumRowHeight);
		inElement.setAttribute('height', newRowHeight + 'px');
		inElement.down('img.sizer').setAttribute('height', newRowHeight + 'px');
	},
	handleDisplayAltControlsClicked: function(inEvent) {
		// First hide any already-displayed controls.
		var allControls = this.$().select('.table.alt.controls');
		allControls.invoke('removeClassName', 'displaying');
		// Next display the controls just invoked and prepare a mask element behind the popup we'll
		// use for dismissing it.
		var controls = inEvent.findElement('.table.alt.controls');
		controls.addClassName('displaying');
		var mask = this.$().down('.mask');
		bindEventListeners(this, ['handleTableMaskClicked']);
		Event.observe(mask, 'click', this.handleTableMaskClicked);
		mask.show();
	},
	handleTableMaskClicked: function(inEvent) {
		var controls = this.$().select('.table.alt.controls');
		controls.invoke('removeClassName', 'displaying');
		Event.element(inEvent).hide();
	},
	handleAltTablePopupAddRowClicked: function(inEvent) {
		Event.stop(inEvent);
		this.addRow();
	},
	handleAltTablePopupRemoveRowClicked: function(inEvent) {
		Event.stop(inEvent);
		this.removeRow(undefined, true);
	},
	handleAltTablePopupAddColumnClicked: function(inEvent) {
		Event.stop(inEvent);
		this.addColumn();
	},
	handleAltTablePopupRemoveColumnClicked: function(inEvent) {
		Event.stop(inEvent);
		this.removeColumn(undefined, true);
	}
});

CC.WikiEditor.TableBlockToolbar = Class.create(CC.WikiEditor.BlockToolbar, {
	mToolbarItems: [
		new CC.WikiEditor.EditorToolbarItem({
			mDisplayTitle: "_Editor.Block.Table.Toolbar.Settings.Title".loc(),
			mTooltip: "_Editor.Block.Table.Toolbar.Settings.Tooltip".loc(),
			mKey: 'settings',
			mAction: 'showSettingsDialog'
		})
	]
});

globalEditorPluginManager().registerBlockType('table', 'CC.WikiEditor.TableBlock', {
	mEditorToolbarItem: new CC.WikiEditor.EditorToolbarItem({
		mDisplayTitle: "_Editor.Block.Table.Toolbar.Title".loc(),
		mTooltip: "_Editor.Block.Table.Toolbar.Tooltip".loc(),
		mIsEnabled: true,
		mKey: 'table',
		mAction: 'addBlock',
		mTarget: tableBlockDelegate()
	}),
	mBlockToolbar: 'CC.WikiEditor.TableBlockToolbar'
});
