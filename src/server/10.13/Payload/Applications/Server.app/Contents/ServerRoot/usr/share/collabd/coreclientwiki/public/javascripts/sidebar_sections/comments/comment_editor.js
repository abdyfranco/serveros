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

CC.CommentEditor = Class.create({
	
	initialize: function(element) {
		this.element = $(element);
		this.element.down('.add').on('click', this.onOpenButtonClick.bindAsEventListener(this));
		this.element.down('.cancel').on('click', this.onCancelButtonClick.bindAsEventListener(this));
		this.element.down('.save').on('click', this.onSaveButtonClick.bindAsEventListener(this));
		this.textarea = this.element.down('.body textarea');
		Element.observe(this.textarea, 'keydown', function(e) {
			e.stopPropagation();
		});
		Element.observe(this.textarea, 'keyup', this.autogrow.bind(this));
	},
	
	onOpenButtonClick: function(e) {	
		// Remove tabindex for Add button and generate tabindex for save and cancel button
		var tabIndexComment = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_COMMENTS);
		var add = this.element.querySelector('a.add');
		var save = this.element.querySelector('a.save');
		var cancel = this.element.querySelector('a.cancel');
		add.writeAttribute('tabindex', '-1');
		save.writeAttribute('tabindex', ++tabIndexComment);
		cancel.writeAttribute('tabindex', ++tabIndexComment);
						
		e.stop();
		this.open();
	},
	onCancelButtonClick: function(e) {
		// Remove tabindex for Save and Cancel button to avoid tab on hidden items
		var tabIndexComment = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_COMMENTS);
		var add = this.element.querySelector('a.add');
		var save = this.element.querySelector('a.save');
		var cancel = this.element.querySelector('a.cancel');
		add.writeAttribute('tabindex', ++tabIndexComment);
		save.writeAttribute('tabindex', '-1');
		cancel.writeAttribute('tabindex', '-1');
				
		e.stop();
		this.close();
	},
	onSaveButtonClick: function(e) {
		// Remove tabindex for Save and Cancel button to avoid tab on hidden items
		var tabIndexComment = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_COMMENTS);
		var add = this.element.querySelector('a.add');
		var save = this.element.querySelector('a.save');
		var cancel = this.element.querySelector('a.cancel');
		add.writeAttribute('tabindex', ++tabIndexComment);
		save.writeAttribute('tabindex', '-1');
		cancel.writeAttribute('tabindex', '-1');
		
		e.stop();
		this.save();
	},
	
	open: function() {
		this.element.up('.cc-sidebar-section').addClassName('editing');
		this.element.addClassName('editing');
		this.textarea.focus();
	},
	close: function() {
		this.clear();
		this.element.up('.cc-sidebar-section').removeClassName('editing');
		this.element.removeClassName('editing');
	},
	clear: function() {
		this.textarea.value = '';
	},
	save: function() {
		var comment = {
			entityGUID: CC.meta('x-apple-parent-guid'),
			body: $F(this.textarea)
		};
		this.element.fire('item:save', comment);
		this.close();
	},
	// set the height to the scrollHeight
	autogrow: function(inEvent) {
		var currentHeight = this.textarea.scrollHeight;
		if (currentHeight != this.cachedHeight) {
			this.textarea.style.height = currentHeight+'px';
			this.cachedHeight = currentHeight
		}
	}
	
});