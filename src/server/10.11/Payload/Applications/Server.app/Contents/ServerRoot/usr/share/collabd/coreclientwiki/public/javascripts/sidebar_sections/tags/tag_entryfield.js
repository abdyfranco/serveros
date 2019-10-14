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

CC.TagEntryfield = Class.create({
	
	initialize: function(element) {
		this.element = $(element);
		
		var randomID = "cc-menu-autocomplete-%@".fmt(buildRandomString(5));
		this.choices = Builder.node('ul', {'id': randomID, 'className': 'cc-menu-autocomplete cc-tagger-autocomplete-menu'});
		this.choices.hide();
		document.body.appendChild(this.choices);
		
		this.input = this.element.down('input');
		
		this.autocompleteurl = this.element.getDataAttributes().autocompleteurl;
		if (this.autocompleteurl) {
			this.tagfield = new TagSearchField(this.input, {
				mSearchPath: this.autocompleteurl,
				mResultTable: this.choices,
				mClickedItemCallback: this.handleItemClick.bind(this)
			});
		}
		
		this.input.observe('keydown', this.handleKeyboardEvent.bind(this));
	},
	
	handleItemClick: function(inDisplayString, inOptURL) {
		this.clear();
		this.element.fire('item:autocomplete', {'name': inDisplayString});
	},
	
	handleKeyboardEvent: function(evt) {
		evt.stopPropagation();
		if (evt.keyCode == Event.KEY_COMMA) {
			// #7772586
			this.enter();
			this.clear.bind(this).defer();
		}
		else if (evt.keyCode == Event.KEY_RETURN || evt.keyCode == Event.KEY_TAB) {
			this.enter();
			this.focus.bind(this).defer();
		}
		return true;
	},

	enter: function() {
		if (!this.isEmpty()) {
			var params = { name: this.getValue() };
			this.clear();
			this.element.fire('item:autocomplete', params);
		}
	},
	getValue: function() {
		return this.input.value.strip();
	},
	isEmpty: function() {
		return this.getValue().length === 0;
	},
	focus: function() {
		this.input.focus();
	},
	clear: function() {
		this.input.value = '';
		if (this.tagfield && this.tagfield.mResultTable) this.tagfield.mResultTable.hide();
	}

});