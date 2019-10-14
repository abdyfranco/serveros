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
//= require "./keyboard.js"

var ModalDialogManager = Class.createWithSharedInstance('dialogManager');
Object.extend(Object.extend(ModalDialogManager.prototype, CC.Keyboard.Mixins.Responder), {
	mNowShowing: false,
	mSlideFromElement: null,
	mProgressMessageDelay: 700,
	mProgressMessageHideDelay: 850,
	initialize: function(/*[options]*/) {
		bindEventListeners(this, ['handleCancelClick', 'handleOKClick', 'handleDialogMouseDown', 'handleDialogDrag', 'handleDialogEndDrag']);
		if($('dialog_mask')){
			this.mMaskWidget = $('dialog_mask');
		}else{
			// ##5357320 IE6: dialog mask shows up incorrectly
			this.mMaskWidget = Builder.node('div', {id:'dialog_mask', style:(browser().isIE6() ? "position:absolute;top:0;left:0;width:100%;filter:alpha(opacity='50');display:none" : 'display:none')});
			document.body.appendChild(this.mMaskWidget);
		}
		if (arguments.length > 0) Object.extend(this, arguments[0]);
	},
	drawDialog: function(inID, inFields, inOKTitle, inOptFormAction, inOptDialogTitle, inOptCancelTitle) {
		
		var tabIndexOk = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_OK_BUTTON);
		var tabIndexCancel = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_CANCEL_BUTTON);
		
		// create basic dialog and table structure	
		var tbody = Builder.node('tbody');
		var dialog = Builder.node('div', {id:inID, className:'dialog chrome', style:'display:none', 'role':'dialog', 'aria-label': ((inOptDialogTitle && inOptDialogTitle) || (inID+'_header') || '')}, [
			Builder.node('div', {className:'dialog_contents'}, [
				Builder.node('form', {id:inID+'_form', method:(inOptFormAction?'post':'get'), action:inOptFormAction||'#', enctype:(inOptFormAction?'multipart/form-data':'application/x-www-form-urlencoded'), target:(inOptFormAction?'upload_iframe':'_self')}, [
					Builder.node('table', {'role': 'presentation'}, [
						Builder.node('thead', [Builder.node('tr', [
								Builder.node('td', {colSpan:'2'}, ((inOptDialogTitle && inOptDialogTitle) || (inID+'_header') || ''))
							])
						]),
						tbody
					])
				])
			])
		]);
		
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_MOVE_SIMPLETEXT);
		
		// set up the fields
		for (index = 0; index < inFields.length; index++) {
			var field = inFields[index];
			var td = Builder.node('td');
			var labelText = field.label ? field.label : "";
			var label = Builder.node('label', labelText); // ##5210590 Accessibility: drawDialog does not label input fields
			var headerArgs = (labelText == '' ? {className:'dialog_empty_header'} : {});
			if (field.contents) {
				tbody.appendChild(Builder.node('tr', [
					// ##5389500
					Builder.node('th', headerArgs, label),
					td
				]));
				replaceElementContents(td, field.contents, true);
				if (field.id) td.id = field.id;
				var inputs = td.getElementsByTagName('input');
				if(inputs.length) label.setAttribute('for', inputs.item(0).getAttribute('id'));
			}
			else {
				var fieldValue = field.contents || field;
				Element.addClassName(td, 'dialog_description');
				td.colSpan = '2';
				if (field.id) td.id = field.id;
				tbody.appendChild(Builder.node('tr', [td]));
				replaceElementContents(td, fieldValue, field.contents);
			}
		}
		// OK and cancel buttons		
		tbody.appendChild(Builder.node('tr', [
			Builder.node('td', {'role': 'presentation', colSpan:'2', className:'form_buttons'}, [
				Builder.node('div', {'role': 'presentation', className:'submit'}, [
					Builder.node('input', {'tabindex': tabIndexOk, 'role': 'button', type:'submit', className:'primaryaction', id:inID+'_ok', value:inOKTitle, name:'ok_button'}),
					Builder.node('input', {'tabindex': tabIndexCancel, 'role': 'button', type:'button', className:'secondaryaction', id:inID+'_cancel', value:((inOptCancelTitle && inOptCancelTitle) || "_Dialogs.Cancel".loc()), name:'cancel_button'})
				])
			])
		]));
		// add the dialog to the document
		document.body.appendChild(dialog);
		if (!inOptFormAction) $(inID+'_form').onsubmit = invalidate;
		return dialog;
	},
	focus: function() {
		if (this.mFocusField) {
			if (this.mFocusField.activate) this.mFocusField.activate();
		}
		else {
			var inputs = this.mActiveElement.getElementsByTagName('input');
			$A(inputs).detect(function(elm) {
				if (elm.type && elm.focus && (elm.type.toLowerCase() == 'text' || elm.type.toLowerCase() == 'search') && (!Element.hasClassName(elm, 'search_field')) && (!elm.disabled)) {
					$(elm).activate();
					return true;
				}
				return false;
			});
		}
		// TODO: move this into the test tool itself
		if (window.unitTestHandler) unitTestHandler.messageFromJS_('dialog');
		globalNotificationCenter().publish('DIALOG_FOCUS', this.mActiveElement);
	},
	prepareToShow: function(inElement, inCancelCallback, inOKCallback, inOptSlideFrom, inOptShowSpinner, inOptFocusField, inOptAllowSubmission) {
		this.hide();
		this.mShowSpinner = inOptShowSpinner;
		this.mFocusField = $(inOptFocusField);
		this.mAllowSubmission = inOptAllowSubmission;
		inOptSlideFrom = inOptSlideFrom || this.mSlideFromElement;
		//this.mActiveParent = (inOptSlideFrom ? $(inOptSlideFrom) : null); ##8531406
		if (this.mTimer) {
			clearTimeout(this.mTimer);
			delete this.mTimer;
		}
		this.mActiveElement = $(inElement);
		this.mCancelCallback = inCancelCallback;
		this.mOKCallback = inOKCallback;
		// ##5357320 IE6: dialog mask shows up incorrectly
		if (browser().isIE6()) this.mMaskWidget.style.height = (document.viewport.getHeight()+document.viewport.getScrollOffsets().top)+'px';
		globalNotificationCenter().publish('DIALOG_WILL_SHOW', this.mActiveElement);
		Element.show(this.mMaskWidget);
	},
	finishShowing: function() {
		// look for a cancel button
		this.mCancelElement = $(this.mActiveElement.id+'_cancel');
		if (this.mCancelElement) {
			Event.observe(this.mCancelElement, 'click', this.handleCancelClick);
		}
		this.mFormElement = $(this.mActiveElement.id+'_form');
		if (this.mFormElement) {
			if (browser().isWebKit() && (this.mFormElement.enctype == 'multipart/form-data') && $(this.mActiveElement.id+'_ok')) {
				$(this.mActiveElement.id+'_ok').type = 'button';
				this.mObservingInfo = {elm:this.mActiveElement.id+'_ok', evt:'click'};
				Event.observe(this.mActiveElement.id+'_ok', 'click', this.handleOKClick);
			}
			else {
				this.mObservingInfo = {elm:this.mFormElement, evt:'submit'};
				Event.observe(this.mFormElement, 'submit', this.handleOKClick);
			}
		}
		if (this.mCancelElement) this.mCancelElement.disabled = false;
		if ($(this.mActiveElement.id+'_ok')) $(this.mActiveElement.id+'_ok').disabled = false;
		// handle dialog drags
		Event.observe(this.mActiveElement, 'mousedown', this.handleDialogMouseDown);
		this.becomeFirstResponder();
		this.mNowShowing = true;
		
		var firstAction = this.mActiveElement.querySelector('input[type="submit"]');
		if(firstAction) firstAction.focus();
	},
	show: function(inElement, inCancelCallback, inOKCallback, inOptSlideFrom, inOptShowSpinner, inOptFocusField, inOptAllowSubmission) {
		this.prepareToShow(inElement, inCancelCallback, inOKCallback, inOptSlideFrom, inOptShowSpinner, inOptFocusField, inOptAllowSubmission);
		if (this.mActiveParent && (inElement != this.mProgressElement)) {
			window.scrollTo(0, 0);
			this.mActiveElement.style.height = ''; // revert to natural size
			Element.setStyle(this.mActiveParent, {position:'relative', zIndex:'504'});
			Element.addClassName(this.mActiveParent, 'dialog_parent');
			// position the sheet
			this.mActiveElement.style.visibility = 'hidden';
			Element.show(this.mActiveElement);
			var cloneOptions = {
				setWidth: false,
				setHeight: false,
				offsetLeft: (this.mActiveParent.offsetWidth / 2) - (this.mActiveElement.offsetWidth / 2),
				offsetTop: Element.getHeight(this.mActiveParent)
			};
			Position.clone(this.mActiveParent, this.mActiveElement, cloneOptions);
		}
		else {
			// center the dialog
			this.mActiveElement.style.visibility = 'hidden';
			Element.show(this.mActiveElement);
			var elementBounds = offsetBoundsForDiv(this.mActiveElement.down('table') || this.mActiveElement);
			var leftd = ((window.innerWidth || document.body.offsetWidth) / 2) - (elementBounds[2] / 2);
			var topd = ((window.innerHeight || document.documentElement.offsetHeight) / 3) - (elementBounds[3] / 2); // skew towards top
			leftd = Math.max(leftd, 0);
			topd = Math.max(topd, 0) + document.viewport.getScrollOffsets().top;
			this.mActiveElement.style.left = leftd+'px';
			this.mActiveElement.style.top = topd+'px';
		}
		// show the sheet
		if (browser().isGecko()) this.mActiveElement.style.position = 'fixed';
		Element.hide(this.mActiveElement);
		this.mActiveElement.style.visibility = 'visible';
		this.mActiveElement.show();
		this.focus();
		
		// IE doesn't support fixed positioning, so match the size of the window
		if (browser().isIE()) {
			Element.setStyle(this.mMaskWidget, {width:document.body.offsetWidth+'px',height:document.documentElement.offsetHeight+'px'});
		}
		this.finishShowing();
		
		// Temporary disabling background items when modal dialog is open in order to avoid bad tabindex-ing
		if (inElement != this.mProgressElement) {
			// Do not modify the accessibility tab index for the progress message dialog.
			accessibility().makeRootViewsAriaHidden(false);
		}
		
		var firstAction = this.mActiveElement.querySelector('input[type="submit"]');
		if(firstAction) firstAction.focus();
	},
	handleDialogMouseDown: function(inEvent) {
		if (inEvent.findElement('thead') || inEvent.findElement('h2')){
			if (Element.hasClassName(inEvent.findElement('table'), 'tableEditor')){
				return; // don't cancel mousedown events on thead in tableEditor table
			} else if (inEvent.findElement('h2') && !inEvent.findElement('h2').up('div.dialog').id == 'tableDialog'){
				return; // only cancel mousedown events on h2 if it is the tableDialog
			}
			Event.stop(inEvent);
			this.mDragPos = [inEvent.pointerX(), inEvent.pointerY()];
			observeEvents(this, d, {mousemove:'handleDialogDrag', mouseup:'handleDialogEndDrag'});
		}
	},
	handleDialogDrag: function(inEvent) {
		Event.stop(inEvent);
		this.mActiveElement.style.left = (parseFloat(this.mActiveElement.style.left) + (inEvent.pointerX() - this.mDragPos[0])) + 'px';
		this.mActiveElement.style.top = (parseFloat(this.mActiveElement.style.top) + (inEvent.pointerY() - this.mDragPos[1])) + 'px';
		this.mDragPos = [inEvent.pointerX(), inEvent.pointerY()];
		return false;
	},
	handleDialogEndDrag: function(inEvent) {
		stopObservingEvents(this, d, {mousemove:'handleDialogDrag', mouseup:'handleDialogEndDrag'});
	},
	showProgressMessage: function(inMessage, inOptShowProgressBar, inOptCancelCallback, inOptShowImmediately) {
		dialogManager().showingProgressMessage = true;
		if (!this.mProgressElement) {
			this.mProgressElement = this.drawDialog('progress_message_dialog', [{id:'progress_spinner', contents:"<span>\u00A0</span>"}, {id:'progress_message', contents:"\u00A0"}], "_Dialogs.Cancel".loc());
			$('progress_message_dialog_ok').remove();
		}
		if (inOptShowProgressBar) {
			Element.removeClassName(this.mProgressElement, 'indeterminate');
			this.mProgressBar = Builder.node('div', {className:'progress_bar'}, [Builder.node('div', {style:'width:0'}, "\u00A0")]);
			replaceElementContents(this.mProgressElement.down('thead td'), inMessage);
			replaceElementContents('progress_message', this.mProgressBar);
		}
		else {
			replaceElementContents('progress_message', inMessage);
			Element.addClassName(this.mProgressElement, 'indeterminate');
			removeAllChildNodes(this.mProgressElement.down('thead td'));
			if (inOptCancelCallback) {
				this.mProgressElement.down('td.form_buttons').show();
			} else {
				this.mProgressElement.down('td.form_buttons').hide();
			}
		}
		if (this.mTimer) {
			clearTimeout(this.mTimer);
		}
		this.mTimer = setTimeout(function() {
			// clear any hide delay timers
			if (this.mHideDelayTimer) {
				clearTimeout(this.mHideDelayTimer);
				delete this.mHideDelayTimer;
			}
			// set up a new hide delay timer (we shouldn't be open for less than 1 second)
			this.mHideDelayTimer = setTimeout(function() {
				delete this.mHideDelayTimer;
				// if we've tried to hide, hide now
				if (this.mShouldHideLater) {
					this.mShouldHideLater = false;
					this.hideProgressMessage();
				}
			}.bind(this), this.mProgressMessageHideDelay);
			this.show(this.mProgressElement, inOptCancelCallback, invalidate);
		}.bind(this), (inOptShowImmediately) ? 0 : this.mProgressMessageDelay);
		delete dialogManager().showingProgressMessage;
	},
	hide: function(inOptElement, inPerformFakeHide) { // so we don't remove active file upload forms from the view hierarchy
		if (!this.mTargeted) globalInfoPanelManager().hide(inOptElement, inPerformFakeHide);
		if (this.mActiveElement && this.mActiveElement == $('progress_message_dialog') && !inOptElement) {
			this.hideProgressMessage();
			return;
		}
		if (this.mObservingInfo) {
			Event.stopObserving(this.mObservingInfo.elm, this.mObservingInfo.evt, this.handleOKClick);
			delete this.mObservingInfo;
		}
		if (browser().isWebKit() && this.mProgressElement && (this.mActiveElement == this.mProgressElement)) {
			$$('div.dialog').each(function(dialogDiv) {
				if (dialogDiv.style.visibility == 'hidden') {
					Element.hide(dialogDiv);
					dialogDiv.style.visibility = '';
				}
			});
		}
		if (inOptElement && (this.mActiveElement != $(inOptElement))) return false;
		if (this.mTimer) {
			clearTimeout(this.mTimer);
			delete this.mTimer;
		}
		if (this.mCancelElement) {
			if (this.mShowSpinner) this.mCancelElement.disabled = false;
			Event.stopObserving(this.mCancelElement, 'click', this.handleCancelClick);
			delete this.mCancelElement;
		}
		if (this.mShowSpinner) {
			$(this.mActiveElement.id+'_ok').disabled = false;
			$A(this.mActiveElement.getElementsByClassName('dialog_progress_row')).invoke('removeClassName', 'dialog_progress_row');
			this.mShowSpinner = false;
		}
		if (this.mActiveElement) {
			Event.stopObserving(this.mActiveElement, 'mousedown', this.handleDialogMouseDown);
			if (this.mEffect) this.mEffect.cancel();
			var elementForm = $(this.mActiveElement).down('form');
			if (browser().isWebKit() && dialogManager().showingProgressMessage && elementForm && elementForm.method == 'post') {
				this.mActiveElement.style.visibility = 'hidden';
			}
			else {
				Element.hide(this.mActiveElement);
			}
			Element.hide(this.mMaskWidget);
			globalNotificationCenter().publish('DIALOG_HIDDEN', this.mActiveElement);
		}
		if (this.mActiveParent) {
			Element.setStyle(this.mActiveParent, {position:'', zIndex:''});
			Element.removeClassName(this.mActiveParent, 'dialog_parent');
		}
		this.loseFirstResponder();
		this.mNowShowing = false;
		
		// Bring background items back to foreground when closing modal dialog to bring back original tabindex-ing
		if (this.mActiveElement && (this.mActiveElement != this.mProgressElement)) {
			// Do not modify the accessibility tab index for the progress message dialog.
			accessibility().makeRootViewsAriaVisible(false);
		}
		
		if (this.mActiveElement) {
			delete this.mActiveElement;
		}
	},
	shakeDialog: function() {
		var element = $(this.mActiveElement);
		element = $(element);
		var oldStyle = { left: element.getStyle('left') };
		  return new Effect.Move(element, 
		    { x:  10, y: 0, duration: 0.05, afterFinishInternal: function(effect) {
		  new Effect.Move(effect.element,
		    { x: -20, y: 0, duration: 0.1,  afterFinishInternal: function(effect) {
		  new Effect.Move(effect.element,
		    { x:  20, y: 0, duration: 0.1,  afterFinishInternal: function(effect) {
		  new Effect.Move(effect.element,
		    { x: -20, y: 0, duration: 0.1,  afterFinishInternal: function(effect) {
		  new Effect.Move(effect.element,
		    { x:  20, y: 0, duration: 0.1,  afterFinishInternal: function(effect) {
		  new Effect.Move(effect.element,
		    { x: -10, y: 0, duration: 0.05, afterFinishInternal: function(effect) {
		      effect.element.setStyle(oldStyle);
		}}); }}); }}); }}); }}); }});
	},
	willResize: function() {
		if (!this.mActiveElement) return;
		var contentsTable = this.mActiveElement.down('table');
		this.mOldStyles = {
			top: parseInt(this.mActiveElement.style.top, 10),
			left: parseInt(this.mActiveElement.style.left, 10),
			width: this.mActiveElement.getWidth(),
			height: this.mActiveElement.getHeight()
		};
		if (contentsTable) {
			this.mOldStyles.tableWidth = contentsTable.getWidth();
			this.mOldStyles.tableHeight = contentsTable.getHeight();
		}
		// move the dialog temporarily to upper/left so that nothing compresses artificially
		this.mActiveElement.setStyle({left:'0', top:'0'});
	},
	didResize: function() {
		if (!this.mActiveElement) return;
		if (!this.mOldStyles) return;
		// get the destination style dimensions
		Element.setOffsetWidth(this.mActiveElement, this.mActiveElement.getWidth());
		Element.setOffsetHeight(this.mActiveElement, this.mActiveElement.getHeight());
		var changedWidth = parseInt(this.mActiveElement.style.width, 10);
		var changedHeight = parseInt(this.mActiveElement.style.height, 10);
		// if there's a contents table, get its dimensions as well
		var contentsTable = this.mActiveElement.down('table');
		var changedTableWidth = 0;
		var changedTableHeight = 0;
		if (contentsTable && this.mOldStyles.tableWidth) {
			Element.setOffsetWidth(contentsTable, contentsTable.getWidth());
			Element.setOffsetHeight(contentsTable, contentsTable.getHeight());
			changedTableWidth = parseInt(contentsTable.style.width, 10);
			changedTableHeight = parseInt(contentsTable.style.height, 10);
		}
		// move back to its original position
		this.mActiveElement.setStyle({left:this.mOldStyles.left+'px', top:this.mOldStyles.top+'px'});
		// if there's a contents table, lock its size so we don't wrap text weirdly
		if (contentsTable && this.mOldStyles.tableWidth) {
			Element.setOffsetWidth(contentsTable, this.mOldStyles.tableWidth);
			Element.setOffsetHeight(contentsTable, this.mOldStyles.tableHeight);
		}
		// set back to the original size
		Element.setOffsetWidth(this.mActiveElement, this.mOldStyles.width);
		Element.setOffsetHeight(this.mActiveElement, this.mOldStyles.height);
		// figure out how far left to move the dialog to keep it centered
		var delta = changedWidth - parseInt(this.mActiveElement.style.width, 10);
		var changedLeft = Math.round(this.mOldStyles.left-(delta/2));
		// if we're moving off-screen, fix that
		changedLeft = Math.max(Math.min(changedLeft, document.viewport.getWidth() - changedWidth - 30), 10);
		// build the new style string for the morph effect
		var resizedStyleString = 'left:'+changedLeft+'px;width:'+changedWidth+'px;height:'+changedHeight+'px';
		// cancel any current resize effects and start a new one
		if (this.mResizeEffect) this.mResizeEffect.cancel();
		var effects = $A([new Effect.Morph(this.mActiveElement, {style:resizedStyleString})]);
		if (contentsTable) {
			effects.push(new Effect.Morph(contentsTable, {style:'width:'+changedTableWidth+'px;height:'+changedTableHeight+'px'}));
		}
		this.mResizeEffect = new Effect.Parallel(effects, {duration:0.20, afterFinish: function(eff) {
			// after we're finished, remove the hard-coded styles
			this.mActiveElement.setStyle({width:'', height:''});
			if (contentsTable) contentsTable.setStyle({width:'', height:''});
		}.bind(this)});
		delete this.mOldStyles;
	},
	hideProgressMessage: function() {
		if (this.mTimer) {
			clearTimeout(this.mTimer);
			delete this.mTimer;
		}
		if (this.mActiveElement == this.mProgressElement) {
			if (this.mHideDelayTimer) {
				this.mShouldHideLater = true;
			}
			else {
				this.hide('progress_message_dialog');
			}
		}
	},
	handleCancelClick: function(inEvent) {
		this.hide();
		if (this.mCancelCallback) this.mCancelCallback();
	},
	handleOKClick: function(inEvent) {
		var elm = Event.element(inEvent);
		if (!this.mAllowSubmission) Event.stop(inEvent);
		if (elm && elm.type && elm.form && (elm.type == 'button') && this.mAllowSubmission) elm.form.submit();
		if (this.mShowSpinner) {
			if (this.mCancelElement) this.mCancelElement.disabled = true;
			$(this.mActiveElement.id+'_ok').disabled = true;
			$A(this.mActiveElement.getElementsByClassName('form_buttons')).invoke('addClassName', 'dialog_progress_row');
		}
		else {
			this.hide();
		}
		if (this.mOKCallback) this.mOKCallback();
		if (!this.mAllowSubmission) return false;
	},
	handleKeyboardNotification: function(inMessage, inObject, inOptExtras) {
		if (inMessage == CC.Keyboard.NOTIFICATION_DID_KEYBOARD_ESC) {
			this.handleCancelClick();
		}
		return true;
	}
});

var InfoPanelManager = Class.createWithSharedInstance('globalInfoPanelManager');
Object.extend(Object.extend(InfoPanelManager.prototype, ModalDialogManager.prototype), {
	mTargeted: true,
	drawInfoPanel: function(inID, inFields) {
		this.drawDialog(inID, inFields, 'OK'); // FIXME: use an empty string when we have the dialog styled
		Element.addClassName(inID, 'infopanel');
		$(inID).appendChild(Builder.node('div', {className:'infopanel_norgie'}, [Builder.node('span')]));
		if (!this.hasBoundListnener) {
			this.hasBoundListnener = true;
			this.handleHideClick = this.handleHideClick.bindAsEventListener(this);
		}
	},
	show: function(inElement, inCancelCallback, inOKCallback, inSlideFrom, inOptShowSpinner, inOptFocusField, inOptAllowSubmission) {
		this.prepareToShow(inElement, inCancelCallback, inOKCallback, inSlideFrom, inOptShowSpinner, inOptFocusField, inOptAllowSubmission);
		this.mMaskWidget.hide();
		// add rounded corners, etc
		Element.addClassName(this.mActiveElement, 'targeted_dialog');
		// overcome firefox cursor bug
		if (browser().isGecko()) this.mActiveElement.style.position = 'fixed';
		Position.clone(inSlideFrom, this.mActiveElement, {limitWithScrollbars:true, offsetLeft:11, offsetTop:-2, setWidth:false, setHeight:false});
		var norgieElm = this.mActiveElement.down('div.infopanel_norgie');
		norgieElm.style.top = ((inSlideFrom.offsetHeight / 2) - 14) + 'px';
		// figure out if we should open above
		var sz = Element.getInvisibleSize(this.mActiveElement);
		if (parseInt(this.mActiveElement.style.top, 10) + sz[1] > (document.viewport.getHeight() - inSlideFrom.cumulativeScrollOffset()[1]) - 10) {
			this.mActiveElement.style.top = (parseInt(this.mActiveElement.style.top, 10) - sz[1] + inSlideFrom.offsetHeight + 3) + 'px';
			norgieElm.style.bottom = norgieElm.style.top;
			norgieElm.style.top = '';
		}
		else {
			this.mActiveElement.style.top = (parseInt(this.mActiveElement.style.top, 10) + 6) + 'px';
		}
		// show the panel
		this.mActiveElement.setStyle({opacity:0});
		this.mActiveElement.show();
		this.mActiveElement.addClassName('animates_opacity');
		setTimeout(function() {this.mActiveElement.setStyle({opacity:0.9})}.bind(this), 10);
		this.finishShowing();
		Event.observe(document, 'mousedown', this.handleHideClick);
		Event.observe(window, 'resize', this.handleHideClick);
	},
	handleHideClick: function(inEvent)
	{
		this.mActiveElement.removeClassName('animates_opacity');
		Event.stopObserving(document, 'mousedown', this.handleHideClick);
		Event.stopObserving(window, 'resize', this.handleHideClick);
		this.hide();
	}
});
