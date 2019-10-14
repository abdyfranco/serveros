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

CC.Tag = Class.create({

	initialize: function(element) {
		this.element = $(element);
		this.element.on('click', this.onElementClick.bindAsEventListener(this));			
		if(CC.meta('x-apple-user-can-write') == 'true') {
			var button = new Element('a', { className: 'button delete' }).update('Delete');
			button.on('click', this.onDeleteClick.bindAsEventListener(this));
			this.element.insert(button);
		}
	},
	
	onElementClick: function(e) {
		this.element.fire('item:triggered', this);
	},
	onDeleteClick: function(e) {
		e.stop();
		this.element.fire('item:delete', this);
	},
	
	serialize: function() {
		return this.element.getDataAttributes();
	}

});

CC.Tag.create = function(params) {
	var tagItemCollection = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_TAGS_COLLECTION);
	var name = params.name.escapeHTML() || '';
	var element = new Element('li', { className: 'cc-tag' }).insert("<a href='#' role='menuitem' tabindex='" + tagItemCollection + "'>"+ name +"</a>").setDataAttributes(params);
	return new CC.Tag(element);
};
