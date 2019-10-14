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

CC.Collection = Class.create({
	
	itemClass: null,
	itemSelector: null,
	itemInsertionPoint: 'bottom',
	
	initialize: function(element) {
		this.element = $(element);
		if (this.itemClass && this.itemSelector) {
			this._items = this.element.select(this.itemSelector).map(function(e){ 
				var item = new (this.itemClass)(e);
				item.collection = this;
				return item;
			}, this);
		} else {
			this._items = [];
		}
		this._selection = [];
	},
	
	
	isValidItem: function(item) {
		return !!item && !!item.element && (item instanceof this.itemClass);
	},
	
	getItemForElement: function(element) {
		return this.getItems().find(function(item) { return item.element == element; });
	},
	getItems: function() {
		return this._items;
	},
	setItems: function(items) {
		return this._items = items;
	},
	
	isMember: function(item) {
		return !!item && this.getItems().include(item);
	},
	add: function(item) {
		if (!this.isValidItem(item)) return false;
		if (this.isMember(item)) return false;
		item.collection = this;
		// insert into the items array
		this.getItems().push(item);
		// insert into the DOM
		var insertion = {};
		insertion[this.itemInsertionPoint] = item.element;
		this.element.insert(insertion);
		// notify
		this.element.fire('item:added', item);
		return item;
	},
	remove: function(item) {
		if (!this.isMember(item)) return false;
		this.deselect(item);
		item.element.remove();
		item.collection = undefined;
		this.setItems(this.getItems().without(item));
		this.element.fire('item:removed', item);
		return item;
	},
	removeSelection: function() {
		this.getSelection().clone().each(function(i) { this.remove(i); }, this);
	},
	removeIndex: function(i) {
		var item = this._items[i];
		this.remove(item);
		this.element.fire('item:removed', item);
		return item;
	},
	
	getSelection: function() {
		return this._selection;
	},
	setSelection: function(items) {
		return this._selection = items;
	},
	hasSelection: function() {
		return this._selection.length > 0;
	},
	isSelected: function(item) {
		return this.getSelection().include(item);
	},
	
	select: function(item) {
		if (!this.isMember(item) || this.isSelected(item)) return false;
		this.getSelection().push(item);
		item.element.addClassName('selected');
		if (item.select) {
			item.select();
		}
		return true;
	},
	selectAll: function() {
		this.getItems().clone().each(function(i) { this.select(i); }, this);
	},
	
	deselect: function(item) {
		if (!this.isMember(item) || !this.isSelected(item)) return false;
		this.setSelection(this.getSelection().without(item));
		item.element.removeClassName('selected');
		if (item.deselect) {
			item.deselect();
		}
		return true;
	},
	deselectAll: function() {
		this.getSelection().clone().each(function(i) { this.deselect(i); }, this);
	}

});