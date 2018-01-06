// node:		the node to apply the opacity fade in/out to
// targetNode:	the node which will trigger the fade in/out with its mouse events

function FadeInOutNode(node, outNode, targetNode, onclick)
{
	/* Read-write properties */
    this.onclick = onclick;
    
    /* Internal */
	this._targetNode = targetNode;
	this._node = node;
	this._outNode = outNode;
    this._labelshown = false;
		
	// For JavaScript event handlers
	var _self = this;
	
	this._updateOpacity = function(animation, now, first, done)
	{
		_self._node.style.opacity = now;
		if(_self._outNode) {
			_self._outNode.style.opacity = Math.abs(1 - now);
		}
	}
	
	this._animationComplete = function()
	{
		delete _self._animation;
		delete _self._animator;
	}
	
	this._targetNodeMove = function(event)
	{
		if (_self._outdelay !== undefined)
		{
			clearTimeout(_self._outdelay);
			delete _self._outdelay;
		}
		if (_self._labelshown)
			return;
		
		var from = 0.0;
		var duration = 500;
		if (_self._animation !== undefined)
		{
			from = _self._animation.now;
			duration = (new Date).getTime() - _self._animator.startTime;
			_self._animator.stop();
		}
		
		_self._labelshown = true;
		
		var animator = new AppleAnimator(duration, 13);
		animator.oncomplete = _self._animationComplete;
		_self._animator = animator;
		
		_self._animation = new AppleAnimation(from, 1.0, _self._updateOpacity);
		animator.addAnimation(_self._animation);
		animator.start();
	}
	
	this._targetNodeOutDelay = function(event)
	{
		if (_self._outdelay === undefined)
		{
			_self._outdelay = setTimeout(_self._targetNodeOut, 0, _self);
		}
	}
	
	this._targetNodeOut = function(_self)
	{
		if (_self._outdelay !== undefined)
		{
			clearTimeout(_self._outdelay);
			delete _self._outdelay;
		}
		if (!_self._labelshown)
			return;
		
		var from = 1.0;
		var duration = 500;
		if (_self._animation !== undefined)
		{
			from = _self._animation.now;
			duration = (new Date).getTime() - _self._animator.startTime;
			_self._animator.stop();
		}
		
		var animator = new AppleAnimator(duration, 13);
		animator.oncomplete = _self._animationComplete;
		_self._animator = animator;
		
		_self._animation = new AppleAnimation(from, 0.0, _self._updateOpacity);
		animator.addAnimation(_self._animation);
		animator.start();
	
		_self._labelshown = false;
	}
	
	this._labelOver = function(event)
	{
		_self._tempMouseOver = true; // remove later
//		_self._flipCircle.style.visibility = "visible";
	}
	
	this._labelOut = function(event)
	{
		delete _self._tempMouseOver; // remove later
//		_self._flipCircle.style.visibility = "hidden";
	}
	
	this._labelClicked = function(event)
	{		
//		_self._flipCircle.style.visibility = "hidden";
		
		try {
			if (_self.onclick != null)
				_self.onclick(event);
		} catch(ex) {
			throw ex;
		} finally {
			event.stopPropagation();
    	    event.preventDefault();
    	}
	}
	
	this._tempLabelDown = function(event)
	{
		document.addEventListener("mouseup", _self._tempDocUp, true);
		event.stopPropagation();
		event.preventDefault();
	}
	
	this._tempDocUp = function(event)
	{
		document.removeEventListener("mouseup", _self._tempDocUp, true);
		
		// if we're over the label
		if (_self._tempMouseOver !== undefined)
		{
			delete _self._tempMouseOver;
			_self._labelClicked(event);
		}
	}
		
	if(this._targetNode != null) {
		this._targetNode.addEventListener("mousemove", this._targetNodeMove, true);
		this._targetNode.addEventListener("mouseout", this._targetNodeOutDelay, true);
	}

// temp stuff
	this._node.addEventListener("mousedown", this._tempLabelDown, true);
	this._node.setAttribute("onclick", "event.stopPropagation(); event.preventDefault();");
// switch to this later
//	this._node.addEventListener("click", this._labelClicked, true);
	this._node.addEventListener("mouseover", this._labelOver, true);
	this._node.addEventListener("mouseout", this._labelOut, true);
}

FadeInOutNode.prototype.remove = function()
{
	this._targetNode.removeEventListener("mousemove", this._targetNodeMove, true);
	this._targetNode.removeEventListener("mouseout", this._targetNodeOutDelay, true);

	this._node.removeEventListener("mousedown", this._tempLabelDown, true);
//	this._node.removeEventListener("click", this._labelClicked, true);
	this._node.removeEventListener("mouseover", this._labelOver, true);
	this._node.removeEventListener("mouseout", this._labelOut, true);
}


FadeInOutNode.prototype.setCircleOpacity = function(opacity)
{
//	this._flipCircle.style.opacity = opacity;
}
