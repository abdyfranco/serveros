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

var SandboxBlockDelegate = Class.createWithSharedInstance('sandboxBlockDelegate');
SandboxBlockDelegate.prototype = {
	initialize: function() {},
	addBlock: function() {
		var sandbox = editorToolbarDelegate().addBlock('sandbox', {}, true);
		if (sandbox && sandbox.mViewInstance) sandbox.mViewInstance.handleInfoButtonClicked();
	}
};

CC.WikiEditor.SandboxBlock = Class.create(CC.WikiEditor.Block, {
	mBlockView: 'CC.WikiEditor.SandboxBlockView',
	handleDidStartEditing: function($super, inOptInfo) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		this.mViewInstance._activate();
	},
	handleDidResumeEditing: function($super, inOptInfo) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		this.mViewInstance._reactivate();
	},
	handleDidStopEditing: function($super, inOptInfo) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		this.mViewInstance._deactivate();
	},
	handleFinishedAddingBlock: function($super, inOptInfo) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		this.mViewInstance.renderFrame();
	},
	restore: function($super, inChangesets) {
		var changesetKey, changesetValue, changesetIdx, changes;
		for (changesetIdx = 0; changesetIdx < inChangesets.length; changesetIdx++) {
			changes = inChangesets[changesetIdx];
			if (changes.length < 2) continue;
			changesetKey = changes[0];
			changesetValue = changes[1];
			if (changesetKey != 'extendedAttributes') continue;
			// Restore and render any markup.
			var content = changesetValue.markup || "";
			this.setRecordPropertyForPath('extendedAttributes.markup', content);
			this.mViewInstance.renderFrame();
		}
		$super(inChangesets);
	}
});

CC.WikiEditor.SandboxBlockView = Class.create(CC.WikiEditor.NonTextBlockView, CC.WikiEditor.Mixins.AskBeforeDeleting, {
	mFlipped: false,
	mDeleteDialogTitle: "_Editor.Block.Sandbox.Dialog.Delete.Title".loc(),
	mDeleteDialogDescription: "_Editor.Block.Sandbox.Dialog.Delete.Description".loc(),
	renderAsHTML: function() {
		var attrs = this.mContent.getRecordPropertyForPath('extendedAttributes');
		var markup = attrs['markup'] || "";
		var eventDelegateIdentifer = this.getEventDelegateIdentifer();
		var html = "<div class=\"container wrapchrome\">" +
			"<div class=\"frontside wrapchrome\"><div id=\"%@\" class=\"info clickable chrome\"></div><div class=\"iframe wrapchrome\"></div></div>".fmt(eventDelegateIdentifer + "-info") +
			"<div class=\"flipside chrome\">" +
				"<div class=\"controls\"><textarea id=\"%@\" class=\"markup clickable\" placeholder=\"%@\" title=\"%@\">%@</textarea></div>".fmt(eventDelegateIdentifer + "-markup", "_Editor.Block.Sandbox.Markup.Description".loc(), "_Editor.Block.Sandbox.Markup.Description".loc(), markup) +
				"<div class=\"buttons\"><div id=\"%@\" class=\"button matchstyles clickable\" title=\"%@\">%@</div><div id=\"%@\" class=\"button clickable done\">%@</div></div>".fmt(eventDelegateIdentifer + "-matchstyles", "_Editor.Block.Sandbox.Edit.MatchStyle.Tooltip".loc(), "_Editor.Block.Sandbox.Edit.MatchStyle.Label".loc(), eventDelegateIdentifer + "-done", "_Editor.Block.Sandbox.Edit.Done.Label".loc()) +
			"</div></div>";
		return html;
	},
	renderFrame: function() {
		var frame = this.$().down('.iframe');
		if (this.mContent.mParentContainer) {
			var migrated = (this.mContent.mParentContainer.getRecordPropertyForPath('extendedAttributes.migrated') != undefined);
			migrated ? frame.addClassName('migrated') : frame.removeClassName('migrated');
		}
		Element.update(frame, (this.mContent.getRecordPropertyForPath('extendedAttributes.markup') || ""));
	},
	registerEventHandlers: function() {
		bindEventListeners(this, [
			'stopPropagation',
			'handleInfoButtonClicked',
			'handleMatchStylesButtonClicked',
			'handleDoneButtonClicked'
		]);
		var eventDelegateIdentifer = this.getEventDelegateIdentifer();
		globalEventDelegate().bulkRegisterDomResponderForEventByIdentifer([
			['keydown', "%@-markup".fmt(eventDelegateIdentifer), this.stopPropagation],
			['paste', "%@-markup".fmt(eventDelegateIdentifer), this.stopPropagation],
			['click', "%@-info".fmt(eventDelegateIdentifer), this.handleInfoButtonClicked],
			['click', "%@-matchstyles".fmt(eventDelegateIdentifer), this.handleMatchStylesButtonClicked],
			['click', "%@-done".fmt(eventDelegateIdentifer), this.handleDoneButtonClicked]
		]);
	},
	_activate: function() {
		setTimeout(this._reactivate.bind(this), 400);
	},
	_reactivate: function() {
		if (this.mFlipped) {
			this.$().down('textarea').focus();
		}
	},
	_deactivate: function() {
		if (this.mFlipped) this.handleDoneButtonClicked();
	},
	setContent: function(inContent) {
		this.mContent.setRecordPropertyForPath('extendedAttributes.markup', (inContent || ""));
	},
	getFrameContent: function() {
		var frame = this.$().down('.iframe');
		return frame.innerHTML;
	},
	// Removes elements or attributes we added dynamically when rendering this sandbox.
	cleanDynamicContent: function(inDocument) {
		if (!inDocument || !inDocument.querySelectorAll) return false;
		// Undo any attachment link wrappers.
		var links = inDocument.select('.wikieditor_sandbox_attachment_wrapper'), link;
		for (var linkIdx = links.length - 1; linkIdx >= 0; linkIdx--) {
			link = links.item(linkIdx);
			promoteElementChildren(link);
		}
	},
	enableAttachmentLinks: function() {
		var frame = this.$().down('.iframe');
		var attachmentImages = frame.select('.attachment_handle_img');
		for (var idx = 0; idx < attachmentImages.length; idx++) {
			var img, a;
			img = attachmentImages.item(idx);
			a = document.createElement('a');
			a.className = 'wikieditor_sandbox_attachment_wrapper';
			a.setAttribute('href', '#');
			a.setAttribute('title', img.getAttribute('title'));
			img.parentNode.insertBefore(a, img);
			a.appendChild(img.cloneNode(true));
			img.parentNode.replaceChild(a, img);
			a.onclick = function(inEvent) {
				// Calculate the target URL for the nested img tag inside the link tag.
				var eventSource = Event.findElement(inEvent, 'a');
				if (eventSource) {
					var imgSource = eventSource.down('img');
					var targetURL = getFileDownloadURL(imgSource, true);
					window.location.href = targetURL;
				}
			}
		}
	},
	// 8579019
	enableEmbeddedMedia: function() {
		var frame = this.$().down('.iframe');
		var posterImages = frame.select('.posterimg'), posterImageIdx, posterImage;
		for (posterImageIdx = 0; posterImageIdx < posterImages.length; posterImageIdx++) {
			posterImage = posterImages.item(posterImageIdx);
			posterImage.setAttribute('tabindex', '0');
			posterImage.setAttribute('role', 'button');
			posterImage.onclick = function(inEvent) {
				var img = Event.element(inEvent);
				if (!img) return false;
				var mediaProperties = {
					'src': getFileDownloadURL(img, true),
					'width': img.width,
					'height': img.height
				}
				return qtMediaExpander().expandMedia(mediaProperties, img);
			}
		}
	},
	// A sandbox block is empty if it has no markup.
	isEmpty: function() {
		var markup = this.mContent.getRecordPropertyForPath('extendedAttributes.markup');
		return (markup == undefined || markup == "");
	},
	// Flips the sandbox block to reveal the back of the block. Accepts an optional
	// inOptShowSettings boolean argument, falling back to a toggle behavior otherwise.
	flip: function(inOptShowSettings) {
		// Reset the coorrdinate system once the transition is done.
		var elem = this.$();
		var showSettings = (inOptShowSettings || !elem.hasClassName('flipped'));
		if (showSettings) {
			elem.addClassName('staged');
			setTimeout(function() {
				elem.addClassName('flipped');
				setTimeout(function() {
					elem.addClassName('focused');
				}, 700);
			}, 50);
		} else {
			elem.addClassName('reset').removeClassName('flipped');
			setTimeout(function() {
				elem.removeClassName('reset');
			}, 1);
			setTimeout(function() {
				elem.removeClassName('focused');
				setTimeout(function() {
					elem.removeClassName('staged');
				}.bind(this), 50);
			}.bind(this), 750);
		}
		this.mFlipped = showSettings;
	},
	stopPropagation: function(inEvent) {
		inEvent.stopPropagation();
	},
	handleInfoButtonClicked: function(inEvent) {
		var markup = (this.getFrameContent() || this.mContent.getRecordPropertyForPath('extendedAttributes.markup'));
		var textarea = this.$().down('textarea');
		if (markup != undefined) textarea.value = markup;
		// Resize the text area to fit the sandbox.
		var containerLayout = this.$('.flipside').getLayout();
		textarea.setStyle({
			'height': (containerLayout.get('height') - 14 - 50) + 'px',
			'margin': '10px 0px 0px 12px',
			'width': (containerLayout.get('width') - 14 - 24) + 'px'
		});
		this.flip(true);
		this._reactivate();
	},
	handleDoneButtonClicked: function(inEvent) {
		var markup = this.mContent.getRecordPropertyForPath('extendedAttributes.markup');
		var textarea = this.$().down('textarea');
		var changes = $F(textarea);
		if (changes != markup && !changes.isWhitespace()) {
			this.mContent.setRecordPropertyForPath('extendedAttributes.markup', changes);
			this.renderFrame();
			this.flip(false);
			return;
		}
		this.flip(false);
	},
	handleMatchStylesButtonClicked: function(inEvent) {
		if ($('sandbox_block_match_styles_dialog')) Element.remove('sandbox_block_match_styles_dialog');
		dialogManager().drawDialog('sandbox_block_match_styles_dialog', ["_Editor.Block.Sandbox.Edit.MatchStyle.Dialog.Description".loc()], "_Editor.Block.Sandbox.Edit.MatchStyle.Dialog.OK".loc(), null, "_Editor.Block.Sandbox.Edit.MatchStyle.Dialog.Title".loc());
		// Migrate this sandbox in place and remove this block.
		var callback = function() {
			this.handleDoneButtonClicked();
			dialogManager().showProgressMessage("_Editor.Migration.Progress.MatchStyles".loc());
			var markup = (this.$().down('textarea').value || "");
			var migrated = globalEditorMigrationController().migrate(markup);
			if (migrated) {
				// If this sandbox is inside a text block (it should be) create a selection that spans the root
				// element of this block before migrating. The result of the migration will replace this block
				// using contentEditable insertHTML/pasteHTML commands.
				var directBlockParent = this.$().up('.block');
				if (directBlockParent && directBlockParent.getAttribute('data-type') == 'text') {
					var wrapperSpan = Element.wrap(this.$(), 'span');
					wrapperSpan.focus();
					globalEditorTextSelectionDelegate().selectAllChildren(wrapperSpan);
					textBlockDelegate().appendMigratedContentToBlockAtSelection(this.mContent.mParentContainer, migrated, false);
				}
			}
			dialogManager().hideProgressMessage();
		}.bind(this);
		// Confirm first.
		dialogManager().show('sandbox_block_match_styles_dialog', null, callback, inEvent.findElement('.matchstyles'), false, undefined, false);
	}
});

globalEditorPluginManager().registerBlockType('sandbox', 'CC.WikiEditor.SandboxBlock', {
	mEditorToolbarItem: new CC.WikiEditor.EditorToolbarItem({
		mDisplayTitle: "_Editor.Toolbar.Block.Sandbox.Title".loc(),
		mTooltip: "_Editor.Toolbar.Block.Sandbox.Tooltip".loc(),
		mClassName: 'sandboxblock',
		mIsEnabled: true,
		mKey: 'sandbox',
		mAction: 'addBlock',
		mTarget: sandboxBlockDelegate()
	})
});
