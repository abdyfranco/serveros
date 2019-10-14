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

// Smart link popup menu.

CC.WikiEditor.SmartLinkPopup = Class.create(CC.WikiEditor.EditorToolbarPopupMenu, {
	mDefaultLimit: 10,
	render: function() {
		var elem = Builder.node('ul', {className: 'items'}, [
			Builder.node('li', {className: 'item newpage'}, [
				Builder.node('span', {title: "_Editor.Links.Toolbar.Popup.New.Tooltip".loc()}, "_Editor.Links.Toolbar.Popup.New.Title".loc())
			]),
			Builder.node('li', {className: 'item search'}, [
				Builder.node('span', {title: "_Editor.Links.Toolbar.Popup.Search.Tooltip".loc()}, "_Editor.Links.Toolbar.Popup.Search.Title".loc())
			]),
			Builder.node('li', {className: 'item manual'}, [
				Builder.node('span', {title: "_Editor.Links.Toolbar.Popup.Manual.Tooltip".loc()}, "_Editor.Links.Toolbar.Popup.Manual.Title".loc())
			]),
			Builder.node('li', {className: 'item unlink'}, [
				Builder.node('span', {title: "_Editor.Links.Toolbar.Popup.Unlink.Tooltip".loc()}, "_Editor.Links.Toolbar.Popup.Unlink.Title".loc())
			]),
			Builder.node('li', {className: 'recents'}, [
				Builder.node('span', {className: 'header'}, "_Editor.Links.Toolbar.Popup.Recents".loc()),
				Builder.node('ul', {className: 'items empty loading'}, [
					Builder.node('li', {className: 'item placeholder'}, [
						Builder.node('span', "_Editor.Links.Toolbar.Popup.Recents.None.Placeholder".loc())
					])
				])
			])
		]);
		this.drawDialogs();
		return elem;
	},
	registerEventHandlers: function($super) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		bindEventListeners(this, [
			'handleCreateNewPageClicked',
			'handleSearchLinkClicked',
			'handleEnterManualLinkClicked',
			'handleUnlinkClicked'
		]);
		var elem = this.mParentElement;
		Event.observe(elem.down('.item.newpage'), 'click', this.handleCreateNewPageClicked);
		Event.observe(elem.down('.item.search'), 'click', this.handleSearchLinkClicked);
		Event.observe(elem.down('.item.manual'), 'click', this.handleEnterManualLinkClicked);
		Event.observe(elem.down('.item.unlink'), 'click', this.handleUnlinkClicked);			
	},
	drawDialogs: function() {
		if ($('add_link_dialog')) Element.remove('add_link_dialog');
		// Draw the manual link dialog.
		dialogManager().drawDialog('add_link_dialog', [
			{label:'_Editor.Links.Dialog.Manual.Label.URL'.loc(), contents: '<input type="text" id="add_link_dialog_url"/>'},
			{label:'_Editor.Links.Dialog.Manual.Label.LinkText'.loc(), contents: '<input type="text" id="add_link_dialog_linktext"/>'},
			{label:'', contents: 
			'<form>'+
				'<input type="checkbox" name="add_link_target" value="_new">'+'_Editor.Links.Dialog.Manual.Label.Target.Blank'.loc()+ 
			'</form>'
			}		
		], "_Editor.Links.Dialog.Add".loc(), undefined, "_Editor.Links.Dialog.Manual.Title".loc(), "_Editor.Links.Dialog.Cancel".loc());
		var descriptionRow = Builder.node('tr', [
			Builder.node('td', {colSpan: 2, className: 'description'}, "_Editor.Links.Dialog.Manual.Description".loc())
		]);
		Element.insert($('add_link_dialog').down('tbody'), {top: descriptionRow});
		// Draw the link search dialog. Exclude the current page from any results.
		var currentPage = CC.meta('x-apple-entity-guid');
		this.mLinkSearchDialog = new LinkSearchDialog({
			mExcludedGUIDs: [currentPage]
		});
	},
	showNewPageDialog: function(inOptAnchor, inOptPageName, inOptCallback, inOptCancelCallback) {
		var tinyID = globalEditorController().mPage.getRecordPropertyForPath('tinyID');
		var ownerGUID = globalEditorController().mPage.getRecordPropertyForPath('ownerGUID');
		globalPagesController().showNewPageDialog(inOptAnchor, inOptPageName, (tinyID != "serverhome" ? ownerGUID : null), null, inOptCallback, inOptCancelCallback);
	},
	showLinkSearchDialog: function(inOptAnchor, inOptLinkText, inOptCallback, inOptCancelCallback) {
		this.mLinkSearchDialog.show(inOptAnchor, inOptCancelCallback, inOptCallback, inOptLinkText);
	},
	showLinkDialog: function(inOptAnchor, inOptURL, inOptLinkText, inOptTarget, inOptCallback, inOptCancelCallback) {
		// On save, fire an optional callback with the url and link text.
		var callback = function() {
			if (!inOptCallback) return;
			var url = $('add_link_dialog_url').value;
			var linkText = $('add_link_dialog_linktext').value;
			var target = '';		
		    var e = document.getElementsByName('add_link_target');
		    for (var i = 0, l = e.length; i < l; i++) {
		    	if (e[i].checked) {
					target = e[i].value;
				}
		    } 

			if (inOptCallback) inOptCallback(url, linkText, target);
		}.bind(this);
		
		// Get the href from the selected node if it's an anchor node
		var selectedAnchor = globalEditorTextSelectionDelegate().getSelectedAnchorInfo(inOptLinkText);
		var selectedAnchorHref = '';
		
		// For a text selection, get the Href from the anchor text
		if (selectedAnchor) {
			selectedAnchorHref = selectedAnchor.href.replace(/\/$/, ""); // removing last slash in URL
		// For an image selection, get the Href directly from the object
		} else if (this.mURL){
			selectedAnchorHref = this.mURL;
		}
		
		// getting rid of the target attribute
		selectedAnchorHref = selectedAnchorHref.replace("/?target=_self", "");
		selectedAnchorHref = selectedAnchorHref.replace("/?target=_blank", "");
		selectedAnchorHref = selectedAnchorHref.replace("/?target=_new", "");
		selectedAnchorHref = selectedAnchorHref.replace("/?target=", "");
		selectedAnchorHref = selectedAnchorHref.replace("&target=_self", "");
		selectedAnchorHref = selectedAnchorHref.replace("&target=_blank", "");
		selectedAnchorHref = selectedAnchorHref.replace("&target=_new", "");
		selectedAnchorHref = selectedAnchorHref.replace("&target=", "");				
		selectedAnchorHref = selectedAnchorHref.replace("?target=_self", "");
		selectedAnchorHref = selectedAnchorHref.replace("?target=_blank", "");
		selectedAnchorHref = selectedAnchorHref.replace("?target=_new", "");
		selectedAnchorHref = selectedAnchorHref.replace("?target=", "");				
		
		$('add_link_dialog_url').value = (selectedAnchorHref || '');
		$('add_link_dialog_linktext').value = (inOptLinkText || '');		
		// Show the dialog.
		dialogManager().show('add_link_dialog', inOptCancelCallback, callback, inOptAnchor, false, 'add_link_dialog_url', false);
	},
	preparePopup: function(inOptAnchor, inOptURL, inOptLinkText, inOptTarget, inOptCallback, inOptCancelCallback) {
		this.mAnchor = inOptAnchor;
		this.mURL = inOptURL;
		this.mLinkText = inOptLinkText;
		this.mTarget = inOptTarget;
		this.mCallback = inOptCallback;
		this.mCancelCallback = inOptCancelCallback;
		this.populateRecentItems();
	},
	populateRecentItems: function() {
		var recentsElement = this.$().down('.recents > .items');
		recentsElement.addClassName('loading');
		return server_proxy().recentEntitiesForUserWithLimitAndOptions(this.mDefaultLimit, {}, function(response) {
			var recents = $A(response);
			recentsElement.removeClassName('loading');
			(recents && recents.length > 0) ? recentsElement.removeClassName('empty') : recentsElement.addClassName('empty');
			// Remove any existing recents.
			var recentsItems = recentsElement.select('.item'), recentsItemIdx, recentsItem;
			for (recentsItemIdx = 0; recentsItemIdx < recentsItems.length; recentsItemIdx++) {
				recentsItem = recentsItems[recentsItemIdx];
				if (!recentsItem.hasClassName('placeholder')) Element.remove(recentsItem);
			}
			// Build a recent item per result. Overload the name and title attributes to
			// store link information that we can pass to a callback on click.
			var recentIdx, recent;
			for (recentIdx = 0; recentIdx < recents.length; recentIdx++) {
				recent = recents[recentIdx];
				var elem = Builder.node('li', {className: 'item'}, [
					Builder.node('span', {name: CC.entityURL(recent, true), title: (recent.longName || recent.shortName)}, (recent.longName || recent.shortName))
				]);
				Event.observe(elem, 'click', function(inEvent) {
					this.hide();
					var elem = inEvent.findElement('span');
					if (this.mCallback) this.mCallback(elem.getAttribute('name'), elem.getAttribute('title'));
				}.bind(this));
				Element.insert(recentsElement, {bottom: elem});
			}
		}.bind(this), Prototype.emptyFunction);
	},
	handleCreateNewPageClicked: function(inEvent) {
		this.hide();
		this.showNewPageDialog(this.mAnchor, this.mLinkText, this.mCallback, this.mCancelCallback);
	},
	handleSearchLinkClicked: function(inEvent) {
		this.hide();
		this.showLinkSearchDialog(this.mAnchor, this.mLinkText, this.mCallback, this.mCancelCallback);
	},
	handleEnterManualLinkClicked: function(inEvent) {
		this.hide();
		this.showLinkDialog(this.mAnchor, this.mURL, this.mLinkText, this.mTarget, this.mCallback, this.mCancelCallback);
	},
	handleUnlinkClicked: function(inEvent) {
		this.hide();
		// Fire our link callback with empty arguments to remove it.
		if (this.mCallback) this.mCallback();
	}
});
