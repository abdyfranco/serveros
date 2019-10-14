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

//= require "./core.js"

var FileUploadPanel = Class.createWithSharedInstance('fileUploadManager');
FileUploadPanel.prototype = {
	fileDialog: null,
	chosenFile: null,
	existingFilesList: [],
	callbacks: [],
	initialize: function() {},
	createUploadPanel: function(inOptUpdateGUID, inOptOwnerGUID, inOptCallbacks, inOptHideFileOnUpload, inOptIsAvatar, inOptSkipDefaultACLs) {
		if (inOptCallbacks != undefined) {
			this.callbacks = inOptCallbacks;
		} else {
			this.callbacks = {};
		}
		document.body.appendChild(Builder.node('iframe', {
			name: 'upload_iframe',
			id: 'upload_iframe',
			src: '',
			style: 'position:absolute;top:-10000px;left:-10000px;width:0px;height:0px;border:10px'
		}));
		$('upload_iframe').show();
		
		var existing = $('upload_file_dialog');
		if (existing) Element.remove(existing);
		var formAction = "/wiki/files/upload";
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_UPLOAD_FILE_TO_DOCUMENTS);
		dialogManager().drawDialog('upload_file_dialog', [
			{label: "_Files.Upload.Dialog.Label".loc(), contents: '<input aria-label="' + "_Accessibility.Dialog.UploadFile".loc() + '" tabindex="' + tabIndex + '" role="menuitem" type="file" id="fileChooser" name="filedata" class="cc-file-upload"/>' +
				'<input type="hidden" name="updateGUID" id="updateGUID" value="%@"/>'.fmt(inOptUpdateGUID ? inOptUpdateGUID : "0") +
				'<input type="hidden" name="isHidden" value="%@"/>'.fmt((inOptHideFileOnUpload == true)) +
				'<input type="hidden" name="isAvatar" value="%@"/>'.fmt((inOptIsAvatar == true)) +
				'<input type="hidden" name="skipDefaultACLs" value="%@"/>'.fmt((inOptSkipDefaultACLs == true)) + 
				(inOptOwnerGUID ? '<input type="hidden" name="ownerGUID" id="ownerGUID" value="%@"/>'.fmt(inOptOwnerGUID) : '')
			}
		], "_Files.Upload.Dialog.OK".loc(), formAction, "_Files.Upload.Dialog.Title".loc(), "_Dialogs.Cancel".loc());
		dialogManager().show('upload_file_dialog', this.handleUploadPanelCancel.bind(this), this.handleUploadPanelOK.bind(this));		
		$('upload_file_dialog_ok').focus();
	},
	handleUploadPanelOK: function(inEvent) {
		var fileChooser = $$('.cc-file-upload')[0];
	    if (fileChooser && fileChooser.value.length == 0 )
	        return;
		this.startUpload();
		dialogManager().showProgressMessage("_Files.Progress.Uploading".loc(), false, this.handleProgressPanelCancel.bind(this));
	},
	handleUploadPanelCancel: function(inEvent) {
		
	},
	handleProgressPanelCancel: function(inEvent) {
		$('upload_iframe').remove();
		dialogManager().hideProgressMessage();
	},
	startUpload: function() {
		var form = document.forms.upload_file_dialog_form;
		
		// get an action token, inject it into the form before submitting
		// adding a timestamp to the get request to avoid Ajax known caching issue (makes each request unique)
		var req = new Ajax.Request(form.action + '?timestamp='+(new Date().getTime()), { 
			method: 'GET',
			onSuccess: function(response) {
				var token = response.getHeader('X-Apple-Action-Token');
				if (token)
				{
					var el = document.createElement('input');
					el.type = 'hidden';
					el.name = 'actionToken';
					el.value = token;
					form.appendChild(el);
				}
				
				form.submit();
			},
			onFailure: function() {
				form.submit();
			}
		});
	},
	
	// callbacks
	uploadComplete: function(fileDataObject) {
		// create a new com.apple.entity.File object
		var updateGUID = fileDataObject['updateGUID'];
		var fileDataGUID = fileDataObject['fileGUID'];
		
		// CONSIDER: Do we need both of these? Or can we just listen for notifications?
		// I think both is good. When you want to redirect to a new page, or do something big, use a callback
		// when you just want to update something when the upload is done, use notifications
		
		// Fire an upload complete callback, if we have it.
		var callbacks = this.callbacks;
		if (callbacks && callbacks['complete']) {
			var callback = callbacks['complete'];
			(callback.target || window)[callback.callback](fileDataObject);
		}
		globalNotificationCenter().publish("FILE_UPLOAD_DID_SUCCEED", this, fileDataObject);
		
		//$('upload_iframe').hide();
		//$('upload_iframe').remove();
		
		// oldDialogManager().destroyDialog();
		
		dialogManager().hide();
		
	},
	uploadError: function(errorObject) {
		var errorString = errorObject['errorString'];
		
		var uploadErrorText = Builder.node("div", {className:"upload_error"}, [
			Builder.node("div", {className:"label"}, "Upload Error"),
			Builder.node("div", {className:"error_string"}, errorString)
		]);
		
		// oldDialogManager().updateDialog(uploadErrorText);
		// oldDialogManager().enableCancelButton();
		// Fire an upload error callback, if we have it.
		var callbacks = this.callbacks;
		if (callbacks && callbacks['error']) {
			var callback = callbacks['error'];
			(callback.target || window)[callback.callback](errorObject);
		}
		// broadcast a message
		globalNotificationCenter().publish("FILE_UPLOAD_DID_ERROR", this, errorObject);
		dialogManager().hide();
	},
	
	// **** New File
	uploadNewFileInContainerGUID: function(inContainerGUID) {
		this.createUploadPanel(undefined, inContainerGUID, {'complete':{callback:'uploadNewFileCallback', target:this}, 'error': {callback: 'uploadNewFileErrback', target: this}});
	},
	uploadNewFileCallback: function(fileEntityObject) {		
		// Redirect to the new File url
		var url;
		url = window.location.protocol + '//' + window.location.host + env().root_path + '/files/' + fileEntityObject['fileTinyID'];			
		window.location.href = url;
	},
	uploadNewFileErrback: function(inError) {
		notifier().printErrorMessage("File could not be uploaded. Please try again.");
	},
	
	//**** Update File
	updateFile: function() {
		var updateGUID = CC.meta('x-apple-entity-guid');
		if (!updateGUID) { 
			logger().warn("Unable to get the file guid we are supposed to be updating");
			return; 
		}
		this.createUploadPanel(updateGUID, undefined, {'complete':{callback:'updateFileCallback', target:this}, 'error': {callback: 'updateFileErrback', target: this}});
	},
	//**** Update File for a given guid
	updateFileWithGUID: function(guid) {
		if (!guid) { 
			logger().warn("Unable to get the file guid we are supposed to be updating");
			return; 
		}
		this.createUploadPanel(guid, undefined, {'complete':{callback:'updateFileCallback', target:this}, 'error': {callback: 'updateFileErrback', target: this}});
	},	
	updateFileCallback: function(fileEntityObject) {
		window.location.reload();
	},
	updateFileErrback: function(inError) {
		notifier().printErrorMessage("File could not be updated. Please try again.");
	}
	
};
