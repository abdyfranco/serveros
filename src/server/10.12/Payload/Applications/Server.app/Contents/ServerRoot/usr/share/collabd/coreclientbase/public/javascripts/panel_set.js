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

//= require "core.js"
//= require "./mvc/mvc.js"

// A view that behaves as a panel inside a panel set.

CC.PanelView = Class.create(CC.Mvc.View, {
	getParent: function() {
		return this._parent;
	},
	setParent: function(parent) {
		this._parent = parent;
	},
	select: function() {
		this.getParent().select(this);
	},
	isSelected: function() {
		return (this.getParent().selected() == this);
	},
	setVisible: function($super, inShouldBeVisible) {
		$super(inShouldBeVisible);
		var field = this.$().down('input[type="text"], textarea');
		if (field) field.focus();
	}
});

// A class for a set of ordered views (that include the CC.PanelMixin mixin).

CC.PanelSet = Class.create({
	_panels: null,
	_selected: null,
	initialize: function() {
		this._panels = [];
	},
	add: function(panel) {
		panel.setParent(this);
		this._panels.push(panel);
	},
	remove: function(panel) {
		panel.setParent(null);
		this._panels = this._panels.without(panel);
	},
	select: function(panel) {
		this._panels.each(function(p) {
			p.setVisible(p == panel);
		});
		this._selected = panel;
	},
	first: function() { return this._panels.first(); },
	last: function() { return this._panels.last(); },
	all: function() { return this._panels; },
	selected: function() { return this._selected; },
	previous: function() { return this._selectedOffset(-1); },
	next: function() { return this._selectedOffset(1); },
	itemAtIndex: function(idx) { return this._panels[idx]; },
	_selectedOffset: function(offset) {
		var firstIdx  = 0;
		var lastIdx   = this._panels.length - 1;
		var offsetIdx = this._panels.indexOf(this.selected()) + offset;
		if (offsetIdx < firstIdx) {
			offsetIdx = lastIdx;
		} else if (offsetIdx > lastIdx) {
			offsetIdx = firstIdx;
		}
		return this._panels[offsetIdx];
	}
});
