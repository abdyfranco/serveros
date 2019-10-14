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

CC.AvatarEditorView = Class.create(CC.Mvc.View, {
	initialize: function($super, inType) {
		$super();
		this.entityType = inType;
	},
	render: function() {
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_APPEARANCE_PARAMS);
		return Builder.node('div', {className:"cc-avatar-editor"}, [
			Builder.node('div', {className:"cc-avatar-preview default %@".fmt((this.entityType == 'people') ? 'user' : 'project')} ),
			Builder.node('div', {className:"cc-avatar-controls"}, [
				Builder.node('input', {'tabindex': tabIndex, 'role': 'button', 'aria-label': "_Accessibility.Button.UploadImage".loc(), type: 'button', value: "_Settings.Avatar.UploadButton".loc(), className:"cc-avatar-upload-button"}),
				Builder.node('input', {'tabindex': tabIndex, 'role': 'button', 'aria-label': "_Accessibility.Button.DeleteImage".loc(), type: 'button', value: "_Settings.Avatar.DeleteButton".loc(), className:"cc-avatar-delete-button"})
			])
		]);
	}
});

CC.AvatarEditor = Class.create({
	
	initialize: function(element, guid, is_avatar, skipDefaultACLs) {
		this.element = $(element);
		this.skipDefaultACLs = (skipDefaultACLs != undefined) ? skipDefaultACLs : false;
		this.is_avatar = is_avatar;
		
		var upButton = this.element.down('.cc-avatar-upload-button');
		if (upButton) upButton.on('click', this.onUploadButtonClick.bindAsEventListener(this));
		
		var delButton = this.element.down('.cc-avatar-delete-button');
		if (delButton) delButton.on('click', this.onRemoveButtonClick.bindAsEventListener(this));
		
		this.file_guid = (guid && guid != '') ? guid : null;
		
		this.updateElementState();
	},
	clear: function() {
		this.file_guid = null;
		this.updateElementState();
		dialogManager().hide();
	},
	buildPreviewURLForDataGUID: function(guid) {
		if (guid == null || guid == '') return;
		var url = "#{prefix}/files/download/#{guid}".interpolate({
			prefix: env().root_path,
			guid: guid
		});
		return url;
	},
	updateElementState: function() {
		var preview = this.element.down('.cc-avatar-preview');
		(this.file_guid) ? preview.removeClassName('default') : preview.addClassName('default');
		var uploadButton = this.element.down('.cc-avatar-upload-button');
		if (uploadButton) uploadButton.value = (this.file_guid) ? "_AvatarEditor.Replace".loc() : "_AvatarEditor.Upload".loc();
		preview.removeAttribute('style');
		var url = this.buildPreviewURLForDataGUID(this.file_guid);
		if (url) {
			// Preload the image and center it using background-size.
			var img = new Image();
			img.onload = function() {
				var ratio = (img.height / img.width);
				var width = Math.min(img.width, 44);
				var height = Math.ceil(44 * ratio);
				preview.style.backgroundImage = "url(%@)".fmt(url);
				preview.style.backgroundSize = "%@px %@px".fmt(width, height);
				preview.style.backgroundPosition = "center center";
			};
			img.src = url;
		}
		var button = this.element.down('.cc-avatar-delete-button');
		if (button) {
			(this.file_guid) ? button.show() : button.hide();
		}
	},
	onUploadButtonClick: function(e) {
		e.stop();
		fileUploadManager().createUploadPanel(undefined, undefined, { 
			'complete': { callback: 'onUploadSuccess', target: this },
			'error': { callback: 'onUploadFailure', target: this }
		}, true, this.is_avatar, this.skipDefaultACLs);
	},
	onUploadSuccess: function(inResponse) {
		var file_entity = (inResponse && inResponse["fileEntity"]);
		if (file_entity) {
			this.file_guid = file_entity.guid;
			this.updateElementState();
		}
	},
	onUploadFailure: function(err) {
		alert("_AvatarEditor.UploadFailed".loc());
		this.clear();
	},
	
	onRemoveButtonClick: function(e) {
		e.stop();
		this.clear();
	}
	
});