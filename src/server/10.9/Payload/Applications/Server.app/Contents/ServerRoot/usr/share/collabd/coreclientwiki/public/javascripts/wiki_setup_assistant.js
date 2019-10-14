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

//= require "./theme_chooser.js"

// Namespace.

CC.WikiSetupAssistant = CC.WikiSetupAssistant || new Object();

// Shared instance.

var WikiSetupAssistant = Class.createWithSharedInstance('wikiSetupAssistant');
Object.extend(Object.extend(WikiSetupAssistant.prototype, CC.Keyboard.Mixins.Responder), {
		
	initialize: function()
	{
		this.placeholderName = "";
		// One mask per customer.
		this.mask = $(Builder.node('div', { id: "wiki_setup_mask" }));
		this.mask.on('click', this.onMaskClick.bindAsEventListener(this));
		this.mask.hide();
		document.body.appendChild(this.mask);
		this.renderDialog();
	},
	
	renderDialog: function(inCallback) {
		// Create the empty parent element.
		var existingDialog = $('wiki_setup');
		if (existingDialog) Element.remove(existingDialog);
		this.element = Builder.node('div', {id: 'wiki_setup', 'className': 'dialog', 'style': 'display: none;', 'role': 'dialog'}, [
			Builder.node('div', {className: 'dialog_contents'}, [
				Builder.node('form')
			])
		]);
		document.body.appendChild(this.element);
		var form = this.element.down('form');
		
		// Add each of the panel views we need, calling _render explicitly since this class isn't a CC.Mvc.View
		// instance and we can't use addSubview.
		this.panelSet = new CC.PanelSet();
		var namePanel = new CC.WikiSetupAssistant.NamePanel();
		form.appendChild(namePanel._render());
		this.panelSet.add(namePanel);
		var accessPanel = new CC.WikiSetupAssistant.AccessPanel();
		form.appendChild(accessPanel._render());
		this.panelSet.add(accessPanel);
		var appearancePanel = new CC.WikiSetupAssistant.AppearancePanel();
		form.appendChild(appearancePanel._render());
		this.panelSet.add(appearancePanel);
		var completePanel = new CC.WikiSetupAssistant.CompletePanel();
		form.appendChild(completePanel._render());
		this.panelSet.add(completePanel);
		
		// Register event handlers.
		bindEventListeners(this, [
			'onFormSubmit',
			'onCancelButtonClick',
			'onPrevButtonClick',
			'onNextButtonClick',
			'onDoneButtonClick',
			'onDismissButtonClick',
			'onGoToButtonClick',
			'onDocumentKeypress'
		]);
		this.onProvisionWikiSuccess = this.onProvisionWikiSuccess.bind(this);
		this.onProvisionWikiFailure = this.onProvisionWikiFailure.bind(this);
		Element.observe(form, 'submit', this.onFormSubmit);
		this.element.select('.button.cancel').invoke('observe', 'click', this.onCancelButtonClick);
		this.element.select('.button.prev').invoke('observe', 'click', this.onPrevButtonClick);
		this.element.select('.button.next').invoke('observe', 'click', this.onNextButtonClick);
		this.element.select('.button.done').invoke('observe', 'click', this.onDoneButtonClick);
		this.element.select('.button.goto').invoke('observe', 'click', this.onGoToButtonClick);
		
		if (inCallback) inCallback();
	},
	
	show: function() {
		accessibility().makeRootViewsAriaHidden(false);
		this.renderDialog(this._show.bind(this));
	},
	
	_show: function()
	{		
		this.becomeFirstResponder();
		
		window.scrollTo(0, 0);
		this.panelSet.first().select();
		
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
			
			var wikiNameInput = $('wiki_setup_name');
			if (wikiNameInput && this.placeholderName) {
				wikiNameInput.value = this.placeholderName;
				this.element.down('.panel.name').down('.button.next').enable();
			}
			wikiNameInput.activate();
		}.bind(this)});
		
		document.observe('keypress', this.onDocumentKeypress);
	},
	hide: function()
	{
		document.stopObserving('keypress', this.onDocumentKeypress);
		this.mask.hide();
		this.element.hide();
		this.loseFirstResponder();
		accessibility().makeRootViewsAriaVisible(false);
	},
	
	onFormSubmit: function(e)
	{
		e.stop();
	},
	// panel button handlers
	onCancelButtonClick: function(e)
	{
		e.stop();
		// clear out any url cruft sent by server admin...
		var l = window.location;
		var hash = l.hash.gsub(/#create/, '');
		var search = l.search.gsub(/[?&]shortName=[^&]+/, '').gsub(/[?&]displayName=[^&]+/, '');
		if ((l.hash != hash) || (l.search != search)) {
			l.href = l.pathname + search;
		}
		// close the dialog
		this.hide();
	},
	onPrevButtonClick: function(e)
	{
		e.stop();
		this.panelSet.previous().select();
	},
	onNextButtonClick: function(e)
	{
		e.stop();
		this.panelSet.next().select();
	},
	onDoneButtonClick: function(e)
	{
		e.stop();
		this.provisionWiki();
	},
	onDismissButtonClick: function(e)
	{
		e.stop();
		this.hide();
	},
	onGoToButtonClick: function(e)
	{
		e.stop();
		if (this.project && this.project.tinyID) {
			var url = CC.entityURLForTypeAndTinyID('com.apple.entity.Wiki', this.project.tinyID, this.project.longName);
			this.hide();
			window.location = url;
		}
	},
	onDocumentKeypress: function(e)
	{
		if (e.keyCode == Event.KEY_ESC) {
			var btn = this.panelSet.selected().$().down('.button.cancel');
			if (btn) {
				btn.click();
			} else {
				this.onDismissButtonClick(e); // dismiss button was removed
			}
		}
		if (e.keyCode == Event.KEY_RETURN) {
			var accessPanel = this.panelSet.itemAtIndex(1); 
			if (accessPanel.isSelected() && accessPanel.inputHasFocus()) {
				// #8488980 don't trigger default button if the user is assigning ACLs
			} else {
				var button = this.panelSet.selected().$().down('.button[default="default"]');
				if (button && button.click) {
					button.click();
				} else if (this.panelSet.selected().$().hasClassName('complete')) {
					this.onGoToButtonClick(e);
				}
			}
		}
	},
	onMaskClick: function(e) {
		e.stop();
	},
	
	enableAllButtons: function() {
		this.panelSet.all().each(function(panel) {
			panel.$().select('.controls .button').invoke('enable');
		});
	},
	disableAllButtons: function() {
		this.panelSet.all().each(function(panel) {
			panel.$().select('.controls .button').invoke('disable');
		});
	},
	
	provisionWiki: function() {
		// Disable the panel to prevent duplicate submissions
		this.disableAllButtons();
		// Fetch the name, description, theme and avatar from the setup panels.
		var options = {
			'longName': $F('wiki_setup_name'),
			'description': $F('wiki_setup_description')
		};
		if ($('settings_theme_name')) {
			var themeName = $F('settings_theme_name');
			if (themeName != 'blue') options['themeInfo'] = themeName + ',,';
			var avatar_guid = this.panelSet.itemAtIndex(2).avatar_editor.file_guid;
			if (avatar_guid) options['avatarGUID'] = avatar_guid;
		}
		// Serialize the acls to use for the new project.
		var acls = this.panelSet.itemAtIndex(1).editor.serialize(true);
		// Create the project.
		server_proxy().createProjectWithOptionsAndACLs(options, acls, this.onProvisionWikiSuccess.bind(this), this.onProvisionWikiFailure.bind(this))
	},
	onProvisionWikiSuccess: function(entity) {
		this.enableAllButtons();
		this.project = entity;
		// set the wikiname and select the confirmation panel
		var panel = this.panelSet.itemAtIndex(3);
		panel.$().down('.confirmation span').update((entity.longName || '').escapeHTML());
		panel.select();
		globalNotificationCenter().publish('WIKI_SETUP_ASSISTANT_DID_CREATE_WIKI');
	},
	onProvisionWikiFailure: function() {
		this.enableAllButtons();
		notifier().printErrorMessage("_WikiSetupAssistant.ProvisionWiki.Failure".loc());
	},
	handleKeyboardNotification: function(inMessage, inObject, inOptExtras) {
		if (inMessage == CC.Keyboard.NOTIFICATION_DID_KEYBOARD_ESC) {
			this.onCancelButtonClick(inOptExtras.event);
		}
		return true;
	}

});

/* This class auto-opens the wiki setup assistant if we're at the list of wikis and there's a #createWiki hash */

var WikiSetupAssistantOpener = Class.createWithSharedInstance('wikiSetupAssistantOpener', true);
WikiSetupAssistantOpener.prototype = {
	initialize: function()
	{
		var userLoggedIn = (CC.meta('x-apple-user-logged-in') == "true");
		var userCanCreateProjects = (CC.meta('x-apple-user-can-create-projects') == "true");
		var hashMatch = window.location.hash.match(/^#*createWikiNamed=(.+)$/);
		if (!hashMatch) return invalidate;
		
		// If the user is not logged in and they can't create projects, force them to log in.
		if (!userLoggedIn && !userCanCreateProjects) {
			var currentURL = window.location;
			window.location.href = "/auth?send_token=no&redirect=" + currentURL;
			return;
		}
		
		// If the user is logged in but they still can't create projects, show an alert.
		if (userLoggedIn && !userCanCreateProjects) {
			alert("_Dialogs.CreateWikiNamed.NotAllowed".loc());
			return;
		}
		
		var sharedInstance = wikiSetupAssistant();
		sharedInstance.placeholderName = decodeURI(hashMatch[1]);
		sharedInstance.show();
	}
};

CC.WikiSetupAssistant.NamePanel = Class.create(CC.PanelView, {
	render: function($super) {
		var elem = Builder.node('div', {className: 'panel name'});
		var html = "<h3 class=\"title\">%@<span>%@</span></h3><div class=\"content\"><div class=\"section selected\"><div class=\"field\"><label for=\"wiki_setup_name\">%@</label><input type=\"text\" value=\"\" id=\"wiki_setup_name\" name=\"wiki_setup_name\" /></div><div class=\"field\"><label for=\"wiki_setup_description\">%@</label><textarea id=\"wiki_setup_description\" name=\"wiki_setup_description\"></textarea></div></div></div><div class=\"controls\"><input class=\"button cancel\" type=\"button\" value=\"%@\" /><span><input class=\"button next\" type=\"button\" value=\"%@\" default=\"default\" /></span></div>";
		elem.innerHTML = html.fmt("_WikiSetupAssistant.Name.Header".loc(), "_WikiSetupAssistant.Name.HeaderSteps".loc(), "_WikiSetupAssistant.Name.TitleLabel".loc(), "_WikiSetupAssistant.Name.DescriptionLabel".loc(), "_WikiSetupAssistant.Button.Cancel".loc(), "_WikiSetupAssistant.Button.Next".loc());
		this.onNameKeypress = this.onNameKeypress.bindAsEventListener(this);
		this.onDescriptionKeypress = this.onDescriptionKeypress.bindAsEventListener(this);
		this.name = elem.down('#wiki_setup_name');
		this.name.autocorrect = 'off';
		this.name.on('keyup', this.onNameKeypress);
		this.name.on('change', this.onNameKeypress);
		this.description = elem.down('#wiki_setup_description');
		this.description.on('keypress', this.onDescriptionKeypress);
		this.button = elem.down('.button.next');
		this.button.disable();
		return elem;
	},
	onNameKeypress: function(e) {
		var value = this.name.value;
		(value && (value.strip() == '')) ? this.button.disable() : this.button.enable();
	},
	onDescriptionKeypress: function(e) {
		// prevent enter key from triggering the next panel
		e.stopPropagation();
	}
});

CC.WikiSetupAssistant.AccessPanel = Class.create(CC.PanelView, {
	render: function($super) {
		var elem = Builder.node('div', {className: 'panel access'});
		var html = "<h3 class=\"title\">%@<span>%@</span></h3><div class=\"content\"><div class=\"section selected\"><div class=\"field\"><label for=\"wiki_setup_access\">%@</label><div class=\"cc-access-editor-view\"></div></div></div></div><div class=\"controls\"><input class=\"button cancel\" type=\"button\" value=\"%@\" /><span><input class=\"button prev\" type=\"button\" value=\"%@\" /><input class=\"button next\" type=\"button\" value=\"%@\" default=\"default\" /></span></div>";
		elem.innerHTML = html.fmt("_WikiSetupAssistant.Access.Header".loc(), "_WikiSetupAssistant.Access.HeaderSteps".loc(), "_WikiSetupAssistant.Access.PermissionsLabel".loc(), "_WikiSetupAssistant.Button.Cancel".loc(), "_WikiSetupAssistant.Button.Previous".loc(), "_WikiSetupAssistant.Button.Next".loc());
		var default_acls = [{
			userExternalID: CC.meta('x-apple-user-externalID'),
			userLogin: CC.meta('x-apple-username'),
			userLongName: CC.meta('x-apple-user-longName'),
			allow: true,
			action: 'own'
		}];
		var acls_element = elem.down('.cc-access-editor-view');
		if (acls_element) {
			this.editor = new CC.AccessEditorView(default_acls, false); 
			this.editor._render();
			acls_element.appendChild(this.editor.$());
			this.editor.textfield.on('focus', this.onInputFocus.bindAsEventListener(this));
			this.editor.textfield.on('blur', this.onInputBlur.bindAsEventListener(this));
		}
		return elem;
	},
	onInputFocus: function(e) {
		this._input_focused = true;
	},
	onInputBlur: function(e) {
		this._input_focused = false;
	},
	inputHasFocus: function() {
		return this._input_focused;
	},
	hide: function($super) {
		// Hide autocompletion list if it is up.
		if (this.editor && this.editor.resultList) {
			this.editor.resultList.hide();
		}
		$super();
	}
});

CC.WikiSetupAssistant.AppearancePanel = Class.create(CC.PanelView, {
	render: function($super) {
		var elem = Builder.node('div', {className: 'panel appearance'});
		var html = "<h3 class=\"title\">%@<span>%@</span></h3><div class=\"content\"><div class=\"section selected\"><div class=\"field\"><label for=\"wiki_setup_avatar\">%@</label><div id=\"wiki_setup_avatar\"></div></div><div class=\"field\"><label for=\"wiki_setup_color_scheme\">%@</label><div id=\"wiki_setup_color_scheme\"></div></div></div></div><div class=\"controls\"><input class=\"button cancel\" type=\"button\" value=\"%@\" /><span><input class=\"button prev\" type=\"button\" value=\"%@\" /><input class=\"button done\" type=\"button\" value=\"%@\" default=\"default\" /></span></div>";
		elem.innerHTML = html.fmt("_WikiSetupAssistant.Appearance.Header".loc(), "_WikiSetupAssistant.Appearance.HeaderSteps".loc(), "_Settings.Avatar.Projects.Label".loc(), "_WikiSetupAssistant.Appearance.SchemeLabel".loc(), "_WikiSetupAssistant.Button.Cancel".loc(), "_WikiSetupAssistant.Button.Previous".loc(), "_WikiSetupAssistant.Button.Create".loc());
		elem.down('#wiki_setup_avatar').appendChild(new CC.AvatarEditorView('projects')._render());
		var avatar_element = elem.down('.cc-avatar-editor');
		if (avatar_element) {
			this.avatar_editor = new CC.AvatarEditor(avatar_element, null, true);
		}
		elem.down('#wiki_setup_color_scheme').appendChild(new CC.ThemeChooserView()._render());
		var swatchesElement = elem.down('.theme_swatches');
		if (swatchesElement) {
			swatchesElement.removeClassName('input');
			var swatches = elem.select('.theme_swatch');
			swatches[0].addClassName('selected');
			for (var i = 0; i < swatches.length; i++) {
				swatches[i].on('click', this.changeColor.bind(this, swatches[i]));
			}
		}
		return elem;	
	},
	changeColor: function(el) {
		var newTheme = el.getAttribute('data-color');
		$('settings_theme_name').value = newTheme;
		var swatches = this.$().getElementsByClassName('theme_swatch');
		for (var i = 0; i < swatches.length; i++) {
			swatches[i].removeClassName('selected');
		}
		el.addClassName('selected');
	}
});

CC.WikiSetupAssistant.CompletePanel = Class.create(CC.PanelView, {
	render: function($super) {
		var elem = Builder.node('div', {className: 'panel complete'});
		var html = "<h3 class=\"title\">%@</h3><div class=\"content\"><div class=\"section selected\"><div class=\"confirmation\">%@</div></div></div><div class=\"controls\"><center><input class=\"button goto\" id=\"goto_wiki_btn\" type=\"button\" value=\"%@\" /></center></div>";
		elem.innerHTML = html.fmt("_WikiSetupAssistant.Complete.Header".loc(), "_WikiSetupAssistant.Complete.Confirmation".loc(), "_WikiSetupAssistant.Button.Go".loc());
		return elem;
	}
});
