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
//= require "../ext/object.js"
//= require "../keyboard.js"

// Base view class.

CC.Mvc.View = Class.create(CC.Object, CC.Keyboard.Mixins.Responder, {
	// The content of this view. Expected to be a CC.Mvc.ObjectController.
	mContent: null,
	// The root element of this view.
	mParentElement: null,
	// Has this view rendered yet?
	mRendered: false,
	// Is this view displayed or hidden?
	mIsVisible: false,
	// The subviews of this view.
	mSubviews: null,
	// The parent view for this view (if it exists).
	mSuperview: null,
	// The class name(s) for this view.
	mClassName: null,
	mClassNames: null,
	// Minimum loading spinner duration for this view.
	mMinimumLoadingTimer: 250,
	initialize: function($super) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		this.mSubviews = new Array();
	},
	// Returns the current rendered version of this view, or optionally a child
	// of this view matching a given selector.
	$: function(inOptSelector) {
		if (inOptSelector) {
			var result = this.mParentElement.select(inOptSelector);
			if (CC.typeOf(result) == CC.T_ARRAY) return result[0];
			return result;
		}
		return this.mParentElement;
	},
	// Forces a render of this view.
	forceRender: function() {
		if (this.rendered()) return this.mParentElement;
		return this._render();
	},
	// Private function for rendering and caching this view. You should not
	// normally override this method. Registers event handlers for this view.
	_render: function() {
		var rendered = this.render();
		if (!rendered) rendered = document.createElement('div');
		rendered.addClassName('cc-view');
		this.handleDidRenderView({'element': Element.extend(rendered)});
		if (this.mClassName) this.mParentElement.addClassName(this.mClassName);
		if (this.mClassNames) this.mParentElement.addClassName(this.mClassNames.join(" "));
		this.makeAccessible();
		return this.mParentElement;
	},
	// Renders and attaches any necessary event handlers to this view. Returns a DOM
	// node ready to be appended to the page.
	render: function() { /* Interface */ },
	// Private function for rendering this view as an HTML fragment. You should not normally
	// override this method.
	_renderAsHTML: function() { /* Interface */ },
	// Renders and returns the contents of this view as an HTML fragment. Returns a tuple of
	// fragment identifier and fragment content. It is expected that the fragment identifer
	// returns corresponds to a class name that can be used to query the DOM later.
	renderAsHTML: function() { /* Interface */ },
	// Make views accessible using the accessible OS X feature
	makeAccessible: function() { /* Interface */},	
	// Private function for registering event handlers. You should not normally override this
	// method.
	_registerEventHandlers: function() {
		this.registerEventHandlers();
	},
	// Is this view rendered?
	rendered: function() {
		return (this.mRendered == true);
	},
	// Registers any event handlers on your rendered view. Called once the view has been
	// rendered and appended to the DOM.
	registerEventHandlers: function() { /* Interface */ },
	// Private observer of view rendering. You should not normally override this method.
	handleDidRenderView: function(inOptInfo) {
		if (inOptInfo && inOptInfo.element) {
			this.mParentElement = Element.extend(inOptInfo.element);
			this._registerEventHandlers();
			this.mRendered = this.mIsVisible = true;
			if (browser().isMobileSafari()) {
				this.mParentElement.select('.clickable').each(function(clickable) {
					clickable.setAttribute('onclick', "function() { return false; }");
				});
			}
		}
	},
	// Appends a subview to this view (by tracking the view instance and appending its
	// rendered element to the parent view of this element). Note that calling this will
	// automatically render the passed subview if it has not yet been drawn. Accepts an
	// optional selector argument that can be used when you want to append this child view
	// at a specific position in the tree of this rendered view.
	addSubview: function(inSubview, inOptPositionSelector, inOptInsertAtTop) {
		if (!CC.kindOf(inSubview, CC.Mvc.View)) {
			logger().error("Cannot append %o as a subview because it does not appear to be a CC.Mvc.View", inBlock);
			return undefined;
		}
		if (!this.mRendered) this._render();
		if (!inSubview.mRendered) inSubview._render();
		this.mSubviews.push(inSubview);
		inSubview.mSuperview = this;
		if (inOptPositionSelector) {
			var selected = this.mParentElement.down(inOptPositionSelector);
			if (selected) {
				if (inOptInsertAtTop) {
					Element.insert(selected, {'top': inSubview.mParentElement});
				} else {
					selected.appendChild(inSubview.mParentElement);
				}
				return;
			}
		}
		if (inOptInsertAtTop) {
			Element.insert(this.mParentElement, {'top': inSubview.mParentElement});
		} else {
			this.mParentElement.appendChild(inSubview.mParentElement);
		}
	},
	// Adds a subview to this view (as above), but allows you to specify where it should
	// appear within the view hierarchy.
	insertSubviewAtIndex: function(inSubview, inIndex, inOptPositionSelector) {
		if (!CC.kindOf(inSubview, CC.Mvc.View)) {
			logger().error("Cannot append %o as a subview because it does not appear to be a CC.Mvc.View", inBlock);
			return undefined;
		}
		
		var container = this.mParentElement;
		if (inOptPositionSelector) {
			container = this.mParentElement.down(inOptPositionSelector) || this.mParentElement;
		}
		
		var children = Element.childElements(container);
		if (inIndex < 0 || inIndex > children.length) {
			logger().error("Cannot append %o as a subview because the index %d is invalid", inSubview, inIndex);
			return undefined;
		}
		
		if (!this.mRendered) this._render();
		if (!inSubview.mRendered) inSubview._render();
		this.mSubviews.push(inSubview);
		inSubview.mSuperview = this;
		
		if (inIndex == children.length) {
			container.appendChild(inSubview.mParentElement);
		} else {
			Element.insert(children[inIndex], {'before': inSubview.mParentElement});
		}
	},
	// Removes a given array of subviews from this view.
	removeSubviews: function(inSubviews) {
		var currentSubviews = this.mSubviews, subviewsToRemove = (inSubviews || []), subviewsToKeep = [], subview, subviewElement;
		for (var idx = 0; idx < currentSubviews.length; idx++) {
			subview = currentSubviews[idx];
			if (subviewsToRemove.indexOf(subview) != -1) {
				subviewElement = subview.$();
				if (subviewElement && subviewElement.parentNode) {
				    subviewElement.parentNode.removeChild(subviewElement);
				}
			} else {
				subviewsToKeep.push(subview);
			}
		}
		this.mSubviews = subviewsToKeep;
	},
	// Removes all subviews from this view.
	removeAllSubviews: function() {
		this.removeSubviews(this.mSubviews);
	},
	// Helper functions for hiding/showing this view.
	setVisible: function(inShouldBeVisible) {
		if (inShouldBeVisible == true) {
			Element.show(this.mParentElement);
			this.mIsVisible = true;
		} else {
			Element.hide(this.mParentElement);
			this.mIsVisible = false;
		}
	},
	// Marks this view as loading.
	markAsLoading: function(inShouldBeLoading) {
		if (inShouldBeLoading == true) {
			this.mParentElement.addClassName('loading');
			this.mIsLoading = true;
		} else {
			if (this.mMarkAsLoadingFalseTimer) clearTimeout(this.mMarkAsLoadingFalseTimer);
			this.mMarkAsLoadingFalseTimer = setTimeout(function() {
				this.mParentElement.removeClassName('loading');
				this.mIsLoading = false;
			}.bind(this), this.mMinimumLoadingTimer);
		}
	}
});
