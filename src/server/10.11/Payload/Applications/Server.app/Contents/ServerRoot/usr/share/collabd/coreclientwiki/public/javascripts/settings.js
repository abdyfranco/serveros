// Copyright (c) 2009-2015 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

//= require "./theme_chooser.js"

function mapTypeToURL(inType) {
	typeURLMap = {
		'com.apple.entity.Wiki': 'projects',
		'com.apple.entity.User': 'people'
	};
	return typeURLMap[inType];
};

function openSetting(id) {
	$$('#settings-menu ul li > a').each(function(menu) {
		Element.extend(menu);
		menu.up().removeClassName('active');
		if (menu.readAttribute('name') == id) {
			menu.up().addClassName('active');
		}
	});
	$$('.settings-section').each(function(section) {
		Element.extend(section);
		section.removeClassName('showing');
	});
	$(id).addClassName('showing');
};

var SettingsController = Class.create({
	initialize: function(inEntity, inOptBlogEntity) {
		this.mParentElement = $('settings');
		if (!this.mParentElement || !inEntity) return false;
		this.entity = inEntity;
		this.blogEntity = inOptBlogEntity;
		this.entityGUID = inEntity.guid;
		this.entityType = inEntity.type;
		var acls_element = this.mParentElement.down('.cc-access-editor-view');
		if (acls_element) {
			// Get the GUID we're using for ACLs. For a wiki this is unnecessary but for a user we actually display
			// the blog acls.
			var aclEntity = this.entity;
			var acls = aclEntity.acls;
			// Are we actually displaying ACLs for the blog entity for a user? The default ACLs for a blog are world-readable.
			var aclsGUID = (inEntity.type == 'com.apple.entity.Wiki') ? this.entityGUID : this.blogEntity.guid;
			if (aclsGUID != this.entityGUID) {
				if (this.blogEntity) {
					aclEntity = this.blogEntity;
					acls = (aclEntity.acls) ? aclEntity.acls : [];
				}
			}
			if (aclEntity && aclEntity.type == 'com.apple.entity.Blog' && acls && acls.length == 0) {
				var defaultAllUsers = CC.deepClone(CC.AccessEditor.DefaultAllUsersACL);
				defaultAllUsers['action'] = 'read';
				var defaultLoggedInUsers = CC.deepClone(CC.AccessEditor.DefaultLoggedInUsersACL);
				defaultLoggedInUsers['action'] = 'read';
				this.access_editor = new CC.AccessEditorView(acls, false, aclsGUID, defaultAllUsers, defaultLoggedInUsers);
			} else {
				this.access_editor = new CC.AccessEditorView(acls, false, aclsGUID);
			}
			this.access_editor._render();
			acls_element.appendChild(this.access_editor.$());
		}
		var avatar_element = this.mParentElement.down('.cc-avatar-editor');
		if (avatar_element) {
			this.avatar_editor = new CC.AvatarEditor(avatar_element, this.entity['avatarGUID'], true);
		}
		var swatches = this.mParentElement.getElementsByClassName('theme_swatch');
		var themeInfo = this.entity.themeInfo;
		var splitThemeInfo = (themeInfo || "").split(',');
		if (splitThemeInfo.length == 0) splitThemeInfo = ['blue', '', ''];
		if (splitThemeInfo[0] == "") splitThemeInfo[0] = 'blue';
		var themeSettings = splitThemeInfo;
		var selectedColor = themeSettings[0];
		$('settings_theme_name').value = selectedColor;
		for (var i = 0; i < swatches.length; i++) {
			swatches[i].on('click', this.changeColor.bind(this, swatches[i]));
			if (swatches[i].getAttribute('data-color') == selectedColor) {
				swatches[i].addClassName('selected');
			}
		}
		var banner_image_element = this.mParentElement.down('.banner_image_editor .cc-avatar-editor');
		if (banner_image_element) {
			this.banner_image_editor = new CC.AvatarEditor(banner_image_element, themeSettings[1], false, true);
		}
		var background_image_element = this.mParentElement.down('.background_image_editor .cc-avatar-editor');
		if (background_image_element) {
			this.background_image_editor = new CC.AvatarEditor(background_image_element, themeSettings[2], false, true);
		}
		
		// Fill in UI with data from entity
		Form.Element.setValue($('longName'), this.entity.longName);
		if ($('description'))
			Form.Element.setValue($('description'), this.entity.description);
		if ($('settings_services_calendar'))
			Form.Element.setValue($('settings_services_calendar'), this.entity.extendedAttributes.settings.calendar_enabled);
		if ($('settings_preferred_email'))
			Form.Element.setValue($('settings_preferred_email'), this.entity.privateAttributes.preferredEmailAddress);
		if ($('settings_comment_access'))
			Form.Element.setValue($('settings_comment_access'), this.entity.extendedAttributes.settings.comments);
		if ($('settings_comment_moderation'))
			Form.Element.setValue($('settings_comment_moderation'), this.entity.extendedAttributes.settings.commentModeration);
		if ($('settings_send_notification'))
			Form.Element.setValue($('settings_send_notification'), this.entity.extendedAttributes.settings.isNotificationEnabled);
		
		this.saveBtn = this.mParentElement.down('.actions .save');
		this.cancelBtn = this.mParentElement.down('.actions .cancel');
		this.saveBtn.on('click', this.handleSave.bindAsEventListener(this));
		this.cancelBtn.on('click', this.handleCancel.bindAsEventListener(this));
		this.enableButtons();
	},
	enableButtons: function() {
		this.saveBtn.enable();
		this.cancelBtn.enable();
	},
	disableButtons: function() {
		this.saveBtn.disable();
		this.cancelBtn.disable();
	},
	changeColor: function(el) {
		var newTheme = el.getAttribute('data-color');
		$('settings_theme_name').value = newTheme;
		var swatches = this.mParentElement.getElementsByClassName('theme_swatch');
		for (var i = 0; i < swatches.length; i++) {
			swatches[i].removeClassName('selected');
		}
		el.addClassName('selected');
	},
	savedCallback: function() {
		dialogManager().hide();
		this.enableButtons();
		var href = window.location.href;
		var match = href.match(/^(.*)\?showSettings=true/);
		if (match) {
			window.location.href = match[1];
		} else {
			window.location.reload();
		}
	},
	errorCallback: function (err) {
		var acls = this.entity && this.entity.acls;
		var exceptionString = err && err.response && err.response.exceptionString && err.response.exceptionString.split(": ")[1];
		var errorNode = null;
		for (var i = 0; i < acls.length; i++){
			var acl = acls[i];
			var externalGUID = acl.userExternalID.split(":")[1] || acl.userExternalID;
			if(externalGUID == exceptionString) {
				var userLogin = acl.userLogin
				errorNode = this.mParentElement.querySelector("a[userlogin='"+userLogin+"']").parentNode;
			}
		}
		if (errorNode != undefined && errorNode != null) {
			errorNode.style.backgroundColor = "#ffc5cc";
		}
		notifier().printErrorMessage("_Settings.Save.Error.Message".loc());
		dialogManager().hide();
		this.enableButtons();
		logger().error("Error: ", err);
	},
	handleSave: function(e) {
		dialogManager().showProgressMessage("_Settings.Save.Progress.Message".loc());
		this.disableButtons();
		var changes = [];
		var isUserEntity = (this.entity.type == 'com.apple.entity.User');
		$$('div.setting .setting_input').each(function(elem) {
			var elemVal = elem.value;
			var elemID = elem.readAttribute("id");
			if (this.entity[elemID] != elemVal) {
				changes[changes.length] = [elemID, elemVal];
			}
		}, this);
		if (!this.entity['extendedAttributes']) this.entity['extendedAttributes'] = {};
		if (!this.entity['extendedAttributes']['settings']) this.entity['extendedAttributes']['settings'] = {};
		if (!this.entity['privateAttributes']) this.entity['privateAttributes'] = {};
				
		// Avatar settings.
		if (this.avatar_editor) {
			changes.push(['avatarGUID', this.avatar_editor.file_guid]); // #8601188
		}
		// Wiki Theme
		var themeSettings = (this.entity['themeInfo']) ? this.entity['themeInfo'].split(',') : ['blue', '', ''];
		if ($('settings_theme_name')) {
			themeSettings[0] = $F('settings_theme_name');
		}
		// Banner image
		if (this.banner_image_editor) {
			themeSettings[1] = this.banner_image_editor.file_guid || '';
		}
		// Background image
		if (this.background_image_editor) {
			themeSettings[2] = this.background_image_editor.file_guid || '';
		}
		changes.push(['themeInfo', themeSettings.join(',')]);
		
		// Comment moderation.
		if ($('settings_comment_access')) {
			this.entity['extendedAttributes']['settings']['comments'] = $F('settings_comment_access');
		}
		if ($('settings_comment_moderation')) {
			this.entity['extendedAttributes']['settings']['commentModeration'] = $F('settings_comment_moderation');
		}
		var isNotificationEnabled;
		if ($('settings_send_notification')) {		
			this.entity['extendedAttributes']['settings']['settings_send_notification'] = $('settings_send_notification').checked;
		}
		// Profile and services.
		if ($('settings_preferred_email')) {			
			this.entity['privateAttributes']['preferredEmailAddress'] = $F('settings_preferred_email');
		}
		var isBlogEnabled;
		if ($("settings_services_blog")) {
			isBlogEnabled = $('settings_services_blog').checked;
			changes.push(['isBlogEnabled', isBlogEnabled]);
		}
		if ($("settings_services_calendar")) {
			this.entity['extendedAttributes']['settings']['calendar_enabled'] = $('settings_services_calendar').checked;
		}
		// Update the changeset with any extended/private attributes before saving.
		changes.push(['extendedAttributes', this.entity['extendedAttributes']]);
		changes.push(['privateAttributes', this.entity['privateAttributes']]);
		// Persist any changes straightforward entity changes first.
		var cs = new CC.EntityTypes.EntityChangeSet({
			'changeAction': "UPDATE",
			'entityGUID': this.entity.guid,
			'entityRevision': this.entity.revision,
			'entityType': this.entity.type,
			'changes': changes,
			'force': false
		});		
		var boundErrorCallback = this.errorCallback.bind(this);
		var callback = function(inResponse) {
			var innerCallback = function() {
				// If we're saving user settings, update the isBlogEnabled flag seperately.
				if (isUserEntity) {
					return server_proxy().entityForGUID(this.entity.blogGUID, function(blogEntity) {
						var blogcs = new CC.EntityTypes.EntityChangeSet({
							'changeAction': "UPDATE",
							'entityGUID': blogEntity.guid,
							'entityRevision': blogEntity.revision,
							'entityType': blogEntity.type,
							'changes': [['isHidden', (isBlogEnabled ? false : true), null]],
							'force': false
						});
						return server_proxy().updateEntity(blogcs, this.savedCallback.bind(this), boundErrorCallback);
					}.bind(this), boundErrorCallback);
				}
				return this.savedCallback();
			}.bind(this);
			// Update the acls for this project or user blog.
			if (this.access_editor) {
				var isNotificationEnabled = this.entity.extendedAttributes.settings.settings_send_notification;
				return this.access_editor.save(isNotificationEnabled, innerCallback, boundErrorCallback);
			} else {
				return innerCallback();
			}
		};
		return server_proxy().updateEntity(cs, callback.bind(this), boundErrorCallback);
	},
	handleCancel: function(e) {
		settingsPanel().hide();
	}
});

var SettingsPanel = Class.createWithSharedInstance('settingsPanel');
Object.extend(Object.extend(SettingsPanel.prototype, CC.Keyboard.Mixins.Responder), {
	initialize: function() {
		this.placeholderName = "";
		var settings_panel = Builder.node('div', {'role': 'navigation', 'aria-label': "_Accessibility.Dialog.Settings".loc(), id:"settings_panel", className:"dialog settings", role:"dialog"});
		mainView.$().appendChild(settings_panel);
		this.element = settings_panel;
		if (!this.element) return invalidate;
		this.mask = $(Builder.node('div', { id: "settings_panel_mask" }));
		this.mask.on('click', this.onMaskClick.bindAsEventListener(this));
		this.mask.hide();
		this.element.hide();
		document.body.appendChild(this.mask);
		document.body.appendChild(this.element.remove());  // relocate the dialog to the end of the document
		bindEventListeners(this, [
			'onFormSubmit',
			'onCancelButtonClick',
			'onDocumentKeypress'
		]);
	},
	showForGUIDAndType: function(inGUID, inType) {
		var type = mapTypeToURL(inType);
		this.fetchAndRenderDialogForGUIDAndType(inGUID, type, this.didShow.bind(this));
	},
	fetchAndRenderDialogForGUIDAndType: function(inGUID, inType, inCallback) {				
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_GENERAL);		
		var existing = $('content-settings');
		if (existing) {
			Element.remove(existing);
		}
		
		dialogManager().showProgressMessage("_Loading".loc());
		
		var isUser = (inType == 'people');
		var isBlogEnabled, blogGUID;
		var isCalendarEnabled = CC.calendarMetaTagsEnabledForContainer();
		var isCalendarServiceEnabled = CC.RouteHelpers.webcalEnabled();
		if (isUser) {
			isBlogEnabled = CC.meta('x-apple-user-isBlogEnabled') == "true";
			blogGUID = CC.meta('x-apple-user-blogGUID');
		} else {
			isBlogEnabled = CC.meta('x-apple-container-isBlogEnabled') == "true";
			blogGUID = CC.meta('x-apple-container-blogGUID');
		}
		var shouldShowPermissionSection = (!isUser || (isUser && isBlogEnabled)) // always show for projects, conditionally show for users
		
		// Helpers
		var buildMenuList = function(inName, inDisplayName, isSelected, tabindex) {
			return Builder.node('li', {className: isSelected ? 'active' : ''}, 
				Builder.node('a', {'tabindex': tabindex, 'role': 'link', href:'#', title:inDisplayName.loc(), name:inName, onClick:"openSetting('%@');".fmt(inName)}, inDisplayName.loc())
			);
		};	
		var sliceForSetting = function(name, displayName, content) {
			return Builder.node('div', {className: 'setting'}, [
				Builder.node('div', {className: 'label'}, 
					Builder.node('label', {'tabindex': '-1', value: displayName.loc(), 'for': name}, displayName.loc())
				),
				Builder.node('div', {className: 'input'}, content)
			]);
		};
		var buildInput = function(name, type) {
			if (type='text') {
				var inputElem = Builder.node('input', {'tabindex': ++tabIndex, 'role': 'textbox', type: 'text', maxlength: '100'})
			} else {
				var inputElem = Builder.node('textarea', {'tabindex': ++tabIndex, 'role': 'textbox'}, '')
			}
			inputElem.id = name;
			inputElem.className = 'setting_input';
			return inputElem;
		};		
		var buildServiceChoice = function(name, displayName, checked, disabled)  {
			var checkbox = Builder.node('input', {'tabindex': ++tabIndex, 'role': 'checkbox', type: 'checkbox', 'name': name, id: name});
			if (disabled) checkbox.disabled = true;
			checkbox.checked = checked;
			return Builder.node('div', {className: 'service'}, [
				checkbox,
				Builder.node('label', {'for': name}, displayName)
			])
		};
		var buildSelect = function(id, prefix, options, tabindex) {
			var choices = [];
			options.forEach(function(option){
				choices.push(Builder.node('option', {'role': 'option', value: option}, prefix.fmt(option.capitalize()).loc()));
			});
			return Builder.node('select', {'tabindex': tabindex, 'role': 'listbox', 'id': id}, choices);
		};
				
		var tabIndexGeneral = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_GENERAL);
		var tabIndexAppearance = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_APPEARANCE);
		var tabIndexPermissions = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS);		
		var tabIndexSave = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_BUTTON_SAVE);
		var tabIndexCancel = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_BUTTON_CANCEL);
		var tabIndexComment = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS_COMMENTS);
		var tabIndexModeration = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS_MODERATION);
		
		var mainContent = Builder.node('div', {id: 'content-settings', className: 'wrapchrome'}, [
			Builder.node('div', {'atbindex': '-1', id: 'settings-header'}, [
				Builder.node('h2', "_Settings.%@.Title".fmt(inType.capitalize()).loc())
			]),
						
			Builder.node('div', {'role': 'navigation', 'aria-label': "_Accessibility.Navigation.Left".loc(),  id: 'settings-menu'}, 
				Builder.node('ul', {}, [
					buildMenuList("general", "_Settings.General", true, tabIndexGeneral),
					buildMenuList("appearance", "_Settings.Appearance", false, tabIndexAppearance),
					shouldShowPermissionSection ? buildMenuList("permissions", "_Settings.%@.Permissions".fmt(inType.capitalize()), false, tabIndexPermissions) : null
				].compact())
			),
			
			Builder.node('div', {'role': 'navigation', 'aria-label': "_Accessibility.Navigation.Settings".loc(), id: 'settings'}, [
				Builder.node('div', {id: 'general', className: 'settings-section showing'}, 
					Builder.node('fieldset', {className: 'general'}, [
						sliceForSetting('longName', "_Settings.%@.Name".fmt(inType.capitalize()), buildInput('longName', 'text')),
			
						isUser ?
						sliceForSetting("settings_preferred_email", "_Settings.PreferredEmail.Label", buildInput('settings_preferred_email', 'text'))
						:
						sliceForSetting("description", "_Settings.Projects.Description", buildInput('description', 'textarea')),
						
						sliceForSetting('', '_Settings.Services', [
							isUser ? null : buildServiceChoice('settings_services_calendar', "_Settings.Services.Calendar".loc(), isCalendarEnabled, isCalendarServiceEnabled == false),
							buildServiceChoice('settings_services_blog', "_Settings.Services.Blog".loc(), isBlogEnabled)
						].compact())
					])
				),
					
				Builder.node('div', {id: 'appearance', className: 'settings-section'}, 
					Builder.node('fieldset', {}, [
						Builder.node('div', {className: 'setting avatar_editor'}, 
							sliceForSetting('settings_avatar', "_Settings.Avatar.%@.Label".fmt(inType.capitalize()), new CC.AvatarEditorView(inType)._render())
						),						
						Builder.node('div', {className: 'setting color_scheme_editor'}, [
							Builder.node('div', {className: 'label'},
								Builder.node('label', {}, "_Settings.ColorScheme.Label".loc())
							),
							new CC.ThemeChooserView()._render()
						]),
						Builder.node('div', {className: 'setting banner_image_editor'}, sliceForSetting('', "_Settings.BannerImage.Label", [
							new CC.AvatarEditorView(inType)._render(),
							Builder.node('span', {className: 'info'}, "_Settings.BannerImage.Help".loc())
						])),
						Builder.node('div', {className: 'setting background_image_editor'}, sliceForSetting('', "_Settings.BackgroundImage.Label",
							new CC.AvatarEditorView(inType)._render()
						))
					])
				),
				
				shouldShowPermissionSection ? 
				Builder.node('div', {id: 'permissions', className: 'settings-section'}, 
					Builder.node('fieldset', {className: 'acls'}, [
						Builder.node('div', {className: 'settings_access_editor'}, [
							Builder.node('div', {className: 'settings_access_editor_label'}, "_Settings.%@.AccessEditor.Label".fmt(inType.capitalize()).loc()),
							Builder.node('div', {className: 'cc-access-editor-view'})
						]),
						sliceForSetting('settings_comment_access', '_Settings.CommentAccess.Label', 						
							buildSelect('settings_comment_access', '_Settings.CommentAccess.%@', ["disabled", "all", "authenticated"], tabIndexComment)
						),
						sliceForSetting('settings_comment_moderation', '_Settings.CommentModeration.Label', 
							buildSelect('settings_comment_moderation', '_Settings.CommentModeration.%@', ["disabled", "all", "anonymous"], tabIndexModeration)
						)
					])					
				) : null,
								
				Builder.node('div', {id: 'actions'}, 
					Builder.node('fieldset', {className: 'actions'}, [
						Builder.node('input', {'tabindex': tabIndexSave, type: 'submit', className: 'save', value: '_General.Save'.loc()}),
						Builder.node('input', {'tabindex': tabIndexCancel, type: 'button', className: 'cancel', value: '_General.Cancel'.loc()})
					])
				)
				
			].compact())
		]);
				
		this.element.appendChild(mainContent);

		this.didFetchAndRenderDialog(inGUID, blogGUID);
		if (inCallback) inCallback();
		
	},
	didFetchAndRenderDialog: function(inGUID, inOptBlogGUID) {
		var batch = [
			['ContentService', 'entityForGUID:', inGUID],
			['ContentService', 'aclsForEntityGUID:', inGUID]
		];
		if (inOptBlogGUID) {
			batch.push(['ContentService', 'entityForGUID:', inOptBlogGUID]);
			batch.push(['ContentService', 'aclsForEntityGUID:', inOptBlogGUID]);
		}
		// Fetch the entities we need out-of-band to avoid JSON encoding/escaping issues in Rails (11668385).
		var gotResponse = function(response) {
			var entity, blogEntity;
			if (response && response.responses && response.responses.length > 1) {
				var responses = response.responses;
				var firstResponse = responses[0];
				entity = firstResponse.response;
				// Check entity is not a placeholder
				if (!entity || entity.type == 'com.apple.EntityPlaceholder') {
					logger().error("Got a null or placeholder entity (%@) .. bailing".fmt(entity));
					dialogManager().hide();
					return false;
				}
				var secondResponse = responses[1];
				entity.acls = secondResponse.response;
				// Did we also grab a blog entity and its ACLs?
				if (responses.length > 2) {
					var thirdResponse = responses[2];
					var fourthResponse = responses[3];
					blogEntity = thirdResponse.response;
					blogEntity.acls = fourthResponse.response;
				}
				dialogManager().hide();
				var settingsController = new SettingsController(entity, blogEntity);
				return true;
			}
			// Something went badly wrong, bail.
			logger().error("Could not get entity or optional blog entity for settings panel.. bailing");
			dialogManager().hide();
			return false;
		}.bind(this);
		service_client().batchExecuteAsynchronously(batch, null, gotResponse, gotResponse);
	},
	didShow: function() {
		this.becomeFirstResponder();
		
		window.scrollTo(0, 0);
		this.mask.show();
		
		// display hidden so we can get the DOM dimensions
		this.element.setStyle({ visibility: 'hidden' });
		this.element.show();

		// center the dialog
		var offsetTop  = (window.innerHeight || document.documentElement.offsetHeight) - this.element.getHeight();
		var offsetLeft = this.element.getOffsetParent().getWidth() - this.element.getWidth();
		this.element.setStyle({
			top:  Math.max( offsetTop / 4,  0 ) + 'px',
			left: Math.max( offsetLeft / 2, 0 ) + 'px'
		});

		// hide and return visibility so we can animate...
		this.element.hide();
		this.element.setStyle({
			//position: MozillaFixes.isGecko ? 'fixed' : 'absolute',
			position: 'absolute',
			visibility: 'visible'
		});

		// now animate open...
		new Effect.Appear(this.element, { duration:0.3, afterFinish: function() {				
			// do something on appear here
			// Focus on first element of the popup
			var firstElement = this.element.querySelector('input:first-child');
			firstElement.focus();			
		}.bind(this)});
		document.observe('keypress', this.onDocumentKeypress);
		
		// Temporary disabling background items when modal dialog is open in order to avoid bad tabindex-ing
		accessibility().makeRootViewsAriaHidden(false);
	},
	hide: function() {
		document.stopObserving('keypress', this.onDocumentKeypress);
		this.mask.hide();
		this.element.hide();
		this.loseFirstResponder();
		
		// Bring background items back to foreground when closing modal dialog to bring back original tabindex-ing
		accessibility().makeRootViewsAriaVisible(false);
	},
	onFormSubmit: function(e) {
		e.stop();
	},
	// panel button handlers
	onCancelButtonClick: function(e) {
		e.stop();
		// do URL cleanup, then...
		// close the dialog
		this.hide();
	},
	onDocumentKeypress: function(e) {
		if (e.keyCode == Event.KEY_ESC) {
			this.onCancelButtonClick(e);
		}
	},
	onMaskClick: function(e) {
		e.stop();
	},
	handleKeyboardNotification: function(inMessage, inObject, inOptExtras) {
		if (inMessage == CC.Keyboard.NOTIFICATION_DID_KEYBOARD_ESC) {
			this.onCancelButtonClick(inOptExtras.event);
		}
		return true;
	}
});

// Automatically open the settings panel.

var autoSettingsOpener = Class.createWithSharedInstance('autoSettingsOpener', true);
autoSettingsOpener.prototype = {
	initialize: function() {
		var hashMatch = window.location.href.match(/\?showSettings=true/);
		var settingsAccess = (CC.meta('x-apple-user-is-owner') == "true" || CC.meta('x-apple-user-is-admin') == "true");
		if (hashMatch && settingsAccess) {
			var projectGUID = CC.meta('x-apple-owner-guid');
			var parentType = CC.meta('x-apple-owner-type');
			settingsPanel().showForGUIDAndType(projectGUID, parentType);
		} else {
			return invalidate;
		}
	}
};
