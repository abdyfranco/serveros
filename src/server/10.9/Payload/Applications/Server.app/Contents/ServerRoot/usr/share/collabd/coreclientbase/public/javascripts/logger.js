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

CC.Logger = CC.Logger || new Object();

CC.Logger.LOG_LEVEL_DEBUG = 'debug';
CC.Logger.LOG_LEVEL_INFO = 'info';
CC.Logger.LOG_LEVEL_WARN = 'warn';
CC.Logger.LOG_LEVEL_ERROR = 'error';
CC.Logger.LOG_LEVEL_NONE = 'none';
CC.Logger.LOG_ORDERING = [CC.Logger.LOG_LEVEL_NONE, CC.Logger.LOG_LEVEL_ERROR, CC.Logger.LOG_LEVEL_WARN, CC.Logger.LOG_LEVEL_INFO, CC.Logger.LOG_LEVEL_DEBUG];

CC.Logger.GlobalLoggerSharedInstance = Class.createWithSharedInstance('logger');
CC.Logger.GlobalLoggerSharedInstance.prototype = {
	mLogLevel: CC.Logger.LOG_LEVEL_INFO,
	initialize: function(/* [options] */) {
		if (arguments.length && arguments[0]) Object.extend(this, arguments[0]);
		// Use some bind magic for IE since console properties aren't true functions.
		if (document.all && /MSIE/.test(navigator.userAgent)) {
			if (!window.console) this.mLogLevel = CC.Logger.LOG_LEVEL_NONE;
			if (this.mLogLevel != CC.Logger.LOG_LEVEL_NONE && Function.prototype.bind && console && typeof console.log == "object") {
				$A(['log', 'info', 'warn', 'error']).each(function (method) {
					console[method] = this.bind(console[method], console);
			    }, Function.prototype.call);
			}
		}
		this.setLogLevel(this.mLogLevel);
	},
	setLogLevel: function(inLogLevel) {
		if (!inLogLevel) return false;
		if (!this._ensureLogging()) return;
		this.mLogLevel = CC.Logger.LOG_LEVEL_INFO;
		this.info("Logger initialized (log level: %o)", inLogLevel);
		this.mLogLevel = inLogLevel;
	},
	debug: function(inLogMessage /*, [args] */) {
		if (!this._ensureLogging()) return;
		if (!this._ensureLogLevel(CC.Logger.LOG_LEVEL_DEBUG)) return;
		console.log.apply(console, arguments);
	},
	info: function(inLogMessage /*, [args] */) {
		if (!this._ensureLogging()) return;
		if (!this._ensureLogLevel(CC.Logger.LOG_LEVEL_INFO)) return;
		console.info.apply(console, arguments);
	},
	warn: function(inLogMessage /*, [args] */) {
		if (!this._ensureLogging()) return;
		if (!this._ensureLogLevel(CC.Logger.LOG_LEVEL_WARN)) return;
		console.warn.apply(console, arguments);
	},
	error: function(inLogMessage /*, [args] */) {
		if (!this._ensureLogging()) return;
		if (!this._ensureLogLevel(CC.Logger.LOG_LEVEL_ERROR)) return;
		console.error.apply(console, arguments);
	},
	_ensureLogging: function() {
		return (this.mLogLevel != CC.Logger.LOG_LEVEL_NONE && console && console.log && console.info && console.warn && console.error);
	},
	_ensureLogLevel: function(inLogLevel) {
		var index = CC.Logger.LOG_ORDERING.indexOf(inLogLevel)
		if (index == -1) return false;
		return (index <= CC.Logger.LOG_ORDERING.indexOf(this.mLogLevel))
	}
};
