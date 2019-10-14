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

// Add inline notification support to functions as properties on an object.
// Signals this function as a responder to notifications with a given signature.
// By default, notifications are restricted to a CC.Object instance only. Passing
// inOptAnyInstance as true will register this observer for all notification
// broadcasts for a given signature, regardless of scope.

Function.prototype.observes = function(inNotificationSignature, inOptAnyInstance) {
	if (!inNotificationSignature || !globalNotificationCenter()) return this;
	if (!this._observers) this._observers = [];
	this._observers.push([inNotificationSignature, inOptAnyInstance]);
	return this;
};

// Base object class. Identical to the Prototype implementation of a class
// hierarchy, adding support for object/class type introspection (isClass and
// isObject). Also adds support for inline notification registration to any
// CC.Object property that is a function.

CC.Object = Class.create({
	isObject: true,
	initialize: function(/* [inOptAttributes] */) {
		if (arguments.length > 0 && arguments[0]) Object.extend(this, arguments[0]);
		// Initialize any notification observers for this class.
		for (key in this) {
			var value = this[key];
			if (value && (CC.typeOf(value) == CC.T_FUNCTION)) {
				if (value._observers) {
					var observers = value._observers, observerIdx, observer;
					for (observerIdx = 0; observerIdx < observers.length; observerIdx++) {
						observer = observers[observerIdx];
						globalNotificationCenter().subscribe(observer[0], value.bind(this), (observer[1] == true ? undefined : this));
					}
				}
			}
		}
	},
	kindOf: function(klass) {
		return this.constructor.kindOf(klass);
	}
});

var ClassProtocol = {
	isClass: true,
	kindOf: function(klass) {
		if (this == klass || this.constructor == klass || klass.subclasses.include(this)) return true;
		if (klass.subclasses.length == 0) return false;
		return klass.subclasses.any(function(k) {
			return this.kindOf(k);
		}, this);
	}
};

Object.extend(CC.Object, ClassProtocol);

// Wraps the prototype-default Class.create to support our ClassProtocol
// on the class instance it returns.

CC.Object._create = Class.create;
Class.create = function() {
	var klass = CC.Object._create.apply(this, arguments);
	Object.extend(klass, ClassProtocol);
	return klass;
};

// Global type constants.

Object.extend(CC, {
	T_ERROR: 'error', T_OBJECT: 'object', T_NULL: 'null', T_CLASS: 'class', T_HASH: 'hash', T_FUNCTION: 'function',
	T_UNDEFINED: 'undefined', T_NUMBER: 'number', T_BOOL: 'boolean', T_ARRAY: 'array', T_STRING: 'string',
	T_DATE: 'date', T_REGEXP: 'regexp'
});

// Returns the type of a supplied item as a type constant. Returns undefined
// where the supplied item is also undefined. Supports both CC.Object instances
// and prototype-style Class instances.

CC.typeOf = function(item) {
	if (item === undefined) return CC.T_UNDEFINED;
	if (item === null) return CC.T_NULL;
	var ret = typeof(item);
	if (ret == 'object') {
		if (item instanceof Array) {
			ret = CC.T_ARRAY;
		} else if (item instanceof Function) {
			ret = (item.isClass || item.addMethods) ? CC.T_CLASS : CC.T_FUNCTION;
		} else if (item instanceof Date) {
			ret = (item.isClass || item.addMethods) ? CC.T_CLASS : CC.T_DATE;
		} else if (item instanceof RegExp) {
			ret = (item.isClass || item.addMethods) ? CC.T_CLASS : CC.T_REGEXP;
		} else if (item.isObject || item.addMethods === undefined) {
			return CC.T_OBJECT;
		} else ret = CC.T_HASH;
	} else if (ret === CC.T_FUNCTION) {
		ret = (item.isClass || item.addMethods) ? CC.T_CLASS : CC.T_FUNCTION;
	}
	return ret;
};

// Utility method which returns true if an object is an instance of a supplied class
// or one of its subclasses, and false otherwise.

CC.kindOf = function(object, klass) {
	if (object && !object.isClass) object = object.constructor;
	return !!(object && object.kindOf && object.kindOf(klass));
};

// Traverses a property path returning an object instance where it exists.

CC.objectForPropertyPath = function(path, root, stopAt) {
	var loc, nextDotAt, key, max;
	if (!root) root = window;
	if (CC.typeOf(path) === CC.T_STRING) {
		if (stopAt === undefined) stopAt = path.length;
		loc = 0;
		while((root) && (loc < stopAt)) {
			nextDotAt = path.indexOf('.', loc) ;
			if ((nextDotAt < 0) || (nextDotAt > stopAt)) nextDotAt = stopAt;
			key = path.slice(loc, nextDotAt);
			root = root[key];
			loc = nextDotAt + 1;
		}
		if (loc < stopAt) root = undefined;
	}
	return root;
};

// Given a property path, returns a materialized object where the object at that
// path is a constructor, otherwise returns the object itself.

CC.objectInstanceForPropertyPath = function(path) {
	var obj = ((CC.typeOf(path) == CC.T_STRING) ? CC.objectForPropertyPath(path) : path);
	if (obj == undefined) return obj;
	return (CC.typeOf(obj) == CC.T_OBJECT) ? obj : new obj();
};

// Deep clones an object.

CC.deepClone = function(inObject) {
	if (CC.typeOf(inObject) != CC.T_OBJECT) return inObject;
	if (inObject == null) return inObject;
	var newObject = new Object();
	for (var key in inObject) newObject[key] = CC.deepClone(inObject[key]);
	return newObject;
};
