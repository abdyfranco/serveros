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

CC.TagEditor = Class.create({
	
	initialize: function(element) {
		this.element = $(element);
		
		this.tag_collection = new CC.TagCollection(this.element.down('.cc-tag-collection'));
		this.tag_entryfield = new CC.TagEntryfield(this.element.down('.cc-tag-entryfield'));
		
		this.element.down('.cc-sidebar-actions .button.add').on('click', this.onAddButtonClick.bindAsEventListener(this));
		this.element.down('.cc-sidebar-actions .button.cancel').on('click', this.onCancelButtonClick.bindAsEventListener(this));
		this.element.down('.cc-sidebar-actions .button.save').on('click', this.onSaveButtonClick.bindAsEventListener(this));
		
		this.element.on('item:autocomplete', this.onItemAutocomplete.bindAsEventListener(this));
		this.element.on('item:delete', this.onItemDelete.bindAsEventListener(this));
		
		this.showOrHideEmptyMessage();
	},
	
	onAddButtonClick: function(e) {
		var tagItemSidebarTextBox = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_TAGS_TEXTBOX);
		this.element.querySelector('input').writeAttribute('tabindex', tagItemSidebarTextBox); // Update text box tabindex
		// Remove tabindex for Add button and generate tabindex for save and cancel button
		var tagItemSidebar = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_TAGS);
		var add = this.element.querySelector('a.add');
		var save = this.element.querySelector('a.save');
		var cancel = this.element.querySelector('a.cancel');
		add.writeAttribute('tabindex', '-1');
		save.writeAttribute('tabindex', ++tagItemSidebar);
		cancel.writeAttribute('tabindex', ++tagItemSidebar);
		
		e.stop();
		this.open();
	},
	onCancelButtonClick: function(e) {
		this.element.querySelector('input').writeAttribute('tabindex', '-1'); // Update text box tabindex
		// Remove tabindex for Save and Cancel button to avoid tab on hidden items
		var tagItemSidebar = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_TAGS);
		var add = this.element.querySelector('a.add');
		var save = this.element.querySelector('a.save');
		var cancel = this.element.querySelector('a.cancel');
		add.writeAttribute('tabindex', ++tagItemSidebar);
		save.writeAttribute('tabindex', '-1');
		cancel.writeAttribute('tabindex', '-1');
		
		e.stop();
		this.close();
	},
	onSaveButtonClick: function(e) {
		this.element.querySelector('input').writeAttribute('tabindex', '-1'); // Update text box tabindex
		// Remove tabindex for Save and Cancel button to avoid tab on hidden items
		var tagItemSidebar = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_TAGS);
		var add = this.element.querySelector('a.add');
		var save = this.element.querySelector('a.save');
		var cancel = this.element.querySelector('a.cancel');
		add.writeAttribute('tabindex', '-1');
		save.writeAttribute('tabindex', ++tagItemSidebar);
		cancel.writeAttribute('tabindex', ++tagItemSidebar);
		
		e.stop();
		this.tag_entryfield.enter();
		this.close();
	},
	
	onItemAutocomplete: function(e) {
		e.stop();
		var params = e.memo;
		if (!params.name.match(/\S/)) {
			logger().warn("Can't save an empty tag");
			return;
		}
		var serialized_tags = this.tag_collection.getItems().map(function(t){ return t.serialize(); });
		var matching_tags = serialized_tags.find(function(h){ return h.name == params.name; });
		if (!matching_tags) {
			this.tag_collection.add(CC.Tag.create(e.memo));
		}
		this.showOrHideEmptyMessage();
	},
	onItemDelete: function(e) {
		e.stop();
		smokey().showOverElement(e.memo.element);
		this.tag_collection.remove(e.memo);
		this.showOrHideEmptyMessage();
	},
	
	open: function() {
		this.element.up('.cc-sidebar-section').addClassName('editing');		
		this.element.addClassName('editing');
		this.tag_entryfield.focus();
	},
	close: function() {
		var save = this.element.querySelector('a.save');
		var cancel = this.element.querySelector('a.cancel');
		save.writeAttribute('tabindex', '-1');
		cancel.writeAttribute('tabindex', '-1');
		this.element.up('.cc-sidebar-section').removeClassName('editing');
		this.element.removeClassName('editing');
	},
	
	showOrHideEmptyMessage: function() {
		var element = this.element.down('.cc-tag-empty-message');
		(this.tag_collection.getItems().length > 0) ? element.hide() : element.show();
	}
	
	
});