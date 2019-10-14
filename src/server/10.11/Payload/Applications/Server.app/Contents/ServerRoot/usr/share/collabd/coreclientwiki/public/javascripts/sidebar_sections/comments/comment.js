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

CC.Comment = Class.create({

	initialize: function(element) {
		this.element = $(element);
		this.element.on('click', this.onElementClick.bindAsEventListener(this));
		var deleteBtn = this.element.down('.button.delete');
		if (deleteBtn) deleteBtn.on('click', this.onDeleteButtonClick.bindAsEventListener(this));
		var approveBtn = this.element.down('.button.approve');
		if (approveBtn) approveBtn.on('click', this.onApproveButtonClick.bindAsEventListener(this));
	},
	
	onElementClick: function(e) {
		this.element.removeClassName('unread');
		this.element.fire('item:read', this);
	},
	onDeleteButtonClick: function(e) {
		e.stop();
		this.element.fire('item:delete', this);
	},
	onApproveButtonClick: function(e) {
		e.stop();
		this.element.fire('item:approve', this);
	},
	
	serialize: function() {
		return this.element.getDataAttributes();
	}

});

