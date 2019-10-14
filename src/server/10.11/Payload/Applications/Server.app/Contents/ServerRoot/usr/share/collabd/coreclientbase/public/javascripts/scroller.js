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

// Scroller capable of scrolling an element inside a overflow scroll container.

CC.Scroller = Class.create({
	initialize: function(/* [options] */) {
		if (arguments.length && arguments[0]) Object.extend(this, arguments[0]);
	},
	scrollToInContainer: function(inElement, inContainer) {
		var elem = $(inElement), container = $(inContainer);
		if (!elem || !container) return true;
		// var containerOffsetTop = container.cumulativeOffset().top;
		var containerHeight = container.getLayout().get('padding-box-height');
		// Find the offset of the child element.
		var elementPositionOffset = Element.positionedOffset(elem);
		// var elementOffsetTop = Element.cumulativeOffset(elem).top;
		// var elementScrollOffsetTop = Element.cumulativeScrollOffset(elem).top;
		var elementHeight = elem.getLayout().get('padding-box-height');
		// Calculate the scroll.
		var scrollFrom = container.scrollTop;
		var containerMidpoint = container.scrollTop + Math.floor(containerHeight / 2);
		var scrollTo = elementPositionOffset.top;
		if (elementPositionOffset.top > containerMidpoint) scrollTo = (elementPositionOffset.top + elementHeight - containerHeight);
		// Scroll, but only if we have to.
		var topEdgeInBounds = (elementPositionOffset.top >= scrollFrom);
		var bottomEdgeInBounds = ((elementPositionOffset.top + elementHeight) <= (scrollFrom + containerHeight));
		if (topEdgeInBounds && bottomEdgeInBounds) return;
		if (this.mScrollEffect) this.mScrollEffect.cancel();
		this.mScrollEffect = new Effect.Tween(container,
			scrollFrom,
			scrollTo,
			{duration: 0.4},
			function(p) { container.scrollTop = p.round(); }
		);
	},
	scrollTo: function(inElement) {
		return Element.scrollTo(inElement);
	}
});
